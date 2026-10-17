"""The Narrowest Class — build. Reads the Field's study 21 at a pinned commit, one warning per
mainshock, and judges each warning in every reference class it belongs to.
Usage: python3 -I build.py <path to field-research checkout at 94b13b2>"""
import hashlib, itertools, json, math, random, sys, time
from pathlib import Path

SRC = Path(sys.argv[1]) / "artifacts/2026-10-17-the-odds-written-down/data"
PIN = "94b13b210b3602dea157f3073206b280ded7e0bb"
HERE = Path(__file__).parent

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
EXPECT = {"forecasts.jsonl": "82c8d09019cd9cfec2696e7fdc17231020d502baba67cf3e208425b733e861e5",
          "cells.tsv": "3977693f0a627853cf6ff2f7a77cc9057766138329e75b14c9acd3d0f7b48a9e"}
for n, h in EXPECT.items():
    assert sha(SRC / n) == h, f"{n} is not the file of commit {PIN}"

F = [json.loads(l) for l in open(SRC / "forecasts.jsonl")]
cells = {}
for line in list(open(SRC / "cells.tsv"))[1:]:
    r = line.rstrip("\n").split("\t")
    if r[1] == "1 Week":
        cells.setdefault(r[0], []).append((float(r[2]), float(r[3]), float(r[4]), int(r[8])))

def region(f):
    pl, lon, lat = f["place"], f["lon"], f["lat"]
    if lon > 100 or "Mariana" in pl or "Guam" in pl or "Micronesia" in pl: return "Marianas & Guam"
    if "Alaska" in pl or "Hubbard" in pl or (lat > 54 and lon < -125): return "Alaska"
    if "CA" in pl.split(", ")[-1] or "California" in pl or "Ridgecrest" in pl or (pl.endswith("MX") and lon < -114): return "California"
    if "Oregon" in pl or "Washington" in pl: return "Pacific Northwest"
    if -125 < lon < -66 and 24 < lat < 50: return "Rest of contiguous US"
    return "Elsewhere"

def band(p): return "stated < 20 %" if p < .2 else ("stated 20–50 %" if p < .5 else "stated ≥ 50 %")

W = []
for f in F:
    cs = [c for c in cells.get(f["id"], []) if c[0] >= c[1] - 1e-9]
    if not cs: continue
    M, Mcat, p, hit = min(cs)          # lowest whole magnitude at or above the floor: the likeliest warning
    y = time.gmtime(f["time"] / 1000).tm_year
    delay = (f["issued"] - f["time"]) / 60000
    m = f["mag"]
    W.append({"id": f["id"], "place": f["place"], "lat": f["lat"], "lon": f["lon"], "mag": m, "M": M,
              "p": p, "hit": hit, "attrs": {
                  "region": region(f),
                  "size": "mainshock < M5" if m < 5 else ("M5–6" if m < 6 else "M6 and over"),
                  "model": "generic" if "Generic" in f["model"] else "fitted to the sequence",
                  "year": "before 2025" if y < 2025 else str(y),
                  "odds": band(p),
                  "delay": "issued ≤ 20 min" if delay <= 20.5 else "issued later"}})
KEYS = ["region", "size", "model", "year", "odds", "delay"]

rng = random.Random(20261017)
def verdict(idx):
    ps = [W[i]["p"] for i in idx]; obs = sum(W[i]["hit"] for i in idx); exp = sum(ps)
    lo = hi = 0; R = 4000
    for _ in range(R):
        k = sum(rng.random() < p for p in ps)
        lo += k <= obs; hi += k >= obs
    pv = min(1, 2 * min(lo, hi) / R)
    v = "consistent" if pv >= .05 else ("too high" if obs < exp else "too low")
    # could this class have told? the share of worlds with every stated chance halved in which the
    # same two-sided 5 % test would have said "too high" (its power against a factor of two)
    null = sorted(sum(rng.random() < p for p in ps) for _ in range(R))
    cut = next((k for k in range(obs + len(ps) + 1) if sum(x <= k for x in null) / R * 2 >= .05), 0) - 1
    half = sum(sum(rng.random() < p / 2 for p in ps) <= cut for _ in range(R)) / R
    return obs, exp, pv, v, half

