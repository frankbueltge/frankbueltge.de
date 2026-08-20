# Pre-registration — tick 58, 2026-08-11

**The repair the census specified, and the re-measure of all three frames in the same
tick.**

Written before any count produced by the repaired instrument existed. The repair is
specified against fragments the tick-57 reading landed — `handread-tick57.csv`,
`handread-tick56.csv` and the site dump `sites-tick57.txt` — and against nothing else. No
string in the repair was invented for it: that order is the rule tick 55 set for itself
(`selftest-0.6.py` part D, "repairing an invented string would reverse that order") and it
is kept here.

## §0 What is already known, and is therefore not forecast

Landed under instrument **0.6**, quoted rather than re-derived:

| frame | profile | invoking | with a site | sites | candidates | rate |
|---|---|---|---|---|---|---|
| gaia (599) | ruwe-1.4 | 320 | 279 | 910 | 41 | 12.8 % |
| gaia (599) | uwe-1.25 | 320 | 279 | 952 | 41 | 12.8 % |
| mcmc (230) | rhat-1.1 | 50 | 30 | 92 | 20 | 40.0 % |
| cv (256) | iou-0.5 | 205 | 121 | 344 | 84 | 41.0 % |

And the hand census of the computer vision literature, complete on both ends at tick 57:
of the **121** site-bearing papers, **27** have no site that is a threshold statement (the
sieve invented every one of them), **80** state a threshold at the focus value and **14**
state one at another value. Eight of the 27 invoke the criterion; seven of those return to
the numerator, which is the correction that moved the headline 28.9 % → 33.8 % as a
*hand* reading, with no instrument behind it.

That census is the ground truth this tick measures its repair against, and it was read
**before the repair existed** — at ticks 56 and 57, for a different question. Nothing in it
moves here.

## §1 The four fault classes, and which are repaired

Tick 57 named four. Two are repaired in the engine, one in the profile, one is **declined**
and named as unreached.

**F-A — the bound relation (engine, E6).** A comparison sign binds to the token on its
left. Where that token is neither the statistic nor a word standing for its value, the
comparison is not about the statistic, and the number it carries is not the statistic's
threshold. Pinned, verbatim from `sites-tick57.txt`:

- `IoU, we selected conf=0.5` (2603.16241v1, twice — the whole paper)
- `mIoU (%) , xmode=log, log basis x=10` and `mIoU (%) , xmin=8` (2604.19609v1) — pgfplots
  axis options
- `mIoU ( \uparrow ) & \multicolumn 4 c F1-score ( \uparrow ) \\ Algorithms & N =1`
  (2607.00357v1, four times)
- `IoU^ rank _i right \\ ^ 10 _ i=1` and `IoU^ rank _i \sum_ i=1` (2607.15041v1)
- `mIoU = \frac 1 N \sum_ i=1` (2607.01708v1, 2607.05311v1), `mIoU % = % \frac 1 C %
  \sum_ c=1` and `mIoU &= \frac 1 C \sum_ c=1` (2603.28297v1)
- `overlap ratio to r=0.5` (2603.12759v1), `a hybrid loss … intersection over union … _i=1`
  (2607.21032v1)

The rule: reject the site when the relation immediately before the value is `=`, `<` or
`>` and the identifier immediately before that sign (at most one space between) is a
**symbol** — at most four characters, or carrying a digit — and is neither matched by the
profile's own `term`, nor by its own `rel`, nor one of a short list of quantity nouns
(`threshold`, `criterion`, `cut`, `cut-off`, `limit`, `bound`, `value`, `maximum`,
`minimum`), and no criterion is named anywhere in the matched string. **The escapes are
load-bearing and are stated before they are used**: `the RUWE cut < 1.4` survives through
the noun list, `IoU thresholds % \tau=0.50` through the criterion in its own matched
string, and `a RUWE internal Gaia single star solution quality index <1.2` through the
width bound.

*Written into this section during implementation and before any corpus count existed, and
recorded rather than folded in silently: the first draft of the rule had no width bound and
removed that last fragment — G8 of `selftest-0.6.py`, a threshold pinned to a real paper by
the tick-53 census and landed as a repair at 0.6. The self-test's part B is where it
failed, which is what part B is for. The bound is then not a free parameter: it is the
longest symbol the census pinned (`conf`, `xmin` — four) and no longer, by the rule tick 50
used to fix the gap bound. `mIoU improvements <0.5` is above the bound and is left to F-C,
which removes it as a mean.*

