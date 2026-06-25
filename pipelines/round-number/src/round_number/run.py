"""Orchestration + IO. Datasets are committed → no network needed at run time."""
from __future__ import annotations

import argparse
import sys
from datetime import date, datetime, timezone
from importlib.resources import files
from pathlib import Path

from round_number.build import analyze_series, day_record, rotation_pick, to_json
from round_number.datasets import load_all


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _default_data_dir() -> Path:
    return Path(str(files("round_number") / "data"))


def run(repo_root: str, *, today: date, data_dir: Path | None = None) -> dict:
    datasets = load_all(data_dir or _default_data_dir())
    results = [analyze_series(ds) for ds in datasets]
    pick = rotation_pick([r["id"] for r in results], today.isoformat())
    return day_record(today.isoformat(), _now_iso(), results, pick)


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
    rec = run(args.repo_root, today=today)
    out_dir = Path(args.repo_root) / "src" / "data" / "round-number"
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = to_json(rec)
    (out_dir / f"{today.isoformat()}.json").write_text(payload, encoding="utf-8")
    (out_dir / "latest.json").write_text(payload, encoding="utf-8")
    print(f"round-number: {len(rec['series'])} series → pick={rec['pick']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
