"""Werk 4 'Parallaxe — Was jede Sprache verschweigt'. Teilt Image/venv mit dem Protokoll."""
LANGS = ("de", "en", "ru", "uk", "ar", "he", "zh", "ja", "fa", "tr", "es", "fr")
MIN_LANGS = 5          # Thema muss in >= so vielen Zielsprachen existieren
TOPIC_CAP = 24         # nächtlich bezahlbar
MODEL = "gemini-2.5-flash-lite"   # schnelle Variante; Themen werden zudem parallel verarbeitet
WORKERS = 8                       # parallele Themen-Verarbeitung — bändigt die Wandzeit
# Domäne: Souveränitäts-/Territorialstreitigkeiten — dort ist Auslassung per Konstruktion
# bedeutsam (anders als bei beliebigen „umstrittenen" Themen, wo der Index Trivia misst).
# Die Kategorisierung ist Wikipedias eigene — niemand wählt per Thema aus.
SOURCE_CATEGORIES = ("States with limited recognition", "Disputed islands")
