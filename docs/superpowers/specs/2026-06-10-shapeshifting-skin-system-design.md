# Shape-Shifting Skin System — Design Spec

- **Project:** frankbueltge.de
- **Date:** 2026-06-10
- **Status:** Draft for review
- **Author:** Frank Bültge (mit Claude)

---

## 1. Vision / Nordstern

frankbueltge.de ist das **Labor eines Data Artists mit Engineering-Fundament**. Die Seite hat
**keinen festen Stil** — ihre komplette Art Direction wechselt fortlaufend durch radikal
verschiedene Design-Sprachen (Bauhaus, Tron, Brutalismus, Terminal, … später mehr).

> **Der Fluss selbst ist die Kunst.** Eine Signatur-Form (der Joy-Division-Puls), unendlich neu
> angezogen. Die Seite ist „dieselbe Person in wechselnden Kostümen", nicht 13 fremde Websites.

Die zentrale Pointe für die Produkt-Strategie:

> **Die wachsende Sammlung von Skins IST das „Lab".** Jeder neue Stil ist ein Experiment.
> Es gibt kein „erst Struktur, dann Inhalt" — der Inhalt der Seite *ist die Seite selbst, immer
> wieder neu gestaltet*. Wachsen heißt: einen weiteren Skin bauen.

## 2. Ziele & Nicht-Ziele

**Ziele (v1):**
- Eine **Skin-Engine**, die *Inhalt* sauber von *Art Direction* trennt.
- **4 kompromisslos gestaltete Skins:** Bauhaus, Tron, Brutalismus, Terminal.
- **Automatischer Zyklus** als Standard-Wechselmodus, mit Leitplanken (s. §5).
- Der **Joy-Division-Puls** als skin-fähige Signatur-Konstante.
- Eine schlanke Startseite: Puls-Hero + minimaler Statement-Text + leichter Lab-Platzhalter.

**Nicht-Ziele (v1, bewusst aufgeschoben):**
- SIP / beruflicher Werdegang / „Works"-Sektion — **komplett raus** (steht auf LinkedIn).
- Das fake-BI-Dashboard (fig.01–05, Capability-Balken, Fokus-Donut) — **wird stillgelegt**.
- Datengetriebene Skin-Auswahl (Wetter → Palette o. ä.) — Zukunft.
- Echte Lab-Inhalts-Stücke / Artistic-Research-Artikel — Zukunft.
- Pro-Skin-Mikrotexte (Tonfall ändert sich mit) — Zukunft (Architektur lässt es zu).
- Mehr als 4 Skins — wachsen später als „Lab".

## 3. Publikum & Positionierung

Kein Bewerbungs-Portfolio. Publikum: neugierige Menschen, die datavism-/data-art-Community,
Gleichgesinnte. Damit gewinnt **„originell/progressiv" klar vor „konventionell verständlich"**.
Die Seite darf fordern, überraschen, Haltung zeigen.

## 4. Architektur

### 4.1 Was ist ein „Skin"?

Ein Skin ist eine **vollständige Designsprache**, nicht ein Farb-Swap:

| Dimension      | Beispiel-Variation                                            |
|----------------|---------------------------------------------------------------|
| Typografie     | Font-Familien, Größen-Rhythmus, Tracking, Case                |
| Farbe          | komplette Palette inkl. Hintergrund (hell *oder* dunkel)      |
| Layout-Akzente | Raster, Ränder, Radius, Abstände, Ausrichtung                 |
| Textur         | Grain, Scanlines, Papier, Glow, „nichts"                      |
| Motion         | Easing/Tempo der Mikro-Interaktionen                          |
| Cursor         | Custom-Cursor pro Skin (optional)                             |
| Puls-Treatment | wie sich der Joy-Division-Puls in diesem Skin zeichnet        |

### 4.2 Der `data-skin`-Mechanismus (generalisiert das bestehende `data-theme`)

Das Repo nutzt heute schon `:root[data-theme='light']`, um den Token-Satz in `global.css`
umzuschalten. **Die Skin-Engine generalisiert genau dieses Muster** zu
`<html data-skin="bauhaus|tron|brutalism|terminal">`.

- Jeder Skin definiert in `global.css` einen vollständigen Block:
  `:root[data-skin='bauhaus'] { … alle --color-*, --font-*, --rgb-*, --puls-* … }`
  plus skin-spezifische Regeln (`:root[data-skin='bauhaus'] .hero-title { … }`, Texturen, Cursor).
- **Eine DOM, ein Content-Baum.** Layout-Unterschiede entstehen über CSS, das unter dem
  Skin-Selektor gescoped ist — nicht über separate Templates.
