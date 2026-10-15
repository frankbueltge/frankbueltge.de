"""Project 9 session 1: build index.html from rows.json and the counts (no names, no citation text).

One dot per honouree. Living at naming: placed in a five-year band of age at naming. Dead at naming: placed in a
five-year band of years since death. No exact birth year is shown; no number or link for anyone under 18 at naming
(SELECTION.md criterion 3; LINES.md round 1).
Usage: python3 build.py  -> index.html
"""
import json

rows = json.load(open("rows.json"))
s1 = json.load(open("session1.json"))
v = json.load(open("verify.json"))
cited = [r for r in rows if r.get("cited")]


def kind(r):
    if r["student_v"]:
        return "s"
    if r["mentor"]:
        return "t"
    if r["family"]:
        return "f"
    return "o"


liv = [r for r in cited if r["status"] == "living" and r["age"] is not None]
dead = [r for r in cited if r["status"] == "dead" and r["gap"] is not None]
L = [[r["n"] if r["age"] >= 18 else 0, r["age"] // 5, r["cite_year"], kind(r), r["age"] if r["age"] >= 25 else -1]
     for r in sorted(liv, key=lambda r: (r["age"] // 5, kind(r), r["cite_year"]))]
D = [[r["n"], min(r["gap"] // 5, 40), r["cite_year"], r["gap"], r["death"] - r["birth"]]
     for r in sorted(dead, key=lambda r: (min(r["gap"] // 5, 40), r["cite_year"]))]
years = {}
for r in cited:
    y = r["cite_year"]
    if y and 1990 <= y <= 2026:
        a = years.setdefault(y, [0, 0, 0])
        a[0] += 1
        a[1] += r["student_v"]
        a[2] += r["mentor"]
Y = [[y] + years[y] for y in sorted(years)]

n_liv, n_dead = len(L), len(D)
u18 = v["living_under_18"]
share19 = round(100 * s1["share_19_or_under"])
band1519 = s1["age_bands"]["15-19"]

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Named Into the Sky</title><link rel="icon" href="data:,">
<meta name="description" content="How old people are when a minor planet is named after them: one dot for each of {n_liv + n_dead} honourees in a random sample of 3,000 named minor planets.">
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#6b6a64;--line:#d9d6cc;--o:#9a968a;--s:#c0571c;--t:#7a5aa8;--f:#2e7d5b;--d:#3b5f86;--panel:#f1efe8}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#151513;--fg:#ecebe6;--mut:#a3a197;--line:#3a3934;--o:#6c6a62;--s:#f0905a;--t:#b394e0;--f:#62c49a;--d:#7fa9d6;--panel:#22221f}}}}
:root[data-theme="dark"]{{--bg:#151513;--fg:#ecebe6;--mut:#a3a197;--line:#3a3934;--o:#6c6a62;--s:#f0905a;--t:#b394e0;--f:#62c49a;--d:#7fa9d6;--panel:#22221f}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 Georgia,serif}}
main{{max-width:1000px;margin:0 auto;padding:28px 16px 90px}}h1{{font-size:2rem;margin:.2em 0}}h2{{font-size:1.2rem;margin-top:2.4em}}
.mut{{color:var(--mut)}}.sm{{font:13px/1.45 system-ui,sans-serif}}a{{color:var(--d)}}
.fig{{overflow-x:auto;padding:6px 0 2px}}.bands{{display:flex;align-items:flex-end;gap:4px;min-width:max-content}}
.band{{display:flex;flex-direction:column;align-items:center}}.dots{{display:grid;grid-template-columns:repeat(6,7px);gap:1px;direction:ltr}}
.dots{{transform:scaleY(-1)}}.d{{width:7px;height:7px;border:0;padding:0;border-radius:50%;background:var(--o);cursor:pointer}}
.d.s{{background:var(--s)}}.d.t{{background:var(--t)}}.d.f{{background:var(--f)}}.d.x{{background:var(--d)}}
.d:focus,.d.on{{outline:2px solid var(--fg);outline-offset:1px}}
.bl{{font:10px system-ui,sans-serif;color:var(--mut);margin-top:4px;white-space:nowrap}}
.key{{font:13px system-ui,sans-serif;margin:8px 0}}.key span{{display:inline-block;width:9px;height:9px;border-radius:50%;margin:0 4px 0 12px;vertical-align:middle}}
#say{{position:sticky;bottom:0;background:var(--panel);border-top:1px solid var(--line);padding:12px 16px;min-height:4.2em;font:15px/1.45 system-ui,sans-serif}}
.yrs{{display:flex;gap:3px;align-items:flex-end;overflow-x:auto;padding:8px 0;height:150px}}
.yb{{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font:9px system-ui,sans-serif;color:var(--mut);min-width:16px;height:100%}}
.yb i{{display:block;width:11px;background:var(--o)}}.yb i.s{{background:var(--s)}}.yb i.t{{background:var(--t)}}
table{{border-collapse:collapse;font:13px system-ui,sans-serif;width:100%}}th,td{{padding:3px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}
.tw{{overflow-x:auto}}
</style></head><body><main>
<p class="sm mut">Remainder &middot; project 9, session 1 &middot; a study, not a work &middot; 2026-10-15</p>
<h1>Named into the sky</h1>
<p>When a minor planet (an asteroid) is given a name, the International Astronomical Union publishes a short citation saying who or
what it is named after. Most names honour a person, and the citation often gives the year that person was born. A body that will
circle the Sun for longer than any person will remember them is named, on a given day, after someone of a given age.</p>
<p>How old? Of 3,000 named minor planets drawn at random from the 26,519 named so far, {len(cited)} carry a citation. {n_liv} of them
honour a person who was alive when named and give a birth year; {n_dead} honour someone already dead. Each is one dot below.
The commonest age is not that of an astronomer at the end of a career. It is <b>fifteen to nineteen</b>: {band1519} people, nearly
all of them finalists of school science competitions, named in batches. Around them: astronomers, colleagues and benefactors at every
age from twenty to over ninety; a man named for his forthcoming 107th birthday; and the children and grandchildren of discoverers,
named as infants and young children.</p>
<div class="key"><span style="background:var(--s)"></span>school competition finalist<span style="background:var(--t)"></span>teacher of a finalist
<span style="background:var(--f)"></span>a discoverer's child or grandchild (a word in the citation's opening)<span style="background:var(--o)"></span>anyone else</div>

<h2>Alive when named: age at naming, in five-year bands</h2>
<div class="fig"><div class="bands" id="liv"></div></div>
<p class="sm mut">Each dot is one person, tap or hover for what the record says. No exact age is shown under 25, and no number or link
for anyone under 18 when named: they did not ask to be counted, and the page does not lead to them. For everyone else the number
leads to the record of the Solar System Dynamics group at JPL, where the name and the citation stand.</p>

<h2>Dead when named: years between death and naming</h2>
<div class="fig"><div class="bands" id="dead"></div></div>
<p class="sm mut">The last band holds everyone named 200 years or more after death. A quarter of the dead were named within six
years of dying ({v["dead_gap_le_5"]} of {n_dead} within five); the median is {s1["median_gap_dead"]} years; a quarter waited more than
{int(v["gap_quartiles"][2])}.</p>

<h2>When the finalists were named</h2>
<div class="yrs" id="yrs"></div>
<p class="sm mut">Citations per year in the sample, 1990-2026 (the year of the citation that stands now). Orange: finalists of school
competitions; violet: their teachers. Finalists were {round(100*v["student_2002_2012_v"][2])} % of all citations of 2002-2012 and
{round(100*v["student_2020_on_v"][2],1)} % since 2020.</p>

<h2>How this was read</h2>
<div class="tw"><table>
<tr><th>Frame</th><td>The Minor Planet Center's list of named minor planets, fetched 2026-10-15 (26,519 numbers); a random 3,000
(seed 20261015). Citations from JPL's Small-Body Database API. Registered before any citation was read:
<a href="SELECTION.md">SELECTION.md</a>.</td></tr>
<tr><th>Years</th><td>The first pair of years in the citation, "(1913-2002)", or a birth year, "(b. 1996)", decides; the year
of the citation comes from its publication reference. 60 citations read in full: 60 right.</td></tr>
<tr><th>Finalists</th><td>A citation naming a school competition or school. 30 read: 8 wrong, 7 of them teachers who mentored a
finalist; teachers were then counted apart. One remaining error is not corrected (an architect who went to a junior high school).</td></tr>
<tr><th>Predictions</th><td>6 registered; 2 held as registered (the largest band is 15-19; most objects carry a
citation), 3 after the teacher correction (finalists were a quarter of the citations of 2002-2012 and under a tenth since 2020). The ones that failed: the share 19 or under ({share19} %, predicted 30 %); the median age of the others (54.5,
predicted at least 55); the median wait after death (44 years, predicted over 50). <a href="JOURNAL.md">JOURNAL.md</a>.</td></tr>
<tr><th>Limits</th><td>Where a citation was later corrected, its year is the correction's, so an age can be too high: one living
age of 105 is such a case and stays in, as registered. Citations without a year (most places, things and many people) are not
drawn. Not tested by a stranger.</td></tr>
</table></div>
<p class="sm mut">Data: Solar System Dynamics (downloaded 2026 October 15), Small-Body Database API, https://ssd.jpl.nasa.gov;
list of names: IAU Minor Planet Center. The citations are the IAU's and are not reproduced here. Code and counts:
<a href="build.py">build.py</a>, <a href="rows.json">rows.json</a>, <a href="verify.json">verify.json</a>.
Lines and dangers of this page: <a href="LINES.md">LINES.md</a>.</p>
</main>
<div id="say" aria-live="polite">Tap a dot.</div>
<script>
const L={json.dumps(L, separators=(',', ':'))};
const D={json.dumps(D, separators=(',', ':'))};
const NB={max(r[1] for r in L)+1};
const Y={json.dumps(Y, separators=(',', ':'))};
const K={{s:'a finalist of a school science competition',t:'a teacher who mentored a finalist',f:"a discoverer's child or grandchild",o:'someone else'}};
const say=document.getElementById('say');let on=null;
function pick(b,t){{if(on)on.classList.remove('on');on=b;b.classList.add('on');say.innerHTML=t}}
function link(n){{return n?` <a href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${{n}}">(${{n}})</a>`:''}}
function draw(id,rows,nb,lab,cls,text){{const box=document.getElementById(id);const by={{}};
 rows.forEach(r=>{{(by[r[1]]=by[r[1]]||[]).push(r)}});
 for(let b=0;b<nb;b++){{const band=document.createElement('div');band.className='band';const g=document.createElement('div');g.className='dots';
  (by[b]||[]).forEach(r=>{{const d=document.createElement('button');d.className='d '+cls(r);d.setAttribute('aria-label',text(r).replace(/<[^>]+>/g,''));
   d.onclick=d.onmouseenter=d.onfocus=()=>pick(d,text(r));g.appendChild(d)}});
  const l=document.createElement('div');l.className='bl';l.textContent=lab(b);band.appendChild(g);band.appendChild(l);box.appendChild(band)}}}}
draw('liv',L,NB,b=>b%2?'':(b*5),r=>r[3],r=>`Named in ${{r[2]}}, ${{r[4]>=0?'aged '+r[4]:'aged '+(r[1]*5)+'-'+(r[1]*5+4)}}: ${{K[r[3]]}}.`+link(r[0]));
draw('dead',D,41,b=>b==40?'200+':(b%4?'':b*5),r=>'x',r=>`Named in ${{r[2]}}, ${{r[3]}} years after a death at about ${{r[4]}}.`+link(r[0]));
const ym=Math.max(...Y.map(y=>y[1])),yb=document.getElementById('yrs');
Y.forEach(([y,n,s,t])=>{{const c=document.createElement('div');c.className='yb';const h=v=>Math.round(120*v/ym)+'px';
 c.title=`${{y}}: ${{n}} citations, ${{s}} finalists, ${{t}} teachers`;
 c.innerHTML=`<i style="height:${{h(n-s-t)}}"></i><i class="t" style="height:${{h(t)}}"></i><i class="s" style="height:${{h(s)}}"></i>${{y%5?'':y}}`;yb.appendChild(c)}});
</script>
</body></html>
"""
open("index.html", "w").write(html)
print("ok", n_liv, n_dead, len(Y))
