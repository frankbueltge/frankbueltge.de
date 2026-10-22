"""Study 37: checks by a second code path. The NB2 likelihood is written out by hand and maximised with scipy
(no statsmodels); the design is built with the csv module. Usage: python3 -I check37.py"""
import csv, json, math, sys, pathlib
import numpy as np
from scipy.optimize import minimize
from scipy.special import gammaln
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results37.json").read_text())
R36 = json.loads((HERE / "data/results36.json").read_text())
rows = [r for r in csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t") if r["warned"] == "1"]
DECLARED = 10
ran = 0
def ok(name, cond):
    global ran; ran += 1
    print(("PASS " if cond else "FAIL ") + name)
    return cond
def cat(r):
    if int(r["warnings_county_1y"]) == 0: return "none"
    if int(r["run_county"]) == 0: return "hit"
    return "run12" if int(r["run_county"]) <= 2 else "run3"
def xrow(r):
    ef = min(4, max(0, int(r["mag"]))); yr = int(r["yr"]); c = cat(r)
    reg = "South" if r["region"] == "other" else r["region"]
    return [1.0, c == "none", c == "run12", c == "run3", ef == 1, ef == 2, ef == 3, ef == 4,
            math.log(float(r["len_mi"]) + 0.01), math.log(float(r["wid_yd"])), float(r["night"] in ("1", "1.0", "True")),
            2012 <= yr <= 2016, yr >= 2017, reg == "Northeast", reg == "Midwest", reg == "West",
            math.log(float(r["density"])), math.log(float(r["exposure"]) + 1)]
X = np.array([xrow(r) for r in rows], dtype=float); Y = np.array([float(r["inj"]) for r in rows]); OM = np.array([int(r["om"]) for r in rows])
def nll(p, X, Y):
    b, la = p[:-1], p[-1]; a = math.exp(la); eta = X @ b; mu = np.exp(eta); r = 1 / a
    return -np.sum(gammaln(Y + r) - gammaln(r) - gammaln(Y + 1) + r * np.log(r / (r + mu)) + Y * np.log(mu / (r + mu)))
def fit(mask):
    p0 = np.zeros(X.shape[1] + 1); p0[0] = math.log(Y[mask].mean() + 1e-9)
    s = minimize(nll, p0, args=(X[mask], Y[mask]), method="BFGS", options={"maxiter": 20000, "gtol": 1e-7})
    s = minimize(nll, s.x, args=(X[mask], Y[mask]), method="Nelder-Mead", options={"maxiter": 20000, "xatol": 1e-8, "fatol": 1e-10}) if not s.success else s
    return s.x
res = []
res.append(ok("9,295 warned rows", len(rows) == R["n_warned"] == 9295))
full = fit(np.ones(len(Y), bool))
res.append(ok("hand NB2: full ratio within 0.003 of 1.214", abs(math.exp(full[3]) - R["full"]["irr"]) < 0.003))
res.append(ok("hand NB2: alpha within 1 % of 7.191", abs(math.exp(full[-1]) / R["alpha"] - 1) < 0.01))
mu = np.exp(X @ full[:-1])
for key, om in (("louisiana", 613559), ("joplin", 296616), ("tuscaloosa", 314625)):
    i = int(np.where(OM == om)[0][0]); n = R["named"][key]
    res.append(ok(f"hand NB2: {key}'s expected injured within 2 % ({mu[i]:.2f} vs {n['mu']})", abs(mu[i] / n["mu"] - 1) < 0.02))
for om, target in ((613559, 1.302), (315890, [x for x in R["refits"] if x["om"] == 315890][0]["refit"]["irr"]), (613772, [x for x in R["refits"] if x["om"] == 613772][0]["refit"]["irr"])):
    p = fit(OM != om)
    res.append(ok(f"hand NB2: without {om}, ratio within 0.003 of {target} ({math.exp(p[3]):.3f})", abs(math.exp(p[3]) - target) < 0.003))
la_move = abs(R36["sets"]["all"]["inj"]["irr"] - 1.302)
P4 = all(abs(x["refit"]["irr"] - 1.214) <= la_move and x["refit"]["lo"] <= 1.04 and x["refit"]["hi"] >= 1.46 for x in R["refits"])
res.append(ok("P4 verdict recomputed from the refits agrees", P4 == R["predictions"]["P4"]["held"]))
print(f"{ran} run, {DECLARED} declared, {res.count(False)} failed")
sys.exit(0 if ran == DECLARED and all(res) else 1)
