"""Project 7, session 2: test the five predictions registered in SESSION2.md.

Usage: python3 session2.py <scratch_dir> <pairs_new_verified.json>
Reads pairs_verified.json (session 1, 1,288 books), the verified pairs of the 207 books fetched
tonight, and the bodies of those books in <scratch_dir>/txt/ (letter frequencies for the null).
Writes session2.json.
"""
import collections, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

SCRATCH, NEWPAIRS = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
old = json.load(open(os.path.join(HERE, "pairs_verified.json")))
new = json.load(open(NEWPAIRS))
src2 = json.load(open(os.path.join(HERE, "sources2.json")))["files"]

TURN = {"n": "u", "u": "n", "d": "p", "p": "d", "b": "q", "q": "b"}


def body(text):
    s = re.search(r"^\*\*\* ?START OF.*$", text, re.M)
    e = re.search(r"^\*\*\* ?END OF.*$", text, re.M)
    return text[s.end() if s else 0: e.start() if e else len(text)]


freq = collections.Counter()
for i, v in src2.items():
    if "sha256" in v:
        t = open(os.path.join(SCRATCH, "txt", f"pg{i}.txt"), encoding="utf-8", errors="replace").read()
        freq.update(ch for ch in body(t) if "a" <= ch <= "z")
tot = sum(freq.values())
f = {ch: freq[ch] / tot for ch in "abcdefghijklmnopqrstuvwxyz"}


def classify(x, y):
    """Return (kind, printed_char, corrected_char) for a distance-1 pair, else None."""
    if len(x) == len(y):
        d = [k for k in range(len(x)) if x[k] != y[k]]
        return ("sub", x[d[0]], y[d[0]]) if len(d) == 1 else None
    if len(y) == len(x) + 1:
        for k in range(len(y)):
            if y[:k] + y[k + 1:] == x:
                return ("added", "", y[k])
    if len(x) == len(y) + 1:
        for k in range(len(x)):
            if x[:k] + x[k + 1:] == y:
                return ("removed", x[k], "")
    return None


def run(pairs):
    rows = [(p, classify(p["from"], p["to"])) for p in pairs if p["lev"] == 1]
    rows = [(p, c) for p, c in rows if c]
    subs = [c for _, c in rows if c[0] == "sub"]
    ll = [c for c in subs if c[1].islower() and c[2].islower() and c[1].isalpha() and c[2].isalpha() and c[1].isascii() and c[2].isascii()]
    turned = [c for c in ll if TURN.get(c[2]) == c[1]]
    expected = sum(f[TURN[c[2]]] / (1 - f[c[2]]) for c in ll if c[2] in TURN)
    top = collections.Counter((c[1], c[2]) for c in ll).most_common(12)
    added = sum(c[0] == "added" for _, c in rows)
    removed = sum(c[0] == "removed" for _, c in rows)
    punct = sum(1 for _, c in rows if not (c[1] + c[2]).isalnum())
    case = sum(1 for c in subs if c[1] != c[2] and c[1].lower() == c[2].lower())
    res = {
        "pairs": len(pairs), "lev1_classified": len(rows), "substitutions": len(subs),
        "lowercase_letter_subs": len(ll), "turned": len(turned), "turned_expected": round(expected, 2),
        "turned_ratio": round(len(turned) / expected, 2) if expected else None,
        "turned_by_pair": collections.Counter(c[1] + ">" + c[2] for c in turned),
        "top_lowercase": [[a + ">" + b, n] for (a, b), n in top],
        "added": added, "removed": removed, "added_to_removed": round(added / removed, 2) if removed else None,
        "punctuation_only": punct, "punctuation_share": round(punct / len(rows), 3),
        "case_only": case, "case_share": round(case / len(subs), 3),
    }
    tp = top[0][0] if top else None
    res["predictions"] = {
        "P1 turned >= 3x null and >= 5": len(turned) >= 5 and len(turned) >= 3 * expected,
        "P2 top lowercase sub is n>u or u>n": tp in (("n", "u"), ("u", "n")),
        "P3 added >= 1.5x removed": added >= 1.5 * removed,
        "P4 punctuation-only >= 10%": res["punctuation_share"] >= 0.10,
        "P5 case-only >= 5% of subs": res["case_share"] >= 0.05,
    }
    return res, rows


r_old, _ = run(old)
r_all, rows = run(old + new)
out = {"letter_freq_from_books": len([v for v in src2.values() if "sha256" in v]), "letters_counted": tot,
       "freq": {k: round(v, 5) for k, v in f.items()},
       "session1_pairs_only": r_old, "completed_sample": r_all,
       "turned_instances": [{"id": p["id"], "from": p["from"], "to": p["to"]} for p, c in rows
                             if c[0] == "sub" and TURN.get(c[2]) == c[1]]}
json.dump(out, open(os.path.join(HERE, "session2.json"), "w"), indent=1, ensure_ascii=False)
for k in ("session1_pairs_only", "completed_sample"):
    print(k, json.dumps({a: b for a, b in out[k].items()}, ensure_ascii=False, indent=0))
