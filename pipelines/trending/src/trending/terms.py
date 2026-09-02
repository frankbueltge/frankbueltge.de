"""The arcs record — one file per run day, contract `trending-terms/1`.

The day file (`trending-day/1`) holds what converged this morning. This one holds the slower
movement: for every term on the editorially maintained watchlist, how often six platforms
mentioned it in the last one, seven and thirty days, with receipts; and beside it the phrases
discovery proposes but nobody tracks yet.

The record is assembled, never written about: `tracker` counts, `discover` proposes, this
module only puts the two into the shape the site reads. A term is on the watchlist because a
human wrote it there; the machine's proposals stay in `candidates` until someone does.
"""
from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Sequence
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from trending.data import load_json
from trending.discover import Discovery, discover
from trending.model import to_json
from trending.quality import assess_terms, one_line
from trending import watchlist as wl
from trending.normalize import slug as slugify
from trending.tracker import (CONTRACT_TERMS, PLATFORMS, WINDOWS, TermContext, first_seen_for,
                              history_first_seen, iso_z, load_terms_files, make_context,
                              merge_receipts, open_client, ratio, status, terms_dir, track,
                              unavailable_report)

# The arcs are their own method on top of the day pipeline, and say so in the record: the
# day file stays at the version the package carries, this file names the second method.
TERMS_PIPELINE_VERSION = "0.2.0"
TERMS_METHOD_VERSION = "2"

STATUSES = ("emerging", "rising", "established", "fading", "quiet")
COUNTED = tuple(p for p in PLATFORMS if p != "wikipedia_views")
ZERO = {"d1": 0, "d7": 0, "d30": 0, "capped": False}


