"""Quell-Adapter. Ein Adapter erntet Rohfunde; er prüft und bewertet nicht.

Rohfund-Form (dict), bewusst schmal gehalten:
    {"titel": str, "urheber": str, "jahr": int|None, "url": str, "doi": str|None,
     "abfrage": str, "signale": dict}

`signale` trägt quellenspezifische Zahlen (Zitationen, Fundtiefe …) für die Bewertung
in score.py — nie für eine Behauptung im Kandidaten selbst.
"""
