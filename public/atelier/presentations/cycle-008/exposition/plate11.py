"""Plate XI, The Warranted Closure. Built on the Field's study 27 (field-research@116006a,
artifacts/2026-10-14-the-warnings-never-needed/s27/data/, sha256 of each input asserted), offered to this
practice in the Field's bulletin of 2026-10-19 (s212) as an answer to plate IX: of 155 undeclared earthquake
messages in the Studio's FILED UNDER (151 of them USGS ShakeAlerts), 136 were met by a ComCat event of M3+
within 100 km and a day, and three alerts in two episodes have no earthquake behind them, "a closed world
that is warranted". Plate IX had found that no reading of Storm Events backs "never needed", and that
Reiter's warrant, "total knowledge about the domain being represented" (Reiter, UBC TR 77-16, 1977, p. 6),
fails where a register keeps a kind sparsely.

The question this plate asks of the Field's answer is not the Field's. Reiter's warrant is knowledge total
over a *domain*. Which domain? A seismic catalogue is complete only above some magnitude, within some
distance, for some window, and the plate lets the visitor declare all three. Under each declared domain the
closure is warranted only where the catalogue keeps that domain completely. The plate counts, for each
domain, what it makes of the 155: met, never needed with a warrant, never needed without one; and how often
the same domain "meets" the same counties a year earlier.

Nothing of the Field's is rescored: its pool and its verdicts are read from joined_27.tsv.gz as published.
The catalogue is fetched here by a second path (one circle query per Field cluster, at every magnitude,
where the Field fetched M3+ in a contiguous-US box), and the Field's own rule is recomputed from it as a
check; disagreements are listed, not resolved.

The rules (2026-10-19, fourth session; which were fixed before counting is said at the end):
  pool       the 155 rows of joined_27.tsv.gz whose kind is earthquake.
  places     each card's county codes (the Studio's data.js), at the internal points of the US Census 2023
             Gazetteer (the Field's file, sha256 asserted); a state code SS000 stands for all its counties.
  catalogue  USGS ComCat, FDSN event service, every magnitude, one query per Field cluster: a circle about
             the mean of the cluster's points, radius 300 km plus the farthest point, from 30 days before
             the cluster's first alert to a day after its last alert ends; and the same 364 days earlier
             (placebo), from a day before to a day after.
  a domain   floor F (any, M1, M2, M3, M4, M4.5) x radius R (25, 50, 100, 200, 300 km from any named
             county's point) x window W (strict: [t - 10 min, t + L]; day: [t - 24 h, t + L + 24 h]).
             The Field's rule is F = M3, R = 100, W = day.
  met        an event of magnitude >= F within R and W.
  warrant    the catalogue's completeness magnitude at the alert, Mc: of the events within 300 km of its
             points in the 30 days before it, the 0.1-magnitude bin that holds most events, plus 0.2 (the
             maximum-curvature estimate with a fixed margin; crude, an estimate, mixed magnitude types).
             An unmet alert is NEVER NEEDED, WARRANTED if F >= Mc; NEVER NEEDED, UNWARRANTED if F < Mc
             (the closure presumes knowledge below what the catalogue keeps completely). With fewer than 50
             such events the warrant is UNTESTED and counted as unwarranted.
  placebo    the same domain applied to the year-earlier fetch: the share of alerts a domain "meets" by
             coincidence.
  quiet domains  the domains whose year-earlier "meetings" are at most 5 % of the pool (coincidence held
             low) and that set a floor; the plate reports the least and the most "never needed, warranted" among them.
  robust     an alert that is unmet under every domain whose floor is warranted at it (all windows; and,
             separately, the strict window alone).
  retractions  the only rows in the 13,371 that could write "never needed" positively are messages that
             take a warning back. Two sweeps of the words (SWEEP_1, SWEEP_2 below; the second written after
             the first's messages were read, to catch other phrasings),
             select 117 messages; each was read by one reader (this practice) and a retraction is a message
             that says a warning, its siren or its area was sent or sounded in error, or that there is no
             emergency after one was signalled. Lifted orders ("cancelled", the danger over) are not
             retractions: they say the need ended, not that there was none. The ids are listed by hand in
             RETRACTIONS; the sweeps' counts are asserted.

Fixed before any catalogue record was fetched: pool, places, catalogue, domains, met, warrant, placebo, and
robust over all windows. Added after the first run, in the same session, and so not fixed before counting:
robust in the strict window alone, the quiet domains, and the retractions (whose second sweep was written
after the first sweep's messages had been read).

Usage: python3 -I plate11.py STUDIO_DATA_JS FIELD_S27_DATA_DIR GAZETTEER_TXT CACHE_DIR
       (writes plate11.json and plate11.js beside itself)
"""
import json, sys, csv, gzip, hashlib, math, time, collections, urllib.request, urllib.parse, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
SRC, D, GZT, CACHE = (Path(a) for a in sys.argv[1:5])
CACHE.mkdir(exist_ok=True)
SHA_STUDIO = "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
FIELD = "116006a3cd71f642a7e4fb75936f6815f086538a"
SHA = {"joined_27.tsv.gz": "d3d4658fbba1724fa92d7ab3787b88223ea39c09b8f5e545d4488f8ed29dec59",
       "results_27.json": "2133f17064aacf2b8d37a841b76c2d8ff1e72876a2223da1575591c16d4c0ce0"}
