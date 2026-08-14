from redaction.world.selection import pick, weight
from redaction.world.triviality import classify


def _row(url, domain, before, after):
    return {"url": url, "domain": domain, "before": before, "after": after,
            "verdict": classify(before, after)}


def test_weight_counts_capitalized_double():
    v = classify("Protesters march downtown", "Rioters march downtown")
    # one removed + one added, both capitalized → 2 + 2
    assert weight(v) == 4


def test_pick_returns_only_reframings():
    rows = [
        _row("https://a.test/1", "a.test", "5 dead in fire", "9 dead in fire"),
        _row("https://b.test/2", "b.test", "Rebels seize town", "Government retakes town"),
        _row("https://c.test/3", "c.test", "Same title", "Same title - CNN"),
    ]
    picked = pick(rows)
    assert [r["url"] for r in picked] == ["https://b.test/2"]


def test_pick_is_bounded_and_deterministic():
    rows = [
        _row(f"https://x{i}.test/a", f"x{i}.test",
             f"Protesters clash with police in district {chr(65 + i)}",
             f"Rioters clash with police in district {chr(65 + i)}")
        for i in range(6)
    ]
    picked = pick(rows)
    assert len(picked) == 3
    # equal keys: ties break on (domain, url) — stable order
    assert [r["domain"] for r in picked] == ["x0.test", "x1.test", "x2.test"]


def test_pick_takes_one_entry_per_domain():
    rows = [
        _row("https://x.test/1", "x.test",
             "Bride Is Furious After MIL Tries To Take Over The Wedding",
             "Bride Spends Months Fighting Her MIL Over The Wedding"),
        _row("https://x.test/2", "x.test",
             "Man Hits MIL With A Savage Ultimatum After Eviction",
             "MIL Deliberately Gets Evicted And Faces A Final Choice"),
        _row("https://y.test/1", "y.test",
             "Government reforms pension system",
             "Government dismantles pension system"),
    ]
    picked = pick(rows)
    assert len({r["domain"] for r in picked}) == len(picked)


def test_in_place_exchange_beats_full_rewrite():
    in_place = _row("https://a.test/s", "a.test",
                    "Protesters clash with police in the capital",
                    "Rioters clash with police in the capital")
    churn = _row("https://b.test/b", "b.test",
                 "Bride Is Furious After Future MIL Tries To Take Over The Wedding Plans",
                 "Bride Spends Months Fighting Her Future MIL Until The Truth Comes Out")
    picked = pick([churn, in_place])
    assert picked[0]["url"] == "https://a.test/s"


def test_duplicate_pairs_collapse():
    rows = [
        _row("https://x.test/1", "x.test", "Rebels seize town", "Army retakes town"),
        _row("https://x.test/2", "x.test", "Rebels seize town", "Army retakes town"),
    ]
    assert len(pick(rows)) == 1


def test_insertion_only_ranks_below_a_true_exchange():
    insertion = _row("https://a.test/i", "a.test",
                     "Oracle launches APEX AI generator on Autonomous Database",
                     "Oracle launches APEX AI generator on Autonomous AI Database")
    exchange = _row("https://b.test/e", "b.test",
                    "Protesters clash with police in the capital",
                    "Rioters clash with police in the capital")
    picked = pick([insertion, exchange])
    assert picked[0]["url"] == "https://b.test/e"
