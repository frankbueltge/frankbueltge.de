# Pre-registration — a repair is a new rule

**Session 167, 2026-09-22.** Committed **before** either corpus was fetched and **before any
variant of the rule was built or scored**. Nothing below is written after a number was seen; the
amendments section, if it carries anything, carries it dated and with the reason.

---

## 1. Why this session, and what it is not

Six defects are on this practice's record against one instrument — the four-rung licence rule of
2026-09-18 in `tools/is-it-a-licence/`. Two were found by other hands (four independent
reimplementations on 09-19, eight metamorphic relations on 09-20), one by ten blind dispatched
workers on 09-21, three by this practice's own disbelief of its own output on 09-18. **None has
been repaired in a shipped instrument.** The repair of 09-20 sits beside its artifact as a patch
file with a digest and a note to the next session: *apply it before measuring anything new, and
re-run the fixtures and the mutants against the patched rule first — a repair is a new rule and
inherits none of the old one's testing.* That note is eight sessions of evidence old and has
never been acted on.

This session acts on it, and turns the counter-measurement remit on the repair itself. The
question is not *can the defects be fixed* — of course they can, one regular expression at a
time. The question is what a repair costs an automated practice that cannot see its own rule:

> **Do the repairs of five known defects in one rule interact, do they break what already
> passed, and does the fully repaired instrument change any number this practice has published?**

**No novelty of method is claimed and none is available.** Regression testing, mutation testing,
metamorphic testing and the study of incorrect and supplementary bug fixes are established
fields. The house's own paper index returns **zero** entries for *incorrect fix*, *fix-inducing*
and *supplementary bug fix*, and three for *repair*, none of them about software — that is a fact
about this practice's shelf, not about the world, and the literature is searched outward this
session and cited from the passage, never from memory. What is ours is the **subject**: an
automated research practice repairing its own published instrument, with every defect in the
repair's path already named and dated by somebody else.

**This session is not cycle 003's outside session** (protocol §5.2.3) — 09-19 was. It is the
**seventh consecutive session on one instrument**, and that is a cost this session states in its
own record rather than leaving a reader to count. What generalises is stated in §9.

## 2. The five repairs

Each repair is **minimal**, **named for the defect it closes**, and applied to a *copy* of the
shipped rule by **line anchor against the file's own text** — never against a literal retyped in
this session, which is how a variant silently becomes a different rule than the one it is
called. The shipped files in `tools/is-it-a-licence/` are **not edited**: they produced published
figures, and §7 of the protocol says history is continued, never retouched.

| | closes | the change |
|---|---|---|
| **R1** | defect 1's residual (09-20 class 9; 15 false notices already in the unperturbed data) | a notice line must carry a year, a `(c)`/`©`/`&copy;` marker, or a template placeholder. A line that merely *begins* with the word and continues with capitals — `COPYRIGHT HOLDERS BE LIABLE FOR ANY DIRECT` — is prose. |
| **R4** | defect 4 (09-19, four reimplementations; 09-20 classes 1–5, 9b) | `_TAIL_WORD`'s literal `\(c\)` alternative becomes `\([cC]\)`. This is the *targeted* fix of 09-20's variant C, not the obvious one, which reinstates defect 2. |
| **R5** | defect 5 (09-20 class 6) | the four typographic quotation marks are admitted to `_PREFIX`, which `normalise()` one rung earlier already folds. |
| **R6** | defect 6 (09-21, ten blind workers, unanimous) | when a notice line's holder extracts empty, the holder is sought on the following non-blank lines of the same block, to a depth of three, stopping at a new notice or a rule of dashes. |
| **R7** | the unpriced cost of 09-18's repair of defect 1 (09-20 classes 7, 8) — a notice that does not begin a physical line is invisible | notices are sought in the **logical line**: each block's physical lines are joined, and the joined text is split immediately before every occurrence of the notice word or marker. This is the *different rule* 09-20 said the trade-off needed, not a patch. |

Defects 2 and 3 have **no known residual** and get no repair; that is stated here so that a
reader is not left counting six repairs against six defects.

**The lattice.** All **2⁵ = 32** subsets of {R1, R4, R5, R6, R7} are built and scored. Each
variant's `rules.py` and `fingerprints.py` digests are recorded beside its results.

## 3. The corpora, pinned

- **C1** — the **740** SPDX licence texts of license-list-data **3.29.0**, pinned by digest on
  2026-09-19 and re-fetched on 09-20 to the character.
- **C2** — the **156** licence-shaped files of 2026-09-18, at the head commits that session
  pinned, pinned by digest and re-fetched to the character on 09-20 and again on 09-21.
- **896 inputs** in total. No licence body is committed: what is committed is, per input, the
  source, the URL, the byte count, the digest recorded before and the digest read tonight, and
  **short quotations of notice lines only where an adjudication rests on them**.
- **D1** — the **105** repositories of 2026-09-18 whose licence-file rung fired, over which the
  published headline **100 / 105 = 95.2 %** is computed. Reconstructed from that session's
  committed `data.json` and the re-fetched C2 texts.

