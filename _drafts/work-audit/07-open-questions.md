# Werk-Audit 07 — Offene Fragen (gesammelt)

> Aggregation aller ZU-KLÄREN-Punkte aus den Dossiers 01–05, thematisch gruppiert.
> Adressat: Frank (inhaltliche/ethische Entscheidungen) bzw. Verifikation am Repo/Deployment.
> Keine Bewertung — nur offene Punkte.

## A. Außentext & Konsistenz
- **Parallaxe „acht Sprachversionen" vs. 12 in der Pipeline** (`werke.ts` ↔ `parallaxe/__init__.py`)
  — angleichen. *(hoch)*
- **„Die Police" vs. ID/Route `praemie`** — Doppelung beibehalten oder vereinheitlichen?
- **Reihen-/Werktitel** insgesamt (vgl. separate Entscheidung „Werktitel EN", `_drafts/12`) —
  Auswirkung auf Protokoll-Register-Strings (Testschutz) beachten.
- **Verbatim-Prüfungen:** Teaser-Formel „der Planet, die Gewalt, der Blick" (Protokoll);
  Halbwertszeit-Kopfzahl + physikalische Vergleichskonstanten; Parallaxe-Kopfprozent
  (`mean_omission_index`); Police-Tagesstände.

## B. Daten & Quellen
- **Protokoll:** Status der angekündigten **dbt-Lineage**; redaktionelle Pflege UNHCR/FAO
  (Auslöser, Verantwortung); SST-Feed (Forschungsprojekt) langfristig stabil?
- **Halbwertszeit:** Begründung der **18-Sprachen-Auswahl**; Wachstumsgrenze des Registers
  (Archivierungsregel?); Prototyp-Zahlen verifizieren.
- **Parallaxe:** Begründung der **12-Sprachen-Auswahl**; ist Senkaku im aktuellen Register?;
  Wikipedia-Kategorien-Bias (dokumentiert, aber Umgang?).
- **Die Police:** Fortführung der NOAA-Reihe ab 2025 (Climate Central) — automatischer Wechsel?;
  Repräsentativität „Rückzug = nur Kalifornien".
- **Überflug:** Überschreiben vs. Akkumulation — Zeitreihe gewünscht?

## C. Methode & Technik
- **Parallaxe:** Validierung/Auditing der LLM-Urteile (Stichprobe/zweite Instanz)?
- **Halbwertszeit:** Status-Bezeichner final („laeuft" vs. „vorläufig"); Sockel-Definition.
- **Überflug:** Worker-Race-Fix verifizieren; Architektur für eine spätere Zeitreihe.
- **Allgemein:** Verhältnis Protokoll ↔ Halbwertszeit/Parallaxe/Police (gemeinsame Daten/
  Reihenfolge/Abhängigkeiten?).

## D. Ethik
- **Halbwertszeit:** explizites Ethik-Statement (über Transparenz hinaus)?; Begleittext/
  Interpretationshilfe zu `views_per_death` (Missdeutung „Wert eines Lebens").
- **Parallaxe:** öffentlicher Hinweis „**Auslassung ≠ Zensur**" (Knappheit vs. Haltung);
  Rahmung geopolitisch heikler Themen (z. B. Israel/Palästina, Senkaku).
- **Protokoll:** ethische Rahmung der Leid-TOPs (Vertreibung/Konflikt) und der Westzentrierung
  (GDELT/Wikipedia) — öffentlich erwünscht?
- **Die Police:** Hauptseiten-Disclaimer (Index-Kunstwerk, keine versicherbare Quote);
  Darstellung von Toten ohne Kontext.

## E. Deployment & Betrieb (durchgängig zu verifizieren)
- **Tatsächliche Cloud-Scheduler-Zeiten** je Pipeline (Spec nennt 03:30/04:00/04:30/05:30 UTC;
  nicht im Repo verifizierbar).
- **Deployment-Status** (Cloud Run Jobs, Secrets, Budget-Alerts) — existiert/aktiv?
- **Überflug-Action** läuft (täglich 05:00 UTC) — bestätigt durch committete Snapshots; übrige
  Pipelines committen über „Protokollführung" (Verifikation der Job-Konfiguration offen).

## F. Werkform & Anschluss
- **Kategorie „Studie/Etüde"** offiziell definiert (vs. Ad-hoc-Label für Gate-Durchfaller)?
- **Formwechsel-Optionen** je Arbeit (Druckobjekt/Sonifikation/Exposition/Dataset) — welche
  zuerst prüfen? (siehe Einzeldossiers §8).
- **Überflug:** Bedingung für „Werk-Werdung" (Akkumulation) — verfolgen oder ruhen lassen?
- **Formhomogenität** der vier Register — bewusst halten oder ein Mittel verbreitern?

## G. Verifikations-Liste (Repo-intern, ohne Frank)
- Exakte Zeilennummern/Commit-IDs aus der Erhebung gegen die Dateien prüfen, bevor irgendetwas
  davon öffentlich zitiert wird (gilt für alle Dossiers).
- `register.json`/`police.json`/`satellites.json` Tagesstände bei Verwendung neu auslesen
  (ändern sich nächtlich).
- Parallaxe-Prototyp-Zahlen gegen `docs/superpowers/artifacts/2026-06-14-parallaxe-prototyp.json`
  und Spec gegenlesen (0,138 / 0,111 / 0,117 / 0,12 / Faktor 1,2 bzw. 0,97).

---

## Pro Arbeit — die jeweils wichtigste offene Frage
- **Das Protokoll:** Wie verhalten sich die vier Arbeiten zueinander (eine Reihe, vier
  Instanzen desselben Typs) — und soll die Bias-/Leid-Ethik öffentlich gerahmt werden?
- **Halbwertszeit:** Braucht die Opfer-/Aufmerksamkeits-Quantifizierung ein explizites
  Ethik-Statement?
- **Parallaxe:** Wie wird das LLM-Vertrauen gehärtet (Validierung) und „Auslassung ≠ Zensur"
  öffentlich klargestellt?
- **Die Police:** Braucht die Hauptseite einen Disclaimer, und bleibt der US-Fokus so?
- **Überflug:** Wird die skizzierte Zeitreihen-These je verfolgt — oder bleibt es dauerhaft Studie?
