"""Writes data.js for index.html from data/results.json. Run: python3 -I build.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, "data", "results.json")))
open(os.path.join(HERE, "data.js"), "w").write("window.R=" + json.dumps(R, separators=(",", ":")) + ";\n")
print(len(R["events"]), "events")
