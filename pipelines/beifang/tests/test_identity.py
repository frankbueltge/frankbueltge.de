from beifang.identity import build_identity


def test_build_identity_from_crossref_message():
    work = {"title": ["Machine learning for protein folding"],
            "subject": ["Computer Science", "Biophysics"]}
    ident = build_identity("10.1/x", work)
    assert ident == {"doi": "10.1/x", "titel": "Machine learning for protein folding",
                     "keywords": ["Computer Science", "Biophysics"]}


def test_build_identity_tolerates_missing_fields():
    assert build_identity(None, None) == {"doi": None, "titel": None, "keywords": []}
    assert build_identity("10.2/y", {"title": [], "subject": []}) == {
        "doi": "10.2/y", "titel": None, "keywords": []}
