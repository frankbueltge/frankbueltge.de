"""Project 10, session 1: the registered measurements. Usage: python3 session1.py SCRATCHDIR
Writes session1.json (registered results) and rows.json (derived rows: no text but the key)."""
import collections, json, random, sys
import numpy as np
from lib import key, position, nm_range, cls

NM = 1.852


def nearest_twins(lat, lon, keys):
    """For each index, distance (km) to nearest other with same key beyond 0.05 km; also count of same-key within 0.05 km."""
    n = len(keys)
    d_out = np.full(n, np.inf); same = np.zeros(n, int); twin = np.full(n, -1)
    groups = collections.defaultdict(list)
    for i, k in enumerate(keys):
        groups[k].append(i)
    la = np.radians(lat); lo = np.radians(lon)
    for k, idx in groups.items():
        if len(idx) < 2:
            continue
        idx = np.array(idx)
        a1, o1 = la[idx][:, None], lo[idx][:, None]
        a2, o2 = la[idx][None, :], lo[idx][None, :]
        h = np.sin((a2 - a1) / 2) ** 2 + np.cos(a1) * np.cos(a2) * np.sin((o2 - o1) / 2) ** 2
        d = 2 * 6371.0 * np.arcsin(np.minimum(1, np.sqrt(h)))
        np.fill_diagonal(d, np.inf)
        close = d <= 0.05
        same[idx] = close.sum(1)
        d[close] = np.inf
        j = d.argmin(1)
        d_out[idx] = d[np.arange(len(idx)), j]
        twin[idx] = np.where(np.isfinite(d_out[idx]), idx[j], -1)
    return d_out, same, twin


def main(scratch):
    rows, counts = [], collections.Counter()
    for v in range(110, 117):
        for r in json.load(open(f"{scratch}/lol{v}.json"))["ngalol"]:
            counts["records"] += 1
            if r.get("removeFromList") == "Y":
                counts["removed"] += 1; continue
            counts["lights"] += 1
            counts["deleteFlag_Y"] += r.get("deleteFlag") == "Y"
            k, p, kind = key(r.get("characteristic"))
            pos = position(r.get("position"))
            rg = nm_range(r.get("range"))
            counts["kind_" + kind] += 1
            counts["pos_fail"] += pos is None
            counts["range_unknown"] += rg is None
            rows.append({"v": v, "f": r.get("featureNumber"), "k": k, "p": p, "kind": kind,
                         "lat": round(pos[0], 5) if pos else None, "lon": round(pos[1], 5) if pos else None,
                         "rg": rg, "c": cls(rg)})
    parsed = [x for x in rows if x["kind"] != "unparsed"]
    res = {"counts": dict(counts)}
    res["fixed_share"] = sum(x["kind"] == "fixed" for x in parsed) / len(parsed)
    kc = collections.Counter((x["k"], x["p"]) for x in parsed)
    res["top_keys"] = [[k, p, n] for (k, p), n in kc.most_common(15)]
    # rhythmic lights with period, range and position
    R = [x for x in rows if x["kind"] == "rhythmic" and x["rg"] is not None and x["lat"] is not None]
    # twin search runs over all rhythmic lights with a position (a twin need not have a known range)
    T = [x for x in rows if x["kind"] == "rhythmic" and x["lat"] is not None]
    lat = np.array([x["lat"] for x in T]); lon = np.array([x["lon"] for x in T])
    keys = [f'{x["k"]}|{x["p"]}' for x in T]
    d, same, twin = nearest_twins(lat, lon, keys)
    for i, x in enumerate(T):
        x["twin_km"] = None if not np.isfinite(d[i]) else round(float(d[i]), 3)
        x["same_place"] = int(same[i])
        x["twin_i"] = int(twin[i])
    res["rhythmic_with_position"] = len(T)
    res["rhythmic_with_range_position"] = len(R)
    out = {}
    for c in ("all", "major", "middle", "minor"):
        S = [x for x in R if c == "all" or x["c"] == c]
        within = [x for x in S if x["twin_km"] is not None and x["twin_km"] <= x["rg"] * NM]
        notwin = sum(x["twin_km"] is None for x in S)
        dist = [x["twin_km"] for x in S if x["twin_km"] is not None]
        out[c] = {"n": len(S), "twin_within_range": len(within), "share": len(within) / len(S) if S else None,
                  "no_twin_anywhere": notwin, "median_twin_km": float(np.median(dist)) if dist else None}
    res["classes"] = out
    # null: shuffle keys among rhythmic lights (with position) within volume and range class, 20 times
    strata = collections.defaultdict(list)
    for i, x in enumerate(T):
        strata[(x["v"], x["c"])].append(i)
    null = collections.defaultdict(list)
    for s in range(20):
        rng = random.Random(20261016 + s)
        k2 = list(keys)
        for idx in strata.values():
            ks = [keys[i] for i in idx]; rng.shuffle(ks)
            for i, k in zip(idx, ks):
                k2[i] = k
        d2, _, _ = nearest_twins(lat, lon, k2)
        for c in ("all", "major", "middle", "minor"):
            sel = [i for i, x in enumerate(T) if x["rg"] is not None and (c == "all" or x["c"] == c) and np.isfinite(d2[i])]
            null[c].append(float(np.median(d2[sel])))
    for c in out:
        nm = float(np.median(null[c]))
        out[c]["null_median_km"] = nm
        out[c]["R"] = out[c]["median_twin_km"] / nm if out[c]["median_twin_km"] else None
    json.dump(res, open("session1.json", "w"), indent=1)
    json.dump(rows, open(f"{scratch}/rows_full.json", "w"))
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
