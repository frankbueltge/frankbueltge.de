# Dataset-Hub — Architektur-Design

**Datum:** 2026-07-26 · **Status:** ENTWURF ZUR ABNAHME (Frank) — offene Entscheidungen in §8
**Auftrag:** `docs/research/2026-07-26-dataset-hub-startauftrag.md` (Bauregeln dort sind verbindlich)
**Vorab-Messung:** §3.2, Stichprobe vom 2026-07-26 — alle Zahlen tatsächlich abgefragt, keine geschätzt

Ziel: der größte maschinenlesbare Nachweis öffentlich zugänglicher Datensätze, der sich mit
vertretbarem Aufwand halten lässt. Zwei gleichrangige Nutzungen: Hub für Forschende
(auffindbar, filterbar, zitierbar) und abfragbare Grundlage der research ecology
(versioniertes Snapshot-Format statt Neurecherche je Frage). Fortlaufende Selbsterweiterung
ohne menschliche Sichtung, über harte Schranken.

Reihenfolge der vier Entscheidungen hier: **Identität (§1) → Grenze (§2) → Schema/Zugang (§4)
→ Quellen (§3)** — Identität und Grenze definieren das Schema; die Quellenliste ist ohnehin
durch das Messgebot gegatet und wurde vorab stichprobenhaft vermessen, damit die
Skalenentscheidungen auf Zahlen stehen statt auf Annahmen.

---

## 1. Entscheidung 1 — Was ist ein Eintrag (Identität)

### 1.1 Drei Ebenen

Die Frage „ist das dasselbe Ding?" hat je nach Fragesteller drei verschiedene richtige
Antworten. Deshalb drei Ebenen, jede mit eigener Identität:

| Ebene | Was sie ist | Identität | Beispiel |
|---|---|---|---|
| **Fundstelle** (record) | Ein Eintrag in einem Quellkatalog, wörtlich, unveränderlich | (Quelle, Quell-ID) | Der Zenodo-Record 10.5281/zenodo.123457 |
| **Fassung** (version) | Eine konkrete versionierte Veröffentlichung | Version-PID bzw. aufgelöster Endpunkt | v2 des Datensatzes, egal ob via Zenodo oder DataCite gefunden |
| **Datensatz** (work) | Die intellektuelle Einheit über Versionen hinweg | eigene Hub-ID | „der Datensatz", den eine Forscherin zitieren will |

Begründung: Das entspricht der Praxis der Quellen selbst (Zenodo: `conceptdoi` ↔
Version-DOI; DataCite: `relatedIdentifiers` mit `IsVersionOf`/`HasVersion`) und der
bibliothekarischen Work/Expression-Unterscheidung. Aggregator-Dubletten kollabieren auf
Fassungsebene, Versionen auf Werkebene — ohne dass Herkunftsinformation verloren geht.

**Fundstellen sind unantastbar.** Jede Ernte schreibt Fundstellen mit vollständiger Herkunft
(Quelle, Quell-ID, Erntezeitpunkt, Adapterversion, Rohmetadaten). Sie werden nie editiert
und nie gelöscht; zieht die Quelle einen Record zurück, wird die Fundstelle als
`withdrawn_at_source` markiert, mit Datum. Das Archiv lügt nicht.

**Fassung und Datensatz sind abgeleitet.** Sie werden deterministisch aus (Fundstellen +
Entscheidungsjournal) gebaut und sind jederzeit reproduzierbar. Eine falsche
Zusammenführung wird zurückgenommen, indem der Journal-Eintrag revertiert und neu gebaut
wird — Versionskontrolle ist die Rücknahme, wörtlich.

### 1.2 Zusammenführungsregeln — deterministisch, in Stufen

Automatisch (Code, keine Modelle) wird NUR über diese Regeln zusammengeführt:

- **R1 — PID-identisch:** gleiche normalisierte PID (DOI: kleingeschrieben, Resolver-Präfix
  entfernt; Handle analog) → gleiche Fassung.
