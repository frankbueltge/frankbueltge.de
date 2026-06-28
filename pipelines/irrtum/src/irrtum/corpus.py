"""Lädt das committete Protokoll-Archiv zu Zeitreihen je top_id (MVP-Korpus)."""
from __future__ import annotations

import glob
import json
import math
from pathlib import Path


def load_series(archive_dir: Path) -> dict[str, dict[str, float]]:
    series: dict[str, dict[str, float]] = {}
    for f in sorted(glob.glob(str(Path(archive_dir) / "*" / "*.json"))):
        day = json.load(open(f, encoding="utf-8"))
        date = day["date"]
        for e in day.get("entries", []):
            tid, v = e.get("top_id"), e.get("value")
            if tid and isinstance(v, (int, float)) and math.isfinite(v):
                series.setdefault(tid, {})[date] = float(v)
    return series
