"""Analysis for preregistered A1-A4, B1-B3. Seeded; deterministic."""
import json, random, collections, math
D = "artifacts/2026-10-07-how-many-sightings-of-the-gone/data/"
R = json.load(open(D + "records.json")); SP = R["species"]; rec = R["records"]
res = {"fetched": R["fetched"], "gbif_counts": R["gbif_counts"], "n_records": len(rec)}
def day(r): return (r["eventDate"] or "")[:10]
A = {}
tot_units = 0
for k, name in SP.items():
    rs = [r for r in rec if str(r["speciesKey"]) == k]
    obs = collections.Counter(r["recordedBy"] for r in rs if r["recordedBy"])
    no_obs = sum(1 for r in rs if not r["recordedBy"])
    # units over records with an observer string; those without are counted one per record (no merging)
    units = {(r["recordedBy"], day(r)) for r in rs if r["recordedBy"]}
    u = len(units) + no_obs
    tot_units += u
    top10 = sum(c for _, c in obs.most_common(10))
    top1 = obs.most_common(1)[0] if obs else None
    ds = collections.Counter(r["datasetKey"] for r in rs)
    grid = {(round(r["decimalLatitude"], 2), round(r["decimalLongitude"], 2)) for r in rs if r["decimalLatitude"] is not None}
    A[name] = {"records": len(rs), "distinct_observers": len(obs), "records_no_observer": no_obs,
               "share_no_observer": round(no_obs / len(rs), 4), "units": u, "units_share": round(u / len(rs), 4),
               "top10_observers_records": top10, "top10_share_of_observed": round(top10 / max(1, len(rs) - no_obs), 4),
               "top_observer_share_of_observed": round(top1[1] / max(1, len(rs) - no_obs), 4) if top1 else None,
               "datasets": len(ds), "top_dataset_share": round(ds.most_common(1)[0][1] / len(rs), 4),
               "distinct_cells_0.01deg": len(grid), "records_with_coords": sum(1 for r in rs if r["decimalLatitude"] is not None),
               "dated_records": sum(1 for r in rs if day(r)), "distinct_days": len({day(r) for r in rs if day(r)})}
res["A"] = A; res["A_total_units"] = tot_units; res["A_total_share"] = round(tot_units / len(rec), 4)
res["A_predictions"] = {
  "A1_units_under_50pct_of_records": res["A_total_share"] < 0.5,
  "A2_top10_ge_50pct_in_at_least_3_species": sum(1 for v in A.values() if v["top10_share_of_observed"] >= 0.5) >= 3,
  "A3_perameles_fewest_observers": min(A, key=lambda n: A[n]["distinct_observers"]) == "Perameles fasciata",
  "A4_some_species_no_observer_ge_5pct": any(v["share_no_observer"] >= 0.05 for v in A.values())}
# B: tortoise records with media
tort = [r for r in rec if str(r["speciesKey"]) == "9527499" and r["nmedia"] > 0]
OPEN = ("http://creativecommons.org/publicdomain/zero/1.0/", "http://creativecommons.org/licenses/by/4.0/")
def cls(r): return "licensed" if r["media_licenses"] and all(l in OPEN for l in r["media_licenses"]) else "other"
lic = [r for r in tort if cls(r) == "licensed"]; oth = [r for r in tort if cls(r) == "other"]
B = {"tortoise_with_media": len(tort), "licensed": len(lic), "other": len(oth),
     "by_license": collections.Counter(r["license"] for r in tort)}
ol = {r["recordedBy"] for r in lic if r["recordedBy"]}; oo = {r["recordedBy"] for r in oth if r["recordedBy"]}
SC = json.load(open(D + "studio-census-2026-10-06.json"))
sk = {x["key"] for x in SC["rows"]}; lk = {r["key"] for r in lic}
B["studio_census_keys"] = len(sk); B["studio_keys_in_todays_licensed"] = len(sk & lk); B["todays_licensed_not_in_studio_census"] = len(lk - sk)
B["record_level_licence_of_licensed_media"] = collections.Counter(r["license"] for r in lic)
B["record_licence_noncommercial_but_media_open"] = sum(1 for r in lic if r["license"] and "by-nc" in r["license"])
B["observers_licensed"] = len(ol); B["observers_other"] = len(oo); B["observers_both"] = len(ol & oo)
B["licensed_records_from_observers_who_also_hold_other"] = sum(1 for r in lic if r["recordedBy"] in oo)
B["licensed_records_no_observer"] = sum(1 for r in lic if not r["recordedBy"])
B["other_records_no_observer"] = sum(1 for r in oth if not r["recordedBy"])
# permutation: shuffle licence class across observers (observer-level), keep record counts per observer;
# statistic = distinct observers among records assigned licensed, with the licensed count fixed by record draws
rng = random.Random(20261007)
labels = [r["recordedBy"] or ("__none__%d" % i) for i, r in enumerate(tort)]
n_l = len(lic); real = len({labels[i] for i, r in enumerate(tort) if cls(r) == "licensed"})
sims = []
for _ in range(10000):
    idx = rng.sample(range(len(tort)), n_l)
    sims.append(len({labels[i] for i in idx}))
