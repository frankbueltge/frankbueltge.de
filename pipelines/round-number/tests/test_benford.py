import math

from round_number.benford import analyze, counts, expected, leading_digit, mad, verdict


def test_expected_is_benford_and_sums_to_one():
    e = expected()
    assert len(e) == 9
    assert abs(sum(e) - 1.0) < 1e-9
    assert abs(e[0] - math.log10(2)) < 1e-9  # P(1) = log10(2) ≈ 0.301


def test_leading_digit():
    assert leading_digit(1234) == 1
    assert leading_digit(0.0042) == 4
    assert leading_digit(-95.6) == 9
    assert leading_digit(0) is None


def test_counts_length_and_tally():
    # leading digits: 1, 1, 2, 9, 9 (from 95); 0 ignored → two 1s, one 2, two 9s
    assert counts([1, 1, 2, 9, 95, 0]) == [2, 1, 0, 0, 0, 0, 0, 0, 2]


def test_mad_zero_when_equal():
    e = expected()
    assert mad(e, e) == 0.0


def test_verdict_thresholds():
    assert verdict(0.005) == "close"
    assert verdict(0.010) == "acceptable"
    assert verdict(0.013) == "marginal"
    assert verdict(0.020) == "nonconformity"


def test_analyze_perfect_benford_has_low_mad():
    nums = []
    for d, p in zip(range(1, 10), expected()):
        nums += [float(d)] * round(p * 100000)
    a = analyze(nums)
    assert a["verdict"] == "close" and a["mad"] < 0.006
    assert a["n"] == len(nums)
