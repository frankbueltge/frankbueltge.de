"""Species-level category, per-species EX share, Wikidata status for every species with EX-labelled GBIF occurrences."""
import json, time, urllib.request, urllib.parse, datetime
from concurrent.futures import ThreadPoolExecutor
raw = json.load(open("artifacts/2026-10-03-after-the-last-seen/data/raw.json"))
keys = sorted(int(k) for k in raw["sp_all"]); listed = set(int(k) for k in raw["kingdom"])
def get(u, hdr=None):
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=hdr or {}), timeout=60))
        except Exception as e:
            err = str(e); time.sleep(2 ** i)
    return {"_error": err}
def one(k):
    s = get(f"https://api.gbif.org/v1/species/{k}/iucnRedListCategory")
    tot = get(f"https://api.gbif.org/v1/occurrence/search?speciesKey={k}&limit=0")
    ex = get(f"https://api.gbif.org/v1/occurrence/search?speciesKey={k}&iucnRedListCategory=EX&limit=0")
    return k, {"cat": s.get("category", s.get("_error")), "name": s.get("scientificName"),
               "total": tot.get("count"), "ex": ex.get("count"), "listed": k in listed}
with ThreadPoolExecutor(8) as p: res = dict(p.map(one, keys))
wd = {}
H = {"User-Agent": "field-research-meridian/1.0 (research; https://frankbueltge.de)"}
for i in range(0, len(keys), 100):
    vals = " ".join(f'"{k}"' for k in keys[i:i+100])
    q = f'SELECT ?g ?i ?s ?sl WHERE {{ VALUES ?g {{ {vals} }} ?i wdt:P846 ?g. OPTIONAL{{?i wdt:P141 ?s. ?s rdfs:label ?sl FILTER(lang(?sl)="en")}} }}'
    d = get("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q), H)
    for b in d.get("results", {}).get("bindings", []):
        e = wd.setdefault(b["g"]["value"], {"item": b["i"]["value"], "status": []})
        if "sl" in b: e["status"].append(b["sl"]["value"])
    time.sleep(1)
json.dump({"fetched": datetime.datetime.utcnow().isoformat() + "Z", "species": res, "wikidata": wd}, open("artifacts/2026-10-04-the-label-and-the-species/data/raw.json", "w"))
print(len(res), len(wd))
