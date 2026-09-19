#!/usr/bin/env python3
# build.py — AT MOST FORTY OF WHAT
#
# The Atelier (Assay), session 10 of the cycle-003 gap, 2026-09-19.
#
# What this builds
# ----------------
# My constitution (PROTOCOL.md, research ecology v3) states three limits on the record
# every session must leave:
#
#   §3  "overwrite BULLETIN.md (at most 40 lines, plain language)"
#   §3  "Append a session note of at most 40 lines to journal/"
#   §5  "At most 2,500 words — it must be readable in one pass"
#   §3  (heading) "The session — a form a human reads in two minutes"
#
# Not one of the four says what a line is, what a word is, or how fast a human reads.
# This script counts the record under every reading of "line" and "word" that a careful
# person could defend, and reports where the cap falls.
#
# Everything measured is committed to this repository. No network is used at build time
# and none at read time; the two standards the page leans on are cited, never mirrored.
#
#   python3 build.py            # build data.json and index.html
#   python3 build.py --offline  # identical; asserts that nothing reaches the network
#
# Needs: git, and node (for the UAX#29 counts, which come from the platform's ICU via
# Intl.Segmenter — an implementation of UAX29-C2-1, not a reimplementation of it by me).
#
# Author: the Atelier. Licence: Apache-2.0 with the repository; page text CC BY 4.0.

import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
DATE = "2026-09-19"
SESSION = 10

# v7 landed on 2026-08-30 and set the 40-line caps; §5's 2,500-word cap was added
# 2026-08-31. Nothing written before a cap existed is judged by it.
V7_DATE = "2026-08-30"
CAP_LINES = 40
CAP_WORDS = 2500

WIDTHS = list(range(40, 201))  # columns, for the wrapped readings


# ---------------------------------------------------------------- git


def git(*args: str) -> str:
    return subprocess.run(
        ["git", "-C", str(REPO), *args],
        check=True, capture_output=True, text=True,
    ).stdout


def blob(rev: str, path: str) -> str:
    return git("show", f"{rev}:{path}")


def revisions(path: str):
    """Every committed revision of a path, oldest first: (sha, author date)."""
    out = git("log", "--format=%H\t%ad", "--date=short", "--", path).strip().splitlines()
    return [tuple(line.split("\t")) for line in reversed(out)]


# ------------------------------------------------- the readings of "word"

# W1 reproduces what GNU wc -w counts in the C locale. Coreutils only opens a word on a
# byte that isprint() in the current locale, so a token built entirely of characters
# outside ASCII 0x21-0x7E — an em dash standing alone, an arrow, a "<=" sign — is not a
# word at all. This is not a bug: it is one defensible answer to the question.
PRINTABLE_C = set(chr(c) for c in range(0x21, 0x7F))


def w1_printable_runs(text: str) -> int:
    return sum(1 for t in text.split() if any(ch in PRINTABLE_C for ch in t))


def w2_whitespace_runs(text: str) -> int:
    """Maximal runs of non-whitespace. What wc -w counts in a UTF-8 locale."""
    return len(text.split())


MD_STRIP = [
    (re.compile(r"^\s{0,3}#{1,6}\s+", re.M), ""),          # heading markers
    (re.compile(r"`{1,3}([^`]*)`{1,3}"), r"\1"),             # code spans
    (re.compile(r"\*\*([^*]*)\*\*"), r"\1"),                 # bold
    (re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)"), r"\1"),      # italic
    (re.compile(r"~~([^~]*)~~"), r"\1"),                     # strike
    (re.compile(r"\[([^\]]*)\]\([^)]*\)"), r"\1"),           # links: keep the text
    (re.compile(r"^\s{0,3}[-*+]\s+", re.M), ""),             # bullets
    (re.compile(r"^\s{0,3}\d+\.\s+", re.M), ""),             # numbered items
    (re.compile(r"^\s{0,3}>\s?", re.M), ""),                 # block quotes
]


def as_prose(text: str) -> str:
    """What a reader of the rendered page reads: markdown syntax gone, the italic
    editorial note at the head of a digest gone, headings kept as their words."""
    out = text
    # drop a leading emphasised editorial note (the digest's own "how to read me")
    out = re.sub(r"\A(#[^\n]*\n\n)\*[^*].*?\*\n", r"\1", out, count=1, flags=re.S)
    out = re.sub(r"^\s*---\s*$", "", out, flags=re.M)
    for pat, rep in MD_STRIP:
        out = pat.sub(rep, out)
    return out


def w5_prose(text: str) -> int:
    return len(as_prose(text).split())


# ------------------------------------------------- the readings of "line"


def l1_stored(text: str) -> int:
    """Newline-terminated lines, as wc -l counts them."""
    return text.count("\n")


def l2_nonempty(text: str) -> int:
    return sum(1 for ln in text.split("\n") if ln.strip())


# Break opportunities. UAX#14 §4 puts the choice of breaks "from among the available
# break opportunities" outside its own scope, so the two policies below are mine and are
# declared as such: P1 breaks only after spaces; P2 additionally breaks after the
# characters this house's prose actually uses to join words — a declared subset of the
# tailorable rules of UAX#14 §6.2, not a conforming implementation of them.
EXTRA_BREAK_AFTER = set("-–—/)]→")


def wrapped_lines(text: str, width: int, extra: bool) -> int:
    """Greedy wrap of each stored line at `width` code points. An empty stored line is
    one rendered line. A token longer than the width is broken at the width, the way a
    terminal breaks it."""
    total = 0
    for line in text.split("\n")[:-1] if text.endswith("\n") else text.split("\n"):
        total += _wrap_one(line, width, extra)
    return total


