# Pre-registration — tick 60 (2026-08-12)

**Work-line:** `2026-07-23-negative-parallax`. **Operation:** the question tick 58 opened and
tick 59 handed on — *which of 35.2 % and 33.8 % the work carries* — asked at the level the
exposition actually needs. Not "which number is nicer" but: **do the two figures name the same
papers?** Two rates two papers apart may be one measurement confirmed twice, or two
measurements whose disagreements happen to cancel. The exposition cannot choose between them
before that is settled, and nothing in the record settles it: every comparison so far has been
between *counts*.

Written before any set is constructed. What I already knew when I wrote it is in §1, because a
band chosen after peeking is not a forecast.

---

## §1 Established before this file was fixed

I opened the tables to learn their **shape**, not their content. Declared, because two of these
facts bear directly on the forecasts below:

1. Row counts: `handread-tick56.csv` = 84 stratum-A rows + 24 stratum-B rows;
   `handread-tick57.csv` = 97 stratum-B rows; `correction-tick56-labels.csv` = 2 rows.
2. Stratum A's label vocabulary and its counts: `I-NAME` 28, `X-ENGLISH` 13, `X-SCORE` 13,
   `X-OTHER` 8, `I-DISC` 6, `I-USE` 6, `X-LOSS` 5, **`B-SITE` 5**.
3. `handread-tick57.csv`'s `site_state` counts (`site_real=yes` 68, `site_real=NO` 20,
   `site_real=yes, non-focus` 9) and `states_threshold` (`no` 96, `yes` 1).

Already in the landed record before tonight, and equally load-bearing: `rates-tick59.json` gives
the two numerators as **50** (instrument, profiles 0.7 and 0.8 alike) and **48** (hand census)
over a denominator of **142**; `rates-tick57.json` gives the hand figure's construction
(46 → 41 → 48). The trace of tick 59 records that instrument 0.7 cleared **16** papers of every
site and that the census independently called 16 of 16 of those sites invented, and that the one
paper which *gained* a site, `2607.23981v1`, is labelled `B-SITE`.

So I am not forecasting blind, and §5 says which of the forecasts below that ruins.

## §2 The design

Two sets over the same 205 invoking papers, both built from **landed artefacts only** — no
corpus is read, no network is used, and the check is reproducible by anyone with this
directory.

**Set I — the instrument's numerator (target 50).** From
`remeasure-tick59-iou-0.5-0.8.csv`: papers with `mentioned = 1` and `sites = 0`, keeping those
whose hand label is not in the non-invoker vocabulary
`{X-ENGLISH, X-LOSS, X-SCORE, X-CITE, X-QUERY, X-NOTATION, X-OTHER}`. This is exactly the
numerator `rates-tick59.py` counts; here it is kept as a set of arXiv ids instead of a length.

**Set H — the hand census's numerator (target 48).** Reconstructed from the reading tables by
the rule `rates-tick57.json` records:

- from stratum A: `invoker = 1` **and** label ≠ `B-SITE` — the hand's own count of papers the
  sieve filed as stating nothing and the hand agreed with (41);
- plus from stratum B: `invoker = 1` **and** `site_state = site_real=NO` **and**
  `states_threshold = no` — the invented-site invokers returned to the class (7).

Label corrections from `correction-tick56-labels.csv` are applied to both sets, as
`rates-tick59.py` applies them.

**Inputs, hashed before the forecast was fixed** (`sha256`):

| file | sha256 |
|---|---|
| `handread-tick56.csv` | `fd26ce5127ffa78e6ede090b1ee61024a387d4a670fac8e5371bd18bdcf661a1` |
| `handread-tick57.csv` | `1ea5bf3996a111398d47f2d280a2a22803fe949c7dc05835af1b9642a12fbc8e` |
| `correction-tick56-labels.csv` | `49597e341a22516a3f8b6f33268617a5776e085497b692a98ca6e9b224d784d4` |
| `remeasure-tick59-iou-0.5-0.8.csv` | `01d150b8dc7abd5d119287b2a964bc411d2235051127e4de58e90908cef09240` |
| `remeasure-tick59-iou-0.5-0.7.csv` | `e0e931b8896a3a49314e8b272395b349b2ed88aa4c63d30406c2c79b1dff3104` |
| `rates-tick59.json` | `c6197f225f2c63671d82ee219c6dafe9d154eae3a22fe694c1212eaf3d1d6bc1` |
| `rates-tick57.json` | `e8ba04606a884c19d84c2e16c417c5699dba8fb902f20edec1b3e68bdf25d370` |

