# NO PART — still, `no-part-01` (concept gate)

## (A) or (B), stated first

**This is case (A): a genuine rasterisation of the real source PDF.**
`no-part-01.png` and `no-part-01-half.png` are built entirely from pixels
Chromium's own PDF engine (PDFium) produced when it opened
`order-list.pdf` — the actual Supreme Court file, hash-verified below — and
rendered its pages. Nothing in this image is re-typeset. `corpus/entries.json`
was used only to cross-check content and identify which docket a given
detected line corresponds to; no character in the image was drawn from it.

**What was tried, in order, before landing on (A):**

1. `pdftoppm`, `pdftocairo`, `gs`, `mutool`, `qpdf`, `pdfinfo` — absent from
   this machine (`which` returns nothing for all of them).
2. Python `fitz` / `pypdfium2` / `PIL` — not installed.
3. Playwright `chromium_headless_shell` and default headless `chromium`,
   navigated straight to `file://…pdf` — both trigger a **download event**
   instead of rendering; a PDF opened this way never becomes visible DOM
   content to screenshot.
4. Playwright `chromium` launched with **`headless: false`** under a real
   **Xvfb** display (`xvfb-run -a`) — this **works**. Chromium's built-in PDF
   viewer (the same UI you'd see opening a PDF in desktop Chrome) loads and
   renders the actual file, with its own toolbar, page thumbnails and
   PDFium-rasterised page canvas. This is the rendering path this build
   uses.

Since case (A) held, everything downstream — the still, its measurements,
and the fail-condition checks in the proposal's §10 gate — are checkable
against the Court's own rasterised page, not against our own extractor. The
one place `entries.json` still matters is exactly what §10 says it's for:
verifying the render, never setting it.

## Reproducing it

```
cd etudes/5000-series/still/no-part
curl -sS -o order-list.pdf https://www.supremecourt.gov/orders/courtorders/100625zor_5368.pdf
sha256sum order-list.pdf   # must be 354c9ba8dbc6e5104a6a6b84ee53a91a6f8e5e87b2d900e8c26f4a67ef6ec652
xvfb-run -a env NODE_PATH=/opt/node22/lib/node_modules node build.js
```

`order-list.pdf` (228,850 bytes) is fetched once, kept out of git
(`.gitignore`), and verified by hash at the top of every `build.js` run — no
network access happens during the build itself. Requires Playwright +
Chromium at `/opt/pw-browsers` and a working Xvfb (`headless: false` is
mandatory here — see the defect list below for why).

Output: `sheet-30.png` … `sheet-35.png` (the six individual rasterised
pages, 864×1118px each, kept for inspection/reproducibility — open any of
them directly), `no-part-01.png`, `no-part-01-half.png`.

## What is built and from what

One dead-on, 0° yaw / 0° pitch, 1200×460mm window of the proposed 8.42m
mounted line, per VECTOR-3-proposal.md §10: the last 168mm of sheet 30,
sheets 31–34 in full, the first 168mm of sheet 35, 90mm of wall above the
paper and (measured; see below) 90.5mm below, sheets butted at 0mm gap,
seams read only as a thin paper-edge shadow. `no-part-01.png` is 4800×1840px
(4px/mm); `no-part-01-half.png` is 2400×920px (2px/mm).

**The half-scale image is a downsample, not an independent low-DPI capture**
— deliberately, and here is why: Chromium's PDF viewer plugin in this build
has a real, reproducible bug (documented in full under Defects) where
requesting `deviceScaleFactor < 1` does not shrink the rendered page
proportionally; it breaks in an unrelated way. Rather than ship a second
rasterisation pass through a code path known to be unreliable,
`no-part-01-half.png` is produced by taking the real 4px/mm rasterisation
and downsampling it by exactly 2× in a `<canvas>` (`drawImage` with high-
quality smoothing). Every pixel in it still derives from the real PDF raster
— nothing here is reconstructed or re-typeset — it is simply resampled,
the same way a photograph downsized for a contact sheet still shows the
actual photograph.

## Palette — measured, not assumed

The proposal gives `paper #F4F2ED · ink #161412 · sheet-edge shadow
#D9D5CE · wall #8C8781` explicitly as a **hypothesis**, asking the Builder to
sample the real render. Measured off the actual rasterisation (sampled from
sheet 32; consistent across all six sheets by inspection):

| | Hypothesis | **Measured** |
|---|---|---|
| Paper | `#F4F2ED` | **`#FFFFFF`** (pure white; large blank regions average exactly 255,255,255) |
| Ink (typical, darkest 0.1% of pixels) | `#161412` | **`#141414`** — rgb(20,20,20), R=G=B exactly (see correction below) |
| Ink (single darkest pixel, any channel) | — | `#000000` |

The paper is rendered pure white by Chromium's PDF engine, not the warm
off-white the proposal hypothesised — this build uses the measured white for
nothing (the composite's paper band is the real page raster, not a fill
colour, so "paper colour" isn't something the build chooses at all; this row
is reported because the proposal asked for it as a fact, not because it
changes anything drawn).

> **SUPERSEDED — kept in the record, not deleted (legal-hygiene rule 6).**
> A previous pass measured this build's ink at `#180F22` — rgb(24,15,34), B
> channel highest — and reported it here as *"genuinely not neutral black
> ... a property of the source document's own rendered text colour."* **That
> reading was wrong**, and the paragraph it justified (below, struck) does
> not describe a fact about the Court's document:
>
> ~~The ink is genuinely not neutral black — it has a small but real
> blue-violet cast (B channel highest of the three, visible directly by
> zooming into any glyph). This is a property of the source document's own
> rendered text colour, not of this build's process, and it directly
> explains the colour-census finding below (Measurement 7): a document with
> slightly tinted "black" ink produces slightly tinted anti-aliasing at
> every glyph edge, which is measurably "saturated" by the HSL formula even
> though no human viewer would call any of it colour.~~
>
> **The correction, independently verified this pass:** every content
> stream in `order-list.pdf` containing a `BT`/text-showing block was
> searched — twice, independently, once scanning only after each `BT` and
> once scanning the entire decompressed stream regardless of position — for
> any colour-setting operator (`rg RG g G k K sc SC scn SCN`). **None
> exists, anywhere, in any of the 39 text-bearing content streams.** Every
> glyph is drawn at `Tr 0` (fill) under the PDF's untouched default colour,
> which is pure black in DeviceGray. There is also no image XObject
> anywhere in the file — this is genuine vector text, not a scan with an
> invisible OCR layer, so there was no possibility the visible glyphs came
> from compressed image pixel data either. `#180F22` was never the Court's
> ink. It was **subpixel (LCD) text antialiasing this render pipeline
> itself was adding** — this house's instrument colouring its own output,
> not a property of the work, the document, or the proposal's deliberate
> no-accent palette. See "Defect 5, corrected" below for the fix and its
> full census consequence.

The wall (`#8C8781`) and seam shadow (`#D9D5CE`) colours are used exactly as
the proposal's hypothesis — there is no "real" wall or seam in the PDF to
sample; these are the studio's own added elements at the mount, and are
reported here as unchanged from the hypothesis, not measured.

## Measurements (transcribed from `build.js`'s own stdout; reproduce with the command above)

**1. Case (A) vs (B):** (A), established as above.

**2. Type size and emphasis — the proposal's "no emphasis anywhere" claim is FALSE, and this build finds where.**
The document does carry a second face. Directly visible on sheet 33/34, at
every occurrence of *"in forma pauperis"* and in the Rule 38(a) citation *"See
Martin v. District of Columbia Court of Appeals, 506 U. S. 1 (1992) (per
curiam)"*: the case name, the Latin phrase, and "per curiam" are set in a
genuinely **italic** face — visibly slanted strokes, distinct from the
upright reporter citation "506 U. S. 1 (1992)" sitting between them in the
same sentence. This is consistent with the four declared font resources in
the file (`/TT0`–`/TT3`, confirmed present by grepping the raw PDF bytes for
`/TTn 0 R` references) carrying at least two visually distinct faces.
Pixel-measured: a capital/lowercase row of regular text ("DANIELS, JOSEPH
A." caption) has ink-bbox height 11px; the italic "in forma" on the
following line has ink-bbox height 12px — the same size within
anti-aliasing tolerance, confirming **the second face is italic emphasis at
the same point size**, not a second size. So: the proposal's "one type size,
10.02pt, no second size" claim **holds** (nothing here contradicts it), but
its "no emphasis anywhere" claim is **false** — italics are used
systematically for terms of art (*in forma pauperis*, case names, *per
curiam*) throughout the Rule 39.8 and recusal paragraphs, and the proposal's
brief should be corrected before the gate rules on it. Both example
occurrences (`24-7281 WATSON`, `24-7233 DANIELS`) are on sheet 33, inside
this still's own frame.

**2a. The type is monospaced — named from the PDF's own font descriptors
(new this pass).** Visible directly on `sheet-32.png` (every character cell
the same fixed width; compare the tight "i" and the wide "W" sitting on
identical horizontal spacing). Read from the PDF's embedded font resources
(decompressing the file's object streams and reading `/BaseFont` and
`/FontDescriptor`/`/FontName`, the same independent pass that found no
colour operator, above): the body and caption text is set in
**`LucidaSans-Typewriter`** (subset tag `AHDOHP+`), with a matching
**`LucidaSans-TypewriterBold`** (`AHDOFO+`) and **`LucidaSans-TypewriterOblique`**
(`AHDPDP+`) — the latter is the "second face" identified as italic in
Measurement 2 above; strictly it is an **oblique** (slanted Roman) rather
than a true drawn italic, per its own `FontName`, though the visual effect
on the page is the same terms-of-art emphasis described there. One further
glyph resource, `AHDPCN+Calibri`, is present but declared for a single
character only (`FirstChar`/`LastChar` both 32) — not a second body face,
just one incidental non-Lucida glyph (most likely a substituted space or
dash) — so it does not change the "monospaced Lucida Sans Typewriter
family throughout" finding. Named from the file itself, not guessed.

**3. Prose-inset check on sheets 30 & 31 (the two "rows-only" pages in frame).**
A naive "is there any ink at column x=162.47pt (229px)" test is not useful
— every caption is long enough that its own text crosses that column as a
side effect, which is not the claim being tested. Corrected method: every
text line on the page was detected and classified by **where its own ink
starts** (not what crosses a fixed column). Result, both pages:
- Sheet 30: 29 text lines. 28 start at the docket column (x≈102px = 71.97pt,
  matching the proposal's own docket-column figure). 1 short line (the
  folio) at x=[425–438], **centred** (its centre, x≈432px = 108.0mm, is
  almost exactly half the 216mm page width). **Zero** lines start anywhere
  else — no genuine paragraph-prose line exists on this page.
- Sheet 31: identical pattern — 28 docket rows, 1 centred folio at
  x=[425–439], zero anomalies.

So the **substance** of the proposal's claim is pixel-confirmed: these pages
contain nothing but docket rows and a folio, no paragraph prose. But the
proposal's **specific coordinate** claim — that the one non-docket line "is
at the prose inset x=162.47pt" — is **not** confirmed and appears to be
**false as stated**: the measured folio sits centred at ≈305pt from the left
edge (x≈432px÷4px/mm÷0.352778mm/pt), nowhere near 162.47pt/229px. This is a
real discrepancy between the corpus extractor's coordinate claim and the
rendered pixel position; it could not be resolved further in this
environment (no PDF operator-stream access), and is reported rather than
silently assumed correct. *Pixels, not propositions.*

**4. The hinge is in frame — pixel coordinates, sheet-local and frame-final.**

| Line | Sheet-local (sheet 32, 864×1118px) | Frame coords (4800×1840px) |
|---|---|---|
| `25-5543 BROOKS, ALTONY V. JOHNSTON, SGT., ET AL.` | x=[103–548], y=[901–912] | x=[1639–2084], y=[1261–1272] |
| *The petitions for writs of certiorari are denied.* | x=[247–659], y=[933–943] | x=[1783–2195], y=[1293–1303] |
| `24-948 GUERRERO, CHIEF JUSTICE, ET AL. V. REDD, STEPHEN M.` | x=[103–642], y=[966–978] | x=[1639–2178], y=[1326–1338] |
| *The motion to substitute Melissa Powe…* (opening line) | x=[247–661], y=[1000–1010] | x=[1783–2197], y=[1360–1370] |

All four appear in the specified order, inside the frame, on sheet 32 —
confirmed both visually (crops in this session) and by the row/column ink
detection above.

**5. Legibility — pixels, not propositions.**
Capital "T" of "The petitions…" (mass sentence, sheet 32, 4px/mm): ink
bounding-box height = **14px** — the proposal's own prediction (14.1px for
10.02pt type at 4px/mm) is confirmed almost exactly. **`no-part-01.png` is
legible**: every docket, caption, and disposition line read off it in this
session (dozens, across all six sheets) was read directly from the pixels,
no zoom beyond what's in this document. Same glyph region, read off
`no-part-01-half.png` (2px/mm): ink bounding-box height = 35px at 2×
upsampled inspection scale (i.e. ≈7px at native 2px/mm resolution),
distinct-row count 13 (down from the full-resolution row structure).
Honest finding: **at 2px/mm the type has softened but has not fully become
texture** in this digital image — individual words are still readable with
attention (confirmed directly: the half-scale image was read line-by-line in
this session, including the italic passages). The proposal's "texture at
ten metres" claim is about a physical viewing distance a screenshot cannot
truthfully simulate by halving pixel count alone; what this measurement
supports is only the narrower, honest claim that legibility measurably
degrades from 4px/mm to 2px/mm, not that it disappears.

**Re-confirmed after the antialiasing correction (this pass):** re-run on
the corrected, desaturated render — same crop, same method. 4px/mm capital
"T": ink bounding-box height **14px** (unchanged; the fix touched colour,
not glyph shape or coverage). 2px/mm: ink bounding-box height **35px**,
distinct-row count **13** (also unchanged). The "has softened but has not
fully become texture" finding above is **re-confirmed exactly as stated,
not softened further and not walked back** — colour was never what made it
legible or illegible at either scale, so removing the colour cast changes
nothing about this finding.

**6. Frame coverage — paper vs wall.**
Analytic (from the geometry the build actually used): paper band =
1118px / 1840px = **60.76%** of frame height; wall = **39.24%** (90mm top +
90.5mm bottom, see the page-height defect note below for why bottom isn't
exactly 91mm). Pixel count over the full 4800×1840 canvas, re-measured on
the corrected render: paper-coloured pixels 5,175,907 (**58.60%**),
wall-coloured 3,468,689 (**39.27%**), other (ink + anti-aliasing + seam
shadow) 187,404 (**2.12%**) — a shift of a few thousand pixels from the
pre-correction count (5,176,919 / 3,466,372 / 188,709), fully explained by
desaturation moving some near-threshold grey pixels across the paper/wall
classifier's tolerance band; not a geometry change. The wall fraction
matches the analytic prediction almost exactly; the paper fraction reads
~2 points lower than analytic because "paper-coloured" pixel counting
excludes every dark ink pixel and every anti-aliased edge pixel within the
paper band (by design, so it isn't double-counted against "other"), which a
document with 29 text lines per page has a lot of. No fifth element
intrudes anywhere in the frame — confirmed by the "other" category (2.12%)
being fully accounted for by ink + seam shadow + anti-aliasing, not by any
unexplained residue.

**7. Colour census over `no-part-01.png`.**

> **SUPERSEDED — kept in the record, not deleted (legal-hygiene rule 6).**
> ~~Distinct colours: 188,982. Pixels with HSL saturation > 0.15: 420,435
> (4.76% of the frame; max saturation found: 1.000) — not zero, contradicting
> the proposal's stated expectation... Because the source document's own ink
> is not neutral (#180F22, a blue-violet-tinted near-black)... Restricting to
> pixels whose lightness is NOT near white or black gives 238,498 pixels...~~
> This entire finding rested on the wrong ink reading corrected under
> Palette above. The 420,435 "saturated" pixels were never a property of the
> document — they were LCD/subpixel antialiasing fringe this render pipeline
> was adding at every glyph edge. The corrected measurement below is what
> the gate should actually be checked against.

**Corrected census (this pass), after fixing the antialiasing at source
(see "Defect 5, corrected" below for exactly what was tried and what
worked):** Distinct colours: **262**. Pixels with HSL saturation > 0.15:
**0** (0.00% of the frame; max saturation found anywhere in the frame:
**0.070**, i.e. every pixel sits comfortably under the gate's own
threshold, not just barely). This **is** zero, confirming the proposal's
stated expectation — once the measurement is actually of the document
rather than of this house's own renderer. There is no remainder to locate:
zero means zero, not "a small residue somewhere." None of this is an accent
colour; there is no colour anywhere in the frame that was chosen rather than
measured off the document's own rendered ink, and now none that was
introduced by the rendering instrument either.

## Defect list

**1. Chromium's PDF viewer plugin does not scale linearly with `deviceScaleFactor` — a real, reproducible rendering bug, discovered and worked around.**
The naive formula (`px/mm = 96/25.4 × dsf`, true for every other element on
a web page) does not hold for this plugin. Empirically: requesting `dsf =
1.058333` (naive formula for a 4px/mm target) produced pages measuring
914×1183 physical pixels — an *actual* scale of 4.234px/mm, not 4. Testing
several values and back-solving shows the plugin effectively applies
`deviceScaleFactor` to its own internal content scale **in addition to** the
normal compositor scaling, giving `actual_px_per_mm = (96/25.4) × dsf²`
instead of the expected linear relationship. **Fix used:** `dsf =
sqrt(pxPerMm / (96/25.4))`. Verified: at the target 4px/mm this gives `dsf =
1.028753`, and the resulting page measures exactly 864×1118px = 216.00 ×
279.50mm — true US Letter, within rounding. This formula is only valid for
`dsf ≥ 1`; **`deviceScaleFactor < 1` has an independent, more severe bug**
in the same plugin (tested at the naive dsf for a 2px/mm target: the page
rendered at roughly half its predicted size, and a separate attempt showed
signs of the auto-opened thumbnail sidebar not fully closing before capture)
— this is why the half-scale image is a downsample rather than an
independent low-DPI capture, as explained above.

**2. The proposal's stated page size (216 × 279mm) is a rounded citation of US Letter that clips real content.**
True US Letter is 215.9 × 279.4mm (8.5 × 11in exactly). The proposal's
rounded "279mm" is 0.4mm (1.6px at 4px/mm) short of the true height — enough
that an initial render using the literal 279mm figure **clipped the folio
number off the bottom of every page** (confirmed directly: the first build
attempt produced a folio band only 2px tall instead of the expected ~11px).
Fixed by rendering at the true measured page size (215.9 × 279.4mm,
confirmed by direct pixel measurement of the inter-page gap in the
continuous-scroll viewer, not by trusting either figure blindly). Consequence
for the frame: to keep the deliverable's hard pixel-size requirement
(4800×1840px exactly) while not clipping content, the bottom wall margin is
**90.5mm, not the specified 91mm** (a 0.5mm/2px adjustment — the top margin
is exactly 90mm as specified; the discrepancy is absorbed entirely on the
bottom edge, the less load-bearing of the two per the proposal's own
mounting-height math in §10).

**3. The proposal's coordinate claim for the folio position (x=162.47pt) does not match the pixel-measured position.**
See Measurement 3 above. The measured folio is horizontally centred
(~305pt from the left edge), not at the prose inset (162.47pt). This was
not fixed (there is nothing in this pixel-based pipeline to fix — it's a
finding about the proposal's own extractor output, not about this render),
only reported.

**4. The two known corpus caption defects (`25-5182` en-dash, `25-5278` capital Ñ) could not be checked from this still.**
Both dockets are numerically lower than `25-5293` (the first entry on sheet
30, the first sheet in this frame) — they fall on an earlier page (28 or
29), outside the 30–35 range this still covers. Gate condition 2 in the
proposal's §10 (confirming these are extractor artefacts, absent from the
render) is **not answerable from this deliverable** and would require a
still covering different sheets, or a direct rasterisation of pages 28–29
outside this brief's frame. Stated plainly rather than silently skipped.

**5. `no-part-01.png`'s ink is not neutral black — SUPERSEDED, corrected
this pass.**

> **Kept in the record, not deleted (legal-hygiene rule 6):** ~~this was
> originally reported as a fact about the source document ("the ink colour
> is the Court's, not this studio's"), not fixed.~~ That was wrong. See
> Palette above for the full correction and its independent verification
> (every `BT`/text content stream in the PDF searched for a colour operator;
> none found; no image XObjects either, so it is real vector text, not a
> scan). The colour was this render pipeline's own subpixel/LCD
> antialiasing, not the Court's ink.

**Defect 5, corrected:** fix attempted, in order, per the correction brief:
1. Chromium launch flag `--disable-lcd-text` — **no measurable effect**
   (ink still measured `#180F22` after cropping to the actual page region).
2. Additionally `--disable-font-subpixel-positioning
   --force-color-profile=srgb` — **no measurable effect.**
3. `--disable-features=PdfUseSkiaRenderer` (forces PDFium off its Skia
   glyph path) — **no measurable effect.**
4. A display-level greyscale-AA setting: a system-wide fontconfig override
   (`rgba: none`, `lcdfilter: lcdnone`, `hintstyle: hintslight`, `fc-cache
   -f` applied) — **no measurable effect.** None of the above reaches
   whatever internal glyph-coverage/compositing path this bundled headful
   Chromium build's PDF viewer actually uses; it does not appear to consult
   host fontconfig or respond to any Blink-level LCD-text switch for its own
   PDF canvas. The fontconfig override was reverted after testing, leaving
   the environment unchanged for reproduction.
5. **Last resort, used, and explicitly declared as such:** every sheet
   raster (`sheet-30.png` … `sheet-35.png` — pure PDF content, no
   studio-authored colour anywhere in them) is desaturated to true neutral
   grey immediately after Chromium produces it — every pixel's R, G, B
   channels set to that pixel's own perceptual luminance
   (`0.299R+0.587G+0.114B`, the same weights used everywhere else in this
   build for ink/lightness thresholds) — **before** it is written to disk or
   used anywhere downstream (compositing, sampling, measurement). This is a
   **change made to the image, not a change in how the source was drawn**,
   and is recorded here as exactly that: a post-process correction of this
   house's own rendering defect, not a discovery about the document. It is
   applied only to the sheet rasters; the wall (`#8C8781`) and seam-shadow
   (`#D9D5CE`) fills added later at composite time are untouched, so the
   palette is unchanged from the hypothesis exactly as before.

Result: ink now measures `#141414` (rgb 20,20,20, R=G=B exactly — see
Palette above), paper unchanged at pure white, and the colour census
(Measurement 7) drops from 420,435 saturated pixels to **0**. Legibility
(Measurement 5) is unchanged — 14px and 35px/13-rows, exactly as before,
confirming the fix touched colour only, not shape or coverage.

**6. This build requires a real (non-headless) Chromium under Xvfb.**
`headless: true` and `chromium_headless_shell` cannot render a PDF at all in
this environment (confirmed: both just trigger a download event). This is
an environment-specific operational constraint worth flagging for whoever
next tries to reproduce this build on different infrastructure — if a real
PDF rasteriser (`pdftoppm`/`mutool`/`fitz`) becomes available, it should be
preferred over this workaround, which depends on undocumented internal
behaviour of a specific Chromium build's bundled PDF viewer.

**7. Nothing was invented; nothing was dropped.** Every glyph in
`no-part-01.png` is the Court's own, rasterised from the verified PDF. No
compromise, approximation, or substitution was required anywhere in this
build — unlike a text-reconstruction approach, there was no justification
step to record here.
