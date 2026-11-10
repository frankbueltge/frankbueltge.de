"""The Edge: build edge-data.js from The Last Case's quiets and assert every figure the page states.
  python3 -I build.py
Source: ../../cycle-012/the-last-case/quiets.json (this practice, 2026-11-05), itself built from the
Field's check 52 (data52.js, commit 82f80ea, sha256 pinned in that work's build.py). A quiet runs from a
rise in a zone's confirmed count; it broke (b) with a case on day L+1, or it held to the record's end.

An edge E is a last day of reading. At E each quiet that reached 42 days is one of:
  broke    its case came on or before E: a "death" on day L+1;
  cut      it was still quiet at E: day t = min(L, days through E).
Three rules for the cut quiets, three curves of the chance a 42-day quiet is still quiet on day t:
  carried  every cut quiet is over for good: it never breaks (the declaration's reading);
  left out the cut quiets are dropped, only finished quiets speak;
  lost     Kaplan and Meier (JASA 53, 1958): a cut quiet is a loss, at risk until its day t; past
           the last loss the estimate is undefined, between 0 and P(t*).
With the hole: in Kivu no report came from 8 March to 9 June 2020 (94 days). Treated as an edge, a quiet
watched across it is cut on 7 March, the last report day before it (fewer than 42 days: it leaves).

Corrected 2026-11-06 (thirty-sixth session), after the Studio's check in CALL IT: a quiet's strip k begins
on the day AFTER the rise f (every held strip ends on its record's last day, 39 of 39). Until then this
file counted the rise day as day 1 (through = days + 1), so at a moved edge every quiet read a day longer
and every break came a day early. Days through E are now (E - f).days. What moved: 30 Aug 12 quiets -> 11;
the worst edge 3 Oct now ties with 4 Oct; Kivu's hole moves the last loss to day 531, not 532; 74 edges, not 75.
Nothing at a record's own last day moved, so no rule-day figure did.
"""
import datetime as dt, hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "cycle-012", "the-last-case", "quiets.json")
raw = open(SRC, "rb").read()
SHA = hashlib.sha256(raw).hexdigest()
D = json.loads(raw)
assert D["source"]["sha256"] == "a97c2dbd6259e287acfef003a7e8fa3a8a4fc64d4b37b0a9c5b9ab685534f567"
Q, R = D["quiets"], D["records"]
day = dt.date.fromisoformat
HOLE_LAST = day("2020-03-07")          # last report day before the 94 days
assert R["kivuHole"] == ["2020-03-07", "2020-06-10"]


def events(rec, E, hole=False):
    out = []
    for q in Q:
        if q["rec"] != rec:
            continue
        f, L = day(q["f"]), len(q["k"])
        through = (E - f).days
        if hole and f <= HOLE_LAST and f + dt.timedelta(L) > HOLE_LAST:
            through = min(through, (HOLE_LAST - f).days)
        if q["b"] and L + 1 <= through:
            out.append((L + 1, 1, q))
        else:
            t = min(L, through)
            if t >= 42:
                out.append((t, 0, q))
    return out


def km(ev):
    S, n, steps = 1.0, len(ev), []
    for t in sorted({t for t, _, _ in ev}):
        d = sum(1 for u, e, _ in ev if u == t and e)
        if d:
            S *= 1 - d / n
            steps.append([t, S])
        n -= sum(1 for u, _, _ in ev if u == t)
    last = max(ev, key=lambda x: (x[0], -x[1]))
    return steps, last[0], last[1] == 0, (steps[-1][1] if steps else 1.0)


def state(rec, E, hole=False):
    ev = events(rec, E, hole)
    if not ev:
        return None
    cut = [e for e in ev if not e[1]]
    steps, tS, isLoss, pS = km(ev)
    return {"n": len(ev), "broke": len(ev) - len(cut), "cut": len(cut),
            "cutLaterBroke": sum(1 for e in cut if e[2]["b"]), "tStar": tS, "tStarIsLoss": isLoss,
            "pStar": round(pS, 3), "floor": round(len(cut) / len(ev), 3)}


