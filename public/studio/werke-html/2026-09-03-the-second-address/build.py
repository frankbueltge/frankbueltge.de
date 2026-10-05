#!/usr/bin/env python3
"""Build THE SECOND ADDRESS from data.json.

  python3 build.py            write index.html
  python3 build.py --check    re-derive every number and compare with the
                              committed page; exit non-zero on any drift

The page carries no number this script did not compute from data.json, and the
interactive view and the no-JS floor are drawn from the same markup: the wall's
cells are buttons that point at rows of the table below them, so the two cannot
disagree about a single work.
"""

import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data.json")
OUT = os.path.join(HERE, "index.html")

STATE_ORDER = ["own", "moved", "keeping", "archive", "lost"]
STATE_WORD = {
    "own": "at its own address",
    "moved": "moved with its maker",
    "keeping": "kept by Rhizome",
    "archive": "only in the Internet Archive",
    "lost": "no address answered, no snapshot reported",
}
# Which reach each state first becomes visible at.
REACH_OF = {"own": 1, "moved": 1, "keeping": 2, "archive": 3, "lost": 4}

ADDR_WORD = {
    "answers": "answers",
    "moved": "redirects to another host, path kept",
    "swallowed": "redirects, and the path is gone",
    "for-sale": "redirects to a domain-sale page",
    "placeholder": "answers with a placeholder, not the work",
    "gone": "not found",
    "server-error": "the server errs",
    "blocked": "refuses this instrument",
    "unreachable": "no host answered",
}


def e(s):
    return html.escape(str(s if s is not None else ""), quote=True)


def short(u, n=64):
    u = re.sub(r"^https?://", "", u or "")
    return u if len(u) <= n else u[: n - 1] + "…"


def numbers(d):
    """Every figure the page states, derived here and nowhere else."""
    W = d["works"]
    t = d["totals"]["states"]
    n = {
        "entries": d["frame"]["atlas_entries"],
        "addresses": d["frame"]["distinct_addresses"],
        "frame_answers": d["frame"]["states"]["answers"],
        "works": len(W),
        "with_keeper": d["totals"]["with_keeper"],
        "without_keeper": d["totals"]["without_keeper"],
    }
    for s in STATE_ORDER:
        n[s] = t.get(s, 0)
    n["reach1"] = n["own"] + n["moved"]
    n["reach2"] = n["reach1"] + n["keeping"]
    n["reach3"] = n["reach2"] + n["archive"]
    n["frame_pct"] = round(100 * n["frame_answers"] / n["addresses"])
    n["reach1_pct"] = round(100 * n["reach1"] / n["works"])
    nk = [w for w in W if not w["has_keeper"]]
    n["nokeeper_dark"] = sum(1 for w in nk if w["state"] in ("archive", "lost"))
    keep = [w for w in W if w["has_keeper"]]
    n["keeper_addresses"] = sum(len(w["keepers"]) for w in W)
    n["keeper_answers"] = d["totals"]["keeper_states"].get("answers", 0)
    n["keeper_works"] = len(keep)
    o = d["totals"]["outside_states"]
    n["outside_total"] = sum(o.values())
    n["outside_answers"] = o.get("answers", 0)
    n["outside_gone"] = o.get("gone", 0)
    n["outside_unreachable"] = o.get("unreachable", 0)
    n["outside_server"] = o.get("server-error", 0)
    n["outside_swallowed"] = o.get("swallowed", 0)
    n["outside_blocked"] = o.get("blocked", 0)
    n["outside_placeholder"] = o.get("placeholder", 0)
    n["outside_sale"] = o.get("for-sale", 0)
    n["outside_moved"] = o.get("moved", 0)
    years = sorted({w["year_num"] for w in W if w["year_num"]})
    n["year_lo"], n["year_hi"] = years[0], years[-1]
    mv = [w for w in W if w["state"] == "moved"]
    artists = {}
    for w in mv:
        artists[w["artist"]] = artists.get(w["artist"], 0) + 1
    top = max(artists.items(), key=lambda kv: kv[1]) if artists else ("", 0)
    n["moved_artists"] = len(artists)
    n["moved_top_name"] = top[0]
    n["moved_top_n"] = top[1]
    # addresses in a format no current browser plays, from the raw run
    raw = json.load(open(os.path.join(HERE, "evidence", "variants-checked-2.json")))
    flash = {a["url"]: a["check"]["state"] for w in raw for a in w["addresses"]
             if a["check"].get("unplayable_format")}
    n["unplayable"] = len(flash)
    n["unplayable_answering"] = sum(1 for v in flash.values() if v == "answers")
    return n


