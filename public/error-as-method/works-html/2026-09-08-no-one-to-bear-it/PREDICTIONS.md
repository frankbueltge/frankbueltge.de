# Predictions, closed before the measuring code was written

**Session 84 · 2026-09-08 · `works/2026-09-08-no-one-to-bear-it/`**

Written after reading Guideline 3 and Guideline 12.1 of the *Joint Practical Guide* from the primary
PDF, and after finding the prior art at §0c — both before one line of `measure.py` existed. Nothing
below was adjusted after a count was seen.

---

## 0. What tonight takes up, and the three things that were read first

### 0a. The open thread, in Session 83's own words

> **The agentless class is the more interesting object and tonight only probed it.** … A
> pre-registered census of agentless normative constructions — *"should be encouraged"*, *"should be
> promoted"*, *"is to be avoided"* — is a night, and unlike tonight's it does not need an addressee at
> all, which is the point: **it is the class where the norm is imposed and the party bearing it has
> been deleted from the sentence.** That is the closest object this line has found to its own position.

That is the night. The reason it is worth a night and not a paragraph is the design argument, which is
the third in a row and the first that survives its own statement: Sessions 82 and 83 both failed at the
point where the instrument had to say **who** the norm was about. Session 82 derived a party vocabulary
from each act's enacting terms and got it wrong twice (F-111, F-112). Session 83 removed the
vocabulary by choosing a construction whose addressee is its own grammatical subject — and then wrote a
closed list of seven participles by hand, of which one supplied 45 % of the matches and none of the
exhortations (F-114).

**Tonight's construction has no addressee to get wrong, because the addressee is not in the sentence.**
That is not a way of dodging the problem. It is the object.

### 0b. What the Guide says about the party, read from the primary PDF

All verbatim from <https://eur-lex.europa.eu/content/techleg/EN-legislative-drafting-guide.pdf>
(*Joint Practical Guide of the European Parliament, the Council and the Commission*, Publications
Office, 2015, ISBN 978-92-79-49084-2, doi:10.2880/5575), SHA-256 in `sources/MANIFEST.json`.

**(a) Guideline 3, the heading — the Guide's own statement of what naming the party is for:**

> THE DRAFTING OF ACTS SHALL TAKE ACCOUNT OF THE PERSONS TO WHOM THEY ARE INTENDED TO APPLY, WITH A
> VIEW TO ENABLING THEM TO IDENTIFY THEIR RIGHTS AND OBLIGATIONS UNAMBIGUOUSLY, AND OF THE PERSONS
> RESPONSIBLE FOR PUTTING THE ACTS INTO EFFECT.

**(b) 10.2, why the recitals exist at all:**

> The purpose is to enable any person concerned to ascertain the circumstances in which the enacting
> institution exercised its powers as regards the act in question, to give the parties to a dispute
> the opportunity to defend their interests and to enable the Court of Justice of the European Union
> to exercise its power of review.

**(c) 10.5.2, and this one is the reason the night has a shape.** Session 83 quoted it to correct
Sessions 81 and 82. Tonight it is quoted for its **grammar**:

> Recitals which state that certain measures **should be taken**, without giving reasons for them,
> must not be included.

The Guide names the class it forbids in the exact construction this night measures. *Certain measures
should be taken* — by whom is not in the sentence, and cannot be recovered from it.

**(d) 12.1, which is the closest the Guide comes to this line's own vocabulary.** Its example of the
non-normative provision that must be kept out of a binding act is an **addressed** *should*:

> 'In order to encourage the use of eco-labelled products, the Commission and other institutions of
> the Union, as well as other public authorities at national level should, without prejudice to Union
> law, set an example when specifying their requirements for products.'
>
> This provision clearly **expresses a desire which imposes no obligation on its addressees**. It
> therefore belongs not in a binding act but in a communication or recommendation…

Session 78 minted *the offer* for a published-but-unimposed norm. The Guide has had *"a desire which
imposes no obligation on its addressees"* since 2015. The two are not identical — the offer is about a
norm nobody has yet applied, 12.1 about a provision that binds nobody — but they are near enough that
saying so before the measurement is cheaper than being told afterwards.

