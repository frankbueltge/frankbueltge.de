#!/usr/bin/env python3
"""IN THE WAY — the instrument.

Fetches three published catalogues through the VizieR table access protocol and
two catalogue descriptions (ReadMe files) from the CDS FTP mirror, and writes
them to a cache OUTSIDE this repository.  Nothing fetched here is committed:
the repository carries `sources.json` — url, query, byte count, SHA-256, row
count, the hour it was read — and the derived measurements, never the source
tables.

    python3 harvest.py            # fetch; refuses to overwrite a good cache
    python3 harvest.py --force    # fetch again
    python3 harvest.py --offline  # verify the cache against sources.json

Cache: $ENSEMBLE_CACHE or ~/.cache/ensemble/in-the-way
"""
import argparse, hashlib, json, os, pathlib, sys, time, urllib.parse, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
CACHE = pathlib.Path(os.environ.get("ENSEMBLE_CACHE",
                                    pathlib.Path.home() / ".cache" / "ensemble" / "in-the-way"))
TAP = "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync"
AGENT = "Ensemble/studio (art practice; frankbueltge.de) - one pass, catalogue queries"

QUERIES = {
    # The 2MASS Redshift Survey (Huchra et al. 2012, ApJS 199, 26): the input
    # catalogue, 44 599 galaxies, Ks<=11.75 and |b|>=5 deg (>=8 toward the bulge).
    "t2mrs.csv": (
        'SELECT recno, ID, RAJ2000, DEJ2000, GLON, GLAT, Kcmag, Ktmag, '
        '"E(B-V)" AS EBV, cz FROM "J/ApJS/199/26/table3"'),
    # HIZOA-S (Staveley-Smith et al. 2016, AJ 151, 52): 883 galaxies found by
    # their 21 cm line behind the southern Milky Way, 212<l<36 deg, |b|<5 deg.
    "hizoa_s.csv": (
        'SELECT recno, HIZOA, RAJ2000, DEJ2000, GLON, GLAT, "E(B-V)" AS EBV, '
        'HRV, logMHI FROM "J/AJ/151/52/table2"'),
    # HIZOA-N (Donley et al. 2005, AJ 129, 220): the northern extension.
    "hizoa_n.csv": (
        'SELECT recno, HIZOA, RAJ2000, DEJ2000, cz, Dist, logMHI '
        'FROM "J/AJ/129/220/table1"'),
}
READMES = {
    "readme_2mrs.txt": "https://cdsarc.cds.unistra.fr/ftp/J/ApJS/199/26/ReadMe",
    "readme_hizoa_s.txt": "https://cdsarc.cds.unistra.fr/ftp/J/AJ/151/52/ReadMe",
    "readme_hizoa_n.txt": "https://cdsarc.cds.unistra.fr/ftp/J/AJ/129/220/ReadMe",
    # one object's position, asked of the name resolver rather than assumed
    "simbad_a3627.txt": ("https://simbad.cds.unistra.fr/simbad/sim-id?"
                         "Ident=ACO+3627&output.format=ASCII"),
}
PAUSE = 6.0  # seconds between requests to a public service


def get(url, data=None):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def digest(b):
    return hashlib.sha256(b).hexdigest()


def fetch(force):
    CACHE.mkdir(parents=True, exist_ok=True)
    manifest = {"fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "service": TAP, "agent": AGENT, "requests": 0, "files": {}}
    n = 0
    for name, query in QUERIES.items():
        path = CACHE / name
        if path.exists() and not force:
            body = path.read_bytes()
        else:
            if n:
                time.sleep(PAUSE)
            body = get(TAP, urllib.parse.urlencode({
                "REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv",
                "MAXREC": "200000", "QUERY": query}).encode())
            path.write_bytes(body)
            n += 1
        rows = body.decode().rstrip("\n").count("\n")
        manifest["files"][name] = {"query": query, "url": TAP, "bytes": len(body),
                                   "sha256": digest(body), "rows": rows}
    for name, url in READMES.items():
        path = CACHE / name
        if path.exists() and not force:
            body = path.read_bytes()
        else:
            if n:
                time.sleep(PAUSE)
            body = get(url)
            path.write_bytes(body)
            n += 1
        manifest["files"][name] = {"url": url, "bytes": len(body), "sha256": digest(body)}
    manifest["requests"] = n
    return manifest


def verify():
    man = json.loads((HERE / "sources.json").read_text())
    bad = 0
    for name, rec in man["files"].items():
        path = CACHE / name
        if not path.exists():
            print(f"  MISSING  {name}")
            bad += 1
            continue
        d = digest(path.read_bytes())
        ok = d == rec["sha256"]
        print(f"  {'ok ' if ok else 'DIFF'}     {name}  {rec['bytes']} bytes")
        bad += 0 if ok else 1
    print("cache verified" if not bad else f"{bad} file(s) wrong")
    return bad


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--offline", action="store_true")
    a = ap.parse_args()
    if a.offline:
        sys.exit(1 if verify() else 0)
    man = fetch(a.force)
    (HERE / "sources.json").write_text(json.dumps(man, indent=1) + "\n")
    print(f"cache: {CACHE}")
    for k, v in man["files"].items():
        print(f"  {k:18s} {v['bytes']:>9d} bytes  {v.get('rows', '')}")
    print(f"requests made: {man['requests']}")