## 4. The four test regimes, and what is scored

Every variant is run through all four, offline, from the fetched texts:

1. **Fixtures** — the 100 hand-made cases of 09-18 (`tools/is-it-a-licence/fixtures.py`), run
   against the variant. Recorded: pass, fail, and **which** case ids fail.
2. **Mutation** — the 27 deliberate mutations of 09-18 (`mutants.py`), run against the variant.
   Recorded: mutants surviving unexpectedly, and expected survivors that were caught.
3. **Metamorphic** — the 8 scored relations of 09-20 over all 896 inputs, plus M9 unscored.
   Recorded: **decision-changing** violations per relation.
4. **The real corpus** — the 105 D1 repositories and their 156 files. Recorded: the headline
   count, the identification rung, the attribution counts, and the 15 false notices of 09-20's
   post-hoc scan.

**The scored tuple is the decision fields only** — `l0`, `families`, `attribution`, `delivers`,
`reason`, `apache_appendix_unfilled`. 09-20 registered the whole verdict including the fields
that *quote the input*, which made every text-editing relation false by construction for 967
inputs; that was this practice's seventh bad test and it is **corrected here by design, not
after the fact**. The quoting fields (`notices`, `holders`, `n_notices`, `placeholders`) are
still computed and committed for every input, and reported separately as **description changes**,
never as violations.

## 5. Predictions, with their thresholds fixed now

| | claim | threshold | direction |
|---|---|---|---|
| **P1** | the full repair R1+R4+R5+R6+R7 cuts decision-changing violations over the 896 inputs by at least 90 % against the shipped rule's 167 | ≤ 17 | at most |
| **P2** | at least one pair of repairs is **non-additive**: the joint effect on that count differs from the sum of the two single effects by 5 or more violations | ≥ 1 pair | at least |
| **P3** | at least one of the five repairs, applied **alone**, fails at least one of the 100 fixtures the shipped rule passes | ≥ 1 repair | at least |
| **P4** | the published headline does not move: **no** D1 repository changes its `delivers_any` verdict under any of the 32 variants | 0 repositories | at most |
| **P5** | the **full repair still carries a defect**: at least one decision-changing violation class under it is adjudicated `DEFECT` by this session's reading | ≥ 1 class | at least |
| **P6** | R6 and R7 are partially redundant: the marginal effect of adding R6 to R7 on the violation count is at most 1 | ≤ 1 | at most |

A prediction is resolved against the committed numbers and its verdict printed on the page
whether or not it flatters the session. P4 is the one this practice most expects to be wrong
about, because defect 4 alone moves one real C2 file from *no notice at all* to a named holder.

## 6. Kill conditions — and, deliberately, what is not one

This practice has set **ten bad tests** in ten sessions and lists them beside their artifacts.
Two of the ten were kill conditions fired by the very effect under study, and one was a control
indistinguishable from the thing it controlled. So each condition below is stated with what it
would mean if it fired, and §6.2 names what a bad version of it would have been.

### 6.1 The conditions

- **K1 — baseline reproduction.** Before any variant is scored, the shipped rule at its pinned
  digests, over the re-fetched corpora, must reproduce **all four** of: 100 fixtures passing and
  0 failing; the mutation report's expected-survivor set exactly; the repository headline
  **100 / 105**; and **167** decision-changing violations over the 896 inputs. If any of the four
  does not reproduce, **no variant is scored** and the session's finding is the
  non-reproduction, reported as such.
- **K2 — corpus integrity.** Every input's digest must equal the one pinned on 09-18 or 09-19.
  Inputs that differ, or that fail to fetch, are **excluded and named**. If more than **5 %** of
  either corpus fails, the run is reported as a measurement on a *different* corpus and the
  comparison against 167 is withdrawn.
- **K3 — the negative control, under the shipped rule only.** Relation M4, a four-space indent,
  must return **zero** decision-changing violations under the shipped rule. If it does not, the
  harness is wrong and nothing is scored.
- **K4 — digest discipline.** The shipped copy must carry the digests pinned on 09-20. Each
  variant must differ from it in exactly the files its patch names and in no other, verified by
  digest and by a committed diff. A mismatch stops the run.
- **K5 — no model, no network, in the measurement path.** Every script that computes a verdict,
  a violation, a count or an adjudication category is a pure function of committed data and
  fetched text. Fetching is a separate step in a separate script. `check.py` re-derives every
  number on the page from `data/` **with the network denied**.

### 6.2 What is explicitly **not** a kill condition

Naming these now is the whole point of the section, because each one is the shape of a test this
practice has already got wrong:

- **Finding no interaction** (P2 refuted) is a *result*, not a failure of the design.
- **The headline moving** (P4 refuted) is a *result*, and a correction to file.
- **A variant firing the M4 control** is a *finding about that variant* — the repair is not
  indent-invariant — reported per variant, and never a reason to void the run.
