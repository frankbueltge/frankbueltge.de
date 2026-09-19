#!/usr/bin/env python3
# check.py — AT MOST FORTY OF WHAT, verified from the outside.
#
# This file imports nothing from build.py on purpose. Every number in data.json is
# re-derived here from the committed record by a second implementation, and the two
# readings that carry the headline are additionally put to the real GNU wc on this
# machine rather than to my model of it. No network, at all.
#
#   python3 check.py            # run every check
#   python3 check.py -v         # and name each one
#
# Author: the Atelier. Licence: Apache-2.0 with the repository.

import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent

OK = FAIL = 0
FAILURES = []
VERBOSE = "-v" in sys.argv


def check(name, cond):
    global OK, FAIL
    if cond:
        OK += 1
        if VERBOSE:
            print(f"  ok   {name}")
    else:
        FAIL += 1
        FAILURES.append(name)
        print(f"  FAIL {name}")


def git(*args):
    return subprocess.run(["git", "-C", str(REPO), *args],
                          check=True, capture_output=True, text=True).stdout


def wc(text, flag, locale):
    """The real GNU wc, as the outside oracle for my model of it."""
    res = subprocess.run(["wc", flag], input=text.encode("utf-8"),
                         capture_output=True, env={"LC_ALL": locale, "PATH": "/usr/bin:/bin"})
    return int(res.stdout.split()[0])


DATA = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
PAGE = (HERE / "index.html").read_text(encoding="utf-8")
DOCS = DATA["docs"]
WIDTHS = DATA["widths"]

print(f"checking {len(DOCS)} documents against {HERE.name}/data.json and index.html")

# ---------------------------------------------------------------- the corpus is real

texts = {}
for d in DOCS:
    src = d["source"]
    rev, path = src.split(":", 1)
    texts[d["id"]] = git("show", f"{rev}:{path}")

check("corpus: 48 documents", len(DOCS) == 48)
check("corpus: three groups", {x["group"] for x in DOCS} == {"bulletin", "journal", "digest"})
check("corpus: nothing predates the constitution that binds it",
      all(d["date"] >= "2026-08-30" for d in DOCS))
check("corpus: every document was read out of git, not the working tree",
      all(":" in d["source"] for d in DOCS))

for d in DOCS:
    t = texts[d["id"]]
    check(f"bytes match: {d['id']}", len(t.encode("utf-8")) == d["bytes"])
    check(f"chars match: {d['id']}", len(t) == d["chars"])

# ---------------------------------------------------------------- the caps are quoted right

proto = (REPO / "PROTOCOL.md").read_text(encoding="utf-8")
check("cap source: the bulletin cap is in the constitution as quoted",
      "at most 40 lines" in proto)
check("cap source: the digest cap is in the constitution as quoted",
      "At most 2,500 words" in proto)
check("cap source: the two-minute rule is in the constitution as quoted",
      "reads in two minutes" in proto)
check("cap value: 40", DATA["caps"]["bulletin_lines"] == 40 == DATA["caps"]["journal_lines"])
check("cap value: 2500", DATA["caps"]["digest_words"] == 2500)

# The page's first refutation condition, tested rather than asserted: if any of these
# documents DOES define the unit, this whole artifact is a reading failure and must say so.
UNIT_DEFINITION = re.compile(
    r"(a line (is|means|shall be|counts as)|lines? (are|is) counted|"
    r"a word (is|means|shall be|counts as)|words? (are|is) counted|"
    r"counted (as|by) (rendered|stored|physical|whitespace|unicode)|"
    r"reading rate|words per minute|wpm)", re.I)
# The detector cannot do this on its own, and that is part of the finding: in this house
# "line" already means two unrelated things — a line of text and a line of research. Each
# candidate below was read and adjudicated by hand, and the adjudication is committed here
# rather than hidden inside the regex. Any candidate not on this list fails the check.
ADJUDICATED = {
    ("PROTOCOL-v6-final-2026-08-30.md", "A line is"):
        "a line of research, not of text: 'A line is still never killed by the calendar'",
    ("REQUESTS-ARCHIVE.md", "A line is"):
        "a line of research, not of text: 'A line is not a season's subject and not a "
        "work-line'",
    ("REQUESTS.md", "reading rate"):
        "this practice's own letter of 2026-09-19 saying that checking the two-minute rule "
        "would need a reading rate and that none is declared — a request for a definition, "
        "not a definition, and the only reason it is here at all",
}

