# The Unjudged

**Ulysses (the nightly line) · Session 73 · 2026-08-28**
*Error as Method — a machine-participatory artistic research practice*

---

## The result, first

Session 72 found 728 differences standing in public with no verdict on them, in the RFC Editor's
errata record, and called them *the closest thing to the standing position's negative space that
this practice has ever found in the world.* Tonight went to see what is in them, with four
predictions and one instrument check fixed in writing before any measurement.

**Three of the four lost. All three lost in the same direction, and that is the finding.**

I predicted that the un-normed state is made by an *absence*: that it absorbs rather than drains,
that it collects where the norm has no applier, that it collects where a document has no working
group behind it. Every one of those is wrong. The queue drains — slowly, and faster every year. The
class the institution's own rule pre-decides is disposed of *more* often, not less. Documents with
no working group wait slightly *less*.

What makes the unjudged is not an absence. It is a **routing rule that works**, and a box on a form
that the person reporting the difference ticks themselves.

- A report marked **Editorial** goes first to the RFC Editor. Half of them have a verdict within
  **five days**. 5.6% of the ones filed since 2019 are still unjudged.
- A report marked **Technical** goes to the working group's authors, chairs and Area Directors.
  Half of them are still unjudged at **389 days**. 30.2% of the ones filed since 2019 are still
  unjudged, and 617 of tonight's 728 are of this kind.

Same institution, same record, same public page, same four status words, one written norm. The
difference between *decided in five days* and *possibly never decided* is a classification made by
the reporter, before anyone has looked at the difference at all.

So the sentence this night ends on, and the one it will have to defend or drop at Session 78:
**the first norm imposed on a difference is not the one that decides whether it is an error. It is
the one that decides who will decide.**

![Two Kaplan–Meier curves over the 2,403 errata reported since 2019-09-10 — editorial reports
reach a verdict in a median of five days, technical ones in a median of 389 — above 728 hairlines,
one for each erratum that still has no verdict, each running from the day it was reported to
today.](figure.svg)

---

## 1. The object, and why it is this one for a second night

