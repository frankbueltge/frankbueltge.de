"""Study 45: a dose fixed before 2025 (the US share of 2022 funding) against the reach of the open record,
and a loose name match for study 44's drops.

Usage: python3 -I analyse45.py ipc_global_area_long.csv studio/etudes/the-remainder results44.json > results45.json
       python3 -I analyse45.py ipc_global_area_long.csv studio/etudes/the-remainder results44.json --js > data45.js
Definitions are fixed in PREDICTIONS-45.md. Plans and the Cadre Harmonise set as in analyse.py (study 43).
"""
import collections, csv, json, random, re, sys
from datetime import date, datetime

AREA, LEDGERS = sys.argv[1], sys.argv[2]
PH = "12345"
CH = {"BEN", "BFA", "CIV", "CMR", "CPV", "GHA", "GIN", "GMB", "GNB", "LBR", "MLI", "MRT", "NER", "NGA", "SEN",
      "SLE", "TCD", "TGO"}
ISO = {"Afghanistan": "AFG", "Burkina Faso": "BFA", "Burundi": "BDI", "Cameroon": "CMR", "Colombia": "COL",
       "El Salvador": "SLV", "Ethiopia": "ETH", "Guatemala": "GTM", "Haïti": "HTI", "Haiti": "HTI",
       "Honduras": "HND", "Iraq": "IRQ", "Libya": "LBY", "Mali": "MLI", "Mozambique": "MOZ", "Myanmar": "MMR",
       "Niger ": "NER", "Nigeria": "NGA", "Occupied Palestinian Territory": "PSE",
       "République Centrafricaine": "CAF", "République Démocratique du Congo": "COD", "Somalia": "SOM",
       "South Sudan": "SSD", "Sudan": "SDN", "Syrian Arab Republic": "SYR", "Tchad": "TCD", "Ukraine": "UKR",
       "Venezuela": "VEN", "Yemen": "YEM"}
KINDS = ("Humanitarian response plan", "Humanitarian needs and response plan")


def iso(name):
    hits = [v for k, v in ISO.items() if (name + " ").startswith(k)]
    return max(hits, key=len) if hits else None


def day(s):
    return date.fromisoformat(s) if s else None


# --- IPC: one record per area-period -------------------------------------------------------------
g = collections.defaultdict(lambda: dict(ph={}, frm=None, to=None))
for r in csv.DictReader(open(AREA, newline="")):
    k = (r["Date of analysis"], r["Country"], r["Level 1"], r["Area"], r["Validity period"])
    g[k]["ph"][r["Phase"]] = int(round(float(r["Number"] or 0)))
    g[k]["frm"], g[k]["to"] = day(r["From"]), day(r["To"])
adate = {d: datetime.strptime(d, "%b %Y").date() for d in {k[0] for k in g}}


def classified(v):
    return sum(v["ph"].get(p, 0) for p in PH) > 0


# reached people per (country, year): largest classified current population over that year's analyses
reach = collections.defaultdict(lambda: collections.Counter())
cells = collections.defaultdict(lambda: [0, 0])  # (country, year) -> [blank, all] current area-periods
for (d, c, l1, a, val), v in g.items():
    if val != "current":
        continue
    y = adate[d].year
    cells[(c, y)][1] += 1
    if classified(v):
        reach[(c, y)][d] += v["ph"].get("all", 0)
    else:
        cells[(c, y)][0] += 1


def reached(c, y):
    return max(reach[(c, y)].values()) if reach[(c, y)] else 0


# --- FTS: plans, coverage, US share ----------------------------------------------------------------
plans = {}
for yr in (2022, 2025):
    led = json.load(open(f"{LEDGERS}/data-{yr}.json"))
    us = {i for i, n in enumerate(led["donors"]) if n.startswith("United States of America")}
    for p in led["years"]:
        if p["kind"] not in KINDS or not p["required"]:
            continue
        c = iso(p["name"])
        assert c, p["name"]
        if (c, yr) not in plans or p["required"] > plans[(c, yr)]["required"]:
            tot = sum(f[0] for f in p["flows"])
            usd = sum(f[0] for f in p["flows"] if f[2] in us)
            plans[(c, yr)] = dict(plan_id=p["plan_id"], required=p["required"], funded=p["funded"],
                                  flows_total=tot, us=usd, us_share=usd / tot if tot else None)

rows = []
for c in sorted({c for c, _ in plans}):
    if c in CH or (c, 2022) not in plans or (c, 2025) not in plans or (c, 2022) not in cells:
        continue
    p0, p1 = plans[(c, 2022)], plans[(c, 2025)]
    r0, r1 = reached(c, 2022), reached(c, 2025)
    b0 = cells[(c, 2022)][0] / cells[(c, 2022)][1]
    b1 = cells[(c, 2025)][0] / cells[(c, 2025)][1] if (c, 2025) in cells else None
    rows.append(dict(country=c, us_share=p0["us_share"], us2022=p0["us"], us2025=p1["us"],
                     us_ratio=p1["us"] / p0["us"] if p0["us"] else None,
                     dcov=p1["funded"] / p1["required"] - p0["funded"] / p0["required"],
                     reached2022=r0, reached2025=r1, reach_ratio=r1 / r0 if r0 else None,
                     leaver=(c, 2025) not in cells, blank2022=b0, blank2025=b1,
                     dblank=None if b1 is None else b1 - b0,
                     areas2022=cells[(c, 2022)][1], areas2025=cells[(c, 2025)][1] if (c, 2025) in cells else 0))


