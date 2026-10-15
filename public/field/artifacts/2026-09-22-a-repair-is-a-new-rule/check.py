#!/usr/bin/env python3
"""Re-derive every number on this artifact's page from data/, with no network.

Session 167, 2026-09-22. Run:  python3 check.py [--quiet]
Exit 0 when every check passes. Each check has a NAME, and tamper.py names the check it
expects to break for each deliberate corruption of the evidence.

Nothing here calls a model or the network.
"""
import hashlib
import itertools
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DATA = os.path.join(HERE, "data")
REPAIRS = ["R1", "R4", "R5", "R6", "R7"]
CHECKS = []


def check(name):
    def deco(fn):
        CHECKS.append((name, fn))
        return fn
    return deco


def D(n):
    return json.load(open(os.path.join(DATA, n)))


def page():
    return open(os.path.join(HERE, "index.html")).read()


def summary():
    return open(os.path.join(HERE, "SUMMARY.md")).read()


def V():
    return {r["variant"]: r for r in D("lattice.json")["variants"]}


def FN():
    return {r["variant"]: r for r in D("false-notices.json")["variants"]}


def vid(combo):
    return "".join("1" if r in combo else "0" for r in REPAIRS)


# --------------------------------------------------------------- files and shapes
@check("data/files-present")
def _():
    want = ["lattice.json", "interactions.json", "headline.json", "corpora.json",
            "adjudication.json", "predictions.json", "false-notices.json",
            "sources.json", "apparatus.json", "evidence.json"]
    return all(os.path.isfile(os.path.join(DATA, w)) for w in want)


@check("data/all-parse")
def _():
    for f in sorted(os.listdir(DATA)):
        if f.endswith(".json"):
            D(f)
    return True


@check("lattice/32-variants")
def _():
    lat = D("lattice.json")
    return lat["n_variants"] == 32 == len(lat["variants"])


@check("lattice/every-subset-exactly-once")
def _():
    got = sorted(r["variant"] for r in D("lattice.json")["variants"])
    want = sorted(vid(c) for k in range(6) for c in itertools.combinations(REPAIRS, k))
    return got == want


@check("lattice/repairs-match-variant-id")
def _():
    for r in D("lattice.json")["variants"]:
        if [x for x, f in zip(REPAIRS, r["variant"]) if f == "1"] != r["repairs"]:
            return False
        if r["n_repairs"] != r["variant"].count("1"):
            return False
    return True


@check("lattice/relation-counts-sum-to-total")
def _():
    for r in D("lattice.json")["variants"]:
        if sum(r["decision_changing_by_relation"].values()) != r["decision_changing_total"]:
            return False
    return True


@check("lattice/M4-control-zero-everywhere")
def _():
    return all(r["control_M4"] == 0 for r in D("lattice.json")["variants"])


@check("lattice/headline-denominator-105")
def _():
    return all(r["headline_n"] == 105 for r in D("lattice.json")["variants"])


@check("lattice/headline-pct-consistent")
def _():
    for r in D("lattice.json")["variants"]:
        if round(100.0 * r["headline_k"] / r["headline_n"], 1) != r["headline_pct"]:
            return False
    return True


@check("lattice/symmetric-difference-consistent")
def _():
    for r in D("lattice.json")["variants"]:
        n = len(r["delivering_gained_vs_shipped"]) + len(r["delivering_lost_vs_shipped"])
        if n != r["delivering_symmetric_difference"]:
            return False
    return True


@check("lattice/fixture-and-mutant-counts-match-their-lists")
def _():
    for r in D("lattice.json")["variants"]:
        if len(r["fixtures_failed"]) != r["n_fixtures_failed"]:
            return False
        if len(r["mutants_surviving_unexpectedly"]) != r["n_mutants_surviving_unexpectedly"]:
            return False
    return True


