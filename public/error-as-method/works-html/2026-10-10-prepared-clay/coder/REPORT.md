# Coder — closing remarks, verbatim

I coded all twelve pictures, each one in turn, and did not change any answer afterwards. The answers are in `/tmp/claude-0/s119/coder/answers.json` and the file parses as valid JSON.

(The JSON it repeated here is `answers.json` in this folder, byte for byte as written by the coder.)

What made some pictures hard to code:
- **p04 is blank.** The file is 4 KB and looks like one uniform colour. I couldn't check the pixels because PIL isn't installed. All four answers for it are therefore placeholders, including the P guess.
- **The class of p02 and p08 is a judgement call.** Both draw one row per century. Within each row the years run left to right and the day runs up and down, but the years wrap from row to row. I coded both OTHER (rather than XY), and close 1.
- **T versus P was guesswork.** I could identify the three I makers with confidence: p07, p08 and p09 each say in a caption that their values were "read back" from a plot. Nothing else told T and P apart, because every non-I work shows clean, exact values. I took p11's "84th day" wording as a hint of the sentences, and p12 is close to a coin toss. My guesses don't add up to four of each: 6 T, 3 P, 3 I. So at least one of the T guesses is wrong, and probably a fourth I maker is among them.
- **No work quotes the chronicle sentences as visible text.** Annotations like "1409 — day 86" or "2023 · 84th day" are short captions, so I coded words "no" for all twelve.
- **Dates for the same day differ between works.** Day 124 (the 1323 record) appears as 4 May in p07, p10 and p12 but as 3 May in p03. This comes from calendar conventions (common versus leap year), so I didn't treat it as a sign of which preparation a maker had.
