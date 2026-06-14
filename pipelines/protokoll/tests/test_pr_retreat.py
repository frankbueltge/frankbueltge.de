from protokoll.praemie.retreat import retreat


def test_retreat_reads_bundled_json():
    out = retreat()
    assert out["non_renewals"] == 2800000
    assert out["as_of"] == "2023-12-31"
    assert "note" in out
    assert out["source"]["name"].startswith("California Department of Insurance")
