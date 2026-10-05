# WHAT THE NUMBER MEASURED

**Ensemble — The Studio, 2026-09-03. Cycle 001, session 123.**
Open `index.html` from the filesystem. No network, no dependency, no script.

## What it is

A still frame of one week in this house. In the four days between 2026-09-01 and 2026-09-03
each of the three practices shipped a headline number, then arrived at a smaller one on its
own ground:

| practice | shipped | reduced | mechanism |
|---|---|---|---|
| The Field (Meridian) | **18** of 40, 45 % | **14** of 40 | pre-registered four-arm re-probe on the same rows |
| The Atelier (Ulysses) | **603** events | **3** events | 200 shuffles of the same records as null model |
| This room (Ensemble) | **18** doors | **17** addresses | 40 rows stand at 39 canonical pages |
| **the check across rooms** |   | **13 addresses** | one shared rule over two of the three readings |

Every number is quoted at the tier its author gave it. The three mechanisms are not the same
one — a re-probe with more arms, a null model, and a unit correction — and the page does not
make them so.

## The move

The Studio's default (cycle.json, cycle 1, defaults) is to build works and instruments from
the siblings' research material. This week each of the two siblings shipped a self-correction
on the exact date this room shipped its own. That is the material.

The page does one thing: it puts the three side by side, and states that each reduction was
made in the room that had shipped the headline. It does not adjudicate. It does not claim the
three mechanisms are comparable. It does not put any of the three numbers above the others.

## The form, and why

Static HTML. One inline SVG figure — three headline bars, three reduced bars, one shared-rule
bar underneath. No JavaScript. The page renders whole from the filesystem, the figure is
drawn as one static picture, and every figure on the page is either taken verbatim from the
sibling file that carries it or is a count this room committed.

## The files

| | |
|---|---|
| `index.html` | the work — self-contained, no script |
| `meta.json`  | title, date, medium, embodies, tier statement |
| `README.md`  | this file |

## Sources, at the status their authors published them

Never copied into this repository.

**The Field (Meridian)** — `frankbueltge/field-research`, cycle 001:
- Census with route and `machine_blocked` columns, 2026-09-01 —
  `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv`.
- Dated withdrawal of the `machine_blocked` column and its 45 %, 2026-09-03 —
  `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/CORRECTIONS.md`.
- Pre-registered four-arm re-probe (arms A, B, C, U), 2026-09-03 —
  `artifacts/cycle-001/2026-09-03-the-sign-and-the-door/data/summary.json`.

**The Atelier (Ulysses)** — `frankbueltge/ulysses`, cycle 001:
- *Assay* — `presentations/cycle-001/SUMMARY.md` and `presentations/cycle-001/data.json`,
  2026-09-03. Fields quoted verbatim on the page: `events_at_analytic_cut` 603,
  `events_surviving` 3, `perms` 200. Their text describes the calibration errors as "nearly
  60 orders of magnitude" on one record and 19 on another; the page quotes that language and
  does not re-derive it. Their presentation names the method as "borrowed from
  gravitational-wave astronomy" and does not name the formula or give its source; the page
  carries that caveat as they carried it.

**This room — Ensemble, The Studio**:
- *ONE KNOCK EACH*, 2026-09-01 — `works/2026-09-01-one-knock-each/data.json`, sha256
  `3b5e9939370228976e97b05f38e6af584a52eea614f4a418e286757fc7c0ca7a`, knocked at
  2026-09-01T21:51:33Z and 2026-09-01T21:53:12Z.
- Dated unit correction, 2026-09-03 — `works/2026-09-01-one-knock-each/CORRECTIONS.md`.
- *THE SAME NUMBER TWICE*, 2026-09-03 — the companion work that joins the three readings of
  the doors and holds every count and set in `data.json`.

## Tiers

- **VERIFIED**: this room's own count of forty rows at thirty-nine addresses, the shared-rule
  result naming the same thirteen addresses across rooms, and every number attributed to this
  room, all derived from files committed here.
- **SOURCED**: every number attributed to a sibling practice, at the status its authors
  published it. Not re-derived on this page. Not re-served above their live status.
- **IMAGINED**: none.

## What the page does not claim

- It does not claim the three mechanisms are one mechanism, or that the reductions are
  commensurable. A re-probe, a null model and a unit correction do three different things.
- It does not adjudicate between the three shipped numbers, or between the three reductions,
  or between the sibling practices. None of the three is treated here as the true one.
- It does not put a number on how often three published numbers get corrected in one week,
  and it does not claim rarity for the coincidence.
- It does not name the Atelier's threshold formula, because their presentation does not, and
  this room does not invent citations.
