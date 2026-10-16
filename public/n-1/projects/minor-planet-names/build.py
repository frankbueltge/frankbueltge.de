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
v2 = json.load(open("verify2.json"))
_v3 = json.load(open("verify3.json"))
v3 = {"batches": 178, "testable": sum(_v3["kinds_verified"].values()), "new": _v3["kinds_verified"]["new"],
      "nf": _v3["kinds_verified"]["not found"], "mpc": 1733}
r2 = {r["n"]: r for r in json.load(open("rows2.json"))}
# session 2: ages and gaps at the naming year (re-dated where the standing citation is an erratum); citations whose naming
# year is unknown (re-issued for a discovery credit or a trailing space) are set aside
for r in rows:
    x = r2[r["n"]]
    r["cite_year"], r["age"], r["gap"], r["unknown"] = x["naming_year"], x["age"], x["gap"], x["naming_unknown"]
cited = [r for r in rows if r.get("cited") and not r["unknown"]]


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



def slope(pairs, y0, y1, top, bottom, w=960, h=214, pad=24):
    """Lines between two time axes: a start year on the upper axis, an end year on the lower one. A pair without a start
    is a short dashed stub above its end. pairs: (start or None, end, count, css class, title)."""
    X = lambda y: pad + (y - y0) / (y1 - y0) * (w - 2 * pad)
    ya, yb = 38, h - 44
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{top} above, {bottom} below" class="sl">']
    for yy, lab, ty, tky in ((ya, top, 12, ya - 9), (yb, bottom, h - 4, yb + 18)):
        out.append(f'<line x1="{pad}" x2="{w - pad}" y1="{yy}" y2="{yy}" class="ax"/>')
        out.append(f'<text x="{w - pad}" y="{ty}" class="lab" text-anchor="end">{lab}</text>')
        for y in range(y0, y1 + 1):
            if y % 5 == 0:
                out.append(f'<line x1="{X(y):.1f}" x2="{X(y):.1f}" y1="{yy - 4}" y2="{yy + 4}" class="ax"/>')
                out.append(f'<text x="{X(y):.1f}" y="{tky}" class="tk">{y}</text>')
    for a, b, c, cls, t in sorted(pairs, key=lambda p: -p[2]):
        sw = min(1.2 + 0.5 * (c - 1), 9)
        if a is None:
            out.append(f'<line x1="{X(b):.1f}" x2="{X(b):.1f}" y1="{yb - 30}" y2="{yb}" class="ln {cls} un" '
                       f'style="stroke-width:{sw}"><title>{t}</title></line>')
        else:
            out.append(f'<line x1="{X(a):.1f}" x2="{X(b):.1f}" y1="{ya}" y2="{yb}" class="ln {cls}" '
                       f'style="stroke-width:{sw:.1f}"><title>{t}</title></line>')
    out.append("</svg>")
    return "".join(out)


# session 2, question 1: the bulletin-dated citations that are not the naming
re_rows = [x for x in r2.values() if x.get("redated")]
E1 = []
for x in re_rows:
    if x["section"] == "erratum":
        a = int(x["earlier_date"][:4])
        E1.append((a, x["cite_year"], 1, "e", f"first published {a}; the date that stands is a correction of {x['cite_year']}"))
    else:
        E1.append((None, x["cite_year"], 1, "u", f"re-issued {x['cite_year']} for a discovery credit or a trailing space; first publication not given"))
svg_err = slope(E1, 1985, 2026, "first published", "the date that stands now")
# session 2, question 2: the competition and the naming, finalists (orange) and teachers (violet), counted per pair
pairs = {}
for x in r2.values():
    if x.get("cited") and x.get("occasion") and x.get("lag") is not None and (x["student_v"] or x["mentor"]) \
            and 2000 <= x["occasion"] <= 2026:
        k = (x["occasion"], x["naming_year"], "s" if x["student_v"] else "t")
        pairs[k] = pairs.get(k, 0) + 1
E2 = [(a, b, c, k, f"{c} {'finalist' if k == 's' else 'teacher'}{'s' if c > 1 else ''}: competition {a}, named {b}")
      for (a, b, k), c in pairs.items()]
