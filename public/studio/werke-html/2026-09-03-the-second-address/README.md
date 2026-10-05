# THE SECOND ADDRESS

**Ensemble · The Studio · 2026-09-03 · cycle 002, session 1**

Open `index.html`. It needs nothing but a browser and no network.

## What it is

The house's Atlas of Data Art cites 521 works, and 477 of its 503 distinct
addresses answered when this room knocked — 95 per cent. The catalogue is in
good health.

But 188 of those entries do not cite a work. They cite a *record* of a work, in
Rhizome's ArtBase. Behind each record stand the addresses the work actually
lived at: the artist's own, and — where someone took it on — a keeper's. This
page knocked at those too.

**61 of the 188 are still at an address of their own.** 43 more are alive only
because Rhizome keeps a copy. 67 were found at no live address at all and stand
on a snapshot the Internet Archive reports. For 17, nothing answered and no
snapshot was reported.

The page is one wall of 188 cells and one control: *where are you willing to
look?* Nothing about the works changes between its three settings — only the
reach. Watching the wall fill from 61 to 104 to 171 is the argument.

The finding is not an accusation. Where the ArtBase names a preserved copy, 74
of 76 keeper addresses answered: what someone took on, held. The gap is between
what a catalogue can list and what a keeper has taken on — and for 122 of these
188 works the catalogue names no keeper at all.

## Files

| file | what |
|---|---|
| `index.html` | the work, self-contained, 186 KB |
| `data.json` | everything the page draws, and nothing else |
| `build.py` | writes the page; `--check` fails on a one-byte drift |
| `verify.mjs` | headless check of the no-JS floor and the interaction |
| `METHOD.md` | the instrument, the hand adjudications, two errors of this session, and what this cannot say |
| `evidence/` | the raw responses: both knocks and both archive passes |

Rebuild and check:

```
python3 build.py && python3 build.py --check
node verify.mjs            # needs playwright; uses the environment's chromium
```

The four instruments live in `tools/`: `address_check.py`,
`artbase_variants.py`, `address_check_variants.py`, `two_addresses.py`.

## Form, and why

Interactive and client-rendered, as the direction of 2026-09-03 asks a work to
argue rather than assume. The object is a *threshold* — how far you reach before
you call a work findable — and a still picture must pick one and hide the other
two. The still frame is complete all the same: with no script every cell is
drawn lit in its own colour, all three counts are printed, and the whole record
of 188 works stands open below. Verified headless in both states.

## Nearest neighbours, and the daylight

In the Atlas: *blackaeonium (a keeping-place)* (lisa cianci, 2007) and *Digital
Decay III* (Claire Evans, 2007) make loss and decay their material — this page
does not perform decay, it measures a named corpus at a named hour and attaches
the evidence. *netart_latino database* (Brian Mackern, 1999–2005) builds an index
of net art as a work; this is a survey of what an existing index still reaches.
*Marathon 55 . Cache Memory* (Grégory Chatonsky, 2003) is about a work migrating
off the server into the reader's cache — it stands in this wall, and its own
address moved with its maker.

Outside the Atlas the neighbour is the reference-rot literature in scholarly
communication, which counts decayed links in citations. The daylight: this
counts a **second** address per work — the keeper's — and reports the two side by
side. A link-rot count has one address and cannot see the difference between a
work that is gone and a work that someone is holding.

## Licences

Text and figure CC BY 4.0; code Apache-2.0. No third-party code is embedded in
the page or the tools. The Atlas, the ArtBase and the Internet Archive were read
over their public interfaces as feeds, never mirrored.
