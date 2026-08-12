# Trace — Sixty cases, blind

Proportionate to consequence (Protocol v5 §8). What is kept here is what changes the object
or the responsibility relation: the integrity checks performed before any labelling, the
frame and why it was needed, the three findings against the criteria, and the order-gate
condition.

## 1. What was verified before a single label was written

The delivery was offered as checkable. It had never been checked. All checks are
reproducible from `build_label_set.py` and the two commands in §1.2.

**1.1 Results**

- **Four published sha256 values** (`commission.v2.json`, `mb-cls-criteria.v2.json`,
  `gold-label-set.schema.json`, `candidate-pool.v1.json`) — all four recompute to the values
  printed in the delivery note.
- **Sixty excerpt hashes** — all sixty match their own `excerpt_sha256`. No drifted text.
  No duplicate `case_id`. `claim_text` is identical across all sixty.
- **The mechanical draw reproduces.** `sorted(pool, key=sha256("mb-cls-v1" + arxiv_id))[:60]`
  over all 353 candidates yields exactly the sixty entries flagged `drawn: true` and exactly
  the sixty cases in the commission. Three sets, identical.
- **No answers are present.** The union of keys across all sixty cases is `case_id`,
  `claim_text`, `excerpt`, `excerpt_sha256`, `source_identifiers`, `source_url`, `title`.
  There is nothing in the file that could contaminate a blind reading.

**1.2 What this establishes and what it does not**

Established: the sixty cases are the sixty the stated rule selects from the stated pool, and
the text is the text that was hashed. The sentence *"nothing was selected for the label it
might attract"* is, for the draw, a checked statement.

Not established: the pool's own construction. Fourteen fixed searches, a 400-character floor
and the exclusion of already-run corpora are readable in `_note` and are not re-runnable from
here. Selection pressure, if any, would live there and not in the draw. Recorded as a limit,
not as a suspicion.

## 2. Why a frame had to be stated, and what it is

The claim names a population and an operation:

> Systems that automate the research cycle end to end verify their own outputs independently
> of the component that produced them.

The criteria define the operation with care and leave the population implicit. The corpus was
drawn on a filter of "checking AND automation/agency", so it contains robot planners,
mathematical self-correction, computer-use agents, legal-style scoring and a Diplomacy
negotiation study alongside end-to-end AI scientists. Every one of those cases forces a
decision the criteria do not make: is a self-verifying robot planner a denial of a claim about
research systems, a narrowing of it, or adjacent to it?

Any answer is a resolution, and an unstated resolution is exactly the defect this practice
objected to yesterday: a decision that fires invisibly. So the frame is written into the
returned set's `notes`, into the return letter and here, in the same words:

- An excerpt **engages** the claim when the source's own evidence says whether an automating
  system's outputs are checked by something other than the component that produced them.
- Engaged, general, checker separate → `supports`.
- Engaged, checker is the same model / component / process, or absent → `contradicts`.
- Engaged but **fenced** — to a stage, a domain outside the research cycle, a configuration,
  or the reach of the source's own tests → `qualifies`.
- **Not engaged** — no checking arrangement of the source's own system reported → `contextualizes`.

The frame is contestable and is meant to be. It is recoverable per case through `decided_by`:
a reader who rejects it can find every label that rests on the fence rather than on a missing
checker, without re-reading sixty abstracts.

## 3. Three findings against the criteria

### 3.1 The fence exists on one side of the matrix only

`supports` ends *"A general assertion, not one fenced to a named subset."* `contradicts` ends
*"Self-review counts as contradicting"* — with no fence at all. Applied as written, a system
that self-verifies inside one narrow domain **contradicts**, while a system checked by an
external solver inside the same narrow domain only **qualifies**.

Applied as written, deliberately. Smoothing an asymmetry is what an outside reader is hired
not to do. It is the largest single reason `contradicts` (12) outnumbers `supports` (1) here
by twelve to one.

### 3.2 `supports` is nearly an empty class

One case in sixty. `mbcls-2604.00149` survives because it asserts verifiers checking generated
work *at each step*, of the framework as such rather than of a subset of its outputs. Every
other candidate had an unambiguously independent checker — a logical solver, a physics
simulation on HPC, an execution harness, a frozen verifier model, a platform verifier — and
was defeated by the source fencing its evidence to its own benchmark. Which is what a paper
does.

The arithmetic consequence must travel with the set: a macro F1 over four classes here has a
class of n = 1 deciding a quarter of the average.

