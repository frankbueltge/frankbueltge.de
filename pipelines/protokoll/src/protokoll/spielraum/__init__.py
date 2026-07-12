"""Werk „Spielraum" — monatlicher Watcher für Hyperscaler-Nachhaltigkeitsberichte.

Prüft bekannte Report-Landingpages auf Neues und meldet per GitHub-Issue. Parst KEINE
PDFs, schreibt NIE ans Daten-Register (src/data/spielraum/register.json) — ein
verifizierter Ingest passiert später manuell in einer eigenen Session.
"""
PIPELINE_VERSION = "0.1.0"
SCHEMA_VERSION = "1"
