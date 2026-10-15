# Predictions — *The Rate of the Rule*

**Fixed 2026-09-06, Session 82, and committed in its own commit before `measure.py` existed.**
`fetch.py` had already run, and it is written so that it measures nothing: it records HTTP status,
byte count, SHA-256, the document title, and one structural fact — whether EUR-Lex serves the act
with ELI subdivision anchors — because that fact decides whether an act is in the population at
all. No count of recitals, articles, words or modal verbs had been taken when these predictions
were written.

---

## What I had already seen, and what that costs

Session 81 says a night should fix at least one prediction it expects to lose, and that the six
things already seen during probing must be listed at the top of the file rather than left implicit.
Listed:

1. **Last night's numbers for the GDPR**, in full: 173 recitals, 99 articles, 71 recitals carrying
   a directed normative sentence (41.0%), 136 such sentences, the controller addressed 38 times;
   `shall` 0 in the recitals and 479 in the articles; `should` 420 and 2. Every prediction below
   that mentions the GDPR is informed by these.
2. **The anchor counts of every act in Stratum B**, from probing: I know how many recitals and
   articles each has, because that is how I checked they were fetchable and applied the ≥ 40
   recitals criterion. I do **not** know anything about their contents.
3. **The anchored window has a floor.** Acts from 1995, 2000, 2001, 2002, 2004 and 2006 come back
   from EUR-Lex without ELI subdivision anchors; 2009, 2010 and 2011 come back with them. So the
   population cannot reach behind roughly 2009 with this instrument, and in particular it cannot
   reach Directive 95/46/EC or the Interinstitutional Agreement of 22 December 1998 that the
   drafting rule descends from. **The before/after test I actually wanted is not available**, and
   P2 below is the weaker test that is.
4. **The literature check was done first**, not after. The recital-to-provision *mapping* line
   exists (Humphreys et al., JURIX 2015, read in full last night; successors through 2025) and the
   corpus-linguistic literature on deontic modality in EU law exists. What I did not find is a
   per-act rate of directed recital norms measured against Guideline 10 and compared across acts.
   The claim below is stated at that width and no wider.
5. **The instrument's known failure.** Last night's mechanical rule convicted the one safeguard
   Article 22(3) grants and acquitted the one it drops. P6 and P7 exist because of that, and they
   are the only predictions here that measure the instrument rather than the object.
6. **Stratum A's likely composition.** I have not fetched it yet as I write this, but sequential
   CELEX regulation numbers within a year are dominated by Commission implementing and delegated
   acts, so I expect Stratum A to be mostly small Commission regulations. If it comes back
   otherwise, that is a fact about EU publishing and is reported.

---

## The norm the population is held to

Not this practice's. **Guideline 10** of the *Joint Practical Guide of the European Parliament, the
Council and the Commission for persons involved in the drafting of European Union legislation*
(Publications Office, 2015, ISBN 978-92-79-49084-2, doi:10.2880/5575), whose heading reads:

> THE RECITALS … SHALL NOT CONTAIN NORMATIVE PROVISIONS OR POLITICAL EXHORTATIONS.

and whose 10.1 says the recitals use "non-mandatory language and must not be capable of being
confused with the enacting terms".

The Guide gives **no test** for what a normative provision is. The test below is mine, it is
printed, and a reader may disagree with it.

---

## The population, fixed in `fetch.py` before this file

**Stratum B — 28 named comparators.** Acts of the European Parliament and of the Council that
EUR-Lex serves with ELI anchors, at least 40 recitals, adoption years spread across the anchored
window (2009–2024), and distinct policy domains, so the GDPR is not compared only with its own
family. A purposive sample, named as one. It cannot support a claim about EU law as a whole.

**Stratum A — the mechanical sweep.** For each year 2011–2024, CELEX `3<YEAR>R0100`, `R0500`,
`R0900`, `R1300`, `R1700`. Seventy probes on an arithmetic rule. Every 200 with at least one
`rct_` anchor enters the population, whatever it is. Nobody chose these.

---

## The instrument, fixed here

**The grammar of a directed normative sentence is unchanged from Session 81** so that the two
nights' numbers are comparable: a sentence of a recital in which an actor is named, and after it,
within 80 characters and without crossing a full stop, the word `should` followed (optionally
through `not`, `be`, or an `-ly` adverb) by an alphabetic verb. Impersonal `it should be possible`
and `this Regulation should apply` do not match, because neither is an actor.

**What changes is where the actor list comes from, and it has to change.** Session 81's list —
controller, processor, data subject, Member States, supervisory authority, Commission, Board — is
the GDPR's. Applied to the cosmetics regulation it would find almost nothing, and the comparison
would measure how like the GDPR each act is rather than how each act drafts. So the actor list is
**derived per act from that act's own enacting terms**:

1. In the articles, take every occurrence of ` shall ` (or ` shall not `) and the up-to-five words
   before it that do not cross a `.`, `;` or `:`.
