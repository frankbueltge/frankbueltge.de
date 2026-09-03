"""Canonical data model. JSON is the archive; prose is rendered by the site.

Three contracts leave this package: `trending-day/1` (one file per run day),
`trending-terms/1` (the arcs of the same run) and `trending-audience/2` (one file per measured
day, written the morning after; `/1` files stay in the archive with their own string)."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Any, Literal

CONTRACT_DAY = "trending-day/1"
# v2 (2026-09-03) retired the browser-beacon half: a client-side beacon cannot see a crawler
# that runs no JavaScript, which is most of the readers this page is built for. Committed v1
# files keep their contract string and are read as they are.
CONTRACT_AUDIENCE = "trending-audience/2"

Status = Literal["ok", "partial", "unavailable"]


@dataclass(frozen=True)
class Link:
    title: str
    url: str
    publisher: str | None = None


@dataclass(frozen=True)
class Signal:
    """One item as a source lists it: its own label, its own count, its own rank."""
    source: str
    label: str
    rank: int
    magnitude_unit: str
    url: str | None = None
    magnitude: int | None = None
    geo: str | None = None  # Google Trends geo, Wikipedia language, else None
    links: tuple[Link, ...] = ()
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SourceReport:
    id: str
    name: str
    url: str
    licence: str
    status: Status
    note: str
    retrieved_at: str
    as_of: str | None
    count: int


@dataclass(frozen=True)
class TopicSignal:
    source: str
    geo: str | None
    label: str
    url: str | None
    rank: int
    magnitude: int | None
    magnitude_unit: str


@dataclass(frozen=True)
class Topic:
    id: str
    label: str
    platforms: tuple[str, ...]
    platform_count: int
    score: float
    category: str | None
    first_seen: str
    days_hot: int
    signals: tuple[TopicSignal, ...]
    links: tuple[Link, ...]
    wikipedia: dict[str, Any] | None


@dataclass(frozen=True)
class DayRecord:
    date: str
    generated_at: str
    pipeline_version: str
    method_version: str
    sources: tuple[SourceReport, ...]
    signals: dict[str, tuple[Signal, ...]]
    topics: tuple[Topic, ...]
    summary: dict[str, Any]


def day_to_dict(rec: DayRecord) -> dict[str, Any]:
    return {"$contract": CONTRACT_DAY, **asdict(rec)}


def to_json(obj: dict[str, Any]) -> str:
    # allow_nan=False: a non-finite value must never slip into the archive silently.
    return json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=True, allow_nan=False) + "\n"
