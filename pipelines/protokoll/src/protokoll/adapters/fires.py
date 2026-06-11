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
    # FIRMS liefert Fehlermeldungen ("Invalid MAP_KEY.") mit HTTP 200 — Header prüfen,
    # sonst würde ein Fehlertext still als "0 Brände weltweit" archiviert.
    if not text.lower().startswith("latitude"):
        raise SourceUnavailable(f"FIRMS: unerwarteter Antwortkörper: {text[:120]!r}")
    count = sum(1 for line in text.splitlines() if line.strip()) - 1
    return Measurement(value=float(count), as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="fires", unit="Detektionen", cadence="daily", corridor=(1_000, 500_000), max_age_days=None,
    source=SourceMeta(name="NASA FIRMS (VIIRS S-NPP, Near-Real-Time)",
                      url="https://firms.modaps.eosdis.nasa.gov/",
                      license="NASA: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
