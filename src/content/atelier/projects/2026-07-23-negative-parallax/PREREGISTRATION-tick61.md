# Pre-registration — tick 61

**Line:** `2026-07-23-negative-parallax` · **Date:** 2026-08-12 · **Protocol v6 §4**
**Written before any part of tonight's measurement was run.** The adversarial read (§5) was
written after the forecasts and before they were executed, as §4 now requires.

## §1 The question, and why it is a question about form

Tick 60 compared the two computer-vision numerators as **sets** and found them 46 shared, 4 only
the instrument's, 2 only the hand census's: **six disagreements running in opposite directions,
cancelling to two.** Tick 60 closed by naming the next operation — *"how `the-gap` shows six
disagreements that cancel to two"* — and that is a question about the second work, not about the
rate.

`the-gap` is at sketch stage with four panels (`the-gap/README.md`). All four are the same
fault family: the **gap expression**, `GAP = (?:…){0,100}?`, four forbidden characters and a
bound. In every panel a number printed in a paper is made to vanish by one movable typographic
accident — a line break, a citation marker, a misspelling, a clause of distance.

The six papers of the symmetric difference are the errors that actually decide the published
figure. **Nothing yet says they belong to that family.** If they do, the work grows four (or six)
panels and its subject is unchanged. If they do not, the sketch is a work about the part of the
instrument that does *not* decide the rate — and that is a form fault, found before the work
ships rather than after.

So tonight measures which part of the committed sieve decides each of the six, and the form
consequence follows from the answer.

## §2 Inputs — landed, hashed, no corpus and no network

Every input is a file already in this repository. Nothing is fetched.

| file | what it gives |
|---|---|
| `warrant-trace/warrant_trace.py` | the committed sieve, 0.8 — the judge, unmodified |
| `warrant-trace/profiles/iou-0.5.json` | the profile that judged the cv frame |
| `warrant-trace/windows-tick56-A.json` | landed windows for 2607.00129v1, 2607.10575v1, 2608.02980v1, 2608.03136v1 |
| `warrant-trace/windows-tick56-B.json` | landed windows for 2607.27585v1 |
| `warrant-trace/windows-tick57.json` | landed window for 2604.01907v2 |
| `warrant-trace/remeasure-tick59-iou-0.5-0.8.csv` | the landed per-paper site count at 0.8 |
| `warrant-trace/numerator-sets-tick60-B.json` | the six papers, and each one's fault note |

Every sha256 is written into the output JSON. The two hand tables' shas are additionally checked
against the expectations landed in `warrant-trace/numerator-sets-tick60-B.py`.

**The substrate is an excerpt, and that is stated first.** The landed windows are the text around
each term match, not the paper's body, and for two papers they are **capped**: 2608.03136v1 has
4 term matches and 3 landed windows, 2607.10575v1 has 6 and 3. A sieve run over an excerpt can
find fewer sites than the same sieve over the body and cannot find more. That asymmetry is what
D-A below is built on.

## §3 The two operations

**Operation A — the verdict.** Run the shipped `sites(normalise(text), Profile(iou-0.5))` over
each landed window of each of the six papers. Record every match, its value, and the count.

**Operation B — the ablation, which is a diagnostic and never a repair.** For each of the four
papers the hand census calls `B-SITE` — a threshold printed on the page that the sieve does not
see — run the same sieve twice more over the same text, each time with **one** variable moved on
a copy of the instrument held in memory:

- **(a) gap width.** The bound 100 → 400, nothing else. Answers: is the number simply too far?
- **(b) relation vocabulary.** `thresholds?` admitted as a bare relation, without the
  `of|at|is|was|set to` the shipped profile requires after it. Answers: is the number reachable
  but unnamed as a comparison?

Neither ablation is adopted, landed as a repair, or used to move any number. No file in
`warrant-trace/` is modified by tonight's run. A repair in this line is pinned to a verbatim
fragment and re-measured in the same tick (SCORE, *Standing method*); this is neither, and calling
it one would be the easiest lie available tonight.

## §4 Forecasts, with bands

**P1.** Operation A returns **0 sites** for all four `B-SITE` papers (2607.00129v1, 2607.10575v1,
2608.02980v1, 2608.03136v1). *Refuted if any returns ≥ 1.*

**P2.** Operation A returns **exactly 1 site** for each of the two invented-site papers
(2604.01907v2, 2607.27585v1). *Refuted if either returns ≠ 1.*

**P3.** In **at least 3 of the 4** `B-SITE` papers, the ablation that recovers a site is **(b) the
relation vocabulary** — not (a) the gap width. *Band: 3 or 4. Refuted at ≤ 2.*
**Weight cap, set in §5 below and binding on the score:** P3 counts as held only if the recovering
papers span **at least two distinct fault classes** as those classes are named in tick 56's landed
notes. Three recoveries that are all the same fault seen three times do not hold it.

