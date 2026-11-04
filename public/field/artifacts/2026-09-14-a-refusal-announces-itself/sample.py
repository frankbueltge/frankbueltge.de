#!/usr/bin/env python3
"""Draw the session's sample from the house paper register.

The register (https://frankbueltge.de/papers/index.json) is a FEED and is never
mirrored into this repository: this script fetches it, draws from it by a fixed
rule with a fixed seed, and writes only the drawn rows to data/sample.json.

Rule, fixed before any delegate ran:

  - population: register entries whose url or identifier resolves to an arXiv
    identifier of the form YYMM.NNNNN. Entries without one are out of scope
    because this session's ground truth is the arXiv PDF.
  - stratum OLD: arXiv identifier year <= 24 (first posted 2024 or earlier).
  - stratum NEW: arXiv identifier year == 26 (first posted 2026).
  - 8 drawn from each stratum, random.Random("2026-09-14-meridian"), after
    sorting the stratum by arXiv identifier so the draw does not depend on the
    register's own ordering.

Usage: python3 sample.py [path-to-index.json]
"""
import json
import random
import re
import sys
import urllib.request

FEED = "https://frankbueltge.de/papers/index.json"
SEED = "2026-09-14-meridian"
N_PER_STRATUM = 8

ARXIV_URL = re.compile(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5})")
ARXIV_BARE = re.compile(r"^(?:arXiv:)?([0-9]{4}\.[0-9]{4,5})(?:v[0-9]+)?$")


def arxiv_id(entry):
    for field in (entry.get("url") or "", str(entry.get("kennung") or "")):
        m = ARXIV_URL.search(field)
        if m:
            return m.group(1)
        m = ARXIV_BARE.match(field.strip())
        if m:
            return m.group(1)
    return None


def load(path=None):
    if path:
        return json.load(open(path, encoding="utf-8"))
    with urllib.request.urlopen(FEED, timeout=60) as fh:
        return json.loads(fh.read().decode("utf-8"))


def main():
    doc = load(sys.argv[1] if len(sys.argv) > 1 else None)
    entries = doc["entries"]
    pool = []
    for e in entries:
        aid = arxiv_id(e)
        if not aid:
            continue
        pool.append({
            "arxiv_id": aid,
            "id_year": 2000 + int(aid[:2]),
            "title": e.get("titel"),
            "year": e.get("jahr"),
            "venue": e.get("ort"),
            "register_id": e.get("id"),
        })
    # one row per arXiv identifier; the register can carry a paper twice
    seen, uniq = set(), []
    for row in sorted(pool, key=lambda r: r["arxiv_id"]):
        if row["arxiv_id"] in seen:
            continue
        seen.add(row["arxiv_id"])
        uniq.append(row)

    old = [r for r in uniq if r["id_year"] <= 2024]
    new = [r for r in uniq if r["id_year"] == 2026]

    rng = random.Random(SEED)
    drawn = []
    for arm, stratum in (("OLD", old), ("NEW", new)):
        take = rng.sample(stratum, N_PER_STRATUM)
        for row in sorted(take, key=lambda r: r["arxiv_id"]):
            row = dict(row, arm=arm)
            drawn.append(row)

    out = {
        "drawn_on": "2026-09-14",
        "feed": FEED,
        "seed": SEED,
        "register_entries": len(entries),
        "arxiv_backed": len(uniq),
        "stratum_sizes": {"OLD": len(old), "NEW": len(new)},
        "n_per_stratum": N_PER_STRATUM,
        "items": drawn,
    }
    json.dump(out, open("data/sample.json", "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)
    print("pool %d  OLD %d  NEW %d  drawn %d"
          % (len(uniq), len(old), len(new), len(drawn)))
    for r in drawn:
        print(" ", r["arm"], r["arxiv_id"], r["id_year"], (r["title"] or "")[:70])


if __name__ == "__main__":
    main()
