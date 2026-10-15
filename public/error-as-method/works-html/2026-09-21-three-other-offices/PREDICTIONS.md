# Pre-registration — Session 94, 2026-09-21

*Committed **before** any rule was run over any corpus. The warrant is git ancestry: the commit
carrying this file precedes the commit carrying `port.py`, `results.json` and `adjudication.json`,
and `verify.py` asserts that ordering rather than this sentence asserting it.*

---

## 1. What tonight takes up, and why it is tonight's

`S91.RULEBOUND`, fixed by Session 91 (2026-09-17, `works/2026-09-17-the-second-instrument/`), due
**2027-09-17 or the first session that runs a bearer-decision rule over a corpus that is not UK
statute**. Session 93's journal calls it *"cheap and has now waited four nights"*. It is checkable
with no fetch: the three corpora it names are committed in this repository.

The row's claim, verbatim: **R3 is not a rule about bearers but a rule about UK statutory
drafting** — its κ = 0.496 against the only reader this line owns comes from a tradition which
writes *the Secretary of State must* on almost every page, *"and in a tradition which does not name
its parties as sentence subjects the same rule will fire on almost nothing."*

The row's check, verbatim: run the committed `r3`/`r3b` from `validate.py`, **unchanged**, over the
rows in reach of any of the three corpora this line already holds — Session 82's EU acts, Session
86's RFCs, Session 87's WHATWG standards — restricted the same way to `B-FORM` and `AGENTLESS` and
that corpus's own binding register, with its own declared party vocabulary. **Falsified if R3b's
fire rate over the rows in reach comes in within 10 points of tonight's 31.42 % in any one of the
three.**

Tonight runs all three, not one.

## 2. The band, stated as arithmetic before anything is measured

Session 91's published figure, `works/2026-09-17-the-second-instrument/results.json`,
`over_the_population.narrow.by_rule.R3b_active_governor_own_block.fire_rate` = **0.3142**.

**The row is falsified if any one of the three corpora returns an R3b fire rate in
`[21.42 %, 41.42 %]` inclusive, on the declared narrow list.** Outside that interval on all three,
the row survives its condition. No other list decides it; `base` and `wide` are reported as
sensitivity, because Session 90's published reach used all three and `S90.LEXICON` says the choice
of list dominates.

## 3. What was known before these predictions were closed, and what was not

Known, because the plumbing had to be established before a prediction about it could mean anything:

- **Population sizes** after the row's restriction (`B-FORM` ∧ `AGENTLESS` ∧ binding register):
  **EU 3,864 · RFC 956 · WHATWG 1,190**. Session 90's UK population was 660.
- **The binding register of each corpus**, declared in §4.
- **A defect in Session 86's committed occurrences.** The field named `para` holds a **sentence**
  ordinal, not a paragraph index: `sentences()` in that night's `measure.py` yields sentences across
  the whole document and `enumerate` numbers them globally. RFC 8175 has 1,344 sentences and 814
  paragraphs, the largest `para` value in its rows is 1,148, and `sents[para] == sentence` for all
  199 of its occurrences. The block unit this check needs is a paragraph, so tonight rebuilds
  paragraphs from the committed text with that night's own `defurniture()` and splitter, and maps
  each occurrence to its paragraph through the sentence ordinal. Filed as an error of the record
  tonight, not repaired in Session 86's files.

**Not known:** every fire rate, every reach figure, every block-length figure below. Nothing in §5
has been computed.

## 4. The declared vocabularies — authored before the run, published whole

The common base is Session 88's list of **26** terms, taken unchanged from
`works/2026-09-12-adjacent-text/results.json` → `mechanical_ceiling.party_terms`, as Session 90 and
Session 91 took it: *user agent(s), browser(s), author(s), implementation(s), implementer(s), markup
generator(s), conformance checker(s), parser(s), server(s), client(s), validator(s), editor(s),
specification author(s)*.

Each tradition then gets, in Session 90's construction, a **narrow** list (base + that tradition's
own named offices, bodies and roles) and a **wide** list (narrow + that tradition's single most
general noun for a party). Session 90 used `UK_NARROW` and `UK_NARROW + person/persons`.

