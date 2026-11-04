"""Study 28. Rules of PREREGISTRATION-6.md (pushed 5b8d6f2), computed on study 25's files only (no fetch).
The Atelier's blind rules on the words (plate X) reproduced, then: is "too high" the first hour or the largest
stated chances? Reliability by stratum of stated chance, the hour beyond the size (SR_h), the size within the
later hour (SR_s). Writes data/results_28.json."""
import json, random, collections

LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
EDGES = [0.01, 0.03, 0.1, 0.3]
NAMES = ["<0.01", "0.01-0.03", "0.03-0.1", "0.1-0.3", ">=0.3"]
rows = [l.rstrip("\n").split("\t") for l in open("data/lagged_cells_25.tsv")]
cells = [dict(zip(rows[0], x)) for x in rows[1:]]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
by_seq = collections.defaultdict(list)                   # id -> [(lag, stratum, p, hit)]
for c in cells:
    i, l, p, h = c["id"], int(c["lag"]), float(c["p"]), int(c["hit"])
    g[i][l][0] += h; g[i][l][1] += p
    by_seq[i].append((l, sum(p >= e for e in EDGES), p, h))
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
assert len(ids) == 232

def verdict(lo, hi):
    return "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"

def boot(stat, seed=210, n=2000):
    rng = random.Random(seed); v = []
    for _ in range(n):
        s = stat([ids[rng.randrange(len(ids))] for _ in ids])
        if s is not None: v.append(s)
    v.sort(); return [round(v[int(0.025 * len(v))], 3), round(v[int(0.975 * len(v)) - 1], 3)]

# ---- checks: the Atelier's blind rules, tie order (e, lag) as plate10.py
def blind(f, lags, sample):
    pick = [f(lags, key=lambda l: (g[i][l][1], l)) for i in sample]
    o = sum(g[i][l][0] for i, l in zip(sample, pick)); e = sum(g[i][l][1] for i, l in zip(sample, pick))
    return o, e, pick

def blind_row(f, lags):
    o, e, pick = blind(f, lags, ids)
    ci = boot(lambda s: (lambda r: r[0] / r[1])(blind(f, lags, s)))
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3), "ci": ci, "verdict": verdict(*ci)}, pick

most, pick_most = blind_row(max, LAGS); least, pick_least = blind_row(min, LAGS)
assert (most["observed"], most["stated"], most["ratio"]) == (44, 89.06, 0.494), most
assert (least["observed"], least["stated"], least["ratio"]) == (11, 8.68, 1.267), least

# ---- P1: where the words point
p1 = {"most_is_first_hour": sum(l == 0 for l in pick_most), "least_is_720h": sum(l == 720 for l in pick_least),
      "most_lags": dict(collections.Counter(pick_most)), "least_lags": dict(collections.Counter(pick_least))}

# ---- reliability per stratum, first hour vs later
def tally(sample):
    t = collections.defaultdict(lambda: [0, 0.0])
    for i in sample:
        for l, k, p, h in by_seq[i]:
            if l in LAGS: t[(l == 0, k)][0] += h; t[(l == 0, k)][1] += p
    return t

def oe(t, first, k):
    o, e = t[(first, k)]; return o / e if e > 0 else None

T = tally(ids)
rel = []
for k, name in enumerate(NAMES):
    row = {"stratum": name}
    for first, tag in ((True, "first_hour"), (False, "later")):
        o, e = T[(first, k)]
        ci = boot(lambda s, first=first, k=k: oe(tally(s), first, k))
        row[tag] = {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3) if e else None, "ci": ci}
    rel.append(row)

def sr_h(sample):
    t = tally(sample); pred = 0.0; o0 = 0
    for k in range(len(NAMES)):
        r = oe(t, False, k)
        if r is None: return None
        o0 += t[(True, k)][0]; pred += t[(True, k)][1] * r
    return o0 / pred if pred > 0 else None

def sr_s(sample):
    t = tally(sample)
    top = [sum(t[(False, k)][j] for k in (3, 4)) for j in (0, 1)]; bot = [sum(t[(False, k)][j] for k in (0, 1)) for j in (0, 1)]
    if top[1] == 0 or bot[1] == 0 or bot[0] == 0: return None
    return (top[0] / top[1]) / (bot[0] / bot[1])

SRh = {"ratio": round(sr_h(ids), 3), "ci": boot(sr_h)}; SRh["verdict"] = verdict(*SRh["ci"])
SRs = {"ratio": round(sr_s(ids), 3), "ci": boot(sr_s)}

# ---- P5: the blind rules without the first hour
later_most, _ = blind_row(max, LAGS[1:]); later_least, _ = blind_row(min, LAGS[1:])

p4_rows = [r for r in rel if r["first_hour"]["stated"] >= 5]
preds = {
    "P1": p1["most_is_first_hour"] >= 0.9 * 232 and p1["least_is_720h"] >= 0.9 * 232,
    "P2": SRh["ci"][1] < 1,
    "P3": SRs["ci"][0] <= 1 <= SRs["ci"][1],
    "P4": all(r["first_hour"]["ratio"] < r["later"]["ratio"] for r in p4_rows),
    "P5": later_most["verdict"] == "cannot be told from right",
}
out = {"study": 28, "set": "study 25 common set, 232 sequences x 9 lags", "blind_on_the_words": {"stated_most": most, "stated_least": least},
       "where_the_words_point": p1, "reliability": rel, "hour_beyond_size": SRh, "size_within_later": SRs,
       "without_first_hour": {"stated_most": later_most, "stated_least": later_least},
       "p4_strata": [r["stratum"] for r in p4_rows], "predictions": preds}
json.dump(out, open("data/results_28.json", "w"), indent=1)
print(json.dumps(out, indent=1))
