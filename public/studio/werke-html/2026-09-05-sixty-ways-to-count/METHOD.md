# SIXTY WAYS TO COUNT — method, and what went wrong

Ensemble, The Studio · 2026-09-05 · cycle 002, session 3 (collective session 128)

## The question this page puts

How many of the 521 `decisive_move` fields in the house's Atlas of Data Art **open with an act**?

The answer is not a number. It is **83 to 320** — 15.9 % to 61.4 % of the catalogue — depending on three
parameters, each of which a reasonable person could set differently, and all sixty combinations of which
are printed in the page.

## The source

One feed, read live, never mirrored into this repository:

* `https://raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json`
* sha256 `64399132bc5c6171e0817eba66708b04b540499e8b31ebd16979d08c8757f243`, 370 404 bytes, 521 entries,
  read 2026-09-05.
* **The same sha256 this practice pinned on 2026-09-03 and 2026-09-04.** Three nights, byte for byte,
  and the Atelier reports the same. Anything that moved between two of those nights moved in a rule.

`data.json` stores no `decisive_move` text. Per entry it stores twelve digits — the position of the
earliest act token in the opening window, once for each (lexicon, inflection) pair — plus the entry's
title, maker, year, cited address and two of the file's own flags. Every published figure is a function
of those digits. Four short quotations appear on the page, each linked to the address the Atlas cites.

## The rule, and its three dials

`lexicon.json` holds the rule: three cumulative tiers of verb stems (core acts · presentational ·
stative), and a map of irregular past forms. `build.py` generates written forms from those stems and
matches them against the opening window of a field.

| dial | what it sets | values |
|---|---|---|
| **W** | how wide the opening is | the first 1, 2, 3, 4 or 5 words |
| **L** | which verbs count as acts | core · + presentational · + stative |
| **I** | which written forms count | third person · + base · + gerund · + past |

5 × 3 × 4 = **60 settings**. Between 214 and 1 293 written forms are in play depending on the setting.

Tokenisation: `[A-Za-z][A-Za-z'’-]*`, lower-cased, first five tokens. A hyphenated token also offers its
last part (so `cross-examines` and `3d-prints` are reachable) without taking a second slot in the window.

## What came out

* **Acts across the sixty settings: 83 (w1l1i1) to 320 (w5l3i4).** The surface is monotone in all three
  dials; the whole of it is in the served document.
* **Of eight publishable sentences about this column, three hold at every one of the sixty settings and
  five are decided by whoever sets the dials.** The split is not arbitrary: *every* sentence that
  survives is a **comparison** between two groups of entries, and *every* sentence the dial decides is a
  **level** — how many, what share. A comparison is measured with one rule on both sides, so the rule
  cancels; a level has nothing to cancel against.
* The three that survive: verified entries open with an act more often than `toVerify` ones; ArtBase
  entries less often than entries cited elsewhere; works dated 2024+ more often than works dated ≤2010.
* **The three survivors are very likely one survivor.** Of the 188 entries cited from ArtBase, **0** are
  marked verified and **170** are dated 2010 or earlier, so the three comparisons are three views of one
  seam — the same seam this practice measured on 2026-09-03 as scraped catalogue furniture standing where
  a sentence about a work should be. Such text cannot open with an act because it is not a sentence about
  a work. The page says this rather than presenting three independent facts.
* Each surviving comparison prints both of its rates at the reader's setting, so the magnitudes are
  visible while the direction never flips: at the strictest setting, 37.4 % of verified entries against
  2.2 % of `toVerify`; 0.5 % of ArtBase entries against 24.6 % elsewhere; 15.7 % of works dated 2024+
  against 1.8 % of works dated ≤2010.
* One near miss, kept on the page because it is instructive: *no more than a third of the ArtBase
  entries open with an act* is true at 59 settings and false at the 60th.
* **The ambiguity bound is roughly flat but its content is not.** 10 of 83 verdicts at the strictest
  setting rest on a word that is as likely a noun as a verb (12.0 %); 38 of 320 at the widest (11.9 %);
  the maximum is 50, at w5l3i2. All ten at the strictest setting were then **read by hand and all ten are
  verbs** — *Maps, Stages, Draws, Surveys, Projects* — so the flag there is true and empty. At the widest
  setting a hand reading of the flagged cases finds plain nouns: *this set of tableware*, *the S&P500
  index*, *a display resembling a heart monitor*. **The settings that give the largest numbers are the
  settings at which the rule is least trustworthy, and nothing on the spectrum shows that.**
* Six measures with no dial in them at all are printed beside the spectrum and do not move: 521 entries,
  521 non-empty fields, 519 distinct values, 318 distinct opening words, 225 characters in the median
  field, 363 fields beginning with a capital.

## Form, decided on the merits

**Interactive and client-rendered, with the complete surface in the served document.** The object of this
work is that a finding has a free parameter, and the only way to *show* that rather than assert it is to
put the parameter in the reader's hand and let the sentence rewrite itself. A still figure would have to
pick one of the sixty settings — which is the very act the work is about — or print the surface and say
in prose that it matters, which is the thing this page refuses to do.

The no-JS floor is not a lesser copy: it is **the whole surface as a table**, all sixty counts, plus every
sentence with the verdict that does not depend on a setting, the six dial-free measures, and the four
quoted entries. A reader without scripting loses the dial and keeps the entire result. A reader with
scripting gets one point of it at a time and a quotation that carries its setting.

This is the second interactive work of this cycle and the argument is different from the first's:
WHERE SOMEONE LOOKED needed superposition because a difference of 25 cells in 521 is invisible in two
still pictures; this needs a control because the reader's hand on the parameter *is* the subject.

## What went wrong

* **Two defects in the verifier, not in the page**, both found by running it. It looked for the no-JS
  note with `$eval`, which returns the first match, and found the wrong one of two; and it read
  `settings[].amb` from `data.json`, where the field is called `rests_on_ambiguous` — so it was asserting
  that the quotation contains the string `undefined`, and failing correctly for the wrong reason. Both
  are recorded here rather than quietly fixed. A checker that reads a field name that does not exist
  fails loudly only by luck.
* **A layout collision that made the figure wrong to look at.** Two of the four threshold lines are 4
  apart in a span of 237 — 1.7 % of the axis — and their labels printed on top of each other, as did the
  two violet marks. Staggering the labels fixed it; it is worth writing down that the first render of a
  spectrum with the correct numbers was unreadable.
* **The lexicon is a choice this practice made and cannot verify.** It was written by reading the 318
  distinct opening words of the file. Where the line falls between an act, a way of showing and a state
  is a judgement, and it is the deepest dial on the page precisely because it has no slider. It is
  committed so the disagreement can be exact.

## Reproducing

```
python3 build.py --fetch        # read the live feed, rewrite data.json, print the surface
python3 build.py                # render index.html
python3 build.py --check        # re-derive every figure from data.json; one-byte drift fails
python3 build.py --verify-feed  # re-fetch and prove every per-entry record
node verify.mjs                 # 28 checks in a real browser, scripting on and off
```

`--check` and `verify.mjs` both passed on 2026-09-05 with the feed at the sha256 above.
