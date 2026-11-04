"""Study 8 — how far the near-miss record of asteroids sees, by size.

Usage: python3 -I analyse.py <cad.json> <studio-data.json>
Writes data/passages.tsv (derived, public-domain JPL data) and data/results.json.
Method as fixed in PREREGISTRATION.md (committed fdbee76 before the data were fetched).
"""
import json, math, random, sys, hashlib, datetime as dt
from collections import defaultdict

AU = 149597870.7; LD = 384400.0; MU = 398600.4418
BMAX = 0.05 * AU / LD           # 19.45 LD
BHALF = BMAX / 2
SHELLS = [(0, 2), (2, 5), (5, 10), (10, BMAX)]
BINS = [(-99, 22, "H<22"), (22, 24, "22-24"), (24, 26, "24-26"), (26, 28, "26-28"), (28, 30, "28-30"), (30, 99, ">=30")]

def hbin(h):
    for lo, hi, name in BINS:
        if lo <= h < hi:
            return name

def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()

cad_path, studio_path = sys.argv[1], sys.argv[2]
cad = json.load(open(cad_path)); F = cad["fields"]
rows, no_h, dropped_b, no_vinf = [], 0, 0, 0
for r in cad["data"]:
    d = dict(zip(F, r))
    if d["h"] is None:
        no_h += 1; continue
    if d["v_inf"] is None:  # not fixed in the pre-registration; excluded and counted (see README)
        no_vinf += 1; continue
    rkm = float(d["dist"]) * AU; v = float(d["v_inf"])
    b = rkm * math.sqrt(1 + 2 * MU / (rkm * v * v)) / LD
    if b >= BMAX:
        dropped_b += 1; continue
    date = dt.datetime.strptime(d["cd"], "%Y-%b-%d %H:%M")
    rows.append(dict(des=d["des"], date=date, r_ld=rkm / LD, v_inf=v, h=float(d["h"]), b=b, bin=hbin(float(d["h"]))))

def window(a, b):
    return [r for r in rows if a <= r["date"].year <= b]

def conc(rs):
    n = len(rs)
    return (sum(1 for r in rs if r["b"] < BHALF) / n) if n else None

def boot(rs, f, n=2000, seed=193):
    rng = random.Random(seed); vals = []
    for _ in range(n):
        s = [rs[rng.randrange(len(rs))] for _ in rs]
        vals.append(f(s))
    vals.sort(); return [vals[int(0.025 * n)], vals[int(0.975 * n) - 1]]

def shells(rs):
    out = []
    for lo, hi in SHELLS:
        k = sum(1 for r in rs if lo <= r["b"] < hi)
        out.append(dict(lo=lo, hi=round(hi, 3), n=k, density=k / (hi * hi - lo * lo)))
    d0 = out[0]["density"]
    for s in out:
        s["relative"] = (s["density"] / d0) if d0 else None
    return out

def summarise(rs):
    res = {}
    for _, _, name in BINS:
        sub = [r for r in rs if r["bin"] == name]
        e = dict(n=len(sub), n_inside_1ld=sum(1 for r in sub if r["b"] < 1))
        if sub:
            e["C"] = conc(sub); e["C_ci95"] = boot(sub, conc)
            sh = shells(sub); e["shells"] = sh
            expected = sh[0]["density"] * BMAX * BMAX
            e["held_vs_inner_density"] = (len(sub) / expected) if expected else None
            e["held_ci95"] = boot(sub, lambda s: len(s) / (shells(s)[0]["density"] * BMAX * BMAX) if shells(s)[0]["density"] else float("inf"))
        res[name] = e
    return res

prim = window(2015, 2025); sec = window(1990, 2014)
R = dict(source=dict(cad=cad_path.split("/")[-1], cad_sha256=sha(cad_path), cad_count=cad["count"], signature=cad["signature"],
                     studio=studio_path.split("/")[-1], studio_sha256=sha(studio_path)),
         excluded=dict(no_h=no_h, no_v_inf=no_vinf, b_at_or_beyond_0p05au=dropped_b), b_max_ld=BMAX,
         primary_2015_2025=dict(n=len(prim), by_bin=summarise(prim)),
         secondary_1990_2014=dict(n=len(sec), by_bin=summarise(sec)))

# Late share, built on the Studio's data: past passages inside 1 LD since 1990.
st = json.load(open(studio_path)); SF = st["fields"]
idx = defaultdict(list)
for r in rows:
    idx[r["des"]].append(r)