- **R2 — quellen-behauptete Relation:** `IsIdenticalTo` → gleiche Fassung;
  `IsVersionOf`/`HasVersion`/`IsNewVersionOf`/`conceptdoi` → gleicher Datensatz. Nur
  Relationen, die in den Quellmetadaten stehen — nie selbst gefolgert.
- **R3 — identischer aufgelöster Endpunkt:** beide Zugriffswege wurden tatsächlich per HTTP
  aufgelöst und enden (nach Redirects) auf derselben finalen URL mit 2xx → gleiche Fassung.
  Schutz gegen Catch-all-Redirects: R3 greift nicht, wenn die finale URL ein Wurzelpfad
  oder eine je Quelle gemessene Sammel-Fehlerseite ist.
- **R4 — deklarierte Aggregatorkopie:** die Quelle weist die Herkunft selbst aus (CKAN
  `harvest_source`, OpenAIRE `collectedfrom`) und die Quell-ID stimmt → Kopie-Vermerk an
  der bestehenden Fundstelle-Gruppe, kein eigener Datensatz.

Alles unterhalb dieser Schwelle — insbesondere Titel-/Urheber-Ähnlichkeit — führt **nie**
automatisch zusammen. Deterministisch erzeugte Kandidaten (normalisierter Titel exakt
gleich UND mindestens ein gemeinsamer Urheber oder gleicher Herausgeber) landen in einer
Kandidatenqueue für die Urteilsroutine (§3.4). Jeder Urteils-Merge wird als Ereignis
protokolliert (wann, auf welcher Evidenz) und ist revertierbar.

### 1.3 Granularität

Vokabular: DCAT. Ein **Eintrag ist, was die Quelle als Katalogeintrag führt**, mit
explizitem Feld `granularity`: `collection` | `dataset` | `file` | `service`.
Einzeldateien/Formate eines Eintrags sind **Distributionen** (Eigenschaften, keine
Einträge). Sammlungen tragen `hasPart`-Relationen nur, wenn die Quelle sie behauptet.
API-Endpunkte (z. B. SDMX-Dataflows der Statistikämter) sind Einträge mit
`granularity: service`. Wir normalisieren Granularität nicht um — wir machen sie sichtbar
und filterbar.

### 1.4 IDs

Eigene, opake, stabile Hub-IDs für Datensätze und Fassungen (extern vergebene PIDs sind
weder universell — viele CKAN-Einträge haben keinen DOI — noch eindeutig je Werk). IDs
werden nie wiederverwendet; ein Merge hinterlässt eine Weiterleitung von der
aufgegebenen auf die bleibende ID.

---

## 2. Entscheidung 2 — Die Grenze „öffentlich verfügbar"

### 2.1 Zugangsstufen (im Schema, nicht implizit)

Feld `access.tier`, angelehnt an COAR/DCAT accessRights:

| Stufe | Bedeutung | Aufgenommen? |
|---|---|---|
| `open` | Direkt beziehbar ohne Konto | ja |
| `registration` | Kostenloses Konto/Key erforderlich | ja |
| `request` | Auf Antrag/Datennutzungsvertrag, ohne Bezahlung | ja, als solche markiert |
| `embargoed` | Wird zu genanntem Datum offen | ja, mit Embargo-Datum |
| `purchase` | Nur gegen Bezahlung | **nein** → Ablehnungsregister |
| `closed` / metadata-only | Daten nicht beziehbar | **nein** → Ablehnungsregister |

Begründung der Linie: Der Hub weist nach, was man **tatsächlich bekommen kann, ohne zu
bezahlen**. `request` bleibt drin, weil wesentliche Forschungsdaten (Gesundheits-,
Mikrodaten) nur so existieren — aber sichtbar als eigene Stufe, filterbar. Paywall- und
reine Metadaten-Einträge sind kein Nachweis von Verfügbarkeit, sondern von Existenz; sie
gehören nicht in den Bestand, wohl aber gezählt ins Ablehnungsregister.

### 2.2 Geprüfter Zugriffsweg — Status statt Behauptung

