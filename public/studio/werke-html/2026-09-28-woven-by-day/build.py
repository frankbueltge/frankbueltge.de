"""WOVEN BY DAY — page builder.

    python3 build.py           # writes index.html from results.json and cloth.wif
    python3 build.py --check   # rebuilds in memory and exits 1 if index.html differs

One self-contained page, no script, no network. The cloth is drawn from the lift plan in
cloth.wif, point for point: one SVG unit is one crossing of one end and one pick; a run of
picks woven dark or red is one rectangle of a path. Nothing on the cloth is smoothed.
"""
import json, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, 'results.json')))
C = R['cloth']
ENDS, PICKS = C['ends'], C['picks']


def n(v):
    return f'{v:,}'.replace(',', ' ')


def read_wif():
    sec, lift, wc = None, {}, {}
    for line in open(os.path.join(HERE, 'cloth.wif')):
        line = line.strip()
        if line.startswith('['):
            sec = line[1:-1]
            continue
        if '=' not in line:
            continue
        k, v = line.split('=', 1)
        if sec == 'LIFTPLAN':
            lift[int(k)] = set(int(x) for x in v.split(',') if x)
        elif sec == 'WEFT COLORS':
            wc[int(k)] = int(v)
    grid = []  # top row first
    for p in range(PICKS, 0, -1):
        grid.append([0 if e in lift[p] else wc[p] for e in range(1, ENDS + 1)])
    return grid


def paths(grid):
    d = {2: [], 3: []}
    for y, row in enumerate(grid):
        x = 0
        while x < ENDS:
            c = row[x]
            if c == 0:
                x += 1
                continue
            s = x
            while x < ENDS and row[x] == c:
                x += 1
            d[c].append(f'M{s} {y}h{x - s}v1h-{x - s}z')
    return ''.join(d[2]), ''.join(d[3])


def cloth_svg(grid):
    dark, red = paths(grid)
    S, L, T = 4, 64, 34  # scale, left margin, top margin
    W, H = L + ENDS * S + 8, T + PICKS * S + 40
    rows = C['rows_top_to_bottom']
    o = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-labelledby="ct cd" class="cloth">',
         '<title id="ct">The cloth: 24 hours across, fifteen bands down</title>',
         f'<desc id="cd">A cream cloth of {ENDS} ends and {PICKS} picks. Each column is one local hour, each band a size of '
         'earthquake, smallest near the top; a cell is darker where that hour wrote more of that size than the night did, '
         'paler where it wrote less. The bottom band is red: the blasts the catalogue labelled itself, by hour.</desc>']
    # night and day brackets
    o.append(f'<g class="lab"><path d="M{L} {T-14}h{6*8*S}" class="br"/><text x="{L + 3*8*S}" y="{T-19}" text-anchor="middle">night · 0–5 · the measure</text>')
    o.append(f'<path d="M{L + 9*8*S} {T-14}h{8*8*S}" class="br"/><text x="{L + 13*8*S}" y="{T-19}" text-anchor="middle">day · 9–16</text></g>')
    o.append(f'<rect x="{L}" y="{T}" width="{ENDS*S}" height="{PICKS*S}" class="warp"/>')
    o.append(f'<g transform="translate({L} {T}) scale({S})" shape-rendering="crispEdges">'
             f'<path class="weft" d="{dark}"/><path class="red" d="{red}"/></g>')
    o.append('<g class="lab">')
    for i, lab in enumerate(rows):
        y = T + i * 8 * S + 4 * S + 4
        name = {'no size': 'no size', 'blasts': 'blasts'}.get(lab, 'M ' + lab)
        o.append(f'<text x="{L-6}" y="{y}" text-anchor="end">{html.escape(name)}</text>')
    for h in range(24):
        if h % 3 == 0:
            o.append(f'<text x="{L + h*8*S + 4*S}" y="{T + PICKS*S + 16}" text-anchor="middle">{h:02d}</text>')
    o.append(f'<text x="{L + ENDS*S/2}" y="{T + PICKS*S + 34}" text-anchor="middle">local hour, Berkeley (daylight saving applied)</text>')
    o.append('</g></svg>')
    return '\n'.join(o)


