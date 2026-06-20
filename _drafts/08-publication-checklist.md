# 08 — Go-Live-Checkliste (hart)

> Verbindliches Gate vor der Veröffentlichung. **Regel: Ein einziges offenes 🔴-Kriterium =
> kein Go-Live.** Grundlage: `docs/05` (Risiken), `docs/11` (Kriterien), `docs/12` (No-Gos).
> Jede Zeile ist prüfbar formuliert (mit Fundort im Code).

## 🔴 1. Recht (harter Blocker)
- [ ] Impressum mit **echten** Angaben (Name, Anschrift, Verantwortlicher) — keine `[…]`-Platzhalter.
      *Prüfen:* `src/data/legal.ts` enthält keinen String mit `[` oder „ENTWURF/Platzhalter".
- [ ] Datenschutzerklärung rechtlich geprüft und freigegeben (Stand: „rechtlich zu prüfen").
- [ ] Aussagen im Datenschutz stimmen mit Technik überein (Vercel-Hosting, self-hosted Fonts,
      **kein** Tracking) — falls je ein Analyse-Tool ergänzt wird, Text anpassen.

## 🔴 2. Selbstbeschreibung konsistent (About/Footer/Schema)
- [ ] **About** ohne Bewerbungssprache; entspricht `_drafts/04/05`.
      *Prüfen:* `src/data/about.ts` enthält **nicht** „Data & AI Engineer" als Selbstdefinition
      und **nicht** „Ich verwandle Rohdaten in Data Products …".
- [ ] **Footer-Tagline** an Leitsatz angeglichen.
      *Prüfen:* `ui.ts` `footer.tagline` ≠ „Data & AI Engineer — von der Messung bis zur Entscheidung."
- [ ] **JSON-LD** stimmig.
      *Prüfen:* `Base.astro` `disambiguatingDescription` + `knowsAbout` enthalten Forschungs-
      vokabular (nicht nur BigQuery/dbt/Tag Management); `jobTitle` = gewählter Leitsatz.
- [ ] **Rolle** zentral gesetzt: `site.ts` `role` = Leitsatz (docs/_drafts/01).
- [ ] **Meta**: `ui.ts` `meta.home.title/desc` ohne Engineering-Schlagseite.

## 🔴 3. Research Statement vorhanden
- [ ] `/research` existiert und ist verlinkt (Nav/Footer).
- [ ] Inhalt = `_drafts/02` (DE) / `_drafts/03` (EN), freigegeben.
- [ ] Keine Theoriepose, kein Manifest, kein Status-/Kontext-Claim.

## 🟠 4. Beruf von Forschung getrennt
- [ ] Engineering-Notizen (`bigquery-dbt`, `server-side-tagging`) **nicht** unter „Forschung
      in den Künsten".
      *Prüfen:* erscheinen nicht im `/works`- bzw. Untersuchungs-Block; entweder unter
      `/projects` oder klar als „Engineering-Notiz" gekennzeichnet.
- [ ] Beruf-Sektion erkennbar nachgeordnet (nicht im Identitäts-/Forschungskern).

## 🟠 5. URL-Schema sauber
- [ ] Keine drei konkurrierenden Begriffe mehr (`/work` vs. `/werke` vs. `/lab`) ohne klare Rollen.
- [ ] Alle Umbenennungen mit **301-Redirects** (`vercel.json`); keine toten internen Links.
      *Prüfen:* Build + Link-Check; `/protokoll/feed.xml`, `/protokoll/archiv` erreichbar;
      hreflang/`canonical` korrekt; RSS-`alternate` zielt richtig.
- [ ] EN-Spiegel vollständig (jede DE-Route hat `/en`-Pendant).

## 🟠 6. Ethik-Hinweise bei sensiblen Quellen
- [ ] Methodenblätter mit sensiblen Daten (Opfer, Vertreibung, Konflikt) nennen die ethische
      Grenzentscheidung **öffentlich** (kein Opfer-Ranking; regelbasierte/chronologische
      Aufnahme; neutrale Quellenwahl).
      *Betroffen:* Halbwertszeit, Protokoll (Vertreibung/Konflikt), Parallaxe.
- [ ] Lizenzpflichten der Quellen erfüllt (z. B. FAO CC BY-NC-SA: Namensnennung/NC beachtet).

## 🟠 7. Keine Platzhalter, keine leeren Sektionen
- [ ] Keine `[…]`-/„ENTWURF"-/„TODO"-/„coming soon"-Strings im gebauten Output.
      *Prüfen:* Suche im `dist/` nach `ZU KLÄREN`, `TODO`, `Platzhalter`, `[`, „in
      Vorbereitung" (außer bewusst gesetzten Status-Badges).
- [ ] Jede sichtbare Sektion hat Inhalt: `/research` (Text), `/works` (4 Werke),
      `/experiments` (≥ 1, z. B. Überflug), `/notes` (≥ 2 Lab Notes), `/about` (Text).
- [ ] `GEPLANT`-Leerfall sauber (kein leeres „— in Vorbereitung").

## 🟠 8. OG-/Vorschaubilder
- [ ] `og:image` gesetzt (aktuell fehlt es bei `summary_large_image`).
      *Prüfen:* `Base.astro` enthält `og:image` + Bild existiert in `public/`.
- [ ] Bild nüchtern/datengedeckt (kein dekoratives Stock-Motiv); ZU KLÄREN: Quelle/Generierung.

## 🟡 9. Keine überzogenen Claims / Sprache
- [ ] Kein „Award-caliber" o. Ä.
      *Prüfen:* `package.json` `description` neutral.
- [ ] Keine institutionellen Claims (ZKM/Festivals) im Text.
- [ ] Keine ungedeckten Versprechen (Sensorik/Interfaces/„Zufall" nur, wenn ein Werk/Experiment
      sie zeigt).
- [ ] Keine ungeprüften Zitate/Literaturangaben (07-Diskurs: alles „ZU PRÜFEN" entfernt oder belegt).
- [ ] Orphan-/Dashboard-Strings entfernt (`ui.ts` `dash.*`, `system.operational`, falls ungenutzt).

## 🟡 10. Technik / Qualität
- [ ] `npm run test` grün (inkl. Register-/Render-Tests).
- [ ] `npm run check` ohne Fehler.
- [ ] `npm run build` erfolgreich; `pytest -q` (Pipeline) grün.
- [ ] Lighthouse + manueller a11y-Check (Kontrast Mono-Skin, Tastaturpfade Überflug-Insel,
      `prefers-reduced-motion`).
- [ ] Hero-Entscheidung umgesetzt (datengetrieben **oder** als dekorativ benannt; Klima-
      Infrastruktur konsistent — docs/05 R-10).

## Endfreigabe
- [ ] Alle 🔴 erfüllt.
- [ ] Offene ZU KLÄREN-Punkte aus `docs/15` zumindest für veröffentlichte Flächen geschlossen.
- [ ] Bewusste Go-Live-Entscheidung (leise vs. Launch — docs/15 P-4).

> Merksatz (docs/12): Die Site darf untertreiben, aber nie behaupten, was sie nicht zeigen kann.
