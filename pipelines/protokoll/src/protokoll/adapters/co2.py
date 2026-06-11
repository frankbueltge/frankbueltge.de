"""TOP Atmosphäre — NOAA GML, globaler CO2-Trend (deseasonalisiert), täglich."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.csv"


def _rows(text: str) -> list[tuple[date, float]]:
    out: list[tuple[date, float]] = []
    for line in text.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 5 or not parts[0].isdigit():
            continue  # Kommentare/Header
        out.append((date(int(parts[0]), int(parts[1]), int(parts[2])), float(parts[4])))
    return out


def _prev_year_value(rows: list[tuple[date, float]], d: date) -> float | None:
    target = d.replace(year=d.year - 1) if not (d.month == 2 and d.day == 29) \
        else d.replace(year=d.year - 1, day=28)
    by_date = dict(rows)
    for delta in (0, 1, -1, 2, -2):  # Quelle hat gelegentlich Lücken
        v = by_date.get(target + timedelta(days=delta))
        if v is not None:
            return v
    return None


def measure(ctx: Context) -> Measurement:
    rows = _rows(fetch(URL, client=ctx.client))
    d, value = rows[-1]
    prev = _prev_year_value(rows, d)
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    record = all(value > v for dd, v in rows if dd < d)
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison, record=record)


SPEC = AdapterSpec(
    top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500), max_age_days=14,
    source=SourceMeta(name="NOAA Global Monitoring Laboratory (Mauna Loa)",
                      url=URL, license="Public Domain (U.S. Government)"),
    measure=measure,
)
