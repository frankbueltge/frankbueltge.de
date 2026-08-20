---
project_id: 2026-08-19-reasonably-available
title: "Reasonably available — the 306 addresses the law prints, handed over one at a time"
status: ACTIVE
initiated_by: Ulysses
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-19
usp_stage: SEALED
resource_budget:
  model_calls_max: 1 session
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 1
disposition: PUBLICATION_CANDIDATE
publication_approved_by:
publication_approved_at:
---

# Project score

## 1. Source situation

**Concrete object.** 1 CFR 51.1(a), quoting 5 U.S.C. 552(a): material outside the Federal
Register binds you when it is *"reasonably available to the class of persons affected thereby."*
Against that condition stand six closed censuses of the 290 CFR sections headed *Incorporation
by reference* — editions, addresses, refusals, archive copies, warrants, amendments.

**Provenance.** Six files committed by those studies, each read by sha256 in `build_route.py`.
Nothing fetched tonight but 1 CFR part 51, to quote the condition from the primary.

**Rights.** US federal regulation, public domain. No incorporated document reproduced, no host
contacted, no host accused of breaking a rule. Affected publics: none.

## 2. Problem construction

**Initial question**

**Can six censuses of the same corpus be put in a form where a visitor performs the law's
instruction rather than reads a table of it?** They produced no artefact; yesterday's close
said so.

*Form repaired 2026-08-20; layout only, journal `2026-08-20`.*

**Consequential non-fit**

A clause table states a rate. It cannot make a reader follow one address and be turned away,
which is what the corpus is about.

**What must be stabilised**

That every figure a visitor sees is derived in front of them from the committed record, never
restated from prose that may have drifted.

## 3. Research position

The link-rot literature (Perma: 50 % / 70 %), the paywall critique of incorporation by
reference, and the archive-coverage literature are named in the closed studies' scores and none
is contradicted here. This claims nothing new about rot; it claims a form.

## 3a. Prior art and daylight

**(a) Claim.** That the condition US law attaches to incorporation by reference —
*reasonably available* — can be handed to a stranger as an operation they perform 306 times
against the law's own printed addresses, and that performing it is a different act from reading
the rate.

**(b) Nearest neighbours.** Searched 2026-08-19: house atlas (505 works), open web, and what
the six closed studies already named.

- [Check the Fine Print (Americans for Prosperity Foundation)](https://americansforprosperityfoundation.org/essay/check-the-fine-print-the-hidden-cost-of-reading-regulations/)
  — closest in subject: 5,689 standards incorporated by reference, ~40 % paywalled, ~$122 each.
  It measures **price**; this measures **route**, and route failure is not price.
- [Perma / Zittrain, Albert, Lessig](https://harvardlawreview.org/forum/vol-127/perma-scoping-and-addressing-the-problem-of-link-and-reference-rot-in-legal-citations/)
  — the canonical rot measurement in law. Its corpus is citation in journals and opinions; ours
  is the operative text of binding regulation. A study, not an artefact.
- [Voluspa Jarpa, *Biblioteca de la No-Historia*](https://www.voluspajarpa.com/en/artwork/the-no-history/)
  — nearest artistic move: reproduce a state archive so its censorship becomes visible content.
  Jarpa reproduces documents that exist; here the content is the absence at an address, measured
  rather than depicted.
- [NARA's IBR-locations page](https://www.archives.gov/federal-register/cfr/ibr-locations) — the
  government's own answer. It lists where material may be inspected; it never asks whether the
  routes printed in the regulations reach it.


**(c) Verdict: ADDED VALUE.** The rates are not new and are not claimed as new. What no named
neighbour does is join edition, address, refusal, archive, warrant and amendment at the single
section, and hand that join to a reader as an act.

**(d) Daylight.** No one has made the law's own condition — *reasonably available* — into
something a stranger can test, 306 times, against the addresses the law prints.

## 4. Artistic operation

**Strategy.** One address at a time. Each card states what its section binds, prints the address
as the regulation prints it, reports what came back. A tally accumulates in the second person; a
grid of 306 cells holds the scale of what is unwalked.

**Medium necessity.** §7's bar is met in the artefact, not a method note: one press asks all 306
and the grid fills — the same operation without drift, over more material than a reader holds.
Scale, repetition and verification *are* the interaction.

**Unresolved remainder.** Whether a stranger finds it worth having met — §7's second limb, not
this practice's to answer.

## 5. Resistance and correction

**What could defeat the premise.** That the page is a dashboard with a button: a rate restated,
not an act. The honest test is §7's cold reading, and it has not been run.

**Correction route.** `check_page.py` drives the page in a browser and asserts 39 figures against
what the closed studies published — not against what this build computed.

## 6. Bounded machine delegation

| Runtime | Role | Freedom | Hard limit |
|---|---|---|---|
| coding runtime | join, render, verify | none over the numbers | no fetch except 1 CFR 51 |
| web search | prior-art scouting | query wording | no claim rests on it |

Model identity is not conceptually relevant. No sub-agent was convened.

## 7. Traces

Kept: six input hashes, the page's hash, the check script. Not collected: any new probe.


## 8. Failure and stopping

**Kill condition.** Any figure disagreeing with the published record. Did not fire.
**Stop condition.** One night. Built, run, checked.

## 9. Mandate self-check

- [x] Budgets · [x] concurrent limit · [x] permitted tools, data and paths
- [x] No escalation · [x] rights clean · [x] machine permissions bounded
