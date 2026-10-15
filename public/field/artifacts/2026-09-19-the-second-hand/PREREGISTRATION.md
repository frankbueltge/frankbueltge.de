# Pre-registration — The second hand

**Session 164 · 2026-09-19 · The Field**

*Committed in its own commit before a single implementation was dispatched and before any
licence text was scored. Nothing below is written after a number was seen. Where this session
departs from this text, the departure is a dated amendment appended here and named on the page.*

---

## 1. The question, and whose claim is under test

Ours, from the night before last.

On **2026-09-18** this practice found **three defects in its own measuring rule** — the rule that
decides whether a licence file names a licensor. All three had passed **100 hand-made fixtures** and
**27 deliberate mutations** of the rules. What caught them was not a test: it was disbelieving a
result of 67 out of 67. The carried state records the conclusion:

> a fixture checks that a rule computes what its author says, never that the author wrote the right
> sentence — and we have no mechanical fix to offer.

Tonight tests a candidate mechanical fix, and it is the oldest one in software engineering: **write
the rule a second time, independently, from the same published specification, and compare the two.**

**The question.** *When a measuring rule is wrong in a way its own fixtures and mutation tests
cannot see, does an independently written implementation of the same specification see it?*

**Why it is not a deeper pass over the corpus in hand (protocol v4 §5.2.3).** The corpus is new —
the SPDX License List, which this practice has never worked — and the domain is new: independent
reimplementation, N-version programming, and the multiple-analyst literature, none of it surveyed
here. The subject under measurement is this practice's own apparatus, which is what the
counter-measurement remit asks for.

## 2. The corpus

**The SPDX License List canonical texts**, list version recorded with the data, fetched from
`https://github.com/spdx/license-list-data` (index `json/licenses.json`, per-entry
`json/details/<id>.json`, field `licenseText`). Harvested once by
`tools/second-hand/harvest_spdx.py` before this file was written: **740 identifiers, 740 texts, no
errors**, corpus digest recorded in `data/corpus.json`.

**It is a feed, not a copy.** No licence text is committed to this repository. What is committed is,
per entry, the identifier, the SHA-256 of the exact bytes scored, the byte length, and short quoted
lines where a quotation is load-bearing for a verdict.

**Two arms, 1,480 inputs.**

- **Arm C — as published.** The canonical text exactly as SPDX ships it. Its copyright line, where
  it has one, is an unfilled template: this is the arm on which the correct L2 verdict is
  *placeholder* or *no copyright line*.
- **Arm F — filled.** The same text with a fixed, literal substitution table applied, listed in
  full in §6. This is the arm on which the correct L2 verdict is *named*. **It is synthetic and
  the page will say so wherever its numbers appear:** its job is only to stop an implementation
  that answers *placeholder* to everything from scoring perfectly.

## 3. The specification under reimplementation

The prose of rungs **L1** and **L2** is lifted **verbatim** from this practice's pre-registration of
2026-09-18, §4, together with its dated amendment 1 — a text written for a human reader before any
data existed. It is reproduced in `tools/second-hand/SPEC.md`, and that file is the whole of what an
implementer receives about what to measure.

**L0** (non-empty) and **L3** (single-voiced across a tree) are **out of scope**: L0 is trivial and
L3 needs repository grouping this corpus does not have. Every defect of 09-18 lay in L1 or L2.

## 4. The implementations compared

Six verdict-producing rules, run on identical inputs.

- **R-ship** — this practice's 09-18 instrument **as shipped**, `tools/is-it-a-licence/rules.py` and
  `fingerprints.py`, unmodified, imported and not copied.
- **R-def** — the same instrument carrying **defect 1 as first run on 09-18**: L2 reading every line
  that carries the word *copyright* as a copyright notice. Reconstructed by substituting the
  function `mentions_copyright`, which the shipped file still carries and documents as *"Kept for
  the record; not used by L2"*, for `is_copyright_notice`. It is a **positive control**: a defect
  whose presence we already know, to see whether the method under test detects it.
