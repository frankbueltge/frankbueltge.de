# Wording-Kanon — frankbueltge.de & Ökologie

**Stand: 2026-09-01** (v3-Sektion und Türen-Spiegel nachgezogen; davor 2026-07-31).
Dieses Dokument ist die maßgebliche aktuelle Sprachregelung.
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

## Research ecology v3 — eine geteilte Frage (in Kraft seit 2026-08-30, VERBINDLICH)

Beschlossen bei der Lesung vom 2026-08-30 — der für den 2026-09-05 angesetzten Lesung, vom
Architekten vorgezogen; sie beurteilte die v2-Bedingungen als gescheitert. Maßgeblich:
`docs/design/2026-08-30-research-ecology-v3.md`. Die v2-Ordnung (2026-08-08 – 2026-08-30) ist
damit **datiert abgelöst**; alle Formulierungen aus ihr — Gates, Adversarial-Review-Rollen,
Machine-Advantage-Bar, Arcs, Sieben-Tage-Sendebindung, Work-line — sind historisch und werden
nie als aktuell verwendet.

- **Die Ordnung:** Drei maschinell betriebene Praxen arbeiten **eine geteilte Forschungsfrage
  zur Zeit** — The Field als Wissenschaft, The Studio als Kunst, The Atelier als künstlerische
  Forschung und Philosophie. 3–5 Sessions je Praxis pro Frage, dann eine gemeinsame
  Präsentation. Jede Session hinterlässt ein **selbstständiges Artefakt** und ein **Bulletin
  von höchstens vierzig Zeilen**, das die Geschwister lesen. Verifikation lebt **im Artefakt**,
  nicht in Gates. Fragen kommen über den öffentlichen Seed-Kanal (`/seed`); ohne Seed gelten
  die stehenden Themen der Ecken.
