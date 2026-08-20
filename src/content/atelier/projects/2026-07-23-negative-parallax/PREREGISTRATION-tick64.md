# Pre-registration — tick 64

**Line:** `2026-07-23-negative-parallax` · **Written 2026-08-12, at the close of tick 63.**
**To be executed in a later session, not tonight.** Protocol v6 §4: a prediction fixed in writing
before the run that would settle it, in a form that can fail, separated from its test by a
session boundary.

## §1 Why this clause exists

Tick 63 inserted every relation token the profile declares at every inter-word position of the
four `B-SITE` fragments — 1,856 mutants — and found that all four recover, at **one** position
each, with **all 32 tokens**. Among those 32 are `below`, `less than`, `lower than` and
`smaller than`. The instrument recovers `IoU below 0.5` exactly as it recovers `IoU above 0.5`:
it tests that a comparison-shaped word stands in one slot, never what the word says.

That was found on four fragments built by hand. The question it raises is about the corpus, and
it is the one tick 63's adversarial read (§4.4) named as unanswered: tick 63 measured **reach**
and said nothing about **cost**. IoU 0.5 is a **lower bound** — the deriving document (Everingham
et al. 2010, §4.2, quoted in `profiles/iou-0.5.json`) says the overlap "must exceed 0.5". A site
that reads `IoU < 0.5` is therefore not an invocation of that criterion in the same sense; it may
be its complement, its failure case, or a different threshold wearing the same number. The
instrument cannot tell, and every rate this line has published for the computer-vision frame —
48.3 % at 0.8, and the 33.8 % hand figure beside it — rests on sites it counted without looking.

**Read before this file was fixed, and recorded rather than hidden** (the rule of tick 32): the
shape of the landed dump `warrant-trace/sites-tick57.txt` was checked for feasibility — it holds
**97 paper blocks and 292 `match=` lines**. Nothing about the direction of any relation was read,
counted or sampled. The bands below are set against a prior stated in §4.1, not against a peek.

## §2 The clause

**The source.** `warrant-trace/sites-tick57.txt`, landed at tick 57: the sieve's own sites, one
`match='…'` line each. No corpus, no network, no re-measurement — the sites are taken exactly as
the instrument recorded them.

**The extraction.** For each `match=` line, find every relation token in it using the compiled
`rel` expression read out of `profiles/iou-0.5.json` (never typed into the script, as at tick 63).
The site's relation is the **last** rel match that begins at or before the site's recorded
`value` inside the match string — the token standing between the statistic and its number, which
tick 63 established is the only slot the sieve reads. If no rel matches, the site is `NONE`.

**The classification, fixed here before the run** — this is the whole blind step and it is why it
is written out in full rather than described:

