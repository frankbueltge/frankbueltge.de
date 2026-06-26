"""Orchestration + IO. Needs GFW_TOKEN at run time (first instrument with a
runtime API key). Datasets are remote; the day record is committed."""
from __future__ import annotations

import argparse
import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import httpx

from ghost_fleet import build, select
from ghost_fleet.gfw import fetch_gaps

USER_AGENT = "frankbueltge.de ghost-fleet-pipeline (hello@frankbueltge.de)"
QUERY_DAYS = 10
CAP = 1500
TOP_N = 12


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def run(*, client: httpx.Client, token: str, today: date) -> dict:
    start = (today - timedelta(days=QUERY_DAYS)).isoformat()
    end = today.isoformat()
    raw, total = fetch_gaps(token, client=client, start=start, end=end, cap=CAP)
    norm = [n for n in (build.normalize(r) for r in raw) if n]
    filtered = [e for e in norm if select.ended_within(e, today) and select.plausible(e)]
    idx = select.index(filtered, total)  # honest counts over ALL examined
    # The case + the displayed list use named vessels only (an anonymous gap is a
    # weak forensic case); the index above still counts every examined disappearance.
    named = [e for e in filtered if e["vessel"]["name"] != "—"]
    pick = select.rank(named)
    top = sorted(named, key=lambda e: (-select.salience(e), e["id"]))[:TOP_N]
    window = {
        "from": start, "to": end, "ended_within_days": select.WINDOW_DAYS,
        "examined": len(filtered), "capped": len(raw) >= CAP,
    }
    return build.day_record(today.isoformat(), _now_iso(), window, idx, top, pick)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    args = p.parse_args(argv)
    token = os.environ.get("GFW_TOKEN")
    if not token:
        print("GFW_TOKEN nicht gesetzt — Feststellung entfällt.", file=sys.stderr)
        return 2
    today = (datetime.strptime(args.date, "%Y-%m-%d").date()
             if args.date else datetime.now(timezone.utc).date())
    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        rec = run(client=client, token=token, today=today)
    out = Path(args.repo_root) / "src" / "data" / "ghost-fleet"
    out.mkdir(parents=True, exist_ok=True)
    payload = build.to_json(rec)
    (out / f"{today.isoformat()}.json").write_text(payload, encoding="utf-8")
    (out / "latest.json").write_text(payload, encoding="utf-8")
    print(f"ghost-fleet: total={rec['index']['total']} examined={rec['window']['examined']} "
          f"pick={rec['pick']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
