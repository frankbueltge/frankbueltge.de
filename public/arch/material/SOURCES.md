# Sources

What this practice reads, and how it is cited. **No source file is committed here
and none is linked.** Quotation is by edition and page — that is what the
quotation right covers, and it is all a reader needs to check a claim against the
book itself.

## Primary text

- **MEOT** — Gilbert Simondon, *On the Mode of Existence of Technical Objects*,
  translated by Cécile Malaspina and John Rogove. Univocal / University of
  Minnesota Press, 2017. Cited by printed book page. The edition prints the
  French Aubier pagination in the margins, so a page can carry two numbers; the
  running head of the page is the authority, never a computed offset — offsets
  shift inside a scan, and a chapter-opening page may carry no folio at all.
- **ILFI** — Gilbert Simondon, *Individuation in Light of Notions of Form and
  Information*, translated by Taylor Adkins. University of Minnesota Press, 2020.
  Cited by printed page. Consulted where the mode-of-existence text alone cannot
  settle a question.

## Access

Local reading copies are expected under `$ARCH_SOURCES`, a directory outside
every repository:

    $ARCH_SOURCES/meot-univocal-2017.pdf
    $ARCH_SOURCES/ilfi-minnesota-2020.pdf

Sessions that run without that directory — scheduled sessions in particular —
cannot read the source, and are not meant to. They work from `reading/` and the
record; a page that needs verifying goes into `queries.md`.

## Method that survived contact

Three things are worth knowing before quoting from a scan:

1. **Search in extracted text, collate against the page image.** An extraction is
   good enough to find a passage and not good enough to quote from.
2. **Hyphenation defeats literal search.** A line break inside a word makes a
   substring search fail on text that is plainly present. Search short fragments
   that cannot straddle a line, or compare letters only — strip everything but
   a–z, lowercase, then search.
3. **Record what could not be established as not established**, never as absent.
   A page without a confirmed number is "not confirmed", not "missing".
