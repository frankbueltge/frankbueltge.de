"""Study 30 (session 215, 2026-10-20): the hour of deciding, or the size? Rules and predictions in
PREREGISTRATION-7.md, pushed (0867245) before anything here was computed. No new fetch: study 25's cells.

Answers the Atelier's plate XII (ulysses@6d1497e, presentations/cycle-008/exposition/plate12.py, .json, .js):
does an adjustment for the size of the stated chance, as well as the lag, remove the lift of "the version that
stated least among those written by hour H" at H = 12, 24, 48 h?

Usage: python3 -I analyse_30.py [PLATE12_JS]   (PLATE12_JS: the Atelier's plate12.js, for the gate on its picks;
                                                without it the gate checks the printed ratios only)
"""
import json, sys, hashlib, random, collections
from pathlib import Path

HERE = Path(__file__).parent
CELLS = HERE / "data/lagged_cells_25.tsv"
assert hashlib.sha256(CELLS.read_bytes()).hexdigest() == "669da73e28c1cc2d0fdcfb0a94f3fdb6bd0257327093204041ad0253ebc0d49a"
LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
CUTS = [0.01, 0.03, 0.1, 0.3]
TESTED = (12, 24, 48)
ATELIER_AC = {12: 1.387, 24: 1.571, 48: 1.59}           # plate12.json, deciding_at_H.least, clock_adjusted

def stratum(p): return sum(p >= c for c in CUTS)

rows = [l.rstrip("\n").split("\t") for l in open(CELLS)]
cells = collections.defaultdict(lambda: collections.defaultdict(list))   # id -> lag -> [(p, hit, stratum)]
for r in rows[1:]:
    c = dict(zip(rows[0], r)); p = float(c["p"])
    cells[c["id"]][int(c["lag"])].append((p, int(c["hit"]), stratum(p)))
ids = sorted(i for i in cells if all(l in cells[i] for l in LAGS))
assert len(ids) == 232
V = {i: {L: (sum(h for _, h, _ in cells[i][L]), sum(p for p, _, _ in cells[i][L])) for L in LAGS} for i in ids}

def least_by(H):
    return [min([l for l in LAGS if l <= H], key=lambda l: (V[i][l][1], l)) for i in ids]
PICK = {H: least_by(H) for H in LAGS}

def tables(sample, hits=None):
    """Per lag: O and E per stratum over the sample (sequence indices, with repeats), and the merged groups."""
    O = collections.defaultdict(float); E = collections.defaultdict(float)
    for j in sample:
        i = ids[j]
        for L in LAGS:
            for k, (p, h, s) in enumerate(cells[i][L]):
                O[L, s] += (h if hits is None else hits[j][L][k]); E[L, s] += p
    r = {}
    for L in LAGS:
        groups = [[s] for s in range(5)]
        while True:          # merge a group stating < 2 into the next lower one (the lowest upward)
            st = [sum(E[L, s] for s in g) for g in groups]
            bad = [k for k, e in enumerate(st) if e < 2]
            if not bad or len(groups) == 1: break
            k = bad[0]; t = k - 1 if k > 0 else 1
            groups[t] = sorted(groups[t] + groups[k]); del groups[k]
        for g in groups:
            o = sum(O[L, s] for s in g); e = sum(E[L, s] for s in g)
            for s in g: r[L, s] = o / e if e else 1.0
    clock = {L: sum(O[L, s] for s in range(5)) / sum(E[L, s] for s in range(5)) for L in LAGS}
    return r, clock, O, E

def adjusted(pick, subset, sample, r, clock, hits=None):
    """O, A_sc and A_c of a pick over the sequences of the sample that lie in the subset."""
    o = asc = ac = 0.0
    for j in sample:
        if j not in subset: continue
        i, L = ids[j], pick[j]
        o += V[i][L][0] if hits is None else sum(hits[j][L])
        asc += sum(p * r[L, s] for p, _, s in cells[i][L]); ac += V[i][L][1] * clock[L]
    return o, (o / asc if asc else float("nan")), (o / ac if ac else float("nan"))

ALL = list(range(232))
r0, clock0, O0, E0 = tables(ALL)

# gate: the Atelier's clock-adjusted ratios, and its picks if its file is given
for H in TESTED:
    assert round(adjusted(PICK[H], set(ALL), ALL, r0, clock0)[2], 3) == ATELIER_AC[H], H
gate_picks = None
if len(sys.argv) > 1:
    js = Path(sys.argv[1]).read_text()
    K = json.loads(js.split("const P12K=")[1].rstrip().rstrip(";"))
    li = {L: k for k, L in enumerate(LAGS)}
    gate_picks = {}
    for k, H in enumerate(LAGS):
        gate_picks[H] = K["l" + str(k)] == "".join(str(li[x]) for x in PICK[H])
    assert all(gate_picks.values()), gate_picks

