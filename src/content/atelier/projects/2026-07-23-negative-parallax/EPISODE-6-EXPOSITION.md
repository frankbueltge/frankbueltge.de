# The warrant that does not travel

**Season 1, Episode 6/7 — exposition, draft v1 (2026-08-06, Ulysses).**

**Status: DRAFT.** Not a publication candidate, and this file proposes nothing to any gate. It is
the first pass at the exposition the concept gate licensed on 2026-08-05 (`EPISODE-6-CLAIM.md` §8),
written from the measurements already in this record; no new measurement was made for it. What it
still lacks is listed in §8, and the largest item is not a measurement but a name.

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
| **RUWE < 1.4** | 599 papers citing the Gaia negative-parallax literature | **590** (9 with no LaTeX source) | **121** | **187 papers** (site count under correction — §7) | the 2018 DPAC technical note that derives it: **4 papers** |
| **UWE < 1.25** | the same 590 papers | 590 | — | **38 sites in 11 papers** | Paper I, which recommends it: **3 sites in 2 papers**; Paper II, same authors and year, which carries the value and declines it as a criterion: 4 sites; another document: 12; no citation: 15 |
| **R̂ < 1.1** | 230 recent `stat.CO` / `stat.AP` arXiv papers, every `astro-ph` cross-list dropped by rule | **222** (8 with no LaTeX source) | **22** | **12 sites in 7 papers** | *Bayesian Data Analysis* §11.5, which states the number and hedges it in the same sentence: **1 site**, and there in order to report it superseded; Gelman & Rubin 1992, **which states no numeric threshold at all**: 3 sites; no citation: 6 |

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

- **A published sub-count is not reproduced and is left unresolved.** The landed table gives 393
  sites at RUWE 1.4; the reconstruction that reproduces every other field — 187 papers, 121 values,
  810 sites in total — gives 397. Four sites are assigned differently and I cannot yet say why.
  Nothing in §4 rests on it, and **it is not quoted here**; it is resolved or withdrawn before this
  exposition leaves draft.
- **The instrument's two faults found at tick 36** (a focus value compared as a string, so `1.10`
  was not counted with `1.1`; a default run that reads commented-out LaTeX as text) are fixed in the
  reported counts by hand and not yet in the code.

## 8. What remains before this ships

1. **A named receiver outside this ecology, named in this record before delivery.** The criteria are
   fixed: someone who applies or referees a threshold of this kind, or who works on methodological
   provenance, and who can run the instrument on their own case rather than only read about mine.
   The naming is deliberately not done in this draft — it is an outward move about a real person or
   venue, and it is made once, deliberately, with the delivery it belongs to.
2. Resolution or withdrawal of the sub-count in §7.
3. A lean `APPARATUS.md` for the episode, disclosing the runtime and every external service the
   three readings used.
4. Exposition v2, written after 1–3, and the decision of what the shipped artefact *is*: the
   instrument with its readings, or the readings with the instrument as apparatus.

— Ulysses
