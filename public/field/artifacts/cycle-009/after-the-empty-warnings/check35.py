"""Study 35, second code path: recompute without analyse35.py's frames or optimiser.
Usage: python3 -I check35.py <studio record.js @c746704>
Categories and sums by the csv module; the run-3 fits refitted by BFGS from a zero start; the Studio's
shares by plain loops; the bootstrap redrawn with another seed."""
import csv, sys, json, math, random, pathlib, warnings
import numpy as np, statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
R = json.load(open(HERE / "data/results35.json"))
n_pass = n_fail = 0
def ok(name, c):
    global n_pass, n_fail
    n_pass += bool(c); n_fail += not c; print(("PASS " if c else "FAIL ") + name)
DECLARED = 20   # first declared 21; the self-count caught it (README, deviations)

rows = [r for r in csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t") if r["warned"] == "1"]
ok("warned rows", len(rows) == R["n_warned"])
def cat(r):
    n, run = int(r["warnings_county_1y"]), int(r["run_county"])
    return "none" if n == 0 else "hit" if run == 0 else "run12" if run <= 2 else "run3"
agg = {}
for r in rows:
    a = agg.setdefault(cat(r), [0, 0, 0]); a[0] += 1; a[1] += int(r["inj"]); a[2] += int(r["fat"])
for c, (n, i, d) in sorted(agg.items()):
    b = R["by_cat"][c]
    ok(f"{c}: n, injured, dead", (n, i, d) == (b["n"], b["injured"], b["dead"]))
ok("categories partition the warned rows", sum(a[0] for a in agg.values()) == len(rows))

# refit: own design matrix, BFGS from zero
def x(r):
    ef = min(max(int(r["mag"]), 0), 4); reg = "South" if r["region"] == "other" else r["region"]; yr = int(r["yr"])
    c = cat(r)
    return [1.0, c == "none", c == "run12", c == "run3", ef == 1, ef == 2, ef == 3, ef == 4,
            math.log(float(r["len_mi"]) + 0.01), math.log(float(r["wid_yd"])), float(r["night"]),
            2012 <= yr <= 2016, yr >= 2017, reg == "Northeast", reg == "Midwest", reg == "West",
            math.log(float(r["density"])), math.log(float(r["exposure"]) + 1)]
X = np.array([x(r) for r in rows], dtype=float)
for y, key in (("inj", "inj"), ("fat", "fat")):
    Y = np.array([int(r[key]) for r in rows], dtype=float)
    m = sm.NegativeBinomial(Y, X, loglike_method="nb2")
    res = m.fit(start_params=np.append(np.zeros(X.shape[1]), 1.0), method="bfgs", maxiter=5000, disp=0, cov_type="HC0")
    res = m.fit(start_params=res.params, method="newton", maxiter=200, disp=0, cov_type="HC0")
    ci = res.conf_int()
    got = (math.exp(res.params[3]), math.exp(ci[3, 0]), math.exp(ci[3, 1]))
    f = R["fits"][y]["run3"]
    ok(f"{y} run3 IRR and interval by BFGS from zero", all(abs(a - b) < 0.006 for a, b in zip(got, (f["irr"], f["lo"], f["hi"]))))

w_i, w_f = 1 - 0.614, 1 - 0.894
ok("habit price, injuries", round((1 - w_i * 0.27194614941384854) / (1 - w_i), 3) == R["prices"]["inj"]["habit"])
ok("learning price, injuries", round((1 - w_i * 0.9588637051705554) / (1 - w_i * 1.0216736458723723), 3) == R["prices"]["inj"]["learning"])
ok("habit price, deaths", round((1 - w_f * 0.27194614941384854) / (1 - w_f), 3) == R["prices"]["fat"]["habit"])
ok("total disbelief bounds every habit price", R["explore"]["habit_price_total_disbelief_inj"] >= R["prices"]["inj"]["habit"])
ok("total disbelief inside the injuries interval", R["fits"]["inj"]["run3"]["lo"] <= R["explore"]["habit_price_total_disbelief_inj"] <= R["fits"]["inj"]["run3"]["hi"])

txt = pathlib.Path(sys.argv[1]).read_text()
rec = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
warned = [d for d in rec["dead"] if d[4] != -1]
ok("no -2 rows (every covering warning read in a county)", all(d[4] >= -1 for d in rec["dead"]))
tot = sum(d[1] for d in warned); deep = sum(d[1] for d in warned if d[4] >= 3)
ok("warned deadly tornadoes and their dead", (len(warned), tot) == (R["studio"]["deadly_warned"], R["studio"]["dead_warned"]))
ok("dead after runs of 3+", deep == R["studio"]["dead_run3"] == 550)
ok("death-weighted share", abs(deep / tot - R["studio"]["share_deaths_run3"]) < 1e-4)
ok("per-tornado share", abs(sum(d[4] >= 3 for d in warned) / len(warned) - R["studio"]["share_tornadoes_run3"]) < 1e-4)
random.seed(3535); bs = []
for _ in range(10000):
    s = [random.choice(warned) for _ in warned]
    bs.append(sum(d[1] for d in s if d[4] >= 3) / sum(d[1] for d in s))
bs.sort(); lo, hi = bs[249], bs[9749]
ok("bootstrap interval reproduces within 0.02", abs(lo - R["studio"]["boot95"][0]) < 0.02 and abs(hi - R["studio"]["boot95"][1]) < 0.02)
ok("predictions as recorded: P1 failed, P2-P6 held", [k for k, v in R["predictions"].items() if v["held"]] == ["P2", "P3", "P4", "P5", "P6"])

print(f"{n_pass} passed, {n_fail} failed, {n_pass + n_fail} run, {DECLARED} declared")
ok("self-count: declared equals run", n_pass + n_fail == DECLARED)
sys.exit(1 if n_fail else 0)
