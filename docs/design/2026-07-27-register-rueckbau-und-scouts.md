# Dataset Register — Rückbau und Scouts

**Datum:** 2026-07-27 (abends) · **Status:** ENTSCHIEDEN und **Rückbau umgesetzt** (§6, §11);
die Scouts stehen aus
**Geht vor:** `2026-07-27-register-neufassung.md` (vom selben Tag, vormittags).
Die Neufassung bleibt als Beleg stehen, ist aber in ihrem Kernpunkt überholt: Sie
definierte ein Relevanzkriterium aus Stichwörtern. Das trägt nicht (§3).

## 1. Die Entscheidung

Das Register wird **hart zurückgebaut** auf wirklich relevante Daten und wächst
danach **dynamisch**: durch **Scouts, die täglich recherchieren — im Hinblick auf die
Forschung der Praxen**, für Datensätze *und* relevante Paper. Das Gesammelte ist
Ergänzung und Erweiterung zu dem Material, auf das die Praxen in ihrer eigenen
Forschung ohnehin stoßen.

Damit dreht sich die Richtung um. Bisher: sammeln, was existiert, und hoffen, dass
etwas Brauchbares dabei ist. Künftig: von der Forschung her sammeln.

## 2. Was das Register heute ist (Stand 2026-07-27, live)

| | |
|---|---:|
| Bestand (Snapshot der Praxen) | 22.473 Einträge |
| davon Kernbestand (= auf der Website) | 16.516 |
| Unterseiten live | **8.590** (6.168 Werk-Seiten + 2.422 Eintragsseiten) |
| Sitemap-URLs gesamt | 8.714 |
| Zugriffswege per HTTP bestätigt | 396 |
| jüngstes Release | `snapshot-2026-07-27c` |

Herkunft: 99,9 % DataCite (Public Data File, 56.620.404 Datensätze gelesen), 12 ArcGIS.

## 3. Warum der Rückbau: das Kriterium misst das Falsche

Stichprobe von 26 zufälligen Kernbestand-Einträgen, gegen das Kriterium der
Neufassung geprüft: **rund 5 passen, rund 14 nicht**, der Rest ist Grenzland.

Die Ursache ist präzise: **Ein Stichwort im Titel bezeichnet oft eine ROLLE, keinen
GEGENSTAND.** „Training data for MaxQuant" heißt, dass diese Proteomik-Daten ein
Modell trainiert haben — nicht, dass der Datensatz von KI handelt. Dasselbe bei
„neural network", „surveillance", „census". Ein Stichwortsieb kann Rolle und
Gegenstand nicht unterscheiden; es misst Wortvorkommen und tut, als messe es Relevanz.

**Der zweite Fehler war eine veraltete Karte.** Das Kriterium kennt nur die
machtnahen Themen. Der Atlas of Data Art wurde aber am **25.07. um die Felder 8–13
erweitert** — „knowing" und „expression" neben „power" (`AtlasPage.astro`, `CLUSTER`).
Einträge wie Stechmücken-Überwachung (→ more-than-human / Wahrnehmung & Maßstab),
Schlafstudien (→ Körper & Intimität) oder Gletscherseismik (→ Material & Sinne) sind
für DIESE Site keine Fremdthemen. Sie fielen nur durch ein Kriterium, das die
Erweiterung nie bekommen hat.

**Wer die Themen beurteilt, liest zuerst `src/components/pages/AtlasPage.astro`
(`CLUSTER`, `FAMILIE`) — nicht die Design-Notiz vom Vormittag.**

**Nachgemessen bei der Umsetzung (27.07., abends): die Schnittmenge ist null.**
Gegen die 16.507 DOIs im Register wurden alle DOIs gehalten, die die vier Engine-Repos
(`ulysses`, `field-research`, `studio`, `meridian-runtime`) je zitiert haben — 89
eindeutige. **Überschneidung: 0.** Kein einziger Registereintrag ist etwas, wonach je
eine Praxis gegriffen hat.

Ehrlich dazu: Ein Teil davon ist strukturell — die Praxen zitieren überwiegend *Paper*,
das Register hielt *Datensätze*; die Null ist also nicht allein ein Relevanzversagen.
Der Schluss überlebt das trotzdem: Dieser Bestand hat der Forschung, für die er gebaut
wurde, kein einziges Mal gedient. (Zugleich ist es das Argument für Franks zweiten
Katalog: Was die Praxen tatsächlich brauchen, sind zu großen Teilen Paper.)

