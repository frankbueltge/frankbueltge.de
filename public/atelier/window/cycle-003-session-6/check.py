#!/usr/bin/env python3
"""check.py — every number on the page, recomputed from cells.json without build.py.

The page's whole claim is that a catalogue's count of its own holes is not one number, so the
one thing this file must not do is trust the number the page prints. It re-derives each one
from the committed bitmaps by its own route, and it also reads the rendered HTML, because a
correct data.json beside a page that prints something else is the failure this practice has
actually made before.

    python3 window/cycle-003-session-6/check.py

Offline. No network, no import of build.py.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
from collections import Counter
from fractions import Fraction

HERE = pathlib.Path(__file__).resolve().parent

CELLS = json.loads((HERE / "cells.json").read_text("utf-8"))
DATA = json.loads((HERE / "data.json").read_text("utf-8"))
HTML = (HERE / "index.html").read_text("utf-8")

OK = 0
BAD: list[str] = []


def check(name: str, cond: bool) -> None:
    global OK
    if cond:
        OK += 1
    else:
        BAD.append(name)


def thin(n: int) -> str:
    """The page's own number format: a thin space as the thousands separator."""
    return f"{n:,}".replace(",", " ")


def on_page(n: int, label: str) -> None:
    check(f"page prints {label} = {n}", thin(n) in HTML or str(n) in HTML)


# ---------------------------------------------------------------- 1. the bitmaps

feeds = {f["key"]: f for f in CELLS["feeds"]}
check("three feeds measured", len(CELLS["feeds"]) == 3)
check("the measurement is dated 2026-09-14", CELLS["date"] == "2026-09-14")

for key, expect_n in (("atlas", 521), ("papers", 1064), ("datasets", 82)):
    f = feeds[key]
    check(f"{key}: rows match the entry count", len(f["rows"]) == f["n"])
    check(f"{key}: the feed's own declared count agrees", f["declared_count"] == f["n"])
    check(f"{key}: n is {expect_n}", f["n"] == expect_n)
    check(f"{key}: sha256 recorded", re.fullmatch(r"[0-9a-f]{64}", f["sha256"]) is not None)
    check(f"{key}: no row names a field outside the schema",
          all(set(r["miss"]) <= set(f["schema"]) for r in f["rows"]))
    check(f"{key}: no row repeats a field",
          all(len(r["miss"]) == len(set(r["miss"])) for r in f["rows"]))
    check(f"{key}: host class is one of four labels",
          {r["host"] for r in f["rows"]} <= {"arxiv", "doi", "other", "none"})

check("cells.json carries no catalogue content",
      not re.search(r'"(title|titel|artist|urheber|decisive_move|source_url|zugriff_url)"\s*:',
                    (HERE / "cells.json").read_text("utf-8")))

# ---------------------------------------------------------------- 2. the totals

cells = sum(len(r["miss"]) for f in feeds.values() for r in f["rows"])
entries_with_gap = sum(1 for f in feeds.values() for r in f["rows"] if r["miss"])
records = sum(f["n"] for f in feeds.values())
slots = sum(f["n"] * len(f["schema"]) for f in feeds.values())
patterns = sum(len({tuple(r["miss"]) for r in f["rows"] if r["miss"]}) for f in feeds.values())

check("total empty cells = 2489", cells == 2489)
check("total entries with a gap = 1641", entries_with_gap == 1641)
check("total records = 1667", records == 1667)
check("total slots = 20935", slots == 20935)
check("distinct patterns = 14", patterns == 14)
check("data.json agrees on cells", DATA["totals"]["cells"] == cells)
check("data.json agrees on entries with a gap", DATA["totals"]["entries_with_gap"] == entries_with_gap)
check("data.json agrees on records", DATA["totals"]["records"] == records)
check("data.json agrees on slots", DATA["totals"]["slots"] == slots)
check("data.json agrees on patterns", DATA["totals"]["patterns"] == patterns)
check("more slots than holes", cells < slots)
check("no entry can be empty in more slots than the schema has",
      all(len(r["miss"]) <= len(f["schema"]) for f in feeds.values() for r in f["rows"]))
for n, label in ((cells, "cells"), (entries_with_gap, "entries with a gap"),
                 (records, "records"), (slots, "slots"), (patterns, "patterns")):
    on_page(n, label)

# ---------------------------------------------------------------- 3. the five readings

R = {r["id"]: r for r in DATA["readings"]}
check("five readings published", len(DATA["readings"]) == 5)
check("R1 = every empty slot", R["R1"]["value"] == cells)
check("R2 = every record carrying a gap", R["R2"]["value"] == entries_with_gap)
check("R3 = distinct patterns", R["R3"]["value"] == patterns)

ds_cells = sum(len(r["miss"]) for r in feeds["datasets"]["rows"])
optional_note = sum(1 for r in feeds["atlas"]["rows"] if "curator_note" in r["miss"])
check("datasets contributes 61 cells", ds_cells == 61)
check("absent curator's notes = 519", optional_note == 519)
check("R4 = R1 minus the datasets cells minus the absent notes",
      R["R4"]["value"] == cells - ds_cells - optional_note)
