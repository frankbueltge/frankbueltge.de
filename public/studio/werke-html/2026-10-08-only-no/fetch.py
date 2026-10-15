"""Fetch every Manifold binary market whose question matches the human-extinction search terms.
Writes raw/search.json (market list) — public API, no key. Run: python3 fetch.py"""
import json, os, time, urllib.parse, urllib.request
TERMS = ["human extinction", "humanity extinct", "wipe out humanity", "AI kill everyone",
         "everyone dies", "AI extinction", "humans extinct", "existential catastrophe",
         "kill all humans", "end of humanity", "AI doom", "human race extinct",
         "cause human extinction", "humanity survive", "AI apocalypse", "AI wipe out"]
API = "https://api.manifold.markets/v0"
def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r: return json.load(r)
        except Exception as e:
            time.sleep(2 ** (i + 1)); err = e
    raise err
os.makedirs("raw", exist_ok=True)
seen = {}
for t in TERMS:
    for off in range(0, 1000, 100):
        q = urllib.parse.urlencode({"term": t, "limit": 100, "offset": off, "filter": "all", "contractType": "BINARY"})
        page = get(f"{API}/search-markets?{q}")
        for m in page: seen[m["id"]] = m
        if len(page) < 100: break
        time.sleep(0.3)
json.dump({"fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "terms": TERMS,
           "markets": sorted(seen.values(), key=lambda m: m["createdTime"])}, open("raw/search.json", "w"))
print(len(seen))
