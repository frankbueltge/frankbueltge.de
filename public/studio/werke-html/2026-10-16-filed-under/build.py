"""FILED UNDER — every local warning in FEMA's IPAWS archive whose words can be shown, with what the
record holds after it, and the answer the record can give to each of four filings.
Usage: python3 build.py <ipaws raw dir> <declarations raw dir>
Writes data.js (for the page) and summary.json (counts, with asserts).

The warnings, their tests, their withheld texts and their fates are THE KEEPER'S WORD's rules
(../2026-10-15-the-keepers-word/build.py, as corrected in session 174), copied here unchanged. The
declarations and the window are THE UNSENT's rules (../2026-10-15-the-unsent/build.py), read the other
way round: from a warning to the disasters declared in its counties around its day.

The record's answer to a filing, fixed before anything was counted:
- "heeded", "ignored": no record in either archive says who received a warning or what anyone did.
  The answer is always: no word.
- "never needed": BACKED when the record ties a word of error to this warning: its own cancel says it
  was sent in error. (The 15 retractions read by hand in THE KEEPER'S WORD say an *earlier* message
  was wrong, and the record ties none of them to the message they retract; a retraction is itself
  needed, so it backs nothing.) CONTRADICTED when the country declared
  a disaster in one of the warning's counties whose incident began from seven days before the warning
  to three days after it (THE UNSENT's window, inverted), and the warning's words name that kind of
  danger (THE UNSENT's word lists). Otherwise: no word.
- "the record can't say": AGREES, always.
Warnings whose text names or describes a person are withheld (as in THE KEEPER'S WORD) and are not
dealt; they are counted.

Session 176, after the critique (CRITIQUE.md), three changes, fixed before the recount:
- A WIDER PERSON RULE for what is dealt. THE KEEPER'S WORD's word list missed alert names (Silver,
  Golden, Ashanti), "be on the lookout", and descriptions of a body (sex, age, height, clothing). Those
  warnings are now withheld too. THE KEEPER'S WORD's own counts are not touched by this (23,154
  warnings, 8,142 withheld by its rule); the wider rule withholds more here, and the count is printed.
- ALL-CLEARS ARE NOT DEALT. A message sent as a new alert whose shown words begin with a cancel, or carry
  an all-clear (THE KEEPER'S WORD's CLEAR list less "reopen"), is not a warning of a danger to come.
  Counted, not dealt. The list is mechanical: a few warnings that only mention a lifting are lost too.
- THE KEEPER'S CLOCK, from the Field (study 17, warnings.tsv, handoff ho-2026-10-15-field-3): each
  warning's declared lifetime and the minute of its first cancel, joined by the archive's message id.
  The lifetime is recomputed here from the message's own expiry and must agree with the Field's.
"""
import json, glob, re, sys, collections, datetime as dt

RAW, DD = sys.argv[1], sys.argv[2]
FIELD = sys.argv[3] if len(sys.argv) > 3 else None    # the Field's warnings.tsv (study 17)
rows = []
for f in sorted(glob.glob(f"{RAW}/page*.json")):
    rows += json.load(open(f))
assert len(rows) == len({r["id"] for r in rows})
# The archive grows. Read it as it stood at the fetch of sessions 173/174 (82,754 messages, the last sent 2026-10-14 05:29Z):
# everything sent before the cutoff below, which the build asserts reproduces that count.
CUTOFF = "2026-10-14T06:00:00"
grown = [r for r in rows if r["sent"][:19] >= CUTOFF]
rows = [r for r in rows if r["sent"][:19] < CUTOFF]
assert len(rows) == 82754, (len(rows), len(grown))
refs = json.load(open(f"{RAW}/references.json"))
D = json.load(open(f"{DD}/declarations.json"))
assert len(D) == 28938, len(D)

