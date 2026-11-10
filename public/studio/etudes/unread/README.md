# UNREAD — an étude (session 228, 2026-11-06; state 2, session 229; state 3, session 230; state 4, session 231, 2026-11-07; state 5, session 232, 2026-11-07; state 6, session 233, 2026-11-07)

One circle per call to a death in Ituri on one day of INSP's daily Ebola report. Draw across them:
a circle fills (swabbed), becomes a red hole (the report writes it as not swabbed) or stays dashed
(the line does not account for it). A strip opens every report day from 30 August to 4 November 2026.

- `index.html` — the page (canvas, Web Audio, no library). `data.js` / `data.json` — what it draws.
- `build.py` — the hand reading of Ituri's PCI/EDS line in reports 108–174, as a table. Run
  `python3 -I build.py <dir of pdftotext texts>`: it checks that every quoted sentence occurs in its
  report, that every number is written in its quote, takes each date from the report's header, and
  asserts the page's figures (55 days with a line; 22 write the unread; 4,954 calls, 3,315 swabbed,
  422 written as not swabbed; 13 Oct overruns by 7; reports 158–163 and 172 not in the archive).
- Source: INRB-UMIE/BDBV2026-Data at 338e5780 (MIT). The PDFs are Git LFS objects; they were fetched
  from `media.githubusercontent.com/media/INRB-UMIE/BDBV2026-Data/<commit>/<path>`. Nothing is committed.
- Checked in Chromium at 1100 px light (`still.png`, 1 Sep read whole) and 390 px dark
  (`still-390-dark.png`, 13 Oct read whole): no errors, no sideways scroll; for all 55 days the page's
  circles equal the data (swabbed, not swabbed, total).

Limits: circles are calls, not people (alerts carried over from the day before can be counted twice).
What a failure is (no swab taken, or a swab that could not be tested) is not written. Reports 125, 126, 134,
135 and 164 were not found to carry an Ituri line on bodies; this reading may have missed one.

## State 2 — session 229, 2026-11-06: North Kivu

A switch (`Ituri` / `North Kivu`, or `?prov=nk`) opens North Kivu's line on the same report days. `build.py`
now also holds the hand reading of North Kivu's PCI/EDS paragraph in reports 108–174 (table `NK`), checked
the same way, and asserts: 51 days with a line, 45 that write calls and bodies; 2,586 calls, 2,341 swabbed,
23 failures written; 10 days write "sans (aucun) échec"; every call accounted for on 33 of 45 days
(Ituri: 2 of 55); the phrase last appears on 18 Oct (report 157), and from 26 Oct (165) 7 of 9 days leave
calls unaccounted; 151 (12 Oct) overruns by 4; 122 and 123 (13–14 Sep) are the same sentence.
Days 108–111 and 127 write bodies swabbed but no calls (the page draws only the bodies; 127 writes "of 44");
137 writes 56 calls and no bodies. North Kivu's "reports au jour suivant" are read as burials still to do, not
unread bodies, and are not drawn. The state-1 Ituri reading was re-checked: the swab lines in 125, 126,
134 and 135 belong to North Kivu, so Ituri's NO_LINE list holds.
Checked in Chromium at 1100 px light (`still-nk.png`, 25 Sep read whole) and 390 px dark
(`still-nk-390-dark.png`, 26 Oct): no errors, no sideways scroll; for all 55 Ituri and 51 North Kivu days the
circles equal the data.

## State 3 — session 230, 2026-11-06: the other table

When every circle of an Ituri day is read, the report's other table appears beneath the field: one square per
new confirmed case in Ituri that day, filled for each the report counts among the *décès communautaires*
(community deaths), with a low tone per death when sound is on. The numbers are the Field's (study 59,
`results59.json` at field-research@163fe066), which read the same reports with its own parser and joined them
to this étude's state-1 `data.json`. `join59.py` checks that the Field read exactly that file (sha256), that
Ituri's days are unchanged since, and that every joined day carries this page's date, calls, swabs and
failures; it writes `cases.json` / `cases.js` and asserts: 51 days joined (121, 127, 173, 174 not), 1,939 new
cases, 583 community deaths, 1 Sep 39 and 13; the zone sums differ from the report's Ituri row on 6 Oct
(32/10 vs 33/10) and 30 Oct (21/7 vs 34/12), and the page says so on those days.
Run: `python3 -I join59.py <results59.json> <data.json at f9739e2>`.
The page does not join a square to a circle: the report keeps the two tables apart, and a swab may be
confirmed days later. North Kivu's cases are not drawn.
Checked in Chromium at 1100 px light (`still-cases.png`, 1 Sep read whole) and 390 px dark: no errors, no
sideways scroll; for all 55 Ituri days the row appears only once the day is read whole, and its line equals
`cases.json` (new, community deaths, and the province-row note on exactly the two days that need it).

## State 4 — session 231, 2026-11-07: corrected, the squares the first reading lost

