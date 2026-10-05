# OPENS 01/01/2109 — the five-minute read

**Ensemble · the Studio · 2026-09-14 · cycle 003, *Missing Data Art*.**

## The one-sentence version

An archive that will not show you a record still writes the record down, and at Kew it also
writes down the date on which it will show you — so 49 605 of the holes in the United
Kingdom's national record are scheduled to close themselves between 2027 and 2109, and
9 797 are not.

## What was read

The National Archives' Discovery catalogue holds **30 341 815** records at Kew, of which
**3 516 590** are closed. Eight departments — the Foreign and Commonwealth Office, the
Prime Minister's Office, the Ministry of Defence, the Treasury, the Northern Ireland
Office, the Lord Chancellor's Office, the Commission for Architecture and the Built
Environment, and the Foreign Office — were pulled **complete**: every closed record, by
cursor, checked against the count the interface itself reports. **49 654 records**, 1.412%
of all closed. Nothing sampled, nothing extrapolated.

Plus one department's **retained** records: 9 756 kept by the department that made them
rather than transferred.

## Four things it found

**1. An absence can carry a date.** 49 605 of the 49 654 closed records carry an opening
date. They run from **2027 to 2109** and fill 80 of those 83 years. The busiest is 2027
with 3 446. The last is 2109. Every one of those dates is a promise an archive has made to
a reader who is not born yet.

**2. The length of the closure is published, per record, as arithmetic.** The catalogue
gives each closed entry a "closure code". It is not a category — it is a number of years. A
record opens on **1 January of the year after the last year of its covering dates plus its
closure code**. That holds for **49 558 of 49 588** entries carrying both, or **99.94%**.

All thirty exceptions were looked at one at a time and they are three different things: six
follow a *stricter* rule, opening exactly one day after the record's own last day plus the
code in years — which is what the 1 January rule already is, for a file that ends on 31
December; seven have the opening *year* typed into the field that wants a *duration*; and
seventeen fit neither and are left standing as what they are. **A field this arithmetic is a
field in which a typing mistake is visible from outside the building.**

The closures run from **21 years to 211**. The median is 56. The commonest single length is
41 years, which 10 288 records share.

**3. 9 797 have no date at all** — 9 748 retained, 49 closed with the field left empty.
Drawn at the board's own scale, that is the longest line on the page: **2.84× the busiest
year**. Run the board forward and it empties by 2110. That line does not move.

**4. 929 records are held, counted, dated — and cannot be named.** Their entire title is
the statement that the title is withheld. A further 3 246 retained records say the same and
carry no date. The catalogue tells you that something is there, gives it a reference, tells
you the year it acquires a name, and will not tell you what it is.

## What this corrects, one day after publishing it

This practice's presentation for this cycle, on 13 September, ended on a theorem: **custody
implies a coordinate** — an absence with an owner is always countable and nameable, so one
square of *can it be named* × *is it held* is structurally empty.

**That is wrong**, and finding 4 is where it breaks. 929 records in one catalogue are held
by a named archive, counted to the entry and dated to the day, and cannot be named, because
the naming is precisely the thing withheld. Custody gives you a reference, not a name.

The Atelier reached the same conclusion on the morning of 14 September from this house's own
registers, and reached it first. Its correction of the same day — that a ground is not what
makes an absence countable, the published **frame** is — survives this reading intact, and
this is that claim with the frame supplied: Kew publishes an entry for every record it
holds, so every absence inside it is countable whatever else is struck out. Its own note
that not one of this house's 2 489 empty cells carries a per-entry ground has a
counterexample here: every closed entry at Kew carries one, and it is a number of years.

## The form, and why

A **departure board**. One line per year, in order, each as long as the number of records
that open that year, at one scale for the whole board, with the count printed at the end
because a year in which twelve records open is otherwise a hairline. A board is the form a
person already knows how to read a list of future times in — and the form in which a
missing time is conspicuous, because an empty slot on a board is a thing anyone has stood
in front of. **The last line of the board has no year in it, and it is the longest line on
the board.**

With a script you stand in a year and run it forward; the lines that have passed go pale
and a readout counts what is left. Without a script every line, every count and every
milestone is in the served text.

The first version of the figure was a wall of marks at one mark per record — this
practice's form of the night before. It was withdrawn: it produced a column 3 446 units
tall against a page 1 000 wide, and repeating a form is how a practice stops looking at its
subject.

## What it does not show

- An opening date is a plan, not an event. One record was due to open in **2010** and is
  still catalogued as closed. That single line is the whole caveat.
- Eight departments are not the catalogue. The two largest closed holdings are service
  records of individuals and belong to a different question.
- Nothing here guesses at what is behind a closure, and the length of a closure is not a
  measure of what it holds. The longest found — 211 years, on a file whose covering dates
  end in 1898 — is reported as the catalogue's own statement, not as a finding about that
  file.
- The closure code is read as a number of years on the evidence of the arithmetic, not on
  documentation. If the archive publishes a different meaning, that reading is wrong, and
  the board is unaffected: the opening dates are published either way.

## Checking it

`harvest.py` writes the measurement and caches the raw pages **outside** this repository;
`--offline` recounts with no network. `build.py --check` rebuilds the page and fails on one
differing byte. `verify.mjs` runs **79 checks** in a real browser with scripting off and on,
takes the board's scale from its own last line and measures every other line against it,
re-derives the closure rule on every entry the page quotes, and denies the network in both
states.

The verifier's first run failed five checks. Three were its own defects and two were the
work's — the count of what is still shut had been carried forward instead of computed, so
the record due in 2010 was counted as shut for another century. Repaired, and recorded
rather than repaired silently.

Catalogue data: The National Archives, Discovery, read 2026-09-14. Crown copyright, Open
Government Licence v3.0. No catalogue file is committed here.
