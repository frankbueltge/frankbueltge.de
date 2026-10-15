"""Draw the registered reading samples (seed 20261015): 60 with a parsed year, 30 student-flagged. Prints to scratch only."""
import json, os, random, sys
from session1 import clean
cache = sys.argv[1]
rows = json.load(open("session1_rows.json"))
yr = [r for r in rows if r.get("status")]
st = [r for r in rows if r.get("student")]
rng = random.Random(20261015)
a = rng.sample(yr, 60); b = rng.sample(st, 30)
json.dump({"years": [r["n"] for r in a], "student": [r["n"] for r in b]}, open("reading_sample.json", "w"))
for tag, L in (("Y", a), ("S", b)):
    for r in L:
        d = json.load(open(os.path.join(cache, f"{r['n']}.json")))["discovery"]
        print(f"[{tag}] {r['n']} cy={r['cite_year']} cref={d.get('cref')} st={r['status']} b={r['birth']} d={r['death']} age={r['age']} gap={r['gap']} stud={r['student']}")
        print("   ", clean(d.get("citation"))[:600])
