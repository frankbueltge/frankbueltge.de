"""For each market in the selection rule (select.py), fetch its full record and all its bets.
Writes raw/markets/<id>.json and raw/bets/<id>.json. Public API, no key."""
import json, os, time, urllib.request
from select_rule import selected
API = "https://api.manifold.markets/v0"
def get(url):
    err = None
    for i in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r: return json.load(r)
        except Exception as e:
            err = e; time.sleep(2 ** (i + 1))
    raise err
os.makedirs("raw/markets", exist_ok=True); os.makedirs("raw/bets", exist_ok=True)
for m in selected():
    mid = m["id"]
    json.dump(get(f"{API}/market/{mid}"), open(f"raw/markets/{mid}.json", "w"))
    bets, before = [], None
    while True:
        url = f"{API}/bets?contractId={mid}&limit=1000" + (f"&before={before}" if before else "")
        page = get(url); bets += page
        if len(page) < 1000: break
        before = page[-1]["id"]; time.sleep(0.3)
    json.dump(bets, open(f"raw/bets/{mid}.json", "w"))
    print(mid, len(bets), m["question"][:60])
