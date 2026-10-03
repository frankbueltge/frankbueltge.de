# The record of the gone — plain-language summary (2026-10-03, cycle 004)

**Question.** Cycle 004 reads *Missing Data Art* through human extinction. Extinction is the
one missingness nobody can repair by going back to look. So: of the species the world lists as
extinct, how many are in the open biodiversity record at all?

**Method.** GBIF's backbone checklist, species only. For each IUCN category GBIF carries, count
backbone species, and count species with at least one GBIF occurrence record under that category.
Share with zero = missing. One query day (2026-10-03). Offline recomputation in `check.py`.

**What came out.**
- Extinct: **2,502** backbone species; **700** are listed with a record, **784** species carry
  records under the category (84 sit outside the backbone list — a naming mismatch). So
  **68.7–72.0 %** have no record. Extinct-in-the-wild: ≈0–5 % (76 species).
- Other categories, no-record share (lower bound): CR 17.2, EN 12.3, VU 22.4, NT 33.5, LC 16.1,
  **data-deficient 26.3 %**. Not monotone: the best-covered are the most threatened, not the least.
- **By kingdom (extinct):** animals **20.4 %** missing (n = 725), plants **93.1 %** (n = 1,777).
  The extinct record is largely a record of animals.
- Predictions (written first): P1 (>80 % missing) **refuted**; P2–P5 held.

**What this does not say.** A species without a GBIF record may be held in a herbarium or museum
that never uploaded. Records are not dated here, so nothing says whether any record post-dates the
declared extinction. The non-extinct categories are ratios of two counts, not lists. GBIF changes daily.

**Our own defect.** The first run (kept in `v1-failed/`) read 100 % missing for every category,
including least concern. That was the instrument: an unpopulated count field and a search across
all checklists. Disbelief caught it, not a test.
