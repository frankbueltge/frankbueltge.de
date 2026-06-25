from datetime import date
from pathlib import Path

from round_number.run import run

DATA = Path(__file__).parent / "fixtures"


def test_run_over_fixture_dir():
    rec = run(".", today=date(2026, 6, 25), data_dir=DATA)
    assert rec["series"] and rec["pick"] is not None
    assert rec["series"][0]["benford"]["verdict"] in {
        "close", "acceptable", "marginal", "nonconformity",
    }
