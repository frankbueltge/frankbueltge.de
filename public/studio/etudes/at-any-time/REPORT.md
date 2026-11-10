# *AT ANY TIME* — FORM ETUDES, build report

**These are ETUDES: bounded, discardable built sketches for the concept gate to judge probed form.
They are studies, not increment 1 of a work. Nothing here is judged aesthetically by this voice —
that is another voice's job. This voice built, measured, and reports.**

Built session 2026-07-31. Location: `etudes/at-any-time/`. Nothing in this directory or session was
committed to git (the conductor lands the session) and no PDF was committed into the repository.

---

## 0. Toolchain — what was copied, what was written

- `build/pdf-render-lib.js` — copied **unmodified, byte-for-byte** (`diff` confirmed identical) from
  `projects/no-part/build/pdf-render-lib.js`. Its `PDF_PATH` constant is fixed at
  `<its own dir>/../order-list.pdf`; since this etude renders 72 *different* single-page source PDFs
  (not one 39-page document), `build/render-all-pages.js` honours that fixed path by copying each
  cached source PDF's bytes to `etudes/at-any-time/order-list.pdf` immediately before calling
  `renderPage()`, and deletes that transient file the moment the whole batch finishes. That file does
  not exist in the committed tree (verified: no such file after every run).
- `build/canvas-lib.js` — also copied unmodified from the same source (`launchBrowser`,
  `runInCanvas`, `desaturateToGrayscale`): same in-browser-canvas-only discipline, no external image
  library anywhere on this machine.
- Everything else in `build/` (`analyze-corpus.js`, `fetch-pdfs.js`, `render-all-pages.js`,
  `column-html.js`, `capture-lib.js`, `measure-lib.js`, `e1-build.js`, `e2-build.js`,
  `bc4-phone-case.js`, `bc2-paper-edges.js`, `check-page-counts.js`) is new code written this session.
- Render scale throughout: the house's proven **4 px/mm to 864 x 1118 px per page-mark**, native
  display scale (no image re-encoding beyond the pipeline's own `canvas.toDataURL('image/png')`, plus
  the same colour-cast correction (`desaturateToGrayscale`) `render-sheets.js` applies).
- PDFs fetched via `build/fetch-pdfs.js` from the URLs in
  `projects/at-any-time/material/orders-2025-term.json`, cached at
  `/tmp/.../scratchpad/pdfs/<file>` (never committed). **Honesty note:** when `fetch-pdfs.js` ran this
  session it reported `0 fetched, 72 already cached` — the cache was already warm from earlier in this
  same environment session, so no live network fetch was directly observed for any of the 72 files
  *this run*. Spot-checked 3 files (`100625zr_3fbh.pdf`, `072826zr_8n5a.pdf`, `043026zr2_6479.pdf`)
  against a fresh `curl -I` HEAD request to the live `supremecourt.gov` URL: local byte count matched
  the live `Content-Length` exactly for all 3, and all 72 cached files begin with the `%PDF` magic
  bytes. Network access to `supremecourt.gov` was independently confirmed working this session
  (`HTTP/2 200`).

---

## 1. Corpus facts — measured by `build/analyze-corpus.js` (pure JSON analysis, no rendering)

| Fact | Value |
|---|---|
| Total Miscellaneous Order records | **72** |
| Distinct calendar dates carrying >=1 order (unit-days) | **55** |
| First order date / last order date | 2025-10-06 / 2026-07-28 |
| Full span (inclusive) | **296 calendar days** |
| Calendar days carrying >1 order (multi-order days) | **11** (2 orders x9 days, 3 orders x1 day [2026-07-28], 4 orders x1 day [2026-04-30], 5 orders x1 day [2026-05-21]) |
| Gap between consecutive order-dates: max | **20 days** (2026-03-20 -> 2026-04-09) |
| Gap between consecutive order-dates: median | **5 days** (2025-11-21 -> 2025-11-26) |

These figures were **independently re-derived from the filtered `records` array**, not copied from the
prior session's FEASIBILITY.md — they match it exactly, which is itself a cross-check of both.

**Cutoffs used for the three/four lengths** (all measured, all counted from `startDate = 2025-10-06`):

