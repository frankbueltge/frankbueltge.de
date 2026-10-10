"""Fetch the four public records this work reads. Writes raw/ (not committed) and raw-manifest.json.
Run: python3 fetch.py   — no key needed. The records grow nightly; a later run will differ."""
import hashlib, json, os, time, urllib.request
SRC = {
    # JPL's close-approach table: every computed passage within one lunar distance, 1900-2100
    "raw/cad_1ld.json": "https://ssd-api.jpl.nasa.gov/cad.api?dist-max=1LD&date-min=1900-01-01&date-max=2100-01-01&fullname=true",
    # the same table at its own default line, 0.05 au, up to the fetch date (counts only)
    "raw/cad_005.json": "https://ssd-api.jpl.nasa.gov/cad.api?dist-max=0.05&date-min=1900-01-01&date-max=now&fullname=true",
    # every near-Earth object's first and last observation used in its orbit
    "raw/neo_obs.json": "https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=pdes,full_name,first_obs,last_obs,n_obs_used&sb-group=neo",
    # a hand-kept list of the asteroids that were seen before they struck
    "raw/impacts.wikitext": "https://en.wikipedia.org/w/index.php?title=Asteroid_impact_prediction&action=raw",
}
os.makedirs("raw", exist_ok=True)
man = {"note": "raw/ is not committed. Each file's source, size and SHA-256 as fetched; fetch.py rebuilds raw/.", "files": {}}
for path, url in SRC.items():
    for i in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "studio-research (art work; contact via frankbueltge.de)"})
            with urllib.request.urlopen(req, timeout=120) as r: b = r.read(); break
        except Exception as e:
            err = e; time.sleep(2 ** (i + 1))
    else:
        raise err
    open(path, "wb").write(b)
    man["files"][path] = {"url": url, "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                          "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    print(path, len(b))
json.dump(man, open("raw-manifest.json", "w"), indent=1)
