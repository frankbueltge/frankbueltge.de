# Apparatus — Season 1, Episode 6/7, *The warrant that does not travel*

**Lean apparatus register for the episode (2026-08-06, Ulysses, tick 40).** Covers the
instrument `warrant-trace/warrant_trace.py` and the three readings taken with it
(`EPISODE-6-EXPOSITION.md` §3). It is the register the voice rule names as the place of full
disclosure: where it records a provider, a service or a version it records it as accurately as
the project's own trace allows, and marks what the trace did not log rather than inventing it
(inviolable §2.1).

This file discloses; it proposes nothing to any gate. `EPISODE-6-EXPOSITION.md` is still a
draft, and nothing has been sent to the receiver named in its §9.

## 1. What the episode consists of, as files

| Component | Files |
|---|---|
| The instrument | `warrant-trace/warrant_trace.py` (version string `warrant-trace 0.3 (2026-08-06)`), self-test `warrant-trace/selftest-0.3.py`, hand-reading helper `warrant-trace/handread_sites.py` |
| The three profiles | `warrant-trace/profiles/ruwe-1.4.json`, `uwe-1.25.json`, `rhat-1.1.json` |
| The frames | `warrant-trace/frame-tick36.json` (case 3); for cases 1 and 2 the paper list lives in the `arxiv` column of `circulation-measure.csv` (599 rows) — see §5 |
| Fetch manifests (per paper: url, sha256, bytes, members, ok) | `warrant-trace/fetch-manifest-tick34.json` (25), `-tick35.jsonl` (599), `-tick36.jsonl` (230), `-tick38.jsonl` (259) |
| Measurement tables and reports | `warrant-trace/measure-*.csv`, `measure-rhat-1.1-tick36*-report.json`, `verify-result-tick34.json`, `verify-result-tick35.json` |
| Hand-readings (the load-bearing step) | `warrant-trace/handread-uwe-1.25-tick35.csv`, `handread-rhat-1.1-tick36.csv`, `handread-rhat-1.01-tick36.csv` |
| Predecessor measurements the readings rest on | `circulation-measure.py` / `.csv` (tick 19), `circulation-measure-ruwe.py` / `.csv` (tick 21), `silent-zero-audit-tick35.py` / `.csv`, `subcount-tick38.py` / `-result.json` |
| Pre-registrations, written before each count | `PREREGISTRATION-tick19.md`, `-tick21.md`, `-tick34.md`, `-tick35.md`, `-tick36.md`, `-tick38.md` |
| Record | `TRACE.md` ticks 19, 21, 34–36, 38; `SCORE.md` §§10–11 |

## 2. Agents and roles

| Agent | Role | Oversight |
|---|---|---|
| Frank Bültge | direction; responsible human; publication decision (inviolable §2.3) | — |
| Ulysses (this practice, running on the scheduled dispatcher runtime) | chose the three cases; wrote the profiles, the instrument and the pre-registrations; ran every fetch and measurement; hand-read every load-bearing site; wrote the exposition | all records human-reviewable; auto-land paths only; no publication act |

**Runtime version — disclosed to the limit of the record.** The episode's three readings were
performed on the practice's scheduled dispatcher runtime — a large-language-model coding agent
run inside Frank Bültge's existing plan, creating no per-call invoice. **The project's trace
logs no per-tick model version for ticks 34–36 or 38, and none is reconstructed here**;
`APPARATUS.md` (the earlier work of the same line) records the one version the trace does
carry, for a run in July, and marks the later ones as a withheld disclosure rather than a gap.
That position is unchanged here and is stated rather than glossed. No claim of this episode
depends on it: the operation is corpus fetching, regular-expression sieving and hand-reading
against bibliographies, not generation whose provenance is the subject (SCORE §6).

**Hand-reading is not delegated to the sieve.** Every site carrying a focus value was read by
me against the citing paper's own bibliography. Both directions of sieve error are measured
once each and stand in the exposition (§2): false positives 7 of 25 hand-read sites
(2026-08-01), false negatives 3 of 3 missed by a flag built to catch them (2026-08-05).

## 3. External services

Every one is public, free, unauthenticated. **0 EUR. No account, no credential, no paid API, no
new external cost** (Standing Delegation §2; the ledger `governance/COSTS.md` is untouched).

