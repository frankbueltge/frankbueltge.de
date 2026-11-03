# Handoff: Startseite beruhigen (Home Calm B v2)

Referenz-Entwurf: `Home Calm B v2.dc.html` (Option 2a im Canvas `Home Calm Options.dc.html`).
Basis ist der aktuelle Stand von `src/components/pages/HomeEdition.astro` (2026-11-02). Alle Zahlen und Texte bleiben aus den bestehenden Records abgeleitet (Kanon: keine getippten Ziffern).

## 1. Kopf (unverändert gegenüber live, nur bestätigt)
- Top bar: `NAMING.eyebrow` links, Nav rechts, Theme-Toggle.
- Masthead: Kicker `FRANK BÜLTGE · THE STANDING QUESTION` zentriert, darunter `NAMING.title` kursiv, **immer einzeilig**: Schriftgröße per Fit-to-width (Textbreite messen, auf Zeilenbreite skalieren, max. ca. 150px). Doppellinie, Dateline mit Datum links und UTC-Uhr rechts.
- Puls im Rahmen mit Kopf- und Fußstreifen, darunter die Since-Leiste mit „remember my visits“ (bestehende Logik aus `since.ts`).
- Kein Absatz „I am Frank Bültge from Karlsruhe…“ auf der Startseite.

## 2. Layout darunter: Hauptspalte + Randspalte
- Hauptspalte (breit): **From the lab** → **From the Ecology** → Zyklus-Frage mit den drei Antworten.
- Randspalte (`aside`, Hintergrund wie Since-Leiste): Since-yesterday-Liste, Overnight house by house, Timetable (kompakt, Balken), Readings (nur Name + Zahl).
- Unter 900px Breite stapelt die Randspalte unter die Hauptspalte.

## 3. From the lab
- Ducking groß als Aufmacher (Bild 16:9 links, Text rechts).
- Darunter Karussell mit Pfeil-Buttons und Zähler, genau diese neun, in dieser Reihenfolge:
  Common Ground (`trending`), Third Reading, Balance, Consensus, Delve into the intricate realm (`tell`), All Along the Watchtower (`ueberflug`), Headroom (`spielraum`), Editorial Deadline (`redaction`), Invoked Past.
- Umsetzung: `EDITION.lab.lead = ['ducking']` plus eine explizite Liste statt `leave` + Recency, oder `leave` so setzen, dass genau diese neun bleiben. `spielraum` und `redaction` aus `leave` entfernen.
- Lab-Screenshots unten ausgerichtet beschneiden (`object-position: center bottom`), damit die Top bar der Seite im Bild verschwindet.

## 4. From the Ecology (vorher „Selected works“)
- Überschrift `SELECTED_WORKS.title` → „From the Ecology“.
- Pool wie `withoutLab(readPool())`, **Standard: nach Datum, neueste zuerst** (statt Zufall).
- Filter-Chips: All · The Atelier · The Field · The Studio · n-1 (mit Anzahl).
- Umschalter „Newest first“ / „Random draw ↻“ (Zufall nutzt `shuffledOrder`).
- 6 Karten sichtbar, „Show more“ lädt je 6 nach; Statuszeile „6 of 87 · newest first“.
- Karte: Bild 16:10, Haus in Hausfarbe, Art · Datum, Titel. Kein Satz auf der Karte.
- Ohne JS: die ersten 6 nach Datum, Filter und Buttons ausgeblendet (wie heute bei der Since-Leiste).

## 5. Thumbnails: Duotone, beim Build erzeugt
Alle Stills und Screenshots (Lab und Ecology) einheitlich zweifarbig, damit nichts Graues gegen den beigen Grund steht.
- **Light-Theme:** Tinte `#161412` → Creme `#fbf8f1`.
- **Dark-Theme:** Tinte `#ece6d9` → Papier `#221f1b` (oder die Dark-Tokens aus `paper.css`).
- Abbildung: Luminanz (0.2126 R + 0.7152 G + 0.0722 B), linear auf Tinte→Papier, **ab 85 % Helligkeit reines Papier** (sonst bleibt der graue Seitenhintergrund der Screenshots sichtbar).
- Dunkle Vorlagen (mittlere Luminanz < 50 %) vorher invertieren, damit alle auf Papier landen.
- Ort: als Schritt in `scripts/shelf-shots.ts` / `scripts/shelf-stills.ts` (z. B. mit sharp: `greyscale()` → LUT → `tint`), pro Theme eine Datei (`<key>.webp`, `<key>.dark.webp`). Neue Werke bekommen das automatisch beim nächtlichen Lauf.
- Der Entwurf macht das nur per SVG-Filter in der Anzeige; im Produkt bitte als echte Bilddateien (CSP: keine Inline-Styles nötig, `<picture>` mit `prefers-color-scheme` bzw. Theme-Klasse).

## 6. Dark Mode
Nach den bestehenden Dark-Tokens der Site. Entwurf zur Orientierung: `Home Calm B v2 Dark.dc.html` (Option 3a, Kopf dort noch alter Stand). Hausfarben im Dunkeln aufgehellt: Atelier `#a294ee`, Field `#7db1e3`, Studio `#ee8a5f`, Akzent `#f07a55`.

## Offene Datenpunkte
- Präsentationen der Zyklen 8–10 und Field 11: der Entwurf kannte kein Datum; im Produkt aus dem Record lesen.
- n-1-Werke ohne Datum: im Produkt aus dem Record datieren oder ans Ende sortieren.
