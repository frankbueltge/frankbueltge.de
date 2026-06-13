"""Der publizierte Extraktions-Prompt — Teil der Transparenz des Werks (Methodenblatt zeigt ihn)."""
PROMPT = """Du vergleichst, wie dieselbe Sache in verschiedenen Sprachausgaben der Wikipedia beschrieben wird.
Unten der Einleitungstext eines Artikels in mehreren Sprachen (Sprachcode in eckigen Klammern).

Aufgaben:
1. lemma: Welchen PRIMÄRNAMEN verwendet jede Version für den Gegenstand?
2. claims: Erstelle eine konsolidierte Liste atomarer, faktischer oder rahmender AUSSAGEN, die in mindestens einer Version vorkommen (auf Deutsch, neutral formuliert).
3. Markiere für jede Aussage und jede Sprache: "nennt" (Version sagt es aus), "verschweigt" (fehlt), "widerspricht" (sagt Unvereinbares).
Sei konservativ: "nennt" nur, wenn die Version es wirklich aussagt.

Antworte als striktes JSON, keine Erklärung:
{"lemma": {"<lang>": "<name>"}, "claims": [{"aussage": "...", "nach_sprache": {"<lang>": "nennt|verschweigt|widerspricht"}}]}

Die Versionen:
"""
