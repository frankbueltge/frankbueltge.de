"""Study 15 self-check. Counts the checks it runs and fails if any did not run or did not hold."""
import csv, json, math, pathlib
HERE = pathlib.Path(__file__).resolve().parent
rows = list(csv.DictReader(open(HERE / "data/beneath.tsv"), delimiter="\t"))
res = json.load(open(HERE / "data/results.json"))
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)

check("19,631 rows, as study 13", len(rows) == 19631)
cells = (sum(1 for r in rows if r["warning_registered" if "warning_registered" in r else "warned"] == "1" and int(r["fat"]) > 0),
         sum(1 for r in rows if r["warned"] == "1" and int(r["fat"]) == 0),
         sum(1 for r in rows if r["warned"] == "0" and int(r["fat"]) > 0),
         sum(1 for r in rows if r["warned"] == "0" and int(r["fat"]) == 0))
check("2x2 = 227 / 10,315 / 87 / 9,002", cells == (227, 10315, 87, 9002))
check("deaths = 1,347", sum(int(r["fat"]) for r in rows) == 1347)
check("deaths warned = 1,148", sum(int(r["fat"]) for r in rows if r["warned"] == "1") == 1148)
check("results.json agrees on the 2x2", (res["cells"]["warned_harm"], res["cells"]["unwarned_harm"]) == (227, 87))
dens = [r for r in rows if r["density"] != ""]
check("every analysed row has density > 0", all(float(r["density"]) > 0 for r in dens))
check("analysed = rows - no-density", res["n_analysed"] == len(dens) == 19631 - res["dropped_no_density"])
check("dropped rows hold no deaths", res["dropped_deaths"] == 0)
# a hand-recomputed exposure for the deadliest track (om 296616, MO, 2011): density x len x wid / 1760
j = next(r for r in rows if r["om"] == "296616" and r["yr"] == "2011")
check("exposure recomputes", abs(float(j["density"]) * float(j["len_mi"]) * float(j["wid_yd"]) / 1760 - float(j["exposure"])) < 0.01)
for k, f in res["fits"].items():
    check(f"{k} converged", f["converged"] is True or f["converged"] == "True")
    check(f"{k} estimates finite", all(math.isfinite(v["irr"]) and math.isfinite(v["lo"]) for v in f["coef"].values()))
    check(f"{k} n = analysed", f["n"] == res["n_analysed"])
check("six predictions scored", sorted(res["predictions"]) == ["P1", "P2", "P3", "P4", "P5", "P6"])
p = res["predictions"]
check("P4 recomputed", p["P4"]["held"] == (p["P4"]["value"]["lo"] <= 1 <= p["P4"]["value"]["hi"]))
check("P5 recomputed", p["P5"]["held"] == (p["P5"]["value"]["hi"] < 1))
check("post-hoc curve has k = 0..15", [r["k"] for r in res["post_hoc"]["curve"]] == list(range(16)))
check("curve k=0 equals M1 fits", res["post_hoc"]["curve"][0]["fat_nb"][0] == res["fits"]["M1_fat_nb"]["coef"]["warned"]["irr"])
check("data.js matches results.json", (HERE / "data.js").read_text().strip() == "window.RESULTS = " + json.dumps(res) + ";")
EXPECTED = 9 + 12 * 3 + 6 + 1  # first count wrote 5 for the six after the fits; the self-count caught it
check("ran the expected number of checks", len(ran) + 1 == EXPECTED)
print(f"{len(ran)} checks ran, {len(failed)} failed" + (": " + "; ".join(failed) if failed else ""))
raise SystemExit(1 if failed else 0)
