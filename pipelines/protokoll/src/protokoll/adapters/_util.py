"""Gemeinsame Adapter-Helfer."""
from __future__ import annotations

from datetime import date, timedelta


def prev_year_value(by_date: dict[date, float], d: date,
                    deltas: tuple[int, ...] = (0, 1, -1, 2, -2)) -> float | None:
    """Wert am selben Kalendertag des Vorjahres, mit Lücken-Toleranz (Quellen haben Löcher)."""
    target = d.replace(year=d.year - 1) if not (d.month == 2 and d.day == 29) \
        else d.replace(year=d.year - 1, day=28)
    for delta in deltas:
        v = by_date.get(target + timedelta(days=delta))
        if v is not None:
            return v
    return None
