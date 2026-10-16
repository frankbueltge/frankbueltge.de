"""Project 9 session 3: the work's page, if the registered decision rule declares one (SESSION3.md).

Form fixed before the data: the age distribution alone, one dot per living honouree at the naming year, and one per dead honouree at
the years since death, apart. Naming years: session 2's re-dating and session 3's together. No exact age under 25; no number or link
for anyone under 18 at naming (SELECTION.md criterion 3; LINES.md rounds 1-4). No names, no citation text.
Usage: python3 work_build.py -> named-into-the-sky/index.html
"""
import json, os, statistics

r1 = {r["n"]: r for r in json.load(open("rows.json"))}
r2 = {r["n"]: r for r in json.load(open("rows2.json"))}
r3 = {r["n"]: r for r in json.load(open("session3_rows.json"))}
s3 = json.load(open("session3.json"))
v3 = json.load(open("verify3.json")) if os.path.exists("verify3.json") else s3


def ny(n):
    return r3[n]["naming_year"] if n in r3 else r2[n]["naming_year"]


def kind(n):
    a, b = r2[n], r1[n]
    return "s" if a["student_v"] else "t" if a["mentor"] else "f" if b.get("family") else "o"


liv, dead = [], []
for n, x in r2.items():
    if not x["cited"] or x.get("naming_unknown") or ny(n) is None or x["birth"] is None:
        continue
    if x["status"] == "living":
        liv.append((n, ny(n) - x["birth"], ny(n), kind(n)))
    elif x["status"] == "dead" and x["death"] is not None:
        dead.append((n, ny(n) - x["death"], ny(n), x["death"] - x["birth"]))
