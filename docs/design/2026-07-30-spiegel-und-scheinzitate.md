# Der Spiegel im Katalog — und was ein Zitat nicht ist

**Datum:** 2026-07-30 · **Status:** Filter gebaut und gemessen, Urteilscharge 2 geschrieben
**Setzt fort:** `2026-07-27-register-rueckbau-und-scouts.md` (§13, „Was offen ist")
und `2026-07-28-urteilsroutine-kataloge.md`

## 1. Der Befund

Der Paper-Katalog zählte **86 Saatkörner als „von field zitiert", die field nie zitiert
hat.** Die Ursache ist eine Schleife, die niemand gelegt hat:

Fields Provenienz-Audit `drafts/2026-07-28-follow-the-line/` prüft die
Provenienzansprüche des Katalogs gegen das eigene Repo — genau das, worum der Saat-Text
vom 28.07. gebeten hatte. Dafür hält es den Katalog **eingefroren**
(`sources/papers.frozen.json`, 208 Einträge; `papers.seed-state.frozen.json`, 206). Der
nächtliche Lauf las diesen Abzug wie jede andere Datei und fand darin sämtliche
Kennungen des Katalogs.

**Der Katalog belegte sich selbst.** Und weil der Abzug mitwächst, hätte jeder künftige
Eintrag rückwirkend als „von field zitiert" gegolten: eine Zahl, die mit dem Katalog
wächst statt mit der Forschung.

| | ohne Filter | mit Filter |
|---|---:|---:|
| Saatkörner | 138 | 137 |
| mit Etikett „field" | **129** | **43** |
| „von mehr als einer Praxis zitiert" | **89** | **36** |

Die Zahl auf `/papers`, die Mehrfachzitierung ausweist, war damit **um mehr als das
Doppelte überhöht**. Kein Eintrag hing allein am Spiegel; es ging ausschließlich um
Etiketten. Das eine Korn, das ganz wegfällt (`2101.05282`), überlebt als Eintrag über
die MNRAS-DOI, mit der Ulysses es tatsächlich zitiert.

## 2. Woran ein Spiegel erkannt wird

**An der eigenen Schema-Signatur, nicht am Dateinamen.** Eine JSON-Datei, deren Einträge
`aufnahmegrund`, `relevanz_herkunft` und `zitiert_von` tragen, IST dieser Katalog.

`.frozen` ist Fields Konvention; die nächste Praxis spiegelt unter anderem Namen. Ein
echtes Literaturverzeichnis kann der Filter nicht treffen — es trägt keinen
`aufnahmegrund`. Das Wort in Prosa ebenfalls nicht: geprüft wird der geparste Eintrag,
nicht der Text. Beides steht unter Test (`test_praxen.py`).

`_ist_spiegel()` ist damit der dritte Filter derselben Familie, eine Windung weiter als
seine Nachbarn:

| Filter | was nicht als Zitat zählt |
|---|---|
| `_ist_pruefstueck` | erfundene Kennungen in Testvorrichtungen |
| `_ist_rohmaterial` | Kennungen als **untersuchtes Objekt** (Provenienzprotokolle) |
| `_ist_spiegel` | die **ganze Datei** ist der Katalog |

## 3. Drei weitere Scheinzitate — gemessen, nicht verallgemeinert

Beim Nachsehen fielen drei Einträge auf, die aus anderen Gründen kein Zitat sind:

| Eintrag | einzige echte Fundstelle | was es wirklich ist |
|---|---|---|
| „Impact of QCD sum rules … neutron stars" (`arXiv:2501.01234`) | `works/…/scripts/filter_corpus_api.py` | eine **Beispielkennung in einem Docstring** (`'…/abs/2501.01234v2' -> '2501.01234'`), die zufällig ein echtes Paper trifft |
| „Medical Lawfare" (`10.1080/0377919x.2024.2330366`) | `notes/2026-07-16-half-life-archival-probe/urls.json` | eines von **513 Prüfzielen** einer Archiv-Halbwertszeit-Messung |
| „Nowhere and no one is safe" (`10.1186/s13031-024-00580-x`) | dieselbe Prüfziel-Liste | dasselbe |

Für die beiden Gaza-Paper ist das keine Nebensache: Sie sind für Fields Gegenmessung
**inhaltlich einschlägig**, nur eben gemessen und nicht zitiert. Ein `aufnahmegrund:
zitiert` wäre dort eine Unwahrheit über eine wahre Sache.

**Entschieden (2026-07-30, abends): die beiden Prüfziele fallen.** Zuerst war die
Überlegung, aus zwei Fällen keine Regel abzuleiten — das war zu vorsichtig gedacht. Es
braucht keine neue Regel: `_ist_rohmaterial` sagt bereits „Kennungen als untersuchtes
Objekt zählen nicht", es erkannte Fields Ordnernamen nur nicht. `-probe` ist dort
Konvention für „eine Messung an Zielen" (zwei solche Ordner im Repo). Die Ordnerliste
kennt es jetzt. Gemessen: 137 Körner ohne, 135 mit — es fallen genau diese zwei.

**Als `kuratiert` neu zu begründen wäre falsch gewesen.** Kuratiert heißt, jemand hat
gewählt; hier hat niemand gewählt, der Scout hat sie aufgelesen. Ein nachgereichter
Grund wäre genau die erfundene Begründung aus §4 der Übergabe.

**Offen bleibt der eine Docstring-Fall.** Für ihn hilft keine Ortsregel — die Kennung
steht in einem produktiven Skript, nicht in einer Testvorrichtung. Er braucht das, was
dem Katalogbau ganz fehlt: **einen Weg, einen Eintrag benannt und begründet
abzulehnen.** Das Ablehnungsregister des Scouts (`Verworfen`) greift nur vor der
Aufnahme, nicht danach. Das ist die nächste Lücke, und sie ist grundsätzlicher als
dieser eine Eintrag.

## 4. Eine Dublette, die keine ist

`2406.14516` steht zweimal im Katalog:

- `arXiv:2406.14516` → „Extended error threshold mechanism in quasispecies theory"
  (Velten et al. 2024) — was der Link **wirklich** auflöst
- `https://arxiv.org/html/2406.14516v1` → „Self-organization of matter…" (Eigen 1971) —
  was Ulysses' kuratierter Eintrag **nennt**

Das sieht aus wie ein Dedup-Fehler und ist keiner. Ulysses hat die Substitution
**vollständig offengelegt** („1971 German primary NOT read directly … verified S27 via
two independent retrievable expositions") und daran den eigenen Zitationsprüfer getestet.
Zusammenführen würde genau die Diskrepanz löschen, die eine Praxis dokumentiert hat.
**Bleibt doppelt.**

## 5. Urteilscharge 2

`urteile/2026-07-30.json` — **52 Urteile**, Modell `claude-opus-5`, Sitzung `tag-02`.

Von 81 unbeurteilten Einträgen sind **26 nur mit Titel** vorhanden und bleiben nach der
Doktrin von §5 der Urteilsroutine unbeurteilt; von den 55 beurteilbaren sind die drei
Scheinzitate aus §3 ausgenommen. **Ein Urteil für einen Eintrag, der nicht dort
hingehört, wäre eine Begründung für einen Fehler.**

Grundlage: 50× `abstract`, 2× `fundstelle` (Uher/DSM-5 und Velten/quasispecies — beide
sind für das aufgenommen, was ihre *Zitierstelle* zeigt, nicht für ihren Gegenstand).

## 6. Was das über die Reihenfolge sagt

Der Spiegel wäre durch keine Prüfung des Katalogs aufgefallen — die Einträge sehen
korrekt aus, die Fundstellen existieren, die Datei ist echt. Aufgefallen ist er, weil
vor dem Urteilen gefragt wurde, **wofür** eigentlich geurteilt wird: 33 der 55 hätten
einen Satz darüber bekommen, was der Text für Fields Forschung hergibt — für eine
Praxis, die ihn nie gelesen hat.

Das ist §10 noch einmal, von der anderen Seite: nicht „messen vor dem Schließen",
sondern **die Prämisse prüfen, bevor man auf ihr aufbaut.**
