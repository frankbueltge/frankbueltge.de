"""Study 55, part 2 (POST HOC sensitivity, not a prediction): does the Kivu quiet curve rest on the
94-day hole in the reports (8 March - 9 June 2020, check 52)?

Answers the Atelier's question of 2026-11-05 (bulletin, The Last Case): a quiet that "held" across a
stretch with no report was not watched there. Study 53 kept such observations as holds. Here every
observation whose quiet or 42-day window touches the hole is dropped, and the Kivu curve is recomputed
by study 53's own code (its source is executed up to its first build, unchanged except that the 2026
file is not read).

Usage: python3 -I sens55.py <kivu ebola-epidemic-health-zone-figures.csv>   (sha256 asserted by study 53)
Writes sens55.json.
"""
import collections, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "analyse53.py")).read()
head = src.split('kv = build("Kivu 2018-2020"')[0]
head = "\n".join(l for l in head.splitlines() if "hdx26_path, \"rb\"" not in l)
ns = {"__file__": os.path.join(HERE, "analyse53.py"), "__name__": "a53"}
sys.argv = ["analyse53.py", sys.argv[1], "-"]
exec(compile(head, "analyse53.py", "exec"), ns)
kv = ns["build"]("Kivu 2018-2020", *ns["load_kivu"]())
cal = kv["cal"]; idx = {d: i for i, d in enumerate(cal)}
H0, H1 = idx["2020-03-08"], idx["2020-06-09"]
assert H1 - H0 + 1 == 94
assert kv["cal"][-1] == "2020-06-17"


def curve(rows):
    k = collections.Counter(); n = collections.Counter()
    for d, y in rows:
        n[d] += 1; k[d] += y
    return {d: (k[d], n[d]) for d in sorted(n)}


full, clean = [], []
for qi, d, y, nb in kv["obs"][42]:
    q = kv["quiets"][qi]
    full.append((d, y))
    # the stretch watched: from the quiet's start to the end of its window (or to its break, if earlier)
    end = q["a"] + d + 42 if not (q["b"] is not None and q["L"] <= d + 42) else q["b"]
    if end < H0 or q["a"] > H1:
        clean.append((d, y))
cf, cc = curve(full), curve(clean)


def first_below(c, thr, nmin=10):
    ds = [d for d in c if c[d][1] >= nmin]
    for d in ds:
        if all(c[e][0] / c[e][1] <= thr for e in ds if e >= d):
            return d
    return None


out = {"study": "55-sensitivity", "posthoc": True, "hole": [cal[H0], cal[H1]],
       "observations": {"full": len(full), "clean": len(clean)},
       "d42": {"full": cf.get(42), "clean": cc.get(42)},
       "firstBelow10": {"full": first_below(cf, 0.10), "clean": first_below(cc, 0.10)},
       "firstBelow5": {"full": first_below(cf, 0.05), "clean": first_below(cc, 0.05)},
       "lastDayN10": {"full": max(d for d in cf if cf[d][1] >= 10), "clean": max([d for d in cc if cc[d][1] >= 10] or [0])},
       "curveClean": {d: list(v) for d, v in cc.items()}}
assert tuple(out["d42"]["full"]) == (17, 60), out["d42"]["full"]   # study 53's published Kivu figure
json.dump(out, open(os.path.join(HERE, "sens55.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k != "curveClean"}, indent=1))
open(os.path.join(HERE, "sens55.js"), "w").write("window.S55=" + json.dumps(
    {k: v for k, v in out.items() if k != "curveClean"}, separators=(",", ":")) + ";\n")
