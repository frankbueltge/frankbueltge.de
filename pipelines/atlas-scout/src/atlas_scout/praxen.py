"""Saatgut aus den Praxen — woran die Ökologie gerade tatsächlich forscht.

Das ist die Stelle, an der sich die Richtung umdreht (docs/design/2026-07-27-register-
rueckbau-und-scouts.md §1). Bisher suchte das Register, was es in der Welt gibt, und
hoffte, dass Brauchbares dabei ist. Von hier an ist der Ausgangspunkt, was die drei
Praxen benutzen — und gesucht wird die Nachbarschaft davon.

Warum das trägt, wo ein Stichwortsieb nicht trug: Ein Zitat ist ein **Gebrauchsbeleg**.
Es sagt nicht „in diesem Titel steht ein Wort", sondern „eine Praxis hat danach
gegriffen". Damit ist die Begründung schon da, bevor der Scout losläuft — und alles, was
er findet, erbt sie über eine nachvollziehbare Kette statt sie zu behaupten.

Gemessen am 2026-07-27: die vier Repos zitieren 89 DOIs und 85 arXiv-Kennungen. Das ist
der Anfangsbestand des Paper-Katalogs, nicht 16.516 zu filternde Einträge.

**Rein lesend, nur Standardbibliothek, kein Netzzugriff.** Dieses Modul öffnet Dateien
und ruft `git log` — sonst nichts. Die Auflösung der Kennungen (existiert das? was hängt
daran?) ist Sache der Quell-Module, die Aufnahme Sache von `aufnahme.py`.
"""
from __future__ import annotations

import json
import re
import subprocess
from dataclasses import asdict, dataclass, field
from pathlib import Path

from .atlas import normiere_doi

SCHEMA_VERSION = "1"

# Die vier öffentlichen Engine-Repos. `meridian-runtime` steht mit dabei, weil das Feld
# seine Korpora dort führt (corpora/*/citations.manifest.json) — die dichteste
# Zitationsquelle der ganzen Ökologie.
PRAXEN: dict[str, str] = {
    "atelier": "ulysses",
    "field": "field-research",
    "studio": "studio",
    "meridian": "meridian-runtime",
}

# Wo in einem Praxis-Repo überhaupt zitiert wird. Alles andere (Sperrdateien, Zeugs unter
# .git, virtuelle Umgebungen) wird nie gelesen — nicht aus Sparsamkeit, sondern weil ein
# Treffer in node_modules kein Gebrauchsbeleg dieser Praxis wäre.
GELESENE_ENDUNGEN = (".json", ".jsonl", ".md", ".yml", ".yaml", ".py", ".ts")
UEBERSPRUNGENE_ORDNER = frozenset(
    {".git", "node_modules", "__pycache__", ".venv", "dist", ".astro", "build"}
)


def _stutze_doi(roh: str) -> str:
    """Schneidet ab, was der Fundort angehängt hat — aber nicht, was zur DOI gehört.

    Zwei Fälle, die sich beißen (beide gemessen am 2026-07-27):
      - Alte Elsevier-DOIs FÜHREN Klammern: `10.1016/0004-3702(71)90010-5`.
        Ein Muster, das an `)` abbricht, zerschneidet sie.
      - Markdown-Links ENDEN auf `)`: `[Titel](https://doi.org/10.1234/foo)`.
        Ein Muster, das `)` durchlässt, nimmt die schließende Klammer mit.

    Die Balance entscheidet: Eine schließende Klammer gehört nur dazu, wenn vorher eine
    öffnende steht. Überzählige `)` fallen hinten weg, danach noch die üblichen
    Satzzeichen. Damit bleiben beide Fälle heil, ohne dass eine Quelle geraten wird.
    """
    doi = roh
    while doi.count(")") > doi.count("("):
        doi = doi[: doi.rfind(")")]
    return doi.rstrip(".,;:/")


