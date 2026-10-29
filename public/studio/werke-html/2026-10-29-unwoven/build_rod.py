"""UNWOVEN, increment 2 — the rod: what was given and when the monitor was dark, per thread.

Usage: python3 -I build_rod.py <dir with ov2021.json..ov2026.json> <fews urls.txt>
  ov<YEAR>.json: https://api.hpc.tools/v2/public/plan/overview/<YEAR> (OCHA FTS, CC BY-IGO)
  urls.txt: every <loc> of https://fews.net/sitemap.xml?page=1..14 (the archive's own index)
Writes rod.js (loaded by index.html) and rod-summary.json.

Money: for a thread's country and the year of its analysis, every plan FTS lists for that year
whose countries are that country alone (response plans and flash appeals; regional plans left out),
requirements and funding summed. Monitor: a FEWS NET country-month is lit when the archive files an
analysis (alert, outlook, outlook update, key message update, remote monitoring report, special or
targeted report) for that country under that month; price bulletins and calendars are monitoring,
not analysis. A country counts as watched in a year when the archive files an analysis in at least
one month of it. Neither source writes why a month is dark.
"""
import json, re, sys, collections
ovdir, urls = sys.argv[1], sys.argv[2]
S = open("data.js").read()
D = json.loads(S[S.index("=") + 1:].rstrip().rstrip(";"))
T = D["threads"]
YEARS = range(2021, 2027)

money = {}
plans_used = collections.Counter()
for y in YEARS:
    ov = json.load(open(f"{ovdir}/ov{y}.json"))["data"]
    acc = collections.defaultdict(lambda: [0, 0, []])
    for p in ov["plans"]:
        cs = p.get("countries") or []
        if len(cs) != 1:
            continue
        iso = cs[0]["iso3"]
        req = (p.get("requirements") or {}).get("revisedRequirements") or 0
        fund = (p.get("funding") or {}).get("totalFunding") or 0
        if not req:
            continue
        a = acc[iso]; a[0] += req; a[1] += fund; a[2].append(p["code"] or str(p["id"]))
    for iso, (req, fund, codes) in acc.items():
        money[(iso, y)] = (req, fund, codes)
        plans_used[y] += len(codes)

KINDS = {"alert", "food-security-outlook", "food-security-outlook-update", "key-message-update",
         "remote-monitoring-report", "special-report", "targeted-analysis"}
SLUG = {"afghanistan": "AFG", "angola": "AGO", "burundi": "BDI", "benin": "BEN", "burkina-faso": "BFA",
        "central-african-republic": "CAF", "cote-divoire": "CIV", "cameroon": "CMR",
        "democratic-republic-congo": "COD", "djibouti": "DJI", "ethiopia": "ETH", "guatemala": "GTM",
        "guinea": "GIN", "honduras": "HND", "haiti": "HTI", "kenya": "KEN", "lebanon": "LBN",
        "liberia": "LBR", "lesotho": "LSO", "madagascar": "MDG", "mali": "MLI", "mozambique": "MOZ",
        "mauritania": "MRT", "malawi": "MWI", "niger": "NER", "nigeria": "NGA", "pakistan": "PAK",
        "gaza": "PSE", "sudan": "SDN", "senegal": "SEN", "sierra-leone": "SLE", "el-salvador": "SLV",
        "somalia": "SOM", "south-sudan": "SSD", "chad": "TCD", "togo": "TGO", "tanzania": "TZA",
        "uganda": "UGA", "yemen": "YEM", "zambia": "ZMB"}
MON = {m: i + 1 for i, m in enumerate("january february march april may june july august september october november december".split())}
pat = re.compile(r"^https://fews\.net/[a-z-]+/([a-z-]+)/([a-z-]+)/([a-z]+)-(\d{4})$")
lit = collections.defaultdict(set)
seen = 0
for u in open(urls):
    m = pat.match(u.strip())
    if not m or m.group(2) not in KINDS or m.group(3) not in MON:
        continue
    iso = SLUG.get(m.group(1))
    if not iso:
        continue
    seen += 1
    lit[iso].add((int(m.group(4)), MON[m.group(3)]))
watched = {(iso, y) for iso, ms in lit.items() for (y, _) in ms}

MO = {m[:3].capitalize(): i for m, i in MON.items()}
rod = []
for t in T:
    mo, y = t["d"].split(); y = int(y); mo = MO[mo]
    r = money.get((t["c"], y))
    f = None if (t["c"], y) not in watched else (1 if (y, mo) in lit[t["c"]] else 0)
    rod.append([round(r[1] / r[0], 4) if r else None, r[0] if r else 0, r[1] if r else 0, f])

# months, pooled: how many of the IPC's countries FEWS NET watched in a year had an analysis that month
months = []
for y in YEARS:
    for mo in range(1, 13):
        if (y, mo) > (2026, 9):  # the last analysis month in the table; October is not yet filed
            break
        w = [iso for iso in SLUG.values() if (iso, y) in watched]
        months.append([f"{y}-{mo:02d}", sum(1 for iso in w if (y, mo) in lit[iso]), len(w)])

dark = [m for m in months if m[2] and m[1] == 0]
summ = {"threads": len(rod), "with_appeal": sum(1 for r in rod if r[0] is not None),
        "watched": sum(1 for r in rod if r[3] is not None),
        "dark_threads": sum(1 for r in rod if r[3] == 0), "fews_analysis_urls": seen,
        "plans_used_per_year": dict(plans_used), "months_all_dark": [m[0] for m in dark]}
assert len(rod) == len(T) == 813
open("rod.js", "w").write("window.ROD=" + json.dumps({"rod": rod, "months": months, "summary": summ},
                          separators=(",", ":")) + ";\n")
json.dump(summ, open("rod-summary.json", "w"), indent=1)
print(json.dumps(summ, indent=1))
for m in months:
    print(*m)

# cross-check against this practice's own flow-level count (etudes/the-remainder, movement I, 2026-10-26):
# Sudan's 2025 appeal, asked US$ 4,162.5 m, came US$ 1,664.7 m
req, fund, _ = money[("SDN", 2025)]
assert round(req / 1e5) == 41625 and round(fund / 1e5) == 16647, (req, fund)
