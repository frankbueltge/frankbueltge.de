"""Kanonisches Datenmodell. JSON ist das Archiv; Prosa entsteht erst im Frontend."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Literal

SCHEMA_VERSION = "3"  # v3: Vertagungs-Index — Entry.trend + DayRecord.index

Status = Literal["ok", "unavailable", "implausible"]
Cadence = Literal["daily", "realtime", "monthly", "periodic", "computed"]


@dataclass(frozen=True)
class SourceMeta:
    name: str
    url: str
    license: str


@dataclass(frozen=True)
class Comparison:
    label: Literal["prev_day", "prev_month", "prev_year_day", "prev_observation_day"]
    value: float


@dataclass(frozen=True)
class Measurement:
    """Rohergebnis eines Adapters, vor Validierung."""
    value: float
    as_of: str  # ISO-Datum, auf das sich die Messung bezieht
    comparison: Comparison | None = None
    label: str | None = None  # z. B. Wikipedia-Artikeltitel
    record: bool = False  # Höchststand seit Aufzeichnungsbeginn
    trend: Literal["worsened", "improved", "unchanged"] | None = None  # vs. 12-Monats-Trend


@dataclass(frozen=True)
class LossEvent:
    """Ein Großereignis mit Todesopfern — fürs Protokoll dokumentiert, nie gewertet."""
    date: str
    label_de: str
    label_en: str
    deaths: int


@dataclass(frozen=True)
class Entry:
    top_id: str
    status: Status
    unit: str
    cadence: Cadence
    source: SourceMeta
    retrieved_at: str
    value: float | None = None
    as_of: str | None = None
    comparison: Comparison | None = None
    label: str | None = None
    record: bool = False
    note: str | None = None
    events: tuple[LossEvent, ...] | None = None  # nur TOP „Verluste"
    trend: Literal["worsened", "improved", "unchanged"] | None = None  # nur indexfähige TOPs


@dataclass(frozen=True)
class DayIndex:
    """Der Vertagungs-Index: Zählung über indexfähige TOPs mit etabliertem Trend."""
    eligible: int      # indexfähige TOPs im Tagesatz
    established: int    # davon mit etabliertem 12-Monats-Trend
    improved: int
    worsened: int
    unchanged: int


@dataclass(frozen=True)
class DayRecord:
    date: str
    generated_at: str
    schema_version: str
    pipeline_version: str
    entries: tuple[Entry, ...]
    index: DayIndex | None = None


def day_record_to_json(record: DayRecord) -> str:
    # allow_nan=False: ein nicht-finiter Wert darf nie still ins Archiv — lieber lauter Fehler.
    return json.dumps(asdict(record), ensure_ascii=False, indent=2, sort_keys=True,
                      allow_nan=False) + "\n"