# ---- THE KEEPER'S WORD's rules, unchanged ----
TESTCODES = {"RWT", "RMT", "DMO", "NPT"}
ADMIN = {"ADR"}
PERSON = {"CAE", "LEW", "BLU", "MEP"}
NAMES = {"LAE": "Local area emergency", "CAE": "Child abduction", "CEM": "Civil emergency",
         "LEW": "Law enforcement", "EVI": "Evacuate now", "FRW": "Fire", "SPW": "Shelter in place",
         "MEP": "Missing person", "TOE": "911 outage", "CDW": "Civil danger", "HMW": "Hazardous materials",
         "EQW": "Earthquake", "BLU": "Officer threat (Blue)", "AVW": "Avalanche", "NUW": "Nuclear plant",
         "RHW": "Radiological hazard", "EAN": "National emergency"}
TESTWORDS = re.compile(r"\b(this is (only )?a test|test message|testing|a test of|exercise|drill|demonstration|"
                       r"practice|proficiency)\b|\btest\b", re.I)
NOTTEST = re.compile(r"\bnot an? (test|drill|exercise)\b", re.I)
PERSONWORDS = re.compile(r"\b(suspect|wanted|missing|endangered|abduct\w*|kidnap\w*|escaped|inmate|fugitive|"
                         r"homicide|shooting|shooter|murder\w*|named|description|DOB|years? old|yoa)\b", re.I)
# session 176: the wider rule for what is dealt (see the docstring)
PERSONWIDE = re.compile('\\b(silver alert|golden alert|ashanti|camo alert|amber alert|senior alert|codi alert|bolo|be on the look ?out|look ?out for|last seen|wearing|[wbh]/[mf]|males?|females?|man|woman|boy|girl|juvenile|teen(ager)?|person of interest|he|she|his|her|him|height|weight|lbs?|hair|y/?o|year-old|yrs? old|age \\d+|\\d ?\'\\s?\\d+\\"?|tattoo\\w*|armed|dementia|alzheimer\\w*|autis\\w*|lic|runaway|escapee\\w*|alerta|found safe|has been found|was found|located safe|looking for|locating|searching for|seen in|seen near|info on|information on)\\b', re.I)
# the all-clears not dealt: THE KEEPER'S WORD's CLEAR list without "reopen" (a road's reopening time is not
# an all-clear), read in the words the card shows
ALLCLEAR = re.compile(r"\b(all clear|lifted|is over|has ended|resolved|no longer|restored|"
                      r"contained|extinguished|return home|may return|safe to return|no threat|no danger|"
                      r"no further threat|has passed|under control)\b", re.I)
STARTSCANCEL = re.compile(r"^\W*(cancel\w*|all clear|update: all clear)\b", re.I)
ERROR = re.compile(r"\b(in error|erroneous\w*|by mistake|mistaken\w*|false alarm|accidental\w*|inadvertent\w*|"
                   r"sent incorrectly|unintended|was not intended|(please )?disregard (the |this |that )?"
                   r"(previous|prior|earlier|last|above|message|alert|notification|siren))\b", re.I)
SAFE = re.compile(r"\b(found|located|recovered|safe|in custody|apprehended|arrested|captured|returned)\b", re.I)
CLEAR = re.compile(r"\b(all clear|lifted|is over|has ended|resolved|no longer|reopen\w*|restored|"
                   r"contained|extinguished|return home|may return|safe to return|no threat|no danger|"
                   r"no further threat|has passed|under control)\b", re.I)
