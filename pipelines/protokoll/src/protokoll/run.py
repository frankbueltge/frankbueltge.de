"""CLI: python -m protokoll.run [--date YYYY-MM-DD] (--dry-run --repo-root PATH | Commit via GitHub)."""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from protokoll.adapters import ALL_SPECS
from protokoll.adapters.base import Context
from protokoll.assemble import assemble
from protokoll.github_commit import commit_file
from protokoll.model import day_record_to_json

USER_AGENT = "frankbueltge.de protokoll-pipeline (hello@frankbueltge.de)"


def _default_bq_factory():
    from google.cloud import bigquery
    return bigquery.Client()


def _bq_factory_or_none():
    try:
        import google.cloud.bigquery  # noqa: F401
        return _default_bq_factory
    except ImportError:
        return None


def content_path(date_iso: str) -> str:
    return f"src/content/protokoll/{date_iso[:4]}/{date_iso}.json"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--repo-root", default=None, help="für --dry-run: Repo-Wurzel")
    args = p.parse_args(argv)

    date_iso = args.date or datetime.now(timezone.utc).date().isoformat()
    ctx = Context(
        client=httpx.Client(headers={"User-Agent": USER_AGENT}),
        today=datetime.strptime(date_iso, "%Y-%m-%d").date(),
        env=os.environ,
        bq_client_factory=_bq_factory_or_none(),
    )
    record = assemble(ALL_SPECS, ctx, date_iso)
    payload = day_record_to_json(record)
    path = content_path(date_iso)

    if args.dry_run:
        if not args.repo_root:
            p.error("--dry-run braucht --repo-root")
        target = Path(args.repo_root) / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(payload, encoding="utf-8")
        print(f"geschrieben: {target}")
    else:
        sha = commit_file(
            repo=os.environ.get("GITHUB_REPO", "frankbueltge/frankbueltge.de"),
            path=path, content=payload,
            message=f"protokoll: Sitzung vom {date_iso}",
            token=os.environ["GITHUB_TOKEN"], client=ctx.client,
        )
        print(f"committet: {path} @ {sha}")

    unavailable = [e.top_id for e in record.entries if e.status != "ok"]
    if unavailable:
        print(f"Hinweis — nicht ok: {', '.join(unavailable)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
