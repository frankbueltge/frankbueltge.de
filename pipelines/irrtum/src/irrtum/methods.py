"""Offener Katalog benannter Methoden künstlerischer Forschung (MVP-Auswahl)."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Method:
    name: str
    lens: str  # knapper Deut-Auftrag, geht in den Prompt


METHODS: list[Method] = [
    Method("Kartografie", "Lies die beiden Größen als Orte einer Karte; was grenzt woran, was liegt im Zentrum, was am Rand?"),
    Method("Institutionskritik", "Frage, wessen Interesse es dient, dass diese beiden Größen so gemessen werden — und was die Messung verschweigt."),
    Method("Material thinking", "Behandle die Korrelation als Material mit Eigenwillen; was will sie werden, woran leistet sie Widerstand?"),
    Method("Design fiction", "Erfinde eine nahe Zukunft, in der dieser Zusammenhang als Tatsache gilt; was folgt daraus?"),
]


def pick_method(date_iso: str) -> Method:
    ordinal = int(date_iso.replace("-", ""))
    return METHODS[ordinal % len(METHODS)]
