# Revisions — method sheet (working title, wording gate applies)

**An instrument, not a work.** Built 2026-08-23 on the founder's redirection: stop asking whether
a machine can make art, ask what machines are better at and which instruments they produce for a
human to use. It carries the instruments' obligations — checkability, provenance, maintenance —
and not the work bar.

## What it measures

For each watched record, it holds **every released version at once** and asks, per consecutive
pair, what happened to entries that were already there:

- **admitted** — an entry present in the later version and absent from the earlier one;
- **removed** — the reverse;
- **magnitude revised** — an entry in both, with a different value;
- and for each change, **under which of the keeper's own headings it is filed**, and whether any
  prose rationale accompanies it.

The last is the point. A keeper that records *that* a year became a war and never *why* is doing
something a reader cannot see at the point of use, because the number is republished without the
revision.

## The two edges, kept apart

This is the instrument's boundary, and it is drawn against the nearest neighbour in the
literature.

| | Front edge | Back edge |
|---|---|---|
| What | an entry admitted for the last year the earlier version covered | an entry admitted to an earlier year |
| Means | reporting lag: the world had not finished counting | the past being rewritten |
| Studied by | *Assessing Reporting Delays in ACLED Conflict Event Data* (arXiv 2603.25964), which models delay between occurrence and first inclusion | not found in a survey of 2026-08-23 |
| Here | recorded and counted separately, never mixed into the finding | **what this instrument watches** |

## What it does not claim

- **Absent from a version does not mean nobody died.** It means that release did not hold that
  entry. The instrument is about a record and its line, never about the dead being untrue.
- **No accusation of error.** UCDP publishes a version history most keepers do not publish at
  all, and states in its own methodology that figures are revised retroactively. The absence of a
  rationale is a finding about how records are kept.
- **A missing rationale is a missing *published* rationale.** One may exist in correspondence,
  in a coder's notes, in a paper. The instrument reads what is public.
- **The survey is not a proof of absence.** "Not found" is the strongest claim made anywhere here.

## How it is built

`scripts/admissions/build.py`, Python standard library only, no network at read time.

1. Fetch each configured version archive and its version-history document once into `.cache/`
   (git-ignored); record **SHA-256**, byte count and retrieval date for every file.
2. Read each version into a key→record map; record entry count, coverage window and the
   **magnitude floor** actually present.
3. For each consecutive pair, restrict to years the earlier version could have carried, and
   compute admitted / removed / revised.
4. Extract the keeper's version-history text and locate each change under its own headings, so
   the classification is **derived rather than typed** — the house rule that a surface prints no
   figure it did not derive applies to the classification too.
5. Write `src/data/admissions/<source>.json` plus an index. Committed; the archive is git.

A second record is a config entry in `scripts/admissions/sources.json`, not a rewrite. The fields
a candidate needs: a published inclusion threshold, versioned public releases, and a change
document to read. Candidates named and untested: EM-DAT, IPC famine phases, GDACS alert levels,
and national statistical offices that revise a headline series without a public diff.

## First result — UCDP Battle-Related Deaths, dyadic, versions 22.1 → 25.1

| | |
|---|---|
| Versions held | 4 (1,781 → 1,995 entries) |
| Magnitude floor, every version | **25** — the published threshold; nothing below it exists anywhere |
| Admitted, back edge | **15** |
| Admitted, front edge | 5 (reporting lag, reported separately) |
| Removed | 6 |
| Magnitudes revised | 341 across the three pairs |
| Deepest back-edge admission | **32 years** |
| Back-edge admissions with a published rationale | **0 of 15** |

Deepest first: South Africa – SWAPO **1989**, 327 deaths, admitted in v23.1, thirty-two years
later. Croatia – Serbian Republic of Krajina **1994**, 86, twenty-seven years. Burundi –
Palipehutu-FNL **1995** and **1996**. Israel – Hezbollah **2000**, 27 deaths — two above the line,
admitted twenty-three years later. Colombia – EPL Megateo **2002**, at exactly 25.

**The floor is the structural finding.** A record whose inclusion rule is a number contains no
observation below that number. Those who failed the line are not recorded as having failed; they
are absent. The instrument can therefore never count them — and saying so is part of what it
reports.


## Second record — EM-DAT, added 2026-08-24

The feasibility pass ran on three candidates. **EM-DAT holds**; IPC and GDACS were set aside.

- **EM-DAT** publishes an archive on UCLouvain Dataverse (DOI 10.14428/DVN/I0LTPH) whose
  versions the repository itself keeps: v1.0 (2024-12-18), v1.1 (2025-07-09), v2.0 (2026-04-30),
  each shipping its own documentation. Listed and downloadable without an account.
- **GDACS** answers openly but is a live feed with per-event *episodes*, not versioned releases —
  its revision history is inside the event rather than between publications. A different object.
- **IPC** has a public API v2.0; whether it exposes what a classification said earlier could not
  be established from the documentation reachable in this pass. Left open, not ruled out.

**Three caveats, recorded because they shape the result.** v1.0 and v1.1 ship the *same* data file
— only the documentation changed — so exactly **one comparable pair** exists today. The container
changed from `.tab` to `.xlsx` between them, which the reader now handles with the standard library.
And the licence is **CC BY-NC-ND 4.0**: no source rows are redistributed here, only derived counts
and identifiers, which are statements of fact about the material rather than an adaptation of it.
The keeper's notice travels with the data.

### Result, 2024-12 → 2026-04

