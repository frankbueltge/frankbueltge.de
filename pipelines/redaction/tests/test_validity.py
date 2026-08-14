"""The page-validity gate — the fixtures are the two false positives the
2026-08-14 memory-hole audit reproduced against the origin code."""
from redaction import extract, validity

# The WAF challenge Wayback archived WITH status 200 (BMWE "Energiewende"
# dossier, capture 2026-05-28: 118,410 bytes of HTML, 8 tokens of text).
CHALLENGE_HTML = (
    "<html><head><title>Just a moment...</title></head><body>"
    "<h1>Verifying your browser before proceeding...</h1>"
    "<p>Incident ID: e4841cb0-dxzu-4858-bcd7-154223367ef4</p>"
    "<script>window._cf_chl_opt={};</script></body></html>"
)

# The BaFin "before" text: the cookie/Matomo notice that passed the salience
# gate with score 14 and was published as removed content.
CONSENT_TEXT = (
    "Diese Website verwendet Cookies, um Ihnen den bestmöglichen Service zu bieten. "
    "Wir setzen das Webanalyse-Werkzeug Matomo ein, um die Nutzung dieser Website "
    "statistisch auszuwerten und dauerhaft zu verbessern. "
    "Sie können der Verwendung von Cookies jederzeit widersprechen und Ihre "
    "Einwilligung in das Tracking hier widerrufen. "
    "Weitere Hinweise finden Sie in unserer Datenschutzerklärung, die Sie jederzeit "
    "aufrufen und für Ihre Unterlagen speichern können."
)

PAGE_TEXT = (
    "The ministry will phase out coal-fired power generation by 2030, cutting "
    "emissions by 1.25 million tonnes each year. "
    "The system development strategy sets out how the grid is expanded and how "
    "climate neutrality is to be reached by 2045. "
    "The department publishes a progress report every year and invites written "
    "comments from the public before each revision. "
    "Further information about the funding programme is available from the "
    "project management agency named in the annex."
)


def test_challenge_page_archived_as_200_is_not_a_page_version():
    text = extract.main_text(CHALLENGE_HTML)
    v = validity.check("200", CHALLENGE_HTML, text)
    assert not v.ok
    assert v.reason == validity.CHALLENGE
    assert v.detail == "verifying your browser"


def test_challenge_marker_found_in_raw_html_even_if_extraction_drops_it():
    # A WAF notice that only lives in the <title> — extraction returns nothing.
    html = "<html><head><title>Attention Required! | Cloudflare</title></head><body></body></html>"
    v = validity.check("200", html, "")
    assert not v.ok and v.reason == validity.CHALLENGE


def test_consent_boilerplate_is_not_a_page_version():
    v = validity.check("200", f"<main>{CONSENT_TEXT}</main>", CONSENT_TEXT)
    assert not v.ok and v.reason == validity.BOILERPLATE
    assert v.detail.startswith("consent share")


def test_short_stub_is_too_short():
    text = "The page has moved."
    v = validity.check("200", f"<main>{text}</main>", text)
    assert not v.ok and v.reason == validity.TOO_SHORT


def test_nav_pile_without_a_single_prose_sentence_is_boilerplate():
    text = " ".join(["Startseite Themen Presse Kontakt Impressum Datenschutz Suche"] * 8)
    v = validity.check("200", f"<main>{text}</main>", text)
    assert not v.ok and v.reason == validity.BOILERPLATE


def test_non_200_capture_is_never_a_page_version():
    v = validity.check("403", "<html>forbidden</html>", "forbidden")
    assert not v.ok and v.reason == validity.NOT_200 and v.detail == "403"


def test_real_page_passes():
    v = validity.check("200", f"<main>{PAGE_TEXT}</main>", PAGE_TEXT)
    assert v.ok and v.reason == validity.VALID and v.tokens >= validity.MIN_PAGE_TOKENS


def test_fingerprints_are_a_named_lowercase_constant():
    # Versioned + deterministic: the list is data, matched case-insensitively.
    assert isinstance(validity.CHALLENGE_FINGERPRINTS, tuple)
    assert all(fp == fp.lower() for fp in validity.CHALLENGE_FINGERPRINTS)
    for required in ("verifying your browser", "incident id", "attention required",
                     "just a moment", "checking your browser"):
        assert required in validity.CHALLENGE_FINGERPRINTS
