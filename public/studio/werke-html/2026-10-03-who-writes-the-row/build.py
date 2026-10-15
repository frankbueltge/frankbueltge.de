import json,html
d=json.load(open('gbif-counts.json'));S=d['species']
Y0,Y1=1900,2026
def yrs(x,gs):
    return sorted(int(y) for g in gs for y in x['g'][g]['year'])
ALL=['obs','spec','live','other']
for x in S:
    ys=yrs(x,ALL);x['last']=ys[-1] if ys else None
    oy=yrs(x,['obs']);x['lastobs']=oy[-1] if oy else None
S.sort(key=lambda x:(x['lastobs'] is not None, x['lastobs'] or 0, x['last'] or 0, x['name']))
res=dict(
 species=len(S),records=sum(x['n'] for x in S),
 no_observer_record=sum(1 for x in S if x['g']['obs']['n']==0),
 no_observer_since_2020=sum(1 for x in S if (x['lastobs'] or 0)<2020),
 no_record_at_all=sum(1 for x in S if x['n']==0),
 no_dated_record=sum(1 for x in S if x['last'] is None),
 living_specimen_records=sum(x['g']['live']['n'] for x in S))
json.dump(res,open('results.json','w'),indent=1)
def strip(x):
    r=[]
    for g in ['spec','other','live','obs']:
        for y,c in x['g'][g]['year'].items():
            y=int(y)
            if Y0<=y<=Y1: r.append(f'<rect class="t-{g}" x="{(y-Y0)*10}" y="0" width="8" height="14"><title>{y}: {c} {g}</title></rect>')
    return f'<svg viewBox="0 0 1270 14" role="img" aria-label="{html.escape(x["name"])}: years with records">'+''.join(r)+'</svg>'
rows=[]
for x in S:
    nm=html.escape(x['name'].split(' (')[0]);g=x['g']
    rows.append(f'<li data-obs="{g["obs"]["n"]}"><div class="h"><b>{nm}</b><span>{x["kingdom"] or ""} · {x["n"]} records: {g["obs"]["n"]} seen, {g["spec"]["n"]} kept, {g["live"]["n"]} living</span></div>{strip(x)}</li>')
