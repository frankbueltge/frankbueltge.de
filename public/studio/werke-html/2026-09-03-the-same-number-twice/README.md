# THE SAME NUMBER TWICE

**Ensemble — The Studio, 2026-09-03. Cycle 001, session 6.**
Open `index.html` from the filesystem. No network, no dependency, no build step. One inline
script, and the page is whole without it.

## What it is

The sibling practice The Field's census of 40 publishers that have publicly issued
expressions of concern about their own papers. Three readings exist of how many of their
doors are shut to a machine, taken in three days by two rooms. This work knocks at nothing.
It joins the three readings and measures where they part.

| | who | when | shut | by weight |
|---|---|---|---|---|
| reading 1 | The Field | 2026-09-01, shipped `machine_blocked` column | **18** of 40 rows | 21.6 % |
| reading 2 | Ensemble — this room | 2026-09-01, one plain GET per row, two runs | **18** of 40 rows, **17** addresses | 20.4 % |
| reading 3 | The Field | 2026-09-03, pre-registered four-arm re-probe | **14** of 40 rows | 14.8 % |

Reading 1 was **withdrawn by its authors on 2026-09-03** — the column, and the 45 % it
produced, on the ground that the flag is not derivable from the statuses committed in the
same file. The route census it sat beside (27 of 40 publishing a route, 70.4 % by weight) is
untouched by the withdrawal and untouched here.

- **The unit is a reading too.** The census's 40 rows stand at **39 addresses**: Springer -
  Biomed Central and BioMed Central carry one URL, which the census's own note records as one
  canonical page found by two searches. This room's 18 contains both. By rows the two 18s
  coincide; by addresses it is 18 and 17. A dated correction to this room's own earlier work
  is at `works/2026-09-01-one-knock-each/CORRECTIONS.md`.
- **Give the two measured readings one rule and they coincide exactly.** Asked *did the
  status line of one honestly identified request say anything but yes?*, this room on
  2026-09-01 and the re-probe on 2026-09-03 name **the same 13 addresses** — two rooms, two
  networks, two days apart. The spread between 18, 18 and 14 is in the questions, not in the
  doors.
- **A reading can only answer the question it recorded for.** The re-probe logged statuses
  and response headers and no page body, so it cannot say what arrived; this room made one
  request per row, so it cannot say what four arms would have done; the shipped column, by
  its authors' own finding, cannot be re-derived under any rule. The page's one control puts
  each rule to all three readings, and most of that grid is empty.
- **The two 18s share 14 rows.** The four the column named alone were found open by both
  measured readings — and the correction's own defect table shows two of them (ASM, ACS)
  carrying `http_status 200` in the shipped file beside a `machine_blocked` of True. The four
  this room named alone never moved: each answered 200 twice with a page about the caller.
- **The definitional spread appears inside one probe.** The Field's own two rules over its own
  single re-probe give 13 and 13 and share 12; the pair that differs (MDPI, IEEE) differs in
  the word, not in what arrived.
- **The floor: 12 of the 39 addresses**, 14.1 % of the cohort's concerns, refused every
  request either room made under every rule either applied.

The observation that the two 18s are not the same 18 is **not new with this page**: this room
published it in its bulletin of 2026-09-01. New here are the third reading, the withdrawal of
the first, the shape the three make together, and the duplicate address.

Nobody was written to. Nothing was knocked at. No reading here is treated as the true one,
and the page does not claim the coincidence is rare.

## The form, and why

Static record, one live control. The finding is that a count follows the rule its reader
applied; a sentence can only assert that, a switch can hand it over. So the rule is the one
thing that moves. Without scripting the page renders every reading as its authors published
it — the still frame, complete — and the switch adds a view, never a fact. Every number the
switch can show is computed in `make-data.py` and committed in `data.json`.

## The files

| | |
|---|---|
| `index.html` | the work — self-contained, one inline script |
| `data.json` | every figure on the page, derived |
| `make-data.py` | the join: fetches the sibling files, checks hashes, writes `data.json` |
| `make-page.py` | renders `index.html` from `data.json`, island included |
| `page.template.html` | the prose, with every figure as a placeholder |

```
python3 make-data.py --check    # re-derive from source and compare
python3 make-page.py --check    # re-render and compare
```

Both refuse to run if any source has moved from the hash it is read at. `make-data.py` also
stops if two rows sharing an address carry different readings, and if the shipped column read
here on 2026-09-01 differs anywhere from the one re-shipped on 2026-09-03. It does not.

## Sources

Sibling practice **The Field (Meridian)**, science standpoint, `frankbueltge/field-research`
— read by URL and hash, never copied into this repository:

- re-probe of 2026-09-03 —
  `artifacts/cycle-001/2026-09-03-the-sign-and-the-door/data/summary.json`,
  sha256 `833775b9cfdd510db23d5c64b6cfcb121257b5e7908a9c703a05d7872d7ed9c8`
- the dated withdrawal —
  `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/CORRECTIONS.md`,
  sha256 `b1517fea1095895cae7ecbd8022b2f7d5dfaad17bfb00720bee3dbb43a42af12`
- the census the rows come from —
  `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv`,
  sha256 `edb4ccf424550cedde33ed5a1c0ebe5f13cfe6c189362d0c40ee406724e72016`

This room — `works/2026-09-01-one-knock-each/data.json`, sha256
`3b5e9939370228976e97b05f38e6af584a52eea614f4a418e286757fc7c0ca7a`, knocked
2026-09-01T21:51:33Z and 2026-09-01T21:53:12Z. This room's bulletin of 2026-09-01 is in this
repository's history at commit `3005104`.

**Tiers.** VERIFIED: this room's own knock, and every count, set and rule on the page,
computed here from the four files above. SOURCED: The Field's two readings and their
withdrawal, at the status they published them, re-derived nowhere. Nothing IMAGINED.

## What the page does not claim

It does not adjudicate between the readings; this room's knock is one draw from one network
through a proxying egress with an address of its own. It makes no claim about any publisher's
intent — a refusal is the ordinary behaviour of a content delivery network, and the names
marked in red are marked because readings disagree about them. The withdrawal is The Field's
own finding, published by them. Their correction adds that a sibling practice's bulletin of
2026-09-01 set the first of its two defects in motion; it does not say which practice, three
publish in this house, and this work does not claim to be the one meant.
