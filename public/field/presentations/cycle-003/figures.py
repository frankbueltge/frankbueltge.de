#!/usr/bin/env python3
"""Cycle 003 presentation — every figure, read from the artifact that made it.

Session 159. Nothing in this file is a literal typed from a summary: each value is read out of the
committed data file of the artifact that produced it, at the path named in `PROVENANCE`. If an
artifact's data changes, this file changes with it or `check.py` fails.

The two figures made tonight come from this session's own data files:
  * data/agreement.json   - post-hoc, declared (PREREGISTRATION §2)
  * data/room-ladder.json - pre-registered (PREREGISTRATION §3)

No model is called anywhere in this file. Standard library only. No network.
"""

from __future__ import annotations

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
A = os.path.join(ROOT, "artifacts", "cycle-003")

S155 = os.path.join(A, "2026-09-08-complete-and-empty", "data")
S156 = os.path.join(A, "2026-09-09-the-denominator", "data")
S157 = os.path.join(A, "2026-09-11-does-it-travel", "data")
S158 = os.path.join(A, "2026-09-12-what-a-description-is-for", "data")

# Which artifact answers for which block of the page. Printed on the page so a reader can check.
PROVENANCE = {
    "s155": "artifacts/cycle-003/2026-09-08-complete-and-empty/data/{results,figures}.json",
    "s156": "artifacts/cycle-003/2026-09-09-the-denominator/data/sources.json",
    "s157": "artifacts/cycle-003/2026-09-11-does-it-travel/data/results.json",
    "s158": "artifacts/cycle-003/2026-09-12-what-a-description-is-for/data/"
            "{results,size-curve}.json",
    "s159": "presentations/cycle-003/data/{agreement,room-ladder}.json",
}


def load(*p):
    with open(os.path.join(*p), encoding="utf-8") as fh:
        return json.load(fh)


