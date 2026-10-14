"""UNDER WARNING — the people beneath every tornado warning the Weather Service issued, 2008-2023.

Conventions (each is an estimate where marked):
- A warning is its first issued polygon (IEM, status NEW). Later updates that shrink a polygon are
  not followed, so "people beneath" is the count the warning was first written over.
- People beneath (ESTIMATE): the residential population of every census block group whose centre of
  population lies inside the polygon. Census 2010 for warnings of 2008-2015, census 2020 for 2016-2023.
  It counts where people sleep, not where they were.
- Minutes standing, and whether a tornado met the warning, come unchanged from the Field's study 14
  (warnings_verified.tsv.gz). The default rule is the Field's V (a tornado track crossed the polygon
  while it stood); the page lets a visitor switch to S, V0 and V60, as the Field defines them.
- Person-hours (ESTIMATE): people beneath x minutes standing / 60; an upper estimate, since
  polygons are not shrunk with their updates.
"""
import csv, gzip, io, json, sys, zipfile, collections
import numpy as np, shapefile, shapely
from shapely.geometry import shape

RAW = sys.argv[1]

def bg(name):
    rows = list(csv.reader(open(f"{RAW}/{name}", encoding="utf-8-sig")))[1:]
    pop = np.array([int(r[4]) for r in rows], dtype=np.int64)
    pts = shapely.points(np.array([float(r[6]) for r in rows]), np.array([float(r[5]) for r in rows]))
    return pop, pts, shapely.STRtree(pts)

census = {2010: bg("CenPop2010_Mean_BG.txt"), 2020: bg("CenPop2020_Mean_BG.txt")}
field = {r["warning"]: r for r in csv.DictReader(gzip.open(f"{RAW}/warnings_verified.tsv.gz", "rt"), delimiter="\t")}

polys = collections.defaultdict(list)
issued = {}
for y in range(2008, 2024):
    z = zipfile.ZipFile(f"{RAW}/iem_tow_{y}.zip")
    n = [x for x in z.namelist() if x.endswith(".shp")][0][:-4]
    r = shapefile.Reader(shp=io.BytesIO(z.read(n + ".shp")), dbf=io.BytesIO(z.read(n + ".dbf")),
                         shx=io.BytesIO(z.read(n + ".shx")))
    f = [x[0] for x in r.fields[1:]]
    for sr in r.iterShapeRecords():
        d = dict(zip(f, sr.record))
        assert d["STATUS"] == "NEW" and d["PHENOM"] == "TO" and d["SIG"] == "W"
        k = f"{d['WFO']}.{d['VTEC_YR']}.{d['ETN']}"
        polys[k].append(shape(sr.shape.__geo_interface__))
        issued[k] = min(issued.get(k, d["ISSUED"]), d["ISSUED"])

assert set(polys) == set(field), (len(polys), len(field))
out = []
for k in sorted(polys, key=lambda k: (issued[k], k)):
    g = shapely.union_all(polys[k]).buffer(0)
    fr = field[k]
    yr = int(fr["year"])
    pop, pts, tree = census[2010 if yr <= 2015 else 2020]
    idx = tree.query(g, predicate="contains")
    people = int(pop[idx].sum())
    rings = []
    for p in getattr(g, "geoms", [g]):
        rings.append([[round(x * 100) for x in c] for c in p.exterior.coords[:-1]])
    out.append({
        "id": k, "issued": issued[k], "minutes": int(fr["minutes"]), "people": people,
        "V": int(fr["V"]), "S": int(fr["S"]), "V0": int(fr["V0"]), "V60": int(fr["V60"]),
        "deaths": int(fr["fat_V"]), "ef": None if fr["maxmag_V"] == "None" else int(fr["maxmag_V"]),
        "rings": rings,
    })

for w in out:
    for r in ("V", "S", "V0", "V60"):
        w[r] = 1 if w[r] > 0 else 0  # the Field's columns count tornadoes; a warning is met if any did

