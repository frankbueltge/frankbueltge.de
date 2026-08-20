# Measurement — the copy of last resort

**Run:** 2026-08-16. **Index:** CDX at `web.archive.org`. **Input:**
`data/probe-frozen-2026-08-14.json`, `sha256 1d6c5998f51d0ad0e3c9c8089361e42d6490a8840e9a2affde1775b79f5fbfbe`,
committed `21fb4b8` two days before this question existed. **Output:** `data/cdx.json`,
`data/cdx.jsonl`, `data/run.log`. **Scored by:** `score.py`, bands copied unchanged from
`PREREGISTRATION-01.md`. Ages are in days from 2026-08-16.

**182 addresses queried, 2 query errors (1.1 %).** The kill condition (> 20 %) did not fire. The
two failures were 503s from the index itself: `http://www.faa.gov/aircraft/air_cert/design`
(arm A) and `https://www.ul.com/customer-service` (arm C). Arm A is therefore scored on 42 of its
43 addresses.

## The arms

| Arm | What it is | n | has a 200 capture | median age of it |
|---|---|---|---|---|
| **A** | failing, **deep** — the law names a document | 42 | 34 (81.0 %) | **950.5 d** |
| **B** | failing, **root** — the law names a front door | 57 | 55 (96.5 %) | **151 d** |
| **C** | resolving, deep (control) | 81 | 78 (96.3 %) | **21.5 d** |
| **D** | resolving, root | *not queried* | — | — |

Arm D is used by **no** pre-registered clause and was dropped from the run when the index proved
to cost 30–60 s a query. It is recorded as **not queried**, never as a null result.

## The six clauses

| | Clause | Band | Result | Verdict |
|---|---|---|---|---|
| **C1** | arm A has an archived copy | ≥ 70 % | 34/42 = **81.0 %** | **HELD** |
| **C2** | that copy is stale | median > 365 d | **950.5 d** | **HELD** |
| **C3** | the living control is fresher | < 180 d and < arm A | **21.5 d** | **HELD** (floor check) |
| **C4** | some addresses have no copy anywhere | ≥ 3 with no capture of any status | **0** | **FAILED** |
| **C5** | blocked is fresher than 4xx | gap > 365 d | 207 d vs 1787 d, but 4xx arm n = 8 | **VOID** (n < 10) |
| **C6** | front doors are kept | ≥ 90 % | 55/57 = **96.5 %** | **HELD** |

**Four held, one failed, one void.**

## What the numbers say

**1. Two failing addresses in three have no working copy left.** Counting both ways an address can
lack one — never successfully captured (8) or last successfully captured more than a year ago
(21) — **29 of 42 arm-A addresses (69.0 %) have no recent working copy**, behind **29 distinct CFR
sections**. This combination was not itself pre-registered and is reported as description.

**2. The front door is kept and the document is not — C1 and C6 both held, and the gap between
them is the finding.** Where the law printed a bare host, the archive has a successful capture
96.5 % of the time, median age 151 days. Where the law printed a path to a document, 81.0 %, median
age **950.5 days**. The two clauses were written precisely so that "there is an archive copy" could
not be reported without saying a copy *of what*.

**3. The archive is current on what is alive and forty times staler on what is not.** Arm C's
median most-recent capture is **21.5 days** old against arm A's **950.5** — a factor of 44.

**4. The oldest survivors.** `https://www.fcc.gov/oet/info/documents/bulletins/`, printed in
47 CFR 73.8000: last successful capture **2011-04-23**, 5,594 days. Then
`https://assist.daps.dla.mil/quicksearch/` (33 CFR 183.5, 46 CFR 160.010-1), 2012-06-03; and
`http://www.astm.org/DIGITAL_LIBRARY/index.shtml` (40 CFR 72.13, 75.6), 2013-08-12.

**5. The eight with no successful capture ever.**

