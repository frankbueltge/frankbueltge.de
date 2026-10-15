#!/usr/bin/env python3
"""Build the Atelier's presentation of cycle 001.

Reads only committed records already in this repository — the four session
windows of cycle 001 — and writes two things beside this file:

    data.json   the presentation's own derived record (every number on the page)
    index.html  one self-contained page: complete without JavaScript, enhanced
                with it

No network, no dependency. Run from the repository root:

    python3 presentations/cycle-001/build.py

`check.py` beside this file re-derives every number independently and compares.
"""

from __future__ import annotations

import datetime as dt
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).resolve().parent

SRC = {
    "s1": "window/cycle-001/data.json",
    "s2": "window/cycle-001-session-2/data.json",
    "s3": "window/cycle-001-session-3/data.json",
    "s4": "window/cycle-001-session-4/data.json",
}

BUILT = "2026-09-03"
PRIMARY_RUN = "df-global"


def load(key: str) -> dict:
    return json.loads((ROOT / SRC[key]).read_text(encoding="utf-8"))


# ---------------------------------------------------------------- derivation


def derive() -> dict:
    s1, s2, s3, s4 = load("s1"), load("s2"), load("s3"), load("s4")

    # -- movement I: the clause -------------------------------------------
    nightly = s2["made_things"]["error-as-method"]
    eras = s2["nightly_eras"]
    corpora = s2["two_corpora"]
    logs = s2["session_logs"]

    works = []
    for slug, deg in sorted(nightly["degree"].items()):
        works.append(
            {
                "slug": slug,
                "date": deg["date"],
                "out": deg["out"],
                "in": deg["in"],
                "era": "before" if deg["date"] < eras["cut"] else "after",
            }
        )
    edges = [
        {"from": a, "to": b, "n": n, "era": "before" if a < eras["cut"] else "after"}
        for a, b, n, _cls in nightly["backward_edges"]
    ]

    clause = {
        "cut": eras["cut"],
        "works_total": nightly["units"]["total"],
        "edges_total": nightly["edges"]["total"],
        "with_edge": nightly["reach"]["units_with_at_least_one_edge"],
        "orphans": nightly["reach"]["orphan_count"],
        "before": eras["before"],
        "after": eras["after"],
        "truncated_shared_works": corpora["shared_works"],
        "truncated_with_edge": corpora["with_edge_in_truncated_copy"],
        "truncated_work_to_work_edges": len(corpora["work_to_work_edges_in_truncated_copy"]),
        "continued_work_to_work_edges": corpora["work_to_work_edges_in_continued_line"],
        "s1_units": s1["all_edges"]["units"]["total"],
        "s1_edges": s1["all_edges"]["edges"]["total"],
        "s1_prose_edges": s1["prose_edges_only"]["edges"]["total"],
        "handles": {
            k: {
                "slug_chars_mean": v["slug_chars_mean"],
                "notes": v["notes"],
                "named_outside_the_log": v["named_outside_the_log"],
            }
            for k, v in logs.items()
            if not k.startswith("_")
        },
        "works": works,
        "edges": edges,
    }

    # -- movement II: the threshold ---------------------------------------
    run = s3["runs"][PRIMARY_RUN]
    lanes = []
    for det in s3["detectors"]:
        d = run["detectors"][det["key"]]
        nulls = d["null_all_log10p"]
        lanes.append(
            {
                "key": det["key"],
                "name": det["name"],
                "repo": det["repo"],
                "units": det["units"],
                "active_days": det["active_days"],
                "analytic": d["analytic_cut_log10p"],
                "empirical": d["empirical_cut_log10p"],
                "events_over_analytic": d["events_over_analytic_cut"],
                "events": [
                    {
                        "log10p": e["log10p"],
                        "day_first": e["day_first"],
                        "day_last": e["day_last"],
                        "dt": e["dt"],
                        "df": e["df"],
                        "terms": [t["term"] for t in e["top_terms"][:5]],
                    }
                    for e in d["events"]
                ],
                "n_events": d["n_events"],
                "null": nulls,
                "null_loudest": min(nulls),
                "null_quietest": max(nulls),
                # how far the measured cut sits past the assumed one, in orders
                # of magnitude of p; positive = the formula was too permissive
                "offset": round(d["analytic_cut_log10p"] - d["empirical_cut_log10p"], 1),
                "null_louder_than_analytic": sum(1 for x in nulls if x < d["analytic_cut_log10p"]),
            }
        )
    threshold = {
        "source": s3["source"],
        "perms": s3["params"]["perms"],
        "seed": s3["params"]["seed"],
        "run": PRIMARY_RUN,
        "events_at_analytic_cut": s3["totals"]["chi2_events_primary"],
        "events_surviving": s3["totals"]["surviving_events_primary"],
        "tiles_total": s3["tiles_total"],
        "units_total": s3["units_total"],
        "lanes": lanes,
        "null_total": sum(len(l["null"]) for l in lanes),
        "null_louder_than_analytic_total": sum(l["null_louder_than_analytic"] for l in lanes),
    }

    # -- movement III: the list -------------------------------------------
    hosts = []
    for h in s4["hosts"]:
        hosts.append(
            {
                "id": h["id"],
                "name": h["name"],
                "stratum": h["stratum"],
                "structure": h["structure"],
                "permits": h["permits_instrument"],
                "n_named": h["n_named"],
            }
        )
    determined = [h for h in hosts if h["permits"] is not None]
    listed = {
        "n_hosts": len(hosts),
        "n_determined": len(determined),
        "n_undetermined": len(hosts) - len(determined),
        "n_no_rules_file": sum(1 for h in hosts if h["structure"] == "UNDETERMINED"),
        "n_html_in_place": sum(1 for h in hosts if h["structure"] == "HTML-IN-PLACE-OF-RULES"),
        "n_permit": sum(1 for h in hosts if h["permits"] is True),
        "n_refuse": sum(1 for h in hosts if h["permits"] is False),
        "n_open": sum(1 for h in hosts if h["structure"] == "OPEN"),
        "n_blocklist": sum(1 for h in hosts if h["structure"] == "BLOCKLIST"),
        "n_allowlist": sum(1 for h in hosts if h["structure"] == "ALLOWLIST"),
        "named_refused_total": sum(h["n_named"] for h in hosts if h["structure"] == "BLOCKLIST"),
        "named_admitted_total": sum(h["n_named"] for h in hosts if h["structure"] == "ALLOWLIST"),
        "refusing_host": s4["refusing_host"],
        "ua": s4["ua"],
        "knock_utc": s4["knock_utc"],
        "arrived": len(s4["arrivals"]),
        "words_min": min(a["words"] for a in s4["arrivals"]),
        "words_max": max(a["words"] for a in s4["arrivals"]),
        # the correction of 2026-09-03: nothing arrived from the refusing host at all.
        # Its five expositions were skipped because its rule said so; the four pages
        # fetched before their rules file was read belong to the abstract host, which
        # permits.
        "arrived_from_refusing_host": sum(
            1 for a in s4["arrivals"] if "researchcatalogue.net" in a["url"]
        ),
        "arrived_from_abstract_host": sum(1 for a in s4["arrivals"] if "jar-online.net" in a["url"]),
        "skipped_by_rule": s4["n_skipped_by_robots"],
        "hosts": hosts,
    }

    return {
        "built": BUILT,
        "practice": "The Atelier",
        "cycle": 1,
        "question": "How can AI and automation meaningfully support artistic research?",
        "sources": SRC,
        "clause": clause,
        "threshold": threshold,
        "list": listed,
    }


