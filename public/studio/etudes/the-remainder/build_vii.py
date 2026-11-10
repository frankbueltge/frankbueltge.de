"""Build data-vii.json for THE REMAINDER, movement VII (session 210, 2026-10-28): Sudan's market prices
in FEWS NET's data warehouse, January 2024 to September 2026, by the month they were measured and by the
day they were written into the warehouse.

Usage: python3 -I build_vii.py SD.json warehouse.json > data-vii.json

SD.json: https://fdw.fews.net/api/marketpricefacts/?format=json&country_code=SD&start_date=2024-01-01&end_date=2026-10-28
(fetched 2026-10-28; 10,039 rows; every row's data_usage_policy is "Public"). It is the same file, by
checksum, that the Field fetched in session 237 (field-research, notes/convening-after-010/price-line/
sources.json). warehouse.json is the Field's reduction of it (same folder, fetched from main on
2026-10-28, checksum asserted); the build asserts that its own counts agree with the Field's.

A row is *written* on its `created` day. A *price* is a row with a value. The other rows are the
warehouse's own words for a missing price: "Not Collected", "Not Available", "Missing Historic Data"
(written, with a day), and "No Data" (no `created` day at all). `created` may mark a re-import rather
than a first entry (the Field's limit, kept here). Neither file is committed; the endpoint is above.
"""
import collections, hashlib, json, sys

SHA = {"sd": "472b78059c94c9083b8f8a64b0acd24ce2d581b4497fb5ce8cddd923575d794f",
       "wh": "f0677dfb3abb8c433e5b55bf6955522a566550b5672795b6ae843ed393bcff24"}
for k, p in (("sd", sys.argv[1]), ("wh", sys.argv[2])):
    assert hashlib.sha256(open(p, "rb").read()).hexdigest() == SHA[k], p
rows = json.load(open(sys.argv[1]))
field = json.load(open(sys.argv[2]))["countries"]["SD"]["months"]
assert len(rows) == 10039

SRC = {"FAMIS, Sudan": "FAMIS", "WFP": "WFP"}
groups = collections.Counter()
for r in rows:
    m = r["period_date"][:7]
    kind = "price" if r["value"] is not None else r["status"]
    groups[(m, SRC[r["source_organization"]], kind, (r["created"] or "")[:10] or None)] += 1

months = sorted({g[0] for g in groups})
out = []
for m in months:
    gs = sorted(([s, k, d, n] for (mm, s, k, d), n in groups.items() if mm == m),
                key=lambda g: (g[1] != "price", g[0], g[1], g[2] or "9"))
    # agreement with the Field's reduction: prices, sources, entry months and missing statuses
    f = field[m]
    assert sum(g[3] for g in gs if g[1] == "price") == f["price"], m
    for s, full in (("FAMIS", "FAMIS, Sudan"), ("WFP", "WFP")):
        assert sum(g[3] for g in gs if g[1] == "price" and g[0] == s) == f["source"].get(full, 0), m
    em = collections.Counter()
    for s, k, d, n in gs:
        if k == "price":
            em[d[:7]] += n
    assert dict(em) == f["entered"], m
    mis = collections.Counter()
    for s, k, d, n in gs:
        if k != "price":
            mis[k] += n
    assert dict(mis) == f["missing"], m
    out.append({"month": m, "groups": gs})

days = collections.Counter()
for (m, s, k, d), n in groups.items():
    if d:
        days[(d, s, k)] += n
written = sorted({d for d, _, _ in days})
summary = {
    "rows": len(rows),
    "prices": sum(n for (m, s, k, d), n in groups.items() if k == "price"),
    "days_written": len(written),
    "no_entry_day": sum(n for (m, s, k, d), n in groups.items() if d is None),
    "silent_from": "2024-09-30", "silent_to": "2026-02-03",
}
# the gap the Field names: no row of any kind written between these two days
assert not [d for d in written if summary["silent_from"] < d < summary["silent_to"]]
json.dump({"source": "FEWS NET data warehouse, marketpricefacts, country SD, fetched 2026-10-28",
           "summary": summary,
           "days": [[d, s, k, n] for (d, s, k), n in sorted(days.items())],
           "months": out}, sys.stdout, separators=(",", ":"))
