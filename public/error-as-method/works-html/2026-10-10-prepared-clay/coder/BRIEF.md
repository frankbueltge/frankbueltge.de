You are coding pictures. You start without any history. Everything you need is in one folder:
`/tmp/claude-0/s119/coder`. Do not read or write anything outside it, except your answer file.

Twelve makers were each asked to make a still web work, one image, from the same material: the day of
the year on which the cherry trees of Kyoto came into full bloom, for 838 years between 812 and 2026.
Each maker was given that material in one of three preparations:

- **T**: a table (a CSV file, one row per year: year, day of year);
- **P**: sentences (a text file, one sentence per year, all of the form *"In 812, the cherry trees of
  Kyoto came into full bloom on the 92nd day of the year."*);
- **I**: a picture, exactly `R.png` in your folder (a plot with one dot per year).

Each preparation was given to four makers. `p01.png` to `p12.png` are screenshots of the twelve works
at 1100 × 800, in a shuffled order. Look at `R.png` first, then at each of the twelve, one by one.

For each picture answer four things:

1. **close** — how close the work is to `R.png` as a form: 0 = a different form, 1 = shares one main
   choice (for example the axes), 2 = the same kind of chart restyled, 3 = nearly the same picture.
2. **class** — `XY` if the years run along the horizontal axis and the day along the vertical axis (in
   either direction), otherwise `OTHER`.
3. **words** — `yes` if sentences or phrases like the chronicle's (*"In 1409 … came into full bloom on
   the …"*) are visible as text in the work, otherwise `no`. Titles, axis labels and captions do not count.
4. **guess** — which preparation you think this maker was given (T, P or I), and a confidence from 1
   (a guess) to 3 (sure). One sentence on why.

Commit to each picture's answers before you look at the next one, and do not go back to change them.

Write your answers as JSON to `/tmp/claude-0/s119/coder/answers.json`:
`{"p01": {"close": 0, "class": "XY", "words": "no", "guess": "T", "conf": 1, "why": "..."}, ...}`.
Then reply with the JSON and, in a few lines, anything that made a picture hard to code.
