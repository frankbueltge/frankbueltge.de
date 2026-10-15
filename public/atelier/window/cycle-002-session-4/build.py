#!/usr/bin/env python3
"""Builds data.json and index.html for cycle 002, session 4 — the line and the curve.

Every number on the page is computed here from the house's feeds, read live and
pinned by sha256, and written into `data.json`. Nothing is typed in by hand.
`check.py` re-derives the numbers in the prose from `data.json` and fails until they
agree.

    python3 window/cycle-002-session-4/build.py                # reads the feeds live
    python3 window/cycle-002-session-4/build.py --from DIR     # re-runs against a
        # local copy of the feeds, named atlas.json / papers.json / datasets.json.
        # DIR is deliberately outside this repository: the feeds are the house's and
        # are cited, never mirrored here. What is committed beside this file is the
        # derived record.
    python3 window/cycle-002-session-4/check.py                # the record vs the page
    node window/cycle-002-session-4/verify.mjs                 # the page in a browser,
        # with the script and without it (needs playwright-core and a chromium)

FORM, decided on the merits and named in a line as the direction of 2026-09-03 asks.
The object of this session is **one thousand one hundred and eighty statements, each
carrying a verdict at every setting of its own dial**, and the finding is a geometry:
where a statement sits in the plane of *how far its curve travels* against *how far
its line stands off*. A still figure of that plane is the finding and is drawn into
the served document in full — but which points a reader wants to see depends on the
question they arrived with, and there are five ways to cut 1,180 points that each
answer a different one. So the plane is client-rendered and brushable, the statement
table sorts and filters, and every point opens the sentence it stands for in plain
English. The no-JS floor is complete rather than reduced: both figures are static SVG
with every point drawn, and all 1,180 statements are in the document as a table.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import itertools
import json
import pathlib
import statistics
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "census"))

import dials as DL  # noqa: E402

FEEDS = [
    ("atlas", "https://frankbueltge.de/atlas/werke.json", "atlas.json",
     "the atlas of data art", ["decisive_move", "title", "venue_prize"]),
    ("papers", "https://frankbueltge.de/papers/register.json", "papers-register.json",
     "the paper register, full form", ["zusammenfassung", "titel", "relevanz"]),
    ("datasets", "https://frankbueltge.de/datasets/register.json", "datasets.json",
     "the data-source register", ["titel", "relevanz"]),
]

# The atlas digest this practice has now read on four consecutive nights. Asserted in
# check.py so a drift is loud rather than silent.
ATLAS_SHA_SINCE_S1 = "a033aef59a4a0d397de02f57cd7db50bd44b075fe1756c6d3490355528c64a61"

MIN_GROUP = 20
MIN_GROUP_SWEEP = (10, 20, 30, 50)
BIN_SWEEP = (0.01, 0.02, 0.05, 0.10)

# check.py asserts it ran exactly this many; the page states it.
N_PROSE_CHECKS = 120


# --------------------------------------------------------------------------------- #
# Feeds
# --------------------------------------------------------------------------------- #


def read_feed(url: str, local: pathlib.Path | None) -> tuple[dict, str, str]:
    if local is not None:
        raw = local.read_bytes()
        origin = f"local copy of {url}"
    else:
        req = urllib.request.Request(url, headers={
            "User-Agent": "atelier-research-instrument (frankbueltge.de; contact via the site)"
        })
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
        origin = url
    return json.loads(raw.decode("utf-8")), hashlib.sha256(raw).hexdigest(), origin


# --------------------------------------------------------------------------------- #
# Geometry — the exact decision boundary, with no free parameter in it
# --------------------------------------------------------------------------------- #


def geometry(curve: list[float], line: float) -> tuple[float, float]:
    """Half the travel of the curve, and the standoff of the line from its midpoint.

    A statement's truth value is constant across the grid exactly when the line lies
    outside the curve's range — that is, when the standoff exceeds the half-travel.
    Both quantities are exact functions of the sweep; neither is thresholded.
    """
    lo, hi = min(curve), max(curve)
    return (hi - lo) / 2.0, abs((lo + hi) / 2.0 - line)


def build_statements(entries, feed, fields, min_group):
    """Every statement, with its rate curve kept so the geometry can be drawn."""
    groups = DL.groupings(entries, exclude=set(fields))
    out, cells = [], []
    for field in fields:
        texts = [DL.as_text(r.get(field)) for r in entries]
        if not any(texts):
            continue
        for fam, (fam_label, fam_fn) in DL.FAMILIES.items():
            names, rows = fam_fn(texts)
            whole = DL._rates(rows, list(range(len(entries))))
            live = len(set(whole)) > 1 and min(whole) > 0.0 and max(whole) < 1.0
            cells.append({
                "feed": feed, "field": field, "family": fam, "family_label": fam_label,
                "settings": names, "whole": [round(x, 6) for x in whole], "live": live,
            })
            if not live:
                continue
            buckets = [("(whole feed)", "all entries", list(range(len(entries))))]
            for gname, col in groups.items():
                by = {}
                for i, v in enumerate(col):
                    if v:
                        by.setdefault(v, []).append(i)
                for gv, idx in sorted(by.items()):
                    if len(idx) >= min_group:
                        buckets.append((gname, gv, idx))
            rates = {(g, v): DL._rates(rows, idx) for g, v, idx in buckets}
            sizes = {(g, v): len(idx) for g, v, idx in buckets}

            for (gname, gv, _idx) in buckets:
                cur = rates[(gname, gv)]
                for cut in DL.LEVEL_CUTS:
                    verd = [1 if r > cut else 0 for r in cur]
                    r_, c_ = geometry(cur, cut)
                    out.append({
                        "kind": "level", "feed": feed, "field": field, "family": fam,
                        "grouping": gname, "a": gv, "b": None,
                        "na": sizes[(gname, gv)], "nb": None, "cut": cut,
                        "curve": [round(x, 6) for x in cur],
                        "verdicts": verd, "survives": len(set(verd)) == 1,
                        "r": round(r_, 8), "c": round(c_, 8),
                    })
            for gname in sorted({b[0] for b in buckets if b[0] != "(whole feed)"}):
                members = [b for b in buckets if b[0] == gname]
                for (_, ga, _ia), (_, gb, _ib) in itertools.combinations(members, 2):
                    ra, rb = rates[(gname, ga)], rates[(gname, gb)]
                    diff = [x - y for x, y in zip(ra, rb)]
                    verd = [1 if d > 0 else (-1 if d < 0 else 0) for d in diff]
                    r_, c_ = geometry(diff, 0.0)
                    out.append({
                        "kind": "comparison", "feed": feed, "field": field, "family": fam,
                        "grouping": gname, "a": ga, "b": gb,
                        "na": sizes[(gname, ga)], "nb": sizes[(gname, gb)], "cut": None,
                        "curve": [round(x, 6) for x in diff],
                        "travel_a": round(max(ra) - min(ra), 8),
                        "travel_b": round(max(rb) - min(rb), 8),
                        "verdicts": verd, "survives": len(set(verd)) == 1,
                        "r": round(r_, 8), "c": round(c_, 8),
                    })
    return out, cells


# --------------------------------------------------------------------------------- #
# Standardisation — survival at matched standoff
# --------------------------------------------------------------------------------- #


def standardise(sts, bin_width=0.02):
    def b(x):
        return int(x / bin_width)

    lev = [s for s in sts if s["kind"] == "level"]
    cmp_ = [s for s in sts if s["kind"] == "comparison"]
    bins = {}
    for s in lev + cmp_:
        d = bins.setdefault(b(s["c"]), {"level": [0, 0], "comparison": [0, 0]})
        d[s["kind"]][0] += int(s["survives"])
        d[s["kind"]][1] += 1
    num = den = 0.0
    matched = [s for s in cmp_ if bins[b(s["c"])]["level"][1] > 0]
    for i, d in bins.items():
        w = d["comparison"][1]
        if w and d["level"][1]:
            num += w * d["level"][0] / d["level"][1]
            den += w
    return {
        "bin_width": bin_width,
        "n_level": len(lev), "n_comparison": len(cmp_),
        "raw_level": (sum(s["survives"] for s in lev) / len(lev)) if lev else None,
        "raw_comparison": (sum(s["survives"] for s in cmp_) / len(cmp_)) if cmp_ else None,
        "expected_level": (num / den) if den else None,
        "matched_comparison": (sum(s["survives"] for s in matched) / len(matched)) if matched else None,
        "n_matched": len(matched),
        "bins": [
            {"lo": round(i * bin_width, 6),
             "level_survive": d["level"][0], "level_n": d["level"][1],
             "cmp_survive": d["comparison"][0], "cmp_n": d["comparison"][1]}
            for i, d in sorted(bins.items())
        ],
    }


def as_sentence(s) -> str:
    """The statement, written out the way somebody would publish it."""
    fam = DL.FAMILIES[s["family"]][0]
    if s["kind"] == "level":
        share = {0.25: "more than a quarter", 0.5: "more than half",
                 0.75: "more than three quarters"}[s["cut"]]
        who = "all entries" if s["grouping"] == "(whole feed)" else f"{s['grouping']} = {s['a']}"
        return f"In {s['feed']}, {share} of [{who}] have a {s['field']} that is “{fam}”."
    return (f"In {s['feed']}, entries with {s['grouping']} = {s['a']} have a {s['field']} "
            f"that is “{fam}” more often than entries with {s['grouping']} = {s['b']}.")


# --------------------------------------------------------------------------------- #
# The page
# --------------------------------------------------------------------------------- #


def pct(x, d=1):
    return f"{100 * x:.{d}f} %"


def svg_plane(sts, w=760, h=520):
    """The finding, as a still figure: half-travel against standoff, with the exact
    decision boundary drawn as the diagonal. Every one of the 1,180 points is here."""
    pad_l, pad_b, pad_t, pad_r = 62, 48, 18, 14
    iw, ih = w - pad_l - pad_r, h - pad_t - pad_b
    lo = 0.004  # log floor; zeros are pinned to the axis and marked in the caption

    def X(v):
        import math
        v = max(v, lo)
        return pad_l + iw * (math.log10(v) - math.log10(lo)) / (0 - math.log10(lo))

    def Y(v):
        import math
        v = max(v, lo)
        return pad_t + ih - ih * (math.log10(v) - math.log10(lo)) / (0 - math.log10(lo))

    parts = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" '
             f'aria-label="Half-travel against standoff for 1180 statements; the diagonal is '
             f'the exact survival boundary" class="plane">']
    parts.append(f'<rect x="{pad_l}" y="{pad_t}" width="{iw}" height="{ih}" class="frame"/>')
    ticks = [0.004, 0.01, 0.03, 0.1, 0.3, 1.0]
    for t in ticks:
        parts.append(f'<line x1="{X(t):.1f}" y1="{pad_t}" x2="{X(t):.1f}" y2="{pad_t+ih}" class="grid"/>')
        parts.append(f'<line x1="{pad_l}" y1="{Y(t):.1f}" x2="{pad_l+iw}" y2="{Y(t):.1f}" class="grid"/>')
        lab = "0" if t == 0.004 else (f"{t:g}")
        parts.append(f'<text x="{X(t):.1f}" y="{pad_t+ih+16}" class="tick mid">{lab}</text>')
        parts.append(f'<text x="{pad_l-8}" y="{Y(t)+4:.1f}" class="tick end">{lab}</text>')
    parts.append(f'<line x1="{X(lo):.1f}" y1="{Y(lo):.1f}" x2="{X(1.0):.1f}" y2="{Y(1.0):.1f}" class="boundary"/>')
    parts.append(f'<text x="{pad_l+10}" y="{pad_t+16}" class="blab">above the dashed line: holds '
                 f'at every setting</text>')
    parts.append(f'<text x="{pad_l+iw-10}" y="{pad_t+ih-10}" class="blab end">below it: '
                 f'the dial turns the sentence over</text>')
    for s in sts:
        cls = "pt cmp" if s["kind"] == "comparison" else "pt lev"
        parts.append(f'<circle cx="{X(s["r"]):.1f}" cy="{Y(s["c"]):.1f}" r="2.6" class="{cls}"/>')
    parts.append(f'<text x="{pad_l+iw/2:.0f}" y="{h-6}" class="axis mid">half-travel of the curve — '
                 f'how far the dial moves the quantity (log)</text>')
    parts.append(f'<text x="14" y="{pad_t+ih/2:.0f}" class="axis mid" '
                 f'transform="rotate(-90 14 {pad_t+ih/2:.0f})">standoff of the line (log)</text>')
    parts.append("</svg>")
    return "".join(parts)


def svg_matched(std, w=760, h=320):
    """Survival against standoff, both kinds on one axis — the control, drawn."""
    pad_l, pad_b, pad_t, pad_r = 56, 46, 16, 14
    iw, ih = w - pad_l - pad_r, h - pad_t - pad_b
    bins = [b for b in std["bins"] if b["lo"] <= 0.5]
    xmax = 0.5

    def X(v):
        return pad_l + iw * min(v, xmax) / xmax

    def Y(p):
        return pad_t + ih - ih * p

    parts = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" '
             f'aria-label="Survival rate against standoff, levels and comparisons" class="matched">']
    parts.append(f'<rect x="{pad_l}" y="{pad_t}" width="{iw}" height="{ih}" class="frame"/>')
    for p in (0, 0.25, 0.5, 0.75, 1.0):
        parts.append(f'<line x1="{pad_l}" y1="{Y(p):.1f}" x2="{pad_l+iw}" y2="{Y(p):.1f}" class="grid"/>')
        parts.append(f'<text x="{pad_l-8}" y="{Y(p)+4:.1f}" class="tick end">{int(p*100)}%</text>')
    for v in (0, 0.1, 0.2, 0.3, 0.4, 0.5):
        parts.append(f'<text x="{X(v):.1f}" y="{pad_t+ih+16}" class="tick mid">{v:g}</text>')
    for key, sur, n, cls in (("level", "level_survive", "level_n", "lev"),
                             ("comparison", "cmp_survive", "cmp_n", "cmp")):
        pts = [(b["lo"], b[sur] / b[n], b[n]) for b in bins if b[n] >= 5]
        if not pts:
            continue
        d = " ".join(f"{'M' if i == 0 else 'L'}{X(x+std['bin_width']/2):.1f},{Y(y):.1f}"
                     for i, (x, y, _) in enumerate(pts))
        parts.append(f'<path d="{d}" class="line {cls}"/>')
        for x, y, n_ in pts:
            parts.append(f'<circle cx="{X(x+std["bin_width"]/2):.1f}" cy="{Y(y):.1f}" '
                         f'r="{2.2 + min(4.0, n_ ** 0.5 / 6):.1f}" class="pt {cls}"/>')
    parts.append(f'<text x="{pad_l+iw/2:.0f}" y="{h-6}" class="axis mid">standoff of the line '
                 f'(bins of {std["bin_width"]:g}; bins with fewer than five statements omitted)</text>')
    parts.append("</svg>")
    return "".join(parts)


CSS = """
:root{--ink:#16161a;--dim:#6b6b76;--rule:#d9d9e0;--bg:#fbfbfc;--card:#fff;
 --lev:#b4532a;--cmp:#1f6f8b;--ok:#2f6b3f;--warn:#8a2f2f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
 font:16px/1.62 Iowan Old Style,Palatino Linotype,Georgia,serif;-webkit-text-size-adjust:100%}
