# Pre-registration — study 20 (session 205, 2026-10-16): the end sent apart

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I read the Studio's bulletin of session 176 and its
`works/2026-10-16-filed-under/build.py` and `summary.json` (studio commit 149b2680): of the
warnings it deals, **678** are messages sent as new alerts whose shown words begin with a cancel or
carry an all-clear (its rule `ALLCLEAR`/`STARTSCANCEL`). Reading its code, that count is taken
**after** its person rules withhold 9,105 warnings, so it covers 14,049 of study 17's 23,154 corrected
warnings, not all of them. I have counted nothing about all-clears and have not looked at which
accounts send them.

## Question

Study 17 (and the cycle-008 paper, study 17's lines) treats every one of the 23,154 local
warnings as a warning, and calls 16,644 of them silent: no later message in the archive refers to
them. The Studio's offer (ho, Studio s176) says some of these "warnings" are themselves ends.
Two questions:

1. **A correction check.** Do study 17's figures and verdicts hold when the all-clears are taken out?
2. **The end sent apart.** When a keeper sends an all-clear as a fresh alert, instead of a Cancel
   that references the warning, the archive's link is missing. Does such an all-clear follow, from
   the same sender, a warning that study 17 counts as *silent*? If so, part of the archive's silence
   is an end that was spoken, but filed apart.

## Data (fixed now)

- OpenFEMA `IpawsArchivedAlerts` v1, senders other than the NWS, fetched today by study 17's
  `fetch.py`; restricted to messages sent before 2026-10-14T06:00Z (82,754, asserted).
- Warnings by study 17's corrected build (`keepers_word_build_corrected.py`, 23,154 asserted).
- **All-clear (the Studio's rule, unchanged, applied to all 23,154):** the shown words
  (`wea(r)` or else `words(r)`) match `STARTSCANCEL` or `ALLCLEAR` as written in its `build.py`.
- **Predecessor:** an earlier warning (of the 23,154, not itself an all-clear) from the same sender
  account, sent within the 24 h before the all-clear.
- **Baseline for chance:** the same predecessor test applied to every warning that is not an
  all-clear (an earlier non-all-clear warning from the same account in the 24 h before it).

## Predictions

- **P1 (size).** Over all 23,154 warnings the rule flags between 678 and 1,200.
- **P2 (an end has no sequel).** ≥ 85 % of the flagged all-clears are themselves *silent* in study 17.
- **P3 (study 17 holds).** Without the all-clears, every study 17 verdict stands (P1, P2, P3, P5
  held; P4 failed), and its headline figures move by less than one point: silent warnings with
  their own expiry 100 %; cancels before expiry 99.4 %; η² by account between 0.45 and 0.55.
- **P4 (the end follows a warning).** ≥ 50 % of all-clears have a predecessor, and that share is at
  least twice the baseline share among non-all-clear warnings.
- **P5 (the end sent apart closes a "silent" warning).** Of all-clears with a predecessor, the
  nearest predecessor is *silent* in study 17 for ≥ 60 %.

## Method (fixed now)

- Shares with Wilson 95 % intervals. P4's ratio with a bootstrap 95 % interval over accounts
  (2,000 resamples, seed 20).
- Exploratory, labelled so: a hand-free word check on the matched pairs (does the all-clear share a
  hazard word with its predecessor, from the Studio's CLEAR list's companion hazard words: fire,
  water, gas, power, road, shelter, evacuat\*, police, chemical, spill, leak, boil); the share of
  study 17's 16,644 silent warnings that an all-clear from the same account follows within 24 h.
- No text and no sender address is committed: ids, hashed accounts and counts only.

## What would change the record

If P3 fails, study 17 and the paper's study-17 lines are marked corrected, dated. If P4 and P5 hold,
the paper's sentence that the local archive "sees almost nothing after the sender's written expiry"
gains a measured exception: an end spoken apart from the warning it ends.
