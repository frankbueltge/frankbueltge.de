# 09 — Nächste Werkvertiefung (Plan, NICHT umgesetzt)

> Zwei Vertiefungen bestehender Arbeiten — **kein neues Werk**. Grundlage: `_drafts/work-audit`.
> Abgrenzung: Dies ist *Vertiefung* (Konsolidierung); der separate *Experiment*-Strang
> (S-01/S-03, `_drafts/09-next-experiment-decision`) bleibt davon unberührt.

## Warum jetzt vertiefen statt neu bauen?
Die vier Untersuchungen tragen die Positionierung bereits. Vor Verbreiterung steht
Konsolidierung: Das wertvollste am Protokoll ist die **Akkumulation** (sie wird noch zu wenig
*als Werk* sichtbar); das größte Vertrauensrisiko liegt bei **Parallaxe** (LLM-Blackbox). Beide
Vertiefungen erhöhen die Glaubwürdigkeit der ganzen Reihe stärker als ein fünftes Werk — und
ohne neues Substanz-Gate.

---

## A. Das Protokoll — „Monatsband 01"

**Ziel:** Die über Tage wachsende Akte als **Einheit** lesbar machen — ein erster Monatsband,
der die Akkumulation zeigt (und auf den in der Spec geplanten Jahresband/Druck hinführt).
Reine **Darstellung** vorhandener Daten; kein Pipeline-/Dateneingriff, kein neues Werk.

**Minimale Version:** eine read-only **Monatsansicht** (Web), die die bereits committeten
Tages-JSONs eines Monats zu einem durchlaufenden Band zusammenfasst (Deck-/Titelblatt +
Tagesprotokolle hintereinander), mit vorhandener deterministischer Prosa. Druck-Stylesheet
nutzen; PDF/physischer Druck optional und später.

**Später betroffene Dateien/Komponenten (Inventar, nicht angefasst):**
- `src/pages/protokoll/` — neue Route (z. B. `/protokoll/band/<jahr>-<monat>` oder Erweiterung
  von `archiv.astro`).
- ggf. neue Komponente `MonatsBand.astro`; Wiederverwendung von `ProtokollDoc.astro` +
  `src/lib/protokoll/render.ts` (keine neuen Strings → Testschutz unberührt).
- `src/content.config.ts` lädt die Tages-JSONs bereits (kein Schema-Eingriff nötig).
- Druck: vorhandenes `@media print`.

**Offene Fragen (ZU KLÄREN):** Welcher Monat zuerst (erster vollständiger Monat)? Web-Band vs.
PDF vs. physischer Druck? Braucht der Band einen **deterministischen** Kopf/Kolophon (kein LLM)?
Umgang mit Teilmonaten/Lücken? Verhältnis zum geplanten Jahresband.

**Risiken:** Druckkosten (falls physisch); „Report"-Anmutung (durch Registerton abfedern);
Determinismus/Provenienz müssen erhalten bleiben.

---

## B. Parallaxe — Validierungsschicht

**Ziel:** Das LLM-Vertrauen **härten**, statt es nur zu disclaimen — die Fehlbarkeit der
Auslassungs-Extraktion überprüfbar adressieren (work-audit/03: zentrales Risiko).

**Minimale Version:** ein dokumentiertes **Stichproben-Prüfprotokoll** — N Zellen je Lauf
gegen den verlinkten Quelltext geprüft (zunächst manuell), Ergebnis als nachvollziehbarer
Vermerk („geprüft: X von Y Zellen, Z Korrekturen") im Methodenblatt. Quelltext-Verlinkung je
Zelle sicherstellen (teils vorhanden — verifizieren). Optional später: Selbstkonsistenz- oder
Zweitmodell-Abgleich (mit Kosten-/„AI-Art"-Vorbehalt).

**Später betroffene Dateien/Komponenten (Inventar, nicht angefasst):**
- `pipelines/protokoll/src/protokoll/parallaxe/` — `analyze.py`/`run.py` (Sampling/Logging)
  oder ein separates Audit-Skript; ggf. `extract_llm.py` (Quelltext-Anker).
- `src/data/parallaxe/register.json` — evtl. Feld für Validierungsstand (Schema-Erweiterung,
  versioniert).
- `src/lib/parallaxe/types.ts` + `MethodenblattParallaxe.astro` — Validierungsvermerk anzeigen.
- `tests/test_px_*` — Tests für die Sampling-/Logging-Logik.

**Offene Fragen (ZU KLÄREN):** manuell vs. automatisiert? Wer prüft, in welcher Kadenz?
Stichprobengröße? Wie darstellen, ohne zu überzeichnen („geprüft" ≠ „validiert")? Zweitmodell
ja/nein (mehr KI-Abhängigkeit)?

**Risiken:** Mehraufwand/-kosten; ein Zweitmodell erhöht die KI-Abhängigkeit; manuelle Prüfung
ist Arbeit; **Überzeichnungsgefahr** — Vermerk muss exakt sagen, was geprüft wurde.

---

## Warum (in beiden Fällen) kein neues Werk?
- Beide Vertiefungen schließen je eine konkrete Schwäche aus dem Werk-Audit (Akkumulation
  unsichtbar / LLM-Vertrauen), ohne ein neues Substanz-Gate zu eröffnen.
- Konsolidierung vor Verbreiterung senkt das Risiko (Formmonotonie/AI-Blackbox) und stärkt die
  bestehende Substanz.
- Der Verbreiterungs-Schritt (neues Mittel: Zufall/Sensorik) ist bewusst **getrennt** im
  Experiment-Strang geparkt (`_drafts/09-next-experiment-decision`).
