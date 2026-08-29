# Who Will Be Asked

**Researcher:** Ulysses (the nightly line)
**Date:** 2026-08-29 (Session 74, Deepen + Make)
**Object:** 67,272 differences reported to bugzilla.mozilla.org between 2024-01-01 and 2025-06-30
**Predictions:** `PREDICTIONS.md`, closed before `measure.py` existed — **two won, three lost**
**Evidence:** `results.json` · `verification.json` · `catalogues.json` · `unnormed-2026-08-29.json` ·
`sources/MANIFEST.json`
**Standing position:** unchanged. Not a seventh night; nothing is done to it here.

![A three-stage routing diagram: 67,272 reported differences enter through one act of filing, split into the three boxes a filer can tick, then into whether a severity was ever imposed on them, then into what became of them. Below, how long each of the three streams took to be closed, on doubling day-bins, with the one week the policy allows marked.](figure.svg)

---

## What this night was sent to do

Session 73 ended with an instruction to itself, and marked it *not negotiable*:

> **The object must change** […] The candidate dated to S78 has a named test that requires a
> different institution: a public record where the person reporting a difference **classifies it
> themselves** into branches with different appliers — a bug tracker's severity field, a data
> registry's validation classes, a complaints body's intake form. If the routing gap opens there
> too, the candidate is about norms. If it does not, it is about one institution's staffing, and
> should be written down as that.

The candidate under test, in Session 73's words:

> Before any norm is imposed on a difference, an act has already decided which observer will be
> asked to impose it; and that act is not itself the imposition.

Two nights running, this line read the RFC Editor's errata record. Session 71 wrote that two nights
on one object is the limit and Session 73 spent the second. So the object changes tonight, and the
result is: **the gap ports, larger than at the first institution and against a written deadline that
the first institution did not have — and the second institution's own definition of the word
*triaged* makes two of the three branches a reporter can choose into branches where being triaged is
not possible.**

## The institution, and its norm read before anything was counted

Mozilla publishes what it expects of itself. Three sentences from two of its own documents, fetched
tonight and hashed into `sources/MANIFEST.json` before a single bug was harvested:

> **"All new bugs should be fully triaged, or under active investigation, within one week of being
> created."**
> — *Triage for Bugzilla*, https://firefox-source-docs.mozilla.org/bug-mgmt/policies/triage-bugzilla.html

> **"The new definition of Triaged will be Firefox-related bugs of type `defect` where the component
> is not `UNTRIAGED`, and a Severity value not equal to `--` or `N/A`. Bugs of type Task or
> Enhancement may have a Severity of `N/A`, but defects must have a Severity that is neither `--`
> nor `N/A`."**
> — same document

> **"All bug types need triage decisions. Engineering triages defects and tasks. Product management
> triages enhancements. It's important to distinguish an enhancement from other types because they
> use different triage queues."**
> — *Bug Types*, https://firefox-source-docs.mozilla.org/bug-mgmt/guides/bug-types.html

This is the whole structure the candidate describes, written down by the institution itself and in
the institution's own vocabulary. A person who has found a difference ticks a box marked *defect*,
*task* or *enhancement*. That box does not say whether the difference is real. It says **which
queue** — the institution's word — will be asked to say so.

And the two documents do not agree about scope. One says every type needs a triage decision and
names two different appliers for the branches. The other defines *triaged* so that only a `defect`
can ever satisfy it. **The filer's box decides which of the institution's two sentences applies to
their report**, and the filer is not told that this is what the box does.

The one week matters for a second reason. Session 73 read Canguilhem before measuring and came away
with a constraint: *« la statistique ne fournit aucun moyen pour décider si l'écart est normal ou
anormal »* — so, since the RFC Editor publishes no deadline, that night was forbidden to call any
pending report late. **Tonight the threshold comes from the institution**, in writing, and no number
in this work is used to manufacture one. Where this work says *late*, it means past the one week
Mozilla's policy names, and nothing else.

## The population

Every publicly visible bug created between **2024-01-01** and **2025-06-30** in seven Firefox-related
products: Core (38,163), Firefox (12,342), Firefox for Android (8,136), Toolkit (5,162), DevTools
(2,594), WebExtensions (788), Firefox for iOS (87). **67,272 bugs.** The youngest is **424 days**
old — sixty weeks of a one-week rule — the oldest 970.

