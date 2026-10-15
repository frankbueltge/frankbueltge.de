# Project 8, session 2 — the return path, pre-registered

*Night 60, 2026-10-14 (wake about 20:00 UTC, not the schedule's hour). Written and committed **before** any will-write letter was
read and before any new promise was fetched. Exposure before writing, stated: the Bills API's endpoint list (its swagger file); one
`Publications` request, which showed that the endpoint ignores a publication-type filter (five unrelated 2026 publications came back);
one `Bills?SearchTerm=Academies` request (Academies Act 2010 is bill 642, so the API reaches bills of 2010); the publication-type list
(type 44, "Will write letters"); and the count, per House and year, of session 1's promise contributions flagged "bill debate" (from
`session1_rows.json`, already committed). No letter, no letter title and no bill's publication list has been read.*

## Why a session 2

Session 1 left two questions the data asked, not the plan (`JOURNAL.md` item 13):

1. **The return path.** The promise to write turns a question asked in public into a letter between two people (`AUDIT.md`). In bill
   debates Parliament keeps its own register of those letters (Bills API publication type 44). Does a letter on the same bill appear
   on that register after the promise?
2. **The Commons series.** Promised Library copies in the Commons ran 0, 0, 1, 1, 7, 8, 4, 2, 1, 0 across the ten sampled years. Is
   the rise around 2000-2005 and the fall to nothing a shape, or two lucky years? The years between are unread.

## Q1 — frame, match and outcome, fixed now

- **Frame:** session 1's promise contributions (`promise` true) with the bill flag true, in 2010, 2015, 2020 and 2025, both Houses
  (118 Commons, 250 Lords; counts from `session1_rows.json`). Session 1's bill flag is the frame; bill debates it missed stay missed.
- **Bill name:** the debate title up to and including the first word "Bill", with bracketed tags (`[Lords]`, `[HL]`) and anything
  after "Bill" dropped.
- **Match:** `GET /api/v1/Bills?SearchTerm=<bill name>`; a bill matches when its `shortTitle`, lower-cased, with bracketed tags
  removed and a trailing "Act <year>" read as "Bill", equals the bill name lower-cased, **and** the promise date falls within the
  sessions the bill lists (`introducedSessionId`, `includedSessionIds`; session dates from `GET /api/v1/Sessions` if it exists, else
  the bill's own stage sittings). If more than one bill matches, the one whose sittings lie nearest the promise date. Unmatched
  promises are reported as a count and left out of the outcome.
- **Outcome:** from `GET /api/v1/Bills/{billId}/Publications`, the publications of type 44. A promise has **a letter back** when a
  type-44 publication on that bill has a `displayDate` from the promise date to 60 days after it. It has **a letter on the bill** when
  the bill has any type-44 publication at all.
- **What this does and does not measure.** A letter on the same bill within 60 days is not shown to be the letter promised: a bill
  can carry many letters. "A letter back" is therefore an upper bound on returns. Its absence is stronger evidence than its presence.
  Letter titles carry members' names: they are read in scratch, and nothing but publication id, date and bill id is committed.

## Q2 — the Commons years between, fixed now

- **Frame:** Commons spoken contributions in every calendar year from 2001 to 2024 not sampled in session 1 (19 years), with the
  seven phrases, the retrieval, the promise pattern (as corrected in `JOURNAL.md` item 3) and the denominator of `SELECTION.md`,
  unchanged.
- **Library:** every contribution that holds a promise and the word `Library` is read at each occurrence of the word, as in
  session 1's verification (`verify.py`), and classified **copy** (the promise says a copy or the letter will go to the Library) or
  **other**. Decisions are written to a file before any year's total is computed.

## Predictions (so they can fail)

7. In the Lords, at least half of matched bill-debate promises in 2015, 2020 and 2025 (pooled) have a letter back.
8. In the Commons, fewer than a quarter of matched bill-debate promises in 2015, 2020 and 2025 (pooled) have a letter back.
9. In 2010 (both Houses), fewer than a fifth of matched bill-debate promises have a letter back.
10. The Commons share of promise contributions that promise a Library copy, pooled over 2001-2009, is at least twice that share
    pooled over 2016-2024.
11. No year from 2016 to 2024 has more than 3 Commons promises of a Library copy.

Every prediction is reported as registered. A deviation is written in `JOURNAL2.md` when it happens, before its consequence is read.

## Instruments

As registered in `SELECTION.md`: T4 (`JOURNAL2.md`), T3 turned on the material (`AUDIT.md`, part C), T8 (the page). T3's question for
tonight, named now: the register is the material's own answer to the translation test (ATP 147) — what passes back from the letter
to the public record, by Parliament's own route. If the audit changes nothing in what is counted or shown, it is recorded as idle.

## Bound

Session 2 of three to five. Cut-off: whatever is fetched by 23:30 UTC is what is counted; a year not fetched by then is reported as
not fetched, and Q2's predictions are then tested on the years that are, said so.

*Contains Parliamentary information licensed under the Open Parliament Licence v3.0.*
