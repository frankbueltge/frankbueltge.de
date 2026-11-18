# Study 81 — codebook, fixed before the first source was read

*Session 279, 2026-11-18, with the predictions. One reader codes first (the conductor); the check (third session of
the step) codes every source a second time, blind to this coding, and reports the agreement.*

## Selection

- **The results.** The 41 sentences study 80 graded `measured` (`coding80.json`), each with the references it cites
  (`sentences80.json`).
- **A source.** Every distinct reference those sentences cite, looked up in the report's reference list (its entry
  copied as the report prints it). A measured sentence that cites no reference takes as its source what the sentence
  itself names ("according to Epoch AI's evaluations") or, for a figure, the source line of that figure in the
  report. Where neither names a source, the sentence is coded `no source named` and has no source.
- **Reading a source.** Its own page: the abstract and the method section of a paper, the relevant section of a
  system card or report. Read directly first, through the attached research tools where a page refuses. A source
  that cannot be reached is coded `unreached` and is not guessed.

## Codes per source

1. **test** — `yes` if the source reports running a test, benchmark, study or red-team exercise on one or more AI
   models and gives its outcome; `no` otherwise (an essay, a policy text, a compute estimate, a news report of
   someone else's test without its method). Only `yes` sources are coded further.
2. **runner** — who ran it, from the source's authors and their stated affiliations:
   - `maker`: every author works for the developer of a model whose result is reported, or the source is that
     developer's own publication (a system card, a model report);
   - `maker and others`: authors from the developer of a tested model together with authors from elsewhere;
   - `third party`: no author works for the developer of any model whose result is reported (academics,
     non-profit evaluators, other companies);
   - `public body`: a government body (an AI safety or security institute, a ministry, a regulator) ran it, alone
     or with others; this code takes precedence over the others;
   - `unstated`: the source does not say who ran it.
3. **pass** — `none` if the source applies no pass mark to its result; otherwise who set the mark it applies
   (`maker`, `third party`, `public body`), as the source states. A pass mark is a level of a test result that, by
   someone's rule, decides what follows (study 80's codebook, code 4).
4. **outside** — can someone outside the maker repeat the test and check the result, as the source states:
   - `rerunnable`: the test's materials (its items, tasks or code) are published or offered on request, and the
     model tested was available to outsiders (open weights, or a public product or interface) at the time of the
     test;
   - `materials closed`: the model was available, but the items, tasks, prompts or protocol are withheld in full or
     in the part the result rests on (a private set, undisclosed red-team prompts, a human trial whose materials are
     not published);
   - `model closed`: the materials are public, but the model tested was not available to outsiders (a
     pre-deployment snapshot, an internal or helpful-only version);
   - `closed`: neither is available;
   - `unstated`: the source does not say enough to tell.

## Codes per measured sentence

Taken from its sources, by rule, not read again: `runner` is the set of its test sources' runners; `outside` is
`rerunnable` if any of its test sources is, otherwise the code its sources share, otherwise `mixed`. A sentence with
no source is `no source named`.

## Step 3's nine

The nine losses of control of 2026 (`../../cycle-015/what-harm-is-on-record/results78.json`), read on the makers'
own pages, each coded once for **outside** with the same rule: can someone outside the maker repeat what happened
and check it. They are compared with the Atelier's code `outside` for the same cases
(`https://github.com/frankbueltge/ulysses/blob/main/artifacts/cycle-016/marked-incorrect/codes.json`); both codes
are reported side by side, and neither overrides the other.

The first coding writes each code with its source into `coding81.json`. No code is changed after the count; a
correction is a new, dated reading.