RETRACTIONS = {
    "7adf9a34-7198-404c-9ff2-89aa445c4543", "62ba0e5e-35a1-4a9f-be01-2c3d5359d66c",
    "0c0f651e-b3d1-4141-9c5d-6159c153909c", "5d2d37fc-2922-4686-bc7e-c12a2374f9c3",
    "0279ca58-9944-4521-a308-7f16b6378da2", "54d62cf7-d862-4c4a-8362-13d87e7dcda2",
    "9fbca45a-b668-4d04-9a69-fff1d31c0355", "f135cc1c-beff-4b0b-b405-6407ec8d4760",
    "bcf98252-27a6-499c-8a23-eedce834ffd3", "2e60e6de-820e-4912-b506-79ce85f6b401",
    "79a3f13f-ca17-41ad-8169-a84487af59eb", "cc4225b7-61f9-4568-973b-0d75da2d86a7",
    "27c7124d-996e-4a3d-b1f1-cf1735df405d", "98dff992-3063-4193-8854-9117d498f8ee",
    "5ac00875-3486-41c2-bc50-68d0ba5e1238",
}
INSTITUTION = re.compile(r"(count|city|police|sheriff|fire|\bema\b|emergency|dep(artmen)?t|office|state|agency|"
                         r"manag|\boe[sm]\b|alert|district|universit|college|school|authority|patrol|town|"
                         r"village|parish|borough|fema|usgs|survey|safety|public|911|dispatch|ncmec|warning|"
                         r"system|emnet|security|government|tribe|tribal|nation|bureau|service|center|centre|"
                         r"port|transit|utilit|water|power|nuclear|hsem|division|commission|\bpd\b|\bso\b|"
                         r"\bhs\b|ipaws|homeland|military|guard|base|park|airport|campus)", re.I)

def L(i, a, b):
    return (i.get(a) or []) + (i.get(b) or [])

def same(r):
    for i in r["info"] or []:
        for e in i.get("eventCode") or []:
            if e["name"] == "SAME":
                return e["value"]
    return None

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

def wea(r):
    for i in r["info"] or []:
        for p in L(i, "parameters", "parameter"):
            if p["name"] == "CMAMtext" and p.get("value"):
                return re.sub(r"\s+", " ", p["value"]).strip()
    return ""

def agency(r):
    for i in r["info"] or []:
        if i.get("senderName"):
            n = re.sub(r"\s+", " ", i["senderName"]).strip()
            return n if INSTITUTION.search(n) and "@" not in n else ""
    return ""

def counties(r):
    out = set()
    for i in r["info"] or []:
        for a in L(i, "areas", "area"):
            for g in a.get("geocode") or []:
                if g["name"] == "SAME" and len(g["value"]) == 6:
                    out.add(g["value"][1:])
    return sorted(out)

