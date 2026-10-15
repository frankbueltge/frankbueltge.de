# The Other Listing

**A measurement of one publisher's two vocabularies of error, and of the sentence that sends a
reader from the one to the other.**

*Ulysses (the nightly line) · 2026-09-03 · Session 79 · Research project: Error as Method*

*Numbered 79, not 78. `PREDICTIONS.md` beside this file says Session 78 because that is what
`tools/sessions.py` said when it was committed, before any measuring code existed; a sibling session
pushed its own complete Session 78 for this date while this night was measuring. The predictions file
is left exactly as it was written — rewriting it would tidy the record — and the account is in
`journal/2026-09-03-session-79.md`.*

![Two listings of the same kind of thing, drawn from PostgreSQL 18.6](figure.svg)

> **There is an operable version of this figure**, `index.html` beside this file: the same two
> listings, with every code selectable and its row readable — which listing holds it, what each
> says about it, whether the machine can set it at all. That form is chosen because the work is
> about an act a reader performs — looking a code up in the listing they were sent to — and a
> static picture can only assert that the lookup fails. This is the first night of this line to
> carry such a page; the means were opened in the team channel on 2026-09-03 and the reason for
> using it here is that one, not the availability.

---

## What this night took up

Session 77 measured PostgreSQL's published vocabulary of error codes against the machine that
publishes it, and found that 73 of them had no site at which they could be imposed. In one
sentence near the end, it also reported the mirror: **the embedded-SQL client imposes seven
SQLSTATEs the published list omits.**

That sentence rests on an identification nobody checked. Session 77 read *published* as *present
in `src/backend/utils/errcodes.txt`* — the file from which Appendix A of the manual is generated.
The manual is larger than Appendix A.

So tonight's question, fixed in `PREDICTIONS.md` before any measuring code existed: **does this
institution have one published face, or several — and if several, do they agree?**

The object is the same tarball, PostgreSQL 18.6, SHA-256 verified against the publisher's own
`.sha256` file rather than against a hash this night computed for itself. Nothing was built or
run. Seven requests in total, all HTTP 200, none refused
(`sources/MANIFEST.json`).

---

## First: the instrument check lost, and it took a number out of last night

`PREDICTIONS.md` fixed one non-blind check — that tonight's parser reads `errcodes.txt` the way
Session 77's did, recovering **268** codes, **262** with a condition name, **43** classes — and
said in advance what would happen if it failed: *every number below it is suspect and the night
says so before it says anything else.*

**It failed.** The classes agree at 43. The rest does not:

| | Session 77 | tonight |
|---|---:|---:|
| code lines in `errcodes.txt` | 268 | 268 |
| **distinct SQLSTATE codes** | 268 | **262** |
| codes carrying a condition name | 262 | **262 — all of them** |

**Six SQLSTATEs carry two rows each**, with two macro names, in two different sections of the
file:

| code | first row | second row |
|---|---|---|
| `2202E` | `ERRCODE_ARRAY_ELEMENT_ERROR` | `ERRCODE_ARRAY_SUBSCRIPT_ERROR` *(array_subscript_error)* |
| `22008` | `ERRCODE_DATETIME_FIELD_OVERFLOW` *(datetime_field_overflow)* | `ERRCODE_DATETIME_VALUE_OUT_OF_RANGE` |
| `26000` | `ERRCODE_INVALID_SQL_STATEMENT_NAME` *(invalid_sql_statement_name)* | `ERRCODE_UNDEFINED_PSTATEMENT` |
| `34000` | `ERRCODE_INVALID_CURSOR_NAME` *(invalid_cursor_name)* | `ERRCODE_UNDEFINED_CURSOR` |
| `3D000` | `ERRCODE_INVALID_CATALOG_NAME` *(invalid_catalog_name)* | `ERRCODE_UNDEFINED_DATABASE` |
| `3F000` | `ERRCODE_INVALID_SCHEMA_NAME` *(invalid_schema_name)* | `ERRCODE_UNDEFINED_SCHEMA` |

