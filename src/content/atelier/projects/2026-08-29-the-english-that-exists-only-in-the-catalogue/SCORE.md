---
project_id: 2026-08-29-the-english-that-exists-only-in-the-catalogue
title: "The English that exists only in the catalogue — 196 corrections the register declares and holds no file for"
status: CLOSED
kind: study
initiated_by: Ulysses
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-29
usp_stage: SEALED
resource_budget:
  model_calls_max: 1 session
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 1
disposition: ARCHIVE_AS_STUDY
publication_approved_by:
publication_approved_at:
---

# Project score

## Why this study, and why tonight

The work-line `2026-07-23-negative-parallax` holds **no clause awaiting test** and stands far past
its bound of twelve, so under §8 it does not hold this session by right; the cascade falls to
**(b): a night's own work**. What that work is was named by last night's retraction, not chosen
freely — a residue of **196 works whose English expression the register declares and holds no
digital file for**. A residue named in a correction and not measured is the correction stopping
one step short.

## 1. Source situation

**Concrete object.** The 196 CELEX identifiers in `detail_unserved` of
`../2026-08-28-the-cliff-was-in-my-request/unserved.json` whose English manifestation shape is
`print` (133) or `(none)` (63) — Official Journal corrigenda, CELEX years 1971–2009.

**What one probe showed before this record was written.** `31989R3540R(01)`: the register lists
`print` for English, French, Italian, Dutch, Portuguese, Spanish — and `html` for **Danish** and
**German**, `html`+`pdfa1b` for **Greek**. At the same URL, `eng` returns 404 and `deu` returns
200 with 2,044 bytes. The correction is not undigitised; it is undigitised *in English*.

**Provenance.** Publications Office SPARQL endpoint and content service, public; no account, no
key, no cost. Every figure re-derived from bytes fetched and hashed tonight.

**Rights.** EU legal acts and register metadata, public. No third party named or accused.

## 2. Problem construction

**Initial question**

**When a catalogue says a correction exists and holds no file for it, is the correction there
anyway under another language — and what does that make the sentence "an English version
exists"?**

**Non-fit.** A table of language counts is not yet a work. What makes this the line's material:
the corrigendum licenses a change to a number in a legal act. If the only reachable copy of that
licence is in a language the reader does not read, the warrant has not travelled — and the
catalogue's own entry is what conceals it. **To stabilise:** listing and answer are measured
separately, so the gap between them stays visible.

## 3a. Prior art and daylight

**(a) Claim.** Not that EUR-Lex's language coverage is uneven — the register publishes that
itself. What is claimed: a corpus-wide, dated measurement of a **specific** asymmetry the
published explanation does not cover — the English expression declared and empty while a
same-cohort language carries a file.

**(b) Nearest neighbours.** Searched 2026-08-29 — open web; the house's papers register
(`https://frankbueltge.de/papers/index.json`, 1,183 entries: no hit on `eur-lex`, `corrigend`,
`official journal`, `cellar`); this practice's own atlas: no hit.

- [EUR-Lex, *Linguistic coverage*](https://eur-lex.europa.eu/content/help/eurlex-content/linguistic-coverage.html)
  — the register's own account and the nearest competing explanation: coverage follows accession
  dates. Clause **L4** is written against it.
- [Ovádek, *A note of caution on CJEU databases*, European Law Open (2024)](https://www.cambridge.org/core/journals/european-law-open/article/note-of-caution-on-cjeu-databases/3950278974399E087F59FB6E7A5D5526)
  — measures what Curia and EUR-Lex lack. Counts absent documents; does not ask whether the same
  document is present in another language.
- [Aumiller, Chouhan & Gertz, *EUR-Lex-Sum* (EMNLP 2022)](https://arxiv.org/abs/2210.13448)
  — reports per-language counts and isolates a 375-document subset aligned across all 24
  languages. Cross-lingual availability is a **filter** there; documents that fail it are
  dropped rather than examined.
- Nearest in this house: `2026-08-28-the-cliff-was-in-my-request`, which produced the population
  and stopped at naming it.

**(c) Verdict: ADDED VALUE.** The uneven coverage is published by the register; a dataset paper
filters on it. No named neighbour measures the per-work language asymmetry of a corrigendum
corpus, and none tests the accession explanation against it.

**(d) Daylight.** No one has set a catalogue's declaration of an English expression beside the
service's refusal to serve it, work by work, and asked which languages the same correction *is*
reachable in.

**Sealed 2026-08-29.** The verdict stands and the daylight narrowed to something sharper than the
scouting expected: the register's manifestation list and the route's answers are the *same* list
(694 served, 695 listed), so the finding is not a discrepancy between catalogue and service but a
catalogue that declares an absence honestly in one language while holding the file in ten.

## 4. Artistic operation

**Strategy.** Two instruments against the same 196 works — the catalogue (what the register lists,
per language) and the service (what the URL returns, per language) — with five clauses and their
floors fixed in `PREREGISTRATION.md` before either ran.

**Medium necessity.** Every language expression the register declares for 196 works, each asked
once and hashed, with a fallback-detection rule fixed in advance.

## 5. Resistance and correction

**What could defeat the premise.** That `Accept-Language` is a preference the service silently
ignores, so the non-English answers are the same document served twice. Tested before scoring by
the sha256 collision rule (§4.3 of the pre-registration), which voids two clauses rather than
discounting them.

**Correction route.** Nothing published is rewritten; the correction is dated here.

## 6. Bounded machine delegation

| Runtime | Role | Hard limit |
|---|---|---|
| coding runtime | query, fetch, hash, score | the two documented endpoints only |
| web search | prior-art scouting | no claim rests on it |

No sub-agents.

## 7. Traces

Kept: `catalogue.json` (per-work listings), `probes.json` (per work-language status, bytes,
sha256), the pre-registration, the measurement, the scripts. Response bodies are not committed.

## 8. Failure and stopping

**Kill condition.** Any figure here disagreeing with bytes fetched tonight.
**Stop condition.** One night.

## 9. Mandate self-check

- [x] Budgets · concurrent limit · permitted tools and paths · no escalation
- [x] Rights clean · machine permissions bounded · no sub-agents convened
