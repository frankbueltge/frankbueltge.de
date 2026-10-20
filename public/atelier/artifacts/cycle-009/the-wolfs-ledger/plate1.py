"""Plate I, Three or Four Times. The Wolf's Ledger, cycle 009, increment 1 (2026-10-20).

Question of the cycle (cycle.json, opened 2026-10-20): when a warning turns out never needed, who pays
for it, and does a record of false alarms make the next warning less believed?

This plate reads the oldest record of false alarms there is, the fable of the shepherd's boy, as a
ledger: what it writes down after each empty cry, and what a village keeping that ledger may then
believe of the next cry. It then sets the fable's ledger beside a real one: the 21 retractions in the
13,371 local warnings of the Studio's FILED UNDER, as the Studio checked and paired them (its offer of
2026-10-19, s186, taken_summary.json).

Sources, asserted below, never committed (third-party source files stay out of this repository):
  T  Aesop, tr. G. F. Townsend (1867), Project Gutenberg eBook #21, "The Shepherd's Boy and the Wolf".
  V  Aesop, tr. V. S. Vernon Jones (1912), Project Gutenberg eBook #11339, same fable.
  S  studio@e47231c, works/2026-10-16-filed-under/taken_summary.json (sha256 asserted).
The Greek text (Perry 210) was not reached this session; nothing here rests on it.

The rules, fixed before anything below was computed (2026-10-20). The retraction words had already been
read once, in plate XI of cycle 008 and in the Studio's file; the word rule was written after that
reading and is said to be so.
  quotes     every quotation on the page must occur verbatim (whitespace folded) in T or V, else nothing.
  ledger     the columns each translation writes for an empty cry, read by hand and listed with the line
             that writes them.
  words      each of the 21 retractions is sorted by its own words, first match wins:
               hoax   /hoax|prank|joke|for fun|laugh/              (the fable's column)
               error  /in error|error|accident|inadvertent|false alarm|mistak/
               other  /another (state|agency)/                     (says someone else sent it)
               bare   anything else: withdrawn, no reason given
             and, apart from that, whether it speaks to those who acted: /well done|protected yourself|thank/.
  village    a model, declared, not an estimate. Two kinds of boy: the hoaxer, at whose cry a wolf is
             there with chance w (he also cries when it really comes), and the watcher, at whose cry a
             wolf is there with chance p. A village holds a prior share pi of hoaxers. After k empty
             cries it believes the next cry according to the columns it keeps:
               came only           pi*w + (1-pi)*p                      (the count tells it nothing)
               + wolf? (no wolf)   type posterior from (1-w)^k against (1-p)^k
               + words after       the laugh names the hoaxer: belief w; no laugh: the watcher, belief p
             The habituated village (Vernon Jones's reading) keeps no column: it answers the k+1-th
             cry with h^k of its first readiness; h is declared, not read from anything.
             The village comes when its belief is at least t, the cost of a trip over the flock's worth.
             Defaults: w = 0.02, p = 0.25, pi = 0.5, k = 4, h = 0.6, t = 0.1.
  predictions (P1) none of the 21 retractions falls under "hoax". (P2) on the defaults, a ledger without
             the words column leaves the watcher's fifth cry below t, and one with it does not.
             (P3) with the words column, the watcher's belief does not fall with k at all.

Usage: python3 -I plate1.py STUDIO_DIR GUTENBERG_DIR   (GUTENBERG_DIR holds pg21.txt and pg11339.txt;
       writes plate1.json and plate1.js beside itself)
"""
import json, sys, re, hashlib
from pathlib import Path

HERE = Path(__file__).parent
S, G = Path(sys.argv[1]), Path(sys.argv[2])
S_COMMIT = "e47231c"
S_PATH = "works/2026-10-16-filed-under/taken_summary.json"
S_SHA = "64526a799a9572c0a7edb1d7cfab4182a50ce13ad3b513a23b21f59999e4fdff"
assert hashlib.sha256((S / S_PATH).read_bytes()).hexdigest() == S_SHA, "not the Studio's file"
fold = lambda s: re.sub(r"\s+", " ", s.replace("“", '"').replace("”", '"').replace("’", "'")).strip()
T = fold((G / "pg21.txt").read_text(encoding="utf-8"))
V = fold((G / "pg11339.txt").read_text(encoding="utf-8"))

