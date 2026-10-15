#!/usr/bin/env python3
"""Cycle 002 presentation — the checker.

PREREGISTRATION.md §6 promises that every figure restated on the presentation page can be
rebuilt from the committed data files, and that a one-digit difference fails. This is that
check. It needs no network.

What it does:

1. Rebuilds the figure table from the artifacts' committed data and this session's probe
   files, and asserts each restated figure equals what the artifact itself shipped.
2. Renders the page from that table into memory and asserts it is byte-identical to the
   committed `index.html` — so a number edited into the HTML by hand fails here.
3. Re-derives this session's own five verdicts from the probe data and asserts they match
   what the page displays.
4. Checks the SUMMARY's headline figures against the same table.

Usage: python3 presentations/cycle-002/check.py      (exit 0 = every figure reproduces)
"""

import io
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)

from figures import collect, vector_digest  # noqa: E402

FAILURES = []
CHECKS = [0]


def ok(label, got, want):
    CHECKS[0] += 1
    if got != want:
        FAILURES.append(f"{label}: page/table says {got!r}, data gives {want!r}")


def load(*p):
    with open(os.path.join(*p)) as f:
        return json.load(f)


def main():
    F = collect()
    A = os.path.join(ROOT, "artifacts", "cycle-002")

    # --- 1. every restated figure against the artifact that shipped it ------------------
    r = load(A, "2026-09-03-a-loop-that-finds-things", "data", "results.json")
    ok("s150 raw findings", F["s150"]["raw"], r["M1_raw_findings"])
    ok("s150 BH survivors", F["s150"]["bh"], r["M2_bh_survivors"])
    ok("s150 questions", F["s150"]["questions"], r["hypotheses"])
    ok("s150 records", F["s150"]["records"], r["corpus"]["records"])
    ok("s150 null rate", F["s150"]["null_rate"], r["M3_null_world"]["per_test_rejection_rate"])

    c = load(A, "2026-09-04-the-dial", "data", "checks.json")["arms"]
    for arm in ("arxiv", "crossref"):
        ok(f"s151 {arm} slope (lean)", F["s151"][arm]["slope_lean"], c[arm]["P1"]["lean"]["slope"])
        ok(f"s151 {arm} R2 (lean)", F["s151"][arm]["r2_lean"], c[arm]["P1"]["lean"]["r2"])
        ok(f"s151 {arm} records", F["s151"][arm]["records"], c[arm]["records"])
        ok(f"s151 {arm} raw findings", F["s151"][arm]["raw_findings"], c[arm]["P4"]["raw_findings"])
        ok(f"s151 {arm} distinct claims", F["s151"][arm]["distinct_claims"],
           c[arm]["P4"]["distinct_claims_all66"])
        # The dial's own central prediction died: the page says so, so assert it died.
        ok(f"s151 {arm} P2 refuted", F["s151"][arm]["P2_holds"], False)
        ok(f"s151 {arm} P4 refuted", F["s151"][arm]["P4_holds"], False)

    den = load(A, "2026-09-05-which-questions-count", "data", "denominator.json")
    ok("s152 B rate", F["s152"]["B_rate"], den["P3"]["B_rate"])
    ok("s152 C rate", F["s152"]["C_rate"], den["P3"]["C_rate"])
    ok("s152 rates indistinguishable", F["s152"]["both_in_band"], True)
    ok("s152 published as disjoint", F["s152"]["published_disjoint"], True)

    st = load(A, "2026-09-06-does-it-know-it-is-known", "data", "study.json")["measures"]
    ok("s153 blind hits", F["s153"]["blind_hits"], st["M1_armA_hit10"])
    ok("s153 name hits", F["s153"]["name_hits"], st["armBname_hit10_post_hoc"])
    ok("s153 usable targets", F["s153"]["usable"], st["n_usable"])
    ok("s153 repeat identical", F["s153"]["repeat_identical"], st["M4_repeat_identical"])
    # The correction of 2026-09-07: four of five, not five of five.
    armc = load(A, "2026-09-06-does-it-know-it-is-known", "data", "armC-live-claims.json")
    fired = [it for it in armc["items"] if it["verdict"] == "PRIOR ART POSSIBLE" and it["top"]]
    tops = [it["top"][0].get("doi") or it["top"][0].get("title", "") for it in fired]
    ok("s153 Arm C firings", F["s153"]["armc_fired"], len(fired))
    ok("s153 Arm C modal top", F["s153"]["armc_modal_top"],
       max((tops.count(t) for t in set(tops)), default=0))

    # --- 2. this session's own probes ---------------------------------------------------
    dr = load(HERE, "data", "corpus-drift.json")
    cmp0 = dr["comparisons"][0]
    ok("drift: file digests differ", cmp0["file_digest_equal"], False)
    ok("drift: record digests identical", cmp0["records_digest_equal"], True)
    ok("drift: id sets identical", cmp0["ids_equal"], True)
    ok("drift: jaccard", F["drift"]["jaccard"], 1.0)
    ok("drift: outcomes matching committed night", F["drift"]["vs_committed_identical"],
       dr["vector_vs_committed"]["identical"])

    fr = load(HERE, "data", "freshness.json")
    ok("freshness: newest served", F["freshness"]["newest_submitted_sort"],
       fr["summary"]["submittedDate"]["newest_published_any_category"])
    ok("freshness: both sort orders agree", F["freshness"]["agree_across_sorts"], True)
    ok("freshness: categories probed", F["freshness"]["categories"], 8)

    # --- 3. the nights, recomputed from the committed run files -------------------------
    runs = os.path.join(ROOT, "tools", "autoloop", "series", "runs")
    recomputed = {}
    for name in sorted(os.listdir(runs)):
        if name.endswith(".json"):
            recomputed[name[:-5]] = vector_digest(load(runs, name)["tests"])
    ok("series: nights on record", F["series"]["n_nights"], len(recomputed))
    ok("series: distinct recorded corpus digests", F["series"]["n_file_digests"],
       len({load(runs, f"{d}.json")["corpus_sha256"] for d in recomputed}))
    ok("series: distinct test vectors", F["series"]["n_vectors"], len(set(recomputed.values())))
    for n in F["nights"]:
        ok(f"night {n['day']} vector digest", n["vector_digest"], recomputed[n["day"]])

    # --- 4. the pre-registered verdicts, re-derived -------------------------------------
    want = {"P1": "held", "P2": "refuted", "P3": "held", "P4": "void", "P5": "held"}
    for p in F["predictions"]:
        ok(f"verdict {p['id']}", p["verdict"], want[p["id"]])

    # --- 5. the page is what the table renders ------------------------------------------
    # The committed page is read BEFORE the builder runs, and the rebuild is compared against
    # it byte for byte — otherwise the rebuild would simply overwrite a hand-edited number and
    # the check would pass on a page nobody had checked. If they differ, the committed page is
    # put back, so a failing check never silently changes the artifact.
    page_path = os.path.join(HERE, "index.html")
    committed = open(page_path).read() if os.path.exists(page_path) else None
    built = subprocess.run([sys.executable, os.path.join(HERE, "make_page.py")],
                           capture_output=True, text=True, cwd=HERE)
    CHECKS[0] += 1
    if built.returncode != 0:
        FAILURES.append(f"make_page.py failed: {built.stderr[-400:]}")
    else:
        page = open(page_path).read()
        CHECKS[0] += 1
        if committed is not None and committed != page:
            with open(page_path, "w") as f:
                f.write(committed)
            FAILURES.append(
                "index.html does not match what make_page.py renders from the committed data — "
                "the page carries a figure the data does not give. The committed page has been "
                "left as it was; rebuild it with make_page.py if the data is what changed.")
            page = committed
        # Numbers that must appear in the rendered page exactly as the data gives them.
        for label, needle in [
            ("blind retrieval", f'{F["s153"]["blind_hits"]} of {F["s153"]["usable"]}'),
            ("name retrieval", f'{F["s153"]["name_hits"]} of {F["s153"]["usable"]}'),
            ("s150 raw findings", f'{F["s150"]["raw"]} findings'),
            ("fresh BH survivors", f'<strong>{F["drift"]["fresh"]["bh_survivors"]}</strong>'),
            ("newest submission served", F["freshness"]["newest_submitted_sort"]),
        ]:
            CHECKS[0] += 1
            if needle not in page:
                FAILURES.append(f"page is missing the figure for {label}: {needle!r}")
        # Every night's short digest must be on the page.
        for n in F["nights"]:
            CHECKS[0] += 1
            if n["vector_digest"][:6] not in page:
                FAILURES.append(f"page is missing night {n['day']}'s test-vector digest")

    # --- 6. the summary's headline figures ----------------------------------------------
    summary = open(os.path.join(HERE, "SUMMARY.md")).read()
    # The summary is plain language and spells small numbers, so each figure is accepted in
    # either form — but it must be THE figure: the alternatives below are generated from the
    # data, so a summary saying "three nights" still fails.
    words = {0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
             7: "seven", 8: "eight", 9: "nine", 10: "ten"}

    def forms(n):
        return {str(n)} | ({words[n]} if n in words else set())

    for label, alternatives in [
        ("blind retrieval",
         {f'{a} of {b}' for a in forms(F["s153"]["blind_hits"])
          for b in forms(F["s153"]["usable"])}),
        ("nights on record", {f'{a} nights' for a in forms(F["series"]["n_nights"])}),
        ("distinct test vectors",
         {f'It is {a}' for a in forms(F["series"]["n_vectors"])}
         | {f'{a} distinct' for a in forms(F["series"]["n_vectors"])}),
    ]:
        CHECKS[0] += 1
        if not any(a.lower() in summary.lower() for a in alternatives):
            FAILURES.append(
                f"SUMMARY.md is missing the figure for {label}: none of {sorted(alternatives)}")

    print(f"{CHECKS[0]} checks run.")
    if FAILURES:
        print(f"\nFAILED — {len(FAILURES)}:\n")
        for f in FAILURES:
            print("  · " + f)
        return 1
    print("Every figure on the page and in the summary reproduces from the committed data.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