classes = {}
for depth in (0, 1, 2, 3):
    for ks in itertools.combinations(KEYS, depth):
        groups = {}
        for i, w in enumerate(W):
            groups.setdefault(tuple(w["attrs"][k] for k in ks), []).append(i)
        for vals, idx in groups.items():
            if len(idx) >= 5:
                classes[tuple(zip(ks, vals))] = idx
out = []
for key, idx in classes.items():
    obs, exp, pv, v, half = verdict(idx)
    out.append({"def": [list(kv) for kv in key], "n": len(idx), "members": idx,
                "came": obs, "stated": round(exp, 2), "pv": round(pv, 4), "verdict": v, "power": round(half, 3)})
out.sort(key=lambda c: (len(c["def"]), [kv[1] for kv in c["def"]]))

def analyse(N):
    keep = [c for c in out if c["n"] >= N]
    per = [[] for _ in W]
    for j, c in enumerate(keep):
        for i in c["members"]: per[i].append(j)
    split = 0; narrow_split = 0; multi_narrow = 0; all_verdicts = {}; strong_split = 0; narrow_strong = 0
    for i, js in enumerate(per):
        vs = {keep[j]["verdict"] for j in js}
        split += len(vs) > 1
        strong_split += "too high" in vs and any(keep[j]["verdict"] == "consistent" and keep[j]["power"] >= .8 for j in js)
        defs = [set(map(tuple, keep[j]["def"])) for j in js]
        nar = [j for a, j in zip(defs, js) if not any(a < b for b in defs)]
        multi_narrow += len(nar) > 1
        narrow_split += len({keep[j]["verdict"] for j in nar}) > 1
        nst = {keep[j]["verdict"] for j in nar if keep[j]["power"] >= .8}
        narrow_strong += nst == {"too high", "consistent"}
        all_verdicts[tuple(sorted(vs))] = all_verdicts.get(tuple(sorted(vs)), 0) + 1
    return {"N": N, "classes": len(keep), "split": split, "multi_narrow": multi_narrow,
            "narrow_split": narrow_split, "strong_split": strong_split, "narrow_strong": narrow_strong, "verdict_sets": {" / ".join(k): v for k, v in all_verdicts.items()}}

res = {"warnings": len(W), "came": sum(w["hit"] for w in W), "stated": round(sum(w["p"] for w in W), 2),
       "by_N": {N: analyse(N) for N in (5, 10, 20, 30, 50, 100)}}
allc = next(c for c in out if not c["def"]); cal = next(c for c in out if c["def"] == [["region", "California"]])
res["all"] = {k: allc[k] for k in ("n", "came", "stated", "pv", "verdict", "power")}
res["california"] = {k: cal[k] for k in ("n", "came", "stated", "pv", "verdict", "power")}
res["told_consistent"] = [{"def": c["def"], "n": c["n"], "came": c["came"], "stated": c["stated"], "power": c["power"]}
                          for c in out if c["verdict"] == "consistent" and c["power"] >= .8 and c["n"] >= 20]
res["too_low"] = sum(c["verdict"] == "too low" for c in out)
srcs = {"pin": PIN, "files": {n: sha(SRC / n) for n in ("forecasts.jsonl", "cells.tsv")}}
(HERE / "results.json").write_text(json.dumps(res, indent=1, ensure_ascii=False))
(HERE / "data.js").write_text("const W=" + json.dumps([{k: w[k] for k in ("id","place","lat","lon","mag","M","p","hit")} | {"a": [w["attrs"][k] for k in KEYS]} for w in W], ensure_ascii=False, separators=(",", ":"))
    + ";\nconst KEYS=" + json.dumps(KEYS) + ";\nconst C=" + json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    + ";\nconst R=" + json.dumps(res, ensure_ascii=False, separators=(",", ":")) + ";\nconst SRC=" + json.dumps(srcs) + ";\n")
print(json.dumps(res, indent=1, ensure_ascii=False))
