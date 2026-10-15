#!/usr/bin/env python3
"""Cycle 002 presentation — the figure table.

Every number the presentation states is read here, from the committed data files of the
four artifacts and of this session's own probes. Nothing is typed into the page or the
summary by hand; `make_page.py` renders what this module returns, and `check.py` fails on
a one-digit disagreement between this module and the rendered page.

The rule that governs this file: a presentation adds NO new number to the artifacts it
gathers. Where it restates one it restates it from the same file the artifact shipped.
The only new numbers here are this session's own — the drift and freshness probes — and
they carry their own pre-registration in PREREGISTRATION.md.
"""

import datetime
import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ART = os.path.join(ROOT, "artifacts", "cycle-002")
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
SERIES = os.path.join(ROOT, "tools", "autoloop", "series")

S150 = "2026-09-03-a-loop-that-finds-things"
S151 = "2026-09-04-the-dial"
S152 = "2026-09-05-which-questions-count"
S153 = "2026-09-06-does-it-know-it-is-known"


def load(*parts):
    with open(os.path.join(*parts)) as f:
        return json.load(f)


def vector_digest(tests):
    rows = sorted(([t["key"], t["p"], t["n1"], t["n0"]] for t in tests), key=lambda r: r[0])
    return hashlib.sha256(json.dumps(rows, separators=(",", ":")).encode()).hexdigest()


