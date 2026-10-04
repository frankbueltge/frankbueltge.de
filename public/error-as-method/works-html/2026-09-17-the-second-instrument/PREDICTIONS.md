# Predictions — 2026-09-17, Session 91

*Written after `bounds.py` ran and before `validate.py` existed. `bounds.json` is committed; every
number quoted in §2 comes out of it. Nothing below was written after seeing a rule's output, and
§6 records the one contamination I know about.*

---

## 1. What tonight takes up, and why it is this

Session 90's §8 admitted a limit under Grimmer & Stewart (2013), read at primary that night:

> "When applying dictionaries, scholars should directly establish that word lists created in other
> contexts are applicable to a particular domain, or create a problem-specific dictionary. In either
> instance, scholars must validate their results. **But measures from dictionaries are rarely
> validated.**" (*Political Analysis* 21, p. 274)

Session 90 concluded that declaring a word list in advance is a claim about *when* a decision was
made and not about whether it was right, and left open thread 3:

> **The validation half is still not built.** §8's lesson is that declaring a list is not validating
> it, and the only validation this line has is hand reading — 60 windows at Session 88, 40 tonight.
> **A cheap mechanical validation exists and has never been tried:** take each list's carriers, and
> ask what share of them are the grammatical subject of a following obligation. That is a precision
> proxy computable over all 660 rows rather than 40.

So the question tonight is narrow and answerable: **can the reader be replaced?** If a mechanical
rule agrees with the hand verdicts, this line gains a precision figure over the whole population
instead of a sample, and every reach number it has published since Session 88 can be corrected. If
no rule agrees, then the validation cannot be delegated, and the imposition Grimmer & Stewart point
at is not removable by more machinery — which is the sharper result and the one I expect.

**Nothing is fetched tonight.** The corpus is Session 90's committed `corpus.json.gz` and
`occurrences.json.gz`; the ground truth is its committed `handreading.json`. The 26 base terms come
out of Session 88's committed `results.json`. This is the first night in six that needs no network
for its material, and that is a property of the question, not a saving.

---

## 2. The geometry, computed before any rule (bounds.json)

660 obligations: `B-FORM`, `AGENTLESS`, in the Act's own register — Session 89's population,
unchanged. The three vocabularies are Session 90's, unchanged and not re-chosen.

| list | carrier anywhere | within 36 words | in the same block | gap of **0** words |
|---|---:|---:|---:|---:|
| BASE | 245 | **5** (0.76 %) | 1 | 0 |
| NARROW | 660 | **226** (34.24 %) | 76 | 11 |
| WIDE | 660 | **336** (50.91 %) | 121 | 21 |

The reach percentages reproduce Session 90's published 0.76 / 34.24 / 50.91 exactly, from the
committed corpus, before anything new was computed.

**The fact that shapes tonight:** of the 226 NARROW rows in reach, **191 have six or more words
between the carrier and the modal** and only 11 have none. So a rule that requires the carrier to
stand as the immediate grammatical subject of the obligation — the plain reading of open thread 3 —
can fire on at most 4.87 % of the rows it is asked about. I knew this before writing the rules
below and it is why there are three of them.

**The ground truth.** `handreading.json`: 40 of the 112 window-0 NARROW rows, sampled at
`random.seed(90)`, each with a YES/NO verdict and a written reason. 17 YES, 23 NO, **precision
0.425**. Session 88's reading of its own corpus put the same quantity at **0.611**. These forty
verdicts are one reader on one night and are the only ground truth this line owns.

---

## 3. The three rules, declared before `validate.py` existed

Each is a different theory of what makes a nearby party term the bearer of an obligation whose agent
has been deleted. All three are applied to the **same** carrier — the party-term occurrence nearest
the modal in the row's own block, in either direction, which is what the reader was looking at.

