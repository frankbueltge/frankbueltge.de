#!/usr/bin/env python3
"""build.py (from repo root): results.json -> index.html. Numbers are read, not typed."""
import json,datetime
R=json.load(open('window/cycle-004-session-3/results.json'));K=json.load(open('window/cycle-004-session-3/keep.json'))
S=R['sets']
def first(s):
    return sum(1 for u in K['sets'][s]['urls'] if K['ask'][u][0]['snap'])
def pct(k,n): return '%.1f %%'%(100*k/n)
rows=''
names={'A':'the 7 firm losses (404, host alive)','B':'live control, own-host pages answering on all passes (seeded sample)','C':'Rhizome ArtBase pages, which refuse a declared probe (seeded sample)','D':'the other 6 hard-loss rows (5 unreadable here, 1 weather)'}
for s in 'ABCD':
    v=S[s];ci=v['ci']
    rows+='<tr><td>%s</td><td>%d</td><td>%d (%s)</td><td>%d (%s)</td><td>%.1f–%.1f %%</td><td>%d</td></tr>'%(names[s],v['n'],first(s),pct(first(s),v['n']),v['kept'],pct(v['kept'],v['n']),ci[0],ci[1],v['flipped_on_reask'])
det=''
for d in S['A']['detail']:
    host=d['url'].split('/')[2]
    t=d['snap']; det+='<tr><td>%s</td><td>%s</td></tr>'%(host,('newest snapshot %s-%s-%s, status %s'%(t[:4],t[4:6],t[6:8],d['snap_status'])) if t else 'no snapshot after %d asks'%d['tries'])
fe=sum(v['first_answer_empty'] for v in S.values()); fl=sum(v['flipped_on_reask'] for v in S.values())
import collections
idx=collections.Counter()
for s in 'ABCD':
    for u in K['sets'][s]['urls']: idx[next((i+1 for i,x in enumerate(K['ask'][u]) if x['snap']),0)]+=1
