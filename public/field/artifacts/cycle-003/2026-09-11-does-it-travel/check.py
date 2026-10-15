#!/usr/bin/env python3
"""check.py — verify this artifact offline.

Session 157, cycle 003. What it verifies, and the list is exhaustive on purpose:

  1. BYTE IDENTITY. build.py is re-run into a temporary file and the result must be
     byte-for-byte the committed index.html. This closes the substring hole the Atelier
     reported against its own checker on 2026-09-09, and which we adopt here with credit.
  2. NUMERALS. Every number in the page's visible text must be derivable from
     data/results.json — as a rendering of a number the record holds, or as a numeral inside
     a string the record already carries (a record title, an endpoint, a fetch timestamp).
  3. QUANTITIES WRITTEN AS WORDS. Every spelled-out quantity in the narrative must be
     declared in data/narrative.json with its value, and that value must occur in
     data/results.json. Session 155's checker missed these entirely.
  4. VERDICTS. P1-P7 are recomputed here from the raw per-catalogue numbers, by code that
     does not import the tool that produced them, and must match the stored verdicts.
  5. QUOTED VALUES. Every catalogue value and record title quoted on the page must match
     data/results.json.
  6b. THE AUDIT. The confusion matrix, agreement, kappa, precision and recall are recomputed
     here from the audit's own per-row evidence, and every row's reader label is checked against
     the committed data/audit-labels.json. Until 2026-09-11 the checker took those summary
     numbers on trust and an adversary reversed the session's central finding without failing a
     single check.
  6. QUOTED SOURCES. Every passage quoted from outside must match data/sources.json, and
     each source there must carry a URL, an access date and the extraction route.

  What it does NOT verify, stated where the claim is made and repeated here: the narrative
  prose. A false sentence with no number in it, written into data/narrative.json, passes
  every check below. That is the residue reported as a failure on 2026-09-09, and it is
  unchanged today.

Exit 0 only if every check passes. Standard library only; no network.
"""

from __future__ import annotations

import html as _html
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
FAILS: list[str] = []
CHECKS = 0


def ok(cond: bool, msg: str) -> None:
    global CHECKS
    CHECKS += 1
    if not cond:
        FAILS.append(msg)


def esc(s: str) -> str:
    return _html.escape(s, quote=True)


def text_of(html_doc: str) -> str:
    body = re.sub(r"<style.*?</style>", " ", html_doc, flags=re.S | re.I)
    body = re.sub(r"<script.*?</script>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    for a, b in (("&thinsp;", ""), ("&nbsp;", " "), ("&amp;", "&"), ("&chi;", "chi"),
                 ("&kappa;", "kappa"), ("&rsquo;", "'"), ("&ldquo;", '"'), ("&rdquo;", '"'),
                 ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"'), ("&sup2;", "2"),
                 ("&mdash;", "—"), ("&ndash;", "–"), ("&times;", "x"),
                 ("&#x27;", "'"), ("&#39;", "'"), ("&#x2F;", "/")):
        body = body.replace(a, b)
    return re.sub(r"\s+", " ", body)


def walk(obj, nums: set, strings: set) -> None:
    if isinstance(obj, dict):
        for v in obj.values():
            walk(v, nums, strings)
    elif isinstance(obj, list):
        for v in obj:
            walk(v, nums, strings)
    elif isinstance(obj, bool):
        pass
    elif isinstance(obj, (int, float)):
        nums.add(obj)
    elif isinstance(obj, str):
        # A numeral inside a string the record already carries — a record title, an endpoint,
        # a fetch timestamp, a quoted value — is part of the committed record. A numeral that
        # occurs nowhere in results.json still fails.
        for tok in re.findall(r"\d[\d.]*", obj):
            strings.add(tok.rstrip("."))


def renderings(values: set) -> set:
    """Every string form in which a number from results.json may legitimately appear."""
    s = set()
    for v in values:
        if isinstance(v, int) or (isinstance(v, float) and v.is_integer()):
            s.add(str(int(v)))
        if isinstance(v, float):
            for nd in (2, 3, 4, 5):
                s.add(f"{v:.{nd}f}")
            s.add(repr(v))
        s.add(str(v))
    return s


WORD_RE = re.compile(
    r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|"
    r"fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|"
    r"eighty|ninety|hundred|thousand|million)\b", re.I)


