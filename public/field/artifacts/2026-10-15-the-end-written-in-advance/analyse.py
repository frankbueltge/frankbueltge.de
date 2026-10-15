"""Study 17. Usage: python3 analyse.py <raw cache dir> <scratch dir>
Rebuilds the Studio's warnings with its own rules (keepers_word_build.py), checks the counts
reproduce, then joins each warning's declared expiry and tests P1-P5 (PREREGISTRATION.md).
Writes data/results.json, data/warnings.tsv (one row per warning, sender hashed) and data.js."""
import json, os, sys, runpy, random, hashlib, statistics, collections, math, datetime as dt

RAW, SCR = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(SCR, exist_ok=True); os.chdir(SCR)
sys.argv = ["keepers_word_build.py", RAW]
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    G = runpy.run_path(os.path.join(HERE, "keepers_word_build.py"))
os.chdir(HERE)
W, byid, chain, summ = G["W"], G["byid"], G["chain"], G["summary"]

# --- reproduction of the Studio's counts (its summary inside data.js @ bead2d96) ---
STUDIO = {"messages": 82754, "warnings": 23286, "silence": 16756, "update": 801, "end-mute": 5510,
          "end-safe": 159, "end-clear": 59, "end-error": 1, "followups_linked": 8060}
mine = {"messages": summ["messages"], "warnings": len(W), **summ["fates"],
        "followups_linked": summ["followups_linked"]}
repro = {k: [STUDIO[k], mine.get(k)] for k in STUDIO}

def ts(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp() / 60.0

def expires(r):
    for i in r["info"] or []:
        if i.get("expires"):
            return i["expires"]
    return None

def wilson(k, n, z=1.959964):
    if n == 0: return [None, None]
    p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - h) / d, 4), round((c + h) / d, 4)]

rng = random.Random(17)
def med_ci(xs, B=2000):
    xs = list(xs); n = len(xs)
    bs = sorted(statistics.median(rng.choices(xs, k=n)) for _ in range(B))
    return [statistics.median(xs), bs[int(0.025 * B)], bs[int(0.975 * B) - 1]]

def hsh(s):
    return hashlib.sha256(("field-17:" + s).encode()).hexdigest()[:10]

T = []
for w in W:
    r = byid[w["id"]]
    s0 = ts(r["sent"]); e = expires(r)
    L = None if e is None else ts(e) - s0
    fu = sorted(chain(r["id"]), key=lambda x: x["sent"])
    canc = [f for f in fu if f["msgType"] == "Cancel"]
    c0 = ts(canc[0]["sent"]) - s0 if canc else None
    # the latest expiry any update in the chain declares (an update may move the end)
    ex_all = [ts(expires(f)) - s0 for f in fu if f["msgType"] == "Update" and expires(f)]
    T.append({"id": w["id"], "y": dt.datetime.utcfromtimestamp(w["t"] * 60).year, "c": w["c"], "f": w["f"],
              "k": hsh(r["sender"]), "L": L, "c0": c0, "Lmax": max([L] + ex_all) if L is not None else None,
              "n": len(fu), "has_info": bool(r["info"])})

R = {"reproduction": repro, "reproduces": all(a == b for a, b in repro.values())}
sil = [t for t in T if t["f"] == "silence"]
end = [t for t in T if t["f"].startswith("end")]

# P1
k1 = sum(1 for t in sil if t["L"] is not None and t["L"] > 0)
R["P1"] = {"silent": len(sil), "with_expiry_after_sent": k1, "share": round(k1 / len(sil), 4),
           "ci": wilson(k1, len(sil)), "no_expiry": sum(1 for t in sil if t["L"] is None),
           "expiry_not_after_sent": sum(1 for t in sil if t["L"] is not None and t["L"] <= 0),
           "held": k1 / len(sil) >= 0.95}
# P2
Ls = [t["L"] for t in T if t["L"] is not None and t["L"] > 0]
m = med_ci(Ls)
R["P2"] = {"n": len(Ls), "median_min": m[0], "ci_min": m[1:], "held": 60 <= m[0] <= 720,
           "quartiles_min": statistics.quantiles(Ls, n=4)}
# P3
ec = [t for t in end if t["L"] is not None and t["L"] > 0 and t["c0"] is not None]
k3 = sum(1 for t in ec if t["c0"] < t["L"])
k3m = sum(1 for t in ec if t["c0"] < t["Lmax"])
R["P3"] = {"cancelled_with_expiry": len(ec), "cancel_before_expiry": k3, "share": round(k3 / len(ec), 4),
           "ci": wilson(k3, len(ec)), "before_latest_declared_expiry": k3m,
           "cancelled_without_expiry": sum(1 for t in end if t["L"] is None), "held": k3 / len(ec) >= 0.80,
           "minutes_after_expiry_median": (statistics.median([t["c0"] - t["L"] for t in ec if t["c0"] >= t["L"]])
                                           if len(ec) > k3 else None)}
# P4
by = collections.defaultdict(list)
for t in T: by[t["k"]].append(t)
acc = {k: v for k, v in by.items() if len(v) >= 20}
fr = {k: sum(x["f"].startswith("end") for x in v) / len(v) for k, v in acc.items()}
ext = sum(1 for f in fr.values() if f < 0.10 or f > 0.90)
R["P4"] = {"accounts_all": len(by), "accounts_ge20": len(acc), "extreme": ext, "share": round(ext / len(acc), 4),
           "ci": wilson(ext, len(acc)), "never_cancel": sum(1 for f in fr.values() if f == 0),
           "held": ext / len(acc) >= 0.60,
           "warnings_in_ge20_accounts": sum(len(v) for v in acc.values()),
           "hist10": [sum(1 for f in fr.values() if (i / 10 <= f < (i + 1) / 10) or (i == 9 and f == 1.0)) for i in range(10)]}
