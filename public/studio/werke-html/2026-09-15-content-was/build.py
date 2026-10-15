#!/usr/bin/env python3
"""CONTENT WAS — build.

Reads `counts.json` (written by harvest.py) and writes `index.html` and
`data.json`. The page is one file: no network request of any kind, no library,
no external asset. It opens from a filesystem. Everything the figures draw is
in the served text as well, so the page reads with scripting switched off.

Rebuilds byte-identical from the same counts.json.
"""

import json, os, html, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, "counts.json"), encoding="utf-8"))

CHARS_PER_ROW = 1600     # the wall is 1600 characters wide
BAR = 1.0                # one character, one unit
PITCH = 1.7              # line pitch, so the rows stay separate
GAP = 1                  # one character of space between two deleted pages

STATE = ["whole", "cut-text", "cut-log"]
FIRST_YEAR, LAST_YEAR = 2004, 2026

# The wiki's own quick-deletion criteria, short-quoted from the page that
# publishes them — simple.wikipedia.org/wiki/Wikipedia:Quick_deletion, read
# 2026-09-15, CC BY-SA 4.0. These are the wiki's words, not this practice's.
CRITERIA = {
    "G1": "all of the text is nonsense",
    "G2": "it is a test page",
    "G3": "the content is completely vandalism",
    "G4": "creation of content that is already deleted",
    "G5": "created by a blocked or banned user",
    "G6": "housekeeping",
    "G7": "author wants deletion",
    "G8": "pages dependent on deleted or non-existent pages",
    "G10": "attack pages",
    "G11": "obvious advertising",
    "G12": "obviously breaking copyright law",
    "A1": "is very short and provides little or no meaning",
    "A2": "has no content",
    "A3": "copied and pasted from another Wikipedia",
    "A4": "does not claim to be notable",
    "A5": "is not written in English",
    "A6": "is an obvious hoax",
    "A7": "is clearly AI-generated",
    "R1": "redirects to a page that does not exist",
    "R2": "redirects to or from the User: space",
    "R3": "redirects with an uncommon typo",
    "F1": "media uploads are not allowed here",
    "U1": "user request",
    "U2": "non-existent users",
    "T2": "deprecated or replaced, and unused",
}


def n(x):
    """A number a human reads: thin spaces between the thousands."""
    return f"{x:,}".replace(",", " ")


def esc(s):
    return html.escape(s, quote=True)


# ---------------------------------------------------------------- the wall

def wall_geometry():
    """Lay the kept characters out as running text, in the order they were
    deleted. Returns per-state SVG path data, the row count, and the start
    offset of every block so the script can find one under a pointer."""
    paths = {s: [] for s in STATE}
    starts = []
    pos = 0
    for length, st, _year in C["wall"]:
        starts.append(pos)
        d = paths[STATE[st]]
        remaining = length
        p = pos
        while remaining > 0:
            row, x = divmod(p, CHARS_PER_ROW)
            run = min(remaining, CHARS_PER_ROW - x)
            y = round(row * PITCH, 2)
            d.append(f"M{x} {y}h{run}v{BAR:g}h-{run}z")
            p += run
            remaining -= run
        pos += length + GAP
    rows = (pos + CHARS_PER_ROW - 1) // CHARS_PER_ROW
    return paths, rows, starts


def wall_svg():
    paths, rows, starts = wall_geometry()
    height = round(rows * PITCH, 2)
    out = [f'<svg id="wall" viewBox="0 0 {CHARS_PER_ROW} {height}" '
           f'preserveAspectRatio="xMinYMin meet" role="img" '
           f'aria-label="{n(C["quote"]["characters_preserved_total"])} characters of deleted '
           f'pages, one character to the unit, in the order they were deleted">']
    out.append('<rect class="wbg" x="0" y="0" width="%d" height="%s"/>' % (CHARS_PER_ROW, height))
    for st in STATE:
        out.append(f'<path class="w-{st}" d="{"".join(paths[st])}"/>')
    out.append('<path id="wall-hi" d=""/>')
    out.append('</svg>')
    return "".join(out), rows, height, starts


# ------------------------------------------------------------- the ceiling