def collect():
    f = {}

    # ---- session 150, the loop -------------------------------------------------------
    r = load(ART, S150, "data", "results.json")
    f["s150"] = {
        "records": r["corpus"]["records"],
        "questions": r["hypotheses"],
        "raw": r["M1_raw_findings"],
        "bh": r["M2_bh_survivors"],
        "bonferroni": r["M2_bonferroni_survivors"],
        "replicating": r["M6_replicating"],
        "null_per_run": r["M3_null_world"]["findings_per_run_mean"],
        "null_rate": r["M3_null_world"]["per_test_rejection_rate"],
    }

    # ---- session 151, the dial -------------------------------------------------------
    c = load(ART, S151, "data", "checks.json")["arms"]
    f["s151"] = {}
    for arm in ("arxiv", "crossref"):
        a = c[arm]
        f["s151"][arm] = {
            "records": a["records"],
            "questions": a["questions"],
            "distinct_pairs": a["distinct_pairs"],
            # The digest and the artifact quote the LEAN arm. Both are carried here and the
            # page names which is which — the artifact's own adversary made the through-origin
            # / mean-centred distinction load-bearing, and an unnamed arm hides it.
            "slope_lean": a["P1"]["lean"]["slope"],
            "r2_lean": a["P1"]["lean"]["r2"],
            "centered_r2_lean": a["P1"]["lean"]["centered_r2"],
            "slope_dense": a["P1"]["dense"]["slope"],
            "r2_dense": a["P1"]["dense"]["r2"],
            "centered_r2_dense": a["P1"]["dense"]["centered_r2"],
            "P2_holds": a["P2"]["holds"],
            "P4_holds": a["P4"]["holds"],
            "raw_findings": a["P4"]["raw_findings"],
            "bh_all66": a["P4"]["bh_survivors_all66"],
            "distinct_claims": a["P4"]["distinct_claims_all66"],
            "null_rate": a["P5"]["per_test_rate"],
            "null_ci": a["P5"]["ci95"],
        }
        f["s151"][arm]["k_min"] = min(load(ART, S151, "data", f"sweep-{arm}.json")["k_values"])
        f["s151"][arm]["k_max"] = max(load(ART, S151, "data", f"sweep-{arm}.json")["k_values"])
    f["s151"]["intervals_overlap_as_published"] = load(
        ART, S151, "data", "checks.json")["P5"]["intervals_overlap"]

    # ---- session 152, the denominator ------------------------------------------------
    den = load(ART, S152, "data", "denominator.json")
    f["s152"] = {
        "B_rate": den["P3"]["B_rate"],
        "C_rate": den["P3"]["C_rate"],
        "both_in_band": den["P3"]["both_in_band"],
        "published_disjoint": not den["P3"]["published_intervals_overlap"],
        "se_of_difference": den["P3_monte_carlo_error"]["se_of_difference_awake"],
    }

    # ---- session 153, the prior-art stage --------------------------------------------
    st = load(ART, S153, "data", "study.json")["measures"]
    armc = load(ART, S153, "data", "armC-live-claims.json")
    fired = [it for it in armc["items"] if it["verdict"] == "PRIOR ART POSSIBLE" and it["top"]]
    tops = [it["top"][0].get("doi") or it["top"][0].get("title", "") for it in fired]
    modal = max((tops.count(t) for t in set(tops)), default=0)
    f["s153"] = {
        "usable": st["n_usable"],
        "blind_hits": st["M1_armA_hit10"],
        "name_hits": st["armBname_hit10_post_hoc"],
        "probes_fired": st["M3_probes_fired"],
        "probes_n": st["M3_probes_n"],
        "repeat_identical": st["M4_repeat_identical"],
        "repeat_n": st["M4_repeat_n"],
        "armc_fired": len(fired),
        "armc_n": armc["n"],
        "armc_modal_top": modal,
    }

    # ---- this session: the series, night by night -------------------------------------
    nights = []
    for name in sorted(os.listdir(os.path.join(SERIES, "runs"))):
        if not name.endswith(".json"):
            continue
        d = load(SERIES, "runs", name)
        day = name[:-5]
        nights.append({
            "day": day,
            "weekday": datetime.date.fromisoformat(day).strftime("%A"),
            "records": d["corpus_records"],
            "file_digest": d["corpus_sha256"],
            "vector_digest": vector_digest(d["tests"]),
        })
    rows = {r["day"]: r for r in (json.loads(l) for l in
                                  open(os.path.join(SERIES, "series.jsonl")) if l.strip())}
    for n in nights:
        row = rows.get(n["day"], {})
        n["bh"] = row.get("bh_survivors")
        n["raw"] = row.get("raw_findings")
        n["null_rate"] = row.get("null_per_test_rate")
    seen = {}
    for n in nights:
        n["vector_label"] = seen.setdefault(n["vector_digest"], f"V{len(seen) + 1}")
    f["nights"] = nights
    f["series"] = {
        "n_nights": len(nights),
        "n_file_digests": len({n["file_digest"] for n in nights}),
        "n_vectors": len({n["vector_digest"] for n in nights}),
    }

    # ---- this session: the drift probe -------------------------------------------------
    dr = load(DATA, "corpus-drift.json")
    cmp0 = dr["comparisons"][0]
    f["drift"] = {
        "run_utc": dr["run_utc"],
        "fetch_a_utc": dr["fetches"][0]["fetched_utc"],
        "fetch_b_utc": dr["fetches"][1]["fetched_utc"],
        "seconds_apart": int(
            (datetime.datetime.strptime(dr["fetches"][1]["fetched_utc"], "%Y-%m-%dT%H:%M:%SZ")
             - datetime.datetime.strptime(dr["fetches"][0]["fetched_utc"], "%Y-%m-%dT%H:%M:%SZ")
             ).total_seconds()),
        "records": dr["fetches"][0]["records"],
        "file_digest_equal": cmp0["file_digest_equal"],
        "records_digest_equal": cmp0["records_digest_equal"],
        "ids_equal": cmp0["ids_equal"],
        "jaccard": cmp0["jaccard"],
        "published_max": dr["fetches"][0]["published_date_max"],
        "published_min": dr["fetches"][0]["published_date_min"],
        "vs_committed_identical": dr["vector_vs_committed"]["identical"],
        "vs_committed_n": dr["vector_vs_committed"]["n_committed"],
        "fresh": dr["fresh_run"],
    }

    # ---- this session: the freshness probe --------------------------------------------
    fr = load(DATA, "freshness.json")
    f["freshness"] = {
        "today": fr["today_utc"],
        "newest_submitted_sort": fr["summary"]["submittedDate"]["newest_published_any_category"],
        "newest_updated_sort": fr["summary"]["lastUpdatedDate"]["newest_published_any_category"],
        "lag_days": fr["summary"]["submittedDate"]["lag_days_vs_today"],
        "categories": fr["summary"]["submittedDate"]["categories_reporting"],
        "agree_across_sorts": (
            fr["summary"]["submittedDate"]["newest_published_any_category"]
            == fr["summary"]["lastUpdatedDate"]["newest_published_any_category"]),
        "by_category": {c: v["submittedDate"]["published_max"]
                        for c, v in fr["by_category"].items() if v.get("submittedDate")},
    }

    # ---- this session's pre-registered verdicts ----------------------------------------
    d = f["drift"]
    n = f["freshness"]
    f["predictions"] = [
        {"id": "P1", "claim": "two corpora fetched minutes apart: file digests differ, "
                              "record digests identical",
         "found": (f'file digests {"equal" if d["file_digest_equal"] else "differ"}, '
                   f'record digests {"identical" if d["records_digest_equal"] else "differ"}, '
                   f'Jaccard {d["jaccard"]:.3f}'),
         "verdict": "held" if (not d["file_digest_equal"] and d["records_digest_equal"])
                    else "refuted"},
        {"id": "P2", "claim": "the corpus is frozen across days: at least 60 of 66 test "
                              "outcomes match the committed run of 2026-09-06",
         "found": f'{d["vs_committed_identical"]} of {d["vs_committed_n"]} match',
         "verdict": "held" if d["vs_committed_identical"] >= 60 else "refuted"},
        {"id": "P3", "claim": "the newest record the loop can see is not from today",
         "found": f'newest submission {n["newest_submitted_sort"]}, probed {n["today"]} — '
                  f'{n["lag_days"]} days',
         "verdict": "held" if n["newest_submitted_sort"] < n["today"] else "refuted"},
        {"id": "P4", "claim": "if P2 holds, the two same-day fetches share 100 % of their ids",
         "found": f'antecedent failed — P2 refuted. The observation itself: id sets '
                  f'{"identical" if d["ids_equal"] else "differ"}',
         "verdict": "void"},
        {"id": "P5", "claim": "the four committed nights yield at most 2 distinct test vectors",
         "found": f'{f["series"]["n_nights"]} nights, '
                  f'{f["series"]["n_file_digests"]} recorded corpus digests, '
                  f'{f["series"]["n_vectors"]} distinct test vectors',
         "verdict": "held" if f["series"]["n_vectors"] <= 2 else "refuted"},
    ]
    return f


if __name__ == "__main__":
    print(json.dumps(collect(), indent=1, sort_keys=True))
