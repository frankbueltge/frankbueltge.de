"""Project 8, session 3: the registered test (SESSION3.md). Reads q3_rows.json and q3_verdicts.json, writes q3.json.
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json

rows = [r for r in json.load(open("q3_rows.json")) if r["found"] and r["surname_ok"]]  # JOURNAL3 item 3
allrows = json.load(open("q3_rows.json"))
V = json.load(open("q3_verdicts.json"))
LATE, EARLY = (2015, 2020, 2025), (2005, 2010)


def share(h, ys, bill, key="letter_back"):
    s = [r for r in rows if r["house"] == h and r["year"] in ys and r["bill"] == bill]
    return {"n": len(s), "k": sum(r[key] for r in s), "share": round(sum(r[key] for r in s) / max(1, len(s)), 4)}


by = {f"{h}-{y}-{'bill' if b else 'other'}": share(h, (y,), b) | {"on_topic": share(h, (y,), b, "on_topic")["k"]}
      for h in ("Commons", "Lords") for y in EARLY + LATE for b in (False, True)}
nb = [r for r in rows if not r["bill"]]
P = {
    "P12": share("Lords", LATE, False), "P13": share("Commons", LATE, False),
    "P14": {"late": share("Lords", LATE, False), "early": share("Lords", EARLY, False)},
    "P15": share("Lords", LATE, True),
    "P16": {"primary": sum(r["letter_back"] for r in nb), "strict": sum(r["on_topic"] for r in nb)},
    "P17": {"read": len(V), "plausible": sum(1 for v in V if v["plausible"])},
}
P["P12"]["held"] = P["P12"]["share"] >= 0.40
P["P13"]["held"] = P["P13"]["share"] < 0.20
P["P14"]["held"] = P["P14"]["late"]["share"] > P["P14"]["early"]["share"]
P["P15"]["held"] = P["P15"]["share"] >= 0.5
P["P16"]["held"] = P["P16"]["strict"] >= 0.5 * P["P16"]["primary"]
P["P17"]["held"] = P["P17"]["plausible"] >= 12
out = {"frame": len(allrows), "named": len(rows), "by_house_year": by, "predictions": P}
json.dump(out, open("q3.json", "w"), indent=1)
for k, v in P.items():
    print(k, v)
