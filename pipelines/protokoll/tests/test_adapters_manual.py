from datetime import date

import httpx

from protokoll.adapters import food, population, refugees
from protokoll.adapters.base import Context


def ctx(today=date(2026, 6, 12)):
    return Context(client=httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(500))), today=today, env={})


def test_population_extrapolates_from_reference():
    m = population.measure(ctx(today=population.REF_DATE))
    assert m.value == population.REF_POP
    m2 = population.measure(ctx(today=date(2025, 7, 11)))  # 10 Tage später
    assert m2.value == population.REF_POP + 10 * population.NET_PER_DAY
    assert m2.as_of == "2025-07-11"


def test_refugees_reads_bundled_data():
    m = refugees.measure(ctx())
    assert m.value == 122_600_000 and m.as_of == "2024-12-31"


def test_food_reads_bundled_data():
    m = food.measure(ctx())
    assert m.value == 128.0 and m.as_of == "2026-05-31"


def test_cadences_are_honest():
    assert population.SPEC.cadence == "computed"
    assert refugees.SPEC.cadence == "periodic"
    assert food.SPEC.cadence == "monthly"