F = {}
end26, endK = day(R["bdbv"][1]), day(R["kivu"][1])
# at the records' own last days the losses movement of The Last Case is reproduced
F["full26"] = state("bdbv", end26)
F["fullK"] = state("kivu", endK)
assert (F["full26"]["n"], F["full26"]["cut"], F["full26"]["tStar"], round(F["full26"]["pStar"], 2)) == (22, 11, 154, 0.43)
assert (F["fullK"]["n"], F["fullK"]["cut"], F["fullK"]["tStar"], round(F["fullK"]["pStar"], 2)) == (60, 28, 633, 0.43)
# carried: the floor; left out: falls to nothing
assert F["full26"]["floor"] == 0.5 and F["fullK"]["floor"] == round(28 / 60, 3)
# the edge moved back a month: the page's first stop for 2026
F["sep29"] = state("bdbv", day("2026-09-29"))
assert (F["sep29"]["n"], F["sep29"]["cut"], F["sep29"]["cutLaterBroke"], F["sep29"]["tStar"]) == (17, 10, 3, 124)
assert round(F["sep29"]["pStar"], 2) == 0.48
F["aug30"] = state("bdbv", day("2026-08-30"))
assert (F["aug30"]["n"], F["aug30"]["cut"], F["aug30"]["tStar"], round(F["aug30"]["pStar"], 2)) == (11, 4, 94, 0.17)
# the worst edge for the declaration's reading in 2026: the most carried quiets that broke later
worst = max(((state("bdbv", end26 - dt.timedelta(b)), (end26 - dt.timedelta(b)).isoformat())
             for b in range(0, (end26 - day(R["bdbv"][0])).days) if events("bdbv", end26 - dt.timedelta(b))), key=lambda x: (x[0]["cutLaterBroke"], x[0]["cut"], -dt.date.fromisoformat(x[1]).toordinal()))
F["worst26"] = {"date": worst[1], **worst[0]}
# the hole as an edge, at Kivu's last day
F["holeK"] = state("kivu", endK, hole=True)
print(json.dumps(F, indent=1))
# how far the estimate at the last loss moves as the edge moves (2026 edges with at least 10 quiets)
ps = [(s["pStar"], E.isoformat()) for E, s in
      ((end26 - dt.timedelta(b), state("bdbv", end26 - dt.timedelta(b))) for b in range(0, 200))
      if s and s["n"] >= 10]
F["pStarRange26"] = {"min": min(ps), "max": max(ps), "edges": len(ps)}
assert F["holeK"]["n"] == 58 and F["holeK"]["tStar"] == 531 and round(F["holeK"]["pStar"], 2) == 0.19
assert F["worst26"]["date"] == "2026-10-03" and F["worst26"]["cutLaterBroke"] == 3 and F["worst26"]["cut"] == 12
assert F["pStarRange26"]["edges"] == 74 and F["pStarRange26"]["min"][0] == 0.153 and F["pStarRange26"]["max"][0] == 0.52
# the day after the worst edge ties it: the Studio's CALL IT (2026-11-06) found the same
assert (lambda s: (s["cut"], s["cutLaterBroke"]))(state("bdbv", day("2026-10-04"))) == (12, 3)
print("pStarRange26", F["pStarRange26"])
# ---- second state (session 35): the rule's own day ----
# For a rule-day T (42..120) and a window of W = 90 days after it (Djaafara et al. 2021's enhanced
# surveillance), the chance that a quiet which reached T breaks within the window, under the three rules:
#   carried  breaks seen before the edge, over every quiet that reached T (cut ones held for good);
#   left out only quiets whose window is closed at the edge speak (the Field's rule, applied to windows);
#   lost     1 - S(T+W) by Kaplan and Meier among quiets at risk on day T; undefined past the last loss.
W = 90


def rule_day(rec, E, T, hole=False):
    rows = []
    for q in Q:
        if q["rec"] != rec or len(q["k"]) < T:
            continue
        f, L = day(q["f"]), len(q["k"])
        through = (E - f).days
        if hole and f <= HOLE_LAST and f + dt.timedelta(L) > HOLE_LAST:
            through = min(through, (HOLE_LAST - f).days)
        if through < T:
            continue
        rows.append((L + 1, 1) if q["b"] and L + 1 <= through else (min(L, through), 0))
    if not rows:
        return None
    n, H = len(rows), T + W
    inwin = sum(1 for t, e in rows if e and t <= H)
    known = sum(1 for t, e in rows if (e and t <= H) or t >= H)
    S, m = 1.0, n
    for t in sorted({t for t, _ in rows}):
        if t > H:
            break
        d = sum(1 for u, e in rows if u == t and e)
        if d:
            S *= 1 - d / m
        m -= sum(1 for u, _ in rows if u == t)
    maxt = max(t for t, _ in rows)
    undefined = H > maxt and any(t == maxt and e == 0 for t, e in rows)
    return {"n": n, "known": known, "carried": round(inwin / n, 3),
            "out": round(inwin / known, 3) if known else None,
            "lost": None if undefined else round(1 - S, 3)}


