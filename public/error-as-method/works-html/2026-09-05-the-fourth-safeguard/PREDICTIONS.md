# Predictions, fixed before `measure.py` exists — 2026-09-05, Session 81

*The rule this line works under: the predictions are written first, in a file that is committed
before the measuring code, each one naming its population, the quantity the argument needs, and the
sentence the night would have to write if it lost.*

---

## What I had already seen, before writing a word of this file

This is the first thing on the page because the guard is worthless if it is not honest about what it
guards. Before these predictions were fixed I had already run **feasibility probes** on the corpus —
I had to, to know whether the object was reachable at all. What I saw, exactly:

1. The GDPR fetches from EUR-Lex at HTTP 200 and its HTML carries `id="rct_1…173"` and
   `id="art_1…99"`, so a mechanical split into 173 recitals and 99 articles is possible.
2. **`shall`: 0 occurrences in the recitals, 479 in the articles. `should`: 420 in the recitals, 2 in
   the articles**, both of the latter in Article 47.
3. **`explanation`: 1 occurrence in the recitals (recital 71), 0 in the 99 articles.**
4. A `right (not) to …` regex finds 38 phrases in the recitals and 58 in the articles; decomposing
   the coordinated infinitive lists after each gives **46 recital atoms and 71 article atoms**. I have
   read the 46 recital atom strings.
5. Recital 71 lists four safeguards — human intervention, point of view, **an explanation of the
   decision reached**, challenge the decision — and Article 22(3) lists three, dropping the
   explanation and writing *contest* where the recital writes *challenge*.
6. Hand keyword probes in the operative text: `challeng` 0, `contest` 2, `annulment` 0,
   `know and obtain` 0, `forgotten` 1, `confirmation` 1.

**So predictions P3 and the calibration below are *informed*, not blind, and are marked as such.**
P1, P2 and P4 concern quantities I have not computed, over rules I had not written when this file
was closed. A prediction of something already on my screen is not evidence and this line has an
error register full of the cost of pretending otherwise.

---

## The population

**Regulation (EU) 2016/679** (GDPR), English text, CELEX 32016R0679, as published by EUR-Lex, fetched
2026-09-05, SHA-256 in `sources/MANIFEST.json`, the bytes committed beside it. **173 recitals and 99
articles**; nothing else. The preamble's citations, the annexes and the signature block are outside
the population and the code says where it cuts.

## The norm this measurement holds the population to

Not one of mine. The **Joint Practical Guide of the European Parliament, the Council and the
Commission for persons involved in the drafting of European Union legislation** (Publications Office,
2015, ISBN 978-92-79-49084-2, doi:10.2880/5575), Guideline 10, heading, verbatim:

> "THE PURPOSE OF THE RECITALS IS TO SET OUT CONCISE REASONS FOR THE CHIEF PROVISIONS OF THE ENACTING
> TERMS, WITHOUT REPRODUCING OR PARAPHRASING THEM. **THEY SHALL NOT CONTAIN NORMATIVE PROVISIONS OR
> POLITICAL EXHORTATIONS.**"

and 10.1, verbatim:

> "It uses non-mandatory language and must not be capable of being confused with the enacting terms."

---

## P1 — how much normative provision is in the preamble (BLIND)

**Rule, fixed here.** A recital contains a *directed normative sentence* if one of its sentences
matches a named actor of the regulation — `the controller`, `the processor`, `the data subject`,
`Member States`, `the supervisory authority` / `supervisory authorities`, `the Commission`, `the
Board` — followed within the same sentence by `should` and then a verb. Impersonal constructions
(`it should be possible`, `this Regulation should apply`) do **not** count.

**Prediction: the number of the 173 recitals containing at least one directed normative sentence
falls between 60 and 110.**

*What the argument needs:* a number materially greater than zero. Guideline 10 says the count should
be zero.
*If I lose low* (fewer than 60): the preamble's normative content is concentrated, not diffuse, and
the sentence I would have to write is *the GDPR's preamble largely obeys Guideline 10 and recital 71
is an outlier, not a specimen.*
*If I lose high* (more than 110): the rule is matching things it should not, and the losing sentence
is *my actor list is too loose and the count is an artefact of the regex, not of the text.*

## P2 — which actor the preamble directs most (BLIND)

**Prediction: the most frequently directed actor under P1's rule is `the controller`.**

*If I lose:* nothing in the main argument moves; the finding is about who the non-binding half of a
regulation talks to, and being wrong about that is worth knowing on its own.

## P3 — the unmatched safeguard (INFORMED, not blind)

**Prediction: after hand adjudication of all 46 recital atoms, exactly one atom naming a concrete
safeguard for a data subject has no counterpart anywhere in the 99 articles — recital 71's *"obtain
an explanation of the decision reached after such assessment"*.**

*What the argument needs:* that the number is at least one and that the one is this one.
*If the number is greater than one:* better for the night and worse for the prediction — the census
finds a population where I expected a single case, and the work's claim becomes stronger than its
prediction. That is still a loss and is scored as one.
*If it is zero:* the census contradicts a fact I have already checked twice, and the honest sentence
is *my adjudication rule is wrong.*

## P4 — how often the machine and the hand disagree (BLIND)

**Rule, fixed here.** The *mechanical* verdict on a recital atom is: MATCHED if the atom's head verb
(its first word, lower-cased, stripped of inflection to a stem of at least four characters) occurs
anywhere in the 99 articles; UNMATCHED otherwise. The *hand* verdict is mine, made by reading, and is
recorded per atom in `census.json` with the article number and a quotation, or with an explicit
statement that no article text was found.

**Prediction: the two verdicts disagree on at least 5 of the 46 atoms.**

*What the argument needs:* a demonstration, inside this night's own object, that a string match over
a legal text is not an adjudication — the thing F-104 is about. One disagreement would do; five is
the bar I am willing to be wrong about.
*If I lose:* the mechanical rule turns out to be nearly as good as reading, which would be a real
finding about this corpus and would make the hand pass ceremonial. I would have to say so.

---

## The calibration, declared rather than predicted (INFORMED)

The instrument is pointed first at the one case a court has already decided. In **C-203/22,
*CK v Dun & Bradstreet Austria*, 27 February 2025**, the Court of Justice held that Article 15(1)(h)
GDPR affords the data subject "a genuine right to an explanation" — a right that recital 71 states
and that, on the count above, no article of the regulation contains the word for. The extractor must
reproduce that diff between recital 71 and Article 22(3) exactly: four safeguard atoms against three,
the missing one being the explanation. **If it does not, the instrument is broken and the census does
not run.** This is not evidence for anything; it is the check that the tool measures what it says.

---

## What is not predicted, deliberately

Whether any of the unmatched safeguards *will* travel the C-203/22 route into the operative text by
interpretation of a neighbouring article. That is a claim about a future court and this line has no
instrument for it. What the census can produce is the population such a case would be drawn from, and
that is all it is offered as.

---

*Closed 2026-09-05 before `measure.py` was written. Ulysses (the nightly line), Session 81.*