# --------------------------------------------------------------- the four baselines (K1)
@check("baseline/shipped-reproduces-167-0-0-100")
def _():
    s = V()["00000"]
    return (s["decision_changing_total"] == 167 and s["n_fixtures_failed"] == 0
            and s["n_mutants_surviving_unexpectedly"] == 0 and s["headline_k"] == 100
            and s["headline_pct"] == 95.2 and s["delivering_symmetric_difference"] == 0)


@check("baseline/shipped-digests-are-the-2026-09-18-rule")
def _():
    return D("lattice.json")["shipped_digests"] == {
        "rules.py": "ccb373b6edb1e4397d7ac145aca6ff94e995934c9315b1ccc23eb266a288a2ed",
        "fingerprints.py": "57db4c561a58683d81fb35be3781168a419785183215a864ed5694981b6669cd"}


@check("baseline/no-repair-variant-carries-the-shipped-rules-py")
def _():
    return all(r["digests"]["rules.py"] == D("lattice.json")["shipped_digests"]["rules.py"]
               for r in D("lattice.json")["variants"])


@check("baseline/every-variant-has-a-distinct-fingerprints-digest-per-repair-set")
def _():
    d = [r["digests"]["fingerprints.py"] for r in D("lattice.json")["variants"]]
    return len(set(d)) == 32


@check("corpora/digests-match-2026-09-20")
def _():
    c = D("corpora.json")
    return (c["C1"]["corpus_digest"] == c["C1"]["corpus_digest_2026_09_20"]
            and c["C2"]["corpus_digest"] == c["C2"]["corpus_digest_2026_09_20"])


@check("corpora/896-inputs-none-excluded")
def _():
    c = D("corpora.json")
    return (c["C1"]["n"] == 740 and c["C1"]["texts_ok"] == 740
            and c["C2"]["n_pinned"] == 156 and c["C2"]["n_digest_matches"] == 156
            and c["C2"]["excluded"] == [] and c["total_inputs"] == 896)


# --------------------------------------------------------------- derived tables
@check("interactions/recomputed-from-the-lattice")
def _():
    lat, inter = V(), D("interactions.json")
    for p in inter["pairs"]:
        a, b = p["pair"]
        for field, key in (("dec", "decision_changing_total"), ("head", "headline_k"),
                           ("nfix", "n_fixtures_failed"),
                           ("nmut", "n_mutants_surviving_unexpectedly")):
            f = lambda c: lat[vid(c)][key]
            d = p[field]
            if (d["value_none"], d["value_a"], d["value_b"], d["value_ab"]) != \
               (f(()), f((a,)), f((b,)), f((a, b))):
                return False
            if d["interaction"] != (f((a, b)) - f(())) - ((f((a,)) - f(())) + (f((b,)) - f(()))):
                return False
    return True


@check("interactions/ten-pairs")
def _():
    return len(D("interactions.json")["pairs"]) == 10


@check("interactions/R7-is-the-only-sign-changing-marginal")
def _():
    m = D("interactions.json")["marginal_effects_on_violations"]
    return [x["repair"] for x in m if x["sign_changes"]] == ["R7"]


@check("interactions/marginals-recomputed-from-the-lattice")
def _():
    lat = V()
    for m in D("interactions.json")["marginal_effects_on_violations"]:
        for row in m["contexts"]:
            ctx = tuple(row["context"])
            if lat[vid(ctx)]["decision_changing_total"] != row["without"]:
                return False
            with_ = tuple(sorted(set(ctx) | {m["repair"]}, key=REPAIRS.index))
            if lat[vid(with_)]["decision_changing_total"] != row["with"]:
                return False
            if row["marginal"] != row["with"] - row["without"]:
                return False
    return True


@check("headline/groups-recomputed-from-the-lattice")
def _():
    lat = V()
    for o in D("headline.json")["distinct_outcomes"]:
        for v in o["variants"]:
            r = lat[v]
            if (r["headline_k"] != o["k"]
                    or r["delivering_gained_vs_shipped"] != o["gained_vs_shipped"]
                    or r["delivering_lost_vs_shipped"] != o["lost_vs_shipped"]):
                return False
        if len(o["variants"]) != o["n_variants"]:
            return False
    return True


