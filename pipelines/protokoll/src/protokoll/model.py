"""Kanonisches Datenmodell. JSON ist das Archiv; Prosa entsteht erst im Frontend."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Literal

SCHEMA_VERSION = "1"

Status = Literal["ok", "unavailable", "implausible"]


@dataclass(frozen=True)
class SourceMeta:
    name: str
    url: str
    license: str


@dataclass(frozen=True)
class Comparison:
    label: Literal["prev_day", "prev_month", "prev_year_day"]
    value: float


@dataclass(frozen=True)
class Measurement:
    """Rohergebnis eines Adapters, vor Validierung."""
    value: float
    as_of: str  # ISO-Datum, auf das sich die Messung bezieht
    comparison: Comparison | None = None
    label: str | None = None  # z. B. Wikipedia-Artikeltitel
    record: bool = False  # Höchststand seit Aufzeichnungsbeginn


@dataclass(frozen=True)
class Entry:
    top_id: str
    status: Status
    unit: str
    cadence: str
    source: SourceMeta
    retrieved_at: str
    value: float | None = None
    as_of: str | None = None
    comparison: Comparison | None = None
    label: str | None = None
    record: bool = False
    note: str | None = None


@dataclass(frozen=True)
class DayRecord:
    date: str
    generated_at: str
    schema_version: str
    pipeline_version: str
    entries: list[Entry]


def day_record_to_json(record: DayRecord) -> str:
    return json.dumps(asdict(record), ensure_ascii=False, indent=2, sort_keys=True) + "\n"
