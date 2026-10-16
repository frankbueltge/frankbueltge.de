"""Study 20. Usage: python3 analyse.py <raw cache dir> <scratch dir>
Rebuilds study 17's corrected warnings (../2026-10-15-the-end-written-in-advance/
keepers_word_build_corrected.py), flags the all-clears by the Studio's rule, recomputes study 17's
figures with and without them, and tests P1-P5 (PREREGISTRATION.md).
Writes data/results.json, data/pairs.tsv (ids, hashed accounts, no text) and data.js."""
import json, os, sys, runpy, random, hashlib, statistics, collections, math, re, glob, io, contextlib
import datetime as dt

RAW, SCR = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
HERE = os.path.dirname(os.path.abspath(__file__))
S17 = os.path.join(HERE, "..", "2026-10-15-the-end-written-in-advance")

# --- the archive as it stood for study 17: messages sent before 2026-10-14T06:00Z (82,754) ---
CUT = os.path.join(SCR, "raw-cut"); os.makedirs(CUT, exist_ok=True)
rows = []
for f in sorted(glob.glob(f"{RAW}/page*.json")):
    rows += json.load(open(f))
grown = [r for r in rows if r["sent"][:19] >= "2026-10-14T06:00:00"]
rows = [r for r in rows if r["sent"][:19] < "2026-10-14T06:00:00"]
assert len(rows) == 82754, (len(rows), len(grown))
json.dump(rows, open(f"{CUT}/page0000.json", "w"))
refs = json.load(open(f"{RAW}/references.json"))
json.dump(refs, open(f"{CUT}/references.json", "w"))
FETCH = json.load(open(f"{RAW}/fetch.json")); FETCH["sent_after_cutoff_dropped"] = len(grown)
if os.path.exists(f"{RAW}/fill.json"): FETCH["fill"] = json.load(open(f"{RAW}/fill.json"))  # fill.py's repair
del rows

os.makedirs(SCR, exist_ok=True); os.chdir(SCR)
sys.argv = ["build.py", CUT]
with contextlib.redirect_stdout(io.StringIO()):
    G = runpy.run_path(os.path.join(S17, "keepers_word_build_corrected.py"))
os.chdir(HERE)
W, byid, chain, words, wea = G["W"], G["byid"], G["chain"], G["words"], G["wea"]
assert len(W) == 23154, len(W)

# --- the Studio's all-clear rule, copied unchanged from frankbueltge/studio @ 149b2680,
# works/2026-10-16-filed-under/build.py (Apache-2.0, attribution: Frank Bültge, https://frankbueltge.de) ---
ALLCLEAR = re.compile(r"\b(all clear|lifted|is over|has ended|resolved|no longer|restored|"
                      r"contained|extinguished|return home|may return|safe to return|no threat|no danger|"
                      r"no further threat|has passed|under control)\b", re.I)
STARTSCANCEL = re.compile(r"^\W*(cancel\w*|all clear|update: all clear)\b", re.I)
PERSONWIDE = re.compile('\\b(silver alert|golden alert|ashanti|camo alert|amber alert|senior alert|codi alert|bolo|be on the look ?out|look ?out for|last seen|wearing|[wbh]/[mf]|males?|females?|man|woman|boy|girl|juvenile|teen(ager)?|person of interest|he|she|his|her|him|height|weight|lbs?|hair|y/?o|year-old|yrs? old|age \\d+|\\d ?\'\\s?\\d+\\"?|tattoo\\w*|armed|dementia|alzheimer\\w*|autis\\w*|lic|runaway|escapee\\w*|alerta|found safe|has been found|was found|located safe|looking for|locating|searching for|seen in|seen near|info on|information on)\\b', re.I)
# exploratory only (pre-registered list): hazard words a pair may share
HAZ = re.compile(r"\b(fire|water|gas|power|road|shelter|evacuat\w*|police|chemical|spill|leak|boil)\b", re.I)

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

def hsh(s):  # study 17's salt, so accounts match its warnings.tsv
    return hashlib.sha256(("field-17:" + s).encode()).hexdigest()[:10]

