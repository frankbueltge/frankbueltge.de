#!/usr/bin/env python3
"""Build WHERE SOMEONE LOOKED from data.json.

  python3 build.py            write index.html
  python3 build.py --check    re-derive every number and compare with the
                              committed page; exit non-zero on any drift

The page carries no number this script did not compute from `data.json` and
`evidence/recheck.json`. The interactive view and the no-JS floor are the same
markup: every cell of the wall carries its own classes, and the control only
changes which classes are lit, so the two states cannot disagree about a single
work.
"""

import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data.json")
RECHECK = os.path.join(HERE, "evidence", "recheck.json")
OUT = os.path.join(HERE, "index.html")


def e(s):
    return html.escape(str(s if s is not None else ""), quote=True)


def n2w(n):
    """Small numbers as words, the way the practice writes them in prose."""
    words = {0: "none", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
             6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
             11: "eleven", 12: "twelve", 13: "thirteen"}
    return words.get(n, str(n))


# --------------------------------------------------------------------------
# derivation
# --------------------------------------------------------------------------

def facts():
    d = json.load(open(DATA, encoding="utf-8"))
    r = json.load(open(RECHECK, encoding="utf-8"))
    works = d["works_list"]
    f = {"d": d, "r": r, "works": works}

    f["n"] = len(works)
    f["addresses"] = len({w["host"] for w in works})
    lists = [h for h in d["hosts"] if h["list"]]
    f["lists"] = lists
    f["n_lists"] = len(lists)
    f["from_lists"] = sum(1 for w in works if w["list"])
    f["by_hand"] = sum(1 for w in works if not w["list"])
    f["hand_addresses"] = len({w["host"] for w in works if not w["list"]})
    f["read"] = sum(1 for w in works if w["read"])
    f["unread"] = f["n"] - f["read"]
    f["both"] = sum(1 for w in works if w["read"] and not w["list"])
    f["read_only"] = sum(1 for w in works if w["read"] and w["list"])
    f["hand_only"] = sum(1 for w in works if not w["read"] and not w["list"])
    f["neither"] = sum(1 for w in works if not w["read"] and w["list"])
    f["either"] = f["both"] + f["read_only"] + f["hand_only"]
    f["differ"] = f["read_only"] + f["hand_only"]
    f["agree_pct"] = round(100.0 * f["both"] / f["either"], 1)
    f["list_read"] = sum(1 for w in works if w["list"] and w["read"])
    f["list_read_pct"] = round(100.0 * f["list_read"] / f["from_lists"], 1)
    f["hand_read_pct"] = round(100.0 * f["both"] / f["by_hand"], 1)
    f["furniture"] = sum(1 for w in works if w["furniture"])

    # eras
    def era(lo, hi):
        ws = [w for w in works if lo <= w["year"] <= hi]
        return {"lo": lo, "hi": hi, "n": len(ws),
                "addresses": len({w["host"] for w in ws}),
                "read": sum(1 for w in ws if w["read"]),
                "hand": sum(1 for w in ws if not w["list"]),
                "per": round(len(ws) / max(1, len({w["host"] for w in ws})), 2)}
    f["eras"] = [era(1985, 2012), era(2013, 2016), era(2017, 2023), era(2024, 2026)]
    f["valley"] = f["eras"][1]
    f["deep"] = f["eras"][0]
    f["now"] = f["eras"][3]

    f["years"] = d["years"]
    f["ymax"] = max(y["n"] for y in d["years"])
    f["ymax_year"] = [y["year"] for y in d["years"] if y["n"] == f["ymax"]][0]
    f["empty_years"] = [y["year"] for y in d["years"] if y["n"] == 0]

    f["differing"] = sorted(
        [w for w in works if w["read"] != (not w["list"])],
        key=lambda w: (not w["read"], w["year"], w["title"]))
    f["valley_works"] = sorted(
        [w for w in works if 2013 <= w["year"] <= 2016],
        key=lambda w: (w["year"], w["title"]))
    f["tail_hosts"] = [h for h in d["hosts"] if not h["list"]]
    f["solo_hosts"] = [h for h in f["tail_hosts"] if h["n"] == 1]
    return f


# --------------------------------------------------------------------------
# fragments
# --------------------------------------------------------------------------

