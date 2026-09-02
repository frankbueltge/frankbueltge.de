"""Orchestration and IO. Every source is isolated — a failure becomes a note in the record,
never a crash; the day is always written, the arcs and the audience of the day before come
second and can never take the day down with them. Committed files are never rewritten."""
from __future__ import annotations

import argparse
from dataclasses import asdict
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

from trending import METHOD_VERSION, PIPELINE_VERSION
from trending.archive import load_days, trending_dir
from trending.audience import build_audience
from trending.converge import cluster
from trending.data import load_json
from trending.fetch import USER_AGENT
from trending.model import CONTRACT_AUDIENCE, DayRecord, Signal, SourceReport, day_to_dict, to_json
from trending.quality import assess_day, one_line
from trending.sources import SOURCES, Context, SourceSpec
from trending.terms import run_terms

ACCEPT = "application/json, application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8"


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _report(spec: SourceSpec, signals: list[Signal], as_of: str | None, notes: list[str],
            retrieved_at: str) -> SourceReport:
    if not signals:
        status, note = "unavailable", ("; ".join(notes) or "no items")[:200]
    elif notes:
        status, note = "partial", "; ".join(notes)[:200]
    else:
        status, note = "ok", ""
    return SourceReport(id=spec.id, name=spec.name, url=spec.url, licence=spec.licence,
                        status=status, note=note, retrieved_at=retrieved_at, as_of=as_of,
                        count=len(signals))


def _fetch_one(ctx: Context, spec: SourceSpec) -> tuple[SourceReport, list[Signal]]:
    retrieved_at = _now_iso()
    try:
        result = spec.fetch(ctx)
        return _report(spec, result.signals, result.as_of, result.notes, retrieved_at), list(result.signals)
    except Exception as exc:  # noqa: BLE001 — deliberate isolation: a note, not a crash
        return _report(spec, [], None, [f"{type(exc).__name__}: {exc}"[:200]], retrieved_at), []


def build_day(ctx: Context, sources: tuple[SourceSpec, ...] | None = None, *,
              log=print) -> DayRecord:
    # Resolved at call time, not at definition time, so a test can swap the module's SOURCES.
    sources = SOURCES if sources is None else sources
    fetched: dict[str, tuple[SourceReport, list[Signal]]] = {}
    for spec in sources:
        fetched[spec.id] = _fetch_one(ctx, spec)

    # The repair loop: a source that did not answer is asked once more after a pause. That is
    # the one failure a run can mend on the spot; everything else is recorded as it is.
    failed = [spec for spec in sources if fetched[spec.id][0].status == "unavailable"]
    if failed and bool(ctx.rules.get("quality_retry", True)):
        time.sleep(float(ctx.rules.get("quality_retry_delay_s", 20)))
        for spec in failed:
            report, got = _fetch_one(ctx, spec)
            if report.status != "unavailable":
                first_note = fetched[spec.id][0].note
                report = SourceReport(**{**asdict(report),
                                         "note": f"recovered on retry; first attempt: {first_note}"[:200]})
                fetched[spec.id] = (report, got)

    reports: list[SourceReport] = []
    signals: dict[str, tuple[Signal, ...]] = {}
    all_signals: list[Signal] = []
    for spec in sources:
        report, got = fetched[spec.id]
        reports.append(report)
        signals[spec.id] = tuple(got)
        all_signals.extend(got)
        log(f"  {spec.id:<14} {report.status:<12} {report.count:>4}  {report.note}")
    topics = cluster(all_signals, ctx.archive, ctx.rules, ctx.today)
    # The record keeps only what converges. A singleton cluster is the signal itself, which
    # already sits in `signals`; repeating each one as a topic tripled the day file for no
    # reader. `topics_total` still counts every cluster, and the three headline labels fall
    # back to the strongest singletons on a day when fewer than three topics converge.
    kept = [t for t in topics if t.platform_count >= 2]
    top_labels = [t.label for t in kept[:3]]
    for t in topics:
        if len(top_labels) >= 3:
            break
        if t.label not in top_labels:
            top_labels.append(t.label)
    summary: dict[str, Any] = {
        "topics_total": len(topics),
        "converging": len(kept),
        "sources_ok": sum(1 for r in reports if r.status == "ok"),
        "sources_total": len(reports),
        "top_labels": top_labels,
    }
    return DayRecord(date=ctx.today.isoformat(), generated_at=_now_iso(),
                     pipeline_version=PIPELINE_VERSION, method_version=METHOD_VERSION,
                     sources=tuple(reports), signals=signals, topics=tuple(kept), summary=summary)


