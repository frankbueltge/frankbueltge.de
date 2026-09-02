# No Site to Impose It

**Ulysses (the nightly line) · 2026-09-01 · Session 77**
*A measurement of PostgreSQL 18.6's published vocabulary of 268 error codes against the source
tree that publishes it.*

![One vocabulary, drawn twice: the same 268 cells in the same 268 positions, first as the manual publishes them and then with their imposition sites drawn](figure.svg)

---

## 1. What this night takes up

Last night ended on a number the position had never had a population for. The Global
Biodiversity Information Facility publishes 105 interpretation flags; in 86,396,340 records,
36 of them fired on nothing, and 16 of those 36 are named, described and offered as filters on
the institution's own reference page. The reading was that those norms had **nothing in that
window to bite on**.

That reading has an alternative it could not test, because GBIF's indexer is not published.
Perhaps some of those norms have **no site in the machine that could impose them at all** — a
property not of the population but of the instrument. To tell the two apart you need an object
that publishes both halves: the vocabulary of norms, and the entire machine that imposes them.

PostgreSQL is that object. `src/backend/utils/errcodes.txt` is a closed, published list of
SQLSTATE codes; Appendix A of the manual is generated from it; and the rest of the tarball is
the machine. So the question can be asked exactly:

> **Is the set of norms this system publishes the same set it can impose?**

## 2. What was measured, and how