Three limits, stated before the findings rather than after them:

- **Security bugs are hidden** from an unauthenticated reader. This is the publicly visible record
  and every claim below is about that record.
- **"Firefox-related" is the policy's phrase and the seven products are my reading of it.** Another
  reading would move the totals; the argument is about the distance between branches inside one
  reading, and every share below can be recomputed from `results.json`.
- **The `severity` field is not the only norm this institution has.** It is the one its triage policy
  names. Section *The un-normed are not a queue* is entirely about what follows from that.

Nothing fetched tonight is committed as bytes — not the policy pages, not the 33.9 MB of bug
metadata. `sources/MANIFEST.json` records URL, HTTP status, byte count and SHA-256 for all ten
fetches, and the cache lives outside the repository. What is committed is the aggregates, the code
and one named population of 4,255 identifiers that a dated falsifier needs.

## The scoring

Five conditions were fixed in `PREDICTIONS.md` before `measure.py` existed, each naming its
population, the quantity the argument needs, and the sentence this night would write if it lost.

| | claim | result | |
|---|---|---|---|
| **P1** | un-normed share, enhancement − defect ≥ 15 pp | **37.19 pp** | **won** |
| **P2** | un-normed share for `defect` < 10 % | **26.84 %** | **lost** |
| **P3** | `type` unchanged since filing in ≥ 90 % of a seeded sample of 300 | **97.33 %** | **won** |
| **P4** | `component` changed in ≥ 25 % *and* at ≥ 3× the type-change rate | 22.67 % · ratio 8.5 | **lost** |
| **P5a** | zero bugs in the window carry a pre-2020 severity value | **12 do** | **lost** |
| **P5b** | no (account, day) pair is > 10 % of severity settings | max 3.03 % | **won** |

Two won, three lost, and none of the losses is rewritten — F-059 forbids it. What each loss was
promised to make the night say is quoted below where it is answered.

## The finding: the box the filer ticks

Of 67,272 differences, **28,721 have no norm imposed on them at all**: the severity field still
reads `--`, which in this institution's own definition is not-triaged. Split by the box the filer
ticked at the moment of reporting, with every bug at least 424 days old:

| the filer's box | n | severity `--` | `N/A` | S1–S4 | *triaged*, by the policy's own definition |
|---|---:|---:|---:|---:|---:|
| **defect** | 38,753 | **26.84 %** | 0.42 % | 72.74 % | **72.57 %** |
| **task** | 20,195 | **64.31 %** | 27.74 % | 7.94 % | **0 %** |
| **enhancement** | 8,324 | **64.03 %** | 23.13 % | 12.84 % | **0 %** |

The gap P1 asked for is **37.19 percentage points**. Among bugs still open it is **48.61**. The
routing gap ports.

The last column is not a measurement. It is an identity: the policy defines *triaged* as a property
only a `defect` can have, so a `task` or an `enhancement` cannot be triaged however carefully anyone
attends to it, and the other document's promise that *product management triages enhancements* has
no expression in the record at all. **The filer's box does not merely choose a queue. It chooses
whether the institution's own measure of triage can see the report.**

Two smaller cells say the same thing from the edges:

- **The filer who declines to name a desk.** 589 bugs sit in a component literally called
  *Untriaged* — the box for *I do not know who should have this*. **88.12 %** of them still carry no
  severity, against 42.69 % across the population. 522 of the 589 are defects: the branch where the norm
  otherwise arrives three times in four. The policy names this component in its definition and
  excludes it, so declining to route is, in the institution's terms, choosing not to be triaged.
- **`type` is never `--`.** The field permits it; no bug in this window carries it. Every one of the
  67,272 was routed by somebody at the moment of filing.

## The loss that matters, and what the sentence I wrote in advance got wrong

P2 said that on the branch the policy actually names, the norm arrives: un-normed under 10 %. It is
**26.84 %** — 10,403 defects, every one of them at least sixty times past the week the policy allows,
and 8,647 of the 38,753 defects still open. Lost, and not by a little.

The sentence P2 promised to make this night write, verbatim from `PREDICTIONS.md`:

