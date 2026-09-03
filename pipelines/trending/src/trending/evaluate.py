"""The rule on trial: a labelled set, and a score against it.

The convergence rule decides one thing over and over — are these two signals the same topic?
Until now that decision was defended by argument. Here it is defended by a number: a sheet of
pairs drawn from a committed day, each judged by a person, and a score that says how often the
rule agrees with the judgement. Thresholds can then be changed against evidence instead of
taste, and a change that makes the score worse is visible before it ships.

Two kinds of pair go on the sheet. The ones the rule joined, which test whether it joins too
much, and a deterministic sample of near misses — pairs that share a word but were not
joined — which test whether it joins too little. Pairs that share nothing are left out: they
are the overwhelming majority and judging them teaches nothing.

The judgement is editorial, not a measurement, so every sheet names who judged and by which
criterion, and the criterion is written down before the judging starts. Anyone may overrule a
label; the file records the label, the labeller and the date, and git keeps the change.
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence

from trending.archive import trending_dir
from trending.converge import _prepare, match
from trending.data import load_json
from trending.model import CONTRACT_DAY, Signal, to_json

CONTRACT_LABELS = "trending-pair-labels/1"
CONTRACT_SCORE = "trending-rule-score/1"

CRITERION = (
    "Two signals are the same topic when a reader looking for one would want the other: they "
    "name the same event, person, work, product or dispute. They are not the same topic when "
    "they only share a word, a genre or a place — an obituary and a book by the same author "
    "are one topic; two unrelated stories from one country are not."
)


def _signals_of(record: dict[str, Any]) -> list[Signal]:
    """The committed day's signals, back as the objects the rule works on."""
    out: list[Signal] = []
    for source_id, items in (record.get("signals") or {}).items():
        for raw in items or []:
            out.append(Signal(
                source=str(raw.get("source") or source_id),
                label=str(raw.get("label") or ""),
                rank=int(raw.get("rank") or 0),
                magnitude_unit=str(raw.get("magnitude_unit") or "rank"),
                url=raw.get("url"),
                magnitude=raw.get("magnitude"),
                geo=raw.get("geo"),
                meta=raw.get("meta") or {},
            ))
    return out


def pair_id(a: Signal, b: Signal) -> str:
    """Stable across runs and independent of the order the two were seen in."""
    ends = sorted((f"{a.source}:{a.geo or '-'}:{a.rank}", f"{b.source}:{b.geo or '-'}:{b.rank}"))
    return f"{ends[0]}|{ends[1]}"


def _entry(a: Signal, b: Signal, joined: bool, shared: Sequence[str]) -> dict[str, Any]:
    return {
        "id": pair_id(a, b),
        "joined_by_the_rule": joined,
        "shared_words": sorted(shared),
        "left": {"source": a.source, "geo": a.geo, "label": a.label, "url": a.url},
        "right": {"source": b.source, "geo": b.geo, "label": b.label, "url": b.url},
        "same_topic": None,  # the judgement, filled by hand
    }


def propose(record: dict[str, Any], *, rules: dict[str, Any] | None = None,
            negatives: int = 40, seed: int = 20260902) -> list[dict[str, Any]]:
    """The sheet: every joined pair, plus a deterministic sample of near misses."""
    rules = rules or {}
    jaccard_min = float(rules.get("jaccard_min", 0.5))
    prepared = _prepare(_signals_of(record))
    joined: list[dict[str, Any]] = []
    misses: list[dict[str, Any]] = []
    for i, a in enumerate(prepared):
        for b in prepared[i + 1:]:
            if a.sig.source == b.sig.source and a.sig.geo == b.sig.geo:
                continue
            shared = a.tok & b.tok
            if match(a, b, jaccard_min):
                joined.append(_entry(a.sig, b.sig, True, shared))
            elif shared:
                misses.append(_entry(a.sig, b.sig, False, shared))
    joined.sort(key=lambda e: e["id"])
    misses.sort(key=lambda e: e["id"])
    random.Random(seed).shuffle(misses)
    return joined + misses[:max(0, negatives)]