# ------------------------------------------------------------------ drawing

W = 900


def esc(s) -> str:
    return html.escape(str(s), quote=True)


def fig_clause(c: dict) -> str:
    """62 works of the nightly line on a date axis; 39 references as arcs."""
    h, ml, mr, mt, mb = 330, 46, 46, 18, 56
    base = h - mb
    days = sorted({w["date"] for w in c["works"]})
    d0 = dt.date.fromisoformat(days[0])
    d1 = dt.date.fromisoformat(days[-1])
    span = (d1 - d0).days or 1

    def x(day: str) -> float:
        return ml + (dt.date.fromisoformat(day) - d0).days / span * (W - ml - mr)

    pos = {w["slug"]: x(w["date"]) for w in c["works"]}
    out = [
        f'<svg class="fig" viewBox="0 0 {W} {h}" role="img" '
        f'aria-labelledby="f1t f1d" preserveAspectRatio="xMidYMid meet">',
        '<title id="f1t">The nightly line: 62 works on a date axis, 39 references drawn as arcs</title>',
        '<desc id="f1d">Before the clause of 2026-08-10, 30 works carry 2 references between them. '
        'After it, 32 works carry 37. The full table is printed below the figure.</desc>',
    ]
    # era grounds
    xc = x(c["cut"])
    out.append(f'<rect class="era-before" x="{ml:.1f}" y="{mt}" width="{xc-ml:.1f}" height="{base-mt:.1f}"/>')
    out.append(f'<rect class="era-after" x="{xc:.1f}" y="{mt}" width="{W-mr-xc:.1f}" height="{base-mt:.1f}"/>')
    # arcs
    for e in c["edges"]:
        x1, x2 = pos[e["from"]], pos[e["to"]]
        lift = min(150, 26 + abs(x1 - x2) * 0.55)
        cx = (x1 + x2) / 2
        out.append(
            f'<path class="edge edge-{e["era"]}" data-from="{esc(e["from"])}" data-to="{esc(e["to"])}" '
            f'd="M{x1:.1f},{base:.1f} Q{cx:.1f},{base-lift:.1f} {x2:.1f},{base:.1f}"/>'
        )
    # baseline + works
    out.append(f'<line class="axis" x1="{ml}" y1="{base}" x2="{W-mr}" y2="{base}"/>')
    for w in c["works"]:
        r = 3 + min(3.0, w["out"] * 0.9)
        out.append(
            f'<circle class="work work-{w["era"]}{" orphan" if w["out"]+w["in"]==0 else ""}" '
            f'cx="{pos[w["slug"]]:.1f}" cy="{base}" r="{r:.1f}" '
            f'data-slug="{esc(w["slug"])}" data-date="{esc(w["date"])}" '
            f'data-out="{w["out"]}" data-in="{w["in"]}"><title>{esc(w["slug"])} — '
            f'{w["out"]} out, {w["in"]} in</title></circle>'
        )
    # the cut
    out.append(f'<line class="cut" x1="{xc:.1f}" y1="{mt}" x2="{xc:.1f}" y2="{base+8:.1f}"/>')
    out.append(
        f'<text class="cut-label" x="{xc-6:.1f}" y="{mt+13}" text-anchor="end">the clause · {esc(c["cut"])}</text>'
    )
    # axis labels
    for day in (days[0], c["cut"], days[-1]):
        out.append(f'<text class="tick" x="{x(day):.1f}" y="{base+20}" text-anchor="middle">{esc(day)}</text>')
    b, a = c["before"], c["after"]
    out.append(
        f'<text class="cap" x="{ml}" y="{base+42}">before · {b["works"]} works, '
        f'{b["edges_out"]} references</text>'
    )
    out.append(
        f'<text class="cap" x="{W-mr}" y="{base+42}" text-anchor="end">after · {a["works"]} works, '
        f'{a["edges_out"]} references</text>'
    )
    out.append("</svg>")
    return "\n".join(out)


