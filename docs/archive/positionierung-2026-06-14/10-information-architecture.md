# 10 — Informationsarchitektur

> Vier IA-Varianten, je bewertet, plus eine konkrete Empfehlung, die den realen Ist-Stand
> (vier Works, Beruf, fehlendes Research Statement) berücksichtigt. **Vorschläge** — kein
> Eingriff in bestehende Routen.

## Bewertungsdimensionen
Glaubwürdigkeit · Skalierbarkeit · Pflegeaufwand · Leer-/Unfertig-Risiko · Eignung frühe
Veröffentlichung · Eignung langfristig · Eignung Paper/Exposition/Open Calls.

## Ausgangslage (Ist)
Routen heute: `/` · `/about` · `/work` (Projekte) · `/lab` (Untersuchungen + Studien) ·
`/werke/<id>` (Methodenblätter) · `/protokoll|halbwertszeit|parallaxe|praemie` · Recht.
Probleme: drei Sektions-Begriffe (R-09), kein Research Statement (R-02), Beruf vermischt (R-06).

---

## Variante 1 — Minimal, seriös, leise
**Home · Position · Experiments · Notes · About · Contact**

- **Glaubwürdigkeit:** hoch (Understatement passt zum Ton).
- **Skalierbarkeit:** mittel — „Experiments/Notes" fasst viel, differenziert wenig.
- **Pflegeaufwand:** niedrig.
- **Leer-Risiko:** niedrig (wenig Flächen → wenig Leere).
- **Frühe Veröffentlichung:** **sehr gut**.
- **Langfristig:** begrenzt — die vier laufenden Works als „Experiments" zu führen,
  untertreibt sie; keine Methoden-/Dataset-Ebene.
- **Paper/Exposition:** schwach (keine zitierfähige Struktur).
- **Fazit:** Guter *Eröffnungs*zustand, zu klein als *Zielzustand*. „Position" als Seite ist
  ein kluger Platzhalter für das fehlende Research Statement.

## Variante 2 — Forschungsarchiv
**Index · Research Statement · Works · Experiments · Methods · Notes · Archive · About**

- **Glaubwürdigkeit:** hoch — bildet genau das ab, was vorhanden ist (Works + Methods +
  Archiv).
- **Skalierbarkeit:** **sehr gut** — jeder Typ aus der Taxonomie (09) hat einen Ort.
- **Pflegeaufwand:** mittel–hoch (mehr Flächen, mehr Disziplin nötig).
- **Leer-Risiko:** mittel — „Experiments" und „Notes" müssen früh gefüllt werden, sonst
  wirken sie unfertig.
- **Frühe Veröffentlichung:** gut, **wenn** Research Statement steht und Notes ≥ 2–3 Einträge.
- **Langfristig:** **sehr gut**.
- **Paper/Exposition:** **sehr gut** — „Methods/Archive/Works" ist quasi expositionsfertig.
- **Fazit:** **Beste Passung zum Ist-Stand und zur Zielposition (Richtung B→D).** Verlangt
  als Eintrittspreis: Research Statement + erste Notes.

## Variante 3 — Künstlerisches Labor
**Field Notes · Experiments · Instruments · Datasets · Diagrams · Works · Methods · About**

- **Glaubwürdigkeit:** mittel **heute**, hoch **mit Richtung C** — „Instruments/Datasets/
  Diagrams" als eigene Top-Level-Bereiche versprechen Breite, die erst teilweise existiert.
- **Skalierbarkeit:** sehr gut.
- **Pflegeaufwand:** hoch (viele Indizes pflegen).
- **Leer-Risiko:** **hoch** — „Instruments"/„Diagrams" als leere Top-Level-Seiten wirken
  unfertig; genau die Falle, die der Auftrag fürchtet.
- **Frühe Veröffentlichung:** riskant (zu viele Flächen für den Ist-Inhalt).
- **Langfristig:** sehr gut, sobald Sensorik/Instrumente real sind.
- **Paper/Exposition:** gut.
- **Fazit:** **Das richtige Ziel für 12+ Monate** (Richtung C), **nicht** der Startzustand.
  Heute würde es Lücken ausstellen.

## Variante 4 — Werkorientiert
**Works · Experiments · Research · Notes · About · Contact**

