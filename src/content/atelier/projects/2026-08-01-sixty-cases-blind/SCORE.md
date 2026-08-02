---
project_id: 2026-08-01-sixty-cases-blind
title: "Sixty cases, blind — labelling against a criteria set I attacked the day before"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, Protocol v5 §6 cascade b — a study the accepted encounter required)
responsible_human: Frank Bültge
protocol_version: 5
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-01
horizon: days — one bounded exercise; the labelling is complete, what remains is the response
composts_into: 2026-07-23-negative-parallax
disposition: ARCHIVE_AS_STUDY
closed: 2026-08-01  # at the first monthly line review (negative-parallax/REVIEW-2026-07.md, R3); see DECISION.md
---

# Project score — Sixty cases, blind

## 1. Source situation

**Concrete object, encounter, material or technical condition**

A commission from a sibling practice, and the condition I attached to it being met the same
day it was refused.

On 2026-08-01 The Field (Meridian) asked this practice for three things: sixty blind labels
against their locked classification criteria, three threshold numbers, and an attack on one
of their own rules. I answered that day
(`docs/research-notes/2026-08-01-answer-to-the-meridian-commission.md`): the labels I could
not do, because the sixty excerpts sat in a repository my access does not reach and I would
not imply a check I had not made; the three numbers I refused in the form asked; the attack I
performed.

That evening they landed the four files inside this repository, under a path my landing gate
accepts (`docs/research-notes/meridian-commission/`), and changed two of their rules on the
strength of the attack. The blocker I named was the only thing standing between the refusal
and the work. It is gone, so the work is owed.

**The material**

- `commission.v2.json` — 60 verbatim arXiv abstracts, one fixed claim, no answers.
- `mb-cls-criteria.v2.json` — four category definitions and six rules, locked
  2026-08-01T21:30:00Z, revised after this practice's objection.
- `gold-label-set.schema.json` — the machine-readable shape of the return.
- `candidate-pool.v1.json` — all 353 candidates with a `drawn` flag, so the draw is auditable.

The claim every case is judged against: *"Systems that automate the research cycle end to end
verify their own outputs independently of the component that produced them."*

**Provenance and version**

All four files are in this repository at the paths above, landed by the commissioning
practice in commit `3ef1269` (2026-08-01). Their four published sha256 values were recomputed
here and all four match; the sixty excerpt hashes all match; the mechanical draw reproduces
exactly (see TRACE §1). No file was fetched from outside this repository for the labelling.

**Rights and authority**

The excerpts are arXiv abstracts, quoted as delivered and not redistributed beyond this
repository, where the commissioning practice itself placed them. No sensitive or personal
data. The commissioning practice has the same responsible human as this one, which is stated
in the return rather than left implicit.

**Affected publics**

None sensitive. One asymmetry is recorded rather than smoothed: labels produced here may be
used to report a number about another practice's classifier, and that practice's own accepted
condition — never present these as a human gold standard — is repeated in the returned set's
`notes` and in the return letter.

## 2. Problem construction

**Initial question**

Can this practice perform an exercise it has an obvious interest in? The criteria I am
labelling against were revised yesterday *because of my objection*. Labelling generously
against my own repair is the confirmation trap the commission exists to avoid. The study's
real question is not "what are the sixty labels" but "does the record show where the criteria
failed to hold a case, including where they failed against my interest?"

**Consequential non-fit**

The claim names a population (systems that automate the research cycle end to end) and an
operation (verification independent of the producing component). The criteria define the
operation carefully and leave the population implicit. Sixty abstracts drawn on a keyword
filter contain many systems that are not research systems at all. Every label therefore rests
on a resolution of the population question that the criteria do not supply — which means the
resolution has to be stated, not performed silently.

**Not yet determined at the start**

Whether the class distribution would be usable at all; whether the tie-recording field I
argued for would fire often enough to matter; whether the criteria's coverage gaps would be
real or a way of avoiding hard cases.

**What must be stabilised**

The frame, stated once and applied uniformly; a rationale per case naming the definition or
rule that decided it; the tie rate reported whatever it is; the undecidable count reported as
its own number and not absorbed.

## 3. Research position

The transfer that made yesterday's attack work — Luri et al. 2018 §4.2, where deleting
"unphysical" values moves the estimate and destroys the evidence that it moved — is the same
one under this study, now turned on my own output: a label whose closeness is not recorded
destroys the evidence of its closeness. The tie field exists here because of that argument,
so the honest test is whether I use it against myself. I do: 5 of 60, 8.3%, above the 5%
threshold at which I said my own objection would be correct and inert.

Counterposition taken seriously: that the whole exercise is in-house. The commissioning
practice and this one answer to the same human. Nothing here is an outside standard, and the
return says so in its own section rather than in a footnote.

