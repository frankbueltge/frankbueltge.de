# Lizenz — Entscheidungsvorlage

**Datum:** 2026-07-26 · **Status:** ENTSCHIEDEN (Frank, 2026-07-26) — **Variante „durchgehend offen"**:
Code Apache 2.0, Werke/Texte CC BY 4.0, Daten CC0; Saat bleibt CC BY-NC-SA.
Umgesetzt in sechs Repos, `naming.ts`, Kanon, Apparatus und Methodenblatt.

Franks Begründung: Werke sollen auch kommerziell verwendbar sein — „falls da wirklich mal
ein großartiges Werk entstehen sollte, was viral geht". Dazu eine Richtigstellung, die den
Grund eher stärkt: **Zitieren war nie verboten** (Zitatrecht, §51 UrhG). NC blockierte die
vollständige Übernahme in kommerziellem Zusammenhang — also genau die Multiplikatoren, die
Reichweite erzeugen. **Hinweis:** CC-Lizenzen sind unwiderruflich; wer ein Werk unter CC BY
erhalten hat, behält diese Rechte dauerhaft.
**Anlass:** Frank, 2026-07-26: „die Entscheidung für non-commercial war damals aus dem
Bauch heraus und ich weiß gar nicht, ob das überhaupt sinnvoll ist."
**Kein Rechtsrat.** Das hier ist eine strukturierte Abwägung, keine anwaltliche Auskunft.

## 1. Ist-Stand (erhoben am 2026-07-26)

Sechs Repositorien tragen dieselbe Doppellizenz — `frankbueltge.de`, `dataset-hub`,
`ulysses`, `field-research`, `studio`, `research-ecology`: **Code PolyForm
Noncommercial 1.0.0**, **Werke/Texte/Daten CC BY-NC-SA 4.0**. Einzige Abweichung:
Die Katalog-Metadaten des `dataset-hub` stehen seit dem 26.07. auf **CC0** — bewusst,
weil NC dort den Zweck zerstört hätte.

Sichtbare Stellen auf der Site: die kanonische Fußzeile in `src/config/naming.ts`
(`licenseLine`), Erwähnungen in `ApparatusPage`, `SaatPage`, den Methodenblättern,
sowie die Rechtstexte in `src/data/legal.ts`.

## 2. Der entscheidende Befund: NC ist nicht der KI-Hebel

Wenn die NC-Wahl auch davon getragen war, dass sich Konzerne nicht bedienen sollen —
diesen Zweck erfüllt seit dem 26.07. die **Crawler-Politik**
(`2026-07-26-crawler-politik.md`): Trainings-Crawler gesperrt, Rechtsvorbehalt nach
Art. 4 DSM-Richtlinie ausdrücklich erklärt. Die Lizenz ist damit frei, das zu regeln,
wofür sie gedacht ist: **wie Menschen und Organisationen die Arbeit weiterverwenden
dürfen.**

## 3. Was NC kostet

- **Es ist keine offene Lizenz** im Sinne der Open Definition. NC-Material kann nicht
  nach Wikipedia/Wikimedia, nicht in offene Repositorien, nicht in viele
  Forschungsinfrastrukturen.
- **„Kommerziell" ist notorisch unscharf.** Drittmittel aus der Industrie, Lehre an
  privaten Hochschulen, Beratung — Forschende können ihre eigene Nutzung oft nicht
  sicher einordnen und meiden NC-Material deshalb.
- **Am Code besonders teuer:** An NC-lizenziertem Code trägt praktisch niemand bei.
  Für Infrastruktur (Pipelines, Adapter) ist das der Unterschied zwischen „wird
  benutzt und verbessert" und „liegt sichtbar herum".
- **Innere Unstimmigkeit:** Das Lab misst Nachprüfbarkeit und Wiederverwendbarkeit —
  und schließt per Lizenz genau die Wiederverwendung aus, die den Wert belegen würde.

## 4. Was NC leisten sollte — und was es besser leistet

Der eigentliche Wunsch ist vermutlich: *niemand soll meine Arbeit einhegen und
geschlossen weiterverkaufen.* Genau das leistet **Share-Alike ohne NC** (CC BY-SA):
kommerzielle Nutzung erlaubt, aber jede Ableitung muss unter derselben Lizenz offen
bleiben. Das verhindert Einhegung, ohne die Definitionsprobleme von „kommerziell".

## 5. Vorschlag, nach Inhaltsart getrennt