svg_lag = slope(E2, 2000, 2026, "the competition", "the naming")
lagy = v2["lag_by_naming_year"]
n_liv, n_dead = len(L), len(D)
u18 = v["living_under_18"]
share19 = round(100 * s1["share_19_or_under"])
band1519 = sum(1 for r in L if r[1] == 3)
import statistics
gaps = [r["gap"] for r in dead]
gq = statistics.quantiles(gaps, n=4)
gle5 = sum(1 for g in gaps if g <= 5)

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
.sl{{display:block;margin:10px 0 4px;min-width:680px}}.sl .ax{{stroke:var(--line);stroke-width:1}}.sl .lab{{font:12px system-ui,sans-serif;fill:var(--fg)}}
.sl .tk{{font:10px system-ui,sans-serif;fill:var(--mut);text-anchor:middle}}.sl .ln{{stroke-opacity:.45;stroke-linecap:round}}
.sl .ln.e{{stroke:var(--d)}}.sl .ln.u{{stroke:var(--o);stroke-dasharray:3 3;stroke-opacity:.8}}.sl .ln.s{{stroke:var(--s);stroke-opacity:.6}}.sl .ln.t{{stroke:var(--t);stroke-opacity:.6}}
</style></head><body><main>
<p class="sm mut">Remainder &middot; project 9, sessions 1-3 &middot; the study behind the work <a href="named-into-the-sky/">Named into the Sky</a> &middot; 2026-10-16</p>
<h1>Named into the sky</h1>
<p>When a minor planet (an asteroid) is given a name, the International Astronomical Union publishes a short citation saying who or
what it is named after. Most names honour a person, and the citation often gives the year that person was born. A body that will
circle the Sun for longer than any person will remember them is named, on a given day, after someone of a given age.</p>
<p>How old? Of 3,000 named minor planets drawn at random from the 26,519 named so far, {len(cited)} carry a citation. {n_liv} of them
honour a person who was alive when named and give a birth year; {n_dead} honour someone already dead. Each is one dot below,
placed by the year of naming (see "The date that stands", below).
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
<p class="sm mut">The last band holds everyone named 200 years or more after death. A quarter of the dead were named within {int(gq[0])}
years of dying ({gle5} of {n_dead}); the median is {statistics.median(gaps):g} years; a quarter waited more than
{int(gq[2])}.</p>

<h2>When the finalists were named</h2>
<div class="yrs" id="yrs"></div>
<p class="sm mut">Citations per year of naming in the sample, 1990-2026. Orange: finalists of school
competitions; violet: their teachers. Finalists were {round(100*v["student_2002_2012_v"][2])} % of all citations of 2002-2012 and
{round(100*v["student_2020_on_v"][2],1)} % since 2020.</p>

<h2>The date that stands</h2>
<p>The record gives each citation one date: that of its publication reference. Since 2021 new names are published in the bulletins
of the IAU's naming group. Of the {v2["wgsbn_cited"]} citations in the sample that carry a bulletin's date, <b>{v2["redated"]} are not
the naming</b>. {v2["erratum"]} stand in a list of errata: an old citation corrected, and the correction becomes its date. The corrections
are nearly all small: an American spelling for a British one, a title set in italics instead of quotation marks, "near-earth" made
"near-Earth", a comma removed after a birth year. Each line below runs from the year a citation was first published to the year that
now stands for it: a median of {v2["erratum_years_moved_median"]} years later, at most {v2["erratum_years_moved_max"]}. The other
{v2["other_redated"]} (dashed) were re-issued for a corrected discovery credit, or because seven names had been published with a
trailing space.</p>
<div class="fig">{svg_err}</div>
<p class="sm mut">Counted only where the bulletins can be read (citations dated 2021-2026). Older citations carry the date of a batch of the Minor Planet
Circulars. Session 3 opened every batch the sample names ({v3["batches"]} of them): {v3["new"]} of the {v3["testable"]} citations stand there under
"New names of minor planets", none under a correction, none pointing to an earlier page; {v3["nf"]} are not in the batch the database names
at all, and where they were first published was not found. Re-dating moves {v2["moved_band"]} of
{v2["living_with_age"]} living people into another five-year band of age; the dots above are placed by the year of first
publication.</p>

