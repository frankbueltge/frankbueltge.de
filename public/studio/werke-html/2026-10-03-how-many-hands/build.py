import json,html,itertools,collections
d=json.load(open('gbif-keepers.json'));O=d['orgs']
rows={}
for s in d['species']:
    b=' '.join(s['name'].split()[:2])
    if b in rows:
        assert rows[b]['live']==s['live'] and rows[b]['kept']==s['kept'],b
        rows[b]['syn']+=1;continue
    s['syn']=0;s['bin']=b;rows[b]=s
S=list(rows.values())
for s in S:
    s['lo']=set(s['live']['orgs']);s['ko']=set(s['kept']['orgs'])|s['lo']
    s['cap']=len(s['kept']['orgs'])>=100
S.sort(key=lambda s:(len(s['lo'])==0,len(s['lo']),len(s['ko']),s['bin']))
live=[s for s in S if s['lo']]
# greedy: which publishers, removed one by one, erase the most living records
gone=set();order=[]
for _ in range(3):
    best=None
    for o in set().union(*[s['lo'] for s in live]):
        if o in gone:continue
        n=sum(1 for s in live if s['lo']<=gone|{o})
        if best is None or n>best[0]: best=(n,o)
    gone.add(best[1]);order.append((O[best[1]]['title'],best[0]))
lost=[s['bin'] for s in live if s['lo']<=gone]
single=[s for s in live if len(s['lo'])==1]
animals=[s for s in S if s['kingdom']=='Animalia']
res=dict(rows=len(d['species']),distinct_names=len(S),
 with_living=len(live),living_animals=sum(1 for s in animals if s['lo']),animals=len(animals),
 living_one_publisher=len(single),living_two_or_fewer=sum(1 for s in live if len(s['lo'])<=2),
 no_kept_record=sum(1 for s in S if not s['ko']),
 kept_only_no_living=sum(1 for s in S if s['ko'] and not s['lo']),
 one_publisher_any=sum(1 for s in S if len(s['ko'])==1),
 greedy=[dict(publisher=a,species_with_no_living_record_left=b) for a,b in order],
 three_publishers_erase=len(lost),
 publishers=len(O),single_names=[s['bin'] for s in single])
json.dump(res,open('results.json','w'),indent=1,ensure_ascii=False)
def esc(x):return html.escape(x)
def row(s):
    ln=len(s['lo']);kn=len(s['ko'])
    dots=[]
    for o in sorted(s['lo'],key=lambda o:-s['live']['orgs'][o]):
        dots.append(f'<circle class="L" r="5"><title>{esc(O[o]["title"])}: {s["live"]["orgs"][o]} living</title></circle>')
    for o in sorted(s['ko']-s['lo'],key=lambda o:-s['kept']['orgs'].get(o,0)):
        dots.append(f'<circle class="K" r="4"><title>{esc(O[o]["title"])}: {s["kept"]["orgs"].get(o,0)} preserved</title></circle>')
    cap=60
    shown=dots[:cap];x=[]
    for i,t in enumerate(shown):x.append(t.replace('<circle ',f'<circle cx="{8+i*12}" cy="8" '))
    svg=f'<svg viewBox="0 0 {16+cap*12} 16" role="img" aria-label="{esc(s["bin"])}: {ln} living keepers, {kn-ln} further keepers of preserved specimens">'+''.join(x)+'</svg>'
    more=f' (first {cap} of {kn} drawn)' if kn>cap else ''
    plus=' or more' if s['cap'] else ''
    one=' data-one="1"' if ln==1 else ''
    nm='' 
    if ln==1: nm=' · alive only with '+esc(O[next(iter(s['lo']))]['title'])
    return f'<li data-live="{ln}"{one}><div class="h"><b>{esc(s["bin"])}</b><span>{s["kingdom"] or ""} · {ln} living, {kn-ln} preserved-only{plus}{more}{nm}</span></div>{svg}</li>'
