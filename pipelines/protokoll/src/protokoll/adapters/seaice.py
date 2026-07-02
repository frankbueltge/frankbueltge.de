"""TOP Meereis — NSIDC Sea Ice Index v4, tägliche Ausdehnung Arktis/Antarktis.
v4-CSV enthält in Spalte 6 quoted Kommas (Quelldatei-Listen) — unkritisch, wir lesen nur Spalte 1-4."""
from __future__ import annotations

from datetime import date

from protokoll.adapters._util import prev_year_value
from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta
from protokoll.trend import WORSE_DIRECTION, classify_trend

URL_N = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/daily/data/N_seaice_extent_daily_v4.0.csv"
URL_S = "https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/data/S_seaice_extent_daily_v4.0.csv"


def _rows(text: str) -> list[tuple[date, float]]:
    out: list[tuple[date, float]] = []
    for line in text.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 4 or not parts[0].isdigit():
            continue
        try:
            value = float(parts[3])
        except ValueError:
            continue  # einzelne defekte Zeile, nicht die ganze Datei verwerfen
        if value < 0:
            continue  # NSIDC-Fehlwert-Sentinel (-9999)
        out.append((date(int(parts[0]), int(parts[1]), int(parts[2])), value))
    return out


def _measure(url: str, top_id: str, ctx: Context) -> Measurement:
    rows = _rows(fetch(url, client=ctx.client))
    d, value = rows[-1]
    prev = prev_year_value(dict(rows), d)
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    trend = classify_trend(rows, worse=WORSE_DIRECTION[top_id])
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison, trend=trend)


def measure_north(ctx: Context) -> Measurement:
    return _measure(URL_N, "seaice_north", ctx)


def measure_south(ctx: Context) -> Measurement:
    return _measure(URL_S, "seaice_south", ctx)


_NSIDC = "NSIDC Sea Ice Index v4 (NOAA@NSIDC)"
_LICENSE = "NOAA/NSIDC: frei nutzbar mit Quellenangabe"

SPEC_NORTH = AdapterSpec(top_id="seaice_north", unit="Mio. km²", cadence="daily",
                         corridor=(1, 18), max_age_days=14,
                         source=SourceMeta(name=_NSIDC, url=URL_N, license=_LICENSE),
                         measure=measure_north)
SPEC_SOUTH = AdapterSpec(top_id="seaice_south", unit="Mio. km²", cadence="daily",
                         corridor=(1, 22), max_age_days=14,
                         source=SourceMeta(name=_NSIDC, url=URL_S, license=_LICENSE),
                         measure=measure_south)
