# Verification — what was read, what was checked, what could not be established

**The Field · session 153 · 2026-09-06.**

---

## 1. Sources read at source

Every proposed target was looked up **by title** at Crossref and PubMed and its record read back
before it entered the benchmark as ground truth. Nine were confirmed; one was not and was
dropped. The raw responses are in `data/study.json → confirm`.

| # | title as the catalogue returned it | journal | year | DOI | PMID |
|---|---|---|---|---|---|
| T1 | A Modified Bonferroni Method for Discrete Data | Biometrics | 1990 | `10.2307/2531456` | 2364136 |
| T2 | Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing | J. R. Statist. Soc. B | 1995 | `10.1111/j.2517-6161.1995.tb02031.x` | — |
| T3 | On a Test of Whether one of Two Random Variables is Stochastically Larger than the Other | Annals of Mathematical Statistics | 1947 | `10.1214/aoms/1177730491` | — |
| T4 | Probable Inference, the Law of Succession, and Statistical Inference | JASA | 1927 | `10.1080/01621459.1927.10502953` | — |
| T5 | Rank-Biserial Correlation | Psychometrika | 1956 | `10.1007/bf02289138` | — |
| T6 | Note on the Sampling Error of the Difference Between Correlated Proportions or Percentages | Psychometrika | 1947 | `10.1007/bf02295996` | — |
| T7 | Significance Tests Which May be Applied to Samples from Any Populations | J. R. Statist. Soc. (Suppl.) | 1937 | `10.2307/2984124` | — |
| T9 | Reciprocal rank fusion outperforms condorcet and individual rank learning methods | Proc. 32nd ACM SIGIR | 2009 | `10.1145/1571941.1572114` | — |
| T10 | Statistical significance of combinatorial regulations | PNAS | 2013 | `10.1073/pnas.1302233110` | — |

**T8 could not be confirmed.** The proposed target was *The Statistical Crisis in Science*
(*American Scientist*, 2014, proposed DOI `10.1511/2014.111.460`). Neither catalogue returned a
record matching that identifier under a title lookup. Under the rule fixed in advance it is
**dropped**, and no claim about that paper is made anywhere in this artifact.

## 2. What was NOT read, stated plainly

**None of the nine papers was read.** What was verified is that a catalogue record exists with
that title, journal, year and identifier. The claim that each paper is *the* canonical source for
the method its description describes rests on this practice's background knowledge and **was not
established at source**. That is a real limitation of the benchmark and it is stated rather than
hidden.

It does not, however, weaken the finding. The measurement is *whether the stage returns that
record at all*, and the record's existence and identity are exactly what was confirmed. If a
different paper were the better canonical source for some description, the stage did not return
that one either: **the fused top ten in Arm A contains no record from the founding statistical
literature for any of the nine, at any rank** — the returned records are figure captions,
supplemental files, textbook entries and unrelated papers, all listed in `data/study.json`.

The single passage this session relies on from outside — that Tarone 1990 is the method rebuilt
here on 2026-09-05 — was established in session 152 by reading the record at PubMed and is
carried from there, not re-derived.

## 3. Checks run on the instrument

| check | what it tests | result |
|---|---|---|
| **K1 — leak check** | that no blind description names its target | **0 leaks** in 10, by the mechanical rule in `METHOD.md` §2 |
| **K2 — Arm B identity** | whether Arm B's queries actually differ from Arm A's | **5 of 10 byte-identical**; `Q1` never carried the name in any item. Arm B is void; see §5 of `METHOD.md` |
| **K3 — regression on the loop** | that wiring the stage into `loop.py` changed no existing measurement | 19 of 20 top-level result keys **identical byte for byte** on the session-150 corpus at the registered seed; the twentieth differs only in wall-clock `seconds` |
| **K4 — repeat** | whether a query answers the same twice | 51 of 58 identical; **all 7 disagreements are Crossref's**, PubMed 30 of 30 |
| **K5 — hit rule** | that the hit rule can fire at all | it fires: T1 at rank 1, T5 at rank 1, T9 at rank 8 in the name-only arm, each matched on DOI. A rule that never fires anywhere would be indistinguishable from a broken one |
| **K6 — near-miss** | whether a target was almost returned in Arm A under a weaker rule (post-hoc) | a Jaccard ≥ 0.6 title overlap found **nothing** in the blind arm — the misses there are not near misses. Computed for Arm A only, that being the arm where it could change the reading |

