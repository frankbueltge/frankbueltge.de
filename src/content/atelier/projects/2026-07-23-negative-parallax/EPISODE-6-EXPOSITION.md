# The warrant that does not travel

**Season 1, Episode 6/7 — exposition, draft v1 (2026-08-06, Ulysses; revised the same day four
times — tick 38, §3 and §7; tick 39, §8 and the new §9; tick 40, §7 and §8, out of writing the
apparatus; tick 41, §7 and §8 item 5, out of measuring the frame residue).**

**Status: DRAFT.** Not a publication candidate, and this file proposes nothing to any gate. It is
the first pass at the exposition the concept gate licensed on 2026-08-05 (`EPISODE-6-CLAIM.md` §8),
written from the measurements already in this record. What it still lacks is listed in §8. The
largest item there was not a measurement but a name; it is named in §9, and what remains is
apparatus, a second exposition pass, and the decision of what ships.

Draft v1 said "no new measurement was made for it". That is no longer true: the first item of §8 —
the sub-count — was measured out the same day, and §3 and §7 carry the result. Nothing was added to
the three readings; one number is withdrawn and two are stated in both of the readings they have.

---

## 1. What the work is

An instrument, three readings taken with it, and the protocol without which its numbers are
worthless.

A threshold in a methods section — `ruwe < 1.4`, `UWE < 1.25`, `R̂ < 1.1` — is not true or false. It
is a **reading**: made once, on a stated sample, in a document, usually hedged in the sentence that
states it. Downstream, the number keeps working after the document stops travelling with it. After
that point the cut still sorts the world, and nothing in the notation says on whose reading.

The work measures that. Not as an anecdote about one field, and not as a complaint: as a
**quantity of a literature**, with a denominator, using an instrument someone else can re-point.

## 2. What is measured, exactly

Given a statistic, a focus value, a deriving document and a frame of papers, the instrument
(`warrant-trace/warrant_trace.py`, driven by a JSON profile) returns:

- how many **distinct published values** of that statistic are in use across the frame;
- at how many **sites** and in how many **papers** the focus value stands;
- and what stands **at the site** — which is where the machine stops.

The machine step is a sieve whose only job is to make hand-reading finite. Every site carrying the
focus value is then read by hand against the citing paper's own bibliography, because a citation key
cannot be resolved to a document from the window it stands in. Both directions of sieve error have
been measured, once each, and both are in the record: false positives at 7 of 25 hand-read sites
(2026-08-01), false negatives at 3 of 3 missed by a flag built to catch them (2026-08-05). An
instrument that can only make hand-reading finite must say which way it errs; this one now has one
measured instance in each direction.

Papers with no LaTeX source at arXiv return an all-zero row that is indistinguishable from a paper
that never mentions the statistic — the **silent zero**, found on 2026-08-05, running against this
line's own headline. Those papers are excluded from every denominator and counted in the open.

## 3. The three readings

| threshold | frame | denominator | distinct values in use | focus value stands at | what stands at the site |
|---|---|---|---|---|---|
| **RUWE < 1.4** | 599 papers citing the Gaia negative-parallax literature | **590** (9 with no LaTeX source) | **121** written forms, **115** as numbers | **397 sites in 187 papers** | the 2018 DPAC technical note that derives it: **4 papers** |
| **UWE < 1.25** | the same 590 papers | 590 | — | **38 sites in 11 papers** | Paper I, which recommends it: **3 sites in 2 papers**; Paper II, same authors and year, which carries the value and declines it as a criterion: 4 sites; another document: 12; no citation: 15 |
| **R̂ < 1.1** | 230 recent `stat.CO` / `stat.AP` arXiv papers, every `astro-ph` cross-list dropped by rule | **222** (8 with no LaTeX source) | **22** written forms, **20** as numbers | **12 sites in 7 papers** | *Bayesian Data Analysis* §11.5, which states the number and hedges it in the same sentence: **1 site**, and there in order to report it superseded; Gelman & Rubin 1992, **which states no numeric threshold at all**: 3 sites; no citation: 6 |

Two of these numbers changed on 2026-08-06 and both changes are corrections of this draft, recorded
in §7: the RUWE site count is now stated (397, with the run that produced it named), and the
distinct-value counts are given in both readings, because a literature writes one threshold in more
than one way — `1.1` and `1.10`, `1.2` and `1.20` — and counting written forms is not counting
values.

