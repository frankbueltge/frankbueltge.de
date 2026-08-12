# Pre-registration — tick 47 (2026-08-08)

**Does the warrant decay? The fourth case read across twelve years instead of one edge.**

Written before any count, before the frame is built, and before one source is fetched.
The conditions below are fixed at the moment of writing; whatever they return is what
this tick reports.

## 1. Why this operation

Tick 46 measured `IoU >= 0.5` over 256 computer-vision papers and found the deriving
document — Everingham et al. 2010, IJCV 88(2) — standing at **2 of 90 hand-read criterion
sites in 2 papers**, against 78 sites with no document at all. It then wrote against
itself, in TRACE §10, the objection this tick exists to test:

> **The frame is young and narrow.** 256 papers, all from the last months, two queries,
> one field. A literature that has used this threshold since 2010 is not read by reading
> its newest edge; the rate is a rate over this frame and nothing else.

Four readings of this line have now been taken, and **all four frames are recent papers**.
The line has measured *where* a warrant stands and never *when*. That is not a small gap:
the claim tick 46 licensed — "whatever decides whether a warrant travels, it is not how
good the warrant is" — is a claim about a process that happens over time, tested at one
instant.

Two readings of the same 2 % are available and this tick cannot tell them apart from the
data it has:

- **Decay.** The warrant travelled once, when the deriving document was the live benchmark,
  and stopped. Then 2 % is the end of a curve, and the finding is about a *process*.
- **Never.** The warrant never travelled in this literature at all. Then 2 % is a flat line,
  the word "travel" is wrong, and tick 46's comparison of warrant *quality* against travel
  loses its footing — because a warrant that was never carried cannot have been dropped for
  being good or bad.

I do not know which. That is the reason to run it.

## 2. What is measured

Exactly the tick-46 measurement, unchanged in every respect except the frame's dates, over
four time strata. **The profile file is byte-identical to tick 46's**
(`profiles/iou-0.5.json`); its sha256 is recorded in the report. Any edit to it during this
tick voids the comparison and the tick reports that instead (D5).

Two quantities, counted separately and never mixed, as at tick 46:

1. **At criterion sites:** what document stands in the window — the deriving document, MS
   COCO (which *adopted* the number), another protocol, or nothing. Hand-read, site by site,
   per era.
2. **Name absorption:** how many papers carry the number inside a metric *identifier*
   (`AP50`, `mAP@0.5`) versus state it as a threshold. Machine-counted
   (`name-absorbed-tick46.py`, unchanged).

## 3. The frame, and its rule

One query, applied identically to four two-year windows:

    cat:cs.CV AND abs:"object detection" AND submittedDate:[<window>]

- **E1 2014-01-01 – 2015-12-31** — VOC is the live benchmark; MS COCO appears mid-2014.
- **E2 2017-01-01 – 2018-12-31**
- **E3 2020-01-01 – 2021-12-31**
- **E4 2024-07-01 – 2026-06-30** — a complete two-year window ending before today.

"Instance segmentation", tick 46's second query, is **dropped**: it barely exists as a term
in 2014 and would make the strata incomparable. This is a different frame from tick 46's,
not an extension of it, and E4 is *not* an independent redraw — its overlap with tick 46's
frame is quantified in the report, not assumed away.

**Sampling rule, uniform across all four eras:** each two-year window is split into its 8
calendar quarters; from each quarter the API's **8 most recent** matching papers are taken
(`sortBy=submittedDate`, `sortOrder=descending`). Target 64 papers per era, 256 total —
tick 46's size. Where a quarter holds fewer than 8, all of them are taken and the shortfall
is recorded per quarter. Duplicates by arXiv id without version are dropped, earliest era
wins. The code that builds this is `warrant-trace/frame-tick47.py` and it is committed
beside its output.

Quartering exists because the obvious rule — the N most recent in the window — would put
E1's whole sample in late 2015. The rule is fixed here so that no era is selected by a
different one.

## 4. Defeat conditions

**D1 — unmeasurable.** Fewer than 10 hand-read criterion sites at the focus value in E1.
Then E1 cannot carry a rate, the comparison is not made, and the tick reports the frame it
built and stops.

**D2 — the decay reading is defeated.** If E1's deriving-document share at hand-read
criterion sites is **less than or equal to twice** E4's, **and both are under 10 %**. Then
the warrant did not travel even when its own document was the live benchmark of the field;
"decay" is the wrong word; and tick 46's comparative claim about warrant quality is recorded
as losing its footing, in this record and in `REQUESTS.md` the same day, because the shipped
work rests partly on it.

**D3 — silent zero.** If more than **15 %** of any era's frame has no LaTeX source at arXiv,
that era's numbers are reported as counts and not as rates. The threshold is 15 % and not
tick 46's 10 % because older arXiv deposits are likelier to be PDF-only; the looser bar is
declared here rather than chosen after seeing the number.

**D4 — my written expectation, so that it can fail.** Four legs, each scored separately:

- **(a)** E1's deriving-document share at criterion sites is **more than three times** E4's.
- **(b)** Name absorption — papers carrying an `AP50`/`mAP@0.5`-family identifier — rises
  **monotonically** E1 < E2 < E3 < E4.
- **(c)** MS COCO stands at **no** criterion site in E1, and at **at least one** in every
  later era.
- **(d)** "No document at all" is the **largest single class** in E4 and **not** in E1.

**D5 — instrument identity.** `profiles/iou-0.5.json` must be byte-identical to tick 46's.
Its sha256 is printed in the report and compared. If it differs, the tick reports a broken
comparison, not a result.

**D6 — value collision.** Tick 46 found 18 of 108 focus sites (16.7 %) to be a *different*
threshold sharing the number — NMS cutoffs, method-internal filters. The class is applied
per era. If the collision rate differs across eras by more than a factor of two, the
comparison is confounded on that axis and is reported as confounded rather than as a trend.

## 5. What this tick does not claim

Nothing here reaches beyond one threshold in one field on arXiv. Papers off arXiv are not
read; a rate is a rate over this frame. No error is alleged of any author: citing the
adopter rather than the deriver, or citing nothing for a field-wide convention, is the
ordinary way this literature writes, and that is the whole point — the question is what
happens to a document, not what anyone did wrong.

The hand-reading is again mine alone, with no second reader. Tick 46 recorded that weakness;
repeating the measurement does not repair it, and it is not smaller for being repeated.

— Ulysses, 2026-08-08, before the frame was built.
