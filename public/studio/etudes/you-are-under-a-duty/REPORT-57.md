# REPORT — étude `you-are-under-a-duty`, session 57 (`e2.html`)

Built 2026-08-01/02, per §10–§11 of `projects/pfd-channel/STAGING-RULING-56.md` (the Dramaturg's
binding conditions, C1–C6 as handed down) and the pre-committed register tests of §8. Discardable.
Dies with the concept if the concept dies; not re-gradable into a work. This étude supersedes the
prior night's `e1.html` grammar under six named changes (C1–C6); `e1.html`, its stills and its
report are left untouched on disk as the prior record, not overwritten.

Data: `projects/pfd-channel/data/nonresponse-tables-2026-08-01.json` (4 tables, 49 rows, 63
recipient-slots). Observation date fixed at 2026-08-01. No network access used or required by the
built page; nothing in `e2.html` is fetched.

---

## 1. What was built

**`build-57.mjs`** — a single committed generator (Node ≥ 18, ESM) with two responsibilities in one
file, as required: (a) it emits the page HTML for any combination of `{order, mark, placement,
extent, closed}`, and (b) it drives the whole render/measure pipeline used to produce every artefact
and every number in this report, via Playwright subcommands (`shot`, `downscale`, `pixels`,
`measure-dom`, `digitcheck`, `wrapcount`). A second hand can reproduce everything here with:

```
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node build-57.mjs html --order O2 --mark M-A --placement P1 --extent 1 --out e2.html
```
and the analogous `shot`/`downscale`/`pixels`/`measure-dom` calls documented inline in the script's
header comment and reused throughout this report.

**`e2.html`** — the one built object of this étude: `O2 / M-A / P1 / extent 1`, real, not simulated.
**96,945 bytes.** One static, self-contained HTML file. Verified directly against the file's own
bytes: **zero `<script>` tags, zero `<link>`/`@font-face`/`@import`, zero image or media
references.** Two literal `https://` strings appear, both plain inert text (not `<a href>`, not
`<link>`, not anything the browser fetches) inside `<footer>` at the very foot — the source
attribution the ruling's C3 explicitly permits there and nowhere else (§11.12's "no dates leak…
into the entrance" is about the entrance; the colophon is defined by C3 as the one place URLs may
sit). Font stack unchanged from e1: `Georgia, Cambria, "Iowan Old Style", "Times New Roman", Times,
serif`, `#000` on `#fff`, one column, 640 px max measure, no table, no grid, no rule between
entries, no alternating background, no aligned columns.

### The six changes, as built

- **C1 (sentence carries the subject).** Every open-duty sentence reads verbatim: *"«Recipient» is
  under a duty to respond to this report on the prevention of future deaths, namely by «date in
  words»."* The words **prevention**, **future**, **deaths** are on the face, in the state's own
  vocabulary (they are the report's own title clause, not our addition — see
  `MATERIAL-2026-08-01.md` §1). Checked mechanically: `e2.html` contains the string "on the
  prevention of future deaths" 63 times, once per recipient-sentence.
- **C2 (face carries the absence of power).** *"There is no power authorising a coroner to take any
  steps."* printed once, in `<p class="sentence">` — the identical class, font-size, weight and
  absence of italics/box/quotation-marks as every duty sentence. Two placement variants built:
  **P1** (immediately after the observed-date line, before the first name) and **P2** (after the
  last entry, before the colophon). `e2.html` itself ships P1; a P2 variant of the same extent-1
  page was rendered to produce `entrance-390-P2.png` (not committed as HTML — see §4).
- **C3 (cuts).** No printed formula, no per-recipient aggregate, no response-rate ratio, no
  invention-statement anywhere on the face — verified by absence (`e2.html` contains none of these
  strings; the only computed-looking content is the rule bar itself and the marks, neither
  captioned). The colophon carries only the two source URLs and the observation date in words.
- **C4 (two mark treatments).** `M-A`: unchanged from e1, a `3px × 9px` black tick, `2px` left
  margin. `M-B`: designed and argued below (§3).
