"""THE UNSENT — every federal disaster declaration area (incident begun 2012 or later), and whether
a local keeper's warning reached that county through FEMA's alert system around the incident's start.
Usage: python3 build.py <ipaws raw dir> <declarations raw dir>
Writes data.js (for the page) and summary.json (counts, with asserts).

Rules, fixed before the counts were read:
- A local warning: an Alert in FEMA's IPAWS archive from a sender other than the National Weather
  Service, not a test (by event code or by its own words, the rules of THE KEEPER'S WORD), not an
  administrative message. It reaches a county when its SAME area codes name the county or its whole state.
- The window: from three days before the incident's declared begin date to seven days after it.
- A declaration area is one county (or county-equivalent) under one incident; an EM and a DR for the
  same incident and county count once. Biological incidents (the pandemic) are left out. Areas declared
  for a whole state or a tribal nation (county code 000) are counted but not placed on the map.
- The word speaks of the danger when its text matches the incident type's word list below (read
  mechanically; the page shows the words so the visitor can judge). Warnings coded for people
  (abductions, law enforcement, missing persons, officer threats) never count as speaking of it.
- "Heard before": the county had received at least one local warning of any kind before the window.

Correction of 2026-10-18 (session 179), taking the house's note of 2026-10-17. Fixed before the recount:
- The archive's first local warning falls at 2012-10-28 15:54 UTC (THE KEEPER'S WORD, `first`). A window
  that closed before that minute could hold no local word at all: it is its own class, "before", and is
  taken out of the four outcomes. Windows that open before it and close after it stay counted.
- "Heard before" now reads as the page says it: an earlier local warning addressed to the county by its
  own area code (not only its whole state's), and not one coded or worded for a person. The rule of
  session 174 (any earlier warning, statewide reach included) is still counted, in summary.json.
- Within the window a warning still reaches a county by its own or its whole state's code.
"""
import json, glob, re, sys, collections, datetime as dt

IP, DD = sys.argv[1], sys.argv[2]
rows = []
for f in sorted(glob.glob(f"{IP}/page*.json")):
    rows += json.load(open(f))
# session 176: the archive grows; read it as it stood before 2026-10-14T06:00Z (as FILED UNDER does)
rows = [r for r in rows if r["sent"][:19] < "2026-10-14T06:00:00"]
assert len(rows) == len({r["id"] for r in rows}) == 82754, len(rows)
D = json.load(open(f"{DD}/declarations.json"))

# test and person rules: as in ../2026-10-15-the-keepers-word/build.py
TESTCODES = {"RWT", "RMT", "DMO", "NPT"}
ADMIN = {"ADR"}
PERSON = {"CAE", "LEW", "BLU", "MEP"}
TESTWORDS = re.compile(r"\b(this is (only )?a test|test message|testing|a test of|exercise|drill|demonstration|"
                       r"practice|proficiency)\b|\btest\b", re.I)
NOTTEST = re.compile(r"\bnot an? (test|drill|exercise)\b", re.I)
PERSONWORDS = re.compile(r"\b(suspect|wanted|missing|endangered|abduct\w*|kidnap\w*|escaped|inmate|fugitive|"
                         r"homicide|shooting|shooter|murder\w*|named|description|DOB|years? old|yoa)\b", re.I)
# Correction of 2026-10-16 (session 176): the word list above missed alert names (Silver, Ashanti), 'be on
# the lookout' and descriptions of a body (sex, age, height, clothing). Texts that match the wider rule
# below are withheld from the page too. Counts are not changed by it. See ../2026-10-16-filed-under/CRITIQUE.md.
PERSONWIDE = re.compile('\\b(silver alert|golden alert|ashanti|camo alert|amber alert|senior alert|codi alert|bolo|be on the look ?out|look ?out for|last seen|wearing|[wbh]/[mf]|males?|females?|man|woman|boy|girl|juvenile|teen(ager)?|person of interest|he|she|his|her|him|height|weight|lbs?|hair|y/?o|year-old|yrs? old|age \\d+|\\d ?\'\\s?\\d+\\"?|tattoo\\w*|armed|dementia|alzheimer\\w*|autis\\w*|lic|runaway|escapee\\w*|alerta|found safe|has been found|was found|located safe|looking for|locating|searching for|seen in|seen near|info on|information on)\\b', re.I)

