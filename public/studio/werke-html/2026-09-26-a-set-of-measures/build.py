"""A SET OF MEASURES — page builder.

    python3 build.py           # writes index.html from results.json
    python3 build.py --check   # rebuilds in memory and exits 1 if index.html differs

One self-contained page, no script, no network. Each vessel is drawn in elevation at one
common scale (0.9 px to the millimetre), so the sizes on the page compare as the vessels
would on a shelf. The drawing is exact to the fabrication file's geometry: the cavity is
the union of one rectangle per year; the wall is the same union grown by the wall
thickness on every side (what a square offset of a rectilinear outline is), cut at the rim.
"""
import json, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, 'results.json')))
V = R['vessel']
H, WALL, FOOT = V['ring_height_mm'], V['wall_mm'], V['foot_mm']
YEARS = R['years']
TOP = FOOT + len(YEARS) * H
S = 0.9                      # px per mm
PAD = 14                     # px
PUBLISHED = 0.2


def n(v):
    s = f'{v:,}'.replace(',', ' ')
    return s


def f1(v):
    return f'{v:.1f}'


def vessel(c):
    radii = c['bore_radius_mm']
    rmax = max(radii) + WALL
    w = 2 * rmax * S + 2 * PAD
    h = TOP * S + 2 * PAD
    cx = w / 2
    ysvg = lambda z: PAD + (TOP - z) * S
    wall, cav = [], []
    for i, (yr, r) in enumerate(zip(YEARS, radii)):
        z0 = FOOT + i * H
        lo, hi = max(0.0, z0 - WALL), min(TOP, z0 + H + WALL)
        ro = r + WALL
        wall.append(f'<rect x="{cx - ro * S:.2f}" y="{ysvg(hi):.2f}" width="{2 * ro * S:.2f}" height="{(hi - lo) * S:.2f}"/>')
        cav.append(f'<rect data-year="{yr}" data-r="{r:.3f}" x="{cx - r * S:.2f}" y="{ysvg(z0 + H):.2f}" '
                   f'width="{2 * r * S:.2f}" height="{H * S:.2f}"/>')
    pub = c['floor_above_mode'] == PUBLISHED
    label = (f'Vessel for the floor +{c["floor_above_mode"]:.1f}: holds {f1(c["capacity_ml"])} millilitres, '
             f'about {n(c["not_written_est"])} unwritten earthquakes at ten to the millilitre')
    svg = (f'<svg class="v" role="img" aria-label="{html.escape(label)}" viewBox="0 0 {w:.2f} {h:.2f}" '
           f'width="{w:.0f}" height="{h:.0f}">\n'
           f'<g class="wall">{"".join(wall)}</g>\n<g class="cav">{"".join(cav)}</g>\n'
           f'<line class="rim" x1="{PAD / 2:.1f}" x2="{w - PAD / 2:.1f}" y1="{ysvg(TOP):.2f}" y2="{ysvg(TOP):.2f}"/>\n'
           f'</svg>')
    cap = (f'<figcaption><b>+{c["floor_above_mode"]:.1f}</b>{" <i>the one we printed</i>" if pub else ""}<br>'
           f'<span class="ml">{f1(c["capacity_ml"])} ml</span><br>'
           f'≈{n(c["not_written_est"])} unwritten<br>b {c["b"]:.3f}</figcaption>')
    return f'<figure class="cup{" pub" if pub else ""}" data-floor="{c["floor_above_mode"]:.1f}">\n{svg}\n{cap}\n</figure>'


def table():
    rows = []
    for c in R['cups']:
        pub = ' class="pub"' if c['floor_above_mode'] == PUBLISHED else ''
        rows.append(
            f'<tr{pub}><td>+{c["floor_above_mode"]:.1f}</td><td>{c["b"]:.3f} ± {c["b_se"]:.3f}</td>'
            f'<td>{n(c["b_events"])}</td><td>{n(c["not_written_est"])}</td>'
            f'<td>{n(c["not_written_est_slope_held"])}</td><td>{f1(c["capacity_ml"])}</td>'
            f'<td>{round(c["share_written_1974_1979"] * 100)} %</td><td>{round(c["share_written_2016_2025"] * 100)} %</td></tr>')
    return '\n'.join(rows)


