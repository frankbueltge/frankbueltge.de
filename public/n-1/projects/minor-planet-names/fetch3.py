"""Project 9 session 3: re-fetch the SBDB answers of the 1,733 sampled citations dated by an MPC batch (rows2.json:
cited, not WGSBN-dated), one request at a time. Same policy and cache format as fetch.py.

Usage: python3 fetch3.py CACHE_DIR
"""
import json, os, sys, time, urllib.request, urllib.error

UA = "n-1-remainder/1.0 (+https://github.com/frankbueltge/n-1)"
cache = sys.argv[1]
os.makedirs(cache, exist_ok=True)
nums = [r["n"] for r in json.load(open("rows2.json")) if r["cited"] and not r["wgsbn"]]
done = 0
for n in nums:
    path = os.path.join(cache, f"{n}.json")
    if os.path.exists(path):
        done += 1
        continue
    url = f"https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={n}&discovery=1"
    wait = 2
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read()
            json.loads(body)
            open(path, "wb").write(body)
            break
        except (urllib.error.URLError, ValueError, TimeoutError, ConnectionError) as e:
            print("error", n, e, file=sys.stderr)
            time.sleep(wait)
            wait *= 2
    done += 1
    if done % 100 == 0:
        print(done, time.strftime("%H:%M:%S"), flush=True)
    time.sleep(0.25)
print("done", done, len(nums))
