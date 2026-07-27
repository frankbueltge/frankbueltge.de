"""Kuratierte Sammlungen der Praxen — direkt übernommen, nicht aus Kennungen geklaubt.

Frank, 2026-07-28: „alle zitierten papers oder genutzte datasets oder alle zitate ALLER
PRAXEN sollen auch im paper katalog landen." Vollständigkeit gegenüber den Praxen also,
nicht nur gegenüber dem, was sich auflösen lässt.

**Der Fehler, den dieses Modul repariert.** `praxen.py` sammelt DOIs und arXiv-Kennungen
aus dem Fließtext der Repos. Gemessen am 2026-07-28: Von Ulysses' 94 Atlas-Einträgen
fehlten damit **67** im Katalog — 68 von ihnen tragen überhaupt keine DOI, sondern eine
Repositoriums-URL. Und ausgerechnet diese Einträge sind die wertvollsten: **alle 94 haben
einen von der Praxis handgeschriebenen `relevance`-Satz.** Die Kennungs-Extraktion hat
also 71 % des bestbegründeten Materials fallen lassen, weil sie nach dem falschen Merkmal
suchte.

Die Lehre ist dieselbe wie beim Rückbau des Registers: Ein Verfahren, das nach einem
formalen Merkmal siebt, misst nicht, was es zu messen vorgibt. Eine kuratierte Liste
übernimmt man, statt sie zu durchsuchen.

**Was hier gelesen wird** (alles rein lesend, kein Netzzugriff):

  ulysses/atlas/atlas.json                       Theorie-Atlas des Ateliers, 94 Einträge
  meridian-runtime/corpora/*/citations.manifest.json   geprüfte Zitationsmanifeste
  meridian-runtime/corpora/*/theory-atlas.snapshot.json  Momentaufnahmen (Dubletten
                                                 zum Atelier-Atlas; die Zusammenführung
                                                 in katalog.py fängt sie ab)

Nichts wird umformuliert. `summary` und `relevance` stehen wörtlich so, wie die Praxis
sie geschrieben hat.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from .katalog import (
    GRUND_KURATIERT,
    GRUND_ZITIERT,
    WEG_PRAXIS,
    Katalogeintrag,
    _felder_aus_begriffen,
)

# Welche Datei zu welcher Praxis gehört. Der Pfad ist relativ zum Verzeichnis, in dem die
# Repos nebeneinander liegen. Fehlt eine Datei, wird das vermerkt, nie überbrückt.
SAMMLUNGEN: tuple[tuple[str, str, str], ...] = (
    # (Praxis, Pfad, Form)
    ("atelier", "ulysses/atlas/atlas.json", "atlas"),
    ("meridian", "meridian-runtime/corpora/model-collapse/theory-atlas.snapshot.json", "atlas"),
    ("meridian", "meridian-runtime/corpora/research-records/citations.manifest.json", "manifest"),
    ("meridian", "meridian-runtime/corpora/e2e-survey/citations.manifest.json", "manifest"),
)


MUSTER_ISO_DATUM = re.compile(r"\d{4}-\d{2}-\d{2}")


def _lesedatum(wert) -> str | None:
    """Nur ein echtes ISO-Datum darf ins Datumsfeld.

    Ulysses' `session_read` ist überwiegend `YYYY-MM-DD`, führt aber Ausnahmen —
    gemessen am 2026-07-28: 16 von 17 sauber, einmal `tick 2026-07-22`. Wörtlich
    übernommen sortierte dieser eine Wert über den 27.07., weil „t" hinter jeder Ziffer
    kommt. Wörtlichkeit ist die Regel für Prosa; ein Feld, nach dem sortiert wird, muss
    zusätzlich die Form haben, die es behauptet.

    Steckt ein Datum im Wert, wird es herausgelesen; steckt keines drin, bleibt das Feld
    leer. Verworfen wird nichts — die Rohform steht weiter in der Quelle.
    """
    if not wert:
        return None
    treffer = MUSTER_ISO_DATUM.search(str(wert))
    return treffer.group() if treffer else None


def _aus_atlas_eintrag(e: dict, praxis: str, quelle: str) -> Katalogeintrag | None:
    """Ein Eintrag im Atlas-Schema (author/work/year/type/url/tags/summary/relevance)."""
    titel = (e.get("work") or "").strip()
    url = (e.get("url") or "").strip()
    if not titel or not url:
        return None

    # Kennung: die DOI aus der URL, wenn eine drinsteht, sonst die URL selbst. Eine URL
    # IST eine Kennung — nur eine weniger dauerhafte, und das darf man sehen.
    kennung = url
    if "10." in url:
        rest = url.split("doi.org/", 1)[-1] if "doi.org/" in url else ""
        if rest.startswith("10."):
            kennung = rest.rstrip("/")
    elif "arxiv.org/abs/" in url.lower():
        kennung = "arXiv:" + url.lower().split("arxiv.org/abs/", 1)[1].split("v")[0].strip("/")

    urheber = tuple(t.strip() for t in (e.get("author") or "").split(",") if t.strip())
    zusammenfassung = (e.get("summary") or "").strip()
    relevanz = (e.get("relevance") or "").strip()
    jahr = e.get("year") if isinstance(e.get("year"), int) else None

    return Katalogeintrag(
        id=(e.get("id") or "").strip() or None or titel[:60],
        titel=titel,
        urheber=urheber,
        jahr=jahr,
        # Das Atlas-Schema führt keinen Ort; `type` ist das Nächste und steht wörtlich da.
        ort=(e.get("type") or "").strip(),
        kennung=kennung,
        url=url,
        # Ob frei zugänglich, sagt das Schema nicht — also wird es nicht behauptet.
        frei_zugaenglich=False,
        felder=_felder_aus_begriffen(titel, zusammenfassung, *(e.get("tags") or [])),
        zusammenfassung=zusammenfassung,
        # Ohne Satz kein „praxis": dann steht da der Gebrauchsbeleg, und der Eintrag
        # wartet wie jeder andere auf die Urteilsroutine.
        relevanz=relevanz or f"Held in the {praxis}'s own reading list.",
        relevanz_herkunft="praxis" if relevanz else "gebrauch",
        weg=WEG_PRAXIS,
        aufnahmegrund=GRUND_KURATIERT,
        fundstellen=(quelle,),
        # Rein lesend übernommen — die Adresse fragt erst der Katalogbau an. Hier steht
        # deshalb ehrlich „noch nicht geprüft", nicht „nicht erreichbar".
        geprueft=False,
        pruef_status=None,
        pruef_vermerk="aus kuratierter Sammlung übernommen, Adresse noch nicht angefragt",
        zitiert_von=(praxis,),
        # Wann die Praxis den Text gelesen hat, falls sie es festgehalten hat.
        zuletzt_gebraucht=_lesedatum(e.get("session_read")),
        verify_status="verified" if relevanz else "toVerify",
    )


def _aus_manifest_eintrag(e: dict, praxis: str, quelle: str) -> Katalogeintrag | None:
    """Ein Eintrag aus einem Zitationsmanifest (citation_id/cited_as/cited_url/identifiers).

    Diese Manifeste sind Meridians geprüfte Zitationsnachweise — sie führen keinen
    Begründungssatz, aber die Fundstelle im eigenen Text (`cited_in`). Das ist ein
    Gebrauchsbeleg der stärksten Sorte: nachgewiesen bis auf die Zeile.
    """
    url = (e.get("cited_url") or "").strip()
    titel = (e.get("claimed_title") or e.get("cited_as") or "").strip()
    if not titel or not url:
        return None

    doi = ((e.get("identifiers") or {}).get("doi") or "").strip()
    stelle = (e.get("cited_in") or "").strip()
    beleg = f"Cited by the {praxis} runtime"
    beleg += f" in {stelle}." if stelle else " in its audited research records."

    return Katalogeintrag(
        id=(e.get("citation_id") or "").strip() or titel[:60],
        titel=titel,
        urheber=(),  # Das Manifest nennt keine Autoren — leer bleibt leer.
        jahr=None,
        ort="",
        kennung=doi or url,
        url=url,
        frei_zugaenglich=False,
        felder=_felder_aus_begriffen(titel),
        zusammenfassung="",
        relevanz=beleg,
        relevanz_herkunft="gebrauch",
        weg=WEG_PRAXIS,
        # Ein Manifest weist die Zeile nach, in der zitiert wurde — der stärkste
        # Gebrauchsbeleg, den es gibt.
        aufnahmegrund=GRUND_ZITIERT,
        fundstellen=tuple(x for x in (quelle, stelle) if x),
        geprueft=False,
        pruef_status=None,
        pruef_vermerk="aus Zitationsmanifest übernommen, Adresse noch nicht angefragt",
        zitiert_von=(praxis,),
        zuletzt_gebraucht=None,
        verify_status="toVerify",
    )


def lies(wurzel: Path) -> tuple[list[Katalogeintrag], list[str]]:
    """Liest alle kuratierten Sammlungen. Rückgabe: (Einträge, Ausfallvermerke)."""
    eintraege: list[Katalogeintrag] = []
    ausfaelle: list[str] = []

    for praxis, pfad, form in SAMMLUNGEN:
        datei = wurzel / pfad
        if not datei.is_file():
            ausfaelle.append(f"{pfad}: nicht gefunden")
            continue
        try:
            daten = json.loads(datei.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as fehler:
            ausfaelle.append(f"{pfad}: unlesbar ({type(fehler).__name__})")
            continue

        if form == "manifest":
            roh = daten.get("citations") or []
            baue = _aus_manifest_eintrag
        else:
            roh = daten if isinstance(daten, list) else []
            baue = _aus_atlas_eintrag

        vorher = len(eintraege)
        for e in roh:
            eintrag = baue(e, praxis, pfad)
            if eintrag:
                eintraege.append(eintrag)
        if len(eintraege) == vorher and roh:
            ausfaelle.append(f"{pfad}: {len(roh)} Rohsätze, keiner verwertbar")

    return eintraege, ausfaelle
