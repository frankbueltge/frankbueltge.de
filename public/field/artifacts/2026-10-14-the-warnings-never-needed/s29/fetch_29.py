"""Study 29: fetch the catalogue (PREREGISTRATION-29.md).

Every ComCat event of M >= 1.0 in one box per region (the alert points +- 300 km), from 366 days
before the region's first alert to a day after its last window, in CSV pieces (monthly in the west, yearly elsewhere, six at a time); a piece that
reaches the service's 20,000 limit is halved until it does not. URL, rows and sha256 of every piece go
to data/pieces_29.json; the pieces themselves stay in CACHE_DIR (public domain, not committed).

Usage: python3 -I fetch_29.py GAZETTEER_TXT CACHE_DIR
"""
import json, sys, csv, gzip, hashlib, math, time, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).parent
GAZ = {}
for r in csv.DictReader(open(sys.argv[1], encoding="utf-8"), delimiter="\t"):
    r = {k.strip(): v.strip() for k, v in r.items()}
    GAZ[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))
CACHE = Path(sys.argv[2]); CACHE.mkdir(exist_ok=True)

def points(counties):  # study 27's rule, verbatim in effect
    out = []
    for g in counties.split(","):
        out += [GAZ[g]] if g in GAZ else ([v for k, v in GAZ.items() if k[:2] == g[:2]] if g.endswith("000") else [])
    return out

J = [r for r in csv.DictReader(gzip.open(HERE.parent / "s27" / "data" / "joined_27.tsv.gz", "rt"), delimiter="\t") if r["kind"] == "earthquake"]
assert len(J) == 155
W = {w["i"]: w for w in csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t")}
REGION = {"06": "west", "32": "west", "49": "west", "36": "northeast", "34": "northeast", "48": "texas"}
reg = {}
for r in J:
    pts = points(W[r["i"]]["counties"]); assert pts
    g = reg.setdefault(REGION[W[r["i"]]["counties"][:2]], {"pts": [], "t0": 1e18, "t1": 0})
    g["pts"] += pts; g["t0"] = min(g["t0"], int(r["t"])); g["t1"] = max(g["t1"], int(r["t"]) + int(r["L"]))

def iso(m):
    return datetime.datetime.fromtimestamp(m * 60, datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

PIECES = []
def piece(name, box, a, b):
    q = {"format": "csv", "starttime": iso(a), "endtime": iso(b), "minmagnitude": "1.0", "orderby": "time-asc",
         "minlatitude": f"{box[0]:.2f}", "maxlatitude": f"{box[1]:.2f}", "minlongitude": f"{box[2]:.2f}", "maxlongitude": f"{box[3]:.2f}"}
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    f = CACHE / f"{name}_{a}_{b}.csv"
    if not f.exists():
        for k in range(5):
            try:
                f.write_bytes(urllib.request.urlopen(url, timeout=150).read()); break
            except Exception as ex:
                if getattr(ex, "code", None) == 400:  # the service refuses a piece over its limit
                    m = (a + b) // 2; piece(name, box, a, m); piece(name, box, m, b); return
                if k == 4: raise
                print("retry", k, ex, flush=True); time.sleep(2 ** (k + 1))
    n = f.read_bytes().count(b"\n") - 1
    if n >= 20000:
        f.unlink(); m = (a + b) // 2
        piece(name, box, a, m); piece(name, box, m, b); return
    PIECES.append({"region": name, "url": url, "rows": n, "sha256": hashlib.sha256(f.read_bytes()).hexdigest(), "file": f.name})
    print(name, iso(a), n, flush=True)

JOBS = []
for name, g in sorted(reg.items()):
    lat0 = min(p[0] for p in g["pts"]); lat1 = max(p[0] for p in g["pts"])
    lon0 = min(p[1] for p in g["pts"]); lon1 = max(p[1] for p in g["pts"])
    dlat = 300 / 111.0; dlon = 300 / (111.0 * math.cos(math.radians(max(abs(lat0), abs(lat1)) + dlat)))
    box = (lat0 - dlat, lat1 + dlat, lon0 - dlon, lon1 + dlon)
    a, end = (g["t0"] - 366 * 1440) // 1440 * 1440, (g["t1"] + 2 * 1440) // 1440 * 1440
    g.update({"box": box, "start": iso(a), "end": iso(end)})
    while a < end:
        d = datetime.datetime.fromtimestamp(a * 60, datetime.timezone.utc)
        nxt = (datetime.datetime(d.year + (d.month == 12), d.month % 12 + 1, 1, tzinfo=datetime.timezone.utc) if name == "west"
               else datetime.datetime(d.year + 1, 1, 1, tzinfo=datetime.timezone.utc))  # the quiet regions by year
        b = min(end, int(nxt.timestamp() // 60))
        JOBS.append((name, box, a, b)); a = b
with ThreadPoolExecutor(6) as ex:
    list(ex.map(lambda j: piece(*j), JOBS))
PIECES.sort(key=lambda p: (p["region"], p["file"]))

(HERE / "data").mkdir(exist_ok=True)
(HERE / "data" / "pieces_29.json").write_text(json.dumps({
    "fetched": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
    "service": "https://earthquake.usgs.gov/fdsnws/event/1/ (USGS ComCat, public domain)",
    "regions": {k: {kk: v[kk] for kk in ("box", "start", "end")} for k, v in reg.items()},
    "pieces": PIECES, "rows": sum(p["rows"] for p in PIECES)}, indent=1))
print("rows", sum(p["rows"] for p in PIECES), "pieces", len(PIECES))
