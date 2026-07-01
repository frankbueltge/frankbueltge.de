"""Einmal-Werkzeug: holt EasyPrivacy + DDG-TDS und committet sie als Snapshots.

Listen-Updates sind bewusste, sichtbare Commits (Spec §4) — nie Teil des Wochenlaufs.
Aufruf: pipelines/beifang/.venv/bin/python -m beifang.lists_fetch
"""
from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

DATA_DIR = Path(__file__).resolve().parent / "data"
LISTS_DIR = DATA_DIR / "lists"
EASYPRIVACY_URL = "https://easylist.to/easylist/easyprivacy.txt"
TDS_URL = "https://staticcdn.duckduckgo.com/trackerblocking/v5/current/extension-tds.json"
USER_AGENT = "frankbueltge.de beifang-pipeline (hello@frankbueltge.de)"


def write_snapshot(lists_dir: Path, *, easyprivacy_text: str, tds_text: str, now_iso: str) -> None:
    lists_dir.mkdir(parents=True, exist_ok=True)
    (lists_dir / "easyprivacy.txt").write_text(easyprivacy_text, encoding="utf-8")
    (lists_dir / "tds.json").write_text(tds_text, encoding="utf-8")
    meta = {
        "easyprivacy": {"source_url": EASYPRIVACY_URL, "retrieved_at": now_iso,
                        "sha256": hashlib.sha256(easyprivacy_text.encode()).hexdigest()},
        "tds": {"source_url": TDS_URL, "retrieved_at": now_iso,
                "sha256": hashlib.sha256(tds_text.encode()).hexdigest()},
    }
    (lists_dir / "meta.json").write_text(json.dumps(meta, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> int:
    with httpx.Client(headers={"User-Agent": USER_AGENT}, follow_redirects=True, timeout=60.0) as client:
        ep = client.get(EASYPRIVACY_URL); ep.raise_for_status()
        tds = client.get(TDS_URL); tds.raise_for_status()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    write_snapshot(LISTS_DIR, easyprivacy_text=ep.text, tds_text=tds.text, now_iso=now)
    print(f"geschrieben: {LISTS_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
