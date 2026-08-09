---
paths:
  - "src/styles/**/*.css"
  - "src/components/**/*.astro"
  - "src/lib/dataviz/**/*.ts"
  - "src/lib/**/field.ts"
  - "scripts/drift-check.mjs"
---

# Figuren, Farben, Paletten

Umgezogen aus `CLAUDE.md` am 2026-08-09 (CLAUDE.md-Diät: pfadgebundene Regeln laden nur,
wenn passende Dateien angefasst werden). Inhalt unverändert — was hier steht, galt vorher
in jeder Session und gilt jetzt in jeder Session, die eine Figur oder ein Stylesheet
berührt.

- **Visualisierungen der Praxen dürfen eigene Bildsprache haben (Frank, 2026-07-30):**
  Die Mono-Skin gilt für die Site, aber **nicht als Zwang zur kargen Einlinien-Grafik**.
  Franks Wortlaut: „machs einfach interaktiv und chic, nicht immer dieses minimale
  langweilige monochrome — das passt hier nicht mehr, weil es ein eigenes Projekt ist."
  Für Atelier/Field/Studio also: Farbe, Tiefe, Interaktion (Hover/Fokus/Filter),
  Detailtafel — solange die Figur aus committeten Daten abgeleitet und nachprüfbar ist.
  Verbindlich bleibt das Handwerk: **Palette gegen die jeweilige Fläche validieren**
  (dataviz-Skill, `scripts/validate_palette.js`, hell UND dunkel mit eigenen Stufen),
  Legende + Tabellenansicht, `prefers-reduced-motion` achten, Herkunftszeile unter der
  Figur. Referenz-Umsetzung: `src/components/atelier/ProcessFigure.astro` +
  `src/styles/atelier-process.css`. **Validierung ist seit 2026-07-31 Testpflicht, kein
  Kommentar:** jedes gelieferte Set steht als Datensatz in `src/lib/dataviz/palette.ts`
  (Validator-Verdikt, datiert, WARNs mit benanntem Relief); `palette.test.ts` rechnet die
  Distanzen nach und `scripts/drift-check.mjs` (Regeln 6/7) erzwingt die
  `PALETTE:`-Marker. Anlass: Die ursprüngliche ProcessFigure-Palette behauptete im
  CSS-Kommentar „alle sechs Prüfungen bestanden", fiel aber real durch den CVD-Check
  (grün↔magenta deutan ΔE 1,3) — Kommentare driften, Tests nicht.
  **Statusfarben sind tabu, wo die Praxis nicht wertet** — ein abgebrochenes Vorhaben ist
  bei Ulysses kein Fehlschlag („closing costs what continuing costs"), also bekommt es
  eine Identitätsfarbe, kein Warnrot.

## Praktische Hinweise (2026-08-09 ergänzt, aus der Neighbourhood-Figur)

- **Der Validator liegt nicht immer im Skill-Bundle.** Wenn `validate_palette.js` in der
  Session nicht auffindbar ist: die Distanzmathematik steht vollständig in
  `src/lib/dataviz/palette.test.ts` (sRGB → Machado-2009-Simulation → OKLab, WCAG) und
  kann für ein neues Set nachgerechnet werden. Dann im `validator`-Feld **schreiben, dass
  der Validator nicht lief** und was stattdessen gerechnet wurde — nie einen Lauf
  behaupten, den es nicht gab. Ein Set, das die Hexes eines bereits validierten Sets
  wiederverwendet, erbt dessen Verdikt (Teilmenge von Paaren), aber **nicht** dessen
  Kontrastwerte: die hängen an der Fläche der neuen Seite.
- **Eingefärbter Text ist kein Mark.** Ein Kontrast-WARN ist für eine Marke neben einem
  Label zulässig, für das Label selbst nicht. Chips und Beschriftungen tragen gedämpfte
  Tinte plus einen farbigen Punkt/Strich, nie die Identitätsfarbe als Schriftfarbe.
- **Doppelte Kodierung ist erwünscht,** wo sie ehrlich ist: dieselbe Tatsache als Länge
  UND als Farbe hält die Figur in Graustufen, im Druck und für Dichromaten lesbar.
- **CSP:** `style=""`-Attribute werden von dieser Site stillschweigend verworfen. Farben
  gehören ins Stylesheet (Custom Properties), SVG-Marken tragen `fill=`/`stroke=` oder
  Klassen.
