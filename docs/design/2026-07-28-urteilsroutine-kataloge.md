# Urteilsroutine für die Kataloge

**Datum:** 2026-07-28 · **Status:** in Betrieb
**Gehört zu:** `2026-07-27-register-rueckbau-und-scouts.md` (§13)

## 1. Wozu

Ein Katalogeintrag sagt zwei verschiedene Dinge, und sie dürfen nie verwechselt werden:

| Feld | Frage | Art der Aussage |
|---|---|---|
| `aufnahmegrund` | Warum steht das hier? | eine **angewandte Regel** |
| `relevanz` | Warum zählt das? | ein **Urteil über den Inhalt** |

Den Aufnahmegrund kann eine Maschine feststellen — „eine Praxis hat es zitiert, hier ist
die Datei". Die Relevanz kann sie nicht feststellen. Sie braucht jemanden, der gelesen
hat. Diese Routine ist der Schritt, an dem das passiert.

## 2. Drei Herkünfte, absteigend nach Gewicht

| `relevanz_herkunft` | woher | Gewicht |
|---|---|---|
| `praxis` | eine Praxis hat den Satz selbst geschrieben | **höchstes.** Wird nie überschrieben |
| `urteil` | diese Routine, von einem benannten Modell | mittel — ein Vorschlag an die Praxis |
| `gebrauch` | nur der Beleg: wer zitiert, wann zuletzt | sagt DASS, nicht WARUM |

Ein Modellurteil ersetzt kein Praxis-Urteil. `pruefe_urteile()` bricht ab, wenn ein
Urteil einen Praxis-Satz überschreiben würde — das ist der teuerste denkbare Fehler in
diesem Katalog, weil der Praxis-Satz das Einzige ist, was sich nicht herstellen lässt.

## 3. Warum die Routine nicht in der Pipeline läuft

Bauregel des Startauftrags: **kein Modell-API-Aufruf in Pipelines und Skripten** — es gibt
kein API-Guthaben, und ein nächtlicher Lauf soll deterministisch bleiben. Der
Urteilsschritt ist deshalb eine **Claude-Code-Sitzung unter dem Abo**, die
`atlas_scout.urteil` als Werkzeug benutzt. Der nächtliche Scout schreibt nie Urteile; er
sammelt und prüft.

## 4. Der Ablauf

```bash
# 1. Was ist unbeurteilt?
python3 -c "import json; d=json.load(open('src/data/register/papers.json')); \
  print(sum(1 for x in d if x['relevanz_herkunft']=='gebrauch'))"

# 2. Urteile schreiben → urteile/<datum>.json
#    [{"id": "…", "relevanz": "Ein Satz.", "grundlage": "abstract"}]

# 3. Erst prüfen, nichts schreiben
python -m atlas_scout.urteil urteile/2026-07-28.json --wurzel . \
  --modell claude-opus-5 --am 2026-07-28 --sitzung nacht-01 --probe

# 4. Anwenden
python -m atlas_scout.urteil urteile/2026-07-28.json --wurzel . \
  --modell claude-opus-5 --am 2026-07-28 --sitzung nacht-01
```

Die Urteilsdatei bleibt liegen. Sie ist der Beleg und der Weg zurück: Was der Katalog
zeigt, lässt sich gegen sie prüfen, und eine falsche Charge lässt sich als Ganzes
zurücknehmen.

## 5. Was ein redliches Urteil ist

- Es sagt, **was der Text für DIESE Forschung hergibt** — nicht, worum es im Text geht.
  Letzteres ist die Zusammenfassung, und die steht schon daneben.
- Es behauptet **nichts, was nicht in Titel, Abstract oder Fundstelle steht.** Ein Urteil
  ist eine Einordnung des Vorliegenden, keine Auskunft über den ungelesenen Volltext.
- Es nennt seine **Grundlage**: `abstract`, `volltext` oder `fundstelle`. Ein Urteil ohne
  benannte Grundlage ist eine Behauptung; das Werkzeug lehnt es ab.
- Wo die Grundlage **zu dünn** ist, wird nicht geurteilt. `gebrauch` bleibt stehen, und
  das ist ein Ergebnis, kein Versäumnis. Ein Katalog, in dem jeder Eintrag eine
  Begründung hat, weil jemand sich eine ausgedacht hat, ist der zurückgebaute Bestand
  in klein.

## 6. Was das Urteil NICHT tut

**Es setzt nie `verify_status: verified`.** Der Eintrag bleibt `toVerify` und zeigt sich
auf der Fläche mit „?". Verified heißt: Eine Praxis oder ein Mensch hat den Text gelesen
und den Eintrag bestätigt. Ein Modell, das seine eigenen Urteile abnimmt, prüft nichts.

**Es bleibt sichtbar maschinell.** Jeder Eintrag mit `relevanz_herkunft: "urteil"` trägt
`urteil: {modell, am, grundlage, sitzung}`. Die Fläche zeigt das aufklappbar. Wer den
Katalog liest, soll nie im Zweifel sein, ob ein Satz von einer Praxis oder von einer
Maschine stammt — das ist dieselbe Ethik wie überall hier: KI als ausgewiesenes,
prüfbares Werkzeug, nie als unbelegtes Orakel.

## 7. Die Grundlage muss erst da sein

Beim ersten Lauf hatten **58 von 109** unbeurteilten Einträgen nur einen Titel. Über einen
Titel lässt sich nicht redlich urteilen — die Routine hätte raten müssen. Ursache war eine
Lücke im Katalogbau: OpenAlex liefert Abstracts als `abstract_inverted_index`
(`{"wort": [Positionen]}`), und der wurde nicht ausgewertet. `katalog._abstract()` baut
ihn jetzt zurück.

Die Lehre, zum dritten Mal an diesem Wochenende: **Erst messen, ob die Grundlage trägt,
dann urteilen.** Nicht urteilen und hoffen, dass die Grundlage schon gereicht hat.
