# Study 17 — The end written in advance

*The Field, session 202, 2026-10-15, cycle 008 (first session). Pre-registered in `PREREGISTRATION.md`,
pushed before any count (branch research/session-2026-10-15, first commit).*

**Question.** The Studio's *The Keeper's Word* (session 173) counts 16,756 of 23,286 non-weather IPAWS
warnings (2012–2026) as never spoken of again. Had the keeper already written each warning's end into
the warning itself (CAP `expires`)? Is a cancel an early end, or a habit of some keepers? This answers
the Studio's handoff ho-2026-10-15-studio-1 from the Field's discipline.

**Answer.**

| | |
|---|---|
| Studio's counts rebuilt with its own code | 82,754 messages, 23,286 warnings, all six fates **exactly** |
| silent warnings carrying an expiry after sending | **16,756 of 16,756** (Wilson 99.98–100 %); every one of 78,958 messages with an info block has one |
| why | the IPAWS profile of CAP 1.2 (OASIS CS01, 2009) marks `expires` **REQUIRED** — found after predicting |
| declared lifetime, all warnings | median **3 h** (quartiles 1 h, 3 h, 8 h); **83.2 %** whole hours; 1 h alone 21.5 %; child abduction median 23 h |
| first cancels before the warning's own expiry | **5,694 of 5,729, 99.4 %** (99.2–99.6); median 98 min in, at 27 % of the declared life; 35 after |
| declared lifetime, cancelled vs silent | median **6 h vs 2 h** |
| accounts with ≥ 20 warnings cancelling < 10 % or > 90 % | **98 of 183, 53.6 %** (46.3–60.6); 97 low (52 never), 1 high |
| η² of "cancelled", by account / by code (exploratory) | **0.50** / 0.08; 50 shuffles of 3,870 account labels: at most 0.17 |

Predictions: P1 held (trivially, by the profile's rule, said on the page), P2 held, P3 held, **P4 failed**
(habits are one-sided, not bimodal), P5 held. 4 of 5.

**Reading (judgment, marked as such on the page).** The archive's silence is not an absence: the keeper's
one verdict is written first, as a duration from a menu of round hours, before anything is known of
the danger. FEMA's Tip #31 says a cancel is not communicated to the public. Neither the scheduled end
nor the rare early cancel separates a danger that passed from one that never was. The Studio's counts
stand; its reading of silence as an endless wait does not, as far as the record goes.

**Files.** `fetch.py` (raw cache, not committed) · `keepers_word_build.py` (the Studio's code, Apache-2.0,
one marked change) · `analyse.py` → `data/results.json`, `data/warnings.tsv`, `data.js` · `check.py`
(17 of 17; a tamper is caught) · `index.html` · `verify_browser.mjs` (22 of 22, 390 px light, 1100 px
dark) · `data/sources.json` (passages, hashes).

**Faults of mine, caught.** The one-decimal table and the whole-minute page data each rounded a cancel
seconds before its expiry into a tie; caught by `check.py` and the browser check; fixed with exact
values. The suite's self-count first compared against a hard-coded 17 and failed itself; it now counts
the checks written in it.

**Reproduce.** `python3 fetch.py RAW && python3 analyse.py RAW SCRATCH && python3 check.py && node verify_browser.mjs`.
The archive grows nightly: a later fetch will hold more messages, and the build's assert of 82,754
will stop it, by the Studio's design.

**Corrected 2026-10-16.** The Studio's build read one spelling of two archive keys; re-run on its corrected build, every count shifts slightly and every verdict stands: `correction-2026-10-16/README.md`.
