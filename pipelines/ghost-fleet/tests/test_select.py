from datetime import date

from ghost_fleet.select import ended_within, index, plausible, rank, salience

TODAY = date(2026, 6, 25)


def ev(id="e", end="2026-06-24T00:00:00Z", dur=10.0, no_take=False, mpa=False, eez=None, high=False):
    return {"id": id, "end": end, "duration_hours": dur,
            "regions": {"mpa": mpa, "no_take": no_take, "eez": eez or [], "high_seas": high}}


def test_ended_within():
    assert ended_within(ev(end="2026-06-24T12:00:00Z"), TODAY) is True
    assert ended_within(ev(end="2026-06-18T00:00:00Z"), TODAY) is True   # exactly 7 days
    assert ended_within(ev(end="2026-06-17T00:00:00Z"), TODAY) is False  # 8 days
    assert ended_within(ev(end="2026-06-26T00:00:00Z"), TODAY) is False  # future


def test_plausible():
    assert plausible(ev(dur=10)) is True
    assert plausible(ev(dur=0)) is False
    assert plausible(ev(dur=2000)) is False  # > 1440h cap


def test_salience_region_order():
    nt = salience(ev(no_take=True, dur=1))
    m = salience(ev(mpa=True, dur=1))
    e = salience(ev(eez=["1"], dur=1))
    h = salience(ev(dur=1))
    assert nt > m > e > h


def test_salience_duration_tiebreak_within_region():
    assert salience(ev(mpa=True, dur=100)) > salience(ev(mpa=True, dur=10))


def test_rank_deterministic():
    assert rank([ev("a", mpa=True, dur=5), ev("b", no_take=True, dur=5)]) == "b"
    assert rank([]) is None
    # tie on salience → smaller id wins, regardless of order
    assert rank([ev("d", mpa=True, dur=5), ev("c", mpa=True, dur=5)]) == "c"


def test_index():
    evs = [ev(no_take=True, mpa=True, dur=10), ev(high=True, dur=5), ev(eez=["8"], dur=3)]
    i = index(evs, total=99)
    assert i["total"] == 99 and i["dark_hours_examined"] == 18.0
    assert i["in_mpa"] == 1 and i["in_no_take"] == 1
    assert i["on_high_seas"] == 1 and i["in_eez"] == 1
