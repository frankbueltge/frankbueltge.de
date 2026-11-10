"""FIRST MET — build data.json from the Field's data54.js (check 54), pinned by commit and checksum.

The Field's file is fetched at a fixed commit, checked, and reduced to what the page draws:
per readable report day, new confirmed cases and how many of them were community deaths.
Nothing here is re-measured; the counts are the Field's, re-summed and asserted.
"""
import hashlib, json, urllib.request, pathlib

COMMIT = "5589ea174de1bcae98927ddc5f5649d4015a7b4d"
URL = ("https://raw.githubusercontent.com/frankbueltge/field-research/"
       f"{COMMIT}/artifacts/cycle-012/the-quiet-curve/data54.js")
SHA = "2a5d215777c3a5c1673435b1f3d97334a81980540665b2725d0758a60fc8692c"

raw = urllib.request.urlopen(URL, timeout=60).read()
assert hashlib.sha256(raw).hexdigest() == SHA, "the Field's file changed; re-read before building"
t = raw.decode()
d = json.loads(t[t.index("{"): t.rindex("}") + 1])

s = d["series"]
assert len(s) == 80 == d["summary"]["usable"]
assert sum(x["new"] for x in s) == 5966 == d["summary"]["newConfirmed"]
assert sum(x["comm"] for x in s) == 1921 == d["summary"]["communityDeaths"]
assert all(0 <= x["comm"] <= x["new"] for x in s)
assert s[0]["date"] == "2026-07-13" and s[-1]["date"] == "2026-11-01"
assert max(x["new"] for x in s) == 172 and min(x["new"] for x in s) == 40
assert [x["date"] for x in s].count("2026-10-01") == 2  # two reports carry that date

# calendar days in the window with no readable report
from datetime import date, timedelta
d0, d1 = date(2026, 7, 13), date(2026, 11, 1)
have = {x["date"] for x in s}
gaps = []
k = d0
while k <= d1:
    if k.isoformat() not in have:
        gaps.append(k.isoformat())
    k += timedelta(days=1)
assert len(gaps) == 112 - 79 == 33, len(gaps)  # 112 calendar days, 79 distinct dates

shares = [x["comm"] / x["new"] for x in s]
out = {
    "source": URL,
    "sha256": SHA,
    "days": [{"date": x["date"], "new": x["new"], "comm": x["comm"]} for x in s],
    "gaps": gaps,
    "totals": {"new": 5966, "comm": 1921, "alive": 5966 - 1921},
    "share_range": [round(min(shares), 3), round(max(shares), 3)],
}
# state 2 (session 225): the Field's answer to the étude's question, study 55, pinned the same way.
# Per report day: its distance from the pooled share in standard errors (z), and the funnel width.
C55 = "7a14a559a7cd7e6dca3aa5e46ee5b7b787935cc4"
URL55 = ("https://raw.githubusercontent.com/frankbueltge/field-research/"
         f"{C55}/artifacts/cycle-012/the-quiet-curve/results55.json")
SHA55 = "570aec7e845b7ebf18fffdd72798f92a58067eea5738beb5b9867db66a35d6f0"
raw55 = urllib.request.urlopen(URL55, timeout=60).read()
assert hashlib.sha256(raw55).hexdigest() == SHA55, "results55.json changed; re-read before building"
r55 = json.loads(raw55)
pool = r55["summary"]["pooled"]
assert (pool["k"], pool["n"]) == (1921, 5966)
P = pool["k"] / pool["n"]
FZ = r55["params"]["funnelZ"]
assert FZ == 3.09
assert len(r55["days"]) == 80
for x, y in zip(s, r55["days"]):  # same days, same order, same counts as data54
    assert (x["date"], x["new"], x["comm"]) == (y["date"], y["n"], y["k"])
    z = (y["k"] / y["n"] - P) / (P * (1 - P) / y["n"]) ** 0.5
    assert abs(z - y["z"]) < 0.006, (y, z)  # recomputed here, to the Field's two decimals
outside = [y["date"] for y in r55["days"] if abs(y["z"]) > FZ]
assert outside == ["2026-07-30", "2026-08-31"] and r55["summary"]["nOutside"] == 2
phi = r55["predictions"]["P12"]["value"]["phi"]
assert phi == 2.29
for o, y in zip(out["days"], r55["days"]):
    o["z"] = y["z"]
out["chance"] = {"source": URL55, "sha256": SHA55, "pooled": round(P, 5), "funnelZ": FZ,
                 "phi": phi, "outside": outside}

pathlib.Path(__file__).with_name("data.json").write_text(json.dumps(out, separators=(",", ":")))
print("ok", out["totals"], "outside", outside, "gaps", len(gaps), "share range", out["share_range"])
