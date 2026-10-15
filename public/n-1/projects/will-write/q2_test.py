"""Project 8, session 2, Q2's registered test (SESSION2.md, predictions 10-11). Reads q2_rows.json, q2_verdicts.json (Library
flags read by hand before this was run) and session 1's verified rows; writes q2.json with every Commons year 2000-2025."""
import json
Q = json.load(open("q2_rows.json"))
V = json.load(open("q2_verdicts.json"))
S1 = json.load(open("session1_rows.json"))
copy = {i for i, v in V["verdicts"].items() if v == "copy"}
rows = [r for r in Q["rows"] if r["promise"]]
by = {}
for y in range(2000, 2026):
    if any(r["year"] == y for r in rows):
        p = [r for r in rows if r["year"] == y]
        by[str(y)] = {"promise": len(p), "copy": sum(r["id"] in copy for r in p), "spoken": Q["denominators"].get(f"Commons-{y}"), "source": "session 2"}
    else:
        p = [r for r in S1 if r["promise"] and r["house"] == "Commons" and r["year"] == y]
        if p:
            by[str(y)] = {"promise": len(p), "copy": sum(r["library_verified"] for r in p), "source": "session 1 (verified)"}


def share(ys):
    ys = [str(y) for y in ys if str(y) in by and by[str(y)]["source"] == "session 2"]
    return sum(by[y]["copy"] for y in ys) / sum(by[y]["promise"] for y in ys), ys


early, ey = share(range(2001, 2010))
late, ly = share(range(2016, 2025))
P = {"P10": {"share_2001_2009": round(early, 4), "years": ey, "share_2016_2024": round(late, 4), "years_late": ly,
             "held": early >= 2 * late},
     "P11": {"copies_2016_2024": {y: by[y]["copy"] for y in ly}, "held": all(by[y]["copy"] <= 3 for y in ly)}}
c_early = sum(by[y]["copy"] for y in ey); p_early = sum(by[y]["promise"] for y in ey)
c_late = sum(by[y]["copy"] for y in ly); p_late = sum(by[y]["promise"] for y in ly)
summary = (f"In 2001-2009 a copy was promised {c_early} times in {p_early:,} promises; in 2016-2024, {c_late} times in {p_late:,}.")
json.dump({"commons_by_year": by, "predictions": P, "summary": summary}, open("q2.json", "w"), indent=1)
print(json.dumps(P, indent=1)); print(summary)
