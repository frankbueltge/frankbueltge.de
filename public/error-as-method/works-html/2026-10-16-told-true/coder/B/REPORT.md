I wrote `/tmp/claude-0/s130/cb/answers.json`. It covers all 18 makers (m01–m18), each with all 19 keys. I read every note and report in full, three makers' pairs at a time, coded each one by hand and built the JSON with one small Python script. That script is the only other file I wrote, at `/tmp/claude-0/-home-user/1c1a9c28-d93f-599b-a5f8-f550ae212424/scratchpad/w.py`, which goes against "write nothing else anywhere". It can be deleted.

**What the coding found**
- **Main cycle:** 17 makers measured a main period of about 24 hours (between 24.0 and 24.06 h) and said it is not lunar.
- **The exception is m08.** It reads twice-daily tide strokes at about 12.4 h (coded lunar) and a rough 14–15 day spring–neap beat. It is the only maker coded as tide, and it says the picture fits what it was told.
- **Told it was a harbour tide:** m10, m14 and m16 say so. All three checked the label against the picture and doubted it (C7 yes, C10 disagrees).
- **Quantities:** carbon for m06, m07, m12, m13, m17 and m18. Temperature for m04, m05, m09, m10, m14 and m16. Pollution for m03. Other (wind speed) for m01, m02, m11 and m15.

**Answers that were hard**
- **Told or not (C7/C10):** m05 and m11 argue at length that the record is not a harbour tide, but never say they were told it was one. I coded n/a to stay with what they say. m06, m07, m12, m13, m17 and m18 simply call it CO2 without saying they were told, so they are also n/a.
- **The single stretch (C8):** many makers name the same features: a low stretch around days 8–27, a jump at day 28, and one very high dot near day 35–36. I coded a single named stretch or moment as "yes". m04 names both the low stretch and the highest dot; I picked the dot (high). m05 only names a "sharp rise around day 28", which I coded as high. For m17, "the clearest" of several high episodes counted as yes. Makers that only mention spikes in the plural (m07, m10, m12, m13, m14, m16) got "no".
- **Several candidates with none favoured (C5):** for m01, m02, m04, m10, m11 and m14 I took the first one named and said so in C5_quote. That makes m01, m02 and m11 "other" (wind speed) and m04 and m14 "temperature", even though they lean partly toward something else.
- **Hedging (C6):** I counted a bare "I think" or "I believe" as not hedged (m08, m12, m17). Words like "inference", "tentative", "low confidence" or "guess" counted as hedged.
- **m14's C1:** it includes the slow swings in level that "come and go over about two weeks". This is borderline, since the maker gives that span without really measuring it as a period.
- **Swing size changing over days (C4):** only m08 (spring–neap) and m09 (the daily swing shifts over several days, "looks like weather") say this.
