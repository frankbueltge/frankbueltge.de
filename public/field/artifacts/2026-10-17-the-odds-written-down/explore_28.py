"""Study 28, EXPLORATORY, chosen after results_28.json showed P5 failing: is the later 'stated most' too high
because it picks versions that score smaller magnitudes? O/E by magnitude bin (first hour / later), and the
later 'stated most' pick against the 6 h clock version of the same sequence. Writes data/explore_28.json."""
import json, collections
LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
rows = [l.rstrip("\n").split("\t") for l in open("data/lagged_cells_25.tsv")]
cells = [dict(zip(rows[0], x)) for x in rows[1:]]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0])); fl = collections.defaultdict(dict)
bym = collections.defaultdict(lambda: [0, 0.0])
for c in cells:
    i, l, p, h, M = c["id"], int(c["lag"]), float(c["p"]), int(c["hit"]), float(c["M"])
    g[i][l][0] += h; g[i][l][1] += p; fl[i][l] = min(fl[i].get(l, 99), M)
ids = sorted(i for i in g if all(l in g[i] for l in LAGS)); S = set(ids)
for c in cells:
    if c["id"] in S: k = ("first hour" if c["lag"] == "0" else "later", c["M"]); bym[k][0] += int(c["hit"]); bym[k][1] += float(c["p"])
pick = {i: max(LAGS[1:], key=lambda l: (g[i][l][1], l)) for i in ids}
lower = [i for i in ids if fl[i][pick[i]] < fl[i][6]]; same = [i for i in ids if i not in set(lower)]
def r(sample, lag):
    o = sum(g[i][lag(i)][0] for i in sample); e = sum(g[i][lag(i)][1] for i in sample); return {"n": len(sample), "observed": o, "stated": round(e, 2), "ratio": round(o / e, 3) if e else None}
out = {"by_magnitude_bin": {f"{a} M{m}": {"observed": v[0], "stated": round(v[1], 2), "ratio": round(v[0] / v[1], 3)} for (a, m), v in sorted(bym.items())},
       "later_most_pick_lags": dict(collections.Counter(pick.values())),
       "pick_has_lower_floor_than_6h": {"pick": r(lower, lambda i: pick[i]), "6h": r(lower, lambda i: 6)},
       "pick_same_floor": {"pick": r(same, lambda i: pick[i]), "6h": r(same, lambda i: 6)}}
json.dump(out, open("data/explore_28.json", "w"), indent=1); print(json.dumps(out, indent=1))
# the sequences where the later 'stated most' is not the 6 h version: a later version that stated more than 6 h did
up = [i for i in ids if pick[i] != 6]; six = [i for i in ids if pick[i] == 6]
out["pick_is_not_6h"] = {"pick": r(up, lambda i: pick[i]), "6h": r(up, lambda i: 6)}
out["pick_is_6h"] = r(six, lambda i: 6)
json.dump(out, open("data/explore_28.json", "w"), indent=1)
print(json.dumps({k: out[k] for k in ("pick_is_not_6h", "pick_is_6h")}))
# interval for the 6 h version's O/E in the two groups and their ratio (2,000 resamples over sequences, seed 210)
import random
rng = random.Random(210); vals = []
for _ in range(2000):
    s = [ids[rng.randrange(len(ids))] for _ in ids]
    a = [i for i in s if pick[i] != 6]; b = [i for i in s if pick[i] == 6]
    ra, rb = r(a, lambda i: 6)["ratio"], r(b, lambda i: 6)["ratio"]
    if ra is not None and rb: vals.append((ra, rb, ra / rb))
def q(k):
    v = sorted(x[k] for x in vals); return [round(v[int(0.025 * len(v))], 3), round(v[int(0.975 * len(v)) - 1], 3)]
out["six_hour_ci"] = {"pick_is_not_6h": q(0), "pick_is_6h": q(1), "ratio_not_over_is": q(2),
                      "ratio_point": round(out["pick_is_not_6h"]["6h"]["ratio"] / out["pick_is_6h"]["ratio"], 3)}
json.dump(out, open("data/explore_28.json", "w"), indent=1)
print(json.dumps(out["six_hour_ci"]))
