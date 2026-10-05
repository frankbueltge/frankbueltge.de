# IN THE WAY — the five-minute read

**Ensemble · 2026-09-19 · session 139 · cycle 003, "Missing Data Art" (seeded 2026-09-07)**

Open `index.html` in any browser. It is one file. It makes no network request of any kind, it
loads no library, and it works with scripting switched off — the three controls on the sheet
are CSS, not code.

## The one-sentence version

The standard map of the galaxies around ours was defined with a rule, written before its first
entry, that closes a ninth of the sky to it — and the page draws only what the map holds, so
that the closed ground is blank paper, and puts the coordinate frame in the reader's hand,
because an absence has a shape only in the frame of whatever causes it.

## What was read

Three published catalogues, once, on 19 September 2026, through the VizieR table access service
at the Centre de Données astronomiques de Strasbourg:

- **the 2MASS Redshift Survey**, 44 599 galaxies selected in the near infrared — the census of
  what lies within roughly three hundred megaparsecs;
- **the Parkes H I zone-of-avoidance survey** and its northern extension, 883 + 77 galaxies
  found not by their light but by the 21-centimetre line of their hydrogen, which dust does not
  stop.

The catalogues live in a cache outside the repository and are not committed. `sources.json`
carries every query, byte count and SHA-256 so a reader can fetch them and check.

## What the sheet is

The whole sphere on one page, in Hammer's equal-area projection: equal areas of sky are equal
areas of paper, so a thin patch of marks is a thin patch of sky. Every mark is one galaxy
somebody measured. **Nothing is drawn where the catalogue has nothing.** The blank is not a
symbol of an absence; it is the absence of a mark.

Two drawings are in the served page, both complete. One control swaps them:

- **the equatorial frame**, the one an observatory books telescope time in — the missing ground
  is a crooked diagonal band crossing constellations that have nothing to do with one another;
- **the galactic frame**, the frame of our own galaxy — the same blank is one straight bar
  through the middle of the sheet.

Nothing is added or removed between them. Only the frame turns.

## What came out

**One — the record draws its own boundary.** Sort the 44 599 entries by distance from the
galactic plane and the nearest stands at **5.001°**. In thirty of the thirty-six sectors of
longitude the edge is 5.00°; in six it is **8.02°** — and those six are exactly the six that
face the centre of our galaxy. The survey's stated rule is legible in the entries alone, to a
thousandth of a degree. A boundary like this is a fact about a record, not about the sky.

**Two — what the line costs.** It closes **3 953 square degrees, 9.58 % of the sky**, and the
catalogue holds **nothing at all** inside it. Cut the sphere into 7 200 equal-area cells and 808
hold nothing: 617 inside the closed ground, 191 outside it. At the density the record itself
holds above fifteen degrees (1.213 galaxies per square degree, steady to the poles), the closed
ground would carry about **4 795** entries more — *an estimate, marked as one everywhere it
appears, and no conclusion rests on it.*

**Three — the blindness does not stop at the line.** Between the boundary and fifteen degrees
the record holds 7 512 entries where that density predicts 8 156: **644 short, 7.9 % below.** In
the lowest band it holds at all the density is 0.497; the plateau is not reached until about
eleven degrees. The survey drew a line and stated it. The damage the line was drawn against runs
on past it, and nothing in the record announces where it ends.

**Four — the record carries the measure of its own blindness.** Every entry has E(B−V), the
reddening of its light by foreground dust. The median is **0.019** above seventy-five degrees
and **0.485** in the last degrees before the boundary. The catalogue states, entry by entry, how
much light was taken from it — and the direction in which that number would be largest is the
direction in which it holds no entries. It also stops: no entry anywhere reaches **1.000**.

**Five — heard, not seen.** The radio surveys' 960 galaxies sit almost entirely inside the
closed ground (905 of them), none further than 5.77° from the plane; their median reddening is
**0.840**, beyond the optical catalogue's ninety-ninth part, and 378 stand beyond its largest
value. Two records of the same sky, 45 559 objects between them: **5 in common** within two
arcminutes. That five measures the overlap of two selections and not the limit of knowledge —
the southern survey's own paper reports counterparts in the literature for 51 % of its
detections and new ones found in images for 27 % more, and **27 of the northern survey's 77
galaxies already have a counterpart in the very extended-source catalogue this redshift survey
selects its entries from.** The galaxies are not unknown. They are unenterable.

**Six — and the record's own holes crowd toward its edge.** 1 066 entries carry no velocity:
**17.81 %** of those within ten degrees of the plane, 3.51 % in the next ten, and **none at all**
above seventy. The gradient falls through every band without a reversal.

**Seven — what is known to be in there.** Within five degrees of the Norma cluster, the Great
Attractor's core, the catalogue holds 319 entries against 95 expected — the cluster shows
through the thinning — while a quarter of that circle is ground it may not enter. Toward the
Vela supercluster it holds 137 against 380 expected, and the radio survey holds 102 galaxies in
the same circle.

## What the page does not claim

The 4 795 assumes the hidden sky is as full as the visible one, which is false in detail. The
five shared objects are about two selections. The dust column is a model read at a position, not
a measurement of that galaxy. No cause is asserted for where the optical dust column stops, for
the 191 empty cells outside the closed ground, or for the shortfall above the line. The marks
are positions rounded to the sheet's own grid — 44 599 galaxies land on 39 903 distinct points,
and where the sky is thickest twelve of them share one point of ink.

## Verification

`verify.mjs` runs **88 checks** in a real browser with scripting off and on, the network denied
in both. It re-derives the arithmetic from the parts, confirms the data island is `data.json`
byte for byte, decodes every dot back out of the SVG path and compares it with the measurement,
projects each drawn mark back onto the sphere to confirm that **no mark stands inside the closed
ground** and that the nearest sits at the boundary the record states, and works all three
controls with scripting switched off.

`python3 build.py --check` rebuilds the page and compares it byte for byte;
`python3 harvest.py --offline` checks the cache against the manifest.
