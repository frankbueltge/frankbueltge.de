import json
# Published counts (data/sources.json)
COLLECTED, EMAILED, BOUNCED, FUNC, RESP = 21800, 20066, 1607, 18459, 2778
assert EMAILED - BOUNCED == FUNC
rr = RESP / FUNC
rr_all = RESP / COLLECTED
p = 0.38  # share of respondents with >=10 % on extremely bad outcome (sec 4.2)
lo = rr * p
hi = lo + (1 - rr)
def pop(p, r): return rr * p + (1 - rr) * r
def r_for(target, p=p): return (target - rr * p) / (1 - rr)
def industry_shift(f, dq, rho=0.61, base=p):
    """Raw respondent share vs weighted-to-invited share when stratum (invited share f,
    response ratio rho) holds >= 10 % at base+dq, the rest at base-dq*f/(1-f) so raw stays at `base`."""
    sr = rho * f / (rho * f + 1 - f)
    q_in = base + dq
    q_out = (base - sr * q_in) / (1 - sr)
    return (f * q_in + (1 - f) * q_out) - base
shifts = [abs(industry_shift(f / 100, dq / 100)) * 100 for f in range(10, 51) for dq in range(-10, 11)]
res = {
 "response_rate_functioning": rr, "response_rate_all_collected": rr_all,
 "population_bounds_for_38pct": [lo, hi], "bounds_width": hi - lo,
 "r_for_population_10pct": r_for(0.10), "r_for_population_38pct": p,
 "r_for_population_50pct": r_for(0.50),
 "headline_variants": {k: {"lower": rr * v, "upper": rr * v + 1 - rr} for k, v in {"38.0": .38, "41.2": .412, "51.4": .514}.items()},
 "max_stratum_shift_points": max(shifts),
 "ratio_width_to_shift": (hi - lo) * 100 / max(shifts),
 "predictions": {}
}
res["predictions"] = {
 "P1": res["r_for_population_10pct"] < 0.06,
 "P2": res["max_stratum_shift_points"] < 2,
 "P3": rr_all < 0.13,
 "P4": res["ratio_width_to_shift"] > 50,
}
json.dump(res, open("data/results.json", "w"), indent=1)
print(json.dumps(res, indent=1))
