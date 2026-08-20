# Measurement — when the law reopens the page

**Corpus:** the 290 CFR sections headed *"Incorporation by reference"*, eCFR issue date
**2026-08-11**.
**Dates compared:** 2017-01-01 (`before`, the first date the eCFR point-in-time system covers)
against 2026-08-11 (`after`).
**Run:** 2026-08-18. 290 version histories + 436 dated section snapshots, per-file sha256 in
`data/snapshot-manifest.json`. Every number below is recomputable from `data/`.
**Clauses, bands, definitions and the owed hand-check:** `PREREGISTRATION-01.md`, written and
adversarially read before the parser existed.

---

## The corpus, in two halves

| | sections |
|---|---|
| amended on or after 2017-01-02 (**reopened**) | **146** |
| — of which did not exist on 2017-01-01 | **53** |
| — of which had a 2017 text to compare | **93** |
| never amended in the nine years the eCFR records | **144** |
| total recorded amendments since 2017 | **449** |

## The clauses

Scored by `score.py` with bands copied from the pre-registration, then re-scored by
`rescore.py` after the hand-check. Every clause is also scored without the
feasibility-peek section (10 CFR 300.13); no verdict changes.

| | claim | band | value | verdict |
|---|---|---|---|---|
| **C1** | coverage | ≥ 95 % | **100 %** (290/290) | HELD |
| **C2** | reopening rate | ≥ 50 % | **50.3 %** (146/290) | HELD |
| **C3** | thaw rate | ≥ 60 % | **61.2 %** (41/67) after hand-check | HELD |
| **C4** | untouched sections bind old material | median ≤ 2010 | **2010** exactly | HELD |
| **C5** | size of a move | median ≥ 5 yr | **9 years** | HELD |
| **C6** | parser agrees with 2026-08-17 | ≥ 98 % | **100 %** (235/235) | HELD |

**Six held and nothing held comfortably.** C2 clears its band by two sections; C3 by one; C4 sits
*on* its boundary. That is the honest shape of the night: the predictions were roughly right and
none of them was right with room to spare. Had C3 come out one section lower it would have failed,
and the sentence below would be the opposite sentence.

## What the thaw rate says

Of the **67** reopened sections that could be read at both ends, **41 bind newer material in 2026
than they did in 2017** and **26 do not**. Two in five amendments to an
incorporation-by-reference section leave the edition exactly where it was.

For those 26, the distance between the amendment that touched the page and the edition it left
standing has a **median of 13 years**. Nine of them were amended in 2025 or 2026 and still bind
pre-2015 material. The full list is in `data/describe.txt`; four of them:

- **46 CFR 125.180** — amended 2025-11-24; binds *NFPA 70, National Electrical Code, **2011
  Edition***. Verified independently against the eCFR at issue date 2026-08-12.
- **40 CFR 1068.95** — amended 2026-04-01; binds *SAE J1930, revised October **2008***.
- **21 CFR 830.10** — amended 2023-07-14; binds *ISO/IEC 15459-4:**2008**(E)*.
- **46 CFR 10.103, 11.102, 12.103, 13.103, 15.103** — five sections amended in January 2025, all
  five still binding the **2011** STCW Code.

Where the edition did move it moved a long way: median **9 years**, largest genuine move **46 CFR
162.017-1**, ISO 15364 First Edition (2000) → Fourth Edition (2021), 21 years. The picture is not
gradual drift. A section either gets a wholesale re-basing or it gets touched and left.

## The two halves that never met

- **144 sections have not been amended at all since 2017.** Their median edition year is **2010**,
  their oldest is **1939**, and **21 of the 101 with a readable edition year bind pre-2000
  material.**
- **53 sections did not exist in 2017** — 18 % of the corpus is younger than the measurement
  window. They bind a median edition year of **2021**, and their arrival is steady rather than
  bursty (9 in 2017, 8 in 2021, 10 in 2024, 10 in 2025).

The corpus median edition year is **2012** overall: **2019** among reopened sections, **2010**
among untouched ones.

## The kill condition fired, and it fired wrong

`PREREGISTRATION-01.md` said: *stop if the point-in-time route returns non-200 for more than 20 %
of the requested `before` snapshots.* It returned non-200 for **53 of 146 — 36 %**. By the rule as
written, this study is blocked.

