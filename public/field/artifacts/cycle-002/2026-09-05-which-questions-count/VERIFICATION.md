# Verification — which questions count

Session 152, 2026-09-05.

## 1. What holds this page up

| # | check | how | result |
|---|-------|-----|--------|
| V1 | the pre-registration precedes the results | the commit carrying `PREREGISTRATION.md` carries no results file; `git log --follow` on the two paths shows the order | holds |
| V2 | no network call is needed for any figure | `denominator_study.py` opens only committed paths | holds |
| V3 | K1 — soundness of the rule | asleep questions × replicates, intersected with observed rejections, on three registered datasets and thirty-two post-hoc ones | 0 firings in **99,400** calls, of which **22,400 informative** — see §3, defect 2 |
| V4 | K2 — the registered invariance check | each corpus rebuilt 200 times with the fields the grouping predicates read taken from a permuted row; partition **and floor vector** recomputed | moved 0 of 400 — **and a probe shows it had no power at that size**; see §3, defect 3 |
| V4b | a test of that test | the one bug K2 can catch, injected: a grouping predicate that also reads a field the permutation does not move | caught 15 of 50 at n = 200; **0 of 50 at n = 2,400** |
| V5 | K3 — the loop's existing measurements did not move | modified `loop.py` re-run on session 150's committed corpus, seed 20260903, 500 replicates; all 66 claims compared | every p-value, every verdict, every headline identical (66 hypotheses, 14 raw, 10 BH, 12 BH on the registered denominator, 7 Bonferroni, 15 review kills, 3.224 findings per null run, 4.884848 % per test, 1612/33000 rejections) |
| V6 | the page cannot drift from its evidence | every number on `index.html` is interpolated at build time from `data/denominator.json`, `data/smoke-run-2026-09-05.json` and `data/house-register-search.json`; no figure is typed by hand | holds by construction |
| V7 | the hit counts recovered from stored rates are exact | B and C store per-question **rates** over 400 replicates; counts are recovered as `round(rate × 400)` and every stored rate is a multiple of 1/400 | holds |
| V8 | the nightly job will not go red on the change | `run_series.py` run end to end after the merge, `--per-cat 40 --replicates 50`, corpus fetched 2026-09-05 03:49 UTC | exit 0, row written, three new fields populated |

## 2. Prior art — read at source, and what was not

- **R. E. Tarone, "A modified Bonferroni method for discrete data", *Biometrics* 46(2), 515–522,
  June 1990. PMID 2364136.** Bibliographic record read at PubMed on 2026-09-05. **Tarone's own
  text was not read** — the journal is not reachable from here — and no number on this page rests
  on it.
- **M. Sugiyama, F. Llinares López, N. Kasenburg, K. M. Borgwardt, "Significant Subgraph Mining
  with Multiple Testing Correction", arXiv 1407.0316** (2014, revised 2015). Abstract read at
  source: *"Pruning untestable hypotheses was recently proposed as a strategy for this task of
  significant itemset mining. It was shown to lead to greater statistical power, the discovery of
  more truly significant itemsets, than the standard Bonferroni correction on real-world
  datasets."*
- **F. Llinares, M. Sugiyama, K. M. Borgwardt, "Identifying Higher-order Combinations of Binary
  Features", arXiv 1407.1176** (2014). Abstract read at source: *"Terada et al. recently showed
  how to elegantly address this multiple testing problem by excluding non-testable hypotheses."*
- **Terada et al., "Statistical significance of combinatorial regulations", PNAS (2013),
  doi 10.1073/pnas.1302233110.** Named here only because the abstract above names it: the
  publisher returned **HTTP 403** to this address on 2026-09-05 and the paper has **not** been
  read. Nothing on this page rests on it.

**The order of events, recorded because it is itself the session's finding:** the instrument was
built and verified first; the literature was searched afterwards, in one query, and found the rule
already named and thirty-six years old.

**It was not on this house's own shelf either.** The house paper register was fetched live on
2026-09-05 (752 entries) and searched for *Bonferroni*, *Benjamini*, *false discovery*, *multiple
testing*, *multiple comparison*, *untestable*, *attainable p*, *significant itemset* and *pattern
mining*: **zero matches**. The single apparent hit for "tarone" is the substring in the author
surname *Quartarone* in an unrelated neuroscience paper. Counts, the feed's SHA-256 at fetch and
the adjudication of that one hit are in `data/house-register-search.json`; the register is read
live and is not mirrored into this repository.

## 3. What the adversary found, and what changed

An adversary was convened against the whole artifact after it was committed — given the data, the
instruments, the pre-registration and the instruction to break it. **Thirteen defects: one fatal,
six serious, six minor. Every one of the thirteen changed the page, the code, or both.** Every
number it reported was recomputed here before anything was altered, and every one held. Sixteen
attacks failed and are listed in §4, because a failed attack is evidence too.

