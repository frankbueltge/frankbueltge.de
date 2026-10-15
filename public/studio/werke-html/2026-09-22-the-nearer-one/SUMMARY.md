# THE NEARER ONE — in five minutes

**Ensemble · The Studio · 2026-09-22 · `works/2026-09-22-the-nearer-one/index.html`**

## The question

Of these two colours, which one is nearer to this one?

Your colour picker answers it every time it offers the closest match. So does a palette
squeezing a photograph down to sixteen inks, a contrast checker, a compressor deciding
which two shades it may merge into one. None of them shows its working.

There are five answers in common use. Four are standards, published between 1976 and 2001,
each one correcting the last. The fifth is what a program does when nobody decided what it
should do: treat the three numbers a screen takes as a point in space and measure the
straight line.

**There is no sixth answer and there is no answer key.** All four standards were fitted to
the same thing — people in a viewing booth saying which pair of patches looked further
apart. That referee was not in the room. The reader's eye is.

## What was done

The 216 colours of the web-safe palette — the set invented in the mid-nineties so that a
picture would look the same on every machine, generated here from six numbers rather than
copied from anywhere — were arranged into every possible question of the form *reference,
candidate, candidate*. That is **4 969 080** questions. All five formulas answered all of
them. Nothing was sampled.

## What came back

- **They agree on 3 322 546 of the questions (66.9 %) and contradict each other on
  1 516 060 (30.5 %).** On another 130 474 nobody is contradicted but somebody declines to
  answer — and all the declining is one formula's.
- **The four colour standards never once call a draw** in five million questions. sRGB
  Euclidean calls 184 296 draws, because swapping a colour's red and its green moves it no
  distance at all in its arithmetic.
- **Being sure is no protection.** Take only the questions where one of the five puts a
  factor of three or more between the two candidates: 45 996 of those are still contradicted
  by another of the five.
- **Five voices can divide in exactly fifteen ways. All fifteen happen** — there is no pair
  of these formulas that never stands together against the rest, and none that never stands
  alone. Every one of the fifteen is on the page with its commonest shape and its loudest
  case.
- **They disagree hardest about the colours with the least colour in them.** White is the
  most argued-about colour on the page (50.4 % of its pairs contradicted); the greys and the
  pale washed-out colours follow. The saturated violets are the calmest (16.1 %). And at a
  neutral reference CIE94 *is* CIE76, exactly — so the jury is effectively four strong
  precisely where it splits most.
- **Three of the five are not distances.** Under CIEDE2000 — the formula currently
  recommended — 347 880 ordered triples of colours have a detour that is shorter than the
  direct route, by as much as 43 %. Under CMC, 323 189. Under CIE94, 137 673. This is a
  known property of these formulas; the size of it, over a palette anyone can regenerate in
  three lines, is what is on the page.
- **Two of the five cannot answer until they are told which colour is the reference.** Ask
  the same question the other way round and CMC changes its answer on 1 045 921 triples
  (21.0 %), CIE94 on 787 913 (15.9 %).

## What it is not

No formula is graded here and none is called wrong. Every behaviour on the page is in the
published definition of the formula that has it. No benchmark of human judgement was used
or built, nothing is scored, and the page ends without a ranking on purpose.

## The part that is yours

Fifteen cases, one for each way the five can divide, are on the page as three swatches.
You are asked which is nearer. The verdicts stay covered until you have said. Nothing you
answer is stored, counted anywhere else, or sent — the tally lives in your browser tab and
dies with it. **A work about the measurement of human colour judgement that declines to
collect any** is a decision, and the reason is on the page: a screen of unknown calibration
in a room of unknown light is not a viewing booth, and the data would have looked valuable
and been worth nothing.

## Neighbours

Built in the light of the house's Atlas of Data Art, answering four works in it, each opened
at its own address first: **AI, Ain't I a Woman?** (Joy Buolamwini, 2018) — the shape this
borrows, and inverts: she asks five machines a question whose answer everyone in the room
knows, and the disagreement harms named living people; this asks five standards a question
nobody in the room can settle, and the disagreement harms no one, which is why it has sat
in the record for fifty years. **Gender Shades** (Buolamwini & Gebru, 2018) — they built a
benchmark so instruments could be scored; here none is built or borrowed. **Faces of
ImageNet** (Trevor Paglen, 2022) — there the visitor is classified; here the visitor does
the classifying. **ZUR FARBENLEHRE** (Steven Jones, 2007) — Goethe quarrelled with Newton
about what colour *is*; these five agree about that completely and still cannot agree which
of two colours is nearer.

## Opening it

`index.html` opens from a filesystem. One file, no network, no library, complete without
scripting. The evidence is beside it: `data.json`, `counts.json`, `sources.json`, the
scripts that made them, and `verify.mjs`, which writes all five formulas a second time in
another language, re-asks all 4 969 080 questions, and then opens the page in a real browser
with scripting on and off and the network denied.
