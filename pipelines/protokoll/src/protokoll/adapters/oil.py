"""TOP Energie — Brent-Spotpreis, U.S. EIA Open Data v2."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable, fetch
from protokoll.model import Comparison, Measurement, SourceMeta

BASE = ("https://api.eia.gov/v2/petroleum/pri/spt/data/"
        "?frequency=daily&data[0]=value&facets[series][]=RBRTE"
        "&sort[0][column]=period&sort[0][direction]=desc&length=2")


def measure(ctx: Context) -> Measurement:
    key = ctx.env.get("EIA_API_KEY")
    if not key:
        raise SourceUnavailable("EIA_API_KEY nicht gesetzt")
    data = fetch(f"{BASE}&api_key={key}", client=ctx.client, expect="json")
    rows = data["response"]["data"]
    latest = rows[0]
    comparison = (Comparison(label="prev_day", value=float(rows[1]["value"]))
                  if len(rows) > 1 else None)
    return Measurement(value=float(latest["value"]), as_of=latest["period"],
                       comparison=comparison)


SPEC = AdapterSpec(
    top_id="oil", unit="USD/Barrel", cadence="daily", corridor=(20, 200), max_age_days=7,
    source=SourceMeta(name="U.S. Energy Information Administration (Brent Spot)",
                      url="https://www.eia.gov/opendata/",
                      license="Public Domain (U.S. Government)"),
    measure=measure,
)
