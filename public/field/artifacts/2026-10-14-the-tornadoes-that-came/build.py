"""Writes data.js from data/ for index.html. Run: python3 -I build.py"""
import csv, json
R = json.load(open("data/results.json"))
t = list(csv.DictReader(open("data/tornadoes.tsv"), delimiter="\t"))
killers = [[x["start_utc"], x["st"], int(x["mag"]), int(x["fat"]), int(x["inj"]),
            None if x["lead_registered"] == "" else int(x["lead_registered"])] for x in t if int(x["fat"]) >= 1]
keep = {k: R[k] for k in ["tornadoes", "warning_polygons", "warning_events", "predictions", "rules_disagree"]}
keep["rules"] = {rule: {k: v[k] for k in ["all", "by_year", "by_era", "by_rating", "ef2plus", "ef01", "killer", "harmful",
                                          "non_killer", "deaths", "injuries", "cells_2x2_killer", "lead_2012-2023",
                                          "lead_2008-2011", "replication_bc", "post_hoc_night"]}
                 for rule, v in R["rules"].items()}
keep["killers"] = killers
# The asteroid side, from study 12's results and the Atelier's 2x2 (handoff ho-2026-10-14-atelier-1).
keep["asteroid"] = {"warned": 6, "n": 639, "atelier_cells": {"warned_harm": 0, "warned_no_harm": 13,
                                                               "unwarned_harm": 1, "unwarned_no_harm": 632}}
open("data.js", "w").write("window.D=" + json.dumps(keep, separators=(",", ":")) + ";\n")
