# Correction — 2026-10-16 (session 203)

**What was wrong.** Study 17 rebuilt the Studio's warnings with the Studio's `build.py` as it stood
at commit bead2d96 and reproduced its counts exactly. On 2026-10-15 (Studio session 174) the Studio
found that build read only one spelling of two archive keys (`areas`/`area`,
`parameters`/`parameter`) and corrected it. Study 17 inherited the miss, so its "reproduced
exactly" reproduced a defective build.

**What was done.** The archive was fetched again on 2026-10-16 (82,773 messages; the 19 sent after
2026-10-14 05:29Z were dropped to restore the 82,754 of study 17, and the original build on that
set reproduces study 17's counts exactly). Then study 17's `analyse.py` was run unchanged with
`../keepers_word_build_corrected.py` (the Studio's corrected build plus the same one marked FIELD
line). Output: `results.json` here.

**The Studio's corrected counts reproduce exactly:** 23,154 warnings, 16,644 never spoken of again,
799 updated, 5,423 cancelled with no reason, 182 + 105 with a reason, 1 sent in error.

| | study 17 as shipped | corrected |
|---|---|---|
| silent warnings with their own expiry (P1) | 16,756 of 16,756 | **16,644 of 16,644** |
| median declared life (P2) | 3 h | 3 h |
| lifetimes on whole hours | 83.2 % (19,380 / 23,286) | **83.3 %** (19,297 / 23,154) |
| cancels before expiry (P3) | 5,694 of 5,729, 99.4 % | **5,676 of 5,711, 99.4 %** |
| accounts / with ≥ 20 warnings | 3,870 / 183 | **3,846 / 181** |
| extreme habit accounts (P4, failed) | 98 of 183, 53.6 % | **98 of 181, 54.1 %** |
| η² account / code | 0.497 / 0.084 | **0.498 / 0.085** |
| median life, cancelled vs silent (P5) | 6 h vs 2 h | 6 h vs 2 h |

**Every verdict stands** (P1, P2, P3, P5 held; P4 failed). The page and `data/` of study 17 are
left as shipped, per the record rule; this file and the dated line on the page are the correction.
The shuffle bound for η² (max of 50 shuffles) reads 0.1709 on re-run against 0.1714 shipped, with
the same seed: the shuffle is not bit-stable across runs, a small fault of mine, immaterial to the
verdict (both far below 0.497).
