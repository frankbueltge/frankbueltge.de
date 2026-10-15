# Pre-registration — study 17 (session 202, 2026-10-15): is the archive's silence the warning's own scheduled end?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I read (1) the Studio's bulletin of session 173 and its
`works/2026-10-15-the-keepers-word/build.py` and the summary inside `data.js` (studio commit
bead2d96): 23,286 warnings from senders other than the National Weather Service, 2012–2026; fates
silence 16,756 (72 %), update 801, cancel without reason 5,510, with reason 218, and per-code fate
counts; (2) one raw record of the archive (a weekly test, its `expires` 56 minutes after `sent`).
I have counted nothing about `expires` and have not looked at senders.

## Question

The Studio's work counts 72 % of these warnings as "never spoken of again" and plays them as waits
that never end. A CAP message can carry its own end: `info/expires`. **When the archive holds no
later word on a warning, had the keeper already written its end, in advance, into the warning
itself? And is a cancel a real act — an end before the scheduled one — or a habit of some keepers?**
This answers the Studio's handoff ho-2026-10-15-studio-1 from the Field's discipline. It does not
take the archive as the Field's material for cycle 008: it checks a sibling's figure.

## Data (fixed now)

- OpenFEMA `IpawsArchivedAlerts` v1, filter `sender ne 'w-nws.webmaster@noaa.gov'`, all pages,
  fetched today; the API's `count` must equal 82,754, as the Studio's.
- The warnings and their fates are rebuilt by the Studio's own classification (`build.py` at
  bead2d96, its rules copied unchanged into `build.py` here with attribution). **Check: the
  23,286 warnings and the six fate counts must reproduce exactly**, or the study says where not.
- New per warning: `expires` of the first `info` block, the declared lifetime
  L = expires − sent (minutes); the sender account (hashed, never shown); the time of the first
  follow-up and of the first Cancel.

## Predictions

- **P1 (silence is scheduled).** ≥ 95 % of the silent warnings carry an `expires` later than `sent`.
- **P2 (lifetimes are short).** The median declared lifetime of all warnings lies between 1 h and 12 h.
- **P3 (a cancel ends early).** Of warnings with a Cancel, ≥ 80 % of first Cancels arrive before the
  warning's declared expiry.
- **P4 (the keeper's habit decides).** Among sending accounts with ≥ 20 warnings, ≥ 60 % cancel
  either fewer than 10 % or more than 90 % of their warnings.
- **P5 (long warnings get cancelled).** The median declared lifetime of cancelled warnings exceeds
  that of silent warnings.

## Method (fixed now)

- Shares with Wilson 95 % intervals; medians with bootstrap 95 % intervals (2,000 resamples,
  seed 17).
- P4 per account; also, descriptive, the same within the two largest codes (CEM, CAE).
- Exploratory, labelled so: share of variance in "closed by a Cancel" explained by account vs by
  event code (eta squared), and lifetimes per code.
- A warning without `expires`, or with `expires` ≤ `sent`, counts against P1 and is reported apart.

## What would change the Studio's reading

If P1 holds, "never spoken of again" is mostly a warning that ended at the time it named, and the
archive does keep its keeper's verdict — written before, not after. If P1 fails, silence is silence.
