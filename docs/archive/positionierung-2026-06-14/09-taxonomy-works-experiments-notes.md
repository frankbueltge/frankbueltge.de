# 09 — Taxonomie: Works, Experiments, Notes & Co.

> Präzise Definitionen der Objekttypen, damit Inhalte konsistent eingeordnet werden und die
> Site nicht „alles ist irgendwie ein Werk" wirkt. Diese Taxonomie ist ein **Vorschlag** zur
> Strukturierung; sie ändert nichts an bestehenden Seiten.

## 0. Warum eine Taxonomie?

Aktuell vermischt „Lab" laufende Untersuchungen, Engineering-Artikel und eine technische
Studie unter einer Überschrift (siehe 02/03). Klare Typen verhindern Register-Brüche und
machen Reife sichtbar (Versuch ≠ Werk).

## 1. Die acht Typen im Überblick

| Typ | Einzeiler | Reife | Tonart |
|---|---|---|---|
| **Untersuchung / Work** | laufendes/abgeschlossenes Messinstrument, Gate bestanden | hoch | amtlich |
| **Experiment** | offener Versuch mit Frage; Ausgang offen | mittel | erkundend |
| **Lab Note** | Prozess-/Denknotiz, Verwerfung, Zwischenstand | niedrig | tagebuchnah, präzise |
| **Method / Methodenblatt** | Verfahren, Quellen, Grenzen eines Werks | hoch | technisch |
| **Instrument** | wiederverwendbares Mess-/Werkzeug (Code) | hoch | technisch |
| **Dataset** | offener, dokumentierter Datensatz | hoch | technisch |
| **Diagram / Darstellung** | lesbare Messdarstellung | variabel | nüchtern |
| **Research Object / Exposition** | zitierfähige Bündelung Werk+Daten+Methode+Reflexion | sehr hoch | wissenschaftsnah |

---

## 2. Untersuchung / Work
- **Definition:** Ein Stück, das das **Substanz-Gate** (werkgruppe-design §2) besteht: echte
  Daten mit Provenienz, eine überprüfbare Frage, Infrastruktur als Teil der Aussage,
  offenes Leave-behind, Verhältnismäßigkeit.
- **Zweck:** der Kern der Praxis; trägt die Positionierung.
- **Veröffentlichungsschwelle:** Gate **und** Reife-Gate (11) bestanden; Methodenblatt
  vorhanden; reproduzierbar.
- **Pflicht-Metadaten:** Titel + Untertitel (Doppelbegriff-Prinzip), These/Frage, Quellen,
  Lizenz, Kadenz, Status (live/in Arbeit), Methodenblatt-Link, Code-Link, Grenzen, Änderungslog.
- **Lebenszyklus:** Idee → Experiment → Gate-Prüfung → Work (live) → ggf. Verwerfung
  (→ Lab Note/Studie, siehe Überflug).
- **Beispiele (vorhanden):** Protokoll, Halbwertszeit, Parallaxe, Police.
- **Verortung:** eigene Werkseite + Eintrag in der Reihe „Die Akte der Gegenwart".

## 3. Experiment
- **Definition:** Ein **gerichteter Versuch** mit klarer Frage, dessen Ausgang offen ist.
  Darf scheitern. Noch **kein** Anspruch auf Gate-Erfüllung.
- **Zweck:** zeigt die *Praxis im Werden*; Brutstätte künftiger Works.
- **Veröffentlichungsschwelle:** Frage + reale Daten/Verfahren + ehrlicher Ausgang +
  **als Versuch gekennzeichnet** (nie als fertiges Werk verkauft).
- **Pflicht-Metadaten:** Frage, Verfahren, Datenbasis, Ergebnis/Stand, „Versuch"-Kennzeichen,
  nächste Schritte.
- **Abgrenzung:** Ein Experiment, das das Gate besteht und stabilisiert, **wird** zur
  Untersuchung. Ein Experiment, das scheitert, **wird** Lab Note/Studie.
- **Beispiele (vorhanden):** der Parallaxe-Embedding-Prototyp (gescheitert → Redesign);
  die Überflug-Etüde (kein Gate → Studie).
- **Verortung:** „Experiments" (eigener Bereich) — klar getrennt von Works.

## 4. Lab Note
- **Definition:** kurze, datierte **Prozess-/Denknotiz**: eine Beobachtung, eine Verwerfung,
  ein Zwischenstand, eine offene Frage.
- **Zweck:** macht Ebene 3 (Prozess) sichtbar; niederschwellige Kontinuität.
- **Veröffentlichungsschwelle:** nachvollziehbar, nichts erfunden, kein Secret/PII.
- **Sonderformat „Verwerfung":** die fünf Punkte aus 08 §9 (Frage → Versuch → Scheitern mit
  Beleg → Rest → offene Frage).