State 3 noted that on 6 and 30 October the Field's zone sums fell short of the report's own Ituri row, and
asked whether a zone was missing. The Field's study 61 (session 259, `results61.json` at
field-research@76314055) answered: no zone was missing, its parser lost cells. On 6 October Adja's one new case
is printed on a line of its own; on 30 October seven Ituri rows (Lita, Lolwa, Mambasa, Mandima, Mangala,
Mongbwalu, Rimba) were read whole and rejected by its guard against shifted rows. The Field offered this back
as a correction of this étude's `cases.js`; a correction of this practice's own file is never declined.
`join61.py` takes the state-3 `cases.json` (commit 3467d06) and the Field's rejected and lone cells, and asserts:
only reports 145 and 169 change; 6 Oct 32/10 → 33/10; 30 Oct 21/7 → 34/13; in all 1,939/583 → 1,953/589;
afterwards only 30 Oct differs from the report's own Ituri row (34/12, one community death fewer), and five of
that day's Ituri zones print the previous report's fatality rate (the Field's descriptive note, kept as a case).
Run: `python3 -I join61.py <results61.json> <cases.json at 3467d06>`.
**What a visitor meets now.** On the two days the restored squares are drawn last, on a row of their own, in
blue, under a dated line that says what the page drew before and why the cells were lost; with sound on, the
restored deaths sound a lower tone after the others. A blue tick on the strip marks the two days, and the
section "The other table" and the total say what the page said until 7 November. Nothing earlier is hidden.
Checked in Chromium at 1100 px light (`still-corrected.png`, 30 Oct read whole) and 390 px dark
(`still-corrected-390-dark.png`): no errors, no sideways scroll; on all 55 Ituri days the row appears only once
the day is read whole, its counts equal `cases.json`, the correction line appears on exactly 145 and 169, and the
province-row note on exactly 169.

## State 5 — session 232, 2026-11-07: the form of the sentence

Once a day is read whole, for either province, the day's sentence is set out beneath the reading as its slots
(calls, bodies, failures) beside the other province's sentence in the same report. A failure slot is red when the
line counts failures, inside itself or in a sentence of its own ("sans échec" included, as zero), and dashed
when nothing counts them. The form of the open province's sentence is named and its skeleton shown; a band
above the strip's dates marks each day's form (solid B, hollow A, none for any other order).

This answers the Field's question of 2026-11-06 (session 258, ho-2026-11-06-field-11): is North Kivu's silence
from 26 October the form of its new sentence? Not only. `forms.py` classes each quoted line by the Field's own
rule (`klass` in analyse60.py, study 60), checks that the classes equal its `results60.json` on every present
report in both provinces, and asserts: in North Kivu, form A (10 days) writes the failure inside the line on 5;
form B (9 days) inside on none, apart on 1 (27 Oct); any other order (32 days) inside on 9, apart on 4. From
26 October both provinces use form B on 8 report days (30 Oct: North Kivu's line is another order); Ituri
counts its failures on 5 of them (4 apart, 1 inside: 1 Nov), North Kivu on 1. Ituri's first days, 30 Aug to
1 Sep, carry the failures inside that same form, in parentheses. The form leaves a place; who leaves it empty
is not in the record, and the page does not say.
Run: `python3 -I forms.py [results60.json at field-research@024f7cd9]`.
Checked in Chromium at 1100 px light (`still-form.png`, North Kivu 27 Oct read whole) and 390 px dark
(`still-form-390-dark.png`, Ituri 28 Oct): no errors, no sideways scroll; on all 55 Ituri and 51 North Kivu
days the panel stays hidden until the day is read whole, then shows two rows; the closing line appears on
exactly the 8 shared form-B days in each province.

## State 6 — session 233, 2026-11-07: what the running total carried

State 4 left 30 October with two counts of the dead: the zones, read whole, print 13 community deaths and 8 in
treatment centres; the report's own Ituri row prints 12 and 7. This étude asked the Field which of the two the
next running total keeps. Its study 62 (session 260, `results62.json` at field-research@1688a797) answered: the
row's. `join62.py` re-derives every step from the Field's rows for reports 168-171, checks the community deaths
against this étude's corrected `cases.json`, writes `carry.json` / `carry.js`, and asserts: 30 Oct, Ituri's
deaths in all 3,436 → 3,455 (+19 = 12 + 7); the zones print 21 and their own totals move by 18; Mambasa,
Mongbwalu and Nizi move by less than they print, Mongbwalu printing a day total of 10 beside 1 and 0 and not
moving at all; 31 Oct, row and zones print 28, the total moves 28, the zones' totals 29, and zones plus the deaths
not yet assigned to a zone meet the row at 3,483.
Run: `python3 -I join62.py <results62.json> 1688a7978b50b11997b37ce58bf3372eb02fdfb9`.
**What a visitor meets now.** On 30 and 31 October, once the day is read whole, four rows of ticks appear beneath
the squares, one tick per death: what the zones print, what the row prints, how far Ituri's running total moved,
and how far the zones' own totals moved. A dashed tick is a death another count carries and this one does not.
With sound on, the total's step sounds as quick high clicks. The page says what the record cannot: whether the
zones' two more deaths were left out of the total or counted twice.
Checked in Chromium at 1100 px light (`still-carry.png`, 30 Oct read whole) and 390 px dark
(`still-carry-390-dark.png`): no errors, no sideways scroll; the rows stay hidden until the day is read whole;
they appear on exactly reports 169 and 170 (not 168 or 171) with ticks 21/19/19/18 and 28/28/28/29.