Full records: `TRACE.md` ticks 21, 35, 36; hand-readings in `warrant-trace/handread-*.csv`;
measurement tables and reports beside them; frames and fetch manifests with per-file sha256.

## 4. What the readings say

**Threshold provenance is a quantity of a literature; it varies between thresholds; and it fails in
at least three distinguishable ways.**

1. **Absent.** RUWE 1.4: four papers in 590 name the document the number was read off — a technical
   note whose relevant section is titled *An example using the RUWE*.
2. **Displaced onto a sibling.** UWE 1.25: at four sites the warrant is not missing but attached to
   the paper that carries the value **and declines it**, rather than to the one that recommends it.
   Here the deriving document travels *better* than for 1.4 (2 of 11 papers against 4 of 187) —
   which is why the claim is about a varying quantity and not about thresholds as such.
3. **Attributed to a document that never carried the number.** R̂ 1.1: the paper that introduced the
   diagnostic states no threshold; it stands at three of the twelve sites, against one for the
   textbook section that made the number. And this is not the citing authors' invention — the
   field's current standard reference makes the same attribution.

The name of a diagnostic travels. The reading that produced its number does not.

## 5. What the work does not say, stated as flatly as §4

- **No error, misuse or sloppiness is alleged of anyone**, and nothing here found a wrong number. A
  methods sentence citing the paper that introduced a statistic, for a threshold stated elsewhere,
  is the ordinary way a field writes. The finding is that it is *countable*, not that it is wrong.
- **Where a licence exists, it is quoted.** 34 of the 38 UWE-1.25 sites apply the number to RUWE,
  and the deriving paper permits exactly that — in a footnote, in the document that 3 of 38 sites
  name. The finding is about place, not permission.
- **The field updates.** In the R̂ frame the stricter, newer 1.01 stands at 30 sites against 10 for
  1.1. A pre-registered forecast of this line said 1.1 would be commonest; it is third. **Recorded
  as a failed forecast** (Production Amendment rule 3), because it is the session's real news: the
  case was built assuming a literature that had already moved.
- **Three cases are not a general result.** Two of them are the same statistic in the same field;
  the frames are small, differently built, and biased toward papers whose authors work on
  diagnostics; hand-reading remains the load-bearing step; and the arXiv-only frame cannot reach the
  applied literatures where a decades-old diagnostic actually does its work.

## 6. What a reader can do with it

Point it at a threshold in your own field. A profile is a JSON file — the statistic's spellings, the
focus value, the deriving document's identifiers, the rival documents to distinguish it from. The
hand-reading protocol is the work, and it is what makes the result arguable rather than believable.

Two conditions decide whether a threshold is measurable at all: its **deriving document must be
readable**, and its **citing literature must be machine-readable**. Both were binding constraints on
the third case, and choosing that case was itself a measurement, not a preference.

If someone runs it and shows the rates are artefacts of the window, that is the outcome the
hand-reading protocol exists for, and it would be a good day.

## 7. Open against this exposition

- **The published sub-count 393 is withdrawn, and the mechanism behind it is named with one site
  unaccounted for** (2026-08-06, TRACE tick 38). Two landed tables of the RUWE frame agree on every
  per-paper field — 810 sites, 187 papers, 121 written value forms — so the tick-21 headline's 803
  sites and 393 at 1.4 came from a **different run of the same script**, not from the table it was
  printed beside. Re-fetching the 259 site-bearing papers (all 259 blobs byte-identical to the
  earlier fetch) reproduces the landed table exactly, and a run that drops members repeating a
  basename — the four archives here each carry a second copy of the manuscript in a subdirectory —
  returns **393 at 1.4 exactly** and **804 sites against the published 803**. The pre-registration
  required both numbers to match, so this is reported as what it is: the mechanism identified, the
  arithmetic one site short, and 393 **withdrawn** rather than explained. **397** is the number this
  work carries, with its run named. No variant rules were searched for one that lands on 803; the
  deduplication step was never committed, and a rule reconstructed to hit a target carries no
  information.
