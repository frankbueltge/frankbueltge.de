#!/usr/bin/env python3
"""Re-derive every number on this artifact's page from data/, with no network.

Session 168, 2026-09-23. Run:  python3 check.py [--quiet]
Exit 0 when every check passes. Each check has a NAME, and tamper.py names the check it
expects to break for each deliberate corruption of the evidence.

A suite that counts itself can count wrong -- bad test 12 of 2026-09-22 printed
"58 checks, 0 failed" while five checks appended after its __main__ guard never ran.
So this suite counts the @check decorators in its own source and refuses to report a
total that does not match what it registered.
"""
import hashlib
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(os.path.dirname(os.path.dirname(HERE)), "tools", "a-number-you-cannot-check")
CHECKS = []


def check(name):
    def deco(fn):
        CHECKS.append((name, fn))
        return fn
    return deco


def d(n):
    return json.load(open(os.path.join(HERE, "data", n), encoding="utf-8"))


def page():
    return open(os.path.join(HERE, "index.html"), encoding="utf-8").read()


def wilson(k, n, z=1.959963985):
    if n == 0:
        return [0.0, 1.0]
    p = k / n
    den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [max(0.0, c - h), min(1.0, c + h)]


# ---------------------------------------------------------------- corpora
@check("corpora: document counts are 1000 / 1000 / 30")
def _c1():
    m = d("corpora.json")
    return (m["M"]["documents"] == 1000 and m["A"]["documents"] == 1000
            and m["F"]["documents"] == 30)


@check("corpora: every corpus digest is the SHA-256 over its documents' digests")
def _c2():
    m = d("corpora.json")
    for c in "MAF":
        j = hashlib.sha256("".join(r["sha256"] for r in m[c]["docs"]).encode()).hexdigest()
        if j != m[c]["corpus_digest"]:
            return False
    return True


@check("corpora: every document digest is 64 hex characters and every id is non-empty")
def _c3():
    m = d("corpora.json")
    return all(re.fullmatch(r"[0-9a-f]{64}", r["sha256"]) and r["id"]
               for c in "MAF" for r in m[c]["docs"])


@check("corpora: corpus F holds 21 summaries and 9 bulletins")
def _c4():
    m = d("corpora.json")
    return m["F"]["summaries"] == 21 and m["F"]["bulletins"] == 9


@check("corpora: the stated document count equals the number of rows in the manifest")
def _c6():
    m = d("corpora.json")
    return all(m[c]["documents"] == len(m[c]["docs"]) for c in "MAF")


@check("corpora: the manifest document count equals the estimates' document count")
def _c5():
    m, e = d("corpora.json"), d("estimates.json")
    return all(m[c]["documents"] == e[c]["documents"] for c in "MAF")


# ---------------------------------------------------------------- screen arithmetic
@check("screen: tokens = recomputable + not recomputable, in each corpus")
def _s1():
    e = d("estimates.json")
    return all(e[c]["screen"]["recomputable"] + e[c]["screen"]["not_recomputable"]
               == e[c]["tokens"] for c in "MAF")


@check("screen: consistent + inconsistent + complement = recomputable")
def _s2():
    e = d("estimates.json")
    for c in "MAF":
        s = e[c]["screen"]
        if s["consistent"] + s["inconsistent"] + s["complement"] != s["recomputable"]:
            return False
    return True


@check("screen: the screen rate is recomputable / tokens to two decimals")
def _s3():
    e = d("estimates.json")
    return all(abs(e[c]["screen"]["rate"]
                   - round(100.0 * e[c]["screen"]["recomputable"] / e[c]["tokens"], 2)) < 1e-9
               for c in "MAF")


@check("screen: no complement-consistent token was found in any corpus")
def _s4():
    e = d("estimates.json")
    return all(e[c]["screen"]["complement"] == 0 for c in "MAF")


@check("screen: the three screens are 314 / 27 / 20 recomputable of 4166 / 853 / 197")
def _s5():
    e = d("estimates.json")
    return [(e[c]["screen"]["recomputable"], e[c]["tokens"]) for c in "MAF"] == \
           [(314, 4166), (27, 853), (20, 197)]


# ---------------------------------------------------------------- adjudication
@check("adjudication: one row per flagged token, in each corpus")
def _a1():
    a, e = d("adjudication.json"), d("estimates.json")
    return all(len(a[c]) == e[c]["flagged"] == e[c]["screen"]["inconsistent"]
               + e[c]["screen"]["complement"] for c in "MAF")


@check("adjudication: 33 flags in total, 6 adjudicated real, all 6 in corpus M")
def _a2():
    a = d("adjudication.json")
    tot = sum(len(a[c]) for c in "MAF")
    real = {c: sum(1 for r in a[c] if r["verdict"] == "real") for c in "MAF"}
    return tot == 33 and real == {"M": 6, "A": 0, "F": 0}


