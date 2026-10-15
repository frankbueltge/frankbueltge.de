"""Where does each of the Singapore River's seventeen named crossings keep its name?
Offline: reads osm-extract.json (fetch.py) and the Wikipedia list recorded below. Writes results.json.
Three places a name can live in the map (OpenStreetMap):
  DECK  - a way you travel along (highway=*) whose own name is the bridge's name
  TAG   - a way you travel along that carries the road's name and holds the bridge's name only in bridge:name
  BODY  - the structure itself (man_made=bridge), named, which no route runs along
A crossing's SPOKEN name is the one a router reading way names aloud would say: DECK if any, else the road names."""
import json, hashlib, re
raw = open("osm-extract.json","rb").read()
X = json.loads(raw)
# Wikipedia, 'Singapore River', bulleted bridge list as read 2026-10-02 (names and year first opened; MRT lines and tunnel omitted)
WIKI = [("Coleman Bridge","1840/1985"),("Kim Seng Bridge","1862"),("Elgin Bridge","1862/1926"),("Cavenagh Bridge","1870"),
        ("Ord Bridge","1886"),("Read Bridge","1889"),("Pulau Saigon Bridge","1890"),("Anderson Bridge","1910"),
        ("Clemenceau Bridge","1940"),("Benjamin Sheares Bridge","1981"),("Esplanade Bridge","1997"),("Robertson Bridge","1998"),
        ("Jiak Kim Bridge","1999"),("Alkaff Bridge","1999"),("Helix Bridge","2010"),("Bayfront Bridge","2010"),("Jubilee Bridge","2015")]
assert [w[0] for w in WIKI] == X["names"]
def first_year(s): return int(re.split(r"/",s)[0])
rows=[]
for name,yr in WIKI:
    el=X["elements"]
    body=[e for e in el if e["tags"].get("name")==name and e["tags"].get("man_made")=="bridge"]
    deck=[e for e in el if e["tags"].get("name")==name and "highway" in e["tags"] and e["tags"]["highway"] not in ("bus_stop",)]
    tag=[e for e in el if e["tags"].get("bridge:name")==name and "highway" in e["tags"]]
    roads=sorted({e["tags"]["name"] for e in tag if e["tags"].get("name")!=name})
    c=body[0] if body else (deck or tag)[0]
    rows.append(dict(name=name,year=yr,first_year=first_year(yr),body=len(body),deck=len(deck),tag=len(tag),
                     tag_roads=roads,spoken="deck" if deck else ("road" if tag else "silent"),
                     lat=c["lat"],lon=c["lon"]))
n=len(rows)
spoken=[r for r in rows if r["spoken"]=="deck"]; road=[r for r in rows if r["spoken"]=="road"]; silent=[r for r in rows if r["spoken"]=="silent"]
res=dict(osm_extract_sha256=hashlib.sha256(raw).hexdigest(),osm_base_timestamp=X["osm_base_timestamp"],
         n=n,rows=rows,
         n_body=sum(1 for r in rows if r["body"]),n_deck=len(spoken),n_road=len(road),n_silent=len(silent),
         deck_names=[r["name"] for r in spoken],road_names=[r["name"] for r in road],silent_names=[r["name"] for r in silent],
         median_year_deck=sorted(r["first_year"] for r in spoken)[len(spoken)//2] if spoken else None,
         median_year_road=sorted(r["first_year"] for r in road)[len(road)//2] if road else None,
         river_ways=len(X["river"]),river_points=sum(len(w) for w in X["river"]))
json.dump(res,open("results.json","w"),indent=1,ensure_ascii=False)
for r in rows: print(f'{r["name"]:24} {r["year"]:10} body={r["body"]} deck={r["deck"]} tag={r["tag"]} -> {r["spoken"]:6} {r["tag_roads"]}')
print({k:res[k] for k in ("n","n_body","n_deck","n_road","n_silent","median_year_deck","median_year_road")})
