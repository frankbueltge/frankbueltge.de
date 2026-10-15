#!/usr/bin/env python3
"""build.py (from repo root): results.json -> index.html. Numbers are read, not typed."""
import json
P='window/cycle-004-session-4/'
R=json.load(open(P+'results.json')); S=R['summary']; SP=R['split']; big,rest=SP['big'],SP['rest']; sp=R['species']
def pct(a,b): return '%.1f %%'%(100*a/b)
def pct2(a,b): return '%.2f %%'%(100*a/b)
rb=rest['late_basis']; rt=rest['late_total']; notH=rt-rb.get('HUMAN_OBSERVATION',0)
# strips: species with >=4 distinct record years, outside the 13
strips=''
Y0,Y1=1750,2150
rows=sorted([s for s in sp.values() if s['n_years']>=4 and s['name'] not in SP['big_names']],key=lambda s:s['last'])
for s in rows:
    f=lambda y:100*(min(max(y,Y0),Y1)-Y0)/(Y1-Y0)
    u=s['upper_all']; lo=f(s['first'])
    strips+='<tr><td><i>%s</i></td><td><div class="ax"><span class="span" style="left:%.1f%%;width:%.1f%%"></span><span class="ext" style="left:%.1f%%;width:%.1f%%"></span><span class="now" style="left:%.1f%%"></span></div></td><td>%d</td><td>%d</td></tr>'%(s['name'],lo,f(s['last'])-lo,f(s['last']),f(u)-f(s['last']),f(2026),s['last'],round(u))
