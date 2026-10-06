"""Builds index.html from dialects.json (aggregates of the Met Open Access CSV, CC0). No JS needed to read it."""
import json, html
D = json.load(open('dialects.json'))
EX = {'year': (1850, 1780, 1920), 'century': (1800, 1790, 1910)}
W, LBL, ROW = 640, 250, 46
def svg(kind, rows):
    base, lo, hi = EX[kind]
    sx = lambda y: LBL + (max(lo, min(hi, y)) - lo) / (hi - lo) * (W - LBL - 10)
    h = ROW * len(rows) + 24
    s = [f'<svg viewBox="0 0 {W} {h}" role="img" width="100%">']
    for y in range(lo + 10 if kind == 'year' else 1800, hi, 20 if kind == 'year' else 25):
        s.append(f'<line class="g" x1="{sx(y):.1f}" x2="{sx(y):.1f}" y1="14" y2="{h}"/><text class="t" x="{sx(y):.1f}" y="10" text-anchor="middle">{y}</text>')
    for i, r in enumerate(rows):
        y0 = 24 + i * ROW
        s.append(f'<text class="d" x="{LBL-8}" y="{y0+14}" text-anchor="end">{html.escape(r["department"])}</text>'
                 f'<text class="t" x="{LBL-8}" y="{y0+28}" text-anchor="end">{r["n"]:,} records</text>')
        for j, (b, e, v, sh) in enumerate(r['top']):
            if sh < .05 and j: continue
            x1, x2 = sx(base + b), sx(base + e)
            s.append(f'<rect class="b{min(j,2)}" x="{x1:.1f}" y="{y0+4+j*8}" width="{max(x2-x1,2.5):.1f}" height="6" rx="2"><title>{base+b}–{base+e}: {sh:.0%} of {r["n"]:,}</title></rect>')
        b, e, v, sh = r['top'][0]
        s.append(f'<text class="t" x="{W-8}" y="{y0+40}" text-anchor="end">most often: {e-b} years wide ({sh:.0%})</text>')
    s.append('</svg>')
    return ''.join(s)
secs, tabs = [], []
for i, (k, v) in enumerate(D.items()):
    ex = {'year': 'ca. 1850', 'century': k.replace('Nth', '19th')}[v['kind']]
    secs.append(f'<section id="s{i}"><h2>“{html.escape(ex)}”</h2><p class="n">{v["n_all"]:,} records use this phrase in the {len(v["departments"])} departments that use it a hundred times or more. Bars: the years the museum’s numbers give it — the strongest bar is the most common answer, the fainter two the next most common.</p>{svg(v["kind"], v["departments"])}</section>')
    tabs.append(f'<button data-t="s{i}">{html.escape(ex)}</button>')
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Same Words, Other Years</title>
<style>
:root{{--bg:#faf8f4;--fg:#1d1b18;--mu:#6b655c;--b0:#8a3b12;--b1:#c98b62;--b2:#e3c4ad;--g:#e2ddd3}}
@media(prefers-color-scheme:dark){{:root{{--bg:#16140f;--fg:#ece6da;--mu:#a09886;--b0:#e8905a;--b1:#a8643c;--b2:#6e4a33;--g:#2c2820}}}}
body{{background:var(--bg);color:var(--fg);font:16px/1.55 Georgia,serif;margin:0 auto;max-width:700px;padding:0 16px 48px}}
h1{{font-size:2rem;margin:1.6em 0 .2em}}h2{{font-size:1.4rem;margin:1.6em 0 .2em}}.n,.f{{color:var(--mu);font-size:.9rem}}
button{{font:inherit;background:none;color:var(--fg);border:1px solid var(--mu);border-radius:14px;padding:2px 12px;margin:2px;cursor:pointer}}button[aria-pressed=true]{{background:var(--fg);color:var(--bg)}}
.g{{stroke:var(--g)}}.t{{fill:var(--mu);font:11px sans-serif}}.d{{fill:var(--fg);font:13px sans-serif}}.b0{{fill:var(--b0)}}.b1{{fill:var(--b1)}}.b2{{fill:var(--b2)}}
</style></head><body>
<h1>Same Words, Other Years</h1>
<p>A museum writes “ca. 1850” on a label and stores two numbers beside it, so that a machine can search by year. Here is what the two numbers are, department by department, for the same words — read from 484,956 of the Metropolitan Museum’s open records.</p>
<p>The words do not mean one thing. In one department “ca.” is five years either way; in another it is ten; in another twenty-five. Each department keeps its own unwritten table, and the number the search engine sees is that table’s answer, not the object’s age.</p>
<div id="tabs">{''.join(tabs)}</div>
{''.join(secs)}
<p class="f"><b>Source.</b> Met Open Access object records, CC0 (github.com/metmuseum/openaccess), file sha256 de617b9c…b9183, fetched 2026-10-06. Counted by <code>study.py</code> into <code>dialects.json</code>; this page is drawn from that file by <code>build.py</code>. Aggregates only: no objects, makers or donors are named. The Met publishes no table of these conventions that this study could find; the departments’ tables are inferred from the data and are estimates of practice, not statements of policy. Part of project 3 of the practice REMAINDER (<code>projects/met-date-intervals/</code>).</p>
<script>
(function(){{var s=document.querySelectorAll('section'),b=document.querySelectorAll('#tabs button');
function show(id){{s.forEach(function(x){{x.hidden=x.id!==id}});b.forEach(function(x){{x.setAttribute('aria-pressed',x.dataset.t===id)}})}}
b.forEach(function(x){{x.onclick=function(){{show(x.dataset.t)}}}});if(b.length)show('s0')}})();
</script></body></html>'''
open('index.html', 'w').write(page)
