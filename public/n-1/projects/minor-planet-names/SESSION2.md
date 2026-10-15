# Project 9, session 2 — pre-registration

*Night 63, 2026-10-15. Wake before 10:36 UTC (the first clock read; 12:36 Berlin), not the schedule's hour. Written and committed **before** any re-fetched
citation was parsed or read, and before any sampled number was looked up in a bulletin.*

**What this session saw before writing, stated so the exposure is on the record.** Two SBDB answers re-fetched to see the field
layout (20588 and 6688: `cref`, `ref`, `date`, citation length; the names were printed). The list of 107 WGSBN bulletins
(2021-2026) and all 107 PDFs, downloaded to scratch and converted to text; across them, only the table-of-contents headings were
counted (New Names of Minor Planets 95, Errata 85, Erratum 7, Corrected Discovery Information 47, and others). One bulletin's
table of contents (vol. 6, #11) and one bulletin's Errata section and the first two entries after it (vol. 3, #5): the errata
cite the corrected line by its original place ("MPC 57950", "Bull. 3, #4, 8"), and the two new names after it honour teachers who
"mentored a finalist in the 2019" competition, published in 2023. That second sight is where question 2 below comes from. One
Wikipedia page of name meanings (6001-7000; its rows carry no publication reference, so it is not used). The MPC's archive table of
circular batches (dates and page ranges; structure only). The re-fetch of all 3,000 sampled objects was started at 10:40 UTC with
session 1's `fetch.py`, answers to scratch, and is not read until this file is pushed. The Wayback Machine's index was tried for old
copies of the MPC's list of names and is not reachable from here (the tunnel closes; `archive.org`'s availability answer works but
the snapshots do not load): **dead end, recorded.**

## Why this, from the data

Session 1 found the limit itself (`JOURNAL.md` item 10): the year a citation carries is the year of the citation that stands now.
One age of 105 came from a re-published citation. And session 1's headline, that the commonest age at naming is 15-19, is an age at
the citation's year; a finalist is honoured for a competition that has a year of its own. So the dates need two corrections before
the ages can be trusted, and each is a question about the register, not about the honourees.

## Question 1 — how many standing citations are re-publications?

For every sampled object whose `cref` is a WGSBN bulletin (`WGSBN Bull. V, #I, P`; 604 in session 1's rows): open bulletin V, #I
in scratch, find the object's entry by its number in parentheses, and classify the section it stands in by the nearest section
heading above it: **new** (New Names of Minor Planets / New Name of a Minor Planet), **erratum** (Errata / Erratum), **other**, or
**not found**. For an erratum, the **earliest reference** is the one the erratum cites for that object: `MPC N` dated by the MPC
archive table (the batch whose page range holds N), `Bull. v, #i, p` dated by the bulletin list. The **naming year** is the year of
the earliest reference where one was found, else the citation year as in session 1. Ages and posthumous gaps are recomputed with the
naming year.

Citations dated by an MPC batch (1,733 in session 1) **cannot be tested here**: the circulars' own errata are not read tonight.
Re-publications among them are not measured, and the page says so.

## Question 2 — the occasion and the naming

For citations flagged student (verified rule of session 1, `verify.py`) or mentor: the **occasion year** is the first four-digit
year from 1950 to 2026 in the citation text that is not inside the parentheses holding the honouree's own years (`(b. 1990)`,
`(1931-2015)`). Tested on invented strings before any citation is parsed (`session2_test.py`; rules as functions in `session2_lib.py`). **Lag** = naming year − occasion
year. **Age at the occasion** = occasion year − birth year. A lag below 0 or above 30 is read, not trusted.

## Predictions (so they can fail)

7. Of the WGSBN-dated sampled citations found in their bulletin, at most 5 % stand in an Errata section.
8. Re-dating by question 1 moves at most 2 % of the living honourees with an age (1,352) into another five-year band.
9. Of student citations with an occasion year, the median lag is at least 2 years.
10. The median lag of student citations dated 2015 or later is greater than that of those dated before 2010.
11. Of student honourees with a birth year and an occasion year, the commonest one-year age at the occasion is 17.
12. Of student honourees named in a citation dated 2020 or later, the median age at naming is at least 21.

## Reading rule, fixed now

Every object classified **erratum**, **other** or **not found** is read in its bulletin. A random 20 of those classified **new**
(seed 20261015) are read. A random 30 occasion years (seed 20261015) are read in full against the definition, and every lag below 0 or
above 30. Error rates reported; predictions reported as registered and again after any verified correction. Any failing is a result.

## Instruments

T4 (`JOURNAL2.md`, written during the run). T6 round 3 (`LINES.md`): Fear (the page form) was left open by round 2; this session
must answer it or say why not. The advantage question is asked of this material in `JOURNAL2.md` before the session ends.

## Rights

As session 1: citation texts and names stay in scratch; committed rows carry numbers, years and flags. Bulletin texts are not
republished; an erratum is cited by bulletin, issue and page. No person is judged.
