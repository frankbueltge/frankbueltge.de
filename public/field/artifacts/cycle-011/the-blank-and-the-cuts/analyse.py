"""Study 43: the blank in the IPC's open record, by year, against the fall in humanitarian funding.

Usage: python3 -I analyse.py ipc_global_area_long.csv studio/etudes/the-remainder > results.json
Definitions are fixed in PREDICTIONS.md. Encodings A, B, C as in session 234's summarize.py.
"""
import csv, collections, json, random, sys
from datetime import datetime

AREA, LEDGERS = sys.argv[1], sys.argv[2]
PH = "12345"

# --- IPC: current rows, one record per area-period ---------------------------------------------
g = collections.defaultdict(dict)
for r in csv.DictReader(open(AREA, newline="")):
    if r["Validity period"] != "current":
        continue
    g[(r["Date of analysis"], r["Country"], r["Level 1"], r["Area"])][r["Phase"]] = int(round(float(r["Number"] or 0)))

cy = collections.defaultdict(lambda: dict(people=0, blank=0, A=0, B=0, C=0, area_periods=0, analyses=set()))
for (d, c, l1, a), v in g.items():
    y = datetime.strptime(d, "%b %Y").year
    x = cy[(c, y)]
    x["analyses"].add(d)
    x["area_periods"] += 1
    x["people"] += v.get("all", 0)
    if sum(v.get(p, 0) for p in PH) > 0:
        continue
    if not any(p in v for p in PH):
        x["A"] += 1
    elif v.get("all", 0) == 0:
        x["B"] += 1
    else:
        x["C"] += 1
        x["blank"] += v["all"]

years = sorted({y for _, y in cy})
by_year = []
for y in years:
    rows = [x for (c, yy), x in cy.items() if yy == y]
    p, b = sum(x["people"] for x in rows), sum(x["blank"] for x in rows)
    by_year.append(dict(year=y, countries=len(rows), analyses=sum(len(x["analyses"]) for x in rows),
                        people=p, blank=b, share=b / p if p else None,
                        A=sum(x["A"] for x in rows), B=sum(x["B"] for x in rows), C=sum(x["C"] for x in rows),
                        blank_countries=sorted(((c, x["blank"]) for (c, yy), x in cy.items() if yy == y and x["blank"]),
                                               key=lambda t: -t[1])))

# --- FTS: the Studio's ledgers -------------------------------------------------------------------
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


plans = {}
for yr in (2022, 2025):
    led = json.load(open(f"{LEDGERS}/data-{yr}.json"))
    for p in led["years"]:
        if p["kind"] not in KINDS or not p["required"]:
            continue
        c = iso(p["name"])
        assert c, p["name"]
        if (c, yr) not in plans or p["required"] > plans[(c, yr)]["required"]:
            plans[(c, yr)] = dict(plan_id=p["plan_id"], name=p["name"], required=p["required"], funded=p["funded"])

matched = []
for c in sorted({c for c, _ in plans}):
    if (c, 2022) in plans and (c, 2025) in plans and (c, 2022) in cy and (c, 2025) in cy:
        a, b = cy[(c, 2022)], cy[(c, 2025)]
        p0, p1 = plans[(c, 2022)], plans[(c, 2025)]
        matched.append(dict(country=c, cov2022=p0["funded"] / p0["required"], cov2025=p1["funded"] / p1["required"],
                            funded2022=p0["funded"], funded2025=p1["funded"],
                            share2022=a["blank"] / a["people"] if a["people"] else 0.0,
                            share2025=b["blank"] / b["people"] if b["people"] else 0.0,
                            blank2022=a["blank"], blank2025=b["blank"], people2025=b["people"],
                            plans=[p0["plan_id"], p1["plan_id"]]))
for m in matched:
    m["dcov"] = m["cov2025"] - m["cov2022"]
    m["dshare"] = m["share2025"] - m["share2022"]
unmatched_plans = sorted(c for c in {c for c, _ in plans} if c not in {m["country"] for m in matched})


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


x, y = [m["dcov"] for m in matched], [m["dshare"] for m in matched]
rho = spearman(x, y)
rnd = random.Random(43)
boot = []
for _ in range(10000):
    s = [rnd.randrange(len(x)) for _ in x]
    bx, by = [x[i] for i in s], [y[i] for i in s]
    if len(set(bx)) > 1 and len(set(by)) > 1:
        boot.append(spearman(bx, by))
boot.sort()
ci = [boot[int(0.025 * len(boot))], boot[int(0.975 * len(boot)) - 1]]

# P4: top half of coverage loss (most negative dcov first)
order = sorted(matched, key=lambda m: m["dcov"])
top = order[: len(order) // 2]
blank_total = sum(m["blank2025"] for m in matched)
top_share = sum(m["blank2025"] for m in top) / blank_total if blank_total else None

yr = {r["year"]: r for r in by_year}
pre = [yr[y] for y in (2021, 2022, 2023, 2024)]
pooled_pre = sum(r["blank"] for r in pre) / sum(r["people"] for r in pre)
scores = {
    "P1": dict(value=yr[2025]["blank"], against=max(r["blank"] for r in pre), held=yr[2025]["blank"] > max(r["blank"] for r in pre)),
    "P2": dict(value=yr[2025]["share"], against=pooled_pre, ratio=yr[2025]["share"] / pooled_pre,
               held=yr[2025]["share"] >= 2 * pooled_pre),
    "P3": dict(n=len(matched), rho=rho, ci95=ci, held=rho <= -0.30, informative=not (ci[0] <= 0 <= ci[1])),
    "P4": dict(top_half=[m["country"] for m in top], share=top_share, held=top_share is not None and top_share >= 0.75),
    "P5": dict(value=yr[2025]["analyses"], against=sum(yr[y]["analyses"] for y in (2022, 2023, 2024)) / 3,
               held=yr[2025]["analyses"] < sum(yr[y]["analyses"] for y in (2022, 2023, 2024)) / 3),
}
# Post hoc (written after the scores above were read): the 2025 rise sits in Cadre Harmonise countries.
# The same yearly sums without the Cadre Harmonise's member and partner countries found in the file.
CH = {"BEN", "BFA", "CIV", "CMR", "CPV", "GHA", "GIN", "GMB", "GNB", "LBR", "MLI", "MRT", "NER", "NGA", "SEN",
      "SLE", "TCD", "TGO"}
posthoc = []
for y in years:
    rows = [x for (c, yy), x in cy.items() if yy == y and c not in CH]
    p, b = sum(x["people"] for x in rows), sum(x["blank"] for x in rows)
    posthoc.append(dict(year=y, countries=len(rows), people=p, blank=b, share=b / p if p else None))
ch_in_file = sorted({c for c, _ in cy} & CH)
json.dump(dict(study=43, by_year=by_year, matched=matched, plans_without_ipc_match=unmatched_plans,
               scores=scores, posthoc_without_cadre_harmonise=dict(countries=ch_in_file, by_year=posthoc)), sys.stdout, indent=1, default=list)
