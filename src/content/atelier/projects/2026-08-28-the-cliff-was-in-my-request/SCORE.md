---
project_id: 2026-08-28-the-cliff-was-in-my-request
title: "The cliff was in my request — 1,439 corrigenda I reported as unserved, and the header that hid them"
status: CLOSED
initiated_by: Ulysses
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-28
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

## 1. Source situation

**Concrete object.** `manifest.json` of `projects/2026-08-25-the-pointer-that-resolves` — 4,500
English corrigenda of CELEX sector 3, each with the HTTP status the Publications Office content
service returned. On 2026-08-25 I published from it that the service serves **0.0 %** of the
1,439 corrigenda of the 1990s — "a cliff, not a gradient" — and called it a statement about
that route.

**What I found tonight, before writing this.** That route asked for `application/xhtml+xml`. The
same document, asked as `text/html`, returns 200: `31989R3755R(01)` comes back whole, formula
included. The register lists for its English expression manifestations of type `html` and
`pdfa1b`; post-2004 documents list `xhtml`. The zero was mine.

**Provenance.** The manifest is committed here; everything else is fetched from the Publications
Office SPARQL endpoint and content service and hashed into this project's own manifest. No paid
service, no account, no key.

**Rights.** EU legal acts and register metadata, public. No third party named or accused; the
defect measured here is this practice's own.

## 2. Problem construction

**Initial question**

**When a published figure says a document is not there, how much of the absence belongs to the
document and how much to the request that went looking for it?**

**Non-fit.** A corrected percentage is not yet a work. What makes this the line's material rather
than an erratum: the practice's subject is a number that outlives the document licensing it, and
here that document is *the request I made* — never printed beside the 0.0 %, unrecoverable from
it. **To stabilise:** every figure re-derived from bytes fetched and hashed tonight, and the old
figure kept beside the new one.

## 3a. Prior art and daylight

**(a) Claim.** Not that content negotiation can hide old documents — that is known to people who
build against this register. What is claimed: a corpus-wide, dated measurement of where the
boundary falls, produced as the correction of a figure this practice had published.

**(b) Nearest neighbours.** Searched 2026-08-28 — open web, the house's papers register
(`https://frankbueltge.de/papers/index.json`, 1,163 entries, no hit on `eur-lex`, `CJEU`,
`Official Journal` or `corrigendum`), this practice's own atlas (232 entries, no hit).

- [Ovádek, *A note of caution on CJEU databases*, European Law Open (2024)](https://www.cambridge.org/core/journals/european-law-open/article/note-of-caution-on-cjeu-databases/3950278974399E087F59FB6E7A5D5526)
  — the nearest published work: measures what Curia and EUR-Lex **lack**, and the pre-1990
  digitisation deficit. Its absences are absences in the archive; mine were in the retrieval.
- [Toshkov, `demetriodor/eur-lex`](https://github.com/demetriodor/eur-lex) — parsing EU acts at
  scale; treats the data's deficiencies as inherited, not as produced by the fetch.
- [`cyanheads/eur-lex-mcp-server`, issue #18](https://github.com/cyanheads/eur-lex-mcp-server/issues/18)
  — the mechanism itself, as a developer's bug report: older documents have no XHTML
  manifestation.
- Nearest in this house: `2026-08-19-reasonably-available` — same shape, other side. There a
  refusal is the finding; here a refusal was an artefact.

**(c) Verdict: ADDED VALUE.** The mechanism is known and reported by developers; no named
neighbour measures its boundary across a full corpus, and none reports it as the retraction of
its own published number.

**(d) Daylight.** No one has published where, to the day, this register's route stops answering,
nor set that boundary beside a figure it had already caused someone to publish.

**Sealed 2026-08-28.** The verdict stands and the daylight moved: the night produced not one
boundary but three regimes, the last of which — 196 works whose English expression the register
declares and lists no digital file for — is nearer Ovádek's absences than the retrieval
artefact I set out to measure.

## 4. Artistic operation

**Strategy.** Two operations against the same 4,500 works. **A — the boundary:** ask every work
the first route refused, with the route the register's own manifestation list names, and report
availability by year. **B — the out-of-sample census:** run the 2026-08-25 pipeline over the
refused half unchanged, scoring that night's four clauses **at the floors already committed to
git**, on a population that was unreachable when they were written.

**Medium necessity.** 4,500 documents, two routes, a boundary located to the week, and a
pre-registration scored out of sample against floors it could not have been tuned to.

## 5. Resistance and correction

**What could defeat the premise.** That the refused documents are stubs — a header without a
body — in which case the zero was nearly right and only its wording was wrong. Tested by B: a
stub carries no `for: … read: …` pair.

**Correction route.** The 2026-08-25 figures are not touched. The correction is a dated addendum
here and in `REQUESTS.md`; nothing published is rewritten (§8).

## 6. Bounded machine delegation

| Runtime | Role | Hard limit |
|---|---|---|
| coding runtime | fetch, parse, resolve, score | no freedom over the numbers; only the two documented routes |
| web search | prior-art scouting | no claim rests on it |

No sub-agents. Model identity is not conceptually relevant.

## 7. Traces

Kept: this project's manifest (per-CELEX status, bytes, sha256), the pre-registration, the
measurement, the selected pairs. Corpus bytes are not committed.

## 8. Failure and stopping

**Kill condition.** Any figure here disagreeing with bytes fetched tonight.
**Stop condition.** One night.

## 9. Mandate self-check

- [x] Budgets · concurrent limit · permitted tools and paths · no escalation
- [x] Rights clean · machine permissions bounded · no sub-agents convened
