"""Project 8, session 1: the registered test (SELECTION.md). Reads the scratch file from fetch.py, writes
session1.json (counts, predictions) and session1_rows.json (rows without text).
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json, random, re, sys

PROMISE = re.compile(r"\b(I|we)(?:\s+(?:will|shall)|\s*(?:'ll|’ll))\s+(?:\w+\s+){0,2}?write\s+to\b"
                     r"|\b(I|we)\s+(will|shall)\s+be\s+(happy|glad|delighted|pleased)\s+to\s+write\s+to\b", re.I)
ADDRESSEES = {"hon", "honourable", "noble", "right", "member", "members", "friend", "friends", "lord", "lords", "baroness",
              "him", "her", "them", "all", "each", "every", "everyone", "committee"}
EARLY, LATE = [1980, 1985, 1990], [2015, 2020, 2025]


def to_member(text):
    for m in PROMISE.finditer(text):
        nxt = re.findall(r"[A-Za-z]+", text[m.end():m.end() + 60])[:3]
        if any(w.lower() in ADDRESSEES for w in nxt):
            return True
    return False


def main(raw, out, rows_out):
    d = json.load(open(raw))
    den = d["denominators"]
    rows = []
    for c in d["contributions"]:
        t = c["text"]
        rows.append({k: c[k] for k in ("id", "house", "year", "date", "section", "debate", "debate_id")} | {
            "promise": bool(PROMISE.search(t)), "to_member": to_member(t), "library": "Library" in t,
            "bill": "Bill" in (c["debate"] or "")})
    P = [r for r in rows if r["promise"]]

    def cnt(h, ys, key=None):
        return sum(1 for r in P if r["house"] == h and r["year"] in ys and (key is None or r[key]))

    def dn(h, ys):
        return sum(den[f"{h}-{y}"] for y in ys)

    years = sorted({r["year"] for r in rows})
    table = {f"{h}-{y}": {"spoken": den[f"{h}-{y}"], "promise": cnt(h, [y]), "to_member": cnt(h, [y], "to_member"),
                          "library": cnt(h, [y], "library"), "bill": cnt(h, [y], "bill"),
                          "rate_per_10k": round(1e4 * cnt(h, [y]) / den[f"{h}-{y}"], 2) if den[f"{h}-{y}"] else None}
             for h in ("Commons", "Lords") for y in years}
    rate = lambda h, ys: 1e4 * cnt(h, ys) / dn(h, ys)
    share = lambda h, ys, k: cnt(h, ys, k) / max(1, cnt(h, ys))
    ALL = years
    preds = {
        "P1": {"commons_rate_early": rate("Commons", EARLY), "commons_rate_late": rate("Commons", LATE)},
        "P2": {"years_lords_higher": sum(1 for y in ALL if table[f"Lords-{y}"]["rate_per_10k"] > table[f"Commons-{y}"]["rate_per_10k"])},
        "P3": {"lib_share_lords": share("Lords", ALL, "library"), "lib_share_commons": share("Commons", ALL, "library")},
        "P4": {"commons_years_tested": [y for y in ALL if table[f"Commons-{y}"]["promise"] >= 20],
               "commons_lib_shares": {y: table[f"Commons-{y}"]["library"] / max(1, table[f"Commons-{y}"]["promise"]) for y in ALL}},
        "P5": {"lords_lib_early": share("Lords", EARLY, "library"), "lords_lib_late": share("Lords", LATE, "library")},
        "P6": {"bill_share_lords": share("Lords", ALL, "bill"), "bill_share_commons": share("Commons", ALL, "bill")},
    }
    preds["P1"]["held"] = preds["P1"]["commons_rate_late"] >= 1.5 * preds["P1"]["commons_rate_early"]
    preds["P2"]["held"] = preds["P2"]["years_lords_higher"] >= 8
    preds["P3"]["held"] = preds["P3"]["lib_share_lords"] >= 2 * preds["P3"]["lib_share_commons"]
    preds["P4"]["held"] = all(preds["P4"]["commons_lib_shares"][y] < 0.10 for y in preds["P4"]["commons_years_tested"])
    preds["P5"]["held"] = preds["P5"]["lords_lib_late"] >= 2 * preds["P5"]["lords_lib_early"]
    preds["P6"]["held"] = preds["P6"]["bill_share_lords"] > 0.5 and preds["P6"]["bill_share_commons"] < 0.5
    rng = random.Random(20261014)
    read60 = rng.sample(sorted(r["id"] for r in P), min(60, len(P)))
    bills = sorted(r["id"] for r in P if r["bill"] and r["id"] in read60)
    read30 = rng.sample(bills, min(30, len(bills)))
    json.dump({"candidates": len(rows), "promises": len(P), "table": table, "predictions": preds,
               "read60": read60, "read30_bill": read30}, open(out, "w"), indent=1)
    json.dump(rows, open(rows_out, "w"), indent=0)
    for k, v in preds.items():
        print(k, v)


if __name__ == "__main__":
    main(*sys.argv[1:4])
