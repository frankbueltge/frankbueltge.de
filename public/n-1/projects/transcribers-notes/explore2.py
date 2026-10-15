"""Project 7, session 2, exploratory (not registered): what the dropped characters are, how the turned letters and the
vowel substitutions spread over books. Usage: python3 explore2.py. Writes explore2.json."""
import collections, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, "pairs_verified.json"))) + json.load(open(os.path.join(HERE, "pairs2_verified.json")))
TURN = {"n": "u", "u": "n", "d": "p", "p": "d", "b": "q", "q": "b"}
V = set("aeiou")


def cl(x, y):
    if len(x) == len(y):
        d = [k for k in range(len(x)) if x[k] != y[k]]
        return ("sub", x[d[0]], y[d[0]]) if len(d) == 1 else None
    if len(y) == len(x) + 1:
        for k in range(len(y)):
            if y[:k] + y[k + 1:] == x:
                return ("added", "", y[k], y[k - 1:k] == y[k:k + 1] or y[k + 1:k + 2] == y[k:k + 1])
    if len(x) == len(y) + 1:
        for k in range(len(x)):
            if x[:k] + x[k + 1:] == y:
                return ("removed", x[k], "", x[k - 1:k] == x[k:k + 1] or x[k + 1:k + 2] == x[k:k + 1])
    return None


rows = [(p, cl(p["from"], p["to"])) for p in P if p["lev"] == 1]
rows = [(p, c) for p, c in rows if c]
added = [c for _, c in rows if c[0] == "added"]
removed = [c for _, c in rows if c[0] == "removed"]
subs = [(p, c) for p, c in rows if c[0] == "sub"]
ll = [(p, c) for p, c in subs if c[1].isascii() and c[2].isascii() and c[1].islower() and c[2].islower() and c[1].isalpha() and c[2].isalpha()]
turned = [(p, c) for p, c in ll if TURN.get(c[2]) == c[1]]
vow = [(p, c) for p, c in ll if c[1] in V and c[2] in V]
out = {
    "added_top": collections.Counter(c[2] for c in added).most_common(10),
    "added_doubling_a_neighbour": sum(c[3] for c in added),   # the missing character is a double letter's second half
    "removed_top": collections.Counter(c[1] for c in removed).most_common(10),
    "removed_doubled": sum(c[3] for c in removed),            # the extra character doubles its neighbour
    "n_added": len(added), "n_removed": len(removed),
    "lowercase_subs": len(ll), "vowel_for_vowel": len(vow), "vowel_for_vowel_books": len({p["id"] for p, _ in vow}),
    "turned": len(turned), "turned_books": collections.Counter(p["id"] for p, _ in turned),
    "lowercase_sub_books": len({p["id"] for p, _ in ll}),
}
json.dump(out, open(os.path.join(HERE, "explore2.json"), "w"), indent=1)
print(json.dumps(out))
