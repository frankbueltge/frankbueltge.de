"""Project 8: for each promise contribution, the sentence that holds the promise (and, if separate, the sentence naming the
Library), at most 240 characters, with personal names replaced by [name]. Reads the scratch file; writes excerpts.json.
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import html, json, re, sys
from session1 import PROMISE

TITLE = re.compile(r"\b(Lord|Lady|Baroness|Baron|Viscount|Earl|Mr|Mrs|Ms|Miss|Dr|Sir|Dame)\.?\s+(?:[A-Z][\w'’-]+\s?)+"
                   r"(?:of\s+(?:[A-Z][\w'’-]+\s?)+)?")
SENT = re.compile(r"[^.?!]*(?:[.?!]+|$)")


ABBR = re.compile(r"\b(hon|Hon|Mr|Mrs|Ms|Dr|St|No|Nos|Col|col|cols|Cmnd|Cm|para|i\.e|e\.g|etc)\.")


def sentences(t):
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = ABBR.sub(lambda m: m.group(1) + "\u00a7", t)
    return [s.strip().replace("\u00a7", ".") for s in SENT.findall(t) if s.strip()]


def clip(s, n=240):
    return s if len(s) <= n else s[:n - 1].rsplit(" ", 1)[0] + "…"


def anon(s):
    return TITLE.sub(lambda m: m.group(1) + " [name] ", s).replace("  ", " ").replace(" ,", ",").replace(" .", ".")


def main(raw, out):
    d = json.load(open(raw))
    res = {}
    for c in d["contributions"]:
        ss = sentences(c["text"])
        p = next((s for s in ss if PROMISE.search(s)), None)
        if not p:
            continue
        e = clip(p)
        if "Library" in c["text"] and "Library" not in p:
            lib = next(s for s in ss if "Library" in s)
            e += " … " + clip(lib, 160)
        res[c["id"]] = anon(e)
    json.dump(res, open(out, "w"), indent=0, ensure_ascii=False)
    print(len(res))


if __name__ == "__main__":
    main(*sys.argv[1:3])
