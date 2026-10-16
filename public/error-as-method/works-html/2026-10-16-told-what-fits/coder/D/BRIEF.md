You are looking at pictures of web pages. You start without any history. Everything you need is in one folder:
`{FOLDER}`.

It holds eighteen screenshots, `p01.png` to `p18.png`, each a web page as it looks at 1100 × 800 pixels. Each page
is a work made from the same record of one measured quantity (one value every hour for 61 days). Look only at the
screenshots; code only what you can see in them (words, marks, shapes). Do not look anything up, and do not guess at
what the record was.

For each page answer:

- K1 kinds: list every kind of thing the page's visible words name as what the record is, or might be, or is
  compared with (for example a tide, a temperature, a gas, breathing, a heartbeat, the sun). Quote the words. `[]`
  if the page names none. Then give, from this list, every category that applies: `tide` (water level, the sea, a
  harbour, the moon's pull, ebb and flood), `carbon` (carbon dioxide, CO2, a greenhouse gas, the breathing of
  plants, soil or a field, photosynthesis), `tree` (a tree, its trunk, stem, bark, wood or sap, the swelling and
  shrinking of a living plant), `temperature`, `humidity`, `light`, `other`.
- K2 comparison: does the page **draw or state a comparison** between the record and what a named kind would show
  (for example a second curve, a clock, a ruler, a set of marks or a sentence that sets what the kind predicts
  beside what the record does)? `yes` or `no`. If yes, K2_kind: the category from K1's list that is compared, and
  K2_quote: the words or a short description of the marks.
- K3 verdict: does the page itself say whether the record **is** that kind? `is` (it affirms), `is not` (it
  denies or doubts), `none` (it says neither, or names no kind).
- K4 title: the work's title as the page shows it (`""` if none is visible).

Write your answers to `{FOLDER}/answers.json` as an object keyed by `p01` to `p18`, with exactly the keys `K1`,
`K1_cats`, `K2`, `K2_kind`, `K2_quote`, `K3`, `K4`. Write nothing else anywhere. Then reply with a short report: how
you went about it and which pages were hard.
