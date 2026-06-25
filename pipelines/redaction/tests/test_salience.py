from redaction.salience import score, WEIGHTS


def test_cosmetic_text_scores_zero():
    s = score("   \n\t  —  ·  ")
    assert s.score == 0 and s.signals == []


def test_number_detected():
    s = score("Emissions fell by 1.25 million tonnes.")
    assert "number" in s.signals and s.score >= WEIGHTS["number"]


def test_commitment_verb_detected():
    s = score("The government will phase out coal.")
    assert "commitment_verb" in s.signals


def test_negation_detected_de_and_en():
    assert "negation" in score("Es gibt keinen Zusammenhang.").signals
    assert "negation" in score("There is no link.").signals


def test_named_entity_midsentence_capitalisation():
    s = score("The plan names the Paris Agreement explicitly.")
    assert "named_entity" in s.signals


def test_signals_sorted_unique_and_deterministic():
    a = score("By 2030 the EU will cut 55% — no exceptions, says Brussels.")
    b = score("By 2030 the EU will cut 55% — no exceptions, says Brussels.")
    assert a.signals == b.signals == sorted(set(a.signals))
    assert a.score == b.score
