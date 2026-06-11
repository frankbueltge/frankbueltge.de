"""TOP Meereis — NSIDC Sea Ice Index v3, tägliche Ausdehnung Arktis/Antarktis."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL_N = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/daily/data/N_seaice_extent_daily_v3.0.csv"
URL_S = "https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/data/S_seaice_extent_daily_v3.0.csv"


def _rows(text: str) -> list[tuple[date, float]]:
    out: list[tuple[date, float]] = []
    for line in text.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 4 or not parts[0].isdigit():
            continue
        out.append((date(int(parts[0]), int(parts[1]), int(parts[2])), float(parts[3])))
    return out


def _measure(url: str, ctx: Context) -> Measurement:
    rows = _rows(fetch(url, client=ctx.client))
    d, value = rows[-1]
    target = d.replace(year=d.year - 1) if not (d.month == 2 and d.day == 29) \
        else d.replace(year=d.year - 1, day=28)
    by_date = dict(rows)
    prev = None
    for delta in (0, 1, -1, 2, -2):
        prev = by_date.get(target + timedelta(days=delta))
        if prev is not None:
            break
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison)


def measure_north(ctx: Context) -> Measurement:
    return _measure(URL_N, ctx)


def measure_south(ctx: Context) -> Measurement:
    return _measure(URL_S, ctx)


_NSIDC = "NSIDC Sea Ice Index v3 (NOAA@NSIDC)"
_LICENSE = "NOAA/NSIDC: frei nutzbar mit Quellenangabe"

SPEC_NORTH = AdapterSpec(top_id="seaice_north", unit="Mio. km²", cadence="daily",
                         corridor=(1, 18), max_age_days=14,
                         source=SourceMeta(name=_NSIDC, url=URL_N, license=_LICENSE),
                         measure=measure_north)
SPEC_SOUTH = AdapterSpec(top_id="seaice_south", unit="Mio. km²", cadence="daily",
                         corridor=(1, 22), max_age_days=14,
                         source=SourceMeta(name=_NSIDC, url=URL_S, license=_LICENSE),
                         measure=measure_south)
