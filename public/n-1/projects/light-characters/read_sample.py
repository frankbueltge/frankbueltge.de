"""(Corrected 19:53 UTC — first written as 20:00, ahead of the clock: featureNumber is not unique — a light and its RACON share one — so records are aligned by order.)
Reading rule of SELECTION.md: 40 random parsed lights against their raw record; 20 random twin-within-range pairs in full.
Usage: python3 read_sample.py SCRATCHDIR  (prints to the terminal; nothing committed but the classification written by hand)"""
import json, random, sys
sc = sys.argv[1]
rawl = []
for v in range(110, 117):
    rawl += json.load(open(f"{sc}/lol{v}.json"))["ngalol"]
rows = json.load(open(f"{sc}/rows_full.json"))
assert len(rows) == len(rawl)  # no record was removed, so rows align with records by order
for i, x in enumerate(rows):
    x["i"] = i
    assert x["f"] == rawl[i]["featureNumber"]
rng = random.Random(20261016)
parsed = [x for x in rows if x["kind"] != "unparsed"]
for x in rng.sample(parsed, 40):
    r = rawl[x["i"]]
    print("L", x["v"], x["f"], x["k"], x["p"], x["rg"], x["lat"], x["lon"], "||", repr(r["characteristic"]), repr(r["range"]), repr(r["position"]))
T = [x for x in rows if x["kind"] == "rhythmic" and x["lat"] is not None]
W = [x for x in T if x["rg"] is not None and x["twin_km"] is not None and x["twin_km"] <= x["rg"] * 1.852]
for x in rng.sample(W, 20):
    y = T[x["twin_i"]]
    for z in (x, y):
        r = rawl[z["i"]]
        print("P", z["v"], z["f"], "|", r["name"].replace("\n", " ")[:90], "|", repr(r["characteristic"])[:80], "| rg", r["range"], "|", (r.get("structure") or "").replace("\n", " ")[:60], "|", (r.get("remarks") or "").replace("\n", " ")[:80])
    print("   km", x["twin_km"], "rg", x["rg"])
