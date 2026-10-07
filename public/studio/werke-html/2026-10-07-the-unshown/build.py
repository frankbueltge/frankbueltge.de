# Builds index.html from template.html + reading.json + results.json + all_records.json.
# `python3 build.py --check` rebuilds in memory and compares with index.html.
import json,sys
d=json.load(open('all_records.json'));dr=json.load(open('draw.json'));rd=json.load(open('reading.json'));res=json.load(open('results.json'))
prev=json.load(open('../2026-10-06-every-open-one/results.json'));census={r['key'] for r in json.load(open('../2026-10-06-every-open-one/census.json'))['rows']}
odd={o['key'] for o in prev['odd_profiles']};drawn=set(dr['keys'])
cells=[]
for r in d['rows']:
    if r['licence'] in('CC0','CC-BY'):
        cells.append(dict(k=r['key'],y=r['year'],lot='lr' if r['key'] in census else 'lu',odd=r['key'] in odd))
    else:
        cells.append(dict(k=r['key'],y=r['year'],lot='sr' if r['key'] in drawn else 'su',odd=False))
rows=[dict(n=x['n'],key=x['key'],year=x['year'],page=x['page'],note=x['note'],hard=x['hard']) for x in rd['rows']]
data=json.dumps(dict(strip=cells,reading=rows,results=res),ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
out=open('template.html').read().replace('__DATA__',data)
if '--check' in sys.argv: sys.exit(0 if out==open('index.html').read() else 'index.html is stale')
open('index.html','w').write(out);print(len(out),'bytes')
