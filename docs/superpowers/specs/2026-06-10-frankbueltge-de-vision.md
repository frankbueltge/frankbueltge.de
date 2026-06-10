# frankbueltge.de — Vision & Konzept

- **Project:** frankbueltge.de
- **Date:** 2026-06-10
- **Status:** Draft for review
- **Author:** Frank Bültge (mit Claude)
- **Verwandt:** `2026-06-10-shapeshifting-skin-system-design.md` (Komponente: Form/Skins)

---

## 1. Was diese Seite ist (Nordstern)

frankbueltge.de ist das **Labor eines Data Artists mit Engineering-Fundament**. Kein
Bewerbungs-Portfolio (Beruf/SIP stehen auf LinkedIn). Die Seite nimmt **Haltung** ein, betreibt
**Experimente** mit **offenen Daten**, macht **Data Art** und **Artistic Research**, und lebt
**Data Activism** (datavism).

`data-snack.com` (Kategorien *Salon* / *Atlas*) und `datavism.org` sind die größeren, laufenden
Schwester-Werke — frankbueltge.de ist der persönliche Hub/das Labor, um das sie kreisen.

## 2. Kern-Prinzip: wissenschaftliche Redlichkeit

> **Jedes Stück beruht auf harten, belegbaren Fakten und offenen, zitierten Datenquellen.**
> Transparente Methode, sichtbare Quelle, ehrliche Kodierung — **keine dekorative Verzerrung**
> der Daten. Was nicht belegbar ist, wird nicht behauptet.

Das ist kein Detail, sondern ein definierender Wert dieser Data Art. Die Form folgt der Wahrheit,
nicht umgekehrt. (Direkt aus Franks Vorgabe abgeleitet.)

## 3. Publikum & Haltung

Kein Recruiting-Publikum. Adressiert: neugierige Menschen, die datavism-/data-art-Community,
Gleichgesinnte. Damit gilt **„originell/progressiv" vor „konventionell verständlich"** — die Seite
darf fordern, überraschen, Position beziehen.

## 4. Die Säulen

| Säule | Was es ist |
|---|---|
| **Haltung / Manifest** | Standpunkt zu Daten — datavism-Geist: Daten · Macht · Ethik · Sichtbarkeit. Das *Warum*. |
| **Das Lab — Experimente** | kleine, laufende Daten-Experimente, roh-mit-Absicht (Notizbuch-Textur). Das Herz. |
| **Open Data** | offene, zitierte Datensätze nutzen, um komplexe Zusammenhänge zu verstehen & sichtbar zu machen. |
| **Data Art** | künstlerische, faktenbasierte Datenvisualisierung; generative Stücke. |
| **Artistic Research** | forschen, experimentieren, demonstrieren — öffentlich. |
| **Data Activism (datavism)** | die Bewegung leben & entwickeln; verknüpft mit datavism.org. |
| **Schwester-Werke** | data-snack.com (Salon/Atlas) & datavism.org — die größeren laufenden Projekte. |
| **Form / Ausdruck** | die gestaltwandelnde **Skin-Engine** — der „immer-im-Fluss"-Charakter ist selbst ein künstlerisches Statement. Das *Vehikel*, nicht der Kern. |

## 5. Manifest / Haltung

**Status: Platzhalter — reift mit.** Der Kern-Text gehört Frank und wird nicht erfunden. Seeds aus
dem bisherigen Gespräch: Daten als Macht sichtbar machen; offene Daten gegen Intransparenz;
Kunst als Erkenntnis- und Aktivismus-Werkzeug; komplexe Zusammenhänge begreifbar machen. Wird
später als eigener Text geschärft.

## 6. Das Lab — Experimente (das Herz)

Eine **wachsende Sammlung** kleiner Stücke, neuestes zuerst, bewusst roh. Jedes Stück erfüllt §2
(harte Fakten, zitierte Open Data, ehrliche Kodierung).

### 6.1 Erstes Stück: Klima-Ridgeline

- **Idee:** echte Temperatur-Reihen, gerendert als der Joy-Division-Puls. Jede Ridge = ein Jahr,
  die Erwärmung wird als Formwandel sichtbar.
