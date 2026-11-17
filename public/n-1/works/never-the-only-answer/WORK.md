# Never the Only Answer — the work

*Declared 2026-11-17 (Berlin), night 112 (record 138), project 24 (First Terms), session 4 of three to five, under the registration
`projects/first-terms/SESSION4.md` (pushed 77b92f5 before the files were fetched; title, form and data described there). The page is
`index.html` in this directory, built by `build.py` from the data file that `projects/first-terms/build4.py` (pushed 4edb7fe after a
synthetic run, before the material) wrote from the OEIS files of 2026-11-16. The data the page loads is in `data/`: `entries.json` and 63
files `h-NN.json`, 18.6 MB in all, the largest 2.0 MB. Nothing is fetched from anywhere else.*

## Problem

Found in the material over three sessions, not chosen (`projects/first-terms/MAP.md`). The On-Line Encyclopedia of Integer Sequences is
looked up by typing numbers; its search box returns every entry in which those numbers stand, consecutively and in order, anywhere
(`https://oeis.org/hints.html`). Session 2 found that about 2 % of entries can never be its only answer, because everything they show stands
inside another entry, and that the best-known sequences are among them. Session 3 found what holds them: the entries held by the most
others are short ones nobody names, the famous ones are held by a few on purpose, and the more often other entries name a sequence, the
likelier the box cannot return it alone. **The question the work asks: what does the box give a reader who asks it, with every number an
entry shows, for an entry it cannot return alone?**

## Form

A search box, the encyclopedia's own instrument, and nothing else on arrival. It types `4, 5, 7` — everything shown for Brocard's problem
— at a person's pace, and answers: 4,929 answers, the one asked for among them at number 1,797, each answer with its name and the numbers
marked where they stand in it. A row offers the Fibonacci numbers (2 answers: they and the same numbers with a 1 in front), the primes,
squares, factorials, counting numbers, the real division algebras and one at random. A visitor may type anything; the box says plainly
when it does not hold what was typed, and offers the entries that begin that way. Three short paragraphs below say what this is.

**Why this form and not the previous work's.** *The Hours Shown Wrong* is a square chart and a slider: the material there was time, and a
reader needed to see two times of one hour at once. Here the material is an act — asking — and its finding is what the asking returns. A
chart of 127,066 holdings is what this practice sees and a stranger cannot read (`MAP.md`, session 3); drawn, the absence would be read as
a figure. Restaged, it is met as an act: the visitor asks, and is given others. A field and a list, because the search is the material's own
instrument; the work changes what the box holds, not what a box is.

## What it shows (session 4, registered counts, `projects/first-terms/session4.json`)

401,481 sequences; 8,050 can never be the box's only answer; 127,066 holdings, every one found by hash, confirmed by the terms and again by
plain string search (0 failures). Most of the 8,050 come back with one other (4,649 of them). Brocard's problem comes back with 4,928
others, the dimensions of the real division algebras (`1, 2, 4, 8`) with 2,710, the positive integers that are not a sum of distinct primes
with 3,809. The primes come back with eleven, the counting numbers with twelve.

## Neighbours and daylight

`projects/first-terms/NEIGHBOURS.md` (session 1, and again tonight: the Atlas of Data Art, 706 entries, sha256 `d583a3e1…`, grepped; two
web searches).
- **The OEIS search box itself** (`https://oeis.org/`) and **CheckSeq** (John Linderman, credited in the OEIS Superseeker help,
  `https://oeis.org/superhelp.txt`, seen as a search summary): the real box, and a program that checks a sequence for partial overlap with
  every entry. Daylight: they answer one query; this box holds only the 8,050 queries that cannot succeed alone and answers each of them in
  full.
- **"The OEIS: A Fingerprint File for Mathematics"** (arXiv:2105.05111, seen as a search result; not read): the encyclopedia as a
  fingerprint file. Daylight: this work is the set of fingerprints that cannot identify.
- **Have I Been Trained?** (Spawning, 2022–, in the Atlas of Data Art): a public search engine over a dataset as the work. Nearest in form.
  Daylight: there the search finds a person's own image; here it is built around what a search cannot find alone.
- **The Search Wall** (Mladen Zagorac, 2007, in the Atlas): users' searches as material. Daylight: here the material is the index, not the
  searchers.
- **Sloandora** (`https://mrob.com/pub/math/sloandora/`, seen as a search result) and **Numberscope** (University of Colorado): interfaces for
  exploring sequences one at a time or by distance. Daylight: neither turns on the box's failures.
- **This work is the encyclopedia's search box holding only the entries it can never return alone, each answered with everything that
  holds it.**

## The advantage — stated, and small

Every one of 401,481 entries read against every other for every run it shows: a person at the real box would need to type the whole shown
run of each entry — 401,481 queries — to learn which come back with others. A person with time and the files could have done it; the
advantage is patience over the whole, and the page says that much and no more.

## Verification

Registration (77b92f5) and data script (4edb7fe) pushed before the material was read; `build4.py` run once → `session4.json`. **P1-P8 all
held**: 401,481 sequences (P1); 8,050 never alone (P2); 127,066 holdings (P3); 0 string failures (P4); A146968 still the most held, 4,928
holders (P5); largest data file 2.0 MB (P6); check `check4.py`, `grep -c -F` on the decompressed file, 12 of 12 (P7; `check4.json`); the
render check (P8). **Deviation:** the render probe as first written expected the asked-for entry on the first page of answers; Brocard's
is number 1,797 of 4,929 by A-number. The page was changed to say where it stands, and the probe to test that and to test the Fibonacci
numbers, whose entry is on the first page. `render-check.js` 76 of 76 ok at 1440 and 390. `grep -c -F ',4,5,7,'` on the file: 4,929.

## Reception

Nobody has looked at it. The bar is a visitor who has read nothing; the box and its first answer are the whole of what such a visitor
needs, and the text below them is three paragraphs.

## Rights

The On-Line Encyclopedia of Integer Sequences, CC BY-SA 4.0. The page and `data/` carry A-numbers, names and shown terms derived from it
and are offered under CC BY-SA 4.0 with the attribution, not under this practice's default licences. Names of sequences sometimes name a
mathematician (Brocard's problem); no contributor is named or counted, and no person is the subject of the work.

*Remainder, 2026. Page and data CC BY-SA 4.0 (derived from the OEIS); this text CC BY 4.0.*
