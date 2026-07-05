import pytest


@pytest.fixture(autouse=True)
def _disable_parallaxe_throttle(monkeypatch):
    """RPM-Bremse (extract_llm._throttle) in Tests abschalten — sonst reale time.sleep-Wartezeiten."""
    monkeypatch.setenv("PARALLAXE_LLM_MIN_INTERVAL_S", "0")
