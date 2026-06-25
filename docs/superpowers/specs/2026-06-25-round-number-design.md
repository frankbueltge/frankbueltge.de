# Spec — „The Round Number" / *Die runde Zahl* (Gegenmessung, Instrument VI)

**Status:** Entwurf zur Abnahme (Brainstorming mit Frank, 2026-06-25)
**Linie:** Gegenmessung / Counter-Measurement
**Gate:** Substanz-Kriterien §2 der Werkgruppe (`2026-06-11-werkgruppe-design.md`)
**Framing abgenommen:** „Die Methode vor Gericht" (Frank, 2026-06-25)

## 1. Einordnung

Die Linie Gegenmessung zählt, was Macht im Dunkeln lässt, und macht es nachprüfbar.
„The Round Number" dreht das Instrument auf ein Werkzeug, das *vorgibt*, Lügen in Zahlen zu
finden: die **Ziffern-Forensik** (Benfordsches Gesetz). Diese Methode ist das Lieblings-
instrument von Wahlbetrugs-Mythen — sie findet „Anomalien" überall. Das Stück führt täglich
vor, dass eine Anomalie kein Beweis ist, und beziffert, wie oft die Methode sich irrt.

**Gegenstand ist nicht die Institution, sondern das Werkzeug.** Verwandt mit *Patterns*
(stellt die Korrelation vor Gericht); ein Reflex, zwei Stücke: das Lab ertappt die eigenen
Werkzeuge beim Lügen. Eigenständig durch das konkrete, kulturell aufgeladene Ziel
(Benford-als-Betrugsdetektor).

## 2. These & Frage

> **These:** Wer Ziffern zählt, findet immer eine Anomalie. Eine Anomalie ist kein Beweis —
> und dieses Instrument beziffert, warum.

**Frage:** Taugt der Test, der angeblich gefälschte Zahlen erkennt? Wenn er heute eine echte
amtliche Reihe „verdächtig" nennt — wie oft nennt derselbe Test nachweislich saubere Daten
gleicher Größe genauso verdächtig?

## 3. Datenuniversum

Eine **kuratierte, versionierte** Menge, committet ins Repo (Git = Archiv):

1. **Echte öffentliche Zahlenreihen**, bei denen Benford *plausibel anwendbar* ist — Daten über
   mehrere Größenordnungen, natürlich entstanden: z. B. County-/Gemeinde-Einwohnerzahlen
   (Census), Wahlergebnisse auf Bezirksebene, Wirtschaftsreihen. Aufnahmeregel (dokumentiert):
   öffentlich + zitierfähig; spannt ≥ 2 Größenordnungen; keine künstlich begrenzten/geclusterten
   Größen (Prozente, Alter). Jede Reihe trägt ihre Quelle (Name, URL, Lizenz, Abrufdatum).
2. **Etikettierte synthetische Kontrollen** — saubere Benford-Ziehungen und bewusst „getürkte"
   Reihen. Sie sind das **Beweismittel**, nicht der Gegenstand; klar als synthetisch markiert.

Die echten Reihen erfüllen das Substanz-Gate; die Kontrollen tragen die Entlastung. Beschaffung
der echten Datensätze einmalig (Abruf offengelegt), danach committet — die Site liest nur
committete Daten.

## 4. Die Tests (symbolisch, deterministisch, testgeschützt)

- **Benford 1. Ziffer:** erwartete Anteile `P(d) = log10(1 + 1/d)`, d = 1…9. Kennzahlen:
  - **MAD** (mean absolute deviation der Anteile) mit Nigrini-Konformitätsschwellen
    (≤0,006 nah · 0,006–0,012 akzeptabel · 0,012–0,015 marginal · >0,015 nonconformity);
  - **χ²** = Σ (beob. − erw.)² / erw. (erwartete Häufigkeiten aus N·P(d)).
- **Letzte Ziffer:** Test auf Gleichverteilung (χ² gegen 1/10) — Häufung = Rundungs-/
  Fabrikations-Tell.
- *(Optional, später: 1.–2.-Ziffer-Benford für mehr Schärfe.)*

