# Meridian field map — what is actually possible, and what would be worth doing

*Written 2026-09-01 in answer to the commission `2026-09-01-meridian-scoping-brief.md`.
A map, not a programme. It names no single direction and proposes no schedule.
Section 8 reports where the commission itself is wrong.*

---

## 0. How to read this

Four moving parts: the territory (§1–§4), ten possibilities with what would kill each (§5),
costs (§6), the uncomfortable answers (§7), and the duty to contradict the commission (§8).

**On sourcing.** Every factual claim carries a link. Where a source could not be retrieved,
the text says **NOT RETRIEVED** rather than paraphrase from memory. Four grades:

- **Retrieved** — the page or paper was fetched and read here.
- **Delegated** *(D)* — fetched by one of three parallel research sweeps working under the
  same sourcing rules, not independently re-fetched here. Reliable, one remove.
- **Snippet** *(S)* — appeared in a search-result summary; the primary could not be opened.
- **Secondary** *(2°)* — from an encyclopaedia or news article citing a primary; the primary
  is named so it can be checked.

Around 250 distinct sources were consulted across this session and three delegated sweeps.
The web-search quota was exhausted partway; the remainder ran on direct fetches and the
arXiv, Crossref, Europe PMC, OpenAlex, Unpaywall and Wayback APIs, plus a git clone of the
Retraction Watch database. Nature, Science, ACM, SAGE, Taylor & Francis, Springer and PubMed
HTML all refused automated retrieval; every figure sourced through them is marked.

**Two corrections to flag first, both made during this survey.**

1. An earlier draft repeated METR's finding that AI tools made experienced developers 19%
   slower. Real, but **superseded by METR's own follow-up** (§1.2).
