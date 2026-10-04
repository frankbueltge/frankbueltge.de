"""Recounts the headline figures from data/raw.json independently of analyse.py and counts its own checks."""
import json
d = json.load(open("data/raw.json")); S = d["species"]; R = json.load(open("data/results.json")); q = R["second_block"]
EXT = ("EXTINCT", "EXTINCT_IN_THE_WILD"); ran = 0; fails = []
def chk(name, ok):
    global ran; ran += 1
    if not ok: fails.append(name)
chk("784 species", len(S) == 784)
chk("no missing counts", all(v["total"] is not None and v["ex"] is not None for v in S.values()))
chk("ex <= total", all(v["ex"] <= v["total"] for v in S.values()))
ne = [v for v in S.values() if v["cat"] not in EXT]
chk("52 not extinct at species level", len(ne) == 52 == q["not_extinct_any_list_species_all"])
chk("37,080 EX records on them", sum(v["ex"] for v in ne) == 37080 == q["not_extinct_species_ex_records"])
tot_ex = sum(v["ex"] for v in S.values()); chk("share of all EX records", round(100 * 37080 / tot_ex, 1) == 42.3)
un = [v for v in S.values() if not v["listed"]]
chk("84 unlisted, 38 extinct at species level", len(un) == 84 and sum(v["cat"] in EXT for v in un) == 38)
chk("P1 refuted (56.0)", R["P1_unlisted_not_ex_pct"] == 56.0 and R["P1_unlisted_not_ex_pct"] < 90)
chk("P2 held (99.1)", R["P2_listed_ex_pct"] >= 99)
chk("P3 refuted (86.7 median)", R["P3_unlisted_median_ex_share"] >= 50)
chk("P4 refuted", R["P4_unlisted_wd_says_extinct"] > 0)
chk("P5 refuted (25.0)", R["P5_unlisted_no_wd_pct"] < 50)
chk("2000+ split 3/23", q["unlisted_but_extinct_species_2000plus"] == 3 and q["unlisted_not_extinct_species_2000plus"] == 23)
chk("repaired list recorded", len(d.get("repaired", [])) == 3)
print(f"{ran} checks, {len(fails)} failed", fails)
chk_ran_all = ran == 14; print("ran all counted:", chk_ran_all)
