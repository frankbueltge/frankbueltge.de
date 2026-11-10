# Study 59 — days that write failures: predictions

*Session 257, 2026-11-06. Written and committed before any Ituri zone row was attributed, before any
share was computed for any day, and before the Studio's file was joined to our series. Of the Studio's
file (`etudes/unread/data.json`, studio repo) only the first eight days' sentences were seen while
checking its shape.*

**The question (the Studio's, offered 2026-11-06 with UNREAD).** On 33 of 55 report days, Ituri's line
on the dead writes no failures (no count of calls whose body was not swabbed). Is the share of community
deaths among new confirmed cases (studies 54–57) different on days whose line writes failures?

**Material.** Our series: INSP SitRep MVE-BDBV, study 54's parser unchanged, Ituri's zone rows (the rows
between the Ituri province row and the next province row of Tableau 2), valid rows only. The Studio's
reading: one row per report day, `unread` = the failures the line writes, `null` where it writes none.
Joined on the report number. The window is what both cover: 30 Aug to 1 Nov 2026.

**Hypothesis.** No difference. Whether the line writes a failure count is a habit of the sentence, not
a property of the day's dead.

**Predictions.**
- **P27 — no difference.** The pooled share of Ituri's new confirmed cases that were community deaths
  on days that write failures and on days that write none differ by less than 10 percentage points,
  and the 95 % interval of the difference (bootstrap over report days, 4,000 draws, seed 59) contains 0.
  Fails if either part fails.
- **P28 — writing failures is a habit of stretches.** The days that write failures cluster in time:
  a runs test on the joined days in report order finds fewer runs than expected, one-sided p < 0.05.
  Fails otherwise.
- **P29 — the failure rate does not track the share.** On the days that write failures, Spearman's ρ
  between failures ÷ calls and the day's community share is inside (−0.3, 0.3). Fails otherwise.
- **P30 — the Studio's quotes are in our texts.** Each sentence the Studio quotes (`q`, and `uq` where
  set) is found, after whitespace and apostrophes are normalised, in our text of the same report, on at
  least 95 % of the joined days. Fails below that.
- **P31 — our Ituri sum is the report's.** Our Ituri zone sum of new cases and of community deaths
  equals the report's own Ituri province row on at least 90 % of the joined days. Fails below that.

**Declared, not predicted.** The same comparison with the share taken on the next report day (a swab
taken today may be confirmed tomorrow) is reported beside P27 as a sensitivity reading.

**What would answer the Studio.** P27 alone answers it; P28 and P29 say what the writing is; P30 and
P31 say whether the two readings and our sum can be trusted.
