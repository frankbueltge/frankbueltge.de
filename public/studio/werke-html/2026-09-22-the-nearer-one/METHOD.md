# THE NEARER ONE — method, decisions, and what was nearly published

Ensemble · The Studio · 2026-09-22 · session 141

## 1. The design

One question — *of these two colours, which is nearer to this one?* — put to five
formulas, over every triple of a fixed palette. The question was chosen because it needs no
unit: a comparison is scale-free, so nothing on this page depends on whether one formula's
numbers are ten times another's. Only the ordering is used, anywhere.

**The palette.** The 216 colours of the web-safe palette: six levels per channel,
`00 33 66 99 CC FF`. Chosen because it was manufactured for *agreement* — so that a picture
would look the same on every machine with a 256-colour display — and because it is generated
by a rule rather than copied from a table, so no third-party data enters the work. Three
loops produce all 216.

**The census.** 216 references × 23 005 candidate pairs = 4 969 080 questions. Every one is
asked. Nothing is sampled, estimated or drawn at random.

**The parameters.** sRGB as the source space (IEC 61966-2-1 linearisation and primaries);
CIELAB with the white point taken from the primaries matrix itself, so that white lands on
L\* = 100, a\* = 0, b\* = 0 exactly rather than a hundredth off its own origin; CIE94 at its
graphic-arts parameters (kL = kC = kH = 1, K1 = 0.045, K2 = 0.015); CMC at 2:1; CIEDE2000
with kL = kC = kH = 1. These are the settings each formula is most often shipped with, not
the settings that made the numbers biggest. Other choices are legitimate and would move
every figure here.

## 2. Verification

**Two implementations, two languages.** `colour.py` and `census.py` produce the figures;
`verify.mjs` writes all five formulas a second time in JavaScript from the same published
definitions, structured differently on purpose, re-asks all 4 969 080 questions, redoes the
triangle sweep over all 9 938 160 ordered triples and the role-swap sweep, and checks every
number in `counts.json` against its own. It then opens the page in a real browser with
scripting on and with scripting off, the network denied in both, and reads the drawn squares
and the drawn strips back out of the SVG rather than trusting a caption. **651 checks,
0 failed**, on 2026-09-22.

A second transcription catches a slip of the finger. It does not catch a shared misreading
of a standard, and this record says so rather than letting the reader assume otherwise.

**CIEDE2000 is checked against a published test set.** The supplementary test data of
Sharma, Wu & Dalal (2005) — 34 pairs of CIELAB values with their published difference — was
fetched once from the authors' page on 2026-09-22 (SHA-256 in `sources.json`; not copied
into this repository). All 34 reproduce to four decimal places; the largest deviation is
4.95 × 10⁻⁵. Four of the 34 rows are quoted in `verify.mjs` as a short quotation with
source, so the check runs offline.

**CIE76 and sRGB Euclidean** are Euclidean norms and are checked against the definition of
one.

**CIE94 and CMC are the weak links, and are named as such.** No published test set for
either was retrieved tonight. CIE94 has one structural check that bites: at a neutral
reference its weights all become 1 and it must reduce exactly to CIE76, which the verifier
measures over all 138 030 comparisons at the palette's six neutral references (worst
difference 2.8 × 10⁻¹⁴). CMC has no such check here; it rests on two transcriptions alone.

**What survives if both weak links are wrong.** Discard CIE94 and CMC entirely and ask the
question of the three whose transcription is verified: sRGB Euclidean, CIE76 and CIEDE2000
still contradict each other on **1 367 646 of the 4 969 080 triples (27.52 %)**, against
30.51 % for all five. The two *verified perceptual standards alone*, CIE76 and CIEDE2000,
contradict each other on **748 313 (15.06 %)**. The headline does not depend on the two
formulas this work cannot fully vouch for.

## 3. What was nearly published, and was not

**The triangle table, first version, said all five formulas violate the triangle
inequality.** The first census run compared `direct > via` strictly and found 1 296
violations for sRGB Euclidean and 6 for CIE76 — both of which are Euclidean metrics and
cannot violate it. Every one of those "violations" is at the fourteenth decimal place, on
triples of colours lying on a straight line, where the inequality is an equality that
binary floating point cannot store. Published as it stood, the headline would have been
*none of the five is a distance*, which is false, and it would have been the better
headline. The tolerance test that separates the two cases was added afterwards, both counts
are on the page, and this paragraph is the record of the version that was wrong.

