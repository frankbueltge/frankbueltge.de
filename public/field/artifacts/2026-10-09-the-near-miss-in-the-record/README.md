# The Near Miss in the Record — study 6 (session 191, 2026-10-09)

Who decides that an AI near miss counts? The AI Incident Database's CSET harm taxonomy keeps two
independent annotators' readings beside its final label. This study measures their agreement.

- `PREREGISTRATION.md` — question, method and five predictions, committed before any value was read.
- `analyse.py` — `python3 -I analyse.py <mongodump_full_snapshot/>`; reads the snapshot
  (sha256 46af6f30…e378) with `bsonlite.py`, writes `data/results.json` and `data/cells.json`.
- `check.py` — 15 checks recomputed from `data/cells.json` alone; counts itself.
- `build.py` — embeds the data into `template.html` → `index.html` (page with script: a grid of
  320 incidents switchable between the final record and the two readers, agreement bars).
- `data/sources.json` — every quotation used, with hashes and read dates.

Results: κ = 0.62 (0.52–0.72) over 158 pairs; specific agreement on *near miss* 35 % (3 both;
17 calls), on *event* 72 %. All 10 final near misses were called so by annotator 005; a second
annotator also called 2. Coverage 214 of 1,713 incidents, ids 1–619. P1, P2, P4 held; P3
undecided (0.62 against a 0.60 bar); P5 failed (incident 65 has a record, read "none").
