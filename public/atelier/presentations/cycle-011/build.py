# The Mortar (cycle 011), build. Reads two open files and writes mortar.json, which the page loads.
#   python3 -I build.py ipc_global_area_long.csv data-v.json > mortar.json
# ipc_global_area_long.csv: HDX, Global: Acute Food Insecurity Country Data (CC0). Not committed.
# data-v.json: the Studio's etudes/the-remainder/data-v.json (OCHA FTS grants to Sudan by date, and FEWS NET's
#   Sudan months from the Field's timeline). Not committed; taken up from handoff ho-2026-10-28-studio-2.
import collections, csv, hashlib, json, sys

AREA, STUDIO = sys.argv[1], sys.argv[2]
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
ANALYSES = ["Apr 2024", "Oct 2024", "Sep 2025", "Jan 2026"]
# One place, four ways the analyses drew it. Names as the table writes them; the units differ (see "units").
PLACES = [
    ("El Fasher town", "North Darfur", {"Apr 2024": ["Al fasher"], "Oct 2024": ["Al fasher"], "Sep 2025": ["Al Fasher Urban"], "Jan 2026": ["Al Fasher"]}),
    ("Kadugli town", "South Kordofan", {"Apr 2024": ["Kadugli"], "Oct 2024": ["Kadugli"], "Sep 2025": ["Kadugli Urban"], "Jan 2026": ["Kadugli"]}),
    ("Dilling", "South Kordofan", {"Apr 2024": ["Dilling"], "Oct 2024": ["Dilling"], "Sep 2025": ["Dilling Rural", "Dilling Urban"], "Jan 2026": ["Dilling"]}),
    ("Habila", "South Kordofan", {"Apr 2024": ["Habila - sk"], "Oct 2024": ["Habila - sk"], "Sep 2025": ["Habila - sk"], "Jan 2026": ["Habila - SK"]}),
    ("Al Lagowa", "West Kordofan", {"Apr 2024": ["Al lagowa"], "Oct 2024": ["Al lagowa"], "Sep 2025": ["Al lagowa"], "Jan 2026": ["Al Lagowa"]}),
    ("As Sunut", "West Kordofan", {"Apr 2024": ["As sunut"], "Oct 2024": ["As sunut"], "Sep 2025": ["As sunut"], "Jan 2026": ["As Sunut"]}),
]
PH = ["1", "2", "3", "4", "5"]

rows = collections.defaultdict(dict)
for r in csv.DictReader(open(AREA, newline="")):
    if r["Country"] == "SDN" and r["Date of analysis"] in ANALYSES:
        k = (r["Date of analysis"], r["Validity period"], r["Level 1"], r["Area"], r["From"], r["To"])
        rows[k][r["Phase"]] = int(float(r["Number"] or 0))

places = []
for name, l1, names in PLACES:
    lanes = {}
    for an in ANALYSES:
        segs = []
        for (a, vp, lv, ar, f, t), v in rows.items():
            if a == an and lv == l1 and ar in names[an]:
                segs.append((vp, f, t, ar, v))
        per = collections.OrderedDict()
        for vp, f, t, ar, v in sorted(segs, key=lambda s: s[1]):
            p = per.setdefault((vp, f, t), {"period": vp, "from": f, "to": t, "all": 0, "phases": [0] * 5, "rows": []})
            p["all"] += v.get("all", 0)
            for i, ph in enumerate(PH):
                p["phases"][i] += v.get(ph, 0)
            p["rows"].append({"area": ar, "all": v.get("all", 0), "has_phase_rows": any(ph in v for ph in PH)})
        for p in per.values():
            p["classified"] = sum(p["phases"]) > 0
        lanes[an] = list(per.values())
    places.append({"name": name, "level1": l1, "table_names": names, "lanes": lanes})

# The blank: the Sep 2025 analysis, second projection (Feb-May 2026), counted with the first projection's people,
# as the IPC's own sentence counts it ("approximately 841,000").
blank = sum(next(p for p in pl["lanes"]["Sep 2025"] if p["period"] == "first projection")["all"] for pl in places)
assert blank == 841404, blank
for pl in places:
    p2 = next(p for p in pl["lanes"]["Sep 2025"] if p["period"] == "second projection")
    assert not p2["classified"], pl["name"]
    jan = next(p for p in pl["lanes"]["Jan 2026"] if p["period"] == "current")
    assert (jan["from"], jan["to"]) == ("2026-02-01", "2026-05-31") and jan["classified"], pl["name"]
    oct2 = next(p for p in pl["lanes"]["Oct 2024"] if p["period"] == "second projection")
    assert oct2["classified"], pl["name"]

