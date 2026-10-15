#!/usr/bin/env python3
"""ONE KNOCK EACH — derive data.json from the committed knocks.

Inputs, all committed beside this file:

  probe-log.json          the first of two full runs, 2026-09-01
  probe-log-2.json        the second, minutes later, same forty doors
  flap-royal-society.json six knocks at one door, twenty seconds apart

and the sibling census the doors come from, which is re-fetched here and
compared by hash rather than copied into this repository.

Nothing is hand-entered. Every number the page states is computed here from
those three files, and --check recomputes it and compares.

  python3 make-data.py            # write data.json  (fetches the census)
  python3 make-data.py --check    # recompute and compare with the committed file
"""

import argparse
import csv
import hashlib
import io
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import probe  # noqa: E402  — the normalizer the knock used, so both agree

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "data.json")

CENSUS_URL = (
    "https://raw.githubusercontent.com/frankbueltge/field-research/main/"
    "artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv"
)
CENSUS_PAGE = (
    "https://github.com/frankbueltge/field-research/tree/main/"
    "artifacts/cycle-001/2026-09-01-a-door-to-knock-on"
)

# A quote that has been elided or annotated by its collector cannot be tested
# verbatim against a page, and is excluded from the sentence count by rule, not
# by inspection. Both such rows are named on the face of the work.
COMPOSITE = ("...", "…", "[", "]")


def state(door):
    if door["outcome"] == "no_answer":
        return "no_answer"
    if door["outcome"] == "refused":
        return "refused"
    if door["is_challenge"]:
        return "challenge"
    return "opened"