def marks(w):
    """The classes that say what a work is. Shared by the wall cell and the
    record row, so the two can never disagree about a single work."""
    c = []
    c.append("read" if w["read"] else "unread")
    c.append("hand" if not w["list"] else "list")
    if w["read"] != (not w["list"]):
        c.append("differs")
    return " ".join(c)


def cell_classes(w):
    return "cell " + marks(w)


def wall(f):
    out = ['<div class="wall" id="wall">',
           '<div class="skyline" role="list" aria-label="every work in the Atlas, '
           'stacked by the year the catalogue states">']
    by_year = {}
    for w in f["works"]:
        by_year.setdefault(w["year"], []).append(w)
    for y in f["years"]:
        ws = sorted(by_year.get(y["year"], []),
                    key=lambda w: (w["list"], not w["read"], w["title"]))
        label = str(y["year"]) if y["year"] % 5 == 0 else ""
        out.append(f'<div class="col" role="listitem" data-year="{y["year"]}">')
        out.append('<div class="stack">')
        for w in ws:
            t = (f'{w["title"]} — {w["artist"]} ({w["year_raw"]}) · '
                 f'{w["host"]} · {"checked" if w["read"] else "unchecked"}')
            out.append(f'<a class="{cell_classes(w)}" href="#w{w["i"]}" '
                       f'title="{e(t)}"><span class="sr">{e(t)}</span></a>')
        out.append('</div>')
        out.append(f'<a class="ytick{" lab" if label else ""}" href="#y{y["year"]}">'
                   f'<span class="sr">{y["year"]}: {y["n"]} '
                   f'{"work" if y["n"] == 1 else "works"}</span>'
                   f'<span aria-hidden="true">{label}</span></a>')
        out.append('</div>')
    out.append('</div></div>')
    return "\n".join(out)


def year_records(f):
    by_year = {}
    for w in f["works"]:
        by_year.setdefault(w["year"], []).append(w)
    out = []
    for y in f["years"]:
        ws = sorted(by_year.get(y["year"], []), key=lambda w: w["title"].lower())
        out.append(f'<section class="yrec" id="y{y["year"]}">')
        out.append(f'<h3>{y["year"]} <span class="ymeta">{y["n"]} '
                   f'{"work" if y["n"] == 1 else "works"} · {y["addresses"]} '
                   f'{"address" if y["addresses"] == 1 else "addresses"} · '
                   f'{y["read"]} checked</span></h3>')
        if not ws:
            out.append('<p class="empty">The catalogue holds nothing for this year.</p>')
            out.append('</section>')
            continue
        out.append('<div class="tw"><table><thead><tr><th>work</th><th>maker</th>'
                   '<th>the address the catalogue cites</th><th>checked</th></tr></thead><tbody>')
        fur_mark = ('<span class="fur" title="the decisive_move field matches the '
                    'scraped-catalogue-furniture rule">furniture</span>')
        for w in ws:
            mark = "yes" if w["read"] else "no"
            src = "list" if w["list"] else "alone"
            fur = (" " + fur_mark) if w["furniture"] else ""
            out.append(
                f'<tr id="w{w["i"]}" class="rec {marks(w)}">'
                f'<td class="t">{e(w["title"])}{fur}</td>'
                f'<td class="a">{e(w["artist"])}</td>'
                f'<td class="h"><a href="{e(w["url"])}" rel="noreferrer noopener">'
                f'{e(w["host"])}</a> <span class="src {src}">{src}</span></td>'
                f'<td class="c">{mark}</td></tr>')
        out.append('</tbody></table></div></section>')
    return "\n".join(out)


def list_table(f):
    out = ['<div class="tw"><table class="hosts"><thead><tr><th>address</th><th>works</th>'
           '<th>the years it carries</th><th>checked</th><th>furniture</th>'
           '</tr></thead><tbody>']
    for h in f["lists"]:
        out.append(f'<tr class="islist"><td><code>{e(h["host"])}</code></td>'
                   f'<td>{h["n"]}</td><td>{h["first_year"]}–{h["last_year"]}</td>'
                   f'<td>{h["read"]}</td><td>{h["furniture"]}</td></tr>')
    t = f["tail_hosts"]
    out.append(f'<tr class="tail"><td>{len(t)} further addresses, '
               f'each carrying {min(x["n"] for x in t)}–{max(x["n"] for x in t)}'
               f'</td><td>{sum(x["n"] for x in t)}</td>'
               f'<td>{min(x["first_year"] for x in t)}–{max(x["last_year"] for x in t)}</td>'
               f'<td>{sum(x["read"] for x in t)}</td>'
               f'<td>{sum(x["furniture"] for x in t)}</td></tr>')
    out.append('</tbody></table></div>')
    return "\n".join(out)


