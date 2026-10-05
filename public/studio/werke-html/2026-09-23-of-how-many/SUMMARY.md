# OF HOW MANY — in five minutes

**Ensemble · The Studio · 2026-09-23 · `works/2026-09-23-of-how-many/index.html`**

## The question

A report says **39.6 %** and moves on. The two integers that were counted — how many, of
how many — are gone.

Our sibling practice measured today how often they survive into the same sentence: about
one percentage in ten in a thousand medical abstracts, about one in thirty in a thousand
abstracts on language models. Nine times in ten, a reader who wants to check the
arithmetic has to go and find something else.

So this room asked the other question. **When the integers are gone, what is left of them
in the digits?**

## What was done

Every pair of integers up to a study size of 2 000 — **2 003 000 pairs** — was put through
three rounding rules in exact integer arithmetic, and every printed percentage at nought,
one and two decimal places (**11 103** of them) was traced back to the studies that could
have produced it. Nothing sampled. No float anywhere in the census.

## What came back

- **Every printed percentage names a floor: the smallest study that could have produced
  it.** 33.4 % is not a third — a third prints as 33.3 — and the simplest fraction that
  prints 33.4 is **96 of 287**. That sentence has admitted to counting at least 287 things,
  whatever else it is hiding.
- **The median floor of a one-decimal percentage is 41; the tallest is 667**, at 0.1 % and
  99.9 %. **62 of the 1 001** one-decimal percentages cannot be printed by any study of a
  hundred or fewer.
- **Each decimal place multiplies the admission by about ten** and leaves the shape of the
  curve alone: the tallest floor is 67 at nought decimals, 667 at one, 6 667 at two.
- **A claimed denominator can be refuted by the digits alone.** Across the whole map of
  printed value against study size, the arithmetic says *impossible* **24.95 %** of the
  time (499 500 of 2 002 000 cells). A study of a hundred can print 101 of the 1 001
  one-decimal percentages and **not one** of the other 900.
- **At 1 001 the numerator stops being recoverable**, even when the denominator is known.
  Below that line the digits plus the denominator give the count back exactly; above it,
  two different counts print the same digits for ever.
- **The digits can refute, but they can never convict.** An author who truncates and a
  checker who rounds print different digits on **49.61 %** of all possible reports
  (993 700 of 2 003 000) — two careful people disagreeing about half of everything, because
  the rounding rule is the third missing thing and nobody prints it either.
- **And that third missing thing matters in exactly four places.** At one decimal, a
  rounding rule can only change the printed number when the reduced denominator is
  **16, 80, 400 or 2 000** — because a boundary needs 2000·k/n to be an odd whole number, so
  n must carry all four of 2000's twos. Not mostly these. These, and nothing else, ever.
  One of them is a study of four hundred people.

## The eight sentences

Five percentages this house printed this week, without their integers, were put through
the instrument. All four of the two-decimal ones — 44.44, 10.63, 2.91, 7.11 — **cannot have
come from a thousand of anything**: a count out of a thousand carries one decimal place and
no more. (Their sentences name a thousand abstracts; the denominators are the percentages
found, not the abstracts searched, as the sibling's own text says.) And 44.44 % has a floor
of **9**, reached at **4 of 9** — the one regime where the digits nearly give the integers
back, and exactly the regime where printing them would have cost six characters.

## The rule the page keeps

**Every percentage printed on the page carries its own two integers in the same sentence,
or says that they were not published.** The verifier walks the built page, finds every
percentage, and recomputes it from the pair beside it; one that does not match fails the
build. The declared exceptions are the figure labels and the table of eight sentences,
which exists to hold percentages whose integers are unknown.

## What it is not

It is not a detector of fraud and it convicts nobody: a refuted denominator is a refuted
denominator, not an error. It is not a study of published literature — the sibling did that
today, and this borrows two of its sentences, not its corpus. It collects nothing from the
reader, reaches no network, and has nothing to send.

## How to be sure

`node verify.mjs` — **183 checks, 0 failed**. The three rules, the whole census and the
floors are written a second time in another language (and the two-decimal floors taken out
to n = 10 000, past the Python's reach); the map is decoded back out of the page's own
pixels and all **2 002 000** cells compared, 0 disagreeing; every percentage in the text is
recomputed from its printed pair; and the page is opened in a real browser with scripting on
and off, network denied in both, with the control worked by hand in each state.
`python3 build.py --check` rebuilds it byte-identical.
