"""Study 63: two windows. The Atelier's The Edge reads a quiet that reached day T against a break by day
T + 90; the Field's quiet curve (study 53) against a break by day d + 42. Is the gap between their
figures (Kivu, day 63: 38 in 100 against 30) the window after the day, or windows not yet closed?
(The Atelier's question, ho-2026-11-06-atelier-3.)

Usage: python3 -I analyse63.py <kivu ebola-epidemic-health-zone-figures.csv> <current 2026 drc_ebola_cases_consolidated.csv>
Predictions: PREDICTIONS63.md (committed first, 13af3fa). Writes results63.json and data63.js.

Study 53 is re-run exactly as study 56 re-runs it (the current 2026 file cut at 29 Oct 2026, every field of
results53.json reproduced or the script stops); its quiets are then read under two windows.
"""
import collections, contextlib, csv, hashlib, io, json, os, random, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
A53 = os.path.join(HERE, "..", "..", "cycle-012", "the-quiet-curve")
kivu_path, cur_path = sys.argv[1:3]
CUT = "2026-10-29"
B, SEED = 2000, 63
DMAX = 150

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
src = open(os.path.join(A53, "analyse53.py")).read()
line = 'assert hashlib.sha256(open(hdx26_path, "rb").read()).hexdigest() == HDX26_SHA'
assert src.count(line) == 1
src = src.replace(line, "pass  # replaced: reproduction of results53.json is checked instead")
ns = {"__file__": os.path.join(tmp, "analyse53.py"), "__name__": "a53"}
argv, sys.argv = sys.argv, ["analyse53.py", kivu_path, cut_path]
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(src, "analyse53.py", "exec"), ns)
sys.argv = argv
mine = json.load(open(os.path.join(tmp, "results53.json")))
ref = json.load(open(os.path.join(A53, "results53.json")))
for k in ref:
    if k not in ("session", "date"):
        assert mine[k] == ref[k], "study 53 not reproduced: " + k
kv, bd = ns["kv"], ns["bd"]


def rows_at(o, d, H):
    """quiets that reached d: (zone, closed, broke_by_d+H). closed = window d+H ends inside the record."""
    N = len(o["cal"]); out = []
    for q in o["quiets"]:
        if q["b"] is not None and q["L"] <= d:
            continue                                   # did not reach d
        if q["a"] + d > N - 1:
            continue                                   # the record ends before day d (fixed after run 1)
        closed = q["a"] + d + H <= N - 1
        y = q["b"] is not None and q["L"] <= d + H and q["b"] <= N - 1
        out.append((q["z"], closed, y))
    return out


def curve(o, H, rule):
    by = {}
    for d in range(1, DMAX + 1):
        r = rows_at(o, d, H)
        if rule == "out":
            r = [x for x in r if x[1]]
        by[d] = r
    zones = sorted({z for d in by for z, _, _ in by[d]})
    rng = random.Random(SEED); draws = [[rng.choice(zones) for _ in zones] for _ in range(B)]
    out = []
    for d in range(1, DMAX + 1):
        r = by[d]; n = len(r); k = sum(y for _, _, y in r)
        if not n:
            out.append({"d": d, "n": 0, "k": 0}); continue
        bz = collections.defaultdict(lambda: [0, 0])
        for z, _, y in r:
            bz[z][0] += y; bz[z][1] += 1
        bs = []
        for dr in draws:
            kk = sum(bz[z][0] for z in dr if z in bz); nn = sum(bz[z][1] for z in dr if z in bz)
            if nn:
                bs.append(kk / nn)
        bs.sort()
        out.append({"d": d, "n": n, "k": k, "s": round(k / n, 4),
                    "lo": round(bs[int(0.025 * len(bs))], 4), "hi": round(bs[min(len(bs) - 1, int(0.975 * len(bs)))], 4)})
    return out


C = {}
for lab, o in (("kivu", kv), ("2026", bd)):
    for H in (42, 90):
        for rule in ("out", "carried"):
            C[f"{lab}|{H}|{rule}"] = curve(o, H, rule)
