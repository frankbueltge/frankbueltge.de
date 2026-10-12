"""Project 7, session 1: test the six registered predictions (SELECTION.md).

Usage: python3 session1.py <scratch_dir> [verify.json]
Reads sample.json and <scratch_dir>/txt/pg<n>.txt; writes session1.json (or session1_verified.json
when a verify file (pairs struck or repaired by reading) is given) and pairs.json.
Patterns are those registered in SELECTION.md, written out here.
"""
import json, os, re, statistics, sys

SCRATCH = sys.argv[1]
EXCL = {(v["id"], v["from"], v["to"]): v for v in json.load(open(sys.argv[2]))} if len(sys.argv) > 2 else None
HERE = os.path.dirname(os.path.abspath(__file__))
sample = json.load(open(os.path.join(HERE, "sample.json")))

NOTE = re.compile(r"transcriber[’'`]?s?[’'`]?\s+notes?|notes? (?:from|by) the transcriber", re.I)
SILENT = re.compile(r"silently|without (?:comment|note|notice)|have been (?:corrected|fixed|standardi[sz]ed|regularized)|were (?:corrected|fixed)", re.I)
QT = r"(?:[\"“]([^\"“”\n]{1,40})[\"”]|[‘']([^‘’'\n]{1,40})[’']|_([^_\n]{1,40})_)"  # quoted: 1-40 characters
BARE = r"([^\s\"“”‘’_]{1,40})"                       # an unquoted form: one word, 1-40 characters
TOK = r"(?:" + QT + "|" + BARE + ")"
VERB = r"(?:changed|corrected|amended|altered|emended)\s+to"
REPL = r"replaced\s+(?:with|by)"
ARROW = r"(?:->|→|=>|==>|-->)"
PAIR = re.compile(TOK + r"\s*(?:(?:\s(?:was|has been|have been|is))?\s+(?:" + VERB + "|" + REPL + r")\s+|" + ARROW + r")\s*" + TOK)


def pair(m):
    g = m.groups()
    x = next((v for v in g[:4] if v), None)
    y = next((v for v in g[4:] if v), None)
    if y and g[7]:                                     # a bare form loses trailing , ; : )
        y = y.rstrip(",;:)")
    return x, y


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def body(text):
    s = re.search(r"^\*\*\* ?START OF.*$", text, re.M)
    e = re.search(r"^\*\*\* ?END OF.*$", text, re.M)
    return text[s.end() if s else 0: e.start() if e else len(text)]


def note_texts(b):
    out = []
    for m in NOTE.finditer(b):
        seg = b[m.start(): m.start() + 8000]
        cut = re.search(r"\n[ \t]*\n[ \t]*\n[ \t]*\n", seg)   # three or more blank lines
        out.append(seg[: cut.start()] if cut else seg)
    return out


rows, pairs = [], []
for item in sample["ids"]:
    n = item["id"]
    p = os.path.join(SCRATCH, "txt", f"pg{n}.txt")
    if not os.path.exists(p):
        continue
    t = open(p, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")
    b = body(t)
    notes = note_texts(b)
    found = []
    for nt in notes:
        for m in PAIR.finditer(nt):
            x, y = pair(m)
            if not x or not y:
                continue
            if EXCL:                                   # verify.json: strike or repair, by reading
                v = EXCL.get((n, x, y))
                if v and v["action"] == "strike":
                    continue
                if v:
                    x, y = v["as"]
            if (x, y) not in found:
                found.append((x, y))
    silent = bool(notes) and not found and any(SILENT.search(nt) for nt in notes)
    year = int(item["issued"][:4]) if item["issued"][:4].isdigit() else None
    rows.append({"id": n, "year": year, "note": bool(notes), "listed": len(found), "silent": silent})
    for x, y in found:
        pairs.append({"id": n, "from": x, "to": y, "lev": lev(x, y)})

with_note = [r for r in rows if r["note"]]
share = lambda rs: sum(r["note"] for r in rs) / len(rs) if rs else None
late = [r for r in rows if r["year"] and r["year"] >= 2010]
early = [r for r in rows if r["year"] and r["year"] < 2005]
listed = [r for r in with_note if r["listed"]]
res = {
    "fetched": len(rows), "with_note": len(with_note),
    "share_note": share(rows), "share_note_2010_on": share(late), "share_note_before_2005": share(early),
    "n_2010_on": len(late), "n_before_2005": len(early),
    "share_listed_among_noted": len(listed) / len(with_note) if with_note else None,
    "share_silent_among_noted": sum(r["silent"] for r in with_note) / len(with_note) if with_note else None,
    "pairs": len(pairs), "share_pairs_lev1": sum(p["lev"] == 1 for p in pairs) / len(pairs) if pairs else None,
    "median_listed": statistics.median([r["listed"] for r in listed]) if listed else None,
}
res["predictions"] = {
    "P1 15-45% carry a note": 0.15 <= res["share_note"] <= 0.45,
    "P2 share 2010+ >= 2x share pre-2005": res["share_note_2010_on"] >= 2 * res["share_note_before_2005"],
    "P3 fewer than half of noted list a change": res["share_listed_among_noted"] < 0.5,
    "P4 more than a third of noted are silent": res["share_silent_among_noted"] > 1 / 3,
    "P5 more than half of pairs lev 1": res["share_pairs_lev1"] > 0.5,
    "P6 median listed <= 10": res["median_listed"] <= 10,
}
by_year = {}
for r in rows:
    if r["year"]:
        d = by_year.setdefault(r["year"], [0, 0, 0, 0])
        d[0] += 1; d[1] += r["note"]; d[2] += bool(r["listed"]); d[3] += r["silent"]
res["by_year"] = {y: dict(zip(["books", "note", "listed", "silent"], v)) for y, v in sorted(by_year.items())}
name = "session1_verified.json" if EXCL else "session1.json"
json.dump({"result": res, "rows": rows}, open(os.path.join(HERE, name), "w"), indent=0)
json.dump(pairs, open(os.path.join(HERE, "pairs_verified.json" if EXCL else "pairs.json"), "w"), indent=0, ensure_ascii=False)
print(json.dumps({k: v for k, v in res.items() if k != "by_year"}, indent=1))
