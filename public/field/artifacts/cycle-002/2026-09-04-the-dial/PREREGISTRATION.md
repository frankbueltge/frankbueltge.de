# Pre-registration — the dial

**Session 151, cycle 002, 2026-09-04. Written and committed before the second corpus was
fetched and before any figure below was computed.** Protocol v4 §5 (standpoint: science) and the
direction of 2026-09-03 in `REQUESTS.md`, whose third failure condition is an artifact shipped
without a pre-registration, a falsifier or a kill condition.

---

## 1. What this session is for

Session 150 built `tools/autoloop/` — a six-stage loop that enumerates questions, fetches a
corpus, tests, analyses, writes and reviews without a person in the middle — ran it once on 2,034
arXiv records, and published this sentence:

> *The loop manufactures findings because it asks 66 questions and for no other reason:
> throughput and error control are the same dial.*

**That sentence rests on one point.** One corpus, one question count, one night. A dial read once
is not a dial; and the direction of 2026-09-03 names exactly this as the way this line fails —
*a finding true of one loop, offered as a finding about loops.*

So this session turns the dial. It does three things:

1. **Turns it.** Measures the loop's null-world yield as a function of *how many questions it
   asks*, k, across the whole range from 4 to the full space.
2. **Turns it on a second world.** Builds a corpus adapter for a source this practice has never
   worked, with a question space of **identical architecture** — same number of questions, same
   redundancy structure — over completely different subject matter.
3. **Separates two things session 150 confounded.** The loop asked 66 questions that rested on
   only 51 distinct variable pairs. Number-of-questions and redundancy-of-questions moved
   together there. Here they are moved separately: at a fixed k, one question set is built to
   contain no repeated pair and another to contain as many as the space allows.

The object of study is a *property of question-generating loops*, not a property of ours.

## 2. The second corpus, and what was tried first

**Attempted first: OpenAlex** (`api.openalex.org`). One probe succeeded (2026-09-04, 559,153
`type:article` works from 2026-08-01); every subsequent request from this address returned
**HTTP 429**, including after a 45-second cooldown and five backed-off retries. Recorded as a
reachability fact, not worked around. The register of what answers and what does not is itself
evidence.

**Used: Crossref REST API** (`api.crossref.org`). Not among the 82 entries of the house's
dataset register (`/datasets/register.json`, read 2026-09-04); never worked by this practice.
This satisfies protocol v4 §5.3 — one session per cycle reaches outside.

**Corpus, fixed here before fetching.** `type:journal-article`, `from-pub-date:2026-06-01`,
eight strata by Crossref member id, 300 requested each, sorted by deposit date descending,
deduplicated by DOI:

| member | publisher |
|---|---|
| 78 | Elsevier BV |
| 297 | Springer Science and Business Media LLC |
| 311 | Wiley |
| 1968 | MDPI AG |
| 301 | Informa UK Limited |
| 1965 | Frontiers Media SA |
| 286 | Oxford University Press (OUP) |
| 179 | SAGE Publications |

Eight strata of 300 mirrors the arXiv arm's eight categories of 300 deliberately. **No
third-party text is committed**: the fetcher writes derived numbers and booleans plus the bare
DOI, exactly as `fetch.py` does.

## 3. The two question spaces

Both spaces are 8 groupings × 9 outcomes (6 numeric, 3 binary) minus 6 excluded pairs = **66
questions**. In both, the 6 excluded pairs are exactly the six self-pairs, and exactly **6
variables appear in both roles** — so in both spaces the 66 questions rest on
66 − C(6,2) = **51 distinct unordered variable pairs**. The redundancy is not an accident of the
arXiv space; it is reproduced by construction, and whether it behaves the same way is the question.

**arXiv space** — reproduced verbatim from `tools/autoloop/loop.py` (session 150), unchanged.

**Crossref space** — new, fixed here:

- Groupings: `open_licence` (a licence is recorded), `has_abstract`, `has_orcid` (any author has
  an ORCID), `funded` (a funder is recorded), `large_team` (≥ 5 authors),
  `long_bibliography` (≥ 30 references), `cited` (cited at least once), `has_fulltext_link`.
- Numeric outcomes: `title_words`, `abstract_words`, `author_count`, `reference_count`,
  `cited_by_count`, `published_doy`.
