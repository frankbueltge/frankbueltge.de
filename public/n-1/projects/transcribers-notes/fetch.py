"""Project 7, session 1: draw the registered sample and fetch it from the mirror.

Usage: python3 fetch.py <scratch_dir>
Reads <scratch_dir>/pg_catalog.csv, writes ebooks to <scratch_dir>/txt/ and
sample.json / sources.json next to this script. One request at a time, at most two per second.
"""
import csv, hashlib, json, os, random, sys, time, urllib.request

SCRATCH = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
MIRROR = "https://gutenberg.pglaf.org/cache/epub/{n}/pg{n}.txt"
SEED, N = 20261012, 1500

rows = list(csv.DictReader(open(os.path.join(SCRATCH, "pg_catalog.csv"), encoding="utf-8")))
frame = {int(r["Text#"]): r for r in rows if r["Type"] == "Text" and r["Language"] == "en"}
sample = random.Random(SEED).sample(sorted(frame), N)
json.dump({"seed": SEED, "n": N, "frame_size": len(frame),
           "catalog_rows": len(rows),
           "catalog_sha256": hashlib.sha256(open(os.path.join(SCRATCH, "pg_catalog.csv"), "rb").read()).hexdigest(),
           "ids": [{"id": i, "issued": frame[i]["Issued"]} for i in sample]},
          open(os.path.join(HERE, "sample.json"), "w"), indent=0)

sources = {}
for k, i in enumerate(sample):
    path = os.path.join(SCRATCH, "txt", f"pg{i}.txt")
    if not os.path.exists(path):
        t0 = time.time()
        try:
            data = urllib.request.urlopen(MIRROR.format(n=i), timeout=60).read()
            open(path, "wb").write(data)
        except Exception as e:  # logged, not replaced
            sources[i] = {"error": str(e)[:120]}
            continue
        time.sleep(max(0, 0.5 - (time.time() - t0)))
    sources[i] = {"sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(), "bytes": os.path.getsize(path)}
    if k % 100 == 0:
        print(k, i, flush=True)
json.dump({"mirror": MIRROR, "fetched": "2026-10-12", "files": sources},
          open(os.path.join(HERE, "sources.json"), "w"), indent=0)