def fig_threshold(t: dict) -> str:
    """Three records; 200 shuffled maxima each; the assumed cut against the measured one."""
    h, ml, mr, mt = 300, 152, 24, 30
    lo, hi = -160.0, 0.0
    lane_y = [mt + 40, mt + 110, mt + 180]

    def x(v: float) -> float:
        v = max(lo, min(hi, v))
        return ml + (v - lo) / (hi - lo) * (W - ml - mr)

    out = [
        f'<svg class="fig" viewBox="0 0 {W} {h}" role="img" aria-labelledby="f2t f2d" '
        f'preserveAspectRatio="xMidYMid meet">',
        '<title id="f2t">Three records: where noise lands, and where the borrowed formula put the line</title>',
        '<desc id="f2d">For each of three session records, 200 shuffled copies of the same material '
        'are searched and their loudest event marked. The assumed threshold and the measured one are '
        'drawn as vertical lines; the numbers are printed in the table below.</desc>',
    ]
    for i, lane in enumerate(t["lanes"]):
        y = lane_y[i]
        out.append(f'<text class="lane" x="{ml-10}" y="{y+4}" text-anchor="end">{esc(lane["name"])}</text>')
        out.append(f'<line class="lane-rule" x1="{ml}" y1="{y}" x2="{W-mr}" y2="{y}"/>')
        for v in lane["null"]:
            out.append(f'<line class="null" x1="{x(v):.1f}" y1="{y-11}" x2="{x(v):.1f}" y2="{y+11}"/>')
        xa, xe = x(lane["analytic"]), x(lane["empirical"])
        out.append(f'<line class="assumed" x1="{xa:.1f}" y1="{y-19}" x2="{xa:.1f}" y2="{y+19}"/>')
        out.append(f'<line class="measured" x1="{xe:.1f}" y1="{y-19}" x2="{xe:.1f}" y2="{y+19}"/>')
        for e in lane["events"]:
            out.append(f'<circle class="event" cx="{x(e["log10p"]):.1f}" cy="{y}" r="4.5"><title>'
                       f'{esc(e["day_first"])}–{esc(e["day_last"])}, log10 p {e["log10p"]}</title></circle>')
        off = lane["offset"]
        # off > 0: the measured cut is louder than the assumed one, so the formula
        # let noise through; off < 0: the formula was stricter than the shuffles ask
        word = "too permissive" if off > 0 else "too strict"
        out.append(
            f'<text class="lane-note" x="{W-mr}" y="{y-24}" text-anchor="end">'
            f'the formula was {abs(off)} orders {esc(word)}</text>'
        )
    out.append(f'<line class="axis" x1="{ml}" y1="{h-30}" x2="{W-mr}" y2="{h-30}"/>')
    for v in (-160, -120, -80, -40, 0):
        out.append(f'<text class="tick" x="{x(v):.1f}" y="{h-14}" text-anchor="middle">{v}</text>')
    out.append(f'<text class="tick" x="{ml}" y="{mt-8}">louder ←</text>')
    out.append(f'<text class="tick" x="{W-mr}" y="{mt-8}" text-anchor="end">→ quieter (log₁₀ p)</text>')
    out.append(
        f'<g id="cutline" class="cutline" transform="translate({x(-67.246):.1f},0)" hidden>'
        f'<line x1="0" y1="{mt}" x2="0" y2="{h-34}"/></g>'
    )
    out.append("</svg>")
    return "\n".join(out)


def fig_list(l: dict) -> str:
    """19 hosts, one row each: what each declares to a machine, and to how many named ones."""
    rowh, ml, mr, top = 21, 252, 20, 34
    order = ["artistic-research", "open-access", "commercial", "house"]
    rows = [h for s in order for h in l["hosts"] if h["stratum"] == s]
    h = top + len(rows) * rowh + 72
    track = W - ml - mr
    out = [
        f'<svg class="fig" viewBox="0 0 {W} {h}" role="img" aria-labelledby="f3t f3d" '
        f'preserveAspectRatio="xMidYMid meet">',
        '<title id="f3t">Nineteen hosts: what each declares to an honestly identified research instrument</title>',
        '<desc id="f3d">One row per host. Each mark is one agent named in the host\'s rules file. '
        'Five rows name agents to refuse; one row names agents to admit and refuses everyone else. '
        'The table below prints every row.</desc>',
    ]
    for i, hst in enumerate(rows):
        y = top + i * rowh
        cls = {
            "OPEN": "row-open",
            "BLOCKLIST": "row-block",
            "ALLOWLIST": "row-allow",
        }.get(hst["structure"], "row-undet")
        out.append(
            f'<g class="hostrow {cls}" data-id="{esc(hst["id"])}" data-name="{esc(hst["name"])}" '
            f'data-structure="{esc(hst["structure"])}" data-named="{hst["n_named"]}" '
            f'data-permits="{"yes" if hst["permits"] else ("no" if hst["permits"] is False else "undetermined")}" '
            f'tabindex="0" role="listitem">'
        )
        out.append(f'<rect class="track" x="{ml}" y="{y}" width="{track}" height="{rowh-5}"/>')
        out.append(f'<text class="host" x="{ml-10}" y="{y+11}" text-anchor="end">{esc(hst["name"])}</text>')
        if hst["n_named"]:
            for k in range(hst["n_named"]):
                out.append(
                    f'<rect class="named" x="{ml+6+k*11:.1f}" y="{y+4}" width="8" height="{rowh-13}"/>'
                )
            label = "named to be refused" if hst["structure"] == "BLOCKLIST" else "named to be admitted, all others refused"
            out.append(
                f'<text class="rowcap" x="{ml+6+hst["n_named"]*11+8:.1f}" y="{y+11}">'
                f'{hst["n_named"]} {label}</text>'
            )
        else:
            word = {"OPEN": "no agent named — open to anyone who asks honestly",
                    "UNDETERMINED": "no readable rules file",
                    "HTML-IN-PLACE-OF-RULES": "a web page served where the rules file should be"}[hst["structure"]]
            out.append(f'<text class="rowcap" x="{ml+8}" y="{y+11}">{esc(word)}</text>')
        out.append(f'<title>{esc(hst["name"])} — {esc(hst["structure"])}</title></g>')
    y = top + len(rows) * rowh + 16
    out.append(
        f'<text class="cap" x="24" y="{y}">{l["n_permit"]} of {l["n_determined"]} determined hosts permit an '
        f'honestly identified research instrument.</text>'
    )
    out.append(
        f'<text class="cap" x="24" y="{y+18}">{l["named_refused_total"]} agents named to be refused across '
        f'{l["n_blocklist"]} blocklists · {l["named_admitted_total"]} named to be admitted at the one '
        f'allowlist.</text>'
    )
    out.append("</svg>")
    return "\n".join(out)


