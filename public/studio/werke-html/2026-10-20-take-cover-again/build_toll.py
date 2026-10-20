"""TAKE COVER, AGAIN, increment 2: the toll. Join every tornado in the Storm Prediction Center's
final database (2008 to its last year) to the warnings it came under, and to the counties it
touched.

    python3 -I build_toll.py RAW_DIR SPC_CSV

Reads the raw IEM Cow files (for the warning polygons), data.js (built by build_data.py from the
same files; its arrays are rebuilt here and asserted equal) and the SPC file
`1950-2024_actual_tornadoes.csv` (https://www.spc.noaa.gov/wcm/data/; a US government work).
Writes toll.js (for the page), toll.json (the counts) and tollsum.js (the same, for the page).

Conventions (fixed before reading the results; a first, county-based draft of this script was
run once and dropped because the deadliest tracks of 2011 list no county at all, f1-f4 = 0):
- One tornado is one SPC row with sg = 1 (the entire track; since 2008 the file holds nothing else).
  Its track is the straight line from its start point to its end point (a point if no end is
  given). The real path bends; the line is the database's own simplest statement of it.
- SPC times are Central Standard Time all year (tz = 3 on every row since 2008); UTC = CST + 6 h.
- A tornado stands *under* a warning when its track line touches the warning's polygon and it
  began between 15 minutes before the warning was issued and the minute the warning expired as
  issued. Fifteen is fixed here; 0 and 30 are reported beside it, never chosen after.
- A tornado *under no warning* is one that stood under none of the warnings, of any office.
- A tornado's counties are the SPC row's own (f1 to f4, at most four, in its first state; 0 is
  unknown), as UGC codes (state + "C" + three digits). They are used only to show a visitor the
  tornadoes of their county that stood under no warning.
- Toll is the SPC row's own: magnitude (EF since 2007, -9 unknown), path length (miles), width
  (yards), injuries, deaths, for the whole track.
"""
import bisect, csv, json, sys, pathlib, datetime, collections

RAW = pathlib.Path(sys.argv[1]); SPC = sys.argv[2]
HERE = pathlib.Path(__file__).parent
T0 = datetime.datetime(2008, 1, 1, tzinfo=datetime.timezone.utc)
WIN = 15


def mins(s):
    t = datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))
    return int((t - T0).total_seconds() // 60)


# --- the warnings again, in build_data.py's order, now with their polygons
ev = {}
for p in sorted(RAW.glob("cow_*.json")):
    d = json.loads(p.read_text())
    if not d.get("events") or not d["events"].get("features"):
        continue
    for f in d["events"]["features"]:
        q = f["properties"]
        if q["phenomena"] != "TO" or q["significance"] != "W":
            continue
        e = ev.setdefault((q["wfo"], q["year"], q["eventid"]),
                          {"issue": q["issue"], "expire": q["expire"], "met": False, "polys": []})
        e["issue"] = min(e["issue"], q["issue"]); e["expire"] = max(e["expire"], q["expire"])
        e["met"] = e["met"] or bool(q["verify"])
        g = f["geometry"]
        e["polys"] += [ring[0] for ring in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]])]
W = []
for (wfo, year, eid), e in sorted(ev.items()):
    dur = mins(e["expire"]) - mins(e["issue"])
    if 1 <= dur <= 240:
        W.append((mins(e["issue"]), dur, 1 if e["met"] else 0, wfo, e["polys"], f"{year}.{wfo}.TO.W.{eid:04d}"))
W.sort(key=lambda w: (w[0], w[3]))
D = json.loads((HERE / "data.js").read_text()[len("window.TCA="):-2])
assert [w[0] for w in W] == D["issue"] and [w[1] for w in W] == D["dur"] and [w[2] for w in W] == D["met"], \
    "the warnings rebuilt here are data.js's, in its order"
issues = [w[0] for w in W]
bbox = [(min(x for r in w[4] for x, _ in r), min(y for r in w[4] for _, y in r),
         max(x for r in w[4] for x, _ in r), max(y for r in w[4] for _, y in r)) for w in W]
ui = {c[0]: i for i, c in enumerate(D["counties"])}


def inside(x, y, ring):
    c = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            c = not c
    return c


def cross(a, b, c, d):
    def o(p, q, r):
        v = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
        return (v > 0) - (v < 0)
    return o(a, b, c) != o(a, b, d) and o(c, d, a) != o(c, d, b)


def touches(a, b, w):
    x0, y0, x1, y1 = bbox[w]
    if max(a[0], b[0]) < x0 or min(a[0], b[0]) > x1 or max(a[1], b[1]) < y0 or min(a[1], b[1]) > y1:
        return False
    for ring in W[w][4]:
        if inside(a[0], a[1], ring) or inside(b[0], b[1], ring):
            return True
        if a != b and any(cross(a, b, p, q) for p, q in zip(ring, ring[1:] + ring[:1])):
            return True
    return False


