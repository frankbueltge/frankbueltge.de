"""Pure: normalise a raw GFW gap event, assemble the day record. No IO."""
from __future__ import annotations

import json

from ghost_fleet import PIPELINE_VERSION, SCHEMA_VERSION

GFW_VESSEL = "https://globalfishingwatch.org/vessel/{id}"
SOURCE = {
    "name": "Global Fishing Watch — Events API (AIS gaps)",
    "url": "https://globalfishingwatch.org/our-apis/",
    "license": "GFW non-commercial; attribution required",
}


def _num(x) -> float | None:
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def normalize(raw: dict) -> dict | None:
    """Map a raw GFW gap event to our clean event shape; None if essentials missing."""
    if not isinstance(raw, dict):
        return None
    vessel = raw.get("vessel") or {}
    gap = raw.get("gap") or {}
    vid = vessel.get("id")
    dur = _num(gap.get("durationHours"))
    start, end = raw.get("start"), raw.get("end")
    if not (raw.get("id") and vid and dur is not None and start and end):
        return None
    regions = raw.get("regions") or {}
    off = gap.get("offPosition") or raw.get("position") or {}
    on = gap.get("onPosition") or raw.get("position") or {}
    return {
        "id": raw["id"],
        "vessel": {
            "name": vessel.get("name") or "—",
            "flag": vessel.get("flag") or "—",
            "type": vessel.get("type") or "—",
        },
        "start": start,
        "end": end,
        "duration_hours": round(dur, 1),
        "off": {"lat": off.get("lat"), "lon": off.get("lon")},
        "on": {"lat": on.get("lat"), "lon": on.get("lon")},
        "regions": {
            "mpa": bool(regions.get("mpa")),
            "no_take": bool(regions.get("mpaNoTake")),
            "eez": list(regions.get("eez") or []),
            "high_seas": bool(regions.get("highSeas")),
        },
        "gfw_url": GFW_VESSEL.format(id=vid),
    }


def day_record(
    date_iso: str, generated_at: str, window: dict, index: dict,
    events_top: list[dict], pick: str | None,
) -> dict:
    return {
        "date": date_iso,
        "generated_at": generated_at,
        "schema_version": SCHEMA_VERSION,
        "pipeline_version": PIPELINE_VERSION,
        "window": window,
        "index": index,
        "pick": pick,
        "events": events_top,
        "source": SOURCE,
    }


def to_json(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
