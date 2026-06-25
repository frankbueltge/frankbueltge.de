"""Orchestration + IO. Per-item failures become honest skips, never a crash
(mirrors protokoll/assemble.py fault-isolation). The day is always written."""
from __future__ import annotations

import argparse
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path

import httpx

from redaction import extract, salience, textdiff
from redaction.build import day_record, make_redaction, to_json
from redaction.cdx import captures, classify, snapshot_url
from redaction.watchlist import WATCHLIST, WatchItem

USER_AGENT = "frankbueltge.de redaction-pipeline (hello@frankbueltge.de)"
PAUSE = 0.6  # gentle on the Wayback API


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _fetch_text(url: str, *, client: httpx.Client) -> str:
    return client.get(url, timeout=30.0, follow_redirects=True).text


def _one(item: WatchItem, *, client: httpx.Client) -> dict | None:
    caps = captures(item.url, client=client)
    kind, before_cap, after_cap = classify(caps)
    if kind == "none" or before_cap is None or after_cap is None:
        return None

    if kind == "deletion":
        before_text = extract.main_text(_fetch_text(snapshot_url(before_cap.timestamp, item.url),
                                                     client=client))
        removal = textdiff.Removal(passages=[], tokens=len(before_text.split()))
        sal = salience.score(before_text)
        return make_redaction(item, kind, before_cap, after_cap, removal, sal, item.url)

    # removal
    before_text = extract.main_text(_fetch_text(snapshot_url(before_cap.timestamp, item.url),
                                                client=client))
    after_text = extract.main_text(_fetch_text(snapshot_url(after_cap.timestamp, item.url),
                                               client=client))
    rem = textdiff.removed(before_text, after_text)
    if rem.tokens == 0:
        return None
    sal = salience.score(" ".join(rem.passages))
    return make_redaction(item, kind, before_cap, after_cap, rem, sal, item.url)


def run(
    repo_root: str,
    *,
    client: httpx.Client,
    today: date,
    watchlist: list[WatchItem] = WATCHLIST,
    pause: float = 0.0,
) -> dict:
    redactions: list[dict] = []
    for item in watchlist:
        try:
            r = _one(item, client=client)
            if r is not None:
                redactions.append(r)
        except Exception:  # noqa: BLE001 — deliberate fault isolation
            continue
        if pause:
            time.sleep(pause)
    return day_record(today.isoformat(), _now_iso(), redactions, watched_count=len(watchlist))


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    args = p.parse_args(argv)
    today = (
        datetime.strptime(args.date, "%Y-%m-%d").date()
        if args.date
        else datetime.now(timezone.utc).date()
    )
    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        rec = run(args.repo_root, client=client, today=today, pause=PAUSE)

    out_dir = Path(args.repo_root) / "src" / "data" / "redaction"
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = to_json(rec)
    (out_dir / f"{today.isoformat()}.json").write_text(payload, encoding="utf-8")
    (out_dir / "latest.json").write_text(payload, encoding="utf-8")
    print(
        f"redaction: {rec['changed_count']} change(s) of {rec['watched_count']} watched "
        f"→ pick={rec['pick']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