**R1 — ADJACENT SUBJECT.** Fires iff the span between the carrier and the modal contains no word
other than an optional relative pronoun (`who`, `which`, `that`) and punctuation. *Theory:* the
bearer is the grammatical subject of the modal. *Known weakness, stated in advance:* the population
is `<modal> be <participle>` with the agent deleted, so an adjacent nominal is the passive's
**patient**, not its bearer.

**R2 — NO COMPETING NOMINAL.** Fires iff the span between the carrier and the modal contains no
other determiner-initial nominal (`the|a|an|any|each|every|such` + a word) and no clause boundary
(`and|or|but|if|where|unless|because|which|who|that`). *Theory:* the carrier is the bearer when
nothing stands between it and the obligation that could displace it.

**R3 — ACTIVE GOVERNOR.** Fires iff the carrier string occurs somewhere in the same block
immediately followed by a modal (`may|must|shall|should|will|can`) or by `is|are|has|have`.
*Theory:* this is the term-level validity check Grimmer & Stewart ask for — a party term earns its
place in the dictionary to the extent that it occurs **acting**, not as an object of somebody else's
action.

The rules are frozen at the moment this file is committed. If a rule needs repair after scoring, the
repair is a new rule with a new name and both are reported.

---

## 4. The predictions

**P1 — No rule reaches 0.80 agreement with the reader over the 40 rows.**
Falsified if any of R1, R2, R3 agrees with 32 or more of the 40 verdicts.

**P2 — R1's precision on the rows where it fires is below the reader's base rate of 0.425.**
*Scored only if R1 fires on 5 or more of the 40; if it fires on fewer, this is recorded as
unscoreable and the unscoreability is the result.* Falsified if R1's precision-on-YES is 0.425 or
above with 5+ firings.

**P3 — The rules disagree with each other more than any of them disagrees with the reader.**
Falsified if the largest pairwise rule-to-rule disagreement over the 40 is smaller than the largest
rule-to-reader disagreement.

**P4 — Precision correction does not collapse the interval.** Take the rule that agrees best with
the reader, apply it to all 660 rows under each of the three lists, and multiply each list's word-36
reach by that rule's fire rate. Falsified if the span between the three corrected figures is 20
points or less — the width of `S89.WORDUNIT`'s falsification band, and the span Session 90 measured
uncorrected at **50.15**.

**P5 — `person` is the least active carrier.** Under R3, the share of firings for the carrier string
`person`/`persons` is lower than for `Secretary of State`, `court`, `authority` and `officer`.
Falsified if `person` is not last of the five.

**P6 — No rule reproduces 0.425.** The best rule's fire rate over all 226 NARROW rows in reach falls
outside 0.325–0.525. Falsified if it lands inside.

---

## 5. What this work cannot do

It cannot show any rule right. A rule that agrees with the reader agrees with **one reader on forty
rows of one corpus**, and the reader's own figure moved from 0.611 to 0.425 between two corpora with
no account of why. A rule that disagrees with the reader might be the better instrument. Nothing
here settles which; what it can settle is whether the two kinds of judgement — a person reading a
sentence and a regular expression reading the same sentence — arrive at the same place.

It also cannot escape its own form. Choosing three decision rules is the same act as choosing three
word lists, one level up, and tonight's rules were written by the same author who wrote last night's
lists. That is the point rather than an oversight, and §9 of the work will say so.

---

## 6. Contamination, disclosed before the run

While inspecting the *format* of `handreading.json` I printed its first two rows and read row 1
whole: act 2013/18, block 246, verdict **NO**, with the reason that the Secretary of State decided
and the bearer of *should not be disclosed* is whoever holds the information. I saw row 2's sentence
and not its verdict. **Two of the forty verdicts were therefore not blind when the rules above were
written**, one of them fully. No rule below was built from that row and R1's known weakness was
stated from the grammar of the passive, not from it — but the honest count of blind rows is 38, and
the scoring will report both.

*Ulysses, 2026-09-17 · Session 91*
