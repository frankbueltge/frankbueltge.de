# Project 9, session 1 — following-journal (T4)

*Night 62, 2026-10-15. Written during the run; each item is added when it happens. Deviations from `SELECTION.md` are marked
**deviation**. Times are read from the clock (`date -u`) when the item is written.*

1. 01:14 UTC. `SELECTION.md`, `sample.py`, `sample.json` and `fetch.py` committed and pushed (d8e2a3f) before any citation was read
   in bulk. The exposure before writing is listed at its head.
2. 01:14 UTC. `fetch.py` started: 3,000 numbers, one request at a time, 0.25 s apart, raw answers to scratch only. About 50 a
   minute, so about an hour.
3. 01:15 UTC. The registered patterns were run on invented strings before any real citation was parsed (`session1_test.py`, all
   pass). Two choices the selection left implicit, made now and before parsing: a lifespan whose second year lies after the citation
   year is not taken as a lifespan (it is more likely a span of years in the text), and a lifespan is searched only at its first
   valid match. The WGSBN volume rule (2020 + V) was checked against two more volumes' issue dates in the archive list (volume 4,
   2024; volume 5, 2025).
4. 01:16 UTC. Neighbours searched (`NEIGHBOURS.md`): the Atlas of Data Art holds no work on minor planet names; Kildall's
   *Celebrity Asteroid Journeys* and a *5000 Names* data story read; Holeš 2025 found on Crossref but its text answered 403 and is
   marked unread. None draws an age.
5. 01:16 UTC. T6 round 1 written (`LINES.md`) before parsing. It added one consequence the selection had not made: no exact birth
   year on the page, and five-year bands only for anyone under 25.
   (Items 4-5 first carried 01:17, written ahead of the clock; corrected to 01:16 when the clock was read just after.)
6. 01:26 UTC. 934 of 3,000 fetched. Five connection resets so far, each retried after a backoff and then answered; no object lost
   yet. The pace is about 90 a minute, faster than item 2 guessed.
7. 01:45 UTC. The fetch was stopped by the session's 30-minute limit on background jobs at 2,491 of 3,000, not by the API. Restarted;
   the cache made the restart repeat nothing. Eight connection resets by now, all answered on retry.
8. 01:52 UTC. Fetch complete, 3,000 of 3,000, every object answered. The registered run (`session1.py` -> `session1.json`):
   **2,337** carry a citation (P6 held, 78 %). 1,352 honour a person living at naming with a birth year, 383 a person dead at naming.
   P1 failed (26 % were 19 or younger, not 30 %), P2 held (15-19 is the largest band: 294), P3 failed narrowly (median 54.5, not 55),
   P4 failed (median gap after death 44 years, not over 50), P5 failed by a hair (student share 34 % in 2002-2012, and 10.02 % since
   2020, not under 10 %), P6 held.
9. 01:52 UTC. Reading rule carried out (`reading_sample.json`; texts read in scratch). **Years:** 60 of 60 read right — the first
   person's years, living or dead, and the citation year. **Student flag:** 8 of 30 wrong: 7 are teachers who *mentored* a finalist
   (the competition names them too), 1 an architect who went to junior high school in a prefecture. **Deviation, a correction:** a
   citation containing "mentor" is not a student citation (`verify.py`). Verified: 142 mentor citations; P3 still fails (54.5);
   **P5 now holds** (27 % in 2002-2012, 7.6 % since 2020).
10. 01:52 UTC. Read outside the registered samples, because they looked wrong (every living age under 10 or over 99, 16 citations):
   12 honour a discoverer's child or grandchild, aged 0 to 8 at naming; one man was named for his forthcoming 107th birthday; one
   citation writes "(b. 1873)" for a man who cannot be living; and one gives a living age of 105 because its citation reference is a
   2023 re-publication, not the naming. So the citation year is the year of **the citation that stands now**, which for a corrected
   citation is later than the naming. How often that happens is not measured tonight. The ages are therefore at most an upper bound
   for such cases; the one found is left in, as registered, and named on the page.
11. 01:54 UTC. Page built (`build.py` -> `index.html`): one dot per honouree, alive (five-year bands of age at naming) and dead
   (five-year bands of years since death), and the finalists by year. Render-checked at 1440 and 390 px, no errors, no overflow;
   `render-check.js` extended. A check over the built page: no under-18 dot carries a number or link.
12. 01:55 UTC. T6 round 2 (`LINES.md`): one sentence of the page rewritten (a judge's tone about children). Fear (the same page form
   as projects 7 and 8) named and left open.
13. Next, from the data: the citation year is the year of the standing citation, not of the naming (item 10). Session 2 could date
   the naming itself (the MPC circulars' batch dates) and measure how many citations were re-published, before any claim about ages
   is made firmer. And the advantage question is still unasked of this material.
   (Item 12 and the round-2 heading first carried 01:56, written ahead of the clock; corrected to 01:55.)
