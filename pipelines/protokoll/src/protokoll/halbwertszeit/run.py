"""CLI: python -m protokoll.halbwertszeit.run [--date] (--dry-run --repo-root | Commit).
Nächtlich: Register per Wikidata-Regel, Aufmerksamkeit per REST, Fit, eine kanonische Datei."""
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
from protokoll.halbwertszeit import DEATHS_MIN, LANGS, REGISTER_START
from protokoll.halbwertszeit.fit import fit_series
from protokoll.halbwertszeit.pageviews import fetch_event_series
from protokoll.halbwertszeit.wikidata import fetch_events

USER_AGENT = "frankbueltge.de werkgruppe halbwertszeit (hello@frankbueltge.de)"
OUT_PATH = "src/data/halbwertszeit/register.json"


def build_register(client: httpx.Client, today: str) -> dict[str, Any]:
    events = fetch_events(client)
    entries: list[dict[str, Any]] = []
    for qid, e in sorted(events.items(), key=lambda kv: (kv[1]["date"], kv[0])):
        series, failed = fetch_event_series(client, e["titles"], e["date"], today)
        base = {
            "qid": qid, "label_de": e["label_de"], "label_en": e["label_en"],
            "date": e["date"], "deaths": e["deaths"],
            "languages": sorted(e["titles"]), "languages_failed": failed,
        }
        if not series:
            entries.append({**base, "peak": 0, "peak_day": None, "baseline": 0,
                            "lambda_per_day": None, "halflife_days": None, "r2": None,
                            "status": "nicht_messbar", "views_per_death": 0.0, "series": []})
            continue
        f = fit_series(series, today=today)
        measured_only = f.status == "gemessen"  # vorläufige Fits nie als Messung archivieren
        entries.append({**base, "peak": f.peak, "peak_day": f.peak_day, "baseline": f.baseline,
                        "lambda_per_day": f.lambda_per_day if measured_only else None,
                        "halflife_days": f.halflife_days if measured_only else None,
                        "r2": f.r2, "status": f.status,
                        "views_per_death": round(f.peak / e["deaths"], 1),
                        "series": [[d, v] for d, v in series]})
    measured = sorted(x["halflife_days"] for x in entries if x["status"] == "gemessen")
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rule": {"deaths_min": DEATHS_MIN, "since": REGISTER_START, "langs": list(LANGS)},
        "median_halflife_days": _median(measured),
        "events": entries,
    }


def _median(xs: list[float]) -> float | None:
    if not xs:
        return None
    n, m = len(xs), len(xs) // 2
    return round(xs[m] if n % 2 else (xs[m - 1] + xs[m]) / 2, 2)


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
        register = build_register(client, today)
        # Degenerat-Guard: lieber das gestrige Register behalten als ein leeres committen
        # (z. B. bei Wikimedia-API-Ausfall, den fetch_event_series je Sprache toleriert).
        if register["events"] and all(e["peak"] == 0 for e in register["events"]):
            print("Abbruch: alle Serien leer — Quelle gestört, Register wird nicht ersetzt.",
                  file=sys.stderr)
            return 1
        payload = json.dumps(register, ensure_ascii=False, indent=1, sort_keys=True,
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
                message=f"halbwertszeit: Messung vom {today}",
                token=os.environ["GITHUB_TOKEN"], client=client,
            )
            print(f"committet: {OUT_PATH} @ {sha}")

    n = len(register["events"])
    by_status = {}
    for e in register["events"]:
        by_status[e["status"]] = by_status.get(e["status"], 0) + 1
    print(f"{n} Ereignisse — {by_status} — Median {register['median_halflife_days']} Tage",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
