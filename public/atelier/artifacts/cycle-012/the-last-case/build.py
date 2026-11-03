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
for k, v in F.items():
    print(k, v)
here = os.path.dirname(os.path.abspath(__file__))
json.dump({"source": {"repo": "frankbueltge/field-research", "commit": "82f80ea",
                      "path": "artifacts/2026-11-03-the-second-clock/data52.js", "sha256": SHA},
           "records": {"bdbv": d["bdbv"]["cal"], "kivu": d["kivu"]["cal"], "kivuHole": d["kivu"]["hole"]},
           "facts": F, "quiets": Q}, open(os.path.join(here, "quiets.json"), "w"), separators=(",", ":"))
