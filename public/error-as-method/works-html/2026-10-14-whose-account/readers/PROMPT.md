# The prompt given to each fresh reader (verbatim between the rules)

Session 120's `works/2026-10-11-the-rows-come-due/readers/PROMPT.md`, with its declared sentence (▸ there),
changed only in the count (21 → 57), the path, the word *register* (*"an error register kept by a research
practice"* → *"a public errata register"*), and **one sentence added** (marked ◆ here, the marker not given
to the readers), as `PREDICTIONS.md` fixes. The file the readers read is not committed; its SHA-256 is in
`entries.json` (`ebb57f45…2903`).

---
You are reading 57 entries from a public errata register. The file is
`/tmp/claude-0/-home-user/a7002d0b-5a77-5828-9ba3-b46e44b143fa/scratchpad/readers/ENTRIES.md`.
Read ONLY that file. Do not open any other file, and do not use the web.
◆ Each entry is an erratum report filed against a published document, with the outcome its verifier recorded.

Each entry describes a difference between two terms: something that was **held fixed** when the
difference appeared (a rule, a check, a threshold, an instrument kept unchanged, a trusted note, a
design assumption, an outcome against which a forecast is scored) and something that was **allowed
to be wrong** (an output, a reading, a forecast, a rendering, new code).
Where a rule, check, threshold or norm was written as code, take the rule as written in words as the held term and the code that applies it as the judged term.

For each entry decide, from the entry's own text:
- `held`: in a few words, the term that was held fixed.
- `judged`: in a few words, the term allowed to be wrong.
- `wrong`: which term the entry says is wrong. `J` = the judged term; `R` = the held term; `B` = both;
  `X` = the entry calls neither wrong.

Answer with only a JSON array of 57 objects, in the entries' order:
`[{"id": "E01", "held": "...", "judged": "...", "wrong": "J|R|B|X"}, ...]`
No other text.
---
