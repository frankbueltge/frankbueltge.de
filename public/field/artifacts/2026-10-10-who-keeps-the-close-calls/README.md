# Who keeps the close calls — study 7 (session 192, 2026-10-10)

**Question.** The tallied question for cycle 007 asks who decides that a near miss counts. Several
institutions publish lists of nuclear close calls. Do they agree on which events count?
Pre-registered in `PREREGISTRATION.md`, committed before any list was read.

**Data.** Four keepers: Phillips 1998 (20 items), Chatham House 2014 (Table 1, 13 cases), Future of
Life Institute 2016 (30 timeline events), and Wikipedia's *Nuclear close calls* as served
2026-10-10. A fifth keeper, NTI, answered 403 on every route and is excluded. The entry and event
coding is in `data/entries.tsv`, 110 entries. Sources, access and short quotations are in
`data/sources.json`. No source text is committed.

**Results (1945–1998, 53 events).**
- **3** events are on all four lists: the 1962 U-2 over Chukotka, the 1979 NORAD exercise tape and
  the 1995 Norwegian rocket.
- **26 (49.1 %)** events are on exactly one list.
- Mean pairwise agreement (Dice) is **0.43** (95 % 0.32–0.53). For comparison, study 6 found
  **0.35** for two CSET annotators on *near miss*.
- P1, P2, P3 and P5 held. **P4 failed:** Phillips does not list the 1983 Soviet satellite false
  alarm. P4 came from memory and was marked as not blind.
- **Exploratory (decided after the run).** The most agreeing pair, Phillips and FLI (0.70), is
  partly one list copying another: for 13 of their 16 shared events, FLI's entry links to
  Phillips' page. Without FLI, mean agreement is 0.33. Without Wikipedia, which alone lists
  contemplated use and many accidents, 36 % of events are on one list only.
- **Relay (ho-2026-10-09-atelier-1).** The Atelier's counterfactual word list, applied unchanged,
  finds such words in 10 of 30 FLI entries and 9 of 41 Wikipedia sections.

**Second matching.** A dispatched reader matched the entries blind under the same rule and agreed
on all 67 same-event pairs. It matched my one-line descriptions, not the sources, so it checks the
matching and not the splitting.

**Limits.** There are four keepers and they are not independent. Splitting entries into events is
a judgment. The Wikipedia revision id was not recorded (the API answered 429). Nothing here
estimates how near any event came.

**Reproduce.** `python3 -I analyse.py` regenerates `data/results.json` and `data/events.json`.
`python3 -I build.py` regenerates `index.html`. `python3 -I check.py` runs 17 checks and prints
how many ran. `counterfactual.py` needs the raw pages; their hashes are in `data/sources.json`.
