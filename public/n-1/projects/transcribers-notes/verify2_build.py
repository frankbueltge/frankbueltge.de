"""Project 7, session 2: verify every pair found in the 207 books fetched tonight, by reading it in its note.

Usage: python3 verify2_build.py <raw_pairs.json>
Writes verify2.json (decisions) and pairs2_verified.json. Rule as session 1: strike what is not a printed form and
its correction; restate as the note gives it where the pattern mangled the bounds; keep the rest.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))
raw = json.load(open(sys.argv[1]))
STRIKE = {  # the pattern caught words of the note itself, or the licence text after it
    (56264, "or", "other"), (56141, "capitals", "full"), (35650, "[-", "]."), (39696, "letters", "transliterations."),
    (41500, "text", "all"), (66922, "s)", "the"), (66922, "ligature", "the"), (60048, "ending", "ão"),
    (43642, "text", "all"), (43942, "caps", "ALL"), (78246, "were", "match"), (78966, "capitals", "ALL"), (46754, "caps", "all"),
}
REPAIR = {  # (id, from, to) -> as the note gives it
    (43942, "in", "within"): ["with in", "within"],          # note: "with in changed to within"
    (18746, "orginator", "originator."): ["orginator", "originator"],
    (18746, "expreses", "expresses."): ["expreses", "expresses"],
    (18746, "Bazar", "Bazaar."): ["Bazar", "Bazaar"],
    (48379, "apparenly", "apparently."): ["apparenly", "apparently"],
    (60048, "in April, 185", "in April, 1858."): ["in April, 185", "in April, 1858"],
    (67792, "156-74", "56-74."): ["156-74", "56-74"],
}


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


dec, out = [], []
for p in raw:
    k = (p["id"], p["from"], p["to"])
    if k in STRIKE:
        dec.append({"id": p["id"], "from": p["from"], "to": p["to"], "action": "strike"}); continue
    x, y = REPAIR.get(k, [p["from"], p["to"]])
    dec.append({"id": p["id"], "from": p["from"], "to": p["to"], "action": "repair" if k in REPAIR else "keep", "as": [x, y]})
    out.append({"id": p["id"], "from": x, "to": y, "lev": lev(x, y)})
json.dump(dec, open(os.path.join(HERE, "verify2.json"), "w"), indent=0, ensure_ascii=False)
json.dump(out, open(os.path.join(HERE, "pairs2_verified.json"), "w"), indent=0, ensure_ascii=False)
print(len(raw), "read;", sum(d["action"] == "strike" for d in dec), "struck;", sum(d["action"] == "repair" for d in dec), "repaired;", len(out), "kept")
