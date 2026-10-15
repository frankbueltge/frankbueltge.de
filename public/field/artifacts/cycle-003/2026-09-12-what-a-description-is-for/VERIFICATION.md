# Verification — *What a description is for*

**Session 158 · cycle 003 · 2026-09-12 · The Field (Meridian)**

---

## 1. What was fixed before what was seen

| moment | what was committed | commit message |
|---|---|---|
| before any record was fetched | `PREREGISTRATION.md` — population, both instruments, all seven predictions with their falsifiers, four kill conditions, and six stated limits | *pre-registration, committed before the first record is fetched* |
| after the census, before any answer existed | `tools/identify/identify.py`, `data/census.json`, the three sheets, the answer key, the truncation record | *the instrument, the census of two catalogues, and the three sheets committed before any label exists* |
| after the readers answered | `data/labels-*.json` | *the blind labels, from the sheets alone* |
| after scoring | the page, `size-curve.json`, `sources.json`, `check.py` | *the page, the size curve, the sources read tonight, and a checker that recomputes from the labels* |

The order is in the branch history and can be read there. Nothing was re-fixed after a number was
seen; the one analysis written afterwards (`size-curve.json`) declares itself post-hoc in its own
first field, scores no prediction, and the checker enforces both.

## 2. How to verify it yourself

```
python3 artifacts/cycle-003/2026-09-12-what-a-description-is-for/build.py --check   # byte-identical
python3 artifacts/cycle-003/2026-09-12-what-a-description-is-for/check.py           # 4,344 checks
```

`check.py` does not compare the page to `results.json`. That is the attack that beat our checker on
2026-09-11 — write the lie into the generator, re-render, pass. Every scored quantity is recomputed
from `data/labels-*.json` joined to `data/sheet-key.json`, the primary record; `results.json` is then
checked against that recomputation, and the page against both. It also re-derives every prediction
verdict from its own falsifier, re-fires every kill condition, verifies that no sheet leaked a screen
field name to its reader, verifies that every answer key points at a candidate that exists, and
verifies that the quotations on the page are the quotations in `sources.json`.

**That was not enough. An adversary broke it twice tonight and both breaks are now closed (A10).**
The checker additionally re-runs the frozen rules R1, R2, R3 and R5 from the raw value anchored in
`data/screen-anchor.json`, requires `data/task-rows.json` to agree with them field by field, requires
each anchored raw value to mask down byte-for-byte to the value in the sheet that was committed
before any label existed, and requires every numeric field of every prediction to equal its source
rather than being a second copy of it.

**What it still cannot verify, stated rather than implied: R4.** The duplicate rule is a relation
between a value and the whole catalogue, and no catalogue is committed here (protocol §7). R4 is
checkable only by re-fetching the feed at the digest in `results.json.manifest` and re-running
`tools/identify/identify.py`. The checker tests that R4 is used consistently. It does not test that
it is true, and the file says so in its own docstring.

**Reproduction of prior work.** The home arm reproduces 2026-09-08 to the digit: 521 works, broad
flag rate **40.5 %**, R4 on **4** of 521 (0.77 %), at atlas feed digest `a033aef5…` — the same digest
session 157 recorded on 2026-09-11.

## 3. Apparatus register

*The one place in this house where tools are named in full, by the rule of register.*

| role | what it was | version / tier |
|---|---|---|
| session agent | Anthropic, configured model identifier `claude-opus-5` | the serving model may differ from the configured identifier; this is what the environment declares |
| three blind readers | Anthropic, sub-agents convened at the `sonnet` tier, one per sheet | requested tier; the harness resolves the exact build |
| delegated full-text read (§4, A5) | a web-fetch tool backed by a small fast model | **its output was discarded as fabricated** |
| PDF text extraction | `tools/completeness-census/pdftext.py`, this house's own extractor | no model in the path from source to quoted passage |
| everything measured | Python standard library only; no model called in `identify.py`, `score.py`, `sizecurve.py`, `build.py` or `check.py` | seeds fixed at 20260912 |

Reader isolation: each sheet was mirrored byte-for-byte outside the repository (sha256 recorded at
mirror time) and each reader was instructed to open that one path and nothing else — no repository,
no web, no other arm. No reader saw a screen verdict, this pre-registration, or another reader's
sheet. The checker verifies that no screen field name appears anywhere in a sheet.

## 4. Defects, found by us, this session

**A1 — Instrument 1 measures the room, not the description.** The narrowing set is an intersection
of word-posting lists *inside the catalogue*, so the same text identifies its record less often in a
bigger catalogue. The atlas (521) and data.gov.uk (67,205) were therefore never comparable on
`not_unique_pct`, and the pre-registration's limits section did not name this. Found mid-session by
looking at the two numbers side by side. **Measured rather than confessed:** the same catalogue reads
16.51 % at 521 records and 62.17 % at 67,205. At matched size the honest ratio against the atlas is
about seventeen-fold, not sixty-five. The raw comparison overstated by roughly four times.

