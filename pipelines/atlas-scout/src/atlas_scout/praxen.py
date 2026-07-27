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

# DOI: das Präfix ist normiert (10.x/…), der Suffix praktisch beliebig — deshalb bricht
# das Muster an Zeichen ab, die in Prosa und JSON den Bezeichner beenden, nicht an einer
# Zeichenklasse für „gültige DOI-Zeichen" (die gibt es nicht).
MUSTER_DOI = re.compile(r"10\.\d{4,9}/[^\s\"'\\,\]}<>)]+")
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
        if _ist_pruefstueck(relativ_pfad):
            continue
        try:
            roh = pfad.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        gefunden: set[tuple[str, str]] = set()
        for m in MUSTER_DOI.findall(roh):
            kennung = normiere_doi(m.rstrip(".,;:)"))
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
