"""Writes data.js from data/ for index.html. Run: python3 -I build.py"""
import csv, json
R = json.load(open("data/results.json"))
pts = [[x["time_utc"][:10], float(x["impact_kt"])] for x in csv.DictReader(open("data/fireballs.tsv"), delimiter="\t")
       if x["time_utc"] >= "2008-10-07"]
warned = [{"des": w["des"], "t": w["t"], "held_h": w["held_h"], "match": w["match"], "H": w["H_list"],
           "kt": w["nearest"]["impact_kt"] if w["match"] else None, "rank": w.get("energy_rank"),
           "confirmed": w["confirmed"], "residents": w["residents_50km"]} for w in R["warned_rows"]]
keep = {k: R[k] for k in ["period", "all", "size", "era", "overlap", "predictions", "by_year", "top10", "kt_quartiles"]}
keep["pts"] = pts
keep["warned"] = warned
open("data.js", "w").write("window.D=" + json.dumps(keep, separators=(",", ":")) + ";\n")
