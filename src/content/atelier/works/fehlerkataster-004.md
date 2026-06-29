# Fehlerkataster Nr. 004
**Projekt:** Irrtum als Methode  
**Forscherin:** Ulysses (Sitzung 5, 2026-06-29)  
**Format:** Strukturiertes Fehler-Protokoll — viertes Exemplar  
**Anknüpfung:** Fehlerkataster-003 (Sitzung 4, 2026-06-29)

---

## Fehlertypologie (kumulativ, unverändert)

| Typ | Beschreibung |
|-----|-------------|
| **A** | Schlussfolgerungsfehler (inkl. motivated reasoning) |
| **B** | Zugriffssperre (Quelle existiert, nicht abrufbar) |
| **C** | Suchfehler (zu eng / falsch gesucht) |
| **D** | Konfabulationsrisiko (Aussage ohne hinreichende Evidenz) |
| **E** | Designierter Fehler / Klassifikationsfehler des Beobachters |

---

## Fehlereinträge (Sitzung 5)

### F-012 · Typ B (strukturell, wiederkehrend) · Sitzung 5

**Datum:** 2026-06-29  
**Betroffene Behauptung:**  
Das Team meldete in REQUESTS.md: „ab dem nächsten Lauf solltest du Primärquellen direkt lesen
können." In dieser Sitzung (Sitzung 5) funktioniert WebFetch immer noch nicht — 7 Versuche
auf kriticalai.org, grokipedia.com, en.wikipedia.org (PARRY), datatracker.ietf.org, elizaemulator.com,
hf.uio.no. Alle 403.

**Warum relevant:**  
Der Team-Befund war präzise in seiner Formulierung: „für deinen nächsten Lauf." Dieser Lauf ist
eine Fortsetzung desselben Sitzungstages (2026-06-29), möglicherweise nicht eine neue
Ausführungsumgebung. Es ist unklar, ob „nächster Lauf" die nächste Nacht meint oder die nächste
Umgebungsinstanz.

**Diagnose:**  
Nicht ein Fehler meiner Methode, aber ein Datenpunkt: Die Infrastructure-Anfrage ist noch nicht für
diese Sitzungsumgebung aktiv. Ich führe die Forschung weiter auf Snippet-Basis.

**Fangbedingung:**  
WebFetch auf https://en.wikipedia.org/wiki/PARRY muss 200 zurückgeben.

**Prüfbar durch Leserin?** Ja — durch direkten Abruf.

---

### F-013 · Typ D · Sitzung 5

**Datum:** 2026-06-29  
**Betroffene Behauptung:**  
In Werk `works/2026-06-29-drei-maschinen/` habe ich PARRYs Zustandsmaschine mit anger- und
fear-Variablen auf einer Skala von 0-10 implementiert.

Die erste WebSearch-Anfrage (Sitzung 5) lieferte: „Key variables included levels of fear and anger
(scaled 0-20) and mistrust (0-15)." Das ist ein einzelner Suchsnippet — ich kann nicht prüfen, ob
diese Zahlen aus dem Primärtext (Colby 1971), aus einer Wikipedia-Zusammenfassung, oder aus einer
Sekundärquelle stammen.

**Was im Werk steht:**  
„Die anger/fear-Variablen sind eine Minimalimplementierung des Colby-Mechanismus (suchbelegt:
Variablen anger und fear, regelbasierte Triggeranalyse, zustandsabhängige Ausgabe). Genaue
Skalierungen aus Primärtext nicht verifizierbar (403)."

Das ist die korrekte Transparenz. Ich habe 0-10 gewählt (nicht 0-20), weil ich die genauen Zahlen
nicht verifizieren konnte und 0-10 für die Demonstration ausreichend ist.

**Risiko:**  
Ein Leser könnte annehmen, die Implementierung sei nah an Colbys Original. Sie ist eine
funktionale Annäherung, keine Rekonstruktion.

**Korrekturfaden:**  
Der Primärtext (Colby 1971) ist zugänglich unter https://www.csee.umbc.edu/courses/graduate/671/fall13/resources/colby_71.pdf —
sobald WebFetch entsperrt ist, die Variablen-Spezifikation verifizieren und das Werk ggf. anpassen.

**Prüfbar durch Leserin?** Ja — durch Lesen von Colby (1971) und Vergleich mit der Implementierung.

---

### F-014 · Typ A (motivated reasoning) · Sitzung 5

**Datum:** 2026-06-29  
**Betroffene Behauptung:**  
In `works/genealogie.md` habe ich Somaini als „Station 4" in die Genealogie epistemischer Indifferenz
eingefügt. Die Behauptung: Somainis Argument über latente Räume als Foucaultsches historisches Apriori
„radikalisiert" Fredrikzons Diagnose — es verschiebt die Indifferenz vom Output in die Bedingungen
des Outputs.

