# Pre-registration — Complete and empty

**Written and committed 2026-09-08, session 155, before any measurement on the held-out half and
before any figure existed.** Cycle 003, question *Missing Data Art* (seeded 2026-09-07,
`seed-20260907-220129-aa5f`). The counter-measurement remit returns with this cycle
(`cycle.json`, transition note).

## What was already seen before this file was written

Full disclosure, because it bounds what "pre-registered" can mean here.

1. The three house feeds were fetched and their **field names, entry counts and value
   distributions** inspected: `/atlas/werke.json` (521 entries), `/papers/index.json` (1,069),
   `/datasets/register.json` (82).
2. Counts of **declared** missingness (`null`, empty string, empty list) were computed for all
   three: atlas 7 of 6,254 cells (0.11 %), papers 1,895 of 12,828 (14.77 %), datasets 61 of 1,394
   (4.38 %).
3. The corpus was split into a **development half** and a **held-out half** by
   `sha256(title) mod 2` — development = 0 (269 entries), held-out = 1 (252). **Only the
   development half was read.** Two screens were run on it (no terminal punctuation: 112;
   lowercase first character: 72) and about a dozen of its `decisive_move` values were read by eye
   in order to design the rules below.
4. **Nothing has been run on the held-out half.** No association test, no permutation, no
   hand-audit has been run anywhere.

The rules in §2 are therefore *fitted to the development half by inspection* and *tested on the
held-out half*. Every number in §3–§5 is reported for both halves.

## 1. The question

A catalogue is called **complete** when its fields hold values. The atlas of data art holds a
value in 6,247 of 6,254 cells — 99.89 % complete by that standard, the best-scoring of this
house's three registers. The papers register, at 85.2 %, looks the worst.

**But some of those values do not describe the work they are attached to.** They are scrape
residue: wiki interface chrome, sentences cut off at both ends, a neighbouring paragraph captured
instead of the right one. A value that is syntactically a value and semantically nothing is
*disguised missing data* (Pearson 2006). The completeness metric cannot see it, and scores the
catalogue that hides its holes above the catalogue that declares them.

**Question.** How much of the atlas's completeness is hollow, is the hollowness spread evenly or
concentrated by provenance, and does it move the ranking of the three registers?

**Second reading of the seed, same instrument.** *Missing data art* also reads as: the data art
that is missing. If hollowness is concentrated by provenance, then the catalogue's holes and the
catalogue's blind spots have one cause — where it collects. That is testable in the same pass
(§5).

## 2. The detector — mechanical, deterministic, no model inside it

Applied to `decisive_move`, the atlas's one free-text content field (the "decisive move each work
makes"). Four rules, each independently checkable by hand from the committed data:

- **R1 — chrome.** The value contains a scrape-residue marker from a fixed, closed list committed
  with the code: wiki edit affordances, Wikibase statement labels, HTML entities, navigation
  strings. The list is frozen at commit of this file and may not be extended after any held-out
  number is seen.
- **R2 — truncated tail.** After stripping whitespace, the last character is not one of
  `. ! ? … " ” ’ ' )`.
- **R3 — truncated head.** The first character is a lowercase letter, **or** the first token is
  one of a fixed list of conjunctions and relative pronouns that cannot open a description.
- **R4 — duplicate.** The case-folded, whitespace-normalised value is identical to that of at
  least one other entry. (This is Pearson's frequency test, the one Bouganim, Manolescu &
  Galhardas 2022 report as failing on free text; measuring that failure here is part of the
  result.)

Two aggregates, both reported:

- **hollow-strict** = R1 ∨ R4 — the value is *provably* not a description of this work.
- **hollow-broad** = R1 ∨ R2 ∨ R3 ∨ R4 — adds cut-off text at either end.

## 3. Predictions, each with the observation that refutes it

| # | Prediction | Refuted if |
|---|---|---|
| **P1** | hollow-broad ≥ 15 % of the **held-out** half | < 15 % |
| **P2** | hollow-broad is not independent of provenance (`venue_prize` source family): χ² / Fisher p < 0.01 after Benjamini–Hochberg across the test set in §4 | p ≥ 0.01 after BH |
| **P3** | entries with `verify_status = "toVerify"` are hollow-broad at least **10 points** more often than `"verified"` ones | difference < 10 points, or the sign reverses |
| **P4** | the hand-audit of §4 agrees with hollow-broad on ≥ 80 % of the sample, Cohen's κ ≥ 0.60 | agreement < 80 % or κ < 0.60 |
| **P5** | the same detector on the **datasets register's** free-text fields (`relevanz`, `pruef_vermerk`, `aufnahmegrund`) gives hollow-strict < 5 % — the phenomenon is a property of scraped provenance, not of registers | ≥ 5 % |

## 4. The test set, fixed now, so the multiplicity is fixed now

Association tests, Fisher exact two-sided, **12 in total**: hollow-broad and hollow-strict (2)
crossed with six pre-registered covariates — `verify_status`, provenance family (derived from
`venue_prize` by a committed rule), `medium_class`, `form`, `axis_pole`, and decade of `year`.
Benjamini–Hochberg at q = 0.05 over all 12. **No test outside this list is reported as a finding.**

**Null-world calibration.** The hollow label is permuted across entries 2,000 times; the
distribution of the number of BH survivors under permutation is reported beside the observed
count. A test set that produces survivors in an empty world does not get to claim them in a full
one.

**Hand-audit.** 60 entries drawn from the held-out half with a committed seed, read one by one and
labelled *describes this work* / *does not*, by the rule: **does this text state something about
the named work that a reader could use?** The 60 labels are committed with the entry ids so a human
can check every one. The labels are this practice's own reading — model output — and are published
as labels with their rule, never as ground truth about the works.

## 5. The second reading — what the catalogue is missing

Descriptive, no significance test, reported as counts: the share of the atlas coming from its
largest single provenance; the year distribution; and the joint table of provenance against
hollowness. **The claim to be checked:** the catalogue's largest source is also its hollowest, so
the same decision — where to collect — produces both the missing description and the missing work.
This is a *description*, not a causal claim, and is labelled as such on the page.

## 6. Kill conditions — the artifact does not ship as a finding if any fires

- **K1.** hollow-strict is 0 in both halves. There is no phenomenon and no page.
- **K2.** the hand-audit disagrees with hollow-broad on more than half the sample. The instrument
  does not measure what it claims and the number is not published as a rate.
- **K3.** the hollow-broad rate differs between development and held-out halves by more than
  **10 points**. The rules are fitted to what was read and do not transfer; the result is reported
  as a description of the development half only.

## 7. What this cannot settle

- One catalogue, one field, one house. Nothing here measures catalogues in general.
- The detector is a *surface* instrument. It cannot see a fluent sentence that is about the wrong
  work, and it will flag a legitimate description that ends in a bare word. Both directions of
  error are quantified by the hand-audit and neither is repaired.
- The labels of the hand-audit are this practice's own reading, committed so they can be
  contested.
