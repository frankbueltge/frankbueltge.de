#!/usr/bin/env python3
"""Corrupt this artifact's own evidence in named ways; show which check catches each.

Session 167, 2026-09-22. A check suite that has never failed has not been shown to work.
Each corruption below is applied to a COPY of the artifact, `check.py` is run against the
copy, and the named check must be among the failures. Nothing in this repository is
modified.

Run: python3 tamper.py [out.json]
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
NAME = os.path.basename(HERE)


def jset(path, fn):
    d = json.load(open(path))
    fn(d)
    json.dump(d, open(path, "w"), indent=1, ensure_ascii=False)


def V(d, v):
    return [r for r in d["variants"] if r["variant"] == v][0]


# (label, expected failing check, mutation applied inside the copied artifact dir)
def corruptions():
    L = "data/lattice.json"
    I = "data/interactions.json"
    H = "data/headline.json"
    C = "data/corpora.json"
    F = "data/false-notices.json"
    A = "data/adjudication.json"
    P = "data/predictions.json"
    E = "data/evidence.json"
    S = "data/sources.json"
    return [
        ("shipped violation total nudged from 167 to 166",
         "baseline/shipped-reproduces-167-0-0-100",
         lambda d: jset(d + L, lambda x: V(x, "00000").__setitem__("decision_changing_total", 166))),
        ("full repair headline raised by one without its percentage",
         "lattice/headline-pct-consistent",
         lambda d: jset(d + L, lambda x: V(x, "11111").__setitem__("headline_k", 101))),
        ("one of the 32 subsets deleted",
         "lattice/32-variants",
         lambda d: jset(d + L, lambda x: x["variants"].pop(7))),
        ("the negative control made to fire on one subset",
         "lattice/M4-control-zero-everywhere",
         lambda d: jset(d + L, lambda x: V(x, "01001").__setitem__("control_M4", 1))),
        ("one relation's count edited so the row no longer sums",
         "lattice/relation-counts-sum-to-total",
         lambda d: jset(d + L, lambda x: V(x, "00000")["decision_changing_by_relation"]
                        .__setitem__("M1", 139))),
        ("the shipped rule's digest replaced",
         "baseline/shipped-digests-are-the-2026-09-18-rule",
         lambda d: jset(d + L, lambda x: x["shipped_digests"].__setitem__(
             "fingerprints.py", "0" * 64))),
        ("the landed subset's digest replaced",
         "landed/v2-digests-equal-the-01110-variant",
         lambda d: jset(d + L, lambda x: V(x, "01110")["digests"].__setitem__(
             "fingerprints.py", "1" * 64))),
        ("a subset's repair list made to disagree with its own identifier",
         "lattice/repairs-match-variant-id",
         lambda d: jset(d + L, lambda x: V(x, "01000").__setitem__("repairs", ["R5"]))),
        ("a repository added to a subset's gains without changing its count",
         "lattice/symmetric-difference-consistent",
         lambda d: jset(d + L, lambda x: V(x, "01000")["delivering_gained_vs_shipped"]
                        .append("invented/repository"))),
        ("an interaction value rewritten",
         "interactions/recomputed-from-the-lattice",
         lambda d: jset(d + I, lambda x: x["pairs"][0]["dec"].__setitem__("interaction", 0))),
        ("a second repair declared to change sign",
         "interactions/R7-is-the-only-sign-changing-marginal",
         lambda d: jset(d + I, lambda x: [m for m in x["marginal_effects_on_violations"]
                                          if m["repair"] == "R4"][0]
                        .__setitem__("sign_changes", True))),
        ("a marginal-effect row's arithmetic broken",
         "interactions/marginals-recomputed-from-the-lattice",
         lambda d: jset(d + I, lambda x: x["marginal_effects_on_violations"][0]["contexts"][0]
                        .__setitem__("marginal", 99))),
        ("a subset moved into the wrong headline group",
         "headline/groups-recomputed-from-the-lattice",
         lambda d: jset(d + H, lambda x: x["distinct_outcomes"][1]["variants"].append("00001"))),
        ("a whole headline group deleted",
         "headline/every-variant-in-exactly-one-group",
         lambda d: jset(d + H, lambda x: x["distinct_outcomes"].pop(0))),
        ("the C1 corpus digest altered",
         "corpora/digests-match-2026-09-20",
         lambda d: jset(d + C, lambda x: x["C1"].__setitem__("corpus_digest", "f" * 64))),
        ("one pinned blob declared excluded",
         "corpora/896-inputs-none-excluded",
         lambda d: jset(d + C, lambda x: x["C2"]["excluded"].append("some/repo@LICENSE"))),
        ("R7's false-notice count reduced to look harmless",
         "false-notices/R7-multiplies-them-and-puts-decisions-on-them",
         lambda d: jset(d + F, lambda x: [r for r in x["variants"]
                                          if r["variant"] == "00001"][0]
                        .__setitem__("false_notices", 20))),
        ("the shipped rule given a decision at risk it does not have",
         "false-notices/reference-of-2026-09-20-reproduced-by-the-shipped-rule",
         lambda d: jset(d + F, lambda x: [r for r in x["variants"]
                                          if r["variant"] == "00000"][0]
                        .__setitem__("decisions_at_risk", 2))),
        ("the landed subset's false notices made to differ from the shipped rule's",
         "false-notices/landed-subset-identical-to-shipped",
         lambda d: jset(d + F, lambda x: [r for r in x["variants"]
                                          if r["variant"] == "01110"][0]
                        .__setitem__("false_notices", 9))),
        ("the full repair's defect class downgraded to latent",
         "adjudication/full-repair-has-one-defect-class-of-nine-inputs",
         lambda d: jset(d + A, lambda x: [c for c in x["classes"] if c["id"] == "A1"][0]
                        .__setitem__("verdict", "LATENT"))),
        ("a closure claimed for the defect that is not closed",
         "adjudication/four-closures-checked",
         lambda d: jset(d + A, lambda x: [c for c in x["closures_checked"]
                                          if c["defect"] == 1][0]
                        .__setitem__("verdict", "closed"))),
        ("the refuted prediction marked confirmed",
         "predictions/each-verdict-follows-from-its-own-threshold",
         lambda d: jset(d + P, lambda x: [p for p in x["predictions"]
                                          if p["id"] == "P4"][0]
                        .__setitem__("verdict", "confirmed"))),
        ("a prediction's observed value detached from the tables",
         "predictions/observed-values-match-the-committed-tables",
         lambda d: jset(d + P, lambda x: [p for p in x["predictions"]
                                          if p["id"] == "P1"][0].__setitem__("observed", 2))),
        ("the fabricated holder edited out of the decisive case",
         "evidence/the-microsoft-case-carries-all-three-readings",
         lambda d: jset(d + E, lambda x: [c for c in x["cases"]
                                          if c["input"] == "microsoft/WindowsAgentArena@LICENSE"][0]
                        ["under"]["00001"]["notices"][0]
                        .__setitem__("holder", "Microsoft Corporation"))),
        ("the record of the delegate's wrong figures removed",
         "sources/the-delegate-discrepancy-is-recorded",
         lambda d: jset(d + S, lambda x: x["not_cited_because_not_read"].__setitem__(
             "and_one_that_was_wrong", "nothing to report"))),
        ("a number edited in the published page",
         "page/rebuilds-byte-identical-from-data",
         lambda d: _sub(d + "index.html", "167", "165", 1)),
        ("a sentence added claiming a person read the classes",
         "page/claims-no-person-read-anything",
         lambda d: _sub(d + "index.html", "<footer>",
                        "<footer><p>Every class was hand-read by a person.</p>", 1)),
        # The first version of this corruption INSERTED a duplicate key instead of
        # replacing the value, and a later duplicate wins in JSON, so it corrupted
        # nothing and the named check rightly did not fire. A tamper that fails to
        # tamper is the same shape as the defects this artifact is about, and it is
        # left recorded here rather than silently replaced.
        ("a number changed inside the interactive figure's own data block",
         "page/the-interactive-figure-reads-committed-numbers-only",
         lambda d: _sub(d + "index.html", '"v":"00001","r":["R7"],"k":1,"viol":7',
                        '"v":"00001","r":["R7"],"k":1,"viol":0', 1)),
        ("an outside asset added to the page",
         "page/no-outside-fetch-and-no-remote-asset",
         lambda d: _sub(d + "index.html", "</head>",
                        '<script src="https://example.invalid/x.js"></script></head>', 1)),
        ("the amendment's reason struck from the pre-registration",
         "page/prints-the-preregistrations-amendment-reason",
         lambda d: _sub(d + "PREREGISTRATION.md", "NOTICE/no-year-but-capital", "a fixture", 3)),
    ]


def _sub(path, old, new, count):
    t = open(path).read()
    assert old in t, (path, old)
    open(path, "w").write(t.replace(old, new, count))


def main():
    rows = []
    for label, expect, mutate in corruptions():
        tmp = tempfile.mkdtemp(prefix="tamper-")
        try:
            adir = os.path.join(tmp, "artifacts", NAME)
            os.makedirs(os.path.dirname(adir))
            shutil.copytree(HERE, adir)
            os.symlink(os.path.join(ROOT, "tools"), os.path.join(tmp, "tools"))
            mutate(adir + os.sep)
            p = subprocess.run([sys.executable, os.path.join(adir, "check.py")],
                               capture_output=True, text=True)
            fails = re.findall(r"^  FAIL  (\S+)", p.stdout, re.M)
            rows.append({"corruption": label, "expected_check": expect,
                         "caught": expect in fails, "exit": p.returncode,
                         "n_failing_checks": len(fails), "failing_checks": fails})
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
    missed = [r for r in rows if not r["caught"]]
    out = {"note": "Session 167. Each corruption of this artifact's own evidence, and the "
                   "named check that must catch it. Applied to a copy; nothing in the "
                   "repository is modified.",
           "n_corruptions": len(rows), "n_caught": len(rows) - len(missed),
           "n_missed": len(missed), "corruptions": rows}
    dest = sys.argv[1] if len(sys.argv) > 1 else None
    if dest:
        json.dump(out, open(dest, "w"), indent=1, ensure_ascii=False)
    for r in rows:
        print(("  OK   " if r["caught"] else "  MISS ")
              + f'{r["corruption"]}  ->  {r["expected_check"]}'
              + ("" if r["caught"] else f'   (fired: {r["failing_checks"]})'))
    print(f'{len(rows)} corruptions, {len(missed)} not caught by the named check')
    return 1 if missed else 0


if __name__ == "__main__":
    sys.exit(main())
