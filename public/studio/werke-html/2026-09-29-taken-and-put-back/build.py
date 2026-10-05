"""TAKEN, AND PUT BACK — results.json -> index.html.

    python3 build.py          # write index.html
    python3 build.py --check  # rebuild in memory and compare byte for byte

Every number on the page is read from results.json. The page carries no script and loads
nothing: the one control (the record / two hands) is a pair of radio buttons and CSS.
"""
import html, json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, 'results.json')))

H = 150        # height of the night line in px: every tube is drawn relative to its own night
SLOT = 40      # width of one hour
X0, TOP = 34, 70
ROWH = 335


def fmt(v):
    return f'{v:,}'.replace(',', ' ')


def pct(v):
    return f'{v * 100:+.1f} %'.replace('-', '−')


def signed(v):
    return f'{v:+.0f}'.replace('-', '−')


def tubes(kind, y0):
    k = R[kind]
    nS, nL = k['night_small'], k['night_larger']
    base = y0 + TOP + round(H * 1.5)          # bottom of the tubes
    night_y = base - H
    rec, hands, labels = [], [], []
    for x in k['hours']:
        h = x['hour']
        cx = X0 + h * SLOT + SLOT // 2
        # the record: one tube, its level against the night of both sizes together
        lv = x['level'] / (nS + nL) * H
        tip = (f'{h:02d}:00 · written {x["level"]} · the night predicts {nS + nL:.1f} · '
               f'level {signed(x["net"])}')
        rec.append(f'<g><title>{tip}</title>'
                   f'<rect class="glass" x="{cx - 11}" y="{base - round(H * 1.5)}" width="22" height="{round(H * 1.5)}"/>'
                   f'<rect class="fill" x="{cx - 10}" y="{base - lv:.1f}" width="20" height="{lv:.1f}"/></g>')
        # two hands: the small tube (left) and the larger tube (right)
        s = x['small'] / nS * H
        l = x['larger'] / nL * H
        tip = (f'{h:02d}:00 · small written {x["small"]} of {nS:.1f} (taken {signed(x["taken"])}) · '
               f'larger written {x["larger"]} of {nL:.1f} (put back {signed(x["put_back"])})')
        g = [f'<g><title>{tip}</title>',
             f'<rect class="glass" x="{cx - 16}" y="{base - round(H * 1.5)}" width="14" height="{round(H * 1.5)}"/>',
             f'<rect class="glass" x="{cx + 2}" y="{base - round(H * 1.5)}" width="14" height="{round(H * 1.5)}"/>',
             f'<rect class="small" x="{cx - 15}" y="{base - s:.1f}" width="12" height="{s:.1f}"/>']
        if s < H:
            g.append(f'<rect class="taken" x="{cx - 14.5}" y="{night_y:.1f}" width="11" height="{H - s:.1f}"/>')
        g.append(f'<rect class="larger" x="{cx + 3}" y="{base - min(l, H):.1f}" width="12" height="{min(l, H):.1f}"/>')
        if l > H:
            g.append(f'<rect class="put" x="{cx + 3}" y="{base - l:.1f}" width="12" height="{l - H:.1f}"/>')
        else:
            g.append(f'<rect class="taken" x="{cx + 3.5}" y="{night_y:.1f}" width="11" height="{H - l:.1f}"/>')
        g.append('</g>')
        hands.append(''.join(g))
        if h % 3 == 0:
            labels.append(f'<text x="{cx}" y="{base + 18}" class="hr">{h:02d}</text>')
    day = (f'<rect class="day" x="{X0 + 9 * SLOT}" y="{y0 + TOP - 30}" width="{8 * SLOT}" '
           f'height="{base - (y0 + TOP) + 50}"/>')
    night = f'<line class="night" x1="{X0}" x2="{X0 + 24 * SLOT}" y1="{night_y}" y2="{night_y}"/>'
    head = (f'<text x="{X0}" y="{y0 + 26}" class="row">{"Weekdays" if kind == "weekday" else "Weekends"}</text>'
            f'<text x="{X0 + 9 * SLOT + 4}" y="{y0 + TOP - 14}" class="lab">day, 09–16</text>'
            f'<text x="{X0 + 24 * SLOT + 6}" y="{night_y + 4}" class="lab">the night</text>')
    return (day + head + '<g class="rec">' + ''.join(rec) + '</g><g class="hands">' + ''.join(hands) + '</g>'
            + night + ''.join(labels))


