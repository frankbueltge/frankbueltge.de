# Verification — which questions count

Session 152, 2026-09-05.

## 1. What holds this page up

| # | check | how | result |
|---|-------|-----|--------|
| V1 | the pre-registration precedes the results | the commit carrying `PREREGISTRATION.md` carries no results file; `git log --follow` on the two paths shows the order | holds |
| V2 | no network call is needed for any figure | `denominator_study.py` opens only committed paths | holds |
| V3 | K1 — soundness of the rule | asleep questions × replicates, intersected with observed rejections, on three registered datasets and sixteen post-hoc ones | 0 firings in 53,000 opportunities |
| V4 | K2 — invariance under the null world's own permutation | each corpus rebuilt 200 times with the grouping block permuted; partition recomputed from the permuted records | moved 0 of 400 |
| V5 | K3 — the loop's existing measurements did not move | modified `loop.py` re-run on session 150's committed corpus, seed 20260903, 500 replicates; all 66 claims compared | every p-value, every verdict, every headline identical (66 hypotheses, 14 raw, 10 BH, 12 BH on the registered denominator, 7 Bonferroni, 15 review kills, 3.224 findings per null run, 4.884848 % per test, 1612/33000 rejections) |
| V6 | the page cannot drift from its evidence | every number on `index.html` is interpolated from `data/denominator.json` at build time; no figure is typed by hand | holds by construction |
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

## 3. Known defects carried, not repaired

- **Corpus C's fetcher is defective and was left so.** `fetch_crossref.py` sorts by *deposit* date
  and caps at 300 per publisher, so 1,485 of 1,921 dated records fall in the last eight days of
  the fourteen-week window it names and Elsevier's 300 carry no resolvable issue date. Found and
  dated 2026-09-04; left unrepaired so that the committed corpus and the code that made it still
  match. **No verdict in this study conditions on C being a fair sample of anything:** every claim
  here is about the loop's arithmetic over whatever corpus it is handed.
- **P3 is a weak test, and the page says so in its own voice.** Lowest-rate trims of fifteen and
  twenty-five Crossref questions give 4.97 % and 5.26 %, both inside the band P3 named. P3
  confirms that the arithmetic lands in the nominal band and nothing more; the warrant for the
  partition is P1 and the fact that the rule reads no rates.
- **P2's one miss.** At n = 80 on the arXiv subsample, `has_comment|has_doi` recorded zero
  rejections in 200 replicates and the rule calls it awake. That is the expected shape of a finite
  replicate budget, not a defect in the rule: 200 replicates cannot distinguish a true rate of
  zero from one of 0.4 %. Registered P2 was tested on the three full datasets and holds there.
- **The rule was exercised in its trivial regime on the full corpora.** On both 2026-09-04 corpora
  every asleep question has a constant grouping, which a one-line check would also catch. The
  post-hoc curve is what tests it where it does more, and it is labelled post-hoc everywhere.

## 4. The apparatus

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

## 5. The adversary

*Filled in below after the artifact was attacked.*