late = defaultdict(lambda: dict(n=0, after=0, day=0, before=0)); matched = 0; considered = 0; h_mismatch = 0
for x in st["rows"]:
    d = dict(zip(SF, x))
    t = dt.datetime.strptime(d["utc"], "%Y-%m-%dT%H:%M")
    if not (1990 <= t.year <= 2025) or d["class"] not in ("after", "day", "before"):
        continue
    considered += 1
    m = [r for r in idx.get(d["des"], []) if abs((r["date"] - t).total_seconds()) <= 86400]
    if m:
        matched += 1
        if abs(m[0]["h"] - float(d["H"])) > 0.01: h_mismatch += 1
    name = hbin(float(d["H"]))
    late[name]["n"] += 1; late[name][d["class"]] += 1
for name, e in late.items():
    e["late_share"] = e["after"] / e["n"]
R["late_share_studio_1ld_1990_2025"] = dict(considered=considered, matched_to_service=matched, h_mismatch=h_mismatch,
                                           by_bin={n: late[n] for _, _, n in BINS if n in late})

# Exploratory: C by year for 24-26; H distribution in 1 LD vs 19.45 LD (primary).
R["exploratory"] = dict(
    C_by_year_24_26={y: dict(n=len(s), C=conc(s)) for y in range(2005, 2026) for s in [[r for r in window(y, y) if r["bin"] == "24-26"]]},
    share_by_bin_inside_1ld={n: sum(1 for r in prim if r["bin"] == n and r["b"] < 1) / max(1, sum(1 for r in prim if r["b"] < 1)) for _, _, n in BINS},
    share_by_bin_inside_bmax={n: sum(1 for r in prim if r["bin"] == n) / len(prim) for _, _, n in BINS})

# Post hoc (not declared): passages of objects whose provisional designation year is later than the
# passage's year were computed backwards from a later discovery, not seen at the time.
import re
def later(r):
    m = re.match(r"^(\d{4}) [A-Z]", r["des"])
    return None if not m else int(m.group(1)) > r["date"].year
ph = {}
for wname, ws in (("2015_2025", prim), ("1990_2014", sec)):
    e = {}
    for _, _, n in BINS:
        sub = [r for r in ws if r["bin"] == n and later(r) is not None]
        lt = [r for r in sub if later(r)]; nt = [r for r in sub if not later(r)]
        e[n] = dict(n_provisional=len(sub), computed_later=len(lt), share_later=(len(lt) / len(sub)) if sub else None,
                    C_seen_by_then=conc(nt), C_computed_later=conc(lt))
    ph[wname] = e
R["post_hoc_computed_backwards"] = ph

# Predictions.
pb = R["primary_2015_2025"]["by_bin"]; names = [n for _, _, n in BINS]
def verdict(ok, margin):
    return "undecided" if margin < 0.02 else ("held" if ok else "failed")
C = {n: pb[n].get("C") for n in names}
p1 = C["H<22"]; p2 = C["28-30"]
cs = [C[n] for n in names]
mono = all(cs[i] < cs[i + 1] for i in range(len(cs) - 1))
lb = R["late_share_studio_1ld_1990_2025"]["by_bin"]
ls = [lb[n]["late_share"] for n in names if n in lb and lb[n]["n"] >= 20]
mono4 = all(ls[i] < ls[i + 1] for i in range(len(ls) - 1))
p5 = pb["26-28"]["held_vs_inner_density"]
R["predictions"] = {
    "P1": dict(value=p1, bar="0.20<=C<=0.30", verdict=verdict(0.20 <= p1 <= 0.30, min(abs(p1 - 0.20), abs(p1 - 0.30)))),
    "P2": dict(value=p2, bar="C>0.60", verdict=verdict(p2 > 0.60, abs(p2 - 0.60))),
    "P3": dict(value=cs, bar="strictly rising over six bins", verdict="held" if mono else "failed"),
    "P4": dict(value=ls, bar="strictly rising over bins with n>=20", verdict="held" if mono4 else "failed"),
    "P5": dict(value=p5, bar="<1/3", verdict=verdict(p5 < 1 / 3, abs(p5 - 1 / 3))),
}

with open("data/passages.tsv", "w") as f:
    f.write("des\tdate_tdb\tr_ld\tv_inf_kms\tH\tb_ld\n")
    for r in rows:
        f.write(f"{r['des']}\t{r['date']:%Y-%m-%d %H:%M}\t{r['r_ld']:.4f}\t{r['v_inf']:.3f}\t{r['h']}\t{r['b']:.4f}\n")
json.dump(R, open("data/results.json", "w"), indent=1)
print(json.dumps(R["predictions"], indent=1))