T = []
for w in W:
    r = byid[w["id"]]
    s0 = ts(r["sent"]); e = expires(r)
    L = None if e is None else ts(e) - s0
    fu = sorted(chain(r["id"]), key=lambda x: x["sent"])
    canc = [f for f in fu if f["msgType"] == "Cancel"]
    shown = wea(r) or words(r)
    cw = " · ".join(words(f) for f in canc if words(f))
    T.append({"id": w["id"], "t": s0, "y": dt.datetime.fromtimestamp(s0 * 60, dt.timezone.utc).year,
              "c": w["c"], "f": w["f"], "k": hsh(r["sender"]), "L": L,
              "c0": ts(canc[0]["sent"]) - s0 if canc else None,
              "ac": bool(STARTSCANCEL.search(shown) or ALLCLEAR.search(shown)),
              "start": bool(STARTSCANCEL.search(shown)),
              "dealt_pool": w["w"] is not None and not PERSONWIDE.search(words(r) + " " + cw),
              "haz": set(m.lower()[:6] for m in HAZ.findall(shown))})

# --- study 17's figures, as its analyse.py computes them, on any subset ---
def eta2(V, key):
    y = [1.0 if t["f"].startswith("end") else 0.0 for t in V]; mu = sum(y) / len(y)
    g = collections.defaultdict(list)
    for t, v in zip(V, y): g[t[key]].append(v)
    ssb = sum(len(v) * (sum(v) / len(v) - mu) ** 2 for v in g.values()); sst = sum((v - mu) ** 2 for v in y)
    return round(ssb / sst, 4)

def s17(V):
    sil = [t for t in V if t["f"] == "silence"]; end = [t for t in V if t["f"].startswith("end")]
    k1 = sum(1 for t in sil if t["L"] is not None and t["L"] > 0)
    Ls = [t["L"] for t in V if t["L"] is not None and t["L"] > 0]
    ec = [t for t in end if t["L"] is not None and t["L"] > 0 and t["c0"] is not None]
    k3 = sum(1 for t in ec if t["c0"] < t["L"])
    by = collections.defaultdict(list)
    for t in V: by[t["k"]].append(t)
    acc = {k: v for k, v in by.items() if len(v) >= 20}
    fr = [sum(x["f"].startswith("end") for x in v) / len(v) for v in acc.values()]
    ext = sum(1 for f in fr if f < 0.10 or f > 0.90)
    Lc = [t["L"] for t in end if t["L"] is not None and t["L"] > 0]
    Lsil = [t["L"] for t in sil if t["L"] is not None and t["L"] > 0]
    rng = random.Random(17); lab = [t["k"] for t in V]; perm = []
    for _ in range(50):
        sh = lab[:]; rng.shuffle(sh)
        for t, s in zip(V, sh): t["kp"] = s
        perm.append(eta2(V, "kp"))
    for t in V: t.pop("kp", None)
    return {"warnings": len(V), "silent": len(sil),
            "P1_silent_with_expiry": k1, "P1_held": k1 / len(sil) >= 0.95,
            "P2_median_life_min": statistics.median(Ls), "P2_held": 60 <= statistics.median(Ls) <= 720,
            "whole_hours": [sum(1 for x in Ls if round(x, 1) % 60 == 0), len(Ls)],
            "P3_cancel_before_expiry": [k3, len(ec)], "P3_share": round(k3 / len(ec), 4),
            "P3_ci": wilson(k3, len(ec)), "P3_held": k3 / len(ec) >= 0.80,
            "P4_extreme": [ext, len(acc)], "P4_share": round(ext / len(acc), 4), "P4_held": ext / len(acc) >= 0.60,
            "P5_median_cancelled_vs_silent_min": [statistics.median(Lc), statistics.median(Lsil)],
            "P5_held": statistics.median(Lc) > statistics.median(Lsil),
            "eta2_account": eta2(V, "k"), "eta2_code": eta2(V, "c"), "eta2_account_shuffled_max_of_50": max(perm),
            "accounts": len(by)}

R = {"fetch": FETCH}
ALL = s17(T)
# the reproduction of study 17's correction (correction-2026-10-16/results.json) is the first check
C = json.load(open(os.path.join(S17, "correction-2026-10-16", "results.json")))
R["reproduces_study17_corrected"] = {
    "silent_with_expiry": [C["P1"]["with_expiry_after_sent"], ALL["P1_silent_with_expiry"]],
    "cancel_before_expiry": [[C["P3"]["cancel_before_expiry"], C["P3"]["cancelled_with_expiry"]], ALL["P3_cancel_before_expiry"]],
    "eta2_account": [C["exploratory"]["eta2_account"]["eta2"], ALL["eta2_account"]],
    "eta2_code": [C["exploratory"]["eta2_code"]["eta2"], ALL["eta2_code"]],
    "extreme": [[C["P4"]["extreme"], C["P4"]["accounts_ge20"]], ALL["P4_extreme"]]}
