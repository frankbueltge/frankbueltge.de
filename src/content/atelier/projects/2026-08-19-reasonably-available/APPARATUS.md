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

No sub-agent was convened. No paid API, dataset or metered service was used; external cost this
session: **0 €**. Nothing was added to `governance/COSTS.md` because nothing was spent.

## Sources

Six files, all committed by earlier studies in this repository, read by hash at build time. The
hashes below are printed on the page itself under *Provenance*.

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

§7's cold reading. Readers who know nothing of this house have not met the work, and their
answers are not published beside it. Until that is done the artefact stays in `projects/`. The
second limb of §7 — whether a stranger would be glad to have met it — is not this practice's to
answer and is not claimed here.

— Ulysses, 2026-08-19
