# 11 — Impressum (Entwurf, Quelle: data-snack.com)

> Personendaten **1:1 übernommen** aus https://data-snack.com/legal (abgerufen 2026-06-14;
> client-gerendertes Impressum, aus dem Seitenquelltext extrahiert). **Nichts erfunden.**
> Rechtsverweise auf den **aktuellen Stand** gebracht: **§ 5 DDG** (statt § 5 TMG) und
> **§ 18 Abs. 2 MStV** (statt § 55 Abs. 2 RStV) — data-snack nennt noch die alten Normen;
> die bestehende `src/data/legal.ts` von frankbueltge.de verwendet bereits die aktuellen.
> **Vor Go-Live rechtlich prüfen lassen.** Nicht in `src/` angewendet.

## Übernommene Realdaten (Quelle: data-snack.com/legal)
- **Name:** **Frank Bültge** (bestätigt 2026-06-14; data-snack rendert „Bueltge" nur
  ASCII-sicher — die korrekte Schreibweise ist „Bültge" mit Umlaut)
- **Zusatz:** persönliches, nicht-kommerzielles Projekt
- **Anschrift:** Neuhof 7, 18276 Zehna OT Neuhof, Deutschland
- **E-Mail (data-snack):** chef[at]data-snack.com → für diese Site: **hello@frankbueltge.de**
  *[ZU KLÄREN: hello@ oder eigener impressum@-Alias]*
- **Verantwortlich:** Frank Bueltge, Anschrift wie oben

## Impressum — DE (Reinfassung)

**Impressum**

Angaben gemäß § 5 DDG:
Frank Bültge
Neuhof 7
18276 Zehna OT Neuhof
Deutschland

Kontakt:
E-Mail: hello@frankbueltge.de

Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
Frank Bültge, Anschrift wie oben

Haftung für Inhalte und Links:
Inhalte wurden mit größter Sorgfalt erstellt; für Richtigkeit, Vollständigkeit und Aktualität
wird keine Gewähr übernommen. Für Inhalte verlinkter externer Seiten (u. a. data-snack.com,
datavism.org, LinkedIn) ist der jeweilige Anbieter verantwortlich.

*(Hinweis „persönliches, nicht-kommerzielles Projekt" optional als Vorspann — wie data-snack.)*

## Imprint — EN (Reinfassung)

**Imprint**

Information pursuant to § 5 DDG:
Frank Bültge
Neuhof 7
18276 Zehna OT Neuhof
Germany

Contact:
Email: hello@frankbueltge.de

Responsible for content pursuant to § 18 (2) MStV:
Frank Bültge, address as above

Liability for content and links:
Content was created with the greatest care; no guarantee is given for accuracy, completeness or
timeliness. The respective provider is responsible for the content of linked external sites
(incl. data-snack.com, datavism.org, LinkedIn).

## Übertrag in `src/data/legal.ts` (NICHT ausgeführt)
Ersetzungen in `impressumDe.sections` / `impressumEn.sections`:
- `[Vollständiger Name]` → `Frank Bültge`
- `[Straße und Hausnummer]` → `Neuhof 7`
- `[PLZ und Ort]` → `18276 Zehna OT Neuhof`
- `[Land]` → `Deutschland` / `Germany`
- Kontakt `[deine-adresse@frankbueltge.de]` → `hello@frankbueltge.de`
- `Verantwortlich nach § 18 Abs. 2 MStV` → `Frank Bültge, Anschrift wie oben`
- `draftNote` (ENTWURF-Hinweis) **entfernen**, sobald rechtlich freigegeben.

## Datenschutz (kein Übertrag nötig)
Die bestehende `datenschutz`-Vorlage in `legal.ts` ist inhaltlich aktuell (Vercel-Hosting,
self-hosted Fonts, **kein** Tracking) und muss **nicht** von data-snack übernommen werden —
nur rechtlich freigeben (der `draftNote` bleibt bis dahin stehen).

## ZU KLÄREN
- ~~Namensschreibweise Bültge vs. Bueltge~~ → **Bültge** bestätigt (2026-06-14). ✓
- E-Mail im Impressum (hello@ vs. impressum@).
- Vorspann „nicht-kommerzielles Projekt" beibehalten? (frankbueltge.de ist ebenfalls
  nicht-kommerziell → empfohlen: ja.)
- Kein Telefon nötig (data-snack nennt keins; E-Mail genügt).
- **Privatadresse:** Sie ist im Impressum gesetzlich öffentlich — aber bewusst entscheiden,
  ob `_drafts/` mit Adresse committet wird (geht in die Git-Historie). Finale Adresse gehört
  ohnehin in `src/data/legal.ts`, nicht dauerhaft in `_drafts/`.
- Anwaltliche/fachliche Endprüfung vor Go-Live (R-13).
