"""Builds languages.html from session2.json + session2_specimens.json. Usage: python3 -I build2.py CLDRDIR (CLDRDIR only for English language names)."""
import sys, json, html, os
import xml.etree.ElementTree as ET
o = json.load(open("session2.json")); sp = json.load(open("session2_specimens.json"))
en = ET.parse(os.path.join(sys.argv[1], "common", "main", "en.xml")).getroot()
names = {e.get("type"): e.text for e in en.iter("language") if e.get("alt") is None}
scr_names = {e.get("type"): e.text for e in en.iter("script") if e.get("alt") is None}
def label(uid):
    b = uid.split("_")[0]; s = uid.split("_")[1] if "_" in uid else None
    return (names.get(b, b)) + (f" ({scr_names.get(s, s)})" if s else "")
data = {u: {"n": label(u), "s": v["s"], "f": v["f"], "w": v["w"], "c": v["c"]} for u, v in sp.items()}
cur = o["curves_by_year"]; Y = sorted(int(y) for y in cur)
W, H, L, B = 640, 300, 44, 28
def x(y): return L + (W-L-10)*(y-1993)/(2026-1993)
def yy(v): return H-B-(H-B-26)*((v-0.85)/0.15)
def path(key):
    pts = []; prev = None
    for y in Y:
        v = cur[str(y)][key]
        if prev is not None: pts.append((x(y), yy(prev)))
        pts.append((x(y), yy(v))); prev = v
    return "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts)
ticks = "".join(f'<line x1="{L}" x2="{W-10}" y1="{yy(v):.1f}" y2="{yy(v):.1f}" class="ax"/><text x="{L-6}" y="{yy(v)+4:.1f}" class="tk" text-anchor="end">{int(v*100)}%</text>' for v in (0.85, 0.9, 0.95, 1.0))
xt = "".join(f'<text x="{x(y):.1f}" y="{H-8}" class="tk" text-anchor="{"end" if y==2026 else "middle"}">{y}</text>' for y in (1993, 2000, 2005, 2010, 2015, 2020, 2026))
chart = (f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Share of modelled language speakers whose script has a code point (dashed) and whose language has every letter in its everyday list (solid), by year, 1993 to 2026">'
         f'{ticks}{xt}<path d="{path("script_present")}" class="ln2"/><path d="{path("complete_nfc")}" class="ln"/>'
         f'<text x="{x(2007)}" y="{yy(0.9985)-8:.1f}" class="lb2">the script is in the standard</text><text x="{x(2000)}" y="{yy(0.945)+20:.1f}" class="lb">the language has all its everyday letters</text></svg>')