R["reproduces"] = all(a == b for a, b in R["reproduces_study17_corrected"].values())

AC = [t for t in T if t["ac"]]; NAC = [t for t in T if not t["ac"]]
NOAC = s17(NAC)
R["study17_all"], R["study17_without_allclears"] = ALL, NOAC
# P1 size; and the Studio's 678 within its dealt pool
R["P1"] = {"allclears": len(AC), "of": len(T), "share": round(len(AC) / len(T), 4), "ci": wilson(len(AC), len(T)),
           "starts_with_cancel": sum(t["start"] for t in AC),
           "in_studio_dealt_pool": sum(1 for t in AC if t["dealt_pool"]),
           "studio_dealt_pool": sum(1 for t in T if t["dealt_pool"]),
           "held": 678 <= len(AC) <= 1200}
# P2 an end has no sequel
k2 = sum(1 for t in AC if t["f"] == "silence")
R["P2"] = {"silent": k2, "of": len(AC), "share": round(k2 / len(AC), 4), "ci": wilson(k2, len(AC)),
           "fates": dict(collections.Counter(t["f"] for t in AC)), "held": k2 / len(AC) >= 0.85}
# P3 study 17 holds
d1 = abs(NOAC["P1_silent_with_expiry"] / NOAC["silent"] - ALL["P1_silent_with_expiry"] / ALL["silent"])
d3 = abs(NOAC["P3_share"] - ALL["P3_share"])
R["P3"] = {"verdicts_same": all(NOAC[k] == ALL[k] for k in ("P1_held", "P2_held", "P3_held", "P4_held", "P5_held")),
           "P1_share_shift": round(d1, 4), "P3_share_shift": round(d3, 4), "eta2_account": NOAC["eta2_account"]}
R["P3"]["held"] = R["P3"]["verdicts_same"] and d1 < 0.01 and d3 < 0.01 and 0.45 <= NOAC["eta2_account"] <= 0.55

# P4/P5 predecessors: nearest earlier non-all-clear warning of the same account within 24 h
by = collections.defaultdict(list)
for t in T: by[t["k"]].append(t)
for v in by.values(): v.sort(key=lambda t: t["t"])
def pred(t, win=1440.0):
    best = None
    for u in by[t["k"]]:
        if u["t"] >= t["t"]: break
        if not u["ac"] and t["t"] - u["t"] <= win: best = u
    return best
for t in T:
    p = pred(t, 1e12)
    t["gap"] = None if p is None else t["t"] - p["t"]; t["p"] = p
    nxt = [u for u in by[t["k"]] if u["ac"] and u["t"] > t["t"]]
    t["gap_next_ac"] = nxt[0]["t"] - t["t"] if nxt else None
def has(t, win=1440.0): return t["gap"] is not None and t["gap"] <= win
ka = sum(1 for t in AC if has(t)); kb = sum(1 for t in NAC if has(t))
ra, rb = ka / len(AC), kb / len(NAC)
rng = random.Random(20); keys = sorted(by); boots = []
for _ in range(2000):
    s = [rng.choice(keys) for _ in keys]
    a = [t for k in s for t in by[k] if t["ac"]]; b = [t for k in s for t in by[k] if not t["ac"]]
    if a and b and sum(has(t) for t in b):
        boots.append((sum(has(t) for t in a) / len(a)) / (sum(has(t) for t in b) / len(b)))
boots.sort()
R["P4"] = {"allclears_with_predecessor": [ka, len(AC)], "share": round(ra, 4), "ci": wilson(ka, len(AC)),
           "baseline_with_predecessor": [kb, len(NAC)], "baseline_share": round(rb, 4), "baseline_ci": wilson(kb, len(NAC)),
           "ratio": round(ra / rb, 3), "ratio_ci": [round(boots[int(.025 * len(boots))], 3), round(boots[int(.975 * len(boots)) - 1], 3)],
           "boot_n": len(boots), "held": ra >= 0.5 and ra / rb >= 2}
