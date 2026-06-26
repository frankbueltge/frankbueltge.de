"""Resolve GFW EEZ ids to names via a committed Marine Regions lookup.

GFW's `regions.eez` ids ARE Marine Regions MRGIDs (verified). The lookup
(data/eez_names.json) is fetched once and committed — Git is the archive, no
runtime dependency on Marine Regions.
"""
from __future__ import annotations

import json
from importlib.resources import files

_NAMES: dict[str, str] = json.loads(
    (files("ghost_fleet") / "data" / "eez_names.json").read_text(encoding="utf-8")
)


def name_for(eez_ids: list[str]) -> str | None:
    """Name of the first resolvable EEZ id, or None."""
    for i in eez_ids:
        n = _NAMES.get(str(i))
        if n:
            return n
    return None
