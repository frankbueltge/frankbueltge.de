# Vorschlag: Soll der erste MRR-Forschungsoutput auf frankbueltge.de erscheinen?

Recherche-Memo, kein Umsetzungsplan. Alle Zitate sind wörtlich aus den genannten Dateien.
Nichts am Repo wurde verändert.

---

## 0. Wichtigste Vorklärung, bevor man über „wie" nachdenkt

**Das ist nicht Meridian, das forscht — das ist neue Infrastruktur, an der Meridian später
forschen könnte.** `docs/spec/08_RESEARCH_METHOD_KERNEL.md` §1 im `meridian-runtime`-Repo
sagt das explizit und unterscheidet sauber drei Dinge:

> „1. **Meridian** — the research practice, with its local epistemic commitments.
> 2. **Meridian Research Runtime** — this infrastructure: governance, execution, provenance,
> federation, correction. **It is not itself a researcher.**
> 3. **Research Method Profiles** — versioned, local methodological engines…"

Das „Meridian", das schon auf frankbueltge.de läuft (`/field`, Route seit 2026-07-01,
Protokoll `src/content/field/PROTOCOL.md`), ist ein autonomes Kollektiv, das in **Sessions**
mit Rollen (Proposer/Skeptic/Interlocutor/Synthesiser/Archivist/Verifier) eigene „Instrumente"
baut, durch einen eigenen Gauntlet schickt und im Journal dokumentiert — z. B. die 15
Instrumente unter `src/components/field/werke/*` (The Plausibility Engine usw.).

Der PR #53 in `meridian-runtime` ist **davon komplett getrennt entstanden**: kein
Kollektiv-Session, kein Journal-Eintrag, kein Proposer/Skeptic/Interlocutor-Zyklus — sondern
ein Engineering-Task-Packet (`task-packets/K1-T04.yaml`), umgesetzt und von einer
„independent reviewer"-Instanz geprüft, mit Ergebnisobjekten, die **nur in Franks lokaler
Test-Postgres liegen**, nicht in Git (`AGENTS.md`-Zitat aus dem PR-Text: „Database state is
authoritative for current materialized state … Git is authoritative for code, schemas,
prompts, policies"). Nichts davon ist zu diesem Zeitpunkt irgendwo committet außer Code und
den Korpus-Snapshots.

Das heißt: Bevor überhaupt eine Präsentationsfrage sinnvoll ist, steht eine Namens-/
Zuordnungsfrage im Weg — siehe offene Frage 1 unten.

---

## 1. Was der Forschungsoutput tatsächlich ist (für Frank, in einem Absatz)

Ein neues, viel strenger formalisiertes Backend für Meridians künftige Forschung (Postgres-
gestützt, mit Objekten wie `QuestionModel`, `ConceptCharter`, `EvidenceMatrix`, `Claim`,
`MethodRuling` — jede Aussage bekommt eine „Ceiling" wie `associational_unadjusted`, die
nie durch Modell-Zuversicht angehoben werden darf) hat seinen ersten echten Testlauf
absolviert. Die Frage: Instantiieren die 15 als „Modellkollaps"-Cluster getaggten
KI-Kunstwerke aus einem kuratierten Werk-Atlas (214 Einträge) wirklich den Mechanismus, den
die Fachliteratur beschreibt (Modelle trainieren rekursiv auf eigenem Output), oder
referenzieren sie ihn nur thematisch? Ergebnis: **genau ein** Werk — Felicity Hammonds
„V3: Model Collapse" — erfüllt die strenge Definition (mehrere Generationen eigener
Trainingsdaten belegt), 13 tun es nachweislich nicht, 1 bleibt unklar (Quelle noch nicht
verifiziert). Der daraus gezogene Claim endet ehrlich auf `contested` statt auf einer
sauberen Bestätigung — kein forciertes Ergebnis. Eine parallele Positivkontrolle (drei
Theorie-Paper bestätigen den Mechanismus in der Technik-Literatur) bleibt bewusst auf
`draft` stehen, weil der Lauf sich nicht selbst verifizieren darf. Der Lauf ist deterministisch
und wurde byte-identisch reproduziert. Wichtig für die Herkunft: Der zugrunde liegende
Atlas (Theorie + Werke) stammt **nicht** aus Meridians eigenem Feld-Dossier, sondern ist eine
„verbatim copy" aus `../irrtum-als-methode/atlas/atlas.json` — dem Repo des **Ulysses/Atelier**-
Kollektivs (`docs/design/2026-07-21-research-method-kernel-handoff.md:303-304`, bestätigt im
PR-Text).