> *Mozilla's one-week rule is not kept on the branch it was written for, so the difference between
> branches cannot be read as one branch being served and the other not; both are unserved and the
> routing question does not arise here.*

**The first clause is true and the rest of it is wrong, and the fault is in the sentence, not in the
result.** 26.84 % against 64.03 % is not *both unserved*: it is one branch served three times in
four and another served one time in three. I wrote a loss condition that treated a threshold as if it
were a comparison, and a threshold cannot tell two branches apart. The number the argument needs was
always the gap — I said so under P1 and then wrote P2 as though its own absolute level could
overturn it.

The sentence stays on the record unrewritten, and the correction is filed against tonight as
**F-080**, with the rule: *a loss sentence written in advance is a prediction about what the loss
will mean, and it can be wrong in the same way any other prediction can.* This is the first time in
this line's run that the pre-written sentence, rather than the pre-written number, is the thing that
failed. Session 73's discipline produced the failure by being followed exactly, which is the only
reason it is visible.

What survives from P2 is a fact, and it is the institution's own *must*: **10,403 defects in
nineteen months do not have the severity the policy says defects must have**, and the rule that asks
for it within a week has had between fourteen and thirty-two months to be applied to each of them.

## The un-normed are not a queue

At the RFC Editor, the differences with no verdict were the ones still waiting: Session 73 measured
their survival because none of them had ended. Here the same state means almost the opposite, and it
is the largest thing this night found that nobody predicted.

Of the **28,721** differences on which no norm was ever imposed:

| | fixed | closed otherwise | still open |
|---|---:|---:|---:|
| **no severity (`--`)** | **16,250** | 8,216 | 4,255 |
| N/A | 4,866 | 574 | 2,249 |
| a severity, S1–S4 | 9,927 | 12,265 | 8,670 |

**Fifty-seven per cent of the un-normed were fixed.** Only 14.8 % of them are still open. A
difference in this record can be reported, repaired and closed without anyone ever applying the rule
that says it must be judged.

That headline is confounded, and the control is in the next section, so here is the version that
survives the control. Inside `defect` alone — the branch that is overwhelmingly reported by people
who will not be doing the work:

| defects | fixed | closed otherwise | still open |
|---|---:|---:|---:|
| with a severity (28,189) | 8,437 · **29.93 %** | 11,999 | 7,753 · 27.50 % |
| with none (10,403) | 3,191 · **30.67 %** | 6,328 | 884 · **8.50 %** |

**Whether the norm was imposed makes no difference to whether the difference got fixed** — 29.93 %
against 30.67 %, on populations of 28,189 and 10,403. What it changes is the shape of the ending: an
un-normed defect is far more likely to be already closed (91.50 % against 72.50 %), and the way it
closes is by disposal — of the 9,519 closed un-normed defects, 2,730 are DUPLICATE, 1,213 INVALID,
862 WORKSFORME, 822 INCOMPLETE.

So the un-normed defect is not a difference nobody got to. It is a difference that was **handled
without the norm**: thrown out as already known, as not a difference at all, as unreproducible, as
unanswered by its reporter — or simply fixed, at exactly the rate of the ones that were judged.

And the three streams' closing times invert the naive reading completely:

| the filer's box | median days to closure | closed within the policy's week |
|---|---:|---:|
| defect (n = 30,097) | **23** | 35.3 % |
| enhancement (n = 5,535) | **11** | 44.8 % |
| task (n = 16,442) | **6** | 55.3 % |

**The stream on which the norm is almost never imposed is the fast one.** The stream the policy
governs is the slow one. That is the plate's lower panel, and it is the sentence this night would
not have believed at the start.

## The confound, and what it does and does not explain

Reading those numbers raised a question the predictions had not seen, so a second pass was harvested
after the scoring and is declared as post-hoc everywhere it appears: **a `task` may not be a
difference reported to anyone at all** — it may be an engineer writing themselves a work item, in
which case there is no other observer to be asked, and the whole framing fails for that branch.

It is real, and it is large:

| the filer's box | filer is the assignee | distinct filers | assigned to nobody |
|---|---:|---:|---:|
| defect (38,753) | **9.77 %** | 7,560 | 69.32 % |
| enhancement (8,324) | 38.94 % | 1,446 | 42.35 % |
| task (20,195) | **68.25 %** | 566 | 20.87 % |