def ceiling_svg():
    hist = [(k, v) for k, v in C["quote"]["comment_length_hist"] if 230 <= k <= 255]
    top = max(v for _, v in hist)
    W, H, PAD = 1000, 260, 26
    bw = (W - 2 * PAD) / len(hist)
    out = [f'<svg viewBox="0 0 {W} {H + 40}" role="img" aria-label="how long the '
           f'deletion reasons are, from 230 to 255 characters">']
    for i, (k, v) in enumerate(hist):
        h = (v / top) * (H - PAD)
        x = PAD + i * bw
        cls = "cliff" if k == 255 else "bar"
        out.append(f'<rect class="{cls}" x="{x:.1f}" y="{H - h:.1f}" '
                   f'width="{bw - 2:.1f}" height="{h:.1f}"/>')
        if k in (230, 240, 250, 255):
            out.append(f'<text class="ax" x="{x + bw / 2:.1f}" y="{H + 18}" '
                       f'text-anchor="middle">{k}</text>')
    out.append(f'<text class="cliffn" x="{PAD + (len(hist) - 1) * bw + bw / 2:.1f}" '
               f'y="{H - (top / top) * (H - PAD) - 8:.1f}" text-anchor="end">'
               f'{n(C["quote"]["comment_length_255"])}</text>')
    out.append(f'<text class="ax" x="{W / 2:.0f}" y="{H + 38}" text-anchor="middle">'
               f'characters in the deletion note</text>')
    out.append('</svg>')
    return "".join(out)


# ------------------------------------------------------------ the crossing

def crossing_svg():
    T = C["by_year_table"]
    W, H, L, R, TOP, B = 1000, 330, 46, 22, 16, 44
    xs = lambda i: L + i * (W - L - R) / (len(T) - 1)
    ys = lambda pct: TOP + (100 - pct) * (H - TOP - B) / 100
    kept = [(xs(i), ys(100 * r[2] / r[1])) for i, r in enumerate(T)]
    coded = [(xs(i), ys(100 * r[3] / r[1])) for i, r in enumerate(T)]
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="the share of deletions that '
           f'kept a copy of the page, against the share that name a published code, '
           f'year by year">']
    for pct in (0, 25, 50, 75, 100):
        y = ys(pct)
        out.append(f'<line class="grid" x1="{L}" y1="{y:.1f}" x2="{W - R}" y2="{y:.1f}"/>')
        out.append(f'<text class="ax" x="{L - 8}" y="{y + 5:.1f}" text-anchor="end">{pct}%</text>')
    for i, r in enumerate(T):
        if int(r[0]) % 4 == 0 or i == len(T) - 1:
            out.append(f'<text class="ax" x="{xs(i):.1f}" y="{H - 16}" '
                       f'text-anchor="middle">{r[0]}</text>')
    path = lambda pts: "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    out.append(f'<path class="ln-coded" d="{path(coded)}"/>')
    out.append(f'<path class="ln-kept" d="{path(kept)}"/>')
    for (x, y) in kept:
        out.append(f'<circle class="dot-kept" cx="{x:.1f}" cy="{y:.1f}" r="3"/>')
    for (x, y) in coded:
        out.append(f'<circle class="dot-coded" cx="{x:.1f}" cy="{y:.1f}" r="2.4"/>')
    out.append(f'<text class="lab-kept" x="{kept[0][0] + 8:.1f}" y="{kept[0][1] - 9:.1f}">'
               f'kept a copy of the page</text>')
    i08 = [i for i, r in enumerate(T) if r[0] == "2010"][0]
    out.append(f'<text class="lab-coded" x="{coded[i08][0]:.1f}" y="{coded[i08][1] - 11:.1f}" '
               f'text-anchor="middle">named a published code</text>')
    out.append('</svg>')
    return "".join(out)


# ------------------------------------- the titles that would not stay empty

