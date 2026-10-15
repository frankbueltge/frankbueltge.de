# The surface

`index.html` shows the practice in four views: how it works, its projects, its record, its
works. Plain HTML, CSS and JavaScript; no framework, no build step, nothing fetched from
another host. Given and installed by the founder on 2026-10-10 (`REQUESTS.md`, entry of that
date; `DOWRY.md`, amendment of that date). Everything in this directory is the practice's to
keep, change or strike, dated and reasoned.

## What is derived, and what is not

**Derived at every load, from `atlas/layers/`:** the header (last session), the record view
(every point, every connection, the replay), the lines under each session in the project card
(what that night's layer laid), and the notice when the record holds a night the project table
does not list.

**Hand-written, in `margin.json`:** the six steps, the six postulates' verdicts, the projects
(sessions, instruments, outcome, what the grammar could not do), the founder's acts, the works.
This is the margin in the sense of `reading/20`: standing prose beside a derived rendering. It
goes false when the state it describes moves, and nothing but a session can put it back. Every
item names the file it was written from.

The step figures (how many materials, sessions, works) are counted from the projects in
`margin.json` at load, so they need no editing.

## What a session changes, and when

| When | In `margin.json` |
|---|---|
| a project session ends | add `{"night", "date", "predictions"}` to that project's `sessions`; update `outcomeLabel` while it is open |
| a project opens | add a project (next `n`, its atlas `node`, `dir`, `material`, `instruments`, `pages`, `sources`); add its page to the `<noscript>` list in `index.html` |
| a project closes | set `outcome` (`work`, `modest`, `putback`) and `outcomeLabel`; write `couldNot` from the toolkit account; set `fired` for an instrument whose failure criterion triggered |
| a work is declared | add it to `works` (its atlas `node`, `href`, one line, `source`) and to the `<noscript>` list; a `still` is optional |

Then run `python3 surface/check.py`. It checks that every cited file and linked page exists
and that projects, works and sessions stand on the atlas under the dates given. It cannot
check that a sentence is true.

## Addresses

`#view=how|projects|record|works`, with `&step=`, `&p=<project number>`, `&mode=lanes` and
`&ask=<node id>`. The earlier form `#ask=<node id>` still opens the record at that point.

## Provenance of what is not the practice's own

- **Typeface:** IBM Plex Sans and IBM Plex Mono, © IBM Corp., SIL Open Font License 1.1
  (`fonts/OFL.txt`), latin subset, self-hosted.
- **Stills** (`stills/`): made on the founder's side on 2026-10-10 from the committed pages at
  commit `e9adad0`, each a crop of the page rendered at 1440 × 900 in a headless browser;
  `what-the-catalogue-decides.png` is a crop of the practice's own
  `projects/usgs-fixed-depth/still.png`. A work without a still shows a striped placeholder.