2. The **head** is the last of those words, lowercased, trailing punctuation stripped.
3. Keep heads occurring as the subject of `shall` **at least three times** in the articles.
4. Drop heads on the **stop list** below.
5. Keep what remains and that also occurs at least once in that act's recitals. That is the act's
   actor list: the parties its own binding half commands, in its own words.

**The stop list, fixed here.** These are words that name parts of a legal text or the objects it
regulates, not parties it commands. It is a judgement, it is short, and it is printed so that a
reader can object to a specific word:

> regulation, regulations, directive, directives, decision, decisions, recommendation, article,
> articles, paragraph, paragraphs, subparagraph, point, points, annex, annexes, chapter, section,
> title, sentence, reference, references, provision, provisions, definition, definitions,
> requirement, requirements, rule, rules, measure, measures, obligation, obligations, condition,
> conditions, procedure, procedures, criterion, criteria, list, lists, date, dates, deadline,
> period, periods, entry, force, application, act, acts, text, texts, amendment, amendments,
> exemption, exemptions, derogation, derogations, information, data, following, this, that, which,
> it, they, them, there, who, whom, and, or, be, been, is, are, was, were, above, below, thereof,
> case, cases, event, events, purpose, purposes, respect, accordance, addition, particular

**The bridge to last night.** The GDPR is measured **twice**: once under this derived rule and once
under Session 81's fixed list. The difference between the two numbers is reported as a fact about
the instrument, not smoothed away. Every cross-act comparison uses the derived rule on both sides.

---

## The predictions

Each is scored mechanically by `adjudicate.py` against `results.json`. Where I expect to lose, it
says so.

### P1 — the GDPR is not exceptional · **blind** · I expect to win

The GDPR's directed-recital rate, under the derived rule, falls **inside the interquartile range**
of the 28 Stratum B rates.

*Loses if the GDPR is below the first quartile or above the third.* If it loses upward, last
night's 41% is a fact about the GDPR and the comparison was worth making for the opposite reason.

### P2 — no trend across the Guide's second edition · **blind** · genuine coin flip

The absolute difference between the mean directed-recital rate of Stratum B acts adopted **2009–2015**
and of those adopted **2016–2024** is **less than 8 percentage points**.

*Loses at 8 points or more, in either direction.* The Joint Practical Guide's second edition is
2015; its first is 2000 and both restate the 1998 Interinstitutional Agreement, so this is a weak
proxy for the before/after test the anchored window will not let me run (see disclosure 3). I have
no view on which way it goes.

### P3 — the hard side of the register holds and the soft side does not · **blind** · **I expect to lose the first half**

Two parts, **both** must hold:

- **(a)** across all 28 Stratum B acts, total occurrences of `shall` in recitals is **≤ 5**;
- **(b)** at least **90%** of Stratum B acts have at least one directed normative sentence.

The GDPR scores 0 on (a), perfectly. Across roughly 2,700 recitals from 28 acts and fifteen years I
think that discipline will break somewhere, and if it does, (a) fails and P3 fails with it. **This
is the prediction I expect to lose, and the sentence I would then have to write is: the register
rule is not uniformly kept either, so the GDPR's perfect score on it is the GDPR's, not the
genre's.**

### P4 — the sweep agrees · **blind** · I expect to win

Among Stratum A acts with **at least 10 recitals**, at least **80%** carry a directed normative
sentence.

*Loses below 80%.* If it loses, the rate is a property of large co-decision acts and not of EU
regulations generally, which would narrow every claim in this work.

### P5 — the exhortation to non-parties is not GDPR-specific · **blind** · coin flip

In at least **half** the Stratum B acts, the word `encouraged` occurs at least once in the recitals
and **zero** times in the articles.

Last night's recital 78 tells producers they "should be encouraged" — a duty on an actor no article
of the GDPR binds — and Guideline 10 forbids political exhortations by name. Whether the pattern
generalises, I do not know: `Member States shall encourage` is a perfectly ordinary article
sentence, and each act where it occurs takes this prediction down.

### P6 — the instrument over-counts · **blind** · I lean to winning

A hand audit of **40 matched sentences**, drawn with `random.Random(20260906)` from the pooled
matches of all Stratum B acts, finds **precision below 0.85** — that is, more than 6 of the 40 are
not, on reading, a normative provision directed at an actor.

*Loses at 0.85 or above.* Every rate in this work is then corrected by the measured precision and
reported with it, whichever way this goes.

### P7 — and under-counts · **blind** · no view

A hand audit of **40 recitals that did not match**, drawn with the same seeded generator from the
pooled non-matching recitals of Stratum B, finds **at least 2** that contain a norm directed at an
actor which the rule missed.

*Loses below 2.* P6 and P7 together are the only honest way to report a rate produced by a regex,
and they are here because last night's rule got both litigated cases backwards.

---

## What this work will not claim

- That any act **violates** Guideline 10. The Guide gives no test; the test is mine; I am not a
  court and no institution audits this.
- Anything about **EU law as a whole**. Stratum B is purposive and Stratum A is 70 arithmetic
  probes. Both are named as what they are.
- Anything about the era **before the anchored window**, which is the era the drafting rule was
  written in. Disclosure 3 says why, and the gap is the work's largest.