sims.sort()
B["B1_distinct_observers_licensed_real"] = real
B["B1_null_distinct_observers_median"] = sims[len(sims) // 2]
B["B1_null_95_central"] = [sims[249], sims[9749]]
B["B1_outside_central_95"] = real < sims[249] or real > sims[9749]
B["B1_share_below_real"] = sum(1 for s in sims if s <= real) / len(sims)
# B2: year chi-square (own implementation; p via Wilson-Hilferty-free permutation)
def yb(r): return r["year"]
years = sorted({r["year"] for r in tort if r["year"]})
def chi(a, b):
    ca = collections.Counter(r["year"] for r in a); cb = collections.Counter(r["year"] for r in b); s = 0
    na, nb = sum(ca.values()), sum(cb.values())
    for y in years:
        t = ca[y] + cb[y]
        if t == 0: continue
        ea, eb = t * na / (na + nb), t * nb / (na + nb)
        s += (ca[y] - ea) ** 2 / ea + (cb[y] - eb) ** 2 / eb
    return s
real_chi = chi(lic, oth); ge = 0; allr = lic + oth
for _ in range(10000):
    rng.shuffle(allr); ge += chi(allr[:n_l], allr[n_l:]) >= real_chi
B["B2_chi2"] = round(real_chi, 2); B["B2_perm_p"] = (ge + 1) / 10001
B["year_counts_licensed"] = dict(sorted(collections.Counter(r["year"] for r in lic).items()))
B["year_counts_other"] = dict(sorted(collections.Counter(r["year"] for r in oth).items()))
B["share_by_year_licensed"] = {y: round(sum(1 for r in lic if r["year"] == y) / max(1, sum(1 for r in tort if r["year"] == y)), 3) for y in years}
# top observers in each class
B["top5_observers_licensed"] = collections.Counter(r["recordedBy"] for r in lic).most_common(5)
B["top5_observers_other"] = collections.Counter(r["recordedBy"] for r in oth).most_common(5)
B["datasets_licensed"] = collections.Counter(r["datasetKey"] for r in lic).most_common(3)
B["datasets_other"] = collections.Counter(r["datasetKey"] for r in oth).most_common(3)
res["B"] = B
json.dump(res, open(D + "results.json", "w"), indent=1, ensure_ascii=False, default=list)
print(json.dumps(res, indent=1, ensure_ascii=False, default=list))

# ---- extras: unit variants (mirrored in the page; check.py compares them) and the dataset facts
def units(rs, variant, merge):
    s = set(); n = 0
    for i, r in enumerate(rs):
        o = r["recordedBy"]; d = day(r); c = (round(r["decimalLatitude"], 2), round(r["decimalLongitude"], 2)) if r["decimalLatitude"] is not None else None
        if variant == "record": n += 1; continue
        if not o and not merge: n += 1; continue
        oo = o if o else "ds:" + r["datasetKey"]
        if variant == "observer-day": s.add((oo, d))
        elif variant == "observer-day-cell": s.add((oo, d, c))
        elif variant == "observer-year": s.add((oo, r["year"]))
        elif variant == "cell-day": s.add((c, d))
    return n + len(s)
V = {}
for k, name in SP.items():
    rs = [r for r in rec if str(r["speciesKey"]) == k]
    V[name] = {v + ("|merge" if m else ""): units(rs, v, m) for v in ("record", "observer-day", "observer-day-cell", "observer-year", "cell-day") for m in (False, True)}
res["unit_variants"] = V
dsj = json.load(open(D + "datasets.json")); res["datasets"] = dsj
usgs = [r for r in rec if r["datasetKey"] == "721a99a4-71f4-4466-b346-83c367889238"]
res["usgs_banding"] = {"records": len(usgs), "years": dict(sorted(collections.Counter(r["year"] for r in usgs).items())),
                       "with_coords": sum(1 for r in usgs if r["decimalLatitude"] is not None), "with_observer": sum(1 for r in usgs if r["recordedBy"])}
json.dump(res, open(D + "results.json", "w"), indent=1, ensure_ascii=False, default=list)
print(json.dumps({"unit_variants": V, "usgs": res["usgs_banding"]}, indent=1))
