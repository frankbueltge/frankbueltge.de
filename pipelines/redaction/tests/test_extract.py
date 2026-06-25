from redaction.extract import main_text


def test_extracts_visible_text_drops_boilerplate():
    html = """<html><head><title>x</title><style>.a{}</style></head>
    <body><nav>Home About</nav><main><p>The committee will act by 2030.</p>
    <p>It cited 1.25 million cases.</p></main><footer>© 2026</footer></body></html>"""
    out = main_text(html)
    assert "will act by 2030" in out
    assert "1.25 million cases" in out


def test_empty_html_returns_empty():
    assert main_text("") == ""
