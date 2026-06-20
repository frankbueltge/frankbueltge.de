# 06 — IA-Umsetzungsplan (Entwurf, NICHT ausgeführt)

> Konkreter Plan auf Basis von `docs/10`. **Keine Änderung wird hier ausgeführt.** Ziel:
> Start als **V4 (werkorientiert)**, wachsend zu **V2 (Forschungsarchiv)**. Jede Maßnahme ist
> ein Vorschlag und erfordert Freigabe (docs/15 P-1/P-3/P-5).

## 0. Ausgangslage (Ist)

| Bereich | Route (Ist) | Inhalt | Problem |
|---|---|---|---|
| Home | `/`, `/en` | Hero, Protokoll, WerkeStrip, Beruf | ok |
| Lab | `/lab`, `/lab/[slug]` | Untersuchungen **+** Studien **+** Eng-Notizen | vermischt (R-03) |
| Methodenblätter | `/werke/<id>` | je Werk | URL ≠ Sektionsname (R-09) |
| Werke-Index | `/werke` → 301 `/lab` | — | Redirect-Ziel ändert sich |
| Werkseiten | `/protokoll`, `/halbwertszeit`, `/parallaxe`, `/praemie` | je Werk | uneinheitlich zu `/werke/<id>` |
| Beruf | `/work`, `/work/[slug]` | data-snack, datavism | `/work` ≈ `/works` verwechselbar |
| Studie | `/lab/ueberflug-studie` | Überflug | sollte zu „Experiments" |

## 1. Zielbild V4 (Start)

```
/                Home (Hero · lebendes Protokoll · Reihe · Beruf nachgeordnet)
/research        NEU — Research Statement (_drafts/02 / 03)
/works           NEU — Index der Untersuchungen (heute der WERKE-Block aus LabIndex)
   /works/<id>   Werk- + Methodenblatt-Seite (zieht /werke/<id> + /protokoll … zusammen)
/lab             wird zu „Lab = Notizen & Experimente" (Untersuchungen ziehen aus)
   /lab/<slug>   Lab Notes (inkl. Verwerfungen, _drafts/07)
/experiments     NEU (oder Unterabschnitt von /lab) — Studien/Versuche inkl. Überflug
/projects        berufliche Projekte (heute /work, umbenannt) — data-snack, datavism
   /projects/<s> Projekt-Detail
/about           entkonsultierter Entwurf (_drafts/04 / 05)
/contact, /impressum, /datenschutz
```

## 2. Zielbild V2 (später, wenn gefüllt)

`/works` + `/methods` + `/datasets` + `/instruments` + `/notes` + `/archive` als eigene
Indizes. **Erst anlegen, wenn Inhalt existiert** (Leer-Risiko, docs/10 V3-Warnung). Bis dahin
bleiben Methods/Datasets in den Methodenblättern verlinkt.

## 3. Trennung /works (Forschung) ↔ /projects (Beruf)