scanned = 0
candidates, unadjudicated = [], []
for p in [REPO / "PROTOCOL.md", REPO / "REQUESTS.md", REPO / "REQUESTS-ARCHIVE.md",
          *sorted((REPO / "archive" / "protocols").glob("*.md")),
          *sorted((REPO / "governance").glob("*.md"))]:
    if not p.exists():
        continue
    scanned += 1
    for m in UNIT_DEFINITION.finditer(p.read_text(encoding="utf-8")):
        key = (p.name, m.group(0))
        candidates.append(key)
        if key not in ADJUDICATED:
            unadjudicated.append(f"{p.name}: {m.group(0)!r}")
check(f"refutation 1: {scanned} governing documents scanned", scanned >= 6)
check(f"refutation 1: every candidate definition was read and ruled on  {unadjudicated[:3]}",
      not unadjudicated)
check("refutation 1: the only candidates are the two adjudicated 'line of research' uses",
      set(candidates) == set(ADJUDICATED))
check("refutation 1: so no governing document defines a line of text, a word, or a "
      "reading rate", not unadjudicated and set(candidates) <= set(ADJUDICATED))

# ---------------------------------------------------------------- the word readings

PRINT_C = set(chr(c) for c in range(0x21, 0x7F))


def w1(t):
    return sum(1 for tok in t.split() if any(c in PRINT_C for c in tok))


def w2(t):
    return len(t.split())


for d in DOCS:
    t = texts[d["id"]]
    check(f"W1 re-derived: {d['id']}", w1(t) == d["words"]["W1"])
    check(f"W2 re-derived: {d['id']}", w2(t) == d["words"]["W2"])
    # the outside oracle: the actual tool, under the actual locales
    check(f"W1 == real `LC_ALL=C wc -w`: {d['id']}", wc(t, "-w", "C") == d["words"]["W1"])
    check(f"W2 == real `LC_ALL=C.UTF-8 wc -w`: {d['id']}",
          wc(t, "-w", "C.UTF-8") == d["words"]["W2"])
    check(f"W1 <= W2: {d['id']}", d["words"]["W1"] <= d["words"]["W2"])
    check(f"W4 <= W3: {d['id']}", d["words"]["W4"] <= d["words"]["W3"])
    # the stated cause of the W1/W2 gap, checked per document rather than asserted once
    gap = sum(1 for tok in t.split() if all(c not in PRINT_C for c in tok))
    check(f"W2 - W1 is exactly the non-printable-in-C tokens: {d['id']}",
          d["words"]["W2"] - d["words"]["W1"] == gap)

# ---------------------------------------------------------------- UAX#29, recomputed

SEG = r"""
import fs from 'node:fs'
const payload = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const seg = new Intl.Segmenter('en', { granularity: 'word' })
const out = {}
for (const [id, text] of Object.entries(payload)) {
  let a = 0, b = 0
  for (const s of seg.segment(text)) { if (!s.isWordLike) continue; a++; if (/\p{L}/u.test(s.segment)) b++ }
  out[id] = [a, b]
}
process.stdout.write(JSON.stringify(out))
"""
tmp_js = HERE / ".check-seg.mjs"
tmp_in = HERE / ".check-seg.json"
try:
    tmp_js.write_text(SEG.lstrip(), encoding="utf-8")
    tmp_in.write_text(json.dumps(texts), encoding="utf-8")
    got = json.loads(subprocess.run(["node", str(tmp_js), str(tmp_in)],
                                    check=True, capture_output=True, text=True).stdout)
    for d in DOCS:
        a, b = got[d["id"]]
        check(f"W3 re-derived through ICU: {d['id']}", a == d["words"]["W3"])
        check(f"W4 re-derived through ICU: {d['id']}", b == d["words"]["W4"])
finally:
    tmp_js.unlink(missing_ok=True)
    tmp_in.unlink(missing_ok=True)

# ---------------------------------------------------------------- the line readings

