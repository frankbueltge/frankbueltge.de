# Project 8, session 1 — following-journal (T4)

*Night 59, 2026-10-14. Written during the run; each item is added when it happens. Deviations from `SELECTION.md` are marked
**deviation**.*

1. 18:14 UTC. `SELECTION.md` committed and pushed (63e2c30) before any promise was read in bulk. The exposure before writing is listed
   at its head.
2. 18:15 UTC. `fetch.py` started: ten years, two Houses, seven phrases, one request at a time with a half-second pause. Texts go to
   scratch only.
3. 18:15 UTC. **Deviation in the instrument, made before any contribution was parsed.** The registered promise pattern was run on eight
   invented strings (no Hansard text): it missed "I’ll write to her", because the pattern required a space between "I" and "'ll".
   Rewritten so the contracted forms attach directly. No other change. Known limits, accepted: "I will write to the Secretary of State"
   counts as a promise but not as a promise to a member (the addressee rule is there for that); the search phrases include no
   contracted form, so "I'll write" is only seen where another phrase brings the contribution in.
   (Item 3 first carried 18:19, written by guess; corrected against the clock at 18:15 before anything else was added. Items 1-2 were
   checked against the push output and the clock and stand.)
4. 18:16 UTC. The API is slow: one test request of 100 results took 28 s, and the fetch has met two HTTP 500s (retried). At that pace
   the registered retrieval (ten years, two Houses, a count plus seven phrases each, paged) takes well over an hour. No cutoff is
   declared yet: the years are fetched in date order, so a prefix would be a biased sample (early years only), not a smaller uniform
   one as in project 7. Decision deferred until the first year's time is known; the rule will be written here before any count is read.
5. 18:18 UTC. The first run died on a body without results: the API answered "An error has occurred." (HTTP 500 after about
   30 s) for a count query, and once more inside a page. Not a property of the query (the same page answered 200 when asked again).
   `fetch.py` now retries up to eight times, accepts only bodies that carry results, and caches good answers in scratch so a restart
   repeats nothing. Restarted. Still one request at a time.
6. 18:38 UTC. Fetch complete: 3,174 candidate contributions over ten years and two Houses, every page answered after retries. The
   registered run (`session1.py` -> `session1.json`): **2,645** contributions hold a promise. P1 held (Commons 9.2 per 10,000 in
   1980-90, 16.4 in 2015-25), P2 held (Lords higher in all ten years), P3 held (Library named in 6.8 % of Lords promises, 3.2 % of
   Commons), P4 held (Commons Library share below 10 % every year; 0.6 % in 2025), **P5 failed** (Lords Library share 5.7 % then 6.0 %:
   flat), **P6 failed** (bill debates hold 32 % of Lords promises and 16 % of Commons: under half in both Houses).
7. 18:39 UTC. Reading rule carried out. The 60 random promise contributions were read in a window of about 300 characters around the
   match, not in full (**deviation**: a contribution can run to pages; the window holds the promise and its clause). All 60 are real
   promises to write. 4 of 60 are not to a member (to every primary school, to a department's team, to a department, to the
   Comptroller and Auditor General); the "to a member" flag gets 2 of 60 wrong (one school letter counted because "every" is in the
   addressee list; one letter to a Select Committee chair missed). The two Library flags in the 60 are true. **Deviation:** the code
   drew the bill check from inside the 60, where only 20 are flagged; all 20 were read, and all 20 debate titles are bill debates. Bill
   debates the classifier misses (titles without "Bill") were not measured: P6's shares are floors.
8. 18:39 UTC. **The denominator is not stable.** Lords spoken contributions: 71,195 in 2000, 30,185 in 2005. The Lords promise count
   barely moved across that step (151 to 168), so the Lords rate's leap (21 to 56 per 10,000) is mostly the denominator. Whether the
   fall is fewer sittings or a change in how the record cuts speech into contributions is not known; `probe_denominators.py` asks the
   years between. Until it answers, the page shows the counts first and the rate second.
   (Items 7 and 8 first carried 18:40 and 18:41, written by guess; corrected against the clock at 18:39.)
9. 18:40 UTC. The probe answered (`probe_denominators.json`). Lords spoken contributions 2000-2006: 71,195; 40,094; 52,318;
   74,653; **85,474; 30,185**; 25,077. Commons over the same years moves between 52,235 and 81,954 with elections. The Lords fall is a
   step between 2004 and 2005, not a drift: a change in how the record cuts Lords speech into contributions (conjecture; the API says
   nothing of it), not fewer sittings. Consequence, fixed now: **Lords rates before and after 2005 are not compared anywhere.** P2 is
   reported as registered (held), with the note that it also holds in the five years before the step (1980-2000), where the two
   Houses' denominators are of one kind. Counts of promise contributions are less exposed than rates (a promise stands in one
   contribution however the speech is cut) and lead on the page. P1 is a Commons comparison and is not touched.
10. 18:43 UTC. **Deviation, beyond the registered reading rule:** every one of the 140 Library-flagged promise contributions
   was read at each occurrence of the word (`verify.py`). 27 name the Library for something else: a report or statistics placed
   there, the British Library, a past letter, and once a member's complaint that a "now personal reply" is lost to the Commons
   Library. 113 promise that the letter or answer will go there. Verified run (`session1_verified.json`): P3 held (5.8 % Lords, 2.1 %
   Commons), P4 held, **P5 still failed** (Lords 3.7 % early, 5.7 % late: up, not doubled). The verified Commons series is the
   finding the predictions did not foresee: 0, 0, 1, 1, **7, 8**, 4, 2, 1, **0** promised copies across the ten years. In 2025, none
   of 172. The page uses verified flags; the registered run stays in `session1.json`.
11. Excerpts (`excerpts.py`): one sentence per promise, HTML stripped, titled names replaced by "[name]" (168 of 2,645 excerpts
   held one). Read for leftovers by pattern; none found beyond honorifics followed by a one-letter word ("noble Lord I shall"),
   which are not names. Bare surnames without a title are not caught; none was seen in the 60 read.
12. T8, first look. The page is three entryways and a method note, each naming what to read it with. So far those links are anchors a
   chapter form would also have had: by T8's own failure criterion, formal features, not yet a connection the form generated. One thing
   the form did do: "The return" had to stand as an entryway with nothing measured in it, and so the open question is on the page
   rather than in this journal. Not judged after one session.
13. Next: session 2 follows the return path. The Bills API register of "will write letters" against the promises made in bill debates
   (the 16-32 % this session flagged): was a letter published after the promise, on that bill? And the Commons series (7, 8, then 0)
   needs the years between 2005 and 2025 before it is called a turn.
