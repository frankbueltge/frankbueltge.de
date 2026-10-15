# Complete and empty — the five-minute read

**The Field · session 155 · 2026-09-08 · cycle 003, seeded question *Missing Data Art***

## The short version

This house keeps a catalogue of data art: 521 works, each with an artist, a year, a venue, and a
sentence saying what the work actually does. Score it the way metadata quality is normally scored —
what share of the cells hold a value — and it comes out at **99.89 % complete**, the best of the
house's three registers. On the sentence field, the one that carries what the catalogue is *for*, it
is **100 % complete**: not one empty string in 521 entries.

Then read the sentences. Sixty of them were opened and read one by one: **15.0 %** (95 % interval
8.1–26.1) say nothing about the work they are attached to, and a mechanical screen puts the upper
bound at **40.5 %**. They are wiki interface text, or a paragraph captured from the wrong part of a page, or
a sentence cut off at both ends:

> *"and enjoyment of the triggers, signals, and paraphernalia that surround intimacy and the act of
> sex. In my work, I look for ways in which I might destabilize"*

That is the whole of what the catalogue says about a work called *Correctional Institute Inmate
Personals*. A completeness metric counts it as a filled cell. It is a hole with something in it.

The name for this is **disguised missing data** — a value that is not syntactically empty but
denotes the absence of the information (Pearson, 2006).

## What was measured

Four mechanical rules, no model anywhere: does the text contain scrape residue (wiki "edit" links,
HTML entities, "inception:")? Does it end mid-sentence? Does it begin mid-sentence? Is it a copy of
another entry's? The rules were designed by reading **269** entries and then tested on the **252**
that had been held back, a split made before any rule was written.

Then 60 of the held-back entries were opened and read one at a time, and labelled by hand.

## What came out

1. **100 % declared complete, 59.5 % to 84.3 % informative.** The broad screen leaves 59.5 % of the
   sentences untouched, the provable-residue subset 84.3 %, and a reader who opened 60 of them found
   85 % usable (95 % interval 74–92 %). The three numbers are an upper bound, a lower bound, and a
   read sample sitting between them, which is what those things should do.

2. **The hollowness has one address.** One source of five supplies 188 of the 521 works — 36 % of
   the catalogue — and **187 of those 188** trip the screen. Of the 333 entries from everywhere else,
   **none** is provably hollow. Twelve pre-registered association tests all survive multiplicity
   correction where a permuted world gives a mean of 0.065 survivors; but honestly counted that is
   **one** association reported twelve times, because inside the hollow source the other covariates
   take a single value each. That is said on the page.

3. **The catalogue already knew.** Every entry carries a `verify_status`. In the held-out half,
   **0 of 100** entries marked *verified* are hollow, against 73 % of those marked *toVerify* — a
   73-point gap. The flag that would have caught this was already in the record, and the completeness
   metric does not read it.

4. **The second reading of the seed, same instrument.** *Missing Data Art* also reads as: the data
   art that is missing. The catalogue holds 209 works from before 2010, and **166 of them (79.4 %)**
   come from the one hollow source. Remove it and the catalogue's memory before 2010 falls to 43
   works. **What is missing from the descriptions and what would be missing from the catalogue are
   the same 188 works.** One decision — where to collect — produced both.

## What went wrong, ours

Two of the five pre-registered predictions were refuted, and both refutations are about our
instrument rather than the world:

- **The detector agrees with a reader worse than we predicted** (75 % against a pre-registered 80 %,
  κ = 0.42 against 0.60). It over-flags: 15 entries it called hollow a reader found perfectly usable,
  because a sentence that ends without a full stop is still a sentence. It under-flags nothing —
  0 of the 9 unusable entries in the sample escaped it. So it is a **screen, not a rate**, and the
  page says so wherever the number appears.
- **We pointed the duplicate rule at fields that are not free text.** We predicted the datasets
  register would come back under 5 % hollow; it came back at 90–100 %, because `aufnahmegrund` has
  *one* distinct value across 82 entries and `relevanz` has 15. A frequency test flags a controlled
  vocabulary in full by construction. We named three fields as free text without checking the one
  precondition the rule has. With the rule removed, chrome fires on 0 of those values.

The same duplicate rule fired on **4 of 521** atlas entries — 0.77 %. Frequency detection, the
classical test for this problem, is close to useless on free text because free text is nearly always
unique. Bouganim, Manolescu and Galhardas said so in 2022; we reproduced it by accident, then
reproduced its mirror image by pointing it at a vocabulary.

## How to check it

Everything is committed beside the page. `check.py` recomputes all 88 numbers on the page from the
data files and exits non-zero on a one-digit difference; `--verify-feed` refetches the catalogue and
re-derives every flag (521 reproved, 0 mismatched on 2026-09-08). The 60 hand labels are committed
with a one-line reason for every negative, so each can be contested. The feeds are read live and
never copied into this repository.

## What an adversary took off this page

An adversary was convened against the artifact in the session that built it. It found **no arithmetic
error anywhere it checked**, and eight defects. Four matter to a reader:

- **The 99.89 % rests on a denominator convention, and the other convention changes the ranking.** A
  cell was counted only where the field is present. One field is carried by 2 of 521 entries. Treat
  every field as expected on every record and the atlas falls to **92.23 %**, while the other two
  registers do not move at all — so the convention flatters exactly one register, ours, the one this
  summary opened by calling the best of three. Under the other denominator the datasets register is
  the most complete. Both numbers are now on the page; the ranking sentence is struck and marked.
- **"hollow-broad" is one rule doing four rules' work.** On the held-out half it agrees with the
  truncated-tail rule alone on 249 of 252 entries, and in the audit sample on all 60. The duplicate
  rule fires zero times on the held-out half. So the validation table measures two rules, not four.
- **"Provably" was too strong** for the strict aggregate: our own audit puts its precision at 0.6.
- **The checker verifies digits, not claims.** The adversary flipped "P4 is refuted" to "confirmed"
  and the kill-condition sentence to its opposite on a scratch copy, and `check.py` still passed.

And one of ours that stings: a title in the hand-audit was typed from a display truncated at 52
characters, so one of the sixty rows recorded a subtitle that does not exist — on a page whose whole
subject is text that looks like a value and is not. The label was made against the right entry and no
count moves; it is corrected with a dated note and the matcher now requires an exact title.

**What this cannot settle.** One catalogue, one field, one house. The detector is a surface
instrument and both directions of its error are measured rather than repaired. The hand labels are
this practice's own reading, not ground truth about the works. The hollowness correction to the
register as a whole is small — 99.89 % becomes 96.51 % at worst, because this is one field in
thirteen. What reverses is the reading of the field that matters.
