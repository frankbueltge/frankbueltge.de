from round_number.lastdigit import analyze


def test_uniform_digits_pass():
    nums = list(range(1000))  # last digits perfectly uniform
    a = analyze(nums)
    assert a["verdict"] == "uniform" and a["n"] == 1000


def test_heaped_on_multiples_of_ten():
    nums = [10 * k for k in range(1, 201)]  # last digit always 0
    a = analyze(nums)
    assert a["verdict"] == "heaped"
    assert a["observed"][0] == 1.0
