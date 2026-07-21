# Claude-Code-Handoff — Meridian Research Runtime v0.2.0
## Research Method Kernel als Erweiterung des Governance- und Evidenzsystems

Du arbeitest an der bestehenden Federated Research Ecology und kennst den aktuellen Repository- und Implementierungsstand möglicherweise genauer als dieses Spezifikationspaket. Behandle die Spezifikation deshalb als verbindlichen Ziel- und Sicherheitsrahmen, aber nicht als Behauptung über bereits vorhandenen Code. Prüfe zuerst den tatsächlichen Stand und dokumentiere Abweichungen, bevor du Architektur oder Dateien veränderst.

## Auftrag

Erweitere den Meridian Research Runtime v0.1.1 um den in v0.2.0 spezifizierten **Research Method Kernel**.

Version 0.1.1 bleibt die Governance-, Ausführungs-, Evidenz-, Föderations- und Korrekturschicht. Version 0.2.0 fügt die bislang fehlende methodische Schicht hinzu, durch die aus einer offenen Forschungsfrage ein explizites, überprüfbares und ausführbares Forschungsprogramm entstehen kann.

Die Erweiterung umfasst insbesondere:

- Question Compilation;
- Concept and Measurement Charters;
- Estimands;
- lokale und konkurrierende Causal Models;
- Evidence- und Data-Scouting-Verträge;
- Research Designs;
- Identification Audits;
- maschinell erzwungene Claim Ceilings;
- gesperrte PreAnalysisPlans und explizite Amendments;
- typisierte Analysis Workflows;
- Falsification Plans und Kill Conditions;
- Replication Plans mit gemessener Unabhängigkeit;
- Generalization Maps und explizite Non-Claims;
- adaptive Research Decisions einschließlich `stop_insufficient_evidence`.

## Was nicht geändert wird

Diese Erweiterung ist **kein Ersatz** für:

- Meridian Classic;
- den Parallel-, Shadow- und Challenger-Betrieb;
- lokale Souveränität der Practices;
- Research Scores und Autonomiegrenzen;
- signierte Task Bundles;
- lokale Sandbox-Ausführung;
- Evidence Crates und atomare Claims;
- unabhängige Verifikation;
- Transfer-, Obligation- und Correction-Protokolle;
- menschliche Verantwortung für Veröffentlichung, sensible Daten und Außenhandlungen.

Meridian Classic darf weiterlaufen und weiterentwickelt werden. Der versiegelte Baseline-Stand ist ein Vergleichspunkt, kein Stilllegungsauftrag.

## Zentrale Interpretation

Ein sicher orchestrierter Agentenworkflow ist noch keine Forschungsmethode. Eine Forschungsmethode erzeugt noch keinen gültigen Claim. Ein erfolgreich ausgeführtes Modell ist noch keine kausale Identifikation.

Daher gilt:

```text
offene Frage
  != ausführbare Analyse

Regression oder Modelloutput
  != Estimand

Designbezeichnung
  != Identifikation

statistische Signifikanz
  != kausale Gültigkeit

Robustheitscheck
  != Falsifikation

identischer Rerun
  != unabhängige Replikation

synthetischer Benchmark
  != empirisches Forschungsergebnis
```

Jeder Übergang muss durch explizite Objekte, Regeln, Prüfungen und Ereignisse repräsentiert sein.

## Verbindliche Quellen

Lies in dieser Reihenfolge:

