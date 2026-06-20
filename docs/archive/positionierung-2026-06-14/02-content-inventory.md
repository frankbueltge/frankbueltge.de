# 02 — Inhaltsinventar

> Vollständiges Inventar aller Inhaltsflächen mit wörtlich zitierten Kerntexten
> (Stand 2026-06-14). Zweck: belastbare Grundlage für die Audits in 03–05.
> Legende der Register-Spalte: **F** = Forschung/Werk · **E** = Engineering/Consulting · **N** = neutral/funktional.

## 1. Identität & globale Strings

### `src/lib/site.ts` (Single Source of Truth)
- Name: **Frank Bültge** (alternateName „Frank Bueltge")
- Rolle: **„Data Engineering & Artistic Research"** (DE = EN) — Register **F/E gemischt**
- E-Mail: `hello@frankbueltge.de`
- Profile (Person.sameAs): LinkedIn `/in/frankbueltge/`, GitHub `frankbueltge`,
  Instagram `frankbueltge` (laut Kommentar „leer → nur Schema")
- Projekte: data-snack.com, datavism.org (+ data-snack-Markenkanäle separat)

### `src/i18n/ui.ts` (UI-Labels, DE/EN)
Auswahl der positionierungsrelevanten Strings (wörtlich):

| Key | DE | Register |
|---|---|---|
| `meta.home.title` | „Frank Bültge — Data Engineering & Artistic Research" | F/E |
| `meta.home.desc` | „… Die Akte der Gegenwart: praxisbasierte Untersuchungen an der Schnittstelle von Daten, Wissenschaft und Gesellschaft." | F |
| `hero.roleLead` / `…Rest` | „Data Engineering & Artistic Research" / „ — praxisbasierte Forschung in und durch die Künste." | F |
| `home.beruflich` / `…Lead` | „Beruflich" / „Data & AI Engineering — von der Messung bis zur Entscheidung." | E (bewusst) |
| `werke.title` / `…kicker` | „Die Akte der Gegenwart" / „Untersuchungen" | F |
| `werke.sub` | „… Messinstrumente, keine Visualisierungen." | F |
| `lab.sub` | „Praxisbasierte Forschung in und durch die Künste — Untersuchungen, Daten-Stories und Analysen. Gebaut, um zu zeigen, nicht nur zu beschreiben." | F |
| `work.sub` | „Berufliches und eigene Experimente an der Schnittstelle von Daten, KI und Bildung." | E |
| `footer.tagline` | **„Data & AI Engineer — von der Messung bis zur Entscheidung."** | **E (nicht angeglichen)** |
| `contact.body` | „Erreichbar per E-Mail oder auf LinkedIn. Für Projekte, Austausch oder einfach eine gute Frage zu Daten." | N |

**Beobachtung:** `werke.sub` bündelt die Haltung der Reihe knapp —
*„Messinstrumente, keine Visualisierungen."* Das ist die Formulierung, die der gewünschten
Positionierung am nächsten kommt.

**Mögliche Altlasten/Orphans in `ui.ts`:** Schlüssel der Gruppe `dash.*`
(z. B. `dash.gdm` „Zur GDM-Übersicht", `dash.selectedWork`, `dash.featured`) und
`system.operational` stammen aus dem alten Dashboard-Layout. **ZU KLÄREN:** ob noch
referenziert; sonst entfernen (siehe 05).

## 2. Startseite (`/`)

Aufbau (aus `Home.astro`):
1. **Hero**: Großer Name „Frank Bültge" über generativer Ridgeline; Unterzeile
   „**Data Engineering & Artistic Research** — praxisbasierte Forschung in und durch die
   Künste." Live-Punkt + „live".
2. **Protokoll-Teaser**: aktueller Tagesauszug.
3. **WerkeStrip**: „Untersuchungen · Die Akte der Gegenwart" — Registerleiste der live-Werke.
4. **Beruflich**: „Data & AI Engineering — von der Messung bis zur Entscheidung." + Liste
   der Berufsprojekte + Link „Engineering-Notizen im Lab".

Register: oben **F**, unten bewusst **E**. Die Trennung „Forschung zuerst, Beruf eingedampft"
ist erkennbar gewollt und funktioniert auf der Startseite besser als auf `/about` (siehe 03).

## 3. Über-Seite (`/about`) — `src/data/about.ts`

**Wörtlich (DE):**
- metaTitle: **„Über Frank Bültge — Data & AI Engineer"**
- metaDesc: „Frank Bültge ist Data & AI Engineer: Analytics Engineering, Tag Management,
  BigQuery & dbt, KI und Daten-Storytelling. Macher von data-snack.com und datavism.org."
- lede: **„Data & AI Engineer. Ich verwandle Rohdaten in Data Products, Entscheidungen,
  Insights und Geschichten."**
- Abschnitte: „Wer ich bin" / „Woran ich arbeite" / „Schwerpunkte" — durchgängig
  Analytics-, Tracking-, BigQuery-, dbt-, GTM-, DSGVO-, Storytelling-Sprache.

→ **Register: vollständig E.** Die About-Seite ist die **am stärksten unangeglichene**
Fläche: Sie beschreibt einen Analytics-/AI-Engineer; von Artistic Research, „Akte der
Gegenwart" oder den vier Untersuchungen ist **kein Wort** zu lesen. Detailbewertung in 03.

## 4. Sektion „Lab" (`/lab`) — `LabIndex.astro`

Überschrift „Lab" + Unterzeile „Praxisbasierte Forschung in und durch die Künste …".
Zwei Blöcke:

### 4.1 Block „Untersuchungen · Die Akte der Gegenwart" (`src/data/werke.ts`)
Vier live-Einträge (wörtliche Subtitles):

| Werk | Subtitle DE | Status |
|---|---|---|
| **Das Protokoll** | „Die Sitzung der Welt ist eröffnet" | live |
| **Halbwertszeit** | „Über den Zerfall der Anteilnahme" | live |
| **Parallaxe** | „Was jede Sprache verschweigt" | live |
| **Die Police** | „Was die Apokalypse kostet" | live |

`GEPLANT: []` — keine angekündigten weiteren Werke.
Kommentar in `werke.ts`: Überflug wurde am 2026-06-12 „aus der Reihe genommen
(keine These, keine Akkumulation — fällt durch das Substanz-Gate)".
→ Register **F**, durchgängig stark.

### 4.2 Block „Studien & Daten-Stories" (Content Collection `lab`)
Drei veröffentlichte MDX-Beiträge:

| Slug | Titel | Datum | Register |
|---|---|---|---|
| `bigquery-dbt` | „Analytics Engineering: BigQuery und dbt als Fundament" | 2026-05-26 | **E** |
| `server-side-tagging` | „Server-side Tagging: warum der Umzug auf den Server sich lohnt" | 2026-05-12 | **E** |
| `ueberflug-studie` | „Studie: Überflug" (mit interaktiver SGP4-Insel) | 2026-06-12 | F (selbstkritisch) |

**Wichtiger Befund:** Zwei der drei „Studien" sind reine **Analytics-Consulting-Artikel**
(portiert aus dem alten Blog). Sie stehen unter der Überschrift „Praxisbasierte Forschung
in und durch die Künste". Das ist ein **Register-Bruch innerhalb derselben Liste** (siehe 03/05).
`bigquery-dbt` und `server-side-tagging` haben **kein** `draft: true` → sie sind live.

Die Überflug-Studie dagegen ist vorbildlich gerahmt: „eine technische Etüde, kein
Kunstwerk", mit offener Frage, wann daraus ein Werk werden könnte. Sie zeigt, wie man
Engineering-Handwerk ehrlich als Studie ausweist.

## 5. Werke — Methodenblätter & Einzelseiten

- Einzelseiten: `/protokoll` (+ `/archiv`, `/[datum]`, `/feed.xml`), `/halbwertszeit`,
  `/parallaxe`, `/praemie`.
- Methodenblätter: `pages/Methodenblatt{Protokoll,Halbwertszeit,Parallaxe,Praemie}.astro`,
  erreichbar über `/werke/<id>`.
- Inhalt (aus Specs): Quellen + Lizenzen, Abrufkadenz, Verarbeitung/Code-Link,
  Grenzen der Methode, Compute-Fußabdruck, Änderungsprotokoll (standardisiertes Schema).
- **Echtes Protokoll-Output** (Beispiel `2026-06-14.json`) bestätigt die Substanz:
  13 Einträge, je mit `source{name,url,license}`, `status`, `value`, `as_of`. Beispiel:
  `co2` 427.76 ppm (NOAA Mauna Loa), `fires` mit `status:"implausible"` (Wert 0 →
  ehrlich als unplausibel markiert), `attention` „Folarin Balogun" (meistgelesener
  Wikipedia-Artikel). → **Fehler-als-Form funktioniert real.**

→ Register **F**, hohe handwerkliche Qualität. Dies ist der Kern-Aktivposten der Site.

## 6. Berufsprojekte (`/work`) — `src/data/projects.ts`

| Slug | Name | Jahr | Status | Tagline DE |
|---|---|---|---|---|
| `data-snack` | data-snack.com | 2023 | Aktiv | „Daten zum Anbeißen — interaktive Mini-Experimente." |
| `datavism` | datavism.org | 2024 | In Entwicklung | „Data Activism als Erlebnis — mit dem KI-Agenten GHOST." |

Mit Rolle „Eigenprojekt · Konzept & Entwicklung", Highlights, Tech-Stacks und (bei
data-snack) Markenkanälen. Register **E/N** — sauber, ohne Übertreibung. Sinnvoll als
„Beruflich/Projekte" abgegrenzt; nicht mit der Werkreihe zu vermischen.

## 7. Kontakt (`/contact`)
Kurz, funktional: E-Mail + LinkedIn, „Für Projekte, Austausch oder einfach eine gute
Frage zu Daten." Register **N**. Unauffällig.

## 8. Recht (`/impressum`, `/datenschutz`) — `src/data/legal.ts`
- **Beide sind Platzhalter/Entwurf.** Impressum: „ENTWURF: Platzhalter — vor
  Veröffentlichung durch echte Daten ersetzen und rechtlich prüfen lassen." Felder
  `[Vollständiger Name]`, `[Straße und Hausnummer]`, `[PLZ und Ort]`, `[Land]`.
- Datenschutz: korrekt beschrieben (Vercel-Hosting, self-hosted Fonts, kein Tracking),
  aber „rechtlich zu prüfen, bevor sie live geht".
- → **Veröffentlichungs-Blocker.** Keine echten personenbezogenen Daten im Repo — es wurde
  **nichts erfunden**; vor Go-Live muss Frank reale Angaben einsetzen (siehe 05/11/15).

## 9. Medien / Assets
- `public/favicon.svg`, `public/robots.txt` — das war's an öffentlichen Assets.
- **Keine** Fotos, Werkabbildungen, Porträts, OG-Images im `public/`. OG nutzt
  `summary_large_image`, aber es ist **kein** `og:image` gesetzt → Vorschaubilder fehlen.
- Schriften self-hosted (JetBrains Mono, Space Grotesk).
- Im Repo-Root: Verifikations-PNGs (`step*.png`) — keine Inhalte.
- → **Bildwelt = praktisch leer.** Für eine Kunst-/Forschungsseite ist das eine bewusste,
  reduktive Entscheidung, aber ein offener Punkt (OG-Images, Werk-Dokufotos). ZU KLÄREN.

## 10. Inhaltliche Lücken (Überblick; vertieft in 03/05)
- **Kein Research Statement / keine Haltungsseite** außer der E-lastigen About-Seite.
- **Keine Methoden-/Über-die-Reihe-Seite** für Außenstehende (Substanz-Gate ist intern).
- **Keine Biografie** im Sinne von Werdegang/Hintergrund (frühere künstlerische Forschung,
  Masterarbeit, 25-jährige Pause sind nirgends erwähnt).
- **Keine Bildebene.**
- **Recht unfertig.**

## 11. Zusammenfassung des Registers (Ist-Zustand)

| Fläche | Register | Reife |
|---|---|---|
| Werke / Untersuchungen / Methodenblätter / Protokoll-Output | **F** | hoch |
| Startseite (oben) / Lab-Intro / werke.sub | **F** | hoch |
| Startseite „Beruflich" / Projekte | **E** (bewusst) | ok |
| **About-Seite** | **E** | **unangeglichen** |
| **Footer-Tagline, JSON-LD disambiguation/knowsAbout, package.json** | **E** | **unangeglichen** |
| Zwei Lab-„Studien" (BigQuery/dbt, Server-side Tagging) | **E** | Register-Bruch im F-Kontext |
| Recht | N | Entwurf |
| Bildwelt | — | fehlt |

Kernsatz: **Die Substanz (Werke) trägt die Forschungs-Positionierung bereits; die
Selbstbeschreibung (About/Footer/Schema) und ein Teil der Lab-Inhalte ziehen noch in die
alte Engineering-Richtung.** Das ist der Hebel für 03–06.