Q = {
 "T": {
  "who": "Aesop, tr. G. F. Townsend, 1867 (Project Gutenberg #21)",
  "lines": [
   ("cry", 'brought out the villagers three or four times by crying out, "Wolf! Wolf!"'),
   ("came", "when his neighbors came to help him"),
   ("laugh", "laughed at them for their pains"),
   ("true", "The Wolf, however, did truly come at last."),
   ("unheeded", "no one paid any heed to his cries, nor rendered any assistance"),
   ("flock", "at his leisure lacerated or destroyed the whole flock"),
   ("moral", "There is no believing a liar, even when he speaks the truth."),
  ]},
 "V": {
  "who": "Aesop, tr. V. S. Vernon Jones, 1912 (Project Gutenberg #11339)",
  "lines": [
   ("cry", "thought it would be great fun to hoax the villagers"),
   ("came", "when the people came running up"),
   ("laugh", "he laughed at them for their pains"),
   ("nowolf", "every time the villagers found they had been hoaxed, for there was no Wolf at all"),
   ("count", "He did this more than once"),
   ("unheeded", "the people were so used to hearing him call that they took no notice of his cries for help"),
   ("flock", "killed off sheep after sheep at his leisure"),
   ("moral", "You cannot believe a liar even when he tells the truth."),
  ]},
}
for k, src in (("T", T), ("V", V)):
    for tag, line in Q[k]["lines"]:
        assert fold(line) in src, (k, tag)

# the ledger each translation keeps for an empty cry (by hand, each column tied to the line that writes it)
LEDGER = {
 "T": {"came": "came", "wolf?": None, "words after": "laugh", "count": "three or four times", "why unheeded": "reputation (the moral)"},
 "V": {"came": "came", "wolf?": "nowolf", "words after": "laugh", "count": "more than once", "why unheeded": "habit ('so used to hearing him call')"},
}

SUM = json.load(open(S / S_PATH))
rows = SUM["rows"]
assert len(rows) == 21 == SUM["atelier"]["retractions"]
RULES = [("hoax", r"hoax|prank|joke|for fun|laugh"), ("error", r"in error|error|accident|inadvertent|false alarm|mistak"),
         ("other", r"another (state|agency)"), ("bare", r".")]
ACTED = r"well done|protected yourself|thank"
out_rows, counts = [], {k: 0 for k, _ in RULES}
for r in rows:
    cls = next(k for k, rx in RULES if re.search(rx, r["w"], re.I))
    counts[cls] += 1
    out_rows.append({"r": r["r"], "sent": r["sent"], "w": r["w"], "cls": cls, "acted": bool(re.search(ACTED, r["w"], re.I)),
                     "hand": r["hand"], "pair_words": r.get("pair_words"), "lag": r.get("lag"), "backed": bool(r.get("backed"))})

def belief(cols, kind, k, w, p, pi):
    """Belief in the next cry of a boy of this kind, after k empty cries, for a village keeping these columns."""
    if "words" in cols:
        return w if kind == "hoaxer" else p
    if "wolf" in cols:
        a, b = pi * (1 - w) ** k, (1 - pi) * (1 - p) ** k
    else:
        a, b = pi, 1 - pi
    return (a * w + b * p) / (a + b)

D = dict(w=0.02, p=0.25, pi=0.5, k=4, h=0.6, t=0.1)
LEDGERS = {"came": ["came"], "came+wolf": ["came", "wolf"], "came+wolf+words": ["came", "wolf", "words"]}
table = {L: {kind: round(belief(c, kind, D["k"], D["w"], D["p"], D["pi"]), 6) for kind in ("hoaxer", "watcher")} for L, c in LEDGERS.items()}
by_k = {L: [round(belief(c, "watcher", k, D["w"], D["p"], D["pi"]), 6) for k in range(0, 9)] for L, c in LEDGERS.items()}
habit = [round(D["h"] ** k, 6) for k in range(0, 9)]
pred = {
 "P1": counts["hoax"] == 0,
 "P2": table["came+wolf"]["watcher"] < D["t"] <= table["came+wolf+words"]["watcher"],
 "P3": len(set(by_k["came+wolf+words"])) == 1,
}
res = {"source": {"studio": {"repo": "frankbueltge/studio", "commit": S_COMMIT, "path": S_PATH, "sha256": S_SHA},
                  "gutenberg": {"T": "https://www.gutenberg.org/cache/epub/21/pg21.txt", "V": "https://www.gutenberg.org/cache/epub/11339/pg11339.txt"}},
       "quotes": {k: {"who": Q[k]["who"], "lines": dict(Q[k]["lines"])} for k in Q}, "ledger": LEDGER,
       "archive": {"messages": 13371, "retractions": 21, "classes": counts, "speak_to_those_who_acted": sum(r["acted"] for r in out_rows),
                   "paired_by_studio": SUM["paired_by_rule"], "backed_by_studio": SUM["backed"], "rows": out_rows},
       "model": {"defaults": D, "fifth_cry": table, "watcher_by_k": by_k, "habit_by_k": habit}, "predictions": pred}
json.dump(res, open(HERE / "plate1.json", "w"), indent=1, ensure_ascii=False)
(HERE / "plate1.js").write_text("// generated by plate1.py from the two Gutenberg translations and the Studio's taken_summary.json\nconst P1=" +
                                json.dumps(res, ensure_ascii=False) + ";\n", encoding="utf-8")
print(json.dumps({"classes": counts, "fifth_cry": table, "predictions": pred}, indent=1))