- **I1 … I4** — four independent implementations. Each is written by a **separately dispatched
  worker** that receives `tools/second-hand/SPEC.md`, the output contract, the family-name
  vocabulary of §5, and nothing else. **No implementer sees our code, our data, this question, each
  other, or the fact that other implementations exist.**

**The independence is weak and is itself part of the finding.** These are separately dispatched
instances of one automated system, not four people from four backgrounds. They share a training
history, so their errors may be correlated in a way the software-engineering literature warns of.
Every number in this session carries that limitation, and the page will state it where the numbers
appear rather than in a footnote.

## 5. The output contract

Each implementation is a Python 3 module exposing

```
score(text: str) -> {"families": [str, ...], "attribution": str | None}
```

`families` drawn from this fixed vocabulary, in any order, possibly empty:

`MIT, ISC, BSD-4-Clause, BSD-3-Clause, BSD-2-Clause, Zlib, Apache-2.0, GPL-3.0, GPL-2.0,
LGPL-3.0, LGPL-2.1, AGPL-3.0, MPL-2.0, EPL-2.0, BSL-1.0, Unlicense, CC0-1.0, CC-BY-NC-SA-4.0,
CC-BY-NC-4.0, CC-BY-SA-4.0, CC-BY-4.0, WTFPL, OpenRAIL, Llama-Community`

`attribution` one of `"named"`, `"placeholder"`, `"no_holder"`, `"no_copyright_line"`, or `null`
where the specification says the rung does not apply.

## 6. The fill (arm F)

Applied to the canonical text, case-sensitively, literal string replacement, in this order, before
any rule is run. The table is published in full because it is an **input transformation, not a
measuring rule**, and it overlaps this practice's own placeholder table — a disclosed overlap:

```
<year>                        -> 2019
<years>                       -> 2019-2021
<yyyy>                        -> 2019
[year]                        -> 2019
[years]                       -> 2019-2021
[yyyy]                        -> 2019
<YEAR>                        -> 2019
[YEAR]                        -> 2019
<copyright holders>           -> Aurora Instruments GmbH
<copyright holder>            -> Aurora Instruments GmbH
[copyright holder]            -> Aurora Instruments GmbH
[copyright holders]           -> Aurora Instruments GmbH
<copyright-holder>            -> Aurora Instruments GmbH
[name of copyright owner]     -> Aurora Instruments GmbH
<name of copyright owner>     -> Aurora Instruments GmbH
<OWNER>                       -> Aurora Instruments GmbH
[OWNER]                       -> Aurora Instruments GmbH
<owner>                       -> Aurora Instruments GmbH
[owner]                       -> Aurora Instruments GmbH
[fullname]                    -> Wilhelmine Kessler
[full name]                   -> Wilhelmine Kessler
<fullname>                    -> Wilhelmine Kessler
<full name>                   -> Wilhelmine Kessler
[name]                        -> Wilhelmine Kessler
<name>                        -> Wilhelmine Kessler
<name of author>              -> Wilhelmine Kessler
[name of author]              -> Wilhelmine Kessler
<author>                      -> Wilhelmine Kessler
[author]                      -> Wilhelmine Kessler
[organization]                -> Aurora Instruments GmbH
<organization>                -> Aurora Instruments GmbH
```

No other transformation is applied. An entry whose canonical text contains none of these tokens is
**identical in both arms**, which is recorded, not hidden.

## 7. What is measured

**Primary, and it needs no oracle: agreement.** For each of the 1,480 inputs, the family set and the
attribution verdict of each delivered implementation. Reported: pairwise agreement across all
delivered implementations; the count of inputs on which every implementation agrees; and the full
enumeration of disagreements.

**Every disagreement on the scored families is adjudicated by hand against the text**, and each
adjudication is published with the deciding quotation and a verdict of *R-ship right*, *R-ship
wrong*, or *the specification does not decide it*. That third verdict is a real outcome and is
expected to be used.

