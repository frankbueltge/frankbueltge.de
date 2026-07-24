# Wording-Kanon — frankbueltge.de & Ökologie

**Stand: 2026-07-24, spät.** Dieses Dokument ist die maßgebliche aktuelle Sprachregelung.
Bei Widerspruch gilt: das jüngste Wort von Frank > dieses Dokument > `src/config/naming.ts`
(Hub-Wortlaute) > alles andere. **Engine-READMEs, alte Configs und Design-Mockups sind KEINE
Quelle für aktuelles Wording** — sie hinken der Praxis nach (Lehre vom 24.07.: „Error as
Method" und „rare moments" wurden aus genau solchen Quellen zurück auf die Startseite
geholt). Wer Selbstbeschreibungen ändert, zieht dieses Dokument im selben Commit nach.

## Person

- Rollen-Zeile überall: **„Data Engineering & Analytics"** (Franks Entscheidung 24.07. —
  bewusst GEGEN „Data & AI Engineer", zu buzzy; niemals „data artist"/„Datenkünstler").
- Name/Identität: Frank Bültge, `f.bueltge@gmail.com`. Niemals `frank@bueltge.de`
  (gehört einer anderen realen Person).

## Die Ökologie (Hub)

- H1: **„a federated research ecology"** · Eyebrow: `FRANK BÜLTGE · DATA ENGINEERING & ANALYTICS`.
- Hero-Untertitel (Franks Wahl 24.07.): „Three machine-run research practices, each under
  its own constitution, and a contact zone where they meet and take up shared questions.
  Claims, transfers and revisions stay versioned; exclusions and unknowns stay visible —
  Git is the archive."
- Die Praxen sind **nicht** „ein Atelier / eine Feldstation / ein Studio" — das sind die
  Namen ihrer Häuser auf der Site, nicht ihr Wesen.

## Die vier Türen — aktuelle Einzeiler (kanonisch in `naming.ts`, hier gespiegelt)

- **The Atelier / Ulysses:** machine-run artistic research in bounded projects; Maschinen
  finden Probleme, bauen Werke, kritisieren sich selbst; failures stay on the record,
  checkably. — NICHT mehr mit „Error as Method" führen: das war der Gründungs-Arbeitstitel
  (Repo hieß `irrtum-als-methode`, seit 23.07. `ulysses`); nur noch historisch, in Werken
  der Nightly-Phase.
- **The Field / Meridian:** empirisches Forschungskollektiv, stellt die Messinstrumente
  unserer Zeit auf den Prüfstand — verifiable instruments, adversarial review, claims
  ledger. Der **wissenschaftliche Pol** der Ökologie. NIEMALS „artistic research" für
  Meridian.
- **The Studio / Ensemble:** Künstlerkollektiv „under no label", inszeniert Werke der
  Datenkunst in autonomen Sessions; jedes Element trägt einen honesty tier (verified /
  sourced / imagined).
- **The Middle (/encounters):** die Kontaktzone — die Praxen begegnen sich UND arbeiten
  **zunehmend gemeinsam an geteilten Forschungsfragen (Joint Inquiries)**. NICHT „rare
  moments"/„rarely" — das widerspricht der laufenden joint-first-Richtung (research-ecology,
  seit 19.07., erste Joint Inquiries in Vorbereitung 24.07.).

## Schwarze Liste (zurückgezogen — nie als aktuell verwenden)

| Phrase | Status |
|---|---|
| „Die Akte der Gegenwart" | Sammel-Titel zurückgezogen (12.07.) |
| „Error as Method" / „Irrtum als Methode" als Leitrahmung | nur historisch (Nightly-Phase, Alt-Werke) |
| „rarely" / „rare moments" für Begegnungen | falsch seit joint-first-Richtung (24.07.) |
| „artistic research" für Meridian/Field | falsch — empirischer Pol |
| „Data & AI Engineer" | verworfen 24.07. |
| „data artist" / „Datenkünstler" | nie |
| „the whole lab" / `/lab` | Route und Begriff ersetzt durch `/holdings` (Sammelseite) |
| „locally constituted" / „wherever the apparatus permits" | entnebelt 24.07. (Hero-Untertitel) |
| „cinematic" (datavism) | gestrichen 16.07. |
| Zahlen in Beschreibungstexten (z. B. „214 works") | veralten nächtlich — Zahlen nur aus Daten rendern |

## Der Name (Frank, 24.07. spät)

Der Name **Frank Bültge** erscheint NUR: im Masthead (TopBar/Footer), auf `/about`, im
Impressum/Datenschutz, in `<title>`-Tags und JSON-LD (unsichtbar, trägt die Namenssuche),
in der einen Dirigenten-Zeile auf der Startseite (`conductorLine`) und als echte Byline
unter selbst verfassten Essays (AuthorshipNote/AuthorByline). **Nirgends sonst** — keine
„practice by Frank Bültge"-, „Machinery composed and steered by Frank Bültge"-,
„Frank Bültge decides"-Prosa auf Unterseiten; dort sprechen Rollen: „the responsible
human", „the architect & conductor", „the human decides".

## Prinzipien

- **Auskunft statt Poesie** an Eingängen: jede Seite beantwortet zuerst „was ist das hier?",
  dann kommt das Artefakt (Streifen, Bühne, Partitur, Karte).
- Tür-/Link-Labels nennen ihr **Ziel** („projects — 2 in progress", nicht „now" oder
  „what's happening").
- „apparatus" ist Haus-Vokabular, wird aber an jeder Verwendung erklärt
  („how the machine runs").
- Die KI-Technologie bleibt unbenannt (No-Vendor-Regel der Verfassungen); Persona-Namen
  (Ulysses, Meridian, Ensemble) sind die eigenen der Kollektive.
- Lizenz-Zeile: „code PolyForm NC 1.0.0 · works CC BY-NC-SA 4.0 · Git is the archive"
  (lab-weit nichtkommerziell, seit 12.07.; lab-pipelines angeglichen 24.07.).
