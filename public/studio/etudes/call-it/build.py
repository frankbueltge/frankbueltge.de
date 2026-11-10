"""CALL IT: build data.json from the Atelier's quiets and check the case against the Studio's own open file.

  python3 -I build.py <quiets.json>

quiets.json: the Atelier (ulysses), artifacts/cycle-012/the-last-case/quiets.json at commit 761fc7b2,
itself built from the Field's check 52 (situation reports). Each quiet runs from a rise in a zone's
confirmed count; k classes each day: w = a report names the zone, a = a report does not name it,
n = no report at all. b: the quiet broke, with a case on the day after the strip.

The strip begins on the day AFTER the rise: read so, every held quiet's strip ends exactly on its
record's last day (39 of 39, asserted below), and the three breaks fall on the days the open file
writes them. The Atelier's The Edge counts the rise day as day 1, so its break dates run one day early
(Tshopo 4 Oct, Adja 5 Oct, Mahagi 20 Oct) and every quiet reads a day longer. The case stands either way.

The case (the Atelier's offer of 2026-11-06): read at the edge of 3 October 2026, twelve quiets were
running past 42 days, and three of them broke later. This script asserts it from the Atelier's file, then
checks it against the Studio's own reading of the open daily file (OCHA DRC on HDX, reduced in
works/2026-11-03-clear-air/data.js): the same twelve zones, the same last rises, the same three breaks.
"""
import datetime as dt, hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHA = "1001d6a12d4484ff323ed0ba14ca8bf44ef4fdd33cc938b6391264e3f1ba21e8"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA, "quiets.json is not the pinned version"
A = json.loads(raw)
day = dt.date.fromisoformat
E, END = day("2026-10-03"), day("2026-10-29")
assert A["records"]["bdbv"] == ["2026-05-14", "2026-10-29"]

for q in A["quiets"]:
    if not q["b"]:
        assert day(q["f"]) + dt.timedelta(len(q["k"])) == day(A["records"][q["rec"]][1]), q["z"]

assert sum(not q["b"] for q in A["quiets"]) == 39


def edge(Ed):
    """At an edge, the quiets still running past 42 days, and how many of them broke later."""
    cut = later = 0
    for q in A["quiets"]:
        if q["rec"] != "bdbv":
            continue
        f, L = day(q["f"]), len(q["k"])
        brk = f + dt.timedelta(L + 1) if q["b"] else None
        if brk and brk <= Ed:
            continue
        if min(L, (Ed - f).days) >= 42:
            cut += 1; later += bool(brk)
    return cut, later


# no edge of 2026 cuts more quiets that broke later than 3 October (4 October ties it)
best = max(edge(END - dt.timedelta(b))[1] for b in range((END - day("2026-05-14")).days))
assert best == 3 and edge(E) == (12, 3)

twelve = []
for q in A["quiets"]:
    if q["rec"] != "bdbv":
        continue
    f, L = day(q["f"]), len(q["k"])
    through = (E - f).days                        # quiet days through the edge, the rise day not one
    brk = (f + dt.timedelta(L + 1)).isoformat() if q["b"] else None
    if brk and day(brk) <= E:
        continue                                  # broke before the edge
    t = min(L, through)
    if t < 42:
        continue
    seen = q["k"][:t]
    twelve.append({"z": q["z"], "f": q["f"], "k": q["k"], "b": q["b"], "brk": brk, "t": t,
                   "atelierBrk": (f + dt.timedelta(L)).isoformat() if q["b"] else None,
                   "named": seen.count("w"), "unnamed": seen.count("a"), "noreport": seen.count("n"),
                   "last20named": seen[-20:].count("w")})
twelve.sort(key=lambda r: r["f"])
assert len(twelve) == 12 and sum(r["b"] for r in twelve) == 3          # the Atelier's case
assert {r["z"]: r["brk"] for r in twelve if r["b"]} == {"Adja": "2026-10-06", "Tshopo": "2026-10-05",
                                                         "Mahagi": "2026-10-21"}
assert min(r["t"] for r in twelve) == 42 and max(r["t"] for r in twelve) == 128

# the Studio's own file: OCHA DRC daily by health zone (HDX), as CLEAR AIR reduced it
s = open(os.path.join(HERE, "..", "..", "works", "2026-11-03-clear-air", "data.js")).read()
C = json.loads(s[s.index("{"): s.rindex("}") + 1])
days = C["days"]; i = days.index(E.isoformat())
assert days[-1] == END.isoformat()


def rises(c, lo, hi):
    return [j for j in range(max(lo, 1), hi) if c[j] is not None and c[j - 1] is not None and c[j] > c[j - 1]]


hdx, unplaced = {}, None
for z in C["zones"]:
    r = rises(z["cum"], 0, i + 1)
    if not r:
        continue
    last = r[-1]
    if i - last >= 42:                             # the same count: quiet days after the rise
        after = rises(z["cum"], i + 1, len(days))
        hdx[z["name"]] = {"last": days[last], "next": days[after[0]] if after else None}
# the file's "NA" row holds cases it places in no zone; it is quiet too, and it is not a district
unplaced = hdx.pop("NA")
assert sorted(hdx) == sorted(r["z"] for r in twelve), sorted(hdx)
for r in twelve:
    h = hdx[r["z"]]
    assert h["last"] == r["f"], r["z"]
    if r["b"]:
        assert h["next"] == r["brk"], r["z"]       # the open file writes the break on the same day
    else:
        assert h["next"] is None, r["z"]
    r["hdxNext"] = h["next"]

F = {"edge": E.isoformat(), "end": END.isoformat(), "running": 12, "broke": 3, "held": 9,
     "firstBreak": "2026-10-05", "hdxSameZones": True, "hdxSameBreaks": 3, "heldStripsEndOnLastDay": 39,
     "atelierBreaksOneDayEarly": 3,
     "hdxUnplaced": unplaced, "allNamedLast20": sum(r["last20named"] == 20 for r in twelve)}
assert F["allNamedLast20"] == 11 and unplaced == {"last": "2026-06-03", "next": None}
print(json.dumps(F), [(r["z"], r["t"], r["brk"]) for r in twelve])
out = {"source": {"atelier": {"repo": "frankbueltge/ulysses", "commit": "761fc7b2bdddcc7113c35a52bc3f7f9878c7ed8f",
                              "path": "artifacts/cycle-012/the-last-case/quiets.json", "sha256": SHA,
                              "upstream": A["source"]},
                  "studio": "works/2026-11-03-clear-air/data.js (OCHA DRC on HDX, CC BY)"},
       "start": twelve[0]["f"], "facts": F, "twelve": twelve}
json.dump(out, open(os.path.join(HERE, "data.json"), "w"), separators=(",", ":"))
