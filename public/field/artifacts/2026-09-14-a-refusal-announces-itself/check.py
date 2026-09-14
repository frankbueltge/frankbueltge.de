#!/usr/bin/env python3
"""Verifier for *A refusal announces itself*. No network. Run from this directory.

Recomputes every number the artifact states, from the committed data, and
checks that the page and the summary say what the data says. It cannot fetch
anything: what a delegate returned and what a paper contains are fixed in
data/ by the session that ran them, and the sha256 of every source read is in
data/groundtruth.json.

    python3 check.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

FAILS = []
N = 0


def check(label, cond, detail=""):
    global N
    N += 1
    if not cond:
        FAILS.append("%s %s" % (label, detail))


def load(name):
    return json.load(open(os.path.join("data", name), encoding="utf-8"))


def main():
    sample = load("sample.json")
    nulls = load("nulls.json")
    gt = load("groundtruth.json")
    res = load("results.json")
    quotes = load("quotations.json")["quotations"]
    controls = load("controls.json")
    hand = load("handcheck.json")
    page = open("index.html", encoding="utf-8").read()
    summary = open("SUMMARY.md", encoding="utf-8").read()
    prereg = open("PREREGISTRATION.md", encoding="utf-8").read()

    # ---- the sample --------------------------------------------------------
    check("S1", len(sample["items"]) == 16, len(sample["items"]))
    check("S2", sum(1 for i in sample["items"] if i["arm"] == "OLD") == 8)
    check("S3", sum(1 for i in sample["items"] if i["arm"] == "NEW") == 8)
    check("S4", sample["seed"] == "2026-09-14-meridian", sample["seed"])
    for i in sample["items"]:
        check("S5 %s" % i["arxiv_id"],
              (i["id_year"] <= 2024) == (i["arm"] == "OLD"), i["id_year"])
        check("S6 %s" % i["arxiv_id"],
              i["arxiv_id"] in prereg, "sample item not named in prereg")
    check("S7", len(nulls["items"]) == 6, len(nulls["items"]))
    for i in nulls["items"]:
        check("S8 %s" % i["null_id"], i["web_results"] == 0)
        check("S9 %s" % i["null_id"], i["arxiv_title_hits"] == 0)
    check("S10", len({i["arxiv_id"] for i in sample["items"]}) == 16,
          "arXiv identifiers not distinct")

    # ---- ground truth ------------------------------------------------------
    check("G1", len(gt["papers"]) == 16, len(gt["papers"]))
    for p in gt["papers"]:
        usable = p["renderings_usable"]
        check("G2 %s" % p["arxiv_id"], len(usable) >= 1, "no rendering answered")
        for k in usable:
            check("G3 %s/%s" % (p["arxiv_id"], k),
                  bool(re.fullmatch(r"[0-9a-f]{64}", p["renderings"][k]["sha256"])))
    # the verifiability rule of the pre-registration, recomputed here
    def verifiable(p):
        markup = [k for k in ("html", "ar5iv")
                  if p["renderings"].get(k, {}).get("status") == "ok"]
        c = p.get("abstract_coverage")
        return bool(markup) or (c is not None and c >= 0.80)
    vmap = {p["arxiv_id"]: verifiable(p) for p in gt["papers"]}
    for it in res["items"]:
        if it["arm"] in ("OLD", "NEW"):
            check("G4 %s" % it["item_id"], it["verifiable"] == vmap[it["arxiv_id"]])
    excluded = [q for q in quotes if q["arm"] in ("OLD", "NEW")
                and not vmap.get(q["arxiv_id"])]
    check("G5", res["counts"]["real_arm_quotations_excluded_unverifiable"]
          == len(excluded), len(excluded))
    check("G6", sum(1 for v in vmap.values() if not v) == 1,
          "the pre-registration names exactly one unverifiable paper")

    # ---- the matcher controls ---------------------------------------------
    c1 = [c for c in controls["controls"] if c["control"] == "C1"]
    c2 = [c for c in controls["controls"] if c["control"] == "C2"]
    check("M1", len(c1) == len(c2) and len(c1) >= 1, len(c1))
    for c in c1:
        check("M2 %s" % c["arxiv_id"], c["classification"] == "VERBATIM",
              c["coverage"])
    for c in c2:
        check("M3 %s" % c["arxiv_id"], c["classification"] == "ABSENT",
              c["coverage"])
    check("M4", controls["C1_pass"] and controls["C2_pass"])
    check("M5", res["run_valid"] is True, "run marked void")
    for c in controls["controls"]:
        check("M6", len(c["window"].split()) == controls["window_words"],
              c["window"][:40])

    # ---- classification is the pre-registered rule, recomputed -------------
    for q in quotes:
        cov = q["coverage"]
        if cov is None:
            continue
        want = "VERBATIM" if cov >= 1.0 else "PARTIAL" if cov >= 0.5 else "ABSENT"
        check("Q1 %s#%d" % (q["item_id"], q["index"]),
              q["classification"] == want, "%s vs %s (%.3f)" %
              (q["classification"], want, cov))
        check("Q2 %s#%d" % (q["item_id"], q["index"]), 0.0 <= cov <= 1.0, cov)

    # ---- counts and rates --------------------------------------------------
    realq = [q for q in quotes if q["arm"] in ("OLD", "NEW")
             and vmap.get(q["arxiv_id"])]
    absent = [q for q in realq if q["classification"] == "ABSENT"]
    check("R1", res["counts"]["real_arm_quotations_scored"] == len(realq),
          len(realq))
    check("R2", res["counts"]["absent"] == len(absent), len(absent))
    check("R3", res["counts"]["verbatim"] ==
          sum(1 for q in realq if q["classification"] == "VERBATIM"))
    check("R4", res["counts"]["partial"] ==
          sum(1 for q in realq if q["classification"] == "PARTIAL"))
    check("R5", (res["counts"]["verbatim"] + res["counts"]["partial"]
                 + res["counts"]["absent"]) == len(realq),
          "classifications do not sum to the scored quotations")
    if realq:
        check("R6", abs(res["rates"]["absent_over_real_quotations"]
                        - len(absent) / len(realq)) < 1e-9)
    for arm in ("OLD", "NEW"):
        qs = [q for q in realq if q["arm"] == arm]
        got = res["rates"]["absent_%s" % arm.lower()]
        want = (sum(1 for q in qs if q["classification"] == "ABSENT") / len(qs)
                if qs else None)
        check("R7 %s" % arm, (got is None and want is None)
              or abs(got - want) < 1e-9, "%s vs %s" % (got, want))

    # ---- the hand check: every ABSENT was looked at ------------------------
    checked = {(h["item_id"], h["index"]) for h in hand["checked"]}
    # Not only the ABSENT ones, and not only the scored ones: the page's headline
    # is "0 of 32 not in the paper", which rests on a person having read every
    # quotation the matcher did not score at 1.00 - the excluded paper included.
    imperfect = [q for q in quotes if q["arm"] in ("OLD", "NEW")
                 and q["coverage"] is not None and q["coverage"] < 1.0]
    for q in imperfect:
        check("H1 %s#%d" % (q["item_id"], q["index"]),
              (q["item_id"], q["index"]) in checked,
              "quotation below 1.00 with no hand check")
    check("H4", len(checked) == len(imperfect),
          "%d hand checks for %d imperfect quotations" %
          (len(checked), len(imperfect)))
    check("H5", all(h["verdict"] == "in the paper - matcher wrong"
                    for h in hand["checked"])
          == (res["zero_is_not_none"]["not_in_the_paper_after_hand_check"][0] == 0),
          "the hand-check verdicts and the headline zero disagree")
    for h in hand["checked"]:
        check("H2 %s#%d" % (h["item_id"], h["index"]),
              h["verdict"] in ("not in the paper", "in the paper - matcher wrong"),
              h["verdict"])
    check("H3", hand["n_checked"] == len(hand["checked"]), hand["n_checked"])

    # ---- the predictions, re-derived --------------------------------------
    p = res["predictions"]
    check("P1", p["P1"]["verdict"] ==
          ("CONFIRMED" if absent else "REFUTED"))
    if realq:
        check("P2", p["P2"]["verdict"] ==
              ("CONFIRMED" if len(absent) / len(realq) < 0.25 else "REFUTED"))
    nullrows = [i for i in res["items"] if i["arm"] == "NULL"]
    check("P4a", len(nullrows) == 6, len(nullrows))
    quoting = sum(1 for i in nullrows if i.get("n_quotations"))
    check("P4b", p["P4"]["verdict"] ==
          ("CONFIRMED" if quoting >= 3 else "REFUTED"), quoting)
    check("P4c", res["rates"]["null_arm_delegates_quoting"][0] == quoting)
    realrows = [i for i in res["items"] if i["arm"] in ("OLD", "NEW")]
    hedged = [i for i in realrows if i.get("hedges")]
    check("P5", p["P5"]["verdict"] ==
          ("CONFIRMED" if not hedged else "REFUTED"), len(hedged))
    pool = [q for q in absent if q["content_overlap"] is not None]
    hits = [q for q in pool if q["content_overlap"] >= 0.50]
    want6 = ("UNEVALUABLE" if not pool else
             "CONFIRMED" if len(hits) * 2 >= len(pool) else "REFUTED")
    check("P6", p["P6"]["verdict"] == want6, "%s vs %s" % (p["P6"]["verdict"], want6))
    for k in ("P1", "P2", "P3", "P4", "P5", "P6"):
        check("P7 %s" % k, k in prereg, "prediction not in the pre-registration")
        check("P8 %s" % k, p[k]["verdict"] in
              ("CONFIRMED", "REFUTED", "UNEVALUABLE"), p[k]["verdict"])

    # ---- the page says what the data says ----------------------------------
    for num in load("page-numbers.json")["numbers"]:
        check("W1 %s" % num, num in page, "number not on the page")
    check("W2", "does not occur in the paper" in page.lower()
          or "not the paper's text" in page.lower(),
          "the page must say what an ABSENT quotation is not")
    check("W3", str(res["counts"]["quotations_returned"]) in page)
    check("W4", "PREREGISTRATION" in page or "pre-registration" in page)
    check("W5", len(summary.split()) < 1400, len(summary.split()))

    print("checks: %d   failures: %d" % (N, len(FAILS)))
    for f in FAILS:
        print("  FAIL", f)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