def collect() -> dict:
    F = {}

    # --- session 155, 2026-09-08 - the catalogue that is complete and empty -----------------
    r = load(S155, "results.json")
    g = load(S155, "figures.json")
    F["s155"] = {
        "entries": r["feeds"]["atlas"]["count"],
        "present_key_pct": r["declared_missing"]["atlas"]["completeness_pct"],
        "schema_fixed_pct": r["declared_missing"]["atlas"]["schema_completeness_pct"],
        "broad_k": r["headline"]["all"]["hollow_broad"]["k"],
        "broad_pct": r["headline"]["all"]["hollow_broad"]["pct"],
        "strict_pct": r["headline"]["all"]["hollow_strict"]["pct"],
        "rhizome_n": g["rhizome_n"],
        "rhizome_broad": g["rhizome_broad"],
        "not_rhizome_n": g["not_rhizome_n"],
        "not_rhizome_strict": g["not_rhizome_strict"],
    }

    # --- session 156, 2026-09-09 - whose denominator? ---------------------------------------
    s = load(S156, "sources.json")
    groups = {}
    for x in s["sources"]:
        groups.setdefault(x["author_group"], set()).add(x["axis_a"])
    ratio_groups = sorted(k for k, v in groups.items() if "S" in v or "P" in v)
    F["s156"] = {
        "included": len(s["sources"]),
        "rejected": len(s["rejected"]),
        "candidates": len(s["sources"]) + len(s["rejected"]),
        "groups": len(groups),
        "ratio_groups": len(ratio_groups),
        "schema_fixed": sum(1 for k in ratio_groups if "S" in groups[k]),
        "present_key": sum(1 for k in ratio_groups if "P" in groups[k]),
        "undetermined": sum(1 for x in s["sources"] if x["axis_a"] == "U"),
        "third_basis": sum(1 for x in s["sources"] if x["axis_a"] == "N"),
        "tier_weighted": sum(1 for x in s["sources"] if x["axis_b"] == "weighted"),
        "tier_weighted_groups": len({x["author_group"] for x in s["sources"]
                                     if x["axis_b"] == "weighted"}),
        "coded": sum(1 for x in s["sources"] if x["axis_a"] in ("S", "N")),
    }

    # --- session 157, 2026-09-11 - does the instrument travel? ------------------------------
    r = load(S157, "results.json")
    cat = r["catalogues"]
    a = r["audit"]
    F["s157"] = {
        "refuted": r["predictions"]["_tally"]["refuted"],
        "total": r["predictions"]["_tally"]["total"],
        "cma_records": cat["cma"]["records"],
        "cma_pct": cat["cma"]["declared_completeness_pct"],
        "uk_records": cat["uk"]["records"],
        "uk_pct": cat["uk"]["declared_completeness_pct"],
        "govdata_records": cat["govdata"]["records"],
        "govdata_pct": cat["govdata"]["declared_completeness_pct"],
        "audit_n": a["labelled"],
        "reader_says_nothing": a["reader_says_nothing"],
        "screen_flags": a["screen_flags"],
        "kappa": a["kappa"],
        "precision": a["precision"],
        "informed_kappa": a["informed_pass"]["kappa"],
        "informed_says_nothing": a["informed_pass"]["reader_says_nothing"],
        "r3_uk_pct": r["predictions"]["P5"]["uk_pct"],
        "r3_govdata_pct": r["predictions"]["P5"]["govdata_pct"],
    }

    # --- session 158, 2026-09-12 - what a description is for --------------------------------
    r = load(S158, "results.json")
    c = load(S158, "size-curve.json")
    am, uk = r["arms"]["atlas-masked"], r["arms"]["uk-masked"]
    F["s158"] = {
        "chance_pct": r["chance_accuracy_pct"],
        "home_accuracy": am["accuracy_pct"],
        "uk_accuracy": uk["accuracy_pct"],
        "home_flagged_n": am["flagged"]["n"],
        "home_flagged_correct": am["flagged"]["correct"],
        "home_precision": am["screen_vs_task"]["precision"],
        "uk_gap": uk["gap_points"],
        "home_gap": am["gap_points"],
        "refuted": r["predictions"]["_tally"]["refuted"],
        "confirmed": r["predictions"]["_tally"]["confirmed"],
        "not_evaluable": r["predictions"]["_tally"]["not_evaluable"],
        "total": r["predictions"]["_tally"]["total"],
        "uk_census_records": r["census"]["uk"]["records"],
        "uk_census_present_pct": r["census"]["uk"]["declared_completeness_pct"],
        "atlas_not_unique_pct": r["census"]["atlas"]["narrowing"]["not_unique_pct"],
        "uk_not_unique_pct": r["census"]["uk"]["narrowing"]["not_unique_pct"],
        "uk_under3": r["census"]["uk"]["narrowing"]["under_3_masked_tokens_pct"],
        "ladder_low_n": c["uk_ladder"][0]["n"],
        "ladder_low_pct": c["uk_ladder"][0]["not_unique_pct"],
        "ladder_high_n": c["uk_ladder"][-1]["n"],
        "ladder_high_pct": c["uk_ladder"][-1]["not_unique_pct"],
        "r4_low_pct": c["is_the_screen_itself_size_dependent"]["r4_duplicate_pct_at_521"],
        "r4_high_pct": c["is_the_screen_itself_size_dependent"]["r4_duplicate_pct_at_full"],
        "r4_ratio": c["is_the_screen_itself_size_dependent"]["r4_ratio_full_over_521"],
        "ladder": c["uk_ladder"],
    }
    F["s158"]["home_abroad_ratio"] = round(
        F["s158"]["uk_not_unique_pct"] / F["s158"]["atlas_not_unique_pct"], 1)
    F["s158"]["narrowing_ratio"] = round(
        F["s158"]["ladder_high_pct"] / F["s158"]["ladder_low_pct"], 2)

    # --- session 159, tonight ----------------------------------------------------------------
    ag = load(HERE, "data", "agreement.json")
    F["s159_agreement"] = {
        "n_per_arm": ag["arms"]["uk-masked"]["n"],
        "uk_pairs": ag["arms"]["uk-masked"]["pairs"],
        "atlas_pairs": ag["arms"]["atlas-masked"]["pairs"],
        "uk_mm_min": ag["summary"]["uk-masked"]["machine_machine_min"],
        "uk_mm_max": ag["summary"]["uk-masked"]["machine_machine_max"],
        "uk_mh_min": ag["summary"]["uk-masked"]["machine_human_min"],
        "uk_mh_max": ag["summary"]["uk-masked"]["machine_human_max"],
        "atlas_mm": ag["summary"]["atlas-masked"]["machine_machine_max"],
        "atlas_degenerate": len(ag["summary"]["atlas-masked"]["degenerate_cells"]),
        "cannot_join_kappa": ag["cannot_join"]["kappa_against_screen_2026_09_11"],
    }

    F["s158"]["ladder_rise_points"] = round(
        F["s158"]["ladder_high_pct"] - F["s158"]["ladder_low_pct"], 2)

    room = load(HERE, "data", "room-ladder.json")
    F["s159_room"] = room
    if room.get("ladder"):
        p6 = load(HERE, "data", "p6-diagnostic.json")
        F["s159_p6"] = {
            "size_free_max_se": p6["reading"]["size_free_rules_max_standard_errors"],
            "narrowing_se": p6["reading"]["narrowing_standard_errors"],
            "r2_bottom": p6["rules"]["r2_truncated_tail_pct"]["at_bottom_rung"],
            "r2_full": p6["rules"]["r2_truncated_tail_pct"]["at_full_population"],
            "draws": p6["bottom_rung_draws"],
        }
        F["s159_room"]["rise_points"] = round(
            room["ladder"][-1]["not_unique_pct"] - room["ladder"][0]["not_unique_pct"], 2)
    return F


if __name__ == "__main__":
    import pprint
    pprint.pprint(collect())