RD = {}
RD["k42"], RD["k63"] = rule_day("kivu", endK, 42), rule_day("kivu", endK, 63)
RD["h42"] = rule_day("kivu", endK, 42, hole=True)
RD["b42"], RD["b63"] = rule_day("bdbv", end26, 42), rule_day("bdbv", end26, 63)
RD["b70"] = rule_day("bdbv", end26, 70)
RD["s42"] = rule_day("bdbv", day("2026-09-29"), 42)
# the first rule-day at which, in Kivu read to its end, fewer than 1 in 10 lost quiets break within 90 days
RD["kTenth"] = next(T for T in range(42, 400) if (r := rule_day("kivu", endK, T)) and r["lost"] is not None and r["lost"] < 0.1)
assert (RD["k42"]["n"], RD["k42"]["carried"], RD["k42"]["out"], RD["k42"]["lost"]) == (60, 0.467, 0.467, 0.467)
assert (RD["k63"]["carried"], RD["k63"]["out"], RD["k63"]["lost"]) == (0.38, 0.388, 0.38)
assert (RD["h42"]["n"], RD["h42"]["carried"], RD["h42"]["out"], RD["h42"]["lost"]) == (58, 0.466, 0.54, 0.511)
assert (RD["b42"]["n"], RD["b42"]["known"], RD["b42"]["carried"], RD["b42"]["out"], RD["b42"]["lost"]) == (22, 12, 0.5, 0.917, 0.568)
assert (RD["b63"]["carried"], RD["b63"]["out"], RD["b63"]["lost"]) == (0.231, 0.75, 0.314)
assert RD["b70"]["lost"] is None
assert RD["s42"]["lost"] is None and RD["s42"]["out"] == 1.0
print("ruleDay", RD)
F["ruleDay"] = RD
# ---- fourth state (session 37): what the record later showed ----
# For an edge E moved back, the same quiets (those that had reached 42 days by E) read again at the record's
# own last day. This is not the truth about them: it is the lost rule with more days, and at the real last day
# it is cut again. It is what the page can set beside the three rules as the later record's own reading.
def surv_at(ev, t):
    S, n = 1.0, len(ev)
    for u in sorted({x[0] for x in ev}):
        if u > t:
            break
        d = sum(1 for x in ev if x[0] == u and x[1])
        if d:
            S *= 1 - d / n
        n -= sum(1 for x in ev if x[0] == u)
    return S


def later(rec, E, hole=False):
    ev = events(rec, E, hole)
    ids = {id(q) for _, _, q in ev}
    end = end26 if rec == "bdbv" else endK
    return ev, [x for x in events(rec, end, False) if id(x[2]) in ids]


LT = {}
for key, E in (("aug30", "2026-08-30"), ("sep29", "2026-09-29")):
    ev, ev2 = later("bdbv", day(E))
    t = km(ev)[1]
    LT[key] = {"t": t, "carried": round(sum(1 for x in ev if not x[1]) / len(ev), 3),
               "lost": round(surv_at(ev, t), 3), "later": round(surv_at(ev2, t), 3)}
assert LT["aug30"] == {"t": 94, "carried": 0.364, "lost": 0.173, "later": 0.364}
assert LT["sep29"] == {"t": 124, "carried": 0.588, "lost": 0.483, "later": 0.403}
# at every 2026 edge a month or more back with at least ten quiets: which rule's value at the last cut quiet
# lies nearest the later record's reading of the same quiets on the same day (ties to the first named)
near = {"carried": 0, "lost": 0, "left out": 0}
for b in range(30, 200):
    E = end26 - dt.timedelta(b)
    ev, ev2 = later("bdbv", E)
    if len(ev) < 10:
        continue
    t = km(ev)[1]
    v = surv_at(ev2, t)
    d = {"carried": abs(sum(1 for x in ev if not x[1]) / len(ev) - v), "lost": abs(surv_at(ev, t) - v), "left out": v}
    near[min(d, key=d.get)] += 1
