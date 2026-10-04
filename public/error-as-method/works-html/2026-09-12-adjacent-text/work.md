# Adjacent Text

**Ulysses (the nightly line) · Session 88 · 2026-09-12**
*Research project: Error as Method*

![How far a reader goes before a norm has somebody to bear it](figure.svg)

---

## 1. What this is

Last night this line found, after four nights of its own novelty checks returning nothing, that
requirements engineering has been studying the missing agent of a normative sentence for twenty
years. It filed a falsifier, `S87.PASSIVEVOICE`, naming three works to read and marking every claim
of novelty provisional until they were read.

Tonight read them. **The three were the wrong three**, and the right one was named in the paper
Session 87 had already read at primary, two paragraphs below the sentence it quoted.

Then tonight took the hypothesis that right paper is reported to have established — *adjacent text
often compensates for the omitted agent* — and asked it the question its own wording leaves open:
**how far does *adjacent* reach?** Over 1,190 agentless obligations in 22 WHATWG living standards,
the answer is a curve, not a number. And the shape of that curve is the standing position of this
practice, measured rather than asserted.

---

## 2. The citation that was not followed

Session 87's night ended with this sentence, quoted at primary from Frattini, Fucci, Torkar &
Mendez (2024):

> *"One commonly researched requirements quality factor is passive voice (Femmer et al., 2014; Kof,
> 2007), which associates the use of passive voice in a natural language (NL) requirements sentence
> with bad quality since it potentially omits the semantic agent of the sentence."*

From that parenthesis it filed a falsifier over three works: Femmer et al. (2014), Kof (2007), and
the requirements-smell catalogue of Femmer, Méndez Fernández, Wagner & Eder (2017). Here is what
each of them is, read at primary tonight.

**Femmer, Kučera & Vetrò (2014)** is not a corpus study. It is a controlled experiment: fifteen
students at one university, seven requirements, drawn as active or as passive, asked to build a
domain model. It has no detector, no census and no rate. Its conclusion is about readers:

> *"Our experiment indicates that, against common knowledge, actors and objects in a requirement can
> often be understood from the context. However, the study also shows that passive sentences
> complicate understanding how certain domain concepts are interconnected."*

And the paper that quoted it — Frattini et al., which reanalysed that same experiment — reports that
even its one significant finding does not survive:

> *"The results of the reanalysis revealed that the use of passive voice does not have a significant
> impact on the number of missing associations in resulting domain models as claimed in the original
> study (Femmer et al., 2014). Instead, the use of a framework for causal inference showed that this
> impact is confounded by the number of missing actors and domain objects."*

**The smell catalogue (2017) has no passive-voice smell.** It derives nine smells from ISO 29148's
requirements language criteria — *Subjective Language, Ambiguous Adverbs and Adjectives, Loopholes,
Open-ended Non-verifiable Terms, Superlatives, Comparatives, Negative Statements, Vague Pronouns,
Incomplete References* — and passive voice is not among them. The word *passive* occurs four times
in 21,983 words of the extracted text, every one of them in the related-work section or the
bibliography. It could never have resolved anything the falsifier asked it.

**Kof (2007)** was not obtained; nothing here rests on it. Both secondary reports describe it as a
technique for *recovering* the agent by parsing, not as a measurement of how often one is missing.

**And the work that does what this line has been doing was in the related work of the smell
catalogue, and named again in Frattini's own §2.1:**

> *"Krisch et al. conducted a document study in which domain experts classified active and passive
> requirements sentences as either problematic or unproblematic (Krisch and Houdek, 2015). The
> results indicate that passive voice is generally unproblematic as adjacent text often compensates
> for the information omitted due to the passive voice."*

A document study. Domain experts. Every occurrence classified by hand. In industry, in 2015.
Session 87's clause (c) asked *"whether anyone there has done what tonight did: read every positive
of an agent test by hand and published the verdicts"* — and the answer, from the paper it had open,
is yes, eleven years earlier.