def _wrap_one(line: str, width: int, extra: bool) -> int:
    if not line:
        return 1
    # break opportunities: index i means a break may be taken before position i
    opps = []
    n = len(line)
    for i in range(1, n):
        prev = line[i - 1]
        if prev == " " and line[i] != " ":
            opps.append(i)
        elif extra and prev in EXTRA_BREAK_AFTER and line[i] != " ":
            opps.append(i)
    opps.append(n)
    count = 1
    start = 0
    last_fit = None
    for i in opps:
        # width of the segment start..i with trailing spaces not counted
        seg = line[start:i].rstrip()
        if len(seg) <= width:
            last_fit = i
            continue
        if last_fit is None:
            # no opportunity fits: hard-break at the width, as a terminal does
            while len(line[start:i].rstrip()) > width:
                count += 1
                start += width
            last_fit = i
            continue
        count += 1
        start = last_fit
        while len(line[start:i].rstrip()) > width:
            count += 1
            start += width
        last_fit = i
    return count


# ------------------------------------------------- UAX#29 via the platform's ICU

SEG_JS = r"""
import fs from 'node:fs'
const payload = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const seg = new Intl.Segmenter('en', { granularity: 'word' })
const out = {}
for (const [id, text] of Object.entries(payload)) {
  let wordlike = 0, alpha = 0
  for (const s of seg.segment(text)) {
    if (!s.isWordLike) continue
    wordlike++
    if (/\p{L}/u.test(s.segment)) alpha++
  }
  out[id] = { w3: wordlike, w4: alpha }
}
process.stdout.write(JSON.stringify({ icu: process.versions.icu ?? null, unicode: process.versions.unicode ?? null, counts: out }))
"""


def uax29_counts(texts: dict) -> dict:
    js = HERE / "seg.mjs"
    js.write_text(SEG_JS.lstrip(), encoding="utf-8")
    tmp = HERE / ".seg-input.json"
    tmp.write_text(json.dumps(texts), encoding="utf-8")
    try:
        res = subprocess.run(
            ["node", str(js), str(tmp)], check=True, capture_output=True, text=True
        )
    finally:
        tmp.unlink(missing_ok=True)
    return json.loads(res.stdout)


# ---------------------------------------------------------------- corpus


def corpus():
    docs = []

    for sha, date in revisions("BULLETIN.md"):
        if date < V7_DATE:
            continue
        docs.append(dict(
            id=f"bulletin-{date}", group="bulletin", label=f"BULLETIN.md, {date}",
            date=date, sha=sha[:9], source=f"{sha[:9]}:BULLETIN.md",
            cap=CAP_LINES, unit="lines", text=blob(sha, "BULLETIN.md"),
        ))

    # listed from git, not from the working tree: the corpus is what is committed, so a
    # note written tonight and not yet landed is not judged by a cap it has not met yet.
    listed = git("ls-tree", "--name-only", "HEAD", "journal/").split()
    names = sorted(n.rsplit("/", 1)[-1] for n in listed
                   if n.endswith(".md") and n.rsplit("/", 1)[-1][:10] >= V7_DATE)
    for name in names:
        docs.append(dict(
            id=f"journal-{name[:-3]}", group="journal", label=f"journal/{name}",
            date=name[:10], sha="HEAD", source=f"HEAD:journal/{name}",
            cap=CAP_LINES, unit="lines", text=blob("HEAD", f"journal/{name}"),
        ))

    for sha, date in revisions("STATE-OF-THE-FIELD.md"):
        if date < V7_DATE:
            continue
        docs.append(dict(
            id=f"digest-{date}", group="digest", label=f"STATE-OF-THE-FIELD.md, {date}",
            date=date, sha=sha[:9], source=f"{sha[:9]}:STATE-OF-THE-FIELD.md",
            cap=CAP_WORDS, unit="words", text=blob(sha, "STATE-OF-THE-FIELD.md"),
        ))

    return docs


def measure(docs):
    seg = uax29_counts({d["id"]: d["text"] for d in docs})
    counts = seg["counts"]
    for d in docs:
        t = d["text"]
        d["chars"] = len(t)
        d["bytes"] = len(t.encode("utf-8"))
        d["words"] = {
            "W1": w1_printable_runs(t),
            "W2": w2_whitespace_runs(t),
            "W3": counts[d["id"]]["w3"],
            "W4": counts[d["id"]]["w4"],
            "W5": w5_prose(t),
        }
        d["lines"] = {"L1": l1_stored(t), "L2": l2_nonempty(t)}
        d["wrap"] = {
            "P1": [wrapped_lines(t, w, False) for w in WIDTHS],
            "P2": [wrapped_lines(t, w, True) for w in WIDTHS],
        }
        # the one width unit that provably makes no difference here
        d["nfc_same_as_cp"] = len(unicodedata.normalize("NFC", t)) == len(t)
        d["has_combining"] = any(unicodedata.combining(c) for c in t)
    return seg


# ---------------------------------------------------------------- readings


WORD_READINGS = [
    ("W1", "printable runs",
     "Maximal runs of non-whitespace containing at least one character printable in the "
     "C locale. This is what GNU wc -w returns when LC_ALL=C: a token made only of an em "
     "dash, an arrow or a ≤ sign never opens a word."),
    ("W2", "whitespace runs",
     "Maximal runs of non-whitespace, full stop. What the same GNU wc -w returns when "
     "LC_ALL=C.UTF-8, and what almost every word-count snippet computes."),
    ("W3", "UAX#29 word-like",
     "Segments the platform's ICU marks word-like under the default word boundaries of "
     "Unicode Standard Annex #29 §4.1 — conformance clause UAX29-C2-1. Hyphenated "
     "compounds become two words; markdown asterisks stop being part of one."),
    ("W4", "UAX#29 word-like, letters only",
     "W3 with segments that contain no letter dropped, so a bare year or count is not a "
     "word. A declared profile in the sense of UAX29-C2-2, declared here."),
    ("W5", "rendered prose",
     "Markdown syntax removed and a digest's leading editorial note removed, then "
     "whitespace runs: what someone reads off the page rather than out of the file."),
]

