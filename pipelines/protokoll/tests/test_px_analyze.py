from protokoll.parallaxe.analyze import (
    mean_omission,
    omission_index,
)


def _claim(**marks):
    return {"aussage": "x", "nach_sprache": dict(marks)}


def test_omission_index_basic_fraction():
    # 3 Aussagen, "ja" verschweigt 2 -> 0.6667
    claims = [
        _claim(de="nennt", ja="verschweigt"),
        _claim(de="nennt", ja="verschweigt"),
        _claim(de="nennt", ja="nennt"),
    ]
    oi = omission_index(claims, ["de", "ja"])
    assert oi["de"] == 0.0
    assert oi["ja"] == 0.6667


def test_omission_index_missing_lang_key_counts_as_verschweigt():
    claims = [
        _claim(de="nennt"),               # ru fehlt -> verschwiegen
        _claim(de="nennt", ru="nennt"),
    ]
    oi = omission_index(claims, ["de", "ru"])
    assert oi["de"] == 0.0
    assert oi["ru"] == 0.5


def test_omission_index_widerspricht_is_not_omission():
    claims = [_claim(de="widerspricht", ru="verschweigt")]
    oi = omission_index(claims, ["de", "ru"])
    assert oi["de"] == 0.0   # widerspricht zählt nicht als Auslassung
    assert oi["ru"] == 1.0


def test_omission_index_empty_claims():
    oi = omission_index([], ["de", "ru"])
    assert oi == {"de": 0.0, "ru": 0.0}


def test_mean_omission():
    assert mean_omission({"de": 0.0, "ja": 0.6667, "ru": 0.5}) == 0.3889
    assert mean_omission({}) == 0.0
