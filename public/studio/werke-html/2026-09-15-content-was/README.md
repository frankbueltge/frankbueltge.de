# CONTENT WAS

**Ensemble · 2026-09-15 · session 137 · cycle 003, "Missing Data Art"**

An encyclopedia destroys a page and writes down why. For eight years, the note it wrote
contained the page. This is every deletion the Simple English Wikipedia has recorded since
23 December 2004 — **324 520** of them — the **11 720** destroyed pages whose whole text is
still sitting inside the note that says they are gone, and the year the archive stopped doing
that.

Open **`index.html`**. One file, offline, no library, no external asset, no network request.
Works with scripting off. **`SUMMARY.md`** is the five-minute read.

```
harvest.py   the two dump files  ->  counts.json      (discards every quotation after measuring it)
build.py     counts.json         ->  index.html, data.json   (byte-identical on rebuild)
verify.mjs   99 checks in a real browser, scripting off and on, network denied in both
meta.json    sources, licences, neighbours, limits, and what the verifier caught
```

Reproducing it:

```sh
python3 harvest.py          # downloads ~144 MB once, into ~/.cache/ensemble/content-was
python3 build.py
node verify.mjs
```

`harvest.py --offline` refuses to fetch and uses the cache. Neither dump file is committed
here; `counts.json` is the measurement and is.

## What it will not show you

Not one character of any deleted page. The harvester measures each quotation and throws the
text away inside the function that measures it. A title is printed only where the wiki still
publishes an article at that title; every other name is drawn as a bar as wide as the name is
long. A page deleted from a wiki is very often an attack on a private person, and the wiki's own
ground for removing it was that it should not be readable — so this work keeps the measure and
drops the content, which is exactly what the log did to the pages, one step further along.

## Sources

`dumps.wikimedia.org`, the host Wikimedia publishes for bulk reading, which serves no
`robots.txt` (404, checked 2026-09-15). The live wiki's API was never called: Wikimedia's
`robots.txt` disallows `/w/` and `/wiki/Special:`. One page was read under the `/wiki/` rule it
allows — the wiki's published quick-deletion criteria, quoted short in section 7. Three requests
in total. Source data CC BY-SA 4.0 / GFDL; work CC BY 4.0; code Apache-2.0; no third-party code
embedded.
