You are coding texts. You start without any history. Everything you need is in one folder: `{FOLDER}`.

It holds thirty-six files: `m01-note.md` to `m18-note.md` and `m01-report.md` to `m18-report.md`. Eighteen makers
were each given one picture: a plot of a record of one measured quantity, one value every hour for 61 days, one dot
per value, in order from left to right, larger values up, with no axes, numbers or words. Some makers were told what
the record is; others were not. Each maker made a work for the web, wrote a short note about it (`-note.md`) and a
report on how it worked (`-report.md`). Code only what the two files of a maker say. Do not look anything up, and
do not guess at what the picture was.

For each maker answer:

- C1 periods: list every period or cycle length the maker says it **found in the picture itself** (by measuring,
  counting, a spectrum, autocorrelation, or seeing it repeat), in its own words and units. `[]` if none.
- C2 principal: of those, the one the maker treats as the record's main cycle, in hours, as a number (convert days
  to hours if needed; `""` if none). C2_lunar: does the maker say that this measured main period is a lunar period
  (about 12.4 hours, about 24.8 hours, "the moon's day", or a named lunar tidal constituent such as M2 or O1)?
  `yes` or `no`.
- C3 first regular: the first recurring feature the maker names, in the order of its **report** (then its note if
  the report names none): a cycle, a period, a rhythm, or a recurring growing and shrinking of the swing. Quote it
  (C3_quote) and give a class: `daily` (about 24 hours, once a day, day and night), `lunar-day` (about 24.8 hours,
  the moon's day), `half-daily` (about 12 hours, twice a day), `fortnightly` (about 14 to 15 days, or spring and
  neap), `monthly` (about 27 to 30 days), `weekly` (about 7 days), `other`, `none`.
- C4 modulation: does the maker say anywhere that the size of the swing grows and shrinks over a span of days
  (calm and lively stretches that alternate, an envelope, spring and neap)? `yes` or `no`; if yes, C4_reading: what
  does it say causes it, in its own words (`""` if it gives no cause).
- C5 quantity: what does the maker in the end think was measured? Quote its words (C5_quote), and give a category:
  `tide` (water level, the sea, a harbour, a tide gauge), `temperature` (of air, water or anything else),
  `humidity` (moisture in the air, dew), `light` (sunlight, radiation), `carbon` (carbon dioxide, CO2, a greenhouse
  gas, the breathing of plants or soil), `tree` (a tree, its trunk, stem, bark, wood or sap, a plant's water or
  swelling and shrinking of a living plant), `pollution` (any other substance in the air: particles, ozone, smog, radon,
  traffic exhaust), `magnetic` (the Earth's magnetic field), `electricity`, `activity` (human activity of any kind),
  `other`, or `none` (it says it cannot tell, or says nothing). If it gives several candidates, take the one it
  favours; if it favours none, take the first and say so in C5_quote.
- C6 hedged: does the maker mark that view as a guess, an assumption or uncertain? `yes` or `no` (`""` if C5 is
  `none`).
- C7 told and doubted: if the maker says it was told what the record is, does it say that the record is not, or may
  not be, that thing, giving as ground something it found in the picture? `yes` or `no`; `n/a` if the maker does
  not say it was told anything about what the record is. If yes, C7_quote.
- C10 told and checked: if the maker says it was told what the record is, does it say that it checked that
  statement against something it found in the picture, whatever the outcome (it may find that the picture agrees,
  disagrees, or cannot tell)? `yes` or `no`; `n/a` if the maker does not say it was told anything. If yes,
  C10_outcome: `agrees`, `disagrees` or `undecided`, and C10_quote.
- C11 told: does the maker say anywhere, in note or report, that it **was told** what the record is (by the
  commission, the brief or the person who gave it the file)? `yes` or `no`. If yes, C11_quote.
- C12 own inference: does the maker present its view of what was measured (C5) as **its own inference or reading**
  of the file (for example "I infer", "my reading", "an inference", "from the shape alone", "I looked nothing up")?
  `yes` or `no` (`""` if C5 is `none`). If yes, C12_quote.
- C8 the singular: does the maker name one stretch or moment that stands apart from all the rest? `yes` or `no`. If
  yes, C8_where: `low` (a dip or low stretch), `high` (a peak or high stretch), `calm` (a quieter stretch), `other`;
  and C8_reading: what the maker says it was, in its own words (`""` if it gives no reading).
- C9 title: the title of the work, from the note's heading.

Write your answers to `{FOLDER}/answers.json` as an object keyed by `m01` to `m18`. Use exactly these keys for each
maker: `C1`, `C2`, `C2_lunar`, `C3_quote`, `C3`, `C4`, `C4_reading`, `C5_quote`, `C5`, `C6`, `C7`, `C7_quote`,
`C10`, `C10_outcome`, `C10_quote`, `C11`, `C11_quote`, `C12`, `C12_quote`, `C8`, `C8_where`, `C8_reading`, `C9` (use `""` for a field that does not apply).
Write nothing else anywhere. Then reply with a short report: how you went about it and which answers were hard.
