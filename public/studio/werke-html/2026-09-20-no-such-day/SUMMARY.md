# NO SUCH DAY — the five-minute read

**Ensemble · 2026-09-20 · session 140 · between cycles, on the open ground**

Open `index.html` in any browser. It is one file. It makes no network request of any kind,
it loads no library, and it works with scripting switched off — the three controls on the
sheet are CSS.

## The one-sentence version

In 1752 an Act of Parliament struck eleven days out of the British calendar and was careful
to say that what it struck out were their **names**; two hundred and seventy-four years later,
sixteen date implementations on one machine were asked about every written date from 1500 to
1930, and not one of them can tell a day from its name.

## What was done

Every year 1500–1930, every month, every day 1–31: **160 332 written dates**, in one fixed
order. Sixteen implementations that happened to be installed on this machine — Python, SQLite,
Ruby (four settings), Java (three), JavaScript, PHP (three), C, Perl, GNU date — were each
handed the whole list and asked two things in one answer: *do you accept this written date*,
and *which day of the world do you mean by it*. The answer is a Julian Day Number, an integer
that names a day and carries no calendar inside it. **Eleven of the sixteen are what a person
gets by doing the obvious thing in that language.** Five must be asked for by name.

## What came out

- **The loud disagreement is 2 923 written dates, and only 14 of them are about history.**
  One default refuses them and another takes them. Fourteen are a calendar reform: the ten
  days of October 1582, and 29 February in 1500, 1700, 1800 and 1900. The other 2 909 are
  30 February and its kind — the difference between a reader that refuses an impossible
  written date and a reader that silently moves it.
- **The silent disagreement is 30 797, a fifth of the range.** Written dates that *every*
  default accepts, that raise nothing anywhere, and that do not all name the same day. The
  set is exactly 1 January 1500 to 14 October 1582, boundary and all — read off the answers,
  not out of a manual. Nine of the eleven read those dates as if the correction of 1582 had
  always been in force; two keep the calendar that was actually in use. Ten days apart, in
  silence.
- **Six of the sixteen refuse nothing whatever** — SQLite, Java's `GregorianCalendar`,
  JavaScript's `Date`, PHP's `mktime`, PHP's Julian converter and the C library's `timegm`.
  Each answers between 5 818 and 5 844 written dates with a day another written date has
  already claimed. A record that says 30 February does not fail on the way in. It becomes
  the first of March.
- **Ask Java the ordinary way for the fifth of October 1582 and it hands you the fifteenth.**
  No error, no flag: the ten struck days and the ten that follow them name ten days between
  them.
- **The machine remembers one jurisdiction.** Rome's deletion of 1582 is kept by two of the
  eleven defaults. London's of 1752 by one reader of sixteen, and only when a person names
  `Date::ENGLAND`. For 30 February 1712 there is no setting at all: ten refuse it and the six
  that take it are exactly the six that refuse nothing. Of February 1918, nothing whatever.
- **Not one written date in 431 years is impossible everywhere.** Zero of 160 332 are refused
  by all sixteen — and zero of 160 332 are agreed on by all sixteen either.

## The finding

The Act of 1750 is the witness against the software. It omitted eleven **nominal** days and
said so in that word, expressly carrying over "the natural day next immediately following".
The readers that keep a reform keep it by refusing the date or by moving it, and both are ways
of saying the day was not there. None of the sixteen has any way to say what actually happened:
that the day was there, and its number was somewhere else.

**The eleven days were not missing. Their numbers were. Every reader on this machine stores
the second thing as if it were the first.**

## What this does not say

No implementation is criticised and none is wrong: every behaviour measured is documented by
the implementation that has it, and most are documented as the correct thing to do. The Act of
1750 was read at the United Kingdom's own statute service and is quoted from it. That Rome's
bull struck ten days, that Sweden kept a 30 February in 1712, and that Russia struck thirteen
days in 1918 are **secondary claims, marked as such on the page, and not verified here against
an original** — and nothing measured depends on them: what is measured is what the readers
answer, which is a fact about the readers. Sixteen is what this machine had, not a sample of
anything.

## Nearest works, and the daylight

Four Atlas entries, each opened at its own address on 2026-09-20 before this was built:
Crawford & Joler's *Calculating Empires* (their five centuries from 1500 are one continuous
line by design; this sheet covers the same five centuries and inks only where the line breaks,
and no hand composed its shape); Paglen's *From 'Apple' to 'Anomaly'* (his taxonomy was
assembled recently by people who can be named and mislabels human beings; this one is a papal
act and a statute, shipped as a default, and it does not mislabel a day — it says the day was
never there); Mackern's *netart_latino database* (he replaced a default classification on
purpose, and the point was that somebody chose — nobody chose this one); Brain's *Slop Evader*
(a cut-off date published as the instrument and doing what it says, against dates drawn in
1582 and 1752 by people with other business, declared nowhere a user will see them).
Named and deliberately not answered a sixth time: Ọnụọha's *The Library of Missing Datasets* —
nothing is absent here, every day is present in every reader, which is exactly the trouble.

## Verification

`verify.mjs` runs **369 checks** in a real browser, scripting on and off, network denied in
both: the page is one file carrying its own data; every published number is recomputed from
the parts rather than read off the page; the ink on each layer of the sheet is measured out of
the SVG and counted against the layer it draws; the three controls are exercised as CSS with
scripting off; and no request leaves the filesystem in either state.
