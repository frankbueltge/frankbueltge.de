# Draws 90 further frames, at random, from the unlicensed records NOT yet read (the 1,390 minus session 155's 135 = 1,255 pool).
# Seed fixed and published. Reads ../2026-10-07-the-unshown/{all_records,draw}.json
import json,random
d=json.load(open('../2026-10-07-the-unshown/all_records.json'))
first=set(json.load(open('../2026-10-07-the-unshown/draw.json'))['keys'])
pool=[r for r in d['rows'] if r['licence'] in ('CC-BY-NC','other/none') and r['key'] not in first]
random.Random(20261007157).shuffle(pool)
s=sorted(pool[:90],key=lambda r:r['key'])
json.dump(dict(seed=20261007157,pool=len(pool),n=len(s),keys=[r['key'] for r in s]),open('draw.json','w'))
print(len(pool),len(s),len({r['observer'] for r in s}))
