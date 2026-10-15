# Draws 90 further frames at random from the unlicensed records read in neither earlier lot (1,255 minus the 90 of session 157 = 1,165).
# Seed fixed and published. Reads the unshown work's all_records.json and the two earlier draws.
import json,random
U='../2026-10-07-the-unshown/'
d=json.load(open(U+'all_records.json'))
seen=set(json.load(open(U+'draw.json'))['keys'])|set(json.load(open('../2026-10-07-the-rest-read-blind/draw.json'))['keys'])
pool=[r for r in d['rows'] if r['licence'] in ('CC-BY-NC','other/none') and r['key'] not in seen]
random.Random(20261007158).shuffle(pool)
s=sorted(pool[:90],key=lambda r:r['key'])
json.dump(dict(seed=20261007158,pool=len(pool),n=len(s),keys=[r['key'] for r in s]),open('draw.json','w'))
print(len(pool),len(s),len({r['observer'] for r in s}))
