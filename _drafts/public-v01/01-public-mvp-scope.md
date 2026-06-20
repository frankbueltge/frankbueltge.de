# 01 — Public-MVP-Scope (Entwurf)

> Minimale veröffentlichungsfähige Version der Site. Entwurf, **nicht** umgesetzt.
> Grundlage: `docs/05` (Risiken), `docs/10`/`_drafts/06` (IA), `_drafts/work-audit/00–07`,
> `_drafts/08` (Publikations-Checkliste). Strategische Festlegung: Richtung B im Ton A;
> Kern „künstlerische Forschung mit Daten, Code und technischen Infrastrukturen"; Leitsatz O1.

## Prinzip
**Lieber wenige, fertige Seiten als viele halbe.** Die vier Untersuchungen sind die Substanz
und bereits live; der MVP braucht vor allem **Rahmung** (Research Statement), **Konsistenz**
(Selbstbeschreibung) und **Trennung** (Beruf ≠ Forschung) — kein neues Werk.

## 1. Seiten, die vorhanden sein MÜSSEN
- **`/` Startseite** — Leitsatz O1; Beruf nachgeordnet/abgegrenzt; kein Consulting-Claim.
- **`/research`** — Research Statement (`_drafts/public-v01/02` DE / `03` EN). **NEU.**
- **Die vier Untersuchungen** je erreichbar, mit Methodenblatt:
  The Protocol (`/protokoll`), Half-Life (`/halbwertszeit`), Parallax (`/parallaxe`),
  The Policy (`/praemie`) — inkl. der bestehenden Methodenblätter.
- **`/about`** — entkonsultierte Fassung (`_drafts/public-v01/04` DE / `05` EN).
- **`/contact`** — vorhanden, unauffällig.
- **`/impressum` + `/datenschutz`** — mit **echten, geprüften** Angaben
  (Daten liegen vor: `_drafts/11`; rechtliche Prüfung offen).
- **Ethik-/Grenzhinweise** an den sensiblen Untersuchungen (mind. die Bausteine aus `06`).

## 2. Seiten, die noch FEHLEN dürfen (MVP-tolerant)
- **`/experiments`** als eigener voller Bereich — die Überflug-Studie kann vorerst unter Lab/
  Notes leben; ein eigener Experiments-Index ist *nice-to-have*.
- **`/notes`** mit vielen Einträgen — **zwei** Lab Notes genügen (`_drafts/public-v01/08`);
  ein leerer Notes-Bereich darf nicht erscheinen.
- **Indizes** für Datasets / Instruments / Methods als eigene Top-Level-Seiten (V2, wenn gefüllt).
- **Druckobjekt, Sonifikation, dbt-Lineage, neue Werke** — alles spätere Stufen.
- **OG-/Vorschaubilder** — *nice-to-have*, aber als Fehlstelle markieren (R-14).

## 3. Bestehende Inhalte, die VERSCHOBEN / UMETIKETTIERT werden müssen
- **Zwei Engineering-Artikel** (`bigquery-dbt`, `server-side-tagging`) **raus aus** „Lab =
  Praxisbasierte Forschung in den Künsten" → in einen klar markierten Beruf-/Engineering-
  Bereich (`/work` bzw. `/projects`, siehe `07-url-and-ia-plan`). *(R-03)*
- **Überflug** bleibt **Studie/Etüde** (kein Werk) — Status klar gekennzeichnet (ist es bereits).
- **Selbstbeschreibung angleichen:** About-Lede, Footer-Tagline, JSON-LD
  (`disambiguatingDescription`, `knowsAbout`) von „Data & AI Engineer" auf die Forschungs-/
  Doppelidentität. *(R-01)*
- **Werktitel** auf EN ziehen (The Protocol / Half-Life / Parallax / The Policy / Overflight),
  Serie „The File of the Present" — mit Vorsicht bei test-geschützten Protokoll-Strings
  (`_drafts/12`).
- **Parallaxe „acht Sprachversionen"** an die Pipeline (12) angleichen **oder** Zahl entfernen.
  *(work-audit/03)*

## 4. Was auf KEINEN Fall live gehen darf
- **Platzhalter-Impressum/-Datenschutz** (`[Vollständiger Name]`, „ENTWURF"). *(harter Blocker)*
- **„Award-caliber"** o. ä. (in `package.json` `description`) — entschärfen. *(R-07)*
- **Consulting-About als Identität** / Footer „Data & AI Engineer — von der Messung bis zur
  Entscheidung". *(R-01/R-06)*
- **JSON-LD** mit reiner Engineering-Disambiguierung. *(R-01)*
- **ZKM-/Festival-/Open-Call-Claim** jeglicher Art. *(strategische Festlegung)*
- **Ungedeckte Claims** („Zufall", „Sensorik", „Interfaces", „neue Wahrnehmungsformen" als
  Ist-Zustand). *(docs/06/12)*
- **Sensible Untersuchung ohne jeden Ethik-Hinweis** (Half-Life, Parallax, The Policy, Leid-/
  Bias-TOPs in The Protocol). *(R-15)*
- **Leere/halbfertige Sektionen** und sichtbare `ZU KLÄREN`/`TODO`/„coming soon"-Strings.

## 5. Go-Live-Blocker (hart, alle müssen erfüllt sein)
1. **Recht:** echtes, geprüftes Impressum + Datenschutz. *(R-13)*
2. **Konsistenz:** About/Footer/JSON-LD/`package.json` entkonsultiert. *(R-01/R-07)*
3. **Research Statement** vorhanden und verlinkt. *(R-02)*
4. **Beruf getrennt:** Engineering-Artikel nicht unter Forschung. *(R-03)*
5. **Ethik-Mindesthinweise** an den vier Untersuchungen. *(R-15)*
6. **Keine Platzhalter / keine leeren Sektionen** im gebauten Output.
7. **Tests/Build grün** (`npm run test`, `check`, `build`; `pytest -q`) nach allen Änderungen.

## 6. Nicht-Blocker (dürfen nach Go-Live folgen)
OG-Bilder; `/experiments`-Index; weitere Notes; URL-Vereinheitlichung über das Nötigste
hinaus; dbt-Lineage; Druck/Sonifikation; Validierungsschicht Parallaxe (siehe `09`).

## 7. Offene Entscheidungen (ZU KLÄREN)
- Wie viel **Biografie** auf `/about` (frühere Runde: „komplett raus"; diese Runde: Person
  sichtbar + frühere Forschung als ZU KLÄREN-Platzhalter) — siehe `04`/`05`.
- Beruf-Routenname (`/work` vs. `/projects`) — siehe `07`.
- „Die Police" vs. Route `praemie`; Serientitel „The File of the Present" final.
- Go-Live-Modus (leise vs. Launch).
