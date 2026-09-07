#!/usr/bin/env python3
"""Re-derives every number in the page's prose from `data.json`, and fails until they
agree — cycle 002, session 4.

The page is written by `build.py` from the feeds; this reads the derived record back
and asserts (a) the arithmetic of the record against itself, (b) that every number the
prose states appears in the served document, and (c) the two properties the page claims
are exact: the survival boundary, and the identity of the atlas digest.

    python3 window/cycle-002-session-4/check.py

Exit 0 when the record and the page say the same thing; 1 otherwise, naming the first
disagreement. Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import json
import pathlib
import re
import statistics
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build import (ATLAS_SHA_SINCE_S1, N_PROSE_CHECKS, geometry,  # noqa: E402
                   pct, standardise)

D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")

FAILS: list[str] = []
RAN = 0


def ok(label: str, cond: bool, detail: str = "") -> None:
    global RAN
    RAN += 1
    if not cond:
        FAILS.append(f"{label}{(' — ' + detail) if detail else ''}")


def in_page(label: str, needle: str) -> None:
    ok(f"page states {label} ({needle!r})", needle in PAGE)


S, G, ST = D["summary"], D["geometry"], D["standardised"]
sts = D["statements"]
lev = [s for s in sts if s["kind"] == "level"]
cmp_ = [s for s in sts if s["kind"] == "comparison"]

# ---------------------------------------------------------------- the record itself
ok("statement count", len(sts) == S["n_statements"])
ok("levels + comparisons = all", len(lev) + len(cmp_) == len(sts))
ok("level count matches the standardisation", len(lev) == ST["n_level"])
ok("comparison count matches the standardisation", len(cmp_) == ST["n_comparison"])
ok("entries summed from the feeds", sum(f["entries"] for f in D["feeds"]) == S["n_entries"])
ok("three feeds", len(D["feeds"]) == 3)
ok("fields summed from the feeds",
   sum(len(f["fields"]) for f in D["feeds"]) == S["n_fields"])
ok("settings summed from the families",
   sum(len(v) for v in D["settings"].values()) == S["n_settings"])
ok("live cells counted", sum(1 for c in D["cells"] if c["live"]) == S["n_cells_live"])
ok("all cells counted", len(D["cells"]) == S["n_cells"])

# every statement carries one verdict per setting of its family
for s in sts[:: max(1, len(sts) // 40)]:
    ok(f"verdict count for {s['field']}·{s['family']}",
       len(s["verdicts"]) == len(D["settings"][s["family"]]) == len(s["curve"]))

ok("survival is strict constancy",
   all(s["survives"] == (len(set(s["verdicts"])) == 1) for s in sts))

# ------------------------------------------------------------------- the geometry
recomputed = [geometry(s["curve"], 0.0 if s["kind"] == "comparison" else s["cut"])
              for s in sts]
ok("half-travel re-derives from the curve",
   all(abs(r - s["r"]) < 1e-6 for (r, _), s in zip(recomputed, sts)))
ok("standoff re-derives from the curve",
   all(abs(c - s["c"]) < 1e-6 for (_, c), s in zip(recomputed, sts)))

boundary_ok = sum(1 for s in sts if (s["c"] > s["r"]) == s["survives"])
ok("boundary count", boundary_ok == G["boundary_ok"], f"{boundary_ok} vs {G['boundary_ok']}")
ok("exactly one boundary exception is claimed",
   len(sts) - boundary_ok == G["n_boundary_exceptions"] == 1)
exc = [s for s in sts if (s["c"] > s["r"]) != s["survives"]]
ok("the exception is a statement whose curve touches its line exactly",
   len(exc) == 1 and min(abs(x - exc[0]["cut"]) for x in exc[0]["curve"]) < 1e-9)

for key, want in (("median_r_lev", [s["r"] for s in lev]),
                  ("median_r_cmp", [s["r"] for s in cmp_]),
                  ("median_c_lev", [s["c"] for s in lev]),
                  ("median_c_cmp", [s["c"] for s in cmp_])):
    ok(f"{key} re-derives", abs(statistics.median(want) - G[key]) < 1e-9)

ok("r_ratio re-derives", abs(G["median_r_lev"] / G["median_r_cmp"] - G["r_ratio"]) < 1e-9)
ok("c_ratio re-derives", abs(G["median_c_lev"] / G["median_c_cmp"] - G["c_ratio"]) < 1e-9)
ok("comparisons have the shorter curve", G["median_r_cmp"] < G["median_r_lev"])
ok("comparisons stand closer to their line", G["median_c_cmp"] < G["median_c_lev"])

cancels = [(max(s["curve"]) - min(s["curve"])) / ((s["travel_a"] + s["travel_b"]) / 2)
           for s in cmp_ if (s["travel_a"] + s["travel_b"]) > 0]
ok("cancellation re-derives", abs(statistics.median(cancels) - G["median_cancel"]) < 1e-9)
ok("the cancellation is partial, not total", 0.0 < G["median_cancel"] < 1.0)

# --------------------------------------------------------------- the standardisation
re_std = standardise(sts, ST["bin_width"])
for k in ("raw_level", "raw_comparison", "expected_level", "matched_comparison"):
    ok(f"{k} re-derives", abs(re_std[k] - ST[k]) < 1e-9, f"{re_std[k]} vs {ST[k]}")
ok("matched count re-derives", re_std["n_matched"] == ST["n_matched"])
ok("the control moves the finding, it does not create it",
   ST["raw_comparison"] > ST["raw_level"] and ST["matched_comparison"] > ST["expected_level"])
ok("the control at least doubles the gap",
   ST["matched_comparison"] / ST["expected_level"] > 2 * (ST["raw_comparison"] / ST["raw_level"]) - 1)

# the cells
cells_for = sum(1 for c in D["cells_matched"] if c["cmp"] > c["lev"])
cells_ag = sum(1 for c in D["cells_matched"] if c["cmp"] < c["lev"])
cells_tie = sum(1 for c in D["cells_matched"] if c["cmp"] == c["lev"])
ok("cells favouring comparisons", cells_for == S["cells_for_cmp"])
ok("cells favouring levels", cells_ag == S["cells_against"])
ok("cells tied", cells_tie == S["cells_tie"])
ok("cells partition", cells_for + cells_ag + cells_tie == len(D["cells_matched"]) == S["n_cells_matched"])
ok("every tie is a tie at the ceiling",
   all(c["cmp"] == 1.0 for c in D["cells_matched"] if c["cmp"] == c["lev"]))

# the counterexample cell, read back from the statements themselves
worst = min((c for c in D["cells_matched"] if c["cmp"] < c["lev"]),
            key=lambda c: c["cmp"] - c["lev"])
sub = [s for s in cmp_ if (s["feed"], s["field"], s["family"])
       == (worst["feed"], worst["field"], worst["family"])]
turning = [s for s in sub if not s["survives"]]
only_last = sum(1 for s in turning
                if len(set(s["verdicts"][:-1])) == 1 and s["verdicts"][-1] != s["verdicts"][0])
ok("counterexample cell size", len(sub) == S["against_n"])
ok("counterexample turning count", len(turning) == S["against_turning"])
ok("counterexample flips only at the widest setting", only_last == S["against_only_last"])
ok("the counterexample is a majority of that cell's turns", only_last > len(turning) / 2)

# ------------------------------------------------------------------------ the feeds
ok("atlas digest is the one four nights running",
   D["feeds"][0]["sha256"] == ATLAS_SHA_SINCE_S1, D["feeds"][0]["sha256"][:16])
ok("no feed is mirrored into this repository",
   not any((HERE / n).exists() for n in ("atlas.json", "papers-register.json", "datasets.json")))

# -------------------------------------------------------------- the record vs the page
in_page("the statement count", f"{S['n_statements']:,}")
in_page("the entry count", f"{S['n_entries']:,}")
in_page("raw level survival", pct(ST["raw_level"]))
in_page("raw comparison survival", pct(ST["raw_comparison"]))
in_page("matched comparison survival", pct(ST["matched_comparison"]))
in_page("expected level survival", pct(ST["expected_level"]))
in_page("median half-travel, comparisons", f"{G['median_r_cmp']:.4f}")
in_page("median half-travel, levels", f"{G['median_r_lev']:.4f}")
in_page("median standoff, comparisons", f"{G['median_c_cmp']:.4f}")
in_page("median standoff, levels", f"{G['median_c_lev']:.4f}")
in_page("the travel ratio", f"{G['r_ratio']:.2f}")
in_page("the standoff ratio", f"{G['c_ratio']:.2f}")
in_page("the cancellation", f"{G['median_cancel']:.3f}")
in_page("the boundary count", f"{G['boundary_ok']}/{S['n_statements']}")
in_page("the atlas digest", D["feeds"][0]["sha256"][:16])
in_page("the counterexample cell", S["against_label"].split(",")[0])

ok("every statement is in the served document",
   PAGE.count('<tr data-i="') == S["n_statements"])
ok("every point is drawn in the still figure",
   PAGE.count('class="pt cmp"') + PAGE.count('class="pt lev"') >= S["n_statements"])
ok("both figures are in the document",
   'class="plane"' in PAGE and 'class="matched"' in PAGE)
ok("the page fetches nothing", "http://" not in PAGE.replace("http://www.w3.org", ""))
ok("the page loads no library", "<script src" not in PAGE)
ok("the refutation conditions are stated", "What would refute this" in PAGE)
ok("the form is named in a line", "client-rendered" in PAGE or "FORM" in PAGE)
ok("no vendor is named in the page",
   not re.search(r"(?i)openai|anthropic|claude|gpt-|gemini|copilot", PAGE))

# every sweep row appears
for r in D["sweeps"]["min_group"]:
    in_page(f"min-group sweep {r['min_group']}", pct(r["matched_comparison"]))
for r in D["sweeps"]["bin_width"]:
    in_page(f"bin sweep {r['bin_width']:g}", pct(r["matched_comparison"]))
ok("the headline setting is in the sweep",
   any(r["min_group"] == S["min_group"] for r in D["sweeps"]["min_group"]))
ok("the finding survives every min-group setting",
   all(r["matched_comparison"] > r["expected_level"] for r in D["sweeps"]["min_group"]))
ok("the finding survives every bin width",
   all(r["bin_width"] and r["matched_comparison"] > r["expected_level"]
       for r in D["sweeps"]["bin_width"]))

print(f"{RAN} checks, {len(FAILS)} failing")
if RAN != N_PROSE_CHECKS:
    print(f"NOTE: build.py states {N_PROSE_CHECKS} checks and this run made {RAN}; "
          f"set N_PROSE_CHECKS to {RAN} and rebuild.", file=sys.stderr)
for f in FAILS:
    print("  FAIL:", f)
raise SystemExit(1 if FAILS or RAN != N_PROSE_CHECKS else 0)