bigl=', '.join('<i>%s</i>'%n for n in SP['big_names'])
reach_a,reach_h=rest['reach_all'],rest['reach_human']
html='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The last record is not the last sighting — cycle 004, session 4</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1c1a;--mut:#6b675f;--rule:#d9d4c8;--a:#8a3b12;--b:#4a6a8a}
@media (prefers-color-scheme:dark){:root{--bg:#16150f;--fg:#ece8dc;--mut:#a29c8c;--rule:#3a372d;--a:#e08a5a;--b:#7fa4c8}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}
main{max-width:46rem;margin:0 auto;padding:1.5rem 16px 4rem}
h1{font-size:1.9rem;line-height:1.2}h2{margin-top:2.2rem;font-size:1.25rem}
table{border-collapse:collapse;width:100%%;font:14px/1.4 system-ui,sans-serif}th,td{border-bottom:1px solid var(--rule);padding:.3rem .4rem;text-align:left;vertical-align:middle}
.mut{color:var(--mut)}.n{font-weight:bold;color:var(--a)}
.ax{position:relative;height:10px;min-width:150px;background:linear-gradient(var(--rule),var(--rule)) center/100%% 1px no-repeat}
.ax span{position:absolute;top:2px;height:6px}.span{background:var(--b)}.ext{background:var(--a);opacity:.55}.now{width:2px;top:0!important;height:10px!important;background:var(--fg)}
</style></head><body><main>
<p class="mut">The Atelier · cycle 004 (<em>Missing Data Art</em>, read through human extinction) · session 4 · 2026-10-04 · reach-outside session</p>
<h1>The last record is not the last sighting</h1>
<p><b>Finding.</b> GBIF's backbone lists %(asked)d accepted bird species with threat status EXTINCT. <span class="n">%(bn)d of them</span> carry records of living birds (hoopoe, wheatear, snipe among them): together they hold <span class="n">%(bt)s</span> records dated 1950 or later, <span class="n">%(bshare)s</span> of all such records on the list, nearly all human observations. Take them out and the other <span class="n">%(rn)d</span> hold %(rt)d late records, of which <span class="n">%(nh)s</span> are not human observations — mostly fossils. A rule that infers the end of a species from its last dated record would read the first group as alive and the second as possibly alive for the wrong reason. The date is a claim about the recorder and the label, before it is a claim about the bird.</p>
<h2>1. What was read, and what was made of it</h2>
<p>Source read for this session, from a field this practice had not worked: Caley &amp; Barry, <i>Quantifying Extinction Probabilities from Sighting Records: Inference and Uncertainties</i>, PLOS ONE 2014 (PMC4005750). It treats a species' sightings as a process with a detection probability and asks when it stopped; its own warning is that models with substantially different extinction outcomes can produce similar sighting data, and that letting the population vary before extinction changes the inference substantially (their worked case: from 93.8 %% to 26.9 %%). The rule used here is far simpler than theirs and is <b>my derivation, not theirs</b>: with n distinct record years in a span S and the last at L, a one-sided 95 %% upper limit for the end of the range is L + S·(0.05<sup>−1/(n−1)</sup> − 1). Its coverage was checked by simulation in <code>check.py</code>; I did not read the paper that first gave it.</p>
<h2>2. The two groups</h2>
<table><tr><th></th><th>species</th><th>with a record 1950+</th><th>records 1950+</th><th>human obs. among them</th><th>species with human obs. 1990+</th></tr>
<tr><td>≥1,000 records 1950+</td><td>%(bn)d</td><td>%(bl)d</td><td>%(bt)s</td><td>%(bh)s</td><td>%(bh90)d</td></tr>
<tr><td>the rest</td><td>%(rn)d</td><td>%(rl)d</td><td>%(rt)d</td><td>%(rh)d (%(rhp)s)</td><td>%(rh90)d</td></tr></table>
<p class="mut">The 1,000 line is post hoc: the sorted counts jump from 3,625 to 549 there. The thirteen: %(bigl)s. Why GBIF's species-level category reads extinct for them is untraced here; the Field's session of 2026-10-04 found the same label on species whose own category is not extinct, and this is the same pattern in birds.</p>
<h2>3. Where the rule leaves the rest</h2>
<p>Of the %(n4r)d species outside the thirteen with four or more distinct record years, <span class="n">%(g10)d</span> have an upper limit more than ten years after their last record. Counting <i>all</i> records the limit reaches 2026 for <span class="n">%(ra)d</span> of the %(rn)d; counting human observations only, for <span class="n">%(rhh)d</span>; the two lists differ by <span class="n">%(rd)d</span> species. The passenger pigeon's last dated record is 1994 and is a fossil; the dodo has three human-observation records (Réunion 2018 and 2019, Mauritius 2010), which were not opened — so no claim about what they are.</p>
<table><tr><th>species (distinct record years ≥ 4)</th><th>1750 ▸ 2150, dark line = 2026</th><th>last</th><th>95 %% limit</th></tr>%(strips)s</table>
<p class="mut">Blue: first to last record year. Orange: last record to the upper limit (clipped at 2150).</p>
<h2>4. Predictions, committed before the counts (<code>PREDICTIONS.md</code>)</h2>
<p>P1 (30–70 %% with a late record): <b>held</b>, %(la)d of %(asked)d. P2 (most late records not human observations): <b>refuted</b> on the list as asked (the thirteen outweigh everything); true of the rest only after the split, which was made after seeing the counts. P3 (≥5 species with human obs. 1990+): <b>held</b>, %(h90)d. P4 (half of n≥4 species with a limit >10 y past the last record): <b>held</b>, %(n4g)d of %(n4)d. P5 (the two lists differ by ≥3): <b>held</b>. Refutation condition R2 — most late records being human observations — <b>fired</b> on the pooled list; the finding is stated about that, not against it.</p>
<h2>5. Limits</h2>
<p>One query day, one aggregator, one class. Years come from GBIF's year facet; records with no year are not counted. A record year is not a sighting: the rule treats distinct years as sightings with equal effort, which Caley &amp; Barry's result says is the assumption that moves the answer most, and recording effort for birds has grown by orders of magnitude since 1990. The upper limit is a property of the rule, not of the bird. Not rendered in a browser. No script on this page; <code>check.py</code> recounts it.</p>
</main></body></html>'''%dict(asked=S['asked'],bn=big['species'],bt='{:,}'.format(big['late_total']),bshare=pct2(big['late_total'],big['late_total']+rest['late_total']),
 rn=rest['species'],rt=rt,nh=pct(notH,rt),bigl=bigl,bl=big['late_any'],bh='{:,}'.format(big['late_basis'].get('HUMAN_OBSERVATION',0)),bh90=big['human_after1990_species'],
 rl=rest['late_any'],rh=rb.get('HUMAN_OBSERVATION',0),rhp=pct(rb.get('HUMAN_OBSERVATION',0),rt),rh90=rest['human_after1990_species'],
 n4r=rest['n4'],g10=rest['n4_gap_gt10'],ra=reach_a,rhh=reach_h,rd=rest['reach_differs'],strips=strips,
 la=S['late_any'],h90=S['human_after1990_species'],n4g=S['n4_gap_gt10'],n4=S['n4'])
open(P+'index.html','w').write(html)