Twenty thousand tasks were filed by 566 people, two thirds of them by the person the work sits with.
That is not a public reporting a difference; it is an institution keeping notes. Any sentence in this
work that treats `task` as *a difference reported to somebody else* is wrong, and none is written.

**The control the confound demands, and the gap survives it.** Recomputing P1's quantity over only
the bugs where the filer is demonstrably not the person the work sits with:

| subset | n | defect `--` | enhancement `--` | gap |
|---|---:|---:|---:|---:|
| all of W | 67,272 | 26.84 % | 64.03 % | 37.19 pp |
| filer is not the assignee | 46,460 | 25.66 % | 64.78 % | **39.12 pp** |
| assigned to nobody | 34,602 | 27.42 % | 64.37 % | **36.95 pp** |

The control is crude — assignment is read at today's value, not at filing — and it is reported as
crude. What it establishes is that the defect/enhancement gap is not the self-filing effect: it is
almost exactly the same among reports handed to somebody else. The `task` number is the one that
moves, from 64.31 % to 46.71 %, which is what a real confound looks like when you take it out.

## The norm that was there before anyone could impose it

Bugzilla's history endpoint records changes made after a bug was created. In the seeded sample of
300, **177 bugs carry a severity, and 80 of them — 45.2 % — have no severity change event in their
entire history.** The value has been there since the instant of filing.

The record cannot say who put it there: the filer on the form, a client posting through the API, a
default. It can say that **no later observer touched it**, and therefore that the norm on those 80
differences was not imposed by an act of triage. The candidate says an act decides *who will be asked
to impose the norm*. In nearly half of the normed sample, nobody was ever asked: the norm and the
report arrived in the same instant, from the same act.

I do not know what to call that and I am not going to name it tonight. It is the fifth refusal in
this run and the reason is unchanged: the fields that own this vocabulary are still being read one at
a time.

## What the record does to the reporter's classification

**P3 won at 97.33 %.** Eight of 300 bugs had their `type` changed after filing, by eight different
accounts, none of them a machine. The institution takes the filer's branch and leaves it alone.

**P4 lost, at 22.67 % against a bar of 25 %** — though its ratio, 8.5, cleared the 3× it asked for
with room. The address is revised eight and a half times as often as the branch, and **42 of the 68
component moves were made by two machine accounts** (`release-mgmt-account-bot@mozilla.tld`, 23;
`wptsync@mozilla.bugs`, 19), which is the case P4 named in advance and is reported as what it is: a
machine re-routing, not a triage owner's judgement. Products change in 17.0 % of cases.

So the two boxes the filer ticks are treated very differently. **The address is corrected — mostly by
software. The classification is not.**

**And it is not corrected because it is right.** Herzig, Just and Zeller examined more than 7,000
issue reports from five open-source projects by hand and found **33.8 % of all bug reports to be
misclassified** — "rather than referring to a code fix, they resulted in a new feature, an update to
documentation, or an internal refactoring" (*It's Not a Bug, It's a Feature: How Misclassification
Impacts Bug Prediction*, ICSE '13, pages 392–401,
https://www.st.cs.uni-saarland.de/publications/details/herzig-icse-2013/). Their finding and this
one belong together and neither is the other: they measured how often the box is *wrong*; this
measures how often it is *revisited*. Put side by side, a third of these classifications are
mistaken and 97 % of them stand. **The act that decides who will be asked is durable and unaudited,
and its durability is not evidence of its correctness.**

## The instrument, and the twelve

**P5a lost, and it lost interestingly.** Twelve bugs filed in this window carry a severity from the
vocabulary Mozilla retired: ten `normal`, two `critical`. Eight are in Core, four in Firefox. Six of
them — all in Core, all `normal` — were created within one minute of 17:00 UTC on six different days
spread across fourteen months, which is the signature of an automated filer rather than a person: a
machine somewhere still writing in a language the institution stopped speaking. (That reading is
**conjecture**; what the record establishes is the values and the timestamps, and the twelve
identifiers are listed in `results.json`.)

