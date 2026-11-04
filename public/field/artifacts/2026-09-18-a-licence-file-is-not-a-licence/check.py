#!/usr/bin/env python3
"""Independent check of every number this artifact publishes. No network.

Re-derives each published figure from the committed evidence, re-runs the hand-made
cases and the mutation test, and cross-checks the population against the artifact of
2026-09-16 that this session is auditing.

    python3 check.py            # from the artifact directory, or anywhere

Exit 0 only if every check passes.
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DATA = os.environ.get("CHECK_DATA_DIR") or os.path.join(HERE, "data")
sys.path.insert(0, os.path.join(ROOT, "tools", "is-it-a-licence"))

FAILURES = []
N = 0


def chk(cond, label):
    global N
    N += 1
    if not cond:
        FAILURES.append(label)
    return bool(cond)


def close(a, b, tol=0.051):
    return a is None and b is None or (a is not None and b is not None and abs(a - b) <= tol)


def pct(k, n):
    return None if n == 0 else round(100.0 * k / n, 1)


def wilson(k, n, z=1.959963984540054):
    if n == 0:
        return None
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    s = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - s) / d, 4), round((c + s) / d, 4)]


def main():
    d = json.load(open(os.path.join(DATA, "data.json")))
    ctrl = json.load(open(os.path.join(DATA, "control-check.json")))
    hand = json.load(open(os.path.join(DATA, "hand-reading.json")))
    fixt = json.load(open(os.path.join(DATA, "fixture-check.json")))
    mut = json.load(open(os.path.join(DATA, "mutation-check.json")))
    prior_path = os.path.join(ROOT, "artifacts",
                              "2026-09-16-an-address-is-not-an-artifact", "data", "repos.json")
    prior = json.load(open(prior_path))
    pop = json.load(open(os.path.join(ROOT, "artifacts",
                                      "2026-09-16-an-address-is-not-an-artifact",
                                      "data", "population.json")))

    R = d["repos"]
    c = d["counts"]
    SCORED = {"MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "BSD-4-Clause", "Zlib"}

    # ---- 1 structure ------------------------------------------------------
    for k in ("note", "built_utc", "population_digest", "counts", "headline", "rungs",
              "predictions", "post_hoc", "repos", "kill_conditions", "retrievability",
              "our_own_rung", "families_seen"):
        chk(k in d, f"data.json missing key {k}")

    # ---- 2 population -----------------------------------------------------
    chk(len(R) == 144, "144 repository rows")
    chk(c["n_population"] == len(R), "n_population matches the row count")
    chk(d["population_digest"] == pop["population_digest"],
        "population digest equals session 162's")
    prior_by = {r["repo"]: r for r in prior["repos"]}
    pop_repos = {r["repo"] for r in pop["repos"]}
    chk({r["repo"] for r in R} == pop_repos, "same 144 repositories as session 162")

    D1 = [r for r in R if r["R3_licence_0916"]]
    chk(len(D1) == c["n_D1"], "D1 size matches counts")
    chk(c["n_D1"] == 105, "D1 is 105 repositories")
    chk(sum(1 for r in D1 if r["cohort"] == "A") == c["D1_cohort_A"], "D1 cohort A count")
    chk(sum(1 for r in D1 if r["cohort"] == "B") == c["D1_cohort_B"], "D1 cohort B count")
    chk(c["D1_cohort_A"] + c["D1_cohort_B"] == c["n_D1"], "D1 cohorts sum to D1")

    # ---- 3 every row, against session 162 ---------------------------------
    for r in R:
        rid = r["repo"]
        p = prior_by.get(rid, {})
        chk(r["cohort"] in ("A", "B"), f"{rid}: cohort is A or B")
        chk(r["cohort"] == p.get("cohort"), f"{rid}: cohort matches session 162")
        chk(r["R3_licence_0916"] == bool((p.get("rungs") or {}).get("R3_licence")),
            f"{rid}: R3 flag copied from session 162 unchanged")
        chk(isinstance(r["door_ok"], bool), f"{rid}: door_ok is a boolean")
        chk(r["n_licence_shaped"] == len(r["files"]) + len(r["blob_errors"]),
            f"{rid}: licence-shaped paths equal files read plus blob errors")
        chk(bool(r["head_sha"]) <= bool(r["clone_ok"]), f"{rid}: a HEAD implies a clone")
        chk(r["any_identified"] == bool(r["voices"]), f"{rid}: any_identified matches voices")
        chk(r["delivers_any"] == any(f["delivers"] for f in r["files"]),
            f"{rid}: delivers_any is the disjunction over its files")
        seen = []
        for f in r["files"]:
            for fam in f["families"]:
                if fam not in seen:
                    seen.append(fam)
        chk(r["voices"] == seen, f"{rid}: voices are the families of its files, in file order")
        chk(r["any_placeholder"] == any(f["attribution"] == "placeholder" for f in r["files"]),
            f"{rid}: any_placeholder matches its files")
        if r["R3_licence_0916"]:
            chk(len(r["files"]) >= 1 or r["blob_errors"],
                f"{rid}: counted as licensed on 09-16, so a licence-shaped file was expected")

    # ---- 4 every file -----------------------------------------------------
    allowed = {"empty", "not_identified", "identified_and_attributed",
               "identified_attribution_not_applicable", "placeholder", "no_holder",
               "no_copyright_line"}
    n_files_all = 0
    for r in R:
        for f in r["files"]:
            n_files_all += 1
            fid = f"{r['repo']}:{f['path']}"
            chk(f["reason"] in allowed, f"{fid}: reason is one of the seven")
            chk(set(f["scored_family"]) == set(f["families"]) & SCORED,
                f"{fid}: scored_family is the scored subset of families")
            chk((f["attribution"] is None) == (not f["scored_family"]),
                f"{fid}: attribution is null exactly when no scored family is present")
            expected = (f["nonempty"] and bool(f["families"])
                        and f["attribution"] in (None, "named"))
            chk(f["delivers"] == expected, f"{fid}: delivers follows from L0, L1 and L2")
            if f["attribution"] == "placeholder":
                chk(bool(f["placeholder_lines"]), f"{fid}: a placeholder verdict shows its line")
            if f["attribution"] == "no_copyright_line":
                chk(f["n_copyright_lines"] == 0, f"{fid}: no notice means no notice lines")
            if f["attribution"] == "named":
                chk(f["n_named_copyright_lines"] >= 1, f"{fid}: a named verdict has a named line")
            chk(("first_200_normalised" in f) == (not f["families"]),
                f"{fid}: unidentified files, and only those, carry their first 200 characters")
            chk(len(f.get("first_200_normalised", "")) <= 200,
                f"{fid}: no more than 200 characters of any file are committed")
            for key in ("path", "bytes", "sha256"):
                chk(key in f, f"{fid}: has {key}")
            chk(len(f["sha256"]) == 64, f"{fid}: sha256 is 64 hex characters")
            chk(f["bytes"] >= 0, f"{fid}: byte count is not negative")
            chk(r["repo"] + "/" not in f["path"], f"{fid}: path is repository-relative")
    chk(n_files_all == c["n_licence_shaped_files_all"], "total licence-shaped files")

    # no third-party licence text is committed
    blob = json.dumps(d)
    for phrase in ("Permission is hereby granted, free of charge",
                   "TERMS AND CONDITIONS FOR USE, REPRODUCTION"):
        chk(phrase not in blob, f"no licence text committed: {phrase[:34]!r} absent")

    # ---- 5 the rungs ------------------------------------------------------
    d1_files = [f for r in D1 for f in r["files"]]
    chk(len(d1_files) == c["n_licence_shaped_files_in_D1"], "D1 file count")
    L0 = d["rungs"]["L0_nonempty_files"]
    k0 = sum(1 for f in d1_files if f["nonempty"])
    chk(L0["k"] == k0 and L0["n"] == len(d1_files), "L0 counts")
    chk(close(L0["pct"], pct(k0, len(d1_files))), "L0 percentage")

    L1 = d["rungs"]["L1_identified_repos"]
    k1 = sum(1 for r in D1 if r["any_identified"])
    chk(L1["k"] == k1 and L1["n"] == len(D1), "L1 counts")
    chk(close(L1["pct"], pct(k1, len(D1))), "L1 percentage")
    chk(L1["wilson95"] == wilson(k1, len(D1)), "L1 Wilson interval")
    chk(L1["wilson95"][0] <= k1 / len(D1) <= L1["wilson95"][1], "L1 interval contains its point")

    L2 = d["rungs"]["L2_attribution_over_scored_repos"]
    scored_repos = [r for r in D1 if any(f["scored_family"] for f in r["files"])]
    chk(L2["n"] == len(scored_repos), "L2 denominator is the scored repositories")
    order = ("named", "placeholder", "no_holder", "no_copyright_line")

    def best(r):
        vs = [f["attribution"] for f in r["files"] if f["attribution"] is not None]
        for v in order:
            if v in vs:
                return v
        return None
    counts = {}
    for r in scored_repos:
        counts[best(r)] = counts.get(best(r), 0) + 1
    chk(L2["counts"] == counts, "L2 verdict counts")
    chk(sum(L2["counts"].values()) == L2["n"], "L2 counts sum to its denominator")
    chk(close(L2["named_pct"], pct(counts.get("named", 0), len(scored_repos))), "L2 named share")
    chk(close(L2["placeholder_pct"], pct(counts.get("placeholder", 0), len(scored_repos))),
        "L2 placeholder share")

    L3 = d["rungs"]["L3_multivoice_repos"]
    k3 = sum(1 for r in D1 if len(r["voices"]) >= 2)
    chk(L3["k"] == k3 and L3["n"] == len(D1), "L3 counts")
    chk(close(L3["pct"], pct(k3, len(D1))), "L3 percentage")

    H = d["headline"]
    kh = sum(1 for r in D1 if r["delivers_any"])
    chk(H["k"] == kh and H["n"] == len(D1), "headline counts")
    chk(close(H["pct"], pct(kh, len(D1))), "headline percentage")
    chk(H["wilson95"] == wilson(kh, len(D1)), "headline Wilson interval")
    for c_ in ("A", "B"):
        sub = [r for r in D1 if r["cohort"] == c_]
        kk = sum(1 for r in sub if r["delivers_any"])
        chk(H["by_cohort"][c_]["k"] == kk and H["by_cohort"][c_]["n"] == len(sub),
            f"headline cohort {c_} counts")
        chk(close(H["by_cohort"][c_]["pct"], pct(kk, len(sub))), f"headline cohort {c_} share")
    chk(H["by_cohort"]["A"]["k"] + H["by_cohort"]["B"]["k"] == H["k"], "cohorts sum to headline")

    # ---- 6 our own rung ---------------------------------------------------
    own = d["our_own_rung"]
    unsupported = sorted(r["repo"] for r in D1 if not r["any_identified"])
    chk(own["repos"] == unsupported, "the unsupported list is exactly the unidentified D1 rows")
    chk(own["k"] == len(unsupported), "unsupported count")

    # ---- 7 predictions ----------------------------------------------------
    expect = {"P1": (k0, len(d1_files), 95.0, "at_least"),
              "P2": (k1, len(D1), 85.0, "at_least"),
              "P3": (counts.get("named", 0), len(scored_repos), 90.0, "at_least"),
              "P4": (counts.get("placeholder", 0), len(scored_repos), 5.0, "at_most"),
              "P5": (k3, len(D1), 15.0, "at_most"),
              "P6": (len(unsupported), len(D1), 3, "at_most_count")}
    chk(len(d["predictions"]) == 6, "six predictions")
    for p in d["predictions"]:
        kk, nn, th, dirn = expect[p["id"]]
        chk(p["k"] == kk, f"{p['id']}: numerator")
        chk(p["n"] == nn, f"{p['id']}: denominator")
        chk(p["threshold"] == th, f"{p['id']}: threshold is the pre-registered one")
        chk(p["direction"] == dirn, f"{p['id']}: direction")
        obs = kk if dirn == "at_most_count" else pct(kk, nn)
        chk(close(p["observed"], obs) if isinstance(obs, float) else p["observed"] == obs,
            f"{p['id']}: observed value")
        want = ("confirmed" if (obs >= th if dirn == "at_least" else obs <= th) else "REFUTED")
        chk(p["verdict"] == want, f"{p['id']}: verdict follows from threshold and observation")

    # ---- 8 kill conditions ------------------------------------------------
    K = d["kill_conditions"]["K2_blob_fetch_failures"]
    failed = sum(len(r["blob_errors"]) for r in R)
    listed = sum(r["n_licence_shaped"] for r in R if r["clone_ok"] and r["head_sha"])
    chk(K["failed"] == failed, "K2 failure count")
    chk(K["listed_paths"] == listed, "K2 denominator")
    chk(K["threshold_pct"] == 10.0, "K2 threshold is the pre-registered one")
    chk(K["fired"] == bool(K["pct"] is not None and K["pct"] > 10.0), "K2 verdict")
    chk(K["fired"] is False, "K2 did not fire")

    chk(ctrl["n_fetched"] == ctrl["n_families_in_table"], "every canonical text was fetched")
    chk(ctrl["n_fetched"] == 22, "22 canonical texts")
    for row in ctrl["rows"]:
        chk(row["identifies_itself"], f"K1: {row['family']} identifies its own canon")
        chk(row["also_identified_as"] == [],
            f"K1: {row['family']} is not also identified as another family")
        chk(len(row["sha256"]) == 64, f"K1: {row['family']} canon has a digest")
    chk(ctrl["K1_identifier_identifies_the_canon"]["fired"] is False, "K1 did not fire")
    chk(ctrl["K3_placeholder_rule_fires_on_the_MIT_canon"]["fired"] is False, "K3 did not fire")
    mitrow = next(r for r in ctrl["rows"] if r["family"] == "MIT")
    chk(mitrow["placeholder_fires"], "the placeholder rule fires on the MIT canonical template")

    # ---- 9 hand reading ---------------------------------------------------
    unid = {(r["repo"], f["path"]) for r in R for f in r["files"] if not f["families"]}
    chk(len(hand["files"]) == len(unid), "the hand reading covers every unidentified file")
    for h in hand["files"]:
        chk((h["repo"], h["path"]) in unid,
            f"hand reading: {h['repo']}:{h['path']} is an unidentified file in data.json")
        chk(h["class"] in hand["classes"], f"hand reading: {h['path']} has a declared class")
        chk(bool(h["why"]), f"hand reading: {h['path']} gives a ground")
    tally = {}
    for h in hand["files"]:
        tally[h["class"]] = tally.get(h["class"], 0) + 1
    chk(tally == hand["counts"], "hand reading counts match its own rows")

    # ---- 10 post hoc ------------------------------------------------------
    ph = d["post_hoc"]

    def root_families(r):
        return sorted({x for f in r["files"] if "/" not in f["path"] for x in f["families"]})
    rt = ph["identified_licence_at_the_root"]
    kroot = sum(1 for r in D1 if root_families(r))
    chk(rt["k"] == kroot and rt["n"] == len(D1), "post hoc: root counts")
    chk(close(rt["pct"], pct(kroot, len(D1))), "post hoc: root share")
    chk(rt["k"] <= L1["k"], "post hoc: root-identified cannot exceed identified")
    noroot = sorted(r["repo"] for r in D1 if not any("/" not in f["path"] for f in r["files"]))
    chk(sorted(rt["repos_with_no_licence_shaped_file_at_the_root"]) == noroot,
        "post hoc: the no-root list")
    A_all = [r for r in R if r["cohort"] == "A" and r["head_sha"]]
    A_root = sum(1 for r in A_all if root_families(r))
    ca = ph["cohort_A_restated"]
    chk(ca["n"] == len(A_all), "post hoc: cohort A denominator")
    chk(ca["identified_licence_at_the_root"]["k"] == A_root, "post hoc: cohort A root count")
    chk(close(ca["identified_licence_at_the_root"]["pct"], pct(A_root, len(A_all))),
        "post hoc: cohort A root share")
    chk(ca["licence_file_anywhere_0916"]["k"] == sum(1 for r in A_all if r["R3_licence_0916"]),
        "post hoc: cohort A 09-16 count")
    chk(close(ca["licence_file_anywhere_0916"]["pct"], 78.6),
        "post hoc: cohort A 09-16 share is the 78.6 % session 162 published")
    blk = ph["root_speaks_for_less_than_the_tree"]
    mv = [r for r in D1 if len(r["voices"]) >= 2]
    short = [r for r in mv if set(root_families(r)) < set(r["voices"])]
    chk(blk["k"] == len(short) and blk["n"] == len(mv), "post hoc: root-shorter-than-tree counts")
    chk(len(blk["examples"]) == len(short), "post hoc: one example row per repository")
    chk(ph["run1_defective_L2"]["run1_headline_pct"] == 99.0,
        "post hoc: the defective first run is recorded with its headline")
    r1 = json.load(open(os.path.join(DATA, "data-run1-defective-L2.json")))
    chk(close(r1["headline"]["pct"], 99.0), "the preserved first run really reads 99.0 %")
    chk(r1["rungs"]["L2_attribution_over_scored_repos"]["counts"] == {"named": 67},
        "the preserved first run really reads 67 of 67 named")
    chk(r1["headline"]["n"] == H["n"], "both runs share a denominator")

    cf = ph["amendment_1_counterfactual"]
    ALL_SCORED = SCORED | {"Apache-2.0"}

    def att_cf(r):
        vs = []
        for f in r["files"]:
            if not (set(f["families"]) & ALL_SCORED):
                continue
            vs.append("named" if f["n_named_copyright_lines"] else
                      "placeholder" if f["placeholder_lines"] else
                      "no_holder" if f["n_copyright_lines"] else "no_copyright_line")
        for v in order:
            if v in vs:
                return v
        return None
    cf_repos = [r for r in D1 if att_cf(r) is not None]
    cfc = {}
    for r in cf_repos:
        cfc[att_cf(r)] = cfc.get(att_cf(r), 0) + 1
    chk(cf["n"] == len(cf_repos), "counterfactual denominator")
    chk(cf["counts"] == cfc, "counterfactual verdict counts")
    chk(close(cf["placeholder_pct"], pct(cfc.get("placeholder", 0), len(cf_repos))),
        "counterfactual placeholder share")
    chk(close(cf["actual_placeholder_pct"], L2["placeholder_pct"]),
        "counterfactual records the actual share beside it")
    chk(cf["placeholder_pct"] > L2["placeholder_pct"],
        "the amendment can only have lowered the placeholder share")
    ap = d["apache_appendix_unfilled_not_scored"]
    chk(ap["k"] == sum(1 for r in D1 if r["apache_appendix_unfilled"]), "Apache appendix count")
    chk(ap["n"] == sum(1 for r in D1 if "Apache-2.0" in r["voices"]), "Apache denominator")
    chk(ap["k"] <= ap["n"], "Apache appendix count within its denominator")
    chk(cf["apache_files_with_an_unfilled_appendix"] ==
        sum(1 for r in R for f in r["files"] if f["apache_appendix_unfilled"]),
        "Apache appendix file count")

    # ---- the page says what the data says --------------------------------
    page = open(os.path.join(HERE, "index.html")).read()
    chk("<script" not in page, "the page carries no script")
    chk("http://" not in page and 'href="http' not in page and "src=" not in page,
        "the page fetches nothing")
    for s_ in (f'{H["pct"]} %', f'{rt["pct"]} %', f'{L2["placeholder_pct"]} %',
               str(L2["counts"].get("named", 0)), str(c["n_licence_shaped_files_all"]),
               str(cf["placeholder_pct"])):
        chk(s_ in page, f"the page states {s_!r}")
    for pid in ("P1", "P2", "P3", "P4", "P5", "P6"):
        chk(pid in page, f"the page lists {pid}")
    chk(str(ap["k"]) in page and str(ap["n"]) in page, "the page states the Apache figures")

    # ---- 11 retrievability ------------------------------------------------
    rr = d["retrievability"]
    chk(rr["doors_0918"] == sum(1 for r in R if r["door_ok"]), "doors answering tonight")
    chk(rr["doors_0918"] == 144, "all 144 doors answered again")
    chk(sorted(rr["trees_changed_since_0916"]) ==
        sorted(r["repo"] for r in R if r["tree_changed_since_0916"]), "changed trees")
    chk(sorted(c["empty_repositories"]) ==
        sorted(r["repo"] for r in R if r["door_refs"] == 0), "empty repositories")
    chk(len(c["empty_repositories"]) == 3, "three empty repositories, as on 09-16")

    # ---- 12 the apparatus, re-run offline ---------------------------------
    import fixtures
    import mutants
    res = fixtures.run()
    chk(all(x["pass"] for x in res), "every hand-made case passes when re-run here")
    chk(len(res) == fixt["n_cases"], "the committed fixture record has the same case count")
    chk(fixt["n_fail"] == 0, "the committed fixture record shows no failure")
    chk(mut["n_mutants"] == len(mutants.MUTANTS), "the committed mutation record is complete")
    unexpected = [m for m in mut["mutants"] if m["survived"] and not m["expected_to_survive"]]
    chk(unexpected == [], "no mutation survived unexpectedly")
    chk(sorted(mut["expected_survivors"]) == sorted(mutants.EXPECTED_SURVIVORS),
        "the expected-survivor set is the one the code declares")
    for m in mut["mutants"]:
        chk(m["survived"] or m["n_caught"] >= 1, f"mutation {m['mutant']} was caught")

    print(f"{N} checks, {len(FAILURES)} failed")
    for f in FAILURES[:40]:
        print("  FAIL", f)
    if len(FAILURES) > 40:
        print(f"  ... and {len(FAILURES) - 40} more")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
