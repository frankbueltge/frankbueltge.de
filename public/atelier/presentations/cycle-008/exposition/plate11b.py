"""Plate XI, dated correction of 2026-10-20: the quiet domains over 364 year-earlier days, not one.

Plate XI called a domain QUIET when the same domain, moved back exactly 364 days, "meets" at most 5 % of the
155 alerts. The Field's study 29 (field-research@2a153c7, s29/data/results_29.json; offered as a correction,
relay handoff ho-2026-10-19-field-9) moved every window back k = 1..364 days and took the mean share: by that
rule M2+/200 km and M2+/300 km in the strict window are not quiet (5.6 %, 7.0 %), where plate XI's single
year-earlier day gave 1.3 % and 1.9 %. A correction of this practice's own claim is checked, not declined.

This script checks it by a second path. It does not read the Field's catalogue: it fetches USGS ComCat
again, plate XI's way (one circle query per cluster, the cluster's mean point, 300 km plus its farthest
point), now for the 366 days before each cluster's first alert to its last alert's end, magnitude >= 2.0,
split by quarter so no query nears the service's 20,000-row cap. Floors below M2 are not re-fetched: the
Field's two rules agree on every floor-1 domain (results_29.json), so they cannot change the quiet set.
Everything else is plate XI's own code path: the same alerts, points, windows and "meets".

Rules, fixed before the fetch: for each domain with floor F >= 2 (F x R x W, plate XI's grid), the share of
the 155 alerts it meets with every window moved back k days, k = 1..364; the mean over k; QUIET (mean) if
the mean is at most 5 %. Then plate XI's summary is recomputed under the mean rule: the quiet domains that
set a floor (floor-1 domains taken from the Field's file, marked so), and the least and the most
"never needed, warranted" among them, read from plate11.json's own grid.

Usage: python3 -I plate11b.py STUDIO_DATA_JS FIELD_S27_DATA_DIR GAZETTEER_TXT FIELD_RESULTS_29_JSON CACHE_DIR
       (writes plate11b.json and plate11b.js beside itself)
"""
import json, sys, csv, gzip, hashlib, math, time, bisect, collections, urllib.request, urllib.parse, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
SRC, D, GZT, R29F, CACHE = (Path(a) for a in sys.argv[1:6])
CACHE.mkdir(exist_ok=True)
assert hashlib.sha256(SRC.read_bytes()).hexdigest() == "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
assert hashlib.sha256((D / "joined_27.tsv.gz").read_bytes()).hexdigest() == "d3d4658fbba1724fa92d7ab3787b88223ea39c09b8f5e545d4488f8ed29dec59"
assert hashlib.sha256(GZT.read_bytes()).hexdigest() == "b0aecde6748947236e931faeb6a619b89aea0346e54a454239aac76abcd2ef82"
R29_SHA = hashlib.sha256(R29F.read_bytes()).hexdigest()
R29 = json.loads(R29F.read_text())
P11 = json.loads((HERE / "plate11.json").read_text())
s = SRC.read_text()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
J = [r for r in csv.DictReader(gzip.open(D / "joined_27.tsv.gz", "rt"), delimiter="\t") if r["kind"] == "earthquake"]
assert len(J) == 155

GAZ = {}
for r in csv.DictReader(GZT.read_text("utf-8").splitlines(), delimiter="\t"):
    r = {k.strip(): v.strip() for k, v in r.items()}
    GAZ[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))

def km(a, b):  # plate XI's distance
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    return 6371.0 * math.acos(max(-1, min(1, math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl))))

def points(codes):  # plate XI's places
    out = []
    for g in codes:
        out += [GAZ[g]] if g in GAZ else ([v for k, v in GAZ.items() if k[:2] == g[:2]] if g.endswith("000") else [])
    return out

def iso(m):
    return dt.datetime.fromtimestamp(m * 60, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

FETCHED = []
def fetch(lat, lon, rad, t0, t1):
    q = {"format": "geojson", "starttime": iso(t0), "endtime": iso(t1), "latitude": f"{lat:.4f}",
         "longitude": f"{lon:.4f}", "maxradiuskm": f"{rad:.1f}", "minmagnitude": "2.0", "orderby": "time-asc"}
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    f = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:20] + ".json")
    if not f.exists():
        for k in range(5):
            try:
                f.write_bytes(urllib.request.urlopen(url, timeout=300).read()); time.sleep(1); break
            except Exception:
                if k == 4: raise
                time.sleep(2 ** (k + 1))
    b = f.read_bytes(); d = json.loads(b)
    assert len(d["features"]) < 20000, url
    FETCHED.append({"url": url, "sha256": hashlib.sha256(b).hexdigest(), "events": len(d["features"])})
    return [(e["properties"]["time"] / 60000, e["properties"]["mag"], e["geometry"]["coordinates"][1],
             e["geometry"]["coordinates"][0]) for e in d["features"]
            if e["properties"]["mag"] is not None and e["properties"].get("type", "earthquake") == "earthquake"]

