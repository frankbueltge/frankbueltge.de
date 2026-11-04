#!/usr/bin/env python3
"""check.py — re-derive every claim of this artifact from data/, with no network.

Session 162, 2026-09-16.  python3 artifacts/2026-09-16-an-address-is-not-an-artifact/check.py

Three layers:
  1. the recorded evidence is internally consistent (population, harvest, rungs);
  2. every number in data/data.json is recomputed from data/repos.json independently
     of build.py — the rung outcomes are re-coded here from the evidence, not trusted;
  3. every figure the page prints is found in index.html.

Then the whole checker is run again against deliberately corrupted copies of its own
evidence, and must fail on each. A checker that cannot fail proves nothing.
"""

import copy
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "tools", "behind-the-door"))

PASS, FAIL = [], []


def ck(name, cond, detail=""):
    (PASS if cond else FAIL).append(f"{name}{(' — ' + str(detail)) if detail else ''}")
    return bool(cond)


def near(a, b, tol=5e-4):
    return a is not None and b is not None and abs(a - b) <= tol


def load(name):
    with open(os.path.join(DATA, name)) as fh:
        return json.load(fh)


def wilson(k, n, z=1.959963984540054):
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [max(0.0, c - h), min(1.0, c + h)]


def fisher(a, b, c, d):
    n, r1, r2, c1 = a + b + c + d, a + b, c + d, a + c

    def prob(x):
        return (math.comb(r1, x) * math.comb(r2, c1 - x)) / math.comb(n, c1)

    p_obs, tot = prob(a), 0.0
    for x in range(max(0, c1 - r2), min(r1, c1) + 1):
        p = prob(x)
        if p <= p_obs * (1 + 1e-12):
            tot += p
    return min(1.0, tot)