d = json.load(open(STUDIO))
US = {"United States Department of State", "United States of America, Government of"}  # governments only; the
us_idx = {i for i, n in enumerate(d["donors"]) if n in US}                            # private UNICEF committee is not
money = collections.OrderedDict((m["month"], {"all": 0, "us": 0}) for m in d["months"])
for amt, date, di, paid, yr in d["grants"]:
    k = date[:7]
    if k in money:
        money[k]["all"] += amt
        money[k]["us"] += amt if di in us_idx else 0
monitor = {m["month"]: m["analysis"] for m in d["months"]}
dark = d["months_without_analysis"]

# Session 2. Per place: its weight in the blank (the first projection's people, as the IPC's 841,000 counts them),
# whether the blank row itself still carries the people, and the area phase each borrowed analysis gives it
# (the IPC's 20 % rule: the highest phase that, with the phases above it, holds at least a fifth of the people).
def area_phase(ph):
    tot = sum(ph)
    for i in range(4, -1, -1):
        if tot and sum(ph[i:]) / tot >= 0.2:
            return i + 1
    return None
for pl in places:
    seg = lambda an, per: next(p for p in pl["lanes"][an] if p["period"] == per)
    pl["weight"] = seg("Sep 2025", "first projection")["all"]
    pl["blank_row_people"] = seg("Sep 2025", "second projection")["all"]
    pl["verdicts"] = {"Oct 2024": area_phase(seg("Oct 2024", "second projection")["phases"]),
                      "Sep 2025": area_phase(seg("Sep 2025", "first projection")["phases"]),
                      "Jan 2026": area_phase(seg("Jan 2026", "current")["phases"])}
# A fourth world at the grain of places: each place classified or still blank. Only 2^6 shares are possible.
W = [pl["weight"] for pl in places]
worlds = sorted(({"set": [i for i in range(6) if m >> i & 1], "share": sum(W[i] for i in range(6) if m >> i & 1) / blank}
                 for m in range(64)), key=lambda w: w["share"])

# The cut as degrees. For each analysis, the six months before the month it was written in, as far as the Studio's
# months reach (they begin in Jul 2024): the United States government's money per month against its Jul-Dec 2024
# rate, and the share of those months in which FEWS NET published on Sudan.
mo = [m["month"] for m in d["months"]]
base = sum(money[k]["us"] for k in mo if "2024-07" <= k <= "2024-12") / 6
WINDOWS = {"Oct 2024": ("2024-04", "2024-09"), "Sep 2025": ("2025-03", "2025-08"), "Jan 2026": ("2025-07", "2025-12")}
degrees = {}
for an, (a, b) in WINDOWS.items():
    ks = [k for k in mo if a <= k <= b]
    degrees[an] = {"window": [a, b], "months_held": [ks[0], ks[-1]], "n": len(ks),
                   "money": round(sum(money[k]["us"] for k in ks) / len(ks) / base, 3),
                   "monitor": round(sum(1 for k in ks if monitor[k]) / len(ks), 3),
                   "monitor_months": sum(1 for k in ks if monitor[k])}
assert degrees["Sep 2025"]["monitor"] == 0 and degrees["Jan 2026"]["monitor_months"] == 4

json.dump({
    "_note": "Built by build.py. Six places the IPC named as unclassified in its Sep 2025 analysis's second projection (Feb-May 2026), as four Sudan analyses of HDX's open table write them; and, beside them, the money recorded toward Sudan's appeals and the famine monitor's Sudan months.",
    "sources": {
        "ipc": {"cite": "HDX, Global: Acute Food Insecurity Country Data, ipc_global_area_long.csv (CC0; source: National IPC Technical Working Group)",
                "url": "https://data.humdata.org/dataset/global-acute-food-insecurity-country-data", "sha256": sha(AREA), "fetched": "2026-10-29"},
        "studio": {"cite": "The Studio, The Remainder, fifth movement, data-v.json (OCHA FTS grants, CC BY-IGO; FEWS NET months from the Field's dark-months timeline, CC0)",
                   "url": "https://github.com/frankbueltge/studio/tree/main/etudes/the-remainder", "sha256": sha(STUDIO), "fetched": "2026-10-29",
                   "handoff": "ho-2026-10-28-studio-2"},
    },
    "units": "The analyses do not draw the same places. Oct 2024 counts El Fasher as a whole locality (315,660 people), Sep 2025 splits the town (300,000) from the rest (91,313, not shown), Jan 2026 counts the locality again (522,452). Kadugli and Dilling are split differently too. So a lane compares a place's verdict, not its people.",
    "blank": {"people": blank, "analysis": "Sep 2025", "period": "second projection", "from": "2026-02-01", "to": "2026-05-31"},
    "places": places,
    "money": [{"month": k, **v} for k, v in money.items()],
    "monitor": monitor, "dark": dark,
    "worlds": worlds, "degrees": degrees, "money_base_us_per_month": base,
}, sys.stdout, indent=1)
