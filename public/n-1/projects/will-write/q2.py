"""Project 8, session 2, Q2: the Commons years between (SESSION2.md). Reads fetch2.py's scratch file (argument 1), writes
q2_rows.json (rows without text) and, to scratch (argument 2), every Library occurrence in a promise contribution as a window to be
read by hand. Verdicts live in q2_verdicts.json, written before any total is computed (q2_test.py).
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json, sys
from session1 import PROMISE, to_member


def main(raw, windows_out):
    d = json.load(open(raw))
    rows, wins = [], []
    for c in d["contributions"]:
        t = c["text"]
        r = {k: c[k] for k in ("id", "house", "year", "date", "section", "debate", "debate_id")} | {
            "promise": bool(PROMISE.search(t)), "to_member": to_member(t), "library": "Library" in t,
            "bill": "Bill" in (c["debate"] or "")}
        rows.append(r)
        if r["promise"] and r["library"]:
            i, ws = 0, []
            while (i := t.find("Library", i)) >= 0:
                ws.append(t[max(0, i - 220):i + 120])
                i += 7
            wins.append({"id": r["id"], "year": r["year"], "windows": ws})
    json.dump({"denominators": d["denominators"], "rows": rows}, open("q2_rows.json", "w"), indent=0)
    json.dump(wins, open(windows_out, "w"), indent=1)
    print(len(rows), "candidates;", sum(r["promise"] for r in rows), "promises;", len(wins), "Library flags to read")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
