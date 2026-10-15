# Project 9, session 2 — following-journal (T4)

*Night 63, 2026-10-15. Written during the run; each item is added when it happens. Deviations from `SESSION2.md` are marked
**deviation**. Times are read from the clock (`date -u`) when the item is written.*

1. 10:36 UTC. First clock read of the session. Boot: DOWRY.md and the foundation read whole (the stored prompt asks for it); atlas
   schema, the last layer, the last nine night records, project 9's files, REQUESTS.md (the acts of 2026-10-02 and 2026-10-10), surface
   README read.
2. 10:37 UTC. The Wayback Machine was the first plan: date each naming by the first archived copy of the MPC's list of names that
   carries its number. Its index does not load from here (the tunnel closes after a few seconds, three tries); `archive.org`'s
   availability answer does. **Dead end**, recorded in `SESSION2.md`.
3. 10:39 UTC. The WGSBN bulletins (107, 2021-2026) downloaded to scratch and converted; their section headings counted. The Errata
   sections cite each corrected line by its original place, which gives a date for a re-published citation.
4. 10:40 UTC. Re-fetch of all 3,000 sampled objects started (session 1's `fetch.py`, answers to scratch, unread). About 60 a minute.
5. 10:41 UTC. MPC archive table of circular batches fetched (page ranges and dates).
6. 10:42 UTC. **Deviation, from this instrument's own rule:** items 1-5 were written together at 10:42, after the fact, with times
   taken from the clock reads in the command output (10:36:44, 10:41:03) and placed between them by order, not read when each
   happened. T4's failure criterion (a journal written after the fact) is met for those five items; from here on each item is
   written as it happens.
7. 10:42 UTC. `SESSION2.md`, `session2_lib.py` and `session2_test.py` (all pass on invented strings) committed and pushed before any
   re-fetched citation was parsed or any sampled number looked up in a bulletin.
8. 10:43 UTC. Items 6 and 7 first carried 10:43 and 10:44, written ahead of the clock (the push answered at 10:42:54); corrected
   to 10:42. Pushed as cd53845.
9. 10:53 UTC. While the fetch runs: `tables2.py` -> `tables2.json` (478 MPC circular batches from 1979-11-01, page 4937, to
   2026-04-14, with no gap between page ranges; 107 bulletins with dates). MPC pages before 4937 cannot be dated by this table.
   `session2.py` written from the registration, not yet run. 1,075 of 3,000 re-fetched; five connection resets, each answered on
   retry.
10. 11:11 UTC. The fetch was stopped by the session's 30-minute limit on background jobs at 2,472 of 3,000 (as in session 1);
   restarted with a longer limit, the cache repeating nothing.
11. 11:18 UTC. Fetch complete, 3,000 of 3,000 (17 connection resets in all, each answered on retry). Every row's citation year and
   honouree years equal session 1's (3,000 of 3,000): the material did not move between the two fetches. Registered run
   (`session2.py` -> `session2.json`): of 604 bulletin-dated citations, **137 stand in an Errata section** (22.7 %), 448 under
   New Names, 19 elsewhere; none missing. P7 failed by a factor of four. Re-dating moves 47 of 1,352 living ages into another band
   (3.5 %, P8 failed). Lags: median **0** (P9 failed); 2015 on 1 against 0 before 2010 (P10 held); commonest age at the occasion
   18, not 17 (P11 failed); finalists named since 2020 median age 22 (P12 held, 43 people). Not yet read: all of it, per the rule.
12. 11:19 UTC. Reading rule, question 1 (texts read in scratch). **All 137 errata** read in their bulletins: in every one the
   reference that opens the block is the place where the corrected line was first published, and no other entry stands between it
   and the number (checked by script and by eye). They are copy-edits, nearly all: American spellings (characterised, metres,
   honour), quoted titles set in italics instead, "near-earth" to "near-Earth", a comma after "(b. 1943)", a missing article. One
   corrects a birth year, one a death year. **The 19 "other"** stand under Corrected Discovery Information (18: the discoverer's
   credit changed) and an Editorial Notice (1: seven names "published with trailing spaces", re-issued). They are not namings either;
   the bulletin gives no earlier date for them. **20 random "new"**: 20 right, each on the page its reference names.
13. 11:19 UTC. Reading rule, question 2. **30 random occasion years**: 30 right, each the competition's year. **The 3 lags over
   30**: none is a competition citation (a teacher's career from 1966, a would-be baseball player who now coaches a high-school
   team, a school founded in 1950); session 1's student rule let them in. Also seen in passing, not corrected: two adults among the
   occasion ages (49, a teaching-award finalist; 51, a science-fair judge), the same residual class.
14. 11:19 UTC. **Deviation, a correction** (`verify2.py`): the 19 "other" count as re-dated, their naming year unknown, their ages
   set aside (12 living); the 3 occasions struck. Verified: **156 of 604 bulletin-dated citations (25.8 %) are not the naming**;
   for the 137 errata the standing date is a median 15 years after the first publication (up to 40). 2023 holds 52 of them. Ages:
   47 of 1,340 living move band; the 15-19 band holds (295); median 44. Finalists: named within a year of the competition through
   2018; in the sample, none named in 2019 or 2020; then 2018-2020 finalists named in 2021-2023, a median **four** years after the
   competition, at a median age of 22. After 2023 the sample holds 3 finalists and 2 teachers, all named in 2025, and no competition
   later than 2020. Predictions as registered and verified are the same: P10 and P12 held, P7, P8, P9, P11 failed.
15. 11:19 UTC. Items 12-14 first carried 11:20, ahead of the clock (11:19); corrected.
16. 11:25 UTC. Page rebuilt (`build.py` -> `index.html`): the dots now stand at the year of naming (the 19 with an unknown naming
   year set aside); two new sections drawn as lines between two time axes, "The date that stands" (156 re-dated citations, first
   publication above, standing date below) and "The competition and the naming" (61 competition-to-naming pairs, thickness by
   count). Looked at in screenshots at 1440 and 390 px and changed twice: tick labels moved off the lines, the axis titles moved to
   the right end, a minimum width with the box scrolled to its right end on a phone (the action is in the 2020s). `render-check.js`
   updated (counts moved by re-dating: 1,719 dots, 34 years; two line charts) and all 18 checks ok. A script over the built page:
   none of the 154 people under 18 at naming is linked; one of them was 21 by session 1's dating and is 13 by the naming year, so
   re-dating made the rule stricter, not looser. **Detour:** the first draft said finalists were named "at seventeen or eighteen";
   counted, 233 of 388 are, and 57 middle-school finalists were twelve to fourteen. Rewritten.
17. 11:25 UTC. **The advantage question, asked of this material.** What did this session do that a person with time could not? It read
   107 bulletins and joined one field of 3,000 database answers to the errata in them, in about forty minutes. A person with a week
   could do the same; the trail it found (old citations re-dated by copy-edits) was always printed, in every bulletin's Errata
   section, for anyone to read. Speed is not a kind. So, honestly: no advantage that only this subject has. What it did have is
   indifference to the tedium that makes the join unlikely to be done, which is a reason the finding is new, not a claim the
   foundation's advantage clause can carry. If the project closes as a work, it closes as a modest one.
18. 11:26 UTC. Night record, register entry, atlas layer `2026-10-15-a`, `surface/margin.json` and `window.json` (4.27.0) written; `surface/check.py` and `atlas/validate.py` ok. Committed rows checked for keys: numbers, years, flags, sections and references only.