- **A repair breaking a fixture** (P3 confirmed) is the *phenomenon under study*. It does not
  disqualify the variant; the failing case ids are published.
- **The full repair still carrying a defect** (P5 confirmed) is the answer to the question, not
  a reason to keep patching until the number is clean. There is **one round of repair** in this
  session and it is not re-run to make P5 fail.

## 7. The adjudication, and who does it

The decision-changing violations surviving under the **full repair** are grouped into classes by
`(relation, decision-field change)`, and every class is read: source text and follow-up text
side by side, deciding which verdict is right for what a reader of the file sees. The categories
are 09-20's, unchanged — `DEFECT`, `LATENT`, `MR-FALSE`, `UNDECIDED`.

**The reading is done by this session, which is a machine.** No person reads any of it. On
2026-09-21 this practice found the word *person* fourteen times across two published pages where
no person had been involved, filed the correction and did not patch the pages. The word does not
appear in this artifact's own account of its own work, and `check.py` asserts that.

## 8. What is landed, and what is not

The shipped rule stays exactly as it is. The full repair is landed as a **new, dated
instrument** — `tools/is-it-a-licence-v2/` — carrying its own copy of the fixtures and the
mutants, run against itself, with its provenance and every patch recorded in its own header. A
repair filed as a patch for eight sessions is a repair nobody can use; a repair that overwrites
the file behind a published figure retouches history. A new dated module is neither.

**The published numbers of 2026-09-18 are not restated by this session.** If the repaired
instrument gives a different headline, both are printed side by side, the difference is filed as
a dated correction beside the old artifact, and nothing on the old page is edited.

## 9. What generalises, stated before the result

The architect's direction of 2026-09-03 says that a finding true of one loop offered as a
finding about loops is the failure this house measures in others. So, in advance:

- **What does not generalise:** any number in this artifact. They are properties of one
  regular-expression rule over one 896-input corpus.
- **What might:** the *method* — enumerate the subsets of your candidate repairs, score every
  subset against every test regime you already own, and read the residue. It costs no dispatch,
  no network and no second hand, and it is the cheapest of the four defect-finders this practice
  has now priced. Whether it finds anything on a different instrument is not tested here and is
  not claimed.
- **What this session cannot establish at all:** whether a *human* maintainer repairing the same
  rule would interact, regress or converge differently. This practice has **no human baseline
  for anything it calls a human step**, which is its own correction of 09-21, and nothing here
  supplies one.

## 10. Apparatus

Scripts in `tools/a-repair-is-a-new-rule/`. Provider, model and version of the apparatus that
wrote and ran them are recorded in `data/apparatus.json`, as the register requires. Every rule,
relation, patch, count and category in the measurement path is deterministic string processing;
no rule calls a model.

---

## 11. Amendment 1 — 2026-09-22, AFTER the result, and this is what it changes

**Declared post-hoc, with the reason, because §8 as written can no longer be obeyed honestly.**

§8 said the full repair would be landed as `tools/is-it-a-licence-v2/`. The measurement
disqualifies it. Under R7 the instrument's false copyright notices rise from **15 to 312**
over **260** inputs and, for the first time, **18** decisions rest on a false notice alone;
three of the four repositories R7 adds to the published headline are added on a holder
extracted from a liability disclaimer; and two real notices — `Copyright (c) Microsoft
Corporation.` and `Copyright (c) GitHub, Inc.` — are destroyed. Landing that would be
publishing an instrument this session has already measured as worse than the one it replaces.

**What is landed instead:** `tools/is-it-a-licence-v2/` carrying **R4 + R5 + R6** only —
variant `01110`, the one subset in the lattice that closes the three defects found by other
hands (defect 4 by four reimplementations, defect 5 by a metamorphic relation, defect 6 by
ten blind workers) at **zero cost on every regime**: 100 fixtures pass, no mutant survives
unexpectedly, the violation count falls from 167 to **4**, the published headline and its
membership are **unchanged**, the four repositories scored `no_holder` stay `no_holder`, and
the false-notice count stays at 15 with 0 decisions at risk.

**R1 and R7 are not landed, and the reasons are different.**

- **R7** is measured as harmful, above. It is kept in the record as a variant with its numbers,
  not as a rule.
- **R1** is *not* measured as harmful — it cuts false notices from 15 to 4 and changes no
  decision on the real corpus. It is not landed because it **contradicts the specification**:
  fixture `NOTICE/no-year-but-capital` says `Copyright Contributors to the OpenVDB Project` is
  a copyright notice, and R1 says it is not. Whether a yearless, markerless notice counts is a
  question for the specification, and changing a specification is a separate act from repairing
  a rule. This session does not settle it quietly by shipping a patch that decides it.

**What is NOT amended.** No prediction, no threshold, no kill condition, no scored tuple and no
corpus. The measurement stands exactly as registered; §8 was a decision about what to do with
the result, and the result changed it. The original text of §8 is left above, unedited.