- **Quelle (zitiert), global:** globale monatliche Temperatur-Anomalien — **Berkeley Earth**
  (Global Land+Ocean, ab 1850) oder **NASA GISTEMP** (ab 1880). Die Seite ist **global, nicht
  national**. Basisperiode wird sichtbar angegeben (z. B. 1951–1980 GISTEMP bzw. vorindustriell
  1850–1900).
- **Präzedenz:** Ed Hawkins *#ShowYourStripes* — wissenschaftlich respektierte Daten-Kommunikation
  aus genau solchen globalen Reihen.
- **Kodierung (formtreu):** Jahr → Ridge/Zeile · Monat (Jan–Dez, 12 Werte) → x-Achse ·
  Temperatur-Anomalie → Höhe. ~145–175 Jahre gestapelt → Erwärmung = die Hüllkurve driftet nach
  oben. Die Form ist von echten Zahlen *diktiert*.
- **Integrität:** Quelle, Methode, Basisperiode sichtbar; Unsicherheit benannt; keine kosmetische
  Übertreibung.
- **Doppelrolle:** dieses Stück *ist* zugleich der bedeutungstragende Hero-Puls (Franks früherer
  Wunsch: der Hero lebt von echten Open Data).

### 6.2 Geparkte nächste Stücke

- **„Sieh dir beim Getrackt-werden zu"** — instrumentiert die Session des Besuchers (Cookies,
  Dritt-Requests, Fingerprint-Eindeutigkeit), live sichtbar. Nutzt Franks Tracking/GTM-Expertise,
  reinster datavism, spielbar. Fakten = die real messbaren Vorgänge im Browser des Besuchers.
- **Atlas der Datenlücken** — was *nicht* gezählt wird (Gender Data Gap u. a.). Stark, aber
  abstrakter und Quellen aufwändiger sauber zu beschaffen → später.

## 7. Form: die gestaltwandelnde Skin-Engine

Die komplette Art Direction wechselt fortlaufend (Bauhaus · Tron · Brutalismus · Terminal · …).
Der Fluss selbst ist Teil der Aussage; der (klima-getriebene) Puls wird pro Skin neu „angezogen".
**Detail-Spec:** `2026-06-10-shapeshifting-skin-system-design.md`.

## 8. Build-Sequenz (Vorschlag — Substanz vor Form)

1. **Phase 1 — Substanz:** Klima-Ridgeline-Puls. Den generativen Sinus-Puls durch echte, zitierte
   Klimadaten ersetzen (mit Quelle/Methode/Basisperiode). Self-contained, sofort bedeutungsvoll,
   verkörpert §2. Startseite zugleich verschlanken (BI-Dashboard raus).
2. **Phase 2 — Form:** Skin-Engine + 4 Skins (Bauhaus/Tron/Brutalismus/Terminal) + Auto-Zyklus.
   Der Klima-Puls wird skin-fähig.
3. **Phase 3+ — Wachstum:** Manifest-Text schärfen; weitere Lab-Stücke (Tracking, Datenlücken);
   datengetriebene Skin-Wahl; pro-Skin-Mikrotexte.

*Begründung:* Substanz vor Form — eine bedeutungslose Seite hübsch zu machen kehrt die Werte um.
Die erste Phase macht die Seite *wahr*, die zweite macht sie *lebendig*.

## 9. Was raus ist

SIP / beruflicher Werdegang; das fake-BI-Dashboard (fig.01–05, Balken, Donut); die light/dark-Achse
+ Scroll-Flash-Experiment (gehörten zum alten Design).

## 10. Offene Punkte

- **Manifest-Text** noch offen (Platzhalter) — von Frank zu schreiben/schärfen.
- **Exakte Klima-Reihe:** Berkeley Earth (ab 1850) vs. NASA GISTEMP (ab 1880) — finale Wahl +
  Basisperiode im Implementierungs-Plan festzurren.
- **Entschieden:** Datenbasis = **global** (nicht national). Build = **Substanz vor Form**
  (Phase 1 = Klima-Ridgeline-Puls + schlanke Startseite, Phase 2 = Skins).