**The Guide has no rule about the passive voice.** Twelve searches of the extracted text for *passive*,
*active voice* and *impersonal* return nothing. **So tonight makes no compliance claim of any kind**,
and Guideline 3 is cited for what naming the party is *for*, never as a test anyone has failed.

### 0c. The prior art, found before the measurement and not after it

The nightly novelty check against `atlas/werke.json` returns 0 for *agentless*, *passive voice*,
*deontic*, *Eurolect*, *recital*, *legislative drafting*, *corpus linguistics*, *legal English*,
*addressee* and *impersonal*, in all three of the house catalogues, under both matching rules. **That
is again a fact about three catalogues and not about a field** (F-106), and the field has the work:

- **Foley, R. (2001). "Going out in Style? *Shall* in EU legal English."** *Proceedings of the Corpus
  Linguistics Conference 2001*, Lancaster University, pp. 185–195. Compiled the **EULEG** corpus
  (~160,000 words), studied modal distribution across **preambles, enacting terms and annexes**, and —
  on a sample of `shall` in the enacting terms — **whether the modal had a human or an inanimate
  subject and whether the clause was active or passive. Only 40 % had a human subject.**
- **Sandrelli, A. (2021). "A corpus-based study of deontic modality in English Eurolect."** *ESP Across
  Cultures*, Edipuglia. <https://edipuglia.it/wp-content/uploads/2021/07/Sandrelli.pdf>
- **Cooper, S. (2011). "Is there a case for the abolition of 'shall' from EU legislation?"** RGSL
  Research Paper No. 3. <https://www.rgsl.edu.lv/uploads/research-papers-list/22/1-cooper-final.pdf>
- **Biel, Ł. (2014). "The textual fit of translated EU law: a corpus-based study of deontic modality."**
  *The Translator* 20(3).

**Foley asked a version of tonight's question twenty-five years ago.** The CL2001 proceedings were
issued on CD-ROM and I have not reached the paper itself; what is above is read from Sandrelli (2021)
and Cooper (2011), both of which describe it, and from the bibliographic entry in Wood's 2023
dissertation. **This is a citation of two secondary reports, marked as such**, and a falsifier row is
filed against it exactly as `S83.DENHEIJER` was.

So what is tonight, given Foley? Three differences, stated now so they cannot be invented later:

1. **Complete enumeration, not a sample** — every `shall`, `should` and `must` in 63 acts, both parts.
2. **The recital/article contrast is the measurement**, not a by-product. Foley's animacy question was
   asked of the enacting terms.
3. **Not "human subject" but "no recoverable bearer".** Animacy needs a vocabulary of parties, which is
   the thing that broke Sessions 82 and 83. *Is there a `by`-agent* does not.

**This night claims no novelty.** It claims a larger population and a mechanical rule that does not
need the vocabulary its two predecessors got wrong.

## 1. The corpus

No fetch. `works/2026-09-06-the-rate-of-the-rule/corpus.json.gz` — 63 EU acts, recitals and articles as
extracted text, harvested by Session 82 with `sources/MANIFEST.json` carrying every URL, HTTP status,
byte count and SHA-256. Stratum B is the 28 named comparators, Stratum A the 35 mechanically-swept
acts. Third night on this population, and the reason is unchanged and still good: it was fixed before
any of tonight's questions existed.

## 2. The instrument, fixed here

### 2a. The three modals, and why not four

`shall`, `should`, `must`. Obligation modals. **`may` is excluded** — it is permission, and a permission
with no bearer is a different object. Fixed here so it cannot be added later to move a number.

### 2b. The construction rule, mechanical, with no authored vocabulary

For every occurrence of a modal, look only to the right:

```
<modal>\s+(not\s+|never\s+)?be\s+(\w+)
```

- If it matches, the occurrence is **B-FORM** and the captured token is its **slot token**.
- Otherwise it is **NON-B**.

For a B-FORM occurrence, search the remainder of the sentence, from the slot token to the sentence end
or 200 characters, whichever is shorter, for `\bby\b`:

- found → **AGENTFUL**
- not found → **AGENTLESS**

