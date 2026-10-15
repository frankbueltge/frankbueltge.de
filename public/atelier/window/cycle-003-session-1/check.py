#!/usr/bin/env python3
"""Re-derives every number in the page's prose from `data.json`, and fails until they
agree — cycle 003, session 1.

The page is written by `build.py` from the feed; this reads the derived record back and
asserts (a) the arithmetic of the record against itself, (b) that every number the prose
states appears in the served document, (c) the properties the page claims are exact —
the closed form for P(empty), its symmetry, its two boundary cases — and (d) that the
committed judgments still point at the cells and entries they were made about.

    python3 window/cycle-003-session-1/check.py

Exit 0 when the record and the page say the same thing; 1 otherwise, naming every
disagreement. Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import html
import json
import math
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "tools" / "absence"))

import holes as HL  # noqa: E402
from build import ATLAS_SHA_SINCE_2026_09_03, CLUSTER_LABELS, decade_of, pct  # noqa: E402

D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")
READING = json.loads((HERE / "reading.json").read_text(encoding="utf-8"))
HOLES = json.loads((HERE / "holes-read.json").read_text(encoding="utf-8"))

FAILS: list[str] = []
RAN = 0


def ok(label: str, cond: bool, detail: str = "") -> None:
    global RAN
    RAN += 1
    if not cond:
        FAILS.append(f"{label}{(' — ' + detail) if detail else ''}")


def in_page(label: str, needle: str) -> None:
    ok(f"page states {label} ({needle!r})", needle in PAGE)


M, T, S, SP, V = D["meta"], D["totals"], D["screens"], D["spread"], D["verified"]
HR, BL = D["holes_read"], D["block"]
G = D["grids"]

# ------------------------------------------------------------------ the exact quantity
ok("P(empty) matches exact binomials at 40 random-free sample points",
   all(abs(HL.p_empty(521, i, j) - HL.p_empty_exact(521, i, j)) < 1e-12
       for i in (1, 5, 21, 55, 100, 196, 203, 256) for j in (1, 11, 47, 61, 100)))
ok("P(empty) is symmetric in the two margins",
   all(abs(HL.p_empty(521, i, j) - HL.p_empty(521, j, i)) < 1e-12
       for i in (3, 19, 72, 204) for j in (11, 45, 113, 256)))
ok("P(empty) = 1 when a margin is zero", HL.p_empty(521, 0, 55) == 1.0)
ok("P(empty) = 0 when the margins cannot both be avoided",
   HL.p_empty(521, 300, 300) == 0.0)
ok("P(empty) = 0 exactly at the boundary n_i + n_j = N + 1",
   HL.p_empty(521, 261, 261) == 0.0)
ok("P(empty) > 0 exactly at n_i + n_j = N", HL.p_empty(521, 260, 261) > 0.0)

# ------------------------------------------------------------------- the record itself
ok("ten grids", len(G) == 10 and T["n_grids"] == 10)
ok("statable cells summed from the grids", sum(g["n_cells"] for g in G) == T["statable"])
ok("occupied + empty = statable", T["occupied"] + T["empty"] == T["statable"])
ok("empty cells summed from the grids", sum(g["n_empty"] for g in G) == T["empty"])
ok("expected empty summed from the grids",
   abs(sum(g["expected_empty"] for g in G) - T["expected_empty"]) < 1e-9)
for g in G:
    ok(f"{g['a']}×{g['b']}: cells = rows × cols",
       g["n_cells"] == len(g["rows"]) * len(g["cols"]))
    ok(f"{g['a']}×{g['b']}: empty cells counted",
       g["n_empty"] == sum(1 for c in g["cells"] if c["count"] == 0))
    ok(f"{g['a']}×{g['b']}: expected recomputed from the margins",
       abs(g["expected_empty"]
           - sum(HL.p_empty(g["n_entries"], c["n_row"], c["n_col"]) for c in g["cells"]))
       < 1e-9)
    ok(f"{g['a']}×{g['b']}: every cell's P recomputed",
       all(abs(c["p_empty"] - HL.p_empty(g["n_entries"], c["n_row"], c["n_col"])) < 1e-12
           for c in g["cells"]))
    ok(f"{g['a']}×{g['b']}: row margins sum to at least the entry count",
       sum({c["row"]: c["n_row"] for c in g["cells"]}.values()) >= g["n_entries"])
    ok(f"{g['a']}×{g['b']}: expected empty never exceeds the cell count",
       g["expected_empty"] <= g["n_cells"])
    ok(f"{g['a']}×{g['b']}: an occupied cell can never have P(empty) = 1",
       all(c["p_empty"] < 1.0 for c in g["cells"] if c["count"] > 0))

ok("the surprising list is every empty cell",
   len(D["surprising"]) == T["empty"])
ok("the surprising list is sorted by P(empty)",
   all(D["surprising"][i]["p_empty"] <= D["surprising"][i + 1]["p_empty"]
       for i in range(len(D["surprising"]) - 1)))

# ------------------------------------------------------------------------- the screens
ok("read rows counted", len(D["reading"]) == S["n_read"])
ok("verdicts partition the read rows",
   S["n_firm"] + S["n_borderline"] + S["n_no"] == S["n_read"])
ok("firm counted from the rows",
   sum(1 for r in D["reading"] if r["verdict"] == "yes") == S["n_firm"])
ok("every read row was flagged by at least one screen",
   all(r["in_screen_1"] or r["in_screen_2"] for r in D["reading"]))
ok("every read row carries a reason", all(r["reason"].strip() for r in D["reading"]))
ok("the two word lists are disjoint",
   not (set(S["words_absence"]) & set(S["words_counter"])))
ok("screen 1 precision recomputed",
   abs(S["precision_screen_1"] - S["firm_in_screen_1"] / S["n_absence"]) < 1e-12)
ok("firm works split between the screens",
   S["firm_in_screen_1"] + S["firm_only_screen_2"] == S["n_firm"])
ok("the committed reading covers exactly the rows the page shows",
   len(READING["verdicts"]) == S["n_read"])
ok("the committed reading was made on this digest",
   READING["feed_sha256"] == M["feed_sha256"])

# --------------------------------------------------------------------- the hole verdicts
ok("twenty holes read", len(HR["verdicts"]) == 20)
ok("hole verdict counts sum to twenty", sum(HR["counts"].values()) == 20)
ok("no hole was labelled a candidate", HR["counts"]["candidate"] == 0)
ok("every hole verdict names one of the four labels",
   all(v["label"] in HR["labels"] for v in HR["verdicts"]))
ok("every hole verdict carries a reason",
   all(v["reason"].strip() for v in HR["verdicts"]))
ok("the hole verdicts are in rank order",
   [v["rank"] for v in HR["verdicts"]] == list(range(1, 21)))
for v in HR["verdicts"]:
    c = D["surprising"][v["rank"] - 1]
    ok(f"hole {v['rank']} still names the cell it was read on",
       (f'{c["a"]}×{c["b"]}', c["row"], c["col"]) == (v["grid"], v["row"], v["col"]))
ok("the committed hole reading was made on this digest",
   HOLES["feed_sha256"] == M["feed_sha256"])

# ------------------------------------------------------------------------ the provenance
ok("axis_pole is nearly the verification flag",
   BL["mixed_of_toverify"] == 312 and BL["n_toverify"] == 318)
ok("investigation is nearly all verified",
   BL["investigation_verified"] == 110 and BL["n_investigation"] == 114)
ok("six clusters carry no investigation work at all",
   len(BL["clusters_all_mixed"]) == 6)
ok("the page states how many clusters have no investigation work",
   f'<strong>{len(BL["clusters_all_mixed"])}</strong> of the thirteen clusters' in PAGE)
ok("the 2000s are one block",
   BL["decade_2000s"]["n"] == 196 and BL["decade_2000s"]["toverify"] == 192
   and BL["decade_2000s"]["digital_web"] == 161)

# --------------------------------------------------------------------------- the spread
ok("the firm works touch five clusters",
   SP["n_clusters_touched"] == sum(1 for b in SP["by_cluster"] if b["n_firm"]))
ok("thirteen clusters in the spread", len(SP["by_cluster"]) == len(CLUSTER_LABELS))
ok("the best cluster is the one with most firm works",
   SP["best_cluster"]["n_firm"] == max(b["n_firm"] for b in SP["by_cluster"]))
ok("the best cluster's purity recomputed",
   abs(SP["best_cluster_purity"]
       - SP["best_cluster"]["n_firm"] / SP["best_cluster"]["n_all"]) < 1e-12)
ok("the tightest cell holds a majority of the firm works",
   SP["tightest_cell"]["n_firm"] * 2 > S["n_firm"])
ok("the tightest cell's purity recomputed",
   abs(SP["tightest_cell"]["purity"]
       - SP["tightest_cell"]["n_firm"] / SP["tightest_cell"]["n_cell"]) < 1e-12)
ok("no cell isolates the firm works", SP["tightest_cell"]["purity"] < 0.5)

# ------------------------------------------------------------------------ the enrichment
ok("verified base rate recomputed",
   abs(V["base_rate"] - V["n_verified"] / M["entries"]) < 1e-12)
ok("firm verified rate recomputed",
   abs(V["firm_rate"] - V["firm_verified"] / S["n_firm"]) < 1e-12)
ok("the hypergeometric tail is a probability", 0.0 < V["p_one_sided"] < 1.0)
ok("the hypergeometric tail matches a direct sum",
   abs(V["p_one_sided"]
       - sum(math.comb(V["n_verified"], x)
             * math.comb(M["entries"] - V["n_verified"], S["n_firm"] - x)
             for x in range(V["firm_verified"], min(V["n_verified"], S["n_firm"]) + 1))
       / math.comb(M["entries"], S["n_firm"])) < 1e-18)

# ------------------------------------------------------------------------ the extraction
ok("the decade rule takes the first four-digit year", decade_of("1999–2005") == "1990s")
ok("the decade rule reads a year out of prose",
   decade_of("toolkit ongoing since ~2014") == "2010s")
ok("the decade rule declines when there is no year", decade_of("undated") is None)
ok("decade coverage is stated", D["facets"]["decade"]["entries"] == M["entries"])

# ------------------------------------------------------------------------------ the feed
ok("the atlas digest is the one this practice has read since 2026-09-03",
   M["feed_sha256"] == ATLAS_SHA_SINCE_2026_09_03,
   f"feed moved to {M['feed_sha256'][:16]}… — the finding is about the old file")
ok("the feed is cited, not mirrored",
   not (HERE / "atlas.json").exists() and not (ROOT / "atlas" / "werke.json").exists())

# --------------------------------------------------------------- the page says the same
in_page("the title", "The empty cell is not the missing work")
in_page("the entry count", str(M["entries"]))
in_page("the statable cells", str(T["statable"]))
in_page("the empty cells", str(T["empty"]))
in_page("the expected empty", f"{T['expected_empty']:.1f}")
in_page("the arithmetic share", pct(T["expected_empty"] / T["empty"]))
in_page("the firm count", str(S["n_firm"]))
in_page("the borderline count", str(S["n_borderline"]))
in_page("the first screen's flags", str(S["n_absence"]))
in_page("the second screen's new flags", str(S["n_counter_only"]))
in_page("the first screen's precision", pct(S["precision_screen_1"]))
in_page("the clusters touched", str(SP["n_clusters_touched"]))
in_page("the tightest cell's purity", pct(SP["tightest_cell"]["purity"]))
in_page("the verified enrichment", f"{V['p_one_sided']:.2e}")
in_page("the unverified-mixed identity", f"{BL['mixed_of_toverify']} of the {BL['n_toverify']}")
in_page("the 2000s block", f"{BL['decade_2000s']['toverify']} of the")
in_page("the feed digest", M["feed_sha256"])
in_page("the candidate count", "0</strong> are art that nobody has")
in_page("the foundation citation", "authorising categories")
in_page("the second foundation citation", "one schema defines all")

for label in ("vocabulary", "assignment", "collection", "candidate"):
    in_page(f"the label {label}", label)

# every cell and every read entry must be in the document, not only in the record
ok("all cells are rows in the document",
   PAGE.count('<td class="num">') >= T["statable"])
for r in D["reading"]:
    ok(f"the document carries the entry {r['title'][:40]!r}",
       html.escape(r["title"], quote=True)[:40] in PAGE)
ok("all ten grids are drawn as static SVG", PAGE.count('class="gridfig"') == 10)
ok("every cell of every grid is a drawn rect",
   PAGE.count('class="cell"') == T["statable"])
ok("the page loads nothing at runtime",
   "http://" not in PAGE.replace("http://www.w3.org", "")
   and "fetch(" not in PAGE and "<script src" not in PAGE)
ok("all ten grids are served visible — the floor is the whole figure",
   PAGE.count('class="gridwrap"') == 10 and 'class="gridwrap" id="gw0" data-i' in PAGE)
ok("the control is served hidden and revealed by the script",
   '<div class="controls" id="controls" hidden>' in PAGE
   and "controls.hidden = false" in PAGE)

if FAILS:
    print(f"{len(FAILS)} of {RAN} checks failed:")
    for f in FAILS:
        print(f"  ✗ {f}")
    raise SystemExit(1)
print(f"{RAN} checks passed — the record and the page say the same thing.")