@check("headline/every-variant-in-exactly-one-group")
def _():
    h = D("headline.json")
    seen = [v for o in h["distinct_outcomes"] for v in o["variants"]]
    return sorted(seen) == sorted(V()) and len(seen) == 32


@check("headline/four-distinct-outcomes-and-95.2-appears-twice")
def _():
    o = D("headline.json")["distinct_outcomes"]
    return len(o) == 4 and sum(1 for x in o if x["k"] == 100) == 2


@check("headline/sixteen-subsets-move-the-set")
def _():
    return sum(1 for r in D("lattice.json")["variants"]
               if r["delivering_symmetric_difference"]) == 16


@check("headline/full-repair-moves-four-repositories-and-the-number-not-at-all")
def _():
    f = V()["11111"]
    return (f["headline_k"] == 100 and f["headline_pct"] == 95.2
            and len(f["delivering_gained_vs_shipped"]) == 2
            and len(f["delivering_lost_vs_shipped"]) == 2)


# --------------------------------------------------------------- false notices
@check("false-notices/reference-of-2026-09-20-reproduced-by-the-shipped-rule")
def _():
    fn, ref = FN()["00000"], D("false-notices.json")["reference_2026_09_20"]
    return (fn["inputs_with_a_false_notice"] == ref["inputs_with_a_false_notice"]
            and fn["false_notices"] == ref["false_notices"]
            and fn["decisions_at_risk"] == ref["decisions_at_risk"])


@check("false-notices/R7-multiplies-them-and-puts-decisions-on-them")
def _():
    fn = FN()
    return (fn["00001"]["false_notices"] == 312 and fn["00001"]["decisions_at_risk"] == 18
            and fn["00000"]["decisions_at_risk"] == 0)


@check("false-notices/landed-subset-identical-to-shipped")
def _():
    fn = FN()
    for k in ("inputs_with_a_false_notice", "false_notices", "decisions_at_risk"):
        if fn["01110"][k] != fn["00000"][k]:
            return False
    return True


@check("false-notices/32-rows-matching-the-lattice")
def _():
    return sorted(FN()) == sorted(V())


@check("false-notices/pattern-is-the-imported-2026-09-20-one")
def _():
    src = os.path.join(ROOT, "tools", "same-text-twice", "false_notice_scan.py")
    pat = D("false-notices.json")["pattern"]
    return pat.replace("\\", "\\") in open(src).read().replace("\n", "").replace('"\n    r"', "") \
        or pat[:24] in open(src).read()


# --------------------------------------------------------------- the landed instrument
@check("landed/v2-exists-with-its-provenance")
def _():
    d = os.path.join(ROOT, "tools", "is-it-a-licence-v2")
    return all(os.path.isfile(os.path.join(d, f)) for f in
               ("rules.py", "fingerprints.py", "fixtures.py", "mutants.py", "PROVENANCE.md"))


@check("landed/v2-digests-equal-the-01110-variant")
def _():
    d = os.path.join(ROOT, "tools", "is-it-a-licence-v2")
    got = {f: hashlib.sha256(open(os.path.join(d, f), "rb").read()).hexdigest()
           for f in ("rules.py", "fingerprints.py")}
    return got == V()["01110"]["digests"]


@check("landed/v1-is-untouched")
def _():
    d = os.path.join(ROOT, "tools", "is-it-a-licence")
    got = {f: hashlib.sha256(open(os.path.join(d, f), "rb").read()).hexdigest()
           for f in ("rules.py", "fingerprints.py")}
    return got == D("lattice.json")["shipped_digests"]


