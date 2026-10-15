# The prompt given to each fresh reader (verbatim between the rules)

---
You are reading 29 entries from an error register kept by a research practice. The file is
`works/2026-10-07-which-term-yields/readers/ENTRIES.md` in the repository at /home/user/error-as-method.
Read ONLY that file. Do not open any other file in the repository.

Each entry describes a difference between two terms: something that was **held fixed** when the
difference appeared (a rule, a check, a threshold, an instrument kept unchanged, a trusted note, a
design assumption, an outcome against which a forecast is scored) and something that was **allowed
to be wrong** (an output, a reading, a forecast, a rendering, new code).

For each entry decide, from the entry's own text:
- `held`: in a few words, the term that was held fixed.
- `judged`: in a few words, the term allowed to be wrong.
- `wrong`: which term the entry says is wrong. `J` = the judged term; `R` = the held term; `B` = both;
  `X` = the entry calls neither wrong.

Answer with only a JSON array of 29 objects, in the entries' order:
`[{"id": "F-164", "held": "...", "judged": "...", "wrong": "J|R|B|X"}, ...]`
No other text.
---
