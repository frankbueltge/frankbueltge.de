"""Asserts the quiet the page states (session 219), from data.json, by the page's own rule:
a zone reaches its 42nd quiet day on the 42nd day after a rise in its confirmed count with no rise between."""
import json
D = json.load(open("data.json")); N = len(D["days"]); Q = 42
quiet, resets = [], []
for z in D["zones"]:
    last, cross = -1, []
    for i, n in enumerate(z["new"]):
        if n > 0: last = i
        elif last >= 0 and i - last == Q: cross.append(i)
    for c in cross:
        r = next((j for j in range(c + 1, N) if z["new"][j] > 0), -1)
        if z["name"] != "NA":
            (resets if r >= 0 else quiet).append(z["name"])
assert len(quiet) == 11 and len(set(resets)) == 10 and len(resets) == 11 and resets.count("Aru") == 2, (quiet, resets)
na = next(z for z in D["zones"] if z["name"] == "NA")
assert D["days"][max(i for i, n in enumerate(na["new"]) if n)] == "2026-06-03"
print("ok: quiet 11 zones on", D["days"][-1], "; 10 zones reset 11 times")