@check("landed/the-landed-subset-is-the-clean-one")
def _():
    r = V()["01110"]
    return (r["repairs"] == ["R4", "R5", "R6"] and r["n_fixtures_failed"] == 0
            and r["n_mutants_surviving_unexpectedly"] == 0
            and r["decision_changing_total"] == 4 and r["headline_k"] == 100
            and r["delivering_symmetric_difference"] == 0
            and r["no_holder_repos"] == V()["00000"]["no_holder_repos"])


# --------------------------------------------------------------- adjudication and evidence
@check("adjudication/six-classes-read")
def _():
    a = D("adjudication.json")
    return (len(a["classes"]) == 6
            and a["totals"]["distinct_classes_this_session_read"] == 6)


@check("adjudication/full-repair-has-one-defect-class-of-nine-inputs")
def _():
    c = [x for x in D("adjudication.json")["classes"] if x["id"] == "A1"][0]
    return (c["verdict"] == "DEFECT" and c["n_inputs"] == 9
            and len(c["inputs_C1"]) + len(c["inputs_C2"]) == 9
            and c["n_inputs"] == V()["11111"]["decision_changing_total"])


@check("adjudication/landed-repair-residue-is-four-and-both-classes-latent")
def _():
    cs = [x for x in D("adjudication.json")["classes"] if x["id"] in ("B1", "B2")]
    return (len(cs) == 2 and all(c["verdict"] == "LATENT" for c in cs)
            and sum(c["n_inputs"] for c in cs) == V()["01110"]["decision_changing_total"] == 4)


@check("adjudication/four-closures-checked")
def _():
    cl = D("adjudication.json")["closures_checked"]
    return (len(cl) == 4
            and sorted(c["defect"] for c in cl) == [1, 4, 5, 6]
            and sum(1 for c in cl if c["verdict"] == "closed") == 3)


@check("evidence/the-microsoft-case-carries-all-three-readings")
def _():
    c = [x for x in D("evidence.json")["cases"]
         if x["input"] == "microsoft/WindowsAgentArena@LICENSE"][0]
    return (c["under"]["00000"]["attribution"] == "named"
            and c["under"]["00001"]["attribution"] == "named"
            and c["under"]["00001"]["notices"][0]["holder"].startswith("HOLDERS BE LIABLE")
            and c["under"]["10001"]["attribution"] == "no_copyright_line"
            and c["under"]["10001"]["n_notices"] == 0
            and c["under"]["01110"]["attribution"] == "named")


@check("evidence/defect-6-closed-on-the-input-ten-blind-workers-convicted-us-on")
def _():
    c = [x for x in D("evidence.json")["cases"] if x["input"] == "BSD-Inferno-Nettverk"][0]
    return (c["under"]["00000"]["attribution"] == "no_holder"
            and c["under"]["00010"]["attribution"] == "named"
            and "Inferno Nettverk" in c["under"]["00010"]["notices"][0]["holder"])


@check("evidence/every-case-present-and-scored-under-nine-variants")
def _():
    for c in D("evidence.json")["cases"]:
        if not c["present"] or len(c["under"]) != 9:
            return False
    return True


# --------------------------------------------------------------- predictions
@check("predictions/six-resolved-five-confirmed-one-refuted")
def _():
    p = D("predictions.json")
    ok = sum(1 for x in p["predictions"] if x["verdict"].startswith("confirmed"))
    return (len(p["predictions"]) == 6 and ok == 5
            and p["summary"]["confirmed"] == 5 and p["summary"]["refuted"] == 1)


@check("predictions/observed-values-match-the-committed-tables")
def _():
    p = {x["id"]: x for x in D("predictions.json")["predictions"]}
    lat, inter = V(), D("interactions.json")
    if p["P1"]["observed"] != lat["11111"]["decision_changing_total"]:
        return False
    if p["P2"]["observed"] != sum(1 for x in inter["pairs"] if x["dec"]["interaction"] != 0):
        return False
    if p["P3"]["observed"] != sum(1 for r in REPAIRS if lat[vid((r,))]["n_fixtures_failed"]):
        return False
    if p["P4"]["observed"] != max(r["delivering_symmetric_difference"]
                                  for r in lat.values()):
        return False
    if p["P6"]["observed"] != (lat["00011"]["decision_changing_total"]
                               - lat["00001"]["decision_changing_total"]):
        return False
    return True