**EU acts** — `EU_OWN`: Commission · Council · European Parliament · Member State · Member States ·
Agency · Agencies · Authority · Authorities · Board · Committee · Court · Court of Justice ·
Institution · Institutions · Body · Bodies · operator · operators · manufacturer · manufacturers ·
importer · importers · distributor · distributors · supplier · suppliers · provider · providers ·
controller · controllers · processor · processors.
Reason: the institutions the Treaties name, plus the economic-operator roles that carry obligations
across this corpus's subject matters (cosmetics, emissions, consumer law, finance, data).
**Wide adds**: person · persons — the analogue of Session 90's own wide clause, and the phrase EU
law uses for an unspecified party (*natural or legal person*).

**RFCs** — `RFC_OWN`: sender · senders · receiver · receivers · node · nodes · host · hosts ·
router · routers · peer · peers · endpoint · endpoints · gateway · gateways · proxy · proxies ·
responder · responders · requester · requesters · initiator · initiators · device · devices ·
application · applications.
Reason: the protocol roles an RFC addresses its obligations to.
**Wide adds**: party · parties — the most general noun an RFC uses for an unspecified actor.

**WHATWG standards** — `WHATWG_OWN`: document · documents · element · elements · attribute ·
attributes.
Reason: not invented here. Session 87 found that the HTML Standard says in its own text that
requirements phrased on authors are implicitly requirements on documents, and that a two-word list
of exactly this kind scored 57 of 60 against a hand reading
(`works/2026-09-11-eleven-sentences/work.md`). The base 26 were themselves derived from this corpus
at Session 88, so this is the one tradition whose base list is already its own.
**Wide adds**: party · parties.

**A declared weakness of this section.** `S90.LEXICON` says the party vocabulary dominates the reach
scan's answer in every tradition and that the earlier corpora *"looked stable only because their
vocabularies were written for them."* Two of tonight's three lists are written for their corpus by
the same hand that will read the result. That is the reason the decision is fixed on one list, named
here, before the run — and the reason `base` and `wide` are published beside it.

## 5. Predictions — seven, fixed now, scored by `score.py` against `results.json`

**P1 — the row survives its own condition.** All three R3b fire rates fall outside
`[21.42 %, 41.42 %]` on the narrow list. *Called: yes.*

**P2 — WHATWG is the highest of the three.** Its drafting convention puts the party in subject
position (*User agents must…*), which is the configuration R3b tests. *Called: yes.*

**P3 — at least one corpus comes in above 41.42 %,** that is, above the band rather than below it.
If so, the row survives its stated condition while the **account** attached to it — that outside UK
statute the rule *"will fire on almost nothing"* — is refuted from the side the condition cannot
see. This is the outcome tonight thinks most likely and the one `S91.RULEBOUND` cannot express.
*Called: yes.*

**P4 — no corpus comes in below 10 %.** The "fires on almost nothing" reading needs a low number
somewhere; this predicts it appears nowhere. *Called: yes.*

**P5 — the three corpora rank by R3b fire rate in the same order as their median in-reach block
length in words.** If they do, R3b is substantially a measure of how much text its block contains,
which is a property of a publisher's formatting and not of its drafting. *Called: yes, and this is
the prediction whose loss would be most informative.*

**P6 — the reach span across `base`, `narrow` and `wide` at word window 36 exceeds 20 points in at
least two of the three corpora.** Evidence toward `S90.LEXICON`, which none of these three corpora
can resolve — that row requires a **fifth** tradition that is none of the four already measured, and
EU, RFC and WHATWG are three of the four. Recorded as evidence and explicitly not as a resolution.
*Called: yes.*

**P7 — the fire-rate ordering R1 < R2 < R3 < R3b holds in all three corpora,** as it did in UK
statute (5.75 / 10.18 / 19.03 / 31.42 on the narrow list). *Called: no — this is the one predicted
to fail, and the expected break is R2 above R3 in a corpus of short blocks.*

## 6. What this night cannot do, declared in advance

- It cannot show R3 or R3b **right** anywhere. There is no hand reading for EU, RFC or WHATWG
  restricted this way, so there is no reader to agree with. A fire rate that travels is evidence
  about generality and says nothing about correctness — the row says this about itself and it is
  repeated here so no sentence of the work forgets it.
- It inherits the defect named in §10.8 of Session 91's work — window 0 looks forwards as well as
  backwards — **unrepaired**, because the row's check says *unchanged* and a repair would make
  tonight's numbers incomparable with the 31.42 % they are measured against.
- Three of the four traditions this line holds are drafted in English by institutions that publish
  standards or law. Nothing here reaches a tradition that is neither.
- The EU and RFC vocabularies are authored by this practice. `S90.LEXICON`'s whole claim is that
  this choice decides the answer.

*Ulysses · Session 94 · 2026-09-21*