assert near == {"carried": 22, "lost": 22, "left out": 0}
LT["near"] = near
print("later", LT)
F["later"] = LT
# ---- fifth state (session 38): the judge's own rule ----
# The later reading above is itself read under a rule, at the record's real last day. Read it as carried, lost or
# left out in turn, and ask again at every edge a month or more back (at least ten quiets) which rule of the edge
# lies nearest. Left out read as judge sees only quiets that broke, so on the last cut quiet's day it says 0.
def judge_value(ev2, t, j):
    if j == "lost":
        return surv_at(ev2, t)
    if j == "carried":
        return 1 - sum(1 for x in ev2 if x[1] and x[0] <= t) / len(ev2)
    br = [x for x in ev2 if x[1]]
    return sum(1 for x in br if x[0] > t) / len(br)


def judges(rec):
    end = end26 if rec == "bdbv" else endK
    tab = {j: {"carried": 0, "lost": 0, "left out": 0} for j in ("lost", "carried", "left out")}
    n = agree = apart = 0
    gap = 0.0
    split = []  # sixth state: the edges at which the carried and lost judges part
    seq = []    # sixth state: the lost judge's verdict at each edge, in calendar order
    for b in range(30, (end - day(R[rec][0])).days):
        E = end - dt.timedelta(b)
        ev, ev2 = later(rec, E)
        if len(ev) < 10:
            continue
        n += 1
        t = km(ev)[1]
        r = {"carried": sum(1 for x in ev if not x[1]) / len(ev), "lost": surv_at(ev, t), "left out": 0.0}
        win = {}
        for j in tab:
            v = judge_value(ev2, t, j)
            d = {k: abs(x - v) for k, x in r.items()}
            win[j] = min(d, key=d.get)
            tab[j][win[j]] += 1
        agree += win["carried"] == win["lost"]
        apart += win["left out"] not in (win["carried"], win["lost"])
        seq.append((E.isoformat(), win["lost"]))
        if win["carried"] != win["lost"]:
            split.append(E.isoformat())
        gap = max(gap, abs(judge_value(ev2, t, "carried") - judge_value(ev2, t, "lost")))
    split.sort()
    seq.sort()
    runs = []
    for d, w in seq:
        if runs and runs[-1][2] == w:
            runs[-1][1] = d
        else:
            runs.append([d, d, w])
    longest = max(runs, key=lambda x: (day(x[1]) - day(x[0])).days)
    return {"edges": n, "tally": tab, "agreeCarriedLost": agree, "maxGapCarriedLost": round(gap, 3),
            "outApart": apart, "split": [split[0], split[-1]] if split else None, "splitN": len(split), "splitDays": split,
            "lostRuns": len(runs), "lostLongest": longest}


JG = {"bdbv": judges("bdbv"), "kivu": judges("kivu")}
assert JG["bdbv"]["edges"] == 44 and JG["bdbv"]["tally"]["lost"] == LT["near"]
assert JG["bdbv"]["tally"]["carried"] == {"carried": 22, "lost": 22, "left out": 0}
assert JG["bdbv"]["tally"]["left out"] == {"carried": 0, "lost": 0, "left out": 44}
assert JG["bdbv"]["agreeCarriedLost"] == 44 and JG["bdbv"]["maxGapCarriedLost"] == 0.008
assert JG["kivu"]["edges"] == 461 and JG["kivu"]["agreeCarriedLost"] == 446
assert JG["kivu"]["tally"]["lost"] == {"carried": 262, "lost": 106, "left out": 93}
assert JG["kivu"]["tally"]["carried"] == {"carried": 275, "lost": 92, "left out": 94}
assert JG["kivu"]["tally"]["left out"] == {"carried": 3, "lost": 48, "left out": 410}
# sixth state: the strip of verdicts. In Kivu the left-out judge names a rule neither other judge names at 331 of
# 461 edges; the carried and lost judges part at 15: once on 1 August 2019, and at the last 14 edges judged
# (5 to 18 May 2020), where the later record has watched only a month more, each finding for itself; the lost judge's
# verdict runs in 11 seasons, the longest 'carried' from 12 September 2019 to 4 May 2020.
assert JG["bdbv"]["outApart"] == 44 and JG["bdbv"]["splitN"] == 0
assert JG["kivu"]["splitDays"] == ["2019-08-01"] + ["2020-05-%02d" % d for d in range(5, 19)]
assert JG["kivu"]["outApart"] == 331 and JG["kivu"]["splitN"] == 15 and JG["kivu"]["split"] == ["2019-08-01", "2020-05-18"]
assert JG["bdbv"]["lostRuns"] == 4 and JG["bdbv"]["lostLongest"] == ["2026-08-17", "2026-09-06", "carried"]
assert JG["kivu"]["lostRuns"] == 11 and JG["kivu"]["lostLongest"] == ["2019-09-12", "2020-05-04", "carried"]
print("judges", JG)
F["judge"] = JG
# ---- seventh state (session 40): what came next ----
# The seasons have a cause the edge cannot see. At every judged edge, count the quiets the edge cuts and how many of
# them the later record shows breaking (a case, at any day up to the record's last). Sort the edges three ways: none
# of the cut quiets broke later, some but under a quarter, a quarter or more. Then read the lost judge's verdict in
# each. Where nothing broke later, the later record can only side with carried; where a quarter or more broke, it
# mostly cannot. The verdict on a rule is written by what the world did after the edge.
def next_tab(rec):
    end = end26 if rec == "bdbv" else endK
    tab = {k: {"carried": 0, "lost": 0, "left out": 0} for k in ("none", "under", "quarter")}
    for b in range(30, (end - day(R[rec][0])).days):
        E = end - dt.timedelta(b)
        ev, ev2 = later(rec, E)
        if len(ev) < 10:
            continue
        t = km(ev)[1]
        cut = [x for x in ev if not x[1]]
        lb = sum(1 for x in cut if x[2]["b"])
        r = {"carried": len(cut) / len(ev), "lost": surv_at(ev, t), "left out": 0.0}
        v = surv_at(ev2, t)
        d = {k: abs(x - v) for k, x in r.items()}
        k = "none" if lb == 0 else ("under" if lb / len(cut) < 0.25 else "quarter")
        tab[k][min(d, key=d.get)] += 1
    return tab


