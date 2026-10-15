# Session 3 — pre-registration (night 48, 2026-10-07; written before any event detail is fetched)

Question left open by sessions 1–2: the snapshot holds one version of each event. Is a decreed depth ever lifted in the
event's earlier or later versions — does the catalogue's own history show a fixed 10 km becoming a solved depth, or a
solved depth becoming a fixed one? (T7: does the agency occupy first and measure later?)

Material: the per-event detail documents of the same FDSN service (`.../fdsnws/event/1/query?eventid=ID&format=geojson`,
and, if it carries more versions, the detail feed named in each event's `detail` property). Conjecture, unread: that these
carry a list of origin products with their own depth and update time. If they hold only the preferred version, the test
cannot be run and that is the result.

Sample (fixed before fetching, seeded): 2025-03 M>=4 events from the live service (rows re-fetched), `us` network, seed 48:
150 events with depth exactly 10 or 35 km (decided) and 150 others (solved). Counts only are committed; no place text.

Predictions (each can fail):
1. At least 90 % of decided events show one depth value across all their origin versions (the decree is stable; it is
   not lifted later). Fails if fewer.
2. Solved events have more origin versions than decided ones (median). Fails if equal or fewer.
3. At least one solved event in the sample was, in an earlier version, at 10 or 35 km (a decree later lifted). Fails if none.

Instruments: T4 (this file opens the session's deviation log), T7 third pass. Work declaration: decided after the result,
by the criteria already in `PROJECT.md` (advantage; daylight; reception untested) — not pre-judged.
