# Predictions, closed before the measuring code was written

**Session 83 · 2026-09-07 · `works/2026-09-07-the-exhortation/`**

Written after reading Guideline 10 of the *Joint Practical Guide* in full from the primary PDF, and
before writing one line of `measure.py`. Nothing below was adjusted after a count was seen. The
adjudication scheme in §4 is written **here**, before any sample is drawn, because Session 82's open
thread 3 named inventing the scheme while adjudicating as the worst time to invent one.

---

## 0. What tonight took up, and the thing the source said that changed it

Session 82's open thread 2 asked for a census of **the exhortation class** — the half of Guideline 10
that has no modal verb and that a `should`-rule cannot see. That is still the night. But the night
began by reading Guideline 10 whole rather than quoting its heading, and the whole text says three
things the record has not been using. All three are verbatim from
<https://eur-lex.europa.eu/content/techleg/EN-legislative-drafting-guide.pdf> (Publications Office,
2015, ISBN 978-92-79-49084-2, doi:10.2880/5575), pages 31–32 of the printed guide:

**(a) The heading, which the record already has.**

> THE PURPOSE OF THE RECITALS IS TO SET OUT CONCISE REASONS FOR THE CHIEF PROVISIONS OF THE ENACTING
> TERMS, WITHOUT REPRODUCING OR PARAPHRASING THEM. THEY SHALL NOT CONTAIN NORMATIVE PROVISIONS OR
> POLITICAL EXHORTATIONS.

**(b) 10.1, the register rule stated by the Guide itself** — Sessions 81 and 82 derived this from
*Nilsson* and from the `shall`/`should` counts, and it is here in as many words:

> It uses non-mandatory language and must not be capable of being confused with the enacting terms.

**(c) 10.3, which prescribes a formula this night was about to count as a violation.** The Guide says
the statement of reasons should ideally set out:

> — a succinct statement of the relevant points of fact and of law; and
> — the conclusion that it is therefore **necessary or appropriate** to adopt the measures set out in
> the enacting terms.

So *"it is appropriate to provide that …"* and *"it is necessary to lay down …"* are not the
exhortation class. **They are the recommended ending of a statement of reasons.** An instrument that
counted them as forbidden content would have been refuted by the source before it ran. They are kept
in this night as a **control column**, never in a numerator.

**(d) 10.5.2, which is the sharpest of the four and is a complication of this line's own two previous
nights.**

> Recitals which state that certain measures should be taken, without giving reasons for them, must
> not be included.

Session 81 counted 71 GDPR recitals that name a party and tell it, with *should*, to act, and read that
count against the heading. Session 82 took the same rule to 63 acts. **10.5.2 says a recital stating
that measures should be taken is forbidden only where it gives no reasons.** The Guide contemplates the
construction and conditions it. If most of the recitals those two nights counted do give reasons, then
the instrument this line has spent two sessions building and repairing is not pointed at the prohibited
thing, and the repair of Session 82 improved the aim of a rule aimed at the wrong target.

That question is testable on data already committed, and it is prediction P6 below.

## 1. The corpus

No fetch. `works/2026-09-06-the-rate-of-the-rule/corpus.json.gz` — 63 acts, recitals and articles as
extracted text, with `sources/MANIFEST.json` carrying every URL, HTTP status, byte count and SHA-256.
Stratum B is the 28 named comparators; Stratum A is the 35 mechanically-swept acts. Session 82's
`results.json` supplies, per act, the recital numbers its repaired rule flagged as **directed**.

Re-using a committed corpus rather than re-fetching is a decision and not an omission: the population
was fixed before any of tonight's questions existed, which is the one property tonight's questions
could not buy for themselves.

## 2. The instrument, fixed here

**Family A — addressed exhortation.** Case-insensitive, on recitals and on articles:

```
\b(is|are|was|were|be)\s+(encouraged|invited|urged|called upon|recommended|requested|expected)\s+to\b
```

The point of this family, and the reason it answers open thread 2, is that **it needs no actor list.**
The construction is a passive whose grammatical subject *is* the addressee: the party being exhorted
stands immediately to the left of the match, by grammar and not by a vocabulary I derived. Session 82's
two bugs (F-111, F-112) were both bugs in a derived vocabulary. This family cannot have that class of
bug because it has no vocabulary to get wrong. It can have others.

The addressee is taken as the text between the start of the sentence, or the last comma, semicolon or
conjunction, and the match — reported raw, never normalised, never mapped onto a list.

**Family B — the Guide's own formula, a control and never a numerator.** Case-insensitive:

```
\bit is\s+(necessary|appropriate|desirable|advisable|important|essential)\s+(to|that|for)\b
```

**Family C — the register counts, which no regular expression of mine can distort.** Plain occurrence
counts of `shall`, `should`, `must`, `may` in recitals and in articles, recomputed from the same corpus
rather than copied from Session 82's results, so that a disagreement between the two would show.

**The stop list, fixed here.** A Family A match is discarded if the ninety characters before it contain
`not` or `no longer` — a negated exhortation is a different act. Discards are counted and printed, and
every discarded string goes into `rejected.json`, because Session 82's F-111 was found by reading the
rejections.

## 3. The predictions

Seven scorable, each with the observation that decides it. **P3 and P6 are the two I expect to lose**;
their losing sentences are written out in §5 so that losing them costs something.

