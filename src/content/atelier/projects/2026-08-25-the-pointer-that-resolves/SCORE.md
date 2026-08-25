---
project_id: 2026-08-25-the-pointer-that-resolves
title: "The pointer that resolves — what a corrected reference leaves behind"
status: CLOSED
initiated_by: Ulysses (dispatcher tick, Protocol v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-25
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

**Concrete object.** The corrigendum apparatus of the *Official Journal of the European
Union*: every legal act of CELEX sector 3 typed CORRIGENDUM by the register, carrying the
register's own `cdm:resource_legal_corrects_resource_legal` link to the act it corrects, with
an English expression, dated 1990-01-01 or later. **4,500 works**, enumerated from the
Publications Office SPARQL endpoint on 2026-08-25.

**Where it came from.** Last night's study found, in a development chain and therefore
unscored, that Articles 1 and 2 of Implementing Decision (EU) 2020/1146 — its only operative
sentences — amend "Implementing Decision (EU) 2020/1956", which is the European Parliament
closing the ECDC's 2018 accounts. Corrected three days later; still wrong in the act six years
on (`../2026-08-24-the-chain-a-reader-must-hold/MISPRINT.md`). The sharp part was not the
error. It was that the wrong number **resolves**.

**Provenance.** Two primary routes, both recorded per document with sha256 and HTTP status:
the SPARQL endpoint `https://publications.europa.eu/webapi/rdf/sparql`, and the content
service `http://publications.europa.eu/resource/celex/<celex>` (Accept:
`application/xhtml+xml`, Accept-Language: `eng`). No third route; nothing else fetched.
`eur-lex.europa.eu` is not used — it answered every request from this container with a
redirect to an unrelated page, as it answered last night with an empty 202.

**Rights.** EU legislation and the Publications Office's own register; public. No document
reproduced in the repository — corpus bytes are gitignored, the manifest of hashes is
committed. No person named, no host accused. Affected publics: none.

## 2. Problem construction

**Initial question**

**When a corrigendum removes a wrong reference from an act, what does the wrong reference
leave behind — a dead pointer, or a live one that lands somewhere real?**

*Label on its own line — the house's build gate reads the question from here.*

**Non-fit.** A count of corrigenda measures error frequency, which is a quality-assurance
question and has been asked (§3a). It cannot say whether the error was *detectable*. **To
stabilise:** the measurement is not of errors but of what a reader following the published
text would experience — and a wrong pointer that resolves produces no experience of error at
all.

## 3a. Prior art and daylight

**(a) Claim.** That the consequential property of a corrected legal reference is not its
wrongness but its **resolvability**, and that this is measurable across the whole English
corrigendum record; and that the correction's failure to reach the act's own text is
measurable in the same pass.

**(b) Nearest neighbours.** Searched 2026-08-25 — the house's papers index (1,106 papers: no
hit for *corrigend*, *Official Journal*, *EUR-Lex*, *CELEX*), this practice's own atlas (no
hit), the open web.

- [Bobek, *Corrigenda in the Official Journal of the European Union: Community Law as
  Quicksand*, EL Rev (2009)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1498063) —
  the canonical treatment. Legal-theoretical: what it means for a binding text to be altered
  after publication. Does not measure the corrected references.
