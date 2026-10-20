"""TAKE COVER, AGAIN, increment 3: the warner's word. For every county entry of the work (one warning
in one county's sequence), when the office ended the warning there, and the product that ended it.
Also the record's own answer to the visitor's belief: how often the next warning was met, by the run
of empty warnings just before it.

    python3 -I build_word.py COW_RAW_DIR WORD_RAW_DIR [ATELIER_PLATE2_JS]

Reads the raw IEM Cow files (to rebuild data.js's warnings with their VTEC keys; asserted equal),
the raw VTEC event files fetched by fetch_word.py, and data.js. If the Atelier's plate2.js (The
Wolf's Ledger, plate II) is given, its per-county met strings are asserted equal to this work's.
Writes word.js (for the page), word.json (the counts) and wordsum.js (the same, for the page).

Conventions (fixed before reading the results):
- The VTEC event service gives one row per warning and county as the office listed it: when the
  warning was issued to expire there (`init_expired`), when it actually ended there (`expire`,
  moved by a cancellation or a county dropped from a statement), and the last product about it.
- A county entry's minutes *stood* are its row's actual end minus the warning's issue, held between
  0 and the minutes issued. Where the polygon touched a county the office did not list (Cow's
  `ar_ugc` is the polygon's reach, the VTEC row the office's list), the warning's latest end over
  all its rows is used, and the entry is counted as *unlisted*.
- *Taken back* means the entry stood at least one minute less than issued. *Taken back early*
  means at least five minutes less: a statement that ends a warning in its last minutes is the
  routine close, not a judgment.
- The record's belief column: over all county entries after the first in each county, the share
  met, by the run of empty entries directly before it (0 to 9, and 10 or more).
"""
import json, sys, pathlib, datetime, collections

COW, WRD = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
P2 = pathlib.Path(sys.argv[3]) if len(sys.argv) > 3 else None
HERE = pathlib.Path(__file__).parent
T0 = datetime.datetime(2008, 1, 1, tzinfo=datetime.timezone.utc)


def mins(s):
    t = datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))
    return int((t - T0).total_seconds() // 60)


# --- the warnings again, in build_data.py's order, with their keys
ev = {}
for p in sorted(COW.glob("cow_*.json")):
    d = json.loads(p.read_text())
    if not d.get("events") or not d["events"].get("features"):
        continue
    for f in d["events"]["features"]:
        q = f["properties"]
        if q["phenomena"] != "TO" or q["significance"] != "W":
            continue
        e = ev.setdefault((q["wfo"], q["year"], q["eventid"]), {"issue": q["issue"], "expire": q["expire"], "met": False})
        e["issue"] = min(e["issue"], q["issue"]); e["expire"] = max(e["expire"], q["expire"])
        e["met"] = e["met"] or bool(q["verify"])
W = []
for (wfo, year, eid), e in sorted(ev.items()):
    dur = mins(e["expire"]) - mins(e["issue"])
    if 1 <= dur <= 240:
        W.append((mins(e["issue"]), dur, 1 if e["met"] else 0, wfo, (wfo, year, eid)))
W.sort(key=lambda w: (w[0], w[3]))
D = json.loads((HERE / "data.js").read_text()[len("window.TCA="):-2])
assert [w[0] for w in W] == D["issue"] and [w[1] for w in W] == D["dur"] and [w[2] for w in W] == D["met"], \
    "the warnings rebuilt here are data.js's, in its order"
key_of = [w[4] for w in W]

# --- the VTEC rows
rows = collections.defaultdict(dict)    # key -> ugc -> (end minute, init end minute, last product)
nrows = 0
for p in sorted(WRD.glob("ev_*.json")):
    _, wfo, y = p.stem.split("_")
    for r in json.loads(p.read_text())["events"]:
        if r["phenomena"] != "TO" or r["significance"] != "W" or not r["expire"]:
            continue
        nrows += 1
        rows[(r["wfo"], int(y), r["eventid"])][r["ugc"]] = (mins(r["expire"]), mins(r["init_expired"]), r["last_product_id"] or "")

stood = {}      # (warning, county index) -> minutes stood
prod = []       # distinct last products, referenced by index
pidx = {}
c = collections.Counter()
by_met = {0: collections.Counter(), 1: collections.Counter()}
early = set()   # products that took an entry back five or more minutes early
taken = []      # per county: [[position, minutes stood, product index], ...] for entries taken back
for ci, (u, name, seq) in enumerate(D["counties"]):
    tk = []
    for pos, w in enumerate(seq):
        k = key_of[w]
        rr = rows.get(k)
        if not rr:
            c["no_vtec_rows"] += 1; continue
        if u in rr:
            end, init, lp = rr[u]
        else:
            c["unlisted"] += 1
            end = max(v[0] for v in rr.values()); lp = max(rr.values())[2]
        s = max(0, min(D["dur"][w], end - D["issue"][w]))
        c["entries"] += 1
        m = D["met"][w]
        b = by_met[m]
        b["entries"] += 1; b["issued"] += D["dur"][w]; b["stood"] += s
        if s <= D["dur"][w] - 1:
            b["taken_back"] += 1
            if lp not in pidx:
                pidx[lp] = len(prod); prod.append(lp)
            tk.append([pos, s, pidx[lp]])
        if s <= D["dur"][w] - 5:
            b["taken_back_early"] += 1; b["minutes_taken_back_early"] += D["dur"][w] - s
            early.add(pidx[lp])
    taken.append(tk)
total_entries = sum(len(x[2]) for x in D["counties"])
assert c["entries"] + c["no_vtec_rows"] == total_entries

# --- the record's belief column
col = collections.defaultdict(lambda: [0, 0])     # run (cap 10) -> [entries, met]
for u, name, seq in D["counties"]:
    run = None
    for w in seq:
        if run is not None:
            col[min(run, 10)][0] += 1; col[min(run, 10)][1] += D["met"][w]
        run = 0 if D["met"][w] else (run or 0) + 1

# --- the Atelier's plate II, read against this work
p2check = None
if P2:
    s = P2.read_text()
    i = s.index("const P2C=") + len("const P2C=")
    P2C = json.loads(s[i:s.index("\n", i)].rstrip().rstrip(";"))
    mine = {u: "".join(str(D["met"][w]) for w in seq) for u, _, seq in D["counties"]}
    eq = sum(1 for r in P2C if mine.get(r[0]) == r[3])
    assert eq == len(P2C), f"plate II's met strings differ from this work's in {len(P2C) - eq} counties"
    p2check = {"counties": len(P2C), "equal": eq}

summary = {
    "vtec_rows": nrows, "entries_with_rows": c["entries"], "entries_without_rows": c["no_vtec_rows"],
    "entries_unlisted": c["unlisted"],
    "met": dict(by_met[1]), "empty": dict(by_met[0]),
    "belief_record": {str(k): {"entries": v[0], "met": v[1], "share": round(v[1] / v[0], 4)} for k, v in sorted(col.items())},
    "products_taken_back": len(prod), "products_taken_back_early": len(early),
    "atelier_plate2_check": p2check,
}
(HERE / "word.js").write_text("window.TCA_WORD=" + json.dumps({"taken": taken, "prod": prod, "early": sorted(early)}, separators=(",", ":")) + ";\n")
(HERE / "word.json").write_text(json.dumps(summary, indent=1))
(HERE / "wordsum.js").write_text("window.TCA_WORDSUM=" + json.dumps(summary) + ";\n")
print(json.dumps(summary, indent=1))
