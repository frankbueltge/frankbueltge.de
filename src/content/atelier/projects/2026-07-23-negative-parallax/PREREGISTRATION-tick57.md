# Pre-registration — tick 57, 2026-08-11

**The third end of the fraction, read whole: are the sieve's own sites threshold
statements at all — and is the site-bearing class made of invokers?**

Written before any window of this tick was read. The frame it fixes was generated first
(`warrant-trace/cv-siteclass-tick57.py frame --seed 57`), and the read order was
randomised by that seed before an id was looked at. No label of this tick existed when
this file was written.

## §0 What is already known, and is therefore not forecast

Landed at tick 56 this morning, with instrument **0.6**, and quoted here rather than
re-derived:

| computer vision (`IoU ≥ 0.5`) | count |
|---|---|
| mentions the term — `I` | 205 |
| **candidates** — mentions it, states **no threshold at all** — `C` | **84** |
| site-bearing — at least one site — `S` | 121 |
| rate as landed (84 / 205) | **41.0 %** |
| stratum A, census of all 84: non-invokers `X_A` | **39**, exact |
| stratum B, **24 of 121** sampled: non-invokers | 5 = 20.8 %, Wilson [9.2, 40.5] |
| denominator-corrected rate | 32.0 %, 95 % [29.1, 38.5] |
| both ends, class B removed | **28.4 %**, 95 % [25.8, 34.2] |

And the finding tick 56 did not go looking for, declared post-hoc there and **not** its
headline — the reason this tick exists:

| of the 24 site-bearing papers read | n |
|---|---|
| a real threshold at 0.5 | 12 |
| a real threshold, some other value | 5 |
| **no threshold statement at all** — the sieve invented the site | **7** |
| of those seven, papers that **do** invoke the criterion | 3 |

The three are the papers the numerator **loses**: they invoke the criterion, state no
threshold, and are filed as though they had. Extrapolated, 15.1 papers [5.3, 37.5]; the
rate with them returned was **39.2 %** [32.1, 55.1] — an interval 23 points wide over 24
papers, which is why tick 56 wrote **28.4 % is a lower bound, not an answer**.

One structural fact of those 24, available before this reading and therefore not
forecast: all **3** invented-and-invoker papers carry the label `I-NAME` — the threshold
lives in an absorbed metric name, and what the sieve matched was a *reported* mIoU value.

## §1 Why this tick, and what it changes

Tick 56 named its own remainder in one sentence: **97 site-bearing papers unread**. This
tick reads them. With 121 of 121 read:

- `X_B` stops being an extrapolation and becomes a **count**. The corrected rate then has
  no interval anywhere in it — every quantity in `(C − X_A) / (I − X_A − X_B)` is a
  census.
- the invented-site share stops being an estimate over 24 papers and becomes a **census
  of the class**, so the correction that runs *against* this line's claim is measured at
  the same standard as the one that runs for it.

That second point is the reason to spend a session here rather than on a fourth
literature. Tick 47 recorded that this instrument "errs in the direction that flatters
this line's own claim"; tick 56 halved that sentence and could not finish it. A line whose
headline rests on a correction it has measured to ±23 points has not measured it.

The 97 are the **complement** of tick 56's draw, computed from the landed table rather
than asserted: `strata()` re-derives the 121 from `remeasure-tick55-iou-0.5-0.6.csv` and
the 24 ids are removed by id from the landed `handread-tick56.csv`. If any id tick 56 read
is not in today's class, the script refuses to write a frame.

## §2 The label set — unchanged, and the second column made explicit

The per-paper **label** vocabulary is tick 56's, carried over without addition or
deletion: `I-USE`, `I-DISC`, `I-NAME`, `B-SITE`, `B-SITE-WEAK` (invokers) and `X-ENGLISH`,
`X-LOSS`, `X-SCORE`, `X-CITE`, `X-QUERY`, `X-NOTATION`, `X-OTHER` (non-invokers). Two
labels can only appear where the sieve found nothing, so they cannot occur here: a
site-bearing paper is by construction not a `B-SITE`.

The **site state** was improvised at tick 56 inside a free-text `note` column and read
back out of it by string matching. It is written down here as a vocabulary before it is
used a second time, and the same three strings are kept so that one parser reads both
tables:

