# Wording-Kanon — frankbueltge.de & Ökologie

**Stand: 2026-07-31.** Dieses Dokument ist die maßgebliche aktuelle Sprachregelung.
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
  Meridian. — **Daneben, klar getrennt: MRR (Meridian Research Runtime)** = die
  Engineering-Linie des Architekten, NICHT die Stimme des Meridian-Kollektivs
  (enc-2026-005, authorship honesty); Berührungen der beiden laufen über The Middle.
  `/on-record` und `/e2e-automation` gehören zur MRR-Linie und werden nie dem Kollektiv
  zugeschrieben.
- **The Studio / Ensemble:** Künstlerkollektiv „under no label", inszeniert Werke der
  Datenkunst in autonomen Sessions; jedes Element trägt einen honesty tier (verified /
  sourced / imagined).
- **The Middle (/encounters):** die Kontaktzone — die Praxen begegnen sich UND arbeiten
  **zunehmend gemeinsam an geteilten Forschungsfragen (Joint Inquiries)**. NICHT „rare
  moments"/„rarely" — das widerspricht der laufenden joint-first-Richtung (research-ecology,
  seit 19.07., erste Joint Inquiries in Vorbereitung 24.07.).

## Catalogues (Frank, 26.07.)

Der Nav-Punkt **„Atlas" wird zu „Catalogues"** und hält zwei maschinell gepflegte
Nachschlagewerke: **Atlas of Data Art** (`/atlas`, Name bleibt — verdient und zutreffend)
und **Dataset Register** (`/datasets`, neu). Kanonische Wortlaute in `naming.ts`
(`NAMING.catalogues`).

- Abgrenzung: Catalogues verzeichnen, was es **in der Welt** gibt. `/holdings` hält die
  **eigenen** früheren Arbeiten. Das Quellen-Regal des Ateliers (`/atelier/material`) ist
  das Inventar **einer Praxis** und bleibt dort — es wurde geprüft und bewusst NICHT in den
  Sammelpunkt gezogen (Frank, 26.07.).
- **„Hub" ist für die Dataset-Fläche gesperrt:** In dieser Codebasis bezeichnet „hub" die
  **Startseite** der Ökologie (`naming.ts`: „the hub's own wordings"). Das Repository darf
  `dataset-hub` heißen, die Site-Fläche heißt **Dataset Register**.
- Zahlen (Einträge, Werke) stehen **nie** in den Beschreibungstexten — sie veralten
  nächtlich und werden ausschließlich aus den Daten gerendert.

## Die Ökologie ist EIN Projekt, nicht die Site (Frank, 31.07.)

Die research ecology steht **gleichrangig neben data-snack.com und datavism.org** — ein
Hauptprojekt unter mehreren, nicht die Identität dieser Site. Der Hub sagte das längst
(„currently conducting", „THE OTHER HOUSES — main projects in their own right"), die
Navigation sagte das Gegenteil.

- **Top-Nav (vier Punkte):** `Research Ecology ▾` · `Projects ▾` · `Experiments` · `About`.
- Alles, was zur Ökologie gehört, liegt **in ihrem** Menü, in benannten Abschnitten:
  *Practices* (die vier Türen) · *The apparatus* (Maschinenraum, How it works) ·
  *Records* (Catalogues, Reception) · *Talk back* (Post office, Offer a seed).
- **Die Ökologie steht im Projektregister** (`src/data/projects.ts`, Slug `research-ecology`)
  — vorher fehlte dort ausgerechnet das Projekt, das auf dieser Domain wohnt.
- Türnamen und Projektliste werden im Menü **abgeleitet**, nicht abgetippt (`naming.ts`,
  `projects.ts`) — eine Umbenennung dort zieht die Navigation mit.
- Zurückgezogen: „Practices" als oberster Nav-Punkt (las sich, als sei die Ökologie das
  ganze Haus) und „Archive ▾" als Sammelpunkt, unter dem *Projects* lag.

## „Experiments" statt „Holdings" (Frank, 31.07.)

Die früheren Arbeiten des Labors heißen wieder **„Experiments"** (dt. „Experimente") —
Klartext vor Haus-Vokabular; die Umwidmung zu „Holdings"/„Bestände" (Juli 2026) ist damit
zurückgenommen. **Die Route bleibt `/holdings`** (Links, Redirects, OG-Pfade unverändert) —
nur der sichtbare Name ändert sich. Bleibt gültig: es gibt **keinen Dachtitel** für die
Sammlung (12.07.), jedes Experiment steht für sich.

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
| „Holdings" / „Bestände" als Seitenname | zurückgenommen 31.07. — die Fläche heißt wieder **Experiments**; die Route `/holdings` bleibt |
| „Practices" als oberster Nav-Punkt | ersetzt 31.07. durch `Research Ecology ▾` — die Ökologie ist ein Projekt, nicht die Site |
| „Dataset Hub" als Site-Fläche | „hub" ist die Startseite; die Fläche heißt **Dataset Register** (26.07.) |
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

- **Stets aktuell (Frank, 25.07., verbindlich):** Die Site erzählt immer den neuesten
  Stand der Entwicklung — Engine-Realität und Site-Darstellung dürfen nicht
  auseinanderlaufen. Jede Session prüft aktiv auf Drift; Überholtes wird datiert und
  sichtbar archiviert (Muster: /atelier „archive — the closed phases"), nie stillschweigend
  als aktuell stehen gelassen.
- **Auskunft statt Poesie** an Eingängen: jede Seite beantwortet zuerst „was ist das hier?",
  dann kommt das Artefakt (Streifen, Bühne, Partitur, Karte).
- Tür-/Link-Labels nennen ihr **Ziel** („projects — 2 in progress", nicht „now" oder
  „what's happening").
- „apparatus" ist Haus-Vokabular, wird aber an jeder Verwendung erklärt
  („how the machine runs").
- Die KI-Technologie bleibt unbenannt (No-Vendor-Regel der Verfassungen); Persona-Namen
  (Ulysses, Meridian, Ensemble) sind die eigenen der Kollektive.
- Lizenz-Zeile: **„code Apache 2.0 · works CC BY 4.0 · data CC0 · Git is the archive"**
  (Frank, 26.07. — löst die lab-weite Nichtkommerzialität vom 12.07. ab). Begründung:
  Die NC-Klausel blockierte genau die Weiterverwendung, die Reichweite schafft — wenn ein
  Werk viral geht, sind es kommerzielle Multiplikatoren, die es verbreiten. Der
  KI-Vorbehalt hängt seit 26.07. nicht mehr an der Lizenz, sondern an der Crawler-Politik
  (`public/robots.txt`, `docs/design/2026-07-26-crawler-politik.md`).
  **Ausnahme:** Saat-Einreichungen (`/seed`) bleiben CC BY-NC-SA 4.0 — das war
  Einreichenden zugesagt und ist nicht rückwirkend änderbar.
  Entscheidungsgrundlage: `docs/design/2026-07-26-lizenz-entscheidungsvorlage.md`.