@check("adjudication: every verdict is one of real / rule_error")
def _a3():
    a = d("adjudication.json")
    return all(r["verdict"] in ("real", "rule_error") for c in "MAF" for r in a[c])


@check("adjudication: every recomputed value equals 100*k/n for its own pair")
def _a4():
    a = d("adjudication.json")
    for c in "MAF":
        for r in a[c]:
            k, n = r["pair"]
            if abs(r["recomputed"] - round(100.0 * k / n, 4)) > 5e-5:
                return False
    return True


@check("adjudication: every flagged printed value really does differ from its fraction")
def _a5():
    a = d("adjudication.json")
    for c in "MAF":
        for r in a[c]:
            p = float(re.sub(r"[^0-9.]", "", r["printed"]))
            dec = len(r["printed"].split(".")[1].rstrip(" %percent")) if "." in r["printed"] else 0
            exp = r["recomputed"]
            f = 10 ** dec
            if abs(p - float(int(exp * f + 0.5)) / f) < 1e-9 or abs(p - float(int(exp * f)) / f) < 1e-9:
                return False
    return True


@check("adjudication: every row adjudicated real carries a note explaining it")
def _a6():
    a = d("adjudication.json")
    return all(r["note"] for c in "MAF" for r in a[c] if r["verdict"] == "real")


@check("adjudication: the real errors stand in 4 distinct documents of corpus M")
def _a7():
    e = d("estimates.json")
    return e["M"]["documents_with_a_real_error"] == 4 == len(e["M"]["docs_with_a_real_error"])


@check("adjudication: 13 of the 25 flags in corpus M come from one single document")
def _a8():
    a = d("adjudication.json")
    counts = {}
    for r in a["M"]:
        counts[r["doc"]] = counts.get(r["doc"], 0) + 1
    return max(counts.values()) == 13


@check("adjudication: the flag precision is 6 of 33, i.e. 82 % of convictions are false")
def _a9():
    a = d("adjudication.json")
    tot = sum(len(a[c]) for c in "MAF")
    real = sum(1 for c in "MAF" for r in a[c] if r["verdict"] == "real")
    return tot == 33 and real == 6 and 100 - round(100 * real / tot) == 82


# ---------------------------------------------------------------- the estimate
@check("estimate: each corpus's sample composition sums to the tokens read")
def _e1():
    e = d("estimates.json")
    for c in "MAF":
        s = e[c]["sample"]
        if sum(s["composition"].values()) != s["non_recomputable_read"]:
            return False
    return True


@check("estimate: the rule-miss count in the composition equals the reported miss count")
def _e2():
    e = d("estimates.json")
    return all(e[c]["sample"]["composition"].get("rule_miss", 0) == e[c]["sample"]["rule_misses"]
               for c in "MAF")


@check("estimate: precision = pairings a reader would make / recomputable tokens read")
def _e3():
    e = d("estimates.json")
    for c in "MAF":
        s = e[c]["sample"]
        if abs(s["precision"] - s["pairing_a_reader_would_make"] / s["recomputable_read"]) > 1e-9:
            return False
    return True


@check("estimate: the hand-over point estimate is the stratum-weighted reading")
def _e4():
    e = d("estimates.json")
    for c in "MAF":
        s, sc = e[c]["sample"], e[c]["screen"]
        got = (sc["recomputable"] * s["precision"]
               + sc["not_recomputable"] * s["miss_rate"]) / e[c]["tokens"]
        if abs(e[c]["hand_over_rate"]["point"] - round(100.0 * got, 2)) > 0.01:
            return False
    return True


@check("estimate: both interval ends are the same weighting at the Wilson bounds")
def _e5():
    e = d("estimates.json")
    for c in "MAF":
        s, sc = e[c]["sample"], e[c]["screen"]
        lo_r, hi_r = wilson(s["pairing_a_reader_would_make"], s["recomputable_read"])
        lo_n, hi_n = wilson(s["rule_misses"], s["non_recomputable_read"])
        lo = 100.0 * (sc["recomputable"] * lo_r + sc["not_recomputable"] * lo_n) / e[c]["tokens"]
        hi = 100.0 * (sc["recomputable"] * hi_r + sc["not_recomputable"] * hi_n) / e[c]["tokens"]
        if abs(e[c]["hand_over_rate"]["low"] - round(lo, 2)) > 0.01 or \
           abs(e[c]["hand_over_rate"]["high"] - round(hi, 2)) > 0.01:
            return False
    return True


