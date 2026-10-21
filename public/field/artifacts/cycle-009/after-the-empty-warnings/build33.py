"""Study 33: study 31's tornadoes 2016-2023, the office's empty warnings held to the warner's stated word
(the Atelier's plate3.js) and to whether the office took them back (the Studio's word.js).
Usage: python3 -I build33.py <studio data.js @157af4b> <atelier plate3.js @8ae3ba4> <studio word.js @5673f4f>
Variables as fixed in PREREGISTRATION-33.md (commit c307e2e). Writes data/tornadoes33.tsv.
No sibling file is committed here; each is named by sha256."""
import csv, sys, json, pathlib, hashlib, collections
from datetime import datetime, timedelta, timezone
HERE = pathlib.Path(__file__).resolve().parent
SHA = {"studio": "f3f2e758c5a96906a1d9e5c2f5adf99ee36e8590c5b6f6753004062836ac9626",
       "plate3": "139ad927f2cf190414c724a3cf07263c5d9c7212f9033ec87f302a94aaee2a01",
       "word": "aa822c84d68b3d66ec94bdd7694dacd854793792a30eb889d5fbf89d37210a04"}
paths = dict(zip(("studio", "plate3", "word"), sys.argv[1:4]))
for k, p in paths.items():
    assert hashlib.sha256(open(p, "rb").read()).hexdigest() == SHA[k], k

def js(p):
    s = open(p).read(); return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))
W, P, WD = js(paths["studio"]), js(paths["plate3"]), js(paths["word"])
T0 = datetime(2008, 1, 1, tzinfo=timezone.utc)
issue, met, dur = W["issue"], W["met"], W["dur"]
wfo = [W["wfos"][i] for i in W["wfo"]]
ORDER, CH = P["order"], P["chance"]
OBS = {"O", "OC", "CAT"}

# taken back: any county entry stood at most duration - 5 minutes (the Studio's "early")
taken = [0] * len(issue)
for (u, name, seq), tk in zip(W["counties"], WD["taken"]):
    for pos, stood, _ in tk:
        w = seq[pos]
        if stood <= dur[w] - 5: taken[w] = 1

# join the stated word by (office, issue minute); keys held by more than one data.js warning are left out
key = collections.Counter((wfo[i], issue[i]) for i in range(len(issue)))
idx = {(wfo[i], issue[i]): i for i in range(len(issue))}
word, n_seq, n_multi, n_missing = {}, 0, 0, 0
for off, seq in P["seq"].items():
    for m, code in seq:
        n_seq += 1
        k = (off, m)
        if k not in idx: n_missing += 1; continue
        if key[k] > 1: n_multi += 1; continue
        i = idx[k]
        assert met[i] == (code // 2) % 2, "the hour verdict differs from data.js"
        word[i] = ORDER[code // 4]

def month_index(m):
    t = T0 + timedelta(minutes=m); return t.year * 12 + t.month - 1
by_om = collections.defaultdict(list)
for i in word: by_om[(wfo[i], month_index(issue[i]))].append(i)
def window(off, m0, m1):
    return [i for m in range(m0, m1) for i in by_om.get((off, m), [])]

def measures(sel):
    if not sel: return dict(far="", wexp="", excess="", broken="", taken="", n=0, n_empty=0)
    n = len(sel); emp = [i for i in sel if not met[i]]
    far = len(emp) / n; wexp = sum(1 - CH[word[i]] for i in sel) / n
    return dict(far=round(far, 5), wexp=round(wexp, 5), excess=round(far - wexp, 5),
                broken=round(sum(word[i] in OBS for i in emp) / n, 5),
                taken=round(sum(taken[i] for i in emp) / len(emp), 5) if emp else "", n=n, n_empty=len(emp))

rows = list(csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t"))
out = []
for r in rows:
    if not ("2016-01-01" <= r["start_utc"] < "2024-01-01") or r["office"] not in P["seq"]: continue
    start = datetime.strptime(r["start_utc"], "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
    M = start.year * 12 + start.month - 1
    pa, fu = measures(window(r["office"], M - 12, M)), measures(window(r["office"], M + 1, M + 13))
    out.append(dict(om=r["om"], yr=r["yr"], start_utc=r["start_utc"], office=r["office"],
                    **{k + "_past": v for k, v in pa.items()}, **{k + "_future": v for k, v in fu.items()}))
with open(HERE / "data/tornadoes33.tsv", "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(out[0]), delimiter="\t"); w.writeheader(); w.writerows(out)
J = [i for i in word]
print(json.dumps({"rows": len(out), "seq_warnings": n_seq, "joined": len(word), "missing_in_data_js": n_missing,
                  "shared_key_left_out": n_multi,
                  "joined_empty": sum(1 - met[i] for i in J),
                  "joined_empty_taken": sum(taken[i] for i in J if not met[i]),
                  "joined_met_taken": sum(taken[i] for i in J if met[i]),
                  "by_class": {c: sum(word[i] == c for i in J) for c in ORDER}}))