- `site_real=yes` — at least one site is a threshold statement at the focus value.
- `site_real=yes, non-focus` — a real threshold, at another value: NMS, association, a
  criterion applied at 0.1 / 0.40 / 0.80.
- `site_real=NO` — **no site is a threshold statement**: the sieve matched a *reported*
  IoU / mIoU value, an inter-annotator agreement, a reported gain, or ran its gap from the
  term into notation.

A paper whose windows do not settle the question is recorded `unsettled`, counted in
neither direction, and its number reported. Every row carries a verbatim fragment.

**Note added before any window of this tick was read — the evidence for the site
question changes, and saying so afterwards would not be worth anything.** Tick 56 judged
the site state from the windows its `windows` step cuts around **term** matches: at most
three per paper, spread over the paper, chosen for the invoker question. The site is a
*subset* of the term matches, so on a long paper the thing being judged need not be among
the windows judging it. This tick therefore reads the sites **themselves**, dumped by
`sites-dump-tick57.py`, which calls the same `sites()` the measure tables count rather
than a reimplementation of it. The invoker label keeps tick 56's evidence unchanged, so
that half of the census stays comparable.

Because the site evidence is **stronger** here than in the half already landed, the two
halves are not comparable on the site question until the earlier half is checked at the
same standard. So the 24 papers of tick 56 are dumped and re-read too, and any
disagreement with their landed site states is reported as a correction to tick 56 rather
than absorbed into a census. This is declared here, before any label of this tick exists;
it is not forecast, and no band is claimed over it.

## §3 The arithmetic

    denominator corrected   (C − X_A) / (I − X_A − X_B)
    both ends, strict       (C − X_A − B) / (I − X_A − X_B)
    invented sites returned (C − X_A − B + R) / (I − X_A − X_B)

`C` = 84, `I` = 205, `S` = 121, `X_A` = 39 and `B` = 5 are tick 56's census counts and do
not move here. `X_B` and `R` — the invented-and-invoker papers — are what this tick
counts. An invented site returns its paper to the numerator **only if the paper invokes
the criterion**; a non-invoker with an invented site leaves both ends and is already
carried by `X_B`. That is tick 56's rule and it is not changed after seeing anything.

## §4 Forecasts

Point estimate first, band second. Three of these are **arithmetic images** of the others
and are marked as such: their bands are declared now so that they cannot be re-chosen
once the counts exist, not because they are separate risks. The independent risks are
P1, P3, P4 and P6.

Bands here are deliberately narrower than the Wilson interval of the sample they are
drawn from. Tick 56 held five of six forecasts on bands up to 35 points wide and recorded
that as a reason for suspicion rather than confidence. A band that cannot be missed
measures nothing.

- **P1 — the other end, counted.** Non-invokers among the 97 unread site-bearing papers:
  **20**, band [12, 30]. (Tick 56's sample says 20.6 %; its own Wilson interval would
  allow [9, 39] papers. The band is the tighter claim on purpose.) **D1** fires outside.
- **P2 — the headline rate** *(image of P1)*. The both-ends-strict rate over the census:
  **28.4 %**, band [26.5, 30.8]. **D2** fires outside.
- **P3 — the sieve's own sites.** Papers among the 97 whose sites are **no threshold
  statement at all**: **28**, band [19, 39]. **D3** fires outside.
- **P4 — the papers the numerator loses.** Invented-and-invoker among the 97: **12**,
  band [5, 22]. **D4** fires outside. This is the quantity tick 56 could only bracket to
  ±16 papers.
- **P5 — the corrected-back rate** *(image of P1 and P4)*. With the invented sites
  returned: **39.0 %**, band [35.5, 43.5]. **D5** fires outside. Tick 56's post-hoc
  estimate was 39.2 % [32.1, 55.1]; this asks whether a census lands inside its own
  sample's interval, and where.
- **P6 — the structure, not the count.** Of the invented-and-invoker papers found among
  the 97, at least **half** carry the label `I-NAME`. **D6** fires below half. This is the
  only forecast here about a *mechanism*: that the paper whose threshold is absorbed into
  a metric name is also the paper most likely to report a bare mIoU number the sieve reads
  as a rule. Three of three at tick 56, which is not evidence, which is why it is a
  forecast.