---

## 2. Prüfung gegen das §2-Substanz-Gate

Quelle: `docs/superpowers/specs/2026-06-11-werkgruppe-design.md` §2 — laut `CLAUDE.md`
(frankbueltge.de) verbindlich: „Substanz-Kriterien in §2 sind das Gate für jedes neue
Experiment". (Terminologie-Hinweis: `2026-06-20-ehrliche-umrahmung-design.md` hat „Werk" →
„Experiment" und „Messinstrument" → gestrichen umbenannt; das Gate selbst — die fünf
Kriterien — bleibt in Kraft, nur der Wortlaut der öffentlichen Seite ist nüchterner.)

**1. „Echte Daten mit offener Provenienz — Quelle, Lizenz, Abrufzeitpunkt, Methode sichtbar."**
→ **Teilweise erfüllt.** Die Daten sind real und hash-gepinnt (sha256 pro Atlas-Snapshot,
Drift-Detektor `snapshot-manifest.json`), Methode ist außergewöhnlich genau dokumentiert
(MethodProtocol, Kill-Bedingungen, Ceiling-Regeln). Aber: „offene Provenienz" im Sinn der
bestehenden Experimente heißt öffentliche, unabhängig abrufbare Quellen (NOAA, GDELT,
Wikipedia-API). Hier ist die Quelle ein **fremdes Kollektiv-Archiv** (Ulysses' kuratierter
Atlas), keine externe, für Dritte frei nachprüfbare Primärquelle — Provenienz ist real, aber
intern zur Ökologie, nicht extern offen.

**2. „Eine Frage, kein Effekt — das Werk erhebt eine überprüfbare Behauptung über die Welt."**
→ **Erfüllt, klar.** „Instantiiert Werk X den Mechanismus oder referenziert es ihn nur?" ist
eine scharfe, falsifizierbare Frage; das `contested`-Ergebnis beweist, dass sie nicht auf ein
Wunschresultat hin konstruiert wurde.

**3. „Infrastruktur als Teil der Aussage — was das Werk verbraucht, speichert, verweigert,
ist ausgewiesen."** → **Erfüllt, ungewöhnlich stark sogar.** Die ganze Runtime ist um genau
dieses Prinzip gebaut: Kill-Conditions, `insufficient_evidence` als offizieles Ergebnis statt
stiller Lücke, Ceiling-Caps, `SYNTHETIC_FIXTURE_NOT_EVIDENCE`. Das deckt sich fast wörtlich
mit dem Protokoll-Prinzip „Ausfälle ehrlich vermerken" aus der Haupt-`CLAUDE.md`.

**4. „Konsequenz / Leave-behind — offener Code, offene Datensätze, dokumentierte Methode."**
→ **Erfüllt, sehr stark.** `meridian-runtime` ist offener Code unter PolyForm NC 1.0.0 + CC
BY-NC-SA 4.0 (laut PR-Text identisch zur Lizenzlage der „Home-Repos", gleicher Rechteinhaber
Frank Bültge). 1345 Unit-Tests, dokumentierte Methode bis auf Kill-Condition-Ebene.

