"""Registry in Tagesordnungs-Reihenfolge (TOP 1-12; Meereis hat zwei Messwerte)."""
from protokoll.adapters import (attention, co2, conflict, fires, food, oil,
                                population, quakes, rates, refugees, seaice, sst)

ALL_SPECS = [
    co2.SPEC,
    seaice.SPEC_NORTH, seaice.SPEC_SOUTH,
    sst.SPEC,
    fires.SPEC,
    quakes.SPEC,
    population.SPEC,
    refugees.SPEC,
    food.SPEC,
    rates.SPEC,
    oil.SPEC,
    conflict.SPEC,
    attention.SPEC,
]

# AMENDMENT: doppelte IDs würden im Archiv-JSON stillschweigend kollidieren — laut scheitern.
_ids = [s.top_id for s in ALL_SPECS]
assert len(_ids) == len(set(_ids)), f"doppelte top_ids in Registry: {_ids}"