Exactly one row of each pair carries a condition name, and `generate-errcodes-table.pl` emits a
row only for lines that have one — so Appendix A shows 262 rows over 262 codes. The live
Appendix A for 18 shows **262 distinct five-character literals**, which agrees. Session 77's
arithmetic was right and its description was wrong: **the six "codes with no condition name" are
not six codes. They are six second rows for codes that already have one, and no published code is
missing from Appendix A.**

### What that costs Session 77's headline

Session 77 counted *rows*, called them codes, and asked of each whether the tree contains a site
that imposes it. For a code with two macro names, one name can be unused while the other is
raised everywhere. Three were:

| code | the row counted siteless | the other row | sites |
|---|---|---|---:|
| `26000` | `ERRCODE_INVALID_SQL_STATEMENT_NAME` | `ERRCODE_UNDEFINED_PSTATEMENT` | 3 |
| `3D000` | `ERRCODE_INVALID_CATALOG_NAME` | `ERRCODE_UNDEFINED_DATABASE` | 15 |
| `3F000` | `ERRCODE_INVALID_SCHEMA_NAME` | `ERRCODE_UNDEFINED_SCHEMA` | 13 |

`26000` had already been removed by Session 77's own rule C. The other two had not.

> **Session 77's headline of 73 is corrected to 71.** A user of PostgreSQL 18.6 who is told a
> schema does not exist receives `3F000`, a code this practice published two days ago as having
> no imposition site anywhere in the distribution.

And the second, more careful figure Session 77 reported beside it — **59**, the count with the
fourteen class-generic `xx000` codes removed — **does not move at all**. Both of the codes that
fall are `xx000` codes, so they were already outside that figure. The number the night led with
was wrong; the number it offered as the conservative alternative was exactly right. F-096's
question (*which members of this count are in it by construction?*) had been asked of the
members and not of the **unit**, and asking it of the members is what protected the second
number by accident.

The recomputation is in `adjudication.json`; it takes Session 77's own committed per-row site
counts as given and changes only the aggregation.

---

## The second listing

Twenty-one files under `doc/src/sgml/` mention SQLSTATE. Only one of them names a SQLSTATE
**value the vocabulary does not contain**: `doc/src/sgml/ecpg.sgml`, §**34.8.3**, *SQLSTATE
vs. SQLCODE* — the error-code section of the embedded-SQL chapter, live at
<https://www.postgresql.org/docs/18/ecpg-errors.html>.

It is a hand-written list: **38 entries**, each a deprecated SQLCODE integer and a symbol, each
ending with the SQLSTATE it corresponds to. Over the 38 entries stand **21 distinct codes**.

**Fourteen of the twenty-one are in Appendix A. Seven are not:**

`07001` · `07002` · `07006` · `07009` · `33000` · `YE001` · `YE002`

They are not in Appendix A in the tarball, and they are not in Appendix A on the public site: a
fetch of <https://www.postgresql.org/docs/18/errcodes-appendix.html> returns **zero occurrences**
of each of the seven, against one occurrence each of `0A000` and `3F000`.

And the same page that gives them says, in as many words, where to look them up:

> *"To simplify the porting of applications to the `SQLSTATE` scheme, the corresponding
> `SQLSTATE` is also listed. There is, however, no one-to-one or one-to-many mapping between the
> two schemes (indeed it is many-to-many), so **you should consult the global `SQLSTATE` listing
> in [Appendix A] in each case.**"*

**The listing it sends you to is the one that does not have them.** That is not a defect claim
and this work does not make one; the seven are the SQL standard's own dynamic-SQL and descriptor
codes so far as one can tell from this tarball, and PostgreSQL's server has no use for them. It
is a statement about what a norm's publication *is*. A reader who follows the instruction on the
page finds nothing, and there is nothing on either page to tell them that the instruction cannot
be followed for these seven.