- **Light/Dark-Achse entfällt** als eigene Dimension: jeder Skin bringt seinen eigenen
  Hintergrund mit (Bauhaus hell, Tron/Terminal dunkel, Brutalismus stark hell). Das bestehende
  `data-theme='light'` + die Scroll-Flash-Experiment-CSS werden **stillgelegt** (gehörten zum
  alten Design; der Skin-Zyklus ersetzt diese Art von Dynamik).

*Verworfene Alternativen:* (B) dynamisch geladene Stylesheets pro Skin und (C) komplette
Template-Sätze pro Skin — beide brechen die Konstante „ein Inhalt, viele Kostüme", erhöhen
Wartung und Flicker-Risiko. Der Token-/Scoped-CSS-Ansatz ist performant und kohärent.

### 4.3 Der Skin-Controller (Auto-Zyklus + Leitplanken)

Neues Modul (z. B. `src/scripts/skin-cycle.ts`), gemountet in `Base.astro`:

- **Anti-FOUC:** ein winziges Inline-Skript im `<head>` setzt das initiale `data-skin`
  *vor* dem ersten Paint (analog zum üblichen Theme-Init-Pattern).
- **Auto-Zyklus:** wechselt `data-skin` in festem Intervall (**Default ~12 s** Verweildauer —
  lang genug zum Lesen, springt nie hart mitten im Satz).
- **Übergang:** kurzer **Dissolve-Overlay** (~600 ms: ausblenden → `data-skin` tauschen →
  einblenden). Fängt harte Typo-/Layout-Sprünge ab, die reine CSS-Transitions nicht glätten.
  Farb-Transitions zusätzlich über CSS (Muster existiert via `.theme-flash`).
- **Pause bei Interaktion:** Hover/Focus/aktives Scrollen pausiert den Zyklus.
- **Manueller Switcher + Lock:** kleine `◀ ▶`-Steuerung + Lock-Toggle (neue Komponente
  `SkinSwitcher.astro`). Ein Besucher kann einen Skin festhalten. Billig, rettet Benutzbarkeit.
- **Reduced-Motion:** `prefers-reduced-motion: reduce` → **kein** Auto-Zyklus, ein statischer
  Start-Skin, Wechsel nur manuell, kein Dissolve.

### 4.4 Die Konstante: skin-fähiger Joy-Division-Puls

`HeroField.astro` liest bereits `--rgb-accent/-soft/-cyan/-bg` und hat einen
`MutationObserver` auf `data-theme`. Erweiterung:

1. `data-skin` zur `attributeFilter`-Liste des Observers hinzufügen → Puls recolort beim Wechsel.
2. **Render-Parameter pro Skin** über neue CSS-Vars, die der Canvas liest:
   - `--puls-mode`: `solid` | `glow` | `raw` | `ascii`
   - `--puls-line-width`, `--puls-glow` (0/1), Palette via bestehende `--rgb-*`.
3. Render-Zweige im Canvas je `--puls-mode` (s. §6 für die 4 Ausprägungen).

*Eine Form, vier Gewänder* = der Wiedererkennungs-Anker über alle Skins.

> **Update (Phase 1 umgesetzt):** Die Puls-**Geometrie** ist nicht mehr generativ, sondern
> echte NASA-GISTEMP-Klimadaten (`src/lib/climate.ts` → `HeroField.astro`). Phase 2 legt nur
> noch das **Styling** pro Skin darüber (`--puls-mode`/Farben). Geometrie = Daten, Styling = Skin.

## 5. Leitplanken (verbindlich für jeden Skin)

- **Kontrast-Floor:** Fließtext muss WCAG-AA-Kontrast (≥ 4.5:1) gegen seinen Hintergrund treffen —
  auch „maximal/raw"-Skins. (Brutalismus/Terminal sind hier unkritisch, Tron-Neon braucht Sorgfalt.)
- **Reduced-Motion:** s. §4.3 — kein Auto-Zyklus, statischer Puls-Frame (Mechanik existiert schon).
- **Performance:** Skins sind CSS-getrieben; keine schweren Assets pro Skin in v1 (Texturen als
  CSS-Gradients/SVG, nicht als große Bilder). Puls bleibt bei ≤ 30 fps, pausiert off-screen.
- **Kein Layout-Shift-Chaos:** Container-Skelett bleibt stabil; Skins variieren *innerhalb* der
  Boxen (Typo, Farbe, Rand, Textur), nicht die Seiten-Topologie.

## 6. Die 4 Start-Skins (Art Direction)

**Bauhaus** — der rationale Pol. Primärfarben (Rot/Blau/Gelb) auf Weiß, geometrische Sans
(Futura-artig), strenges Raster, harte Kreis/Dreieck/Quadrat-Akzente. *Puls:* `--puls-mode: solid`,
dicke, satt-bunte Linien.

