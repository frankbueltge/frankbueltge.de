"""Check 47: for which of study 44's blanks does the record hold a world of the same cut at another hour?

Usage: python3 -I analyse47.py ipc_global_area_long.csv results44.json FTS_DIR > results47.json
       python3 -I analyse47.py ipc_global_area_long.csv results44.json FTS_DIR --js > data47.js
FTS_DIR holds plans<Y>.json (api.hpc.tools/v1/public/plan/year/<Y>) and flow<Y>.json
(api.hpc.tools/v1/public/fts/flow?year=<Y>&groupby=plan) for 2021-2026.
Definitions are fixed in PREDICTIONS.md. Names: study 44's exact key; study 45's loose rule as sensitivity.
"""
import collections, csv, json, re, sys
from datetime import datetime

AREA, S44, FTS = sys.argv[1], sys.argv[2], sys.argv[3]
PH = "12345"
KINDS = ("Humanitarian response plan", "Humanitarian needs and response plan")
YEARS = range(2021, 2027)
TOL = 0.05
DROPT = {"urban", "rural", "town", "city", "sk", "district", "locality", "county"}  # study 45


def key(a):  # study 44, within a country
    return " ".join(a.lower().split())


def toks(a):  # study 45
    return frozenset(t for t in re.sub(r"[^\w\s]", " ", a.lower()).split() if t not in DROPT)


def loose(t1, t2):
    return bool(t1) and bool(t2) and (t1 <= t2 or t2 <= t1)


# --- money: coverage of the country's largest HRP / HNRP per year ---------------------------------
cov = {}
for y in YEARS:
    plans = json.load(open(f"{FTS}/plans{y}.json"))["data"]
    flows = json.load(open(f"{FTS}/flow{y}.json"))["data"]["report3"]["fundingTotals"]["objects"][0]
    funded = {int(o["id"]): o["totalFunding"] for o in flows["objectsBreakdown"] if o.get("id")}
    for p in plans:
        kinds = {c["name"] for c in p["categories"] if c.get("group") == "planType"}
        locs = [l["iso3"] for l in p["locations"] if l.get("adminLevel") == 0 and l.get("iso3")]
        req = p.get("revisedRequirements") or 0
        if not kinds & set(KINDS) or len(locs) != 1 or not req:
            continue
        c = locs[0]
        if (c, y) not in cov or req > cov[(c, y)]["required"]:
            cov[(c, y)] = dict(plan=p["id"], name=p["planVersion"]["name"], required=req,
                               funded=funded.get(p["id"], 0), coverage=funded.get(p["id"], 0) / req)

# --- IPC: per analysis, per place: classified in any period? --------------------------------------
g = collections.defaultdict(dict)
for r in csv.DictReader(open(AREA, newline="")):
    k = (r["Date of analysis"], r["Country"], r["Area"], r["Validity period"])
    g[k][r["Phase"]] = int(round(float(r["Number"] or 0)))
adate = {d: datetime.strptime(d, "%b %Y").date() for d in {k[0] for k in g}}
world = collections.defaultdict(lambda: collections.defaultdict(bool))  # country -> (analysis, area) -> cls
for (d, c, a, val), ph in g.items():
    world[c][(d, a)] |= sum(ph.get(p, 0) for p in PH) > 0


def worlds(x, match):
    """Other analyses of the blank's country that write the place: [(analysis, year, coverage, classified)]."""
    c, a0 = x["country"], x["analysis"]
    out = {}
    for (d, a), cl in world[c].items():
        if d == a0 or not match(x["area"], a):
            continue
        out[d] = out.get(d, False) or cl
    rows = []
    for d, cl in sorted(out.items(), key=lambda t: adate[t[0]]):
        y = adate[d].year
        cv = cov.get((c, y), {}).get("coverage")
        rows.append(dict(analysis=d, year=y, coverage=cv, classified=cl))
    return rows


def classify(x, ws, tol=TOL, no2026=False):
    c0 = cov.get((x["country"], x["year"]), {}).get("coverage")
    if c0 is None:
        return "X", None
    cl = [w for w in ws if w["classified"] and not (no2026 and w["year"] == 2026)]
    bound = [w for w in cl if w["coverage"] is not None and w["coverage"] <= c0 + tol]
    if bound:
        return "S", bound
    return ("R" if cl else "N"), None


