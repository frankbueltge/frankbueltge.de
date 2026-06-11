"""TOP Atmosphäre — NOAA GML, globaler CO2-Trend (deseasonalisiert), täglich."""
from __future__ import annotations

from datetime import date

from protokoll.adapters._util import prev_year_value
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


def measure(ctx: Context) -> Measurement:
    rows = _rows(fetch(URL, client=ctx.client))
    d, value = rows[-1]
    prev = prev_year_value(dict(rows), d)
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    # Beim deseasonalisierten Trend ist der Rekord fast täglich wahr — das ist kein Rauschen,
    # sondern der Befund: höchster Stand seit Aufzeichnungsbeginn, jeden Tag aufs Neue.
    record = all(value > v for dd, v in rows if dd < d)
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison, record=record)


SPEC = AdapterSpec(
    top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500), max_age_days=14,
    source=SourceMeta(name="NOAA Global Monitoring Laboratory (Mauna Loa)",
                      url=URL, license="Public Domain (U.S. Government)"),
    measure=measure,
)