- **/works** = die vier Untersuchungen (Forschung). Quelle: `src/data/werke.ts`.
- **/projects** = data-snack, datavism (Beruf). Quelle: `src/data/projects.ts`.
- **Engineering-Notizen** (`bigquery-dbt`, `server-side-tagging`) wandern aus `/lab` zu
  `/projects` (oder eigener Abschnitt „Engineering-Notizen"). **ZU KLÄREN:** Zielort.
- Namens­konflikt `/work` vs. `/works` lösen: Beruf von `/work` → **`/projects`** umbenennen.
  (Alternative: Forschung unter `/research/works`. Weniger empfohlen — länger.)

## 4. Umgang mit /lab, /work, /werke (konkret)

- **/lab** bleibt bestehen, verliert aber den Untersuchungs-Block (zieht nach `/works`).
  Danach: „Lab" = Notizen + Experimente. `LabIndex.astro` entsprechend kürzen.
- **/work** → **/projects** umbenennen; alte Pfade per Redirect.
- **/werke** (Index) → Redirect-Ziel von `/lab` auf **`/works`** ändern.
- **/werke/<id>** (Methodenblätter) → nach **`/works/<id>`** (oder `/works/<id>/methode`),
  alte Pfade per Redirect.
- **/protokoll, /halbwertszeit, /parallaxe, /praemie**: **ZU KLÄREN** — entweder behalten
  (geringeres Risiko) und nur aus `/works` verlinken, **oder** nach `/works/<id>`
  konsolidieren mit Redirects (sauberer, mehr Aufwand). Empfehlung: **Phase 1 behalten**,
  Konsolidierung in V2.

## 5. Redirect-Strategie (Vercel, `vercel.json`)

Bestehend:
```
/werke      → /lab        (301)
/en/werke   → /en/lab     (301)
```
Vorgeschlagen (nach Umbau):
```
/werke          → /works            (301)   # Ziel von /lab auf /works ändern
/en/werke       → /en/works
/werke/:id      → /works/:id         (301)   # Methodenblätter
/en/werke/:id   → /en/works/:id
/work           → /projects          (301)
/work/:slug     → /projects/:slug
/en/work        → /en/projects
/en/work/:slug  → /en/projects/:slug
```
Optional (falls Werkseiten konsolidiert werden):
```
/protokoll      → /works/protokoll   (301)   # nur wenn in V2 umgezogen; sonst NICHT
```
Hinweis: bestehende, ggf. extern verlinkte/indizierte URLs (Protokoll-Feed `/protokoll/feed.xml`,
Archiv `/protokoll/archiv`) **nicht** brechen. RSS-`alternate` in `Base.astro` mitziehen.

## 6. Reihenfolge der Umsetzung (Phasen)

1. **Inhalt zuerst (nur _drafts):** Research Statement, About, 2 Lab Notes finalisieren
   (Freigabe). *Kein* Routing-Eingriff.
2. **/research anlegen** (additiv, risikoarm): neue Route + Seite, in Nav aufnehmen.
3. **/works einführen** (additiv): neue Index-Seite aus `werke.ts`; WerkeStrip/Home darauf
   verlinken. `/lab` parallel noch unverändert lassen.
4. **/lab entschlacken:** Untersuchungs-Block aus `LabIndex.astro` entfernen; Eng-Notizen
   verschieben; Überflug zu „Experiments".
5. **Beruf umbenennen:** `/work` → `/projects` inkl. Redirects + Nav/Footer/Links.
6. **Methodenblätter** `/werke/<id>` → `/works/<id>` + Redirects.
7. **Konsistenz nachziehen:** `ui.ts`-Labels, `Footer`, `Base.astro`-JSON-LD, `site.ts`-Rolle
   (separat in docs/05 R-01).
8. **V2-Ausbau** später (Methods/Datasets/Instruments-Indizes), wenn gefüllt.

> Reihenfolge so gewählt, dass jeder Schritt **additiv/rückbaubar** ist und die Site zu keinem
> Zeitpunkt leere Sektionen zeigt.

## 7. Dateien, die später geändert werden müssten (Inventar, NICHT angefasst)

**Neu anzulegen:**
- `src/pages/research/index.astro` (+ `src/pages/en/research/index.astro`)
- `src/components/pages/ResearchPage.astro`
- `src/pages/works/index.astro` (+ en) und ggf. `works/[id].astro`
- `src/components/pages/WorksIndex.astro`
- ggf. `src/pages/experiments/index.astro` (+ en)

**Zu ändern:**
- `src/i18n/ui.ts` — Nav-Labels (`nav.work`→`nav.projects`, neu `nav.research`, `nav.works`),
  Sektionsstrings; Orphan-`dash.*` prüfen.
- `src/components/Home.astro` — Beruf-Link/WerkeStrip-Ziel; ggf. Research-Verweis.
- `src/components/WerkeStrip.astro` — Ziel `/lab` → `/works`.
- `src/components/Footer.astro` — Explore-Links (`/work`→`/projects`, `/research` ergänzen).
- `src/components/pages/LabIndex.astro` — Untersuchungs-Block entfernen; Method-Link
  `/werke/${id}` → `/works/${id}`.
- `src/pages/work/**` → `src/pages/projects/**` (Umbenennung) + `WorkIndex/WorkDetail`.
- `src/pages/werke/**` → `src/pages/works/**` (Methodenblätter) bzw. neue Struktur.
- `src/data/werke.ts` — `href`-Felder (`/protokoll` etc.) und Method-Routen anpassen.
- `vercel.json` — Redirects (siehe §5).
- `src/layouts/Base.astro` — JSON-LD `disambiguatingDescription`/`knowsAbout`; RSS-`alternate`
  falls betroffen.
- `src/lib/site.ts` — `role` ggf. an Leitsatz L3 angleichen (docs/_drafts/01).
- `src/content/lab/{bigquery-dbt,server-side-tagging}/*` — Verschiebung/Markierung als Beruf.
- `src/content/lab/ueberflug-studie/*` — nach „Experiments".

## 8. Risiken

- **Broken Links / SEO:** Umbenennungen ohne saubere 301 brechen externe/indizierte URLs.
  → vollständige Redirect-Matrix (§5), Feed/Archiv-URLs schützen.
- **i18n-Drift:** EN-Spiegel muss jede DE-Änderung exakt nachziehen (Parität, hreflang).
- **Leere Sektionen:** `/experiments`, `/notes` müssen zum Launch ≥ 1–2 Einträge haben
  (Überflug, 2 Lab Notes) — sonst Leer-Risiko (docs/10).
- **Doppelte Wahrheit:** `werke.ts` `href` vs. neue `/works/<id>` — eine Quelle der Wahrheit
  behalten, sonst Inkonsistenz.
- **Tests/Build:** Register-/Render-Tests und `astro check` nach jedem Schritt laufen lassen
  (`npm run test`, `npm run check`, `npm run build`).
- **Reihenfolge:** Routing-Umbau **vor** Inhaltsfreigabe würde leere Hüllen zeigen → Inhalt
  zuerst (§6.1).

## 9. Offene Entscheidungen (ZU KLÄREN)
- Beruf-Route-Name: `/projects` (empfohlen) vs. Alternativen — P-5.
- Werkseiten konsolidieren (`/works/<id>`) jetzt oder in V2 — Aufwand/Risiko.
- Zielort der Engineering-Notizen (`/projects` vs. eigener Abschnitt).
- `/experiments` als eigene Route oder Unterabschnitt von `/lab`.
- Ob `/research` und `/works` getrennt bleiben oder eine Sektion bilden — P-3.
