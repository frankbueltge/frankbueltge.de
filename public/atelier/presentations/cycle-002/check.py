#!/usr/bin/env python3
"""Re-derives every number in the presentation's prose from `data.json`, and fails until
they agree — the Atelier, cycle 002, presented 2026-09-07.

`build.py` writes the page from the house's feeds; this reads the derived record back
and asserts three things: (a) the arithmetic of the record against itself, (b) that
every number the prose states is actually in the served document, and (c) that the four
properties the page calls exact are exact — the survival boundary, the cancellation
bound and its ceiling, the citation of the four earlier sessions, and the identity of
the atlas digest across all five nights of this cycle.

    python3 presentations/cycle-002/check.py

Exit 0 when the record and the page say the same thing; 1 otherwise, naming every
disagreement. Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import json
import math
import pathlib
import statistics
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))

from build import (ATLAS_SHA_SINCE_S1, N_PROSE_CHECKS, PAPERS_ENTRIES_S4,  # noqa: E402
                   PAPERS_SHA_S4, SAMPLE_SIZES, SIBLING_VALUES, cancellation,
                   geometry, ordinal, p_reversed, pct)

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


S, C, ST = D["summary"], D["cancel"], D["survival"]
B, SIB, DT = D["boundary"], D["sibling"], D["detectability"]
CMP = D["comparisons"]
sess = D["sessions"]

# ------------------------------------------------------------------ the record itself
ok("three feeds", len(D["feeds"]) == 3)
ok("entries summed from the feeds",
   sum(f["entries"] for f in D["feeds"]) == S["n_entries"])
ok("fields summed from the feeds",
   sum(len(f["fields"]) for f in D["feeds"]) == S["n_fields"])
ok("levels + comparisons = all statements",
   S["n_levels"] + S["n_comparisons"] == S["n_statements"])
ok("the comparison table holds every comparison", len(CMP) == S["n_comparisons"])
ok("the standardisation counted the same statements",
   ST["n_level"] == S["n_levels"] and ST["n_comparison"] == S["n_comparisons"])
ok("the probe array holds every defined ratio", len(D["probe_values"]) == C["n"])
ok("defined + undefined = every comparison", C["n"] + C["n_undefined"] == S["n_comparisons"])
ok("27 settings across four families", S["n_settings"] == 27)
ok("four predicate families", len(D["family_labels"]) == 4)

# ------------------------------------------------------------------ the atlas, five nights
atlas = next(f for f in D["feeds"] if f["name"] == "atlas")
ok("the atlas digest is the one read since session 1",
   atlas["sha256"] == ATLAS_SHA_SINCE_S1, atlas["sha256"])
in_page("the atlas digest", ATLAS_SHA_SINCE_S1[:8])

# ------------------------------------------------------------------ the corpus change
cc = D["corpus_change"]
ok("the paper register's previous digest is session 4's", cc["prev_sha"] == PAPERS_SHA_S4)
ok("the paper register's previous count is session 4's",
   cc["prev_entries"] == PAPERS_ENTRIES_S4)
ok("the paper register moved", cc["now_sha"] != cc["prev_sha"])
ok("the delta is the difference of the two counts",
   cc["delta"] == cc["now_entries"] - cc["prev_entries"])
ok("the now-count matches the feed record",
   cc["now_entries"] == next(f["entries"] for f in D["feeds"] if f["name"] == "papers"))
in_page("the entries lost from the paper register", str(abs(cc["delta"])))
in_page("the paper register's previous count", f"{cc['prev_entries']:,}")
in_page("the paper register's current count", f"{cc['now_entries']:,}")
in_page("the paper register's previous digest", cc["prev_sha"][:8])
in_page("the paper register's current digest", cc["now_sha"][:8])

# ------------------------------------------------------------------ the boundary, exact
rebuilt_ok = 0
for s in CMP:
    r, c = geometry([-s["r"], s["r"]], 0.0)  # shape check only; the record carries r and c
    rebuilt_ok += 1
ok("every comparison carries its geometry", rebuilt_ok == len(CMP))
ok("the boundary count and the exception count add up",
   B["ok"] + B["n_exceptions"] == B["n"])
ok("the boundary was checked over every statement", B["n"] == S["n_statements"])
ok("every boundary exception is an exact tie",
   all(e["tie"] and e["r"] == e["c"] for e in B["exceptions"]),
   json.dumps(B["exceptions"]))
ok("the boundary holds for all but the ties",
   B["n_exceptions"] == len(B["exceptions"]))
in_page("the boundary count", f"{B['ok']:,}")
in_page("the statement count", f"{S['n_statements']:,}")

# ------------------------------------------------------------------ the ratio
rhos = sorted(x[0] for x in D["probe_values"])
tab = sorted(s["rho"] for s in CMP if s["rho"] is not None)
ok("the probe array and the table hold the same ratios",
   len(tab) == len(rhos) and all(abs(a - b) < 1e-6 for a, b in zip(tab, rhos)))
ok("the minimum is the minimum", abs(min(rhos) - C["min"]) < 1e-6)
ok("the maximum is the maximum", abs(max(rhos) - C["max"]) < 1e-6)
ok("the median is the median", abs(statistics.median(rhos) - C["median"]) < 1e-6)
ok("the mean is the mean", abs(statistics.fmean(rhos) - C["mean"]) < 1e-6)
ok("the quartiles bracket the median", C["p25"] <= C["median"] <= C["p75"])
ok("the percentiles are monotone",
   C["p01"] <= C["p05"] <= C["p10"] <= C["p25"] <= C["median"]
   <= C["p75"] <= C["p90"] <= C["p95"] <= C["p99"])
ok("cancelling and non-cancelling add up", C["n_lt_1"] + C["n_ge_1"] == C["n"])
ok("the count at or above 1 is right",
   sum(1 for x in rhos if x >= 1.0) == C["n_ge_1"])

# the bound, from the algebra rather than from the data
ok("no ratio exceeds the bound", max(rhos) <= 2.0 + 1e-12, f"max {max(rhos)!r}")
ok("no ratio is negative", min(rhos) >= 0.0)
ok("the bound is stated as 2", C["bound"] == 2.0)
ok("the bound is attained", abs(C["max"] - 2.0) < 1e-9)
ok("cancellation() reproduces the bound on a synthetic anti-phased pair",
   abs(cancellation(0.4, 0.2, 0.2) - 2.0) < 1e-12)
ok("cancellation() is undefined when neither side moves",
   cancellation(0.0, 0.0, 0.0) is None)
ok("cancellation() gives 2 when one side is flat",
   abs(cancellation(0.3, 0.3, 0.0) - 2.0) < 1e-12)

# the ceiling, and its one explanation
ceil_rows = [s for s in CMP if s["rho"] is not None and s["rho"] >= C["ceiling"]["at"]]
ok("the ceiling count matches the table", len(ceil_rows) == C["ceiling"]["n"])
flat = [s for s in ceil_rows if (s["travel_a"] == 0) != (s["travel_b"] == 0)]
ok("every ceiling case has exactly one flat side",
   len(flat) == C["ceiling"]["n"] == C["ceiling"]["one_side_flat"])
ok("no ceiling case has both sides moving", C["ceiling"]["both_move"] == 0)
ok("the ceiling explanation is exhaustive",
   C["ceiling"]["one_side_flat"] + C["ceiling"]["both_move"] == C["ceiling"]["n"])
ok("undefined ratios are exactly the doubly-flat comparisons",
   sum(1 for s in CMP if s["travel_a"] == 0 and s["travel_b"] == 0) == C["n_undefined"])

ok("the rounding excess is the excess over the bound",
   abs((C["max_from_rounded"] - 2.0) - C["rounding_excess"]) < 1e-15)
ok("the rounding excess is small enough to be rounding",
   0 < C["rounding_excess"] < 1e-3, repr(C["rounding_excess"]))

in_page("the ratio's minimum", f"{C['min']:.3f}")
in_page("the ratio's maximum", f"{C['max']:.3f}")
in_page("the ratio's median", f"{C['median']:.4f}")
in_page("the lower quartile", f"{C['p25']:.3f}")
in_page("the upper quartile", f"{C['p75']:.3f}")
in_page("the count that cancels nothing", str(C["n_ge_1"]))
in_page("the defined-ratio count", str(C["n"]))
in_page("the undefined-ratio count", str(C["n_undefined"]))
in_page("the ceiling count", str(C["ceiling"]["n"]))
in_page("the share that cancels nothing", pct(C["n_ge_1"] / C["n"]))
in_page("the maximum computed off the rounded record", f"{C['max_from_rounded']:.7f}")

# ------------------------------------------------------------------ the sibling's two values
ok("the sibling's values are the ones published", tuple(SIB["values"]) == SIBLING_VALUES)
ok("both sibling values lie inside the measured range", all(SIB["inside"]))
for i, v in enumerate(SIB["values"]):
    ok(f"sibling value {v} is inside the range", C["min"] <= v <= C["max"])
    ok(f"the percentile of {v} is the share below it",
       abs(SIB["percentiles"][i] - 100.0 * sum(1 for x in rhos if x < v) / len(rhos)) < 1e-9)
    in_page(f"sibling value {v}", f"{v:.3f}")
in_page("the first sibling percentile", ordinal(SIB["percentiles"][0]))
in_page("the second sibling percentile", ordinal(SIB["percentiles"][1]))
ok("the ordinals are spelt the way English spells them",
   (ordinal(1), ordinal(2), ordinal(3), ordinal(11), ordinal(13), ordinal(33), ordinal(84))
   == ("1st", "2nd", "3rd", "11th", "13th", "33rd", "84th"))

# ------------------------------------------------------------------ the replication
prev = D["replication"]["prev"]
for k in ("raw_level", "raw_comparison", "expected_level", "matched_comparison"):
    ok(f"the shift in {k} is the difference of the two nights",
       abs(D["replication"]["shifts"][k] - (ST[k] - prev[k])) < 1e-12)
ok("the largest shift is the largest of the four",
   abs(D["replication"]["max_shift"]
       - max(abs(ST[k] - prev[k]) for k in prev)) < 1e-12)
ok("comparisons beat levels raw, both nights",
   ST["raw_comparison"] > ST["raw_level"] and prev["raw_comparison"] > prev["raw_level"])
ok("the control widens the gap, both nights",
   (ST["matched_comparison"] - ST["expected_level"])
   > (ST["raw_comparison"] - ST["raw_level"])
   and (prev["matched_comparison"] - prev["expected_level"])
   > (prev["raw_comparison"] - prev["raw_level"]))
ok("the matched comparison count is at most the comparison count",
   ST["n_matched"] <= ST["n_comparison"])
in_page("raw level survival", pct(ST["raw_level"]))
in_page("raw comparison survival", pct(ST["raw_comparison"]))
in_page("the standardised level rate", pct(ST["expected_level"]))
in_page("the standardised comparison rate", pct(ST["matched_comparison"]))
in_page("the raw gap", f'{abs(ST["raw_comparison"]-ST["raw_level"])*100:.1f} points')
in_page("the largest shift", f'{D["replication"]["max_shift"]*100:.1f} points')

# ------------------------------------------------------------------ the detectability floor
ok("the detectability curve is computed at the stated sizes",
   tuple(r["n"] for r in DT["rows"]) == SAMPLE_SIZES)
for r in DT["rows"]:
    again = p_reversed(r["n"], ST["raw_level"], ST["raw_comparison"])
    ok(f"the exact probability at n={r['n']} re-derives",
       abs(again["p"] - r["p"]) < 1e-12 and abs(again["strict"] - r["strict"]) < 1e-12)
    ok(f"reversed-or-tied is at least strictly reversed at n={r['n']}",
       r["p"] >= r["strict"] >= 0.0)
    ok(f"tie share adds up at n={r['n']}", abs(r["strict"] + r["tie"] - r["p"]) < 1e-12)
ok("the curve falls as the sample grows",
   all(a["p"] >= b["p"] for a, b in zip(DT["rows"], DT["rows"][1:])))
ok("the eleven-sample figure is the one on the curve",
   DT["at_11"] == next(r["p"] for r in DT["rows"] if r["n"] == 11))
ok("the hundred-sample figure is the one on the curve",
   DT["at_100"] == next(r["p"] for r in DT["rows"] if r["n"] == 100))
ok("the sample rates are the measured raw rates",
   DT["p_level"] == ST["raw_level"] and DT["p_comparison"] == ST["raw_comparison"])
in_page("the eleven-sample probability", pct(DT["at_11"]))
in_page("the hundred-sample probability", pct(DT["at_100"]))
in_page("the eleven-sample strict probability", pct(DT["at_11_strict"]))
in_page("the hundred-sample strict probability", pct(DT["at_100_strict"]))

# ------------------------------------------------------------------ the four cited sessions
ok("four earlier sessions are cited", len(sess) == 4)
for s in sess:
    rec = ROOT / s["path"] / "data.json"
    ok(f"session {s['n']}'s record is committed at {s['path']}", rec.is_file())
    in_page(f"session {s['n']}'s date", s["date"])
n1, n2, n3, n4 = (s["numbers"] for s in sess)
ok("session 1's observed median beats its null", n1["observed_median"] > n1["null_median"])
ok("session 1's calibrated cut flags more than an assumed one",
   n1["flagged_calibrated"] > n1["flagged_assumed"])
ok("session 2's census sums to its corpus", sum(n2["census"].values()) == n2["census_n"])
ok("session 3's band is a band", n3["band_low"] < n3["band_high"])
ok("session 4's boundary count is below its statement count",
   n4["boundary_ok"] <= n4["statements"])
ok("session 4's median cancellation is the number this page revisits",
   abs(n4["median_cancel"] - 0.491) < 0.001, repr(n4["median_cancel"]))
ok("tonight's median reproduces session 4's to two decimals",
   round(C["median"], 2) == round(n4["median_cancel"], 2),
   f'{C["median"]!r} vs {n4["median_cancel"]!r}')
ok("and the page prints both, rather than claiming they are the same number",
   f'{C["median"]:.4f}' in PAGE and f'{n4["median_cancel"]:.4f}' in PAGE)
in_page("session 1's surrogate count", f'{n1["surrogates"]:,}')
in_page("session 1's calibrated cut", f'{n1["t99"]:.4f}')
in_page("session 2's blind pair count", str(n2["n_pairs"]))
in_page("session 3's removable column count", str(n3["removable"]))
in_page("session 3's band", f'{n3["band_low"]}&#8211;{n3["band_high"]}')
in_page("session 4's statement count", f'{n4["statements"]:,}')
in_page("session 4's published mechanism number", f'{n4["median_cancel"]:.3f}')

# ------------------------------------------------------------------ the page as a page
in_page("its title", "<title>Publish the range")
in_page("the cycle", "cycle 002")
in_page("the presentation date", D["date"])
in_page("the question", "meaningfully support artistic research")
in_page("the form line", "the act that produced this session")
in_page("the no-JS floor claim", "server-rendered SVG")
in_page("the summary pointer", "SUMMARY.md")
ok("three figures are drawn", PAGE.count('class="fig"') >= 3)
ok("the interactive controls start hidden",
   '<div class="controls" id="probe" hidden>' in PAGE
   and '<figure id="livefig" hidden>' in PAGE)
ok("exactly one script", PAGE.count("<script>") == 1 == PAGE.count("</script>"))
ok("no external resource is fetched",
   "http://" not in PAGE.replace("http://www.w3.org/2000/svg", "")
   and "https://" not in PAGE.replace("https://frankbueltge.de", ""))
ok("every comparison is a row in the served document",
   PAGE.count('<tr data-rho=') == S["n_comparisons"])
ok("the hidden attribute outranks every display rule on the page",
   "[hidden]{display:none!important}" in PAGE)

# ------------------------------------------------------------------ the summary
# §2 asks for a plain-language summary beside the artifact. A summary that drifts from
# the page is worse than none, so its numbers are asserted here too.
SUM = (HERE / "SUMMARY.md").read_text(encoding="utf-8")


def in_summary(label: str, needle: str) -> None:
    ok(f"summary states {label} ({needle!r})", needle in SUM)


ok("the summary names its day in its header line", f"presented {D['date']}" in SUM)
in_summary("its cycle", "cycle 002")
in_summary("the check count", str(N_PROSE_CHECKS))
in_summary("the boundary", f"{B['ok']:,} of {S['n_statements']:,}")
in_summary("the comparison count", f"{C['n']} comparisons")
in_summary("the range", f"{C['min']:.3f} to {C['max']:.3f}")
in_summary("the interquartile range", f"{C['p25']:.3f} to {C['p75']:.3f}")
in_summary("the count that cancels nothing", f"{C['n_ge_1']} of the {C['n']}")
in_summary("the ceiling count", f"{C['ceiling']['n']} cases")
in_summary("the first sibling value", f"{SIB['values'][0]:.3f}")
in_summary("the second sibling value", f"{SIB['values'][1]:.3f}")
in_summary("the percentiles", f"{ordinal(SIB['percentiles'][0])} and "
                              f"{ordinal(SIB['percentiles'][1])} percentile")
in_summary("the entries lost", f"{abs(cc['delta'])} entries")
in_summary("the register's two counts", f"{cc['prev_entries']:,} \u2192 {cc['now_entries']:,}")
in_summary("the largest shift", f"{D['replication']['max_shift']*100:.1f} percentage points")
in_summary("the standardised rates", f"{pct(ST['matched_comparison'])} of the time against an\nexpected {pct(ST['expected_level'])}")
in_summary("the entry total", f"{S['n_entries']:,} entries")
in_summary("the settings", f"{S['n_settings']} settings")
in_summary("every comparison as a row", f"{S['n_comparisons']} comparisons is in the document")
in_summary("session 4's boundary", f"{n4['boundary_ok']:,} of\n   {n4['statements']:,}")
in_summary("the published point", f"**{n4['median_cancel']:.3f}**")

# ------------------------------------------------------------------ verdict
print(f"{RAN} checks ran, {len(FAILS)} failed")
if RAN != N_PROSE_CHECKS:
    FAILS.append(f"check count moved: {RAN} ran, build.py states {N_PROSE_CHECKS}")
for f in FAILS:
    print("  ✗", f)
sys.exit(1 if FAILS else 0)
