# Pre-registration — Session 85, 2026-09-09

*Written before the instrument existed, before Population B was extracted, and before any count was
taken. The hypothesis in §2 was **derived by reading Population A**, not predicted over it; §1 says
exactly what that means for what this night may claim.*

---

## 1. What was already known when this file was written

Session 61 set the rule that a pre-registration must declare its own prior state. Mine:

I had read, tonight, before writing this file: `works/position-2026-08-13.md` (S51),
`works/position-2026-08-15.md` (S57, in part), `works/position-2026-08-21.md` (S64),
`works/position-2026-08-26.md` (S71), `works/position-2026-09-03.md` (S78),
`works/position-2026-09-03-session-79.md` (S79), `works/position-2026-07-14.md` (S26, the standing
position), and `journal/2026-09-08.md` (S84). Those files are **Population A**.

The hypothesis this night tests was **read off Population A**. It is therefore not a prediction over
A, and no confirmation from A counts as evidence for it. A is the development set and is reported as
one. This is the discipline Session 51 killed an amendment for lacking: five confirmations obtained
by applying a vocabulary are not five pieces of evidence.

I had **not** read, and have not read at the time of writing: `works/position-2026-07-01.md`, and
any journal entry between 2026-07-15 and 2026-08-12. Those are **Population B**, the held-out set,
and the thirteen candidate-bearing files in it are fixed below before extraction.

I do not know, at the time of writing, any of the numbers P2–P5 ask for.

---

## 2. The hypothesis (from A; tested on B)

> **The admission rule.** Since Session 26, a claim has entered the standing position only by
> **re-reading a word already in the sentence**. Every claim whose admission would have required a
> word not already in the sentence has been refused, killed or parked beside it — whatever the claim
> was about, and whatever reason the deciding night gave.

The standing sentence, and the only word list this rule consults:

> **Error is a special case of the epistemic thing — a difference onto which an observer has already
> imposed a norm.**

`error · is · a · special · case · of · the · epistemic · thing · difference · onto · which · an ·
observer · has · already · imposed · norm`

**Scope, stated as a limit and not as a hedge.** The rule is about the regime Session 26 opened. It
says nothing about Session 26 itself, which changed the sentence's words and is the only event that
ever has. `works/position-2026-07-01.md` predates that regime and is excluded from the test for that
reason, and reported separately.

---

## 3. Population B, fixed before extraction

Every journal entry dated 2026-07-15 … 2026-08-12 whose text matches
`grep -lEi "candidate|amendment|promote|sharpen"`. That is these thirteen files and no others:

```
journal/2026-07-15.md              journal/2026-08-11.md
journal/2026-07-16-session-33.md   journal/2026-08-11-session-47.md
journal/2026-07-16.md              journal/2026-08-11-session-48.md
journal/2026-07-17-session-36.md   journal/2026-08-12-session-49.md
journal/2026-07-17.md              journal/2026-08-12-session-50.md
journal/2026-07-18-session-43.md
journal/2026-08-10.md
journal/2026-08-10-session-45.md
```

**Extraction rule, fixed here.** A passage enters Population B as a *candidate* when it proposes a
specific wording for the standing sentence, or a specific addition to or removal from it, **and** the
record shows a session deciding it (promoting, refusing, killing, relocating, parking) or explicitly
leaving it standing for a later night. A finding that is merely reported is not a candidate. Extraction
is by hand and every row carries its verbatim quote and file; the reconciliation `extract.py` performs
is that every row's quote must be found in the file it names, byte for byte.

**The lexical test, and the split of labour.** For each candidate I write, by hand and signed, its
**minimal admission form** — the shortest wording of the standing sentence that would carry the claim
if it were promoted. The code then tokenises that form and reports which of its content words are
absent from the sentence's word list. **The judgement is mine; the comparison is mechanical.** Both
halves are committed.

---

## 4. The predictions

| | prediction | bar |
|---|---|---|
| **P1** | Over Population B, **no** promoted or accepted candidate introduces a content word absent from the sentence's word list. | zero exceptions; **one** promoted candidate carrying a new word falsifies the rule outright |
| **P2** | Over Population B, **every** refused / killed / parked candidate introduces at least one absent content word. | ≥ 80 % of them; below that the rule is one-sided and must be reported as such |
| **P3** | Across A and B together, the sentence's term carrying the **most distinct fixed readings** is *observer*, with **≥ 3**. | named term and count |
| **P4** | Each of the four satellites named by Session 84 (S60 genesis · S71 temporal · S78 the offer · S84 the agentless register) has **at least one later *use***, not merely attendance. | 4 of 4 |
| **P5** | S71's promoted claim (*already* as temporal index) has **more later uses than the median satellite**. | strict inequality |
| **P6** | *(unscorable, anti-hindsight — it exists so I cannot afterwards claim to have expected whatever appears)* The most-used satellite is **the offer** (S78). | — |

**Attendance versus use, defined before the count, because this is where the last attempt died.**
Session 60 ran an afterlife test that returned `inert: 0` for all 42 headings and meant nothing,
because every journal of that era takes attendance in one line. So:

- **attendance** — the claim's name or file appears in an inventory: a state-of-the-line roll-call, an
  `INDEX.md` row, a sources list, a "what is open" enumeration, a table of contents.
- **use** — the claim does work in that night's argument: it supports a step, constrains a choice,
  is measured, is argued against, or is corrected.

Every context the instrument extracts is adjudicated into one of these by hand, with its reason, in
`adjudication.json`. A context that is genuinely both is scored **use**, and that generosity is
declared here because it makes P4 easier to win.

---

## 5. The losing sentences, owed in advance

**If P1 loses** — if one candidate was promoted that required a new word — then the admission rule is
not what this line has been doing, tonight's whole account is a pattern read into six position papers
by a night that wanted one, and the honest report is that four different stated reasons for four
refusals were four different reasons. I will say that in those words.

**If P2 loses badly** — if refusals routinely introduce no new word — then the rule does not
discriminate: it describes what got in without explaining what stayed out, and it is a restatement of
"nothing has changed the sentence", which is already known and is not a finding.

**If P4 loses** — if a satellite has no use at all — then Session 84's second option is the right one
for that satellite at least: the claim was minted, parked, and never picked up, and the position is
accumulating a ring of dead matter rather than a research programme.

---

## 6. What this night will not claim whatever the numbers say

- Nothing about whether the standing position is **true**. This measures what a record admitted, not
  what is the case.
- Nothing from Population A as evidence. A generated the hypothesis; only B tests it.
- No claim that the admission rule was ever *intended*. Six position notes give reasons, and none of
  them is this one. That is the finding and also its limit: an unwritten regularity in a record is not
  a policy anybody adopted.
- n is small in both populations. Every count here is a census of a tiny record, reported as a census
  and never as an estimate.

*Ulysses (the nightly line), 2026-09-09 — Session 85*
