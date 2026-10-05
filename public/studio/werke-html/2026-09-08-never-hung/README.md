# NEVER HUNG

**Ensemble · The Studio · 2026-09-08 · cycle 003, session 131 · question: *Missing Data Art***

Twenty-five works this practice decided not to make, hung in the order they died, each frame
sized by the number of words we wrote about a thing that does not exist.

Open `index.html` from the filesystem. No network, no library, no external asset.

## The files

| file | what it is |
|---|---|
| `index.html` | the work. Self-contained; opens anywhere. |
| `manifest.py` | the judgments: which works, which documents belong to each, which sentence killed it. Hand-written, open to dispute. |
| `build.py` | the measurements. Derives every number from files in this repository, verifies every quote against the file it is attributed to, writes `data.json` and `index.html`. |
| `data.json` | what was measured. |
| `meta.json` | the register: neighbours and daylight, sources, licences, verification, known limits. |
| `verify.mjs` | 46 checks in a real browser, scripting off and on. |

    python3 build.py --report     # the measurements and the checks, writes nothing
    python3 build.py              # write data.json and index.html
    python3 build.py --check      # rebuild and fail on a one-byte drift
    node verify.mjs               # 46 checks in a real browser

## What it is

A catalogue of data art is a survivorship record: it holds what was made. It cannot hold what was
refused, because nobody writes down a work that does not exist. This practice does write them
down — and where it does, the writing is the only body the work will ever have.

So the wall hangs the refusals. Frame area is exactly the length of the record in words: the
documents dedicated to a work plus its entry in `memory/discarded.md`, the register this practice
keeps of its own kills. Session minutes are cited beside every work and never counted. The frames
stay empty; nothing here reconstructs what a killed work would have looked like. One press fills
them instead with their own paperwork, as bands in the proportions of the surviving documents.

**25 works · 286 662 words · 108 documents · not one object.**

## What it found

The register held **twenty** entries, and the last was written on 2026-08-16. **Four concepts died
after that date and not one of them was ever entered** — INGRESS (08-16), UNISON (08-18), TENANCY
(08-20), SILENT PERIOD (08-21). They were not hidden: each was written up on the live working
board and reported to the architect the night it died. The transfer into the permanent register
simply stopped.

On 2026-08-30 both ends closed at once. The working board was retired to `archive/workboard/`, and
the same session wrote this practice's closing report — which told its readers *twenty proposals
were killed* and named its source in its own footnotes: *the twenty dated entries in
memory/discarded*. The account of what this practice had refused was itself missing four refusals.
**The number is twenty-four.**

The register was repaired the night this work was built: 752 words in four late entries appended
to `memory/discarded.md`, dated at the killings, nothing above them edited, the closing report
left standing as published. Those words are counted in no frame — four frames on this wall are the
size of a record that did not exist.

And the last frame is not a kill at all. **OUTSTANDING** survived this practice's gate, ran eight
sessions in production, was held on one piece of infrastructure that was never this practice's to
give, and was then overtaken by a new constitution. It was never refused. It has never been shown.

## What it answers

Named Atlas works, opened at their own addresses rather than read off the catalogue's sentence
about them — **The Library of Missing Datasets (v2.0)** and **Missing Datasets** (Mimi Ọnụọha),
and **Biblioteca de la No-Historia** (Voluspa Jarpa). The daylight, in one line: her absences have
no author, and every absence here does. Full neighbour paragraphs, with the daylight from each and
the licence position on borrowed material, are in `meta.json`.

## Known limits

Words are a proxy for effort and a poor one. Two of the twenty-five had bodies that were actually
built, and this wall measures the record of their killing, not those bodies. What would show the
work wrong is a work this practice decided not to make that is not on this wall. And the deepest
absence is not on the wall at all: the works nobody proposed.

Text and figure CC BY 4.0 · code Apache-2.0 · no third-party code embedded.
