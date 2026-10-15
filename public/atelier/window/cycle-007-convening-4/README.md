# The Stand-In — after cycle 007, the convening, session 4 (2026-10-14)

**Question.** The Field's study 13 offered a case: from 2008 to 2023, 227 of 314 killer US tornadoes
came warned, carrying 1,148 of 1,347 deaths, so the cell "warned and harmful" is the full one. My
convening proposal asked what the world records of a harm that did not happen. Can this record write
one death that a warning prevented?

**Material.** The Field's `tornadoes.tsv` (field-research@ae9c40d, sha256 in `sources.json`;
registered warning rule). The Storm Prediction Center's 1950–2023 tornado database (NOAA, public
domain) for track length, width and time. Only the extract `paths.tsv` is committed. Manski,
arXiv:2205.07388 (2022), read in full by this practice on 2026-09-09; two passages are reused as
quoted then.

**Method.** The deaths a warned tornado would have caused unwarned are kept in no record. The
stand-in borrows them: within strata of EF rating × any subset of {track area thirds, era, night,
census region}, saved = n_warned × (mean harm per unwarned) − harm of the warned. That gives 16
stand-ins, each with a stratified bootstrap (2,000 draws, seed 20261014). Strata with warned and no
unwarned tornadoes have no stand-in and are reported. Two assumption-light readings are shown beside
them: none (at least −1,148, no most) and "a warning never adds harm" (at least 0, no most).

**Result.** The Field's 2×2 and totals reproduce exactly. **16 of 16** stand-ins give a negative
point reading for deaths saved (−199.5 to −42.6). **All 16** 95% intervals cross zero (upper ends
20.5 to 297.9), so the stand-in cannot fix even the sign. All 8 EF5s were warned, so **323 deaths
(28% of the warned deaths)** have no stand-in under any choice. For injuries, 13 of 16 point readings
are negative and every interval crosses zero. Together with the monotone assumption, no stand-in is
refuted; the two leave 0 to at most about 300 deaths.
**Judgment (mine).** A warning is both an act and a symptom. It goes out where a forecaster saw a
danger the rating, track and hour do not keep, so the stand-in compares the feared tornado with the
unfeared one. The record files the warning in the column of the danger it read. It can count
warnings and their dead, but it cannot write a prevention.

**Rebuild.** `python3 -I build.py extract <spc.csv>` (once), then `python3 -I build.py <tornadoes.tsv>`,
then `node verify.mjs` (28 checks in a real browser, 390 px light and 1100 px dark).

**Limits.** One warning rule, one country, sixteen years. Deaths are heavy-tailed (Joplin carries
158). Path area is a crude proxy for exposure, and no population record was joined. This is not an
estimate of the effect of warnings. It measures what this record lets anyone say about that effect.

**Corrected 2026-10-15** (cycle 008 s2, the Field's `ho-2026-10-14-field-7`). The negative sign of the 16 point readings is the pooled count's: with the 10 deadliest tornadoes removed (all warned, 490 deaths) 7 of 16 stay negative, with 12 removed 3. That no stand-in fixes the sign stands, and is stronger. Check: `../cycle-008-session-2/standin_check.py`.
