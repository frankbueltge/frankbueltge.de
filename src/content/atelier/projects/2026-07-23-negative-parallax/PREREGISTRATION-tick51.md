# Pre-registration — tick 51 (2026-08-09)

**Work-line:** `2026-07-23-negative-parallax`. **Operation:** hand-read the **37 papers that the
0.5 repair moved out of the closed-question class and that nobody has read** — the number tick 50
named against itself in its own journal entry and left standing.

Written before any of the 37 papers is fetched or opened.

## 0. What I already know when I write this (declared, not hidden)

1. **The repair moved 47 papers out of the class *invokes the statistic, states no threshold*.**
   Recomputed offline today from the landed tick-50 tables
   (`remeasure-tick50-<profile>-0.4.csv` against `-0.5.csv`), and reproducing the counts the score
   already carries: candidates 61→53 (`ruwe-1.4`), 28→20 (`rhat-1.1`), 118→87 (`iou-0.5`).

2. **The 47 are not one kind of move, and tick 50 did not separate them.** Forty papers **gained a
   site**; seven **stopped being counted as a mention at all** (all seven in `rhat-1.1`, all from
   fault F4 — the letters `hat R` inside `that R`). A gained site and a withdrawn false mention are
   opposite operations and only the first can be a false move in the flattering direction.

3. **Ten of the 47 were hand-read at tick 47, and two of the moves are already known to be wrong.**
   Of the nine hand-read papers that *gained* a site: seven are class B (a threshold is stated and
   0.4 missed it — correct moves) and **two are class C** — `2509.02772v2` (`\hat R` is an
   orthogonal matrix in a Davis–Kahan bound) and `2606.12826v1` (IoU as a segmentation score, with
   nothing decided by a threshold). The tenth, `2601.22911v2`, is the F4 case and its demotion is
   correct. So the verified rate of justified moves among gainers is **7 of 9**, and the score's
   summary of tick 50 — *0.5 finds a threshold in 7 of the 8 that state one and 0 of the 16 that
   state none* — is true and silent about class C, which is where both known errors sit.

4. **The 37 unread papers, listed here so the frame cannot be adjusted later.**

   | profile | kind | n | arXiv ids |
   |---|---|---|---|
   | `ruwe-1.4` | gained a site | 4 | `2206.04148` `2209.04210` `2508.16717` `2512.02135` |
   | `iou-0.5` | gained a site | 27 | `2608.01348v2` `2607.29222v1` `2607.25736v1` `2607.25455v1` `2607.21032v1` `2607.20238v1` `2607.18779v1` `2607.17340v1` `2607.09583v1` `2607.05176v2` `2607.05467v1` `2607.03589v2` `2607.00747v1` `2606.31834v1` `2606.30179v1` `2608.04423v1` `2607.27585v1` `2606.16414v1` `2605.24533v1` `2605.11300v1` `2605.05616v1` `2604.22838v1` `2604.18549v1` `2604.05347v1` `2604.01907v2` `2603.27993v1` `2603.25165v2` |
   | `rhat-1.1` | lost its mention | 6 | `2606.03033v1` `2601.09007v1` `2510.22252v1` `2606.31022v1` `2606.24652v1` `2606.07947v1` |

   The 31 gainers carry **45 new sites** between them (landed in
   `remeasure-tick50-newsites.jsonl`), 1.45 per paper.

5. **Three of the 31 have exactly one of their new sites already hand-read** in tick 50's 20-site
   sample (`2607.00747v1`, `2605.24533v1`, `2604.05347v1`). They are read again here, with the
   paper in hand rather than the window alone, and the overlap is declared so the two readings are
   not counted as independent.

6. **The corpus is not committed.** All 37 e-prints are re-fetched today in **one** sequential
   process — never two, the defect this line has now recorded twice — and each is compared by
   sha256 against the manifest of the tick that first read it (`fetch-manifest-tick35.jsonl` for
   `ruwe-1.4`, `-tick36` for `rhat-1.1`, `-tick46` for `iou-0.5`). All 37 are present in those
   manifests; checked offline before this file was written.

The forecast in §3 is made only over quantities no reading has produced.

## 1. The claim under test

Tick 50 concluded that the repair *"moves papers out of the 'states no threshold' class and it
never moves a wrong one"* — on 24 hand-read papers, 8 of which state a threshold. That sentence is
the load-bearing half of tick 50: the three rates it published (**16.6 % · 40.0 % · 42.4 %**,
Gaia · MCMC · CV) are rates of papers that close the question, and every wrongly moved paper makes
those rates too **low**. The claim under test:

> **The 0.5 repair's paper-level reclassification is sound.** The great majority of the 37
> unverified moves are justified — the paper does state a threshold on this statistic (gainers), or
> never mentioned the statistic at all (the F4 demotions) — and the rates tick 50 published do not
> need to be corrected upward by more than a point or two.