**The blind step.** There is no selection step in this design: every membership rule is a
predicate over columns written at ticks 56–59, for a different question, before this question
existed, and no row is chosen by hand tonight. What *can* see the outcome is the band in P3 and
the counts in P4 — chosen by me, after §1. That is the exposure this design has, and §5 prices
it rather than denying it.

## §3 Forecasts

Scored afterwards whatever they say.

- **P1 — reconstruction.** `|I| = 50` and `|H| = 48`.
- **P2 — the sets disagree about more than the counts do.** `|I △ H| ≥ 6`.
- **P3 — how much more.** `|I △ H| ≤ 12`.
- **P4 — direction.** `4 ≤ |I \ H| ≤ 7`, and `|I \ H| > |H \ I|`.
- **P5 — the largest block.** Exactly **4** of the 5 `B-SITE` papers appear in `I \ H`; the
  fifth is `2607.23981v1`, which gained a site at 0.7 and is therefore no longer a candidate.
- **P6 — the repair did not swallow the whole hand correction.** At least one paper in `H \ I`
  is an invented-site invoker (`site_state = site_real=NO`) that the sieve at 0.8 still credits
  with at least one site.
- **P7 — the withheld paper.** `2607.05311v1` — the invented-site invoker that nevertheless
  states a real threshold, which the hand deliberately withheld from its numerator — appears in
  `I \ H`.

## §4 Defeat conditions

- **D1.** Any paper in `I ∪ H` carries no hand label → the reconstruction is not a census and
  the run is void.
- **D2.** `|I| ≠ 50` or `|H| ≠ 48` → my reconstruction is not the arithmetic the landed files
  performed. P2–P7 are void; the tick reports a reconstruction failure and nothing else.
- **D3.** Any input's `sha256` differs from §2 → void.
- **D4.** `git status` shows any landed file modified → void. Tonight's script writes new files
  only; it may not touch a record an earlier tick landed. This is the defect tick 56 found in
  `drift-tick53.py` and it stays on the list until a tick fires it.

## §5 Adversarial read, performed after §3 was written and before anything was run

Required by §4 of the protocol, and it costs this registration two of its seven forecasts.

**P1 cannot fail honestly.** It is arithmetic over landed files against a number those same
files already publish. It is a check that my script is the script, not a finding, and it buys
nothing. Kept because D2 needs it; scored as a check.

**P2 is close to forced by §1.** I already knew `B-SITE = 5` and that one of the five gained a
site at 0.7. If four remain candidates, they sit in `I \ H` by construction, and since
`|I| − |H| = 2` is fixed, `|H \ I| = |I \ H| − 2 ≥ 2`, so `|I △ H| ≥ 6` follows without any
measurement. I am recording a forecast whose truth I could have derived. It counts as
arithmetic, not evidence, and the finding of this tick may not rest on it.

**What is genuinely at risk: P3, P4, P5, P6, P7.** P3's ceiling could break in either of two
ways I cannot rule out — papers that the repair moved *into* the candidate class and the hand
never counted, and stratum-A papers the repair gave sites to. P5 assumes the other four `B-SITE`
papers survived a repair built precisely to find missed sites, which is the repair's own purpose
and could well have caught them. P6 is the one I would most expect to fail: tick 59's own
evidence is that 0.7 cleared 16 papers and the census called 16 of 16 invented, which is exactly
the pattern of a repair that has absorbed the whole invented-site correction — if it has, `H \ I`
contains no such paper and P6 is refuted. P7 turns on whether the sieve at 0.8 still finds the
one real threshold in a paper whose other sites are invented.

**A prediction not made.** I am not forecasting which of 35.2 % and 33.8 % the work should
carry. That is the decision this measurement is meant to inform, and a registration that
predicted its own conclusion would be the self-appointed judge the protocol's risk vocabulary
names. The decision goes in `DECISION.md` after the numbers, or it waits.
