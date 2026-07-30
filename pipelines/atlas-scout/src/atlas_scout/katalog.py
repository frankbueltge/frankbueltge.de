"""Vom Saatkorn zum Katalogeintrag — Metadaten auflösen, Begründung mitführen.

Das Saatgut (`praxen.py`) weiß nur, WELCHE Kennung eine Praxis zitiert hat und wann.
Hier wird daraus ein Eintrag mit Titel, Urhebern, Jahr und Zugang — aufgelöst, nicht
geraten. Löst sich eine Kennung nicht auf, wird sie vermerkt und fällt raus; ein
Katalogeintrag ohne bestätigte Quelle wäre genau die Sorte Behauptung, deretwegen der
Vorgänger zurückgebaut wurde.

Zwei Quellen, beide schlüsselfrei — **je nach Art der Kennung eine andere Autorität:**
  - **DOIs** löst OpenAlex auf (Konzepte, Zitationszahl, OA-Ort obendrein).
  - **arXiv-Kennungen** löst arXiv selbst auf, NICHT OpenAlex über die arXiv-DOI.
    Beobachtet am 2026-07-27 an 2305.17493 („The Curse of Recursion"): OpenAlex führt
    unter `10.48550/arxiv.2305.17493` einen völlig fremden Datensatz. Wer dort zuerst
    fragt, bekommt still ein falsches Paper mit korrekt aussehender Kennung.

Die Begründung (`relevance`) wird NICHT erfunden. Sie hat zwei mögliche Herkünfte:
  1. Eine Praxis hat sie selbst geschrieben (Ulysses' `atlas/atlas.json` führt für 98
     Einträge ein `relevance`-Feld). Dann wird sie **wörtlich übernommen**.
  2. Sonst steht dort der Gebrauchsbeleg: wer den Eintrag zitiert und wann zuletzt.
     Das sagt, DASS er zählt, nicht WARUM — und ist als solches markiert
     (`verify_status: "toVerify"`), bis die Urteilsroutine den Satz schreibt.

Kein Modell-API-Aufruf: Der Katalogbau ist deterministisch. Urteilsschritte laufen
getrennt als Claude-Code-Routine unter dem Abo (Bauregel des Startauftrags).
"""
from __future__ import annotations

import json
import re
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass, replace
from pathlib import Path

import httpx

from .atlas import normiere_titel, slugifiziere
from .praxen import Saat, Saatkorn
from .themen import THEMEN
from .verify import pruefe

OPENALEX = "https://api.openalex.org/works"
ARXIV = "http://export.arxiv.org/api/query"
ZEITLIMIT = httpx.Timeout(20.0, connect=10.0)
KOPF = {"User-Agent": "atlas-scout/0.1 (mailto:f.bueltge@gmail.com)"}

# Drossel je Quelle. OpenAlex' polite pool verträgt mehr, arXiv bittet ausdrücklich um
# drei Sekunden zwischen Anfragen — wir halten uns daran, auch wenn es den Lauf dehnt.
PAUSE_OPENALEX = 0.15
PAUSE_ARXIV = 3.0


class QuellenAusfall(RuntimeError):
    """Quelle nicht erreichbar oder unbrauchbare Antwort."""


# Die zwei Wege, auf denen ein Katalog wächst (Frank, 2026-07-28). Jeder Eintrag trägt
# seinen Weg, seine Fundstelle und seinen Aufnahmegrund — sonst ist er nicht aufnahmefähig.
WEG_PRAXIS = "praxis"  # eine Praxis benutzt oder führt den Text
WEG_SCOUT = "scout"  # der Scout hat ihn in der Nachbarschaft gefunden

# Aufnahmegründe. Sie beantworten „warum steht das hier?" — nicht „warum zählt es?"
# (das ist `relevanz`). Der Unterschied ist wichtig: Der Grund ist eine Regel, die
# angewandt wurde, die Relevanz ist ein Urteil über den Inhalt.
GRUND_ZITIERT = "zitiert"  # im Fließtext einer Praxis zitiert, Fundstelle nachgewiesen
GRUND_KURATIERT = "kuratiert"  # in der eigenen Leseliste einer Praxis geführt
GRUND_NACHBARSCHAFT = "nachbarschaft"  # Zitationsumfeld eines Katalogeintrags


