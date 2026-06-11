"""TOP Geldpreis — Euro Short-Term Rate (€STR), EZB-Datenportal (SDMX-CSV)."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = ("https://data-api.ecb.europa.eu/service/data/EST/B.EU000A2X2A25.WT"
       "?lastNObservations=2&format=csvdata")


def measure(ctx: Context) -> Measurement:
    lines = [l for l in fetch(URL, client=ctx.client).splitlines() if l.strip()]
    header = [h.strip() for h in lines[0].split(",")]
    i_time, i_val = header.index("TIME_PERIOD"), header.index("OBS_VALUE")
    rows = [(p[i_time], float(p[i_val]))
            for p in ([c.strip() for c in l.split(",")] for l in lines[1:])]
    rows.sort()
    as_of, value = rows[-1]
    comparison = Comparison(label="prev_day", value=rows[-2][1]) if len(rows) > 1 else None
    return Measurement(value=value, as_of=as_of, comparison=comparison)


SPEC = AdapterSpec(
    top_id="rates", unit="%", cadence="daily", corridor=(-1, 8), max_age_days=7,
    source=SourceMeta(name="Europäische Zentralbank, €STR", url=URL,
                      license="EZB: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
