#!/usr/bin/env python3
"""Compute every number this artifact reports, from the committed data files.

Imported by build.py (which renders the page) and by check.py (which rebuilds
the numbers and compares them against the rendered page). No network, no model.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, "data")

# Which candidates are journal or conference publications, for P4. Fixed by the
# venue recorded in the citation, not by whether we managed to read them.
KIND = {
    "kiraly-plan-2015": "report", "metadata-qa-api": "code", "qa-catalogue": "code",
    "lorenzini-2021": "journal", "mqa-europa": "specification", "fuji": "code",
    "hillmann-phipps-2007": "conference", "margaritopoulos-2008": "conference",
    "tarver-2015": "conference", "phillips-2019": "conference",
    "w3c-dqv": "specification", "ochoa-duval-2009": "journal",
    "margaritopoulos-2012": "journal", "gavrilis-2015": "conference",
    "kiraly-buchler-2018": "conference", "kiraly-dh2017": "conference",
    "kiraly-thesis-2019": "thesis", "bruce-hillmann-2004": "book chapter",
    "europeana-publishing": "specification", "ochoa-duval-2006": "conference",
    "dcatap-springer-2023": "conference",
}
# Quotes verifiable offline against material fetched to disk. The rest were
# reached only through the research tool and are marked as such wherever they
# are counted.
OFFLINE_VERIFIABLE = {"kiraly-plan-2015", "metadata-qa-api", "qa-catalogue", "fuji",
                      "hillmann-phipps-2007", "margaritopoulos-2008", "tarver-2015"}


def compute():
    src = json.load(open(os.path.join(D, "sources.json")))
    atlas = json.load(open(os.path.join(D, "atlas-conventions.json")))
    sources, rejected = src["sources"], src["rejected"]

    identified = len(sources) + len(rejected)
    included = len(sources)
    coded = [s for s in sources if s["axis_a"] != "U"]
    undetermined = [s for s in sources if s["axis_a"] == "U"]
    S = [s for s in coded if s["axis_a"] == "S"]
    P = [s for s in coded if s["axis_a"] == "P"]
    N = [s for s in coded if s["axis_a"] == "N"]

    # Independence guard. Ten codes come from fewer than ten hands: the same
    # defect cycle 002 and session 155 both walked into is counted out here.
    groups = {}
    for s in coded:
        groups.setdefault(s["author_group"], []).append(s["axis_a"])
    groups_with_S = sum(1 for v in groups.values() if "S" in v)
    groups_with_P = sum(1 for v in groups.values() if "P" in v)
    groups_with_N = sum(1 for v in groups.values() if "N" in v)

    jc = [s for s in sources if KIND[s["id"]] in ("journal", "conference")]
    jc_read = [s for s in jc if s["quotes"]]
    jc_unread = [s for s in jc if not s["quotes"]]
    closed = [s for s in sources if s.get("access_status") == "closed"]

    quoted = [s for s in sources if s["quotes"]]
    quoted_offline = [s for s in quoted if s["id"] in OFFLINE_VERIFIABLE]
    n_quotes = sum(len(s["quotes"]) for s in quoted)

    c = atlas["conventions"]
    r = {
        "identified": identified, "included": included, "rejected": len(rejected),
        "coded": len(coded), "undetermined": len(undetermined),
        "S": len(S), "P": len(P), "N": len(N),
        "S_share_of_coded": len(S) / len(coded),
        "U_share_of_identified": len(undetermined) / identified,
        "groups": len(groups), "groups_with_S": groups_with_S,
        "groups_with_P": groups_with_P, "groups_with_N": groups_with_N,
        "jc": len(jc), "jc_read": len(jc_read), "jc_unread": len(jc_unread),
        "jc_unread_share": len(jc_unread) / len(jc),
        "closed_confirmed": len(closed),
        "quoted_sources": len(quoted), "quotes": n_quotes,
        "quoted_offline_verifiable": len(quoted_offline),
        "atlas_records": atlas["records"],
        "atlas_fields": atlas["schema_fields_observed"],
        "atlas_present_key": c["A_present_key"]["score"] * 100,
        "atlas_schema_plain": c["B_schema_plain"]["score"] * 100,
        "atlas_gap": atlas["gap_A_minus_B_points"],
        "atlas_field_min": c["C_per_field_over_records"]["min"] * 100,
        "atlas_field_median": c["C_per_field_over_records"]["median"] * 100,
        "atlas_sparse_field": list(atlas["sparse_fields_under_5pct"])[0],
        "atlas_sparse_records": list(atlas["sparse_fields_under_5pct"].values())[0]["records_with_value"],
        "atlas_feed_sha256": atlas["feed_sha256"][:16],
    }

    r["predictions"] = {
        "P1": {"claim": "at least 70 % of codes other than U are S",
               "value": r["S_share_of_coded"] * 100, "threshold": 70.0,
               "verdict": "confirmed" if r["S_share_of_coded"] >= 0.70 else "refuted"},
        "P2": {"claim": "at least one reachable source uses a present-key denominator",
               "value": r["P"], "threshold": 1,
               "verdict": "confirmed" if r["P"] >= 1 else "refuted"},
        "P3": {"claim": "at least 30 % of identified candidates are U on axis A",
               "value": r["U_share_of_identified"] * 100, "threshold": 30.0,
               "verdict": "confirmed" if r["U_share_of_identified"] >= 0.30 else "refuted"},
        "P4": {"claim": "at least 25 % of journal and conference candidates cannot be read at zero cost",
               "value": r["jc_unread_share"] * 100, "threshold": 25.0,
               "verdict": "confirmed" if r["jc_unread_share"] >= 0.25 else "refuted"},
        "P5": {"claim": "at least one at-scale real-collection measurement is weighted",
               "value": sum(1 for s in sources if s["axis_b"] == "weighted"), "threshold": 1,
               "verdict": "confirmed" if any(s["axis_b"] == "weighted" for s in sources) else "refuted"},
    }
    r["kills"] = {
        "K1": {"claim": "fewer than 10 candidates reach a non-U code", "value": r["coded"],
               "fired": r["coded"] < 10},
        "K2": {"claim": "more than 50 % of candidates are U on axis A",
               "value": r["U_share_of_identified"] * 100, "fired": r["U_share_of_identified"] > 0.50},
        "K3": {"claim": "fewer than 8 candidates coded from a quoted passage",
               "value": r["quoted_sources"], "fired": r["quoted_sources"] < 8},
        "K4": {"claim": "a basis that is neither S nor P appears and must be named",
               "value": r["N"], "fired": r["N"] > 0},
    }
    return r


if __name__ == "__main__":
    print(json.dumps(compute(), indent=1))