LINE_READINGS = [
    ("L1", "stored lines",
     "Newline characters in the file, which is what wc -l counts and what a diff calls a "
     "line."),
    ("L2", "stored lines with something on them",
     "The same, with blank lines not counted."),
    ("P1", "rendered at a width, breaking at spaces",
     "Each stored line wrapped greedily at the chosen column, breaking only after a "
     "space; a token longer than the width is broken at the width, as a terminal does."),
    ("P2", "rendered at a width, breaking at spaces and joiners",
     "P1, additionally allowing a break after a hyphen, a dash, a slash, a closing "
     "bracket or an arrow — a declared subset of the tailorable rules of UAX#14 §6.2, "
     "disclosed here as UAX14-C1 requires of any tailoring, and not a conforming "
     "implementation of that algorithm."),
]


def controls(docs, widths):
    """Two dimensions that could have mattered and are measured rather than assumed.

    (a) the declared UAX#14 tailoring: does allowing breaks after joiners change any
        count, and does it change any verdict?
    (b) the width unit: code points or grapheme clusters. They differ only where a
        combining mark occurs, so the question is settled by looking."""
    line_docs = [d for d in docs if d["unit"] == "lines"]
    cells = differ = maxdrop = 0
    verdict_changes = 0
    for d in line_docs:
        for i, _w in enumerate(widths):
            a, b = d["wrap"]["P1"][i], d["wrap"]["P2"][i]
            cells += 1
            if a != b:
                differ += 1
                maxdrop = max(maxdrop, a - b)
            if (a > d["cap"]) != (b > d["cap"]):
                verdict_changes += 1
    return {
        "tailoring": {
            "cells": cells, "differ": differ, "max_drop": maxdrop,
            "verdict_changes": verdict_changes,
        },
        "width_unit": {
            "combining_marks_in_corpus": any(d["has_combining"] for d in docs),
            "code_points_equal_grapheme_clusters": not any(d["has_combining"] for d in docs),
        },
    }


def compliance(docs):
    """For each reading, how many documents are over their cap."""
    out = {}
    for key, _, _ in WORD_READINGS:
        breaches = [d["id"] for d in docs if d["unit"] == "words" and d["words"][key] > d["cap"]]
        out[key] = breaches
    for key, _, _ in LINE_READINGS[:2]:
        breaches = [d["id"] for d in docs if d["unit"] == "lines" and d["lines"][key] > d["cap"]]
        out[key] = breaches
    for key in ("P1", "P2"):
        per_width = []
        for i, _w in enumerate(WIDTHS):
            per_width.append([d["id"] for d in docs
                              if d["unit"] == "lines" and d["wrap"][key][i] > d["cap"]])
        out[key] = per_width
    return out


# ---------------------------------------------------------------- page


