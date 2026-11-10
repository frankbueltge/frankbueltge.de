"""Build data-v.json for THE REMAINDER, movement V (session 208, 2026-10-28): Sudan's grants on the
calendar, July 2024 to December 2025, against the months in which FEWS NET's own archive holds a
food-security analysis for Sudan.

Usage: python3 -I build_v.py data.json <field timeline.json> <field commit> > data-v.json

Grants: every flow in data.json (movement I, FTS, fetched 2026-10-26) that counts toward Sudan's
2024, 2025 or 2026 response plan and is dated inside the eighteen months. Nothing is refetched.
Monitor: the Field's timeline.json (field-research, notes/convening-after-010/dark-months/, session
236, CC0), built from fews.net's sitemap on 2026-10-28. Its own split is kept: "analysis" is a
food-security judgement, "monitor" is prices, calendars and remote sensing.
"""
import json, sys

MONITOR = {"seasonal-monitor", "price-bulletin", "seasonal-calendar", "agroclimatology", "livelihood-zone-map"}
fts, tl, commit = json.load(open(sys.argv[1])), json.load(open(sys.argv[2])), sys.argv[3]
months = tl["months"]
lo, hi = months[0], months[-1]
sd = next(r for r in tl["rows"] if r["country"] == "sudan")
eye = []
for m in months:
    p = sd["products"].get(m, [])
    eye.append({"month": m, "analysis": [t for t in p if t not in MONITOR], "monitor": [t for t in p if t in MONITOR],
                "countries_with_analysis": tl["countries_with_product"][m]["analysis"]})
donors, ix, grants = [], {}, []
for y in fts["years"]:
    if y["year"] not in (2024, 2025, 2026):
        continue
    for amt, date, d, paid in y["flows"]:
        if not lo <= date[:7] <= hi:
            continue
        name = fts["donors"][d]
        if name not in ix:
            ix[name] = len(donors)
            donors.append(name)
        grants.append([amt, date, ix[name], paid, y["year"]])
grants.sort(key=lambda g: (g[1], -g[0]))
dark = [e["month"] for e in eye if not e["analysis"]]
print(json.dumps({
    "grants_source": "data.json of this étude (OCHA FTS, fetched " + fts["fetched"] + "; CC BY-IGO)",
    "monitor_source": "field-research notes/convening-after-010/dark-months/timeline.json at " + commit + " (CC0; fews.net sitemap, read 2026-10-28)",
    "grant_fields": ["amountUSD", "date", "donor index", "paid=1 / commitment=0", "plan year"],
    "countries_read": tl["countries"],
    "months": eye, "months_without_analysis": dark,
    "donors": donors, "grants": grants}, separators=(",", ":")))
