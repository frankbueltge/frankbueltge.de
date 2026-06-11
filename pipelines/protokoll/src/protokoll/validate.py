"""Plausibilitätskorridor + Staleness. Messausfall ist Form, nie stille Lücke."""
from __future__ import annotations

from datetime import date


def corridor_status(value: float, corridor: tuple[float, float] | None) -> str:
    if corridor is None:
        return "ok"
    lo, hi = corridor
    return "ok" if lo <= value <= hi else "implausible"


def is_stale(as_of: str, today: date, max_age_days: int | None) -> bool:
    if max_age_days is None:
        return False
    measured = date.fromisoformat(as_of)
    return (today - measured).days > max_age_days