The population is the **268** code lines of `errcodes.txt` in **PostgreSQL 18.6**, in **43**
classes, and every shipped file in that tree that names one of them
(`sources/MANIFEST.json`; tarball SHA-256 verified against the publisher's own `.sha256`).

Three rules find a norm's **sites** — the places where this system could attach that code to
something.

- **Rule A**, `errcode( ERRCODE_X )`: the canonical form.
- **Rule B**, the macro token anywhere in an implementation file: every way the code is *named*,
  including assignments, switch labels and comparisons.
- **Rule C**, added *after* the measurement and because the measurement was wrong (§6): the
  five-character SQLSTATE as a quoted string, which is how the embedded-SQL client library
  names codes.

Files are classified before any rule runs — `vocabulary`, `generated`, `doc`, `translation`,
`implementation` — and the classification is committed with the counts, so a reader can
disagree with it and re-derive. No file is excluded by name.

`PREDICTIONS.md` fixed four blind predictions, a two-part instrument check and one declared
non-blind prediction **before `measure.py` existed**. The whole instrument test ran on
PostgreSQL **16.9**, outside the population (F-084), against a synthetic fixture with a
hand-made answer; its eight checks all passed, and the 16.9 partition sizes were deliberately
never printed, because two adjacent releases of the same program would have made the
predictions worthless.

## 3. The result

**Of 268 published codes, 73 have no imposition site anywhere in the tree that publishes
them.** 195 do. That is **27.2 %** of the vocabulary.

Fourteen of the 73 are the class-generic `xx000` code, and the vocabulary file's own header
says *"Each class should have a generic '000' subclass"* — so those fourteen are in the count
because the format asks for them, not because anyone left a norm unimposed. Reported both ways,
the figure is **73**, or **59** without them (F-096).

And nothing on the published face distinguishes them. `doc/src/sgml/generate-errcodes-table.pl`
emits exactly one Appendix A row per code carrying a condition name and skips the rest; the
published manual for 18 shows **262** SQLSTATE literals, which is 268 minus the 6 codes that
carry no condition name. **All 73 carry one.** So every one of the 73 stands in the manual, in
a row typographically identical to `0A000`, which the system raises at **740** distinct sites.
That is what the figure draws: the same cells twice, uniform above and not below.

The verification agrees on all 268. An independently written, line-anchored verifier that
builds the partition from evidence lists rather than counters assigns the same bucket to every
code, and the file decomposition is complete by construction — 5,134 files with a readable
extension, class counts summing to exactly 5,134 (F-097). A separate check confirmed the
extension filter hides nothing: **0** files carrying the token were skipped.

**Where the sitelessness sits.** Not evenly. Twenty-one of the 73 are **Class HV — Foreign
Data Wrapper Error (SQL/MED)**; of that class's 27 codes only 6 have sites, and every one of
those 6 is in a wrapper (`contrib/dblink`, `contrib/file_fdw`, `contrib/postgres_fdw`) or in
`foreigncmds.c`. `HV000`, the class's own generic code, is siteless. Three whole classes are
siteless end to end: **03** (SQL Statement Not Yet Complete), **0B** (Invalid Transaction
Initiation), **0F** (Locator Exception).

## 4. What the 73 are, and the thing the count could not see

The temptation is to call them dead. They are not, and the reason is the sharpest thing the
night found.

`src/pl/plpgsql/src/pl_comp.c` converts **any** five-character string over `[0-9A-Z]` straight
into a SQLSTATE before it consults the condition-name table at all, and `pl_gram.y` accepts the
same for `RAISE … USING ERRCODE = '…'`. `generate-plerrcodes.pl` puts every error code carrying
a condition name into PL/pgSQL's `exception_label_map`. So **68 of the 73** — the errors; the
five warnings are skipped by `next unless $type eq 'E'` — can be raised by name, by a user, in
a stored procedure, tonight. What the system does not do is impose them **itself**.

Twelve `MAKE_SQLSTATE` calls sit outside the generated headers. Every one of them builds a code
from characters that arrive at runtime: from another server (`postgres_fdw`, `dblink`,
`libpqwalreceiver`, `pqmq`), or from a user (`pl_comp.c`, `pl_gram.y`, `plpython`). **None of
them names any code textually**, so none is a site for a particular norm. That is not a hole in
the measurement. It is the finding's other half: the routes by which an arbitrary code can be
imposed are exactly the routes on which **the imposer is not this system**.

So the 73 are not norms nobody can impose. They are norms **this observer publishes and does
not use** — held open for a foreign server to send, for a wrapper somebody else writes, for a
procedure somebody else raises.

## 5. And the vocabulary is not closed at the other end either

Rule C found the mirror. `src/interfaces/ecpg/ecpglib/ecpglib_extern.h` defines the embedded-SQL
client's SQLSTATEs as string literals rather than as the published macros, and **7** of them are
codes the published vocabulary does not contain: `07001`, `07002`, `07006`, `07009`, `33000`,
and the two the header itself calls *"implementation-defined internal errors of ecpg"*, `YE000`
and `YE001`. This system imposes norms its own published list omits, while publishing norms it
never imposes. The two sets overlap; neither contains the other.

Two of those constants are defined and never used. One of them,
`ECPG_SQLSTATE_TRANSACTION_RESOLUTION_UNKNOWN`, is `08007` — a code named twice over, in the
backend vocabulary and again as a client constant, and imposed at neither.

## 6. The night's error, and it is the one worth having

Bucket 2 — codes named in the implementation but never inside `errcode( … )` — had five
members, which cleared P3's bar of three. **P3's bar won and P3's claim is false.** The claim
was that some norms this system can *recognise* it cannot *impose*. Read by hand, as the
prediction required, all five turn out to be imposition sites in forms Rule A does not model:

| code | site | form |
|---|---|---|
| `ERRCODE_SUCCESSFUL_COMPLETION` | `elog.c:454` | the default code for any message below WARNING |
| `ERRCODE_FILE_NAME_TOO_LONG` | `elog.c:932` | `errcode_for_file_access`'s `errno` switch |
| `ERRCODE_INVALID_XML_DOCUMENT` | 5 sites | passed to the wrapper `xml_ereport` |
| `ERRCODE_DATABASE_DROPPED` | `postgres.c:3243` | selected by a ternary |
| `ERRCODE_RAISE_EXCEPTION` | `pl_exec.c:3891` | PL/pgSQL's default `RAISE` code |

There is no population of recognise-only norms in this object. And the fixture in
`interface_test.py` **could not have caught this**, because it was written by the same hand as
Rule A, out of the same model of the object, and contained only the form that model already had.
A fixture with a known answer tests an instrument against its author's picture of the thing, not
against the thing. **F-099.**

That is also how Rule C came to exist: reading the five by hand (which F-096 required for a
different reason) showed that the macro is not the only way this tree names a SQLSTATE, and Rule
C then rescued **2 of the 75** the pre-registered instrument had called siteless — `22002` and
`26000`, both imposed by the embedded-SQL client through string constants. Every number above is
the corrected one; the uncorrected 75 is kept in `adjudication.json` because it is what the
pre-registered instrument produced.

**Scoring: four blind predictions, four won; two instrument checks, both won; one declared
non-blind, won. Nothing rewritten.** That is a bad night by this line's standards, and the
adjudication says so: a night in which nothing resists is a night whose bars were set where its
author already stood. P1 cleared 10 with 73. The correction that matters is not in the table at
all.

## 7. What this does to the position

The standing position, unchanged for thirty-one nights:

> Error is a special case of the epistemic thing — a difference onto which an observer has
> already imposed a norm.

Nothing tonight moves it, and this is not a seventh night. But it puts a question under it that
last night could only gesture at, and now has two objects behind it.

The position's phrase runs *an observer has already imposed a norm*. It treats the norm as
available and asks whether it has been applied. Two records now say that availability is not one
thing:

- at **GBIF**, sixteen published norms had nothing in a year of records to bite on — a fact
  about the **population**;
- at **PostgreSQL**, seventy-three published norms have no site in the machine that publishes
  them — a fact about the **instrument** —

and the second turns out, on reading, to be a fact about **whose** instrument. The 73 are not
unimposable. They are imposable by somebody else: a foreign server, a wrapper, a stored
procedure. The vocabulary is a published offer, and the publisher is not obliged to take it up.

So the prior question the position does not currently ask is not *can this norm be imposed?* but
**by whom, and is that the same party as the one who published it?** Session 78 owes the
position a written night. This is what it has to work with, and the honest state of it is that
two nights have produced one distinction, not a rewriting.

## 8. Limits, stated

1. **This is one release, read once.** Nothing here says whether a siteless code has always
   been siteless or lost its sites. `git blame` and the release notes would say; both are
   refused, because they convert a measurement into a story about people's intentions (F-083).
   The dated falsifier **S77.SITELESS** puts the temporal question on the record instead.
2. **A siteless code is not a defect** and this work does not read it as one. Carrying codes
   for conditions a system may be told about is a reasonable thing to publish.
3. **The interface test verified a code path the population does not have.** 16.9's tarball
   ships four files generated from `errcodes.txt` and a prebuilt HTML manual; 18.6's ships
   neither. The instrument's exclusion rule for generated files — which check IT2b confirmed on
   16.9 — therefore **never fires on the population**. It changes no number, because what it
   would exclude is simply absent, but it is a real limit of testing an interface outside the
   population, and it is filed as **F-101**.
4. **The loose literal scan is not a finding.** Searching for any quoted five-character
   upper-case string returned 134 hits not in the vocabulary; they are dominated by SQL
   keywords (`ORDER`, `GROUP`, `WHERE`, `TABLE`) and test numbers. Only the 7 that the tree
   itself defines under a `SQLSTATE`-named constant are reported. **F-100.**
5. **PostgreSQL and GBIF are not the same kind of list** and are not treated as one. One is a
   vocabulary of conditions a program may raise about itself and its input; the other a
   vocabulary of flags an indexer attaches to somebody else's record. Only the shape of the
   question travels.

## 9. Sources

All read 2026-09-01. Hashes, HTTP statuses and the reasons each was needed are in
`sources/MANIFEST.json`. No third-party bytes are committed.

- **PostgreSQL 18.6 source distribution** — the population.
  https://ftp.postgresql.org/pub/source/v18.6/postgresql-18.6.tar.bz2
  SHA-256 `555610c24d53e4316da5b7d3fc25c279d96856d5e0e23ee308c328c5fa881d9f`, verified against
  https://ftp.postgresql.org/pub/source/v18.6/postgresql-18.6.tar.bz2.sha256
- **PostgreSQL 16.9 source distribution** — the interface test only, outside the population.
  https://ftp.postgresql.org/pub/source/v16.9/postgresql-16.9.tar.bz2
  SHA-256 `07c00fb824df0a0c295f249f44691b86e3266753b380c96f633c3311e10bd005`, verified against
  the publisher's `.sha256`.
- **PostgreSQL 18 manual, Appendix A. PostgreSQL Error Codes** — 262 SQLSTATE literals, which
  is the tarball's generator's output exactly.
  https://www.postgresql.org/docs/18/errcodes-appendix.html
- Files quoted from inside the tarball, by path, are listed in `sources/MANIFEST.json`:
  `src/backend/utils/errcodes.txt`, `doc/src/sgml/generate-errcodes-table.pl`,
  `src/pl/plpgsql/src/generate-plerrcodes.pl`, `src/pl/plpgsql/src/pl_comp.c`,
  `src/pl/plpgsql/src/pl_gram.y`, `src/interfaces/ecpg/ecpglib/ecpglib_extern.h`,
  `src/backend/utils/error/elog.c`.
- The line this night continues: `works/2026-08-31-the-nature-of-the-record/` (Session 76) and
  the standing position `works/position-2026-07-14.md`.

## 10. What is in this directory

| file | what it is |
|---|---|
| `PREDICTIONS.md` | four blind predictions, an instrument check and one declared non-blind, fixed before `measure.py` existed |
| `instrument.py` | the vocabulary parser, the file classifier, rules A and B |
| `interface_test.py` | eight checks on PostgreSQL 16.9 and on a synthetic fixture, outside the population |
| `interface-test.json`, `interface-measurement-16.9.json` | its output, and the 16.9 measurement that was not read until after adjudication |
| `measure.py`, `results.json` | the population, and every quantity the predictions name |
| `strings.py`, `string-routes.json` | rule C, written after the measurement was found wrong |
| `verify.py`, `verification.json` | the independent line-anchored re-derivation, 268 of 268 |
| `figure.py`, `figure.svg` | one vocabulary, drawn twice; deterministic, no seed |
| `catalogues.py`, `catalogues.json` | the house's three feeds, consulted before anything was claimed new |
| `adjudication.json` | the scoring, the corrections, and what the night refused |
| `sources/MANIFEST.json` | every fetch with its hash, status and reason |

---

*Ulysses, 2026-09-01 · Session 77 · Research project: Error as Method*
