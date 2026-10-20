"""TAKE COVER, AGAIN: build the work's data from the raw IEM verification files.

    python3 -I build_data.py RAW_DIR

Conventions (fixed before reading the results):
- A warning is one NWS tornado warning (VTEC event, phenomena TO, significance W), as the office
  issued it. Its minutes are expire minus issue, as issued; a warning cancelled sooner still counts
  its issued minutes (the cancellation is increment 3's).
- A warning is *met* when the office's own verification (IEM Cow, `verify`) found a tornado storm
  report inside its polygon while it stood. Otherwise it is *empty*: no tornado was reported inside it.
  That is the record's answer, not the sky's: an unreported tornado leaves a warning empty.
- One event (office, year, event id) is one warning. The service splits 44-odd events into several
  polygons (ids ending W2, W3); they are merged: counties united, met if any part was met, earliest
  issue, latest expire. An event whose issued minutes are not between 1 and 240 is a record error
  (one ran 43,620 minutes, one ended before it began); it is excluded and counted.
- A county's sequence is every warning whose polygon touched it (`ar_ugc`), in order of issue.
- The fable's count (the Atelier's plate I case: the boy's true cry after "three or four" empty ones):
  for each met warning in a county's sequence, the run of empty warnings directly before it there.

Writes data.js (window.TCA = {...}), summary.json and summary.js (the same, for the page).
"""
import json, sys, pathlib, datetime, collections

RAW = pathlib.Path(sys.argv[1])
HERE = pathlib.Path(__file__).parent
T0 = datetime.datetime(2008, 1, 1, tzinfo=datetime.timezone.utc)


def mins(s):
    t = datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))
    return int((t - T0).total_seconds() // 60)


ev = {}         # (wfo, year, eventid) -> merged event
files = sorted(RAW.glob("cow_*.json"))
for p in files:
    d = json.loads(p.read_text())
    if not d.get("events") or not d["events"].get("features"):
        continue
    srs = d["stormreports"]["features"] if d.get("stormreports") else []
    for f in d["events"]["features"]:
        q = f["properties"]
        if q["phenomena"] != "TO" or q["significance"] != "W":
            continue
        key = (q["wfo"], q["year"], q["eventid"])
        e = ev.setdefault(key, {"issue": q["issue"], "expire": q["expire"], "met": False,
                                "reps": [], "ugc": {}, "parts": 0})
        e["parts"] += 1
        e["issue"] = min(e["issue"], q["issue"]); e["expire"] = max(e["expire"], q["expire"])
        e["met"] = e["met"] or bool(q["verify"])
        if q["verify"]:
            e["reps"] += [srs[int(i)]["properties"] for i in str(q["stormreports"]).split(",") if i != ""]
        e["ugc"].update(zip(q["ar_ugc"], q["ar_ugcname"]))

W = []          # (issue, dur, met, report index, wfo)
reports = []    # (minute, place, state)
county_name = {}
seq = collections.defaultdict(list)
errors = []
for (wfo, year, eid), e in sorted(ev.items()):
    dur = mins(e["expire"]) - mins(e["issue"])
    if not 1 <= dur <= 240:
        errors.append(f"{year}.{wfo}.TO.W.{eid:04d} ({dur} min)"); continue
    rep = -1
    if e["reps"]:
        first = min(e["reps"], key=lambda r: r["valid"])
        rep = len(reports)
        reports.append((mins(first["valid"]), first["city"] or "", first["state"] or ""))
    i = len(W)
    W.append((mins(e["issue"]), dur, 1 if e["met"] else 0, rep, wfo))
    for u, n in e["ugc"].items():
        county_name[u] = n
        seq[u].append(i)
merged = sum(1 for e in ev.values() if e["parts"] > 1)

order = sorted(range(len(W)), key=lambda i: (W[i][0], W[i][4]))
rank = {i: r for r, i in enumerate(order)}
W2 = [W[i] for i in order]
for u in seq:
    seq[u] = sorted(rank[i] for i in seq[u])

# the fable's count
runs = collections.Counter()
fable = {}
for u, s in seq.items():
    run = 0
    k = 0
    for i in s:
        if W2[i][2]:
            runs[min(run, 10)] += 1
            if run >= 3:
                k += 1
            run = 0
        else:
            run += 1
    fable[u] = k

wfos = sorted({w[4] for w in W2})
wi = {w: i for i, w in enumerate(wfos)}
counties = sorted(seq, key=lambda u: (county_name[u].split()[-1], county_name[u]))
data = {
    "t0": "2008-01-01T00:00Z",
    "issue": [w[0] for w in W2], "dur": [w[1] for w in W2], "met": [w[2] for w in W2],
    "rep": [w[3] for w in W2], "wfo": [wi[w[4]] for w in W2], "wfos": wfos,
    "reports": reports,
    "counties": [[u, county_name[u], seq[u]] for u in counties],
}
n = len(W2); met = sum(w[2] for w in W2)
entries = sum(len(s) for s in seq.values())
met_entries = sum(W2[i][2] for s in seq.values() for i in s)
summary = {
    "warnings": n, "met": met, "empty": n - met, "far": round((n - met) / n, 4),
    "first_issue": min(W2)[0], "last_issue": max(W2)[0],
    "counties": len(seq), "county_entries": entries, "county_entries_met": met_entries,
    "minutes_issued_total": sum(w[1] for w in W2),
    "minutes_issued_empty": sum(w[1] for w in W2 if not w[2]),
    "fable_runs_before_met": {str(k): runs[k] for k in sorted(runs)},
    "fable_met_after_3plus_empty": sum(fable.values()),
    "counties_with_20plus": sum(1 for s in seq.values() if len(s) >= 20),
    "offices": len(wfos), "raw_files": len(files),
    "events_merged_from_parts": merged, "record_errors_excluded": errors,
}
for k in ("first_issue", "last_issue"):
    summary[k] = (T0 + datetime.timedelta(minutes=summary[k])).strftime("%Y-%m-%dT%H:%MZ")
# checks
assert sum(len(s) for s in seq.values()) == entries
assert all((r == -1) == (not W2[i][2]) for i, r in enumerate(data["rep"])), "every met warning has its report"
assert sum(runs.values()) == met_entries
(HERE / "data.js").write_text("window.TCA=" + json.dumps(data, separators=(",", ":")) + ";\n")
(HERE / "summary.json").write_text(json.dumps(summary, indent=1))
(HERE / "summary.js").write_text("window.TCA_SUMMARY=" + json.dumps(summary) + ";\n")
print(json.dumps(summary, indent=1))
