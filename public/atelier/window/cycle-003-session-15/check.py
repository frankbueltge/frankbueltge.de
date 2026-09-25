#!/usr/bin/env python3
"""Second method. build.py works in exact fractions and a closed form; this file works in
decimal strings and exhaustive integer search, and reads build.py's output only to
compare against it. Exits non-zero on the first category of failure, after listing all."""
import hashlib
import json
import re
import sys
from decimal import Decimal, ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, getcontext
from pathlib import Path

getcontext().prec = 60
HERE = Path(__file__).resolve().parent
D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
U = json.loads((HERE / "field-units.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")

n_checks = 0
fails = []


def ok(cond, what):
    global n_checks
    n_checks += 1
    if not cond:
        fails.append(what)


def as_string(k, n, places, mode):
    v = Decimal(100 * k) / Decimal(n)
    q = Decimal(1).scaleb(-places)
    return str(v.quantize(q, rounding=mode))


# 1. The 41 units, by decimal strings.
ok(len(U["units"]) == 41, "41 units in field-units.json")
ok(U["source_sha256"] == "4a65d6686f65c6c0808f174c2c3c74e301c1c2e243f96b54955333197e37932a",
   "source digest recorded")
rowmap = {r["s"]: r for r in D["rows"]}
ok(len(rowmap) == 41, "41 rows in data.json")
trunc_only, up_only, both, neither, differ = [], [], [], [], []
for u in U["units"]:
    printed = u["printed"].rstrip("%")
    places = len(printed.split(".")[1]) if "." in printed else 0
    up = as_string(u["k"], u["n"], places, ROUND_HALF_UP)
    tr = as_string(u["k"], u["n"], places, ROUND_DOWN)
    ev = as_string(u["k"], u["n"], places, ROUND_HALF_EVEN)
    m_up, m_tr, m_ev = up == printed, tr == printed, ev == printed
    r = rowmap.get(u["s"], {})
    ok(r.get("matches_half_up") == m_up, f"unit {u['s']}: half-up match")
    ok(r.get("matches_trunc") == m_tr, f"unit {u['s']}: truncation match")
    ok(r.get("matches_half_even") == m_ev, f"unit {u['s']}: half-even match")
    ok(r.get("rules_can_differ") == (up != tr), f"unit {u['s']}: rules-can-differ")
    ok(r.get("k") == u["k"] and r.get("n") == u["n"], f"unit {u['s']}: k and n carried")
    if up != tr:
        differ.append(u["s"])
    if m_tr and not m_up:
        trunc_only.append(u["s"])
    elif m_up and not m_tr:
        up_only.append(u["s"])
    elif m_up and m_tr:
        both.append(u["s"])
    else:
        neither.append(u["s"])
    # admitted numerators, by strings
    a_up = sum(1 for kk in range(u["n"] + 1) if as_string(kk, u["n"], places, ROUND_HALF_UP) == printed)
    a_ei = sum(1 for kk in range(u["n"] + 1)
               if as_string(kk, u["n"], places, ROUND_HALF_UP) == printed
               or as_string(kk, u["n"], places, ROUND_DOWN) == printed)
    ok(r.get("admitted_k_half_up") == a_up, f"unit {u['s']}: admitted by rounding")
    ok(r.get("admitted_k_either") == a_ei, f"unit {u['s']}: admitted by either")

S = D["summary"]
ok(trunc_only == [70, 80], "the Field's two truncation-only units are 70 and 80")
ok(S["trunc_only"] == trunc_only, "summary truncation-only")
ok(S["rules_can_differ"] == len(differ) == 19, "19 units where the rules print differently")
ok(S["half_up_among_those"] == len([s for s in up_only if s in differ]) == 16, "16 rounded among them")
ok(S["matched_neither"] == neither == [92], "one unit matches neither: 92")
ok(S["exact"] + S["below_half"] == 41 - len(differ) == 22, "22 units where the rules agree")
ok(S["admitted_k_half_up_total"] == 119 and S["admitted_k_either_total"] == 163, "119 and 163 admitted")
ok(S["consistent_under_half_up_alone"] == 38 and S["inconsistent_under_half_up_alone"] == 3,
   "38 consistent, 3 inconsistent under rounding alone")
ok(S["half_even_differs_from_half_up_on"] == [], "no unit changes verdict under half-even")
big = [u for u in U["units"] if u["n"] > 500]
ok(S["units_n_over_500"] == len(big) == 6, "six units with n above 500")
ok(S["extra_on_n_over_500"] == sum(rowmap[u["s"]]["admitted_k_either"] - rowmap[u["s"]]["admitted_k_half_up"] for u in big) == 39,
   "39 of the 44 extra numerators on those six")


# 2. The law, by exhaustive search over every n up to 2000 (no closed form used).
def brute(Sc, n):
    diff = 0
    for k in range(n):
        whole, rem = divmod(Sc * k, n)
        if 2 * rem >= n:  # remainder at or above half: half-up rounds up, truncation does not
            diff += 1
    return diff


for case in D["cases"]:
    Sc = case["S"]
    never = []
    total = 0
    for n in range(1, 2001):
        c = brute(Sc, n)
        total += c * 1  # numerators out of n
        if c == 0:
            never.append(n)
    ok(never == case["truncation_never_matters_at"], f"S={Sc}: denominators where truncation never matters")
    ok(all(Sc % n == 0 for n in never), f"S={Sc}: every such n divides S")
    # mean share, from the brute counts
    mean = sum(Decimal(brute(Sc, n)) / Decimal(n) for n in range(1, 2001)) / Decimal(2000)
    ok(f"{float(mean):.4f}" == case["mean_share_decimal"], f"S={Sc}: mean share {case['mean_share_decimal']}")
    # ties, by search: some k with 2*S*k == odd multiple of n, gcd-reduced
    from math import gcd
    ties = sorted({n // gcd(n, k) for n in range(1, 2001) for k in range(1, n)
                   if (2 * Sc * k) % n == 0 and ((2 * Sc * k) // n) % 2 == 1 and gcd(n, k) == 1})
    ok(ties == case["tie_denominators"], f"S={Sc}: tie denominators match session 14's law")
ok(D["cases"][1]["tie_denominators"] == [16, 80, 400, 2000], "one-decimal ties are the Studio's four")
ok(len(D["cases"][1]["truncation_never_matters_at"]) == 16, "one-decimal: truncation never matters at 16 n")

# 3. The page carries the figures and no script.
text = re.sub(r"<[^>]+>", " ", PAGE)
ok("<script" not in PAGE.lower(), "no script element")
ok(not re.search(r"\son[a-z]+=", PAGE), "no inline event handler")
ok(not re.search(r"(src|href)=\"https?:", PAGE), "no outside fetch")
for needle in ["2 of its 41", "not out of 41", "rounded 16 times and truncated 2", "37.0 %",
               "admits 119", "either rule admits 163", "fall from 40 to 38", "becomes 3",
               "units 70 and 80", "Twice in eighteen"]:
    ok(needle in text or needle in PAGE, f"page says: {needle}")
ok(PAGE.count('<circle class="d ') == 41, "41 dots in the figure")
ok(PAGE.count('class="d trunc"') == 2, "two truncation dots")
ok(PAGE.count("<tr class=") == 41, "41 table rows")

# 4. Provenance recorded.
src = json.loads((HERE / "sources.json").read_text(encoding="utf-8"))
ok(any(f.get("sha256") == U["source_sha256"] for f in src.get("fetched", [])), "sources.json records the digest")

print(f"{n_checks} checks, {len(fails)} failed")
for f in fails:
    print("  FAIL", f)
sys.exit(1 if fails else 0)
