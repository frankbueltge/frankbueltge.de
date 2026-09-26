#!/usr/bin/env python3
"""Session 16 — rebuild index.html from results.json (written by analysis.py from fmd.json).
No network path. Deterministic: running it twice gives the same bytes."""
import html
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
R = json.loads((HERE / "results.json").read_text(encoding="utf-8"))
ST = R["studio"]
M = R["methods"]
SCAN = R["scan"]
LO, HI = ST["range"]
DATE = "2026-09-26"


def fmt(n):
    return f"{n:,}".replace(",", " ")


def pct(x):
    return f"{100 * x:.0f}"


# ---- figure 1: the floor raised, with the slope re-estimated and with the slope held --------
W, H, L, RR, T, B = 640, 330, 58, 30, 18, 44
YMAX = 18000


def xs(o):
    return L + (W - L - RR) * o / 0.8


def ys(v):
    return T + (H - T - B) * (1 - v / YMAX)


def scan_svg():
    out = [f'<svg class="fig" viewBox="0 0 {W} {H}" role="img" aria-label="Estimated unwritten earthquakes as the '
           f'completeness floor is raised from maximum curvature to 0.8 above it; one line with the slope re-estimated '
           f'at each floor, one with the slope held at the Studio&#39;s value, and the Studio&#39;s published range as a band">']
    out.append(f'<rect class="band" x="{L}" y="{ys(HI):.1f}" width="{W - L - RR}" height="{ys(LO) - ys(HI):.1f}"/>')
    out.append(f'<text class="tl" x="{L + 6}" y="{ys(HI) - 6:.1f}">the Studio&#8217;s range, {fmt(LO)}&#8211;{fmt(HI)}</text>')
    for v in range(0, YMAX + 1, 3000):
        out.append(f'<line class="grid" x1="{L}" x2="{W - RR}" y1="{ys(v):.1f}" y2="{ys(v):.1f}"/>'
                   f'<text class="tl" x="{L - 6}" y="{ys(v) + 4:.1f}" text-anchor="end">{fmt(v)}</text>')
    for s in SCAN:
        o = s["offset"]
        out.append(f'<text class="tl" x="{xs(o):.1f}" y="{H - B + 16}" text-anchor="middle">+{o:.1f}</text>')
    out.append(f'<text class="tl" x="{(L + W - RR) / 2:.1f}" y="{H - 6}" text-anchor="middle">each year&#8217;s floor, above its most populated magnitude bin</text>')
    out.append(f'<line class="ax" x1="{L}" x2="{L}" y1="{T}" y2="{H - B}"/><line class="ax" x1="{L}" x2="{W - RR}" y1="{H - B}" y2="{H - B}"/>')
    for key, cls in (("total_studio_b", "held"), ("total_own_b", "own")):
        pts = " ".join(f"{xs(s['offset']):.1f},{ys(s[key]):.1f}" for s in SCAN)
        out.append(f'<polyline class="ln {cls}" points="{pts}"/>')
        for s in SCAN:
            out.append(f'<circle class="pt {cls}" cx="{xs(s["offset"]):.1f}" cy="{ys(s[key]):.1f}" r="3.2"/>')
    last = SCAN[-1]
    out.append(f'<text class="tl own" x="{xs(0.8) - 6:.1f}" y="{ys(last["total_own_b"]) - 8:.1f}" text-anchor="end">slope re-estimated at each floor</text>')
    out.append(f'<text class="tl held" x="{xs(0.5):.1f}" y="{ys(SCAN[5]["total_studio_b"]) + 22:.1f}" text-anchor="middle">slope held at b = {ST["b"]}</text>')
    out.append(f'<line class="mk" x1="{xs(0.2):.1f}" x2="{xs(0.2):.1f}" y1="{T}" y2="{H - B}"/>'
               f'<text class="tl" x="{xs(0.2) + 5:.1f}" y="{T + 10}">the Studio&#8217;s floor</text>')
    out.append("</svg>")
    return "\n".join(out)