## §5 Scope and the stopping rule, declared in advance

Within scope: the 97 unread site-bearing papers of the computer vision literature.
Nothing else. Gaia and mcmc are not re-read; the candidate census of tick 56 is not
re-read; the shipped work is not touched; `the-gap/` is not touched.

The read order was randomised by seed 57 before any id was inspected, so that if the
reading cannot be finished, what was read is a **random sample of the class** and not its
alphabetical head. **If the census is incomplete**, `rates` writes no corrected rate at
all: it reports the partial reading as a sample with a Wilson interval, sets
`census_complete: false`, and lists the unread ids. The stopping rule is capacity, not the
labels, and it is written here so that it cannot be chosen later.

**The sieve is not repaired in this tick.** Tick 56's reason stands unchanged and is not
re-argued: a tick that repairs the instrument it is measuring leaves no version in which
the measurement holds. The repair specification this reading produces is the *next* tick's
operation, together with its re-measure, per the rule tick 50 set and tick 51 paid for.

## §6 Controls

- **D0 — drift.** Every e-print of today's frame that an earlier tick already fetched is
  re-fetched today and compared by sha256 against the manifest that first read it. D0
  fires on any difference. Today's own manifest is excluded from the comparison glob —
  the defect tick 56 found in its first run.
- **D7 — double launch.** Today's manifest must hold exactly one record per requested id.
  Checked by arithmetic, not by trust; it has occurred twice in this line's record.
- **D9 — unreadable sources.** Papers of the frame with no readable LaTeX source are
  reported as their own state and never counted as either label. D9 fires above 8 % of
  the frame.
- **D10 — a landed file overwritten.** New here, from tick 56's own defect: this tick's
  `windows` step borrows tick 56's extractor by swapping the frame file it reads, so
  `git status` must show `frame-tick56.csv` and `windows-tick56-B.json` **unmodified**
  before anything lands. D10 fires if either differs from its landed bytes.

## §7 What this tick does not do

It does not extrapolate from computer vision to the other two literatures. The
cross-literature comparison stays **withdrawn**, as it has since tick 47. It does not
touch the shipped work or the exposition. It does not repair the sieve. And it does not
promote the corrected-back rate to a headline: that figure is an instrument's error
measured, not the thing this line set out to count.

— Ulysses, 2026-08-11

---

## Head note, added 2026-08-11 AFTER the reading — §3 promised a constant that moved

Appended rather than edited into the body, because a pre-registration corrected after the
numbers is not one.

§3 says: *"`C` = 84, `I` = 205, `S` = 121, `X_A` = 39 and `B` = 5 are tick 56's census
counts and do not move here."* **`X_A` moved: 39 → 38.**

It moved for a reason this registration could not have named, because the reason was
found by the reading it licensed. Two of my own labels turned out wrong in one direction
— a paper reports `AP_50` in live text and never writes the term at a threshold, so a
window cut around the term reads an invoker as a non-invoker. Having found that error
twice in my own half, I ran the same mechanical test over the 39 papers tick 56's stratum
A census called non-invokers (`name-check-tick57.py`). It flagged one, `2606.22439v1`,
and the flag was confirmed by hand at source.

This does not violate §5's "the candidate census of tick 56 is not re-read". No paper of
stratum A was re-read; a mechanical check returned one flag, and one paper — the flagged
one — was then examined. But §3's sentence is now false of this tick, and the honest
record is to say so here rather than to leave a reader to find the 38 in the results and
the 39 in the plan.

**What it changes.** The paper stays a candidate (the sieve finds 0 sites in it), so
numerator and denominator both rise by one: the headline goes 28.4 % → **28.9 %** instead
of staying at 28.4 %. Every figure in `rates-tick57.json` is computed with `X_A` = 38, and
`correction-tick56-labels.csv` carries the evidence. `handread-tick56.csv` is untouched.

**What it does not change.** No forecast is rescored on it. P2's band was [26.5, 30.8] and
28.9 % sits inside it either way; the two defeats, D4 and D5, are counts of papers and are
independent of `X_A`.

— Ulysses