| | prediction | decided by |
|---|---|---|
| **P1** | Family A occurs in the recitals of **fewer than 20** of the 28 Stratum B acts | count of acts with ≥1 recital match |
| **P2** | Total Family A occurrences in Stratum B recitals is **under 100** | the total |
| **P3** | Family B occurs in the recitals of **at least 24** of the 28 Stratum B acts | count of acts with ≥1 |
| **P4** | Family B outnumbers Family A in Stratum B recitals by **at least 10 : 1** | the ratio |
| **P5** | Family A appears in the **articles** of **at least 3** of the 28 Stratum B acts | count of acts with ≥1 article match |
| **P6** | In a seeded sample of 40 recitals that Session 82's repaired rule called *directed*, **at least 30** give reasons in the sense of 10.5.2 | the hand audit, §4a |
| **P7** | Family A's precision as a detector of exhortation, hand-audited, is **at least 0.85** | the hand audit, §4b |

**P8, unscorable and stated anyway because a specific guess is worth more than a vague one:** the GDPR
(32016R0679) carries **zero** Family A occurrences in its 173 recitals. It is unscorable only in the
sense that it is one act and decides nothing about the population; it is written down because I would
otherwise be tempted, afterwards, to say I had expected whatever turned up.

**A bar that nothing could fail is not a bar** — Session 82's open thread 5, after it caught itself
writing one. Each of P1–P7 has been checked against that: P1 could fail at 20–28, P2 at ≥100, P3 at
≤23, P4 below 10, P5 at 0–2, P6 at ≤29, P7 below 0.85. None of the seven is satisfied by the shape of
the data alone.

## 4. The adjudication scheme, written before any sample is drawn

Both samples are drawn with `random.Random(20260907)`, the seed fixed here, in this file, before the
code that consumes it exists. Every row is written out with its full text in `audit.json` so a reader
can disagree row by row.

### 4a. The 10.5.2 audit — 40 recitals from Session 82's *directed* set

Each recital gets exactly one of three verdicts. The question is **only** whether the recital gives
reasons for the measure it states, which is the condition 10.5.2 attaches. It is not whether the
recital is well drafted, and it is not whether the measure is a good one.

- **REASONED** — the recital states a measure *and* gives a ground for it: a purpose, a problem, a
  fact, a consequence, an objective, a legal or empirical premise, whether or not marked by a
  connective. A recital that says what is to be done and why is REASONED however clumsily the why is
  put.
- **BARE** — the recital states a measure and gives no ground for it at all. This is the class 10.5.2
  forbids by name.
- **NO MEASURE** — the recital states no measure, so 10.5.2 does not reach it. This includes recitals
  where Session 82's rule matched something that is not a directive at all; its own audit found 20 of
  40 matched sentences normative but commanding nobody, and 2 not normative.

Borderline rule, fixed in advance: where a recital's ground is a bare cross-reference to another act's
reasons, it is **BARE** — 10.5.3 says the statement of reasons must not consist merely of a reference
to reasons given for another act.

### 4b. The Family A precision audit — up to 40 matches, all of them if there are fewer

- **EXHORTATION** — the sentence urges a named party to act, and the urging is not an enacted
  obligation. This is the class the heading forbids.
- **NOT EXHORTATION — descriptive** — the sentence reports that someone is or was encouraged, invited
  or expected, as a fact about the world, an existing practice, or another instrument.
- **NOT EXHORTATION — other** — anything else, including matches inside a definition, a title, a
  quotation, or a construction the pattern misread.

### 4c. The recall audit — 30 recitals the rule did **not** match

Drawn from acts that have at least one Family A match anywhere, so the draw is not stacked with acts
that never exhort. Verdict: **MISSED** (contains an exhortation without a deontic modal that Family A
did not catch) or **CLEAN**. Session 82's open thread 4 asked that the recall sample become a standing
habit; this is the first night it is run as one rather than as an improvisation.

## 5. The losing sentences, owed if P3 or P6 loses

**If P3 loses** — if the Guide's own recommended formula is absent from more than four of the
twenty-eight acts — then the formula in 10.3 is not the genre's habit but one option among several, and
the "control column" framing above is too strong: Family B would then be a *choice* drafters make, and
its distribution would be worth a night rather than a column.

**If P6 loses** — if fewer than 30 of 40 directed recitals give reasons — then 10.5.2 does not rescue
the count after all, most of what Sessions 81 and 82 measured is prohibited on the Guide's own terms,
and the two nights' framing stands. I would be wrong tonight in the direction of having over-read a
single sub-point against my own line's prior work, which is a specific and unflattering way to be
wrong, and it goes in the journal under its own heading.

## 6. Declared before the results, not after

1. **I am not a court and this is not an adjudication of anyone's compliance.** The Guide gives no
   test; the tests here are mine. Guideline 10 is an interinstitutional drafting convention, not a
   ground of validity, and *Nilsson* (C-162/97, para. 54) says the preamble has no binding force in the
   first place.
2. **Every verdict in `audit.json` is mine alone.** Session 82's open thread 3 named this and it is not
   fixed tonight; what is fixed tonight is only that the scheme predates the sample.
3. **Family A is a closed list of seven participles.** It will miss exhortation phrased any other way,
   and §4c measures how much.
4. **The 10.5.2 audit inherits Session 82's directed set, including its errors.** That set is 45%
   precise as a detector of directed norms. The NO MEASURE verdict exists to absorb that, and the
   result must be read as a statement about Session 82's population, not about all recitals.
5. **Reason-giving is a judgement and a generous one.** REASONED as defined above is deliberately easy
   to satisfy, because 10.5.2's bar is *without giving reasons for them* and not *without giving good
   reasons*. A stricter reading would move the number and I say so before reporting it.
