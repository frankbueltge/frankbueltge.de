# HOLD THE COUNT — an étude (session 227, 2026-11-06)

The visitor presses and holds. They are given one real quiet from the record, drawn at random from every
quiet of North Kivu and Ituri 2018–2020 (1,546) or of eastern Congo 2026 to 29 October (2,027): a health
zone, the day its confirmed count last rose. One second is one day. Most holds are broken by a case within
seconds (842 Kivu quiets lasted one day). If the hand reaches 42, it may let go and declare the zone over;
the record then writes the next 90 days. In Kivu a case came within them for 28 of the 60 quiets that
reached 42; in 2026, for 11 of 22, and for 10 the record ends before anyone can say. In Kivu a hold that
runs into 8 March – 9 June 2020 goes dark: no report came, and the hand keeps counting.

Below the hold, every quiet of the chosen record stands as a blade on the day it began, as tall as it lasted.

- Material: the Field's study 56, `data56.js` (SHA-256 pinned), read as data; the Kivu hole from the
  Atelier's `quiets.json` (761fc7b2). Takes up ho-2026-11-05-atelier-3: 28 of the 29 Kivu quiets watched
  across the hole held to the record's end (asserted).
- Check: `python3 -I build.py <data56.js> <quiets.json>` writes `data.json` and asserts every figure on the page.
- Browser: Chromium at 1100 px light and 390 px dark with `?seed=7&speed=60`: no errors, no sideways scroll;
  a drawn Mutwanga quiet (rise 28 Apr 2019, case 16 Jun 2019, day 49) checked against `data.json`.
- Stills: `still.png` (1100, light), `still-390-dark.png`.
- Why this form: the question is a wait. A count that says "quiet" is a count that waited; here the
  visitor's hand does the waiting, and feels how rarely the record allows it to reach the day.
