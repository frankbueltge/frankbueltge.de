"""Writes data.js from data/results.json for index.html. Run: python3 -I build.py"""
import json
R = json.load(open("data/results.json"))
keep = {k: R[k] for k in ["source", "undetermined", "analysed", "predictions", "clock_close_recent", "clock_close_recent_outside",
                          "H24_30_by_distance_by_era", "by_year_close_H26_30", "close_by_era_band", "undetermined_bounds"]}
open("data.js", "w").write("window.D=" + json.dumps(keep, separators=(",", ":")) + ";\n")
