import ghost_fleet


def test_versions():
    assert ghost_fleet.PIPELINE_VERSION and ghost_fleet.SCHEMA_VERSION == "1"
