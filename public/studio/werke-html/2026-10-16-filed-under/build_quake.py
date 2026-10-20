"""FILED UNDER, the quake register (session 185, 2026-10-19): the seismic record answers "never needed".

Session 183 gave the desk a lower record, NOAA's Storm Events, and left one class of warning answered
"that register is not joined here": the warnings whose words name an earthquake or a tsunami. The Field
joined the earthquake ones to the USGS catalogue in its study 27 (offered to the Studio in its bulletin of
2026-10-19, joined_27.tsv.gz). This script joins them again by the Studio's own route, and keeps for each
warning the quake the record holds, so the card can show it.

The Studio's route differs from the Field's on purpose:
- the Field fetched one file per year inside a box around the contiguous US and measured on a sphere;
  here ComCat is asked once per warning, with no box (offshore and border quakes included), around the
  warning's own counties, and distances are measured on the WGS84 ellipsoid (Vincenty).
- the warning's counties and the life its keeper gave it are read from this work's own data.js
  (card fields g and lt), not from the Field's tables.

Rules.
- Pool: every card that below.js marks "unjoined" (its words name an earthquake or a tsunami: the
  Field's classify_24.py, as in session 183). Words naming a tsunami stay unjoined: a tsunami's danger
  is kept by tide gauges, not by an earthquake catalogue. The rest are the earthquake warnings.
- Places: the internal point of each named county (US Census 2023 Gazetteer). A whole-state code
  (SS000) stands for every county of the state, as in the Field's study 27.
- Window: from a day before the warning was sent to a day after the life its keeper gave it.
- met (the Field's rule, kept so the two joins can be compared): an event of magnitude 3.0 or more with
  its epicentre within 100 km of a named county's point. The card shows the largest such event.
- near (the Studio's, declared here before the wider answer was read): not met, but the catalogue
  holds an event of magnitude 2.5 or more within 300 km. A quake stood near; the fixed rule did not
  reach it. The desk does not decide which is at fault, the rule or the alert.
- none (the Studio's): no event of magnitude 2.5 or more within 300 km in the window. The record of a
  network that keeps nearly every quake of that size in these states holds nothing that could have set
  the alert off. Only here does the desk back "never needed".
- Added after the first run was read (session 185, the same night), and marked so: the "none" rule
  above backed no warning, because in these states a quake of 2.5 or more lies within 300 km on nearly
  any two days. So the card also states one fact that does not move its verdict: whether the catalogue
  holds an event of 2.5 or more within 300 km in the ten minutes before the minute the alert was sent
  (field "m10": the largest such event, or none). A ShakeAlert goes out seconds after a quake begins.
- What the card shows for "near": the largest event within 300 km in the window (changed from "the
  nearest" before anything was published: the nearest was often a small quake hours away, while the
  quake that set the alert off was larger and farther).

Usage: python3 -I build_quake.py GAZETTEER_TXT CACHE_DIR FIELD_JOINED_27_TSV_GZ
Writes quake.js (loaded by index.html) and quake_summary.json.
"""
import csv, gzip, json, math, re, sys, time, hashlib, collections, datetime as dt
import urllib.request, urllib.parse
from pathlib import Path

HERE = Path(__file__).parent
GAZ_TXT, CACHE, FIELD = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
CACHE.mkdir(exist_ok=True)
DAY = 1440

raw = (HERE / "data.js").read_text()
CARDS = json.loads(raw[raw.index("window.CARDS=") + 13:].strip().rstrip(";"))
b = (HERE / "below.js").read_text()
BELOW = json.loads(b[b.index("window.BELOW=") + 13:].strip().rstrip(";"))
assert len(CARDS) == len(BELOW) == 13371

GAZ = {}
for r in csv.DictReader(open(GAZ_TXT, encoding="utf-8"), delimiter="\t"):
    r = {k.strip(): v.strip() for k, v in r.items()}
    GAZ[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))

def places(g):
    out = []
    for c in g:
        if c in GAZ: out.append(GAZ[c])
        elif c.endswith("000"): out += [v for k, v in GAZ.items() if k[:2] == c[:2]]
    return out

