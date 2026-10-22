"""Study 38: checks by a second code path. Storm Events read with gzip + csv (no pandas); the office page read
as bytes; the NB2 likelihood written out by hand and maximised with scipy (no statsmodels).
Usage: python3 -I check38.py <dir with StormEvents_details-*.csv.gz> <saved copy of the office page>"""
import csv, gzip, glob, hashlib, html, json, math, re, sys, pathlib
import numpy as np
from scipy.optimize import minimize
from scipy.special import gammaln
HERE = pathlib.Path(__file__).resolve().parent
R = json.loads((HERE / "data/results38.json").read_text())
SRC = json.loads((HERE / "data/sources38.json").read_text())
DECLARED = 14
ran = 0
def ok(name, cond):
    global ran; ran += 1
    print(("PASS " if cond else "FAIL ") + name)
    return cond
res = []

# 1. every Storm Events file is the one the manifest names
files = sorted(glob.glob(sys.argv[1] + "/StormEvents_details-*.csv.gz"))
digests = {pathlib.Path(f).name: hashlib.sha256(open(f, "rb").read()).hexdigest() for f in files}
res.append(ok("eight Storm Events files, each matching its manifest digest",
              len(files) == 8 and all(digests.get(x["file"]) == x["sha256"] for x in SRC["storm_events"]["files"])))
ev = {}
want = {x["event_id"] for x in R["records"]} | {617674}
csv.field_size_limit(10 ** 7)
for f in files:
    with gzip.open(f, "rt", encoding="latin-1") as fh:
        for row in csv.DictReader(fh):
            if row["EVENT_TYPE"] == "Tornado" and int(row["EVENT_ID"]) in want: ev[int(row["EVENT_ID"])] = row
res.append(ok("all eleven matched events and the Assumption segment found", want <= set(ev)))
res.append(ok("each matched event's direct + indirect injured equals the SPC count",
              all(int(ev[x["event_id"]]["INJURIES_DIRECT"]) + int(ev[x["event_id"]]["INJURIES_INDIRECT"]) == x["spc"]["inj"] for x in R["records"])))
res.append(ok("McLoud (315890): Storm Events says 32 injured and its narrative never uses the word",
              ev[315890]["INJURIES_DIRECT"] == "32" and "injur" not in ev[315890]["EVENT_NARRATIVE"].lower()))
la = ev[613449]["EVENT_NARRATIVE"]
res.append(ok("Louisiana (613449): narrative says it moved out of Assumption Parish; Assumption segment is EF3, 7.78 mi",
              "moved out of Assumption Parish into St James Parish" in la and ev[617674]["TOR_F_SCALE"] == "EF3"
              and float(ev[617674]["TOR_LENGTH"]) == 7.78))
res.append(ok("P2 recount by regex over the raw narratives agrees",
              sum(bool(re.search("injur", ev[x["event_id"]]["EVENT_NARRATIVE"], re.I)) for x in R["records"]) == R["predictions"]["P2"]["count"]))

# 2. the office's page, as saved
page = open(sys.argv[2], "rb").read()
res.append(ok("office page matches its manifest digest", hashlib.sha256(page).hexdigest() == SRC["oun_page"]["sha256"]))
text = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", page.decode("utf-8", "replace"))))
res.append(ok("office page's table row: D3, EF2, 0 killed, 1 injured, Pottawatomie",
              "D3 05/24/2011 1736-1739 2 50 EF2 0 1 Pottawatomie" in text))
res.append(ok("office page's narrative names one injured person", "and injuring the truck driver" in text))

# 3. the refits, by hand
rows = [r for r in csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t")]
def cat(r):
    if int(r["warnings_county_1y"]) == 0: return "none"
    if int(r["run_county"]) == 0: return "hit"
    return "run12" if int(r["run_county"]) <= 2 else "run3"
def xrow(r):
    ef = min(4, max(0, int(r["mag"]))); yr = int(r["yr"]); c = cat(r)
    reg = "South" if r["region"] == "other" else r["region"]
    return [1.0, c == "none", c == "run12", c == "run3", ef == 1, ef == 2, ef == 3, ef == 4,
            math.log(float(r["len_mi"]) + 0.01), math.log(float(r["wid_yd"])), float(r["night"] in ("1", "1.0", "True")),
            2012 <= yr <= 2016, yr >= 2017, reg == "Northeast", reg == "Midwest", reg == "West",
            math.log(float(r["density"])), math.log(float(r["exposure"]) + 1)]
def nll(p, X, Y):
    b, a = p[:-1], math.exp(p[-1]); mu = np.exp(X @ b); r = 1 / a
    return -np.sum(gammaln(Y + r) - gammaln(r) - gammaln(Y + 1) + r * np.log(r / (r + mu)) + Y * np.log(mu / (r + mu)))
def irr(rs):
    rs = [r for r in rs if r["warned"] == "1"]
    X = np.array([xrow(r) for r in rs], float); Y = np.array([float(r["inj"]) for r in rs])
    p0 = np.zeros(X.shape[1] + 1); p0[0] = math.log(Y.mean())
    s = minimize(nll, p0, args=(X, Y), method="BFGS", options={"maxiter": 20000, "gtol": 1e-7})
    return math.exp(s.x[3]), len(rs)
def key(r): return (int(r["om"]), r["start_utc"][:10])
MC, LA, AS = (315890, "2011-05-24"), (613559, "2016-02-23"), (613558, "2016-02-23")
def corrected(mcloud, louisiana):
    out = []
    for r in rows:
        r = dict(r)
        if mcloud and key(r) == MC: r["inj"] = "1"
        if louisiana and key(r) == AS: continue
        if louisiana and key(r) == LA: r["mag"], r["len_mi"] = "3", str(12.95 + 7.78)
        out.append(r)
    return out
for name, mc, lo in (("mcloud_1_injured", True, False), ("louisiana_one_track", False, True), ("both", True, True)):
    v, n = irr(corrected(mc, lo))
    res.append(ok(f"hand NB2: {name} ratio within 0.003 of {R['fits'][name]['irr']} ({v:.3f}, n {n})",
                  abs(v - R["fits"][name]["irr"]) < 0.003 and n == R["fits"][name]["n"]))
v, _ = irr([r for r in rows if key(r) != MC])
res.append(ok(f"hand NB2: step 5 (without McLoud) within 0.003 of {R['fits']['step5_without_flagged']['irr']} ({v:.3f})",
              abs(v - R["fits"]["step5_without_flagged"]["irr"]) < 0.003))
res.append(ok("every reported interval holds both 1.04 and 1.46",
              all(f["lo"] <= 1.04 and f["hi"] >= 1.46 for k, f in R["fits"].items() if k != "mu_full")))
print(f"{ran} run, {DECLARED} declared, {res.count(False)} failed")
sys.exit(0 if ran == DECLARED and all(res) else 1)
