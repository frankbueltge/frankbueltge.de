"""TAKE COVER, AGAIN, increment 5: the Atelier's correction to check (relay ho-2026-10-20-atelier-6).

    python3 -I check_window.py RAW_DIR SPC_CSV PLATE3_JS

The Atelier found that the record written later (toll.js) fills only 46.7 % of the warnings whose words said
CATASTROPHIC, against 71.7 % met at the hour, and guessed that the join's window misses some. The join
(build_toll.py) lets a tornado stand under a warning only if it *began* no more than 15 minutes before the
warning was issued. A tornado emergency is issued for a tornado already on the ground, often long before.

This script rebuilds the warnings and tracks exactly as build_toll.py does (asserted against data.js and
toll.js), then counts again with the start allowed 15, 30, 60, 120 and 240 minutes before issue, the track
still required to touch the polygon. 15 stays the work's rule: it was fixed before any result was read, and
a wider window also catches tracks that ended before the warning began (the database gives no end time).
The other windows are reported beside it, never chosen after. Writes window.json.
"""
import bisect, csv, json, sys, pathlib, datetime, collections

RAW = pathlib.Path(sys.argv[1]); SPC = sys.argv[2]; P3P = pathlib.Path(sys.argv[3])
HERE = pathlib.Path(__file__).parent
T0 = datetime.datetime(2008, 1, 1, tzinfo=datetime.timezone.utc)
WINS = (15, 30, 60, 120, 240)
mins = lambda s: int((datetime.datetime.fromisoformat(s.replace("Z", "+00:00")) - T0).total_seconds() // 60)

# --- warnings, as build_toll.py builds them
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
        e["polys"] += [r[0] for r in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]])]
W = []
for (wfo, year, eid), e in sorted(ev.items()):
    dur = mins(e["expire"]) - mins(e["issue"])
    if 1 <= dur <= 240:
        W.append((mins(e["issue"]), dur, 1 if e["met"] else 0, wfo, e["polys"]))
W.sort(key=lambda w: (w[0], w[3]))
load = lambda p, pre: json.loads(pathlib.Path(p).read_text().strip()[len(pre):].rstrip(';'))
D = load(HERE / "data.js", "window.TCA=")
assert [w[0] for w in W] == D["issue"] and [w[2] for w in W] == D["met"], "warnings equal data.js's"
issues = [w[0] for w in W]
bbox = [(min(x for r in w[4] for x, _ in r), min(y for r in w[4] for _, y in r),
         max(x for r in w[4] for x, _ in r), max(y for r in w[4] for _, y in r)) for w in W]


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


# --- tracks; each with every warning it touched that was issued up to 240 min after it began and
#     stood when it began, or was issued up to max(WINS) after it began (the lead is kept)
rows = [r for r in csv.DictReader(open(SPC, newline="")) if int(r["yr"]) >= 2008]
last_day = max(r["date"] for r in rows)
end_db = mins(last_day + "T00:00Z") + 1440
T, hits = [], []
for r in sorted(rows, key=lambda r: (r["date"], r["time"], r["om"])):
    t = datetime.datetime.fromisoformat(r["date"] + "T" + r["time"]).replace(tzinfo=datetime.timezone.utc)
    m = int((t - T0).total_seconds() // 60) + 360
    a = (float(r["slon"]), float(r["slat"]))
    b = (float(r["elon"]), float(r["elat"])) if float(r["elat"]) != 0 else a
    T.append((m, int(r["fat"])))
    lo = bisect.bisect_left(issues, m - 240); hi = bisect.bisect_right(issues, m + max(WINS))
    hits.append([(w, m - issues[w]) for w in range(lo, hi) if m <= issues[w] + W[w][1] and touches(a, b, w)])
# the work's own rule reproduces toll.js
X = load(HERE / "toll.js", "window.TCA_TOLL=")
wt15 = collections.defaultdict(list)
for k, h in enumerate(hits):
    for w, lead in h:
        if lead >= -15:
            wt15[w].append(k)
assert {str(w): v for w, v in sorted(wt15.items())} == X["wt"], "the 15-minute rule equals toll.js"

# --- the Atelier's classes, joined by office and issue minute (as build_record.py joins plate3.js)
P3 = load(P3P, "window.P3=")
key = collections.Counter((W[i][3], W[i][0]) for i in range(len(W)))
cls = {}
for off, seq in P3["seq"].items():
    for minute, code in seq:  # code = class << 2 | met at the hour << 1 | filled later (plate3.js)
        if key[(off, minute)] == 1:
            cls[next(i for i in range(bisect.bisect_left(issues, minute), len(W)) if W[i][3] == off)] = P3["order"][code >> 2]
db = [w for w in range(len(W)) if issues[w] + W[w][1] <= end_db]
out = {"rule_of_the_work": 15, "spc_last_day": last_day, "warnings_in_db_years": len(db),
       "atelier_classes_joined": len(cls), "by_window": {}}
for win in WINS:
    filled = set(); under = set()
    for k, h in enumerate(hits):
        for w, lead in h:
            if lead >= -win:
                filled.add(w); under.add(k)
    by = {}
    for c in P3["order"]:
        ws = [w for w in db if cls.get(w) == c]
        by[c] = {"n": len(ws), "met_hour": sum(W[w][2] for w in ws), "filled_later": sum(w in filled for w in ws),
                 "met_unfilled_later": sum(1 for w in ws if W[w][2] and w not in filled),
                 "empty_filled_later": sum(1 for w in ws if not W[w][2] and w in filled)}
    out["by_window"][str(win)] = {
        "empty_warnings_filled_later": sum(1 for w in db if not W[w][2] and w in filled),
        "met_warnings_with_no_track": sum(1 for w in db if W[w][2] and w not in filled),
        "tornadoes_under_none": len(T) - len(under),
        "deaths_under_none": sum(T[k][1] for k in range(len(T)) if k not in under),
        "atelier_classes_2008_to_db_end": by}
(HERE / "window.json").write_text(json.dumps(out, indent=1))
for win, v in out["by_window"].items():
    c = v["atelier_classes_2008_to_db_end"]["CAT"]
    print(win, v["empty_warnings_filled_later"], v["met_warnings_with_no_track"], v["tornadoes_under_none"],
          v["deaths_under_none"], "CAT", c)
