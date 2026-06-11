"""TOP Ozean — globale Meeresoberflächentemperatur (NOAA OISST v2.1 via Climate Reanalyzer)."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = "https://climatereanalyzer.org/clim/sst_daily/json/oisst2.1_world2_sst_day.json"


def measure(ctx: Context) -> Measurement:
    data = fetch(URL, client=ctx.client, expect="json")
    years = {s["name"]: s["data"] for s in data if str(s["name"]).isdigit()}
    cur = years[str(ctx.today.year)]
    idx = max(i for i, v in enumerate(cur) if v is not None)
    value = float(cur[idx])
    as_of = (date(ctx.today.year, 1, 1) + timedelta(days=idx)).isoformat()
    prev_series = years.get(str(ctx.today.year - 1))
    comparison = None
    if prev_series and idx < len(prev_series) and prev_series[idx] is not None:
        comparison = Comparison(label="prev_year_day", value=float(prev_series[idx]))
    others = [s[idx] for y, s in years.items()
              if y != str(ctx.today.year) and idx < len(s) and s[idx] is not None]
    record = bool(others) and value > max(others)
    return Measurement(value=value, as_of=as_of, comparison=comparison, record=record)


SPEC = AdapterSpec(
    top_id="sst", unit="°C", cadence="daily", corridor=(15, 25), max_age_days=14,
    source=SourceMeta(name="NOAA OISST v2.1 (via Climate Reanalyzer, University of Maine)",
                      url=URL, license="NOAA: Public Domain; Aufbereitung: Climate Reanalyzer"),
    measure=measure,
)
