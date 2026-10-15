"""Checks for study 9. Counts what it ran and fails if any check did not run.
Run: python3 -I check.py [path to the pinned Studio data.json]"""
import json, os, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, "data", "results.json")))
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)
K = ["PH", "CH", "FLI", "WP"]
ev = [e for e in R["events"] if e["checked"]]
check("34 checked events", len(ev) == 34 == R["primary"]["n_events"])
check("53 events in window", len(R["events"]) == 53)
check("no keeper set differs from the Studio's copy", R["inputs"]["keeper_sets_differing_from_studio_copy"] == [])
o = R["primary"]["omissions"]
check("omissions = 4 x 34 - listings", o["total"] == 4 * 34 - sum(len(e["keepers"]) for e in ev))
check("per-keeper omissions sum", sum(v["structural"] + v["chosen"] for v in o["by_keeper"].values()) == o["total"])
check("structural list matches count", len(R["structural_omissions"]) == o["structural"])
check("every structural omission dated after its list", all(int(s["nm_date"][:4]) > R["inputs"]["list_years"][s["keeper"]] for s in R["structural_omissions"]))
check("Wikipedia has no structural omission", o["by_keeper"]["WP"]["structural"] == 0)
check("no listing before its account", R["listed_before_account"] == [])
check("adjusted Dice >= raw in primary", R["primary"]["dice_adjusted"] >= R["primary"]["dice_unadjusted"])
check("gain inside its CI", R["primary"]["dice_gain_ci95"][0] <= R["primary"]["dice_gain"] <= R["primary"]["dice_gain_ci95"][1])
check("raw Dice inside its CI", R["primary"]["dice_unadjusted_ci95"][0] <= R["primary"]["dice_unadjusted"] <= R["primary"]["dice_unadjusted_ci95"][1])
check("rho inside its CI", R["spearman_nm_year_vs_keepers"]["ci95"][0] <= R["spearman_nm_year_vs_keepers"]["rho"] <= R["spearman_nm_year_vs_keepers"]["ci95"][1])
check("sensitivity same-year >= primary structural", R["sensitivity_same_year_unavailable"]["omissions"]["structural"] >= o["structural"])
check("five verdicts", sorted(R["predictions"]) == ["P1", "P2", "P3", "P4", "P5"])
# the disclosure extract reproduces from the pinned Studio file when present (not committed)
pinned = sys.argv[1] if len(sys.argv) > 1 else ""  # path to the pinned Studio data.json, optional
if pinned and os.path.exists(pinned):
    check("pinned Studio file hash", hashlib.sha256(open(pinned, "rb").read()).hexdigest() == "5bc292319221e9c320f596b441d35eeb7b69b5b8f4a1e88f0f1d637f5af01f21")
    S = {e["event"]: e for e in json.load(open(pinned))["events"]}
    check("extract matches pinned dates", all(((S[e["event"]].get("nm") or {}).get("date") or "") == e["nm_date"] for e in R["events"]))
    expected = 17
else:
    expected = 15
print(f"{len(ran)} checks ran (expected {expected}), {len(failed)} failed", failed)
sys.exit(0 if not failed and len(ran) == expected else 1)
