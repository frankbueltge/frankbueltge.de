# REPORT — étude `you-are-under-a-duty/e1.html`

Built tonight, 2026-08-01, per §10 of `projects/pfd-channel/ARTIST-PROPOSAL-56.md`. Discardable.
Dies with the concept if the concept dies; not re-gradable into a work.

Data: `projects/pfd-channel/data/nonresponse-tables-2026-08-01.json` (4 tables, 49 rows).
Observation date fixed at 2026-08-01. No network access used; nothing here is fetched.

---

## 1. What was built

`/home/user/studio/etudes/you-are-under-a-duty/e1.html` — one static, self-contained HTML file.
No `<script>`, no network request, no external asset, no web font (checked: zero `<script>` tags,
zero `http(s)://` references in the file). Font stack: `Georgia, Cambria, "Iowan Old Style", "Times
New Roman", Times, serif` — a plain system serif, black text (#000) on white (#fff), one column,
max content measure 640 px.

Per row, in one column of running prose, no table/grid/rules/alternating background/aligned
columns:

1. the deceased's name, alone on its own line (set in small caps — a heading style, not a table
   header row, no border under it);
2. one present-tense sentence per recipient — *"<Recipient> is under a duty to respond to
   this report, namely by <date in words>."* Rows with `|`-separated recipients produce one
   sentence per recipient, run on as successive paragraphs under the same name;
3. the inherited rule — a solid black bar whose length in CSS px equals
   `(2026-08-01 − Response Due Date)` in days, built from abutting 16px-wide `<div>` segments
   inside a `display:flex; flex-wrap:wrap` container so it wraps at the content measure exactly
   the way text wraps — followed immediately by one discrete mark (a short black tick, visually
   distinct from the thin 2px rule) for the single day observed.

**Multi-recipient rows:** 11 of the 49 rows name more than one recipient (10 rows with 2
recipients, 1 row — Luke Chatterton — with 5). Those 11 rows produce 25 sentences; the other 38
rows produce 38 sentences (one each). **Total: 63 sentences across 49 rows/names**, matching the
material file's own count of 63 recipient-slots.

Ordering: oldest duty first (largest days-outstanding first) — **Matthew Wickes at 869 days**
opens the page, **Winifred Wardle at 166 days** closes it, matching the figures already
counted in the Artist's proposal (§4: shortest 166, longest 869).

