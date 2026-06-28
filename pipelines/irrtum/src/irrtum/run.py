"""CLI: führt eine Forschungssitzung am Protokoll-Korpus aus und schreibt das Record."""
from __future__ import annotations

import argparse
import os
import sys
from datetime import date, timezone
from pathlib import Path

import httpx

from irrtum.corpus import load_series
from irrtum.session import run_session, session_to_json


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args(argv)

    root = Path(args.repo_root)
    today = args.date or date.today().isoformat()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY/GOOGLE_API_KEY nicht gesetzt", file=sys.stderr)
        return 2

    series = load_series(root / "src" / "content" / "protokoll")
    with httpx.Client() as client:
        session = run_session(series, today, client=client, api_key=api_key)
    if session is None:
        print("kein Finding (zu wenig Überlappung) — Sitzung entfällt", file=sys.stderr)
        return 1

    out = root / "src" / "data" / "irrtum"
    out.mkdir(parents=True, exist_ok=True)
    payload = session_to_json(session)
    (out / f"{today}.json").write_text(payload, encoding="utf-8")
    (out / "latest.json").write_text(payload, encoding="utf-8")
    print(f"geschrieben: src/data/irrtum/{today}.json — verdict={session.verdict}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