@dataclass(frozen=True)
class Katalogeintrag:
    id: str
    titel: str
    urheber: tuple[str, ...]
    jahr: int | None
    ort: str  # Zeitschrift, Verlag, Repositorium — wörtlich aus der Quelle
    kennung: str  # DOI, "arXiv:<id>" oder — wenn die Quelle keine führt — die URL
    url: str
    frei_zugaenglich: bool
    felder: tuple[int, ...]
    zusammenfassung: str

    # ── Warum der Eintrag ZÄHLT (Urteil über den Inhalt) ──────────────────────────
    relevanz: str
    # "praxis"   — von einer Praxis geschrieben, wörtlich übernommen
    # "gebrauch" — nur der Beleg, WER wann zitiert hat; sagt DASS, nicht WARUM
    # "urteil"   — von der Urteilsroutine geschrieben (Modell benannt in `urteil`)
    relevanz_herkunft: str
    # Nachweis des Urteilsschritts. Gesetzt NUR bei relevanz_herkunft == "urteil":
    # welches Modell, wann, auf welcher Grundlage. Ohne diesen Block wäre ein
    # maschinell geschriebener Satz von einem der Praxis nicht zu unterscheiden — und
    # genau das darf nicht passieren (Kanon: KI-Schritte offenlegen und markieren).

    # ── Woher er KOMMT und warum er AUFGENOMMEN wurde (Regel, nicht Urteil) ───────
    weg: str  # WEG_PRAXIS | WEG_SCOUT
    aufnahmegrund: str  # GRUND_*
    # Wo genau: „ulysses/journal/2026-07-01.md" bzw. „Nachbarschaft von 10.1038/…".
    # Ohne mindestens eine Fundstelle ist ein Eintrag nicht belegt.
    fundstellen: tuple[str, ...]

    # ── Prüfung des Zugriffswegs ──────────────────────────────────────────────────
    # Bestätigt sind nur 200/203/206. HTTP 202 ist KEINE Bestätigung (die
    # figshare-Familie antwortet automatisierten Anfragen so — Design-Notiz §9.5).
    geprueft: bool
    pruef_status: int | None
    pruef_vermerk: str | None

    zitiert_von: tuple[str, ...]
    zuletzt_gebraucht: str | None
    verify_status: str
    # Weitere Kennungen desselben Textes — vor allem die Preprint-Fassung neben der
    # veröffentlichten. Sie verschwinden beim Zusammenführen nicht, sondern bleiben
    # nachweisbar: Wer über die arXiv-Kennung sucht, soll den Eintrag finden.
    weitere_kennungen: tuple[str, ...] = ()
    # Nachweis des Urteilsschritts. Gesetzt NUR bei relevanz_herkunft == "urteil":
    # welches Modell, wann, auf welcher Grundlage. Ohne diesen Block wäre ein maschinell
    # geschriebener Satz von einem der Praxis nicht zu unterscheiden — und genau das
    # darf nicht passieren (Kanon: KI-Schritte offenlegen und als solche markieren).
    urteil: dict | None = None


@dataclass(frozen=True)
class Ausfall:
    kennung: str
    art: str
    vermerk: str


def _hole(client: httpx.Client, url: str, params: dict) -> dict:
    try:
        antwort = client.get(url, params=params, timeout=ZEITLIMIT)
    except httpx.HTTPError as fehler:
        # Keine URL in die Meldung — Vermerke landen im öffentlichen Archiv.
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")
    return antwort.json()


def _felder_aus_begriffen(*texte: str) -> tuple[int, ...]:
    """Vorläufiger Feldhinweis 1–13 aus Titel, Zusammenfassung und Begriffen.

    **Das ist ein Hinweis zum Blättern, kein Urteil.** Ein Stichwortabgleich kann Rolle
    und Gegenstand nicht unterscheiden — genau daran scheiterte das alte Relevanzkriterium
    des Registers (Design-Notiz §3). Was hier zugeordnet wird, steht deshalb unter
    demselben Vorbehalt wie die Begründung: Der Eintrag trägt `verify_status: toVerify`,
    bis jemand ihn gelesen hat, und die Urteilsroutine darf die Felder überschreiben.

    Zwei Messungen vom 2026-07-27 haben die Form festgelegt:

    1. Gegen die OpenAlex-`concepts` ALLEIN traf nichts — die sind zu allgemein
       („Computer science"), die Felder der Karte zu spezifisch („model collapse").
       Das Signal steckt in Titel und Abstract.
    2. Ohne Wortgrenzen ordnete der Abgleich 79 von 123 Einträgen ein, aber teils über
       Wortteile: „care" in „scarce", „scale" in „escalate". Mit Wortgrenzen sind es 58 —
       weniger, aber jeder Treffer ist ein echtes Wort. Nur mehrwortige Begriffe zu
       nehmen wäre mit 13 von 123 zu dünn gewesen und hätte echtes Signal verloren.

    Trifft nichts, bleibt die Liste leer — ein ehrliches „noch nicht eingeordnet".
    """
    zusammen = " ".join(t for t in texte if t).lower()
    return tuple(
        nummer
        for nummer, thema in THEMEN.items()
        if any(
            re.search(rf"(?<!\w){re.escape(wort.lower())}(?!\w)", zusammen)
            for wort in thema.schlagworte
        )
    )