| Service | Used for | Access | Politeness / volume |
|---|---|---|---|
| **arXiv e-print service** (`https://arxiv.org/e-print/<id>`) | the LaTeX source of every paper in every frame | anonymous HTTP | **one request per 3 s**, single-threaded |
| **arXiv search API** | building the case-3 frame: `cat:stat.CO AND abs:"Markov chain Monte Carlo"` and `cat:stat.AP AND abs:"Bayesian"`, 120 requested each (`frame-tick36.json`) | anonymous HTTP | 2 queries |
| **OpenCitations, Index API v2** | the citing-works lists behind cases 1 and 2: works citing `10.1051/0004-6361/202039834` (frame A) and `10.1093/mnras/stab323` (frame B) | anonymous HTTP | one pass, 2026-07-31 |
| **A second citation index**, unioned into frame A (14 additional DOIs) | same | anonymous HTTP | **not named in this project's record — see §5** |
| **A public metadata service**, resolving citing DOIs to arXiv identifiers | same | anonymous HTTP | **not named in this project's record — see §5** |
| **Crossref** | a comparison count only (378 citing works, against the frame's 365), never a source of frame membership | anonymous HTTP | one query |
| Publisher and repository pages for the deriving documents | read at source, §4 | anonymous HTTP | per document |

**Refused or unavailable, recorded at tick 19 and repeated here because a register that lists
only what worked is not a register:** one bibliographic API returned a paywall for its citation
graph and **was not paid for**; one web-search connector's shared monthly quota was exhausted
and **was not topped up**. Neither is load-bearing for any number in the exposition.

**Volume of source retrieval across the episode.** Tick 19 (≈599), tick 21 (599 re-retrieved),
tick 34 (25), tick 35 (599), tick 36 (230), tick 38 (259, plus about 40 duplicated by a surplus
process, recorded at the time) — **about 2,350 e-print requests in total, of which 1,113 are
covered by a landed manifest with per-file sha256.** The tick-19 and tick-21 figures are
reconstructed from the corpus size, not from a manifest; no manifest was landed for those two
runs.

**No full-text extraction budget was spent on this episode** (the shared, finite monthly
allowance named in the standing delegation). The deriving documents in §4 were read directly.

## 4. Documents read at source

The threshold cases stand or fall on these being read, not summarised. Each was read at the
source named, on the date named, and is quoted in the record with a section locator.

| Document | Role in the episode | Read |
|---|---|---|
| Lindegren, L. (2018), *GAIA-C3-TN-LU-LL-124-01*, §6 "An example using the RUWE" — ESA/DPAC public document service | the deriving document of `RUWE < 1.4`; its Conclusions do not contain the number | 2026-08-01, in full |
| Penoyre, Z., Belokurov, V. & Evans, N. W. (2022), MNRAS, doi:10.1093/mnras/stac959, arXiv:2111.10380 (Paper I) | the deriving document of `UWE < 1.25` | 2026-08-05 |
| Penoyre et al. (2022), doi:10.1093/mnras/stac1147, arXiv:2202.06963 (Paper II) | the sibling that carries the value and declines it as a criterion — the "displaced onto a sibling" case | 2026-08-05 |
| Gelman, Carlin, Stern, Dunson, Vehtari & Rubin, *Bayesian Data Analysis*, 3rd ed. (2013), §11.5, authors' free electronic edition | the deriving document of `R̂ < 1.1`, which hedges the number in the sentence that states it | 2026-08-05 |
| Gelman, A. & Rubin, D. B. (1992), *Statistical Science* 7(4), 457–472, doi:10.1214/ss/1177011136 | the paper the diagnostic is named after, **which states no numeric threshold** — publisher's scan, 16 pages, no text layer, read as page images | 2026-08-05, in full |
| Vehtari, A. et al. (2021), doi:10.1214/20-BA1221, arXiv:1903.08008 | the rival value 1.01, and the field's current standard reference making the same attribution | 2026-08-05 |
| Fabricius, C. et al. (2021), *A&A* 649, A5; El-Badry, K., Rix, H.-W. & Heintz, T. M. (2021), MNRAS 506, 2269 | the two frame anchors for cases 1 and 2 | ticks 2, 15, 17 |

## 5. Reproducibility — three levels, and they are not the same across the three readings

Stated plainly because it is the disclosure a receiver actually needs, and because it runs
against this work's own comfort.

**Level 1 — replayable. All three readings.** The paper identifiers are landed; the fetch
manifests carry a sha256 per file; the instrument, its profiles and its self-test are committed.
Anyone can re-fetch the same identifiers and re-run `measure`. This was not assumed: at tick 38
the 259 site-bearing papers of the RUWE frame were re-fetched and **all 259 blobs were
byte-identical** to the earlier retrieval, and the landed per-paper table reproduced with zero
disagreements.

**Level 2 — the frame is re-derivable. Case 3 only.** `frame-tick36.json` records the two arXiv
queries verbatim, the number requested from each, the duplicates, and the five `astro-ph`
cross-lists dropped by the pre-registered rule. Someone else can rebuild that frame from the
file, allowing for the drift of a live index.

**Level 3 — the frame is not re-derivable. Cases 1 and 2.** The step that built frames A and B
— query a citation index, union a second one, resolve DOIs to arXiv identifiers — **was never
committed as code.** It is described in prose in `PREREGISTRATION-tick19.md`, in the docstring
of `circulation-measure.py` and in `TRACE.md` tick 19, and its *output* is landed (the 599
identifiers). Its *process* is not, and **the second index and the metadata service are not
named anywhere in this project's record.** They were not recorded when they were used, and they
are not reconstructed now.

So an episode whose finding is that a number's warrant does not travel with the number ships two
of its three readings on a frame whose own warrant is prose. The identifiers survive; the
derivation does not. That asymmetry is disclosed rather than repaired: naming the two services
now would be reconstruction, and re-running the query step would build a *different* frame
against which the landed measurements would no longer be the measurements. What a repair would
cost — a committed frame-builder, and a re-measurement of cases 1 and 2 against whatever frame
it returns — is written down here so that the decision is a decision and not an omission.

**Level 3, measured — tick 41 (2026-08-06).** The paragraph above stated the gap and left its
size unknown, which is the shape of claim this episode counts in other people's methods
sections. It is now a number. Under `PREREGISTRATION-tick41.md`, written before the comparison,
`warrant-trace/frame-recovery-tick41.py` re-runs the **named** half of the frame step as
committed code — the OpenCitations Index API v2 citation lists of the two cited DOIs, landed
with URL, UTC, HTTP status, byte count, sha256 and record count
(`oc-citations-tick41.jsonl`, `frame-recovery-tick41.csv`, `frame-recovery-tick41.json`).

- The named source alone returns **588 of the 599 landed members** (98.2 %): frame A 305 of
  316, **frame B 283 of 283** — for case 2 the unnamed union partner left no detectable trace
  at all.
- Restricted to those 588, the exposition's numbers do not move: RUWE 1.4 carried by 183
  papers instead of 187 with the **same 4** naming the deriving technical note (2.19 % against
  2.14 %), use rate 31.6 % against 31.7 %, and case 2 wholly inside the recovered part (11
  papers, 38 hand-read sites, identical document distribution). Both pre-registered defeat
  conditions stayed silent.
- The 11-member residue is **not random**: 8 are 2025–2026 papers, one is the documented
  preprint hole (El-Badry, Rix & Heintz 2021), one carries no DOI in the landed table and is
  untestable by this method.
- **Recovery is not re-derivation.** The same query today returns **118 citing DOIs absent from
  the landed frame**; what fraction of them have an arXiv source is unmeasured, because
  measuring it needs the resolver that stays unnamed. Level 3 therefore stands as level 3: the
  frames of cases 1 and 2 are **not re-derivable**, and this measurement bounds what the
  un-derivable step contributed instead of removing it.

The decision it grounds — ship with the asymmetry disclosed — is recorded in
`EPISODE-6-EXPOSITION.md` §8 item 5, with the repair's cost still standing unpaid.

**The known hole in frame A, carried from tick 19 and not closed:** El-Badry, Rix & Heintz 2021
cites Fabricius et al. nine times and is absent from every DOI-level list of works citing the
published article, because it cites the preprint. Every rate in the exposition is a rate over
the stated frame, never over the field, and the exposition says so in its own §5.

## 6. Rights, publics, licence

- **No source text is redistributed.** What is landed is derived: per-paper flag tables, counts,
  and hand-reading notes. The `match` column of a hand-reading carries the matched fragment —
  a few words, e.g. `hat R < 1.1` — and the note beside it is my own description. Quotations in
  the exposition and the profiles are short, attributed and section-located, for commentary.
- **All fetched sources are the authors' own arXiv submissions**, retrieved through the public
  e-print interface under arXiv's terms; none is republished here.
- **No sensitive personal data of any kind** (Standing Delegation §6). The unit of analysis is a
  sentence in a published methods section.
- **Named third parties are authors of public scientific documents**, named only for what their
  documents demonstrably say, with locators. The exposition's §5 states flatly that no error,
  misuse or sloppiness is alleged of anyone and that nothing here found a wrong number — that
  sentence is part of the apparatus, not decoration.
- **Affected publics:** the authors in the frames, and the receiver named in the exposition's
  §9. Nothing has been sent to the receiver; the naming stands in the record first, by decision
  (`SCORE.md` §11, tick 39).
- **Publication remains human.** No `PUBLICATION.json` is created or modified by this file.

## 7. Limits held

0 EUR · no account, no credential, no paid API · no bulk catalogue download · one e-print
request per 3 s · no full-text-extraction budget spent on this episode · auto-land paths only ·
no publication act.

## 8. Public credit line

> Ulysses / Atelier — a situated artistic research practice by Frank Bültge, developed through
> documented human–machine operations.
