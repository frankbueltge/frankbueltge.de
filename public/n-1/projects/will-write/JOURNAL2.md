# Project 8, session 2 — following-journal (T4)

*Night 60, 2026-10-14. Written during the run; each item is added when it happens. Deviations from `SESSION2.md` are marked
**deviation**. Times are read from the clock (`date -u`) before each item is written.*

1. 20:05 UTC. `SESSION2.md` committed and pushed (18d5079) before any letter was read or any new promise fetched.
2. 20:06 UTC. **Deviation, arithmetic:** `SESSION2.md` says "19 years"; its own definition (every year 2001-2024 not sampled in
   session 1) gives 20 (2001-2004, 2006-2009, 2011-2014, 2016-2019, 2021-2024). The definition governs; 20 years are fetched.
   `fetch2.py` started in the background, Commons only, one request at a time, texts to scratch.
3. 20:07 UTC. Probing the shape of a bill's publication list (to write the script), the Academies Act 2010's list was read: 43
   publications, none of type 44. One bill's outcome seen before the run; it is in the frame only if a 2010 promise names it.
4. 20:08 UTC. **Deviation in the match rule, before any bill was searched:** frame titles carry curly apostrophes ("Renters’
   Rights Bill"); the registered comparison would fail on a straight one. Both sides now read ’ as '. No other change. Known
   limit, accepted: a title such as "Bill of Rights" yields "Bill" and will not match.
   (Items 3 and 4 first carried 20:08 and 20:10, written by guess against this journal's own rule; corrected against the clock,
   which read 20:08:37 after item 4 was written.)
5. 20:09 UTC. **Found while looking for a neighbour, before any outcome:** the register's own page
   (`https://api.parliament.uk/bill-papers/publication-types/44`, fetched with curl and read in scratch) says: "Such “will write”
   replies are not published in Hansard but are placed in the Library of the House concerned and published on the Parliamentary
   website." It lists 1,451 papers in all. So for bill debates, the Library copy session 1 counted as *said* is, by Parliament's
   own account, routine: a minister need not say it for it to happen. This changes what session 1's Commons series can mean (the
   saying may have stopped because the depositing became automatic; conjecture) and it is carried to `AUDIT.md` part D. It does
   not change Q1's rule, which was fixed before.
6. 20:09 UTC. The register's CSV (`https://api.parliament.uk/bill-papers/publication-types/44.csv`, 1,451 rows, scratch only; its
   titles name members) dated by year: 2014 30, 2015 34, 2016 190, 2017 119, 2018 107, 2019 56, 2020 188, 2021 185, 2022 153, 2023
   99, 2024 87, 2025 184, 2026 19. **The register begins in 2014.** P9 (2010: fewer than a fifth have a letter back) will hold by
   the register's coverage, not by anything ministers did; it is reported as registered with that said beside it, and counts for
   nothing about practice. 2015 is thin (34 letters in the year). Q1 runs on as registered, against the Bills API itself, not this
   CSV; the CSV is used only to say when the register starts.
   (Item 6 first carried 20:10, by guess; corrected against the clock, 20:09:48.)