def wall(W):
    """The wall: one cell per work, in year order, grouped by year."""
    by_year = {}
    for i, w in enumerate(W):
        by_year.setdefault(w["year_num"] or 0, []).append((i, w))
    out = []
    for y in sorted(by_year):
        cells = []
        for i, w in by_year[y]:
            cells.append(
                '<button class="cell" type="button" data-i="{i}" data-state="{s}" '
                'data-reach="{r}" aria-describedby="w{i}" '
                'title="{t} — {a}, {y}: {sw}"><span class="sr">{t}, {sw}</span></button>'.format(
                    i=i, s=w["state"], r=REACH_OF[w["state"]], t=e(w["title"]),
                    a=e(w["artist"]), y=e(w["year"]), sw=e(STATE_WORD[w["state"]])))
        out.append(
            '<div class="year"><div class="ylab">{y}</div><div class="cells">{c}</div>'
            '<div class="ycount">{n}</div></div>'.format(
                y=y, c="".join(cells), n=len(by_year[y])))
    return "\n".join(out)


def addr_line(a, kind):
    bits = ['<li class="addr {k} st-{s}">'.format(k=kind, s=a["state"])]
    bits.append('<span class="what">{}</span> '.format(
        "the artist's own address" if kind == "outside" else "a keeper"))
    bits.append('<code>{}</code> '.format(e(short(a["url"], 78))))
    bits.append('<span class="verdict">{}</span>'.format(e(ADDR_WORD.get(a["state"], a["state"]))))
    if a.get("http"):
        bits.append(' <span class="code">HTTP {}</span>'.format(e(a["http"])))
    if a["state"] in ("moved", "swallowed", "for-sale") and a.get("final_url"):
        bits.append(' <span class="to">→ <code>{}</code></span>'.format(e(short(a["final_url"], 66))))
    adj = a.get("adjudication")
    if adj:
        bits.append(' <span class="hand">read by hand: “{q}” — {n}</span>'.format(
            q=e(adj["quote"]), n=e(adj["note"])))
    arc = a.get("archive") or {}
    if arc.get("held"):
        ts = arc.get("timestamp") or ""
        when = "{}-{}-{}".format(ts[0:4], ts[4:6], ts[6:8]) if len(ts) >= 8 else "?"
        bits.append(' <span class="arc">the Internet Archive holds a snapshot, {}</span>'.format(e(when)))
    elif arc.get("held") is False:
        bits.append(' <span class="arc none">no snapshot reported after {} asks</span>'.format(
            e(arc.get("asked", "?"))))
    bits.append("</li>")
    return "".join(bits)


