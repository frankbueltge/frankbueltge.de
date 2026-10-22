"""Plate XII, The Hour of Deciding. Built on the Field's study 28 (field-research@40a970f,
artifacts/2026-10-17-the-odds-written-down/, data/lagged_cells_25.tsv and data/explore_28.json, sha256 asserted),
offered to this practice in the Field's bulletin of 2026-10-19 (s213) as a correction of plate X: the two rules
on the words, "the version that stated most" and "the version that stated least", are declarable before any
outcome but not blind, because a forecast's later versions are written from what the earlier weeks brought.

A correction of this practice's own claim is checked, never declined (amendment of 2026-10-05, point 2). This
plate checks it by a path the Field did not take, and asks the question that is this practice's, not the
Field's: plate VIII (after Hartman) let a verdict stand in the indicative "only if its reading was declared
before the outcome". If the Field is right, declaring is not enough. A rule declared in advance can still
consult, when it is applied, words that were written after the week it scores had begun. The plate asks
whether what decides is the hour of declaring or the hour of deciding.

The rules, fixed before counting (2026-10-19, fifth session; written into this header before any quantity
below was computed):
  set, cells   study 25's common set of 232 sequences at nine lags, re-added from lagged_cells_25.tsv exactly
               as plate10.py does: per sequence and lag, hits summed and stated chances summed over the cells.
  check        the Field's split, re-added here: per sequence the later lag (6 h and after) whose summed
               stated chance is largest, ties by (stated, lag); the 6 h version's own week read
               where that pick is not 6 h and where it is. Must equal explore_28.json (1.602 and 0.656) to
               0.001, else nothing is reported.
  the writing  a second path to the Field's claim: for each pair of consecutive versions written less than a
               week apart (so the later is written inside the earlier's week), whether the later states more
               than the earlier, split by whether an aftershock came in the earlier's week. Shares and their
               difference, 95 % interval from 2,000 resamplings of sequences, seed 20261019.
  deciding at H  for each hour H among the nine lags, "the version that stated most / least among those
               written by hour H", ties by (stated, lag) as plate X. At H = 720 these are plate X's two rules
               (asserted: 0.494 and 1.267). At H = 0 the first-hour clock. Hindsight of a pick: H minus the
               chosen version's lag, in hours, capped at its week (168 h).
  decidable    rules a reader can apply at the hour each version is written, from the words written so far:
               "the first later version that states at least c times the first hour's chance, else the last"
               for c in 1, 2, 4; "the first later version that states at most c times the first hour's, else
               the last" for c in 0.5, 0.1, 0.02. Nothing written after the chosen version is consulted.
  clock-adjusted  for any rule, observed hits over the hits its picks would bring if each pick came true at
               its own clock's rate over the 232 (O / sum of p times r(lag)). Near 1: the rule reads what
               its clocks read. Away from 1: the choosing itself moved the verdict. Same resampling.
  verdicts     as the Field's: an interval wholly below 1 "too high", wholly above "too low", else "cannot be
               told from right".
  predictions  (P1) after an aftershock in the earlier week, the later version states more, more often; the
               difference's interval excludes 0. (P2) every decidable rule's clock-adjusted ratio cannot be
               told from 1. (P3) plate X's two rules (H = 720), clock-adjusted, can: "least" above 1,
               "most" below.

Usage: python3 -I plate12.py FIELD_ARTIFACT_DIR    (writes plate12.json and plate12.js beside itself; plate12.js carries
                                                    every rule's exact picks, since the page's rows are rounded to four decimals)
"""
import json, sys, hashlib, random, collections
from pathlib import Path

HERE = Path(__file__).parent
D = Path(sys.argv[1])
COMMIT = "40a970f"
SHA = {"data/lagged_cells_25.tsv": "669da73e28c1cc2d0fdcfb0a94f3fdb6bd0257327093204041ad0253ebc0d49a"}
for f, h in SHA.items():
    assert hashlib.sha256((D / f).read_bytes()).hexdigest() == h, f + " is not the Field's file"