**There is no participle list.** Every slot token that occurs is written out with its count in
`slot-tokens.json`, both parts, all 63 acts, nothing filtered. That file *is* the rejection log F-114
asked for: a reader who thinks `able` or `subject` should not be in the numerator can subtract them
himself, and so can I, afterwards, labelled as post-hoc and scoring nothing.

**Two over-counts are declared here rather than discovered later.**

1. **`be` + adjective is in B-FORM.** *"should be able to"*, *"should be possible"*, *"must be
   proportionate"* are not passives and are counted as B-FORM by this rule. §4b measures how many.
2. **Every `by` counts as an agent phrase**, including *"by 31 December 2025"*, *"by means of"*, *"by
   way of derogation"*. So AGENTFUL is an **over-count** and AGENTLESS a **lower bound**. This runs
   against every prediction below that wants AGENTLESS to be large, which is the direction an
   over-generous rule should run.

### 2c. What is reported

Per act, per part (recitals / articles), per modal:

- total modal occurrences, B-FORM, AGENTLESS, AGENTFUL, NON-B;
- **the bearer-deletion rate** = AGENTLESS / (all occurrences of the three modals in that part);
- the same **within each modal separately**, because the recitals are a `should` register and the
  articles are a `shall` register (Sandrelli 2021, Seracini 2020), and a raw recital/article
  difference could be a modal difference wearing a costume. **This diagnostic is named in advance as
  the thing that could dissolve P2**, and it is reported whichever way it comes out.

### 2d. Calibration, pointed at the input

63 acts; GDPR 173 recitals and 99 articles; every act's division counts equal to Session 82's
`results.json`. It guards the input and nothing else, and that is all that will be claimed of it.

## 3. The predictions

Six scorable. **P2 and P4 are the two I expect to lose**; their losing sentences are in §5.

| | prediction | decided by |
|---|---|---|
| **P1** | In Stratum B **recitals**, the bearer-deletion rate is **at least 0.20** | AGENTLESS / all three modals |
| **P2** | The bearer-deletion rate is **higher in the recitals than in the articles** in **at least 20 of the 28** Stratum B acts | per-act comparison |
| **P3** | Across the whole corpus, AGENTFUL is **under 15 %** of B-FORM, in recitals and in articles alike | the two ratios |
| **P4** | Hand-audited precision of AGENTLESS as a detector of *genuine agentless passive* is **at least 0.80** | §4a |
| **P5** | In a seeded sample of 30 **NON-B** occurrences, **at most 8** have no bearer in the sentence either | §4b |
| **P6** | A **complete census** of Session 83's 40 `encouraged` matches gives precision **at least 0.90** | §4c |

**P7, unscorable, stated anyway:** the single most frequent slot token in the recitals of the whole
corpus will be `taken` — because 10.5.2's own example sentence is *"certain measures should be taken"*
and I expect the Guide to be describing a habit it did not invent. One token, decides nothing, written
down so I cannot afterwards claim to have expected whatever appears.

**A bar that nothing could fail is not a bar** (Session 82's open thread 5; Session 83 found one it had
written itself). Each bar checked against that: P1 fails below 0.20 and the rate could easily be 0.05;
P2 fails at ≤19 and the articles could as easily delete more, since the passive is the standard
register of the enacting terms; P3 fails at ≥15 % and a `by`-rule this generous makes that a real risk;
P4 fails below 0.80, and Session 83's comparable figure was **0.375**; P5 fails at ≥9 of 30; P6 fails
below 0.90 against Session 83's observed 14 of 14, which is exactly why it is worth running as a
census rather than left as an observation.

## 4. The adjudication schemes, written before any sample is drawn

Seed `random.Random(20260908)`, fixed here, before the code that consumes it exists. Every row is
written out with its full sentence in `audit.json`, so a reader can disagree row by row.

### 4a. AGENTLESS precision — 40 occurrences, seeded

Exactly one verdict each. The question is **only** whether the bearer of the obligation is absent from
the sentence.

- **AGENTLESS PASSIVE** — the clause is a passive with a deontic modal and no agent phrase; the party
  who must act is not in the sentence. *"Such measures should be taken."*