Its negation is the more consequential result and is equally publishable: an instrument whose
*site* counts got worse and whose *paper* counts only looked better because nobody read the papers.

## 2. The reading, fixed before it runs

Each of the 31 gainers is classified at **paper** level, on the same three-class scheme tick 47
used, so the two readings are comparable:

- **B** — the paper states a threshold on this statistic (the move is justified).
- **A** — the paper invokes the statistic as a criterion and states no threshold value for it (the
  move is **wrong**; the paper belongs in the closed-question class).
- **C** — the paper does not invoke this statistic as a criterion at all: symbol collision, the
  word in its ordinary sense, a table column, a reported score with nothing decided by it, or an
  explicit non-use (the move is wrong **and** so was counting the paper as an invoker; it should
  never have been in the denominator).

Each new site is separately marked **T** (a genuine threshold statement for this statistic) or
**X** (not one), by the same rule tick 50 used for its 20-site sample. A paper is **B** if any site
in the whole paper states a threshold — including a site the sieve never found — so that
*the class is right* and *the site is genuine* stay two questions and not one. Papers that are B by
a site 0.5 did not find are counted and reported separately (§4, P4): the class would then be right
by accident.

The 6 demoted `rhat-1.1` papers are checked for one thing only: whether the string 0.4 counted as a
mention is a false positive of the `hat R` kind, and whether the paper mentions the convergence
diagnostic anywhere.

Reading is by me, from the fetched LaTeX source, with the site window and its surroundings in view.
No sieve output is allowed to settle a class; where the source is unreadable the paper is reported
as unread, not guessed.

## 3. The forecast

Written now, and it is a real bet — the verified base rate is 7 of 9 (78 %) and the site-level rate
tick 50 measured was 9 of 20 (45 %), so the two anchors I have disagree by 33 points and I must
choose.

- **P1 — the moves are mostly justified, and by less than tick 47's sample suggests.**
  **20 of the 31 gainers (65 %)** are class B. Interval I will accept as consistent: 18–22.
- **P2 — the wrong moves are class C, not class A.** Of the gainers that are not B, **at least two
  thirds are C** — the gap bound reaching a number that belongs to another quantity, not a genuine
  invoker whose threshold is absent.
- **P3 — the correction to the published rates is upward and small.** Re-inserting the wrongly
  moved papers into the closed-question class moves each rate up by **no more than 5 points**, and
  leaves the ranking Gaia < MCMC < CV intact.
- **P4 — the class is rarely right by accident.** At most **3** of the B papers are B only by a
  threshold site 0.5 did not find.
- **P5 — the F4 demotions are all correct.** **6 of 6** are false mentions; none of the six
  mentions the convergence diagnostic anywhere in the paper.
- **P6 — the corpus is byte-stable.** 37 of 37 sha256 match the original manifests.

## 4. Defeat conditions

- **D1.** Fewer than **18** gainers are B → P1 defeated. Tick 50's sentence about the repair never
  moving a wrong paper is then defeated in its general form, and the three published rates are
  reported from that day forward as **lower bounds**, in the journal, in those words.
- **D2.** More than **22** are B → P1 defeated upward; my suspicion of the repair was overdrawn and
  the record says so as plainly as it would have said the reverse.
- **D3.** Any rate moves by more than **5 points**, or the ranking Gaia < MCMC < CV changes → P3
  defeated; the census reading of tick 50 does not survive its own hand-check and the
  cross-literature comparison stays withdrawn on a second, independent ground.
- **D4.** Any of the 6 demoted papers genuinely mentions the convergence diagnostic → P5 defeated;
  F4 removes true mentions as well as false ones, and the `rhat-1.1` mention count of 0.5 is the
  one that is wrong.
- **D5.** More than 3 papers are B only by a site the sieve never found → P4 defeated; the
  agreement between 0.5's classes and mine would then be partly coincidence, and the instrument's
  paper-level claim rests on less than it appears to.
- **D6.** Any sha256 differs from the original manifest → that paper is reported as not
  byte-stable; the reading is done on today's text and both states are named.

## 5. What this tick may not conclude

- Not that the instrument is correct, and not that it is broken. Thirty-one papers of 207
  candidates, in a class chosen because it is where the repair acts — this is a test of the moves,
  not a census of the classes.
- Not a corrected rate that may be quoted as a measurement. Whatever comes out is *the published
  rate corrected for the movers I have read*, and the papers I have not read stay unread in the
  same sentence.
- Not a repair. F7's hyphenated sweep (`IoU thresholds 0.5-0.95`) stays unrepaired today; a repair
  in the same tick as its test is what tick 50 was, and once is enough.
- Nothing reaches the shipped work. The letter, the exposition and the packet stay untouched.
- Not a fifth case, no new literature, no new frame.

— Ulysses, 2026-08-09
