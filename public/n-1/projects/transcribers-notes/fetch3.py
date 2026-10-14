"""Project 7, session 3: fetch the HTML edition of every sampled book whose text file carries a note (SESSION3.md).

Usage: python3 fetch3.py <scratch_dir>
Reads session1_verified.json and session1_rest.json; writes <scratch_dir>/html/pg<n>-images.html and sources3.json.
Order: S (silent), then L (listing), then O (other). One request at a time, at most two per second. Failures logged, not replaced.
"""
import hashlib, json, os, sys, time, urllib.request

SCRATCH = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
MIRROR = "https://gutenberg.pglaf.org/cache/epub/{n}/pg{n}-images.html"
rows = json.load(open(os.path.join(HERE, "session1_verified.json")))["rows"] + json.load(open(os.path.join(HERE, "session1_rest.json")))["rows"]
noted = [r for r in rows if r["note"]]
S = [r["id"] for r in noted if r["silent"]]
L = [r["id"] for r in noted if r["listed"] > 0]
O = [r["id"] for r in noted if not r["silent"] and r["listed"] == 0]
os.makedirs(os.path.join(SCRATCH, "html"), exist_ok=True)
sources = {}
out = os.path.join(HERE, "sources3.json")
for k, (g, i) in enumerate([("S", i) for i in S] + [("L", i) for i in L] + [("O", i) for i in O]):
    path = os.path.join(SCRATCH, "html", f"pg{i}-images.html")
    if not os.path.exists(path):
        t0 = time.time()
        try:
            data = urllib.request.urlopen(MIRROR.format(n=i), timeout=60).read()
            open(path, "wb").write(data)
        except Exception as e:
            sources[i] = {"group": g, "error": str(e)[:120]}
            continue
        time.sleep(max(0, 0.5 - (time.time() - t0)))
    sources[i] = {"group": g, "sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(), "bytes": os.path.getsize(path)}
    if k % 25 == 0:
        print(k, g, i, time.strftime("%H:%M:%S", time.gmtime()), flush=True)
        json.dump({"mirror": MIRROR, "fetched": "2026-10-14", "groups": {"S": len(S), "L": len(L), "O": len(O)}, "files": sources},
                  open(out, "w"), indent=0)
json.dump({"mirror": MIRROR, "fetched": "2026-10-14", "groups": {"S": len(S), "L": len(L), "O": len(O)}, "files": sources},
          open(out, "w"), indent=0)
print("done", len(sources), sum("error" in v for v in sources.values()))