| Length tag | unit-days (n) | end date | calendar days in range | total documents in range |
|---|---:|---|---:|---:|
| 2 units (Etude 2 only) | 2 | 2025-10-08 | 3 | 2 |
| 8 units — "the door" | 8 | 2025-11-05 | 31 | 10 |
| ~25 units — "middle length" | 25 | 2026-01-16 | 103 | 29 |
| 55 units — full 2025-Term | 55 | 2026-07-28 | 296 | 72 |

---

## 2. Rendering — measured

Ran `build/render-all-pages.js` under `xvfb-run` (headful Chromium, `headless:false`, at
`/opt/pw-browsers/chromium-1194`), rendering **page 1 of all 72 cached source PDFs** at 4 px/mm:

- **Total render time: 172.2 s for 72 pages.**
- **Mean per-page cost: 2,389 ms/page.**
- All 72 outputs measured **exactly 864 x 1118 px** — no dimension variance.
- **0 shortfalls** (`shortfallPx` field, the LAST-PAGE DEFECT the pipeline flags) across all 72 — expected, since every request here is for page 1 of a single-page-request, never the final page of a multi-page navigation.
- **0 failures**, 0 retries needed.

This matches the prior session's proven ~2,095–2,400 ms/page range.

**Apparatus limitation, stated plainly:** whether any of the 72 source PDFs actually *contains* more
than one page was checked only by a cheap static regex over each file's raw bytes, looking for a
`/Type /Pages ... /Count N` page-tree entry (`build/check-page-counts.js`). That check was
**inconclusive for all 72 files** — it found no matching `/Count` token in any of them, almost
certainly because these PDFs' object dictionaries are stored in compressed object streams the regex
never decodes. **This is not a resolved finding; GATE-DOCKET item 8 remains open.** A rendering-based
check (navigating to `#page=2` and observing whether Chromium's PDF viewer throws or duplicates page 1)
would be more conclusive but was out of scope for tonight's two etudes and was not run.

---

## 3. THE STACKING RULE — how a day with more than one order is placed

**Verbatim, as implemented in `build/column-html.js`, re-runnable by an outsider:**

> A calendar day's slot is fixed at one page-height (864 x 1118 px at native 4 px/mm scale). When a
> date carries *k* > 1 Miscellaneous Orders, that slot is split into *k* horizontal bands, ordered
> top-to-bottom in the exact sequence the records for that date appear in
> `orders-2025-term.json`'s own `records` array (that file's stable listing order — reproduced by:
> `records.filter(r => r.kind === 'Miscellaneous Order' && r.date === D)`, in file order, no
> re-sorting). Band heights are `floor(1118/k)` for every band but the last, and
> `1118 - (k-1)*floor(1118/k)` for the last, so the bands sum to exactly 1118 px with no gap and no
> overlap. Each order's full rendered page is shown at the full 864 px native width, **non-uniformly
> scaled (vertically squeezed) to exactly fill its band's height** — the whole sheet, compressed,
> never cropped, never dropped, never omitted.

Example: 2026-05-21 carries 5 orders -> 5 bands of 223, 223, 223, 223, 226 px each (sums to 1118).

---

## 4. ETUDE 1 — THE EXTENT IMAGE

Built the real calendar-day column (real rendered pages at their dates, real blank 864x1118 white
slots elsewhere) for each length, via a live DOM page (not a hand-composited canvas — a 296-day column
at native scale is ~330,928 px tall, and a single `<canvas>` bitmap that size (864x330,928 ~ 286M
pixels) risks exceeding a 2-D canvas backing-store limit; a plain scrollable HTML page with one
`<img>`/`<div>` per day, screenshotted via a CSS `transform:scale()` on the whole column, avoided that
risk entirely and is arguably the more honest apparatus — the actual live page a visitor would enter,
not a static composite). Extent images use a 1280x800 viewport, `transform-origin:top left`, scaled so
the **whole** column fits inside that one viewport, screenshotted unscrolled. Native-entry stills use
the same column at 1x scale, screenshotted at scroll position 0 — literally the first viewport a
visitor would see on entry.

| Length | unit-days | calendar days | blank days | column height (px) | scale factor | page-mark height at scale (px) | blank : doc (day-count ratio) | extent white-pixel fraction |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **08 — the door** | 8 | 31 | 23 | 34,658 | 0.023083 | 25.81 | 2.875 | 0.999099 |
| **25 — middle** | 25 | 103 | 78 | 115,154 | 0.006947 | 7.77 | 3.120 | 0.999709 |
| **55 — full term** | 55 | 296 | 241 | 330,928 | 0.002417 | 2.70 | 4.382 | 0.999897 |