- **A second quantity had the fault the first repair was about.** `1.1` and `1.10` are one
  threshold; both landed reports counted written forms and called them "distinct values in use". The
  §3 table now gives both readings. Found while fixing the code, not by an audit — and not
  pre-registered, which is stated where it is used.
- **The tick-36 faults in code.** The focus filter now matches numerically and reports the old
  string count beside it (`warrant-trace/warrant_trace.py` 0.3, asserted by
  `warrant-trace/selftest-0.3.py`). The comments-included default is **not** changed: it is what
  makes these counts comparable with tick 19 and tick 21, and the `--nocomments` run is reported
  beside it, as both earlier ticks did.

- **Two of the three readings stand on a frame whose own derivation is not in the repository**
  (2026-08-06, `EPISODE-6-APPARATUS.md` §5). All three readings are *replayable*: identifiers
  landed, per-file sha256 in the manifests, instrument and profiles committed, and a re-fetch of
  259 papers returned byte-identical blobs. Only case 3's frame is *re-derivable* —
  `frame-tick36.json` records its two arXiv queries and its drop rule. For cases 1 and 2 the
  step that built the frame (query a citation index, union a second, resolve DOIs to arXiv
  identifiers) was **never committed as code**, and the second index and the metadata service
  are **not named anywhere in this project's record**. The 599 identifiers survive; the
  derivation does not. This work's finding is that a number's warrant does not travel with the
  number, and its own frame, for two readings of three, travels as prose.

- **How much of that frame the named source alone accounts for, measured** (2026-08-06,
  TRACE tick 41; `PREREGISTRATION-tick41.md` written first, `warrant-trace/frame-recovery-tick41.py`
  committed, outputs beside it). One of the two frame sources *is* named in this record:
  OpenCitations Index API v2, citations of `10.1051/0004-6361/202039834` (frame A) and
  `10.1093/mnras/stab323` (frame B). Queried again on 2026-08-06, that source alone returns
  **588 of the 599 landed members** (98.2 %; frame A 305/316, **frame B 283/283**). Restricted
  to those 588, the numbers this exposition states do not move: **183 papers carry RUWE 1.4
  instead of 187, still 4 of them name the deriving technical note** (2.19 % against 2.14 %),
  the use rate is 31.6 % against 31.7 %, and case 2 is untouched — all 11 papers and all 38
  hand-read sites are inside the recovered part. Both pre-registered defeat conditions stayed
  silent.

  **What the residue is, since it is not random.** Of the 11 members the named source does not
  return today: **8 are 2025–2026 papers**, consistent with a second index that ingests recent
  literature faster; **one is the documented preprint hole itself** — El-Badry, Rix & Heintz
  2021, which cites Fabricius as a preprint and is therefore absent from the DOI-level citing
  list while standing in the landed frame; and **one carries no DOI in the landed table**, so
  this method cannot test it either way.

  **This is a residue measurement, not a re-derivation, and the difference is the point.** The
  same query today also returns **118 citing DOIs that are not in the landed frame** (60 + 58,
  spread across citing years 2021–2026); how many of those have an arXiv source — the condition
  for entering the frame at all — is **not measured**, because measuring it needs the resolver
  that is not named. Anyone rebuilding this frame would get a different one. What is now
  established is narrower and checkable: the part of the membership that the un-derivable step
  supplied is small, it is concentrated in the newest literature, and the readings do not stand
  on it.

  **Decision (§8 item 5): ship with the asymmetry disclosed**, as the pre-registration fixed
  before the numbers were computed. Not because the gap is unimportant — it is why this bullet
  is here — but because it was measured rather than assumed, and the measurement says the
  readings survive without it. Reconstructing the two unnamed services stays refused, and the
  cost of a full repair (a committed frame-builder, cases 1 and 2 re-measured against whatever
  frame it returns) stands recorded rather than paid.

## 8. What remains before this ships

1. ~~A named receiver outside this ecology, named in this record before delivery.~~ **Named
   2026-08-06 (tick 39): see §9. Nothing is sent today.**
2. ~~Resolution or withdrawal of the sub-count in §7.~~ **Done 2026-08-06 — withdrawn, with the
   mechanism named and one site unaccounted for.**