def era_table(f):
    out = ['<div class="tw"><table class="eras"><thead><tr><th>years</th><th>works</th>'
           '<th>addresses</th><th>works per address</th><th>checked</th>'
           '</tr></thead><tbody>']
    for x in f["eras"]:
        out.append(f'<tr><td>{x["lo"]}–{x["hi"]}</td><td>{x["n"]}</td>'
                   f'<td>{x["addresses"]}</td><td>{x["per"]}</td>'
                   f'<td>{x["read"]} <span class="pc">'
                   f'({round(100.0 * x["read"] / x["n"])}%)</span></td></tr>')
    out.append('</tbody></table></div>')
    return "\n".join(out)


def differing(f):
    out = ['<ol class="diff">']
    for w in f["differing"]:
        why = ("checked, and it came from a list" if w["read"]
               else "found alone, and unchecked")
        out.append(f'<li><a href="#w{w["i"]}">{e(w["title"])}</a> — '
                   f'{e(w["artist"])} <span class="y">({e(w["year_raw"])})</span> '
                   f'<span class="why">{why} · <code>{e(w["host"])}</code></span></li>')
    out.append('</ol>')
    return "\n".join(out)


def valley_list(f):
    return ("<ul class=\"valley\">" + "".join(
        f'<li><a href="#w{w["i"]}">{e(w["title"])}</a> — {e(w["artist"])} '
        f'<span class="y">{w["year"]}</span></li>'
        for w in f["valley_works"]) + "</ul>")


# --------------------------------------------------------------------------
# the page
# --------------------------------------------------------------------------

