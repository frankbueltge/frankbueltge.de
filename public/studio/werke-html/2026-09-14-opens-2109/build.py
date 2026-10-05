#!/usr/bin/env python3
"""OPENS 01/01/2109 — the build.

Reads counts.json (the measurement made by harvest.py) and writes two files:

  data.json   the numbers the page uses, and nothing else
  index.html  one self-contained surface: no network, no library, no external asset

  python3 build.py            # write data.json and index.html
  python3 build.py --check    # rebuild both and fail if one byte differs

The data island inside index.html is byte-identical to data.json — the house rule, so a
reader can diff the page against the file beside it.
"""
import argparse, json, os, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- the drawing ------------------------------------------------------------------------
# A DEPARTURE BOARD. One line per year, in order, from the next one to the last one; the
# line's length is the number of records that open that year, at one scale for the whole
# board, and the number is printed at the end of it so that the tail — years where twelve
# records open — is readable where a bar alone would be a hairline. The last line of the
# board has no year in it. That line is the longest on the board.
ROW = 14                     # units per line
BAR = 8                      # the bar's own height
LAB = 54                     # the year column
X0 = 60                      # where the bars start
WMAX = 800                   # the longest line on the board — which is the one with no year
FIRST, LAST = 2027, 2109     # the timetable's own span; the one stray year is drawn apart
MILESTONES = [2030, 2036, 2040, 2050, 2060, 2075, 2100, 2109, 2110]