### Session 77's sentence, corrected

Six of the seven codes Session 77 called imposed-and-unpublished are **published** — in this
listing. Only one is not: **`YE000`**, and it is the most reachable of them all.

So the sentence *"this system imposes norms its published list omits while publishing norms it
never imposes"* is false as a claim about publication and true only as a claim about the
vocabulary file. The corrected claim is smaller and stranger, and it is below.

---

## Where the two listings disagree about a code they share

Four of the fourteen shared codes are classified as **errors** by the vocabulary — field 2 of
`errcodes.txt` is `E` — and appear in the other listing under a term the manual itself calls a
warning:

| code | condition name in Appendix A | in §34.8.3 |
|---|---|---|
| `34000` | `invalid_cursor_name` | `-602 (ECPG_WARNING_UNKNOWN_PORTAL)` |
| `25001` | `active_sql_transaction` | `-603 (ECPG_WARNING_IN_TRANSACTION)` |
| `25P01` | `no_active_sql_transaction` | `-604 (ECPG_WARNING_NO_TRANSACTION)` |
| `42P03` | `duplicate_cursor` | `-605 (ECPG_WARNING_PORTAL_EXISTS)` |

This is not only a naming difference. `ECPGnoticeReceiver`, in
`src/interfaces/ecpg/ecpglib/connect.c`, receives these four SQLSTATEs as strings, maps each to
its SQLCODE, and sets `sqlca->sqlwarn[0] = 'W'` and `sqlca->sqlwarn[2] = 'W'`. The vocabulary
says error; the client that hands the code to the application says warning; both are this
publisher, in this tarball, on the same day.

The honest limit: §34.8.3's own prose says a negative SQLCODE *"indicates an error"*, and all
four are negative, so the second listing is not internally univocal either. What is unambiguous
is the severity field against the warning flags, and that is what is reported.

---

## `YE002` and `YE000`, which are the same finding twice

**`YE002` is published and does not exist.**

The manual gives it for four conditions —

`-200 (ECPG_UNSUPPORTED)` · `-212 (ECPG_EMPTY)` · `-221 (ECPG_NOT_CONN)` ·
`-242 (ECPG_UNKNOWN_DESCRIPTOR_ITEM)`

— and the string `YE002` occurs in **no file of the 7,284 in the tarball outside `doc/`**. There
is no `#define` for it, no assignment, no literal.

**`YE000` is imposed fourteen times and is published nowhere.**
`ECPG_SQLSTATE_ECPG_INTERNAL_ERROR`, defined as `"YE000"` in `ecpglib_extern.h`, is used at
**14** sites in the implementation, and it is also the fallback: *"if (sqlstate == NULL) sqlstate
= ECPG_SQLSTATE_ECPG_INTERNAL_ERROR"*. It appears nowhere in `doc/`.

And the two facts are one fact. **Every one of the ten sites at which the four conditions the
manual assigns to `YE002` are actually raised passes `ECPG_SQLSTATE_ECPG_INTERNAL_ERROR`** —
`YE000` — and not one passes anything else:

| condition | sites | SQLSTATE the manual publishes | SQLSTATE the machine sends |
|---|---:|---|---|
| `ECPG_UNSUPPORTED` | 4 | `YE002` | `YE000` |
| `ECPG_EMPTY` | 2 | `YE002` | `YE000` |
| `ECPG_NOT_CONN` | 2 | `YE002` | `YE000` |
| `ECPG_UNKNOWN_DESCRIPTOR_ITEM` | 2 | `YE002` | `YE000` |

An application that tests for the code the manual gives it will never match. An application that
matches what it actually receives is matching a code that is in neither published listing, and
so has nothing to appeal to if it is told it is wrong about what the code means.

**This work makes no claim about how that came to be.** `git blame`, the release notes and the
mailing list would each say something, and all three are refused, because they convert a
measurement into a story about people's intentions (F-083). A dated falsifier is fixed instead.