def _ist_pruefstueck(relativ: Path) -> bool:
    """Testdateien zählen nicht als Zitat.

    Gemessen am 2026-07-27: 18 von 152 Saatkörnern stammten ausschließlich aus
    Testvorrichtungen — `10.1038/never-reached`, `10.1234/abc`, `10.9999/does-not-exist`.
    Das sind erfundene Kennungen, mit denen die Praxen ihre eigene Zitationsprüfung
    testen, keine Quellen, nach denen jemand gegriffen hat. Sie ins Saatgut zu lassen
    hieße, den Scout von Attrappen aus suchen zu lassen.

    Dateiweise, nicht kornweise: Wird dieselbe echte Kennung auch außerhalb der Tests
    zitiert, bleibt sie über ihre übrigen Fundstellen erhalten (5 Fälle).
    """
    teile = [t.lower() for t in relativ.parts]
    if any(t.startswith("test") or t == "fixtures" for t in teile[:-1]):
        return True
    return teile[-1].startswith("test_") or teile[-1].startswith("test.")


# Verzeichnisse, in denen Kennungen als UNTERSUCHTES MATERIAL liegen, nicht als Quelle.
PROVENIENZ_ORDNER = frozenset({"provenance", "provenienz", "rohdaten", "raw", "messungen"})


def _ist_rohmaterial(relativ: Path) -> bool:
    """Gemessenes Material zählt nicht als Zitat.

    Der Fall, an dem das auffiel (2026-07-28): `field-research/works/
    2026-07-26-one-line-for-ten-thousand/provenance/register-records/aufloesungen.jsonl`
    enthält 1.070 Auflösungsprotokolle — GBIF-Occurrence-Downloads mit HTTP 403, die das
    Werk am Dataset Register GEMESSEN hat. **200 der 332 Saatkörner kamen aus dieser
    einen Datei.** Ungefiltert hätten sie den Paper-Katalog mit
    Biodiversitäts-Downloads geflutet: exakt die Sorte Masse, für die das Register am
    Vortag zurückgebaut wurde.

    Der Unterschied ist der Punkt: Ein Zitat ist eine Quelle, auf die sich eine Praxis
    STÜTZT. Ein Auflösungsprotokoll ist ein Objekt, das sie UNTERSUCHT hat. Beide sehen
    im Dateisystem gleich aus — eine DOI ist eine DOI —, und genau deshalb muss die
    Unterscheidung über den Ort laufen, an dem sie liegt.

    Gemessen: ohne Filter 332 Körner, mit Filter 132. Die 200 stammen ausschließlich aus
    Provenienz-Material; kein einziges Korn verliert dadurch seine letzte Fundstelle.

    **Nachgezogen 2026-07-30: `…-probe` gehört dazu.** Die Ordnerliste kannte Fields
    Benennung nicht. `notes/2026-07-16-half-life-archival-probe/urls.json` hält **513
    Prüfziele** einer Archiv-Halbwertszeit-Messung; zwei davon standen als „von field
    zitiert" im Katalog — „Medical Lawfare" und „Nowhere and no one is safe". Beide sind
    für Fields Gegenmessung inhaltlich einschlägig, und genau das macht den Fehler
    heikel: Ein `aufnahmegrund: zitiert` wäre dort eine Unwahrheit über eine wahre Sache.
    Gemessen: 137 Körner ohne, 135 mit — es fallen genau diese zwei, sonst nichts.

    Das ist keine neue Regel aus zwei Fällen, sondern dieselbe Regel an einem Ort, den
    sie nicht erkannte. `-probe` ist bei field Konvention für „eine Messung an Zielen".
    """
    teile = {t.lower() for t in relativ.parts[:-1]}
    if PROVENIENZ_ORDNER & teile:
        return True
    return any(t.endswith("-probe") for t in teile)