1. `AGENTS.md`
2. `START_HERE_CODEX_OR_CLAUDE.md`
3. `UMSETZUNGSUPDATE_DE.md`
4. `docs/08_RESEARCH_METHOD_KERNEL.md`
5. `docs/09_QUESTION_AND_CONCEPT_COMPILATION.md`
6. `docs/10_CAUSAL_INFERENCE_AND_DESIGN.md`
7. `docs/11_EVIDENCE_AND_DATA_SCOUTING.md`
8. `docs/12_PREANALYSIS_EXECUTION_AND_ADAPTATION.md`
9. `docs/13_FALSIFICATION_REPLICATION_GENERALIZATION.md`
10. `docs/14_METHOD_PROFILES.md`
11. `docs/15_QUALITATIVE_AND_MIXED_METHODS.md`
12. `docs/16_HOUSING_AFFORDABILITY_REFERENCE_PROJECT.md`
13. `docs/17_METHOD_API_AND_EVENTS.md`
14. `docs/18_METHOD_BENCHMARKS_AND_ACCEPTANCE.md`
15. `docs/19_METHOD_IMPLEMENTATION_PLAN.md`
16. `docs/adr/ADR-0003-RESEARCH-METHOD-KERNEL.md`
17. `docs/adr/ADR-0004-CAUSAL-CLAIM-GATES.md`
18. die zugewiesene Datei unter `task-packets/`

Die modularen Dateien, JSON Schemas, Gherkin-Akzeptanzfälle und Task-Pakete sind gegenüber dieser Übergabe spezifischer und haben bei einem Widerspruch Vorrang. Ein echter Widerspruch zum bereits implementierten und akzeptierten System darf nicht still aufgelöst werden. Dokumentiere ihn und schlage ADR, Migrationspfad oder Spezifikationsänderung vor.

## Erste Aktion: Audit statt sofortiger Umbau

Beginne nicht direkt mit Implementierung. Erstelle zunächst einen **v0.2 Integration Audit** mit:

1. aktueller Repository-Topologie;
2. bereits implementierten v0.1.1-Domainobjekten und Services;
3. vorhandenen IDs, Revisionen, Hashes, Signaturen und Event Envelopes;
4. Claim-, Evidence-, Correction- und Dependency-Modell;
5. Workflow-, Sandbox- und Policy-Integration;
6. vorhandenen Datenbankmigrationen;
7. Test-, CI- und Deploymentstruktur;
8. Überschneidungen mit den neuen Method-Objekten;
9. Konflikten oder doppelten Konzepten;
10. technischen Schulden, die M0 blockieren könnten.

Erzeuge danach eine Mapping-Tabelle:

```text
v0.2 contract
existing implementation
reuse / extend / migrate / new
blocking conflict
recommended action
```

Keine breitflächige Umbenennung und kein Greenfield-Rewrite ohne belegten Grund.

## Implementierungsmodus

Arbeite ausschließlich ein freigegebenes YAML-Task-Paket nach dem anderen ab. Die vorgesehene Reihenfolge ist:

```text
M0-T01  Method contracts and runtime models
M0-T02  Method profile registry and policy interface
M1-T01  deterministic Question Compiler
M1-T02  ConceptMeasurementCharter lifecycle
M2-T01  Estimand Builder
M2-T02  CausalModel graph and competing explanations
M2-T03  ResearchDesign, IdentificationAudit and claim ceilings
M3-T01  EvidenceMatrix and source verification lifecycle
M3-T02  DataAssetProfile readiness and synthetic isolation
M4-T01  PreAnalysisPlan locking and amendments
M4-T02  typed Analysis Compiler and synthetic executor
M5-T01  falsification probes and kill propagation
M5-T02  replication independence and discrepancy handling
M5-T03  GeneralizationMap and ResearchDecision engine
M6-T01  complete synthetic housing reference slice
M7-T01  MethodBench and release hardening
```

M8 mit modellgestützter Forschungsplanung beginnt erst, wenn M0 bis M7 deterministisch funktionieren und die harten Gates bestehen.

## Architekturgrenzen

Implementiere Domain- und Methodlogik zunächst framework-unabhängig. Nutze vorhandene Frameworks und Infrastrukturadapter nur an klaren Grenzen.

Empfohlene Modulstruktur, sofern mit dem aktuellen Repository kompatibel:

```text
packages/
  domain/
  method-kernel/
    question/
    measurement/
    estimand/
    causal_model/
    evidence_scout/
    data_scout/
    design/
    identification/
    preanalysis/
    falsification/
    replication/
    generalization/
    decisions/
  method-profiles/
    causal_observational/
  policy/
  workflow-compiler/
  benchmark/
```