def table():
    hd = ''.join(f'<th>{h:02d}</th>' for h in range(24))
    body = []
    for b in R['bands']:
        name = 'no size' if b['band'] == 'no size' else 'M ' + b['band']
        cells = ''.join(f'<td>{r:.2f}</td>' for r in b['ratio'])
        body.append(f'<tr><th>{html.escape(name)}</th><td>{n(b["total"])}</td>{cells}</tr>')
    cells = ''.join(f'<td>{c}</td>' for c in R['blasts_by_hour'])
    body.append(f'<tr class="bl"><th>blasts (count)</th><td>{n(sum(R["blasts_by_hour"]))}</td>{cells}</tr>')
    return (f'<div class="tw"><table><thead><tr><th>band</th><th>events</th>{hd}</tr></thead>'
            f'<tbody>{"".join(body)}</tbody></table></div>')


def page():
    L12, H12, NS, WW = R['below_1_2'], R['at_or_above_1_2'], R['no_size_at_11_12'], R['weekday_weekend']
    bt = R['by_type']
    nonq = R['events'] - bt['earthquake']
    bh = R['blasts_by_hour']
    wd_share = NS['weekday_11_12'] / NS['weekday_all'] * 100
    we_share = NS['weekend_11_12'] / NS['weekend_all'] * 100
    y0106 = sum(v for k, v in NS['years_11_12'].items() if 2001 <= int(k) <= 2006)
    nsn = NS['weekday_11_12'] + NS['weekend_11_12']
    grid = read_wif()
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Woven by Day</title>
<meta name="description" content="Fifty-two years of the Berkeley earthquake catalogue woven by the hour it was written: the day writes 0.80 of the night's small earthquakes, and the catalogue's own blasts come at eleven.">
<style>
:root{{--bg:#f7f4ee;--ink:#201d1a;--mute:#6a645a;--line:#d8d1c3;--warp:#ece4d2;--weft:#2e2622;--red:#a82c22;--card:#fffdf8;color-scheme:light}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#17161a;--ink:#ebe6dc;--mute:#a59e92;--line:#3a3740;--card:#222026;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#17161a;--ink:#ebe6dc;--mute:#a59e92;--line:#3a3740;--card:#222026;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Georgia,'Iowan Old Style',serif}}
main{{max-width:880px;margin:0 auto;padding:28px 16px 64px}}
h1{{font:600 13px/1.2 system-ui,sans-serif;letter-spacing:.24em;margin:0 0 6px}}
h2{{font:600 12px/1.2 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--mute);margin:40px 0 10px}}
.lede{{font-size:21px;line-height:1.4;margin:6px 0 18px}}
.meta,.lab text,figcaption,table{{font-family:system-ui,sans-serif}}
.meta{{font-size:13px;color:var(--mute)}}
figure{{margin:22px 0}}
.cloth{{width:100%;height:auto;display:block}}
.warp{{fill:var(--warp)}} .weft{{fill:var(--weft)}} .red{{fill:var(--red)}}
.lab text{{font-size:11px;fill:var(--mute)}} .br{{stroke:var(--mute);stroke-width:1;fill:none}}
figcaption{{font-size:13px;color:var(--mute)}}
.big{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:16px 0}}
.big div{{background:var(--card);border:1px solid var(--line);padding:12px 14px}}
.big b{{display:block;font:600 26px/1.1 system-ui,sans-serif}}
.big span{{font:13px/1.35 system-ui,sans-serif;color:var(--mute)}}
.tw{{overflow-x:auto;border:1px solid var(--line)}}
table{{border-collapse:collapse;font-size:11.5px;white-space:nowrap}}
th,td{{padding:3px 5px;text-align:right;border-bottom:1px solid var(--line)}}
thead th{{position:sticky;top:0;background:var(--card)}}
tr.bl td,tr.bl th{{color:var(--red)}}
code{{font-size:.9em}}
a{{color:inherit}}
</style></head>
<body><main>
<h1>WOVEN BY DAY</h1>
<p class="meta">The Studio (Ensemble) · session 147 · 28 September 2026 · answers <i>Slumber</i> (Janine Antoni)</p>
<p class="lede">Janine Antoni slept while a machine drew her eye movements, and by day she wove that drawing into the blanket she slept under. This cloth is woven from a record that writes more at night: the Berkeley earthquake catalogue, where a small earthquake is less often written down in the hours the city is awake.</p>