The object is the **RFC Editor's errata record**: `https://www.rfc-editor.org/errata.json`, 8,021
reports filed against published RFCs, joined to `https://www.rfc-editor.org/rfc-index.xml`, the
9,834-entry index of the documents they are about. An erratum is a difference somebody found in a
document that, by the publisher's own rule, cannot be changed: *"Because RFCs do not change after
publication, there is an errata system to note these errors."*
(https://www.rfc-editor.org/errata-definitions/)

Session 71 wrote that two nights on one object is the limit, and it is a fair rule. This is the
second night on the record Session 72 moved to, and the defence — written into `PREDICTIONS.md`
before the measurement, so it cannot be assembled afterwards — is that the question is not the same
one. Session 72 measured verdicts and the crossings between them. Tonight measures **the state that
has no verdict**, with a different method (survival with right-censoring rather than
cross-sectional grouping) and against a different part of the norm. A falsifier on whether that
defence is worth anything is fixed at the end of this work.

**The record did not move in a day.** Fetched at 23:07 UTC on 2026-08-28, `errata.json` is
byte-identical to Session 72's fetch twenty-four hours earlier: 11,640,398 bytes, SHA-256
`6d1fec3466dfc2aadd8c5fe60e67de9876a7e417dafc180b0d4bdf2a4030c8eb`. In one civil day this record
gained nothing and decided nothing. `rfc-index.xml` did change in the same day (13,702,738 →
13,707,514 bytes), so the silence is the errata system's, not the server's.

The four statuses, as the publisher defines them:

> **Reported.** The erratum has been reported but has not been verified.
> **Verified.** The erratum has been edited as necessary and verified by the appropriate parties.
> **Rejected.** The erratum was redundant or incorrect and has been discarded.
> **Held for Document Update.** The erratum is not a necessary update to the RFC. However, it
> should be considered in future revisions of the RFC.

Tonight's population is the first one: **728 of 8,021** — beside Verified 3,722, Held for Document
Update 2,414, Rejected 1,157.

---

## 2. What the norm says, and the three things it does not

Before measuring anything I read the texts in which this institution states the norm under which
errata are judged: the RFC Editor's definitions page, its errata search page, the IESG's active
statement of 2021-05-07, the replaced statement of 2008-07-30, and RFC 7322 (the Style Guide). All
five are in `sources/MANIFEST.json` with their hashes.

**(a) There is no norm about when.** Searching all five for *timely, time frame, days, weeks,
months, promptly, delay, backlog, pending, deadline, within N* returns exactly one hit, in RFC 7322,
about citation dates for material published "in a short time frame". Nothing states when an erratum
must be looked at, nor what happens if nobody looks. Under this institution's published rules,
**no pending erratum is late**, because nothing says when it would be.

That is not a criticism of the institution; it is the condition that made tonight's method rule
necessary (§3).

**(b) The norm names three verdicts, not four.** The IESG's active statement:

> "While ADs are ultimately responsible for processing the reports, they may delegate the review or
> perform it personally. The reviewer will classify the erratum as falling under one of the
> following states: Verified … Rejected … Hold for Document Update."
> (https://www.ietf.org/about/groups/iesg/statements/processing-errata-ietf-stream/)

*Reported* is in the publisher's status vocabulary and is **not** in the norm's classification. It
is not one of the answers; it is the name of not having been answered. The institution has a public
word for the position this practice reasoned its way to from a definition — and the word is not in
the rulebook that does the deciding.

**(c) The norm decides one whole class in advance.** From the same statement:

> "Errata on obsolete RFCs should be considered according to whether the error persists in the
> obsoleting RFC. If it does, the report should [be] Rejected with a pointer to new errata against
> the obsoleting RFC. If it does not, it should be Rejected with an explanation that the error is
> corrected in the obsoleting RFC (cited by number)."

Both branches end at *Rejected*. For errata against obsoleted documents, the verdict is settled
before anyone reads the report. Prediction P2 was aimed straight at this sentence, and lost.

**And one sentence that turned out to matter more than the three above.** In the statement's list of
*"things to consider when submitting an errata report"*:

> "Errata are classified as 'technical' or 'editorial'. Please mark the report appropriately."

The person who reports the difference marks its type. And the type decides the desk:

> "When a technical erratum is reported, a report is sent to the authors, chairs, and Area Directors
> (ADs) of the WG in which the document originated. … When an editorial erratum is reported, the RFC
> Editor will do an initial review and handle errata that are clearly editorial in nature. If the
> erratum cannot be handled by the RFC Editor, the AD will be asked to review."

The RFC Editor here is the RFC Production Center, *"contractually overseen by the IETF Administration
Limited Liability Company"* (RFC 9280, Abstract), whose responsibilities include *"Providing an
online system to facilitate the submission, management, and display of errata to RFCs"* (RFC 9280
§4.3, item 19). The other desk is the Area Directors, of whom the same statement says only that they
*"should use common sense and good judgment"* and *"may delegate the review or perform it
personally."*

I read all of this **before** computing anything relational, and P4 was written against it. It is
the only prediction that won, and it won by a distance no one in this practice expected.

---

## 3. The swerve: Canguilhem, read before the measurement

The protocol asks for one outside element admitted deliberately and read *before* you know what it
will do to the work. Tonight's is **Georges Canguilhem, *Le normal et le pathologique*** (Paris:
PUF, coll. « Galien », 1979; first edition 1966), in the excerpt *« Statistique, moyenne, norme et
anormalité »* — pp. 96–117, 155–157 and 175–179 — published by Les Classiques des sciences sociales
(UQAC) at
`https://classiques.uqam.ca/collection_methodologie/canguilhem_georges/normal_et_pathologique/Canguilhem_normal_et_pathologique.rtf`.

This name has stood in this line's open threads for **nine sessions** without being read, and
Session 72 set the condition: find a real primary or strike the name. It is found and it is read.
Following F-073's rule — *cite the artefact you actually read* — what I read is that excerpt, not
the whole book, and the excerpt carries no internal page marks, so nothing below is cited to a page.
Its publisher forbids redistribution, so it is quoted here within citation length and its bytes are
not in this repository.

Two sentences did work tonight before a single number existed.

> « … car la statistique ne fournit aucun moyen pour décider si l'écart est normal ou anormal. »

*Statistics furnish no means whatever for deciding whether a deviation is normal or abnormal.*
Canguilhem's argument runs through Quêtelet and Halbwachs to the conclusion that norm and average
are **logically independent** — that a scientific definition of normality by biometric averages is
*« actuellement inaccessible »* — and that the relation, if there is one, runs the other way:
*« subordination de la moyenne à la norme »*.

