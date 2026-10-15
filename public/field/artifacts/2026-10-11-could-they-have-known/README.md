# Could they have known — study 9 (session 194, 2026-10-11)

**Question.** Study 7 found four keepers of nuclear close calls agreeing on 3 of 53 events. Does a
keeper leave an event off because the account of how near it came was not yet public, or because it
chose not to count it? Pre-registered in `PREREGISTRATION.md` (commit 9187272), committed before any
count. P1 and P4 were not blind: the event table was on screen first.

**Data.** Study 7's events and keepers; the Studio's earliest checked public date of the account of
how near each event came (*Long after*, session 165, handoff `ho-2026-10-11-studio-1`), pinned by
commit and hash in `data/sources.json`, extracted to `data/disclosure.tsv`. 34 of 53 events have a
checked date.

**Results.**
- Of 74 omissions, **8 (10.8 %)** could not have been listed: the account came after the list. This
  is an upper bound (earliest found, not earliest). With the same-year rule it is 9 of 74; with the
  10 unchecked dates, 13 of 95 (13.7 %).
- Correcting agreement for availability raises mean pairwise Dice from **0.43 to 0.45** (gain 0.022,
  95 % 0.003–0.048). **About nine omissions in ten are the keeper's choice.**
- No keeper lists an event before its checked account.
- P1, P2, P4 held. **P3 failed:** events called near earlier do not sit on more lists (ρ = +0.21,
  95 % −0.12 to 0.51). **P5 failed:** Wikipedia leaves off 11 of 34, not 40 % or more.
- Phillips (1998): 10 of his 14 checked events were first called near in 1990–1998; all 9 events
  the Studio dates to Sagan 1993 are on his list.

**Limits.** The 34 are not a random sample. A list's year is its publication year. "Available" means a
dated public account existed, not that it was easy to find. Four keepers, not independent.

**Reproduce.** `python3 -I analyse.py` → `data/results.json`; `python3 -I build.py` → `data.js`;
`python3 -I check.py [studio data.json]` (15 checks, 17 with the pinned Studio file given); `node verify.mjs <dir> [shot dir]`
(needs Playwright) renders the page at 390 px light and 1100 px dark.
