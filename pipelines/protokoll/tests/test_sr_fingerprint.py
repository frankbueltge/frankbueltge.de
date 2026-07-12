from protokoll.spielraum.fingerprint import extract_fingerprint

HTML_BASE = """
<html><head><title>Sustainability Reports</title></head>
<body>
<nav><a href="/about">About</a><a href="/contact">Contact</a></nav>
<main>
<h1>Sustainability Reports</h1>
<a href="/2025-environmental-report.pdf">2025 Environmental Report (PDF)</a>
<a href="/data-index">Data index</a>
</main>
<footer>Copyright 2024</footer>
</body></html>
"""


def test_fingerprint_stable_for_identical_html():
    _, fp1 = extract_fingerprint(HTML_BASE)
    _, fp2 = extract_fingerprint(HTML_BASE)
    assert fp1 == fp2


def test_new_report_link_changes_fingerprint():
    _, fp_before = extract_fingerprint(HTML_BASE)
    html_after = HTML_BASE.replace(
        '<a href="/data-index">Data index</a>',
        '<a href="/data-index">Data index</a>\n'
        '<a href="/2026-environmental-report.pdf">2026 Environmental Report (PDF)</a>',
    )
    matches_after, fp_after = extract_fingerprint(html_after)
    assert fp_after != fp_before
    assert "/2026-environmental-report.pdf" in matches_after


def test_pure_nav_boilerplate_change_does_not_change_fingerprint():
    _, fp_before = extract_fingerprint(HTML_BASE)
    html_nav_changed = HTML_BASE.replace(
        '<nav><a href="/about">About</a><a href="/contact">Contact</a></nav>',
        '<nav><a href="/about">About us</a><a href="/careers">Careers</a></nav>',
    )
    matches_after, fp_after = extract_fingerprint(html_nav_changed)
    assert fp_after == fp_before
    assert "/careers" not in matches_after  # kein Report-Pfad, kein Jahres-/Fiskal-Token


def test_query_string_variants_of_same_href_produce_same_fingerprint():
    html_a = '<a href="/2025-report.pdf?utm_source=home">Report</a>'
    html_b = '<a href="/2025-report.pdf?utm_source=footer&ref=x">Report</a>'
    matches_a, fp_a = extract_fingerprint(html_a)
    matches_b, fp_b = extract_fingerprint(html_b)
    assert fp_a == fp_b
    assert matches_a == matches_b


def test_fiscal_and_year_tokens_are_captured():
    html = "<html><body><p>FY26 Sustainability Report, published 2027.</p></body></html>"
    matches, _ = extract_fingerprint(html)
    assert "fy26" in matches
    assert "2027" in matches


def test_year_token_outside_recognized_range_is_not_captured():
    html = "<html><body><footer>Copyright 2024</footer></body></html>"
    matches, _ = extract_fingerprint(html)
    assert matches == []
