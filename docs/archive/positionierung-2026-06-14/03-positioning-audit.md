# 03 — Positionierungs-Audit

> Was behauptet die Website aktuell — explizit und implizit? Stärken, Brüche, Lücken.
> Grundlage: das Inhaltsinventar (02). Bewertung: nüchtern, kritisch.

## 1. Welche Positionierung ist bereits erkennbar?

Es liegen **zwei Positionierungen übereinander**, halb verschmolzen:

**(A) Die intendierte, neue:** *Data Engineering & Artistic Research* — eine
praxisbasierte, datengetriebene Forschungspraxis, deren Kern die Reihe „Die Akte der
Gegenwart" ist: laufende, quellentransparente „Untersuchungen" als „Messinstrumente,
keine Visualisierungen". Diese Positionierung ist in Header, Home-Hero, Lab-Intro,
Werk-Daten und Methodenblättern konsistent durchgesetzt.

**(B) Die alte, fortwirkende:** *Data & AI Engineer* — Analytics Engineering, BigQuery,
dbt, Tag Management, Daten-Storytelling, „von der Messung bis zur Entscheidung". Lebt in
der About-Seite, der Footer-Tagline, den strukturierten Metadaten (JSON-LD) und der
`package.json` weiter — plus zwei Consulting-Artikeln im Lab.

→ **Die Site weiß, was sie werden will, hat die Umstellung aber nur zu ~70 % vollzogen.**
Der nicht umgestellte Rest ist nicht „falsch" (Frank *ist* beruflich Data Engineer),
sondern **am falschen Ort**: Er steht dort, wo Außenstehende die *künstlerisch-forschende*
Identität suchen (About, Schema, Lab).

## 2. Stärken (was glaubwürdig trägt)

1. **Substanz statt Behauptung.** Vier laufende Werke mit echten, zitierten Quellen,
   Methodenblättern, deterministischer Erzeugung. Das ist selten und überzeugt sofort.
2. **Eingebaute Selbstkritik als Glaubwürdigkeitsmarker.** Überflug wurde nach eigenem
   Substanz-Gate **ausgemustert**; Parallaxe nach einem gescheiterten Prototyp (Embedding-
   Distanz diskriminierte nicht) **neu entworfen**. Wer öffentlich Werke verwirft, signalisiert
   methodische Ernsthaftigkeit — genau die Währung von Artistic Research.
3. **Fehler-als-Form, real umgesetzt.** Quellenausfälle werden amtlich vermerkt
   (`status:"unavailable"|"implausible"`), nie still überbrückt. Das ist eine ästhetische
   *und* epistemische Haltung, die im Output sichtbar ist.
4. **Reduktion als Position.** Kein WebGL-Spektakel, kein Tracking, self-hosted Fonts,
   Mono-Skin. Das passt zu „Messinstrument" und ist anschlussfähig an post-digitale /
   infrastrukturkritische Diskurse.
5. **Klare Selbstbegrenzung:** *„Messinstrumente, keine Visualisierungen."* — bescheiden,
   präzise, nicht überhöht.
6. **Git ist das Archiv.** Versionierte, reproduzierbare Tages-Snapshots sind ein
   substantielles, eigenständiges konzeptuelles Rückgrat (Akkumulation als Werkprinzip).

## 3. Wiederkehrende Begriffe (Häufung)

Aus Specs, UI und Werkdaten (siehe auch 04):

- **F-Cluster (Forschung/Werk):** Messinstrument · Untersuchung · Akte der Gegenwart ·
  Provenienz/Quelle · Register · Feststellung · deterministisch · Methodenblatt ·
  Halbwertszeit · Auslassung · amtlich · „kein LLM" · Reduktion · These statt Effekt.
- **E-Cluster (Engineering):** Data/AI Engineer · BigQuery · dbt · Tag Management ·
  Tracking · „von der Messung bis zur Entscheidung" · Data Products · Dashboards ·
  Data Storytelling.
