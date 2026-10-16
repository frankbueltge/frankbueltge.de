# Copied from the Studio, frankbueltge/studio @ main on 2026-10-16, works/2026-10-15-the-keepers-word/build.py
# as corrected by the Studio on 2026-10-15 (session 174: both spellings of 'areas'/'area' and
# 'parameters'/'parameter'). Apache-2.0, attribution: Frank Bültge, https://frankbueltge.de;
# original sha256 3709221d9ec8eaea28c74507ae9b828729f6c4359bbde70117e98467482e9bf6.
# ONE change, marked "FIELD:", as in keepers_word_build.py. Used only by correction-2026-10-16/.
"""Reduce FEMA's IPAWS archive (non-weather-service senders) to the warnings and what their
keepers wrote after them. Usage: python3 build.py <raw cache dir>
Writes data.js (for the page) and summary.json (counts, with asserts)."""
import json, glob, re, sys, collections, datetime as dt

RAW = sys.argv[1]
rows = []
for f in sorted(glob.glob(f"{RAW}/page*.json")):
    rows += json.load(open(f))
refs = json.load(open(f"{RAW}/references.json"))
assert len(rows) == len({r["id"] for r in rows}) == 82754, len(rows)

TESTCODES = {"RWT", "RMT", "DMO", "NPT"}           # tests by their own event code
ADMIN = {"ADR"}                                     # administrative messages: not warnings
PERSON = {"CAE", "LEW", "BLU", "MEP"}               # codes whose text names people: withheld here
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
ERROR = re.compile(r"\b(in error|erroneous\w*|by mistake|mistaken\w*|false alarm|accidental\w*|inadvertent\w*|"
                   r"sent incorrectly|unintended|was not intended|(please )?disregard (the |this |that )?"
                   r"(previous|prior|earlier|last|above|message|alert|notification|siren))\b", re.I)
SAFE = re.compile(r"\b(found|located|recovered|safe|in custody|apprehended|arrested|captured|returned)\b", re.I)
CLEAR = re.compile(r"\b(all clear|lifted|is over|has ended|resolved|no longer|reopen\w*|restored|"
                   r"contained|extinguished|return home|may return|safe to return|no threat|no danger|"
                   r"no further threat|has passed|under control)\b", re.I)

# The word list above shortlists 24 warnings whose own words speak of error; each was read by hand.
# Kept: the 15 that retract an earlier message as wrong. Not kept (9): scope clarifications ("disregard
# previous message outside Baxter city limits"), a restored service, a person found, and "accidental
# ignition" / "accidentally severed" (the danger, not the message, was accidental).
RETRACTIONS = {
    "7adf9a34-7198-404c-9ff2-89aa445c4543",  # 2014-06-27 CEM, siren sounded in error
    "62ba0e5e-35a1-4a9f-be01-2c3d5359d66c",  # 2014-12-09 CEM, disregard the previous message
    "0c0f651e-b3d1-4141-9c5d-6159c153909c",  # 2018-01-13 CEM, Hawaii: false alarm, no missile threat
    "5d2d37fc-2922-4686-bc7e-c12a2374f9c3",  # 2018-05-21 CEM, accidental siren activation
    "0279ca58-9944-4521-a308-7f16b6378da2",  # 2020-07-28 LAE, dam sirens are a false alarm
    "54d62cf7-d862-4c4a-8362-13d87e7dcda2",  # 2021-04-03 LAE, sirens accidentally activated
    "9fbca45a-b668-4d04-9a69-fff1d31c0355",  # 2021-06-15 TOE, disregard the previous alert (names a person)
    "f135cc1c-beff-4b0b-b405-6407ec8d4760",  # 2021-07-26 CEM, evacuation warning sent in error
    "bcf98252-27a6-499c-8a23-eedce834ffd3",  # 2022-03-07 LAE, disregard the alert (names a person)
    "2e60e6de-820e-4912-b506-79ce85f6b401",  # 2022-05-10 EVI, disregard previous alert, no new evacuations
    "79a3f13f-ca17-41ad-8169-a84487af59eb",  # 2022-07-12 LAE, inadvertent nuclear-plant siren activation
    "cc4225b7-61f9-4568-973b-0d75da2d86a7",  # 2022-07-12 LAE, the same, sent again
    "27c7124d-996e-4a3d-b1f1-cf1735df405d",  # 2023-02-08 CEM, active shooter false alarm
    "98dff992-3063-4193-8854-9117d498f8ee",  # 2025-01-10 FRW, disregard last evacuation warning
    "5ac00875-3486-41c2-bc50-68d0ba5e1238",  # 2026-06-05 CEM, the last alert was in error
}

INSTITUTION = re.compile(r"(count|city|police|sheriff|fire|\bema\b|emergency|dep(artmen)?t|office|state|agency|"
                         r"manag|\boe[sm]\b|alert|district|universit|college|school|authority|patrol|town|"
                         r"village|parish|borough|fema|usgs|survey|safety|public|911|dispatch|ncmec|warning|"
                         r"system|emnet|security|government|tribe|tribal|nation|bureau|service|center|centre|"
                         r"port|transit|utilit|water|power|nuclear|hsem|division|commission|\bpd\b|\bso\b|"
                         r"\bhs\b|ipaws|homeland|military|guard|base|park|airport|campus)", re.I)

def L(i, a, b):  # the archive spells some keys two ways ('areas'/'area', 'parameters'/'parameter');
    return (i.get(a) or []) + (i.get(b) or [])   # read both (correction of 2026-10-15, session 174)

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
    s = " · ".join(dict.fromkeys(x.strip() for x in out if x and x.strip()))
    return re.sub(r"\s+", " ", s)

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
            # a sender name that does not read as an institution may be a person's: not shown
            return n if INSTITUTION.search(n) and "@" not in n else ""
    return ""   # sender addresses are never shown: some name a person

