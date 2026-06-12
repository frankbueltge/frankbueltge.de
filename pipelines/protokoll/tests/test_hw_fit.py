import math

from protokoll.halbwertszeit.fit import fit_series


def synth(lam=0.07, peak=20_000, baseline=120, days=80, start="2026-03-01"):
    from datetime import date, timedelta
    d0 = date.fromisoformat(start)
    out = []
    for i in range(days):
        v = baseline + peak * math.exp(-lam * i)
        out.append(((d0 + timedelta(days=i)).isoformat(), int(round(v))))
    return out


def test_fit_recovers_lambda_on_settled_decay():
    # Ausgeklungene Serie (Sockel erreicht): Schätzer trifft λ präzise.
    r = fit_series(synth(lam=0.07, days=150, start="2026-01-01"), today="2026-06-13")
    assert r.status == "gemessen"
    assert abs(r.lambda_per_day - 0.07) < 0.005
    assert abs(r.halflife_days - math.log(2) / 0.07) < 0.8
    assert r.r2 > 0.95
    assert r.peak_day == "2026-01-01"


def test_fit_overestimates_lambda_while_still_decaying():
    # Dokumentierte Schätzer-Eigenschaft (Methodenblatt): Vor Erreichen des Sockels
    # wird der Sockel über- und λ überschätzt — Messung gilt als konservativ.
    r = fit_series(synth(lam=0.07, days=80), today="2026-06-13")
    assert r.status == "gemessen"
    assert 0.07 < r.lambda_per_day < 0.11


def test_low_peak_is_not_measurable():
    s = [(d, max(1, v // 100)) for d, v in synth(peak=900, baseline=5)]
    r = fit_series(s, today="2026-06-13")
    assert r.status == "nicht_messbar"
    assert r.lambda_per_day is None and r.halflife_days is None


def test_recent_event_is_running():
    r = fit_series(synth(days=10, start="2026-06-04"), today="2026-06-13")
    assert r.status == "laeuft"


def test_noise_without_decay_is_not_measurable():
    s = [(d, 1500 + (i * 37) % 200) for i, (d, _) in enumerate(synth(days=60))]
    r = fit_series(s, today="2026-06-13")
    assert r.status == "nicht_messbar"
