#!/usr/bin/env python3
"""ALL AT ONCE — build data.json from The Field's committed cohort file.

The sibling practice The Field (frankbueltge/field-research, session 143,
2026-09-01) measured how long a public expression of concern stands before it is
resolved into a retraction, and committed the row file it measured: one row per
paper, with the concern date, the notice that raised it, and the outcome as of
2026-09-01.

Their first warning to anyone reusing that file is that concerns arrive in
batches, so papers are not independent units, and an interval computed over
papers will be far too narrow. They treated that as a correction to make — a
bootstrap over issuance days rather than over papers.

This script treats it as the thing to measure. It regroups their rows by the
NOTICE that raised each concern and asks whether the papers inside one notice
share an outcome. Nothing is hand-classified and no row is altered.

Every string this room puts on the page as a fact about a named notice is
fetched here from Crossref rather than typed by hand, so --check re-fetches it.

  python3 make-data.py            # write data.json  (needs network)
  python3 make-data.py --check    # rebuild and compare with the committed file
"""

import argparse
import collections
import csv
import hashlib
import io
import json
import os
import random
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "data.json")

COHORT_URL = (
    "https://raw.githubusercontent.com/frankbueltge/field-research/main/"
    "artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/data/cohort.csv"
)
CROSSREF = "https://api.crossref.org/works/{doi}?mailto=ensemble@studio.invalid"

# Every notice this room names or draws large. Their titles, journals and
# deposited paper lists are fetched, never typed — including the three in
# Plate II, which is where an assumed title would have gone wrong: the Chest
# notice is not called an expression of concern at all.
NAMED = [
    "10.1016/j.micpro.2021.104306",
    "10.1016/j.earlhumdev.2021.105329",
    "10.1016/j.earlhumdev.2021.105328",
    "10.1177/0031512520901993",
    "10.1177/0033294120901991",
    "10.1177/1081286515618095",
    "10.1161/res.0000000000000241",
    "10.1080/14656566.2018.1475338",
    "10.1016/j.chest.2018.01.023",
    "10.1007/s12517-021-08471-8",
]

# The two notices whose deposited lists are compared for overlap on the page.
EYSENCK = ("10.1177/0031512520901993", "10.1177/0033294120901991")

# The notice the closing section is about.
WIDE = "10.1007/s12517-021-08471-8"

# Rows whose notice cannot be identified. The Field records 48 papers whose
# concern notice DOI is the literal string "unavailable" and 2 with none at all;
# they are counted and set aside, never merged into a pseudo-notice.
NO_NOTICE = {"unavailable", ""}

SEED = 20260901
DRAWS = 50000
BIG = 5


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ensemble/1.0"})
    with urllib.request.urlopen(req, timeout=90) as fh:
        return fh.read()


def crossref(doi):
    msg = json.loads(fetch(CROSSREF.format(doi=doi)))["message"]
    title = (msg.get("title") or [""])[0]
    journal = (msg.get("container-title") or [""])[0]
    deposited = sorted({u["DOI"].lower() for u in msg.get("update-to", [])})
    return {
        "doi": doi,
        "url": "https://doi.org/" + doi,
        "title": title,
        "journal": journal,
        "deposited_papers": len(deposited),
        "_deposited": deposited,
    }


def resolved(row):
    return int(row["resolved_within_5y"])


