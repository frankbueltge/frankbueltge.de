# What the numbers say — the warrant under the section

**Corpus:** 290 CFR sections headed *"Incorporation by reference"*, eCFR issue date 2026-08-11.
**290 of 290 fetched** with HTTP 200 and a non-empty body; the kill condition (fewer than 250)
did not fire. Per-file sha256: `data/fetch-manifest.json`. Recompute with `parse_warrants.py`,
`score.py`, `fetch_part_sources.py`, `describe.py`.

## The clauses, as pre-registered

| | clause | band | result | verdict |
|---|---|---|---|---|
| C1 | sections carrying a `<CITA>` with a year | ≥ 85 % | **73.8 %** (214/290) | **FAILED** |
| C2 | of those, warrant ≥ newest edition bound | ≥ 70 % | **91.8 %** (157/171) | held |
| C3 | sections crossing by ≥ 3 years | ≥ 10 | **12** | held — but see the verification |
| C4 | sections deferring to the LSA | ≥ 5 | **4** | **FAILED** |
| C5 | crossing rate: offloaded − other | ≥ 30 pp | 60.7 pp on n = 3 | **VOID** (arm < 8) |
| C6 | section-level warrants before 2000 | 15–60 | **16** | held, at the edge |

Without the three sections read during feasibility, as the pre-registration requires: C1 73.5 %,
C3 **11**, C4 **3**, C5 void on n = 2, C6 **15** — one section inside its own band.

## 1. C1 failed, and the reason is the finding

**A quarter of the sections print no citation beneath themselves.** 76 of 290 carry no `<CITA>`
element at all. The clause said 85 % would; 73.8 % do.

The pre-registration's adversarial read called C1 *"a floor check, not a discovery"* and expected
it to hold trivially. It did not, and the check it obliged — the ten largest gaps by hand — is
what explained it. In those parts the source note is printed **once, above the sections**, in a
`<SOURCE>` element that rule W1 never looked at. Two examples, verbatim:

> `Source:Reg. GG, 73 FR 69405, Nov. 18, 2008, unless otherwise noted.` — 12 CFR part 233
> `Source:11 FR 188, Jan. 3, 1946, unless otherwise noted.` — 46 CFR part 164

**C1 stands failed as written.** A rule is not repaired after seeing its result. What follows is
description.

## 2. Description: every section does carry a warrant, and 76 of them carry a hedged one

Counting the note a reader actually meets — the section's own where it has one, otherwise the
last `<SOURCE>` above it — **290 of 290 sections have a printed warrant, 100 %.** 214 at section
level, **76 above the section**, in 50 distinct parts.

**All 76 of those notes end with the words *"unless otherwise noted"*.** That is the law
declining to say that the note covers the section beneath it. For a reader asking which document
licensed *this* incorporation, the answer printed on the page is a citation that expressly does
not claim to be the answer.

Median warrant year **2016**; oldest **1940** (17 CFR 260.7a-31 and 260.7a-32, part level);
**32 of 290** warrants predate 2000.

## 3. Where a section prints its own note, it almost always covers what it binds

C2 held at **91.8 %** (157 of 171). The warrant travelling with the material is the normal case,
and this study found no evidence against it.

**The dropout is the limit.** 43 of the 214 sections with a section-level warrant print no
four-digit edition year at all and leave arm E — and these are exactly the oldest sections, the
ones printing bare designations like `A11.1-65`. The pre-registration's adversarial read named
this bias before the run: arm E over-represents modern, year-printing sections, so C2 is easier
to hold than the world warrants.

## 4. The crossings, and what the hand-check did to them

Twelve sections cross by three years or more. **All twelve were verified by hand against the
section text**, as the pre-registration bound the study to do "even if it destroys the clause".
**Two are artefacts:**

- **46 CFR 147.7** — the 2024 is a publication number: *"DHHS Publication No. PHS 84-2024, The
  Ship's Medicine Chest"*. Not an edition year.
- **49 CFR 572.160** — the 2020 is a drawing number: *"Drawing No. 167-2020, Revision A, Spine
  Box Weight"*. Not an edition year.

Ten survive. **C3's band was ≥ 10, so it holds at exactly its boundary** — and in the scoring
without the three feasibility sections it drops from 11 to **9 and fails**. The clause is
reported as held, with its margin stated: it is one artefact away from failing either way.

The survivors, warrant year → newest edition bound:

| section | warrant | newest edition | gap |
|---|---|---|---|
| 29 CFR 1910.6 | 1974 | 2019 | 45 |
| 46 CFR 32.01-1 | 1991 | 2009 | 18 |
| 46 CFR 62.05-1 | 2013 | 2020 | 7 |
| 46 CFR 52.01-1 · 53.01-1 · 54.01-1 · 57.02-1 · 59.01-2 · 61.03-1 | 2013 | 2019 | 6 |
| 46 CFR 56.01-2 | 2016 | 2021 | 5 |

**The largest gap is softer than it looks.** 29 CFR 1910.6's 2019 is a *reapproval* year —
*"ASTM D4359-90 (Reapproved 2019)"* — and the 2026-08-13 study's rule E3 would have stripped it
and read 1990. This study's W3 reads every four-digit year and does not strip reaffirmation
markers; under the earlier rule the gap would be smaller. The flagship case of the hypothesis is
the one that most depends on which rule is used.

Adding the 76 part-level warrants brings the count to **13** crossings; the one it adds is
46 CFR 110.10-1 (1982 → 2021, gap 39), and its warrant is a hedged part-level note.

## 5. C4 failed, and C5 is void

Only **4** sections defer to the List of CFR Sections Affected — 29 CFR 1910.6, and three others.
The band was ≥ 5. The OFR practice of replacing a long source note with a pointer to the LSA is
documented by OFR itself, but across the incorporation-by-reference corpus it is **rare**, and
the offloading I built C5 around therefore has an arm of 3 and is **void** by the study's own
voiding rule. Its direction (60.7 pp) is recorded as description on three cases and is worth
nothing as evidence.

## Limits

1. **Only four-digit years are read.** Sections printing bare designation suffixes lose their
   edition year entirely; 43 sections with a section-level warrant drop out on this.
2. **A four-digit year in a paragraph is not always an edition year.** Two of twelve crossings
   were artefacts of exactly this. The other 159 arm-E sections were not hand-checked; only the
   crossings were.
3. **A reapproval year is counted as an edition year.** See 29 CFR 1910.6 above.
4. **The part-level rule takes the nearest preceding `<SOURCE>`,** which is what a reader meets;
   it does not resolve which rulemaking actually touched the section. Nothing here reads the
   Federal Register itself.
5. **Nothing here measures lawfulness.** Not whether an incorporation was proper, not whether an
   unprinted rule exists, not whether a reader is harmed. Only what the operative text prints
   beneath itself, against what it binds above.
6. **One instrument bug, found and fixed before write-up.** The first part-resolver split the
   section number at the dot, which is wrong where a part numbers its subparts — 43 CFR 3174.3
   is in part **3170** — and it reported three sections as carrying no warrant anywhere. They all
   carry one. The resolver now asks the eCFR ancestry endpoint. The wrong number was never
   published; it is recorded here because the record is the place for it.
