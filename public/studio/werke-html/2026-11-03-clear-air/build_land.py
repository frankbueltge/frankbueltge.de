"""CLEAR AIR — builds land.js: the ground the field is laid on (increment 2, session 222).

Inputs, fetched and checksum-asserted, never committed:
1. DRC health-zone boundaries, "RDC_Zones de sante" (HDX dataset drc-health-data, ODbL 1.0,
   shapefile of 2022-05-20, 519 zones). Each zone of the Ebola file is matched by pcode
   (the file's CD540510 is the shapefile's CD5405ZS10).
2. Country outlines: world-atlas 2.0.2 (npm, ISC), countries-50m.json, drawn from Natural Earth
   (public domain).
Output land.js is a derived database of the zone boundaries and so stands under ODbL 1.0, with
attribution to the HDX source (see meta.json).

Run: python3.13 build_land.py  (needs pyshp; from this folder; downloads into ./_land_cache, ignored)
"""
import csv, hashlib, io, json, math, urllib.request, zipfile
from pathlib import Path
import shapefile  # pyshp, MIT

HERE = Path(__file__).resolve().parent
CACHE = HERE / "_land_cache"; CACHE.mkdir(exist_ok=True)
ZS_URL = ("https://data.humdata.org/dataset/cecb0d2f-331f-45be-a613-58aa506844f9/resource/"
          "32e9c52a-2be0-45a1-9372-33d0dab2c08a/download/rdc_zones-de-sante.zip")
ZS_SHA = "d781b2eaab0ea8d060c7e5c5b93ef761801cb1a9a5f49f2ddffa398101e56b44"
WA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json"
WA_SHA = "04342cdc1e3016bcd7db1630de95684d67b79fe3c8c460321e87aef469502394"
BBOX = (17.5, -6.5, 39.5, 6.5)  # lon0, lat0, lon1, lat1
TOL = 0.012                     # simplification tolerance, degrees

def get(url, sha, name):
    p = CACHE / name
    if not p.exists():
        p.write_bytes(urllib.request.urlopen(url, timeout=120).read())
    b = p.read_bytes()
    assert hashlib.sha256(b).hexdigest() == sha, f"{name} changed; re-read before building"
    return b

def dp(pts, tol):
    if len(pts) < 4: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-12
    i, dm = 0, -1
    for k in range(1, len(pts) - 1):
        d = abs(dy * (pts[k][0] - a[0]) - dx * (pts[k][1] - a[1])) / L
        if d > dm: i, dm = k, d
    if dm <= tol: return [a, b]
    return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)

def simp(ring):
    if ring[0] == ring[-1] and len(ring) > 4:
        h = len(ring) // 2
        out = dp(ring[:h + 1], TOL)[:-1] + dp(ring[h:], TOL)
    else:
        out = dp(ring, TOL)
    return [[round(x, 3), round(y, 3)] for x, y in out]

def area_centroid(ring):
    A = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
        c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c
    A /= 2
    return abs(A), (cx / (6 * A), cy / (6 * A)) if A else ring[0]

# ---- the file's zones (same HDX file as build.py; checksum shared)
E_URL = ("https://data.humdata.org/dataset/e902b209-b7bc-42f9-893a-294276d7cc62/resource/"
         "f7c9b552-0d41-4559-9fae-c450175fc39c/download/drc_ebola_cases_consolidated.csv")
E_SHA = "761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf"
rows = csv.DictReader(io.StringIO(get(E_URL, E_SHA, "ebola.csv").decode("utf-8")))
in_file = {r["location_code"]: r["location_name"] for r in rows if r["location_level"] == "3" and r["location_code"]}
assert len(in_file) == 69

# ---- health zones
zf = zipfile.ZipFile(io.BytesIO(get(ZS_URL, ZS_SHA, "zs.zip")))
parts = {Path(n).suffix.lower(): zf.read(n) for n in zf.namelist()}
sf = shapefile.Reader(shp=io.BytesIO(parts[".shp"]), dbf=io.BytesIO(parts[".dbf"]), shx=io.BytesIO(parts[".shx"]))
assert len(sf) == 519
zones, matched = [], set()
for sr in sf.iterShapeRecords():
    rec = sr.record; pc = rec["Pcode"].replace("ZS", "")
    shp = sr.shape; pts = shp.points; idx = list(shp.parts) + [len(pts)]
    rings = [pts[idx[k]:idx[k + 1]] for k in range(len(idx) - 1)]
    big = max(rings, key=lambda r: area_centroid([tuple(p) for p in r])[0])
    A, (cx, cy) = area_centroid([tuple(p) for p in big])
    if not (BBOX[0] <= cx <= BBOX[2] and BBOX[1] <= cy <= BBOX[3]): continue
    z = {"pc": pc, "name": rec["Nom"], "prov": rec["PROVINCE"], "c": [round(cx, 3), round(cy, 3)],
         "ring": simp([list(p) for p in big]), "file": pc in in_file}
    if z["file"]: matched.add(pc)
    zones.append(z)
assert matched == set(in_file), set(in_file) - matched

# ---- countries (TopoJSON, quantized arcs)
T = json.loads(get(WA_URL, WA_SHA, "countries-50m.json"))
sx, sy = T["transform"]["scale"]; tx, ty = T["transform"]["translate"]
arcs = []
for a in T["arcs"]:
    x = y = 0; out = []
    for dx, dy in a:
        x += dx; y += dy; out.append([x * sx + tx, y * sy + ty])
    arcs.append(out)
def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
WANT = {"Dem. Rep. Congo", "Uganda", "Kenya", "Rwanda", "Burundi", "Tanzania", "S. Sudan",
        "Central African Rep.", "Ethiopia", "Somalia"}
countries = []
for g in T["objects"]["countries"]["geometries"]:
    name = g["properties"]["name"]
    if name not in WANT: continue
    polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
    rings = []
    for poly in polys:
        for ring in poly:
            pts = [p for i in ring for p in arc(i)[:-1]]
            pts.append(pts[0])
            if any(BBOX[0] - 3 <= x <= BBOX[2] + 3 and BBOX[1] - 3 <= y <= BBOX[3] + 3 for x, y in pts):
                rings.append(simp(pts))
    countries.append({"name": name, "rings": rings})
assert len(countries) == len(WANT), [c["name"] for c in countries]

assert (len(zones), len(zones) - len(matched)) == (349, 280)
out = {"bbox": BBOX, "file_names": {n: pc for pc, n in in_file.items()}, "zones": zones, "countries": countries,
       "nairobi": [36.817, -1.286],
       "facts": {"zones_drawn": len(zones), "zones_in_file": len(matched)}}
(HERE / "land.js").write_text("window.CLEAR_AIR_LAND=" + json.dumps(out, separators=(",", ":")) + ";\n")
print("ok", out["facts"], round((HERE / "land.js").stat().st_size / 1024), "KB")
