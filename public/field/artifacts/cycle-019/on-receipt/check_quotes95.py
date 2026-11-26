"""Check that every passage of cases95.json stands, word for word, in its source as fetched on 2026-11-26.

Usage: python3 check_quotes95.py <directory of text copies named <source key>.txt> [<directory of fetched bytes>]
The text copies are the fetched pages with markup removed (or the PDFs read as text); for the two sources read through
an extraction service the copy is the service's excerpt. Whitespace is collapsed, typographic quotes and apostrophes
are made plain, invisible characters are dropped and a hyphen broken across a line end is joined; nothing else is
normalised. Writes check95.json beside this script, with the sha256 of each fetched file where the bytes are given.
"""
import hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
COPY = {"ml": "ml_x.txt", "rs": "rs_x.txt"}


def norm(s):
    s = re.sub("[​‌‍⁠﻿­]", "", s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"-\s*\n\s*", "-", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def passages(d):
    for door in d["doors"]:
        r = door["received"]
        if r.get("quote"):
            yield door["id"], "received", r["src"], r["quote"]
        for i, a in enumerate(door["acts"]):
            yield door["id"], "%s#%d" % (a["code"], i), a["src"], a["quote"]


def main(txt, raw=None):
    d = json.load(open(os.path.join(HERE, "cases95.json")))
    src = json.load(open(os.path.join(HERE, "sources95.json")))["sources"]
    texts, hashes = {}, {}
    for k in src:
        texts[k] = norm(open(os.path.join(txt, COPY.get(k, k + ".txt")), encoding="utf-8", errors="replace").read())
        if raw:
            for ext in (".pdf", ".html"):
                p = os.path.join(raw, k + ext)
                if os.path.exists(p) and k not in COPY:
                    hashes[k] = hashlib.sha256(open(p, "rb").read()).hexdigest()
    items = []
    for door, what, k, q in passages(d):
        nq = norm(q)
        items.append({"door": door, "what": what, "src": k, "via": src[k]["via"], "found": nq in texts[k],
                      "words": len(nq.split())})
    res = {"what": "Quote check of study 95 (session 293): each passage of cases95.json looked up in the copy of its "
                   "source as fetched on 2026-11-26.",
           "passages": len(items), "found": sum(i["found"] for i in items),
           "over_40_words": sum(i["words"] > 40 for i in items),
           "via_extraction_service": sum(i["via"] == "extraction service" for i in items),
           "sha256": hashes, "items": items}
    json.dump(res, open(os.path.join(HERE, "check95.json"), "w"), indent=1)
    print(res["found"], "of", res["passages"], "found;", res["over_40_words"], "over 40 words;",
          res["via_extraction_service"], "through an extraction service")
    for i in items:
        if not i["found"] or i["words"] > 40:
            print("  ", i)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