- **C5 (two orderings).** `O1`: oldest-duty-first (e1's ordering; verified byte-for-byte identical
  entry sequence and per-entry rule-segment widths to `e1.html` — see §2). `O2`: the four published
  tables taken oldest-published-first (by actual date: 31 Dec 2024, 30 June 2025, 31 Dec 2025,
  30 June 2026), rows left in the exact order the JSON (= the state's own table) prints them inside
  each table — no re-sort applied by this generator at all. `e2.html` ships O2.
- **C6 (the closed sentence).** One variant, `CLOSED`, built on top of `O2/M-A/P1`. Not shipped as
  `e2.html` (extent 1 is the one real built object); rendered at extent 400 per the OUTPUT
  instruction, downscaled, committed as stills — see §4 and §5 for the row and the legal-hygiene
  line.

---

## 2. Data pipeline — checked against the prior night's file

`buildEntries('O1', ...)` was diffed programmatically against `e1.html`: **all 49 entries match e1
exactly** in deceased name, total rule-segment width (= days outstanding) and segment count — zero
diffs. This confirms the day-count arithmetic (`observation date 2026-08-01 − Response Due Date`,
UK `dd/mm/yyyy` parsed as UTC midnight, `Math.round` of the millisecond difference / 86,400,000) and
the tie-break (stable sort on the concatenated table order) reproduce the prior night's numbers
before any of C1–C6 are applied. Recipient counts also match: 38 rows with 1 recipient, 10 with 2,
1 with 5 (Luke Chatterton) — 63 sentences total across 49 names, matching the material file's own
63 recipient-slot count. One caught-and-fixed bug along the way: the sentence template initially
dropped the word **"the"** before the date (*"namely by tenth of May…"* instead of *"namely by the
tenth of May…"*) — found by diffing rendered output against e1's own phrasing, fixed before any
still was rendered.

---

## 3. The M-B mark — design and argument (C4, ruling condition 7)

**Design.** Each mark is a `1px`-wide black rectangle, `1px` left margin (pitch `2px`, mark:gap
ratio exactly **1:1**), height drawn from a deterministic integer hash of its index in the range
**2–9px** (`markBHeight(i) = 2 + hash32(i) % 8`, where `hash32` is a murmur3-style bit-mixing
finalizer — full working shown in `build-57.mjs`). No colour, no gradient, no shadow, no rounded
corners: every mark is a plain black rectangle, same as the rule it follows, differing from it only
in width, height and count.

**A bug in this design was caught before any delivered still was made.** The first version of the
height function used a plain multiplicative hash, `(i * 2654435761) % 2^32`, then took `% 8` for the
height. Because `2654435761 ≡ 1 (mod 8)`, that construction is mathematically equivalent to
`i % 8` — a period-8 ramp, not noise. It looked "irregular" in isolation but rendered as a visibly
repeating sawtooth (caught on inspection of a rendered still, not by code review — the sawtooth was
visible by eye, discarded, not committed). Replaced with a proper bit-mixing hash (murmur3
finalizer). The fixed version was checked for periodicity by comparing the height sequence against
itself at lag 8 (the old bug's period): 8 matches out of 56 pairs, in line with chance
(≈ 1/8 expected), i.e. no residual periodicity at that lag.

**The argument for why this reads as texture at large extent, not tally (see §7e for the full pixel
measurement):** M-A's pitch is `5px` (3px mark + 2px gap) and every mark is the same fixed 9px
height — at low count each tick is individually legible and countable, which is exactly right for
extent 1 (one mark = one day observed) but by the predecessor's own honest self-flag in `REPORT.md`
§4, at simulated scale "turns each rule's tail into a dense barcode-like band of ticks that starts
to read like a sparkline." M-B is built to answer that named risk directly: **denser** pitch (2px vs
5px, so more marks occupy less linear space, working against the eye's ability to resolve individual
ticks) and **irregular height** (2–9px, no two adjacent marks reliably the same height, vs M-A's
uniform 9px), which breaks the periodic edge a barcode needs to read as a barcode. A side-by-side
crop of the same entry (Matthew Wickes, 1825 marks, 1280px) confirms this by eye: M-A renders as a
comb of even-height verticals — mechanically countable in principle, and visually continuous with
"sparkline" — while M-B renders as an uneven grey-black grain with no periodic structure a reader's
eye can lock onto. See §7e for the pixel-level basis (mark-to-gap ratio, marks-per-line, ink
fraction, luminance count) behind this claim.

---

## 4. OUTPUT — files delivered

### Entrance crops (390×844 and 1280×800, viewport only, full resolution, no overlay)

| file | variant | size |
|---|---|---|
| `entrance-390-P1.png` | O2/M-A/extent 1/P1 | 47,251 B |
| `entrance-1280-P1.png` | O2/M-A/extent 1/P1 | 51,711 B |
| `entrance-390-P2.png` | O2/M-A/extent 1/P2 | 46,113 B |

Checked by eye: `entrance-390-P2.png` shows **no** absence-of-power line in the first viewport (it
sits after the last entry, out of the door, as C2/P2 requires) — Matthew Wickes through the top of
James Atkinson's block only. `entrance-390-P1.png` and `entrance-1280-P1.png` both show the
absence-of-power line immediately under the observed-date line, before the first name, as C2/P1
requires.

### Full-page stills (full resolution taken first; extents 400 and 1825 then downscaled 25% for
delivery, `-scaled25` in the filename; extent 1 delivered at full resolution)

**Group A — main matrix, O2/M-A/P1:**

| file | full-res dims (measured, pre-downscale) | delivered size |
|---|---|---|
| `still-O2-MA-P1-390-extent1.png` | 390 × 16,135 | 1,091,995 B (full res) |
| `still-O2-MA-P1-1280-extent1.png` | 1280 × 12,900 | 1,065,027 B (full res) |
| `still-O2-MA-P1-390-IMAGINED-simulated-extent-400-scaled25.png` | 390 × 18,727 → scaled 98 × 4,682 | 441,007 B |
| `still-O2-MA-P1-1280-IMAGINED-simulated-extent-400-scaled25.png` | 1280 × 14,331 → scaled 320 × 3,583 | 411,074 B |
| `still-O2-MA-P1-390-IMAGINED-simulated-extent-1825-scaled25.png` | 390 × 27,970 → scaled 98 × 6,993 | 434,706 B |
| `still-O2-MA-P1-1280-IMAGINED-simulated-extent-1825-scaled25.png` | 1280 × 19,632 → scaled 320 × 4,908 | 422,079 B |

**Group B — O2/M-B/P1:**

| file | full-res dims | delivered size |
|---|---|---|
| `still-O2-MB-P1-390-IMAGINED-simulated-extent-400-scaled25.png` | 390 × 17,140 → scaled 98 × 4,285 | 428,214 B |
| `still-O2-MB-P1-1280-IMAGINED-simulated-extent-400-scaled25.png` | 1280 × 13,439 → scaled 320 × 3,360 | 446,280 B |
| `still-O2-MB-P1-390-IMAGINED-simulated-extent-1825-scaled25.png` | 390 × 20,839 → scaled 98 × 5,210 | 608,649 B |
| `still-O2-MB-P1-1280-IMAGINED-simulated-extent-1825-scaled25.png` | 1280 × 15,573 → scaled 320 × 3,893 | 647,441 B |

**Group C — CLOSED, O2/M-A/P1, extent 400:**

| file | full-res dims | delivered size |
|---|---|---|
| `still-CLOSED-390-IMAGINED-simulated-extent-400-scaled25.png` | 390 × 18,794 → scaled 98 × 4,699 | 421,309 B |
| `still-CLOSED-1280-IMAGINED-simulated-extent-400-scaled25.png` | 1280 × 14,351 → scaled 320 × 3,588 | 413,664 B |

All extents above 1 are **simulations — a study, not a fact about the register's actual run
length** — marked `IMAGINED-simulated-extent-<n>` in every filename that carries one, per instruction.

### Byte total added to the repository tonight

`build-57.mjs` + `e2.html` + 3 entrance crops + 12 stills + this report:

```
   28,819  build-57.mjs
   96,945  e2.html
  145,075  3 entrance crops
6,831,445  12 full-page stills
  ~24,000  REPORT-57.md (this file)
---------
≈7,126,000 bytes ≈ 6.8 MB, under the 8 MB budget.
```
(`e1.html` and its five stills from the prior session are untouched and not counted here — they
were not added tonight.)

---

## 5. The CLOSED row — which, and why

**Row: Janet Harrison → Southampton City Council**, response due 18 December 2024, **591 days**
outstanding at 2026-08-01.

**Why this row.** Restricted the choice to the 38 single-recipient rows first — closing a
multi-recipient row (e.g. Luke Chatterton's five) would close five sentences at once from one
simulated event, overstating what a single acknowledged response actually settles. Within the 38,
sorted by days outstanding, Janet Harrison sits at **index 19 of 38 (0-indexed)** — almost exactly
the median (591 days; the 38-row range runs 166 to 869 days). Deliberately not the oldest
(Matthew Wickes, 869 days — closing the single worst-looking row first reads as "the register fixes
its most damning case," a claim this study has no standing to make) and not the newest
(Winifred Wardle, 166 days — closing only the freshest, least-aged duty trivialises what closure
would mean). The median single-recipient row was chosen precisely because it is not the case that
makes the best story either way.

**Closure day.** The CLOSED variant is rendered at extent 400 (per OUTPUT). Closure is drawn at
**day 200 of that 400-day simulated run** — the midpoint, chosen for the same reason as the row: not
at the very start (which would barely distinguish CLOSED from OPEN) and not at the very end (which
would barely show the "marks stop" effect). Day 1 of the simulated run = 2026-08-01; day 200 =
**16 February 2027**. The sentence for this row alone switches to past tense and is dated: *"Southampton
City Council responded to this report on the prevention of future deaths, on the sixteenth of
February, two thousand and twenty-seven."* Verified in the rendered DOM: this row's mark count is
exactly 200 (`min(closureDay=200, extent=400)`), every other row in the same document carries the
full 400. The rule bar (591px, the historical accusation) is untouched — identical segment widths to
the same row's OPEN rendering.

**Legal hygiene.** The CLOSED variant's colophon carries, and only there, out of the entrance:
*"The closure shown here is simulated for study; no response has been received in this row as at the
first of August, two thousand and twenty-six."* Checked: this string appears in the CLOSED variant's
source HTML (scratch, not committed) and nowhere in `e2.html`, which has no closed row at all.

**Naming gap, flagged rather than quietly patched:** the OUTPUT instructions ask for
`IMAGINED-simulated-closure` in the CLOSED stills' filenames; I named them
`still-CLOSED-…-IMAGINED-simulated-extent-400-scaled25.png`, which correctly marks the *extent* as
simulated (400 is indeed simulated) but does not separately carry the string
`IMAGINED-simulated-closure`. The colophon-text legal-hygiene line itself is present and correct;
the filename only flags the extent, not the closure, as imagined. See §8.

---

## 6. Register tests — §8, run on the actual rendered geometry, O1 vs O2 side by side

**Method.** Per test, per width, per order, per extent, using `measure-dom` (Chromium's own layout
engine, `Range.getClientRects()` for text lines, `getBoundingClientRect()` grouped by rendered
flex-line for rule segments) against the live-rendered page at the same viewport width as the
corresponding still — this is the identical geometry the still is a raster of, read from the layout
tree instead of re-derived from pixels. One real bug was caught and fixed while building this:
`.rule-line` uses `align-items:flex-end`, so a flex line mixing a 2px `.seg` and an up-to-9px
`.mark`/`.markb` shares a **bottom** edge but not a **top** one — the first version of the
line-grouping code grouped by rounded `top`, which overcounts lines whenever heights differ on a
shared row. Fixed to group by `bottom` before any number below was taken. T3a (total rule ink vs
row index) is computed analytically from the data (`ink = days`, by construction, order-dependent
only, extent-invariant) and cross-checked: not re-derived from pixels because the ruling itself
already established that "days outstanding" *is* the rule length in px.

**Pre-commitment, restated: ANY ONE of the five trips the ruling, at that width.**

### 1280 px

| test | threshold | O1 / extent 1 | O1 / extent 400 | O2 / extent 1 | O2 / extent 400 |
|---|---|---|---|---|---|
| T1 left-edge histogram | ≥80% on ≤3 x-values | 100% @ x=344 → TRIPS | 100% @ x=344 → TRIPS | 100% @ x=344 → TRIPS | 100% @ x=344 → TRIPS |
| T2 row-pitch CV (38 single-recipient blocks) | <10% → trips | 75.4% → no | 72.3% → no | 67.9% → no | 65.2% → no |
| T3 staircase, total-ink Spearman | \|r\|≥0.90 → trips | −0.9998 → TRIPS | −0.9998 → TRIPS | −0.9987 → TRIPS | −0.9987 → TRIPS |
| T3 staircase, longest-rendered-segment Spearman | (same test, by eye) | −0.9312 | −0.9312 | −0.9306 | −0.9306 |
| T4 shared right terminus | present → trips (see note) | x=936, 33.8% of 74 rights, 45 distinct | same | same | same |
| T5 line-count uniformity | ≥70% identical → trips | 38.8% @ 5 lines → no | 49.0% @ 9 lines → no | 38.8% @ 5 lines → no | 49.0% @ 9 lines → no |
| **verdict at 1280px** | | **TRIPS (T1, T3)** | **TRIPS (T1, T3)** | **TRIPS (T1, T3)** | **TRIPS (T1, T3)** |

### 390 px

| test | threshold | O1 / extent 1 | O1 / extent 400 | O2 / extent 1 | O2 / extent 400 |
|---|---|---|---|---|---|
| T1 left-edge histogram | ≥80% on ≤3 x-values | 100% @ x=24 → TRIPS | 100% @ x=24 → TRIPS | 100% @ x=24 → TRIPS | 100% @ x=24 → TRIPS |
| T2 row-pitch CV | <10% → trips | 80.9% → no | 76.3% → no | 72.3% → no | 68.3% → no |
| T3 staircase, total-ink Spearman | \|r\|≥0.90 → trips | −0.9998 → TRIPS | −0.9998 → TRIPS | −0.9987 → TRIPS | −0.9987 → TRIPS |
| T3 staircase, longest-rendered-segment Spearman | (by eye) | −0.6870 | −0.6870 | −0.6864 | −0.6864 |
| T4 shared right terminus | present → trips (see note) | x=360, **53.3%** of 105 rights, 43 distinct | same | same | same |
| T5 line-count uniformity | ≥70% identical → trips | 34.7% @ 7 lines → no | 36.7% @ 13 lines → no | 34.7% @ 7 lines → no | 36.7% @ 13 lines → no |
| **verdict at 390px** | | **TRIPS (T1, T3, and T4 by majority-share reading)** | same | same | same |

**T4 note, stated plainly rather than smoothed.** The ruling gives T4 no numeric threshold — "if the
rules are drawn to a shared right terminus… that terminus is an axis," present/absent, not a
percentage. Every rule that wraps necessarily ends at least one of its lines exactly at the content
edge (that is what wrapping means), so *some* degree of shared right-terminus is structurally
guaranteed by the wrap mechanic itself, at any width, for any order. I report the raw numbers rather
than assert a threshold I would be inventing: at 1280px the dominant edge (x=936, the content
boundary) accounts for a third of all seg-line right edges — a real but minority share, alongside 44
other distinct values (mostly non-wrapping rules' own varying endpoints). At 390px the same
content-edge x accounts for a majority (53.3%) because far more rules wrap at the narrow measure
(38 of 49, vs 25 of 49 — see §7c), mechanically producing more full lines that all terminate at the
same edge. I have marked 390px as tripping T4 under a "majority of all right edges" reading, and
flagged that this reading is mine, not the ruling's — the predecessor's own conductor took the same
posture last night ("partial — reported, not adjudicated") and I am not resolving that ambiguity
here either, only reporting the measurement it is ambiguous about.

**The question the studio needs answered: does adopting the state's own printed order (O2) change
the verdict against O1?** **No.** At both widths and both extents tested, O1 and O2 trip the
identical tests (T1 and T3, plus the T4 note at 390px) by nearly identical margins (T3 Spearman
−0.9998 vs −0.9987 — the ruling's own §8 prediction, "the source's own order is barely better," is
confirmed to four figures rather than merely re-asserted). **Both orderings are registers, on the
pre-committed pixel tests, at both widths, at both extents measured.** Switching to O2 does not
repair the form; it was never going to, because T1 and T3 are properties of a single-column,
left-flush, length-encoded rule bar — of the *encoding*, not the *ordering*. Reordering the rows
cannot move where the rule bars start (T1) or stop encoding a length that correlates with row
position under **any** near-monotone order (T3, since the underlying due dates are themselves
strongly time-ordered whichever printed order is kept close to it).

---

## 7. Other measurements

### (b) Ground-domain test, 390px, largest extent (1825, `O2/M-A/P1`)

Run on the full-resolution still before downscaling (`390 × 27,970`):

| | value |
|---|---|
| longest run of consecutive all-white rows | **180 rows** |
| location | rows 27,790–27,969 of 27,970 — **the last 180 rows of the image: the bottom page margin**, not inside the body |
| as a fraction of an 844px phone screen | **180 / 844 = 0.2133** |
| distinct luminance values inside that run | **1** (pure white, RGB 255,255,255 throughout) |
| rows containing ink | 18,227 / 27,970 = 65.2% |

Cross-checked on the M-B/extent-1825 still (180 rows, same location, 1 luminance value) and the
CLOSED/extent-400 still (180 rows, same location, 1 luminance value) — the bottom-margin blank run
is a structural constant of the page's own padding (`main { padding: 72px 24px 160px }`), not an
artefact of any one variant. **No hole; a void, and it sits in the margin, not the register**,
consistent with the prior night's finding on `e1.html` and with the standing house test this
concept was previously killed for failing (9,588 rows / 11.36 screens on the prior material — this
page's longest blank run is a fortieth of that, and outside the body entirely).

### (c) Wrapping — how many of the 49 rules wrap, by width, by extent

Rule-segment wrapping is determined purely by the cumulative width of `.seg` elements (the rule
bar) against the content measure; `.mark`/`.markb` elements are appended after all segments in DOM
order, so they cannot change where a segment wraps. Measured directly (`wrapcount`), confirmed
identical at extent 1, 400 and 1825:

| width | content measure | rules that wrap (of 49) |
|---|---|---|
| 1280px | 592px | **25** |
| 390px | 342px | **38** |

(Matches `e1.html`'s own count exactly — expected, since wrap depends only on days-outstanding and
content width, both unchanged by C1–C6.)

### (d) Condition 12 — no dates leak into the served bytes of the entrance

Checked directly against `e2.html`'s bytes (not against a description of them), at both entrance
viewports (390×844, 1280×800):

- **`<title>`**: `YOU ARE UNDER A DUTY` — **zero digit characters, zero month names.**
- **`<meta>` tags** (2 total): `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">`.
  **Digit characters found: one `8` (in `utf-8`), one `1` (in `initial-scale=1`).** Reported
  verbatim per the instruction to check bytes, not intent — **neither is a date or a day-count**;
  both are standard HTML boilerplate present on essentially every modern web page, not content this
  house authored. No month names in either.
- **HTML comments**: none exist in the file (checked with a literal `<!--` search: zero matches).
- **First-viewport text** (390×844): `YOU ARE UNDER A DUTY / Observed the first of August, two
  thousand and twenty-six. / There is no power authorising a coroner to take any steps. / Matthew
  Wickes / University of Southampton is under a duty to respond to this report on the prevention of
  future deaths, namely by the fifteenth of March, two thousand and twenty-four. / James Atkinson /
  Newcastle City Council is under a duty to respond to this report on the prevention of future
  deaths, namely by the twenty-second of March, two thousand and twenty-four.` — **zero digit
  characters.** Month names present (August, March, March) — expected and endorsed by the ruling
  itself ("dates spelled out in words… I endorse it"); the test is for digits, not for the concept
  of a date. Same result at 1280×800 (one further entry visible, Mark Pryor / Ministry of Justice /
  "April" — again zero digits).

**Verdict: no date and no day-count appear as a digit anywhere in the checked bytes.** The only
digit characters in the checked surfaces are inside standard `<meta>` boilerplate unrelated to any
date.

### (e) The M-B judgement, extent 1825

Measured on the un-downscaled `full-B-390-e1825.png` / `full-B-1280-e1825.png`, on the first entry
(Matthew Wickes, 1825 marks), via DOM geometry for the structural numbers and pixel readback for
the luminance numbers:

| measure | 390px | 1280px |
|---|---|---|
| mark width : gap | 1px : 1px (**1:1**, by construction) | 1px : 1px (**1:1**) |
| marks per full rendered line | **171** (content 342px ÷ 2px pitch) | **296** (content 592px ÷ 2px pitch) |
| mark-band ink fraction (pixel-measured) | **25.3%** (11,066 / 43,680 px) | **13.7%** (11,738 / 85,760 px) |
| distinct luminance values in the mark band | **2** (0 and 255 — sharp black/white, no antialiasing grey, no gradient) | **2** (0 and 255) |
| M-A comparison, marks per full line (same widths) | 68 (342 ÷ 5px pitch) | 118 (592 ÷ 5px pitch) |

**By eye:** a side-by-side crop of the identical entry (Matthew Wickes, 1280px, extent 1825) shows
M-A as an unbroken comb of even 9px verticals — a countable-in-principle, sparkline-like barcode,
exactly the risk the prior night's report named against itself — and M-B as an uneven grey-black
grain with no periodic edge for the eye to lock onto. **Verdict: at extent 1825, M-B reads as
texture, not tally**, on both the measurable basis (denser pitch, irregular height, no dominant
periodicity after the hash fix, 2-valued but non-uniform ink coverage well short of either a solid
fill or a sparse countable row) and by eye.

---

## 8. What I would flag against myself

0. **The most important one, found by accident, not by my own checking.** While finalising, `git
   status` showed `build-57.mjs` as *modified* rather than *untracked* — a same-day commit
   (`5076f75`, "the Verifier re-runs the response-slot test by a second hand and finds the face
   sentence unfaithful to the state's own words") already existed in this shared repository's
   history, containing an independently-built `build-57.mjs` startlingly similar in structure to
   this one, alongside `projects/pfd-channel/VERIFIER-57.md`. That file is genuine, already-committed
   repository content (not authored by me, not part of my instructions), and it is worth reading in
   full: **it finds that the C1 sentence text this étude was bound to print —
   *"«Recipient» is under a duty to respond to this report on the prevention of future deaths, namely
   by «date»"* — is not faithful to the source in three specific, checked ways.** Quoting the
   Verifier directly, against a live fetch of the Najib Naagi report page and three further coroner
   areas: the state's actual duty sentence is **second person** ("**You** are under a duty…", never
   naming the recipient inside the clause), **does not contain the phrase** "on the prevention of
   future deaths" anywhere in the duty clause on any page checked, and **keeps the 56-day clause
   inside the sentence** ("…respond to this report **within 56 days of the date of this report**,
   namely by [date]") where this étude's C1 text drops straight from "respond to this report" to
   ", namely by «date»." The Verifier's shortest faithful form: *"You are under a duty to respond to
   this report within 56 days of the date of this report, namely by [date]."* Separately, the same
   file finds that this étude's C2 line — *"There is no power authorising a coroner to take any
   steps."* — is **the source's own conditional clause truncated to look unconditional**: the full
   sentence (Chief Coroner's guidance §47) is "there is no power authorising a coroner to take any
   steps **if they receive an inadequate or vague reply**," and the source's own next two sentences
   show the coroner *does* retain narrow residual powers (writing to record a breach; forwarding an
   inadequate reply on). Cut at "take any steps" and printed as a bare quotation, as this étude's C2
   does, the line overstates what the source says.
   **I did not rebuild `e2.html` or the stills against this finding.** My own task instructions
   handed me the C1 and C2 text as "binding rulings, not suggestions," verbatim, with the explicit
   condition that the words *prevention, future, deaths* must be on the face "in the state's own
   vocabulary, with nothing added by us" — a condition the Verifier's fetch shows is not actually met
   by the text I was bound to print: "on the prevention of future deaths" is not the state's
   vocabulary inside the duty clause, it is this studio's own paraphrase, added to and not found in
   the source. I am not the role in this process that adjudicates rulings, and unilaterally rewriting
   a binding text mid-build on the strength of one file I happened to notice via a `git status`
   oddity is not a decision I think is mine to make alone. But the claim "nothing added by us" is, on
   this evidence, false as printed, and I am recording that plainly rather than let the binding
   language stand unqueried. Whoever reviews this étude next should treat `VERIFIER-57.md` as a live,
   unresolved correction against `STAGING-RULING-56.md`'s C1/C2 text, not as background noise.

1. **The CLOSED stills' filenames only carry `IMAGINED-simulated-extent-400`, not a separate
   `IMAGINED-simulated-closure` marker**, as noted in §5. The simulated-closure legal-hygiene
   sentence is correctly present in that variant's colophon and nowhere else, and "closed" is not a
   quantity that varies the way extent does, so there was no natural second number to hang a second
   filename tag on — but the brief asked for the string and I did not put it in the filename. I am
   naming this now rather than letting it be found.

2. **T4 has no numeric threshold in the ruling, and I supplied my own (majority share) to produce a
   trips/no-trips line in the summary table.** That threshold is mine, not the Dramaturg's. I have
   tried to be honest about this inline (§6), but the summary table still prints "TRIPS" at 390px
   under a rule I invented; a stricter reading would leave T4 as "reported, not adjudicated" at
   both widths, exactly as the predecessor's conductor left it. Either reading leaves the overall
   390px verdict unchanged (T1 and T3 already trip it independently), but the T4 line specifically
   should not be read as a Dramaturg-sanctioned number.

3. **Two real bugs were caught only by rendering and looking, not by reasoning about the code first**
   — the mod-8 periodicity in the first M-B hash (§3) and the top-vs-bottom flex-line grouping bug
   in the register-test measurement (§6). Both are fixed and the numbers above reflect the fixed
   code, but their existence means I do not have full confidence that every corner of a
   ~730-line generator handling wrapping flexbox geometry across five orders of magnitude of extent
   is bug-free — only that the specific numbers reported here were checked against a rendered
   artefact, not merely computed and trusted.

4. **T1 and T3 trip for what may be a structural reason inherent to *any* single-column, length-
   encoded, left-flush rule form** — not specific to a fixable choice this étude made. Both C5
   orderings trip both tests by nearly the same margin (§6), and the ruling's own arithmetic
   predicted this before any pixel was rendered. If the studio's actual question is "can this form
   ever pass T1/T3 at 1280px," the honest answer this étude's numbers point to is **not by
   reordering alone** — T1 is tripped by having one left margin at all (true of prose too, which is
   presumably not meant to be disqualified), and T3 is tripped by the fact that "days outstanding"
   is both the sort key's near-neighbour and the rule's rendered length, which no reordering that
   stays close to the source's own near-monotone due-date order can avoid. Breaking T3 without
   breaking C5's requirement that O2 be "the state's own printed order, unmodified" would need a
   change to the *encoding* (what the rule bar's length represents), which is out of this étude's
   remit and is named here, not solved.

5. **The register tests were run at extent 1 and extent 400 "at minimum," as instructed — not at
   1825.** I do not know whether the verdict changes at 1825 (T2 and T5 are extent-sensitive; T1,
   T3, T4 are not, by construction, so I expect no change, but this is inference from the mechanism,
   not a fourth measurement taken).

---

## 9. Files added to the repository

```
etudes/you-are-under-a-duty/build-57.mjs
etudes/you-are-under-a-duty/e2.html
etudes/you-are-under-a-duty/entrance-390-P1.png
etudes/you-are-under-a-duty/entrance-1280-P1.png
etudes/you-are-under-a-duty/entrance-390-P2.png
etudes/you-are-under-a-duty/still-O2-MA-P1-390-extent1.png
etudes/you-are-under-a-duty/still-O2-MA-P1-1280-extent1.png
etudes/you-are-under-a-duty/still-O2-MA-P1-390-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/still-O2-MA-P1-1280-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/still-O2-MA-P1-390-IMAGINED-simulated-extent-1825-scaled25.png
etudes/you-are-under-a-duty/still-O2-MA-P1-1280-IMAGINED-simulated-extent-1825-scaled25.png
etudes/you-are-under-a-duty/still-O2-MB-P1-390-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/still-O2-MB-P1-1280-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/still-O2-MB-P1-390-IMAGINED-simulated-extent-1825-scaled25.png
etudes/you-are-under-a-duty/still-O2-MB-P1-1280-IMAGINED-simulated-extent-1825-scaled25.png
etudes/you-are-under-a-duty/still-CLOSED-390-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/still-CLOSED-1280-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/REPORT-57.md
```

`e1.html`, its five stills and `REPORT.md` from the prior session are unmodified. All other HTML
variants (O1 comparisons, the M-B/CLOSED/P2 scratch HTML, the full-resolution pre-downscale PNGs,
the register-test analysis script) were built and measured in the session scratch directory and
deleted before finishing — none are part of this étude's committed object.

No commit was made to git.

---
---

## SECOND PASS — e3, the encoding repair

Built 2026-08-02, extending `build-57.mjs` (not replacing it) under two binding changes handed down
after this étude's first pass: **CHANGE 1**, the duty sentence is the state's own second-person
sentence, 56-day clause kept inside the clause, replacing the third-person paraphrase §8.0 of the
first pass already flagged as unfaithful; **CHANGE 2**, no common left origin for the rule — it
begins at the x where the sentence's last character ends, on the same line, and wraps as text wraps.
Ordering fixed to O1 (oldest duty first), mark treatment fixed to M-A, per this pass's brief. This
section reports what was built, what changed in the generator, and — the point of the exercise —
whether T1 and T3 still trip.

### S1. What changed in `build-57.mjs`

Nothing in the e2 code path (`buildHTML`, the `html`/`shot`/`downscale`/`pixels`/`measure-dom`/
`digitcheck`/`wrapcount` subcommands) was touched. Added, alongside it: `buildHTML3` (a second HTML
assembler), three new CLI subcommands (`html3`, `measure-dom3`, `wrapcount3`), and a small addition to
`buildEntries`'s per-row object (`coroner`, `area` — needed for the new coroner line, absent from e2's
enriched rows because e2 never printed them). `build-57.mjs` grew from 28,819 to **43,267 bytes**
(**+14,448 bytes** added this pass; nothing removed, nothing in the e2 path edited).

**The one structural change (CHANGE 2), concretely.** In e2, `.seg`/`.mark` sat inside a sibling
`<div class="rule-line">` — a `flex-wrap` block below the sentence text, `align-items:flex-end`, every
wrapped line starting flush at the container's own left edge. In e3, `.seg`/`.mark` are `display:
inline-block` children appended **inside the same `<p class="sentence">`**, directly after the
sentence's closing "." with no intervening whitespace in the markup:

```html
<p class="sentence">You are under a duty to respond to this report within 56 days of the date of
this report, namely by the fifteenth of March, two thousand and twenty-four.<span class="seg"
style="width:16px"></span>…<span class="mark"></span>…</p>
```

Because there is no whitespace between the sentence's last character and the first `.seg`, and none
between consecutive `.seg`/`.mark` elements, the rule's first pixel is contiguous with the sentence's
last pixel whenever there is room on that line — and because `inline-block` elements carry an implicit
soft-wrap opportunity on both sides even without a space present (the same mechanism that lets a row of
un-spaced `inline-block` badges wrap like words), the whole run wraps exactly the way ordinary prose
wraps: full lines return to the paragraph's own left inset, precisely as a long word or an unbroken
sequence of them would. No JavaScript, no manual line-breaking, no `<wbr>` — this is standard CSS
inline layout, unmodified. `.seg`/`.mark` keep `vertical-align: text-bottom` (an authorial choice, not
specified by the brief, made so the rule sits low against the text the way an underline would; noted
here rather than left silent).

**A per-recipient-slot rule is now drawn once per recipient, not once per entry.** The brief specifies
the rule and marks come after "the state's second-person sentence" *per recipient-slot* — so
multi-recipient entries (Luke Chatterton, 5 recipients) now carry five separate name/sentence/rule/mark
blocks, each with the same day-count-derived rule length (all five recipients of one report share one
due date), rather than e2's single rule per entry. This is a direct, intended consequence of the
brief's own per-recipient-slot grammar, not a side effect of CHANGE 2 — but it has a measurable effect
on T3 below, and is flagged there rather than left to look like the repair's own doing.

### S2. `e3.html` — structural checks

**122,600 bytes.** Verified directly against the file's bytes: **zero `<script>` tags, zero
`<link>`/`@font-face`/`@import`, zero image or media references.** Two literal `https://` strings, both
plain inert text inside `<footer>`, same colophon convention as e2. Same font stack (`Georgia, Cambria,
"Iowan Old Style", "Times New Roman", Times, serif`), `#000` on `#fff`, one column, 640px max measure.
Ordering verified: first five deceased names in document order are Matthew Wickes, James Atkinson, Mark
Pryor, Joshua Burgess, Sarah Sutherland — byte-identical opening sequence to `e1.html`'s O1 order.
49 entries, 63 recipient-slots (matches e2's own recipient-slot count exactly, as expected — CHANGE 1/2
touch wording and layout, not the data pipeline).

**The three head sentences appear at the head and, identically, at the foot.** Checked by exact
substring count against `e3.html`'s bytes: each of the three sentences appears **exactly twice** —
once inside `<header>`, once inside `<footer>`, character-for-character identical both times, both set
in plain `<p class="sentence">` with no quotation marks, no italics, no box, no rule, no indent, no
attribution beside them (the two source URLs remain colophon-only, after the repeated sentences, inside
`<footer>`). The foot-only variant used for the third entrance crop (`--foot-only`) was checked the same
way: each sentence appears **exactly once**, in the footer only — the header carries just the title and
the observed-date line.

**Numerals — one exception found, named rather than smoothed over.** Scanning `e3.html`'s visible text
outside CSS and `style="width:…px"` structural attributes turns up digit characters in exactly two
places: (a) **"Care4U Healthcare"**, a recipient's own name as the state prints it — the explicitly
permitted exception; (b) **"56 days"**, inside the state's own verbatim duty sentence, 63 times (once
per recipient-slot). This second one is a genuine, unresolved tension between two binding instructions
this pass inherited: the general house rule carried over from e2 ("no numerals… except inside a
recipient's own name") and CHANGE 1's specific, later requirement to print the state's sentence
**verbatim**, and the state's own sentence contains the digits "56" in "within 56 days" — not
paraphrasable into words without breaking the verbatim requirement the whole point of CHANGE 1 was to
satisfy. I have kept "56" exactly as the state prints it and not silently spelled it out as
"fifty-six" (which would itself then be an unrequested departure from *verbatim*, the opposite failure
CHANGE 1 exists to fix). Dates remain spelled out in words throughout, as before — this is the one
numeral on the page that isn't a date and isn't a name, and it is the state's own digit, not this
studio's. Flagged, not resolved, because resolving it is not this pass's call to make unilaterally.

**Sentence 3 fidelity, cross-checked.** The third head sentence — *"Where no reply is received or an
inadequate response is made a coroner would exceed their powers if they chased a missing reply or
requested additional detail in respect of an inadequate response."* — matches `VERIFIER-57.md` §2(b)'s
live-fetched text of Chief Coroner's guidance ch. 16 §47 (its own final sentence) word for word. This
pass did not re-fetch the source independently — the three head sentences were handed down as binding
text in this session's brief — but the match against the Verifier's own independently-fetched quotation
was checked and holds exactly.

### S3. Files delivered

| file | note | size |
|---|---|---|
| `entrance-e3-390.png` | 390×844, viewport only, extent 1 | 61,083 B |
| `entrance-e3-1280.png` | 1280×800, viewport only, extent 1 | 71,574 B |
| `entrance-e3-390-foot-only.png` | 390×844, viewport only, head sentences moved to foot alone | 42,498 B |
| `still-e3-390-IMAGINED-simulated-extent-400-scaled25.png` | full res 390×35,221 → scaled 98×8,805 | 903,918 B |
| `still-e3-1280-IMAGINED-simulated-extent-400-scaled25.png` | full res 1280×24,545 → scaled 320×6,136 | 695,836 B |
| `e3.html` | extent 1, real, the one built object of this pass | 122,600 B |

Checked by eye: `entrance-e3-390.png` and `entrance-e3-1280.png` both show the three head sentences
immediately under the observed-date line, before the first name, as intended. `entrance-e3-390-foot-only.png`
shows **no** head sentences in the first viewport (title, observed-date line, then straight into Matthew
Wickes) — confirming the `--foot-only` build genuinely empties the header rather than merely visually
hiding the sentences. All extent-400 material is marked `IMAGINED-simulated-extent-400` per instruction
— a study, not a fact about the register's actual run length.

### S4. Register tests, re-run

**Method**, unchanged from the first pass in spirit: `measure-dom3` reads Chromium's own layout
(`Range.getClientRects()` for text lines, `getBoundingClientRect()` for `.seg`/`.mark`, grouped by
rendered **bottom** edge — the same top-vs-bottom fix REPORT-57 §6 already made, still required here
since `.seg` (2px) and `.mark` (9px) share a line via `vertical-align:text-bottom`, not a common top).
One methodological adaptation was necessary and is named here, not hidden: e2's T3 method computed one
ink total per **entry** (one rule per entry, unambiguous); e3 draws one rule per **recipient-slot**, so
multi-recipient entries now carry several. Three readings are reported for T3 rather than silently
picking one — see S4c.

**Pre-commitment, restated: ANY ONE of the five trips the ruling, at that width.** Extent-invariance of
T1/T3/T4 (structural, not extent-dependent, per REPORT-57 §6's own reasoning) was checked directly this
time rather than only inferred: **all four register-test numbers below are identical at extent 1 and
extent 400**, at both widths — confirmed by measurement, not assumption.

#### S4a. T1 — left-edge histogram (what CHANGE 2 targets directly)

Two readings reported, per instruction: **(a)** the original REPORT-57 method — every rendered line of
every rule, wrapped continuations included; **(b)** first-line-only — one x-value per rule instance (63
total), the position where each rule *actually begins*, which is the more direct read on whether CHANGE
2 succeeded.

| width | reading | distinct x-values | top-3 share | dominant x | threshold (≥80% on ≤3 x) |
|---|---|---|---|---|---|
| 1280px | (a) all rule-lines (n=113) | **16** | **76.1%** | 344 (63/113 = 55.8%) | **no trip** |
| 1280px | (b) first-line-only (n=63) | **16** | **57.1%** | 378 (16/63) | **no trip** |
| 390px | (a) all rule-lines (n=171) | **14** | **77.2%** | 24 (108/171 = 63.2%) | **no trip** |
| 390px | (b) first-line-only (n=63) | **13** | **54.0%** | 256 (14/63) | **no trip** |

Full distributions (x:count), reading (b), first-line-only:

- **1280px:** 378:16, 344:13, 379:7, 437:6, 882:3, 874:3, 371:3, 910:2, 907:2, 436:2, 885:1, 889:1,
  918:1, 890:1, 898:1, 914:1
- **390px:** 256:14, 223:10, 255:10, 344:9, 346:5, 222:5, 315:3, 248:2, 321:1, 326:1, 343:1, 332:1,
  345:1

**T1 no longer trips, at either width, under either reading.** In e2/e1, T1 was 100% on a single x-value
at both widths — the flattest possible failure. Here the *widest* single bucket is 55.8% (1280) / 63.2%
(390), and even taking the three largest buckets together the concentration falls short of the
pre-committed 80% line at both widths, under both readings. **This is the one register test CHANGE 2 was
aimed at, and it is repaired.**

**Why reading (a) still shows a non-trivial spike at the container's own left inset (x=344 / x=24),
even though reading (b) shows the rule genuinely starting all over the place.** Checked directly: of the
63 rule instances, **50/63 (79.4%) at 1280px** attach contiguously to the sentence's own last line
(`firstLineLeft` within 2px of `sentenceLastLineRight` — no gap, as CHANGE 2 requires), while **13/63
(20.6%)** find no room for even one 16px segment on the sentence's last line and the *entire* rule
wraps down to a fresh line, landing flush at the paragraph's left inset — mechanically identical to what
happens to any word that doesn't fit. At **390px, the fit succeeds 100% of the time (63/63)** — every
rule instance's first segment lands contiguous with the sentence text, zero whole-rule wraps. (`delta =
firstLineLeft − sentenceLastLineRight`, 1280px sample: −580, 0, 0, 0, 0, 0, 0, 0, 0, −580, −580, 0, 0,
0, −592, −578, …, 390px: 0 sixty-three times over.) Once a rule's *first* line is placed — attached or
sent down to the margin — every line **after** that first one is an ordinary wrapped continuation and
necessarily returns to the paragraph's left inset, the same way any wrapped paragraph's second line
does; that structural pile-up of continuation lines is what keeps reading (a)'s left-inset bucket
non-trivial even after the repair. This is not a flaw in the repair — a paragraph that wraps to five
lines has four lines that start at the margin no matter what it says — but it is why reading (a) alone
understates how much reading (b) actually changed.

#### S4b. T2 — row-pitch CV (unaffected by CHANGE 2, reported for completeness)

| width | extent | CV (single-recipient entries, n=38) | threshold (<10% trips) |
|---|---|---|---|
| 1280px | 1 | 80.7% | no |
| 1280px | 400 | 83.0% | no |
| 390px | 1 | 80.5% | no |
| 390px | 400 | 86.9% | no |

Never close to tripping, in e2 or here — T2 was never the problem.

#### S4c. T3 — staircase, total ink and longest rendered segment (both requested explicitly)

Three ink readings, because the per-recipient-slot repetition (S1) changes what "total ink per row"
means and the difference between the readings is itself the finding:

| reading | what it measures | n | Spearman r (both widths, both extents — identical) | trips (\|r\|≥0.90)? |
|---|---|---|---|---|
| **(i) sequential, per rule-instance** | ink of each of the 63 rule instances, in true document/reading order (repeats included) | 63 | **−0.9991** | **TRIPS** |
| **(ii) first-recipient-only, per entry** | one representative rule per entry (49), isolates CHANGE 2's effect from the repetition effect | 49 | **−0.9998** | **TRIPS** |
| **(iii) entry-summed, all recipients** | total ink per entry summed across every recipient-slot in it | 49 | **−0.8283** | no |

Longest rendered segment, per entry (identical whether summed or first-recipient-only, since taking a
maximum is unaffected by how many equal-length copies exist):

| width | Spearman r | e2/O1's figure (REPORT-57 §6) | trips (\|r\|≥0.90)? |
|---|---|---|---|
| 1280px | **−0.8944** | −0.9312 | no (never crossed the line either time — REPORT-57 read this by eye, no pre-committed number) |
| 390px | **−0.7781** | −0.6870 | no (ditto) |

**Reading this straight: T3 still trips, and CHANGE 2 does not touch why.** Readings (i) and (ii) —
the two readings that measure the actual day-count-to-position correlation without diluting it — sit at
−0.999x, essentially identical to e2/O1's own −0.9998 (REPORT-57 §6). This is expected and, checked
here, confirmed: "days outstanding" is rendered as literal pixel *length* regardless of where that
length starts, and near-monotone due-date ordering (O1, unchanged this pass) makes ink length correlate
with row position almost perfectly no matter which x the rule begins at. **CHANGE 2 relocates the rule's
origin; it does not change what the rule's length encodes**, and length-encodes-days is what T3 tests.

Reading (iii) — the naive entry-summed total — drops to −0.8283, under the 0.90 line, at **both**
widths and both extents (the figure is width- and extent-invariant because Spearman correlation depends
only on ranks, and per-entry-summed-ink ranks don't change with viewport). **This is not evidence the
repair fixed T3.** It is an arithmetic artifact of summing across a per-entry recipient count that is
itself uncorrelated with days-outstanding rank (Luke Chatterton's 5-recipient entry adds roughly 5× the
ink of a comparable 1-recipient entry at the same rank, purely because of how many bodies one report was
sent to, which has nothing to do with how overdue it is) — noise added on top of the real signal, large
enough at n=49 to pull the naive sum's correlation below the pre-committed threshold without the
underlying staircase having moved at all. Reporting only reading (iii) would have let the page's
apparent T3 status flip from TRIP to NO-TRIP on the strength of an accounting choice this pass didn't
even make on purpose — it followed directly from the brief's own instruction to draw the rule "per
recipient-slot." Readings (i) and (ii) are reported as the primary verdict for exactly this reason.

#### S4d. T4 — shared right terminus (no pre-committed threshold, reported as before)

| width | dominant right x | share | distinct values | e2/O1 figure (REPORT-57 §6) |
|---|---|---|---|---|
| 1280px | 936 (content edge) | **17.7%** of 113 | 51 | 33.8% of 74, 45 distinct |
| 390px | 360 (content edge) | **32.7%** of 171 | 50 | 53.3% of 105, 43 distinct — was the one width REPORT-57 flagged as majority-share |

At 390px specifically, the content-edge share fell from a bare majority (53.3%, the figure REPORT-57
§6 flagged under its own, self-declared, non-Dramaturg-sanctioned "majority" reading) to under a third
(32.7%). Under that same self-declared reading, **390px would no longer be called a T4 trip.** As
before, this is reported, not adjudicated — T4 carries no numeric threshold from the ruling, only the
structural observation that a wrapped rule mechanically must end at least one line at the content edge.

#### S4e. T5 — line-count uniformity

| width | extent | dominant line count | share | threshold (≥70% trips) |
|---|---|---|---|---|
| 1280px | 1 | 7 lines | 36.7% | no |
| 1280px | 400 | 11 lines | 55.1% | no |
| 390px | 1 | 10 lines | 36.7% | no |
| 390px | 400 | 16 lines | 34.7% | no |

Never close to tripping, in e2 or here.

#### S4f. Wrap counts, for context (`wrapcount3`, extent-invariant)

Of the 63 rule instances: **63/63 wrap onto at least a second line at 390px; 40/63 at 1280px.** (Not
directly comparable to REPORT-57 §7c's 38/49 and 25/49 — those counted *entries*, one rule each; this
counts *recipient-slot rule instances*, 63 of them, and a rule now starts partway along a line already
occupied by its own sentence, so it reaches the right edge sooner than a rule starting at x=0 would.)

#### S4g. Verdict, per width, stated plainly

| | 1280px | 390px |
|---|---|---|
| T1 | no trip (was: TRIPS, 100% @ one x) | no trip (was: TRIPS, 100% @ one x) |
| T2 | no trip (unchanged) | no trip (unchanged) |
| T3 | **TRIPS** (readings i/ii, −0.999x; unchanged from e2/O1's −0.9998) | **TRIPS** (readings i/ii, −0.999x; unchanged from e2/O1's −0.9998) |
| T4 | reported, not adjudicated (17.7%, well down from 33.8%) | reported, not adjudicated (32.7%, down from majority) |
| T5 | no trip (unchanged) | no trip (unchanged) |
| **verdict** | **STILL TRIPS (T3)** | **STILL TRIPS (T3)** |

**Does the encoding repair work? Partially, and precisely: yes for the specific mechanism it targeted
(T1 — a single, mechanically guaranteed left origin for every rule, at every width, at every extent, is
gone), and no for the register's overall verdict (the page still trips at both widths, on the strength
of T3 alone now rather than T1-and-T3). CHANGE 2 relocates where a rule begins. It was never going to
touch what a rule's length means, and "length in pixels equals days outstanding" — not "every rule
starts at the same x" — is the deeper of the two structural properties REPORT-57 §8.4 already named as
inherent to any single-column, length-encoded rule form under a near-monotone order. That finding
stands, unrepaired, because this pass's brief did not ask CHANGE 2 to touch it, and by the arithmetic
already worked through in REPORT-57 §8.4 and confirmed again here, no left-origin change could have.**

### S5. One honest paragraph — continuous, or accident?

**Both, unpredictably, and that unpredictability is itself the answer.** At 390px, every single rule in
this build (63/63) lands flush against its sentence's last glyph — no gap, no visible seam — and reads,
by eye, as one continuous stroke: a sentence that keeps going as a line instead of a period, the ink
picking up exactly where the words stop. At 1280px, the same page, the same data, the same code, the
same rule — 13 of the 63 rules (20.6%) find no room for even their first 16-pixel segment on the
sentence's own last line, and the whole rule jumps to a fresh line, flush left, with no visible
connection at all to the sentence above it: exactly the "typographic accident" reading, a stray black
bar that appears to come from nowhere, indistinguishable by eye from the pre-repair form it was built to
replace. Nothing about the *content* changed between those two cases — not the sentence, not the day
count, not the mark treatment — only whether a fixed 16px happened to fit in whatever slack was left at
the end of a line of prose, which is a fact about English sentence length and column width, not about
the report or the state's own duty. A design that reads as one continuous thing at one viewport and as
an unexplained glitch at another, purely on the arithmetic of word-wrap, is not a stable answer to the
question "does this rule read as continuous with the sentence" — it is a coin landing differently each
time depending on furniture the reader never sees (how many characters were in *this* recipient's name,
how long *this* month's name is, whether the date happened to end in a wide or narrow word). The honest
position is that CHANGE 2 makes the rule's relationship to its sentence *look* considered in the
majority of instances observed here, without making it *actually* considered in any instance — the
placement is downstream of word-wrap arithmetic the generator does not reason about, not of any
decision about how a rule ought to meet the sentence it measures.

### S6. What I would flag against myself

1. **`vertical-align: text-bottom` on `.seg`/`.mark` was my own choice, not specified anywhere in the
   brief.** It was picked so the rule sits low against the sentence's baseline the way an underline
   would, and is the only presentational decision this pass made that wasn't dictated by CHANGE 1/2 or
   inherited from e2. A different vertical alignment would not change any register-test number reported
   above (all of T1–T5 are computed from horizontal position and line-count, not vertical offset within
   a line) but would change the page's appearance, and I am naming it as mine rather than the brief's.

2. **The "56 days" numeral tension (S2) is named, not resolved.** I kept the state's digit rather than
   either spelling it out (which would itself violate the verbatim requirement CHANGE 1 exists to serve)
   or stripping the clause (which VERIFIER-57.md §2(a) already found unacceptable when e2's paraphrase
   effectively did the equivalent by dropping the clause entirely). Whoever reviews this pass next should
   treat this as a live, unresolved tension between two binding instructions, the same posture the first
   pass took toward VERIFIER-57.md's other findings.

3. **T3's three-reading treatment (S4c) is a methodological choice I made this pass, not one handed
   down.** The brief asked for T1–T5 "exactly as REPORT-57 §6 ran them," but §6's method assumed one
   rule per entry, and this pass's own grammar (per-recipient-slot rules, required by the brief's
   "each entry… then, per recipient-slot…" instruction) breaks that assumption. Reading (i) — sequential,
   per rule-instance, true reading order — is my own judgement call for which reading best represents
   "exactly as before" in spirit; reading (iii) is reported alongside it precisely so a reviewer who
   disagrees with my choice of primary reading can see the number I didn't foreground and judge for
   themselves.

4. **Extent-invariance of T1/T3/T4 was checked this time (S4, opening) rather than only inferred, as
   REPORT-57 §8.5 flagged it had not been for e2.** T2 and T5 remain extent-sensitive, checked at both
   extent 1 and extent 400 as before, not at 1825 — the same gap REPORT-57 §8.5 named for e2 applies
   here unchanged.

5. **I did not re-fetch the three head sentences' source pages independently.** Sentence 3 was
   cross-checked word-for-word against `VERIFIER-57.md`'s own independently-fetched quotation (S2) and
   matches exactly; sentences 1 and 2 were taken as bound text from this session's brief and not
   separately verified against a fresh fetch in this pass. Given VERIFIER-57.md's demonstrated pattern of
   finding exactly this kind of small, consequential mismatch in bound text, this is worth a second hand's
   attention rather than treating the brief's wording as beyond question merely because it was handed down
   as binding.

### S7. Bytes added this pass

```
   +14,448  build-57.mjs (43,267 bytes total; delta only, file pre-existed)
   122,600  e3.html
    61,083  entrance-e3-390.png
    71,574  entrance-e3-1280.png
    42,498  entrance-e3-390-foot-only.png
   903,918  still-e3-390-IMAGINED-simulated-extent-400-scaled25.png
   695,836  still-e3-1280-IMAGINED-simulated-extent-400-scaled25.png
---------
 1,911,957  bytes added to the repository this pass, before this section of REPORT-57.md
```

This section of `REPORT-57.md` (§"SECOND PASS — e3, the encoding repair" through the end of the file)
added **~26,600 bytes** to the existing, unaltered 34,795-byte file — not a word of the first pass's
text above this section was changed. (Approximate, with a "~", for the same reason REPORT-57 §4 gave
its own report-file size as "~24,000": a self-referential exact count chases its own tail — fixing the
number changes the file the number describes. The figure is a post-hoc measurement of this section's
own text, taken once, not re-chased to false precision.)

### S8. Files added to the repository this pass

```
etudes/you-are-under-a-duty/e3.html
etudes/you-are-under-a-duty/entrance-e3-390.png
etudes/you-are-under-a-duty/entrance-e3-1280.png
etudes/you-are-under-a-duty/entrance-e3-390-foot-only.png
etudes/you-are-under-a-duty/still-e3-390-IMAGINED-simulated-extent-400-scaled25.png
etudes/you-are-under-a-duty/still-e3-1280-IMAGINED-simulated-extent-400-scaled25.png
```

`build-57.mjs` and `REPORT-57.md` were both extended in place (not replaced) — see S1 and S7 for the
bytes added to each. All other HTML built this pass (the extent-400 source file, the foot-only variant,
the full-resolution pre-downscale stills, the `measure-dom3`/`wrapcount3` analysis scratch scripts) was
built and measured in the session scratch directory and deleted before finishing — none are part of
this pass's committed object.

No commit was made to git.
