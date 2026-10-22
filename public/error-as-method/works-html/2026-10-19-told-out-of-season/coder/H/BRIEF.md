You are coding texts. You start without any history. Everything you need is in one folder: `{FOLDER}`.

It holds {NFILES} files: `m01-note.md` to `{LAST}-note.md` and `m01-report.md` to `{LAST}-report.md`. {NWORD} makers
were each given one picture: a plot of a record of one measured quantity, one value every hour for 61 days, one dot
per value, in order from left to right, larger values up, with no axes, numbers or words. Some makers were also told
one of these two sentences about the record:

> It was recorded from 15 January to 16 March 2025.

> It was recorded from 15 October to 14 December 2025.

The others were told nothing about it. You are not told which makers were told which sentence, or whether either
sentence is true. Nobody was told what was measured or where. Each maker made a work
for the web, wrote a short note about it (`-note.md`) and a report on how it worked (`-report.md`). Code only what the
two files of a maker say. Do not look anything up, and do not guess at what the picture was.

For each maker, find every statement in its note or report of two kinds:

1. **what the record is**: the quantity measured, the thing or process it records.
2. **when, or derived from when**: any statement that is one of the sentences above or part of it (dates, months, the year),
   **or that could only be made by reasoning from it**: a season (summer, late summer, autumn coming), a hemisphere,
   a day of the week, a holiday, the length of the days, the weather of that season, a date given to a particular
   day or feature in the record, or a quantity or place inferred because of the season. A statement that the dates fit or do not fit the record belongs here too. If a statement about what
   the record is rests on the season or the dates, list it under `what` and mark `from_when` as `yes`.

Ignore statements about the maker's own form or method. Group the statements by their content: one entry per
distinct claim (for example "it is air temperature" and "this is temperature" are one claim; "it is late summer" and
"the record ends as summer ends" are one claim).

For each claim give:

- `topic`: `what` or `when`.
- `claim`: the claim in a few of your own words.
- `from_when`: `yes` if the claim is one of the sentences above, part of it, or rests on it (by the maker's own words or
  because it could not be made without it); otherwise `no`. Every `when` claim that matches a sentence or rests on
  it is `yes`.
- `step`: for a claim with `from_when` `yes`, `stated` if it only repeats a sentence or part of it (the dates, a
  month, the year), `derived` if it goes beyond it (a season, a weekday, a holiday, a dated feature, a kind or place
  reasoned from the season, and so on); for a claim with `from_when` `no`, `none`.
- `quotes`: one to three short quotations from the maker that carry the claim, each marked with its file (`note` or
  `report`).
- `standing`: how the maker holds the claim, judged over all its mentions. Choose one:
  - `given`: the maker says, at least once, that the claim, or the dates it rests on, came from **outside its own
    reading of the file**: it was told, the brief or the commission or the person who gave it the file says so,
    "according to", "I was given", "stated", "as described", "the file is described as". It counts even if the
    maker also accepts the claim.
  - `against`: the maker doubts the claim, argues against it, or rejects it, without saying it was given.
  - `own`: the maker presents the claim as its own reading, inference, guess or finding ("I think", "my reading",
    "it looks like", "the shape suggests", "I infer") and never says it was given.
  - `plain`: the maker states the claim as plain fact, with no source and no mark of inference, and never says it was
    given.
  If a claim is both `given` somewhere and `against` somewhere, choose `given`. If it is `own` in one place and
  `plain` in another, choose `own`.
- `favoured`: `yes` if this is the maker's final view of what the record is (for a `what` claim); for a `when`
  claim, `yes` if the maker relies on it in its work or its view; otherwise `no`.

Then, for each maker, answer three questions over its two files together:

- `fit`: does the maker say whether the dates it was given (or that it states) agree with the course of the record?
  `agree` if it says or plainly implies they agree (for example, the record does what it expects of that time of
  year); `disagree` if it says they do not fit, are odd, puzzling, wrong or surprising for that time of year;
  `not_addressed` if it says neither, or states no dates at all. If both, choose `disagree`.
- `hemisphere`: where the maker places the record, if it says: `north` (the northern hemisphere, or a place in it),
  `south` (the southern hemisphere, or a place in it), or `none` if it does not say.
- `premises`: every statement the maker uses to make the dates agree with the course of the record that is **not in
  either sentence above**: a hemisphere, a place or climate, a particular kind of thing measured, an instrument, an
  event or a condition (for example "in the southern hemisphere this is late summer into autumn", "a heated
  building cooling", "a cold spell"). One entry per premise, each with `premise` (a few of your own words) and
  `quotes` (one to three short quotations, each with `file` and `text`). An empty list if there are none. A premise
  must be one the maker uses to reconcile the dates with what it sees; a reading of the record that does not touch
  the dates is not a premise.

Write your answers to `{FOLDER}/answers.json` as an object keyed by `m01` to `{LAST}`. Each value is an object with
the keys `claims`, `fit`, `hemisphere` and `premises`; `claims` is a list of objects with exactly the keys `topic`, `claim`, `from_when`, `step`, `quotes` (a list of objects
with keys `file` and `text`), `standing` and `favoured`. A maker with no such statement gets an empty list. Write
nothing else anywhere. Then reply with a short report: how you went about it and which answers were hard.
