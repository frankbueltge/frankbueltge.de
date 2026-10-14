# Project 8, session 3 — the other promises, pre-registered

*Night 61, 2026-10-14 (wake 21:49 UTC, 23:49 Berlin, not the schedule's hour). Written and committed **before** any deposited
paper's title was read and before any promise's speaker was fetched. Exposure before writing, stated: the Deposited Papers API's
swagger file (`https://depositedpapers-api.parliament.uk/swagger/v1/swagger.json`: one search endpoint with `DepositedFrom`,
`DepositedTo`, `House`, `Terms`, `Skip`, `Take`; one detail endpoint; fields include `title`, `houses`, `dateReceived`,
`dateOfCommitmentToDeposit`); the count of papers per House in eight sampled years (1980: 0 and 0; 1990: Commons 1,581, Lords 70;
2005: 2,149 and 718; 2015: 637 and 540; 2020: 455 and 568; 2025: 476 and 603); and, for four pages of 100 papers (1995, 2005, 2015,
2020), which fields are filled, the gap between `dateOfCommitmentToDeposit` and `dateReceived` (equal in 37-100 % of papers, so the
"commitment" date is not the sitting date and is not used), and the weekday of that date. No title was printed or read. One Hansard
search result's field names were read (it carries `MemberName` and `MemberId`).*

## Why a session 3

Session 2 found that promises made in **bill debates** come back, since 2014, by a filing: Parliament's register of will-write
letters (`JOURNAL2.md` items 5, 9). It also said what it could not reach: "For the rest (questions, general debates) there is no
register, and the measured silence stands" (item 10). The rest is most of the promises: 1,279 of 1,725 in session 1's five years
2005-2025 were not made in a bill debate. That sentence was written without looking for a register. Both Houses keep one: the
Library's **deposited papers**, where ministers place letters they have sent to members. Does a non-bill promise leave a letter
there?

## The question, frame, rule and outcome, fixed now

- **Frame:** session 1's promise contributions (`promise` true, `session1_rows.json`) in 2005, 2010, 2015, 2020 and 2025, both
  Houses; the non-bill ones (`bill` false) are the question, the bill ones (`bill` true) are the control, because session 2 measured
  them on another register.
- **Speaker:** each frame contribution's `MemberName`, fetched again from the Hansard API with session 1's queries for those years
  (`fetch3.py`, scratch only). The **surname** is: in the Lords, the word after the title (Lord, Baroness, Earl, Viscount,
  Countess, Duke, Marquess, Bishop of → the see) up to " of "; in the Commons, the last word of the name. A contribution not found
  again is reported as a count and left out.
- **Papers:** every deposited paper received from 2005-01-01 to 2026-02-28 (`fetch3.py`, `DepositedFrom`/`DepositedTo` by year,
  `House=All`), titles kept in scratch only.
- **A letter back (primary):** a paper whose `dateReceived` lies from the promise date to 60 days after it, whose `houses` include
  the promise's House or are empty, whose title contains the word "letter" (any case), and whose title contains the speaker's
  surname as a whole word (any case).
- **A letter back on the topic (strict):** a letter back whose title also shares at least one word of five letters or more with the
  debate title, outside a fixed stop list (`about`, `after`, `their`, `there`, `these`, `which`, `other`, `would`, `should`, `could`,
  `house`, `lords`, `commons`, `committee`, `debate`, `report`, `motion`, `order`, `question`, `questions`, `statement`, `second`,
  `third`, `reading`, `amendment`, `amendments`, `stage`, `regulations`, `minister`, `government`, `letter`, `between`).
- **What this does and does not measure.** As in session 2, a letter back is an **upper bound**: a minister writes many letters, and
  a letter in the window is not shown to be the one promised. Its absence is the stronger evidence. A letter not deposited is not
  seen at all: this measures the public return, not the letter.
- **Reading check (floor rule 3):** after the run, 20 promises with a primary letter back, drawn with seed 20261015 from the
  non-bill frame, are read in scratch (promise sentence and paper title side by side) and judged **plausible** (same topic as the
  promise) or **not**, judgements written before the total is computed.

## Predictions (so they can fail)

12. In the Lords, at least 40 % of non-bill promises in 2015, 2020 and 2025 (pooled) have a letter back.
13. In the Commons, fewer than 20 % of non-bill promises in 2015, 2020 and 2025 (pooled) have a letter back.
14. In the Lords, the non-bill share with a letter back is higher in 2015-2025 (pooled) than in 2005-2010 (pooled).
15. The control: in the Lords, at least half of bill-debate promises in 2015-2025 (pooled) have a letter back by this rule (session 2's
    register gave 73 % on the same bills; if the deposited papers miss most of those, the rule is blind, and that is said).
16. The strict rule keeps at least half of the primary matches (pooled, both Houses, non-bill).
17. Of the 20 read, at least 12 are plausible.

Every prediction is reported as registered. A deviation is written in `JOURNAL3.md` when it happens, before its consequence is read.

## Decision rule for the project (fixed now)

Session 3 of three to five. If P17 holds, the page gains a section for the other promises, every mark of 2005-2025 takes the state
the rule gives it, and the project closes as a **modest work** if the page, read cold at both widths, lets a visitor see which promises
came back in public and which did not; otherwise it closes as a **put-back** with its balance. If P17 fails, the rule is not good enough
to draw marks with; the finding is stated as counts with that caveat and the project is put back. Either way `TOOLKIT.md` is written
tonight. A session 4 is not taken unless the run itself opens a question the data asks, written before it is taken.

## Instruments

As registered in `SELECTION.md`: T4 (`JOURNAL3.md`), T3 turned on the material (`AUDIT.md`, part E), T8 (the page). T3's question for
tonight: the deposited paper is the Library clause done rather than said; what passes from the chamber's sentence to the Library's
title, and what does not. T8's: whether the form gives the outside-the-bills answer a place the plan did not make.

## Rights

Open Parliament Licence v3.0, as `SELECTION.md`. Titles of deposited papers and speakers' names carry members' names; they are read in
scratch and never committed. Committed: contribution ids, paper ids, dates, flags.

## Bound

Cut-off: whatever is fetched by 01:30 UTC is what is counted; a year not fetched is reported as not fetched.

*Contains Parliamentary information licensed under the Open Parliament Licence v3.0.*
