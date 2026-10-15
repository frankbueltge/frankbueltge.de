"""Fetch FEMA's IPAWS archive, senders other than the National Weather Service, into a raw cache
shaped as the Studio's build.py reads it (page*.json without the signed XML; references.json from
the XML's <references>). Usage: python3 fetch.py <raw cache dir>. The cache is not committed."""
import json, os, re, sys, time, urllib.request, urllib.parse, hashlib

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
BASE = "https://www.fema.gov/api/open/v1/IpawsArchivedAlerts"
FILT = "sender ne 'w-nws.webmaster@noaa.gov'"
REF = re.compile(r"<references>(.*?)</references>", re.S)
refs, n, skip, top, digest = {}, None, 0, 1000, hashlib.sha256()
while True:
    q = {"$filter": FILT, "$top": top, "$skip": skip, "$orderby": "id", "$inlinecount": "allpages"}
    url = BASE + "?" + urllib.parse.urlencode(q, quote_via=urllib.parse.quote)
    for attempt in range(5):
        try:
            d = json.load(urllib.request.urlopen(url, timeout=180)); break
        except Exception as e:
            print("retry", skip, e, file=sys.stderr); time.sleep(2 ** attempt)
    else:
        raise SystemExit("fetch failed at skip %d" % skip)
    n = d["metadata"]["count"] if n is None else n
    rows = d["IpawsArchivedAlerts"]
    if not rows:
        break
    for r in rows:
        x = r.pop("originalMessage", "") or ""
        digest.update(x.encode())
        m = REF.search(x)
        if m:
            refs[r["id"]] = " ".join(m.group(1).split())
    json.dump(rows, open(f"{OUT}/page{skip // top:04d}.json", "w"))
    skip += len(rows)
    print(skip, "/", n, file=sys.stderr)
json.dump(refs, open(f"{OUT}/references.json", "w"))
json.dump({"count": n, "fetched_rows": skip, "sha256_of_signed_xml": digest.hexdigest()},
          open(f"{OUT}/fetch.json", "w"))
print(n, skip)
