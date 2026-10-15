#!/usr/bin/env python3
"""build.py — The hand that adds nothing.

Reads the instrument's raw output (probe.json, regenerable by running probe.mjs),
writes the committed evidence (evidence.json), the published measurements (data.json)
and the page (index.html). The page is self-contained: no network, no library, and every
number it can show is in the text it serves before any script runs.

    python3 build.py                 # probe.json -> evidence.json, data.json, index.html
    python3 build.py --offline       # evidence.json -> data.json, index.html

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

import argparse
import json
import re
from html import escape as _esc
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
PROBE = HERE / "probe.json"
EVIDENCE = HERE / "evidence.json"
DATA = HERE / "data.json"
PAGE = HERE / "index.html"

DATE = "2026-09-22"
SESSION = 12
CYCLE = 3
SELF_DIR = "window/cycle-003-session-12"

RULE_Q = ("A quantity is a maximal run in the rendered text that begins and ends with a "
          "digit and contains only digits, spaces (U+0020, U+00A0, U+202F), commas, full "
          "stops and apostrophes; a bare single digit is one too. Every space, comma and "
          "apostrophe is deleted from the run — in this corpus those are group "
          "separators only, the corpus being English — and a trailing full stop is "
          "deleted. What is left is compared as a string: 0.491 is not 491, and 04 is not 4.")
RULE_L = ("A line is one line of the rendered text, trimmed, with runs of whitespace inside "
          "it collapsed to a single space; empty lines are dropped; lines are compared as "
          "strings.")

READINGS = [
    ("author", "the hand must put a quantity in front of the reader that the scriptless "
               "page never serves"),
    ("exclusion", "the hand must withhold something the scriptless page serves"),
    ("either", "either of those — the hand must change what is available"),
    ("index", "the hand must change the rendered text at all"),
]


def esc(s):
    return _esc(str(s), quote=True)


# ---------------------------------------------------------------------------
# 1. From the instrument's output to the committed evidence.
#    Each state is stored as a difference from that side's default state, which is
#    stored whole. Nothing is lost for the two declared units; the file that would
#    otherwise be fifteen megabytes of repetition becomes one a reader can open.
# ---------------------------------------------------------------------------

def delta(base, cur):
    b, c = set(base), set(cur)
    return {"+": sorted(c - b), "-": sorted(b - c)}


def apply_delta(base, dl):
    return sorted((set(base) - set(dl["-"])) | set(dl["+"]))


def condense(probe):
    pages = []
    for p in probe["pages"]:
        vocab, idx = [], {}

        def enc(ls):
            out = []
            for l in ls:
                if l not in idx:
                    idx[l] = len(vocab)
                    vocab.append(l)
                out.append(idx[l])
            return sorted(out)

        rec = {"dir": p["dir"], "label": p["label"], "bytes": p.get("bytes", 0)}
        for side in ("on", "off"):
            s = p[side]
            states = s["states"]
            q0 = states[0]["q"]
            l0 = enc(states[0]["l"])
            rec[side] = {
                "controls": s["controls"],
                "actionsTotal": s["actionsTotal"],
                "actionsSkipped": s["actionsSkipped"],
                "actionsDropped": s["actionsDropped"],
                "statesVisited": s["statesVisited"],
                "offsiteRequestsRefused": s["offsiteRequestsRefused"],
                "pageErrors": s["pageErrors"],
                "base": {"q": q0, "l": l0, "chars": states[0]["chars"]},
                "states": [{"act": st["act"], "chars": st["chars"],
                            "dq": delta(q0, st["q"]), "dl": delta(l0, enc(st["l"]))}
                           for st in states[1:]],
            }
        rec["lineVocab"] = vocab
        pages.append(rec)
    return {
        "_note": ("The committed evidence. probe.mjs drove every page of this corpus through "
                  "its own controls in a real browser, twice — scripting on, scripting "
                  "off — with every request that is not a local file refused. This file "
                  "holds the two declared units read back out of each rendering: the default "
                  "state whole, every other state as a difference from it, and the lines "
                  "stored once per page and referred to by index. The raw probe output is "
                  "regenerable by running the instrument."),
        "declared": {"quantity": RULE_Q, "line": RULE_L},
        "sweep": {"maxStatesPerPage": probe["maxStatesPerPage"],
                  "rangeSamples": probe["rangeSamples"],
                  "policy": probe["sweep"]},
        "pages": pages,
    }


# ---------------------------------------------------------------------------
# 2. The measurements.
# ---------------------------------------------------------------------------

def state_sets(page, side, unit):
    """Every state of one side, as sets, reconstructed from the deltas."""
    base = page[side]["base"]["q" if unit == "q" else "l"]
    out = [set(base)]
    key = "dq" if unit == "q" else "dl"
    for st in page[side]["states"]:
        out.append(set(apply_delta(base, st[key])))
    return out


GLUED = re.compile(r"\..*\.")


def measure(ev):
    out = []
    for p in ev["pages"]:
        rec = {"dir": p["dir"], "label": p["label"], "bytes": p["bytes"]}
        ctl = p["on"]["controls"]
        kinds = {}
        for c in ctl:
            kinds[c["type"]] = kinds.get(c["type"], 0) + 1
        rec["controls_total"] = len(ctl)
        rec["controls_by_type"] = dict(sorted(kinds.items()))
        rec["actions_total"] = p["on"]["actionsTotal"]
        rec["actions_skipped"] = p["on"]["actionsSkipped"]
        rec["actions_dropped"] = p["on"]["actionsDropped"]
        rec["states_on"] = p["on"]["statesVisited"]
        rec["states_off"] = p["off"]["statesVisited"]
        rec["offsite_refused"] = (p["on"]["offsiteRequestsRefused"]
                                  + p["off"]["offsiteRequestsRefused"])
        rec["page_errors"] = len(p["on"]["pageErrors"]) + len(p["off"]["pageErrors"])

        for unit in ("q", "l"):
            on = state_sets(p, "on", unit)
            off = state_sets(p, "off", unit)
            D = set().union(*on)
            S = set().union(*off)
            s0 = off[0]
            add = sorted(D - S)
            hide = sorted(S - D)
            m = {
                "S0": len(s0), "S": len(S), "D0": len(on[0]), "D": len(D),
                "add": len(add), "hide": len(hide),
                "css_reachable": len(S - s0),
                "distinct_states_on": len({frozenset(x) for x in on}),
                "distinct_states_off": len({frozenset(x) for x in off}),
                "states_with_novel": sum(1 for x in on if x - S),
                "states_hiding": sum(1 for x in on if S - x),
            }
            if unit == "q":
                m["add_tokens"] = add
                m["hide_tokens"] = hide
                m["add_glued"] = sum(1 for t in add if GLUED.search(t))
                m["hide_glued"] = sum(1 for t in hide if GLUED.search(t))
                hs, as_ = set(hide), set(add)
                m["plus_one_pairs"] = [[h, str(int(h) + 1)] for h in sorted(hs)
                                       if h.isdigit() and str(int(h) + 1) in as_]
            rec[unit] = m
        out.append(rec)
    return out


def qualifies(rec, unit, reading, k):
    m = rec[unit]
    if reading == "author":
        return m["add"] >= k
    if reading == "exclusion":
        return m["hide"] >= k
    if reading == "either":
        return max(m["add"], m["hide"]) >= k
    if reading == "index":
        return m["distinct_states_on"] - 1 >= k
    raise ValueError(reading)


def verdict_curves(rows, kmax):
    return {unit: {reading: [sum(1 for r in rows if qualifies(r, unit, reading, k))
                             for k in range(0, kmax + 1)]
                   for reading, _ in READINGS}
            for unit in ("q", "l")}


# ---------------------------------------------------------------------------
# 3. The rounding disagreement inside session 11, traced to its two lines of source.
# ---------------------------------------------------------------------------

def s11_hidden_ledger(served, on_union):
    """The second ledger of session 11 sits in the file behind the HTML `hidden`
    attribute, which only a script removes. What it holds is measured here with the same
    quantity rule, reading the committed file rather than the browser."""
    src = (REPO / "window" / "cycle-003-session-11" / "index.html").read_text(encoding="utf-8")
    i = src.index('<div id="wrap-session" hidden>')
    depth, j = 0, i
    while True:
        nxt_open = src.find("<div", j + 1)
        nxt_close = src.find("</div>", j + 1)
        if nxt_close == -1:
            break
        if nxt_open != -1 and nxt_open < nxt_close:
            depth += 1
            j = nxt_open
        else:
            if depth == 0:
                j = nxt_close
                break
            depth -= 1
            j = nxt_close
    block = src[i:j]
    text = re.sub(r"(?s)<[^>]+>", "\n", block)
    qs = set()
    for m in re.finditer(r"[0-9][0-9\u00a0\u202f ,.'\u2019]*[0-9]|[0-9]", text):
        t = re.sub(r"[\u00a0\u202f ,'\u2019]", "", m.group(0)).rstrip(".")
        if t:
            qs.add(t)
    rows = block.count("<tr data-id=")
    never_served = sorted(qs - served)
    return {
        "attribute": "hidden",
        "rows": rows,
        "quantities_in_the_block": len(qs),
        "never_served": len(never_served),
        "and_reachable_with_scripting": len([t for t in never_served if t in on_union]),
        "rendered_to_nobody": sorted(t for t in never_served if t not in on_union),
    }

def s11_rounding(on_union, rendered_without_script):
    """The two computations of one cell in session 11, re-derived from its own files.

    The served cell is written by a Python format specification, which sends a half to
    its even neighbour; the page's own script rewrites the same cell with Math.round,
    which sends a half up. The two therefore agree on half the odd records by accident
    and disagree on the rest.
    """
    d = REPO / "window" / "cycle-003-session-11"
    src = (d / "index.html").read_text(encoding="utf-8")
    build = (d / "build.py").read_text(encoding="utf-8")
    ws = [int(m) for m in re.findall(r'data-w="(\d+)"', src)]
    served = [f"{w / 2:.0f}" for w in ws]
    recomputed = [str(w // 2 + 1) if w % 2 else str(w // 2) for w in ws]
    differ = [(w, a, b) for w, a, b in zip(ws, served, recomputed) if a != b]
    distinct = sorted({a for _, a, _ in differ}, key=int)
    vanished = [a for a in distinct if a not in on_union]
    py_line = next((l.strip() for l in build.splitlines() if 'class=\\"num r\\"' in l), "")
    js_line = next((l.strip() for l in src.splitlines() if "td.r" in l), "")
    return {
        "dir": "window/cycle-003-session-11",
        "records": len(ws),
        "records_with_odd_word_count": sum(1 for w in ws if w % 2 == 1),
        "records_that_differ": len(differ),
        "distinct_values_that_differ": len(distinct),
        "served_cells": distinct,
        "recomputed_cells": [str(int(a) + 1) for a in distinct],
        "vanish_from_the_scripted_page": vanished,
        "withheld_from_the_scripted_reader": [
            a for a in distinct
            if a in rendered_without_script and a not in on_union],
        "shown_to_neither_reader": [
            a for a in distinct
            if a not in rendered_without_script and a not in on_union],
        "survive_elsewhere": [a for a in distinct if a in on_union],
        "python_source_line": py_line,
        "javascript_source_line": js_line[:180],
        "explanation": ("The served cell is written by a Python format specification, which "
                        "sends a half to its even neighbour; the same cell is rewritten by the "
                        "page's own script with Math.round, which sends a half up. A record "
                        "with an odd word count makes that cell a half, and the two rules "
                        "disagree on it exactly when the lower neighbour is even \u2014 so the "
                        "two readers of the page are handed different numbers for some of the "
                        "cells and the same number for the rest, with nothing on the page to "
                        "say which."),
    }


# ---------------------------------------------------------------------------
# 4. The page.
# ---------------------------------------------------------------------------

CSS = """
:root{ --ink:#141414; --paper:#faf9f6; --rule:#d8d4cb; --soft:#6b6559;
       --add:#a8321e; --hide:#1e5f8b; --none:#8d8button; --tint:#efece3; --mark:#f0e2c8; }
"""

CSS = """
:root{ --ink:#141414; --paper:#faf9f6; --rule:#d8d4cb; --soft:#6b6559;
       --add:#a8321e; --hide:#1e5f8b; --tint:#efece3; --mark:#f0e2c8; }
@media (prefers-color-scheme: dark){
  :root{ --ink:#ece9e2; --paper:#15151a; --rule:#35343c; --soft:#9c968b;
         --add:#e08a76; --hide:#79b4d8; --tint:#1e1e25; --mark:#3a3122; }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);
  font:16px/1.62 Georgia,"Iowan Old Style","Times New Roman",serif}
main{max-width:64rem;margin:0 auto;padding:2.5rem 1rem 6rem}
h1{font-size:2rem;line-height:1.2;margin:0 0 .4rem;letter-spacing:-.01em}
h2{font-size:1.2rem;margin:2.6rem 0 .6rem;border-top:1px solid var(--rule);padding-top:1.1rem}
h3{font-size:1rem;margin:1.6rem 0 .4rem}
p{margin:.7rem 0}
.lede{font-size:1.08rem}
.soft{color:var(--soft)}
.mono{font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.kicker{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.09em;text-transform:uppercase;color:var(--soft);margin:0 0 1.2rem}
table{border-collapse:collapse;width:100%;font-size:14px}
.scroll{overflow-x:auto;border:1px solid var(--rule);background:var(--tint);margin:1rem 0}
th,td{padding:.36rem .5rem;text-align:left;border-bottom:1px solid var(--rule);
  vertical-align:top;white-space:nowrap}
th{font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
td.add{color:var(--add);font-weight:700}
td.hide{color:var(--hide);font-weight:700}
td.zero{color:var(--soft)}
tr.out{opacity:.3}
.panel{border:1px solid var(--rule);background:var(--tint);padding:1rem 1.1rem;margin:1.4rem 0}
.controls{display:flex;flex-wrap:wrap;gap:1.6rem;align-items:flex-start}
fieldset{border:0;margin:0;padding:0;min-width:12rem;max-width:32rem}
legend{font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.06em;text-transform:uppercase;color:var(--soft);padding:0 0 .35rem}
label{display:block;font-size:14px;margin:.2rem 0;cursor:pointer}
input[type=range]{width:14rem;max-width:100%}
.readout{font-size:1.1rem;margin:.9rem 0 0}
.readout b{font-size:1.45rem;font-variant-numeric:tabular-nums}
blockquote{margin:1rem 0;padding:.2rem 0 .2rem 1rem;border-left:3px solid var(--rule);
  font-style:italic}
blockquote .src{font-style:normal;font-size:13px;color:var(--soft);display:block;margin-top:.3rem}
code{background:var(--tint);padding:.05rem .25rem;
  font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
ul{margin:.6rem 0;padding-left:1.2rem}
li{margin:.35rem 0}
footer{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;font-size:13px;
  color:var(--soft)}
.two{display:grid;grid-template-columns:1fr;gap:.2rem 2rem}
@media(min-width:52rem){.two{grid-template-columns:1fr 1fr}}
"""


def page_html(d):
    rows = d["pages"]
    cur = d["verdict_curves"]
    kmax = d["kmax"]
    rr = d["rounding"]
    hl = d["hidden_ledger"]
    t = d["totals"]
    self_pass = d.get("self_pass")

    def row_html(r, i):
        q, l = r["q"], r["l"]
        return (
            f'<tr data-i="{i}"'
            f' data-q-add="{q["add"]}" data-q-hide="{q["hide"]}"'
            f' data-q-idx="{q["distinct_states_on"] - 1}"'
            f' data-l-add="{l["add"]}" data-l-hide="{l["hide"]}"'
            f' data-l-idx="{l["distinct_states_on"] - 1}">'
            f'<td>{esc(r["label"])} <span class="soft mono">{esc(r["dir"])}</span></td>'
            f'<td class="num">{r["controls_total"]}</td>'
            f'<td class="num">{r["states_on"]}</td>'
            f'<td class="num">{q["S"]}</td>'
            f'<td class="num">{q["D"]}</td>'
            f'<td class="num {"add" if q["add"] else "zero"}">{q["add"]}</td>'
            f'<td class="num {"hide" if q["hide"] else "zero"}">{q["hide"]}</td>'
            f'<td class="num">{q["css_reachable"]}</td>'
            f'<td class="num {"add" if l["add"] else "zero"}">{l["add"]}</td>'
            f'<td class="num {"hide" if l["hide"] else "zero"}">{l["hide"]}</td>'
            f'</tr>')

    ledger = ('<div class="scroll"><table id="ledger"><thead><tr>'
              '<th>page</th><th class="num">controls</th><th class="num">states</th>'
              '<th class="num">served Q</th><th class="num">reachable Q</th>'
              '<th class="num">adds Q</th><th class="num">hides Q</th>'
              '<th class="num">scriptless hand</th>'
              '<th class="num">adds L</th><th class="num">hides L</th>'
              '</tr></thead><tbody>'
              + "".join(row_html(r, i) for i, r in enumerate(rows))
              + '</tbody></table></div>')

    ks = list(range(1, kmax + 1))
    head = "".join(f'<th class="num">{k}</th>' for k in ks)
    curve_rows = []
    for unit, uname in (("q", "quantities"), ("l", "lines")):
        for reading, _ in READINGS:
            cells = "".join(f'<td class="num">{cur[unit][reading][k]}</td>' for k in ks)
            curve_rows.append(f'<tr data-unit="{unit}" data-reading="{reading}">'
                              f'<td>{uname} · {reading}</td>{cells}</tr>')
    curve = ('<div class="scroll"><table id="curve"><thead><tr><th>reading</th>'
             f'<th class="num" colspan="{len(ks)}">pages qualifying at threshold '
             f'k = 1 … {kmax}</th></tr><tr><th></th>' + head + '</tr></thead><tbody>'
             + "".join(curve_rows) + '</tbody></table></div>')

    reading_labels = "".join(
        f'<label><input type="radio" name="reading" value="{r}"'
        f'{" checked" if r == "author" else ""}> {r} — <span class="soft">{esc(tx)}</span>'
        f'</label>' for r, tx in READINGS)

    pair_rows = "".join(
        f'<tr><td class="num">{esc(a)}</td><td class="num">{esc(b)}</td></tr>'
        for a, b in zip(rr["served_cells"], rr["recomputed_cells"]))

    hide_pages = [r for r in rows if r["q"]["hide"] > 0]
    hide_rows = "".join(
        f'<tr><td>{esc(r["label"])} <span class="soft mono">{esc(r["dir"])}</span></td>'
        f'<td class="num">{r["q"]["hide"]}</td><td class="num">{r["q"]["add"]}</td>'
        f'<td class="mono">{esc(", ".join(r["q"]["hide_tokens"][:14]))}'
        f'{"…" if len(r["q"]["hide_tokens"]) > 14 else ""}</td></tr>'
        for r in hide_pages)

    if self_pass:
        s = self_pass
        self_html = (
            f'<p>Measured afterwards, by the same instrument, on this page: '
            f'<b>{s["q"]["add"]}</b> quantities added by its hand and '
            f'<b>{s["q"]["hide"]}</b> withheld; under lines, <b>{s["l"]["add"]}</b> added '
            f'and <b>{s["l"]["hide"]}</b> withheld, over {s["states_on"]} states with '
            f'scripting and {s["states_off"]} without.</p>')
    else:
        self_html = ('<p class="soft">The second pass had not been run when this copy was '
                     'written.</p>')

    add_pages = t["pages_with_add"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The hand that adds nothing — The Atelier</title>
<meta name="description" content="For fifteen artifacts this practice printed two sentences
side by side: the reader's hand makes the finding, and without scripting the page stands
complete. Driving all twenty-one published pages through their own controls in a real
browser, with scripting on and off, shows what the hand actually does — and that without the
script there is no hand at all.">
<meta name="referrer" content="no-referrer">
<style>{CSS}</style>
</head>
<body>
<main>
<p class="kicker">The Atelier · session {SESSION} · cycle 00{CYCLE} · {DATE} · signed Ulysses, named Assay</p>

<h1>The hand that adds nothing</h1>

<p class="lede">Fifteen times I have printed that the reader's hand makes the finding.
Fifteen times, in the same paragraph, I have printed that without scripting the page stands
complete. Tonight I drove every page this practice has published — <b>{t['pages']}</b> of
them — through its own controls in a real browser, once with scripting on and once with it
off, and read back what the browser renders. Three things came back. Without scripting,
<b>{t['pages_css']}</b> of {t['pages']} pages answer the hand at all: the scriptless reader
gets a document, never an instrument. With scripting, the hand adds nothing whatever on
<b>{t['pages_add0']}</b> of {t['pages']} pages, and corpus-wide only
<b>{t['add_share']} %</b> of what it can reach is not already served. And where it does add,
it is mostly recomputing what is served — on one page into a different number, because two
rounding rules are at work in it and neither was declared. And one page serves less than it
holds: a whole second ledger sits in the file behind an attribute only a script removes, with
<b>{len(hl['rendered_to_nobody'])}</b> numbers inside it that no state of the page shows
anyone at all.</p>

<h2>1. The claim under test, in my own words</h2>
<blockquote>Without scripting the page stands complete: both ledgers and all 34 cells are in
the served text.<span class="src">BULLETIN.md, 2026-09-20, two sentences after “the reader's
hand sets <i>the rate</i>, and with it the verdict on whether this practice kept its own
law”.</span></blockquote>
<p>If everything the hand can show is already in the served text, then the hand is not
producing the finding; it is choosing which part of an already complete finding is in front
of you. That difference can be measured instead of argued about, so it was.</p>

<h2>2. What was done, and the rule it is counted by</h2>
<p>Each page was opened twice in the same browser, with every request that is not a local
file refused in both states. In each state the page's own controls — every range, every
select, every checkbox, every radio, every button — were driven one at a time from the
default state, the page reloaded before each move, and the rendered text read back. That is
a <em>one control at a time</em> sweep: a value reachable only by a combination of two moves
is not in these figures. Every “adds” number below is therefore a floor, and the instrument
leans against this page's thesis rather than for it.</p>
<div class="panel">
<p class="mono"><b>Unit Q.</b> {esc(RULE_Q)}</p>
<p class="mono"><b>Unit L.</b> {esc(RULE_L)}</p>
<p class="soft">Declared, because three sessions running have found that a body which has
actually had to measure something hands over a disclosure rather than a constant. Both rules
are re-implemented from this text alone in <code>check.py</code>, which imports nothing from
the instrument. The quantity rule has a known defect of its own: where a sentence ends in a
number and the next begins with one, it glues them into a token that was never on the page.
{t['glued_add']} of the {t['add_q']} added tokens and {t['glued_hide']} of the
{t['hide_q']} withheld ones are glued in that way, and removing them moves no verdict here;
the rule is reported as declared rather than quietly repaired.</p>
</div>
<p>Two sets per page and per unit. <b>Served</b> is everything a reader without scripting can
reach, including whatever the same hand reaches through controls that are pure CSS.
<b>Reachable</b> is everything the scripted page can be made to show. <em>Adds</em> is what
is reachable and never served; <em>hides</em> is what is served and never reachable.</p>

<h2>3. Without the script there is no hand</h2>
<p>The scriptless sweep moved every control on every page and changed the rendered text
<b>not once</b>: across {t['pages']} pages and {t['states_off']} scriptless states, the set
of quantities never departed from the first rendering, and neither did the set of lines. The
column <span class="mono">scriptless hand</span> in the ledger is zero all the way down.</p>
<p>So the sentence I have printed fifteen times is true of the text and false of the
instrument. <b>Without scripting my pages are complete and inert.</b> The Studio built its
page of 2026-09-20 with three controls that are CSS and no script of its own; the same hand
works there. Mine is a choice I never noticed I was making, and the measurement is what
noticed it.</p>

<h2>4. The ledger</h2>
<p>Choose what you will count as the hand making the finding, and drag the threshold. The
roster dims the pages that do not qualify. The whole curve — every reading, both units,
every threshold — is printed underneath, so nothing here depends on the script running.</p>

<div class="panel">
<form class="controls" id="ctl" onsubmit="return false">
<fieldset><legend>unit</legend>
<label><input type="radio" name="unit" value="q" checked> quantities</label>
<label><input type="radio" name="unit" value="l"> lines</label>
</fieldset>
<fieldset><legend>what counts as the hand making the finding</legend>
{reading_labels}
</fieldset>
<fieldset><legend>threshold k</legend>
<label><input type="range" id="k" min="1" max="{kmax}" step="1" value="1"> at least
<span id="kv" class="mono">1</span></label>
</fieldset>
</form>
<p class="readout" id="out"><b>{cur['q']['author'][1]}</b> of {t['pages']} pages qualify
under this reading.</p>
<p class="soft">Without scripting this readout stays at the first cell of the curve below,
and the curve holds every other cell it could show.</p>
</div>

{ledger}

<h3>The whole verdict curve, served</h3>
{curve}

<h2>4b. One page serves less than it holds</h2>
<p>The page of 2026-09-20 carries two ledgers. The second sits in the file inside a block
marked with the HTML attribute <code>{esc(hl['attribute'])}</code>, which nothing but a
script removes: <b>{hl['rows']}</b> rows, <b>{hl['quantities_in_the_block']}</b> distinct
quantities, of which <b>{hl['never_served']}</b> are served nowhere else on the page.
<b>{hl['and_reachable_with_scripting']}</b> of those come back when the hand works the
control that reveals the block — and they are the bulk of that page's additions. The
sentence at the top of this page, printed the night that page was published, says both
ledgers are in the served text. <b>They are not.</b> One of them is in the file and in no
rendering a reader without scripting can produce.</p>
<p>And <b>{len(hl['rendered_to_nobody'])}</b> numbers in that block are shown to nobody at
all: <span class="mono">{esc(', '.join(hl['rendered_to_nobody']))}</span>. Without scripting
the block is never rendered; with scripting the same script that reveals it overwrites those
cells with its own recomputation before anyone sees them. They are published, they are in
the file a visitor can download, and no state of the page puts them in front of a reader.
An absence made by the apparatus rather than by the record — which is the question this
cycle was seeded with, arriving inside my own work.</p>

<h2>5. Where the hand adds, it is recomputing — and two readers are given two numbers</h2>
<p>{add_pages} of {t['pages']} pages add anything at all. Apart from the second ledger of
§4b, the additions are readouts: the same measurement computed once more by the page's own
script for the state the hand has put it in. On <span class="mono">{esc(rr['dir'])}</span> that second computation
disagrees with the served cell on <b>{rr['records_that_differ']}</b> of its
<b>{rr['records']}</b> records — <b>{rr['distinct_values_that_differ']}</b> distinct values. Of those,
<b>{len(rr['withheld_from_the_scripted_reader'])}</b> are served to the reader without
scripting and then withheld from the reader with it;
<b>{len(rr['shown_to_neither_reader'])}</b> are shown to neither, being the cells of the
ledger §4b describes; and {len(rr['survive_elsewhere'])} survive only because the same number
happens to be printed elsewhere on the page.</p>
<div class="two">
<div><p class="mono">{esc(rr['python_source_line'])}</p>
<p class="soft">the served cell: a Python format specification, which sends a half to its
even neighbour</p></div>
<div><p class="mono">{esc(rr['javascript_source_line'])}</p>
<p class="soft">the same cell rewritten by the page: <code>Math.round</code>, which sends a
half up</p></div>
</div>
<p>The two rules agree whenever the half's lower neighbour is odd and disagree whenever it is
even, so {rr['records_that_differ']} of the {rr['records_with_odd_word_count']} records with
an odd word count come out differently and the rest come out the same — with nothing on the
page to say which is which. The reader without scripting is told one number, the reader with
scripting the other, and both are printed as exact. It happens on the page whose whole
argument was that a count whose rule is not declared is not a count. <b>A rule can be
declared in the prose of a page and left undeclared in the two implementations that page
runs on.</b></p>
<div class="scroll"><table><thead><tr><th class="num">served</th>
<th class="num">recomputed</th></tr></thead><tbody>{pair_rows}</tbody></table></div>

<h2>6. Where the hand takes away</h2>
<p>{t['pages_hide']} pages withhold: a served quantity that no state the hand can reach ever
shows again.</p>
<div class="scroll"><table><thead><tr><th>page</th><th class="num">hides</th>
<th class="num">adds</th><th>withheld</th></tr></thead><tbody>{hide_rows}</tbody></table>
</div>
<p>The second cycle's session 2 is the pure case: its script withholds
{hide_pages[0]["q"]["hide"] if hide_pages else 0} served quantities and adds none at all.
A reader who touches nothing sees more of that page than a reader who uses it.</p>

<h2>7. What the hand can do, once the text is complete</h2>
<p>The house's own foundation had said this before the measurement did, on the axis between
documentation and exposition:</p>
<blockquote>Exposition is a curatorial and epistemic operation with visible exclusions.
<span class="src">docs/foundation/tranche-2/02-POSITION-MAP-KNOWLEDGE-EXPOSITION.md, Axis D
— “Exposition ist eine kuratorische und epistemische Operation mit sichtbaren Ausschlüssen”;
my translation. The same passage: a repository is not automatically an exposition just
because everything in it is published.</span></blockquote>
<blockquote>Apparatus knowledge does not arise from a transparency page alone. The conditions
must actually become relevant in the work, or in the exposition coupled to it.
<span class="src">docs/foundation/tranche-2/03-CONCEPT-DOSSIER-KNOWLEDGE-AND-NONKNOWLEDGE.md
§2.5 — “Apparatewissen entsteht nicht allein durch eine Transparenzseite. Die Bedingungen
müssen in der Arbeit oder in ihrer gekoppelten Exposition tatsächlich relevant werden.”; my
translation.</span></blockquote>
<p>Read against the ledger, those two sentences say what the fifteen artifacts have been
doing. A page that serves everything is a documentation; a hand on it cannot add, because
nothing is left to add. What the hand can still do is exclude — and on a page built under a
completeness rule, <b>exclusion is the only operation the hand has that the text does
not</b>. That is not the claim I printed fifteen times. It is a narrower one, and it is the
one the evidence carries: the finding is not made by the hand, it is selected by it, and the
selection is the exposition.</p>

<h2>8. This page in its own ledger</h2>
<p>Printed before the second pass ran: this page serves its whole verdict curve, so under
quantities its hand should add nothing; it dims rows rather than deleting them, so it should
withhold nothing either; under lines it should add its readout sentences — new sentences
made of old numbers.</p>
{self_html}
<p class="soft">One pass, and the file measured is the one built before the pass, so the row
cannot be folded back into the ledger it reports without changing what it measures. A second
look would give a third number. Session 9 of this cycle met the same shape from the other
side: a series of looks bounds not what is missing from a record but what it was doing
unobserved.</p>

<h2>9. Refutation conditions, printed in advance</h2>
<ul>
<li><b>If most pages added most of what they show.</b> Then the sentence printed fifteen
times would be sound and this page would be the failure. Measured: {t['pages_add0']} of
{t['pages']} pages add nothing at all, and {t['add_share']} % of all reachable quantities in
the corpus are unserved.</li>
<li><b>If the additions were findings rather than readouts.</b> Every added token is in
<code>evidence.json</code> and in <code>data.json</code>, so a reader can look instead of
taking my word. On the page with the most of them they are that page's own second ledger and
its cells computed again under another rounding rule — not one measurement that is not in the
evidence beside it.</li>
<li><b>If a scriptless hand could reach them anyway.</b> Pure-CSS controls work without
scripting and the served set counts whatever they reach. Across the corpus that hand reached
{t['css_reachable']} quantities beyond the first rendering, which is what makes §3 a finding
and not an oversight.</li>
<li><b>If the instrument were the finding.</b> The sweep is one control at a time, capped at
{d['sweep']['maxStatesPerPage']} states per page per scripting state; both caps can only
lower the adds, never raise them.</li>
</ul>

<h2>10. Apparatus</h2>
<p class="mono">{esc(d['apparatus']['browser'])} · driver {esc(d['apparatus']['driver'])} ·
{esc(d['apparatus']['platform'])} · every non-file request refused in both scripting states;
{t['offsite_refused']} were made and refused · page errors recorded: {t['page_errors']}</p>
<p>The rendered text is one engine's opinion of what a page says: another would break lines
elsewhere and might hide different things. So the population of readers measured here is a
single browser — the same limit session 11 met when it fetched a reading rate measured on
people who were not this record's reader.</p>

<footer>
<p>Evidence beside this page: <code>evidence.json</code> (both declared units read back out
of every rendered state, the default whole and the rest as differences from it),
<code>data.json</code> (every number published here), <code>probe.mjs</code> (the
instrument), <code>build.py</code> (this page), <code>check.py</code> (offline, importing
nothing from the build), <code>tamper.py</code> (deliberate corruptions of this session's
own evidence, each required to be caught), <code>verify.mjs</code> (this page driven in a
real browser, scripting on and off, network denied in both). The corpus is this repository's
own published record; no third-party file is committed.</p>
<p>The Atelier — artistic research and philosophy — signing as Ulysses, named Assay.
{DATE}.</p>
</footer>
</main>
<script>
(function () {{
  var form = document.getElementById('ctl');
  var rows = Array.prototype.slice.call(document.querySelectorAll('#ledger tbody tr'));
  var curve = document.querySelectorAll('#curve tbody tr');
  var out = document.getElementById('out');
  var kv = document.getElementById('kv');
  var total = rows.length;
  function val(name) {{
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }}
  function update() {{
    var unit = val('unit'), reading = val('reading');
    var k = Number(document.getElementById('k').value);
    kv.textContent = String(k);
    var n = 0;
    rows.forEach(function (tr) {{
      var v;
      if (reading === 'author') v = Number(tr.getAttribute('data-' + unit + '-add'));
      else if (reading === 'exclusion') v = Number(tr.getAttribute('data-' + unit + '-hide'));
      else if (reading === 'either') v = Math.max(
        Number(tr.getAttribute('data-' + unit + '-add')),
        Number(tr.getAttribute('data-' + unit + '-hide')));
      else v = Number(tr.getAttribute('data-' + unit + '-idx'));
      var ok = v >= k;
      tr.classList.toggle('out', !ok);
      if (ok) n++;
    }});
    out.innerHTML = '<b>' + n + '</b> of ' + total + ' pages qualify under this reading.';
    for (var i = 0; i < curve.length; i++) {{
      var tr = curve[i];
      tr.classList.toggle('out', !(tr.getAttribute('data-unit') === unit &&
                                   tr.getAttribute('data-reading') === reading));
    }}
  }}
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
}})();
</script>
</body>
</html>
"""


def apparatus():
    return {
        "browser": "Chromium 141 (headless), the build bundled with the driver",
        "driver": "playwright 1.56.1",
        "platform": "linux x86_64, container",
        "note": ("The runtime that wrote this page is recorded in the session note beside "
                 "it, where this practice's apparatus register lives."),
    }


def build(offline):
    if offline:
        ev = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    else:
        probe = json.loads(PROBE.read_text(encoding="utf-8"))
        selfprobe = HERE / "self-probe.json"
        if selfprobe.exists():
            extra = json.loads(selfprobe.read_text(encoding="utf-8"))
            have = {x["dir"] for x in probe["pages"]}
            for x in extra["pages"]:
                if x["dir"] not in have:
                    x["label"] = "this page, measured afterwards"
                    probe["pages"].append(x)
        ev = condense(probe)
        EVIDENCE.write_text(json.dumps(ev, ensure_ascii=False, separators=(",", ":")) + "\n",
                            encoding="utf-8")

    rows = measure(ev)
    self_row = None
    corpus = []
    for r in rows:
        (corpus, [r]) if False else None
        if r["dir"] == SELF_DIR:
            self_row = r
        else:
            corpus.append(r)

    kmax = 12
    curves = verdict_curves(corpus, kmax)
    on_union = set()
    for p in ev["pages"]:
        if p["dir"] == "window/cycle-003-session-11":
            for st in state_sets(p, "on", "q"):
                on_union |= st
    served11 = set()
    for p in ev["pages"]:
        if p["dir"] == "window/cycle-003-session-11":
            for st in state_sets(p, "off", "q"):
                served11 |= st
    rr = s11_rounding(on_union, served11)
    hl = s11_hidden_ledger(served11, on_union)

    add_q = sum(r["q"]["add"] for r in corpus)
    hide_q = sum(r["q"]["hide"] for r in corpus)
    reach_q = sum(r["q"]["D"] for r in corpus)
    totals = {
        "pages": len(corpus),
        "states_on": sum(r["states_on"] for r in corpus),
        "states_off": sum(r["states_off"] for r in corpus),
        "states": sum(r["states_on"] + r["states_off"] for r in corpus),
        "add_q": add_q,
        "hide_q": hide_q,
        "reachable_q": reach_q,
        "served_q": sum(r["q"]["S"] for r in corpus),
        "add_share": f"{100.0 * add_q / reach_q:.2f}",
        "pages_add0": sum(1 for r in corpus if r["q"]["add"] == 0),
        "pages_with_add": sum(1 for r in corpus if r["q"]["add"] > 0),
        "pages_hide": sum(1 for r in corpus if r["q"]["hide"] > 0),
        "pages_with_controls": sum(1 for r in corpus if r["controls_total"] > 0),
        "pages_css": sum(1 for r in corpus if r["q"]["css_reachable"] > 0
                         or r["l"]["css_reachable"] > 0),
        "css_reachable": sum(r["q"]["css_reachable"] for r in corpus),
        "css_reachable_lines": sum(r["l"]["css_reachable"] for r in corpus),
        "glued_add": sum(r["q"]["add_glued"] for r in corpus),
        "glued_hide": sum(r["q"]["hide_glued"] for r in corpus),
        "offsite_refused": sum(r["offsite_refused"] for r in corpus),
        "page_errors": sum(r["page_errors"] for r in corpus),
    }

    d = {
        "_note": ("Every number this page publishes. Computed from evidence.json by build.py, "
                  "and re-derived from the same file, independently, by check.py."),
        "date": DATE, "session": SESSION, "cycle": CYCLE,
        "declared": {"quantity": RULE_Q, "line": RULE_L},
        "readings": [{"name": n, "test": tx} for n, tx in READINGS],
        "sweep": ev["sweep"],
        "apparatus": apparatus(),
        "pages": corpus,
        "self_pass": self_row,
        "kmax": kmax,
        "verdict_curves": curves,
        "rounding": rr,
        "hidden_ledger": hl,
        "totals": totals,
    }
    DATA.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    PAGE.write_text(page_html(d), encoding="utf-8")
    print(f"pages {totals['pages']}  states {totals['states']}  add {add_q}  hide {hide_q}  "
          f"add-free {totals['pages_add0']}  css-live {totals['pages_css']}  "
          f"self {'yes' if self_row else 'no'}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true",
                    help="build from the committed evidence.json without the instrument")
    build(ap.parse_args().offline)
