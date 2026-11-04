"""Embeds data/results.json into template.html -> index.html. Run from the repository root."""
import json
A = "artifacts/2026-10-07-what-the-next-read-buys/"
r = json.load(open(A + "data/results.json"))
payload = {"grid": r["grid"], "now": r["now"], "p1": r["P1"], "share": r["P5"]["licensed_share_of_upper"]}
open(A + "index.html", "w").write(open(A + "template.html").read().replace("/*DATA*/", "const D=" + json.dumps(payload) + ";"))
