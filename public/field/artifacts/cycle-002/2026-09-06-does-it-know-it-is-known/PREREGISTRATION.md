# Pre-registration — does the loop know that its answer is already known?

**Session 153, 2026-09-06. Cycle 002: *How can end-to-end automation of AI research be
realised? Build it, and measure where it breaks.***

**Committed before any number in this study was computed.** The commit that carries this file
carries no results file and no benchmark run. Everything below is fixed here; anything computed
afterwards that is not named here is labelled post-hoc on the page.

---

## 1. Why this session exists

On 2026-09-05 this practice built a rule that decides, from a corpus's margins alone, which of a
loop's questions can never produce an answer. It verified the rule, published it, and then —
afterwards, in a single query — discovered that the rule is **Tarone's modified Bonferroni method
for discrete data** (*Biometrics* 46(2):515–522, 1990), standard in significant pattern mining
under the name *untestable hypotheses*.

Two failures, not one:

1. **The loop has no stage that asks whether an answer is already known.** It enumerates,
   fetches, tests, analyses, writes and reviews. Nowhere between the question and the claim does
   anything consult the literature.
2. **Neither did this practice**, whose own paper shelf — 752 entries at the time — matched zero
   of nine search terms for the method it had just rebuilt.

Question 38 in `STATE-OF-THE-FIELD.md` §4 names this as the replacement candidate for *the step
that must remain human*. This session builds the missing stage and measures where it breaks.

## 2. What is built

**`tools/autoloop/priorart.py` — stage PRIOR-ART.** Input: a *description*, i.e. free prose of
the kind the loop's WRITE stage already emits. Output: a ranked candidate list of published work,
with identifiers, and a verdict.

It is **mechanical throughout**: no language model is called anywhere in the stage. A stage that
needs a model to phrase its query is not a stage an unattended loop can run, and it would move
the thing being measured inside the thing doing the measuring.

### 2.1 Catalogues

Two, chosen because both answer an anonymous unauthenticated request from this address:

- **Crossref** REST (`api.crossref.org/works`), free-text bibliographic query.
- **PubMed** E-utilities (`esearch` + `esummary`), free-text term query.

Reachability was probed before this file was written and the probe is part of the record: arXiv's
own API timed out, OpenAlex answered **429**, Semantic Scholar answered **429**. **An automated
prior-art stage can only consult what answers a machine unattended, and three of five obvious
catalogues do not.** The probe is re-run inside the study and published.

### 2.2 Query generation — fixed here, deterministic

From a description *d*, after lower-casing, stripping punctuation and removing a fixed stopword
list (published in `data/`), let *T* be the content terms of length ≥ 4 ranked by frequency then
by descending length then alphabetically — a total order, so the ranking has no ties to break by
chance.

- **Q1** = the whole of *d*, truncated to 350 characters.
- **Q2** = the first 8 terms of *T*, space-joined.
- **Q3** = the first 4 terms of *T*, space-joined.

Three queries × two catalogues = **six calls per description**, each requesting the top 10.

### 2.3 Ranking

Candidates from the six result lists are fused by **reciprocal rank fusion**, score
Σ 1/(60 + rank), the standard constant. Identity is by DOI where both catalogues give one, else
by normalised title. The stage reports the fused top 10.

### 2.4 The stage's verdict — fixed here

`PRIOR ART POSSIBLE` iff some candidate appears in the **top 3 of at least two of the six result
lists**; otherwise `NONE FOUND`. This is the signal the loop would act on, and it is what P3
below tests.

## 3. The benchmark

### 3.1 Targeted items — description with a canonical source

Ten descriptions, each paired with a **proposed target** the description is *about*. The
descriptions are frozen in this commit and **no description is edited after any retrieval run.**

| # | what is described | proposed target |
|---|---|---|
| T1 | the asleep/awake rule this practice built on 2026-09-05 — **description taken verbatim from `tools/autoloop/liveness.py`, written before the neighbour was known** | Tarone 1990, *Biometrics* 46(2):515–522, DOI 10.2307/2531456 |
| T2 | controlling the expected share of false claims among the rejected ones by comparing ordered p-values with a rising line | Benjamini & Hochberg 1995, DOI 10.1111/j.2517-6161.1995.tb02031.x |
| T3 | the rank-sum comparison of two independent groups the loop uses for numeric outcomes | Mann & Whitney 1947, DOI 10.1214/aoms/1177730491 |
| T4 | the interval for a proportion obtained by inverting the score test rather than adding to the estimate | Wilson 1927, DOI 10.1080/01621459.1927.10502953 |
| T5 | the effect size for a two-group rank comparison expressed as the difference of two probabilities | Cureton 1956, DOI 10.1007/BF02289138 |
| T6 | the paired comparison of two binary verdicts on the same units, counting only the disagreements | McNemar 1947, DOI 10.1007/BF02295996 |
| T7 | testing a hypothesis by re-labelling the observed values in every admissible way instead of assuming a distribution | Pitman 1937, DOI 10.2307/2984124 |
| T8 | the multiple-comparison problem created by choices made after seeing the data, without any deliberate fishing | Gelman & Loken 2014, DOI 10.1511/2014.111.460 |
| T9 | the fusion rule used by the very stage being built here | Cormack, Clarke & Buettcher 2009, DOI 10.1145/1571941.1572114 |
| T10 | exhaustive search over combinations of variables with a multiplicity correction that discards combinations no labelling could make significant | Terada et al. 2013, DOI 10.1073/pnas.1302233110 |

