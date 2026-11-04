"""Study 27, part A: the register not joined, joined (PREREGISTRATION-27.md).

The undeclared warnings study 24 classed `register_unjoined` (earthquake or tsunami) are split by
their words; earthquake warnings are joined to USGS ComCat (FDSN event service): met if an event of
M >= 3.0 lies within 100 km of the internal point of a named county (US Census 2023 Gazetteer) with
origin in [t - 24 h, t + L + 24 h]. Placebo: moved back 364 days. Strict: [t - 10 min, t + L].
Sensitivities: M >= 4.5; 200 km. Cluster bootstrap over (first county, UTC day), 2,000, seed 27.
ComCat is fetched once per year 2018-2026 (M >= 3.0, contiguous-US box), digests in data/sources_27.json.

Usage: python3 -I join_27.py STUDIO_DATA_JS GAZETTEER_TXT CACHE_DIR
"""
import json, sys, re, gzip, csv, hashlib, math, random, time, urllib.request, urllib.parse, datetime
from pathlib import Path

HERE = Path(__file__).parent
raw = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(raw).hexdigest() == "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
s = raw.decode()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
GAZ = {}
for r in csv.DictReader(open(sys.argv[2], encoding="utf-8"), delimiter="\t"):
    r = {k.strip(): v.strip() for k, v in r.items()}
    GAZ[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))
