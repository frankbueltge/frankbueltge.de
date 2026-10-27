"""GOING OUT: fetch every Globe at Night report, 2006 to 2025, and the Yale Bright Star Catalogue.

    python3 -I fetch.py RAW_DIR

Globe at Night (NOIRLab) publishes one CSV per year under CC BY 4.0
(https://globeatnight.org/maps-data/). The Bright Star Catalogue, 5th revised edition
(Hoffleit & Warren 1991), is served by CDS Strasbourg as VizieR V/50. Raw files stay outside
the repository; their sizes and SHA-256 go to raw-manifest.json beside this script.
"""
import hashlib, json, sys, time, urllib.request, pathlib, datetime

RAW = pathlib.Path(sys.argv[1]); RAW.mkdir(parents=True, exist_ok=True)
GAN = {2025: 1190, 2024: 926, 2023: 661, 2022: 662, 2021: 663, 2020: 679, 2019: 665, 2018: 666,
       2017: 667, 2016: 668, 2015: 669, 2014: 670, 2013: 671, 2012: 672, 2011: 673, 2010: 674,
       2009: 675, 2008: 676, 2007: 677, 2006: 678}
URLS = {f"GaN{y}.csv": f"https://globeatnight.org/documents/{d}/GaN{y}.csv" for y, d in GAN.items()}
URLS["bsc5.dat.gz"] = "https://cdsarc.cds.unistra.fr/ftp/V/50/catalog.gz"


def get(url, tries=4):
    for i in range(tries):
        try:  # urllib follows the site's redirect to its file store
            with urllib.request.urlopen(url, timeout=300) as r:
                return r.read()
        except Exception as ex:
            print("retry", url, ex, file=sys.stderr); time.sleep(2 ** (i + 1))
    raise SystemExit("unreachable: " + url)


manifest = {"fetched": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "files": {}}
for name, url in sorted(URLS.items()):
    b = get(url); (RAW / name).write_bytes(b)
    manifest["files"][name] = {"url": url, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    print(name, len(b))
pathlib.Path(__file__).with_name("raw-manifest.json").write_text(json.dumps(manifest, indent=1))