EXACT = lambda a, b: key(a) == key(b)
LOOSE = lambda a, b: loose(toks(a), toks(b))

blanks = [x for x in json.load(open(S44))["drops"] if 2021 <= x["year"] <= 2025]
rows = []
for x in blanks:
    we, wl = worlds(x, EXACT), worlds(x, LOOSE)
    cat, bound = classify(x, we)
    near = None
    if bound:
        a0 = adate[x["analysis"]]
        nb = min(bound, key=lambda w: abs((adate[w["analysis"]] - a0).days))
        near = dict(analysis=nb["analysis"], after=adate[nb["analysis"]] > a0, coverage=nb["coverage"])
    rows.append(dict(analysis=x["analysis"], year=x["year"], country=x["country"], area=x["area"], worlds_loose=wl,
                     validity=x["validity"], enc=x["enc"], people=x["people"], outcome44=x["outcome"],
                     c0=cov.get((x["country"], x["year"]), {}).get("coverage"), cat=cat, nearest=near,
                     cat_loose=classify(x, wl)[0], cat_tol0=classify(x, we, 0.0)[0],
                     cat_tol10=classify(x, we, 0.10)[0], cat_no2026=classify(x, we, no2026=True)[0],
                     worlds=we))


def count(field):
    return dict(collections.Counter(r[field] for r in rows))


cats = count("cat")
S, R, N = (cats.get(k, 0) for k in "SRN")
sdn = [r for r in rows if r["country"] == "SDN" and r["analysis"] == "Sep 2025"]
sb = [r for r in rows if r["cat"] == "S"]
after = sum(1 for r in sb if r["nearest"]["after"])
scores = dict(
    E1=dict(S=S, R=R, N=N, held=S > R and S > N),
    E2=dict(R=R, held=R < 10),
    E3=dict(n=len(sdn), S=sum(1 for r in sdn if r["cat"] == "S"),
            held=sum(1 for r in sdn if r["cat"] == "S") >= 3),
    E4=dict(S_exact=S, S_loose=count("cat_loose").get("S", 0),
            held=count("cat_loose").get("S", 0) - S >= 3),
    E5=dict(S=len(sb), nearest_after=after, held=bool(sb) and after > len(sb) / 2),
)
# post hoc, not predicted: the cut as funded dollars, not as a share of a requirement that itself moves
def by_dollars(x, ws):
    f0 = cov.get((x["country"], x["year"]), {}).get("funded")
    if f0 is None:
        return "X"
    cl = [w for w in ws if w["classified"]]
    b = [w for w in cl if (x["country"], w["year"]) in cov and cov[(x["country"], w["year"])]["funded"] <= f0 * 1.05]
    return "S" if b else ("R" if cl else "N")


posthoc = dict(dollars_exact=dict(collections.Counter(by_dollars(x, r["worlds"]) for x, r in zip(blanks, rows))),
               dollars_loose=dict(collections.Counter(by_dollars(x, r["worlds_loose"]) for x, r in zip(blanks, rows))))
res = dict(check=47, posthoc=posthoc, n=len(rows), categories=cats, sensitivity=dict(
    loose=count("cat_loose"), tol0=count("cat_tol0"), tol10=count("cat_tol10"), no2026=count("cat_no2026")),
    scores=scores,
    coverage={f"{c}-{y}": round(v["coverage"], 4) for (c, y), v in sorted(cov.items())},
    plans={f"{c}-{y}": dict(plan=v["plan"], name=v["name"], required=v["required"], funded=v["funded"])
           for (c, y), v in sorted(cov.items())},
    rows=rows)
if "--js" in sys.argv:
    slim = [dict(a=r["analysis"], c=r["country"], n=r["area"], v=r["validity"], p=r["people"], c0=r["c0"],
                 k=r["cat"], kl=r["cat_loose"], k6=r["cat_no2026"],
                 w=[[w["analysis"], w["coverage"], int(w["classified"])] for w in r["worlds"]],
                 wl=[[w["analysis"], w["coverage"], int(w["classified"])] for w in r["worlds_loose"]]) for r in rows]
    print("window.CHECK47=" + json.dumps(dict(categories=cats, sensitivity=res["sensitivity"], scores=scores,
                                               rows=slim), separators=(",", ":")) + ";")
else:
    print(json.dumps(res, indent=1, default=str))
