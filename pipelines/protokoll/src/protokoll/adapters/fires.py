"""TOP Feuer — NASA FIRMS, aktive Branddetektionen (VIIRS S-NPP), letzte 24 h."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable, fetch
from protokoll.model import Measurement, SourceMeta

BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"


def measure(ctx: Context) -> Measurement:
    key = ctx.env.get("FIRMS_MAP_KEY")
    if not key:
        raise SourceUnavailable("FIRMS_MAP_KEY nicht gesetzt")
    text = fetch(f"{BASE}/{key}/VIIRS_SNPP_NRT/world/1", client=ctx.client)
    count = max(0, len([l for l in text.splitlines() if l.strip()]) - 1)  # minus Header
    return Measurement(value=float(count), as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="fires", unit="Detektionen", cadence="daily", corridor=(0, 500_000), max_age_days=None,
    source=SourceMeta(name="NASA FIRMS (VIIRS S-NPP, Near-Real-Time)",
                      url="https://firms.modaps.eosdis.nasa.gov/",
                      license="NASA: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