- **Begriffe, die fehlen, aber zur Zielposition gehörten:** „Artistic Research /
  künstlerische Forschung" taucht als Label auf, aber **ohne erklärenden Text**;
  „Experiment", „Methode", „Wahrnehmung", „Zufall", „Sensorik", „Instrument" sind
  konzeptuell präsent, aber nicht als Vokabular einer Haltung ausgeführt.

## 4. Welche Themen sind stark / welche unklar oder riskant?

**Stark & tragfähig:**
- Daten als Messung von Gegenwart (Klima, Aufmerksamkeit, Sprache, Markt).
- Infrastruktur/Provenienz als Teil der Aussage.
- Akkumulation/Archiv über Zeit.

**Unklar / halbgar:**
- **„Artistic Research" als bloßes Etikett.** Das Wort steht im Header, aber es gibt
  **keine Seite, die erklärt, was hier unter künstlerischer Forschung verstanden wird,
  mit welcher Methode, in welcher Linie.** Ein Label ohne Research Statement wirkt
  leicht aufgesetzt.
- **„Data Engineering & Artistic Research" als Doppeltitel.** Zwei Felder im selben
  Atemzug. Kann als ehrliche Doppelidentität gelesen werden — oder als Unentschlossenheit.
  Braucht eine erklärende Rahmung (siehe 06).
- **Verhältnis Beruf ↔ Kunst** ist nicht erzählt. Warum macht ein Data Engineer das?
  Die 25-jährige Pause und die frühere Forschung sind nirgends sichtbar — dabei sind sie
  die glaubwürdigste Begründung der Doppelidentität.

**Riskant:**
- **Register-Brüche** (About/Footer/Schema/zwei Lab-Posts) — ein kritischer Besucher
  (Kurator:in, Jury) liest die Inkonsistenz als Unentschiedenheit oder als „Consultant,
  der Kunst-Vokabular ausprobiert".
- **`package.json`-Beschreibung „Award-caliber"** — Marketing-Sprache; zwar nicht
  öffentlich gerendert, aber im Repo und in Open-Source-Kontexten sichtbar (No-Go, siehe 12).
- **Großthemen ohne Demut.** „Was die Apokalypse kostet", „Die Sitzung der Welt" — stark
  und tragend, **weil** sie durch harte Daten und trockenen Ton gedeckt sind. Ohne diese
  Deckung wären es Pathos-Titel. Die Deckung muss erhalten bleiben.

## 5. Glaubwürdig vs. überhöht (konkrete Aussagen)

| Aussage | Bewertung |
|---|---|
| „Messinstrumente, keine Visualisierungen." | **glaubwürdig**, vorbildlich |
| „aus zwölf offenen, zitierfähigen Quellen, deterministisch, ohne LLM" | **glaubwürdig** (im Output belegt) |
| „Studie … eine technische Etüde, kein Kunstwerk." | **glaubwürdig**, selbstkritisch |
| „Data & AI Engineer. Ich verwandle Rohdaten in Data Products, Entscheidungen, Insights und Geschichten." (About) | **richtig, aber positionsfremd** — gehört nicht auf die Identitätsseite eines Artistic Researchers |
| „Award-caliber" (package.json) | **überhöht** — entfernen |
| Doppeltitel „Data Engineering & Artistic Research" | **noch nicht eingelöst** durch erklärenden Text |

## 6. Wo fehlen Belege / Werke / Dokumentation?

- **Belege für „Research":** Die Werke sind da; was fehlt, ist die **diskursive
  Einordnung** (Research Statement, Methodentext, Bezug zu Feldern/Quellen — siehe 07).
- **Biografische Belegkette:** frühere künstlerische Forschung + Masterarbeit (laut
  Auftrag vorhanden) sind **nicht** sichtbar. Sie wären der stärkste Beleg für die
  Legitimität des Wiedereinstiegs — aktuell ungenutzt. (Details/Daten ZU KLÄREN, siehe 15.)
- **Werkdokumentation für Außenstehende:** Methodenblätter sind technisch; es fehlt die
  Brücke „Warum ist das eine *Untersuchung*, was wird *gefragt*" in zugänglicher Form.