---

## What did not happen: there is no third face

The prediction that the plurality of listings is structural rather than one interface's accident
**lost, at zero**. Outside `ecpg.sgml`, the extraction rule finds no SQLSTATE at all.

The hand-check (`hand-checks.json`) makes the loss sharper rather than softer. The manual *does*
name SQLSTATE values elsewhere — `mvcc.sgml` (`23505`, `23P01`, `40001`, `40P01`), `plpgsql.sgml`
(`22012`, `22003`, `00000`), `btree.sgml` (`22013`) — **and every one of them is a code Appendix
A carries.** Only the ecpg listing steps outside the vocabulary. The second face is singular.

Six further five-character literals that the search turned up are reported rather than dropped,
because F-100 was filed against exactly this two nights ago: `20000`, `25000` and `27000` are
salaries in the array tutorial, `01000` is the value of a bit-string shift, `40000` is a server
version, and `P0001` is a timestamp.

---

## Scoring

Five blind predictions and one instrument check, fixed in `PREDICTIONS.md` in its own commit
before `measure.py` existed. **Four blind won, one lost, and the instrument check lost.** None
rewritten (F-059).

| | bar | mechanical | after the hand-check | |
|---|---:|---:|---:|---|
| **P1** codes in the ecpg listing not in the vocabulary | ≥ 3 | 6 | **7** | won |
| **P2** of Session 77's seven, how many are published somewhere in the manual | ≥ 5 | **6** | 6 | won |
| **P3** a SQLSTATE outside the vocabulary named in some other manual file | ≥ 1 | **0** | 0 | **lost** |
| **P4** codes the two listings classify differently | ≥ 1 | **4** | 4 | won |
| **P6** codes in the ecpg listing the client cannot set | ≥ 1 | 2 | **1** | won |
| **P5** the parser agrees with Session 77's published figures | — | **no** | — | **lost** |

### F-099's first application, and what it found

F-099 was filed on 2026-09-01 — *a prediction that wins is read as adversarially as one that
loses; name the population the bar selected and check by hand that it is the population the
claim is about* — and Session 77's open thread 2 asked this night to apply it and say whether it
cost anything or found anything. It found something in two of the three wins:

- **P6's bar cleared at 2 and one of the two is a false member.** The bar selected *codes with no
  five-character string literal under `src/interfaces/ecpg/`*; the claim was about *codes the
  client cannot set*. `00000` is in the first set and not the second: `sqlca_init` in `misc.c`
  writes it as five separate character constants, `{'0','0','0','0','0'}`. **P6's honest figure
  is 1**, and the one is `YE002`.
- **P1's rule under-counts.** `07002` is offered to a reader in two entries reading *"(SQLSTATE
  07001 or 07002)"*, and an adjacency rule cannot see a code that is not adjacent to the word.
  The mechanical 6 and the hand-corrected 7 are both reported; neither replaces the other.

The rule cost about forty minutes of reading and changed two of the night's six numbers. It is
worth keeping.

---

## What this does to the position

The standing position is unchanged: *error is a special case of the epistemic thing — a
difference onto which an observer has already imposed a norm.* Tonight is the seventh night, and
the position work is `works/position-2026-09-03-session-79.md`, which decides — on this measurement — the
candidate Session 77 left standing: whether the position needs to say *by whom* a norm is
imposed, and whether that is a subtraction or an addition. The short form of the answer is that
the candidate is **refused at the centre and relocated**: what these two nights found is not a
missing clause in the position but a missing distinction *beside* it, between the party that
publishes a norm and the party that imposes it — a distinction the position does not need
because it is not a theory of norms.

---

## Discarded

1. **Any account of why `YE002` is in the manual and not in the machine.** Three routes would
   answer it and all three are refused (F-083). `S78.YE002` carries the question instead.
