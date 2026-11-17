# Study 80 — codebook, fixed before the first coding

*Session 278, 2026-11-17, with the predictions. One reader codes first (the conductor); the check (third session
of the step) codes every kept sentence a second time, blind to this coding, and reports the agreement.*

## Text

- `pdftotext` (poppler 24.02, reading order, no layout) of the report; the ligatures ﬁ ﬂ ﬀ ﬃ ﬄ written out; the
  running footer "International AI Safety Report 2026", bare page numbers, and a page's first line where it is
  the running head (a line that stands first on three or more pages) removed.
- A *block* is the text between blank lines. A block that does not end in `.`, `?`, `!`, `:` or a closing quote
  or bracket after one of them, and has at most 25 words, is a *heading*: it labels what follows and is not a
  sentence.
- Sentences: blocks are joined and split after `.`, `?` or `!` (with an optional closing quote or bracket) that
  is followed by a space and a capital letter, a digit, a quote or a bracket, except after the abbreviations
  listed in `extract80.py`. A sentence needs six words and three lower-case words, so that axis labels and
  table cells drop out.
- Citations: parentheses holding only reference numbers, each optionally with `*`, separated by commas or
  semicolons, e.g. `(512*, 717)`. A cross-reference `(see §…)` is not a citation.

## Selection

A body sentence is a *candidate* when it matches, case-insensitively,
`evaluat | benchmark | red[- ]?team | uplift (stud|trial) | (safety|pre-deployment|predeployment|third-party|capability|dangerous[- ]capability|model) test`.
Every candidate is read and coded.

## Codes

1. **about** — `yes` if the sentence is about evaluating AI systems: testing what a model or system can do, how
   it tends to behave, whether its safeguards hold, or evaluation as a practice (its methods, access, limits,
   who runs it, what follows from it). `no` otherwise (a person evaluating something else, evaluating a policy,
   testing a vaccine or a design in a laboratory, a benchmark of something other than AI). Only `yes` sentences
   are coded further.
2. **grade** — the claim's footing, first rule that applies:
   - `measured`: it reports the outcome of a specific test, study or measurement: a score, a rate, a comparison,
     or an observed behaviour of models in a named or cited test.
   - `open`: it says explicitly that the matter is unknown, uncertain, unresolved, contested, unreliable to
     establish, or under-evidenced ("it is unclear", "remains uncertain", "little evidence", "researchers
     disagree", "cannot yet reliably"). A bare *may* or *can* is not enough.
   - `inferred`: every other sentence: a general statement, an interpretation, a mechanism, a description of
     practice, a judgement.
3. **tests** — what the evaluation the sentence speaks of is for, first rule that applies:
   - `control`: a model's propensities and its control: deception, scheming, sandbagging, noticing it is being
     tested, reward hacking, resisting shutdown or oversight, acting against instructions, loss of control.
   - `safeguards`: whether protections hold: refusals, jailbreaks, misuse filters, the durability of safeguards,
     tampering with open weights.
   - `capability`: what a model can do: general skill, benchmarks of performance, dangerous capabilities (cyber,
     biological and chemical, autonomy, AI research and development, persuasion).
   - `general`: evaluation as practice, method, access or governance, with none of the above named.
4. **pass** — `yes` if the sentence names a pass mark: a level of a test result that, by someone's rule, decides
   what follows (a capability threshold, a critical capability level, a red line, an if-then commitment, a risk
   acceptance criterion, a safety level). A compute threshold that decides which models a rule covers is not a
   pass mark.
5. **setter** — for `pass = yes`: who the sentence says set the pass mark: `developer`, `public body`,
   `third party`, `several`, or `unstated`. Where a law or code requires developers to set their own, the setter
   is `developer` and the flag `required` is set.

The first coding writes each code with the sentence's id into `coding80.json`. No code is changed after the
count; a correction is a new, dated reading.

## Addendum — five readings fixed during the first coding, before any count (2026-11-17, session 278)

The first coding met five kinds of sentence the rules above did not settle. They were settled as follows, for
every sentence alike, before anything was counted:

1. **`measured` needs a footing a reader can find**: besides reporting an outcome, the sentence gives a number,
   names a test, benchmark or study, cites a reference, or points to a figure or table. A general summary of
   results with none of these ("leading systems match experts on standardised evaluations") is `inferred`.
2. **A sentence saying that evaluation cannot establish something is `open`**: that a test, benchmark or method
   is difficult, unreliable, limited, nascent, fails to predict or fails to capture, or that results are not
   disclosed. A sentence that gives the direction of an error ("benchmarks can overstate performance") is
   `inferred`: it claims to know which way the error runs.
3. **`tests` follows what the sentence names**, not the section it stands in. Red-teaming for vulnerabilities or
   jailbreaks is `safeguards`; a definition of evaluation in general is `general`.
4. **A cell of the report's table of developers' Frontier AI Safety Frameworks** (pages 116 and 117) takes its
   setter from the table's column "AI developer". Most of that table's cells are too short to be sentences under
   the text rules and are not in the selection; the three that are stand in it.
5. **No claim, `about = no`**: a pointer to a table or supplement, and a model's own words quoted in a figure.