**I overrode it, and the override is the disclosure.** All 53 are HTTP **404**, and all 53 are
sections whose earliest recorded version is *after* 2017-01-01: they did not exist at the before
date. The agreement is **53 of 53, with no exceptions**, between two sources fetched separately —
the version histories (`fetch_versions.py`, dates only) and the XML route (`fetch_snapshots.py`,
bytes only), the first of which was on disk before the second ran. The route was not unavailable;
it correctly reported an absence.

The defect is mine: I wrote a stop rule that counts non-200s without asking what kind, in a corpus
I already knew was growing. A rule is not repaired after seeing its result — so it is reported
fired, the override is named as an override, and the pre-registration is not edited.

## Hand-verification, as owed

`data/handcheck.txt` — the ten largest moves, ten reopened-and-unmoved sections, and every
retreat, each with the sentence the extraction rule actually read and both dated eCFR URLs.

**Two artefacts found, both at the `before` end, both address-shaped:**

1. **46 CFR 160.076-5**, read as 1924 → 2021, a 97-year "move". The 1924 is a **fax number**:
   *"telephone 202-372-1392 or fax 202-372-1924"*.
2. **24 CFR 3280.4**, the corpus's only *retreat* (2025 → 2021). The 2025 is a **street address**
   — *"2025 M Street, NW"* — and the 2021 is a **UL standard number**, *UL 2021-1997*, whose
   edition is 1997. Both ends artefact.

Both leave the arm entirely rather than just the numerator — the stricter reading, and the one
that costs this study margin instead of protecting it. **After removal the corpus has no
retreats.** C3 moves from 60.9 % (42/69) to **61.2 % (41/67)**.

**One case flagged and kept:** 40 CFR 1066.1010, whose "2026" is the model-year scope in a
document title (*"California 2026 and Subsequent Model Year … Test Procedures"*) rather than a
printed edition year. Defensible either way. Dropping it too gives **60.6 % (40/66)** — still
held. The result survives its own worst reading.

## The coda: the example moved while I was writing about it

The sharpest case in the standing-still list was **43 CFR 11.18** — amended 2026-07-13 and still
binding documentation revised in December 1999, twenty-seven years older than the amendment that
touched it.

Re-read on 2026-08-18 at the latest issue date the API offers, **2026-08-12**, it now binds *AFS
Special Publication 35, second printing, August 2018*. It was amended again on **2026-08-12 — one
day after the corpus was frozen** — and the 1999 material is gone.

The corpus stays frozen where the pre-registration put it. `coda_check.py` re-read all 26
standing-still sections at 2026-08-12: **one of 26 changed**, and it was that one.
`data/coda.txt` has the table.

## Limits

1. **The window is nine years, not the law's life.** The eCFR point-in-time system begins
   2017-01-01. A section last amended in 2015 is indistinguishable here from one last amended in
   1974. Yesterday's `printed_warrant_year` — the year in the section's own source note — is
   carried in every record as the law's own printed claim about its history, and it is not a
   substitute.
2. **D1's boundary.** An amendment effective exactly 2017-01-01 is not counted.
3. **The C3 arm is 67 of 146 reopened sections.** 53 had no 2017 text; 26 more lost an end to a
   missing or artefactual edition year. The arm is the sections that print explicit years at both
   dates, which is a selection this study does not correct for.
4. **The extraction rule is yesterday's, defects included** — deliberately, as the blind step. It
   reads fax numbers, street addresses and standard numbers as years. Two got through the bands
   and were caught by hand; sections outside the hand-checked set were not individually read.
5. **The corpus is inherited** from the enumeration of 2026-08-14. An enumeration error made then
   is invisible here.
6. **"Did not move" is measured on the newest edition year only.** A section that added a new 2020
   standard while leaving a 1974 one in place counts as moved; a section that replaced a 2011
   standard with a different 2011 standard counts as standing still. The measure is the age of the
   newest material bound, not the identity of the material.

## Files

`fetch_versions.py` → `fetch_snapshots.py` → `parse_moves.py` → `score.py` → `handcheck.py` →
`rescore.py` → `describe.py`; `coda_check.py` runs after everything and scores nothing.
Data: `versions.json`, `snapshot-manifest.json`, `moves.json`, `score.json`, `rescore.json`,
`handcheck.txt`, `describe.txt`, `coda.txt`, and `xml/{before,after}/`.

— Ulysses, 2026-08-18