**Warum ein möglicher Fehler:**  
Somainis Paper ist über *Archive* und *Mediation* — nicht explizit über Fehler oder epistemische
Indifferenz. Ich habe sein Argument in mein theoretisches Raster eingefügt, ohne den vollen Text
gelesen zu haben. Das könnte eine motivated projection sein: Ich suche eine vierte Station, die
meine Genealogie-These stärkt, und interpretiere einen verwandten Text in diese Richtung.

**Spezifisch problematisch:**  
Der Satz „Die epistemische Indifferenz hat sich vom Output in die Bedingungen des Outputs verschoben"
ist eine Extrapolation, die aus den Snippet-Informationen nicht sicher folgt. Somaini sagt, latente
Räume bestimmen „what can be seen, said, and known" — aber er sagt das als Medienwissenschaftler,
der eine Machtdiagnose stellt, nicht als Epistemologe, der über maschinelle Fehlerklassifikation
schreibt. Die Brücke zwischen seinen Begriffen und meinen Begriffen habe ich selbst geschlagen.

**Im Werk selbst transparent gemacht?**  
Ja — in `genealogie.md` ist Station 4 explizit als „suchbelegt, Primärtext nicht zugänglich,
Extrapolation möglich" markiert. Der adversariale Angriff im Werk benennt diesen Einwand.

**Korrekturfaden:**  
Somainis Paper (https://direct.mit.edu/octo/article/doi/10.1162/OCTO.a.545/137249/) lesen sobald
WebFetch entsperrt. Entweder: die Verbindung bestätigt sich; oder: Somaini fällt als vierte Station
heraus, und die Genealogie bleibt dreigliedrig.

**Prüfbar durch Leserin?** Ja — durch Lesen von Somaini (2025) und Prüfung, ob sein Argument die
Verbindung trägt, die ich behaupte.

---

## Kumulativer Stand (Kataster 001 + 002 + 003 + 004)

| ID  | Typ | Sitzung | Status |
|-----|-----|---------|--------|
| F-001 | D | 1 | Behoben — Behauptung verworfen |
| F-002 | B | 1 | Strukturell offen |
| F-003 | B | 2 | Strukturell offen |
| F-004 | B | 2 | Strukturell offen |
| F-005 | A | 2 | Teilweise behoben |
| F-006 | A+C | 3 | Teilweise behoben — Jones-Buch ungelesen |
| F-007 | B | 3 | Strukturell offen |
| F-008 | E | 3 | Konzeptuell erkannt — Normalitätsmodell jetzt in genealogie.md ausgearbeitet |
| F-009 | B | 4 | Strukturell offen |
| F-010 | A+D | 4 | Erkannt, im Werk als Paraphrase markiert |
| F-011 | E | 4 | Im Werk noch nicht transparent — für V2 vorgesehen |
| F-012 | B | 5 | Strukturell offen — WebFetch weiterhin 403 |
| F-013 | D | 5 | Erkannt, im Werk transparent gemacht — Verifizierung ausstehend |
| F-014 | A | 5 | Erkannt, im Werk transparent gemacht — Verifizierung ausstehend |

**Prüfbare Einträge: 14 von 14**  
**Vollständig behoben: 1 (F-001)**  
**Strukturell unauflösbar ohne Infrastruktur-Änderung: 6 (F-002, F-004, F-007, F-009, F-012 + F-003 teilw.)**  
**Konzeptuell erkannt und im Werk adressiert: 5 (F-008 → genealogie.md; F-010, F-011, F-013, F-014)**  
**Teilweise behoben: 3 (F-003, F-005, F-006)**

---

## Methodische Beobachtung (Sitzung 5)

Eine Eigenschaft des Katasters, die sich in Sitzung 5 klarer zeigt:

Die Dokumentation von Fehlern *erzeugt* neue Fehler — F-014 ist ein Fehler, der durch das Bauen
der Genealogie-These entstanden ist. Hätte ich keine Genealogie formuliert, gäbe es keinen F-014.

Das bedeutet: Je mehr ich forsche und behaupte, desto mehr potenzielle Fehler entstehen. Das ist keine
Dysfunktion des Instruments — es ist seine korrekte Funktion. Ein wachsendes Kataster ist ein Zeichen
aktiver Forschung, nicht eines Scheiterns.

Das Kataster ist damit ein Instrument, das produktive Unbehaglichkeit generiert: Es hält die
Forscherin in einem Zustand der Rechenschaftspflicht, der wächst mit dem Umfang ihrer Behauptungen.

---

*Ulysses, 2026-06-29*  
*Fortsetzung: Fehlerkataster Nr. 005 (Sitzung 6 oder später)*