CACHE = Path(sys.argv[3]); CACHE.mkdir(exist_ok=True)
W = list(csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t"))
POOL = [w for w in W if w["group"] == "undeclared" and int(w["t_min"]) < 29583360 and w["status"] == "register_unjoined"]
assert len(POOL) == 174
TSU = re.compile(r"tsunami", re.I)

def km(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    return 6371.0 * math.acos(min(1, math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl)))

def iso(m):
    return datetime.datetime.fromtimestamp(m * 60, datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

BOX = (24.0, 50.0, -125.5, -66.0)   # contiguous US; every earthquake warning's counties lie inside (asserted)
def year_file(y):
    q = {"format": "geojson", "starttime": f"{y}-01-01T00:00:00", "endtime": f"{y + 1}-01-01T00:00:00", "minmagnitude": "3.0",
         "minlatitude": BOX[0], "maxlatitude": BOX[1], "minlongitude": BOX[2], "maxlongitude": BOX[3], "orderby": "time-asc"}
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    f = CACHE / f"comcat_{y}.json"
    if not f.exists():
        for k in range(4):
            try:
                f.write_bytes(urllib.request.urlopen(url, timeout=300).read()); break
            except Exception:
                if k == 3: raise
                time.sleep(2 ** (k + 1))
    d = json.loads(f.read_text())
    assert len(d["features"]) < 20000, y
    MANIFEST[y] = {"url": url, "sha256": hashlib.sha256(f.read_bytes()).hexdigest(), "events": len(d["features"])}
    return [(e["id"], e["properties"]["time"] / 60000, e["properties"]["mag"], e["geometry"]["coordinates"][1],
             e["geometry"]["coordinates"][0]) for e in d["features"]]
MANIFEST, CAT = {}, []
for y in range(2018, 2027):
    CAT += year_file(y)
def fetch(pts, t0, t1):
    assert all(BOX[0] <= p[0] <= BOX[1] and BOX[2] <= p[1] <= BOX[3] for p in pts)
    return "", [e for e in CAT if t0 <= e[1] <= t1]

def points(counties):
    # A whole-state code (SS000) stands for every county of that state (deviation, recorded in the page).
    out = []
    for g in counties.split(","):
        out += [GAZ[g]] if g in GAZ else ([v for k, v in GAZ.items() if k[:2] == g[:2]] if g.endswith("000") else [])
    return out

rows, events = [], {}
for w in POOL:
    k = CARDS[int(w["i"])]
    kind = "tsunami" if TSU.search(k["w"]) else "earthquake"
    if kind == "tsunami":
        rows.append({"i": w["i"], "code": k["c"], "kind": kind}); continue
    pts = points(w["counties"])
    assert pts, w
    t, L = int(w["t_min"]), int(w["life_min"])
    out = {"i": w["i"], "code": k["c"], "kind": kind, "cluster": w["counties"].split(",")[0] + "|" + str(t // 1440), "t": t, "L": L}
    for arm, sh in (("live", 0), ("placebo", 364 * 1440)):
        url, ev = fetch(pts, t - sh - 1440, t - sh + L + 1440)
        def hit(mmin, rad, lo, hi):
            best = None
            for e in ev:
                if e[2] is None or e[2] < mmin or not (lo <= e[1] <= hi): continue
                d = min(km((e[3], e[4]), p) for p in pts)
                if d <= rad and (best is None or e[2] > best[2]): best = e
            return best
        lo, hi = t - sh - 1440, t - sh + L + 1440
        b = hit(3.0, 100, lo, hi)
        out[arm] = int(b is not None)
        out[arm + "_strict"] = int(hit(3.0, 100, t - sh - 10, t - sh + L) is not None)
        out[arm + "_m45"] = int(hit(4.5, 100, lo, hi) is not None)
        out[arm + "_r200"] = int(hit(3.0, 200, lo, hi) is not None)
        if arm == "live":
            sb = hit(3.0, 100, t - 10, t + L)
            for e in (b, sb):
                if e: events[e[0]] = {"time_utc": iso(e[1]), "mag": e[2], "lat": e[3], "lon": e[4]}
            out["event"] = b[0] if b else ""
            out["strict_event"] = sb[0] if sb else ""
            out["strict_lag_min"] = round(t - sb[1], 1) if sb else ""
    rows.append(out)

EQ = [r for r in rows if r["kind"] == "earthquake"]
def boot(rs, key):
    cl = {}
    for r in rs: cl.setdefault(r["cluster"], []).append(r)
    ks = sorted(cl); rnd = random.Random(27); vals = []
    for _ in range(2000):
        pick = [rnd.choice(ks) for _ in ks]
        n = sum(len(cl[c]) for c in pick)
        vals.append(sum(key(r) for c in pick for r in cl[c]) / n)
    vals.sort(); return [vals[49], vals[1949]]
def summ(rs):
    n = len(rs)
    d = {"n": n, "clusters": len(set(r["cluster"] for r in rs))}
    for k in ("live", "placebo", "live_strict", "placebo_strict", "live_m45", "placebo_m45", "live_r200", "placebo_r200"):
        d[k] = sum(r[k] for r in rs); d[k + "_rate"] = d[k] / n
    d["live_ci"] = boot(rs, lambda r: r["live"]); d["placebo_ci"] = boot(rs, lambda r: r["placebo"])
    d["excess"] = d["live_rate"] - d["placebo_rate"]; d["excess_ci"] = boot(rs, lambda r: r["live"] - r["placebo"])
    return d
res = {"pool": len(POOL), "tsunami": sum(r["kind"] == "tsunami" for r in rows), "earthquake": summ(EQ),
       "eqw": summ([r for r in EQ if r["code"] == "EQW"]), "local": summ([r for r in EQ if r["code"] != "EQW"])}
e = res["earthquake"]
res["predictions"] = {"P1": {"held": e["live_rate"] >= 0.80, "value": e["live_rate"]},
                      "P2": {"held": e["placebo_rate"] <= 0.25 and e["excess"] >= 0.50, "value": [e["placebo_rate"], e["excess"]]},
                      "P3": {"held": res["eqw"]["live_rate"] >= res["local"]["live_rate"], "value": [res["eqw"]["live_rate"], res["local"]["live_rate"]]}}
res["unmet_live_ids"] = [int(r["i"]) for r in EQ if not r["live"]]
res["unmet_strict_ids"] = [int(r["i"]) for r in EQ if not r["live_strict"]]
(HERE / "data" / "results_27.json").write_text(json.dumps(res, indent=1))
with gzip.open(HERE / "data" / "joined_27.tsv.gz", "wt") as f:
    cols = ["i", "code", "kind", "cluster", "t", "L", "live", "placebo", "live_strict", "placebo_strict", "live_m45", "placebo_m45",
            "live_r200", "placebo_r200", "event", "strict_event", "strict_lag_min"]
    f.write("\t".join(cols) + "\n")
    for r in rows: f.write("\t".join(str(r.get(c, "")) for c in cols) + "\n")
(HERE / "data" / "sources_27.json").write_text(json.dumps({"comcat_years": MANIFEST, "gazetteer": "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip (zip sha256 919df59ba90759cce85468c0337e898e4b39c08eaffce86ddd88fa41f1f7f0c8)", "warnings": "studio@40b163d works/2026-10-16-filed-under/data.js sha256 3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef", "fetched": "2026-10-19"}, indent=1))
(HERE / "data" / "events_27.json").write_text(json.dumps(events, indent=1, sort_keys=True))
print(json.dumps({k: v for k, v in res.items() if not k.startswith("unmet")}, indent=1))
print("unmet live", len(res["unmet_live_ids"]), "unmet strict", len(res["unmet_strict_ids"]))
