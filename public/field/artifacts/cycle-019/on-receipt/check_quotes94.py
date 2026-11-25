"""Check that every quoted passage of receivers94.py stands, word for word, in the text as fetched on 2026-11-25.

Usage: python3 check_quotes94.py <directory with the local copies named in receivers94.LOCAL>
Whitespace is collapsed, a hyphen broken across a line end is joined, markdown escapes of the extraction-service copy
are dropped; nothing else is normalised. Writes quotes94.json beside this script.
"""
import hashlib, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from receivers94 import RECEIVERS, LOCAL, ACTS  # noqa: E402


def norm(s):
    s = re.sub(r"-\s*\n\s*", "-", s)
    s = re.sub(r"\\", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def quotes_of(r):
    for k in ACTS:
        for q in r["acts"][k]["quotes"]:
            yield k, q
    for k in ("sender_failure", "receiver_failure"):
        for q in r[k]["quotes"]:
            yield k, q


def main(d):
    texts = {}
    for k, f in LOCAL.items():
        files = f if isinstance(f, list) else [f]
        raw = "\n".join(open(os.path.join(d, x), encoding="utf-8", errors="replace").read() for x in files)
        texts[k] = (norm(raw), hashlib.sha256(raw.encode("utf-8")).hexdigest())
    items, seen = [], set()
    for r in RECEIVERS:
        t, h = texts[r["instrument"]]
        for code, q in quotes_of(r):
            key = (r["instrument"], q)
            nq = norm(q)
            items.append({"id": r["id"], "code": code, "found": nq in t, "words": len(nq.split()), "text_sha256": h,
                          "repeat": key in seen})
            seen.add(key)
    res = {"what": "Quote check of study 94 (session 292): each quoted passage of receivers94.py looked up in the local "
                   "copy of its text as fetched on 2026-11-25, whitespace collapsed.",
           "quotes": len(items), "distinct": len(seen), "found": sum(i["found"] for i in items),
           "over_40_words": sum(i["words"] > 40 for i in items), "items": items}
    json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "quotes94.json"), "w"), indent=1)
    print(res["found"], "of", res["quotes"], "found;", res["over_40_words"], "over 40 words")
    for i in items:
        if not i["found"] or i["words"] > 40:
            print("  ", i)


if __name__ == "__main__":
    main(sys.argv[1])