check("R4 = 1909", R["R4"]["value"] == 1909)

shape = {"urheber", "jahr", "ort", "felder", "urteil"}
shape_rows = [r for r in feeds["papers"]["rows"] if set(r["miss"]) == shape]
check("21 entries carry the identical five-field shape", len(shape_rows) == 21)
check("all of them resolve to one host", len({r["host"] for r in shape_rows}) == 1)
check("that host is arxiv", shape_rows[0]["host"] == "arxiv")
check("the shape is 105 cells", len(shape_rows) * len(shape) == 105)
check("R5 = R4 with that shape counted once",
      R["R5"]["value"] == R["R4"]["value"] - len(shape_rows) * len(shape) + 1)
check("R5 = 1805", R["R5"]["value"] == 1805)

vals = [r["value"] for r in DATA["readings"]]
check("every reading is a positive integer", all(isinstance(v, int) and v > 0 for v in vals))
check("the five readings are five different numbers", len(set(vals)) == 5)
check("the spread's low is the smallest reading", DATA["spread"]["low"] == min(vals))
check("the spread's high is the largest reading", DATA["spread"]["high"] == max(vals))
sp = Fraction(max(vals), min(vals))
check("the spread is exactly 2489/14", sp == Fraction(2489, 14))
check("the spread is recorded as a reduced fraction",
      (DATA["spread"]["num"], DATA["spread"]["den"]) == (sp.numerator, sp.denominator))
check("the spread rounds to 177.8", f'{DATA["spread"]["float"]:.1f}' == "177.8")
check("the page prints the spread", "177.8" in HTML)
check("every reading states its rule and why it is defensible",
      all(r["rule"] and r["why_defensible"] for r in DATA["readings"]))
for r in DATA["readings"]:
    on_page(r["value"], r["id"])

# ---------------------------------------------------------------- 4. an empty cell is not an absence

NA = DATA["not_an_absence"]
check("the probe note is empty on 56 entries", NA["blank_note"] == 56)
check("all 56 sit on a probe that returned 200", NA["blank_note_with_probe_ok"] == 56)
check("there are exactly 56 such probes", NA["probe_ok"] == 56)
check("the probe status is empty on 5 entries", NA["blank_status"] == 5)
check("all 5 carry a note instead", NA["blank_status_with_note"] == 5)
check("the two together are the whole feed's emptiness",
      NA["blank_note"] + NA["blank_status"] == ds_cells)
check("so the datasets register has 61 empty cells and no gap", NA["total"] == 61)
dsf = {k: sum(1 for r in feeds["datasets"]["rows"] if k in r["miss"])
       for k in feeds["datasets"]["schema"]}
check("only two datasets fields are ever empty",
      sorted(k for k, v in dsf.items() if v) == ["pruef_status", "pruef_vermerk"])

# ---------------------------------------------------------------- 5. the ledger

C = {c["id"]: c for c in DATA["classes"]}
check("fourteen classes", len(DATA["classes"]) == 14)
check("every class carries frame, holder, ground and evidence",
      all(isinstance(c["frame"], bool) and isinstance(c["holder"], bool)
          and isinstance(c["ground"], bool) and c["evidence"] for c in DATA["classes"]))
check("a class has a size exactly when it has a frame",
      all((c["u"] is not None and c["n"] is not None) == c["frame"] for c in DATA["classes"]))
check("no class claims a share above 1",
      all(c["share"] is None or 0 <= c["share"] <= 1 for c in DATA["classes"]))
check("12 classes are framed", DATA["countability"]["framed"] == 12)
check("2 are not", DATA["countability"]["unframed"] == 2)
check("4 name a holder", DATA["countability"]["held"] == 4)
check("the same 4 publish a ground", DATA["countability"]["held_equals_grounded"] is True)
check("one held class has no size", DATA["countability"]["held_and_unframed"] == 1)
check("nine unheld classes are exact", DATA["countability"]["unheld_and_framed"] == 9)
check("the counterexample is the blocked-address class",
      [c["id"] for c in DATA["classes"] if c["holder"] and not c["frame"]] == ["D4"])
check("the unbounded world quantity carries neither", not C["W1"]["holder"] and not C["W1"]["frame"])

# every counted class must agree with the bitmaps
FIELD_OF = {
    "A1": ("atlas", "clusters"), "A2": ("atlas", "curator_note"),
    "P2": ("papers", "urteil"), "P3": ("papers", "felder"), "P4": ("papers", "ort"),
    "P5": ("papers", "urheber"), "P6": ("papers", "jahr"),
    "D1": ("datasets", "pruef_vermerk"), "D2": ("datasets", "pruef_status"),
}
for cid, (fk, field) in FIELD_OF.items():
    want = sum(1 for r in feeds[fk]["rows"] if field in r["miss"])
    check(f"{cid} counts the {field} column of {fk}", C[cid]["u"] == want)
    check(f"{cid} uses that feed's n as its denominator", C[cid]["n"] == feeds[fk]["n"])