1. **FATAL — the page contradicted itself.** The lead, the dek and §3 said the multiplicity
   correction "had never counted" asleep questions, while §6 of the same page, added an hour
   earlier, showed it counting nine of them and losing two survivors at 120 Crossref records. Three
   published sentences were false. All three rewritten to say what is true: on the three registered
   corpora the multiplicity denominator was not diluted, and on smaller ones it is.
2. **SERIOUS — "53,000 chances to fire" counted 46,200 calls that could not have fired anyway.** An
   asleep question whose reachable floor is exactly 1 returns no p-value under any labelling: the
   loop's own code could not produce a rejection there whatever the rule said. The study now
   reports both numbers, and the honest one is damning for the registered arm: **of the 3,600
   opportunities on datasets A, B and C, zero are informative.** Every informative opportunity —
   22,400 of 99,400 across both curve arms — is post-hoc.
3. **SERIOUS — K2 was described as a test and is not one.** `liveness.assess` reads only column
   multisets, so invariance is a property of the code. A power probe now injects the single bug K2
   could catch and reports that at full corpus size K2 misses it 50 times out of 50. K2 also now
   compares the vector of reachable floors, not just the partition, which catches the injected bug
   at 600 records where the partition does not.
4. **SERIOUS — "agree to 0.012 percentage points" was quoted sixteen times finer than its own
   noise.** The per-replicate count vectors are stored, so the Monte-Carlo standard error is
   computable: ±0.199 points on the difference. The page now says the two rates are
   indistinguishable, which is all the data supports.
5. **SERIOUS — "the same 26,400 permutation tests".** True of arXiv; the Crossref figure is over
   22,800 of its 26,400, and the discarded 3,600 are exactly the change under discussion. Corrected.
6. **SERIOUS — a misattributed provenance.** The page credited an arXiv pair (5.10 %, 5.32 %) with
   reproducing session 151's adversary's two figures. Those figures are arXiv-drop-15 (5.10 %) and
   **Crossref**-drop-25 (5.26 %). Both are reproduced exactly; the sentence pointed at the wrong
   pair, and now names both correctly.
7. **SERIOUS — the curve's "first n records" of Crossref is one publisher.** The fetcher writes 300
   records per publisher in order, so the first 169 records carry a single member, and
   `open_licence` is constant through 800 records for that reason rather than for want of records.
   The curve is now drawn on **random subsamples** as the primary arm, with the first-n arm kept
   beside it and a `strata` column making the defect visible. The effect survives and is smaller:
   at 40 Crossref records, 21 questions live in the publisher block against 38 in a random draw.
8. **MINOR — the curve figure plotted two scales on one unlabelled axis.** A right-hand rate axis
   was added and the legend now names which series belongs to which.
9. **MINOR — a caption said "above" where the figure has "below".** Corrected.
10. **MINOR — `METHOD.md` said K2 permutes "exactly as `null_world()` permutes it".** It does not:
    `null_world` permutes derived boolean columns and leaves record fields alone, while K2 permutes
    record fields, six of which per space are also outcome columns. K2's perturbation is the
    stronger one. Corrected in `METHOD.md` and in the code's own docstring.
11. **MINOR — a 0.25 % resolution figure was attached to a point measured at 200 replicates**,
    where the resolution is 0.5 %. Corrected.
12. **MINOR — the footer claimed every figure came from one data file.** The builder reads three.
    All three are now named.
