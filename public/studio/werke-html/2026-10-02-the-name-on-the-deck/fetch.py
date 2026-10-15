"""Fetch the river and the named crossings from OpenStreetMap (Overpass, mirror at maps.mail.ru).
Writes osm-extract.json: only the fields the work uses (id, type, tags used, centre) — a derived table,
not the raw response. Data (c) OpenStreetMap contributors, ODbL 1.0, https://www.openstreetmap.org/copyright
Run: python3 fetch.py   (needs network; analysis.py runs offline from the extract)"""
import json, time, subprocess, hashlib, sys
HOST = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
NAMES = ["Coleman Bridge","Kim Seng Bridge","Elgin Bridge","Cavenagh Bridge","Ord Bridge","Read Bridge",
         "Pulau Saigon Bridge","Anderson Bridge","Clemenceau Bridge","Benjamin Sheares Bridge","Esplanade Bridge",
         "Robertson Bridge","Jiak Kim Bridge","Alkaff Bridge","Helix Bridge","Bayfront Bridge","Jubilee Bridge"]
BB = "(1.2700,103.8300,1.3000,103.8650)"
alt = "|".join(NAMES)
Q_BR = f'[out:json][timeout:60];nwr["name"~"^({alt})$"]{BB}->.a;nwr["bridge:name"~"^({alt})$"]{BB}->.b;(.a;.b;);out tags center;'
Q_RIV = '[out:json][timeout:60];way["waterway"="river"]["name"="Singapore River"];out geom;'
def q(text):
    for i in range(6):
        p = subprocess.run(["curl","-s","-m","90","-A","studio-research/1.0","--data-urlencode","data@-",HOST],
                           input=text.encode(),capture_output=True)
        try:
            return json.loads(p.stdout)
        except Exception:
            time.sleep(8)
    sys.exit("overpass failed")
br = q(Q_BR); rv = q(Q_RIV)
KEEP = ("name","bridge:name","highway","man_made","bridge","railway","building")
out = {"source":"OpenStreetMap via Overpass","licence":"ODbL 1.0, (c) OpenStreetMap contributors",
       "osm_base_timestamp":br["osm3s"]["timestamp_osm_base"],"names":NAMES,
       "elements":[{"type":e["type"],"id":e["id"],"tags":{k:v for k,v in e["tags"].items() if k in KEEP},
                    "lat":(e.get("center") or e)["lat"],"lon":(e.get("center") or e)["lon"]} for e in br["elements"]],
       "river":[[ [round(p["lon"],6),round(p["lat"],6)] for p in w["geometry"]] for w in rv["elements"]],
       "river_way_ids":[w["id"] for w in rv["elements"]]}
out["elements"].sort(key=lambda e:(e["type"],e["id"]))
json.dump(out,open("osm-extract.json","w"),indent=1,ensure_ascii=False)
print(len(out["elements"]),"elements;",len(out["river"]),"river ways;",out["osm_base_timestamp"])
