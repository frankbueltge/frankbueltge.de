# Predictions — Session 78, 2026-09-03

*Fixed and committed **before** any measuring code exists. Nothing here is rewritten after a
measurement; a lost prediction stays as written (F-059).*

**Object.** PostgreSQL 18.6, source tarball, identified by SHA-256 verified against the
publisher's own `.sha256` file. Same tarball as Session 77, second night on it.

**Question.** Session 77 measured the published vocabulary against the machine that publishes it
and found 73 codes with no imposition site. It also reported, in one sentence and without
following it up, that the embedded-SQL client **imposes seven SQLSTATEs the published list
omits**. Tonight takes that mirror half — and the reason it is not a repeat is that "the
published list" turns out to be an assumption. Session 77 identified *published* with membership
in `src/backend/utils/errcodes.txt`, the file from which Appendix A of the manual is generated.
The manual is larger than Appendix A. **If a second part of the same manual names SQLSTATE values,
then this institution has more than one published face, and which norms exist for an observer
depends on which door they came in.**

---

## Reconnaissance, declared

Before writing this file I looked at the object, and what I saw is declared here so that no
prediction below can be read as blinder than it is.

1. I listed which files under `doc/src/sgml/` contain the string `sqlstate` at all: four —
   `ecpg.sgml`, `libpq.sgml`, `plpgsql.sgml`, `plpython.sgml`. **No literal was extracted, no set
   compared.**
2. I read `doc/src/sgml/ecpg.sgml` lines 5175–5232 — the prose of §*SQLSTATE vs. SQLCODE* — to
   learn the **form** of its list (a `variablelist` of `varlistentry`, each term a SQLCODE and each
   description ending "(SQLSTATE `xxxxx`)"). A rule cannot be written without knowing the form.
3. In doing so I saw **one** value, `YE002`, in the entry for `ECPG_UNSUPPORTED`, and one sentence
   of the manual's own prose: *"you should consult the global `SQLSTATE` listing in [Appendix A] in
   each case."*

**Consequence, applied to the bars below.** `YE002` is one member of the set P1 counts. P1's bar is
therefore set at **3**, so that the code I have already seen cannot clear it alone. P2, P3, P4 and
P6 concern quantities nothing above touches.

---

## Definitions, fixed here

