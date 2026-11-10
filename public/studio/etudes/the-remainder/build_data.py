"""Build data.json for THE REMAINDER from OCHA FTS (api.hpc.tools), Sudan's appeals 2011-2026.

Usage: python3 -I build_data.py <dir-with-downloads> > data.json
The directory holds plans.json (/v1/public/plan/country/SDN), plan-<id>.json
(/v1/public/fts/flow?planId=<id>&limit=1) and flows-<id>-<page>.json
(/v1/public/fts/flow?planId=<id>&limit=1000, following meta.nextLink).
A flow counts if its boundary is "incoming" and its status is not "pledge";
the sum of those reproduces FTS's own incoming fundingTotal for every plan (asserted).
"""
import glob, json, os, sys

SUDAN_APPEALS = [350, 377, 413, 437, 460, 520, 584, 635, 670, 870, 1014, 1068, 1123, 1188, 1220, 1514]
src = sys.argv[1]
plans = {p["id"]: p for p in json.load(open(os.path.join(src, "plans.json")))["data"]}
donors, donor_ix, years = [], {}, []
for pid in SUDAN_APPEALS:
    p = plans[pid]
    total = json.load(open(os.path.join(src, f"plan-{pid}.json")))["data"]["incoming"]["fundingTotal"]
    flows = []
    for f in sorted(glob.glob(os.path.join(src, f"flows-{pid}-*.json"))):
        flows += json.load(open(f))["data"]["flows"]
    inc = [x for x in flows if x.get("boundary") == "incoming" and x["status"] != "pledge"]
    assert sum(x["amountUSD"] for x in inc) == total, pid
    out, nonpos = [], 0
    for x in sorted(inc, key=lambda x: (x["date"], x["id"])):
        if x["amountUSD"] <= 0:
            nonpos += 1
            continue
        org = next((o["name"] for o in x["sourceObjects"] if o["type"] == "Organization"), "not stated")
        if org not in donor_ix:
            donor_ix[org] = len(donors)
            donors.append(org)
        out.append([x["amountUSD"], x["date"][:10], donor_ix[org], 1 if x["status"] == "paid" else 0])
    years.append({
        "plan_id": pid, "year": int(p["years"][0]["year"]), "name": p["planVersion"]["name"],
        "required": p["revisedRequirements"] or p["origRequirements"], "funded": total,
        "flows_counted": len(inc), "flows_nonpositive_skipped": nonpos, "flows": out,
    })
years.sort(key=lambda y: y["year"])
print(json.dumps({
    "source": "OCHA Financial Tracking Service, api.hpc.tools/v1/public (plan/country/SDN; fts/flow?planId=)",
    "licence": "CC BY-IGO (OCHA FTS, as listed on HDX: sdn-requirements-and-funding-data)",
    "fetched": "2026-10-26",
    "flow_fields": ["amountUSD", "date", "donor index", "paid=1 / commitment=0"],
    "donors": donors, "years": years}, separators=(",", ":")))