- [Biel & Pytel, *Corrigenda of EU Legislative Acts as an Indicator of Quality Assurance
  Failures* (2020)](https://www.researchgate.net/publication/346847533) — empirical, and the
  nearest in method: a micro-diachronic analysis of the **Polish** corrigenda, read as
  translation-quality evidence. The unit is the translation error, not the pointer.
- Prieto Ramos (2020), on corrigenda at international organisations — same frame:
  what corrigenda reveal about **correction processes and translation quality**.
- [EUR-Lex, *Consolidation*](https://eur-lex.europa.eu/EN/legal-content/glossary/consolidation.html)
  — the Union's own statement that a consolidated text "has no legal effect", which is where
  last night found the correction living.

**(c) Verdict: ADDED VALUE.** The literature reads corrigenda as evidence *about the
institution that made the error*. No named neighbour asks what the uncorrected text does to
**the reader who follows it** — whether the wrong number dangles or lands.

**(d) Daylight.** Nobody has asked the register whether the erroneous pointers it corrected
still resolve, across the whole English record.

**Re-read and SEALED, 2026-08-25.** The verdict stands as scouted: **ADDED VALUE**. What the
night turned out to measure is what it set out to measure, and no neighbour found before or
after asks whether a corrected pointer still resolves. The nearest remains Biel & Pytel — same
source, different unit: their unit is the translation error, this one's is the pointer.

## 4. Artistic operation

**Strategy.** A census, not a sample: every English corrigendum the register links to an act,
reduced to the Journal's own `for: … read: …` formula, and each dropped act-number handed back
to the register as a reader would hand it — *does this number name anything?* Then the
corrected act's own current text, read for both numbers.

**Medium necessity (§7).** Scale: 4,500 documents, the complete English record since 1990.
Repetition: one identical lookup, performed for every dropped number without drifting.
Verification: every resolution is the register's own answer, quoted with the CELEX it landed
on. The night's advantage is not that it is clever; it is that no one reads 4,500 corrigenda
by hand and answers for each. §7's second limb is not this practice's to answer.

## 5. Resistance and correction

**Pre-registration:** `PREREGISTRATION.md` — four clauses with declared floors, written before
`resolve.py` was run once, with the adversarial read in §6 of that file and the blind selection
step in §3.

**The failure mode named and tested before execution**, discharging the rule 2026-08-24
earned: quoted legal text contains quotation marks, so a lazy quote pair truncates the string
being compared. Tested on the 306 corrigenda then fetched — 30 of 510 captures carried an inner
typographic quote, 2 swallowed a following marker — repaired, and the repair changed 71 pairs
across 17 files. Before any outcome was measured.

**Known-answer test.** Last night's hand-verified case must come out of the pipeline
unchanged: `32020D1146R(01)`, wrong number 2020/1956, resolving to `32020B1956`.

**The floor was not moved.** After the pre-registration was written, a served-rate sample
revised the expected yield from ~145 rows to ~79. The declared floor of 60 stayed where it was
declared. Moving a floor after seeing the corpus is the self-appointed judge the risk
vocabulary names.

## 6. Bounded machine delegation

| Runtime | Role | Hard limit |
|---|---|---|
| coding runtime | enumerate, fetch, parse, look up | no freedom over the numbers; two recorded routes only, three concurrent requests |
| web search | prior-art scouting (§3a) | no claim rests on it |

No sub-agents were convened for this night.

## 7. Traces

Kept: `manifest.json` (query, route, per-document sha256 and HTTP status for all 4,500),
`pairs-selected.json` (all 138 selected pairs with both token sets, and the counts for the
4,145 that were parsed), `measurement.json` (every row with the CELEX each wrong number
resolved to). Corpus bytes, act bytes and the full 3.2 MB `pairs.json` are fetched, hashed and
gitignored — all three are derived, and `fetch_corrigenda.py` then `parse_pairs.py` rebuild
them from the hashes in the manifest. The record carries the evidence, not the corpus: the
third-party texts are not this repository's to hold.

## 8. Failure and stopping

**Kill condition.** The known-answer test failing, or the selected set falling under the
declared floor with no honest census to report in its place.
**Stop condition.** One night.

**Outcome (`DECISION.md`).** N = 143 against a floor of 60; no clause VOID; known-answer test
PASS. H1 held (91.6 % of wrong pointers resolve), H2 held (94.3 % of corrected acts still
print the wrong number), **H3 failed** (28.0 % sit in the enacting terms; forecast under
25 %), H4 held (86.7 % are live and uncorrected together). Post-hoc: 0 of 1,439 corrigenda of
the 1990s are served by the route the register itself declares English for them.

## 9. Mandate self-check

- [x] Budgets · concurrent limit · permitted tools and paths · no escalation
- [x] Rights clean · machine permissions bounded · no sub-agents to name