<h2>The competition and the naming</h2>
<p>A finalist is named for a competition, and the competition has a year of its own. Each line below runs from the year of the
competition to the year of naming; the thicker the line, the more people. Through 2018, 355 of 360 finalists were named within a
year of their competition: most at fifteen to nineteen, the middle-school finalists at twelve to fourteen. In the sample no finalist is named in 2019 or 2020. Then the finalists of 2018-2020 were named in 2021-2023, a
median of four years later, at a median age of {v2["median_age_student_named_2020_on"]}: adults named for what they did at school.
Later competitions do not appear.</p>
<div class="fig">{svg_lag}</div>
<p class="sm mut">Orange: finalists ({v2["student_with_lag"]} with a competition year); violet: their teachers. The competition year is the
first year in the citation outside the person's own years; 30 read, 30 right. Why the naming paused and ended is not in the
citations, and is not guessed here.</p>

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
<tr><th>Session 2</th><td>Every bulletin-dated citation looked up in its bulletin: 137 errata read (each names where the line was
first published, dated by the circulars' archive), 20 of the new names read (20 right). 6 predictions registered before
(<a href="SESSION2.md">SESSION2.md</a>); 2 held: the finalists' wait grew, and those named since 2020 were adults. 4 failed: errata
were a quarter, not under a twentieth; re-dating moved 3.5 %, not under 2 %, of ages; the median wait is 0, not 2 years; the
commonest age at the competition is 18, not 17. <a href="JOURNAL2.md">JOURNAL2.md</a>.</td></tr>
<tr><th>Session 3</th><td>The {v3["mpc"]} citations dated by a batch of the circulars: each batch downloaded and the entry looked up
(<a href="SESSION3.md">SESSION3.md</a>, registered before). 5 predictions; 4 held (none of the found stand outside the new names; none
points to an earlier page; 15-19 stays the largest band; no age moves), 1 failed (93.5 % found, not 95 %). Read: the 5 flagged as
something else were all first namings (5 wrong, corrected); 20 random first namings, 20 right; all 109 missing ones looked for by
number and name. <a href="JOURNAL3.md">JOURNAL3.md</a>.</td></tr>
<tr><th>Limits</th><td>Before 2021, no citation in the sample is a correction; {v3["nf"]} could not be found in the batch the database names, so their dates
are the database's. With all of them set aside the largest band is still 15-19. Twelve living people whose first
publication is unknown are set aside. Citations without a year (most places, things and many people) are not drawn. Not tested by
a stranger.</td></tr>
</table></div>
<p class="sm mut">Data: Solar System Dynamics (downloaded 2026 October 15), Small-Body Database API, https://ssd.jpl.nasa.gov;
list of names: IAU Minor Planet Center. The citations are the IAU's and are not reproduced here. Code and counts:
<a href="build.py">build.py</a>, <a href="rows.json">rows.json</a>, <a href="verify.json">verify.json</a>,
<a href="rows2.json">rows2.json</a>, <a href="verify2.json">verify2.json</a>, <a href="rows3.json">rows3.json</a>, <a href="verify3.json">verify3.json</a>.
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
document.querySelectorAll('svg.sl').forEach(v=>{{const f=v.parentNode;f.scrollLeft=f.scrollWidth}});
const ym=Math.max(...Y.map(y=>y[1])),yb=document.getElementById('yrs');
Y.forEach(([y,n,s,t])=>{{const c=document.createElement('div');c.className='yb';const h=v=>Math.round(120*v/ym)+'px';
 c.title=`${{y}}: ${{n}} citations, ${{s}} finalists, ${{t}} teachers`;
 c.innerHTML=`<i style="height:${{h(n-s-t)}}"></i><i class="t" style="height:${{h(t)}}"></i><i class="s" style="height:${{h(s)}}"></i>${{y%5?'':y}}`;yb.appendChild(c)}});
</script>
</body></html>
"""
open("index.html", "w").write(html)
print("ok", n_liv, n_dead, len(Y))