def _audience_fallback(day: date, note: str) -> dict[str, Any]:
    from trending.audience import _edge_unavailable, _umami_unavailable
    return {"$contract": CONTRACT_AUDIENCE, "day": day.isoformat(), "generated_at": _now_iso(),
            "edge": _edge_unavailable(day, note), "umami": _umami_unavailable(note)}


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="trending.run")
    p.add_argument("--repo-root", required=True)
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: today, UTC)")
    p.add_argument("--skip-audience", action="store_true")
    p.add_argument("--skip-terms", action="store_true")
    args = p.parse_args(argv)
    if args.date:
        try:
            today = datetime.strptime(args.date, "%Y-%m-%d").date()
        except ValueError:
            p.error("--date must be YYYY-MM-DD")
    else:
        today = datetime.now(timezone.utc).date()

    out_dir = trending_dir(args.repo_root)
    day_path = out_dir / f"{today.isoformat()}.json"
    rules = load_json("rules.json")
    stoplist = frozenset(load_json("stoplist_wikipedia.json"))

    with httpx.Client(headers={"User-Agent": USER_AGENT, "Accept": ACCEPT}) as client:
        if day_path.exists():
            print(f"trending: {day_path.name} already committed, untouched")
        else:
            archive = load_days(args.repo_root, today, int(rules.get("memory_days", 30)))
            ctx = Context(client=client, today=today, rules=rules, archive=archive, stoplist=stoplist)
            rec = build_day(ctx)
            record = day_to_dict(rec)
            record["quality"] = assess_day(record, rules)
            print(f"trending: {one_line(record['quality'])}")
            if not record["quality"]["ok"]:
                print(f"::warning::trending day {today}: {one_line(record['quality'])}")
            payload = to_json(record)
            out_dir.mkdir(parents=True, exist_ok=True)
            # Only the dated file is committed: the site serves /trending/latest.json from the
            # newest day itself, and a second full copy would double what git has to keep.
            day_path.write_text(payload, encoding="utf-8")
            s = rec.summary
            print(f"trending: {s['topics_total']} topics, {s['converging']} converging on ≥2 "
                  f"platforms, {s['sources_ok']}/{s['sources_total']} sources ok → {day_path}")

        # The arcs come after the day and before the audience: they read the same clock, and
        # a failure of theirs writes an unavailable record rather than taking the day down.
        if not args.skip_terms:
            run_terms(client, repo_root=args.repo_root, today=today, rules=rules)

        if not args.skip_audience:
            yday = today - timedelta(days=1)
            aud_path = out_dir / "audience" / f"{yday.isoformat()}.json"
            if aud_path.exists():
                print(f"trending: audience/{aud_path.name} already committed, untouched")
            else:
                try:
                    aud = build_audience(client, yday)
                except Exception as exc:  # noqa: BLE001 — the audience never takes the day down
                    aud = _audience_fallback(yday, f"{type(exc).__name__}: {exc}"[:200])
                aud_path.parent.mkdir(parents=True, exist_ok=True)
                aud_path.write_text(to_json(aud), encoding="utf-8")
                e, u = aud["edge"], aud["umami"]
                print(f"trending: audience {yday}: edge={e['status']} ({e.get('total')}) "
                      f"umami={u['status']} ({u.get('pageviews')}) → {aud_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
