"""Study 16: join people beneath (Studio), first-polygon area (study 13) and verification (study 14).
Usage: python3 -I build.py <studio warnings.json> [<atelier tiers.tsv.gz>]
Writes data/where.tsv (one row per warning)."""
import csv, gzip, hashlib, json, math, pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
ART = HERE.parent
studio_path = pathlib.Path(sys.argv[1])
tiers_path = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else None
digest = hashlib.sha256(studio_path.read_bytes()).hexdigest()
assert digest == "6025b01fd2003b97b36674ed2b427b93270927a85b4b65c2e75e7c85cd0e9e1a", digest
S = json.loads(studio_path.read_text())
people = dict(zip(S["id"], S["p"]))
assert len(people) == len(S["id"]) == 43819

def area_km2(ring):
    pts = [tuple(map(float, p.split())) for p in ring.split(";")]
    lat0 = math.radians(sum(p[1] for p in pts) / len(pts))
    kx, ky = 111.320 * math.cos(lat0), 110.574
    xy = [(lon * kx, lat * ky) for lon, lat in pts]
    a = 0.0
    for (x1, y1), (x2, y2) in zip(xy, xy[1:] + xy[:1]):
        a += x1 * y2 - x2 * y1
    return abs(a) / 2

first = {}
with gzip.open(ART / "2026-10-14-the-tornadoes-that-came/data/warnings.tsv.gz", "rt") as f:
    for i, r in enumerate(csv.DictReader(f, delimiter="\t")):
        wid = f"{r['wfo']}.{r['vtec_year']}.{r['etn']}"
        key = (r["poly_beg"], r["issued"], i)
        if wid not in first or key < first[wid][0]:
            first[wid] = (key, r["rings"])

tiers = {}
if tiers_path:
    with gzip.open(tiers_path, "rt") as f:
        tiers = {r["warning"]: r["tier"] for r in csv.DictReader(f, delimiter="\t")}

rows, missing_area, missing_people = [], 0, 0
with gzip.open(ART / "2026-10-14-the-warnings-never-needed/data/warnings_verified.tsv.gz", "rt") as f:
    for r in csv.DictReader(f, delimiter="\t"):
        w = r["warning"]
        if w not in people: missing_people += 1; continue
        if w not in first: missing_area += 1; continue
        ring = first[w][1].split("|")[0]
        rows.append({"warning": w, "wfo": w.split(".")[0], "year": r["year"], "utc_hour": r["utc_hour"],
                     "minutes": r["minutes"], "V": r["V"], "S": r["S"], "maxmag_V": r["maxmag_V"],
                     "people": people[w], "area_km2": f"{area_km2(ring):.2f}",
                     "tier": tiers.get(w, "")})
assert missing_people == 0 and missing_area == 0 and len(rows) == 43819, (missing_people, missing_area, len(rows))
if tiers_path: assert sum(1 for r in rows if r["tier"]) == 43819
with open(HERE / "data/where.tsv", "w", newline="") as f:
    wr = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter="\t"); wr.writeheader(); wr.writerows(rows)
print(len(rows), "rows; studio sha256", digest)
