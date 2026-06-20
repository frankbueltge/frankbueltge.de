# 05 — Risiko-Register

> Risiken für eine glaubwürdige Veröffentlichung als datenbasierter Artistic Researcher.
> Schwere: 🔴 hoch (Blocker/Positionierungsschaden) · 🟠 mittel · 🟡 niedrig.
> Alle Gegenmaßnahmen sind **Vorschläge** — kein Eingriff ohne Freigabe.

## A. Positionierung & Inhalt

### 🔴 R-01 — Halb umgestellte Selbstbeschreibung (Register-Bruch)
- **Befund:** About-Seite, Footer-Tagline, JSON-LD (`disambiguatingDescription`,
  `knowsAbout`) und `package.json` beschreiben einen „Data & AI Engineer"; Header/Werke/Lab
  beschreiben „Artistic Research". (Belege: `about.ts`, `Footer`/`ui.ts footer.tagline`,
  `Base.astro`, `package.json`.)
- **Wirkung:** Kurator:innen/Jurys/Peers lesen Unentschlossenheit oder „Consultant testet
  Kunstvokabular". Untergräbt die angestrebte Position genau bei der Zielgruppe.
- **Gegenmaßnahme:** About/Footer/Schema auf die (Doppel-)Forschungsidentität umstellen;
  Beruf als Abschnitt, nicht als Definition. Research-Vokabular in `knowsAbout`. (Freigabe.)

### 🔴 R-02 — „Artistic Research" als Etikett ohne Research Statement
- **Befund:** Der Begriff steht im Header, aber es existiert **keine** Seite, die Methode,
  Haltung, Linie erklärt.
- **Wirkung:** Label ohne Substanztext wirkt aufgesetzt; verschenkt die real vorhandene
  Substanz der Werke.
- **Gegenmaßnahme:** knappes Research Statement + Reihen-/Methodenseite (siehe 06/08/10).

### 🟠 R-03 — Zwei Consulting-Artikel unter „Forschung in den Künsten"
- **Befund:** `bigquery-dbt`, `server-side-tagging` (kein `draft`) erscheinen im Lab unter
  „Praxisbasierte Forschung in und durch die Künste".
- **Wirkung:** Register-Bruch in derselben Liste; zieht das Lab Richtung Analytics-Blog.
- **Gegenmaßnahme:** in einen klar markierten Bereich „Engineering-Notizen/Beruflich"
  verschieben **oder** als solche kennzeichnen; nicht unter Kunst-Forschung listen.

### 🟠 R-04 — Biografische Linie unsichtbar
- **Befund:** Frühere künstlerische Forschung, Masterarbeit, 25-jährige Pause (laut Auftrag
  vorhanden) sind nirgends erwähnt.
- **Wirkung:** Der stärkste Legitimitätsbeleg für den Wiedereinstieg fehlt; die
  Doppelidentität bleibt unbegründet.
- **Gegenmaßnahme:** biografische Linie nüchtern sichtbar machen — **nachdem** Fakten
  geklärt sind (siehe 15). **Keine Erfindung** von Daten/Titeln/Institutionen.

### 🟡 R-05 — Doppeltitel unerklärt
- **Befund:** „Data Engineering & Artistic Research" ohne verbindenden Satz.
- **Gegenmaßnahme:** ein Satz, der die Verbindung benennt (siehe 06).

## B. Außenbild / Sprache

### 🟠 R-06 — Schlagseite „Analytics-Consulting-Portfolio"
- **Befund:** About + Projekte + Footer + Beruf-Sektion summieren sich zu einem
  Portfolio-Eindruck (siehe 03 §7/§9).
- **Gegenmaßnahme:** Beruf klar nachordnen/abgrenzen; Werke und Research nach vorne.

### 🟡 R-07 — „Award-caliber" und Marketing-Reste
- **Befund:** `package.json` description: „Award-caliber, bilingual, SEO-first …";
  `ui.ts`-Reste („systems operational", „featured").
- **Wirkung:** im Repo/Open-Source sichtbar; widerspricht der nüchternen Haltung.
- **Gegenmaßnahme:** neutral umschreiben; Orphan-Strings prüfen/entfernen.

### 🟡 R-08 — Tech-Demo-Gefahr beim Hero
- **Befund:** Hero ist generativ-dekorativ; macht (ehrlich) keine Datenaussage.
- **Wirkung:** Für eine Praxis, die „Form folgt der Wahrheit" propagiert, ist ein rein
  dekoratives Zentrum eine leichte Spannung (kein Widerspruch, da als dekorativ markiert).
- **Gegenmaßnahme:** entweder bewusst dekorativ belassen und so benennen, oder wieder an
  Klimadaten koppeln (siehe R-10).

## C. Technik & Konsistenz

### 🟠 R-09 — Drei Sektions-Begriffe / URL-Schema uneinheitlich
- **Befund:** `/work` (Projekte), `/werke` (301→/lab, aber `/werke/<id>` aktiv als
  Methodenblatt-Route), `/lab` (kanonisch). (Belege: `vercel.json`, `LabIndex.astro` Z. 31.)
- **Wirkung:** verwirrend, SEO-unsauber, wartungsanfällig; `/work` vs. `/werke` sind für
  Außenstehende verwechselbar.
- **Gegenmaßnahme:** URL-Schema vereinheitlichen (Vorschlag in 10); Redirects nachziehen.

### 🟡 R-10 — Hero/Klima-Inkonsistenz (Doku ↔ Code)
- **Befund:** `CLAUDE.md`/Spec: Hero = GISTEMP-Klimadaten; `HeroField.astro` = generativ.
  Klima-Pipeline (`fetch-climate`, `climate.ts`, JSON) dadurch teils verwaist.