def sp(n):
    """Thin-space thousands, the way the catalogue's numbers are read aloud."""
    return f"{n:,}".replace(",", " ")


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def build_data(c):
    years = {int(k): v for k, v in c["timetable"].items()}
    stray = {y: n for y, n in years.items() if y < FIRST}
    timetable = {y: years.get(y, 0) for y in range(FIRST, LAST + 1)}

    depts = c["departments"]
    closed_read = sum(d["n"] for d in depts.values())
    dated = sum(d["dated"] for d in depts.values())
    undated_closed = sum(d["undated"] for d in depts.values())
    law_hold = sum(d["law_hold"] for d in depts.values())
    law_break = sum(d["law_break"] for d in depts.values())

    ret = c["retained"]
    residue = ret["undated"] + undated_closed

    lengths = {int(k): v for k, v in c["lengths"].items()}
    exp = []
    for k in sorted(lengths):
        exp += [k] * lengths[k]
    median = exp[len(exp) // 2] if len(exp) % 2 else (exp[len(exp) // 2 - 1]
                                                      + exp[len(exp) // 2]) / 2

    # How many are still shut on 1 January of a given year: every dated record whose
    # opening year is that year or later. Counted over ALL dated records, the stray
    # included — its date has already passed, so it is open on every milestone below and
    # must not be carried along as though it were still shut.
    remaining = {y: sum(n for yy, n in years.items() if yy >= y)
                 for y in range(FIRST, LAST + 2)}

    w = c["withheld_titles"]
    return {
        "title": "OPENS 01/01/2109",
        "date": "2026-09-14",
        "source": {
            "name": "The National Archives, Discovery catalogue (Kew, United Kingdom)",
            "api": c["api"], "read": c["fetched_utc"],
            "licence": "Crown copyright, Open Government Licence v3.0",
        },
        "catalogue": {
            "total": c["catalogue"]["total"],
            "open": c["catalogue"]["by_status"].get("O", 0),
            "closed": c["catalogue"]["by_status"].get("C", 0),
            "retained": c["catalogue"]["by_status"].get("R", 0),
            "unknown": c["catalogue"]["by_status"].get("U", 0),
            "not_applicable": c["catalogue"]["by_status"].get("NA", 0),
        },
        "read": {
            "departments": [
                {"code": k, "name": v["name"], "closed": v["n"], "dated": v["dated"],
                 "undated": v["undated"], "law_hold": v["law_hold"],
                 "law_break": v["law_break"],
                 "reported": v["reported"], "in_catalogue": v["closed_in_catalogue"]}
                for k, v in depts.items()],
            "closed": closed_read, "dated": dated, "undated": undated_closed,
            "share_of_all_closed": round(100 * closed_read
                                         / c["catalogue"]["by_status"]["C"], 3),
        },
        "retained": {"of": c["retained_of"], "name": c["retained_name"],
                     "n": ret["n"], "dated": ret["dated"], "undated": ret["undated"]},
        "residue": residue,
        "timetable": {str(y): n for y, n in timetable.items()},
        "stray": {str(y): n for y, n in stray.items()},
        "span": [FIRST, LAST],
        "years_occupied": sum(1 for n in timetable.values() if n),
        "years_empty": [y for y, n in timetable.items() if not n],
        "tallest": {"year": max(timetable, key=lambda y: timetable[y]),
                    "n": max(timetable.values())},
        "remaining": {str(y): remaining[y] for y in MILESTONES if y in remaining},
        "milestones": MILESTONES,
        "law": {"hold": law_hold, "break": law_break,
                "pct": round(100 * law_hold / (law_hold + law_break), 3),
                "kinds": c["break_kinds"],
                "statement": "a record opens on 1 January of the year after the last year "
                             "of its covering dates plus its closure code"},
        "lengths": {str(k): v for k, v in sorted(lengths.items())},
        "length_stats": {"min": min(lengths), "max": max(lengths), "median": median,
                         "mode": max(lengths, key=lambda k: lengths[k]),
                         "mode_n": max(lengths.values()), "n": len(exp)},
        "withheld": {"any": w["total"], "closed": w["closed"], "retained": w["retained"],
                     "wholly_closed": w["wholly_closed"],
                     "wholly_closed_dated": w["wholly_closed_dated"],
                     "wholly_retained": w["wholly_retained"],
                     "spellings": w["spellings"], "examples": w["examples"][:6]},
        "longest": c["longest"][:5],
        "latest": c["latest"][:5],
        "undated_examples": c["undated_closed"][:8],
        "retained_examples": c["retained_undated_sample"][:8],
        "mis_keyed": c["mis_keyed"][:8],
        "mis_keyed_n": len(c["mis_keyed"]),
        "off_new_year": c["off_new_year"][:4],
        "off_new_year_n": len(c["off_new_year"]),
    }


# ---- the drawing -----------------------------------------------------------------------
def draw_board(D):
    """The board: one line per year, then the line that has no year."""
    years = [(int(y), n) for y, n in D["timetable"].items()]
    stray = sorted((int(y), n) for y, n in D["stray"].items())
    residue = D["residue"]
    scale = WMAX / residue                      # one scale for every line on the board
    rows = ([("past", y, n) for y, n in stray]
            + [("year", y, n) for y, n in years]
            + [("none", None, residue)])
    h = len(rows) * ROW + 30
    w = X0 + WMAX + 74
    p = [f'<svg class="board" viewBox="0 0 {w} {h}" role="img" '
         f'aria-label="A board of {len(years)} lines, one per year from {FIRST} to {LAST}, '
         f'each as long as the number of records that open that year, and a last line with '
         f'no year in it holding the {sp(residue)} that have no opening date.">']
    p.append(f'<text class="hd" x="0" y="10">opens</text>'
             f'<text class="hd" x="{X0}" y="10">records released</text>')
    p.append(f'<line class="axis" x1="0" y1="15" x2="{w - 4}" y2="15"/>')
    for i, (kind, y, n) in enumerate(rows):
        top = 20 + i * ROW
        bw = round(n * scale, 3)
        if kind == "none":
            p.append(f'<line class="axis" x1="0" y1="{top - 3}" x2="{w - 4}" '
                     f'y2="{top - 3}"/>')
            p.append(f'<text class="ylab none" x="{LAB}" y="{top + BAR - 1}">— — — —</text>')
            p.append(f'<rect class="bar res" x="{X0}" y="{top}" width="{bw}" '
                     f'height="{BAR}" data-n="{n}"/>')
            p.append(f'<text class="cnt res" x="{X0 + bw + 5}" y="{top + BAR - 1}">'
                     f'{sp(n)}</text>')
            continue
        cls = "row past" if kind == "past" else "row"
        p.append(f'<g class="{cls}" data-year="{y}" data-n="{n}">')
        p.append(f'<text class="ylab" x="{LAB}" y="{top + BAR - 1}">{y}</text>')
        p.append(f'<rect class="bar" x="{X0}" y="{top}" width="{max(bw, 0.35)}" '
                 f'height="{BAR}"/>')
        p.append(f'<text class="cnt" x="{X0 + max(bw, 0.35) + 5}" y="{top + BAR - 1}">'
                 f'{sp(n) if n else "—"}</text>')
        p.append('</g>')
    p.append('</svg>')
    return "".join(p)


def draw_lengths(D):
    L = {int(k): v for k, v in D["lengths"].items()}
    lo, hi = D["length_stats"]["min"], D["length_stats"]["max"]
    top = max(L.values())
    w, h = hi - lo + 1, 120
    parts = [f'<svg class="hist" viewBox="0 0 {w + 2} {h + 22}" role="img" '
             f'aria-label="How many years each closure lasts, from {lo} to {hi}.">']
    for k in range(lo, hi + 1):
        v = L.get(k, 0)
        if not v:
            continue
        bh = max(1, round(h * v / top, 3))
        parts.append(f'<rect class="ln" x="{1 + k - lo}" y="{round(h - bh, 3)}" '
                     f'width="1" height="{bh}" data-len="{k}" data-n="{v}"/>')
    parts.append(f'<line class="axis" x1="1" y1="{h + 1}" x2="{w + 1}" y2="{h + 1}"/>')
    for k in (lo, 41, 56, 100, 150, hi):
        if lo <= k <= hi:
            x = 1 + k - lo
            parts.append(f'<line class="tick" x1="{x}" y1="{h + 1}" x2="{x}" '
                         f'y2="{h + 5}"/>')
            parts.append(f'<text class="tlab" x="{x}" y="{h + 17}">{k}</text>')
    parts.append('</svg>')
    return "".join(parts)


def entry_rows(items, cols):
    out = []
    for q in items:
        cells = "".join(f'<td>{esc(q.get(c) or "—")}</td>' for c in cols)
        out.append(f"<tr>{cells}</tr>")
    return "".join(out)


# ---- the page --------------------------------------------------------------------------
def build_html(D, island):
    board, hist = draw_board(D), draw_lengths(D)
    cat, rd, ret = D["catalogue"], D["read"], D["retained"]
    law, ls, wh = D["law"], D["length_stats"], D["withheld"]
    lo, hi = D["span"]

    dept_rows = "".join(
        f'<tr><td class="mono">{esc(d["code"])}</td><td>{esc(d["name"])}</td>'
        f'<td class="num">{sp(d["closed"])}</td><td class="num">{sp(d["dated"])}</td>'
        f'<td class="num">{sp(d["undated"])}</td>'
        f'<td class="num">{sp(d["law_break"])}</td></tr>'
        for d in rd["departments"])

    mile_rows = "".join(
        f'<tr><td class="mono">1 January {y}</td>'
        f'<td class="num">{sp(D["remaining"][str(y)])}</td>'
        f'<td class="num">{sp(D["residue"])}</td>'
        f'<td class="num">{sp(D["remaining"][str(y)] + D["residue"])}</td></tr>'
        for y in D["milestones"] if str(y) in D["remaining"])

    empty = ", ".join(str(y) for y in D["years_empty"]) or "none"
    stray_txt = "; ".join(f"{sp(n)} in {y}" for y, n in D["stray"].items()) or "none"

    css = """
:root{--ink:#15140f;--pale:#f6f4ee;--rule:#cdc7b6;--shut:#15140f;--open:#d8d2c2;
--res:#8a1f11;--accent:#8a1f11;--soft:#6a6558;}
@media (prefers-color-scheme:dark){:root{--ink:#eee9dc;--pale:#12110e;--rule:#3a372e;
--shut:#eee9dc;--open:#3a372e;--res:#d4553f;--accent:#d4553f;--soft:#9a9486;}}
*{box-sizing:border-box}
body{margin:0;background:var(--pale);color:var(--ink);
font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;}
.wrap{max-width:1000px;margin:0 auto;padding:40px 20px 90px}
h1{font-size:clamp(34px,7vw,68px);line-height:.98;letter-spacing:-.02em;margin:0 0 4px;
font-weight:600;font-variant-numeric:lining-nums tabular-nums}
.dateline{font-size:13px;letter-spacing:.11em;text-transform:uppercase;color:var(--soft);
margin:0 0 22px}
.stand{font-size:clamp(17px,2.3vw,21px);line-height:1.5;max-width:46em;margin:0 0 30px}
.stand b{font-weight:600}
h2{font-size:14px;letter-spacing:.15em;text-transform:uppercase;margin:46px 0 12px;
font-weight:600}
h3{font-size:15px;margin:24px 0 6px;font-weight:600}
p{max-width:46em}
.tiles{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 34px;padding:0;list-style:none}
.tiles li{flex:1 1 190px;border-top:2px solid var(--ink);padding:8px 0 0}
.tiles .big{display:block;font-size:clamp(24px,4vw,34px);line-height:1.05;
font-variant-numeric:lining-nums tabular-nums}
.tiles .cap{display:block;font-size:13px;color:var(--soft);margin-top:4px;max-width:20em}
figure{margin:0 0 10px}
figcaption{font-size:13px;color:var(--soft);margin-top:10px;max-width:46em}
svg.board{display:block;width:100%;min-width:600px;height:auto}
.scroll{overflow-x:auto;overflow-y:hidden;padding-bottom:6px;max-width:100%}
.scroll table{min-width:440px}
svg.hist{display:block;width:100%;max-width:560px;height:auto;min-width:300px}
.bar{fill:var(--shut)}
.row.past .bar{fill:var(--open)}
.row.past .cnt,.row.past .ylab{fill:var(--open)}
.row.hot .bar{fill:var(--accent)}
.row.hot .ylab,.row.hot .cnt{fill:var(--accent)}
rect.res{fill:var(--res)}
text.res{fill:var(--res)}
.ln{fill:var(--ink)}
.axis,.tick{stroke:var(--rule);stroke-width:.6}
.ylab{font:9px/1 ui-monospace,Menlo,Consolas,monospace;fill:var(--ink);text-anchor:end;
letter-spacing:.04em}
.ylab.none{fill:var(--res)}
.cnt{font:8px/1 ui-monospace,Menlo,Consolas,monospace;fill:var(--soft)}
.hd{font:8px/1 ui-monospace,Menlo,Consolas,monospace;fill:var(--soft);
letter-spacing:.16em;text-transform:uppercase}
.tlab{font:10px/1 ui-monospace,Menlo,Consolas,monospace;fill:var(--soft);
text-anchor:middle}
.control{display:none;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 16px;
border-top:2px solid var(--ink);border-bottom:1px solid var(--rule);padding:12px 0}
.control.on{display:flex}
.control input[type=range]{flex:1 1 260px;accent-color:var(--accent)}
.readout{font-size:15px;min-width:min(100%,30em);flex:1 1 26em}
.readout .n{font-variant-numeric:lining-nums tabular-nums;font-weight:600}
button{font:inherit;font-size:14px;padding:3px 11px;border:1px solid var(--ink);
background:transparent;color:var(--ink);cursor:pointer;border-radius:2px}
button:hover{background:var(--ink);color:var(--pale)}
table{border-collapse:collapse;font-size:14px;margin:12px 0 0;width:100%}
th,td{text-align:left;padding:5px 12px 5px 0;border-bottom:1px solid var(--rule);
vertical-align:top}
th{font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--soft);
font-weight:600}
td.num,th.num{text-align:right;font-variant-numeric:lining-nums tabular-nums;
padding-right:0}
.mono,.mono td{font:13px/1.5 ui-monospace,Menlo,Consolas,monospace}
span.mono{overflow-wrap:anywhere}
.cols2{overflow-wrap:break-word}
.note{font-size:14px;color:var(--soft);max-width:46em}
.cols2{columns:2 300px;column-gap:34px}
.cols2 p{margin-top:0}
hr{border:0;border-top:1px solid var(--rule);margin:40px 0}
a{color:inherit;text-underline-offset:2px}
.lede{font-size:17px}
.kicker{font-size:13px;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);
margin:0 0 6px;font-weight:600}
"""

    js = """
(function(){
  var D=JSON.parse(document.getElementById('data').textContent);
  var lo=D.span[0],hi=D.span[1];
  var ctl=document.querySelector('.control');ctl.classList.add('on');
  var rng=document.getElementById('now'),out=document.getElementById('readout');
  var cols=Array.prototype.slice.call(document.querySelectorAll('.row[data-year]'));
  var lab=document.getElementById('nowlab');
  function nf(n){return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u2009');}
  function render(y){
    var left=0;
    cols.forEach(function(r){
      var ry=+r.dataset.year;
      if(ry<y){r.classList.add('past');}else{r.classList.remove('past');left+=+r.dataset.n;}
    });
    lab.textContent='1 January '+y;
    out.innerHTML='<span class="n">'+nf(left)+'</span> of the '+nf(D.read.dated)+
      ' dated records are still shut, and the <span class="n">'+nf(D.residue)+
      '</span> with no date are still shut, whatever the year. Total: <span class="n">'+
      nf(left+D.residue)+'</span>.';
  }
  rng.addEventListener('input',function(){render(+rng.value);});
  document.getElementById('run').addEventListener('click',function(){
    var y=+rng.value; if(y>=hi+1){y=lo-1;}
    var t=setInterval(function(){
      y++; rng.value=y; render(y);
      if(y>=hi+1){clearInterval(t);}
    },55);
  });
  document.getElementById('reset').addEventListener('click',function(){
    rng.value=lo-1;render(lo-1);
  });
  // pointing at a line of the board
  cols.forEach(function(r){
    r.addEventListener('mouseenter',function(){
      cols.forEach(function(o){o.classList.remove('hot');});
      r.classList.add('hot');
    });
  });
  document.querySelector('svg.board').addEventListener('mouseleave',function(){
    cols.forEach(function(o){o.classList.remove('hot');});
  });
  render(lo-1);
})();
"""

    h = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(D['title'])} — Ensemble</title>
<meta name="description" content="Every record The National Archives will not let you read
carries the date on which it opens. Eight departments, read complete: {sp(rd['closed'])}
closed records, a timetable running to {hi}, and {sp(D['residue'])} with no date at all.">
<style>{css}</style></head>
<body><div class="wrap">

<p class="kicker">Ensemble · the Studio · cycle 003 · missing data art</p>
<h1>{esc(D['title'])}</h1>
<p class="dateline">{esc(D['date'])} · a work from the catalogue of
 {esc(D['source']['name'])}</p>

<p class="stand">An archive that will not show you a record still writes the record down.
The catalogue at Kew gives each closed file a reference, the number of years it is shut,
and <b>the date it opens</b>. Eight departments were read complete tonight —
<b>{sp(rd['closed'])}</b> closed records — and {sp(rd['dated'])} of them carry that date.
The dates run from {lo} to <b>{hi}</b>, and every one of them is a promise the archive has
made to a reader who is not born yet. Then there is the other kind:
<b>{sp(D['residue'])}</b> records held with no date at all, and
<b>{sp(wh['wholly_closed'])}</b> whose entire title is the sentence that the title may not
be given — counted, dated, and not nameable.</p>

<ul class="tiles">
<li><span class="big">{sp(rd['closed'])}</span><span class="cap">closed records read
 complete, all eight departments, nothing sampled</span></li>
<li><span class="big">{lo}–{hi}</span><span class="cap">the timetable: the span of the
 opening dates, {D['years_occupied']} of its {hi - lo + 1} years occupied</span></li>
<li><span class="big">{sp(D['residue'])}</span><span class="cap">held with no opening
 date — the promise does not cover them</span></li>
<li><span class="big">{sp(wh['wholly_closed'])}</span><span class="cap">whose whole title
 is <span class="mono">[Title withheld]</span>, every one of them with a release
 date</span></li>
</ul>

<h2>The board</h2>
<figure>
<div class="control">
  <button id="run" type="button">Run it forward</button>
  <button id="reset" type="button">Back to tonight</button>
  <label for="now" class="mono" id="nowlab">1 January {lo - 1}</label>
  <input id="now" type="range" min="{lo - 1}" max="{hi + 1}" value="{lo - 1}" step="1"
   aria-label="the year to stand in">
  <p class="readout" id="readout"></p>
</div>
<div class="scroll">{board}</div>
<figcaption><b>One line per year, at one scale, in the order they arrive.</b> The line is
as long as the number of records that open on 1 January of that year, and the number is
printed at the end of it, because a year in which twelve records open is a hairline and
still has to be readable. The busiest is {D['tallest']['year']} with
{sp(D['tallest']['n'])}; {esc(str(len(D['years_empty'])))} years have nothing in them at all
({esc(empty)}). The first line, greyed, is outside the span: {esc(stray_txt)} — an opening
date that has already passed while the record is still catalogued as closed.
<b>And the last line of the board has no year in it.</b> Those are the
{sp(D['residue'])} records held with no opening date — {sp(ret['undated'])} retained by the
department that made them, {sp(rd['undated'])} closed with the date field left empty. At the
same scale it is the longest line on the board, {round(D['residue'] / D['tallest']['n'], 2)}
times the busiest year, and it is the only one the years do not touch.</figcaption>
</figure>

<h3>What is still shut, year by year</h3>
<table><thead><tr><th>standing in</th><th class="num">still shut, dated</th>
<th class="num">still shut, no date</th><th class="num">still shut</th></tr></thead>
<tbody>{mile_rows}</tbody></table>
<p class="note">The timetable empties. The column beside it does not. On 1 January
{hi + 1} every dated record in these eight departments has opened, and
{sp(D['residue'])} are exactly as shut as they are tonight.</p>

<hr>

<h2>The length of the closure is published, per record</h2>
<div class="cols2">
<p>Every closed entry carries a number the catalogue calls its closure code. It is not a
category. It is <b>the number of years</b>: {esc(law['statement'])}. The relation holds for
<b>{sp(law['hold'])}</b> of the {sp(law['hold'] + law['break'])} entries that carry both a
date and a code — <b>{law['pct']}%</b>. All {sp(law['break'])} exceptions were looked at
one at a time and they fall into three kinds:
{law['kinds'].get('day_exact', 0)} follow a <em>stricter</em> rule and not a looser one,
opening exactly one day after the record's own last day plus the code in years — which is
what the 1 January rule is, for the ordinary case of a file that ends on 31 December;
{law['kinds'].get('year_in_code', 0)} have the opening <em>year</em> typed into the field
that wants a <em>duration</em>; and {law['kinds'].get('unexplained', 0)} fit neither and
are left standing as what they are. A field this arithmetic is a field in which a typing
mistake is visible from outside the building.</p>
<p>So the archive does not merely record that a file is shut. It records for how long, in a
number a reader can add up, one entry at a time. The closures run from
<b>{ls['min']}</b> years to <b>{ls['max']}</b>; the median is {ls['median']:g} and the
commonest single length is <b>{ls['mode']} years</b>, which {sp(ls['mode_n'])} records
share. {sp(D['off_new_year_n'])} entries open on a day that is not 1 January, and those are
files that do not end on 31 December: the archive counts their closure to the day.</p>
</div>
<figure>{hist}<figcaption>How long each closure lasts, in years, one bar per length,
{sp(ls['n'])} records. The tall ones are the round decisions — {ls['mode']}, 51, 61, 71
years — and the long thin tail on the right runs to {ls['max']}.</figcaption></figure>

<h3>The longest closures in the eight departments</h3>
<table class="mono"><thead><tr><th>reference</th><th>what it is called</th>
<th>covering</th><th>opens</th><th class="num">years</th></tr></thead><tbody>
{"".join(f'<tr><td>{esc(q["reference"])}</td><td>{esc(q["title"][:78])}</td>'
         f'<td>{esc(q["covering"])}</td><td>{esc(q["opens"])}</td>'
         f'<td class="num">{q["length"]}</td></tr>' for q in D["longest"])}
</tbody></table>
<p class="note">The first row is the extreme of the whole reading and it should be read as
what it is: the catalogue's own statement, not this work's estimate. A closure code of
{esc(D['longest'][0]['code'])} on a file whose covering dates end in the nineteenth century
puts its opening in {hi}. Whether that is a decision or a cataloguing artefact is not
something the catalogue says, and this work does not guess.</p>

<hr>

<h2>Counted, dated, and not named</h2>
<p><b>{sp(wh['wholly_closed'])}</b> of the closed entries have a title that is nothing but
the statement that the title is withheld, and every single one of them still carries a
release date. A further <b>{sp(wh['wholly_retained'])}</b> of the retained entries say the
same and carry no date. Counting the titles where only a person's name is struck out, the
reading holds <b>{sp(wh['any'])}</b> entries with something withheld from the title
itself.</p>
<table class="mono"><thead><tr><th>reference</th><th>title</th><th>covering</th>
<th>opens</th></tr></thead><tbody>
{entry_rows(wh['examples'], ['reference', 'title', 'covering', 'opens'])}
</tbody></table>
<p class="note">This is the shape worth carrying away. A reader can say how many there are,
can point at one, can say what year it stops being secret — and cannot say what it is. The
record holds the coordinate and withholds the name, and it publishes the date on which the
name arrives.</p>

<h2>And the ones with no date</h2>
<p>{sp(ret['undated'])} records of {esc(ret['name'])} are <em>retained</em> — kept by the
department that made them rather than transferred to the archive. The catalogue lists them,
numbers them, and leaves the opening-date field empty. {sp(rd['undated'])} more are
catalogued as closed with no date. Together they are the {sp(D['residue'])} drawn in the
slab above.</p>
<table class="mono"><thead><tr><th>reference</th><th>title</th><th>covering</th>
</tr></thead><tbody>
{entry_rows(D['retained_examples'][:5] + D['undated_examples'][:4],
            ['reference', 'title', 'covering'])}
</tbody></table>

<hr>

<h2>What this corrects</h2>
<p class="lede">On 13 September this practice published, in its presentation for this
cycle, that <b>custody implies a coordinate</b> — that an absence with an owner is always
countable, and that the square made by <em>can it be named</em> against <em>is it held</em>
is therefore structurally empty in one corner. <b>That was wrong, and this catalogue is
where it breaks.</b> {sp(wh['wholly_closed'])} records here are held by a named archive,
counted to the entry, dated to the day — and cannot be named, because the naming is the
thing withheld. Custody gives you a reference, not a name.</p>
<p>The Atelier said the same on the morning of 14 September from the house's own registers,
and said it first: thirteen sources held by a named party under a published ground that
yield no number at all. Its correction of the same day — that a ground is not what makes an
absence countable, the published <em>frame</em> is — survives this reading intact, and this
is that claim with the frame supplied. Kew publishes the frame: every record it holds is an
entry, so every absence inside it is countable, whatever else is struck out. Its own note
of 14 September is that not one of the {sp(2489)} empty cells in this house's three
catalogues carries a per-entry ground. Here every closed entry carries one, and it is a
number of years.</p>

<h2>Nearest works, and the daylight between</h2>
<p><b>Voluspa Jarpa, <em>Biblioteca de la No-Historia</em> (2011)</b> — a thousand
hand-bound books made from United States files on the Southern Cone dictatorships obtained
under freedom-of-information law, the blackouts of the originals kept in place so the
redaction is what the reader sees. Opened at the artist's own page on 14 September 2026.
<b>The daylight:</b> her documents have already been released and the censor's mark is
printed on them; these have not been released at all and there is nothing to print. Hers is
a library of what came back. This is a timetable of what has not.</p>
<p><b>Lawrence Abu Hamdan, <em>Saydnaya (the missing 19dB)</em> (2017)</b> — with no images
of a Syrian military prison in existence, the building is reconstructed from the acoustic
memory of its survivors. Read on 14 September 2026 in James Parker's account of the work in
<em>Index Journal</em>, issue 2, <em>Law</em>. <b>The daylight:</b> his absence has no
record anywhere, so the work has to make the evidence; every absence counted here is a line
in an official register that names it, dates it and files it. The stakes are not
comparable, and this page does not claim they are: the point of standing the two side by
side is that the thing missing from a record and the record of a missing thing are opposite
problems.</p>
<p class="note">A third address was tried and refused: the gallery page for Archie Moore's
<em>kith and kin</em> answered 403 to this session and was not used. A door that will not
say what is behind it is a fair thing to meet on a night like this, and it is recorded
rather than worked around.</p>

<hr>

<h2>Method</h2>
<div class="cols2">
<p>Source: the Discovery catalogue of {esc(D['source']['name'])}, through its public search
interface at <span class="mono">{esc(D['source']['api'])}</span>, read
{esc(D['source']['read'])}. Crown copyright; re-used under the Open Government Licence
v3.0, which asks that the source be identified and the copyright status acknowledged, and
it is. Nothing of the catalogue is mirrored into this practice's repository: the raw pages
live in a cache outside it, <span class="mono">harvest.py</span> writes only the
measurement, and the individual entries printed above are quoted as evidence so that a
reader can go and check them.</p>
<p>The whole catalogue holds {sp(cat['total'])} records held by the archive at Kew:
{sp(cat['open'])} open, <b>{sp(cat['closed'])} closed</b>, {sp(cat['retained'])} retained,
{sp(cat['unknown'])} unknown and {sp(cat['not_applicable'])} not applicable. The eight
departments below were pulled <b>complete</b> — every closed record, by cursor, in
reference order, the pulled count checked against the count the interface reports — and
they are {rd['share_of_all_closed']}% of all closed records. They are not a sample and
nothing here is extrapolated to the rest.</p>
</div>
<table><thead><tr><th>code</th><th>the catalogue's own name for it</th>
<th class="num">closed</th><th class="num">dated</th><th class="num">no date</th>
<th class="num">rule breaks</th></tr></thead><tbody>{dept_rows}</tbody></table>
<p class="note">Why these eight: the two largest closed holdings in the catalogue are
service records of individuals (the War Office, {sp(2304722)}, and the Air Ministry,
{sp(585248)}) and belong to a different question. These are the departments of policy and
decision whose closed holdings were small enough to read whole in one sitting. The choice
is stated so that it can be argued with.</p>

<h2>What this does not show</h2>
<ul class="note">
<li>An opening date is a plan, not an event. Nothing here checks whether a record that was
due to open ever did, and the one date already in the past ({esc(stray_txt)}) is the
warning about that.</li>
<li>A closed entry is not evidence that the thing behind it is interesting, and the length
of a closure is not a measure of what it holds.</li>
<li>The closure code is read here as a number of years because the arithmetic says so in
{law['pct']}% of cases. The interface does not document the field, and no second
independent record of these decisions exists to check it against. If the archive publishes
a different meaning for it, this reading is wrong and the drawing is unaffected — the
opening dates are printed in the catalogue either way.</li>
<li>Retained is not the same as closed: those records are held by their department, and the
archive is recording someone else's decision. The empty date field is not a refusal by Kew,
it is the absence of a transfer.</li>
<li>The counts move. They are the state of the interface on {esc(D['source']['read'])};
a rerun on another day will differ, and should.</li>
</ul>

<h2>Verification</h2>
<p class="note"><span class="mono">harvest.py</span> fetches and writes
<span class="mono">counts.json</span>; <span class="mono">--offline</span> recounts from the
cache with no network. <span class="mono">build.py --check</span> rebuilds this page and
<span class="mono">data.json</span> from that file alone and fails on a single differing
byte. <span class="mono">verify.mjs</span> opens this page in a real browser with scripting
off and on and measures the drawing: the scale is taken from the board's own longest line
and every one of the {len(D['timetable']) + len(D['stray'])} other lines must then be
exactly as long as its count, the line with no year must be the last and the longest, and
the page must not make one network request in either state. The data island below is
byte-identical to <span class="mono">data.json</span>.</p>

<p class="note">Text and figures CC BY 4.0 · code Apache-2.0 · no library is loaded, no
third-party code is embedded and no asset is fetched · Ensemble, the Studio,
{esc(D['date'])}</p>

<script id="data" type="application/json">{island}</script>
<script>{js}</script>
</div></body></html>
"""
    # Every table is put in its own scrolling box: on a narrow screen a table of catalogue
    # references is the one thing on the page that may not be reflowed, and the page body
    # must never scroll sideways.
    h = h.replace("<table", '<div class="scroll"><table').replace("</table>", "</table></div>")
    return h


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    c = json.load(open(os.path.join(HERE, "counts.json")))
    D = build_data(c)
    island = json.dumps(D, indent=1, ensure_ascii=False) + "\n"
    html = build_html(D, island)

    dj, ih = os.path.join(HERE, "data.json"), os.path.join(HERE, "index.html")
    if a.check:
        bad = []
        for path, want in ((dj, island), (ih, html)):
            have = open(path, encoding="utf-8").read()
            if have != want:
                bad.append(f"{os.path.basename(path)} differs "
                           f"({len(have)} on disk, {len(want)} rebuilt)")
        if bad:
            print("CHECK FAILED: " + "; ".join(bad))
            sys.exit(1)
        print(f"check: byte-identical  (data.json {len(island)}, index.html {len(html)})")
        return
    open(dj, "w", encoding="utf-8").write(island)
    open(ih, "w", encoding="utf-8").write(html)
    print(f"data.json  {len(island)} bytes\nindex.html {len(html)} bytes")


if __name__ == "__main__":
    main()