(330,928 px for the 55-length column independently reproduces the prior session's measured full-column
height exactly — a cross-check between two separately-built pipelines.)

**Files:** `e1-extent-08.png`, `e1-native-entry-08.png`, `e1-extent-25.png`, `e1-native-entry-25.png`,
`e1-extent-55.png`, `e1-native-entry-55.png`.

**A measured finding, not an aesthetic one:** the three native-entry stills (08/25/55) are
**bit-identical** (`sha256` verified) — the first viewport a visitor enters is pixel-for-pixel the same
regardless of how long the work has since grown, because it only ever shows the same first ~0.72 of
page 1. This is a direct, apparatus-measured demonstration of "length is not extent": the door does not
know, and cannot show, how long the corridor behind it has become.

At 55 units the extent image is 99.99% white by direct pixel count — every page-mark is compressed to
~2.7 px tall, indistinguishable from the surrounding blank in any single glance; at 8 units, individual
marks (25.8 px tall) remain visually separable from the blanks around them. Both are reported as
measured facts; whether either reading "succeeds" as extent is for the Dramaturg/Kritiker to judge.

---

## 5. ETUDE 2 — THE HOLE AND THE RATE

### 5a. Native mid-column gap stills

Built with `page.locator('#stage').screenshot()` (Playwright's element screenshot, which captures the
full element regardless of viewport size) at native 1x scale — real page, real gap, real page, no
scaling, no viewport clipping.

| Case | from -> to | gap (date-diff, days) | blank calendar days | column height (px) | blank px : doc px |
|---|---|---:|---:|---:|---:|
| **Longest gap** | 2026-03-20 -> 2026-04-09 | 20 | 19 | 23,478 | **9.5** |
| **Median gap** | 2025-11-21 -> 2025-11-26 | 5 | 4 | 6,708 | **2.0** |

(`gap (date-diff)` = the corpus's own convention, `date2 - date1` in days; `blank calendar days` =
`gap - 1`, the number of true blank slots between the two bounding order pages; `blank px : doc px` =
`blank calendar days x 1118 / (2 x 1118)` = `blank calendar days / 2`.)

**Files:** `e2-gap-longest-20d.png` (864 x 23,478 px), `e2-gap-median-5d.png` (864 x 6,708 px).

### 5b. Extent images at 2 / 8 / 55 units

Built exactly as in Etude 1 (S4). The 8- and 55-unit extents are the same code path and — for the
08 length — byte-identical to Etude 1's (`sha256` match confirmed); the 55-length pair differ by **1
pixel out of 1,024,000** between the two separately-run builds (see S7, apparatus note) — harmless to
every reported measurement.

| Length | unit-days | calendar days | blank days | column height (px) | scale | blank : doc (day-count ratio) | extent white-pixel fraction |
|---|---:|---:|---:|---:|---:|---:|---:|
| **02** | 2 | 3 | 1 | 3,354 | 0.238521 | 0.500 | 0.994462 |
| **08** | 8 | 31 | 23 | 34,658 | 0.023083 | 2.875 | 0.999099 |
| **55** | 55 | 296 | 241 | 330,928 | 0.002417 | 4.382 | 0.999897 |

**Files:** `e2-extent-02.png`, `e2-extent-08.png`, `e2-extent-55.png`.

**Rate, measured:** the blank:document ratio rises monotonically with length — 0.5 -> 2.875 -> 4.382 —
because the corpus's median gap (5 days => 4 blanks between 2 pages) is already above parity, and every
additional unit-day admits, on average, more blank days than the one before it. That rising ratio *is*
the measured rate; a 2-unit view (ratio 0.5) cannot show it, an 8-unit view only begins to, and the
55-unit view shows it near its asymptote for this corpus.

---

## 6. BINDING CONDITION 4 — "the phone is decided first"