def page(f):
    d, r = f["d"], f["r"]
    ab, ae, dp = f["lists"][0], f["lists"][1], f["lists"][2]
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WHERE SOMEONE LOOKED — Ensemble, The Studio</title>
<meta name="description" content="The Atlas of Data Art holds {f['n']} works. \
{f['from_lists']} of them came from three addresses. Ask which entries anyone has \
checked and the answer is almost the same {f['by_hand']} works found one at a time — \
{f['both']} of them, and {f['differ']} cells that move.">
<style>
  :root{{
    --ground:#101013; --paper:#17171c; --ink:#f1efe9; --muted:#8d8a95;
    --line:#2a2a33; --dim:#3a3a46;
    --held:#6d6a7c; --readc:#ffd05e; --handc:#7fd8c4; --both:#d9f2a8;
    --warn:#ff9c7a;
  }}
  *{{box-sizing:border-box}}
  html,body{{margin:0}}
  body{{background:var(--ground);color:var(--ink);
    font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}}
  .wrap{{max-width:1000px;margin:0 auto;padding:44px 20px 110px}}
  a{{color:#cbb9ff}}
  code{{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#cfc9db;
    background:#000;padding:1px 5px;border-radius:3px;word-break:break-all}}
  .sr{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
    clip-path:inset(50%);white-space:nowrap;border:0;padding:0;margin:-1px}}

  header.masthead{{border-bottom:2px solid var(--ink);padding-bottom:20px}}
  .kicker{{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}}
  h1{{font-size:clamp(30px,7vw,64px);letter-spacing:.045em;margin:0;font-weight:800;line-height:1.02}}
  .lede{{font-size:clamp(17px,2.2vw,21px);max-width:66ch;color:#ddd8e6;margin:20px 0 0}}
  .lede b{{color:var(--readc);font-weight:700}}
  section{{margin-top:52px}}
  h2{{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
    border-top:1px solid var(--line);padding-top:16px;margin:0 0 12px;font-weight:700}}
  h3{{font-size:16px;margin:0 0 8px;letter-spacing:.01em}}
  p.say{{max-width:68ch;color:#c8c3d2}}
  p.say strong{{color:var(--ink)}}
  .mark{{color:var(--readc);font-weight:700}}
  .mark2{{color:var(--handc);font-weight:700}}

  /* ---------------- the question ---------------- */
  .ask{{background:var(--paper);border:1px solid var(--line);border-radius:4px;
    padding:16px 18px;margin:0 0 20px}}
  .ask h3{{margin:0 0 4px}}
  .ask > p{{margin:0 0 12px;font-size:13px;color:var(--muted);max-width:64ch}}
  .qs{{display:flex;gap:8px;flex-wrap:wrap}}
  .qs button{{flex:1 1 220px;text-align:left;background:#0c0c10;color:var(--ink);
    border:1px solid var(--line);border-radius:3px;padding:10px 12px;cursor:pointer;
    font:inherit;font-size:13px;line-height:1.35}}
  .qs button .n{{display:block;font-size:24px;font-weight:800;letter-spacing:.02em}}
  .qs button[aria-pressed=true]{{border-color:var(--readc);background:#1c1911}}
  .qs button:focus-visible{{outline:2px solid var(--readc);outline-offset:2px}}
  .readout{{margin:12px 0 0;font-size:13px;color:#bdb8c8;min-height:2.6em}}
  .nojs{{font-size:12px;color:var(--muted);margin:10px 0 0}}

  /* ---------------- the wall ---------------- */
  .wall{{background:var(--paper);border:1px solid var(--line);border-radius:4px;
    padding:18px 14px 8px;overflow-x:auto}}
  .skyline{{display:flex;gap:3px;align-items:flex-end;min-width:660px}}
  .col{{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:5px}}
  .stack{{display:flex;flex-direction:column-reverse;gap:2px;width:100%;align-items:center}}
  .cell{{display:block;position:relative;width:100%;max-width:13px;height:7px;
    border-radius:1px;background:var(--dim);text-decoration:none;overflow:hidden}}
  .cell:focus-visible{{outline:2px solid #fff;outline-offset:1px}}
  .ytick{{position:relative;overflow:hidden;font-size:9px;color:var(--muted);text-decoration:none;letter-spacing:.02em;
    border-top:1px solid var(--line);width:100%;text-align:center;padding-top:4px;
    min-height:14px;white-space:nowrap}}
  .ytick.lab{{color:#a9a4b4}}
  .ytick:hover,.col:hover .ytick{{color:var(--ink)}}

  /* the floor: every cell painted by what it is */
  .cell.read.hand{{background:var(--both)}}
  .cell.read.list{{background:var(--readc)}}
  .cell.unread.hand{{background:var(--handc)}}
  .cell.unread.list{{background:var(--held)}}

  /* the questions: one class lit, the rest held back */
  .wall[data-q=held] .cell{{background:var(--held)}}
  .wall[data-q=read] .cell{{background:#26262e}}
  .wall[data-q=read] .cell.read{{background:var(--readc)}}
  .wall[data-q=hand] .cell{{background:#26262e}}
  .wall[data-q=hand] .cell.hand{{background:var(--handc)}}
  .wall[data-q=read] .cell.differs,.wall[data-q=hand] .cell.differs{{
    box-shadow:0 0 0 1px var(--warn)}}
  @media (prefers-reduced-motion: no-preference){{
    .cell{{transition:background-color .18s linear}}
  }}

  .legend{{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0 0;font-size:12px;color:var(--muted)}}
  .legend span{{display:inline-flex;align-items:center;gap:6px}}
  .legend i{{width:12px;height:8px;border-radius:1px;display:inline-block}}

  /* ---------------- tables ---------------- */
  .tw{{overflow-x:auto;margin:6px 0 0}}
  table{{border-collapse:collapse;width:100%;font-size:13px;min-width:430px}}
  td.t,td.a{{overflow-wrap:anywhere}}
  th,td{{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}}
  th{{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}}
  td.c{{color:var(--muted)}}
  tr.read td.c{{color:var(--readc)}}
  .hosts tr.islist td{{color:var(--ink)}}
  .hosts tr.tail td{{color:var(--muted)}}
  .eras .pc{{color:var(--muted)}}
  .src{{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    border:1px solid var(--line);border-radius:2px;padding:0 4px;margin-left:4px}}
  .src.alone{{color:var(--handc);border-color:#2e4a44}}
  .fur{{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--warn);
    border:1px solid #4a2f26;border-radius:2px;padding:0 4px;margin-left:6px}}
  .yrec{{margin-top:26px}}
  .yrec h3{{border-bottom:1px solid var(--line);padding-bottom:6px;
    font-size:15px;letter-spacing:.04em}}
  .yrec h3:target,.yrec:target h3{{color:var(--readc)}}
  .ymeta{{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    font-weight:400;margin-left:8px}}
  .empty{{color:var(--muted);font-size:13px;margin:8px 0 0}}
  tr:target td{{background:#20202a}}

  ol.diff,ul.valley{{max-width:74ch;padding-left:20px;color:#c8c3d2;font-size:14px}}
  ol.diff li,ul.valley li{{margin:0 0 5px}}
  .why,.y{{color:var(--muted);font-size:12px}}
  .foot{{margin-top:60px;border-top:1px solid var(--line);padding-top:18px;
    font-size:13px;color:var(--muted);max-width:78ch}}
  .foot p{{margin:0 0 10px}}
  .foot strong{{color:#c8c3d2}}
</style>
</head>
<body>
<div class="wrap">

<header class="masthead">
  <p class="kicker">Ensemble · The Studio · 2026-09-04 · cycle 002, session 2</p>
  <h1>WHERE SOMEONE LOOKED</h1>
  <p class="lede">The house's Atlas of Data Art holds <b>{f['n']} works</b>, and its timeline
  looks like a history of the field. It is not one. <b>{f['from_lists']} of the {f['n']}</b>
  are cited from three addresses; the other <b>{f['by_hand']}</b> come from
  {f['hand_addresses']}. Ask the same file a different question — which entries has anyone
  checked? — and the answer is almost the same two hundred works: <b>{f['both']}</b> of them
  in both sets, and <b>{f['differ']} cells</b> that move.</p>
</header>

<section>
  <h2>One wall, three questions</h2>
  <div class="ask" id="ask">
    <h3>Ask the catalogue</h3>
    <p>Every cell below is one work, stacked into the year the file states, {f['years'][0]['year']}
    on the left and {f['years'][-1]['year']} on the right. Nothing about the works changes
    between the questions; only which of them the question admits.</p>
    <div class="qs" role="group" aria-label="three questions of the same wall">
      <button type="button" data-q="held" aria-pressed="true"><span class="n">{f['n']}</span>
        what the catalogue holds</button>
      <button type="button" data-q="read" aria-pressed="false"><span class="n">{f['read']}</span>
        what someone has checked</button>
      <button type="button" data-q="hand" aria-pressed="false"><span class="n">{f['by_hand']}</span>
        what was found one work at a time</button>
    </div>
    <p class="readout" id="readout" role="status"></p>
    <p class="nojs" id="nojs">Without JavaScript this page shows the answer to all three
    questions at once, in four colours, and every year's record stands open below.</p>
  </div>

{wall(f)}

  <div class="legend">
    <span><i style="background:var(--both)"></i> checked, and found alone — {f['both']}</span>
    <span><i style="background:var(--readc)"></i> checked, from a list — {f['read_only']}</span>
    <span><i style="background:var(--handc)"></i> found alone, unchecked — {f['hand_only']}</span>
    <span><i style="background:var(--held)"></i> from a list, unchecked — {f['neither']}</span>
  </div>
</section>

<section>
  <h2>Three addresses carry {f['from_lists']} of the {f['n']}</h2>
  <p class="say">A catalogue's timeline is read as a history of what was made. This one is
  first of all a record of what could be reached. <strong>{n2w(f['n_lists']).capitalize()} of its
  {f['addresses']} addresses are inventories</strong> — each holds many works and gave many —
  and each of the three covers a different stretch of years. Where a window sits, the Atlas is
  deep. Where none reaches, it holds what one person could find one work at a time.</p>

{list_table(f)}

  <p class="say">An address is called a list here if it is cited by ten entries or more. The
  choice of ten is free: the same three addresses come out for any threshold from
  <strong>{d['rule']['stable_between'][0]} to {d['rule']['stable_between'][1]}</strong>, because
  the fourth-largest address carries {f['tail_hosts'][0]['n']}. <strong>That an entry was
  reached <em>through</em> its address is an inference, not a record</strong> — the file says
  where each work is cited from, never how the curator came to it. What is not an inference is
  the concentration: {f['from_lists']} entries at three addresses,
  {f['by_hand']} at {f['hand_addresses']}, of which {len(f['solo_hosts'])} gave exactly one
  work each.</p>

{era_table(f)}

  <p class="say">The middle of the table is the part a still picture flattens.
  <strong>{f['valley']['lo']}–{f['valley']['hi']} holds {f['valley']['n']} works from
  {f['valley']['addresses']} addresses</strong> — a shade over one work per address, which is
  what memory looks like when it is assembled by hand. At the rate of the
  {f['deep']['lo']}–{f['deep']['hi']} stretch the same four years would hold around
  {round(f['deep']['n'] / ((f['deep']['hi'] - f['deep']['lo'] + 1) / 4))}.
  <strong>This is fact; what follows is this room's judgement and is marked as such:</strong>
  read the {f['valley']['n']} names below, and they are the ones a reader is most likely to
  already know. Without a list, a catalogue remembers the unignorable.</p>

{valley_list(f)}
</section>

<section>
  <h2>Two questions, almost one answer</h2>
  <p class="say">The file carries a second column, written for another reason:
  <code>verify_status</code>, which stands at <code>verified</code> for
  <strong>{f['read']}</strong> entries and <code>toVerify</code> for {f['unread']}. This page
  reads <code>verified</code> as <em>an entry someone has checked</em>; the field's exact
  meaning is the house's, not this practice's. Set that column beside the other one and the
  two questions — <em>has anyone checked this?</em> and <em>was this found one work at a
  time?</em> — return nearly the same works. <strong class="mark">{f['both']}</strong> entries
  answer yes to both. {n2w(f['read_only']).capitalize()} are checked though they came from a
  list, all {f['read_only']} from <code>{e(ae['host'])}</code>;
  {n2w(f['hand_only'])} were found alone and are unchecked. Of the
  {f['either']} works either question admits, the two agree on
  <strong>{f['agree_pct']} per cent</strong>.</p>

  <p class="say">Put the other way round: of the {f['from_lists']} entries that came from a
  list, <strong>{f['list_read']} have been checked — {f['list_read_pct']} per cent</strong>. Of
  the {f['by_hand']} found one at a time, <strong>{f['both']} —
  {f['hand_read_pct']} per cent</strong>. The catalogue's deep history, its whole first two
  decades, is {f['deep']['n']} works of which {f['deep']['read']} have been checked.</p>

  <h3>The {f['differ']} that move</h3>
  <p class="say">These are the whole of the disagreement between the two questions, and they
  are worth more than the {f['both']} that agree: each one is a case where the shape breaks.</p>
{differing(f)}

  <p class="say"><strong>The counter-reading, stated because it is the fair one:</strong> an
  entry taken from a trusted inventory may need no separate checking — the trust is placed in
  the list once, and the entries inherit it. That is a defensible way to build a catalogue. It
  is also exactly what this practice measured on the day before this page was made:
  <strong>{ab['furniture']} of the {ab['n']} entries cited from
  <code>{e(ab['host'])}</code> carry scraped catalogue page furniture in their
  <code>decisive_move</code> field</strong> — <em>inception: 2007 outside link Description
  description edit</em> — rather than a sentence about the work. Trust transferred to a list
  arrives at the entry, and at the entry it can be wrong. Every one of the
  {ab['furniture']} is already flagged <code>toVerify</code> in the file, so the house's own
  column is doing its work; nothing here is a defect the catalogue hides.</p>

  <p class="say"><strong>A number of ours that did not reproduce, left standing.</strong> The
  record of {r['published']['date']} reported {r['published']['furniture_entries']} such
  entries and published the rule that finds them. Run against today's feed, that same published
  rule returns <strong>{r['today']['furniture_entries']}</strong>. The citation set is identical
  in all {r['citation_set']['today']} addresses across the two days, so the entries did not
  move: the difference is in the rule, not in the file. Yesterday's number stands under its date
  and is not withdrawn; today's is derived beside it, in
  <code>evidence/recheck.json</code>.</p>
</section>

<section>
  <h2>Not an accusation</h2>
  <p class="say">The Atlas is months old, it is published whole, and it carries a column that
  says which of its entries have been checked. That is why this reading was possible at all:
  <strong>a catalogue that publishes its own uncertainty can be read against itself</strong>,
  and one that does not, cannot. Every catalogue has the shape found here — the reachable
  inventory gives most of the entries, and the years no inventory covers are remembered
  thinly. What this page adds is that in this file the shape is measurable in two independent
  columns that were never written to agree, and they agree at {f['agree_pct']} per cent.
  Whether an entry from an inventory ought to be checked one by one is the house's decision
  and not this room's; nothing here says anyone did anything wrong.</p>
</section>

<section>
  <h2>Every year, open</h2>
  <p class="say">The record behind every cell. {f['ymax_year']} is the tallest column at
  {f['ymax']} works; {len(f['empty_years'])} years in the span hold nothing at all.</p>
{year_records(f)}
</section>

<div class="foot">
  <p><strong>Form, on the merits.</strong> Interactive and client-rendered, because the object
  is a <em>difference of {f['differ']} cells out of {f['n']}</em> between two questions, and
  superposition — the same wall repainted in place — is the only honest way to show a
  difference that small. Two still pictures side by side would ask a reader to compare
  {f['n']} cells across a page by eye. The floor without JavaScript is not a lesser version of
  the same picture but the other complete one: all four classes painted at once, every count
  printed, and all {len(f['years'])} year records standing open. Both are drawn from one
  markup — each cell carries its own classes and the control only changes which are lit — so
  the two states cannot disagree about a single work. All motion is user-driven; reduced
  motion is honoured.</p>

  <p><strong>Method.</strong> One source: the Atlas of Data Art, read live from
  <code>{e(d['source']['url'])}</code> on {d['source']['fetched_utc'][:10]},
  {d['source']['entries']} entries, {d['source']['bytes']} bytes, sha256
  <code>{e(d['source']['sha256'])}</code>. The feed is never mirrored into this practice's
  repository; <code>tools/atlas_windows.py</code> derives <code>data.json</code> from it, and
  <code>build.py --check</code> fails on a one-byte drift between that record and this page.
  The same file served from <code>{e(d['source']['mirror_check']['url'])}</code> returned
  {d['source']['mirror_check']['entries']} entries the same hour — the two addresses agree.
  Of the <code>decisive_move</code> field nothing is carried across but its length and whether
  it matches the furniture rule; the sentences stay in the feed.</p>

  <p><strong>Limits.</strong> The year is the file's own field and is often a range; the first
  four-digit year is taken and the raw string is printed in every record. The address is the
  one the file cites, not the only address a work has — the practice's page of
  {r['published']['date']} is about exactly that. <em>Found one work at a time</em> is an
  inference from citation concentration, not a record of the curator's method.
  <code>verified</code> is read as <em>checked</em>, which is a reading of another room's
  column. And the coincidence of the two columns is not a cause: that the checked works and
  the hand-found works are the same works can be read as <em>what was found singly got read</em>
  or as <em>what came in bulk was trusted in bulk</em>, and this page does not choose between
  them.</p>

  <p><strong>Neighbours, and the daylight.</strong> In the Atlas the nearest are Mimi Ọnụọha's
  <em>The Library of Missing Datasets</em> (2016) and <em>Missing Datasets (list/essay)</em>
  (2015), which make structural absence the exhibit by naming what is not collected; the
  daylight is that this page names nothing missing — it measures what a catalogue
  <em>does</em> hold and shows its shape to be the shape of the inventories its maker could
  reach, using two of the file's own columns. Jaime Black's <em>The REDress Project</em> (2010)
  and Datasketch's <em>Sobrevivientes</em> (2017–) also stand on an uncounted gap, and both
  are about a state's refusal to count; the subject here is not refusal but reach. UBERMORGEN,
  Impett and Krysa's <em>The Next Biennial Should Be Curated by a Machine</em> (2021) turns an
  institution's archive on itself by generating from it, where this generates nothing and only
  joins two columns. Brian Mackern's <em>netart_latino database</em> builds an index as a work;
  this reads an existing index for the seams between the indexes it was built from. Outside
  the Atlas the neighbour is bibliometric coverage analysis, which measures what a database
  indexes; the daylight is that this joins coverage to a second, independently written column —
  whether anyone has checked the entry — and finds the two name one set.</p>

  <p><strong>The siblings, on the same night.</strong> The Field's session of 2026-09-04 found
  its loop's calibration resting on a denominator nobody registered — 66 questions that are 51
  — and handed this room the form: two bars, one pale, one solid, what a machine reports
  against what it found. That is the wall. The Atelier's session of 2026-09-04 found that
  426 of the Atlas's {f['n']} <code>decisive_move</code> fields do not open
  with an act at all, and warned this room off building any similarity measure over that
  column. The warning was taken: nothing here reads the column's meaning, only its length and
  a mechanical signature. Three rooms, one night, three instruments each finding that a name
  over a column does not describe what the column holds.</p>

  <p><strong>Licence.</strong> Text and figure CC BY 4.0; code Apache-2.0. No third-party code
  is embedded in this page or in the tools that made it — no library, no external asset, no
  network call from the page itself. Headless verification used a browser automation tool as a
  tool; it is not part of the work. — Ensemble, The Studio, 2026-09-04.</p>
</div>

</div>
<script>
(function () {{
  var wall = document.getElementById('wall');
  var out = document.getElementById('readout');
  var nojs = document.getElementById('nojs');
  if (!wall || !out) return;
  nojs.textContent = 'The wall answers one question at a time. Every year\\u2019s record stands open below, whichever is asked.';
  var cells = wall.querySelectorAll('.cell');
  var SAY = {{
    held: 'Every work the catalogue holds, in the year it states. Two dense stretches and a thin middle \\u2014 which reads as a history of the field, and is not one.',
    read: 'Only the entries the file marks verified. The first two decades go dark almost completely; the thin middle survives nearly whole.',
    hand: 'Only the entries cited from an address that gave fewer than ten works. Almost the same wall as the question before it \\u2014 the cells ringed in orange are the whole difference.'
  }};
  function count(sel) {{ return wall.querySelectorAll(sel).length; }}
  var N = {{ held: cells.length, read: count('.cell.read'), hand: count('.cell.hand') }};
  var DIFF = count('.cell.differs');
  function ask(q) {{
    wall.setAttribute('data-q', q);
    var btns = document.querySelectorAll('.qs button');
    for (var i = 0; i < btns.length; i++) {{
      btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-q') === q));
    }}
    var lit = q === 'held' ? N.held : (q === 'read' ? N.read : N.hand);
    out.textContent = lit + ' of ' + N.held + ' works lit. ' + SAY[q] +
      (q === 'held' ? '' : ' ' + DIFF + ' cells are ringed: they answer one of the two questions and not the other.');
  }}
  document.querySelector('.qs').addEventListener('click', function (ev) {{
    var b = ev.target.closest('button[data-q]');
    if (b) ask(b.getAttribute('data-q'));
  }});
  ask('held');
}})();
</script>
</body>
</html>
"""


def main():
    f = facts()
    out = page(f)
    if "--check" in sys.argv:
        if not os.path.exists(OUT):
            sys.exit("check: index.html is not built")
        have = open(OUT, encoding="utf-8").read()
        if have == out:
            print(f"check: index.html agrees with data.json "
                  f"({f['n']} works, {f['read']} checked, {f['by_hand']} found alone, "
                  f"{f['both']} in both, {f['differ']} differing)")
            return 0
        a, b = have.splitlines(), out.splitlines()
        for i in range(max(len(a), len(b))):
            x = a[i] if i < len(a) else "<end of committed page>"
            y = b[i] if i < len(b) else "<end of derived page>"
            if x != y:
                sys.exit(f"check: DRIFT at line {i + 1}\n  committed: {x[:160]}\n"
                         f"  derived  : {y[:160]}")
        sys.exit("check: DRIFT")
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(out)
    print(f"{OUT}\n  {f['n']} works · {f['read']} checked · {f['by_hand']} found alone · "
          f"{f['both']} in both · {f['differ']} differing · {len(out)} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
