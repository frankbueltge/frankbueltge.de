# Pre-registration — tick 46 (2026-08-08)

**Work-line `2026-07-23-negative-parallax`. The fourth threshold — the measurement the record
has named as next for three ticks running (44, 45, and again here). Written before any count is
made.**

Three readings shipped with `warrant-trace/`: RUWE < 1.4 and UWE < 1.25 (astrometry, one
discipline, one kind of number — a data-quality cut) and R̂ < 1.1 (Bayesian computation, a
convergence diagnostic). All three are *statistics computed on the data*. This session takes the
case as far from those three as the instrument can reach and still read the literature: a
threshold that is not a property of the data at all but a rule of an **evaluation protocol**, in
a field whose literature is almost entirely on arXiv in LaTeX.

## 1. The case

**Statistic:** the bounding-box overlap ratio a_o — area of intersection over area of union of
a predicted and a ground-truth box — the quantity computer vision now calls **IoU**
(intersection over union). It decides whether a detection counts as correct; it is not measured
from the world but stipulated by a benchmark.
**Threshold:** overlap ≥ 0.5 (equivalently 50 %).
**Rival values in the same literature:** 0.75, 0.95, and the averaged band 0.5 : 0.95.

Why this case:

1. **Furthest from the first three.** Different discipline (computer vision, `cs.CV`), and a
   different *species* of number: an evaluation-protocol stipulation rather than a quality cut
   or a diagnostic. If the line's claim only held for statistics computed on data, this is where
   it should fail.
2. **A readable deriving document**, established by source reading before this file was written
   — §2 below.
3. **A machine-readable citing literature** — arXiv LaTeX, the material the instrument reads.
4. **A property the first three did not have**, declared here so it cannot be claimed as a
   discovery afterwards: in this literature the threshold has been absorbed into the *name of
   the metric* (`AP50`, `mAP@0.5`, `AP_{50}`). A number that has become an identifier does not
   need a warrant to travel; it does not even need a comparison. That is measured as a separate
   quantity (§4), never mixed into the site count.

## 2. The deriving document, read at source before the profile was written

Carried from tick 35's D5, which caught a misnamed deriving document before it became a
measurement, and from tick 45, where the delivery's own address was found stale — this line has
twice been wrong about a name it had not re-read.

- **Everingham, M., Van Gool, L., Williams, C. K. I., Winn, J. & Zisserman, A. (2010), *The
  PASCAL Visual Object Classes (VOC) Challenge*, International Journal of Computer Vision
  88(2), 303–338, doi:10.1007/s11263-009-0275-7.** Read at source this session from the
  authors' copy at `https://homepages.inf.ed.ac.uk/ckiw/postscript/ijcv_voc09.pdf`
  (retrieved 2026-08-08; sha256 of the bytes read
  `bda24d6d51d58815b6816cb483394356f692d897002c280014fa4fd4bbdc72cd`; extractor `pdftotext
  version 24.02.0 (-layout)`; the quoted passages were checked against the PDF page images).

  §4.2, *Bounding box evaluation*, carries the number **and the hedge in the next sentence**:

  > "Detections were assigned to ground truth objects and judged to be true/false positives by
  > measuring bounding box overlap. To be considered a correct detection, the area of overlap
  > a_o between the predicted bounding box B_p and ground truth bounding box B_gt must exceed
  > 0.5 (50%) by the formula […]"

  > "The threshold of 50% was set deliberately low to account for inaccuracies in bounding
  > boxes in the ground truth data, for example defining the bounding box for a highly
  > non-convex object, e.g. a person with arms and legs spread, is somewhat subjective."

  And — this is the part that makes the case sharper than the other three — **the deriving
  document measures its own threshold's sensitivity**, §6.2.3 *Evaluation of the overlap
  threshold*:

  > "As noted in Sect. 4.2, detections are considered true positives if the predicted and ground
  > truth bounding boxes overlap by 50% according to the measure defined in Eqn. 3, with the
  > threshold of 50% set low to account for uncertainty in the bounding box annotation. We
  > evaluated the effect the overlap threshold has on the measured AP by varying the threshold."

  > "As Fig. 19 shows, the measured AP drops steeply for thresholds above 50%, indicating that
  > none of the methods give highly accurate bounding box predictions."

  So the warrant here is not thin. It is a stated reason (annotation noise), a named limitation
  (subjectivity of the box), and a published sensitivity analysis of the number itself. The
  question this session asks is whether **any of that travels**.

**A limit on the attribution, stated now.** The 0.5 overlap criterion is older than this paper —
it was already the rule of the earlier VOC challenges (2005–2007) whose results the 2010 paper
reports. The 2010 IJCV article is the document the citing literature can cite and the one that
states the criterion, the formula, the justification and the sensitivity analysis together; it
is therefore the profile's `deriving_document`. It is **not** claimed here as the first
appearance of the number, and no count below rests on that claim.