def tail_svg(rows_shown=44):
    rows = C["tail"][:rows_shown]
    LBL, W, RH, PAD = 300, 1000, 17, 10
    H = len(rows) * RH + 34
    t0 = datetime.date(FIRST_YEAR, 1, 1).toordinal()
    t1 = datetime.date(LAST_YEAR, 12, 31).toordinal()

    def X(iso):
        d = datetime.date(*[int(p) for p in iso.split("-")]).toordinal()
        return LBL + (d - t0) / (t1 - t0) * (W - LBL - 46)

    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="the {rows_shown} article '
           f'titles this wiki emptied most often, each emptying one mark">']
    for yr in range(2005, LAST_YEAR + 1, 5):
        x = X(f"{yr}-01-01")
        out.append(f'<line class="grid" x1="{x:.1f}" y1="6" x2="{x:.1f}" y2="{len(rows) * RH + 6}"/>')
        out.append(f'<text class="ax" x="{x:.1f}" y="{len(rows) * RH + 24}" '
                   f'text-anchor="middle">{yr}</text>')
    for i, r in enumerate(rows):
        y = 6 + i * RH + RH / 2
        if r["title"]:
            out.append(f'<text class="tl" x="{LBL - 10}" y="{y + 3.5:.1f}" '
                       f'text-anchor="end">{esc(r["title"])}</text>')
        else:
            w = min(r["chars"] * 6.2, LBL - 20)
            out.append(f'<rect class="withheld" x="{LBL - 10 - w:.1f}" y="{y - 5:.1f}" '
                       f'width="{w:.1f}" height="10" rx="1"/>')
        out.append(f'<line class="rule" x1="{LBL}" y1="{y:.1f}" '
                   f'x2="{X(r["when"][-1]):.1f}" y2="{y:.1f}"/>')
        for d in r["when"]:
            x = X(d)
            out.append(f'<rect class="mark" x="{x - 1.1:.1f}" y="{y - 5:.1f}" width="2.2" height="10"/>')
        if r["sealed"]:
            x = X(r["sealed_since"])
            out.append(f'<rect class="seal" x="{x - 2.4:.1f}" y="{y - 6.5:.1f}" '
                       f'width="4.8" height="13" rx="1.4"/>')
        out.append(f'<text class="cnt" x="{W - 34}" y="{y + 3.5:.1f}" text-anchor="end">{r["n"]}</text>')
    out.append(f'<text class="ax" x="{W / 2:.0f}" y="{H + 38}" text-anchor="middle">'
               f'characters in the deletion note</text>')
    out.append('</svg>')
    return "".join(out), rows_shown


# ------------------------------------------------------------------- page

def grounds_table():
    rows = [(k, v) for k, v in C["grounds"] if k != "(no code)"][:18]
    tot = C["log"]["deletions"]
    cells = []
    for k, v in rows:
        label = CRITERIA.get(k, "not in the published list")
        cells.append(f'<li><b>{esc(k)}</b> <q>{esc(label)}</q>'
                     f'<span>{n(v)}<i>{v * 100 / tot:.1f}%</i></span></li>')
    return "".join(cells)


def main():
    q, lg, ar, se = C["quote"], C["log"], C["articles"], C["seal"]
    wall, rows, height, starts = wall_svg()
    crossing = crossing_svg()
    tail, tail_rows = tail_svg()
    ceiling = ceiling_svg()

    T0 = C["by_year_table"][0]
    T08 = [r for r in C["by_year_table"] if r[0] == "2008"][0]
    Tlast_kept = str(C["quote"]["last_year_kept"])
    Tk = [r for r in C["by_year_table"] if r[0] == Tlast_kept][0]
    named = sum(1 for r in C["tail"] if r["title"])
    unnamed = len(C["tail"]) - named
    still_empty = ar["distinct_titles"] - ar["live_today"]
    lapsed = se["ever_create_protected"] - se["titles_sealed_now"]

    data = {
        "_note": "What the wall on this page draws: one entry per deletion that kept a "
                 "copy of its page, in log order, as [characters kept, 0 whole / 1 cut by "
                 "the text limit / 2 cut by the note's ceiling, year]. Lengths only: no "
                 "text of any deleted page is in this file, on the page, or in counts.json.",
        "chars_per_row": CHARS_PER_ROW, "pitch": PITCH, "gap": GAP, "rows": rows,
        "wall": C["wall"],
    }
    island = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(HERE, "data.json"), "w", encoding="utf-8") as f:
        f.write(island)

    doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CONTENT WAS — Ensemble</title>
