"""Project 10, session 1, EXPLORATORY (not registered): is the null confounded by regional conventions?
Shuffle keys within volume x range class x a grid cell of G degrees, G in (20, 10, 5, 2); 10 shuffles each.
Usage: python3 explore1.py SCRATCHDIR -> explore1.json"""
import collections, json, random, sys
import numpy as np
from session1 import nearest_twins

rows = json.load(open(sys.argv[1] + "/rows_full.json"))
T = [x for x in rows if x["kind"] == "rhythmic" and x["lat"] is not None]
lat = np.array([x["lat"] for x in T]); lon = np.array([x["lon"] for x in T])
keys = [f'{x["k"]}|{x["p"]}' for x in T]
obs = {c: float(np.median([x["twin_km"] for x in T if x["rg"] is not None and x["twin_km"] is not None and (c == "all" or x["c"] == c)]))
       for c in ("all", "major", "middle", "minor")}
out = {"observed_median_km": obs, "by_grid": {}}
for G in (20, 10, 5, 2):
    strata = collections.defaultdict(list)
    for i, x in enumerate(T):
        strata[(x["v"], x["c"], int((x["lat"] + 90) // G), int((x["lon"] + 180) // G))].append(i)
    meds = collections.defaultdict(list)
    for s in range(10):
        rng = random.Random(20261016 + 100 * G + s)
        k2 = list(keys)
        for idx in strata.values():
            ks = [keys[i] for i in idx]; rng.shuffle(ks)
            for i, k in zip(idx, ks):
                k2[i] = k
        d2, _, _ = nearest_twins(lat, lon, k2)
        for c in obs:
            sel = [i for i, x in enumerate(T) if x["rg"] is not None and (c == "all" or x["c"] == c) and np.isfinite(d2[i])]
            meds[c].append(float(np.median(d2[sel])))
    out["by_grid"][G] = {c: {"null_median_km": float(np.median(meds[c])), "R": obs[c] / float(np.median(meds[c]))} for c in obs}
    print(G, {c: round(v["R"], 3) for c, v in out["by_grid"][G].items()})
json.dump(out, open("explore1.json", "w"), indent=1)
