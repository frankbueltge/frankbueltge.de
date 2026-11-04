"""Study 20 checks. Usage: python3 check.py
Recomputes the registered figures from data/warnings.tsv by a second route (bisect over sorted
times, written apart from analyse.py), compares them with data/results.json and data.js, and
proves a tamper is caught. The suite counts the checks it ran against the checks written in it."""
import json, os, re, bisect, collections, math

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, "data", "results.json")))
SRC = open(os.path.abspath(__file__)).read()
WRITTEN = len(re.findall(r"^\s*ok\(", SRC, re.M))
ran = fail = 0
def ok(name, cond):
    global ran, fail
    ran += 1; fail += not cond; print(("PASS " if cond else "FAIL ") + name)

def load(path):
    rows = [l.rstrip("\n").split("\t") for l in open(path)][1:]
    return [{"id": r[0], "k": r[1], "t": float(r[2]), "c": r[3], "f": r[4], "ac": r[5] == "1",
             "L": float(r[6]) if r[6] else None, "c0": float(r[7]) if r[7] else None} for r in rows]

def recount(T):
    acct = collections.defaultdict(list)          # account -> sorted times of non-all-clear warnings
    fate_at = {}
    for t in T:
        if not t["ac"]:
            acct[t["k"]].append(t["t"]); fate_at[(t["k"], t["t"])] = t["f"]
    for v in acct.values(): v.sort()
    def nearest(t):
        v = acct.get(t["k"], []); i = bisect.bisect_left(v, t["t"])
        return None if i == 0 else v[i - 1]
    AC = [t for t in T if t["ac"]]; NAC = [t for t in T if not t["ac"]]
    hasp = lambda t: nearest(t) is not None and t["t"] - nearest(t) <= 1440 + 1e-6
    ka = [t for t in AC if hasp(t)]; kb = sum(1 for t in NAC if hasp(t))
    k5 = sum(1 for t in ka if fate_at[(t["k"], nearest(t))] == "silence")
    sil = [t for t in NAC if t["f"] == "silence"]
    return {"n": len(T), "ac": len(AC), "ac_silent": sum(t["f"] == "silence" for t in AC),
            "ka": len(ka), "kb": kb, "nac": len(NAC), "k5": k5,
            "sil_expiry": sum(1 for t in sil if t["L"] and t["L"] > 0), "sil": len(sil),
            "canc": [sum(1 for t in NAC if t["f"].startswith("end") and t["L"] and t["L"] > 0 and t["c0"] is not None and t["c0"] < t["L"]),
                     sum(1 for t in NAC if t["f"].startswith("end") and t["L"] and t["L"] > 0 and t["c0"] is not None)]}

T = load(os.path.join(HERE, "data", "warnings.tsv"))
X = recount(T)
ok("reproduces study 17's corrected figures on all 23,154", R["reproduces"] is True and X["n"] == 23154)
ok("all-clear count", X["ac"] == R["P1"]["allclears"])
ok("all-clears that are silent", X["ac_silent"] == R["P2"]["silent"])
ok("all-clears with a predecessor in 24 h", [X["ka"], X["ac"]] == R["P4"]["allclears_with_predecessor"])
ok("baseline with a predecessor in 24 h", [X["kb"], X["nac"]] == R["P4"]["baseline_with_predecessor"])
ok("predecessors silent", [X["k5"], X["ka"]] == R["P5"]["predecessor_silent"])
ok("silent with expiry, without all-clears", X["sil_expiry"] == R["study17_without_allclears"]["P1_silent_with_expiry"]
   and X["sil"] == R["study17_without_allclears"]["silent"])
ok("cancels before expiry, without all-clears", X["canc"] == R["study17_without_allclears"]["P3_cancel_before_expiry"])
pairs = [l.split("\t") for l in open(os.path.join(HERE, "data", "pairs.tsv"))][1:]
ok("pairs.tsv holds every all-clear", len(pairs) == X["ac"] and len({p[0] for p in pairs}) == X["ac"])
ids = {t["id"] for t in T}
ok("every predecessor is a warning, never an all-clear", all(p[5] in ids for p in pairs if p[5]) and
   not ({p[5] for p in pairs if p[5]} & {t["id"] for t in T if t["ac"]}))
js = open(os.path.join(HERE, "data.js")).read()
P = json.loads(re.search(r"window\.P=(\[.*?\]);\n", js, re.S).group(1))
ok("page rows: one per warning, all-clears flagged", len(P) == X["n"] and sum(r[0] for r in P) == X["ac"])
ok("page rows: 24 h predecessors match", sum(1 for r in P if r[0] and 0 <= r[2] <= 1440) == X["ka"]
   and sum(1 for r in P if not r[0] and 0 <= r[2] <= 1440) == X["kb"])
ok("verdicts recorded as computed", R["P1"]["held"] == (678 <= X["ac"] <= 1200)
   and R["P2"]["held"] == (X["ac_silent"] / X["ac"] >= 0.85)
   and R["P4"]["held"] == (X["ka"] / X["ac"] >= 0.5 and (X["ka"] / X["ac"]) / (X["kb"] / X["nac"]) >= 2)
   and R["P5"]["held"] == (X["ka"] > 0 and X["k5"] / X["ka"] >= 0.6))
ok("no text and no sender address in the data", not re.search(r"@|\b(all clear|lifted|evacuat)", js + open(os.path.join(HERE, "data", "pairs.tsv")).read(), re.I))
# tamper: move one all-clear one day later than its predecessor window allows; the recount must change
T2 = [dict(t) for t in T]
first = next(t for t in T2 if t["ac"] and recount([t] + [u for u in T2 if u["k"] == t["k"] and not u["ac"]])["ka"])
first["t"] += 1e7
ok("a tamper is caught", recount(T2)["ka"] != X["ka"])
print(f"{ran} of {WRITTEN} checks ran, {fail} failed")
raise SystemExit(1 if fail or ran != WRITTEN else 0)