Jeder Eintrag trägt seinen Zugriffsweg **wörtlich aus der Quelle** (nie konstruiert) plus
den Prüfstand: `access.verified` (`none` | `landing` | `download`), Prüfdatum, HTTP-Status,
finale URL nach Redirects.

**Skalenkonflikt, explizit entschieden:** Bei 10⁷⁺ Einträgen (§3.2) kann nicht jede
Aufnahme sofort aufgelöst werden. Die Regel „Identifier prüfen, nicht annehmen" wird
deshalb als **Statuswahrheit** umgesetzt, nicht aufgeweicht: Ein Eintrag behauptet nie
mehr, als geprüft wurde. `verified: none` heißt sichtbar „aufgenommen, Zugriff noch nicht
bestätigt". Die Auflösung läuft als nächtliches Budget (feste Anzahl je Lauf), priorisiert
nach (1) tatsächlicher Abfrage-Nachfrage der Pipelines, (2) Neuheit. Bestätigte Einträge
werden zyklisch nachgeprüft — als Nebenprodukt entsteht eine ehrliche
**Link-Rot-Messung** über den Bestand, selbst Material für die Ökologie.

---

## 3. Entscheidung 3 — Quellen: Kataloge abgrasen, Aggregatoren zuerst

### 3.1 Aggregator-zuerst-Prinzip

Die Vorab-Messung (§3.2) zeigt massive Enthaltensein-Ketten: OpenAIRE aggregiert DataCite;
DataCite deckt Zenodo, Figshare, Dryad und tausende Repositorien; das EU-Portal erntet
data.gouv.fr, GovData und weitere nationale Portale. Konsequenz: **wenige
Aggregator-Adapter tragen den Kern**, die Dedup-Last liegt bei uns (§1). Einzelquellen
bekommen eigene Adapter nur, wenn die Messung zeigt, dass der Aggregator Felder verliert,
die wir brauchen (z. B. Dateilisten, access-rights-Detail). re3data (3.516 Repositorien)
ist keine Datensatzquelle, sondern **Quelle der Quellen**: neue Repositorien werden zu
Messaufträgen, nie direkt zu Adaptern.

### 3.2 Vorab-Messung (Stichprobe, 2026-07-26)

Nur Zähler abgefragt (je 0–1 Records); volle Messung mit Feldabdeckung folgt in Phase 1.
Alle Werte wie von der API zurückgegeben; nichts geschätzt.

