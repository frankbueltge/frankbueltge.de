"""TAKE COVER, AGAIN: fetch every tornado warning the US National Weather Service issued since 2008,
with the office's own verification against its storm reports, from the Iowa Environmental Mesonet's
storm-based warning verification service (IEM "Cow"; NWS products are public domain).

    python3 -I fetch.py RAW_DIR

One request per forecast office, 2008-01-01 to the session's day. Raw files stay outside the
repository; their sizes and SHA-256 go to raw-manifest.json beside this script.
"""
import hashlib, json, sys, time, urllib.request, pathlib, datetime

RAW = pathlib.Path(sys.argv[1]); RAW.mkdir(parents=True, exist_ok=True)
END = datetime.date.today().isoformat()
COW = ("https://mesonet.agron.iastate.edu/api/1/cow.json?wfo={w}&begints=2008-01-01T00:00Z"
       "&endts={e}T00:00Z&phenomena=TO&lsrtype=TO")


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=300) as r:
                return r.read()
        except Exception as ex:  # network: back off and retry
            print("retry", url, ex, file=sys.stderr); time.sleep(2 ** (i + 1))
    raise SystemExit("unreachable: " + url)


wfos = json.loads(get("https://mesonet.agron.iastate.edu/geojson/network/WFO.geojson"))
codes = sorted({(f["properties"].get("sid") or f["id"])[-3:] for f in wfos["features"]})
manifest = {"fetched": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "end": END, "files": {}}
for w in codes:
    p = RAW / f"cow_{w}.json"
    if not p.exists():
        p.write_bytes(get(COW.format(w=w, e=END)))
    b = p.read_bytes()
    manifest["files"][p.name] = {"url": COW.format(w=w, e=END), "bytes": len(b),
                                 "sha256": hashlib.sha256(b).hexdigest()}
    print(w, len(b))
pathlib.Path(__file__).with_name("raw-manifest.json").write_text(json.dumps(manifest, indent=1))
