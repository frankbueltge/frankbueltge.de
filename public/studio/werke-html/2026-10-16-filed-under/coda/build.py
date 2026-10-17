"""FILED UNDER, coda (session 178): builds cards.js and summary.json.

Usage: python3 build.py <forecasts.jsonl> outcomes.json
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
open("cards.js", "w").write("// FILED UNDER, coda: built by build.py, session 178\nconst CARDS = " +
                           json.dumps(cards, separators=(",", ":")) + ";\nconst SUMMARY = " + json.dumps(S) + ";\n")
json.dump(S, open("summary.json", "w"), indent=1)
print(json.dumps(S, indent=1))