*(Added mid-session per the conductor's addendum; folded into Etude 2 as instructed.)*

Built with `build/bc4-phone-case.js`: the entrance page (2025-10-06, the corpus's first order) and a
mid-column page (2026-02-10, the 28th of 55 unit-days — the corpus's middle date by index) as a plain
`<img style="width:100%">` — the one markup that requires **no operated affordance** (no pinch-zoom, no
horizontal drag, no tap-to-enlarge control exists anywhere in this HTML) — at a 390x844 viewport, at
`deviceScaleFactor` 1 and 2. Apparent type size was **measured directly from the screenshot pixels**: a
row-luminance scan (threshold 128) finds contiguous horizontal ink bands (text lines), and each band's
pixel height divided by dsf is its CSS-px height.

| Case | dsf | screenshot (physical px) | line-bands detected | line-band height, CSS px: min / median / max |
|---|---:|---|---:|---|
| entrance | 1 | 390x844 | 6 | 4 / **5** / 5 |
| entrance | 2 | 780x1688 | 7 | 0.5 / **5** / 6 |
| mid-column | 1 | 390x844 | 9 | 1 / **4** / 5 |
| mid-column | 2 | 780x1688 | 8 | 4.5 / **5** / 6 |

**Files:** `e2-phone-entrance-dsf1.png`, `e2-phone-entrance-dsf2.png`, `e2-phone-midcolumn-dsf1.png`,
`e2-phone-midcolumn-dsf2.png`.

**Reported plainly:** the median line-band height lands at **4–5 CSS px** at both dsf 1 and 2 (as
expected — CSS px is device-independent; dsf changes physical resolution, not the CSS-px measurement).
Whole page width fits the 390 px viewport with no horizontal overflow at all (page CSS height at this
fit ~= 390 x 1118/864 ~= 505 CSS px, comfortably under the 844 px viewport — the whole single-page order
fits vertically too, with no scroll needed for one page). **No operated affordance is required to see
the whole sheet — but the measured 4–5 CSS px line height is far below any commonly cited minimum for
legible body text (~11–16 CSS px is the usual working floor); at this size the Court's printed text is
not legible to an unaided human eye at normal viewing distance,** on the measured numbers alone. The
answer to the binding condition's second clause — "if the answer is horizontal drag, the concept
returns" — is that horizontal drag was never needed; the cost fell entirely on type size instead.

---

## 7. BINDING CONDITION 2 — "the paper is continuous and its edges are visible everywhere"

*(Added mid-session per the conductor's addendum.)*

Built with `build/bc2-paper-edges.js`: the full 55-unit / 296-day column (real pages, real blanks,
native 1x scale, 864 px wide) on a **mid-grey `rgb(128,128,128)` ground** — scaffolding for this test
only, not part of Etude 1/2's own "nothing added" column (see S4) and not a claim about the finished
work's design; documented here as a build choice, nothing more. Loaded at a 1280x800 viewport (column
centred, 208 px of ground visible on each side by construction). Took 20 evenly spaced scroll positions
across the full scrollable range (0 -> 330,128 px) plus a 21st at the vertical middle of the corpus's
longest gap (day-index between 2026-03-20 and 2026-04-09), and at each, sampled row y=400 (viewport
middle) for the paper's left/right edge x-position against the grey ground (tolerance +/-12 per channel).

**Result: all 21/21 positions show both edges.** Left edge measured at **x=208**, right edge at
**x=1071** (864 px wide), at *every single one* of the 21 positions, including the one inside the
20-day gap (where the "paper" at that row is a blank white slot, not a rendered order — it still reads
as a paper-white 864 px rectangle against the grey ground, edges intact).

| # | scroll Y (px) | left edge x | right edge x | paper width (px) | both edges visible |
|---:|---:|---:|---:|---:|---|
| 0 | 0 | 208 | 1071 | 864 | yes |
| 5 | 86,876 | 208 | 1071 | 864 | yes |
| 10 | 173,752 | 208 | 1071 | 864 | yes |
| 19 | 330,128 | 208 | 1071 | 864 | yes |
| 20 (longest-gap middle) | 195,809 | 208 | 1071 | 864 | yes |

(Full 21-row table in `build/bc2-measurements.json`; all 21 rows report identical edge positions — the
layout never drifts at any scroll depth tested.)

**Files committed** (5 of 21, per the instruction that a representative few suffice):
`bc2-scroll-00-even.png`, `bc2-scroll-05-even.png`, `bc2-scroll-10-even.png`,
`bc2-scroll-19-even.png`, `bc2-scroll-20-longest-gap-middle.png`.

---

## 8. Apparatus honesty notes — what did not go as asked, stated plainly

1. **Page-count check inconclusive** (S2) — GATE-DOCKET item 8 ("does any of the 72 orders run to more
   than one page?") is **not resolved** by this session. The regex-based static check found no `/Count`
   token in any of the 72 cached PDFs (almost certainly stored in compressed PDF object streams the
   regex doesn't decode) — not a "no," an "unmeasured." A rendering-based check was not run.
2. **Chromium's overlay scrollbar produced a small nondeterminism.** The first pass of Etude 1 produced
   three native-entry stills that were expected to be bit-identical (same first ~800px of the same
   starting column) but were not: 24 of 1,024,000 pixels differed, confined to a 9x5 px patch at
   viewport coordinates x:1268–1276, y:31–35 — well outside the 0–864 px column itself, consistent with
   an overlay-scrollbar rendering artifact triggered by the underlying (unscrolled) page being taller
   than the viewport. Fixed by adding `::-webkit-scrollbar{display:none}` / `scrollbar-width:none` to
   the column's CSS; after the fix, all three stills are `sha256`-identical. This was found and fixed,
   not silently worked around — recorded here because "determinism is law" and the first attempt
   wasn't quite that.
3. **A residual 1-pixel difference at extreme downscale.** `e1-extent-55.png` and `e2-extent-55.png` —
   built by separately-run scripts using the identical column-building code, identical inputs, and an
   identical (0.002417...) scale factor — differ by exactly 1 pixel (of 1,024,000) at coordinate (0,5),
   likely floating-point/sub-pixel-rendering nondeterminism at that very small transform scale. Left
   unresolved (not chased further); it changes the reported white-pixel fraction by at most 1 part in
   1,024,000, i.e. nothing at the precision reported.
4. **A giant single `<canvas>` bitmap was deliberately avoided** for the 296-day column (864 x
   330,928 px ~ 286M pixels would approach or exceed common 2-D canvas backing-store limits and a
   >1 GB uncompressed bitmap) — built as a live scrollable DOM page instead (one `<img>`/`<div>` per
   calendar day), matching the prior session's own finding that a DOM element holds up to
   33,554,428 px without collapse. This is a design choice, not a failure, but is recorded here because
   it changes what "the real apparatus" means for the extent image: a live page transformed and
   screenshotted, not a hand-composited raster.
5. **The corpus JSON's date range extends into 2026,** past this session's real calendar date
   (2026-07-31); this etude treats `orders-2025-term.json` as the fixed, given material throughout and
   makes no claim about it beyond what the file itself states.

---

## 9. File manifest

```
etudes/at-any-time/
  REPORT.md                              (this file)
  e1-extent-08.png            e1-native-entry-08.png
  e1-extent-25.png            e1-native-entry-25.png
  e1-extent-55.png            e1-native-entry-55.png
  e2-extent-02.png            e2-extent-08.png            e2-extent-55.png
  e2-gap-longest-20d.png      e2-gap-median-5d.png
  e2-phone-entrance-dsf1.png  e2-phone-entrance-dsf2.png
  e2-phone-midcolumn-dsf1.png e2-phone-midcolumn-dsf2.png
  bc2-scroll-00-even.png      bc2-scroll-05-even.png
  bc2-scroll-10-even.png      bc2-scroll-19-even.png
  bc2-scroll-20-longest-gap-middle.png
  build/
    pdf-render-lib.js       (copied unmodified from projects/no-part/build/)
    canvas-lib.js           (copied unmodified from projects/no-part/build/)
    analyze-corpus.js       (corpus filtering / gap / cutoff analysis)
    fetch-pdfs.js           (PDF fetch + cache, never commits PDFs)
    render-all-pages.js     (renders all 72 pages via pdf-render-lib.js)
    check-page-counts.js    (inconclusive page-count probe, see S8.1)
    column-html.js          (calendar-day column builder + stacking rule)
    capture-lib.js          (Playwright screenshot helpers)
    measure-lib.js          (white-fraction / paper-edge pixel measurement)
    e1-build.js             (Etude 1 driver)
    e2-build.js             (Etude 2 driver)
    bc4-phone-case.js       (binding condition 4 driver)
    bc2-paper-edges.js      (binding condition 2 driver)
    *.json                  (measurement outputs — corpus-analysis, render-log,
                             e1/e2/bc2/bc4-measurements, page-count-check)
```

No PDF file is committed anywhere in this tree. All PNGs above total **912 KB**.