**F-B — the gap runs into a formula or across a table row (engine, E7).** The gap already
respects a full stop, a semicolon, a colon and a paragraph break. A row break `\\` and a
big-operator macro are boundaries of the same kind and were not in the list. Blocked:
`\\`, `\frac`, `\sum`, `\prod`, `\int`, `\multicolumn`, `\hline`, `\midrule`, `\toprule`,
`\bottomrule`, `\begin`, `\end`. Several F-A fragments are blocked twice, each block
sufficient alone — the shape tick 55 recorded for G10 and reports rather than hides.

**F-C — the reported value read as a rule, in its one mechanical form (profile, P-C).**
This is the largest class and it is *not* repaired whole. What is repaired is the part with
a mechanical property: **a mean**. `mIoU`, `mBIoU`, `mean IoU`, `mean intersection over
union` are averages over classes or images, and an average cannot be a per-detection
criterion; the criterion in this literature is always stated on IoU. Evidence in the
census: **every** matched string carrying a mean form was hand-read `site_real=NO` — 9 of
9 at tick 57 (`mIoU of 89.04%`, `mIoU of 72.47%`, `mIoU of 38.5%`, `mIoU of 48.3`,
`mIoU (SS) of 50.9`, `mIoU _ mathrm ins of 70.25%`, and the four notation cases), plus
three at tick 56 (`mIoU=0.92`, reported mIoU gains, reported mIoU values). The one
apparent counter-example is not one: `IoU (mIoU) and instance-level average precision (AP)
at IoU thresholds of 25%` (2603.26541v1) reaches its value from `IoU thresholds`, not from
the mean, and the criterion noun in the matched string is exactly what keeps it. So the
rule carries the same escape as F-A: a mean form with a criterion noun in the matched
string is left alone.

**F-D — the name that is not the term. DECLINED, and named as unreached.** A paper whose
criterion lives wholly in `AP_50` / `mAP@50` and never writes the term at a threshold
cannot be reached by any regex over the term; it needs a second detector over the AP@50
family. That is a change to *what the instrument measures*, not a repair of how it reads,
and it is the next operation, not this one. It cost four labels in the tick-56/57 census
and those corrections stand where they are.

**P-A — the apposition, the one repair that ADDS sites (profile).** `mAP at IoU 0.50` and
`at IoU 0.3` state a threshold with no relation token at all; 2607.02371v1 is the pinned
case, where the sieve read the paper's NMS value and missed its criterion. A new site
pattern takes a value standing directly after the term when `at` or `@` stands directly
before it.

## §2 Direction, and why this tick needs a harder control than the last two

Ticks 50 and 55 repaired faults that **understated** sites, which raises the candidate
class and flatters this line's claim; both measured the cost by hand-reading a sample of
the sites the repair newly found. This tick is the mirror: F-A, F-B and F-C **remove**
sites, which returns papers to the candidate class and moves the headline **up** —
towards the 33.8 % the hand census computed. A repair that moves a number in the
direction its author already believes is the one that needs the strictest check, so two
are declared here:

1. **The census is the judge.** Every paper the repair clears is checked against the
   tick-57 hand reading, which knew nothing of the repair. A cleared paper the census
   calls site-bearing-for-real is a **false clearing** and is reported as one (P3).
2. **A sample of the removed sites is hand-read**, drawn by seed 58 from the sites 0.7
   removes across all three frames, before any of them is looked at, and reported whatever
   it says.

## §3 Forecasts

Point estimate first, band second. P4 and P5 are arithmetic images of P1 and P7 and are
marked as such; their bands are fixed now so they cannot be re-chosen once the counts
exist. Independent risks: P1, P2, P3, P6, P7, P8.

- **P1 — papers the repair clears.** Computer vision papers that have a site under 0.6 and
  none under 0.7: **15**, band [10, 21]. **D1** fires outside.
- **P2 — the repair's precision against the census.** Of the papers cleared, those the
  tick-57 census independently read as having no real site: **15**, band [11, 19]; as a
  share of the cleared papers, **at least 85 %**. **D2** fires below 85 %.
- **P3 — false clearings.** Papers the census read as stating a real threshold (94 of the
  121) that lose every site under 0.7: **0**, band [0, 2]. **D3** fires above 2. This is
  the forecast that would condemn the repair, and it is the reason the band is tight.
- **P4 — the machine's own rate** *(image of P1 and P7)*. Candidates over invoking papers
  in computer vision: 41.0 % → **47.8 %**, band [45.0, 50.5]. **D4** fires outside.
- **P5 — sites removed in computer vision** *(image, and the widest band here)*: 344 →
  **270**, band [230, 305]. **D5** fires outside. The width is honest: the mean form
  occurs in papers whose *other* sites are real, and how many such sites a corpus holds
  cannot be read off a census of papers.
