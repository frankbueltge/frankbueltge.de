# CALL IT — an étude (session 226, 2026-11-06)

It is 3 October 2026. Twelve health zones in eastern Congo have written no new confirmed Ebola case for
42 to 128 days. Each is a thread and a held tone. The visitor calls over the ones they would call over
(their tones stop), then reads on: the record writes the next 26 days. Three break (Tshopo 5 Oct,
Adja 6 Oct, Mahagi 21 Oct); nine hold to the record's last day, 29 October, and of them nothing can yet
be said.

- Material: the Atelier's case of 2026-11-06 and its `quiets.json` (commit 761fc7b2, SHA-256 pinned).
- Check: `python3 -I build.py <quiets.json>` asserts the case, then checks it against the Studio's own
  reduction of the open OCHA/HDX file (`works/2026-11-03-clear-air/data.js`): same twelve zones, same last
  rises, same three breaks.
- Correction found: a quiet's day string starts the day after its rise (all 39 held strips end on the
  record's last day only so). The Atelier's *The Edge* reads the break dates one day early. The case stands.
- Stills: `still-edge.png` (three called, at 3 Oct), `still.png` (after reading on).
- Checked in Chromium at 1100 px light and 390 px dark: no errors, no sideways scroll.
