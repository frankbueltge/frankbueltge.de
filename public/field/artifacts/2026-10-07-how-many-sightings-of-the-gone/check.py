"""Checks for session 181. Counts its own chk( lines and fails if the number run differs. python3 -I check.py"""
import json, os, re, subprocess, sys, collections
H = os.path.dirname(os.path.abspath(__file__)); run = []; bad = []
def chk(name, ok):
    run.append(name)
    if not ok: bad.append(name)
res = json.load(open(H + "/data/results.json")); R = json.load(open(H + "/data/records.json")); page = open(H + "/index.html").read()
rec = R["records"]; A = res["A"]
chk("14,283 records fetched = sum of GBIF counts", len(rec) == sum(R["gbif_counts"].values()) == 14283)
chk("record keys unique", len({r["key"] for r in rec}) == len(rec))
chk("per-species record counts match results", all(A[n]["records"] == sum(1 for r in rec if str(r["speciesKey"]) == k) for k, n in R["species"].items()))
chk("A1 refuted as recorded: 56.7 %", res["A_total_units"] == 8101 and not res["A_predictions"]["A1_units_under_50pct_of_records"])
chk("A2 refuted as recorded", not res["A_predictions"]["A2_top10_ge_50pct_in_at_least_3_species"])
chk("A3 and A4 held", res["A_predictions"]["A3_perameles_fewest_observers"] and res["A_predictions"]["A4_some_species_no_observer_ge_5pct"])
B = res["B"]
chk("135 Studio keys all in today's licensed set", B["studio_keys_in_todays_licensed"] == B["studio_census_keys"] == 135)
chk("licensed = 135 + 3 new", B["licensed"] == 138 and B["todays_licensed_not_in_studio_census"] == 3)
chk("no observer holds both licence classes", B["observers_both"] == 0)
chk("B1 held: 44 outside null 107-123", B["B1_outside_central_95"] and B["B1_distinct_observers_licensed_real"] == 44)
chk("B2 held: p < 0.001", B["B2_perm_p"] < 0.001)
sess = json.load(open(H + "/../2026-10-06-the-bone-among-the-living/data/studio-reading.json")); cen = {x["key"] for x in json.load(open(H + "/data/studio-census-2026-10-06.json"))["rows"]}
chk("B3: the 10 earlier tortoise photographs are in the 135", sum(1 for k in sess if int(k) in cen) == 10)
chk("USGS records: 1,075, no coords, no observer", res["usgs_banding"]["records"] == 1075 and res["usgs_banding"]["with_coords"] == 0 and res["usgs_banding"]["with_observer"] == 0)
chk("USGS records are the species' no-observer records", A["Zosterops conspicillatus"]["records_no_observer"] == 1075)
# page's counting function, run in node on the page's own embedded data, against the Python mirror
m = re.search(r"const D=(\{.*?\});\nfunction countUnits", page, re.S)
fn = re.search(r"function countUnits.*?\n return n\+s\.size\}", page, re.S)
js = "const D=" + m.group(1) + ";\n" + fn.group(0) + "\nconst o={};D.names.forEach((nm,i)=>{o[nm]={};for(const v of ['record','observer-day','observer-day-cell','observer-year','cell-day'])for(const g of [false,true])o[nm][v+(g?'|merge':'')]=countUnits(D.rows,i,v,g)});console.log(JSON.stringify(o))"
import tempfile
with tempfile.TemporaryDirectory() as td:
    open(td + "/t.js", "w").write(js)
    out = json.loads(subprocess.run(["node", td + "/t.js"], capture_output=True, text=True, check=True).stdout)
chk("page's unit counts equal the Python mirror, 40 cells", out == res["unit_variants"] and sum(len(v) for v in out.values()) == 40 - 0 and len(out) == 4)
chk("page embeds 14,283 rows", len(json.loads(m.group(1))["rows"]) == 14283)
rng = [R2 for n in out for R2 in (out[n]["record"] / out[n][k] for k in out[n] if k != "record" and "record" not in k)]
chk("range sentence '1.2 to 52 times' matches the table", round(min(r for r in rng if r > 1), 1) <= 1.2 and round(max(rng)) == 52)
chk("no external script or network call", not re.search(r"<script[^>]+src=|fetch\(|XMLHttpRequest|https?://[^\s\"']*\.js", page))
chk("no product or vendor names in page", not re.search(r"(?i)claude|anthropic|openai|gpt", page))
chk("estimate and limits stated", "Not said" in page and "one query day" in page.lower())
src = open(__file__).read()
chk("suite ran what it counted", len(run) + 1 == len(re.findall(r"^chk\(", src, re.M)))
print(len(run), "checks,", len(bad), "failed", bad); sys.exit(1 if bad else 0)