def fetch_census():
    req = urllib.request.Request(CENSUS_URL, headers={"User-Agent": "EnsembleStudio/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
    return list(csv.DictReader(io.StringIO(raw.decode("utf-8")))), hashlib.sha256(raw).hexdigest()


def build():
    A = json.load(open(os.path.join(HERE, "probe-log.json")))
    B = json.load(open(os.path.join(HERE, "probe-log-2.json")))
    flap = json.load(open(os.path.join(HERE, "flap-royal-society.json")))
    rows, census_sha = fetch_census()

    assert len(rows) == len(A["doors"]) == len(B["doors"]) == 40, "forty doors or nothing"
    assert census_sha == A["census_sha256"] == B["census_sha256"], (
        "the census moved between the knock and this build; re-knock rather than re-index"
    )

    total_concerns = sum(int(r["concerns"]) for r in rows)
    doors = []
    for r, a, b in zip(rows, A["doors"], B["doors"]):
        assert r["publisher"] == a["publisher"] == b["publisher"]
        quote = (r["quote"] or "").strip()
        composite = any(m in quote for m in COMPOSITE)
        doors.append({
            "publisher": r["publisher"],
            "concerns": int(r["concerns"]),
            "weight_pct": round(100 * int(r["concerns"]) / total_concerns, 2),
            "stratum": r["stratum"],
            "field_class": r["class"],
            "field_grade": r["evidence_grade"],
            "field_machine_blocked": a["field_machine_blocked"],
            "route_kind": r["route_kind"],
            "address": a["address_tested"],
            "address_annotated": a["address_annotated"],
            "quote": quote,
            "quote_composite": composite,
            "quote_testable": bool(quote) and not composite,
            "evidence_url": r["evidence_url"].strip(),
            "state": state(a),
            "state_b": state(b),
            "status": a["status"],
            "status_b": b["status"],
            "title": a["title"],
            "bytes": a["bytes"],
            "challenge_markers": a["challenge_markers"],
            "opening_text": a["opening_text"],
            "quote_found": a["quote_found"],
            "address_found": a["address_found"],
            "quote_words": a["quote_words"],
            "fragment_words": a["fragment_words"],
            "fragment": a["fragment"],
            "redirects": len(a["redirects"]),
        })
        d = doors[-1]
        # Does the part of the sentence that did NOT arrive hold the address?
        na = probe.normalize(d["address"] or "")
        nq, nf = probe.normalize(quote), probe.normalize(d["fragment"])
        d["address_in_quote"] = bool(na) and na in nq
        d["stops_at_address"] = (
            d["address_in_quote"] and d["address_found"] is False
            and na not in nf and d["fragment_words"] < d["quote_words"])

    def n(pred):
        return sum(1 for d in doors if pred(d))

    def wt(pred):
        return round(sum(d["concerns"] for d in doors if pred(d)) * 100 / total_concerns, 1)

    has_addr = [d for d in doors if d["address"]]
    opened = [d for d in doors if d["state"] == "opened"]
    # The hinge: the invitation arrives and the address does not. Six consecutive
    # words is the threshold, fixed here and applied to every door alike.
    FRAG_MIN = 6
    withheld = [d for d in opened
                if d["address"] and d["address_found"] is False
                and d["fragment_words"] >= FRAG_MIN]
    stops = [d for d in withheld if d["stops_at_address"]]

    totals = {
        "doors": len(doors),
        "concerns": total_concerns,
        "refused": n(lambda d: d["state"] == "refused"),
        "challenge": n(lambda d: d["state"] == "challenge"),
        "opened": len(opened),
        "refused_wt": wt(lambda d: d["state"] == "refused"),
        "challenge_wt": wt(lambda d: d["state"] == "challenge"),
        "opened_wt": wt(lambda d: d["state"] == "opened"),
        "runs_disagree": [d["publisher"] for d in doors if d["state"] != d["state_b"]],
        "with_address": len(has_addr),
        "address_delivered": n(lambda d: d["address_found"] is True),
        "address_delivered_wt": wt(lambda d: d["address_found"] is True),
        "sentence_testable": n(lambda d: d["quote_testable"]),
        "sentence_delivered": n(lambda d: d["quote_found"]),
        "composite_quotes": [d["publisher"] for d in doors if d["quote_composite"]],
        "no_quote": [d["publisher"] for d in doors if not d["quote"]],
        "fragment_min": FRAG_MIN,
        "withheld": len(withheld),
        "withheld_names": [d["publisher"] for d in withheld],
        "stops_at_address": len(stops),
        "stops_names": [d["publisher"] for d in stops],
        "annotated_addresses": [d["publisher"] for d in doors if d["address_annotated"]],
        "field_class_a": n(lambda d: d["field_class"] == "A"),
        "class_a_address_delivered": n(
            lambda d: d["field_class"] == "A" and d["address_found"] is True),
        "class_a_with_address": n(
            lambda d: d["field_class"] == "A" and d["address"]),
        "class_a_refused": n(lambda d: d["field_class"] == "A" and d["state"] == "refused"),
        "class_a_challenge": n(lambda d: d["field_class"] == "A" and d["state"] == "challenge"),
        "field_machine_blocked": n(lambda d: d["field_machine_blocked"]),
        "shut_here": n(lambda d: d["state"] in ("refused", "challenge")),
        "shut_overlap": n(
            lambda d: d["field_machine_blocked"] and d["state"] in ("refused", "challenge")),
        "no_address_published": n(lambda d: not d["address"]),
        "interstitial_403": n(
            lambda d: d["state"] == "refused" and "just a moment" in d["challenge_markers"]),
    }

    flap_refused = sum(1 for k in flap["knocks"] if k["outcome"] == "refused")
    out = {
        "work": "ONE KNOCK EACH",
        "practice": "Ensemble — The Studio",
        "date": "2026-09-01",
        "census": {"url": CENSUS_URL, "page": CENSUS_PAGE, "sha256": census_sha,
                   "rows": len(rows)},
        "runs": [
            {"label": "first knock", "knocked_utc": A["knocked_utc"]},
            {"label": "second knock", "knocked_utc": B["knocked_utc"]},
        ],
        "vantage": A["vantage"],
        "user_agent": A["user_agent"],
        "totals": totals,
        "flap": {
            "door": flap["door"], "url": flap["url"], "why": flap["why"],
            "knocked_utc": flap["knocked_utc"],
            "knocks": flap["knocks"], "refused": flap_refused, "n": len(flap["knocks"]),
        },
        "doors": doors,
    }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    fresh = build()
    if args.check:
        old = json.load(open(OUT))
        if json.dumps(old, sort_keys=True) != json.dumps(fresh, sort_keys=True):
            print("CHECK: data.json does not match a rebuild from the committed knocks",
                  file=sys.stderr)
            return 1
        print("CHECK: data.json rebuilds identically.", file=sys.stderr)
        return 0
    with open(OUT, "w") as f:
        json.dump(fresh, f, indent=1)
        f.write("\n")
    t = fresh["totals"]
    print(json.dumps(t, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