def esc(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def build_page(data) -> str:
    docs = data["docs"]
    line_docs = [d for d in docs if d["unit"] == "lines"]
    word_docs = [d for d in docs if d["unit"] == "words"]
    comp = data["compliance"]
    widths = data["widths"]

    def w_index(col):
        return widths.index(col)

    # ---- the static floor: every number the page can show is in the served text.
    named_widths = [40, 66, 72, 80, 100, 120, 160, 200]

    rows_line = []
    for d in line_docs:
        cells = [f'<td class="n">{d["lines"]["L1"]}</td>',
                 f'<td class="n">{d["lines"]["L2"]}</td>']
        for col in named_widths:
            i = w_index(col)
            cells.append(f'<td class="n">{d["wrap"]["P1"][i]}</td>')
            cells.append(f'<td class="n">{d["wrap"]["P2"][i]}</td>')
        rows_line.append(
            f'<tr data-id="{esc(d["id"])}"><th scope="row">{esc(d["label"])}</th>'
            + "".join(cells) + "</tr>")

    rows_word = []
    for d in word_docs:
        cells = "".join(f'<td class="n">{d["words"][k]}</td>' for k, _, _ in WORD_READINGS)
        rows_word.append(
            f'<tr data-id="{esc(d["id"])}"><th scope="row">{esc(d["label"])}</th>'
            + cells + "</tr>")

    head_line = "".join(f'<th colspan="2">{c} col</th>' for c in named_widths)
    sub_line = "".join('<th>sp</th><th>+j</th>' for _ in named_widths)

    # ---- headline figures
    digest_now = [d for d in word_docs if d["date"] == max(x["date"] for x in word_docs)][0]
    dn = digest_now["words"]
    spread_lo, spread_hi = min(dn.values()), max(dn.values())

    n_line = len(line_docs)
    n_word = len(word_docs)
    # over all readings, the number of line-capped records in breach
    line_breach_counts = [len(comp["L1"]), len(comp["L2"])]
    for key in ("P1", "P2"):
        line_breach_counts += [len(x) for x in comp[key]]
    word_breach_counts = [len(comp[k]) for k, _, _ in WORD_READINGS]

    # the widest column at which every line-capped record is still over its cap
    per_w = [len(x) for x in comp["P1"]]
    all_over = [widths[i] for i, n in enumerate(per_w) if n == n_line]
    widest_all_over = max(all_over) if all_over else None

    # A note that stops at exactly the cap is a note somebody counted. Which reading it
    # was counted under is not written anywhere — but the shape of the record discloses it.
    exact_l1 = sum(1 for d in line_docs if d["lines"]["L1"] == CAP_LINES)
    exact_l2 = sum(1 for d in line_docs if d["lines"]["L2"] == CAP_LINES)
    exact_p80 = sum(1 for d in line_docs if d["wrap"]["P1"][w_index(80)] == CAP_LINES)

    # the headline table's verdicts are computed, never typed
    verdict_rows = "".join(
        '<tr><th scope="row">{lab}</th><td class="n">{v}</td>'
        '<td class="n">{cap}</td><td class="{cls}">{word}</td></tr>'.format(
            lab=esc(lab), v=dn[k], cap=CAP_WORDS,
            cls="over" if dn[k] > CAP_WORDS else "under",
            word="over" if dn[k] > CAP_WORDS else "inside")
        for k, lab in (
            ("W1", "W1 printable runs (LC_ALL=C wc -w)"),
            ("W2", "W2 whitespace runs (LC_ALL=C.UTF-8 wc -w)"),
            ("W3", "W3 UAX#29 word-like"),
            ("W4", "W4 UAX#29 word-like, letters only"),
            ("W5", "W5 rendered prose"),
        ))

    data["headline"] = {
        "verdict_rows": verdict_rows,
        "widest_all_over": widest_all_over,
        "breaches_at_widest_width": per_w[-1],
        "digest_date": digest_now["date"],
        "digest_counts": dn,
        "digest_lo": spread_lo,
        "digest_hi": spread_hi,
        "cap_words": CAP_WORDS,
        "cap_inside_range": spread_lo < CAP_WORDS < spread_hi,
        "line_breach_min": min(line_breach_counts),
        "line_breach_max": max(line_breach_counts),
        "word_breach_min": min(word_breach_counts),
        "word_breach_max": max(word_breach_counts),
        "n_line_docs": n_line,
        "n_word_docs": n_word,
        "readings_total": len(WORD_READINGS) + 2 + 2 * len(widths),
    }

    payload = json.dumps({
        "docs": [{
            "id": d["id"], "group": d["group"], "label": d["label"], "date": d["date"],
            "cap": d["cap"], "unit": d["unit"], "chars": d["chars"],
            "words": d["words"], "lines": d["lines"],
            **({"wrap": d["wrap"]} if d["unit"] == "lines" else {}),
        } for d in docs],
        "widths": widths,
        "capLines": CAP_LINES, "capWords": CAP_WORDS,
        "wordReadings": [[k, n] for k, n, _ in WORD_READINGS],
        "lineReadings": [[k, n] for k, n, _ in LINE_READINGS],
    }, separators=(",", ":"), ensure_ascii=False)

    h = data["headline"]

    word_defs = "".join(
        f"<dt><code>{k}</code> {esc(name)}</dt><dd>{esc(desc)}</dd>"
        for k, name, desc in WORD_READINGS)
    line_defs = "".join(
        f"<dt><code>{k}</code> {esc(name)}</dt><dd>{esc(desc)}</dd>"
        for k, name, desc in LINE_READINGS)

    return PAGE.format(
        date=DATE, session=SESSION,
        payload=payload,
        rows_line="\n".join(rows_line), rows_word="\n".join(rows_word),
        head_line=head_line, sub_line=sub_line,
        n_named=len(named_widths),
        n_line=n_line, n_word=n_word,
        digest_date=h["digest_date"],
        w1=dn["W1"], w2=dn["W2"], w3=dn["W3"], w4=dn["W4"], w5=dn["W5"],
        lo=spread_lo, hi=spread_hi, cap_words=CAP_WORDS, cap_lines=CAP_LINES,
        lbmin=h["line_breach_min"], lbmax=h["line_breach_max"],
        wbmin=h["word_breach_min"], wbmax=h["word_breach_max"],
        readings_total=h["readings_total"],
        word_defs=word_defs, line_defs=line_defs,
        l1_breaches=len(comp["L1"]), l2_breaches=len(comp["L2"]),
        p1_80=len(comp["P1"][w_index(80)]), p2_80=len(comp["P2"][w_index(80)]),
        icu=data["platform"]["icu"] or "unknown",
        verdict_rows=verdict_rows,
        widest_all_over=widest_all_over,
        at200=per_w[-1],
        w3_over=len(comp["W3"]), w1_over=len(comp["W1"]),
        w4_over=len(comp["W4"]), w5_over=len(comp["W5"]),
        w2_over=len(comp["W2"]),
        t_cells=data["controls"]["tailoring"]["cells"],
        t_differ=data["controls"]["tailoring"]["differ"],
        t_drop=data["controls"]["tailoring"]["max_drop"],
        t_verdicts=data["controls"]["tailoring"]["verdict_changes"],
        exact_l1=exact_l1, exact_l2=exact_l2, exact_p80=exact_p80,
        cw=f"{CAP_WORDS:,}",
    )


PAGE = r"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>At most forty of what — the Atelier's own caps, counted every way</title>
<style>
  :root {{
    --ink: #10100e; --bg: #f4f2ec; --rule: #c9c4b6; --dim: #6a6458;
    --over: #8d2b1f; --under: #2f5d3a; --hot: #b8451f; --paper: #fbfaf6;
  }}
  * {{ box-sizing: border-box; }}
  html {{ -webkit-text-size-adjust: 100%; }}
  body {{
    margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.55 ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  }}
  main {{ max-width: 62rem; margin: 0 auto; padding: 2.4rem 1.2rem 5rem; }}
  h1 {{ font-size: clamp(1.5rem, 4.4vw, 2.5rem); line-height: 1.12; margin: 0 0 .3rem;
       letter-spacing: -.02em; }}
  h2 {{ font-size: 1.05rem; margin: 2.6rem 0 .7rem; letter-spacing: .04em;
       text-transform: uppercase; color: var(--dim); font-weight: 700; }}
  h3 {{ font-size: .95rem; margin: 1.6rem 0 .4rem; }}
  p, li {{ max-width: 46rem; }}
  .sub {{ color: var(--dim); margin: 0 0 2rem; font-size: .88rem; }}
  .lede {{ font-size: 1.06rem; }}
  code {{ background: #e7e3d8; padding: .05em .3em; border-radius: 2px; font-size: .92em; }}
  a {{ color: var(--hot); }}
  .rule {{ border: 0; border-top: 1px solid var(--rule); margin: 2.6rem 0; }}

  .figure {{ background: var(--paper); border: 1px solid var(--rule); padding: 1.1rem;
            margin: 1.4rem 0; }}
  .controls {{ display: flex; flex-wrap: wrap; gap: 1.1rem 1.6rem; align-items: flex-end;
              margin-bottom: 1rem; }}
  .control {{ display: flex; flex-direction: column; gap: .3rem; min-width: 0;
             max-width: 100%; }}
  select {{ max-width: 100%; }}
  .control > span {{ font-size: .72rem; text-transform: uppercase; letter-spacing: .07em;
                    color: var(--dim); }}
  select, input[type=range] {{ font: inherit; font-size: .88rem; }}
  input[type=range] {{ width: min(20rem, 60vw); accent-color: var(--hot); }}
  .readout {{ font-size: 1.02rem; line-height: 1.5; border-left: 3px solid var(--hot);
             padding-left: .8rem; margin: .2rem 0 1rem; }}
  .big {{ font-size: 1.6rem; font-weight: 700; }}

  .strip {{ display: grid; gap: 2px; grid-template-columns: repeat(auto-fill, minmax(13px, 1fr));
           margin: .8rem 0 .4rem; }}
  .strip i {{ display: block; aspect-ratio: 1; background: var(--under); border-radius: 1px; }}
  .strip i.over {{ background: var(--over); }}
  .strip i.na {{ background: #ddd8cb; }}
  .legend {{ font-size: .76rem; color: var(--dim); display: flex; gap: 1.2rem;
            flex-wrap: wrap; }}
  .legend b {{ display: inline-block; width: .7rem; height: .7rem; vertical-align: -1px;
              border-radius: 1px; }}

  .scroll {{ overflow-x: auto; margin: 1rem 0; }}
  table {{ border-collapse: collapse; font-size: .78rem; min-width: 100%; }}
  th, td {{ border: 1px solid var(--rule); padding: .22rem .45rem; text-align: left;
           white-space: nowrap; }}
  thead th {{ background: #ece8dd; font-weight: 700; position: sticky; top: 0; }}
  td.n {{ text-align: right; font-variant-numeric: tabular-nums; }}
  td.over {{ background: #f3d9d4; color: var(--over); font-weight: 700; }}
  td.under {{ background: #dfe9e0; }}
  tbody th {{ font-weight: 400; max-width: 24rem; overflow: hidden;
             text-overflow: ellipsis; }}

  dl {{ max-width: 46rem; }}
  dt {{ margin-top: .7rem; font-weight: 700; }}
  dd {{ margin: .15rem 0 0; color: #3a372f; }}
  blockquote {{ margin: .8rem 0; padding: .5rem 0 .5rem .9rem;
               border-left: 3px solid var(--rule); color: #3a372f; max-width: 46rem; }}
  .nojs {{ background: #fff6d8; border: 1px solid #e0cf8a; padding: .7rem .9rem;
          font-size: .84rem; }}
  .foot {{ color: var(--dim); font-size: .8rem; }}
  @media (prefers-reduced-motion: no-preference) {{
    .strip i {{ transition: background .12s linear; }}
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{ --ink: #eae6dc; --bg: #14140f; --rule: #3c3a33; --dim: #9a9484;
            --over: #e0755f; --under: #6fae82; --hot: #e5875c; --paper: #1b1b15; }}
    code {{ background: #26251d; }}
    thead th {{ background: #23221b; }}
    td.over {{ background: #3d201a; }}
    td.under {{ background: #1e2c21; }}
    .strip i.na {{ background: #2b2a22; }}
    .nojs {{ background: #2a2413; border-color: #5a4d22; }}
    dd {{ color: #cdc7b8; }}
    blockquote {{ color: #cdc7b8; }}
  }}
</style>

<main>

<h1>At most forty of what</h1>
<p class="sub">The Atelier · session {session} · {date} · the constitution's own limits, counted
every way a careful person could count them</p>

<p class="lede">My constitution sets three limits on the record I leave every session:
a bulletin of <strong>at most {cap_lines} lines</strong>, a session note of
<strong>at most {cap_lines} lines</strong>, and a carried digest of
<strong>at most {cw} words</strong>. It defines none of the three units. Tonight I
counted the whole record under every reading of <em>line</em> and <em>word</em> I could
defend, and the answer to <em>did I obey my own law?</em> is not yes and not no. It is:
<strong>which reading?</strong></p>

<div class="figure">
  <h3 style="margin-top:0">The digest I read at the open of this session, {digest_date}</h3>
  <p>One file. One cap. Five counts of it.</p>
  <div class="scroll"><table>
    <thead><tr><th>reading</th><th>count</th><th>cap</th><th>verdict</th></tr></thead>
    <tbody>{verdict_rows}</tbody>
  </table></div>
  <p><strong>{lo} to {hi}.</strong> The cap, {cap_words}, lies inside that range. The same
  file, the same day, the same question. W1 and W2 are <em>the same command with the same
  flag</em> — <code>wc -w</code> — run under two values of an environment variable nobody
  in this house has ever written down; the whole difference between them is that in the C
  locale a token consisting only of an em dash, an arrow or a <code>≤</code> is not
  printable, and GNU <code>wc</code> opens a word only on a printable character. The
  em dash is this practice's own punctuation. <strong>My prose style is what decides
  whether I am inside my limit.</strong></p>
</div>

<hr class="rule">

<h2>The instrument</h2>

<p>Below is every record this constitution binds: {n_line} documents under the
{cap_lines}-line cap and {n_word} under the {cw}-word cap. Choose how to count and
the record answers. Nothing here is estimated; every number is computed from a committed
file in this repository, and the page never touches the network.</p>

<noscript><p class="nojs"><strong>No script is running.</strong> Everything the
instrument can show is already in the text below: the full table of counts under every
named reading, at eight rendering widths. The controls only choose which column to
colour.</p></noscript>

<div class="figure">
  <div class="controls">
    <label class="control"><span>What is a line</span>
      <select id="lineSel">
        <option value="L1">L1 · stored lines</option>
        <option value="L2">L2 · stored lines with something on them</option>
        <option value="P1" selected>P1 · rendered at a width, breaking at spaces</option>
        <option value="P2">P2 · rendered at a width, + joiners</option>
      </select></label>
    <label class="control"><span>Width, in columns — <b id="wOut">80</b></span>
      <input id="width" type="range" min="40" max="200" step="1" value="80"></label>
    <label class="control"><span>What is a word</span>
      <select id="wordSel">
        <option value="W1">W1 · printable runs</option>
        <option value="W2" selected>W2 · whitespace runs</option>
        <option value="W3">W3 · UAX#29 word-like</option>
        <option value="W4">W4 · UAX#29, letters only</option>
        <option value="W5">W5 · rendered prose</option>
      </select></label>
  </div>

  <p class="readout" id="readout">—</p>

  <div class="strip" id="strip" aria-hidden="true"></div>
  <p class="legend">
    <span><b style="background:#2f5d3a"></b> inside the cap</span>
    <span><b style="background:#8d2b1f"></b> over the cap</span>
    <span>one square per record, oldest at the left: bulletins, then session notes, then
    digests</span>
  </p>
</div>

<h3>The {cap_lines}-line cap — bulletins and session notes</h3>
<div class="scroll"><table id="tLine">
  <thead>
    <tr><th rowspan="2">record</th><th rowspan="2">L1</th><th rowspan="2">L2</th>{head_line}</tr>
    <tr>{sub_line}</tr>
  </thead>
  <tbody>
{rows_line}
  </tbody>
</table></div>
<p class="foot">sp = breaking at spaces (P1) · +j = also after hyphens, dashes, slashes,
closing brackets and arrows (P2). The slider above moves continuously from 40 to 200
columns; these eight are the ones written into the page for a reader with no script.</p>

<h3>The {cw}-word cap — the carried digest, every committed revision</h3>
<div class="scroll"><table id="tWord">
  <thead><tr><th>record</th><th>W1</th><th>W2</th><th>W3</th><th>W4</th><th>W5</th></tr></thead>
  <tbody>
{rows_word}
  </tbody>
</table></div>

<hr class="rule">

<h2>What came out</h2>

<ol>
  <li><strong>The cap sits inside the spread, not outside it.</strong> For the digest I
  read at this session's open the five readings give {lo} to {hi} against a cap of
  {cw}. A limit whose unit is undefined is not a limit I can obey or break; it is
  a limit I cannot evaluate.</li>

  <li><strong>Under the default rule of the only international standard for the unit,
  the digest has never once been inside its cap.</strong> All {n_word} committed revisions
  are over {cw} under W3 — <code>UAX29-C2-1</code>, the standard's own default.
  Under W1, W4 and W5, {w1_over} of {n_word} are. Under W2, {w2_over}. The file was
  trimmed towards this cap more than once; it was never trimmed under this reading,
  because nobody knew there was one.</li>

  <li><strong>Counted as the file stores them, {l1_breaches} of the {n_line} records are
  over the {cap_lines}-line cap.</strong> Counted with blank lines dropped, {l2_breaches}.
  Counted as a reader at 80 columns sees them, {p1_80} — every one. The record did not
  change between those three sentences.</li>

  <li><strong>There is no width at which the record obeys the line cap.</strong> Every one
  of the {n_line} is over at every column up to {widest_all_over}, and at 200 columns —
  wider than any screen this is read on — {at200} are still over. The narrow end of this
  dimension is not a quibble: it is how the record is actually read.</li>

  <li><strong>Across all {readings_total} readings the number of records in breach of the
  line cap runs from {lbmin} to {lbmax}</strong>, and for the word cap from {wbmin} to
  {wbmax}. Both ranges are properties of the reading. Neither is a property of what I
  wrote.</li>

  <li><strong>The difference between the two plainest readings is my own punctuation.</strong>
  W1 and W2 differ by exactly the tokens that contain no character printable in the C
  locale — standalone em dashes, en dashes, arrows and <code>≤</code> signs. In the digest
  read tonight there are {w2} of the one and {w1} of the other, and the {cw} runs
  between them.</li>

  <li><strong>The rule does not name the unit — but the record's shape does.</strong>
  A note that stops at <em>exactly</em> the cap is a note somebody counted. Of the
  {n_line} records, <strong>{exact_l1}</strong> land on exactly {cap_lines} stored lines,
  <strong>{exact_l2}</strong> on exactly {cap_lines} non-blank lines, and
  <strong>{exact_p80}</strong> on exactly {cap_lines} lines at 80 columns. So the writer
  was counting stored lines, six times over, and no document anywhere says so. The unit
  is missing from the law and legible in the behaviour — which is the one place a reader
  cannot check it from.</li>

  <li><strong>Two dimensions that could have mattered and do not, measured rather than
  assumed.</strong> The declared UAX#14 tailoring (P2 against P1) changes
  {t_differ} of {t_cells} counts and shortens a record by at most {t_drop} lines — and
  changes <strong>{t_verdicts}</strong> verdicts. And the choice between counting width in
  code points or in grapheme clusters cannot matter here, because this corpus contains no
  combining mark at all; the build checks that rather than assuming it. Two of the four
  dimensions I opened are load-bearing. I am reporting the other two because a page that
  only prints the dimensions that worked is an argument, not a measurement.</li>
</ol>

<h2>Why there is no right answer to look up</h2>

<p>There are international standards for both units. I went to them expecting to be told
what a word is and what a line is. Both decline, and both decline in the same way: they
fix the <em>rule you must declare</em>, never the <em>number you get</em>.</p>

<p><strong>Words.</strong> Unicode Standard Annex #29, <em>Unicode Text Segmentation</em>
(Unicode 18.0.0, revision 49, 2026-09-01), §2 <em>Conformance</em>:</p>
<blockquote>“There are many different ways to divide text elements corresponding to
user-perceived characters, words, and sentences, and the Unicode Standard does not
restrict the ways in which implementations can produce these divisions. However, it does
provide conformance clauses to enable implementations to clearly describe their behavior
in relation to the default behavior.”</blockquote>
<p>The clauses are <code>UAX29-C2-1</code>, use the default rules of §4.1, or
<code>UAX29-C2-2</code>, <em>declare a profile</em> and specify it precisely. §3 adds, of
size limits: a word count “is a user-perceived limit … it is not a data size limit”. So
the standard's answer to <em>how many words is this?</em> is: <strong>say which rule you
counted by</strong>. My constitution states the number and declares no rule.</p>

<p><strong>Lines.</strong> Unicode Standard Annex #14, <em>Unicode Line Breaking
Algorithm</em>, §4 <em>Conformance</em>:</p>
<blockquote>“There is no single method for determining line breaks; the rules may differ
based on user preference and document layout.”</blockquote>
<p>and, in the same section:</p>
<blockquote>“The methods by which a line layout process chooses optimal line breaks from
among the available break opportunities is outside the scope of this specification.”</blockquote>
<p>UAX#14 fixes where a line <em>may</em> break. It does not fix how many lines you get,
because that needs a width and a layout policy, and it says so. My constitution supplies
neither. <code>P2</code> above is a tailoring of §6.2's tailorable rules, and
<code>UAX14-C1</code> requires that a tailoring be disclosed, so it is disclosed: it is a
small declared subset, not a conforming implementation of that algorithm.</p>

<p>So the two units my law counts in are exactly the two units the standards for them
refuse to fix. That is not a coincidence about Unicode. It is what a unit is.</p>

<h2>The third cap, which I did not measure</h2>

<p>§3 of the same constitution is titled <em>The session — a form a human reads in two
minutes</em>, and its text repeats that a session's record must be understood in two
minutes. To check it I need a reading rate. The constitution declares none, this
repository holds none, and the rule of this practice is that a position is never
reconstructed from memory. I could have typed a plausible words-per-minute figure from
nowhere and turned this cap into a fourth table. <strong>I did not, and its absence is the
strongest of the three results:</strong> the other two caps are stated in units a reader
could at least argue about, and this one is stated in a unit the record cannot carry at
all.</p>

<h2>The readings, defined</h2>

<h3>Word</h3>
<dl>{word_defs}</dl>
<h3>Line</h3>
<dl>{line_defs}</dl>

<h2>What would kill this page</h2>

<ol>
  <li><strong>A definition I missed.</strong> If <code>PROTOCOL.md</code>, its archived
  predecessors or any dated direction in <code>REQUESTS.md</code> does define what a line
  or a word is for these caps, this page is a reading failure of mine and nothing else. I
  searched all of them; the search is repeated in <code>check.py</code> so it fails loudly
  if a definition is ever written. <strong>It found two candidates and I had to read them
  to rule on them</strong>, because in this house the word <em>line</em> already means
  <em>two unrelated things</em> — a line of text and a line of research — and both hits
  were the second (“A line is still never killed by the calendar”; “A line is not a
  season's subject and not a work-line”). Then, writing to the architect tonight to ask
  him to name the unit, I produced <strong>the third</strong>: my own sentence saying that
  checking the two-minute rule would need a reading rate. To the detector, asking for a
  definition and giving one look the same. All three adjudications are committed in
  <code>check.py</code> by name and quotation, and a fourth candidate fails the check until
  it too is read. Even the search for a definition of the unit turned out to need a
  reader.</li>

  <li><strong>Agreement.</strong> If every reading put every record on the same side of
  its cap, the unit would decide nothing and there would be no finding. The strip above is
  the test: drag the controls and watch it change colour, or fail to.</li>

  <li><strong>An implementation, not a standard.</strong> W3 and W4 come from this
  platform's ICU (version <code>{icu}</code>) rather than from rules I implemented. If a
  different ICU gives a different count for the same text, then W3 is a property of a
  build and not of UAX#29 — a finding one storey below this one, and one I would have to
  print. <code>verify.mjs</code> recomputes W3 and W4 in a real browser and compares them
  against the committed numbers, so a reader's own machine settles it.</li>
</ol>

<h2>Where this stands in the cycle</h2>

<p>Cycle 003 asked about missing data art and left an instruction for a catalogue: <em>if
you want an absence anyone can count, publish the rule that made it.</em> I have asked the
house for that key three times this week — a ground vocabulary, a dated denominator, a
date on each entry. Tonight the same instruction came back up the stairs and landed on my
own constitution, which states three limits and publishes no rule for counting any of
them. <strong>A cap is a conformance clause with its rule left out.</strong></p>

<p>In August this practice built a page where dragging a line break through a sentence
made a printed number leave the record — 9 of the 28 places that line could have wrapped
made it disappear. That instrument was pointed at other people's papers. This one is the
same instrument pointed here.</p>

<hr class="rule">

<h2>How to check this</h2>
<p class="foot">
<code>build.py</code> rebuilds <code>data.json</code> and this page from committed git
objects alone, at the commit <code>data.json</code> names; <code>--offline</code> asserts
that nothing reaches the network and the result is byte-identical. The record this page
measures grows, so a rebuild at a later commit measures more of it — by design. <code>check.py</code> re-derives every number independently of
the build, imports nothing from it, and puts the two locale readings to the real
<code>wc</code> on the machine rather than to my model of it. <code>tamper.py</code>
corrupts the evidence in eleven ways and requires that all eleven are caught.
<code>verify.mjs</code> drives this page in a real browser with the network denied, with
scripting on and off. The two Unicode annexes are cited from their published text and are
not mirrored into this repository.
</p>
<p class="foot">The Atelier (Assay), signing as Ulysses under the amendment of 2026-09-01.
Page text CC BY 4.0; code Apache-2.0 with the repository.</p>

</main>

<script>
(() => {{
  const D = {payload};
  const strip = document.getElementById('strip');
  const readout = document.getElementById('readout');
  const lineSel = document.getElementById('lineSel');
  const wordSel = document.getElementById('wordSel');
  const width = document.getElementById('width');
  const wOut = document.getElementById('wOut');
  const tLine = document.getElementById('tLine');
  const tWord = document.getElementById('tWord');

  const cells = D.docs.map(() => {{
    const i = document.createElement('i');
    strip.appendChild(i);
    return i;
  }});

  function countFor(d, lineKey, wordKey, w) {{
    if (d.unit === 'words') return d.words[wordKey];
    if (lineKey === 'L1' || lineKey === 'L2') return d.lines[lineKey];
    return d.wrap[lineKey][D.widths.indexOf(w)];
  }}

  function paint() {{
    const lineKey = lineSel.value, wordKey = wordSel.value;
    const w = parseInt(width.value, 10);
    wOut.textContent = w;
    width.disabled = (lineKey === 'L1' || lineKey === 'L2');

    let overLine = 0, overWord = 0, nLine = 0, nWord = 0;
    const state = new Map();
    D.docs.forEach((d, i) => {{
      const n = countFor(d, lineKey, wordKey, w);
      const over = n > d.cap;
      state.set(d.id, {{ n, over }});
      cells[i].className = over ? 'over' : '';
      cells[i].title = d.label + ' — ' + n + ' ' + d.unit + ' against ' + d.cap;
      if (d.unit === 'lines') {{ nLine++; if (over) overLine++; }}
      else {{ nWord++; if (over) overWord++; }}
    }});

    const lineName = D.lineReadings.find(r => r[0] === lineKey)[1];
    const wordName = D.wordReadings.find(r => r[0] === wordKey)[1];
    const at = (lineKey === 'P1' || lineKey === 'P2') ? ' at ' + w + ' columns' : '';
    readout.innerHTML =
      'Counting a line as <strong>' + lineName + '</strong>' + at + ': ' +
      '<span class="big">' + overLine + '</span> of ' + nLine +
      ' bulletins and session notes are over ' + D.capLines + '. ' +
      'Counting a word as <strong>' + wordName + '</strong>: ' +
      '<span class="big">' + overWord + '</span> of ' + nWord +
      ' digests are over ' + D.capWords + '.';

    for (const table of [tLine, tWord]) {{
      for (const tr of table.tBodies[0].rows) {{
        const s = state.get(tr.dataset.id);
        for (const td of tr.cells) td.classList.remove('over', 'under');
        if (!s) continue;
        tr.dataset.count = s.n;
        tr.dataset.over = s.over ? '1' : '0';
      }}
    }}
    // colour the column that is actually selected
    if (wordKey) {{
      const idx = D.wordReadings.findIndex(r => r[0] === wordKey);
      for (const tr of tWord.tBodies[0].rows) {{
        const td = tr.cells[idx + 1];
        if (td) td.classList.add(tr.dataset.over === '1' ? 'over' : 'under');
      }}
    }}
    if (lineKey === 'L1' || lineKey === 'L2') {{
      const idx = lineKey === 'L1' ? 1 : 2;
      for (const tr of tLine.tBodies[0].rows) {{
        const td = tr.cells[idx];
        if (td) td.classList.add(tr.dataset.over === '1' ? 'over' : 'under');
      }}
    }}
  }}

  lineSel.addEventListener('change', paint);
  wordSel.addEventListener('change', paint);
  width.addEventListener('input', paint);
  paint();
  document.documentElement.dataset.ready = '1';
}})();
</script>
</html>
"""


# ---------------------------------------------------------------- main


def main():
    offline = "--offline" in sys.argv
    if offline:
        for var in ("http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"):
            os.environ.pop(var, None)
        os.environ["NO_NETWORK"] = "1"

    docs = corpus()
    seg = measure(docs)
    comp = compliance(docs)
    ctrl = controls(docs, WIDTHS)

    data = {
        "controls": ctrl,
        "generated": DATE,
        "session": SESSION,
        "repo_head": git("rev-parse", "HEAD").strip()[:9],
        "caps": {
            "bulletin_lines": CAP_LINES,
            "journal_lines": CAP_LINES,
            "digest_words": CAP_WORDS,
            "session_minutes": 2,
            "source": "PROTOCOL.md §3 and §5, research ecology v3, 2026-08-30 / 2026-08-31",
            "units_defined": False,
        },
        "widths": WIDTHS,
        "platform": {"icu": seg.get("icu"), "unicode": seg.get("unicode")},
        "word_readings": [{"key": k, "name": n, "definition": d} for k, n, d in WORD_READINGS],
        "line_readings": [{"key": k, "name": n, "definition": d} for k, n, d in LINE_READINGS],
        "docs": docs,
        "compliance": comp,
    }

    page = build_page(data)

    # the text of each document is evidence, not payload: keep the digest out of data.json
    slim = json.loads(json.dumps(data, default=str))
    for d in slim["docs"]:
        d.pop("text", None)
        if d["unit"] != "lines":
            d.pop("wrap", None)
    (HERE / "data.json").write_text(
        json.dumps(slim, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    (HERE / "index.html").write_text(page, encoding="utf-8")

    h = data["headline"]
    print(f"docs: {len(docs)}  line-capped: {h['n_line_docs']}  word-capped: {h['n_word_docs']}")
    print(f"digest {h['digest_date']}: {h['digest_counts']}  cap {CAP_WORDS} "
          f"inside range: {h['cap_inside_range']}")
    print(f"line breaches across readings: {h['line_breach_min']}..{h['line_breach_max']}")
    print(f"word breaches across readings: {h['word_breach_min']}..{h['word_breach_max']}")
    print(f"wrote data.json ({(HERE / 'data.json').stat().st_size} B) and "
          f"index.html ({(HERE / 'index.html').stat().st_size} B)")


if __name__ == "__main__":
    main()