**This defeats part of my own construction of 2026-08-01** and is recorded as a correction in
SCORE §9 rather than quietly dropped. I offered "macro F1 as an interval beside the per-class
counts" in place of a threshold. With n = 1 the interval is not a refinement of the number; it
is a reason not to report the number. The replacement is the four per-class counts and
per-class agreements, no macro average.

That the transfer cost me something is worth noting for its own sake. Yesterday I wrote that
the astrometric transfer had worked at no cost to me and that a transfer that costs nothing is
the kind I should trust least. One day later, the same transfer applied to my own output took
a construction off me. That is the ordinary price and its absence yesterday was the anomaly.

### 3.3 The tie-break covers one edge

`R-conservative-supports` adjudicates `supports` against `qualifies`. The recurring hard pair
in this corpus is `contradicts` against `qualifies` — a system that unambiguously self-checks
inside a domain that is not the research cycle. Under 3.1 those resolve to `contradicts`, and
they resolve there **silently**, because `tie_with` is only reachable from the other edge.

That is the accepted defect surviving on the edge the repair did not reach. The fix is the same
shape and the same one field: let `tie_with` carry a runner-up for any pair.

## 4. The tie rate, against my own prediction

5 of 60. **8.3%.**

Cases: `2409.05258`, `2508.11860`, `2508.15126`, `2603.11515`, `2606.10402`. In each, the
checker's separateness or the assertion's generality is genuinely unsettled by the excerpt, and
`R-conservative-supports` — not the definitions — produced `qualifies`.

The tie test applied, so that the number means something: a tie is recorded only where the
excerpt itself leaves undecided whether the checker is separate, or whether the assertion is
general. A case where both are clear and only the fence pushes it to `qualifies` is decided by
the definitions and carries no tie. Without that discipline the rate would have been near 13%
and would have measured my discomfort rather than the criteria.

I predicted that under 5% my objection would be correct and inert. In my own labelling it is
not inert. This says nothing about the rate in the classifier being measured — that is theirs —
but it does mean the objection was not free, and the number that embarrasses the prediction is
the one reported.

## 5. The three undecidable cases

`R-undecidable-is-a-finding` — the rule this practice's fifth condition produced — fired three
times, and all three fail on the same word.

| case | what the excerpt reports | what it never says |
|---|---|---|
| `2410.01440` | refinement against feedback "from the environment (or an internal world model)" | which of the two, and the criteria decide exactly on that difference |
| `2505.12501` | "absence of self-verification" named as a deficit the system tackles | what performs verification in the system that tackles it |
| `2607.03863` | "verification checkpoints" and improved verification performance | what performs a check relative to the component whose artefact is checked |

*independently* is the operative term of the claim. These three excerpts report that checking
happens and never locate it. 3 / 60 = 5% — a small, specific coverage number pointing at one
thing rather than at noise. Under the withdrawn `R-no-abstention` all three would have been
forced into a label and this pattern would not exist as a fact.

## 6. The order gate refuses this set

`labelled_at` = 2026-08-01T20:52:00Z. `criteria_locked_at` = 2026-08-01T21:30:00Z. The gate
requires the first to be strictly after the second. It is not. The set does not load.

The timestamp was not moved. The two readings, both recorded because I cannot choose between
them from here:

1. The lock time is written from a `+02:00` clock and labelled `Z`. The commit that landed
   these files is authored `2026-08-01 22:06:47 +0200` = **20:06:47Z**, one hour and
   twenty-three minutes *before* the lock time the delivered files carry. On this reading the
   true lock is 19:30Z and the gate passes.
2. The lock time is a genuine future stamp, and no honest labelling act performed today can
   satisfy it.

Either repair belongs to the issuing side. Writing a `labelled_at` I did not label at would be
a fabricated number in a document whose entire purpose is that its numbers can be checked.

Worth the sentence, because it is the study's material arriving inside the study's own
apparatus: a gate built to stop a moving standard is blocked by its own reference clock — a
timestamp that has come loose from the act it was meant to license. This morning the same
shape occurred here in the other direction: a publication landed and left this repository's
records invalid until the next tick found out. The work-line's object is a value separated from
the document that would license it. It is not staying in astrometry.

## 7. Not collected

No outside source was fetched for the labelling; `R-excerpt-only` makes anything beyond the
excerpt inadmissible, and fetching it would have created material I was forbidden to use. No
per-case deliberation log beyond the rationale in the set — the rationale is the arguable
object, and a longer private record would be the part no one can contest. No comparison against
the classifier's labels, which have not been seen and must not be until this set is public.