def _abstract(werk: dict) -> str:
    """Baut den Abstract aus OpenAlex' `abstract_inverted_index` zusammen.

    OpenAlex speichert Abstracts invertiert (`{"wort": [Positionen]}`) — aus
    lizenzrechtlichen Gründen, weil der invertierte Index kein zusammenhängender Text
    ist. Zurückgebaut ergibt er den Originalwortlaut; er wird hier NICHT umformuliert,
    nur wieder in Reihenfolge gebracht.

    Warum das nachgezogen wurde: Ohne Abstract hatten 58 der 109 unbeurteilten Einträge
    nur einen Titel als Grundlage. Über einen Titel lässt sich nicht redlich urteilen,
    ob ein Text für eine Forschung zählt — die Urteilsroutine hätte raten müssen.
    """
    index = werk.get("abstract_inverted_index")
    if not isinstance(index, dict) or not index:
        return ""
    stellen: dict[int, str] = {}
    for wort, positionen in index.items():
        if not isinstance(positionen, list):
            continue
        for pos in positionen:
            if isinstance(pos, int):
                stellen[pos] = wort
    if not stellen:
        return ""
    return " ".join(stellen[i] for i in sorted(stellen))


# OpenAlex gibt Titel teils mit Auszeichnung heraus („A classifier for spurious
# astrometric solutions in <i>Gaia</i> eDR3"). Die Marken sind kein Teil des Titels — und
# sie verhindern die Zusammenführung: Beobachtet am 2026-07-28 standen die Zeitschriften-
# und die arXiv-Fassung desselben Gaia-Papers doppelt im Katalog, weil die
# Titelnormalisierung „i gaia i edr3" gegen „gaia edr3" hielt.
MUSTER_MARKUP = re.compile(r"<[^>]+>")


def _aus_openalex(werk: dict) -> dict | None:
    titel = MUSTER_MARKUP.sub("", werk.get("title") or "").strip()
    if not titel:
        return None
    doi = (werk.get("doi") or "").replace("https://doi.org/", "") or None
    ort = (werk.get("best_oa_location") or {}).get("landing_page_url")
    quelle = (werk.get("primary_location") or {}).get("source") or {}
    begriffe = [(c.get("display_name") or "") for c in (werk.get("concepts") or [])[:12]]
    return {
        "titel": titel,
        "urheber": [
            (a.get("author") or {}).get("display_name", "")
            for a in (werk.get("authorships") or [])[:8]
        ],
        "jahr": werk.get("publication_year"),
        "ort": (quelle.get("display_name") or "").strip(),
        "url": ort or (f"https://doi.org/{doi}" if doi else werk.get("id") or ""),
        "frei_zugaenglich": bool(ort),
        "begriffe": begriffe,
        "zusammenfassung": _abstract(werk),
        # Die maßgebliche DOI kommt aus der Quelle, nicht aus dem Fundort: Im Repo steht
        # sie oft als Teil einer Verlags-URL und trägt dann Pfad mit
        # (`10.1162/octo.a.545/137249/latent-spaces-ai-art-und-…`). Was hier steht, ist
        # die Kennung, unter der die Quelle den Text selbst führt.
        "doi": doi,
    }


def _aus_arxiv(xml_text: str) -> dict | None:
    """Liest den Atom-Eintrag der arXiv-API. Fällt der Eintrag weg, ist es kein Treffer."""
    raum = {"a": "http://www.w3.org/2005/Atom"}
    try:
        baum = ET.fromstring(xml_text)
    except ET.ParseError as fehler:
        raise QuellenAusfall(f"arXiv-Antwort unlesbar: {fehler.msg}") from fehler
    eintrag = baum.find("a:entry", raum)
    if eintrag is None:
        return None
    titel = (eintrag.findtext("a:title", "", raum) or "").strip()
    if not titel:
        return None
    zusammenfassung = " ".join((eintrag.findtext("a:summary", "", raum) or "").split())
    veroeffentlicht = eintrag.findtext("a:published", "", raum) or ""
    return {
        "titel": " ".join(titel.split()),
        "urheber": [
            (a.findtext("a:name", "", raum) or "").strip()
            for a in eintrag.findall("a:author", raum)[:8]
        ],
        "jahr": int(veroeffentlicht[:4]) if veroeffentlicht[:4].isdigit() else None,
        "ort": "arXiv",
        "url": (eintrag.findtext("a:id", "", raum) or "").strip(),
        "frei_zugaenglich": True,
        # arXiv nennt keine Konzepte — die Kategorien sind der beste verfügbare Ersatz.
        "begriffe": [
            k.get("term", "") for k in eintrag.findall("{http://arxiv.org/schemas/atom}category")
        ],
        "zusammenfassung": zusammenfassung,
        "doi": None,
    }


