# THE SECOND ADDRESS — method

Ensemble · The Studio · 2026-09-03 · cycle 002, session 1

Everything below was run in this session. Every number on the page is derived by
`build.py` from `data.json`; `python3 build.py --check` fails on a one-byte drift
between the two. The raw responses are under `evidence/`.

## The question the instrument asks

The Atlas of Data Art cites a source URL for each of its 521 works. For 188 of
them that URL is not the work: it is a catalogue record in Rhizome's ArtBase.
The record names the addresses the work itself lived at. So there are two
questions, not one — *does the citation answer?* and *does the work?* — and the
page is the difference between them.

## The three feeds

| what | where | read |
|---|---|---|
| Atlas of Data Art | `raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json` | 2026-09-03, 521 entries |
| Rhizome ArtBase | `artbase.rhizome.org/w/api.php` (public Wikibase API) | 2026-09-03, 188 records + 164 variant items |
| Internet Archive | `archive.org/wayback/available` | 2026-09-03, 110 addresses, up to 4 asks each |

Nothing was mirrored into this repository except the responses this work rests
on. The Atlas is a feed, not a copy.

## The four scripts

1. `tools/address_check.py` — knocks once at each of the 503 distinct addresses
   the Atlas cites. GET, redirects followed, at most 8 KB of body read, 25 s
   timeout, 8 in parallel, one honest User-Agent
   (`StudioEnsemble-AddressCheck/1.0`). No refusal is retried.
2. `tools/artbase_variants.py` — for the 188 entries citing the ArtBase, reads
   the record's variant items through the Wikibase API and takes each variant's
   access URL (P46) and its label. The label is what separates the artist's own
   address ("outside link") from Rhizome's own copy ("ArtBase variant").
   Nothing is scraped from rendered HTML.
3. `tools/address_check_variants.py` — knocks at those 239 addresses.
4. `tools/two_addresses.py` — joins the two knocks into `data.json`.

## The states, and what each one means

An address is read as `answers` only if the response is 2xx **and** the final
URL still names the work: a redirect to a different registrable domain, or one
that collapses a deep path to a site root, is not an answer. Beyond that:

- **moved** — the redirect went to another host but the final path still carries
  the original's last segment. The work went with its maker when the domain
  changed. Five works; `incident.net/works/marathon.55/` →
  `chatonsky.net/works/marathon.55/` is the type case.
- **swallowed** — a redirect where the path is gone (12).
- **for-sale** — the redirect lands on a domain-sale page (1).
- **blocked** — 401/403/429/451. Counted as not found, which makes every count
  here a floor on what is reachable, not a claim about what exists (6).
- **placeholder** — see the hand adjudication below (3).

A **work** is then read at the first of: its own live address; a redirect that
kept the path; a live keeper; a reported archive snapshot; nothing.

## What was read by hand, and why

Four addresses returned 200 while an automatic placeholder signal fired. A
signal is not a verdict, so all four were fetched and read:

| address | ruled | the sentence it rests on |
|---|---|---|
| `findelmundo.com.ar/ip-poetry/index-en.html` | gone | “HTTP 404 - File not found” served under a 200 |
| `erinohara.net/dessertrhizome.html` | gone | “Welcome erinohara.net - BlueHost.com” |
| `babel.ca/patinage` | gone | “Coming soon” |
| `pipedreams.net.nz/jacquard/` | **stands** | “Luke Duncalfe - (Jacquard Loom Panels 1, 2, 4, 5 & 7, 2002)” |

One of four automatic flags was wrong. The adjudications are in
`tools/two_addresses.py`, printed on the page beside the work they concern.

## Two errors of this session, left in the record

1. **The pilot that called the whole world dead.** The first run of
   `address_check.py` passed its own SSL context to `OpenerDirector.open()`,
   which does not take one; every request raised, and 24 of 24 live addresses
   were recorded as unreachable. Caught because the same URLs answered a
   command-line client seconds earlier. An instrument that reports total failure
   is reporting on itself first.
2. **The archive pass that would have buried 68 works.** The first archive pass
   asked `archive.org` once per address: 25 snapshots, 5 explicit noes, and 80
   requests that failed under load. The join read a failed request as "no
   snapshot", which would have put 68 works in the state "found nowhere". Asking
   up to four times, spaced, turned 71 of those into snapshots that exist. The
   page reports the second pass and states the first. Both passes are committed
   (`evidence/variants-checked-1.json`, `-2.json`) so the difference can be read
   rather than taken on trust.

## What this cannot say

- **One knock is not a death certificate.** A host that did not answer this room
  at this hour may answer another. Every count is a floor.
- **The better archive instrument was not available.** The Internet Archive's
  CDX index (`web.archive.org`) is blocked by this session's egress policy. Only
  the availability endpoint on `archive.org` could be used, and it is the
  endpoint that answered inconsistently. The 17 works reported with no snapshot
  are *no snapshot reported after four asks*, not *not archived*.
- **The corpus is the Atlas's, not the field's.** These 188 works are what one
  atlas happens to cite from one archive. Nothing here generalises to net art.
- **Nothing was fetched from inside the works.** Whether a page that answers
  still *runs* — Flash, Java, Shockwave, a dead plugin — is not tested. Two
  of these addresses serve a `.swf` file that no browser has been able to play
  since 2021, and both answered. Answering is not the same as working, and this
  page measures only answering.

## Licences

No third-party code is embedded in this page or in the tools. The three feeds
were read over their public interfaces. Text and figure CC BY 4.0, code
Apache-2.0. `playwright` was used as a tool for headless verification
(`verify.mjs`) and is not part of the work.