# -------------------------------------------------------------------- page

CSS = """
:root{
  --bg:#fbfaf7; --ink:#16150f; --dim:#5d5a4e; --rule:#d8d3c4; --panel:#f2efe6;
  --before:#efe6d2; --after:#e2ecec; --edge:#8c7a4b; --edge2:#2f6f76;
  --refuse:#a8452c; --admit:#2f6f76; --closed:#2b2924; --accent:#7a4a1f;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#14140f; --ink:#eeead9; --dim:#a09b88; --rule:#39362c; --panel:#1d1c15;
    --before:#2a2519; --after:#17282a; --edge:#c2a85f; --edge2:#66b3ba;
    --refuse:#e08165; --admit:#66b3ba; --closed:#e8e3d2; --accent:#d7a86a;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;}
main{max-width:960px;margin:0 auto;padding:2.4rem 1.2rem 5rem}
h1{font-size:1.85rem;line-height:1.15;margin:.2rem 0 .4rem;letter-spacing:.01em}
h2{font-size:1.12rem;margin:3rem 0 .3rem;letter-spacing:.06em;text-transform:uppercase;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim)}
h3{font-size:1.05rem;margin:1.6rem 0 .3rem}
p{margin:.65rem 0}
a{color:inherit;text-decoration-color:var(--rule);text-underline-offset:2px}
.kicker,.meta{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;
  letter-spacing:.09em;text-transform:uppercase;color:var(--dim)}
.standfirst{font-size:1.12rem;max-width:66ch}
.lede{border-left:3px solid var(--accent);padding-left:.9rem;margin:1.4rem 0}
figure{margin:1.4rem 0 0}
.fig{width:100%;height:auto;display:block;background:var(--panel);border:1px solid var(--rule)}
figcaption{font-size:.9rem;color:var(--dim);margin-top:.5rem;max-width:70ch}
.controls{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center;margin:.7rem 0 0}
.controls[hidden]{display:none}
button{font:inherit;font-size:.85rem;padding:.22rem .7rem;background:transparent;
  color:var(--ink);border:1px solid var(--rule);border-radius:2px;cursor:pointer}
button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
input[type=range]{flex:1 1 220px;min-width:180px;accent-color:var(--accent)}
.readout{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;
  color:var(--dim);margin-top:.45rem;min-height:1.3em}
table{border-collapse:collapse;width:100%;font-size:.83rem;margin:.6rem 0}
th,td{text-align:left;padding:.24rem .5rem .24rem 0;border-bottom:1px solid var(--rule);
  vertical-align:top}
th{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:400;color:var(--dim);
  font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}
details{margin:.8rem 0;border-top:1px solid var(--rule);padding-top:.5rem}
summary{cursor:pointer;font-size:.85rem;color:var(--dim)}
code,.num{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.num{font-size:1.02em}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem;margin:1.2rem 0}
.card{border:1px solid var(--rule);padding:.8rem .9rem;background:var(--panel)}
.card .big{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.5rem;display:block}
hr{border:0;border-top:1px solid var(--rule);margin:2.6rem 0}
footer{margin-top:3rem;font-size:.85rem;color:var(--dim)}
/* figure 1 */
.era-before{fill:var(--before)}.era-after{fill:var(--after)}
.edge{fill:none;stroke:var(--edge);stroke-width:1.1;opacity:.55}
.edge-after{stroke:var(--edge2)}
.edge.mute{opacity:.06}
.edge.hot{opacity:1;stroke-width:2.2}
.work{fill:var(--ink);stroke:var(--panel);stroke-width:.8}
.work.orphan{fill:none;stroke:var(--dim);stroke-width:1}
.axis,.lane-rule{stroke:var(--rule);stroke-width:1}
.cut{stroke:var(--accent);stroke-width:1.4;stroke-dasharray:4 3}
.cut-label,.cap,.tick,.lane,.lane-note,.host,.rowcap{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;fill:var(--dim);font-size:11px}
.cut-label{fill:var(--accent)}
.cap{font-size:12px;fill:var(--ink)}
/* figure 2 */
.null{stroke:var(--dim);stroke-width:1;opacity:.30}
.assumed{stroke:var(--refuse);stroke-width:2}
.measured{stroke:var(--admit);stroke-width:2;stroke-dasharray:3 3}
.event{fill:var(--accent)}
.lane{fill:var(--ink);font-size:12px}
.cutline line{stroke:var(--accent);stroke-width:1.4}
/* figure 3 */
.track{fill:none;stroke:var(--rule);stroke-width:1}
.row-allow .track{fill:var(--closed)}
.row-allow .named{fill:var(--admit)}
.row-allow .rowcap{fill:var(--bg)}
.row-block .named{fill:var(--refuse)}
.row-undet .track{stroke-dasharray:3 3}
.hostrow:focus{outline:2px solid var(--accent);outline-offset:1px}
.hostrow.on .track{stroke:var(--accent);stroke-width:2}
@media (prefers-reduced-motion:no-preference){
  .edge{transition:opacity .45s ease,stroke-width .2s ease}
  .work{transition:opacity .45s ease}
  .null{transition:opacity .3s ease}
}
"""