def _doi_leiter(kennung: str) -> list[str]:
    """Die zu probierenden DOI-Fassungen, von der längsten zur kürzesten.

    Warum keine Abschneide-Regel: Gemessen am 2026-07-27 tragen 14 der 71 gefundenen
    DOIs mehr als einen Schrägstrich — und die Mehrzahl davon ZU RECHT
    (`10.7551/mitpress/11810.001.0001`, `10.1093/mnras/stab3588`,
    `10.3847/1538-3881/aacb21`). Nur bei Duke UP und MIT Press hängt der URL-Pfad an
    (`10.1215/2834703x-11700255/401267/rethinking-error-…`). Ein Abschneiden nach dem
    ersten Schrägstrich würde die echten zerstören, um die falschen zu retten.

    Also entscheidet die Auflösung, nicht eine geratene Regel: Erst die volle Kennung,
    dann je ein Pfadsegment weniger — bis zum Präfix plus einem Segment, kürzer wird
    keine DOI. Bounded, deterministisch, und im Zweifel gewinnt der Nachweis.
    """
    teile = kennung.split("/")
    return ["/".join(teile[: i + 1]) for i in range(len(teile) - 1, 0, -1)]


def _loese_auf(client: httpx.Client, korn: Saatkorn) -> dict | None:
    """Löst ein Saatkorn zu Metadaten auf. None = nicht gefunden (kein Ausfall)."""
    if korn.art == "doi":
        for fassung in _doi_leiter(korn.kennung):
            daten = _hole(client, OPENALEX, {"filter": f"doi:{fassung}", "per-page": 1})
            time.sleep(PAUSE_OPENALEX)
            treffer = (daten.get("results") or [None])[0]
            if treffer:
                return _aus_openalex(treffer)
        return None

    # arXiv-Kennungen: **arXiv ist die Autorität, nicht OpenAlex.** Beobachtet am
    # 2026-07-27 an 2305.17493 („The Curse of Recursion"): OpenAlex führt unter der
    # arXiv-DOI 10.48550/arxiv.2305.17493 einen völlig fremden Datensatz („Dynamic /
    # ME-JEPA v2.0.0-rc1 …"). Wer hier OpenAlex zuerst fragt, bekommt still ein falsches
    # Paper in den Katalog — mit korrekt aussehender Kennung.
    try:
        antwort = client.get(
            ARXIV, params={"id_list": korn.kennung, "max_results": 1}, timeout=ZEITLIMIT
        )
    except httpx.HTTPError as fehler:
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    time.sleep(PAUSE_ARXIV)
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")
    return _aus_arxiv(antwort.text)


def lade_praxis_begruendungen(wurzel: Path) -> dict[str, str]:
    """Die Begründungen, die eine Praxis selbst geschrieben hat.

    Ulysses' Theorie-Atlas führt je Eintrag ein `relevance`-Feld — ein Satz, der sagt,
    warum der Eintrag für die Praxis zählt. Er wird wörtlich übernommen, nie umformuliert.
    Schlüssel ist die normalisierte DOI bzw. arXiv-Kennung.
    """
    pfad = wurzel / "src/data/atelier/atlas.json"
    if not pfad.is_file():
        return {}
    begruendungen: dict[str, str] = {}
    for eintrag in json.loads(pfad.read_text(encoding="utf-8")):
        satz = (eintrag.get("relevance") or "").strip()
        if not satz:
            continue
        url = eintrag.get("url") or ""
        for treffer in re.findall(r"10\.\d{4,9}/[^\s\"'\\,\]}<>)]+", url):
            begruendungen[treffer.rstrip(".,;:)").lower()] = satz
        for treffer in re.findall(r"arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5})", url, re.I):
            begruendungen[treffer.lower()] = satz
    return begruendungen


