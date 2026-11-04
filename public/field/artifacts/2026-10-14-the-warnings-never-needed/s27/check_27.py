"""Study 27 checks, by a second code path. Counts itself: it must run exactly the checks it declares.

Usage: python3 -I check_27.py STUDIO_DATA_JS GAZETTEER_TXT CACHE_DIR
"""
import json, sys, gzip, csv, math, bisect, random
from pathlib import Path

HERE = Path(__file__).parent
DECLARED = 9
ran, failed = [], []
def check(name, cond):
    ran.append(name); print(("PASS " if cond else "FAIL ") + name)
    if not cond: failed.append(name)

s = Path(sys.argv[1]).read_text()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
GAZ = {}
with open(sys.argv[2], encoding="utf-8") as f:
    head = [h.strip() for h in f.readline().split("\t")]
    for line in f:
        v = dict(zip(head, [x.strip() for x in line.split("\t")]))
        GAZ[v["GEOID"]] = (float(v["INTPTLAT"]), float(v["INTPTLONG"]))
W = {w["i"]: w for w in csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t")}
M = {r["i"] for r in csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "met_24.tsv.gz", "rt"), delimiter="\t")}
J = list(csv.DictReader(gzip.open(HERE / "data" / "joined_27.tsv.gz", "rt"), delimiter="\t"))
R = json.loads((HERE / "data" / "results_27.json").read_text())
A = json.loads((HERE / "data" / "audit_27.json").read_text())

# 1. The Atelier's two points: undeclared in frame and absent from met_24 = uncovered + unjoined.
und = [w for w in W.values() if w["group"] == "undeclared" and int(w["t_min"]) < 29583360]
absent = [w for w in und if w["i"] not in M]
check("absent from met_24 = 5,726 = 5,552 uncovered + 174 unjoined",
      len(absent) == 5726 and sum(w["status"] == "uncovered" for w in absent) == 5552 and sum(w["status"] == "register_unjoined" for w in absent) == 174)

# 2. Kind split by a different test (substring, not regex).
check("tsunami/earthquake split agrees", all((("tsunami" in CARDS[int(r["i"])]["w"].lower()) == (r["kind"] == "tsunami")) for r in J) and len(J) == 174)

# Catalogue, sorted, haversine distance (the analysis uses the spherical law of cosines).
cat = []
for f in sorted(Path(sys.argv[3]).glob("comcat_*.json")):
    for e in json.loads(f.read_text())["features"]:
        if e["properties"]["mag"] is not None:
            cat.append((e["properties"]["time"] / 60000, e["properties"]["mag"], e["geometry"]["coordinates"][1], e["geometry"]["coordinates"][0], e["id"]))
cat.sort(); T = [c[0] for c in cat]
def hav(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dp = p2 - p1; dl = math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(h))
def met(pts, lo, hi, mmin=3.0, rad=100.0, extra=()):
    pool = cat[bisect.bisect_left(T, lo):bisect.bisect_right(T, hi)] + [e for e in extra if lo <= e[0] <= hi]
    return any(e[1] >= mmin and min(hav((e[2], e[3]), p) for p in pts) <= rad for e in pool)

EQ = [r for r in J if r["kind"] == "earthquake"]
agree = {"live": 0, "placebo": 0, "live_strict": 0, "live_m45": 0, "live_r200": 0}
for r in EQ:
    w = W[r["i"]]; t, L = int(w["t_min"]), int(w["life_min"])
    pts = [GAZ[g] for g in w["counties"].split(",") if g in GAZ] or [v for k, v in GAZ.items() if k[:2] == w["counties"][:2]]
    agree["live"] += int(met(pts, t - 1440, t + L + 1440)) == int(r["live"])
    agree["placebo"] += int(met(pts, t - 364 * 1440 - 1440, t - 364 * 1440 + L + 1440)) == int(r["placebo"])
    agree["live_strict"] += int(met(pts, t - 10, t + L)) == int(r["live_strict"])
    agree["live_m45"] += int(met(pts, t - 1440, t + L + 1440, mmin=4.5)) == int(r["live_m45"])
    agree["live_r200"] += int(met(pts, t - 1440, t + L + 1440, rad=200)) == int(r["live_r200"])
check(f"second path agrees on every earthquake warning, five arms ({len(EQ)} each)", all(v == len(EQ) for v in agree.values()))

# 3. Planted event: an unmet (or, failing that, any) warning gains an M5 at its first county point inside its window.
r = next((x for x in EQ if x["live"] == "0"), EQ[0]); w = W[r["i"]]
p0 = GAZ.get(w["counties"].split(",")[0]) or next(v for k, v in GAZ.items() if k[:2] == w["counties"][:2]); t = int(w["t_min"])
check("a planted M5.0 at the county point is found", met([p0], t - 1440, t + 1440, extra=[(t + 1, 5.0, p0[0], p0[1], "planted")]))
check("a planted M5.0 150 km away is not found at 100 km",
      not met([p0], t - 1440, t + 1440, extra=[(t + 1, 5.0, p0[0] + 150 / 111.2, p0[1], "planted")]) or r["live"] == "1")

# 4. Results file sums.
e = R["earthquake"]
check("results: n and met equal the table", e["n"] == len(EQ) and e["live"] == sum(int(x["live"]) for x in EQ) and R["tsunami"] + e["n"] == 174)

# 5. Fire audit, second path.
FIRE = [w for w in und if w["status"] == "covered" and w["primary"] == "fire"]
check("fire pool is 1,990 and audit removed + remainder = 1,990",
      len(FIRE) == 1990 and A["removed"]["n"] + A["remainder"]["n"] == 1990 and sum(A["removed_by_kind"].values()) == A["removed"]["n"])
check("every removed id is a fire-class warning", set(map(str, A["removed_ids"])) <= {w["i"] for w in FIRE})
H = list(csv.DictReader(open(HERE / "data" / "hand_27.tsv"), delimiter="\t"))
check("hand reading: 60 rows, 35 vegetation, kinds sum", len(H) == 60 and sum(h["vegetation_fire"] == "1" for h in H) == A["hand"]["vegetation_fire"] == 35
      and sum(v["n"] for v in A["hand"]["by_kind"].values()) == 60)

print(f"{len(ran)} run of {DECLARED} declared, {len(failed)} failed")
assert len(ran) == DECLARED, "the suite did not run what it declared"
sys.exit(1 if failed else 0)
