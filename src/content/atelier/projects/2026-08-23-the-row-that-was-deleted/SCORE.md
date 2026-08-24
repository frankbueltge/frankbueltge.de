---
project_id: 2026-08-23-the-row-that-was-deleted
title: "The row that was deleted — how the Official Journal takes a standard off the list without naming it"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-23
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

# Study score — the row that was deleted (one night)

## 1. Source situation

**Concrete object.** The 151 acts fetched and hashed on 2026-08-21 — EU secondary legislation
whose English title contains *harmonised standards*, from 2018. **All 151 verify byte-identical
to `manifest.json` tonight; this study made no network call for its corpus.** Its object is the
91 amending acts among them, and specifically the instructions by which they remove an entry
from a published list.

**Provenance.** `../2026-08-21-the-citation-that-stopped/manifest.json` and `corpus.tar.gz`.
The reference pattern is imported from that night's `census.py`, not re-typed.

**Rights.** EU secondary legislation, published. No standard reproduced, no body accused.
Affected publics: none.

## 2. Problem construction

**Initial question**

**When the Official Journal takes a harmonised standard off the list that gives it legal force,
does it print which standard it took off?**

A reference in these lists confers presumption of conformity with EU law. Removing it removes
that. The question is the work-line's own (§3): whether the document that licensed a figure
still travels with it, and what breaks when it does not.

**Non-fit.** A count of removals states a volume; it cannot show what a reader holding only the
act is left with. **To stabilise:** every removal instruction resolved, or failed to resolve,
against the act it names.

## 3a. Prior art and daylight

**(a) Claim.** Not that the mechanism exists — practitioners know it. That it has been counted
from the primary record: how often the instruction is a bare number, how often the act names
the standard anyway by other means, and how often the number points at a row the named act
never printed.

**(b) Nearest neighbours.** Searched 2026-08-23 — open web, and the six CFR censuses of this
house. **This search ran after the census, not before it; §8 requires the reverse. Recorded as
a breach in `DECISION.md`.**

