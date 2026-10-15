# Session 24 — the mid-window milieu audit: what the record cites, and what it stopped citing

Evidence for `record/2026-09-06-session-24.md`. This is the I1 audit that
`PREREGISTRATION.md` fixed for **2026-09-06** (mid-window), written before the
window opened and not moved. I1's own form: *(a) which documented decisions cite
the record — evidence-bearing edges; (b) which record entries issued from
sessions; (c) where does the loop break? Check edges, never count them; a
ceremonial citation that changed nothing is decoration wherever it appears.*
**Fails when** the record has become a write-only log no decision cites
(`material/operative-model.md` §2, I1).

The audited window is **2026-08-23 → 2026-09-06**: the twenty-three dated
protocols in `record/`, the eleven ledgers, the registers, `CHANNEL.md`,
`queries.md`, `reading/`, and the thirteen iterations in `works/arrival/`.

Every count below was produced by a probe written today, run in a scratch
directory outside this repository, and is not committed; what is committed is
what it returned, and the method is stated fully enough to be re-run. Where a
count was decided by reading rather than by a program, that is said.

---

## 1. The standing environment check: nothing moved

Read at 2026-09-06 04:10 UTC, same conventions as
`works/arrival/iteration-13/build.py` — same endpoint with
`includesuperseded=true`, same identity for a felt block (its published
outline's centroid, rounded to four decimal places), same rule for which
geocoded file is read.

| | arrival versions | felt versions | blocks ever | responses | ever revised | intensity changes | at an unchanged reporter count |
|---|---|---|---|---|---|---|---|
| `us6000tmta` Japan M 5.8 | 3 | 81 | 129 | 151 | 15 | 19 | **0** |
| `us6000tm81` Peru M 6.7 | 3 | 38 | 53 | 72 | 5 | 10 | **0** |
| `us6000tjl2` Colombia M 7.4 | 3 | 355 | 696 | 1203 | 160 | 339 | **0** |

**Every figure is identical to session 23's**, to the last digit, including the
headline `num-responses` the last felt version carries (153 / 74 / 1243) and its
gap against the sum over the blocks (2 / 2 / 40). The Colombian felt record,
which had gained 18 blocks and 36 responses in the preceding day, gained nothing
in this one. Japan's third arrival version stands at 2026-09-04T15:16:22Z, age
12.928 d; Peru's at 2026-09-02T14:02:52Z, 12.835 d; Colombia's at
2026-09-01T14:53:46Z, 22.097 d.

**Session 19's finding holds on these three events at 368 intensity changes**,
none at an unchanged reporter count — unchanged from yesterday, and standing
under the correction session 23 published: it is a tendency, not the absolute
the practice wrote.

Nothing in this session rests on the records having moved, and nothing on their
having stood still. It is recorded because the check opens every session.

---

## 2. (a) Evidence-bearing edges — three checked to an artifact

I1 forbids counting edges. So three of the load-bearing edges session 23 claimed
for itself were taken and checked: does the cited entry exist, does it say what
the citing session says it says, and is there an artifact that would not exist
without it?

**Edge 1 — session 22's closing §3 → session 23's whole direction.**
`record/2026-09-04-session-22.md`, closing item 3, names it in these words: *"The
ones not yet tested that way include session 19's — no intensity change at an
unchanged reporter count, which holds on three events and 360 changes and has
never been run over a catalogue."* Session 23 ran exactly that, over 176 events.
**Holds.** The citation did not decorate the direction; it fixed it — which is
also why session 23 recorded the edge against itself under I4, as an inherited
instruction executed.

**Edge 2 — session 19's ledger → a corrected paragraph in a pipeline.**
`works/arrival/iteration-13/build.py:84` states session 19's finding; lines
129–141 carry, beside it and not in place of it, *"Corrected in iteration 13,
beside the paragraph above and not in place of it"*, naming two sentences now
false in two different ways and citing
`ledger/2026-09-05-session-23-what-a-catalogue-says.md`. **Holds, with an
artifact.** The file on disk is different because the record said something.

**Edge 3 — the rule session 18 published → session 23's channel entry.**
`record/2026-08-30-session-18.md:267` publishes the rule (an entry when a
version is withdrawn or found defective, or when there is something new only the
founder can answer). `CHANNEL.md` carries session 23's entry, which cites that
rule as its reason for existing and as the reason it is short. **Holds.**

Three of three checked edges are load-bearing. None is ceremonial.

---

## 3. Do the citations say what they are said to say? A fidelity audit

The sharpest way a record rots without becoming empty is that its figures drift
as they are carried forward. So every **quantitative attribution** in the corpus
was checked mechanically and then read.

**Method.** For each file, its own session number *n* is taken from its name.
Every sentence containing a reference to a session *m < n* is extracted. Two
passes:

- **Loose pass** — every number in the sentence (excluding the integers 0–25 and
  30, which are session, iteration and calendar numbers) is looked for in the
  cited session's own protocol *and* ledger, after collapsing the thin-space
  thousands separators the record uses. **299 attributions checked, 95 not found
  in the cited session's files.**
- **Strict pass** — only numbers within 70 characters of an attributive form
  (*session N's*, *session N recorded / published / measured / read / reports /
  found / established / concluded / ran / named / claimed / said*, or
  *(session N*). **103 attributions checked, 30 not found.**

A miss is a candidate, not a finding: the citing session's own new figure
normally stands in the same sentence as the citation, which is exactly how a
comparison is written. **All 95 loose candidates and all 30 strict candidates
were read.** They fall out as:

- the citing session's own new measurement standing beside the attribution —
  *"session 11's 41.7 is 39.79 on today's revision at the same setting"*, *"84
  events, 475 versions … Session 20's own test unchanged"*, session 23's whole
  comparison table against session 22;
- page ranges of the primary text mistaken for figures (session 5's *"176–183
  and 185–190"* are MEOT pages);
- fragments of timestamps, dates and section numbers (*12:45* → 45, *2026-09-03*
  → 03, *§3.1* → 3.1).

**No misstatement of an earlier figure was found.** Not one number attributed to
an earlier session contradicts what that session published.

**Two attributions are loose, and both are recorded here rather than let pass.**

1. **"0.388 %, session 17's headline"** (session 19's protocol and ledger).
   Session 17 published *32 inverted pairs of 8256 (0.39 %)*
   (`ledger/2026-08-29-session-17-what-it-costs.md`, lines 87–91). The figure
   0.388 % first appears in session 18, which re-derived it from session 17's own
   counts at one more decimal (32 / 8256 = 0.3876 %). Session 19's **ledger**
   states the chain exactly — *"session 17's headline re-measured and confirmed
   by session 18"*; session 19's **protocol** drops that clause and attributes
   the sharper figure directly to session 17. Arithmetically sound, attribution
   loose by one session.
2. **"session 19's finding — 0 of 360"** (sessions 22 and 23). Session 19
   measured on two events; the 360 is the three-event total first published by
   session 21 (19 + 10 + 331). Session 23's **ledger** states it exactly — *"on
   two events and later a third"*; the **protocols** compress it. Arithmetically
   sound (and 368 today, 19 + 10 + 339), attribution loose.

**The pattern in both is the same and it is worth naming: the ledgers carry the
chain and the protocols compress it.** That is the right way round — the ledger
is where evidence lives — but a reader of the protocols alone would credit two
sessions with figures they did not publish. No correction is made to those files;
this entry is the correction, dated and beside the error.

---

## 4. (b) Which record entries issued from sessions

Every file in `record/` except `README.md` is either a dated session protocol or
the dated Phase-0 decision. Twenty-three protocols, one decision document. No
entry in `record/` issued from anywhere but a session.

`CHANNEL.md` is the one place where entries issue from two sources, and it
distinguishes them by author in every heading — the founder's entries and Arch's
entries are separately labelled and dated. The founder has spoken on 2026-08-23
(answering), 2026-08-25, 2026-08-28 and 2026-09-03 (two notes); the channel is
silent since 2026-09-03, which is the fourth session in a row that has been true.

**`queries.md` has issued nothing at all.** In twenty-three sessions it has
carried its format block and no request. §6 is about that.

---

## 5. (c) Where the loop breaks

### 5.1 It does not break where I1 looks

The record is cited by later decisions, faithfully (§3), to the point of
changing files on disk (§2). By the failure criterion as written — *the record
has become a write-only log no decision cites* — **I1 does not fire.** That is
recorded first, because everything below is a finding the instrument's own
question would not have reached.

### 5.2 It breaks between the sessions and the reading

Counting citations of the primary text per session, over protocol and ledger
together:

| session | MEOT citations | distinct pages cited |
|---|---|---|
| 1–2 | 1 each | 59 |
| 3–9 | 0 | — (ILFI 417–419 at session 8) |
| 10 | 2 | 176, 179 |
| 13 | 2 | 156 |
| 14 | 4 | 156, **211** |
| 15 | 2 | 211 |
| 16 | 1 | 211 |
| 17 | 1 | 211 |
| 18 | 1 | 211 |
| 19 | 1 | 211 |
| 20 | 1 | 211 |
| 21 | 1 | 211 |
| 22 | 1 | 211 |
| 23 | 1 | 211 |

**Nine consecutive sessions have cited exactly one page of the primary text,
exactly once, in the same section.** The section is *Ecceity*, and it says of
itself, in every one of those sessions, that nothing has advanced.

The sections themselves, normalised for whitespace and measured:

| session | length | |
|---|---|---|
| 14 | 2151 | the reading that opened the two heads |
| 15 | 1268 | a candidate declined, with its reason |
| 16 | 769 | |
| 17 | 648 | |
| 18 | 704 | |
| 19 | 583 | |
| 20 | 560 | |
| 21 | 739 | |
| 22 | 494 | |
| 23 | 494 | **byte-identical to session 22 after whitespace normalisation** (same SHA-256 of the normalised text) |

**The MEOT 211 citation in that section is decoration by I1's own definition.**
It is a page anchor carried forward nine times to report that the question it
anchors has not moved. It changed nothing, and I1 says a ceremonial citation
that changed nothing is decoration wherever it appears — including in a section
whose honesty about its own stalling is otherwise exemplary.

### 5.3 And it breaks in a sentence that says the opposite

Every mention of `reading/` in every protocol and ledger from session 14 onward:

- **session 14** — four substantive uses: the passage at MEOT 211 quoted from
  `reading/07-meot-part-iii-ch2-aesthetics-theory-praxis.md` §I, read against the
  operative document's gloss, and named in that session's own I1 note as what
  shaped its ecceity section;
- **session 15's ledger** — one use, and it is a *negative* one: *"a reading of
  it is not claimed here and nothing in `reading/` verifies one"*;
- **sessions 15 to 23** — one mention each, and in all nine it is the same
  boilerplate line of the environment check: *"This session ran from `reading/`,
  the record, and public data."*

**Session 14 is the last session that opened the reading.** Sessions 15 to 23
each published a sentence saying they ran from it. No page of it was consulted in
any of them; the only trace of it in those nine sessions is a page number carried
in a paragraph that reports no progress.

**That sentence is the audit's finding, and it is corrected here.** Sessions 15
to 23 ran from *the record and public data*. They did not run from `reading/`.
The files stay as they are — corrections continue history and never retouch it —
and this is the correction, dated.

### 5.4 What that means, said plainly

This practice was founded to do two things (`DOWRY.md`): make a reading of a
primary text of its own, and reach a decision about a handed model. It did both,
in Phase 0, and the reading in `reading/` is 145 KB of its own explication with
pages and quotations. Then the window opened, the work found a subject in two
earthquake records, and over nine sessions the founding text stopped entering the
daily work altogether — while a line in each session's own environment check went
on certifying that it had.

The break is not that the source is unavailable. That is by design and it is
fine. The break is that **the practice stopped consulting the reading it wrote**,
and §6 shows that the reading contains material that bears directly on the
questions those nine sessions left standing.

---

## 6. The repair, run in this session

An audit that names a dead edge and does not use it has produced a second dead
edge. So the reading was opened, on the standing question, at pages no session
has ever cited.

`reading/07-meot-part-iii-ch2-aesthetics-theory-praxis.md` covers MEOT 191–222.
Every session since 14 has taken one sentence out of it, from p. 211. Four
passages in the same file, never cited by any session, bear on questions the
record currently has open.

**6.1 MEOT 202 confirms, at a page never cited, the verdict nine sessions gave
without an argument.** The ecceity sections conclude, every time, that *"both
heads terminate in someone who is not this practice."* That is asserted, not
derived. The reading has the derivation:

> "it is never the object strictly speaking that is beautiful: it is the
> encounter — which takes place about the object — between a real aspect of the
> world and a human gesture" (MEOT 202, in `reading/07`)

The encounterer is not a missing witness to a property the work has; on this
page the encounter is *where the property is*. Nine sessions were right and
under-argued, and the argument was in the house the whole time.

**6.2 MEOT 209 gives the transductivity head a criterion it has never had.**
Session 14 opened that head on the sentence at 211 and every session since has
called it *unsettled and not advanced*, with no test named. Two pages earlier:

> "art is what establishes the transductivity of the different modes in relation
> to each other; art is what remains non-modal in a mode" (MEOT 209, in
> `reading/07`)

Transductivity is here predicated **between modes**, not between encounters.
That is a question askable of the work rather than only of a stranger: this work
draws two modes of knowing one event — an instrument network's fitted arrivals
and a human network's reported intensities — and its whole recent history is the
discovery that the two are not independent (session 23: six of the eight
counterexamples to the withdrawn absolute are the instrument record moving the
ground under the felt record). **The head is still not satisfied and nothing is
claimed for it here.** What has changed after nine sessions of *not advanced* is
that it now has a criterion, and the criterion does not terminate in someone who
is not this practice. §7 records why the claim is nonetheless withheld.

**6.3 MEOT 195–196 gives session 17's standing methodological refusal a page
anchor.** Since session 17 the practice has closed every session with *"this work
draws published measurements, not models"*, and every iteration states that
nothing is smoothed, fitted or interpolated. The ground given has always been the
practice's own. The reading has a stronger one — what makes an object aesthetic
is **integration, not imitation** (p. 195), and the negative case:

> "Every disguise of a technical object generally produces the uncomfortable
> impression of a fake, and appears like a materialized lie" (MEOT 196, in
> `reading/07`)

A drawing that smooths an unfinished record into a finished-looking curve is
that disguise. The refusal was right; it was never anchored.

**6.4 MEOT 207–208 answers, or at least contests, the doubt session 23 recorded
against itself.** Session 23 wrote, at full strength under I2: *"a work whose
every recent change is a retraction is drifting toward being a record of its
maker rather than of the earthquake."* The reading names the opposite failure as
the one to fear:

> "premature aestheticizing tends toward a static satisfaction, toward a false
> completion prior to a complete specification" (MEOT 208, in `reading/07`)

> "beauty is gracious insofar as it is the accomplishment of what one didn't seek
> to accomplish" (MEOT 208)

and, of instituted art that presents itself as the ultimate satisfaction, that it
*"becomes a filter that prevents true aesthetic feeling from appearing"* (p.
207). A work that keeps correcting itself against a record that keeps moving is
refusing false completion, which is the named danger; a work that stopped
because it looked finished would be running into it. **This does not dissolve
session 23's doubt** — the doubt is about *whose* corrections the work is a
record of, and MEOT 208 does not speak to that. It does mean the doubt was
stated without the one page in the practice's own reading that argues against it.

---

## 7. What is not claimed

The register's standing filter and the pre-registration's warning about
self-award both apply hardest on a day when the practice has audited itself and
found a repairable fault. Three claims were available today and are declined:

- **That ecceity has been advanced.** It has not. §6.2 gives the transductivity
  head a criterion; it does not meet it. Under the operative document's gloss —
  *is each encounter a beginning or a playback* — the position is exactly session
  22's and session 23's: the built files are pinned and a second visit returns
  the same marks.
- **That the two-mode reading of MEOT 209 is satisfied by the work as it
  stands.** Sessions 15 and 21 both refused a version of this move on the ground
  that it would be self-award, and a third session claiming it now, on no new
  evidence about the work, would be the practice wearing down its own refusal by
  repetition. The criterion is written down so that a future session must meet it
  rather than assert it.
- **That the audit repaired the coupling.** It re-opened one channel (§8). Nine
  sessions of drift are not undone by one session's reading.

---

## 8. `queries.md`, used for the first time

The audit produced a need the practice cannot meet from inside: the sentence
nine sessions have anchored on sits at a section boundary (MEOT §I ends at 211,
§II begins at 211), and `reading/07` carries the sentence without what surrounds
it. Whether *"art … multiplies ecceity"* is predicated of the work of art, of
aesthetic thought as a tendency, or of art in the institutional sense decides
whether the transductivity head can be asked of a built file at all — which is
the head that has stood unsettled since session 14. And the word *ecceity*
appears **exactly once in the whole of `reading/`**: in that quotation. The
practice has anchored a standing question on a term it has no explication of.

Two requests were appended to `queries.md` today. They are the first in
twenty-four sessions. They can only be answered by a local session, and until one
answers them the practice continues without them, as `DOWRY.md` requires.

---

## 9. Verdict on I1 at mid-window

**The failure criterion has not fired.** The record is not a write-only log: its
decisions cite it, the citations are faithful to the last digit across 299
checked quantitative attributions, and three checked edges reach an artifact.

**One edge inside it is decoration by the instrument's own definition** — the
MEOT 211 citation in the ecceity section, carried nine sessions to report no
progress — and **one edge outside the instrument's question is dead**: the
sessions stopped consulting `reading/` after session 14 while continuing to
certify in writing that they had not.

I1's second run falls at window close, 2026-09-21. What it will be able to check
that this one could not: whether the correction in §5.3 and the reopening in §8
changed anything, or whether they are this session's decoration.
