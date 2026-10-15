"""Fetch what UNDERNEATH reads. Writes raw/ (not committed) and raw-manifest.json (source, size, SHA-256).
Run: python3 -I fetch.py   — no key needed. The impact list and the population service may change; a later run can differ.
1. The encyclopedia's list of asteroids whose impact was predicted before it happened (discovery time, impact time, point).
2. The Field's study 11, *Seen coming*: days of warning for every passage inside the Moon's distance, 2015-2025 (pinned commit).
3. WorldPop's zonal statistics: estimated residents (2020 grid) inside a 50 km disc around each impact point, one request each."""
import hashlib, json, math, os, re, time, urllib.parse, urllib.request
FIELD_COMMIT = "428a86db60125c1525d61cb30e331f730ac8e663"
SRC = {
    "raw/list.wikitext": "https://en.wikipedia.org/w/index.php?title=List_of_predicted_asteroid_impacts_on_Earth&action=raw",
    "raw/field_results.json": f"https://raw.githubusercontent.com/frankbueltge/field-research/{FIELD_COMMIT}/artifacts/2026-10-13-seen-coming/data/results.json",
}
R_KM = 50.0
def get(url):
    for i in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "studio-research (art work; contact via frankbueltge.de)"})
            with urllib.request.urlopen(req, timeout=180) as r: return r.read()
        except Exception as e:
            err = e; time.sleep(2 ** (i + 1))
    raise err
def disc(lat, lon, r_km=R_KM, n=64):
    pts = []
    for k in range(n + 1):
        a = 2 * math.pi * (k % n) / n
        dlat = r_km / 111.32 * math.cos(a); dlon = r_km / (111.32 * math.cos(math.radians(lat))) * math.sin(a)
        pts.append([round(lon + dlon, 5), round(lat + dlat, 5)])
    return {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [pts]}}]}
os.makedirs("raw", exist_ok=True)
man = {"note": "raw/ is not committed. Each file's source, size and SHA-256 as fetched; fetch.py rebuilds raw/.", "files": {}}
def keep(path, url, b):
    open(path, "wb").write(b)
    man["files"][path] = {"url": url, "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    print(path, len(b))
for path, url in SRC.items(): keep(path, url, get(url))
# the points, read from the list, then one population request per point
wt = open("raw/list.wikitext", encoding="utf-8").read()
for m in re.finditer(r'\|-id="([^"]+)"\n(.*)', wt):
    row = m.group(2)
    c = re.search(r"\{\{Coord\|([\d.]+)\|([NS])\|([\d.]+)\|([EW])", row)
    lat = float(c.group(1)) * (1 if c.group(2) == "N" else -1); lon = float(c.group(3)) * (1 if c.group(4) == "E" else -1)
    q = {"dataset": "wpgppop", "year": "2020", "runasync": "false", "geojson": json.dumps(disc(lat, lon), separators=(",", ":"))}
    url = "https://api.worldpop.org/v1/services/stats?" + urllib.parse.urlencode(q)
    keep(f"raw/pop_{m.group(1)}.json", url, get(url))
json.dump(man, open("raw-manifest.json", "w"), indent=1)
