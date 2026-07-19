# Concept Dossier — Exposition, Documentation and Critique

## 1. Fünf Dinge, die bisher zu leicht zusammenfallen

### Werk

Die künstlerische Konstellation, Operation, Performance, Form oder Situation selbst.

### Dokumentation

Spuren dessen, was geschah: Versionen, Aufzeichnungen, Fotos, Logs, Quellen, Entscheidungen, technische Zustände.

### Erklärung

Eine propositionale Interpretation dessen, worum es geht, was behauptet wird oder wie etwas zu verstehen sei.

### Exposition

Eine gestaltete öffentliche Anordnung, in der Werk, Spuren, Kontext, Apparate und mögliche Lesarten zugänglich und kritisierbar werden.

### Forschungspublikation

Die stabile, zitierbare und verantwortete Form, in der die Exposition und ihre begrenzten Forschungsansprüche erscheinen.

Diese Elemente können sich überschneiden. Sie sind dennoch nicht identisch.

## 2. Warum das Repository keine automatische Exposition ist

Ein öffentliches Repository kann:

- Provenienz erhalten,
- Versionen zugänglich machen,
- technische Reproduzierbarkeit fördern,
- Eingriffe sichtbar machen.

Es kann aber auch:

- Relevanz durch Masse ersetzen,
- Auswahl und Hierarchie verbergen,
- dem Publikum die gesamte Interpretationsarbeit aufladen,
- interne Prozessreste mit öffentlicher Forschung verwechseln,
- eine vermeintliche Neutralität der Vollständigkeit inszenieren.

Exposition verlangt eine begründete Auswahl und muss die Bedingungen dieser Auswahl offenlegen.

## 3. Gekoppelte Exposition in zwei Registern

### Register A — ästhetische Exposition

Die Arbeit organisiert Wahrnehmung, Handlung, Zeit, Material oder Raum. Ihre Erkenntnis wird nicht als Zusammenfassung geliefert, sondern in der Begegnung aktualisiert.

Anforderungen:

- Das Medium ist tragend.
- Die Form besitzt eine eigenständige Logik.
- Die Erfahrung ist nicht vollständig durch den Begleittext ersetzbar.
- Die Arbeit darf mehrdeutig sein, aber nicht beliebig.

### Register B — Forschungsexposition

Die Forschungsspur macht zugänglich:

- Ausgangssituation und Kontext,
- relevante Quellen und Gegenpositionen,
- beteiligte menschliche und maschinelle Akteure,
- Material- und Datenherkunft,
- zentrale Entscheidungen und Revisionen,
- technische Bedingungen,
- begrenzte Claims,
- Unsicherheiten, Ausschlüsse und Contestations.

Anforderungen:

- keine Behauptung vollständiger Neutralität,
- keine nachträgliche Heldenerzählung,
- keine Gleichsetzung von Prozessmenge und Forschungsqualität.

## 4. Das Verhältnis der Register

Nicht:

```text
Werk → erklärender Text, der die richtige Bedeutung liefert
```

Auch nicht:

```text
vollständiges Archiv → Publikum soll selbst eine Bedeutung finden
```

Sondern:

```text
ästhetische Operation  ⇄  situierte Forschungsspur
```

Der Pfeil ist beidseitig:

- Die Forschungsspur verändert, wie die Arbeit gelesen werden kann.
- Die Arbeit kann die Begriffe und Annahmen der Forschungsspur destabilisieren.

## 5. Kritik

### 5.1 Was kritisiert werden kann

- Quellen- und Tatsachenclaims,
- ethische und politische Entscheidungen,
- Angemessenheit des Materials,
- mediale Notwendigkeit,
- formale und ästhetische Wirksamkeit,
- Verhältnis von Werk und theoretischem Anspruch,
- Auslassungen und Ausschlüsse,
- Autorschafts- und Autonomiebehauptungen,
- technische und institutionelle Voraussetzungen.

### 5.2 Was nicht durch „Nichtpropositionalität“ immunisiert werden darf

- schwache Form,
- unklare Recherche,
- triviale Interaktivität,
- austauschbares Material,
- bekannte Theorie als Effekt,
- fehlende Positionierung,
- übertriebene Erkenntnisbehauptungen.

### 5.3 Mehrere Kritikregime

Eine Arbeit kann ästhetisch stark und wissenschaftlich falsch sein. Sie kann quellenmäßig sauber und künstlerisch belanglos sein. Sie kann technisch innovativ und ethisch problematisch sein.

Ulysses braucht deshalb keine Gesamtnote, sondern getrennte, benannte Kritiken.

## 6. Minimaler Expositionsvertrag

Eine öffentliche Ulysses-Arbeit sollte — sofern relevant — mindestens zugänglich machen:

```yaml
work:
  title:
  form:
  version:
  public_location:

research_trace:
  situation:
  source_constellation:
  material_provenance:
  apparatus:
  human_interventions:
  machine_contributions:
  decisions_and_revisions:
  claims:
  uncertainties:
  exclusions:
  contestations:

relation:
  how_the_trace_changes_the_work_reading:
  what_the_work_does_not_reduce_to_the_trace:
```

Dies ist kein verbindliches Formular für jede Arbeit. Es ist ein Prüfmodell für die spätere technische und kuratorische Gestaltung.
