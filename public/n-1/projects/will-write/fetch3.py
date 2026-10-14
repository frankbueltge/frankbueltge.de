"""Project 8, session 3: fetch speakers for session 1's promise contributions of 2005-2025, and every deposited paper received
2005-01-01 to 2026-02-28 (SESSION3.md). Everything fetched goes to scratch only (argument 1 is a directory); names never reach the
repository. Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json, os, sys, time, urllib.parse, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch  # session 1's queries and retrying getter, unchanged

YEARS = [2005, 2010, 2015, 2020, 2025]
DP = "https://depositedpapers-api.parliament.uk/api/DepositedPapers"


def get_json(url):
    for attempt in range(8):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.load(r)
            time.sleep(0.3)
            return d
        except Exception as e:
            print("retry", attempt, e, file=sys.stderr)
            time.sleep(min(60, 2 ** (attempt + 1)))
    raise RuntimeError(url)


def speakers(scratch):
    out = os.path.join(scratch, "speakers.json")
    cache_file = os.path.join(scratch, "hansard.cache.json")
    try:
        fetch.CACHE = json.load(open(cache_file))
    except OSError:
        fetch.CACHE = {}
    sp = {}
    for year in YEARS:
        for house in fetch.HOUSES:
            base = {"house": house, "startDate": f"{year}-01-01", "endDate": f"{year}-12-31"}
            for ph in fetch.PHRASES:
                skip = 0
                while True:
                    d = fetch.get({**base, "searchTerm": ph, "take": 100, "skip": skip})
                    for c in d["Results"]:
                        sp[c["ContributionExtId"].lower()] = {"name": c["MemberName"], "member_id": c["MemberId"],
                                                              "text": c["ContributionTextFull"] or ""}
                    skip += 100
                    if skip >= d["TotalResultCount"] or not d["Results"]:
                        break
            json.dump(fetch.CACHE, open(cache_file, "w"))
            json.dump(sp, open(out, "w"))
            print("speakers", year, house, len(sp), flush=True)


def papers(scratch):
    out = os.path.join(scratch, "papers.json")
    try:
        got = json.load(open(out))
    except OSError:
        got = {}
    for year in range(2005, 2027):
        if str(year) in got:
            continue
        end = f"{year}-12-31" if year < 2026 else "2026-02-28"
        items, skip = [], 0
        while True:
            q = urllib.parse.urlencode({"DepositedFrom": f"{year}-01-01", "DepositedTo": end, "House": "All",
                                        "Take": 100, "Skip": skip})
            d = get_json(DP + "?" + q)
            items += [i["value"] for i in d["items"]]
            skip += 100
            if skip >= d["totalResults"] or not d["items"]:
                break
        got[str(year)] = {"total": d["totalResults"], "items": items}
        json.dump(got, open(out, "w"))
        print("papers", year, len(items), d["totalResults"], flush=True)


if __name__ == "__main__":
    {"speakers": speakers, "papers": papers}[sys.argv[2]](sys.argv[1])
