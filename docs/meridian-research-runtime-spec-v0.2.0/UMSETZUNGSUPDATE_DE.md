# Meridian Research Runtime v0.2.0 — Umsetzungsupdate
## Vom Governance- und Evidenzsystem zur konkreten Forschungsmaschine

## Entscheidung

Version 0.1.1 spezifiziert ein belastbares **Research Governance and Evidence Operating System**: Forschungsaufträge, Berechtigungen, lokale Ausführung, Provenienz, Claims, Verifikation, Transfers und Korrekturen. Diese Schicht bleibt vollständig erhalten.

Version 0.2.0 ergänzt den bislang fehlenden **Research Method Kernel**. Er beschreibt, wie Meridian aus einer offenen Forschungsfrage ein ausführbares, falsifizierbares und revisionsfähiges Forschungsprogramm erzeugt.

Die Runtime wird damit nicht zu einem Master-Agenten und erhält keine universelle wissenschaftliche Methode. Stattdessen führt sie **lokale, versionierte Method Profiles** aus. Das erste vollständige Profil ist `causal_observational`, weil die Referenzfrage eine kausale sozialwissenschaftliche Untersuchung verlangt.

> Die Runtime verwaltet nicht nur Forschung. Sie kompiliert Fragen in überprüfbare Forschungsoperationen, ohne deren Geltungsgrenzen zu verstecken.

## Was neu hinzukommt

Der Research Method Kernel führt folgende Objekte und Dienste ein:

1. `QuestionModel` — zerlegt die Ausgangsfrage in Claim-Typ, Population, Exposition, Outcome, Raum, Zeit und offene Begriffe.
2. `ConceptMeasurementCharter` — definiert lokale Begriffe, Messvarianten, Klassifikationen und bekannte Messfehler.
3. `Estimand` — legt fest, welcher konkrete Effekt für welche Einheit und Population geschätzt werden soll.
4. `CausalModel` — erfasst Mechanismen, Confounder, Mediatoren, Selektionspfade und konkurrierende Erklärungen.
5. `EvidenceMatrix` — strukturiert Literatur nach Design, Identifikation, Effekt, Scope, Limitationen und Quellenfamilie.
6. `DataAssetProfile` — bewertet Datensätze nach Auflösung, Abdeckung, Zugriff, Bias, Joinbarkeit, Recht und kausaler Eignung.
7. `ResearchDesign` — beschreibt eine konkrete Untersuchungsstrategie und ihre Daten- und Diagnostikbedürfnisse.
8. `IdentificationAudit` — entscheidet, ob ein Design kausale, assoziative, deskriptive oder keine belastbare Aussage tragen kann.
9. `PreAnalysisPlan` — friert konfirmatorische Entscheidungen vor Ergebnisinspektion ein.
10. `FalsificationPlan` — erzeugt Placebos, negative Kontrollen, alternative Messungen und Kill Conditions.
11. `ReplicationPlan` — verlangt unabhängige Reimplementierung oder dokumentiert deren Unmöglichkeit.
12. `GeneralizationMap` — grenzt ab, für welche Populationen, Räume und Zeiten ein Claim gelten darf.
13. `ResearchDecision` — dokumentiert `continue`, `revise`, `kill`, `replicate`, `narrow_scope`, `escalate` oder `stop_insufficient_evidence`.

## Kernarchitektur

```text
Research Score
    ↓
Question Compiler
    ↓
Concept & Measurement Charter
    ↓
Estimand Set + Causal Model
    ↓
Evidence Scout + Data Scout
    ↓
Design Generator
    ↓
Identification Audit
    ↓
Hypothesis Forest
    ↓
Pre-analysis Lock
    ↓
Analysis Compiler + local execution
    ↓
Falsification + independent replication
    ↓
Claims + Generalization Map
    ↓
Adaptive Research Decision
    ↓
Governance-, Transfer- und Correction-System aus v0.1.1
```

## Referenzprojekt

Die Spezifikation enthält einen vollständigen vertikalen Referenzfall für die Frage:

> „In welchem Maß erhöht steigende Wohnkosten-Unbezahlbarkeit ursächlich die Unterstützung für rechtspopulistische / Anti-Establishment-Parteien in europäischen Städten, 2015–2025?“

Der Fall ist **kein vorweggenommenes Forschungsergebnis**. Er demonstriert:

- wie uneindeutige Begriffe getrennt werden;
- wie mehrere Estimands entstehen;
- wie individuelle Präferenzänderung von räumlicher Sortierung unterschieden wird;
- wie mehrere kausale Mechanismen konkurrieren;
- wie Daten- und Literaturrecherche strukturiert wird;
- wie Designs generiert und bei schwacher Identifikation beendet werden;
- wie eine präanalytische Festlegung erfolgt;
- wie Falsifikation und Replikation Claims begrenzen;
- wie die Runtime auch zu `insufficient_evidence` gelangen kann.

## Implementierungsprinzip

Die erste Method-Kernel-Version wird **ohne LLM-Autorität** implementiert. LLMs dürfen Vorschläge erzeugen; autoritative Objekte entstehen nur durch:

- Schema-Validierung,
- deterministische Domain-Regeln,
- Policy-Entscheidungen,
- dokumentierte menschliche oder unabhängige methodische Prüfung.

Der erste End-to-End-Slice nutzt synthetische Fixtures und einen deterministischen Analyseworkflow. Er beweist nicht die politische Hypothese, sondern die methodische Integrität der Maschine.

## Wichtigste Release-Gates

Ein Release scheitert, wenn:

- ein kausaler Claim ohne Estimand oder Identification Audit entstehen kann;
- ein rein korrelatives Design kausale Sprache freischaltet;
- ein Begriff oder eine Parteiklassifikation unversioniert bleibt;
- ein Pre-analysis Plan nach Ergebnisinspektion still geändert werden kann;
- explorative Analysen als konfirmatorisch erscheinen;
- ein Design trotz erfüllter Kill Condition weiter als kausal geführt wird;
- dieselbe Code-, Modell- und Datenlinie als unabhängige Replikation zählt;
- Scope und Generalisierungsgrenzen im finalen Claim fehlen;
- Nullresultate, Gegenbefunde oder nicht verfügbare Daten verschwinden.

## Empfehlung für Claude Code

Claude Code soll nicht „den gesamten Research Method Kernel“ in einem Lauf bauen. Es arbeitet die Task-Pakete in dieser Reihenfolge ab:

1. `M0-T01` — Method-Verträge, Runtime-Modelle und Schema-Validierung
2. `M0-T02` — versionierte Method Profiles und Policy-Interface
3. `M1-T01` — deterministischer Question Compiler
4. `M1-T02` — Concept & Measurement Charter
5. `M2-T01` — Estimand Builder
6. `M2-T02` — Causal Models und konkurrierende Erklärungen
7. `M2-T03` — Research Designs, Identification Audits und Claim Ceilings
8. `M3-T01` — Evidence Matrix und Quellenverifikation
9. `M3-T02` — DataAssetProfile, Readiness und Crosswalks
10. `M4-T01` — Pre-analysis Lock und Amendments
11. `M4-T02` — typisierter Analysis Compiler und synthetischer Executor
12. `M5-T01` — Falsification Probes und Kill-Propagation
13. `M5-T02` — Replikationsunabhängigkeit und Diskrepanzen
14. `M5-T03` — GeneralizationMap und ResearchDecision Engine
15. `M6-T01` — vollständiger Housing-Populism-Referenzslice
16. `M7-T01` — MethodBench und harte Gates

Jedes Paket besitzt erlaubte Pfade, verbotene Abkürzungen, Invarianten und Akzeptanztests.
