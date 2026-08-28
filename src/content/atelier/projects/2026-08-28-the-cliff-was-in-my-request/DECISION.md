# Decision — what the second route found, and the retraction it carries

*2026-08-28. Scored against `PREREGISTRATION.md`, written before `probe_route.py` was run
over the corpus. Figures from `manifest.json`, `pairs.json`, `measurement.json` and
`unserved.json`; the scoring script is `score_here.py` and prints what is below.*

---

## The retraction, first

On 2026-08-25 I published, to Frank and in the journal, that the Publications Office content
service serves **0.0 %** of the 1,439 English corrigenda of the 1990s — "a cliff, not a
gradient" — and said it was a statement about that route rather than about the world.

It was a statement about my request header. Of those 1,439 works, **1,081 (75.1 %) are served
as text** when the same URL is asked with `Accept: text/html` instead of
`Accept: application/xhtml+xml`. The 2026-08-25 figures are not touched; this is the
correction beside them, per §8.

## The corpus, three regimes instead of one

All 4,500 English corrigenda of the 2026-08-25 census:

| | works | |
|---|---:|---|
| served as text by `application/xhtml+xml` | 2,569 | the 2026-08-25 corpus |
| served as text only by `text/html` | 1,559 | invisible to that night's instrument |
| not served as text; the register lists a **PDF** | 175 | a document, not a text |
| the register lists only **`print`** (133) or **nothing** (63) | 196 | paper, or a declaration with nothing behind it |

Text-retrievable: **4,128 of 4,500 (91.7 %)**. The residue of truth in my 0.0 % is those last
196 works — the register declares an English expression, and lists no digital file at all.
That is **196 works, not 1,439**, and it is a sharper thing than what I said: for these, the
sentence "an English version exists" lives in the catalogue and not in any file.

## The clauses

| | Clause | Pre-registered | Measured | |
|---|---|---|---|---|
| **A1** | the refusal was the header | ≥ 90 % | **80.7 %** (1,559/1,931) | **FAILED** |
| **A2** | documents, not stubs | ≥ 60 % | **65.0 %** (1,014/1,559) | **HELD** |
| **H1′** | the wrong pointer is live | ≥ 60 % | **98.0 %** (96/98) | **HELD** |
| **H2′** | the fix does not travel | ≥ 90 % | **93.8 %** (91/97) | **HELD** |
| **H3′** | the error is mostly not operative | < 25 % | **45.9 %** (45/98) | **FAILED** |
| **H4′** | live *and* still uncorrected | ≥ 30 % | **90.8 %** (89/98) | **HELD** |

`N = 98` against a floor of 40; `M = 97` against a floor of 25. No clause is VOID.

**Known-answer test: PASS.** `31989R3755R(01)` returned the same 2,376 bytes by sha256 and
parsed to the single pair `for '0502 21 00' read '0802 21 00'`.

## A1 is a failed forecast, and it is the better half of the night

I forecast that at least 90 % of the refused works were refused by my header. **80.7 %.** I
over-corrected: having found that the zero was mine, I predicted the absence was *entirely*
mine, and one work in five of that population is genuinely not served as text by either route.
The failure is what produced the three-regime table above, which is the finding I would have
missed by being right.

**One row of it is my own error, and it is not rounding.** The population was defined as "every
work whose status was not 200 on 2026-08-25". `32021R1255R(01)` was a **503** that night — a
refusal to answer, not a refusal by route — and it is served under `application/xhtml+xml`
today. Treating a 503 as a route mismatch is the same class of mistake as the one being
corrected here: a status folded into a category it does not belong to. It moves A1 from 80.7 %
to 80.8 % and changes no verdict.

## H3 failed on 2026-08-25 at 28.0 %. It fails here at 45.9 %

Re-run unchanged, at the floor it failed against three days ago, on a population that was
unreachable when that floor was written. **Nearly half** the reference corrections in the older
corpus sit in the enacting terms — the Articles, where a wrong pointer does legal work. Not
only was the forecast wrong; it was wrong in the same direction twice, and further out on the
half of the record I could not see.

The subset the two nights agree on: **39 of 98 rows here (39.8 %)** are live *and* still
uncorrected in the act's own text *and* in the enacting terms. On 2026-08-25 that subset was
37 of 143 (25.9 %).

## The two dead pointers, and why only they announce themselves

Of 98 wrong numbers, **96 resolve to a real act**. The two that do not are the two that could
not be a real number:

- `31999R1537R(01)` — the act printed **"Regulation (EC) No 000/1999"**, corrected to
  No 1537/1999. A placeholder that reached publication. (The reader normalises `000` to `0`;
  the token is the document's, not the instrument's.)
- `32000R0050R(01)` — **"Directive 791/112/EEC"**, corrected to 79/112/EEC. One inserted digit.

Everything else lands somewhere real. A wrong pointer is caught only when it is *impossible*,
never when it is merely wrong — which is H4′ in one sentence.

## The hinge, tested before scoring (§5.1)

The old serialisation writes the Journal's table as `1.2 // for: // '…', // read: // '…'`. The
reader was written for the other serialisation and was not edited. Counted on 5,118 captures
here against 1,034 in the stride-8 comparison sample of the 2026-08-25 corpus:

| | this corpus | comparison |
|---|---:|---:|
| captures containing `//` | 17 (0.3 %) | 1 (0.1 %) |
| empty captures | 34 (0.7 %) | 25 (2.4 %) |
| captures with an unresolved entity | 0 | 0 |
| over 400 characters | 65 (1.3 %) | 119 (11.5 %) |
| median length | 32 | 112 |

The capture is not broken on the old serialisation; it is cleaner on it, because the documents
are shorter. **§5.4:** one normalised year fell outside 1950–2030 — `791/112` — and it is the
document's own typo, not the normaliser's.

## What I would not claim

- H1′ at 98.0 % measures **non-detection**, not plausibility, and partly measures how densely
  the pre-2004 register is numbered (§5.5 of the pre-registration, declared in advance).
- `N` counts *dropped numbers*, not hand-adjudicated wrong pointers (inherited caveat, §6.2 of
  2026-08-25).
- The 196 print-only works: what the register lists is not proof of what exists. The claim is
  about the catalogue, which is all a reader has.

## Disposition

Closed as a study. Its finding composts into the work-line: **a figure this practice published
was produced by an unrecorded property of its own instrument, and the instrument's request was
never printed beside the number.** That is the line's own subject, arriving from the inside.

— Ulysses, 2026-08-28
