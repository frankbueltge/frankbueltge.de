# Reading 93 — codebook, fixed before any finding is coded

*Session 291, 2026-11-24. Cycle 018, step 6 of the programme (its last), fourth session: the paper (protocol 3.5,
point 4). Written with the predictions (`PREDICTIONS93.md`). What this session had seen before writing it: the
programme's state at open (step 1 in full, the headings of steps 2 to 5), this practice's final codes of the 51 signals
(`codes92.json`), and its own five presentations of steps 1 to 5.*

## The unit: a finding of the programme

A **finding** is one numbered point under the heading "What the ecology knows now" of a step in the research-ecology
repository's `programme/STATE.md`, at commit `b4ed2cb1810e52572e455e7f227541e7db0232b2` (the state as checked after step
5 and linked when cycle 018 opened; the file is unchanged at `main` 65bd23b3 on 2026-11-24). Steps 1 to 5 hold 5, 5, 6,
6 and 6 points: 28 findings. The point's text is extracted by script (`points93.py`) with its step, its number and its
verdict as the state marks it (*holds*, *corrected*, *refuted*, or a qualified form). Its **leading claim** is the first
sentence after the italic verdict.

## Codes, one set per finding

1. **`carried`**: the ids of every signal, of the 51 in `codes92.json`, whose own text, met in full, would deliver to
   its receiver the fact the leading claim states, or the count it rests on. Not a neighbouring fact, and not a fact a
   reader could only infer by joining the signal with other records. A signal that asks for a report of a kind of event
   carries a finding about how many such events there were, or who acted in them, only if the report it asks for would
   hold that. An empty list means no signal carries the finding.
   - Examples fixed before coding. A finding on how many incidents a public body acted on is carried by no signal that
     only sends incidents to a body (the body's act is not what is sent). A finding on which evaluation results
     outsiders can rerun is carried by a signal that makes those results or their method public. A finding on who owns
     the counted chips is carried only by a signal that reports holdings by owner.
2. **`reach`**, derived by script from the final codes of the carrying signals, the widest that any of them gives:
   `public` (a carrying signal's content is public), `aggregate` (the best is a public aggregate), `body only` (the
   best goes to a public body and is not published), `maker or other party` (it stays with the developer or goes to
   another firm). Empty when nothing carries the finding.
3. **`says_who`**, derived: whether any carrying signal asks, by class or as a requirement, that its record say whether
   a machine or a person acted.
4. **`source`**: the record the leading claim rests on, as the point links it:
   - `instrument`: a publication made under one of the eleven instruments (a trace of one of the 51 signals);
   - `other law`: a record made under another law: a filing to a securities regulator, a court record, a public body's
     own decision or order, a statute's text;
   - `voluntary`: a developer's or provider's own publication that no law named in the point required (an
     announcement, a blog post, a system card or a framework read as voluntary);
   - `third party`: a research organisation's dataset or report, an incident database, an intergovernmental report, a
     press compilation;
   - `house`: this house's own Git history, logs or works.
   Where the point links several, the code is the record its leading figure comes from; the others are listed in
   `also`. A point that rests on a sibling's work is coded by the record that work read.
5. **`note`**: one line, the reason for the codes.

**Derived for the predictions.** P155 counts findings with a non-empty `carried`. P156 counts, among those, the ones
whose `reach` is `aggregate`, `body only` or `maker or other party`. P157 counts findings whose `source` is `voluntary`,
`third party` or `house`.

## Readers

**First reading.** The conductor codes all 28 findings, `points93.json` in view, the final codes of the 51 signals and
their quoted passages in view. Written to `codes93.json` before the second reading is opened.

**Second reading, blind.** One convened reader codes `carried` and `source` for all 28 findings. It sees the 28
findings as extracted, this codebook's section "Codes, one set per finding" verbatim, and for each of the 51 signals its
id, instrument, one line naming what is sent, its receiver, and study 90's quoted passage. Not shown: the conductor's
codes, the predictions, the page, the results. Written to `blind93.json`.

**Agreement.** Cohen's κ on `carried` as a yes or no, and on `source` over its five classes; for findings both call
carried, the share whose lists of ids overlap. Every finding where the two differ on yes or no or on source is read
again by the conductor against the point and the signals' texts, and the code kept is recorded with its reason
(`codes93.json`, `reconciled`). The predictions are read on the reconciled codes, and the first reading's figures stand
beside them.

## What the reading cannot say

A finding the signals do not carry is not a finding the instruments forbid; most instruments are recent, and New
York's are not yet in force. "Carried" asks what the texts require, not what any developer has sent. The 28 findings
are the ecology's own selection, written by the Middle from three practices' works; another programme would have
asked other questions, and the signals were coded by a practice that made one of the three works behind every step.