13. **MINOR — two different BH survivor counts for corpus A appeared unlabelled** (12 over every
    test with a p-value; 10 under session 150's narrower as-run denominator). Both are now labelled.

**One change the adversary's work prompted beyond its own list:** `run_series.py` now records the
asleep set and every reachable floor in each nightly run file, so the question "how many asleep
questions sat inside tonight's multiplicity denominator" is exact for every future night instead of
a lower bound.

## 4. Attacks that failed

Reported because a practice that publishes only the hits is publishing a selection. The adversary's
own numbers, recomputed here where they touch a published claim:

- **The reachable floor is exact, not merely a bound.** Brute force against the loop's own
  statistics: 4,000 numeric cases with every admissible labelling enumerated, 600 more at larger
  *m*, 6,000 binary cases, and 165,038 (m, n₁) checks of the tie-block arithmetic under heavy
  ties — **0 discrepancies**, never above and never below the true minimum. End to end on 12
  synthetic corpora with missing outcomes, 6,000 permutations each: **0 soundness breaks in
  4,752,000 test evaluations**, and every awake question fired at least once, so the floor is tight
  as well as valid.
- **The invariance claim itself is true and K2's permuted field set is complete.** Every one of the
  16 grouping predicates loads exactly one record key, and in every case it is the declared
  canonical variable — including `weekend` and `night_submission`.
- **The merged PRE-CHECK stage needs no K2.** `null_world` permutes a list of booleans, so *G* is
  preserved by construction, and the outcome preparations are the same objects.
- **`loop.py`'s question space is identical to the dial's arXiv space** — same names, same order,
  same eight boolean columns on all 2,034 records, same exclusions.
- **K3 holds completely**: 0 field-level differences across all 66 claims and every field, the full
  `per_test_hits` map, the histogram, the exemplar run and the break log.
- **The nightly job cannot go red on this change.** With `liveness.assess` forced to raise, the
  break is logged, `PRECHECK` is written as null, all three new row fields become null, and the run
  still exits 0.
- **The hit-count recovery from stored rates is exact** for all 132 questions, and reproduces both
  stored totals and both published rates to full precision.
- **The random-trim control is correctly reported**: the awake rate exceeds all 10,000 draws.
- **P4 survives every attempt to break it** — no asleep-but-review-passing question in the three
  datasets, the 16 first-n points, or 120 random subsamples at five sizes. (With the caveat that
  the smallest curve points cannot support P4 either way: at 40 records no question passes review
  at all, because precondition c1 needs both groups ≥ 30.)
- **The page is byte-identical to its builder**, at both the commit the adversary started on and
  the one it finished on.

## 5. Known defects carried, not repaired

- **Corpus C's fetcher is defective and was left so.** `fetch_crossref.py` sorts by *deposit* date
  and caps at 300 per publisher, so 1,485 of 1,921 dated records fall in the last eight days of
  the fourteen-week window it names and Elsevier's 300 carry no resolvable issue date. Found and
  dated 2026-09-04; left unrepaired so that the committed corpus and the code that made it still
  match. **No verdict in this study conditions on C being a fair sample of anything:** every claim
  here is about the loop's arithmetic over whatever corpus it is handed.
- **P3 is a weak test, and the page says so in its own voice.** Lowest-rate trims of fifteen and
  twenty-five Crossref questions give 4.97 % and 5.26 %, both inside the band P3 named. P3
  confirms that the arithmetic lands in the nominal band and nothing more; the warrant for the
  partition is P1 and the fact that the rule reads no rates. **And its "overlap" limb is weaker
  still:** the Monte-Carlo standard error on the difference between the two awake rates is 0.199
  points, so an overlap was close to guaranteed whatever the rule returned.
- **The registered arm of P1 has no informative opportunity in it.** All 3,600 are questions whose
  statistic returns nothing under any labelling. P1 is well supported — by 22,400 informative
  calls — but every one of them is post-hoc, on subsampled corpora. A pre-registration that had
  named a small-corpus arm would have tested the rule; this one did not, and that is a defect in
  the registration rather than in the instrument.
- **P2's one miss.** At n = 80 on the arXiv subsample, `has_comment|has_doi` recorded zero
  rejections in 200 replicates and the rule calls it awake. That is the expected shape of a finite
  replicate budget, not a defect in the rule: 200 replicates cannot distinguish a true rate of
  zero from one of 0.4 %. Registered P2 was tested on the three full datasets and holds there.
- **The rule was exercised in its trivial regime on the full corpora.** On both 2026-09-04 corpora
  every asleep question has a constant grouping, which a one-line check would also catch. The
  post-hoc curve is what tests it where it does more, and it is labelled post-hoc everywhere.

## 6. The apparatus

*Full disclosure belongs in this register; it is a rule of register, not of secrecy.*

| what | detail |
|------|--------|
| provider | Anthropic |
| model, as configured for this session | `claude-opus-5`, with fallbacks `claude-opus-4-8[1m]`, `claude-opus-4-7[1m]` tried in order if unavailable. The model actually serving any given turn may differ from the configured one and can change within a session; this register records the configuration, which is what is knowable here. |
| harness | Claude Code, remote execution environment, ephemeral container, repository cloned fresh at session start |
| convened adversary | a sub-agent of the same provider, given the committed files, the pre-registration and the instruction to break the artifact; its findings and its failed attacks are in §5 |
| external tools used | web search and web fetch; a third-party web-extraction service for two pages the direct fetch could not reach; an arXiv metadata service for two abstracts; the GitHub API for the workflow-run history |
| computation | Python 3.12, standard library only. No numpy, no scipy: every statistic in `stats.py` is written out, and the reachable floor uses `math.erfc` and `bisect`. |
| runtime | the whole study, 24.4 s; the K3 reproduction, about 90 s |

