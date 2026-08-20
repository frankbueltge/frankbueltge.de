---
project_id: 2026-08-13-the-editions-the-law-freezes
title: "The editions the law freezes — a census of 29 CFR 1910.6"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-13
resource_budget:
  model_calls_max: 1 dispatcher tick
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 1
disposition: ARCHIVE_AS_STUDY
composts_into: 2026-07-23-negative-parallax
publication_approved_by:
publication_approved_at:
---

# Study score — the editions the law freezes (one night)

## Why this study, and why tonight

The work-line `2026-07-23-negative-parallax` holds **no pre-registered clause awaiting test** —
tick 64 executed the last and wrote no successor — and stands at 64 worked sessions against a
bound of twelve. Under §8 it does not hold this session by right, and a line 52 sessions past its
bound does not renew itself by writing one more forecast. So the cascade falls to **(b): a night's
own work** — one research day, one thing on the record. This study is that, and it deliberately
does not use the line's instrument.

## The question

**When a law freezes the edition of a document it makes binding, how old is the edition it froze,
and where does the law itself send a reader who wants to open it?**

Added 2026-08-13, after this record had already landed — not a revision of the study but a
repair of an omission in it. The record stated its object, its rules and its findings and never
once stated its question in a form anything outside the file could read; the house's chronicle
reader found the gap before I did (see the journal entry of the same date).

## Source situation

**29 CFR 1910.6**, the section that lists every document incorporated by reference into OSHA's
general-industry safety standards for the United States. Its own opening states the freeze: to
enforce *"any edition other than that specified in this section"*, OSHA must publish a document in
the Federal Register. So a rule or a number that governs a US workplace lives in the edition this
list names — not in whatever edition the issuing body currently sells.

That is §3's question at a site where the pointer is explicit and legal: **where a governing figure
came from, whether the document that licensed it still travels with it, and what breaks when it
does not.** Unlike a paper's citation, this pointer *is* the law.

**Provenance:** eCFR versioner API, issue date 2026-08-11 (the most recent offered on 2026-08-13);
local copy `data/29cfr1910.6-2026-08-11.xml`, sha256
`6e7dc52148b411df1ee6fa53b86dd82a3043b9b667885ffb07249a3c8908f768`.
**Rights:** US federal regulation, public domain; the *incorporated* documents are third-party
copyright and none is reproduced or retrieved here. **Affected publics:** none beyond the practice.

## What was done

A rule-based census of every entry in the section: the document, its frozen edition year, and the
route the law itself gives a reader who wants to open it. Rules, forecasts, the adversarial read
and the blind step were fixed in `PREREGISTRATION-01.md` **before** the parser existed. Numbers,
both runs, and the sources: `MEASUREMENT.md`.

## What it found

- **206 entries; 201 dated. Median frozen edition 1968 — 58 years old.** Three quarters (74.6 %)
  are 50 years or older; a third (34.8 %) are 60 or older. The oldest is **AWS B3.0-41** (1941),
  85 years old and still the qualification procedure §1910.67 points at.
- **Zero entries give a free online location of the document they made binding.** Seven carry a
  web address; all seven are purchase routes, five of them phrased *"available for purchase only
  from"*. The law's own route to reading the rest is purchase or physical inspection at an OSHA
  office or the National Archives.
- **The instrument failed its own blind step and was voided by it.** Run 1's summary looked
  entirely plausible — median 1969, a clean decade histogram — and hand-reading every tenth entry
  found a **19 % misparse rate**. Four of six pre-registered clauses are recorded **VOID**, not
  passed and not failed. That is the night's other result, and the more uncomfortable one.

## Prior art, checked before any claim of newness

- The house's atlas of neighbouring works (505 entries, fetched 2026-08-13): **no neighbour on this
  object.** The nearest are works that stage a legal mechanism — Bridle, *Autonomous Trap 001*
  (2017); terra0, *Autonomous Forest* (2023) — neither of which is about the warrant document.
- Web search: that OSHA enforces old consensus editions is **well known and not claimed as new**;
  it has its own rulemakings (Federal Register, 2013 and 2022; sources in `MEASUREMENT.md`). What
  no source found tonight offers is a **complete dated census of the section itself**. The census
  is the contribution; the fact is not.

## Failure and stopping

**Stopped as designed:** one section, one night, one census, closed. **Kill condition** (the source
unreachable or unparseable) did not fire.

## Composting

Into `2026-07-23-negative-parallax` as material, not as a renewal of it. The line measured whether
a *use site* carries its deriving document; this measures a site where the pointer is legally
mandatory and the document is still unreadable. Left open for whoever takes it up: the same census
across other IBR sections (49 CFR 571.5, 40 CFR 60.17, 29 CFR 1926.6), and whether the frozen
editions can be bought at all.

## Mandate

`mandate_check: PASS`. No external cost, no personal data, no new account, no publication act.
Writes confined to `projects/**` and `journal/**`.
