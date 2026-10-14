# Project 7, session 3 — following-journal (T4)

*Night 58, 2026-10-14. Written during the run; each item is added when it happens. Deviations from `SESSION3.md` are marked **deviation**.*

1. 01:10 UTC. `SESSION3.md` committed and pushed (d6c33fe) before any HTML edition was opened. `fetch3.py` started at 01:11 on the
   709 noted books, S first.
2. 01:11 UTC. `session3.py` written while the fetch runs, and its mark test run on nine invented strings, no book: a corrected span
   with class and title, an `ins` with "was:", a `sic` title are caught; an `abbr` expansion, a Greek gloss, a page number, a
   `td` and an `a` are not; a quoted pair in an HTML note is caught by the unchanged `PAIR`. Seen while writing, not changed: the
   registered class substring `tn` also sits inside `footnote`, so a footnote span with a title would count; the reading is there
   for that.
   (Item 2 first carried 01:13, written by guess; corrected against the clock at 01:11 before anything else was added.)
3. 01:12 UTC. Neighbours, once more. The Atlas of Data Art feed fetched again: sha256 prefix 4765ce73, the same file session 1
   searched, so its search stands. The Distributed Proofreaders wiki page "Transcriber's Note" is behind a login again (fetched:
   only the login notice). A search summary says a DP wiki tip makes `ins` markup show the original on mouseover; **not verified**
   (the page behind it was not fetched open) and not cited as fact. The fetch runs at about seven seconds a book (HTML files of
   0.5-1.2 MB), so S completes near 01:45 and all 709 near the registered 02:30 cutoff.
4. 01:43 UTC. The fetch was stopped by the session's 30-minute limit on background commands at 240 files (all in S), and restarted
   at once with a longer limit. `fetch3.py` skips files already in scratch and re-hashes them, so the restart changes nothing but the
   time lost (about four minutes). The registered 02:30 cutoff stands.
5. 02:30 UTC. The cutoff fired: S complete (258 of 258), L complete (129), O 213 of 322; no 404, no error. Stopping the fetch with
   `pkill -f` killed the shell that issued it again (as in session 1, item 8); `sources3.json` was then written from the files on
   disk with their groups. **Deviation, small:** the listing at 02:30:15 counted 599 files; 600 were on disk when the fetch was
   stopped seconds later, so one O book that arrived after the cutoff is in the analysis.
6. 02:31 UTC. Registered run (`session3.py` -> `session3.json`): S 28 of 258 books with a record (10.9 %); L 120 of 129; O 30 of 213.
   P1 **held**, P2 **failed** (52 of 129 L books carry marks: the lists stay lists), P3 **failed** (S 10.9 % below O 14.1 %),
   P4 **held** (median 6.5 marks where there are any).
7. 02:31 UTC. Reading the random 40 marked books (seed 3), first three marks each: 106 marks, 17 false (16 %). Ten are the note's own
   demonstration ("hover over words like this", "explanation will pop up"), four Greek transliterations, a chapter title, two titles
   that repeat their text. Above the registered 10 %, so every S book with a record was read, as fixed.
8. 02:33 UTC. All 28 S books read. 17 keep real hover corrections ("text reads `slighest'" over *slightest*, "amended from philosoper",
   "catchword spelled 'bee'"). One is struck (21628: Greek transliterations only). Ten have an HTML list pair: six false (words of
   a poem, "drop-caps" to "typed"), four true. The four true were checked against their plain-text files, fetched again for these
   four only: **the text files carry the same lists.** Session 1's pattern missed them (a note drawn in a box, "changed to read", a
   correction to a page number). They were never silent; four of the tiles were the instrument's error, not the library's.
   **Deviation:** the verification rule registered only marks; HTML list pairs were read by the same standard, and `session3.py`
   gained a `struck_lists` field to carry that (`verify3.json`). Verified run (`session3_verified.json`): S 21 of 258 (8.1 %);
   the same four verdicts.
9. 02:34 UTC. What it comes to. Of 258 books whose text-file note says "corrected" and lists nothing, 237 keep no record of what
   was changed in either file; 17 keep it only in the HTML, as hover text over each corrected word; 4 list it in both and were
   misread. The page's sentence survives, narrowed: for 237 books, not 258 (or 224, the stale count it showed). By the decision
   fixed in `SESSION3.md`, the project closes as a work tonight.
   (Items 7-9 first carried 02:33, 02:36 and 02:38, written ahead of the clock; corrected against it at 02:34.)
10. 02:37 UTC. Building the work, a key error surfaced: seven books counted as listing (group L) list nothing that survived
    reading. Session 2's rows for its 207 books (`session1_rest.json`) are the raw run, written before its pairs were read; session 2
    used the verified pairs for its own counts but left the rows unverified, and tonight's grouping inherited them. Their text files,
    fetched again for these seven only, tested with the registered `SILENT` pattern: four silent (none with an HTML record), three
    other. Corrected (`verify3.json`, `reclassified_from_L`): 262 books say "corrected" and list nothing in the plain text; 4 list
    after all (item 8), 17 keep hover marks, **241 keep no record**. P1 with the four added: 21 of 262 (8.0 %), held. P2 on the 122
    true listing books: 50 with marks (41.0 %), failed as before. The earlier pages' session 2 counts used verified pairs and stand.
11. 02:43 UTC. Built: `silently/index.html` (`build_work.py`). First hover test failed: the readout grew as it filled and the
    squares moved under the pointer; the readout now has a fixed height (and a taller one on narrow screens, placed where the cascade lets it
    win, found on the second screenshot). "No record of which, anywhere" on the first screen claimed more than two files; now "in the
    text or the web edition". The project page continued under its tile sentence; counts at its top moved to the completed sample.
    `render-check.js` gains the work (384 squares, the readout answers a click): all ok at 1440 and 390 px; `surface/check.py` ok;
    `atlas/validate.py` ok. Not done, named: no stranger has seen the work; the 109 "other" books past the cutoff were not fetched; the
    volunteers' guidelines were not read (login). Project closed: `TOOLKIT.md`.