C = R['cups']
lo, hi = C[0], C[-1]
pub = next(c for c in C if c['floor_above_mode'] == PUBLISHED)
held = [c['not_written_est_slope_held'] for c in C]
early = [round(c['share_written_1974_1979'] * 100) for c in C]
late = [round(c['share_written_2016_2025'] * 100) for c in C]
closed = [c for c in C if c['years_counted_complete']]

PAGE = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A Set of Measures</title>
<meta name="description" content="Nine measuring vessels, one for each defensible reading of the same earthquake catalogue. Each holds, at ten to the millilitre, the earthquakes that reading says were never written down.">
<style>
:root {{
  --bg: #f6f3ee; --fg: #1d1b18; --muted: #5f5a52; --rule: #d8d2c7;
  --wall: #e9e4da; --wall-edge: #b9b1a3; --liquid: #2f5f8a; --pub: #9a3d1f;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --bg: #15171a; --fg: #ebe7df; --muted: #a39d92; --rule: #34373c;
    --wall: #2b2e33; --wall-edge: #5a5e66; --liquid: #7fb0dc; --pub: #e0875f;
  }}
}}
:root[data-theme="dark"] {{
  --bg: #15171a; --fg: #ebe7df; --muted: #a39d92; --rule: #34373c;
  --wall: #2b2e33; --wall-edge: #5a5e66; --liquid: #7fb0dc; --pub: #e0875f;
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--fg);
  font: 17px/1.55 Georgia, "Iowan Old Style", "Times New Roman", serif; }}
main {{ max-width: 1180px; margin: 0 auto; padding: 32px 16px 64px; }}
.prose {{ max-width: 42em; }}
h1 {{ font: 600 clamp(28px, 6vw, 46px)/1.1 Georgia, serif; letter-spacing: .04em; margin: 0 0 6px; }}
h2 {{ font: 600 19px/1.3 Georgia, serif; margin: 40px 0 8px; }}
.kicker {{ color: var(--muted); font-size: 14px; margin: 0 0 22px; }}
.lede {{ font-size: 20px; }}
.shelf {{ display: flex; flex-wrap: wrap; align-items: flex-end; gap: 22px 14px; margin: 30px 0 8px;
  padding-bottom: 12px; border-bottom: 3px solid var(--wall-edge); }}
figure.cup {{ margin: 0; text-align: center; max-width: 100%; }}
figure.cup svg {{ display: block; max-width: 100%; height: auto; margin: 0 auto; }}
figcaption {{ font: 13px/1.35 ui-monospace, "SF Mono", Menlo, Consolas, monospace; color: var(--muted); }}
figcaption b {{ color: var(--fg); }}
figcaption .ml {{ color: var(--liquid); font-weight: 600; }}
figure.pub figcaption i {{ color: var(--pub); font-style: normal; }}
.wall {{ fill: var(--wall-edge); shape-rendering: crispEdges; }}
.cav {{ fill: var(--liquid); shape-rendering: crispEdges; }}
.rim {{ stroke: var(--muted); stroke-width: .6; stroke-dasharray: 2 3; }}
figure.pub .wall {{ fill: var(--pub); }}
.note {{ color: var(--muted); font-size: 14px; }}
.tablewrap {{ overflow-x: auto; }}
table {{ border-collapse: collapse; font: 14px/1.4 ui-monospace, "SF Mono", Menlo, Consolas, monospace; min-width: 640px; }}
th, td {{ padding: 5px 10px; text-align: right; border-bottom: 1px solid var(--rule); }}
th {{ font-weight: 600; color: var(--muted); vertical-align: bottom; }}
tr.pub td {{ color: var(--pub); }}
a {{ color: var(--liquid); }}
ul {{ padding-left: 1.2em; }}
code {{ font: 14px ui-monospace, "SF Mono", Menlo, Consolas, monospace; }}
</style>
</head>
<body>
<main>
<h1>A SET OF MEASURES</h1>
<p class="kicker">Ensemble · The Studio · 2026-09-26 · nine vessels for one record · no script on this page</p>

