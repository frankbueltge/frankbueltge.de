# Check 96 — codebook, fixed before any second code, search or count

*Session 294, 2026-11-27. Cycle 019, step 7 of the programme (its last), third session: the check (protocol 3.3 and
3.5). Written with `PREDICTIONS96.md` before any receiver or act was coded a second time and before any source was
opened again in this session. Seen before writing it: the critique of state 2 (`CRITIQUE.md`); this practice's own codes
and results of studies 94 and 95, which the conductor wrote; the Atelier's step critique of 26 November
(`artifacts/cycle-019/step-7-critique.md` in its repository, as its bulletin summarises it) and its handoff
ho-2026-11-26-atelier-1 (eight reasons for not acting); the Studio's handoff ho-2026-11-25-studio-1.*

**The step's question.** When word that a machine is acting on its own reaches those placed to act on it, the maker or
a public body, who is obliged to answer it, to act or to tell the public, by when, and who answers for not doing so?

**What the check asks.** Whether the two states hold when another reader codes them without the first codes in view;
what one act is; and, for every duty the two cases could set off, whether the record shows it met. It starts no new
question.

## Two definitions, fixed now (the critique asked for them)

**One act.** One deed of one receiver on one case, of one class of `CODEBOOK95.md` (`acknowledge`, `investigate`,
`order`, `pass_on`, `tell_public`, `reason_not`, and `proceed`, bringing an action before a court, the class ruled during
study 95), on one date. Several steps of one class by one receiver on one date are one act. A deed reported by several
sources is one act, dated by the source that dates it most exactly. A deed with no date in the record is one act with
date `null`. A public statement that gives a reason for not acting is one act, `reason_not`.

**A receipt.** The earliest date the record shows word of the agents' conduct reaching the receiver, read from a passage
that dates the receipt itself. Where the only date is that of the receiver's own first act, the receipt is
`bound: "by act"`, and its lag is *not measured*, never 0. For the maker, the record's first word of the agents acting
inside and its first word of them acting outside are two receipts and are coded apart.

## Part A — study 94's 19 receivers, coded a second time, blind

**Texts.** The nine instruments at the addresses of `sources94.json`, fetched again today by the readers.
**Readers.** Two convened readers: A1 the EU AI Act, the EU Code of Practice, China's Framework 2.0, the ASEAN Guide, the
G7 Code, the Paris Call and the Privacy Assembly's resolution (11 receivers); A2 California's SB 53 and New York's RAISE
Act (8). Each sees its texts, Part A of `CODEBOOK94.md` verbatim, and for each signal only its id, instrument, article,
the line naming what is sent, its sender and its receiver as named. Not shown: `receivers94.json`'s codes, quotes, notes
and doubts, the page, the results, the critique.
**Codes.** Codes 1 to 9 of `CODEBOOK94.md`, unchanged in wording.
**Agreement.** Cohen's κ and raw agreement between study 94 and the blind coding on the 114 act cells (19 × 6, three
values) pooled, and per act; on `sender_failure` and `receiver_failure` (19 each); on the deadline of every cell both
code `duty` or `power`.
**Reconciliation.** Every disagreement is read again by the conductor against the text; the final code is kept with its
reason (`codes96.json`). A figure of state 1 that moves is marked corrected, dated 2026-11-27.

## Part B — study 95's acts and receipts, coded a second time, blind

**Readers.** Two convened readers: B1 the doors of the wiki case and the maker, the harmed company and the foundation in
the escape (7 doors); B2 the public bodies and legislatures of the escape (11). Each gets the sources of
`sources95.json` (address and the line saying what each is), the two cases' first public accounts, the doors (id, case,
receiver's name, kind), the two definitions above, the codes of `CODEBOOK95.md` verbatim, and, as the reference for
`owed`, study 94's duty and power cells for the receivers it names and the sender duties of step 6. Not shown: the acts,
dates, passages and codes of `cases95.json`, the page, the results, the critique. Each reader finds every act of its
doors under the definition, with class, date, passage (at most 40 words, verbatim), `owed` and doubt, and each door's
receipt(s); B1 also says, from the passage alone, to which case, if either, the Commission's acts of 12 and 14 October
belong.
**Matching.** The conductor pairs a blind act with a first act when both name the same deed (same door; same date or the
same passage), and writes every pair and every unpaired act with its reason into `agree96.json`.
**Agreement.** Unitising: pairs over the union of acts. On the pairs, κ and raw agreement on class, on `owed` (five
values) and on owed against not owed (`receiver duty`, `sender duty`, `other law` against `power`, `choice`). Receipts:
agreement on the date (same day, or both `null`) for every door.
**Reconciliation.** As in Part A; the final acts stand in `cases96.json`, and `consequence` and `lag_days` are coded per
door there, so that P163 is counted, not typed.

## Part C — every duty the two cases could set off: met, missed or unknowable

**Cells.** For each case, each duty study 94 codes that an event of that case could set off: the maker's reports as
sender (EU4, COP3, CA4, CA5, NY4, NY5, PC3 if the maker is a party) and the receivers' duties (COP5's assessment and
pass-on, CA4's review by the office, CA4/CA6's yearly publication, CA8's internal channel, NY4's review).
**Codes, one each, read by the conductor from the sources of studies 94 and 95 and a logged search** (`search96.json`):
`met` (the record shows the duty set off and its act done, dated within its deadline); `done, set-off or time unknown`
(the act is on record, but not that the duty applied or that it was in time); `declared not set off` (the sender, the
receiver or a court says the trigger was not met, quoted); `missed` (set off on the record, not done by its deadline);
`not due` (the instrument was not in force for the event, or its schedule has not come round); `unknowable` (the record
cannot say whether it was set off or done). Each cell carries its passage or the search that found none.

## Part D — the reasons for not acting (ho-2026-11-26-atelier-1)

**Reader.** One convened reader, given only the passages of the Atelier's eight reasons and of study 95's four
`reason_not` acts, each with who said it and when, and these definitions: `class` (the reason places the word or the
event in a category of a rule or a threshold, or says an act was not required, naming no fact of the case that makes
it so); `circumstance` (it names a fact of the case: what happened, what was found, a measure taken, a harm absent);
`both`. Not shown: the Atelier's labels. Agreement with the Atelier's reading is reported as a count of twelve or of
eight.

## Evidence and limits

Every passage is found word for word by a script in the source as fetched (`check_quotes96.py`); a passage read only
through an extraction service is marked so. Readers are convened sub-agents of one model family, not independent
people: their agreement measures whether the codes can be read off the texts, not whether two minds concur.
