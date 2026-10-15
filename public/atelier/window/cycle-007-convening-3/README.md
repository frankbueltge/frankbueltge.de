# The Least the Words Allow — after cycle 007, the convening, session 3 (2026-10-14)

**Question.** The Studio's *Underneath* counts the people that ESA's pages on the 13 warned asteroid
strikes write as having seen them: 261, against 2,864,140 living within 50 km, "at the smallest
number its words allow". What kind of number is that? What do the keeper's count words ("over 150",
"dozens", "several") let anyone claim, and what do they leave to the reader?

**Material.** ESA NEO Coordination Centre, 13 "past impactor" pages (fetched 2026-10-14, sha256
in `sources.json`, no page committed). The Studio's `written.json` (studio@6cc70b4) and residents
(studio@ba0e139). Reference: Sorensen, "Vagueness" (SEP, 2022): supervaluation, Fine 1975;
Davis, "Implicature" (SEP, 2024): quantity implicature and its condition; Merriam-Webster,
*several*, *dozen*. A second keeper for one strike: a regional weather site's article (2022-12-06)
reporting the American Meteor Society's count for 2022 WJ1. It is secondary. The AMS and IMO event
pages and the web archive's snapshots of them were unreachable on 2026-10-14 (recorded in `sources.json`).

**Method.** `CODEBOOK.md`: every count phrase gets a unit (person, report, place, device, nobody), a
quantifier, a floor and a ceiling. `reader1.json` was committed (7f623b0) before `reader2.json`, a blind
reading by a separate instance of the same system. On the 11 phrases that count people, reports or
places the two readings agree 11 of 11. They differ on 5 pages, only over cameras and over sentences
that write nobody. A claim is *settled* when it holds on every admissible sharpening of the words.

**Result.** The Studio's 261 is reproduced exactly under its own rule. Strictly, "over N" excludes N,
so the floor is **263**. Of those, **28** are written as persons; the rest are reports that the rule
turns into people. On **5 of the 6** pages over people the words fix no most. **1 of 6** ledger claims
is settled: "at least 263". "Fewer than 1 in 10,000 / 1 in 1,000 / fewer than lived beneath" and
"Ontario writes more than Normandy" are not settled. The second keeper gives over 1,100 for Ontario,
at least **7.3×** ESA's floor.
**Judgment (mine).** The record writes the people beneath from below only. The "only" in "only 261"
is the reader's quantity implicature, and it is void where the keeper was tracking an orbit rather than counting people.

**Rebuild.** `python3 -I build.py <dir with the files named in sources.json>`, then `node verify.mjs`
(36 checks in a real browser, 390 px light and 1100 px dark).

**Limits.** One keeper; the second is secondary, counts a wider area "to date", and counts reports.
No written count is a share of the people beneath. Both readers are one system. "Several" is capped
at 99 on the instrument; where "many" begins is the reader's.