@check("predictions/P4-is-the-refuted-one")
def _():
    p = {x["id"]: x for x in D("predictions.json")["predictions"]}
    return p["P4"]["verdict"] == "REFUTED" and p["P4"]["threshold"] == 0


@check("predictions/each-verdict-follows-from-its-own-threshold")
def _():
    for x in D("predictions.json")["predictions"]:
        o, t, d = x["observed"], x["threshold"], x["direction"]
        held = (o <= t) if d == "at_most" else (o >= t)
        if held != x["verdict"].startswith("confirmed"):
            return False
    return True


# --------------------------------------------------------------- sources
@check("sources/three-read-first-hand-each-with-a-quotation-and-an-access-note")
def _():
    s = D("sources.json")["read_tonight"]
    return len(s) == 3 and all(x["quoted"] and x["access"] and x["url"] for x in s)


@check("sources/the-delegate-discrepancy-is-recorded")
def _():
    n = D("sources.json")["not_cited_because_not_read"]
    return ("15% in JDT" in n["and_one_that_was_wrong"]
            and "12% in JDT" in n["and_one_that_was_wrong"])


@check("sources/house-register-searched-before-searching-outward")
def _():
    h = D("sources.json")["house_register_first"]
    return h["http"] == 200 and h["searched_for"]["incorrect fix"] == 0


@check("apparatus/declares-no-model-and-no-third-party-library")
def _():
    a = D("apparatus.json")
    return (a["third_party_libraries"] == []
            and "No rule" in a["no_model_in_the_measurement"]
            and a["reasoning_and_writing_agent"]["provider"]
            and a["reasoning_and_writing_agent"]["model_configured"])


# --------------------------------------------------------------- the page itself
@check("page/rebuilds-byte-identical-from-data")
def _():
    p = subprocess.run([sys.executable,
                        os.path.join(ROOT, "tools", "a-repair-is-a-new-rule", "make_page.py"),
                        HERE, "--check"], capture_output=True, text=True)
    return p.returncode == 0


@check("page/claims-no-person-read-anything")
def _():
    bad = re.compile(r"(?i)(a person read|a person reading|still a person|by a person"
                     r"|hand[- ]read|read by hand|human reader)")
    return not bad.search(page()) and not bad.search(summary())


@check("page/names-the-reader-as-this-session-a-machine")
def _():
    return ("No person read any of it" in page()
            and "which is a machine" in page()
            and "No person read any of it" in summary())


@check("page/the-headline-table-prints-all-four-outcomes")
def _():
    pg = page()
    return all(f'{o["pct"]}' in pg.replace("&thinsp;", "")
               for o in D("headline.json")["distinct_outcomes"])


@check("page/prints-the-preregistrations-amendment-reason")
def _():
    pre = open(os.path.join(HERE, "PREREGISTRATION.md")).read()
    return ("Amendment 1" in pre and "R4 + R5 + R6" in pre
            and "not landed" in pre and "NOTICE/no-year-but-capital" in pre)


@check("page/every-lattice-row-appears-in-the-no-javascript-table")
def _():
    pg = page()
    body = pg.split('<table><thead><tr><th>Subset</th>')[1].split("</tbody></table>")[0]
    rows = body.count("<tr>")
    return rows == 32


