"""Build the witness test: the Field's 14 incidents and two reporting regimes, coded on four prongs.

Inputs (fetched, not committed; sha256 recorded):
  Field  artifacts/2026-10-08-who-saw-the-fourteen/data/results.json (raw.githubusercontent, main, 2026-10-08)
  EUR-Lex Regulation (EU) 2024/1689, OJ L, HTML (Art. 55(1)(c), Art. 73(1), 73(6))
  NASA ASRS, Immunity Policies page carrying FAA Advisory Circular 00-46F
Run: python3 -I build.py <field_results.json> <aiact.html> <asrs.html>
"""
import hashlib, html, json, re, sys
from pathlib import Path

here = Path(__file__).parent
fp, ap, np_ = (Path(a) for a in sys.argv[1:4])
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def text(p):
    t = p.read_text(encoding="utf-8", errors="ignore")
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))

field = json.loads(fp.read_text())
act, asrs = text(ap), text(np_)

# Short quotations; build fails if a source no longer carries one word for word.
Q = {
    "act73_1": (act, "Providers of high-risk AI systems placed on the Union market shall report any serious incident to the market surveillance authorities of the Member States where that incident occurred."),
    "act73_6": (act, "the provider shall, without delay, perform the necessary investigations in relation to the serious incident and the AI system concerned."),
    "act55": (act, "keep track of, document, and report, without undue delay, to the AI Office and, as appropriate, to national competent authorities, relevant information about serious incidents and possible corrective measures to address them;"),
    "asrs_1975": (asrs, "the FAA instituted a voluntary ASRP on April 30, 1975"),
    "asrs_third": (asrs, "NASA serves as a third party to receive and process Aviation Safety Reports."),
    "asrs_deid": (asrs, "The NASA ASRS provides for the receipt, analysis, and de-identification of Aviation Safety Reports."),
    "asrs_use": (asrs, "The FAA will not use any reports submitted to NASA under the ASRS (or information derived therefrom) in any enforcement action, except information concerning criminal offenses or accidents"),
    "asrs_pen": (asrs, "neither a civil penalty nor certificate suspension will be imposed if"),
}
for k, (src, s) in Q.items():
    assert s in src, f"quotation {k} not found in its source"

# Not found in Art. 73 (read in full): any clause restricting the use of the report against the provider.
i73 = act.find("Article 73 Reporting of serious incidents"); j73 = act.find("Article 74", i73 + 10)
art73 = act[i73:j73]
assert i73 > 0 and j73 > i73 and len(art73) > 3000, "Article 73 not isolated"
use_restriction_in_73 = bool(re.search(r"shall not be used|may not be used|not be used (as|in|against)|enforcement action", art73))

maker_first = set(field["first_report_is_maker_domain"])
rows = []
for inc in field["incidents"]:
    rows.append({
        "id": f"AIID {inc['id']}", "kind": "incident", "url": f"https://incidentdatabase.ai/cite/{inc['id']}/",
        "setting": inc["setting"], "looker": inc["observer"],
        "A": inc["prong_a"] == "pass", "B": inc["prong_b"] == "pass",
        "C": inc["id"] not in maker_first, "D": False,
        "why": {"A": "Field: no recording rule published before the looking.",
                "B": "Field: " + ("the first observer is not the maker." if inc["prong_b"] == "pass" else "the maker looked first and set what was recorded."),
                "C": "The first report sits on the maker's own domain." if inc["id"] in maker_first else f"The first report sits on {inc['first_report']['domain']}, not the maker's domain.",
                "D": "No rule is in the record at all, so none protects a party that testifies."},
    })
rows.append({
    "id": "EU AI Act, Art. 73 and 55(1)(c)", "kind": "regime", "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    "setting": "law, in force by stages", "looker": "the provider itself",
    "A": True, "B": True, "C": True, "D": False,
    "why": {"A": "The duty to report is written in a regulation published in 2024, before any incident it covers.",
            "B": "The legislator wrote it, not the provider.",
            "C": "The report goes to market surveillance authorities (73(1)) or the AI Office (55(1)(c)).",
            "D": "Art. 73, read in full, carries no clause restricting the use of a report against the provider" + ("" if not use_restriction_in_73 else " [BUILD: a candidate clause was found; recode]") + ". The provider also investigates its own incident (73(6)). Only Art. 73 was read for this, not the whole Regulation."},
    "quotes": ["act73_1", "act73_6", "act55"],
})
rows.append({
    "id": "NASA Aviation Safety Reporting System", "kind": "regime", "url": "https://asrs.arc.nasa.gov/overview/immunity.html",
    "setting": "aviation, since 1975", "looker": "often the party itself (pilot, controller, mechanic)",
    "A": True, "B": True, "C": True, "D": True,
    "why": {"A": "The programme and its rules date from 1975 (FAA Advisory Circular 00-46F, 6).",
            "B": "The FAA and NASA set it; the reporting party does not.",
            "C": "NASA, a third party, receives, de-identifies and keeps the reports.",
            "D": "The FAA will not use the reports in enforcement, and an inadvertent violation reported within 10 days carries no penalty."},
    "quotes": ["asrs_1975", "asrs_third", "asrs_deid", "asrs_use", "asrs_pen"],
})
assert use_restriction_in_73 is False

def passing(req):
    return [r["id"] for r in rows if all(r[p] for p in req)]

summary = {
    "n_incidents": sum(r["kind"] == "incident" for r in rows),
    "per_prong_incidents": {p: sum(r[p] for r in rows if r["kind"] == "incident") for p in "ABCD"},
    "pass_all_four": passing("ABCD"),
    "pass_A_B": passing("AB"),
    "pass_B_C": passing("BC"),
    "pass_B_C_incidents": [i for i in passing("BC") if i.startswith("AIID")],
}
data = {
    "built": "2026-10-08",
    "sources": {"field_results": {"sha256": sha(fp), "url": "https://raw.githubusercontent.com/frankbueltge/field-research/main/artifacts/2026-10-08-who-saw-the-fourteen/data/results.json"},
                "eur_lex_2024_1689": {"sha256": sha(ap), "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401689"},
                "asrs_ac_00_46f": {"sha256": sha(np_), "url": "https://asrs.arc.nasa.gov/overview/immunity.html"}},
    "prongs": {"A": "The rule for what gets recorded was public before anyone looked.",
               "B": "The party the record concerns did not set that rule (where no rule is published, whoever looks first sets it).",
               "C": "Someone other than that party holds the first record.",
               "D": "A party that testifies against itself is protected from its own testimony.",
               "E": "The one who keeps the record outlasts the outcome."},
    "quotes": {k: s for k, (_, s) in Q.items()},
    "rows": rows, "summary": summary,
}
(here / "data.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
page = (here / "template.html").read_text().replace("__DATA__", json.dumps(data, ensure_ascii=False))
(here / "index.html").write_text(page)
print(json.dumps(summary, indent=1))
