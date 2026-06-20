# 12 — Werktitel auf Englisch (Mapping + Anwendung)

> Entscheidung 2026-06-14: **Werktitel EN.** Hier das Mapping mit Begründung (Doppelsinn
> bewahren) und wie die Titel im DE/EN-Kontext erscheinen. Vorschlag; **nicht** in `src/`
> angewendet.

## Mapping
| bisher (DE) | EN-Titel (empfohlen) | Doppelsinn bewahrt? | Alternative |
|---|---|---|---|
| Das Protokoll | **The Protocol** | ja — Sitzungsprotokoll **+** Datenprotokoll | The Minutes (verliert Daten-Sinn) |
| Halbwertszeit | **Half-Life** | ja — Physik **+** Anteilnahme | — |
| Parallaxe | **Parallax** | ja — Optik/Astronomie **+** Wahrheitsabstand | — |
| Die Police | **The Policy** | ja — Versicherungspolice **+** (public) policy | The Premium (enger) |
| Überflug (Studie) | **Overflight** | ja — Luft-/Satellitenüberflug | Flyover, Overpass |

**Serie** „Die Akte der Gegenwart" → EN aktuell **„The File of the Present"** (so in `ui.ts`).
*[ZU KLÄREN: eine frühere Notiz nannte „The Records of the Present". Eine Fassung festlegen —
Empfehlung: „The File of the Present" (entspricht dem Code-Stand).]*

## Untertitel (EN — bereits in `werke.ts` vorhanden)
- The Protocol — „The session of the world is open"
- Half-Life — „On the decay of attention"
- Parallax — „What each language conceals"
- The Policy — „What the apocalypse costs"
- Overflight — (Lab-Studie)

## ⚠ Sonderfall „The Protocol" (wichtig)
Der **Titel** wird EN, der **Inhalt bleibt deutsches Amtsregister** — „Das Protokoll" ist
bewusst in Protokolldeutsch verfasst („Feststellung", „Beschluss: vertagt"). Das ist der Kern
des Werks und ändert sich **nicht**. Es entsteht also bewusst die Kombination *englischer Titel
+ deutscher Registertext*. Falls das zu inkonsistent wirkt, ist „The Protocol" das **einzige**
Werk, für das man den deutschen Titel als Ausnahme erwägen könnte. *[ZU KLÄREN]*

## Darstellung im DE-Kontext
Werktitel sind ab jetzt EN-Eigennamen — auch auf deutschen Seiten. Zwei Optionen:
- **(A, empfohlen)** EN-Titel **+ deutscher Untertitel** als Gloss (`subtitle.de` existiert):
  „**The Protocol** — Die Sitzung der Welt ist eröffnet".
- (B) EN-Titel ohne Gloss (puristisch, für DE-Leser weniger zugänglich).

## Anwendung (NICHT ausgeführt) — betroffene Stellen
- `src/data/werke.ts`: `title` je Werk → EN; `subtitle.de/en` bleiben.
- `src/i18n/ui.ts`: `prot.title` „Das Protokoll"→„The Protocol"; `hw.title`→„Half-Life";
  `px.title`→„Parallax"; `px2.title`→„The Policy"; `uefl.title`→„Overflight"; Untertitel prüfen.
- Werkseiten-/Methodenblatt-Überschriften (`components/pages/*`), Werk-Strip, Home.
- `src/layouts/Base.astro` + `protokoll/feed.xml.ts`: RSS-/Meta-Titel „Das Protokoll".
- **⚠ Testschutz:** `src/lib/protokoll/render.test.ts` schützt die Protokoll-Register-Strings
  (CLAUDE.md: „Test-Strings nie aufweichen"). Vor einer Titeländerung prüfen, ob „Das Protokoll"
  in geschützten Strings/Überschriften vorkommt; falls ja, Änderung **mit** Testanpassung und
  bewusst vornehmen — nicht beiläufig.
- **Slugs/Routen** (`/protokoll`, `/halbwertszeit`, …): können **DE bleiben** (URL ≠ Titel ist
  zulässig) oder mit EN ziehen — separat entscheiden (`_drafts/06`). Empfehlung: Titel ≠ Slug ist ok;
  Routen-Umbenennung nur im Zuge des IA-Umbaus, mit Redirects.

## ZU KLÄREN
- „The File of the Present" vs. „The Records of the Present" (Serientitel) final.
- „The Protocol": EN-Titel trotz deutschem Inhalt — bestätigen oder als Ausnahme deutsch lassen.
- Slugs/URLs mitziehen ja/nein (`_drafts/06`).
- Überflug „Overflight" bestätigen (oder Studie behält DE-Titel als Nebenstück).
- Kollision mit geschützten Register-Strings (render.test.ts) prüfen, bevor angewendet.