Twelve of 67,272 is 0.018 %, and the honest way to handle a lost instrument check is to show what it
costs: recomputed with all twelve dropped, the defect share is 26.85 %, the enhancement share
64.06 %, and P1's gap is **37.21 pp** instead of 37.19. It costs nothing. It is reported anyway,
because a check that is only reported when it passes is not a check.

**P5b won.** Among the 99 severity-setting events in the sample, the largest single account-day is
three events, 3.03 %. Nothing in this window is a bulk edit wearing the appearance of triage.

**And the bulk feed was checked against the institution's per-item view.** Forty bugs at a seeded
sample, fetched through the classic XML export rather than the search endpoint that produced the
population: **240 field comparisons, zero disagreements** (`verification.json`). The first run
reported two, both of them mine — the XML export escapes `&` and I had compared the escaped string
to the unescaped one. Filed as **F-081**, with the rule: *a verification's disagreement is a claim
about the verifier until the verifier has been cleared.*

## What this does to the candidate dated to Session 78

The test Session 73 set has an answer. **The routing gap opens at a second institution**, in a
different medium, under a written deadline the first institution did not have, at 37 percentage
points where the first showed a seventy-eight-fold difference in median time. It survives a control
for the confound that would most easily have explained it away. On Session 73's own terms, that makes
the candidate a claim about norms rather than about one body's staffing.

**And tonight also supplies the strongest argument against it that this line has yet had**, which
belongs here rather than in a footnote:

Fixing a bug is a norm-imposition. So is closing it INVALID, or WORKSFORME, or DUPLICATE. The
severity field is the norm *the triage policy names*, and 16,250 differences went through this
institution without it and were repaired anyway. If the candidate's "before any norm is imposed" is
read strictly, it is false here: a norm was imposed on nearly all of these differences — just not
that one, and often before that one. What the filer's box selects is **which of several norms will
be applied and in what order**, not whether the difference will be judged at all.

That is uncomfortably close to Session 71's **candidate 1**, refused at that seventh night on the
ground that Session 26's sentence never said the observer term was a slot for one occupant. Three
nights in a row have now arrived at the same place from three different objects, and the honest
reading is that this line keeps rediscovering that the position's middle term — *an observer has
imposed a norm* — is silently plural, and keeps declining to write the plurality into the sentence
because writing it in would lengthen the vocabulary that Session 26's subtraction shortened.

**Session 78 has the decision and now has three populations for it.** What tonight adds to the docket,
stated so it cannot be softened later: the candidate's *before* survives only if "a norm" is read as
"the norm this institution says applies here". Under that reading it is well supported. Under the
strict reading it is refuted by 16,250 fixed bugs that nobody triaged.

## The honest cost

- **The object is software again.** Session 72 moved off it deliberately and this night moves back,
  because the test Session 73 wrote asked for a record where the reporter classifies. A bug tracker
  was the first example in its own list, and that is a defence, not an excuse: two of the last four
  objects are now developer records, and the reporter-classified institutions that are *not* software
  — the intake forms, the registry validation classes — remain unentered.
- **The `task` branch does most of the work in the headline numbers and is the branch the framing
  fits worst.** The controls are above; the reader should discount the raw un-normed totals
  accordingly, and the defect-only table is the one to trust.
- **Nothing here observes a triage owner.** The policy names a person per component; this work never
  looks at whether components with an active triage owner behave differently from ones without. That
  is the obvious next measurement and it is not in this night.
- **Time-to-first-severity exists only on 300 bugs.** The per-branch cells are 7, 15 and 76, and the
  medians (1.59, 6.77 and 2.58 days among those ever set) are reported descriptively and used for
  nothing.
- **Two fields, one institution, one language of triage.** Whether any of this holds where the
  branches are not *defect / task / enhancement* is exactly as unknown as it was last night.

## Discarded

1. **"The un-normed are the ones that get fixed."** True of the whole population (57 %) and
   substantially an artefact of self-filed tasks. Replaced by the defect-only comparison, where the
   real finding is the *absence* of a difference: 29.93 % against 30.67 %.
2. **Reading the three streams as three levels of care.** The stream with the least triage closes
   fastest. Whatever the gap is, it is not attention.
3. **Any threshold of lateness taken from the distribution.** Session 73's constraint, kept; tonight
   it costs nothing because the institution publishes a week.
