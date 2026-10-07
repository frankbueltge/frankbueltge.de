# Downloads the drawn frames to a scratch directory for reading (never committed). usage: fetch_imgs.py outdir
import json,sys,urllib.request,os
d={r['key']:r for r in json.load(open('../2026-10-07-the-unshown/all_records.json'))['rows']}
out=sys.argv[1]
for i,k in enumerate(json.load(open('draw.json'))['keys']):
    p=f"{out}/{i:02d}_{k}.jpg"
    if os.path.exists(p): continue
    u=d[k]['img'].replace('original','medium') if 'inaturalist-open-data' in d[k]['img'] else d[k]['img']
    try: open(p,'wb').write(urllib.request.urlopen(u,timeout=40).read())
    except Exception as e: print('fail',i,k,e)
