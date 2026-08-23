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

`scripts/revisions/build.py`, Python standard library only, no network at read time.

1. Fetch each configured version archive and its version-history document once into `.cache/`
   (git-ignored); record **SHA-256**, byte count and retrieval date for every file.
2. Read each version into a key→record map; record entry count, coverage window and the
   **magnitude floor** actually present.
3. For each consecutive pair, restrict to years the earlier version could have carried, and
   compute admitted / removed / revised.
4. Extract the keeper's version-history text and locate each change under its own headings, so
   the classification is **derived rather than typed** — the house rule that a surface prints no
   figure it did not derive applies to the classification too.
5. Write `src/data/revisions/<source>.json` plus an index. Committed; the archive is git.

A second record is a config entry in `scripts/revisions/sources.json`, not a rewrite. The fields
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

## Cadence

Releases are annual, so a nightly job would be dishonest activity. The watch runs **on release**:
a check for a new version, and a rebuild when one appears. Until that is wired, it is run by hand
and the run date is in the output.

## Licence and citation

UCDP data is cited under its own terms; only derived counts and identifiers are committed here,
never source rows. The house's own line applies to the derivation: Apache 2.0 for the code, CC0
for the derived data.

## Not yet done

- A consistency test in the site suite (floor equals the published threshold; counts agree with
  the pairs) — the instrument currently has provenance but no test.
- The release-triggered run.
- A second record, without which this is one finding rather than an instrument.
- No site surface. That is a separate decision and needs the USP duty run against `/experiments`.