body=''.join(row(s) for s in S)
g=res['greedy']
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>How Many Hands</title>
<meta name="description" content="For each of {res['distinct_names']} species the Red List calls extinct in the wild, the number of institutions that publish a record of keeping it, alive or in a drawer.">
<style>
:root{{--bg:#f6f2ea;--ink:#1d1b18;--mute:#6d675d;--live:#3f7a2a;--kept:#2f4a5a;--hot:#b3402a}}
@media(prefers-color-scheme:dark){{:root{{--bg:#171512;--ink:#ece6da;--mute:#9c9588;--live:#9cc06a;--kept:#7fa6bc;--hot:#e0674f}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Georgia,serif}}
main{{max-width:46rem;margin:0 auto;padding:2.5rem 16px 4rem}}
h1{{font-size:2.2rem;line-height:1.1;margin:0 0 .3rem}}h2{{font-size:1.1rem;margin:2.2rem 0 .4rem}}
.sub{{color:var(--mute);margin:0 0 1.5rem}}.n{{font-size:.88rem;color:var(--mute)}}
ol{{list-style:none;padding:0;margin:1rem 0}}li{{margin:0 0 .55rem}}
.h{{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.8rem}}.h b{{font-style:italic;font-weight:400}}.h span{{color:var(--mute)}}
svg{{display:block;width:100%;height:auto;background:color-mix(in srgb,var(--ink) 5%,transparent)}}
.L{{fill:var(--live)}}.K{{fill:none;stroke:var(--kept);stroke-width:1.5}}
input{{position:absolute;opacity:0}}label{{display:inline-block;border:1px solid var(--mute);padding:.25rem .7rem;margin:0 .4rem .4rem 0;cursor:pointer;font:.85rem sans-serif}}
#v1:checked~.c label[for=v1],#v2:checked~.c label[for=v2],#v3:checked~.c label[for=v3]{{background:var(--ink);color:var(--bg)}}
input:focus-visible~.c label{{outline:2px solid var(--hot)}}
#v2:checked~ol .K{{opacity:.08}}#v2:checked~ol li[data-live="0"]{{opacity:.3}}
#v3:checked~ol li:not([data-one]){{opacity:.18}}#v3:checked~ol li[data-one]{{outline:2px solid var(--hot);outline-offset:3px}}
</style></head><body><main>
<h1>How Many Hands</h1>
<p class="sub">Cycle 004 · Missing Data Art, read through human extinction · The Studio, 2026-10-03</p>
<p>A species the Red List calls <i>extinct in the wild</i> survives only because someone keeps it. The first page of this series asked who writes the record of such a species. This one asks how many separate hands hold it. For each name below there is one dot for every institution that publishes a record of it to the open biodiversity archive (GBIF). A filled green dot is an institution with a <b>living</b> plant of it. An open blue ring is an institution with a <b>preserved</b> specimen only, pressed, pinned or in a jar.</p>
<h2>What came out</h2>
<ul>
<li>{res['distinct_names']} distinct names (the {res['rows']} rows of the first page include {res['rows']-res['distinct_names']} duplicates under two authorities).</li>
<li><b>{res['with_living']}</b> have any living specimen in the open record. All of them are plants: <b>{res['living_animals']} of {res['animals']}</b> animals do.</li>
<li><b>{res['living_one_publisher']} of those {res['with_living']}</b> are alive in the open record under one single publisher. <b>{res['living_two_or_fewer']}</b> under two or fewer.</li>
<li>Remove one publisher, {esc(g[0]['publisher'])}, and {g[0]['species_with_no_living_record_left']} species lose their only living record. Three publishers ({'; '.join(esc(x['publisher']) for x in g)}) are enough to erase {res['three_publishers_erase']} of {res['with_living']}.</li>
<li>{res['kept_only_no_living']} more survive in the open record only as preserved specimens. {res['no_kept_record']} have no specimen record at all.</li>
</ul>
<p class="n">Read it as a floor on fragility, not a census of survival: a botanic garden that holds the plant and has not shared its catalogue does not appear. A "publisher" is whoever shares the data and may be a network, not a garden. "Preserved" means the basis of record preserved specimen only; material samples and fossils are not counted here. Counts of ring dots are capped by GBIF's facet limit at 100 publishers per species.</p>
<input type="radio" name="v" id="v1" checked><input type="radio" name="v" id="v2"><input type="radio" name="v" id="v3">
<div class="c"><label for="v1">Every hand</label><label for="v2">Only the living</label><label for="v3">Alive on a single hand</label></div>
<ol>{body}</ol>
<h2>Neighbours in the Atlas</h2>
<p><i>Phyto-Travellers</i> (Eva-Maria Lopez, ZKM 2025): a living garden of neophyte plants on freight pallets in a half-scale ship, original names on the glass. Her plants are present and read as history; here the living plants are only a count of institutions, and the point is how few hands stand between a species and its absence. <i>Office for Tree Migration</i> (Agnes Meyer-Brandis): cameras and sensors follow trees as they move with climate; this follows no tree, only the administrative footprint of the ones that are kept. <i>AI in the Sky</i> (Laura Cinti), already named on the first page, searches for one cycad; one of the single-hand rows is a cycad. Pages of the first two opened 2026-10-03.</p>
<p class="n">Data: GBIF occurrence counts by publishing organisation, retrieved {d['retrieved']}; only counts and organisation names are committed. Code Apache-2.0, text CC BY 4.0. No model output. Session 151, The Studio.</p>
</main></body></html>'''
open('index.html','w').write(page)
print(json.dumps(res,indent=1,ensure_ascii=False))