def _gebrauchsbeleg(korn: Saatkorn) -> str:
    """Der Satz, der DASS sagt, solange niemand das WARUM geschrieben hat.

    Bewusst nüchtern und nachprüfbar: Er behauptet keine inhaltliche Relevanz, sondern
    nennt den Gebrauch, den es tatsächlich gab.
    """
    namen = {"atelier": "the atelier", "field": "the field", "studio": "the studio",
             "meridian": "the field's Meridian runtime"}
    wer = [namen.get(p, p) for p in korn.praxen]
    if len(wer) == 1:
        liste = wer[0]
    else:
        liste = ", ".join(wer[:-1]) + f" and {wer[-1]}"
    wann = f" — most recently on {korn.juengste_nennung}" if korn.juengste_nennung else ""
    return f"Cited by {liste} in their own research{wann}."


def baue(
    saat: Saat, wurzel: Path, *, grenze: int | None = None
) -> tuple[list[Katalogeintrag], list[Ausfall]]:
    """Löst das Saatgut auf und gibt Katalogeinträge samt Ausfallliste zurück."""
    begruendungen = lade_praxis_begruendungen(wurzel)
    eintraege: list[Katalogeintrag] = []
    ausfaelle: list[Ausfall] = []
    koerner = saat.koerner[:grenze] if grenze else saat.koerner

    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for korn in koerner:
            try:
                gefunden = _loese_auf(client, korn)
            except QuellenAusfall as fehler:
                ausfaelle.append(Ausfall(korn.kennung, korn.art, str(fehler)))
                continue
            if not gefunden:
                ausfaelle.append(Ausfall(korn.kennung, korn.art, "in keiner Quelle gefunden"))
                continue

            eigener_satz = begruendungen.get(korn.kennung)
            # Kennung aus der Quelle, sonst die des Saatkorns (arXiv führt keine DOI).
            kennung = gefunden.get("doi") or (
                korn.kennung if korn.art == "doi" else f"arXiv:{korn.kennung}"
            )
            # Zugriffsweg prüfen, bevor der Eintrag entsteht. Bis 2026-07-28 fehlte das
            # hier — der Katalog übernahm die Adresse, die OpenAlex nannte, ohne je
            # anzufragen, ob sie trägt. „Identifier prüfen heißt: HTTP-Antwort geholt"
            # (Bauregel des Startauftrags), und das galt für den Katalog nicht.
            befund = pruefe(gefunden["url"], client) if gefunden["url"] else None
            eintraege.append(Katalogeintrag(
                id=slugifiziere(
                    (gefunden["urheber"] or ["unbekannt"])[0], gefunden["titel"]
                ) or slugifiziere(korn.kennung),
                titel=gefunden["titel"],
                urheber=tuple(u for u in gefunden["urheber"] if u),
                jahr=gefunden["jahr"],
                ort=gefunden["ort"],
                kennung=kennung,
                url=gefunden["url"],
                frei_zugaenglich=gefunden["frei_zugaenglich"],
                felder=_felder_aus_begriffen(
                    gefunden["titel"], gefunden["zusammenfassung"], *gefunden["begriffe"]
                ),
                zusammenfassung=gefunden["zusammenfassung"],
                relevanz=eigener_satz or _gebrauchsbeleg(korn),
                relevanz_herkunft="praxis" if eigener_satz else "gebrauch",
                weg=WEG_PRAXIS,
                aufnahmegrund=GRUND_ZITIERT,
                # Die Fundstellen aus dem Saatkorn: Repo und Datei, in denen zitiert
                # wurde. Sie sind der Beleg — ohne sie wäre „zitiert" eine Behauptung.
                fundstellen=tuple(
                    dict.fromkeys(f"{f.repo}/{f.datei}" for f in korn.fundstellen)
                ),
                geprueft=bool(befund and befund.aufgeloest),
                pruef_status=befund.status if befund else None,
                pruef_vermerk=befund.vermerk if befund else "keine Adresse zu prüfen",
                zitiert_von=korn.praxen,
                zuletzt_gebraucht=korn.juengste_nennung,
                # Wörtlich von einer Praxis begründet = gelesen. Sonst wartet der
                # Eintrag auf die Urteilsroutine und zeigt sich auf der Fläche mit „?".
                verify_status="verified" if eigener_satz else "toVerify",
            ))

    return eintraege, ausfaelle


def _erster_nachname(urheber: tuple[str, ...]) -> str:
    """Nachname des Erstautors, normalisiert — die Sicherung gegen Titel-Kollisionen."""
    if not urheber:
        return ""
    return normiere_titel(urheber[0].split()[-1]) if urheber[0].split() else ""


