"""The Last Case: build quiets.json from the Field's check 52 and assert every figure the page states.

  python3 -I build.py <data52.js>

data52.js: the Field (field-research), artifacts/2026-11-03-the-second-clock/data52.js, commit 82f80ea.
It holds every quiet of 42 days or more in two Ebola records, each day classed:
  w = a report names the zone, a/u = a report does not name it (u: unread), n = no report at all.
A quiet runs from a rise in a zone's cumulative confirmed count to the next rise (broke: the case
comes on the day after the strip) or to the record's last day (held: nothing can yet be said).
"""
import hashlib, json, os, sys

SHA = "a97c2dbd6259e287acfef003a7e8fa3a8a4fc64d4b37b0a9c5b9ab685534f567"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA, "data52.js is not the pinned version"
s = raw.decode()
d = json.loads(s[s.index("{"): s.rindex("}") + 1])

Q = []
for rec, label in (("bdbv", "Congo and Ituri, 2026"), ("kivu", "North Kivu and Ituri, 2018–2020")):
    for q in d[rec]["q"]:
        assert len(q["k"]) == q["L"] and q["L"] >= 42
        Q.append({"rec": rec, "z": q["z"], "f": q["f"], "b": q["b"], "k": q["k"].replace("u", "a")})
F = {}
F["quiets"] = len(Q); F["broke"] = sum(q["b"] for q in Q)
F["n2026"] = sum(q["rec"] == "bdbv" for q in Q); F["nKivu"] = F["quiets"] - F["n2026"]
assert (F["quiets"], F["broke"], F["n2026"]) == (82, 43, 22)


def first(q, n=42):
    return q["k"][:n]


def share(qs, c):
    days = "".join(first(q) for q in qs)
    return days.count(c) / len(days)


B = [q for q in Q if q["b"]]; H = [q for q in Q if not q["b"]]
# What a listener could have heard in the first 42 days, broke against held
F["named42"] = {"broke": round(share(B, "w"), 3), "held": round(share(H, "w"), 3)}
F["silent42"] = {"broke": round(share(B, "n"), 3), "held": round(share(H, "n"), 3)}


def auc(score):
    """Chance that a quiet which broke scores above one which held (ties count half)."""
    t = 0.0
    for b in B:
        for h in H:
            t += 1 if score(b) > score(h) else 0.5 if score(b) == score(h) else 0
    return t / (len(B) * len(H))


# The best any reading of the first 42 days can do, by the three things a listener hears
F["auc"] = {"named": round(auc(lambda q: first(q).count("w")), 3),
            "silent": round(auc(lambda q: first(q).count("n")), 3),
            "lastSilentRun": round(auc(lambda q: len(first(q)) - len(first(q).rstrip("n"))), 3)}
# Fixed waits: of the quiets a wait of T calendar days calls over, how many broke after it
F["wait"] = {}
for T in (42, 49, 63, 90):
    over = [q for q in Q if len(q["k"]) >= T]
    F["wait"][T] = {"over": len(over), "brokeAfter": sum(q["b"] for q in over)}
