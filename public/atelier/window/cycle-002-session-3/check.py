#!/usr/bin/env python3
"""check.py — the page must not disagree with the record it was built from.

Two jobs, and neither of them is a re-run of `build.py`:

1. **Internal consistency of `data.json`.** Every derived quantity is recomputed from
   the primitives beside it — the residual against the distinct count and the floor,
   the concentration against the residual, the entropy against its bounds, each flag
   against the numbers that raise it, and the removable set against the determinations
   it was built from. A build that wrote a number it did not derive fails here.

2. **The prose agrees with the record.** Every number this session states in
   `index.html` is asserted to be present in the form the record gives it. A sentence
   edited by hand until it read better, and away from the data, fails here.

It is not an independent implementation and does not claim to be: the same practice
wrote both sides. The refutation condition on the page asks for the independent one.

    python3 window/cycle-002-session-3/check.py

Exit 0 and a count of checks passed, or exit 1 and the first disagreement.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import json
import math
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
DATA = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")

SESSION2_ATLAS_SHA = "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"

fails: list[str] = []
n_checks = 0


def ok(cond: bool, what: str) -> None:
    global n_checks
    n_checks += 1
    if not cond:
        fails.append(what)


def close(a: float, b: float, what: str, tol: float = 1e-6) -> None:
    ok(abs(a - b) <= tol * max(1.0, abs(b)), f"{what}: {a} != {b}")


def in_page(s: str, what: str) -> None:
    ok(s in PAGE, f"page does not state {what}: expected the string {s!r}")


CATS = {c["catalogue"]: c for c in DATA["catalogues"] if "fields" in c}
S = DATA["summary"]
NS = DATA["prose_numbers"]

# --------------------------------------------------------------------------------- #
# 1. data.json is internally consistent
# --------------------------------------------------------------------------------- #

for name, cat in CATS.items():
    n = cat["entries"]
    ok(n > 0, f"{name}: no entries")
    ok(len(cat["fields"]) == cat["field_count"], f"{name}: field_count disagrees with fields")
    ok(len(cat["sha256"]) == 64, f"{name}: sha256 is not a digest")

    kept_check = {f["field"] for f in cat["fields"]}
    for f in cat["fields"]:
        w = f"{name}.{f['field']}"

        ok(f["n"] == n, f"{w}: n disagrees with the catalogue")
        ok(f["filled"] + f["empty"] == n, f"{w}: filled + empty != n")
        ok(0 <= f["distinct"] <= f["filled"], f"{w}: distinct outside 0..filled")
        ok(f["modal_count"] <= f["filled"], f"{w}: modal count exceeds filled")

        # the residual lives between 1 and n, and never below its own analytic floor
        ok(1.0 <= f["residual"] <= n + 1e-9, f"{w}: residual {f['residual']} outside 1..{n}")
        close(f["residual_floor"], n / max(1, f["distinct"] + (1 if f["empty"] else 0)),
              f"{w}: floor is not n/k")
        close(f["concentration"], f["residual"] / f["residual_floor"], f"{w}: concentration")
        ok(f["concentration"] >= 1.0 - 1e-9, f"{w}: concentration below 1 — under the even spread")
        ok(0.0 <= f["entropy_norm"] <= 1.0 + 1e-9, f"{w}: normalised entropy outside 0..1")

        # constancy, and what it forces
        ok(f["constant"] == (f["distinct"] == 1 and f["filled"] == n), f"{w}: constant flag")
        if f["constant"]:
            close(f["residual"], n, f"{w}: a constant column must leave every entry standing")
            ok(f["determined_by"] == [], f"{w}: a constant column must have no determinant")

        # flags follow from the numbers, and nothing else
        ok(("constant" in f["flags"]) == f["constant"], f"{w}: constant flag/flags")
        ok(("absent" in f["flags"]) == (f["filled"] / n < 0.05), f"{w}: absent flag")
        ok(("redundant" in f["flags"]) == bool(f["determined_by"]), f"{w}: redundant flag")
        ok(("off-kind" in f["flags"]) == bool(f["kind"] and f["kind"]["failing"] > 0),
           f"{w}: off-kind flag")
        ok(f["verdict"] == (f["flags"][0] if f["flags"] else "carries"), f"{w}: verdict")

        # kind checks add up, and a determinant is never a near-key
        if f["kind"]:
            k = f["kind"]
            ok(k["conforming"] + k["failing"] == k["checked"], f"{w}: kind counts do not add up")
            ok(k["checked"] <= f["filled"], f"{w}: kind checked more cells than are filled")
            ok(len(k["failing_examples"]) <= 3, f"{w}: too many examples kept")
            ok(bool(k["failing_examples"]) == (k["failing"] > 0), f"{w}: examples/failing disagree")
        for d in f["determined_by"]:
            dd = next(x for x in cat["fields"] if x["field"] == d["field"])
            ok(dd["residual"] >= 2.0, f"{w}: determinant {d['field']} is a near-key")
            ok(dd["distinct"] > 1, f"{w}: determinant {d['field']} is constant")
            ok(d["mutual"] == (dd["distinct"] == f["distinct"]), f"{w}: mutual flag on {d['field']}")

    # the removable set: every removed column is constant or fixed by a column that stayed
    kept = {f["field"] for f in cat["fields"] if not f["removable"]}
    for f in cat["fields"]:
        if f["removable"]:
            ok(f["constant"] or any(d["field"] in kept for d in f["determined_by"]),
               f"{name}.{f['field']}: removable but nothing kept determines it")
        else:
            ok(not f["constant"], f"{name}.{f['field']}: constant but not removable")
    ok(len(kept) == cat["field_count"] - S[name]["removable"], f"{name}: removable count")

# the summary is the sum of the parts
ok(S["catalogues"] == len(CATS), "summary: catalogue count")
ok(S["entries_total"] == sum(c["entries"] for c in CATS.values()), "summary: entries")
ok(S["fields_total"] == sum(c["field_count"] for c in CATS.values()), "summary: fields")
ok(S["removable"] == sum(S[k]["removable"] for k in CATS), "summary: removable")
ok(sum(S["by_verdict"].values()) == S["fields_total"], "summary: verdicts partition the columns")

# the dials
act = DATA["dials"]["atlas"]["act"]
ok(len(act) == 4, "act sweep: four settings")
for a in act:
    ok(a["opens_with_act"] + a["does_not"] == CATS["atlas"]["entries"], "act sweep: rows add up")
ok(all(act[i]["opens_with_act"] >= act[i + 1]["opens_with_act"] for i in range(3)),
   "act sweep: a stricter threshold cannot find more acts")
live = [a for a in act if a["lexicon"] > 0]
ok(S["act_band"]["low"] == min(a["opens_with_act"] for a in live), "act band: low edge")
ok(S["act_band"]["high"] == max(a["opens_with_act"] for a in live), "act band: high edge")
ok(S["act_band"]["low"] <= 95 <= S["act_band"]["high"],
   "act band: session 2's number must lie inside it — that is the finding")
ok(S["act_band"]["degenerate"] == [4], "act band: the empty-lexicon setting is named")

nk = DATA["dials"]["datasets"]["nearkey"]
ok(len({tuple(x["fields"]) for x in nk if x["cutoff"] >= 1.5}) == 1,
   "near-key sweep: the answer must be stable from 1.5 up — that is the claim on the page")
ok(nk[0]["redundant_fields"] > nk[1]["redundant_fields"],
   "near-key sweep: cutoff 1.0 must over-report, or the guard is pointless")

yr = DATA["dials"]["papers"]["year"]["jahr"]
ok(yr[-1]["failing"] == 0, "year sweep: widening the era must clear the one failure")

reader = DATA["dials"]["datasets"]["reader"]
ok(len(reader) == 4, "reader hypotheses: four were stated")
for h in reader:
    ok(h["exact"] == (h["holds"] == h["of"]), f"reader hypothesis {h['claim']!r}: exact flag")
    ok(h["holds"] <= h["of"], f"reader hypothesis {h['claim']!r}: holds exceeds rows")
ok(sum(1 for h in reader if h["exact"]) == 2,
   "reader hypotheses: two of the four are exact — the page says so")

# the sha identity that finding 2 rests on
ok(CATS["atlas"]["sha256"] == SESSION2_ATLAS_SHA,
   "the atlas feed is no longer the file session 2 read — finding 2 must be restated, not republished")

# --------------------------------------------------------------------------------- #
# 2. the prose says what the record says
# --------------------------------------------------------------------------------- #

in_page(f"{S['removable']} of the {S['fields_total']} columns", "the headline removable count")
in_page(f"{S['datasets']['removable']} of those {S['removable']}", "the register's share of it")
in_page(f"{NS['ds_removable_total']} of the register's {S['datasets']['fields']}", "check E's total")
in_page(f"{S['act_band']['low']} to\n{S['act_band']['high']}", "the act band")
in_page(str(NS["act_not_2"]), "tonight's act count")
in_page("426", "session 2's published count, quoted as it was published")
in_page(SESSION2_ATLAS_SHA[:24], "the sha the identity claim rests on")
in_page(f"{NS['ds_geprueft']} of them", "the geprueft count")
in_page(f"{NS['pa_urteil']} of {CATS['papers']['entries']} rows", "the verdict column's fill")
in_page(f"{NS['titel_host']} of {CATS['datasets']['entries']}", "titel/host, the hypothesis that failed")
in_page(f"{NS['at_verified']} of the atlas's {CATS['atlas']['entries']}", "the Studio's verified count")
in_page(f"All {NS['rhizome_n']} Rhizome ArtBase", "the inherited-status example")
in_page(f"{NS['move_distinct']} distinct values", "decisive_move's distinctness, the near-key defect")
in_page("lucretius-de-rerum-natura", "the year check's one failure, named")
in_page(NS["bad_url"][:40], "the address check's false implication, quoted")

# every column of every catalogue is written into the document, so the no-JS floor is whole
for name, cat in CATS.items():
    for f in cat["fields"]:
        ok(f'<td class="tok">{f["field"]}</td>' in PAGE,
           f"no-JS floor: {name}.{f['field']} is missing from the static table")
        ok(f'data-verdict="{f["verdict"]}"' in PAGE, f"no-JS floor: verdict rows for {name}")

# the page is self-contained: nothing is fetched, no library, no font
for bad, why in (
    ("http://", "an insecure URL"),
    ("<script src", "an external script"),
    ("fonts.googleapis", "a web font"),
    ("cdn.", "a CDN"),
):
    ok(bad not in PAGE.replace("http://hdl.handle.net", "").replace("http:// or https://", ""),
       f"the page is not self-contained: it contains {why}")
ok("fetch(" not in PAGE, "the page fetches at runtime")
ok(PAGE.count("<svg") == len(CATS), "one figure per catalogue")

# --------------------------------------------------------------------------------- #

if fails:
    print(f"FAILED after {n_checks} checks — {len(fails)} disagreement(s):", file=sys.stderr)
    for f in fails[:20]:
        print("  ·", f, file=sys.stderr)
    if len(fails) > 20:
        print(f"  … and {len(fails) - 20} more", file=sys.stderr)
    raise SystemExit(1)

print(f"{n_checks} checks passed.")
