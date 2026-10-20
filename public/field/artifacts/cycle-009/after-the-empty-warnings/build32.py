"""Study 32: study 31's tornadoes, with the office's false-alarm record judged by the final database.
Usage: python3 -I build32.py <studio data.js @157af4b> <studio toll.js @157af4b>
Variables as fixed in PREREGISTRATION-32.md (commit 59db990). Writes data/tornadoes32.tsv and data/officeyears32.tsv.
Neither Studio file is committed here; both are named by sha256."""
import csv, sys, json, pathlib, hashlib, collections
from datetime import datetime, timedelta, timezone
HERE = pathlib.Path(__file__).resolve().parent
studio_path, toll_path = sys.argv[1], sys.argv[2]
SHA = {"studio": "f3f2e758c5a96906a1d9e5c2f5adf99ee36e8590c5b6f6753004062836ac9626",
       "toll": "cc9ba3f43261abcb605db39513bb1e2b8842487f4213ee2e827285c93fbbcd0b"}
for k, p in (("studio", studio_path), ("toll", toll_path)):
    assert hashlib.sha256(open(p, "rb").read()).hexdigest() == SHA[k], k

s = open(studio_path).read(); W = json.loads(s[s.index("{"):s.rindex("}") + 1])
s = open(toll_path).read(); TL = json.loads(s[s.index("{"):s.rindex("}") + 1])
T0 = datetime(2008, 1, 1, tzinfo=timezone.utc)
issue, met, dur = W["issue"], W["met"], W["dur"]
wfo = [W["wfos"][i] for i in W["wfo"]]
met_final = [0] * len(issue)
for w in TL["wt"]: met_final[int(w)] = 1
judged = [issue[i] + dur[i] <= TL["end"] for i in range(len(issue))]

def month_index(m):
    t = T0 + timedelta(minutes=m); return t.year * 12 + t.month - 1
mi = [month_index(m) for m in issue]
by_office_month = collections.defaultdict(list)
for i in range(len(issue)): by_office_month[(wfo[i], mi[i])].append(i)

def window(off, m0, m1):
    return [i for m in range(m0, m1) for i in by_office_month.get((off, m), [])]

def share(sel, num):
    return (sum(num(i) for i in sel) / len(sel), len(sel)) if sel else (None, 0)

rows = list(csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t"))
out, mismatch, unjudged = [], 0, 0
for r in rows:
    start = datetime.strptime(r["start_utc"], "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
    M = start.year * 12 + start.month - 1
    past, fut = window(r["office"], M - 12, M), window(r["office"], M + 1, M + 13)
    unjudged += sum(not judged[i] for i in past + fut)
    fo, n = share(past, lambda i: 1 - met[i])                       # study 31's FAR, recomputed
    if (fo is None) != (r["far_past"] == "") or (fo is not None and abs(round(fo, 5) - float(r["far_past"])) > 1e-9):
        mismatch += 1
    ffp, _ = share(past, lambda i: 1 - met_final[i])
    fff, nf = share(fut, lambda i: 1 - met_final[i])
    emp = [i for i in past if not met[i]]; hit = [i for i in past if met[i]]
    rev, ne = share(emp, lambda i: met_final[i])
    uns, nm = share(hit, lambda i: 1 - met_final[i])
    f = lambda x: "" if x is None else round(x, 5)
    out.append(dict(om=r["om"], yr=r["yr"], start_utc=r["start_utc"], office=r["office"],
                    far_final_past=f(ffp), n_past=n, far_final_future=f(fff), n_future=nf,
                    revision_past=f(rev), n_empty_past=ne, unseen_past=f(uns), n_met_past=nm))

assert mismatch == 0, f"study 31's office FAR not reproduced on {mismatch} rows"
assert unjudged == 0, "a window holds warnings the final database cannot judge"
with open(HERE / "data/tornadoes32.tsv", "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(out[0]), delimiter="\t"); w.writeheader(); w.writerows(out)
# office-years for the page: every judged warning, by issuing office and calendar year (UTC)
oy = collections.defaultdict(lambda: [0, 0, 0, 0])
for i in range(len(issue)):
    if not judged[i]: continue
    c = oy[(wfo[i], (T0 + timedelta(minutes=issue[i])).year)]
    c[0] += 1; c[1] += 1 - met[i]; c[2] += 1 - met_final[i]; c[3] += (1 - met[i]) * met_final[i]
with open(HERE / "data/officeyears32.tsv", "w", newline="") as fh:
    w = csv.writer(fh, delimiter="\t"); w.writerow(["office", "year", "warnings", "empty_office", "empty_final", "empty_office_filled"])
    for (o, y), c in sorted(oy.items()): w.writerow([o, y, *c])
agree = collections.Counter((met[i], met_final[i]) for i in range(len(issue)) if judged[i])
print(json.dumps({"rows": len(out), "far_past_reproduced": True,
                  "warnings_judged": sum(judged), "office_met_final_met": agree[(1, 1)],
                  "office_met_final_empty": agree[(1, 0)], "office_empty_final_met": agree[(0, 1)],
                  "office_empty_final_empty": agree[(0, 0)]}))
