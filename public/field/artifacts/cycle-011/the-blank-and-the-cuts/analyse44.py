"""Study 44: is a projection's blank a blank of the place or of the hour?

Usage: python3 -I analyse44.py ipc_global_area_long.csv > results44.json
       python3 -I analyse44.py ipc_global_area_long.csv --js > data44.js
Definitions are fixed in PREDICTIONS-44.md. Encodings A, B, C as in session 234's summarize.py.
"""
import csv, collections, json, sys
from datetime import date, datetime

AREA = sys.argv[1]
PH = "12345"
CH = {"BEN", "BFA", "CIV", "CMR", "CPV", "GHA", "GIN", "GMB", "GNB", "LBR", "MLI", "MRT", "NER", "NGA", "SEN",
      "SLE", "TCD", "TGO"}  # as in analyse.py (study 43)
SIX = {"al fasher urban", "kadugli urban", "dilling rural", "as sunut", "al lagowa", "habila - sk"}


def key(c, a):
    return (c, " ".join(a.lower().split()))


def day(s):
    return date.fromisoformat(s) if s else None


# --- one record per area-period ----------------------------------------------------------------
g = collections.defaultdict(lambda: dict(ph={}, frm=None, to=None))
for r in csv.DictReader(open(AREA, newline="")):
    k = (r["Date of analysis"], r["Country"], r["Level 1"], r["Area"], r["Validity period"])
    g[k]["ph"][r["Phase"]] = int(round(float(r["Number"] or 0)))
    g[k]["frm"], g[k]["to"] = day(r["From"]), day(r["To"])


def classified(v):
    return sum(v["ph"].get(p, 0) for p in PH) > 0


def enc(v):
    if not any(p in v["ph"] for p in PH):
        return "A"
    return "B" if v["ph"].get("all", 0) == 0 else "C"


adate = {d: datetime.strptime(d, "%b %Y").date() for d in {k[0] for k in g}}

# classified periods by name key, for the later-fill test
seen = collections.defaultdict(list)  # name key -> [(analysis date, from, to)]
cur = {}  # (analysis, name key) -> classified current?
for (d, c, l1, a, val), v in g.items():
    nk = key(c, a)
    if classified(v):
        seen[nk].append((adate[d], v["frm"], v["to"]))
    if val == "current":
        cur[(d, nk)] = cur.get((d, nk), False) or classified(v)

drops = []
for (d, c, l1, a, val), v in g.items():
    if val == "current" or classified(v):
        continue
    nk = key(c, a)
    if not cur.get((d, nk)):
        continue
    later = [s for s in seen[nk] if s[0] > adate[d]]
    over = [s for s in later if s[1] and s[2] and v["frm"] and v["to"] and s[1] <= v["to"] and s[2] >= v["frm"]]
    out = "F" if over else ("L" if later else "N")
    first = min(over)[0].strftime("%b %Y") if over else None
    drops.append(dict(analysis=d, year=adate[d].year, country=c, level1=l1, area=a, validity=val, enc=enc(v),
                      people=v["ph"].get("all", 0), frm=str(v["frm"]), to=str(v["to"]), outcome=out,
                      filled_by=first, ch=c in CH))

win = [x for x in drops if 2021 <= x["year"] <= 2025]


def tally(rows):
    n = len(rows)
    t = collections.Counter(x["outcome"] for x in rows)
    return dict(n=n, F=t["F"], L=t["L"], N=t["N"], F_share=t["F"] / n if n else None,
                people=sum(x["people"] for x in rows))


by_year = []
for y in range(2021, 2027):
    a = [x for x in drops if x["year"] == y]
    b = [x for x in a if not x["ch"]]
    by_year.append(dict(year=y, all=tally(a), without_ch=tally(b),
                        analyses_with_drops=len({(x["analysis"], x["country"]) for x in b})))

# monthly analyses
months = collections.Counter()
for d, c, *_ in g:
    months[(adate[d].year, adate[d].month)] += 0
pairs = {(d, k[1]) for k in g for d in [k[0]]}
for d, c in pairs:
    months[(adate[d].year, adate[d].month)] += 1
monthly = [dict(year=y, month=m, analyses=months.get((y, m), 0)) for y in range(2021, 2027) for m in range(1, 13)]


def h1(y):
    return sum(months.get((y, m), 0) for m in range(1, 7))


six = [x for x in drops if x["analysis"] == "Sep 2025" and x["country"] == "SDN" and key("SDN", x["area"])[1] in SIX]
six_areas = {key("SDN", x["area"])[1] for x in six}
six_filled = {key("SDN", x["area"])[1] for x in six if x["outcome"] == "F"}
pre = [x for x in win if x["year"] <= 2024 and not x["ch"]]
y25 = [x for x in win if x["year"] == 2025 and not x["ch"]]
yb = {r["year"]: r for r in by_year}
mean_h1 = sum(h1(y) for y in (2022, 2023, 2024)) / 3
scores = {
    "R1": dict(areas=sorted(six_areas), filled=sorted(six_filled), held=len(six_areas) == 6 and len(six_filled) == 6),
    "R2": dict(**tally(win), held=tally(win)["F_share"] >= 0.5),
    "R3": dict(F2025=tally(y25)["F_share"], F2021_24=tally(pre)["F_share"],
               held=tally(y25)["F_share"] <= tally(pre)["F_share"] - 0.10),
    "R4": dict(value=yb[2025]["without_ch"]["n"], against=max(yb[y]["without_ch"]["n"] for y in range(2021, 2025)),
               held=yb[2025]["without_ch"]["n"] > max(yb[y]["without_ch"]["n"] for y in range(2021, 2025))),
    "R5": dict(value=h1(2025), against=mean_h1, h1={y: h1(y) for y in range(2021, 2027)}, held=h1(2025) >= 0.8 * mean_h1),
}
# Post hoc (written after R1 was read): the three Sudan drops scored N are urban or rural parts of a
# locality. A later analysis may classify the whole locality instead. Strip a trailing "urban"/"rural"
# and match the rest exactly, within the same country and Level 1, for an overlapping period.
redrawn = []
for x in six:
    if x["outcome"] != "N":
        continue
    w = key("SDN", x["area"])[1].split()
    base = " ".join(w[:-1]) if w[-1] in ("urban", "rural") else " ".join(w)
    f0, t0 = day(x["frm"]), day(x["to"])
    for (d, c, l1, a, val), v in g.items():
        if c == "SDN" and l1 == x["level1"] and key(c, a)[1] == base and adate[d] > adate[x["analysis"]] \
                and classified(v) and v["frm"] <= t0 and v["to"] >= f0:
            redrawn.append(dict(drop=x["area"], by=a, analysis=d, validity=val, people=v["ph"].get("all", 0),
                                phase5=v["ph"].get("5", 0)))
out = dict(study=44, scores=scores, posthoc_sudan_redrawn=redrawn, by_year=by_year, monthly=monthly,
           sudan_sep2025=[x for x in drops if x["analysis"] == "Sep 2025" and x["country"] == "SDN"], drops=drops)
if "--js" in sys.argv:
    keep = ("analysis", "country", "level1", "area", "validity", "enc", "people", "frm", "to", "outcome", "filled_by")
    js = dict(scores=scores, redrawn=redrawn, monthly=monthly, drops=[{k: x[k] for k in keep} for x in drops])
    sys.stdout.write("window.STUDY44=" + json.dumps(js, separators=(",", ":")) + ";\n")
else:
    json.dump(out, sys.stdout, indent=1)