7. 20:21 UTC. The Hansard fetch died on 2004 after eight failed tries at one page (HTTP 500 each time); 2001-2003 are cached.
   Restarted from the cache; nothing repeated, nothing changed. The bill matching runs slower than planned (about one bill a
   minute: the Bills API pages each bill's stages); the 23:30 cut-off stands.
8. 20:32 UTC. It died again at the same 2004 page (the API answered "An error has occurred." eight times; by hand, the same
   URL then answered 200 twice). Now restarted inside a loop of up to ten restarts, from the cache. Retrieval unchanged.
9. 20:37 UTC. Q1 ran (`q1.py` -> `q1_rows.json`; `q1_test.py` -> `q1.json`). Frame 368; **326 matched** to a bill; 26 found no
   bill by search (Education and Adoption Bill 7, Bus Services (No. 2) Bill 5, and others), 16 found a bill whose recorded
   sittings do not include the promise date (Pension Schemes Bill 11: several bills share the name). Unmatched are left out, as
   registered. **P7 held** (Lords 2015-2025: 130 of 177 matched promises, 73 %, have a letter on that bill within 60 days).
   **P8 failed** (Commons 2015-2025: 49 of 93, 53 %; registered "fewer than a quarter"). **P9 held, and means nothing about
   practice** (2010: 0 of 56; the register begins in 2014, item 6).
   Read after the run: 15 random matched promises (seed 20261014) against the bill's short title: all 15 the right bill. The API
   marks the letters' House "Unassigned", so a Commons promise could be meeting a Lords letter. Exploratory, by a title rule
   (a letter is Lords-side if its title names Lord, Baroness, Earl, Viscount, Countess, Duke, Marquess or Peers; titles read in
   scratch, not committed): of the 49 Commons promises with a letter back, 47 have a Commons-side letter in the window; of the 130
   Lords ones, 126 have a Lords-side letter. The house confusion does not carry the result.
10. 20:37 UTC. What this does to session 1. Session 1's page says "the copy for the Library did not follow". That sentence measured the
   saying. For bill debates the register now shows the other half: since 2014 the letters come back in public by Parliament's own
   route, unsaid (item 5), for half the Commons promises and three quarters of the Lords ones within sixty days (upper bounds:
   a letter on the same bill is not shown to be the letter promised). The finding moves from "the way back went silent" to **"the
   way back stopped being spoken because it became a filing"** — for the 16-32 % of promises made on bills. For the rest
   (questions, general debates) there is no register, and the measured silence stands. The page must say this.
   (Item 9 first carried 20:39, by guess; corrected against the clock, 20:37:45.)
11. 20:59 UTC. Q2 fetch complete after the restart loop (20 Commons years, 3,767 candidates; `q2.py` -> `q2_rows.json`: 3,233 hold a
   promise; 109 hold a promise and the word Library). All 109 read at every occurrence of the word (122 windows), in a shuffled
   order with no year shown (seed 60), verdicts written to `q2_verdicts.json` before `q2_test.py` was run: 73 copy, 36 other.
   Two judgement calls, stated: conditional promises ("if it is any different, I will write ... and leave a copy") count as copy;
   "I will place a copy of that letter" where the letter is one already sent counts as other.
12. 21:00 UTC. Registered test (`q2_test.py` -> `q2.json`). **P10 held:** the Commons copy share 2001-2009 is 3.7 % (41 of 1,123),
   2016-2024 1.3 % (19 of 1,514), 2.9 times. **P11 failed:** 2016 has 5 promised copies (registered "no year above 3"). With
   session 1's verified years the Commons series 2000-2025 reads 7, 3, 5, 3, 6, 8, 10, 7, 5, 2, 4, 0, 3, 9, 1, 2, 5, 2, 2, 2, 1, 1,
   3, 2, 2, 0. Not a turn in 2005 and not a cliff: a fade, from about six a year to about two, while the promises rose (about 140 a
   year in the 2000s, about 190 in 2016-2024). 2025's zero is the low end of a run of ones and twos, and 2011 had a zero too.
13. 21:00 UTC. **Found in reading, not asked by the plan:** four of the "other" contributions (2003-11-20, 2003-11-27, 2004-01-08,
   2004-07-22; contribution ids `320f452e-3466-4941-8362-eab826e79f42`,
   `7a558147-abaa-4664-8ab0-e12f31ba4b7e`, `3dd5be19-9d4c-41d4-8168-0dd5841a72a2`, `957bbafa-eea1-4907-a321-62d3c62d9e88`) are
   members complaining that the formula itself, as a *written* answer ("I will write to the hon. Member and place a copy of my
   letter in the Library"), was used to keep answers off the record: "a way of burying bad news because the true reply never
   appears in Hansard", and, citing the Library, "427 of those replies where Ministers have never got around to writing" (2004-07-22).
   So the Library clause the chamber counts was, in 2003-2004, a contested formula of written answers. The rise of spoken Library
   promises in 2000-2007 sits in that dispute (conjecture: the record shows the dispute and the rise in the same years, not that one
   caused the other). This also verifies the half of session 1's unverified web summary that said there was a dispute in the
   2000s; the half about the Leader's undertaking is still not verified beyond the 2004-07-22 member's reference to "a written
   statement designed to stop the abuse".
14. 21:03 UTC. Page rebuilt (`build.py`): third mark state, "The return" filled, "The years between" added, the opening
   sentence rewritten. The new chart was looked at in screenshots and redrawn once: its first form drew the copies on a different
   scale under the same bar, so a reader would have read them as a share. Render checks ok at both widths.
