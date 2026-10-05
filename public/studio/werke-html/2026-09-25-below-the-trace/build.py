"""BELOW THE TRACE — build.

    python3 build.py            # writes index.html from events.json + results.json
    python3 build.py --check    # rebuilds in memory, fails unless byte-identical

The page is one file: no network, no library, no script. The drum is one SVG,
one row per year, drawn the way a helicorder drum is read: time runs left to
right across the year, each written earthquake is a stroke up from the row's
line in proportion to its magnitude, and an earthquake the catalogue wrote down
with no magnitude is a small open ring on the line — its moment is known, its
size is not. Each row's ink is as strong as the estimated share of that year's
M >= 1.0 earthquakes the catalogue wrote down. The ones it did not write have
no moment, so they are not drawn anywhere; they are counted at the row's end.
"""
import json, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json')))['events']
R = json.load(open(os.path.join(HERE, 'results.json')))

# drum geometry (SVG user units)
W, LEFT, RIGHT = 1000, 46, 150
ROW = 26
TOP = 14
SPIKE = 4.4          # units of height per magnitude unit


def fmt(n):
    return f'{n:,}'.replace(',', ' ')


def spike_h(m):
    return round(max(0.8, m * SPIKE), 1)


def drum():
    years = R['years']
    plot = W - LEFT - RIGHT
    H = TOP + ROW * len(years) + 16
    out = [f'<svg class="drum" viewBox="0 0 {W} {H}" role="img" aria-labelledby="drum-t drum-d">',
           '<title id="drum-t">Fifty-two years of written earthquakes within 40 km of the Byerly Vault, one row per year</title>',
           '<desc id="drum-d">Each row is one year, 1974 at the top and 2025 at the bottom. Strokes rise from each row\'s '
           'line at the moment of each earthquake the catalogue wrote down, taller for larger magnitudes; open rings '
           'mark earthquakes written with no magnitude. Rows are faint where the catalogue wrote down a small share of '
           'the year\'s magnitude-one earthquakes. At the right end of each row: the count written, and the estimated '
           'count not written.</desc>']
    by_year = {}
    for y, f, m in E:
        by_year.setdefault(y, []).append((f, m))
    for i, row in enumerate(years):
        y = row['year']
        base = TOP + ROW * (i + 1) - 6
        op = f"{row['share_written_est']:g}"
        path, rings = [], []
        for f, m in by_year.get(y, []):
            x = round(LEFT + f * plot, 1)
            if m is None:
                rings.append(f'<circle cx="{x}" cy="{base}" r="1.6"/>')
            else:
                path.append(f'M{x} {base}v-{spike_h(m)}')
        out.append(f'<g class="yr" data-year="{y}">')
        out.append(f'<text class="yl" x="{LEFT - 8}" y="{base}" text-anchor="end">{y}</text>')
        out.append(f'<line class="base" x1="{LEFT}" y1="{base}" x2="{W - RIGHT}" y2="{base}" style="opacity:{op}"/>')
        out.append(f'<path class="ink" style="opacity:{op}" d="{"".join(path)}"/>')
        if rings:
            out.append(f'<g class="ring">{"".join(rings)}</g>')
        nw = row['not_written_m1_est']
        out.append(f'<text class="cnt" x="{W - RIGHT + 8}" y="{base}">{fmt(row["written_m1"])}'
                   f'<tspan class="miss"> · ≈{fmt(nw)}</tspan></text>')
        out.append('</g>')
    out.append(f'<text class="hd" x="{W - RIGHT + 8}" y="{TOP - 2}">written · not (est.)</text>')
    out.append(f'<text class="hd" x="{LEFT}" y="{H - 3}">1 January</text>')
    out.append(f'<text class="hd" x="{W - RIGHT}" y="{H - 3}" text-anchor="end">31 December</text>')
    out.append('</svg>')
    return '\n'.join(out)


def table():
    rows = []
    for r in R['years']:
        lo, hi = r['not_written_m1_range']
        rows.append(f'<tr><td>{r["year"]}</td><td>{fmt(r["events"])}</td><td>{r["no_magnitude"] or ""}</td>'
                    f'<td>{r["mc"]:.1f}</td><td>{fmt(r["written_m1"])}</td>'
                    f'<td>≈{fmt(r["not_written_m1_est"])}</td><td>{fmt(lo)}–{fmt(hi)}</td>'
                    f'<td>{round(100 * r["share_written_est"])} %</td></tr>')
    return '\n'.join(rows)


def decade_share(a, b):
    ys = [r for r in R['years'] if a <= r['year'] <= b]
    w = sum(r['written_m1'] for r in ys)
    n = sum(r['not_written_m1_est'] for r in ys)
    return w, n, round(100 * w / (w + n))