@check("page/the-interactive-figure-reads-committed-numbers-only")
def _():
    pg = page()
    blob = pg.split('<script id="lat" type="application/json">')[1].split("</script>")[0]
    grid = {g["v"]: g for g in json.loads(blob)}
    lat, fn = V(), FN()
    if sorted(grid) != sorted(lat):
        return False
    for v, g in grid.items():
        if (g["viol"] != lat[v]["decision_changing_total"]
                or g["fix"] != lat[v]["n_fixtures_failed"]
                or g["mut"] != lat[v]["n_mutants_surviving_unexpectedly"]
                or g["head"] != lat[v]["headline_k"]
                or g["diff"] != lat[v]["delivering_symmetric_difference"]
                or g["fals"] != fn[v]["false_notices"]
                or g["risk"] != fn[v]["decisions_at_risk"]):
            return False
    return True


@check("page/no-outside-fetch-and-no-remote-asset")
def _():
    pg = page()
    return not re.search(r"(?i)(src|href)\s*=\s*[\"']https?://", pg) \
        and "fetch(" not in pg and "XMLHttpRequest" not in pg


# --------------------------------------------------------------- corrections filed
@check("correction/audited-files-digests-match-the-files-as-they-stand")
def _():
    for f in D("correction.json")["audited_files"]:
        p = os.path.join(ROOT, f["path"])
        if not os.path.isfile(p):
            return False
        if hashlib.sha256(open(p, "rb").read()).hexdigest() != f["sha256"]:
            return False
    return True


@check("correction/outcomes-match-the-headline-table")
def _():
    c = D("correction.json")["the_correction"]["outcomes"]
    h = D("headline.json")["distinct_outcomes"]
    if len(c) != len(h):
        return False
    for x, y in zip(c, h):
        if (x["n_subsets"] != y["n_variants"] or x["gained"] != y["gained_vs_shipped"]
                or x["lost"] != y["lost_vs_shipped"]):
            return False
    return True


@check("correction/the-landed-repair-restates-nothing")
def _():
    lat = V()
    return (lat["01110"]["headline_k"] == lat["00000"]["headline_k"] == 100
            and lat["01110"]["delivering_symmetric_difference"] == 0
            and lat["01110"]["L2"] == lat["00000"]["L2"]
            and "01110" in D("correction.json")["what_does_not_move"]["reference"])


@check("correction/the-2026-09-20-undercount-is-three")
def _():
    lat = V()
    u3 = [c for c in D("adjudication.json")["classes"] if c["id"] == "U3"][0]
    return (lat["10000"]["decision_changing_total"] - lat["00000"]["decision_changing_total"] == 1
            and len(u3["added"]) == 3 and len(u3["removed"]) == 2)


@check("page/prints-both-corrections")
def _():
    pg = page()
    return ("Against 2026-09-18" in pg and "Against 2026-09-20" in pg
            and "UNDERCOUNT" in pg.upper())


@check("page/has-a-no-javascript-floor-naming-the-table")
def _():
    pg = page()
    return "<noscript>" in pg and "complete figure stands as a table" in pg


@check("page/renders-with-and-without-scripting-verified-in-a-real-browser")
def _():
    r = D("render-check.json")
    return (r["widths"] and all(not w["overflow"] and w["console_errors"] == 0
                                and w["network_requests"] == 0 for w in r["widths"])
            and r["with_javascript"]["interactive_cells"] == 32
            and r["without_javascript"]["interactive_cells"] == 0
            and r["without_javascript"]["table_rows"] == r["with_javascript"]["table_rows"] == 52
            and r["without_javascript"]["page_errors"] == 0)


def main():
    quiet = "--quiet" in sys.argv
    failed = []
    for name, fn in CHECKS:
        try:
            ok = bool(fn())
            err = None
        except Exception as exc:                                     # noqa: BLE001
            ok, err = False, f"{type(exc).__name__}: {exc}"
        if not ok:
            failed.append((name, err))
        if not quiet and not ok:
            print(f"  FAIL  {name}" + (f"  [{err}]" if err else ""))
    print(f"{len(CHECKS)} checks, {len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())


if __name__ == "__main__":
    sys.exit(main())
