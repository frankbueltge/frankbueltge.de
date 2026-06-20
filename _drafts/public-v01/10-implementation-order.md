# 10 — Umsetzungsreihenfolge (public-v01, NICHT umgesetzt)

> Konkrete Reihenfolge für die spätere Umsetzung. **Keine Umsetzung hier.** Jede Phase ist
> einzeln freizugeben; nach jeder Phase Tests/Build. Grundlage: `01-public-mvp-scope`,
> `06-ethics-patches`, `07-url-and-ia-plan`, `08-first-lab-notes`, `docs/05`, `_drafts/08`.

## Leitregel
**Blocker zuerst, dann Text/Konsistenz, dann IA, dann Ethik, dann Notes, dann Tests, dann
Go-Live-Check.** Routing-Umbau erst, wenn die Inhalte stehen — sonst zeigt die Site leere Hüllen.

## Phase 0 — Blocker / Recht *(früh starten, läuft extern parallel)*
- Impressum/Datenschutz mit **echten** Daten (`_drafts/11`) einsetzen → `src/data/legal.ts`
  (Platzhalter + `draftNote` entfernen).
- **Rechtliche Prüfung** anstoßen (extern; längste Vorlaufzeit — deshalb zuerst).
- *Abschluss:* keine `[…]`/„ENTWURF"-Strings mehr in `legal.ts`.

## Phase 1 — Text & Konsistenz *(keine Routing-Änderung)*
- **About** ersetzen: `src/data/about.ts` ← `_drafts/public-v01/04` (DE) / `05` (EN).
- **Footer-Tagline:** `ui.ts` `footer.tagline` an O1 angleichen (weg von „Data & AI Engineer …").
- **Rolle/Meta:** `src/lib/site.ts` `role` ← O1; `ui.ts` `meta.home.*` entkonsultieren.
- **JSON-LD:** `src/layouts/Base.astro` `disambiguatingDescription` + `knowsAbout` auf die
  Forschungs-/Doppelidentität (Forschungsvokabular ergänzen).
- **`package.json`** `description` neutralisieren („Award-caliber" raus).
- **Werktitel EN** (`_drafts/12`): `werke.ts` + `ui.ts` (`prot/hw/px/px2/uefl.title`); Serie
  „The File of the Present". **Vorsicht:** Protokoll-Registerstrings unter `render.test.ts` —
  Titeländerung mit Testlage abgleichen; Protokoll-*Inhalt* bleibt deutsch.
- **Parallax-Zahl:** „acht" ↔ 12 angleichen (`werke.ts`/Frontend) oder Zahl entfernen.
- *Abschluss:* `npm run test` + `npm run check` grün.

## Phase 2 — IA & Redirects *(nach Phase 1; additiv/rückbaubar, siehe 07)*
1. `/research` anlegen (Inhalt aus `02`/`03`) + Nav/Footer.
2. `/works` anlegen (Index aus `werke.ts`); Home/WerkeStrip darauf zeigen.
3. `/lab` entschlacken (Untersuchungs-Block → `/works`); „Notizen & Studien".
4. Beruf `/work → /projects` + Redirects; Engineering-Notizen (`bigquery-dbt`,
   `server-side-tagging`) hierher verschieben (raus aus „Forschung").
5. `vercel.json`: `/werke → /works` (Ziel umstellen) + `/work → /projects`.
- *Abschluss:* Build grün; keine toten internen Links; Feed/Archiv/hreflang intakt.

## Phase 3 — Ethik-Hinweise *(unabhängig von IA; kann parallel zu Phase 2)*
- Bausteine aus `06-ethics-patches` in die Methodenblätter einpflegen (DE+EN):
  Protokoll (Quellenbias/Leid), Halbwertszeit (`views_per_death`), Parallax
  (Auslassung ≠ Zensur), Police (kurzer Hinweis zusätzlich auf der **Hauptseite**).
- *Abschluss:* jede der vier Untersuchungen trägt einen sichtbaren Grenz-/Ethikhinweis.

## Phase 4 — Lab Notes
- `08-first-lab-notes` als MDX anlegen: `src/content/lab/<slug>/{de,en}.mdx`
  (Note A Überflug, Note B Parallaxe). EN-Fassungen erstellen.
- *Abschluss:* `/lab` (bzw. `/notes`) zeigt ≥ 2 Notes + Überflug-Studie — nicht leer.

## Phase 5 — Tests / Build *(nach jeder Phase, final komplett)*
- `npm run test` (inkl. Register-/Render-Tests), `npm run check`, `npm run build`.
- `cd pipelines/protokoll && pytest -q`.
- *Abschluss:* alles grün; gebauter `dist/` ohne `ZU KLÄREN`/`TODO`/Platzhalter.

## Phase 6 — Go-Live-Check *(Gate aus `01` §5 + `_drafts/08`)*
- Alle 🔴-Blocker erfüllt (Recht, Konsistenz, Research Statement, Beruf getrennt, Ethik,
  keine leeren Sektionen).
- Keine ZKM-/Festival-/Open-Call-Claims; keine ungedeckten Claims.
- a11y/Lighthouse-Check; OG-Bild-Entscheidung (sonst als bewusste Fehlstelle vermerken).
- Go-Live-Modus entscheiden (leise vs. Launch) → deploy.

## Abhängigkeiten (kompakt)
- **Phase 0** früh/extern (lange Vorlaufzeit) — blockiert Go-Live, nicht die übrigen Phasen.
- **Phase 1 vor Phase 2** (Inhalte vor Routing).
- **Phase 3** parallel möglich; **Phase 4** braucht den Ablageort aus Phase 2.
- **Phase 5** nach jeder Phase; **Phase 6** ganz zuletzt.

## Was bewusst NICHT in public-v01 gehört
`/works/<id>`-Konsolidierung, `/experiments`-Index, OG-Bilder (falls aufwendig), Monatsband
(`09 A`), Parallaxe-Validierungsschicht (`09 B`), neue Werke/Experimente — alles **nach** Go-Live.
