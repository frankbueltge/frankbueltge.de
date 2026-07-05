"""Werk 4 'Parallaxe — Was jede Sprache verschweigt'. Teilt Image/venv mit dem Protokoll."""
LANGS = ("de", "en", "ru", "uk", "ar", "he", "zh", "ja", "fa", "tr", "es", "fr")
MIN_LANGS = 5          # Thema muss in >= so vielen Zielsprachen existieren
TOPIC_CAP = 24         # Länge der gerankten Liste = Länge der Tages-Rotation (~24 Tage bis Refresh)
MODEL = "gemini-2.5-flash-lite"   # schnelle Variante; genau EIN Aufruf pro Tag (rotierendes Thema)
# Ein Thema pro Tag statt aller 24 (extract_llm/run.py): der Gemini-Free-Tier trug die 24
# nächtlichen Extraktionen nicht (2026-07: 1–3/24 durchgekommen, meist 429). Bei einem Aufruf
# täglich ist das Rate-Limit kein Thema mehr; die Matrix baut sich über die Rotation auf.
# Domäne: Souveränitäts-/Territorialstreitigkeiten — dort ist Auslassung per Konstruktion
# bedeutsam (anders als bei beliebigen „umstrittenen" Themen, wo der Index Trivia misst).
# Die Kategorisierung ist Wikipedias eigene — niemand wählt per Thema aus.
SOURCE_CATEGORIES = ("States with limited recognition", "Disputed islands")