def sheet(record: dict[str, Any], *, rules: dict[str, Any] | None = None, negatives: int = 40,
          labeller: str = "", seed: int = 20260902) -> dict[str, Any]:
    pairs = propose(record, rules=rules, negatives=negatives, seed=seed)
    return {
        "$contract": CONTRACT_LABELS,
        "date": str(record.get("date") or ""),
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "method_version": str(record.get("method_version") or ""),
        "criterion": CRITERION,
        "labeller": labeller,
        "seed": seed,
        "pairs": pairs,
        "counts": {"joined": sum(1 for p in pairs if p["joined_by_the_rule"]),
                   "near_misses": sum(1 for p in pairs if not p["joined_by_the_rule"]),
                   "judged": sum(1 for p in pairs if p["same_topic"] is not None)},
    }


def eval_dir(repo_root: str | Path) -> Path:
    return trending_dir(repo_root) / "eval"


def load_sheets(repo_root: str | Path) -> list[dict[str, Any]]:
    folder = eval_dir(repo_root)
    if not folder.is_dir():
        return []
    out: list[dict[str, Any]] = []
    for path in sorted(folder.glob("*-pairs.json")):
        try:
            rec = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(rec, dict) and rec.get("$contract") == CONTRACT_LABELS:
            out.append(rec)
    return out


def _day(repo_root: str | Path, day: str) -> dict[str, Any] | None:
    path = trending_dir(repo_root) / f"{day}.json"
    if not path.is_file():
        return None
    rec = json.loads(path.read_text(encoding="utf-8"))
    return rec if rec.get("$contract") == CONTRACT_DAY else None


def score_sheet(sheet_rec: dict[str, Any], record: dict[str, Any],
                rules: dict[str, Any] | None = None) -> dict[str, Any]:
    """How the rule as configured now answers the pairs a person has judged.

    The rule is re-run rather than read from the sheet, so the same labels can score a changed
    threshold — which is the whole point of keeping them.
    """
    rules = rules or {}
    jaccard_min = float(rules.get("jaccard_min", 0.5))
    prepared = {f"{p.sig.source}:{p.sig.geo or '-'}:{p.sig.rank}": p
                for p in _prepare(_signals_of(record))}
    tp = fp = tn = fn = 0
    unjudged = missing = 0
    errors: list[dict[str, Any]] = []
    for pair in sheet_rec.get("pairs") or []:
        truth = pair.get("same_topic")
        if truth is None:
            unjudged += 1
            continue
        left, right = pair["id"].split("|")
        a, b = prepared.get(left), prepared.get(right)
        if a is None or b is None:
            missing += 1
            continue
        joined = match(a, b, jaccard_min)
        if joined and truth:
            tp += 1
        elif joined and not truth:
            fp += 1
            errors.append({"kind": "joined-but-different", **{k: pair[k] for k in ("id", "left", "right")}})
        elif not joined and truth:
            fn += 1
            errors.append({"kind": "missed-the-same-topic", **{k: pair[k] for k in ("id", "left", "right")}})
        else:
            tn += 1
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    f1 = (2 * precision * recall / (precision + recall)
          if precision and recall and (precision + recall) else None)
    return {
        "date": sheet_rec.get("date"),
        "judged": tp + fp + tn + fn,
        "unjudged": unjudged,
        "not_in_the_day": missing,
        "true_joins": tp, "false_joins": fp, "true_separations": tn, "missed_joins": fn,
        "precision": round(precision, 3) if precision is not None else None,
        "recall": round(recall, 3) if recall is not None else None,
        "f1": round(f1, 3) if f1 is not None else None,
        "errors": errors,
    }