X28 = json.load(open(D / "data/explore_28.json"))
SHA["data/explore_28.json"] = hashlib.sha256((D / "data/explore_28.json").read_bytes()).hexdigest()
LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
rows = [l.rstrip("\n").split("\t") for l in open(D / "data/lagged_cells_25.tsv")]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
for r in rows[1:]:
    c = dict(zip(rows[0], r)); g[c["id"]][int(c["lag"])][0] += int(c["hit"]); g[c["id"]][int(c["lag"])][1] += float(c["p"])
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
assert len(ids) == 232
P8R = json.loads((HERE / "plate8.js").read_text().split("const P8R=")[1].rstrip().rstrip(";"))
assert [r[0] for r in P8R] == ids and all(P8R[n][3][k][0] == g[i][L][0] and abs(P8R[n][3][k][1] - round(g[i][L][1], 4)) < 1e-9
                                          for n, i in enumerate(ids) for k, L in enumerate(LAGS))   # the page reuses plate8.js's rows
P10 = json.loads((HERE / "plate10.js").read_text().split("const P10=")[1].split(";\nconst P10K=")[0])

rng = random.Random(20261019); BOOT = [[rng.randrange(232) for _ in ids] for _ in range(2000)]
q = lambda v, a: v[int(a * (len(v) - 1))]
word = lambda lo, hi: "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"
CLOCK = {L: sum(g[i][L][0] for i in ids) / sum(g[i][L][1] for i in ids) for L in LAGS}
for k, L in enumerate(LAGS): assert abs(round(CLOCK[L], 3) - P10["copy_texts"][k]["copy_text"]["ratio"]) < 0.0011

def verdict(pick, sample=None):
    """O/E of a pick (one lag per sequence), and its clock-adjusted ratio, each with a resampled interval."""
    idx = range(232) if sample is None else sample
    S = [(g[ids[j]][pick[j]][0], g[ids[j]][pick[j]][1], g[ids[j]][pick[j]][1] * CLOCK[pick[j]]) for j in range(232)]
    def tot(b): o = sum(S[j][0] for j in b); return o, sum(S[j][1] for j in b), sum(S[j][2] for j in b)
    o, e, a = tot(idx)
    if sample is None:
        rs = sorted((lambda t: (t[0] / t[1], t[0] / t[2]))(tot(b)) for b in BOOT)
        r1 = sorted(x[0] for x in rs); r2 = sorted(x[1] for x in rs)
    lo, hi, alo, ahi = q(r1, .025), q(r1, .975), q(r2, .025), q(r2, .975)
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3), "ci": [round(lo, 3), round(hi, 3)],
            "verdict": word(lo, hi), "clock_adjusted": round(o / a, 3), "adj_ci": [round(alo, 3), round(ahi, 3)],
            "adj_verdict": "the choosing moved it" if (ahi < 1 or alo > 1) else "reads what its clocks read",
            "lags": dict(collections.Counter(str(x) for x in pick))}

# the check: the Field's split, re-added
pick28 = {i: max(LAGS[1:], key=lambda l: (g[i][l][1], l)) for i in ids}
def oe(sample, lag): o = sum(g[i][lag][0] for i in sample); e = sum(g[i][lag][1] for i in sample); return round(o / e, 3)
up = [i for i in ids if pick28[i] != 6]; six = [i for i in ids if pick28[i] == 6]
check = {"pick_is_not_6h_6h_week": oe(up, 6), "pick_is_6h_6h_week": oe(six, 6), "n": [len(up), len(six)]}
assert abs(check["pick_is_not_6h_6h_week"] - X28["pick_is_not_6h"]["6h"]["ratio"]) <= 0.001
assert abs(check["pick_is_6h_6h_week"] - X28["pick_is_6h"]["ratio"]) <= 0.001

# the writing: is a later version written from what the earlier week brought?
pairs = [(a, b) for a, b in zip(LAGS, LAGS[1:]) if b - a < 168]
def writing(sample):
    n = {1: [0, 0], 0: [0, 0]}
    for i in sample:
        for a, b in pairs:
            h = 1 if g[i][a][0] > 0 else 0; n[h][0] += 1; n[h][1] += g[i][b][1] > g[i][a][1]
    return n
w = writing(ids)
share = {h: w[h][1] / w[h][0] for h in (0, 1)}
diffs = []
for b in BOOT:
    x = writing([ids[j] for j in b])
    if x[1][0] and x[0][0]: diffs.append(x[1][1] / x[1][0] - x[0][1] / x[0][0])
