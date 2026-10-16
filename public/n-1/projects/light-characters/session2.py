"""Project 10, session 2: the registered arc measurements (SESSION2.md). Usage: python3 session2.py SCRATCHDIR
Writes session2.json (registered results) and, in scratch, pairs2_full.json (with raw remarks, for the reading)."""
import json, random, sys
import numpy as np
from lib import key, position, nm_range, cls
from lib2 import arcs, sees
from session1 import nearest_twins

NM = 1.852
KMDEG = 111.195


def load(scratch):
    rows = []
    for v in range(110, 117):
        for r in json.load(open(f"{scratch}/lol{v}.json"))["ngalol"]:
            if r.get("removeFromList") == "Y":
                continue
            k, p, kind = key(r.get("characteristic"))
            pos = position(r.get("position"))
            rg = nm_range(r.get("range"))
            rows.append({"v": v, "f": r.get("featureNumber"), "name": r.get("name"), "k": k, "p": p, "kind": kind,
                         "lat": round(pos[0], 5) if pos else None, "lon": round(pos[1], 5) if pos else None,
                         "rg": rg, "c": cls(rg), "remarks": r.get("remarks")})
    return rows


def field(A, B, rA, rB):
    """Return (shared_points, A_visible_points_on_A_disc) on a local flat grid; ranges in nm."""
    lat0 = (A["lat"] + B["lat"]) / 2; lon0 = (A["lon"] + B["lon"]) / 2
    cx = np.cos(np.radians(lat0)) * KMDEG
    ax, ay = (A["lon"] - lon0) * cx, (A["lat"] - lat0) * KMDEG
    bx, by = (B["lon"] - lon0) * cx, (B["lat"] - lat0) * KMDEG
    RA, RB = rA * NM, rB * NM
    step = max(0.1, min(RA, RB) / 80)
    mA, _ = arcs(A["remarks"]); mB, _ = arcs(B["remarks"])

    def vis(px, py, lx, ly, R, m):
        dx, dy = lx - px, ly - py
        inr = dx * dx + dy * dy <= R * R
        brg = np.degrees(np.arctan2(dx, dy))
        return inr & sees(m, brg)

    # intersection box
    x0, x1 = max(ax - RA, bx - RB), min(ax + RA, bx + RB)
    y0, y1 = max(ay - RA, by - RB), min(ay + RA, by + RB)
    shared = 0
    if x0 < x1 and y0 < y1:
        X, Y = np.meshgrid(np.arange(x0, x1, step) + step / 2, np.arange(y0, y1, step) + step / 2)
        shared = int((vis(X, Y, ax, ay, RA, mA) & vis(X, Y, bx, by, RB, mB)).sum())
    X, Y = np.meshgrid(np.arange(ax - RA, ax + RA, step) + step / 2, np.arange(ay - RA, ay + RA, step) + step / 2)
    own = int(vis(X, Y, ax, ay, RA, mA).sum())
    return shared, own


def main(scratch):
    rows = load(scratch)
    T = [x for x in rows if x["kind"] == "rhythmic" and x["lat"] is not None]
    lat = np.array([x["lat"] for x in T]); lon = np.array([x["lon"] for x in T])
    keys = [f'{x["k"]}|{x["p"]}' for x in T]
    d, same, twin = nearest_twins(lat, lon, keys)
    pairs = []
    la, lo = np.radians(lat), np.radians(lon)
    for i, A in enumerate(T):
        if A["c"] != "major" or not np.isfinite(d[i]) or d[i] > A["rg"] * NM:
            continue
        B = T[twin[i]]
        # nearest different-key rhythmic neighbour
        h = np.sin((la - la[i]) / 2) ** 2 + np.cos(la[i]) * np.cos(la) * np.sin((lo - lo[i]) / 2) ** 2
        dd = 2 * 6371.0 * np.arcsin(np.minimum(1, np.sqrt(h)))
        ok = (dd > 0.05) & np.array([k != keys[i] for k in keys])
        dd = np.where(ok, dd, np.inf)
        j = int(dd.argmin())
        C = T[j] if dd[j] <= A["rg"] * NM else None
        rB = B["rg"] if B["rg"] is not None else A["rg"]
        sAB, own = field(A, B, A["rg"], rB)
        rec = {"A": i, "B": int(twin[i]), "km": round(float(d[i]), 3), "rA": A["rg"], "rB": B["rg"], "rB_used": rB,
               "statusA": arcs(A["remarks"])[1], "statusB": arcs(B["remarks"])[1],
               "shared": sAB, "ownA": own, "share": sAB / own if own else None}
        if C is not None:
            rC = C["rg"] if C["rg"] is not None else A["rg"]
            sAC, ownC = field(A, C, A["rg"], rC)
            rec.update({"C": j, "kmC": round(float(dd[j]), 3), "statusC": arcs(C["remarks"])[1], "sharedC": sAC})
        pairs.append(rec)
    n = len(pairs)
    restricted = sum(p["statusA"] == "restricted" or p["statusB"] == "restricted" for p in pairs)
    keep = [p for p in pairs if p["shared"] > 0]
    withC = [p for p in pairs if "C" in p]
    keepC = sum(p["sharedC"] > 0 for p in withC)
    keepAB_withC = sum(p["shared"] > 0 for p in withC)
    deg_lights = {}
    for p in pairs:
        for idx, st in ((p["A"], p["statusA"]), (p["B"], p["statusB"])):
            if T[idx]["remarks"] and "°" in T[idx]["remarks"]:
                deg_lights[idx] = st
    parsed = sum(st == "restricted" for st in deg_lights.values())
    res = {
        "pairs": n,
        "rB_from_A": sum(p["rB"] is None for p in pairs),
        "restricted_any": restricted, "restricted_share": restricted / n,
        "restricted_both": sum(p["statusA"] == "restricted" and p["statusB"] == "restricted" for p in pairs),
        "keep_shared": len(keep), "keep_share": len(keep) / n,
        "parted": n - len(keep),
        "with_neighbour": len(withC), "neighbour_keep": keepC, "neighbour_keep_share": keepC / len(withC) if withC else None,
        "twin_keep_share_same_subset": keepAB_withC / len(withC) if withC else None,
        "degree_lights": len(deg_lights), "degree_lights_parsed": parsed,
        "degree_parse_share": parsed / len(deg_lights) if deg_lights else None,
        "degree_status_counts": {s: sum(v == s for v in deg_lights.values()) for s in set(deg_lights.values())},
        "median_shared_share": float(np.median([p["share"] for p in keep if p["share"] is not None])) if keep else None,
    }
    res["predictions"] = {
        "P7_restricted_ge_30pct": res["restricted_share"] >= 0.30,
        "P8_keep_ge_75pct": res["keep_share"] >= 0.75,
        "P9_within_10_points": abs(res["keep_share"] - res["neighbour_keep_share"]) <= 0.10,
        "P10_parse_ge_90pct": res["degree_parse_share"] >= 0.90,
        "P11_median_share_lt_50pct": res["median_shared_share"] < 0.50,
    }
    json.dump(res, open("session2.json", "w"), indent=1)
    full = []
    for p in pairs:
        q = dict(p)
        for tag in ("A", "B", "C"):
            if tag in p:
                x = T[p[tag]]
                q[tag + "_light"] = {k: x[k] for k in ("v", "f", "name", "k", "p", "rg", "lat", "lon", "remarks")}
        full.append(q)
    json.dump(full, open(f"{scratch}/pairs2_full.json", "w"), indent=1)
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
