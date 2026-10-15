I coded all 12 makers and wrote the answers to `/tmp/claude-0/s123/cB/answers.json`. Each maker has the 15 keys, `""` where a field doesn't apply, and a `*_quote` field backing each yes/measured/supplied/told/inferred. I wrote nothing else; the small helper script went in the scratchpad and I deleted it.

**How I went about it:** I read all 24 files in full, then coded each maker only from what its own note and report say.

The makers fall into two groups:
- **The 40-pixel-wide picture (m01, m04, m05, m07, m08, m09):** none measured a cycle. Each supplied a daily cycle from the width of the ink band, guessed air temperature (category `other`), and named no weekly cycle and no holiday. m04, m08 and m09 were told the values were hourly; m01, m05 and m07 worked from the count of 1,464.
- **The 300-pixel-wide picture (m02, m03, m06, m10, m11, m12):** all measured a period of about 24 values and about 168 values (a day and a week), named electricity demand, put the odd stretch as low, and labelled it Christmas–New Year while saying that label was an inference or guess.

All 12 decoded the pixels with code (B1 `yes`). I coded B11 `no` for every maker: all of them took numbers from the pixels, and none says it stopped measuring.

**Answers that were hard:**
- **B6 for the 40-pixel group:** each names two stretches, a sag around columns 22–32 and a jump up in the last columns, not one. I coded `yes` / `other`. A stricter reading of "one stretch" would make these `no`.
- **B8 for m01, m05 and m07:** each reasons "hourly" from 1,464 = 61 × 24, which comes from the count, not the picture. m05 commits to hourly, so I coded it `inferred`. m01 and m07 also offer six-hourly readings over a leap year, so I coded them `unknown`.
- **B8, told versus inferred, for m06, m11 and m12:** each states "hours per pixel column" before measuring any cycle, so I coded `told`. m02, m03 and m10 explicitly reason from the 24-value cycle, so I coded `inferred`.
- **B10, pixels versus items:** m04 and m08 lay one dot per hour on an even grid inside enlarged pixel cells and say the dots are "counts, not positions", so I coded `pixels`. m07 places its dots at quantiles of each column's darkness and calls their heights a reconstruction, so I coded `items`. m02, m10 and m12 rebuild values or redraw located dots, so they are `items`. m01, m03, m05, m06, m09 and m11 are `pixels`.
- **B5 for the 40-pixel group:** I counted "daily cycle", "day/night" or "daily swing" as naming a day as the cause, so I coded `yes`.
- **B2 for m12:** the weekly cycle is clearly measured, but the 24-hour slices rest on the hours it was told. I still counted its time-of-day fold as a measured daily cycle.
- **B9 for m11:** it calls Christmas–New Year only "the obvious guess". I coded `yes`, with B9_outside `yes`.
