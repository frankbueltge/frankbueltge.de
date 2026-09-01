#!/usr/bin/env python3
"""Re-derive every load-bearing figure on the cycle-001 presentation page.

Each check recomputes a number from the artifact's own committed data file and
then asserts that the exact string appears in `index.html`. The page cannot
drift from the evidence without this failing.

    python3 presentations/cycle-001/check.py

Exit 0 when the page agrees with the data, 1 otherwise.
"""

import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ART = os.path.join(ROOT, "artifacts", "cycle-001")

failures = []
checks = 0


def load(*parts):
    with open(os.path.join(*parts), encoding="utf-8") as fh:
        return json.load(fh)


def want(page, text, why):
    global checks
    checks += 1
    if text not in page:
        failures.append(f"{why}: page does not contain {text!r}")


def main():
    with open(os.path.join(HERE, "index.html"), encoding="utf-8") as fh:
        page = fh.read()

    # ---- 1. The yield of a loop -------------------------------------------
    y = load(ART, "2026-08-30-yield-of-a-loop", "data", "summary.json")
    want(page, str(y["first_half"]["yield_works_per_session"]), "yield, first half")
    want(page, str(y["second_half"]["yield_works_per_session"]), "yield, second half")
    want(page, str(y["sessions_indexed"]), "sessions indexed")
    want(page, str(y["window"]["days"]), "window in days")
    dry = y["after_last_shipping_day"]
    want(page, str(dry["sessions"]), "sessions in the no-delivery stretch")
    want(page, str(dry["commits"]), "commits in the no-delivery stretch")
    want(page, f"{dry['files_new']['drafts']:,}", "draft files in the no-delivery stretch")
    assert dry["works_shipped"] == 0, "the no-delivery stretch shipped something"
    want(page, str(y["first_half"]["sessions"]), "first-half sessions")
    want(page, str(y["first_half"]["works_shipped"]), "first-half works")

    # ---- 2. Links in the abstract -----------------------------------------
    l = load(ART, "2026-08-31-links-in-the-abstract", "data", "summary.json")
    a, b = l["cohorts"]["A"], l["cohorts"]["B"]
    want(page, f"{a['declaration_rate'] * 100:.1f} %", "cohort A declaration rate")
    want(page, f"{b['declaration_rate'] * 100:.1f} %", "cohort B declaration rate")
    # the complement is the sentence the page leads on
    want(page, f"{100 - a['declaration_rate'] * 100:.1f} %", "cohort A silence rate")
    want(page, str(a["papers"]), "cohort size")
    want(page, str(l["declaration_diff"]["z"]), "declaration z")
    want(page, f"p = {l['declaration_diff']['p']:.3f}", "declaration p")
    want(page, f"{a['resolution_rate'] * 100:.1f} %", "cohort A resolution rate")
    want(page, f"{b['resolution_rate'] * 100:.1f} %", "cohort B resolution rate")
    want(page, f"p = {l['resolution_diff']['p']}", "resolution p")
    want(page, str(l["resolution_mde_points"]), "detection floor")

    # ---- 3. How long a warning stands -------------------------------------
    w = load(ART, "2026-09-01-how-long-a-warning-stands", "data", "data.json")
    h = w["corpus_a"]["headline"]
    want(page, f"{h['share']:.1f} %", "headline resolved share")
    want(page, f"{100 - h['share']:.1f} %", "headline unresolved share")
    want(page, f"{h['n']:,}", "mature cohort size")
    want(page, str(h["resolved"]), "resolved count")
    want(page, f"{h['share_ci'][0]}–{h['share_ci'][1]} %", "published share interval")
    want(page, f"{h['median_days']} days", "median days to retraction")
    want(page, f"{w['corpus_a']['papers_with_a_concern']:,}", "papers ever under a concern")

    # ---- 4. A door to knock on --------------------------------------------
    d = load(ART, "2026-09-01-a-door-to-knock-on", "data", "data.json")
    want(page, str(d["n_publishers"]), "publishers in the census")
    want(page, str(d["class_A"]), "publishers publishing a route")
    want(page, f"{d['A_concern_weighted_pct']} %", "route share by concern weight")
    want(page, f"{d['A_floor_concern_weighted_pct']} %", "route share, floor reading")
    want(page, f"{d['concerns_covered_pct']} %", "share of concerns covered by the census")
    want(page, f"{d['concerns_covered']:,}", "concerns covered")
    want(page, str(d["machine_blocked"]), "machine-blocked doors")
    want(page, f"{d['machine_blocked_pct']:.0f} %", "machine-blocked share")
    want(page, str(d["largest_publisher_concerns"]), "largest publisher's concerns")
    want(page, f"{d['largest_publisher_share_pct']} %", "largest publisher's share")

    # the census figure the record mistyped as 94.0 %; assert the data, not the prose
    covered = round(100 * d["concerns_covered"] / d["cohort_concerns_total"], 1)
    if covered != d["concerns_covered_pct"]:
        failures.append(
            f"census coverage: {d['concerns_covered']}/{d['cohort_concerns_total']} "
            f"= {covered} %, but data.json says {d['concerns_covered_pct']} %")

    # ---- 5. This session's audit ------------------------------------------
    ind = load(HERE, "data", "independence.json")
    by = {s["scheme"]: s for s in ind["schemes"]}
    for scheme, label in (("paper", "paper"), ("notice", "notice"), ("day", "day")):
        s = by[scheme]
        want(page, f"{s['share_ci'][0]}–{s['share_ci'][1]} %", f"{label} interval")
        want(page, f"{s['ci_width']} pts", f"{label} interval width")
        want(page, str(s["design_effect"]), f"{label} design effect")
        want(page, f"{s['effective_n']:,}" if s["effective_n"] >= 1000
             else str(s["effective_n"]), f"{label} effective n")
    want(page, f"{by['notice']['units']:,}", "notice count, corrected")
    want(page, str(by["day"]["units"]), "issuance-day count")

    u = ind["uniformity"]
    want(page, str(u["multi_paper_notices"]), "multi-paper notices")
    want(page, str(u["papers_they_cover"]), "papers under multi-paper notices")
    want(page, str(u["uniform_observed"]), "uniform notices")
    want(page, f"{u['uniform_share']} %", "uniform share")
    want(page, f"{u['permutation_draws']:,}", "permutation draws")
    if u["draws_at_or_above_observed"] != 0:
        failures.append("permutation test no longer returns 0 draws at or above observed")

    sd = ind["sentinel_defect"]
    want(page, str(sd["papers_collapsed"]), "papers collapsed by the sentinel")
    want(page, str(sd["units_shipped"]), "notice count as shipped")
    want(page, f"{sd['notice_level_share_shipped']} %", "notice-level share as shipped")
    want(page, f"{sd['notice_level_share_corrected']} %", "notice-level share corrected")
    want(page, f"<code>{sd['sentinel']}</code>", "the sentinel string itself")

    # ---- report -----------------------------------------------------------
    if failures:
        print(f"FAIL — {len(failures)} of {checks} checks did not match:", file=sys.stderr)
        for f in failures:
            print("  " + f, file=sys.stderr)
        return 1
    print(f"ok — {checks} figures on the page re-derived from their data files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
