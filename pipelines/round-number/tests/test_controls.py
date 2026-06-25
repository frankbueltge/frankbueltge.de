import random

from round_number.controls import false_positive_rate, sample_leading_digits


def test_sample_returns_digits_1_to_9():
    rng = random.Random(1)
    s = sample_leading_digits(1000, rng)
    assert len(s) == 1000 and set(s) <= set(range(1, 10))


def test_small_sample_has_high_false_positive_rate():
    # tiny n: clean Benford data frequently breaches the 0.015 MAD threshold
    fp = false_positive_rate(40, samples=300, seed=7)
    assert fp > 0.3


def test_large_sample_has_low_false_positive_rate():
    # large n: the test rarely flags clean data
    fp = false_positive_rate(5000, samples=200, seed=7)
    assert fp < 0.05


def test_deterministic_for_seed():
    assert false_positive_rate(100, samples=100, seed=3) == false_positive_rate(
        100, samples=100, seed=3
    )