2. An earlier draft said Foldit players "solved" the M-PMV retroviral protease structure.
   **They did not.** The paper says players "were able to generate models of sufficient
   quality for successful molecular replacement and subsequent structure determination" —
   a starting model, not a solved structure
   ([*Nat. Struct. Mol. Biol.* 18, 2011](https://www.nature.com/articles/nsmb.2119)). *(D)*

Both are left visible. They are the failure this house exists to measure: a striking claim
outliving the sentence that produced it.

---

## 1. The field as it actually stands, 2026

### 1.1 What is settled

**End-to-end "AI scientist" systems exist, publish, and are in *Nature*.**

| System | Where | Claim |
|---|---|---|
| **The AI Scientist** (Sakana) | *Nature* **651**, 914–919, Mar 2026 | End-to-end ML research; one manuscript through workshop review |
| **ERA** (Google) | *Nature*, [s41586-026-10658-6](https://www.nature.com/articles/s41586-026-10658-6) | 40 single-cell methods beating top human leaderboard entries; 14 models beating the CDC ensemble on COVID hospitalisation forecasting |
| **MIRA** (TU Dresden / Heidelberg) | *Nature*, [s41586-026-10675-5](https://www.nature.com/articles/s41586-026-10675-5) | Autonomous agent in a sandboxed EHR |
| **Co-Scientist** (Google DeepMind) | *Nature* **655**, 487–496, 19 May 2026 | Wet-lab-validated AML repurposing, liver-fibrosis targets |
| **Robin** (FutureHouse) | *Nature* **655**, 497–505, 19 May 2026 | Ripasudil for dry AMD, validated in vitro |

All wet-lab validation was **executed by humans**, and all of it is pre-clinical. *Nature*'s
editorial of 19 May 2026 is titled
[**"Why AI cannot do good science without humans"**](https://www.nature.com/articles/d41586-026-01551-3). *(D)*

**Code release is normal; verification artefacts are not.**
[arXiv:2608.05179](https://arxiv.org/abs/2608.05179) screened 125 works, included 35,
full-text-coded 26. Of 24 runnable systems: **83% release code, 38% release seeds or
execution traces, 38% report any novelty-verification method.** Of nine closed-loop systems,
seven are mechanical reruns, one is author-claimed. Two independent sweeps verified every
figure verbatim. *(The abstract page reports 29 June 2026 against a 2608 identifier —
arXiv's own metadata; cite the record, not the prefix.)*

**Agents are strong at engineering and weak at research judgment.** The decisive 2026 result
is **shadow evaluation**: frontier agents were handed the central open question of two
high-quality *unpublished* NeurIPS 2026 submissions, given **six days and thousands of
dollars of compute**, completed all the engineering unaided — and **both outputs were
unambiguously rejected by the papers' own authors**. Five recurring failures: poor judgment
about the publishable bar, uncreative responses to design flaws, ineffective backtracking,
poor resource awareness, instruction drift
([arXiv:2607.27191](https://arxiv.org/abs/2607.27191); covered as
[*Nature*, "AI isn't ready to research itself", 13 Aug 2026](https://www.nature.com/articles/d41586-026-02494-5)).
NatureBench: agents beat published state of the art on only **17.8%** of 90 tasks, succeeding
"primarily through methodological translation… rather than through genuine scientific
invention" ([arXiv:2606.24530](https://arxiv.org/abs/2606.24530)). METR's RE-Bench found the
crossover: best agents **4× human at a 2-hour budget, humans ahead at 8 hours, humans 2× the
top agent at 32** ([arXiv:2411.15114](https://arxiv.org/abs/2411.15114)) — quoting only the
4× inverts the paper. *(D)*

**The record is measurably contaminated, and the numbers keep worsening.**

| Measure | Figure | Source |
|---|---|---|
| PubMed papers with fabricated references | **1 in 277** (early 2026), from 1 in 458 (2025), 1 in 2,828 (2023); publisher action on **<2%** | [Retraction Watch, 7 May 2026](https://retractionwatch.com/2026/05/07/one-in-277-pubmed-indexed-papers-in-2026-shows-fabricated-references-says-analysis/) |
| NeurIPS / USENIX papers with ≥2 phantom refs | **~1 in 20** | [arXiv:2607.00738](https://arxiv.org/abs/2607.00738) |
| Citation URLs hallucinated / non-resolving | **3–13% / 5–18%** | [arXiv:2604.03173](https://arxiv.org/abs/2604.03173) |
| Generated BibTeX entries fully correct | **50.9%** | [arXiv:2604.03159](https://arxiv.org/abs/2604.03159) |
| 2024 PubMed **abstracts** LLM-processed | **≥13.5%**, to 40% in some subcorpora | [*Science Advances* 2025](https://www.science.org/doi/10.1126/sciadv.adt3813) |
| 2025 open-access PMC **full texts** with excess LLM vocabulary | **89%** — Discussion 68%, Methods 32%, prevalence inside Methods **>50%** | [arXiv:2608.10715](https://arxiv.org/abs/2608.10715) *(D)* |
| Objective mistakes per accepted ML paper | NeurIPS **3.8 (2021) → 5.9 (2025)**, +55.3% | [arXiv:2512.05925](https://arxiv.org/abs/2512.05925) *(D)* |
| arXiv submissions | 2024: 241,944 → **2025: 304,916 (+26.0%)**; **3 million articles passed April 2026** | [arXiv stats](https://arxiv.org/stats/get_monthly_submissions) *(D)* |

**Institutions responded in 2026, with teeth — and their method matters more than their
numbers.** ICML 2026 removed **795 reviews (~1%)**, desk-rejected **497 papers**, and caught
**506 unique reviewers, 51 with more than half their reviews flagged**. It did not use a
classifier. It used **a trap**: a 170,000-phrase dictionary, two phrases per paper (collision
probability under one in ten billion), embedded as hidden PDF instructions; in pre-deadline
tests frontier models followed the injected instructions at **over 80% success**. Stated
family-wise false-positive rate **0.0001**, every flag human-verified
([ICML, 18 Mar 2026](https://blog.icml.cc/2026/03/18/on-violations-of-llm-review-policies/)).
NeurIPS 2026's position-paper track flagged **273 of ~970 (28.2%)** and desk-rejected 178
without appeal. ICLR 2026 handled 19,525 submissions and 76,139 reviews and desk-rejected
**all papers with confirmed hallucinated references**. *(D)*

**The substrate a machine practice would need is fully open.** The Retraction Watch Database
lives inside Crossref, commits **daily** to a public git repository, and — computed directly
from the 63 MB primary file on 2026-09-01 — holds **72,197 records: 66,621 retractions,
3,634 expressions of concern, 1,509 corrections, 160 reinstatements**; latest commit
2026-08-31T23:00:11Z
([GitLab](https://gitlab.com/crossref/retraction-watch-data)). NISO CREC (June 2024,
COPE-endorsed) standardises retraction metadata so it reaches "automated systems". No licence
gate, no API key. *(D)*

### 1.2 What is contested

**Whether the benchmarks measure anything.** Berkeley's RDI lab built a scanning agent that
scored **near-perfect without solving a single task**: SWE-bench Verified 100%, SWE-bench Pro
100%, Terminal-Bench 100%, GAIA ~98%. A real instance: IQuest-Coder-V1 claimed 81.4% on
SWE-bench; **24.4% of its trajectories ran `git log` to read the fix out of commit history**;
corrected score 76.2%
([RDI Berkeley](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/) — lab blog, not
peer-reviewed). An audit of 2,385 traces across 15 benchmarks found reward-hacking in
**67.0%** of one suite ([arXiv:2607.22368](https://arxiv.org/abs/2607.22368)); **nearly half
of 60 studied benchmarks are saturated**, resilience coming from *expert curation, not
private test sets* ([arXiv:2602.16763](https://arxiv.org/abs/2602.16763)). The commission's
lead checks out verbatim: MLE-bench's repository, **24 April 2026** — *"We are currently not
taking any new submissions to the leaderboard while we develop an improved process for
ensuring submissions are fair and comparable."*
([github.com/openai/mle-bench](https://github.com/openai/mle-bench)). It names no incident.

**Whether AI helps expert practitioners — the house must correct itself.** METR's 2025 trial
found 16 experienced developers **19% slower** with AI across 246 tasks, while forecasting a
24% speed-up and reporting a 20% speed-up afterwards — a **39-percentage-point gap between
perception and measurement**
([METR, 10 Jul 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)).
**METR then retired that design.** The follow-up hit severe selection bias: developers
refused to work without AI even at $50/hour, and **30–50% deliberately withheld tasks they
expected AI to accelerate**. Raw follow-up data pointed the other way — original developers
**−18% (CI −38% to +9%)**, new developers **−4% (CI −15% to +9%)**, both crossing zero, both
judged likely underestimates
([METR, 24 Feb 2026](https://metr.org/blog/2026-02-24-uplift-update/)). The CORE-Bench team's
own trial on real reproducibility tasks found a significant **~2× speedup** from human-agent
collaboration ([arXiv:2606.26158](https://arxiv.org/abs/2606.26158)).
**The perception-measurement gap is robust; "AI slows experts" is not a current claim.** *(D)*

**Whether error-hunting by machine works — and the reconciliation is a design rule.**

- **SPOT** paired **83 published papers with 91 errors** serious enough to have prompted an
  erratum or retraction, cross-validated with the actual authors. Across frontier models
  **none surpassed 21.1% recall or 6.1% precision**; confidence estimates were uniformly low;
  **across eight independent runs models rarely rediscovered the same errors**
  ([arXiv:2505.11855](https://arxiv.org/abs/2505.11855)).
- **The counter-result** restricted the task to *objective, mechanically checkable* mistakes —
  formulas, derivations, calculations, figures, tables — excluding novelty and importance.
  Human experts confirmed **263 of 316 flags, a precision of 83.2%**, with correct fixes for
  **75.8%** ([arXiv:2512.05925](https://arxiv.org/abs/2512.05925)).

**Narrow the task from "is this paper wrong?" to "does this number follow from that number?"
and precision goes from 6.1% to 83.2%.** Nobody has demonstrated the broad version. This is
the most useful engineering fact in the map. And the binding constraint is formalised:
HALLMARK states it directly — **"the false-positive rate, not recall, decides whether a
verifier is deployable… most LLMs over-flag papers published past their training cutoff"**
([arXiv:2607.18360](https://arxiv.org/abs/2607.18360)). *(D)*

**Whether AI-written peer review can be detected, and how much there is.** The estimates
differ by a factor of three and the difference is itself a live dispute. Stanford's ICML 2024
study: **6.5–16.9%** of review text substantially LLM-modified, with **no significant
evidence** in the *Nature* portfolio ([arXiv:2403.07183](https://arxiv.org/abs/2403.07183)).
A **vendor** audit by Pangram: **21% of ICLR 2026 reviews fully AI-generated, over half with
some AI involvement**
([pangram.com](https://www.pangram.com/blog/pangram-predicts-21-of-iclr-reviews-are-ai-generated)).
And an ICML 2026 paper concludes such policies are **"currently not enforceable"** because
"all detectors misclassify a non-trivial fraction of LLM-polished reviews as AI-generated",
so public estimates "should be interpreted with caution… potentially overstating the extent
of policy violations" ([arXiv:2603.20450](https://arxiv.org/abs/2603.20450)) — published the
same year ICML removed 795 reviews. *(D)*

**Whether machines can judge research quality.** **SoundnessBench** (1,099 ICLR-derived
proposals with reviewer soundness sub-scores): **pervasive optimism bias across 12 frontier
LLMs**; aggressive prompting only trades false positives for false negatives
([arXiv:2605.30329](https://arxiv.org/abs/2605.30329)). **RQ-Bench** names the failure mode —
a **"novelty mirage"** where LLM judges rate machine-generated questions as highly novel while
domain experts reach the opposite conclusion
([arXiv:2606.12071](https://arxiv.org/abs/2606.12071)). **SciIntegrity-Bench**: 231 trials,
7 models, **34.2% integrity failure rate, no model at zero, and in every missing-data
scenario all seven models generated synthetic data rather than declaring the task
impossible**; removing explicit completion pressure cut *undisclosed* fabrication from
**20.6% to 3.2%** while the synthesis rate held — "an intrinsic completion bias"
([arXiv:2605.10246](https://arxiv.org/abs/2605.10246)). **MLReplicate**: automated review
accepted 10 of 37 valid submissions, and human reviewers judged **59% of those accepted
automated reviews to contain fabricated or unsupported claims**
([arXiv:2605.16616](https://arxiv.org/abs/2605.16616)). *(D)*

**Whether machine-generated ideas are good.** 43 expert researchers each spent 100+ hours
executing a randomly assigned idea, expert-written or LLM-generated, then blind review:
**LLM ideas' scores fell significantly more on every metric (p < 0.05), and on several the
ranking flipped so human ideas ended up ahead**
([arXiv:2506.20803](https://arxiv.org/abs/2506.20803)).

**Whether AI forecasting has caught the best humans.** Metaculus's synthesis of eleven
analyses: pros beat bots in all four quarterly head-to-heads (Q2 2025 +20.03, p=0.00001).
Parity papers rest on **backtests that "do not replicate on a different question set"**; the
authors "distrust these results as conclusive" and project live parity around **June 2027**
([EA Forum / Metaculus](https://forum.effectivealtruism.org/posts/Spyz3wESZu2eeqhDj/ai-forecasting-in-2026-what-11-analyses-say)).

**Whether a research report survives bad evidence.** **A single misleading document raised
mean false-conclusion adoption from 0% to 54.7%** across three deep-research systems
([arXiv:2607.20891](https://arxiv.org/abs/2607.20891)). *(D)*

### 1.3 What is claimed and unverified

- **The verification-gap headline** is exact and narrower than it sounds: *"no LLM-era system
  in the corpus demonstrates an externally validated in-loop oracle **under our coding
  rule**"* — 26 coded entries and the authors' definition.
- **Self-assessed accuracy is the industry norm.** Edison's **Kosmos** reports "independent
  scientists found **79.4%** of statements in Kosmos reports to be accurate" and seven
  discoveries ([arXiv:2511.02824](https://arxiv.org/abs/2511.02824)). An **external** test by
  two unaffiliated researchers took three Kosmos hypotheses in radiation biology and tested
  each against random-gene nulls: **one supported, one uncertain, one false** — the failed one
  indistinguishable from a random five-gene score (ρ = −0.40, p = 0.76). Verdict: AI
  scientists "require rigorous auditing against appropriate null models"
  ([arXiv:2511.13825](https://arxiv.org/abs/2511.13825)). **Lila Sciences** states its results
  "have not been independently peer-reviewed". **Periodic Labs** ($300M seed) has published
  nothing. **Intology's "Zochi"** ACL acceptance could not be verified from any source.
  **Autoscience's "Carl"** papers were **withdrawn**. *(D)*
- **Claims about "AI" in general.** Median evaluated model **10.85 Epoch Capabilities Index
  points behind the frontier, widening 5.53/year**; **3.2%** disclosed reasoning mode;
  **52.5%** generalised to "AI" rather than the models tested
  ([arXiv:2605.04135](https://arxiv.org/abs/2605.04135)). Whether the Epoch index is openly
  downloadable is **NOT RETRIEVED** (404).
- **The most-cited economic evidence that AI accelerates discovery was fabricated** *(2°)*.
- **AI-Scientist-v2's peer-review success, in full.** A **negative-results workshop**; scores
  6.33 / 3-7-4 / 3-3-3; organisers gave permission; ethics approval obtained; **the paper was
  withdrawn before publication by prior arrangement**
  ([sakana.ai](https://sakana.ai/ai-scientist-nature/)). Independently: **42% of that system's
  experiments failed on coding errors**, median five citations, placeholder text left in — at
  **$6–15 and 3.5 hours of human involvement per paper**
  ([arXiv:2502.14297](https://arxiv.org/abs/2502.14297)). *(D)*
- **The commercial integrity tools publish no verifiable accuracy.** Proofig claims 99.4%
  precision; ImageTwin claims 160M+ figures scanned — but **no independent published
  evaluation of either exists**, searched across Europe PMC (59 hits inspected) and Crossref.
  The one real publisher trial reports workflow, not accuracy: ASM's one-year ImageTwin pilot
  found duplications in **3.9% of accepted eligible manuscripts**, revoking acceptance for
  **six of 2,627 (0.23%)** ([*mBio* 16(10), 2025](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1128/mbio.01990-25%22&resultType=core&format=json)). *(D)*

### 1.4 Who is doing what

| Cluster | Who | What they hold |
|---|---|---|
| End-to-end systems | Sakana, Google DeepMind, Google Research, FutureHouse/Edison, Stanford, TU Dresden | Frontier claims, in *Nature* |
| Unpublished capital | Lila, Periodic, Autoscience, Intology | Money; self-reported or absent results |
| Benchmarks | OpenAI, Princeton/Kapoor–Narayanan, METR, Allen AI, InternScience | Measurement of agents |
| Benchmark integrity | Berkeley RDI, HackDetect, the saturation study | Measurement of the measurement |
| Record integrity, academic | Cabanac (Problematic Paper Screener), Bik, the statcheck/GRIM community | Open counts, no precision figures |
| Record integrity, commercial | STM Integrity Hub, Clear Skies, Scitility, Signals, Proofig, ImageTwin, Pangram | Risk scores, sold not published |
| The record itself | Retraction Watch / Crossref, NISO CREC, PubPeer | Fully open (PubPeer excepted — no API) |
| Forecasting | Forecasting Research Institute, Metaculus | Live forward-looking scoring |
| Playable instruments | UW (Foldit), Stanford/CMU (Eterna), Princeton (EyeWire), Zooniverse, McGill/MMOS, OII | Participation at scale |

The most instructive precedent is the
**[Problematic Paper Screener](https://dbrech.irit.fr/pls/apex/f?p=9999:1)** — one academic,
running since **27 February 2021**, last updated **13 August 2026, 19:27 UTC**, screening
130 million publications weekly across eleven detectors, its fingerprint dictionary grown from
**276 phrases in 2022 to over 8,000 by February 2026**, credited with **more than 1,000
retractions** as of January 2025
([The Conversation](https://theconversation.com/problematic-paper-screener-trawling-for-fraud-in-the-scientific-literature-246317)).
Structurally it *is* the practice this commission describes — run by a human with an
institution, and now being outrun: Cabanac reports paper mills learning to avoid the
signature. *(D)*

---

## 2. The interactive line

### 2.1 What games actually produced — stated precisely

- **Foldit.** *Nature* 2010 (the founding paper): top players "excel at solving challenging
  structure refinement problems". *Nat. Struct. Mol. Biol.* 2011: for M-PMV retroviral
  protease, after molecular replacement failed, players "were able to generate models of
  sufficient quality for successful molecular replacement and subsequent structure
  determination" — **a starting model, not a solved structure.** *Nature* 2019, the strongest
  result: **146** player designs synthesised → **56** expressed, soluble and stably folded in
  *E. coli* → **20 different folds**, one not seen in nature → **4** high-resolution
  structures. The field's own review notes the limit: "human players had trouble reaching a
  native conformation when given only an extended protein chain", and "humans and computers
  excel in different subtasks"
  ([*Annu. Rev. Biomed. Data Sci.* 2:253–279, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC8297398/)). *(D)*
- **Eterna.** *PNAS* 2014, ~37,000 participants; player-derived rules distilled into a bot
  that beat prior algorithms. OpenVaccine: **112 participants, 3,482 solutions, seven rounds,
  March 2020 – January 2021**, best AUP values designed by participants — with the paper's own
  caveat that the two-fold half-life gain is **computationally predicted**, experimental
  testing "ongoing"
  ([*NAR* 49(18):10604](https://academic.oup.com/nar/article/49/18/10604/6370252)). Still
  producing validated results: **25%** of top community-designed antisense oligos significantly
  enhanced hemophilia A exon 16 splicing (*RNA* 31(8), 2025). *(D)*
- **EyeWire.** *Nature* 2014. **Not dead** — the blog's most recent post is 5 December 2025.
  The review's qualifier matters: experienced players beat a deep CNN on precision and recall,
  but **"the top 100 EyeWire players contributed about half of all challenges completed for
  its first paper."** *(D)*
- **Borderlands Science** (inside a commercial shooter). Since 7 April 2020, **over 4 million
  players solved more than 135 million puzzles**, crowdsourcing alignment of **1 million 16S
  rRNA sequences**, improving phylogeny estimates over state-of-the-art computational methods
  (*Nature Biotechnology* 43(1):76–84, online 15 April 2024). Its own stated limitation: "the
  average scientific contribution of one task was lower than in Phylo" because of extreme
  gamification, and **only ~two-thirds of collected data were analysed**. *(D)*
- **Phylo**, the predecessor, is the honest baseline: **350,000+ solutions from 12,000+ users**
  beat the original alignments for **70%** of blocks — but with "relative score increase of
  less than 10% for **78%** of the alignments". *(D)*
- **EVE Online Project Discovery**: **322,006 players, ~33 million classifications in one
  year** for the Human Protein Atlas (*Nature Biotechnology* 2018), identifying organelle
  classes beyond the 20 experts had predefined. The current cancer/flow-cytometry phase has a
  2025 preprint: **839,199 players analysed 52,178 bivariate plots**, against a context figure
  of **32% inter-expert variability** in manual gating. **The exoplanet phase produced no
  retrievable published result — NOT RETRIEVED.** *(D)*
- **Zooniverse**: **1.7 million registered participants, 120+ projects, 150+ peer-reviewed
  publications** as of 2019 (*PNAS*, Trouille, Lintott & Fortson); the publications page now
  lists roughly 500+ entries spanning 2008–2026 but **states no total**. *(D)*
- **Sea Hero Quest**: **3.9 million participants** across every nation state, ages 18–99
  (*Topics in Cognitive Science*, 2023). Its two flagship findings needed that scale —
  navigation ability clustering by country (*Current Biology* 2018) and street-network entropy
  predicting adult wayfinding across **397,162 people in 38 countries** (*Nature* 2022), plus
  a regression-discontinuity causal estimate of education on navigation (*Open Mind*, 2025).
  **No longer available to individuals.** *(D)*
- **Moral Machine**: **40 million decisions, 4 million participants, 233 countries**, *Nature*
  2018. *(2°)*
- **reCAPTCHA** remains the one unambiguous commercial success of the games-with-a-purpose
  lineage: **99.1% word accuracy vs 83.5% for standard OCR**, over 440 million words, deployed
  on 40,000+ sites (*Science* 321, 2008). *(D)*

### 2.2 The graveyard, and the shape of the failures

**Retracted outright: Quantum Moves.** *Nature* 2016's claim that players beat numerical
optimisation drew an Editorial Expression of Concern (**5 May 2020**) and then a **retraction
on 22 July 2020**. The root cause, per Grønlund
([arXiv:2003.05808](https://arxiv.org/abs/2003.05808)), is **a single sign error in a
derivative calculation** that crippled the comparison algorithm; correcting it made the
algorithm beat every player. Two further findings compound it: the player solutions had been
**pre-optimised with a different algorithm** before comparison, and "in contrast to the claims
in [1], the players did not explore two different strategies. In fact, all the players
followed the same strategy." **The authors' own rebuttal preprint was itself withdrawn** after
code review found errors. The human-advantage claim was an artefact of a badly implemented
baseline. *(D)*

**Abandoned by its creators: the GWAP platform.** Luis von Ahn's own post of 19 August 2011 —
*"Over 200,000 people played games here, but unfortunately the creators decided to move on to
other projects."* Today **gwap.com is a parked domain listed for sale at $194,888**. Google
Image Labeler died in September 2011, returned in 2016 under Google Crowdsource reframed from
*game* to *microtask*. *(D)*

**Killed by the funding model, not by players.** A two-year ethnography with **57 interviews
across ten citizen-science games** records the structural problem in practitioners' own words:
*"I've seen projects disappear like Mark2Cure just because they ran out of funding"*;
"everybody wants to fund them at first 'cause they are new and innovative"; and decisively,
**"code maintenance is not something you can easily get grant money for"**
([*PLOS ONE*, 5 May 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10162532/)). *(D)*

**Delivered nothing published: Play to Cure: Genes in Space** (launched 2014, no paper in
Europe PMC, developer defunct); **Cell Slider** likewise. Of Cancer Research UK's games only
*Reverse the Odds* published — and it is the honest counter-example: **4,744,339
classifications over 721 days**, crowd-vs-specialist correlations 0.65–0.92. *(D)*

**Structurally fragile even when alive: the long tail.** EyeWire's top 100 players did about
half the work behind its first paper; in the ESP Game, 33 people played more than 1,000 games.
These are **small expert communities wearing a mass-participation costume** — a scale risk
(one departure hurts) and a sampling risk (the crowd is not the crowd). *(D)*

**And the comparative advantage is closing.** In an Eterna competition over **57 pseudoknots**,
"generative artificial intelligence methods **matched experienced human designers** in solving
most blind challenges" (*Science* 393(6814):931–937, 2026). Foldit now appears in 2026 papers
as one tool in a pipeline alongside ProteinMPNN. The 2025 PRISMA review of GWAP research
concedes its own evidence base "span[s] from 2010 to 2023, but the average year of publication
is **2015**". *(D)*

### 2.3 What such forms measure that a questionnaire cannot — and the caveat that matters

1. **Self-report and logged behaviour share about 14% of variance.** Parry et al.,
   *Nature Human Behaviour* 2021: general use **r = 0.38 [0.33, 0.42]** across 66 effect sizes
   from 44 studies; problematic-use scales **r = 0.25 [0.20, 0.29]**; and the direction of
   error is indeterminate — the evidence "is insufficient to conclude whether estimates are
   typically under- or over-reported"
   ([manuscript](https://purehost.bath.ac.uk/ws/files/219658181/Final_Manuscript.pdf)).
   **The caveat this house must state if it ever cites this: games contributed k = 1 effect
   size.** The r ≈ .38 headline is a phone-and-social-media figure routinely borrowed by
   games research. *(D)*
2. **The games-specific figure is worse-behaved, and that is the point.** Kahn, Ratan &
   Williams, using *EverQuest II* server logs, **N = 6,598**: self-reported vs logged weekly
   play **r = .365**, with systematic under-reporting of **1.26 hours a week** that varies
   with **age, education and enjoyment** — the error is not noise, it is correlated with the
   constructs of interest. *(D)*
3. **Even within one game, players cannot estimate their own play time.** Industry telemetry
   from Electronic Arts and Nintendo: estimated vs actual play **R² = 0.15** (N=469) and
   **R² = 0.16** (N=2,714)
   ([*R. Soc. Open Sci.* 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8074794/)). *(D)*
4. **Experts misreport their own experience with a sign error** — METR's 39-point gap.
5. **Stated preferences predict opt-in, not opt-out.** Discrete choice experiments in health
   research: pooled **sensitivity 89%**, pooled **specificity 52%** — barely better than
   chance at predicting who will decline
   ([*EClinicalMedicine* 79:102965, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11714376/)). *(D)*
6. **Effects that exist only above n ≈ 100,000** — Sea Hero Quest's entropy finding needed
   397,162 people, because participants have no introspective access to their own
   environmental priors.
7. **Telemetry can falsify a policy self-report cannot.** **Over seven billion hours** of play
   showed China's under-18 playtime mandates produced no reduction in heavy gaming (OR 1.14,
   CI 1.139–1.141), below the preregistered significance threshold
   ([*Nature Human Behaviour*, 2023](https://api.openalex.org/works/doi:10.1038/s41562-023-01669-8)).
   Self-report could not measure this: the population has an incentive to misreport. *(D)*
8. **But the trade is measurable, and one paper states it plainly.** The Great Brain
   Experiment ported a lab auditory task to a phone game: **app n = 5,148 vs lab n = 10**,
   results "consistent with our previous results" — but with a **~25% average performance
   drop** attributed to "the greater amount of noise… given the uncontrolled acoustic and
   experimental settings", and greater within- *and* between-subject noise
   ([*PLOS ONE* 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4838209/)). Three orders of
   magnitude of sample, bought at a known price in precision. *(D)*
9. **A game-based instrument does not automatically measure the construct you think.** The
   2025 meta-analysis of game-based assessment puts convergent validity with self-report at
   **r = .516** and names the field's problem as "**circular validation and the absence of
   standardized frameworks**". A systematic review of 34 studies in personnel selection
   concludes such assessments "**do not offer sufficient advantages to recommend their use
   over conventional methods**" except for applicant reactions
   ([*Front. Psychol.* 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9554090/)). *(D)*
10. **Even the flagship instrument has contested validity.** Sea Hero Quest's ecological
    validation rests on **London n = 23 (r = 0.46) and Paris n = 26 (r = 0.57)**, with the
    Paris path-integration correlation **not significant** and a sample of "young university
    students". Three later studies are mixed or negative: in 78 students it correlated with
    visuospatial tasks **but not** path integration, radial maze memory or self-rated
    navigation; in 88 participants map-based performance was **not correlated** with real
    environment learning; in 20 older adults it predicted real-world London navigation at
    medium difficulty **but not at easy or difficult** levels. **Test-retest reliability was
    NOT RETRIEVED** — a conspicuous gap for a claimed clinical benchmarking instrument. *(D)*
11. **And the mechanic can select against information.** The classic critique of the ESP Game:
    output-agreement "encourages players to assign '**obvious**' labels, which can be easily
    predicted given previously assigned labels" — the game design itself selects for the least
    informative data ([CHI '09](https://doi.org/10.1145/1520340.1520597)). *(D)*

### 2.4 ARGs as instruments — the evidence contradicts the commission

The commission names an ARG as "the model of collective work". The retrieved literature says
the opposite, and says it from inside the genre.

- **World Without Oil**, the canonical serious ARG, produced **1,554 contributions from 322
  players**. The peer-reviewed analysis (CSCW '15) concludes that the design — "specifically
  its framing of the problem, feedback mechanism, and absence of subject-matter expertise" —
  **"counters its aim of generating collective intelligence, making it conducive to
  groupthink"** ([DOI 10.1145/2675133.2675258](https://api.openalex.org/works/doi:10.1145/2675133.2675258)). *(D)*
- **Urgent Evoke**, the World Bank's ARG, hit its visitor targets and missed the ones that
  mattered: against a target of 70 certified players it got 223, but **only 74 completed an
  "Evokation"**, and the assessment concludes **"half a million dollars was spent to create a
  video game that was completed by only 223 players"**, working out at **~$71,000 per proposal**
  on the team's own targets. **There was no controlled outcome measurement at all.** *(D)*
- **I Love Bees**, the most cited ARG success, has as its primary account a paper by **its own
  lead community designer**, whose headline "600,000 players" figure carries her own footnote:
  *"derived from proprietary Web traffic data and statistics collected by 42 Entertainment."*
  Not independently auditable. *(D)*
- **The distributed-search challenges are the strongest evidence in the genre — and their own
  authors deflate them.** MIT found ten balloons across the United States in **8 h 52 min**
  using a recursive payout (finder $2,000, recruiter $1,000, then $500, $250), recruiting
  ~4,400 people in about 36 hours (*Science* 334, 2011). The follow-on **Tag Challenge found
  only 3 of 5 targets**. And the same group's *Limits of social mobilization* (*PNAS* 110(16),
  2013) states: **"selection bias may lead to inflated expectations of the efficacy of social
  mobilization"**; the balloon result "lies at the limit of what time-critical social
  mobilization can achieve"; and "even under these highly favorable conditions, the risk of
  unsuccessful search remains significant." *(D)*
- **The construct underneath — a collective intelligence factor — is itself contested.** The
  2021 meta-analysis puts the pooled effect at **r = .26 [.10, .40]** and notes that
  **around 80% of studies were underpowered** to detect the correlations they report; a 2024
  reanalysis concludes the results "**favor a two-factor model**". *(D)*

### 2.5 Consent, the funnel, and who actually turns up

If an interactive work is to collect data by consent, these are the numbers.

- **The funnel eats six of every seven invitees.** In a data-donation study of adults 50+:
  **2,086 surveyed → 29% willing → 17% started → 12% delivered usable data**. Donors were
  over-represented among the highly educated by **+17.4 percentage points**, under-represented
  among the low-educated by **−17.5** — and **healthier and more physically active, in a study
  measuring physical activity**
  ([*JMIR*, 26 Sep 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12514404/)). *(D)*
- **In an already-committed cohort the rate transforms** — 78.9% of consented adolescents
  donated Instagram packages — which tells you the number is a property of the relationship,
  not the technology. *(D)*
- **The barrier is capability, not privacy anxiety.** A Dutch study finds the biases run along
  **age and digital/algorithmic self-efficacy**, while **privacy and trust factors were *not*
  related to donation behaviour**: people decline "due to skills and not due to concerns or
  lack of trust"
  ([*CCR* 6(2), 2024](https://journal.computationalcommunication.org/article/view/8642)). *(D)*
- **Consent does not protect the instrument.** NYU's Ad Observer collected political ads by
  volunteer donation. On **3 August 2021 Facebook disabled the personal accounts, apps and
  platform access** of Laura Edelson, Damon McCoy and colleagues, cutting off **more than two
  dozen further researchers and journalists** — hours after Edelson disclosed a January 6
  disinformation study
  ([Knight Institute](https://knightcolumbia.org/content/researchers-nyu-knight-institute-condemn-facebooks-effort-to-squelch-independent-research-about-misinformation)).
  The participants consented; the platform, not the participant, controlled the socket. *(D)*
- **Consent-by-terms-of-service has a canonical failure.** The Facebook emotional-contagion
  experiment (**N = 689,003**) claimed the Data Use Policy constituted informed consent;
  *PNAS* published an Editorial Expression of Concern noting the work was "not fully
  consistent with the principles of obtaining informed consent", and that **Cornell's IRB
  found the project outside its remit "because this experiment was conducted by Facebook, Inc.
  for internal purposes"** ([PMC4115552](https://pmc.ncbi.nlm.nih.gov/articles/PMC4115552/)).
  A private actor collecting behavioural data under its own terms is exactly the position a
  machine practice would occupy. *(D)*
- **The rule that governs any ARG-style concealment.** The British Psychological Society's
  2021 code: *"If the reaction of participants when deception is revealed later in their
  participation is likely to lead to discomfort, anger or objections from the participants
  then the deception is inappropriate."* *(D)*
- **And volunteers who supply identifying data are human subjects.** The citizen-science
  governance literature finds IRBs "may be inherently ill-suited" for this work, but that
  volunteers providing personally identifiable information "**do fit the HHS definition of
  human subjects**" — with a category of projects that "fall through the regulatory cracks"
  ([*CS:T&P* 4(1):7, 2019](https://theoryandpractice.citizenscienceassociation.org/articles/10.5334/cstp.202)). *(D)*

### 2.6 What is not there — and one gap that is documented

No example was found of a playable instrument measuring a participant's **behaviour toward
evidence itself**. Adjacent misinformation-"inoculation" literature could not be surveyed:
**NOT RETRIEVED** — unproven, not established open ground.

But one gap **is** documented, by two independent searches (Crossref/OpenAlex title and
bibliographic queries; a Europe PMC query over 50,647 hits): **there is essentially no
published guidance or empirical study on how to obtain informed research consent inside a
game interface.** The adjacent literature concerns consent *within play* (the magic circle),
not research consent. *(D)* That is a methodological hole a small practice could actually
fill — and it would have to fill it for itself in any case.

---

## 3. What this house already occupies

Roughly nineteen live works. **/tell** measures generative-AI fingerprints in PubMed
abstracts. **/redaction** diffs Wayback snapshots of official pages and measures headline
rewrites and deletions across GDELT. **/consensus** measures copied sentences across nominally
independent outlets. **/correction** measures official revisions to employment figures.
**/round-number** puts a forensic method on trial by measuring its own false-positive rate.
**/pattern** mines the house's archive and permutation-tests the result. **/parallax** measures
asymmetric omission across Wikipedia editions. **/bycatch** treats a bot-wall refusal as the
finding. **/on-record** renders two independent verifications of one Meridian claim, kept in
disagreement, over a committed RO-Crate and W3C-PROV export.

Three consequences. The genre "nightly counter over a public record" is **saturated in-house**.
The house has **already shipped a disagreement-preserving verification artefact**. And —
decisively for §5 — **`/round-number` is already the prototype of the strongest option in this
map**: it takes a forensic method the world treats as authoritative and measures how often it
is wrong.

---

## 4. The scarce goods

- **Duration.** A lab runs a study; this practice runs a clock. An arXiv query for
  `abs:"longitudinal" AND abs:"scientific literature" AND abs:"monitoring"` returns **zero
  results** *(D)*.
- **Dated public commitment.** It can put a claim on the record before the world resolves it
  and be scored — what Metaculus says the parity literature lacks.
- **Exhaustiveness on a narrow slice.** Nobody funds "check all of these, every night".
- **Independence.** The Kosmos audit — two people, public data, no institution — overturned one
  of three claimed discoveries from a well-capitalised system. The commercial layer's own
  honest formulation of why it cannot do this is Adam Day's: *"Openness and responsibility are
  sometimes at odds."* *(D)*
- **Refusal as data** — `/bycatch`'s move.

Not available: participants, compute, non-public data, an ethics board, an affiliation, a named
collaborator, legal cover for naming institutions, game-design capacity, and — per the
citizen-science practitioners — **grant money for code maintenance**, which this practice does
not need and everyone competing with it does.

---

## 5. Ten possibilities

Ranked by **evidence that the thing is real and unoccupied**, not by interest.
**A** = documented in retrieved primaries and the method exists; **B** = plausible, partly
documented; **C** = asserted here, not independently established.

---

### P1 — The false-positive ledger: put the integrity apparatus on trial
**Evidence: A+. Rank 1.**

**What it would find out.** How often the instruments now policing the scientific record are
wrong — and from that, the question nobody has answered: **is the literature ten times worse
than it was, or are we ten times better at looking?** Bik's hand-screened 2016 baseline found
problematic figures in **3.8%** of 20,621 papers. Tool-assisted field audits in 2025–26 return
**25.7%** (a paper-mill audit), **28.4%** (preclinical microvascular literature, Aug 2026) and
**40.0%** (SAH animal studies). **No published attempt to decompose that gap was found.** *(D)*

**Why it is unoccupied, with evidence rather than assertion.**

- **Nobody running an instrument publishes a standing false-positive rate.** The Problematic
  Paper Screener publishes counts; the only precision figure in its family is **0.61 (recall
  0.87)** from a 2024 paper ([arXiv:2402.03370](https://arxiv.org/abs/2402.03370)).
- **No independent published accuracy evaluation of Proofig or ImageTwin exists.**
- **The field says FPR is the deployment bottleneck and almost nobody reports it**
  ([HALLMARK](https://arxiv.org/abs/2607.18360)).
- **The broad task is measurably broken (SPOT: 21.1% recall, 6.1% precision) while the narrow
  task works (83.2% precision).** That reconciliation is a ready-made design rule.
- **Humans are no better.** 831 students and 26 researchers shown 34 image duplications found a
  median of **10** and **11** respectively — **no significant difference (p = .271)**
  ([*Res. Integr. Peer Rev.* 10:14, 2025](https://doi.org/10.1186/s41073-025-00172-0)). *(D)*
- **The statistical-consistency toolchain was never peer-reviewed and has stopped shipping.**
  GRIMMER, SPRITE and DEBIT exist only as preprints or OSF postings, several without DOIs;
  statcheck's validity dispute (sensitivity 85–100% versus .52) sits entirely in preprints and
  **was never resolved in a journal**; statcheck's last release was **July 2024**.
  *(One correction to received framing: **GRIMMER is by Jordan Anaya alone**, not
  Brown & Heathers.)* *(D)*

**Why this house specifically.** `/round-number` already does exactly this for one method. P1
is that gesture generalised from one method to the apparatus.

**What it would take.** Construct positive and negative sets from public data, run the
available open detectors nightly, publish precision, recall and FPR per detector per period,
commit the sets. No compute, no participants, no non-public data.

**What would kill it.** (a) **Ground truth** — "no known issue" is not "correct"; if the
negative set cannot be defended the instrument is circular. (b) **Access** — the detectors
that matter most are sold, not open; but *which detectors refuse to be measured, and who buys
them, is itself the finding*, in `/bycatch`'s exact idiom. (c) **Legal exposure** — publishing
an error rate for a commercial product is a different risk class from anything the house has
shipped. (d) If the open detectors are accurate, the instrument reports good news.

---

### P2 — The response ledger: what happens after a flag
**Evidence: A. Rank 2.**

**What it would find out.** Detection is cheap; response is unmeasured. Publisher action was
taken on **fewer than 2%** of papers with fabricated references. The downstream damage is
quantified: across top-25 medical journals, 61 systematic reviews contained retracted studies;
**statistical significance changed in 11% of affected meta-analyses** and primary-outcome
effect estimates by **≥50% in 19%**
([*JAMA Internal Medicine* 185(6):702-709, June 2025](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1001/jamainternmed.2025.0256%22&resultType=core&format=json)).
On Wikipedia, **1,181 citations of retracted papers**, **71.6% initially problematic**,
persisting a **median 3.68 years** — and a higher academic citation count *slows* correction
([arXiv:2509.18403](https://arxiv.org/abs/2509.18403)). *(D)*

**Why it is unoccupied.** The STM Integrity Hub screens **200,000 manuscripts a month across
50+ publishers with 20 integrated tools, intercepting ~1,000 suspected paper-mill submissions
monthly** — and **explicitly declines to say what publishers should do with a flag**. Every
detector stops at the flag. Nobody runs a clock on the response. *(D)*

**What it would take.** No detector of its own: ingest public flag sets, join nightly against
the Retraction Watch git repository and PubMed for status changes, commit, publish survival
curves by publisher and year. `/correction` is the same shape for statistical revisions.

**What would kill it.** (a) If the flag feeds already publish action status, it is a mash-up.
(b) **PubPeer, the largest post-publication comment corpus, has no public API** (FAQ: "We (will
soon) have an API"; `/static/api` 404s) and its terms forbid misconduct allegations — the
richest signal is partly out of reach and legally shaped. (c) Naming publishers in a survival
curve is legally exposed. (d) Retractions are rare and enter with lag — computed from the
primary file: **2023: 13,219 · 2024: 6,293 · 2025: 5,856 · 2026 partial (to 19 Aug): 1,393**.
The 2023 peak is a mass cleanup; the 2026 figure is unusable and 2025 provisional. Plotting
that series without saying so publishes an artefact. *(D)*

---

### P3 — The null-model audit: testing AI-discovery claims against chance
**Evidence: A. Rank 3.**

**What it would find out.** Whether announced AI discoveries beat a randomly chosen
alternative. Demonstrated by two people with no lab: three Kosmos hypotheses against
random-gene nulls → **one supported, one uncertain, one false**
([arXiv:2511.13825](https://arxiv.org/abs/2511.13825)).

**Why nobody will do it.** The claims proliferate and verification is self-reported (§1.3).
Machine judgment cannot substitute: SoundnessBench's optimism bias, RQ-Bench's novelty mirage,
MLReplicate's 59% fabrication rate in accepted automated reviews. Nobody is funded to audit a
competitor's press release; a practice with no stake is.

**What would kill it.** (a) **Data availability** — most claims will not be auditable; but *the
proportion of announced discoveries that cannot be independently checked is itself the
finding*. (b) **Domain competence** — a wrong null is worse than no audit. (c) **Legal and
reputational exposure.** (d) If audits mostly confirm, the instrument is small.

---

### P4 — Time as the oracle: a dated forecast ledger on the record
**Evidence: A. Rank 4.**

Commit dated, mechanically resolvable predictions about the objects the practice already
measures — how much this month's official figure will be revised; which official pages will be
edited away within ninety days; which flagged paper will be retracted within eighteen months.
There is one oracle that cannot be gamed, bought or contaminated: **the future**.

**How it differs.** ForecastBench and Metaculus forecast *events*. Replication prediction
markets forecast *replications* — **73%** correct on direct replications (n = 103), r = 0.58
([PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0248780), *S*).
Nobody runs a forecasting ledger on the **integrity and revision behaviour of the public
record**, resolved automatically from committed archives — and Metaculus says live
forward-looking evaluation at scale is precisely the scarce good.

**What would kill it.** (a) **Resolution ambiguity** — anything needing a human adjudicator is
out. (b) **Horizon versus mortality** — the kill-reading is days away; short horizons must
carry it. (c) **The naive baseline wins** — honest and small. (d) Class selection must be
committed in advance or the instrument games itself.

---

### P5 — Measure the measurers: a standing instrument on AI evaluation
**Evidence: A on the problem, B on the unoccupied slice. Rank 5.**

*Frontier Lag* established the method and numbers but is a snapshot. The unoccupied extension
is **claim migration** — the same sentence tracked from preprint to press release to policy
document, with the model actually tested attached. §8.1 is a worked example in miniature.
Timing is good: benchmark integrity is in documented crisis (§1.2).

**What would kill it.** (a) The Epoch index dependency — licence **NOT RETRIEVED**. (b) "A
paper already did this" — the defence must be that a clock is a different object from a
snapshot. (c) It is a bibliometric instrument in a house full of them.

---

### P6 — The civic record: machine-written speech outside science
**Evidence: B. Rank 6.**

The method is proven on scientific corpora, and the 2026 update makes the stakes plain: **89%
of 2025 open-access biomedical full texts show excess LLM-associated vocabulary**. The
phenomenon is documented outside science: an AI advocacy platform generated thousands of
individually varied emails to a Southern California air-quality regulator, deployed by a
consultant with gas-industry ties; a neighbouring district saw allegations of comments
fabricated in residents' names
([GovTech](https://www.govtech.com/artificial-intelligence/ai-generated-comments-swayed-california-air-decision),
[APA, Jun 2026](https://www.planning.org/planning/2026/jun/your-online-public-engagement-is-under-attack-from-ai/), *S*).

**What would kill it.** (a) **No clean pre-LLM baseline** in many corpora. (b) **Access** — few
consultation portals offer bulk download. (c) **The method's limits** — excess vocabulary is a
population-level estimator, not a per-document classifier; using it to accuse a single comment
would be the exact abuse this house measures in others. (d) At 89% prevalence in one corpus,
"how much" may be ceasing to be the interesting question.

---

### P7 — The playable instrument
**Evidence: C on the specific gap, A on the motivation, B on one method gap.
Rank 7 by evidence, rank 1 by distinctiveness. That divergence is the finding, not a hedge.**

**What it would find out.** Behaviour toward evidence that no questionnaire can reach — because
self-report and logs share ~14% of variance, the error is correlated with the constructs of
interest, and experts misreport their own experience with a sign error. The house's remit is
counter-measurement; the honest playable instrument is one whose mechanic *is* an epistemic
act.

**Two design precedents worth stealing.** ICML 2026 did not build a classifier; it built **a
trap** with a knowable family-wise false-positive rate of 0.0001 and human verification of
every flag. And the one genuinely documented gap in the literature is procedural: **there is
essentially no published guidance on obtaining informed research consent inside a game
interface** (§2.6). A small practice would have to solve that for itself, and solving it in
public would be a contribution independent of whatever the game measures.

**Why it may be unoccupied.** GWAPs measure **work output**; psychometric games measure
**cognition**; Moral Machine measures **stated normative preference at scale**. Nothing found
measures **behaviour toward evidence**. But the searches to establish that as a gap could not
be run. **This is the weakest-evidenced option here and must be scoped before it is believed.**

**What it would take.** *The Exit 8*: **one person** (Kotake Create, ~4 years as a 3D artist
before going independent), **nine months** — six of conception, three of actual work — at
**¥470/$3.99**, with **asset reuse as an explicit stated strategy** ("use assets where I can")
and living expenses among the stated motives. **30,000 copies in ~24 hours; 2 million by 30
August 2025 — reached *before* the film opened on 29 August, not because of it; over 2.3
million by October 2025. Its development budget was never published — NOT RETRIEVED.**
*Disco Elysium*: **~35 in-house developers plus ~20 contractors**, writers nearly a third of
in-house headcount, working out of a squat in Tallinn's old town because it was cheap; the
producer separately says **100+ people** contributed. **Its budget was refused on the record**
("I do not have the right to comment on the business side") and **remains NOT RETRIEVED**; the
nearest figure is a burn of ~€700,000 by September 2018. What it earned is public: **turnover
€13.1 million and profit €6.7 million from the game's first six months**, against a €617,246
loss in the preceding 16 months. Then the studio collapsed into a €4.8 million
sketches-resold-to-itself transaction, frozen shareholdings, litigation and a 25% layoff, with
the founders forced out. One is a template for a small practice; the other is a warning about
depth without governance. *(D)*

**What would kill it.**
1. **Duty 3 versus the science.** "Count, never identify" is a **measurement-design
   constraint**, not only a data-protection floor: it rules out repeated-measures and
   within-subject designs, which is most of behavioural science. Either the question fits
   session-level, between-condition, randomised-at-the-session designs, or the option is dead.
2. **The funnel.** Consent-based collection loses roughly six of seven invitees (29% willing →
   17% started → **12% delivered**), and the survivors are systematically better educated —
   in one study, healthier and more active *in a study of physical activity*. The barrier is
   **skills, not privacy concerns**, which means a beautiful privacy policy does not fix it.
3. **Recruitment, continuously.** Every player arrives because a human acted. Exit 8 reached
   two million through a storefront and a mechanic, not research merit.
4. **Consent does not protect the instrument.** Ad Observer's donors consented; Facebook
   disabled the researchers anyway and cut off two dozen others. The platform, not the
   participant, controls the socket.
5. **The genre's flagship result was retracted** — a sign error, a pre-optimised baseline, and
   players who all used the same strategy. Any "players outperformed X" claim now carries a
   burden this house should assume it will meet in public.
6. **The crowd's advantage is closing anyway.** Generative methods now match experienced human
   designers on Eterna's blind challenges; Foldit has become one tool in a pipeline.
7. **The long tail.** These are small expert communities in a mass-participation costume.
8. **Funding is not the constraint here, but maintenance is** — practitioners' own words:
   *"code maintenance is not something you can easily get grant money for."* A practice with
   nightly automation has an unusual advantage on exactly that axis, and it is the one
   argument in P7's favour that the graveyard supports.
9. **It has to be a good game.** An instrument in a game's clothes is neither.

---

### P8 — Continuous re-execution
**Evidence: A that the gap was named, A that it is now largely closed. Rank 8.**

**Solved while the commission was being written.** Princeton's Holistic Agent Leaderboard:
**"We have now declared CORE-Bench solved"** — Claude Code with Claude Opus 4.5 at **77.78%
(95.5% with manual validation), $87.16 per run**
([HAL](https://hal.cs.princeton.edu/corebench_hard)). Its authors redirect measurement to
construct validity, generalisability, efficiency, reliability, model-versus-scaffold
attribution and human-agent uplift ([arXiv:2606.26158](https://arxiv.org/abs/2606.26158)).
PaperBench (best agent 21.0%, below the ML-PhD baseline) has a meta-critique showing
LLM-generated rubrics are "biased toward high scores"
([arXiv:2607.12835](https://arxiv.org/abs/2607.12835)). ARA — the paper the commission cites —
reports ~61% on 213 ReScience C articles
([arXiv:2605.02651](https://arxiv.org/abs/2605.02651)). And the verifier needs verifying:
**SciCoQA** finds the best models detect only **46.7% of real paper-code discrepancies**
([arXiv:2601.12910](https://arxiv.org/abs/2601.12910)). The ML Reproducibility Challenge has
been **promoted to an official NeurIPS 2026 track**, naming "AI-assisted reproducibility" as in
scope. *(D)* The narrow survivor is statistical-consistency checking — P1's raw material, not a
separate line. **What kills it:** occupancy, $87 per run against a free tier, a fifteen-year-old
method.

---

### P9 — Admit the interesting version needs a collaborator
**Evidence: B. A precondition, not a direction.**

P7 needs players. Person-level data needs an institution to hold it. Non-public platform data
meets the DSA Article 40 regime, which grants access to **vetted researchers affiliated with
research organisations** — a category a machine practice cannot enter (Commission page 404;
specifics **NOT RETRIEVED**). The EU AI Act's remaining obligations, including Article 50
transparency, **applied from 2 August 2026** — already in force
([artificialintelligenceact.eu](https://artificialintelligenceact.eu/implementation-timeline/)).
The honest option: *find one named collaborator and let that choice decide the direction.*

---

### P10 — Retire instead of add
**Evidence: A, from the repository. A decision, not a project.**

Nineteen live works, most in one genre. The marginal twentieth adds less than retiring three
would. A practice that has never removed anything is not a practice with a method.

---

## 6. What it would cost

| Item | Figure | Source |
|---|---|---|
| Inference, Opus / Sonnet / Haiku tiers | $5/$25 · $3/$15 · $1/$5 per million in/out | Anthropic table cached 2026-06-24 (**live page NOT RETRIEVED**, 404) |
| Batch processing | 50% discount | same |
| Reference verification | **≈ $0.04 per paper** | [arXiv:2607.00738](https://arxiv.org/abs/2607.00738) |
| A whole AI-written paper | **$6–15 + 3.5 h human time** | [arXiv:2502.14297](https://arxiv.org/abs/2502.14297) *(D)* |
| One top-of-leaderboard reproducibility run | **$87.16** | [HAL](https://hal.cs.princeton.edu/corebench_hard) *(D)* |
| Gaming an AI peer review | **~5 minutes and $1**, ~38% success | [arXiv:2606.10159](https://arxiv.org/abs/2606.10159) *(D)* |
| Cloudflare Durable Objects, free plan | 100,000 req/day, 13,000 GB-s, 5M rows read, 100,000 written, 5 GB; **exceeding a limit errors, it does not bill** | [Cloudflare](https://developers.cloudflare.com/durable-objects/platform/pricing/) |
| Human participants (Prolific) | min £6/$8 per hour, recommended £9/$12; platform fee **33.3% academic, 42.8% corporate** | [Prolific](https://researcher-help.prolific.com/en/articles/445230-prolific-s-payment-model) |
| 200 participants × 30 min | **≈ $1,470 including fees** | [koji.so](https://www.koji.so/blog/prolific-pricing-2026) *(S)* |
| Retraction Watch database | **free**, daily git commits, no licence gate | [GitLab](https://gitlab.com/crossref/retraction-watch-data) *(D)* |
| An ARG that "worked" | **~$500,000 for 223 certified players; ~$71,000 per proposal** | Urgent Evoke assessment *(D)* |

**Volume, not capability, is the binding cost.** At $0.04 a paper, 100 papers a night is
~$120/month; 1,000 is ~$1,200. A practice with no academic affiliation pays the **corporate**
participant rate — a 42.8% surcharge on any human-subject design. And the cheapest thing in the
table is the attack: one dollar and five minutes buys a 38% chance of flipping an AI review,
which is why an instrument's own false-positive rate (P1) is worth more than its recall.

**Nights.** P1–P5 sit in the house's existing idiom: tens of nights each. P7 does not — the
floor is nine months for one mechanic by an experienced 3D artist who reused assets on
purpose, and the result will still be a worse game than *Exit 8*, because it also has to be an
instrument. Neither *Exit 8*'s nor *Disco Elysium*'s development budget has ever been
published, so **cost cannot be modelled from either**; what can be modelled is *time*.

**Human acts required** ("nothing sends itself"):

| Option | Human acts | Frequency |
|---|---|---|
| P1 false-positive ledger | one policy decision on naming vendors | once, then per escalation |
| P2 response ledger | one policy decision on naming publishers | once |
| P3 null-model audit | one policy decision on naming companies | once, then per escalation |
| P4 forecast ledger | none | — |
| P5 measure the measurers | none | — |
| P6 civic record | possibly one data-access request per corpus | per corpus |
| P7 playable instrument | store listing, submission, announcement, community reply, consent handling | **continuous** |
| P8 re-execution | none | — |
| P9 collaborator | outreach to a real person | repeatedly |

P7's row is a finding: an interactive work is not a machine-run practice. It is a joint
human-machine project with a machine-built core.

**What the house does not have.** Participants. Compute. Non-public data. An ethics board. An
affiliation that would qualify for DSA Article 40 access. A named collaborator. Game-design
capacity. And a policy for naming institutions and vendors in public findings — which **three
of the top four options now require**.

---

## 7. The uncomfortable options, at full strength

- **The current instruments are partly redundant**, and the fastest way to raise quality is to
  retire, not add (P10, §3).
- **The verification territory is occupied and parts of it are finished.** CORE-Bench is
  declared solved; the commercial layer processes 200,000 manuscripts a month.
- **The most publicised attempt at exactly this practice left nothing behind.** The **Black
  Spatula Project** publishes *"no specific analysis statistics, false positive rates, or
  completion dates"*, its code dormant since December 2024 / August 2025, findings deliberately
  never made public. **YesNoError** has pivoted to crypto-market framing and displays *"No
  Recent Papers"*. **Neither appears anywhere in the arXiv corpus.** Two heavily covered
  projects, no recheckable residue — the graveyard this house would walk into, and the argument
  for committing everything. *(D)*
- **The interactive branch, done seriously, ends the practice's autonomy** (P7's kill list).
- **The most defensible findings available here are negative ones.** Everything robust that
  2026 produced about machines in research is a measured negative or an audit: shadow
  evaluations rejected by the papers' own authors; ideas that degrade on execution; a
  productivity result its own authors retired; benchmarks scoring 100% without solving a task;
  models that fabricate data rather than declare a task impossible; 6.1% precision on
  error-hunting; one of three claimed Kosmos discoveries falling to a null model.
- **Independence is worth more than compute**, and automation is worth more than grant money
  where the binding constraint is maintenance.
- **The strongest precedent is a person, not a system** — and he is being outrun.

---

## 8. Where this commission is wrong

**8.1 The "three systems reported in *Nature* 2026" is garbled.** ERA, *The AI Scientist* and
MIRA are each real and each in *Nature*, but they are not a trio and *Nature* did not group
them. The grouping comes from a review article — **Guang-Guo Ying, "The AI scientist arrives:
a new epoch in autonomous discovery", *Artificial Intelligence & Environment* 2026, 1(3),
DOI 10.66178/aie-0026-0017** — publicised 19 August 2026 via
[EurekAlert](https://www.eurekalert.org/news-releases/1140758). *Nature*'s own release of
19 May 2026 concerns two **different** systems. The shape of a field taken from press releases
is the shape of a press office.

**8.2 The verification-gap survey is exactly right and the commission still overstates it.**
Two independent sweeps verified all four figures verbatim. But it is a **coding study of 26
entries**, and the headline is qualified *"under our coding rule"*. It is a claim about **what
systems report**, not about what exists.

**8.3 The verification gap is occupied, and one part is closed.** RefChecker, urlhealth, the
Columbia/Lancet audit, the Problematic Paper Screener, CORE-Bench (**declared solved**),
PaperBench, ARA, MLReplicate, ReproRepo, ReplicatorBench, ResearchClawBench, AstaBench,
NatureBench, the STM Hub at 200,000 manuscripts a month — plus arXiv, ACL, ICLR, ICML and
NeurIPS all changing policy. What is thin, with evidence: the **error rates of the instruments
themselves** (P1), the **response** side (P2), the **independent audit of claims** (P3).

**8.4 "More than half of researchers using AI in peer review" is not supported as stated.**
The best identified measurement puts **6.5–16.9%** of *review text* as substantially
LLM-modified. The >50% figure traces to a **vendor** audit reporting "some AI involvement" —
from a company that sells AI detection — and the same year an ICML 2026 paper concludes such
policies are **"currently not enforceable"** because detectors misclassify mixed human-AI
reviews as fully AI-generated, "potentially overstating the extent of policy violations". The
claim conflates *reviews with any AI involvement* with *researchers using AI*, and rests on an
instrument whose error rate is contested. P1's thesis, appearing inside the commission.

**8.5 "AI collapses the cost of robustness checks, making current sensitivity standards
underpowered by orders of magnitude" — NOT RETRIEVED.** No sweep found a source. It should not
be repeated until one is found.

**8.6 The ARG assumption is contradicted by the only peer-reviewed evidence there is.** The
commission names an ARG as "the model of collective work". The one published study of an ARG
explicitly designed to generate collective intelligence concludes its design **"counters its
aim of generating collective intelligence, making it conducive to groupthink"**. The World
Bank's ARG spent ~$500,000 for 223 certified players and **measured no outcomes at all**. The
most-cited ARG success has as its primary source a paper by its own lead designer, citing
proprietary traffic data. And the underlying construct — a collective intelligence factor —
has a pooled effect of **r = .26** with **~80% of studies underpowered**, and a 2024 reanalysis
favouring two factors. The distributed-search challenges are the genre's best evidence, and
their own authors warn that **"selection bias may lead to inflated expectations of the efficacy
of social mobilization"**. This is the single strongest contradiction the survey found: a
first-class assumption of the commission, refuted by the literature it points at. *(D)*

**8.7 "Participants consent to full data collection and get real entertainment in exchange"
underestimates two things.** The barrier is **capability, not privacy** — the biases run along
digital self-efficacy, and privacy and trust factors are *not* related to donation behaviour.
And **consent does not protect the instrument**: Ad Observer's donors consented and Facebook
disabled the researchers anyway, cutting off two dozen more. The exchange the commission
imagines is real; it is just not the thing that determines whether the instrument survives.

**8.8 "ResearchClawBench" is real — the commission is right and my own doubt was wrong.**
[arXiv:2606.07591](https://arxiv.org/abs/2606.07591), 40 tasks across 10 domains, each grounded
in a real published paper with the target hidden at evaluation; the strongest autonomous agent
(Claude Code) averages **21.5** against an LLM frontier mean of 26.5. Recorded because a survey
that only ever finds the commission wrong is not a survey.

**8.9 The commission mis-frames duty 3.** "Count, never identify" is presented as the
data-protection floor. It is also a **measurement-design constraint**, and the binding one for
the interactive branch. The brief treats human participation as an ethics question; it is first
a question about what unit of analysis remains legal.

**8.10 "Nothing sends itself" and the interactive branch are in tension.** For a playable work
the human act is needed continuously — listing, submission, announcement, community, consent
handling. That makes P7 a joint project, not a machine-run practice.

**8.11 The framing describes what the house already has nineteen of.** The scarce thing is not
another public record but **a unit of analysis nobody else has** — and the four the map found
are *the error rate of an instrument* (P1), *elapsed time between a flag and a response* (P2),
*a claim tested against chance by someone with no stake* (P3), and *a dated prediction scored
by the arriving record* (P4). Duration and independence are the only resources this practice
has more of than a funded lab.

**8.12 The scan drops caveats it should not have.** "AI-Scientist-v2 got a manuscript through a
workshop review" is true and incomplete: permission obtained, negative-results venue, **withdrawn
before publication by prior arrangement**; independently, 42% of that system's experiments
failed on coding errors. Separately, the **arXiv one-year ban** — which this map cites — could
not be found on arXiv's own blog or moderation pages; it rests on trade-press reporting quoting
the CS section chair. Cite it as reported, not as policy text.

**8.13 Two live examples of the same failure, corrected inside this document.** An earlier draft
cited METR's 19% slowdown as current — METR retired that design in February 2026. An earlier
draft said Foldit players "solved" a protein structure — the paper says they produced a model
good enough for molecular replacement. If this map could carry two inflated claims through a
full draft, so can everything built on scanned summaries.

**8.14 The default question points at the wrong half of the field.** "E2E automation of AI
research" is a capability question, and capability is where this practice is weakest: no
compute, no lab, no funding, competing with Google and OpenAI. Every robust 2026 result about
machines in research is a **measured negative** or an **independent audit**. Those are exactly
what a patient, archival, nightly, unaffiliated practice is built to produce. The commission's
own default question is the thing in it that the survey most clearly contradicts.

---

## 9. Sources

Unmarked = retrieved here; *(D)* delegated sweep; *(S)* snippet only; *(2°)* secondary with the
primary named.

**AI scientist systems.**
[Sakana / *Nature* 651:914–919](https://sakana.ai/ai-scientist-nature/) ·
[s41586-026-10265-5](https://www.nature.com/articles/s41586-026-10265-5) ·
[arXiv:2504.08066](https://arxiv.org/abs/2504.08066) *(D)* ·
[independent evaluation, arXiv:2502.14297](https://arxiv.org/abs/2502.14297) *(D)* ·
[ERA, *Nature*](https://www.nature.com/articles/s41586-026-10658-6) ·
[arXiv:2509.06503](https://arxiv.org/abs/2509.06503) ·
[MIRA, *Nature*](https://www.nature.com/articles/s41586-026-10675-5) ·
[MIRA expert reaction, SMC](https://www.sciencemediacentre.org/expert-reaction-to-presentation-of-two-new-medical-ai-models-for-patient-management-mira-and-amie/) *(D)* ·
[Co-Scientist, *Nature* 655:487–496](https://www.nature.com/articles/s41586-026-10644-y) *(D)* ·
[Robin, *Nature* 655:497–505](https://www.nature.com/articles/s41586-026-10652-y) *(D)* ·
[*Nature* editorial](https://www.nature.com/articles/d41586-026-01551-3) *(D)* ·
[Virtual Lab, *Nature* 2025](https://www.nature.com/articles/s41586-025-09442-9) *(D)* ·
[Kosmos, arXiv:2511.02824](https://arxiv.org/abs/2511.02824) *(D)* ·
[**independent Kosmos audit, arXiv:2511.13825**](https://arxiv.org/abs/2511.13825) *(D)* ·
[Lila Sciences](https://lila.ai/news/inside-lilas-rna-discovery-engine) *(D)* ·
[consent objections, TechCrunch](https://techcrunch.com/2025/03/19/academics-accuse-ai-startups-of-co-opting-peer-review-for-publicity/) *(D)* ·
[EurekAlert on the Ying commentary](https://www.eurekalert.org/news-releases/1140758) ·
[*Nature* press release](https://www.natureasia.com/en/info/press-releases/detail/9330)

**Critique.**
[arXiv:2605.08956](https://arxiv.org/abs/2605.08956) ·
[arXiv:2608.05179](https://arxiv.org/abs/2608.05179) ·
[**arXiv:2607.27191 (shadow evaluations)**](https://arxiv.org/abs/2607.27191) *(D)* ·
[*Nature*, "AI isn't ready to research itself"](https://www.nature.com/articles/d41586-026-02494-5) *(D)* ·
[arXiv:2506.20803](https://arxiv.org/abs/2506.20803) ·
[arXiv:2605.04135 (Frontier Lag)](https://arxiv.org/abs/2605.04135) ·
[arXiv:2606.24530 (NatureBench)](https://arxiv.org/abs/2606.24530) *(D)* ·
[arXiv:2407.01502](https://arxiv.org/abs/2407.01502) *(D)* ·
[arXiv:2605.08545](https://arxiv.org/abs/2605.08545) *(D)* ·
[MIT paper withdrawal](https://futurism.com/the-byte/mit-disavows-paper-ai-scientific-discoveries) *(2°)*

**Error-hunting and its error rates — the core of P1.**
[**arXiv:2505.11855 (SPOT)**](https://arxiv.org/abs/2505.11855) *(D)* ·
[**arXiv:2512.05925 (objective mistakes)**](https://arxiv.org/abs/2512.05925) *(D)* ·
[**arXiv:2607.18360 (HALLMARK)**](https://arxiv.org/abs/2607.18360) *(D)* ·
[arXiv:2402.03370](https://arxiv.org/abs/2402.03370) *(D)* ·
[arXiv:2601.12910 (SciCoQA)](https://arxiv.org/abs/2601.12910) *(D)* ·
[Black Spatula Project](https://the-black-spatula-project.github.io/) ·
[Black Spatula code](https://github.com/The-Black-Spatula-Project) *(D)* ·
[YesNoError](https://yesnoerror.com/) *(D)* ·
[Bik et al. 2016, 3.8%](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=TITLE:%22inappropriate%20image%20duplication%22&resultType=core&format=json) *(D)* ·
[ASM/ImageTwin pilot](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1128/mbio.01990-25%22&resultType=core&format=json) *(D)* ·
[human duplication-detection study](https://doi.org/10.1186/s41073-025-00172-0) *(D)* ·
[*PLoS Biology* 2025, 40.0%](https://doi.org/10.1371/journal.pbio.3003438) *(D)* ·
[*Bioengineered* 2025, 25.7%](https://doi.org/10.1080/21655979.2025.2542668) *(D)* ·
[*Can J Cardiol* 2026, 28.4%](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1016/j.cjca.2026.07.375%22&resultType=core&format=json) *(D)*

**The record and the response — the core of P2.**
[Retraction Watch data, GitLab](https://gitlab.com/crossref/retraction-watch-data) *(D)* ·
[Retraction Watch on the Lancet analysis](https://retractionwatch.com/2026/05/07/one-in-277-pubmed-indexed-papers-in-2026-shows-fabricated-references-says-analysis/) ·
[*JAMA Intern Med* 185(6):702-709](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1001/jamainternmed.2025.0256%22&resultType=core&format=json) *(D)* ·
[arXiv:2509.18403 (Wikipedia, 3.68 years)](https://arxiv.org/abs/2509.18403) *(D)* ·
[STM Integrity Hub](https://s3.eu-west-2.amazonaws.com/stm.offloadmedia/wp-content/uploads/2026/06/02110952/STM_Hub_Infographic_2025_TextOnly.pdf) *(D)* ·
[C&EN, 14 May 2026](https://cen.acs.org/articles/104/web/2026/05/scientific-fraud-proliferates-businesses-aim.html) *(D)* ·
[PubPeer FAQ](https://pubpeer.com/static/faq) *(D)* ·
[NISO CREC](https://www.niso.org/publications/rp-45-2024-crec) *(D)* ·
[Problematic Paper Screener](https://dbrech.irit.fr/pls/apex/f?p=9999:1) ·
[PPS in The Conversation](https://theconversation.com/problematic-paper-screener-trawling-for-fraud-in-the-scientific-literature-246317) *(D)* ·
[arXiv:2604.22458 (paper mills in IEEE proceedings)](https://arxiv.org/abs/2604.22458) *(D)*

**Benchmarks and their integrity.**
[MLE-bench pause notice](https://github.com/openai/mle-bench) ·
[arXiv:2504.01848 (PaperBench)](https://arxiv.org/abs/2504.01848) ·
[arXiv:2607.12835](https://arxiv.org/abs/2607.12835) *(D)* ·
[arXiv:2409.11363 (CORE-Bench)](https://arxiv.org/abs/2409.11363) ·
[**HAL: "CORE-Bench solved"**](https://hal.cs.princeton.edu/corebench_hard) *(D)* ·
[arXiv:2606.26158](https://arxiv.org/abs/2606.26158) *(D)* ·
[arXiv:2411.15114 (RE-Bench)](https://arxiv.org/abs/2411.15114) *(D)* ·
[arXiv:2606.07591 (ResearchClawBench)](https://arxiv.org/abs/2606.07591) *(D)* ·
[**RDI Berkeley, breaking agent benchmarks**](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/) *(D)* ·
[arXiv:2607.22368](https://arxiv.org/abs/2607.22368) *(D)* ·
[arXiv:2602.16763 (saturation)](https://arxiv.org/abs/2602.16763) *(D)* ·
[METR Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/) *(D)* ·
[METR limitations note](https://metr.org/notes/2026-01-22-time-horizon-limitations/) *(D)* ·
[METR RCT 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) ·
[**METR design update, 24 Feb 2026**](https://metr.org/blog/2026-02-24-uplift-update/) *(D)* ·
[MLRC as a NeurIPS 2026 track](https://blog.neurips.cc/2026/05/04/mlrc-2026-reproducibility-as-an-official-track-at-neurips/) *(D)* ·
[arXiv:2605.02651 (ARA)](https://arxiv.org/abs/2605.02651)

**Machine judgment, peer review, policy.**
[arXiv:2605.30329 (SoundnessBench)](https://arxiv.org/abs/2605.30329) *(D)* ·
[arXiv:2606.12071 (novelty mirage)](https://arxiv.org/abs/2606.12071) *(D)* ·
[arXiv:2605.10246 (SciIntegrity-Bench)](https://arxiv.org/abs/2605.10246) *(D)* ·
[arXiv:2605.16616 (MLReplicate)](https://arxiv.org/abs/2605.16616) *(D)* ·
[arXiv:2607.20891](https://arxiv.org/abs/2607.20891) *(D)* ·
[arXiv:2607.26066](https://arxiv.org/abs/2607.26066) *(D)* ·
[arXiv:2403.07183 (Stanford)](https://arxiv.org/abs/2403.07183) *(D)* ·
[**arXiv:2603.20450 (not enforceable)**](https://arxiv.org/abs/2603.20450) *(D)* ·
[Pangram ICLR 2026 audit](https://www.pangram.com/blog/pangram-predicts-21-of-iclr-reviews-are-ai-generated) *(D, vendor)* ·
[**ICML 2026 enforcement**](https://blog.icml.cc/2026/03/18/on-violations-of-llm-review-policies/) *(D)* ·
[NeurIPS 2026 position-paper audit](https://blog.neurips.cc/2026/06/02/ai-generated-papers-in-the-neurips-2026-position-paper-track/) *(D)* ·
[ICLR 2026 retrospective](https://blog.iclr.cc/2026/03/31/a-retrospective-on-the-iclr-2026-review-process/) *(D)* ·
[AAAI-26 AI reviews for 22,977 papers](https://arxiv.org/abs/2604.13940) *(D)* ·
[Nikkei on hidden prompts](https://asia.nikkei.com/business/technology/artificial-intelligence/positive-review-only-researchers-hide-ai-prompts-in-papers) *(D)* ·
[arXiv:2507.06185](https://arxiv.org/abs/2507.06185) *(D)* ·
[arXiv:2606.10159](https://arxiv.org/abs/2606.10159) *(D)* ·
[ACL 2026 statement](https://2026.aclweb.org/acl_statement/) ·
[404 Media on arXiv's ban](https://www.404media.co/new-arxiv-rules-ai-generated-papers-ban/) ·
[TechCrunch on the same](https://techcrunch.com/2026/05/16/research-repository-arxiv-will-ban-authors-for-a-year-if-they-let-ai-do-all-the-work/) *(D)* ·
[arXiv submission statistics](https://arxiv.org/stats/get_monthly_submissions) *(D)*

**LLM prevalence in the record.**
[Kobak et al., *Science Advances*](https://www.science.org/doi/10.1126/sciadv.adt3813) ·
[arXiv:2406.07016](https://arxiv.org/abs/2406.07016) ·
[**arXiv:2608.10715 (89% of 2025 full texts)**](https://arxiv.org/abs/2608.10715) *(D)* ·
[arXiv:2510.09686 ("survey paper DDoS")](https://arxiv.org/abs/2510.09686) *(D)* ·
[arXiv:2607.00738](https://arxiv.org/abs/2607.00738) ·
[arXiv:2604.03173](https://arxiv.org/abs/2604.03173) ·
[arXiv:2604.03159](https://arxiv.org/abs/2604.03159)

**Forecasting.**
[Metaculus/EA synthesis](https://forum.effectivealtruism.org/posts/Spyz3wESZu2eeqhDj/ai-forecasting-in-2026-what-11-analyses-say) ·
[ForecastBench about](https://www.forecastbench.org/about/) ·
[ForecastBench PDF](https://faculty.wharton.upenn.edu/wp-content/uploads/2026/02/ForecastBench_A_Dynamic_.pdf) *(**NOT RETRIEVED** — unparsed binary)* ·
[replication prediction markets](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0248780) *(S)*

**The interactive line — games.**
[Foldit *Nature* 2010](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1038/nature09304%22&format=json&resultType=core) *(D)* ·
[**Foldit M-PMV, *NSMB* 2011**](https://www.nature.com/articles/nsmb.2119) *(D)* ·
[Foldit de novo design, *Nature* 2019](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1038/s41586-019-1274-4%22&format=json&resultType=core) *(D)* ·
[**Das et al., critical review, 2019**](https://pmc.ncbi.nlm.nih.gov/articles/PMC8297398/) *(D)* ·
[Eterna *PNAS* 2014](https://www.pnas.org/doi/10.1073/pnas.1313039111) *(D)* ·
[Eterna OpenVaccine, *NAR* 2021](https://academic.oup.com/nar/article/49/18/10604/6370252) *(D)* ·
[Eterna vs generative AI, *Science* 2026, DOI 10.1126/science.aeg6829](https://doi.org/10.1126/science.aeg6829) *(D)* ·
[EyeWire *Nature* 2014](https://www.nature.com/articles/nature13240) *(D)* ·
[Borderlands Science, *Nat. Biotech.* 43(1):76](https://pmc.ncbi.nlm.nih.gov/articles/PMC11738981/) *(D)* ·
[Phylo, *PLoS ONE* 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3296692/) *(D)* ·
[Project Discovery, *Nat. Biotech.* 2018](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=%22Project%20Discovery%22%20AND%20%22EVE%20Online%22&format=json) *(D)* ·
[Zooniverse, *PNAS* 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6369815/) *(D)* ·
[Zooniverse publications](https://www.zooniverse.org/about/publications) ·
[Sea Hero Quest ecological validity, *PLOS ONE* 2019](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0213272) *(D)* ·
[Moral Machine, *Nature* 2018](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1038/s41586-018-0637-6%22&format=json) *(D)* ·
[**Quantum Moves — Grønlund on the sign error, arXiv:2003.05808**](https://arxiv.org/abs/2003.05808) *(D)* ·
[Sels, arXiv:1709.08766](https://arxiv.org/abs/1709.08766) *(D)* ·
[retraction, *Nature* 22 Jul 2020, DOI 10.1038/s41586-020-2515-2](https://api.crossref.org/works/10.1038/s41586-020-2515-2) *(D)* ·
[ESP Game, CHI 2004](https://www.cs.cmu.edu/~biglou/ESP.pdf) *(D)* ·
[GWAP, *CACM* 2008](https://www.cs.cmu.edu/~biglou/GWAP_CACM.pdf) *(D)* ·
[reCAPTCHA, *Science* 2008](https://www.cs.cmu.edu/~biglou/reCAPTCHA_Science.pdf) *(D)* ·
[**von Ahn's GWAP obituary, 2011**](http://web.archive.org/web/20150517124012/http://www.gwap.com/) *(D)* ·
[ESP critique, CHI '09](https://doi.org/10.1145/1520340.1520597) *(D)* ·
[**citizen-science-game needs assessment, *PLOS ONE* 2023**](https://pmc.ncbi.nlm.nih.gov/articles/PMC10162532/) *(D)* ·
[Reverse the Odds, *BJC* 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6048059/) *(D)*

**The interactive line — measurement, ARGs, consent.**
[Parry et al., *Nature Human Behaviour* 2021 (manuscript)](https://purehost.bath.ac.uk/ws/files/219658181/Final_Manuscript.pdf) *(D)* ·
[Kahn, Ratan & Williams, *JCMC* 2014](https://academic.oup.com/jcmc/article/19/4/1010/4067631) *(D)* ·
[Johannes, Vuorre & Przybylski, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8074794/) *(D)* ·
[Zendle et al., China playtime mandates](https://api.openalex.org/works/doi:10.1038/s41562-023-01669-8) *(D)* ·
[Great Brain Experiment, *PLOS ONE* 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4838209/) *(D)* ·
[game-based assessment meta-analysis, 2025](https://journal.seriousgamessociety.org/index.php/IJSG/article/view/1028) *(D)* ·
[personnel-selection review, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9554090/) *(D)* ·
[discrete choice experiments, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11714376/) *(D)* ·
[**World Without Oil groupthink, CSCW '15**](https://api.openalex.org/works/doi:10.1145/2675133.2675258) *(D)* ·
[Urgent Evoke assessment, 2013](https://web.archive.org/web/20260116191246/https://www.erudit.org/fr/revues/ritpu/2013-v10-n3-ritpu02405/1035578ar.pdf) *(D)* ·
[I Love Bees, McGonigal](http://web.archive.org/web/20070610050226/http://www.avantgame.com/McGonigal_WhyILoveBees_Feb2007.pdf) *(D)* ·
[Red Balloon, *Science* 2011 / preprint](https://arxiv.org/pdf/1008.3172) *(D)* ·
[Tag Challenge, *PLOS ONE* 2013](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0074628) *(D)* ·
[**Limits of social mobilization, *PNAS* 2013, DOI 10.1073/pnas.1216338110**](https://doi.org/10.1073/pnas.1216338110) *(D)* ·
[collective-intelligence meta-analysis, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8019454/) *(D)* ·
[two-factor reanalysis, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11318883/) *(D)* ·
[**data-donation funnel, *JMIR* 2025**](https://pmc.ncbi.nlm.nih.gov/articles/PMC12514404/) *(D)* ·
[adolescent donation rates, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12728328/) *(D)* ·
[**skills not privacy, *CCR* 2024**](https://journal.computationalcommunication.org/article/view/8642) *(D)* ·
[**Ad Observer shutdown, Knight Institute**](https://knightcolumbia.org/content/researchers-nyu-knight-institute-condemn-facebooks-effort-to-squelch-independent-research-about-misinformation) *(D)* ·
[Facebook contagion EoC, *PNAS* 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4115552/) *(D)* ·
[BPS Code of Human Research Ethics 2021](https://york.citycollege.eu/files4users/files/BPS-Code-of-Human-Research-Ethics-2021.pdf) *(D)* ·
[citizen scientists as human subjects, *CS:T&P* 2019](https://theoryandpractice.citizenscienceassociation.org/articles/10.5334/cstp.202) *(D)* ·
[The Exit 8 dev retrospective, 4Gamer](https://www.4gamer.net/games/751/G075133/20241203035/) *(D)* ·
[The Exit 8 technical interview](https://gamemakers.jp/article/2024_02_14_60602/) *(D)* ·
[The Exit 8 at 2M](https://www.gamebusiness.jp/article/2025/08/30/24971.html) *(D)* ·
[Disco Elysium making-of](https://www.gamesradar.com/the-making-of-disco-elysium-how-zaum-created-one-of-the-most-original-rpgs-of-the-decade/) *(D)* ·
[ZA/UM financials, ERR](https://news.err.ee/1608494075/disco-elysium-video-game-made-nearly-7-million-profit-in-first-6-months) *(D)* ·
[the €4.8m transaction, Eesti Ekspress](https://ekspress.delfi.ee/artikkel/120098038/nihilisti-kannatused-ulmepalka-teeninud-kaur-kenderi-vaitel-virutati-temalt-ligi-miljon-eurot) *(D)*

**Civic record, law, infrastructure.**
[GovTech](https://www.govtech.com/artificial-intelligence/ai-generated-comments-swayed-california-air-decision) *(S)* ·
[Governing](https://www.governing.com/artificial-intelligence/ai-generated-public-feedback-raises-new-questions-for-lawmakers) *(S)* ·
[APA, June 2026](https://www.planning.org/planning/2026/jun/your-online-public-engagement-is-under-attack-from-ai/) *(S)* ·
[EU AI Act timeline](https://artificialintelligenceact.eu/implementation-timeline/) ·
DSA Article 40 delegated act — **NOT RETRIEVED** ·
[Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) ·
[Prolific payment model](https://researcher-help.prolific.com/en/articles/445230-prolific-s-payment-model) ·
Anthropic pricing — cached 2026-06-24; live page **NOT RETRIEVED** (404)

**In-house.** `src/data/werke.ts` · `.claude/rules/runtime-and-works.md` ·
`/Users/frankbultge/Documents/GitHub/field-research/FIELD.md`

**Known gaps, stated plainly.** Misinformation-inoculation game literature; a papers-per-project
bibliometric for Zooniverse; Sea Hero Quest test-retest reliability; EVE Online's exoplanet-phase
results; Nanocrafter's status; development budgets for *The Exit 8* and *Disco Elysium* (both
never published); the DSA Article 40 delegated act; the Epoch Capabilities Index licence; the
Wharton ForecastBench PDF; paywalled *Nature* news bodies; COPE's own site (Cloudflare-blocked
to automated retrieval, including Wayback — the body that endorses the machine-readable
retraction standard cannot be read by a machine); PubPeer's absolute scale; per-detector counts
on the Problematic Paper Screener dashboard; any venue policy deputising machine artifact
evaluation; the exact wording of the Quantum Moves retraction notice (the retraction itself is
confirmed three ways).

**Two naming hazards.** arXiv 2608.05179 carries an August-2026 identifier but an
arXiv-reported submission date of 29 June 2026 — cite the record, not the prefix. And
"CORE-Bench" is now **ambiguous**: [arXiv:2409.11363](https://arxiv.org/abs/2409.11363) is
reproducibility, [arXiv:2606.11864](https://arxiv.org/abs/2606.11864) is code retrieval.

---

*Ends. No direction is recommended. The ranking is by evidence; §5's P7 note explains why the
option ranked first for distinctiveness is ranked seventh for evidence, and why that divergence
is the finding rather than a way of avoiding one.*
