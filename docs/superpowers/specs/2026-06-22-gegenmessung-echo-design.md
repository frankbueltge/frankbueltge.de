# Spec — Gegenmessung (die Linie) + Instrument I: „The Echo"

**Status:** Entwurf zur Abnahme (Brainstorming mit Frank, 2026-06-21/22)
**Ersetzt die Richtung von:** „The Roadmap" (verworfen — zu konventionell, keine Linie)

## 1. Die Linie: Gegenmessung / Counter-Measurement

Das Lab war bisher eine Sammlung sauberer Einzel-Experimente ohne verbindende These — darum
beliebig und zahm. Die Linie macht es zu einem **Programm** und positioniert Frank.

> **Gegenmessung.** *„Macht zählt, was ihr nützt — den Rest lässt sie im Dunkeln. Ich zähle
> den Rest und mache ihn nachprüfbar."*
> EN: *„Power counts what serves it and leaves the rest in the dark. I count the rest — and
> make it checkable."*

Der Doppelsinn trägt: Gegen-**Messung** (Instrument/Forensik aus Franks eigener Positionierung)
+ Gegen-**Maßnahme** (der „track back"-Biss aus datavism.org). Zwei Facetten desselben Kerns:
- **Der blinde Fleck** — *was* die Gegenmessung zählt.
- **Dark Data** — der Fachbegriff dafür (Daten, die ein System zu erheben verweigert).

Die vier bestehenden Experimente lassen sich **rückwirkend** als erste, instinktive
Gegenmessungen lesen (Half-Life misst den Zerfall = die Lücke; Parallax die Auslassung;
The Policy das Un-Benannte; The Protocol die Reduktion aufs Zählbare). Das neue Programm macht
die Methode **explizit** und treibt sie zur Avantgarde: live, inferentiell, multi-Quellen —
nicht „noch ein Chart eines bekannten Datensatzes".

**Das Programm — vier Instrumente:**
1. **The Echo** — orchestrierter Konsens (diese Spec, zuerst).
2. *Die Lüge der offiziellen Zahl* — Nowcast vs. amtliche Statistik, der aufgedeckte Fehler.
3. *Wie echt ist das hier?* — synthetische Sättigung eines Medienraums, selbst-skeptisch.
4. *Die Anomalie-Maschine* — stehendes Instrument, das täglich die größte Ko-Anomalie hebt (Capstone).

## 2. Avantgarde-Latte (gilt für jedes Instrument)

- **Ableiten, nicht abbilden** — das Artefakt ist eine Inferenz, nicht ein gerendeter Datensatz.
- **Verbinden, was niemand verbindet** — Neuheit liegt im Quell-Join, nicht in der Quelle.
- **Die Maschine findet die Frage** — von-der-Stunde, nie dasselbe.

## 3. Instrument I: „The Echo" (Arbeitstitel; Alt.: The Chorus / Verbatim)

**Frage:** Wie viel des scheinbar *unabhängigen* Nachrichten-Konsenses ist echte eigene
Recherche — und wie viel ist *eine* Quelle, wortgleich über nominell unabhängige Medien kopiert?

**Der blinde Fleck:** „47 Medien berichten X" *wirkt* wie Bestätigung. Das Instrument zeigt:
es war oft **1 Quelle, 47-mal**. Es zählt das Ungezählte — den Anteil Echo am Konsens.

### 3.1 Validierter Fund (echt, GDELT, 2026-06-21)

Aus 250 aktuellen englischsprachigen AI-Artikeln über **180 verschiedene Domains**, gemessen
als wortgleiche 5-Gramm-Phrasen über distinkte Quell-Domains:

- **„poll: 70% of Americans concerned AI will take jobs"** — wortgleich auf **13 Zeitungen**
  (advocateanddemocrat.com, averyjournal.com, bryantimes.com, elpasoinc.com …).
- **„who is Peter Thiel, billionaire organiser of controversial Wicklow event"** — **12 irische Blätter**.
- **„can AI help us age better — scientists are trying to find out"** — **12 US-Kettenblätter**.

Der scheinbar unabhängige Konsens ist eine Quelle, x-fach kopiert. **Das Signal existiert,
ist reproduzierbar und themen-agnostisch** (AI war nur Testfeld; der Thiel-Fund ist irische
Lokalpresse — gemessen wird die Medienstruktur, nicht ein Thema).

### 3.2 Methode

- **Quelle:** GDELT DOC 2.0 API (frei, keine Auth; Rate-Limit 1/5 s) — `mode=artlist`, je Domain
  Titel + Datum. Optional später GDELT GKG für Volltext-Leads. (BigQuery-GKG als Ausbau möglich,
  Adapter-Muster existiert in `pipelines/protokoll`.)
- **Messung:** Über einen Tag/ein Thema die Artikel sammeln → wortgleiche n-Gramm-Phrasen (Shingles)
  je distinkter Domain zählen → **Echo-Metrik**: Anteil der Berichterstattung, die repliziert statt
  original ist; die meist-replizierte Phrase + das **Replikations-Netz** (welche Mastheads identisch liefen).
- **Ehrliche Trennung:** Ketten-/Wire-Syndizierung (banal, aber aufschlussreich) vs. verstreute
  PR-Platzierung (pointierter). Beide werden ausgewiesen; das Instrument behauptet **keine Absicht**.

### 3.3 Output (nüchtern-forensisch, Franks Register)

Täglich, ins Git-Archiv committet:
- **„Der Satz, den die meisten ,unabhängigen' Medien heute wortgleich brachten."**
- Die Liste der Mastheads + das Replikations-Netz (wer mit wem identisch ist).
- Der **Echo-Index** des Tages (Echo-Anteil am Konsens).
- Spätere Lenses (vom Nutzer gewünscht): *Lokalnachrichten als Geist* (News-Deserts) und
  *PR-Wäsche rückverfolgt* (eine Behauptung auf ihre eine Quelle zurück).

### 3.4 Substanz-Gate (Nachweis)

1. **Echte Daten, Provenienz** — GDELT + benannte Quell-Domains, Abrufzeit. ✓
2. **Eine Frage, kein Effekt** — Echo-Anteil ist überprüfbar. ✓
3. **Infrastruktur als Aussage** — misst die Medien-Infrastruktur selbst (wer kopiert wen). ✓
4. **Leave-behind** — offener Code, committete Tages-JSON. ✓
5. **Verhältnismäßigkeit** — leichter API-Abruf, statisch gerendert. ✓

### 3.5 Grenzen (prominent im Methodenblatt)

Titel statt Volltext (v1); GDELT-Abdeckungs-Bias (englisch/westlich); legitime Syndizierung ≠
Manipulation — aber die *Illusion unabhängiger Bestätigung* bleibt der Punkt; kein Absichts-Claim;
n-Gramm-Schwellen sind eine gesetzte Wahl (offengelegt).

### 3.6 KI/ML als Methode — nachprüfbar (ersetzt das alte „kein LLM"-Dogma)

Das Lab experimentiert mit Daten UND KI (inkl. ML und symbolischer/neuro-symbolischer KI). Die
einzige Bedingung ist **Nachprüfbarkeit:** jeder KI-Schritt transparent (Modell/Prompt/Verfahren
offengelegt), Output verifiziert oder als Schätzung markiert; wo das Modell der Gegenstand ist,
wird seine Unzuverlässigkeit Teil der Messung. KI als ausgewiesenes, prüfbares Werkzeug UND als
Gegenstand — nie als unbelegtes Orakel. Weiterhin gilt: kein erfundener Datenpunkt, keine
Secrets/PII, keine Tech-Demo-Ästhetik, Unsicherheit ehrlich.

### 3.7 KI/ML-Schichten von „The Consensus" (gestaffelt)

- **v1 (Baseline, statistisch):** wortgleiche n-Gramm-Synchronität über Domains. Fängt *verbatim*
  Wire-Copy — der validierte Fund (77 Medien, ein Satz).
- **v2 (ML, semantisch):** Embeddings/Vektor-Ähnlichkeit fangen *paraphrasierte* Koordination
  (gleiche Behauptung, leicht umformuliert) — die „weiche" Synchronität, die Verbatim-Matching verfehlt.
- **v3 (symbolisch, neuro-symbolisch):** ein **Provenienz-/Propagations-Graph** (wer brachte den
  Satz zuerst, wer echote wann) — auditierbares Graph-Reasoning identifiziert Quelle und Kaskade.
  Optional ein LLM als *transparenter, gegen den Graphen verifizierter* Klassifikator
  (Wire-Syndizierung vs. gestreute PR-Platzierung), Prompt offengelegt.
- **Selbstbezug:** ein KI-Instrument, das einen zunehmend KI-erzeugten Medienstrom misst — und
  über den eigenen KI-Einsatz Rechenschaft ablegt.

## 4. Technik-Skizze (kein Plan — der folgt mit writing-plans)

- Python-Schritt im Muster von `pipelines/protokoll/` (eigener Adapter `echo/`): täglich GDELT
  abrufen, Echo-Metrik rechnen, `src/data/echo/<datum>.json` committen (Git = Archiv).
- Astro-Seite + Methodenblatt nach dem etablierten Experiment-Muster (EN/DE, Lab-Eintrag, OG).
- Determinismus + Testschutz für die Metrik-Funktionen (wie Half-Life/Policy).

## 5. Offene Fragen für Frank

- Name: „The Echo" ok, oder „The Chorus" / „Verbatim"?
- Kadenz: täglich (wie Protokoll) oder bei Bedarf?
- Themenwahl pro Tag: die Story mit dem höchsten Echo-Anteil automatisch (die Maschine wählt),
  oder ein rotierendes Set fester Themen?
