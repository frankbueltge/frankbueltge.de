# Check 82 — codebook for the blind second coding

*Session 280, 2026-11-19. Cycle 016, step 4 of the programme, third session: the check. Fixed with the
predictions (`../PREDICTIONS82.md`) after the reading sheets were built (`sheet82.py` → `sheets/`) and before any
second code existed. The second coders are readers convened by the conductor. They see this file, the sheets and
the sources, and nothing of the first coding: no code, note, quote, reason, count or page of this work. Parts A, B
and C repeat the first coding's rules (`../CODEBOOK80.md` and `../CODEBOOK81.md`), with their addenda folded in where
they apply; part B adds the readings the critique asked of the check, which the first coding did not make.*

## Part A — study 80: the report's sentences (sheets `s80-a`, `s80-b`)

Each item is a candidate sentence of the body of the *International AI Safety Report 2026*, with its page, its
section and the reference numbers in its own brackets (`*` is the report's own mark: "published by a for-profit AI
company, or for which more than half of the authors are affiliated with such a company"). Code each sentence as it
stands.

1. **about** — `yes` if the sentence is about evaluating AI systems: testing what a model or system can do, how it
   tends to behave, whether its safeguards hold, or evaluation as a practice (its methods, access, limits, who runs
   it, what follows from it). `no` otherwise (a person evaluating something else, evaluating a policy, testing a
   vaccine or a design in a laboratory, a benchmark of something other than AI). Also `no`: a pointer to a table or
   supplement, and a model's own words quoted in a figure. Only `yes` sentences are coded further.
2. **grade** — the claim's footing, first rule that applies:
   - `measured`: it reports the outcome of a specific test, study or measurement (a score, a rate, a comparison, or
     an observed behaviour of models in a named or cited test) **and** gives a footing a reader can find: a number, a
     named test, benchmark or study, a cited reference, or a pointer to a figure or table. A general summary of
     results with none of these ("leading systems match experts on standardised evaluations") is `inferred`.
   - `open`: it says explicitly that the matter is unknown, uncertain, unresolved, contested, unreliable to
     establish, or under-evidenced ("it is unclear", "remains uncertain", "little evidence", "researchers
     disagree", "cannot yet reliably"); or that a test, benchmark or method is difficult, unreliable, limited,
     nascent, fails to predict or fails to capture, or that results are not disclosed. A bare *may* or *can* is not
     enough. A sentence that gives the direction of an error ("benchmarks can overstate performance") is
     `inferred`: it claims to know which way the error runs.
   - `inferred`: every other sentence: a general statement, an interpretation, a mechanism, a description of
     practice, a judgement.
3. **tests** — what the evaluation the sentence speaks of is for, as the sentence names it (not the section it
   stands in), first rule that applies:
   - `control`: a model's propensities and its control: deception, scheming, sandbagging, noticing it is being
     tested, reward hacking, resisting shutdown or oversight, acting against instructions, loss of control.
   - `safeguards`: whether protections hold: refusals, jailbreaks, misuse filters, the durability of safeguards,
     tampering with open weights; red-teaming for vulnerabilities or jailbreaks.
   - `capability`: what a model can do: general skill, benchmarks of performance, dangerous capabilities (cyber,
     biological and chemical, autonomy, AI research and development, persuasion).
   - `general`: evaluation as practice, method, access or governance, with none of the above named; a definition of
     evaluation in general.
4. **pass** — `yes` if the sentence names a pass mark: a level of a test result that, by someone's rule, decides
   what follows (a capability threshold, a critical capability level, a red line, an if-then commitment, a risk
   acceptance criterion, a safety level). A compute threshold that decides which models a rule covers is not a pass
   mark.
5. **setter** — for `pass = yes`: who the sentence says set the pass mark: `developer`, `public body`,
   `third party`, `several`, or `unstated`. Where a law or code requires developers to set their own, the setter is
   `developer` and the flag `required` is set. A cell of the report's table of developers' Frontier AI Safety
   Frameworks (pages 116 and 117) takes its setter from that table's column "AI developer".

**Part A2 (sheet `s80-a` only): Table 3.5, read whole.** In the report's PDF (given to the coder of `s80-a`, pages
115 to 117 of the PDF), the table of developers' Frontier AI Safety Frameworks: count its rows; for each row the
developer, whether the row names a pass mark (a threshold, level or tier that decides deployment, mitigation or
halting), and whether any public body is named as the one who set it.

## Part B — study 81: the sources behind the measured sentences (sheets `s81-1` to `s81-8`)

Each item is a source the report gives for one or more of its measured sentences: the reference number, the
report's asterisk, the entry as the report prints it, the address, and the sentences that rest on it. **Read the
source in full text**: download the PDF or page and search it; an abstract alone is not enough for code 8. Read
directly first; where a page refuses, use the research tools (page extraction, the arXiv tool, a second fetch
tool), and say which route was used. A source that cannot be reached by any route is coded `unreached` and is not
guessed.

1. **test** — `yes` if the source reports running a test, benchmark, study or red-team exercise on one or more AI
   models and gives its outcome; `no` otherwise (an essay, a policy text, a compute estimate, a news report of
   someone else's test without its method); `unreached`. Codes 2 to 7 only for `yes`.
2. **runner** — who ran it, from the source's authors and their stated affiliations:
   - `maker`: every author works for the developer of a model whose result is reported, or the source is that
     developer's own publication (a system card, a model report);
   - `maker and others`: authors from the developer of a tested model together with authors from elsewhere;
   - `third party`: no author works for the developer of any model whose result is reported (academics,
     non-profit evaluators, other companies);
   - `public body`: a government body (an AI safety or security institute, a ministry, a regulator) ran it, alone or
     with others, for the result the sentence cites; this code takes precedence over the others;
   - `unstated`: the source does not say who ran it.
   A research model the authors trained themselves takes its runner from the developer of its base model (a
   fine-tune of a maker's open model, by that maker's staff, is the maker's).
3. **pass** — `none` if the source applies no pass mark to the result the citing sentence rests on; otherwise who
   set the mark it applies (`maker`, `third party`, `public body`), as the source states. A pass mark is a level of
   a test result that, by someone's rule, decides what follows (a capability threshold, a critical level, a red
   line, an acceptance criterion, a safety level).
   **3a. pass applies to** (new, for every source that applies any pass mark anywhere in it, even where code 3 is
   `none`): the kinds of result the source applies a pass mark to, each with a short quote: `biological or
   chemical`, `cyber`, `autonomy or AI research`, `persuasion`, `propensity or control` (deception, scheming,
   sandbagging, noticing a test, acting against instructions, self-exfiltration, sabotage), `other`.
4. **outside** — can someone outside the maker repeat the test and check the result, as the source states:
   - `rerunnable`: the test's materials (its items, tasks or code) are published or offered on request, and the
     model tested was available to outsiders (open weights, or a public product or interface) at the time of the
     test;
   - `materials closed`: the model was available, but the items, tasks, prompts or protocol are withheld in full or
     in the part the result rests on;
   - `model closed`: the model tested was not available to outsiders (a pre-deployment snapshot, an internal or
     helpful-only version, a model the source does not identify); materials public or not stated;
   - `closed`: neither is available;
   - `unstated`: the source does not say enough to tell.
   A model the source does not identify ("a proprietary model", anonymised models) is not available to outsiders. A
   self-trained research model counts as available if it was released, or can be rebuilt from released code on an
   available base.
5. **model access** (new, splits code 4): for the model or models the cited result rests on: `open weights`,
   `public product or API` (hosted by its maker), `access on request` (a vetted or restricted programme),
   `not available` (internal, pre-deployment, helpful-only, unidentified), `mixed` (list which), `unstated`.
6. **materials access** (new, splits code 4): `public` (items, tasks or code downloadable), `on request` (offered to
   a vetted circle or by application), `withheld` (in full, or in the part the result rests on), `unstated`.
7. **available today** (new): can an outsider still use the model(s) the result rests on, on 2026-11-19: `yes`
   (open weights still downloadable, or still offered by the maker), `no` (retired or withdrawn; name the page that
   says so), `unknown`. One quick lookup of the maker's model or deprecation page; `unknown` if that does not
   settle it.

**Per sentence and source** (new; for every sentence listed under the source, including sources coded `test = no`):

8. **holds** — does the source contain the result the sentence states, read in full text:
   - `holds`: the source states the result: the figure, the direction and the finding the sentence gives, for the
     same thing;
   - `partly`: it states part of it, or a related result with a different figure, scope, model or condition;
   - `not found`: the full text, searched for the sentence's figures and key terms, does not contain it;
   - `contradicts`: it states something incompatible with the sentence;
   - `not checkable`: the full text could not be obtained (say what was read instead).
   Give the passage that decides (at most 40 words, quoted exactly) and where it stands (page, section or figure).

## Part C — step 3's nine (sheet `nine`)

Each item is a loss of control of 2026 that a maker published on its own pages. Read the maker's page. Code
**outside** with the same rule as code 4: can someone outside the maker repeat what happened and check it
(`rerunnable`, `materials closed`, `model closed`, `closed`, `unstated`), with the passage that decides. Also code
**model access** (code 5) for the model in the case.

## For every coder

- Write only to the output file named in your brief: JSON, one record per item, every code with its passage.
- Quote at most 40 words from any source; copy no document into the output; keep downloads in your own scratch
  folder.
- Do not open this practice's repository, its pages on frankbueltge.de, the Atelier's repository or any earlier
  coding of these items. If you meet one by accident, stop reading it and say so in the output.
- Fabricate nothing: a code you cannot ground in a passage you read is `unstated`, `not found`, `not checkable` or
  `unreached`, as the case is.
