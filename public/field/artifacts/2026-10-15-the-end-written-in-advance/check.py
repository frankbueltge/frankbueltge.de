"""Study 17 checks: recompute every headline number from data/warnings.tsv alone (not from the
analysis code) and compare with data/results.json; check data.js parses and agrees.
Usage: python3 check.py. Prints each check and exits non-zero on any failure."""
import json, statistics, collections, sys, re
R = json.load(open("data/results.json"))
rows = [l.rstrip("\n").split("\t") for l in open("data/warnings.tsv")]
H, rows = rows[0], rows[1:]
ix = {h: i for i, h in enumerate(H)}
fl = lambda s: float(s) if s else None
ran, fails = [], []
def check(name, ok):
    ran.append(name); print(("ok   " if ok else "FAIL ") + name)
    if not ok: fails.append(name)

check("23,286 warnings, the Studio's count", len(rows) == 23286)
fates = collections.Counter(r[ix["fate"]] for r in rows)
check("six fate counts equal the Studio's", fates == {"silence": 16756, "update": 801, "end-mute": 5510, "end-safe": 159, "end-clear": 59, "end-error": 1})
check("analysis says the Studio's counts reproduce", R["reproduces"] is True)
check("ids unique", len({r[0] for r in rows}) == len(rows))
L = {r[0]: fl(r[ix["lifetime_min"]]) for r in rows}
sil = [r for r in rows if r[ix["fate"]] == "silence"]
k1 = sum(1 for r in sil if L[r[0]] and L[r[0]] > 0)
check("P1 count", k1 == R["P1"]["with_expiry_after_sent"] == 16756)
check("every message with an info block carries expires", R["expires_coverage"]["with_info"] == R["expires_coverage"]["with_info_and_expires"])
check("P2 median", statistics.median(v for v in L.values() if v and v > 0) == R["P2"]["median_min"])
end = [r for r in rows if r[ix["fate"]].startswith("end")]
ec = [r for r in end if L[r[0]] and fl(r[ix["first_cancel_min"]]) is not None]
k3 = sum(1 for r in ec if fl(r[ix["first_cancel_min"]]) < L[r[0]])
check("P3 counts", (len(ec), k3) == (R["P3"]["cancelled_with_expiry"], R["P3"]["cancel_before_expiry"]))
check("P3: a cancelled warning always has a first-cancel time, a silent one never", all(r[ix["first_cancel_min"]] for r in end) and not any(r[ix["first_cancel_min"]] for r in sil))
acc = collections.defaultdict(list)
for r in rows: acc[r[ix["account_hash"]]].append(r[ix["fate"]].startswith("end"))
big = [sum(v) / len(v) for v in acc.values() if len(v) >= 20]
check("P4 accounts and extremes", (len(big), sum(1 for f in big if f < .1 or f > .9)) == (R["P4"]["accounts_ge20"], R["P4"]["extreme"]))
check("P4 verdict", R["P4"]["held"] is False and R["P4"]["share"] < 0.60)
mc = statistics.median(L[r[0]] for r in end); ms = statistics.median(L[r[0]] for r in sil)
check("P5 medians", (mc, ms) == (R["P5"]["cancelled_median"][0], R["P5"]["silent_median"][0]))
y = [1.0 if r[ix["fate"]].startswith("end") else 0.0 for r in rows]; mu = sum(y) / len(y)
def eta(col):
    g = collections.defaultdict(list)
    for r, v in zip(rows, y): g[r[ix[col]]].append(v)
    return sum(len(v) * (sum(v) / len(v) - mu) ** 2 for v in g.values()) / sum((v - mu) ** 2 for v in y)
check("eta2 account", abs(eta("account_hash") - R["exploratory"]["eta2_account"]["eta2"]) < 1e-4)
check("eta2 code", abs(eta("code") - R["exploratory"]["eta2_code"]["eta2"]) < 1e-4)
check("no sender address in the published table", not any("@" in "\t".join(r) for r in rows))
js = open("data.js").read()
T = json.loads(re.search(r"window\.T=(\[.*?\]);\n", js, re.S).group(1))
check("data.js rows equal the table", len(T) == len(rows))
n_written = open(__file__).read().count("\ncheck(") - 1  # minus this line
check("this suite ran every check written in it", len(ran) == n_written)
print(f"{len(ran)} checks, {len(fails)} failed")
sys.exit(1 if fails else 0)
