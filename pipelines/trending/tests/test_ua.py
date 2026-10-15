import pytest

from trending.ua import TABLE, classify, path_kind


@pytest.mark.parametrize("cls,tok", [(cls, tok) for cls, toks in TABLE for tok in toks])
def test_every_table_token_classifies_to_its_class(cls, tok):
    got_cls, got_tok = classify(f"Mozilla/5.0 (compatible; {tok}/1.0; +https://example.org)")
    assert got_cls == cls and got_tok == tok


def test_real_world_strings():
    assert classify("Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)") == ("ai-training", "ClaudeBot")
    assert classify("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-User/1.0")[0] == "ai-user-fetch"
    assert classify("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html") == ("search", "Googlebot")
    assert classify("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36") == ("browser", None)
    assert classify("curl/8.7.1") == ("other-bot", "curl/")
    assert classify(None) == ("browser", None)


def test_class_only_never_the_string():
    cls, tok = classify("Mozilla/5.0 (Macintosh; Intel Mac OS X) Firefox/130.0")
    assert cls == "browser" and tok is None


def test_path_kind():
    assert path_kind("/trending") == "page" and path_kind("/trending/") == "page"
    assert path_kind("/trending/2026-09-02") == "archive" and path_kind("/trending/2026-09-02/") == "archive"
    assert path_kind("/trending/latest.json") == "json" and path_kind("/trending/2026-09-02.json") == "json"
    assert path_kind("/trending/feed.xml") == "feed" and path_kind("/trending/latest.md") == "md"
    assert path_kind("/trending/x?y=1") == "other" and path_kind(None) == "other"
