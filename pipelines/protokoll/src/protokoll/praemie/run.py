"""CLI: python -m protokoll.praemie.run [--date] (--dry-run --repo-root | Commit).
Nächtlich: Prämie, Schadenverlauf, laufende Regulierung, Rückzug — eine kanonische Police."""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from protokoll.github_commit import commit_file
from protokoll.praemie import PIPELINE_VERSION, SCHEMA_VERSION
from protokoll.praemie.bls import fetch_premium
from protokoll.praemie.claims import fetch_claims
from protokoll.praemie.disasters import fetch_disasters
from protokoll.praemie.retreat import retreat

USER_AGENT = "frankbueltge.de werkgruppe praemie (hello@frankbueltge.de)"
OUT_PATH = "src/data/praemie/police.json"


def _section(fn) -> dict[str, Any]:
    # Jede Quelle einzeln gekapselt: ein Ausfall darf die Police nicht töten.
    try:
        return fn()
    except Exception as exc:  # noqa: BLE001 — bewusst alles fangen, Vermerk statt Absturz
        return {"error": str(exc)[:200]}


def build_police(client: httpx.Client, today: str) -> dict[str, Any]:
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "schema_version": SCHEMA_VERSION,
        "pipeline_version": PIPELINE_VERSION,
        "premium": _section(lambda: fetch_premium(client)),
        "disasters": _section(lambda: fetch_disasters(client)),
        "claims": _section(lambda: fetch_claims(client)),
        "retreat": _section(retreat),
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--repo-root", default=None)
    args = p.parse_args(argv)
    today = args.date or datetime.now(timezone.utc).date().isoformat()
    try:
        datetime.strptime(today, "%Y-%m-%d")
    except ValueError:
        p.error(f"ungültiges Datum: {today!r} (erwartet YYYY-MM-DD)")

    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        police = build_police(client, today)
        # Degenerat-Guard: ohne Schlagzeile (die Prämie) keine Police —
        # lieber die gestrige behalten, als eine kopflose committen.
        if "error" in police["premium"]:
            print(f"Abbruch: Prämie nicht berechenbar ({police['premium']['error']}) — "
                  "Police wird nicht ersetzt.", file=sys.stderr)
            return 1
        payload = json.dumps(police, ensure_ascii=False, indent=1, sort_keys=True,
                             allow_nan=False) + "\n"
        if args.dry_run:
            if not args.repo_root:
                p.error("--dry-run braucht --repo-root")
            target = Path(args.repo_root) / OUT_PATH
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(payload, encoding="utf-8")
            print(f"geschrieben: {target}")
        else:
            sha = commit_file(
                repo=os.environ.get("GITHUB_REPO", "frankbueltge/frankbueltge.de"),
                path=OUT_PATH, content=payload,
                message=f"prämie: Police vom {today}",
                token=os.environ["GITHUB_TOKEN"], client=client,
            )
            print(f"committet: {OUT_PATH} @ {sha}")

    prem = police["premium"]
    print(f"Prämie {prem.get('index')} Punkte (+{prem.get('change_pct_since_base')} % "
          f"seit {prem.get('base_year')}) — Police {today}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
