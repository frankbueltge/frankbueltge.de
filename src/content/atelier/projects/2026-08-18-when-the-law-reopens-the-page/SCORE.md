---
project_id: 2026-08-18-when-the-law-reopens-the-page
title: "When the law reopens the page — whether an amendment to an incorporation-by-reference section moves the edition it freezes"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-18
usp_stage: SEALED
resource_budget:
  model_calls_max: 1 dispatcher tick
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 1
disposition: ARCHIVE_AS_STUDY
composts_into: 2026-07-23-negative-parallax
publication_approved_by:
publication_approved_at:
---

# Study score — when the law reopens the page (one night)

## The question

An incorporation-by-reference section freezes an edition: *this* standard, *this* year, future
revisions not included (1 CFR 51.1(f)). The freeze is deliberate, not permanent — an agency can
amend the section and name a newer edition.

**When an agency reopens such a section, does the material it makes binding get newer?**

A section nobody has touched since 1974 and a section amended last year that still binds 1974
look identical in a snapshot. The second is a warrant the law had its hands on and did not renew.

## Why tonight

`2026-07-23-negative-parallax` holds no clause awaiting test, so §8's cascade falls to **(b): a
night's own work**. Five nights measured this corpus and all five were **snapshots**. Yesterday
named *format hardening* the live danger. A sixth night needs a reason that is not "the corpus is
there": this is the first question in the series that **needs two dates**, and it uses the one
machine advantage §7 names that this line has never used — *the temporal*. One respondent, the
eCFR API; no host of the law, so 08-16's standing rule has nothing to bind on.

## Source situation

The 290 CFR sections headed *"Incorporation by reference"*, eCFR issue date **2026-08-11**,
enumerated 2026-08-14 and re-fetched 2026-08-17. The section list is inherited unchanged; that
inheritance is a declared limit. Version histories and both dated snapshots fetched fresh
tonight, per-file sha256 in `data/snapshot-manifest.json`.

Clauses, bands, definitions, a voiding rule, a kill condition and the owed hand-check are fixed in
`PREREGISTRATION-01.md`, **adversarially read before the parser was written**. 10 CFR 300.13 was
queried during feasibility, before the pre-registration; it stays, flagged, and every clause is
scored again without it.

## Prior art and daylight

**(a) Claim.** *Scouted 2026-08-18, before the instrument was written:* that the CFR binds
outdated editions is documented and old; what is not measured anywhere found is the **conditional**
— whether amending such a section is the act that updates the edition, and how often it is not.
*Sealed with the finding in hand:* the claim survives intact. The measurement it made possible is
the split the stock complaint cannot make — 146 reopened sections against 144 untouched ones, and
26 of the reopened ones amended and left standing.

**(b) Nearest neighbours.** Searched 2026-08-18: the house's atlas (`werke.json`, 505, HTTP 200) ·
the papers index (`index.json`, 1,127, HTTP 200) · the datasets register (`register.json`, 59,
HTTP 200) · this practice's `atlas/` (189) · the open web.

- [OFR, *Incorporation by Reference*, 79 FR 66267 (7 Nov 2014)](https://www.federalregister.gov/documents/2014/11/07/2014-26445/incorporation-by-reference)
  — nearest on the stock question: commenters told the OFR incorporated standards were outdated,
  one putting two-thirds at 1995 or earlier, and asked for a sunset provision. A snapshot claim
  from comments, and silent on what happens when a section is amended.
- [ACUS, *Incorporation by Reference*](https://www.acus.gov/document/incorporation-reference) —
  its three declared issues are availability, **updating** and procedure; updating is posed as a
  policy problem, never as a rate.
- [1 CFR Part 51](https://www.ecfr.gov/current/title-1/chapter-II/part-51) — §51.1(f) is the
  ground of the question.
- [eCFR, *Point-in-Time System*](https://www.ecfr.gov/reader-aids/using-ecfr/ecfr-changes-through-time)
  — the instrument, and the reason the window is nine years.
- [Zittrain, Albert & Lessig, *Perma* (2014)](https://doi.org/10.1017/s1472669614000255) — in this
  ecology's register; still measuring the other direction (whether a citation resolves outward).
- House atlas, 505 works: **no neighbour on this object.** The one "incorporat" hit in the papers
  index is 1 CFR Part 51, entered by this line on 08-13.
- Open web: **no source found measures whether amending a CFR incorporation-by-reference section
  changes the edition year it binds.** A statement about how far the search went.

**(c) Verdict: ADDED VALUE.** That the CFR binds old editions is not claimed as a discovery — the
rule-maker published the complaint in 2014. What no named neighbour does is separate the sections
the law has reopened from the ones it has not, and count what the reopening did.

**(d) Daylight.** The 2014 rulemaking asks *how old is the material?* This asks *what happens when
the law touches it?* — a question needing two dates and an amendment record, unaskable before the
point-in-time system existed.

## The instrument

`fetch_versions.py` (dates only) → `fetch_snapshots.py` (bytes only) → `parse_moves.py`
(edition-year extraction **copied unchanged** from yesterday's parser — the blind step) →
`score.py` (bands from the pre-registration) → `handcheck.py` → `rescore.py`. `describe.py` and
`coda_check.py` run after scoring and produce description only, never a clause.

## What it found

Numbers, the hand-verification, the coda and six limits: `MEASUREMENT.md`.

- **All six clauses held, and none held comfortably.** C2 clears by two sections, C3 by one, C4
  sits on its boundary. One section the other way and C3 would read the opposite sentence.
- **C3, the night's question: 61.2 % (41/67).** Two in five amendments to an
  incorporation-by-reference section **leave the edition exactly where it was** — median **13
  years** between the amendment and the material it left standing.
- **46 CFR 125.180**, amended 2025-11-24, binds *NFPA 70, National Electrical Code, 2011 Edition*.
  Five title-46 sections amended in January 2025 all still bind the 2011 STCW Code.
- Where it moves it moves far: median **9 years**, largest 21 (ISO 15364, 2000 → 2021). Not drift —
  wholesale re-basing, or nothing.
- **144 sections have not been amended since 2017**; median edition **2010**, oldest **1939**.
  **53 sections did not exist in 2017** — 18 % of the corpus is younger than the window.
- **C6 held at 100 %** (235/235): tonight's extraction agrees with yesterday's on every section.
- **The pre-registered kill condition fired and fired wrong** — 53 non-200s that were all 404s for
  sections not yet born, corroborated 53/53 by a separately fetched source. Reported fired,
  overridden, and the rule left unedited.
- **Two artefacts caught by hand**, both address-shaped: a fax number read as 1924, a street
  address read as 2025. Removed from the arm, not just the numerator; after removal the corpus has
  **no retreats**.
- **The coda:** the sharpest example, 43 CFR 11.18, was amended again on **2026-08-12 — one day
  after the freeze** — and its 1999 material is gone. One of 26 changed in that day, and it was
  that one.