def vincenty(p, q):
    """km on the WGS84 ellipsoid"""
    a, f = 6378.137, 1 / 298.257223563
    b_ = a * (1 - f)
    L = math.radians(q[1] - p[1])
    U1, U2 = math.atan((1 - f) * math.tan(math.radians(p[0]))), math.atan((1 - f) * math.tan(math.radians(q[0])))
    sU1, cU1, sU2, cU2 = math.sin(U1), math.cos(U1), math.sin(U2), math.cos(U2)
    lam = L
    for _ in range(200):
        sl, cl = math.sin(lam), math.cos(lam)
        ss = math.hypot(cU2 * sl, cU1 * sU2 - sU1 * cU2 * cl)
        if ss == 0: return 0.0
        cs = sU1 * sU2 + cU1 * cU2 * cl
        sg = math.atan2(ss, cs)
        sa = cU1 * cU2 * sl / ss
        c2a = 1 - sa * sa
        c2m = cs - 2 * sU1 * sU2 / c2a if c2a else 0
        C = f / 16 * c2a * (4 + f * (4 - 3 * c2a))
        prev, lam = lam, L + (1 - C) * f * sa * (sg + C * ss * (c2m + C * cs * (-1 + 2 * c2m * c2m)))
        if abs(lam - prev) < 1e-12: break
    u2 = c2a * (a * a - b_ * b_) / (b_ * b_)
    A = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)))
    B = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)))
    ds = B * ss * (c2m + B / 4 * (cs * (-1 + 2 * c2m * c2m) - B / 6 * c2m * (-3 + 4 * ss * ss) * (-3 + 4 * c2m * c2m)))
    return b_ * A * (sg - ds)

def iso(m):
    return dt.datetime.fromtimestamp(m * 60, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

MANIFEST = {}
def ask(i, pts, lo, hi):
    """one ComCat query per warning: every event of M >= 2.5 in a box 3.5 degrees around its places"""
    la, lo_ = [p[0] for p in pts], [p[1] for p in pts]
    q = {"format": "geojson", "starttime": iso(lo), "endtime": iso(hi), "minmagnitude": "2.5",
         "minlatitude": f"{min(la) - 3.5:.2f}", "maxlatitude": f"{max(la) + 3.5:.2f}",
         "minlongitude": f"{min(lo_) - 4.5:.2f}", "maxlongitude": f"{max(lo_) + 4.5:.2f}", "orderby": "time-asc"}
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    f = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:20] + ".json")
    if not f.exists():
        for k in range(5):
            try:
                f.write_bytes(urllib.request.urlopen(url, timeout=120).read()); break
            except Exception:
                if k == 4: raise
                time.sleep(2 ** (k + 1))
        time.sleep(0.3)
    MANIFEST[i] = {"url": url, "sha256": hashlib.sha256(f.read_bytes()).hexdigest()}
    d = json.loads(f.read_text())
    assert len(d["features"]) < 20000
    return [{"id": e["id"], "t": e["properties"]["time"] / 60000, "mag": e["properties"]["mag"],
             "place": e["properties"].get("place") or "", "lat": e["geometry"]["coordinates"][1],
             "lon": e["geometry"]["coordinates"][0]} for e in d["features"]]