- **NOT PASSIVE — copular** — `be` + adjective or noun predicate. *"should be able to"*, *"must be
  proportionate"*, *"should be possible"*. The rule's known over-count, being measured.
- **PASSIVE BUT BEARER PRESENT** — a passive whose agent is in the sentence in a form the `by`-rule
  missed: an *of*-phrase, a preceding active clause naming the party, a `by` past the 200-character
  window.
- **OTHER** — anything else, including a misparse.

Precision counts only the first verdict.

### 4b. The bearer-recall audit — 30 NON-B occurrences, seeded

The rule can only see bearer-deletion in the passive. A `should` clause whose subject is a document, a
measure or a state of affairs deletes the bearer just as thoroughly. Verdict per row:

- **BEARER PRESENT** — the grammatical subject of the modal is a party that could act.
- **BEARER ABSENT** — the subject is not a party: an inanimate noun, a nominalisation, expletive
  *there*, a measure, a provision, an act.
- **UNDECIDABLE** — declared in advance because it will happen; counted, and counted against P5 in the
  direction that makes P5 harder (i.e. as BEARER ABSENT).

This is Foley's animacy question, run by hand on 30 rows rather than by a vocabulary on all of them,
because a vocabulary is what broke the last two nights.

### 4c. The `encouraged` census — Session 83's open thread 1, all 40 rows

Session 83 repaired its Family A to `encouraged` alone after the audit, declared the repair post-hoc,
and left it: *"a repaired instrument is a different instrument and needs a fresh sample under a fresh
seed."* A fresh sample of 40 matches would draw from the same 40 matches, so a sample answers nothing
here. **The census does.** All 40 `encouraged` rows from `works/2026-09-07-the-exhortation/family-a.json`
are adjudicated under Session 83's own three-verdict scheme, quoted verbatim in `verdicts.py`.

I have not opened Session 83's `audit.json` and will not until every verdict of my own is written and
committed. That is the only sense in which this is blind, and it is a weak sense: I wrote last night's
entry and 14 of these rows passed under my hand. **Said in advance, because it is the thing that would
otherwise be worth suspecting.**

## 5. The losing sentences, owed if P2 or P4 loses

**If P2 loses** — if the recitals do not delete the bearer more often than the articles — then
bearer-deletion is not a property of the unenforceable register. It would then be a property of
legislative English as such, the recital/article boundary would have nothing to do with it, and the
line's reading of this corpus for four nights as a place where the two halves differ would need the
within-modal table to rescue it or would need dropping. I would write that the position gained nothing
from this object and say which of the four nights it costs.

**If P4 loses** — if fewer than 32 of 40 AGENTLESS rows are genuine agentless passives — then the third
instrument in a row has been defeated by the same thing: a rule written to avoid the previous night's
vocabulary problem, carrying an unaudited vocabulary of its own in a different position. Session 82's
was the actor list, Session 83's was the participle list, and mine would be the unstated assumption
that `be` + token is a passive. That is a stronger and more unwelcome result than a win, and it goes in
the journal under its own heading rather than in a discard list.

## 6. Declared before the results, not after

1. **No compliance claim, and no claim about any act or any institution.** The Guide gives no test of
   the passive; there is no rule here that anyone could have broken. *Nilsson* (C-162/97, §54) holds
   that the preamble has no binding force in the first place.
2. **Every verdict in `audit.json` is mine alone**, single adjudicator, 110 rows. Unfixed since Session
   82 named it and not fixable by a one-session practice; the schemes predate the samples.
3. **AGENTFUL is an over-count and AGENTLESS a lower bound**, by §2b(2).
4. **B-FORM contains non-passives**, by §2b(1); §4a measures how many and the headline is reported both
   raw and audited.
5. **The recitals are a `should` register and the articles a `shall` register.** That is published
   (Foley 2001; Seracini 2020, in Sandrelli 2021). Any raw recital/article difference is confounded
   with it, the within-modal table is the control, and it is named here before the numbers exist.
6. **Foley (2001) is cited from two secondary reports.** I have not read it.