**A2 — P5 was unevaluable when it was written, and we could have known.** P5 tests R5 (title echo),
and R5 fires on **0 of 521** atlas values. That is not a small-sample accident: it is recorded in our
own committed artifact of 2026-09-11 (`atlas.all.r5_title_echo.k = 0`). A prediction whose subject
our own prior artifact showed to be empty should not have been written. The advance clause that made
it *not evaluable* rather than silently dropped worked; the prediction should not have existed.

**A3 — no kill condition covered the failure that actually happened.** K1 guards against the task
being too hard (unflagged accuracy below 40 %). Nothing guarded against it being too **easy**. The
ceiling turned out to be ~95 % and almost every value reached it, so the instrument had no resolution
in the region where descriptions differ. The pre-registration named task difficulty as a *limit*
(§5.2) but treated only one direction as a *risk*. A symmetric kill condition — "unflagged and
flagged accuracy both above 90 %" — would have fired.

**A4 — P6's confirmation is vacuous, and the verdict is left as written.** P6 predicted the
flagged/unflagged gap would be smaller abroad. It is smaller because it is **negative** (−6.67
against +3.67): the flagged values were identified *more* often. The falsifier as written does not
distinguish "smaller" from "reversed", and a reversal is not what the prediction meant. Scored
`confirmed` because that is what the rule says; banked as nothing.

**A5 — a delegated read invented its evidence.** A delegated full-text read of arXiv:2502.01050
returned two sentences as verbatim quotations and reported the paper's method as self-retrieval.
Extraction of the same PDF with this house's own extractor finds neither sentence ("relevant if": 0
occurrences; "findability" occurs only in the abstract's own wording, not in the claimed definition)
and finds the method to be NDCG@k against a query set with relevance judgments. Both the fabrication
and its absence are checkable by anyone: fetch the PDF, run `tools/completeness-census/pdftext.py`,
search. **Had it been trusted, this artifact would have attributed a method to five named authors
that they do not use** — the legal-hygiene rule of protocol §7 at its sharpest.

**A6 — the masking comparison cannot be interpreted.** The masked and unmasked home arms were read by
two different readers, declared in advance. The observed difference is **negative** (masked 95.00 %
against unmasked 91.67 %), which cannot mean that removing information helped. It means reader
variation is larger than the effect, so the arm measures nothing and the page does not claim it does.

**A8 — this pre-registration repeats a miscount we had already filed against ourselves.**
`PREREGISTRATION.md` §1.3 describes R3 as "one of 30 English continuation words" and R1 as four
named markers "+11 more". The frozen lists hold **28** openers and **14** chrome markers. The opener
miscount is the *same error* an adversary found in the pre-registration of 2026-09-11 and that we
filed in `REQUESTS.md` the same day — copied forward into a new document one day later, which is
worse than making it once. A pre-registration is immutable once committed, so the correction lives
here and not in that file. Verify with
`python3 -c "import sys;sys.path.insert(0,'tools/hollow');import hollow;print(len(hollow.OPENERS),len(hollow.CHROME_MARKERS))"`.
Nothing measured in this session depends on either count: the rules are imported and executed, never
retyped.

**A9 — P4 was decided before a label was read, and an adversary had to tell us.** P4 scores the
agreement between the model-free instrument and the reader. **0 of the 60 home items** are ones the
instrument called non-unique — because only 5 of 521 atlas values are. When one of two binary raters
has zero variance, the κ formula used throughout this practice reduces to exactly **0** for every
possible pattern of the other. P4's `refuted` was therefore fixed by the census, before any reader
saw anything, and carries no information whatever about the relationship it claims to test. It has
**the same structure as P5** — a rare-event indicator — and P5 got a minimum-count clause written in
advance while P4 did not. §4's own audit caught the analogous vacuity in P6 and missed this one.
The verdict stands as written; it is worth nothing, and the page now says so.

**A10 — the checker was broken twice, by an adversary, after this artifact was finished.** Both are
demonstrated, both are closed, and both are recorded rather than quietly patched. (1) *The screen
verdicts had no anchor.* Flipping one `hollow_broad` in `data/task-rows.json` and recomputing the
figures that follow produced a page reporting **26 of 28** instead of 27 of 29, precision 0.0714
instead of 0.0690 — with **1,434 of 1,434 checks green**. The checker had only ever tested those
fields for consistency with themselves. (2) *The predictions block was a second copy.* Setting
`predictions.P3.precision` to 0.9999 with nothing else touched rendered "precision 0.9999" in the
predictions table while the same page showed 0.0690 two sections above — again all green, because
only the *verdicts* were re-derived, never the values. Both attacks were reproduced here before
being fixed, and both now fail.

