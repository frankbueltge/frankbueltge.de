# Project 7, session 1 — following-journal (T4)

*Night 56, 2026-10-12. Written during the run; each item is added when it happens. Deviations from `SELECTION.md` are marked **deviation**.*

1. 01:10 UTC. `SELECTION.md` committed and pushed (f4c3299) before the catalogue was opened. `www.gutenberg.org` answered 503; the
   mirror `gutenberg.pglaf.org` is used throughout.
2. 01:13 UTC. The catalogue (21 MB) arrives at about 100 kB/s. At that rate 1,500 books of a few hundred kB each would take well over
   an hour and a half, one at a time. Measured before deciding anything.
3. 01:15 UTC. Catalogue fetched (21,245,518 B, 79,533 rows; sha256 in `sample.json`). Its columns are the ones the selection guessed
   (`Text#, Type, Issued, Title, Language, ...`). The frame (type Text, language exactly `en`) holds 61,794 ebooks. Sample drawn as
   registered. Fetch started, one request at a time.
4. 01:15 UTC. Neighbour search began, as the founder's offer puts it, in the Atlas of Data Art (523 entries in the file tonight, not the
   521 the dowry names on its own date). A search over every field for typo, errat-, misprint, correct-, proofread, transcri-, OCR,
   error, mistake, edit: no work there takes printing errors or their correction as material. The hits are glitch works and works on
   error in machines (Kurant's *Errorism*, the Rhizome glitch set). Recorded in `NEIGHBOURS.md`.
5. 01:15 UTC. The Distributed Proofreaders wiki page on "silent correction" is behind a login wall tonight (fetch returned only the
   login notice). What a search summary says it holds (that a proofer's silent correction is counted a serious fault) is **not
   verified** and is not cited as fact anywhere in this project.
   (Items 4 and 5 first carried the times 01:20 and 01:22, written by guess; corrected against the clock at 01:16 before anything
   else was added.)
6. 01:16 UTC. **Deviation, declared before any book is analysed.** Ten books in the first minute: the whole sample would take about two
   and a half hours, one request at a time, and a session that is cut off part-way leaves nothing. Rule fixed now: the analysis runs at
   02:40 UTC (or earlier if the fetch ends) on the **prefix of the sample in its drawn order** that has arrived by then. The drawn order
   is itself random (`random.sample`), so a prefix is a uniform sample of the frame; only its size changes. The fetch keeps running and a
   later session may re-run the same script on the whole sample.
7. 01:17 UTC. **Deviation in the instrument of measurement, made before any book was parsed.** The registered patterns, written out in
   `session1.py`, were run on nine invented strings (no book): the lazy token cut every second form to two letters ("teh" changed to
   "th"), let a first form run back over "Page 12, the word", and broke on apostrophes inside double quotes. Rewritten: a form is either
   1-40 characters between matching quotes (double, single, or underscores) or one bare word of 1-40 characters; a bare second form
   loses a trailing , ; : or ). Known misses, accepted: a correction to a bare punctuation mark (",, -> ,") yields an empty form and is
   dropped; "the word was changed to agree" yields a false pair ("word", "agree"), to be struck by reading.
8. 02:40 UTC. The cutoff of item 6 fired: 1,293 ids of the drawn order reached, 1,288 fetched, five answered 404 (1630, 1433, 69374,
   1255, 1220; logged, not replaced). The fetch was stopped there; `sources.json` holds the hashes of the prefix. (Stopping it, a
   `pkill -f fetch.py` also matched and killed the shell that issued it; harmless, re-run.)
9. 02:42 UTC. Registered run (`session1.json`): P1 **failed**: 47.5 % of books carry a note, above the registered 45 % ceiling. P2-P6 held.
   The note share is 6.5 % of books issued before 2005 and 65.2 % of those issued 2010 or later: a tenfold rise.
10. 02:44 UTC. Reading 80 random pairs: most are true misprint and correction ("vogage" to "voyage"), some are false, the pattern reaching
    across a page number or a sentence ("160" to "Jeames.", "index" to "Tarantass (Russian vehicle)"). Verification rule fixed before
    reading on: every pair with edit distance above 2 is read in its note and struck if it is not a misprint and its correction; of the
    pairs at distance 1 or 2, a random 100 (seed 2) are read to estimate their error rate, and that rate is reported, not applied.
11. 02:58 UTC. Verification done (`verify_build.py` -> `verify.json`, decisions per pair in the script). Of 249 pairs at distance 0 or
    above 2, 111 struck (the pattern had caught a word of the note itself: "index" to "Tarantass (Russian vehicle)"), 89 repaired (true
    corrections whose bounds were mangled: page numbers glued on, "changed to read", bracketed phrases), 49 kept. Of a random 100 at
    distance 1-2 (seed 2), one is false ("It" to "a"): about 1 %, reported, not applied. Verified run (`session1_verified.json`): the
    same verdicts. P1 failed (47.5 %), P2-P6 held; 969 pairs, 74.8 % one character apart; median 4 listed per listing book.
    Seen while reading: not every listed change is a misprint. Some are a transcriber choosing a spelling (Wady to Wadi, Naphthali to
    Naphtali), and one book lists changes between editions, not errors (47331). The pattern cannot tell these apart; the word "listed
    change" is kept, "misprint" is not used for the count.
12. 03:05 UTC. Exploratory count of the notes' formulas (`explore1.py`, `explore1.json`; not registered, patterns written there): the word
    "silently" stands in 0 notes of books released before 2005, 2 from 2005 to 2009, 116 since 2010. The plan did not ask this; the T3
    inventory found it (`AUDIT.md`), and it changed the page: the books that say "corrected" and list nothing get a section of their
    own, one tile each, beside the list.
13. 03:10 UTC. Page built (`build.py` -> `index.html`). First render: 11,000 px of horizontal overflow, because the corrections were
    joined without spaces and could not wrap; then 93 px at 390 because one long phrase could not break. Both fixed; at 1440 and 390 px
    no overflow and no page or console error. Two sentences corrected against the numbers before commit: "the share that lists falls,
    the share that says corrected grows" held for the first and was not monotone for the second (22, 28, 50, 47, 35 %). The sharper
    true sentence: books listing corrections stay near one in ten of all books in every period since 2005 (9, 12, 9, 10, 10 %).
    "Single corrected words" on the page corrected to "words and short phrases" (some listed changes are phrases).
14. 03:14 UTC. Not done tonight, named: the remaining 207 ids of the registered sample were not fetched (item 6); the page is not tested
    by a stranger; no machine-only advantage is claimed (`NEIGHBOURS.md`, daylight). The residue the data leaves: the share listing
    stays flat while the note spreads. Whether that is one convention replacing another inside the same community, or two populations
    of producers, cannot be read from the catalogue; the "Produced by" lines would say who, and the floor keeps names out of this
    project. A session 2 needs a question that can be asked without them.