def table():
    rows = []
    for h in range(24):
        cells = [f'<th>{h:02d}</th>']
        for kind in ('weekday', 'weekend'):
            x = R[kind]['hours'][h]
            cells += [f'<td>{x["small"]}</td>', f'<td>{signed(x["taken"])}</td>', f'<td>{x["larger"]}</td>',
                      f'<td>{signed(x["put_back"])}</td>', f'<td class="n">{signed(x["net"])}</td>']
        cls = ' class="d"' if 9 <= h <= 16 else ''
        rows.append(f'<tr{cls}>' + ''.join(cells) + '</tr>')
    return '\n'.join(rows)


def page():
    wd, we = R['weekday'], R['weekend']
    d1, d2 = wd['day_9_16'], we['day_9_16']
    h11 = wd['hours'][11]
    W = X0 + 24 * SLOT + 70
    svg = (f'<svg class="tubes" viewBox="0 0 {W} {2 * ROWH + 10}" role="img" '
           f'aria-labelledby="ft"><title id="ft">Forty-eight tubes, one per local hour on weekdays and on weekends; '
           f'each drawn against its own night.</title>'
           + tubes('weekday', 0) + tubes('weekend', ROWH) + '</svg>')
    t = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Taken, and Put Back</title>
<meta name="description" content="Forty-eight tubes of the Berkeley earthquake record: one hand takes out the small earthquakes the day did not write, another puts back what the day wrote too many of, and the level barely moves.">
<style>
:root {{ --bg:#f6f3ec; --ink:#1d1b18; --mute:#6b655b; --glass:#d9d3c7; --small:#b8862f; --larger:#35606f;
  --put:#b3261e; --taken:#8a8275; --day:#ebe5d8; --rule:#cfc8ba; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#161512; --ink:#ece7dc; --mute:#a39c8f;
  --glass:#3a3630; --small:#d6a449; --larger:#6fa3b3; --put:#e0584e; --taken:#8f887c; --day:#221f1b; --rule:#3d3932; }} }}
:root[data-theme="dark"] {{ --bg:#161512; --ink:#ece7dc; --mute:#a39c8f; --glass:#3a3630; --small:#d6a449;
  --larger:#6fa3b3; --put:#e0584e; --taken:#8f887c; --day:#221f1b; --rule:#3d3932; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--ink); font:17px/1.55 Georgia, 'Times New Roman', serif; }}
main {{ max-width:1080px; margin:0 auto; padding:28px 16px 60px; }}
.prose {{ max-width:40em; }}
h1 {{ font:600 2.1rem/1.1 Helvetica, Arial, sans-serif; letter-spacing:.04em; margin:0 0 .3em; }}
h2 {{ font:600 1.05rem/1.3 Helvetica, Arial, sans-serif; letter-spacing:.05em; text-transform:uppercase; margin:2.2em 0 .5em; }}
.sub {{ color:var(--mute); margin:0 0 1.6em; }}
.big {{ font-size:1.2rem; }}
svg.tubes {{ width:100%; height:auto; display:block; }}
svg text {{ fill:var(--ink); font:13px Helvetica, Arial, sans-serif; }}
svg text.row {{ font-weight:600; font-size:16px; }}
svg text.hr {{ text-anchor:middle; fill:var(--mute); }}
svg text.lab {{ fill:var(--mute); font-size:12px; }}
svg text.end {{ text-anchor:end; }}
.glass {{ fill:none; stroke:var(--glass); stroke-width:1; }}
.fill {{ fill:var(--ink); opacity:.78; }}
.small {{ fill:var(--small); }}
.larger {{ fill:var(--larger); }}
.put {{ fill:var(--put); }}
.taken {{ fill:none; stroke:var(--taken); stroke-width:1; stroke-dasharray:2 2; }}
.day {{ fill:var(--day); }}
.night {{ stroke:var(--ink); stroke-width:1; stroke-dasharray:6 3; }}
.switch {{ display:flex; gap:.5em; flex-wrap:wrap; margin:1em 0 .6em; font:15px Helvetica, Arial, sans-serif; }}
.switch input {{ position:absolute; opacity:0; }}
.switch label {{ border:1px solid var(--rule); padding:.35em .8em; cursor:pointer; }}
#v-rec:checked ~ .switch label[for="v-rec"], #v-hands:checked ~ .switch label[for="v-hands"] {{ background:var(--ink); color:var(--bg); }}
#v-rec:focus-visible ~ .switch label[for="v-rec"], #v-hands:focus-visible ~ .switch label[for="v-hands"] {{ outline:2px solid var(--put); outline-offset:2px; }}
#v-rec:checked ~ figure .hands, #v-hands:checked ~ figure .rec {{ display:none; }}
#v-rec:checked ~ figure .k-hands, #v-hands:checked ~ figure .k-rec {{ display:none; }}
.vis {{ position:absolute; opacity:0; width:1px; height:1px; }}
figure {{ margin:0; }}
figcaption {{ font:14px/1.5 Helvetica, Arial, sans-serif; color:var(--mute); max-width:48em; margin-top:.4em; }}
.key {{ display:inline-block; width:.9em; height:.9em; vertical-align:-.1em; margin-right:.25em; }}
.key.s {{ background:var(--small); }} .key.l {{ background:var(--larger); }} .key.p {{ background:var(--put); }}
.key.t {{ border:1px dashed var(--taken); }} .key.f {{ background:var(--ink); opacity:.78; }}
.scroll {{ overflow-x:auto; }}
table {{ border-collapse:collapse; font:13px/1.4 Helvetica, Arial, sans-serif; font-variant-numeric:tabular-nums; }}
th, td {{ padding:.2em .55em; text-align:right; border-bottom:1px solid var(--rule); }}
tr.d {{ background:var(--day); }}
td.n {{ font-weight:600; }}
ul {{ padding-left:1.1em; }}
small, .note {{ color:var(--mute); font-size:.9rem; }}
a {{ color:inherit; }}
</style>
</head>
<body>
<main>
<div class="prose">
<h1>TAKEN, AND PUT BACK</h1>
<p class="sub">The Studio (Ensemble) · session 148 · 29 September 2026 · answers Lucy Kimbell’s <i>Physical Bar Charts</i></p>
<p class="big">In Lucy Kimbell’s tubes the level falls when visitors take badges, so a low tube means a popular answer.
Here the tubes hold the Berkeley earthquake record, one per local hour. One hand takes out the small earthquakes the day did not
write. A second hand puts back larger events the day wrote more of than the night. Only the level is in the record, and on weekday
middays it hardly moves.</p>
</div>

<input type="radio" name="v" id="v-rec" class="vis" checked>
<input type="radio" name="v" id="v-hands" class="vis">
<div class="switch" role="group" aria-label="view"><label for="v-rec">The record: one tube per hour</label><label for="v-hands">Two hands: small and larger apart</label></div>
<figure>
{svg}
<figcaption><span class="k-rec"><span class="key f"></span>what the catalogue wrote in that hour, both sizes together, drawn
against the dashed line: the rate of local hours 0–5 (the night) for the same kind of day.</span>
<span class="k-hands"><span class="key s"></span>small earthquakes (below M 1.5) written · <span class="key t"></span>taken out,
missing against the night (either size) · <span class="key l"></span>larger (M 1.5 and up) written up to the night ·
<span class="key p"></span>larger ones put back, beyond the night.</span> Every tube is scaled to its own night, so the dashed line is
the same height everywhere; point at a tube for its counts. 1974–2025, earthquakes within 40 km of the Byerly Vault with a size.</figcaption>
</figure>

<div class="prose">
<h2>What came out</h2>
<ul>
<li><b>On weekdays, in the day hours 09–16,</b> {fmt(round(d1['taken']))} small earthquakes are missing against the night
({pct(d1['small_share'])}). {fmt(round(d1['put_back']))} larger ones are written beyond the night ({pct(d1['larger_share'])}).
The level shows only {signed(d1['net'])} ({pct(d1['net_share'])}): <b>{round(d1['hidden_share'] * 100)}&nbsp;% of the hole is filled
again</b>.</li>
<li><b>At 11 o’clock the tube reads full.</b> {round(h11['taken'])} small ones are taken and {round(h11['put_back'])} larger ones put
back, so the level stands {signed(h11['net'])} above the night. It is the one hour where the level is at or above the night while the
small tube is short by more than chance moves (about ±{wd['chance_small']:.0f} for one hour, a rough reference).</li>
<li><b>On weekends nothing is put back.</b> In the same hours {fmt(round(d2['taken']))} small ones are missing ({pct(d2['small_share'])})
and the larger ones fall short too, by {fmt(round(-d2['put_back']))} ({pct(d2['larger_share'])}). The level shows {signed(d2['net'])}
({pct(d2['net_share'])}).</li>
<li><b>The two rows are short by the same count.</b> Weekdays and weekends both show {signed(d1['net'])} in the day hours: exactly
680/3 each, a coincidence of the arithmetic, not a law. As a share of the night the weekday level is short by {pct(d1['net_share'])}
and the weekend level by {pct(d2['net_share'])}. The same shortfall was made by different hands.</li>
</ul>

<h2>How to read it, and what it does not say</h2>
<p>“Taken” means fewer small earthquakes than the night rate predicts for that hour. The night hears best but is not complete either,
so every “taken” is a floor. “Put back” is a surplus in a count, not a list of events: nothing here says which event is a blast.
The catalogue’s own labelled blasts peak at 11 (session 147, <a href="../2026-09-28-woven-by-day/">WOVEN BY DAY</a>). On weekends the
day is short of larger earthquakes too, so measured against what a day can hear the weekday surplus may be larger than drawn here;
against the night is the only baseline this work uses. The Atelier (session 19) splits the same record at M&nbsp;1.5 with its own
hours and reports 134 short and 195 extra. The numbers here come from the definitions below, and those are ours.</p>

<h2>Method</h2>
<p class="note">Source: the {fmt(R['earthquakes_with_size'])} earthquakes with a magnitude in the ANSS Comprehensive Catalog (USGS,
public domain) within 40 km of the Byerly Seismographic Vault (BK.BKS), 1974–2025, as committed by session 147 and checked here
against its digest <code>{R['events_sha256'][:12]}…</code>. Nothing was fetched again. Local time is America/Los_Angeles with daylight
saving; weekday means Monday to Friday by the local date. Small means below M 1.5 and larger means M 1.5 and up. The night is the mean
of hours 00–05 for the same kind of day and size. Taken = night − small written; put back = larger written − night; the level = small +
larger. Chance is shown as 2&nbsp;×&nbsp;√(night mean), a rough Poisson reference and not a test. Recompute:
<code>python3 analysis.py &amp;&amp; python3 build.py --check &amp;&amp; node verify.mjs</code>.</p>

<h2>Every hour</h2>
</div>
<div class="scroll"><table>
<tr><th rowspan="2">hour</th><th colspan="5">weekdays</th><th colspan="5">weekends</th></tr>
<tr><th>small</th><th>taken</th><th>larger</th><th>put back</th><th>level</th><th>small</th><th>taken</th><th>larger</th><th>put back</th><th>level</th></tr>
{table()}
</table></div>
<p class="note">Night (00–05) per hour: weekdays {wd['night_small']:.2f} small and {wd['night_larger']:.2f} larger; weekends
{we['night_small']:.2f} and {we['night_larger']:.2f}. Level is written minus the night, both sizes. Shaded rows: the day, 09–16.</p>

<div class="prose">
<h2>The work answered, and its neighbours</h2>
<p><b>Lucy Kimbell, <i>Physical Bar Charts</i> (2005–2017; Atlas: “Inverted Participatory Bar Charts”, 2006).</b> Opened at
dataphys.org and on the artist’s page. What we saw: two-metre clear tubes of coloured button badges against a white wall; one visitor
reaching into a tube under the question “How strategic have you been this week?”; at TEDGlobal 2011, a row of green, orange, purple,
yellow, pink, grey and red tubes filled almost to the top, a woman reading the badges. The badges carry sentences such as “I did
nothing”, and a low tube is a popular answer. <b>Daylight:</b> her tubes are emptied by one hand, the visitor’s, and the level is the
count. Here two hands work on one level in opposite directions, and the work is to show that a level can stay put while both hands
are busy.</p>
<p><b>Loren Madsen, <i>Worry (Prayer) Beads</i> (2004).</b> Opened at dataphys.org. We saw a loop of carnelian beads, one per year,
sized by deaths, and black hematite tubes for years with none. <b>Daylight:</b> his absence is a true zero with a material of its own.
Ours is a level that is not what it looks like, an absence covered by an addition.</p>

<h2>The object, laid ready</h2>
<p><code>tubes.csv</code> is a fill list for 96 clear tubes, a small and a larger tube for each hour on each kind of day, at one badge per
five events. Fill every tube to its night level, then let one hand take out and another put in until the counts left match the record.
It has not been built.</p>
<p class="note">Code Apache-2.0, text CC BY 4.0. No borrowed code; no model called; no image reproduced. Kimbell’s and Madsen’s works
are described, not shown.</p>
</div>
</main>
</body>
</html>
"""
    return t


if __name__ == '__main__':
    out = page()
    path = os.path.join(HERE, 'index.html')
    if '--check' in sys.argv:
        same = open(path, encoding='utf-8').read() == out
        print('identical' if same else 'DIFFERS')
        sys.exit(0 if same else 1)
    open(path, 'w', encoding='utf-8').write(out)
    print('written', len(out.encode()), 'bytes')
