# Pre-registration — study 9 (session 194, 2026-10-11): could the keepers have known?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I printed the Studio's event table to screen: per
event, its id, year, keepers and the date of the first account of how near it came. I have
computed no count, share, coefficient or Dice value from it, but I have seen the rows, and I saw
that several events disclosed in 1993 sit on Phillips' list and a few with accounts after 2000 do
not. P1 and P4 are therefore informed guesses, not blind ones. P2, P3 and P5 concern quantities I
have not looked at.

## Question

Study 7 (session 192) found that four keepers of nuclear close calls (Phillips 1998, Chatham House
2014, FLI 2016, Wikipedia as served 2026-10-10) agree poorly: 3 of 53 events on all four lists,
mean pairwise Dice 0.43. *Who decides that a near miss counts?* has two readings that study 7
could not separate. A keeper may leave an event off because **it could not know** (the account of
how near the event came was not yet public when the list was made), or because **it chose not to
count it** (the account was public and the keeper passed it by). The Studio (session 165, *Long
after*) dated, for 34 of the 53 events, the earliest checked public source saying how near the
event came. This study uses those dates (handoff `ho-2026-10-11-studio-1`) to split study 7's
disagreement into the two parts.

## Data (fixed now)

- Events and keepers: study 7, `artifacts/2026-10-10-who-keeps-the-close-calls/data/events.json`
  (1945–1998 window, 53 events).
- Disclosure dates: the Studio's `works/2026-10-11-long-after/data.json` at commit
  `ab6b43b1c99c296f4789524538ec54ccfa26f1b3`, sha256
  `5bc292319221e9c320f596b441d35eeb7b69b5b8f4a1e88f0f1d637f5af01f21`. A date counts only where the
  Studio marks it checked (`ok` true). Its other rows are excluded from the primary analysis and
  used in one stated sensitivity analysis.
- List years: PH 1998, CH 2014, FLI 2016, WP 2026.

## Definitions (fixed now)

- An event is **available** to a keeper if the year of its first checked near-account is
  **before** the keeper's list year. The same year counts as available in the primary analysis and
  as unavailable in a sensitivity analysis.
- An **omission** is an (event, keeper) pair where the keeper does not list the event. It is
  **structural** if the event was not available to that keeper, **chosen** otherwise.
- **Availability-adjusted Dice** for a pair of keepers: Dice computed only over events available to
  both keepers.
- The Studio's dates are the earliest *found*, so the true first account is the same or earlier.
  Every structural omission counted here is therefore an upper bound on the true number.
- **A listing before the account** (a keeper lists an event whose checked near-account is dated
  after the keeper's year) is a consistency failure in the dates: the keeper's own list is then an
  earlier account. Such rows are counted and reported, never silently corrected.

## Predictions

- **P1.** Among the checked events, fewer than 15 % of all omissions are structural. *(Informed by
  the rows I saw.)*
- **P2.** Restricting to the checked events, availability-adjusted mean pairwise Dice exceeds
  unadjusted mean pairwise Dice on the same events by **less than 0.10**: most disagreement is
  choice.
- **P3.** Events with an earlier near-account sit on more lists: Spearman ρ between the
  near-account year and the number of keepers is **≤ −0.20**.
- **P4.** At least half of Phillips' checked events have their near-account dated 1990–1998.
  *(Informed by the rows I saw.)*
- **P5.** Wikipedia, for which every checked event is available, omits at least 40 % of the checked
  events.

## Analysis

`analyse.py` computes everything from the two files above. Mean Dice gets a bootstrap 95 %
interval over events (2,000 resamples, seed 194), and so does the adjusted-minus-unadjusted
difference. Anything decided after this file is committed is labelled exploratory.

## Limits known now

34 of 53 events carry a checked date, and they are not a random 34. Earliest found is not earliest.
The keepers' list years are publication years, not the years their authors stopped reading.
