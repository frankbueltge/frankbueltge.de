#!/usr/bin/env python3
"""Offline, no network. Re-derives every number in data.json by a second method,
written from the mathematical definitions directly rather than from build.py's closed
form: exhaustive search over exact fractions for the tie families, and a fresh read of
session 11's own committed page for the 69-record recheck. Exits non-zero on any
mismatch."""
import json
import re
import sys
from fractions import Fraction
from math import gcd
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent

failures = []
total = 0


def ok(cond, msg):
    global total
    total += 1
    if not cond:
        failures.append(msg)


def brute_force_tie_family(scale, bound):
    """Every reduced denominator n <= bound for which SOME coprime k (0<k<n) makes
    scale*k/n land on an exact half. No use of the 2/5 factorisation at all: scale*k/n
    has fractional part exactly 1/2 iff n is even and (scale*k) mod n equals n//2 —
    plain integer remainder, the definition of "exact half" and nothing more."""
    fam = []
    for n in range(2, bound + 1, 2):
        half = n // 2
        hit = any(gcd(k, n) == 1 and (scale * k) % n == half for k in range(1, n))
        if hit:
            fam.append(n)
    return fam


def main():
    data = json.loads((HERE / "data.json").read_text(encoding="utf-8"))

    # ---- 1. the three declared cases, each re-derived by brute force -------------
    for c in data["cases"]:
        bf = brute_force_tie_family(c["scale_M_times_10^d"], c["bound"])
        ok(bf == c["tie_family"],
           f"case {c['label']!r}: brute force gives {bf}, file says {c['tie_family']}")

    # ---- 2. the Studio's own four numbers, from the law alone, no copying --------
    bf_studio = brute_force_tie_family(1000, 2000)
    ok(bf_studio == [16, 80, 400, 2000],
       f"Studio family: brute force gives {bf_studio}, expected [16, 80, 400, 2000]")
    ok(data["studio_claim"]["independently_derived_family"] == bf_studio,
       "Studio family: file's own figure does not match a fresh brute force")
    ok(data["studio_claim"]["matches_quote"] is True,
       "Studio family: file claims a mismatch with the quoted sentence")

    # ---- 3. this practice's own case: family for scale 1 is exactly {2} ----------
    bf_own = brute_force_tie_family(1, 2000)
    ok(bf_own == [2], f"own case: brute force gives {bf_own}, expected [2]")
    ok(data["own_case"]["family_for_this_scale"] == bf_own,
       "own case: file's family does not match a fresh brute force")

    # ---- 4. session 11's page, read again, independently of build.py's copy -----
    s11 = (REPO / "window" / "cycle-003-session-11" / "index.html").read_text(encoding="utf-8")
    ws = [int(m) for m in re.findall(r'data-w="(\d+)"', s11)]
    ok(len(ws) == data["own_case"]["records"], "record count changed since data.json was built")
    ok(ws == [r["w"] for r in data["rows"]], "the word counts themselves changed")

    def python_half(w):
        return f"{w / 2:.0f}"

    def js_half(w):
        return str(w // 2 + 1) if w % 2 else str(w // 2)

    rows2 = [{"w": w, "python": python_half(w), "javascript": js_half(w)} for w in ws]
    ok(rows2 == data["rows"], "recomputed rows do not match data.json's rows")

    differ2 = [r for r in rows2 if r["python"] != r["javascript"]]
    ok(len(differ2) == data["own_case"]["records_that_differ"],
       f"differ count: recomputed {len(differ2)}, file says "
       f"{data['own_case']['records_that_differ']}")
    ok(len(differ2) == 23, f"differ count is {len(differ2)}, not the published 23")

    odd2 = [r for r in rows2 if r["w"] % 2 == 1]
    ok(len(odd2) == data["own_case"]["records_with_odd_w"],
       "odd-word-count count does not match data.json")
    ok(len(odd2) == 34, f"odd count is {len(odd2)}, not the published 34")

    # every differing row must have an odd w with an even floor(w/2) — the law's own
    # "half the ties" clause, checked row by row rather than assumed
    for r in differ2:
        w = r["w"]
        ok(w % 2 == 1, f"a differing row has even w={w}")
        ok((w // 2) % 2 == 0, f"a differing row's floor {w // 2} is odd, against the law")
    for r in rows2:
        if r["w"] % 2 == 1 and r not in differ2:
            ok((r["w"] // 2) % 2 == 1,
               f"an odd-w row that agrees has an even floor: w={r['w']}")

    # ---- 5. the reduced denominators actually present in this corpus's computation
    present = sorted({2 if w % 2 == 1 else 1 for w in ws})
    ok(present == data["own_case"]["reduced_denominators_present"],
       "the set of reduced denominators present does not match data.json")
    ok(set(present) & set(data["studio_claim"]["independently_derived_family"]) == set(),
       "a Studio denominator (16/80/400/2000) actually occurs in this corpus's "
       "own halving — the claim that they cannot should have failed loudly")

    # ---- 6. the corpus scan: the one page flagged True must be session 11, and
    # only that one ------------------------------------------------------------
    flagged = [c["dir"] for c in data["corpus_scan"] if c["carries_the_defect"]]
    ok(flagged == ["window/cycle-003-session-11"],
       f"exactly one page should carry the defect (session 11); got {flagged}")
    ok(len(data["corpus_scan"]) == 5, "corpus scan should record all five entries checked")

    # ---- 7. the page itself: no script, and every load-bearing figure printed ----
    html = (HERE / "index.html").read_text(encoding="utf-8")
    ok("<script" not in html.lower(), "the page must carry no script element at all")
    ok(" onclick" not in html.lower() and "onchange" not in html.lower(),
       "the page must carry no inline event handler")
    for n in data["studio_claim"]["independently_derived_family"]:
        ok(str(n) in html, f"the Studio denominator {n} must be printed on the page")
    ok(str(data["own_case"]["only_reachable_member"]) in html,
       "this practice's own denominator (2) must be printed on the page")
    ok(str(data["own_case"]["records_that_differ"]) in html,
       "the differ count must be printed on the page")
    ok(str(data["own_case"]["records_with_odd_w"]) in html,
       "the odd-count total must be printed on the page")
    for c in data["corpus_scan"]:
        ok(c["dir"] in html, f"the scanned page {c['dir']!r} must be listed on the page")
    ok(data["studio_claim"]["quote"] in html, "the Studio's quoted sentence must appear verbatim")

    if failures:
        print(f"FAILED {len(failures)} of {total} check(s):")
        for f in failures:
            print(" -", f)
        sys.exit(1)
    print(f"all checks passed ({total} individual assertions)")


if __name__ == "__main__":
    main()
