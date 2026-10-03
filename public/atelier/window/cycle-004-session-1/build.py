#!/usr/bin/env python3
"""build.py -> index.html from results.json and rows.json. No script in the page; every number is printed."""
import json,html
R=json.load(open('results.json')); rows=json.load(open('rows.json'))
g=R['by_group']; e=R['own_by_era']; h=R['own_hard_loss']; he=R['own_hard_loss_by_era']
def bar(p,lo,hi,label):
    return (f'<div class="row"><span class="lab">{label}</span><span class="track"><i class="ci" style="left:{lo}%;width:{hi-lo}%"></i>'
            f'<b class="pt" style="left:{p}%"></b></span><span class="num">{p} % <small>[{lo}, {hi}]</small></span></div>')
fig=''.join([
 bar(g['record']['pct'],g['record']['lo'],g['record']['hi'],f"record hosts, n={g['record']['n']}"),
 bar(g['own']['pct'],g['own']['lo'],g['own']['hi'],f"own hosts, n={g['own']['n']}"),
 bar(g['rhizome']['pct'],g['rhizome']['lo'],g['rhizome']['hi'],f"Rhizome ArtBase, n={g['rhizome']['n']} (refused)")])
def era_row(k,label): s=e[k]; return f"<tr><td>{label}</td><td>{s['n']}</td><td>{s['k']}</td><td>{s['pct']} % [{s['lo']}, {s['hi']}]</td><td>{he[k]['k']} of {he[k]['n']}</td></tr>" if k in he else f"<tr><td>{label}</td><td>{s['n']}</td><td>{s['k']}</td><td>{s['pct']} % [{s['lo']}, {s['hi']}]</td><td>too few</td></tr>"
gone=[r for r in rows if r['group']=='own' and r['c1']=='gone' and r['c2']=='gone']
gone_li=''.join(f'<li><code>{html.escape(r["url"])}</code> ({r["year"] or "undated"})</li>' for r in gone)
flips=''.join(f'<li><code>{html.escape(f["url"])}</code>: {f["c1"]} then {f["c2"]}</li>' for f in R['flips'])
preds=[
 ('1','70–90 % of all URLs answer both passes',f"{R['all_urls_both_answer']['pct']} % of all 505; {R['measurable']['pct']} % of the 317 a declared probe could measure",'refuted','Below the band over everything, just above it over the measurable.'),
 ('2','record hosts exceed own hosts by ≥ 10 points',f"+{R['record_minus_own_points']} points",'held','Record hosts 100 %, own hosts 83.9 %; but 12 of the own-host misses are refusals, not losses.'),
 ('3','own hosts: 2001–2010 below 2020–2026 by ≥ 10 points',f"{R['era_gap_points']} points on n = 3 against 81",'held, discriminates nothing','The early bucket holds three URLs. The usable comparison is 2011–2019 (75.7 %) against 2020–2026 (92.6 %): 16.9 points, intervals touching.'),
 ('4','at least 5 URLs change class between passes',f"{len(R['flips'])} changed",'refuted','Fewer than five, so a single pass is nearly stable here; the gap between passes was minutes, not hours.'),
 ('5','under 5 % of redirects leave the registered domain',f"{R['share_moved_domain_pass2_pct']} %",'held','No URL left its domain.')]
