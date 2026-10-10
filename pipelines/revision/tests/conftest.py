"""Load the single-file pipeline as a module, the way the workflow runs it."""
import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session")
def refresh():
    spec = importlib.util.spec_from_file_location("revision_refresh", ROOT / "refresh.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
