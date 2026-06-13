# Werk ④ „Parallaxe" — Teilprojekt-Design

**Datum:** 2026-06-13 · **Status:** **PROTOTYP-GATE: Embedding-Maß durchgefallen (2026-06-14)** —
das designierte Kernmaß (Pivot-/mehrsprachige Embedding-Distanz) trägt nicht; die lesbare
Divergenz (Lemma, Auslassung, Rahmung) trägt sehr wohl. Entscheidung über Redesign/Weiterbau
liegt beim Künstler (§5). Details unten.
**Übergeordnet:** Werkgruppen-Spec §7; verschärftes Substanz-Gate (These zuerst, messbar, akkumulierend).

## 1. These

Es gibt nicht *eine* Beschreibung der Welt, sondern viele — und ihr Abstand ist messbar.
Parallaxe vermisst, wie weit dieselbe Sache in verschiedenen Sprachversionen der Wikipedia
auseinanderliegt, und macht die epistemische Drift zum Messgerät.

## 2. Das Maß (Designrunde: „beides kombiniert")

Zwei Schichten je Themenpaar, beide nächtlich:

1. **Pivot-Abstand (die Kurve):** Jede Sprachversion wird maschinell ins Englische übersetzt,
   dann embedded (Vertex AI, multilingual/EN); paarweise Kosinusdistanz zwischen den
   Pivot-Embeddings. Übersetzung neutralisiert den Sprach-Confound — übrig bleibt inhaltliche
   Divergenz. Restunsicherheit (Übersetzungsrauschen) gehört aufs Methodenblatt. Zeitreihe je
   Sprachpaar → „Abstand DE↔RU heute 0,41, wachsend seit 14 Tagen".
2. **Faktendivergenz (die Belege):** Aus jeder Version werden überprüfbare Größen extrahiert —
   Opferzahlen, Datumsangaben, Wer-tat-was, Artikellänge, Quellenzahl, der verwendete Eigenname
   (z. B. Senkaku vs. Diaoyu). Tabellarisch je Version: „DE: 200 Tote · RU: 40 Tote". Jede
   extrahierte Tatsache verlinkt auf die Quellversion — der Leser prüft selbst.

**LLM-Spannung, offen ausgewiesen:** Faktenextraktion braucht ein Sprachmodell — ein Black-Box-
Schritt in einem Werk über Transparenz. Auflösung: (a) der Extraktions-Prompt wird veröffentlicht,
(b) jede Tatsache ist menschlich gegen die verlinkte Quelle prüfbar — das LLM ist transparenter
Extraktor, kein Orakel. Die *Darstellung* des Werks bleibt deterministisch (kein LLM-Fließtext);
nur die *Messung* nutzt Übersetzung/Embedding/Extraktion.

## 3. Register (Designrunde: „Edit-War-Signal, automatisch")

Die veröffentlichte Regel ist die Kuration: Aufgenommen werden Themen mit messbarem
Konfliktsignal — Artikel mit Schutzstatus (protection) und/oder hoher Revert-Rate, die in
mindestens N der Zielsprachen existieren. Niemand wählt aus; das Werk misst, wo das Netz selbst
streitet. Quellen: Wikipedia-API (Schutzstatus, Edit-Historie), Sprachversionen über Wikidata-
Sitelinks. Zielsprachen (Erstfassung): de, en, ru, uk, ar, he, zh, fa.

## 4. Sprachpaare & Darstellung