check("the counted classes account for every empty cell",
      sum(C[cid]["u"] for cid in FIELD_OF) == cells)

CU = DATA["custody"]
check("13 addresses are blocked", CU["blocked"] == 13)
check("every one of them publishes its ground", CU["blocked_with_ground"] == CU["blocked"])
check("every one of them names its host", CU["blocked_with_host"] == CU["blocked"])

runs = DATA["runs"]
check("record order gives two blocks", runs["record"] == 2)
check("sorting by frame keeps two", runs["frame"] == 2)
check("sorting by holder breaks it", runs["holder"] > 2)
check("sorting by ground breaks it the same way", runs["ground"] == runs["holder"])

# recompute the runs by an independent route
def runs_of(key):
    seq = DATA["classes"] if key is None else sorted(
        DATA["classes"], key=lambda c: (0 if c[key] else 1, DATA["classes"].index(c)))
    out, last = 0, None
    for c in seq:
        v = bool(c["frame"])
        if v != last:
            out += 1
            last = v
    return out

for key, name in ((None, "record"), ("frame", "frame"), ("holder", "holder"), ("ground", "ground")):
    check(f"runs recomputed for {name}", runs_of(key) == runs[name])

# ---------------------------------------------------------------- 6. the one shape

OS = DATA["one_shape"]
arx_rows = [r for r in feeds["papers"]["rows"] if r["host"] == "arxiv"]
check("195 entries resolve to that host", OS["sibling_entries"] == len(arx_rows) == 195)
check("21 of them are empty in the venue", OS["sibling_without_venue"] == 21)
check("and those 21 are exactly the five-field shape", OS["entries"] == 21)
check("the shape's own cells are 105", OS["cells"] == 105)
check("173 of the host's entries name it as their venue", OS["sibling_venue_is_arxiv"] == 173)
check("174 name some venue", OS["sibling_with_venue"] == 174)
check("venue-bearing plus venue-less is the whole host",
      OS["sibling_with_venue"] + OS["sibling_without_venue"] == OS["sibling_entries"])
check("the shape sits on one host only", OS["single_host"] is True)
check("21 empty-venue arxiv rows counted from the bitmaps",
      sum(1 for r in arx_rows if "ort" in r["miss"]) == 21)

# ---------------------------------------------------------------- 7. the ground ledger

GL = DATA["ground_ledger"]
check("the ground ledger counts the same cells", GL["cells"] == cells)
check("no empty cell carries a per-entry ground", GL["cells_with_per_entry_ground"] == 0)
check("the two grounds that exist are stated at feed level", GL["feed_level_grounds"] == 2)
grounded_ids = {c["id"] for c in DATA["classes"] if c["ground"]}
check("no grounded class is one of the counted empty-cell columns",
      grounded_ids.isdisjoint(set(FIELD_OF)))

# ---------------------------------------------------------------- 8. the page itself

check("page is self-contained: no external load",
      not re.search(r'(src|href)\s*=\s*["\']https?://', HTML))
check("page performs no fetch", "fetch(" not in HTML and "XMLHttpRequest" not in HTML)
check("page carries a no-script floor for both figures", HTML.count("<noscript>") == 2)
check("figure 1 is drawn without the script",
      HTML.count('<span class="dot"></span>') == cells)
check("the ledger's rows are in the HTML", HTML.count('data-frame="') == 14)
check("the hatched no-denominator bar appears twice", HTML.count("bar bar-none") == 2)
check("the run counts stand in the HTML without the script", 'data-runs="2"' in HTML)
check("every feed's hash is printed", all(f["sha256"][:12] in HTML for f in CELLS["feeds"]))
check("the signature is on the page", "ulysses@ulysses.invalid" in HTML)
check("the date is on the page", "2026-09-14" in HTML)
check("the refutation condition is named", "Refutation condition" in HTML)
check("the correction to 2026-09-13 is named", "2026-09-13" in HTML)
check("the dossier consulted is cited", "SITUATED-APPARATUS" in HTML)
check("Haraway is cited with the published version",
      "Feminist Studies" in HTML and "1988" in HTML)
check("the sibling's theorem is attributed", "session 135" in HTML)
check("the page names no tool or vendor",
      not re.search(r"(?i)\b(openai|anthropic|claude|gpt|gemini|copilot|llm)\b", HTML))
check("the page is in English",
      not re.search(r"(?i)\b(nicht|Absenz|Katalog|Lücke)\b", re.sub(r"<code>.*?</code>", "", HTML, flags=re.S)))

# ---------------------------------------------------------------- report

print(f"{OK + len(BAD)} checks · {OK} pass · {len(BAD)} fail")
for b in BAD:
    print("  FAIL:", b)
sys.exit(1 if BAD else 0)
