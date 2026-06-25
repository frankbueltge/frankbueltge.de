"""Curated, versioned watch-list for The Redaction.

Inclusion rule (documented, editorial — the instrument measures what it watches,
not "the internet"):
  1. official / governmental / intergovernmental page;
  2. carries verifiable claims or commitments (policy, statistics, statements —
     not pure nav/index pages);
  3. publicly consequential;
  4. captured by the Wayback Machine with reasonable frequency (so a before/after
     pair can exist).

This is a PROVISIONAL starter set for v1. Grow / curate by the rule above; every
change is noted in the Methodenblatt change-log. No partisan hot-buttons are
chosen for effect — the subject is structural removal from the record, not a
single story. Dead or rarely-archived URLs surface as honest skips in the daily
run and should be pruned here.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WatchItem:
    url: str
    institution: str
    label: str


WATCHLIST: list[WatchItem] = [
    # — World Health Organization —
    WatchItem("https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
              "WHO", "Klimawandel und Gesundheit"),
    WatchItem("https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health",
              "WHO", "Luftqualität und Gesundheit"),
    WatchItem("https://www.who.int/news-room/fact-sheets/detail/tobacco",
              "WHO", "Tabak (Fact Sheet)"),
    WatchItem("https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
              "WHO", "Übergewicht und Adipositas"),

    # — United Nations —
    WatchItem("https://www.un.org/en/climatechange/science/causes-effects-climate-change",
              "UN", "Ursachen und Folgen des Klimawandels"),
    WatchItem("https://www.un.org/en/global-issues/human-rights",
              "UN", "Menschenrechte (Global Issues)"),
    WatchItem("https://www.un.org/en/climatechange/net-zero-coalition",
              "UN", "Net-Zero-Koalition"),

    # — UNHCR —
    WatchItem("https://www.unhcr.org/refugee-statistics/",
              "UNHCR", "Flüchtlingsstatistik"),

    # — IPCC —
    WatchItem("https://www.ipcc.ch/sr15/",
              "IPCC", "Sonderbericht 1,5 °C"),
    WatchItem("https://www.ipcc.ch/report/ar6/wg1/",
              "IPCC", "Sechster Sachstandsbericht, WG I"),

    # — European Commission —
    WatchItem("https://climate.ec.europa.eu/eu-action/climate-strategies-targets/2030-climate-targets_en",
              "EU-Kommission", "Klimaziele 2030"),
    WatchItem("https://climate.ec.europa.eu/eu-action/climate-strategies-targets/2050-long-term-strategy_en",
              "EU-Kommission", "Langfriststrategie 2050"),
    WatchItem("https://commission.europa.eu/strategy-and-policy/priorities-2024-2029_en",
              "EU-Kommission", "Prioritäten 2024–2029"),

    # — NASA —
    WatchItem("https://climate.nasa.gov/evidence/",
              "NASA", "Belege für den Klimawandel"),
    WatchItem("https://climate.nasa.gov/vital-signs/carbon-dioxide/",
              "NASA", "Vital Signs: Kohlendioxid"),
    WatchItem("https://climate.nasa.gov/vital-signs/global-temperature/",
              "NASA", "Vital Signs: Globale Temperatur"),

    # — NOAA / climate.gov —
    WatchItem("https://www.climate.gov/news-features/understanding-climate/climate-change-global-temperature",
              "NOAA", "Globale Temperatur (Erklärstück)"),
    WatchItem("https://www.climate.gov/news-features/understanding-climate/climate-change-atmospheric-carbon-dioxide",
              "NOAA", "Atmosphärisches CO₂ (Erklärstück)"),

    # — US EPA —
    WatchItem("https://www.epa.gov/climate-change",
              "EPA", "Klimawandel (Übersicht)"),
    WatchItem("https://www.epa.gov/ghgemissions/overview-greenhouse-gases",
              "EPA", "Treibhausgase im Überblick"),
    WatchItem("https://www.epa.gov/climateindicators",
              "EPA", "Klimaindikatoren"),

    # — US CDC —
    WatchItem("https://www.cdc.gov/climate-health/php/effects/index.html",
              "CDC", "Gesundheitsfolgen des Klimawandels"),
    WatchItem("https://www.cdc.gov/tobacco/data_statistics/fact_sheets/fast_facts/index.htm",
              "CDC", "Tabak: Fast Facts"),

    # — US Bureau of Labor Statistics —
    WatchItem("https://www.bls.gov/cps/",
              "BLS", "Current Population Survey"),
    WatchItem("https://www.bls.gov/news.release/empsit.nr0.htm",
              "BLS", "Employment Situation (Pressemitteilung)"),

    # — US State Department —
    WatchItem("https://www.state.gov/policy-issues/climate-and-environment/",
              "US State Dept", "Klima und Umwelt (Policy)"),

    # — US Census Bureau —
    WatchItem("https://www.census.gov/topics/income-poverty/poverty.html",
              "US Census", "Armut (Themenseite)"),

    # — White House (high churn between administrations) —
    WatchItem("https://www.whitehouse.gov/priorities/",
              "White House", "Prioritäten"),

    # — UK Government —
    WatchItem("https://www.gov.uk/government/publications/net-zero-strategy",
              "UK Gov", "Net-Zero-Strategie"),
    WatchItem("https://www.gov.uk/guidance/climate-change-explained",
              "UK Gov", "Klimawandel erklärt"),

    # — German Federal Government —
    WatchItem("https://www.bundesregierung.de/breg-de/schwerpunkte/klimaschutz",
              "Bundesregierung", "Klimaschutz (Schwerpunkt)"),

    # — IEA —
    WatchItem("https://www.iea.org/reports/net-zero-by-2050",
              "IEA", "Net Zero by 2050"),
]