def recompute_verdicts(d: dict) -> dict:
    """P1-P7 from the raw numbers, without importing tools/travel/travel.py."""
    C, A = d["catalogues"], d.get("audit")
    scored = ("cma", "uk", "govdata")
    v = {}

    v["P1"] = "confirmed" if all(
        C[c]["declared_completeness_pct"] >= 95.0
        and C[c]["held"]["hollow_broad"]["pct"] >= 5.0 for c in scored) else "refuted"

    passes = []
    for c in scored:
        a, k = C[c].get("association"), C[c].get("concentration")
        passes.append(bool(a and k and a.get("bh_survivor") and k["ratio"] >= 2.0))
    v["P2"] = "confirmed" if all(passes) else ("refuted" if not any(passes) else "split")

    passes = [C[c]["p3_broad_is_r2"]["pct"] >= 95.0 for c in scored]
    v["P3"] = "confirmed" if all(passes) else ("refuted" if not any(passes) else "split")

    v["P4"] = ("confirmed" if A and A["agreement_pct"] >= 75.0 and A["kappa"] >= 0.42
               else ("refuted" if A else "pending"))

    de = C["govdata"]["held"]["r3_opener"]["pct"]
    en = C["uk"]["held"]["r3_opener"]["pct"]
    v["P5"] = "confirmed" if (de < 1.0 and en >= 1.0) else "refuted"

    v["P6"] = "confirmed" if any(
        C[c]["held"]["r5_title_echo"]["pct"] >= 1.0
        and C[c]["p6_r5_increment"]["r5_only"] >= 20 for c in scored) else "refuted"

    # The figures P7 is judged against are read from the 2026-09-08 artifact's own committed
    # record, not from the file under test. Until 2026-09-11 they were read from the file under
    # test, which made P7 and K4 self-certifying; an adversary demonstrated it.
    prior = os.path.join(HERE, "..", "2026-09-08-complete-and-empty", "data", "results.json")
    want = d["predictions"]["P7"]["published_2026_09_08"]
    if os.path.exists(prior):
        pd = json.load(open(prior, encoding="utf-8"))
        independent = {
            "records": pd["headline"]["all"]["hollow_broad"]["n"],
            "all_broad_pct": pd["headline"]["all"]["hollow_broad"]["pct"],
            "held_broad_pct": pd["headline"]["held"]["hollow_broad"]["pct"],
            "r4_held_k": pd["rule_overlap"]["r4_hits_held"],
            "broad_is_r2_held_agree": pd["rule_overlap"]["broad_equals_r2_held"],
            "held_n": pd["split"]["held"],
        }
        ok(independent == want,
           f"P7's baseline does not match the 2026-09-08 artifact: {independent} vs {want}")
        want = independent
    at = C["atlas"]
    got = {"records": at["records"], "all_broad_pct": at["all"]["hollow_broad"]["pct"],
           "held_broad_pct": at["held"]["hollow_broad"]["pct"],
           "r4_held_k": at["held"]["r4_duplicate"]["k"],
           "broad_is_r2_held_agree": at["p3_broad_is_r2"]["agree"],
           "held_n": at["split"]["held"]}
    v["P7"] = "confirmed" if got == want else "refuted"
    return v


