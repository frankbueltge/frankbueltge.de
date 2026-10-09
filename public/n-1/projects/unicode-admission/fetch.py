"""Fetch the Unicode/CLDR source files into a scratch directory and record sha256. Usage: python3 -I fetch.py OUTDIR"""
import sys, os, hashlib, urllib.request, json
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = "https://www.unicode.org/Public/UCD/latest/ucd/"
C = "https://raw.githubusercontent.com/unicode-org/cldr/main/common/supplemental/"
files = {
 "DerivedAge.txt": U+"DerivedAge.txt",
 "Scripts.txt": U+"Scripts.txt",
 "PropertyValueAliases.txt": U+"PropertyValueAliases.txt",
 "enumeratedversions.html": "https://www.unicode.org/versions/enumeratedversions.html",
 "supplementalData.xml": C+"supplementalData.xml",
 "likelySubtags.xml": C+"likelySubtags.xml",
}
man = {}
for n, u in files.items():
    d = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "remainder-n-1"}), timeout=60).read()
    open(os.path.join(out, n), "wb").write(d)
    man[n] = {"url": u, "bytes": len(d), "sha256": hashlib.sha256(d).hexdigest()}
json.dump(man, open("sources.json", "w"), indent=1)
print(json.dumps(man, indent=1))