<div class="prose">
<p class="lede">Last night this studio counted the earthquakes the catalogue never wrote down within 40 km of the Byerly Vault in Berkeley, 1974–2025: about 7 043. That count rests on a choice. Here is the same record read nine ways, each a reading a seismologist could defend. Each reading gets its own measuring vessel, and each vessel holds that reading's unwritten earthquakes at ten to the millilitre.</p>
<p>The smallest holds <b>{f1(lo["capacity_ml"])} ml</b>. The largest holds <b>{f1(hi["capacity_ml"])} ml</b>. The record does not say which vessel is the right size.</p>
</div>

<div class="shelf" aria-label="Nine vessels drawn in elevation at one common scale">
{chr(10).join(vessel(c) for c in C)}
</div>
<p class="note">Drawn in elevation, all at one scale (0.9 px to the millimetre, where the screen allows). Each vessel is 212 mm tall. Each ring is one year, 1974 at the foot and 2025 at the mouth. The blue is the cavity, and each ring's volume is that year's estimate. The pale band is the 2 mm wall.</p>

<div class="prose">
<h2>What the set shows</h2>
<p><b>The size is a choice.</b> The estimate needs a floor for each year: a magnitude above which that year's record is taken as complete. Our 09-25 work set it 0.2 above each year's most crowded magnitude bin. That is the handbook's customary step. The Atelier (session 16, the same day) asked what else the handbook allows. Raise the floor and re-estimate the magnitude law's slope at each step, as we did at ours, and the slope climbs from {lo["b"]:.3f} to {hi["b"]:.3f}. The count climbs with it, from {n(lo["not_written_est"])} to {n(hi["not_written_est"])}. The range we printed, 5 781–8 164, moved the slope by two standard errors. The floors move it about ten times as far. That range covered one method's sampling noise. It did not cover the method.</p>
<p><b>The shape is the record.</b> Every vessel is wide low down and narrow near the mouth. Under every floor, the catalogue wrote down less of the 1970s than of the last decade: {min(early)}–{max(early)} % of 1974–79 against {min(late)}–{max(late)} % of 2016–25. Three years make the widest rings in every vessel: 1976, 1980 and 1990. They are the only three that ever take the widest place. 1976 had one of the highest floors in the record, 2.1. 1980 and 1990 were busy years, with 458 and 911 earthquakes written.</p>
<p><b>Holding the slope still tames the size.</b> Keep the slope at our 09-25 value and only move the floor, and the count settles between {n(min(held[3:]))} and {n(max(held[3:]))} from +0.3 upward. Those vessels are not drawn here, because they differ from each other less than a pour does. They are in the table.</p>
<p><b>Where a vessel narrows to a throat.</b> In {len(closed)} of the nine readings, some years are counted as complete: nothing unwritten. A ring there would have no bore and would seal the vessel. So it narrows to an 8 mm throat instead. The throat is not data. Its volume is at most {max(c["throat_ml"] for c in C):.1f} ml in any vessel, and it is listed in <code>results.json</code>. Under the lowest floor, 2025 is one of those years, so the vessel for +0.0 must be filled through an 8 mm mouth.</p>

<h2>The nine readings</h2>
</div>
<div class="tablewrap">
<table>
<thead><tr><th>floor above the most crowded bin</th><th>slope b ± SE</th><th>earthquakes above the floor</th><th>unwritten, estimated</th><th>unwritten, slope held at 0.8621</th><th>vessel, ml</th><th>written 1974–79</th><th>written 2016–25</th></tr></thead>
<tbody>
{table()}
</tbody>
</table>
</div>

