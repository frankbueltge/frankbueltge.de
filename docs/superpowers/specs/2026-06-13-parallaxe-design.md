# Werk ④ „Parallaxe" — Teilprojekt-Design

**Datum:** 2026-06-13 · **Status:** Design abgenommen (Designrunde), **Prototyp-Gate offen** (§5)
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

## 6. Infrastruktur (nach Freigabe)

GCP (data-snack): Cloud Translation + Vertex AI Embeddings, nächtlicher Cloud-Run-Job
`parallaxe` (gleiches Image-Muster), committet `src/data/parallaxe/register.json` (Git als
Archiv). Kostendisziplin: nur geänderte Artikel neu übersetzen/embedden (Hash-Cache),
maximum_bytes/Budget-Wächter; Fußabdruck im Methodenblatt beziffert.
