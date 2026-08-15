# Redirect matrix — site-v2

Every route removed on branch `site-v2` (DE mirror + the `/lab` collection page), where it now
points, and how to check it. Rules live in `public/_redirects` (Cloudflare Pages); a static
Vitest test (`src/lib/redirects.test.ts`) checks that every route in the "removed" column below
has a matching entry there, so this table and the actual redirect file can't drift apart
silently.

## German routes (42 pages, `src/pages/de/**` removed entirely)

All but two collapse to the same relative path with the `/de` prefix stripped — one blanket rule
covers them (`/de/* /:splat 301`, `public/_redirects`). The two exceptions are listed first,
ahead of the blanket rule (Cloudflare matches top-down, first rule wins), so they resolve in one
hop instead of chaining through another redirect.

| Removed (`/de/…`) | Target | Status | How it resolves |
|---|---|---|---|
| `/de` | `/` (the hub) | 301, explicit | own rule (bare path isn't covered by `/de/*`) |
| `/de/lab` | `/bestaende` | 301, explicit | own rule — flattened directly, skipping the `/lab → /bestaende` hop |
| `/de/about` | `/about` | 301 | blanket `/de/*` |
| `/de/atelier` | `/atelier` | 301 | blanket `/de/*` |
| `/de/atelier/cockpit` | `/atelier/cockpit` | 301 | blanket `/de/*` |
| `/de/atlas` | `/atlas` | 301 | blanket `/de/*` |
| `/de/beifang` | `/beifang` | 301 | blanket `/de/*` |
| `/de/consensus` | `/consensus` | 301 | blanket `/de/*` |
| `/de/contact` | `/contact` | 301 | blanket `/de/*` |
| `/de/correction` | `/correction` | 301 | blanket `/de/*` |
| `/de/datenschutz` | `/datenschutz` | 301 | blanket `/de/*` (Impressum/Datenschutz content itself is untouched, German, at the root route — see below) |
| `/de/ghost-fleet` | `/ghost-fleet` | 301 | blanket `/de/*` |
| `/de/impressum` | `/impressum` | 301 | blanket `/de/*` |
| `/de/lab/[slug]` (dynamic) | `/lab/[slug]` | 301 | blanket `/de/*` — moot: the `lab` content collection is empty (no `src/content/lab/`), so this route generated 0 static pages on either side |
| `/de/lab/ueberflug-studie` | `/lab/ueberflug-studie` | 301 | blanket `/de/*` — the EN page is real and stays (not a collection duplicate, not touched by the `/lab` → `/bestaende` redirect either) |
| `/de/parallaxe` | `/parallaxe` | 301 | blanket `/de/*` |
| `/de/pattern` | `/pattern` | 301 | blanket `/de/*` |
| `/de/plenum` | `/plenum` | 301 | blanket `/de/*` |
| `/de/praemie` | `/praemie` | 301 | blanket `/de/*` |
| `/de/protokoll` | `/protokoll` | 301 | blanket `/de/*` |
| `/de/protokoll/archiv` | `/protokoll/archiv` | 301 | blanket `/de/*` |
| `/de/protokoll/feed.xml` | `/protokoll/feed.xml` | 301 | blanket `/de/*` |
| `/de/protokoll/[datum]` (dynamic) | `/protokoll/[datum]` | 301 | blanket `/de/*` — every archived day has a real EN page |
| `/de/redaction` | `/redaction` | 301 | blanket `/de/*` |
| `/de/round-number` | `/round-number` | 301 | blanket `/de/*` |
| `/de/spielraum` | `/spielraum` | 301 | blanket `/de/*` |
| `/de/tell` | `/tell` | 301 | blanket `/de/*` |
| `/de/werke` | `/werke` → `/bestaende` | 301, two hops | blanket `/de/*` lands on `/werke`, which itself now redirects to `/bestaende` (see below) — not flattened; not one of the explicitly special-cased routes, so it's honestly left as a chain rather than silently added scope |
| `/de/werke/beifang` … `/de/werke/tell` (9 routes: beifang, consensus, correction, ghost-fleet, parallaxe, pattern, praemie, protokoll, redaction, round-number, spielraum, tell) | `/werke/<name>` | 301 | blanket `/de/*` — every one of these instrument sub-pages stays live in EN |
| `/de/work` | `/work` | 301 | blanket `/de/*` |
| `/de/work/[slug]` (dynamic) | `/work/[slug]` | 301 | blanket `/de/*` |

**Impressum / Datenschutz stay untouched** (legal requirement, German-language, root routes,
work order §6) — only their now-redundant `/de/` mirrors redirect away; the content at
`/impressum` and `/datenschutz` is not modified by this branch.

## `/lab` (decisions doc 2026-07-16 §1.4: "no two collection pages")

| Removed/changed | Target | Status | Note |
|---|---|---|---|
| `/lab` (the collection index) | `/bestaende` | 301, explicit | own rule, listed before any wildcard so it isn't shadowed |
| `/lab/ueberflug-studie` | *(unchanged — stays live)* | 200 | a real, standalone experiment page, not a collection listing; explicitly NOT covered by the `/lab` redirect (that rule has no wildcard, so it only ever matches the bare `/lab` path) |
| `/lab/[slug]` (dynamic) | *(unchanged — route stays, currently empty)* | — | the `lab` content collection has no entries (`src/content/lab/` doesn't exist yet), so this route builds 0 static pages today; nothing to redirect until it has content |
| `/lab/bigquery-dbt` (pre-existing, already-retired post) | `/bestaende` | 301 | pre-existing redirect, retargeted from `/lab` to `/bestaende` to match the collection page's new home |

`src/pages/lab/index.astro` (the file `LabIndex.astro` renders) is left in the repo, unlinked
from navigation and shadowed by the Cloudflare redirect above — the same pattern this repo
already used for `/werke` before this branch (a real file behind an index-only redirect); git is
the archive, nothing needs deleting for the redirect to take effect.

## Pre-existing redirects retargeted (not new routes, just a new final destination)

`/werke` and the already-retired `/halbwertszeit`/`/werke/halbwertszeit` redirects used to point
at `/lab`; since `/lab` itself now redirects onward, these are retargeted straight to
`/bestaende` to avoid adding an extra hop to a chain that already existed:

| Route | Old target | New target |
|---|---|---|
| `/werke` | `/lab` | `/bestaende` |
| `/lab/bigquery-dbt` | `/lab` | `/bestaende` |
| `/halbwertszeit`, `/halbwertszeit/*` | `/werke` | `/bestaende` |
| `/werke/halbwertszeit`, `/werke/halbwertszeit/*` | `/werke` | `/bestaende` |

(`/werke/<instrument>` sub-pages — beifang, consensus, correction, ghost-fleet, parallaxe,
pattern, praemie, protokoll, redaction, round-number, spielraum, tell — are untouched; only the
bare `/werke` index redirects.)

## Testing

`npm run test` runs `src/lib/redirects.test.ts`, which checks the literal list of removed routes
above against `public/_redirects` (either an exact rule or coverage by a `/de/*`-style wildcard).
Manual spot-check after deploy: `curl -I https://frankbueltge.de/de/protokoll` and
`curl -I https://frankbueltge.de/lab` should both return `301` with a `Location` header pointing
at the targets in this table.

## Nachtrag 2026-07-16 vormittags — Routen englisch + Interim-Akte

Frank hat die deutschen Begriffe in den URLs beanstandet (Wortlaut privat): der
English-only-Entscheid gilt auch für Pfade. `/encounters` und `/holdings` sind seither die kanonischen Routen (Seiten-
Verzeichnisse umbenannt, alle internen Links umgestellt); die bisherigen Ziele oben
(`/bestaende`) wurden in `public/_redirects` auf `/holdings` nachgezogen, damit keine
Zwei-Hop-Ketten entstehen.

| Route (alt) | Ziel (neu) | Status |
|---|---|---|
| `/begegnungen` | `/encounters` | 301 |
| `/begegnungen/*` | `/encounters/:splat` | 301 |
| `/bestaende`, `/bestaende/*` | `/holdings` | 301 |
| `/lab`, `/de/lab` u. a. bisherige `/bestaende`-Ziele | `/holdings` | 301 (retargeted) |
| `/akte/*` | GitHub: research-ecology `fixtures/enc-2026-001-…` | **302 — Interim**, bis die middle-web-App deployt ist; danach übernimmt die App-Route wieder |

Bewusst NICHT migriert (bleiben, bis das Praxis-Oberflächen-Paket sie geordnet umzieht bzw.
dauerhaft als Archivpfade): `/atelier/werke/*` (hängt an der Integrate-Maschinerie),
`/protokoll`, `/praemie`, `/parallaxe` etc. (Werk-Archivpfade), `/impressum`/`/datenschutz`
(Rechtstexte, deutsch).

## Nachtrag 2026-07-16 — practice-surfaces (die vier Sprachen auf die Site)

Die drei Praxis-Eingänge (`/atelier`, `/field`, `/studio`) wurden von der alten EnginePage
auf ihre eigenen Oberflächen umgestellt (Blatt/Buchrücken, Kontrollblatt/Schreiberstreifen,
Bühne/Abendzettel — ADR 0010). Dabei geändert:

| Route (alt) | Ziel (neu) | Status | Anmerkung |
|---|---|---|---|
| `/atelier/cockpit` | `/atelier/archive/cockpit` | 301 | ADR 0008: das Cockpit ist ein datiertes Artefakt; auf der Archivseite steht „the atlas now lives in material“ |
| `/praktiken` | `/` (der Hub) | 301 | die Sammelseite ist eingezogen — die vier Türen wohnen auf dem Hub; Seite + Komponente entfernt |

Neue Routen (kein Redirect nötig, nur der Vollständigkeit halber): `/atelier/history`,
`/atelier/journal`, `/atelier/works`, `/atelier/sheets`, `/atelier/material`,
`/atelier/apparatus`, `/atelier/archive/cockpit`, `/field/history`, `/field/instruments`,
`/field/journal`, `/field/apparatus`, `/studio/history`, `/studio/works`,
`/studio/apparatus`.

Unverändert (bewusst): `/atelier/werke/*` und `/field/werke/*` (Integrate-Maschinerie
schreibt dorthin; Umbenennung auf `/works` ist ein späteres Paket), `/{ns}/protocol`,
`/{ns}/requests`, `/field/chronicle.json`, `/studio/chronicle.json`.

Test: `src/lib/redirects.test.ts` („practice-surfaces routes are covered“) prüft die beiden
neuen Regeln und dass keine Wildcard die Praxis-Eingänge selbst verschluckt.

## Nachtrag 2026-08-01 — Etappe 2 (Textwände): NULL neue Redirect-Zeilen

Die Journale und Team-Kanäle wurden aufgeteilt (eine Seite je Session, Archiv je Kanal).
**`public/_redirects` bleibt unangetastet** — und zwar aus zwei unabhängigen Gründen:

1. **Kein Pfad ist umgezogen.** Alle bisherigen Adressen antworten weiter unter derselben
   URL: `/atelier/journal`, `/field/journal`, `/studio/history`, `/{ns}/requests`. Sie zeigen
   nur weniger auf einmal und verlinken den Rest. Was dazukommt, sind NEUE Routen:
   `/{ns}/requests/archive`, `/atelier/journal/{anker}` (92), `/field/journal/{anker}` (86),
   `/studio/journal` + `/studio/journal/{anker}` (56).
2. **Fragmente kann ein Redirect nicht sehen.** Die publizierten Deeplinks sind Fragmente
   (`/field/journal#cs-42`, `/atelier/journal#s37`, `/studio/history#cs-42`), und ein `#…`
   erreicht Cloudflare nie — der Browser schickt es nicht mit. Eine `_redirects`-Regel könnte
   sie also grundsätzlich nicht matchen, egal wie sie formuliert wäre. Der Umweg ist deshalb
   ein Client-Script auf genau den drei Seiten, auf die diese Links zeigen
   (`legacyJournalHashTarget()` + eine Prüfung gegen die tatsächlich gelieferten Anker im DOM,
   damit nie auf einen geratenen 404 gesprungen wird). Best-effort, JS nötig — ohne JS
   scrollt das Fragment weiter zu seiner Registerzeile, also kein Rückschritt gegenüber heute.

**Der Anker IST das Pfadsegment** (`#cs-42` → `/field/journal/cs-42/`): Die
Anker-Konvention (`cs-N`, `pre-<tag>-N`, `<tag>-<i>`, `s<n>`, `note-<slug>`) ist URL-sicher
und wird wörtlich übernommen. Damit braucht es keine Mapping-Tabelle, die driften könnte —
und die Chronik-Anker (`/{ns}/chronicle.json`) bleiben ohne Änderung gültig.

## Nachtrag 2026-08-12 — Research ecology v3: die Vier-Ebenen-Pyramide

Design-Handoff: `docs/design_handoff_research_ecology/README.md`. Diagnose (Frank, 2026-08-12):
[Wortlaut privat]. Die
Kur ist eine strikte Pyramide — **eine** Eingangsfläche (`/ecology`), **ein** Stationsblatt je
Raum, darunter nüchterne Register. Frank hat die Kill-Liste des Handoffs am 2026-08-12
bestätigt (Wortlaut privat: umsetzen wie im Handoff entworfen), also verschwinden 17 Seiten als eigene
Oberflächen.

**Kein Inhalt ist gelöscht.** Jede dieser Seiten steht vollständig in der Git-Historie; was
sie zeigten, steht jetzt auf dem Blatt, auf das sie zeigen. Das ist der Unterschied zwischen
Archivieren und Wegwerfen, und er ist die Bedingung, unter der diese Liste überhaupt
umgesetzt wurde.

| Alte Route | Ziel | Warum |
|---|---|---|
| `/maschinenraum` | `/ecology#now` | Das LAST-NIGHT-Board des Eingangs IST diese Seite — auf einer Fläche, die auch die vier Fragen ringsum beantwortet. |
| `/{ns}/history` | `/{ns}` | Chronik/Spine/Playbill: der Statuspanel und die Figur des Stationsblatts tragen denselben Bestand. |
| `/{ns}/apparatus` | `/{ns}` | Repo, Verfassung, Team-Kanal, nightly runs — jetzt Statuszeilen und Level-2-Türen. |
| `/atelier/how-a-line-ends`, `/field/how-a-claim-came-off`, `/studio/how-a-premiere-returned` | `/{ns}#figure` | Die drei Touren führten je durch eine Figur. Die Figur steht auf dem Blatt; der Anker ist derselbe, auf den jetzt auch die Türen (`NAMING.doors[].tourHref`) und die Triptychon-Karten zeigen. |
| `/atelier/sheet`, `/atelier/sheets`, `/atelier/material`, `/atelier/foundation` | `/atelier` | Fünf Einzelräume des Ateliers; ihr Zustand ist der Statuspanel, ihre Listen sind die Register. |
| `/atelier/projects` | `/atelier/works` | Der Projektlog war eine Liste — Listen wohnen auf Ebene 2. |
| `/season` | `/ecology#record` | Die Season-Ebene wurde im v2-Umbau (2026-08-08) gelöscht; die Zeitleiste trägt die Naht, die sie ersetzt hat. |
| `/notation` | `github.com/frankbueltge/research-ecology` | Ein Dokument über die Schreibweise des Hauses gehört zu den Dokumenten (Ebene 3). Der Notations-Register-Eintrag ist datiert fortgeschrieben (`src/lib/notation/register.ts`, Änderung 2026-08-12). |

Unverändert (bewusst): `/apparatus` bleibt als **eine** Seite bestehen, nur herabgestuft — der
Eingang verlinkt sie als „the full wiring →". `/{ns}/works`, `/{ns}/instruments`,
`/{ns}/journal`, `/{ns}/protocol`, `/{ns}/requests`, `/{ns}/werke/*`, `/works`, `/reception`,
`/post`, `/seed`, `/plenum`, `/catalogues`, `/atlas`, `/datasets`, `/papers` bleiben.

**Anker statt Mapping, wieder.** `#figure` ist ein echtes Ziel im DOM des Stationsblatts
(`StationSheet.astro`), nicht eine Hoffnung: die drei Tour-Routen und die Türen zeigen auf
denselben Anker, und ein Test hält beides zusammen.

Test: `src/lib/redirects.test.ts` („research ecology v3 — retired routes“) prüft alle 17
Regeln, dass keine auf eine andere umgeleitete Route zeigt (zwei Hops), und dass die drei
Touren wirklich auf der Figur landen.