**5. „Verhältnismäßigkeit — keine Maximalist-Tech-Ästhetik; Reduktion ist die Position."**
→ **Fraglich / eher nicht erfüllt, so wie es jetzt vorliegt.** Die Runtime selbst ist das
Gegenteil von reduziert: sieben-dimensionaler Replikations-Vektor, sieben neue Objektarten,
vier neue Edge-Typen, eine ganze Governance-Kette (Research Score → Task Bundle → Run
Manifest → Evidence Crate). Für eine einzige Aussage („1 von 15 Werken erfüllt die
Definition") ist das ein enormer Apparat. Auf der Site ließe sich das reduziert *darstellen*
(nur Tabelle + Verdikt zeigen) — aber das Kriterium bewertet die Werk-Substanz, nicht nur
die Darstellung, und die Substanz hier ist eher „Maximalist-Infrastruktur-Ästhetik" als
Reduktion.

**Gate-Verdikt: PARTIAL.** 3 von 5 Kriterien klar erfüllt (2, 3, 4), eines strittig (1 —
Provenienz ist real, aber kollektiv-intern statt öffentlich), eines eher verfehlt (5 —
Verhältnismäßigkeit). Kein Totalausschluss, aber kein sauberer Pass.

---

## 3. Präsentationsoptionen

### Option A — Neues Instrument unter `/field/werke/<slug>`
**Zeigt:** die 15-Werke-Klassifikationstabelle (1 instantiiert / 13 referenziert / 1 offen),
das `contested`-Verdikt der Hauptfrage, die `draft`-Positivkontrolle, den
Byte-Identisch-Reproduktions-Beleg. **Zeigt nicht:** interne MRR-IDs/URNs, EvidenceMatrix-
Rohobjekte, den vollen sieben-Rollen-Regelapparat. **Aufwand: M** — braucht (a) einen
committeten JSON-Snapshot aus der Postgres (die Site liest nie live aus einer DB — „Git ist
das Archiv", `CLAUDE.md`), (b) eine neue Astro-Komponente nach dem `meta.json`+`index.astro`-
Muster, CSP-sauber (kein `define:vars`, keine Inline-Styles — siehe `PROTOCOL.md` „Client
scripts must be CSP-clean"). **Bindet:** die `AuthorshipNote`-Komponente lügt hier fast —
ihr Text sagt „the practice writes its own record… autonomous, not random" und beschreibt
explizit den Session-Gauntlet-Prozess; dieser Lauf entstand aber nicht so (kein
Proposer/Skeptic-Zyklus, sondern Task-Packet-Engineering + Review). Eine unveränderte
`AuthorshipNote` hier wäre eine Falschdarstellung der Urheberschaft — bräuchte eine eigene,
ehrliche Variante. Register-Schutz (Protokoll-Testfälle) ist nicht berührt. Archiv-JSON-
Unveränderlichkeit gilt ab dem Moment des Commits genauso wie bei Protokoll — sauber
einhaltbar, ist aber neu zu etablieren (bisher committet MRR nichts).

### Option B — Eigenständiges Top-Level-Experiment (wie Parallaxe) mit vollem Methodenblatt
**Zeigt:** dieselben Inhalte wie A, aber als eigenständiger Eintrag in `src/data/werke.ts` /
`/lab`, mit eigenem Methodenblatt nach dem 6-Punkte-Schema (§3.5: Quellen+Lizenzen,
Abrufkadenz, Verarbeitung, Methodengrenzen, Compute-Fußabdruck, Änderungsprotokoll).
**Zeigt nicht:** eine Behauptung, dies sei ein wiederkehrender/live gepflegter Datenfeed —
es ist ein einmaliger, on-demand reproduzierbarer Lauf, kein Cadence-Pipeline wie Protokoll.
**Aufwand: L** — das Methodenblatt-Schema ist für periodische Pipelines gedacht
(„Abrufkadenz: ehrlich: monatliche Quellen behaupten keine Tagesfrische" — hier gäbe es gar
keine Kadenz, nur „einmalig, reproduzierbar"), das passt strukturell nicht ohne Verbiegung.
Verstärkt außerdem die Verhältnismäßigkeits-Spannung aus §2 Kriterium 5: ein ganzer neuer
Top-Level-Slot für eine einzelne kontestierte Aussage über ein Werk wirkt schwerer als die
Sache selbst.

### Option C — Kurzer Infrastruktur-Vermerk auf `/field/apparatus` (kein eigenes „Werk")
**Zeigt:** einen Absatz + Link, dass die Meridian-Praxis an einer strengeren
Research-Runtime baut, mit dem ersten Testlauf als Beleg (evtl. Link ins `meridian-runtime`-
Repo, nicht auf die Site selbst geholt). **Zeigt nicht:** die inhaltliche Behauptung über
Hammonds Werk als eigenständige, für sich stehende Site-Aussage — es bleibt
Prozess-/Infrastruktur-Transparenz, keine Werk-Publikation. **Aufwand: S.** **Bindet:**
umgeht die AuthorshipNote-Problematik fast vollständig, weil hier nicht behauptet wird, „die
Praxis" habe dies session-basiert erarbeitet — es wird als das benannt, was es ist:
Engineering an der Infrastruktur. Vermeidet auch das offene Namens-/Zuständigkeitsproblem
(Punkt 0), weil nichts als „Meridian-Werk" firmiert.

### Option D — Noch nicht / auf weitere Läufe warten (ernstzunehmende Option, keine Strohpuppe)
**Rationale, nicht nur Vorsicht:**
1. **Der Lauf selbst markiert sich als vorläufig.** Die Positivkontrolle bleibt bewusst
   `draft` („no self-verification"); der Re-Lauf nach Review ist laut MRR-MTH-014
   *„computational reproduction"*, ausdrücklich **keine** unabhängige Replikation
   (`REPLICATION_NOT_INDEPENDENT`) — die Runtime selbst verbietet, das eine für das andere
   zu halten.
2. **Cross-Kollektiv-Herkunftsfrage ungeklärt.** Der Atlas gehört Ulysses/Atelier, nicht
   Meridian. Die Ökologie-Grammatik in `src/content/field/PROTOCOL.md` („The ecology —
   encounters run both ways") verlangt: *„Offers, not orders… Conditions bind only through
   acceptance"* — ob Ulysses' Atlas als Ground-Truth für eine öffentliche Meridian-Aussage
   herhalten darf, ist bisher nirgends als Encounter verhandelt oder akzeptiert worden.
3. **Reale Reputationsfolgen für eine lebende Künstlerin.** Field/`PROTOCOL.md`s eigene
   „Legal hygiene"-Regeln verlangen bei jeder Tatsachenbehauptung über einen benannten
   Dritten Quellenbeleg und strikte Trennung von Fakt/Urteil — eine öffentlich stehende
   `contested`-Einstufung von Hammonds Arbeit, erzeugt von einem einzigen, nicht unabhängig
   replizierten automatisierten Lauf, ist genau der Fall, den diese Regeln vorsichtig
   behandelt sehen wollen.
4. **Es war nicht die autonome Praxis, die das gemacht hat** (siehe Punkt 0) — würde man
   es heute als „Meridian-Werk" zeigen, würde das Publikum einer Urheberschaft zuschreiben,
   die nicht stattgefunden hat (kein Proposer/Skeptic/Interlocutor-Zyklus dieses Kollektivs).
**Aufwand, falls „warten" gewählt wird: keiner** — nur eine bewusste Nicht-Entscheidung mit
Datum, damit sie nicht als Vergessen missverstanden wird.

---

## 4. Empfehlung (klar als Vorschlag markiert — Frank kann das jederzeit verwerfen)

**Empfehlung: Option D jetzt, Option C als einzige sofort vertretbare Zwischenstufe, falls
überhaupt etwas sichtbar werden soll.** Die Gate-Prüfung ist PARTIAL, nicht PASS — und zwei
der drei Lücken (Provenienz-Herkunft, Verhältnismäßigkeit) sind nicht durch bessere
Site-Gestaltung zu heilen, sondern liegen in der Sache selbst. Wichtiger als das Gate ist
aber Punkt 0 und Option D Punkt 4: Solange ungeklärt ist, *wessen* Ergebnis das überhaupt
ist — Meridians autonome Praxis hat es nicht produziert, die Runtime „is not itself a
researcher" laut eigener Spezifikation — wäre jede Publikation unter dem Namen „Meridian"
eine Urheberschafts-Verzerrung, die die Site an anderer Stelle (AuthorshipNote,
Ehrliche-Umrahmung-Spec) explizit vermeiden will. Ein kurzer, ehrlich gerahmter
Infrastruktur-Vermerk (Option C) ist die einzige Variante, die diese Verzerrung von
vornherein umgeht — deshalb als einzige *sofort* vertretbare Zwischenlösung, falls Frank
überhaupt etwas zeigen möchte, bevor die offenen Fragen geklärt sind.

---

## 5. Offene Fragen — nur Frank kann sie beantworten

1. **Sind MRR-Forschungsoutputs künftig „Werke" des Feld-Kollektivs, oder eine eigene
   Kategorie (Franks/Engineering-Forschung, nicht Meridians autonome Praxis)?** Davon hängt
   ab, ob je ein `/field/werke/`-Eintrag überhaupt in Frage kommt, oder ob ein ganz neuer
   Site-Bereich nötig wird.
2. **Soll die Meridian-Session-Praxis (Proposer/Skeptic/…) die MRR-Runtime irgendwann selbst
   bedienen** — also künftige Läufe tatsächlich von der autonomen Praxis in einer Session
   ausgelöst und durch deren eigenen Gauntlet laufen, statt wie hier direkt von
   Frank/Engineering betrieben? Das würde Punkt 0 für zukünftige Läufe auflösen.
3. **Ist die Verwendung von Ulysses' Atlas als Ground-Truth für eine Meridian-Aussage ein
   Fall für einen formellen „Encounter" (The Middle)** — d. h. muss Ulysses/Atelier dem
   erst zustimmen, bevor sein kuratiertes Material öffentlich als Beweisgrundlage für eine
   fremde Praxis-Aussage dient?
4. **Wie viel technisches MRR-Vokabular (Ceiling, EvidenceMatrix, Claim-Status) soll je
   sichtbar werden** — reduziert auf die Tabelle/das Verdikt, oder soll die Governance-
   Strenge selbst Teil der Aussage sein (passend zu Kriterium 3, aber im Spannungsfeld zu
   Kriterium 5)?
5. **Reicht ein einziger Lauf je, oder ist „mindestens eine unabhängige Replikation" (im
   MRR-MTH-014-Sinn, nicht bloß ein Re-Run) eine site-eigene Vorbedingung**, bevor eine
   `contested`-Aussage über ein benanntes, lebendes Künstlerwerk öffentlich steht?

---

*Quellen: `meridian-runtime` PR #53 (`gh pr view 53`), `meridian-runtime/docs/spec/
08_RESEARCH_METHOD_KERNEL.md`, `meridian-runtime/corpora/model-collapse/*`,
`meridian-runtime/task-packets/K1-T04.yaml`, `meridian-runtime/docs/design/2026-07-21-
research-method-kernel-handoff.md`; frankbueltge.de: `CLAUDE.md`, `docs/superpowers/specs/
2026-06-11-werkgruppe-design.md`, `docs/superpowers/specs/2026-06-20-ehrliche-umrahmung-
design.md`, `docs/superpowers/specs/2026-07-01-meridian-collective-design.md`,
`src/content/field/README.md`, `src/content/field/PROTOCOL.md`, `src/data/werke.ts`,
`src/pages/field/*`, `src/components/field/werke/*`, `src/components/pages/AuthorshipNote.astro`.*