diffs.sort()
by_pair = {}
for a, b in pairs:
    c = {h: [0, 0] for h in (0, 1)}
    for i in ids:
        h = 1 if g[i][a][0] > 0 else 0; c[h][0] += 1; c[h][1] += g[i][b][1] > g[i][a][1]
    by_pair[f"{a}-{b}"] = {"after_a_hit": c[1], "after_none": c[0]}
the_writing = {"pairs": [f"{a}-{b}" for a, b in pairs],
               "after_a_hit": {"pairs": w[1][0], "states_more": w[1][1], "share": round(share[1], 3)},
               "after_none": {"pairs": w[0][0], "states_more": w[0][1], "share": round(share[0], 3)},
               "difference": round(share[1] - share[0], 3), "ci": [round(q(diffs, .025), 3), round(q(diffs, .975), 3)],
               "by_pair": by_pair}

# deciding at hour H
deciding = {}; PICKS = {}; li = {L: k for k, L in enumerate(LAGS)}
for H in LAGS:
    avail = [l for l in LAGS if l <= H]
    for name, f in (("least", min), ("most", max)):
        p = [f(avail, key=lambda l: (g[i][l][1], l)) for i in ids]
        v = verdict(p); hs = [min(H - l, 168) for l in p]; PICKS[name[0] + str(li[H])] = "".join(str(li[x]) for x in p)
        v["hindsight_h_mean"] = round(sum(hs) / 232, 1); v["picks_with_hindsight"] = sum(1 for x in hs if x > 0)
        deciding.setdefault(name, []).append(dict(H=H, **v))
assert abs(deciding["least"][-1]["ratio"] - P10["blind_on_the_words"]["stated_least"]["ratio"]) < 0.0011
assert abs(deciding["most"][-1]["ratio"] - P10["blind_on_the_words"]["stated_most"]["ratio"]) < 0.0011
assert deciding["least"][0]["ratio"] == deciding["most"][0]["ratio"] == round(CLOCK[0], 3)

# decidable rules: stopping at the hour of writing
decidable = []
for kind, cs in (("raise", (1, 2, 4)), ("fall", (0.5, 0.1, 0.02))):
    for c in cs:
        def stop(i):
            for l in LAGS[1:]:
                if (g[i][l][1] >= c * g[i][0][1]) if kind == "raise" else (g[i][l][1] <= c * g[i][0][1]): return l
            return 720
        pk = [stop(i) for i in ids]; PICKS["d" + str(len(decidable))] = "".join(str(li[x]) for x in pk)
        decidable.append(dict(rule=kind, c=c, **verdict(pk)))
clocks = [dict(H=L, **verdict([L] * 232)) for L in LAGS]

out = {"source": {"repo": "frankbueltge/field-research", "commit": COMMIT,
                  "path": "artifacts/2026-10-17-the-odds-written-down/", "sha256": SHA},
       "sequences": 232, "lags_h": LAGS, "check_field_split": check, "the_writing": the_writing,
       "clocks": clocks, "deciding_at_H": deciding, "decidable": decidable,
       "predictions": {
           "P1": the_writing["ci"][0] > 0,
           "P2": all(d["adj_verdict"] == "reads what its clocks read" for d in decidable),
           "P3": deciding["least"][-1]["adj_ci"][0] > 1 and deciding["most"][-1]["adj_ci"][1] < 1}}
(HERE / "plate12.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "plate12.js").write_text("// generated by plate12.py from the Field's study 28 (USGS aftershock forecasts and ComCat)\n"
                                 "const P12=" + json.dumps(out) + ";\nconst P12K=" + json.dumps(PICKS, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("check_field_split", "the_writing", "predictions")}, indent=1))
for name in ("least", "most"):
    for d in deciding[name]: print(name, d["H"], d["ratio"], d["ci"], d["clock_adjusted"], d["adj_ci"], d["hindsight_h_mean"], d["picks_with_hindsight"])
for d in decidable: print(d["rule"], d["c"], d["ratio"], d["ci"], d["clock_adjusted"], d["adj_ci"], d["lags"])
for d in clocks: print("clock", d["H"], d["ratio"], d["ci"])