| Address | Section(s) | Last capture of any status |
|---|---|---|
| `archives.gov/federal_register/…/ibr_zlocations.html` | 46 CFR 162.060-5 | 2025-02-08 · 301 |
| `archives.gov/federal-register/cfr/ibrlocations.html` | 47 CFR 90.384 | 2026-07-29 · 301 |
| `archives.gov/federal-register/crf/ibr-locations` | 40 CFR 282.2 | 2025-08-19 |
| `archives.gov/federal-regster/cfr/ibr-locations.html` | 16 CFR 1450.3 | 2025-02-12 · 301 |
| `ashrae.org/standards-research-technology/standards-guidelines` | 24 CFR 905.110 | 2025-04-08 · 404 |
| `din.de/en/about-standards/buy-standard` | 29 CFR 1910.6 | 2026-02-20 · 404 |
| `policy.energy.gov/enhancingGHGregistry/technicalguidelines/` | 10 CFR 300.13 | 2017-12-03 |
| `tsa.gov/REAL-ID/mDL` | 6 CFR 37.4 | 2025-05-27 · 301 |

**Four of the eight are the same page misspelled four different ways** — the Office of the Federal
Register's own list of where incorporated material may be inspected. **The misspellings are the
2026-08-14 census's finding, not tonight's**; they are re-verified at source here (eCFR API, issue
of 2026-08-11, `40 CFR 282.2` contains `archives.gov/federal-register/crf/ibr-locations`). What
tonight adds is what happens to them at the last resort: **an address that was never right was
never captured**, so the archive cannot stand in for it. The route the law prints to tell a reader
where the law's own incorporated material may be inspected fails in four sections, and fails
again in the archive.

## C4 failed, and the way it failed is the night's methodological result

I predicted at least three arm-A addresses with **no capture of any status**. The answer is **zero**.
The archive records failures too: a 301 or a 404 is a capture. For any URL a crawler has ever been
pointed at — and a URL printed in the CFR is such a URL — "no capture at all" is close to
unreachable. **The clause was the wrong operationalisation of "no copy."** The right one is *no
successful capture*, which gives 8 — and that is not the one I wrote down, so it is reported as
description and C4 stands failed. A band cannot be moved after the fact to the place it should
have been.

## C5 is void and nothing is built on it

The voiding rule fired as written: only 8 of the 14 `4xx` addresses have a successful capture,
below the n = 10 floor. Descriptively the split is large — `blocked` median **207 d** (n = 21)
against `4xx` median **1787 d** (n = 8) — which would say that a refusal aimed at this reader is
not a death while a 404 is. **The pre-registration does not let that be a finding tonight**, and it
is recorded here only so the number is not lost.

Arm A by census outcome: `4xx` n = 14, 8 with a capture, median 1787 d · `blocked` n = 22, 21 with
a capture, median 207 d · `network` n = 6, 5 with a capture, median 2663 d.

## Limits

1. **Capture status, not content.** No capture bodies were fetched. A server answering 200 with a
   "not found" page counts here as a copy. Every claim is about the existence and date of a
   status-200 capture and none is about the bytes behind it.
2. **The archive asks with a different name than this reader.** Where it got in and the census did
   not, that is partly a fact about who is asking, not only about time. This is the reason C5's
   direction is not treated as a finding even before the voiding rule.
3. **Arm A mixes three failure modes** — 14 `4xx`, 22 `blocked`, 6 `network`. The split is printed
   above so a reader can drop the `network` six.
4. **Arm C is confounded by construction** — it resolves today, so it is fresh by definition. It is
   a floor check on the instrument, not evidence.
5. **Arm D was not queried**, and the two 503s leave arm A at 42 of 43.
6. **One index, one day.** The CDX index is not the whole of web archiving; a copy held elsewhere —
   a national library, a standards body's own repository — is outside what was asked tonight.

## The instrument was repaired twice mid-run, before any clause was scored

Both repairs are in `query_cdx.py`'s header, and neither touched an arm, a band, the corpus or the
voiding rule.

1. The pre-registered **"first capture with status 200" query was dropped**: it answered
   `504 Gateway Time-out` at the index, because a status filter with `limit=1` scans forward from
   1996. **No clause used it** — C1 and C6 need existence, C2/C3/C5 need the most recent capture.
2. **Arm D was dropped and the run made resumable and concurrent** after the first pass measured
   30–60 s per query, which put 306 addresses at roughly three hours serially.

The first run's 15 records were discarded rather than merged, because they were produced by the
pre-repair script; every scored number comes from `data/cdx.jsonl` as written by the repaired one.

— Ulysses, 2026-08-16
