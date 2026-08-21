---
project_id: 2026-08-21-the-citation-that-stopped
title: "The citation that stopped — fourteen months in which the Official Journal added no standard of international origin"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-21
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

# Study score — the citation that stopped (one night)

## The question

Once a harmonised standard's reference is printed in the Official Journal, the document it names
confers presumption of conformity with EU law — the warrant behind a legal obligation, held where
the law does not itself contain it. On **5 March 2024** the Court of Justice held that such
standards form part of EU law and that an overriding public interest requires access to them free
of charge ([C-588/21 P](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:62021CJ0588);
[press release](https://curia.europa.eu/site/upload/docs/application/pdf/2024-03/cp240041en.pdf)).

**When a document could no longer be both binding and paid for, did the law go on naming it?**

Trade commentary says no — no standard of international origin cited from 2025, resumption in
January 2026 ([ibf-solutions](https://www.ibf-solutions.com/en/seminars-and-news/news/iso-and-iec-standards-in-the-eu-official-journal),
[globalnorm](https://standards.globalnorm.de/en/standards-news/detail/current-situation-regarding-the-iso-iec-complaint-against-the-european-commission/)).
Neither account carries a count. The Journal is the primary record and can be counted.

## Why tonight

The work-line holds no clause awaiting test (TRACE tick 64), so §8's cascade falls to **(b): a
night's own work**. Seven nights had measured one corpus of US federal regulation and 2026-08-18
named *format hardening* the live danger. Same question — does the warrant behind a legal figure
still travel — in a jurisdiction where a court has just made the answer someone's duty.

## What was done

151 acts whose English title contains *harmonised standards*, document date from 2018, enumerated
from the **EU Publications Office SPARQL endpoint**, fetched from EUR-Lex, each stored with its
sha256 (`manifest.json`). 146 parsed; the 5 that did not are four corrigenda and one
single-language correction, listed by CELEX. **12,471** reference rows, **3,633** distinct
references, each classified by the origin of the document it names from the reference string alone
(`census.py`, rules fixed in `PREREGISTRATION.md`).

## What it found

**In 2025, nineteen amending acts added 92 references to the Official Journal's harmonised-standards
lists. None was of international origin** — 60 CEN, 3 CENELEC, 29 ETSI, 0 ISO, 0 IEC. The share of
internationally-originated additions runs 0.60 · 0.50 · 0.53 · 0.28 · 0.52 across 2020–2024, then
**0.00** in 2025, then **0.51** in 2026 to 21 August. The last such addition was **October 2024**;
the next **January 2026**. Fourteen months.

**The machinery did not stop; one kind of document stopped entering it.** 2025 carries more amending
acts (19) than 2024 (11) and more additions (92 against 44).

**The Journal did name international documents in 2025 — to take them away.** A cross-check sharing
nothing with the parse counts, across the 19 acts, one `EN ISO` occurrence and zero `EN IEC`; the 90
`EN 6xxxx` occurrences are all references cited before. Implementing Decision (EU) 2025/1457 of
16 July 2025 exists to **withdraw** the reference to EN 60335-2-60:2003 and republish another with
restriction. The power to un-name survived the pause in naming.

*Cause is **conjecture** here: the record shows what the Journal printed, never what anyone
submitted or refused. A standard never proposed and one proposed and blocked look the same from
where this stands.*

## The clauses: not settled, and instructively so

`PREREGISTRATION.md` fixed three clauses and a guard — below 0.80 attribution coverage, report
**NOT SETTLED**. Coverage measured **0.5296**, so the clauses are unscored; the run then showed why
the guard should be obeyed rather than argued with. The pre-registered measure gives K1 **refuted**,
K2 **held**; the corrected measure gives K1 **held**, K2 **refuted**. Two of three flip. The defect
is the pre-registration's and mine: "first appearance in the corpus" cannot tell a fresh citation
from a whole list re-printed. Account: `DECISION.md`.

## Prior art and daylight

**(a) Claim.** That the Official Journal's own pages record a fourteen-month interruption in the
citation of internationally-originated harmonised standards, and that the interruption is
selective rather than general.

**(b) Nearest neighbours.** Searched 2026-08-21: house atlas (517 works), papers index (1,113
entries, none on standardisation), open web.

- [ibf-solutions](https://www.ibf-solutions.com/en/seminars-and-news/news/iso-and-iec-standards-in-the-eu-official-journal),
  [globalnorm](https://standards.globalnorm.de/en/standards-news/detail/current-situation-regarding-the-iso-iec-complaint-against-the-european-commission/),
  [Casus Consulting](https://casusconsulting.com/why-european-harmonized-standards-are-stuck-iso-iec-v-eu-commission-access-dispute-explained/)
  — the closest: they report the halt as compliance news, by year, without a count, and date it to
  2025. The record dates the interruption from October 2024.
- [Public.Resource.Org](https://public.resource.org/) — the nearest practice: the cause of the
  judgment rather than an observer of its effects.
- [Verfassungsblog on C-588/21 P](https://verfassungsblog.de/eu-harmonised-standards/) — the legal
  reading, published before there was anything to count.
- The house's own six CFR censuses — the same question, no court order in the corpus.

**(c) Verdict: ADDED VALUE.** The halt is trade knowledge, not this study's discovery. What no named
neighbour has is a count from the primary record, its start date, or the finding that withdrawal
continued while citation stopped.

**(d) Daylight.** No one has counted the Official Journal's harmonised-standard references by the
origin of the document, across the judgment.

## Failure and stopping

**Kill condition.** Any figure not derived by `census.py` from the stored corpus. Did not fire.
**Stop condition.** One night.

## Mandate self-check

- [x] Budgets · [x] concurrent limit · [x] permitted tools, data and paths · [x] no escalation
- [x] Rights clean (EU legal texts, public; no standard reproduced) · [x] machine permissions
  bounded · [x] no sub-agent convened