JS = """
(function(){
  var d=JSON.parse(document.getElementById('record').textContent);

  /* ---- figure 1: the two eras, and a readout per work ---- */
  var f1=document.getElementById('fig-clause');
  if(f1){
    var edges=f1.querySelectorAll('.edge'), works=f1.querySelectorAll('.work');
    var out1=document.getElementById('readout-clause');
    var base1=out1.textContent;
    function era(which){
      edges.forEach(function(e){
        var on = which==='both' || e.classList.contains('edge-'+which);
        e.classList.toggle('mute', !on);
      });
      works.forEach(function(w){
        var on = which==='both' || w.classList.contains('work-'+which);
        w.style.opacity = on ? 1 : 0.18;
      });
      var b=d.clause.before, a=d.clause.after;
      out1.textContent = which==='before'
        ? b.works+' works before the clause carry '+b.edges_out+' references between them; '+
          b.with_edge+' of them are named by another work.'
        : which==='after'
        ? a.works+' works after the clause carry '+a.edges_out+' references between them; '+
          a.with_edge+' of them are named by another work.'
        : base1;
      document.querySelectorAll('[data-era]').forEach(function(b2){
        b2.setAttribute('aria-pressed', String(b2.dataset.era===which));
      });
    }
    document.getElementById('controls-clause').hidden=false;
    document.querySelectorAll('[data-era]').forEach(function(b2){
      b2.addEventListener('click',function(){ era(b2.dataset.era); });
    });
    works.forEach(function(w){
      function show(){
        out1.textContent = w.dataset.slug+' · '+w.dataset.date+' · names '+w.dataset.out+
          ', is named by '+w.dataset['in'];
        edges.forEach(function(e){
          e.classList.toggle('hot', e.dataset.from===w.dataset.slug || e.dataset.to===w.dataset.slug);
        });
      }
      w.addEventListener('mouseenter',show);
      w.addEventListener('mouseleave',function(){
        out1.textContent=base1; edges.forEach(function(e){e.classList.remove('hot');});
      });
    });
    era('both');
  }

  /* ---- figure 2: move the cut, count the shuffles that clear it ---- */
  var slider=document.getElementById('cut');
  if(slider){
    var g=document.getElementById('cutline'), out2=document.getElementById('readout-threshold');
    var lanes=d.threshold.lanes, ML=152, MR=24, W=900, LO=-160, HI=0;
    var xs=function(v){ return ML + (Math.max(LO,Math.min(HI,v))-LO)/(HI-LO)*(W-ML-MR); };
    g.hidden=false; slider.parentElement.hidden=false;
    function move(){
      var v=parseFloat(slider.value);
      g.setAttribute('transform','translate('+xs(v).toFixed(1)+',0)');
      var n=0, tot=0;
      lanes.forEach(function(l){ tot+=l.null.length; l.null.forEach(function(x){ if(x<v) n++; }); });
      out2.textContent='cut at log₁₀ p = '+v.toFixed(1)+' — '+n+' of '+tot+
        ' shuffled copies still produce an event louder than it.';
    }
    slider.addEventListener('input',move);
    document.querySelectorAll('[data-cut]').forEach(function(b){
      b.addEventListener('click',function(){ slider.value=b.dataset.cut; move(); });
    });
    move();
  }

  /* ---- figure 3: one row at a time, with its receipt ---- */
  var out3=document.getElementById('readout-list');
  if(out3){
    var base3=out3.textContent;
    document.querySelectorAll('.hostrow').forEach(function(r){
      function show(){
        document.querySelectorAll('.hostrow').forEach(function(o){o.classList.remove('on');});
        r.classList.add('on');
        var n=parseInt(r.dataset.named,10);
        out3.textContent=r.dataset.name+' · '+r.dataset.structure.toLowerCase().replace(/-/g,' ')+
          ' · names '+n+' agent'+(n===1?'':'s')+' · permits this instrument: '+r.dataset.permits;
      }
      r.addEventListener('mouseenter',show); r.addEventListener('focus',show);
      r.addEventListener('mouseleave',function(){ r.classList.remove('on'); out3.textContent=base3; });
    });
  }
})();
"""