DAY, K = 1440, 364
alerts = []
for r in J:
    c = CARDS[int(r["i"])]
    alerts.append({"i": int(r["i"]), "t": c["t"], "L": c["lt"], "pts": points(c["g"]), "cluster": r["cluster"]})
clusters = collections.defaultdict(list)
for a in alerts: clusters[a["cluster"]].append(a)
assert len(clusters) == 63

for key in sorted(clusters):
    A = clusters[key]
    P = [p for a in A for p in a["pts"]]
    c = (sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P))
    rad = 300 + max(km(c, p) for p in P)
    t0, t1 = min(a["t"] for a in A) - (K + 2) * DAY, max(a["t"] + a["L"] for a in A)
    ev, q = [], t0
    while q < t1:
        ev += fetch(c[0], c[1], rad, q, min(q + 91 * DAY, t1)); q += 91 * DAY
    ev = sorted(set(ev))
    for a in A:
        near = [(e[0], e[1], min(km((e[2], e[3]), p) for p in a["pts"])) for e in ev]
        a["ev"] = [x for x in near if x[2] <= 300]
        a["T"] = [x[0] for x in a["ev"]]

FLOORS, RADII, WINS = (2.0, 3.0, 4.0, 4.5), (25, 50, 100, 200, 300), ("strict", "day")
def meets(a, F, R, w, k):
    t = a["t"] - k * DAY
    lo, hi = (t - 10, t + a["L"]) if w == "strict" else (t - DAY, t + a["L"] + DAY)
    for e in a["ev"][bisect.bisect_left(a["T"], lo):bisect.bisect_right(a["T"], hi)]:
        if e[2] <= R and e[1] >= F - 1e-9: return True
    return False

dom = {}
for F in FLOORS:
    for R in RADII:
        for w in WINS:
            key = f"{F}|{R}|{w}"
            per_k = [sum(meets(a, F, R, w, k) for a in alerts) for k in range(1, K + 1)]
            mean = sum(per_k) / K / len(alerts)
            f29 = R29["domains"][key]
            dom[key] = {"k364": per_k[-1], "k364_plate11": P11["grid"][key]["placebo"], "mean_share": round(mean, 4),
                        "quiet_mean": mean <= 0.05, "field_mean_share": round(f29["mean_share"], 4),
                        "field_quiet_mean": f29["quiet_mean"]}

agree = [k for k, v in dom.items() if v["quiet_mean"] == v["field_quiet_mean"]]
quiet_mine = {k for k, v in dom.items() if v["quiet_mean"]}
quiet_f1 = {k for k, v in R29["domains"].items() if k.startswith("1.0|") and v["quiet_mean"]}
quiet = quiet_mine | quiet_f1
g = P11["grid"]
lo = min(quiet, key=lambda k: (g[k]["warranted"], k)); hi = max(quiet, key=lambda k: (g[k]["warranted"], k))
old = {k for k, v in g.items() if v["placebo"] <= 0.05 * 155 and not k.startswith("any")}
out = {
    "_note": "Plate XI's quiet domains re-decided over 364 year-earlier days (the Field's rule), by a second fetch. Generated by plate11b.py.",
    "field": {"commit": "2a153c7", "file": "artifacts/2026-10-14-the-warnings-never-needed/s29/data/results_29.json",
              "sha256": R29_SHA, "handoff": "ho-2026-10-19-field-9"},
    "domains": dom, "agree_with_field": len(agree), "of": len(dom),
    "max_abs_diff_mean_share": round(max(abs(v["mean_share"] - v["field_mean_share"]) for v in dom.values()), 4),
    "quiet_before": sorted(old), "quiet_after": sorted(quiet), "floor1_from_field": sorted(quiet_f1),
    "left": sorted(old - quiet), "joined": sorted(quiet - old),
    "least": [lo, g[lo]], "most": [hi, g[hi]], "least_before": P11["quiet_domains"]["least"],
    "fetched": "2026-10-20", "queries": len(FETCHED), "events": sum(f["events"] for f in FETCHED), "manifest": FETCHED,
}
(HERE / "plate11b.json").write_text(json.dumps(out, indent=1))
with open(HERE / "plate11b.js", "w") as f:
    f.write("// generated by plate11b.py: plate XI's quiet domains over 364 year-earlier days (the Field's study 29 rule), second fetch\n")
    f.write("const P11B=" + json.dumps({k: v for k, v in out.items() if k != "manifest"}, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("agree_with_field", "of", "max_abs_diff_mean_share", "left", "joined", "least", "most", "least_before", "queries", "events")}, indent=1))
for k in ("2.0|200|strict", "2.0|300|strict", "4.5|200|day", "4.5|300|day"): print(k, dom[k])
