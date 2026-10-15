#!/usr/bin/env python3
"""check.py — the cycle 003 presentation, checked against the record it presents.

Re-derives every number on the page from the four committed session records WITHOUT
importing `build.py`, then reads the built page and requires it to say the same thing. The
arithmetic here is done in exact rationals, so a claim about an identity is tested as an
identity and not as a rounding.

    python3 presentations/cycle-003/check.py

Exit status 0 if every check passes; 1 otherwise, with the failures listed.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import hashlib
import json
import pathlib
import re
import sys
from fractions import Fraction

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent

FAILS: list[str] = []
N = 0


def ck(cond: bool, msg: str) -> None:
    global N
    N += 1
    if not cond:
        FAILS.append(msg)


def load(path: pathlib.Path):
    raw = path.read_bytes()
    return json.loads(raw), hashlib.sha256(raw).hexdigest()


# --- the four sources, read again here -------------------------------------

S, SHA = {}, {}
for s in (1, 2, 3, 4):
    S[s], SHA[s] = load(ROOT / "window" / f"cycle-003-session-{s}" / "data.json")

D = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")

for s in (1, 2, 3, 4):
    rec = D["meta"]["sources"][str(s)]
    ck(rec["sha256"] == SHA[s], f"source sha256 for session {s} does not match the file")
    ck(rec["path"] == f"window/cycle-003-session-{s}/data.json",
       f"source path for session {s} is not the session record")

# --- the ledger, re-derived from first principles --------------------------
#
# Written out here rather than imported, so that a mistake in build.py's dotted paths does
# not check itself. The counts below are read from the session records by hand-written
# expressions; only the identifiers are shared with build.py.

EXPECT = {
    "s1-empty": (S[1]["totals"]["empty"], S[1]["totals"]["statable"], 0, "population"),
    "s2-free": (S[2]["counts"]["yes"], S[2]["counts"]["n"], S[2]["counts"]["free"],
                "population"),
    "s2-monotone": (S[2]["counts"]["yes"], S[2]["counts"]["n"], S[2]["counts"]["free"],
                    "population"),
    "s2-recall": (S[2]["counts"]["yes"], S[2]["counts"]["n"], S[2]["counts"]["free"],
                  "population"),
    "s3-attributed": (S[3]["work_ladder"][2]["count"], S[3]["work_ladder"][2]["n"],
                      S[3]["work_ladder"][2]["unasked"], "population"),
    "s3-name": (S[3]["work_ladder"][0]["count"], S[3]["work_ladder"][0]["n"],
                S[3]["work_ladder"][0]["unasked"], "population"),
    "s3-artists": (S[3]["artist_counts"]["person"], S[3]["artists_n"],
                   S[3]["artist_counts"]["unasked"], "population"),
    "s4-creator": (S[4]["whole_arm"]["creator_works"]["atlas"]["empty"],
                   S[4]["whole_arm"]["creator_works"]["atlas"]["n"],
                   S[4]["whole_arm"]["creator_works"]["atlas"]["unasked"], "asked"),
    "s4-any": (S[4]["whole_arm"]["any_works"]["atlas"]["empty"],
               S[4]["whole_arm"]["any_works"]["atlas"]["n"],
               S[4]["whole_arm"]["any_works"]["atlas"]["unasked"], "asked"),
}

rows = {r["id"]: r for r in D["ledger"]}
ck(set(rows) == set(EXPECT), "the ledger's rows are not the nine this check knows about")

for rid, (count, n, unsettled, denom) in EXPECT.items():
    r = rows.get(rid)
    if r is None:
        continue
    ck(r["count"] == count, f"{rid}: count differs from the session record")
    ck(r["n"] == n, f"{rid}: population differs from the session record")
    ck(r["unsettled"] == unsettled, f"{rid}: unsettled count differs from the session record")
    ck(r["denominator"] == denom, f"{rid}: denominator convention is not the session's")
    ck(r["asked"] == n - unsettled, f"{rid}: asked is not population minus unsettled")

    lo = Fraction(count, n)
    hi = Fraction(count + unsettled, n)
    ck(abs(Fraction(r["free_lo"]).limit_denominator(10 ** 9) - lo) < Fraction(1, 10 ** 9),
       f"{rid}: lower bound is not c/n")
    ck(abs(Fraction(r["free_hi"]).limit_denominator(10 ** 9) - hi) < Fraction(1, 10 ** 9),
       f"{rid}: upper bound is not (c+u)/n")

    # the identity, in exact arithmetic
    ck((hi - lo) == Fraction(unsettled, n), f"{rid}: the identity fails in arithmetic")
    ck(r["identity"] is True, f"{rid}: the record does not claim the identity holds")

    want_point = Fraction(count, n - unsettled) if denom == "asked" else lo
    ck(abs(Fraction(r["published_point"]).limit_denominator(10 ** 9) - want_point)
       < Fraction(1, 10 ** 9), f"{rid}: the published point is not the session's own")

    ck(r["lo"] <= r["published_point"] <= r["hi"] or r["assume"],
       f"{rid}: the published point lies outside its own assumption-free interval")

# --- the identity block ----------------------------------------------------

free = [r for r in D["ledger"] if not r["assume"]]
ck(len(free) == 7, "there should be seven shares published without an assumption")
ck(D["identity"]["tested"] == len(free), "the identity block counts a different number of shares")
ck(D["identity"]["held"] == len(free), "the identity does not hold for every free share")
ck(D["identity"]["failed"] == [], "the identity block names an arithmetic failure")
ck(D["identity"]["held_in_doubles"] == 6,
   "six of the seven shares should satisfy the identity in doubles as well")
ck(len(D["identity"]["doubles_exceptions"]) == 1,
   "exactly one share should miss the identity in doubles")
if D["identity"]["doubles_exceptions"]:
    ex = D["identity"]["doubles_exceptions"][0]
    ck(ex["id"] == "s2-free", "the doubles exception should be the widest share")
    ck(0 < ex["gap"] < 2 ** -49,
       "the doubles exception should be a last-place difference, not a real one")

# assumptions contract and never widen
for c in D["identity"]["contractions"]:
    ck(c["width"] < c["free_width"], f"{c['id']}: an assumption did not contract the interval")
    ck(c["contraction"] > 0, f"{c['id']}: the recorded contraction is not positive")
    ck(bool(c["assume"]), f"{c['id']}: a contracted row names no assumption")

ck(rows["s2-recall"]["width"] < rows["s2-monotone"]["width"] < rows["s2-free"]["free_width"],
   "the three regions of session 2 are not ordered by strength of assumption")

# --- the quantity that is not on the scale ---------------------------------

off = D["offscale"]
ck(off["n1"] == S[3]["n"], "the off-scale row's first record size is not session 3's")
ck(off["n2"] == S[3]["n2"], "the off-scale row's second record size is not session 3's")
ck(off["m"] == 1, "the off-scale row should rest on a single match")
ck(off["estimate"] == off["n1"] * off["n2"] / off["m"], "the two-record estimate is misstated")
ck(abs(off["move"] - (off["estimate"] - off["estimate_at_two"])) < 1e-9,
   "the move on one more match is misstated")
ck(off["move"] > 80000, "the off-scale row is not off the scale")

# --- the reading arithmetic behind the live figure -------------------------

rd = D["reading"]
ck(rd["n"] == S[2]["counts"]["n"], "the reading block's population is not session 2's")
ck(rd["yes"] == S[2]["counts"]["yes"], "the reading block's count is not session 2's")
ck(rd["unread"] == S[2]["counts"]["free"], "the reading block's unread count is not session 2's")
ck(rd["settled"] == S[2]["counts"]["settled"], "the reading block's settled count is wrong")
ck(abs(rd["yes_rate_settled"] - rd["yes"] / rd["settled"]) < 1e-12,
   "the settled yes-rate is misstated")
for t in rd["targets"]:
    left = rd["unread"] - t["must_read"]
    ck(left / rd["n"] <= t["want"] + 1e-12,
       f"reading {t['must_read']} entries does not get the width under {t['want']}")
    ck((left + 1) / rd["n"] > t["want"] - 1e-12,
       f"fewer than {t['must_read']} entries would have done")
    ck(t["left"] == left, "a target's remaining-unread count is inconsistent")

# --- the page says what the record says ------------------------------------

payload = re.search(r'<script id="payload" type="application/json">(.*?)</script>',
                    PAGE, re.S)
ck(payload is not None, "the page carries no payload")
if payload:
    ck(json.loads(payload.group(1)) == D, "the page's payload differs from data.json")

table = re.search(r"<thead><tr><th>the share</th>.*?</tbody>", PAGE, re.S)
ck(table is not None, "the ledger table is not in the page")
if table:
    cells = re.findall(r"<td[^>]*>(.*?)</td>", table.group(0), re.S)
    ck(len(cells) == 9 * len(D["ledger"]),
       "the ledger table does not have nine columns for every row")
    for r in D["ledger"]:
        want = f"{r['width'] * 100:.2f}"
        ck(any(want in c for c in cells), f"{r['id']}: its width is not printed in the table")

for r in D["ledger"]:
    ck(r["short"] in PAGE.replace("&#x27;", "'").replace("&amp;", "&"),
       f"{r['id']}: its description is not on the page")

# the headline numbers, as printed
ck("90.21" in PAGE, "the widest interval is not printed")
ck("4.22" in PAGE and "94.43" in PAGE, "the seed's own interval is not printed")
ck("172" in PAGE and "451" in PAGE, "the two-record estimate is not printed")
ck("87.6" in PAGE, "session 4's published point is not printed")

# --- the page is self-contained --------------------------------------------

ck("<img" not in PAGE, "the page loads an image")
ck(not re.search(r'<script[^>]+src=', PAGE), "the page loads an external script")
ck(not re.search(r'<link[^>]+href=', PAGE), "the page loads an external stylesheet")
ck("fetch(" not in PAGE and "XMLHttpRequest" not in PAGE, "the page can reach the network")
ck("http://" not in PAGE, "the page names an insecure address")
# the only absolute addresses allowed are the ones printed as text in the record
for m in re.findall(r'https://[^\s"<)]+', PAGE):
    ck(m.startswith("https://frankbueltge.de/") or m.startswith("https://arxiv.org/")
       or m.startswith("https://raw.githubusercontent.com/"),
       f"an unexpected address appears on the page: {m}")

# the still frame must be complete: the interval, its point and its caption exist in the
# served HTML, before any script has run.
ck('id="ivl"' in PAGE, "the still frame has no interval")
ck('id="ivlpt"' in PAGE, "the still frame has no point")
ck("points wide" in PAGE, "the still frame does not state its own width")
ck("this is the published state" in PAGE, "the still frame does not say which state it shows")

# thin spaces are the named codepoint everywhere a number is grouped
ck(" " in PAGE, "no thin space in the page at all")
VISIBLE = re.sub(r"<[^>]+>", " ", PAGE)
ck(not re.search(r"\d,\d{3}", VISIBLE),
   "a number a reader sees is grouped with a comma rather than a thin space")

# --- report ----------------------------------------------------------------

print(f"{N} checks")
if FAILS:
    print(f"{len(FAILS)} FAILED:")
    for f in FAILS:
        print("  ✗ " + f)
    sys.exit(1)
print("all passed")