r=res
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Who Writes the Row</title>
<meta name="description" content="84 species the Red List calls extinct in the wild, and the open record that is written about each, year by year, by whom.">
<style>
:root{{--bg:#f6f2ea;--ink:#1d1b18;--mute:#6d675d;--obs:#b3402a;--spec:#2f4a5a;--live:#5a7a3a;--oth:#9a9388}}
@media(prefers-color-scheme:dark){{:root{{--bg:#171512;--ink:#ece6da;--mute:#9c9588;--obs:#e0674f;--spec:#7fa6bc;--live:#9cc06a;--oth:#7d776c}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Georgia,serif}}
main{{max-width:46rem;margin:0 auto;padding:2.5rem 16px 4rem}}
h1{{font-size:2.2rem;line-height:1.1;margin:0 0 .3rem}}h2{{font-size:1.1rem;margin:2.2rem 0 .4rem}}
.sub{{color:var(--mute);margin:0 0 1.5rem}}.n{{font-size:.88rem;color:var(--mute)}}
ol{{list-style:none;padding:0;margin:1rem 0}}li{{margin:0 0 .55rem}}
.h{{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.8rem}}.h b{{font-style:italic;font-weight:400}}.h span{{color:var(--mute)}}
svg{{display:block;width:100%;height:auto;background:color-mix(in srgb,var(--ink) 5%,transparent)}}
.t-obs{{fill:var(--obs)}}.t-spec{{fill:var(--spec)}}.t-live{{fill:var(--live)}}.t-other{{fill:var(--oth)}}
input{{position:absolute;opacity:0}}label{{display:inline-block;border:1px solid var(--mute);padding:.25rem .7rem;margin:0 .4rem .4rem 0;cursor:pointer;font:.85rem sans-serif}}
#v1:checked~.c label[for=v1],#v2:checked~.c label[for=v2],#v3:checked~.c label[for=v3]{{background:var(--ink);color:var(--bg)}}
input:focus-visible~.c label{{outline:2px solid var(--obs)}}
#v2:checked~ol .t-spec,#v2:checked~ol .t-live,#v2:checked~ol .t-other{{opacity:.07}}
#v3:checked~ol .t-obs{{opacity:.07}}
#v3:checked~ol li[data-obs="0"]{{outline:2px solid var(--obs);outline-offset:2px}}
.key i{{display:inline-block;width:.8em;height:.8em;margin:0 .3em 0 .8em}}
.axis{{display:flex;justify-content:space-between;font:.75rem sans-serif;color:var(--mute)}}
</style></head><body><main>
<h1>Who Writes the Row</h1>
<p class="sub">Cycle 004 · Missing Data Art, read through human extinction · The Studio, 2026-10-03</p>
<p>The Red List has a category for a species that is known only to survive in captivity or cultivation, or as a naturalized population outside its old range: <i>extinct in the wild</i>. The open biodiversity record (GBIF) lists {r["species"]} of them under the backbone taxonomy. Below, one row each, one mark for every year in which anyone wrote a record, 1900 to 2026. Red marks are someone seeing the organism. Blue marks are an organism kept in a drawer, a jar or a herbarium sheet. Green marks are a living specimen. Grey marks are records that do not say which.</p>
<p>If the people who write the rows were gone, the rows would stop. For the species that live only in someone's keeping, the species would stop with them. This page asks only which rows are written by watching and which by keeping.</p>
<h2>What came out</h2>
<ul>
<li><b>{r["no_observer_record"]} of {r["species"]}</b> have no observation record at all: only specimens, living specimens or undated occurrences, or nothing. {r["no_record_at_all"]} have no record of any kind.</li>
<li><b>{r["no_observer_since_2020"]} of {r["species"]}</b> have no observation record dated 2020 or later.</li>
<li>{r["records"]:,} records in total, of which {r["living_specimen_records"]} are living specimens; the other {r["records"]-r["living_specimen_records"]:,} are observations, specimens and undated occurrences.</li>
</ul>
<p class="n">This is a count of what an open aggregator holds on 2026-10-03. It is not a count of what is alive or what is known: a collection that has not shared its catalogue is invisible here, and "seen" means a data publisher filed the record as an observation.</p>
<h2>The rows</h2>
<input type="radio" name="v" id="v1" checked><input type="radio" name="v" id="v2"><input type="radio" name="v" id="v3">
<div class="c"><label for="v1">All marks</label><label for="v2">Only the seeing</label><label for="v3">Rows nobody has watched</label></div>
<p class="key n"><i style="background:var(--obs)"></i>seen<i style="background:var(--spec)"></i>kept<i style="background:var(--live)"></i>living<i style="background:var(--oth)"></i>unspecified</p>
<ol>{''.join(rows)}</ol>
<div class="axis"><span>1900</span><span>1950</span><span>2026</span></div>
<p class="n">Rows run from the species whose last observation is oldest (or that have none) to the newest. Hover a mark for its year and count.</p>
<h2>Neighbours, and the daylight</h2>
<p><b>AI in the Sky</b> (Laura Cinti, 2025; Ars Electronica STARTS Prize page opened) searches a forest by drone and algorithm for a cycad extinct in the wild, known from a single male specimen. It follows one species into the forest. This page does the opposite: it stays with the record and asks, across {r["species"]} species, whose hand writes it.</p>
<p><b>The Library of Missing Datasets</b> (Mimi Ọnụọha; the bitforms page for v2.0 opened) makes absence the exhibit with empty folders for datasets that do not exist. Here nothing is empty by design: the folders are full, of specimens, and the absence is the missing watcher, shown by the red row that never starts.</p>
<p class="n">Both Atlas pages were opened and read; only what they show is relied on. The Atlas is not counted or measured here.</p>
<h2>Method and limits</h2>
<p>Species: GBIF species search, backbone taxonomy dataset, rank species, threat status <i>extinct in the wild</i> (84 accepted entries). Records: GBIF occurrence search per species key (synonyms included), counts by year and basis of record, retrieved 2026-10-03. Basis groups: seen = human observation, observation, machine observation; kept = preserved specimen, material sample, material citation, fossil specimen; living = living specimen; unspecified = occurrence. Years are the year of the event, not of the filing. A record dated after a species left the wild is a captive or cultivated record, a naturalized-population record, or a mistake; this page does not decide which. The Red List category wording is read from its secondary summary (Wikipedia, "Extinct in the wild"), because the IUCN page refused automated access; the backbone's threat status is a copy of the Red List status at GBIF's last import, which may lag. Counts only are committed (<code>gbif-counts.json</code>); no GBIF record is reproduced. The data are CC0 or CC BY by publisher; GBIF is cited as the aggregator. Code: Apache-2.0; page: CC BY 4.0. No script runs on this page.</p>
<p class="n">Reproduce: <code>python3 build.py &amp;&amp; python3 verify.py</code>. Counts can be re-queried from <code>api.gbif.org/v1/occurrence/search?taxonKey=…&amp;facet=year</code>.</p>
</main></body></html>'''
open('index.html','w').write(page)