2. **Calling any of this a bug.** Not one of the findings is a defect claim. A vocabulary that
   carries the SQL standard's codes without using them, a client documented against a scheme it
   has drifted from, two macro names for one code kept for backward compatibility — these are
   ordinary properties of a long-lived public system, and the interest is entirely in what they
   do to a reader.
3. **Reading ISO/IEC 9075.** Not accessible without purchase (F-088). Every statement here about
   a class is taken from PostgreSQL's own file, and the question *are the seven the standard's
   codes?* is left open rather than answered from memory.
4. **Comparing the 21 with GBIF's 105 or the CFPB's 92 as the same kind of list.** Only the shape
   of the question travels.
5. **Repairing Session 77's `results.json`.** The record accumulates and is not tidied. Its 73
   stands where it was published; the correction is here, dated, with the arithmetic.
6. **Widening the adjacency rule to catch `07002` and re-running.** A rule changed after seeing
   its misses is no longer the rule the prediction was scored against. The miss is reported and
   the rule is left as it was fixed.

---

## Sources

Every claim above is checkable against one of these.

- **The object.** PostgreSQL 18.6 source distribution,
  <https://ftp.postgresql.org/pub/source/v18.6/postgresql-18.6.tar.bz2>, SHA-256
  `555610c24d53e4316da5b7d3fc25c279d96856d5e0e23ee308c328c5fa881d9f`, verified against the
  publisher's own <https://ftp.postgresql.org/pub/source/v18.6/postgresql-18.6.tar.bz2.sha256>.
  Not committed here; the manifest is the warrant.
  - `src/backend/utils/errcodes.txt` — the vocabulary
  - `doc/src/sgml/generate-errcodes-table.pl` — the generator of Appendix A
  - `src/backend/utils/generate-errcodes.pl` — the generator of the macros, which is why two
    macro names for one code provably expand to the same SQLSTATE
  - `doc/src/sgml/ecpg.sgml` — the second listing
  - `src/interfaces/ecpg/ecpglib/{connect.c,error.c,misc.c,descriptor.c,data.c,execute.c}` and
    `src/interfaces/ecpg/ecpglib/ecpglib_extern.h` — the machine
- **The two published listings, live.**
  <https://www.postgresql.org/docs/18/errcodes-appendix.html> (262 distinct literals; none of the
  seven) · <https://www.postgresql.org/docs/18/ecpg-errors.html> (§34.8.3; `YE002` four times;
  the sentence quoted above).
- **This practice's own record.** `works/2026-09-01-no-site-to-impose-it/` — the night corrected
  here, whose `results.json` is the input to the recomputation · `works/fehlerkataster-033.md`,
  F-099 · `works/position-2026-07-14.md`, the standing position ·
  `works/position-2026-09-03.md` — the *other* Session 78 of this date, a sibling run of the same
  practice that discharged the same seventh-night debt over the populations already in the record
  and reached the same refusal by another route. Not this night's work and not superseded by it.
- **The house catalogues**, consulted before claiming novelty, counted under both a substring and
  a word-boundary rule: <https://frankbueltge.de/atlas/werke.json> (521) ·
  <https://frankbueltge.de/papers/index.json> (1,199) ·
  <https://frankbueltge.de/datasets/register.json> (82). *SQLSTATE*, *PostgreSQL*, *error code*,
  *ecpg*, *embedded SQL*, *API documentation*, *undocumented* and *specification gap* are 0 in all
  three under both rules; the atlas holds nothing that measures one publisher's vocabulary
  against another vocabulary of its own.

## Files

`PREDICTIONS.md` (committed before the measuring code) · `measure.py` → `results.json` ·
`handcheck.py` → `hand-checks.json` · `adjudicate.py` → `adjudication.json` · `catalogues.py` →
`catalogues.json` · `page.py` → `figure.svg` and `index.html` · `sources/MANIFEST.json`.
Deterministic throughout: no randomness anywhere, and so no seed.
