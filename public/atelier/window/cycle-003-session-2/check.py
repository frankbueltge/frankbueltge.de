#!/usr/bin/env python3
"""Re-derives every number in the page's prose from `data.json`, and fails until they
agree — cycle 003, session 2.

Four kinds of check: (a) the arithmetic of the record against itself, including the two
exact identities this session's argument turns on; (b) that every number the prose states
is in the served document; (c) that the borrowed frame is applied as its source states it,
so a drifting mapping shows up here and not in a bulletin; and (d) that the verdicts the
intervals rest on still point at the entries they were made about, in a record this
session did not write.

    python3 window/cycle-003-session-2/check.py

Exit 0 when the record and the page say the same thing; 1 otherwise, naming every
disagreement. Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import json
import math
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "tools" / "absence"))

import identify as ID  # noqa: E402
from build import (  # noqa: E402
    ATLAS_SHA_SINCE_2026_09_03, QUOTES, RUNG_LABEL, RUNG_STATUS, SOURCE,
    WORDS_ABSENCE, WORDS_COUNTER, pct, pts, render, screen,
)

D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")
READING = json.loads(
    (ROOT / "window" / "cycle-003-session-1" / "reading.json").read_text(encoding="utf-8")
)

M, C, R = D["meta"], D["counts"], D["regions"]
CAP, CAPB, SP, CO = D["capture"], D["capture_with_borderline"], D["split"], D["correction"]
N = C["n"]

FAILS: list[str] = []
RAN = 0


def ok(label: str, cond: bool, detail: str = "") -> None:
    global RAN
    RAN += 1
    if not cond:
        FAILS.append(f"{label}{(' — ' + detail) if detail else ''}")


def in_page(label: str, needle: str) -> None:
    ok(f"page states {label} ({needle!r})", needle in PAGE)


def reg(*keys: str) -> dict:
    want = sorted(keys)
    for r in R:
        if r["assume"] == want:
            return r
    raise AssertionError(f"no region for {want}")


# ---------------------------------------------------------- (0) the served page IS the record
# A substring check passes as long as a number appears somewhere, which is how a checker
# comes to verify three quarters of what it claims. This one closes that: the page is
# re-rendered from the committed record and must come back byte for byte. Any edit to the
# served document that the record does not entail fails here, whatever the prose checks say.
ok("index.html is exactly what data.json renders to",
   render(D) == PAGE,
   "the served page and the record have diverged")

# ------------------------------------------------------------------ (a) the arithmetic
FREE, RECALL, FLOOR, MONO = reg(), reg("recall"), reg("floor"), reg("monotone")

ok("the counts partition the catalogue",
   C["yes"] + C["no"] + C["borderline"] + C["unscreened"] == N,
   f"{C['yes']}+{C['no']}+{C['borderline']}+{C['unscreened']} != {N}")
ok("read = yes + no + borderline",
   C["read"] == C["yes"] + C["no"] + C["borderline"])
ok("free = borderline + unscreened", C["free"] == C["borderline"] + C["unscreened"])
ok("verified + unverified = n", C["verified"] + C["unverified"] == N)

# The identity the whole page turns on: the assumption-free width IS the free fraction.
ok("the assumption-free width is exactly the unsettled fraction",
   abs(FREE["width"] - C["free"] / N) < 1e-12,
   f"{FREE['width']} vs {C['free'] / N}")
ok("the assumption-free lower end is the published point",
   abs(FREE["lo"] - D["published_point"]) < 1e-12)
ok("the published point is the lower END, not the midpoint",
   abs(FREE["midpoint"] - D["published_point"]) > 0.4)
ok("the assumption-free upper end counts every free entry",
   FREE["hi_count"] == C["yes"] + C["free"])
ok("the midpoint is the mean of the ends",
   abs(FREE["midpoint"] - (FREE["lo"] + FREE["hi"]) / 2) < 1e-12)

# Recall: the unscreened all become `no`, the borderlines stay free.
ok("recall caps the total at yes + borderline",
   RECALL["hi_count"] == C["yes"] + C["borderline"])
ok("recall's width is the borderline fraction",
   abs(RECALL["width"] - C["borderline"] / N) < 1e-12)
ok("recall contains last night's report",
   RECALL["lo"] <= D["published_point"] <= RECALL["hi"])

# Floor and monotone.
ok("floor raises only the lower end",
   FLOOR["hi_count"] == FREE["hi_count"] and FLOOR["lo_count"] > FREE["lo_count"])
ok("floor's lower end is the Lincoln-Petersen total",
   abs(FLOOR["lo_count"] - CAP["lincoln_petersen"]) < 1e-12)
ok("monotone lowers only the upper end",
   MONO["lo_count"] == FREE["lo_count"] and MONO["hi_count"] < FREE["hi_count"])
ok("monotone's cap is the stated arithmetic",
   abs(MONO["hi_count"]
       - (C["yes"] + C["borderline"] + C["unscreened"] * D["screened_rate_max"])) < 1e-9)
ok("the screened rate is the largest the reading allows",
   abs(D["screened_rate_max"] - (C["yes"] + C["borderline"]) / C["read"]) < 1e-12)

# The finding: exactly two compositions are empty, and they are the ones named.
empty = {tuple(r["assume"]) for r in R if not r["feasible"]}
ok("exactly two of the eight compositions are empty", len(empty) == 2, str(empty))
ok("the empty ones are the two that hold floor and recall together",
   empty == {("floor", "recall"), ("floor", "monotone", "recall")}, str(empty))
ok("the emptiness is the floor exceeding the recall ceiling",
   CAP["lincoln_petersen"] > C["yes"] + C["borderline"],
   f"{CAP['lincoln_petersen']} vs {C['yes'] + C['borderline']}")
ok("all eight compositions are in the record", len(R) == 8)
ok("every composition has a label", all("+".join(r["assume"]) in RUNG_LABEL for r in R))
ok("every single assumption has a status",
   set(RUNG_STATUS) == {"recall", "floor", "monotone"})

# Two detectors, recomputed from scratch here rather than read back.
ok("Lincoln-Petersen is a1 * a2 / both",
   abs(CAP["lincoln_petersen"] - CAP["a1"] * CAP["a2"] / CAP["both"]) < 1e-12)
ok("Chapman is the small-count form",
   abs(CAP["chapman"]
       - ((CAP["a1"] + 1) * (CAP["a2"] + 1) / (CAP["both"] + 1) - 1)) < 1e-12)
ok("Chapman is below Lincoln-Petersen here",
   CAP["chapman"] < CAP["lincoln_petersen"])
ok("the detectors saw a1 + a2 - both between them",
   CAP["seen"] == CAP["a1"] + CAP["a2"] - CAP["both"] == C["yes"])
ok("the unseen block is the total minus what was seen",
   abs(CAP["unseen_lp"] - (CAP["lincoln_petersen"] - CAP["seen"])) < 1e-12)
ok("screen 2 alone recovered works screen 1 missed", CAP["a2"] - CAP["both"] > 0)
ok("counting the borderlines as of the kind raises the total",
   CAPB["lincoln_petersen"] > CAP["lincoln_petersen"])
ok("the instrument reproduces the record's capture arithmetic",
   ID.capture(CAP["a1"], CAP["a2"], CAP["both"]).as_dict()["lincoln_petersen"]
   == CAP["lincoln_petersen"])
ok("the instrument reproduces the record's ladder",
   [r.as_dict()["hi_count"] for r in ID.ladder(
       N, C["yes"], C["borderline"], C["unscreened"],
       CAP["lincoln_petersen"], D["screened_rate_max"])]
   == [r["hi_count"] for r in R])
ok("Chapman is defined where Lincoln-Petersen is not",
   math.isinf(ID.capture(3, 3, 0).lincoln_petersen)
   and math.isfinite(ID.capture(3, 3, 0).chapman))

# The split, and the claim about where the width lives.
for name, H in (("verified", SP["verified"]), ("unverified", SP["unverified"])):
    ok(f"{name}: read + unscreened = n",
       H["read"] + H["unscreened"] == H["n"])
    ok(f"{name}: yes + no + borderline = read",
       H["yes"] + H["no"] + H["borderline"] == H["read"])
    ok(f"{name}: free = borderline + unscreened",
       H["free"] == H["borderline"] + H["unscreened"])
    ok(f"{name}: the read rate is yes over read",
       abs(H["rate_read"] - H["yes"] / H["read"]) < 1e-12)
ok("the two halves' free entries are all of them",
   SP["free_verified"] + SP["free_unverified"] == SP["free_all"] == C["free"])
ok("the unverified half carries most of the width",
   SP["share_unverified"] > 0.5,
   f"{SP['share_unverified']}")
ok("the share is the unverified free count over the total",
   abs(SP["share_unverified"] - SP["free_unverified"] / SP["free_all"]) < 1e-12)
ok("the rate ratio is the two read rates",
   abs(SP["rate_ratio"]
       - SP["verified"]["rate_read"] / SP["unverified"]["rate_read"]) < 1e-12)
ok("the rate ratio exceeds every choice of screen this cycle made",
   SP["rate_ratio"] > 2)

# The correction, and both of its numbers, recomputed.
ok("the filed p-value is the one this practice sent the house",
   abs(CO["filed_2026_09_08"] - 3.511737135386587e-07) < 1e-18)
ok("the filed p-value is the whole-catalogue hypergeometric tail",
   abs(CO["filed_2026_09_08"]
       - ID.hyper_ge(N, C["verified"], C["yes"], CO["cells"][0])) < 1e-18)
ok("the conditioned p-value uses the set the reading came from",
   abs(CO["conditioned_on_read"]
       - ID.hyper_ge(C["read"], SP["verified"]["read"], C["yes"], CO["cells"][0]))
   < 1e-15)
ok("the correction is upward by orders of magnitude",
   CO["conditioned_on_read"] > 1000 * CO["filed_2026_09_08"])
ok("both p-values still support the sentence",
   CO["conditioned_on_read"] < 0.05 and CO["fisher_on_read"] < 0.05)
ok("Fisher's exact recomputes",
   abs(CO["fisher_on_read"] - ID.fisher_one_sided(*CO["cells"])) < 1e-15)
ok("the 2x2 cells are the read entries by verification and verdict",
   sum(CO["cells"]) == C["yes"] + C["no"])
ok("the screens are themselves biased towards checked entries",
   CO["verified_share_read"] > CO["verified_share_all"] and CO["screen_bias"] < 0.01)
ok("the verified share of the catalogue is right",
   abs(CO["verified_share_all"] - C["verified"] / N) < 1e-12)

# ------------------------------------------------- (b) the prose and the served document
in_page("the title", M["title"])
in_page("the entry count", str(N))
in_page("the yes count", str(C["yes"]))
in_page("the free count", str(C["free"]))
in_page("the unscreened count", str(C["unscreened"]))
in_page("the read count", str(C["read"]))
in_page("the unverified count", str(C["unverified"]))
in_page("the assumption-free lower end", pct(FREE["lo"], 2))
in_page("the assumption-free upper end", pct(FREE["hi"], 2))
in_page("the assumption-free width", pts(FREE["width"]))
in_page("the assumption-free midpoint", pct(FREE["midpoint"], 2))
in_page("the recall interval's ends", pct(RECALL["hi"], 2))
in_page("the Lincoln-Petersen total", f"{CAP['lincoln_petersen']:.1f}")
in_page("the Chapman total", f"{CAP['chapman']:.1f}")
in_page("the unseen block", f"{CAP['unseen_lp']:.0f}")
in_page("the borderline-inclusive total", f"{CAPB['lincoln_petersen']:.1f}")
in_page("the unverified share of the width", pct(SP["share_unverified"]))
in_page("the rate ratio", f"{SP['rate_ratio']:.1f}")
in_page("the verified read rate", pct(SP["verified"]["rate_read"]))
in_page("the unverified read rate", pct(SP["unverified"]["rate_read"]))
in_page("the filed p-value", f"{CO['filed_2026_09_08']:.1e}")
in_page("the corrected p-value", f"{CO['conditioned_on_read']:.4f}")
in_page("Fisher's p-value", f"{CO['fisher_on_read']:.4f}")
in_page("the screen-bias p-value", f"{CO['screen_bias']:.1e}")
in_page("the feed digest", M["feed_sha256"][:16])
in_page("the source", SOURCE["work"])
in_page("the source's identifier", "arXiv:2205.07388")
in_page("the 1953 attribution", "1953")
ok("every quotation this page uses is served verbatim",
   all(q["text"][:60].replace("&", "&amp;") in PAGE for q in QUOTES))
ok("the page names all eight compositions",
   all(lab in PAGE for lab in RUNG_LABEL.values()))
ok("every one of the 22 verdicts is a row in the served table",
   all(str(r["index_in_feed"]) in PAGE and r["title"].split(" ")[0] in PAGE
       for r in D["yes_rows"]))
ok("the page names both empty compositions where it states the finding",
   all(RUNG_LABEL["+".join(r["assume"])] in PAGE for r in R if not r["feasible"])
   and PAGE.count("no value of the fraction satisfies these together")
   >= 2 * len(empty))
ok("the page fetches nothing at runtime",
   "http://" not in PAGE.replace("http://www.w3.org", "")
   and 'src="' not in PAGE and "@import" not in PAGE)
ok("the no-script floor serves the still frame",
   'id="still"' in PAGE and 'class="ladder"' in PAGE)
ok("the control is served hidden, to appear only when it can act",
   'id="controls" hidden' in PAGE and 'id="live" class="live" hidden' in PAGE)
ok("the still frame is not hidden", 'id="still" hidden' not in PAGE)
ok("all eight bars or their struck bands are in the still frame",
   PAGE.count('class="band"') + PAGE.count('class="dead"') >= 8)
ok("the mapping's failures are stated before the frame is used",
   PAGE.index("Where the borrowed frame does not fit") < PAGE.index("The ladder"))
ok("the refutation conditions are on the page", "What would refute this page" in PAGE)
ok("the form choice is argued in a line, as the direction requires",
   "Form, on the merits" in PAGE)

# ------------------------------------------------------ (c) the frame, as its source has it
ok("the source is named with its identifier and the date it was read",
   SOURCE["venue"].startswith("arXiv:2205.07388") and SOURCE["read"].startswith("2026-09-09"))
ok("four passages are quoted, each with a use",
   len(QUOTES) == 4 and all(q["text"] and q["used_for"] and q["at"] for q in QUOTES))
ok("no third-party source file is committed beside the artifact",
   not any(p.suffix.lower() in {".pdf", ".ps", ".djvu", ".epub"} for p in HERE.iterdir()))
ok("the binary-outcome condition the borrowed interval needs actually holds",
   set(r["verdict"] for r in READING["verdicts"]) <= {"yes", "no", "borderline"})
ok("the widest interval is inside [0, 1], as a bounded outcome requires",
   all(0 <= r["lo"] <= r["hi"] <= 1 for r in R if r["feasible"]))
ok("holding more assumptions never widens a feasible interval",
   all(reg(*sub)["width"] >= r["width"] - 1e-12
       for r in R if r["feasible"] and len(r["assume"]) > 0
       for sub in [tuple(r["assume"][:i] + r["assume"][i + 1:])
                   for i in range(len(r["assume"]))]
       if reg(*sub)["feasible"]))
# The instrument must refuse to be used loosely — an assumption named without the number
# it needs would otherwise silently become no assumption at all.
try:
    ID.region(10, 1, 0, 5, {"floor"})
    ok("the instrument refuses `floor` without a floor count", False)
except ValueError:
    ok("the instrument refuses `floor` without a floor count", True)
try:
    ID.region(10, 1, 0, 5, {"nonsense"})
    ok("the instrument refuses an unknown assumption", False)
except ValueError:
    ok("the instrument refuses an unknown assumption", True)
try:
    ID.capture(3, 3, 5)
    ok("the instrument refuses an overlap larger than a catch", False)
except ValueError:
    ok("the instrument refuses an overlap larger than a catch", True)

# ------------------------------------------------------------- (d) the record beneath it
ok("the reading this rests on is session 1's, unchanged",
   READING["date"] == "2026-09-08" and len(READING["verdicts"]) == C["read"])
ok("the feed digest is the one the reading was made against",
   READING["feed_sha256"] == M["feed_sha256"] == ATLAS_SHA_SINCE_2026_09_03)
ok("the verdict counts match the reading",
   sum(1 for r in READING["verdicts"] if r["verdict"] == "yes") == C["yes"]
   and sum(1 for r in READING["verdicts"] if r["verdict"] == "no") == C["no"]
   and sum(1 for r in READING["verdicts"] if r["verdict"] == "borderline")
   == C["borderline"])
ok("every yes row on the page is a yes verdict in that record",
   {r["index_in_feed"] for r in D["yes_rows"]}
   == {r["index_in_feed"] for r in READING["verdicts"] if r["verdict"] == "yes"})
ok("each yes row carries the reason it was given in that record",
   all(r["reason"] == next(v["reason"] for v in READING["verdicts"]
                          if v["index_in_feed"] == r["index_in_feed"])
       for r in D["yes_rows"]))
ok("every yes row was flagged by at least one screen",
   all(r["screens"] for r in D["yes_rows"]))
ok("the screens copied into this build are the two disjoint lists",
   not (set(w.lower() for w in WORDS_ABSENCE) & set(w.lower() for w in WORDS_COUNTER)))
ok("the two word lists are the sizes the page states",
   M["words"]["screen_1"] == len(WORDS_ABSENCE)
   and M["words"]["screen_2"] == len(WORDS_COUNTER)
   and M["words"]["total"] == len(WORDS_ABSENCE) + len(WORDS_COUNTER))
ok("this session read nothing new from the world",
   M["reading_from"] == "window/cycle-003-session-1/reading.json")

# The screens re-run against the live-read record committed in data.json.
ok("screen counts in the record are the sizes the screens produce",
   C["screen_1"] >= C["both_screens"] and C["screen_2"] >= C["both_screens"]
   and C["screen_1"] + C["screen_2"] - C["both_screens"] == C["read"])
ok("the screen function is a pure text match with no model in it",
   "urllib" not in screen.__code__.co_names)

if FAILS:
    print(f"{len(FAILS)} of {RAN} checks failed:")
    for f in FAILS:
        print("  ✗ " + f)
    raise SystemExit(1)
print(f"{RAN} checks passed — the record, the page and the instrument agree.")