| | UCDP BRD (4 versions) | EM-DAT (1 pair) |
|---|---|---|
| Admitted | 15 back-edge, 5 front | **728** |
| Removed | 6 | **150** |
| Magnitudes revised | 341 | **110** |
| With a published reason | 0 of 15 | **0 of 728** |
| Change document | a ledger of ids and years, no rationale | **none at all** |
| Columns renamed silently | — | **32** |
| Censoring floor | **25**, the published threshold | **none** — the criteria are disjunctive |

**The second record generalises the behaviour and inverts the naive reading.** Silent retroactive
change is not a UCDP quirk. And of the two, UCDP is the *more* transparent: it publishes a change
document, even one without reasons. EM-DAT publishes none, and renamed thirty-two columns between
releases without saying so — a rename that would make every automated comparison silently wrong,
and report a change as an absence of change, unless the reader normalises names. The instrument
records the renames for that reason.

**And the floor is UCDP's, not the class's.** EM-DAT's entry criteria are disjunctive — ten deaths
*or* a hundred affected *or* a declaration *or* a call for assistance — so an entry can be admitted
with a single death, and the record has no single number below which nothing exists. The censoring
finding belongs to records whose inclusion rule is one number, and saying which records those are
is now part of what the instrument reports.

## Cadence and the watch itself

Releases are annual, so a nightly job would be activity rather than watching. `check.py` asks the
prior question — has a keeper published a version nobody told us about? — and runs **weekly**
(`.github/workflows/admissions.yml`, Mondays). Discovery is per source, because keepers publish
differently: UCDP carries the version in the archive URL, so the next tags can be probed and a 404
means not yet; EM-DAT's repository keeps the versions and will list them. A newly published
version is a fact about the world, not a change of method: appending it and rebuilding leaves the
comparison rule untouched and the new finding visible in the diff. Method changes stay manual.

The workflow is in `deploy-cf.yml`'s `workflow_run` list **since 2026-08-27**, added in the same
change as the surface. Before that it was deliberately absent: a commit with nothing to deploy
needs no trigger. It needs one now, because commits made with the built-in token never fire
`on: push`, and a newly found release would otherwise sit undeployed until an unrelated push.

### What the first watch run found, 2026-08-27

**UCDP 26.1 was already published and we did not hold it.** Folded in on the first run — which is
the difference between a finding with a date on it and a watch.

What 26.1 did to the past: **nine back-edge admissions**, deepest sixteen years. Four Yemen dyads
gained the years 2008–2011, among them Ansarallah **2009 at 1,318 deaths** — a conflict-year
entering the canonical record of wars in 2026. Colombia–ELN **2017** arrived seven years late.
Three entries were **removed**, including Senegal–MFDC **2001**: a conflict-year deleted from the
past twenty-five years after it. And 122 death tolls were revised.

## The reader has broken twice, both times the same way

Recorded because it is the instrument's own failure mode and the reason it can be trusted only as
far as it is checked.

1. **EM-DAT renamed thirty-two columns** between releases (`TotalDeaths` → `Total Deaths`). The
   first run read 110 revisions as **zero** — a silent rename reported as an absence of change.
   Fixed by normalising header names; the renames are now a finding.
2. **UCDP reformatted its change document.** The 26.1 version history interleaves an `en-US`
   language marker before every token, gluing it to the identifier that follows and defeating a
   word-boundary search. The first run therefore reported nine documented changes as **unlisted**
   — the opposite of the truth, and precisely the accusation an instrument must never make by
   accident. Fixed by stripping the markers and matching identifiers on digit boundaries.

Both were presentation changes in the source that silently inverted a finding. The lesson is
built into the output rather than into a resolution: `filed_as` and `rationale` are separate
fields, `history.available` records whether the document was read at all, and a claim that
something is undocumented is only as good as the last time someone checked the extractor against
the source.

**With the extractor fixed, the accurate finding is sharper than the first one:** 30 of 31 changes
across five UCDP versions **are** filed under one of the keeper's own headings. UCDP documents
*what* changed. It never documents *why* — 0 of 24 back-edge admissions carry a rationale.

## Licence and citation

UCDP data is cited under its own terms; only derived counts and identifiers are committed here,
never source rows. The house's own line applies to the derivation: Apache 2.0 for the code, CC0
for the derived data.

## Not yet done

- ~~A consistency test~~ — **done 2026-08-27**, `src/lib/admissions/consistency.test.ts`, nineteen
  assertions. Written against the two failures the reader has actually had rather than imagined
  ones, and **verified by breaking the data on purpose**: setting every `filed_as` to null while
  the change document reads as read makes the extractor guard fire; zeroing the revision count on
  a large turnover makes the rename guard fire. Each failure message names which of the two it is.
  Beyond those it checks provenance per version (sha256, bytes, retrieval date, or an explicit
  note), that the findings count what the pairs contain, that the floor is no lower than any
  version holds, that no admission is older than its own window, that *what* changed stays apart
  from *why*, and that no field beyond the derived set rides along — the guard against a source row
  leaking into a CC BY-NC-ND commit.
- ~~The release-triggered run~~ — **done 2026-08-27**, weekly, and it found UCDP 26.1 on its first
  run.
- ~~A second record~~ — **done 2026-08-24: EM-DAT.** ~~A third~~ — **looked for 2026-08-27 and
  there is none**, which turned out to be the finding: the binding scarcity is retrievable past
  versions, not change documents, and almost no keeper publishes them. See the niche audit's
  addendum.
- ~~No site surface~~ — **done 2026-08-27: `/admissions`.** Its own page rather than `/experiments`,
  because that shelf ranks experiments by research line and an instrument has none. Reasons and the
  two rejected placements are in `docs/audits/2026-08-27-admissions-usp.md`.

