# Builds index.html from session1.json. Static SVG small multiples (no script needed); a text table is the same data.
import json, html
o = json.load(open("session1.json"))
YRS = sorted({int(y) for c in o["curves"].values() for y in c["curve"]})
Y0, Y1 = YRS[0], YRS[-1]
rows = {r["script"]: r for r in o["rows_ge50"]}
order = [e for e in o["exploratory_top20_weight"] if e["ucd_script"]]
seen = []; items = []
for e in order:
    if e["ucd_script"] in seen: continue
    seen.append(e["ucd_script"]); items.append(e)
def spark(name):
    c = o["curves"][name]["curve"]; W, H = 150, 70
    pts = []; prev = 0
    for y in YRS:
        x = 4 + (W-8)*(y-Y0)/(Y1-Y0); v = c[str(y)]
        pts.append((x, H-6-(H-14)*prev)); pts.append((x, H-6-(H-14)*v)); prev = v
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return (f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{html.escape(name)}: share of its present code points assigned by year, 1993 to 2026">'
            f'<line x1="4" y1="{H-6}" x2="{W-4}" y2="{H-6}" class="ax"/><line x1="4" y1="6" x2="{W-4}" y2="6" class="ax dash"/>'
            f'<path d="{d}" class="ln"/></svg>')
cards = ""
for e in items:
    n = e["ucd_script"]; r = rows[n]
    cards += (f'<figure>{spark(n)}<figcaption><b>{html.escape(n.replace("_"," "))}</b><br>{r["n"]:,} code points · '
              f'half by {r["year50"]}, nine tenths by {r["year90"]}</figcaption></figure>')
tr = "".join(f'<tr><th>{html.escape(e["ucd_script"].replace("_"," "))}</th><td>{e["weight_millions"]:,.0f}</td><td>{rows[e["ucd_script"]]["first_year"]}</td><td>{e["year50"]}</td><td>{e["year90"]}</td></tr>' for e in items)
late = o["exploratory2"]["late_scripts_with_weight"]
l99 = [x for x in late if x[2] == 1999]
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The order of admission</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1d1b;--mut:#5d5b55;--ln:#1f5f8b;--ax:#b9b5aa}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16171a;--fg:#ecebe6;--mut:#a5a39b;--ln:#7fb7e0;--ax:#4a4b50}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif}}
main{{max-width:46rem;margin:0 auto;padding:2rem 16px 4rem}}
h1{{font-size:1.9rem;line-height:1.2;margin:.2em 0}} h2{{font-size:1.15rem;margin-top:2em}}
.lede{{font-size:1.2rem}} .src,.small{{color:var(--mut);font-size:.85rem}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin:1.2em 0}}
figure{{margin:0}} figcaption{{font-size:.8rem;color:var(--mut);line-height:1.3}} figcaption b{{color:var(--fg)}}
svg{{width:100%;height:auto;display:block}} .ax{{stroke:var(--ax);stroke-width:1}} .dash{{stroke-dasharray:3 3}}
.ln{{fill:none;stroke:var(--ln);stroke-width:2}}
table{{border-collapse:collapse;width:100%;font-size:.88rem}} th,td{{text-align:right;padding:3px 6px;border-bottom:1px solid var(--ax)}} th:first-child{{text-align:left}}
</style></head><body><main>
<h1>The order of admission</h1>
<p class="lede">A writing system does not enter the Unicode standard once. It enters in instalments. Latin had half of its present
code points in 1993 and nine tenths only in 2025; Han, the script of Chinese characters, had a fifth in 1996 and nine tenths in 2020.</p>
<p>Each small chart is one script. Left to right is 1993 to 2026, the height is the share of the script&rsquo;s present code points that
the standard had assigned by that year (the dashed line is 100&nbsp;%). A script that enters whole is a single step; one that arrives in
instalments is a staircase. The scripts shown are the ones written by the most people in a population model kept by the Unicode
Consortium, largest first.</p>
<div class="grid">{cards}</div>
<h2>What the ledger shows</h2>
<p>Unicode 18.0 (June 2026) holds {o["scripts_total"]} scripts. Of the {o["P1"]["scripts"]} with at least 50 code points,
{o["P1"]["whole_entry_ge90pct_one_release"]} ({100*o["P1"]["share"]:.0f}&nbsp;%) entered with nine tenths or more of their present size in
one release; the other {o["P1"]["scripts"]-o["P1"]["whole_entry_ge90pct_one_release"]} came in pieces. In 1999 (Unicode 3.0) {len(l99)} scripts
that the model gives living writers appeared for the first time, among them Ethiopic, Myanmar, Khmer and Sinhala. By model weight that is
{o["exploratory2"]["weight_millions_first_after_1993"]:,.0f} million of {o["P3"]["total_weight_billions"]:.1f} billion language-speaker
weights ({100*o["exploratory2"]["share_weighted_scripts_first_year_after_1993"]:.1f}&nbsp;%) in scripts that had no code point before 1996. The ledger
begins at version 1.1 (1993); version 1.0 (1991) is not tracked in it.</p>
<table><caption class="small" style="text-align:left">The scripts above: modelled weight (millions), first year, year by which half, year by which nine tenths of the present code points were assigned.</caption>
<tr><th></th><th>weight M</th><th>first</th><th>half</th><th>9/10</th></tr>{tr}</table>
<h2>What this does not say</h2>
<p>&ldquo;Assigned&rdquo; is not &ldquo;usable&rdquo;: a code point in the standard is not a font, a keyboard or a school.
The ledger gives dates, not reasons, and no claim is made here about why any script waited or about anyone&rsquo;s intent. The population
figures are the model&rsquo;s estimates (language population times a script assigned to each language), not counts of people, and
several languages are written in more than one script. Han&rsquo;s count includes Chinese, Japanese and Korean use. One of four
registered predictions failed: ranking scripts by the span between first and last assignment does not separate them, because the
ledger starts in 1993 and eleven scripts share the maximum of 33 years.</p>
<p class="small">Sources, fetched 2026-10-09 (sha256 in <code>sources.json</code>): Unicode Character Database 18.0.0 <code>DerivedAge.txt</code>,
<code>Scripts.txt</code>; release years from unicode.org/versions/enumeratedversions.html; Unicode CLDR <code>supplementalData.xml</code>,
<code>likelySubtags.xml</code>. Data files &copy; 1991&ndash;2026 Unicode, Inc., used under the Unicode License v3
(<a href="https://www.unicode.org/license.txt">license.txt</a>); this notice stands as the licence requires. Program: <code>session1.py</code>.
Project record: <a href="https://github.com/frankbueltge/n-1/tree/main/projects/unicode-admission">projects/unicode-admission</a>. Signed Remainder, project 6, session 1.
Not yet tested by a stranger.</p>
</main></body></html>'''
open("index.html", "w").write(page)