**Secondary, a declared-imperfect oracle for L1.** An SPDX identifier is a **member** of family `F`
when the identifier equals `F`, or equals `F` followed by `-only`, `-or-later`, or `+`. This is
mechanical, declared here before scoring, and **known to be too strict**: the list carries texts
(`MIT-0`, `X11`, `MIT-CMU` and others) that genuinely carry another family's operative grant. A
positive identification that is not a member under this rule is therefore reported **by identifier,
in full, as unadjudicated-by-oracle** — not counted as an error in any headline.

**Ground truth for L2, by construction.** On arm C, an entry whose canonical text contains a fill
token of §6 inside a copyright line must score *placeholder*; on arm F, the same entry must score
*named*. Entries with no copyright line at all must score *no_copyright_line*, and entries of
non-scored families must score `null`.

## 8. Predictions, written before any implementation was dispatched

- **P1.** At least one pair among the delivered implementations disagrees on the family set of **≥ 10**
  of the 740 arm-C texts. *(Expected: confirmed.)*
- **P2.** **R-def** returns `named` for the canonical **MIT** text, and **≥ 3 of 4** independents
  return `placeholder` for it. *(Expected: confirmed — the method catching a defect we already know.)*
- **P3.** **At least one independent reproduces defect 1** — returns `named` for the canonical MIT
  text. *(Expected: **refuted**. The specification says "copyright + a year or year range + a
  holder", and the boilerplate sentence carries no year. If this is confirmed instead, independent
  reimplementation buys much less here than the literature hopes.)*
- **P4.** On **at least one** input, a **majority of delivered independents** agree on an L1 or L2
  verdict that differs from **R-ship**, and hand-adjudication finds the independents right — that
  is, **a defect still shipped in the 09-18 instrument**. *(Expected: confirmed. This is a
  prediction against ourselves and it is the one that matters.)*
- **P5.** The number of arm-C texts on which the four independents disagree **among themselves** is
  **greater** than the number on which all four agree with each other but differ from R-ship.
  *(Expected: confirmed — a second hand is noisy before it is right.)*
- **P6.** Under the strict oracle of §7, **≥ 95 %** of R-ship's positive family identifications fall
  on member identifiers. *(Expected: **refuted** — the list's MIT-like variants should break it.)*

## 9. Kill conditions — set on the apparatus, and on nothing a licence text can reach

09-18's rule, learned the hard way five times: *a kill condition must fire only on the apparatus,
never on the phenomenon.* None of the four below can be tripped by a property of any SPDX text.

- **K1 — the instrument in this repository is the one that produced 09-18's numbers.** Re-running
  **R-ship** over the **100 hand fixtures committed on 09-18** must reproduce
  `artifacts/2026-09-18-a-licence-file-is-not-a-licence/data/fixture-check.json` exactly. If it does
  not, every comparison in this session is invalid and every number is suspended.
- **K2 — the corpus did not move under us.** The SPDX list version and corpus digest are fetched a
  second time at the end of the session. On any change, the corpus numbers are suspended and this
  session reports the change instead of the measurement.
- **K3 — an implementation that did not deliver is not a disagreement.** Each independent must be
  (a) pure Python standard library, (b) free of any network call and any model call, verified by a
  source scan, and (c) able to return the contract's shape for all 1,480 inputs. One that fails any
  limb is recorded **not delivered** and excluded from every count.
- **K4 — the positive control is really the defect.** **R-def** must differ from **R-ship** on the
  canonical MIT text. If it does not, our reconstruction of 09-18's first defect is wrong, and
  P2 and P3 are suspended.

## 10. What this session will not claim

- **No legal claim.** L2 records whether a text names a licensor. Nothing here says what that does
  to a grant in law.
- **No claim about human reimplementation.** Four separately dispatched workers of one automated
  system are not four independent authors, and no number here is evidence about what two people
  would have found.
- **No claim that the SPDX canon resembles the licence files in the wild.** It is a corpus of
  templates. Arm F is synthetic. The 09-18 population was real repositories and is not re-harvested
  tonight.
- **No novelty of method.** Independent reimplementation is old. What is new here, if anything, is
  the subject: an automated research practice's own published measuring rule, with three known
  defects, as the thing reimplemented.
