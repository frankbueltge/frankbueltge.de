"""TAKE COVER, AGAIN, increment 3: fetch, for every forecast office and year since 2008, each tornado
warning's life in each county it covered: when it was issued to expire, when it actually ended there,
and the last product the office sent about it (Iowa Environmental Mesonet, VTEC events by office;
NWS products are public domain).

    python3 -I fetch_word.py RAW_DIR

One request per office and year. Raw files stay outside the repository; sizes and SHA-256 go to
word-manifest.json beside this script.
"""
import hashlib, json, sys, time, urllib.request, pathlib, datetime
from concurrent.futures import ThreadPoolExecutor

RAW = pathlib.Path(sys.argv[1]); RAW.mkdir(parents=True, exist_ok=True)
URL = ("https://mesonet.agron.iastate.edu/json/vtec_events_bywfo.py?wfo={w}&year={y}"
       "&phenomena=TO&significance=W")


def get(url, tries=5):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=300) as r:
                return r.read()
        except Exception as ex:  # network: back off and retry
            print("retry", url, ex, file=sys.stderr); time.sleep(2 ** (i + 1))
    raise SystemExit("unreachable: " + url)


wfos = json.loads(get("https://mesonet.agron.iastate.edu/geojson/network/WFO.geojson"))
codes = sorted({(f["properties"].get("sid") or f["id"])[-3:] for f in wfos["features"]})
years = range(2008, datetime.date.today().year + 1)
jobs = [(w, y) for w in codes for y in years]


def one(job):
    w, y = job
    p = RAW / f"ev_{w}_{y}.json"
    if not p.exists():
        p.write_bytes(get(URL.format(w=w, y=y)))
    return job, p


manifest = {"fetched": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "files": {}}
with ThreadPoolExecutor(6) as ex:
    for (w, y), p in ex.map(one, jobs):
        b = p.read_bytes()
        manifest["files"][p.name] = {"url": URL.format(w=w, y=y), "bytes": len(b),
                                     "sha256": hashlib.sha256(b).hexdigest()}
pathlib.Path(__file__).with_name("word-manifest.json").write_text(json.dumps(manifest, indent=1))
print(len(manifest["files"]), "files")