STORM = r"storm|tornado|wind|flood|hail|damage|power|outage|shelter|debris|road|evacuat|tree|line|water"
TROP = r"hurricane|storm|tropical|surge|flood|evacuat|wind|shelter|typhoon|curfew|landfall|cyclone|power|water"
WINTER = r"snow|ice|icy|winter|cold|warming|freez|road|power|outage|travel|storm|shelter|blizzard|heat"
HAZ = {
    "Fire": r"fire|smoke|evacuat|burn|flame",
    "Flood": r"flood|water|dam\b|levee|evacuat|rain|river|creek|road",
    "Dam/Levee Break": r"flood|water|dam\b|levee|evacuat|breach",
    "Hurricane": TROP, "Tropical Storm": TROP, "Typhoon": TROP, "Coastal Storm": TROP,
    "Tropical Depression": TROP,
    "Severe Storm": STORM, "Tornado": STORM, "Straight-Line Winds": STORM,
    "Winter Storm": WINTER, "Snowstorm": WINTER, "Severe Ice Storm": WINTER, "Freezing": WINTER,
    "Earthquake": r"earthquake|quake|tsunami|aftershock|seismic",
    "Mud/Landslide": r"slide|mud|debris|evacuat|flow|road",
    "Volcanic Eruption": r"volcan|lava|ash|eruption|vog|evacuat",
    "Chemical": r"chemical|hazard|shelter|evacuat|leak|release|smoke|gas|spill",
    "Toxic Substances": r"chemical|hazard|shelter|evacuat|leak|release|toxic|water",
    "Terrorist": r"shelter|evacuat|explos|bomb|attack|threat|lockdown",
    "Other": r"shelter|evacuat|hazard|emergency|water|power",
}
HAZ = {k: re.compile(r"\b(" + v + r")", re.I) for k, v in HAZ.items()}

def L(i, a, b):  # the archive spells some keys two ways ('areas'/'area', 'parameters'/'parameter')
    return (i.get(a) or []) + (i.get(b) or [])

def words(r):
    out = []
    for i in r["info"] or []:
        for p in L(i, "parameters", "parameter"):
            if p["name"] in ("CMAMtext", "CMAMlongtext") and p.get("value"):
                out.append(p["value"])
        for k in ("headline", "description", "instruction"):
            if i.get(k):
                out.append(i[k])
    return re.sub(r"\s+", " ", " · ".join(dict.fromkeys(x.strip() for x in out if x and x.strip())))

def short(r):
    for i in r["info"] or []:
        for p in L(i, "parameters", "parameter"):
            if p["name"] == "CMAMtext" and p.get("value"):
                return re.sub(r"\s+", " ", p["value"]).strip()
    return words(r)

def sday(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).replace(tzinfo=None)

E0 = dt.datetime(1970, 1, 1)
stats = collections.Counter()
W, byc = [], collections.defaultdict(list)
for r in rows:
    if r["msgType"] != "Alert":
        continue
    ev, codes = None, set()
    for i in r["info"] or []:
        for e in i.get("eventCode") or []:
            if e["name"] == "SAME":
                ev = e["value"]
        for a in L(i, "areas", "area"):
            for g in a.get("geocode") or []:
                if g["name"] == "SAME" and len(g["value"]) == 6:
                    codes.add(g["value"][1:])
    if ev in TESTCODES:
        stats["test_by_code"] += 1; continue
    if ev in ADMIN or ev is None:
        stats["admin_or_uncoded"] += 1; continue
    txt = words(r)
    if TESTWORDS.search(txt) and not NOTTEST.search(txt):
        stats["test_by_words"] += 1; continue
    person = ev in PERSON or bool(PERSONWORDS.search(txt))
    k = len(W)
    W.append({"t": sday(r["sent"]), "c": ev, "txt": txt, "p": ev in PERSON, "wh": person, "own": codes,
              "show": None if (person or PERSONWIDE.search(txt)) else short(r)[:280], "id": r["id"]})   # wider rule: s176
    for c in codes:
        byc[c].append(k)
    stats["warnings"] += 1
    if not codes:
        stats["warnings_no_area"] += 1

areas, skipped = {}, collections.Counter()
for r in D:
    if r["incidentType"] == "Biological":
        skipped["biological"] += 1; continue
    key = (r["incidentId"] or r["femaDeclarationString"], r["fipsStateCode"] + r["fipsCountyCode"])
    if key in areas:
        skipped["same_incident_and_area"] += 1; continue
    areas[key] = r

