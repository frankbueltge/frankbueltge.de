# Apparatus — *Reasonably available*

*The full-disclosure register (PROTOCOL.md §1, §2.5). The practice's own voice names no vendor;
this file does.*

## The work

| | |
|---|---|
| Artefact | `window/index.html` — one self-contained file, no external loads, no runtime fetch |
| Built by | `build_route.py` (the join) → `build_page.py` (inlines the join into the template) |
| Template | `page.template.html` |
| Verified by | `check_page.py` — drives the built page in a browser, 39 assertions |
| Size | 238 KB, of which 215 KB is the embedded record |
| Licence | code Apache-2.0 · text CC BY 4.0 · data CC0 (the house's standing constitution) |

## Machine apparatus

| Role | Provider · model · version | What it was free to decide |
|---|---|---|
| Session (join, page, records, verification) | Anthropic · Claude Opus · configured `claude-opus-5`, served model may differ and is not separately logged by the runtime | form of the artefact, prose, code |
| Coding runtime | Claude Code, on a hosted ephemeral container, Linux 6.18.5 | — |
| Browser under test | Chromium 1194 build shipped with the container, driven by Playwright (Python) | — |
| Web search (prior-art scouting only) | the session's built-in search tool | query wording |
| Python | 3.11 | — |

No paid API, dataset or metered service was used; external cost this session: **0 €**. Nothing
was added to `governance/COSTS.md` because nothing was spent.

### The cold reading, 2026-08-21

| Role | Provider · model · version | What it was free to decide |
|---|---|---|
| Three cold readers (§7, first limb) | Anthropic · Claude Opus · configured `claude-opus-5`, served model may differ and is not separately logged by the runtime | everything they said |
| What they were given | an isolated copy of `window/index.html` + `route.json`, `reading/visit.py`, and one brief | — |
| What they were denied | this repository, the exposition, the score, the six studies, each other, the web, and any statement of what the page is for | — |

Convened for the occasion and dismissed with it; §8 requires a sub-agent to be named with the
reason it was needed for *this* move, and the reason is in `reading/README.md`. They had no
freedom over publication: their answers are printed unedited whether or not they favour the work.
External cost: **0 €** — the readers ran inside the same scheduled routine as the session.

## Sources

Seven files, all committed by earlier studies in this repository, read by hash at build time. The
hashes below are printed on the page itself under *Provenance*.

*Corrected 2026-08-21. This said six, and so did the page, over a list of seven — the last row of
the table below carries two files, and the count had been read off the rows. A cold reader
counted the hashes instead and found the mismatch; the page now derives the number from the
sources rather than printing a typed one.*

| file | study | what it carries |
|---|---|---|
| `sections.json` | 2026-08-14 | the 290 sections, enumerated from the eCFR versioner structure API at issue date 2026-08-11 |
| `data/urls.json` | 2026-08-14 | 306 addresses, 1,018 occurrences, frozen and hashed **before** any host was contacted |
| `data/probe.json` | 2026-08-14 | what each address answered, both probes |
| `data/cdx.json` | 2026-08-16 | a public web archive's index, 182 addresses |
| `data/warrants.json` | 2026-08-17 | the citation printed under each section |
| `data/moves.json` + `data/rescore.json` | 2026-08-18 | 449 amendments across nine years, and the hand-check that corrected the parser |

Fetched **tonight**, and only this: `https://www.ecfr.gov/api/versioner/v1/full/2026-08-11/title-1.xml?part=51`,
to quote 1 CFR 51.1(a) and 51.7(a)(3) from the primary rather than from memory. No host in the
corpus was contacted for this build.

## Rights and publics

US federal regulation is in the public domain. No incorporated standard is reproduced,
retrieved, quoted or linked to for retrieval. The page names hosts and prints addresses exactly
as binding regulation prints them, which is public text. No host is accused of breaking any rule
and no person is named. Affected publics: none beyond this practice.

## Limits, carried onto the page itself

1. **One network, one day, one vantage point** — 2026-08-14.
2. **A 403 is a refusal, not a death.** Its cause is unmeasured and would only be measurable by
   a reader that misrepresented itself; this one did not.
3. **Archive figures are an upper bound.** No capture body was fetched, so a captured error page
   counts as a copy.
4. **Ages** are counted from the archive query of 2026-08-16, not from today.
5. **The parser behind the amendment figures made two errors** — reading a fax number and a
   street address as edition years. The study's own hand-check found them and dropped both
   sections; this build reads that correction out of `rescore.json` rather than reproducing the
   raw count. The published figures (41 of 67 moved, 26 stayed) are the corrected ones.
6. **"Failing" excludes refusals throughout**, as the 2026-08-14 census defined it. The page
   counts sections with a dead address (42) and sections with a refusing address (88) on
   separate rows and never sums them into one number.

## Correction route

`python3 build_route.py && python3 build_page.py && python3 check_page.py`

The check asserts what the page renders against the figures the six **closed** studies published
in their `MEASUREMENT.md` files — not against what this build computed, which would only check
the build against itself. It fails loudly on any drift, and it also asserts that the page issues
no request outside itself.

## What is owed before this ships

**§7's cold reading — done, 2026-08-21.** Three readers who knew nothing of this house met the
work, drove it themselves, and their answers are published unedited beside it in `reading/`. The
legibility limb is met. The second limb of §7 — whether a stranger would be glad to have met it —
is not this practice's to answer and is not claimed here or anywhere in this record.

**Still owed, and both named by the reading:** the four misspelled addresses are the work's
argument and sit below a 68,000-pixel run of cards, and the middle table lost all three readers
at the same place. `SCORE.md` §5 carries both as the next operation on this work.

**Still blocked, and not by this practice:** the artefact stays in `projects/` because the
auto-land allowlist does not contain `window/`. That line is the architect's; open since
2026-08-16.

— Ulysses, 2026-08-19 · reading appended 2026-08-21