- **Gegenmaßnahme:** Entscheidung treffen (datengetrieben *oder* dekorativ + dokumentieren);
  ungenutzte Infrastruktur sonst entfernen oder als „geplant" markieren.

### 🟡 R-11 — Doku-Inkonsistenz Hosting
- **Befund:** `CLAUDE.md` nennt teils „Cloudflare Pages"; real ist **Vercel** (`vercel.json`,
  `.vercel/`, Datenschutztext „Vercel Inc.").
- **Gegenmaßnahme:** `CLAUDE.md` auf Vercel korrigieren (im CLAUDE.md-Vorschlag, Phase 11).

### 🟡 R-12 — Orphan-/Dashboard-Reste
- **Befund:** `ui.ts`-Schlüssel `dash.*`, `system.operational` u. a. wirken wie Reste des
  alten Dashboards.
- **Gegenmaßnahme:** Referenzen prüfen (grep), Ungenutztes entfernen.

## D. Veröffentlichung / Recht / Ethik

### 🔴 R-13 — Impressum/Datenschutz sind Platzhalter
- **Befund:** `legal.ts` enthält „ENTWURF/Platzhalter", `[Vollständiger Name]` etc.
- **Wirkung:** **Harter Go-Live-Blocker** (Impressumspflicht DE). Datenschutztext rechtlich
  ungeprüft.
- **Gegenmaßnahme:** echte Angaben einsetzen (durch Frank) + rechtliche Prüfung. **Keine
  Erfindung** von Adressdaten.

### 🟠 R-14 — Fehlende Bildebene / OG-Images
- **Befund:** kein `og:image`, keine Werk-/Prozessbilder. `summary_large_image` ohne Bild.
- **Wirkung:** schwache Social-/Teilen-Vorschau; visuell „leer" für ein
  Kunst-/Forschungsprojekt.
- **Gegenmaßnahme:** generierte, datengedeckte OG-Bilder (z. B. aus dem Tagesprotokoll)
  oder bewusste, nüchterne Bildsprache. ZU KLÄREN.

### 🟠 R-15 — Datenethik bei den Werken (latent, teils adressiert)
- **Befund:** Werke berühren sensible Felder: Opferzahlen (Halbwertszeit), Vertreibung
  (Protokoll), Territorialkonflikte (Parallaxe). Specs adressieren das (kein Opfer-Ranking,
  chronologische Sortierung, neutrale Quellenwahl) — aber nur intern.
- **Wirkung:** Bei öffentlicher Aufmerksamkeit drohen Vorwürfe (Ästhetisierung von Leid,
  Quellen-Bias).
- **Gegenmaßnahme:** ethische Grenzentscheidungen **öffentlich** in den Methodenblättern
  benennen; redaktionelle Verantwortung klar ausweisen (siehe 11/12).

### 🟡 R-16 — Secret-/Quellen-Hygiene (weitgehend gelöst)
- **Befund:** API-Keys werden in Fehlermeldungen redigiert; Pipelines committen ins
  öffentliche Archiv. (Spec-Regel + Tests vorhanden.)
- **Restrisiko:** Eine künftige Quelle/ein neuer Adapter könnte versehentlich Keys/PII ins
  Archiv schreiben.
- **Gegenmaßnahme:** Redaktionsregel als verbindlichen Test bei jedem neuen Adapter halten
  (steht in CLAUDE.md — beibehalten).

### 🟡 R-17 — Accessibility/Performance ungeprüft für Go-Live
- **Befund:** gute Muster vorhanden (Skip-Link, reduced-motion, Off-screen-Pause), aber
  keine Messung (Kontrast Mono-Skin, Tastaturpfade Überflug, Lighthouse).
- **Gegenmaßnahme:** vor Go-Live Lighthouse + manueller a11y-Check.

## E. Strategisch / Reputational

### 🟠 R-18 — Institutionelle Ambition (z. B. ZKM) als Anspruch nach außen
- **Befund:** Intern als Motivation legitim; nach außen wäre ein Claim Größenfantasie.
- **Gegenmaßnahme:** **niemals** als öffentlicher Anspruch. Stattdessen Substanz zeigen;
  Kontexte ergeben sich aus Werken, nicht aus Behauptung (siehe 12).

### 🟠 R-19 — „25 Jahre Pause" defensiv oder als Bruch erzählt
- **Befund:** noch nicht erzählt; Risiko liegt in der späteren Formulierung.
- **Gegenmaßnahme:** Pause **nicht** als Entschuldigung, sondern als Kompetenzaufbau
  rahmen (Daten/Technik als das Material, das vorher fehlte) — sachlich, ohne Drama (11).

### 🟡 R-20 — Vermischung mit Schwester-Projekten (datavism/data-snack)
- **Befund:** data-snack/datavism sind aktivismus-/bildungsnah; die Reihe ist forschend.
- **Wirkung:** Vermischung könnte die Forschungsposition „aktivistisch" oder „edukativ"
  einfärben.
- **Gegenmaßnahme:** klare Abgrenzung der Reihe von den Projekten (Beruf/Projekte ≠ Werk).

## Priorisierte Top-5 (Reihenfolge der Bearbeitung)
1. **R-13** Impressum/Datenschutz (harter Blocker).
2. **R-01** Selbstbeschreibung angleichen (Positionierungsschaden).
3. **R-02** Research Statement / Reihenseite schaffen.
4. **R-03** Consulting-Posts neu verorten.
5. **R-09** URL-Schema vereinheitlichen.
