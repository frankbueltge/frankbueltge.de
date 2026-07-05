"""Werk 4 'Parallaxe — Was jede Sprache verschweigt'. Teilt Image/venv mit dem Protokoll."""
LANGS = ("de", "en", "ru", "uk", "ar", "he", "zh", "ja", "fa", "tr", "es", "fr")
MIN_LANGS = 5          # Thema muss in >= so vielen Zielsprachen existieren
TOPIC_CAP = 24         # nächtlich bezahlbar
MODEL = "gemini-2.5-flash-lite"   # schnelle Variante; Themen werden zudem parallel verarbeitet
WORKERS = 2                       # Free-Tier-RPM: 8 parallele Gemini-Aufrufe liefen ins 429 (Diagnose 2026-07-02)
# Zusätzlich zur Parallelitäts-Grenze werden die Aufrufe zeitlich entzerrt (extract_llm._throttle),
# weil WORKERS=2 allein nicht reichte (2026-07-05: 1/24). Unter so vielen vermessenen Themen wird
# das gestrige Register behalten statt eines degenerierten committet (Vermerk bleibt ehrlich).
MIN_MEASURED_TO_PUBLISH = 8
# Domäne: Souveränitäts-/Territorialstreitigkeiten — dort ist Auslassung per Konstruktion
# bedeutsam (anders als bei beliebigen „umstrittenen" Themen, wo der Index Trivia misst).
# Die Kategorisierung ist Wikipedias eigene — niemand wählt per Thema aus.
SOURCE_CATEGORIES = ("States with limited recognition", "Disputed islands")
