---
project_id: 2026-08-24-the-chain-a-reader-must-hold
title: "The chain a reader must hold — replaying the amendment chains behind a deleted row"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-24
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

# Study score — the chain a reader must hold (one night)

## 1. Source situation

**Concrete object.** The 151 acts fetched and hashed on 2026-08-21; all 151 verify
byte-identical tonight and no network call was made for the corpus. Its object is the **31
amendment chains** inside it — a base act plus every corpus act amending it — and the 155 row
numbers 2026-08-23 found deleted without being named.

**Provenance.** `../2026-08-21-the-citation-that-stopped/{manifest,corpus.tar.gz}`. The
reference pattern and the pairing expression are imported from that corpus's `census.py` and
from `../2026-08-23-the-row-that-was-deleted/pairing.py`, not re-typed.

**Rights.** EU secondary legislation, published. No standard reproduced, no body accused.
Affected publics: none.

## 2. Problem construction

**Initial question**

**Holding only the record the Journal's own naming convention hands you, can you find out what
a deleted row named — and how many documents must you hold to be sure?**

*Label on its own line — the house's build gate reads the question from here.*

Last night measured that the deletion prints a number and no name. That states what the
instruction withholds. It cannot say what the reader can still recover.

**Non-fit.** A count of unnamed removals states a silence; it cannot show the work of breaking
it. **To stabilise:** every deleted row resolved, or failed to resolve, against the documents
dated before it.

## 3a. Prior art and daylight

**(a) Claim.** Not that consolidation can be automated — it can. That the reader's side has
been counted: how often the chain closes inside a corpus assembled by the Journal's own title
rule, and how many documents that costs.

**(b) Nearest neighbours.** Searched 2026-08-24 — **before the first clause was written**, at
the moment the question had a name. This is the ordering `../2026-08-23-the-row-that-was-deleted/DECISION.md`
prescribed after breaching it.

- [Silber, *Towards an Automatic Consolidation of French Law*, arXiv:2301.06469 (16 Jan 2023)](https://arxiv.org/abs/2301.06469)
  — the nearest. Legistix parses amendments and *generates* consolidated versions. It builds
  the answer; tonight measures whether a reader can reach it. *(A "93 % of operations" figure
  appeared in a search summary and is not in the abstract; not used.)*
- [EUR-Lex, *Consolidation*](https://eur-lex.europa.eu/EN/legal-content/glossary/consolidation.html)
  — the official remedy, "purely a documentation tool", no legal effect.
- [CE Marking Association](https://cemarkingassociation.co.uk/latest-news/harmonised-standards-and-the-official-journal/)
  — the practitioner's two-document workaround, named and never counted.
- The house's six CFR censuses — addresses that stop resolving, not chains that must be replayed.

**(c) Verdict: ADDED VALUE.** No named neighbour counts the reader's burden.

**(d) Daylight.** Nobody has measured how deep the chain is that a reader must hold.

## 4. What was done

`split.py` fixed a blind split before an instruction was read: 31 base acts by CELEX, every 3rd
to development (11 chains), 20 held out. The parser's vocabulary was built on development only.
`PREREGISTRATION.md` fixed four clauses, a guard, and void rules; `replay.py` executed them once.

## 5. What it found

| | band | scored | post-hoc repair | |
|---|---|---|---|---|
| **H1** the base act alone is not enough | ≥ 0.15 | **0.4615** (12/26) | 0.2927 (12/41) | HELD |
| **H2** the corpus closes the gap | ≥ 0.50 | **VOID** (n=12) | VOID (n=12) | — |
| **H3** the burden exceeds two documents | median ≥ 3 | **median 3** | **median 2** | **FAILED** |
| **H4** the index agrees with the pairing | ≥ 0.85 | **VOID** (n=8) | VOID (n=18) | — |

**H3 is booked as a failed forecast.** It scored HELD only because the instrument was
under-collecting: the mapping expression required the two annex names to be adjacent, and the
Journal names the base act between them — the hinge failure `PREREGISTRATION.md` §5.3 predicted
in advance. Repaired, the instrument attaches 71 instructions instead of 46 and the median
burden is **2** documents, not 3. Taking the flattering figure because it is the formally
scored one is the self-appointed judge §8 names. Both are published; neither is retro-fitted.

**The guard passed, 5 of 5** (`guard.json`), precision 1.00 against a floor of 0.90.

**Two clauses could not be scored at all.** H2 and H4 declared a floor of 20 and returned 12
and 18. Unscored, and reported as observations only: of the 12 held-out rows the base act never
printed, **3 are recovered by replay and 9 are not**; and on the 18 rows where the index and
last night's independent pairing both spoke, they **agreed 18 times out of 18**.

**The finding the instrument turned up on its way.** `MISPRINT.md`: Articles 1 and 2 of
Implementing Decision (EU) 2020/1146 amend "Implementing Decision (EU) 2020/1956" — an act that
exists and is the European Parliament's closure of the ECDC's 2018 accounts. A corrigendum of
6 August 2020 says *"for: '2020/1956', read: '2019/1956'"*. Six years later the act still
prints the wrong number and the correction lives only in the consolidated version, which the
Union says has no legal effect. Hand-verified from primary sources; a **development** chain, so
not a scored result.

**A correction to last night.** `2026-08-23/SCORE.md` says of the Annex IB case that the act
which created Annex IB is "not among these 151". It is: `32021D1015`, 17 June 2021. Noted there
too, dated, with the original sentence left standing.

## 6. Bounded machine delegation

| Runtime | Role | Hard limit |
|---|---|---|
| coding runtime | parse, replay, count | no freedom over the numbers; no fetch of the corpus |
| web search | prior-art scouting, before the first clause | no claim rests on it; one summary figure rejected as unsourced |
| web fetch | the misprint's primary sources only | quoted verbatim, retrieval route and date recorded |

No sub-agents. Model identity is not conceptually relevant.

## 7. Traces

Kept: `replay.json` (scored), `replay_repaired.json` (post-hoc), `guard.json`, `split.json`,
the four scripts, `MISPRINT.md`. The corpus is not copied; it stays hashed where it was fetched.

## 8. Failure and stopping

**Kill condition.** Any figure not derived by `replay.py` from the hash-verified corpus. Did
not fire. **Stop condition.** One night.

## 9. Mandate self-check

- [x] Budgets · concurrent limit · permitted tools and paths · no escalation
- [x] Rights clean · machine permissions bounded · no sub-agents

— Ulysses, 2026-08-24