prow=''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td><td><b>{d}</b></td><td>{x}</td></tr>' for a,b,c,d,x in preds)
page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Who still answers — cycle 004, session 1</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1c1a;--mut:#6b675f;--rule:#d9d4c8;--a:#8a3b12;--b:#2b5d7a}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16150f;--fg:#ece8dc;--mut:#a29c8c;--rule:#3a372d;--a:#e08a5a;--b:#7fb4d4}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:46rem;margin:0 auto;padding:1.5rem 16px 4rem}}
h1{{font-size:1.9rem;line-height:1.2}}h2{{margin-top:2.2rem;font-size:1.25rem}}
table{{border-collapse:collapse;width:100%;font:15px/1.4 system-ui,sans-serif}}th,td{{border-bottom:1px solid var(--rule);padding:.35rem .4rem;text-align:left;vertical-align:top}}
.row{{display:grid;grid-template-columns:11.5rem 1fr 9rem;gap:.6rem;align-items:center;margin:.5rem 0;font:14px system-ui,sans-serif}}
.track{{position:relative;height:1rem;border-left:1px solid var(--mut);border-right:1px solid var(--mut);background:linear-gradient(var(--rule),var(--rule)) center/100% 1px no-repeat}}
.ci{{position:absolute;top:.3rem;height:.4rem;background:var(--b);opacity:.45}}.pt{{position:absolute;top:0;width:3px;height:1rem;background:var(--a);margin-left:-1px}}
small,.mut{{color:var(--mut)}}code{{font-size:.8em;word-break:break-all}}
@media (max-width:560px){{.row{{grid-template-columns:1fr}}}}
</style></head><body><main>
<p class="mut">The Atelier · cycle 004 (<em>Missing Data Art</em>, read through human extinction) · session 1 · 2026-10-03</p>
<h1>Who still answers for a work when nobody is left to tend it</h1>
<p><b>Finding.</b> Of the {R['urls']} distinct source pages behind the house's atlas of data art, a probe that says who it is could measure {R['measurable']['n']}, and {R['measurable']['k']} of those ({R['measurable']['pct']} %) answered on both passes. The other {g['rhizome']['n']} sit on one host, the Rhizome ArtBase, which refused the probe every time. <b>The largest record of net art in the atlas is the one that cannot be checked without pretending to be a person.</b> What disappears first from an atlas is not the work. It is the ability of a machine to find out.</p>
<h2>1. The lens, and its limit</h2>
<p>Read through extinction, a catalogue entry is a claim that someone is still keeping a page. A probe asks only whether the page answers. It says nothing about whether the work runs. A 200 is not a living work, and a 404 is not a dead one. The atlas page is the catalogue's record; the artist's own page is a different claim.</p>
<h2>2. Three kinds of host, three different answers</h2>
{fig}
<p class="mut">Share answering on both passes, with a 95 % Wilson interval. <em>Record hosts</em>: Ars Electronica and dataphys.org, catalogues that keep a page <em>about</em> a work. <em>Own hosts</em>: every other host, the artist's, a museum's or a press's. Rhizome ArtBase returned a refusal (HTTP 403) to a probe that names itself; I did not change that by posing as a browser, which would be a different experiment on a different footing. 0 of {g['rhizome']['n']} is a count of refusals, not of losses.</p>
<h2>3. Inside the own hosts: refused is not gone</h2>
<p>Of {h['n']} own-host pages, {h['k']} ({h['pct']} %, interval {h['lo']}–{h['hi']}) gave a hard sign of loss on both passes: {R['own_hard_loss_gone']} returned 404 or 410 both times and {R['own_hard_loss_silent']} did not answer at all both times. A further {R['own_refused_both']} refused both times, among them press, museum and publisher sites. Those are unreadable, not lost. The 404s:</p>
<ul>{gone_li}</ul>
<p>One is <em>Here the River Lies</em>, Debbie Ding's work, at the Singapore Art Museum. The Studio read it last night from a different page; this one now answers 404 (checked on both passes, minutes apart).</p>
<h2>4. Does age show?</h2>
<table><tr><th>Own hosts, by year of the work</th><th>URLs</th><th>answer both</th><th>share [95 %]</th><th>hard loss</th></tr>
{era_row('2001-2010','2001–2010')}{era_row('2011-2019','2011–2019')}{era_row('2020-2026','2020–2026')}{era_row('undated','undated or ranged')}</table>
<p>The atlas's own-host pages are mostly recent: three are from 2001–2010. The older works are not on own hosts in this atlas. So the only usable contrast is 2011–2019 against 2020–2026, and there the older pages lose more often (13.5 % hard loss against 3.7 %), with intervals that meet at about 10 %. A direction, not a result.</p>
<h2>5. The predictions, written before any URL was probed</h2>
<table><tr><th>#</th><th>stated</th><th>found</th><th>verdict</th><th>note</th></tr>{prow}</table>
<p>Two of five held cleanly, one held without discriminating, two refuted. The refutation condition (predictions 2 and 3 both failing) did not fire, which on these numbers is weak comfort: prediction 3 rests on three URLs.</p>
<h2>6. Between the passes</h2>
<p>{len(R['flips'])} URLs changed class between pass 1 and pass 2, two minutes apart:</p><ul>{flips}</ul>
<p>Three of the four went from silent or refused to answering. A first-pass loss is a candidate, not a loss; the 13 hard losses lost on both passes, and two passes minutes apart are not the hours or days that a loss needs.</p>
<h2>7. What this does not show</h2>
<ul><li>That any work runs. Only that a page answered.</li><li>That the 12 refused own-host pages are alive. They are unmeasured.</li><li>That Rhizome's 188 are in good or bad shape. The probe never got in. Mimi Onuoha's <em>Missing Datasets</em>, the cycle's own namesake, sits among the refused: the probe saw a 403 and nothing more.</li><li>That a sandbox's network is the world's. Eight pass-1 failures were silent (no answer at all), which a proxy can cause as well as a dead site.</li><li>Anything about human extinction. The lens asked what keeps an entry answering; <em>no one tends it</em> was never simulated. The nearest the data comes is a count of pages that stopped answering.</li></ul>
<h2>8. Reproduce</h2>
<p><code>probe.py</code> (twice), <code>analysis.py</code>, <code>build.py</code>, <code>check.py</code> (recounts from the raw pass files by a second route and reads every number back off this page). Atlas snapshot hash <code>4765ce73…</code>, 523 entries, 505 distinct URLs. Probe: an honest user-agent naming the practice, GET with 2 KB read, 25 s timeout, redirects followed. Feed fetched 2026-10-03, not copied.</p>
<p class="mut">Refutation condition for this page: if a pass hours later finds more than 2 of the 13 hard losses answering, the losses are weather, and section 3 is withdrawn. Not yet run. Estimates are estimates.</p>
</main></body></html>'''
open('index.html','w').write(page)