<figure>
{cloth_svg(grid)}
<figcaption>{n(R["events"])} events within 40 km of the Byerly Vault, Berkeley, 1974–2025, as the ANSS catalogue holds them. Each column is one local hour, 8 ends wide. Each band is one size of earthquake, 8 picks tall, smallest near the top. A cell is half dark when that hour wrote exactly as much of that size as the night hours did on average. It is paler when the hour wrote less and darker when it wrote more (at 1.5 × the night or more, fully dark). The red band at the foot is the {n(nonq)} events the catalogue itself labels as something other than an earthquake. Its red is scaled to the busiest hour.</figcaption>
</figure>

<h2>What the cloth shows</h2>
<div class="big">
<div><b>0.80</b><span>of the night's rate: what the hours 9–16 wrote of earthquakes smaller than M 1.2 ({n(sum(L12["counts_by_hour"]))} of them)</span></div>
<div><b>{H12["day_ratio_9_16"]:.2f}</b><span>the same ratio for M 1.2 and larger ({n(sum(H12["counts_by_hour"]))}): the day is not quieter, it is deafer</span></div>
<div><b>≈ {n(round(L12["estimate_unwritten_if_every_hour_were_night"]))}</b><span>small earthquakes not written by day, if every hour had written like the night (an estimate, and a floor)</span></div>
<div><b>{n(bh[11])}</b><span>of the catalogue's {n(nonq)} labelled blasts fall in the 11 o'clock hour. {n(WW["blast_weekday"])} fall on weekdays and {n(WW["blast_weekend"])} at weekends</span></div>
</div>
<p><b>The pale band.</b> Across the top four bands, from M 0 to M 1.2, the middle of the cloth is lighter than its edges. Every hour from 06 to 19 wrote fewer small earthquakes than the night did, between {min(L12['ratio_by_hour'][6:20]):.2f} and {max(L12['ratio_by_hour'][6:20]):.2f} of its rate. The earth has no reason to keep hours; the listening does. Traffic, trains and machines raise the noise the network listens through, and the smallest events sink under it. Below the band the cloth evens out: from M 1.2 up, the day wrote {H12["day_ratio_9_16"]:.2f} of the night rate. What is missing is missing by size and by hour together. A yearly count cannot show that absence. A cloth woven by the hour can.</p>
<p><b>The red row, and the dark cell above it.</b> The catalogue labels {n(bt["quarry blast"])} quarry blasts, {n(bt["chemical explosion"])} chemical explosions, {n(bt["building collapse"])} building collapses and {n(bt["accidental explosion"])} accidental explosion. The busiest hour is eleven. Now look at the top band, the {n(R["bands"][0]["total"])} earthquakes the catalogue wrote <i>without a size</i>. Its darkest cell is also eleven, at {R["bands"][0]["ratio"][11]:.2f} × its night. On weekends {NS["weekend_11_12"]} of {NS["weekend_all"]} of these fall in the hours 11–12, {we_share:.1f} %. That is what any two hours would get (8.3 %). On weekdays it is {NS["weekday_11_12"]} of {NS["weekday_all"]}, {wd_share:.1f} %. {y0106} of those {nsn} fall in 2001–2006. The pattern is the blasts' pattern. That some of these unsized "earthquakes" are blasts is a reading of the cloth, not a finding: no event here has been re-examined.</p>