def scorecard(repo_root: str | Path, *, rules: dict[str, Any] | None = None,
              errors_cap: int = 12) -> dict[str, Any]:
    rules = rules or {}
    sheets = load_sheets(repo_root)
    per_day: list[dict[str, Any]] = []
    for s in sheets:
        record = _day(repo_root, str(s.get("date") or ""))
        if record is None:
            continue
        per_day.append(score_sheet(s, record, rules))
    total = {k: sum(int(d[k]) for d in per_day)
             for k in ("judged", "true_joins", "false_joins", "true_separations", "missed_joins")}
    tp, fp, fn = total["true_joins"], total["false_joins"], total["missed_joins"]
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    f1 = (2 * precision * recall / (precision + recall)
          if precision and recall and (precision + recall) else None)
    errors = [e for d in per_day for e in d["errors"]][:errors_cap]
    return {
        "$contract": CONTRACT_SCORE,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "criterion": CRITERION,
        "thresholds": {k: rules[k] for k in sorted(rules) if k in ("jaccard_min",)},
        "days": [{k: v for k, v in d.items() if k != "errors"} for d in per_day],
        "total": {**total,
                  "precision": round(precision, 3) if precision is not None else None,
                  "recall": round(recall, 3) if recall is not None else None,
                  "f1": round(f1, 3) if f1 is not None else None},
        "errors": errors,
    }


def sweep(repo_root: str | Path, values: Iterable[float], *,
          rules: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """The same labels against a range of thresholds. Reports, never writes: a threshold is
    changed by a person editing the rules file, with this table as the reason."""
    base = dict(rules or {})
    out: list[dict[str, Any]] = []
    for value in values:
        card = scorecard(repo_root, rules={**base, "jaccard_min": value}, errors_cap=0)
        out.append({"jaccard_min": value, **{k: card["total"][k]
                                             for k in ("precision", "recall", "f1", "false_joins",
                                                       "missed_joins")}})
    return out


# ------------------------------------------------------------------------------------- the CLI

def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="trending.evaluate",
                                description="Put the convergence rule on trial against labelled pairs.")
    p.add_argument("command", choices=("propose", "score", "sweep"))
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None, help="the committed day to draw pairs from")
    p.add_argument("--negatives", type=int, default=40)
    p.add_argument("--labeller", default="")
    args = p.parse_args(argv)
    rules = load_json("rules.json")

    if args.command == "propose":
        if not args.date:
            p.error("propose needs --date")
        record = _day(args.repo_root, args.date)
        if record is None:
            print(f"evaluate: no committed day {args.date}", file=sys.stderr)
            return 1
        out = sheet(record, rules=rules, negatives=args.negatives, labeller=args.labeller)
        path = eval_dir(args.repo_root) / f"{args.date}-pairs.json"
        if path.exists():
            print(f"evaluate: {path.name} already exists, untouched")
            return 0
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(to_json(out), encoding="utf-8")
        print(f"evaluate: {out['counts']['joined']} joined pairs and "
              f"{out['counts']['near_misses']} near misses to judge → {path}")
        return 0

    if args.command == "score":
        card = scorecard(args.repo_root, rules=rules)
        path = eval_dir(args.repo_root) / "scorecard.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(to_json(card), encoding="utf-8")
        t = card["total"]
        print(f"evaluate: {t['judged']} judged pairs — precision {t['precision']}, "
              f"recall {t['recall']}, f1 {t['f1']} "
              f"({t['false_joins']} joined but different, {t['missed_joins']} missed) → {path}")
        for e in card["errors"]:
            print(f"  {e['kind']:<24} {e['left']['label'][:44]:<44} | {e['right']['label'][:44]}")
        return 0

    table = sweep(args.repo_root, [round(0.3 + 0.05 * i, 2) for i in range(11)], rules=rules)
    print(f"{'jaccard_min':>12}{'precision':>11}{'recall':>8}{'f1':>7}{'false':>7}{'missed':>8}")
    for row in table:
        print(f"{row['jaccard_min']:>12}{str(row['precision']):>11}{str(row['recall']):>8}"
              f"{str(row['f1']):>7}{row['false_joins']:>7}{row['missed_joins']:>8}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