liv = [t for t in liv if t[1] >= 0]
L = [[n if a >= 18 else 0, min(a // 5, 20), y, k, a if a >= 25 else -1] for n, a, y, k in sorted(liv, key=lambda t: (min(t[1] // 5, 20), t[3], t[2]))]
D = [[n, min(g // 5, 40), y, g, life] for n, g, y, life in sorted(dead, key=lambda t: (min(t[1] // 5, 40), t[2]))]
bands = {}
for r in L:
    bands[r[1]] = bands.get(r[1], 0) + 1
top = max(bands, key=bands.get)
b1519 = bands.get(3, 0)
fin1519 = sum(1 for r in L if r[1] == 3 and r[3] == "s")
others = [a for n, a, y, k in liv if k not in ("s", "t")]
gaps = [g for n, g, y, l in dead]
med_o, med_g = statistics.median(others), statistics.median(gaps)
under18 = sum(1 for r in L if r[0] == 0)

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Named into the Sky</title><link rel="icon" href="data:,">
<meta name="description" content="How old people are when a minor planet is named after them: {len(L) + len(D)} honourees, one dot each.">
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#6b6a64;--line:#d9d6cc;--o:#9a968a;--s:#c0571c;--t:#7a5aa8;--f:#2e7d5b;--d:#3b5f86;--panel:#f1efe8}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#151513;--fg:#ecebe6;--mut:#a3a197;--line:#3a3934;--o:#6c6a62;--s:#f0905a;--t:#b394e0;--f:#62c49a;--d:#7fa9d6;--panel:#22221f}}}}
:root[data-theme="dark"]{{--bg:#151513;--fg:#ecebe6;--mut:#a3a197;--line:#3a3934;--o:#6c6a62;--s:#f0905a;--t:#b394e0;--f:#62c49a;--d:#7fa9d6;--panel:#22221f}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:1000px;margin:0 auto;padding:28px 16px 110px}}h1{{font-size:2.2rem;margin:.2em 0}}h2{{font-size:1.15rem;margin-top:2.2em}}
.lede{{font-size:1.15rem;max-width:44em}}.mut{{color:var(--mut)}}.sm{{font:13px/1.45 system-ui,sans-serif}}a{{color:var(--d)}}
.fig{{overflow-x:auto;padding:6px 0 2px}}.bands{{display:flex;align-items:flex-end;gap:4px;min-width:max-content}}
.band{{display:flex;flex-direction:column;align-items:center}}.dots{{display:grid;grid-template-columns:repeat(5,7px);gap:1px;transform:scaleY(-1)}}
.d{{width:7px;height:7px;border:0;padding:0;border-radius:50%;background:var(--o);cursor:pointer}}
.d.s{{background:var(--s)}}.d.t{{background:var(--t)}}.d.f{{background:var(--f)}}.d.x{{background:var(--d)}}
.d:focus,.d.on{{outline:2px solid var(--fg);outline-offset:1px}}
.bl{{font:10px system-ui,sans-serif;color:var(--mut);margin-top:4px;white-space:nowrap}}
.key{{font:13px system-ui,sans-serif;margin:8px 0}}.key span{{display:inline-block;width:9px;height:9px;border-radius:50%;margin:0 4px 0 12px;vertical-align:middle}}
#say{{position:fixed;left:0;right:0;bottom:0;background:var(--panel);border-top:1px solid var(--line);padding:12px 16px;min-height:4.2em;font:15px/1.45 system-ui,sans-serif}}
</style></head><body><main>
<h1>Named into the Sky</h1>
<p class="lede">When an asteroid is given a name, the International Astronomical Union prints a sentence or two about who it is named
after, and often the year that person was born. The rock will circle the Sun for longer than anyone will remember them.
How old were they when it was named for them?</p>
<p class="lede">Most often: <b>fifteen to nineteen</b>.</p>
<div class="key"><span style="background:var(--s)"></span>finalist of a school science competition<span style="background:var(--t)"></span>teacher of a finalist
<span style="background:var(--f)"></span>a discoverer's child or grandchild<span style="background:var(--o)"></span>anyone else</div>
<h2>Alive when named: age at naming</h2>
<div class="fig"><div class="bands" id="liv"></div></div>
<p class="sm mut">One dot per person, in five-year bands; the last holds everyone named at 100 or older. {b1519} people were fifteen to nineteen, {fin1519} of them named, by their citations, for a school science
competition. Of everyone who was not a finalist or a teacher, the middle age is {med_o:g}.</p>
<h2>Dead when named: years since death</h2>
<div class="fig"><div class="bands" id="dead"></div></div>
<p class="sm mut">One dot per person, in five-year bands; the last holds everyone named 200 years or more after death. The middle wait is
{med_g:g} years.</p>
<p class="sm mut" style="margin-top:2.4em">A random 3,000 of the 26,519 minor planets named by October 2026; the {len(L) + len(D):,} whose
citation gives the honouree's years. Where a later correction stands in the record, the year the name was first published is used.
No exact age is shown under 25, and the {under18} people under 18 when named carry no number or link: they did not ask to be counted.
For the others the number leads to the record at JPL, where the name and the citation stand.
How this was read, and what it could not read: <a href="../">the study</a>. Remainder, 2026.
Data: Solar System Dynamics, JPL (downloaded 2026 October 15-16); IAU Minor Planet Center; the citations are not reproduced.</p>
</main>
<div id="say" aria-live="polite">Tap a dot.</div>
<script>
const L={json.dumps(L, separators=(',', ':'))};
const D={json.dumps(D, separators=(',', ':'))};
const NB=21;
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
draw('liv',L,NB,b=>b==20?'100+':(b%2?'':b*5),r=>r[3],r=>`Named in ${{r[2]}}, ${{r[4]>=0?'aged '+r[4]:'aged '+(r[1]*5)+'-'+(r[1]*5+4)}}: ${{K[r[3]]}}.`+link(r[0]));
draw('dead',D,41,b=>b==40?'200+':(b%4?'':b*5),r=>'x',r=>`Named in ${{r[2]}}, ${{r[3]}} years after a death at about ${{r[4]}}.`+link(r[0]));
</script>
</body></html>
"""
os.makedirs("named-into-the-sky", exist_ok=True)
open("named-into-the-sky/index.html", "w").write(html)
print("ok", len(L), len(D), "top band", top * 5, b1519, fin1519, med_o, med_g, under18)