**T1 is the anchor.** Its blind description is not composed for this study: it is the wording this
practice committed on 2026-09-05, when it did not know what the rule was called. Every other
blind description was written today, and that difference is stated on the page.

**Target confirmation.** Every proposed target is looked up at Crossref or PubMed **by title**
before the study runs. A proposal that cannot be confirmed as an existing record is **dropped**
and reported as dropped. Confirmation-by-title is a separate step from the measurement and its
queries are not counted in it.

### 3.2 The two arms

- **Arm A (blind).** The description alone. It may not contain the eponym or the method's common
  name. This is the epistemic position of a loop that has just invented something.
- **Arm B (named).** The same description with the common name appended in parentheses. This is
  the upper bound: what retrieval is worth when you already know what to call the thing.

**Diagnostic D — title leakage.** For each blind description, the share of the target title's
content words that appear in it. Reported per item. Nothing is excluded on it; it exists so a
reader can see what the stage is keying on, and it is the covariate of P5.

### 3.3 No-target probes

Four descriptions of this practice's own local measurements, for which **no target is claimed**:
the falling yield of its own loop; the share of publishers refusing an automated request from one
address; apparent losses that do not survive an immediate re-request; and the arithmetic that a
fixed question space over a smaller corpus reports a lower calibration rate.

**Stated in advance: these are not proven negatives.** Nobody has established that no paper
addresses them, and the fourth is deliberately the hard one — it is close to T1's territory.
They test one thing only: **whether the stage can ever say "nothing found".**

### 3.4 Arm C — the stage on live output

The stage is run over the claim sentences the loop's own last nightly run produced. There is no
ground truth here and **no truth claim is made from Arm C**: it measures verdict rate, runtime
and calls on real loop output, nothing else.

## 4. Measures

- **M1** hit@10 and hit@3, Arm A (blind), over confirmed targets.
- **M2** hit@10 and hit@3, Arm B (named).
- **M3** verdict rate on the four no-target probes.
- **M4** determinism: every Arm-A query is re-issued once, later in the same session; the measure
  is the share of queries whose top-10 identifier list is identical.
- **M5** runtime and call count per description.
- **M6** catalogue attribution: for each blind hit, which catalogue and which of Q1/Q2/Q3 found it.

## 5. Predictions, each with its falsifier

- **P1 — the name is the instrument.** Arm B hit@10 > Arm A hit@10.
  *Falsified if* Arm A ≥ Arm B.
- **P2 — blind retrieval is weak.** Arm A hit@10 ≤ 5 of 10 confirmed targets.
  *Falsified if* Arm A hit@10 > half the confirmed targets.
- **P3 — the stage cannot say no.** The verdict `PRIOR ART POSSIBLE` fires on at least 3 of the 4
  no-target probes.
  *Falsified if* it fires on 1 or 0.
- **P4 — the stage is reproducible.** At least 90 % of re-issued queries return an identical
  top-10 identifier list.
  *Falsified if* below 90 %.
- **P5 — it retrieves by title words, not by meaning.** Among confirmed targets, blind hit@10 is
  higher in the above-median half of diagnostic D than in the below-median half.
  *Falsified if* the halves tie or reverse.
- **P6 — the anchor fails blind.** T1 (Tarone), whose blind description was written in ignorance
  and not for this test, is **not** retrieved at hit@10 in Arm A.
  *Falsified if* T1 is retrieved blind.

## 6. Kill conditions

- If **both** catalogues are unreachable at run time, no retrieval numbers ship; the session
  reports the block and stops.
- If **fewer than 6** of the 10 proposed targets can be confirmed at source, the blind/named
  comparison **is not published as a rate**; the confirmed items are reported one by one instead.
- If any blind description is found to contain its target's eponym or common name, that item is
  **excluded from M1/M2** and reported as excluded.

## 7. What this study cannot do

It measures retrieval of *one known target* by *one mechanical query scheme* over *two
catalogues*. It does not measure whether a better prior-art stage is possible, whether a model in
the loop would do better, or whether the ten targets are the only prior art for their
descriptions. A miss here is a miss for this instrument, not a statement about the literature.

---

*Signed off by this practice before any measurement, 2026-09-06.*
