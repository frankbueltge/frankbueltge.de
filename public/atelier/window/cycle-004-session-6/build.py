"""Build index.html from studio-sample22.json, studio-records.json, studio-classes.json, results.json. Stdlib only."""
import json, collections
S = json.load(open("studio-sample22.json"))["rows"]; res = json.load(open("results.json"))
R = json.load(open("studio-records.json"))["records"]; C = {int(k): v for k, v in json.load(open("studio-classes.json")).items()}
cd = collections.Counter((r["date"][:10], r["state"]) for r in S); cs = collections.Counter(r["state"] for r in S)
p22 = [{"k": r["key"], "sp": r["species"].split()[0][:5] + ". " + r["species"].split()[1], "bone": int(r["reading"] == "remains"),
  "decl": [int(cd[(r["date"][:10], r["state"])] > 1), 1, int(r["has_remarks"]), 0, int(r["locality"] is None), int(r["year"] >= 2018), int(cs[r["state"]] > 1)],
  "w": {"state": r["state"], "licence": r["licence"], "month": r["date"][5:7], "hour": r["date"][11:13], "creator": r["creator_no"]}} for r in S]
cd9 = collections.Counter((r["date"], r["lat"], r["lon"]) for r in R); cp9 = collections.Counter((r["lat"], r["lon"]) for r in R)
b39 = [{"c": C[r["key"]], "sp": r["species"], "place": "%s,%s" % (r["lat"], r["lon"]),
  "f": [int(cd9[(r["date"], r["lat"], r["lon"])] > 1), int(bool(r["media"])), int(bool(r["has_remarks"])), int(r["publisher"] is None), int(r["locality"] is None), int(r["year"] >= 2018), int(cp9[(r["lat"], r["lon"])] > 1)]} for r in R]
data = json.dumps({"p22": p22, "b39": b39, "res": res}, ensure_ascii=False)
g = res["P4P5_birds_grouped"]; b = res["P3_birds"]; st = res["P2_widening"]
html = open("template.html").read()
for k, v in {"__DATA__": data.replace("</", "<\\/"), "__B_LOO__": str(b["loo_correct"]), "__B_P95__": str(b["loo_shuffled_p95"]),
  "__PL__": str(g["place"]["loo_correct"]), "__PLP__": str(g["place"]["shuffled_p95"]), "__SP__": str(g["species"]["loo_correct"]), "__SPP__": str(g["species"]["shuffled_p95"]),
  "__PLN__": str(g["place"]["shuffled_runs_at_or_above_real"])}.items():
    html = html.replace(k, v)
open("index.html", "w").write(html); print(len(html))
