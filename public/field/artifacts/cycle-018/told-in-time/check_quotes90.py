"""Check that every quoted passage of signals90.py stands, word for word, in the text as fetched.

Usage: python3 check_quotes90.py <directory with the local copies named in signals90.LOCAL>
Whitespace is collapsed and a hyphen broken across a line end is joined; nothing else is normalised.
Writes quotes90.json beside this script.
"""
import hashlib, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from signals90 import SIGNALS, LOCAL  # noqa: E402


def norm(s):
    s = re.sub(r"-\s*\n\s*", "-", s)
    s = re.sub(r"\\", "", s)  # markdown escapes in the extraction-service copy
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def main(d):
    texts = {}
    for k, f in LOCAL.items():
        raw = open(os.path.join(d, f), encoding="utf-8", errors="replace").read()
        texts[k] = (norm(raw), hashlib.sha256(raw.encode("utf-8")).hexdigest())
    out, missing = [], 0
    for s in SIGNALS:
        t, h = texts[s["instrument"]]
        q = norm(s["quote"])
        ok = q in t
        missing += not ok
        out.append({"id": s["id"], "found": ok, "words": len(q.split()), "text_sha256": h})
    res = {"what": "Quote check of study 90 (session 288): each quoted passage looked up in the local copy of its "
                   "text as fetched on 2026-11-22, whitespace collapsed.", "signals": len(out),
           "found": len(out) - missing, "over_40_words": sum(o["words"] > 40 for o in out), "items": out}
    json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "quotes90.json"), "w"), indent=1)
    print(res["found"], "of", res["signals"], "found;", res["over_40_words"], "over 40 words")
    for o in out:
        if not o["found"] or o["words"] > 40:
            print("  ", o)


if __name__ == "__main__":
    main(sys.argv[1])