# --- the tornadoes
rows = [r for r in csv.DictReader(open(SPC, newline="")) if int(r["yr"]) >= 2008]
assert all(r["tz"] == "3" and r["sg"] == "1" for r in rows), "CST, whole tracks only"
last_day = max(r["date"] for r in rows)
end_db = mins(last_day + "T00:00Z") + 1440
T, hits = [], {}
for r in sorted(rows, key=lambda r: (r["date"], r["time"], r["om"])):
    t = datetime.datetime.fromisoformat(r["date"] + "T" + r["time"]).replace(tzinfo=datetime.timezone.utc)
    m = int((t - T0).total_seconds() // 60) + 360
    a = (float(r["slon"]), float(r["slat"]))
    b = (float(r["elon"]), float(r["elat"])) if float(r["elat"]) != 0 else a
    cs = [ui[u] for u in (f"{r['st']}C{int(r[k]):03d}" for k in ("f1", "f2", "f3", "f4") if int(r[k]) > 0) if u in ui]
    k = len(T)
    T.append([m, int(r["mag"]), round(float(r["len"]), 1), int(r["wid"]), int(r["inj"]), int(r["fat"]), r["st"], cs,
              round(a[1], 3), round(a[0], 3)])
    lo = bisect.bisect_left(issues, m - 240); hi = bisect.bisect_right(issues, m + 30)
    hits[k] = [(w, m - issues[w]) for w in range(lo, hi)
               if issues[w] - 30 <= m <= issues[w] + W[w][1] and touches(a, b, w)]


def by(win):
    wt = collections.defaultdict(list)
    for k, h in hits.items():
        for w, lead in h:
            if lead >= -win:
                wt[w].append(k)
    under = {k for v in wt.values() for k in v}
    db = [w for w in range(len(W)) if issues[w] + W[w][1] <= end_db]
    return wt, under, {
        "tornadoes_under_a_warning": len(under),
        "tornadoes_under_none": len(T) - len(under),
        "deaths_under_a_warning": sum(T[k][5] for k in under),
        "deaths_under_none": sum(T[k][5] for k in range(len(T)) if k not in under),
        "warnings_in_db_years": len(db),
        "met_warnings": sum(W[w][2] for w in db),
        "met_warnings_with_a_tornado": sum(1 for w in db if W[w][2] and wt.get(w)),
        "empty_warnings": sum(1 - W[w][2] for w in db),
        "empty_warnings_with_a_tornado": sum(1 for w in db if not W[w][2] and wt.get(w)),
    }


res = {str(x): by(x)[2] for x in (0, WIN, 30)}
WT, UNDER, _ = by(WIN)
dead = sorted(range(len(T)), key=lambda k: -T[k][5])[:10]
summary = {
    "window_minutes_before_issue": WIN, "spc_last_day": last_day,
    "tornadoes": len(T), "deaths": sum(t[5] for t in T), "injuries": sum(t[4] for t in T),
    "tracks_with_no_end_point": sum(1 for r in rows if float(r["elat"]) == 0),
    "tracks_with_no_county": sum(1 for t in T if not t[7]),
    "by_window": res,
    "deadliest_ten": [{"utc": (T0 + datetime.timedelta(minutes=T[k][0])).strftime("%Y-%m-%dT%H:%MZ"),
                       "state": T[k][6], "deaths": T[k][5], "mag": T[k][1],
                       "warnings": [W[w][5] + f" ({lead:+d} min)" for w, lead in hits[k]]} for k in dead],
}

assert res[str(WIN)]["tornadoes_under_a_warning"] + res[str(WIN)]["tornadoes_under_none"] == len(T)
assert res["0"]["tornadoes_under_a_warning"] <= res[str(WIN)]["tornadoes_under_a_warning"] <= res["30"]["tornadoes_under_a_warning"]
byc = collections.defaultdict(list)
for k, t in enumerate(T):
    for c in t[7]:
        byc[c].append(k)
out = {"win": WIN, "last": last_day, "end": end_db, "T": [t[:8] for t in T],
       "wt": {str(w): v for w, v in sorted(WT.items())},
       "none": sorted(k for k in range(len(T)) if k not in UNDER),
       "byc": {str(c): v for c, v in sorted(byc.items())}}
(HERE / "toll.js").write_text("window.TCA_TOLL=" + json.dumps(out, separators=(",", ":")) + ";\n")
(HERE / "toll.json").write_text(json.dumps(summary, indent=1))
(HERE / "tollsum.js").write_text("window.TCA_TOLLSUM=" + json.dumps(summary) + ";\n")
print(json.dumps(summary, indent=1))