## 4. Das Vorbild steht schon im Repo — zweimal

| | Muster | Umfang | Felder |
|---|---|---:|---|
| `src/data/atlas/werke.json` | **Scout**: systematische Vermessung eines Feldes, Quelle je Eintrag geprüft, 13 Cluster in 3 Familien | 448 | title, artist, year, clusters, decisive_move, source_url, verify_status |
| `src/data/atelier/atlas.json` | **Praxis-Sammlung** (Ulysses): was die Praxis tatsächlich benutzt hat | 98 | author, work, year, type, url, tags, summary, **relevance** |

Beide sind Listen mit Kurzbeschreibung und Direktlink — **keine Unterseite je Eintrag.**
Das war von Anfang an die gewünschte Struktur; die Unterseiten des Registers waren ein
Missverständnis.

Entscheidend ist Ulysses' Feld **`relevance`**: ein Satz, der sagt, WARUM der Eintrag
für diese Praxis zählt. Er lässt sich nicht per Stichwort erzeugen.

> Ein Sammelverfahren, das beliebig skaliert, ist kein Kuratieren. Dass es auf 16.516
> skalieren konnte, ist der Beweis: Es musste keinen einzigen Eintrag begründen.

## 5. Der Einstieg, den Frank vorgeschlagen hat

**Bei dem anfangen, was die Praxen ohnehin zitieren.** Diese Einträge tragen ihre
Begründung schon, weil jemand sie benutzt hat — der Weg herum um das Problem aus §3.
Ulysses' 98 Einträge sind der Anfangsbestand, nicht 16.516 zu filternde.

## 6. Was bleibt und was geht

**Bleibt** (technisch geprüft, funktioniert):
- Identitätsmodell, Dedup R1–R4, Werk-Ebene, Schema, Snapshot-Vertrag
- Prüfstand mit Drossel je Host, `robots.txt`, Rückzug bei 429 — sauber und höflich
- Ablehnungsregister, Ausfallvermerke, Manifest-Ehrlichkeit
- Die Ernte-Adapter

**Geht:**
- Das Stichwort-Sieb als Relevanzkriterium (`pipeline/kernbestand.py`)
- Der größte Teil des Bestands
- Sehr wahrscheinlich die 8.590 Unterseiten — die Zielstruktur ist eine Liste

**Entschieden (Frank, 2026-07-27 abends):**
- **Auf Null.** Nicht gefiltert, nicht beschnitten — der Bestand der Website geht auf 0,
  alle Unterseiten fallen weg. Der Neuaufbau muss einen belegbaren Bezug zur Forschung
  der research ecology haben.
- **Bleibt auf `frankbueltge.de`.** Nach dem Rückbau ist es eine kuratierte Liste, kein
  Massenbestand — die Subdomain war nur als Brandmauer gegen dieses Problem erwogen.
- **Rückbau zuerst, Scouts danach.** Damit ist `noindex` gegenstandslos: Die Seiten sind
  weg, statt unbegründet weiterzustehen.
- **Zwei Kataloge**, nicht einer: Die Scouts sehen zuerst, woran die Praxen forschen, und
  suchen von dort aus — **Datensätze** ins Register, **Paper** in einen eigenen Katalog.

## 7. Rechtslage (geprüft 2026-07-27, gilt weiter)

- **DataCite: CC0**, ausdrücklich inklusive **Datenbankrechte**. Deckt Speichern,
  Weiterveröffentlichen und Beschreibungen im Wortlaut.
- **Nicht gedeckt:** „rights of individuals featured in the data" — die **20.082 Namen
  und 15.240 ORCID-Kennungen** sind eigene Verantwortung, abgedeckt über die
  Datenschutzerklärung (Art.-21-Widerspruch, Entfernungsweg, Archiv-Hinweis inkl.
  Versionsgeschichte der Repos).
- **Nicht gedeckt:** die verlinkten Ressourcen selbst. Das Register verweist nur.
- DataCite **bittet** um Namensnennung (Community-Norm) — steht auf `/datasets`.
- Kaggle bleibt zurückgehalten; Messrohdaten am 27.07. entfernt.

## 8. SEO/GEO — belegter Stand, nicht Vermutung

