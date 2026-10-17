"""Project 10, session 3: the registered phase and reach measurements (SESSION3.md). Usage: python3 session3.py SCRATCHDIR
Writes session3.json (registered results), pairs3.json (per pair: indices into rows.json order are not kept; feature numbers, verdicts)
and, in scratch, pairs3_full.json (with raw characteristics and remarks, for the reading)."""
import json, random, sys
import numpy as np
from lib3 import phases, verdict, perceptible
from session1 import nearest_twins
from session2 import load, field

NM = 1.852


def main(scratch):
    rows = load(scratch)
    ch = []
    for v in range(110, 117):
        for r in json.load(open(f"{scratch}/lol{v}.json"))["ngalol"]:
            if r.get("removeFromList") != "Y":
                ch.append(r.get("characteristic"))
    assert len(ch) == len(rows)
    for x, c in zip(rows, ch):
        x["ch"] = c
    T = [x for x in rows if x["kind"] == "rhythmic" and x["lat"] is not None]
    lat = np.array([x["lat"] for x in T]); lon = np.array([x["lon"] for x in T])
    keys = [f'{x["k"]}|{x["p"]}' for x in T]
    d, same, twin = nearest_twins(lat, lon, keys)
    pairs = []
    for i, A in enumerate(T):
        if A["c"] != "major" or not np.isfinite(d[i]) or d[i] > A["rg"] * NM:
            continue
        B = T[twin[i]]
        rB = B["rg"] if B["rg"] is not None else A["rg"]
        sAB, own = field(A, B, A["rg"], rB)
        pa, pb = phases(A["ch"]), phases(B["ch"])
        km = float(d[i])
        mutual = B["rg"] is not None and km <= B["rg"] * NM
        rec = {"A": i, "B": int(twin[i]), "fA": A["f"], "fB": B["f"], "vA": A["v"], "vB": B["v"], "km": round(km, 3),
               "rA": A["rg"], "rB": B["rg"], "shared": sAB > 0, "phase": verdict(pa, pb), "phase_perceptible": perceptible(pa, pb),
               "statedA": pa is not None, "statedB": pb is not None, "mutual": mutual}
        rec["remainder"] = rec["shared"] and rec["phase"] != "parted" and mutual
        rec["remainder_perceptible"] = rec["shared"] and rec["phase_perceptible"] != "parted" and mutual
        pairs.append(rec)
    n = len(pairs)
    both = [p for p in pairs if p["phase"] != "unstated"]
    parted = [p for p in pairs if p["phase"] == "parted"]
    res = {
        "pairs": n, "shared": sum(p["shared"] for p in pairs),
        "both_stated": len(both), "both_stated_share": len(both) / n,
        "one_stated": sum(p["statedA"] != p["statedB"] for p in pairs),
        "none_stated": sum(not p["statedA"] and not p["statedB"] for p in pairs),
        "phase_same": sum(p["phase"] == "same" for p in pairs), "phase_parted": len(parted),
        "parted_share_of_both": len(parted) / len(both) if both else None,
        "phase_parted_perceptible": sum(p["phase_perceptible"] == "parted" for p in pairs),
        "B_no_range": sum(p["rB"] is None for p in pairs),
        "mutual": sum(p["mutual"] for p in pairs), "mutual_share": sum(p["mutual"] for p in pairs) / n,
        "remainder": sum(p["remainder"] for p in pairs),
        "remainder_perceptible": sum(p["remainder_perceptible"] for p in pairs),
        "remainder_same_phase": sum(p["remainder"] and p["phase"] == "same" for p in pairs),
        "remainder_unstated": sum(p["remainder"] and p["phase"] == "unstated" for p in pairs),
        "remainder_median_km": float(np.median([p["km"] for p in pairs if p["remainder"]])) if any(p["remainder"] for p in pairs) else None,
    }
    res["predictions"] = {
        "P12_both_stated_ge_30pct": res["both_stated_share"] >= 0.30,
        "P13_parted_le_15pct_of_both": res["parted_share_of_both"] is not None and res["parted_share_of_both"] <= 0.15,
        "P14_mutual_ge_50pct": res["mutual_share"] >= 0.50,
        "P15_remainder_ge_300": res["remainder"] >= 300,
    }
    json.dump(res, open("session3.json", "w"), indent=1)
    json.dump(pairs, open("pairs3.json", "w"))
    full = []
    for p in pairs:
        q = dict(p)
        for tag in ("A", "B"):
            x = T[p[tag]]
            q[tag + "_light"] = {k: x[k] for k in ("v", "f", "name", "k", "p", "rg", "lat", "lon", "remarks", "ch")}
        full.append(q)
    json.dump(full, open(f"{scratch}/pairs3_full.json", "w"), indent=1)
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