@check("estimate: the Wilson bounds recorded for precision and miss rate are correct")
def _e6():
    e = d("estimates.json")
    for c in "MAF":
        s = e[c]["sample"]
        for got, args in ((s["precision_95"], (s["pairing_a_reader_would_make"], s["recomputable_read"])),
                          (s["miss_rate_95"], (s["rule_misses"], s["non_recomputable_read"]))):
            want = [round(x, 4) for x in wilson(*args)]
            if [round(x, 4) for x in got] != want:
                return False
    return True


@check("estimate: 150 sentences were read in total, 70 recomputable and 75 not, plus 5 short in F")
def _e7():
    e = d("estimates.json")
    rec = sum(e[c]["sample"]["recomputable_read"] for c in "MAF")
    non = sum(e[c]["sample"]["non_recomputable_read"] for c in "MAF")
    return rec == 70 and non == 75 and e["F"]["sample"]["recomputable_read"] == 20


@check("estimate: every hand-over interval lies wholly below 50 %")
def _e8():
    e = d("estimates.json")
    return all(e[c]["hand_over_rate"]["high"] < 50.0 for c in "MAF")


@check("estimate: the screen and the reading order the three corpora differently")
def _e9():
    e = d("estimates.json")
    scr = sorted("MAF", key=lambda c: -e[c]["screen"]["rate"])
    hand = sorted("MAF", key=lambda c: -e[c]["hand_over_rate"]["point"])
    return scr == ["F", "M", "A"] and hand == ["M", "F", "A"]


# ---------------------------------------------------------------- predictions
@check("predictions: six registered, five confirmed and P3 refuted")
def _p1():
    p = d("predictions.json")["predictions"]
    out = {x["id"]: x["outcome"] for x in p}
    return len(p) == 6 and out["P3"] == "REFUTED" and \
        all(out[i] == "CONFIRMED" for i in ("P1", "P2", "P4", "P5", "P6"))


@check("predictions: P1 and P2 hold on the reading and on the raw screen alike")
def _p2():
    e = d("estimates.json")
    return (e["M"]["hand_over_rate"]["point"] > e["A"]["hand_over_rate"]["point"]
            and e["M"]["screen"]["rate"] > e["A"]["screen"]["rate"]
            and e["F"]["hand_over_rate"]["point"] > e["A"]["hand_over_rate"]["point"]
            and e["F"]["screen"]["rate"] > e["A"]["screen"]["rate"])


@check("predictions: P3 is refuted because corpus A yields zero real errors")
def _p3():
    e = d("estimates.json")
    return e["M"]["real_arithmetic_errors"] >= 1 and e["A"]["real_arithmetic_errors"] == 0


@check("predictions: P6 holds -- rule misses are 1 in 75 sentences read")
def _p4():
    e = d("estimates.json")
    miss = sum(e[c]["sample"]["rule_misses"] for c in "MAF")
    read = sum(e[c]["sample"]["non_recomputable_read"] for c in "MAF")
    return miss == 1 and read == 75 and 100.0 * miss / read < 15.0


# ---------------------------------------------------------------- apparatus
@check("apparatus: all 45 fixtures pass against the rule as committed")
def _x1():
    sys.path.insert(0, TOOLS)
    import run_fixtures                                             # noqa: PLC0415
    n, failures = run_fixtures.run(verbose=False)
    return n == 45 and not failures


@check("apparatus: every recorded mutation anchor was unique, so none corrupted nothing")
def _x2():
    a = d("apparatus.json")
    return a["anchors_not_unique"] == [] and a["baseline_all_fixtures_pass"] is True


@check("apparatus: 20 mutations, exactly one survived, and it is the asterisk line")
def _x3():
    a = d("apparatus.json")
    return a["mutations"] == 20 and a["mutations_survived"] == ["M13 markdown emphasis kept"]


@check("apparatus: the recorded digest of handover.py matches the file on disk")
def _x4():
    a = d("apparatus.json")
    got = hashlib.sha256(open(os.path.join(TOOLS, "handover.py"), "rb").read()).hexdigest()
    return got == a["files"]["handover.py"]


@check("apparatus: the recorded digest of the fixtures matches the file on disk")
def _x5():
    a = d("apparatus.json")
    got = hashlib.sha256(open(os.path.join(TOOLS, "fixtures.json"), "rb").read()).hexdigest()
    return got == a["files"]["fixtures.json"]


# ---------------------------------------------------------------- robustness
@check("robustness: the surviving mutation changes exactly one document in 2030")
def _r1():
    r = d("robustness.json")["asterisk_stripping"]
    return r["documents_differing"] == 1 and r["documents_identical"] == 2029


@check("robustness: 794 of the 1000 medical abstracts arrive carrying HTML entities")
def _r2():
    r = d("robustness.json")["M"]
    return r["documents_carrying_html_entities"] == 794