Alle Tests sind reine Funktionen, vollständig offline unit-getestet.

## 5. Der Kern: der Prozess (das Herzstück, Selbstskepsis)

Für die Reihe des Tages (Größe *n*) wird **dieselbe Prüfung mit derselben Schwelle** auf
**M seedgesteuerte Stichproben gezogen, die nachweislich aus einer echten Benford-Verteilung
stammen** (also *sauber*). Gemessen:

- **Falsch-Positiv-Rate** = Anteil der sauberen Stichproben, deren MAD ebenfalls die
  Nonconformity-/Marginal-Schwelle reißt. Kernbefund: Nigrinis **feste Schwellen sind
  stichprobengrößen-blind** — kleine Stichproben weichen natürlich ab und werden über-markiert.
- **Ehrlich in beide Richtungen:** Bei kleinem *n* ist die Falsch-Positiv-Rate hoch (das Verdikt
  ist ein Artefakt der Größe, kein Betrug). Bei großem, sauberem *n* hält das Verdikt — und das
  zeigt das Instrument genauso. Der Missbrauch sitzt an kleinen/strukturierten Daten.

Die **Unzuverlässigkeit der Methode ist die gemessene Größe** (CLAUDE.md: „wo das Modell selbst
der Gegenstand ist, wird seine Unzuverlässigkeit Teil der Messung"). Seed + Verfahren offengelegt,
Lauf reproduzierbar.

## 6. Kadenz & Auswahl

- **Täglich.** Die Maschine stellt **deterministisch nach Datum rotierend** je eine Reihe „vor
  Gericht" (jede Reihe kommt dran — fair, kein Cherry-Picking der dramatischsten). Alle Reihen
  werden berechnet; eine ist die „Angeklagte" des Tages.
- An jedem Tag steht das Verdikt der Methode **neben** seiner Falsch-Positiv-Rate.

## 7. Datenmodell (JSON kanonisch, Prosa ist Darstellung)

Pro Tag committet die Pipeline `src/data/round-number/<jahr>/<datum>.json`:

```
{ date, generated_at, schema_version, pipeline_version, method_version,
  pick: <series_id>,
  series: [ {
    id, name, institution, synthetic: false,
    source: { name, url, license, retrieved },
    n,
    benford: { observed: [9], expected: [9], chi2, mad, verdict },   // verdict ∈ {close,acceptable,marginal,nonconformity}
    last_digit: { observed: [10], chi2, verdict },
    control: { method, seed, samples, threshold, false_positive_rate, verdict_on_clean }
  } ] }
```

JSON ist darstellungsfrei; Astro rendert Prosa + Histogramm (DE/EN) zur Buildzeit. Committete
Tages-JSONs sind **unantastbar**.

## 8. Provenienz & Fehler als Form

- Jede echte Reihe verlinkt ihre öffentliche Quelle; das **Histogramm** (beobachtet vs. erwartet)
  steht offen — jeder kann nachrechnen.
- Datensatz fehlt/korrupt ⇒ Reihe wird als *„nicht prüfbar"* vermerkt, nie still ersetzt.
- Synthetische Kontrollen sind im JSON mit `synthetic: true` markiert; nie als echt ausgegeben.

## 9. Grenzen (prominent im Methodenblatt)

- **Benford ist nicht universell anwendbar** — begrenzte/geclusterte Daten (Prozente, Alter,
  zugewiesene Nummern) folgen ihm nicht; Abweichung dort heißt nichts.
- **„Anomalie" ≠ Betrug.** Das Instrument erhebt keinen Betrugsvorwurf gegen eine Institution.
- **Feste Schwellen (Nigrini) sind eine gesetzte Wahl** und stichprobengrößen-blind — genau das
  ist der Gegenstand.
- **Kontrollen sind synthetisch** und als solche markiert.
- Kleine Stichproben sind unzuverlässig — die Falsch-Positiv-Rate macht das explizit.

## 10. Avantgarde-Latte (Linien-Kriterien)

- **Ableiten, nicht abbilden:** das Artefakt ist das Verdikt-gegen-sich-selbst (Anomalie +
  Falsch-Positiv-Rate), eine Inferenz über die Methode.
- **Verbinden, was niemand verbindet:** die Beschuldigung sofort mit ihrer eigenen
  Falsch-Positiv-Demonstration paaren.
- **Die Maschine findet die Frage:** jeden Tag eine andere Angeklagte.

## 11. Substanz-Gate (Werkgruppe §2)

1. **Echte Daten + Provenienz** — committete öffentliche Reihen mit Quellen. ✓
2. **Eine Frage, kein Effekt** — „taugt der Test?" ist überprüfbar. ✓
3. **Infrastruktur als Aussage** — die Methode selbst ist die ausgewiesene, auditierbare
   Infrastruktur; ihre Unzuverlässigkeit wird gemessen. ✓
4. **Leave-behind** — offener Code, committete Daten, offengelegte Methode + Seeds. ✓
5. **Verhältnismäßigkeit** — reine Statistik, statisch gerendert, kein Spektakel. ✓

## 12. Pipeline & Technik

- Python-Paket `pipelines/round-number/` (installierbar, pytest), reine Module: `benford.py`,
  `lastdigit.py`, `controls.py` (seedgesteuerte Benford-Ziehung + Falsch-Positiv-Rate),
  `datasets.py` (Lader + Kurations-Registry), `build.py` (Assembly + Rotationswahl), `run.py`
  (IO, `--repo-root`, schreibt `latest.json` + datiert).
- Datensätze committet unter `pipelines/round-number/data/` (echte Reihen + Kontrollen).
- **Kein Netz zur Laufzeit nötig** (Daten in-Repo); nächtlicher GitHub-Actions-Workflow rechnet
  die Tages-Rotation und committet das JSON (→ Rebuild). Determinismus + Testschutz für alle
  Test-/Kontroll-Funktionen.

## 13. Frontend & Routing

- **Name:** Titel „The Round Number", DE „Die runde Zahl"; Route `/round-number` (+ EN-Spiegel),
  Methodenblatt `/werke/round-number`. i18n-Präfix `rn.`, OG-Slug `round-number`, Eintrag in
  `werke.ts` (Linie Gegenmessung), **DE/EN ab Tag eins**.
- Darstellung: die Angeklagte des Tages, ihr **Ziffern-Histogramm** (beobachtet vs. Benford),
  das Verdikt-Label — und prominent daneben die **Falsch-Positiv-Rate** („derselbe Test nennt
  saubere Daten in Y % der Fälle genauso verdächtig"). Mono-Ästhetik, schlichtes SVG-Histogramm.

## 14. Tests

Unit-Tests (pytest): Benford-Erwartung + MAD + Verdikt-Schwellen; Last-Digit-χ²; Kontroll-
Falsch-Positiv-Rate deterministisch bei festem Seed; Rotationswahl deterministisch nach Datum;
Lader gegen Fixture-Datensätze. Frontend: Format-/Histogramm-Helfer (vitest). Lokaler Lauf
schreibt JSON, committet nicht.

## 15. Nicht-Ziele (YAGNI)

- **Kein Betrugs-Vorwurf** gegen eine konkrete Institution.
- Kein LLM (reine symbolische Statistik).
- Kein Live-Orakel, kein dynamisches Lesen zur Laufzeit.
- Keine Verschleierung der synthetischen Kontrollen.
- Kein RSS in v1.

## 16. Offene Punkte (für den Implementierungsplan)

- Konkrete **Startreihen** (3–6 echte Datensätze + 2–3 Kontrollen) inkl. Quellen/Lizenzen und
  einmaligem Abruf.
- **Kontroll-Parameter:** M (Stichprobenzahl), Schwelle für „geflaggt" (Nonconformity vs.
  Marginal), Seed-Schema.
- **Histogramm-Rendering** (SVG-Helfer, Muster `halbwertszeit/svg.ts`).
- Ob 1.–2.-Ziffer-Benford schon in v1.
