"""Datenmodell des Scout-Laufs. JSON ist das Archiv — die Aufnahme entscheidet ein Mensch.

Ein Kandidat ist ein *Vorschlag*, keine Behauptung. Jeder Kandidat trägt seine Herkunft
(Quelle, Abfrage, Abrufzeit) und den Befund der Identifier-Prüfung mit sich, damit die
Aufnahmeregel der Atlanten („verified, retrievable identifier, checked at admission time")
am Kandidaten selbst nachprüfbar ist und nicht erst beim Aufnehmenden entsteht.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field

SCHEMA_VERSION = "1"

# Die beiden Atlanten. Sie sind nicht symmetrisch — verschiedener Gegenstand,
# verschiedenes Schema, verschiedene sinnvolle Quellen.
ATLAS_THEORIE = "theorie"   # ulysses/atlas/atlas.json — Texte, Zitationsnachbarschaft
ATLAS_WERKE = "werke"       # src/data/atlas/werke.json — Werke, kuratierte Quellen


@dataclass(frozen=True)
class Herkunft:
    """Woher der Kandidat stammt. Ohne diesen Block ist ein Kandidat nicht vorlagefähig."""

    quelle: str              # "openalex" | "wikidata"
    abfrage: str             # die konkrete Abfrage/Nachbarschaft, aus der der Fund stammt
    ausgehend_von: str       # ID des Atlas-Eintrags, dessen Nachbarschaft abgesucht wurde
    abgerufen_am: str        # ISO-8601, UTC


@dataclass(frozen=True)
class Pruefung:
    """Befund der Identifier-Prüfung. `aufgeloest=False` ⇒ der Kandidat ist nicht aufnahmefähig."""

    aufgeloest: bool
    status: int | None       # HTTP-Status der Prüfung, None bei Netzfehler
    geprueftes_ziel: str     # die tatsächlich angefragte URL
    vermerk: str | None      # Grund bei Fehlschlag — wird nie stillschweigend verschluckt


@dataclass(frozen=True)
class Annotation:
    """Optionaler Modellschritt. Immer als Vorschlag markiert, nie als Feststellung."""

    relevanz_vorschlag: str
    modell: str
    prompt_sha256: str       # macht den Vorschlag reproduzierbar prüfbar
    erzeugt_am: str


@dataclass(frozen=True)
class Kandidat:
    atlas: str                        # ATLAS_THEORIE | ATLAS_WERKE
    vorschlags_id: str                # kebab-slug, wie ihn ein Atlas-Eintrag trüge
    titel: str
    urheber: str                      # author bzw. artist
    jahr: int | None
    url: str
    doi: str | None
    herkunft: Herkunft
    pruefung: Pruefung
    punkte: float                     # Rangwert aus score.py
    punkte_begruendung: tuple[str, ...]
    # Fließtext aus der Quelle, unbearbeitet. Bei ArtBase der Suchschnipsel — die
    # einzige Prosa, die die API herausgibt. Wird nie umformuliert.
    notiz: str | None = None
    annotation: Annotation | None = None


@dataclass(frozen=True)
class Verworfen:
    """Was der Scout gesehen und aussortiert hat. Das Verzeichnis der Ablehnungen ist Material."""

    titel: str
    grund: str               # "bereits-im-atlas" | "identifier-nicht-aufloesbar" | "unter-schwelle"
    detail: str | None
    herkunft: Herkunft


@dataclass(frozen=True)
class Ausfall:
    """Quellenausfall. Wird vermerkt, nie überbrückt."""

    quelle: str
    ausgehend_von: str
    vermerk: str


@dataclass(frozen=True)
class Lauf:
    schema_version: str
    atlas: str
    gestartet_am: str
    beendet_am: str
    atlas_sha256: str                 # der Stand, gegen den abgeglichen wurde
    atlas_eintraege: int
    saatgut: tuple[str, ...]          # die Atlas-IDs, deren Nachbarschaft abgesucht wurde
    kandidaten: tuple[Kandidat, ...]
    verworfen: tuple[Verworfen, ...]
    ausfaelle: tuple[Ausfall, ...] = field(default_factory=tuple)

    def als_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=False, sort_keys=False)
