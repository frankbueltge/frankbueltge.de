import json,html
from collections import Counter,OrderedDict
from classes import CLASSES,BY_KEY,READING
D=json.load(open('records.json'));R=D['records']
for r in R: r['cls']=BY_KEY.get(r['key'],'H')
for r in R:
    if r['key'] in READING: r['reading']=READING[r['key']]
    elif r['cls']=='G': r['reading']='One of six extinct species logged at the same point on the same day by one publisher.'
    elif r['key']==1986787498: r['reading']='No media; the remarks field holds only the two letters "EX".'
    elif r['cls']=='E': r['reading']='A field record at a named reserve; photographs and sound not opened.'
    else: r['reading']='No media and no remarks in the record.'
cnt=Counter(r['cls'] for r in R)
species=sorted({r['species'] for r in R})
viewed=[r for r in R if r['cls'] in 'ABC']
res=dict(records=len(R),species=len(species),by_class=dict(cnt),images_looked_records=len(viewed),
  none_alive_in_viewed=True,backbone_extinct_birds=D['species_in_backbone_extinct'],cohort_species=len(D['cohort']),
  none=D['no_observation_records'],over60=D['over_60'])
json.dump(res,open('results.json','w'),indent=1)
e=html.escape
COL={'A':'#c0762b','B':'#7b6a52','C':'#8a4f4f','D':'#3f7a2a','E':'#2f6a8a','F':'#7a5a9a','G':'#b3402a','H':'#6d675d'}
DK={'A':'#e0a060','B':'#bfae92','C':'#d08a8a','D':'#9cc06a','E':'#7fb4d4','F':'#b89ad4','G':'#e0674f','H':'#9c9588'}
css=':root{--bg:#f6f2ea;--ink:#1d1b18;--mute:#6d675d;--card:#fffdf8;'+''.join(f'--{k}:{v};' for k,v in COL.items())+'}\n@media(prefers-color-scheme:dark){:root{--bg:#171512;--ink:#ece6da;--mute:#9c9588;--card:#201d19;'+''.join(f'--{k}:{v};' for k,v in DK.items())+'}}\n'
css+='''body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Georgia,serif}
main{max-width:62rem;margin:0 auto;padding:2.5rem 16px 4rem}
h1{font-size:2.4rem;line-height:1.05;margin:0 0 .3rem}h2{font-size:1.15rem;margin:2.4rem 0 .5rem}
.sub{color:var(--mute);margin:0 0 1.5rem}.p{max-width:42rem}.n{font-size:.88rem;color:var(--mute);max-width:42rem}
.tally{display:flex;flex-wrap:wrap;gap:.4rem;margin:1rem 0}
.t{flex:1 1 7.5rem;border-top:6px solid;padding:.4rem .5rem;background:var(--card);font:.8rem/1.3 sans-serif}.t b{display:block;font:2rem/1 Georgia,serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.7rem;margin:1rem 0}
.c{background:var(--card);border-top:6px solid;padding:.55rem .7rem .7rem;font:.85rem/1.4 sans-serif;position:relative}
.c i{font:italic 1.02rem Georgia,serif;display:block}.c .k{font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:var(--mute)}
.c .w{color:var(--mute)}.c a{color:inherit}
.g{position:absolute;right:.6rem;top:.3rem;font:700 1.6rem Georgia,serif;opacity:.25}
input{position:absolute;opacity:0}label{display:inline-block;border:1px solid var(--mute);padding:.25rem .7rem;margin:0 .4rem .4rem 0;cursor:pointer;font:.8rem sans-serif}
input:focus-visible+label{outline:2px solid var(--G)}
'''
for k,*_ in CLASSES:
    css+=f'.c.{k}{{border-color:var(--{k})}}.t.{k}{{border-color:var(--{k})}}\n'
    css+=f'#f{k}:checked~.grid .c:not(.{k}){{display:none}}#f{k}:checked~.fl label[for=f{k}]{{background:var(--ink);color:var(--bg)}}\n'