- **Bildebene/Dokumentation von Prozess** (Scheitern, Prototypen) ist intern (Specs/Git),
  aber nicht kuratiert sichtbar — dabei ist genau das ein Asset.

## 7. Welchen Eindruck erzeugt die Site? (Portfolio / Archiv / Labor / Blog / persönlich)

Aktuell ein **Hybrid mit Schlagseite zum Forschungsarchiv**:

- **Forschungsarchiv:** stark (Protokoll-Archiv, Register, Methodenblätter, „Akte").
- **Künstlerisches Labor:** im Ansatz (Lab, Studien, Untersuchungen) — aber durch die
  Consulting-Posts verwässert.
- **Portfolio:** schwach und eher störend (About + Projekte ziehen Richtung „seht, was
  ich beruflich kann").
- **Blog:** nur Restspuren (zwei portierte Artikel).
- **Persönliche Website:** kaum — es gibt fast keine Person (keine Bio, kein Gesicht,
  keine Haltungsseite).

→ **Der Hybrid ist nicht zufällig schlecht, sondern unfertig.** Die Frage „Archiv oder
Labor oder Portfolio?" ist die eigentliche Architekturentscheidung (siehe 10).

## 8. Implizit angesprochene Zielgruppen (Ist-Zustand)

- **Datenaffines Fachpublikum / Peers** (durch Methodenblätter, Quellen, Code-Nähe).
- **Recruiter / Auftraggeber** (durch About/Projekte/„von der Messung bis zur Entscheidung").
- **Kunst-/Forschungskontext** (Kurator:innen, Jurys, Artistic-Research-Community) —
  **angepeilt, aber noch nicht bedient**: Diese Gruppe sucht Research Statement, Methode,
  Diskursanschluss, Werkkontext — und findet stattdessen eine Engineer-About-Seite.

→ Die aktuell **am wenigsten bediente** Gruppe ist genau die **angestrebte**.

## 9. Wo droht die Site zu kippen?

| Kipप-Richtung | Aktuelles Risiko | Quelle |
|---|---|---|
| **zu beratungsnah** (Analytics-Portfolio) | **hoch** | About, Footer, Schema, 2 Lab-Posts |
| **zu theoretisch / Theoriepose** | **niedrig** | Ton ist trocken, datengedeckt — gut |
| **zu Tech-Demo-artig** | **mittel** | Hero generativ ohne Aussage; Überflug-Insel (aber ehrlich gerahmt) |
| **zu selbstinszenierend** | **niedrig–mittel** | „Award-caliber" (intern); Großtitel sind datengedeckt |
| **„AI-Art"-Beliebigkeit** | **niedrig** | LLM nur als ausgewiesenes Extraktionswerkzeug, kein Bildgenerator |

**Wichtigste Einsicht:** Das größte reale Risiko ist nicht Überhöhung oder Theoriepose —
es ist, dass die Site **wie das Nebenprojekt eines Analytics-Consultants** wirkt, weil die
Engineering-Schicht an den Identitätsstellen stehen geblieben ist. Das ist gut behebbar.

## 10. Kernempfehlung dieses Audits (zur Freigabe, nicht ausgeführt)

1. **Engineering-Schicht an Identitätsstellen entkoppeln vom Forschungs-Selbstbild:**
   About-Seite, Footer-Tagline und JSON-LD auf die Forschungs-/Doppelidentität umstellen;
   Beruf als *ein* Abschnitt, nicht als Definition. (Vorschlag, kein Eingriff — siehe 06/16.)
2. **Zwei Consulting-Lab-Posts neu verorten** (eigener „Beruflich/Engineering-Notizen"-
   Bereich) oder als solche kennzeichnen, statt unter „Forschung in den Künsten".
3. **Ein knappes Research Statement + eine Reihen-/Methodenseite** schaffen — die fehlende
   Brücke zwischen Label und Substanz.
4. **Biografische Linie sichtbar machen** (frühere Forschung, Wiederaufnahme) — der
   stärkste, bislang ungenutzte Glaubwürdigkeitsbeleg. (Fakten vorher klären, siehe 15.)
5. **`package.json`-Beschreibung entschärfen** („Award-caliber" raus).
