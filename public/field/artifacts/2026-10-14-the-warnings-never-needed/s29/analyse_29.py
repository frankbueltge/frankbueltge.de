"""Study 29: behind the alert, or beside it? (PREREGISTRATION-29.md).

For each of study 27's 155 earthquake messages: the strict window [t - 10 min, t + L] and 364 placebo
windows moved back k = 1..364 days. For an event e (M >= 1.0, R <= 300 km from the nearest alert point)
its dominance count c(e) is the number of the other 364 windows holding an event with M' >= M and
R' <= R; p(e) = c(e) / 364. A window's statistic S is the least c over its events (364 if none);
p_adj = (1 + #placebos with S <= S_live) / 365. Behind: p_adj <= 0.05.
Domain rates for the Atelier's grid: floors 1.0-4.5, radii 25-300 km, strict and day windows; the
k = 364 placebo share and the mean over all 364 placebos; quiet = share <= 5 %.

Usage: python3 -I analyse_29.py GAZETTEER_TXT CACHE_DIR [ATELIER_PLATE11_JSON]
"""
import json, sys, csv, gzip, math, bisect, random
from pathlib import Path

HERE = Path(__file__).parent
GAZ = {}
for r in csv.DictReader(open(sys.argv[1], encoding="utf-8"), delimiter="\t"):
    r = {k.strip(): v.strip() for k, v in r.items()}
    GAZ[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))
CACHE = Path(sys.argv[2])
PIECES = json.loads((HERE / "data" / "pieces_29.json").read_text())

def points(counties):  # study 27's rule
    out = []
    for g in counties.split(","):
        out += [GAZ[g]] if g in GAZ else ([v for k, v in GAZ.items() if k[:2] == g[:2]] if g.endswith("000") else [])
    return out

def km(a, b):  # study 27's distance
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    return 6371.0 * math.acos(min(1, math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl)))

REGION = {"06": "west", "32": "west", "49": "west", "36": "northeast", "34": "northeast", "48": "texas"}
CAT = {}
seen = set()
for p in PIECES["pieces"]:
    for r in csv.DictReader(open(CACHE / p["file"], encoding="utf-8")):
        if r["mag"] == "" or r["id"] in seen: continue
        seen.add(r["id"])
        t = __import__("datetime").datetime.fromisoformat(r["time"].replace("Z", "+00:00")).timestamp() / 60
        CAT.setdefault(p["region"], []).append((t, float(r["mag"]), float(r["latitude"]), float(r["longitude"]), r["id"]))
for v in CAT.values(): v.sort()
TIMES = {k: [e[0] for e in v] for k, v in CAT.items()}

