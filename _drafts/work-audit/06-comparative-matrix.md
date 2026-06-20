# Werk-Audit 06 — Vergleichsmatrix

> **Beobachtungen** zur späteren Bewertung — **keine** Endurteile, **keine** Empfehlung
> „behalten/verwerfen" (nur „zu prüfen"). „Datenqualität/Methodenqualität" meinen hier
> *Belastbarkeit* (Provenienz, Determinismus, Guards), nicht Geschmack. Risiken: niedrig/
> mittel/hoch als Beobachtung (Begründung in den Einzeldossiers 01–05).
> Wegen Breite in zwei Tabellen (Arbeiten als Zeilen).

## Tabelle A — Status & Eigenschaften

| Arbeit | Werkstatus heute | Stärkste Eigenschaft (Beobachtung) | Schwächste Eigenschaft (Beobachtung) | Datenqualität (Belastbarkeit) | Methodenqualität (Belastbarkeit) | Künstlerische Eigenständigkeit (Beobachtung) |
|---|---|---|---|---|---|---|
| **Das Protokoll** | live | Konsequente Form (täglich, deterministisch, „Beschluss: vertagt"); echtes Git-Archiv | Heterogene, teils westzentrierte Quellen; Nähe zum Lagebericht | hoch — 12 offene Quellen, Lizenz je Eintrag, Korridor-/Stale-/Finite-Guards | hoch — deterministisch, kein LLM, render-Tests schützen Register | hoch — Sitzungsprotokoll-Konzept trägt eigenständig |
| **Halbwertszeit** | live | Klare messbare These + Ethik-Disziplin (kein Ranking, chronologisch) | Quantifizierung von Aufmerksamkeit/Opfer ethisch heikel | hoch — Wikidata-Regel offen, Pageviews 18 Sprachen, Degenerate-Guard | hoch — log-linearer Fit, R²/Status-Schwellen, deterministisch | hoch — Physik-Analogie als eigenständige Setzung |
| **Parallaxe** | live | Starke Frage (Auslassung als Messgerät); publizierter Prompt; transparente Prüfbarkeit | LLM-Blackbox; geopolitische Sensibilität; „acht vs. 12 Sprachen" | mittel–hoch — Wikipedia-Kategorien (nicht neutral), nur Lead Sections | mittel–hoch — Aggregation deterministisch, **ein** LLM-Schritt (nicht erklärbar) | hoch — Auslassungsmatrix eigenständig; LLM-Nutzung erklärungsbedürftig |
| **Die Police** | live | Pointiertes Dokumentgenre (Police); harter Beleg (+179 %); Deutungs-Disclaimer | US-Zentrierung; Proxy-Validität; Titel-Pathos | mittel–hoch — 4 Public-Domain-Quellen, US-only, NOAA endet 2024 | hoch — deterministisch, kein LLM, Sektion-Guards, render-Tests | mittel–hoch — „dunkler Zwilling des Protokolls", finanznah |
| **Überflug** | **ausgemustert** (Lab-Studie) | Sauberes Handwerk (client-SGP4, lokal, datenschutzfreundlich) | **Keine These, keine Akkumulation** (Ausmusterungsgrund) | mittel — CelesTrak/GCAT offen, aber Überschreiben statt Archiv | hoch (technisch) — deterministisch, Validierungs-Schwellen | niedrig — bewusst „App, kein Werk" |

## Tabelle B — Risiken, Potenzial, nächste Prüfung

| Arbeit | Gimmick-Risiko | Ethik-Risiko | Ausbaupotenzial | Empfohlene nächste Prüfung (zu prüfen) | Wichtigste offene Frage |
|---|---|---|---|---|---|
| **Das Protokoll** | niedrig–mittel | mittel (Leid-TOPs, Quellen-Bias) | Druckedition/Jahresband, Sonifikation, dbt-Lineage | Ethik-Rahmung der Bias-/Leid-TOPs; dbt-Lineage-Status | Verhältnis zu den anderen drei Arbeiten (gemeinsame Daten?) |
| **Halbwertszeit** | mittel | **mittel–hoch** (Aufmerksamkeit/Opfer) | Sonifikation, Ethik-Begleitstück, Dataset | explizites Ethik-Statement über Transparenz hinaus? | Umgang/Begleittext zu `views_per_death` |
| **Parallaxe** | mittel | **mittel–hoch** (Geopolitik, „Auslassung ≠ Zensur") | Validierungsschicht, Zeitreihe, Quelltext-Verlinkung je Zelle | LLM-Validierung; „acht vs. 12" angleichen; Ethik-Hinweis | Sollen LLM-Urteile stichprobenartig geprüft werden? |
| **Die Police** | mittel | mittel (Tote ohne Kontext; „versicherbar?") | Druckobjekt „Police", Prämien-Zeitreihe | Hauptseiten-Disclaimer (Index-Kunstwerk)?; CA-Repräsentativität | ID/Route „praemie" vs. Titel „Die Police" beibehalten? |
| **Überflug** | **hoch** (selbst benannt) | niedrig | Akkumulation → messbare These (Experiment→Work) | Zeitreihe aufbauen?; i18n-/Routen-Bereinigung | Wird die im MDX skizzierte These je verfolgt? |

## Quer-Beobachtungen (zur Bewertung, nicht als Urteil)
- **Formhomogenität:** 4 × „laufendes Register/Messinstrument". Kohärenz vs. Monotonie — zu prüfen.
- **LLM nur in Parallaxe** → dort konzentriert sich das Erklär-/Vertrauensrisiko (durch
  publizierten Prompt teils adressiert).
- **Ethik-Tiefe ungleich:** Halbwertszeit/Police benennen Grenzen explizit; Protokoll/Parallaxe
  haben latente Bias-/Sensibilitätsthemen mit dünnerer öffentlicher Rahmung.
- **Belastbarkeit generell hoch:** offene Quellen, Determinismus, Guards, Tests durchgängig
  vorhanden; Hauptunsicherheit liegt in Deployment-Verifikation und Außentext-Konsistenz.