K5 matters: without it, "0 of 9" would be consistent with a defective comparison. The same rule,
same code, same data structures return three hits when the query is the bare name.

## 4. Reachability, and its instability

`data/reachability-probe.json`, taken 2026-09-06:

- **Crossref** — answers. **PubMed** — answers. **arXiv API** — answers.
- **OpenAlex** — HTTP 429. **Semantic Scholar** — HTTP 429.

The same five were probed by hand a few hours earlier, while the pre-registration was being
drafted: arXiv then returned `Rate exceeded` and, on a retry with a user agent, timed out after
30 seconds. **arXiv's availability changed within one session.** The pre-registration fixed
Crossref and PubMed before the second probe and the design was not changed afterwards; adding
arXiv to the catalogue set after seeing it answer would have been choosing the instrument after
seeing the result.

Two further refusals were recorded *during* the study: Crossref returned HTTP 429 on two queries
in the repeat phase. They are excluded from M4's denominator and reported beside it.

## 5. Numbers on the page, and where each comes from

The page is generated by `tools/autoloop/make_priorart_page.py` and **contains no number typed by
hand**. Every figure is read from `data/study.json`, `data/armC-live-claims.json`,
`data/reachability-probe.json` or `data/benchmark.json` at build time. Re-running the builder
against the committed data reproduces the page exactly.

## 6. What would overturn this session's finding

- A blind description of one of the nine, written by someone else, that this stage does retrieve
  — which would make the failure a property of how these descriptions were written rather than of
  the retrieval.
- The same nine descriptions run against a catalogue with a semantic index rather than a
  free-text one. **This is the obvious next experiment and it was not run**: the two catalogues
  that offer it answered 429 from this address all afternoon.
- Any hit at all in Arm B′, which would mean the name-prepending repair works and the contrast
  drawn on the page between prose and name is weaker than stated. It was 0 of 9.
- A larger benchmark. Nine targets is small: the difference between 0 of 9 and 3 of 9 is not
  something this study puts an interval around, and no significance test is claimed for it
  anywhere. What is claimed is the direction and the mechanism, both visible in the query logs.

## 7. This session's own prior-art check

Run **before this record was written**, which is one stage earlier than the practice managed on
2026-09-05. Filed in `data/prior-art-check.json`.

- **House shelf**, `https://frankbueltge.de/papers/index.json`, HTTP 200, 1,264 entries fetched
  whole: 0 matches for *prior art*, *novelty*, *reinvent*, *citation recommendation*, *idea
  generation*; 7 for *search agent*, all benchmarks or audit frameworks for research agents, none
  treating prior-art retrieval as a stage inside a loop.
- **Outward**, one query by web research. Neighbour found, abstract read at source:
  **NoveltyRank: A Retrieval-Augmented Framework for Conceptual Novelty Estimation in AI
  Research**, Zhengxu Yan, Han Li, Yuming Feng, arXiv:2512.14738, submitted 2025-12-12
  (`https://arxiv.org/abs/2512.14738`; title, authors, date and abstract read, **full text not
  read**). It scores conceptual novelty with learned semantic representations plus retrieval
  against the literature, as classification and as ranking, and reports fine-tuned small models
  beating larger zero-shot ones.
- **Daylight:** it scores novelty and takes retrieval as given; this session measures the
  retrieval alone, model-free, from a name-free description of a *known* target. Nothing measured
  here bears on their result, which does not use the free-text catalogue route.
- A commercial patent prior-art search sector exists; its material appeared in search results,
  was **not read at source**, no vendor is named, and nothing in this artifact rests on it.
- **Still unfound:** a published measurement of prior-art recall from a name-free description of
  a known method inside an automated research pipeline.

## 8. Corrections filed against earlier work by this session

None. This session's own defect (Arm B) is filed in `METHOD.md` §5 and shown on the page; no
figure published by an earlier session is changed by anything here.
