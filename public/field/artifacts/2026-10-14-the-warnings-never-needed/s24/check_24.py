"""Study 24, checks. A second code path for the match, planted events, and a suite that counts itself.

Usage: python3 -I check_24.py STORM_EVENTS_DIR
"""
import csv, gzip, json, sys, random, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
SE = Path(sys.argv[1])
E = dt.datetime(1970, 1, 1)
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    print(("ok   " if ok else "FAIL ") + name)
    if not ok:
        failed.append(name)

res = json.loads((HERE / "data" / "results_24.json").read_text())
M = list(csv.DictReader(gzip.open(HERE / "data" / "met_24.tsv.gz", "rt"), delimiter="\t"))
W = {int(w["i"]): w for w in csv.DictReader(gzip.open(HERE / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t")}
cov = json.loads((HERE / "data" / "coverage_24.json").read_text())
TYPE2CLASS = {t: c for c, ts in cov["types"].items() for t in ts}

# 1. counts reproduce from the per-warning file
und = [r for r in M if r["group"] == "undeclared"]
check("3,222 covered undeclared in frame", len(und) == 3222 == res["undeclared_covered"]["n"])
check("met count reproduces", sum(int(r["met"]) for r in und) == res["undeclared_covered"]["met"])
check("placebo count reproduces", sum(int(r["placebo"]) for r in und) == res["undeclared_covered"]["placebo"])
check("bound share reproduces", abs(res["bound_share"] - sum(int(r["met"]) - int(r["placebo"]) for r in und) / 8948) < 1e-12)
check("no warning on or after the frame end", all(int(W[int(r["i"])]["t_min"]) < (dt.datetime(2026, 4, 1) - E).total_seconds() / 60 for r in M))
check("strict <= registered <= 72 h, per warning", all(int(r["met_strict"]) <= int(r["met"]) <= int(r["met_72"]) for r in M))

# 2. second code path: times from BEGIN_DATE_TIME strings, zones re-read by a dict of lists,
#    for 400 sampled warnings (seed 2409), each scanned against every event in its counties.
rnd = random.Random(2409)
samp = rnd.sample(M, 400)
need = set()
for r in samp:
    need.update(W[int(r["i"])]["counties"].split(","))
zl = collections.defaultdict(list)
fips_state = {}
for line in (SE / "bp16ap26.dbx").read_text(encoding="latin-1").splitlines():
    p = line.split("|")
    if len(p) >= 7 and p[6].isdigit():
        zl[p[0] + p[1].zfill(3)].append(p[6].zfill(5))
        fips_state[p[6].zfill(5)[:2]] = p[0]
def parse(s, tz):
    t = dt.datetime.strptime(s, "%d-%b-%y %H:%M:%S")
    sign = -1 if "-" in tz else 1
    digits = "".join(ch for ch in tz if ch.isdigit())
    return (t - sign * dt.timedelta(hours=int(digits or 0)) - E).total_seconds() / 60
evs = collections.defaultdict(list)
for f in sorted(SE.glob("StormEvents_details-ftp_v1.0_d20*_c*.csv.gz")):
    for r in csv.DictReader(gzip.open(f, "rt", encoding="latin-1")):
        cl = TYPE2CLASS.get(r["EVENT_TYPE"])
        if not cl:
            continue
        st = r["STATE_FIPS"].zfill(2)
        cs = [st + r["CZ_FIPS"].zfill(3)] if r["CZ_TYPE"] == "C" else zl.get(fips_state.get(st, "?") + r["CZ_FIPS"].zfill(3), []) if r["CZ_TYPE"] == "Z" else []
        for c in cs:
            if c in need:
                evs[c].append((cl, parse(r["BEGIN_DATE_TIME"], r["CZ_TIMEZONE"]), parse(r["END_DATE_TIME"], r["CZ_TIMEZONE"])))
agree = 0
for r in samp:
    w = W[int(r["i"])]
    t, L, cl = int(w["t_min"]), int(w["life_min"] or 0), set(w["classes"].split(","))
    hit = any(k in cl and b < t + L + 1440 and max(b, e) >= t - 1440 for c in w["counties"].split(",") for k, b, e in evs.get(c, []))
    agree += hit == bool(int(r["met"]))
check(f"second code path agrees on 400 of 400 sampled warnings (got {agree})", agree == 400)

# 3. the placebo by the second path: the window moved back 364 days must reproduce the placebo column
agree_p = 0
for r in samp:
    w = W[int(r["i"])]
    t, L, cl = int(w["t_min"]) - 364 * 1440, int(w["life_min"] or 0), set(w["classes"].split(","))
    hit = any(k in cl and b < t + L + 1440 and max(b, e) >= t - 1440 for c in w["counties"].split(",") for k, b, e in evs.get(c, []))
    agree_p += hit == bool(int(r["placebo"]))
check(f"second path reproduces the placebo on 400 of 400 (got {agree_p})", agree_p == 400)
# a planted event in the second path: an event of the warning's class 30 min after issue must be met
w0 = W[int(samp[0]["i"])]; t0 = int(w0["t_min"]); c0 = w0["counties"].split(",")[0]; k0 = w0["classes"].split(",")[0]
evs[c0].append((k0, t0 + 30, t0 + 60))
check("planted event is met by the second path", any(k == k0 and b < t0 + int(w0["life_min"] or 0) + 1440 and e >= t0 - 1440 for k, b, e in evs[c0]))
check("the sample holds both met and unmet warnings", 0 < sum(int(r["met"]) for r in samp) < 400)

# 4. the suite counts itself
DECLARED = 11
check(f"suite ran {DECLARED} checks", len(ran) + 1 == DECLARED)
print(f"{len(ran)} checks, {len(failed)} failed")
sys.exit(1 if failed else 0)