for d in DOCS:
    t = texts[d["id"]]
    check(f"L1 re-derived: {d['id']}", t.count("\n") == d["lines"]["L1"])
    check(f"L1 == real `wc -l`: {d['id']}", wc(t, "-l", "C") == d["lines"]["L1"])
    check(f"L2 re-derived: {d['id']}",
          sum(1 for ln in t.split("\n") if ln.strip()) == d["lines"]["L2"])
    check(f"L2 <= L1: {d['id']}", d["lines"]["L2"] <= d["lines"]["L1"])

line_docs = [d for d in DOCS if d["unit"] == "lines"]
check("wrap arrays exist only where a line cap applies",
      all("wrap" in d for d in line_docs) and
      all("wrap" not in d for d in DOCS if d["unit"] != "lines"))

for d in line_docs:
    for key in ("P1", "P2"):
        arr = d["wrap"][key]
        check(f"{key} has one count per width: {d['id']}", len(arr) == len(WIDTHS))
        check(f"{key} never fewer lines than the file stores: {d['id']}",
              min(arr) >= d["lines"]["L1"] - 1)
        check(f"{key} is non-increasing in width: {d['id']}",
              all(arr[i] >= arr[i + 1] for i in range(len(arr) - 1)))
    check(f"P2 never longer than P1: {d['id']}",
          all(b <= a for a, b in zip(d["wrap"]["P1"], d["wrap"]["P2"])))
    # a wrap at a width wider than the longest stored line must equal the stored count
    t = texts[d["id"]]
    longest = max((len(ln) for ln in t.split("\n")), default=0)
    if longest <= WIDTHS[-1]:
        check(f"at a width past the longest line, wrap == stored: {d['id']}",
              d["wrap"]["P1"][WIDTHS.index(WIDTHS[-1])] == d["lines"]["L1"])

# an independent greedy wrapper, written from the rule rather than copied from the build
def wrap_ref(text, width):
    total = 0
    lines = text.split("\n")
    if text.endswith("\n"):
        lines = lines[:-1]
    for line in lines:
        if not line:
            total += 1
            continue
        n, cur = 1, 0
        for word in re.findall(r"\S+\s*", line):
            w = len(word.rstrip())
            if cur and cur + w > width:
                n += 1
                cur = 0
            cur += len(word)
            while cur > width and w > width:
                n += 1
                cur -= width
                w -= width
        total += n
    return total


spot = 0
for d in line_docs[:6]:
    for col in (60, 80, 120):
        ref = wrap_ref(texts[d["id"]], col)
        got_v = d["wrap"]["P1"][WIDTHS.index(col)]
        spot += 1
        check(f"second wrapper agrees within 2 lines: {d['id']} @{col} "
              f"({ref} vs {got_v})", abs(ref - got_v) <= 2)
check(f"second wrapper: {spot} spot checks run", spot == 18)

# ---------------------------------------------------------------- compliance

comp = DATA["compliance"]
for key in ("W1", "W2", "W3", "W4", "W5"):
    expect = sorted(d["id"] for d in DOCS if d["unit"] == "words" and d["words"][key] > d["cap"])
    check(f"compliance list re-derived: {key}", sorted(comp[key]) == expect)
for key in ("L1", "L2"):
    expect = sorted(d["id"] for d in DOCS if d["unit"] == "lines" and d["lines"][key] > d["cap"])
    check(f"compliance list re-derived: {key}", sorted(comp[key]) == expect)
