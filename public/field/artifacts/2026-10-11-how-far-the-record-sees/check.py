"""Checks for study 8. Counts what it ran and fails if any check did not run."""
import json, math, sys
R = json.load(open("data/results.json")); ran = []; failed = []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)
rows = [l.split("\t") for l in open("data/passages.tsv").read().splitlines()[1:]]
check("rows = count - exclusions", len(rows) == R["source"]["cad_count"] - sum(R["excluded"].values()))
check("every b below the line", all(float(r[5]) < R["b_max_ld"] for r in rows))
check("b >= r (focusing only enlarges)", all(float(r[5]) >= float(r[2]) - 1e-4 for r in rows))
mu, AU, LD = 398600.4418, 149597870.7, 384400.0
r0 = rows[0]; rk = float(r0[2]) * LD; v = float(r0[3])
check("b recomputes", abs(rk * math.sqrt(1 + 2 * mu / (rk * v * v)) / LD - float(r0[5])) < 1e-3)
for w, lo, hi in (("primary_2015_2025", 2015, 2025), ("secondary_1990_2014", 1990, 2014)):
    sub = [r for r in rows if lo <= int(r[1][:4]) <= hi]
    check(f"{w} n", len(sub) == R[w]["n"])
    check(f"{w} bins sum", sum(e["n"] for e in R[w]["by_bin"].values()) == R[w]["n"])
    for n, e in R[w]["by_bin"].items():
        check(f"{w} {n} C in CI", e["C_ci95"][0] <= e["C"] <= e["C_ci95"][1])
        check(f"{w} {n} shells sum", sum(s["n"] for s in e["shells"]) == e["n"])
# Uniform-flux sanity: synthetic uniform b^2 sample gives C near 0.25 under the same rule.
import random
rng = random.Random(1); B = R["b_max_ld"]
syn = [B * math.sqrt(rng.random()) for _ in range(100000)]
check("synthetic uniform C = 0.25", abs(sum(1 for b in syn if b < B / 2) / len(syn) - 0.25) < 0.005)
ls = R["late_share_studio_1ld_1990_2025"]
check("studio matched >= 95 %", ls["matched_to_service"] / ls["considered"] >= 0.95)
check("studio bins sum", sum(e["n"] for e in ls["by_bin"].values()) == ls["considered"])
check("five verdicts", sorted(R["predictions"]) == ["P1", "P2", "P3", "P4", "P5"])
expected = 4 + 2 * 2 + 2 * 6 * 2 + 1 + 3
print(f"{len(ran)} checks ran (expected {expected}), {len(failed)} failed", failed)
sys.exit(0 if not failed and len(ran) == expected else 1)