# The catalogue's own signature fields. A file whose entries carry them is not an index of
# sources but a copy of THIS catalogue.
#
# Two of the three are enough, and they are looked for across the first few entries rather
# than the first alone (Meridian, field-research REQUESTS.md 2026-07-30, session 73 — the
# measurement reproduced here before the change: their frozen state `03067c54.json`, 117
# entries, went unrecognised because its first entry predates `aufnahmegrund` entirely).
# The reason is worth stating plainly: the schema changed under its own detector. Demanding
# all three of the newest shape means the filter silently stops working on every state of
# the catalogue older than the last field added to it — and a mirror of an old state loops
# just as hard as a mirror of a new one.
KATALOG_SIGNATUR = ("aufnahmegrund", "relevanz_herkunft", "zitiert_von")
# How many of the signature fields must be present. Two, not three: the earliest published
# state has exactly `relevanz_herkunft` + `zitiert_von`. Not one — a single German field name
# could plausibly appear in someone else's index; two of these three together could not.
SIGNATUR_MINDESTENS = 2
# The union is taken over this many leading entries. An entry may omit an optional field;
# a file does not.
SIGNATUR_PROBE_EINTRAEGE = 5


def _ist_spiegel(relativ: Path, roh: str) -> bool:
    """Ein Abzug des eigenen Katalogs zählt nicht als Zitat.

    Der Fall (2026-07-30): Fields Provenienz-Audit `drafts/2026-07-28-follow-the-line/`
    hält den Paper-Katalog eingefroren, um die Provenienzansprüche des Katalogs gegen das
    eigene Repo zu prüfen — genau das, worum der Saat-Text gebeten hatte. Der nächtliche
    Lauf las diesen Abzug aber wie jede andere Datei und fand darin sämtliche Kennungen
    des Katalogs. Ergebnis: **79 Einträge trugen das Etikett „von field zitiert", deren
    einziger field-Beleg dieser Spiegel war** — der Katalog belegte sich selbst.

    Der Unterschied ist derselbe wie bei `_ist_rohmaterial`, eine Windung weiter: Dort
    war die Kennung untersuchtes Material, hier ist die ganze DATEI der Katalog. Ein
    Spiegel bezeugt nicht, dass jemand nach einem Text gegriffen hat, sondern nur, dass
    der Katalog dorthin gereist ist. Als Zitat gewertet macht er jeden künftigen Eintrag
    rückwirkend zu einem, den die spiegelnde Praxis „zitiert" — die Zahl wächst mit dem
    Katalog statt mit der Forschung.

    Erkannt wird er an der **eigenen Schema-Signatur**, nicht am Dateinamen: `.frozen`
    ist Fields Konvention, und die nächste Praxis spiegelt unter anderem Namen. Ein
    echtes Literaturverzeichnis kann der Filter nicht treffen — es trägt keinen
    `aufnahmegrund`. Das Wort in Prosa ebenfalls nicht: geprüft wird der geparste
    Eintrag, nicht der Text.

    Gemessen an beiden Abzügen des Audits: `papers.frozen.json` (208 Einträge) und
    `papers.seed-state.frozen.json` (206) werden erkannt; kein Eintrag verliert dadurch
    seine letzte Fundstelle, weil keiner allein am Spiegel hing.

    Widened 2026-07-31, on Meridian's measurement (field-research REQUESTS.md 2026-07-30,
    session 73), reproduced here against their five frozen states before the change: the
    earliest one, `03067c54.json` with 117 entries, was NOT recognised. Its first entry
    carries `relevanz_herkunft` and `zitiert_von` but predates `aufnahmegrund`, so the cheap
    pre-filter dropped the file before the signature was ever tested. The schema changed
    under its own detector — a filter pinned to the newest field stops working on every
    older state of the object it guards, and a mirror of an old state loops just as hard.
    Now: any signature field passes the pre-filter, and two of three across the leading
    entries decide. All five states are recognised; measured over the four practice repos the
    change moves nothing else (see tests/test_praxen.py).
    """
    if relativ.suffix != ".json":
        return False
    # Cheap pre-filter: saves parsing every JSON file in four repos. It asks for ANY of the
    # signature fields, not for `aufnahmegrund` alone — that single name was the whole gap:
    # the oldest published state of the catalogue does not contain it, so the file was
    # rejected here and the signature below never got to see it.
    if not any(f'"{feld}"' in roh for feld in KATALOG_SIGNATUR):
        return False
    try:
        daten = json.loads(roh)
    except (json.JSONDecodeError, RecursionError):
        return False
    if not isinstance(daten, list) or not daten:
        return False
    # The union over the leading entries, not the first entry alone: an entry may leave an
    # optional field out, a whole catalogue does not.
    felder: set[str] = set()
    for eintrag in daten[:SIGNATUR_PROBE_EINTRAEGE]:
        if isinstance(eintrag, dict):
            felder |= eintrag.keys()
    return sum(feld in felder for feld in KATALOG_SIGNATUR) >= SIGNATUR_MINDESTENS