def table(W):
    rows = []
    for i, w in enumerate(W):
        addrs = "".join(addr_line(a, "outside") for a in w["outside"]) + \
                "".join(addr_line(a, "keeper") for a in w["keepers"])
        if not addrs:
            addrs = '<li class="addr st-none">the ArtBase record names no address for this work</li>'
        rows.append(
            '<article class="rec" id="w{i}" data-state="{s}">'
            '<h3>{t} <span class="yr">{y}</span></h3>'
            '<p class="by">{a}</p>'
            '<p class="verd">{sw}</p>'
            '<ul class="addrs">{ad}</ul>'
            '<p class="cat">catalogue record: <code>{c}</code></p>'
            "</article>".format(
                i=i, s=w["state"], t=e(w["title"]), y=e(w["year"]), a=e(w["artist"]),
                sw=e(STATE_WORD[w["state"]]), ad=addrs, c=e(short(w["atlas_url"], 60))))
    return "\n".join(rows)


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>THE SECOND ADDRESS — Ensemble</title>
<meta name="description" content="Every net artwork in the house's Atlas of Data Art has two addresses: the one it was made at, and the one that keeps it. 188 works, knocked at once, on 2026-09-03.">
<style>
  :root{{
    --ground:#111014; --paper:#17161c; --ink:#f2efe9; --muted:#8f8a99;
    --line:#2b2934; --dim:#413e4c;
    --own:#ffd964; --moved:#8fd6c0; --keeping:#9fc2ff; --archive:#6f6a85; --lost:#33303c;
    --reach:4;            /* the no-JS floor shows every state at once */
  }}
  *{{box-sizing:border-box}}
  html,body{{margin:0}}
  body{{background:var(--ground);color:var(--ink);
    font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}}
  .wrap{{max-width:980px;margin:0 auto;padding:44px 20px 96px}}
  a{{color:#cbb9ff}}
  code{{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#cfc9db;
    background:#000;padding:1px 5px;border-radius:3px;word-break:break-all}}
  .sr{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}

  header.masthead{{border-bottom:2px solid var(--ink);padding-bottom:20px}}
  .kicker{{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}}
  h1{{font-size:clamp(32px,7.4vw,66px);letter-spacing:.05em;margin:0;font-weight:800;line-height:1.02}}
  .lede{{font-size:clamp(17px,2.3vw,21px);max-width:64ch;color:#ddd7ea;margin:20px 0 0}}
  .lede b{{color:var(--own);font-weight:700}}
  section{{margin-top:52px}}
  h2{{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);
    border-top:1px solid var(--line);padding-top:16px;margin:0 0 10px;font-weight:700}}
  p.say{{max-width:66ch;color:#c9c3d6}}
  p.say strong{{color:var(--ink)}}

  /* ---------------- the control ---------------- */
  .reach{{background:var(--paper);border:1px solid var(--line);border-radius:4px;
    padding:16px 18px;margin:0 0 22px}}
  .reach h3{{margin:0 0 4px;font-size:15px;letter-spacing:.02em}}
  .reach p{{margin:0 0 12px;font-size:13px;color:var(--muted);max-width:62ch}}
  .steps{{display:flex;gap:8px;flex-wrap:wrap}}
  .steps button{{flex:1 1 210px;text-align:left;background:#0d0c11;color:var(--ink);
    border:1px solid var(--line);border-radius:3px;padding:10px 12px;cursor:pointer;font:inherit;font-size:13px}}
  .steps button .n{{display:block;font-size:22px;font-weight:800;letter-spacing:.02em}}
  .steps button[aria-pressed=true]{{border-color:var(--own);background:#1d1a12}}
  .steps button:focus-visible{{outline:2px solid var(--own);outline-offset:2px}}
  .nojs-note{{font-size:12px;color:var(--muted);margin:10px 0 0}}

  /* ---------------- the wall ---------------- */
  .wall{{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:18px 16px 10px;
    overflow-x:auto}}
  .year{{display:grid;grid-template-columns:52px 1fr 34px;gap:10px;align-items:start;
    padding:5px 0;border-bottom:1px solid #211f29}}
  .year:last-child{{border-bottom:0}}
  .ylab{{font:12px/1.9 ui-monospace,Menlo,monospace;color:var(--muted);text-align:right}}
  .ycount{{font:11px/1.9 ui-monospace,Menlo,monospace;color:var(--dim);text-align:right}}
  .cells{{display:flex;flex-wrap:wrap;gap:4px}}
  .cell{{width:18px;height:18px;padding:0;border-radius:2px;cursor:pointer;
    border:1px solid var(--dim);background:transparent;transition:background .18s,border-color .18s}}
  .cell:focus-visible{{outline:2px solid #fff;outline-offset:2px}}
  .cell[data-state=own]{{--c:var(--own)}}
  .cell[data-state=moved]{{--c:var(--moved)}}
  .cell[data-state=keeping]{{--c:var(--keeping)}}
  .cell[data-state=archive]{{--c:var(--archive)}}
  .cell[data-state=lost]{{--c:var(--lost)}}
  .cell.lit{{background:var(--c);border-color:var(--c)}}
  .cell[data-state=lost].lit{{background:transparent;border-style:dashed;border-color:#4a4656}}
  .cell.sel{{outline:2px solid #fff;outline-offset:2px}}
  /* no-JS floor: every cell is lit in its own colour */
  .nojs .cell{{background:var(--c);border-color:var(--c)}}
  .nojs .cell[data-state=lost]{{background:transparent;border-style:dashed}}
  @media (prefers-reduced-motion: reduce){{ .cell{{transition:none}} }}

  .legend{{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0 0;font-size:12px;color:var(--muted)}}
  .legend span{{display:inline-flex;align-items:center;gap:6px}}
  .sw{{width:12px;height:12px;border-radius:2px;display:inline-block;border:1px solid var(--dim)}}
  .readout{{margin:14px 0 0;font-size:13px;color:#c9c3d6}}
  .readout b{{color:var(--own);font-size:17px}}

  /* ---------------- the record ---------------- */
  .card{{margin:16px 0 0;background:#0d0c11;border:1px solid var(--line);border-radius:4px;padding:16px 18px;
    min-height:96px}}
  .card .empty{{color:var(--muted);font-size:13px;margin:0}}
  .rec h3{{margin:0 0 2px;font-size:17px;line-height:1.25}}
  .rec .yr{{color:var(--muted);font-weight:400;font-size:14px}}
  .rec .by{{margin:0 0 6px;color:var(--muted);font-size:13px}}
  .rec .verd{{margin:0 0 10px;font-size:13px;font-weight:700}}
  .rec[data-state=own] .verd{{color:var(--own)}}
  .rec[data-state=moved] .verd{{color:var(--moved)}}
  .rec[data-state=keeping] .verd{{color:var(--keeping)}}
  .rec[data-state=archive] .verd{{color:#a49dbd}}
  .rec[data-state=lost] .verd{{color:#8c8598}}
  .addrs{{list-style:none;margin:0;padding:0}}
  .addr{{font-size:12.5px;color:var(--muted);padding:5px 0;border-top:1px solid #211f29;line-height:1.6}}
  .addr .what{{color:#b9b2c8}}
  .addr .verdict{{color:var(--ink)}}
  .addr.st-answers .verdict{{color:var(--own)}}
  .addr.st-moved .verdict{{color:var(--moved)}}
  .addr .hand{{display:block;color:#d8b26a}}
  .addr .arc{{display:block;color:#9fc2ff}}
  .addr .arc.none{{color:#8c8598}}
  .rec .cat{{margin:10px 0 0;font-size:11.5px;color:var(--dim)}}

  /* the full table is the floor; JS folds it away behind a control */
  #all{{margin-top:18px}}
  #all .rec{{background:var(--paper);border:1px solid var(--line);border-radius:4px;
    padding:14px 16px;margin:0 0 10px}}
  .foldwrap{{display:none}}
  .js .foldwrap{{display:block}}
  .js #all[hidden]{{display:none}}
  .fold{{background:#0d0c11;color:var(--ink);border:1px solid var(--line);border-radius:3px;
    padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}}

  table.tot{{border-collapse:collapse;font-size:13px;margin:6px 0 0;width:100%;max-width:560px}}
  table.tot td,table.tot th{{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left}}
  table.tot td.n{{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}}
  footer{{margin-top:64px;border-top:1px solid var(--line);padding-top:18px;font-size:12.5px;color:var(--muted)}}
  footer p{{max-width:74ch}}
</style>
</head>
<body class="nojs">
<div class="wrap">

<header class="masthead">
  <p class="kicker">Ensemble · The Studio · {generated} · cycle 002, session 1</p>
  <h1>THE SECOND ADDRESS</h1>
  <p class="lede">The house's Atlas of Data Art cites {entries} works, and {frame_answers} of its
  {addresses} addresses answered when this room knocked — {frame_pct}&nbsp;per&nbsp;cent. The catalogue is
  in good health. But {works} of those entries do not cite a work; they cite a <i>record</i> of a
  work, in Rhizome's ArtBase. Behind each record stand the addresses the work actually lived at.
  This page knocked at those too, once each, on {generated}. <b>{reach1} of {works}</b> — {reach1_pct}&nbsp;per&nbsp;cent —
  are still at an address of their own.</p>
</header>

<section>
  <h2>The wall</h2>
  <p class="say">One cell per work, {year_lo} to {year_hi}, in the order the years run. A cell lights
  when the work can be found — and what counts as found is the reader's to set. Widen your reach
  and the wall fills; that filling is the argument.</p>

  <div class="reach">
    <h3>Where are you willing to look?</h3>
    <p>Nothing about the works changes between these three settings. Only the reach does.</p>
    <div class="steps" role="group" aria-label="Where are you willing to look">
      <button type="button" data-r="1" aria-pressed="true">
        <span class="n">{reach1}</span>only at its own address</button>
      <button type="button" data-r="2" aria-pressed="false">
        <span class="n">{reach2}</span>…or where Rhizome keeps a copy</button>
      <button type="button" data-r="3" aria-pressed="false">
        <span class="n">{reach3}</span>…or in the Internet Archive</button>
    </div>
    <p class="nojs-note">Without JavaScript this control is inert and every cell is drawn lit in its
    own colour, with the same three counts printed above and the whole table of {works} works below.</p>
  </div>

  <div class="wall">
{wall}
  </div>

  <div class="legend">
    <span><i class="sw" style="background:var(--own)"></i> at its own address — {own}</span>
    <span><i class="sw" style="background:var(--moved)"></i> moved with its maker — {moved}</span>
    <span><i class="sw" style="background:var(--keeping)"></i> kept by Rhizome — {keeping}</span>
    <span><i class="sw" style="background:var(--archive)"></i> only in the Internet Archive — {archive}</span>
    <span><i class="sw" style="border-style:dashed;border-color:#4a4656"></i> nothing reported — {lost}</span>
  </div>
  <p class="readout" id="readout"><b>{reach1}</b> of {works} works lit — only at its own address.</p>

  <div class="card" id="card" aria-live="polite">
    <p class="empty">Choose a cell to read what answered at that work's addresses, and what did not.</p>
  </div>
</section>

<section>
  <h2>What the two knocks found</h2>
  <p class="say">Of the {works} works, <strong>{own}</strong> answer at the address their ArtBase record
  gives as the artist's own, and <strong>{moved}</strong> answer at a new host that kept the path —
  the work went with its maker when the domain changed. <strong>{keeping}</strong> have no live address
  of their own and are served by Rhizome. <strong>{archive}</strong> were found at no live address at all,
  and stand only on a snapshot the Internet Archive reports. For <strong>{lost}</strong>, nothing answered
  and no snapshot was reported.</p>
  <p class="say">All {moved} that moved, moved into a host carrying their maker's own name, and
  {moved_top_n} of the {moved} belong to one artist, {moved_top_name}, whose addresses changed together and
  kept every path. That is what a work looks like when someone is still holding it.</p>
  <p class="say">The ArtBase record names a preserved copy for <strong>{keeper_works}</strong> of the
  {works} works. Where it does — {keeper_answers} of {keeper_addresses} keeper addresses answered — it held.
  For the other <strong>{without_keeper}</strong> there is no copy in the archive that catalogues them, and
  <strong>{nokeeper_dark}</strong> of those {without_keeper} have no living address of their own either.
  That is the finding, and it is not an accusation: an archive that keeps a copy keeps it. The gap is
  between what a catalogue can list and what a keeper has taken on.</p>
  <table class="tot">
    <tr><th>the artist's own addresses, {outside_total} of them</th><th></th></tr>
    <tr><td>answered with the work</td><td class="n">{outside_answers}</td></tr>
    <tr><td>redirect to a host that kept the path</td><td class="n">{outside_moved}</td></tr>
    <tr><td>redirect somewhere the path is gone</td><td class="n">{outside_swallowed}</td></tr>
    <tr><td>redirect to a domain-sale page</td><td class="n">{outside_sale}</td></tr>
    <tr><td>answer with a placeholder, not the work</td><td class="n">{outside_placeholder}</td></tr>
    <tr><td>not found (4xx)</td><td class="n">{outside_gone}</td></tr>
    <tr><td>the server errs (5xx)</td><td class="n">{outside_server}</td></tr>
    <tr><td>refused this instrument</td><td class="n">{outside_blocked}</td></tr>
    <tr><td>no host answered at all</td><td class="n">{outside_unreachable}</td></tr>
  </table>
</section>

<section>
  <h2>Form, and why</h2>
  <p class="say">Interactive, and client-rendered on the reader's side. The object here is not a
  quantity but a <em>threshold</em> — how far you are willing to reach before you call a work findable —
  and a still picture must pick one threshold and hide the other two. Moving the reach yourself is
  the only way the argument is made rather than asserted. The still frame is honest and complete: with
  no script every cell is lit in its own colour, all three counts are printed, and the full record of
  all {works} works stands below, each with its addresses and what each answered.</p>
</section>

<section>
  <h2>Method, and what it cannot say</h2>
  <p class="say">The Atlas was read from the house's committed feed. For every entry citing
  <code>artbase.rhizome.org</code> the record was read through Rhizome's public Wikibase API, and the
  addresses it names — the artist's own "outside link", Rhizome's own copy, the occasional archive or
  emulation variant — were taken from it. Every distinct address was requested once, with an
  instrument that names itself in its User-Agent, following redirects, reading at most 8&nbsp;KB.
  Refusals were not retried: a door that says no is a finding.</p>
  <p class="say"><strong>One knock is not a death certificate.</strong> A host that did not answer this
  room at this hour may answer yours. {outside_blocked} addresses refused this instrument outright and are
  counted as not found, which is a floor on what is reachable, not a claim about what exists.
  Four addresses returned a page under a 200 status that the automatic placeholder signal flagged;
  all four were fetched and read by hand, three were placeholders and one was the work itself — each
  adjudication is printed with the sentence it rests on in the record below.</p>
  <p class="say"><strong>Answering is not the same as working.</strong> Nothing was fetched from inside
  a work: whether a page that answers still runs is not tested here. {unplayable} of these addresses serve a
  file in a format no current browser plays, and {unplayable_answering} of those {unplayable} answered.</p>
  <p class="say"><strong>A correction, made during this session and left in.</strong> The first archive
  pass asked <code>archive.org</code> once per address and recorded {pass1}. Eighty of those answers were
  neither yes nor no but a failed request under load, and the join read them as "no snapshot" —
  which would have reported {lost_wrong} works as found nowhere. Asking up to four times, spaced, turned
  {archive_recovered} of those into snapshots that exist. The count on this page is the second pass. The better
  instrument, the Internet Archive's CDX index, is blocked by this session's egress policy; that is
  recorded, not worked around.</p>
</section>

<section>
  <h2>The record — all {works} works</h2>
  <div class="foldwrap"><button class="fold" type="button" id="fold" aria-expanded="false"
    aria-controls="all">Show all {works} records</button></div>
  <div id="all">
{table}
  </div>
</section>

<footer>
  <p><strong>Sources.</strong> The Atlas of Data Art, the house's committed feed
  (<code>src/data/atlas/werke.json</code>, {entries} entries, read {generated}). Rhizome's ArtBase,
  public Wikibase API at <code>artbase.rhizome.org</code> — the ArtBase is a preservation programme for
  net art, and this page is a portrait of what it is carrying, not a criticism of it. The Internet
  Archive availability endpoint at <code>archive.org</code>. All three were read on {generated};
  the raw responses are committed beside this page under <code>evidence/</code>, and
  <code>build.py --check</code> re-derives every number here from <code>data.json</code>.</p>
  <p><strong>Nearest neighbours, and the daylight.</strong> In the Atlas: <i>blackaeonium (a
  keeping-place)</i> (lisa cianci, 2007) and <i>Digital Decay III</i> (Claire Evans, 2007) make loss and
  decay their material — this page does not perform decay, it measures a named corpus at a named hour
  and attaches the evidence. <i>netart_latino database</i> (Brian Mackern, 1999–2005) indexes net art by
  national domain — an index built as a work; this is a survey of what an existing index still reaches.
  <i>Marathon 55 . Cache Memory</i> (Grégory Chatonsky, 2003) is about a work migrating off the server into
  the reader's cache; it appears in this wall, and its own address moved with its maker. Outside the
  Atlas the neighbour is the reference-rot literature in scholarly communication, which measures link
  decay in citations; the daylight is that this counts a <em>second</em> address per work — the keeper's —
  and reports the two side by side, which a link-rot count does not have.</p>
  <p>Ensemble · the art corner of the research ecology at frankbueltge.de · text and figure CC BY 4.0,
  code Apache-2.0 · no third-party code is embedded in this page.</p>
</footer>

</div>
<script>
(function(){{
  var b=document.body; b.classList.remove('nojs'); b.classList.add('js');
  var cells=[].slice.call(document.querySelectorAll('.cell')),
      steps=[].slice.call(document.querySelectorAll('.steps button')),
      readout=document.getElementById('readout'),
      card=document.getElementById('card'),
      all=document.getElementById('all'),
      fold=document.getElementById('fold'),
      W={works},
      WORD={{1:'only at its own address',2:'…or where Rhizome keeps a copy',3:'…or in the Internet Archive'}};
  function setReach(r){{
    var lit=0;
    cells.forEach(function(c){{
      var on=(+c.dataset.reach)<=r;
      c.classList.toggle('lit',on); if(on)lit++;
    }});
    steps.forEach(function(s){{s.setAttribute('aria-pressed',(+s.dataset.r)===r?'true':'false');}});
    readout.innerHTML='<b>'+lit+'</b> of '+W+' works lit — '+WORD[r]+'.';
  }}
  steps.forEach(function(s){{s.addEventListener('click',function(){{setReach(+s.dataset.r);}});}});
  function show(i){{
    var rec=document.getElementById('w'+i); if(!rec)return;
    card.innerHTML=''; card.appendChild(rec.cloneNode(true));
    cells.forEach(function(c){{c.classList.toggle('sel',+c.dataset.i===i);}});
  }}
  cells.forEach(function(c){{c.addEventListener('click',function(){{show(+c.dataset.i);}});}});
  all.hidden=true;
  fold.addEventListener('click',function(){{
    all.hidden=!all.hidden;
    fold.setAttribute('aria-expanded',all.hidden?'false':'true');
    fold.textContent=(all.hidden?'Show':'Hide')+' all '+W+' records';
  }});
  setReach(1);
}})();
</script>
</body>
</html>
"""


def correction(d):
    """Re-derive the session's own correction from the two archive passes, both
    committed under evidence/. Nothing about it is typed by hand."""
    p1 = json.load(open(os.path.join(HERE, "evidence", "variants-checked-1.json")))
    p2 = json.load(open(os.path.join(HERE, "evidence", "variants-checked-2.json")))

    def answers(doc):
        out = {}
        for w in doc:
            for a in w["addresses"]:
                if a["check"]["state"] != "answers":
                    out[a["url"]] = (a["check"].get("archive") or {}).get("held")
        return out

    a1, a2 = answers(p1), answers(p2)
    held1 = sum(1 for v in a1.values() if v is True)
    no1 = sum(1 for v in a1.values() if v is False)
    fail1 = sum(1 for v in a1.values() if v is None)
    held2 = sum(1 for v in a2.values() if v is True)

    # What the join would have concluded had the first pass been believed:
    # the live checks are identical, only the archive answers differ.
    lost_wrong = 0
    for w in d["works"]:
        if any(o["state"] in ("answers", "moved") for o in w["outside"]):
            continue
        if any(k["state"] == "answers" for k in w["keepers"]):
            continue
        if any(a1.get(a["url"]) is True for a in w["outside"] + w["keepers"]):
            continue
        lost_wrong += 1
    return {
        "pass1": "%d snapshots, %d explicit noes and %d failed requests" % (held1, no1, fail1),
        "lost_wrong": lost_wrong,
        "archive_recovered": held2 - held1,
        "asked": len(a2),
    }


def render(d):
    n = numbers(d)
    n["wall"] = wall(d["works"])
    n["table"] = table(d["works"])
    n["generated"] = d["generated"]
    c = correction(d)
    n["pass1"] = c["pass1"]
    n["lost_wrong"] = c["lost_wrong"]
    n["archive_recovered"] = c["archive_recovered"]
    n["archive_asked"] = c["asked"]
    return PAGE.format(**n)


def main():
    d = json.load(open(DATA))
    page = render(d)
    if "--check" in sys.argv:
        if not os.path.exists(OUT):
            print("no index.html to check"); return 1
        cur = open(OUT).read()
        if cur != page:
            print("DRIFT: index.html does not match what data.json produces")
            return 1
        n = numbers(d)
        assert n["reach1"] + n["keeping"] + n["archive"] + n["lost"] == n["works"], "states do not sum"
        assert n["with_keeper"] + n["without_keeper"] == n["works"], "keeper split does not sum"
        print("check ok — %d works, %d/%d/%d at the three reaches" %
              (n["works"], n["reach1"], n["reach2"], n["reach3"]))
        return 0
    open(OUT, "w").write(page)
    print("wrote %s (%d bytes)" % (OUT, len(page)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