# the H = 42 left-out curve must be study 53's own
for d in range(1, 121):
    a = C["kivu|42|out"][d - 1]; b = next(x for x in ref["curves"]["kivu|42|all"] if x["d"] == d)
    assert (a["n"], a["k"]) == (b["n"], b["k"]), d


def at(key, d):
    return C[key][d - 1]


def first_below(key, lim=0.10, start=42):
    return next((x["d"] for x in C[key][start - 1:] if x["n"] and x["s"] < lim), None)


k42, k63, k60 = at("kivu|90|out", 42), at("kivu|90|out", 63), at("kivu|90|out", 60)
s53_60 = at("kivu|42|out", 60)
c60 = at("kivu|90|carried", 60)
pred = {
    "P44": {"text": "Kivu H90 left out: day 42 = 28 of 60; day 63 within one quiet of 0.388",
            "value": {"d42": [k42["k"], k42["n"]], "d63": [k63["k"], k63["n"]]},
            "held": (k42["k"], k42["n"]) == (28, 60) and abs(k63["k"] - 0.388 * k63["n"]) <= 1},
    "P45": {"text": "Kivu H90 left out day 60: >= 3 more breaks than 18 of 53 on n <= 53, share in [0.36, 0.48]",
            "value": {"H90": [k60["k"], k60["n"], k60["s"]], "H42": [s53_60["k"], s53_60["n"]]},
            "held": k60["k"] >= s53_60["k"] + 3 and k60["n"] <= s53_60["n"] and 0.36 <= k60["s"] <= 0.48},
    "P46": {"text": "Kivu H90 day 60: carried and left out within 2 points",
            "value": {"out": k60["s"], "carried": c60["s"], "n": [k60["n"], c60["n"]]},
            "held": abs(k60["s"] - c60["s"]) <= 0.02},
    "P47": {"text": "Kivu H90 left out: first day from 42 below 10 % in [100, 125]",
            "value": first_below("kivu|90|out"), "held": (first_below("kivu|90|out") or 0) in range(100, 126)},
    "P48": {"text": "Congo 2026 H90 left out: fewer than 10 quiets at day 60",
            "value": at("2026|90|out", 60)["n"], "held": at("2026|90|out", 60)["n"] < 10},
}
summary = {
    "firstBelow10": {k: first_below(k) for k in C},
    "kivuD42": {k: at(k, 42) for k in C if k.startswith("kivu")},
    "kivuD60": {k: at(k, 60) for k in C if k.startswith("kivu")},
    "kivuD63": {k: at(k, 63) for k in C if k.startswith("kivu")},
    "y2026D60": {k: at(k, 60) for k in C if k.startswith("2026")},
    "lastDay": {"kivu": kv["cal"][-1], "2026": bd["cal"][-1]},
}
# run 1 (before the fix above) counted held quiets at days past the record's end under "carried";
# its scored values are kept here as they came out: P46 out 0.4118, carried 0.4074 on 54 (held).
RUN1 = {"P44": {"d42": [27, 59], "d63": [18, 48], "held": False},
        "P46": {"out": 0.4118, "carried": 0.4074, "n": [51, 54], "held": True},
        "kivu42carried": [17, 61], "kivu90carried42": [28, 61]}
out = {"study": 63, "run1": RUN1, "session": 261, "date": "2026-11-07", "predictions": pred, "summary": summary,
       "sources": {"kivu_sha256": ref["sources"]["kivu_sha256"], "hdx2026_current_sha256": cur_sha,
                   "hdx2026_cut": CUT, "results53_reproduced": True},
       "params": {"windows": [42, 90], "bootstrap": B, "seed": SEED, "dmax": DMAX}}
json.dump(out, open(os.path.join(HERE, "results63.json"), "w"), indent=1)
with open(os.path.join(HERE, "data63.js"), "w") as f:
    f.write("// written by analyse63.py; do not edit\nwindow.DATA63 = " + json.dumps({"curves": C, "summary": summary}, separators=(",", ":"))
            + ";\nwindow.PRED63 = " + json.dumps(pred, separators=(",", ":")) + ";\n")
for p, v in pred.items():
    print(p, "held" if v["held"] else "FAILED", v["value"])
print(json.dumps(summary, indent=0)[:3000])