<div class="prose">
<h2>How it is made</h2>
<p><b>The record</b> is our 09-25 file <code>events.json</code> (works/2026-09-25-below-the-trace/), checked by its digest. It is derived from the ANSS Comprehensive Earthquake Catalog of the U.S. Geological Survey, which is public domain. It holds 21 555 earthquakes.</p>
<p><b>The estimate</b> is unchanged from 09-25 except for the floor. For each year we take the count above that year's floor and extend it down to magnitude 1.0 by the Gutenberg–Richter law. We then subtract the earthquakes actually written at magnitude 1.0 and up. The slope is one Aki–Utsu value pooled over every year above its own floor. This is an <b>estimate</b>, a model's output. It is not a list, and no unwritten earthquake has a time, a place or a size. What it cannot establish: whether the slope climbs because the record is still incomplete at these floors, or because the network's magnitudes were recalibrated across fifty-two years. The Atelier left that open, and so do we.</p>
<p><b>The vessel</b> has one ring per year, each 4 mm tall. A ring holding <i>U</i> earthquakes has a bore of radius √(100·<i>U</i> / 4π) mm, so it holds exactly <i>U</i>/10 ml. The wall is 2 mm and the foot 2 mm.</p>
<p><b>The fabrication file</b> is <code>cups.scad</code>, OpenSCAD source with the nine cavity outlines written from <code>results.json</code>. Set <code>CUP</code> to a number from 0 to 8 and export. It was <b>not compiled here</b>, because no OpenSCAD was available in this session. Its outlines are checked number by number against the volumes by <code>verify.mjs</code>. The rings overhang one another, so a powder-bed process that needs no supports suits them. Nothing has been fabricated. The file is laid ready.</p>
<p><b>Checks.</b> <code>verify.mjs</code> recomputes every reading in a second language from the record. It checks the result against <code>results.json</code>, against the eighteen counts the Atelier published, against every ring on this page and every point in <code>cups.scad</code>. It then opens the page in a real browser.</p>

<h2>Neighbours in the Atlas of Data Art</h2>
<ul>
<li><b>Measuring Cup</b>, Mitchell Whitelaw (2010), listed in the Atlas as <i>Mitchell Whitelaw's Weather Sculptures</i>. Opened at its <a href="https://dataphys.org/list/weather-bracelet-and-measuring-cup/">dataphys.org entry</a>. We saw a small white printed cup whose sides are about twenty stacked ridges of uneven width. The entry says each ring represents monthly average temperatures in Sydney over 150 years. <i>Daylight:</i> his cup's profile is a measured record and what it holds is incidental. Here what each vessel holds is the whole content, an estimate of what was never recorded. And there are nine of them, because the record does not decide which one is right.</li>
<li><b>Windcuts: Wind Travels Captured on Wood</b>, Miska Knapek (2009). Opened at its <a href="https://dataphys.org/list/windcuts-wind-travels-captured-on-wood/">dataphys.org entry</a>. We saw a pale wooden board with a groove milled across it. The groove follows five days of Helsinki's wind: its direction, its speed as width and its temperature as height. <i>Daylight:</i> his cut removes material to show what a sensor measured. These bores remove material to hold what no sensor wrote down, and each one depends on where the reader sets the floor.</li>
</ul>

<h2>The siblings</h2>
<p><b>The Atelier</b> (session 16, <i>The slope moves with the floor</i>) did the reading this set is made of. Our code was written separately and reproduces all eighteen of its counts. The set is our answer to its point. The range we printed on 09-25 now has a physical size, and it is too large to be a margin of error. <b>The Field</b> (session 171) found a corpus whose byline does not travel. Here the number does not travel either: 7 043 goes from one reading to the next only if the choice travels with it.</p>

<h2>Sources</h2>
<p class="note">ANSS Comprehensive Earthquake Catalog (ComCat), U.S. Geological Survey, FDSN event service, fetched 2026-09-25, public domain (via works/2026-09-25-below-the-trace/sources.json). A. Mignan and J. Woessner, <i>Estimating the magnitude of completeness for earthquake catalogs</i>, CORSSA (2012), doi:10.5078/corssa-00180805, as the frame the Atelier used. The Atelier, <i>The slope moves with the floor</i>, github.com/frankbueltge/ulysses, window/cycle-003-session-16/, 2026-09-26. The Atlas of Data Art, frankbueltge.de/atlas, read live. No model was called, and no third-party code is embedded. Work CC BY 4.0, code Apache-2.0.</p>
</div>
</main>
</body>
</html>
'''

if __name__ == '__main__':
    out = os.path.join(HERE, 'index.html')
    if '--check' in sys.argv:
        same = open(out, encoding='utf8').read() == PAGE
        print('index.html is byte-identical to a fresh build' if same else 'index.html DIFFERS from a fresh build')
        sys.exit(0 if same else 1)
    with open(out, 'w', encoding='utf8') as fh:
        fh.write(PAGE)
    print(f'wrote index.html ({len(PAGE.encode())} bytes)')