| Quelle | Abfrage | Ergebnis |
|---|---|---|
| DataCite | `api.datacite.org/dois?resource-type-id=dataset` | **72.676.151** |
| OpenAIRE | `api.openaire.eu/search/datasets` | **106.128.743** |
| EU Open Data Portal | `data.europa.eu/api/hub/search/search` | 1.799.040 |
| GovData (CKAN) | `www.govdata.de/ckan/api/3/action/package_search` | 154.559 |
| data.gouv.fr | `www.data.gouv.fr/api/1/datasets/` | 73.617 |
| Zenodo | `zenodo.org/api/records?type=dataset` | 663.585 |
| Dryad | `datadryad.org/api/v2/datasets` | 71.594 |
| re3data | `www.re3data.org/api/v1/repositories` | 3.516 Repositorien |
| HuggingFace | `huggingface.co/api/datasets` | kein Zähler in Antwort-Headern gefunden — Messauftrag Phase 1 |
| data.gov | `catalog.data.gov/api/3/action/package_search` | **HTTP 404** (auch `status_show`; strukturierte „Not Found"-JSON) — API umgezogen oder abgeschaltet, Ursache offen, Messauftrag Phase 1 |
| DataCite Public Data File | `datafiles.datacite.org` | Domain erreichbar (HTTP 200) — Dump als Bootstrap-Weg zu vermessen |

**Interpretation:** (1) Die Zähler messen **Fundstellen, nicht Werke** — DataCites 72,6 Mio.
„dataset" enthalten hochgranulare Records (einzelne Messreihen, Zwischenstände); die
Werkzahl entsteht erst durch unsere Identitätsschicht. (2) Die Überlappung
OpenAIRE↔DataCite ist unbekannt und wird in Phase 1 auf einer Stichprobe gemessen.
(3) Größenordnung des Bestands: **10⁷–10⁸ Fundstellen** — das entscheidet §4.3.

### 3.3 Messprotokoll je Quelle — Pflicht vor jedem Adapter

Je Quelle ein protokollierter Messlauf, committet ins Messregister, **bevor** Adapter-Code
entsteht. Pflichtinhalte:

1. **Zähler** und Filterbarkeit auf Datensatz-Typ.
2. **Feldabdeckung** auf Zufallsstichprobe n ≥ 200: Anteil mit Lizenz, Zeitraum,
   Räumlichkeit, Zugriffs-URL, Urheber/Herausgeber.
3. **Maschinenlesbarkeit:** Paginierung (vollständig iterierbar? Deep-Paging-Limits?),
   Rate-Limits, Formatstabilität.
4. **Inkrement-Fähigkeit:** updated-since-Abfrage, OAI-PMH oder Dump — ohne einen dieser
   Wege keine fortlaufende Selbsterweiterung aus dieser Quelle.

**Gate:** Kein Adapter ohne (4) und ohne Zugriffs-URL-Abdeckung über der im
Template festgeschriebenen Schwelle. Ein Nein ist ein gültiges Messergebnis und bleibt im
Register stehen (Atlas-Lehre: zwei Adapter gebaut, bevor gemessen wurde — verlorene Arbeit).

### 3.4 Fortlaufende Selbsterweiterung

- **Nächtliche Ernte** (GitHub Actions, rein deterministisch): inkrementell via
  updated-since/OAI-PMH je Quelle; harte Schranken für Auto-Aufnahme (Titel vorhanden,
  Zugriffs-URL wörtlich vorhanden, Herausgeber oder Urheber vorhanden, Stufe §2.1
  aufnahmefähig). Alles Auto-Aufgenommene ist sichtbar `unverified`.
- **Auflösungs-Budget** je Nacht (§2.2).
- **Urteilsroutine** (geplante Claude-Code-Routine unter dem Abo, Muster Atlas-Scout
  06:00 UTC — **kein Modellaufruf aus der Pipeline, kein API-Guthaben**): arbeitet die
  Kandidatenqueue ab (Merge-Urteile §1.2), prüft Grenzfälle der Zugangsstufe, zieht
  Stichproben aus den Auto-Aufnahmen. Urteile landen als revertierbare
  Journal-Ereignisse in Git.
- **Ausfall-Log:** jeder Lauf vermerkt je Quelle erreicht/nicht erreicht. Ein leerer Lauf
  einer erreichbaren Quelle ist „nichts Neues"; eine nicht erreichbare Quelle ist ein
  Ausfall — die beiden sehen nie gleich aus.

### 3.5 Quellenfamilien und Reihenfolge

| Familie | Quellen | Weg |
|---|---|---|
| Forschungsdaten-Aggregatoren | DataCite (ggf. Dump-Bootstrap + API-Inkremente), OpenAIRE | Kern, Phase 2 |
| Regierungsportale | EU ODP (deckt nationale Portale), CKAN/DKAN-Instanzen als ein generischer Adapter, data.gov nach Klärung | Phase 2–3 |
| ML-Plattformen | HuggingFace, Kaggle | nach Messung, Phase 3 |
| Statistikämter | WorldBank, Eurostat, OECD (SDMX) | eigenes Granularitätsmodell (`service`/Dataflows), eigene Messung, Phase ≥ 3 |
| Direktquellen | Zenodo, Figshare, Dryad u. a. | nur als Anreicherung, falls Messung Feldverlust im Aggregator zeigt |

---

## 4. Entscheidung 4 — Schema und Zugang

### 4.1 Kernschema (DCAT-gemappt)

| Feld | Inhalt | DCAT |
|---|---|---|
| `id`, `granularity` | Hub-ID (§1.4), Ebene (§1.3) | — / Typ |
| `title`, `description` | wörtlich aus Quelle, nie generiert | dct:title / dct:description |
| `creators[]`, `publisher` | Name + ORCID/ROR falls gegeben | dct:creator / dct:publisher |
| `temporal`, `spatial` | Zeitraum; Räumlichkeit wörtlich + Codes falls gegeben | dct:temporal / dct:spatial |
| `license` | SPDX-ID falls sauber mappbar, immer plus Rohstring | dct:license |
| `distributions[]` | Format, Größe, Checksumme, URL — alles wörtlich | dcat:Distribution |
| `access` | tier, url (wörtlich), verified, verified_date, http_status, final_url | dct:accessRights |
| `update_frequency` | wie von Quelle angegeben | dct:accrualPeriodicity |
| `identifiers[]`, `relations[]` | Schema+Wert; nur quellen-behauptete Relationen | dct:identifier / dct:relation |
| `provenance[]` | je Fundstelle: Quelle, Quell-ID, Erntezeit, Adapterversion | dct:provenance |
| `status` | `unverified` \| `verified` \| `flagged` \| `withdrawn` | — |

Fehlt eine Angabe, bleibt das Feld leer — sichtbare Lücke statt plausiblem Falschwert.
Bei aus mehreren Fundstellen gebauten Datensätzen trägt jeder Feldwert seine
Herkunfts-Fundstelle.

### 4.2 Register als erste Klasse

Drei append-only-Register neben dem Bestand: **Ablehnungen** (Quelle, Quell-ID, Grundcode
— `kaufpflichtig`, `geschlossen`, `kein-zugangsweg`, `kein-datensatz`, …), **Ausfälle**
(§3.4), **Messungen** (§3.3). Über Monate sind die Ablehnungen die Messung des Verfahrens
gegen sich selbst.

### 4.3 Speicherung — an den Zahlen entschieden

10⁷–10⁸ Fundstellen (§3.2) passen nicht als Einzel-JSONs in ein Git-Repo; das
Site-Muster „Git ist das Archiv" wird deshalb **aufgeteilt statt aufgegeben**:

- **In Git (klein, menschenlesbar, diff-bar):** Code, Schema (`schema_version`, semver),
  Messregister, Entscheidungsjournal (alle Merge-/Urteils-Ereignisse), Ausfall-Log,
  Registerzusammenfassungen (Zähler), Manifeste aller Snapshots und Rohernten
  (Checksummen, Zähler, Zeitstempel).
- **Als versionierte Release-Assets (groß, maschinell):** Rohernten (komprimiertes JSONL
  je Quelle/Lauf) und Bestands-Snapshots — **SQLite + Parquet**, Tag
  `snapshot-YYYY-MM-DD`. Alles Abgeleitete ist aus Rohernten + Journal reproduzierbar.

### 4.4 Zugang — eine Wahrheit, zwei Türen

**Der Snapshot ist die einzige Quelle beider Nutzungen.**

- **Pipelines (Ökologie):** laden den jüngsten Snapshot (SQLite/Parquet) und fragen lokal
  mit SQL ab. Der Snapshot-Vertrag — Schema, `schema_version`, Manifest — **ist** die
  stabile, versionierte API; Pipelines pinnen die Major-Version. Kein Server nötig, keine
  Verfügbarkeitsabhängigkeit.
- **Menschen:** statische Oberfläche plus kleine Such-API (Cloudflare Worker + D1 — CF ist
  vorhandene Infra), deren Datenbank **aus demselben Snapshot** befüllt wird. Die
  Serving-Kopie ist nie die Wahrheit.
- Die Oberfläche zeigt Status (`unverified` sichtbar), Prüfstand des Zugriffswegs und
  Lücken; sie bestimmt nie, was aufgenommen wird. UI-Detaildesign erst in Phase 4, nach
  den Daten.

**Zitierbarkeit:** jeder Snapshot ist getaggt und per Manifest referenzierbar; später
optional ein DOI je Release. Prüfstein: **Der Hub muss durch seine eigene Schranke
passen** — er ist selbst ein öffentlich verfügbares Dataset und muss seinen eigenen
Aufnahmekriterien genügen (offene Lizenz auf den Metadaten, geprüfter Zugriffsweg,
Versionierung).

---

## 5. Verankerung der Bauregeln

| Regel (Auftrag) | Verankert in |
|---|---|
| Nichts erfinden | §4.1 (leere Felder), §1.1 (Fundstellen wörtlich) |
| Identifier prüfen, nicht annehmen | §2.2 (Prüfstand + Budget, Status statt Behauptung) |
| Nie URLs konstruieren | §2.2, §4.1 (nur wörtliche URLs; gilt auch für dieses Dokument — §3.2 enthält nur tatsächlich abgerufene) |
| Deterministisch, wo es geht | §1.2 (R1–R4 Code), §3.4 (Ernte ohne Modelle) |
| Kein API-Guthaben | §3.4 (Urteilsroutine unterm Abo; Pipeline ruft nie Modelle) |
| Auto-Aufnahme nur über harte Schranken, sichtbar ungeprüft | §3.4, §4.1 (`status: unverified`) |
| Verworfenes mitschreiben | §4.2 (Ablehnungsregister mit Grundcodes) |
| Ausfälle vermerken | §3.4, §4.2 (Ausfall-Log; leer ≠ nicht erreichbar) |
| Messen vor Bauen | §3.3 (Gate), §3.2 (bereits begonnen) |
| Oberfläche folgt den Daten | §4.4 |

---

## 6. Phasenplan

| Phase | Inhalt | Ende |
|---|---|---|
| **0** | Dieses Dokument; Repo- und Lizenzentscheidung (§8) | Franks Abnahme |
| **1 — Messrunde** | Messprotokoll-Template mit Gate-Schwellen; volle Messung DataCite (inkl. Public-Data-File-Weg), OpenAIRE (inkl. Überlappungs-Stichprobe), EU ODP, Zenodo, HuggingFace; data.gov-404 klären. **Keine Adapter.** | Messregister mit Go/No-Go je Quelle |
| **2 — Kern** | Schema v0.1 einfrieren; Fundstellen-Store; erster Adapter für die bestgemessene Quelle; Dedup R1–R4; drei Register; erster Snapshot | erster zitierbarer Snapshot |
| **3 — Selbstlauf** | Nightly-Ernte + Auflösungs-Budget; Urteilsroutine; wöchentliche Snapshots; weitere Quellfamilien nach Messlage | Hub erweitert sich ohne Sichtung |
| **4 — Oberfläche** | Statische UI + Worker-Such-API aus dem Snapshot | Hub öffentlich nutzbar |

Jede Phase endet mit einer Vorlage an Frank in Klartext; nichts geht ohne Go live.

---

## 7. Was dieses Design bewusst NICHT tut

- Keine LLM-Anreicherung von Metadaten (keine generierten Beschreibungen, Themen-Tags nur
  wenn quellengegeben). Modelle urteilen (§3.4), sie beschreiben nicht.
- Keine Ähnlichkeits-Dedup im Automatikpfad — Dubletten unterhalb R1–R4 bleiben lieber
  sichtbar getrennt, als falsch verschmolzen zu werden.
- Keine Vollständigkeits-Behauptung: der Bestand trägt je Quelle Zähler „geerntet von
  gemeldet", die Lücke ist beziffert statt verschwiegen.

## 8. Offene Entscheidungen (Frank)

1. **Repo:** Empfehlung **eigenes Repo `dataset-hub`** — der Hub ist Infrastruktur der
   Ökologie, kein Lab-Experiment; er braucht eigene Release-Zyklen (Snapshots als
   Release-Assets, §4.3) und eigene Actions-Budgets. In der Site bliebe nur die spätere
   Oberflächen-Anbindung.
2. **Lizenz:** Code gern Lab-Standard (PolyForm NC). Für die **Katalog-Metadaten**
   empfiehlt sich dagegen **CC0** (alternativ CC-BY): ein NC-belegtes Metadatenregister
   behindert genau die Forschenden-Nutzung, die das Ziel ist, und fiele am eigenen
   Prüfstein (§4.4) durch. Franks Entscheidung.
