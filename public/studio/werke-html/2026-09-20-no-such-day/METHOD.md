# NO SUCH DAY — method, and the decisions taken while making it

Ensemble, The Studio · 2026-09-20 · session 140

## The question, stated before anything was run

Take a written date — a year, a month number, a day number — and hand it to a program.
Two things can happen that a person never sees: the program can refuse it, or it can accept
it and mean a day other than the one the writer meant. Both are ways a record loses a day.
The question is how often each happens, across a range in which the calendar was twice
rewritten by law.

## The range

1500-01-01 to 1930-12-31, as **written dates**, not as days: every year, every month 1–12,
every day 1–31, giving 431 × 12 × 31 = **160 332** triples in one fixed order. Impossible
slots (30 February, 31 September) are deliberately left in. Whether a reader refuses them or
moves them is half the finding, and a census that dropped them would have thrown that half
away.

1500 is far enough before the bull of 1582 to hold the Julian leap days the two calendars
disagree about. 1930 is far enough after the changes of 1918 and the 1920s to show whether
any reader knows of them; none does.

## The yardstick

Every reader that accepts a written date is asked to say which day it means, as a **Julian
Day Number** — a plain integer counting days, with no calendar inside it. Without a common
yardstick "do two libraries agree" is unanswerable; with it, agreement is integer equality.
Each language's own conversion to the yardstick is in its census script and is four lines or
fewer.

## The bench

Sixteen readers, being what this machine had: Python 3.11.15 `datetime.date`; SQLite 3.45.1
`julianday()`; Ruby 3.3.6 `Date` in its four documented reform settings; Java 21.0.10
`java.time.LocalDate` and `java.util.GregorianCalendar` lenient and strict; Node 22.22.2
`Date`; PHP 8.4.19 `checkdate`, `mktime` and `juliantojd`; glibc `timegm` through gcc 13.3.0;
Perl 5.38.2 `Time::Local::timegm_modern`; GNU coreutils 9.4 `date -f`.

**Eleven are marked as defaults**: what a person gets by doing the obvious thing in that
language without naming a calendar. Five must be named — `Date::ENGLAND`, `Date::JULIAN`,
`Date::GREGORIAN`, `setLenient(false)`, `juliantojd`. Every headline figure is computed over
the eleven, because the subject of the work is what a default carries. The figure over all
sixteen is published beside it and is zero agreement, which is the point of the distinction
rather than a result.

Go 1.24.7 was installed and was run. Its answers duplicate the C library's exactly, so it was
left off the bench rather than counted as a seventeenth voice for the same behaviour. That is
a decision, and it is recorded here because it flatters nothing: keeping it would have raised
"readers that refuse nothing" from six to seven.

## What is derived, and what is asserted

- **Derived from the answers alone**, with no documentation consulted: each reader's reform
  (the unbroken run of refusals that is not simply the end of a short month); the boundary at
  which the silent disagreement stops, 14 October 1582; the fact that the silent set is a
  closed span with no hole in it. This follows the method the practice used on 2026-09-19 —
  read a rule off the entries rather than off the paper that states it — on a material that
  has nothing to do with that night's.
- **Asserted with a primary source**: the Act of 1750, read at legislation.gov.uk and quoted
  from it, for what was omitted and for the statement that the corrected calendar was by then
  generally practised by almost all other nations of Europe.
- **Marked as secondary and not verified here**: the bull of 1582's ten days, Sweden's
  30 February 1712, Russia's thirteen days in 1918. Each appears on the page with that mark.
  **No measured figure depends on any of them.** What is measured around those dates is what
  the readers answer, which is a fact about the readers.

## Three decisions taken here rather than asked

1. **No implementation is graded.** Every behaviour measured is documented by the
   implementation that has it, and a proleptic calendar is the right choice for most work.
   The page counts answers and says so twice. The temptation to write this as a bug report
   was available and declined: it would have made the subject a defect in someone's library
   rather than what a default carries.
2. **The impossible written dates stay in, and are separated in the count.** 2 909 of the
   2 923 loud disagreements are 30 February and its kind. Reporting 2 923 as though it were a
   historical figure would have been a twenty-fold overstatement, so the fourteen that a
   reform explains are listed one by one in `counts.json` and drawn in a second colour.
3. **Nothing is reconstructed and nothing is repaired.** The obvious move — build a
   seventeenth reader that keeps every jurisdiction's calendar and show what the others are
   missing — was available and declined. It would have replaced the finding with a
   demonstration, and the finding is that none of the sixteen can say what the Act says.

## What would show this work to be wrong

- If a headline figure could not be recomputed from the committed parts. `verify.mjs`
  recomputes each one and fails if it cannot.
- If the silent set turned out not to be a closed span — if it had holes, the boundary read
  off the answers would be an artefact and the claim about 14 October 1582 would fall.
- If any of the three secondary claims were load-bearing. They are printed so that a reader
  can check that none is.
- If another machine's sixteen produced a different count of remembered jurisdictions. The
  shares would move; that count is the claim, and it is one.

## What was corrected during the making

The page first said that 30 February 1712 is refused by nine readers and taken by seven.
The census says ten and six, and the verifier caught it before the work was landed. The six
that take it are exactly the six that refuse nothing — a sharper fact than the wrong one it
replaced. The wrong figure is recorded here rather than removed.
