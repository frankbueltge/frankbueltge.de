# *AT ANY TIME* — FORM ÉTUDES, second build report

**These are ÉTUDES: bounded, discardable built sketches for the concept gate. This voice builds,
measures, and reports — it does not judge the work aesthetically.**

Built session 55, 2026-07-31. Location: `etudes/at-any-time/`. Nothing committed to git by this voice;
no PDF committed into the repository. Closes exactly three items from
`projects/at-any-time/STAGING-RULING-2.md` §15: **item 1** (adopt the non-paper ground), **item 2**
(column at 390 px), **item 4** (strike leaked dates). Items 3, 5, 6, 7 explicitly **not attempted** —
recorded as not reached.

> *Conductor's note on this file: the Builder was blocked by a tool-level restriction from writing its
> own report to disk and returned the full text instead. It is written here verbatim, unedited, by the
> conductor. The measurements in §2 were independently re-derived by the conductor with its own PNG
> decoder before this file was written — see the gate ruling.*

## 0. Session-start facts

- The previous session's scratchpad no longer exists in this container. All 72 PDFs were **re-fetched**
  and all 72 pages **re-rendered** into this session's scratchpad (`build/g-fetch-pdfs.js`,
  `build/g-render-all-pages.js` — retargeted copies of the originals, method unchanged).
- **Fetch honesty note:** `supremecourt.gov` rate-limited this session — first pass returned `HTTP 403`
  for 18/72 files (always a clean 403, never a connection failure). Five retry passes recovered all 18;
  final state 72/72 cached, each confirmed non-empty. No file fabricated or substituted.
- Render pipeline reused verbatim, unmodified. One run was deliberately killed by a 2-minute tool
  timeout partway through; a stale `g-render-log.json` briefly showed a misleading `failed` list from
  that killed process — the finishing run's own console output is the true record: 72/72 PNGs present
  and non-empty, confirmed by a direct file-existence sweep against the corpus's file list.
- `corpus-analysis.json` re-run independently this session; reproduces every corpus fact from
  `REPORT.md` §1 exactly (72 orders, 55 distinct dates, 296-day span, max gap 20 days
  2026-03-20→2026-04-09, median gap 5 days 2025-11-21→2025-11-26, cutoffs n=8/25/55).

## 1. TASK 1 — THE ADOPTED GROUND (§15 item 1)

**Built:** `build/g-column-html.js` — copies the stacking rule/band logic verbatim from
`column-html.js` with exactly three changes: (1) grey `rgb(128,128,128)` ground replacing `#fff`;
(2) `margin:0 auto` centring reproducing x=208/x=1071 by construction; (3) no `data-date`/`data-docs`
written at all. `build/g1-ground-build.js` builds entrance stills (1280×800, scroll 0) and extent
stills (whole column scaled to fit) at 8/25/55 unit-days, plus the longest (20 d) and median (5 d) gap
**traversed**.

**Method choice recorded:** the old gap stills were an *element* screenshot of `#stage` alone, which
excludes anything outside that box — repeating that method would exclude the ground entirely. Used a
**full-page** screenshot (1280 px width, native 1×) instead, so ground actually appears; the two new
gap stills are shot by the same method as each other.

**Entrance stills** (`g-entry-08/25/55.png`, 1280×800): all three **byte-identical** (sha256
`d51cbe52…`), reproducing the "entrance never changes" finding. fraction<lum250 = 0.338138, darkest px
= 0, ground sample = 128.0, paper edges at row 400 = x=208…x=1071 (864 px), all three lengths identical.

