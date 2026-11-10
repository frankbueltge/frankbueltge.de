"""Study 56: who the quiet curve speaks for. At day d the curve counts a quiet only if it reached d and
its 42-day window ends inside the record. Does the population at day 60 differ from the one at day 42
in when the quiets began, and does that alone move the curve? (The Atelier's question, 2026-11-06.)

Usage: python3 -I analyse56.py <kivu ebola-epidemic-health-zone-figures.csv> <current 2026 drc_ebola_cases_consolidated.csv>
Predictions: PREDICTIONS56.md (committed first). Writes results56.json and data56.js beside this script.

Study 53's code is executed unchanged except for one line: its sha256 check of the 2026 file, which HDX
has since grown. Instead this script cuts the current file at study 53's last day (29 Oct 2026) and
re-runs all of study 53 in a scratch directory; the run must reproduce every field of the committed
results53.json, or this script stops.
"""
import collections, csv, hashlib, json, os, random, statistics, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
A53 = os.path.join(HERE, "..", "..", "cycle-012", "the-quiet-curve")
kivu_path, cur_path = sys.argv[1:3]
CUT = "2026-10-29"
H = 42
B, SEED = 2000, 56

# 1. cut the current 2026 file at study 53's last day
cur_sha = hashlib.sha256(open(cur_path, "rb").read()).hexdigest()
rows = list(csv.DictReader(open(cur_path, encoding="utf-8-sig")))
tmp = tempfile.mkdtemp()
cut_path = os.path.join(tmp, "hdx26_cut.csv")
with open(cut_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    for r in rows:
        if r["reference_date"] <= CUT:
            w.writerow(r)
cur_last = max(r["reference_date"] for r in rows)

# 2. re-run all of study 53 on the cut, in the scratch directory, and demand an exact reproduction
src = open(os.path.join(A53, "analyse53.py")).read()
line = 'assert hashlib.sha256(open(hdx26_path, "rb").read()).hexdigest() == HDX26_SHA'
assert src.count(line) == 1
src = src.replace(line, "pass  # replaced by study 56: reproduction of results53.json is checked instead")
ns = {"__file__": os.path.join(tmp, "analyse53.py"), "__name__": "a53"}
argv = sys.argv
sys.argv = ["analyse53.py", kivu_path, cut_path]
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(src, "analyse53.py", "exec"), ns)
sys.argv = argv
mine = json.load(open(os.path.join(tmp, "results53.json")))
ref = json.load(open(os.path.join(A53, "results53.json")))
for k in ref:
    if k not in ("session", "date"):
        assert mine[k] == ref[k], "study 53 not reproduced: " + k
kv, bd = ns["kv"], ns["bd"]


# 3. the populations
def population(o, d):
    """quiets with an observation at d, horizon 42: [(qi, broke_within_42)]"""
    return [(qi, y) for qi, dd, y, nb in o["obs"][H] if dd == d]


def start_date(o, a):
    return o["cal"][a]