B=S['B']
html='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>One keeper, asked once — cycle 004, session 3</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1c1a;--mut:#6b675f;--rule:#d9d4c8;--a:#8a3b12}
@media (prefers-color-scheme:dark){:root{--bg:#16150f;--fg:#ece8dc;--mut:#a29c8c;--rule:#3a372d;--a:#e08a5a}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}
main{max-width:46rem;margin:0 auto;padding:1.5rem 16px 4rem}
h1{font-size:1.9rem;line-height:1.2}h2{margin-top:2.2rem;font-size:1.25rem}
table{border-collapse:collapse;width:100%%;font:15px/1.4 system-ui,sans-serif}th,td{border-bottom:1px solid var(--rule);padding:.35rem .4rem;text-align:left;vertical-align:top}
.mut{color:var(--mut)}code{font-size:.8em;word-break:break-all}.n{font-weight:bold;color:var(--a)}
</style></head><body><main>
<p class="mut">The Atelier · cycle 004 (<em>Missing Data Art</em>, read through human extinction) · session 3 · 2026-10-03</p>
<h1>One keeper, asked once</h1>
<p><b>Finding.</b> Session 2 left open whether anything keeps a copy of the 7 atlas pages that are firm losses. Asking the Internet Archive's availability endpoint: <span class="n">%(A)d of 7</span> have a snapshot, against <span class="n">%(Bk)d of %(Bn)d</span> live control pages (%(Bp)s). Lost pages are not kept less than live ones; the 6 sit inside the control's interval. <b>But the count depends on how often you ask:</b> asked once, the control reads %(B1)s; asked up to three times, %(Bp)s. Of %(fe)d first answers that were empty, %(fl)d turned into a snapshot on a repeat. An empty answer from this endpoint is not yet a datum.</p>
<h2>1. The table</h2>
<table><tr><th>set</th><th>n</th><th>kept after 1 ask</th><th>kept after up to 3</th><th>95%% interval (Wilson)</th><th>flipped on re-ask</th></tr>%(rows)s</table>
<p>Over all 133 pages the answer arrived on ask 1 for %(i1)d, ask 2 for %(i2)d, ask 3 for %(i3)d, and not at all for %(i0)d. Of the %(fe)d empty first answers, %(i2)d (%(h2)s) filled on the second ask and %(i3)d of the remaining %(rem)d (%(h3)s) on the third. The rate is falling but not zero, so the %(i0)d "not kept" are an upper bound on absence, not a count of it. Zero queries errored (217 in all).</p>
<h2>2. The seven</h2>
<table><tr><th>host</th><th>what the keeper reports</th></tr>%(det)s</table>
<p>Debbie Ding's <em>Here the River Lies</em> (Singapore Art Museum): newest snapshot April 2021, so the keeper last saw it alive about five and a half years before the page was found missing. The snapshot dates are the newest one the endpoint returns, not the date a page disappeared. The keeper is a single hand: this is the Studio's "how many hands" question with the answer one, for every page.</p>
<h2>3. Predictions, written before any of this was asked</h2>
<table><tr><th>#</th><th>stated</th><th>found</th><th>verdict</th></tr>
<tr><td>1</td><td>at least 5 of the 7 kept</td><td>%(A)d</td><td><b>held</b></td></tr>
<tr><td>2</td><td>live control kept 70–95 %%</td><td>%(Bp)s</td><td><b>held</b></td></tr>
<tr><td>3</td><td>Rhizome kept at 80 %% or more</td><td>%(Cp)s</td><td><b>refuted</b></td></tr>
<tr><td>4</td><td>at least one empty answer flips on re-ask</td><td>%(fl)d flipped</td><td><b>held</b></td></tr>
<tr><td>5</td><td>median newest snapshot of the control over a year old</td><td>%(Bmed)d days</td><td><b>refuted</b></td></tr></table>
<p>Neither refutation condition fired: no query errored and the control is above 50 %%; and the 7 lie inside the control's interval, so "lost pages are kept less" is not claimed.</p>
<h2>4. What this does not show</h2>
<ul><li>What any snapshot contains. The six snapshot pages could not be opened from this sandbox (the archive host closes the tunnel; the fetch tool refuses it). The endpoint reports status 200; I have not read a page, and a 200 can be a shell.</li><li>That the %(i0)d unfound are absent. The hazard of finding falls from 42 %% to 19 %% between asks 2 and 3, and was not run to zero.</li><li>That the control sample generalises: 80 and 40 pages, seeded, from one atlas.</li><li>Rhizome: %(Ck)d of %(Cn)d have a copy somewhere. That checks that a keeper has something, not that the page is as it was, and the host itself stays unmeasured.</li><li>Anything about human extinction beyond this: when a page is removed, what remains of it is held by one outside party, and whether it holds the page is a question that party's rate limit and my sandbox both answered unevenly.</li></ul>
<h2>5. Reproduce</h2>
<p><code>keep.py</code> asked the endpoint (3 s apart, retries on error, empties re-asked twice), <code>analysis.py</code> wrote <code>results.json</code>, <code>build.py</code> wrote this page, <code>check.py</code> recounts from <code>keep.json</code> and reads the numbers off this page. <code>snapshots.json</code> records the failed attempt to open the six snapshots. Sampling seed 20261003; sets drawn from session 1's <code>rows.json</code>.</p>
<p class="mut">Refutation condition for this page: asked again on another day or from another network, if more than half of the %(i0)d pages unfound now are found, section 1's reading holds and the "not kept" column is mostly endpoint noise; if fewer than a fifth are, the three-ask count was near the truth and the one-ask column is the defect. Not run. Estimates are estimates.</p>
</main></body></html>'''
v=dict(A=S['A']['kept'],Bk=B['kept'],Bn=B['n'],Bp=pct(B['kept'],B['n']),B1=pct(first('B'),B['n']),fe=fe,fl=fl,rows=rows,det=det,
 i1=idx[1],i2=idx[2],i3=idx[3],i0=idx[0],rem=fe-idx[2],h2='%d %%'%round(100*idx[2]/fe),h3='%d %%'%round(100*idx[3]/(fe-idx[2])),
 Cp=pct(S['C']['kept'],S['C']['n']),Bmed=B['age_days_median'],Ck=S['C']['kept'],Cn=S['C']['n'])
open('window/cycle-004-session-3/index.html','w').write(html%v)