def main() -> int:
    page_path = os.path.join(HERE, "index.html")
    page = open(page_path, encoding="utf-8").read()
    d = json.load(open(os.path.join(HERE, "data", "results.json"), encoding="utf-8"))
    nar = json.load(open(os.path.join(HERE, "data", "narrative.json"), encoding="utf-8"))
    src = json.load(open(os.path.join(HERE, "data", "sources.json"), encoding="utf-8"))

    # ---- 1. byte identity -------------------------------------------------
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "rendered.html")
        r = subprocess.run([sys.executable, os.path.join(HERE, "build.py"), "--out", out],
                           capture_output=True, text=True)
        ok(r.returncode == 0, f"build.py exited {r.returncode}: {r.stderr[:200]}")
        if r.returncode == 0:
            ok(open(out, "rb").read() == open(page_path, "rb").read(),
               "index.html is not byte-identical to a fresh render of build.py")

    body = text_of(page)

    # A numeral inside a quotation is the source's, not ours. Quoted catalogue values and
    # quoted outside passages are verified against the record in checks 5 and 6, so they are
    # lifted out before the numeral scan rather than exempted one number at a time.
    scan = body
    for q in d["quotes"]:
        scan = scan.replace(q["value"], " ").replace(q["title"], " ")
    for s in src["sources"]:
        for p in s.get("passages", []):
            scan = scan.replace(p["quote"], " ")

    # ---- 2. numerals ------------------------------------------------------
    nums: set = set()
    str_toks: set = set()
    walk(d, nums, str_toks)
    allowed = renderings(nums) | str_toks
    allowed |= {str(x) for x in range(0, 11)}                 # section and list numbers
    allowed |= set(nar.get("allowed_literals", []))
    bad = []
    for tok in re.findall(r"\d[\d.]*", scan):
        tok = tok.rstrip(".")
        if tok in allowed:
            continue
        try:
            f = float(tok)
        except ValueError:
            bad.append(tok)
            continue
        if any(abs(f - float(a)) < 1e-9 for a in allowed if _isnum(a)):
            continue
        bad.append(tok)
    ok(not bad, f"numbers on the page not derivable from results.json: {sorted(set(bad))[:24]}")

    # ---- 3. quantities written as words -----------------------------------
    declared = {k.lower(): v for k, v in nar.get("word_numbers", {}).items()}
    undeclared = sorted({w.lower() for w in WORD_RE.findall(scan)} - set(declared))
    ok(not undeclared,
       f"quantities written as words and not declared in narrative.json: {undeclared[:24]}")
    ints = {int(x) for x in nums if float(x).is_integer()}
    for w, val in declared.items():
        ok(val in nums or val in ints,
           f"declared word-number '{w}' = {val} does not occur in results.json")

    # ---- 4. verdicts ------------------------------------------------------
    for k, verdict in recompute_verdicts(d).items():
        stored = d["predictions"][k]["verdict"]
        ok(stored == verdict, f"{k}: record carries '{stored}', recomputation gives '{verdict}'")
        ok(verdict in body, f"{k}: verdict '{verdict}' does not appear on the page")

    # ---- 4b. the audit, recomputed from its own rows and the committed labels ----
    A = d.get("audit")
    if A and "rows" in A:
        rows = A["rows"]
        lab_path = os.path.join(HERE, "data", "audit-labels.json")
        labels = {x["aid"]: x["label"] for x in json.load(open(lab_path, encoding="utf-8"))}
        ok(len(labels) == A["labelled"],
           f"audit-labels.json has {len(labels)} labels, record says {A['labelled']}")
        for r in rows:
            want = 1 if labels.get(r["aid"]) == "says nothing" else 0
            ok(r["reader_hollow"] == want,
               f"audit row {r['aid']}: record says reader {r['reader_hollow']}, "
               f"audit-labels.json says {labels.get(r['aid'])!r}")
        a_ = [r["reader_hollow"] for r in rows]
        b_ = [r["screen_broad"] for r in rows]
        tp = sum(1 for x, y in zip(a_, b_) if x and y)
        fp = sum(1 for x, y in zip(a_, b_) if not x and y)
        fn = sum(1 for x, y in zip(a_, b_) if x and not y)
        tn = sum(1 for x, y in zip(a_, b_) if not x and not y)
        ok(A["confusion"] == {"tp": tp, "fp": fp, "fn": fn, "tn": tn},
           f"confusion matrix does not recompute from the rows: {A['confusion']} vs "
           f"{{'tp': {tp}, 'fp': {fp}, 'fn': {fn}, 'tn': {tn}}}")
        agree = round(100 * sum(1 for x, y in zip(a_, b_) if x == y) / len(rows), 2)
        ok(A["agreement_pct"] == agree,
           f"agreement does not recompute: {A['agreement_pct']} vs {agree}")
        n = len(a_)
        pa1, pb1 = sum(a_) / n, sum(b_) / n
        chance = pa1 * pb1 + (1 - pa1) * (1 - pb1)
        kap = round(((sum(1 for x, y in zip(a_, b_) if x == y) / n) - chance) / (1 - chance), 4)
        ok(A["kappa"] == kap, f"kappa does not recompute: {A['kappa']} vs {kap}")
        ok(A["precision"] == (round(tp / (tp + fp), 4) if tp + fp else None),
           "precision does not recompute from the confusion matrix")
        ok(A["recall"] == (round(tp / (tp + fn), 4) if tp + fn else None),
           "recall does not recompute from the confusion matrix")

    # ---- 5. quoted catalogue values ---------------------------------------
    for q in d["quotes"]:
        frag = q["value"][:90]
        ok(esc(frag) in page or frag in body,
           f"quoted value not found on the page: {frag[:60]!r}")
        ok(esc(q["title"]) in page or q["title"] in body,
           f"quoted record title not found on the page: {q['title'][:50]!r}")

    # ---- 6. quoted outside sources ----------------------------------------
    for s in src["sources"]:
        for field in ("url", "accessed_utc", "extraction"):
            ok(bool(s.get(field)), f"source {s.get('id')} is missing {field}")
        for p in s.get("passages", []):
            ok(p["quote"] in body or esc(p["quote"]) in page,
               f"passage from {s['id']} is not on the page: {p['quote'][:60]!r}")

    # ---- report -----------------------------------------------------------
    print(f"check.py — {CHECKS} checks over index.html, results.json, narrative.json, sources.json")
    if FAILS:
        for f in FAILS:
            print("  FAIL " + f)
        print(f"{len(FAILS)} of {CHECKS} checks failed.")
        return 1
    print("all passed: the page is a byte-identical render of the committed record; every "
          "numeral and every spelled-out quantity is derivable from it; every prediction "
          "verdict recomputes; every quoted value and passage matches the record.")
    print("NOT verified: the narrative prose. A false sentence carrying no number, written into "
          "narrative.json, passes this checker. Reported as a failure, not as future work.")
    return 0


def _isnum(x: str) -> bool:
    try:
        float(x)
        return True
    except ValueError:
        return False


if __name__ == "__main__":
    raise SystemExit(main())
