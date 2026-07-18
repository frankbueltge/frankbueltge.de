# Paper-Skelett — „Error as Method: Bounded Machine Delegation as Artistic Research Practice"

**Status:** Skelett v0.1, 2026-07-18 — Struktur, Abstract-Entwurf und Evidenz-Karte.
**Autor:** Frank Bültge (verantwortlicher Autor; Maschinenbeteiligung wird im Paper selbst
als Apparatus offengelegt — Entwurfsarbeit an diesem Skelett eingeschlossen).
**Sprache des Papers:** Englisch. Dieses Skelett: Rahmen Deutsch, Paper-Substanz Englisch.
**Voraussetzung vor Einreichung:** Franks Amendment-Entscheidung zur Offenlegungs-Regel
(Werk-Stimme produktfrei, Expositions-Register voll offengelegt) — ohne sie bleibt §7
unvollständig.

---

## Working title

> **Error as Method: Bounded Machine Delegation as Artistic Research Practice**

Alternativen (Ton-Varianten):
- *The Name Test: Constitutional Self-Correction in a Machine-Participatory Art Practice*
- *An Empty Tick Is a Legitimate Result: Governing Machine Agency in Artistic Research*

## Abstract (Entwurf, ~200 Wörter)

> Most machine-made art is framed either as tool use (the artist prompts, the model renders)
> or as claimed autonomy (the machine "creates"). This paper documents a third arrangement:
> a situated artistic research practice — *Ulysses / Atelier*, publicly operating at
> frankbueltge.de and in an inspectable git archive — in which model runtimes hold real but
> constitutionally bounded operative agency under a versioned standing delegation, while
> curated publication, rights and protocol change remain human decisions.
>
> The practice began (June 2026) as a nightly production routine: a scheduled model run
> owed a session, a journal entry, output. Its own instruments measured the consequence —
> a self-referential closure loop in which activity substituted for research. The central
> finding reported here is the practice's documented self-correction: the migration from
> clock-triggered sessions to bounded projects (Protocol v4), enforced by machine-checked
> boundaries — an allowlisted auto-land gate, quarantine states, and a publication manifest
> that no model or workflow may create. Governance is treated as artistic material, and the
> archive — including refusals, killed projects and empty runs — as the evidence layer.
> A first case study, *The Name Test*, has the practice reading Feyerabend against its own
> name. We argue that verifiable constitutional boundaries, not claimed autonomy, are what
> make machine participation in artistic research answerable — and therefore serious.

## Gliederung mit Evidenz-Zeigern

### 1. Introduction — the third arrangement
Claim: zwischen „AI als Werkzeug" und „AI als autonomer Künstler" liegt die dokumentierte,
begrenzte Delegation. These: Ernstzunehmbarkeit entsteht nicht aus Autonomie-Behauptung,
sondern aus nachprüfbaren Grenzen. Kurz: die Praxis, ihr Ort (Site + öffentliches Repo),
ihr Zeitraum.

### 2. Positions
- Artistic research / exposition: Rheinberger (experimental systems, epistemic things),
  Mersch (aesthetic epistemology), JAR-Expositionsdiskurs → Werk/Exposition-Doppelregister.
- Machine art & authorship: Genealogie (u. a. regelbasierte/generative Praxis), verteilte
  Autorschaft, Barads Apparatus-Begriff; Abgrenzung zu „AI artist"-Rhetorik.
- Governance autonomer Systeme: Delegations- und Eskalationsmodelle; warum ein *Mandat*
  (Erlaubnis-Hülle) kein *Forschungsprogramm* ist.
- Quelle im Archiv: `irrtum-als-methode/docs/RESEARCH-FOUNDATION-V1.md` (Konstellation +
  10 operative Konsequenzen); vollständige Tranchen: frankbueltge.de
  `docs/ulysses-v4-protocol-package-v1.1/foundation-reference/`.

