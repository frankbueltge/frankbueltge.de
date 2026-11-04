"""Study 27, part B: the fire class audited (PREREGISTRATION-27.md).

Applies a fixed not-a-vegetation-fire rule to study 24's undeclared covered warnings whose first
class is fire, then recomputes study 24's met and placebo rates on the remainder from
../s24/data/met_24.tsv.gz (no new fetch). With --sample it only prints the 60 messages of the hand
reading (seed 27) with no outcome; with --hand FILE it scores the hand reading after it is written.

Usage: python3 -I audit_27.py STUDIO_DATA_JS [--sample | --hand data/hand_27.tsv]
"""
import json, sys, re, gzip, csv, random, hashlib
from pathlib import Path

HERE = Path(__file__).parent
raw = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(raw).hexdigest() == "3c6c369c5c57790b58b1ef8b3ec5be5718676b231c055fa363ae56e2107849ef"
s = raw.decode()
CARDS = json.loads(s[s.index("window.CARDS=") + 13:].strip().rstrip(";"))
M = list(csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "met_24.tsv.gz", "rt"), delimiter="\t"))
FIRE = [r for r in M if r["group"] == "undeclared" and r["primary"] == "fire"]
assert len(FIRE) == 1990

TELECOM = re.compile(r"(\b(911|9-1-1)\b|phone|landline).{0,80}\b(outages?|interruptions?|impacts?|issues?|down|unable|not able)\b"
                     r"|\b(outages?|interruptions?|unable|not able)\b.{0,80}(\b(911|9-1-1)\b|phone|landline)")
VEG = re.compile(r"wild ?fires?|brush ?fires?|grass ?fires?|forest ?fires?|evacuat")
OTHER = re.compile(r"\b(vehicle|car|truck|house|home|structure|building|recycling|apartment|commercial|industrial|chemical|warehouse|plant) fires?\b")

def not_veg(w):
    w = w.lower()
    if TELECOM.search(w) and not VEG.search(w):
        return "telecom"
    if OTHER.search(w):
        return "other_fire"
    return ""

def rate(rows):
    n = len(rows)
    return {"n": n, "met": sum(int(r["met"]) for r in rows), "placebo": sum(int(r["placebo"]) for r in rows),
            "met_rate": sum(int(r["met"]) for r in rows) / n, "placebo_rate": sum(int(r["placebo"]) for r in rows) / n}

if "--sample" in sys.argv:
    for r in random.Random(27).sample(FIRE, 60):
        print(r["i"], "|", CARDS[int(r["i"])]["w"][:300].replace("\n", " "))
    sys.exit()

flag = {r["i"]: not_veg(CARDS[int(r["i"])]["w"]) for r in FIRE}
out_rows = [r for r in FIRE if flag[r["i"]]]
keep = [r for r in FIRE if not flag[r["i"]]]
res = {"fire_all": rate(FIRE), "removed": rate(out_rows), "remainder": rate(keep),
       "removed_by_kind": {k: sum(1 for v in flag.values() if v == k) for k in ("telecom", "other_fire")},
       "removed_ids": sorted(int(r["i"]) for r in out_rows)}
assert abs(res["fire_all"]["met_rate"] - 0.24874371859296482) < 1e-12
res["shift_points"] = 100 * (res["remainder"]["met_rate"] - res["fire_all"]["met_rate"])
res["removed_share"] = len(out_rows) / len(FIRE)
res["P4_held"] = 0.01 <= res["removed_share"] <= 0.10 and abs(res["shift_points"]) < 2
if "--hand" in sys.argv:
    H = list(csv.DictReader(open(sys.argv[sys.argv.index("--hand") + 1]), delimiter="\t"))
    assert len(H) == 60 and [h["i"] for h in H] == [r["i"] for r in random.Random(27).sample(FIRE, 60)]
    yes = sum(h["vegetation_fire"] == "1" for h in H)
    res["hand"] = {"n": 60, "vegetation_fire": yes, "share": yes / 60,
                   "rule_flags_among_hand_no": sum(1 for h in H if h["vegetation_fire"] == "0" and flag[h["i"]]),
                   "hand_no": sum(1 for h in H if h["vegetation_fire"] == "0"),
                   "rule_flags_among_hand_yes": sum(1 for h in H if h["vegetation_fire"] == "1" and flag[h["i"]]),
                   "met_among_hand_no": sum(1 for h in H if h["vegetation_fire"] == "0" and next(r for r in FIRE if r["i"] == h["i"])["met"] == "1")}
    byi = {r["i"]: r for r in FIRE}
    CL = {w["i"]: w["classes"] for w in csv.DictReader(gzip.open(HERE.parent / "s24" / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t")}
    kinds = sorted(set(h["kind"] for h in H))
    res["hand"]["by_kind"] = {k: {"n": sum(h["kind"] == k for h in H),
                                  "met": sum(h["kind"] == k and byi[h["i"]]["met"] == "1" for h in H),
                                  "placebo": sum(h["kind"] == k and byi[h["i"]]["placebo"] == "1" for h in H),
                                  "code_FRW": sum(h["kind"] == k and CARDS[int(h["i"])]["c"] == "FRW" for h in H),
                                  "also_flood_class": sum(h["kind"] == k and "flood" in CL[h["i"]].split(",") for h in H)} for k in kinds}
    res["P5_held"] = yes / 60 >= 0.85
    res["hand"]["vegetation_or_FRW_code"] = sum(h["vegetation_fire"] == "1" or CARDS[int(h["i"])]["c"] == "FRW" for h in H)
(HERE / "data" / "audit_27.json").write_text(json.dumps(res, indent=1))
print(json.dumps({k: v for k, v in res.items() if k != "removed_ids"}, indent=1))
