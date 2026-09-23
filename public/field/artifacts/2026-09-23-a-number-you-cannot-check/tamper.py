#!/usr/bin/env python3
"""Corrupt this artifact's own evidence in named ways and require a named check to fail.

Session 168, 2026-09-23. Run:  python3 tamper.py
Exit 0 when every corruption is caught by the check that is supposed to catch it.

Two rules learned the hard way on 2026-09-22:
  - a tamper that corrupts nothing is a bad test (a duplicate JSON key is overwritten by the
    later one), so every corruption here asserts that the file's bytes actually changed;
  - a suite that counts itself can count wrong, so the count below is asserted against the
    number of entries in CORRUPTIONS, not against a running total.

Each corruption is applied to a file, check.py is run, the file is restored, and the named
check must appear among the failures.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def resolve(path):
    """data/ for the evidence files, the artifact root for the page."""
    direct = os.path.join(HERE, path)
    return direct if os.path.exists(direct) else os.path.join(HERE, "data", path)


def jset(path, fn):
    """Load JSON, mutate through fn, write back."""
    p = resolve(path)
    obj = json.load(open(p, encoding="utf-8"))
    fn(obj)
    open(p, "w", encoding="utf-8").write(json.dumps(obj, ensure_ascii=False, indent=1))


def tset(path, fn):
    # The read MUST complete before the write opens the file. On 2026-09-22 this practice
    # recorded a variant builder that truncated the file it was about to read because the
    # two were one expression; the first version of this function did it again, eight
    # sessions later, and the tamper run below is what caught it.
    p = resolve(path)
    text = open(p, encoding="utf-8").read()
    new_text = fn(text)
    open(p, "w", encoding="utf-8").write(new_text)


CORRUPTIONS = [
    ("a document digest in corpus M is altered", "corpora.json",
     lambda p: jset(p, lambda o: o["M"]["docs"][0].__setitem__("sha256", "0" * 64)),
     "corpora: every corpus digest is the SHA-256 over its documents' digests"),
    ("a document is removed from corpus A", "corpora.json",
     lambda p: jset(p, lambda o: o["A"]["docs"].pop()),
     # Named for the check that this corruption exposed as MISSING: the first run fired only
     # the digest check, because nothing compared the manifest's stated count with its rows.
     "corpora: the stated document count equals the number of rows in the manifest"),
    ("corpus F is said to hold 20 summaries", "corpora.json",
     lambda p: jset(p, lambda o: o["F"].__setitem__("summaries", 20)),
     "corpora: corpus F holds 21 summaries and 9 bulletins"),
    ("corpus M's token total is inflated by one", "estimates.json",
     lambda p: jset(p, lambda o: o["M"].__setitem__("tokens", o["M"]["tokens"] + 1)),
     "screen: tokens = recomputable + not recomputable, in each corpus"),
    ("corpus M's consistent count is reduced by one", "estimates.json",
     lambda p: jset(p, lambda o: o["M"]["screen"].__setitem__(
         "consistent", o["M"]["screen"]["consistent"] - 1)),
     "screen: consistent + inconsistent + complement = recomputable"),
    ("corpus A's screen rate is rewritten to 30 %", "estimates.json",
     lambda p: jset(p, lambda o: o["A"]["screen"].__setitem__("rate", 30.0)),
     "screen: the screen rate is recomputable / tokens to two decimals"),
    ("a complement-consistent token is invented in corpus F", "estimates.json",
     lambda p: jset(p, lambda o: o["F"]["screen"].__setitem__("complement", 1)),
     "screen: no complement-consistent token was found in any corpus"),
    ("a rule error in corpus A is promoted to a real error", "adjudication.json",
     lambda p: jset(p, lambda o: o["A"][0].__setitem__("verdict", "real")),
     "adjudication: 33 flags in total, 6 adjudicated real, all 6 in corpus M"),
    ("a recomputed percentage is detached from its own fraction", "adjudication.json",
     lambda p: jset(p, lambda o: o["M"][0].__setitem__("recomputed", 50.0)),
     "adjudication: every recomputed value equals 100*k/n for its own pair"),
    ("a flagged token is made to agree with its fraction after all", "adjudication.json",
     lambda p: jset(p, lambda o: o["M"][0].__setitem__("printed", "2.3%")),
     "adjudication: every flagged printed value really does differ from its fraction"),
    ("the note is stripped from a real error", "adjudication.json",
     lambda p: jset(p, lambda o: next(r for r in o["M"] if r["verdict"] == "real")
                    .__setitem__("note", None)),
     "adjudication: every row adjudicated real carries a note explaining it"),
    ("the concentration of flags in one document is hidden", "adjudication.json",
     lambda p: jset(p, lambda o: o["M"][5].__setitem__("doc", "99999999")),
     "adjudication: 13 of the 25 flags in corpus M come from one single document"),
    ("corpus F's precision is raised to match the world corpora", "estimates.json",
     lambda p: jset(p, lambda o: o["F"]["sample"].__setitem__("precision", 0.92)),
     "estimate: precision = pairings a reader would make / recomputable tokens read"),
    ("corpus M's hand-over rate is lifted by ten points", "estimates.json",
     lambda p: jset(p, lambda o: o["M"]["hand_over_rate"].__setitem__("point", 20.63)),
     "estimate: the hand-over point estimate is the stratum-weighted reading"),
    ("corpus A's interval is narrowed at the top", "estimates.json",
     lambda p: jset(p, lambda o: o["A"]["hand_over_rate"].__setitem__("high", 4.0)),
     "estimate: both interval ends are the same weighting at the Wilson bounds"),
    ("a Wilson bound is rewritten", "estimates.json",
     lambda p: jset(p, lambda o: o["F"]["sample"].__setitem__("precision_95", [0.9, 0.99])),
     "estimate: the Wilson bounds recorded for precision and miss rate are correct"),
    ("a rule miss is deleted from the composition but left in the count", "estimates.json",
     lambda p: jset(p, lambda o: o["M"]["sample"]["composition"].__setitem__("rule_miss", 0)),
     "estimate: the rule-miss count in the composition equals the reported miss count"),
    ("the ordering flip between screen and reading is flattened", "estimates.json",
     lambda p: jset(p, lambda o: o["F"]["screen"].__setitem__("rate", 1.0)),
     "estimate: the screen and the reading order the three corpora differently"),
    ("the refuted prediction is recorded as confirmed", "predictions.json",
     lambda p: jset(p, lambda o: next(x for x in o["predictions"] if x["id"] == "P3")
                    .__setitem__("outcome", "CONFIRMED")),
     "predictions: six registered, five confirmed and P3 refuted"),
    ("the recorded digest of the rule is altered", "apparatus.json",
     lambda p: jset(p, lambda o: o["files"].__setitem__("handover.py", "f" * 64)),
     "apparatus: the recorded digest of handover.py matches the file on disk"),
    ("the surviving mutation is recorded as caught", "apparatus.json",
     lambda p: jset(p, lambda o: o.__setitem__("mutations_survived", [])),
     "apparatus: 20 mutations, exactly one survived, and it is the asterisk line"),
    ("a mutation anchor is recorded as non-unique", "apparatus.json",
     lambda p: jset(p, lambda o: o.__setitem__("anchors_not_unique", [["M01", 2]])),
     "apparatus: every recorded mutation anchor was unique, so none corrupted nothing"),
    ("the one differing document is recorded as nil", "robustness.json",
     lambda p: jset(p, lambda o: o["asterisk_stripping"].__setitem__("documents_differing", 0)),
     "robustness: the surviving mutation changes exactly one document in 2030"),
    ("the entity-carrying abstracts are recorded as none", "robustness.json",
     lambda p: jset(p, lambda o: o["M"].__setitem__("documents_carrying_html_entities", 0)),
     "robustness: 794 of the 1000 medical abstracts arrive carrying HTML entities"),
    ("decoding is made to move the rate by a whole point", "robustness.json",
     lambda p: jset(p, lambda o: o["M"].__setitem__("screen_rate_decoded", 6.0)),
     "robustness: decoding the source's entities moves the screen rate by under half a point"),
    ("a source loses its quotations", "sources.json",
     lambda p: jset(p, lambda o: o["sources"][0].__setitem__("quotes", [])),
     "sources: both load-bearing sources carry a read date and at least one quotation"),
    ("the arXiv refusal is removed from the access record", "sources.json",
     lambda p: jset(p, lambda o: o["access_results_of_this_session"]
                    .__setitem__("arxiv_api", "fine")),
     "sources: the access results of this session are recorded, arXiv included"),
    ("the summary's own hand-over count is overstated", "self.json",
     lambda p: jset(p, lambda o: o.__setitem__("recomputable", 9)),
     "self: the post-hoc run on this session's summary reproduces from the file on disk"),
    ("the summary is said to hand over less than the corpora", "self.json",
     lambda p: jset(p, lambda o: o.__setitem__("rate", 1.0)),
     "self: this session's own summary hands over more than any corpus it measured"),
    ("an overflowing render is recorded as clean", "render-check.json",
     lambda p: jset(p, lambda o: o["widths"][0].__setitem__("horizontal_overflow", True)),
     "render: six real-browser renders, no horizontal overflow at any width"),
    ("a control is recorded on the page", "render-check.json",
     lambda p: jset(p, lambda o: o["widths"][3].__setitem__("interactive_controls", 1)),
     "render: zero controls, zero console errors and zero network requests in every render"),
    ("the page is made to differ without scripting", "render-check.json",
     lambda p: jset(p, lambda o: o["widths"][3].__setitem__("text_chars", 9)),
     "render: the page is character-identical with scripting on and off"),
    ("a headline figure on the page is edited", "index.html",
     lambda p: tset(p, lambda s: s.replace("10.63", "19.63")),
     "page: every headline figure on the page is one that data/ produces"),
    ("a script tag is added to the page", "index.html",
     lambda p: tset(p, lambda s: s.replace("</main>", "<script>void 0;</script></main>")),
     "page: no JavaScript and no external resource is referenced"),
    ("the page stops naming the refuted prediction", "index.html",
     lambda p: tset(p, lambda s: s.replace("refutes our own prediction", "confirms our reading")),
     "page: the refuted prediction is named as refuted on the page"),
]


def run_check():
    r = subprocess.run([sys.executable, os.path.join(HERE, "check.py")],
                       capture_output=True, text=True, cwd=HERE)
    return set(re.findall(r"^  FAIL  (.+?)(?:  \[|$)", r.stdout, re.M)), r.stdout


def main():
    clean, out = run_check()
    if clean:
        print("REFUSING TO RUN: the suite already fails before any corruption.")
        print(out)
        return 2
    results = []
    for name, path, corrupt, expected in CORRUPTIONS:
        p = resolve(path)
        before = open(p, "rb").read()
        corrupt(path)
        after = open(p, "rb").read()
        try:
            if before == after:
                results.append((name, expected, False, "CORRUPTED NOTHING"))
                continue
            failures, _ = run_check()
            if expected in failures:
                results.append((name, expected, True, f"{len(failures)} check(s) failed"))
            else:
                results.append((name, expected, False,
                                "named check did not fire; fired: " + "; ".join(sorted(failures))))
        finally:
            open(p, "wb").write(before)
    bad = [r for r in results if not r[2]]
    for name, expected, ok, note in results:
        print(f"  {'OK  ' if ok else 'MISS'}  {name}\n          -> {expected}  [{note}]")
    print(f"{len(CORRUPTIONS)} corruptions, {len(results)} applied, {len(bad)} not caught")
    after_all, _ = run_check()
    if after_all:
        print("EVIDENCE NOT RESTORED: the suite fails after the run.")
        return 2
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
