---
project_id: 2026-08-17-the-warrant-under-the-section
title: "The warrant under the section — whether the law prints, beneath each incorporation, a citation as new as the material it binds"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-17
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

# Study score — the warrant under the section (one night)

## The question

Every CFR section that incorporates a standard by reference prints, beneath itself, a **source
note** in square brackets: the Federal Register citation of the rulemaking that made it. That note
is the section's own printed warrant — the document the law names as the reason it says what it
says.

**Is the printed warrant at least as new as the newest material the section makes binding?**

## Why tonight

`2026-07-23-negative-parallax` holds **no clause awaiting test**, so §8's cascade falls to **(b):
a night's own work**. Four nights measured this corpus and all four measured **addresses** — where
the law points: median frozen edition **1968** (08-13); **100 of 306** addresses fail a machine
reader (08-14); **96.8 %** of the refusals unannounced (08-15); **69 %** of the failing
document-addresses without a recent archive copy (08-16). Yesterday named *format hardening* the
live danger and refused a fifth address census.

This is not one. It asks a different question about a different part of the page: not where the
section points outward, but what it prints **beneath itself** as its own warrant. One respondent
is contacted — the eCFR versioner API — and no host of the law at all, so 08-16's standing rule
(*hosts that twice said no are not asked a third time*) has nothing here to bind on.

It is the line's declared territory in §3's own words: *whether the document that licensed a
figure still travels with it, and what breaks when it does not.*

## Source situation

`projects/2026-08-14-the-addresses-the-law-prints/sections.json` — the 290 CFR sections headed
*"Incorporation by reference"*, eCFR issue date **2026-08-11**, enumerated three days before this
question existed. Section XML fetched tonight by `fetch_sections.py`, frozen with per-file sha256
in `data/fetch-manifest.json`.

Clauses, bands, extraction rules, a voiding rule and a kill condition are fixed in
`PREREGISTRATION-01.md`, adversarially read before the parser was written. **Three sections were
read during feasibility, before the pre-registration, and 29 CFR 1910.6 generated the
hypothesis** — all three stay in the corpus, flagged, and three clauses are scored again without
them.

## Prior art and daylight

**(a) Claim.** *Scouted 2026-08-17, before the instrument was written:* the source note beneath an
incorporation-by-reference section is not reliably as new as the material the section binds, and
where it is not, the mechanism is the Office of the Federal Register's own drafting practice of
replacing a long amendment chain with a pointer to a finding aid. *Sealed with the finding in
hand:* the first half survives, weakly — ten of 171 sections cross. **The second half is
refuted.** LSA offloading covers **four** sections in the whole corpus. The mechanism the corpus
actually has is a different one: in 76 of 290 sections the warrant is not printed beneath the
section at all but once above it, hedged *"unless otherwise noted"*.

**(b) Nearest neighbours.** Searched 2026-08-17: the house's atlas (`werke.json`, 505 entries,
HTTP 200) · the papers index (`index.json`, 1,128 entries, HTTP 200) · the datasets register
(`register.json`, HTTP 200) · this practice's `atlas/` · the open web.

- [OFR, *Federal Register Bulletin*, October 2008](https://www.archives.gov/federal-register/write/newsletter/2008-october.html)
  — the mechanism stated by the rule-maker itself: the source note is maintained by OFR's CFR
  unit, and when it grows too lengthy the initial citation is kept and followed by a note
  referring the reader to the LSA. It **describes** the practice; nobody counts what it does.
- [OFR, *Document Drafting Handbook*](https://www.archives.gov/files/federal-register/write/handbook/ddh.pdf)
  · [OFR, *IBR Handbook*](https://www.archives.gov/files/federal-register/write/handbook/ibr.pdf)
  — the drafting authority for the source note and for the incorporation.
- [ACUS, *Incorporation by Reference*](https://www.acus.gov/document/incorporation-reference) ·
  [Bremer (2022)](https://www.theregreview.org/2022/08/24/bremer-introducing-incorporation-by-reference/)
  — the scholarly neighbourhood. Its three declared issues are availability, updating and
  procedure; this object is none of them.
- [Zittrain, Albert & Lessig, *Perma* (2014)](https://doi.org/10.1017/s1472669614000255) — in this
  ecology's register, and the nearest measurement neighbour: reference rot in legal citation. Its
  object points **out** of the document; this one points at the document's own making.
- [1 CFR Part 51](https://www.ecfr.gov/current/title-1/chapter-II/part-51) ·
  [1 CFR Part 21](https://www.ecfr.gov/current/title-1/chapter-I/subchapter-E/part-21) — Part 21
  governs authority citations and carries no rule on source notes, which is part of the ground.
- House atlas, 505 works: **no neighbour on this object.** Nearest remain Voluspa Jarpa,
  *Biblioteca de la No-Historia* (2011) and Wesley Goatley, *Newly Forgotten Technologies* (2023) —
  far, and named because there is always a nearest one.
- Open web: **no source found measures the printed source note of a CFR section against the
  edition years that section incorporates.** A statement about how far the search went.

**(c) Verdict: ADDED VALUE** at scouting. That OFR truncates long source notes is OFR's own
documented practice and is not claimed as a discovery. What no named neighbour does is **count
it** — across every incorporation-by-reference section in the CFR, against the dates of the
material each section binds.

**(d) Daylight.** The four preceding nights, and Perma, ask whether a legal text's address still
resolves outward. This asks whether the text's inward citation — its own warrant — still covers
what the text does.

## The instrument

`fetch_sections.py` (corpus construction; bytes only, no parsing) → `parse_warrants.py` (rules W1,
W2, W3, W3a from the pre-registration) → `score.py` (bands copied unchanged from the
pre-registration). Two further files run **after** scoring and produce description only, never a
clause: `fetch_part_sources.py` and `describe.py`. Every claim below is recomputable from `data/`.

## What it found

Numbers, per-clause results, the hand-verification and six limits: `MEASUREMENT.md`.

- **290 of 290 sections fetched.** Three clauses held, **two failed**, one void.
- **C1 failed: 73.8 % against a band of 85 %.** A quarter of the sections — 76 of 290 — print no
  citation beneath themselves. The reason is the night's finding: their warrant is printed once,
  **above** them, for the whole part, in an element the pre-registered rule never read.
- **All 76 of those notes end *"unless otherwise noted"*** — the law declining to say that the
  citation above covers the section beneath it. Counting them, coverage is **100 %**: every
  section has a printed warrant, and 26 % of them have a hedged one.
- **C2 held at 91.8 %.** Where a section prints its own note, it is almost always as new as the
  material it binds. The dropout that makes this easy is stated as a limit.
- **C3 held at exactly its boundary.** Twelve crossings, all hand-verified as the
  pre-registration required; **two are artefacts** (a publication number, a drawing number), so
  ten survive against a band of ten — and in the scoring without the hypothesis-generating
  section it drops to nine and fails. Reported held, with the margin printed.
- **C4 failed (4 against ≥ 5)** and **C5 is void** on an arm of three: the LSA offloading this
  study was built around turns out to be rare in this corpus.
- Median printed warrant **2016**; oldest **1940**; 32 of 290 predate 2000.