- **Abgrenzung von „Blog":** Lab Notes sind **werk-/methodengebunden**, keine Meinungsartikel,
  kein SEO-Content. (Die zwei vorhandenen Consulting-Artikel sind **keine** Lab Notes in
  diesem Sinn — sie sind Engineering-Notizen, siehe §10.)
- **Verortung:** „Notes" / „Field Notes".

## 5. Method / Methodenblatt
- **Definition:** standardisiertes Blatt je Werk (werkgruppe §3.5): Quellen+Lizenzen,
  Abrufkadenz, Verarbeitung+Code, Grenzen der Methode, Compute-Fußabdruck, Änderungsprotokoll.
- **Zweck:** Überprüfbarkeit; das „Research" in Artistic Research.
- **Status:** für alle vier Works vorhanden.
- **Empfehlung:** zusätzlich **ethische Grenzentscheidungen** je Werk aufnehmen (R-15).
- **Verortung:** an jedes Werk gekoppelt (aktuell teils unter `/werke/<id>` — URL-Schema
  klären, R-09).

## 6. Instrument
- **Definition:** ein **wiederverwendbares technisches Werkzeug** (Adapter, Pipeline, Fit-
  Routine), das über ein einzelnes Werk hinaus nutzbar ist.
- **Zweck:** macht das Engineering produktiv **als Forschungsinfrastruktur**, nicht als
  Portfolio-Skill.
- **Veröffentlichungsschwelle:** dokumentiert, getestet, offen lizenziert.
- **Beispiele (vorhanden):** der GitHub-Committer „Protokollführung", die Plausibilitäts-/
  Stale-Guards, der Exponential-Fit (Halbwertszeit).
- **Verortung:** optional eigener „Instruments"-Bereich (Richtung-C-Struktur) oder im Methodenblatt.

## 7. Dataset
- **Definition:** ein **offen dokumentierter Datensatz**, den die Praxis erzeugt
  (committete Register/Snapshots).
- **Zweck:** „Leave-behind"-Kriterium des Gates; Nachnutzbarkeit; Zitierbarkeit.
- **Veröffentlichungsschwelle:** Provenienz, Lizenz, Schema, Grenzen; **keine** Secrets/PII.
- **Beispiele (vorhanden):** `protokoll/<jahr>/<datum>.json`, `*/register.json`, `police.json`,
  `satellites.json`.
- **Verortung:** verlinkt aus Methodenblatt; perspektivisch eigener „Datasets"-Index.

## 8. Diagram / Darstellung
- **Definition:** eine **lesbare Messdarstellung** (SVG/Canvas), die einer Aussage dient.
- **Maßstab:** „dient es der überprüfbaren Aussage?" — nicht „ist es schön?".
- **Abgrenzung:** der dekorative Hero (`HeroField`) ist **kein** Diagram (macht keine
  Datenaussage) — er ist Ornament und sollte als solches behandelt/benannt werden (R-08/R-10).
- **Verortung:** eingebettet in Werke/Notes.

## 9. Research Object / Exposition
- **Definition:** eine **zitierfähige Bündelung** aus Werk + Daten + Methode + Reflexion;
  Format der publizierten künstlerischen Forschung (siehe 07 §13).
- **Zweck:** der Ausgabekanal für die 3-Jahres-Stufe (Richtung D); Diskursanschluss.
- **Status:** **noch nicht vorhanden** — bewusst als Ziel markieren, nicht vortäuschen.
- **Verortung:** extern (Research Catalogue/JAR) + Verweis von der Site.

---

## 10. Sonderfall: Engineering-Notizen (Beruf)
- Die portierten Artikel (BigQuery/dbt, Server-side Tagging) sind **weder Work noch Lab Note
  im Forschungssinn**. Sie sind **Engineering-Notizen** und gehören in den klar markierten
  Beruf-/Projekte-Kontext — nicht unter „Forschung in den Künsten" (R-03).
- Empfehlung: eigener Typ **„Engineering Note"** oder Eingliederung unter `/work`.

## 11. Entscheidungsbaum (für neue Inhalte)

```
Ist es beruflich/Dienstleistung?            → Engineering Note (Beruf)
Erhebt es eine überprüfbare Weltfrage?
  nein                                      → Lab Note (oder Studie/Etüde)
  ja → besteht es das Substanz-Gate?
        nein, noch offen                    → Experiment
        nein, gescheitert                   → Lab Note (Verwerfung) / Studie
        ja → reif & reproduzierbar?
              nein                          → Untersuchung „in Arbeit"
              ja                            → Untersuchung „live" (+ Methodenblatt)
Bündelung für Diskurs/Zitat?                → Research Object / Exposition
```

## 12. Minimal-Metadatensatz (einheitlich, vorgeschlagen)
`titel · untertitel · typ · status · datum/aktualisiert · frage/these · quellen+lizenz ·
methode/code-link · grenzen · (ethik-hinweis, falls sensibel) · sprache(n)`.
→ Anschlussfähig an das bestehende `lab`/`protokoll`-Schema (`content.config.ts`).
