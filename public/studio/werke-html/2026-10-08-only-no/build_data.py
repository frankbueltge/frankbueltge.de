"""Builds data.json for the page from raw/ (fetched by fetch.py and fetch_detail.py).
Classification is by reading each market's resolution text (see CLASS below); the rule is
stated in README.md. Prices are Manifold's own probAfter series, downsampled for drawing."""
import json, datetime
from select_rule import selected
# Markets whose title matches the rule but whose YES does not require humanity to be gone,
# by their own descriptions (read 2026-10-08):
NOT_EXTINCTION = {
  "YTejAGcSAh1wCuqoiJ7R": "YES meant a robot knocking a human off a skateboard, surfboard or snowboard (a pun on 'wipe out').",
  "4f6eGcou5yjeAUlFJBQF": "YES meant a robot knocking a human off a skateboard, surfboard or snowboard (a pun on 'wipe out').",
  "ELrR2JtpGGhxJCZqvNQl": "'IA' is the state of Iowa.",
  "E9d9REtq6A": "YES meant one market's price standing above another's at the end of 2025.",
}
NA_BY_DESIGN = {"i95HLfK9N6hu5H7orfNj": "Resolves N/A on 1 January 2027 and rolls back every trade, by its creator's stated design."}
def iso(ms): return datetime.datetime.fromtimestamp(ms/1000, datetime.UTC).strftime("%Y-%m-%d") if ms else None
rows = []
for m0 in selected():
    mid = m0["id"]; m = json.load(open(f"raw/markets/{mid}.json")); bets = json.load(open(f"raw/bets/{mid}.json"))
    bets = sorted([b for b in bets if b.get("probAfter") is not None], key=lambda b: b["createdTime"])
    yes_in = sum(b["amount"] for b in bets if b.get("outcome") == "YES" and b["amount"] > 0 and not b.get("isRedemption"))
    no_in = sum(b["amount"] for b in bets if b.get("outcome") == "NO" and b["amount"] > 0 and not b.get("isRedemption"))
    # price series: one point per day (last trade of the day), plus first and last
    by_day = {}
    for b in bets: by_day[iso(b["createdTime"])] = round(b["probAfter"], 4)
    series = sorted(by_day.items())
    cls = "not-extinction" if mid in NOT_EXTINCTION else "na-by-design" if mid in NA_BY_DESIGN else "ledger"
    rows.append({
      "id": mid, "q": m["question"].strip(), "url": m["url"], "creator": m.get("creatorUsername"),
      "created": iso(m["createdTime"]), "close": iso(m.get("closeTime")),
      "resolved": bool(m.get("isResolved")), "resolution": m.get("resolution"), "resolved_on": iso(m.get("resolutionTime")),
      "prob_now": round(m.get("probability", 0), 4), "bettors": m.get("uniqueBettorCount"),
      "volume": round(m.get("volume", 0)), "yes_staked": round(yes_in), "no_staked": round(no_in), "trades": len(bets),
      "last_price_before_resolution": series[-1][1] if series else None,
      "class": cls, "note": NOT_EXTINCTION.get(mid) or NA_BY_DESIGN.get(mid), "series": series,
    })
rows.sort(key=lambda r: (r["close"] or "9999", r["created"]))
fetched = json.load(open("raw/search.json"))["fetched_utc"]
led = [r for r in rows if r["class"] == "ledger"]
summary = {
  "fetched_utc": fetched, "matched_by_title": len(rows), "ledger": len(led),
  "ledger_resolved": sum(r["resolved"] for r in led),
  "ledger_resolved_by": {k: sum(1 for r in led if r["resolution"] == k) for k in ("NO", "YES", "CANCEL", "MKT")},
  "ledger_open": sum(not r["resolved"] for r in led),
  "yes_staked_in_resolved": sum(r["yes_staked"] for r in led if r["resolved"]),
  "yes_staked_in_open": sum(r["yes_staked"] for r in led if not r["resolved"]),
  "bettors_sum_ledger": sum(r["bettors"] or 0 for r in led),
  "not_extinction": len(NOT_EXTINCTION), "na_by_design": len(NA_BY_DESIGN),
}
json.dump({"summary": summary, "markets": rows}, open("data.json", "w"), separators=(",", ":"))
print(json.dumps(summary, indent=1))
for r in led: print(r["close"], r["resolution"], r["last_price_before_resolution"], r["yes_staked"], r["bettors"], r["q"][:60])