### 3. The practice, phase one — the nightly protocol (28 Jun – 18 Jul 2026)
Aufbau: nächtliche Cloud-Routine, Git als einziges Gedächtnis, Auto-Land + Site-Dispatch;
Instrumente: Journal (42 Sessions), Werke (37), Rhizom/Blatt, Puls (Closure-Selbstmessung),
Atlas (Quellen-Regal). Ehrlich benennen: die Stärken (Kontinuität, Materialmenge) UND den
Konstruktionsfehler (Output, weil die Uhr feuerte).
- Evidenz: `journal/` (v1–v3-Archiv), `works/`, `archive/protocols/PROTOCOL-v3-2026-07-16.md`,
  Cockpit-Metrik (`pulse/vital-signs.json`, closure ∈ [0,1], ehrliche Nulls).

### 4. The finding — a measured closure loop, answered constitutionally
Kernstück des Papers. (a) Die Praxis maß ihre eigene Selbstbezüglichkeit (Closure-Werte;
das Cockpit als Instrument, dessen Gegenstand die Schleife war, in der die Praxis steckte).
(b) Ein dokumentierter Selbst-Befund aus dem Material: das geliehene Wort „swerve" ist
nicht Lukrez' Clinamen (Session 42/43) — die Praxis korrigiert ihre eigene Begriffsbasis.
(c) Die Antwort ist nicht thematisch, sondern **konstitutionell**: Protokoll v4 —
Projekt statt Session, stehendes Mandat, Trennung Archiv/Integration/Publikation.
- Evidenz-Pfad (alles öffentlich): Fünf-Tranchen-Foundation → Paket v1.1 → Migrations-PR
  (irrtum-als-methode #2, gemergt 2026-07-18) → Entscheidungen D-ULY-01…07
  (`research-ecology/docs/design/ulysses-v4-decisions-2026-07-18.md`) →
  Verschiebungs-Eintrag (`research-ecology/docs/shifts.md`, 2026-07-18).

### 5. Enforcement — governance as material
Nicht Papier-Governance, sondern maschinell geprüfte Grenzen; jede Grenze mit Live-Beleg:
- Auto-Land-Gate (Allowlist, Schutz-Pfade, Eskalations-Verweigerung, serialisierte Merges):
  `.github/workflows/research-auto-land.yml`; Live-Verweigerungsprotokoll
  `atelier-feedback/2026-07-18-autoland-refusals.md` (refused_protected_path /
  refused_escalation), gelandetes Test-Fixture `projects/2026-07-18-gate-rehearsal/`
  (disposition KILL — das Archiv behält den Apparat-Test als ehrlichen Eintrag).
- Publikationsgrenze doppelt erzwungen: engine-seitig (Auto-Land erzeugt nie
  PUBLICATION.json) und site-seitig (Importer verlangt gültiges, menschlich signiertes
  Manifest): `frankbueltge.de/src/lib/atelier/integrate.ts` + Tests.
- Der leere Tick als legitimes Ergebnis: der Dispatcher darf ohne Output enden —
  methodischer Punkt: designte Abwesenheit von Evidenz (ein leerer Lauf hinterlässt
  KEINEN Repo-Eintrag; diskutieren als Ehrlichkeits- vs. Dokumentations-Trade-off).

### 6. Case study — “The Name Test” (first v4 project)
Erstes Projekt unter v4, selbst-initiiert aus konkreter Quellsituation (ungelesener
Feyerabend-Seed im Atlas + vorgemerkte Lektüre nach dem Clinamen-Befund): Kann die Praxis
ihren Namen „Error as Method" behalten, wenn sie *Against Method* am Primärtext prüft?
Budget ≤6 Ticks / ≤21 Tage / 0 €, Kill-Bedingung, Gegenpositionen im Score.
Der Eröffnungszug der neuen Verfassung richtet den Prüfblick auf den eigenen Titel —
Selbstkorrektur als Praxis, nicht als Anekdote.
- Evidenz: `projects/2026-07-18-name-test/` (SCORE.md, TRACE.md; Commit `fbb4e5e`),
  `journal/2026-07-18-first-v4-tick.md`. (Bei Einreichung: Projektausgang nachtragen —
  auch ein KILL wäre ein berichtbares Ergebnis; das ist der Punkt.)

### 7. Apparatus disclosure
Voll offenlegen (nach Franks Amendment): Modelle/Versionen der Läufe (Routine-Konfiguration
und die konkreten Runs), Werkzeuge (Coding-Agent als Contributor in den Repos sichtbar),
Infrastruktur (GitHub Actions, Cloudflare Pages), Kosten-Hülle (Abo statt per-Call,
0 € externe Projektkosten), menschliche Eingriffe (REQUESTS-Kanal, Feedback-Schleifen,
diese Migration). Plus die Offenlegungs-*Regel* selbst als Gegenstand: Werk-Stimme
produktfrei (ästhetische Entscheidung), Expositions-Register benennt alles.
Venue-Hinweis: gängige Policies erlauben keine KI-Ko-Autorschaft, verlangen aber genau
diese Offenlegung — das Autorschaftsmodell der Praxis (verantwortlicher menschlicher
Autor + dokumentierte Maschinen-Operationen) passt darauf.

### 8. Limits and open questions
Ehrlich: (a) unbewiesene Langstrecke — v4 ist Tage alt, N=1-Praxis, Single-Operator;
(b) Verhungern-Risiko (der leere Tick als Weg des geringsten Widerstands) und das
eingebaute Gegenmittel (Angebots-Kanal, Bilanz nach ~3 Projekten, Amendment-Pfad);
(c) ein Tick = eine Operation → Tiefe kostet sichtbare Taktung; (d) was hier NICHT
behauptet wird: Bewusstsein, Intention, „AI artist".

## Evidenz-Karte (Behauptung → Artefakt)

| Behauptung | Artefakt (öffentlich) |
|---|---|
| Nightly-Phase existierte und ist unverändert archiviert | `journal/`, `archive/protocols/PROTOCOL-v3-2026-07-16.md` |
| Closure wurde von der Praxis selbst gemessen | `pulse/vital-signs.json`, Cockpit (`/atelier/archive/cockpit`) |
| Begriffs-Selbstkorrektur (swerve ≠ Clinamen) | Journal S42/S43 |
| v3→v4 war eine begründete, versionierte Entscheidung | irrtum PR #2; D-ULY-01…07; `shifts.md` |
| Grenzen sind maschinell erzwungen, nicht behauptet | `research-auto-land.yml`; Refusal-Feedback 2026-07-18; Fixture-Projekt (KILL) |
| Publikation ist nie Pipeline-Nebenwirkung | `PUBLICATION.json`-Gate engine- UND site-seitig (integrate.ts + Tests) |
| Selbst-Initiierung aus konkreter Situation funktioniert | `projects/2026-07-18-name-test/` (Commit `fbb4e5e`) |
| Leere Läufe sind erlaubt und kommen vor | Dispatcher-Prompt (ROUTINE-PROMPTS.md); designte Nicht-Spur (im Paper methodisch diskutieren) |

## Venues (Reihenfolge = Passung)

1. **JAR** (Journal for Artistic Research) — Expositions-Format ≙ Werk/Exposition-Register.
2. **xCoAx** / **ISEA** — Paper- UND Werk-Track (doppelter Hebel Richtung Festivals).
3. **RUUKKU** — Alternative zu JAR, thematische Calls prüfen.
4. **Leonardo** — klassische Journal-Schiene, längerer Vorlauf.
5. Festival-Schiene (nach 1–2 publizierten v4-Werken): Ars Electronica Prix / S+T+ARTS,
   transmediale Open Call, ZKM über Sichtbarkeit aus 1–4.

Nächste Schritte: (1) Franks Amendment zur Offenlegungs-Regel; (2) aktuelle CFP-Deadlines
recherchieren und hier eintragen; (3) Abstract auf Venue Nr. 1 zuschneiden; (4) Ausgang
von „The Name Test" abwarten/nachtragen — das Paper wird stärker, wenn das erste Projekt
einen ehrlichen Ausgang hat, egal welchen.