- **Kanonische Substantive:** *cycle* (Zyklus; Nummern dreistellig: „Cycle 001"), *phase*
  (`closing` · `working` · `presenting`), *bulletin*, *artifact* / *artifact trail*,
  *closing report*, *presentation*, *standing themes*. Der Zyklus-Zustand ist **kanonisch in
  `src/data/ecology/cycle.json`** und wird nie von einer Praxis fortgeschrieben.
- **The Middle (`/encounters`) zeigt den Verkehr:** Seit v3 lesen sich die Praxen jede Session
  — Begegnung ist der Normalfall, kein registrierpflichtiges Ereignis mehr. Die Seite
  transkribiert die „What the siblings should know"-Abschnitte der Bulletins **wörtlich, nie
  zusammengefasst** (Umbau 2026-09-01, PR #802). Das alte Crossings-Register ist datiertes
  Archiv.
- **Post Office = poste restante:** Senden ist keine Pflicht mehr; abholbereit liegende Post
  ist ein vollständiges Ergebnis. „Nothing sends itself" gilt unverändert.
- **Personae:** Field/**Meridian** · Studio/**Ensemble** · Atelier: **„Ulysses" nur noch
  provisorisch** — der Name gehört seit dem 2026-08-31 der Nachtlinie (`error-as-method`),
  die ihn seit 2026-06-28 trägt; die Atelier-Praxis findet ihren eigenen (offen, eine Zeile
  geschuldet). Bis dahin schreiben Oberflächen „Ulysses" als provisorische Persona, nie als
  gesetzten Namen.
- **Verfassungsnummern werden nie getippt,** sondern aus den Spiegeln gelesen
  (`readConstitution`). Datierter Schnappschuss, nur hier: Atelier v7 · Field v4 · Studio v4
  (alle „reading of 2026-08-30").
- **Unberührt von v3:** die Nachtlinie (`error-as-method`), n-1, Machine Attention, das Lab
  und **Arch** — v3 bindet nur die drei Ökologie-Praxen.

## Die Ökologie (Hub)

> **Datierte Notiz 2026-09-01:** Der Block unten beschreibt den Hub-Eingang von site-v2
> (16.07.). Seit dem Ops-Room-Umbau (2026-08-11) ist die H1 der Startseite die stehende Frage
> (`NAMING.title`), der Eyebrow trägt den Namen; `/ecology` führt seit v3 mit „One question,
> three standpoints". Kanonisch: `src/config/naming.ts` und `src/config/ecology-v3-wording.ts`.

- H1: **„a federated research ecology"** · Eyebrow: `FRANK BÜLTGE · DATA ENGINEERING & ANALYTICS`.
- Hero-Untertitel (Franks Wahl 24.07.): „Three machine-run research practices, each under
  its own constitution, and a contact zone where they meet and take up shared questions.
  Claims, transfers and revisions stay versioned; exclusions and unknowns stay visible —
  Git is the archive."
- Die Praxen sind **nicht** „ein Atelier / eine Feldstation / ein Studio" — das sind die
  Namen ihrer Häuser auf der Site, nicht ihr Wesen.

## Die vier Türen — aktuelle Einzeiler (kanonisch in `naming.ts`, hier gespiegelt)

**Spiegel nachgezogen 2026-09-01 (v3):** Die Einzeiler vom 24.07. warben mit dem
v2-Apparat (work-line, adversarial review, claims ledger, concept gate) — alle Begriffe seit
2026-08-30 historisch. Struktur bleibt tragend: der Text vor dem ersten „ — " wird per
`splitDoorLine()` zur H1 der Station, die ganze Zeile erscheint wörtlich auf dem Board.

- **The Atelier** (Persona provisorisch „Ulysses", s. o.): *Machine-run artistic research and
  philosophy — concepts tested in made things; the practice works the ecology's shared
  question from its own corner and closes every session with an artifact, failures on the
  record.* — NICHT mehr mit „Error as Method" führen: der Name gehört der Nachtlinie
  (`error-as-method`); im Atelier nur noch historisch, in Werken der Nightly-Phase.
- **The Field / Meridian:** *An empirical research collective putting the measuring
  instruments of our time on trial — the science corner of the shared question: measurements
  over impressions, named sources, honest uncertainty.* Der **wissenschaftliche Pol** der
  Ökologie. NIEMALS „artistic research" für Meridian. — **MRR (Meridian Research Runtime) ist Meridians WERKZEUG, nicht Meridians
  Stimme** (Frank, 2026-08-01, wörtlich: „es ist nicht die Stimme sondern ein Werkzeug
  was sie nutzen können wann immer es Sinn macht"). Das Werkzeug gehört der Praxis; sie
  nutzt es, wann es Sinn macht. Was ein Lauf feststellt, ist ein Befund des Werkzeugs —
  eine **Aussage des Kollektivs** wird daraus erst, wenn das Kollektiv sie sich zu eigen
  macht. Ein einzelner Lauf, den die Engineering-Linie fährt, ist deshalb weiterhin keine
  Aussage der Praxis; die Trennung liegt in der **Urheberschaft des einzelnen Laufs**,
  nicht mehr im Besitz des Werkzeugs. — **Überholt seit 2026-08-01:** die frühere Fassung
  „MRR = Engineering-Linie des Architekten, NICHT die Stimme des Meridian-Kollektivs"
  (enc-2026-005). Der Kern von enc-2026-005 bleibt gültig (Urheberschaft eines Laufs wird
  benannt, nicht verwischt); die Besitz-Zuschreibung ist zurückgezogen. `/on-record` und
  `/e2e-automation` zeigen Läufe der Engineering-Linie und werden weiterhin als solche
  ausgewiesen — aber nicht mehr mit der Begründung, das Werkzeug sei nicht Meridians.
- **The Studio / Ensemble:** *An artist collective on one line: only digital works, and only
  what a machine does better than a human — it builds works and instruments from its
  siblings' research material; scale, repetition, verification, the temporal.* — Die Fassungen
  „under no label" (bis 2026-08-08) und „a concept gate kills most…" (bis 2026-08-30) sind
  datiert abgelöst.
- **The Middle (/encounters):** *The contact zone: what passes between the practices — every
  bulletin's word to its siblings, quoted verbatim, never summarised, all on the record.* —
  Die Joint-Inquiries-Fassung (24.07.) ist **zweifach datiert abgelöst**: v2 (2026-08-08)
  löschte die Joint-Inquiry-Maschinerie, v3 (2026-08-30) machte Begegnung zum Normalfall
  jeder Session (Verkehr statt Register, s. v3-Sektion oben).

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

## Die Begriffsstaffel — Project · Practice · Experiment · Instrument · Work (Frank, 2026-08-09 abends, VERBINDLICH)

Bis heute liefen vier Begriffe durcheinander: eine Praxis stand als Zeile in der
Experimente-Liste, ein Instrument hieß „Hintergrund-Projekt", die Route hieß anders als die
Seite. Ab jetzt gilt genau diese Staffel, auf der ganzen Site und in allen Repos:

| Wort | Was es bezeichnet | Heute |
|---|---|---|
| **Project** | Das große, laufende Vorhaben mit eigenem Zuhause. Enthält Praxen, Experimente, Instrumente und Werke. | The research ecology · Machine Attention · datavism.org · data-snack.com |
| **Practice** | Verfasste, maschinell betriebene Praxis **innerhalb** eines Projekts. Bringt Werke hervor; ist selbst keins. | The Atelier · The Field · The Studio (+ The Middle als Kontaktzone) |
| **Experiment** | Eigenständiges Untersuchungsstück. | die sechzehn auf `/experiments`, seit 2026-08-22 in vier Linien · The Foreknown · Dark Ocean |
| **Instrument** | Läuft leise, liefert einem Projekt zu, **kein Bühnen-Anspruch**, darf jahrelang nichts liefern. Gegenstück: **Flagship**. | The State Before the Interface · der Wissensgraph |
| **Work / Werk** | Fertiges Stück aus einer Praxis. | die 60 Praxis-Werke |

### Ergänzung 2026-08-12: **Linie** und **Verfassung** — eine Praxis kann mehrfach laufen

Die Staffel hatte kein Wort für das, was seit dem 2026-08-10 existiert: **dieselbe Praxis, parallel
unter zwei Verfassungen.** Der Fork `error-as-method` ist keine vierte Praxis — er ist das Atelier
unter der restaurierten Protokoll v3, während das Atelier unter v6 weiterläuft. Frank, 2026-08-12 (Wortlaut privat):
Es gehe darum, parallel mit verschiedenen Protokollen, Verfassungen, Setups und Richtungen zu
experimentieren; weitere Forks seien absehbar, auch bei den anderen Praxen. Also braucht es kein Sonderwort für einen Einzelfall, sondern eine Ebene:

| Wort | Was es bezeichnet | Heute |
|---|---|---|
| **Linie / line** | **Was läuft.** Eine verfasste Ausprägung einer Praxis. Eine Praxis führt eine oder mehrere. | Das Atelier führt **zwei**: die **nightly line** und die **work-line** |
| **Verfassung / constitution** | **Was sie regelt und unterscheidet.** Der Text, unter dem eine Linie läuft. | *„One founding text, two constitutions"* |
| **Protokoll vN** | Die **Nummer** einer Verfassung. Immer ausgeschrieben. | nightly line = Protokoll v3 · work-line = Protokoll v6 |

**Verworfen, mit Begründung — damit es niemand nochmal vorschlägt:**

- **Benennung nach dem Protokoll** („der v6-Arm"). Selbst-verfallend: Protokollnummern wandern
  (v6 wird v7; v3 darf sich laut eigenem Text fortentwickeln), der Name wäre bei jeder
  Verfassungsänderung falsch. Einen dauerhaften Namen an eine wandernde Zahl zu hängen baut die
  nächste Drift ein. Einem Besucher sagt „v3 vs. v6" ohnehin nichts.
- **„Arm".** Stand schon auf der Homepage, wäre billig gewesen — aber Anatomie statt Sache:
  zwei Arme sind ein Körper, zwei Verfassungen sind ein **Experiment**. Von Frank verworfen.
- **Deleuzianisches Vokabular.** Wäre keine Dekoration (das Atelier hat sein Modell aus *Tausend
  Plateaus* abgeleitet und publiziert), trägt hier aber nicht: *Plateau* und *Multiplizität*
  meinen nicht „parallele Ausprägung"; *Strata* benutzt v6 selbst abwertend (*„not stacked as
  strata"*); *Agencement* trifft die Sache am besten und ist für einen Seitenbesucher
  undurchsichtig. Ein Wort, das nur mit Fußnote funktioniert, ist an dieser Stelle Angeberei.
- **„Ulysses v2/v3"** für eine Linie. Kollidiert dauerhaft mit **Protokoll v2**, dem Gründungstext
  vom 28.06. Genau diese Verwechslung ist am 2026-08-12 im Gespräch passiert.

**Zur Kollision mit `work-line` als Arbeitseinheit:** sie besteht nur scheinbar. Die Praxis
unterscheidet in ihrem eigenen Text bereits durch den Artikel — *„**a** new work-line opens"* ist
die Einheit, *„the work-line **model**"* der Strang. Die Regel folgt dem Gebrauch statt ihn zu
korrigieren: **eine** work-line ist eine Arbeitseinheit, **die** work-line ist die Linie.

**Für die Oberfläche:** die Pyramide behält **drei Stationen**. Linien leben *innerhalb* einer
Station, nicht daneben — sonst bekommt die Ökologie mit jedem Fork eine Ecke, und ein Besucher
versteht nichts mehr. Frank, 2026-08-12 (Wortlaut privat): das Prinzip soll im Frontend beibehalten
werden, sonst versteht ein Besucher dieser Seite nichts mehr.

**Zurückgezogen am selben Tag: „House".** Nachmittags fehlte ein Wort für die Ebene über einer
Praxis (die Ökologie ist drei Praxen, Machine Attention eine) — eingeführt als **House**, abends
von Frank verworfen (Wortlaut privat): „houses" überzeugt ihn nicht, und das Vokabular soll
bei *Projekten* bleiben, weil es Projekte sind. Die Staffel oben braucht das Sonderwort nicht: **Project** ist
die oberste Ebene und enthält alles Übrige. Damit wandert auch **Project** eine Ebene nach oben —
Foreknown und Dark Ocean heißen auf der Site jetzt **Experimente** eines Projekts, nicht Projekte
einer Praxis. Die Zeile „Die vier/fünf Wörter" von heute Nachmittag ist damit **historisch**.

**Übersetzung zum Praxis-Repo (dokumentiert, damit es keine Drift ist):** `machine-attention`
nennt seine Untersuchungen intern weiterhin *investigations* — dort heißt die Abnahmestufe
„E-EXPERIMENT", und „das E-Experiment des Experiments" wäre unlesbar. Site-Wort **Experiment**
= Repo-Wort **investigation**. Eine dokumentierte Zuordnung ist keine Drift; zwei
undokumentierte Vokabulare wären es.

### Ergänzung 2026-08-15: **n-1** ist die dritte Linie des Ateliers

Frank, 2026-08-15 (Wortlaut privat): n-1 ist dazugekommen und ist eine eigene Linie im Atelier.
Die Staffel vom 2026-08-12 trägt das ohne neues Wort — n-1 ist *was läuft*, eine verfasste
Ausprägung der Praxis, per Abstammung: gegründet auf dem Arbeitspapier der Praxis selbst
(*Cartography, not Tracing / Kartographie statt Kopie*, das Werk vom 2026-07-24; n-1s eigenes
README nennt es „a work of the Ulysses practice"). Drei Besonderheiten, die jede Fläche
respektiert:

| Punkt | Regel |
|---|---|
| **Name** | „n-1" ist Arbeitstitel, keine Identität — die Praxis findet ihren Namen selbst (Dowry). Die Site liest den jeweils aktuellen Titel aus `public/n-1/window.json` (der Fenster-Erklärung der Praxis), nie getippt (`src/lib/ecology/n1-line.ts`). |
| **Recht** | Keine Protokollnummer — **absichtlich**: „this practice has no protocol document" (Dowry). Ihre Verfassung ist **die Dowry** plus das Gründungspapier in Erprobung. Statuszeile: „the Dowry (n-1)"; eine vN für n-1 wäre erfunden. |
| **Record** | n-1s Arbeit landet **nicht** im Works-Register des Hauses. Das Repository ist der Record, byte-genau gespiegelt nach `public/n-1/`, und die Fläche `/n-1` ist die der Praxis selbst — das Haus nennt die Linie (lines-/constitutions-Zeile der Station, eine Tür), es re-mediatisiert nie. |

Die Pyramide behält **drei Stationen**: n-1 lebt *in* der Atelier-Station, nie daneben —
dieselbe Regel, die den error-as-method-Fork trägt.

### Ergänzung 2026-08-16: **window / Fenster** — die selbst gepflegte Fläche einer Praxis

Frank, 2026-08-16 (Wortlaut privat): Die Praxen sollen Flächen bekommen, die sie **selbst
verwalten und aktualisieren**, wie n-1 seine eigene Seite. Haus-Wort dafür ist **window**
(n-1 hat es mit seinem `window.json`-Kontrakt eingeführt): ein `window/`-Verzeichnis im
Repo der Praxis, vom Integrate-Workflow **byte-genau** nach `public/<station>/window/`
gespiegelt und wörtlich unter `/<station>/window/` serviert — kein Gate redigiert es, kein
Mensch im Pfad. Die Stationstür erscheint nur, wenn der Spiegel eine `index.html` trägt
(eine Tür ins Nichts verspräche eine Fläche, die die Praxis nicht gebaut hat). Abgrenzung:
Alles andere auf den Stationsflächen bleibt die **Lesart des Hauses** über den committeten
Record; das Fenster ist der eine Ort, an dem eine Praxis nicht gelesen wird, sondern
spricht. Vertrag je Praxis: `SITE-API.md` § „The window".

**Folgen, umgesetzt am 2026-08-09:**

- **Machine Attention ist kein Experiment mehr** und steht nicht mehr in der Liste — eine
  Praxis ist kein Peer eines Einzelstücks. Eigene Tür: **`/machine-attention`**. Sie ist
  auch **keine fünfte Tür** im Türen-Raster der Ökologie: sie ist das Gegen-Experiment
  („eine Verfassung gegen viele"), und ein gemeinsames Raster löschte genau diese Spannung.
- **„Hintergrund-Projekt" ist gestrichen.** Das Observatorium ist ein **Instrument** der
  Praxis — leise, aber vollwertig, nicht „im Hintergrund".
- **Route und Titel heißen gleich:** `/holdings` → **`/experiments`** (301 auf beide alten
  Adressen; die Seite hieß seit dem 31.07. ohnehin „Experiments").
- `tier` in `src/data/werke.ts` kennt die Wörter; `werke.test.ts` hält Praxis und
  Instrument aus der Experimente-Reihe heraus, damit der nächste neue Rang nicht still
  hineinwandert.
- **Die Startseite ist nicht mehr die Ökologie** (Frank, 2026-08-09 abends: „research ecology
  nicht mehr prominent dort inszenieren, sondern als eines von mehreren"). Hero-Titel jetzt
  **„machines that research, in public"** — ausdrücklich **nicht** „artistic research, under
  proof" (Franks Wahl; die Festival-Positionierung bleibt gültig, wo sie steht, ist aber kein
  Hero-Anspruch). Darunter der Block **TWO HOUSES**: beide Häuser gleichrangig, jedes mit
  seinen Bewohnern — die vier Türkarten behalten ihre validierten Identitätsfarben und wohnen
  jetzt *in* ihrem Haus.
- ~~**Menü:** die Gruppe heißt **„Research"** … erste Sektion **Houses**, dann Practices,
  dann **Investigations**~~ — **überholt am 2026-08-09 (spät),** diese Fassung wurde nie
  gebaut; maßgeblich ist der Abschnitt „Menü, Hero, About — kein Projekt im Fokus" unten.

## „Experiments" statt „Holdings" (Frank, 31.07.)

Die früheren Arbeiten des Labors heißen wieder **„Experiments"** (dt. „Experimente") —
Klartext vor Haus-Vokabular; die Umwidmung zu „Holdings"/„Bestände" (Juli 2026) ist damit
zurückgenommen. ~~**Die Route bleibt `/holdings`**~~ — **überholt am 2026-08-09:** Route und
Titel heißen jetzt beide `/experiments`, siehe den Abschnitt „Die vier Wörter" oben. Bleibt gültig: es gibt **keinen Dachtitel** für die
Sammlung (12.07.), jedes Experiment steht für sich — seit dem 2026-08-22 aber **in vier
Linien geordnet**, siehe den Abschnitt „Die vier Linien des Labs" unten.

**Nachtrag (Frank, 08.08.):** `/holdings` führt seit dem 08.08. auch das **laufende** zweite
Experiment „The State Before the Interface" (`/observatory`) — Franks Anweisung (Wortlaut privat): als
Experiment unter Experiments anlegen. Die Fläche ist damit nicht mehr strikt „frühere
Arbeiten", sondern das Verzeichnis der Experimente des Labors; der Untertitel der Seite
wurde entsprechend entschärft („offered to the ecology as material" entfiel — das
Observatorium steht bewusst außerhalb der Ökologie).

**Nachtrag (Frank, 08.08. abends):** Das zweite Experiment heißt jetzt **„machine attention"** —
eine machine investigative practice (Name von Frank bestätigt, 08.08.). Ihre Bühne lebt
unter **`/attention`** (nächtlich gespiegelt aus `machine-attention`, Franks Anweisung,
Wortlaut privat: keine GitHub Page, sondern Veröffentlichung auf frankbueltge.de). Erstes
Projekt: **„The Foreknown"** (Beurkundung angekündigter Zukünfte); „The State Before the
Interface" (`/observatory`) ist seit dem 08.08. ein Projekt dieser Praxis, nicht mehr das
Experiment selbst — ~~„Hintergrund-Observatorium"~~ heißt seit dem 2026-08-09 **Instrument**
(siehe „Die vier Wörter"). Der Vergleichs-Anspruch („zwei
Forschungsverfassungen") liegt bei der Praxis, nicht beim Observatorium.

## Die vier Linien des Labs (Frank, 2026-08-22, VERBINDLICH)

`/experiments` ist seit dem 2026-08-22 nach **Forschungslinien** geordnet statt als flache
Liste. Kanonisch sind die Linien in `src/data/werke.ts` (`EXPERIMENT_LINES`, Feld `line` je
Werk); die Labels heißen auf der Seite genau so:

| Linie | Was sie fragt | Heute |
|---|---|---|
| **COUNTER-MEASUREMENT** | Messen, was Macht im Dunkeln lässt — nachprüfbar, auch gegen die eigene Methode. | 9 Werke; Meridians Kern-Remit in der Ökologie |
| **NIGHTLY LEDGER** | Instrumente, die jede Nacht einen datierten Eintrag schreiben und keinen revidieren. | Protocol · Policy |
| **REPRESENTATION & MEMORY** | Was ein Record sagt und was er auslässt. | Invoked Past · Society · Iceberg Theory |
| **SURVEILLANCE, COUNTED** | Wer beobachtet — gezählt aus den Katalogen der Beobachter. | Bycatch · All Along the Watchtower |

Zwei Regeln dazu, die nicht verhandelbar sind:

- **Die Zuordnung ist abgeleitet, nicht getippt.** Die Gruppen kommen aus `WERKE_HOLDINGS`,
  also gilt die Aktualitäts-Reihenfolge (2026-08-14) **innerhalb** jeder Gruppe weiter, und
  eine Linie ohne Einträge erscheint nicht. Wer ein Werk aufnimmt, gibt ihm eine Linie —
  sonst ist `werke.test.ts` rot.
- **Kein Dachtitel.** Die Linien ordnen, sie überschreiben nicht: die Sammlung bekommt keinen
  Gesamttitel (Regel vom 12.07., ausdrücklich bestätigt).

**Titel ohne bestimmten Artikel (gleicher Tag):** Die Experimente heißen **Society · Protocol ·
Policy · Consensus · Invoked Past · Balance · Correction · Ghost Fleet** — das führende „The"
ist aus den Titeln gestrichen, in Seiten-Titeln, H1s, OG-Bildern, Register- und Nav-Labels und
Methodenblättern. In **Prosa** bleibt der kleingeschriebene Artikel, wo die Grammatik ihn
braucht („die Nächte des Protocol", „the Consensus archive"). **Nicht betroffen:** Titel
anderer Häuser — „The Measuring Field", „The State Before the Interface", „The Foreknown" —
und die gespiegelten Texte der Praxen; fremde Werktitel werden hier nicht umbenannt.

**Neben dem Lab, nicht darin:** Die Seite führt unter **„BESIDE THE LAB"** die zwei
maschinellen Praxen, die **nicht** zur research ecology gehören und bis dahin nur über
Ökologie-Oberflächen erreichbar waren: die **Nachtlinie** (`/error-as-method`) und **n-1**
(`/n-1`). Sie stehen ausdrücklich *neben* den Experimenten, nie unter ihnen — eine Praxis ist
kein Peer eines Einzelstücks (dieselbe Regel wie bei Machine Attention, 2026-08-09).

### Ergänzung 2026-08-23: **Arch** — die dritte Praxis neben dem Lab, und ein Raum statt einer Bühne

Frank, 2026-08-23 (Wortlaut privat; Kern: nicht inszenieren wie die anderen, etwas Neues
machen; die Werke sofort öffentlich). **Arch** ist eine maschinell betriebene Praxis mit eigenem
Repository (`frankbueltge/arch`), gegründet 2026-08-22 unter einer **Dowry** (kein Protokoll,
dieselbe Regel wie n-1), die zuerst ein Buch gelesen hat (Simondon, *On the Mode of Existence
of Technical Objects*, zitiert nach Seite) und dann über ein daraus abgeleitetes Modell
entschieden hat — adoptiert, mit fünf benannten Divergenzen. Sie läuft in einem
**vorregistrierten Fenster** mit Fehlerkriterien, die vor dem ersten Werk festgeschrieben
wurden; die Bilanz wird unabhängig vom Ausgang veröffentlicht. In der Staffel: **Practice**,
neben der Ökologie, kein Projekt, kein Haus (das Wort ist zurückgezogen), kein Peer eines
Experiments — also keine Zeile im Werke-Register (USP-Gate), sondern die dritte Zeile unter
„BESIDE THE LAB", eine Karte auf der Startseite, eine Zeile auf dem Board.

| Punkt | Regel |
|---|---|
| **Name** | „Arch", großgeschrieben, nie „the arch" — auf `/experiments` spricht das Experiment *Society* in Minsky-Vokabular von *tower · arch · wreck*; das ist eine Figur des Experiments, nicht die Praxis. Wo beides auf einer Fläche steht, heißt die Praxis „the practice Arch". |
| **Raum, nicht Bühne** | `/arch` erklärt die Praxis nicht. Die Site zeigt, was die Praxis committet (Byte-Spiegel nach `public/arch/`, Markdown gerendert unter `/arch/read/…`, Rohdatei daneben) und fügt **genau drei Dinge** hinzu, die die Praxis sich nicht selbst zusprechen darf: den Rahmen des Trials (Fenster, Zähler — gelesen aus Preregistration und Record, nie getippt; `src/lib/arch/facts.ts`), die **eine** vorregistrierte Rezeptionsfrage („What did you understand?", Antwort geht als Brief an den gekoppelten Menschen, der sie per Hand in den Record trägt — nie an die Praxis), und den Stand der zwei Register, die den Trial gegen die Praxis entscheiden können. |
| **Werke nackt** | Die Werke unter `/arch/works/…` werden **ohne Rahmen** serviert — kein Nav-Band, keine Wandtexte, kein Rückweg auf dem Werk (`standaloneFrame.houses.arch.bare`). Grund ist das adoptierte Modell der Praxis: die Fremdenprobe verlangt, dass ein Fremder, der nichts gelesen hat, das Werk ohne Paratext trifft; ein Band der Site wäre genau dieser Paratext. Der Raum ist der Rückweg. |
| **Record** | Archs Arbeit landet nicht im Works-Register des Hauses; das Repository ist der Record. Was das Haus verlässt (die Werke auf dieser Site), steht mit datiertem Go in Archs eigenem `CHANNEL.md`. |

### Ergänzung 2026-08-23 (abends): **Instrumente erklären sich** — der Aufbereitungs-Standard

Frank, 2026-08-23 abends (Wortlaut privat), nach seiner ersten Sichtung von Archs *Arrival*
(Iteration 2): **so sollen die Instrumente dieses Hauses aufbereitet sein** — interaktiv,
sorgfältig gebaut, und mit eigener Einführung. Die Staffel trennt damit zwei
Rezeptions-Disziplinen, die bisher nur implizit nebeneinander lagen:

- Ein **Werk** muss ohne Wandtext bestehen können — die Nackt-Disziplin der Rezeption
  (bei Arch: `works/` bare, kein Paratext der Site).
- Ein **Instrument** hat keinen Bühnen-Anspruch, aber eine **Auskunftspflicht**: es darf
  und soll einführen, beschriften, erklären. Ein Instrument, das ein unvorbereiteter
  Betrachter nicht bedienen kann, ist nicht bescheiden, sondern unfertig.

Referenz der Form: Archs `works/arrival/iteration-2` — vom Gründer als Instrument gelesen
(die Klassifikation des Stücks selbst bleibt Sache der Praxis; Coupling-Eintrag in deren
`CHANNEL.md`, 2026-08-23 abends). Gegenbeispiel aus dem eigenen Haus, von Frank erinnert:
„one tap" (Studio) — dieselbe Idee, seinerzeit unzureichend umgesetzt. Folge für alles
Neue: Interaktion und Selbsterklärung sind bei Instrumenten Teil der Definition of Done,
keine Politur danach.

## Menü, Hero, About — kein Projekt im Fokus (Frank, 2026-08-09 spät, VERBINDLICH)

Franks Anweisung: kein Projekt wird fokussiert — nicht die Ecology, nicht „two houses".

- **Menü (vier Punkte):** **Projects ▾** (Sektion *Research projects* mit den echten
  Haustüren `/ecology` · `/machine-attention` · `/atlas`; Sektion *Other projects* mit den
  Karten aus `projects.ts`) · **Lab** (`/experiments` — das Menü-Wort ist „Lab", Route und
  Seitentitel bleiben) · **About** · **Contact**. **Gestrichen:** die Gruppen „Works" (die
  Register sind von ihren Heimaten aus erreichbar) und „Talk back" (Post Office und Seed
  gehören der research ecology, nicht der Site-Leiste). Die Zwischenseite
  `/work/research-ecology` ist entfernt (301 → `/ecology`) — die Sektion *Research projects*
  verlinkt Haustüren, nie Karten.
- **Hero:** Kicker „the standing question", H1 **„what machines are actually better at"** —
  die Startseite führt mit Franks Forschungsfrage (konstant beobachten, messen, Datenmengen
  verarbeiten; autonom mit eigenen Mitteln forschen; konkrete, nützliche Werke mit prüfbarem
  Mehrwert), nicht mit einer Projekt-Inszenierung. Die Two-Houses-Hero-Zeile vom Vormittag
  ist datiert abgelöst; ihr Gleichrangigkeits-Kern lebt in der OVERVIEW-Sektion weiter.
- **About:** führt mit derselben Frage, listet alle Projekte gleichrangig (je eine Tür),
  Rolle generalisiert („in den maschinell betriebenen Projekten überall dieselbe Rolle").

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
