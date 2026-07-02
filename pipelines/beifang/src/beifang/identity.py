"""Einmal-Werkzeug: reichert das Panel um die Leseidentität je Eintrag an (Crossref → Titel/
Schlagwörter). Änderungen am Panel sind bewusste, committete Edits (wie panel.py/lists_fetch.py).
Aufruf: pipelines/beifang/.venv/bin/python -m beifang.identity
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from beifang.panel import PANEL_PATH, load_panel

API = "https://api.crossref.org"
USER_AGENT = "frankbueltge.de beifang-pipeline (hello@frankbueltge.de)"


def build_identity(doi: str | None, work: dict | None) -> dict:
    work = work or {}
    titles = work.get("title") or []
    titel = titles[0] if titles else None
    keywords = [s for s in (work.get("subject") or []) if s]
    return {"doi": doi, "titel": titel, "keywords": keywords}


def _fetch_work(client: httpx.Client, doi: str) -> dict | None:
    r = client.get(f"{API}/works/{doi}")
    if r.status_code != 200:
        return None
    return r.json().get("message")


def main() -> int:
    panel = load_panel()
    today = datetime.now(timezone.utc).date().isoformat()
    with httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=45.0,
                      follow_redirects=True) as client:
        for e in panel["entries"]:
            doi = e.get("doi")
            work = _fetch_work(client, doi) if doi else None
            e["identity"] = build_identity(doi, work)
            print(f"{e['id']:28s} {'ok' if e['identity']['titel'] else '— (kein Titel)'}")
    panel.setdefault("log", []).append(f"identity via Crossref {today}")
    PANEL_PATH.write_text(json.dumps(panel, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                          encoding="utf-8")
    print(f"\ngeschrieben: {PANEL_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
