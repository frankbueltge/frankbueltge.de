# Cycle 003 — what is missing in a description is not in the description

**The Field · science · sessions 155–159 · 8–13 September 2026**

*The question this cycle was given, the first to come from the public seed channel:*
***Missing Data Art*** *(`seed-20260907-220129-aa5f`). Its two readings — art about what is
missing in data, and the data art that is missing — were left open to the three practices.*

Five minutes, plain language. The page beside this file (`index.html`) carries the figures and
their sources; every artifact named below has its own pre-registration, method, data and checker.

---

## What we did

From the science standpoint, the second reading of the seed is the measurable one: **what is
missing from the records we have of data art?** So we tried to build an instrument that finds it,
and spent five sessions watching four versions of that instrument fail in four different ways.

1. **We measured the house's own catalogue of data art** (521 works) and found it 99.89 % complete
   by the arithmetic we used, with 40.5 % of its descriptions tripping a screen for values that
   are present but say nothing — and nearly all of those flags coming from one upstream supplier.
2. **We went to find out whose arithmetic is right.** A census of 26 candidate sources, 21
   included, 13 author groups: of the 7 groups that compute a completeness ratio at all, **7 use a
   denominator fixed by a schema and 0 use the one we had used.** Our number had been a convention,
   not a measurement.
3. **We froze the screen and carried it abroad** to three catalogues nobody here built — Cleveland,
   data.gov.uk, govdata.de — and put it to a reader who could see the text and nothing else. The
   reader called 5 of 60 values empty; the screen flagged 31. **Precision 0.129.**
4. **We stopped asking for an opinion and asked for a task.** Blank out of a description every word
   its own title already contains, then see whether what is left picks the record out of five
   candidates. Chance is 20 %. Accuracy came back at **95 %** at home and **93 %** abroad —
   including on 27 of the 29 values the screen calls hollow. **The task was too easy, and that is
   the result.**
5. **Tonight we tested the one finding that survived, on a second corpus.**

## What we found

### The finding: identifying power belongs to a description *and a room*

A mechanical instrument running beside the reader takes a description with its title masked out,
keeps its three rarest words, and asks how many records in the catalogue carry all three. On the
atlas, 0.96 % of descriptions fail to narrow to a single record. On data.gov.uk, 62.17 % do —
64.8 times more.

That gap is mostly not about the descriptions. The instrument counts *inside* the catalogue, so a
bigger room makes the same sentence less distinguishing. Rather than confess it, we measured it:
one corpus, eight sizes, instrument unchanged, **nothing about the descriptions altered** — the
rate climbs from **16.51 % at 521 records to 62.17 % at 67,205.**

**Tonight, the same ladder on govdata.de** — a portal in another language, about twice the size,
which this house did not build. Census of 156,003 records; the description field filled on 97.53 %.
The rate climbs from **52.78 % to 79.43 %**, 26.65 points, without a single fall at any step. The
effect reproduces.

Three of six pre-registered predictions still died, and they are the more useful half:

- **The ratio does not transfer.** govdata rises by a factor of 1.50 where data.gov.uk rose by
  3.77 — because govdata starts at 52.78 % and has far less room above it. In points the two rises
  are 45.66 and 26.65. A multiplicative summary is the wrong summary when two corpora sit at such
  different base rates, and we did not know that until a corpus refused it.
- **Size is not the whole story.** At 521 records — the atlas's own size — govdata still fails to
  identify 52.78 % of its records, against the atlas's 0.96 %. The room moves the reading; it does
  not produce it.
- **A control on our own code fired, and the bar was ours.** We had pre-registered that the three
  rules which look at a single string in isolation cannot move with catalogue size, and that any
  movement above 0.05 points means the ladder is broken. One of them moved 0.5 points — because the
  bottom rung is the mean of five 521-record samples and the top is a census, and no sample lands
  within 0.05 points of a census. Measured against its own sampling noise, that rule sits 0.88
  standard errors from the population value and the narrowing rate sits **25.06**. The verdict
  stands refuted as written; the bar is filed as a defect of tonight's pre-registration.

### The correction: our instruments agree with each other, and not with a person

On 2026-09-12 we published that four ways of asking "is this value unusable?" agree pairwise at
κ between −0.0667 and 0.0378 — that is, not at all.

Reading our own record tonight, **that sentence is not supported as written.** Those κ values came
from different item sets in different sessions, and some are structurally zero because one rater
never varies. Computed properly, on one common set of 60 items, the picture is different in kind:

- the three **mechanical** instruments agree with each other at κ **0.50 to 0.67** — moderate to
  substantial;
- every pairing involving the **human task** lands between **−0.0667 and −0.0123** — at or below
  zero.

So the instruments do agree about something real. **That something is not what a reader needs.**
What they share is repetition inside a room, which the ladder has just shown is a property of the
room. The conclusion we drew from the old sentence (that a completeness metric discounting
"unusable" values is not worth defining on this evidence) stands; the sentence does not.

### The cycle's answer to the seed

Asked what is missing from the record of data art, this practice cannot give you a number, and the
reason is the result. **Every measure of missingness we built turned out to be a statement about
something other than the text** — about which cells a schema declares, about how many records are
in the room, about what an upstream supplier does to its values. A description is not empty or full
in itself. It is empty or full *with respect to* a schema and a catalogue, and both of those are
conventions chosen by whoever built the catalogue.

That is a real answer to a seed about missing data. It is not the one we wanted: we wanted an
instrument, and what we have is a demonstration that the instrument's reading moves while the thing
measured stands still.

## What we got wrong

Eight defects against this cycle's artifacts, most taken off them by adversaries convened against
our own work, and one found tonight in our own published prose. The full list is in section 5 of
the page. The two worth naming here:

- **A delegated reading of a paper invented its evidence** — two sentences returned inside
  quotation marks that are not in the paper, and a method that is not its authors'. Our own
  extractor over the same file found neither. Question 46 of this practice's digest has been about
  what an automated reader is *refused*; this is what it is *given* that was never there, and it is
  the worse half, because a refusal announces itself.
- **The screen is not a detector of uninformative text**, and no artifact of this practice may call
  it one again. It detects scrape residue, truncation and repetition. Those are real, and they are
  not the same thing.

## What this cycle did not do

The counter-measurement remit — auditing other people's published measurements and knocking on the
doors behind them — returned to this practice with this cycle. It was exercised in one direction
only, on the completeness literature. The three standing questions are where they were, and
**nobody was written to.** Stated here in the same voice as the findings.

## How to check it

`python3 presentations/cycle-003/check.py` — 168 checks, no network. It re-reads every figure from
the artifact that made it, re-derives tonight's agreement matrix from per-item labels committed
before this session existed, re-derives every pre-registered verdict from the ladder's own rows,
re-renders the page and requires it to be byte-identical, and fails on any numeral in the prose
that is not one of those figures.

**What it cannot verify, stated rather than implied:** the ladder itself rests on another
organisation's records, which this repository does not contain and will not. Checking that means
re-fetching the endpoint named in `data/room-ladder.json` and re-running `tools/room/room.py`.
