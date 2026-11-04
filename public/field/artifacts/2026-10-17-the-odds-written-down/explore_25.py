"""Study 25, exploratory (chosen after the primary result; not a prediction). On the 232 sequences closed at
every lag: (a) the sighted reader, who picks one of the nine lagged versions per sequence after seeing what
came, to make observed / stated as low or as high as possible (exact, Dinkelbach's method); (b) the blind
reader, who draws one lag per sequence before seeing anything (2,000 readers, seed 210). Writes
data/explore_25.json and data-25.js (the page's data: results_25.json plus this)."""
import json, random, collections
res = json.load(open("data/results_25.json"))
LAGS = res["lags_h"]
rows = [l.rstrip("\n").split("\t") for l in open("data/lagged_cells_25.tsv")]
cells = [dict(zip(rows[0], x)) for x in rows[1:]]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
for c in cells:
    g[c["id"]][int(c["lag"])][0] += int(c["hit"]); g[c["id"]][int(c["lag"])][1] += float(c["p"])
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
assert len(ids) == res["common_sequences"]

def dinkelbach(sign):
    lam = 1.0
    for _ in range(100):
        pick = {i: max(LAGS, key=lambda l: sign * (g[i][l][0] - lam * g[i][l][1])) for i in ids}
        o = sum(g[i][pick[i]][0] for i in ids); e = sum(g[i][pick[i]][1] for i in ids)
        if abs(o / e - lam) < 1e-12: break
        lam = o / e
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3),
            "picks_by_lag": {str(l): sum(1 for i in ids if pick[i] == l) for l in LAGS}}

rng = random.Random(210); blind = []
for _ in range(2000):
    pick = {i: rng.choice(LAGS) for i in ids}
    blind.append(sum(g[i][pick[i]][0] for i in ids) / sum(g[i][pick[i]][1] for i in ids))
blind.sort()
ex = {"sequences": len(ids), "harshest_sighted": dinkelbach(-1), "kindest_sighted": dinkelbach(1),
      "blind_lag_per_sequence": {"readers": 2000, "median": round(blind[1000], 3), "range_95": [round(blind[50], 3), round(blind[1949], 3)]},
      "versions_in_archive": sum(len(json.loads(l)["versions"]) for l in open("data/versions_25.jsonl"))}
json.dump(ex, open("data/explore_25.json", "w"), indent=1)
page = {k: res[k] for k in ("lags_h", "primary", "common_set", "common_sequences", "spearman_lag_vs_OE", "range_of_points",
                            "atelier_sighted_range", "predictions_held", "checks")}
page["explore"] = ex
open("data-25.js", "w").write("window.D25=" + json.dumps(page, separators=(",", ":")) + ";\n")
print(json.dumps(ex, indent=1))