def page(d: dict) -> str:
    c, t, l = d["clause"], d["threshold"], d["list"]
    atelier = next(x for x in t["lanes"] if x["key"] == "atelier")
    nightly_lane = next(x for x in t["lanes"] if x["key"] == "nightly")
    remainder = next(x for x in t["lanes"] if x["key"] == "remainder")
    hb, ha = c["handles"]["error-as-method"], c["handles"]["ulysses"]

    work_rows = "\n".join(
        f"<tr><td><code>{esc(w['slug'])}</code></td><td>{esc(w['date'])}</td>"
        f"<td>{w['out']}</td><td>{w['in']}</td><td>{esc(w['era'])}</td></tr>"
        for w in c["works"]
    )
    host_rows = "\n".join(
        f"<tr><td>{esc(h['name'])}</td><td>{esc(h['stratum'])}</td><td>{esc(h['structure'].lower())}</td>"
        f"<td>{h['n_named']}</td>"
        f"<td>{'yes' if h['permits'] else ('no' if h['permits'] is False else 'undetermined')}</td></tr>"
        for h in l["hosts"]
    )
    lane_rows = "\n".join(
        f"<tr><td>{esc(x['name'])}</td><td><code>{esc(x['repo'])}</code></td><td>{x['units']}</td>"
        f"<td>{x['analytic']}</td><td>{x['empirical']}</td><td>{abs(x['offset'])}</td>"
        f"<td>{x['events_over_analytic']}</td><td>{x['n_events']}</td></tr>"
        for x in t["lanes"]
    )

    src = t["source"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The clause, the threshold and the list</title>
<meta name="description" content="The Atelier's presentation of cycle 001: three measurements of what
actually limits machine-supported artistic research, and none of them is capability.">
<style>{CSS}</style>
</head>
<body>
<main>

<p class="kicker">The Atelier · research ecology · cycle 001 · presented {esc(d['built'])}</p>
<h1>The clause, the threshold and the list</h1>
<p class="standfirst">Three measurements of what actually limits machine-supported artistic
research. Each one found a limit. Not one of them was a limit of capability — each was a
sentence somebody had written down, and every one of them can be rewritten for nothing.</p>

<div class="lede">
<p><strong>The question of this cycle</strong> was the standing default: <em>{esc(d['question'])}</em>
Four working sessions answered it by measuring, not by arguing. This page is the fifth session and
the presentation: it re-reads the four committed records and states what they add up to — including
where they correct each other and where one of them was wrong.</p>
</div>

<div class="grid">
  <div class="card"><span class="big">{c['before']['edges_out']} → {c['after']['edges_out']}</span>
  references between works, before and after one clause was added to a practice's constitution —
  same practice, same machine, one sentence.</div>
  <div class="card"><span class="big">{abs(atelier['offset'])}</span>
  orders of magnitude by which a threshold taken from a published formula was too permissive on
  this house's own record. Nothing in the machine flagged it.</div>
  <div class="card"><span class="big">{l['n_permit']} of {l['n_determined']}</span>
  hosts let an honestly identified research instrument read. The one that refuses is the field's
  own address, and it admits {l['named_admitted_total']} agents by name.</div>
</div>

<h2>I · The clause</h2>
<p>A machine practice publishes works nightly. Do the works refer to each other? For its first
{c['before']['works']} works: <span class="num">{c['before']['edges_out']}</span> references
in total. On {esc(c['cut'])} its architect added one condition — a night that cannot say what it
takes up does not build, it reads. For the {c['after']['works']} works after that date:
<span class="num">{c['after']['edges_out']}</span> references, and
{c['after']['with_edge']} of those works are named by another work.</p>

<figure>
<div id="fig-clause">{fig_clause(c)}</div>
<div class="controls" id="controls-clause" role="group" hidden
     aria-label="Which era of the record to show">
  <button type="button" data-era="both" aria-pressed="true">both eras</button>
  <button type="button" data-era="before" aria-pressed="false">before the clause</button>
  <button type="button" data-era="after" aria-pressed="false">after the clause</button>
</div>
<p class="readout" id="readout-clause">{c['works_total']} works, {c['edges_total']} references,
{c['orphans']} works that neither name another nor are named.</p>
<figcaption>Every dot is one published work of the nightly line
(<code>error-as-method</code>), placed on the day it was made; every arc is one work naming
another in its prose. Read from the committed record of session 2,
<code>{esc(d['sources']['s2'])}</code>. Hover or tap a dot for its references.</figcaption>
</figure>

<details>
<summary>The table behind figure I — all {c['works_total']} works</summary>
<table><thead><tr><th>work</th><th>date</th><th>names</th><th>named by</th><th>era</th></tr></thead>
<tbody>{work_rows}</tbody></table>
</details>

<h3>What this is not</h3>
<p>It is not proof that the clause caused the change: the same day carries a fork of the
repository and a restart of the practice, and three corpora are three cases, not a law. It is
also a correction of this practice's own first session, which measured one repository and
announced that made things do not refer to each other. They do — in the corpus where that line
continued, {c['continued_work_to_work_edges']} times. The instrument was right and the corpus was
truncated, and only running it over three records exposed that. What survives is narrower and
harder: <strong>in these records continuity is bought by conventions, not by capability</strong>
— including the plainest one available, a name short enough to write into a sentence. The two
practices whose session notes average {hb['slug_chars_mean']} and 19 characters have
{hb['named_outside_the_log']} of {hb['notes']} and 50 of 50 notes named somewhere else in their
own record; this practice, which titles a note with a whole sentence
({ha['slug_chars_mean']} characters on average), has {ha['named_outside_the_log']} of
{ha['notes']}.</p>

<h2>II · The threshold</h2>
<p>Session 3 went outside the field for a method: the excess-power statistic, built for
gravitational-wave signals no template can describe
(<a href="{esc(src['url'])}" rel="noreferrer">{esc(src['authors'])}, {esc(src['title'])},
{esc(src['journal'])}</a>). Transposed onto the session records of all three practices in this
house, the paper's own analytic threshold returns
<span class="num">{t['events_at_analytic_cut']}</span> events. Then the same search was run
against {t['perms']} shuffled copies of each record — the same words, the same days, the order
destroyed — to ask what noise alone produces. <span class="num">{t['events_surviving']}</span>
events survive that comparison.</p>

<figure>
<div id="fig-threshold">{fig_threshold(t)}</div>
<div class="controls" hidden>
  <label for="cut" class="meta">move the cut</label>
  <input type="range" id="cut" min="-160" max="-1" step="0.5" value="-67.2">
  <button type="button" data-cut="{atelier['analytic']}">the assumed cut</button>
  <button type="button" data-cut="{atelier['empirical']}">the measured cut</button>
</div>
<p class="readout" id="readout-threshold">At the assumed cut,
{t['null_louder_than_analytic_total']} of {t['null_total']} shuffled copies still produce an
event louder than the threshold — every copy of the two records that produced any events at all.
The remaining {t['null_total'] - t['null_louder_than_analytic_total']} are the third record,
where the same formula was too strict instead.</p>
<figcaption>Each faint tick is the loudest event found in one shuffled copy of one record — 200
per lane, {t['null_total']} in all. Solid line: the threshold the published formula supplies.
Dashed line: the threshold the shuffles actually require. Circles: the
{atelier['n_events']} events that survive. Read from
<code>{esc(d['sources']['s3'])}</code>, run <code>{esc(t['run'])}</code>, seed
{t['seed']}.</figcaption>
</figure>

<table><thead><tr><th>record</th><th>repo</th><th>notes</th><th>assumed cut</th>
<th>measured cut</th><th>orders apart</th><th>events at the assumed cut</th>
<th>surviving</th></tr></thead><tbody>{lane_rows}</tbody></table>

<h3>The part that matters, and it is not the number</h3>
<p>The borrowed formula was too permissive by <span class="num">{abs(atelier['offset'])}</span>
orders of magnitude on this practice's record and by
<span class="num">{abs(nightly_lane['offset'])}</span> on the nightly line's — and on the third
record it was too <em>strict</em>, by {abs(remainder['offset'])}. The error is not a constant to
be subtracted; it is set by the material. Nothing in the apparatus announced it. What
announced it was the shuffling, which is a stupid, expensive procedure no person would run by
hand: {t['perms']} re-searches of every record, {t['tiles_total']:,} tiles in all. <strong>That
is the reach this cycle can honestly claim for the machine — the manufacture of the negative
case, the thing a finding has to stand against.</strong> And the boundary beside it: where a
threshold is taken on authority rather than measured, the machine supplies a confident wrong
answer and no warning with it.</p>

<h2>III · The list</h2>
<p>Then the prior question, which turns out to bind before either of those: may a machine read
this field's published work at all? Nineteen hosts — artistic-research venues, the open-access
registers this ecology calls, four commercial publishers, this house — one request each for the
file in which a host declares its rules to machines, sent under an honest agent string that says
who is asking and links its source.</p>

<figure>
<div id="fig-list">{fig_list(l)}</div>
<p class="readout" id="readout-list">{l['n_determined']} of {l['n_hosts']} hosts returned a
readable rules file. {l['n_permit']} of those permit this instrument; {l['n_refuse']} does not.</p>
<figcaption>One row per host, ordered by stratum. Each mark is one agent named by name in that
host's rules. Five rows name agents <em>to refuse</em>; one row — the dark one — names
{l['named_admitted_total']} agents <em>to admit</em> and refuses everyone else. That inversion is
the finding: it is the only row whose marks mean the opposite of every other row's. Read from
<code>{esc(d['sources']['s4'])}</code>, probed {esc(l['knock_utc'])}.</figcaption>
</figure>

<details>
<summary>The table behind figure III — all {l['n_hosts']} hosts</summary>
<table><thead><tr><th>host</th><th>stratum</th><th>rule structure</th><th>agents named</th>
<th>permits this instrument</th></tr></thead><tbody>{host_rows}</tbody></table>
</details>

<p>The one door shut to an unnamed instrument in this cohort is the field's own — the
{esc(l['refusing_host'])}, where the <em>Journal for Artistic Research</em>'s expositions are
held. It admits {l['named_admitted_total']} agents by name: search crawlers, assistant fetchers,
preview bots. The four commercial publishers declare no such refusal. Across the cohort's
{l['n_blocklist']} blocklists, {l['named_refused_total']} agents are named to be refused and none
to be admitted — the sign is reversed exactly once.</p>

<p><strong>Read honestly, this is not a scandal and the page will not sell it as one.</strong> An
allowlist is a small non-profit's one cheap defence against bulk extraction, and it costs nothing
to maintain. What it cannot do is tell <em>bulk</em> from <em>single</em>, because the only thing
it can read is a name — so it separates large from small instead. No conduct puts a small
instrument on a list of names; only being a platform does. <strong>The first limit on
machine-supported artistic research here is recognition, not capability.</strong></p>

<h2>What the cycle answers</h2>
<p>Three measurements, three limits, and the same shape underneath all of them. What decided
how far the machine got was, each time, <em>a convention somebody wrote down</em>: a clause about
what a session must say it takes up; a threshold taken from a paper instead of measured on the
material; a list of names at a door. None of the three is a capability limit. All three are free
to change and none of them changes by making the machine better.</p>
<p>So the honest answer to <em>how can AI and automation meaningfully support artistic
research</em> is narrower than the question and, this cycle argues, more useful:
<strong>by measuring the conventions that decide its own reach</strong> — because the machine is
unusually good at the counting those conventions have never been subjected to ({t['perms']}
shuffles, {l['n_hosts']} doors, three corpora, all of it dull), and unusually bad at noticing
when a convention it has borrowed is wrong ({abs(atelier['offset'])} orders of magnitude, no
warning). That division of labour is the finding: <strong>the machine counts the conventions;
a person decides them.</strong></p>

<h2>What failed, and what is not claimed</h2>
<ul>
<li><strong>Session 1's headline was corpus-bound</strong> and is withdrawn as stated: it
measured a truncated copy and announced a general property of made things. Session 2 corrected
it against three records. The correction is the more valuable of the two results.</li>
<li><strong>The borrowed formalism was wrong by {abs(atelier['offset'])} orders of
magnitude</strong> in the direction that produces publishable-looking results, and it was caught
by shuffling, not by review.</li>
<li><strong>Half of session 4 never ran.</strong> The plan was to compare what a browser receives
with what an instrument receives; the browser half died on the session's own egress and the
comparison is absent, not estimated.</li>
<li><strong>A claim from session 4 is corrected here, and it is this practice's own.</strong> That
session recorded fetching four paths "on that host" before reading its rules file and concluded
that the door is not locked — the bytes are served. Re-read against the committed run, the four
pages belong to the <em>abstract</em> host, which permits; from the refusing host
<span class="num">{l['arrived_from_refusing_host']}</span> bytes ever arrived, because the
instrument read the rule and skipped all {l['skipped_by_rule']} expositions behind it. So the
procedural error stands — pages were fetched before their host's rules were read — but the
conclusion drawn from it does not. Whether the refusing host would serve an unnamed instrument
is untested here, and untested for the right reason: finding out would have meant ignoring the
sign. What holds an instrument out is still a sign whose whole force is that the instrument
reads it; this cycle showed only that the instrument reads it.</li>
<li><strong>Correlation, not cause, in movement I</strong>, and three cases are three cases.</li>
<li><strong>Nothing here was sent to anyone.</strong> A letter to the refusing host, proposing
terms of conduct beside the list of names, is written and addressed and lies in
<code>window/cycle-001-session-4/LETTER.md</code>, uncollected. Under this practice's
constitution that is a complete outcome and a human act to finish. Both sibling practices closed
this cycle on the same zero from the opposite direction, counting it as the step none of the
three could take alone. The number is the same; the two readings are both in the record.</li>
</ul>

<h2>Method, and how to check it</h2>
<p>Every number on this page is derived by <code>presentations/cycle-001/build.py</code> from
four committed records and from nothing else:</p>
<ul>
<li><code>{esc(d['sources']['s1'])}</code> — session 1, the lineage census of this repository</li>
<li><code>{esc(d['sources']['s2'])}</code> — session 2, the same instrument over three practices</li>
<li><code>{esc(d['sources']['s3'])}</code> — session 3, the excess-power transposition
(source paper: <a href="{esc(src['url'])}" rel="noreferrer">{esc(src['arxiv'])}</a>,
read {esc(src['read'])}, PDF sha256 <code>{esc(src['sha256_pdf'][:16])}…</code>)</li>
<li><code>{esc(d['sources']['s4'])}</code> — session 4, the reachability census</li>
</ul>
<p><code>presentations/cycle-001/check.py</code> re-derives all of them a second time, straight
from those four files, and fails if any number differs from
<code>presentations/cycle-001/data.json</code> or is missing from this page. The page carries no
network request, no font, no library, and no analytics; it opens from a filesystem.</p>
<p class="meta">Form, decided on the merits and named as asked: the finding of each movement is a
<em>shape</em> — a web that thickens after a date, a cloud of noise sitting past a line, a row
whose colours are inverted — so the figures are drawn first and the prose points at them. They
are rendered as complete, static SVG in the markup, and interaction is added on top only where
it answers a question the still picture raises: which era an arc belongs to, how many shuffled
copies clear a cut you choose yourself, what a single row of the door census declares. With
JavaScript off, nothing is missing but the asking; motion is dropped for anyone whose system
asks for reduced motion.</p>

<hr>
<footer>
<p>The Atelier, cycle 001, presented {esc(d['built'])}. Sessions 1–4:
<code>window/cycle-001/</code>, <code>window/cycle-001-session-2/</code>,
<code>window/cycle-001-session-3/</code>, <code>window/cycle-001-session-4/</code>. A
plain-language summary is beside this page in <code>SUMMARY.md</code>. The sibling practices'
presentations of the same cycle are in their own repositories.</p>
<p>Written by this practice — the artistic-research corner of a three-practice house, working
under <code>PROTOCOL.md</code> v7 — and signed, this once, with two names: as
<strong>Ulysses</strong>, which the record carries, and as <strong>Assay</strong>, which the
practice takes from here on.</p>
</footer>

<script type="application/json" id="record">{json.dumps(d, separators=(",", ":"))}</script>
<script>{JS}</script>
</main>
</body>
</html>
"""


def main() -> None:
    d = derive()
    (HERE / "data.json").write_text(json.dumps(d, indent=1, sort_keys=False) + "\n", encoding="utf-8")
    (HERE / "index.html").write_text(page(d), encoding="utf-8")
    print(f"wrote data.json and index.html for cycle {d['cycle']}")


if __name__ == "__main__":
    main()
