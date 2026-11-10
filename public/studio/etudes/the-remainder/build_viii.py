"""Build data-viii.json for THE REMAINDER, movement VIII (session 217, 2026-11-01): Madagascar's market
price series in FEWS NET's data warehouse, January 2024 to September 2026, played by the day each row
was written, with every "No Data" blank placed on the day its series next wrote.

Usage: python3 -I build_viii.py MG.json > data-viii.json

MG.json: https://fdw.fews.net/api/marketpricefacts/?format=json&country_code=MG&start_date=2024-01-01&end_date=2026-10-31
(fetched 2026-11-01; 1,584 rows; every row's data_usage_policy is "Public"; not committed). By checksum
it is the file the Field fetched for check 48 (field-research, artifacts/2026-11-01-the-written-day,
results48.json, W6: sha256 fccb9858...).

The rule this movement plays is the Atelier's (ulysses, artifacts/convening-after-011/only-a-return,
probes.json, 2026-11-01): a "No Data" row has no id, no submission and no `created` day, and a query
holds one only where the same series has a written row on both sides of it. So the build places each
blank at the `created` day of the next written row of its own series (its far edge) and asserts that
every blank has a written row before it and after it. "Written" = a row with a `created` day; in
Madagascar these are all "Aggregated" rows (FEWS NET's derived values) and one "Not Available".
`created` may mark a re-import rather than a first entry (the Field's limit, kept here).
"""
import collections, datetime as dt, hashlib, json, sys

SHA = "fccb98588afa6be21b8749373cd216885eb8a650a32e5bee933e8a140aaa84b2"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA
rows = json.loads(raw)
assert len(rows) == 1584
assert all(r["data_usage_policy"] == "Public" for r in rows)
st = collections.Counter(r["status"] for r in rows)
assert st == {"Aggregated": 998, "No Data": 585, "Not Available": 1}, st


def mi(s):  # month index from Jan 2024
    d = dt.date.fromisoformat(s[:10]); return (d.year - 2024) * 12 + d.month - 1


S = collections.defaultdict(list)
for r in rows:
    S[r["dataseries"]].append(r)

MARKETS = ["Antananarivo Average", "Fianarantsoa I (CL)", "Ihosy (CL)", "Toamasina I (CL)", "Toliara I (CL)"]
series, n_blank, n_written, trailing, leading = [], 0, 0, 0, 0
for sid, v in S.items():
    v.sort(key=lambda r: r["period_date"])
    ms = [mi(r["period_date"]) for r in v]
    assert len(set(ms)) == len(ms)                       # one row a month per series
    written = [(mi(r["period_date"]), r["created"][:10]) for r in v if r["created"]]
    cells = []
    for r in v:
        m = mi(r["period_date"])
        if r["status"] == "No Data":
            assert r["id"] is None and r["created"] is None and r["datacollection"] is None and r["value"] is None
            before = [w for w in written if w[0] < m]
            after = [w for w in written if w[0] > m]
            leading += not before; trailing += not after
            assert before and after, (sid, m)            # the Atelier's rule: a blank lies between two written rows
            cells.append([m, 2, after[0][1], after[0][0]])  # kind 2: blank, appears on its far edge's day
            n_blank += 1
        else:
            assert r["created"]
            cells.append([m, 0 if r["status"] == "Aggregated" else 1, r["created"][:10]])
            n_written += 1
    series.append({"id": sid, "market": v[0]["market"], "product": v[0]["product"], "cells": cells})

assert n_blank == 585 and n_written == 999 and trailing == 0 and leading == 0
series.sort(key=lambda s: (MARKETS.index(s["market"]), s["id"]))
days = collections.Counter()
for s in series:
    for c in s["cells"]:
        if c[1] != 2:
            days[c[2]] += 1
arrive = collections.Counter()                           # blanks brought into the record per day of writing
for s in series:
    for c in s["cells"]:
        if c[1] == 2:
            arrive[c[2]] += 1
# the Atelier's probe: 495 blanks for Jan-Nov 2025 come with the December 2025 rows; 90 for Oct-Nov 2024 before
b25 = sum(1 for s in series for c in s["cells"] if c[1] == 2 and 12 <= c[0] <= 22)
b24 = sum(1 for s in series for c in s["cells"] if c[1] == 2 and c[0] in (9, 10))
assert b25 == 495 and b24 == 90, (b25, b24)
last_write_before = max(d for d in days if d < "2026-01-01")
first_after = min(d for d in days if d > last_write_before)
out = {"source": "https://fdw.fews.net/api/marketpricefacts/?format=json&country_code=MG&start_date=2024-01-01&end_date=2026-10-31",
       "fetched": "2026-11-01", "sha256": SHA, "markets": MARKETS,
       "summary": {"rows": len(rows), "series": len(series), "written": n_written, "blank": n_blank,
                   "days_written": len(days), "blank_2025": b25, "blank_2024": b24,
                   "silent_from": last_write_before, "silent_to": first_after},
       "days": sorted(days.items()), "arrive": sorted(arrive.items()), "series": series}
json.dump(out, sys.stdout, separators=(",", ":"))
print(json.dumps(out["summary"]), json.dumps(out["arrive"]), file=sys.stderr)
