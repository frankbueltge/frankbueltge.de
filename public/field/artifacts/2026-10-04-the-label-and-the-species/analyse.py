"""Results from data/raw.json; every printed figure is written to data/results.json."""
import json, statistics as st, collections
d = json.load(open("data/raw.json")); S = d["species"]; W = d["wikidata"]
un = {k: v for k, v in S.items() if not v["listed"]}; li = {k: v for k, v in S.items() if v["listed"]}
errs = [k for k, v in S.items() if v["total"] is None or v["ex"] is None or v["cat"] not in
        ("EX","EW","CR","EN","VU","NT","LC","DD","NE","NOT_EVALUATED","DATA_DEFICIENT","LEAST_CONCERN","NEAR_THREATENED","VULNERABLE","ENDANGERED","CRITICALLY_ENDANGERED","EXTINCT","EXTINCT_IN_THE_WILD")]
r = {"n": len(S), "n_unlisted": len(un), "n_listed": len(li), "query_errors": len(errs), "error_sample": [S[k]["cat"] for k in errs[:5]]}
isex = lambda c: c in ("EX", "EXTINCT")
r["unlisted_cat"] = dict(collections.Counter(v["cat"] for v in un.values()).most_common())
r["listed_cat"] = dict(collections.Counter(v["cat"] for v in li.values()).most_common())
r["P1_unlisted_not_ex_pct"] = round(100 * sum(not isex(v["cat"]) for v in un.values()) / len(un), 1)
r["P2_listed_ex_pct"] = round(100 * sum(isex(v["cat"]) for v in li.values()) / len(li), 1)
sh = lambda v: 100 * v["ex"] / v["total"] if v["total"] else None
us = [sh(v) for v in un.values() if sh(v) is not None]; ls = [sh(v) for v in li.values() if sh(v) is not None]
r["P3_unlisted_median_ex_share"] = round(st.median(us), 1); r["listed_median_ex_share"] = round(st.median(ls), 1)
r["unlisted_share_100"] = sum(x >= 99.95 for x in us); r["unlisted_share_lt50"] = sum(x < 50 for x in us)
r["unlisted_ex_records"] = sum(v["ex"] for v in un.values()); r["unlisted_total_records"] = sum(v["total"] for v in un.values())
wu = {k: W.get(k) for k in un}
r["unlisted_with_wd_item"] = sum(v is not None for v in wu.values())
r["P5_unlisted_no_wd_pct"] = round(100 * (len(un) - r["unlisted_with_wd_item"]) / len(un), 1)
stat = {k: v["status"] for k, v in wu.items() if v and v["status"]}
r["unlisted_with_wd_status"] = len(stat); r["unlisted_wd_status"] = dict(collections.Counter(s for v in stat.values() for s in v))
r["P4_unlisted_wd_says_extinct"] = sum(any("extinct" in s.lower() for s in v) for v in stat.values())
wl = {k: W.get(k) for k in li}
r["listed_with_wd_status"] = sum(1 for v in wl.values() if v and v["status"])
r["listed_wd_status"] = dict(collections.Counter(s for v in wl.values() if v for s in v["status"]).most_common(6))
r["unlisted_names_sample"] = [(v["name"], v["cat"], v["ex"], v["total"]) for v in sorted(un.values(), key=lambda v: -v["ex"])[:12]]
json.dump(r, open("data/results.json", "w"), indent=1); print(json.dumps(r, indent=1))

# --- second block: re-read session 177's 2000+ figures by species-level category (no new queries)
R3 = json.load(open("../2026-10-03-after-the-last-seen/data/raw.json"))
c2 = {int(k): v for k, v in R3["sp_y2000"].items()}; tot2 = sum(c2.values())
true_ex = lambda k: isex(S[str(k)]["cat"]) or S[str(k)]["cat"] == "EXTINCT_IN_THE_WILD"
q = {"records_2000plus": tot2, "species_2000plus": len(c2)}
q["unlisted_2000plus_species"] = sum(1 for k in c2 if not S[str(k)]["listed"])
q["unlisted_2000plus_records_pct"] = round(100 * sum(v for k, v in c2.items() if not S[str(k)]["listed"]) / tot2, 1)
q["unlisted_but_extinct_species_2000plus"] = sum(1 for k in c2 if not S[str(k)]["listed"] and true_ex(k))
q["unlisted_not_extinct_species_2000plus"] = sum(1 for k in c2 if not S[str(k)]["listed"] and not true_ex(k))
q["species_not_extinct_at_species_level_2000plus_records_pct"] = round(100 * sum(v for k, v in c2.items() if not true_ex(k)) / tot2, 1)
q["not_extinct_any_list_species_all"] = sum(1 for v in S.values() if not (isex(v["cat"]) or v["cat"] == "EXTINCT_IN_THE_WILD"))
ne = {k: v for k, v in S.items() if not (isex(v["cat"]) or v["cat"] == "EXTINCT_IN_THE_WILD")}
q["not_extinct_species_ex_records"] = sum(v["ex"] for v in ne.values())
q["not_extinct_species_all_records"] = sum(v["total"] for v in ne.values())
q["not_extinct_wd_status"] = dict(collections.Counter(s for k in ne for s in (W.get(k) or {"status": []})["status"]))
top = sorted(((c2.get(int(k), 0), v["name"], v["cat"]) for k, v in ne.items()), reverse=True)[:5]
q["top5_not_extinct_by_2000plus_records"] = top
q["extinct_species_ex_share_of_2000plus_records_pct"] = round(100 * sum(v for k, v in c2.items() if true_ex(k)) / tot2, 1)
r["second_block"] = q
json.dump(r, open("data/results.json", "w"), indent=1); print(json.dumps(q, indent=1))
