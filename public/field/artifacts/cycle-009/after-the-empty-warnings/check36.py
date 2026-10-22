"""Study 36: checks by a second code path (csv module and plain arithmetic, no pandas, no model).
Usage: python3 -I check36.py <studio record.js @c746704>"""
import csv, json, sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results36.json").read_text())
R5 = json.loads((HERE / "data/results35.json").read_text())
rows = [r for r in csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t") if r["warned"] == "1"]
DECLARED = 12
ran = 0
def ok(name, cond):
    global ran; ran += 1
    print(("PASS " if cond else "FAIL ") + name)
    return cond
def cat(r):
    if int(r["warnings_county_1y"]) == 0: return "none"
    if int(r["run_county"]) == 0: return "hit"
    return "run12" if int(r["run_county"]) <= 2 else "run3"
by = {r["om"]: r for r in rows}
res = []
res.append(ok("9,295 warned rows", len(rows) == 9295 == R["n_warned"]))
res.append(ok("Joplin (296616) is run 3+, 1,150 injured, 158 dead", cat(by["296616"]) == "run3" and by["296616"]["inj"] == "1150" and by["296616"]["fat"] == "158"))
res.append(ok("Tuscaloosa (314625) is after a hit, 1,500 injured", cat(by["314625"]) == "hit" and by["314625"]["inj"] == "1500"))
inj3 = sum(int(r["inj"]) for r in rows if cat(r) == "run3"); injh = sum(int(r["inj"]) for r in rows if cat(r) == "hit")
res.append(ok("run 3+ injured 2,031 and hit injured 2,562", inj3 == 2031 and injh == 2562))
res.append(ok("refit with all rows equals study 35's run 3+ fits", all(R["sets"]["all"][y][k] == R5["fits"][y]["run3"][k] for y in ("inj", "fat") for k in ("irr", "lo", "hi"))))
top = sorted(rows, key=lambda r: -int(r["inj"]))[:30]
res.append(ok("the 30 left out are the 30 most injurious", sorted(int(r["om"]) for r in top) == sorted(x["om"] for x in R["loo"])))
res.append(ok("every fit converged", all(R["sets"][k][y]["converged"] for k in R["sets"] for y in ("inj", "fat")) and all(x[f]["converged"] for x in R["loo"] for f in ("inj_run3", "fat_run3"))))
pts = [x["inj_run3"]["irr"] for x in R["loo"]]
res.append(ok("leave-one-out injured range 1.173-1.302", (min(pts), max(pts)) == (1.173, 1.302)))
res.append(ok("Joplin's leave-out equals the without_joplin set", [x for x in R["loo"] if x["om"] == 296616][0]["inj_run3"] == R["sets"]["without_joplin"]["inj"]))
rec = json.loads(pathlib.Path(sys.argv[1]).read_text().strip()[len("window.TCA_RECORD="):].rstrip(";"))
keep = [d for d in rec["dead"] if d[1] != 158]
a = sum(d[1] for d in keep if d[4] >= 3) / sum(d[1] for d in keep)
w = sum(d[1] for d in keep if d[4] >= 3) / sum(d[1] for d in keep if d[4] >= 0)
res.append(ok("Studio share without Joplin, all dead and warned dead", round(a, 4) == R["studio"]["share_all_dead"] and round(w, 4) == R["studio"]["share_warned_dead"] and len(keep) == 339))
inside = lambda f, v: f["lo"] <= v <= f["hi"]
S = R["sets"]
pred = [S["without_joplin"]["inj"]["irr"] < 1.214 and inside(S["without_joplin"]["inj"], 1.04) and inside(S["without_joplin"]["inj"], 1.46),
        inside(S["without_both"]["inj"], 1.04) and inside(S["without_both"]["inj"], 1.46),
        S["all"]["fat"]["irr"] - S["without_joplin"]["fat"]["irr"] > 0.10 and inside(S["without_joplin"]["fat"], 1.0),
        all(0.802 <= p <= 1.837 for p in pts),
        abs(a - 0.3159) <= 0.005 and R["studio"]["boot95_all"][0] <= 0.31 <= R["studio"]["boot95_all"][1]]
res.append(ok("verdicts P1-P5 recomputed agree", pred == [R["predictions"][f"P{i}"]["held"] for i in range(1, 6)]))
d36 = (HERE / "data-36.js").read_text(); D = json.loads(d36[d36.index("{"):d36.rindex("}") + 1])
res.append(ok("data-36.js carries the results' sets and 30 tornadoes", D["sets"] == R["sets"] and len(D["loo"]) == 30))
print(f"{ran} run, {DECLARED} declared, {res.count(False)} failed")
sys.exit(0 if ran == DECLARED and all(res) else 1)