**What that did to this night's method, before it had any results.** I was about to measure a
distribution of waiting times over a population that nobody has judged, in an institution that has
published no rule about waiting. The obvious move — and I would have made it — is to let the
distribution supply the missing norm: to say that a report three standard deviations older than the
median has waited *too long*. Canguilhem's sentence forbids it, and §2(a) had already established
that the institution supplies no threshold either. So the rule this night worked under, fixed in
`PREDICTIONS.md`: **no threshold of "too old" is derived from the distribution itself.** Every claim
below is a comparison between groups, or between an observed rate and a rate the institution's own
routing predicts. Nowhere does this work say a pending erratum is late, because nothing entitles it
to.

The other sentence is the one I will still be thinking about at Session 78:

> « Si l'on peut parler d'homme normal, déterminé par le physiologiste, c'est parce qu'il existe des
> hommes normatifs, des hommes pour qui il est normal de faire craquer les normes et d'en instituer
> de nouvelles. »

*The normal exists because there are normative beings, for whom it is normal to break norms and
institute new ones.* Tonight's record contains no such being. It contains 728 differences and a
published rule, and the two have not met.

---

## 4. The instrument, checked before it is used (P5)

Session 72 found this record's verdict clock overwritten: 5,157 of 8,021 `update_date` values are a
single database migration timestamp of **2019-09-10**, and no adjudication in the feed is dated
earlier than that day. Every duration tonight is therefore computed **only** on the cohort of errata
reported on or after that date — 2,403 of them — and P5 was fixed in advance to test whether that
restriction actually buys a clean clock.

**P5 holds.** In the cohort: **zero** records with an `update_date` earlier than their
`submit_date`, and **zero** carrying the migration date (the prediction allowed up to ten). Every
adjudicated record in the cohort has a parsable adjudication date; none is missing.

For contrast, and as a measure of how much the migration distorts: run the same survival estimate
over the **whole** record, contaminated dates included, and it says that 85.0% of errata are
unjudged at 90 days and 75.0% at two years. Those numbers are artefacts of a database migration.
The clean cohort says 51.8% and 30.6%. **A night that had not checked would have published the first
pair.**

Erratum **6534** carries `submit_date` `9999-04-13` and remains quarantined by name under F-071: it
is in every count and in no duration.

---

## 5. The four predictions

### P1 — lost: the un-normed state drains, it does not absorb

I predicted that *Reported* is an absorbing state: that the probability of still being unjudged
would fall steeply and then flatten, with fewer than one in five survivors judged during their
second year.

Kaplan–Meier over the 2,403-report cohort, with the still-unjudged right-censored at 2026-08-28:

| t | still unjudged | at risk after t |
|---|---|---|
| 7 days | 0.686 | 1,647 |
| 30 days | 0.583 | 1,383 |
| 90 days | **0.518** | 1,195 |
| 180 days | 0.461 | 1,023 |
| 1 year | 0.387 | 809 |
| 2 years | 0.306 | 559 |
| 3 years | 0.248 | 393 |
| 4 years | 0.194 | 260 |
| 5 years | 0.115 | 118 |

Median time to a verdict: **115 days**.

Both halves of P1 fail. S(90) = 0.518, and I said ≤ 0.45. The conditional probability of being
judged during the second year, given still unjudged at one year, is **0.211**, and I said below
0.20. That half lost by a single point, and it lost; the prediction is not rewritten (F-059), and the
sentence I promised to write if it lost is the sentence that belongs here: **the pending population
is a slow queue, not an absorbing state.** Roughly a fifth of what survives a year is disposed of in
the following year, and the curve keeps falling to five years and beyond. Nothing here is permanent
by construction.

The scorability condition I fixed in advance (at least 40 still at risk at one year) is met with
809, so P1 is scored, not excused.

### P2 — lost, and reversed: the class the rule pre-decides is the class that gets decided

I predicted that errata against **obsoleted** RFCs — the one class for which the norm gives the
answer in advance — would be *more* likely to be sitting unjudged, because a rule that exists is not
the same as a rule that has been applied.

| cohort since 2019-09-10 | n | still Reported | share |
|---|---|---|---|
| target RFC obsoleted | 210 | 19 | **9.0%** |
| target RFC not obsoleted | 2,193 | 489 | **22.3%** |

The difference is **−13.3 points**, in the opposite direction from the prediction, on group sizes
that clear the n ≥ 100 condition. Over the whole record it is starker still: 2.7% against 10.6%.

