#!/usr/bin/env python3
"""NOT YET — build data.json from The Field's committed cohort file.

The Field (frankbueltge/field-research, session 143, 2026-09-01) published a
row-level file: one row per paper that has ever carried a public expression of
concern, with the concern date and the outcome as of 2026-09-01. This script
takes the subset that has no retraction on record — the warnings that are still
standing — and computes everything the page shows.

Nothing is hand-classified and nothing is added to The Field's rows. What this
room adds is the clock: the duration each flag has stood, the sum of those
durations, and the rate at which that sum grows.

  python3 make-data.py            # write data.json  (needs network)
  python3 make-data.py --check    # rebuild and compare with the committed file
"""

import argparse
import csv
import datetime
import hashlib
import io
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "data.json")

SOURCE_URL = (
    "https://raw.githubusercontent.com/frankbueltge/field-research/main/"
    "artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/data/cohort.csv"
)
# The file as this work read it on 2026-09-01. Both corpora behind it move, so
# a later fetch will differ; the hash is here to say which version was read.
SOURCE_SHA256 = "fff141f2a522c2a24773c1885622911e03201af6b42535ade9443093926ef81a"

# The Field's observation cutoff: the latest notice date in the distributed
# database on the day it was harvested. Stated in their METHOD.md.
CUTOFF = "2026-08-19"

# Rows checked one by one against the Crossref REST API on 2026-09-01, in the
# open — see check_notes in the output and the work's README.
CHECKED = {
    "10.3127/ajis.v9i2.202": {
        "crossref_published": "2002-05-01",
        "crossref_update_to": "expression_of_concern 2002-05-01, pointing at the paper itself",
        "note": "flag date and publication date are the same day; the clock has "
                "no independent start. Marked on the page and reported upstream.",
        "flag": "unclocked",
    },
    "10.1002/1521-4095(200010)12:20%3c1539::aid-adma1539%3e3.0.co;2-s": {
        "crossref_published": "2000-10",
        "crossref_updated_by": "none on the paper's own record; the notice "
                               "10.1002/adma.200390130 carries the act",
        "notice_title": "Retraction Adv. Mater. 6/2003",
        "notice_published": "2003-03-17",
        "notice_acts": "two retractions and one expression of concern, in one document; "
                       "the expression of concern is this paper",
        "note": "confirmed against Crossref: one notice, dated 2 years 5 months after "
                "publication, retracted two papers and flagged this one. The two are "
                "retracted; this one is still standing.",
        "flag": "confirmed",
    },
    "10.1111/j.1533-2500.2005.05105.x": {
        "crossref_published": "2005-02-17",
        "crossref_updated_by": "expression_of_concern 2005-05-17, "
                               "notice 10.1111/j.1533-2500.2005.05211.x",
        "note": "confirmed against Crossref: a separate notice document, three months "
                "after publication.",
        "flag": "confirmed",
    },
    "10.1177/00207209211064046": {
        "crossref_published": "2021-12-15",
        "crossref_update_to": "expression_of_concern 2021-12-15, pointing at the paper itself",
        "note": "flag date and publication date are the same day; no independent start. "
                "From the batch of 2021-12-15.",
        "flag": "unclocked",
    },
}

# Figures published by The Field on 2026-09-01 and used on this page. They are not
# recomputed here — the row file does not carry them — so they are carried as their
# figures, attributed, rather than presented as this room's own arithmetic.
FIELD_REPORTED = {
    "median_days_to_resolution": {
        "value": 291,
        "what": "median days from expression of concern to retraction, among papers "
                "that were resolved; bootstrapped over issuance days",
        "source": "The Field, session 143, 2026-09-01, BULLETIN.md and "
                  "artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/",
    },
    "other_outcomes": {
        "corrections": 53,
        "reinstatements": 4,
        "what": "papers in the whole cohort whose next notice was a correction or a "
                "reinstatement; both count as unresolved under the cohort rule",
        "source": "The Field, METHOD.md, 'What this measurement cannot see', point 2",
    },
}


def day(s):
    return datetime.date(*map(int, s.split("-")))


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "studio/not-yet"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()


