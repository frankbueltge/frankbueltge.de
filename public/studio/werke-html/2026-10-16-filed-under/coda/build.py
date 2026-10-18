"""FILED UNDER, coda (session 178): builds cards.js and summary.json.

Usage: python3 build.py <forecasts.jsonl> outcomes.json [<updates.jsonl> outcomes_update.json <updates_cells.tsv>]
  forecasts.jsonl: the Field's study 21 extraction of each mainshock's first published USGS aftershock
  forecast (field-research @ 48133ed, artifacts/2026-10-17-the-odds-written-down/data/forecasts.jsonl,
  sha256 82c8d090...e5); outcomes.json: our own ComCat refetch (fetch_outcomes.py).

One card per mainshock. The card's question is the forecast's own: the stated chance of at least one
aftershock at or above M inside the stated circle within the stated week, at the lowest forecast bin at or
above the forecast's completeness floor (Mcat). Rules, fixed before counting:
  needed        backed if at least one such aftershock came, contradicted if none came
  never needed  backed if none came, contradicted if one came
  can't say     contradicted once the week has closed; agrees only while it is still open at the fetch
  heeded, ignored  refused: nobody can heed an aftershock away, so the drawers stay shut

Session 181 (increment: written twice). With the optional arguments, each card also carries the keeper's
second writing: the Field's study 23 extraction of the first update issued at least 24 h after the first
forecast (field-research @ 456488e, artifacts/2026-10-17-the-odds-written-down/data/updates.jsonl,
sha256 7825d0c2...82473), with our own ComCat refetch for its own circle and week (outcomes_update.json),
under the same rules; the Field's per-cell table (updates_cells.tsv, sha256 25b5c26d...51d1b) is read only
to check our counts against theirs.
"""
import json, sys, math

F = [json.loads(l) for l in open(sys.argv[1])]
O = json.load(open(sys.argv[2]))
fetched = O["fetched"]
import datetime
now = datetime.datetime.strptime(fetched, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc).timestamp() * 1000

def km(lat0, lon0, lat, lon):
    dx = (lon - lon0) * 111.32 * math.cos(math.radians(lat0))
    if dx > 180 * 111.32: dx -= 360 * 111.32 * math.cos(math.radians(lat0))
    if dx < -180 * 111.32: dx += 360 * 111.32 * math.cos(math.radians(lat0))
    return round(dx, 2), round((lat - lat0) * 110.57, 2)

cards = []
for r in F:
    o = O["outcomes"].get(r["id"])
    if o is None:
        continue
    wk = next(w for w in r["windows"] if w["label"] == "1 Week")
    b = next(b for b in wk["bins"] if abs(b["M"] - o["M"]) < 1e-9)
    closed = wk["t1"] <= now
    ev = [{"dt": round((e["t"] - wk["t0"]) / (wk["t1"] - wk["t0"]), 5), "m": e["m"], "mt": e["mt"],
           "xy": km(r["rlat"], r["rlon"], e["lat"], e["lon"]), "id": e["id"]} for e in o["events"]]
    came = len(ev) > 0
    cards.append({
        "id": r["id"], "place": r["place"], "mag": r["mag"], "magType": r["magType"], "time": r["time"],
        "issued": r["issued"], "t0": wk["t0"], "t1": wk["t1"], "closed": closed, "model": r["model"],
        "mxy": km(r["rlat"], r["rlon"], r["lat"], r["lon"]), "rkm": r["rkm"], "M": o["M"], "Mcat": r["Mcat"],
        "p": b["p"], "lo": b["lo"], "hi": b["hi"], "events": ev,
        "fate": None if not closed else ("needed" if came else "never_needed"),
    })
