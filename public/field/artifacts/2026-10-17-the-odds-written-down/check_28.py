"""Study 28 checks. A second code path recounts every reliability row and SR_h from the TSV; the blind rules are
re-picked independently; in simulated calibrated worlds (each cell hit with its own stated chance, independently)
the blind rules and SR_h read 1 on average, so a departure in the record is not made by the rules themselves.
Exits non-zero on any failure; counts what it ran."""
import json, csv, random, sys
ran, failed = [], []
def check(name, cond):
    ran.append(name); print(("PASS " if cond else "FAIL ") + name)
    if not cond: failed.append(name)

LAGS = (0, 6, 12, 24, 48, 96, 168, 336, 720)
res = json.load(open("data/results_28.json")); ex = json.load(open("data/explore_28.json"))
with open("data/lagged_cells_25.tsv", newline="") as fh:
    T = [(r["id"], int(r["lag"]), float(r["p"]), int(r["hit"]), float(r["M"])) for r in csv.DictReader(fh, delimiter="\t")]
have = {}
for i, l, *_ in T: have.setdefault(i, set()).add(l)
ids = sorted(i for i, s in have.items() if s >= set(LAGS)); S = set(ids)
T = [t for t in T if t[0] in S]
check("232 sequences in the common set", len(ids) == 232)

def stratum(p):                                           # a second path: explicit comparisons, not a sum of booleans
    if p < 0.01: return 0
    if p < 0.03: return 1
    if p < 0.1: return 2
    if p < 0.3: return 3
    return 4

def reliab(rows):
    o = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]; e = [[0.0, 0.0] for _ in range(5)]
    for i, l, p, h, M in rows:
        k = stratum(p); j = 0 if l == 0 else 1; o[k][j] += h; e[k][j] += p
    return o, e

o, e = reliab(T)
for k, row in enumerate(res["reliability"]):
    check(f"stratum {row['stratum']}: first hour {row['first_hour']['observed']} of {row['first_hour']['stated']}",
          row["first_hour"]["observed"] == o[k][0] and abs(row["first_hour"]["stated"] - e[k][0]) < 0.006)
    check(f"stratum {row['stratum']}: later {row['later']['observed']} of {row['later']['stated']}",
          row["later"]["observed"] == o[k][1] and abs(row["later"]["stated"] - e[k][1]) < 0.006)
pred = sum(e[k][0] * o[k][1] / e[k][1] for k in range(5)); srh = sum(o[k][0] for k in range(5)) / pred
check(f"SR_h recomputes to {res['hour_beyond_size']['ratio']}", abs(srh - res["hour_beyond_size"]["ratio"]) < 0.0006)

seq = {}
for i, l, p, h, M in T:
    a = seq.setdefault((i, l), [0, 0.0]); a[0] += h; a[1] += p
def pick(i, lags, f): return f(lags, key=lambda l: (seq[(i, l)][1], l))
for name, f in (("stated_most", max), ("stated_least", min)):
    o_ = sum(seq[(i, pick(i, LAGS, f))][0] for i in ids); e_ = sum(seq[(i, pick(i, LAGS, f))][1] for i in ids)
    r = res["blind_on_the_words"][name]
    check(f"{name} re-picked: {o_} of {e_:.2f}", o_ == r["observed"] and abs(e_ - r["stated"]) < 0.006)
o_ = sum(seq[(i, pick(i, LAGS[1:], max))][0] for i in ids)
check(f"stated_most without the first hour: {o_} observed", o_ == res["without_first_hour"]["stated_most"]["observed"])
up = [i for i in ids if pick(i, LAGS[1:], max) != 6]
check(f"{len(up)} sequences where a later version stated more than 6 h", len(up) == ex["pick_is_not_6h"]["6h"]["n"] == 63)
check("the 6 h version's own week in those 63: 22 of 13.74", sum(seq[(i, 6)][0] for i in up) == 22 and abs(sum(seq[(i, 6)][1] for i in up) - 13.74) < 0.006)

# calibrated worlds: each cell hits with its own stated chance, independently. The rules must read about 1.
rng = random.Random(28); W = 200; acc = {"most": [], "least": [], "most_later": [], "srh": [], "six_up_over_rest": []}
for _ in range(W):
    sim = {}
    for i, l, p, h, M in T:
        a = sim.setdefault((i, l), [0, 0.0]); a[0] += rng.random() < p; a[1] += p
    for key, lags, f in (("most", LAGS, max), ("least", LAGS, min), ("most_later", LAGS[1:], max)):
        pk = [pick(i, lags, f) for i in ids]          # picks depend on stated chances only, identical in every world
        acc[key].append(sum(sim[(i, l)][0] for i, l in zip(ids, pk)) / sum(sim[(i, l)][1] for i, l in zip(ids, pk)))
    a =sum(sim[(i, 6)][0] for i in up) / sum(sim[(i, 6)][1] for i in up)
    rest = [i for i in ids if i not in set(up)]; b = sum(sim[(i, 6)][0] for i in rest) / sum(sim[(i, 6)][1] for i in rest)
    acc["six_up_over_rest"].append(a / b if b else None)
for key, v in acc.items():
    v = [x for x in v if x is not None]
    if not v: continue
    m = sum(v) / len(v); check(f"calibrated worlds: {key} reads {m:.2f} on average (within 0.9-1.1)", 0.9 <= m <= 1.1)

# the same worlds at the cell level for SR_h
rng = random.Random(29); vals = []
for _ in range(W):
    o2 = [[0, 0] for _ in range(5)]
    for i, l, p, h, M in T: o2[stratum(p)][0 if l == 0 else 1] += rng.random() < p
    pr = sum(e[k][0] * o2[k][1] / e[k][1] for k in range(5)); vals.append(sum(o2[k][0] for k in range(5)) / pr)
check(f"calibrated worlds: SR_h reads {sum(vals) / W:.2f} on average (within 0.9-1.1)", 0.9 <= sum(vals) / W <= 1.1)

print(f"{len(ran) - len(failed)} of {len(ran)} checks passed")
sys.exit(1 if failed else 0)
