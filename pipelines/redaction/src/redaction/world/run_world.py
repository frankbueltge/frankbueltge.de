"""Orchestration + IO for the world chamber. Each section fails honestly and
alone (mirrors chamber 1's fault isolation) — the day is always written.

Nightly shape, on run day R:
  1. GDG: yesterday's (R−1) status counts + en title rewrites → classified
     register. Needs `bq` + the house project; degrades to available:false.
  2. Sample: draw and commit the pool-day R−1 manifest (skipped if committed —
     receipts are immutable).
  3. Recheck: the pool-day R−2 manifest (committed last night, articles
     ~29–53 h old) → deletion rates with CI + receipts.
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from json import loads
from pathlib import Path

import httpx

from redaction.world import SAMPLE_SIZE, SAMPLE_STEP_MINUTES, gdg, recheck, sample
from redaction.world.build_world import classify_rows, day_record, gdg_section, to_json


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def run(
    repo_root: str,
    *,
    run_day: datetime,
    project: str = gdg.DEFAULT_PROJECT,
    sample_size: int = SAMPLE_SIZE,
    step_minutes: int = SAMPLE_STEP_MINUTES,
    skip_gdg: bool = False,
    skip_sample: bool = False,
    skip_recheck: bool = False,
) -> dict:
    root = Path(repo_root)
    world_dir = root / "src" / "data" / "redaction" / "world"
    samples_dir = world_dir / "samples"
    samples_dir.mkdir(parents=True, exist_ok=True)

    day = run_day.date()
    gdg_day = (day - timedelta(days=1)).isoformat()
    pool_day = (day - timedelta(days=1)).isoformat()
    recheck_day = (day - timedelta(days=2)).isoformat()

    # 1 — the world's rewrites, yesterday.
    if skip_gdg:
        gdg_result = gdg.GdgResult(False, gdg_day, note="skipped by flag")
    else:
        gdg_result = gdg.fetch_day(gdg_day, project=project)
    classified = classify_rows(gdg_result.rows) if gdg_result.available else []

    # 2 — commit tonight's sample (tomorrow night's receipt).
    sample_path = samples_dir / f"{pool_day}.json"
    sample_committed: str | None = None
    if skip_sample:
        pass
    elif sample_path.exists():
        sample_committed = str(sample_path.relative_to(root))
    else:
        try:
            manifest = sample.draw(pool_day, size=sample_size, step_minutes=step_minutes)
            sample_path.write_text(to_json(manifest), encoding="utf-8")
            sample_committed = str(sample_path.relative_to(root))
        except Exception as e:  # noqa: BLE001 — deliberate fault isolation
            print(f"world: sample draw failed: {e}", file=sys.stderr)

    # 3 — recheck the sample committed last night.
    recheck_path = samples_dir / f"{recheck_day}.json"
    if skip_recheck:
        deletion = {"available": False, "note": "skipped by flag"}
    elif not recheck_path.exists():
        deletion = {
            "available": False,
            "note": f"no committed sample for {recheck_day} — the rate begins "
                    "after two nightly runs",
        }
    else:
        try:
            manifest = loads(recheck_path.read_text(encoding="utf-8"))
            with httpx.Client(headers={"User-Agent": recheck.USER_AGENT}) as client:
                results = recheck.recheck(manifest["items"], client=client)
            deletion = recheck.summarize(results, sample_manifest=manifest)
        except Exception as e:  # noqa: BLE001 — deliberate fault isolation
            deletion = {"available": False, "note": f"recheck failed: {e}"}

    return day_record(
        day.isoformat(),
        _now_iso(),
        gdg=gdg_section(gdg_result, classified),
        deletion=deletion,
        sample_committed=sample_committed,
    )


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None, help="YYYY-MM-DD run day (default: today UTC)")
    p.add_argument("--project", default=gdg.DEFAULT_PROJECT)
    p.add_argument("--sample-size", type=int, default=SAMPLE_SIZE)
    p.add_argument("--step-minutes", type=int, default=SAMPLE_STEP_MINUTES)
    p.add_argument("--skip-gdg", action="store_true")
    p.add_argument("--skip-sample", action="store_true")
    p.add_argument("--skip-recheck", action="store_true")
    args = p.parse_args(argv)

    run_day = (
        datetime.strptime(args.date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        if args.date
        else datetime.now(timezone.utc)
    )
    rec = run(
        args.repo_root,
        run_day=run_day,
        project=args.project,
        sample_size=args.sample_size,
        step_minutes=args.step_minutes,
        skip_gdg=args.skip_gdg,
        skip_sample=args.skip_sample,
        skip_recheck=args.skip_recheck,
    )

    world_dir = Path(args.repo_root) / "src" / "data" / "redaction" / "world"
    payload = to_json(rec)
    (world_dir / f"{rec['date']}.json").write_text(payload, encoding="utf-8")
    (world_dir / "latest.json").write_text(payload, encoding="utf-8")

    g, d = rec["gdg"], rec["deletion"]
    print(
        "world: gdg="
        + (f"{g['title_changes_en']} en title changes, {g['classes']['reframing']} reframings"
           if g["available"] else f"unavailable ({g.get('note')})")
        + " · deletion="
        + (f"{d['gone']}/{d['decided']} gone, 451={d['legal_451']}"
           if d.get("available") else f"unavailable ({d.get('note')})")
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
