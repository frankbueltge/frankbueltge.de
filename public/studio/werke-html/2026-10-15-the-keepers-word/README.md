# THE KEEPER'S WORD — Ensemble, 2026-10-15 (session 173, cycle 008)

> **Corrected 2026-10-15 (session 174).** The archive spells two of its keys two ways (`areas`/`area`, `parameters`/`parameter`); session 173's build read only the first spelling, so for about half the messages it missed the phone text and the area codes. Read both, the counts move: 23,154 warnings, not 23,286 (132 more read as tests by their phone text); never spoken of again 16,644, not 16,756 (still 72 %); cancelled with no reason 5,423, not 5,510; with a reason 287, not 218; 3,846 sending accounts, not 3,870; withheld 8,142, not 7,574. The 16 sent in error and the Hawaii sequence stand. The superseded counts stay in session 173's commit and journal.

> **Corrected 2026-10-16 (session 176).** The person word list missed alert names (Silver, Ashanti), "be on the lookout" and descriptions of a body; the critique of FILED UNDER found such texts shown. A wider list (`PERSONWIDE` in `build.py`) now withholds the words of 963 more warnings. No count changes. The archive is read as it stood before 2026-10-14T06:00Z, since it has grown.

Every warning that sheriffs, counties, fire districts, states and other keepers (not the National Weather Service) sent to the public through FEMA's alert system, as FEMA's public archive holds them: 23,154 warnings from 3,846 sending accounts, October 2012 to October 2026. Played on a time line with sound, each warning waits for its keeper's next word.

- **16,644** (72 %) are never spoken of again. **799** are updated and never closed. **5,423** are cancelled with no reason the work can read. **287** are cancelled with a reason: 182 with a person found, 105 with a danger passed. Median time to a cancel: 98 minutes.
- **16** messages say a warning was sent in error: 1 cancel, and 15 fresh messages, read by hand, that name no earlier message (Hawaii's "False Alarm" of 2018-01-13 among them).
- **Hawaii, 2018-01-13.** The missile warning went out at 18:07:08 UTC. Its cancel followed at 18:12:42 and carries no words. The correction went out as a new message at 18:45:00, 38 minutes after the warning, and in the record is tied to nothing.
- **No message carries heeded, ignored or never needed.** The only verdict the archive keeps with certainty is the keeper's verdict on its own message.

Rebuild: `python3 -I fetch.py RAW && python3 -I fetch_followups.py RAW && python3 -I build.py RAW && node verify_browser.mjs`

- `fetch.py`: every message whose sender is not the weather service (82,754), selected fields. `fetch_followups.py`: the signed CAP text of every update and cancel (8,300), to read `<references>`. Raw files stay outside the repository; their hashes are in `raw-manifest.json`.
- `build.py`: the rules (tests out by code and by words; follow-ups tied by references; fixed word lists for the later words; the 15 retractions read by hand and listed with a line each; text about people withheld; sender names shown only when they read as an institution, addresses never). Asserts the message count, the Hawaii sequence and that the cancel has no words. Writes `data.js` and `summary.json`.
- `verify_browser.mjs`: 19 checks each at 390 px (light) and 1100 px (dark), 38/38.

Limits: the word lists read text, not events; an error a keeper never wrote down is not counted; who received a warning and what anyone did are not in the archive and not measured; a warning a keeper should have sent and did not is not in the archive at all. 8,142 warnings have their text withheld here because they name or describe a person.

Source: FEMA, OpenFEMA IPAWS Archived Alerts v1 (public domain). Third-party code: none.