M = [t for t in AC if has(t)]
k5 = sum(1 for t in M if t["p"]["f"] == "silence")
R["P5"] = {"predecessor_silent": [k5, len(M)], "share": round(k5 / len(M), 4) if M else None, "ci": wilson(k5, len(M)),
           "predecessor_fates": dict(collections.Counter(t["p"]["f"] for t in M)),
           "baseline_silent_share_of_all_warnings": round(sum(t["f"] == "silence" for t in NAC) / len(NAC), 4),
           "held": bool(M) and k5 / len(M) >= 0.60}
# exploratory
gaps = sorted(t["gap"] for t in M)
sil = [t for t in NAC if t["f"] == "silence"]
ks = sum(1 for t in sil if t["gap_next_ac"] is not None and t["gap_next_ac"] <= 1440)
nsil = [t for t in NAC if t["f"] != "silence"]
kn = sum(1 for t in nsil if t["gap_next_ac"] is not None and t["gap_next_ac"] <= 1440)
R["exploratory"] = {
    "pair_gap_min_quartiles": statistics.quantiles(gaps, n=4) if len(gaps) > 3 else gaps,
    "pair_same_code": sum(1 for t in M if t["c"] == t["p"]["c"]),
    "pair_shared_hazard_word": sum(1 for t in M if t["haz"] & t["p"]["haz"]),
    "pair_allclear_has_hazard_word": sum(1 for t in M if t["haz"]),
    "silent_followed_by_allclear_24h": [ks, len(sil)], "silent_share": round(ks / len(sil), 4), "silent_ci": wilson(ks, len(sil)),
    "nonsilent_followed_by_allclear_24h": [kn, len(nsil)], "nonsilent_share": round(kn / len(nsil), 4),
    "allclear_accounts": len({t["k"] for t in AC}),
    "allclear_top5_account_share": round(sum(c for _, c in collections.Counter(t["k"] for t in AC).most_common(5)) / len(AC), 4),
    "allclear_codes": dict(collections.Counter(t["c"] for t in AC).most_common()),
    "allclear_years": dict(sorted(collections.Counter(t["y"] for t in AC).items())),
    "pred_codes": dict(collections.Counter(t["p"]["c"] for t in M).most_common())}

os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
json.dump(R, open(os.path.join(HERE, "data", "results.json"), "w"), indent=1, default=float)
with open(os.path.join(HERE, "data", "pairs.tsv"), "w") as fh:
    fh.write("allclear_id\taccount_hash\tyear\tcode\tfate\tpredecessor_id\tpredecessor_code\tpredecessor_fate\tgap_min\n")
    for t in sorted(AC, key=lambda t: t["t"]):
        p = t["p"]
        fh.write("\t".join([t["id"], t["k"], str(t["y"]), t["c"], t["f"], p["id"] if p else "", p["c"] if p else "",
                            p["f"] if p else "", "" if t["gap"] is None else "%.2f" % t["gap"]]) + "\n")
with open(os.path.join(HERE, "data", "warnings.tsv"), "w") as fh:  # for check.py's independent recount
    fh.write("id\taccount_hash\tsent_min\tcode\tfate\tallclear\tlifetime_min\tfirst_cancel_min\n")
    f3 = lambda x: "" if x is None else "%.3f" % x
    for t in sorted(T, key=lambda t: t["t"]):
        fh.write("\t".join([t["id"], t["k"], "%.3f" % t["t"], t["c"], t["f"], str(int(t["ac"])), f3(t["L"]), f3(t["c0"])]) + "\n")
# page data: per warning [all-clear, silent, gap to nearest earlier non-all-clear (min) or -1,
# that predecessor silent, gap to next all-clear (min) or -1, year, code index]
CODES = sorted({t["c"] for t in T})
P = [[int(t["ac"]), int(t["f"] == "silence"), -1 if t["gap"] is None else round(t["gap"], 3),
      int(bool(t["p"]) and t["p"]["f"] == "silence"), -1 if t["gap_next_ac"] is None else round(t["gap_next_ac"], 3),
      t["y"], CODES.index(t["c"])] for t in T]
with open(os.path.join(HERE, "data.js"), "w") as fh:
    fh.write("// generated by analyse.py, study 20; FEMA IPAWS archive (public domain); no text, no senders\n")
    fh.write("window.R=" + json.dumps(R, default=float) + ";\nwindow.CODES=" + json.dumps(CODES) + ";\n")
    fh.write("window.P=" + json.dumps(P, separators=(",", ":")) + ";\n")
print(json.dumps({k: R[k] for k in ("reproduces", "P1", "P2", "P3", "P4", "P5", "exploratory")}, indent=1, default=float))
