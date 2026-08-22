# W1 data probe — result, 2026-08-23

**Verdict: the form specified in `W1-twenty-five.md` §2–3 FAILS. A different and stronger form
passes.** Run before any build, as the spec required.

## Method

Four versions of the UCDP Battle-Related Deaths dyadic dataset were downloaded from the public
Uppsala download paths (`ucdp-brd-dyadic-{221,231,241,251}-csv.zip`, retrieved 2026-08-23) and
compared key-by-key on `(dyad_id, year)`, restricted to years ≤ 2021 so that every version could
in principle contain them. Sizes: v22.1 1,781 dyad-years; v23.1 1,848; v24.1 1,920; v25.1 1,995.

The API (`ucdpapi.pcr.uu.se`) requires a token and was not used.

## Finding 1 — the specified form does not exist

**Zero** dyad-years cross the threshold in both directions across versions. Zero appear, vanish
and reappear. The premise of §2 of the spec — "the same event crosses the line more than once,
in both directions" — has no instance in this source. The three curved measuring sticks as
designed cannot be drawn.

## Finding 2 — the dataset is censored exactly at the threshold

`bd_best` minimum is **25 in every version**, and **no entry falls below 25 in any of them**.
The canonical record of the world's wars cannot contain a twenty-four. The years that failed the
line are not recorded as failing it; they are absent.

This is the structural fact the work should be made of. The arbitrariness of the threshold is
invisible in the source *by construction* — and the only visible trace of the excluded is the
handful who were later let in.

## Finding 3 — years are admitted to the past, decades late

16 dyad-years appear in a later version having been absent from earlier ones; 6 disappear. Each
was checked individually against whether the *dyad* existed in the earlier version, to separate
genuine admissions from re-attribution artefacts.

**Genuine late admissions** (dyad already present, the year added):

| Case | Year | `bd_best` | Absent in | Present from |
|---|---|---|---|---|
| Government of Israel vs Hezbollah | **2000** | **27** | v22.1, v23.1, v24.1 | **v25.1** |
| Government of Indonesia vs OPM | **2019** | **34** | v22.1, v23.1, v24.1 | **v25.1** |
| Government of Indonesia vs OPM | **2020** | **31** | v22.1, v23.1, v24.1 | **v25.1** |
| Government of Colombia vs EPL – Megateo | **2002** | **25 exactly** | v22.1 | **v23.1** |
| Government of Burundi vs Palipehutu-FNL | 1995 / 1996 | 50 / 205 | v22.1, v23.1 | v24.1 |
| Government of Croatia vs Serbian Republic of Krajina | 1994 | 86 | v22.1 | v23.1 |

Israel–Hezbollah: the dyad carries 1990–1999 and 2006 in v22.1. The year 2000 was not a conflict
year in the canonical dataset for a quarter of a century, and is one from v25.1, at 27 deaths —
two above the line. Indonesia–OPM: 2018 and 2021 were present from the start; the two years
between them were a hole in the record of West Papua until v25.1. Colombia–EPL: admitted at
exactly the threshold value.

**Rejected as re-attribution artefacts, not threshold crossings** — recorded so they are not used
by mistake: Uganda vs ADF 2018 (378) and 2019 (165) vanish after v23.1 while DR Congo vs IS 2017
(96) and 2018 (378) appear in v24.1 — the same violence re-attributed. Colombia vs FARC
dissidents (dyad 15488, 2018–2021) vanishes entirely while FARC – Mordisco (dyad 17247) appears
with the same years. Tajikistan vs IS and South Africa vs SWAPO arrive as dyad ids that do not
exist earlier and cannot be adjudicated from this data alone.

## Finding 4 — the numbers above the line are unstable too

**210** dyad-years have a `bd_best` that differs between versions. Examples: Philippines vs CPP
2001 (97 → 142), Myanmar vs KNU 1989 (1,000 → 1,304), India vs Pakistan 2000 (198 → 222 → 225).
The revising is pervasive; it simply never carries anything across the line in both directions.

## Consequence for the work

The subject changes from *the count wobbles across the line* to **the past is admitted to war,
decades late — and what stayed below it left no trace at all.** That is a better subject: it has
a cut moment (one dated admission), a debtor with no record (those still below), and a machine
advantage that is real (holding four versions of a canonical dataset at once and proving what
each contained).

`W1-twenty-five.md` §2, §3 and §8.3 must be rewritten against these findings before anything is
built.

## Verification duties before publication

1. Read UCDP's own version-change documentation for v23.1, v24.1 and v25.1; a stated re-coding
   reason must be quoted where one exists, and its absence stated where none does.
2. Confirm each retained case against the UCDP/PRIO Armed Conflict Dataset as well — the BRD
   dyadic file is one view, not the whole record.
3. Archive the four downloaded files with hashes and retrieval timestamps; the work's claim is
   about what a version contained, and that must be checkable after the files move.
4. The claim "not a conflict year" means "absent from this dataset version". It does **not** mean
   nobody died there. The work must say so in its own voice, or it is a lie about the world.
