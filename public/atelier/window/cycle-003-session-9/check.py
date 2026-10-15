#!/usr/bin/env python3
"""check.py — the checks for session 9, independent of the build.

Nothing here imports `build.py`. The three nights' `cells.json` files are read directly, every
figure in `data.json` is re-derived from them by a second implementation, and then every figure
that the page states is read back out of the rendered HTML. A check that only re-ran the build's
own functions would agree with the build about a mistake, which is the failure this file exists
to prevent.

    python3 window/cycle-003-session-9/check.py

No network. Exit 0 if every check passes, 1 otherwise; the count is printed either way.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import hashlib
import itertools
import json
import pathlib
import re
import sys
from collections import Counter
from fractions import Fraction

HERE = pathlib.Path(__file__).resolve().parent
NIGHTS = ["2026-09-15", "2026-09-16", "2026-09-18"]
FILES = {
    "2026-09-15": HERE.parent / "cycle-003-session-7" / "cells.json",
    "2026-09-16": HERE.parent / "cycle-003-session-8" / "cells.json",
    "2026-09-18": HERE / "cells.json",
}
FIRST = HERE.parent / "cycle-003-session-6" / "cells.json"
KEYS = ["atlas", "papers", "datasets"]
READINGS = ["all", "birth", "edge"]

PASS = 0
FAIL: list[str] = []


def ok(cond: bool, what: str) -> bool:
    global PASS
    if cond:
        PASS += 1
    else:
        FAIL.append(what)
    return bool(cond)


def eq(a, b, what: str) -> bool:
    return ok(a == b, f"{what}: {a!r} != {b!r}")


# ---------------------------------------------------------------- inputs

C = {n: json.loads(FILES[n].read_text(encoding="utf-8")) for n in NIGHTS}
C14 = json.loads(FIRST.read_text(encoding="utf-8"))
D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")


def feed(cells: dict, key: str) -> dict:
    return next(f for f in cells["feeds"] if f["key"] == key)


def rows(cells: dict, key: str) -> list[dict]:
    return feed(cells, key)["rows"]


def kset(cells: dict, key: str) -> set[str]:
    return {r["k"] for r in rows(cells, key)}


# ---------------------------------------------------------------- 1. the measurement is well formed

eq(D["date"], "2026-09-18", "the page's date")
eq(D["nights"], NIGHTS, "the three nights")
eq(D["missed"], "2026-09-17", "the night nobody looked")
eq(len(C["2026-09-18"]["feeds"]), 3, "three feeds measured")

for key in KEYS:
    f = feed(C["2026-09-18"], key)
    schema = set(f["schema"])
    eq(f["n"], len(f["rows"]), f"{key}: n equals the number of rows")
    eq(f["n"], f["declared_count"], f"{key}: the feed's own count equals what was read")
    ok(len(f["sha256"]) == 64, f"{key}: the bytes read are hashed")
    ok(all(re.fullmatch(r"[0-9a-f]{16}", r["k"]) for r in f["rows"]),
       f"{key}: every identity is sixteen hex characters")
    ok(all(re.fullmatch(r"[0-9a-f]{16}", r["w"]) for r in f["rows"]),
       f"{key}: every wide digest is sixteen hex characters")
    ok(all(set(r["miss"]) <= schema for r in f["rows"]),
       f"{key}: no empty cell outside the declared schema")
    ok(all(r["host"] in {"arxiv", "doi", "other", "none"} for r in f["rows"]),
       f"{key}: every host class is one of the four")
    ok(all(len(set(r["miss"])) == len(r["miss"]) for r in f["rows"]),
       f"{key}: no column is listed empty twice in one row")
    # nothing of the feed's content may be in the committed measurement
    ok(not any(isinstance(v, str) and len(v) > 64 for r in f["rows"] for v in r.values()
               if not isinstance(v, list)),
       f"{key}: no long string survived into the measurement")
    st = json.dumps(f["rows"])
    ok("http" not in st, f"{key}: no address survived into the rows")

for night in NIGHTS:
    for key in KEYS:
        eq(feed(C[night], key)["url"], feed(C["2026-09-18"], key)["url"],
           f"{key}: the same address was read on {night}")
        eq(feed(C[night], key)["schema"], feed(C["2026-09-18"], key)["schema"],
           f"{key}: the same schema was applied on {night}")

eq(D["prior_sha256"], hashlib.sha256(FILES["2026-09-16"].read_bytes()).hexdigest(),
   "the 09-16 file is the one the page names")
eq(D["prior2_sha256"], hashlib.sha256(FILES["2026-09-15"].read_bytes()).hexdigest(),
   "the 09-15 file is the one the page names")
eq(D["first_sha256"], hashlib.sha256(FIRST.read_bytes()).hexdigest(),
   "the 09-14 file is the one the page names")

# ---------------------------------------------------------------- 2. counts and membership

for key in KEYS:
    eq(D["counts"][key]["2026-09-14"], feed(C14, key)["n"], f"{key}: the count of 09-14")
    for night in NIGHTS:
        eq(D["counts"][key][night], len(rows(C[night], key)), f"{key}: the count of {night}")
    a, b = kset(C["2026-09-16"], key), kset(C["2026-09-18"], key)
    m = D["membership"][key]
    eq(m["survivors"], len(a & b), f"{key}: survivors 09-16 → 09-18")
    eq(m["left"], len(a - b), f"{key}: departures 09-16 → 09-18")
    eq(m["arrived"], len(b - a), f"{key}: arrivals 09-16 → 09-18")
    eq(m["gross"], m["left"] + m["arrived"], f"{key}: the gross is the two terms")
    eq(m["net"], m["now"] - m["was"], f"{key}: the net is the difference of counts")
    ok(m["survivors"] + m["left"] <= m["was"], f"{key}: survivors and departures fit the night")

# ---------------------------------------------------------------- 3. capture histories

sets = {key: [kset(C[n], key) for n in NIGHTS] for key in KEYS}
for key in KEYS:
    counter: Counter = Counter()
    for k in set().union(*sets[key]):
        counter["".join("1" if k in s else "0" for s in sets[key])] += 1
    eq(D["patterns"][key], dict(sorted(counter.items(), reverse=True)),
       f"{key}: the capture histories")
    eq(sum(D["patterns"][key].values()), len(set().union(*sets[key])),
       f"{key}: every record ever seen has exactly one pattern")
    eq(D["returned"][key], D["patterns"][key].get("101", 0), f"{key}: the blink count")
    eq(D["absent_on_16"][key],
       D["patterns"][key].get("101", 0) + D["patterns"][key].get("100", 0),
       f"{key}: records absent at the second look")
    eq(D["seen_once_only_in_the_middle"][key], D["patterns"][key].get("010", 0),
       f"{key}: records seen only in the middle")
    for pat, n in D["patterns"][key].items():
        ok(re.fullmatch(r"[01]{3}", pat) is not None, f"{key}: {pat} is a three-night pattern")
        ok(n > 0, f"{key}: pattern {pat} is not an empty row")
        chosen = [sets[key][i] for i, c in enumerate(pat) if c == "1"]
        rest = [sets[key][i] for i, c in enumerate(pat) if c == "0"]
        got = set.intersection(*chosen) if chosen else set()
        for s in rest:
            got = got - s
        eq(len(got), n, f"{key}: pattern {pat} counted by intersection")

ok("000" not in D["patterns"]["papers"], "no record is counted that was never seen")

# ---------------------------------------------------------------- 4. the cells inside survivors

def by_key(cells: dict, key: str) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    for r in rows(cells, key):
        out.setdefault(r["k"], []).append(r)
    return out


compared = filled = emptied = moved = 0
detail = []
for key in KEYS:
    wm, nm = by_key(C["2026-09-16"], key), by_key(C["2026-09-18"], key)
    for k in sorted(set(wm) & set(nm)):
        if len(wm[k]) != 1 or len(nm[k]) != 1:
            continue
        compared += 1
        a, b = set(wm[k][0]["miss"]), set(nm[k][0]["miss"])
        if a == b:
            continue
        f_, e_ = sorted(a - b), sorted(b - a)
        filled += len(f_)
        emptied += len(e_)
        moved += 1 if (f_ and e_) else 0
        detail.append({"feed": key, "k": k, "filled": f_, "emptied": e_,
                       "wide_changed": wm[k][0]["w"] != nm[k][0]["w"]})

eq(D["repair"]["records_compared"], compared, "records present at both of the last two looks")
eq(D["repair"]["cells_filled"], filled, "cells filled inside a survivor")
eq(D["repair"]["cells_emptied"], emptied, "cells emptied inside a survivor")
eq(D["repair"]["holes_moved"], moved, "holes that changed column")
eq(D["repair"]["changed"], len(detail), "survivors that changed at all")
eq(D["repair"]["detail"], detail, "the change, record by record")
ok(any(d["filled"] and not d["emptied"] for d in detail),
   "the condition session 8 printed: a survivor's empty cell was filled")

com = []
for key in KEYS:
    m15, m16, m18 = (by_key(C[n], key) for n in NIGHTS)
    for k in sorted(set(m15) & set(m16) & set(m18)):
        if any(len(m[k]) != 1 for m in (m15, m16, m18)):
            continue
        a, b, c = (tuple(sorted(m[k][0]["miss"])) for m in (m15, m16, m18))
        if a == c and a != b:
            com.append({"feed": key, "k": k, "at_15_and_18": list(a), "at_16": list(b)})
eq(D["commuting"], com, "the holes that went away and came back")
for c in D["commuting"]:
    ok(c["at_15_and_18"] != c["at_16"], f"{c['k']}: the middle look really differs")

# ---------------------------------------------------------------- 5. the estimator, re-derived

def chao(q1: int, q2: int, m: int, corrected: bool) -> Fraction:
    factor = Fraction(m - 1, m) if corrected else Fraction(1)
    if q2 > 0:
        return factor * Fraction(q1 * q1, 2 * q2)
    return factor * Fraction(q1 * (q1 - 1), 2)


for key in KEYS:
    seen_combos = []
    for r in (1, 2, 3):
        for combo in itertools.combinations(range(3), r):
            names = [NIGHTS[i] for i in combo]
            seen_combos.append(names)
            chosen = [sets[key][i] for i in combo]
            union = set().union(*chosen)
            times = {k: sum(k in s for s in chosen) for k in union}
            singles = {k for k in union if times[k] == 1}
            q2 = sum(1 for k in union if times[k] == 2)
            last, first = chosen[-1], chosen[0]
            rest_last = set().union(*chosen[:-1]) if r > 1 else set()
            rest_first = set().union(*chosen[1:]) if r > 1 else set()
            births = {k for k in singles if k in last and k not in rest_last} if r > 1 else set()
            deaths = {k for k in singles if k in first and k not in rest_first} if r > 1 else set()
            want = {"all": len(singles), "birth": len(singles - births),
                    "edge": len(singles - births - deaths)}
            g = next(x for x in D["grid"][key] if x["nights"] == names)
            eq(g["m"], r, f"{key} {names}: the number of looks")
            eq(g["s_obs"], len(union), f"{key} {names}: records seen")
            eq(g["q2"], q2, f"{key} {names}: records seen twice")
            eq(g["births"], len(births), f"{key} {names}: arrivals at the last look")
            eq(g["deaths"], len(deaths), f"{key} {names}: records gone after the first look")
            for rid in READINGS:
                v = g["readings"][rid]
                eq(v["q1"], want[rid], f"{key} {names} {rid}: singletons")
                f0 = chao(want[rid], q2, r, True)
                f0p = chao(want[rid], q2, r, False)
                eq(Fraction(v["f0"]["num"], v["f0"]["den"]), f0,
                   f"{key} {names} {rid}: the unseen class, exactly")
                eq(v["f0"]["dec"], f"{float(f0):.2f}", f"{key} {names} {rid}: rounded")
                eq(Fraction(v["f0_plain"]["num"], v["f0_plain"]["den"]), f0p,
                   f"{key} {names} {rid}: the uncorrected form")
                cov = (Fraction(len(union), len(union) + f0)
                       if len(union) + f0 > 0 else Fraction(0))
                eq(v["coverage_pct"], f"{float(cov) * 100:.2f}",
                   f"{key} {names} {rid}: coverage")
                ok(f0 >= 0, f"{key} {names} {rid}: the unseen class is not negative")
                ok(f0 <= f0p, f"{key} {names} {rid}: the corrected form is the smaller one")
                if r == 1:
                    ok(f0 == 0, f"{key} {names} {rid}: one look answers zero")
    eq(len(D["grid"][key]), 7, f"{key}: seven choices of nights")
    eq([g["nights"] for g in D["grid"][key]], seen_combos, f"{key}: in a fixed order")

# the two feeds that did not move
for key in ("atlas", "datasets"):
    ok(key in D["static_feeds"], f"{key} is recorded as unmoved")
    eq(len(D["patterns"][key]), 1, f"{key}: one capture pattern only")
    eq(list(D["patterns"][key]), ["111"], f"{key}: present at every look")
    for g in D["grid"][key]:
        for rid in READINGS:
            eq(g["readings"][rid]["f0"]["dec"], "0.00",
               f"{key} {g['nights']} {rid}: the estimator answers nothing missing")
ok("papers" not in D["static_feeds"], "the papers register is not recorded as unmoved")

# the envelope
for key in KEYS:
    vals = []
    for g in D["grid"][key]:
        if g["m"] < 2:
            continue
        for rid in READINGS:
            v = g["readings"][rid]
            vals.append(Fraction(v["f0"]["num"], v["f0"]["den"]))
    eq(D["envelope"][key]["lo"]["value"], f"{float(min(vals)):.2f}", f"{key}: the low end")
    eq(D["envelope"][key]["hi"]["value"], f"{float(max(vals)):.2f}", f"{key}: the high end")
    lo = D["envelope"][key]["lo"]
    hi = D["envelope"][key]["hi"]
    for end in (lo, hi):
        g = next(g for g in D["grid"][key]
                 if "+".join(n[5:] for n in g["nights"]) == end["nights"])
        eq(g["readings"][end["reading"]]["f0"]["dec"], end["value"],
           f"{key}: the end names a cell of the grid")

# ---------------------------------------------------------------- 6. the four-night series

for i, night in enumerate(["2026-09-14"] + NIGHTS):
    src = C14 if night == "2026-09-14" else C[night]
    cr = feed(src, "papers")["crossreads"]
    a = D["arxiv_series"][i]
    eq(a["night"], night, f"the series is in order at {night}")
    eq(a["cohort"], cr["arxiv_entries"], f"the cohort on {night}")
    eq(a["without_venue"], cr["arxiv_without_venue"], f"the numerator on {night}")
    eq(a["share_pct"], f"{100.0 * cr['arxiv_without_venue'] / cr['arxiv_entries']:.1f}",
       f"the share on {night}")
eq(len({a["without_venue"] for a in D["arxiv_series"]}), 1,
   "the numerator is the same on all four nights")
ok(len({a["cohort"] for a in D["arxiv_series"]}) > 1, "the denominator is not")

# ---------------------------------------------------------------- 7. the page states them

def in_page(s: str, what: str) -> bool:
    return ok(s in PAGE, f"the page states {what} ({s!r})")


def nbsp(n: int) -> str:
    return f"{n:,}".replace(",", " ")


in_page('http-equiv="Content-Security-Policy"', "a content security policy")
in_page("default-src 'none'", "a default of no network at all")
ok(not re.search(r'<(img|script|link|iframe)[^>]+\s(src|href)="(?!#)[a-z]+:', PAGE),
   "the page loads nothing from anywhere")
ok(PAGE.count("<script") == 1, "the page carries exactly one script")
ok("2026-09-17" in PAGE, "the page names the night nobody looked")
in_page("arXiv:2507.14638v1", "the source it reached outside to")
in_page("Scandinavian Journal of Statistics", "the estimator's origin, as its source names it")
in_page("CC BY 4.0", "the licence of the quoted passage")

pap = next(g for g in D["grid"]["papers"] if g["nights"] == NIGHTS)
in_page(nbsp(pap["s_obs"]), "records ever seen")
in_page(nbsp(pap["readings"]["all"]["q1"]), "the singletons")
in_page(nbsp(pap["q2"]), "the doubletons")
in_page(pap["readings"]["all"]["f0"]["dec"], "the unseen class")
in_page(pap["readings"]["birth"]["f0"]["dec"], "the unseen class read the other way")
in_page(pap["readings"]["all"]["coverage_pct"], "coverage")
in_page(nbsp(D["patterns"]["papers"]["101"]), "the blink count")
in_page(nbsp(D["absent_on_16"]["papers"]), "records absent at the second look")
in_page(nbsp(D["membership"]["papers"]["arrived"]), "arrivals")
in_page(nbsp(D["membership"]["papers"]["left"]), "departures")
in_page(nbsp(D["repair"]["records_compared"]), "records compared inside")
for key in KEYS:
    for night in ["2026-09-14"] + NIGHTS:
        in_page(nbsp(D["counts"][key][night]), f"{key} on {night}")
for a in D["arxiv_series"]:
    in_page(a["share_pct"], f"the share on {a['night']}")
for d in D["repair"]["detail"]:
    in_page(d["k"], "the identity of a record that changed inside")
for c in D["commuting"]:
    in_page(c["k"], "the identity of a record whose hole came back")
for key in KEYS:
    for g in D["grid"][key]:
        for rid in READINGS:
            in_page(g["readings"][rid]["f0"]["dec"], f"{key} {g['nights']} {rid} in the grid")

rows_in_table = re.findall(r'<tr data-feed="([a-z]+)" data-nights="([0-9+\-]+)">', PAGE)
eq(len(rows_in_table), 21, "the grid table has a row for every feed and every choice")
eq(sorted(set(f for f, _ in rows_in_table)), sorted(KEYS), "every feed is in the grid table")

m = re.search(r"var D = (\{.*?\});\n", PAGE, re.S)
ok(m is not None, "the page carries its numbers as data, not only as text")
if m:
    payload = json.loads(m.group(1))
    eq(payload["nights"], NIGHTS, "the script's nights")
    eq(payload["grid"], D["grid"], "the script's grid is the committed grid, unchanged")
    eq([f["key"] for f in payload["feeds"]], KEYS, "the script's feeds")

# ---------------------------------------------------------------- report

print(f"{PASS + len(FAIL)} checks, {len(FAIL)} failed")
for f in FAIL[:40]:
    print("  ✗", f)
sys.exit(1 if FAIL else 0)