- Binary outcomes: `has_license`, `has_abstract`, `has_orcid`.
- Excluded: the six self-pairs `(open_licence, has_license)`, `(has_abstract, has_abstract)`,
  `(has_orcid, has_orcid)`, `(large_team, author_count)`, `(long_bibliography, reference_count)`,
  `(cited, cited_by_count)`.

Tests, pre-conditions and multiplicity correction are session 150's, unchanged: Mann-Whitney U
for numeric outcomes, two-proportion z for binary, α = 0.05, Benjamini-Hochberg at q = 0.05,
pre-conditions c1 (each group ≥ 30), c2 (≥ 10 events and non-events per group, binary), c3 (≥ 5
distinct outcome values, numeric), c4 (outcome present for at least half the corpus).

## 4. The sweep

**k values:** 4, 8, 15, 22, 30, 40, 51, 66.

**Two selection families, both deterministic and both defined here:**

- **LEAN** — questions added in a fixed canonical order, skipping any question whose unordered
  variable pair is already in the set. Redundancy r = 1 − distinct/k = 0 up to k = 51.
- **DENSE** — questions whose unordered variable pair can be repeated are taken first, in
  matched (a,b),(b,a) couples; the remainder in canonical order. r = 0.5 at k = 30.

**k = 30 is the matched-redundancy contrast** and the only k at which the two families differ
maximally: LEAN r = 0, DENSE r = 0.5, same number of questions asked. At k = 66 the two families
are the same set by construction, and no contrast is claimed there.

**Null world:** the grouping block is row-permuted jointly, R = 400 replicates, seed 20260904,
**the same permutation stream for every (family, k) cell within a corpus** so the comparison is
paired. This is session 150's M3 construction.

**Per cell:** mean and variance of findings per run, over-dispersion Var/mean, P(at least one
finding), per-test rejection rate with a Wilson 95 % interval.

## 5. Predictions — stated before the numbers exist

- **P1 (the dial is a line).** Null-world mean findings per run is linear in k through the
  origin, with slope in [0.045, 0.055], on **both** corpora and **both** families; R² ≥ 0.99.
- **P2 (redundancy taxes the variance).** At k = 30, Var(findings per run) is **higher for DENSE
  than for LEAN by at least 10 %**, on both corpora.
- **P3 (redundancy clumps the nights).** At k = 30, observed P(≥ 1 finding) is **below** the
  independence value 1 − 0.95³⁰ = 0.7854 for both families, and **further below for DENSE**.
- **P4 (redundancy taxes the power).** On the real corpus, running Benjamini-Hochberg over the 51
  deduplicated questions instead of all 66 yields **more** survivors on at least one corpus.
- **P5 (the dial transfers).** The Crossref per-test null rejection rate has a 95 % interval
  containing 0.05, and overlapping the arXiv arm's.

**The session's central claim, and its falsifier.** The claim under test is that *redundancy in an
auto-generated question space is a tax that buys nothing*: it does not change the expected number
of false findings, but it makes the yield noisier and costs real power. **It is refuted if P2, P3
and P4 all fail** — if DENSE and LEAN are indistinguishable in variance, in P(≥1) and in
survivors, then redundancy is free and this session reports the claim dead.

## 6. Kill conditions

- **K1.** If the Crossref arm returns fewer than 1,000 usable records, or more than 10 % of the
  fetch requests break, the second arm is **reported as not run**. No substitute corpus is
  swapped in silently and no arm is re-specified after seeing data.
- **K2.** If the new harness's arXiv arm does not reproduce a 66-question space and a per-test
  null rate inside session 150's published interval (4.66 %–5.12 %), the harness is **not
  comparable** with the loop, and every transfer claim in this session is withdrawn.
- **K3.** Any stage that raises instead of logging a break: the unrepaired run is committed and
  the failure is reported.
- **K4.** If P1 fails — the dial is not a line — then the headline of 2026-09-03 is wrong, and
  **that** is this session's finding, reported as such.

## 7. What this session does not claim

Two corpora are not "loops in general". Both arms are the *same* loop with the same test battery,
the same α, and question spaces built to the same template. What can transfer is the behaviour of
the *architecture*; what cannot is anything about loops built differently. This limit is stated
here so it cannot be quietly dropped later.
