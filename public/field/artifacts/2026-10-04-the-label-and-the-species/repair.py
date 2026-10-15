"""Second pass for species whose first-pass query failed (proxy resets). Marks them in raw.json['repaired']."""
import json, time, urllib.request
d = json.load(open("data/raw.json")); S = d["species"]
def get(u):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(u, timeout=60))
        except Exception: time.sleep(2 ** i)
    return {}
bad = [k for k, v in S.items() if v["total"] is None or v["ex"] is None or v["cat"] not in ("EXTINCT","EXTINCT_IN_THE_WILD") and not v["cat"].isupper()]
bad += [k for k, v in S.items() if v["cat"] and v["cat"].startswith("<")]
for k in sorted(set(bad)):
    s = get(f"https://api.gbif.org/v1/species/{k}/iucnRedListCategory")
    S[k]["cat"] = s.get("category", S[k]["cat"])
    S[k]["total"] = get(f"https://api.gbif.org/v1/occurrence/search?speciesKey={k}&limit=0").get("count")
    S[k]["ex"] = get(f"https://api.gbif.org/v1/occurrence/search?speciesKey={k}&iucnRedListCategory=EX&limit=0").get("count")
d["repaired"] = sorted(set(bad)); json.dump(d, open("data/raw.json", "w")); print(d["repaired"], [S[k] for k in d["repaired"]])