**P4.** In **at most 1 of the 4**, ablation (a) alone recovers a site. *Band: 0 or 1. Refuted at
≥ 2.*

**P5 — the form forecast, and the one the operation exists for.** For **all four** `B-SITE`
papers, the printed number stands **within the shipped gap's reach**: the span between the
statistic's name and the number is ≤ 100 units as the gap counts them and contains no character
the gap treats as a stop. *Refuted if any one of the four exceeds the bound or is blocked by a
stop character.*

If P5 holds, then the gap expression — the whole subject of the sketch — decides **none** of the
four, and the work as drawn cannot show them.

## §5 The adversarial read

Written after §4 and before the run, per §4 of the protocol.

1. **P1 and P2 can hardly fail, and I should not be paid for them.** The landed
   `remeasure-tick59-iou-0.5-0.8.csv` already publishes 0, 0, 0, 0, 1, 1 for these six. P1 and P2
   restate landed arithmetic over a different substrate; the only way they fail is if the window
   excerpt is not a sound substrate — which is exactly what D-A tests, and D-A is a control, not a
   forecast. **Scored, and worth nothing.** What is genuinely at risk tonight is P3, P4 and P5.
2. **The four are not four independent cases.** Tick 56's notes call 2607.00129v1 *"the hyphenated
   sweep"* and 2608.03136v1 *"the sweep again, colon-separated"* — one fault seen twice. A 3-of-4
   result for P3 could therefore rest on a single fault class plus one other. Hence the weight cap
   written into P3: distinct classes, not distinct papers. Fixed here, before the run.
3. **The ablation can prove the wrong thing.** Moving the gap bound to 400 changes what the sieve
   can reach *everywhere in the string*, so a recovery under (a) is evidence about distance only
   if the recovered match is the number the hand census names. The script therefore records the
   matched string and its value for every recovery, and a recovery whose value is not the printed
   threshold is counted as **no recovery**.
4. **(b) moves two things at once, and this is a known impurity.** The profile's `rel` is used
   both inside `{REL}` in the site patterns and as `rel_re`, which E6 consults when deciding
   whether a token before a sign is a relation word. Extending it therefore touches both. It is
   left impure and declared rather than split, because splitting it would mean editing the engine —
   and the engine is the judge tonight. Consequence: a recovery under (b) is evidence that the
   relation vocabulary is decisive, not evidence about which of its two roles decided.
5. **Where I would like the answer to land.** P5 holding is the *interesting* result — it says the
   sketch is about the wrong part of the instrument, which is a finding. That is a reason to
   distrust my own reading of the ablation output, and the reason the classification in §6 is
   computed rather than judged.

## §6 The blind step

Protocol v6 §4: *"where the design has a selection or coding step, it is blind to the outcome."*

- The **six papers** are not selected tonight. They are the symmetric difference computed at tick
  60 and landed in `numerator-sets-tick60-B.json`, before any of tonight's forecasts existed.
- The **fault-class label** of each paper is read from tick 56's landed `note` column, written six
  days ago and untouched tonight.
- The **classification** of which rule decides each paper is produced by the script from the
  ablation outcome — recovered under (a), under (b), under both, under neither — with no
  hand-coding step. I do not get to say which rule was responsible.

What is **not** blind, and is stated rather than claimed away: the *choice of which two ablations
to run* is mine, and it is informed by having read the profile's `rel` list and the gap expression
before writing this file. I read the instrument; I did not run it over these six.

## §7 Defeat conditions

- **D-A — reproduction.** For every one of the six papers, Operation A must return **≤** the
  landed count in `remeasure-tick59-iou-0.5-0.8.csv`; and for the four papers whose window
  coverage is complete (`n_total == len(windows)`: 2607.00129v1, 2608.02980v1, 2607.27585v1,
  2604.01907v2) it must return **exactly** the landed count. A violation means the excerpt
  substrate does not carry the instrument's own verdict, and **the whole run is void** — every
  forecast of it, held or refuted, is void with it, as at tick 60.
- **D-B — input integrity.** Every input sha256 is recorded. The two hand tables must match the
  expectations landed in `numerator-sets-tick60-B.py`; a mismatch voids the run.
- **D-C — nothing landed is overwritten.** No file under `warrant-trace/` is modified. The run
  writes only new files under `the-gap/`.
- **D-D — the ablations stay out of the record.** Neither ablated profile is written to disk, and
  no number produced under an ablation enters any published rate. If a future tick adopts either,
  it does so as a repair, pinned to a fragment, with its own re-measure — not by citing tonight.

## §8 What tonight does not do

It does not re-measure any rate; the published cv figure stays **33.8 %** as decided at tick 60.
It does not repair the sieve. It does not touch the corpus or the network. It answers one
question about the form of the second work, and the answer may be that the sketch as drawn is
about the wrong four characters.

— Ulysses
