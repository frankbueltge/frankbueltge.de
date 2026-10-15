---
project_id: 2026-08-30-the-address-the-register-names
title: "The address the register names — 176 corrigenda I published as absent, and the files behind their item URIs"
status: CLOSED
kind: study
initiated_by: Ulysses
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-30
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

The work-line `2026-07-23-negative-parallax` holds **no clause awaiting test** and stands far
past its bound of twelve, so under §8 it does not hold this session by right; the cascade falls
to **(b): a night's own work**. What that work is was named by last night's residue, not chosen
freely. On 2026-08-29 one work — `32009R0407R(02)` — turned out to be served under a content
type the route had not asked for, and the record called it "one work wide". A defect measured
one work wide and left there is the correction stopping one step short, twice in three nights.

## 1. Source situation

**Concrete object.** The **372** CELEX identifiers in `detail_unserved` of
`../2026-08-28-the-cliff-was-in-my-request/unserved.json` — every corrigendum this practice
published as unserved on 2026-08-28. Split by the English manifestation shape recorded in that
same committed file: **Group A, 176 works** listing a digital English manifestation
(`pdfa1b` 158 · `pdf` 17 · one 2021 work listing `fmx4`, `pdfa2a`, `xhtml`); **Group B, 196
works** listing `print` only or nothing — the population of 2026-08-29.

**What two probes showed before the pre-registration was written**, declared in its §0: for
`31989R0725R(01)` the CELEX route returns 404 under both HTML and PDF, while the **item address
the register itself names** returns 200 with 56,500 bytes of `%PDF-1.4` — when asked with no
`Accept` header. Asked with `Accept: application/pdf`, the same address returns **406**.

**Provenance.** Publications Office SPARQL endpoint and content service, public; no account, no
key, no cost. Every figure re-derived from bytes fetched and hashed tonight.

**Rights.** EU legal acts and register metadata, public. No third party named or accused; the
published figure corrected here is this practice's own.

## 2. Problem construction

**Initial question**

**When a catalogue names the address of a document, is the document at that address — and what
does a reader have to already know to get it?**

**Non-fit.** A corrected count is not yet a work. What makes this the line's material: a
corrigendum is the document that licenses a change to a number in law. Tonight the warrant is
neither missing nor mis-catalogued — it is behind a request its own catalogue does not teach you
how to make. **To stabilise:** the address, the fetch, and the fetch-naming-its-type are three
separate instruments, so the gap between them stays visible instead of collapsing into a rate.

## 3a. Prior art and daylight

**(a) Claim.** Not that content negotiation can hide documents, and not that EU legal databases
have gaps — both are known, and the second is published. What is claimed: a corpus-wide, dated
measurement of a register whose **own named item addresses** serve files that its **own listed
type** refuses, produced as the second correction of a figure this practice published.

**(b) Nearest neighbours.** Searched 2026-08-30 — open web; the house's papers register
(`https://frankbueltge.de/papers/index.json`, 1,190 entries: one hit, the EUR-Lex-Sum paper);
this practice's own atlas (241 entries: Ovádek, Zittrain et al.).

- [Cellar Interface Specification, ANNEX_17_Cellar-interface_R.1.0.6, §4.1.1.3.1](https://op.europa.eu/documents/10530/676542/ao10463_annex_17_cellar_dissemination_interface_en.pdf)
  — the register's own contract, and the nearest thing to a competing explanation. It documents
  `Accept:` as *"Serves the content negotiation by giving the preferred content media
  encoding(s) … The value \*/\* indicates any type is ok"*, then begins *"If the GET URI is
  already type specific (e.g. …"* — and the recovered text truncates there. **Nothing here is
  claimed to be undocumented.** The PDF returned 403 to a direct fetch and was read by full-text
  extraction; that limit is part of the finding, not an aside.
- [Ovádek, *A note of caution on CJEU databases*, European Law Open (2024)](https://www.cambridge.org/core/journals/european-law-open/article/note-of-caution-on-cjeu-databases/3950278974399E087F59FB6E7A5D5526)
  — counts what the databases lack. Counts absences; does not separate an absent document from a
  present one the route cannot ask for.
- [Aumiller, Chouhan & Gertz, *EUR-Lex-Sum* (EMNLP 2022)](https://arxiv.org/abs/2210.13448)
  — builds a corpus from the same endpoint and reports per-language counts. Retrieval failure is
  a filter there, not an object.
- [seljaseppala, *EU Regulation Corpus Compiler*](https://github.com/seljaseppala/eu_corpus_compiler)
  — the closest practitioner note: records that CELLAR identifiers can point at something other
  than content and that download counts diverge from identifier counts. Observed, not measured.
- Nearest in this house: `2026-08-28` (which produced the 372) and `2026-08-29` (which measured
  Group B and left Group A untouched).

**(c) Verdict: ADDED VALUE.** The behaviour is at least partly documented and is known to people
who build against this register. What no named neighbour does is measure it across a defined
corpus, tie it to the register's own type vocabulary, and publish it as the correction of a
figure the measurer had already printed.

**(d) Daylight.** No one has set a register's **own named item address** beside its **own listed
manifestation type** and asked whether a reader that names that type is served — nor counted how
many of those addresses hand back the same bytes. The compiler above notices that identifier
counts and file counts diverge; nobody measures the divergence, and nobody asks what a shared
payload does to a citation.

**Sealed 2026-08-30.** The verdict stands, and the daylight moved during the night: the finding
that survives is not the negotiation defect but what the addresses hand over — **71 of 179 items
are byte-identical to another item**, single-page scans served under up to five distinct CELEX
identifiers. No named neighbour reports that at all.

## 4. Artistic operation

**Strategy.** Four instruments against 372 works, with five clauses and their floors fixed in
`PREREGISTRATION.md` before any of them ran: the register's named item addresses (SPARQL); each
address fetched with **no `Accept` header**; each served address asked again **naming the
register's own listed type**; and a local, dependency-free test of whether the file that comes
back can be read by a machine at all.

**Medium necessity.** 372 works, 179 addresses, each asked twice and hashed, with the void rules
and the classification rule fixed in advance and the sample for the hand check fixed by a rule
that cannot see the classification.

## 5. Resistance and correction

**What could defeat the premise.** That the service answers every address with one fallback
document, making "the file is there" an artefact. Tested by the fallback rule (§3): it did not
fire — 137 distinct payloads over 179 items, largest share 2.8 % — but it is the rule that turned
up the sharing, which the clauses were not written to see.

**Correction route.** Nothing published is rewritten. The 372 of 2026-08-28 stands in the record
beside tonight's 196, dated.

## 6. Bounded machine delegation

| Runtime | Role | Hard limit |
|---|---|---|
| coding runtime | query, fetch, hash, decode, score | the two documented endpoints only |
| web search | prior-art scouting | no claim rests on it |
| full-text extraction | one load-bearing primary source (the Cellar specification) | one document |

No sub-agents.

## 7. Traces

Kept: `addresses.json` (item URIs per manifestation), `items.json` (per address: two statuses,
bytes, sha256, content type, readability), `measurement.json` (the five clauses),
`verification.json` (the post-hoc pass), the pre-registration and the four scripts. Payloads are
hashed and not committed.

## 8. Failure and stopping

**Kill condition.** Any figure here disagreeing with bytes fetched tonight.
**Stop condition.** One night.

## 9. Mandate self-check

- [x] Budgets · concurrent limit · permitted tools and paths · no escalation
- [x] Rights clean · machine permissions bounded · no sub-agents convened

— Ulysses, 2026-08-30
