"""UNWOVEN — build the cloth's data from the IPC's open area table.

Usage: python3 -I build.py <ipc_global_area_long.csv> <field summary.json>
Writes data.js (loaded by index.html) and summary.json. Asserts every count against the Field's
summary.json ("Three ways to write nobody", field-research, notes/convening-after-010/unclassified/).

One thread = one analysis x one validity period (current, first projection, second projection), 2017 on.
Encodings are the Field's (amended definition): an area-period is classified when phases 1-5 sum above 0.
Otherwise A: no phase rows and population 0; B: phase rows at 0 and population 0; C: phase rows at 0,
population kept. The table writes no reason for any of them.
"""
import csv, collections, json, sys
from datetime import datetime

area_csv, field_summary = sys.argv[1], sys.argv[2]
PH = "12345"
VP = {"current": 0, "first projection": 1, "second projection": 2}

g = collections.defaultdict(dict)
meta = {}
order = collections.defaultdict(list)  # area order within a thread, as the table lists it
for r in csv.DictReader(open(area_csv, newline="")):
    d = datetime.strptime(r["Date of analysis"], "%b %Y")
    if d.year < 2017:
        continue
    t = (r["Date of analysis"], r["Country"], r["Validity period"])
    a = (r["Level 1"], r["Area"])
    if a not in g[t + a] and not g[t + a]:
        order[t].append(a)
    g[t + a][r["Phase"]] = int(round(float(r["Number"]))) if r["Number"] else 0
    meta[t] = (d, r["From"], r["To"])

def enc(v):
    if sum(v.get(p, 0) for p in PH) > 0:
        return ""
    has = any(p in v for p in PH)
    if not has and v.get("all", 0) == 0:
        return "A"
    if has and v.get("all", 0) == 0:
        return "B"
    if has:
        return "C"
    raise SystemExit("an encoding the Field's three do not cover: %r" % (v,))

threads = sorted(order, key=lambda t: (meta[t][0], t[1], VP[t[2]]))
names, nidx = [], {}
def ni(s):
    if s not in nidx:
        nidx[s] = len(names); names.append(s)
    return nidx[s]

out, per_an = [], collections.defaultdict(lambda: collections.Counter())
tot = collections.Counter()
for t in threads:
    areas = []
    for a in dict.fromkeys(order[t]):
        v = g[t + a]
        e = enc(v)
        areas.append([ni(a[0]), ni(a[1]), v.get("all", 0)] + [v.get(p, 0) for p in PH] + [e])
        k = per_an[(t[0], t[1])]
        k["area_periods"] += 1
        if e:
            k[e] += 1
        if e == "C":
            k["C_people"] += v.get("all", 0)
    out.append({"d": t[0], "c": t[1], "v": VP[t[2]], "f": meta[t][1], "t": meta[t][2], "a": areas})
    for x in areas:
        tot["area_periods"] += 1
        if x[-1]:
            tot[x[-1]] += 1
        if x[-1] == "C":
            tot["C_people"] += x[2]

F = json.load(open(field_summary))
for k in ("A", "B", "C", "C_people", "area_periods"):
    assert tot[k] == F["totals"][k], (k, tot[k], F["totals"][k])
assert len(per_an) == F["analyses"], (len(per_an), F["analyses"])
assert sum(1 for k in per_an.values() if k["A"] + k["B"] + k["C"]) == F["with_any"]
for row in F["rows"]:
    k = per_an[(row["analysis"], row["country"])]
    for f in ("A", "B", "C", "C_people", "area_periods"):
        assert k[f] == row[f], (row, f, k[f])

# Sudan, analysis of Sep 2025: the six areas the IPC names, absent from the second projection's phases
sd = {(x["level1"], x["area"]) for x in F["sudan_sep2025"]["areas"]}
sec = [o for o in out if o["d"] == "Sep 2025" and o["c"] == "SDN" and o["v"] == 2][0]
held = [x for x in sec["a"] if (names[x[0]], names[x[1]]) in sd]
assert len(held) == 6 and all(x[-1] for x in held)
six_people = sum(x[2] for x in held) if all(x[-1] == "C" for x in held) else None
cur = [o for o in out if o["d"] == "Sep 2025" and o["c"] == "SDN" and o["v"] == 0][0]
six_cur = sum(x[2] for x in cur["a"] if (names[x[0]], names[x[1]]) in sd)
assert six_cur == F["sudan_sep2025"]["people"] == 841404, six_cur

summary = {"threads": len(out), "analyses": len(per_an), "countries": len({o["c"] for o in out}),
           "totals": dict(tot), "sudan_sep2025_six_current_people": six_cur,
           "first": out[0]["d"], "last": out[-1]["d"],
           "threads_all_zero": sum(1 for o in out if sum(x[2] for x in o["a"]) == 0)}
open("data.js", "w").write("window.UNWOVEN=" + json.dumps({"names": names, "threads": out, "summary": summary},
                           separators=(",", ":")) + ";\n")
json.dump(summary, open("summary.json", "w"), indent=1)
print(json.dumps(summary, indent=1))