def load_watchlist() -> list[dict[str, Any]]:
    """The seed list as shipped in the package. The live list lives in the repository and is
    read through `watchlist.load`; this remains for the first run of a fresh checkout and for
    tests that need a list without a repository."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in load_json("watchlist.json"):
        term = " ".join(str(raw.get("term") or "").split())
        if not term:
            continue
        entry_slug = str(raw.get("slug") or "").strip() or slugify(term)
        if entry_slug in seen:
            continue
        seen.add(entry_slug)
        aliases = [" ".join(str(a).split()) for a in (raw.get("aliases") or [])]
        out.append({
            "term": term,
            "slug": entry_slug,
            "aliases": [a for a in aliases if a],
            "added": str(raw.get("added") or ""),
            "origin": "discovered" if raw.get("origin") == "discovered" else "editorial",
            "note": str(raw.get("note") or "")[:160],
            "wikipedia_article": (str(raw["wikipedia_article"])
                                  if raw.get("wikipedia_article") else None),
        })
    return out


def _summary(terms: Sequence[dict[str, Any]], candidates: Sequence[dict[str, Any]],
             ) -> dict[str, Any]:
    by_status = {s: 0 for s in STATUSES}
    for term in terms:
        by_status[term["status"]] = by_status.get(term["status"], 0) + 1
    return {"terms_total": len(terms), "by_status": by_status,
            "candidates_total": len(candidates)}


def build_terms(ctx: TermContext, *, watchlist: Sequence[dict[str, Any]], today: date,
                promotions: Sequence[dict[str, Any]] | None = None,
                repo_root: str | Path | None = None,
                history: dict[str, str] | None = None,
                log: Callable[[str], None] = print) -> dict[str, Any]:
    """Count, propose, assemble. Discovery is isolated: when it fails the terms still stand,
    and its note lands on the report of the platform it came from."""
    rules = ctx.rules
    history = history or {}
    by_platform, reports = track(ctx, watchlist, log=log)

    try:
        proposed: Discovery = discover(ctx, watchlist, rules=rules,
                                      repo_root=repo_root, log=log)
    except Exception as exc:  # noqa: BLE001 — the proposals never take the counts down
        proposed = Discovery(notes={p: [f"discovery: {type(exc).__name__}: {exc}"[:160]]
                                    for p in ("hackernews", "arxiv", "github")})
        log(f"  discovery      failed       {type(exc).__name__}: {exc}"[:160])
    for report in reports:
        extra = proposed.notes.get(report["id"]) or []
        if not extra:
            continue
        report["note"] = "; ".join([n for n in [report["note"], *extra] if n])[:200]
        if report["status"] == "ok":
            report["status"] = "partial"
    for platform, notes in sorted(proposed.notes.items()):
        if platform not in {r["id"] for r in reports}:
            for note in notes:
                log(f"  note {platform}: {note}")

    terms: list[dict[str, Any]] = []
    for entry in watchlist:
        slug = entry["slug"]
        added = entry["added"] or today.isoformat()
        counts: dict[str, Any] = {}
        receipts: dict[str, list[dict[str, str]]] = {}
        earliest: list[str] = []
        for platform in PLATFORMS:
            outcome = by_platform.get(platform, {}).get(slug)
            if platform == "wikipedia_views":
                counts[platform] = dict(outcome.counts) if outcome else None
                continue
            counts[platform] = dict(outcome.counts) if outcome else dict(ZERO)
            if outcome is None:
                continue
            if outcome.receipts:
                receipts[platform] = outcome.receipts
            if outcome.earliest:
                earliest.append(outcome.earliest)
        total = {w: sum(counts[p][w] for p in COUNTED) for w in ("d1", "d7", "d30")}
        first_seen = first_seen_for(slug, added=added,
                                    run_earliest=min(earliest) if earliest else None,
                                    history=history)
        terms.append({
            "slug": slug, "term": entry["term"], "aliases": list(entry["aliases"]),
            "added": added, "origin": entry["origin"], "note": entry["note"],
            "wikipedia_article": entry["wikipedia_article"],
            "counts": counts, "total": total, "ratio": ratio(total),
            "status": status(total, first_seen, today, rules), "first_seen": first_seen,
            "receipts": merge_receipts(receipts),
        })

    record: dict[str, Any] = {
        "$contract": CONTRACT_TERMS,
        "date": today.isoformat(),
        "generated_at": iso_z(ctx.clock()),
        "pipeline_version": TERMS_PIPELINE_VERSION,
        "method_version": TERMS_METHOD_VERSION,
        "windows": dict(WINDOWS),
        "sources": reports,
        "terms": terms,
        "candidates": list(proposed.candidates),
        "promoted": list(promotions or []),
        "let_go": [],
        "summary": _summary(terms, proposed.candidates),
    }
    # The record grades itself before it leaves the builder, so every committed file carries
    # the rubric's verdict — including the ones a reader would rather not see.
    record["quality"] = assess_terms(record, ctx.rules)
    return record


def unavailable_record(today: date, note: str, *, generated_at: str | None = None,
                       ) -> dict[str, Any]:
    """What the step writes when it fails outright: every platform unavailable, the reason on
    each report, no terms and no candidates. The day file is never affected."""
    stamp = generated_at or iso_z(datetime.now(timezone.utc))
    return {
        "$contract": CONTRACT_TERMS,
        "date": today.isoformat(),
        "generated_at": stamp,
        "pipeline_version": TERMS_PIPELINE_VERSION,
        "method_version": TERMS_METHOD_VERSION,
        "windows": dict(WINDOWS),
        "sources": [unavailable_report(p, note[:200], stamp) for p in PLATFORMS],
        "terms": [],
        "candidates": [],
        "summary": _summary([], []),
    }


def run_terms(client: httpx.Client, *, repo_root: str | Path, today: date,
              rules: dict[str, Any], log: Callable[[str], None] = print) -> Path | None:
    """The IO half: read the archive, build the record, write the dated file once."""
    path = terms_dir(repo_root) / f"{today.isoformat()}.json"
    if path.exists():
        log(f"trending: terms/{path.name} already committed, untouched")
        return None
    try:
        ctx = make_context(client, rules=rules, now=datetime.now(timezone.utc))
        entries, from_repo = wl.load(repo_root)
        watching = wl.tracked(entries)
        struck = len(entries) - len(watching)
        prior = load_terms_files(repo_root, before=today,
                                limit=max(int(rules.get("terms_history_files", 3)),
                                          int(rules.get("promote_days", 3))))
        history = history_first_seen(prior)
        log(f"trending: terms — {len(watching)} watched"
            + (f", {struck} struck" if struck else "")
            + ("" if from_repo else " (list seeded from the package)")
            + f", {'authenticated' if ctx.github_authenticated else 'unauthenticated'} on GitHub")
        record = build_terms(ctx, watchlist=watching, today=today, history=history,
                             repo_root=repo_root, log=log)
        # The proposals decide the list, not a person's next visit: a phrase that keeps
        # coming back on several platforms is taken on, and tracked from the next run.
        promotions = wl.promote(candidates=record["candidates"], prior_records=prior,
                                entries=entries, today=today, rules=rules)
        # And the other direction: what the machine took on and the world dropped again is
        # let go, so the list stays the size of the attention it can actually pay.
        aged, let_go = wl.age(entries, record["terms"], today, rules)
        if promotions or let_go or not from_repo:
            wl.save(repo_root, wl.apply(aged, promotions, today))
        record["promoted"] = promotions
        record["let_go"] = let_go
        for p in promotions:
            log(f"  promoted       {p['term']:<28} {len(p['platforms'])} platforms, "
                f"ratio {p['ratio']}")
        for g in let_go:
            log(f"  let go         {g['term']:<28} {g['note']}")
    except Exception as exc:  # noqa: BLE001 — the arcs never take the day down
        record = unavailable_record(today, f"{type(exc).__name__}: {exc}")
        log(f"trending: terms unavailable ({type(exc).__name__}: {exc})"[:200])
    if "quality" not in record:  # the unavailable record grades itself too
        record["quality"] = assess_terms(record, rules)
    log(f"trending: terms {one_line(record['quality'])}")
    if not record["quality"]["ok"]:
        log(f"::warning::trending terms {today}: {one_line(record['quality'])}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(to_json(record), encoding="utf-8")
    s = record["summary"]
    spread = ", ".join(f"{n} {name}" for name, n in s["by_status"].items() if n)
    ok = sum(1 for r in record["sources"] if r["status"] == "ok")
    promoted = len(record.get("promoted") or [])
    log(f"trending: terms {s['terms_total']} watched ({spread or 'none counted'}), "
        f"{s['candidates_total']} candidates"
        + (f", {promoted} promoted" if promoted else "")
        + f", {ok}/{len(record['sources'])} platforms ok → {path}")
    return path


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="trending.terms",
                                description="Write today's arcs record without the day file.")
    p.add_argument("--repo-root", required=True)
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: today, UTC)")
    args = p.parse_args(argv)
    if args.date:
        try:
            today = datetime.strptime(args.date, "%Y-%m-%d").date()
        except ValueError:
            p.error("--date must be YYYY-MM-DD")
    else:
        today = datetime.now(timezone.utc).date()
    rules = load_json("rules.json")
    with open_client() as client:
        run_terms(client, repo_root=args.repo_root, today=today, rules=rules)
    return 0


if __name__ == "__main__":
    sys.exit(main())
