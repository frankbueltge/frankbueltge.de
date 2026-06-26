"""Pure: window/plausibility filter, region salience, rank, index aggregates."""
from __future__ import annotations

from datetime import date, datetime

WINDOW_DAYS = 7
MAX_DURATION_HOURS = 1440  # 60 days; longer = artifact / ongoing, excluded
REGION_WEIGHT = {"no_take": 4, "mpa": 3, "eez": 2, "high_seas": 1}


def _date(iso: str) -> date:
    return datetime.fromisoformat(iso.replace("Z", "+00:00")).date()


def ended_within(ev: dict, today: date, days: int = WINDOW_DAYS) -> bool:
    try:
        d = _date(ev["end"])
    except (ValueError, KeyError, AttributeError, TypeError):
        return False
    return 0 <= (today - d).days <= days


def plausible(ev: dict, max_hours: float = MAX_DURATION_HOURS) -> bool:
    h = ev.get("duration_hours", 0)
    return 0 < h <= max_hours


def _region_weight(ev: dict) -> int:
    r = ev["regions"]
    if r.get("no_take"):
        return REGION_WEIGHT["no_take"]
    if r.get("mpa"):
        return REGION_WEIGHT["mpa"]
    if r.get("eez"):
        return REGION_WEIGHT["eez"]
    return REGION_WEIGHT["high_seas"]


def salience(ev: dict) -> int:
    """Region brisance dominates; duration tie-breaks within a region."""
    return _region_weight(ev) * 100000 + int(min(ev["duration_hours"], MAX_DURATION_HOURS))


def rank(events: list[dict]) -> str | None:
    """Id of the most salient event; ties broken by smaller id. None if empty."""
    best_id: str | None = None
    best = -1
    for ev in events:
        s = salience(ev)
        if best_id is None or s > best or (s == best and ev["id"] < best_id):
            best_id, best = ev["id"], s
    return best_id


def index(events: list[dict], total: int) -> dict:
    return {
        "total": total,
        "dark_hours_examined": round(sum(e["duration_hours"] for e in events), 1),
        "in_mpa": sum(1 for e in events if e["regions"]["mpa"]),
        "in_no_take": sum(1 for e in events if e["regions"]["no_take"]),
        "on_high_seas": sum(1 for e in events if e["regions"]["high_seas"]),
    }
