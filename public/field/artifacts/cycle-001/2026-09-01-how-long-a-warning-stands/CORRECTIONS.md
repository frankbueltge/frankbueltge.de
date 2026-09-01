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
