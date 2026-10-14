"""Project 8, session 1: fetch the promise candidates and the denominators (SELECTION.md).

Texts are kept in scratch only (argument 1); the repository gets rows and counts (session1_rows.json).
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json, sys, time, urllib.parse, urllib.request

API = "https://hansard-api.parliament.uk/search/contributions/Spoken.json"
YEARS = [1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025]
HOUSES = ["Commons", "Lords"]
PHRASES = ['"will write to"', '"shall write to"', '"will certainly write to"', '"will happily write to"',
           '"will gladly write to"', '"will be happy to write to"', '"will be glad to write to"']


CACHE = {}


def get(params):
    """One request at a time; the API answers some queries with HTTP 500 after ~30 s, so retry up to 8 times and
    keep every good answer in a scratch cache, so a restart repeats nothing."""
    url = API + "?" + urllib.parse.urlencode(params)
    if url in CACHE:
        return CACHE[url]
    for attempt in range(8):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.load(r)
            time.sleep(0.5)
            if "TotalResultCount" in d and "Results" in d:
                CACHE[url] = d
                return d
            print("bad body", attempt, str(d)[:80], file=sys.stderr)
        except Exception as e:  # logged, retried
            print("retry", attempt, e, file=sys.stderr)
        time.sleep(min(60, 2 ** (attempt + 1)))
    raise RuntimeError(url)


def main(scratch):
    global CACHE
    cache_file = scratch + ".cache.json"
    try:
        CACHE = json.load(open(cache_file))
    except OSError:
        CACHE = {}
    texts, denoms = {}, {}
    for year in YEARS:
        for house in HOUSES:
            base = {"house": house, "startDate": f"{year}-01-01", "endDate": f"{year}-12-31"}
            denoms[f"{house}-{year}"] = get({**base, "take": 1})["TotalResultCount"]
            for ph in PHRASES:
                skip = 0
                while True:
                    d = get({**base, "searchTerm": ph, "take": 100, "skip": skip})
                    for c in d["Results"]:
                        k = c["ContributionExtId"]
                        if k not in texts:
                            texts[k] = {"id": k, "house": house, "year": year, "date": c["SittingDate"][:10],
                                        "section": c["Section"], "debate": c["DebateSection"],
                                        "debate_id": c["DebateSectionExtId"], "text": c["ContributionTextFull"] or "",
                                        "phrases": []}
                        texts[k]["phrases"].append(ph)
                    skip += 100
                    if skip >= d["TotalResultCount"] or not d["Results"]:
                        break
            json.dump(CACHE, open(cache_file, "w"))
            print(year, house, denoms[f"{house}-{year}"], len(texts), flush=True)
    json.dump({"denominators": denoms, "contributions": list(texts.values())}, open(scratch, "w"))


if __name__ == "__main__":
    main(sys.argv[1])
