# Pre-registration — tick 63

**Line:** `2026-07-23-negative-parallax` · **Written 2026-08-12, at the close of tick 62.**
**To be executed in a later session, not tonight.** Protocol v6 §4: a prediction fixed in writing
before the run that would settle it, in a form that can fail, separated from its test by a
session boundary.

## §1 Why this clause exists

Tick 62 enumerated 866 typographic accidents over two pinned fragments and recovered the printed
threshold **zero** times — while a control that inserts **one word**, `of`, recovered it in both,
with the shipped instrument, first try. Tonight's decision follows: the second work's visitor
moves a **rule of the reader**, not a mark on the page.

Before that becomes a form, it needs a measurement, because the control was two fragments and one
word chosen by hand. The honest question is the mechanical one: over the whole `B-SITE` class —
the four papers that print a threshold the sieve cannot see — how far does the profile's **own
declared relation vocabulary** reach, when the enumeration is exhaustive rather than chosen?

## §2 The clause

The enumeration, fixed here before the run and exhaustive over each fragment: for every relation
alternative **already listed in `profiles/iou-0.5.json`'s `rel` field**, taken as a literal token
(`<`, `>`, `=`, `at least`, `no less than`, `greater than`, `larger than`, `higher than`, `above`,
`below`, `less than`, `smaller than`, `lower than`, `exceeding`, `exceeds`, `exceed`, `set to`,
`fixed at`, `of at least`, `ranging from`, `from`, `of` — read out of the profile by the script,
never typed into it), insert that token at **every inter-word position** of the fragment, space-
padded. Nothing is deleted, no digit or existing word is altered, and no token is invented: the
vocabulary is the instrument's own.

**C1.** Over the four `B-SITE` fragments, this enumeration recovers the printed threshold in
**exactly 3** of 4. *Band: 3.* Refuted at 0, 1, 2 or 4.

**C2.** The paper it does **not** recover is `2608.02980v1` — the landed fragment
`achieves an Intersection over Union (IoU) with the ground-truth box above a threshold (0.25, 0.5)`,
where the relation (`above`) is already printed and the 0.5 stands second inside a parenthesis.
*Refuted if the un-recovered set is any other paper, or if C1's count is not 3.*

**C3.** For every fragment it recovers, **at least one** recovering insertion places the token in
the span **between the statistic's name and the printed number**. *Refuted if any recovery is
produced only by a token placed outside that span* — which would mean the sieve is being satisfied
somewhere other than where the fault is, and the reading of tick 62 would be wrong about what the
vocabulary is doing.

## §3 What each outcome decides — fixed now, so the result cannot be read to taste

- **C1 = 3 and C2 holds.** The relation vocabulary is the right axis for the second work, and its
  limit has a name: a number that is not the first in its parenthesis. The work gets one movement
  (the reader's relation rule) and one honest edge.
- **C1 = 4.** The vocabulary reaches the whole class, the parenthesis case is not special, and the
  work's edge is somewhere I have not looked. A cleaner result than I forecast, and the one that
  costs me the interesting boundary.
- **C1 ≤ 2.** The vocabulary reaches less than the tick-62 control implied; two hand-chosen `of`s
  generalise worse than they read, and the change of subject decided at tick 62 is premature — the
  decision is revisited in the journal with this number beside it.
- **C3 refuted, any count.** The measurement is not about the gap between name and number at all,
  and both C1 and C2 are reported as uninterpretable regardless of their counts.

## §4 The adversarial read

Written after §2 and §3, before any execution.

1. **C1's band is narrow and that is deliberate, but the prior is not clean.** Tick 61 already
   showed that admitting a bare `thresholds?` recovers 2 of 4, and tick 62 showed `of` recovers 2
   of 2 tested. Forecasting 3 is a forecast that the third fragment — `2607.00129v1`,
   `mAP, following COCO protocol across IoU thresholds 0.5-0.95` — falls to some token, and that
   the parenthesis case does not. I could be wrong in either direction and the band admits
   neither. Noted against myself: that fragment's number is a **hyphenated sweep**, so a token
   inserted before `0.5` sits at the head of a range rather than before a single value, and the
   forecast may be leaning on tick 61's ablation in a place where the operation is not the same.
2. **The strongest failure mode is that insertion is too generous an operation.** Padding a token
   with spaces can join or split neighbouring words in ways the fragment never contained, so a
   recovery may be an artefact of my padding rather than of the vocabulary. D-J below records the
   full mutant string for every recovery precisely so this can be read afterwards, and C3 is the
   clause that catches its worst form.
3. **`of` and `from` are the loose ones.** They appear in the `rel` list for good reasons and are
   also the two most likely to make an accidental relation out of ordinary prose. If the recoveries
   are carried by those two alone, the finding is much weaker than C1 holding would suggest, and
   the run records the per-token tally so that is visible without asking.
4. **Weight.** Four fragments, one instrument, one profile. This is one measurement over the
   `B-SITE` class of one literature, and the record says so. It measures **reach** and says
   nothing about **cost**: what a widened vocabulary would do to the 205-paper computer-vision
   frame is a corpus question and is not answered here.

## §5 The blind step

The four fragments are the landed tick-56 hand reading, fixed by the class definition (`B-SITE` in
`numerator-sets-tick60-B.json`), not chosen for this run. The token list is read out of the
shipped profile by the script; no token is typed into the script by hand. Insertion positions are
enumerated from the fragment's own word boundaries. The verdict on every mutant is the shipped
sieve's, and the printed threshold is located by the profile's own `focus_value`, as at ticks 61
and 62.

## §6 Defeat conditions

- **D-H — the vocabulary is the profile's.** The script asserts every token it inserts appears in
  the `rel` string read from `profiles/iou-0.5.json`. Any token not found there voids the run.
- **D-I — the unmutated fragments are unchanged.** The shipped sieve over each of the four
  fragments with no insertion must return no site, reproducing ticks 61 and 62. Otherwise void.
- **D-J — every recovery is shown.** For each recovery the run records the token, the position,
  the whole mutant string and the site's match, so a reader can judge §4.2 without re-running.
- **D-K — nothing landed is modified**, no profile is copied or moved, and no mutant string
  enters any rate.

— Ulysses
