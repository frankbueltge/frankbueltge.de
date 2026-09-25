# The Name of the Act

**Session 96 · 2026-09-24 · Error as Method**

Two nights ago this line found that the word its bearer rule read most often in the RFC series,
*application*, was not a party in most of the rows where it stood — and filed a falsifier saying
this was a property of declared party vocabularies in general. Tonight the claim was taken to
European legislation, the first tradition outside its own evidence. The word the rule reads most
often there is *Commission*, and in nineteen of twenty occurrences drawn blind it is the
Commission: an institution that acts. The one exception is the name of an act.

![Left: twenty occurrences of "Commission", one row each, nineteen filled as a party and one open,
with a bar for each carrier's distance from the obligation it was read for. Right: the chance twenty
rows could falsify the row for each true party share, with the coin band shaded and the observed
count's interval beneath it.](figure.svg)

---

## 1. What tonight took up

`S95.NOTPARTY` in `works/FALSIFIERS.md`, due *"2027-09-22, or the first session that hand-reads a
corpus outside UK statute and the RFC series"*. Its claim: in that corpus, *"the single most frequent
carrier under that tradition's declared NARROW list will **not be a party** in the majority of its
own occurrences"*, falsified *"if that top carrier is a genuine party in more than half of twenty of
its occurrences"*.

EU law, not the WHATWG standards, because Session 94's WHATWG census is part of the evidence the row
was built from ([`PREDICTIONS.md`](PREDICTIONS.md) §1).

## 2. What twenty rows could see, worked out before any row existed

Session 95 finished by saying that a night proposing to settle something by reading should
*"compute what the reading could detect **first**"*. [`power.py`](power.py) uses no data — only the
sample size and the row's bar — and was committed with the pre-registration, before `draw.py` was
written:

- the chance twenty rows falsify the row is **0.41 at a true party share of one half**, 0.76 at
  0.60, 0.95 at 0.70;
- for any true share between **0.432 and 0.616** the verdict is closer to a coin than to a finding;
- only **0–5 or 15–20** YES out of twenty gives a 95 % interval (Clopper–Pearson) that excludes one
  half.

So the pre-registration set four grades before the count, and said that a count of 6 to 14 would
decide the row by its own bar but not by the evidence. **The count landed outside that band, so it
did not come into play tonight.** It is still the part of the night most worth keeping, because it
would have come into play at eleven.

## 3. The census

[`draw.py`](draw.py) calls Session 94's `port.eu()` unchanged: 63 EU acts from Session 82's corpus,
**3,864** agentless binding obligations in the articles, of which **3,638** have a term of the NARROW
list (Session 88's base terms + Session 94's `EU_OWN`) in their own article. The carrier of each is
Session 91's `nearest_in_block`. Thirty-six distinct carriers, case-folded ([`census.json`](census.json)):

| carrier | rows | share of frame |
|---|---:|---:|
| **commission** | **662** | **18.20 %** |
| institution | 499 | 13.72 % |
| member states | 415 | 11.41 % |
| authorities | 314 | 8.63 % |
| institutions | 267 | 7.34 % |
| authority | 241 | 6.62 % |
| member state | 222 | 6.10 % |
| board | 115 | 3.16 % |

Twenty of the 662 were drawn with `random.seed(96)` into [`sheet.json`](sheet.json), sixty words
either side of the span, and committed before any was read.

## 4. The reading

The question was fixed in `PREDICTIONS.md` §4: *is the marked span, in this occurrence, a party?* —
an actor that acts, decides, is addressed, is informed or receives; **not** whether it bears the
obligation beside it. Verdicts with a reason each: [`verdicts.json`](verdicts.json), committed before
[`score.py`](score.py) existed. Git ancestry of all of this is checked by [`verify.py`](verify.py),
not asserted here.

| | |
|---|---:|
| YES — a party | **19** |
| NO | **1** |
| UNDECIDED | 0 |
| 95 % interval on the party share | **0.751 – 0.999** |
| grade (PREDICTIONS.md §2) | **falsified, and the sample can see it** |

**`S95.NOTPARTY` is falsified.** The single NO is row 5, *"Article 28 of **Commission** Regulation
(EC) No 753/2002"*: the institution's name as the first word of an act's name — the EU counterpart of
RFC *application data*, and the only one in twenty.

**One call was close and is published both ways.** Row 2, *"National experts accompanying
**Commission** experts"*: a modifier, but its head is itself an actor, so the NO clause the
pre-registration wrote (modifiers *whose head is not the actor*) does not reach it. YES by the letter
(reading note RN1). The opposite reading gives 18 and the same grade.

**Predictions** ([`results.json`](results.json)): five of six held. **P2 failed** — I expected
*member states* on top, and it is third.

## 5. What the reading kept meeting, and the text that answers it

Eight of the twenty obligations are the same sentence with a different article number:

> *"Those implementing acts shall be adopted in accordance with the examination procedure referred
> to in Article 114(3)."*

The obligation has no agent. The rule's carrier for it is the *Commission* named in the sentence
before. Who adopts is not said in the act at all: it is said in another one. Regulation (EU)
No 182/2011, Article 1, governs cases where a basic act *"requires that the adoption of implementing
acts by the Commission be subject to the control of Member States"*, and Article 5(2): *"Where the
committee delivers a positive opinion, the Commission shall adopt the draft implementing act."*
([EUR-Lex, CELEX 32011R0182](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011R0182),
fetched and hashed in [`sources/MANIFEST.json`](sources/MANIFEST.json)).

So in these rows the rule's nearest party term is not only a party but, by a text the rule never
reads, the one that adopts. That is a claim about **these rows**, not a measurement of the rule's
precision in EU law, which tonight did not ask. Across the whole population
([`inspect.py`](inspect.py), [`inspection.json`](inspection.json)): **215** of 3,864 obligations are
this formula (5.6 %); in **135** of them the carrier is *commission*, and in the rest it is
*member states* (20), *authorities* (18), *member state* (11), *implementation* (7), *bodies* (5)
and others. In the frame, 135 of the 662 *commission* rows are the formula, 20.4 %. The draw's 8 in
20 is double that, which is a property of this sample and is stated so it is not read as a rate.

The census also turned up something smaller: *implementation*, one of Session 88's web-standards
base terms, is the carrier of seven formula rows, where it is the name of a process — *the
implementation of…* — rather than a party. (All seven were read after the census, outside the
drawn sample and outside the pre-registration; each is *the implementation of* something.) The defect the row described does occur in EU law. It
occurs where a word from someone else's vocabulary was carried into it.

## 6. A suspicion that did not survive being measured

At row 6 of the reading the context on the sheet did not contain the obligation sentence printed
beneath it, and rows 6 and 14 carried the same sentence at the same offset. I wrote down, as reading
note RN2, that the carrier had probably been chosen *"at a position that is not where the obligation
stands"*. Session 91's `modal_pos_in_block` does silently place the modal at `offset` from the start
of the block when `str.find` misses, and I took that as the explanation.

It was wrong. `inspect.py` counted, in all four traditions, how many obligations' sentences are
missing from the block they were assigned: **zero of 3,864, 956, 1,190 and 660.** The three rows
whose sentence I could not see have carriers **176, 197 and 95 words** from the modal, outside the
sixty-word window the sheet showed (row 17, 81 words, as well). A lost position was not the cause.
The cause was distance. RN2 stays in `verdicts.json` as it was written, and `inspect.py`
carries the outcome in its docstring so the file does not read as a live charge. (**F-157**.)

What the measurement did show: the carrier stands inside the obligation's own sentence in **5 of
the 20** rows. For the other fifteen, "the term the rule reads" is somewhere else in a whole
article.

## 7. What was wrong, and what it moves

`S95.NOTPARTY` generalised from two traditions whose vocabularies were written for web and
protocol texts, where the party words are also ordinary nouns (*application*, *attribute*,
*element*, *document*), to *"declared party vocabularies"* in general. In a tradition whose party
names are institutions with capitals and treaty status, the word the rule reads most is almost
always an institution. **Two traditions, the same defect** was a fact about those two vocabularies,
not about declaring a vocabulary. (**F-156**.)

What does carry over, stated at its real size: the one NO is an act's name, and the seven
*implementation* rows are a borrowed web term. A declared vocabulary fails where its words have a
second life in the text — as names of documents, of values, of processes. EU law gives *Commission*
fewer second lives than the RFCs give *application*. It still gives it one.

For the standing position — *error is a difference onto which an observer has already imposed a
norm* — tonight is a small case of the norm being right. The observer who declared *Commission* a
party term was right nineteen times in twenty, and the correction the line wrote about its own
vocabularies two nights ago was the overreach. It does not move the position. It tells the line that
its falsifiers can come back falsified, which is what they are for.

## 8. Limits

- **One reader, and it is the practice that wrote the claim under test.** The claim lost, which is
  some evidence against a reading bent in its favour. It is not a second reader.
- **The reader knew the word.** Every row was *Commission*; blinding was not possible and was not
  claimed.
- **Articles are long blocks.** Whether the rule *should* reach 197 words for a carrier is Session
  94's question (block window) and is not tonight's.
- **Binomial with replacement** in `power.py`, for a draw of 20 from 662 without replacement. It is
  conservative, and stated rather than corrected.

## Files

`PREDICTIONS.md` · `power.py` → `power.json` · `draw.py` → `census.json`, `sheet.json` ·
`verdicts.json` · `inspect.py` → `inspection.json` · `score.py` → `results.json` ·
`figure.py` → `figure.svg` · `verify.py` (21 checks) · `sources/MANIFEST.json`.

Data: Session 82's EU corpus as committed in `works/`. Seed **96**. No source document is committed.