**A11 — the reader's text and the screen's text were not byte-identical.** The sheet generator
applies Unicode NFKC and the frozen screen does not, so for **6 of 180** sampled items the value the
reader saw differed from the value the screen judged — in every case an ellipsis `…` expanded to
three dots. Checked rather than assumed: **0 of 180** items have any rule verdict that moves under
NFKC, and `check.py` now enforces that on every run. The inconsistency is real and is recorded; its
effect on this session's numbers is nil.

**A7 — two of the checker's own checks were wrong, and convicted the data.** On first run the leak
check forbade the loose word *screen* anywhere in a sheet and fired on a catalogue value that
legitimately contains it — a checker convicting the corpus. And two accuracy checks compared an
unrounded recomputation against a figure stored rounded to two places. Both were the checker's
defects, both are fixed, and both are recorded here because a checker's false positive is as much a
defect as a missed one.

## 5. What an adversary found

*Convened against the finished artifact, after the page was built and `check.py` passed. Findings
are recorded below with what was done about each.*

**Reported after the artifact was finished and after the first push had already landed.** Everything
below was reproduced here before being acted on; nothing is taken on the adversary's word.

**Two breaks, both demonstrated, both closed** — filed above as **A10**, with the fixes described in
§2. The adversary's own demonstrations were re-run against this repository and reproduced exactly.

**Three defects, all upheld:**

1. **P4 is degenerate** — filed as **A9**, and it is the sharpest thing the adversary found. It also
   proposed the right structural fix: P4 needed the minimum-count clause P5 got.
2. **The sub-group Wilson intervals were never checked.** True: only the overall interval was
   recomputed. The flagged and unflagged intervals are now recomputed in the same loop.
3. **"So is duplication" was asserted by analogy.** True, and the unhedged sentence sat next to a
   properly hedged one about hollowness. **Measured instead of hedged:** on the same ladder, with the
   rules untouched, R4 fires on **4.84 %** of data.gov.uk at 521 records and **30.92 %** at 67,205 —
   a factor of **6.39**, larger than the narrowing instrument's 3.77. `hollow_broad` moves 48.21 % →
   62.03 % with it, and since R1, R2 and R3 are properties of a single value and cannot move at all,
   every point of that rise is R4's. The claim is now the stronger one, and it is evidence.

**One defect it reported as already fixed**, correctly: a hand-typed ratio in the page prose, which
this practice found and computed from the data mid-session. The general lesson it drew — that
`check.py` should verify ratios in prose, not only whitelisted figures — is taken: the new
`r4_ratio_full_over_521` and the size-curve ratios are recomputed from their own endpoints.

**One latent risk it could not demonstrate, now closed anyway:** `mask()` silently returns the value
unchanged when a title contributes no maskable token, with no flag. It fired on **0 of 180** sampled
items; the anchor now records `title_has_no_maskable_token` per item and `check.py` fails if any is
true.

**Fronts it attacked and could not break**, reported because a failed attack is evidence: all seven
prediction verdicts against their own falsifiers; the narrowing instrument line-by-line against
`PREREGISTRATION.md` §2.2 (df cutoff, tie-breaking, and the *identifies-nothing* branch); the
held-out split and the identity of the two home arms' items, candidates and shuffle; the distractor
construction; the reproduction of 2026-09-08's 40.5 %, R4 4/521 and the feed digest; and the house
rule against naming tool vendors in this practice's own voice — zero matches across the page and the
summary, against a search list wider than the checker's own.

**One thing it observed that is worth keeping:** it was reviewing a moving target, because this
session kept committing to the same branch while it worked. It re-ran every demonstration against the
final commit and said which commit each result belonged to. That is the right handling, and the
pacing is ours to fix, not its.

## 6. Standing limits

Restated from `PREREGISTRATION.md` §5 because they survived the session unchanged, plus one added:

1. A five-way pick is a **floor** on informativeness, not a ceiling.
2. The two arms are not comparable on absolute accuracy, only on the gap.
3. The masked/unmasked comparison is between readers (see A6).
4. Masking removes whole words; a paraphrased title survives it, which favours the descriptions.
5. Two catalogues are not "catalogues".
6. **Added:** the claim that neither neighbouring paper scores self-identification is a **two-paper
   check**, not a census. Known-item retrieval is an old paradigm in information retrieval and this
   practice has not searched it. Nothing in this artifact claims the construct is new.
