"""HOLD THE COUNT: build data.json from the Field's study 56 and assert every figure the page shows.

  python3 -I build.py <data56.js> <quiets.json>

data56.js: the Field (field-research), artifacts/after-cycle-012/who-the-curve-speaks-for/data56.js, written
by analyse56.py on 2026-11-06 (session 254), SHA-256 pinned below. It is read here as data (JSON inside a
window assignment), never run. For both records it lists every quiet as study 53's code builds it:
  z  the health zone
  a  the rise day, an index into the record's calendar (one entry per day, first to last)
  L  days to the zone's next rise (a new confirmed case), or null: no rise before the record's last day
quiets.json: the Atelier (ulysses), artifacts/cycle-012/the-last-case/quiets.json at commit 761fc7b2 (as
pinned in etudes/call-it/). Only its records.kivuHole is taken: in Kivu no report came after 7 March 2020
until 10 June 2020. The page darkens a hold on those 94 days.

A visitor's hold is one quiet drawn at random from all quiets of a record, at one second per day.
"""
import datetime as dt, hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHA56 = "1b1c140f83172a7123af60b9d73534b1a2e58191f40a5e859b0b2668520cb63a"
SHAQ = "1001d6a12d4484ff323ed0ba14ca8bf44ef4fdd33cc938b6391264e3f1ba21e8"
H, AFTER = 42, 90
day = dt.date.fromisoformat

t = open(sys.argv[1], encoding="utf-8").read()
assert hashlib.sha256(t.encode("utf-8")).hexdigest() == SHA56, "data56.js is not the pinned version"
D56, _ = json.JSONDecoder().raw_decode(t[t.index("{"):])
raw = open(sys.argv[2], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHAQ, "quiets.json is not the pinned version"
hole = json.loads(raw)["records"]["kivuHole"]
assert hole == ["2020-03-07", "2020-06-10"]
assert (day(hole[1]) - day(hole[0])).days - 1 == 94           # 94 days with no report

KEY = {"Kivu 2018-2020": "kivu", "Congo 2026": "congo"}
out = {"H": H, "after": AFTER, "records": {}}
F = {}
for lab, key in KEY.items():
    r = D56[lab]
    N, first = r["N"], day(r["first"])
    assert (day(r["last"]) - first).days + 1 == N
    qs = r["quiets"]
    zones = sorted({q["z"] for q in qs})
    zi = {z: i for i, z in enumerate(zones)}

    def seen(q):                       # days the record watches after the rise
        return N - 1 - q["a"]

    n = len(qs)
    broke_by42 = sum(1 for q in qs if q["L"] is not None and q["L"] <= H)
    ended_by42 = sum(1 for q in qs if q["L"] is None and seen(q) < H)
    reach = [q for q in qs if (q["L"] is not None and q["L"] > H) or (q["L"] is None and seen(q) >= H)]
    # a hold reaches day 42 when the record watches 42 days after the rise and writes no case in them
    assert n == broke_by42 + ended_by42 + len(reach), lab
    then_broke = sum(1 for q in reach if q["L"] is not None and q["L"] <= H + AFTER)
    then_held = sum(1 for q in reach if (q["L"] is not None and q["L"] > H + AFTER) or (q["L"] is None and seen(q) >= H + AFTER))
    then_ended = len(reach) - then_broke - then_held
    one_day = sum(1 for q in qs if q["L"] == 1)
    F[key] = {"quiets": n, "zones": len(zones), "one_day": one_day, "broke_by42": broke_by42,
              "ended_by42": ended_by42, "reach42": len(reach), "then_broke": then_broke,
              "then_held": then_held, "then_ended": then_ended, "first": r["first"], "last": r["last"], "N": N}
    out["records"][key] = {"label": lab, "first": r["first"], "last": r["last"], "N": N, "zones": zones,
                           "q": [[zi[q["z"]], q["a"], -1 if q["L"] is None else q["L"]] for q in qs]}

# the hole, as day indices into Kivu's calendar: the days with no report
k0 = day(F["kivu"]["first"])
out["records"]["kivu"]["hole"] = [(day(hole[0]) - k0).days + 1, (day(hole[1]) - k0).days - 1]
out["records"]["congo"]["hole"] = None
ha, hb = out["records"]["kivu"]["hole"]
assert (k0 + dt.timedelta(ha)).isoformat() == "2020-03-08" and (k0 + dt.timedelta(hb)).isoformat() == "2020-06-09"

# how many of Kivu's quiets that reach day 42 are watched through the hole (held across it)
kq = D56["Kivu 2018-2020"]["quiets"]
through = [q for q in kq if q["a"] < ha and (q["L"] is None or q["a"] + q["L"] > hb)]
F["kivu"]["through_hole"] = len(through)
F["kivu"]["through_hole_held"] = sum(1 for q in through if q["L"] is None)

assert F["kivu"]["through_hole_held"] == 28                    # the Atelier's case ho-2026-11-05-atelier-3

# the figures the page and the bulletin state, asserted
k, c = F["kivu"], F["congo"]
assert (k["quiets"], k["zones"], k["one_day"]) == (1546, 29, 842)
assert (c["quiets"], c["zones"], c["one_day"]) == (2027, 67, 992)
assert (k["reach42"], k["then_broke"], k["then_held"], k["then_ended"]) == (60, 28, 32, 0)
assert (c["reach42"], c["then_broke"], c["then_held"], c["then_ended"]) == (22, 11, 1, 10)
assert round(100 * k["then_broke"] / k["reach42"]) == 47      # the Atelier's 47 in 100 (The Edge)
assert D56["Kivu 2018-2020"]["p42"]["n"] == k["reach42"]       # the Field's day-42 population, Kivu
assert round(100 * k["reach42"] / k["quiets"], 1) == 3.9 and round(100 * c["reach42"] / c["quiets"], 1) == 1.1
out["facts"] = F
json.dump(out, open(os.path.join(HERE, "data.json"), "w"), separators=(",", ":"))
print(json.dumps(F, indent=1))
