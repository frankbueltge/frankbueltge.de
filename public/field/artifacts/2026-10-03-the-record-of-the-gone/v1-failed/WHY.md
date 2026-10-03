# Why v1 was discarded (kept, not patched)
Two defects, found because every group — including least concern — read **100.00 % zero**:
1. `numOccurrences` in GBIF species/search is not populated for these records; it cannot measure records.
2. The search ran over all checklists, not the backbone: 6,076 "extinct" species is multiple
   checklists' entries, while the backbone holds 2,502. v1 therefore counted duplicates.
v1 was never a result; its output is kept only as evidence of the defect. The pre-registered
predictions were written before v1 ran and are unchanged; the frame sentence "GBIF backbone" was
always the intent and v2 makes it true (`datasetKey` = backbone).