# DOI: das Präfix ist normiert (10.x/…), der Suffix praktisch beliebig — deshalb bricht
# das Muster an Zeichen ab, die in Prosa und JSON den Bezeichner beenden, nicht an einer
# Zeichenklasse für „gültige DOI-Zeichen" (die gibt es nicht).
MUSTER_DOI = re.compile(r"10\.\d{4,9}/[^\s\"'`\\,\]}<>]+")
MUSTER_ARXIV = re.compile(r"arxiv\.org/abs/([0-9]{4}\.[0-9]{4,5})(?:v\d+)?", re.I)


@dataclass(frozen=True)
class Fundstelle:
    """Wo ein Saatkorn gefunden wurde. Ohne diesen Block ist es nicht vorlagefähig —
    der Scout muss später sagen können, WER das zitiert hat und WANN zuletzt."""

    praxis: str
    repo: str
    datei: str
    zuletzt_geaendert: str | None  # ISO-Datum des jüngsten Commits, None wenn unbekannt


@dataclass(frozen=True)
class Saatkorn:
    kennung: str  # normalisierte DOI (kleingeschrieben, ohne Auflöser-Präfix) oder arXiv-ID
    art: str  # "doi" | "arxiv"
    fundstellen: tuple[Fundstelle, ...]

    @property
    def praxen(self) -> tuple[str, ...]:
        """Welche Praxen das zitieren. Mehrere = ein stärkeres Saatkorn."""
        return tuple(sorted({f.praxis for f in self.fundstellen}))

    @property
    def juengste_nennung(self) -> str | None:
        """Wann zuletzt eine Praxis daran gearbeitet hat — das Maß für „gerade aktuell"."""
        daten = [f.zuletzt_geaendert for f in self.fundstellen if f.zuletzt_geaendert]
        return max(daten) if daten else None


@dataclass(frozen=True)
class Ausfall:
    """Ein Repo, das nicht gelesen werden konnte. Wird vermerkt, nie überbrückt —
    ein fehlendes Repo darf nie wie „diese Praxis zitiert nichts" aussehen."""

    praxis: str
    repo: str
    vermerk: str


@dataclass(frozen=True)
class Saat:
    schema_version: str
    gelesene_repos: tuple[str, ...]
    koerner: tuple[Saatkorn, ...]
    ausfaelle: tuple[Ausfall, ...] = field(default_factory=tuple)

    def als_json(self) -> str:
        daten = {
            "schema_version": self.schema_version,
            "gelesene_repos": list(self.gelesene_repos),
            "ausfaelle": [asdict(a) for a in self.ausfaelle],
            "koerner": [
                {
                    "kennung": k.kennung,
                    "art": k.art,
                    "praxen": list(k.praxen),
                    "juengste_nennung": k.juengste_nennung,
                    "fundstellen": [asdict(f) for f in k.fundstellen],
                }
                for k in self.koerner
            ],
        }
        return json.dumps(daten, indent=2, ensure_ascii=False)


