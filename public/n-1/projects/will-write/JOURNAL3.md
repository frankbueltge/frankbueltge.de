# Project 8, session 3 — following-journal (T4)

*Night 61, 2026-10-14. Written during the run; each item is added when it happens. Deviations from `SESSION3.md` are marked
**deviation**. Times are read from the clock (`date -u`) before each item is written.*

1. 21:52 UTC. `SESSION3.md` committed and pushed (4550e37) before any deposited paper's title was read or any speaker fetched. One
   arithmetic slip caught before the commit, not after: the draft said "1,269 of 1,566"; `session1_rows.json` gives 1,279 non-bill
   of 1,725 promises in 2005-2025.
2. 21:53 UTC. **Deviation in the surname rule, written into `q3.py` before any speaker name was read:** the registered Lords rule
   ("the word after the title up to ' of '") returns nothing for a territorial title ("Earl of X"); such a name now gives the words
   after "of". "Lady" is added to the list of titles, and a leading "The" is dropped. No other change. `fetch3.py` started in
   the background, two processes (Hansard speakers, deposited papers), texts and titles to scratch only.
3. 22:01 UTC. Speakers fetched: all 1,725 frame contributions found again. **Deviation, before any match was run:** 82 carry no
   member name in the Hansard API (73 of them Lords 2005, member id -1; 9 others with none). The registered rule would score them
   "no letter back" by default, which would push P14 toward holding. They are left out like contributions not found, and reported
   as a count. `q3_test.py` filters on a named speaker.
4. 22:08 UTC. Papers fetched: 36,783 deposited papers received 2005-01-01 to 2026-02-28 (every year complete, no retries). `q3.py` run;
   it prints no shares. The 20-promise reading sheet read in scratch (promise sentence, debate title, every matched title in full)
   and judged before `q3_test.py` was run: **5 of 20 plausible** (`q3_verdicts.json`). The other 15 are a minister's letters
   on other subjects inside the sixty days. What reading showed that the rule does not use: the Library's titles often name the
   occasion themselves ("raised in the debate on ...", "raised during a question on ..."). The name-and-window rule finds the
   minister who writes much, not the letter promised. P17 fails before any share is seen; by the registered decision rule the marks
   will not be drawn from this rule.
5. 22:08 UTC. Registered test run (`q3_test.py` -> `q3.json`). P12 held (Lords 2015-2025, 408 of 473), P13 failed (Commons, 144 of
   367, registered "fewer than 20 %"), P14 held (Lords 86 % against 74 %), P15 held (control, 168 of 204), P16 failed (strict keeps
   307 of 769). **None of the shares means what it was registered to mean:** with 5 of 20 plausible, they measure how often a
   minister deposits *some* letter within sixty days, not the return of the promise. The control's 82 % against session 2's 73 %
   says the same: this rule finds more than the register does, because it finds anything. **Exploratory, not registered:** 20
   strict matches (non-bill, seed 20261016) are read now, to learn whether the debate-word rule is precise enough to name in the
   toolkit account. Its result changes no prediction and not the decision rule.
6. 22:09 UTC. Exploratory read of 20 strict matches, judged before any strict share was computed (`q3_strict_verdicts.json`):
   **12 of 20 plausible** (the Library's title names the debate or its subject; the misses are another instrument with a shared
   word, another bill, a deposit of some other document). Then the strict counts, non-bill: Lords 2015-2025 195 of 473, 2005-2010 48
   of 182; Commons 2015-2025 38 of 367, 2005-2010 26 of 211. Read with the 12 of 20, a rough **estimate**: in the Lords perhaps a
   quarter of promises made outside bills leave a letter on their subject in the Library's list within sixty days; in the Commons
   perhaps one in twenty. The strict rule also misses letters whose titles share no debate word, so this is neither a floor nor a
   ceiling. Not registered; stated as an estimate wherever it is used.
7. 22:09 UTC. **Decision, by the registered rule:** P17 failed, so no mark is drawn from this rule; the page states the counts with the
   caveat, and project 8 is **put back** with its balance (`TOOLKIT.md`). The run did open a question the data asks: the Library
   titles name their occasion ("raised in the debate on ...", "raised during a question on ..."), so a rule that reads the title's
   occasion against the debate, not the speaker's name, might reach the return. It is written into the toolkit account as the
   problem a return to this material would start from; it is not taken as a session 4 tonight, because the registered rule said
   put back, and the rule was written so that it could not be argued with after the fact.
