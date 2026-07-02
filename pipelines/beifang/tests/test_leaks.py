import hashlib

from beifang.capture import RawRequest
from beifang.classify import parse_tds
from beifang.leaks import find_leaks

TDS = {"trackers": {"adnxs.com": {"owner": {"displayName": "Xandr"}}},
       "entities": {"LiveRamp": {"displayName": "LiveRamp"}},
       "domains": {"liveramp.com": "LiveRamp", "rlcdn.com": "LiveRamp"}}
TDSD = parse_tds(TDS)

DOI = "10.1038/s41586-024-00001-2"
IDENT = {"doi": DOI, "titel": "Machine learning for protein folding at scale",
         "keywords": ["protein folding"]}


def req(url, *, host=None, post_data=None, referer=None):
    from urllib.parse import urlsplit
    return RawRequest(url=url, host=host or (urlsplit(url).hostname or ""),
                      resource_type="script", bytes=1, post_data=post_data, referer=referer)


def forms(leaks):
    return {(l.token, l.form, l.kanal, l.host, l.firma) for l in leaks}


def test_doi_cleartext_in_query_names_recipient():
    leaks = find_leaks(IDENT, [req(f"https://pixel.liveramp.com/i?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    assert ("doi", "klartext", "query", "pixel.liveramp.com", "LiveRamp") in forms(leaks)
    assert all(l.signal == "hard" for l in leaks if l.token == "doi")
    assert any(DOI in l.beweis for l in leaks)


def test_doi_url_encoded_detected_as_such():
    from urllib.parse import quote
    enc = quote(DOI, safe="")
    leaks = find_leaks(IDENT, [req(f"https://adnxs.com/x?u={enc}")], "sciencedirect.com", TDSD)
    assert ("doi", "url-kodiert", "query", "adnxs.com", "Xandr") in forms(leaks)


def test_doi_sha256_in_post_body():
    h = hashlib.sha256(DOI.encode()).hexdigest()
    leaks = find_leaks(IDENT, [req("https://adnxs.com/rtb", post_data=f"id={h}&x=1")],
                       "sciencedirect.com", TDSD)
    assert ("doi", "sha256", "post", "adnxs.com", "Xandr") in forms(leaks)


def test_doi_in_referer_channel():
    leaks = find_leaks(IDENT, [req("https://adnxs.com/x", referer=f"https://sciencedirect.com/a?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    # Referer trägt die DOI (der Leser-Kontext leakt über den Referer an den Dritten)
    assert ("doi", "klartext", "referer", "adnxs.com", "Xandr") in forms(leaks)


def test_first_party_request_is_not_a_leak():
    leaks = find_leaks(IDENT, [req(f"https://cdn.sciencedirect.com/a?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    assert leaks == ()


def test_title_soft_full_phrase_only():
    # ganzer Titel als Phrase (>=20 Zeichen) matcht; ein Allerweltswort allein nicht
    leaks = find_leaks(IDENT, [req("https://adnxs.com/x?t=Machine%20learning%20for%20protein%20folding%20at%20scale")],
                       "sciencedirect.com", TDSD)
    assert any(l.token == "titel" and l.signal == "soft" for l in leaks)
    only_common = find_leaks({"doi": None, "titel": None, "keywords": ["data"]},
                             [req("https://adnxs.com/x?q=data")], "sciencedirect.com", TDSD)
    assert only_common == ()  # "data" ist zu kurz (<12) → kein weiches Signal


def test_no_identity_no_leaks():
    assert find_leaks(None, [req("https://adnxs.com/x")], "sciencedirect.com", TDSD) == ()


def test_leaks_are_deduped_and_sorted():
    leaks = find_leaks(IDENT, [req(f"https://pixel.liveramp.com/i?doi={DOI}"),
                               req(f"https://pixel.liveramp.com/i?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    keys = [(l.host, l.token, l.form, l.kanal) for l in leaks]
    assert keys == sorted(keys) and len(keys) == len(set(keys))