def run(pop, harvest, data, page):
    """Every check. Raises nothing; records into PASS/FAIL."""
    repos = harvest["repos"]

    # ---------------------------------------------------------- 1. evidence integrity
    ck("population: digest matches the recorded repo/cohort list",
       pop["population_digest"] == __import__("hashlib").sha256(
           "\n".join(f"{r['repo']}\t{r['cohort']}" for r in pop["repos"]).encode()
       ).hexdigest())
    ck("population: 144 repositories", pop["n_repos"] == 144, pop["n_repos"])
    ck("population: cohorts sum to the total",
       pop["n_cohort_A"] + pop["n_cohort_B"] == pop["n_repos"])
    ck("population: no repository sits in both cohorts", not pop["cohort_conflicts"])
    ck("population: one row per repository",
       len({r["repo"] for r in pop["repos"]}) == len(pop["repos"]))
    ck("harvest: one record per population row",
       {r["repo"] for r in repos} == {r["repo"] for r in pop["repos"]})
    ck("harvest: the harvest carries the population digest",
       harvest["population_digest"] == pop["population_digest"])
    ck("harvest: no record raised an exception",
       not [r for r in repos if "harvest_exception" in r],
       [r["repo"] for r in repos if "harvest_exception" in r])
    ck("harvest: every cohort label agrees with the population",
       all(r["cohort"] == next(p["cohort"] for p in pop["repos"] if p["repo"] == r["repo"])
           for r in repos))

    cloned = [r for r in repos if r.get("clone_ok")]
    doors = [r for r in repos if r.get("door_ok")]
    empty = [r for r in doors if r.get("door_refs") == 0]

    ck("harvest: every cloned record has a HEAD, a tree digest and a file count",
       all(r.get("head_sha") and r.get("tree_digest") and isinstance(r.get("n_files"), int)
           for r in cloned))
    ck("harvest: every cloned record carries the full rung set",
       all(set(r["rungs"]) >= {"R1_content", "R2_code", "R3_licence", "R4_manifest",
                               "R6_entry", "R7_tests", "R8_ci", "FLOOR"} for r in cloned))
    ck("harvest: no record that failed to clone carries rung outcomes",
       not [r for r in repos if not r.get("clone_ok") and r.get("rungs")])
    ck("harvest: no third-party file content is stored in the evidence",
       all("content" not in b and "text" not in b
           for r in cloned for b in r.get("blobs_read", {}).values()))
    ck("harvest: every blob record is either read with a digest or says why not",
       all(("sha256" in b) == bool(b.get("read"))
           for r in cloned for b in r.get("blobs_read", {}).values()))
    ck("harvest: every empty repository failed the tree step",
       all(not r.get("clone_ok") for r in empty), [r["repo"] for r in empty])
    ck("harvest: every tree failure is an empty repository (the filed defect)",
       {r["repo"] for r in repos if r.get("door_ok") and not r.get("clone_ok")}
       == {r["repo"] for r in empty})

    # ---------------------------------------------------------- 2. the rungs, re-coded
    import rungs as R
    recoded = 0
    for r in cloned:
        ev = r["evidence"]
        # R2: the recorded evidence paths must themselves satisfy the rule
        if r["rungs"]["R2_code"]:
            recoded += 1
            ck(f"re-code R2 {r['repo']}", R.r2_code(ev["R2_code"]))
        else:
            ck(f"re-code R2 {r['repo']} (negative)", not ev["R2_code"])
        if r["rungs"]["R3_licence"]:
            ck(f"re-code R3 {r['repo']}", R.r3_licence_file(ev["R3_licence"]))
        else:
            ck(f"re-code R3 {r['repo']} (negative)", not ev["R3_licence"])
        if r["rungs"]["R4_manifest"]:
            ck(f"re-code R4 {r['repo']}", R.r4_manifest(ev["R4_manifest"]))
        else:
            ck(f"re-code R4 {r['repo']} (negative)", not ev["R4_manifest"])
        if r["rungs"]["R7_tests"]:
            ck(f"re-code R7 {r['repo']}", R.r7_tests(ev["R7_tests"]))
        if r["rungs"]["R8_ci"]:
            ck(f"re-code R8 {r['repo']}", R.r8_ci(ev["R8_ci"]))
        ck(f"floor is the conjunction {r['repo']}",
           r["rungs"]["FLOOR"] == all(r["rungs"][k] for k in R.FLOOR_RUNGS))
        ck(f"pinning verdict is None exactly when undecidable {r['repo']}",
           (r["rungs"]["R5_pinned"] is None) != bool(r["rungs"]["R5_pinning_applicable"]))
    ck("re-coding exercised the positive branch of R2 on most repositories", recoded > 100, recoded)

    # ---------------------------------------------------------- 3. data.json recomputed
    A = [r for r in cloned if r["cohort"] == "A"]
    B = [r for r in cloned if r["cohort"] == "B"]
    ck("data: cloned counts", (data["cloned"]["n"], data["cloned"]["n_A"], data["cloned"]["n_B"])
       == (len(cloned), len(A), len(B)))
    ck("data: doors answered", data["doors"]["answered"] == len(doors), len(doors))
    ck("data: door share", near(data["doors"]["share"], len(doors) / len(repos)))
    ck("data: empty repositories", data["empty_repositories"]["n"] == len(empty), len(empty))
    ck("data: the named empty repositories match the evidence",
       {x["repo"] for x in data["empty_repositories"]["repos"]} == {r["repo"] for r in empty})

    for row in data["ladder"]:
        k = row["rung"]
        kA = sum(1 for r in A if r["rungs"][k])
        kB = sum(1 for r in B if r["rungs"][k])
        ck(f"data: {k} counts", (row["A"]["k"], row["B"]["k"], row["all"]["k"])
           == (kA, kB, kA + kB), f"{row['A']['k']}/{kA} {row['B']['k']}/{kB}")
        ck(f"data: {k} shares", near(row["A"]["share"], kA / len(A))
           and near(row["B"]["share"], kB / len(B))
           and near(row["all"]["share"], (kA + kB) / len(cloned)))
        ck(f"data: {k} Wilson interval", all(
            near(a, b) for a, b in zip(row["all"]["wilson"], wilson(kA + kB, len(cloned)))))
        ck(f"data: {k} Fisher p", near(row["p_fisher"],
                                       fisher(kA, len(A) - kA, kB, len(B) - kB), 1e-6))
        ck(f"data: {k} difference", near(row["diff_A_minus_B"], kA / len(A) - kB / len(B)))

    fam = [row for row in data["ladder"] if "q_bh" in row]
    ck("data: the BH family is the eight ladder rungs", len(fam) == 8, len(fam))
    ck("data: every q is at least its own p", all(row["q_bh"] >= row["p_fisher"] - 1e-9
                                                  for row in fam))
    ck("data: q values are monotone in p",
       all(a["q_bh"] <= b["q_bh"] + 1e-9
           for a, b in zip(sorted(fam, key=lambda r: r["p_fisher"]),
                           sorted(fam, key=lambda r: r["p_fisher"])[1:])))
    ck("data: the page's claim of zero BH survivors holds",
       not [row for row in fam if row["survives_bh_05"]])

    app = [r for r in cloned if r["rungs"]["R5_pinning_applicable"]]
    pin = sum(1 for r in app if r["rungs"]["R5_pinned"])
    ck("data: pinning decidable count", data["pinning"]["decidable"] == len(app), len(app))
    ck("data: pinning count", data["pinning"]["pinned"] == pin, pin)
    ck("data: pinning share", near(data["pinning"]["share"], pin / len(app)))
    ck("data: pinning runs against cohort A",
       data["pinning"]["A"]["share"] < data["pinning"]["B"]["share"])

    nocode = [r for r in cloned if not r["rungs"]["R2_code"]]
    ck("data: repositories with no source file", data["no_code"]["n"] == len(nocode), len(nocode))
    nolic = [r for r in cloned if r["rungs"]["R2_code"] and not r["rungs"]["R3_licence"]]
    ck("data: code without permission", data["code_without_permission"]["n"] == len(nolic),
       len(nolic))
    ck("data: code without permission is level across cohorts",
       data["code_without_permission"]["A"] == data["code_without_permission"]["B"]
       == sum(1 for r in nolic if r["cohort"] == "A"))
    six = ["R2_code", "R3_licence", "R4_manifest", "R6_entry", "R7_tests", "R8_ci"]
    allsix = [r for r in cloned if all(r["rungs"][k] for k in six)]
    ck("data: top of the ladder", data["top_of_the_ladder"]["n"] == len(allsix), len(allsix))
    boiler = [r for r in cloned if r.get("boilerplate_only")]
    ck("data: boilerplate-only count",
       data["sensitivity"]["boilerplate_only"]["n"] == len(boiler), len(boiler))
    ck("data: nothing behind the address = empty + boilerplate-only",
       data["nothing_behind_it"]["n"] == len(empty) + len(boiler))
    ck("data: boilerplate-only repositories hold no source code either",
       all(not r["rungs"]["R2_code"] for r in boiler))
    ck("data: sensitivity counts",
       (data["sensitivity"]["licence_outside_root_only"],
        data["sensitivity"]["manifest_outside_root_only"],
        data["sensitivity"]["r6_via_nonroot_only"])
       == (sum(1 for r in cloned if r.get("licence_outside_root_only")),
           sum(1 for r in cloned if r.get("manifest_outside_root_only")),
           sum(1 for r in cloned if r.get("r6_via_nonroot_only"))))
    sizes = sorted(r["n_files"] for r in cloned)
    ck("data: median tree size", data["tree_sizes"]["median"] == sizes[len(sizes) // 2])
    ck("data: cohort A's median tree is the larger",
       data["tree_sizes"]["median_A"] > data["tree_sizes"]["median_B"])

    # ---------------------------------------------------------- predictions
    P = {p["id"]: p for p in data["predictions"]}
    lad = {row["rung"]: row for row in data["ladder"]}
    ck("P1 verdict follows the rule",
       P["P1"]["verdict"] == ("CONFIRMED" if len(doors) / len(repos) >= 0.95 else "REFUTED"))
    ck("P2 verdict follows the rule",
       P["P2"]["verdict"] == ("CONFIRMED" if lad["R1_content"]["all"]["share"] >= 0.95
                              else "REFUTED"))
    ck("P3 verdict follows the rule",
       P["P3"]["verdict"] == ("CONFIRMED" if lad["R3_licence"]["A"]["share"] < 0.70
                              else "REFUTED"))
    ck("P4 verdict follows the rule",
       P["P4"]["verdict"] == ("CONFIRMED" if (lad["FLOOR"]["A"]["share"] < 0.5
                                              and lad["FLOOR"]["B"]["share"] < 0.5)
                              else "REFUTED"))
    ck("P5 verdict follows the rule",
       P["P5"]["verdict"] == ("CONFIRMED"
                              if lad["R4_manifest"]["A"]["share"] >= lad["R4_manifest"]["B"]["share"]
                              else "REFUTED"))
    ck("P5 confirmed carries the uninformative caveat",
       P["P5"]["verdict"] != "CONFIRMED" or P["P5"].get("caveat"))
    ck("P6 verdict follows the rule",
       P["P6"]["verdict"] == ("CONFIRMED" if data["pinning"]["share"] < 0.40 else "REFUTED"))
    ck("data: the refuted count matches the verdicts",
       data["predictions_refuted"] == sum(1 for p in data["predictions"]
                                          if p["verdict"] == "REFUTED"))
    ck("P3 is refuted above the external benchmark, as the page claims",
       lad["R3_licence"]["A"]["share"] > data["benchmark"]["LICENSE"])

    # ---------------------------------------------------------- the kill condition
    kc = data["kill_condition"]
    trig = [r for r in repos if r.get("door_ok") and not r.get("clone_ok")]
    ck("kill condition: triggering count", kc["triggering_units"] == len(trig), len(trig))
    ck("kill condition: rate", near(kc["rate"], len(trig) / len(doors)))
    ck("kill condition: verdict follows the rule",
       kc["fired"] == (len(trig) / len(doors) > kc["threshold"]))
    ck("kill condition: it did not fire", kc["fired"] is False)
    ck("kill condition: the defect is filed with its consequence",
       bool(kc["defect"]["filed"]) and bool(kc["defect"]["consequence"]))
    ck("kill condition: every triggering unit is an empty repository — the defect itself",
       {r["repo"] for r in trig} == {r["repo"] for r in empty})

    # ---------------------------------------------------------- apparatus
    fx = load("fixture-check.json")
    mu = load("mutation-check.json")
    ck("fixtures: none failed", fx["failed"] == 0, fx["failed"])
    ck("fixtures: the recorded results match the recorded count",
       len(fx["results"]) == fx["cases"])
    ck("fixtures: every recorded case is marked ok", all(r["ok"] for r in fx["results"]))
    ck("mutants: none survived", mu["survivors"] == 0, mu["survivors"])
    ck("mutants: every breakage was caught by at least one fixture",
       all(r["caught"] and r["fixtures_failed"] > 0 for r in mu["results"]))
    ck("mutants: every rung of the ladder is attacked by at least one mutant",
       {"R1_content", "R2_code", "R3_licence", "R4_manifest", "R6_entry", "R7_tests",
        "R8_ci", "FLOOR"} <= {r["rung"] for r in mu["results"]})
    ck("data: apparatus counts match the check files",
       (data["apparatus_checks"]["fixtures"], data["apparatus_checks"]["mutants"],
        data["apparatus_checks"]["fixtures_failed"],
        data["apparatus_checks"]["mutants_survived"])
       == (fx["cases"], mu["mutants"], fx["failed"], mu["survivors"]))
    ap = load("apparatus.json")
    ck("apparatus: no delegate was convened", ap["delegates"]["count"] == 0)
    ck("apparatus: the provider, model and version caveat are all recorded",
       all(ap["session_runner"].get(k) for k in ("provider", "model_configured",
                                                 "version_caveat")))
    ck("apparatus: the refusal met tonight is recorded", "arxiv_export_api" in ap["refusals_met"])

    # ---------------------------------------------------------- 4. the page
    def on_page(s, label):
        ck(f"page prints {label}", s in page, s)

    on_page(f"{data['doors']['answered']}/{data['doors']['n']}", "the door count")
    on_page(f"{100 * lad['R3_licence']['all']['share']:.1f}", "the overall licence share")
    on_page(f"{100 * lad['R3_licence']['A']['share']:.1f}", "cohort A's licence share")
    on_page(str(data["code_without_permission"]["n"]), "code without permission")
    on_page(str(data["empty_repositories"]["n"]), "the empty-repository count")
    on_page(str(data["no_code"]["n"]), "the no-source-file count")
    on_page(str(data["top_of_the_ladder"]["n"]), "the top of the ladder")
    on_page(f"{100 * data['pinning']['share']:.1f}", "the pinning share")
    on_page(f"{data['pinning']['decidable']}", "the pinning denominator")
    on_page("0 of 8", "the BH result")
    on_page(f"{data['predictions_refuted']} of 6 refuted", "the refuted count")
    on_page(str(data["tree_sizes"]["median_A"]), "cohort A's median tree size")
    on_page(str(data["tree_sizes"]["median_B"]), "cohort B's median tree size")
    on_page(f"{100 * data['benchmark']['LICENSE']:.1f}", "the external benchmark")
    on_page(str(data["apparatus_checks"]["fixtures"]), "the fixture count")
    on_page(str(data["apparatus_checks"]["mutants"]), "the mutant count")
    on_page("arXiv:2605.16701", "the benchmark's identifier")
    on_page("arXiv:2004.00199", "the link-direction neighbour")
    on_page("arXiv:2606.18237", "the agentic-audit neighbour")
    on_page(str(data["robots"]["status"]), "the robots.txt answer")
    for p in data["predictions"]:
        on_page(p["verdict"], f"the {p['id']} verdict")
    ck("page: the kill-condition defect is on the page, not only in the data",
       "kill condition" in page.lower() and "defect" in page.lower())
    ck("page: the page states the design's resolution rather than claiming a null",
       "resolution" in page.lower())
    ck("page: the page names no AI product, company or tool vendor in its own prose",
       not re.search(r"\b(anthropic|openai|claude|gpt|gemini|copilot|sonnet|opus)\b",
                     re.sub(r"<[^>]+>", " ", page), re.I))
    ck("page: no repository is characterised beyond its file composition",
       "fraud" not in page.lower() and "fake" not in page.lower())


def main():
    pop, harvest, data = load("population.json"), load("repos.json"), load("data.json")
    with open(os.path.join(HERE, "index.html")) as fh:
        page = fh.read()

    run(pop, harvest, data, page)
    n_real = len(PASS) + len(FAIL)
    real_failures = list(FAIL)

    # ---------------------------------------------------------- tamper tests
    tampers = []

    def tamper(label, mutate):
        global PASS, FAIL
        p2, h2, d2, pg2 = (copy.deepcopy(pop), copy.deepcopy(harvest),
                           copy.deepcopy(data), page)
        out = mutate(p2, h2, d2, pg2)
        if out is not None:
            pg2 = out
        keep_p, keep_f = PASS, FAIL
        PASS, FAIL = [], []
        try:
            run(p2, h2, d2, pg2)
            caught = len(FAIL) > 0
            n = len(FAIL)
        except Exception:
            caught, n = True, -1
        PASS, FAIL = keep_p, keep_f
        tampers.append({"tamper": label, "caught": caught, "checks_failed": n})

    def flip_a_rung(p, h, d, pg):
        for r in h["repos"]:
            if r.get("clone_ok") and r["rungs"]["R3_licence"]:
                r["rungs"]["R3_licence"] = False
                return

    def inflate_share(p, h, d, pg):
        for row in d["ladder"]:
            if row["rung"] == "FLOOR":
                row["all"]["share"] += 0.05
                return

    def hide_an_empty(p, h, d, pg):
        d["empty_repositories"]["n"] -= 1
        d["empty_repositories"]["repos"] = d["empty_repositories"]["repos"][1:]

    def claim_a_bh_survivor(p, h, d, pg):
        for row in d["ladder"]:
            if row["rung"] == "FLOOR":
                row["survives_bh_05"] = True
                return

    def soften_the_kill_condition(p, h, d, pg):
        d["kill_condition"]["defect"]["consequence"] = ""

    def break_the_population_digest(p, h, d, pg):
        p["repos"][0]["cohort"] = "B" if p["repos"][0]["cohort"] == "A" else "A"

    def smuggle_file_content(p, h, d, pg):
        for r in h["repos"]:
            if r.get("clone_ok") and r.get("blobs_read"):
                k = list(r["blobs_read"])[0]
                r["blobs_read"][k]["content"] = "MIT License ..."
                return

    def fake_a_page_number(p, h, d, pg):
        return pg.replace("0 of 8", "3 of 8")

    def name_a_vendor_on_the_page(p, h, d, pg):
        return pg.replace("<h1>", "<h1>OpenAI ")

    def drop_a_harvest_record(p, h, d, pg):
        h["repos"] = h["repos"][1:]

    def relabel_a_cohort(p, h, d, pg):
        for r in h["repos"]:
            if r["cohort"] == "B":
                r["cohort"] = "A"
                return

    def fake_the_refuted_count(p, h, d, pg):
        d["predictions_refuted"] = 6

    def strip_the_p5_caveat(p, h, d, pg):
        for x in d["predictions"]:
            if x["id"] == "P5":
                x.pop("caveat", None)

    for label, fn in [
        ("a licence rung flipped in the harvest", flip_a_rung),
        ("the floor's share inflated by five points", inflate_share),
        ("one empty repository hidden", hide_an_empty),
        ("a BH survivor claimed", claim_a_bh_survivor),
        ("the kill-condition defect's consequence blanked", soften_the_kill_condition),
        ("a cohort label changed under the population digest", break_the_population_digest),
        ("third-party file content smuggled into the evidence", smuggle_file_content),
        ("a page figure falsified", fake_a_page_number),
        ("a vendor named in the page's own prose", name_a_vendor_on_the_page),
        ("a harvest record dropped", drop_a_harvest_record),
        ("a control repository relabelled into cohort A", relabel_a_cohort),
        ("the refuted count overstated", fake_the_refuted_count),
        ("P5's uninformative caveat stripped", strip_the_p5_caveat),
    ]:
        tamper(label, fn)

    missed = [t for t in tampers if not t["caught"]]

    print(f"{n_real} checks, {len(real_failures)} failed")
    for f in real_failures:
        print("  FAIL", f)
    print(f"{len(tampers)} tamper tests, {len(missed)} not caught")
    for m in missed:
        print("  NOT CAUGHT", m["tamper"])

    with open(os.path.join(DATA, "tamper-check.json"), "w") as fh:
        json.dump({
            "note": ("The checker run against deliberately corrupted copies of its own "
                     "evidence. Each corruption must make at least one check fail."),
            "checks": n_real,
            "checks_failed": len(real_failures),
            "tampers": len(tampers),
            "not_caught": len(missed),
            "results": tampers,
        }, fh, indent=1)
        fh.write("\n")

    return 1 if (real_failures or missed) else 0


if __name__ == "__main__":
    sys.exit(main())
