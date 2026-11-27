"""Check 96 (session 294): every count of the third state, from the files of the check.

Reads agree96.json, codes96.json, cases96.json, duties96.json, check96.json, search96.json, pairs96.json and
sources95.json. Writes results96.json and data96.js (window.D96, read by index.html). Every number the page states
for the check is in `k`, and verify96.mjs recounts each from the same files without this script. Standard library only.
"""
import json
from collections import Counter
from datetime import date
from pathlib import Path

HERE = Path(__file__).parent


def J(name):
    return json.loads((HERE / name).read_text())


AG, CODES, C, DUT, CHK = J("agree96.json"), J("codes96.json"), J("cases96.json"), J("duties96.json"), J("check96.json")
SEARCH, PAIRS, SRC95 = J("search96.json"), J("pairs96.json"), J("sources95.json")["sources"]

ADDED_SOURCES = {
    "complaint": ("https://oag.ca.gov/system/files/attachments/press-docs/complaint-oai-cyber.pdf",
                  "California's Attorney General's complaint against the maker, 16 November 2026", "direct"),
    "eucode": ("https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai",
               "The Commission's page of the Code of Practice and its signatories", "direct"),
    "ny1422": ("https://legislation.nysenate.gov/pdf/laws/GBS1422/",
               "New York General Business Law section 1422 (RAISE Act), as published by the Senate", "direct"),
    "paris": ("https://www.elysee.fr/en/emmanuel-macron/2026/11/09/paris-call-for-ai-safety-and-security",
              "The Paris Call and its signatories, fetched again (study 94's source)", "direct"),
    "rsense": ("https://www.resultsense.com/news/2026-09-18-openai-rubygems-eu-ai-office",
               "A news digest relaying a Brussels paper's report of 18 September on which incidents were reported to "
               "the AI Office", "direct"),
    "pks": ("https://www.pk-sharma.com/briefing/openai-rubygems-no-eu-ai-act-incident-report",
            "An analyst's briefing of 18 September setting the Brussels paper's report against the reports of "
            "7 September", "direct"),
    "eur0907": ("https://www.euractiv.com/news/ai-safety-incident-reporting-not-just-a-tick-box-warns-eu",
                "A Brussels paper's article of 7 September, corrected on 8 September", "search excerpt"),
    "oaioct": ("https://apcp.assembly.ca.gov/system/files/2026-10/morgan-dwyer-openai-sb-53-outcomes-review-hearing.pdf",
               "The maker's slides for the Assembly committee's SB 53 review hearing, 27 October 2026", "direct"),
    "tnw_wiki": ("https://thenextweb.com/news/openai-eu-incident-report-german-wiki",
                 "A news report of 7 September on the Commission's confirmation of a report on the wiki", "direct"),
}

OWED_LETTER = {"receiver duty", "sender duty", "other law"}
DUTY = {"receiver duty", "sender duty"}
FORCE = {"investigate", "order", "proceed"}


def days(a, b):
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def pct(k, n):
    return round(k / n * 100, 1)


