#!/usr/bin/env python3
"""THE SAME NUMBER TWICE — derive data.json from three readings of one census.

The doors are the forty rows of the sibling practice The Field's census of
2026-09-01 (`a-door-to-knock-on/data/census.csv`). Three readings of them
exist. This work knocks at nothing; it joins the three and measures where they
part.

  reading 1  The Field, shipped 2026-09-01: the `machine_blocked` column of
             census.csv. Withdrawn by its authors on 2026-09-03 as not
             derivable from the statuses committed beside it. Read here from
             the field their re-probe re-ships, cross-checked against the copy
             this room took on 2026-09-01.
  reading 2  Ensemble, 2026-09-01: this room's own knock, one plain GET per
             row, two full runs minutes apart, committed in ONE KNOCK EACH.
  reading 3  The Field, 2026-09-03: a pre-registered four-arm re-probe.

Two units are kept apart throughout, because the census's forty rows stand at
thirty-nine addresses: two rows (Springer - Biomed Central and BioMed Central)
carry the same URL, which the census's own note records as one canonical page
reached by two searches. Every count here is given as rows and as addresses.

Inputs:

  ../2026-09-01-one-knock-each/data.json      committed in this repository
  summary.json   }  fetched from the sibling repository, compared by hash,
  CORRECTIONS.md }  never copied into this one
  census.csv     }

Nothing is hand-entered. Every number the page states is computed here and
--check recomputes it and compares.

  python3 make-data.py            # write data.json  (fetches from the sibling repo)
  python3 make-data.py --check    # recompute and compare with the committed file
"""

import argparse
import csv
import hashlib
import io
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OURS = os.path.join(HERE, "..", "2026-09-01-one-knock-each", "data.json")

OURS_SHA = "3b5e9939370228976e97b05f38e6af584a52eea614f4a418e286757fc7c0ca7a"

FIELD = "https://raw.githubusercontent.com/frankbueltge/field-research/main"
SOURCES = {
    "summary": {
        "url": FIELD + "/artifacts/cycle-001/2026-09-03-the-sign-and-the-door/data/summary.json",
        "sha256": "833775b9cfdd510db23d5c64b6cfcb121257b5e7908a9c703a05d7872d7ed9c8",
        "what": "the four-arm re-probe of the same forty rows, 2026-09-03, with each "
                "row's per-arm status and the shipped machine_blocked flag beside it",
    },
    "corrections": {
        "url": FIELD + "/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/CORRECTIONS.md",
        "sha256": "b1517fea1095895cae7ecbd8022b2f7d5dfaad17bfb00720bee3dbb43a42af12",
        "what": "the dated correction in which the shipped column and the 45 % it "
                "produced are withdrawn by the practice that published them",
    },
    "census": {
        "url": FIELD + "/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv",
        "sha256": "edb4ccf424550cedde33ed5a1c0ebe5f13cfe6c189362d0c40ee406724e72016",
        "what": "the census the rows come from, as read by ONE KNOCK EACH; re-read "
                "here for the two rows that stand at one address",
    },
}


def fetch(url):
    r = subprocess.run(["curl", "-sSf", "-L", url], capture_output=True)
    if r.returncode != 0:
        sys.exit("fetch failed: %s\n%s" % (url, r.stderr.decode()[:400]))
    return r.stdout


def sha(b):
    return hashlib.sha256(b).hexdigest()


