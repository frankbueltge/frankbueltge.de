"""Adapter-Vertrag: ein Spec pro Messwert. measure() liefert Measurement oder wirft."""
from __future__ import annotations

from collections.abc import Callable, Mapping
from dataclasses import dataclass
from datetime import date
from typing import Any

import httpx

from protokoll.model import Cadence, Measurement, SourceMeta


@dataclass(frozen=True)
class Context:
    client: httpx.Client
    today: date
    env: Mapping[str, str]
    bq_client_factory: Callable[[], Any] | None = None


@dataclass(frozen=True)
class AdapterSpec:
    top_id: str
    unit: str
    cadence: Cadence
    corridor: tuple[float, float] | None
    max_age_days: int | None
    source: SourceMeta
    measure: Callable[[Context], Measurement]