def main():
    A, B, D = AG["A"], AG["B"], AG["D"]
    k = {}
    # --- Part A
    k["A.cells"], k["A.agree"], k["A.kappa"] = A["act_cells_pooled"]["n"], A["act_cells_pooled"]["agree"], \
        f'{A["act_cells_pooled"]["kappa_exact"]:.2f}'
    for key, name in (("sender_failure", "sender"), ("receiver_failure", "recv"), ("receiver_party", "party"),
                      ("deadline_on_cells_both_coded", "dl")):
        k[f"A.{name}.n"], k[f"A.{name}.agree"] = A[key]["n"], A[key]["agree"]
        k[f"A.{name}.kappa"] = f'{A[key]["kappa_exact"]:.2f}'
    k["A.diffs"] = len(A["disagreements"])
    moved = [d for d in CODES["decisions"] if d["moves"]]
    k["A.moved"] = len(moved)
    rec = CODES["receivers"]
    five = ["acknowledge", "investigate", "order", "pass_on", "tell_public"]
    rows_duty = [r["id"] for r in rec if any(r["acts"][a]["v"] == "duty" for a in five)]
    pb_duty = [r["id"] for r in rec if r["receiver"] == "public body" and any(r["acts"][a]["v"] == "duty" for a in five)]
    k["A.P158.n"], k["A.pb_duty"] = len(rows_duty), len(pb_duty)
    p158 = "held" if len(rows_duty) <= 3 else "failed"
    k["A.P158.out"] = p158
    # --- Part B agreement
    k["B.first"], k["B.blind"], k["B.paired"] = B["acts_first"], B["acts_blind"], B["paired"]
    k["B.union"] = B["paired"] + B["only_first"] + B["only_blind"]
    k["B.unit"] = f'{B["unitising_agreement"]:.2f}'
    k["B.class.kappa"] = f'{B["class_on_pairs"]["kappa_exact"]:.2f}'
    k["B.owed5.agree"], k["B.owed5.kappa"] = B["owed5_on_pairs"]["agree"], f'{B["owed5_on_pairs"]["kappa_exact"]:.2f}'
    k["B.owed2.kappa"] = f'{B["owed2_on_pairs"]["kappa_exact"]:.2f}'
    k["B.rec.agree"], k["B.rec.n"] = B["receipt_date"]["agree"], B["receipt_date"]["n"]
    k["B.rec.kappa"] = f'{B["receipt_date"]["kappa_exact"]:.2f}'
    ob = PAIRS["only_blind"]
    k["B.accepted"] = sum(v.startswith("accepted") for v in ob.values())
    k["B.declined"] = sum(v.startswith("declined") for v in ob.values())
    k["B.only_first"] = B["only_first"]
    # --- final acts
    doors = C["doors"]
    acts = [dict(a, door=d["id"], kind=d["kind"], case=d["case"], named=bool(d["named_in_94"]))
            for d in doors for a in d["acts"]]
    n = len(acts)
    k["acts"] = n
    for cid in ("wiki", "escape"):
        k[f"acts.{cid}"] = sum(a["case"] == cid for a in acts)
        k[f"doors.{cid}"] = sum(d["case"] == cid for d in doors)
    chk = Counter(a["check"] for a in acts)
    k["held"], k["corrected"], k["added"] = chk["held"], chk["corrected"], chk["added"]
    k["removed"] = len(C["removed"])
    k["doors"], k["doors_with_acts"] = len(doors), sum(1 for d in doors if d["acts"])
    ow = Counter(a["owed"] for a in acts)
    letter = [a for a in acts if a["owed"] in OWED_LETTER]
    duty = [a for a in acts if a["owed"] in DUTY]
    k["owed.letter"], k["owed.duty"] = len(letter), len(duty)
    k["owed.power"], k["owed.other_law"], k["owed.choice"] = ow["power"], ow["other law"], ow["choice"]
    k["owed.letter.pct"] = pct(len(letter), n)
    named = [a for a in acts if a["named"]]
    named_letter = [a for a in named if a["owed"] in OWED_LETTER]
    k["named.doors"] = sum(1 for d in doors if d["named_in_94"])
    k["named.acts"], k["named.owed"] = len(named), len(named_letter)
    k["named.pct"] = pct(len(named_letter), len(named))
    k["named.unnamed_acts"] = n - len(named)
    contested = [a for a in letter if (a.get("doubt") or "").startswith("contested")]
    k["P165.contested"] = len(contested)
    k["P165.no_contested.owed"], k["P165.no_contested.acts"] = len(letter) - len(contested), n - len(contested)
    fo = C["found_outside_count"]
    k["found_outside"] = len(fo)
    k["P165.with_found.owed"] = len(letter) + sum(a["owed"] in OWED_LETTER for a in fo)
    k["P165.with_found.acts"] = n + len(fo)
    k["P165.with_found.pct"] = pct(k["P165.with_found.owed"], k["P165.with_found.acts"])
    p165 = "held" if len(letter) / n <= 0.25 and len(named_letter) / len(named) <= 0.25 else "failed"
    k["P165.out"] = p165
    # duties acted on, set off by the case, without doubt
    k["duty.periodic"] = sum(1 for a in duty if a.get("periodic"))
    k["duty.doubt"] = sum(1 for a in duty if a.get("doubt"))
    k["duty.clean"] = sum(1 for a in duty if not a.get("doubt") and not a.get("periodic"))
    # force and compulsion, by public bodies and legislatures
    bodies = [a for a in acts if a["kind"] in ("public body", "legislature")]
    force = [a for a in bodies if a["code"] in FORCE]
    compels = [a for a in acts if a.get("compels")]
    k["force.bodies"], k["compels"], k["pressure"] = len(force), len(compels), len(force) - len(compels)
    k["compels.under_ai"] = sum(1 for a in compels if a["owed"] in ("power", "receiver duty"))
    # receipts
    bound = Counter((d["received"].get("bound") if d["received"].get("date") else "none") for d in doors)
    k["rec.on"], k["rec.by_act"], k["rec.by"], k["rec.none"] = bound["on"], bound["by act"], bound["by"], bound["none"]
    lags = {d["id"]: d["lag_days"] for d in doors if d["lag_days"] is not None}
    k["lags.measured"] = len(lags)
    bodies_by_act = [d for d in doors if d["kind"] in ("public body", "legislature") and d["acts"] and
                     d["received"].get("date")]
    k["rec.bodies_dated"] = len(bodies_by_act)
    k["rec.bodies_by_act"] = sum(1 for d in bodies_by_act if d["received"]["bound"] == "by act")
    # the maker's two clocks in the escape
    em = next(d for d in doors if d["id"] == "E-MAKER")
    first_word = min(a["date"] for a in em["acts"] if a["code"] == "tell_public" and a.get("date"))
    clock = {e["what"].split(":")[0]: e for e in C["maker_clock"]}
    inside, outside = em["received"]["date"], em["received_outside"]["date"]
    k["clock.inside"], k["clock.outside"] = days(inside, first_word), days(outside, first_word)
    resumed = next(e["date"] for e in C["maker_clock"] if "resume" in e["what"])
    reach = next(e["date"] for e in C["maker_clock"] if "reach the internet" in e["what"])
    k["clock.to_escape"] = days(inside, reach)
    k["clock.resumed_to_escape"] = days(resumed, reach)
    k["clock.earlier_to_inside"] = days(em["earlier_word"]["date"], inside)
    # first seen acting after the first public account (P162 after the check)
    cases = {c["id"]: c for c in C["cases"]}
    after = {}
    for d in doors:
        if d["kind"] not in ("public body", "legislature"):
            continue
        f = d.get("first_act")
        after[d["id"]] = None if f is None else days(cases[d["case"]]["first_public"], f)
    k["P162.wiki"] = min(v for i, v in after.items() if i.startswith("W-") and v is not None)
    k["P162.escape"] = min(v for i, v in after.items() if i.startswith("E-") and v is not None)
    k["P162.al"] = after["E-AL"]
    k["P162.no_act"] = sum(1 for v in after.values() if v is None)
    p162 = "held" if all(v is None or v > 0 for v in after.values()) else "failed"
    k["P162.out"] = p162
    k["P163.consequences"] = sum(1 for d in doors if d["consequence"] != "none")
    k["P163.out"] = "held" if k["P163.consequences"] == 0 else "failed"
    # --- Part C
    cells = DUT["cells"]
    cc = Counter(c["code"] for c in cells)
    k["C.cells"] = len(cells)
    for code, key in (("met", "met"), ("done, set-off or time unknown", "done"), ("declared not set off", "declared"),
                      ("missed", "missed"), ("not due", "notdue"), ("unknowable", "unknowable")):
        k[f"C.{key}"] = cc[code]
    k["P166.out"] = "held" if cc["met"] == 0 else "failed"
    k["C.queries"] = len(SEARCH["queries"])
    k["C.opened"] = len({o for q in SEARCH["queries"] for o in q["opened"]})
    # --- Part D
    k["D.same"], k["D.of"] = D["same"], D["reasons"]
    # --- quotes
    k["Q.n"], k["Q.found"], k["Q.extraction"] = CHK["n"], CHK["found"], CHK["extraction"]
    k["Q.excerpt"] = CHK["search_excerpt"]
    k["P164.out"] = A["P164"]
    k["predictions_held"] = sum(x == "held" for x in (A["P164"], p165, k["P166.out"]))
    sources = {kk: {"url": v["url"], "what": v["what"], "via": v["via"]} for kk, v in SRC95.items()}
    for kk, (u, w, via) in ADDED_SOURCES.items():
        sources[kk] = {"url": u, "what": w, "via": via, "added": True}
    used = {a["src"] for a in acts} | {p["src"] for c in cells for p in c["passages"]}
    missing = sorted(s for s in used if s not in sources)
    assert not missing, missing
    res = {"what": "Check 96 (session 294, 2026-11-27): every count of the third state of On Receipt, from the files "
                   "of the check (build96.py).",
           "k": k, "A": {"disagreements": A["disagreements"], "decisions": CODES["decisions"],
                         "P158_rows_with_duty": rows_duty, "public_bodies_with_duty": pb_duty},
           "P165": {"letter": [f'{a["door"]}:{a["code"]}:{a.get("date")}' for a in letter],
                    "named_letter": [f'{a["door"]}:{a["code"]}:{a.get("date")}' for a in named_letter],
                    "contested": [f'{a["door"]}:{a["code"]}:{a.get("date")}' for a in contested]},
           "compels": [f'{a["door"]}:{a["code"]}:{a.get("date")}' for a in compels],
           "lags": lags, "first_seen_after": after, "duty_codes": dict(cc)}
    (HERE / "results96.json").write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    data = {"k": k, "doors": doors, "cases": C["cases"], "removed": C["removed"], "found_outside": fo,
            "clock": C["maker_clock"], "duties": cells, "decisions": CODES["decisions"],
            "receipts": AG["B"]["receipts"], "reasons": D["rows"], "sources": sources,
            "search": SEARCH["queries"]}
    (HERE / "data96.js").write_text("window.D96=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(json.dumps(k, ensure_ascii=False))


if __name__ == "__main__":
    main()