def build():
    with open(OURS, "rb") as f:
        raw = f.read()
    if sha(raw) != OURS_SHA:
        sys.exit("ONE KNOCK EACH has moved from the hash this work reads it at. "
                 "Refusing to run: re-read it and re-pin before rebuilding.")
    ours = json.loads(raw)

    got, body = {}, {}
    for key, src in SOURCES.items():
        b = fetch(src["url"])
        got[key], body[key] = sha(b), b
        if got[key] != src["sha256"]:
            sys.exit("%s has moved from the hash this work reads it at (%s). "
                     "Refusing to run: a source that moved is a new reading, not this one."
                     % (key, got[key]))
    summary = json.loads(body["summary"])
    census = list(csv.DictReader(io.StringIO(body["census"].decode("utf-8"))))

    # --- the join, and the unit it is honest in --------------------------
    # summary.json's rows are keyed by URL and two of them share one. Collapse
    # only after asserting the shared rows carry the same recorded reading;
    # otherwise the join would silently give one publisher another's statuses.
    theirs = {}
    for d in summary["doors"]:
        keep = {k: d[k] for k in ("verdict", "status", "shipped_machine_blocked", "layer")}
        if d["url"] in theirs and theirs[d["url"]] != keep:
            sys.exit("two re-probe rows share the URL %s and do not carry the same "
                     "reading; the join would misattribute one to the other" % d["url"])
        theirs[d["url"]] = keep

    seen, dup_groups = {}, {}
    for r in census:
        seen.setdefault(r["evidence_url"], []).append(r["publisher"])
    for url, pubs in seen.items():
        if len(pubs) > 1:
            dup_groups[url] = sorted(pubs)

    doors = []
    for d in ours["doors"]:
        t = theirs[d["evidence_url"]]
        doors.append({
            "publisher": d["publisher"],
            "concerns": d["concerns"],
            "url": d["evidence_url"],
            "layer": t["layer"],
            "shares_address_with": [p for p in dup_groups.get(d["evidence_url"], [])
                                    if p != d["publisher"]],
            "r1_shipped_blocked": bool(d["field_machine_blocked"]),
            "r1_shipped_blocked_reshipped": bool(t["shipped_machine_blocked"]),
            "r2_state": d["state"],
            "r2_status": d["status"],
            "r2_status_b": d["status_b"],
            "r2_title": (d.get("title") or "").strip(),
            "r2_markers": d.get("challenge_markers") or [],
            "r3_verdict": t["verdict"],
            "r3_status_a": t["status"].get("A"),
            "r3_status_all": t["status"],
            # the three readings as each was published
            "r1_shut": bool(d["field_machine_blocked"]),
            "r2_shut": d["state"] in ("refused", "challenge"),
            "r3_shut": t["verdict"] != "open",
            # the same doors under one rule each reading could have applied
            "status_shut_r2": not 200 <= d["status"] < 300,
            "status_shut_r3": not 200 <= t["status"].get("A") < 300,
            "arms_shut_r3": t["verdict"] == "impasse",
        })
    doors.sort(key=lambda x: (-x["concerns"], x["publisher"]))

    drift = [d["publisher"] for d in doors
             if d["r1_shipped_blocked"] != d["r1_shipped_blocked_reshipped"]]
    if drift:
        sys.exit("the shipped column read here on 2026-09-01 and re-shipped on "
                 "2026-09-03 disagree at: %s" % drift)
    if len(doors) != len(census):
        sys.exit("row count drift: %d joined, %d in the census" % (len(doors), len(census)))

    total = sum(d["concerns"] for d in doors)
    by_pub = {d["publisher"]: d for d in doors}
    addresses = sorted({d["url"] for d in doors})

    def group(field):
        return {d["publisher"] for d in doors if d[field]}

    def size(s):
        """A set of publisher rows, counted three ways: rows, distinct
        addresses, and the concerns behind them as a share of the cohort."""
        urls = {by_pub[p]["url"] for p in s}
        return {"rows": len(s), "addresses": len(urls),
                "wt": round(100.0 * sum(by_pub[p]["concerns"] for p in s) / total, 1)}

    S1, S2, S3 = group("r1_shut"), group("r2_shut"), group("r3_shut")
    A2, A3 = group("status_shut_r2"), group("status_shut_r3")
    C3 = group("arms_shut_r3")

    named_once = sorted(p for p in (S1 | S2 | S3)
                        if (p in S1) + (p in S2) + (p in S3) == 1)
    named_twice = sorted(p for p in (S1 | S2 | S3)
                         if (p in S1) + (p in S2) + (p in S3) == 2)

    # the rule grid: which reading can answer which question at all
    NOT_RECORDED_1 = ("withdrawn — its authors state the flag is not derivable "
                      "from the statuses committed beside it")
    NOT_RECORDED_BODY = "no page body recorded — statuses and response headers only"
    NOT_RECORDED_ARMS = "one arm only — this room made a single request per row"
    grid = [
        {"rule": "the status line of one honestly identified request",
         "cells": [{"reading": "r1", "answer": None, "why": NOT_RECORDED_1},
                   {"reading": "r2", "answer": size(A2), "set": sorted(A2)},
                   {"reading": "r3", "answer": size(A3), "set": sorted(A3)}]},
        {"rule": "what arrived — a 2xx carrying a page about the caller is not an opening",
         "cells": [{"reading": "r1", "answer": None, "why": NOT_RECORDED_1},
                   {"reading": "r2", "answer": size(S2), "set": sorted(S2)},
                   {"reading": "r3", "answer": None, "why": NOT_RECORDED_BODY}]},
        {"rule": "refused every one of four arms",
         "cells": [{"reading": "r1", "answer": None, "why": NOT_RECORDED_1},
                   {"reading": "r2", "answer": None, "why": NOT_RECORDED_ARMS},
                   {"reading": "r3", "answer": size(C3), "set": sorted(C3)}]},
    ]

    out = {
        "work": "THE SAME NUMBER TWICE",
        "practice": "Ensemble — The Studio",
        "date": "2026-09-03",
        "unit": {
            "rows": len(doors),
            "addresses": len(addresses),
            "duplicate_addresses": {u: p for u, p in dup_groups.items()},
            "note": "The census carries one row per publisher. Two of its rows stand at "
                    "one address, which its own note records as one canonical page "
                    "reached by two searches. A count of doors is therefore not the "
                    "same number as a count of rows, and both are given.",
        },
        "doors": doors,
        "total_concerns": total,
        "readings": [
            {"key": "r1", "who": "The Field", "date": "2026-09-01",
             "what": "the machine_blocked column shipped in census.csv",
             "status": "WITHDRAWN by its authors 2026-09-03",
             "as_published": size(S1)},
            {"key": "r2", "who": "Ensemble", "date": "2026-09-01",
             "what": "one plain GET per row from this room, two runs, both agreeing; "
                     "shut = refused outright, or answered a 2xx with a page about the caller",
             "status": "this room's own measurement, live",
             "as_published": size(S2)},
            {"key": "r3", "who": "The Field", "date": "2026-09-03",
             "what": "a pre-registered four-arm re-probe; shut = anything but open to an "
                     "honestly identified request",
             "status": "live at time of reading",
             "as_published": size(S3)},
        ],
        "grid": grid,
        "sets": {
            "r1": sorted(S1), "r2": sorted(S2), "r3": sorted(S3),
            "core": sorted(S1 & S2 & S3), "union": sorted(S1 | S2 | S3),
            "named_by_exactly_one": named_once,
            "named_by_exactly_two": named_twice,
            "r1_not_r2": sorted(S1 - S2), "r2_not_r1": sorted(S2 - S1),
            "r3_not_r1": sorted(S3 - S1),
            "status_r2": sorted(A2), "status_r3": sorted(A3),
            "arms_r3": sorted(C3),
            "status_r3_not_arms": sorted(A3 - C3), "arms_not_status_r3": sorted(C3 - A3),
        },
        "counts": {
            "r1": size(S1), "r2": size(S2), "r3": size(S3),
            "r1_and_r2": size(S1 & S2), "core": size(S1 & S2 & S3),
            "union": size(S1 | S2 | S3),
            "named_once": len(named_once), "named_twice": len(named_twice),
            "open_to_all_three": {
                "rows": len(doors) - len(S1 | S2 | S3),
                "addresses": len(addresses) - size(S1 | S2 | S3)["addresses"],
                "wt": round(100.0 - size(S1 | S2 | S3)["wt"], 1)},
            "status_r2": size(A2), "status_r3": size(A3),
            "status_identical": A2 == A3,
            "arms_r3": size(C3), "status_r3_and_arms": size(A3 & C3),
        },
        "sources": {k: dict(v, sha256_as_read=got[k]) for k, v in SOURCES.items()},
        "ours": {"work": "ONE KNOCK EACH",
                 "path": "works/2026-09-01-one-knock-each/data.json",
                 "sha256_as_read": OURS_SHA,
                 "knocked_utc": [r["knocked_utc"] for r in ours["runs"]]},
    }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    out = build()
    path = os.path.join(HERE, "data.json")
    text = json.dumps(out, indent=1, ensure_ascii=False) + "\n"
    if a.check:
        with open(path, encoding="utf-8") as f:
            have = f.read()
        if have != text:
            sys.exit("data.json does not match a fresh derivation")
        print("data.json re-derived and identical (%d rows at %d addresses; %d/%d/%d)"
              % (out["unit"]["rows"], out["unit"]["addresses"],
                 out["counts"]["r1"]["rows"], out["counts"]["r2"]["rows"],
                 out["counts"]["r3"]["rows"]))
        return
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote data.json")


if __name__ == "__main__":
    main()
