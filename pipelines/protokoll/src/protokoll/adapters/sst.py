"""TOP Ozean — globale Meeresoberflächentemperatur (NOAA OISST v2.1 via Climate Reanalyzer).
Live-Daten liegen unter json_2clim/; Jahresserien tragen finale Werte (~2 Wochen Verzug),
die provisorische "Preliminary"-Serie wird bewusst ignoriert (isdigit-Filter) —
lieber finaler Stand mit ehrlichem Datum als vorläufige Zahl."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta
from protokoll.trend import WORSE_DIRECTION, classify_trend

URL = "https://climatereanalyzer.org/clim/sst_daily/json_2clim/oisst2.1_world2_sst_day.json"


def measure(ctx: Context) -> Measurement:
    data = fetch(URL, client=ctx.client, expect="json")
    years = {s["name"]: s["data"] for s in data if str(s["name"]).isdigit()}
    year = ctx.today.year
    cur = years.get(str(year))
    if not cur or all(v is None for v in cur):
        # Januar-Lücke: OISST-Finalwerte hinken ~2 Wochen — ehrlich auf das
        # Vorjahresende ausweichen; das Staleness-Limit wacht über das Datum.
        year -= 1
        cur = years.get(str(year))
    if not cur:
        raise ValueError("no SST series for current or previous year")
    non_null = [i for i, v in enumerate(cur) if v is not None]
    if not non_null:
        raise ValueError("no non-null SST values")
    idx = max(non_null)
    value = float(cur[idx])
    as_of = (date(year, 1, 1) + timedelta(days=idx)).isoformat()
    prev_series = years.get(str(year - 1))
    comparison = None
    if prev_series and idx < len(prev_series) and prev_series[idx] is not None:
        comparison = Comparison(label="prev_year_day", value=float(prev_series[idx]))
    # Echter Alltime-Rekord über alle Jahre/Tage — nur dann ist der amtliche Satz
    # "Höchster Stand seit Beginn der Aufzeichnung" wörtlich wahr.
    others = [v for y, s in years.items() if y != str(year)
              for v in s if v is not None]
    record = bool(others) and value > max(others)
    # Volle (Datum, Wert)-Reihe über alle Jahre — Grundlage der 365-Tage-Trendklassifikation.
    series = sorted(
        (date(int(y), 1, 1) + timedelta(days=i), float(v))
        for y, s in years.items()
        for i, v in enumerate(s)
        if v is not None
    )
    trend = classify_trend(series, worse=WORSE_DIRECTION["sst"])
    return Measurement(value=value, as_of=as_of, comparison=comparison, record=record,
                       trend=trend)


SPEC = AdapterSpec(
    top_id="sst", unit="°C", cadence="daily", corridor=(15, 25), max_age_days=30,
    source=SourceMeta(name="NOAA OISST v2.1 (via Climate Reanalyzer, University of Maine)",
                      url=URL, license="NOAA: Public Domain; Aufbereitung: Climate Reanalyzer"),
    measure=measure,
)
