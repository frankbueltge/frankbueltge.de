"""Fetch the public records this work reads. Writes raw/ (not committed) and raw-manifest.json.
Run: python3 -I fetch.py — no key needed. The small-body database grows nightly; a later run will differ."""
import hashlib, json, os, time, urllib.request
FIELD = "580708b7b367edbf55f63cbfa0a8153124a26df2"  # field-research commit of study 8 (handoff ho-2026-10-11-field-1)
SRC = {
    # the Field's study 8: 20,753 passages within 0.05 au, 1990-2025, with impact parameter b
    "raw/passages.tsv": f"https://raw.githubusercontent.com/frankbueltge/field-research/{FIELD}/artifacts/2026-10-11-how-far-the-record-sees/data/passages.tsv",
    # JPL's close-approach table for the Field's window, to find the rows study 8 had to set aside
    "raw/cad_1990_2025.json": "https://ssd-api.jpl.nasa.gov/cad.api?dist-max=0.05&date-min=1990-01-01&date-max=2025-12-31",
    # every near-Earth object's designation and first observation used in its orbit
    "raw/neo_obs.json": "https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=pdes,full_name,first_obs,last_obs,n_obs_used&sb-group=neo",
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