TSU = re.compile(r"tsunami", re.I)
quake, k = {}, collections.Counter()
for i, (c, bl) in enumerate(zip(CARDS, BELOW)):
    if bl["s"] != "unjoined": continue
    if TSU.search(c["w"]):
        quake[i] = {"s": "tsunami"}; k["tsunami"] += 1; continue
    pts = places(c["g"]); assert pts, i
    t, L = c["t"], c["lt"] or 0
    lo, hi = t - DAY, t + L + DAY
    ev = [e for e in ask(i, pts, lo, hi) if e["mag"] is not None and lo <= e["t"] <= hi]
    for e in ev: e["km"] = min(vincenty((e["lat"], e["lon"]), p) for p in pts)
    met = [e for e in ev if e["mag"] >= 3.0 and e["km"] <= 100]
    near = [e for e in ev if e["mag"] >= 2.5 and e["km"] <= 300]
    if met: s, e = "met", max(met, key=lambda e: (e["mag"], -e["km"]))
    elif near: s, e = "near", max(near, key=lambda e: (e["mag"], -e["km"]))
    else: s, e = "none", None
    rec = {"s": s}
    if e:
        rec["e"] = {"id": e["id"], "m": round(e["mag"], 2), "km": round(e["km"]), "place": e["place"],
                    "t": round(e["t"], 2), "lag": round(e["t"] - t, 1)}
        rec["n"] = len(met) if s == "met" else len(near)
    if s != "met":
        m10 = [e for e in near if t - 10 <= e["t"] <= t + 1]
        rec["m10"] = None
        if m10:
            e10 = max(m10, key=lambda e: e["mag"])
            rec["m10"] = {"id": e10["id"], "m": round(e10["mag"], 2), "km": round(e10["km"]), "place": e10["place"], "lag": round(e10["t"] - t, 1)}
        k[s + "|minute_" + ("quake" if m10 else "quiet")] += 1
    quake[i] = rec
    k[s] += 1
    k[s + "|" + ("declared" if c["dn"] or c["nn"] == "contradicted" else "undeclared")] += 1
    k[s + "|" + ("EQW" if c["c"] == "EQW" else "local")] += 1

# the Field's join, compared on every warning both scored (its frame ends 2026-04-01)
field = {int(r["i"]): r for r in csv.DictReader(gzip.open(FIELD, "rt"), delimiter="\t")}
cmp = collections.Counter(); differ = []
for i, r in field.items():
    if r["kind"] != "earthquake":
        cmp["tsunami_both" if quake.get(i, {}).get("s") == "tsunami" else "kind_differs"] += 1; continue
    q = quake.get(i)
    if q is None: cmp["not_in_pool"] += 1; continue
    same = (q["s"] == "met") == (r["live"] == "1")
    cmp["met_same" if same else "met_differs"] += 1
    if not same: differ.append({"i": i, "studio": q["s"], "field_live": r["live"], "studio_event": q.get("e", {}).get("id"), "field_event": r["event"]})
    elif q["s"] == "met" and q["e"]["id"] != r["event"]: cmp["same_verdict_other_event"] += 1
cmp["studio_only_after_field_frame"] = sum(1 for i in quake if i not in field)

summary = {
    "built": "2026-10-19 (session 185)",
    "sources": {"comcat": "https://earthquake.usgs.gov/fdsnws/event/1/ (USGS, public domain), one query per warning; urls and sha256 per warning in queries",
                "gazetteer": "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_counties_national.zip (zip sha256 919df59ba90759cce85468c0337e898e4b39c08eaffce86ddd88fa41f1f7f0c8)",
                "field_joined_27": {"repo": "frankbueltge/field-research", "path": "artifacts/2026-10-14-the-warnings-never-needed/s27/data/joined_27.tsv.gz",
                                    "sha256": hashlib.sha256(FIELD.read_bytes()).hexdigest()},
                "fetched": "2026-10-19"},
    "pool": len(quake), "counts": dict(sorted(k.items())),
    "check_against_field_joined_27": {**dict(sorted(cmp.items())), "differing": differ},
    "backed_never_needed": sorted(i for i, q in quake.items() if q["s"] == "none"),
    "queries": {str(i): v for i, v in sorted(MANIFEST.items())},
}
(HERE / "quake_summary.json").write_text(json.dumps(summary, indent=1))
(HERE / "quake.js").write_text("// generated by build_quake.py from the USGS earthquake catalogue (ComCat, public domain); see quake_summary.json\n"
                               "window.QUAKE=" + json.dumps({str(i): q for i, q in sorted(quake.items())}, separators=(",", ":")) + ";\n")
print(json.dumps({k: v for k, v in summary.items() if k != "queries"}, indent=1))