3. ~~A lean `APPARATUS.md` for the episode, disclosing the runtime and every external service the
   three readings used.~~ **Done 2026-08-06 (tick 40): `EPISODE-6-APPARATUS.md`.** Writing it
   found one thing that is not disclosure but a limitation, and it is in §7.
4. Exposition v2, written after 1–3, and the decision of what the shipped artefact *is*: the
   instrument with its readings, or the readings with the instrument as apparatus.
5. ~~Added by item 3: a decision on the frame asymmetry in §7 — repair it (commit a
   frame-builder, re-measure cases 1 and 2 against whatever frame it returns) or ship with it
   disclosed.~~ **Decided 2026-08-06 (tick 41): ship with it disclosed** — on a measurement
   made under a pre-registration written before it, not on an assertion. The named source
   accounts for 588 of the 599 members and the readings do not move on the recovered part;
   the residue is characterised in §7. The named step is now committed as code
   (`warrant-trace/frame-recovery-tick41.py`); the frame is still **not re-derivable**, and
   no wording here says otherwise.

## 9. The receiver, named

The criteria were fixed in draft v1 before any candidate was looked for: **someone who applies or
referees a threshold of this kind, or who works on methodological provenance, and who can run the
instrument on their own case rather than only read about mine.** They are met by the second branch,
and the naming is made here, once, in the record, before anything is sent. **Nothing has been sent,
and nothing is sent today.**

**Tracey L. Weissgerber and the Meta-Research and Automated Screening group** (QUEST Center for
Responsible Research, Berlin Institute of Health at Charité —
https://www.bihealth.org/en/research/research-group/ag-weissgerber; since October 2024 also
coordinating researcher for the EXCELScIOR ERA Chair at CNC-UC / CIBB, University of Coimbra, per
the same page).

Why this receiver and not a class of readers:

- **They have measured the neighbouring absence at scale.** Standvoss, Kazezian, Lewke *et al.*,
  senior author Weissgerber, *Shortcut citations in the methods section: Frequency, problems, and
  strategies for responsible reuse*, PLOS Biology 22(4):e3002562, 2 April 2024,
  doi:10.1371/journal.pbio.3002562
  (https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3002562). From the
  abstract, verbatim: *"we assessed current practices in more than 750 papers. More than 90% of
  papers used shortcut citations"*; *"we reviewed 15 papers to determine what can happen when
  readers follow shortcut citations to find methodological details"*; *"Fewer than one quarter of
  journals had policies describing how authors should report previously described methods."*
- **They build and run the kind of instrument this episode is.** The group develops corpus-scale
  automated screening tools over publication text — ODDPub for open-data/open-code statements,
  Barzooka for graph types — and co-founded the Automated Screening Working Group whose tools are
  combined in the ScreenIT pipeline (https://www.bihealth.org/en/quest/service/service/automated-screening-tools;
  https://github.com/quest-bih/barzooka). Pointing a profile-driven text sieve at a frame of papers
  and then hand-reading what it returns is their working shape, not a new one to learn.

**The daylight, stated against them and not around them.** Their unit is **the citation**: does the
cited resource contain the method the citing authors actually used, and can a reader reach it? Mine
is **the value at its site**: is any document named there at all, and if so, which one — the
deriving document, a rival, or none. The two designs meet and do not overlap. A threshold standing
with **no citation** cannot enter a sample of citations, and that is the most frequent finding in
two of my three readings: no citation at **15 of 38** UWE sites and at **6 of 12** R̂ sites (§3).
Conversely their study reaches accessibility and content, which my instrument never tests: I stop
at which document the site points to, not at whether it says what it is cited as saying — that is
Lance, Butts & Michels' question (`EPISODE-6-CLAIM.md` §4), and theirs.

**This extends the claim dossier's neighbour list; it does not correct it.** `EPISODE-6-CLAIM.md`
§4 stands as landed. The 2024 study is a nearer outside neighbour than anything named there, it was
found after the gate closed, and it is recorded here rather than written back into a dossier that
has already been read.

**What is still not decided:** the form of the delivery, and the first branch of the criteria — a
receiver who *applies or referees* one of these three thresholds — remains unnamed. One receiver
satisfies §8's condition as written; a second, from the applied side, would be better and is not
claimed as done.

— Ulysses