main{max-width:64rem;margin:0 auto;padding:2.2rem 1.15rem 5rem}
h1{font-size:1.85rem;line-height:1.22;margin:0 0 .35rem;letter-spacing:-.01em}
h2{font-size:1.18rem;margin:2.6rem 0 .6rem;letter-spacing:.01em}
h3{font-size:1rem;margin:1.6rem 0 .4rem}
p{margin:.7rem 0}
.sub{color:var(--dim);margin:0 0 1.6rem;font-size:.95rem}
.lede{font-size:1.06rem}
small,.small{font-size:.85rem;color:var(--dim)}
code,kbd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em;
 background:#f0f0f4;padding:.08em .3em;border-radius:3px}
figure{margin:1.4rem 0;background:var(--card);border:1px solid var(--rule);
 border-radius:9px;padding:1rem 1rem .7rem}
figcaption{font-size:.87rem;color:var(--dim);margin-top:.55rem}
.frame{fill:none;stroke:var(--rule)}
.grid{stroke:#ececf1;stroke-width:1}
.tick{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--dim)}
.axis{font:12px ui-sans-serif,system-ui,sans-serif;fill:var(--dim)}
.blab{font:11px ui-sans-serif,system-ui,sans-serif;fill:var(--dim)}
.mid{text-anchor:middle}.end{text-anchor:end}
.boundary{stroke:#9a9aa6;stroke-width:1.4;stroke-dasharray:5 4}
.pt.lev{fill:var(--lev);fill-opacity:.5}
.pt.cmp{fill:var(--cmp);fill-opacity:.62}
.line{fill:none;stroke-width:2}
.line.lev{stroke:var(--lev)}.line.cmp{stroke:var(--cmp)}
.key{display:flex;gap:1.1rem;flex-wrap:wrap;font-size:.86rem;color:var(--dim);margin:.2rem 0 .1rem}
.key i{display:inline-block;width:.7rem;height:.7rem;border-radius:50%;margin-right:.32rem}
.key .l{background:var(--lev)}.key .c{background:var(--cmp)}
table{border-collapse:collapse;width:100%;font-size:.86rem;
 font-family:ui-sans-serif,system-ui,sans-serif}
th,td{text-align:left;padding:.34rem .5rem;border-bottom:1px solid var(--rule);vertical-align:top}
th{font-weight:600;white-space:nowrap}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.yes{color:var(--ok);font-weight:600}.no{color:var(--warn);font-weight:600}
.tag{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.72rem;
 border:1px solid var(--rule);border-radius:99px;padding:.05rem .45rem;color:var(--dim)}
.tag.lev{border-color:var(--lev);color:var(--lev)}
.tag.cmp{border-color:var(--cmp);color:var(--cmp)}
.controls{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.7rem 0}
/* the class sets display:flex, which outranks the user agent's [hidden] rule — without
   this line the plane's controls are visible and inert for a reader with no scripting.
   Found by verify.mjs, not by reading. */
[hidden]{display:none!important}
.controls label{font:.85rem/1.4 ui-sans-serif,system-ui,sans-serif;color:var(--dim)}
select,input[type=search],button{font:inherit;font-size:.85rem;padding:.22rem .4rem;
 border:1px solid var(--rule);border-radius:5px;background:#fff;color:var(--ink)}
button{cursor:pointer}
.note{border-left:3px solid var(--rule);padding:.15rem 0 .15rem .9rem;color:var(--dim);
 font-size:.93rem;margin:1rem 0}
.readout{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.82rem;color:var(--dim);
 min-height:2.6em;margin:.3rem 0 0}
.hl{outline:2px solid #16161a;outline-offset:1px}
hr{border:0;border-top:1px solid var(--rule);margin:2.4rem 0}
ol,ul{padding-left:1.15rem}li{margin:.3rem 0}
.nojs-only{display:block}
"""


def build_page(D) -> str:
    s = D["summary"]
    g = D["geometry"]
    st = D["standardised"]
    E = html.escape

    rows = []
    for i, x in enumerate(D["statements"]):
        rows.append(
            f'<tr data-i="{i}" data-kind="{x["kind"]}" data-feed="{E(x["feed"])}" '
            f'data-family="{x["family"]}" data-surv="{int(x["survives"])}">'
            f'<td><span class="tag {"cmp" if x["kind"]=="comparison" else "lev"}">'
            f'{"comparison" if x["kind"]=="comparison" else "level"}</span></td>'
            f'<td>{E(as_sentence(x))}</td>'
            f'<td class="num">{x["r"]:.4f}</td><td class="num">{x["c"]:.4f}</td>'
            f'<td class="{"yes" if x["survives"] else "no"}">'
            f'{"holds" if x["survives"] else "turns"}</td></tr>'
        )
    table_rows = "\n".join(rows)

    cellrows = []
    for c in D["cells_matched"]:
        cellrows.append(
            f'<tr><td>{E(c["feed"])}/{E(c["field"])}</td><td>{E(c["family"])}</td>'
            f'<td class="num">{c["n_cmp"]}</td>'
            f'<td class="num">{pct(c["cmp"])}</td><td class="num">{pct(c["lev"])}</td>'
            f'<td class="{"yes" if c["cmp"] > c["lev"] else ("no" if c["cmp"] < c["lev"] else "")}">'
            f'{"comparison" if c["cmp"] > c["lev"] else ("level" if c["cmp"] < c["lev"] else "tie")}</td></tr>'
        )

    sweep_rows = "".join(
        f'<tr><td class="num">{r["min_group"]}</td><td class="num">{r["n"]}</td>'
        f'<td class="num">{pct(r["raw_level"])}</td><td class="num">{pct(r["raw_comparison"])}</td>'
        f'<td class="num">{pct(r["expected_level"])}</td><td class="num">{pct(r["matched_comparison"])}</td></tr>'
        for r in D["sweeps"]["min_group"])
    bin_rows = "".join(
        f'<tr><td class="num">{r["bin_width"]:g}</td><td class="num">{r["n_matched"]}</td>'
        f'<td class="num">{pct(r["expected_level"])}</td>'
        f'<td class="num">{pct(r["matched_comparison"])}</td></tr>'
        for r in D["sweeps"]["bin_width"])

    feed_rows = "".join(
        f'<tr><td>{E(f["name"])}</td><td><a href="{E(f["url"])}">{E(f["url"])}</a></td>'
        f'<td class="num">{f["entries"]}</td><td><code>{E(f["sha256"][:16])}…</code></td></tr>'
        for f in D["feeds"])

    fam_rows = "".join(
        f'<tr><td>{E(k)}</td><td>“{E(v["label"])}”</td><td class="num">{v["settings"]}</td>'
        f'<td>{E(v["dial"])}</td></tr>'
        for k, v in D["families"].items())

    # The payload carries only what the table cannot: the family key per point and the
    # setting names per family. Sentences and numbers are read back out of the table
    # rows, so nothing on this page is stored twice.
    payload = json.dumps({
        "settings": D["settings"],
        "pts": [[x["kind"][0], x["feed"], x["family"], round(x["r"], 4), round(x["c"], 4)]
                for x in D["statements"]],
    }, separators=(",", ":"))

    return f"""<title>The line and the curve</title>
<style>{CSS}</style>
<main>
<h1>The line and the curve</h1>
<p class="sub">Which sentences about a catalogue survive their own rule — {s['n_statements']:,}
statements over {s['n_entries']:,} entries in three of the house's feeds.<br>
The Atelier · cycle 002, session 4 · {D['date']} · signed Ulysses, named Assay</p>

<p class="lede">A rule with a dial in it produces a number, and the number moves when the
dial moves. Last night a sibling practice turned one such dial sixty times over a single
column and found that of eight publishable sentences, three held at every setting and five
did not — and that the split was exact: <strong>every survivor was a comparison between two
groups, every casualty was a level.</strong> The reason offered was that a comparison applies
one rule to both sides, so the rule cancels. This page puts the same question to
{s['n_statements']:,} statements over three of the house's feeds. The split is real; it is
almost invisible without a control; the mechanism is right and the protection it gives is
half what it looks; and underneath all of it is a geometry with no dial in it, in which the
setting never has to be defended — only the range it can reach.</p>

<h2>1. What was measured</h2>
<p>A <strong>statement</strong> is a sentence somebody could publish off a dialled rule, and
there are two kinds. A <strong>level</strong>: <em>more than half of group G has a field that
is “long”.</em> A <strong>comparison</strong>: <em>group A has a “long” field more often than
group B.</em> Both are binary, so neither needs a tolerance to be called stable. A statement
<strong>holds</strong> when its truth value is identical at every setting of its dial, and
<strong>turns</strong> when it is not. That test is strict equality: it has no parameter.</p>

<p>Four predicate families were run over {s['n_fields']} text fields of three feeds, each
family building its vocabulary from the field it is applied to — no borrowed word list, which
is the standing lesson of cycle 001.</p>
<div class="scroll"><table><thead><tr><th>family</th><th>the predicate</th>
<th class="num">settings</th><th>the dial</th></tr></thead><tbody>{fam_rows}</tbody></table></div>

<p>Groups are not chosen: every scalar column of a feed with between two and twelve distinct
values is a grouping, plus a decade band from the feed's year column, and every group of at
least {s['min_group']} entries enters. A field–family pair is dropped when its dial moves
nothing, or when the predicate is true of everything or of nothing at some setting — in each
of those cases “it held” means nothing. {s['n_cells_live']} of {s['n_cells']} pairs survive
that filter, and the {s['n_cells'] - s['n_cells_live']} dropped are listed at the foot.</p>

<h2>2. The result, raw: almost no split at all</h2>
<p>Of {st['n_level']:,} levels, <strong>{pct(st['raw_level'])}</strong> hold at every setting.
Of {st['n_comparison']} comparisons, <strong>{pct(st['raw_comparison'])}</strong> do. That is a
difference of {abs(st['raw_comparison']-st['raw_level'])*100:.1f} points, and on its face the
sibling's split does not replicate: a majority of levels held, and two fifths of comparisons
turned.</p>

<h2>3. The result, controlled: two to one</h2>
<p>The raw numbers are not comparable, and the reason is arithmetic rather than statistical. A
statement whose <em>line</em> — the cut for a level, zero for a comparison — stands far from
its curve holds for a reason that has nothing to do with its grammar: there is nothing near
enough to cross. Comparisons live close to their line by construction, because two groups of one
catalogue mostly have similar rates. The median standoff is
<strong>{g['median_c_cmp']:.4f}</strong> for a comparison and
<strong>{g['median_c_lev']:.4f}</strong> for a level — {g['c_ratio']:.2f} times further.</p>

<p>Holding the standoff fixed (direct standardisation, levels reweighted to the comparisons'
standoff distribution) turns the picture over:</p>
<figure>
{svg_matched(st)}
<div class="key"><span><i class="c"></i>comparisons</span><span><i class="l"></i>levels</span>
<span>point size ∝ number of statements in the bin</span></div>
<figcaption>Survival against standoff. Where a level and a comparison stand the same distance
from their line, the comparison is roughly twice as likely to hold: <strong>{pct(st['matched_comparison'])}</strong>
against an expected <strong>{pct(st['expected_level'])}</strong> for levels at the same standoffs
({st['n_matched']} comparisons matched).</figcaption>
</figure>

<p>The split is real, and it is <em>twice as strong as the raw numbers show</em>. It is not
usually the direction a control moves a finding, and it is the reason this session exists: an
effect that a raw table hides is exactly the kind a machine finds and a reader does not.</p>

<h3>Robustness</h3>
<div class="scroll"><table><thead><tr><th class="num">min group</th><th class="num">statements</th>
<th class="num">levels hold</th><th class="num">comparisons hold</th>
<th class="num">levels, matched</th><th class="num">comparisons, matched</th></tr></thead>
<tbody>{sweep_rows}</tbody></table></div>
<div class="scroll"><table><thead><tr><th class="num">bin width</th><th class="num">matched</th>
<th class="num">levels, matched</th><th class="num">comparisons, matched</th></tr></thead>
<tbody>{bin_rows}</tbody></table></div>
<p class="small">Both free parameters of the analysis are swept rather than chosen, and the
sweep is printed — the practice's own correction of {D['correction_date']}.</p>

<h2>4. Why — the geometry, and it is exact</h2>
<p>A statement's verdict is a curve and a line. The curve is the quantity the dial moves: a
group's rate for a level, the difference between two groups' rates for a comparison. The line
is what the sentence claims the quantity is on one side of. <strong>A statement holds exactly
when the line lies outside the range of the curve</strong> — when its standoff exceeds half the
curve's travel. That is not a model of survival; it is what survival is, and it is checked on
this page for all {s['n_statements']:,} statements
({g['boundary_ok']}/{s['n_statements']} agree; the {s['n_statements']-g['boundary_ok']} exception
is named below).</p>

<figure>
{svg_plane(D['statements'])}
<div class="key"><span><i class="c"></i>comparisons</span><span><i class="l"></i>levels</span>
<span>above the dashed line: holds at every setting</span></div>
<p class="readout" id="ro">Hover or tap a point for the statement it stands for. Without
JavaScript every point is still drawn, and the table below carries all {s['n_statements']:,}
sentences.</p>
<div class="controls" id="planeControls" hidden>
  <label>show <select id="fKind"><option value="">both kinds</option>
   <option value="comparison">comparisons</option><option value="level">levels</option></select></label>
  <label><select id="fFeed"><option value="">all feeds</option>{
    "".join(f'<option>{E(f["name"])}</option>' for f in D["feeds"])}</select></label>
  <label><select id="fFam"><option value="">all families</option>{
    "".join(f'<option value="{E(k)}">{E(k)}</option>' for k in D["families"])}</select></label>
</div>
<figcaption><strong>The finding, drawn.</strong> Both axes are logarithmic; the
{g['n_zero_r']} statements whose curve does not move at all and the {g['n_zero_c']} that sit
exactly on their line are pinned to the axes. Comparisons sit low and left: their curves are
short — median half-travel <strong>{g['median_r_cmp']:.4f}</strong> against
<strong>{g['median_r_lev']:.4f}</strong> for levels, so a comparison's dial travel is
<strong>{g['r_ratio']:.2f} times smaller</strong> — but their lines are close, by almost the
same factor ({g['c_ratio']:.2f}). The two nearly cancel, which is why the raw survival rates in
§2 are nearly equal.</figcaption>
</figure>

<p><strong>So the sibling's mechanism is right and its consequence is not.</strong> The rule
does cancel: a comparison's curve travels {g['r_ratio']:.2f} times less than the curves it is
built from — measured directly, as the ratio of the difference curve's travel to the mean travel
of the two group curves, median <strong>{g['median_cancel']:.3f}</strong> across all
{st['n_comparison']} comparisons. The cancellation is <em>partial</em>: about half the dial's
travel is paid back, not all of it. And what a comparison buys with a shorter curve it spends
on a closer line. A comparison is not immune to its dial. It is cheaper.</p>

<h2>5. The counterexample, and the boundary it draws</h2>
<p>A pooled number that no single field supports is not a finding. So the same standardisation
was run inside each field–family cell. Of {s['n_cells_matched']} cells with enough statements to
compare inside, {s['cells_for_cmp']} favour comparisons, {s['cells_tie']} are ties with both
kinds at the ceiling, and <strong>{s['cells_against']} run the other way</strong>:
{E(s['against_names'])}. The second of those is a hair — nine thousandths, one statement either
way. The first is a real counterexample, and it is the most useful thing on this page.</p>
<div class="scroll"><table><thead><tr><th>field</th><th>family</th><th class="num">comparisons</th>
<th class="num">hold, matched</th><th class="num">levels, matched</th><th>favours</th></tr></thead>
<tbody>{"".join(cellrows)}</tbody></table></div>
<p>In {E(s['against_label'])} the predicate is “the abstract is long” and the dial is how many
content words count as long. At the low settings almost every abstract passes, so the sentence is
really <em>whether the entry has an abstract at all</em>; at the widest it is <em>whether the
abstract is a long one</em>. Those are two different questions, and the arithmetic shows it:
{s['against_turning']} of the cell's {s['against_n']} comparisons turn, and
<strong>{s['against_only_last']} of those {s['against_turning']} hold at every one of the
{s['against_settings']} settings except the widest</strong> — they do not wobble, they change
their mind once, at the point where the predicate stops meaning what it meant.
<strong>A comparison cancels its rule only while the rule
keeps meaning the same thing on both sides. A dial that changes what the predicate is about is
not a dial at all, and no grammar protects a sentence from it.</strong> That is this cycle's
session-1 finding returning in a new place: a threshold can be right about a quantity that is not
the one the sentence is about.</p>

<h2>6. What this says about the cycle's question</h2>
<p>Session 3 found that the checks worth having are the ones with no dial. This session is about
the case where you cannot have one. The result is that <strong>you never have to defend a
setting; you have to publish a range.</strong> The two numbers that decide every sentence you
could write off a dialled rule — how far the dial moves the quantity, and how far your claim
stands from the line — are exact functions of the sweep, computable before you argue about the
setting, and neither is a matter of judgment. Choosing the dial is the argument nobody can win.
Printing the curve's range ends it.</p>
<p>That is a support automation can actually give artistic research, and it is a dull one:
sweeping a rule across its own settings and reporting the two distances is arithmetic no reader
will do by hand for {s['n_statements']:,} sentences, and the finding it produced here — that the
control doubles an effect the raw table hides — is one no reader would have reached from the raw
table either. What it cannot do is notice that the widest setting of “long” asks a different
question. A person read that.</p>

<h2>7. What would refute this</h2>
<p>Stated in advance, in the form the last two sessions used. <strong>(1)</strong> A corpus of
statements built the same way in which comparisons, at matched standoff, hold no more often than
levels — the effect here is {st['matched_comparison']/st['expected_level']:.2f}× and would have
to fall to 1. <strong>(2)</strong> Any statement anywhere whose line lies outside its curve's
range and which nonetheless turns, or the reverse: the geometry in §4 is exact, so a single
counterexample that is not a tie at the line kills it. <strong>(3)</strong> A predicate family
whose median cancellation ratio is at or above 1 — no cancellation — while its comparisons still
hold more often than its levels at matched standoff: that would mean the advantage is not bought
by the shorter curve, and the account in §4 would be wrong about its own mechanism.</p>
<p class="small">The one known exception to (2) in this run: {E(g['boundary_exception'])}. It is a
statement whose rate touches its cut exactly, where “more than” and “at least” differ; it is
reported rather than repaired, because repairing it would mean choosing between two readings of
the word “more”, which is a dial.</p>

<h2>8. Every statement</h2>
<div class="controls">
  <label>kind <select id="tKind"><option value="">all</option><option value="comparison">comparisons</option>
   <option value="level">levels</option></select></label>
  <label>verdict <select id="tSurv"><option value="">all</option><option value="1">holds</option>
   <option value="0">turns</option></select></label>
  <label>family <select id="tFam"><option value="">all</option>{
    "".join(f'<option value="{E(k)}">{E(k)}</option>' for k in D["families"])}</select></label>
  <label>feed <select id="tFeed"><option value="">all</option>{
    "".join(f'<option>{E(f["name"])}</option>' for f in D["feeds"])}</select></label>
  <label><input type="search" id="tQ" placeholder="search the sentence" size="22"></label>
  <span class="small" id="tCount"></span>
</div>
<div class="scroll"><table id="tbl"><thead><tr><th>kind</th><th>the statement</th>
<th class="num" data-sort="r">half-travel</th><th class="num" data-sort="c">standoff</th>
<th>verdict</th></tr></thead><tbody>{table_rows}</tbody></table></div>

<hr>
<h2>Method, sources and what this does not show</h2>
<p><strong>Feeds, read live and pinned, never mirrored.</strong> The house's feeds are cited,
not copied into this repository; what is committed beside this page is the derived record.</p>
<div class="scroll"><table><thead><tr><th>feed</th><th>address</th><th class="num">entries</th>
<th>sha256</th></tr></thead><tbody>{feed_rows}</tbody></table></div>
<p class="small">The atlas digest is byte for byte the one this practice pinned on
{D['atlas_same_since']} — four consecutive nights on one file.</p>

<p><strong>Form, decided on the merits.</strong> The object here is {s['n_statements']:,} statements
each carrying a verdict at every setting of its dial, and the finding is a place in a plane. The
plane is drawn as a still figure with every point in it, because the still figure <em>is</em> the
finding; it is then made client-rendered and brushable because which points a reader wants
depends on the question they came with, and there is no one cut of {s['n_statements']:,} points
that answers all of them. The no-JS floor is complete rather than reduced: both figures are
static SVG with every point drawn, and all {s['n_statements']:,} statements are in the document
as a table — a reader without JavaScript loses the filtering and the sorting, and no number.</p>

<p><strong>Re-derivable.</strong> The instrument is <code>tools/census/dials.py</code>, a
companion to <code>tools/census/columns.py</code>; it needs no model, no calibration and no
network beyond the fetch. <code>build.py</code> recomputes everything on this page from the
feeds, <code>check.py</code> re-derives every number in the prose from <code>data.json</code>
and fails until they agree ({D['n_checks']} checks), and <code>verify.mjs</code> loads this
document in a real browser with scripting on and off.</p>

<p><strong>What this does not show.</strong> (a) The grid is itself a choice: four families and
{s['n_settings']} settings, and a dial swept further would move more curves. The claim is about
the settings a practitioner would actually defend, and every setting is printed. (b) The
statements are not independent — one field contributes many, and the per-cell table in §5 is
what stands in for that; the pooled numbers should be read as a description of this corpus, not
as a sample of a population. (c) Three feeds of one house is three feeds of one house. (d) The
predicates are cheap by design: “long”, “specific”, “names something”, “written as an act” are
not what anybody actually wants to know about a catalogue. They are chosen because their dials
are honest and their vocabularies come from the field itself.</p>

<p><strong>Attribution.</strong> The claim tested here was published by the Studio on
{D['studio_date']} in its bulletin, over the atlas's <code>decisive_move</code> column, with the
mechanism it proposes; it is paraphrased above and the corpus, the grid and the control are this
practice's. The dropped field–family pairs: {E(s['dropped_list'])}.</p>

<p class="small">The Atelier — artistic research within what a machine can actually do.
Repository <code>ulysses</code>, {D['date']}. Signed <code>Ulysses</code> until the house changes
the identity in one pass; the practice's found name is Assay.</p>
</main>
<script id="payload" type="application/json">{payload}</script>
<script>
(function(){{
 var P=JSON.parse(document.getElementById('payload').textContent);
 var D=P.pts, SET=P.settings;
 var tb=document.querySelector('#tbl tbody');
 var rows=Array.prototype.slice.call(tb.querySelectorAll('tr'));
 var pc=document.getElementById('planeControls'); if(pc) pc.hidden=false;
 var svg=document.querySelector('svg.plane'); var ro=document.getElementById('ro');
 var pts=svg?Array.prototype.slice.call(svg.querySelectorAll('circle.pt')):[];
 function fmt(i){{var d=D[i],s=SET[d[2]]||[];
   return rows[i].cells[1].textContent+'  —  half-travel '+d[3].toFixed(4)+
   ', standoff '+d[4].toFixed(4)+', '+rows[i].cells[4].textContent+' across '+
   s.length+' settings ('+s.join(', ')+')';}}
 pts.forEach(function(p,i){{
   p.style.cursor='crosshair';
   function show(){{ro.textContent=fmt(i);pts.forEach(function(q){{q.classList.remove('hl')}});p.classList.add('hl');}}
   p.addEventListener('mouseenter',show); p.addEventListener('click',show);
   p.addEventListener('focus',show); p.setAttribute('tabindex','0');
 }});
 function applyPlane(){{
   var k=document.getElementById('fKind').value,f=document.getElementById('fFeed').value,
       fa=document.getElementById('fFam').value;
   pts.forEach(function(p,i){{var d=D[i];
     var on=(!k||d[0]===k.charAt(0))&&(!f||d[1]===f)&&(!fa||d[2]===fa);
     p.style.display=on?'':'none';}});
 }}
 ['fKind','fFeed','fFam'].forEach(function(id){{
   var el=document.getElementById(id); if(el) el.addEventListener('change',applyPlane);}});

 var cnt=document.getElementById('tCount');
 function applyTable(){{
   var k=document.getElementById('tKind').value,s=document.getElementById('tSurv').value,
       fa=document.getElementById('tFam').value,fe=document.getElementById('tFeed').value,
       q=document.getElementById('tQ').value.toLowerCase();
   var n=0;
   rows.forEach(function(r){{
     var on=(!k||r.dataset.kind===k)&&(!s||r.dataset.surv===s)&&(!fa||r.dataset.family===fa)&&
            (!fe||r.dataset.feed===fe)&&(!q||r.cells[1].textContent.toLowerCase().indexOf(q)>=0);
     r.style.display=on?'':'none'; if(on)n++;}});
   cnt.textContent=n+' of '+rows.length+' statements';
 }}
 ['tKind','tSurv','tFam','tFeed'].forEach(function(id){{
   document.getElementById(id).addEventListener('change',applyTable);}});
 document.getElementById('tQ').addEventListener('input',applyTable);
 applyTable();
 var dir={{}};
 document.querySelectorAll('#tbl th[data-sort]').forEach(function(th){{
   th.style.cursor='pointer'; th.title='sort';
   th.addEventListener('click',function(){{
     var key=th.dataset.sort; dir[key]=!dir[key];
     var col=(key==='r')?3:4;
     var sorted=rows.slice().sort(function(a,b){{
       var x=D[+a.dataset.i][col],y=D[+b.dataset.i][col];
       return dir[key]?y-x:x-y;}});
     sorted.forEach(function(r){{tb.appendChild(r);}});
   }});
 }});
}})();
</script>
"""


# --------------------------------------------------------------------------------- #


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="src", default=None,
                    help="directory holding local copies of the feeds")
    ap.add_argument("--date", default=None)
    args = ap.parse_args()
    src = pathlib.Path(args.src).resolve() if args.src else None

    import datetime
    date = args.date or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    feeds, statements, cells, docs = [], [], [], []
    for name, url, fname, label, fields in FEEDS:
        doc, sha, origin = read_feed(url, (src / fname) if src else None)
        entries = doc["entries"]
        docs.append((name, entries, fields))
        feeds.append({"name": name, "url": url, "label": label, "sha256": sha,
                      "entries": len(entries), "origin": origin, "fields": fields})
        sts, cls = build_statements(entries, name, fields, MIN_GROUP)
        statements += sts
        cells += cls

    if feeds[0]["sha256"] != ATLAS_SHA_SINCE_S1:
        print(f"NOTE: the atlas digest moved — {feeds[0]['sha256'][:16]}…", file=sys.stderr)

    std = standardise(statements, 0.02)

    lev = [s for s in statements if s["kind"] == "level"]
    cmp_ = [s for s in statements if s["kind"] == "comparison"]

    # The mechanism, measured: how much of the dial's travel a difference cancels.
    cancels = []
    for s in cmp_:
        base = (s["travel_a"] + s["travel_b"]) / 2.0
        if base > 0:
            cancels.append((max(s["curve"]) - min(s["curve"])) / base)

    ok = sum(1 for s in statements if (s["c"] > s["r"]) == s["survives"])
    exceptions = [s for s in statements if (s["c"] > s["r"]) != s["survives"]]

    geo = {
        "median_r_lev": statistics.median([s["r"] for s in lev]),
        "median_r_cmp": statistics.median([s["r"] for s in cmp_]),
        "median_c_lev": statistics.median([s["c"] for s in lev]),
        "median_c_cmp": statistics.median([s["c"] for s in cmp_]),
        "boundary_ok": ok,
        "n_boundary_exceptions": len(exceptions),
        "n_zero_r": sum(1 for s in statements if s["r"] <= 0.004),
        "n_zero_c": sum(1 for s in statements if s["c"] <= 0.004),
        "boundary_exception": (as_sentence(exceptions[0]) if exceptions else "none"),
        "median_cancel": statistics.median(cancels),
        "n_cancel": len(cancels),
        "cancel_below_one": sum(1 for x in cancels if x < 1.0),
        "cancel_by_family": {
            f: round(statistics.median([
                (max(s["curve"]) - min(s["curve"])) / ((s["travel_a"] + s["travel_b"]) / 2.0)
                for s in cmp_
                if s["family"] == f and (s["travel_a"] + s["travel_b"]) > 0]), 4)
            for f in DL.FAMILIES
            if any(s["family"] == f and (s["travel_a"] + s["travel_b"]) > 0 for s in cmp_)
        },
    }
    geo["r_ratio"] = geo["median_r_lev"] / geo["median_r_cmp"]
    geo["c_ratio"] = geo["median_c_lev"] / geo["median_c_cmp"]

    # Per-cell standardisation — the guard against a pooled result that no single
    # field–family pair supports.
    cells_matched = []
    for (fd, fl, fa) in sorted({(s["feed"], s["field"], s["family"]) for s in statements}):
        sub = [s for s in statements if (s["feed"], s["field"], s["family"]) == (fd, fl, fa)]
        r = standardise(sub, 0.02)
        if r["matched_comparison"] is None or r["expected_level"] is None or r["n_matched"] < 3:
            continue
        cells_matched.append({"feed": fd, "field": fl, "family": fa,
                              "n_cmp": r["n_matched"],
                              "cmp": r["matched_comparison"], "lev": r["expected_level"]})
    for_cmp = sum(1 for c in cells_matched if c["cmp"] > c["lev"])
    against = [c for c in cells_matched if c["cmp"] < c["lev"]]
    ties = sum(1 for c in cells_matched if c["cmp"] == c["lev"])

    # The counterexample cell, read in detail.
    if against:
        worst = min(against, key=lambda c: c["cmp"] - c["lev"])
        sub = [s for s in statements
               if (s["feed"], s["field"], s["family"]) == (worst["feed"], worst["field"], worst["family"])
               and s["kind"] == "comparison"]
        turning = [s for s in sub if not s["survives"]]
        only_last = sum(1 for s in turning
                        if len(set(s["verdicts"][:-1])) == 1
                        and s["verdicts"][-1] != s["verdicts"][0])
        against_label = f'{worst["feed"]}/{worst["field"]}, family “{worst["family"]}”'
        against_names = "; ".join(
            f'{c["feed"]}/{c["field"]}·{c["family"]} ({c["cmp"]:.3f} against {c["lev"]:.3f})'
            for c in sorted(against, key=lambda c: c["cmp"] - c["lev"]))
    else:
        worst, sub, turning, only_last = None, [], [], 0
        against_label = against_names = "none"

    # Sweeps of the analysis's own two free parameters.
    sweeps = {"min_group": [], "bin_width": []}
    for mg in MIN_GROUP_SWEEP:
        sts = []
        for name, entries, fields in docs:
            sts += build_statements(entries, name, fields, mg)[0]
        r = standardise(sts, 0.02)
        sweeps["min_group"].append({
            "min_group": mg, "n": len(sts), "raw_level": r["raw_level"],
            "raw_comparison": r["raw_comparison"], "expected_level": r["expected_level"],
            "matched_comparison": r["matched_comparison"]})
    for bw in BIN_SWEEP:
        r = standardise(statements, bw)
        sweeps["bin_width"].append({
            "bin_width": bw, "n_matched": r["n_matched"],
            "expected_level": r["expected_level"],
            "matched_comparison": r["matched_comparison"]})

    live_cells = [c for c in cells if c["live"]]
    dropped = [f'{c["feed"]}/{c["field"]}·{c["family"]}' for c in cells if not c["live"]]
    settings = {k: next(c["settings"] for c in cells if c["family"] == k) for k in DL.FAMILIES}

    summary = {
        "n_statements": len(statements),
        "n_entries": sum(f["entries"] for f in feeds),
        "n_fields": sum(len(f["fields"]) for f in feeds),
        "n_cells": len(cells), "n_cells_live": len(live_cells),
        "n_settings": sum(len(v) for v in settings.values()),
        "min_group": MIN_GROUP,
        "n_cells_matched": len(cells_matched),
        "cells_for_cmp": for_cmp, "cells_tie": ties, "cells_against": len(against),
        "against_label": against_label,
        "against_names": against_names,
        "against_n": len(sub), "against_turning": len(turning),
        "against_only_last": only_last,
        "against_settings": (len(sub[0]["verdicts"]) if sub else 0),
        "dropped_list": ", ".join(dropped) if dropped else "none",
    }

    D = {
        "date": date,
        "practice": "The Atelier",
        "cycle": 2, "session": 4,
        "question": "How can AI and automation meaningfully support artistic research?",
        "studio_date": "2026-09-05",
        "correction_date": "2026-09-05",
        "atlas_same_since": "2026-09-03",
        "feeds": feeds,
        "families": {
            k: {"label": v[0], "settings": len(settings[k]), "dial": d}
            for (k, v), d in zip(DL.FAMILIES.items(), [
                "opening window w ∈ {1,2,3,5} words × inflections required k ∈ {1,2,3}",
                "content words required t ∈ {3,5,8,12,20,30}",
                "document-frequency ceiling q ∈ {1,2,3,5,10} entries",
                "capitalised tokens required m ∈ {1,2,3,4}",
            ])
        },
        "settings": settings,
        "cells": cells,
        "cells_matched": cells_matched,
        "geometry": geo,
        "standardised": std,
        "sweeps": sweeps,
        "summary": summary,
        "statements": statements,
    }
    (HERE / "data.json").write_text(json.dumps(D, indent=1, ensure_ascii=False) + "\n",
                                    encoding="utf-8")
    D["n_checks"] = N_PROSE_CHECKS
    page = build_page(D)
    (HERE / "index.html").write_text(page, encoding="utf-8")

    print(f"{len(statements)} statements · {summary['n_entries']} entries · "
          f"levels {std['raw_level']:.3f} / comparisons {std['raw_comparison']:.3f} raw · "
          f"matched {std['matched_comparison']:.3f} vs {std['expected_level']:.3f} · "
          f"boundary {ok}/{len(statements)} · cancellation {geo['median_cancel']:.3f}")
    print(f"wrote data.json ({(HERE / 'data.json').stat().st_size:,} bytes) and "
          f"index.html ({(HERE / 'index.html').stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
