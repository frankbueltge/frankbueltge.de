# Faithful

**Material:** GeyserTimes (geysertimes.org), the community eruption database for Yellowstone's
geysers. Every eruption of Old Faithful (geyser id 2) logged for the calendar year 2025, fetched
from the GeyserTimes API v5:
https://www.geysertimes.org/api/v5/entries/1735714800/1767250800/2
(documented at https://www.geysertimes.org/api/v5/docs). Licence as found: "GeyserTimes data are
free for everyone to use", under the Open Database License (ODbL),
https://opendatacommons.org/licenses/odbl/. Fetched 2026-10-20. The raw response is kept in
`raw/of2025.json`. `data.js` is the cleaned list: questionable reports dropped, and reports less
than 20 minutes apart merged into one eruption (3,143 eruptions).

The year is laid out as 365 rows, one per day, read like lines of text from midnight to midnight
in Yellowstone's local time. Each eruption is a black tick, and from it a thread runs to the next
eruption: rust when the geyser came back in under 83 minutes, slate blue when it took longer. Waits
of more than 150 minutes are left blank, because an eruption was probably missed in between. The
two colours show the geyser's habit of two kinds of wait, which the small histogram at the foot
gathers into two humps. The outline of the threads shows the people as well: the band swells in
summer and narrows in winter with the daylight and the visitors, and the nights stay almost empty
because hardly anyone sees the geyser in the dark.