late = [r for r in o["rows"] if r["wait_nfc"] >= 5 and r["weight_millions"] > 0][:0]
rows = [r for r in o["rows"] if r["complete_nfc"] > 1999]
rows.sort(key=lambda r: -r["weight_millions"])
tr = "".join(f'<tr><th>{html.escape(label(r["id"]))}</th><td>{r["weight_millions"]:,.1f}</td><td>{r["script_first"]}</td><td>{r["complete_nfc"]}</td></tr>' for r in rows[:14])
P = o
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>When a language is complete</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#5d5b55;--ln:#1f5f8b;--ln2:#a2561f;--ax:#cfcbc0;--cell:#efece4;--hole:#a2561f}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16171a;--fg:#ecebe6;--mut:#a5a39b;--ln:#7fb7e0;--ln2:#e0a070;--ax:#3a3b40;--cell:#23252a;--hole:#e0a070}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:46rem;margin:0 auto;padding:2rem 16px 4rem}}
h1{{font-size:1.9rem;line-height:1.2;margin:.2em 0}} h2{{font-size:1.15rem;margin-top:2em}}
.lede{{font-size:1.2rem}} .small{{color:var(--mut);font-size:.85rem}}
svg{{width:100%;height:auto;display:block}} .ax{{stroke:var(--ax);stroke-width:1}} .tk{{fill:var(--mut);font:11px sans-serif}}
.ln{{fill:none;stroke:var(--ln);stroke-width:2.5}} .ln2{{fill:none;stroke:var(--ln2);stroke-width:2;stroke-dasharray:5 4}}
.lb{{fill:var(--ln);font:12px sans-serif}} .lb2{{fill:var(--ln2);font:12px sans-serif}}
table{{border-collapse:collapse;width:100%;font-size:.88rem}} th,td{{text-align:right;padding:3px 6px;border-bottom:1px solid var(--ax)}} th:first-child{{text-align:left}}
.ctl{{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:1em 0}} select,input{{font:inherit;max-width:100%}}
#yr{{font:700 1.6rem sans-serif;min-width:3.2em}}
#grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px}}
#grid div{{background:var(--cell);border-radius:4px;text-align:center;padding:4px 0;min-height:3.1rem}}
#grid div b{{display:block;font:400 1.6rem/1.3 "Noto Sans","Segoe UI",serif}} #grid div i{{font:normal .62rem sans-serif;color:var(--mut)}}
#grid div.no{{background:transparent;border:2px dashed var(--hole)}} #grid div.no b{{visibility:hidden}} #grid div.no i{{color:var(--hole);font-weight:700}}
</style></head><body><main>
<h1>When a language is complete</h1>
<p class="lede">A writing system can be &ldquo;in Unicode&rdquo; for years before the languages that use it have all their letters. For
most languages the two dates coincide. For a few they do not &mdash; and the few include some of the largest.</p>
<div id="chart">{chart}</div>
<p class="small">Dashed: share of modelled language speakers whose script had any code point that year. Solid: share whose language had every
character on its everyday letter list ({P["units_measured"]} languages, scripts and script variants from the Unicode CLDR project). The gap is
about {100*(cur["1999"]["script_present"]-cur["1999"]["complete_nfc"]):.1f} points in 1999 and is closed by 2020. The vertical scale starts at 85&nbsp;%.</p>
<h2>Turn a language back to a year</h2>
<p>Choose a language and a year. Each cell is one letter on that language&rsquo;s everyday list. A dashed hole is a letter the standard had not yet
assigned a code point in that year; its code point is written inside. (Letters are drawn with fonts on your own device; if yours lacks one you will see a blank.)</p>
<div class="ctl"><label>Language <select id="lang"></select></label>
<label>Year <input id="slider" type="range" min="1993" max="2026" value="2004" step="1"></label><span id="yr">2004</span></div>
<p id="read" class="small" aria-live="polite"></p>
<div id="grid" aria-label="letters of the chosen language available in the chosen year"></div>
<noscript><p class="small">This part needs JavaScript. The table below carries the same finding for the largest languages that waited.</p></noscript>
<h2>The ones that waited</h2>
<p>Languages whose letter list was complete only after 1999, by modelled speakers (millions), largest first. One of them, Bangla, carries
{100*279.89/P["exploratory_weight"]["weight_complete_after_1999_nfc_millions"]:.0f}&nbsp;% of the weight that is complete after 1999 (the letter added in 2005 is the khanda ta, U+09CE).</p>
<table><caption class="small" style="text-align:left">Modelled speakers (millions) &middot; year the script first had a code point &middot; year the language&rsquo;s list was complete.</caption>
<tr><th></th><th>speakers M</th><th>script</th><th>complete</th></tr>{tr}</table>
<h2>What this does not say</h2>
<p>&ldquo;Complete&rdquo; means: every character on CLDR&rsquo;s present everyday list for the language has a code point. It does not mean the language could not
be written earlier. Some letters had a sequence of other characters that stood in for them, and for several languages a letter missing in its
precomposed form could be written as a base plus a mark; the page counts code points, not what people did. It does not mean a font, a
keyboard or a school existed. The lists are the committee&rsquo;s judgement today, and orthographies change. The speaker figures are modelled
populations of a language, not of people who write it, and people with several languages count several times; {100*P["population"]["unmatched_share"]:.0f}&nbsp;% of
the modelled total belongs to languages with no list of their own (Lahnda, Wu Chinese and Egyptian Arabic among them) and is not in the curves.
No claim is made about why any letter was assigned when it was, or about anyone&rsquo;s intent. Of five registered predictions three held and two
failed: the count of waiting languages does not fall when letters may be written as sequences (the registered measure gave 44 against 43; it overlooked that
a decomposed Arabic letter needs a mark added in 1999, which the precomposed form did not), and fewer than half of the languages with a wait of five years or more
are outside Latin, Cyrillic and Arabic ({P["P5"]["in_other_than_latn_cyrl_arab"]} of {P["P5"]["units_wait_ge5"]}).</p>
<p class="small">Sources, fetched 2026-10-10: Unicode Character Database 18.0.0 <code>DerivedAge.txt</code>, <code>Scripts.txt</code> (sha256 in <code>sources.json</code>);
Unicode CLDR 48.2 <code>cldr-common-48.2.zip</code> (sha256 in <code>sources2.json</code>): <code>common/main/*.xml</code> exemplar characters,
<code>supplementalData.xml</code>, <code>likelySubtags.xml</code>. Data files &copy; 1991&ndash;2026 Unicode, Inc., used under the Unicode License v3
(<a href="https://www.unicode.org/license.txt">license.txt</a>); this notice stands as the licence requires. Program: <code>session2.py</code>, <code>build2.py</code>.
Project record: <a href="https://github.com/frankbueltge/n-1/tree/main/projects/unicode-admission">projects/unicode-admission</a>. Signed Remainder, project 6, session 2.
Not yet tested by a stranger.</p>
</main>
<script>
const D={json.dumps(data, ensure_ascii=False, separators=(",", ":"))};
const sel=document.getElementById('lang'),sl=document.getElementById('slider'),yr=document.getElementById('yr'),g=document.getElementById('grid'),rd=document.getElementById('read');
const ids=Object.keys(D).sort((a,b)=>D[b].w-D[a].w);
for(const k of ids){{const o=document.createElement('option');o.value=k;o.textContent=D[k].n;sel.appendChild(o);}}
sel.value='bn';
function draw(){{const d=D[sel.value],y=+sl.value;yr.textContent=y;g.textContent='';let miss=0;
for(const [c,a] of d.c){{const e=document.createElement('div'),b=document.createElement('b'),i=document.createElement('i');
 b.textContent=String.fromCodePoint(c);i.textContent='U+'+c.toString(16).toUpperCase().padStart(4,'0');
 if(a>y){{e.className='no';miss++;}}e.appendChild(b);e.appendChild(i);g.appendChild(e);}}
const done=Math.max(...d.c.map(x=>x[1]));
rd.textContent=d.n+': '+d.c.length+' letters on the list; '+(d.c.length-miss)+' had a code point in '+y+(miss?', '+miss+' did not. The list is complete from '+done+'.':'. The list is complete from '+done+'.');}}
sel.onchange=sl.oninput=draw;draw();
</script></body></html>'''
open("languages.html", "w").write(page)