J = [r for r in csv.DictReader(gzip.open(HERE.parent / "s27" / "data" / "joined_27.tsv.gz", "rt"), delimiter="\t") if r["kind"] == "earthquake"]
W = {w["i"]: w for w in csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t")}
assert len(J) == 155
K = 364
FLOORS, RADII = (1.0, 2.0, 3.0, 4.0, 4.5), (25, 50, 100, 200, 300)

def events_in(reg, pts, lo, hi):
    T, C = TIMES[reg], CAT[reg]
    out = []
    for e in C[bisect.bisect_left(T, lo):bisect.bisect_right(T, hi)]:
        d = min(km((e[2], e[3]), q) for q in pts)
        if d <= 300: out.append((e[1], d, e[0], e[4]))
    return out

alerts, dom = [], {}
for r in J:
    w = W[r["i"]]; pts = points(w["counties"]); reg = REGION[w["counties"][:2]]
    t, L = int(r["t"]), int(r["L"])
    strict = [events_in(reg, pts, t - 10 - k * 1440, t + L - k * 1440) for k in range(K + 1)]
    # day windows: one pass over the year, then sliced
    year = events_in(reg, pts, t - 1440 - K * 1440, t + L + 1440)
    yt = sorted(year, key=lambda e: e[2]); ytt = [e[2] for e in yt]
    day = [yt[bisect.bisect_left(ytt, t - 1440 - k * 1440):bisect.bisect_right(ytt, t + L + 1440 - k * 1440)] for k in range(K + 1)]
    # dominance: only a window's frontier (events no other event of the same window dominates) can
    # dominate or realise its minimum, since whatever dominates a dominator dominates what it dominates
    def frontier(ev):
        f = []
        for e in sorted(ev, key=lambda e: (-e[0], e[1])):
            if not f or e[1] < f[-1][1]: f.append(e)
        return f
    F = [frontier(ev) for ev in strict]
    flat = [(e[0], e[1], k) for k, f in enumerate(F) for e in f]
    def c_of(m, d, k):
        return len({kk for (mm, dd, kk) in flat if kk != k and mm >= m and dd <= d})
    S, best = [], None
    for k, f in enumerate(F):
        sk, bk = K, None
        for e in f:
            c = c_of(e[0], e[1], k)
            if bk is None or c < sk or (c == sk and e[0] > bk[0]): sk, bk = c, e
        S.append(sk)
        if k == 0: best = bk
    p_adj = (1 + sum(1 for s in S[1:] if s <= S[0])) / (K + 1)
    nearest = min(strict[0], key=lambda e: e[1]) if strict[0] else None
    largest = max(strict[0], key=lambda e: e[0]) if strict[0] else None
    a = {"i": int(r["i"]), "code": w["code"], "t": t, "L": L, "n_points": len(pts), "live_27": int(r["live"]), "strict_27": int(r["live_strict"]),
         "events_live": len(strict[0]), "S": S[0], "p_best": S[0] / K, "p_adj": p_adj, "behind": p_adj <= 0.05,
         "placebo_with_event": sum(1 for ev in strict[1:] if ev) / K}
    if best: a["best"] = {"id": best[3], "mag": best[0], "km": round(best[1], 1), "lag_min": round(t - best[2], 1)}
    if largest: a["largest"] = {"id": largest[3], "mag": largest[0], "km": round(largest[1], 1), "lag_min": round(t - largest[2], 1)}
    a["m5"] = any(e[0] >= 5.0 for e in strict[0])
    # the frontier of each window, for the page
    a["frontiers"] = [[[round(e[0], 2), round(e[1], 1)] for e in f] for f in F]
    a["live_events"] = [[round(e[0], 2), round(e[1], 1), round(t - e[2], 1), e[3]] for e in strict[0]]
    alerts.append(a)
    for wn, wins in (("strict", strict), ("day", day)):
        for fl in FLOORS:
            for rad in RADII:
                hit = [any(m >= fl and d <= rad for (m, d, _, _) in ev) for ev in wins]
                g = dom.setdefault(f"{fl}|{rad}|{wn}", {"live": 0, "k364": 0, "sum": 0})
                g["live"] += hit[0]; g["k364"] += hit[K]; g["sum"] += sum(hit[1:])

n = len(alerts)
for g in dom.values():
    g["live_share"] = g["live"] / n; g["k364_share"] = g["k364"] / n; g["mean_share"] = g.pop("sum") / (n * K)
    g["quiet_k364"] = g["k364_share"] <= 0.05; g["quiet_mean"] = g["mean_share"] <= 0.05
by = {a["i"]: a for a in alerts}
three = [1893, 10607, 10608]
s27_strict = [a for a in alerts if a["strict_27"]]
m5 = [a for a in alerts if a["m5"]]
agree = sum(1 for g in dom.values() if g["quiet_k364"] == g["quiet_mean"])
res = {"n": n, "K": K, "catalogue_rows": PIECES["rows"], "events_used": sum(len(v) for v in CAT.values()),
       "behind": sum(a["behind"] for a in alerts), "beside": sum(not a["behind"] for a in alerts),
       "three": {str(i): {k: by[i].get(k) for k in ("p_best", "p_adj", "behind", "best", "events_live", "placebo_with_event")} for i in three},
       "strict_27": {"n": len(s27_strict), "behind": sum(a["behind"] for a in s27_strict)},
       "m5": {"n": len(m5), "p_adj_le_001": sum(a["p_adj"] <= 0.01 for a in m5), "ids": [a["i"] for a in m5]},
       "unmet_27_behind": sorted(a["i"] for a in alerts if not a["live_27"] and a["behind"]),
       "unmet_27_beside": sorted(a["i"] for a in alerts if not a["live_27"] and not a["behind"]),
       "met_27_beside": sorted(a["i"] for a in alerts if a["live_27"] and not a["behind"]),
       "domains": dom, "domains_agree": agree}
b1893 = by[1893]
res["predictions"] = {
    "P1": {"held": b1893["p_best"] >= 0.5 and b1893["p_adj"] >= 0.2, "value": [b1893["p_best"], b1893["p_adj"]]},
    "P2": {"held": all(by[i]["p_adj"] > 0.05 for i in three), "value": [by[i]["p_adj"] for i in three]},
    "P3": {"held": all(a["p_adj"] <= 0.01 for a in m5), "value": [len(m5), sum(a["p_adj"] <= 0.01 for a in m5)]},
    "P4": {"held": res["strict_27"]["behind"] >= 0.95 * len(s27_strict), "value": [res["strict_27"]["behind"], len(s27_strict)]},
    "P5": {"held": agree >= 45, "value": agree}}
# cluster bootstrap of the behind share (clusters of study 27)
cl = {}
for r in J: cl.setdefault(r["cluster"], []).append(by[int(r["i"])]["behind"])
ks = sorted(cl); rnd = random.Random(29); vals = []
for _ in range(2000):
    pick = [rnd.choice(ks) for _ in ks]
    vals.append(sum(sum(cl[c]) for c in pick) / sum(len(cl[c]) for c in pick))
vals.sort(); res["behind_ci"] = [vals[49], vals[1949]]
# the Atelier's grid, reproduced where the floors overlap (a check, not a prediction)
if len(sys.argv) > 3:
    A = json.loads(Path(sys.argv[3]).read_text())["grid"]
    rep = {}
    for key, g in dom.items():
        fl, rad, wn = key.split("|")
        ak = f"{fl}|{rad}|{wn}"
        if ak in A: rep[key] = {"atelier_met": A[ak]["met"], "field_met": g["live"], "atelier_placebo": A[ak]["placebo"], "field_k364": g["k364"]}
    res["atelier_grid"] = {"compared": len(rep), "met_equal": sum(v["atelier_met"] == v["field_met"] for v in rep.values()),
                           "placebo_equal": sum(v["atelier_placebo"] == v["field_k364"] for v in rep.values()), "rows": rep}
(HERE / "data" / "results_29.json").write_text(json.dumps(res, indent=1))
(HERE / "data" / "alerts_29.json").write_text(json.dumps(alerts, separators=(",", ":")))
print(json.dumps({k: v for k, v in res.items() if k not in ("domains", "atelier_grid")}, indent=1))
if "atelier_grid" in res: print({k: v for k, v in res["atelier_grid"].items() if k != "rows"})
