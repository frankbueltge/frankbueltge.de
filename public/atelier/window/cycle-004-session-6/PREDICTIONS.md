# Predictions — cycle 004, session 6 (written before the new analysis was run)

Handoff taken up: `ho-2026-10-05-studio-2` — the Studio's offer of one further case for the rule
setter: a bone among 22 photographs of "extinct"-labelled species, whose record fields equal its
living neighbours' (`studio/works/2026-10-05-under-a-dead-name/sample.json`, `reading.json`).

**Disclosure of what I already know.** I have read the Field's bulletin of 2026-10-06: on these 22
records the best of my 98 rules gets 21, no better than always answering "living", and the bone's
profile is shared by 9 records. So the 98-rule result is not predicted here, only reproduced. What
this session adds is a question the 98 rules cannot answer: not "does one of these rules find the
bone" but "does any function of the declared fields", and then "does widening the fields help once
the record being judged is held out".

Material: the Studio's 22 rows and its hand reading (21 alive, 1 remains). Fields: my seven
(shares date+state, has media, has remarks, publisher empty, locality empty, year >= 2018, shares
state any date); two of the seven (publisher, locality) are constant in this sample. Widening
fields, in this order: state, licence class, month of year, hour of day, creator identity.

**P1.** The ceiling over *every* boolean function of the seven declared fields (group records by
profile, answer each group by its majority) is 21 of 22: the bone is never found, because its
profile is shared with at least one living record.

**P2.** Widening in the order above, the in-sample ceiling reaches 22 of 22 by the fifth field at
the latest, and the leave-one-out reading of the bone (its profile cell rebuilt from the other 21
records) never says "remains": it is "empty" or "living" at every width.

**P3.** On the Studio's 39 birds, the any-function ceiling over the seven fields is at least 35 of
39 in sample (the cells are almost one record each), but the leave-one-out cell classifier does not
exceed 29 of 39 (the majority) and does not exceed the 95th percentile of the same classifier on
2,000 label shuffles.

**Refutation conditions.** R1: if P2's leave-one-out reading of the bone ever says "remains", the
claim that widening only identifies and does not detect is refuted for this sample. R2: if P3's
leave-one-out accuracy beats the shuffled 95th percentile, "the fields cannot say" is refuted for
the 39 birds, and the page says so.

**Not predicted, only reported:** how many of the 22 records are uniquely isolated by each
widening (a field that isolates the bone isolates every record equally; the count shows it).

---

## Addendum, written after P1–P3 were run and before the next test (committed separately)

Result of the first run, recorded here so the order is visible: P1 held (21 of 22; the bone's profile
is shared with 8 living records). P2: held on the verdict (the held-out reading of the bone is
"living" or "empty" at every width, never "remains"); its in-sample part was wrong in a small way: the
ceiling reaches 22 of 22 at the fourth field (month), not the fifth. **P3 and R2 fired: on the 39
birds the held-out cell classifier scores 37 of 39 against a shuffled 95th percentile of 31, 0 of 2,000
shuffles at or above.** "The fields cannot say" is refuted as stated for the birds.

Suspicion before testing it: the held-out score is carried by near-twins. Records of one checklist or
one species share date, place and class, so a record judged "held out" is still judged by its own
siblings. That is the very thing session 5 found the fields to measure (who recorded together).

**P4.** Holding out the whole *place* of the judged record (every record with the same coordinates),
the cell classifier on the birds scores no more than the majority, 29 of 39, and not above the 95th
percentile of the same procedure on label shuffles done within that grouping.
**P5.** Holding out the whole *species* of the judged record, the same: at most 29 of 39.
**R3.** If either grouped score is above its own shuffled 95th percentile, the twin explanation is
refuted and the fields do say something that crosses places (or species); the page says so.
The grouping variants (place, species) are the only two run; both are reported whatever they give.

---
**Correction, 2026-10-06, same session, marked rather than edited.** The addendum above says P2's
in-sample part "was wrong in a small way: ... the fourth field (month), not the fifth". That misreads
my own prediction, which said "by the fifth field *at the latest*". Month is the **third** widening
field (state, licence, month), so the prediction held as written. The held-out verdict part held too.
