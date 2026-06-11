"""TOP Erdbewegung — USGS, Beben >= M4.5 der letzten 24 h."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Measurement, SourceMeta

URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"


def measure(ctx: Context) -> Measurement:
    data = fetch(URL, client=ctx.client, expect="json")
    return Measurement(value=float(data["metadata"]["count"]), as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="quakes", unit="Beben", cadence="realtime", corridor=(0, 200), max_age_days=None,
    source=SourceMeta(name="USGS Earthquake Hazards Program", url=URL,
                      license="Public Domain (U.S. Government)"),
    measure=measure,
)