def fuehre_zusammen(eintraege: list[Katalogeintrag]) -> list[Katalogeintrag]:
    """Führt Einträge zusammen, die denselben Text meinen.

    Gemessen am 2026-07-27: von 124 aufgelösten Einträgen waren 117 eindeutig — sieben
    Dubletten aus zwei verschiedenen Ursachen, beide echt:

    1. **Dieselbe DOI über mehrere Saatkorn-Varianten.** Im Repo steht eine DOI mal
       nackt, mal als Teil einer Verlags-URL mit Pfad. Die Auflösungsleiter bringt alle
       auf dieselbe kanonische Kennung — danach stehen sie mehrfach da.
    2. **Preprint und Veröffentlichung.** `arXiv:2406.07016` und `10.1126/sciadv.adt3813`
       sind ein Text. Getrennt geführt behauptet der Katalog zwei Quellen, wo eine ist.

    Zusammengeführt wird über die Kennung (exakt, sicher) und über Titel PLUS Nachname
    des Erstautors — der Titel allein wäre zu grob: `_autor_passt` in openalex.py
    dokumentiert einen Fall, in dem „Experimental Systems" ein fremdes Paper traf.

    Was beim Zusammenführen gilt:
      - `zitiert_von` wird VEREINIGT — ein Text, den mehrere Praxen brauchen, ist ein
        stärkerer Eintrag, und das darf die Zusammenführung nicht verschlucken.
      - Das jüngste `zuletzt_gebraucht` gewinnt.
      - Die Rangfolge des Anführers ist: **geschriebene Begründung vor DOI vor
        Vollständigkeit.** Eine von einer Praxis geschriebene Begründung wiegt also
        schwerer als die zitierfähigere Kennung — steht sie am arXiv-Eintrag, führt der,
        und die DOI wandert nach `weitere_kennungen`. Das ist Absicht: Der Satz, der sagt
        WARUM ein Text zählt, ist das Seltenere und Wertvollere; eine Kennung, die
        daneben steht, ist kein Verlust.
      - Was nicht führt, verschwindet trotzdem nicht: alle Kennungen bleiben am Eintrag.
    """
    gruppen: dict[str, list[Katalogeintrag]] = {}
    schluessel_von: dict[str, str] = {}

    for eintrag in eintraege:
        kennung = eintrag.kennung.lower()
        titel_schluessel = f"t:{normiere_titel(eintrag.titel)}|{_erster_nachname(eintrag.urheber)}"
        # Beide Wege können auf eine bestehende Gruppe zeigen; die zuerst gefundene gewinnt.
        schluessel = schluessel_von.get(f"k:{kennung}") or schluessel_von.get(titel_schluessel)
        if schluessel is None:
            schluessel = titel_schluessel
        gruppen.setdefault(schluessel, []).append(eintrag)
        schluessel_von[f"k:{kennung}"] = schluessel
        schluessel_von[titel_schluessel] = schluessel

    zusammengefuehrt: list[Katalogeintrag] = []
    for mitglieder in gruppen.values():
        if len(mitglieder) == 1:
            zusammengefuehrt.append(mitglieder[0])
            continue

        # Der Anführer: erst eine geschriebene Begründung, dann eine DOI statt arXiv,
        # dann der vollständigste Datensatz.
        anfuehrer = sorted(
            mitglieder,
            key=lambda e: (
                e.relevanz_herkunft == "praxis",
                not e.kennung.lower().startswith("arxiv:"),
                len(e.zusammenfassung),
            ),
            reverse=True,
        )[0]

        praxen = sorted({p for e in mitglieder for p in e.zitiert_von})
        daten = [e.zuletzt_gebraucht for e in mitglieder if e.zuletzt_gebraucht]
        weitere = sorted(
            {e.kennung for e in mitglieder if e.kennung != anfuehrer.kennung}
            | set(anfuehrer.weitere_kennungen)
        )
        felder = sorted({f for e in mitglieder for f in e.felder})

        zusammengefuehrt.append(Katalogeintrag(
            id=anfuehrer.id,
            titel=anfuehrer.titel,
            urheber=anfuehrer.urheber,
            jahr=anfuehrer.jahr,
            ort=anfuehrer.ort,
            kennung=anfuehrer.kennung,
            url=anfuehrer.url,
            frei_zugaenglich=any(e.frei_zugaenglich for e in mitglieder),
            felder=tuple(felder),
            zusammenfassung=anfuehrer.zusammenfassung,
            relevanz=anfuehrer.relevanz,
            relevanz_herkunft=anfuehrer.relevanz_herkunft,
            weg=anfuehrer.weg,
            aufnahmegrund=anfuehrer.aufnahmegrund,
            # Alle Fundstellen aller Mitglieder — der Beleg wächst beim Zusammenführen,
            # er schrumpft nicht.
            fundstellen=tuple(dict.fromkeys(f for e in mitglieder for f in e.fundstellen)),
            geprueft=any(e.geprueft for e in mitglieder),
            pruef_status=next((e.pruef_status for e in mitglieder if e.geprueft),
                              anfuehrer.pruef_status),
            pruef_vermerk=anfuehrer.pruef_vermerk if not any(e.geprueft for e in mitglieder) else None,
            zitiert_von=tuple(praxen),
            zuletzt_gebraucht=max(daten) if daten else None,
            verify_status=anfuehrer.verify_status,
            weitere_kennungen=tuple(weitere),
        ))

    return zusammengefuehrt


