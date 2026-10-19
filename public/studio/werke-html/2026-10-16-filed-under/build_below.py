"""FILED UNDER, below the threshold (session 183, 2026-10-19): a lower record answers "never needed".

The declarations of disaster are a high threshold. NOAA's Storm Events database keeps dangers far below
it, by county and forecast zone. The Field joined it to this work's warnings in its study 24 and offered
the result to the Studio (handoff ho-2026-10-18-field-6, met_24.tsv.gz). This script does the join again,
from the Studio's own fetch of Storm Events, and keeps for each met warning the event the record wrote,
so the card can show it.

Rules (the Field's, PREREGISTRATION-24 at field-research 0153529, applied here unchanged):
- a warning's danger classes come from the Field's classify_24.py, run as a tool on this work's data.js;
  its output (warnings_24.tsv.gz) is the input here. Only warnings sent before 2026-04-01 are joined:
  later months of Storm Events are not yet written.
- met: an event of a named class in one of the warning's counties overlapping [sent - 1 day,
  sent + keeper's life + 1 day]. Zones are mapped to counties by the NWS zone-county file bp16ap26.
- a year earlier: the same window shifted back 364 days (same weekday), the same counties and classes.
Event times are read with the event's own timezone offset (CZ_TIMEZONE); an unparsed one counts as UTC.

Usage: python3 -I build_below.py WARNINGS_24_TSV_GZ STORM_EVENTS_DIR FIELD_MET_24_TSV_GZ
Writes below.js (loaded by index.html) and below_summary.json.
"""
import csv, gzip, json, re, sys, hashlib, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
W_TSV, SE, FIELD = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
assert hashlib.sha256(FIELD.read_bytes()).hexdigest() == "adc8b017afed1a5a8a2ecce289562ef93f28108e25dec69bcfad2354f54917b7"
EPOCH = dt.datetime(1970, 1, 1)
FRAME_END = int((dt.datetime(2026, 4, 1) - EPOCH).total_seconds() // 60)
DAY, YEAR = 1440, 364 * 1440
TYPES = {
    "fire": ["Wildfire", "Dense Smoke"],
    "flood": ["Flash Flood", "Flood", "Coastal Flood", "Lakeshore Flood", "Debris Flow", "Heavy Rain"],
    "winter": ["Winter Storm", "Heavy Snow", "Blizzard", "Ice Storm", "Winter Weather", "Lake-Effect Snow",
               "Extreme Cold/Wind Chill", "Cold/Wind Chill", "Frost/Freeze", "Freezing Fog", "Sleet"],
    "heat": ["Heat", "Excessive Heat"],
    "severe": ["Tornado", "Thunderstorm Wind", "Hail", "High Wind", "Strong Wind", "Hurricane", "Hurricane (Typhoon)",
               "Tropical Storm", "Tropical Depression", "Storm Surge/Tide", "Lightning", "Funnel Cloud", "Dust Storm"],
    "avalanche": ["Avalanche"],
}
CLASS_OF = {t: c for c, ts in TYPES.items() for t in ts}

zones, postal = collections.defaultdict(set), {}
for line in (SE / "bp16ap26.dbx").read_text(encoding="latin-1").splitlines():
    f = line.split("|")
    if len(f) >= 7 and f[6].isdigit():
        zones[(f[0], f[1].zfill(3))].add(f[6].zfill(5))
        postal[f[6].zfill(5)[:2]] = f[0]

def minute(ym, d, hhmm, tz):
    m = re.search(r"([-+]?\d+)$", tz or "")
    hhmm = hhmm.zfill(4)
    t = dt.datetime(int(ym[:4]), int(ym[4:]), int(d), int(hhmm[:2]), int(hhmm[2:]))
    return int((t - dt.timedelta(hours=int(m.group(1)) if m else 0) - EPOCH).total_seconds() // 60)

events = collections.defaultdict(list)   # (county, class) -> [(begin, end, event_id)]
detail = {}                              # event_id -> what the card shows
n_files = 0
for path in sorted(SE.glob("StormEvents_details-ftp_v1.0_d20*_c*.csv.gz")):
    n_files += 1
    for r in csv.DictReader(gzip.open(path, "rt", encoding="latin-1")):
        cl = CLASS_OF.get(r["EVENT_TYPE"])
        if not cl:
            continue
        sf = r["STATE_FIPS"].zfill(2)
        if r["CZ_TYPE"] == "C":
            counties = {sf + r["CZ_FIPS"].zfill(3)}
        elif r["CZ_TYPE"] == "Z":
            counties = zones.get((postal.get(sf, "?"), r["CZ_FIPS"].zfill(3)), set())
        else:
            counties = set()
        if not counties:
            continue
        b = minute(r["BEGIN_YEARMONTH"], r["BEGIN_DAY"], r["BEGIN_TIME"], r["CZ_TIMEZONE"])
        e = max(b, minute(r["END_YEARMONTH"], r["END_DAY"], r["END_TIME"], r["CZ_TIMEZONE"]))
        eid = int(r["EVENT_ID"])
        for c in counties:
            events[(c, cl)].append((b, e, eid))
        detail[eid] = r
assert n_files == 16, n_files
for k in events:
    events[k].sort()

def first_met(counties, classes, lo, hi, t):
    """every event overlapping [lo, hi]; returns (count, the one whose begin is nearest the warning)"""
    hit = {}
    for c in counties:
        for cl in classes:
            for b, e, eid in events.get((c, cl), ()):
                if b > hi:
                    break
                if e >= lo:
                    hit[eid] = b
    if not hit:
        return 0, None
    return len(hit), min(hit, key=lambda k: (abs(hit[k] - t), k))

def show(eid):
    r = detail[eid]
    text = (r["EVENT_NARRATIVE"] or r["EPISODE_NARRATIVE"] or "").strip()
    return {"id": eid, "type": r["EVENT_TYPE"], "where": f'{r["CZ_NAME"].title()}, {r["STATE"].title()}',
            "zone": r["CZ_TYPE"] == "Z",
            "b": minute(r["BEGIN_YEARMONTH"], r["BEGIN_DAY"], r["BEGIN_TIME"], r["CZ_TIMEZONE"]),
            "x": text[:240] + ("…" if len(text) > 240 else "")}

field = {int(r["i"]): r for r in csv.DictReader(gzip.open(FIELD, "rt"), delimiter="\t")}
out, agree, differ = {}, collections.Counter(), []
k = collections.Counter()
for w in csv.DictReader(gzip.open(W_TSV, "rt"), delimiter="\t"):
    i, t, life = int(w["i"]), int(w["t_min"]), int(w["life_min"] or 0)
    if w["status"] == "register_unjoined":
        out[i] = {"s": "unjoined"}           # names a danger (earthquake, tsunami) whose register is not joined
        k[w["group"] + "|unjoined"] += 1
        continue
    if w["status"] != "covered":
        out[i] = {"s": "unkept"}             # names no danger a lower public record keeps
        k[w["group"] + "|unkept"] += 1
        continue
    if t >= FRAME_END:
        out[i] = {"s": "unwritten", "cl": w["classes"]}  # Storm Events not yet written for its month
        k[w["group"] + "|unwritten"] += 1
        continue
    g, cl = w["counties"].split(","), w["classes"].split(",")
    n, e1 = first_met(g, cl, t - DAY, t + life + DAY, t)
    n0, e0 = first_met(g, cl, t - DAY - YEAR, t + life + DAY - YEAR, t - YEAR)
    rec = {"s": "met" if n else "silent", "cl": w["classes"], "n": n, "n0": n0}
    if e1: rec["e"] = show(e1)
    if e0: rec["e0"] = show(e0)
    out[i] = rec
    k[w["group"] + "|" + rec["s"]] += 1
    if w["nn"] != "contradicted" and n:
        k["newly_contradicted|" + w["group"]] += 1
        if n0: k["newly_contradicted_and_year_earlier|" + w["group"]] += 1
    if w["group"] == "undeclared":
        k["undeclared_covered_year_earlier"] += bool(n0)
    f = field.get(i)
    if f is not None:
        same = int(f["met"]) == bool(n) and int(f["placebo"]) == bool(n0)
        agree["same" if same else "different"] += 1
        if not same: differ.append(i)
    else:
        agree["not_in_field_frame"] += 1
assert len(out) == 13371
assert set(field) <= set(out)

sources = {"storm_events": "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/",
           "zone_county": "https://www.weather.gov/source/gis/Shapefiles/County/bp16ap26.dbx",
           "fetched": "2026-10-19", "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
           for p in sorted(SE.glob("StormEvents_details-ftp_v1.0_d20*_c*.csv.gz")) + [SE / "bp16ap26.dbx"]},
           "warnings_24": {"made_by": "field-research classify_24.py at 5f149d7, run unchanged on this work's data.js",
                           "sha256_of_its_input": hashlib.sha256((HERE / "data.js").read_bytes()).hexdigest()}}
summary = {
    "sources": sources,
    "built": "2026-10-19 (session 183)",
    "storm_events_files": n_files, "events_in_classes_mapped": len(detail),
    "frame_end": "2026-04-01T00:00Z",
    "counts": dict(sorted(k.items())),
    "check_against_field_met_24": {**agree, "differing_i": differ[:50],
                                   "field_file_sha256": "adc8b017afed1a5a8a2ecce289562ef93f28108e25dec69bcfad2354f54917b7"},
}
(HERE / "below_summary.json").write_text(json.dumps(summary, indent=1))
(HERE / "below.js").write_text("// generated by build_below.py from NOAA NCEI Storm Events (public domain); see below_summary.json\n"
                               "window.BELOW=" + json.dumps([out[i] for i in range(13371)], separators=(",", ":")) + ";\n")
print(json.dumps(summary, indent=1))