# ---- the numbers the page states, asserted where they come from someone else ----
N = len(out)
assert N == 43819
met = [w for w in out if w["V"]]
assert len(met) == 13324, len(met)  # the Field's V count, study 14
never = [w for w in out if not w["V"]]
tot_people = sum(w["people"] for w in out)
never_people = sum(w["people"] for w in never)
ph = lambda ws: sum(w["people"] * w["minutes"] for w in ws) / 60
ef5 = [w for w in out if w["ef"] == 5]
def union_people(ws):
    tot = 0
    for c in (2010, 2020):
        part = [w for w in ws if (2010 if int(w["issued"][:4]) <= 2015 else 2020) == c]
        if part:
            g = shapely.union_all([shapely.union_all(polys[w["id"]]) for w in part]).buffer(0)
            pop, pts, tree = census[c]
            tot += int(pop[tree.query(g, predicate="contains")].sum())
    return tot
ef5_union = union_people(ef5)
peopled = sorted(w["people"] for w in out)
largest = sorted(out, key=lambda w: -w["people"])[:12]
summary = {
    "warnings": N, "met_V": len(met), "never_V": len(never),
    "person_warnings": tot_people, "person_warnings_never_V": never_people,
    "person_hours": round(ph(out)), "person_hours_never_V": round(ph(never)),
    "median_people": peopled[N // 2], "zero_people": sum(1 for p in peopled if p == 0),
    "deaths_met_V": sum(w["deaths"] for w in met),
    "ef5_warnings": [{"id": w["id"], "issued": w["issued"], "people": w["people"], "deaths": w["deaths"],
                      "minutes": w["minutes"]} for w in ef5],
    "ef5_people_sum": sum(w["people"] for w in ef5), "ef5_people_union": ef5_union,
    "ef5_deaths_atelier": 323, "ef5_tornadoes_atelier": 8,
    "largest": [{"id": w["id"], "issued": w["issued"], "people": w["people"], "V": w["V"], "minutes": w["minutes"]}
                for w in largest],
    "by_rule": {r: {"met": sum(w[r] for w in out),
                    "people_never": sum(w["people"] for w in out if not w[r]),
                    "person_hours_never": round(ph([w for w in out if not w[r]]))} for r in ("V", "S", "V0", "V60")},
    "by_year": {y: {"warnings": sum(1 for w in out if w["issued"][:4] == str(y)),
                    "people": sum(w["people"] for w in out if w["issued"][:4] == str(y)),
                    "people_never_V": sum(w["people"] for w in out if w["issued"][:4] == str(y) and not w["V"])}
                for y in range(2008, 2024)},
}
json.dump(summary, open("summary.json", "w"), indent=1)
# page data, columnar: minutes since 2008-01-01 00:00 UTC, minutes standing, people, rule bits
# (V=1, S=2, V0=4, V60=8), strongest tornado met (-1 none), ring vertex counts, delta-coded coords.
import datetime
T0 = datetime.datetime(2008, 1, 1)
def mins(s): return int((datetime.datetime.strptime(s, "%Y%m%d%H%M") - T0).total_seconds() // 60)
col = {k: [] for k in ("id", "t", "d", "p", "m", "ef", "dead", "nr", "rl", "c")}
for w in out:
    col["id"].append(w["id"]); col["t"].append(mins(w["issued"])); col["d"].append(w["minutes"])
    col["p"].append(w["people"]); col["m"].append(w["V"] | w["S"] << 1 | w["V0"] << 2 | w["V60"] << 3)
    col["ef"].append(-1 if w["ef"] is None else w["ef"]); col["dead"].append(w["deaths"])
    col["nr"].append(len(w["rings"]))
    for ring in w["rings"]:
        col["rl"].append(len(ring)); px, py = ring[0]
        col["c"] += [px, py]
        for x, y in ring[1:]:
            col["c"] += [x - px, y - py]; px, py = x, y
json.dump(col, open("warnings.json", "w"), separators=(",", ":"))
# population layer for the picture only (census 2020, block-group centres summed on a 0.05-degree grid)
grid = collections.Counter()
for r in list(csv.reader(open(f"{RAW}/CenPop2020_Mean_BG.txt", encoding="utf-8-sig")))[1:]:
    grid[(round(float(r[6]) * 20), round(float(r[5]) * 20))] += int(r[4])
flat = []
for (x, y), p in sorted(grid.items()):
    if p > 0: flat += [x, y, p]
json.dump({"_note": "lon*20, lat*20, people (census 2020); for the picture, not the counts", "g": flat},
          open("pop.json", "w"), separators=(",", ":"))
print(json.dumps({k: v for k, v in summary.items() if k not in ("by_year", "largest")}, indent=1))
for w in largest: print(w["id"], w["issued"], w["people"], w["V"], w["minutes"])