**Old-vs-new, entrance:** re-measured old `e1-native-entry-08.png` with identical code: fraction<250 =
0.013138, darkest=0, corner=255, and at row 400 **the only pixel-column differing from white in the
entire 1280 px row is x=863** (the sheet's printed frame) — no left edge exists at all, paper and void
are the same white. **The new ground fixes this decisively:** both true edges (x=208, x=1071) are
directly measurable at every length. The "fraction<250" number itself is not independently informative
once grey is in frame (jumps 1.3 % → 33.8 % purely because ground<250, not because of more ink) — edge
positions and ground-luminance are the readings that matter.

**Extent stills** (`g-extent-08/25/55.png`, 1280×800):

| file | fraction<250 | darkest px (whole image) | ground | paper edges (row 5) |
|---|---:|---:|---:|---|
| g-extent-08 | 0.985864 | 128.0 | 128.0 | x=630…649 (20 px) |
| g-extent-25 | 0.996155 | 128.0 | 128.0 | x=637…642 (6 px) |
| g-extent-55 | 0.999069 | 128.0 | 128.0 | x=639…640 (2 px) |

Old files re-measured with identical code: `e1-extent-08.png` darkest=**211**, edges detectable
x=8…11; `e1-extent-25.png` darkest=**234**, edges **not detectable** (null/null); `e1-extent-55.png`
darkest=**239**, edges **not detectable**. These reproduce the Dramaturg's own hand-measured table in
`STAGING-RULING-2.md` §1b exactly — an independent re-derivation.

**A finding requiring a second measurement to state honestly:** new-build "darkest pixel in whole
image" is 128.0 (= ground) at all three lengths — read naively this looks like the ink vanished. It
didn't: restricting the scan to the actual paper-strip columns gives darkest-within-strip = 212 / 220 /
218 for 08/25/55 — close to the old whole-image values (211/234/239), so ink itself is essentially
unchanged (small differences from different horizontal sub-pixel sampling under centring, not from any
change to the isotropic-scale fault, which is **not fixed tonight** — item 3 is out of scope). **What
changed for the better is contrast against surroundings:** old 55-unit ink registered 239 against white
255 (16-part, 6 % contrast); new registers ≥218 against grey 128 (up to 84–90 part, ~66 % contrast), and
is now **cleanly detectable by the edge-scanner where the old file was not** (x=639–640 found vs.
null/null). The ground fixes "is the paper visible at all," not "is the ink legible" — both true,
neither is the whole picture.

**Gap traversals** (`g-gap-longest-20d.png` 1280×23,478, `g-gap-median-5d.png` 1280×6,708):
fraction<250 = 0.326132 / 0.333715, darkest=0, ground=128.0, edges at row 400 = x=208…1071 (864 px) for
both. Old files (re-measured, cropped to 864 px wide) never had ground in frame at all — at row 400 the
only mark is x=863, no left edge. New full-page captures show true edges holding constant through the
entire traversed height, including inside blank calendar days — the blank slots (still literal white
`#fff` divs) now read as empty *pages*, bounded by grey, for the whole traversal.

## 2. TASK 2 — THE COLUMN AT 390 PX (§15 item 2)

**A defect found and fixed before trusting the measurement:** first attempt used
`transform:scale(390/864)` on a `margin:0 auto`-centred fixed-864 px box. This produced a full-page
screenshot **627 px wide, not 390** — `transform` repaints pixels but never changes layout size; the
unscaled 864 px box centred in a 390 px viewport occupies layout space x=−237 to 627, and browsers
report the positive overflow in `scrollWidth`. This is exactly the horizontal-overflow affordance
binding condition 4 was praised for *not* having — a real phone could register a sideways swipe into
that dead layout space even though nothing visibly moved. **Fixed** by adding
`buildColumnHtmlResponsive` to `g-column-html.js` — percentage/`aspect-ratio`-based sizing
(`width:100%; aspect-ratio:864/1118`), matching the already-validated `bc4-phone-case.js` technique.
Confirmed fixed: `document.documentElement.scrollWidth === 390` exactly (`noHorizontalOverflow: true`).

**Built** (`build/g2-phone-build.js`): column spanning exactly the longest gap (2026-03-20→2026-04-09,
21 calendar days) at 390 px width → `g-phone-gap-full.png` (390×10,597, full traversal) and
`g-phone-gap-midpoint.png` (390×844, real viewport screenshot at the gap's vertical midpoint).

**Measured numbers requested:**
- One calendar-day slot at 390 px width = **504.65 CSS px** tall (matches `bc4`'s
  independently-measured "~505 CSS px" almost exactly).
- Blank region between order-before and order-after (19 calendar days) = **9,588.4 px** tall.
- **9,588.4 ÷ 844 = 11.36 full 844-px screens** — 11 whole screens plus a fractional twelfth of ground
  pass between the order before the gap and the order after it. (Independently reproduces the
  Dramaturg's own approximate "eleven screens of nothing," `STAGING-RULING-2.md` §8, to within 7 px.)
- **What is on screen at the midpoint** (calendar day index 10 of 21 = **2026-03-30**): the midpoint
  screenshot is **100 % pixels at luminance 255** — pure white, `fractionBelowLum250: 0`,
  `darkestPixelLuminance: 255`. It lands cleanly inside one continuous blank day, no visible seam.

**The honest finding this task turned up:** on the phone, the adopted ground does **not** solve the
"undifferentiated white" problem it solves on desktop. At 390 px, the column fills the viewport's full
width with zero lateral margin (inherited from the already-validated no-horizontal-drag phone
behaviour), so grey is only visible above the first slot and below the last — never beside the paper.
The still meant to show "an empty page with edges" at the gap's midpoint instead shows exactly the
defect item 1 was written to fix: undifferentiated white in every direction. Reported as a genuine,
unresolved defect — not fixed tonight (fixing it reopens the type-legibility question §8 just closed in
the phone's favour, or requires some other approach; out of scope for tonight's three items).

## 3. TASK 3 — STRIKE THE LEAKED DATES (§15 item 4 / D6)

`build/g3-verify-markup.js` builds the full 296-day adopted column and searches the **actual served
HTML string**:

| check | old markup | new markup |
|---|---:|---:|
| `data-date=` occurrences | 296 | **0** |
| `data-docs=` occurrences | 55 | **0** |
| ISO date strings anywhere | 296 | **0** |

**Verified, not assumed: 0 occurrences of any of the three in 38,109 bytes of served markup.**

**What is still left, reported honestly: the `img src` file paths leak the date.** The Court's own
filenames follow an `MMDDYY…` convention (e.g. `100625zr_3fbh.pdf` = 2025-10-06). Cross-checked
programmatically against each file's actual corpus record date (not assumed from pattern): **72 of 72
distinct filenames served in this markup have their leading six digits exactly equal to their own
record's calendar date.** Stripping `data-date`/`data-docs` never touched this — the date was never in
those attributes, it is baked into the filename inherited unmodified from the Court, passed straight
into `src`. This is a new finding this session — the first Builder's markup carried the identical leak,
unnamed as a D6 defect at the time. A weaker second residual: the slot `class` (`slot order`/`slot
blank`/`slot order multi`) reveals which of the 296 positions carry documents (relative structure),
without an absolute date on its own — but combined with the filename leak on order days, the whole
calendar is externally reconstructable regardless of what `data-date` ever said.

**Verdict:** item 4's literal ask (remove `data-date`/`data-docs`) is fully done, verified at 0
occurrences. The larger goal ("nothing schedules the visitor") is **not fully met** — the date survives
via the filenames. Not fixed tonight (would require renaming the whole render cache); flagged for
whoever picks up D6 next.

## 4. Self-reported defects

1. Residual filename date leak (§3) — 72/72 filenames encode their own true date; not fixed tonight.
2. Ground does not survive to the phone viewport (§2) — at 390 px the paper fills the full width with
   no lateral margin, so grey is invisible beside the paper; the gap-midpoint still is 100 %
   luminance-255 white with zero ground in frame. Unresolved.
3. A real `transform:scale()`-on-fixed-width layout-overflow bug was found and fixed (§2) before it
   could contaminate a measurement — recorded per the same "determinism is law" discipline the first
   Builder used for its own scrollbar defect.
4. The isotropic-scale fault (Dramaturg §1c) is unchanged and out of scope tonight — the 55-unit paper
   strip is still 2 px wide, ink still ~218 luminance; only its *detectability against ground*
   improved, not its legibility.
5. Items 3, 5, 6, 7 of §15 were not attempted — recorded as not reached, per tonight's assigned scope
   (items 1, 2, 4 only).
6. "Fraction of pixels below luminance 250" changes meaning once a sub-250 ground is introduced —
   flagged at every occurrence where it could otherwise be misread as an ink measurement.
7. `build/g-render-log.json` briefly held a stale, misleading `failed` list from a
   deliberately-killed run; the finishing run's own console output is the true record (72/72 PNGs
   confirmed present and non-empty by direct file sweep).

## 5. Not reached

No outside eye was run (item 6). The differential of §11 (item 5) was not run. The squeeze decision
(item 3 / binding condition 13) was not made by this voice. Whether any of the 72 source PDFs runs to
more than one page remains untouched this session (it was resolved in session 54 by other means —
`DOCKET-ADDENDUM-54.md` item 8). No independent on-device verification of phone swipe behaviour was
possible in this environment; `scrollWidth` measurement is the strongest available proxy.

## 6. File manifest

```
etudes/at-any-time/
  g-entry-08.png  g-entry-25.png  g-entry-55.png
  g-extent-08.png  g-extent-25.png  g-extent-55.png
  g-gap-longest-20d.png  g-gap-median-5d.png
  g-phone-gap-full.png  g-phone-gap-midpoint.png
  build/
    g-fetch-pdfs.js  g-render-all-pages.js  g-render-log.json
    g-column-html.js  (adopted staging + buildColumnHtmlResponsive)
    g-capture-lib.js  g-measure-lib.js
    g1-ground-build.js  g1-measurements.json
    g2-phone-build.js  g2-measurements.json
    g3-verify-markup.js  g3-measurements.json
    g-compare-old-new.js  g-compare-old-new.json
```

No PDF committed anywhere. All new PNGs total ~560 KB. All first-session files unchanged, reused as-is.
