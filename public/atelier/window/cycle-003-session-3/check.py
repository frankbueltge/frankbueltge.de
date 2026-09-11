#!/usr/bin/env python3
"""Re-derives every number in the page from the record, and fails until they agree —
cycle 003, session 3.

Five kinds of check: (a) the arithmetic of the record against itself, including the
nesting the whole argument rests on; (b) that the record is exactly what the committed
probe says, recomputed from `probe.json` by the same instrument; (c) that the page is
**byte-identical to a fresh render of the record** — last night a substring check passed
a page in which a digit had been changed, because the old string still occurred
elsewhere, so this artifact re-renders and compares bytes rather than searching for
numbers; (d) that the entries this session reports on are still the ones session 1 read,
in a record this session did not write; and (e) that the page really is self-contained.

    python3 window/cycle-003-session-3/check.py

Exit 0 when the record, the probe and the page say the same thing; 1 otherwise, naming
every disagreement. Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "tools" / "second"))

import record as RC  # noqa: E402
from build import (  # noqa: E402
    ATLAS_SHA_SINCE_2026_09_03, DATE, RUNG_FILL, RUNG_LABEL, TITLE, build_data, render,
)

D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")
PROBE = json.loads((HERE / "probe.json").read_text(encoding="utf-8"))
# The feed itself is read live and never mirrored into this repository, so this check
# runs against the probe's own copy of what it asked about — which is the thing that has
# to be true for the page to be honest: that every graded row points at the entry it
# names. The digest and the entry count are checked against the committed record.
SESSION_2 = json.loads(
    (ROOT / "window" / "cycle-003-session-2" / "data.json").read_text(encoding="utf-8")
)

M = D["meta"]
N = D["n"]
L = {r["rung"]: r for r in D["work_ladder"]}
AL = {r["rung"]: r for r in D["artist_ladder"]}
B = {b["rung"]: b for b in D["bounds_by_rung"]}

fails: list[str] = []
n = 0


def ok(cond, what):
    global n
    n += 1
    if not cond:
        fails.append(what)


def close(a, b, tol=1e-9):
    return abs(a - b) <= tol


# --------------------------------------------------------------------------------- #
# (a) the record against itself
# --------------------------------------------------------------------------------- #

ok(N == len(D["grades"]), "n equals the number of graded entries")
ok(N == M["entries"], "n equals the entry count the feed declares")
ok(N == len(D["works"]), "one graded row per entry")

for r in ["unasked", "none"] + RC.RUNGS:
    ok(
        D["counts"][r] == sum(1 for g in D["grades"] if g == r),
        f"counts[{r}] is the number of entries at that rung",
    )
ok(sum(D["counts"].values()) == N, "the five states partition the catalogue")
ok(D["asked"] + D["unasked"] == N, "asked and unasked partition the catalogue")
ok(D["unasked"] == D["counts"]["unasked"], "the unasked count is the unasked state")

# The nesting is the argument: each standard of proof is a subset of the weaker one.
for i, r in enumerate(RC.RUNGS):
    keep = set(RC.RUNGS[i:])
    c = sum(1 for g in D["grades"] if g in keep)
    ok(L[r]["count"] == c, f"ladder[{r}] counts every entry at or above that rung")
    ok(L[r]["asked"] == D["asked"], f"ladder[{r}] divides by what was asked")
    ok(L[r]["unasked"] == D["unasked"], f"ladder[{r}] carries the unasked count")
    ok(close(L[r]["share"], c / D["asked"]) if D["asked"] else True,
       f"ladder[{r}] share is count over asked")
    ok(close(L[r]["lo"], c / N), f"ladder[{r}] lower end assumes every unasked a miss")
    ok(close(L[r]["hi"], (c + D["unasked"]) / N),
       f"ladder[{r}] upper end assumes every unasked a hit")
    ok(L[r]["lo"] <= L[r]["hi"], f"ladder[{r}] interval is not inverted")
    ok(close(L[r]["hi"] - L[r]["lo"], D["unasked"] / N),
       f"ladder[{r}] interval width is exactly the unasked fraction")
for a, b in zip(RC.RUNGS, RC.RUNGS[1:]):
    ok(L[a]["count"] >= L[b]["count"], f"the ladder never rises: {a} >= {b}")

ok(
    AL["name"]["count"] >= AL["person"]["count"],
    "the artist ladder never rises either",
)
ok(D["artists_n"] == len(PROBE["artists"]), "one artist row per distinct artist string")
ok(
    AL["name"]["n"] == D["artists_n"],
    "the artist ladder is computed over every artist string",
)

# The subset is exactly session 1's reading, and its ladder obeys the same rules.
ok(D["subset"]["n"] == len(D["absence_index"]), "the subset size is the reading's size")
for i, r in enumerate(RC.RUNGS):
    keep = set(RC.RUNGS[i:])
    c = sum(1 for x in D["subset"]["rows"] if x["rung"] in keep)
    ok(
        {x["rung"]: x for x in D["subset"]["ladder"]}[r]["count"] == c,
        f"the subset ladder at {r} counts its own rows",
    )
for r in RC.RUNGS:
    ok(
        {x["rung"]: x for x in D["subset"]["ladder"]}[r]["count"] <= L[r]["count"],
        f"the subset cannot reach {r} more often than the whole catalogue",
    )

# n2 is the sum of the parts, and the parts are the near classes.
ok(
    D["n2"] == sum(p["count"] for p in D["n2_parts"]),
    "n2 is the sum of its published parts",
)
ok(
    D["n2"] == sum(c["total"] for c in D["near_classes"]),
    "n2 is the sum of the near-class totals",
)
for c in D["near_classes"]:
    ok(
        c["total"] == sum(v for v in (c["P136"], c["P135"], c["P31"])
                          if isinstance(v, int)),
        f"near class {c['qid']} total is the sum of its three counts",
    )

# The capture-recapture arithmetic, and the derivative the page actually publishes.
for b in D["bounds_by_rung"]:
    m = b["m"]
    ok(b["n1"] == N, f"bound[{b['rung']}] uses the catalogue as the first list")
    ok(b["n2"] == D["n2"], f"bound[{b['rung']}] uses the near classes as the second")
    if m <= 0:
        ok(b["estimate"] is None, f"bound[{b['rung']}] is undefined at zero overlap")
    else:
        ok(close(b["estimate"], N * D["n2"] / m, 1e-6),
           f"bound[{b['rung']}] estimate is n1*n2/m")
        ok(close(b["swing"], abs(N * D["n2"] / m - N * D["n2"] / (m + 1)), 1e-6),
           f"bound[{b['rung']}] swing is the move from one more match")
        ok(close(b["chapman"], ((N + 1) * (D["n2"] + 1)) / (m + 1) - 1, 1e-6),
           f"bound[{b['rung']}] chapman is its own formula")
for a, b in zip(D["bounds_by_rung"], D["bounds_by_rung"][1:]):
    ok(a["m"] >= b["m"], "the overlap never rises as the standard of proof tightens")

# Every classed row is a real match at a real rung, carrying a real near class.
near_q = {c["qid"] for c in D["near_classes"]}
by_index = {w["index_in_feed"]: w for w in D["works"]}
for c in D["classed"]:
    ok(c["rung"] in RC.RUNGS, f"classed row {c['qid']} sits on a named rung")
    ok(set(c["classes"]) <= near_q, f"classed row {c['qid']} cites a probed class")
    ok(
        by_index.get(c["index_in_feed"], {}).get("qid") == c["qid"],
        f"classed row {c['qid']} is the item that entry actually matched",
    )

ok(
    D["homonymy"]["name_only"] == D["counts"]["name"],
    "the homonym count is the entries that get no further than a title",
)
ok(
    D["homonymy"]["total_candidates"] == sum(w["n_candidates"] for w in D["works"]),
    "the candidate total is the sum over entries",
)
ok(
    D["homonymy"]["searched_total"] >= D["homonymy"]["total_candidates"],
    "more items were returned by search than survived the normalisation rule",
)

# The second records that were knocked on, and the one that was chosen.
CAND = json.loads((HERE / "candidates.json").read_text(encoding="utf-8"))
ok(D["candidates"] == CAND, "the page's candidate list is the committed probe of them")
ok(len(CAND["candidates"]) >= 2, "more than one second record was considered")
chosen = [c for c in CAND["candidates"] if c["id"] == "wikidata"]
ok(len(chosen) == 1, "the record actually used is in the candidate list")
ok(
    chosen and chosen[0]["name"] == PROBE["second_record"]["name"],
    "the candidate list names the record the probe queried",
)
for c in CAND["candidates"]:
    ok(bool(c.get("judgement")), f"candidate {c['id']} carries a stated judgement")
    ok("probe" in c and "status" in c["probe"], f"candidate {c['id']} carries a status")

# --------------------------------------------------------------------------------- #
# (b) the record is what the committed probe says
# --------------------------------------------------------------------------------- #

fresh = RC.measure(PROBE, subset_index=D["absence_index"])
ok([w["rung"] for w in fresh["works"]] == D["grades"],
   "every grade recomputes from probe.json")
ok(fresh["n2_near_classes"] == D["n2"], "n2 recomputes from probe.json")
ok([b["m"] for b in fresh["bounds_by_rung"]] == [b["m"] for b in D["bounds_by_rung"]],
   "every overlap recomputes from probe.json")

# No grade may be claimed that the probe does not carry a witness for.
ents = PROBE["entities"]
for w in D["works"]:
    if w["rung"] in ("none", "unasked"):
        ok(w["qid"] is None,
           f"entry {w['index_in_feed']} at state {w['rung']} names no item")
        continue
    ok(w["qid"] in ents, f"entry {w['index_in_feed']} names an item the probe fetched")
    if w["rung"] in ("creator", "attributed"):
        ok(
            bool((ents[w["qid"]]["claims"] or {}).get("P170")),
            f"entry {w['index_in_feed']} at rung {w['rung']} has a creator statement",
        )
    if w["rung"] == "attributed":
        ok(bool(w["witness"]), f"entry {w['index_in_feed']} names the creator it matched")

# An unasked entry is one the probe recorded as unasked, never one that merely missed.
probe_unasked = {w["index_in_feed"] for w in PROBE["works"] if w.get("asked") is False}
ok(
    {w["index_in_feed"] for w in D["works"] if w["rung"] == "unasked"} == probe_unasked,
    "every unasked entry is one the probe wrote down as unasked",
)
if "reach" in PROBE and PROBE["reach"]:
    ok(D["reach"] == PROBE["reach"], "the page's reach is the probe's own account of it")

# The matching rule is the one the page says it is: an exact normalised equality.
checked = 0
for wp in PROBE["works"]:
    for c in wp["candidates"]:
        ok(
            RC.normalise(c["matched_text"]) == RC.normalise(wp["title"]),
            f"candidate {c['qid']} matches {wp['title']!r} exactly after normalisation",
        )
        checked += 1
        if checked >= 200:
            break
    if checked >= 200:
        break

# --------------------------------------------------------------------------------- #
# (c) the page is a fresh render of the record, byte for byte
# --------------------------------------------------------------------------------- #

rebuilt_data = build_data(M["entries"], M["feed_sha256"], PROBE)
ok(
    json.dumps(rebuilt_data, ensure_ascii=False, indent=1, sort_keys=True)
    == json.dumps(D, ensure_ascii=False, indent=1, sort_keys=True),
    "data.json is a fresh derivation of the probe and the feed",
)
ok(render(D) == PAGE, "index.html is byte-identical to a fresh render of data.json")

# --------------------------------------------------------------------------------- #
# (d) the entries reported on are still the ones session 1 read
# --------------------------------------------------------------------------------- #

s2_idx = [r["index_in_feed"] for r in SESSION_2["yes_rows"]]
ok(D["absence_index"] == s2_idx, "the subset is session 1's reading, unchanged")
ok(
    M["feed_sha256"] == SESSION_2["meta"]["feed_sha256"],
    "this session read the feed session 2 read",
)
ok(
    M["feed_sha256"] == ATLAS_SHA_SINCE_2026_09_03,
    "the feed is at the digest the build pins",
)
s2_by_index = {r["index_in_feed"]: r for r in SESSION_2["yes_rows"]}
for row in D["subset"]["rows"]:
    ok(
        row["title"] == s2_by_index[row["index_in_feed"]]["title"],
        f"subset entry {row['index_in_feed']} is the title session 1 read",
    )
probe_by_index = {w["index_in_feed"]: w for w in PROBE["works"]}
for w in D["works"]:
    p = probe_by_index.get(w["index_in_feed"])
    ok(p is not None, f"graded row {w['index_in_feed']} was actually probed")
    if p is not None:
        ok(p["title"] == w["title"] and p["artist"] == w["artist"],
           f"graded row {w['index_in_feed']} points at the entry the probe asked about")

# --------------------------------------------------------------------------------- #
# (e) the page stands on its own
# --------------------------------------------------------------------------------- #

ok(f"<title>{TITLE}</title>" in PAGE, "the page carries its title")
ok(DATE in PAGE, "the page carries its date")
ok("https://" in PAGE, "the page cites sources by URL")
for pat in (
    r"<script[^>]+src=",
    r"<link[^>]+stylesheet",
    r"<img",
    r"@import",
    r"fetch\(",
    r"XMLHttpRequest",
):
    ok(re.search(pat, PAGE) is None, f"the page loads nothing at runtime: {pat}")
ok(PAGE.count("<script") == 2, "one data island and one behaviour script, no more")
ok('id="stills"' in PAGE, "the no-script still frame is served")
ok(PAGE.index('id="stills"') < PAGE.index('id="livewrap"'),
   "the still frame is served before the interactive one")
ok('<div id="livewrap" hidden>' in PAGE, "the interactive frame is hidden by default")
for tid in ("tcand", "tnear", "tbound", "tsub"):
    ok(f'<table id="{tid}">' in PAGE, f"the page serves the table {tid} drawn")
for r in RC.RUNGS:
    ok(RUNG_LABEL[r] in PAGE, f"the page names the rung {r}")
    ok(RUNG_FILL[r] in PAGE, f"the page draws the rung {r}")

# --------------------------------------------------------------------------------- #

if fails:
    print(f"{len(fails)} of {n} checks failed:", file=sys.stderr)
    for f in fails:
        print("  FAIL " + f, file=sys.stderr)
    raise SystemExit(1)
print(f"{n} checks passed")