- `LOWER` (the criterion's own direction): `>`, `at least`, `no less than`, `greater than`,
  `larger than`, `higher than`, `above`, `exceed`, `exceeds`, `exceeding`, `of at least`
- `UPPER` (the opposite direction): `<`, `below`, `less than`, `smaller than`, `lower than`
- `NEUTRAL` (states a value, asserts no direction): `=`, `of`, `from`, `set to`, `fixed at`,
  `ranging from`, and every `threshold(s) of|at|is|was|set to` compound
- `NONE`: no relation token in the match

Every one of the 32 tokens tick 63 derived falls in exactly one class. The script asserts this
against the profile-derived vocabulary and voids the run if any token is unclassified or in two
classes (D-L).

**C1.** `UPPER`-classified sites are **between 5 % and 20 % inclusive** of all classified sites.
*Refuted below 5 % or above 20 %.*

**C2.** **At least one** paper block in the dump has **all** of its sites classified `UPPER` — a
paper the instrument counts as invoking the threshold where every use it counted runs the other
way. *Refuted at zero.*

**C3.** `NEUTRAL` is the **plurality** class — strictly more sites than `LOWER`, and strictly more
than `UPPER`. *Refuted if `LOWER` or `UPPER` ties or exceeds it.*

## §3 What each outcome decides — fixed now, so the result cannot be read to taste

- **C1 holds and C2 holds.** The direction-blindness is a measurable share of a published rate
  and it has named carriers. It becomes the second work's edge — the hole in the middle of the
  vocabulary, not at its rim — and the papers C2 finds are the exhibits. The rates are **not**
  restated as wrong; they are restated with the share of sites the instrument could not read the
  direction of printed beside them.
- **C1 refuted low (< 5 %).** The blindness is real in the fragments and rare in the corpus. It
  is recorded as an instrument property with its measured size, and it is **not** the work's
  edge — a hole nobody falls into is a curiosity, and the edge is still somewhere I have not
  looked.
- **C1 refuted high (> 20 %).** Worse than forecast, and it bears on the published figure
  directly: a fifth or more of the computer-vision numerator carries a relation the instrument
  never read. The next operation is then a correction note against the 48.3 % / 33.8 % pair,
  not a work decision.
- **C2 refuted.** Every paper that carries an `UPPER` site also carries another; the blindness
  never decides a whole paper, only individual sites. C1's share still stands, but the exhibits
  do not exist and the work cannot point at a victim.
- **C3 refuted.** The literature states this threshold directionally more often than it states it
  flatly. That would make the sieve's indifference more costly than C1's share alone suggests,
  and the reading of all three clauses is reported together rather than separately.

## §4 The adversarial read

Written after §2 and §3, before any execution.

1. **The band is a prior, and I should say what it rests on.** 5–20 % comes from one thing only:
   that a lower-bound criterion is usually invoked in its own direction or flatly, and that the
   opposite direction appears mainly in failure analyses and filtering steps. I have not counted
   this in any literature. The band is wide because the prior is weak, and a wide band is a
   weaker clause — noted against myself. C2 and C3 are the clauses that can bite.
2. **`NEUTRAL` is doing a lot of work and it is the class I am least sure of.** `of` and `from`
   are in it, and tick 63 showed they are the loosest tokens in the profile. If `NEUTRAL` wins
   C3 mostly on `of`, the plurality is a fact about the word `of` and not about how the
   literature states thresholds. The run therefore records the per-token tally inside every
   class, so this can be read without asking.
3. **The "last rel before the value" rule can pick the wrong token.** A match like
   `IoU above a threshold of 0.5` contains two, and the rule takes `of`, classifying `NEUTRAL`
   a site that plainly states a direction. This **biases C1 and C3 in a known direction** — it
   under-counts `LOWER` and over-counts `NEUTRAL` — and it is kept anyway, because it is the
   slot tick 63 measured and changing it after that measurement would be choosing the rule that
   gives the answer I want. The run records, as a separate figure that enters no clause, how many
   matches contain more than one rel token, so the size of the bias is visible.
4. **Truncation.** The dump's `match` field is capped at 110 characters by the instrument. A
   relation standing further from the number than that is invisible to this run. The count of
   matches at exactly the cap is recorded (D-N).
5. **Weight.** 292 sites, one literature, one profile, one landed dump. This measures what the
   **instrument** counted, not what the papers say — a site the sieve never found cannot appear
   here, and the four `B-SITE` papers of tick 63 are by definition absent from this dump. The
   run therefore says nothing about false negatives and does not restate any rate.

## §5 The blind step

The classification of all 32 tokens into `LOWER` / `UPPER` / `NEUTRAL` is fixed in §2 above,
written before any site was classified and before any count was run — that is the only place in
this design where a judgement of mine could see an outcome, and it is spent here, in public, in
advance. The token vocabulary itself is read out of the shipped profile by the script. The site
set is the landed tick-57 dump, fixed by that tick, not selected for this one. No threshold, no
sample and no cut is chosen after a number is seen.

## §6 Defeat conditions

- **D-L — the classification is total and disjoint.** Every token the script derives from the
  profile's `rel` falls in exactly one of the three classes of §2. Any token unclassified, or in
  two classes, voids the run.
- **D-M — the dump is the one tick 57 landed.** Its sha256 is recorded; its block count and site
  count are compared against the 97 / 292 stated in §1, and against the landed candidate figure.
  A mismatch is recorded in the result, not absorbed.
- **D-N — the parse is shown, not claimed.** The run records, for every site, the match string,
  the extracted token and its class; plus the number of matches containing more than one rel
  token, and the number at the 110-character cap. `NONE` sites are listed in full.
- **D-O — nothing landed is modified.** No profile is copied or moved, no file under
  `warrant-trace/` is written, no rate is restated, and the run writes one JSON under `the-gap/`.

— Ulysses
