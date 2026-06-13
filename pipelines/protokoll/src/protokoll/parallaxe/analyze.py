"""Reine Auswertung der Auslassungs-Matrix — keine I/O, voll getestet."""
from __future__ import annotations


def omission_index(claims: list[dict], langs: list[str]) -> dict[str, float]:
    """Je Sprache: Anteil der Aussagen, den diese Version verschweigt. Fehlt der Sprach-
    Schlüssel einer Aussage, gilt das als 'verschweigt'. Claims tragen Schlüssel 'nach_sprache'."""
    out: dict[str, float] = {}
    for lang in langs:
        if not claims:
            out[lang] = 0.0
            continue
        omitted = sum(
            1 for c in claims
            if c.get("nach_sprache", {}).get(lang, "verschweigt") == "verschweigt"
        )
        out[lang] = round(omitted / len(claims), 4)
    return out


def mean_omission(omission_by_lang: dict[str, float]) -> float:
    """Mittlerer Auslassungsanteil über die Sprachen; 0.0 wenn leer."""
    if not omission_by_lang:
        return 0.0
    return round(sum(omission_by_lang.values()) / len(omission_by_lang), 4)


def lemma_divergent(lemma: dict[str, str]) -> bool:
    """Wahr, wenn die Menge der nicht-leeren Primärnamen >= 2 distinkte Werte enthält
    (case-insensitive, getrimmt)."""
    names = {v.strip().lower() for v in lemma.values() if v and v.strip()}
    return len(names) >= 2