FIRST = min(w["t"] for w in W)   # s179: the archive's first local warning
assert FIRST.strftime("%Y-%m-%d %H:%M") == "2012-10-28 15:54", FIRST
old = collections.Counter()       # s179: the session-174 rule, kept for comparison
straddle = collections.Counter()
split = collections.Counter()     # s179: unreached counted windows, by what had been addressed to the county before
INC = {}   # incident -> record for the page
rec = collections.Counter()
for (iid, f), r in areas.items():
    b = sday(r["incidentBeginDate"])
    lo, hi = b - dt.timedelta(days=3), b + dt.timedelta(days=8)   # begin date is a day: through day 7
    inc = INC.setdefault((iid, r["state"]), {"i": iid, "d": r["femaDeclarationString"], "n": r["declarationTitle"].title(),
                               "y": r["incidentType"], "s": r["state"], "b": (b - E0).days, "a": [], "z": 0})
    if r["femaDeclarationString"].startswith("DR"):
        inc["d"] = r["femaDeclarationString"]          # name the incident by its major-disaster number
    if f.endswith("000"):
        inc["z"] += 1; rec["state_or_tribal_area"] += 1; continue
    cand = sorted(set(byc.get(f, []) + byc.get(f[:2] + "000", [])))
    inwin = [k for k in cand if lo <= W[k]["t"] < hi]
    before = [k for k in cand if W[k]["t"] < lo]
    before_own = [k for k in before if f in W[k]["own"] and not W[k]["wh"]]   # s179
    before_own_any = [k for k in before if f in W[k]["own"]]
    on = [k for k in inwin if not W[k]["p"] and HAZ[r["incidentType"]].search(W[k]["txt"])]
    if on:
        st, ks = "spoke", on
    elif inwin:
        st, ks = "other", inwin
    else:
        st, ks = ("silent" if before else "never"), []
    old[st] += 1
    if hi <= FIRST:                  # s179: the window closed before the archive held any local word
        assert not inwin and not before
        st = "before"
    elif st in ("silent", "never"):
        st = "silent" if before_own else "never"
    if st in ("silent", "never"):
        split[("own code" if before_own else "own code, person only" if before_own_any else
               "whole state only" if before else "nothing")] += 1
    if lo < FIRST < hi:
        straddle[st] += 1
    rec[st] += 1
    inc["a"].append([f, st, ks[:3], len(ks)])

used = sorted({k for inc in INC.values() for a in inc["a"] for k in a[2]})
remap = {k: j for j, k in enumerate(used)}
WOUT = [[int((W[k]["t"] - E0).total_seconds() // 60), W[k]["c"], W[k]["show"]] for k in used]
for inc in INC.values():
    for a in inc["a"]:
        a[2] = [remap[k] for k in a[2]]
INCS = sorted(INC.values(), key=lambda x: (x["b"], x["i"], x["s"]))

total = sum(rec[k] for k in ("spoke", "other", "silent", "never"))
assert total + rec["before"] + rec["state_or_tribal_area"] == len(areas)
bytype = collections.defaultdict(collections.Counter)
byyear = collections.defaultdict(collections.Counter)
rec_before_year = collections.Counter()
for inc in INCS:
    for a in inc["a"]:
        if a[1] == "before":
            rec_before_year[(E0 + dt.timedelta(days=inc["b"])).year] += 1; continue
        bytype[inc["y"]][a[1]] += 1
        byyear[(E0 + dt.timedelta(days=inc["b"])).year][a[1]] += 1
summary = {
    "sources": ["FEMA OpenFEMA DisasterDeclarationsSummaries v2 (incident begin 2012-01-01 or later)",
                "FEMA OpenFEMA IpawsArchivedAlerts v1, senders other than the National Weather Service"],
    "fetched": "2026-10-18",
    "first_local_warning": FIRST.strftime("%Y-%m-%dT%H:%MZ"),
    "rule_s174": {"county_areas": sum(old.values()), "outcomes": dict(old)},
    "straddling_first_warning": dict(straddle),
    "before_by_year": dict(rec_before_year),
    "unreached_by_earlier_address": dict(split),
    "declaration_rows": len(D), "skipped": dict(skipped), "areas": len(areas),
    "incidents": len(INCS), "county_areas": total, "outcomes": dict(rec),
    "alerts": dict(stats),
    "by_type": {k: dict(v) for k, v in sorted(bytype.items(), key=lambda x: -sum(x[1].values()))},
    "by_year": {k: dict(v) for k, v in sorted(byyear.items())},
}
json.dump(summary, open("summary.json", "w"), indent=1)
with open("data.js", "w") as fh:
    fh.write("// generated by build.py from FEMA's disaster declarations and IPAWS archive (public domain); see summary.json\n")
    fh.write("window.SUMMARY=" + json.dumps(summary) + ";\n")
    fh.write("window.INC=" + json.dumps(INCS, separators=(",", ":"), ensure_ascii=False) + ";\n")
    fh.write("window.CASES=" + json.dumps(json.load(open("cases.json")), ensure_ascii=False) + ";\n")
    fh.write("window.WORDS=" + json.dumps(WOUT, separators=(",", ":"), ensure_ascii=False) + ";\n")
print(json.dumps(summary, indent=1))
