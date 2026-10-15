# Draws a simple random sample of 135 from the records whose licence does not allow showing (not CC0 / CC BY). Seed fixed and published.
import json,random
d=json.load(open('all_records.json'))
pool=[r for r in d['rows'] if r['licence'] in ('CC-BY-NC','other/none')]
random.Random(20261007).shuffle(pool)
s=sorted(pool[:135],key=lambda r:r['key'])
json.dump(dict(seed=20261007,pool=len(pool),n=len(s),keys=[r['key'] for r in s]),open('draw.json','w'))
print(len(pool),len(s),len({r['observer'] for r in s}))
