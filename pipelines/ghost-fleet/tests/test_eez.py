from ghost_fleet.eez import name_for


def test_name_for_resolves_known_eez():
    assert name_for(["8428"]) == "Salvadoran EEZ"


def test_name_for_first_resolvable():
    assert name_for(["999999999", "8316"]) == "Micronesian EEZ"


def test_name_for_none_when_unknown_or_empty():
    assert name_for(["999999999"]) is None
    assert name_for([]) is None
