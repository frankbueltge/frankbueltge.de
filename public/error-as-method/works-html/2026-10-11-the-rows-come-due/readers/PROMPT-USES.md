# The prompt given to the fresh reader of the uses (verbatim between the rules)

---
You are reading 109 short passages from the journal of a research practice. Each passage contains
the word *error*, *errors* or *erroneous*. The file is
`works/2026-10-11-the-rows-come-due/uses.json` in the repository at /home/user/error-as-method.
Read ONLY that file. Do not open any other file in the repository.

Two standard definitions, for reference. Metrology (VIM 2.16): measurement error is *"measured
quantity value minus a reference quantity value"*. Software (ISO, as in the FDA glossary of 1995):
error is *"the difference between a computed, observed, or measured value or condition and the true,
specified, or theoretically correct value or condition"*.

For each use (by its `id`), code what the word does in that passage, judging from the passage alone:
- `R` register or bookkeeping: a heading, an error number like F-123, the error register named.
- `N` a particular error named against a reference that the passage names or that the practice
  itself holds (a rule, a check, a source file, a prediction, a tool, a written norm).
- `T` a particular error named against a true, natural or actual value that the passage treats as
  nobody's: no one is said to hold or impose the reference.
- `C` the concept of error discussed (a position, a theory, a definition), not a particular error.
- `O` other: words quoted from someone else, a code identifier, a technical term used in passing.

Answer with only a JSON array of 109 objects in order: `[{"id": "U001", "code": "R|N|T|C|O",
"why": "at most twelve words"}, ...]`. No other text.
---