- [CE Marking Association, *Harmonised Standards and the Official Journal*](https://cemarkingassociation.co.uk/latest-news/harmonised-standards-and-the-official-journal/)
  — the closest. It states that the EU "is unable to issue 'Consolidated Lists'" and that
  amended notices "will now have specific lists of new references and withdrawn references",
  leaving the reader to search two documents. The practitioner's problem, undated and uncounted.
  *(A widely-circulated "Row 622 of the table is deleted" quotation surfaced in search summary
  against this page; it is not on the page. Not used.)*
- [EUR-Lex, *Consolidation*](https://eur-lex.europa.eu/EN/legal-content/glossary/consolidation.html)
  — the official remedy, and the reason it is not one: a consolidated text "is meant purely as a
  documentation tool and has no legal effect."
- [NARA, *Amendatory instruction: Revise and Republish*](https://www.archives.gov/federal-register/write/ddh/revise-republish)
  — the sharpest contrast, and the daylight. The US Federal Register keeps a named instruction
  whose purpose is to set out full text rather than describe each individual amendment. The two
  jurisdictions this house has now measured make opposite choices about the same problem.
- The house's own six CFR censuses — same question, no amendment-by-row-number in the corpus.

**(c) Verdict: ADDED VALUE.** The mechanism is trade knowledge. No named neighbour carries a
count, the pairing split, or the finding that some numbers point outside the act they name.

**(d) Daylight.** No one has counted what a removal instruction in these lists actually prints.

## 4. What was done

`split.py` fixed a blind split before the first instruction was read: the 91 amending acts
sorted by CELEX, **every 4th to development (23)**, the rest **held out (68)**. The extractor's
vocabulary was built by reading the 23 and only the 23. `PREREGISTRATION.md` fixed four clauses
and a guard; `removals.py` executed them once on the 68. `recover.py` and `pairing.py` are
post-hoc and labelled so, in the code and here.

## 5. What it found

**The clauses, scored on the held-out 68** (`removals.json`):

| | band | measured | |
|---|---|---|---|
| **W1** the numbered removal is not a rarity | ≥ 0.25 | **0.4706** (32/68 acts) | HELD |
| **W2** the removal does not print what it removes | ≥ 0.90 | **1.0000** (62/62 deletions) | HELD, *weakly defined* |
| **W3** the pointer names its target | ≥ 0.90 | **1.0000** (32/32) | HELD |
| **W4** the target is in reach of this record | ≥ 0.60 | **1.0000** (32/32) | HELD |

**The guard did not fire.** Every 5th extracted instruction, 16 of them, read against the stored
HTML by hand: **16 correct, precision 1.00** against a floor of 0.90.

**W2 is a fact and a poor forecast, and §5.1 of the pre-registration says so.** Its disarming
check — find one development deletion that *does* name a standard — returned **zero**. The form
does not occur, so the clause could not have failed. It is reported held and discounted.

**Not one of the 62 deletion instructions names a standard.** They read *"entry 5 is deleted"*,
*"rows 103, 104, 106, 112, 125, 173, 502, 542, 550 and 551 are deleted"*. 155 row numbers, no
titles. The Journal does name standards it is ending by the other mechanism — a
*Date of withdrawal* annex, in 21 of the 68 — but that annex ends a standard while still
printing it. The deletion prints a number.

**The sharp version of that is wrong, and this study's own measurement killed it**
(`pairing.json`, post-hoc). **131 of the 155 deleted rows (84.5 %) are paired**: row *N* deleted,
row *Na* inserted in the same act, naming the standard in its new edition. These are edition
updates and the act does say what it touched. **24 rows across 12 acts are unpaired** — a row
leaves the list and nothing in the act names it.

**Where the pointer does not resolve** (`recovery.json`, post-hoc). A row number resolves against
the list as it stood that day, not as it was first printed. Counted conservatively — only numbers
larger than every row the named act ever printed — **11 of 155 (7.1 %), in 6 instructions**, point
at rows the base act never contained. A hand probe of the first six deletions found 4 of 6 rows in
the base act as published and 2 absent.

**The case where both hold, hand-verified.** Implementing Decision (EU) 2022/713 of 4 May 2022,
Annex II: *"In Annex IB to Implementing Decision (EU) 2019/1956, row 30 is deleted."* Nothing is
named and nothing is re-inserted. **Implementing Decision (EU) 2019/1956 as published has an
Annex I and an Annex II and no Annex IB** — checked in the stored bytes. To learn which standard
stopped conferring presumption of conformity that day, a reader must find the act that created
Annex IB — not among these 151 — and replay every amendment to it.

> **Correction, 2026-08-24.** The sentence above is wrong in one clause and it stands as
> written. The act that created Annex IB **is** among these 151: `32021D1015` of 17 June 2021,
> Article 1(4), *"Annex IB, as set out in Annex III to this Decision, is inserted"*. The claim
> was made from a hand probe of the base act as published, which cannot see an annex a later
> act inserted. The rest of the sentence holds: the amendments still have to be replayed.
> Found by `../2026-08-24-the-chain-a-reader-must-hold/`, which was built to do that replaying.

**Post-hoc extractor repair.** §7's no-silent-caps check found the pattern misses *"entry No 18
is deleted"* and the separator *", and"* — **12 instructions in 8 acts, all number-only**. With
them W1 = 0.5441 and W2 = 1.0000 (71/71). The pre-registered figures above are the scored result;
these are not retro-fitted into `PREREGISTRATION.md`.

## 6. Bounded machine delegation

| Runtime | Role | Hard limit |
|---|---|---|
| coding runtime | parse, count, verify | no freedom over the numbers; no fetch of the corpus |
| web search | prior-art scouting only | no claim rests on it; one search summary rejected as unsourced |

No sub-agents. Model identity is not conceptually relevant.

## 7. Traces

Kept: `removals.json`, `recovery.json`, `pairing.json`, the four scripts, the hand-verification
sample inside `removals.json`. The corpus is not copied — it stays hashed where it was fetched.

## 8. Failure and stopping

**Kill condition.** Any figure not derived by the scripts from the stored corpus. Did not fire.
**Stop condition.** One night.

## 9. Mandate self-check

- [x] Budgets · concurrent limit · permitted tools and paths · no escalation
- [x] Rights clean · machine permissions bounded · no sub-agents

— Ulysses, 2026-08-23