def build():
    raw = fetch(SOURCE_URL)
    got = hashlib.sha256(raw).hexdigest()
    rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))
    cut = day(CUTOFF)

    standing = [r for r in rows if not r["days_to_retraction"]]
    standing.sort(key=lambda r: (r["concern_date"], r["original_doi"]))

    entries = []
    for r in standing:
        started = day(r["concern_date"])
        e = {
            "doi": r["original_doi"],
            "concern_date": r["concern_date"],
            "publisher": r["publisher"],
            "notice_doi": r["concern_notice_doi"],
            "days_at_cutoff": (cut - started).days,
            "notice_is_the_paper": r["concern_notice_doi"] == r["original_doi"],
        }
        if r["original_doi"] in CHECKED:
            e["checked"] = CHECKED[r["original_doi"]]
        entries.append(e)

    ages = sorted(e["days_at_cutoff"] for e in entries)
    n = len(entries)
    total = sum(ages)

    # Accumulated standing time at the end of each calendar year: the sum, over
    # every flag raised by then and not yet resolved at the cutoff, of the days
    # it had stood. It is a curve of a debt, not of arrivals.
    starts = sorted(day(e["concern_date"]) for e in entries)
    accrual = []
    for y in range(starts[0].year, cut.year + 1):
        end = min(datetime.date(y, 12, 31), cut)
        accrual.append({
            "year": y,
            "standing": sum(1 for s in starts if s <= end),
            "days": sum((end - s).days for s in starts if s <= end),
        })

    arrivals = {}
    for e in entries:
        arrivals[e["concern_date"][:4]] = arrivals.get(e["concern_date"][:4], 0) + 1

    publishers = {}
    for e in entries:
        publishers[e["publisher"]] = publishers.get(e["publisher"], 0) + 1
    top = sorted(publishers.items(), key=lambda kv: (-kv[1], kv[0]))[:8]

    batches = {}
    for e in entries:
        batches[e["concern_date"]] = batches.get(e["concern_date"], 0) + 1
    big = sorted(batches.items(), key=lambda kv: (-kv[1], kv[0]))[:3]

    mature = [r for r in rows if r["in_mature_cohort"] == "1"]
    mature_resolved = sum(1 for r in mature if r["resolved_within_5y"] == "1")

    data = {
        "work": "NOT YET",
        "date": "2026-09-01",
        "source": {
            "practice": "The Field",
            "repo": "frankbueltge/field-research",
            "artifact": "artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/",
            "file": "data/cohort.csv",
            "url": SOURCE_URL,
            "sha256_read": SOURCE_SHA256,
            "sha256_now": got,
            "read_on": "2026-09-01",
            "underlying": "the Retraction Watch database as distributed by "
                          "Crossref (https://api.labs.crossref.org/data/retractionwatch), "
                          "plus Crossref's own deposited notice records. No licence "
                          "claim is made here over either.",
            "cutoff": CUTOFF,
        },
        "counts": {
            "cohort_rows": len(rows),
            "standing": n,
            "total_days_at_cutoff": total,
            "total_years_at_cutoff": round(total / 365.2425, 1),
            "median_days": ages[n // 2],
            "p25_days": ages[n // 4],
            "p75_days": ages[3 * n // 4],
            "oldest_days": ages[-1],
            "newest_days": ages[0],
            "over_1y": sum(1 for a in ages if a >= 365.2425),
            "over_3y": sum(1 for a in ages if a >= 3 * 365.2425),
            "over_5y": sum(1 for a in ages if a >= 5 * 365.2425),
            "over_10y": sum(1 for a in ages if a >= 10 * 365.2425),
            "over_20y": sum(1 for a in ages if a >= 20 * 365.2425),
            "distinct_publishers": len(publishers),
            "distinct_flag_days": len(batches),
            "notice_is_the_paper": sum(1 for e in entries if e["notice_is_the_paper"]),
            "notice_unavailable": sum(1 for e in entries if e["notice_doi"] == "unavailable"),
            "seconds_per_accrued_day": round(86400.0 / n, 2),
            "years_accrued_per_day": round(n / 365.2425, 3),
        },
        "field_reported": FIELD_REPORTED,
        "re_derived": {
            "what": "The Field's headline, recomputed here from the row file",
            "mature_cohort": len(mature),
            "resolved_within_5y": mature_resolved,
            "share": round(100.0 * mature_resolved / len(mature), 1),
            "their_published_figure": 47.1,
        },
        "biggest_flag_days": [{"date": d, "n": c} for d, c in big],
        "top_publishers": [{"publisher": p, "n": c} for p, c in top],
        "arrivals": [{"year": y, "n": arrivals[y]} for y in sorted(arrivals)],
        "accrual": accrual,
        "entries": entries,
    }
    return data, got


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    data, got = build()
    if got != SOURCE_SHA256:
        print("NOTE: the source file has changed since this work read it.")
        print("  read:", SOURCE_SHA256)
        print("  now :", got)
        print("  The committed data.json is the 2026-09-01 reading and stays as it is.")

    if a.check:
        have = json.load(open(OUT))
        fresh = json.loads(json.dumps(data))
        # the live hash of a moving upstream file is not part of the comparison
        have_c = dict(have)
        have_c["source"] = {k: v for k, v in have["source"].items() if k != "sha256_now"}
        fresh_c = dict(fresh)
        fresh_c["source"] = {k: v for k, v in fresh["source"].items() if k != "sha256_now"}
        if have_c == fresh_c:
            print("data.json reproduces from the source. OK")
            return 0
        print("data.json does NOT reproduce from the source.")
        for k in fresh_c:
            if have_c.get(k) != fresh_c[k]:
                print("  differs:", k)
        return 1

    json.dump(data, open(OUT, "w"), indent=1, sort_keys=False)
    print("wrote %s — %d standing warnings, %d days" %
          (OUT, data["counts"]["standing"], data["counts"]["total_days_at_cutoff"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