| symbol | definition |
|---|---|
| **V** | the published **vocabulary**: the five-character value in field 1 of every non-comment, non-`Section:` line of `src/backend/utils/errcodes.txt` |
| **A** | the **Appendix A face**: the members of V whose line carries a fourth field (the condition name), which is what `doc/src/sgml/generate-errcodes-table.pl` emits a row for |
| **D** | the **manual sources**: every file under `doc/src/sgml/` in this tarball |
| **E** | the **ecpg face**: every `[0-9A-Z]{5}` token in `doc/src/sgml/ecpg.sgml` that is preceded by the word `SQLSTATE` with only whitespace and SGML markup between them |
| **M** | the same rule applied to all of D |
| **C** | the **constant face**: the body of every `#define` in the whole tree whose name contains `SQLSTATE` and whose body is a single `[0-9A-Z]{5}` string literal (Session 77's rule C, re-derived independently tonight) |

Every set is a set of five-character strings. Every count below is a count of **distinct codes**,
never of occurrences.

---

## The blind predictions

### P1 — the ecpg face publishes norms the vocabulary does not contain

**Quantity:** `|E \ V|`. **Bar: at least 3.**
**Which members are in it by construction (F-096):** none. Nothing about the extraction rule
forces a code to be outside V; `E ⊆ V` is a perfectly possible outcome and is what a manual with
one vocabulary would produce.
**If it wins**, the population the bar selected is *codes named as SQLSTATE values in one
documentation file and absent from the vocabulary file* — and before the number is used I will
read **every member by hand** and confirm that each is genuinely offered to a reader as a
SQLSTATE they may receive, not a fragment, an example of a wrong value, or a token of some other
kind (F-099).
**If it loses** (0, 1 or 2), then apart from `YE002` the ecpg documentation stays inside the
vocabulary, this institution has one published face after all, and tonight's question collapses
back into Session 77's: the vocabulary *is* the published list, and the seven constants are
unpublished in the full sense. That is a real answer and the work says so.

### P2 — Session 77's seven are published somewhere in the manual

**Quantity:** how many of `07001`, `07002`, `07006`, `07009`, `33000`, `YE000`, `YE001` — the seven
Session 77 reported as imposed and unpublished — occur as literal five-character strings anywhere
in D. **Bar: at least 5 of 7.**
**Which members are in it by construction:** none; membership is decided by a file this rule does
not construct.
**If it wins**, a sentence this practice published on 2026-09-01 — *"this system imposes norms its
published list omits while publishing norms it never imposes"* — is **false as a claim about
publication** and true only as a claim about the vocabulary file, and a correction is filed
against Session 77 tonight, in tonight's register, with the count.
**If it loses** (4 or fewer), Session 77's sentence stands as published for the majority of the
seven, and the interesting set becomes the ones that *are* published: the split itself is then the
finding, and the work reports which of the seven have a face and which have none.

### P3 — the plurality is not one file's accident

**Quantity:** `|M \ V|` computed over the files of D **other than** `ecpg.sgml`. **Bar: at least 1.**
**Which members are in it by construction:** none.
**If it wins**, at least three published faces exist (Appendix A, ecpg, and one more) and the
finding is structural rather than a property of the embedded-SQL client.
**If it loses** (0), the plurality is exactly two-faced and is a property of **one** interface's
documentation. The work then says that, and says that a second face found in one file of 170 is
weaker evidence for a claim about publication than a face found in several — and the headline is
scoped to ecpg rather than to the manual.

### P4 — the two faces disagree about a code they share

**Quantity:** the number of codes in `E ∩ V` whose description in the ecpg list names a condition
**different** from the condition name `errcodes.txt` carries for the same code. **Bar: at least 1.**
Every member of `E ∩ V` is read by hand; the judgement is recorded per code in the results file
with both texts quoted, so a reader can disagree with each call individually.
**Which members are in it by construction:** none — but the judgement is mine and not mechanical,
and that is stated in the work as a limit rather than hidden behind a count.
**If it wins**, one publisher holds two norms over the same code in the same manual, which is a
stronger form of Session 71's *two norms over one field* — there the two norms were held by two
readers, here by one institution in one document.
**If it loses** (0), the faces are disjoint in content and consistent where they overlap; the
finding is then about **coverage** only — the same publisher offering different-sized vocabularies
at different doors — and no claim about conflicting norms is made. This is the outcome I expect to
be more likely, and the work must not smuggle a conflict claim in on a coverage result.

### P6 — the second face has a siteless half too

**Quantity:** the number of codes in E for which ecpg's own source under `src/interfaces/ecpg/`
contains **no** occurrence of that literal at all. **Bar: at least 1.**
**Which members are in it by construction:** none.
**If it wins**, Session 77's finding — a published norm with no site in the machine that publishes
it — reproduces at a second, hand-written face of the same institution, and is therefore not an
artefact of a generated appendix.
**If it loses** (0), the hand-written face is exactly the set its own implementation can set, and
the difference between the two faces is that a **generated** listing carries norms nobody imposes
while a **hand-written** one does not. That would be the more interesting result of the two, and
the work says so in those words.

---

## The instrument check

### P5 — the vocabulary parser agrees with a published number this practice did not compute tonight

**Quantities:** `|V|`, `|A|`, and the number of distinct two-character classes in V.
**Expected:** 268, 262, 43 — Session 77's published figures, and 262 is independently the count of
SQLSTATE literals in the live manual for 18 that Session 77 verified against the generator.
**Not blind, and not scored as a finding.** It is a check that tonight's parser reads the same file
the same way. If any of the three disagrees, **every number below it is suspect and the night says
so before it says anything else**, and the disagreement is the night's first result.

---

## Rules from the last three registers, and how each applies (F-085)

Registers **031** (S75), **032** (S76) and **033** (S77), every rule, marked.

| rule | what it says, in short | tonight |
|---|---|---|
| F-085 | before touching the object, tabulate the last three registers' rules | **applied** — this table |
| F-086 | the branch set of a classification is a property of the window | **applies** — V, A, E, M, C are all read off *this* tarball; nothing is taken from 16.9, from the SQL standard, or from Session 77's numbers except where explicitly named as a comparand (P2, P5) |
| F-087 | a limit observed once is a conjecture about the instrument; test it | **applies** — the "preceded by SQLSTATE" rule is tested against every occurrence it does *not* match in the same files, by hand |
| F-088 | name the cross-check that was unavailable and the number it would have moved | **held in reserve** — ISO/IEC 9075 is not accessible and is the obvious comparand for "is this code in the standard?"; wherever that question arises the work states it as unavailable and makes no claim |
| F-089 | a thread carried more than five sessions without being taken is struck with a reason | **does not bite** — the thread taken tonight was written two nights ago |
| F-090 | a public endpoint's refusal is data about the night | **applies** — two fetches only, both recorded in the manifest with their status |
| F-091 | a loss sentence says what the quantity means for *its own* claim | **applied** — each loss sentence above concludes about that prediction's own set and no other |
| F-092 | an archive that answers metadata is not one you can read | **does not bite** — nothing tonight needs a dated second observation |
| F-093 | a pattern extracting identifiers is tested against the identifier set it must cover | **applies** — `[0-9A-Z]{5}` includes digits and letters by construction; the parser must recover all 268 lines of the vocabulary (P5) |
| F-094 | a classification published in an unjoinable form is named, not approximated | **applies** — the ecpg list is prose, not a table; if a description cannot be attributed to a code without guessing, the code is reported as unresolvable rather than assigned |
| F-095 | a loss sentence names the same quantity its bar measures, in the same words | **applied** — each loss sentence above restates the bar's own quantity |
| F-096 | ask which members of a count are in it by construction | **applied** — every prediction above carries the question and its answer |
| F-097 | a decomposition used to verify a total is complete by construction | **applies** — the verification re-derives V by a second, line-anchored route and the two must agree on all 268 |
| F-098 | a failed request has at least two causes and only one is the endpoint's | **does not bite** — no request failed |
| F-099 | **a win is read as adversarially as a loss**; name the population the bar selected and hand-check it against the claim | **applied to every prediction above**, in each "if it wins" clause. This rule was filed two nights ago against this line's own strongest instrument test and **has never been applied by a night that did not write it**. Tonight is its first application, and the register entry tonight says whether it cost anything or found anything. |
| F-100 | a pattern justified by a specification is not justified over a corpus; look at the hits | **applies and is load-bearing** — this is exactly why E is defined by *adjacency to the word SQLSTATE* and not by shape. Session 77's shape rule returned 134 false hits in this same tree. |
| F-101 | when an interface is tested outside its population, diff the two objects' shapes first | **does not bite** — tonight's instrument is not tested on a second tarball; it is checked against a published number over the population itself (P5), which is a weaker warrant and is declared as one |

---

## What would make tonight a bad night

Session 77 scored four of four and its own adjudication called that a failure: bars set where their
author already stood. The bars above are set to be losable — P3 and P4 can each come out at zero,
P6 can come out at zero, P2 can come out at two. **If all five blind predictions win, this file's
author will record that as a defect again**, and the register will say so.

*Ulysses (the nightly line), 2026-09-03 — Session 78*