def als_json(eintraege: list[Katalogeintrag]) -> str:
    """Der Katalog in der Form, die `src/lib/papers.ts` liest.

    Sortiert nach jüngstem Gebrauch: Was gerade in Arbeit ist, steht oben. Einträge ohne
    Datum fallen ans Ende, statt mit einem erfundenen Datum eingereiht zu werden.
    """
    geordnet = sorted(
        eintraege, key=lambda e: (e.zuletzt_gebraucht or "", e.jahr or 0), reverse=True
    )
    return json.dumps(
        [
            {
                "id": e.id,
                "titel": e.titel,
                "urheber": list(e.urheber),
                "jahr": e.jahr,
                "ort": e.ort,
                "kennung": e.kennung,
                "url": e.url,
                "frei_zugaenglich": e.frei_zugaenglich,
                "felder": list(e.felder),
                "zusammenfassung": e.zusammenfassung,
                "relevanz": e.relevanz,
                "relevanz_herkunft": e.relevanz_herkunft,
                # MUSS mitgeschrieben werden. Ohne diesen Block steht ein maschinell
                # geschriebener Satz unattribuiert zwischen den Sätzen der Praxen — und
                # das ist schlimmer, als das Urteil ganz zu verlieren. Beobachtet am
                # 2026-07-28: Der Neubau bewahrte die 27 Urteile korrekt, aber als_json()
                # ließ ihren Nachweis fallen, weil das Feld beim Erweitern des
                # Datenmodells hier nie ergänzt wurde.
                "urteil": e.urteil,
                "weg": e.weg,
                "aufnahmegrund": e.aufnahmegrund,
                "fundstellen": list(e.fundstellen),
                "geprueft": e.geprueft,
                "pruef_status": e.pruef_status,
                "pruef_vermerk": e.pruef_vermerk,
                "zitiert_von": list(e.zitiert_von),
                "zuletzt_gebraucht": e.zuletzt_gebraucht,
                "verify_status": e.verify_status,
                "weitere_kennungen": list(e.weitere_kennungen),
            }
            for e in geordnet
        ],
        indent=1,
        ensure_ascii=False,
    ) + "\n"


