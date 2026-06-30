# Rolle von frankbueltge.de & erste Projektideen

Arbeitspapier · 2026-07-01 · Begleitpapier zu `2026-07-01-daten-kunst-landschaft-topologie.md`

> Skizze, kein Bauauftrag. Wird eine Idee verfolgt, läuft sie zuerst durch
> Brainstorming → Spec → Plan (wie alle Experimente, Werkgruppe-Spec §2/§3.5).

## Rolle im Verbund

**frankbueltge.de = das Labor / die Grundlagenforschung.** Hier wird gemessen,
geprüft, verworfen — nüchtern, quelliert, Methode offen. Instrumente und Vorstudien,
keine fertige Geste. KI ist Material **und** Gegenstand, nie unbelegtes Orakel.

- **→ datavism.org** (cineastischer Daten-Aktivismus, Agent „GHOST"): nimmt ein im
  Labor erprobtes Instrument/einen Befund und macht daraus eine **Kampagne/Erzählung
  mit Haltung und Einsatz**. Das Labor liefert die prüfbare Grundlage; datavism die Form,
  die etwas riskiert.
- **→ data-snack.com** (adaptive Daten-Erzählung): kann die Instrumente/Datenquellen des
  Labors als **Material** konsumieren — personalisierte, adaptive Stories auf geprüfter Basis.
- **→ standalone:** manche Instrumente sind als eigenständiges Stück stark genug und bleiben
  hier (oder wandern später in eine Ausstellung/Schrift — siehe „Gesprächspartner").

**Die Pipeline:** Labor (Methode/Instrument, prüfbar) → trägt es, wird es bei datavism zur
Kampagne mit Einsatz oder bei data-snack zur adaptiven Erzählung; sonst starkes Einzelstück
oder ehrlich verworfen (Verworfenes bleibt sichtbar).

## Die Messlatte (verdichtet aus der Einschätzung + dem Feld)

Damit ein Stück über „gutes Daten-Journalismus" hinaus Richtung Forschung/Kunst zeigt
(vgl. Borgdorff/Bishop und das Benchmark-Roster):

1. **Die Form vollzieht das Argument** — nicht Metrik + literarische Caption. Das Objekt
   selbst trägt die These (Onuohas leerer Ordner; Crawford/Jolers Sierpinski-Diagramm).
2. **Das Instrument/der Beobachter ist Gegenstand** (Reflexivität) — *Franks stärkste Ader*
   (Patterns, The Round Number). Das Messgerät auf sich selbst richten.
3. **Realer Einsatz / Selbst-Implikation** — etwas steht auf dem Spiel; das Stück impliziert
   sich selbst, statt risikolos von außen zu zeigen.
4. **Akkumulation** — ein Werkkörper, kein One-Shot-Gotcha. Das Archiv wird zum Argument.
5. **Gesprächspartner statt Nutzer** — in einen Diskurs treten (ausstellen, schreiben, Kritik
   einladen). Der schnellste Hebel von „Experiment" zu „Forschung".

Plus Lab-Ethik (unverhandelbar): Nachprüfbarkeit, Quelle/Lizenz/Abrufzeit, Methode offen,
Schätzungen markiert, Ausfälle vermerkt.

## Wo Franks Profil greift

Die **heißesten** Cluster (1: materieller KI-Kostenpunkt; 4: Provenienz/Authentizität) sind im
Kern **Mess- und Dateninfrastruktur-Probleme** — genau Franks Beruf. Plus die reflexive Ader
(„das Instrument untersuchen") trifft Cluster 3+7. Das ist die ehrliche Überschneidung:
**nicht „autonome künstlerische Forschung", sondern: rigoros messen — die Maschine selbst, nicht
nur die Welt.**

## Projektideen (Skizzen)

Je Idee: *Frage · Cluster · epistemischer Move · was Engineering beiträgt · Anschluss · Risiko*.

### A — „Der Fußabdruck dieser Maschine" (Selbst-Vermessung)
- **Frage:** Was verbraucht diese Seite selbst — jede nächtliche KI-Pipeline, jede autonome
  Atelier-Sitzung — an Energie, Wasser, CO₂?
- **Cluster:** 1 (materieller Kostenpunkt) · reflexiv.
- **Move:** Das Instrument misst **sich selbst** und legt seinen eigenen Verbrauch offen
  („Diese Forschungssitzung kostete heute ~X l Wasser, ~Y Wh"). Selbst-Implikation statt
  Anklage von außen — die ehrlichste Form des hottesten Clusters.
- **Engineering:** Token-/Laufzeit-Logs × offengelegte Datacenter-PUE/WUE-Schätzwerte;
  versioniert ins Git-Archiv, Methode/Annahmen offen, alles als Schätzung markiert.
- **Anschluss:** → datavism-Kampagne („der Wasserpreis eines Prompts"); stark als standalone.
- **Risiko:** Schätz-Unsicherheit (Datacenter-Werte intransparent) — muss ehrlich als Spanne,
  nicht als Präzision auftreten, sonst „borrowed scientism".

### B — „Counter-Forensik der Werkzeuge" (das Instrument, das die Instrumente prüft)
- **Frage:** Funktionieren die populären forensischen/Detektions-Heuristiken überhaupt?
- **Cluster:** 3 (Counter-Forensics) + 7 (Reflexivität) · *direkte Fortschreibung von Round
  Number/Patterns*.
- **Move:** Täglich gegen bekannt-saubere **und** bekannt-manipulierte Daten testen, wie oft
  KI-Bild-Detektoren, Benford, Stylometrie, Geolokations-„confidence" sich irren — und die
  Fehlerraten ausweisen. „Die Counter-Forensik der Counter-Forensik." Vermeidet den Gaza-
  Einsatz-Zwang von Cluster 3 und trifft trotzdem dessen Kern: *die Bedingungen einer
  Behauptung*.
- **Engineering:** kuratierte Test-Korpora, reproduzierbare Pipeline, Konfusionsmatrix je Tag.
- **Anschluss:** → datavism (Entlarvung von „AI-Detektor"-Versprechen); standalone als
  Werkkörper über die Unzuverlässigkeit der Wahrheits-Werkzeuge.
- **Risiko:** „clever ≠ Kunst" — muss als *sustained inquiry* akkumulieren, nicht als täglicher
  Trick.

### C — „Was-ist-echt-Index" / Provenienz-Verfall (unterbesetztes Feld)
- **Frage:** Wie viel des öffentlichen Bild-/Text-Stroms trägt prüfbare Herkunft (C2PA) — und
  wie leicht bricht sie?
- **Cluster:** 4 (Authentizität) — laut Recherche **am stärksten unterbesetzt**, größte Chance.
- **Move:** Anteil gültiger Content-Credentials in einem definierten Korpus über Zeit messen;
  *oder* (Critical-Engineering-Variante: „the exploit as exposure") zeigen, wie trivial C2PA
  zu strippen/fälschen ist. Die Authentizitäts-Infrastruktur selbst zum Gegenstand machen.
- **Engineering:** C2PA-Parsing, Korpus-Sampling, Manipulations-Demonstrator.
- **Anschluss:** → data-snack (adaptive „Ist das echt?"-Erzählung); datavism (Provenienz-Kampagne).
- **Risiko:** technisch schwer; Datenschutz-Kehrseite von C2PA (Metadaten doxxen) mitdenken.

### D — „Kataster des Fehlenden" (Abwesenheit als Daten)
- **Frage:** Was wird in offiziellen Open-Data-Portalen **nicht** veröffentlicht oder still
  wieder entfernt?
- **Cluster:** 6 (Missing Data) · Onuoha-Linie · *erweitert die bestehende „Redaction".*
- **Move:** Portale prüfen und die *Abwesenheit* über Zeit quantifizieren — Onuohas „leerer
  Ordner" als laufendes, akkumulierendes Instrument statt Einzelobjekt.
- **Engineering:** Diff über Portal-Schnappshots, Lücken-Erkennung, versioniertes Archiv.
- **Anschluss:** → datavism (Accountability); konsolidiert die Counter-Measurement-Linie.
- **Risiko:** Abgrenzung zur „Redaction" nötig, sonst Dopplung.

### E — „Model Collapse, instrumentiert"
- **Frage:** Was passiert messbar, wenn eine KI über Generationen den eigenen Output frisst?
- **Cluster:** 7 (Selbstverzehr) · reflexiv · visuell stark.
- **Move:** Den Degradations-Prozess rigoros **messen** und zeigen — die Maschine, die sich
  selbst verzehrt, als prüfbares Instrument (Ars-Benchmark *Model Collapse*, aber gemessen).
- **Anschluss:** → datavism/data-snack (cineastisch/adaptiv); standalone möglich.
- **Risiko:** bekannter Effekt — der Mehrwert liegt in Rigorosität + Form, nicht im „Aha".

### F — „Die Anatomie dieser Seite" (Selbst-Lieferkette)
- **Frage:** Welche Infrastruktur verbraucht dieses kleine Werk selbst — welche Clouds, Modelle,
  Datenquellen, wessen Compute?
- **Cluster:** 1+3 · Crawford/Joler-Linie, aber auf die *eigene* Maschine gerichtet.
- **Move:** *Anatomy of an AI System* im Kleinen und ehrlich auf sich selbst angewandt — die
  Lieferkette dieser Seite kartieren, statt auf „die KI" zu zeigen.
- **Anschluss:** Grundlagen-Stück; speist A & B; als Diagramm standalone.
- **Risiko:** könnte bei „hübsches Diagramm" enden — die Form muss das Argument tragen (Move 1).

## Empfehlung

Zwei Stücke zuerst, weil sie **alle fünf Messlatte-Kriterien** am ehesten treffen und auf
Franks echtem Können (rigoros messen) + stärkster Ader (Reflexivität) stehen:

1. **A — „Der Fußabdruck dieser Maschine"** — hottester Cluster, Daten-Engineering-Kern,
   selbst-implizierend, ehrlich. Direkt datavism-anschlussfähig.
2. **B — „Counter-Forensik der Werkzeuge"** — Franks eigene Ader fortgeschrieben, trifft Cluster 3
   ohne Gaza-Einsatz-Zwang, akkumuliert zu einem Werkkörper.

**C** als Stretch (unterbesetztes Feld = größte Sichtbarkeitschance, aber technisch teurer).

**Nächster Schritt, wenn eine Idee gezogen wird:** Brainstorming-Skill → Spec (Substanz-Gate §2)
→ Plan. Und ein „Gesprächspartner"-Schritt von Anfang an mitdenken (eine Ausstellung/Schrift/
ein Ort, an dem widersprochen werden kann) — laut Recherche der schnellste Hebel von Experiment
zu Forschung.