def summarise(o):
    N = len(o["cal"])
    qs = o["quiets"]
    cutoff60 = N - 1 - (60 + H)        # latest start admissible at d = 60
    p42, p60 = population(o, 42), population(o, 60)
    s42 = [qs[qi]["a"] for qi, _ in p42]
    s60 = [qs[qi]["a"] for qi, _ in p60]
    band = [(qi, y) for qi, y in p42 if qs[qi]["a"] > cutoff60]
    matched = [(qi, y) for qi, y in p42 if qs[qi]["a"] <= cutoff60]
    # of the matched set, how many also reach 60 (survival, not the edge)
    reach60 = {qi for qi, _ in p60}

    def sh(pop):
        return sum(y for _, y in pop) / len(pop) if pop else None

    gap = sh(p42) - sh(matched)
    # bootstrap over zones
    rng = random.Random(SEED)
    zones = sorted({qs[qi]["z"] for qi, _ in p42})
    byz = collections.defaultdict(list)
    for qi, y in p42:
        byz[qs[qi]["z"]].append((qs[qi]["a"] <= cutoff60, y))
    gaps = []
    for _ in range(B):
        draw = [rng.choice(zones) for _ in zones]
        allk = alln = mk = mn = 0
        for z in draw:
            for m, y in byz[z]:
                alln += 1; allk += y
                if m:
                    mn += 1; mk += y
        if alln and mn:
            gaps.append(allk / alln - mk / mn)
    gaps.sort()
    lo, hi = gaps[int(0.025 * len(gaps))], gaps[int(0.975 * len(gaps)) - 1]
    # descriptive: median start and n for every d; and the curve on the cohort admissible at 60
    per_d = []
    for d in range(1, 121):
        p = population(o, d)
        if not p:
            break
        c = [(qi, y) for qi, y in p if qs[qi]["a"] <= cutoff60]
        per_d.append({"d": d, "n": len(p), "k": sum(y for _, y in p),
                      "med": statistics.median(qs[qi]["a"] for qi, _ in p),
                      "latest": N - 1 - d - H,
                      "cn": len(c), "ck": sum(y for _, y in c)})
    return {
        "label": o["label"], "N": N, "first": o["cal"][0], "last": o["cal"][-1],
        "cutoff60": cutoff60, "cutoff60Date": o["cal"][cutoff60], "cutoff42Date": o["cal"][N - 1 - 42 - H],
        "p42": {"n": len(p42), "k": sum(y for _, y in p42), "medStart": statistics.median(s42),
                "medStartDate": start_date(o, int(statistics.median(s42)))},
        "p60": {"n": len(p60), "k": sum(y for _, y in p60), "medStart": statistics.median(s60) if s60 else None,
                "medStartDate": start_date(o, int(statistics.median(s60))) if s60 else None},
        "band": {"n": len(band), "k": sum(y for _, y in band), "share": len(band) / len(p42)},
        "matched": {"n": len(matched), "k": sum(y for _, y in matched),
                    "reach60": sum(1 for qi, _ in matched if qi in reach60)},
        "share42": sh(p42), "share42matched": sh(matched), "shareBand": sh(band),
        "gap": gap, "gapCI": [lo, hi], "bootDraws": len(gaps),
        "perD": per_d,
        "quiets": [{"z": q["z"], "a": q["a"], "L": q["L"]} for q in qs],
    }


R = {"Kivu 2018-2020": summarise(kv), "Congo 2026": summarise(bd)}
k, c = R["Kivu 2018-2020"], R["Congo 2026"]
pred = {
    "P15": {"text": "median start at 60 earlier than at 42, both records",
            "value": {lab: [r["p42"]["medStartDate"], r["p60"]["medStartDate"]] for lab, r in R.items()},
            "held": all(r["p60"]["medStart"] is not None and r["p60"]["medStart"] < r["p42"]["medStart"] for r in R.values())},
    "P16": {"text": "edge band >= 20 % of the population at 42 in 2026, <= 10 % in Kivu",
            "value": {"2026": c["band"]["share"], "Kivu": k["band"]["share"]},
            "held": c["band"]["share"] >= 0.20 and k["band"]["share"] <= 0.10},
    "P17": {"text": "Kivu composition gap interval contains 0",
            "value": {"gap": k["gap"], "ci": k["gapCI"]}, "held": k["gapCI"][0] <= 0 <= k["gapCI"][1]},
    "P18": {"text": "2026 composition gap negative",
            "value": {"gap": c["gap"], "ci": c["gapCI"]}, "held": c["gap"] < 0},
}
out = {"study": 56, "session": 254, "date": "2026-11-06", "predictions": pred,
       "sources": {"kivu_sha256": ref["sources"]["kivu_sha256"], "hdx2026_current_sha256": cur_sha,
                   "hdx2026_current_last": cur_last, "hdx2026_cut": CUT,
                   "results53_reproduced": True},
       "params": {"horizon": H, "bootstrap": B, "seed": SEED},
       "records": {lab: {kk: vv for kk, vv in r.items() if kk not in ("perD", "quiets")} for lab, r in R.items()}}
json.dump(out, open(os.path.join(HERE, "results56.json"), "w"), indent=1)
with open(os.path.join(HERE, "data56.js"), "w") as f:
    f.write("// written by analyse56.py; do not edit\nwindow.DATA56 = " + json.dumps(R, separators=(",", ":")) + ";\nwindow.PRED56 = " + json.dumps(pred, separators=(",", ":")) + ";\n")
for p, v in pred.items():
    print(p, "held" if v["held"] else "FAILED", v["value"])
for lab, r in R.items():
    print(lab, "p42", r["p42"], "p60", r["p60"], "band", r["band"], "matched", r["matched"],
          "share42 %.3f matched %.3f band %s" % (r["share42"], r["share42matched"], r["shareBand"]))