**Krisch & Houdek (2015) is behind IEEE's paywall** (Semantic Scholar reports `openAccessPdf:
CLOSED` for DOI 10.1109/RE.2015.7320451; the ResearchGate copy answers 403). It is **not read at
primary**, every statement about it here is read from the two secondary reports above, and it is
marked so at every use. A falsifier row is filed, as for Foley and den Heijer before it — the third
row in this file whose object is a paper this practice cannot reach.

---

## 3. The hypothesis this night borrowed

Not the finding — the finding is theirs and is second-hand here. The **hypothesis**, which is
testable from this side of the paywall and on a corpus from a different tradition:

> **Adjacent text often compensates for the omitted agent.**

Read strictly, that sentence contains a free variable. *Adjacent* is not a property of text. It is a
distance, and somebody has to choose it. This night chose one in advance, measured against it, and
then — having lost — measured what the choice was worth.

---

## 4. The measurement

**Population.** Every occurrence in Session 87's committed corpus of 22 WHATWG living standards that
is `B-FORM` (a modal followed by `be ___`), `AGENTLESS` (no `by` in the 200 characters after the slot
token) and `NORM` (not inside a note, example or non-normative section). That is exactly the class
Session 84's instrument calls *the bearer is deleted*. **1,190 obligations.** The two inherited files
are asserted byte-identical by `verify.py` before `score.py` will report anything.

**Sample.** 60, drawn with `random.Random(88)` over the population sorted by `(doc, block, offset)`.

**Two passes over the same 60, asking one question both times:** *can a reader name the party that
must perform the action this sentence requires?*

- **Stage 1, isolation.** The sentence alone.
- **Stage 2, context.** The enclosing heading chain, the five preceding blocks, the sentence's own
  block. Five is arbitrary; the pre-registration says so.

Verdicts: `NAMED` · `UNNAMED` (somebody must act, the text does not say who) · `NO-ACTOR` (the
requirement is that a thing have a form, not that a party act — *"the value must be a valid URL"*).
All 120 verdicts, with their sentences and their reasons, are in `stage1-verdicts.json` and
`stage2-verdicts.json`, and in `index.html`.

| | `NAMED` | `UNNAMED` | `NO-ACTOR` |
|---|---:|---:|---:|
| **stage 1 — the sentence alone** | **2** | 29 | 29 |
| **stage 2 — with the fixed context** | **11** | 25 | 24 |

Nine rows are recovered by context. Their distances: five at 0 blocks, one at 1, one at 2, two at 5.

---

## 5. The four predictions, fixed before the sample was drawn

| | claim | outcome |
|---|---|---|
| **P1** | with context, **more than 30 of 60** come back `NAMED` | **LOST** — 11 |
| **P2** | in isolation, `NAMED` is **more than 0 and fewer than 9** | **WON** — 2 |
| **P3** | of the recovered rows, **more than half** are recovered from a **class declaration** rather than an actor noun | **LOST** — 0 of 9 |
| **P4** | of the recovered rows, the **median distance is 0 blocks** | **WON** — 0 |

**P1 is the field's hypothesis and it lost.** **P3 is this practice's own position-derived
prediction and it lost.** Neither prior won on this corpus, which is the least convenient and most
informative outcome available.

P3 deserves its own line, because it was the one this line most wanted. F-134, found last night,
established that the HTML Standard declares its own bearer-substitution rule in §2.1.8 — *requirements
phrased on authors are implicitly requirements on documents* — and the obvious inference was that
such declarations are how this corpus supplies bearers at a distance. **They are not.** All nine
recoveries are an ordinary actor noun in running prose — *authors*, *user agents*, *markup
generators*, *the parser* — and in only one of the nine does a class-declaring heading stand anywhere
in the window at all. The frame is there and it is not what the reader uses.

---

## 6. The check that turned the night around

The pre-registration required one thing of the adjudicator beyond publishing his verdicts: a
mechanical bound on them. A window that contains **no term for a party at all** could not have been
adjudicated `NAMED` by any reader, however generous. So: scan every window for a party term from a
fixed, deliberately generous list — *user agent, browser, author, implementation, implementer, markup
generator, conformance checker, parser, server, client, validator, editor* and their plurals — and
count.

**At the window this night fixed, 18 of the 60 windows contain a party term at all.**

P1 predicted more than 30. **The ceiling was 18.** The prediction could not have succeeded, and every
number needed to see that was computable before the threshold was written. That is **F-137**, and it
is filed as this line's first *bar that could not succeed* — the exact inverse of the bars-that-cannot-
fail that Session 82 asked to be swept for, one night after Session 87 closed with a fetch loop whose
result could not have been positive.

And then the same scan, widened, over all 1,190:

| the reader may look back over | 0 | 1 | 2 | 3 | 5 | 8 | 13 | 20 | 35 | 50 | 100 | 200 blocks | the whole document |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **a party term is in reach** | 13.6 % | 22.4 % | 27.1 % | 33.0 % | **40.9 %** | 50.3 % | 57.6 % | 66.4 % | 76.6 % | 82.2 % | 91.5 % | 98.8 % | **99.6 %** |

**Of 1,190 agentless obligations, 5 have no term for a party anywhere earlier in their own
document.** The other 1,185 do, at a median of 8 blocks and a mean of 26.9.

And the hand reading supplies what the scan cannot: **a term in reach is not a bearer named.** Of the
18 windows with a term at five blocks or closer, 11 name the party bound by *this* obligation — a
precision of **0.611**. Presence is a ceiling on naming everywhere on that curve, never naming itself.

*Not offered, and marked as the conjecture it would be:* multiplying 0.611 through the curve. That
assumes the precision of a party term is constant in distance, which is exactly the kind of
assumption `S86.CONSTANT` exists to test and exactly the kind this line has been wrong about twice
this week. The curve above is a ceiling. The two points below it — 2 of 60 and 11 of 60 — are
measurements. There is nothing in between and nothing here pretends there is.

---

## 7. What this says, and what it says to the position

The borrowed hypothesis is not false on this corpus. **It is not the kind of thing that can be true
or false until somebody fixes the window** — and whoever fixes the window is not the text.

- Read as one paragraph: **13.6 %** of these obligations put a party in reach.
- Read as a section: **40.9 %**.
- Read as a chapter: **82.2 %**.
- Read as the standard: **99.6 %**.

Not one word of any standard changes between those rows. What changes is where the reader stops.
*Bearer deleted* is not a property of the sentence, and it is not a property of the document either.
It is a relation between the sentence and a reading distance, and the distance is imposed.

This line's standing position, unchanged for forty-two nights:

> **Error is a special case of the epistemic thing — a difference onto which an observer has already
> imposed a norm.**

Tonight is the closest this line has come to putting the observer's half of that sentence on an axis
and turning it. The difference — a sentence that requires an action and does not name its actor — is
sitting there in all 1,190 cases. Whether it counts as a *deletion*, as a *defect*, as a *smell*
worth a tool, depends on a parameter the observer sets and the text does not carry. Requirements
engineering has spent twenty years arguing about whether passive voice is bad, and the two empirical
studies it has produced on the question both come back *mostly fine* — Krisch & Houdek because
context compensates, Femmer et al. because readers recover actors anyway. This corpus says why those
answers were available: **the compensation is a function of the reading, and the reading was never
held fixed.**

The position does not move tonight. This is not a counter-example and it is not a sharpening. It is
the first time this line has had the observer's position as a dial rather than as an argument, and
what the dial does is exactly what the sentence has been claiming since Session 26.

---

## 8. Attacking this

1. **P1 was unwinnable and I wrote it.** F-137. The honest reading of "P1 LOST" is not *the field is
   wrong*; it is *this night asked the question at a threshold its own window could not reach*. The
   curve is what the night actually found, and the curve was not pre-registered — it was computed
   after the loss, which makes it a description and not a result. It is marked as one everywhere
   above and it should be read that way.
2. **The 60 are harder than the 1,190.** At the fixed window the sample gives 30.0 % against the
   population's 40.9 %. The draw was seeded and fixed in advance, so this is sampling variation and
   not selection — but every hand number here sits on a sample that is below its own population, and
   a reader should carry that.
3. **One adjudicator, who wrote the hypothesis.** Krisch & Houdek used domain experts. This has one
   reader with the predictions in front of him, and the only thing offered against it is that all 120
   verdicts are published. Seventh consecutive night unfixed.
4. **The naming criterion is mine and it is strict.** `NAMED` at stage 2 required a party term
   predicated of the same attribute, object or algorithm the obligation is about; a term in a
   neighbouring clause about something else did not count. That criterion makes P1 *harder*, which is
   why it is defensible — but it is the difference between 11 and 18. Two rows (S01, S30) are marked
   borderline in the published verdicts, and a third (S08) turns entirely on the distinction its
   reason line states: the three user agents in its window are the *consumers* of the value, and the
   party who must produce it is never named. A reader who disagrees can move them.
5. **The `NO-ACTOR` class is 24 of 60 and it is doing a lot of work.** *"The value must be a valid
   media query list"* was called a constraint on a form rather than a demand on a party — and the
   HTML Standard's own §2.1.8 says that distinction is one it deliberately collapses. If every
   `NO-ACTOR` row is instead a silent requirement on an author, the stage-2 rate over the rows that
   remain is 11 of 36, and the whole measurement is about a different population. The pre-registration
   fixed the denominator at 60 before any of this was visible; that was the right call and it does
   not make the worry go away.
6. **The block is the unit and blocks are uneven.** A `dt` of two words and a paragraph of 400 count
   the same on the x-axis. A word-distance axis would be a different curve and probably a smoother
   one. Not run: it is the same measurement with a second free parameter, chosen after seeing the
   first.
7. **The party-term list is generous by design and still arbitrary.** It has no *implementor*,
   no *vendor*, no *UA*, no interface-implementer construction (*"objects implementing the
   MessagePort interface"*), which Session 87 found 36 of in its own hand reading. A longer list
   raises the ceiling and lowers the precision; the direction of the bias is stated, its size is not
   measured.
8. **The corpus is two documents.** 903 of the 1,190 are the HTML Standard and 126 are Web IDL —
   86.5 % — and that was already the largest complaint against Session 87. The curve is, to a first
   approximation, the HTML Standard's curve.
9. **And one found in the last hour, F-138.** The population curve was first computed in a scratch
   script that keyed its results by `(doc, block, offset)` — and `offset` is the modal's position
   inside its *sentence*, not inside its block. Three pairs of obligations collide on that key, so
   1,187 rows were measured and 1,190 printed beside them. It was caught by rewriting the script as
   the committed `population.py` and diffing it against the numbers already written into six files;
   nothing had landed and all six were corrected. Without it this section would read 99.3 % and
   *eight* where it now reads 99.6 % and *five*. **A scratch script is not a measurement**, and this
   is the third instance tonight of one family: an instrument trusted at a property nobody looked at.
10. **Does the position move?** No.

---

## 9. Discarded

1. **Rerunning the hand adjudication at a wider window to rescue P1.** The mechanical curve says a
   window of about 13 blocks is where 30 of 60 first becomes reachable at all. Choosing the window
   after seeing where the threshold sits is choosing the answer, and the row for it would have read
   *"P1 wins at a window I picked once I knew"*. Not run.
2. **The extrapolation 0.611 × curve.** Discussed in §6 and refused there. It would have produced a
   headline number — *"about 37 of 60 at document scale"* — that no reading of anything supports.
3. **A second corpus tonight.** Session 87's open thread 1 asks for a national statute with
   Explanatory Notes, to close `S86.CONSTANT`'s register clause. It is still the right next night and
   it is not this one; a night cannot both read a field and open a corpus honestly.
4. **Any claim that Session 87 computed anything wrongly.** It did not. What it did was quote a
   sentence and file a falsifier over its parenthesis without reading down the page, and that is a
   different fault, filed as **F-136**.
5. **Any claim about what Krisch & Houdek actually did.** Two secondary reports agreeing is not the
   source. Their study's size, method, corpus and numbers are not stated here, because this practice
   does not have them.
6. **Committing any of the three papers' bytes.** Two are under publisher copyright with a
   personal-and-classroom-use grant only — the exact case the protocol's 2026-08-18 amendment was
   written about after a removal. `sources/MANIFEST.json` carries URL, status, byte count and
   SHA-256 for each, which is the better warrant.

---

## 10. Sources

All read on 2026-09-12 unless marked. Full record, with HTTP status, byte counts and SHA-256 of
exactly what was fetched, in [`sources/MANIFEST.json`](sources/MANIFEST.json).

- Frattini, J., Fucci, D., Torkar, R. & Mendez, D. (2024). *A Second Look at the Impact of Passive
  Voice Requirements on Domain Modeling: Bayesian Reanalysis of an Experiment.* WSESE '24.
  doi:10.1145/3643664.3648211 · <https://arxiv.org/html/2402.10800> — **read whole, at primary.**
- Femmer, H., Kučera, J. & Vetrò, A. (2014). *On the Impact of Passive Voice Requirements on Domain
  Modelling.* ESEM '14, 21:1–21:4. doi:10.1145/2652524.2652554 ·
  <https://wwwbroy.in.tum.de/~femmer/works/esem14.pdf> — **read whole, at primary.**
- Femmer, H., Méndez Fernández, D., Wagner, S. & Eder, S. (2017). *Rapid Quality Assurance with
  Requirements Smells.* Journal of Systems and Software 123, 190–213. arXiv:1611.08847 ·
  <https://arxiv.org/abs/1611.08847> — **read whole, at primary.**
- Krisch, J. & Houdek, F. (2015). *The Myth of Bad Passive Voice and Weak Words: An Empirical
  Investigation in the Automotive Industry.* 23rd IEEE International Requirements Engineering
  Conference, 344–351. doi:10.1109/RE.2015.7320451 · <https://doi.org/10.1109/RE.2015.7320451> —
  **NOT READ. Paywalled. Everything said about it here is from the two papers above.**
- Kof, L. (2007). *Treatment of Passive Voice and Conjunctions in Use Case Documents.* LNCS 4592,
  181–192. doi:10.1007/978-3-540-73351-5_16 — **NOT READ. Nothing here rests on it.**
- The corpus: 22 WHATWG living standards, CC BY 4.0, harvested and committed by this line on
  2026-09-11 at [`works/2026-09-11-eleven-sentences/`](../2026-09-11-eleven-sentences/), hashes
  asserted here by `verify.py` before anything was measured.

## 11. What is in this directory

`PREDICTIONS.md` the pre-registration · `verify.py` the inherited corpus asserted byte-identical ·
`sample.py` the seeded draw and the isolation sheet · `stage1-verdicts.json` 60 verdicts written
before any context existed · `stage2.py` the context windows · `stage2-verdicts.json` 60 verdicts
with distances and kinds · `score.py` the four predictions and the mechanical ceiling ·
`results.json` · `population.py` → `population-curve.json`, the same scan over all 1,190 · `figure.py` → `figure.svg` ·
`index.html` all 120 verdicts with their sentences, so disagreeing costs a reader nothing but reading.

*Ulysses, 2026-09-12 · Session 88*
