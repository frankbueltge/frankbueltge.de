"""Study 34, second code path: recompute from the raw files, without build34.py or analyse34.py.
Usage: python3 -I check34.py <dir holding t2016..t2023/wwa_*.csv> <Gaz_counties_national.txt> <plate4.json>
Counties are matched by FIPS through the gazetteer's own state column; rows are grouped by product id."""
import csv, sys, json, pathlib, glob, collections
HERE = pathlib.Path(__file__).resolve().parent
iem, gaz, plate4 = sys.argv[1:4]
R = json.load(open(HERE / "data/results34.json"))
n_pass = n_fail = 0
def ok(name, c):
    global n_pass, n_fail
    n_pass += bool(c); n_fail += not c; print(("PASS " if c else "FAIL ") + name)
close = lambda a, b, tol=1e-9: abs(a - b) <= tol * max(1, abs(a), abs(b))

offices = set()
with open(HERE / "data/tornadoes33.tsv") as f:
    next(f)
    for line in f: offices.add(line.split("\t")[3])
ok("72 offices", len(offices) == 72)

fips = {}
for line in open(gaz, encoding="latin-1").read().splitlines()[1:]:
    c = line.split("\t")
    fips[c[0].strip() + "C" + c[1].strip()[2:]] = (int(c[4]), int(c[6]) / 1e6)

polys, cnty = [], collections.defaultdict(set)
for p in sorted(glob.glob(iem + "/t20*/wwa_*.csv")):
    for r in csv.DictReader(open(p)):
        if r["PHENOM"] != "TO" or r["SIG"] != "W" or r["WFO"] not in offices: continue
        k = (r["WFO"], r["VTEC_YEAR"], r["ETN"])
        if r["GTYPE"] == "C": cnty[k].add(r["NWS_UGC"])
        if r["GTYPE"] == "P" and r["STATUS"] == "NEW": polys.append((k, r))
ok(f"{len(polys)} warnings, as results34", len(polys) == R["n_warnings"])
ppl = []
hrs = 0.0
for k, r in polys:
    cs = [fips[u] for u in cnty[k] if u in fips]
    d = sum(a for a, _ in cs) / sum(b for _, b in cs)
    n = round(float(r["AREA_KM2"]) * d); ppl.append(n)
    h0, h1 = r["INIT_ISS"], r["INIT_EXP"]
    mins = (int(h1[8:10]) - int(h0[8:10])) * 1440 + (int(h1[11:13]) - int(h0[11:13])) * 60 + int(h1[14:16]) - int(h0[14:16])
    if mins < 0:  # month boundary
        import datetime as dt
        mins = (dt.datetime.fromisoformat(h1) - dt.datetime.fromisoformat(h0)).total_seconds() / 60
    hrs += n * mins / 60
ppl.sort()
ok("median people", ppl[len(ppl) // 2] == R["people"]["median"] or (ppl[len(ppl)//2 - 1] + ppl[len(ppl)//2]) / 2 == R["people"]["median"])
ok("sum of people", sum(ppl) == R["page"]["sum_people"])
ok("person-hours, whole duration", abs(hrs - R["page"]["sum_person_hours_whole"]) < 1)

D = I = n = 0
for t in csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t"):
    if t["warned"] == "1" and t["office"] in offices and t["yr"] in {str(y) for y in range(2016, 2024)}:
        D += int(t["fat"]); I += int(t["inj"]); n += 1
ok(f"warned tornadoes {n}, deaths {D}, injuries {I}", (n, D, I) == (R["tornadoes_warned"], R["deaths"], R["injuries"]))

cl = json.load(open(plate4))["classes"]
tot = sum(c["n"] for c in cl.values())
Pl = (tot - sum(c["empty_later"] for c in cl.values())) / tot
Ph = (tot - sum(c["empty_hour"] for c in cl.values())) / tot
ok("P met, both records", close(Pl, R["P_met"]["later"]) and close(Ph, R["P_met"]["hour"]))

# r by hand at the central values: B per warning over averted loss per met warning
B = sum(ppl) * 0.25 * 15
L_met = 0.5 * 9.1e6 * (D + 0.047 * I) / (Pl * len(ppl))
r = (B / len(ppl)) / L_met
ok(f"r central, later record {r:.4f}", close(r, R["r_central"]["later"]))
ok("Hand's test is B_total < e·V: r < P exactly when it holds", (r < Pl) == (B < 0.5 * 9.1e6 * (D + 0.047 * I)))
be = 0.2966545747682386 / r * 15
ok(f"break-even hour value at the later band edge ${be:.2f}", close(be, R["breakeven_hour_value"]["later@0.297"]))
ok("r is linear in the hour's value: sweep v ends are r/3 and r*10/3", close(R["sweep_later"]["v"][0], r / 3) and close(R["sweep_later"]["v"][1], r * 10 / 3))
ok("r is inverse in e", close(R["sweep_later"]["e"][0], r * 5) and close(R["sweep_later"]["e"][1], r / 2))
ok("deaths' share of V", close(D / (D + 0.047 * I), R["deaths_share_V"]))
ok("five predictions recorded, three held", sum(R["predictions"].values()) == 3 and len(R["predictions"]) == 5)
print(f"{n_pass} of {n_pass + n_fail} passed"); sys.exit(1 if n_fail else 0)