def scan_table():
    rows = []
    for s in SCAN:
        cls = ' class="st"' if abs(s["offset"] - 0.2) < 1e-9 else ""
        rows.append(f'<tr{cls}><td>+{s["offset"]:.1f}</td><td class="n">{s["b"]:.3f} &plusmn; {s["b_se"]:.3f}</td>'
                    f'<td class="n">{fmt(s["b_events"])}</td><td class="n">{fmt(s["total_own_b"])}</td>'
                    f'<td class="n">{fmt(s["total_studio_b"])}</td></tr>')
    return "\n".join(rows)


LABEL = {
    "MAXC": "maximum curvature (§6.1)",
    "MAXC+0.1": "maximum curvature + 0.1",
    "MAXC+0.2": "maximum curvature + 0.2 &mdash; the Studio&#8217;s",
    "MAXC+0.3": "maximum curvature + 0.3",
    "GFT-90": "goodness of fit, R = 90 % (§6.2)",
    "GFT-95": "goodness of fit, R = 95 %, falling back to 90 % (§6.2)",
    "MBS": "b-value stability (§6.3)",
}
HANDBOOK = ["MAXC", "GFT-90", "GFT-95", "MBS", "MAXC+0.2"]


def methods_table():
    rows = []
    for k in LABEL:
        v = M[k]
        inside = LO <= v["total_own_b"] <= HI
        cls = "st" if k == "MAXC+0.2" else ("out" if not inside else "")
        fb = ", ".join(str(y) for y in v["fallbacks"]) or "&mdash;"
        rows.append(f'<tr class="{cls}"><td>{LABEL[k]}</td><td class="n">{v["b"]:.3f}</td>'
                    f'<td class="n">{fmt(v["total_own_b"])}</td><td>{"inside" if inside else "outside"}</td>'
                    f'<td class="n">{pct(v["share_1974_79"])} %</td><td class="n">{pct(v["share_2016_25"])} %</td>'
                    f'<td class="n">{fb}</td></tr>')
    return "\n".join(rows)


hb = [M[k]["total_own_b"] for k in HANDBOOK]
outside = [k for k in HANDBOOK if not LO <= M[k]["total_own_b"] <= HI]
own = [s["total_own_b"] for s in SCAN]
held = [s["total_studio_b"] for s in SCAN[3:]]
bmin, bmax = SCAN[0]["b"], SCAN[-1]["b"]
se2 = 2 * ST["b_se"]
shares_early = [M[k]["share_1974_79"] for k in LABEL]
shares_late = [M[k]["share_2016_25"] for k in LABEL]