@check("robustness: decoding the source's entities moves the screen rate by under half a point")
def _r3():
    r = d("robustness.json")["M"]
    return 0 < r["screen_rate_as_fetched"] - r["screen_rate_decoded"] < 0.5


@check("robustness: corpus A carries no HTML entities and is unmoved by decoding")
def _r4():
    r = d("robustness.json")["A"]
    return (r["documents_carrying_html_entities"] == 0
            and r["recomputable_as_fetched"] == r["recomputable_decoded"])


# ---------------------------------------------------------------- sources
@check("sources: both load-bearing sources carry a read date and at least one quotation")
def _q1():
    s = d("sources.json")["sources"]
    return len(s) == 2 and all(x["read_on"] and x["quotes"] and x["caveat"] for x in s)


@check("sources: the access results of this session are recorded, arXiv included")
def _q2():
    a = d("sources.json")["access_results_of_this_session"]
    return "arxiv_api" in a and "429" in a["arxiv_api"] and "openalex" in a


# ---------------------------------------------------------------- the page
@check("render: six real-browser renders, no horizontal overflow at any width")
def _n1():
    r = d("render-check.json")["widths"]
    return len(r) == 6 and not any(x["horizontal_overflow"] for x in r)


@check("render: zero controls, zero console errors and zero network requests in every render")
def _n2():
    r = d("render-check.json")["widths"]
    return all(x["interactive_controls"] == 0 and x["console_errors"] == 0
               and x["network_requests"] == 0 for x in r)


@check("render: the page is character-identical with scripting on and off")
def _n3():
    r = d("render-check.json")["widths"]
    on = {x["text_chars"] for x in r if x["javascript"]}
    off = {x["text_chars"] for x in r if not x["javascript"]}
    rows = {x["table_rows"] for x in r}
    return len(on) == len(off) == len(rows) == 1 and on == off


@check("self: the post-hoc run on this session's summary reproduces from the file on disk")
def _f1():
    import importlib.util                                           # noqa: PLC0415
    spec = importlib.util.spec_from_file_location("h", os.path.join(TOOLS, "handover.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    txt = open(os.path.join(HERE, "SUMMARY.md"), encoding="utf-8").read()
    toks = mod.analyse(txt)
    rec = [t for t in toks if t["verdict"] != "not_recomputable"]
    s = d("self.json")
    return (s["tokens"] == len(toks) and s["recomputable"] == len(rec)
            and abs(s["rate"] - round(100.0 * len(rec) / len(toks), 2)) < 1e-9
            and len(s["flagged"]) == sum(1 for t in rec if t["verdict"] != "consistent"))


@check("self: this session's own summary hands over more than any corpus it measured")
def _f2():
    s, e = d("self.json"), d("estimates.json")
    return all(s["rate"] > e[c]["hand_over_rate"]["point"] for c in "MAF")


@check("page: every headline figure on the page is one that data/ produces")
def _g1():
    h, e = page(), d("estimates.json")
    for c in "MAF":
        for v in (e[c]["hand_over_rate"]["point"], e[c]["hand_over_rate"]["low"],
                  e[c]["hand_over_rate"]["high"], e[c]["screen"]["rate"]):
            if f"{v:.2f}" not in h:
                return False
    return True


@check("page: the six real errors are each quoted on the page with their fraction")
def _g2():
    h, a = page(), d("adjudication.json")
    return all(f"{r['pair'][0]:,}/{r['pair'][1]:,}" in h
               for r in a["M"] if r["verdict"] == "real")


@check("page: no JavaScript and no external resource is referenced")
def _g3():
    h = page()
    return "<script" not in h.lower() and not re.findall(r'(?:src|href)="https?://', h)


@check("page: the page states the corpus digests it was built from")
def _g4():
    h, m = page(), d("corpora.json")
    return all(m[c]["corpus_digest"][:16] in h for c in "MAF")


@check("page: the refuted prediction is named as refuted on the page")
def _g5():
    h = page()
    return "REFUTED" in h and "refutes our own prediction" in h


def main():
    quiet = "--quiet" in sys.argv
    src = open(os.path.abspath(__file__), encoding="utf-8").read()
    declared = len(re.findall(r"^@check\(", src, re.M))
    if declared != len(CHECKS):
        print(f"SUITE BROKEN: {declared} @check decorators in the source, "
              f"{len(CHECKS)} registered. Some checks never ran.")
        return 2
    failed = []
    for name, fn in CHECKS:
        try:
            ok, err = bool(fn()), None
        except Exception as exc:                                     # noqa: BLE001
            ok, err = False, f"{type(exc).__name__}: {exc}"
        if not ok:
            failed.append((name, err))
            if not quiet:
                print(f"  FAIL  {name}" + (f"  [{err}]" if err else ""))
    print(f"{len(CHECKS)} checks registered, {len(CHECKS)} run, {len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