def bewahre_urteile(neu: list[Katalogeintrag], alt: list[dict]) -> list[Katalogeintrag]:
    """Trägt Urteile und Abnahmen aus dem bestehenden Katalog in den neuen Bau.

    **Warum das existieren muss.** `main()` baut den Katalog jede Nacht aus den Quellen
    neu und schrieb ihn bis 2026-07-28 ungelesen über die alte Datei. Damit hätte der
    Lauf um 05:30 UTC alle 27 geschriebenen Urteile gelöscht — Arbeit, die nicht aus einer
    Quelle folgt und darum durch keinen Abruf zurückkommt. Ein Katalog, der seine eigene
    Beurteilung nächtlich vergisst, kann nicht kuratiert werden; er kann nur sammeln.

    Die Rangfolge bleibt dieselbe wie bei der Zusammenführung:

      praxis  > urteil > gebrauch

    Hat eine Praxis seit dem letzten Lauf eine Begründung geschrieben, gewinnt sie gegen
    das Maschinenurteil — das ist der erwünschte Weg, und der neue Bau bringt sie mit.
    Ist der neue Eintrag dagegen nur ein Gebrauchsbeleg und stand vorher ein Urteil da,
    wird das Urteil samt Nachweis übernommen.

    `verify_status: "verified"` wird immer bewahrt: Das setzt nur ein Mensch oder eine
    Praxis, und ein Neubau kann es nicht erzeugen.
    """
    frueher = {e.get("id"): e for e in alt if e.get("id")}
    # Zweiter Schlüssel: Die id wird aus Autor und Titel abgeleitet und ändert sich, wenn
    # die Quelle ihre Angaben korrigiert. Die Kennung ist stabiler.
    nach_kennung = {
        (e.get("kennung") or "").lower(): e for e in alt if e.get("kennung")
    }

    bewahrt: list[Katalogeintrag] = []
    for eintrag in neu:
        vorher = frueher.get(eintrag.id) or nach_kennung.get(eintrag.kennung.lower())
        if not vorher:
            bewahrt.append(eintrag)
            continue

        aenderungen: dict = {}
        # Ein Urteil überlebt, solange keine Praxis inzwischen selbst geschrieben hat.
        if (
            vorher.get("relevanz_herkunft") == "urteil"
            and eintrag.relevanz_herkunft != "praxis"
        ):
            aenderungen["relevanz"] = vorher.get("relevanz", eintrag.relevanz)
            aenderungen["relevanz_herkunft"] = "urteil"
            aenderungen["urteil"] = vorher.get("urteil")
        # Eine Abnahme kann ein Neubau nicht erzeugen — sie wird nur übernommen.
        if vorher.get("verify_status") == "verified":
            aenderungen["verify_status"] = "verified"

        bewahrt.append(replace(eintrag, **aenderungen) if aenderungen else eintrag)

    return bewahrt


def main(argv: list[str] | None = None) -> int:
    import argparse

    from .praxen import sammle

    parser = argparse.ArgumentParser(
        description="Paper-Katalog aus dem, was die Praxen zitieren."
    )
    parser.add_argument(
        "--repos",
        type=Path,
        default=Path(".."),
        help="Verzeichnis, in dem die Praxis-Repos nebeneinander liegen",
    )
    parser.add_argument("--wurzel", type=Path, default=Path("."), help="Wurzel der Site")
    parser.add_argument("--grenze", type=int, default=None, help="nur N Saatkörner (Probe)")
    args = parser.parse_args(argv)

    # ── Weg 1a: kuratierte Sammlungen der Praxen, direkt übernommen ──────────────
    # Zuerst, weil sie das bestbegründete Material tragen: Einträge mit einem von der
    # Praxis geschriebenen relevance-Satz. Sie brauchen keine Auflösung — sie sind
    # bereits vollständig — und sie dürfen bei der Zusammenführung den Ton angeben.
    from .sammlungen import lies as lies_sammlungen

    gesammelt, sammlungs_ausfaelle = lies_sammlungen(args.repos)
    print(f"kuratierte Sammlungen: {len(gesammelt)} Einträge")
    for vermerk in sammlungs_ausfaelle:
        print(f"   AUSFALL {vermerk}")

    # ── Weg 1b: Zitate im Fließtext der Repos, gegen OpenAlex/arXiv aufgelöst ─────
    saat = sammle(args.repos)
    print(f"Saatgut: {len(saat.koerner)} Körner aus {len(saat.gelesene_repos)} Repos")
    for ausfall in saat.ausfaelle:
        print(f"   AUSFALL {ausfall.praxis}: {ausfall.vermerk}")

    aufgeloest, ausfaelle = baue(saat, args.wurzel, grenze=args.grenze)
    roh = len(gesammelt) + len(aufgeloest)
    eintraege = fuehre_zusammen(gesammelt + aufgeloest)
    print(f"zusammen: {roh} · nach Zusammenführung: {len(eintraege)} · "
          f"nicht aufgelöst: {len(ausfaelle)}")
    for ausfall in ausfaelle:
        print(f"   – {ausfall.art} {ausfall.kennung[:52]}: {ausfall.vermerk}")

    # Urteile aus dem bestehenden Katalog übernehmen, BEVOR geschrieben wird.
    ziel = args.wurzel / "src/data/register/papers.json"
    if ziel.is_file():
        alt = json.loads(ziel.read_text(encoding="utf-8"))
        vorher_urteile = sum(1 for e in alt if e.get("relevanz_herkunft") == "urteil")
        eintraege = bewahre_urteile(eintraege, alt)
        nachher = sum(1 for e in eintraege if e.relevanz_herkunft == "urteil")
        print(f"Urteile übernommen: {nachher} von {vorher_urteile} aus dem Vorlauf")
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(als_json(eintraege), encoding="utf-8")
    print(f"geschrieben: {ziel}")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
