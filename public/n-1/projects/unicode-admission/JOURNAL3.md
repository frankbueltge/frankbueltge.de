# Following-journal, session 3 — 2026-10-11 (written at the end of the run from its outputs and notes, not item by item during it: T4's failure criterion is met this session)

1. Pre-registration committed and pushed (7833b13) before any register title was matched. UTC/X3L2 registers 1993-2021 fetched (all 200);
   UCD 18.0 `UnicodeData.txt` fetched for final names; CLDR 48.2 archive re-fetched only for English language names (sha256 equal to `sources2.json`).
2. Register parse: 10,424 rows, 9,274 with a link, 254 with an unparsed date (register year used). Candidates read: 219 with text, 119 without a
   link (mostly 1993-1997), 14 without extractable text (scans). Latin and Arabic hit the cap of 60 (152 and 117 candidates).
3. Registered run (`session3.json`): P1 23/28 events (82 %) held; P2 median after-asking 2 held; P3 16 of 16 long-wait units held; P4 khanda ta
   first named in L2/03-084, 2003-03-03, held.
4. **Verification (floor rule 3), deviation logged:** every code-point hit was read in context. Three named another character at that code point:
   L2/03-159 (U+0620 proposed for a triple-dot punctuation mark), L2/02-274 (U+063D proposed for seen with four dots), L2/02-327 (U+097F as a block
   range end). Re-run with these excluded (`session3_verified.json`): P1 21/28 (75 %), P2 median 1, P3 13 of 13, P4 unchanged — all still held. The
   registered run is kept as registered; the page reports the verified run and says so.
5. Name hits read by title: three are not askings but later stages (L2/03-210 a draft chart after a committee decision; L2/02-425 a comment on an
   amendment draft that already contains U+0B35; L2/98-331 a ballot). Their intervals are floors on the time since asking. `hit_kinds.json`.
6. Robustness, exploratory: loose terms over readable candidates (khanda, nukta x2, kashmiri, palochka, wa, hamza above). Earlier mentions found
   were read and none is an earlier asking: L2/12-016 mentions a "nukta-like" modifier in passing; L2/02-021 lists Kashmiri among users of marks;
   L2/00-219 on palochka argues *against* a case distinction (the small palochka, U+04CF, came in 2006). Seven terms only; not a proof.
7. Bias stated, not repaired: final-name matching and the L2-only register both push the found asking later, so after-asking is understated.
   The direction of the error favours P2 and P3; the page says so.
8. Blin (byn): asking 1998 (L2/00-081, a WG2 proposal redistributed), before Ethiopic itself entered in 1999 — before-asking is -1.
9. Page `asking.html`: first render had hollow and filled dots indistinguishable on the bar and an unnamed row (`skr`, no CLDR en name; labelled
   Saraiki, ISO 639-3); lede said "almost every year" against 186 of 228 — changed to "most". Re-rendered 1440 and 390 px: no errors, no page overflow
   (the chart scrolls in its frame at 390).
10. Not done: WG2 register; askings under other names; why any asking came when it did.