raw = SRC.read_bytes()
assert hashlib.sha256(raw).hexdigest() == SHA_STUDIO, "not the Studio's data.js at 40b163d"
for f, h in SHA.items():
    assert hashlib.sha256((D / f).read_bytes()).hexdigest() == h, f + " is not the Field's file at 116006a"
s = raw.decode()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
assert len(CARDS) == 13371
R27 = json.load(open(D / "results_27.json"))
J = [r for r in csv.DictReader(gzip.open(D / "joined_27.tsv.gz", "rt"), delimiter="\t") if r["kind"] == "earthquake"]
assert len(J) == R27["earthquake"]["n"] == 155 and sum(int(r["live"]) for r in J) == R27["earthquake"]["live"] == 136
assert sum(int(r["placebo"]) for r in J) == R27["earthquake"]["placebo"] == 28

GAZ = {}
gtxt = GZT.read_bytes()
for r in csv.DictReader(gtxt.decode("utf-8").splitlines(), delimiter="\t"):
    r = {k.strip(): v.strip() for k, v in r.items()}
    GAZ[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))

def km(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    return 6371.0 * math.acos(max(-1, min(1, math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(dl))))

def points(codes):
    out = []
    for g in codes:
        out += [GAZ[g]] if g in GAZ else ([v for k, v in GAZ.items() if k[:2] == g[:2]] if g.endswith("000") else [])
    return out

def iso(m):
    return dt.datetime.fromtimestamp(m * 60, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

FETCHED = {}
def fetch(lat, lon, rad, t0, t1, tag):
    q = {"format": "geojson", "starttime": iso(t0), "endtime": iso(t1), "latitude": f"{lat:.4f}",
         "longitude": f"{lon:.4f}", "maxradiuskm": f"{rad:.1f}", "orderby": "time-asc"}
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
    FETCHED[tag] = {"url": url, "sha256": hashlib.sha256(b).hexdigest(), "events": len(d["features"])}
    return [(e["id"], e["properties"]["time"] / 60000, e["properties"]["mag"], e["geometry"]["coordinates"][1],
             e["geometry"]["coordinates"][0], e["properties"].get("place") or "") for e in d["features"]
            if e["properties"]["mag"] is not None and e["properties"].get("type", "earthquake") == "earthquake"]

DAY, YEAR = 1440, 364 * 1440
alerts = []
for r in J:
    i = int(r["i"]); c = CARDS[i]
    pts = points(c["g"]); assert pts, i
    assert int(r["t"]) == c["t"] and int(r["L"]) == c["lt"], i
    alerts.append({"i": i, "t": c["t"], "L": c["lt"], "pts": pts, "cluster": r["cluster"], "code": r["code"],
                   "field": {k: int(r[k]) for k in ("live", "placebo", "live_strict", "live_m45", "live_r200")},
                   "field_event": r["event"]})
clusters = collections.defaultdict(list)
for a in alerts:
    clusters[a["cluster"]].append(a)
assert len(clusters) == R27["earthquake"]["clusters"] == 63

for key in sorted(clusters):
    A = clusters[key]
    P = [p for a in A for p in a["pts"]]
    c = (sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P))
    rad = 300 + max(km(c, p) for p in P)
    t0, t1 = min(a["t"] for a in A), max(a["t"] + a["L"] for a in A)
    live = fetch(c[0], c[1], rad, t0 - 30 * DAY, t1 + DAY, key + "|live")
    plac = fetch(c[0], c[1], rad, t0 - YEAR - DAY, t1 - YEAR + DAY, key + "|placebo")
    for a in A:
        a["ev"] = [(e, min(km((e[3], e[4]), p) for p in a["pts"])) for e in live]
        a["evp"] = [(e, min(km((e[3], e[4]), p) for p in a["pts"])) for e in plac]

FLOORS = [None, 1.0, 2.0, 3.0, 4.0, 4.5]
RADII = [25, 50, 100, 200, 300]
WINS = ["strict", "day"]
def window(a, w, shift=0):
    t = a["t"] - shift
    return (t - 10, t + a["L"]) if w == "strict" else (t - DAY, t + a["L"] + DAY)
def meets(evs, a, F, R, w, shift=0):
    lo, hi = window(a, w, shift)
    best = None
    for e, d in evs:
        if d <= R and lo <= e[1] <= hi and (F is None or e[2] >= F - 1e-9):
            if best is None or e[2] > best[0][2]: best = (e, d)
    return best

for a in alerts:
    prior = [e[2] for e, d in a["ev"] if d <= 300 and a["t"] - 30 * DAY <= e[1] < a["t"] - 10]
    a["n_prior"] = len(prior)
    if len(prior) >= 50:
        bins = collections.Counter(round(math.floor(m * 10 + 1e-9) / 10, 1) for m in prior)
        top = max(bins.values())
        a["mc"] = round(min(b for b, n in bins.items() if n == top) + 0.2, 1)
    else:
        a["mc"] = None

# the Field's rule, recomputed from this fetch: F = 3, R = 100, W = day; strict; M4.5; 200 km
check = {"live": (3.0, 100, "day"), "live_strict": (3.0, 100, "strict"), "live_m45": (4.5, 100, "day"),
         "live_r200": (3.0, 200, "day")}
disagree = collections.defaultdict(list)
for a in alerts:
    for k, (F, R, w) in check.items():
        mine = 1 if meets(a["ev"], a, F, R, w) else 0
        if mine != a["field"][k]: disagree[k].append(a["i"])
    if (1 if meets(a["evp"], a, 3.0, 100, "day", YEAR) else 0) != a["field"]["placebo"]:
        disagree["placebo"].append(a["i"])

def verdict(a, F, R, w):
    m = meets(a["ev"], a, F, R, w)
    if m: return "met", m
    if a["mc"] is not None and F is not None and F >= a["mc"] - 1e-9: return "warranted", None
    return "unwarranted", None

grid = {}
for F in FLOORS:
    for R in RADII:
        for w in WINS:
            cnt = collections.Counter(verdict(a, F, R, w)[0] for a in alerts)
            pl = sum(1 for a in alerts if meets(a["evp"], a, F, R, w, YEAR))
            grid[f"{F if F is not None else 'any'}|{R}|{w}"] = {"met": cnt["met"], "warranted": cnt["warranted"],
                                                               "unwarranted": cnt["unwarranted"], "placebo": pl}
robust = []
for a in alerts:
    doms = [(F, R, w) for F in FLOORS for R in RADII for w in WINS
            if F is not None and a["mc"] is not None and F >= a["mc"] - 1e-9]
    if doms and all(not meets(a["ev"], a, F, R, w) for F, R, w in doms):
        robust.append(a["i"])

quiet = {k: v for k, v in grid.items() if v["placebo"] <= 0.05 * len(alerts) and not k.startswith("any")}
lo = min(quiet, key=lambda k: (quiet[k]["warranted"], k)); hi = max(quiet, key=lambda k: (quiet[k]["warranted"], k))
quiet_summary = {"n_domains": len(quiet), "of": len(grid), "least": [lo, quiet[lo]], "most": [hi, quiet[hi]],
                 "range_all": [min(v["warranted"] for v in grid.values()), max(v["warranted"] for v in grid.values())]}
robust_strict = []
for a in alerts:
    doms = [(F, R) for F in FLOORS for R in RADII if F is not None and a["mc"] is not None and F >= a["mc"] - 1e-9]
    if doms and all(not meets(a["ev"], a, F, R, "strict") for F, R in doms):
        robust_strict.append(a["i"])

def nearest(a, w):
    lo, hi = window(a, w)
    c = [(e, d) for e, d in a["ev"] if lo <= e[1] <= hi]
    if not c: return None
    e, d = min(c, key=lambda x: x[1])
    return {"id": e[0], "mag": e[2], "km": round(d, 1), "lag_min": round(e[1] - a["t"], 1), "place": e[5]}

rows = []
for a in alerts:
    per = {}
    for F in FLOORS:
        for R in RADII:
            for w in WINS:
                v, m = verdict(a, F, R, w)
                pv = meets(a["evp"], a, F, R, w, YEAR)
                per[f"{F if F is not None else 'any'}|{R}|{w}"] = ["mwu".index(v[0]), 1 if pv else 0]
    c = CARDS[a["i"]]
    rows.append({"i": a["i"], "code": a["code"], "t": iso(a["t"]), "words": c["w"], "places": c["p"][:4],
                 "mc": a["mc"], "n_prior": a["n_prior"], "near_strict": nearest(a, "strict"),
                 "near_day": nearest(a, "day"), "v": per})

import re
SWEEP_1 = re.compile(r"cancel|all clear|false alarm|in error|disregard|sent by mistake|by mistake|no emergency|no threat|"
                     r"test message|erroneous|mistakenly|accidental", re.I)
SWEEP_2 = re.compile(r"ignore|error|mistak|inadvertent|unintentional|not a real|was a test|this is a test|retract|"
                     r"rescind|no longer|wrong", re.I)
s1 = [i for i, c in enumerate(CARDS) if SWEEP_1.search(c["w"])]
s2 = [i for i, c in enumerate(CARDS) if SWEEP_2.search(c["w"]) and not SWEEP_1.search(c["w"])]
assert (len(s1), len(s2)) == (106, 11)
RETRACTIONS = {   # read by hand, 2026-10-19; kind: siren (a siren or alert set off by mistake), place (sent to
                  # the wrong area or by the wrong sender), error (the message sent in error), and two named
    "siren": [3, 64, 762, 2278, 3131, 4461, 4462, 5121, 7037, 7038],
    "place": [4269, 4751, 6871, 8534, 8535],
    "error": [113, 850, 3568, 12086],
    "missile": [664], "shakealert": [1894]}
ret = sorted(i for v in RETRACTIONS.values() for i in v)
assert set(ret) <= set(s1) | set(s2) and len(ret) == len(set(ret)) == 21
retr = [{"i": i, "kind": k, "code": CARDS[i]["c"], "t": iso(CARDS[i]["t"]), "declared": CARDS[i]["dn"] > 0,
         "words": CARDS[i]["w"], "places": CARDS[i]["p"][:3]} for k, v in RETRACTIONS.items() for i in v]
retr.sort(key=lambda r: r["t"])

mcs = [a["mc"] for a in alerts if a["mc"] is not None]
out = {
    "source": {"warnings": {"repo": "frankbueltge/studio", "commit": "40b163de16fb5e6b61b69243d7ca78faa5659b1b",
                            "path": "works/2026-10-16-filed-under/data.js", "sha256": SHA_STUDIO},
               "study_27": {"repo": "frankbueltge/field-research", "commit": FIELD,
                            "path": "artifacts/2026-10-14-the-warnings-never-needed/s27/data/", "sha256": SHA},
               "gazetteer_txt_sha256": hashlib.sha256(gtxt).hexdigest(),
               "catalogue": "USGS ComCat, FDSN event service, fetched 2026-10-19; one record per query below",
               "reading": "Reiter, On Closed World Data Bases, UBC TR 77-16 (1977), p. 6",
               "handoff": "the Field's bulletin offer of 2026-10-19 (s212), not yet in the relay"},
    "pool": len(alerts), "clusters": len(clusters),
    "check_against_field": {k: {"rule": list(v), "disagree": disagree[k]} for k, v in check.items()} |
                           {"placebo": {"rule": [3.0, 100, "day", "364 days earlier"], "disagree": disagree["placebo"]}},
    "mc": {"untested": sum(1 for a in alerts if a["mc"] is None), "min": min(mcs), "max": max(mcs),
           "median": sorted(mcs)[len(mcs) // 2]},
    "grid": grid, "robust": robust, "robust_strict": robust_strict, "quiet_domains": quiet_summary,
    "retractions": {"swept": len(s1) + len(s2), "read": len(s1) + len(s2), "retractions": len(ret),
                    "of_cards": len(CARDS), "rows": retr}, "floors": ["any" if F is None else F for F in FLOORS], "radii": RADII,
    "windows": WINS, "queries": FETCHED,
}
json.dump(out, open(HERE / "plate11.json", "w"), indent=1)
with open(HERE / "plate11.js", "w") as f:
    f.write("// generated by plate11.py from the Field's study 27 (field-research@116006a), the Studio's FILED UNDER and USGS ComCat\n")
    f.write("// v[domain] = [verdict (0 met, 1 never needed with a warrant, 2 never needed without one), met a year earlier]\n")
    f.write("const P11=" + json.dumps({k: v for k, v in out.items() if k not in ("source", "queries")}, separators=(",", ":")) + ";\n")
    f.write("const P11R=" + json.dumps(rows, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("pool", "check_against_field", "mc", "robust", "robust_strict")}))
print(quiet_summary)
print(out["retractions"]["retractions"], "retractions of", out["retractions"]["swept"], "read")
for k in ("3.0|100|day", "3.0|100|strict", "any|300|day", "any|25|strict", "1.0|50|strict", "2.0|100|strict", "4.5|100|day"):
    print(k, grid[k])
