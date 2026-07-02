"""CLI: python -m beifang.run --repo-root PATH [--date YYYY-MM-DD] [--limit N]

Schreibt src/content/beifang/<jahr>/<datum>.json ins lokale Checkout.
Committen macht der Workflow-Step (Identität „Gegenmessung") — Muster der Linie.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from beifang.assemble import assemble_run, load_previous, site_result, utc_now_iso
from beifang.capture import capture_page, detect_blocked
from beifang.classify import classify, parse_easyprivacy, parse_tds, registrable_domain
from beifang.lists_fetch import LISTS_DIR
from beifang.model import ListMeta, run_record_to_json
from beifang.panel import load_panel


def content_path(date_iso: str) -> str:
    return f"src/content/beifang/{date_iso[:4]}/{date_iso}.json"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--date", default=None, help="YYYY-MM-DD (Default: heute UTC)")
    p.add_argument("--repo-root", required=True)
    p.add_argument("--limit", type=int, default=0, help="nur die ersten N Panel-Einträge (lokaler Test)")
    p.add_argument("--vantage", default="github-actions",
                   help="Messstandpunkt-Label (Spec §5): github-actions | vps | …")
    p.add_argument("--proxy", default=None, help="optional: Proxy-URL für den Vantage")
    args = p.parse_args(argv)
    date_iso = args.date or datetime.now(timezone.utc).date().isoformat()
    root = Path(args.repo_root)

    panel = load_panel()
    easyprivacy = parse_easyprivacy((LISTS_DIR / "easyprivacy.txt").read_text(encoding="utf-8"))
    tds = parse_tds(json.loads((LISTS_DIR / "tds.json").read_text(encoding="utf-8")))
    lists_meta = {k: ListMeta(**v)
                  for k, v in json.loads((LISTS_DIR / "meta.json").read_text(encoding="utf-8")).items()}

    entries = panel["entries"][: args.limit or None]
    results = []
    for entry in entries:
        retrieved_at = utc_now_iso()
        try:
            raw = capture_page(entry["url"], proxy=args.proxy)
        except Exception as exc:
            results.append(site_result(entry, retrieved_at=retrieved_at,
                                       note=f"{type(exc).__name__}: {exc}"[:200]))
            print(f"  {entry['id']}: FEHLER {type(exc).__name__}", file=sys.stderr)
            continue
        host = urlsplit(raw.final_url).hostname or ""
        if not host:  # Navigation gescheitert (u. a. about:blank) — keine Quelle erreicht
            note = raw.goto_error or "navigation-failed"
            results.append(site_result(entry, retrieved_at=retrieved_at, note=note))
            print(f"  {entry['id']}: FEHLER Navigation gescheitert ({note})", file=sys.stderr)
            continue
        goto_note = f"goto: {raw.goto_error}"[:200] if raw.goto_error else None
        blocked = detect_blocked(raw.http_status, raw.page_title)
        if blocked is not None:
            results.append(site_result(entry, retrieved_at=retrieved_at, raw=raw, blocked=blocked,
                                       note=goto_note))
            print(f"  {entry['id']}: BLOCKIERT ({blocked.type} {blocked.marker})", file=sys.stderr)
            continue
        first_party = registrable_domain(host)
        cls = classify(first_party, (r.host for r in raw.requests), easyprivacy, tds)
        results.append(site_result(entry, retrieved_at=retrieved_at, raw=raw, cls=cls,
                                   note=goto_note, identity=entry.get("identity"), tds=tds))
        print(f"  {entry['id']}: {len(cls.tracker_hosts)} Tracker-Hosts, "
              f"{len(cls.entities)} Firmen")

    previous = load_previous(root, before=date_iso)
    runner = "github-actions" if os.environ.get("GITHUB_ACTIONS") == "true" else "lokal"
    record = assemble_run(date_iso=date_iso, panel_version=panel["version"], runner=runner,
                          vantage=args.vantage, results=results, lists=lists_meta, previous=previous)
    target = root / content_path(date_iso)
    if target.exists():
        print(f"{target} existiert bereits — Archiv unantastbar, kein Overwrite "
              f"(Lauf übersprungen).", file=sys.stderr)
        return 0
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(run_record_to_json(record), encoding="utf-8")
    print(f"geschrieben: {target}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