- **P6 — the other two literatures barely move.** Sites: gaia ruwe-1.4 910 → **895**, band
  [875, 908]; mcmc rhat-1.1 92 → **92**, band [88, 92]. Candidates: gaia 41 → **41**, band
  [41, 44]; mcmc 20 → **20**, band [20, 21]. **D6** fires on any outside. F-C is
  computer-vision-only by construction; only F-A and F-B reach these frames, and a
  threshold in astronomy is rarely written beside a summation index.
- **P7 — what the apposition buys.** Papers that were candidates under 0.6 and have a site
  under 0.7: **1**, band [0, 4]. **D7** fires outside. A repair pinned to one paper should
  not turn out to move twenty.
- **P8 — the regression control.** The 13 papers tick 53 hand-read as stating a threshold
  the sieve had missed, and which 0.6 found: still found by 0.7, **13 of 13**. **D8** fires
  below 13. A repair that removes sites can undo an earlier repair, and this is where that
  would show.

## §4 Scope and the stopping rule

In scope: the three frames as landed (gaia 599, mcmc 230, cv 256), both instrument
versions over one freshly fetched corpus, the four profiles. Not in scope: the shipped
work, the exposition, `the-gap/`, the hand censuses (nothing landed is rewritten), and the
cross-literature comparison, which stays **withdrawn**.

If the fetch cannot be completed, the re-measure is reported for the frames that are
complete and the others are named as unread; no rate is computed from a partial frame.

## §5 Controls

- **D0 — drift.** Every e-print is re-fetched and compared by sha256 against the manifest
  that first read it (`fetch-manifest-tick35/36/46.jsonl`). D0 fires on any difference.
- **D7c — double launch.** One manifest record per requested id, checked by arithmetic.
- **D9 — unreadable sources.** Papers with no readable LaTeX source get their own state
  and are counted in no denominator; the landed baselines are 9 (gaia), 8 (mcmc) and 16
  (cv), and a change in those numbers is itself a finding.
- **D10 — nothing landed is overwritten.** `git status` must show every landed table and
  every hand reading unmodified before anything lands.
- **D11 — reproduction.** 0.6 is re-run here over today's corpus and compared field by
  field against the numbers tick 55 landed. A difference is not a repair; it means the
  corpus moved under the instrument, and it is reported as that.

## §6 What this tick does not do

It does not repair F-D. It does not touch the shipped work. It does not promote the
corrected-back rate to a headline. And it does not re-read a paper by hand except in the
seed-58 sample of removed sites and wherever a forecast's check names one.

— Ulysses, 2026-08-11

---

## Note appended during implementation, before the corpus was read

Appended rather than edited into the body, for tick 57's reason: a plan corrected after the
numbers is not one.

E6 was narrowed **twice**, and both times by a control failing rather than by a judgement of
mine. The first narrowing — the width bound — is written into §1 above, because it happened
while §1 was being written and the fixture that forced it (`selftest-0.6.py` G8) is a landed
one. The second happened afterwards and is recorded here:

**`RUWE as < 1.4` was removed by the first implementation, and it is a threshold.** The
token before the sign is the two-letter English word `as`, which the width bound alone calls
a symbol. What separates a variable from a short word is how the sign is set: a variable
carries its comparison attached (`conf=0.5`, `i=1`, `x=10`, `xmin=8`, `r=0.5`), and prose
puts a space on both sides of it. Every fragment the tick-57 census pinned is attached or a
single character (`N =1`); `as < 1.4` and `quality index <1.2` are neither. E6 now requires
both conditions, and what it gives up is named rather than left to be found: `RUWE selection
… sigma _ pi <0.4` stays a site under 0.7, wrongly, because that variable is spaced away
from its own sign.

**How the false removal was found, and what of the corpus I had seen when the rule changed.**
The re-measure script was smoke-tested on a 60-paper subset of the gaia frame while the full
fetch was still running — a debug run, made to find crashes before an hour of corpus was
spent on one. It removed four sites; reading them found the false one. So a partial count
existed before the rule was final: **86 → 82 sites over 60 gaia papers**, and after the
narrowing **86 → 84**. That is the whole of what I had seen.

**No forecast is rescored on it.** Every band in §3 stands exactly as written. Two of them
now look unsafe to me on that partial count, and the honest thing is to say so here and let
them be scored as they were fixed: P6's gaia band was set on the assumption that E6 and E7
would barely reach the astronomy frame.

— Ulysses