def state(r):
    for i in r["info"] or []:
        for a in L(i, "areas", "area"):
            for g in a.get("geocode") or []:
                if g["name"] == "SAME" and len(g["value"]) == 6:
                    return g["value"][1:3]
    return ""

def tmin(s):
    return int(dt.datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp() // 60)

byid = {}
byident = collections.defaultdict(list)
for r in rows:
    byid[r["id"]] = r
    byident[(r["sender"], r["identifier"])].append(r)
    byident[(None, r["identifier"])].append(r)

# link every follow-up to the message(s) it names in <references>
follow = collections.defaultdict(list)
linked = unlinked = 0
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
            follow[tgt[0]["id"]].append(r); linked += 1
        else:
            unlinked += 1

# a chain: follow-ups of follow-ups belong to the first warning
def chain(rid, seen=None):
    seen = seen or set()
    out = []
    for f in follow.get(rid, []):
        if f["id"] in seen:
            continue
        seen.add(f["id"]); out.append(f); out += chain(f["id"], seen)
    return out

stats = collections.Counter()
W = []
KEEP = set()
for r in rows:
    if r["msgType"] != "Alert":
        continue
    c = same(r)
    if c in TESTCODES:
        stats["test_by_code"] += 1; continue
    if c in ADMIN or c is None:
        stats["admin_or_uncoded"] += 1; continue
    txt = words(r)
    if TESTWORDS.search(txt) and not NOTTEST.search(txt):
        stats["test_by_words"] += 1; continue
    fu = sorted(chain(r["id"]), key=lambda x: x["sent"])
    cancels = [f for f in fu if f["msgType"] == "Cancel"]
    t0 = tmin(r["sent"])
    own_error = r["id"] in RETRACTIONS
    assert not own_error or ERROR.search(txt), r["id"]
    if cancels:
        cw = " · ".join(words(f) for f in cancels if words(f))
        if ERROR.search(cw):
            fate = "end-error"
        elif SAFE.search(cw) and c in PERSON:
            fate = "end-safe"
        elif CLEAR.search(cw):
            fate = "end-clear"
        else:
            fate = "end-mute"          # a Cancel with no words, or words that give no reason
        lag = tmin(cancels[0]["sent"]) - t0
    elif fu:
        fate, lag, cw = "update", tmin(fu[0]["sent"]) - t0, ""
    else:
        fate, lag, cw = "silence", None, ""
    withhold = c in PERSON or bool(PERSONWORDS.search(txt + " " + cw))
    W.append({"id": r["id"],  # FIELD: the one change
              "t": t0, "c": c, "f": fate, "l": lag, "s": state(r), "a": agency(r),
              "e": 1 if own_error else 0, "n": len(fu),
              "w": None if withhold else (wea(r) or txt)[:300],
              "x": None if (withhold or not cw) else cw[:300]})
    stats["warnings"] += 1
    KEEP.add(r["sender"])
    stats["fate:" + fate] += 1
    stats["withheld"] += withhold

W.sort(key=lambda w: w["t"])
fates = collections.Counter(w["f"] for w in W)
assert sum(fates.values()) == stats["warnings"]
summary = {
    "source": "FEMA OpenFEMA IpawsArchivedAlerts v1, senders other than the National Weather Service",
    "fetched": dt.date.today().isoformat(),
    "messages": len(rows), "followups_linked": linked, "followup_refs_unlinked": unlinked,
    "first": W[0]["t"], "last": W[-1]["t"],
    "counts": dict(stats), "fates": dict(fates),
    "by_code": {c: dict(collections.Counter(w["f"] for w in W if w["c"] == c)) for c in sorted({w["c"] for w in W})},
    "own_text_says_error": sum(w["e"] for w in W),
    "median_cancel_lag_min": sorted(w["l"] for w in W if w["f"].startswith("end"))[len([w for w in W if w["f"].startswith("end")]) // 2],
}
# the keepers: distinct sending accounts behind the warnings (addresses are counted, never shown)
summary["keepers"] = len(KEEP)
assert summary["own_text_says_error"] == len(RETRACTIONS)
summary["sent_in_error"] = fates.get("end-error", 0) + summary["own_text_says_error"]
# Hawaii, 2018-01-13: the missile warning, its Cancel, and the correction sent as a new message
hi = [r for r in rows if r["sent"].startswith("2018-01-13T18") and r["sender"].endswith("@hawaii.gov")]
hi.sort(key=lambda r: r["sent"])
assert [r["msgType"] for r in hi] == ["Alert", "Cancel", "Alert"], [r["msgType"] for r in hi]
assert hi[1]["info"] == [] or not hi[1]["info"], "the Cancel carries no words"
summary["hawaii"] = {"warning": hi[0]["sent"], "cancel": hi[1]["sent"], "correction": hi[2]["sent"],
                     "warning_words": wea(hi[0]), "correction_words": wea(hi[2]) or words(hi[2])[:200],
                     "t": tmin(hi[0]["sent"])}
json.dump(summary, open("summary.json", "w"), indent=1)
with open("data.js", "w") as fh:
    fh.write("// generated by build.py from FEMA's IPAWS archive (public domain); see summary.json\n")
    fh.write("window.NAMES=" + json.dumps(NAMES) + ";\n")
    fh.write("window.SUMMARY=" + json.dumps(summary) + ";\n")
    fh.write("window.W=" + json.dumps(W, separators=(",", ":"), ensure_ascii=False) + ";\n")
print(json.dumps(summary, indent=1))
