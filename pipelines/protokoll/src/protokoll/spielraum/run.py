"""CLI: python -m protokoll.spielraum.run --repo-root . [--date] [--dry-run] [--summary-out].

Monatlich: prüft die Watchlist-Landingpages auf Neues, schreibt watch.json lokal (den
Commit macht der Workflow — es gibt hier KEINEN REST-Commit-Pfad wie bei Prämie/Protokoll)
und optional eine Zusammenfassung für den Issue-Schritt. Parst KEINE PDFs, schreibt NIE
ans Daten-Register — ein verifizierter Ingest passiert später manuell in einer Session.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from protokoll.fetch import SourceUnavailable, fetch
from protokoll.spielraum import SCHEMA_VERSION
from protokoll.spielraum.diff import FetchResult, WatchOutcome, compare
from protokoll.spielraum.fingerprint import extract_fingerprint
from protokoll.spielraum.sources import WATCHLIST, WatchSource

USER_AGENT = "frankbueltge.de werkgruppe spielraum (hello@frankbueltge.de)"
OUT_PATH = "src/data/spielraum/watch.json"


def _load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _fetch_one(source: WatchSource, client: httpx.Client) -> FetchResult:
    # Eine tote Landingpage darf den Lauf nie killen — pro Quelle isoliert gefangen.
    try:
        html = fetch(source.url, client=client, expect="text")
    except SourceUnavailable as exc:
        return FetchResult(source=source, ok=False, error=str(exc)[:200])
    matches, fingerprint = extract_fingerprint(html)
    return FetchResult(source=source, ok=True, matches=tuple(matches), fingerprint=fingerprint)


def run(client: httpx.Client, today: str, old_state: dict[str, Any]) -> tuple[dict, WatchOutcome]:
    results = [_fetch_one(s, client) for s in WATCHLIST]
    outcome = compare(old_state, results, today)
    new_state = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "schema_version": SCHEMA_VERSION,
        "sources": outcome.sources,
    }
    return new_state, outcome


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=1, sort_keys=True,
                       allow_nan=False) + "\n"
    path.write_text(text, encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    # Kein separater Effekt: es gibt keinen Commit-Pfad hier (der Workflow committet
    # watch.json), das Schreiben nach --repo-root passiert immer lokal. Flag nur der
    # CLI-Konsistenz mit praemie/run.py wegen vorhanden.
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--repo-root", required=True)
    p.add_argument("--summary-out", default=None, help="Pfad für die Issue-Zusammenfassung (JSON)")
    args = p.parse_args(argv)

    today = args.date or datetime.now(timezone.utc).date().isoformat()
    try:
        datetime.strptime(today, "%Y-%m-%d")
    except ValueError:
        p.error(f"ungültiges Datum: {today!r} (erwartet YYYY-MM-DD)")

    repo_root = Path(args.repo_root)
    state_path = repo_root / OUT_PATH

    try:
        old_state = _load_state(state_path)
        with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
            new_state, outcome = run(client, today, old_state)

        _write_json(state_path, new_state)
        print(f"geschrieben: {state_path}")

        if args.summary_out:
            summary = {
                "issue_needed": outcome.issue_needed,
                "title": outcome.title,
                "body": outcome.body,
                "changed": outcome.changed,
                "unreachable": outcome.unreachable,
            }
            summary_path = Path(args.summary_out)
            _write_json(summary_path, summary)
            print(f"geschrieben: {summary_path}")
    except Exception as exc:  # noqa: BLE001 — interner Fehler; Quellen-Ausfälle sind hier schon abgefangen
        print(f"Abbruch: {exc}", file=sys.stderr)
        return 1

    print(f"Spielraum-Watch {today}: {len(outcome.changed)} geändert, "
          f"{len(outcome.unreachable)} unreachable (>= 2 Monate in Folge), "
          f"issue_needed={outcome.issue_needed}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