rng = random.Random(20261020)
BOOT = [[rng.randrange(232) for _ in ALL] for _ in range(2000)]
q = lambda v, a: v[int(a * (len(v) - 1))]
def word(lo, hi): return "the choosing moved it" if (hi < 1 or lo > 1) else "reads what its adjustment reads"

SUBSETS = {H: {"all": set(ALL), "hindsight": {j for j in ALL if PICK[H][j] < H},
               "at_H": {j for j in ALL if PICK[H][j] == H}} for H in LAGS}
BS = {(H, n): ([], []) for H in LAGS for n in SUBSETS[H]}
for b in BOOT:                       # r and the clocks are re-estimated inside every resample, once per resample
    rb, cb, _, _ = tables(b)
    for H in LAGS:
        for name, sub in SUBSETS[H].items():
            _, x, y = adjusted(PICK[H], sub, b, rb, cb)
            if x == x: BS[H, name][0].append(x); BS[H, name][1].append(y)

def measure(H):
    out = {}
    for name, sub in SUBSETS[H].items():
        if not sub: out[name] = {"n": 0}; continue
        o, asc, ac = adjusted(PICK[H], sub, ALL, r0, clock0)
        bs, bc = sorted(BS[H, name][0]), sorted(BS[H, name][1])
        out[name] = {"n": len(sub), "observed": int(o), "A_sc": round(asc, 3),
                     "ci": [round(q(bs, .025), 3), round(q(bs, .975), 3)], "verdict": word(q(bs, .025), q(bs, .975)),
                     "A_c": round(ac, 3), "A_c_ci": [round(q(bc, .025), 3), round(q(bc, .975), 3)]}
    return out

RES = {H: measure(H) for H in LAGS}

# calibrated worlds: every cell true with probability min(1, p * r0); the rule reads p only
wr = random.Random(2610200)
WORLDS = {H: [] for H in LAGS}
for w in range(200):
    hits = [{L: [1 if wr.random() < min(1.0, p * r0[L, s]) else 0 for p, _, s in cells[ids[j]][L]] for L in LAGS} for j in ALL]
    rw, cw, _, _ = tables(ALL, hits)
    for H in LAGS:
        WORLDS[H].append(adjusted(PICK[H], set(ALL), ALL, rw, cw, hits)[1])
worlds = {H: round(sum(v) / len(v), 3) for H, v in WORLDS.items()}
worlds_ok = all(0.9 <= worlds[H] <= 1.1 for H in TESTED)

pred = {
    "P1": all(abs(RES[H]["all"]["A_sc"] - RES[H]["all"]["A_c"]) < 0.15 for H in TESTED),
    "P2": sum(RES[H]["all"]["ci"][0] > 1 for H in TESTED) >= 2,
    "P3": all(RES[H]["hindsight"]["A_sc"] > RES[H]["at_H"]["A_sc"] for H in TESTED),
    "P4": all(RES[H]["at_H"]["ci"][0] <= 1 <= RES[H]["at_H"]["ci"][1] for H in TESTED),
}
table = {f"{L}h": {["<0.01", "0.01-0.03", "0.03-0.1", "0.1-0.3", ">=0.3"][s]:
                   {"observed": int(O0[L, s]), "stated": round(E0[L, s], 2), "r_used": round(r0[L, s], 3)}
                   for s in range(5) if E0[L, s] > 0} for L in LAGS}
out = {"study": 30, "preregistration": "PREREGISTRATION-7.md (0867245)",
       "answers": "Atelier plate XII, ulysses@6d1497e presentations/cycle-008/exposition/plate12.json",
       "gate": {"atelier_clock_adjusted_reproduced": ATELIER_AC, "atelier_picks_reproduced": gate_picks},
       "reliability_by_lag_and_stratum": table,
       "least_by_H": {f"{H}h": RES[H] for H in LAGS}, "tested_H": list(TESTED),
       "calibrated_worlds": {"n": 200, "mean_A_sc": {f"{H}h": worlds[H] for H in LAGS}, "within_0.9_1.1": worlds_ok},
       "predictions": pred, "held": sum(pred.values())}
(HERE / "data/results_30.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "data-30.js").write_text("// generated by analyse_30.py from study 25's cells (USGS aftershock forecasts and ComCat)\n"
                                 "window.D30=" + json.dumps(out, separators=(",", ":")) + ";\n")
for H in LAGS:
    print(H, {k: (v["n"], v["observed"], v["A_c"], v["A_sc"], v["ci"]) for k, v in RES[H].items() if v["n"]})
print("worlds", worlds, worlds_ok); print(pred, sum(pred.values()))
