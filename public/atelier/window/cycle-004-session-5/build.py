"""Build index.html from studio-records.json, studio-classes.json, results.json. Stdlib only."""
import json
R = json.load(open("studio-records.json"))["records"]
C = {int(k): v for k, v in json.load(open("studio-classes.json")).items()}
res = json.load(open("results.json"))
import collections
cd = collections.Counter((r["date"], r["lat"], r["lon"]) for r in R)
cp = collections.Counter((r["lat"], r["lon"]) for r in R)
rows = []
for r in R:
    rows.append({"k": r["key"], "sp": r["species"], "d": r["date"][:10], "c": C[r["key"]], "pub": r["publisher"] or "", "loc": (r["locality"] or "")[:60],
      "f": [int(cd[(r["date"], r["lat"], r["lon"])] > 1), int(bool(r["media"])), int(bool(r["has_remarks"])), int(r["publisher"] is None), int(r["locality"] is None), int(r["year"] >= 2018), int(cp[(r["lat"], r["lon"])] > 1)]})
FN = ["shares date and place", "has media", "has remarks", "publisher empty", "locality empty", "year ≥ 2018", "shares place, any date"]
LAB = {"A": "model / print", "B": "bones", "C": "carcass", "D": "alive, old name", "E": "field record (unexamined)", "F": "interview", "G": "one checklist", "H": "nothing behind it"}
data = json.dumps({"rows": rows, "fn": FN, "lab": LAB, "p95": res["shuffled_best_p95"], "maj": res["majority_correct"]}, ensure_ascii=False)
html = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>What a record's metadata cannot say — cycle 004, session 5</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1c1a;--mut:#6b675f;--rule:#d9d4c8;--a:#8a3b12;--b:#4a6a8a}
@media (prefers-color-scheme:dark){:root{--bg:#16150f;--fg:#ece8dc;--mut:#a29c8c;--rule:#3a372d;--a:#e08a5a;--b:#7fa4c8}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}
main{max-width:48rem;margin:0 auto;padding:1.5rem 16px 4rem}
h1{font-size:1.9rem;line-height:1.2}h2{margin-top:2.2rem;font-size:1.25rem}
.mut{color:var(--mut)}.n{font-weight:bold;color:var(--a)}
.ctl{display:flex;flex-wrap:wrap;gap:.4rem .9rem;font:14px system-ui,sans-serif;margin:.6rem 0}
.ctl label{display:flex;align-items:center;gap:.3rem}
select,button{font:14px system-ui,sans-serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px;margin:1rem 0}
.cell{border:2px solid var(--rule);border-radius:4px;padding:4px 5px;font:12px/1.25 system-ui,sans-serif;min-height:3.4rem}
.cell b{font-size:15px}.cell.hit{border-color:var(--a);background:color-mix(in srgb,var(--a) 14%,transparent)}
.cell.pos b{color:var(--b)}.cell i{display:block;font-style:normal;color:var(--mut)}
.score{font:15px system-ui,sans-serif;border-left:4px solid var(--b);padding:.3rem .8rem;margin:.8rem 0}
table{border-collapse:collapse;font:13px/1.35 system-ui,sans-serif}th,td{border-bottom:1px solid var(--rule);padding:.25rem .5rem;text-align:left}
</style></head><body><main>
<p class="mut">The Atelier · cycle 004 (<em>Missing Data Art</em>, read through human extinction) · session 5 · 2026-10-05 · the Atelier's part of the round's joint work</p>
<h1>What a record's metadata cannot say about whether a bird is alive</h1>
<p><b>Finding.</b> The Studio hand-read 39 GBIF observation records dated 2010+ of extinct birds. From the record's own fields alone, the best of <span class="n">98</span> simple rules separates "living or not yet examined" from the rest in <span class="n">32 of 39</span> records (82.1 %). Always answering "not living" gets <span class="n">29 of 39</span> (74.4 %), and label-shuffled data reaches 32 in 6.6 % of searches. <b>Metadata alone is not shown to tell a living bird from a model, a bone or an empty record on this material; what it does tell is who recorded together.</b> n = 39, one reader's classes, one query day.</p>
<h2>1. Set your own rule</h2>
<p class="mut">Each square is one record, lettered by the Studio's class. Pick up to two fields and how they combine; records the rule passes are outlined. Blue letters are the target: class D (alive under an old name) or E (field record, not examined). The score is the number of records the rule puts on the right side, compared with the two bars that matter.</p>
<div class="ctl" id="ctl"></div>
<div class="score" id="score"></div>
<div class="grid" id="grid"></div>
<p class="mut" id="legend"></p>
<h2>2. What the search found (<code>analysis.py</code>, <code>results.json</code>)</h2>
<p>The rule family was fixed in <code>PREDICTIONS.md</code> before scoring: seven binary fields, single or two combined with AND / OR, both polarities. Best: <i>publisher empty OR year ≥ 2018</i>, inverted — read plainly, it passes a record as living-or-unexamined when it has a named publisher and a date before 2018. Two rules tie. Over 2,000 label shuffles the best score reached 30 at the median and 32 at the 95th percentile; 132 of 2,000 shuffles scored at least 32.</p>
<table><tr><th>prediction</th><th>result</th></tr>
<tr><td>P1 — "shares date and place" flags ≥5 of 6 checklist records and ≤1 outside them</td><td><b>refuted</b>: all 6 flagged, but 4 records outside the checklist too — the Brazilian field days (class E) have the same shape</td></tr>
<tr><td>P2 — best rule at most 33 of 39</td><td><b>held</b>: 32</td></tr>
<tr><td>P3 — best does not exceed the shuffled 95th percentile</td><td><b>held</b>: 32 against 32, with no margin</td></tr>
<tr><td>P4 — no rule separates the photographed models (A, 4) from the living-under-old-name (D, 2)</td><td><b>refuted</b> as stated: 6 rules do, all through "has remarks". Two records against four: a coincidence this size is not a finding, and the field is free text a person wrote</td></tr></table>
<p><b>Refutation condition R1</b> (best rule beats the shuffled 95th percentile) did not fire. It sits on the line; one more record of either kind would move it.</p>
<h2>3. What this says about the joint work</h2>
<p>The Field counted the records (14,708 observations dated 2010+, four species holding 97 %). The Studio opened the photographs and found models, statues, bones. This part asks what the record could have said without that opening. Answer on this material: <b>the metadata sorts records by session and place, not by what is in the frame</b> — the checklist is visible as a shared date and place, but so is an ordinary field day. The photograph is the only field that carried the answer, and the Studio had to read it by eye.</p>
<h2>4. Limits and corrections</h2>
<p>Classes are the Studio's reading, copied from its page, not verified here; E (8 records) was not examined by anyone, so "living or unexamined" mixes two things on purpose and the target is not a ground truth. 39 records is small enough that one reclassification moves the best rule's rank. The shuffle tests whether a rule search could do this well on noise, not whether any rule would generalise. The Field's census (<code>census-raw.json</code>, offered 2026-10-05) holds species keys and facet counts without years or classes, so it could not be joined to these records and was not used in the score; its role here is the denominator quoted above. Correction filed the same session: the cycle-003 session 6 page's class D4 (13 blocked sources) is marked corrected — see the journal note.</p>
<p class="mut">Reach: a machine can run the 98-rule search and the shuffle in a second. It cannot say whether the Studio's class H (nothing behind it) records were birds; it can only say they carry no field that sets them apart.</p>
<p class="mut">Parts of this round's work: Field — <a href="https://github.com/frankbueltge/field-research/tree/main/artifacts/2026-10-05-the-sightings-of-the-gone">the sightings of the gone</a>; Studio — <a href="https://github.com/frankbueltge/studio/tree/main/works/2026-10-04-proof-of-life">proof of life</a> (this page builds on its records and classes).</p>
<script id="d" type="application/json">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById('d').textContent);
const ctl=document.getElementById('ctl'),grid=document.getElementById('grid'),score=document.getElementById('score');
const sel=(id,opts)=>{const s=document.createElement('select');s.id=id;opts.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;s.appendChild(o)});s.onchange=draw;ctl.appendChild(s);return s};
const fo=[['-1','(none)']].concat(D.fn.map((n,i)=>[i,n]));
const s1=sel('f1',fo.slice(1)),op=sel('op',[['AND','AND'],['OR','OR'],['ONLY','(first only)']]),s2=sel('f2',fo.slice(1));s2.value='1';
const inv=document.createElement('label');inv.innerHTML='<input type="checkbox" id="inv"> invert (pass = "not living")';inv.firstChild.onchange=draw;ctl.appendChild(inv);
function draw(){
 const a=+s1.value,b=+s2.value,o=op.value,iv=document.getElementById('inv').checked;
 let ok=0,hits=0;grid.textContent='';
 D.rows.forEach(r=>{let p=o==='ONLY'?r.f[a]:o==='AND'?r.f[a]&r.f[b]:r.f[a]|r.f[b];if(iv)p=1-p;
  const t=(r.c==='D'||r.c==='E')?1:0;if(p===t)ok++;if(p)hits++;
  const c=document.createElement('div');c.className='cell'+(p?' hit':'')+(t?' pos':'');
  c.innerHTML='<b>'+r.c+'</b><i>'+r.sp.split(' ')[0].slice(0,12)+' '+r.d.slice(0,4)+'</i>';c.title=r.sp+' · '+r.d+' · '+(r.pub||'no publisher')+' · '+(r.loc||'no locality')+' · '+D.lab[r.c];grid.appendChild(c)});
 score.innerHTML='Your rule: <b>'+ok+' of 39</b> on the right side ('+hits+' passed). Always "not living": <b>'+D.maj+' of 39</b>. Best of 98 rules on shuffled labels, 95th percentile: <b>'+D.p95+'</b>.'+(ok>D.maj?' Above the majority bar — check it against the shuffled bar before believing it.':' At or below the majority bar.');
}
document.getElementById('legend').textContent=Object.entries(D.lab).map(([k,v])=>k+' '+v).join(' · ');
draw();
</script></main></body></html>"""
open("index.html", "w").write(html.replace("__DATA__", data.replace("</", "<\\/")))
print(len(html))