**Tron** — der Neon-Pol. Schwarz, Cyan/Magenta, Grid-Horizont, glühende Kanten (baut auf den
vorhandenen Mono-Neon-Effekten auf). *Puls:* `--puls-mode: glow`, leuchtende Linien + Bloom-Dots.

**Brutalismus** — der Anti-Ästhetik-Pol. System-Font, stark-weißer Grund, schwarze 2–4px-Ränder,
unterstrichene Links, kein Radius, kein Schliff. *Puls:* `--puls-mode: raw`, rohe schwarze Striche,
keine Dots/kein Glow.

**Terminal** — der funktionale Pol. Grün auf Schwarz, Monospace durchgängig, blinkender Cursor,
ASCII-Ornamente. *Puls:* `--puls-mode: ascii`, Ridgeline aus Zeichen (`/\._-`) statt Linien.

## 7. Betroffene Dateien

**Ändern:**
- `src/styles/global.css` — 4 `[data-skin='…']`-Token-Blöcke + skin-spezifische CSS, Dissolve-
  Overlay-Styles; Stilllegung von `data-theme='light'` + Scroll-Flash-Regeln.
- `src/components/HeroField.astro` — `data-skin` im Observer; `--puls-*` lesen; 4 Render-Zweige.
- `src/layouts/Base.astro` — Anti-FOUC-Init, Controller + Switcher mounten; alte Scroll-Flash-/
  Theme-Flash-Logik entfernen; `theme-color`-Meta pro Skin (optional).
- `src/pages/index.astro` + `src/pages/en/index.astro` — BI-Dashboard entfernen, schlanke
  Startseite (Puls-Hero + Statement + Lab-Platzhalter).
- `src/components/HomeContent.astro` — auf das neue, schlanke Layout reduzieren.

**Neu:**
- `src/scripts/skin-cycle.ts` — Auto-Zyklus-Controller + Leitplanken.
- `src/components/SkinSwitcher.astro` — `◀ ▶`/Lock-UI.

**Stilllegen / entfernen (aus dem Startseiten-Pfad):**
- `src/components/Dashboard.astro` (BI-Dashboard) — aus der Startseite ausgehängt. Datei kann
  bleiben (Referenz) oder gelöscht werden — Entscheidung im Plan.
- `src/data/dashboard.ts` — nicht mehr referenziert, sobald Dashboard raus ist.

## 8. Testing-Strategie

- **Visuell pro Skin:** Screenshot je Skin (Playwright/Chrome-DevTools) bei Desktop + Mobile;
  Kontrast-Check des Fließtexts gegen den Skin-Hintergrund.
- **Controller:** Auto-Zyklus wechselt nach Intervall; Pause bei Hover/Focus/Scroll; manueller
  Switcher + Lock; `prefers-reduced-motion` → kein Zyklus, statischer Puls.
- **Anti-FOUC:** erster Paint zeigt sofort einen vollständigen Skin (kein Flash von ungestyltem
  oder Default-Inhalt).
- **Puls:** recolort/rezeichnet bei `data-skin`-Wechsel in allen 4 Modi; statischer Frame unter
  reduced-motion.
- **Build:** `npm run build` grün; `npm run lint` grün.

## 9. Zukunft (= das wachsende Lab, nicht v1)

Weitere Skins (50er, Dada, Surrealismus, Steampunk, Fast-Food, Minimal/Maximal, …); datengetriebene
Skin-Auswahl; tiefere Hero-Neuinterpretation pro Skin; echte Lab-Stücke als Inhalt; pro-Skin-
Mikrotexte/Tonfall.

## 10. Offene Punkte / Risiken

- **Aufwand pro Skin** ist echte Design-Arbeit — halbherzig wirkt als Gimmick. Mitigation: nur 4
  in v1, Engine so bauen, dass ein 5. Skin billig ist.
- **Auto-Zyklus** ist der riskanteste Wechselmodus (Lesbarkeit). Mitigation: lange Verweildauer,
  Dissolve, Pause-bei-Interaktion, Lock, reduced-motion-Ausnahme.
- **Kohärenz vs. Chaos:** ohne die Puls-Konstante + stabiles Skelett kippt „ALLES" in Beliebigkeit.
- **Tailwind v4 `@theme`-Tokens** vs. laufzeit-geswitchte `[data-skin]`-Vars: prüfen, dass die
  von `@theme` erzeugten Utilities (`bg-bg` etc.) korrekt auf die per-Skin überschriebenen
  `--color-*` zugreifen (das `data-theme='light'`-Muster belegt, dass es funktioniert).
