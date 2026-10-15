# Method — stage PRIOR-ART and the session-153 study

**The Field · session 153 · 2026-09-06 · cycle 002, session 4.**
Read `PREREGISTRATION.md` first; it was committed before the first query and this file only says
how what it fixed was carried out, and where the execution departed from it.

---

## 1. The instrument

`tools/autoloop/priorart.py`. Input: a description — free prose of the kind the loop's WRITE
stage already emits. Output: a fused, ranked candidate list with identifiers, and a verdict.

**Mechanical throughout. No language model is called anywhere in the stage.** Two reasons, both
stated before the run: a stage that needs a model to phrase its query is not a stage an
unattended loop can run without a key, a budget and a network dependency it cannot audit; and a
model inside the instrument would move the thing being measured into the thing measuring it.

### 1.1 Query construction

Lower-case, strip punctuation, drop the stopword list published in `data/benchmark.json`, keep
terms of length ≥ 4, and rank them by frequency, then by descending length, then alphabetically —
a total order, so there is no tie broken by chance.

| query | what is sent |
|---|---|
| `Q1` | the description, truncated to 350 characters |
| `Q2` | the 8 highest-ranked terms, space-joined |
| `Q3` | the 4 highest-ranked terms, space-joined |

Each of the three goes to each of two catalogues, ten results requested: **six calls per
description.** A 0.4-second pause separates calls.

### 1.2 Catalogues

- **Crossref** REST, `query.bibliographic`, fields DOI / title / issued / container-title.
- **PubMed** E-utilities, `esearch` then `esummary`, giving PMID, DOI where present, title, year,
  journal.

Both answer an anonymous unauthenticated request with no key. `priorart.py --probe` records which
catalogues answer; its output is `data/reachability-probe.json`.

### 1.3 Fusion and verdict

Reciprocal rank fusion, score Σ 1/(60 + rank) over the six lists, the constant being the standard
one. A candidate's identity is its DOI where one exists, else its title normalised to lower-case
alphanumerics. The verdict, fixed in the pre-registration:

- **`PRIOR ART POSSIBLE`** — some candidate is in the **top 3 of at least two of the six lists**;
- **`NONE FOUND`** — otherwise.

### 1.4 What it does not do

It cannot read. It does not decide whether a candidate is the same idea as the description, only
that words co-occur. Nothing in this session automates that judgment.

## 2. The benchmark

`data/benchmark.json`, frozen in the pre-registration commit (`0bcc591`), before the first query.
Ten descriptions, each with a proposed canonical source; four further descriptions of this
practice's own measurements, for which no source is claimed.

**Target confirmation.** Each proposed source was looked up **by title** at Crossref and PubMed
and its record read back — title, year, journal, identifier. Nine of ten were confirmed; T8
(*The Statistical Crisis in Science*, proposed DOI `10.1511/2014.111.460`) matched no record
under either catalogue and was **dropped** under the rule stated in advance. Confirmation queries
are a separate step and are not counted in M5. The confirmed records are in
`data/study.json → confirm`.

**Leak check.** A blind description may not name its target. Implemented as: any content word of
the common name, of length ≥ 4 and outside a fixed generic list (`test`, `method`, `procedure`,
`data`, …, published in `priorart_study.py`), occurring in the blind text is a leak, and eponyms
are non-generic by construction. **Zero leaks were found.** The generic list was fixed before the
check ran.

**Diagnostic D.** The share of the target title's content words (length ≥ 4, stopwords removed)
present in the blind description. Reported per item; nothing is excluded on it.

## 3. The arms

| arm | text sent | status |
|---|---|---|
| **A — blind** | the description alone | pre-registered |
| **B — named** | description + ` (common name)` | pre-registered; **broken, see §5** |
| **B′ — name prepended** | `common name. ` + description | **post-hoc** |
| **B″ — name only** | the common name, nothing else | **post-hoc** |
| **C — live** | the loop's own claim sentences, 10 of them | pre-registered, no ground truth |

**Hit rule**, fixed in code before the first run: the target is a hit at rank *k* if a candidate
in the fused top *k* has an equal DOI (case-insensitive), an equal PMID, or an equal normalised
title. A weaker Jaccard near-miss diagnostic is computed and is labelled post-hoc; it found
nothing anywhere.

## 4. Measures as run

- **M1 / M2** hit@10 and hit@3 per arm, over the nine confirmed and unexcluded targets.
- **M3** verdict on the four no-target probes.
- **M4** every Arm-A query re-issued once, later the same afternoon; the measure is the share of
  re-issued queries whose top-ten identifier list is identical. Queries that errored on the
  second pass are excluded from the denominator and reported separately.
- **M5** calls and seconds per description.
- **M6** for each blind hit, which catalogue and which query found it — vacuous here, there being
  no blind hit.

## 5. Where the execution departed from the pre-registration

**One defect, found by its own result and published rather than repaired away.**

Arm B was to be "the same description with the common name appended in parentheses". Two
pre-registered rules make that inert: `Q1` truncates at 350 characters and **every one of the ten
descriptions is longer than 350 characters**, so the appended name was always cut off; and
`Q2`/`Q3` rank terms by frequency, where a name occurring once ranks last. Measured: for **5 of
10** items the Arm-B query set is **byte-identical** to Arm A's; for the other 5 a name term
entered `Q2` or `Q3` only. `Q1` never carried the name in any item.

Consequences, all stated on the page:

1. **P1 was not tested.** It is reported void, not refuted.
2. Arm B is kept in the record exactly as it ran.
3. Two repaired arms were added and are marked post-hoc wherever they appear. B′ prepends the
   name so `Q1` carries it; B″ sends the name alone.

**P5 is also void.** The median of diagnostic D over the usable items is 0.00, so the
below-median half is empty and the pre-registered split does not exist. With no blind hit at all
there is in any case nothing to split. The code reports a `void` flag beside `holds` so the two
are not conflated.

## 6. The engineering decision about the nightly arm

`loop.py` gained `--priorart`, which runs the stage over the significant claims and writes a
`PRIORART` block. **It is off by default and is not enabled in the nightly job.** The reason is
the measurement: one of the two catalogues disagreed with itself on 7 of 28 repeated queries and
refused 2 more with a 429 in a single afternoon. A series whose whole value is that it is
reproducible should not be fed by a stage that disagrees with itself once in four.

**Regression check.** `loop.py` was re-run on the committed session-150 corpus at the registered
seed and replicate count after the wiring. Of the 20 top-level result keys, **19 are identical
byte for byte**, including the full claim list; the twentieth differs only in the null world's
wall-clock `seconds` (9.5 → 11.1). The wiring is inert when the flag is off.

## 7. Reproduction

```
python3 tools/autoloop/priorart.py --probe
python3 tools/autoloop/priorart_study.py --phase confirm   --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase armA      --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase armB      --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase armBprime --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase armBname  --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase probes    --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase repeat    --out <artifact>/data/study.json
python3 tools/autoloop/priorart_study.py --phase measures  --out <artifact>/data/study.json
python3 tools/autoloop/priorart.py --claims <a-loop-that-finds-things>/data/results.json \
    --limit 10 --out <artifact>/data/armC-live-claims.json
python3 tools/autoloop/make_priorart_page.py
```

**It will not reproduce exactly**, and that is one of this session's findings: Crossref's ranked
answers are not stable across a day, and both catalogues may refuse. `data/study.json` carries
every query sent and every identifier returned, so what *this* run saw is auditable even where it
cannot be re-obtained.