| Inhaltsart | heute | Vorschlag | Warum |
|---|---|---|---|
| **Infrastruktur-Code** (Pipelines, Adapter, Site-Code) | PolyForm NC | **Apache 2.0** | permissiv mit ausdrücklicher Patentklausel; Standard, wenn Nutzung und Reputation das Ziel sind. Alternative bei Reziprozitätswunsch: **AGPL-3.0** |
| **Daten und Metadaten** (Dataset-Register, Protokoll-Archiv, Messregister) | gemischt (Hub bereits CC0) | **CC0** durchgängig | Daten entfalten Wert erst durch Weiterverwendung; CC0 ist der Standard der Registerwelt (DataCite, Crossref) |
| **Eigene Essays und Texte** | CC BY-NC-SA | **CC BY-SA 4.0** | Namensnennung bleibt, Einhegung bleibt ausgeschlossen, die unscharfe NC-Klausel fällt weg |
| **Werke der Kollektive** (Atelier, Field, Studio) | CC BY-NC-SA | **freie Wahl — NC hier am ehesten verteidigbar** | Kunst wird selten als Infrastruktur weiterverwendet; hier kostet NC am wenigsten. Siehe aber §6 |
| **Fremdeinreichungen** (`/seed`) | CC BY-NC-SA | **muss NC bleiben** (bereits Eingereichtes) | siehe §7 — echte Bindung gegenüber Dritten |

## 6. Der Sonderfall: maschinengeschriebene Werke

**Offene Rechtsfrage, ausdrücklich als solche gekennzeichnet.** Urheberrechtsschutz
setzt in den USA menschliche Urheberschaft voraus, in der EU eine „eigene geistige
Schöpfung". Bei rein maschinell erzeugten Texten und Werken ist daher fraglich, ob
überhaupt ein Schutzrecht besteht — und damit, ob eine Lizenz darauf mehr ist als eine
Absichtserklärung. Klar deins sind dagegen: die Verfassungen, die Architektur, die
Auswahl- und Kuratierungsentscheidungen, deine Essays.

Das ist kein Mangel des Projekts, sondern ziemlich genau sein Gegenstand — und es
spricht dafür, die Lizenzfrage bei den Kollektiv-Werken **nicht** zu überladen: Was
dort wirklich schützt, ist die dokumentierte Herkunft im Git-Archiv, nicht die
Lizenzzeile.

## 7. Harte Bindung: die Saat-Einreichungen

`src/data/legal.ts` verspricht Einreichenden bei `/seed` ausdrücklich die
Veröffentlichung **unter CC BY-NC-SA 4.0** — als Einwilligungstext nach Art. 6 Abs. 1
lit. a DSGVO. Im Register stehen derzeit **2 Einreichungen**.

Daraus folgt zwingend: **Bereits Eingereichtes kann nicht umlizenziert werden.** Die
Einwilligung galt dieser Lizenz. Eine Änderung wirkt nur für künftige Einreichungen und
verlangt, dass der Text in `legal.ts` und auf `/seed` im selben Zug geändert wird.
Praktisch heißt das: Das Saat-Register behält seine Lizenz je Eintrag — was ohnehin
sauberer ist als eine pauschale Site-Lizenz.

## 8. Was eine Änderung konkret anfasst

1. `LICENSE.md` in sechs Repositorien (`frankbueltge.de`, `dataset-hub`, `ulysses`,
   `field-research`, `studio`, `research-ecology`).
2. `src/config/naming.ts` → `licenseLine` (die kanonische Fußzeile).
3. `docs/wording-kanon.md` → Lizenzzeile nachziehen (Kanon-Regel: im selben Commit).
4. Erwähnungen in `ApparatusPage.astro`, `SaatPage.astro`, den Methodenblättern.
5. `src/data/legal.ts` — nur wenn die Saat-Lizenz für künftige Einreichungen geändert
   werden soll; bestehende Einträge behalten ihre.
6. Lizenzkopfzeilen in den Engine-Repos, falls dort vorhanden.
7. Eine datierte Notiz, ab wann was gilt — Altstände bleiben unter ihrer Lizenz
   (Kanon-Prinzip: Überholtes wird sichtbar archiviert, nie stillschweigend ersetzt).

## 9. Empfehlung in einem Satz

**Code auf Apache 2.0, Daten auf CC0, eigene Texte auf CC BY-SA, Kollektiv-Werke nach
Geschmack (NC dort unschädlich), Saat unverändert** — weil damit alles, was
Infrastruktur ist, benutzbar wird, während der Schutz vor Einhegung über Share-Alike
erhalten bleibt und der KI-Vorbehalt dort liegt, wo er hingehört: in der
Crawler-Politik.

Bei tatsächlicher Tragweite: eine Stunde anwaltliche Beratung, bevor die sechs
Repositorien umgestellt werden.