assert F["wait"][42] == {"over": 82, "brokeAfter": 43}
# The second movement (pair.js) bets on one broke against one held: every such pair, and the best
# simple bet on the first 42 days, which pair.js states as "56 in 100" (found after the fact)
F["pairs"] = len(B) * len(H)
assert F["pairs"] == 1677
assert round(max(F["auc"]["named"], 1 - F["auc"]["named"], F["auc"]["silent"], 1 - F["auc"]["silent"]) * 100) == 56
# State 3 (2026-11-05) fixes the first two quiets and states what they hold: Lubunga 2026 has no report on
# 14 of its first 42 days; Beni 2020 runs into the Kivu hole (no report from the day after 7 March 2020
# to 10 June, 94 days) and its case comes with the first report after it.
import datetime as _dt
lub = next(q for q in Q if q["z"] == "Lubunga" and q["f"] == "2026-07-10")
assert first(lub).count("n") == 14 and not lub["b"]
beni = next(q for q in Q if q["z"] == "Beni" and q["f"] == "2020-02-17")
hole = d["kivu"]["hole"]
day = lambda n: (_dt.date.fromisoformat(beni["f"]) + _dt.timedelta(n)).isoformat()
assert hole == ["2020-03-07", "2020-06-10"] and day(19) == hole[0] and beni["k"][18] == "w"
assert set(beni["k"][19:]) == {"n"} and len(beni["k"][19:]) == 94 and beni["b"] and day(len(beni["k"]) + 1) == hole[1]
F["firstTwo"] = {"lubungaSilent42": 14, "beniHoleDays": 94, "beniCaseDay": len(beni["k"]) + 1}
# State 4 (2026-11-05, the presentation): the third movement, "The losses", from Kaplan and Meier (JASA 53, 1958).
# A quiet that broke is a "death" on day L+1; a quiet that held is a "loss" on day L, the record's last day: the
# record stopped watching, the zone did not stop. All 82 quiets reached 42 days, so the estimate is conditional
# on that (an entry after the start of the lifetime, which Kaplan and Meier allow). Product-limit estimate:
# P(t) = prod over death times u <= t of (1 - deaths(u)/at_risk(u)); losses at a death time count as at risk.
def pl(qs):
    ev = [(len(q["k"]) + 1, 1) if q["b"] else (len(q["k"]), 0) for q in qs]
    S, steps, n = 1.0, [], len(ev)
    for t in sorted(set(t for t, _ in ev)):
        dth = sum(1 for u, e in ev if u == t and e); out = sum(1 for u, e in ev if u == t)
        if dth: S *= 1 - dth / n; steps.append([t, round(S, 4)])
        n -= out
    last = max(ev)
    return {"n": len(qs), "deaths": steps, "losses": sorted(t for t, e in ev if not e),
            "tStar": last[0], "tStarIsLoss": last[1] == 0, "pStar": steps[-1][1] if steps else 1.0}
PL = {"both": pl(Q), "bdbv": pl([q for q in Q if q["rec"] == "bdbv"]), "kivu": pl([q for q in Q if q["rec"] == "kivu"])}
# what the movement states
b26, kv, al = PL["bdbv"], PL["kivu"], PL["both"]
assert (b26["tStar"], b26["tStarIsLoss"], round(b26["pStar"], 2), len(b26["losses"])) == (154, True, 0.43, 11)
assert (kv["tStar"], kv["tStarIsLoss"], round(kv["pStar"], 2), len(kv["losses"])) == (633, True, 0.43, 28)
assert al["tStarIsLoss"] and round(dict(al["deaths"])[114], 2) == 0.50 and al["deaths"][-1][0] == 294
end = lambda q: (_dt.date.fromisoformat(q["f"]) + _dt.timedelta(len(q["k"]))).isoformat()
assert {end(q) for q in H if q["rec"] == "bdbv"} == {"2026-10-29"} and {end(q) for q in H if q["rec"] == "kivu"} == {"2020-06-17"}
kh = [q for q in H if q["rec"] == "kivu"]
assert all(q["f"] < hole[0] for q in kh)  # every Kivu loss was watched through the 94 days without a report
F["lossesKivuNoReport"] = round(sum(q["k"].count("n") for q in kh) / sum(len(q["k"]) for q in kh), 3)
assert round(F["lossesKivuNoReport"] * 100) == 37
F["pl"] = PL
for k, v in F.items():
    print(k, v if k != "pl" else {r: (x["tStar"], x["pStar"]) for r, x in v.items()})
here = os.path.dirname(os.path.abspath(__file__))
json.dump({"source": {"repo": "frankbueltge/field-research", "commit": "82f80ea",
                      "path": "artifacts/2026-11-03-the-second-clock/data52.js", "sha256": SHA},
           "records": {"bdbv": d["bdbv"]["cal"], "kivu": d["kivu"]["cal"], "kivuHole": d["kivu"]["hole"]},
           "facts": F, "quiets": Q}, open(os.path.join(here, "quiets.json"), "w"), separators=(",", ":"))