def build():
    raw = fetch(COHORT_URL)
    sha = hashlib.sha256(raw).hexdigest()
    rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))
    mature = [r for r in rows if r["in_mature_cohort"] == "1"]

    n_papers = len(mature)
    n_resolved = sum(resolved(r) for r in mature)

    # --- the day view: when concerns arrive -------------------------------
    per_day = collections.Counter(r["concern_date"] for r in mature)
    top_days = per_day.most_common(10)

    # --- the notice view: who they arrive with ----------------------------
    identified = [r for r in mature if r["concern_notice_doi"].strip() not in NO_NOTICE]
    unidentified = n_papers - len(identified)

    by_notice = collections.defaultdict(list)
    for r in identified:
        by_notice[r["concern_notice_doi"]].append(r)

    singles = {k: v for k, v in by_notice.items() if len(v) == 1}
    multi = {k: v for k, v in by_notice.items() if len(v) > 1}

    def summarise(doi, group):
        got = sum(resolved(r) for r in group)
        return {
            "doi": doi,
            "url": "https://doi.org/" + doi,
            "date": group[0]["concern_date"],
            "publisher": group[0]["publisher"],
            "papers": len(group),
            "retracted": got,
            "verdict": "all" if got == len(group) else ("none" if got == 0 else "split"),
            # days from the concern to each retraction, for the notices that
            # resolved: shows whether the resolution is one act as well
            "days": sorted(int(r["days_to_retraction"]) for r in group if r["days_to_retraction"]),
        }

    batches = sorted(
        (summarise(k, v) for k, v in multi.items()),
        key=lambda b: (-b["papers"], b["doi"]),
    )
    all_or_nothing = [b for b in batches if b["verdict"] != "split"]
    splitters = [b for b in batches if b["verdict"] == "split"]

    # --- is that what independence would give? ----------------------------
    p = n_resolved / n_papers
    big = [b for b in batches if b["papers"] >= BIG]

    def simulate(group, rates, observed):
        """Draw each paper's outcome on its own and count all-or-nothing
        notices; return the mean count and how often the observed is reached."""
        rng = random.Random(SEED)
        total, at_least = 0, 0
        for _ in range(DRAWS):
            c = 0
            for b, q in zip(group, rates):
                k = sum(rng.random() < q for _ in range(b["papers"]))
                if k == 0 or k == b["papers"]:
                    c += 1
            total += c
            if c >= observed:
                at_least += 1
        return total / DRAWS, at_least

    flat = [p] * len(batches)
    observed = len(all_or_nothing)
    expected = sum(p ** b["papers"] + (1 - p) ** b["papers"] for b in batches)
    _, at_least = simulate(batches, flat, observed)

    big_observed = sum(1 for b in big if b["verdict"] != "split")
    big_expected = sum(p ** b["papers"] + (1 - p) ** b["papers"] for b in big)
    _, big_at_least = simulate(big, [p] * len(big), big_observed)

    # A harder null. The obvious alternative reading of all-or-nothing is that
    # it is not the notice deciding at all, but the publisher: papers drawn
    # from a publisher that retracts readily will agree with each other under
    # fully independent, paper-by-paper decisions. So estimate a separate rate
    # for each publisher from its own mature rows — which includes the batched
    # papers themselves, so the null is given every advantage — and draw again.
    pub_rows = collections.defaultdict(list)
    for r in mature:
        pub_rows[r["publisher"]].append(r)
    pub_rate = {k: sum(resolved(x) for x in v) / len(v) for k, v in pub_rows.items()}
    rates = [pub_rate[b["publisher"]] for b in batches]
    strat_expected = sum(
        q ** b["papers"] + (1 - q) ** b["papers"] for b, q in zip(batches, rates))
    strat_mean, strat_at_least = simulate(batches, rates, observed)

    single_resolved = sum(resolved(v[0]) for v in singles.values())
    multi_papers = sum(b["papers"] for b in batches)
    multi_resolved = sum(b["retracted"] for b in batches)

    named = [crossref(d) for d in NAMED]

    # --- what the second source says about each notice we name -------------
    # For eight of them the notice's own Crossref deposit lists exactly as many
    # distinct papers as The Field's rows assign to it. One does not, by a
    # factor of two hundred, and that disagreement is the closing section.
    assigned_all = collections.Counter(r["concern_notice_doi"] for r in rows)
    checks = []
    for n in named:
        checks.append({
            "doi": n["doi"],
            "deposited": n["deposited_papers"],
            "in_mature_cohort": len(by_notice.get(n["doi"], [])),
            "in_whole_file": assigned_all[n["doi"]],
        })
    agree = [c for c in checks if c["deposited"] == c["in_mature_cohort"]]

    eys_a, eys_b = (next(n for n in named if n["doi"] == d) for d in EYSENCK)
    eysenck_overlap = len(set(eys_a["_deposited"]) & set(eys_b["_deposited"]))

    # --- the notice that reaches past the window --------------------------
    wide_named = next(n for n in named if n["doi"] == WIDE)
    wide_rows = [r for r in rows if r["concern_notice_doi"] == WIDE]
    wide_deposited = set(wide_named["_deposited"])
    in_file = {r["original_doi"].lower() for r in rows}
    wide_dates = collections.Counter(r["concern_date"] for r in wide_rows)
    wide_day = wide_dates.most_common(1)[0]
    data = {
        "work": "ALL AT ONCE",
        "wide": {
            "doi": WIDE,
            "deposited": wide_named["deposited_papers"],
            "deposited_present_in_file": len(wide_deposited & in_file),
            "rows_in_whole_file": len(wide_rows),
            "rows_with_a_retraction": sum(1 for r in wide_rows if r["days_to_retraction"]),
            "in_mature_cohort": len(by_notice.get(WIDE, [])),
            "busiest_day": wide_day[0],
            "rows_on_that_day": sum(1 for r in rows if r["concern_date"] == wide_day[0]),
            "this_notice_on_that_day": wide_day[1],
            "cohort_cutoff": "2021-08-19",
        },
        "crossref_check": {
            "notices_checked": len(checks),
            "deposit_matches_cohort": len(agree),
            "eysenck_overlap": eysenck_overlap,
            "detail": checks,
        },
        "built": "2026-09-01",
        "source": {
            "practice": "The Field (Meridian)",
            "repo": "frankbueltge/field-research",
            "session": 143,
            "file": COHORT_URL,
            "sha256": sha,
            "observation_cutoff": "2026-08-19",
            "note": "The Field's mature cohort: every paper whose first public "
                    "expression of concern was issued on or before 2021-08-19, so "
                    "each has had five full years for a retraction to follow.",
        },
        "cohort": {
            "papers": n_papers,
            "retracted": n_resolved,
            "rate": round(p, 4),
        },
        "days": {
            "distinct": len(per_day),
            "carrying_one_paper": sum(1 for v in per_day.values() if v == 1),
            "papers_on_ten_largest": sum(v for _, v in top_days),
            "largest": [{"date": d, "papers": n} for d, n in top_days],
        },
        "notices": {
            "identified_papers": len(identified),
            "unidentified_papers": unidentified,
            "total": len(by_notice),
            "single_paper": len(singles),
            "single_paper_retracted": single_resolved,
            "multi_paper": len(batches),
            "multi_paper_papers": multi_papers,
            "multi_paper_retracted": multi_resolved,
        },
        "finding": {
            "all_or_nothing": observed,
            "of": len(batches),
            "papers_in_them": sum(b["papers"] for b in all_or_nothing),
            "none_retracted": sum(1 for b in all_or_nothing if b["verdict"] == "none"),
            "all_retracted": sum(1 for b in all_or_nothing if b["verdict"] == "all"),
            "split": len(splitters),
            "expected_if_independent": round(expected, 2),
            "draws": DRAWS,
            "draws_at_least_observed": at_least,
            "seed": SEED,
            "big_threshold": BIG,
            "big_notices": len(big),
            "big_papers": sum(b["papers"] for b in big),
            "big_all_or_nothing": big_observed,
            "big_expected_if_independent": round(big_expected, 3),
            "big_draws_at_least_observed": big_at_least,
            "stratified_expected": round(strat_expected, 2),
            "stratified_mean": round(strat_mean, 2),
            "stratified_draws_at_least_observed": strat_at_least,
        },
        "batches": batches,
        "splitters": splitters,
        "named": [{k: v for k, v in n.items() if not k.startswith("_")} for n in named],
    }
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="rebuild and compare with the committed data.json")
    args = ap.parse_args()

    fresh = build()
    if not args.check:
        with open(OUT, "w") as fh:
            json.dump(fresh, fh, indent=1, sort_keys=True)
            fh.write("\n")
        print("wrote", OUT)
        return 0

    with open(OUT) as fh:
        committed = json.load(fh)
    a = json.dumps(committed, sort_keys=True, indent=1)
    b = json.dumps(fresh, sort_keys=True, indent=1)
    if a == b:
        print("check: data.json reproduces exactly")
        return 0
    print("check: MISMATCH — the source file has moved since this was built.")
    for key in sorted(set(committed) | set(fresh)):
        if committed.get(key) != fresh.get(key):
            print("  differs:", key)
    return 1


if __name__ == "__main__":
    sys.exit(main())
