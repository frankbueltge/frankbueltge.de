# Pre-registration — a loop that finds things

**Practice:** The Field (Meridian) · **Session 150** · **Cycle 002** · **Written 2026-09-03,
before any datum was fetched and before any test was run.**

Cycle 002's question, from `cycle.json` (opened 2026-09-03): *How can end-to-end automation of
AI research be realised? Build it, and measure where it breaks.* The direction of 2026-09-03 in
`REQUESTS.md` rests the counter-measurement remit for this cycle and asks for construction
rather than observation. This is the first session of that line.

---

## 1. What is built

An end-to-end research loop, `tools/autoloop/`, that runs unattended from a single command and
carries these stages:

1. **QUESTION** — enumerates a hypothesis space by a rule (grouping variable × outcome variable),
   with no human choosing which pairs are worth asking.
2. **DATA** — fetches a live corpus from a public API, derives a feature table, commits it.
3. **EXPERIMENT** — selects a test per pair by a declared rule and computes it.
4. **ANALYSIS** — effect size, p-value, multiplicity correction, split-half replication.
5. **WRITE** — emits one claim card per surviving pair, in sentences, with its numbers.
6. **REVIEW** — an independent pass that re-derives every number from the committed data,
   applies pre-condition checks, and kills claims that fail them.

**What is honestly NOT automated, stated here so it cannot be claimed later:** the *choice of
the hypothesis space itself* — which variables exist and which pairings are admissible — was
made by this practice and is fixed in §3 below. A loop that also invents its own variables is
not what is being built today. This is the boundary of the claim.

## 2. Corpus (fixed before fetching)

- Source: the arXiv Atom API, `https://export.arxiv.org/api/query`.
- Eight queries, `cat:<C>` for C in **cs.AI, cs.LG, cs.CL, cs.CV, cs.RO, cs.SE, stat.ML, cs.CY**,
  `sortBy=submittedDate&sortOrder=descending`, 300 entries each, paged 100 at a time, ≥ 3 s
  between requests.
- Deduplicated by arXiv identifier. Target ≈ 2,400 records; **kill condition K1** below.
- **Committed:** derived numeric and boolean features plus the bare arXiv identifier. **Not
  committed:** titles, abstracts, author names, comment strings — no third-party text enters
  this repository (repo rule, `.github/workflows/no-committed-sources.yml`).

## 3. The hypothesis space (fixed before fetching)

**Groupings (binary), 8:** `weekend` (published Sat/Sun UTC) · `has_doi` · `has_journal_ref` ·
`has_comment` · `revised` (updated date later than published date) · `cross_listed`
(category_count > 1) · `large_team` (author_count ≥ 5) · `night_submission` (published hour UTC
in [22, 06)).

**Outcomes, 9:** `title_words` (num) · `abstract_words` (num) · `author_count` (num) ·
`category_count` (num) · `comment_pages` (num, where parseable) · `published_hour_utc` (num) ·
`has_doi` (bin) · `has_journal_ref` (bin) · `revised` (bin).

**Admissibility rule:** a pair is excluded when the outcome is the variable the grouping is
derived from (`has_doi`/`has_doi`, `has_journal_ref`/`has_journal_ref`, `revised`/`revised`,
`cross_listed`/`category_count`, `large_team`/`author_count`, `night_submission`/
`published_hour_utc`). 8 × 9 − 6 = **66 tests**. This count is fixed here.

**Test rule:** numeric outcome → Mann–Whitney U, normal approximation with tie correction,
two-sided. Binary outcome → two-proportion z-test, pooled variance, two-sided. α = 0.05.
Effect size: rank-biserial correlation (numeric), risk difference in percentage points (binary).

**Review pre-conditions (a claim failing any of c1–c4 is killed):**
- c1 both groups ≥ 30 observations;
- c2 binary outcome: ≥ 10 events **and** ≥ 10 non-events in each group;
- c3 numeric outcome: ≥ 5 distinct values in the non-missing data;
- c4 the outcome is non-missing for ≥ 50 % of the corpus.
- c5 (flag, not a kill) Benjamini–Hochberg at q = 0.05 across all 66 tests.

## 4. What is measured

- **M1** raw findings: tests with p < 0.05 out of 66.
- **M2** survivors of BH (q = 0.05) and of Bonferroni (α/66).
- **M3** **null world:** the grouping block is row-permuted jointly (destroying every
  grouping–outcome association, preserving the dependence among groupings and among outcomes),
  R = 500 seeded replicates, the full 66-test battery each time. Reported: mean findings per
  run, its distribution, and the per-test rejection rate against the nominal 0.05.
- **M4** review kills: claims failing c1–c4.
- **M5** break log: every stage failure, by stage, recorded by the runner itself.
- **M6** **split-half replication:** the corpus is split by the parity of the last digit of the
  arXiv identifier; a finding replicates if it is p < 0.05 **with the same sign** in both halves.
  Reported as a share of M1.
- **M7** a reading, by this practice and labelled as judgment, of every survivor against a
  three-way rubric fixed here: **definitional** (the relation follows from how the variables are
  constructed), **mechanical** (a known publication-process artefact, e.g. journal versions
  carrying page counts), **substantive** (neither of the first two).

## 5. Predictions, and what refutes them

- **P1 — the loop manufactures findings where there is nothing.** The null world yields ≥ 1
  finding per run on average. *Refuted if* the mean is < 1.
- **P2 — the loop's per-test error rate is above nominal.** The null-world per-test rejection
  rate exceeds 0.05, with its interval excluding 0.05. *Refuted if* the interval covers or falls
  below 0.05 — in which case the honest report is that the tests are calibrated and multiplicity
  alone does the damage.
- **P3 — multiplicity correction is not the binding constraint on real data.** More than half of
  M1 survives BH. *Refuted if* half or more of the raw findings die under BH.
- **P4 — the loop cannot tell a discovery from a definition.** At least half of the BH survivors
  are classed definitional or mechanical under M7. *Refuted if* more than half are substantive.
- **P5 — the loop's findings are fragile to resampling.** Fewer than 80 % of M1 replicate under
  M6. *Refuted if* 80 % or more replicate.

P2, P3, P4 and P5 can all come out either way on the evidence; P1 is close to arithmetic at
K = 66 and is registered so that its arithmetic is on the record rather than presented as a
discovery.

## 6. Kill conditions

- **K1** fewer than 1,500 deduplicated records fetched → the session reports a plumbing failure
  and ships nothing else. The break log is the artifact.
- **K2** if the null world (M3) cannot be computed within the session, the headline is withdrawn
  and only M1, M2, M4, M5, M6 are published, with the withdrawal stated on the page.
- **K3** if the independent review pass disagrees with any number in a claim card, the
  disagreement is published as the finding, not repaired silently.
- **K4** if a stage of the loop cannot be made to run at all, the loop is published broken, with
  the stage named.

## 7. Form

The 2026-09-03 direction asks that the form be decided on the merits and the choice stated.
Decided here, in advance: **interactive**, because the object is a *space of 66 questions* and
the finding is about what happens across it — a reader who cannot sort the space by p-value,
effect size and survival is being asked to take the aggregate on trust. A no-JavaScript floor
renders the complete result table and every headline number. No number will live only in the
script: `make_page.py --check` must rebuild the page from the committed data and fail on a
one-byte difference.

## 8. Deviations

Every departure from this document is recorded in `METHOD.md` with its reason. This file is not
edited after the first datum is fetched; amendments are appended and dated.
