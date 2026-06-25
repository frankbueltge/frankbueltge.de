from pathlib import Path

from round_number.datasets import Dataset, load_file

FIX = Path(__file__).parent / "fixtures" / "sample.json"


def test_load_file():
    d = load_file(FIX)
    assert isinstance(d, Dataset)
    assert d.id == "sample" and d.synthetic is True
    assert d.values[:3] == [1.0, 1.0, 2.0]
    assert d.source["url"].startswith("https://")
