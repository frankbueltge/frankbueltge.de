"""Cycle 006, session 3 — the anthropic shadow, read twice, and the coin that drifts.

Model (Ćirković, Sandberg & Bostrom 2010, eq. 7): a world has N slots; in each an incident
happens with chance alpha; an incident ends the world with chance beta. An observer exists only
where no incident was lethal. Thomas (2024, §§2-3) argues the shadow vanishes once survival
itself is counted as evidence. This script checks both readings by simulation and exact sums,
and adds a world whose lethality drifts. Seeded; writes results.json beside itself.
"""
import json, math, hashlib, pathlib
import numpy as np

HERE = pathlib.Path(__file__).parent
rng = np.random.default_rng(20261008)
N = 40
out = {"model": {"N": N, "source_eq": "Ćirković et al. 2010, eq. 7-9, pp. 1497-1498"}}

# P1 — fixed nature: alpha, beta held; what does a survivor read off its own record?
a, b, W = 0.10, 0.5, 200_000
inc = rng.random((W, N)) < a
lethal = inc & (rng.random((W, N)) < b)
alive = ~lethal.any(axis=1)
k = inc.sum(axis=1)
read = k[alive] / N
p1_pred = a * (1 - b) / (1 - a * b)
out["P1"] = {"alpha": a, "beta": b, "worlds": W, "survivors": int(alive.sum()),
             "survival_exact": (1 - a * b) ** N,
             "mean_rate_read_by_survivors": float(read.mean()), "exact": p1_pred,
             "underread_factor": a / float(read.mean()),
             "held": abs(read.mean() - p1_pred) <= 0.003}
# histogram of survivors' read rate, for the page (k = 0..N)
out["P1"]["hist_k"] = np.bincount(k[alive], minlength=N + 1).tolist()
out["P1"]["hist_k_nobody_died"] = np.bincount(k, minlength=N + 1).tolist()

# P2 — uncertain nature: alpha ~ U(0,1) per world; survivors with k = 2; their true alpha
W2 = 3_000_000
al = rng.random(W2)
k2 = rng.binomial(N, al)
surv = rng.random(W2) < (1 - b) ** k2          # every one of the k incidents survived
sel = surv & (k2 == 2)
naive = 3 / 42                                    # Beta(k+1, N-k+1) mean, as if nobody died
out["P2"] = {"beta": b, "worlds": W2, "survivors_with_k2": int(sel.sum()),
             "mean_true_alpha": float(al[sel].mean()), "naive_beta_mean": naive,
             "held": abs(al[sel].mean() - naive) <= 0.003}
# for the page: per k, mean true alpha among survivors vs naive (k+1)/(N+2)
rows = []
for kk in range(0, 9):
    s = surv & (k2 == kk)
    rows.append({"k": kk, "n": int(s.sum()), "mean_true_alpha": float(al[s].mean()),
                 "naive": (kk + 1) / (N + 2)})
out["P2"]["by_k"] = rows

# P3 — the coin that drifts: beta_t = beta_now (t/N)^4 against beta = 0 throughout
bnow, g = 0.5, 4
bt = bnow * ((np.arange(1, N + 1)) / N) ** g
S_drift = float(np.prod(1 - a * bt))            # chance a drifting world has an observer
# Reading A (survival counted as evidence, Thomas): equal priors on the two worlds, then
# condition on the record. Every survived record is at least as likely in the safe world
# (likelihood ratio = prod over incident slots of (1 - beta_t) <= 1), so the best guess is
# always "safe", right with probability 1 / (1 + S_drift).
accA = 1 / (1 + S_drift)
# Reading B (survival as background, the shadow): compare the record's distribution given
# survival. Best accuracy = 1/2 + TV/2; TV estimated from the safe world's records.
M = 1_000_000
incs = rng.random((M, N)) < a
ratio = np.prod(np.where(incs, 1 - bt, 1.0), axis=1) / S_drift
tv = float(np.mean(np.maximum(0, 1 - ratio)))
accB = 0.5 + tv / 2
out["P3"] = {"alpha": a, "beta_now": bnow, "ramp_exponent": g, "beta_t": bt.round(6).tolist(),
             "drifting_world_survival": S_drift,
             "risk_per_slot_now": {"safe": 0.0, "drifting": a * bnow},
             "best_accuracy_survival_as_evidence": accA,
             "best_accuracy_survival_as_background": accB,
             "held": max(accA, accB) <= 0.60}

# P4 — eq. 9's posterior on beta after k survived incidents: (k+1)(1-beta)^k
def ub95(kk):
    return 1 - 0.05 ** (1 / (kk + 1))
out["P4"] = {"upper95": {str(kk): ub95(kk) for kk in (0, 1, 2, 3, 5, 9, 14, 30, 100)},
             "mode_always": 0.0,
             "held": ub95(0) > 0.9 and ub95(14) > 0.15}
out["P4"]["anchors"] = {
    "0": "no incident of the class on record",
    "3": "incidents the MIT AI Incident Tracker's model-assigned class 'AI pursuing its own goals' holds (Field, session 188)",
    "14": "incidents one Field reader judged to meet that class's own definition (Field, session 188)"}

# provenance of the two primary texts read (checksums of the copies fetched 2026-10-08)
out["sources"] = [
    {"cite": "Ćirković, M. M., Sandberg, A., Bostrom, N. (2010). Anthropic Shadow: Observation Selection Effects and Human Extinction Risks. Risk Analysis 30(10), 1495-1506. doi:10.1111/j.1539-6924.2010.01460.x",
     "url": "https://nickbostrom.com/papers/anthropicshadow.pdf",
     "sha256": "c4d2f4325c0351cebe083ce08560585b460546303cee2e14eed595c68752baf7"},
    {"cite": "Thomas, T. (2024). Dispelling the Anthropic Shadow. Global Priorities Institute Working Paper 20-2024, University of Oxford.",
     "url": "https://pdf.stafforini.com/thomas-2024-dispelling-anthropic-shadow.pdf",
     "sha256": None}]
tp = pathlib.Path("/tmp/claude-0/-home-user/59ffd29f-0ecb-5d46-adaa-c68e98148daf/scratchpad/src/thomas.pdf")
if tp.exists():
    out["sources"][1]["sha256"] = hashlib.sha256(tp.read_bytes()).hexdigest()

def clean(o):
    if isinstance(o, dict): return {k: clean(v) for k, v in o.items()}
    if isinstance(o, list): return [clean(v) for v in o]
    if isinstance(o, (np.bool_,)): return bool(o)
    if isinstance(o, float): return round(o, 6)
    return o
(HERE / "results.json").write_text(json.dumps(clean(out), indent=1, ensure_ascii=False))
for p in ("P1", "P2", "P3", "P4"):
    print(p, {k: v for k, v in out[p].items() if not isinstance(v, (list, dict))})
