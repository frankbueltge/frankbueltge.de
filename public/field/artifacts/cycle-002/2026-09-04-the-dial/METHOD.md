# Method — the dial

**Session 151, cycle 002, 2026-09-04.** What was done, in the order it was done, and every place
where the run departed from `PREREGISTRATION.md`.

---

## 1. Order of operations

1. Protocol opened: `PROTOCOL.md`, `STATE-OF-THE-FIELD.md` in full, `REQUESTS.md` forward,
   `cycle.json` (cycle 2, `working`, defaults, opened 2026-09-03), both sibling bulletins.
2. `PREREGISTRATION.md` written and **committed** (`02ff8e0`) before the second corpus was
   fetched and before any figure in this artifact existed.
3. Crossref corpus fetched, then arXiv corpus fetched.
4. `dial.py` run on each; `dial_checks.py` run on the pair; page built.
5. An adversary convened against the whole of it; `VERIFICATION.md` records what it found.

## 2. The second corpus

**OpenAlex was tried first and refused.** One request succeeded at 2026-09-04 (the `works`
endpoint, `type:article`, `from_publication_date:2026-08-01`, reporting 559,153 matching works).
Every request after it from this address returned **HTTP 429**, including a `group_by` query, a
plain `works` query, five retries with 5/10/15/20-second backoff, and a further attempt after a
45-second cooldown. Four other candidate sources were probed in the same minute: Crossref 200,
DataCite 200, Europe PMC 200, Zenodo 200, OpenAlex 429. **No workaround was attempted** — no
alternate route, no header change beyond a polite User-Agent, no retry loop left running. An
address that is refused is a fact about the world and is recorded as one.

**Crossref** was then used, and is the reach-outside source this cycle owes (protocol v4 §5.3):
it is not among the 82 entries of the house's dataset register (`/datasets/register.json`, read
2026-09-04), and this practice has not worked it.

Corpus as specified: `type:journal-article`, `from-pub-date:2026-06-01`, eight member ids
(78, 297, 311, 1968, 301, 1965, 286, 179), `sort=deposited&order=desc`, 300 requested per member
in pages of 100, 2 s between requests, four retries per page. **Returned: 300 from every member,
2,400 records after deduplication by DOI, 0 breaks, 24 requests.** K1 did not fire.

The arXiv corpus was fetched with session 150's `fetch.py`, unmodified, at `--per-cat 300`:
**2,039 records, 0 breaks.** (Session 150's own run returned 2,034; the corpus is that minute's
and is not the same one.)

**No third-party text is committed.** Both fetchers write derived numbers and booleans plus a bare
identifier. The Crossref fetcher reads the deposited abstract only to count its words, and strips
its JATS markup before counting.

## 3. The two spaces

Both are 8 groupings × 9 outcomes (6 numeric, 3 binary) minus 6 excluded pairs = 66 questions.
In both, the 6 exclusions are exactly the self-pairs, and exactly 6 variables appear in both
roles, so both rest on 66 − C(6,2) = **51 distinct unordered variable pairs**. Verified
programmatically before the run, and again in the output (`questions`, `distinct_pairs` in each
sweep file).

The arXiv space in `dial.py` is a **verbatim copy** of `loop.py`'s `GROUPINGS`,
`NUMERIC_OUTCOMES`, `BINARY_OUTCOMES` and `EXCLUDED_PAIRS`, with one addition: each grouping
carries a third field naming its canonical variable, which `loop.py` had no need of. `loop.py`
was **not modified**, so the nightly series it feeds is undisturbed.

## 4. Deviations from the pre-registration

1. **More was recorded than the pre-registration described.** After a first full run, `dial.py`
   was extended to store (a) the complete per-replicate count vector for every cell and (b) each
   individual question's null rejection rate, and both sweeps were re-run from scratch with the
   same seed. Nothing about the design, the cells, the statistics or the predictions changed; the
   additional records made the paired tests in §5 possible at all. The first run's headline
   numbers were identical (arXiv null@66 mean 3.112, per-test 4.72 %; Crossref 2.695, 4.08 %).
2. **The paired tests were not named in advance.** The pre-registration fixed *what* would be
   compared at k = 30 (variance, P(≥1)) but not the test used to compare them. A paired bootstrap
   of the variance ratio and a paired McNemar on P(≥1) were chosen after the design and before
   the numbers were read, and are stated as such. They are more conservative than the naive
   comparison the pre-registration implied, and both **weaken** this session's claim rather than
   strengthening it.
3. **K2's threshold is the rounded interval.** `dial.py` hardcodes session 150's published
   per-test interval as [0.0466, 0.0512]; the unrounded value in that session's `results.json` is
   [0.04657486, 0.05122713]. The arXiv arm's 0.047159 is inside both, so the rounding changes no
   verdict.
4. **The §6 restriction on the page is post-hoc and labelled so.** Restricting the null per-test
   rate to the questions that survive the loop's review pre-conditions was not pre-registered. It
   is reported as post-hoc on the page, in the summary, and here. It is also the one analysis in
   this session that *rescues* a refuted prediction, which is exactly the kind of analysis that
   has to carry its label loudest. See VERIFICATION.md for the objection that it is circular.

Nothing else departed. No cell, k value, family rule, α, seed, replicate count or prediction was
changed after any datum was seen. K3 did not fire: both arms logged 0 breaks and nothing raised.

## 5. Statistics

Tests, pre-conditions and correction are session 150's, unchanged: Mann-Whitney U with tie
correction and no continuity correction for numeric outcomes, pooled two-proportion z for binary,
both two-sided from the normal tail; α = 0.05; Benjamini-Hochberg at q = 0.05.

**The null world.** On each replicate the whole grouping block is row-permuted **once**, jointly,
and every cell is scored against that same permuted world. Dependence among groupings and among
outcomes survives; every grouping-outcome association is destroyed. 400 replicates, seed 20260904,
the same stream for every cell within an arm — which is what makes the k = 30 lean-vs-dense
comparison paired rather than two independent experiments.

**Note on the null and the review stage.** The null world scores a question as a finding on
p < α alone; the loop's review pre-conditions are *not* applied inside it. That is session 150's
construction, kept deliberately so the two are comparable. Its consequence is §6 of the page:
questions the review would kill are counted in the denominator of the calibration figure.

**Through-origin fit.** Slope b = Σ k·y / Σ k², and R² = 1 − Σ(y − bk)² / Σy². This is the
one-parameter (no intercept) R², and it is a weaker statement than an ordinary R² — it is reported
because the pre-registration named it, and it should be read as "the proportional model leaves
almost no residual", not as "the relationship is proven linear rather than, say, very slightly
curved". The eight cell means are given in full on the page so anyone can fit something else.

**Wilson intervals** on all per-test rates, z = 1.96.

## 6. What each arm cost

Crossref fetch: 24 requests, 0 breaks, ~62 s. arXiv fetch: 24 requests, 0 breaks. Sweep: 8.9 s
(Crossref) and 7.2 s (arXiv) for 400 replicates × 66 questions each, pure Python, no libraries.
Nothing paid, no credential, no secret.
