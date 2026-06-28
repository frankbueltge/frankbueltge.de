"""Führt alle Adapter isoliert aus. Ein Ausfall kippt nie den Lauf — er wird Form."""
from __future__ import annotations

import math
from datetime import datetime, timezone

from protokoll import PIPELINE_VERSION
from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import SCHEMA_VERSION, DayIndex, DayRecord, Entry
from protokoll.trend import WORSE_DIRECTION
from protokoll.validate import corridor_status, is_stale


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def build_entry(spec: AdapterSpec, ctx: Context) -> Entry:
    common = dict(top_id=spec.top_id, unit=spec.unit, cadence=spec.cadence,
                  source=spec.source, retrieved_at=_now_iso())
    try:
        m = spec.measure(ctx)
        if not math.isfinite(m.value):
            return Entry(status="unavailable", note=f"non-finite value: {m.value!r}", **common)
        if m.comparison is not None and not math.isfinite(m.comparison.value):
            return Entry(status="unavailable",
                         note=f"non-finite comparison value: {m.comparison.value!r}", **common)
        if m.as_of is None:
            return Entry(status="unavailable", note="as_of is None", **common)
        if is_stale(m.as_of, ctx.today, spec.max_age_days):
            return Entry(status="unavailable", note=f"stale: as_of={m.as_of}", **common)
        status = corridor_status(m.value, spec.corridor)
        return Entry(status=status, value=m.value, as_of=m.as_of, comparison=m.comparison,
                     label=m.label, record=m.record, trend=m.trend, **common)
    except Exception as exc:  # Isolation: jeder Fehler wird amtlicher Vermerk
        return Entry(status="unavailable", note=f"{type(exc).__name__}: {exc}"[:200], **common)


def compute_index(entries: tuple[Entry, ...]) -> DayIndex:
    eligible = [e for e in entries if e.top_id in WORSE_DIRECTION]
    established = [e for e in eligible if e.trend is not None]
    return DayIndex(
        eligible=len(eligible),
        established=len(established),
        improved=sum(1 for e in established if e.trend == "improved"),
        worsened=sum(1 for e in established if e.trend == "worsened"),
        unchanged=sum(1 for e in established if e.trend == "unchanged"),
    )


def assemble(specs: list[AdapterSpec], ctx: Context, date_iso: str) -> DayRecord:
    entries = tuple(build_entry(s, ctx) for s in specs)
    return DayRecord(
        date=date_iso, generated_at=_now_iso(), schema_version=SCHEMA_VERSION,
        pipeline_version=PIPELINE_VERSION,
        entries=entries, index=compute_index(entries),
    )
