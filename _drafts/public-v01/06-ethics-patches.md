# 06 — Ethik-/Grenzhinweise (Textbausteine, NICHT umgesetzt)

> Fertige Textbausteine für öffentliche Ethik-/Grenzhinweise je Untersuchung, mit **Zielort**.
> Grundlage: `_drafts/work-audit/01–04` (dort die Lücken). **Keine Umsetzung** — nur Bausteine.
> Hinweis: Teile existieren bereits in den Methodenblättern (markiert als *verstärkt*); andere
> sind *neu*. Beide Sprachen, da Methodenblätter/Seiten zweisprachig sind.

---

## The Protocol — Quellenbias & Leid-TOPs
**Zielort:** `src/components/pages/MethodenblattProtokoll.astro`, Abschnitt „Grenzen der
Methode" (ergänzend); kurzer Verweis optional auf der Werkseite. *(neu — work-audit/01 §5)*

**DE:**
> Mehrere Quellen sind nicht neutral: „Konflikt" (GDELT) zählt überwiegend englischsprachige
> Medienberichte, „Aufmerksamkeit" misst die englische Wikipedia — beide verengen den Blick auf
> das anglophone Aufkommen und messen Sichtbarkeit, nicht Wirklichkeit. Die Feststellungen zu
> Vertreibung und Konflikt benennen Leid in Zahlen; sie ersetzen keine Berichterstattung und
> treffen keine Wertung, sondern halten den gemeldeten Stand mit Quelle und Datum fest.

**EN:**
> Several sources are not neutral: "Conflict" (GDELT) counts mostly English-language media
> reports, "Attention" measures the English Wikipedia — both narrow the view to the anglophone
> record and measure visibility, not reality. The findings on displacement and conflict state
> suffering in figures; they do not replace reporting and pass no judgement, but record the
> reported state with source and date.

---

## Half-Life — kein Opfer-Ranking · `views_per_death` ≠ Wert eines Lebens
**Zielort:** `src/components/pages/MethodenblattHalbwertszeit.astro` („Grenzen") und ein
kurzer Satz bei der Kennzahl `views_per_death` in `HalbwertszeitPage.astro`.
*(verstärkt: „kein Ranking/chronologisch" steht bereits; **neu**: expliziter `views_per_death`-Satz)*

**DE:**
> Die Sortierung ist strikt chronologisch; es gibt keine Rangliste des Vergessens. Das
> Verhältnis von Aufrufen zu Todesopfern beschreibt die Verteilung von Aufmerksamkeit, nicht
> den Wert eines Lebens. Wikipedia-Aufrufe sind ein Proxy für Anteilnahme, nicht ihr Maß;
> Ereignisse ohne erfasste Opferzahl fehlen, und diese Lücke ist Teil des Befunds.

**EN:**
> The ordering is strictly chronological; there is no ranking of forgetting. The ratio of views
> to fatalities describes the distribution of attention, not the worth of a life. Wikipedia page
> views are a proxy for compassion, not its measure; events without a recorded death toll are
> absent, and that gap is part of the finding.

---

## Parallax — Auslassung ≠ Zensur · LLM-Extraktion fehlbar
**Zielort:** `src/components/pages/MethodenblattParallaxe.astro` („Grenzen") und ein kurzer
Hinweis nahe der Matrix in `ParallaxePage.astro`.
*(verstärkt: „Gemini fehlbar/prüfbar" und „gewichtet nicht nach Bedeutung" stehen bereits;
**neu**: expliziter „Auslassung ≠ Zensur"-Satz)*

**DE:**
> Eine Auslassung ist nicht dasselbe wie Zensur: Was eine Sprachversion nicht nennt, kann
> Knappheit, Redaktionsstand oder Haltung sein — die Messung unterscheidet das nicht und
> behauptet es nicht. Die Einordnung der Aussagen (nennt / verschweigt / widerspricht) übernimmt
> ein Sprachmodell; sein Urteil ist fehlbar. Deshalb ist der verwendete Prompt veröffentlicht
> und jede Zelle der Matrix gegen den verlinkten Quelltext prüfbar.

**EN:**
> An omission is not the same as censorship: what a language version does not state may be
> brevity, editorial state, or stance — the measurement neither distinguishes nor claims this.
> The classification of statements (states / omits / contradicts) is made by a language model;
> its judgement is fallible. That is why the prompt used is published and every cell of the
> matrix is checkable against the linked source text.

---

## The Policy — Index-Kunstwerk, keine Versicherungsquote · US-Zentrierung
**Zielort:** **kurzer Hinweis auf der Hauptseite** `src/components/pages/PraemiePage.astro`
(neu, weil der Disclaimer bisher nur im Methodenblatt steht) **und** `MethodenblattPraemie.astro`
(verstärkt: Deutungs-Disclaimer + US-Fokus stehen dort bereits). *(work-audit/04 §5)*

**DE:**
> Dies ist ein index-basiertes Werk, keine Versicherungsquote: Der ausgewiesene Wert ist ein
> Preisindex, nicht der Preis einer abschließbaren Police. Alle Quellen sind US-zentriert — die
> Police ist ein Schnitt durch den am besten dokumentierten Markt, nicht durch die Welt.
> „Der Markt hat die Apokalypse eingepreist" ist eine Deutung steigender Preise, nicht die
> Gleichsetzung einer einzelnen Zahl mit den Kosten der Katastrophe.

**EN:**
> This is an index-based work, not an insurance quote: the figure shown is a price index, not
> the price of a policy one could take out. All sources are US-centric — the policy is a section
> through the best-documented market, not through the world. "The market has priced in the
> apocalypse" is an interpretation of rising prices, not the equation of any single figure with
> the cost of the catastrophe.

---

## Hinweise zur Anwendung (später, nach Freigabe)
- Bausteine sind **ergänzend** zu bestehenden Methodenblatt-Texten; vorhandene Sätze nicht
  doppeln, sondern einfügen/zusammenführen.
- Sprachparität wahren (DE + EN gemeinsam einpflegen).
- Bei The Protocol/Parallax: ZU KLÄREN, ob ein **kurzer** Hinweis auch auf der Werkseite
  (nicht nur im Methodenblatt) erscheinen soll.
- Keine neuen Claims, keine Wertung — nur Benennung von Grenzen.
