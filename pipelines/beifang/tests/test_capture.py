from beifang.capture import detect_blocked, RawRequest, build_launch_kwargs
from beifang.model import Blocked


def test_launch_kwargs_automat_is_bundle_default():
    assert build_launch_kwargs(real_chrome=False, proxy=None) == {}


def test_launch_kwargs_leser_uses_real_chrome_channel():
    kw = build_launch_kwargs(real_chrome=True, proxy=None)
    assert kw["channel"] == "chrome"  # echtes Google Chrome, kein Bundle


def test_launch_kwargs_passes_proxy():
    kw = build_launch_kwargs(real_chrome=False, proxy="http://p:1")
    assert kw["proxy"] == {"server": "http://p:1"}


def test_detect_blocked_http_statuses():
    assert detect_blocked(403, "irgendwas") == Blocked(type="http", marker="403")
    assert detect_blocked(429, "") == Blocked(type="http", marker="429")
    assert detect_blocked(200, "Ein normaler Artikel") is None
    assert detect_blocked(None, "") is None


def test_detect_blocked_challenge_titles():
    assert detect_blocked(200, "Just a moment...") == Blocked(type="challenge", marker="just a moment")
    assert detect_blocked(200, "Access Denied") == Blocked(type="challenge", marker="access denied")


def test_rawrequest_has_post_data_and_referer_fields():
    r = RawRequest(url="https://x/y", host="x", resource_type="script", bytes=1,
                   post_data="a=b", referer="https://ref/")
    assert r.post_data == "a=b" and r.referer == "https://ref/"