Numerals: the visible text contains exactly one digit character outside CSS — the "4" in the
recipient name **"Care4U Healthcare"**, printed verbatim as the state prints it (legal-hygiene
rule: recipient names are never altered). No date, day-count or year appears as a figure anywhere
on the page; the observed-date line and the source footer are also spelled out in words
("Observed the first of August, two thousand and twenty-six" / "…retrieved the first of August,
two thousand and twenty-six") so the page carries no incidental numeral column either.

## 2. Stills rendered (all in the same directory)

Five, as specified — three at extent 1 (the built page as it stands), two simulated (marked
`IMAGINED-simulated-extent` in the filename, per instruction, and labelled simulated here):

| file | width | extent | status |
|---|---|---|---|
| `e1-1280.png` | 1280 | 1 (built) | real |
| `e1-768.png` | 768 | 1 (built) | real |
| `e1-390.png` | 390 | 1 (built) | real |
| `e1-IMAGINED-simulated-extent-30-390.png` | 390 | 30 marks | **SIMULATED — a study, not a unit** |
| `e1-IMAGINED-simulated-extent-400-390.png` | 390 | 400 marks | **SIMULATED — a study, not a unit** |

Two more combinations (extent 30 and extent 400 at 1280 px) were rendered only to a scratch
directory purely to obtain the height/wrap measurements below — they were not delivered as stills,
to keep the delivered count at five as instructed, and are not part of the built claim.

Simulated pages were produced by an unshipped variant of the same generator with the mark count
set to 30 and 400 respectively; they exist only as `sim30.html` / `sim400.html` in the build
scratch directory, not in the étude directory, and are not the artifact.

## 3. Measurements (numbers, not adjectives)

**Total page height, px, by width and extent** (full-page screenshot height):

| | 1280 px | 768 px | 390 px |
|---|---|---|---|
| extent 1 (built) | 11,372 | 11,372 | 14,407 |
| extent 30 (SIMULATED) | 11,453 | — (not rendered) | 14,569 |
| extent 400 (SIMULATED) | 12,803 | — (not rendered) | 16,999 |

**Served bytes of the HTML:**

| extent | bytes | note |
|---|---|---|
| 1 | **94,206** | `e1.html` — the actual delivered file |
| 30 | 131,204 | `sim30.html` — SIMULATED, study file only, not delivered |
| 400 | 602,591 | `sim400.html` — SIMULATED, study file only, not delivered |

The extent-1 file is 94,206 bytes for 49 duties / 63 sentences / 27,386 cumulative days of rule —
consistent with the proposal's own claim that the accumulation is characters, not page renders.

**Overflow / clipping at 390 px** (measured via `document.documentElement.scrollWidth` against the
390 px viewport, plus a per-element `scrollWidth` vs `clientWidth` check on every `.name` and
`.sentence` element):

- `scrollWidth` = **390**, viewport width = **390** — equal, no horizontal overflow, at extent 1,
  30 (sim) and 400 (sim).
- 0 of the name/sentence elements have `scrollWidth` exceeding `clientWidth` at any extent tested
  — no sentence is clipped.

**The blank-run test** (390 px still, largest extent = 400, i.e.
`e1-IMAGINED-simulated-extent-400-390.png`, 390 × 16,999 px, decoded with a pure-Python PNG
reader — zlib + manual scanline unfiltering, no Pillow available or used):

- (a) longest run of consecutive image rows with no non-white pixel: **180 rows** (rows 16,819–
  16,998 — the last 180 rows of the image, i.e. the padding below the footer at the very foot of
  the page).
- (b) as a fraction of a full 844-px phone screen: **180 / 844 = 0.213** — a little over a fifth
  of one screen.
- (c) distinct luminance values inside that 180-row run: **1** (every pixel decodes to RGB
  (255,255,255), luminance 255). **There is no hole there. There is a void** — a single flat value,
  not a gradient, not a texture, not compression noise: pure, uniform white for the full 180 rows.

  (For reference, the next-longest blank runs on the same still were 104 rows near the top — the
  gap between the observed-date line and the first entry — and a repeated pattern of 74-row runs
  between entries whose rule is short enough to leave clear space above the next name. All were
  checked; 180 is the longest, and it sits in the page's own margin, not inside the register.)

**Wrapping — how many of the 49 rules exceed the measure, at each width** (measured directly in
the rendered DOM: for every `.rule-line`, whether its `.seg` children land at more than one
distinct `bottom` pixel offset — cross-checked against pure arithmetic on days-outstanding vs. the
CSS content width, which matched exactly in both cases):

| width | content measure available to the rule | rules that wrap (of 49) |
|---|---|---|
| 1280 px | 592 px (640 px max-width minus 24 px padding each side) | **25** |
| 768 px | 592 px (same — 768 px viewport still exceeds the 640 px cap) | **25** |
| 390 px | 342 px (390 px viewport minus the same padding, below the cap) | **38** |

## 4. The verdict

Does this read as sentences, or as a table with its borders turned off? At extent 1 — the actual
built object, not the simulation — **it reads as sentences.** Each entry is a small-caps name
functioning as a heading (the way a dictionary or a witness statement sets a heading, not the way
a `<th>` sets one), one to five paragraphs of ordinary prose sentence following it, and a rule
whose length and wrap point differ entry to entry because the underlying number differs — nothing
lines up across entries because nothing was built to line up: sentence blocks run one to four
lines depending on the recipient's name, rules run one or two visual lines depending on the debt,
and there is no shared baseline grid a reader's eye could mistake for column rules. Looking at the
1280 px and 390 px stills side by side, the page's rhythm comes from re-reading the same sentence
shape forty-nine times, not from scanning aligned fields — which is the test the register form
would fail and this passes. The one place I would flag against myself, honestly, rather than let a
later gate find it: the *simulated* extent-400 still turns each rule's tail into a dense
barcode-like band of ticks that starts to read like a sparkline or a bar chart rather than a
sequence of daily marks a reader could count — that is a real risk for the work at scale, and I am
naming it now rather than waiting to be shown it. But that drift belongs to the simulation, marked
`IMAGINED` on its face and excluded from the built claim by the instructions themselves; the built
artifact, `e1.html` at extent 1, is one mark per entry, and it reads as a sentence with a scar
under it, not as a row in a table with the lines erased.

---

*Build script, PNG decoder and simulated-extent HTML variants used to produce these measurements
live in the session scratch directory and are not part of the étude; only `e1.html` and the five
stills are the built object.*