for key in ("P1", "P2"):
    check(f"compliance list has one entry per width: {key}", len(comp[key]) == len(WIDTHS))
    for i in (0, len(WIDTHS) // 2, len(WIDTHS) - 1):
        expect = sorted(d["id"] for d in line_docs if d["wrap"][key][i] > d["cap"])
        check(f"compliance list re-derived: {key} @{WIDTHS[i]}", sorted(comp[key][i]) == expect)

h = DATA["headline"]
dn = h["digest_counts"]
check("headline: the cap lies strictly inside the spread of readings",
      h["digest_lo"] < 2500 < h["digest_hi"] and h["cap_inside_range"])
check("headline: spread endpoints are the min and max of the five readings",
      h["digest_lo"] == min(dn.values()) and h["digest_hi"] == max(dn.values()))
check("headline: every committed digest is over the cap under UAX29-C2-1",
      len(comp["W3"]) == len([d for d in DOCS if d["unit"] == "words"]) == 11)
check("headline: no committed digest is over the cap under W1, W4 or W5",
      len(comp["W1"]) == len(comp["W4"]) == len(comp["W5"]) == 0)
check("headline: the widest all-over column is real",
      len(comp["P1"][WIDTHS.index(h["widest_all_over"])]) == len(line_docs))
check("headline: one column wider, not every record is over",
      h["widest_all_over"] == WIDTHS[-1] or
      len(comp["P1"][WIDTHS.index(h["widest_all_over"]) + 1]) < len(line_docs))
check("headline: line breaches span what the page claims",
      h["line_breach_min"] == min([len(comp["L1"]), len(comp["L2"])] +
                                  [len(x) for x in comp["P1"]] + [len(x) for x in comp["P2"]]))

# ---------------------------------------------------------------- the two controls

ctrl = DATA["controls"]
t_differ = sum(1 for d in line_docs for a, b in zip(d["wrap"]["P1"], d["wrap"]["P2"]) if a != b)
check("control: the tailoring's effect is counted, not asserted",
      ctrl["tailoring"]["differ"] == t_differ)
check("control: the tailoring changes no verdict",
      ctrl["tailoring"]["verdict_changes"] == 0 and
      not any((a > d["cap"]) != (b > d["cap"])
              for d in line_docs for a, b in zip(d["wrap"]["P1"], d["wrap"]["P2"])))
check("control: the corpus really has no combining mark",
      ctrl["width_unit"]["code_points_equal_grapheme_clusters"] and
      not any(unicodedata.combining(c) for t in texts.values() for c in t))

# ---------------------------------------------------------------- the page

check("page: has a title naming the work", "<title>At most forty of what" in PAGE)
check("page: declares the date of this session", "2026-09-19" in PAGE)
check("page: fetches nothing", "fetch(" not in PAGE and "XMLHttpRequest" not in PAGE)
check("page: loads nothing from outside itself",
      not re.search(r'(src|href)\s*=\s*"(?!#)(https?:)?//', PAGE))
check("page: no external stylesheet or font", "@import" not in PAGE and "fonts.g" not in PAGE)
check("page: carries a floor for a reader with no script", "<noscript>" in PAGE)
check("page: names both standards it leans on",
      "Annex #29" in PAGE and "Annex #14" in PAGE)
check("page: quotes the conformance clauses by their identifiers",
      "UAX29-C2-1" in PAGE and "UAX29-C2-2" in PAGE and "UAX14-C1" in PAGE)
check("page: discloses its tailoring, as UAX14-C1 requires",
      "declared subset" in PAGE and "not a conforming" in PAGE)
check("page: refuses to invent a reading rate",
      "reconstructed from memory" in PAGE and "I did not" in PAGE)
check("page: records that the detector for a definition cannot read the house's own word",
      "two unrelated things" in PAGE)
check("page: prints its refutation conditions", "What would kill this page" in PAGE)
check("page: names the ICU build the word counts came from",
      (DATA["platform"]["icu"] or "unknown") in PAGE)

# every number the instrument can show must already be in the served text
missing = []
for d in DOCS:
    row = re.search(r'<tr data-id="%s">.*?</tr>' % re.escape(d["id"]), PAGE, re.S)
    if not row:
        missing.append(d["id"])
        continue
    cells = re.findall(r'<td class="n">(\d+)</td>', row.group(0))
    want = (list(d["words"].values()) if d["unit"] == "words"
            else [d["lines"]["L1"], d["lines"]["L2"]] +
                 [d["wrap"][p][WIDTHS.index(c)]
                  for c in (40, 66, 72, 80, 100, 120, 160, 200) for p in ("P1", "P2")])
    if [int(x) for x in cells] != want:
        missing.append(d["id"])
check(f"page: every document has its served row of numbers  {missing[:3]}", not missing)
check("page: the payload carries the wrap arrays the slider needs",
      '"wrap"' in PAGE and str(WIDTHS[-1]) in PAGE)

for key, val in (("digest_lo", h["digest_lo"]), ("digest_hi", h["digest_hi"]),
                 ("widest_all_over", h["widest_all_over"])):
    check(f"page: prints {key} = {val}", f">{val}<" in PAGE or f" {val} " in PAGE
          or f"{val}." in PAGE or f"{val},"  in PAGE)

print()
print(f"{OK} checks passed, {FAIL} failed")
if FAIL:
    for f in FAILURES[:20]:
        print("  -", f)
    sys.exit(1)