def _letzte_aenderung(repo: Path, datei: Path) -> str | None:
    """ISO-Datum des jüngsten Commits einer Datei. None, wenn git nichts weiß —
    dann fehlt die Angabe, statt dass ein heutiges Datum erfunden wird."""
    try:
        ergebnis = subprocess.run(
            ["git", "-C", str(repo), "log", "-1", "--format=%cs", "--", str(datei)],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    stand = ergebnis.stdout.strip()
    return stand or None


def _lies_repo(praxis: str, repo_name: str, wurzel: Path) -> tuple[dict, Ausfall | None]:
    """Sammelt die Kennungen eines Repos. Rückgabe: {(art, kennung): [Fundstelle, …]}."""
    repo = wurzel / repo_name
    if not repo.is_dir():
        return {}, Ausfall(praxis, repo_name, f"Verzeichnis nicht gefunden: {repo}")

    treffer: dict[tuple[str, str], list[Fundstelle]] = {}
    # Datum je Datei nur einmal ermitteln — `git log` je Fundstelle wäre ein Aufruf
    # pro Treffer statt pro Datei.
    for pfad in sorted(repo.rglob("*")):
        if not pfad.is_file() or pfad.suffix not in GELESENE_ENDUNGEN:
            continue
        relativ_pfad = pfad.relative_to(repo)
        if UEBERSPRUNGENE_ORDNER & set(relativ_pfad.parts):
            continue
        if _ist_pruefstueck(relativ_pfad) or _ist_rohmaterial(relativ_pfad):
            continue
        try:
            roh = pfad.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        # Erst nach dem Lesen prüfbar: Ein Spiegel ist am Inhalt erkennbar, nicht am Pfad.
        if _ist_spiegel(relativ_pfad, roh):
            continue

        gefunden: set[tuple[str, str]] = set()
        for m in MUSTER_DOI.findall(roh):
            kennung = normiere_doi(_stutze_doi(m))
            if kennung:
                gefunden.add(("doi", kennung))
        for m in MUSTER_ARXIV.findall(roh):
            gefunden.add(("arxiv", m.lower()))
        if not gefunden:
            continue

        relativ = str(pfad.relative_to(repo))
        stelle = Fundstelle(praxis, repo_name, relativ, _letzte_aenderung(repo, pfad.relative_to(repo)))
        for schluessel in gefunden:
            treffer.setdefault(schluessel, []).append(stelle)

    return treffer, None


def sammle(wurzel: Path, praxen: dict[str, str] | None = None) -> Saat:
    """Liest die Praxis-Repos unterhalb von `wurzel` und gibt das Saatgut zurück.

    `wurzel` ist das Verzeichnis, in dem die Repos nebeneinander liegen (im Arbeitsplatz
    ~/Documents/GitHub, in CI das Verzeichnis der flachen Klone).
    """
    praxen = praxen or PRAXEN
    alle: dict[tuple[str, str], list[Fundstelle]] = {}
    ausfaelle: list[Ausfall] = []
    gelesen: list[str] = []

    for praxis, repo_name in praxen.items():
        treffer, ausfall = _lies_repo(praxis, repo_name, wurzel)
        if ausfall:
            ausfaelle.append(ausfall)
            continue
        gelesen.append(repo_name)
        for schluessel, stellen in treffer.items():
            alle.setdefault(schluessel, []).extend(stellen)

    koerner = tuple(
        sorted(
            (
                Saatkorn(kennung=kennung, art=art, fundstellen=tuple(stellen))
                for (art, kennung), stellen in alle.items()
            ),
            # Jüngstes zuerst, dann das von mehreren Praxen Zitierte: was gerade läuft und
            # was mehrfach gebraucht wird, kommt zuerst dran.
            key=lambda k: (k.juengste_nennung or "", len(k.praxen)),
            reverse=True,
        )
    )
    return Saat(
        schema_version=SCHEMA_VERSION,
        gelesene_repos=tuple(gelesen),
        koerner=koerner,
        ausfaelle=tuple(ausfaelle),
    )