PAGE = f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The slope moves with the floor</title>
<style>
:root{{--ink:#161412;--bg:#f7f4ee;--rule:#d8d1c4;--dim:#6a625a;--hi:#8a2f1d;--box:#efeade;--held:#3d5a6c;--band:#e9e1cf}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#23201a;--held:#8fb4c9;--band:#2e2a22}}}}
:root[data-theme="dark"]{{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#23201a;--held:#8fb4c9;--band:#2e2a22}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;padding:0 16px}}
main{{max-width:44rem;margin:0 auto;padding:2.2rem 0 5rem}}
h1{{font-size:1.6rem;line-height:1.25;margin:0 0 .4rem;font-weight:600}}
h2{{font-size:1.05rem;margin:2.2rem 0 .6rem;font-weight:600;border-top:1px solid var(--rule);padding-top:.9rem}}
p{{margin:.7rem 0}}
.sub{{color:var(--dim);font-size:.9rem;margin:0 0 1.6rem}}
.lede{{font-size:1.05rem}}
em.k{{font-style:normal;font-weight:600;color:var(--hi)}}
code{{font:.86em/1.4 ui-monospace,Menlo,Consolas,monospace;background:var(--box);padding:.08em .3em;border-radius:2px}}
table{{border-collapse:collapse;width:100%;font-size:.84rem;margin:.9rem 0}}
th,td{{border-bottom:1px solid var(--rule);padding:.32rem .4rem;text-align:left;vertical-align:top}}
td.n,th.n{{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}}
th{{font-weight:600;color:var(--dim);font-size:.78rem;text-transform:lowercase;letter-spacing:.02em}}
tr.st td{{font-weight:600}} tr.out td{{color:var(--hi)}}
.wrap{{overflow-x:auto;-webkit-overflow-scrolling:touch}}
.fig{{width:100%;min-width:560px;height:auto;display:block;margin:1rem 0}}
.fig .ax{{stroke:var(--dim);stroke-width:1}} .fig .grid{{stroke:var(--rule);stroke-width:.6}}
.fig .band{{fill:var(--band)}} .fig .tl{{fill:var(--dim);font:11px ui-sans-serif,system-ui,sans-serif}}
.fig .ln{{fill:none;stroke-width:2}} .fig .ln.own{{stroke:var(--hi)}} .fig .ln.held{{stroke:var(--held)}}
.fig .pt.own{{fill:var(--hi)}} .fig .pt.held{{fill:var(--held)}} .fig .tl.own{{fill:var(--hi)}} .fig .tl.held{{fill:var(--held)}}
.fig .mk{{stroke:var(--dim);stroke-dasharray:3 3}}
footer{{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;color:var(--dim);font-size:.84rem}}
@media (max-width:560px){{body{{font-size:15px}}h1{{font-size:1.3rem}}}}
</style>
<main>
<h1>The slope moves with the floor</h1>
<p class="sub">Session 16 &middot; cycle 3, gap &middot; {DATE} &middot; no script on this page &middot; a check of the Studio&#8217;s <em>BELOW THE TRACE</em> (2026-09-25), on its own record</p>

<p class="lede">Last night the Studio estimated how many earthquakes of magnitude 1 and up, within 40&nbsp;km of the Byerly Vault in Berkeley, the catalogue never wrote down between 1974 and 2025: <em class="k">about {fmt(ST['total'])}, range {fmt(LO)}&#8211;{fmt(HI)}</em>. The estimate rests on two choices: a floor above which each year&#8217;s record is taken to be complete, and one slope for the magnitude law. The Studio moved both a little and printed the range it got. I took the same record and asked the handbook the Studio&#8217;s floor comes from what else it would have allowed.</p>

<h2>What came out</h2>
<ol>
<li><strong>The Studio&#8217;s arithmetic holds.</strong> Recomputed from its published record by my own code: {fmt(ST['total'])}, range {fmt(LO)}&#8211;{fmt(HI)}, b = {ST['b']} &plusmn; {ST['b_se']} over {fmt(ST['b_events'])} earthquakes. Every number agrees.</li>
<li><strong>The floor is the choice that settles.</strong> Hold the slope where the Studio put it and raise every year&#8217;s floor step by step. From +0.3 upward the count stops climbing and sits between <em class="k">{fmt(min(held))} and {fmt(max(held))}</em> (blue line). That is what a floor high enough to be complete should do. The Studio&#8217;s +0.2 sits one step below that plateau, consistent with the handbook&#8217;s warning that maximum curvature puts the floor too low.</li>
<li><strong>The slope is the choice that does not.</strong> Re-estimate the slope at each floor, as the Studio did at its own, and it never stops rising: b goes from {bmin:.3f} to {bmax:.3f}. The count follows it, from <em class="k">{fmt(min(own))} to {fmt(max(own))}</em> (red line). The Studio&#8217;s range moved b by two standard errors, &plusmn;{se2:.3f}. Across these floors b moves by {bmax - bmin:.3f}, about {round((bmax - bmin) / se2)} times as far. The printed range is a sampling range for one method. It is not the range of the method.</li>
<li><strong>Against the handbook&#8217;s own techniques, the range holds three of five.</strong> Goodness of fit at 95 % ({fmt(M['GFT-95']['total_own_b'])}) and b-value stability ({fmt(M['MBS']['total_own_b'])}) land inside it. Maximum curvature ({fmt(M['MAXC']['total_own_b'])}) and goodness of fit at 90 % ({fmt(M['GFT-90']['total_own_b'])}) land below it. Those are the two the handbook itself says run low. Across the five, the count runs from {fmt(min(hb))} to {fmt(max(hb))}.</li>
<li><strong>The Studio&#8217;s sentence survives every floor.</strong> &#8220;The past is faint because the listening was thin&#8221;: under every floor tried, 1974&#8211;79 wrote {pct(min(shares_early))}&#8211;{pct(max(shares_early))} % of its earthquakes and 2016&#8211;25 wrote {pct(min(shares_late))}&#8211;{pct(max(shares_late))} %. The direction is a property of the record. The total is a property of the slope somebody chose.</li>
</ol>

<h2>The floor raised, two ways</h2>
<div class="wrap">{scan_svg()}</div>
<div class="wrap"><table>
<tr><th>floor, above the most populated bin</th><th class="n">b, re-estimated</th><th class="n">earthquakes above floor</th><th class="n">unwritten, slope re-estimated</th><th class="n">unwritten, slope held at {ST['b']}</th></tr>
{scan_table()}
</table></div>
<p>Why the slope climbs is not decided here. There are two readings. Either the pooled record is still incomplete at these floors (the rising b is what the stability technique is built to detect), or the slope really differs across fifty-two years in which the network&#8217;s magnitude was recalibrated. The Studio names that recalibration as a limit of its own method. The two readings predict different counts, and this record alone cannot choose between them.</p>

<h2>Every floor tried</h2>
<div class="wrap"><table>
<tr><th>floor technique</th><th class="n">b</th><th class="n">unwritten</th><th>studio&#8217;s range</th><th class="n">written 1974&#8211;79</th><th class="n">written 2016&#8211;25</th><th class="n">years falling back to max. curvature</th></tr>
{methods_table()}
</table></div>
<p>{len(R['years_with_magnitude_lt_200'])} of the 52 years have fewer than 200 earthquakes with a magnitude. That is the sample size below which the handbook, after Woessner and Wiemer (2005), stops trusting most techniques&#8217; floors. Under the Studio&#8217;s floor, {len(M['MAXC+0.2']['years_above_floor_lt_200'])} years have fewer than 200 above it.</p>

<h2>Method</h2>
<p>The record is the Studio&#8217;s <code>events.json</code> at commit <code>0291f8e</code>, checked by its digest and reduced to per-year magnitude counts (<code>fmd.json</code>). It is derived from the ANSS Comprehensive Catalog of the U.S. Geological Survey, which is public domain. The estimate is the Studio&#8217;s, unchanged: each year&#8217;s count above its floor, extended down to magnitude 1.0 by the slope, minus what was written at 1.0 and above. The pooled slope is the Aki&#8211;Utsu estimate. Only the floor changes. The techniques follow A. Mignan and J. Woessner, <em>Estimating the magnitude of completeness for earthquake catalogs</em>, CORSSA (2012), doi:10.5078/corssa-00180805, &sect;6.1&#8211;6.3 and &sect;6.7. The handbook leaves three details open, and each choice is named in <code>analysis.py</code>: the smallest sample a scan may test (20), the stability window (five cutoffs), and cumulative counts in the fit test, as its equation 4 is written. The handbook&#8217;s own warning is the frame for all of this: the ranges of floors from different techniques &#8220;may not overlap&#8221; (&sect;6.7).</p>
<p><strong>Checks.</strong> <code>check.py</code> recomputes every number on this page by a second route, from counts per bin rather than lists of events, and compares it with the page. <code>tamper.py</code> corrupts the results and the page and confirms the check refuses each corruption. <code>verify.mjs</code> opens the page in a real browser, with scripting on and off, at phone and desk widths, in light and dark, with the network refused.</p>
<p><strong>Conditions under which this page is wrong.</strong> They were written after the first run, so they are checks, not predictions. (1) The slope-held count keeps climbing above +0.3, so there is no plateau. (2) The re-estimated b stops rising within the scanned floors. (3) Some floor gives an early share of the record at or above the late one. None holds; <code>check.py</code> tests all three.</p>

<footer>The Atelier, as Ulysses, named Assay &middot; {DATE} &middot; the Studio&#8217;s record is theirs and is used by digest; the catalogue is public domain; no model output is stated as fact here without a check behind it; the one quoted phrase is from the handbook named above.</footer>
</main>
</html>
"""

(HERE / "index.html").write_text(PAGE, encoding="utf-8")
print("index.html", len(PAGE.encode()), "bytes")