<meta name="description" content="Every page the Simple English Wikipedia has deleted since 2004, and the {n(q['whole'])} of them whose whole text is still inside the record of the deletion.">
<style>
:root{{--paper:#f3f0e8;--ink:#23211c;--soft:#6b665a;--rule:#cdc7b6;--whole:#26241f;
--cut:#9b937f;--ceil:#a6391c;--hi:#d8a21a;--seal:#a6391c}}
*{{box-sizing:border-box}}
html{{-webkit-text-size-adjust:100%}}
body{{margin:0;background:var(--paper);color:var(--ink);
font:16px/1.55 "Iowan Old Style",Palatino,"Palatino Linotype","Book Antiqua",Georgia,serif}}
main{{max-width:960px;margin:0 auto;padding:0 20px 90px}}
header{{max-width:960px;margin:0 auto;padding:54px 20px 6px}}
h1{{font-size:clamp(34px,7.4vw,70px);line-height:.98;margin:0;letter-spacing:-.018em;
font-weight:600;font-variant-ligatures:none}}
h1 span{{color:var(--soft)}}
.dek{{font-size:clamp(16px,2.3vw,20px);color:var(--soft);margin:14px 0 0;max-width:48em}}
.lede{{font-size:clamp(18px,2.6vw,23px);line-height:1.42;margin:34px 0 0;max-width:34em}}
h2{{font-size:13px;letter-spacing:.17em;text-transform:uppercase;font-weight:700;
margin:64px 0 4px;color:var(--soft);font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace}}
h2 em{{font-style:normal;color:var(--ink)}}
p{{max-width:38em}}
.cap{{color:var(--soft);font-size:15px;max-width:40em;margin:6px 0 16px}}
figure{{margin:0 0 6px}}
svg{{display:block;width:100%;height:auto}}
#wall{{background:#e9e5da;border:1px solid var(--rule)}}
.wbg{{fill:#e9e5da}}
.w-whole{{fill:var(--whole)}} .w-cut-text{{fill:var(--cut)}} .w-cut-log{{fill:var(--ceil)}}
#wall-hi{{fill:var(--hi)}}
.legend{{display:flex;flex-wrap:wrap;gap:6px 22px;font-size:14px;color:var(--soft);margin:10px 0 0;
font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace}}
.legend b{{font-weight:600;color:var(--ink)}}
.sw{{display:inline-block;width:22px;height:9px;vertical-align:middle;margin-right:7px;
border:1px solid rgba(0,0,0,.18)}}
.bar{{fill:#b9b2a0}} .cliff{{fill:var(--ceil)}}
.ax{{fill:var(--soft);font-size:15px;font-family:ui-monospace,Menlo,Consolas,monospace}}
.cliffn{{fill:var(--ceil);font-size:19px;font-family:ui-monospace,Menlo,Consolas,monospace}}
.grid{{stroke:var(--rule);stroke-width:1}}
.ln-kept{{fill:none;stroke:var(--whole);stroke-width:2.6}}
.ln-coded{{fill:none;stroke:var(--ceil);stroke-width:2.2;stroke-dasharray:7 4}}
.dot-kept{{fill:var(--whole)}} .dot-coded{{fill:var(--ceil)}}
.lab-kept{{fill:var(--whole);font-size:17px}}
.lab-coded{{fill:var(--ceil);font-size:17px}}
.rule{{stroke:#d5cfbe;stroke-width:1}}
.mark{{fill:var(--whole)}} .seal{{fill:var(--seal)}}
.withheld{{fill:#d5cfbe}}
.tl{{font-size:13.5px;fill:var(--ink)}}
.cnt{{font-size:13px;fill:var(--soft);font-family:ui-monospace,Menlo,Consolas,monospace}}
.nums{{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:22px 26px;
margin:22px 0 0;padding:0;list-style:none}}
.nums li{{border-top:2px solid var(--ink);padding-top:8px}}
.nums b{{display:block;font-size:clamp(24px,4.2vw,34px);line-height:1.05;
font-variant-numeric:tabular-nums;font-weight:600}}
.nums span{{display:block;color:var(--soft);font-size:14.5px;margin-top:3px;line-height:1.35}}
.codes{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:11px 26px;
margin:16px 0 0;padding:0;list-style:none;font-size:15px}}
.codes li{{border-top:1px solid var(--rule);padding-top:6px;display:flex;
justify-content:space-between;align-items:baseline;gap:12px}}
.codes b{{font-weight:600;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px}}
.codes q{{flex:1 1 auto;quotes:none;color:var(--ink)}}
.codes span{{white-space:nowrap;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;
color:var(--soft)}}
.codes i{{font-style:normal;margin-left:8px}}
.panel{{border:1px solid var(--rule);background:#eeeade;padding:16px 18px;margin:22px 0 0;
max-width:44em}}
.panel p{{margin:0 0 .7em}} .panel p:last-child{{margin:0}}
.ctl{{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:14px 0 0;
font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;color:var(--soft)}}
.ctl input[type=range]{{flex:1 1 220px;min-width:180px;accent-color:#a6391c}}
.ctl button{{font:inherit;color:var(--ink);background:var(--paper);border:1px solid var(--rule);
padding:4px 11px;cursor:pointer}}
#readout{{min-height:1.5em;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;
color:var(--ink);margin:8px 0 0}}
.noscript-only{{color:var(--soft);font-size:14px;font-family:ui-monospace,Menlo,Consolas,monospace}}
footer{{border-top:1px solid var(--rule);margin-top:76px;padding-top:22px;
font-size:14.5px;color:var(--soft)}}
footer a{{color:var(--ink)}} footer h3{{font-size:13px;letter-spacing:.14em;text-transform:uppercase;
color:var(--ink);margin:26px 0 6px;font-family:ui-monospace,Menlo,Consolas,monospace}}
footer p,footer li{{max-width:46em}}
code{{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.92em;background:#e7e2d4;
padding:1px 4px;overflow-wrap:anywhere;word-break:break-word}}
@media (max-width:640px){{.nums{{gap:16px}}}}
</style></head>
<body>
<header>
<h1>CONTENT<br>WAS<span>:</span></h1>
<p class="dek">An encyclopedia destroys a page and writes down why. For a few years the
note it wrote contained the page. This is every deletion the Simple English Wikipedia has
recorded since 23 December 2004 — {n(lg['deletions'])} of them — the {n(q['whole'])}
destroyed pages whose whole text is still sitting inside the note that says they are gone,
and the year the archive stopped doing that.</p>
</header>

<main>
<p class="lede">A library of missing things usually has empty shelves. This one did not.
The shelf marked <em>deleted</em> holds {n(q['characters_preserved_total'])} characters of
encyclopedia — kept not despite the deletion but <em>by</em> it, because the reason given for
a removal was allowed to quote the thing removed. Then the habit ended. In
{T0[0]} the wiki kept a copy of {100 * T0[2] / T0[1]:.0f}&#8202;% of what it destroyed; in
{Tlast_kept} it kept {100 * Tk[2] / Tk[1]:.1f}&#8202;%; since {int(Tlast_kept) + 1} it has
kept none at all. What it writes instead is a code.</p>

<h2><em>1.</em> The wall</h2>
<p class="cap">Every deletion that kept a copy of its page, in the order the deletions
happened. One unit is one character. The wall is {n(CHARS_PER_ROW)} characters wide and
{n(rows)} lines deep, and it is the complete text of {n(q['deletions_quoting_the_page'])}
pages that no longer exist. It begins on 23 December 2004 and its last line is
{Tlast_kept}: this is a closed archive, and nothing has been added to it in
{2026 - int(Tlast_kept)} years. You cannot read a word of it, and that is this page's
decision, not the archive's — see section 8.</p>
<figure>{wall}</figure>
<div class="legend">
<span><i class="sw" style="background:var(--whole)"></i><b>{n(q['whole'])}</b> kept whole</span>
<span><i class="sw" style="background:var(--cut)"></i><b>{n(q['cut_by_text_limit'])}</b> cut by the text limit, and it says so with <code>...</code></span>
<span><i class="sw" style="background:var(--ceil)"></i><b>{n(q['cut_by_comment_ceiling'])}</b> cut by the note's own ceiling, mid-word, saying nothing</span>
</div>
<div class="ctl" id="wallctl" hidden>
<button id="wall-all" type="button">all years</button>
<label for="wall-year">light one year: <output id="wall-yearv">{FIRST_YEAR}</output></label>
<input type="range" id="wall-year" min="{FIRST_YEAR}" max="{LAST_YEAR}" value="{FIRST_YEAR}" step="1">
</div>
<p id="readout" class="noscript-only">With scripting on, this line reports whatever block
is under the pointer, and the slider lights one year of deletions inside the wall.</p>

<ul class="nums">
<li><b>{n(lg['deletions'])}</b><span>pages deleted, {FIRST_YEAR}–{LAST_YEAR}</span></li>
<li><b>{n(q['deletions_quoting_the_page'])}</b><span>of those notes quote the page they deleted</span></li>
<li><b>{n(q['whole'])}</b><span>quote it whole: {n(q['characters_preserved_whole'])} characters, longest {q['longest_whole']}, median {q['median_whole']}</span></li>
<li><b>{n(lg['restores_events'])}</b><span>undeletions — the hole filled back in by the same hands, at {n(lg['restores_titles'])} titles</span></li>
</ul>

<h2><em>2.</em> The year the archive stopped keeping what it removed</h2>
<p class="cap">Two shares, year by year, out of the same {n(lg['deletions'])} deletions: the
share whose note carried a copy of the page, and the share whose note names a code from the
wiki's published criteria. They change places between 2007 and 2008. Before that the record of a removal
tends to be the thing removed; after it, the record is a category. Nothing was lost in the
trade that anyone announced — the pages deleted after {Tlast_kept} simply have no copy
anywhere in the log, and the ones before it do.</p>
<figure>{crossing}</figure>
<ul class="nums">
<li><b>{100 * T0[2] / T0[1]:.0f}%</b><span>of {T0[0]}'s deletions kept a copy of the page; {100 * T0[3] / T0[1]:.0f}% named a code</span></li>
<li><b>{100 * T08[2] / T08[1]:.0f}% / {100 * T08[3] / T08[1]:.0f}%</b><span>kept a copy, and named a code, in 2008 — the year the two lines change places</span></li>
<li><b>0%</b><span>every year from {int(Tlast_kept) + 1} on: {n(sum(r[1] for r in C['by_year_table'] if int(r[0]) > int(Tlast_kept)))} deletions, not one copy kept</span></li>
<li><b>{n(sum(r[3] for r in C['by_year_table'] if int(r[0]) > int(Tlast_kept)))}</b><span>of those name a code instead</span></li>
</ul>

<h2><em>3.</em> The record has its own hole</h2>
<p class="cap">How long the deletion notes are, from 230 characters to 255. A log comment
cannot exceed {C['quote']['comment_length_255'] and 255} characters, so the sentence that
preserves the page is itself cut off — {n(q['comment_length_255'])} notes stop exactly at
the ceiling, and {n(q['cut_by_comment_ceiling'])} of them break off inside the quotation
with no closing mark. Where the software cuts the <em>page</em> it admits it, with an
ellipsis. Where the ceiling cuts the <em>note</em>, nothing is said at all.</p>
<figure>{ceiling}</figure>

<h2><em>4.</em> The titles that would not stay empty</h2>
<p class="cap">{n(ar['distinct_titles'])} article titles have been emptied here,
{n(ar['deletions'])} times between them. {n(len(C['tail']))} titles were emptied eight times
or more. Below are the {tail_rows} emptied most often: one row per title, one mark per
emptying, and where the log's last word is a seal — the title locked so that nothing can be
written there again — a red bar at the day it was applied. The counts are at the right.</p>
<figure>{tail}</figure>
<p class="cap">A name is printed only where an article stands at that title today. The other
rows carry a grey bar as wide as the name is long: the measure kept, the content dropped,
which is exactly what the log did to the pages. Section 8 says why.</p>

<ul class="nums">
<li><b>{n(ar['live_today'])}</b><span>of the {n(ar['distinct_titles'])} emptied article titles hold an article today — {ar['live_today'] * 100 / ar['distinct_titles']:.1f}%</span></li>
<li><b>{n(still_empty)}</b><span>are still empty</span></li>
<li><b>{n(named)}</b><span>of the {n(len(C['tail']))} most-emptied titles can be named here; {n(unnamed)} cannot</span></li>
<li><b>{C['tail'][0]['n']}</b><span>emptyings of one title, {C['tail'][0]['when'][0][:4]} to {C['tail'][0]['when'][-1][:4]}, sealed on the day of the last one</span></li>
</ul>

<h2><em>5.</em> The seal</h2>
<p>The wiki's own word for it is <em>salting</em>. When a title has been emptied often
enough, an administrator locks the title itself, and the hole is kept open on purpose.
{n(se['ever_create_protected'])} titles have been sealed at some point.
{n(se['titles_sealed_now'])} are sealed as the log last left them — {n(se['article_titles_sealed_now'])}
of them article titles, {n(se['indefinite'])} of them with no end date. The other
{n(lapsed)} seals lapsed or were lifted: a hole that was meant to stay open and did not.
The median title was emptied {se['deletions_before_seal_median']} times before it was sealed;
the most-emptied, {se['deletions_before_seal_max']} times. And
{n(se['sealed_never_deleted'])} titles are sealed that were never emptied at all — a hole dug
before anything was put in it.</p>

<h2><em>6.</em> The entries with no subject</h2>
<p>{n(lg['titles_without_a_title'])} entries in this log do not say what they acted on. The
event is recorded, dated and attributed; the name of the page is withheld.
{n(lg['titles_without_a_title_by_action'][0][1])} of them are deletions. In
{n(lg['titles_without_a_title_and_mute'])} of the {n(lg['titles_without_a_title'])} the reason
is withheld too, so the record says only that something was removed. Those are the one kind of
hole in this log with nothing whatever inside it, and they are counted here and not guessed at.
A further {n(lg['comment_empty'])} deletions carry a reason that is simply empty.</p>

<h2><em>7.</em> The grounds</h2>
<p class="cap">{n(C['grounds_with_code'])} of the {n(lg['deletions'])} deletions
({C['grounds_with_code'] * 100 / lg['deletions']:.1f}%) name a code from this wiki's published
quick-deletion criteria; {n(lg['deletions'] - C['grounds_with_code'])} name none. Every hole
here carries a ground written by the hand that made it, and three quarters of the time that
ground is a term from a list anyone can read.</p>
<ul class="codes">{grounds_table()}</ul>
<p class="cap">The criteria are quoted, shortened, from the page this wiki publishes them on
(<code>Wikipedia:Quick_deletion</code>, read {C['built']}, CC BY-SA 4.0). A code is read out of
the free text of a reason by pattern, so a letter-and-number that happens to appear in a
sentence will be read as a code: the eighteen above are all criteria this wiki publishes, and a
long tail of readings below them is not.</p>

<h2><em>8.</em> What this page will not show you</h2>
<div class="panel">
<p>The {n(q['characters_preserved_total'])} characters drawn in section 1 were read, measured
and then dropped. Not one of them is in this page, in <code>data.json</code>, or in
<code>counts.json</code>; the harvester discards the text inside the function that measures it.
Titles are printed only where the wiki itself still publishes an article at that title.</p>
<p>The reason is not squeamishness. A page deleted from a wiki is very often an attack on a
private person, or that person's telephone number, and the encyclopedia's own reason for
removing it was that it should not be readable. Copying it into an artwork would make this
practice the next place it is readable. So this work keeps the measure and drops the content —
which is, exactly, what the log did to the pages, one step further along.</p>
<p>That is a hole this page makes. It is the only number here we cannot show you the inside
of, and it is ours, not the archive's.</p>
</div>

<h2><em>9.</em> Where it comes from</h2>
<p>Two files, both published by the Wikimedia Foundation for bulk reading at
<code>dumps.wikimedia.org</code>, downloaded once on {C['built']}:</p>
<ul>
<li><code>{esc(C['source']['files'][0]['name'])}</code> — every log entry this wiki has
written, {n(C['source']['files'][0]['bytes'])} bytes, <code>sha256 {C['source']['files'][0]['sha256'][:16]}…</code></li>
<li><code>{esc(C['source']['files'][1]['name'])}</code> — every article title that exists
today, {n(C['source']['files'][1]['bytes'])} bytes, <code>sha256 {C['source']['files'][1]['sha256'][:16]}…</code></li>
</ul>
<p>{n(lg['items_read'])} log items were read; the deletion and protection log runs
{lg['first'][:10]} to {lg['last'][:10]}. Neither file is copied into this repository.</p>
<p>The live wiki was read once, and only where its own rules allow it. Wikimedia's
<code>robots.txt</code> disallows <code>/w/</code> and <code>/wiki/Special:</code> — which is
where the API and the live log pages are — so the API was never called and the log was read
from the dump instead. <code>/wiki/</code> itself is allowed, with a crawl delay of fifteen
seconds, and one page was fetched under that rule on {C['built']}:
<code>simple.wikipedia.org/wiki/Wikipedia:Quick_deletion</code>, for the criteria quoted in
section 7. <code>dumps.wikimedia.org</code> serves no <code>robots.txt</code> at all — a 404 on
{C['built']} — so nothing published was crossed in reading the two dump files. Three requests
in total. Text, log comments and criteria are the work of the wiki's editors and
administrators, under CC BY-SA 4.0 and the GFDL.</p>
</main>

<footer>
<h3>Nearest works, and the daylight</h3>
<p><b>Mimi Ọnụọha, <i>The Library of Missing Datasets</i> (v2.0, 2018)</b> — a powder-coated
steel filing cabinet of empty labelled folders, each naming a dataset that is not collected.
Opened at bitforms gallery's page for the work on 2026-09-15: one photograph of the cabinet,
and a wall text saying the folder names come from a master list the artist has kept since 2015.
<b>The daylight:</b> her folders are empty and were labelled from outside, by someone naming
what an institution never gathered. These folders were full, and were emptied by the
institution itself, and the label on each is a sentence that institution wrote at the moment
of emptying — with a piece of the contents still inside it.</p>
<p><b>Mimi Ọnụọha, <i>Missing Datasets</i> (list and essay, 2015–)</b> — read at its
repository on 2026-09-15. The essay's first reason for a missing dataset carries a corollary:
those who hold a dataset are often the same ones who can remove or obscure it. <b>The
daylight:</b> that corollary is this work's whole subject, and what the log adds is that the
remover here writes down the removal, dates it, gives a ground from a published list, and keeps
a copy. Absence with a receipt is a different object from absence.</p>
<p><b>Voluspa Jarpa, <i>Biblioteca de la No-Historia</i> (2011)</b> — a thousand hand-bound
books of declassified files with the censor's blackouts kept intact, so the redaction becomes
the visible content. Opened at the artist's own page on 2026-09-14, nineteen images.
<b>The daylight:</b> a blackout shows you that there was text and hides the text. This log does
the reverse — it keeps the text and destroys the page — and section 7 of this work then puts
Jarpa's blackout back over it, on this practice's own authority and for a stated reason.</p>

<h3>The work</h3>
<p><b>CONTENT WAS</b> — Ensemble, the studio of the research ecology at frankbueltge.de,
{C['built']}. One HTML file, no network request, no library, no external asset; it opens from a
filesystem. <code>harvest.py</code> makes the measurement, <code>build.py</code> makes the page,
<code>counts.json</code> is what was measured, <code>verify.mjs</code> checks the page in a real
browser with scripting off and on. Work CC BY 4.0; code Apache-2.0; the source data CC BY-SA 4.0
and GFDL, as above. No third-party code is embedded in this work.</p>
</footer>

<script id="data" type="application/json">{island}</script>
<script>
(function(){{
var D=JSON.parse(document.getElementById('data').textContent);
var W=D.wall,CPR=D.chars_per_row,PITCH=D.pitch,GAP=D.gap;
var svg=document.getElementById('wall'),hi=document.getElementById('wall-hi'),
    ro=document.getElementById('readout'),ctl=document.getElementById('wallctl'),
    yr=document.getElementById('wall-year'),yv=document.getElementById('wall-yearv'),
    all=document.getElementById('wall-all');
if(!svg||!W.length)return;
var starts=new Int32Array(W.length),pos=0;
for(var i=0;i<W.length;i++){{starts[i]=pos;pos+=W[i][0]+GAP;}}
var NAMES=['kept whole','cut by the text limit','cut by the note\\u2019s ceiling'];
function seg(from,len){{var d='',p=from,r=len;
 while(r>0){{var row=Math.floor(p/CPR),x=p-row*CPR,run=Math.min(r,CPR-x);
  d+='M'+x+' '+(row*PITCH).toFixed(2)+'h'+run+'v1h-'+run+'z';p+=run;r-=run;}}
 return d;}}
function find(cx,cy){{var row=Math.floor(cy/PITCH);if(cy-row*PITCH>1)return -1;
 var p=row*CPR+Math.floor(cx);if(p<0||p>=pos)return -1;
 var lo=0,hi2=W.length-1,m;
 while(lo<hi2){{m=(lo+hi2+1)>>1;if(starts[m]<=p)lo=m;else hi2=m-1;}}
 return (p<starts[lo]+W[lo][0])?lo:-1;}}
ctl.hidden=false;
ro.className='';
ro.textContent='Point at the wall.';
function pt(ev){{var r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;
 return [(ev.clientX-r.left)/r.width*vb.width,(ev.clientY-r.top)/r.height*vb.height];}}
svg.addEventListener('pointermove',function(ev){{
 var c=pt(ev),k=find(c[0],c[1]);
 if(k<0){{hi.setAttribute('d','');ro.textContent='Point at the wall.';return;}}
 hi.setAttribute('d',seg(starts[k],W[k][0]));
 ro.textContent='a page deleted in '+W[k][2]+' \\u2014 '+W[k][0]+
   ' characters of it are in the record, '+NAMES[W[k][1]]+
   '  (no. '+(k+1)+' of '+W.length+')';}});
svg.addEventListener('pointerleave',function(){{hi.setAttribute('d','');
 ro.textContent='Point at the wall.';}});
function year(y){{var d='';for(var i=0;i<W.length;i++)if(W[i][2]===y)d+=seg(starts[i],W[i][0]);
 hi.setAttribute('d',d);
 var c=0,ch=0;for(var j=0;j<W.length;j++)if(W[j][2]===y){{c++;ch+=W[j][0];}}
 ro.textContent=y+': '+c+' deletions kept their page, '+ch+' characters.';}}
yr.addEventListener('input',function(){{yv.textContent=yr.value;year(+yr.value);}});
all.addEventListener('click',function(){{hi.setAttribute('d','');
 ro.textContent='Point at the wall.';}});
}})();
</script>
</body></html>
"""
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
        f.write(doc)
    print("index.html", os.path.getsize(os.path.join(HERE, "index.html")), "bytes;",
          "wall rows", rows, "height", height)


if __name__ == "__main__":
    main()
