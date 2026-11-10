"""Build data-<year>.json for THE REMAINDER, movements II (2025) and III (2022): every appeal FTS
lists for one year. (Named build_2025.py until session 207, when it took the year as an argument.)

Usage: python3 -I build_year.py <dir-with-downloads> <year> <fetched> > data-<year>.json
The directory holds plans<year>.json (/v1/public/plan/year/<year>), plan-<id>.json
(/v1/public/fts/flow?planId=<id>&limit=1) and flows-<id>-<page>.json
(/v1/public/fts/flow?planId=<id>&limit=1000, following meta.nextLink).
Same rule as build_data.py: a flow counts if its boundary is "incoming" and its status is not
"pledge"; the sum reproduces FTS's own incoming fundingTotal for every plan (asserted).
"""
import collections, glob, json, os, re, sys

SUFFIX = re.compile(r"\s*(Humanitarian Needs and Response Plan|Necesidades Humanitarias y Plan de Respuesta|"
                    r"Besoins Humanitaires et Plan de R[ée]ponse|Humanitarian Response Plan|Plan de Respuesta Humanitaria)"
                    r"\s*\d{4}\s*$")
src, year, fetched = sys.argv[1], sys.argv[2], sys.argv[3]
plans = json.load(open(os.path.join(src, f"plans{year}.json")))["data"]
donors, donor_ix, rows, seen = [], {}, [], collections.Counter()
for p in plans:
    pid = p["id"]
    total = json.load(open(os.path.join(src, f"plan-{pid}.json")))["data"]["incoming"]["fundingTotal"]
    flows = []
    for f in sorted(glob.glob(os.path.join(src, f"flows-{pid}-*.json"))):
        flows += json.load(open(f))["data"]["flows"]
    inc = [x for x in flows if x.get("boundary") == "incoming" and x["status"] != "pledge"]
    assert sum(x["amountUSD"] for x in inc) == total, pid
    out, nonpos = [], 0
    for x in sorted(inc, key=lambda x: (x["date"], x["id"])):
        seen[x["id"]] += 1
        if x["amountUSD"] <= 0:
            nonpos += 1
            continue
        org = next((o["name"] for o in x["sourceObjects"] if o["type"] == "Organization"), "not stated")
        if org not in donor_ix:
            donor_ix[org] = len(donors)
            donors.append(org)
        out.append([x["amountUSD"], x["date"][:10], donor_ix[org], 1 if x["status"] == "paid" else 0])
    name = p["planVersion"]["name"].strip()
    rows.append({
        "plan_id": pid, "name": name, "label": SUFFIX.sub("", name),
        "kind": next((c["name"] for c in p.get("categories", []) if c.get("group") == "planType"), None),
        "required": p["revisedRequirements"] or p["origRequirements"], "funded": total,
        "flows_counted": len(inc), "flows_nonpositive_skipped": nonpos, "flows": out,
    })
rows.sort(key=lambda r: -r["required"])
print(json.dumps({
    "source": f"OCHA Financial Tracking Service, api.hpc.tools/v1/public (plan/year/{year}; fts/flow?planId=)",
    "licence": "CC BY-IGO (OCHA FTS)",
    "fetched": fetched,
    "flow_fields": ["amountUSD", "date", "donor index", "paid=1 / commitment=0"],
    "flows_in_more_than_one_plan": sum(1 for v in seen.values() if v > 1),
    "donors": donors, "years": rows}, separators=(",", ":")))