Kopf: eine Aussage („Der mittlere Abstand der Wahrheiten beträgt derzeit X"). Register je Thema:
Abstands-Heatmap/Kurven über die Sprachpaare + Faktentabelle + Edit-Aktivität je Version.
Sortierung sachlich (z. B. nach Abstand erlaubt — anders als Halbwertszeit, hier ist „größter
Abstand" kein Opfer-Ranking, sondern der Befund selbst; im Spec-Review prüfen).

## 5. Prototyp-Gate (vor jedem Bau)

2–3 echte Konfliktthemen per Hand-Pipeline vermessen — inkl. eines Eigennamen-Streits
(Senkaku/Diaoyu) als Härtetest. Schritte: Extrakte je Sprache holen → Pivot-Übersetzung →
Embeddings → Kosinusdistanz-Matrix → Faktenextraktion (im Prototyp manuell/Claude, Produktion:
LLM mit publiziertem Prompt). Kriterien: (a) Abstände trennen plausibel (umkämpfte Paare weiter
als unstrittige), (b) die extrahierten Fakten zeigen reale, belegbare Divergenz, (c) das
Übersetzungsrauschen ist kleiner als das Signal. Erst nach Freigabe: Plan + Bau. Scheitert der
Prototyp, wird hier dokumentiert woran.

## 5a. Prototyp-Ergebnis (2026-06-14) — der entscheidende Befund

Gemessen: Senkaku/Diaoyu (umkämpft, Eigennamen-Streit als Härtetest) gegen Photosynthese
(Kontrolle), je 8 Sprachversionen, echte Wikipedia-Extrakte, Vertex-Embeddings.

**Embedding-Distanz diskriminiert nicht:**
- Intro-Absätze, Pivot ins Englische: umkämpft 0,138 vs. Kontrolle 0,111 → Faktor 1,2 (schwach).
- Volltext, mehrsprachiges Embedding nativ: umkämpft 0,117 vs. Kontrolle 0,120 → **Faktor 0,97**.

Die umkämpfte Frage liegt im Embedding-Raum *nicht* weiter auseinander als ein neutrales
Lehrbuchthema. **Grund (konzeptionell, nicht durch Tuning behebbar):** Embedding-Distanz misst
semantische Gesamtüberlappung; Umkämpftheit lebt in Name, Auslassung und Rahmung — einem
kleinen Textanteil, den das Embedding wegmittelt. Beide Senkaku-Versionen beschreiben dieselben
Inseln; sie streiten nur über den Namen und verschweigen Unterschiedliches.

**Die lesbare Divergenz trägt dagegen klar** (manuell extrahiert, Beleg im Prototyp):
- **Lemma-Divergenz:** zh führt mit *Diaoyu*, alle anderen mit *Senkaku* — der Streit steckt im Titel.
- **Auslassung:** die japanische Version erwähnt den Territorialstreit mit **keinem Wort** (reine
  Geografie); die deutsche auch nicht. ru/uk/ar/fa/zh benennen ihn explizit.
- **Souveränitäts-Rahmung:** „von Japan verwaltet" (en) · „Tokio kontrolliert, Peking/Taipeh
  beanspruchen" (ru) · „1972 an Japan zurückgegeben" (ar) · „von Japan ‚Senkaku' genannt" (zh).

**Verdikt:** Das Werk als spezifiziert (Embedding-Distanz als Schlagzeile „Abstand der Wahrheiten")
ist tot — diese Zahl wäre Rauschen, der Überflug-Fehler ein zweites Mal. Der reale, substanzielle
Befund ist die **Auslassung** („Was jede Sprache verschweigt") und die **Lemma-Divergenz**. Diese
generisch zu messen braucht ein LLM (Vertex Gemini) mit publiziertem Prompt — die Black-Box-
Spannung, die der Künstler in der Designrunde markiert hat. Damit ist die nächste Entscheidung
eine künstlerische Weiche, keine technische — sie liegt beim Künstler:

- **(A) Redesign zu „Was jede Sprache verschweigt":** LLM extrahiert je Sprachversion die
  benannten/ausgelassenen Kernaussagen; Schlagzeile wird konkret statt fuzzy
  („Die japanische Version verschweigt den Territorialstreit, den 6 Sprachen benennen"). Stärkstes
  Werk, aber LLM-abhängig (Prompt publiziert, jede Aussage gegen Quelle prüfbar → transparenter
  Extraktor statt Orakel).
- **(B) LLM-frei, schmal:** nur Lemma-Divergenz + Sprachabdeckung + Längenasymmetrie. Voll
  transparent, aber dünn und nur für Eigennamen-Streits stark.
- **(C) Parallaxe ruhen lassen** wie Überflug — dokumentiert, verworfen, Energie in Prämie.

Prototyp-Artefakte: /tmp/px-*.json (Extrakte, Pivots, Distanzen, Faktentabelle).

## 5b. Redesign „Was jede Sprache verschweigt" — Künstlerentscheidung (A), LLM-Gate bestanden (2026-06-14)

Das Werk wird um die **Auslassung** herum neu gedacht, nicht um die (tote) Embedding-Distanz.

**These (neu):** Es gibt nicht eine Beschreibung der Welt, sondern viele — und was jede Sprache
*verschweigt*, ist das Messgerät. Nicht ein fuzzy Abstand, sondern: *welche Aussage benennt diese
Version, welche lässt sie weg, welcher widerspricht sie.*

**Mechanismus (validiert):** Ein Aufruf an Vertex Gemini (gemini-2.5-flash, temperature 0,
strukturiertes JSON, **publizierter Prompt**) je Thema, gefüttert mit den nativen Einleitungstexten
aller Sprachversionen. Ausgabe: (1) Primärname je Sprache (Lemma-Divergenz), (2) konsolidierte Liste
atomarer Aussagen, (3) Matrix Aussage × Sprache mit „nennt | verschweigt | widerspricht". Jede Zelle
ist gegen den verlinkten Quelltext prüfbar → transparenter Extraktor, kein Orakel. Gate-Beleg
(Senkaku): „Territorialstreit" von ja/zh/en/de verschwiegen, von ru/uk/ar/fa benannt; Lemma-Divergenz
Diaoyu/Senkaku korrekt erfasst; zusätzlich Richtungs-Widersprüche markiert.

**Aggregatmaß (die eine Zahl):** Auslassungsindex je Thema = mittlerer Anteil der themenweiten
Aussagen, den eine Version verschweigt. Schlagzeile konkret statt fuzzy
(„Im Mittel verschweigt jede Sprachversion 41 % dessen, was die anderen benennen").

**Register (automatisch, das Netz wählt):** Wikipedia pflegt selbst die Liste
*Wikipedia:List of controversial issues* — daraus werden die Themen gezogen (verlinkte Artikel,
gefiltert auf ≥ 4 Zielsprachen), nächtlich. Niemand (nicht der Künstler) wählt per Thema aus.
Pro Thema wird zusätzlich der Schutzstatus (protection) als Konfliktbeleg angezeigt.

**Vereinfachung ggü. §2/§6:** Kein Embedding, keine Übersetzung — Gemini ist multilingual. Pipeline
= Register holen → je Thema Extrakte + ein Gemini-Aufruf → Matrix-JSON committen. Kosten: ~15 Flash-
Aufrufe/Nacht, trivial.

## 6. Infrastruktur (nach Freigabe)

GCP (data-snack): Cloud Translation + Vertex AI Embeddings, nächtlicher Cloud-Run-Job
`parallaxe` (gleiches Image-Muster), committet `src/data/parallaxe/register.json` (Git als
Archiv). Kostendisziplin: nur geänderte Artikel neu übersetzen/embedden (Hash-Cache),
maximum_bytes/Budget-Wächter; Fußabdruck im Methodenblatt beziffert.
