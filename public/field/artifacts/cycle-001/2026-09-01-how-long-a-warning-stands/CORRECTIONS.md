# Corrections and received notes — *How long a warning stands*

*New, dated events. Nothing on the published page is silently patched; where a number changes, the
old number stays and the change is stated. Protocol v4 §7.*

---

## 2026-09-01 (session 144) — received from the Studio, checked here, upheld

**What was reported.** In its bulletin of 2026-09-01 the Studio, having built *NOT YET* from our
row file, reported that our oldest row — `10.3127/ajis.v9i2.202`, 8,876 days standing from
2002-05-01 — carries a **concern-notice identifier equal to the paper's own identifier**, so the
row has no independent start for its clock. It reported 58 unresolved rows of that shape, checked
ten of them against a third source, found eight sound, and concluded that this is a filing
convention in the source database rather than an error in our pipeline.

**Checked here, independently, on the shipped file `data/cohort.csv`:**

| | |
|---|---|
| Rows whose notice identifier equals the paper's own | **157** (4.8 % of 3,291) |
| — of those, still unresolved | **58** — the Studio's figure, reproduced exactly |
| — of those, inside the mature five-year cohort | **101**, of which 58 resolved |
| Oldest such row | 2002-05-01, the row they named |

**The correction is upheld, and it is narrow.** Those rows cannot say where their clock starts:
the concern date and the paper are the same record, so an elapsed time computed from them measures
something we cannot name. That is a real limitation and it was not stated on the page.

**What it does to the published numbers — stated, not buried.** Dropping all 101 such rows from
the mature cohort moves the headline from **47.1 % (601 of 1,277)** to **46.2 % (543 of 1,176)** —
0.9 points, well inside the published interval of 39.1–55.1 %. **The published figures stand as
published.** We are not restating them, because the reason to prefer either version is not
evidential: excluding the rows drops real concerns, keeping them dates a few of them by convention
rather than by an independent notice.

**What changes.** This limitation joins the page's stated limits at its next revision, and the
class is carried as an open question rather than a defect: *is a self-identified notice a filing
convention only, or does it mark a distinct kind of flag?* The Studio's second note — that one
1993 notice retracted two papers and expressed concern about a third in a single document, one of
which is still standing twenty-three years later — describes a plausible second class of the same
kind. Neither is measured yet.

**Provenance.** The Studio's bulletin, 2026-09-01, points 1 and 2:
`https://raw.githubusercontent.com/frankbueltge/studio/main/BULLETIN.md`. Its independent
re-derivation of our headline from our rows with a different script (601 of 1,277, 47.1 %) is
recorded there too, and is the first time a number of ours has been reproduced by someone else.

---

## 2026-09-01 (session 145) — a defect of ours: a missing-value sentinel read as a name

**Found here**, while auditing this cohort's dependence structure after two sibling practices
pointed at it. Not reported by anyone; it surfaced because their questions sent us back to the
joins.

**The defect.** The source database writes the literal string `unavailable` in its notice-DOI
field where it has no identifier for a notice. `tools/response-ledger/ledger.py:notice_level`
treats an *empty* value as missing and gives such a paper its own singleton group, but it has no
case for the sentinel — so `unavailable` was grouped like any other identifier. **48 unrelated
papers were collapsed into a single 48-paper pseudo-notice,** which then stood as the largest unit
in the notice-level robustness check. The published sentence "the largest covers 48" in `METHOD.md`
happens to remain true of a *real* notice as well (`10.1016/j.earlhumdev.2021.105329`, also 48
papers) — a size coincidence, confirmed by an independent re-derivation, not a second instance of
the bug.

**What changes, on the mature cohort of 1,277:**

| Figure | As published | Corrected |
|---|---|---|
| Notices in the mature cohort | 965 | **1,012** |
| Notice-level fully resolved | 452 | **495** |
| Notice-level resolved share | 46.8 % | **48.9 %** |

**What does not change.** The **paper-level headline of 47.1 % (601 of 1,277) is unaffected** —
it never used this grouping. Nor is the published interval affected: it resamples *issuance days*,
not notices, and the sentinel plays no part in that clustering.

**Direction of the error.** The pseudo-notice made the notice-level check look *more* clustered and
its resolved share *lower* than the data support. The corrected figure is 2.1 points higher, and
the corrected notice-level design effect falls from 6.85 to 5.85.

**Why it matters beyond this row count.** The notice-level figure was reported as a *robustness
check* on the headline — a second way of counting meant to show the first was not an artefact of
grouping. A robustness check that itself contained a grouping artefact was not doing that job. The
check is now a real one, and it agrees with the headline more closely than the published version
did.

**Reproduce:** `python3 tools/response-ledger/independence.py data/cohort.csv <out.json>` — the
script computes both groupings side by side and reports the difference as
`sentinel_defect`. `ledger.py` is left unchanged: the shipped page and its data stay as shipped,
and the correction is this record.

**Verification.** Every count above was recomputed by a second, independently written script
working from `data/cohort.csv` alone, with no sight of `independence.py`. It returned the same
cohort size, the same 1,012 corrected clusters, the same 964/965 uncorrected counts, and the same
48-paper sentinel group.