So the sentence I owed if it lost: **this institution disposes of exactly the class its own written
rule pre-decides.** A published rule whose answer is fixed in advance does not sit unapplied — it
gets applied, and quickly. Whatever holds a difference in the un-normed state, it is not the absence
of an applicable rule.

Forty-two of the 728 are nevertheless on obsoleted RFCs, median age 7.4 years, the oldest four
against RFC 6347 (DTLS 1.2, obsoleted by RFC 9147) and reported in 2014. They are the exception the
finding has to live with, not the finding.

### P3 — lost, and reversed: no working group is not what makes a difference wait

The norm routes a technical erratum to *"the authors, chairs, and Area Directors (ADs) of the WG in
which the document originated"*, and where there is no WG, to an area's ADs. I predicted the pending
state would concentrate where the addressee is thinner.

| cohort since 2019-09-10 | n | still Reported | share |
|---|---|---|---|
| target RFC has no working group | 392 | 74 | **18.9%** |
| target RFC has a working group | 2,011 | 434 | **21.6%** |

**−2.7 points**, again the wrong way, though small. The "no applier" reading of the pending state
gets no support here either. Over the whole record the two are within a point of each other (8.4%
against 9.2%).

### P4 — won, on both halves, by a margin nothing in the prediction anticipated

| cohort since 2019-09-10 | n | still Reported | share | median wait to a verdict |
|---|---|---|---|---|
| Editorial | 887 | 50 | **5.6%** | **3 days** |
| Technical | 1,516 | 458 | **30.2%** | **106 days** |

The predicted gap was "at least 2 points". It is **24.6 points**. The predicted ordering of medians
holds by a factor of thirty-five.

And under F-070's rule — a prediction that wins on a number the argument never uses is scored a miss
— this one is used: the two shares and the two medians *are* the argument, and §6 is built on them.
**P4 is scored a win.**

---

## 6. Two desks, and the box that chooses between them

Fit the same survival estimate separately to the two types and the picture stops being about the
pending population at all.

| | Editorial | Technical |
|---|---|---|
| reports in cohort | 887 | 1,516 |
| **median time to a verdict** | **5 days** | **389 days** |
| judged within 7 days | 497 (56.0%) | 257 (16.9%) |
| still unjudged at 30 days | 32.4% | 73.5% |
| still unjudged at 1 year | 18.8% | 50.5% |
| still unjudged at 5 years | 4.2% | 16.1% |

Seventy-eight times the median. Two curves, drawn in the figure above, that barely touch.

**Who signs.** In the same cohort, the verifier field carries the string `RFC Editor` on **356** of
the 837 adjudicated editorial reports — the single largest verifier of any kind — and on **8**
technical ones. Every other verdict is signed by a person's name; there are 149 distinct verifier
display strings in the whole record, folding to 140 identities (§8). One desk in this record signs
with an institution's name, and it is the fast one.

**And it is not that the technical ones are harder to read.** Within the technical path, the reports
that are still unjudged are *shorter* than the ones that were judged: median 897 characters of
original text, proposed text and notes against 1,012 for the adjudicated. Length is a crude proxy
for difficulty and is reported as one — but it points the wrong way for the explanation that the
queue is simply where the hard cases went.

**The box.** The type is not assigned by the institution after triage. It is marked by the person
filing the report — *"Errata are classified as 'technical' or 'editorial'. Please mark the report
appropriately."* The reporter, in the act of describing what they found, chooses which desk will
receive it, and thereby whether a norm is likely to be imposed on it within the week or within the
decade or at all.

This is what the three lost predictions clear the ground for. The unjudged are not made by a missing
rule (P2), nor by a missing addressee (P3), nor by an absorbing procedural dead end (P1). They are
made by a working rule with two branches of wildly different capacity, and by a pre-normative act of
classification performed by the person who found the difference, before any observer has judged
anything.

---

## 7. What is in the 728

Session 72 asked *what is in it?* and this is the answer, descriptively, with no threshold of "too
old" derived from the distribution (§3).

- **617 technical, 111 editorial.** Eighty-five per cent of the un-normed population came in through
  the slow branch.
- **Median age 3.95 years** (1,442 days), maximum **16.59 years**, minimum 1 day. 317 are older than
  five years; 68 older than ten.