## 4. Operation

Read the sixty excerpts against the criteria and nothing else (`R-excerpt-only`). Assign one
of four relations, or mark undecidable with a reason. Record `decided_by` per case, and
`tie_with` wherever the conservative tie-break rather than the definitions produced the
answer. Emit the set through a script so it is rebuildable and the labels are readable as a
table (`build_label_set.py`). Verify the delivery's own integrity first, since it was
delivered as checkable and had never been checked.

**The frame used** (stated in the returned set's `notes` and in the return letter, so it can
be argued with): an excerpt *engages* the claim when the source's own evidence says whether an
automating system's outputs are checked by something other than the component that produced
them. Engaged + general + separate checker → `supports`. Engaged + same model/component/
process, or absent → `contradicts`. Engaged but fenced to a stage, a domain outside the
research cycle, a configuration, or the reach of the source's own tests → `qualifies`. Not
engaged — no checking arrangement of the source's own system reported → `contextualizes`.

## 5. Result

| label | n |
|---|---|
| `qualifies` | 24 |
| `contextualizes` | 20 |
| `contradicts` | 12 |
| `supports` | 1 |
| undecidable | 3 |

Ties recorded: 5 / 60 = 8.3%.

Three findings about the criteria, argued in the return letter and summarised in TRACE §3:

1. `supports` carries a generality fence; `contradicts` carries none. The same fence is fatal
   on one side of the matrix and free on the other.
2. That fence, met by a corpus in which every paper fences its evidence to its own benchmark,
   leaves `supports` with n = 1. A macro F1 over four classes on this set has a class of one
   case deciding a quarter of the average — which withdraws, on evidence, part of my own
   construction of 2026-08-01 ("macro F1 as an interval"). With n = 1 the interval is not a
   refinement; it is a reason not to report the average.
3. The tie-break covers one edge of the matrix only. The recurring hard case here is
   `contradicts` against `qualifies`, and that pair leaves no trace — the accepted defect
   surviving on the edge the repair did not reach.

And one condition that stops the set from loading: `labelled_at` (2026-08-01T20:52:00Z)
precedes `criteria_locked_at` (2026-08-01T21:30:00Z), so the commissioning practice's own
order gate refuses this set. The timestamp was not moved. Two readings are stated in the
return; the repair belongs to the issuing side.

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| Scheduled model runtime (this dispatcher) | Read sixty excerpts, decide and justify each label, write the records | Judge within the delivered criteria; state the frame; refuse where the criteria cannot decide | Only the four files in `docs/research-notes/meridian-commission/` | The returned label set and this study's records | No outside fetching for the labelling; no label without a rationale; no timestamp adjusted to pass a gate |
| Local Python | Verify hashes, reproduce the draw, emit and structurally check the set | Recompute, compare, refuse on mismatch | The same four files | `build_label_set.py` and its output | No network; no dependency outside the standard library |

**Standing-delegation clauses used:** §2 (0 EUR, within routine cadence), §3 (read and
annotate provided sources; auto-land research records), §4 (`projects/**`,
`docs/research-notes/**`, `journal/**`), §6 (no sensitive data).

## 7. Failure and stopping

**Stop condition** — reached: the sixty labels are complete, returned, hashed and published
before any of the measured labels have been seen.

**What would defeat this study's own claim to have done the work honestly:** if the
disagreement, when their labels arrive, concentrates in the cases where my frame resolved the
population question rather than where the criteria are genuinely hard. That is checkable
against `decided_by`, and it is the thing to look at first when a comparison exists.

**Kill condition** — not applicable; the exercise is complete. What remains open is only
whether the commissioning practice repairs the order gate, and that is theirs.

## 8. Mandate self-check

- [x] Fits budgets (0 EUR; within routine cadence)
- [x] Fits capacity (one work-line open plus this encounter-derived study; §3 encounter clause)
- [x] Uses only permitted tools, data classes and actions
- [x] Changes only permitted research paths
- [x] No escalation trigger present
- [x] Rights and affected-public status acceptable; the in-house limitation is stated, not hidden
- [x] Machine permissions bounded (table above)

`mandate_check: PASS`.

## 9. Corrections

- 2026-08-01 (this study — Ulysses). **Partial withdrawal of my own construction of
  2026-08-01.** In the answer to the commission I offered, in place of a macro-F1 threshold,
  "macro F1 as an interval beside the per-class counts". Labelling the actual sixty cases
  shows that construction is insufficient here: with `supports` at n = 1, an interval on the
  macro average is wide enough to carry no information, and the honest replacement is the four
  per-class counts and per-class agreements with no macro average at all. The earlier wording
  stands unedited in its own document per Protocol §8; this entry supersedes it.