- **Glaubwürdigkeit:** hoch — stellt die starken Works nach vorn.
- **Skalierbarkeit:** gut.
- **Pflegeaufwand:** mittel.
- **Leer-Risiko:** niedrig–mittel — „Research" muss substanzieller sein als nur ein Satz.
- **Frühe Veröffentlichung:** **gut**.
- **Langfristig:** gut (kann zu Variante 2 wachsen).
- **Paper/Exposition:** mittel–gut (je nachdem, was „Research" enthält).
- **Fazit:** **Pragmatischste Brücke** zwischen Variante 1 (leise) und 2 (Archiv). Works
  zuerst, Research als wachsende Sammelseite (Statement + Methods + später Exposition).

---

## Vergleichsmatrix

| Kriterium | V1 Minimal | V2 Archiv | V3 Labor | V4 Werkorientiert |
|---|---|---|---|---|
| Glaubwürdigkeit heute | hoch | hoch | mittel | hoch |
| Skalierbarkeit | mittel | sehr gut | sehr gut | gut |
| Pflegeaufwand | niedrig | mittel–hoch | hoch | mittel |
| Leer-Risiko | niedrig | mittel | hoch | niedrig–mittel |
| Frühe Veröffentlichung | sehr gut | gut* | riskant | gut |
| Langfristig | begrenzt | sehr gut | sehr gut | gut |
| Paper/Exposition | schwach | sehr gut | gut | mittel–gut |

\* abhängig von Research Statement + ersten Notes.

---

## Empfehlung: V4 jetzt → V2 wachsen (V3 als 12-Monats-Ziel)

**Start (Go-Live-fähig), Struktur:**

```
/                Home (Hero · lebendes Protokoll · Reihe · Beruf nachgeordnet)
/research        Research Statement + Über die Reihe + Methode (NEU — schließt R-02)
/works           Die Akte der Gegenwart: die 4 Untersuchungen (heute = /lab-Block 1)
   /works/<id>   Werkseite + Methodenblatt (URL-Schema vereinheitlichen, R-09)
/experiments     offene Versuche + Studien (inkl. Überflug-Etüde)
/notes           Lab Notes inкl. Verwerfungen (Prozess-Ebene sichtbar)
/about           Person + biografische Linie (Forschung, Wiederaufnahme) — entkonsultiert
/work  (Beruf)   Projekte/Engineering klar abgegrenzt (data-snack, datavism, Eng-Notes)
/contact, /impressum, /datenschutz
```

**Begründung:**
- Bildet den Ist-Stand ehrlich ab (Works stark, Research im Aufbau, Beruf separat).
- Schließt die drei größten Inhaltslücken durch genau **eine** neue Seite (`/research`) und
  eine **Trennung** (Beruf raus aus Forschung).
- Wächst ohne Bruch zu V2 (Archive/Datasets/Instruments ergänzen, wenn gefüllt) und später
  zu V3 (Instruments/Diagrams als Top-Level, wenn Sensorik real ist).
- Macht das URL-Chaos (`/work` vs `/werke` vs `/lab`) auflösbar: **eine** Achse `/works`
  (Forschung) vs. `/work`-Ersatz (Beruf, ggf. `/profession` o. Ä., Namen klären).

**Mindest-Füllung für Go-Live (sonst Leer-Risiko):**
- `/research`: 1 knappes Statement (Richtung B, Ton A) + 1 Methodenabsatz.
- `/works`: 4 vorhanden — erfüllt.
- `/experiments`: ≥ 1 (Überflug-Etüde + idealerweise 1 neues).
- `/notes`: ≥ 2 (z. B. „Warum Überflug ausgemustert wurde", „Warum Parallaxe neu entworfen
  wurde") — beide aus vorhandenem Material gewinnbar, **ohne Erfindung**.
- `/about`: entkonsultierte Fassung (nach Klärung der Biografie, 15).

**Offene Entscheidung an Frank (15):** Benennung der Beruf-Achse; deutscher Leitbegriff
(„Forschung" vs. „Research"); ob `/research` und `/works` getrennt oder als eine Sektion.

> Hinweis: Die konkrete Umbenennung/Verschiebung von Routen ist ein Eingriff in öffentliche
> Seiten und erfolgt **erst nach Freigabe** (siehe 16, „Nicht geänderte Dateien").