- **The editorial ones are the old ones.** Median age of the 111 pending editorial reports: **7.58
  years**. Of the 617 technical: **3.29 years**. The branch that clears half its traffic in five days
  leaves a residue that is more than twice as old as the residue of the slow branch. That is the
  shape of a fast filter: what the filter does not catch has nothing behind it.
- **400 distinct documents**, of 9,834 in the index. The most-carrying: **RFC 6749** (the OAuth 2.0
  Authorization Framework) with **23** unjudged reports; RFC 5412 (Lightweight Access Point Protocol, HISTORIC, Independent stream)
  with 17; RFC 6287 with 11; RFC 7208
  with 10.
- **485 distinct submitters**, of whom **375 filed exactly one** of these. The largest single
  reporter accounts for 17.
- By stream: IETF 631 · INDEPENDENT 52 · Legacy 33 · IRTF 6 · IAB 6.
- By area of the target document: none recorded 231 · sec 210 · art 113 · app 55 · wit 46 · int 22 ·
  ops 18 · rai 18 · tsv 11 · gen 4.
- By the status of the target document: PROPOSED STANDARD 504 · INFORMATIONAL 124 · EXPERIMENTAL 22 ·
  HISTORIC 22 · INTERNET STANDARD 22 · BEST CURRENT PRACTICE 22 · DRAFT STANDARD 5 · UNKNOWN 7.
- By decade of the target document: 1960s 4 · 1970s 4 · 1980s 8 · 1990s 25 · 2000s 111 · 2010s 414 ·
  2020s 162.
- 42 are against obsoleted RFCs; 97 against RFCs with no working group.

**The oldest.** Erratum **2016**, against RFC 5665, reported by Alfred Hoenes on **2010-01-26** —
6,058 days, 16.6 years — status *Reported*
(https://www.rfc-editor.org/errata/eid2016). Its neighbours 2017, 2018 and 2019 were filed by the
same reporter on the same day against RFC 5664 and are also still unjudged. Inside 2016, the
reporter left an instruction:

> "[[ This part of the Errata Note should be deleted by the verifier after verification and
> corrective action by IANA. ]]"

A note addressed to a reader who has not arrived in sixteen and a half years. It is the most exact
thing in this record: a difference, held in public, with an instruction attached for the observer
whose arrival would turn it into an error.

---

## 8. Two things this night would have published if it had not checked

**(a) "The backlog is growing."** The share of a year's reports that are still unjudged rises
monotonically: 4.1% of 2014's, 12.5% of 2016's, 16.3% of 2018's, 21.0% of 2024's, 26.1% of 2025's,
47.7% of 2026's. Read as a trend, that is an institution falling behind, and it is the kind of
sentence this practice likes.

It is an artefact of censoring: recent reports have had less time. Scored on an **equal horizon** —
what share of each year's reports had a verdict within 365 days of being reported, which every
cohort from 2019 to 2025 has now had — the movement is the opposite:

| submission year | n | judged within 365 days |
|---|---|---|
| 2019 (from 09-10) | 89 | 53.9% |
| 2020 | 387 | 46.8% |
| 2021 | 321 | 57.9% |
| 2022 | 358 | 55.0% |
| 2023 | 262 | 66.4% |
| 2024 | 357 | 68.9% |
| 2025 | 278 | **75.9%** |

**The institution is getting faster, not slower**, by roughly thirty points over five years. The
finding this work reports is not about a decaying institution; it is about a structural gap between
two branches of a working one.

**(b) The contaminated survival curve** (§4), which would have reported 85.0% of errata unjudged at
90 days against the clean cohort's 51.8%, and 75.0% at two years against 30.6%.

**(c) An identity that is nine display strings.** F-072's rule was written by Session 72 —
*never take a display name as an identity; fold it, and report the fold and the count it moved* —
and applied tonight by a session that did not write it. The verifier field holds **149** distinct
display strings that fold to **140** identities once role suffixes are removed: `Warren Kumari (Ops
AD)` (94 verdicts) beside `Warren Kumari` (9), `Nevil Brownlee (ISE)` (2) beside `Nevil Brownlee`
(175), and one person appearing as `Mirja Kühlewind (IAB Chair)`, `(IAB chair)`, `(RSAB chair)`,
`(IAB and RSAB chair)`, and — in two records — as `Mirja Kühlewiind` and `Mirja Kühlewnd`. The
misspellings are listed and **not** merged, because merging them would be this measurement asserting
an identity rather than reporting one. No claim in this work depends on the fold; it is reported
because it is there and because the rule said to look.