for code in ("CEM", "CAE"):
    a = collections.defaultdict(list)
    for t in T:
        if t["c"] == code: a[t["k"]].append(t)
    a = {k: v for k, v in a.items() if len(v) >= 20}
    f2 = [sum(x["f"].startswith("end") for x in v) / len(v) for v in a.values()]
    R["P4"]["within_" + code] = {"accounts_ge20": len(a), "extreme": sum(1 for f in f2 if f < .1 or f > .9)}
# P5
Lc = [t["L"] for t in end if t["L"] is not None and t["L"] > 0]
Lsil = [t["L"] for t in sil if t["L"] is not None and t["L"] > 0]
mc, ms = med_ci(Lc), med_ci(Lsil)
R["P5"] = {"cancelled_median": mc, "silent_median": ms, "held": mc[0] > ms[0]}

# exploratory: eta squared of "closed by a cancel" on account vs on event code
def eta2(key):
    y = [1.0 if t["f"].startswith("end") else 0.0 for t in T]; mu = sum(y) / len(y)
    g = collections.defaultdict(list)
    for t, v in zip(T, y): g[t[key]].append(v)
    ssb = sum(len(v) * (sum(v) / len(v) - mu) ** 2 for v in g.values()); sst = sum((v - mu) ** 2 for v in y)
    return {"groups": len(g), "eta2": round(ssb / sst, 4)}
R["exploratory"] = {"eta2_account": eta2("k"), "eta2_code": eta2("c")}
# a permutation baseline: account labels shuffled, how much eta2 do this many groups explain by chance?
lab = [t["k"] for t in T]; perm = []
for i in range(50):
    sh = lab[:]; rng.shuffle(sh)
    for t, s in zip(T, sh): t["kp"] = s
    perm.append(eta2("kp")["eta2"])
R["exploratory"]["eta2_account_shuffled_max_of_50"] = max(perm)
for t in T: t.pop("kp", None)
pc = {}
for code in sorted({t["c"] for t in T}):
    v = [t for t in T if t["c"] == code]
    l = [t["L"] for t in v if t["L"] is not None and t["L"] > 0]
    pc[code] = {"n": len(v), "cancelled": sum(t["f"].startswith("end") for t in v),
                "silent": sum(t["f"] == "silence" for t in v),
                "median_L_min": statistics.median(l) if l else None,
                "silent_with_expiry": sum(1 for t in v if t["f"] == "silence" and t["L"] and t["L"] > 0)}
R["per_code"] = pc
yr = {}
for y in sorted({t["y"] for t in T}):
    v = [t for t in T if t["y"] == y]
    yr[y] = {"n": len(v), "cancelled": sum(t["f"].startswith("end") for t in v),
             "silent_with_expiry": sum(1 for t in v if t["f"] == "silence" and t["L"] and t["L"] > 0),
             "silent": sum(t["f"] == "silence" for t in v)}
R["per_year"] = yr
# long tails of declared lifetimes
R["lifetime_bands"] = {b: sum(1 for x in Ls if lo <= x < hi) for b, lo, hi in
                       [("<30m", 0, 30), ("30m-1h", 30, 60), ("1-2h", 60, 120), ("2-6h", 120, 360),
                        ("6-24h", 360, 1440), ("1-7d", 1440, 10080), (">=7d", 10080, 1e12)]}
hi_ = [t for t in T if t["id"] == "0c0f651e-b3d1-4141-9c5d-6159c153909c"]
R["fetch"] = json.load(open(os.path.join(RAW, "fetch.json")))
os.makedirs("data", exist_ok=True)
json.dump(R, open("data/results.json", "w"), indent=1, default=float)
with open("data/warnings.tsv", "w") as fh:
    fh.write("id\tyear\tcode\tfate\taccount_hash\tlifetime_min\tfirst_cancel_min\tlatest_declared_min\tfollowups\n")
    for t in T:
        f = lambda x: "" if x is None else "%.1f" % x
        fh.write("\t".join([t["id"], str(t["y"]), t["c"], t["f"], t["k"], f(t["L"]), f(t["c0"]), f(t["Lmax"]), str(t["n"])]) + "\n")
# page data: compact rows [code, fate index, account index, L, c0, year]
FATES = ["silence", "update", "end-mute", "end-safe", "end-clear", "end-error"]
ACC = sorted(acc, key=lambda k: -len(acc[k]))
with open("data.js", "w") as fh:
    fh.write("// generated by analyse.py, study 17; FEMA IPAWS archive (public domain); accounts hashed\n")
    fh.write("window.R=" + json.dumps(R, default=float) + ";\n")
    fh.write("window.FATES=" + json.dumps(FATES) + ";window.ACC=" + json.dumps(ACC) + ";\n")
    rows = [[t["c"], FATES.index(t["f"]), ACC.index(t["k"]) if t["k"] in acc else -1,
             None if t["L"] is None else round(t["L"]), None if t["c0"] is None else round(t["c0"]), t["y"]] for t in T]
    fh.write("window.T=" + json.dumps(rows, separators=(",", ":")) + ";\n")
print(json.dumps({k: R[k] for k in ("reproduces", "P1", "P2", "P3", "P4", "P5", "exploratory")}, indent=1, default=float))
