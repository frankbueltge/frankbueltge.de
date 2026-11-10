# STILL DARK — étude 2

One calendar day, held open, and a rail that is not the day.

`20 JULY 2026` stands fixed at the top of the screen. Under it a ruled field sixteen days
wide, empty. Under that a rail whose handle carries a second, smaller date: *record as it
stood on 20 July 2026*. Dragging the rail moves only that second date, day by day, to
4 August 2026. For eight days of travel nothing appears — no ship that went dark could yet
have come back and been printed. On **28 July** eleven rows appear at once, hollow. On
**4 August** they go solid and each draws its dark interval backwards across the field the
hand has just crossed. Eleven bars run under 20 July. The day never changed; what could be
known about it did.

One scroll down: the same strip dated `5 AUGUST 2026`, empty, its handle at the far left of
a rail with no track to its right.

## How to run

Open `index.html` in a browser. That is all — `file://` is fine.

No build step, no dependencies, no runtime network request, no external font, no image, no
CDN, no analytics, no storage. One file. All CSS in one `<style>`, all JS in one `<script>`,
every listener attached in JS; no inline handlers and no `style=` attributes. Nothing on the
page is random or clock-dependent: the same file always renders the same étude.

**It works with JavaScript off.** The HTML source carries four static states — `#state-1`
(handle at 20 July), `#state-2` (31 July), `#state-3` (4 August, bars drawn), `#state-4`
(the 5 August strip) — as real markup. With JS off all four render stacked, in order. With
JS on, states 1–3 collapse into the single interactive strip and state 4 becomes the ending;
the script does this by *moving the very rows the static states show*, so the two paths
cannot disagree about a character. `STATES.txt` is the text of those four states, extracted
from this markup, for reading panels.

The rail is a real `<input type="range">`: arrow keys, Home/End and Page keys move it, and it
reports its date through `aria-valuetext`. Light and dark are both handled, via
`prefers-color-scheme` and `:root[data-theme=…]`. Nothing animates.

## The data, and its tiers

Eleven vessels, from the 4 August 2026 edition of the Ghost Fleet, captured once by this
house. The whole capture is embedded verbatim in the page as a JSON island; the rendered
strip is built from it.

| tier | what, exactly | where it comes from |
| --- | --- | --- |
| **SOURCED** | the eleven names, flags, `N d dark`, waters; the edition date; the window sentence | `https://frankbueltge.de/ghost-fleet/` and the method sheet `https://frankbueltge.de/werke/ghost-fleet/`, both cited on the face |
| **DERIVED** | `back 28 Jul – 4 Aug`; `dark on 20 Jul`; the hatched right seventh of every bar; the day the rows appear (28 Jul) and the day they go solid (4 Aug) | arithmetic on the published duration and the published 7-day window — *"disabling events that ended in the last 7 days"* — with **both ends of every band printed** |
| **OBSERVED** | fetched 2026-08-05T04:39:32Z, HTTP 200, 35,473 bytes, sha256 `ed3e54ec…`; and 5 August as the day the closing strip is dated | this house's own committed capture, `projects/season1/captures/2026-08-05T043932Z.json` |

There is **no IMAGINED tier in this étude**, and no row on this page holds a time that was
invented for it. Every date attached to a vessel name is either derived from the published
duration plus the published window and shown as a band, or observed in the committed capture.

The arithmetic is the instrument's, not the étude's. Check it:

```
python3 ../../projects/season1/capture/day.py 2026-07-20     # 11–11 certain, arrived 8–15 days after
python3 ../../projects/season1/capture/day.py 2026-08-04     # knowable that day: 11
python3 ../../projects/season1/capture/day.py 2026-08-05     # 0–0
```

*"Intentional"* is a machine estimate by Global Fishing Watch — a probability, not proof. The
instrument makes no claim of illegality against any vessel or state, and neither do we. That
line stands at the foot of the page.

## The kill condition

Pre-registered in `projects/season1/DRAMATURG-67.md` §5, before this étude existed. Five
severed readers are shown the rendered text of the four states, in order, and asked:

- **T1** — *"After the first screen only: what is this screen doing?"* If 3 of 5 answer
  **(b) still loading** or **(c) broken**, the concept dies.
- **T2** — *"Across these screens, what changed?"* If 3 of 5 answer anything other than
  **(c) the day stayed the same; what was known about it grew**, the staging is wrong.
- **T3** — *"Why did the field hold nothing at first?"* If 3 of 5 answer **(a) no ships were
  dark then** or **(d) a rendering error**, the mechanism fails.
- **T4** — *"The last screen is dated today and is empty. What does that tell you about
  today?"* If 3 of 5 answer anything other than **(b) today has no record yet and may fill
  later like the other day**, the ending fails.

Above all of them, gate condition **C1**: if any invented time is found welded to a vessel
name, the étude is struck regardless of how the panel answers.