def page():
    s70 = decade_share(1974, 1979)
    s20 = decade_share(2016, 2025)
    nm = [r for r in R['years'] if 2001 <= r['year'] <= 2007]
    nm_sum = sum(r['no_magnitude'] for r in nm)
    lo, hi = R['not_written_total_range']
    css = CSS
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BELOW THE TRACE</title>
<meta name="description" content="Fifty-two years of the earthquakes a catalogue wrote down under the Hayward Fault, and an estimate, marked as one, of the ones it did not.">
<style>{css}</style>
</head>
<body>
<header>
<h1>BELOW THE TRACE</h1>
<p class="strap">The earthquakes under Berkeley that the record never wrote down — and the record, drawn so that you can see where it was listening.</p>
</header>

<p>In 1998 Ken Goldberg, with Wojciech Matusik, put the live signal of one seismometer, in the Byerly Vault under the Berkeley
hills, several hundred yards from the Hayward Fault, on a black screen as a white trace that fades as it
crosses — <em>Memento Mori</em>, an interface with the Earth; in 2001 it became a darkened room with a resonating floor. What fades there is time: every trace is
overwritten by the next.</p>

<p>This page draws the other record the same ground keeps: the catalogue. Every earthquake within 40 km of
that vault that the regional network located and wrote down from 1974 to 2025 — {fmt(R["events"])} of them — one
row per year, the way a seismologist's paper drum is read. Here, too, some rows are faint. But what fades
here is not time. <strong>Each row is only as dark as the share of that year's earthquakes the catalogue
managed to write down</strong>, and the rest were never written at all.</p>

<figure>
<div class="drumwrap">
{drum()}
</div>
<figcaption>One row per year; time runs left to right from 1 January to 31 December. A stroke is an
earthquake written down, its height set by its magnitude (the tallest, 24 August 2014, is the South Napa
earthquake, M 6.0). A small ring on the line is an earthquake written down <em>with no magnitude</em>. Row
ink is the estimated share of that year's M&nbsp;≥&nbsp;1.0 earthquakes that were written. At the right:
written M&nbsp;≥&nbsp;1.0, and ≈ the estimated number not written. The unwritten ones have no moment and no
place; they are counted, never drawn. On a narrow screen the drum scrolls sideways.</figcaption>
</figure>

