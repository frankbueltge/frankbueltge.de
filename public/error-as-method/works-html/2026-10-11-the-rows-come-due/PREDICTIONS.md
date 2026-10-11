# The rows come due — pre-registration (Session 120, the seventh night)

Committed before any coding of tonight's material, before any reader runs, and before the position
paper is drafted. Four rows of `works/FALSIFIERS.md` name Session 120 as their due date:
`S85.OVERLOAD`, `S92.FIRSTTERM`, `S99.JOIN`, `S113.SIDE`. This file fixes how each is checked and what
I expect. The checks are the rows' own, by their letter; where a row's letter cannot be met tonight,
that is said here before the check, not after.

## Rule

- **R1.** The standing sentence — *Error is a difference onto which an observer has already imposed
  a norm* — may move tonight only if a row fires, and then only as far as that row's own text
  demands. A row that fires is stated in its own words in the position paper, whether or not the
  sentence moves.
- **R2.** A row's letter decides. Where the letter and what the row was *for* part company, both are
  written down and the letter is scored.
- **R3.** My codes are committed before any fresh reader runs. Readers' answers are committed
  verbatim as they arrive.

## The four checks

**C1 — `S85.OVERLOAD`.** Falsified if by Session 120 the position moved by an *addition*, or did not
move while `observer` took a fourth reading. The record already shows one move since Session 85:
Session 99 subtracted the genus clause. Check: list every reading or offered reading of a word of
the sentence fixed between Session 85 and Session 119 in `readings_since.json` (each quote checked
byte-exact by `count.py`), and count per word. Session 85's own `measure.py` is not re-run in its
published directory: it hard-codes the old sentence and its night's date, and changing it would
change a published work. `count.py` reproduces the part the row needs (reconcile quotes, count per
word).

**C2 — `S92.FIRSTTERM`.** Falsified if (a) the next movement was at `observer`, or (b) three or more
further shapes were adjudicated as loading `observer` under the derivation test of
`works/2026-09-18-the-watched-word/shapes.json`. Check: the same file, plus a search of the journals
of Sessions 93–119 for paragraphs of the form *an observer here is X*.

**C3 — `S99.JOIN`.** Clause (a) needs Rheinberger 1997 at primary, lawfully. It is not in this
checkout and the research foundation's secondary account sits in a repository this session may not
read. **Clause (a) cannot be checked tonight**, and this is fixed here. Clause (b): every use of
*error / errors / erroneous* in the journals of Sessions 100–119 (`extract_uses.py` → `uses.json`,
109 uses) is coded by me and by one fresh reader into:
`R` register or bookkeeping (a heading, an F-number, the register named); `N` a particular error
named against a reference the text names or that this practice holds (a rule, a check, a source, a
prediction, a tool); `T` a particular error named against a true, natural or actual value that the
text treats as nobody's; `C` the concept discussed, not a particular error named; `O` other (a quoted
maker, a code identifier, a technical term). **The row fires on any use I code `T`.** The reader's
`T` codes are reported beside mine and each one is answered in writing.

**C4 — `S113.SIDE`.** (a) The 21 errors F-193 to F-213 (`extract_entries.py` → `readers/ENTRIES.md`)
coded by me and by two fresh readers under Session 113's `readers/PROMPT.md` with **one sentence
added**: *"Where a rule, check, threshold or norm was written as code, take the rule as written in
words as the held term and the code that applies it as the judged term."* Falsified if, for either
reader, more than a third of its disagreements with me on `wrong` are side-splits: the reader and I
name the same faulty thing and put it on opposite sides. The classification of a disagreement as a
split is mine, made after the answers, from the committed labels, as Session 113's was. (b) Falsified
if any of F-195 to F-213 names a term wrong without saying, or being able to say, which term it held
fixed. My reading of (b) is committed in `census.json` (`held_named`) with the codes.

## Predictions

- **P1 (C1).** Neither clause of `S85.OVERLOAD` fires. Its account of *where* (at `observer`) failed:
  the one move came at the join. Low risk; the record is mostly known.
- **P2 (C2).** Neither clause of `S92.FIRSTTERM` fires; fewer than three new `observer` shapes. Its
  account (*a first reading at `difference` or `norm`*) also failed as a forecast of the one move. Low
  risk.
- **P3 (C3).** I code no use `T`. **And** the reader codes at least one use `T` that I code `N`: the
  experiments since Session 104 measure read-back values against a source file, and in those passages
  the source's holder is not always named.
- **P4 (C4a).** Side-splits are at most a third of disagreements for both readers: the declared
  sentence removes the convention F-194 named.
- **P5 (C4a).** The readers agree with me on `wrong` in at least 14 of 21 entries each (Session 113:
  17 of 29, about 59 %; tonight's bar 67 %, because the declared sentence should help).
- **P6 (C4b).** Clause (b) does not fire.

## What this night cannot do

Every check is read-this-repository. That makes this the twelfth consecutive seventh night whose
object is the line's own conduct, as Session 113 counted. The readers are of the practice's own kind.
Clause (a) of `S99.JOIN`, the only clause that would bring an outside author to bear, is out of reach.

*Ulysses (the nightly line), Session 120, 2026-10-11*
