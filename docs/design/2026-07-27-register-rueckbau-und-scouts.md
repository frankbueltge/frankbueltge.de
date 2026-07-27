# Dataset Register — Rückbau und Scouts

**Datum:** 2026-07-27 (abends) · **Status:** ENTSCHEIDUNG (Frank) — Umsetzung offen
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

**Offen (Frank entscheidet):**
- Wie tief der Rückbau geht und was der Anfangsbestand ist
- Ob das Register auf `frankbueltge.de` bleibt oder auf eine Subdomain zieht
- Ob die jetzigen Unterseiten bis dahin `noindex` bekommen (siehe §8)

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
