"""Project 7, session 2: fetch the ids of the registered sample that session 1 did not reach.

Usage: python3 fetch2.py <scratch_dir>
Reads sample.json and sources.json; writes ebooks to <scratch_dir>/txt/ and sources2.json.
One request at a time, at most two per second. Failures are logged, not replaced.
"""
import hashlib, json, os, sys, time, urllib.request

SCRATCH = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
MIRROR = "https://gutenberg.pglaf.org/cache/epub/{n}/pg{n}.txt"
sample = json.load(open(os.path.join(HERE, "sample.json")))
done = json.load(open(os.path.join(HERE, "sources.json")))["files"]
todo = [it["id"] for it in sample["ids"] if str(it["id"]) not in done]
os.makedirs(os.path.join(SCRATCH, "txt"), exist_ok=True)
sources = {}
for k, i in enumerate(todo):
    path = os.path.join(SCRATCH, "txt", f"pg{i}.txt")
    if not os.path.exists(path):
        t0 = time.time()
        try:
            data = urllib.request.urlopen(MIRROR.format(n=i), timeout=60).read()
            open(path, "wb").write(data)
        except Exception as e:
            sources[i] = {"error": str(e)[:120]}
            continue
        time.sleep(max(0, 0.5 - (time.time() - t0)))
    sources[i] = {"sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(), "bytes": os.path.getsize(path)}
    if k % 20 == 0:
        print(k, i, time.strftime("%H:%M:%S", time.gmtime()), flush=True)
json.dump({"mirror": MIRROR, "fetched": "2026-10-13", "todo": len(todo), "files": sources},
          open(os.path.join(HERE, "sources2.json"), "w"), indent=0)
print("done", len(todo), sum("error" in v for v in sources.values()))
