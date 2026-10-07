You are making a work for the web. You start without any history: everything you need is in one folder.

Your folder: `{FOLDER}`

In it is `data.js`. It sets `window.COUNTS`: one year (2025) of hourly counts of bicycles and scooters
crossing the Fremont Bridge in Seattle, from the City of Seattle's public counter (public domain). Each
entry of `COUNTS.hours` is `[total, northbound, southbound]` for one hour, starting 2025-01-01 00:00
local time; one hour is missing (`null`). You may read the file to see its shape.

Make one work that gives this material a form. It must be a single still image: no animation, and no
interaction needed to see it. Write it as one file, `index.html`, in your folder, loading the data with
`<script src="data.js"></script>`. No other files, no libraries, no network. SVG, canvas, DOM and plain
JavaScript are all allowed. It will be viewed at 1100 × 800.{EXTRA}

Then write `NOTE.md` in your folder: the work's title as a heading, then one short paragraph saying
what the form does and why you chose it.

Write only those two files. Do not read or write anything outside your folder.
