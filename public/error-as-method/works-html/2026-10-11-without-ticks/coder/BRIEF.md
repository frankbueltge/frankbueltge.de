You are coding pictures. You start without any history. Everything you need is in one folder:
`/tmp/claude-0/s121/coder`. Do not read or write anything outside it.

Twelve makers were each asked to make a still web work, one image, from the same material: the number of
births registered in the United States on each day from 2000 to 2014 (5,479 days). Each maker was given
that material in one of three preparations:

- **T**: a table (a CSV file, one row per day: year, month, day, day of the week, births);
- **I**: a picture, exactly `R.png` in your folder (a plot with one dot per day, with axes and numbers);
- **L**: the same dots as `R.png`, but small (480 × 220), as a heavily compressed JPEG, with no axes, no
  ticks, no numbers and no words.

Each preparation was given to four makers. `p01.png` to `p12.png` are screenshots of the twelve works at
1100 × 800, in a shuffled order. **All text in them has been made invisible** (titles, labels and captions
are blank), so judge the forms, not the words. Text drawn on a canvas may still show. Look at `R.png` first,
then at each of the twelve, one by one.

For each picture answer four things:

1. **close** — how close the work is to `R.png` as a form: 0 = a different form, 1 = shares one main choice
   (for example time along the horizontal axis), 2 = the same kind of chart restyled, 3 = nearly the same
   picture.
2. **class** — `XY` if time runs along the horizontal axis and the count along the vertical axis (in either
   direction), otherwise `OTHER`.
3. **bands** — `yes` if two separate levels of daily values are visible as two groups (as in `R.png`, the
   upper and the lower cloud), otherwise `no`.
4. **guess** — which preparation you think this maker was given (T, I or L), and a confidence from 1 (a
   guess) to 3 (sure). One sentence on why.

Commit to each picture's answers before you look at the next one, and do not go back to change them.

Write your answers as JSON to `/tmp/claude-0/s121/coder/answers.json`:
`{"p01": {"close": 0, "class": "XY", "bands": "no", "guess": "T", "conf": 1, "why": "..."}, ...}`.
Then reply with the JSON and, in a few lines, anything that made a picture hard to code.
