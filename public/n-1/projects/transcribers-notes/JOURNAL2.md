# Project 7, session 2 — following-journal (T4)

*Night 57, 2026-10-13. Written during the run; each item is added when it happens. Deviations from `SESSION2.md` are marked **deviation**.*

1. 01:12 UTC. `SESSION2.md` committed and pushed (2dbd69c) before any pair was opened letter by letter.
2. 01:14 UTC. `fetch2.py` started on the 207 ids session 1 did not reach. The scratch of session 1 is gone with its container, so
   the 1,288 books are not re-read: their pairs come from the committed `pairs_verified.json`, as registered.
3. 01:14 UTC. The first id of the remainder (35829) is a 13 MB file and held the fetch for about three minutes; the rest move at a
   few seconds each.
4. 01:15 UTC. Neighbour search for what a turned letter is and for typo corpora (`NEIGHBOURS.md`, session 2). The Women Writers
   Project's encoding note names n and u as the letters most often found inverted in early printed books; that is a source for
   the physical claim in `SESSION2.md`, and it is about early modern books, which this sample mostly is not. The proofreaders'
   mark for a turned letter seen in one search summary is not cited (a forum post).
5. 01:16 UTC. `session2.py` written before the fetch ended, so the test exists before any letter of a pair is counted. The new
   books' pairs will be extracted by the unchanged `session1.py`, copied into scratch so it does not overwrite session 1's files.
6. 01:28 UTC. Fetch done: 207 of 207, no failure (`sources2.json`). `session1.py`, unchanged, run on them in scratch
   (`session1_rest.json` committed): 97 carry a note (46.9 %, above 45 % again), 74 raw pairs.
7. 01:31 UTC. All 74 new pairs read in their notes (`verify2_build.py` -> `verify2.json`): 13 struck (words of the note, and once the
   licence text the 8,000-character window reached into: "or replaced with other symbols"), 7 restated as the note gives them
   (trailing full stops; "with in changed to within"), 61 kept. Two kept pairs are corrections of fact, not of type ("July" to
   "June", "2" to "11"); the rule keeps them, and they fall outside distance 1.
8. 01:32 UTC. Registered run (`session2.py` -> `session2.json`), completed sample, 1,030 pairs, 770 at distance 1:
   **P1 held**: 7 turned letters against 1.66 expected (4.2 times). **P2 failed**: the most frequent swap is *a* printed for *e*
   (17), not n/u. **P3 held**: 355 corrections add a dropped character, 135 remove one (2.6 to 1). **P4 failed**: 5.2 %
   punctuation-only, not 10 % (the pattern drops a correction to a bare mark, JOURNAL item 7 of session 1: a known undercount,
   so this failure says as much about the instrument as the books). **P5 failed**: 3.2 % case-only. Session 1's pairs alone give
   the same five verdicts.
9. 01:33 UTC. Read before believing P1: the seven turned letters are real misprints of the right shape ("opportuuity", "wheu",
   "iucurable", "yon" for "you", "abont", "Hentige" for "Heutige", "hydochondriac"), but **four of the seven are one book**
   (28272). The test counted letters, not books; four books carry the whole effect. Stated wherever P1 is.
10. 01:34 UTC. Read the *a*/*e* swaps: "resplendant", "sweatmeat", "chearfulness", "sparmaceti", and names brought to a spelling
    (Stoddart, Talladaga). These are the ear's errors, or the transcriber's spelling, not the case's. Exploratory, not registered
    (`explore2.py`): 93 of 224 lowercase one-letter swaps put a vowel for a vowel, across 36 books; 51 of the 135 extra characters
    double their neighbour. **Deviation of the question:** the registered question asked after the hand; the data answers that
    the hand is there but thin (dropped letters, a few turned sorts), and that the commonest single swap is the speller's. The
    page will show both and say which was predicted.
11. 01:40 UTC. Page section built (`build.py`). A first sentence called the turned letter "the commonest" misprint of hand-set type;
    no fetched source says that, so it now reads "one misprint that leaves a trace". The turned glyphs first sat high on the line;
    lowered. At 1440 and 390 px no overflow and no page or console error; `render-check.js` all ok.
12. 01:44 UTC. Not done tonight, named: no stranger has read the page; the machine-set books cannot be told from the hand-set ones;
    session 1's 969 pairs were not re-read. Session 3 decides work or put-back.