css+='#fall:checked~.fl label[for=fall]{background:var(--ink);color:var(--bg)}\n'
tally=''.join(f'<div class="t {k}"><b>{cnt.get(k,0)}</b>{e(short)}<br><span style="color:var(--mute)">{e(how)}</span></div>' for k,short,long,how in CLASSES)
ins='<input type="radio" name="f" id="fall" checked><label for="fall">all {}</label>'.format(len(R))+''.join(f'<input type="radio" name="f" id="f{k}"><label for="f{k}">{k} · {e(short)} {cnt.get(k,0)}</label>' for k,short,long,how in CLASSES)
# radios must precede .grid as siblings: put inputs and labels in .fl? labels must follow inputs; use inputs at top, labels in .fl
inputs=''.join(f'<input type="radio" name="f" id="f{k}">' for k,*_ in CLASSES)
labels='<label for="fall">all {}</label>'.format(len(R))+''.join(f'<label for="f{k}">{k} · {e(short)} ({cnt.get(k,0)})</label>' for k,short,long,how in CLASSES)
cards=''
for r in sorted(R,key=lambda r:(r['cls'],r['date'] or '',r['species'])):
    where=', '.join(x for x in (r['locality'],r['country']) if x) or 'no place name'
    cards+=(f'<article class="c {r["cls"]}"><span class="g">{r["cls"]}</span><span class="k">{e((r["date"] or str(r["year"]))[:10])}</span>'
      f'<i>{e(r["species"])}</i><span class="w">{e(where[:90])}</span><p style="margin:.4rem 0 .3rem">{e(r["reading"])}</p>'
      f'<span class="k"><a href="https://www.gbif.org/occurrence/{r["key"]}">GBIF {r["key"]}</a></span></article>\n')
body=f'''<h1>Proof of Life</h1>
<p class="sub">Cycle 004 · Missing Data Art, read through human extinction · The Studio, 2026-10-04</p>
<p class="p">The open biodiversity archive (GBIF) files birds the Red List calls extinct under the status <i>extinct</i>. It also holds {len(R)} observation records of {len(species)} of them dated 2010 or later: the dodo three times, the great auk five. This page asks what stands behind each one. For {len(viewed)} records the answer could be looked at, and none of the {len(viewed)} shows a living member of the species. The other {len(R)-len(viewed)} are sorted by what their own fields allow.</p>
<p class="p">A record of a sighting is an assertion of life. In the archive it is indistinguishable from a real one: same field, same flag, same map. The dodo&rsquo;s three modern &ldquo;human observations&rdquo; are a life-sized model in a crocodile park, a beer logo and a billboard.</p>
<h2>{len(R)} records, eight kinds of evidence</h2>
<div class="tally">{tally}</div>
<p class="n">Letters and words, not colour alone, carry the class. &ldquo;Looked&rdquo; means the Studio opened the linked photographs; &ldquo;record fields&rdquo; means only the archive&rsquo;s own fields were read; &ldquo;not examined&rdquo; means neither. Classes are the Studio&rsquo;s reading, not an identification of any bird, and not a verdict on anyone who filed a record.</p>
{inputs}
<div class="fl" style="margin-top:1rem">{labels}</div>
<div class="grid">
{cards}</div>
<h2>What this does not show</h2>
<p class="n">Cohort: accepted bird species whose GBIF threat status is extinct ({res['backbone_extinct_birds']}); {res['none']} have no observation record since 1950 and {res['over60']} have more than 60 and are left out, among them twelve common European birds with over 100,000 records each (the pattern the Atelier and the Field found) two with 3,536 and 180 records that are probably living birds filed under an old name, and one with 64 (Hawaiian, genuinely late field records). The 2010 cut-off was chosen after a first look at everything since 1950. Several of these species also have field records between 1950 and 2009 (Hawaii, Guam, Lake Atitl&aacute;n); those are not the subject. Records of preserved or fossil specimens are not counted. Class E is a field record at a named site: possibly a real sighting of a bird since declared extinct, and not examined. Of the {len(viewed)} looked-at records, seven show no bird at all and one a dead duck; the photograph of a dead duck is the Studio\u2019s reading of a plumage, not an identification. Sound recordings (class D, one in E) were read as text, not listened to. The photographs are not reproduced here: they belong to their makers and are linked through the archive.</p>
<h2>Neighbours, from the Atlas of Data Art</h2>
<p class="n"><b>From &lsquo;Apple&rsquo; to &lsquo;Anomaly&rsquo;</b> (Trevor Paglen, 2019&ndash;20), page at the Barbican opened 2026-10-04: thirty thousand photographs hung along a label hierarchy to show how a taxonomy sees. Daylight: here the label is one species&rsquo; name, the photographs are the evidence a stranger attached to it, and the work does not hang them but reads what each one is. <b>The Library of Missing Datasets</b> (Mimi &#7884;n&#7909;&#7885;ha): empty folders for data nobody collects; here the folder is full, and what it contains is not the thing named on the tab. <b>AI in the Sky</b> (Laura Cinti): one rare plant sought; here, the archive&rsquo;s impression that a lost species is still being found.</p>
<p class="n">Sources: GBIF occurrence search and occurrence records, retrieved {D['retrieved']}, licences vary by record (most CC BY 4.0); linked, not copied. Method and checks: fetch.py, build.py, verify.py in this folder.</p>'''
open('index.html','w').write(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proof of Life</title>\n<meta name="description" content="{len(R)} records since 2010 of birds the archive calls extinct, and what stands behind each one.">\n<style>\n{css}</style></head><body><main>\n{body}\n</main></body></html>')
print(res)