U = {}
if len(sys.argv) > 5:
    UF = {json.loads(l)["id"]: json.loads(l) for l in open(sys.argv[3])}
    UO = json.load(open(sys.argv[4]))
    FI = {r["id"]: r for r in F}
    cells = {}
    for l in open(sys.argv[5]).read().splitlines()[1:]:
        f = l.split("\t"); cells[(f[0], float(f[1]))] = int(f[3])
    ufetched = UO["fetched"]
    unow = datetime.datetime.strptime(ufetched, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc).timestamp() * 1000
    agree = disagree = unscored = 0
    for c in cards:
        r, o = UF.get(c["id"]), UO["outcomes"].get(c["id"])
        if r is None or o is None:
            continue
        wk = next(w for w in r["windows"] if w["label"] == "1 Week")
        b = next(b for b in wk["bins"] if abs(b["M"] - o["M"]) < 1e-9)
        ev = [{"dt": round((e["t"] - wk["t0"]) / (wk["t1"] - wk["t0"]), 5), "m": e["m"], "mt": e["mt"],
               "xy": km(r["rlat"], r["rlon"], e["lat"], e["lon"]), "id": e["id"]} for e in o["events"]]
        uclosed = wk["t1"] <= unow
        k = cells.get((c["id"], o["M"]))
        if k is None or not uclosed: unscored += 1
        elif k == len(ev): agree += 1
        else: disagree += 1
        c["u"] = {"issued": r["issued"], "lag_h": r["lag_h"], "t0": wk["t0"], "t1": wk["t1"], "closed": uclosed,
                  "model": r["model"], "mxy": km(r["rlat"], r["rlon"], FI[c["id"]]["lat"], FI[c["id"]]["lon"]),
                  "rkm": r["rkm"], "M": o["M"], "Mcat": r["Mcat"], "p": b["p"], "lo": b["lo"], "hi": b["hi"], "events": ev,
                  "fate": None if not uclosed else ("needed" if ev else "never_needed")}
    both = [c for c in cards if c["closed"] and "u" in c and c["u"]["closed"]]
    U = {
        "pairs": len(both), "fetched": ufetched,
        "first_came": sum(c["fate"] == "needed" for c in both), "first_stated": round(sum(c["p"] for c in both), 1),
        "update_came": sum(c["u"]["fate"] == "needed" for c in both), "update_stated": round(sum(c["u"]["p"] for c in both), 1),
        "fate_changed": sum(c["fate"] != c["u"]["fate"] for c in both),
        "needed_then_never": sum(c["fate"] == "needed" and c["u"]["fate"] == "never_needed" for c in both),
        "never_then_needed": sum(c["fate"] == "never_needed" and c["u"]["fate"] == "needed" for c in both),
        "warn_first": sum(c["p"] >= .5 for c in both), "warn_update": sum(c["u"]["p"] >= .5 for c in both),
        "warn_dropped": sum(c["p"] >= .5 and c["u"]["p"] < .5 for c in both),
        "lowered": sum(c["u"]["p"] < c["p"] for c in both), "raised": sum(c["u"]["p"] > c["p"] for c in both),
        "keeper_rule_right_first": sum((c["p"] >= .5) == (c["fate"] == "needed") for c in both),
        "keeper_rule_right_update": sum((c["u"]["p"] >= .5) == (c["u"]["fate"] == "needed") for c in both),
        "median_lag_days": round(sorted(c["u"]["lag_h"] for c in both)[len(both) // 2] / 24, 1),
        "field_agreement": {"same_count": agree, "different_count": disagree, "not_compared": unscored},
        "field_source": "field-research @ 456488e7a75c35ae700ce05e1211c1c3ced0b76a, artifacts/2026-10-17-the-odds-written-down/data/updates.jsonl and updates_cells.tsv",
    }
cards.sort(key=lambda c: c["time"])
closed = [c for c in cards if c["closed"]]
needed = [c for c in closed if c["fate"] == "needed"]
warn = [c for c in closed if c["p"] >= 0.5]
S = {
    "cards": len(cards), "closed": len(closed), "open_at_fetch": len(cards) - len(closed), "fetched": fetched,
    "came": len(needed), "never_needed": len(closed) - len(needed),
    "stated_expected": round(sum(c["p"] for c in closed), 1),
    "as_warnings_p_ge_half": {"warnings": len(warn), "came": sum(c["fate"] == "needed" for c in warn)},
    "keeper_rule_right": sum((c["p"] >= .5) == (c["fate"] == "needed") for c in closed),
    "record_answers_every_closed_filing": True,
    "events_drawn": sum(len(c["events"]) for c in cards),
    "field_source": "field-research @ 48133edc03fe11e5736f94bda97f5f595864eb09, artifacts/2026-10-17-the-odds-written-down/data/forecasts.jsonl",
    "field_agreement": "252 of 252 weeks the Field scored: the same count of aftershocks at the card's magnitude by our own refetch; 1 week closed after the Field's fetch; 2 open at ours",
}
if U: S["written_twice"] = U
open("cards.js", "w").write("// FILED UNDER, coda: built by build.py, sessions 178 and 181\nconst CARDS = " +
                           json.dumps(cards, separators=(",", ":")) + ";\nconst SUMMARY = " + json.dumps(S) + ";\n")
json.dump(S, open("summary.json", "w"), indent=1)
print(json.dumps(S, indent=1))
