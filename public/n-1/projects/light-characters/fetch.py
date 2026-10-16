"""Project 10: fetch the NGA List of Lights, volumes 110-116, to a scratch directory.

Usage: python3 fetch.py OUTDIR
One request per volume, a pause between them. The answers are not committed; derived rows are.
Source: National Geospatial-Intelligence Agency, Maritime Safety Information,
https://msi.nga.mil/api/publications/ngalol/lights-buoys?volume=N&output=json
"""
import hashlib, json, os, sys, time, urllib.request

UA = "n-1-remainder/1.0 (+https://github.com/frankbueltge/n-1)"
URL = "https://msi.nga.mil/api/publications/ngalol/lights-buoys?volume={v}&output=json&includeRemovals=false"


def main(out):
    os.makedirs(out, exist_ok=True)
    log = []
    for v in range(110, 117):
        req = urllib.request.Request(URL.format(v=v), headers={"User-Agent": UA})
        for attempt in range(4):
            try:
                body = urllib.request.urlopen(req, timeout=180).read()
                break
            except Exception as e:  # back off and retry
                print(v, "retry", attempt, e, file=sys.stderr)
                time.sleep(4 * 2 ** attempt)
        else:
            raise SystemExit(f"volume {v} failed")
        path = os.path.join(out, f"lol{v}.json")
        open(path, "wb").write(body)
        n = len(json.loads(body)["ngalol"])
        log.append({"volume": v, "records": n, "bytes": len(body),
                    "sha256": hashlib.sha256(body).hexdigest(),
                    "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
        print(log[-1])
        time.sleep(2)
    json.dump(log, open(os.path.join(out, "fetch_log.json"), "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
