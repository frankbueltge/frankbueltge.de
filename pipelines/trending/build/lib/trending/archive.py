"""Reading the committed archive: earlier day files feed novelty and memory."""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from trending.model import CONTRACT_DAY

DAY_FILE = re.compile(r"^\d{4}-\d{2}-\d{2}\.json$")


def trending_dir(repo_root: str | Path) -> Path:
    return Path(repo_root) / "src" / "data" / "trending"


def load_days(repo_root: str | Path, before: date, n: int = 30) -> list[dict[str, Any]]:
    """The last `n` committed day records dated strictly before `before`, oldest first."""
    folder = trending_dir(repo_root)
    if not folder.is_dir():
        return []
    files = sorted(p for p in folder.iterdir()
                   if DAY_FILE.match(p.name) and p.stem < before.isoformat())
    days: list[dict[str, Any]] = []
    for path in files[-n:]:
        try:
            rec = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(rec, dict) and rec.get("$contract") == CONTRACT_DAY:
            days.append(rec)
    return days


def wikipedia_presence(days: list[dict[str, Any]], lang: str) -> Counter[str]:
    """How many of the given days listed each article (underscore form) for `lang`."""
    presence: Counter[str] = Counter()
    for day in days:
        seen: set[str] = set()
        for sig in day.get("signals", {}).get("wikipedia", []):
            if sig.get("geo") != lang:
                continue
            article = (sig.get("meta") or {}).get("article") or sig.get("label", "").replace(" ", "_")
            if article:
                seen.add(article)
        presence.update(seen)
    return presence