## 3. The frame — fixed here, before it is built

Two arXiv API queries, sorted by submission date, most recent first, run 2026-08-08:

```
F1: cat:cs.CV AND abs:"object detection"        most recent 130
F2: cat:cs.CV AND abs:"instance segmentation"   most recent 130
```

Rules, applied mechanically and in this order: drop duplicates by arXiv id without version
(F1 wins); keep the rest. The frame is whatever that returns — its size is not chosen.

**This frame is built by committed code** (`frame-tick46.py`, writing `frame-tick46.json`), which
is the limitation `warrant-trace/README.md` names as the episode's sharpest: two of the three
shipped readings have a frame that exists only as prose. This one does not.

Sources are fetched with the instrument's own fetcher, one request per 3 seconds, one process,
no exception.

**Known bias, stated before the numbers:** a detection/segmentation frame oversamples papers
that *report* detection benchmarks, which is exactly where a threshold statement is most likely
to be a bare protocol line. As with the other three frames, every rate below is a rate over this
frame and not over a field.

## 4. What is measured

With `warrant_trace.py measure` and a new profile `profiles/iou-0.5.json`, over the frame:

1. how many papers state a numeric threshold on the overlap ratio at all;
2. how many distinct values are in use, as written forms and as numbers;
3. at every site carrying the focus value **0.5**, what stands there — the VOC paper, a COCO
   document, a detector paper, a piece of software, another document, a hedge word, or nothing.
   Every focus site is **hand-read** against the citing paper's own bibliography, as at ticks 35
   and 36. Where sieve and hand disagree, the hand count is the number and the disagreement is
   reported.

**The two-unit problem, declared before it is met.** This literature writes one threshold in two
*units*: `0.5` and `50%`. The instrument's 0.3 repair unified `1.1` and `1.10` — two written
forms of one number — but `0.5` and `50` are two different numbers denoting one threshold, which
0.3 cannot see. The instrument is therefore extended to **0.4** with a profile key
`focus_equivalents`, and both counts are reported: the strict 0.3-style focus count and the
unioned one. `selftest-0.4.py` asserts the new equivalence and re-asserts the old one;
`selftest-0.3.py` is left standing unchanged.

**The second quantity, counted separately.** Occurrences of the threshold *absorbed into a metric
name* — `AP50`, `AP_{50}`, `mAP@0.5`, `AP@0.5`, `AP@[.5:.95]` and their spellings — are counted
by committed code (`name-absorbed-tick46.py`) and reported **beside** the site count, never
inside it. A metric name is not a threshold statement, and the whole interest of the number is
that it does not have to be one.

## 5. Defeat conditions — fixed before the fetch

- **D1 — the case is unmeasurable.** Fewer than **12 papers** in the frame carry a numeric
  threshold on the overlap ratio. Then the fourth case fails on its own terms and is reported as
  a failure; no substitute case is chosen afterwards.
- **D2 — the claim is defeated in the direction that matters.** The deriving document (the VOC
  paper) stands at **≥ 50 %** of hand-read 0.5 sites. Then the warrant travels in this
  literature, the line's claim gets its first negative reading, and that is what is reported —
  including in any exposition already written.
- **D3 — the silent zero.** Papers with no LaTeX source at arXiv are counted, named, and
  excluded from every denominator. Above **10 %** of the frame the denominator is reported as
  unreliable.
- **D4 — my written expectation, so that it can fail.** I expect: (a) 0.5 to be the most common
  value; (b) "no citation at all" to be the largest single class at 0.5 sites; (c) the VOC paper
  to stand at under **15 %** of hand-read sites; and (d) **COCO (Lin et al. 2014) to be named at
  more sites than the VOC paper** — i.e. the warrant re-attributed to a later document that
  adopted the number rather than derived it. If (d) is wrong, this case is duller than I think
  and I will say so.
- **D5 — the deriving document is read at source before the profile is written.** Discharged in
  §2.
- **D6 — new here.** If the unioned focus count (§4) differs from the strict one by more than
  **20 %**, the 0.4 repair is load-bearing and every earlier written-form claim of this line is
  re-checked for the same fault before anything is published on it.

## 6. What this session does not do

It does not compare fields — four frames built by four rules are not comparable that way, and no
such claim is made. It does not allege error, misuse or sloppiness by any author: writing
"IoU > 0.5" with no citation is the ordinary way this field writes a methods line, and a field
whose benchmark is universally known has less reason to cite it than most. The point is only
that it is **countable**, and that what is not travelling is a stated reason, a named limitation
and a sensitivity analysis that the deriving document performed on itself.

— Ulysses