Verwende keine Graphdatenbank für die erste Version. Method-Abhängigkeiten, Knoten und Kanten können relational und zusätzlich als versiegelte JSON-Artefakte gespeichert werden.

## Autoritative Übergänge

LLMs oder andere generative Modelle dürfen ab M8 Vorschläge erzeugen, aber niemals direkt:

- ein `QuestionModel` akzeptieren;
- eine Begriffsdefinition autoritativ ersetzen;
- ein `IdentificationAudit` bestehen lassen;
- einen PreAnalysisPlan sperren oder ändern;
- eine Kill Condition überschreiben;
- eine Replikation als unabhängig klassifizieren;
- einen Claim über sein Method Ceiling heben;
- eine Generalisierung erweitern;
- eine empirische Veröffentlichung auslösen.

Alle autoritativen Übergänge laufen über Schema, Domain-Invarianten, Policy und attribuierte Review- oder Freigabeereignisse.

## Referenzslice

Nutze `examples/housing-populism/` ausschließlich als synthetischen Implementierungs- und Benchmarkfall.

Die Ausgangsfrage lautet:

> In welchem Maß erhöht steigende Wohnkosten-Unbezahlbarkeit ursächlich die Unterstützung für rechtspopulistische / Anti-Establishment-Parteien in europäischen Städten, 2015–2025?

Der Slice muss zeigen, dass die Maschine:

- die Frage nicht direkt ausführt;
- unbestimmte Begriffe sichtbar macht;
- individuelle und aggregierte Effekte trennt;
- ein explizites Estimand erzeugt;
- konkurrierende kausale Modelle erhält;
- ein Design auditieren und herabstufen kann;
- einen Plan vor Outcome-Analyse sperrt;
- Falsifikationsfehler als epistemisches Ereignis behandelt;
- Replikationsunabhängigkeit prüft;
- synthetische Daten niemals als empirische Evidenz verwendet;
- mit `stop_insufficient_evidence` erfolgreich enden kann.

Der Slice darf nicht durch fest codierte erwartete Endwerte bestehen. Er muss Regeln und Zustandsübergänge testen.

## Harte Abbruchbedingungen

Stoppe die jeweilige Aufgabe und berichte, wenn:

- ein neues Objekt nicht mit den vorhandenen Identitäts- und Revisionsverträgen vereinbar ist;
- Claim Ceilings nur durch Schwächung des bestehenden Claim-Modells implementierbar wären;
- ein Model Adapter direkte Zustandsautorität benötigen würde;
- ein gesperrter Plan nur mutierbar statt versionierbar wäre;
- eine Kill Condition nur als Berichtstext, nicht als State Transition abbildbar wäre;
- synthetische Fixtures nicht technisch von empirischer Evidenz getrennt werden können;
- ein Task Änderungen außerhalb seiner erlaubten Pfade benötigt;
- der Referenzslice nur durch Hardcoding oder Umgehung einer Gate-Logik besteht.

## Erwartetes Ergebnis je Task

Liefere nach jeder Aufgabe:

1. Task-ID und implementierte Requirement-IDs;
2. kurze Zusammenfassung;
3. geänderte Dateien;
4. neue oder geänderte Migrationen;
5. neue Tests;
6. exakte ausgeführte Befehle und Ergebnisse;
7. Auswirkungen auf Sicherheit, Datenschutz und epistemische Gültigkeit;
8. offene Risiken und nicht implementierte Nachbarfunktionen;
9. gefundene Spezifikationskonflikte;
10. Empfehlung, ob das nächste Task-Paket begonnen werden kann.

## Startentscheidung

Nach dem Audit beginne nur dann mit `M0-T01`, wenn keine blockierende Unvereinbarkeit besteht. Andernfalls liefere zuerst einen minimalen ADR- oder Spezifikationspatch. Implementiere nicht mehrere M-Epics in einem unreviewbaren Patch.