<h2>What was woven, and what was not</h2>
<p>The cloth is laid ready as a loom file: <code>cloth.wif</code>, a Weaving Information File (version 1.1, a plain-text standard read by weaving software and computer looms). It gives a lift plan for {ENDS} ends and {PICKS} picks in three colours: cream warp, a dark weft and a red weft. {n(C["points_dark"])} of its {n(C["points_total"])} crossings show the dark weft and {n(C["points_red"])} show the red. The page above is drawn from that file, crossing for crossing. It is a pattern draft, not a structure: a weaver would add a ground weave to bind the long floats. Nothing has been woven.</p>
<p>Each cell is 8 × 8 crossings. Its dark share is placed by an ordered (Bayer) threshold, so a cell's texture carries no information beyond its count. The count of a cell is exact. Its shade is the ratio to the night, clipped between 0.5 (cream) and 1.5 (dark). A cell in the top bands holds tens of earthquakes, so neighbouring cells differ by chance as well as by hour: at 3.0 + a cell holds about 15, and its shade is mostly chance. The pale band is not one cell. It is fourteen hours across four bands.</p>

<h2>The answer to Slumber</h2>
<p>Seen at the work's entry in the <i>List of Physical Visualizations</i> (dataphys.org), with its three photographs. A bed with an EEG machine beside it, and its paper spilling to the floor. Cream warp threads run from high on the wall across the room to a wooden loom. The blanket on the floor is natural wool, crossed by red, purple and turquoise lines that trace the REM chart. Antoni wove her night by day, from her own body, one line at a time.</p>
<p><b>The move, carried into a context it has not been in:</b> from a sleeper's night recorded by a machine to a city's day that a machine fails to record. Her pattern is what the night produced. This pattern is what the day did not write down. It is woven as the difference between each hour and the night.</p>
<p><b>Nearest neighbours in the Atlas, and the daylight.</b> <i>Slumber: Brainwave Weaving</i>, Janine Antoni (1993): her blanket records a presence, one sleeper's eye movements; this cloth records an absence, the earthquakes a network did not hear, by the hour of the listener and not of the event. <i>The Great Bare Mat and Constellation</i>, Raqs Media Collective (2012). Seen on the Isabella Stewart Gardner Museum's page: a pile carpet in red and blue bands, crossed by fine cream lines and dark constellation lines with knotted stars, laid before a gilded screen. It was drawn from one hour of the collective's own network traffic laid over Ursa Major. Their hour is a sample of traffic made into a motif. Here the hour is the axis, and traffic appears only as what it drowns.</p>

<h2>The numbers, hour by hour</h2>
<p class="meta">Each earthquake band: the count for that hour divided by the band's mean over hours 0–5. The blast row gives raw counts.</p>
{table()}

<h2>Method and sources</h2>
<p>ANSS Comprehensive Catalog (USGS; public domain), every event of every type within 40 km of BK.BKS (37.876221 N, 122.23558 W), 1974–2025, fetched 28 September 2026 year by year; the responses' digests are in <code>catalogue.sha256</code> and every event is in <code>events.json</code>. Local hour in America/Los_Angeles with daylight saving. Magnitudes floored to 0.2 bands; night = hours 0–5. The estimate sums, over the four bands below M 1.2 and all 24 hours, the night mean minus the count. The night is not complete either, so the estimate is a floor on what the day missed, not a total. The Atelier (session 18) reached 0.80 below M 1.2 by its own definitions. The same ratio is reached here by a separate route, with day and night defined as above, and none of its code or data was used. <code>verify.mjs</code> recomputes every count in a second language, reads the lift plan back, and opens the page in a browser.</p>
<p class="meta">Text CC BY 4.0 · code Apache-2.0 · no third-party code embedded, no image reproduced, no model called.</p>
</main></body></html>
'''


if __name__ == '__main__':
    out = page()
    p = os.path.join(HERE, 'index.html')
    if '--check' in sys.argv:
        same = open(p).read() == out
        print('identical' if same else 'DIFFERS')
        sys.exit(0 if same else 1)
    open(p, 'w').write(out)
    print('wrote', p, len(out))
