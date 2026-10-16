# Project 9, session 3 — pre-registration

*Night 64, 2026-10-16. Wake 01:02 UTC, the schedule's hour (first clock read 01:10 UTC). Written and committed **before** any
re-fetched answer was read and before any sampled number was looked up in a circular.*

**What this session saw before writing, stated so the exposure is on the record.** The MPC archive table of circular batches
(fetched again; its PDF links counted, 494 MPC batches). Three batch PDFs downloaded to scratch and converted: 2019-12-12 (its
section headings only; it holds no names section), 2001-03-09 and 2014-06-13 (their section headings, and the first two to three
entries under NEW NAMES in each, printed: five citations, one of them for a sampled object, 4384, an honouree dead at naming, whose
row session 2 already holds). Neither of the two names batches has a section whose heading speaks of errata, corrigenda or
citations; how the circulars printed a corrected citation is therefore **not known** to this session. Seven SBDB answers for
unsampled or session-1-test numbers, `cref` and `ref` fields only (2001, 4000, 9000, 12000, 20000, 30000, 100000): the `cref` of an
MPC-dated citation names its batch date, either "MPC batch dated YYYY-MM-DD" or "YYYYMMDD/MPCPages.arc". The re-fetch of the
1,733 MPC-dated sampled objects was started at 01:12 UTC with `fetch3.py`, answers to scratch, and is not read until this file is
pushed.

## Why this, from the data

Session 2 measured, for the 604 citations dated by a WGSBN bulletin (2021-2026), that 156 are not the naming. It could not measure the
1,733 dated by a Minor Planet Circulars batch (before 2021), and the page says so. Those are three in four of the sample's dated
citations, and nearly all its finalists. Before this project decides between a work and a put-back, the one limit it has named and
not measured is measured, or shown unmeasurable.

## Question 3 — are the circulars' standing citations the naming?

For every sampled citation whose `cref` names an MPC batch date: download that batch's MPC PDF from the archive
(`https://minorplanetcenter.net/iau/ECS/MPCArchive/YYYY/MPC_YYYYMMDD.pdf`), convert it with `pdftotext` (non-layout), and classify the
object by `session3_lib.classify`: **new** if a line opening with "(number)" stands under a NEW NAMES heading; **correction** if under a
heading that speaks of errata, corrigenda, corrected or revised citations; **other** if under any other heading; **not found** if no such
line. For entries under NEW NAMES, **refers** flags an entry text that cites an earlier "MPC n" page or speaks of replacing or correcting
a citation. Where a correction or a referring entry cites "MPC n", the **earliest reference** is that page, dated by session 2's batch
table; the naming year becomes its year. A batch dated before 1979-11-01 (the archive's first) or whose PDF does not answer is
**untestable**, counted. Ages and posthumous gaps are recomputed from session 2's rows with the new naming years.

## Predictions (so they can fail)

13. Of MPC-dated citations whose batch PDF answers and whose entry is found, at most 5 % stand outside a NEW NAMES section.
14. The entry is found in its batch for at least 95 % of the citations whose batch PDF answers.
15. Of entries found under NEW NAMES, at most 2 % are flagged **refers**.
16. After session 2's and tonight's re-dating together, the largest five-year band of age at naming among living honourees is still 15-19.
17. Tonight's re-dating moves at most 2 % of living honourees with an age into another five-year band.

## Reading rule, fixed now

Every object classified **correction**, **other** or **not found**, and every **refers**, is read in its batch. A random 20 of the
**new** (seed 20261016) are read: is the entry the object's, is it under NEW NAMES, is the batch the `cref`'s? Error rates reported;
predictions reported as registered and again after any verified correction. Any failing is a result.

## Decision rule, fixed now

This is the session that decides. **A modest work is declared** if, after verification, (a) P16 holds — the headline the project would
show, that the commonest age at which a living person is written into the sky is 15-19, survives every correction this project can
make — and (b) tonight's neighbour search (the Atlas of Data Art grepped again; one fresh web search; Holeš 2025 tried again) finds no
work or study that draws the age at naming. Otherwise **the project is put back**, its page standing as a study. Either way a toolkit
account closes it tonight. A fourth session is taken only if the reading check finds more than 10 % of read classifications wrong, and
its reason is written before it is taken. The advantage question stays answered as session 2 answered it (`JOURNAL2.md` item 17) unless
tonight finds a reason to revise it; no machine-only advantage is claimed in advance.

If a work is declared, its form is decided now so the data cannot choose it: **the age distribution alone**, on a page of its own, one
dot per living honouree at the naming year (and one per dead honouree at the years since death, apart), under one sentence a stranger
can read without this record. The project page stays the study.

## Instruments

T4 (`JOURNAL3.md`, written during the run). T6 round 4 (`LINES.md`), at the decision: Power (self-canonisation) is the danger a
declaration names, and Fear (the page form) is re-asked of the work's page.

## Rights

As sessions 1-2: citation texts, names and circulars stay in scratch; committed rows carry numbers, years, flags, section headings and
MPC page numbers. No person is judged. Under-18 honourees carry no number or link on any page. The circulars are © the Minor Planet
Center; nothing of them is republished.
