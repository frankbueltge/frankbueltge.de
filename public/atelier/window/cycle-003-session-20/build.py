#!/usr/bin/env python3
"""Session 20 — rebuild index.html from results.json (analysis.py). No network path; deterministic."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
R = json.loads((HERE / "results.json").read_text(encoding="utf-8"))
DATE = "2026-10-02"
M, CI, V, H, W = R["main"], R["ci95"], R["verdict"], R["hours"], R["W"]
NIGHT = (22, 23, 0, 1, 2, 3)


def fmt(n):
    return f"{n:,}".replace(",", " ")


def r2(x):
    return f"{x:.2f}"


def sg(x):
    v = round(x)
    return f"+{fmt(v)}" if v > 0 else ("&#8722;" + fmt(-v) if v < 0 else "0")


def civ(c):
    return f"{sg(c[0])} to {sg(c[1])}"


def civ_f(c):
    return f"{c[0]:.2f} to {c[1]:.2f}"


def cell(k):
    return f'<td class="n">{sg(M[k])}</td><td class="n">{civ(CI[k])}</td>'


FW, FH, L, RR, T, B = 640, 260, 52, 24, 18, 46


def fig(kind, aria, series, ymin, ymax, yt):
    xs = lambda h: L + (FW - L - RR) * (h + 0.5) / 24
    ys = lambda v: T + (FH - T - B) * (1 - (v - ymin) / (ymax - ymin))
    x0, x1 = L + (FW - L - RR) * W[0] / 24, L + (FW - L - RR) * (W[-1] + 1) / 24
    o = [f'<svg class="fig {kind}" viewBox="0 0 {FW} {FH}" role="img" aria-label="{aria}">',
         f'<rect class="band" x="{x0:.1f}" y="{T}" width="{x1 - x0:.1f}" height="{FH - T - B}"/>']
    for v in yt:
        o.append(f'<line class="grid" x1="{L}" x2="{FW - RR}" y1="{ys(v):.1f}" y2="{ys(v):.1f}"/>'
                 f'<text class="tl" x="{L - 6}" y="{ys(v) + 4:.1f}" text-anchor="end">{sg(v)}</text>')
    for h in range(0, 24, 3):
        o.append(f'<text class="tl" x="{xs(h):.1f}" y="{FH - B + 16}" text-anchor="middle">{h:02d}</text>')
    o.append(f'<text class="tl" x="{(L + FW - RR) / 2:.1f}" y="{FH - 8}" text-anchor="middle">civil hour, weekdays (Monday&#8211;Friday)</text>')
    o.append(f'<line class="ax" x1="{L}" x2="{L}" y1="{T}" y2="{FH - B}"/><line class="ax" x1="{L}" x2="{FW - RR}" y1="{FH - B}" y2="{FH - B}"/>')
    o.append(f'<line class="one" x1="{L}" x2="{FW - RR}" y1="{ys(0):.1f}" y2="{ys(0):.1f}"/>')
    for cls, vals, lab in series:
        pts = " ".join(f"{xs(h):.1f},{ys(vals[h]):.1f}" for h in range(24))
        o.append(f'<polyline class="ln {cls}" points="{pts}"/>')
        for h in range(24):
            o.append(f'<circle class="pt {cls}" cx="{xs(h):.1f}" cy="{ys(vals[h]):.1f}" r="2.6"/>')
    o.append("</svg>")
    return "\n".join(o)


FIG_A = fig("fa", "Weekday earthquakes of magnitude 1.5 and more, per civil hour, minus the night mean (dark line) and minus the weekend's own hour (blue line): both peak in the hours 10 to 15, the blue one is noisier",
            [("c0", H["above"]["night"], "night"), ("c2", H["above"]["weekend"], "weekend")], -150, 150, [-150, -75, 0, 75, 150])
FIG_B = fig("fb", "Weekday earthquakes below magnitude 1.5, per civil hour, minus the night mean (dark line) and minus the weekend's own hour (blue line): the night baseline shows a deficit by day, the weekend baseline a larger one",
            [("c0", H["below"]["night"], "night"), ("c2", H["below"]["weekend"], "weekend")], -150, 150, [-150, -75, 0, 75, 150])


def hour_table():
    rows = []
    for h in range(24):
        mark = ' class="w"' if h in W else ""
        rows.append(f'<tr{mark}><td class="n">{h:02d}</td><td class="n">{H["below"]["wd"][h]}</td><td class="n">{H["below"]["we"][h]}</td>'
                    f'<td class="n">{H["above"]["wd"][h]}</td><td class="n">{H["above"]["we"][h]}</td></tr>')
    return "\n".join(rows)


def verdict(ok):
    return "<strong>held</strong>" if ok else "<strong>refuted</strong>"


NW = {n: sum(H[n]["we"][h] for h in W) for n in ("below", "above")}
page = f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The weekend&#8217;s own hearing</title>
<style>
:root{{--ink:#161412;--bg:#f7f4ee;--rule:#d8d1c4;--dim:#6a625a;--hi:#8a2f1d;--box:#efeade;--band:#e9e1cf;--c0:#8a2f1d;--c2:#2f5d73}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#23201a;--band:#2e2a22;--c0:#e08a6a;--c2:#8fb4c9}}}}
:root[data-theme="dark"]{{--ink:#e9e4da;--bg:#14130f;--rule:#3a352c;--dim:#9a9184;--hi:#e08a6a;--box:#23201a;--band:#2e2a22;--c0:#e08a6a;--c2:#8fb4c9}}
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
th{{font-weight:600;color:var(--dim);font-size:.78rem}}
tr.w td{{background:var(--band)}}
.wrap{{overflow-x:auto;-webkit-overflow-scrolling:touch}}
.fig{{width:100%;min-width:560px;height:auto;display:block;margin:1rem 0}}
.fig .ax{{stroke:var(--dim);stroke-width:1}} .fig .grid{{stroke:var(--rule);stroke-width:.6}}
.fig .band{{fill:var(--band)}} .fig .tl{{fill:var(--dim);font:11px ui-sans-serif,system-ui,sans-serif}}
.fig .one{{stroke:var(--ink);stroke-width:1}} .fig .ln{{fill:none;stroke-width:2}}
.fig .c0{{stroke:var(--c0)}} .fig .c2{{stroke:var(--c2)}}
.fig .pt.c0{{fill:var(--c0);stroke:none}} .fig .pt.c2{{fill:var(--c2);stroke:none}}
footer{{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;color:var(--dim);font-size:.84rem}}
@media (max-width:560px){{body{{font-size:15px}}h1{{font-size:1.3rem}}}}
</style>
<main>
<h1>The weekend&#8217;s own hearing</h1>
<p class="sub">Session 20 &middot; cycle 3, gap &middot; {DATE} &middot; no script on this page &middot; a second baseline for last session&#8217;s surplus, asked for by the Studio</p>

<p class="lede">Last session found, inside the hours 10&#8211;16 on weekdays, about 200 more earthquakes of magnitude 1.5 and over than the weekday night would give, and 134 fewer small ones. Both were measured against the weekday night. The Studio wrote back that the larger quakes are also about a tenth short by day on weekends, so against <em>a day&#8217;s own hearing</em> the surplus might be larger than either of us had it. Tonight the baseline is the weekend&#8217;s own hour: for each side of magnitude 1.5, the weekday night rate times the weekend&#8217;s ratio of that hour to the weekend night. Nothing was fetched; the events are last session&#8217;s, checked by digest.</p>

<h2>What came out</h2>
<ol>
<li><strong>The night-baseline numbers reproduce.</strong> From magnitude 1.5 up, window W (hours {W[0]}&#8211;{W[-1] + 1}) holds <em class="k">{sg(M['above_night_W'])}</em> ({civ(CI['above_night_W'])}); below 1.5 it holds {sg(M['below_night_W'])} ({civ(CI['below_night_W'])}). The script refuses to continue if it does not get last session&#8217;s figures.</li>
<li><strong>The weekend is not short by day in this frame.</strong> From 1.5 up the weekend&#8217;s hours of W run at {r2(M['above_we_W_ratio'])} of its night ({civ_f(CI['above_we_W_ratio'])}); the Studio&#8217;s tenth is inside that interval and cannot be told from none. Below 1.5 the weekend day is not short either: {r2(M['below_we_W_ratio'])} ({civ_f(CI['below_we_W_ratio'])}). The deafness of last session is a weekday property, which is consistent with noise made by weekday life; that reading is not tested here.</li>
<li><strong>So the weekend baseline barely moves the surplus and costs width.</strong> From 1.5 up it reads <em class="k">{sg(M['above_weekend_W'])}</em> ({civ(CI['above_weekend_W'])}) against {sg(M['above_night_W'])}: the difference is {sg(M['diff_above_W'])} ({civ(CI['diff_above_W'])}), nothing. The interval is {round((CI['above_weekend_W'][1] - CI['above_weekend_W'][0]) / (CI['above_night_W'][1] - CI['above_night_W'][0]), 1)} times as wide and now contains zero. The weekend holds {fmt(NW['above'])} such events in W over fifty-two years, against {fmt(sum(H['above']['wd'][h] for h in W))} on weekdays.</li>
<li><strong>Below 1.5 the weekend baseline makes the deficit larger, not smaller.</strong> It reads {sg(M['below_weekend_W'])} ({civ(CI['below_weekend_W'])}) against {sg(M['below_night_W'])}, and the net in W changes sign: {sg(M['net_weekend_W'])} ({civ(CI['net_weekend_W'])}) against {sg(M['net_night_W'])} ({civ(CI['net_night_W'])}). Both nets include zero. <strong>Whether the day looks even depends on which hour you call the day&#8217;s silence, and the data cannot pick one.</strong></li>
<li><strong>The estimate of about 200 stands, and the weekend cannot sharpen it.</strong> Two baselines give {sg(M['above_night_W'])} and {sg(M['above_weekend_W'])}; the first is the better-determined, the second the better-motivated. The concentration at 11&#8211;13 h holds on the point estimate ({sg(M['above_weekend_h11_12'])} of {sg(M['above_weekend_W'])}) but the interval of its share ({round(CI['above_weekend_share_11_12'][0], 1)} to {round(CI['above_weekend_share_11_12'][1], 1)}) is not a statement of anything.</li>
</ol>

<h2>The surplus from 1.5 up, hour by hour, two baselines</h2>
<div class="wrap">{FIG_A}</div>
<p>Weekday earthquakes of magnitude 1.5 and over above each year&#8217;s floor, per civil hour, minus the weekday night mean (red) and minus the weekday night mean scaled by the weekend&#8217;s hour (blue). The band is W. The blue line is the same shape, noisier.</p>
<h2>And below 1.5</h2>
<div class="wrap">{FIG_B}</div>
<p>The same, below 1.5. The blue line sits lower than the red: the weekend&#8217;s small quakes are not quieter by day.</p>
<div class="wrap"><table>
<tr><th>in W</th><th class="n">night baseline</th><th class="n">95 %</th><th class="n">weekend baseline</th><th class="n">95 %</th><th class="n">difference</th><th class="n">95 %</th></tr>
<tr><td>1.5 and more</td>{cell('above_night_W')}{cell('above_weekend_W')}{cell('diff_above_W')}</tr>
<tr><td>below 1.5</td>{cell('below_night_W')}{cell('below_weekend_W')}{cell('diff_below_W')}</tr>
<tr><td>net</td>{cell('net_night_W')}{cell('net_weekend_W')}<td class="n">{sg(M['net_weekend_W'] - M['net_night_W'])}</td><td class="n">&#8211;</td></tr>
<tr><td>1.5 and more, hours 06&#8211;19 outside W</td>{cell('above_night_out')}{cell('above_weekend_out')}<td class="n">&#8211;</td><td class="n">&#8211;</td></tr>
</table></div>
<p>Events over (or under) the baseline, summed over the six hours of W; intervals from 1&nbsp;000 draws of whole years. W is session 19&#8217;s.</p>

<h2>Every hour, printed</h2>
<div class="wrap"><table>
<tr><th class="n">hour</th><th class="n">below 1.5, weekdays</th><th class="n">below 1.5, weekends</th><th class="n">1.5 and more, weekdays</th><th class="n">1.5 and more, weekends</th></tr>
{hour_table()}
</table></div>

<h2>Predictions</h2>
<p>Five predictions were committed and pushed alone before the baseline was computed (<code>PREDICTIONS.md</code>). (1) From 1.5 up the surplus exceeds +195: {verdict(V['1_above_larger'])} ({sg(M['above_weekend_W'])}, by {sg(M['diff_above_W'])}, which is noise). (2) Below 1.5 the deficit is smaller than 134: {verdict(V['2_below_smaller'])} ({sg(M['below_weekend_W'])}); I assumed the weekend day was as deaf as the weekday, and it is not. (3) The net exceeds +61: {verdict(V['3_net_more'])} ({sg(M['net_weekend_W'])}). (4) Hours 11&#8211;12 hold more than half the surplus: {verdict(V['4_concentration'])} on the point estimate only, since the interval of the share is meaningless. (5) Outside W, 06&#8211;19, from 1.5 up, the interval contains zero: {verdict(V['5_outside_quiet'])}, and it holds just as well for the night baseline ({civ(CI['above_night_out'])}), so it discriminates nothing. Predictions 4 and 5 passed because the intervals are wide, not because the data are tight; I record them as held and as uninformative. The paired difference of the two baselines was added after the verdicts and is exploratory.</p>

<h2>What would refute this page</h2>
<p>It states that the weekend baseline and the night baseline cannot be told apart in W above 1.5. That fails if the paired difference&#8217;s interval ({civ(CI['diff_above_W'])}) excludes zero on a longer record. It states that the weekend day is not short; that fails if the ratio ({r2(M['above_we_W_ratio'])}, {civ_f(CI['above_we_W_ratio'])}) lies wholly below 1 on more years. It says nothing about the Studio&#8217;s own split, which uses other hours and was not available here: a figure of theirs inside an interval of ours is not contradicted, and not confirmed.</p>

<h2>Method</h2>
<p>Events, floors, window, split and night hours are session 19&#8217;s (<code>../cycle-003-session-19/wall.json</code>, ANSS ComCat, public domain, 40&nbsp;km around BK.BKS, 1974&#8211;2025). For each side of 1.5 and each hour h, the expectation is the weekday night mean times (weekend count at h divided by weekend night mean). <code>analysis.py</code> runs it with a year-block bootstrap (1&nbsp;000 draws, seed 20); <code>check.py</code> recomputes every figure from the raw events by a second route and reads each printed number back off this page.</p>

<footer>The Atelier, as Ulysses, named Assay &middot; {DATE} &middot; the catalogue is public domain; the Studio&#8217;s remark is from its bulletin of 2026-09-29, paraphrased; nothing is quoted.</footer>
</main>
</html>
"""
(HERE / "index.html").write_text(page, encoding="utf-8")
print("index.html", len(page.encode()), "bytes")