def ranks(v):
    o = sorted(range(len(v)), key=lambda i: v[i])
    r = [0.0] * len(v)
    i = 0
    while i < len(o):
        j = i
        while j + 1 < len(o) and v[o[j + 1]] == v[o[i]]:
            j += 1
        for k in range(i, j + 1):
            r[o[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def spearman(x, y):
    rx, ry = ranks(x), ranks(y)
    mx, my = sum(rx) / len(rx), sum(ry) / len(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** 0.5
    return num / den if den else float("nan")


def test(x, y, seed):
    rho = spearman(x, y)
    rnd, boot = random.Random(seed), []
    for _ in range(10000):
        s = [rnd.randrange(len(x)) for _ in x]
        bx, by = [x[i] for i in s], [y[i] for i in s]
        if len(set(bx)) > 1 and len(set(by)) > 1:
            boot.append(spearman(bx, by))
    boot.sort()
    ci = [boot[int(0.025 * len(boot))], boot[int(0.975 * len(boot)) - 1]]
    return dict(n=len(x), rho=rho, ci95=ci, informative=not (ci[0] <= 0 <= ci[1]))


ok = [r for r in rows if r["reach_ratio"] is not None]
d1 = test([r["us_share"] for r in ok], [r["reach_ratio"] for r in ok], 451)
d2 = test([r["dcov"] for r in ok], [r["reach_ratio"] for r in ok], 452)
st = [r for r in rows if r["dblank"] is not None]
d3 = test([r["us_share"] for r in st], [r["dblank"] for r in st], 453)


def median(v):
    v = sorted(v)
    n = len(v)
    return None if not n else (v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2)


lv, stay = [r["us_share"] for r in rows if r["leaver"]], [r["us_share"] for r in rows if not r["leaver"]]
d4 = dict(leavers=[r["country"] for r in rows if r["leaver"]], median_leavers=median(lv), median_stay=median(stay),
          held=bool(lv) and median(lv) > median(stay))

# --- D5: study 44's drops under the loose name match ----------------------------------------------
DROPT = {"urban", "rural", "town", "city", "sk", "district", "locality", "county"}


def toks(a):
    return frozenset(t for t in re.sub(r"[^\w\s]", " ", a.lower()).split() if t not in DROPT)


def loose(t1, t2):
    return bool(t1) and bool(t2) and (t1 <= t2 or t2 <= t1)


S44 = json.load(open(sys.argv[3])) if len(sys.argv) > 3 and sys.argv[3].endswith(".json") else None
drops = []
cls = collections.defaultdict(list)  # country -> [(analysis date, tokens, from, to)]
for (d, c, l1, a, val), v in g.items():
    if classified(v):
        cls[c].append((adate[d], toks(a), v["frm"], v["to"]))
src = S44["drops"] if S44 else []
for x in src:
    if not 2021 <= x["year"] <= 2025:
        continue
    t, f0, t0, a0 = toks(x["area"]), day(x["frm"]), day(x["to"]), datetime.strptime(x["analysis"], "%b %Y").date()
    later = [s for s in cls[x["country"]] if s[0] > a0 and loose(t, s[1])]
    over = [s for s in later if s[2] and s[3] and f0 and t0 and s[2] <= t0 and s[3] >= f0]
    drops.append(dict(analysis=x["analysis"], country=x["country"], area=x["area"], exact=x["outcome"],
                      loose="F" if over else ("L" if later else "N")))
nF = sum(1 for x in drops if x["loose"] == "F")
d5 = dict(n=len(drops), F_exact=sum(1 for x in drops if x["exact"] == "F"), F_loose=nF,
          F_share_loose=nF / len(drops) if drops else None, held=bool(drops) and nF / len(drops) < 0.5,
          changed=[x for x in drops if x["loose"] != x["exact"]])

scores = dict(D1=dict(**d1, held=d1["rho"] <= -0.30), D2=dict(**d2, held=d2["rho"] >= 0.30),
              D3=dict(**d3, held=d3["rho"] >= 0.30), D4=d4, D5=d5)
# Post hoc (written after D1 was read): D1 leaving out one country at a time, and the realised US cut
# (US 2025 / US 2022) in place of the pre-fixed share.
loo = {r["country"]: spearman([s["us_share"] for s in ok if s is not r], [s["reach_ratio"] for s in ok if s is not r])
       for r in ok}
posthoc = dict(D1_leave_one_out=loo, D1_loo_range=[min(loo.values()), max(loo.values())],
               realised_us_cut=test([r["us_ratio"] for r in ok], [r["reach_ratio"] for r in ok], 454))
out = dict(study=45, scores=scores, posthoc=posthoc, rows=rows)
if "--js" in sys.argv:
    sys.stdout.write("window.STUDY45=" + json.dumps(dict(scores=scores, posthoc=posthoc, rows=rows),
                                                     separators=(",", ":")) + ";\n")
else:
    json.dump(out, sys.stdout, indent=1)