**Then the second implementation disagreed about the wrong number.** Recounted in
JavaScript, sRGB Euclidean gives the same 1 296 apparent violations and CIE76 gives **16**
where Python gave **6**. Both are rounding; the *count* of rounding is a property of the
arithmetic and not of the formula, and two honest implementations need not agree about it.
The three real counts — 137 673, 323 189 and 347 880 — are identical in both, triple for
triple. Both numbers are on the page, which is the point: a count worth reporting is one
that survives being counted by something else. Without the second implementation this
would have gone out as a fact about CIE76.

**The gallery was nearly chosen by eye.** The first gallery rule was "the most divided
contradictions, strongest first, one per reference colour". It produced twelve cases, ten of
which were the same division (sRGB and CIEDE2000 against the other three) — accurate, and a
misleading picture of how the five actually split. The rule was replaced, before anything
was drawn, with the complete one: all fifteen possible divisions, the loudest case of each,
with how often each occurs. Nothing on the wall was picked for how it looks.

## 4. Decisions taken here rather than asked

1. **No formula is graded and none is called wrong.** Every behaviour measured is in the
   published definition of the formula that has it. Writing this as a defect report was
   available and was declined; a disagreement between two standards is not evidence against
   either of them.
2. **No answer key was manufactured.** A set of human colour-difference judgements could
   have been fetched and used to score the five. That would have replaced a finding about
   disagreement with a demonstration of who wins, on a dataset chosen by us, and the page
   would have ended in a ranking it cannot support. No such set was used.
3. **The reader's answers are not collected.** A work that asks thousands of people which of
   two colours is nearer and keeps the answers is the obvious version of this. It was not
   built. A screen of unknown calibration in a room of unknown light, showing swatches that
   sit next to each other and change each other, is not a viewing booth; the data would have
   looked valuable and been worth nothing, and collecting it would have needed a network the
   work does not have. The tally lives in the browser tab and dies with it.
4. **The page is grey.** Every colour on it that is not a measured swatch would change what
   the swatches look like. This is stated in the stylesheet, where the decision is.
5. **Hito Steyerl's *How Not to Be Seen* is not named as a neighbour**, although a work shot
   on a photographic calibration-target field looked like one. Its address refused this
   instrument (HTTP 403 on 2026-09-22), nobody here looked at the work, and a neighbour
   paragraph about a work nobody looked at is a sentence about a sentence. Recorded in
   `sources.json` under what was fetched and not used.
6. **The Atlas's address for *AI, Ain't I a Woman?* is dead (404) and was not repaired.**
   The work was read at the artist's own account of it instead. Whether an Atlas entry is
   repointed is a curator's decision and not a practice's.

## 5. What would show this wrong

- **If the contradiction rate collapses on a different palette**, the 30.5 % is an artefact
  of a 51-step lattice rather than a fact about these formulas. The rate is reported as a
  property of *this* palette throughout, and a finer or coarser one is a one-line change to
  `colour.py`.
- **If a published set of human judgements shows one of the five tracking it far better than
  the others on exactly the triples where they split**, then "there is no answer key" is too
  strong a framing. It would not move a single count on the page; it would move what the
  page means.
- **If the CMC transcription is wrong**, every figure naming CMC moves. Section 2 states
  what is left standing without it.
- **If a third implementation finds a real triangle violation the two here miss**, the
  counts in section 3 are wrong in the direction that matters, and the apparent-violation
  discussion is understated rather than overstated.

## 6. Sourcing, plainly

The five formulas are transcribed from their published definitions; which definition, and
what was and was not checked against a source, is listed formula by formula in
`sources.json`. The Atlas was read live from the house feed and is not mirrored here
(SHA-256 in `sources.json`; 521 entries; the sixteenth session at that hash). Four Atlas
neighbours were opened at their own addresses before building, and what was seen at each is
on the page. No third-party code is embedded in this work, so the licence rule of the
direction of 2026-09-03 had no case to decide. No model was called at any point in the
build. `HEYGEN_API_KEY` was checked for in the session environment at open: not present,
the sixteenth consecutive check.

## 7. Rebuilding

```
python3 census.py           # data.json, counts.json  (~16 s)
python3 census.py --ledger  # and the 24 MB answer ledger itself, whose SHA-256
                            # is in counts.json either way
node   verify.mjs --emit    # crosscheck.json — the second implementation's own books
python3 build.py            # index.html
python3 build.py --check    # rebuild and compare, byte for byte
node   verify.mjs           # 651 checks, browser included
```
