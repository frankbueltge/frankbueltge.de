"""Project 8, session 2: Q1's registered test (SESSION2.md, predictions 7-9) from q1_rows.json; writes q1.json."""
import json
R = json.load(open("q1_rows.json"))
M = [r for r in R if r["bill_id"]]


def share(h, ys):
    p = [r for r in M if (h is None or r["house"] == h) and r["year"] in ys]
    return {"matched": len(p), "letter_back": sum(r["letter_back"] for r in p),
            "letter_on_bill": sum(r["letter_on_bill"] for r in p),
            "share_back": round(sum(r["letter_back"] for r in p) / len(p), 3) if p else None}


by = {f"{h}-{y}": share(h, [y]) | {"frame": sum(1 for r in R if r["house"] == h and r["year"] == y)}
      for h in ("Commons", "Lords") for y in (2010, 2015, 2020, 2025)}
late = [2015, 2020, 2025]
P = {"P7": share("Lords", late), "P8": share("Commons", late), "P9": share(None, [2010])}
P["P7"]["held"] = P["P7"]["share_back"] >= 0.5
P["P8"]["held"] = P["P8"]["share_back"] < 0.25
P["P9"]["held"] = P["P9"]["share_back"] < 0.2
out = {"frame": len(R), "matched": len(M), "no_bill_name": sum(1 for r in R if not r["bill_name"]),
       "no_candidate": sum(1 for r in R if r["bill_name"] and not r["candidates"]),
       "candidate_not_in_sittings": sum(1 for r in R if r["candidates"] and not r["bill_id"]),
       "by_house_year": by, "predictions": P}
json.dump(out, open("q1.json", "w"), indent=1)
print(json.dumps(out, indent=1))