<h2>What the drum shows</h2>
<ul>
<li><strong>The past is faint because the listening was thin, not because it is past.</strong> In
1974–1979 the catalogue wrote down {fmt(s70[0])} earthquakes of magnitude 1.0 or more; by its own
magnitude law it should hold about {fmt(s70[0] + s70[1])}. It wrote about <strong>{s70[2]} %</strong>. In
2016–2025 it wrote {fmt(s20[0])} of about {fmt(s20[0] + s20[1])} — <strong>{s20[2]} %</strong>. The ground did not
get busier. The network got denser.</li>
<li><strong>Over the whole record: {fmt(R["written_m1_total"])} written, about {fmt(R["not_written_total_est"])} not</strong>
(the method's own sensitivity range is {fmt(lo)} to {fmt(hi)}). Almost all of them are far too small to feel; they are missing because the catalogue's floor sat above them, not because nothing happened.</li>
<li><strong>A second kind of missing sits on the line itself.</strong> {fmt(R["events_no_magnitude"])}
earthquakes were written down with a moment and a place and <em>no size</em> — and {fmt(nm_sum)} of
them fall in the seven years 2001–2007. Look for the rings; they cluster in those rows and almost
nowhere else. Their size was not lost from this page — it is not in the catalogue.</li>
</ul>

<h2>How the unwritten ones are counted — and why that count is an estimate</h2>
<p>Earthquakes obey, very reliably, a law of proportions: for every earthquake of one magnitude there are
several of the magnitude below it (in this record about {10 ** R['b']:.1f}) — the Gutenberg–Richter law, <span class="mono">log N = a − b M</span>.
A catalogue keeps to that law down to the smallest size its network hears reliably, its
<em>completeness magnitude</em>, and below that floor its counts fall away. So each year's own counts above
its own floor say how many there should be below it.</p>
<ol>
<li><strong>The floor, per year:</strong> the most populated 0.1-magnitude bin, plus 0.2 (the
maximum-curvature method with its customary correction). It runs from 2.1 in the mid-1970s to 0.9–1.3
in the last decade.</li>
<li><strong>The law's slope, once:</strong> b = {R["b"]:.3f} ± {R["b_se"]:.3f}, the Aki–Utsu
maximum-likelihood value pooled over all {fmt(R["b_events"])} earthquakes above their own year's floor.</li>
<li><strong>The estimate:</strong> each year's count above its floor, extended down to magnitude 1.0 by
that slope, minus the count it actually wrote at 1.0 and above. A year whose floor is already at or below
1.0 counts as complete.</li>
<li><strong>The range:</strong> the same, with every floor moved 0.1 up and down and the slope moved two
standard errors either way — nine combinations, lowest and highest total shown.</li>
</ol>
<p class="note"><strong>What this cannot establish.</strong> The count of unwritten earthquakes is a model's
extrapolation, not a list; no single unwritten earthquake is known. It assumes one slope for fifty-two
years, although the network's duration magnitude has been recalibrated over that time; single years with
a swarm or an aftershock sequence (1990, 2015, 2025) push their own floor up and their estimate with it.
The magnitude-less events are the catalogue's as served on 25 September 2026; a later revision may give
them sizes. None of this says anything about seismic hazard.</p>

<details>
<summary>Every year, in numbers</summary>
<div class="scroll"><table>
<thead><tr><th>year</th><th>written</th><th>no size</th><th>floor Mc</th><th>written M≥1</th><th>not written (est.)</th><th>range</th><th>share written</th></tr></thead>
<tbody>
{table()}
</tbody></table></div>
</details>

<h2>Nearest works, and the daylight</h2>
<p><strong><em>Memento Mori: an Interface With the Earth</em> — Ken Goldberg (web version 1998, installation 2001; Atlas, time &amp;
archive).</strong> Opened on 25 September 2026 at its Atlas address (Rhizome ArtBase, Q1351), whose
description names the live signal from the Hayward Fault, the darkened room, the resonating platform and
the heart-monitor trace that decays left to right to black; and in the university's 1998 notice of the web
version, which names the vault, the STS-1 seismometer, and a white trace that fades until it is
overwritten. <em>Daylight:</em> his trace fades by elapsed time and shows one instrument's continuous
signal; this drum fades by the measured share of each year's earthquakes the catalogue failed to write,
and shows the record made from that signal and its neighbours — including the earthquakes it holds no
trace of at all.</p>
<p><strong><em>Beyond Resolution</em> — Rosa Menkman (2020; Atlas, error &amp; noise).</strong> Named, not
opened tonight, as the nearest by argument: an institute for resolutions as compromises inscribed into
every image standard. <em>Daylight:</em> the compromise here is not a format's but a network's, and it
is dated year by year and counted in earthquakes, not rendered as an image.</p>

<h2>Sources</h2>
<p>Catalogue: ANSS Comprehensive Earthquake Catalog (ComCat), U.S. Geological Survey, FDSN event service,
queried 25 September 2026 for every earthquake within 40 km of BK.BKS (37.876221 N, 122.23558 W; station
metadata from the Northern California Earthquake Data Center), one request per year; the requests and the
SHA-256 digest of every response are in <span class="mono">sources.json</span>. USGS catalogue data are in
the public domain. The compact record this page is drawn from is <span class="mono">events.json</span>;
every number is recomputed a second time, in another language, by <span class="mono">verify.mjs</span>.
Three entries of the query fall before 1974 and are excluded; the record for this circle begins in 1974.</p>

<footer>BELOW THE TRACE · The Studio (Ensemble) · 25 September 2026 · text CC BY 4.0, code Apache-2.0 ·
no model output is published as fact on this page; the one estimate is labelled wherever it appears.</footer>
</body>
</html>
'''


CSS = '''
:root{color-scheme:light dark;--bg:#f6f5f1;--fg:#1b1b1a;--ink:#141414;--dim:#6a6a66;--miss:#9a3b24;--rule:#cfcdc6;--ring:#9a3b24}
@media (prefers-color-scheme:dark){:root{--bg:#0b0c0b;--fg:#e6e6e2;--ink:#e9f0e6;--dim:#8f948d;--miss:#e08a6c;--rule:#2d302c;--ring:#e08a6c}}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:17px/1.6 Georgia,'Iowan Old Style',serif;margin:0 auto;max-width:980px;padding:2.4rem 16px 5rem}
h1{font-size:2rem;letter-spacing:.06em;margin:0 0 .2em}
h2{font-size:1.15rem;border-bottom:1px solid var(--rule);padding-bottom:.3em;margin-top:2.6em}
.strap{font-style:italic;color:var(--dim);margin-top:0}
figure{margin:2em 0}
.drumwrap{overflow-x:auto}
.drum{width:100%;min-width:720px;height:auto;display:block}
.drum .ink{stroke:var(--ink);stroke-width:.9;fill:none}
.drum .base{stroke:var(--ink);stroke-width:.5}
.drum .ring circle{fill:none;stroke:var(--ring);stroke-width:.8}
.drum text{font:9px ui-monospace,Menlo,Consolas,monospace;fill:var(--dim)}
.drum .cnt{fill:var(--fg)}
.drum .miss{fill:var(--miss)}
.drum .hd{font-style:italic}
figcaption{font-size:.85em;color:var(--dim)}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9em}
.note{border-left:3px solid var(--miss);padding-left:1em}
li{margin:.6em 0}
details{margin:1.6em 0}
summary{cursor:pointer}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;margin:1em 0}
th,td{border-bottom:1px solid var(--rule);padding:.25em .5em;text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left}
footer{margin-top:3em;padding-top:1em;border-top:1px solid var(--rule);font-size:.8em;color:var(--dim)}
'''

if __name__ == '__main__':
    text = page()
    path = os.path.join(HERE, 'index.html')
    if '--check' in sys.argv:
        same = open(path, encoding='utf-8').read() == text
        print('byte-identical' if same else 'DIFFERS')
        sys.exit(0 if same else 1)
    open(path, 'w', encoding='utf-8').write(text)
    print(f'wrote index.html ({len(text.encode()):,} bytes)')
