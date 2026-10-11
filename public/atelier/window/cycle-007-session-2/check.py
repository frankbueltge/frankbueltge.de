"""Checks on data.json and results.json alone (no network, no sources).  python3 -I check.py
v_inf is stored to 3 decimals, so derived radii are checked to 0.1 %."""
import json, math, os
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(here, "data.json"))); R = json.load(open(os.path.join(here, "results.json")))
MU, RE = 398600.4418, 6371.0; bad = 0; n = 0
def ok(c, m):
    global bad, n; n += 1
    if not c: bad += 1; print("FAIL", m)
rows, imp = d["rows"], d["impactor_rows"]
ok(len(rows) == R["n_rows_le_1ld"] == 1159, "1,159 rows within one lunar distance")
ok(len(d["bound"]) == 12 and all(b[0] == "2020 CD3" for b in d["bound"]), "12 bound rows, all 2020 CD3")
for x in rows + imp:
    v = x["vinf"]
    ok(abs(x["bcap_km"] - RE * math.sqrt(1 + 2 * MU / RE / v ** 2)) <= 1 + 1e-3 * x["bcap_km"], f"bcap {x['des']}")
    ok(abs(x["u_km"] - 2 * MU / v ** 2) <= 1 + 1e-3 * x["u_km"], f"bend scale {x['des']}")
    ok(x["b_km"] >= x["r_km"], f"b >= r {x['des']}")
    ok(x["reg"] == ("timing" if x["moid_km"] < x["bcap_km"] else "geometry"), f"registered class {x['des']}")
    want = ("undecided" if x["moid_km"] > x["b_km"] else "timing" if x["moid_km"] + x["u_km"] < x["bcap_km"]
            else "geometry" if x["moid_km"] - x["u_km"] > x["bcap_km"] else "undecided")
    ok(abs(x["cls"] == want) or abs(x["moid_km"] - x["bcap_km"]) <= 2, f"three-class {x['des']} {x['cd']}")
for x in rows: ok(x["r_ld"] <= 0.00257 * 149597870.7 / 384400 + 1e-4, f"within 1 LD {x['des']}")
t = sum(x["reg"] == "timing" for x in rows); ok(t == 61, "61 timing-only (registered)")
ok(sum(x["moid_km"] > x["b_km"] for x in rows) == R["moid_now_exceeds_b"] == 215, "215 rows with MOID > b")
ok(R["three_classes"] == {"timing": 12, "undecided": 329, "geometry": 818}, "three classes 12/329/818")
ok(len(imp) == 15 and len({x["des"] for x in imp}) == 8, "15 earlier rows on 8 impactors")
ok(all(x["reg"] == "timing" and x["r_ld"] > 1 for x in imp), "impactor rows timing-only, beyond 1 LD")
ten = sorted(rows, key=lambda x: x["r_km"])[:10]
ok(sum(x["reg"] == "timing" for x in ten) == 5 and sum(x["cls"] == "undecided" for x in ten) == 9, "nearest ten: 5 registered timing, 9 undecided")
held = {k: v["held"] for k, v in R["predictions"].items()}
ok(held == {"P1": True, "P2": False, "P3": True, "P4": True, "P5": True}, "P1,P3,P4,P5 held; P2 failed")
print(f"{n - bad} of {n} checks passed"); raise SystemExit(bad > 0)