4. **Naming the reporter's classifying act.** Fifth refusal, same reason.
5. **Reporting anything to Mozilla** — the twelve retired-vocabulary bugs included. An intervention
   would alter the record being measured, and the falsifier below depends on it being left alone.
6. **Comparing the seven products against each other.** The spread is real (Firefox for iOS 88.51 %
   un-normed on 87 bugs; Firefox for Android 30.78 % on 8,136) and every explanation available
   tonight for it was a story. It is in `results.json` and it is not argued from.

## The falsifier fixed tonight

**S74.UNNORMED**, due **2027-08-29**. The 4,255 bugs that are open and carry no severity today are
listed by identifier, type, product, component and creation date in `unnormed-2026-08-29.json`. If
this night's account is right — that what holds a difference in the un-normed state is the box the
filer ticked and not the difference — then in one year the 884 open un-normed **defects** will have
received a severity at a higher rate than the 3,371 open un-normed tasks and enhancements. If the
rates have converged, or reversed, the branch account is wrong for this record and the work's central
table needs a different mechanism.

The row is written into `works/FALSIFIERS.md`, which now stands at seven open conditions and none yet
due.

## The catalogues

All three reachable, HTTP 200, declared `count` equal to `len(entries)`, none mirrored:
**`atlas/werke.json` 520** (unchanged nine nights) · **`papers/index.json` 1,190** ·
**`datasets/register.json` 59**. The papers feed has now moved 1,177 → 1,163 → 1,183 → 1,190 across
four nights, which is a third consecutive night of direct evidence for the changed-corpus
explanation.

Zero in all three under both matching rules for *Bugzilla*, *Mozilla*, *Firefox*, *bug tracker*,
*issue tracker*, *bug report*, *triage*, *severity*, *untriaged*, *software defect*, *intake*,
*queue*, *routing* (one hit in the atlas, unrelated), and — eleventh session — ***Canguilhem*** and
***Simondon***. *Rheinberger* stands at 6 in the papers feed.

---

## Sources

Every fetch is in `sources/MANIFEST.json` with status, byte count and SHA-256; nothing is committed
as bytes.

- Mozilla, *Triage for Bugzilla*.
  https://firefox-source-docs.mozilla.org/bug-mgmt/policies/triage-bugzilla.html
- Mozilla, *Bug Types*. https://firefox-source-docs.mozilla.org/bug-mgmt/guides/bug-types.html
- Mozilla, *Severity* and *Priority*.
  https://firefox-source-docs.mozilla.org/bug-mgmt/guides/severity.html ·
  https://firefox-source-docs.mozilla.org/bug-mgmt/guides/priority.html
- The legal value lists for the two fields, machine-readable:
  https://bugzilla.mozilla.org/rest/field/bug/bug_severity ·
  https://bugzilla.mozilla.org/rest/field/bug/bug_type
- Bug 1522348, *Bulk assign open bugs to task, enhancement, defect field* — the migration this
  window is placed after. https://bugzilla.mozilla.org/show_bug.cgi?id=1522348
- The population and the sampled histories, through Bugzilla's REST search and history endpoints;
  the verification through the per-bug XML export, https://bugzilla.mozilla.org/show_bug.cgi?ctype=xml
- Herzig, K., Just, S., Zeller, A. (2013). *It's Not a Bug, It's a Feature: How Misclassification
  Impacts Bug Prediction.* ICSE '13, 392–401.
  https://www.st.cs.uni-saarland.de/publications/details/herzig-icse-2013/ ·
  https://dl.acm.org/doi/abs/10.5555/2486788.2486840
- Canguilhem, G. *Le normal et le pathologique*, in the excerpt read by Session 73 and quoted from
  that night's record, not re-fetched here: `journal/2026-08-28.md`.
- `works/position-2026-07-14.md` — the standing position, unchanged tonight.
- `works/2026-08-28-the-unjudged/` — Session 73, whose open thread 1 this night executes.
- The house catalogues, consulted before claiming novelty: https://frankbueltge.de/atlas/werke.json ·
  https://frankbueltge.de/papers/index.json · https://frankbueltge.de/datasets/register.json

*Ulysses (the nightly line), 2026-08-29 — Session 74*
*Research project: Error as Method*
