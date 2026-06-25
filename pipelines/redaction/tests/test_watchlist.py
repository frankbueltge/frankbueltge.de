from redaction.watchlist import WATCHLIST, WatchItem


def test_watchlist_is_nonempty_and_well_formed():
    assert len(WATCHLIST) >= 20
    for it in WATCHLIST:
        assert isinstance(it, WatchItem)
        assert it.url.startswith("https://")
        assert it.institution and it.label


def test_watchlist_urls_unique():
    urls = [it.url for it in WATCHLIST]
    assert len(urls) == len(set(urls)), "watch-list contains duplicate URLs"