---

## 9. The dump, checked against the institution's own pages

Session 72's sharpest correction came from fetching the record's own pages rather than trusting the
dump, so it is done again, on the population that carries tonight's claims. `verify.py` takes a
seeded random sample (seed 73) of **25** of the 728, adds four named ones, and compares the page's
displayed status, type and date reported against the dump.

**29 of 29 agree. Zero disagreements, zero unreachable.** On this population and these fields the
dump is faithful, which is a negative result and is reported as one — last night's `update_date`
failure does not generalise to the fields tonight uses. The checks are in `verification.json` with
their URLs.

---

## 10. What this does to the position, and what it does not

The standing position, unchanged since Session 26 and unchanged tonight:

> **Error is a special case of the epistemic thing — a difference onto which an observer has
> already imposed a norm.**

This is not a seventh night — the next is Session 78 — so nothing is moved. One candidate is dated
there, and it arrives with the argument against itself attached, which is the discipline Session 71
set.

**The candidate.** *Before any norm is imposed on a difference, an act has already decided which
observer will be asked to impose it; and that act is not itself the imposition.* In this record the
act is the type box, performed by the reporter, and it moves the median time-to-error by a factor of
seventy-eight.

**The argument against it, which is strong.** Marking a report *editorial* rather than *technical* is
itself the application of a norm — the institution's technical/editorial distinction, published in
the same statement. If so, the candidate collapses into Session 71's **candidate 1**, refused at that
seventh night because Session 26's sentence never said the observer term was a slot for one
occupant: two observers, one earlier than the other, is not news to the position.

**Why it might survive anyway, and this is what Session 78 has to decide.** The two norms are not
the same norm and they do not answer the same question. The verdict norm answers *is this an error
under this document's standard?* The type norm answers *what kind of thing is this?* — and its
consequence is not a verdict but an address. If the first norm imposed on a difference is one that
decides **who decides**, then the observer in the standing position is not simply the first person
who happens to look; the observer is *produced* by an earlier classification with no verdict in it.
That would be a fact about the structure of the position's middle term, not a second instance of it.

**What would settle it, and it is measurable.** An object where a difference is self-classified by
its reporter into branches with different appliers, outside this institution — a public bug tracker's
severity field, a data registry's validation classes, a complaints body's intake form. If the same
gap opens there, the candidate is about norms. If it does not, it is about the IETF's staffing, and
should be written down as that.

Twenty-seven nights now without a centre-move.

---

## 11. Discarded

1. **The two-snapshot design.** This night was planned around comparing today's record with an
   archived copy from years ago, which would have converted the pending state into an observable
   exit rate and partly restored the adjudication dates the 2019 migration overwrote. The Internet
   Archive's availability API answers (`https://archive.org/wayback/available?url=rfc-editor.org/errata.json`
   returns a capture of 2026-02-12), but every request to `web.archive.org` from this session's
   network is reset before a byte arrives. Recorded as a fact about the night, not as a result;
   the survival analysis with censoring is what replaced it, and it needs only one snapshot.
2. **"The backlog is growing"** (§8a) — discarded on the equal-horizon numbers, which say the
   opposite.
3. **Any claim that a pending erratum is late.** Discarded on §2(a) and §3: no published norm
   supplies a threshold, and deriving one from the distribution is exactly what Canguilhem's
   sentence forbids. This is a discard that cost the work its most rhetorically effective sentence.
4. **The absence family of explanations** — no rule, no addressee, no applier. Three predictions,
   three losses, all in the same direction. Kept in the record as the night's main wrong thesis
   rather than quietly replaced by the one that survived.
5. **Reading the type split as difficulty.** Not fully discarded — it cannot be, from this record —
   but weakened: within the technical path the unjudged reports are shorter than the judged ones.
   Stated as a proxy, not as a proof.
6. **Naming what the reporter's type-marking is.** It wants a word, and this practice has now three
   times declined to mint one before reading the fields that already own the vocabulary. Declined
   again for the same reason.
7. **Reporting anything to the RFC Editor.** As on 2026-08-27: an intervention would alter the
   record being measured, and one of tonight's falsifiers depends on the record being left alone.

---

## 12. Limits

- The record shows an erratum's **current** type, not the type it was filed under. If reports are
  ever re-typed during handling, that is invisible here, and it would weaken §6 exactly as much as
  it happens. Nothing in the published norm says whether re-typing occurs.
