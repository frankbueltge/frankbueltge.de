"""Study 31: join each tornado (2009-2023) to the record of warnings before and after it.
Usage: python3 -I build.py <1950-2023_actual_tornadoes.csv> <studio take-cover-again data.js>
Variables as fixed in PREREGISTRATION.md (commit 983df95). Writes data/tornadoes31.tsv.
No third-party file is committed raw: the SPC file and the Studio's data.js are named by sha256."""
import csv, sys, json, pathlib, hashlib, bisect, collections
from datetime import datetime, timedelta, timezone
HERE = pathlib.Path(__file__).resolve().parent
ART = HERE.parent.parent
spc_path, studio_path = sys.argv[1], sys.argv[2]
SHA = {"spc": "fa616e2f829c553acc7b60f5130a3ac498198e0b9d69e37a0e1289df71dc5fcc",
       "studio": "f3f2e758c5a96906a1d9e5c2f5adf99ee36e8590c5b6f6753004062836ac9626"}
for k, p in (("spc", spc_path), ("studio", studio_path)):
    assert hashlib.sha256(open(p, "rb").read()).hexdigest() == SHA[k], k

# --- the Studio's warnings: issue minute from t0, met flag, office, counties touched
s = open(studio_path).read()
W = json.loads(s[s.index("{"):s.rindex("}") + 1])
T0 = datetime(2008, 1, 1, tzinfo=timezone.utc)
issue, met, wfo = W["issue"], W["met"], [W["wfos"][i] for i in W["wfo"]]
county_seq = {u: seq for u, _name, seq in W["counties"]}
office_of = {u: collections.Counter(wfo[i] for i in seq).most_common(1)[0][0] for u, seq in county_seq.items()}
END = max(issue)

def month_index(m):  # minutes since t0 -> (year, month)
    t = T0 + timedelta(minutes=m); return t.year * 12 + t.month - 1

by_office, by_state = collections.defaultdict(list), collections.defaultdict(set)
for i in range(len(issue)):
    by_office[wfo[i]].append(i)
for u, seq in county_seq.items():
    by_state[u[:2]].update(seq)
mi = [month_index(m) for m in issue]

def far(idx, m0, m1):
    """empty share of warnings in idx whose issue month is in [m0, m1)."""
    sel = [i for i in idx if m0 <= mi[i] < m1]
    return (sum(1 - met[i] for i in sel) / len(sel), len(sel)) if sel else (None, 0)

# precompute per office/state per month windows lazily
cache = {}
def far_c(kind, key, idx, m0, m1):
    k = (kind, key, m0, m1)
    if k not in cache: cache[k] = far(idx, m0, m1)
    return cache[k]

# --- SPC rows: start county per tornado
spc, segs = {}, collections.defaultdict(list)
with open(spc_path) as f:
    for row in csv.DictReader(f):
        if not 2008 <= int(row["yr"]) <= 2023: continue
        key = (row["om"], row["yr"], row["date"] + " " + row["time"][:5])
        if row["sg"] == "1": spc[key] = row
        if row["sg"] == "2": segs[key].append(row)

def start_ugc(key, st):
    r = spc[key]
    if int(r["f1"]) > 0: return f"{st}C{int(r['f1']):03d}"
    for g in segs.get(key, []):           # multi-state: first segment in the start state
        if g["st"] == st and int(g["f1"]) > 0: return f"{st}C{int(g['f1']):03d}"
    return None

cov = list(csv.DictReader(open(ART / "2026-10-14-who-was-beneath/data/beneath.tsv"), delimiter="\t"))
torn = list(csv.DictReader(open(ART / "2026-10-14-the-tornadoes-that-came/data/tornadoes.tsv"), delimiter="\t"))
cov_by = {}
for c in cov: cov_by.setdefault((c["om"], c["yr"], c["st"], c["fat"], c["inj"], c["mag"]), []).append(c)

out, miss = [], collections.Counter()
for t in torn:
    if not 2009 <= int(t["yr"]) <= 2023: continue
    start = datetime.strptime(t["start_utc"], "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
    cst = (start - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M")
    key = (t["om"], t["yr"], cst)
    if key not in spc: miss["no_spc"] += 1; continue
    cands = cov_by.get((t["om"], t["yr"], t["st"], t["fat"], t["inj"], t["mag"]), [])
    if len(cands) != 1: miss["covariates_not_unique" if cands else "no_covariates"] += 1; continue
    c = cands[0]
    if c["density"] == "": miss["no_density"] += 1; continue
    ugc = start_ugc(key, t["st"])
    if ugc is None: miss["no_county"] += 1; continue
    if ugc not in county_seq: miss["county_never_warned"] += 1; continue
    T = int((start - T0).total_seconds() // 60)
    M = start.year * 12 + start.month - 1
    off = office_of[ugc]
    fp, n_p = far_c("o", off, by_office[off], M - 12, M)
    ff, n_f = far_c("o", off, by_office[off], M + 1, M + 13)
    fs, n_s = far_c("s", ugc[:2], sorted(by_state[ugc[:2]]), M - 12, M)
    seq = county_seq[ugc]
    lo = bisect.bisect_left([issue[i] for i in seq], T - 365 * 1440)
    hi = bisect.bisect_left([issue[i] for i in seq], T - 1440)
    window = seq[lo:hi]
    empties = sum(1 - met[i] for i in window)
    run = 0
    for i in reversed(window):
        if met[i]: break
        run += 1
    out.append(dict(om=t["om"], yr=t["yr"], start_utc=t["start_utc"], st=t["st"], ugc=ugc, office=off,
                    fat=c["fat"], inj=c["inj"], mag=c["mag"], warned=c["warned"], len_mi=c["len_mi"],
                    wid_yd=c["wid_yd"], night=c["night"], region=c["region"], density=c["density"],
                    exposure=c["exposure"],
                    far_past="" if fp is None else round(fp, 5), n_past=n_p,
                    far_future="" if ff is None else round(ff, 5), n_future=n_f,
                    far_state_past="" if fs is None else round(fs, 5), n_state_past=n_s,
                    warnings_county_1y=len(window), empties_county=empties, run_county=run))

assert max(int(r["n_future"]) >= 0 for r in out)
with open(HERE / "data/tornadoes31.tsv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0]), delimiter="\t"); w.writeheader(); w.writerows(out)
print(json.dumps({"rows": len(out), "dropped": miss, "last_warning": (T0 + timedelta(minutes=END)).isoformat()}))