E0 = dt.datetime(1970, 1, 1)
def sday(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).replace(tzinfo=None)
def tmin(s):
    return int((sday(s) - E0).total_seconds() // 60)

byident = collections.defaultdict(list)
for r in rows:
    byident[(r["sender"], r["identifier"])].append(r)
    byident[(None, r["identifier"])].append(r)
follow = collections.defaultdict(list)
for r in rows:
    if r["msgType"] == "Alert":
        continue
    for tok in refs.get(r["id"], "").split():
        p = tok.split(",")
        tgt = byident.get((p[0], p[1])) if len(p) >= 3 else None
        if not tgt:
            cand = byident.get((None, p[1] if len(p) >= 3 else p[0])) or []
            cand = [c for c in cand if c["sender"] == r["sender"]]
            tgt = cand if len(cand) == 1 else None
        if tgt:
            follow[tgt[0]["id"]].append(r)

def chain(rid, seen=None):
    seen = seen or set()
    out = []
    for f in follow.get(rid, []):
        if f["id"] in seen:
            continue
        seen.add(f["id"]); out.append(f); out += chain(f["id"], seen)
    return out

# ---- THE UNSENT's declarations and word lists, unchanged ----
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

areas = {}
for r in D:
    if r["incidentType"] == "Biological":
        continue
    key = (r["incidentId"] or r["femaDeclarationString"], r["fipsStateCode"] + r["fipsCountyCode"])
    if key in areas:
        continue
    areas[key] = r
decl_by_county = collections.defaultdict(list)    # county fips -> declarations (state-wide areas excluded)
incidents = {}
for (iid, f), r in areas.items():
    if f.endswith("000"):
        continue
    inc = incidents.setdefault((iid, r["state"]), {"d": r["femaDeclarationString"], "n": r["declarationTitle"].title(),
                                                    "y": r["incidentType"], "b": sday(r["incidentBeginDate"])})
    if r["femaDeclarationString"].startswith("DR"):
        inc["d"] = r["femaDeclarationString"]
    decl_by_county[f].append((iid, r["state"]))
county_list_by_state = collections.defaultdict(list)
for f in decl_by_county:
    county_list_by_state[f[:2]].append(f)

# county names, from the vendored county map (us-atlas, Census boundaries)
topo = json.load(open("vendor/counties-10m.json"))
CN = {g["id"]: g["properties"]["name"] for g in topo["objects"]["counties"]["geometries"]}
SN = {g["id"]: g["properties"]["name"] for g in topo["objects"]["states"]["geometries"]}

stats = collections.Counter()
CARDS, DECL = [], {}
for r in rows:
    if r["msgType"] != "Alert":
        continue
    c = same(r)
    if c in TESTCODES or c in ADMIN or c is None:
        continue
    txt = words(r)
    if TESTWORDS.search(txt) and not NOTTEST.search(txt):
        continue
    stats["warnings"] += 1
    fu = sorted(chain(r["id"]), key=lambda x: x["sent"])
    cancels = [f for f in fu if f["msgType"] == "Cancel"]
    t0 = tmin(r["sent"])
    own_error = r["id"] in RETRACTIONS
    if cancels:
        cw = " · ".join(words(f) for f in cancels if words(f))
        fate = ("end-error" if ERROR.search(cw) else "end-safe" if SAFE.search(cw) and c in PERSON
                else "end-clear" if CLEAR.search(cw) else "end-mute")
        lag = tmin(cancels[0]["sent"]) - t0
    elif fu:
        fate, lag, cw = "update", tmin(fu[0]["sent"]) - t0, ""
    else:
        fate, lag, cw = "silence", None, ""
    stats["fate:" + fate] += 1
    if c in PERSON or PERSONWORDS.search(txt + " " + cw):
        stats["withheld"] += 1
        continue
    if PERSONWIDE.search(txt + " " + cw):
        stats["withheld_wider_s176"] += 1
        continue
    shown = wea(r) or txt
    if STARTSCANCEL.search(shown) or ALLCLEAR.search(shown):
        stats["allclear_not_dealt"] += 1
        continue
    cs = counties(r)
    # the disasters declared in its counties (a whole-state code reaches every county of the state)
    reach = set()
    for f in cs:
        reach |= set(county_list_by_state[f[:2]]) if f.endswith("000") else {f}
    t = sday(r["sent"])
    near = {}
    for f in reach:
        for key in decl_by_county.get(f, []):
            inc = incidents[key]
            if inc["b"] - dt.timedelta(days=3) <= t < inc["b"] + dt.timedelta(days=8):
                near.setdefault(key, []).append(f)
    named = [k for k in near if HAZ[incidents[k]["y"]].search(txt)]
    backed = fate == "end-error"
    contra = bool(named)
    nn = "both" if backed and contra else "backed" if backed else "contradicted" if contra else "none"
    stats["dealt"] += 1
    stats["never_needed:" + nn] += 1
    stats["near_declaration"] += bool(near)
    dl = []
    for k in sorted(near, key=lambda k: (k not in named, incidents[k]["b"])):
        key = f"{k[0]}|{k[1]}"
        if key not in DECL:
            inc = incidents[k]
            DECL[key] = [inc["d"], inc["n"], inc["y"], int((inc["b"] - E0).days)]
        dl.append([key, len(near[k]), 1 if k in named else 0])
    # place: up to six named counties; whole states named as states
    place = []
    for f in cs:
        if f.endswith("000"):
            place.append(SN.get(f[:2], f[:2]) + " (whole state)")
        elif f in CN:
            place.append(f"{CN[f]}, {SN.get(f[:2], f[:2])}")
    life = None
    for i in r["info"] or []:
        if i.get("expires"):
            life = (dt.datetime.fromisoformat(i["expires"].replace("Z", "+00:00")) -
                    dt.datetime.fromisoformat(r["sent"].replace("Z", "+00:00"))).total_seconds() / 60
            break
    CARDS.append({"id": r["id"], "own_life": life, "t": t0, "c": c, "a": agency(r), "w": (wea(r) or txt)[:300],
                  "l": (txt if len(txt) > len(wea(r) or txt) + 20 else "")[:900],
                  "g": cs[:60], "p": place[:6], "pn": len(place), "f": fate, "lag": lag,
                  "x": cw[:300] if cw else "", "e": 1 if own_error else 0, "nn": nn, "dl": dl[:4], "dn": len(dl)})

assert stats["warnings"] == 23154, stats["warnings"]   # THE KEEPER'S WORD, corrected
assert stats["withheld"] == 8142, stats["withheld"]
CARDS.sort(key=lambda x: x["t"])
# the Field's clock, joined by message id; its lifetime must agree with the message's own expiry
clock = {"joined": 0, "missing": 0, "life_agrees": 0, "life_differs": 0, "cancelled": 0}
fld = {}
if FIELD:
    import csv
    for row in csv.DictReader(open(FIELD), delimiter="\t"):
        fld[row["id"]] = row
for c in CARDS:
    own = c.pop("own_life"); row = fld.get(c.pop("id"))
    if not row:
        clock["missing"] += 1
        continue
    clock["joined"] += 1
    lt = float(row["lifetime_min"]) if row["lifetime_min"] else None
    if lt is not None and own is not None and abs(lt - own) < 0.01:
        clock["life_agrees"] += 1
    else:
        clock["life_differs"] += 1
    if lt is not None:
        c["lt"] = round(lt)
    if row["first_cancel_min"]:
        c["fc"] = round(float(row["first_cancel_min"])); clock["cancelled"] += 1
summary = {
    "sources": ["FEMA OpenFEMA IpawsArchivedAlerts v1, senders other than the National Weather Service",
                "FEMA OpenFEMA DisasterDeclarationsSummaries v2 (incident begin 2012-01-01 or later)"],
    "archive_as_of": CUTOFF + "Z (82,754 messages; " + str(len(grown)) + " sent since are not read)",
    "fetched": dt.date.today().isoformat(),
    "warnings": stats["warnings"], "withheld_not_dealt": stats["withheld"], "dealt": stats["dealt"],
    "near_declaration": stats["near_declaration"],
    "never_needed": {k.split(":")[1]: v for k, v in stats.items() if k.startswith("never_needed:")},
    "heeded_backed": 0, "ignored_backed": 0,
    "fates_dealt": dict(collections.Counter(c["f"] for c in CARDS)),
    "s176_withheld_by_wider_person_rule": stats["withheld_wider_s176"],
    "s176_allclear_not_dealt": stats["allclear_not_dealt"],
    "s176_field_clock": clock,
}
nn = summary["never_needed"]
summary["record_can_back_at_most"] = nn.get("backed", 0) + nn.get("both", 0)
summary["record_can_contradict_at_most"] = nn.get("contradicted", 0) + nn.get("both", 0)
json.dump(summary, open("summary.json", "w"), indent=1)
with open("data.js", "w") as fh:
    fh.write("// generated by build.py from FEMA's IPAWS archive and disaster declarations (public domain); see summary.json\n")
    fh.write("window.NAMES=" + json.dumps(NAMES) + ";\n")
    fh.write("window.SUMMARY=" + json.dumps(summary) + ";\n")
    fh.write("window.DECL=" + json.dumps(DECL, separators=(",", ":"), ensure_ascii=False) + ";\n")
    LONG = [c.pop("l") for c in CARDS]
    fh.write("window.CARDS=" + json.dumps(CARDS, separators=(",", ":"), ensure_ascii=False) + ";\n")
json.dump(LONG, open("long.json", "w"), separators=(",", ":"), ensure_ascii=False)   # the full words, read on demand
print(json.dumps(summary, indent=1))