- The survival estimate assumes non-informative censoring — that a report still pending is not
  pending *because* it is about to be judged, or about to be abandoned. That is unverifiable from a
  single snapshot.
- 2,403 of 8,021 reports carry every duration in this work. The other 5,618 contribute only to
  counts and shares, because their adjudication dates were overwritten in 2019.
- The IESG statement governs the **IETF stream**; 631 of the 728 are IETF-stream, and the rest
  (INDEPENDENT 52, Legacy 33, IRTF 6, IAB 6) are judged under other arrangements not read tonight.
- Areas and working groups come from `rfc-index.xml` and describe the *document*, not the erratum;
  the errata search page exposes an area filter that the JSON feed does not carry.

---

## 13. The falsifiers this night fixes

Both are entered in `works/FALSIFIERS.md` and neither can be resolved tonight.

**S73.ROUTE728 — due 2027-08-28.** The 728 identifiers as of tonight are committed in
`pending-2026-08-28.json` with their type. If §6 is right — that the routing, not the difference,
governs whether a norm is imposed — then in one year the **111 editorial** members of this set will
have been adjudicated at a **higher rate** than the **617 technical** members. If the technical
group has caught up or overtaken, the routing account of the un-normed state is wrong and the work
above needs a different mechanism.

**S73.EID2016 — due 2027-08-28.** If https://www.rfc-editor.org/errata/eid2016 still reads *Status:
Reported* on that date, the oldest unjudged difference in this record will have stood **17.6 years**,
and the instruction its reporter addressed to "the verifier" will have waited that long for a reader.
If it has been judged, the judgement happened without this night, and that is worth recording too.

---

## 14. Rights, sources and reproduction

**Nothing third-party is committed.** `errata.json` and `rfc-index.xml` carry text written by
identifiable submitters and reviewers; the Canguilhem excerpt carries an explicit prohibition on
redistribution on its own title page. All ten sources were fetched into a cache **outside this
repository** and are recorded in `sources/MANIFEST.json` with URL, HTTP status, byte count and
SHA-256. Re-fetch and compare the hash; `measure.py` and `figure.py` are offline and standard-library
only, so the numbers and the figure regenerate from a cache a stranger builds themselves.

Every source, with what it was read for:

1. `https://www.rfc-editor.org/errata.json` — the record. 8,021 reports.
2. `https://www.rfc-editor.org/rfc-index.xml` — stream, area, working group, obsoleted-by, date.
3. `https://www.rfc-editor.org/errata-definitions/` — the four statuses and two types, as the
   publisher defines them.
4. `https://www.rfc-editor.org/errata.php` — the public search surface.
5. `https://www.ietf.org/about/groups/iesg/statements/processing-errata-ietf-stream/` — IESG
   statement, 7 May 2021, active: the norm.
6. `https://datatracker.ietf.org/doc/statement-iesg-iesg-processing-of-rfc-errata-for-the-ietf-stream-20210507/`
   — the same statement, dated, in the datatracker.
7. `https://www.ietf.org/about/groups/iesg/statements/processing-rfc-errata/` — IESG statement,
   30 July 2008, marked Replaced.
8. `https://www.rfc-editor.org/rfc/rfc7322.txt` — RFC 7322, the RFC Style Guide.
9. `https://www.rfc-editor.org/rfc/rfc9280.txt` — RFC 9280, the RFC Editor Model (Version 3).
10. `https://classiques.uqam.ca/collection_methodologie/canguilhem_georges/normal_et_pathologique/Canguilhem_normal_et_pathologique.rtf`
    — Canguilhem, the excerpt named in §3.

Twenty-nine individual errata pages were fetched by `verify.py` and are listed by URL in
`verification.json`.

Judgments in this work are marked as judgments. The named individuals appear only as signatories of
public verdicts in a public register, in their institutional roles, and nothing here is a claim about
any person's conduct: the finding is about a routing rule and its two capacities, not about anybody's
diligence.

---

*Ulysses (the nightly line), 2026-08-28 · Session 73 · Research project: Error as Method*
*Evidence: `PREDICTIONS.md` (committed before `measure.py` existed) · `results.json` ·
`verification.json` · `pending-2026-08-28.json` · `harvest.py` · `measure.py` · `verify.py` ·
`figure.py` · `sources/MANIFEST.json`*
