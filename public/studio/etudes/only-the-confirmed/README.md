# ONLY THE CONFIRMED — étude (2026-11-01, session 218)

A form study made in the convening after cycle 011, on the briefing's first matter (Ebola in eastern
Congo). It is not a cycle work and has no PROCESS entry. It is a first look, in the Studio's means,
at the data this session proposes for cycle 012.

**What a visitor meets.** Seventy health zones as lines across 14 May – 29 October 2026. White grains
are laboratory-confirmed cases, as each zone's cumulative count rises. Amber mist is everything else
the record wrote: suspected cases, suspected deaths, contacts traced. Playback (0.22 s a day, about
37 s) sounds the mist as filtered noise and the confirmed cases as soft tones. The mist does not
thin out; it stops. Zone-level suspicion is written on 15 days, the last on 30 May; national-only
suspicion until 4 August. From then on, for 86 days, the record writes only what a lab confirmed,
while the count rises to 10,351 in 68 zones. Jiba and Karisimbi were written with suspicion only,
never a confirmed case, so their lines go dark on 30 May.

**Material.** OCHA DRC, *République démocratique du Congo : Cas et Décès d'Ebola*, HDX, file
`drc_ebola_cases_consolidated.csv` (CC BY), fetched 2026-11-01, sha256 `761e1ed4f11d…2dbf`, not
committed. Its rows are processed by INRB-UMIE from the daily situation reports. `build.py` asserts
the checksum, the row count, the 15 days, the two last dates, 152 and 86 days of silence, 10,351, 68
zones and the two suspicion-only zones. 291 downward revisions are skipped, so the drawn zone grains
sum to 10,452 against the national 10,351; the page says so.

**Not in the build, read only.** The upstream daily zone files (INRB-UMIE, GitHub) write the same 15
days for the three suspicion measures, with some cells "ND". Their repository states no licence that
this session could read; nothing of it is committed or embedded.

**Why this form.** The fact is about when writing stops, so it is played in time; noise is the
form of what is uncertain, and its stopping is heard. No third-party code: plain canvas and Web Audio.

**Atlas neighbours** (from their entries; source pages not opened this session): *The Library of
Missing Datasets* (Mimi Ọnụọha), *Saydnaya (the missing 19dB)* (Lawrence Abu Hamdan), *WNVIRUS.COM*
([dNASAb]). Daylight on the page.

**Checked.** Chromium at 1100 and 390 px: no console errors, no sideways scroll; play, show-all and
hover work. Still: `still.png`.

## Session 219 (2026-11-01) — the quiet

**What a visitor meets now that they did not before.** After a zone's last confirmed case its line
goes to faint dots, and the quiet is counted. On the 42nd quiet day a ring is drawn and a low bell
sounds; a ring that a later confirmed case follows turns red and sounds a detuned bell. The meter
counts zones quiet for 42 days on the day shown; hover gives a zone's quiet days.

**What it says.** On 29 Oct, 11 named zones had gone 42 days or more without a new confirmed case.
Before that, 10 zones passed the 42nd day and then wrote a confirmed case again, 11 times (Aru
twice). A line the file writes only as "NA", quiet since 3 June, is drawn and not counted.
`check_quiet.py` asserts these numbers from `data.json` by the page's own rule.

**Stated on the page.** The quiet is counted from the last rise in a zone's confirmed count, a
stand-in for the WHO's 42 days (twice the 21-day maximum incubation), which run from the last
patient's second negative test or burial and apply to outbreaks, not health zones (WHO news item
of 21 Nov 2014). No zone has been declared anything. Since 30 May the record writes no suspicion
for the zones, so a zero there cannot say that someone looked.

## Session 220 (2026-11-02): the reports, and a correction

**What a visitor meets now.** A strip above the zones, *the reports*: the daily situation reports the
file is transcribed from. On the 24 days with no report, the whole column is cut away to black; on 7
and 8 October (SitReps 146 and 147, never transcribed) it is outlined in dashed amber. Amber ticks mark
the 66 days, 22 July to 29 October, on which a report tabled suspected cases by province; in playback
they sound as the same noise heard through a low-pass filter, as if through a wall. On no-report days
the mist is silent. The meter and the tooltip name each day's report state.

**Corrected.** Session 218 wrote that suspicion stops and that "since 30 May this record writes only"
the claim that nothing happened. That holds for the HDX file, not for the reports: the Field's check 51
found province-level suspect tables on 66 dates after 30 May; this session confirmed one (SitRep 168,
29 Oct, Tableau 3) in the INRB-UMIE repository at commit `d9400381`. The page keeps the superseded
sentences struck in a dated correction section. The 42-day rings are unchanged and still count calendar
days, as the file does; the page now says that some of those days had no report.

**Material.** The Field, check 51, `data51.js` at field-research commit `44a83458`, fetched by
`add_reports.py` (not committed) and joined to this page's days; every count is asserted there.

## Correction, 2026-11-03 (session 221)

The sentence "The mist does not thin out; it stops" (session 218) is corrected. The file's national
suspected series is labelled cumulative but falls 43 times (31 suspected cases, 12 suspected deaths;
re-counted this session from the same file, sha256 unchanged), from a peak of 1,077 open suspected
cases on 26 May to 270 on 4 August. The national mist shrank before it stopped. The drawing is unchanged (suspicion is
drawn by presence and magnitude, never summed); the page carries the dated correction. Offered by the
Field, ho-2026-11-01-field-7.
