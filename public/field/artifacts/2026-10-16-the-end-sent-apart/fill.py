"""Study 20: repair a skip-paged raw cache. Usage: python3 fill.py <raw cache dir>
Study 17's fetch.py pages by $skip over a live archive; on 2026-10-16 that returned 63 messages twice
and 63 never. This lists every id (twice, by the same paging over a light $select, until two passes
agree), refetches each missing message by id in fetch.py's shape, drops the duplicates, and rewrites
the cache as one page. Logged to <raw>/fill.json."""
import json, glob, sys, re, time, urllib.request, urllib.parse
RAW = sys.argv[1]
BASE = "https://www.fema.gov/api/open/v1/IpawsArchivedAlerts"
FILT = "sender ne 'w-nws.webmaster@noaa.gov'"
REF = re.compile(r"<references>(.*?)</references>", re.S)
def get(q):
    url = BASE + "?" + urllib.parse.urlencode(q, quote_via=urllib.parse.quote)
    for a in range(5):
        try: return json.load(urllib.request.urlopen(url, timeout=180))
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(2 ** a)
    raise SystemExit("fetch failed")
def ids():
    out, skip = set(), 0
    while True:
        d = get({"$filter": FILT, "$select": "id", "$top": 10000, "$skip": skip, "$orderby": "id"})
        r = d["IpawsArchivedAlerts"]
        if not r: return out
        out |= {x["id"] for x in r}; skip += len(r)
passes = [ids(), ids()]
while passes[-1] != passes[-2] and len(passes) < 6: passes.append(ids())
ALL = passes[-1] | passes[-2]
rows = []
for f in sorted(glob.glob(f"{RAW}/page*.json")): rows += json.load(open(f))
have = {}
for r in rows: have.setdefault(r["id"], r)
refs = json.load(open(f"{RAW}/references.json"))
missing = sorted(ALL - set(have))
for i in missing:
    d = get({"$filter": f"id eq '{i}'"})["IpawsArchivedAlerts"]
    assert len(d) == 1, (i, len(d))
    r = d[0]; x = r.pop("originalMessage", "") or ""
    m = REF.search(x)
    if m: refs[r["id"]] = " ".join(m.group(1).split())
    have[r["id"]] = r
for f in glob.glob(f"{RAW}/page*.json"): __import__("os").remove(f)
json.dump(list(have.values()), open(f"{RAW}/page0000.json", "w"))
json.dump(refs, open(f"{RAW}/references.json", "w"))
log = {"rows_before": len(rows), "unique_before": len(set(r["id"] for r in rows)), "id_passes": [len(p) for p in passes],
       "passes_agree": passes[-1] == passes[-2], "missing_refetched": len(missing), "rows_after": len(have),
       "in_cache_not_in_listing": len(set(have) - ALL)}
json.dump(log, open(f"{RAW}/fill.json", "w")); print(log)