- Googles Politiken zu *scraped content*, *scaled content abuse* und *site reputation
  abuse* sind **absichtsbasiert** („primary purpose of manipulating search rankings").
  Danach liegt hier keine Verletzung vor. **Eine Abstrafung ist unwahrscheinlich.**
- **Crawl-Budget:** Googles Leitfaden gilt ab 1 Mio. Seiten bzw. 10.000+ mit täglichen
  Änderungen. 8.590 liegen darunter.
- **404er:** Google empfiehlt 404/410 für dauerhaft entfernte Seiten ausdrücklich. Die
  **12.913 URLs**, die durch den Wegfall der Fassungsseiten 404 liefern, sind damit
  regelkonform behandelt (Standzeit war rund ein Tag).
- **Aber:** DataCite selbst sperrt Robots per `robots.txt` von seinen Datensatzseiten
  aus und verweist auf die APIs; OpenAlex hat keine serverseitigen Einzelseiten; Google
  Dataset Search liest die Auszeichnung *anderer* Seiten, statt eigene zu bauen.
  **Kein großer Katalog veröffentlicht Einzelseiten für den Index.**
- Der belastbare Test ist die **Search Console** („Gefunden – zurzeit nicht
  indexiert"), nicht eine weitere Einschätzung.

## 9. Fallen, die diese Sitzung gestellt hat

Damit sie nicht neu aufgestellt werden:

1. **Cloudflare Pages nimmt 20.000 Dateien je Deployment.** Der erste Deploy scheiterte
   bei 22.857.
2. **`src/data/datasets/` ist gitignoriert.** Die Site holt die Daten beim Bauen aus dem
   jüngsten `snapshot-*`-Release (`scripts/hole-dataset-daten.mjs`). Eine neue
   Datendatei muss in `baue_snapshot.py` UND in `DATEIEN` des Abrufskripts stehen —
   sonst bricht der Build hart ab (bewusst, kein stiller Notlauf).
3. **Der nächtliche Lauf holt seine Rohernten aus dem jüngsten Release.** Ein manuell
   veröffentlichtes Release ohne die Ernten des Tages lässt sie dauerhaft aus allen
   künftigen Bauten fallen. Am 27.07. um Haaresbreite passiert.
4. **Ein veröffentlichter Snapshot-Tag wird nicht überschrieben.** Zweiter Bau am selben
   Tag bekommt ein Suffix (`baue_snapshot.py --tag`).
5. **HTTP 202 ist keine Zugriffsbestätigung.** Die figshare-Familie antwortet
   automatisierten Anfragen so, auf HEAD wie auf GET. Bestätigt sind nur 200/203/206.
6. **Prüfstand-Drossel gilt je Host**, nie global: 44,2 % aller Zugriffswege zeigen auf
   zenodo.org.
7. **DataCite-Listenfelder können Zeichenketten statt Objekte enthalten**
   (`nameIdentifiers`) — `normalisiere._objekte()` fängt das ab.
8. **Nur 80,7 % der Zugriffswege sind überhaupt bestätigbar** — 15,9 % figshare-202,
   1,7 % durch `robots.txt` untersagt, 0,8 % 403.

## 10. Arbeitsweise (die eigentliche Lehre)

Die Fehler dieser Sitzung hatten ein gemeinsames Muster: **Schlüsse wurden
ausgesprochen, bevor sie gemessen waren** — ein größenabhängiges Maß aus zu kleiner
Stichprobe, ein „Zitationsgraph", der zu 99,4 % Versionsverkettung war, ein „nicht die
Zeit" nach einem einzigen Wiederholungsversuch.

Gefunden wurden sie jedes Mal erst beim Nachmessen. Die Reihenfolge ist **messen →
schließen → sagen**, nicht sagen → messen → korrigieren. Und: kleinere Schritte, mehr
Halt dazwischen. Der Umfang dieser Sitzung war selbst eine Fehlerquelle.

## 11. Der Rückbau, wie er ausgeführt wurde (2026-07-27, abends)

Gemessen am gebauten `dist/`, nicht geschätzt:

| | vorher | nachher |
|---|---:|---:|
| Dateien im Deployment | 8.883 | **292** |
| Registerseiten | 8.590 | **1** (`/datasets`) |
| Sitemap-URLs | 8.714 | **124** |
| Registerdaten beim Bauen | 14 MB aus einem fremden Release | committet, 2 Bytes (`[]`) |

**Was entfiel**

- `src/pages/datasets/[id].astro`, `src/pages/datasets/work/[id].astro` und die beiden
  Detail-Komponenten — die alten URLs liefern jetzt 404, was Google für dauerhaft
  entfernte Seiten ausdrücklich empfiehlt (§8). Standzeit rund ein Tag.
- `scripts/hole-dataset-daten.mjs` samt der Hooks `prebuild`/`precheck`/`pretest`. Damit
  auch der `GITHUB_TOKEN` in `deploy-cf.yml` und der `repository_dispatch`-Trigger
  `dataset-snapshot` nebst Rückfall-Cron: **Der Bau greift auf kein fremdes Repo mehr zu.**
- Der Sitemap-Filter für die abgeleiteten Fassungsseiten in `astro.config.mjs` — es gibt
  nichts mehr zu filtern.
- `src/lib/datasets.ts` (Kernbestand, Prüfstand, Werk-Ebene, Feldkürzel).

**Was entstand**

- `src/data/register/datasets.json` — `[]`. Committet, wie `src/data/atlas/werke.json`:
  Kuratiert heißt klein genug fürs Repo. Die Gitignore-Regel für `src/data/datasets/`
  bleibt stehen, damit der alte 45-MB-Abzug nicht versehentlich hineinrutscht.
- `src/lib/register.ts` — der neue Typ. **`relevance` ist Pflichtfeld:** Ein Eintrag kann
  nicht existieren, ohne zu sagen, warum er zählt. Das ist §4 in Codeform und die einzige
  Schranke, die gegen unbegrenztes Sammeln wirkt.
- `/datasets` als datierte Rückbau-Auskunft statt als leere Fläche (Aktualitäts-Regel:
  Überholtes wird sichtbar und datiert archiviert, nie unauffällig stehen gelassen).

**Nachgezogen, weil sonst unwahr:** die Katalogkarte in `src/config/naming.ts` (versprach
Snapshot-Abfragbarkeit) und beide Fassungen des Datenschutz-Abschnitts in
`src/data/legal.ts` — die 20.082 Namen und 15.240 ORCID-Kennungen sind von dieser Domain
entfernt; der Hinweis auf die fortbestehenden Archivstände im `dataset-hub` und der
Art.-21-Weg bleiben, gelten dort aber jetzt ausdrücklich auch für das Archiv.

## 12. Was als Nächstes zu bauen ist

**Der Scout existiert bereits** — `pipelines/atlas-scout/` mit `atlas-scout.yml`,
nächtlich, schlüsselfrei über OpenAlex. Er bringt alles mit, was §1 verlangt:

| gefordert | vorhanden in `atlas_scout/model.py` |
|---|---|
| Kandidat trägt seine Herkunft | `Herkunft` (Quelle, Abfrage, Abrufzeit) |
| Identifier geprüft | `Pruefung` (HTTP-Status, geprüftes Ziel, Vermerk) |
| Ablehnungsregister | `Verworfen` (mit Grund) |
| Ausfälle vermerken | `Ausfall` |
| Begründung als Vorschlag, nie Behauptung | `Annotation.relevanz_vorschlag` + `prompt_sha256` |
| aktuelle Themenkarte | `themen.py` — Felder 1–13 **inkl. der Erweiterung vom 25.07.** |
| genau ein Modul darf schreiben | `aufnahme.py`, per AST-Test erzwungen |

Der Register-Scout ist deshalb **kein Neubau, sondern ein dritter Atlas** neben `theorie`
und `werke` (`model.py`, `ATLAS_*`) — der Paper-Katalog ein vierter. Zu bauen bleibt:

1. Ein Saatgut-Schritt, der **aus den Praxen liest**, statt aus einer Themenliste: woran
   arbeiten `ulysses`, `field-research`, `studio` gerade? Das ist der Punkt, an dem sich
   die Richtung tatsächlich umdreht (§1) — alles andere ist schon da.
2. Quellen für Datensätze (DataCite/Zenodo **gezielt abgefragt**, nicht als Bulk) und für
   Paper (OpenAlex, arXiv).
3. Der Paper-Katalog als eigene Fläche, sobald er etwas zu zeigen hat.

**Warum der Scout bei 448 landete und das Register bei 16.516:** Der Scout muss jeden
Kandidaten gegen ein Feld punkten und den Identifier auflösen, bevor er aufnimmt —
`punkte_begruendung` ist Pflichtfeld. Das Register hatte kein Feld, gegen das es punkten
musste. Ein Sieb ohne Begründungspflicht skaliert unbegrenzt; das ist keine Eigenschaft
der Datenmenge, sondern des Verfahrens.
