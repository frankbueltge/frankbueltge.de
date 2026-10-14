"""Fetch what the second movement of UNDERNEATH reads (added 2026-10-14, session 169).
Writes raw/esa/, raw/field_s12.json, raw/atelier_reader{1,2}.json (not committed) and raw-manifest-written.json.
Run: python3 -I fetch_written.py
1. ESA's NEO Coordination Centre, one 'past impactors' page per predicted strike: the keeper's own account.
2. The Field's study 12, *The strikes that came* (pinned commit): which warned strikes the sensors kept, and their energy.
3. The Atelier's two blind readings of the same ESA pages (pinned commit): how each page writes the people on the ground."""
import hashlib, json, os, time, urllib.request
FIELD_COMMIT = "ba217d35d856eb1d09d2d7654f0f6bf888738493"
ATELIER_COMMIT = "76ea429af50718a3087f669e4f8849289b25f525"
DES = ["2008tc3", "2014aa", "2018la", "2019mo", "2022eb5", "2022wj1", "2023cx1", "2024bx1", "2024rw1", "2024uq", "2024xa1", "2026jn4", "2026rw1"]
SRC = {f"raw/esa/{d}.html": f"https://neo.ssa.esa.int/past-impactors/{d}" for d in DES}
SRC["raw/field_s12.json"] = f"https://raw.githubusercontent.com/frankbueltge/field-research/{FIELD_COMMIT}/artifacts/2026-10-14-the-strikes-that-came/data/results.json"
for n in (1, 2):
    SRC[f"raw/atelier_reader{n}.json"] = f"https://raw.githubusercontent.com/frankbueltge/ulysses/{ATELIER_COMMIT}/window/cycle-007-convening-2/reader{n}.json"
def get(url):
    for i in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "studio-research (art work; contact via frankbueltge.de)"})
            with urllib.request.urlopen(req, timeout=120) as r: return r.read()
        except Exception as e:
            err = e; time.sleep(2 ** (i + 1))
    raise err
os.makedirs("raw/esa", exist_ok=True)
man = {"note": "raw/ is not committed. Each file's source, size and SHA-256 as fetched; fetch_written.py rebuilds it. ESA's pages carry live page furniture, so a later fetch can hash differently while the account text is the same.", "files": {}}
for path, url in SRC.items():
    b = get(url); open(path, "wb").write(b)
    man["files"][path] = {"url": url, "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    print(path, len(b))
json.dump(man, open("raw-manifest-written.json", "w"), indent=1)
