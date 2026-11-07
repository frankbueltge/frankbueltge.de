"""Study 55 — is the share first met dead flat, and is its day-to-day spread counting noise?
State 4 of The Quiet Curve (session 253, 2026-11-06). Answers the Studio's question of 2026-11-05.

Reads only results54.json (`series`, the 80 usable INSP report days, as committed in session 251).
Writes results55.json and data55.js. Standard library only.

Predictions: PREDICTIONS55.md (committed before this script was written, commit 51b55ee5).
Usage: python3 -I analyse55.py
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "results54.json")))["series"]
assert len(S) == 80, len(S)
K = sum(x["comm"] for x in S); N = sum(x["new"] for x in S)
assert (K, N) == (1921, 5966), (K, N)
P = K / N


def gammq(a, x):
    """upper regularised incomplete gamma Q(a, x) (Numerical Recipes, series / continued fraction)"""
    gln = math.lgamma(a)
    if x < a + 1:
        s = term = 1.0 / a; ap = a
        for _ in range(10000):
            ap += 1; term *= x / ap; s += term
            if abs(term) < abs(s) * 1e-15: break
        return 1.0 - s * math.exp(-x + a * math.log(x) - gln)
    b = x + 1 - a; c = 1e300; d = 1 / b; h = d
    for i in range(1, 10000):
        an = -i * (i - a); b += 2
        d = an * d + b; d = 1e-300 if abs(d) < 1e-300 else d
        c = b + an / c; c = 1e-300 if abs(c) < 1e-300 else c
        d = 1 / d; de = d * c; h *= de
        if abs(de - 1) < 1e-15: break
    return math.exp(-x + a * math.log(x) - gln) * h


def chi2_sf(x, df):
    return gammq(df / 2, x / 2)


assert abs(chi2_sf(3.841, 1) - 0.05) < 1e-3 and abs(chi2_sf(100.749, 79) - 0.05) < 2e-3


def wilson(k, n, z=1.96):
    p = k / n; den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [round(c - h, 4), round(c + h, 4)]


def ranks(v):
    o = sorted(range(len(v)), key=lambda i: v[i]); r = [0.0] * len(v); i = 0
    while i < len(o):
        j = i
        while j + 1 < len(o) and v[o[j + 1]] == v[o[i]]: j += 1
        for t in range(i, j + 1): r[o[t]] = (i + j) / 2 + 1
        i = j + 1
    return r


def pearson(a, b):
    ma, mb = sum(a) / len(a), sum(b) / len(b)
    num = sum((x - ma) * (y - mb) for x, y in zip(a, b))
    return num / math.sqrt(sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))


# P12: dispersion
chi2 = sum((x["comm"] - x["new"] * P) ** 2 / (x["new"] * P * (1 - P)) for x in S)
df = len(S) - 1
phi = chi2 / df
p12 = chi2_sf(chi2, df)
# days outside the binomial 99.8 % funnel (|z| > 3.09)
out = [{"date": x["date"], "k": x["comm"], "n": x["new"],
        "z": round((x["comm"] - x["new"] * P) / math.sqrt(x["new"] * P * (1 - P)), 2)} for x in S]
outside = [o for o in out if abs(o["z"]) > 3.09]

# P13: trend, Spearman on date order
from datetime import date
day = [(date.fromisoformat(x["date"]) - date(2026, 7, 13)).days for x in S]
share = [x["comm"] / x["new"] for x in S]
rho = pearson(ranks(day), ranks(share))
# permutation p for rho (seeded)
rng = random.Random(55); r_day = ranks(day); r_sh = ranks(share); ge = 0; B = 20000
for _ in range(B):
    sh = r_sh[:]; rng.shuffle(sh)
    ge += abs(pearson(r_day, sh)) >= abs(rho) - 1e-12
p_rho = (ge + 1) / (B + 1)

# logistic slope on day number by Newton-Raphson, SE scaled by sqrt(phi) (quasi-binomial)
b0, b1 = math.log(P / (1 - P)), 0.0
xs = [(t - 55) / 30 for t in day]  # per 30 days, centred
for _ in range(50):
    g0 = g1 = h00 = h01 = h11 = 0.0
    for x, s in zip(xs, S):
        m = 1 / (1 + math.exp(-(b0 + b1 * x))); w = s["new"] * m * (1 - m); r = s["comm"] - s["new"] * m
        g0 += r; g1 += r * x; h00 += w; h01 += w * x; h11 += w * x * x
    det = h00 * h11 - h01 * h01
    b0 += (h11 * g0 - h01 * g1) / det; b1 += (h00 * g1 - h01 * g0) / det
se1 = math.sqrt(h00 / det)
or30 = math.exp(b1); or_lo = math.exp(b1 - 1.96 * se1 * math.sqrt(phi)); or_hi = math.exp(b1 + 1.96 * se1 * math.sqrt(phi))

# P14: halves
h1 = [x for x in S if x["date"] <= "2026-09-15"]; h2 = [x for x in S if x["date"] > "2026-09-15"]
k1, n1 = sum(x["comm"] for x in h1), sum(x["new"] for x in h1)
k2, n2 = sum(x["comm"] for x in h2), sum(x["new"] for x in h2)
diff = abs(k1 / n1 - k2 / n2)

# what the spread does to the pooled interval: quasi-binomial (phi-scaled) interval
se = math.sqrt(P * (1 - P) / N)
qb = [round(P - 1.96 * se * math.sqrt(phi), 4), round(P + 1.96 * se * math.sqrt(phi), 4)]

pred = {
    "P12": {"text": "day-to-day spread wider than counting noise: phi >= 1.5 and p < 0.01",
            "value": {"chi2": round(chi2, 1), "df": df, "phi": round(phi, 2), "p": float(f"{p12:.2e}")},
            "held": phi >= 1.5 and p12 < 0.01},
    "P13": {"text": "no trend: |Spearman rho(date, share)| < 0.20",
            "value": {"rho": round(rho, 3), "p_perm": round(p_rho, 4), "days": len(S)},
            "held": abs(rho) < 0.20},
    "P14": {"text": "the two halves' pooled shares differ by less than 5 points",
            "value": {"first": {"k": k1, "n": n1, "s": round(k1 / n1, 4), "w": wilson(k1, n1), "days": len(h1)},
                      "second": {"k": k2, "n": n2, "s": round(k2 / n2, 4), "w": wilson(k2, n2), "days": len(h2)},
                      "diff": round(diff, 4)},
            "held": diff < 0.05},
}
summary = {"pooled": {"k": K, "n": N, "s": round(P, 4), "wilson": wilson(K, N), "quasiBinomial": qb},
           "outsideFunnel": outside, "nOutside": len(outside),
           "logisticPer30Days": {"or": round(or30, 3), "ci_quasi": [round(or_lo, 3), round(or_hi, 3)]},
           "studioDays": [o for o in out if o["date"] in ("2026-07-30", "2026-08-31")]}
res = {"study": 55, "session": 253, "date": "2026-11-06", "predictions": pred, "summary": summary,
       "days": out, "params": {"funnelZ": 3.09, "permutations": B, "seed": 55}}
json.dump(res, open(os.path.join(HERE, "results55.json"), "w"), indent=1)
page = {"pred": {k: {"text": v["text"], "held": v["held"], "value": v["value"]} for k, v in pred.items()},
        "summary": summary, "days": out}
open(os.path.join(HERE, "data55.js"), "w").write("window.D55=" + json.dumps(page, separators=(",", ":")) + ";\n")
for k, v in pred.items():
    print(k, "HELD" if v["held"] else "FAILED", json.dumps(v["value"]))
print(json.dumps(summary, indent=1))
