#!/usr/bin/env python3
"""Re-derive the numbers of cycle 002, session 1 — independently of the instrument.

This file imports neither `nn.py` nor `build.py`. It takes the committed derived
record (`data.json`), recomputes by its own route everything that record can be held
to from the inside, checks the judgements in `verdicts.json` against the pairs they
judge, and then asserts that each headline number is actually printed on the page —
a number that is right in the record and wrong on the page is still wrong.

What it cannot do, stated so nobody mistakes its silence for assurance: the atlas feed
is read and never mirrored (SITE-API, "feeds, never copies"), so the step from the feed
to `data.json` is re-run by `tools/neighbour/nn.py --fetch`, against a feed that has
moved on. `data.json` pins the state that was measured with a sha256; this file checks
everything downstream of it.

    python3 window/cycle-002-session-1/check.py       # from anywhere

Exit 0 and a count of the checks that passed, or non-zero and the first disagreement.
"""

from __future__ import annotations

import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
V = json.loads((HERE / "verdicts.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")
ADJ = (HERE / "ADJUDICATION.md").read_text(encoding="utf-8")

FAILS: list[str] = []
CHECKS = 0


def eq(label: str, got, want) -> None:
    global CHECKS
    CHECKS += 1
    if got != want:
        FAILS.append(f"{label}: re-derived {got!r}, record says {want!r}")


def near(label: str, got: float, want: float, tol: float = 6e-4) -> None:
    global CHECKS
    CHECKS += 1
    if abs(got - want) > tol:
        FAILS.append(f"{label}: re-derived {got!r}, record says {want!r} (tol {tol})")


def true(label: str, cond: bool) -> None:
    global CHECKS
    CHECKS += 1
    if not cond:
        FAILS.append(f"{label}: false")


def flat(t: str) -> str:
    """Line breaks in the source are not differences on the page."""
    return " ".join(t.split())


def on_page(needle: str, where: str = "index.html") -> None:
    global CHECKS
    CHECKS += 1
    hay = flat(PAGE) if where == "index.html" else flat(ADJ)
    if flat(needle) not in hay:
        FAILS.append(f"{where} does not print {needle!r}")


# ---------------------------------------------------------------- the corpus

rows = D["rows"]
C, T, F = D["corpus"], D["thresholds"], D["flagged"]
FC = D["field_condition"]
N = C["n_works"]

eq("rows counted", len(rows), N)
eq("ids are distinct", len({r["id"] for r in rows}), N)
true("every row has a neighbour", all(r["nn"] for r in rows))
true("no row is its own neighbour", all(r["nn"] != r["id"] for r in rows))

s = sorted(r["s"] for r in rows)
near("observed min", s[0], D["observed"]["min"])
near("observed max", s[-1], D["observed"]["max"])
near("observed mean", sum(s) / len(s), D["observed"]["mean"])
near("observed median", (s[260] if N % 2 else (s[N // 2 - 1] + s[N // 2]) / 2),
     D["observed"]["median"], 1e-3)
eq("observed histogram totals", sum(D["observed"]["hist"]), N)
eq("null histogram totals", sum(D["null"]["hist"]), D["null"]["n_surrogates"])
eq("surrogates counted", D["null"]["m_per_work"] * N, D["null"]["n_surrogates"])

# --- the flagged counts, re-derived from the per-work scores
for key, cut in (("calibrated_t95", T["t95"]), ("calibrated_t99", T["t99"]),
                 ("calibrated_t999", T["t999"]), ("assumed_0_3", 0.30),
                 ("assumed_0_5", 0.50), ("assumed_0_7", 0.70)):
    eq(f"works above {cut}", sum(1 for v in s if v > cut), F[key])

true("the calibrated cut is stricter than the null median", T["t99"] > T["t50"])
true("the null never reached the observed maximum", D["null"]["max"] < D["observed"]["max"])
true("the assumed cut of 0.5 flags fewer works than the calibrated one",
     F["assumed_0_5"] < F["calibrated_t99"])

# ---------------------------------------------------------------- the curve

curve = D["curve"]
true("the curve is sorted by cut", all(curve[i]["cut"] <= curve[i + 1]["cut"]
                                       for i in range(len(curve) - 1)))
true("flagged works fall as the cut rises",
     all(curve[i]["works"] >= curve[i + 1]["works"] for i in range(len(curve) - 1)))
true("flagged pairs fall as the cut rises",
     all(curve[i]["n"] >= curve[i + 1]["n"] for i in range(len(curve) - 1)))
for r in curve:
    CHECKS += 1
    if r["n"] != r["either"] + r["surviving"]:
        FAILS.append(f"curve at {r['cut']}: n {r['n']} != either {r['either']} + surviving {r['surviving']}")
        break
    if not (max(r["same_artist"], r["both_residue"]) <= r["either"]
            <= r["same_artist"] + r["both_residue"]):
        FAILS.append(f"curve at {r['cut']}: the two rules do not bracket 'either'")
        break
    if r["both_residue"] > r["any_residue"]:
        FAILS.append(f"curve at {r['cut']}: both-residue exceeds any-residue")
        break

at99 = [r for r in curve if abs(r["cut"] - round(T["t99"], 3)) < 1e-9]
eq("the calibrated cut is a point on the curve", len(at99), 1)
if at99:
    eq("curve agrees on works at the cut", at99[0]["works"], F["calibrated_t99"])
    eq("curve agrees on pairs at the cut", at99[0]["n"], D["pairs_above_t99"])
    eq("curve agrees on surviving pairs", at99[0]["surviving"],
       FC["strata_above_t99"]["surviving"])

# --- the claim of §3, re-derived rather than restated
live = [r for r in curve if r["n"] > 0]
share = [(r["cut"], r["either"] / r["n"]) for r in live]
near("artefact share at the lowest cut", share[0][1], 0.525, 1e-3)
near("artefact share at the calibrated cut", dict(share)[round(T["t99"], 3)], 0.613, 1e-3)
dips = sum(1 for i in range(len(share) - 1) if share[i + 1][1] < share[i][1] - 1e-12)
eq("dips in the artefact share", dips, 28)
true("the share is higher at the top of the range than at the bottom",
     share[-1][1] > share[0][1])

# ---------------------------------------------------------------- the pairs

tp = D["top_pairs"]
eq("named pairs", len(tp), 40)
eq("ranks are 1..40", [p["rank"] for p in tp], list(range(1, 41)))
true("ranked by score", all(tp[i]["score"] >= tp[i + 1]["score"] for i in range(len(tp) - 1)))
true("a pair survives exactly when neither rule catches it",
     all(p["survives"] == (not (p["same_artist"] or p["both_residue"])) for p in tp))
true("identical texts score 1", all(p["score"] == 1.0 for p in tp if p["identical_text"]))

st = FC["strata_top"]
eq("top stratum size", st["n"], len(tp))
eq("same artist in the top", sum(1 for p in tp if p["same_artist"]), st["same_artist"])
eq("both-residue in the top", sum(1 for p in tp if p["both_residue"]), st["both_residue"])
eq("surviving in the top", sum(1 for p in tp if p["survives"]), st["surviving"])
eq("either in the top", sum(1 for p in tp if not p["survives"]), st["either"])

above_half = [p for p in tp if p["score"] > 0.5]
eq("pairs above cosine 0.5", len(above_half), 6)
eq("of those, one artist twice", sum(1 for p in above_half if p["same_artist"]), 5)

s99 = FC["strata_above_t99"]
eq("pairs above the cut", s99["n"], D["pairs_above_t99"])
eq("either above the cut", s99["either"], s99["n"] - s99["surviving"])
true("the two rules bracket 'either' above the cut",
     max(s99["same_artist"], s99["both_residue"]) <= s99["either"]
     <= s99["same_artist"] + s99["both_residue"])
true("same-artist pairs are enriched above the cut",
     s99["same_artist_share"] > FC["strata_all_pairs"]["same_artist_share"] * 10)
true("residue pairs are enriched above the cut",
     s99["both_residue_share"] > FC["strata_all_pairs"]["both_residue_share"] * 5)

# ---------------------------------------------------------------- the judgements

verd = V["verdicts"]
surv_ranks = {str(p["rank"]) for p in tp if p["survives"]}
eq("a verdict for every surviving pair and no other", set(verd), surv_ranks)
tally: dict[str, int] = {}
for r in verd.values():
    tally[r["v"]] = tally.get(r["v"], 0) + 1
eq("the tally counts the verdicts", tally, {k: v for k, v in V["tally"].items() if v})
eq("verdicts use the declared scheme", set(tally) - set(V["scheme"]), set())
eq("no pair was judged 'same move'", V["tally"]["same move"], 0)
eq("the surviving set", sum(V["tally"].values()), st["surviving"])
true("every verdict carries a note", all(r.get("note") for r in verd.values()))

# ---------------------------------------------------------------- the page

on_page(str(N))
on_page(f"{D['pairs_total']:,}")
on_page(f"{D['null']['n_surrogates']:,}")
on_page(str(T["t99"]))
on_page(str(D["observed"]["median"]))
on_page(str(D["null"]["median"]))
on_page(str(D["null"]["max"]))
on_page(f">{F['calibrated_t99']}<")
on_page(f">{F['assumed_0_5']}<")
on_page(f">{s99['same_artist']}<")
on_page(f">{s99['both_residue']}<")
on_page(f"{s99['either']} of the {s99['n']}")
on_page(f"{FC['entries_with_any_residue']} of the {N} entries")
on_page(f"{round(100 * FC['entries_with_any_residue'] / N, 1)}%")
on_page(f"{FC['duplicate_texts']['entries']}\nentries in\n{FC['duplicate_texts']['groups']} groups")
on_page(str(D["source"]["sha256"][:32]))
on_page(str(D["method"]["seed"]))
on_page("38th")
for label in V["scheme"]:
    on_page(label)

# the page must stand on its own: nothing is fetched when it opens
CHECKS += 1
for attr in ('src="http', "src='http", 'href="http', "href='http"):
    if attr in PAGE:
        FAILS.append(f"index.html loads something external: {attr}")
        break

# the still frame must be complete before any script runs
CHECKS += 1
if PAGE.count("<svg") != 3:
    FAILS.append(f"expected three server-rendered figures, found {PAGE.count('<svg')}")
CHECKS += 1
if 'id="controls" hidden' not in PAGE:
    FAILS.append("the interactive controls are not hidden for a reader without scripts")

# the adjudication file and the record must agree
on_page(f"**Tally: {V['tally']['same move']} same move", "ADJUDICATION.md")
on_page(f"{s99['n']} pairs stand above", "ADJUDICATION.md")
on_page(f"**{s99['surviving']} survive the rule.**", "ADJUDICATION.md")

# ---------------------------------------------------------------- report

if FAILS:
    print(f"{len(FAILS)} disagreement(s) of {CHECKS} checks:", file=sys.stderr)
    for f in FAILS:
        print("  -", f, file=sys.stderr)
    sys.exit(1)
print(f"{CHECKS} checks passed.")
