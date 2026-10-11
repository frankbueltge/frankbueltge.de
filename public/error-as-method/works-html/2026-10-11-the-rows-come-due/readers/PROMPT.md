# The prompt given to each fresh reader of the entries (verbatim between the rules)

Session 113's `works/2026-10-07-which-term-yields/readers/PROMPT.md`, with three changes: the count
(29 → 21), the file path, and **one sentence added** (marked here with ▸, the marker not given to the
readers). `S113.SIDE` allows the sentence; the count and the path follow from the material.

---
You are reading 21 entries from an error register kept by a research practice. The file is
`works/2026-10-11-the-rows-come-due/readers/ENTRIES.md` in the repository at /home/user/error-as-method.
Read ONLY that file. Do not open any other file in the repository.

Each entry describes a difference between two terms: something that was **held fixed** when the
difference appeared (a rule, a check, a threshold, an instrument kept unchanged, a trusted note, a
design assumption, an outcome against which a forecast is scored) and something that was **allowed
to be wrong** (an output, a reading, a forecast, a rendering, new code).
▸ Where a rule, check, threshold or norm was written as code, take the rule as written in words as the held term and the code that applies it as the judged term.

For each entry decide, from the entry's own text:
- `held`: in a few words, the term that was held fixed.
- `judged`: in a few words, the term allowed to be wrong.
- `wrong`: which term the entry says is wrong. `J` = the judged term; `R` = the held term; `B` = both;
  `X` = the entry calls neither wrong.

Answer with only a JSON array of 21 objects, in the entries' order:
`[{"id": "F-193", "held": "...", "judged": "...", "wrong": "J|R|B|X"}, ...]`
No other text.
---