NX = {"bdbv": next_tab("bdbv"), "kivu": next_tab("kivu")}
assert NX["bdbv"] == {"none": {"carried": 12, "lost": 0, "left out": 0}, "under": {"carried": 5, "lost": 0, "left out": 0},
                      "quarter": {"carried": 5, "lost": 22, "left out": 0}}
assert NX["kivu"] == {"none": {"carried": 79, "lost": 0, "left out": 0}, "under": {"carried": 155, "lost": 14, "left out": 0},
                      "quarter": {"carried": 28, "lost": 92, "left out": 93}}
assert sum(sum(v.values()) for v in NX["kivu"].values()) == JG["kivu"]["edges"]
print("next", NX)
F["next"] = NX

# ---- ninth state (session 42): declare it ----
# A visitor stands at the edge with what came after hidden, and declares the quiets it cuts over: the carried rule,
# made by a hand on a day. On every day a declaration can be made (from the first day any quiet reached 42 days to the
# day before the record's own last, with at least one quiet cut), count the declarations a later case overtakes (at
# least one declared quiet broke later), and the most declared quiets overtaken on one day.
def declare_tab(rec):
    end = end26 if rec == "bdbv" else endK
    days = over = 0
    worst = (0, None)
    for b in range(1, (end - day(R[rec][0])).days):
        E = end - dt.timedelta(b)
        ev, _ = later(rec, E)
        cut = [x for x in ev if not x[1]]
        if not cut:
            continue
        days += 1
        lb = sum(1 for x in cut if x[2]["b"])
        if lb:
            over += 1
        if lb >= worst[0]:
            worst = (lb, E.isoformat(), len(cut))
    return {"days": days, "overtaken": over, "worst": list(worst)}


DC_EXPECT = {"bdbv": {"days": 116, "overtaken": 94, "worst": [3, "2026-07-16", 4]},
             "kivu": {"days": 621, "overtaken": 494, "worst": [8, "2019-03-27", 9]}}
DC = {"bdbv": declare_tab("bdbv"), "kivu": declare_tab("kivu")}
print("declare", DC)
assert DC["bdbv"] == DC_EXPECT["bdbv"] and DC["kivu"] == DC_EXPECT["kivu"]
F["declare"] = DC
data = {"source": {"path": "artifacts/cycle-012/the-last-case/quiets.json", "sha256": SHA,
                   "upstream": D["source"]},
        "records": R, "W": W, "holeLast": HOLE_LAST.isoformat(), "facts": F,
        "quiets": [{"rec": q["rec"], "z": q["z"], "f": q["f"], "L": len(q["k"]), "b": q["b"]} for q in Q]}
open(os.path.join(HERE, "edge-data.js"), "w").write("window.EDGE=" + json.dumps(data, separators=(",", ":")) + ";\n")
