"""The second movement of UNDERNEATH: how the keeper's own account writes the people beneath, and whether the sky's sensors kept it.
Run after fetch_written.py: python3 -I build_written.py  ->  written.json
The reading is this work's, by the rule below, fixed before the page was drawn; every quoted sentence is checked to be a literal
substring of the keeper's page as fetched, and the reading is checked against the Atelier's two blind readings of the same pages."""
import html, json, re
def text(path):
    t = open(path, encoding="utf-8", errors="replace").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))
# RULE. A person is 'written' when the keeper's page writes someone on the ground (or in the air) who saw, filmed or reported the fireball.
# The count is the smallest number its words allow: 'over N' -> N + 1 (corrected 2026-10-14, session 171: it read N until then); 'dozens' -> 24; 'several' -> 3; 'a', 'one', 'the photographer' -> 1;
# 'no visual sightings' / 'no visual evidence' -> 0. A camera is not a person. A report is counted as one person. Where a page gives two
# counts, the larger smallest-reading stands. 'told' is true only where the page writes that someone on the ground was alerted beforehand.
READ = {
 "2008 TC3": (["No visual sightings reported from the ground, except one webcam from a beach in Egypt and report from a KLM airliner pilot flying over Chad."], 1, "one airline pilot, flying over; no one on the ground", False),
 "2014 AA":  (["No visual sightings reported."], 0, "no one", False),
 "2018 LA":  (["Several visual reports were submitted to the International Meteor Organization from Botswana and South Africa as well."], 3, "several reports, as witnesses", False),
 "2019 MO":  ([], None, "the page does not write anyone", False),
 "2022 EB5": (["no visual evidence has arrived from Iceland, nor from the nearby Norwegian island"], 0, "no one", False),
 "2022 WJ1": (["Over 150 visual reports were submitted to the International Meteor Organization from Canada and the USA."], 151, "over 150 reports, as witnesses", False),
 "2023 CX1": (["Over 80 visual reports were submitted to the International Meteor Organization from France, United Kingdom, Germany and even Belgium."], 81, "over 80 reports, as witnesses", False),
 "2024 BX1": (["Dozens of people observed the fireball all across central Europe.", "Some of them had been alerted through social media posts triggered by the imminent impactor systems.",
               "Over 15 visual reports were submitted to the International Meteor Organisation from Czech Republic, France and Germany."], 24, "dozens of people, as watchers, some alerted to watch", True),
 "2024 RW1": (["was seen from several places of Luzon Island, mainly Manila metro and along the northern east coast", "Several visual reports, including videos and pictures were sent to the International Meteor Organization"], 3, "several reports, as witnesses", False),
 "2024 UQ":  ([], None, "the page does not write anyone", False),
 "2024 XA1": (["which was recorded by multiple webcams and several witnesses"], 3, "several witnesses", False),
 "2026 JN4": (["There is a witness of a bright fireball in Darwin"], 1, "one witness", False),
 "2026 RW1": (["managed to image the fireball from Broome (Western Australia)"], 1, "one photographer", False),
}
# PERSONS (added 2026-10-14, session 171, after the Atelier's correction): how many of the written the page writes as persons
# (a pilot, people, witnesses, a photographer) rather than as reports; a report stays counted as one person in 'written'.
PERSONS = {"2008 TC3": 1, "2024 BX1": 24, "2024 XA1": 3, "2026 JN4": 1, "2026 RW1": 1}
A3 = {r["des"]: r for r in json.load(open("raw/atelier_c3_results.json"))["rows"]}
F = json.load(open("raw/field_s12.json")); FW = {r["des"]: r for r in F["warned_rows"]}
A1 = json.load(open("raw/atelier_reader1.json"))["codes"]; A2 = json.load(open("raw/atelier_reader2.json"))["codes"]
D = json.load(open("data.json"))
man = json.load(open("raw-manifest-written.json"))["files"]
out, agree = {}, 0
for r in D["rows"]:
    des = r["des"]; key = des.replace(" ", ""); page = f"raw/esa/{key.lower()}.html"; t = text(page)
    q, n, role, told = READ[des]
    for s in q: assert s in t, (des, s)
    a = (A1[key]["P"], A2[key]["P"])
    ok = (n is None) == (a[0] == "none") == (a[1] == "none")
    agree += ok
    p = PERSONS.get(des, 0 if n is not None else None)
    assert (A3[des]["strict_reports"]["lo"], A3[des]["persons"]["lo"]) == (n, p), (des, n, p, A3[des])
    fw = FW[des]; kept = fw.get("match") is not None
    out[des] = {"quotes": q, "written": n, "persons": p, "role": role, "told": told, "page": man[page]["url"], "page_sha256": man[page]["sha256"],
                "atelier_P": list(a), "agrees_with_atelier": ok,
                "sensors_kept": kept, "impact_kt": fw["nearest"]["impact_kt"] if kept else None, "energy_rank": fw.get("energy_rank")}
S = {"pages": len(out), "agree_with_atelier": agree,
     "written_total": sum(v["written"] or 0 for v in out.values()),
     "written_inhabited": sum(out[r["des"]]["written"] or 0 for r in D["rows"] if r["residents_50km"]),
     "persons_inhabited": sum(out[r["des"]]["persons"] or 0 for r in D["rows"] if r["residents_50km"]),
     "persons_total": sum(v["persons"] or 0 for v in out.values()),
     "residents_total": sum(r["residents_50km"] for r in D["rows"]),
     "pages_writing_no_one": sum(v["written"] is None for v in out.values()),
     "pages_writing_zero": sum(v["written"] == 0 for v in out.values()),
     "told_pages": sum(v["told"] for v in out.values()),
     "sensors_kept": sum(v["sensors_kept"] for v in out.values()), "sensor_fireballs": F["all"]["n"] if isinstance(F.get("all"), dict) and "n" in F["all"] else None,
     "field_commit": "ba217d35d856eb1d09d2d7654f0f6bf888738493", "atelier_commit": "76ea429af50718a3087f669e4f8849289b25f525",
     "atelier_correction_commit": "9aee27763a698beb0f727c09f9989d51ecf2105c"}
assert (S["written_inhabited"], S["persons_inhabited"], S["persons_total"]) == (263, 28, 30), S
json.dump({"summary": S, "by_strike": out, "rule": "A person is 'written' when the keeper's page writes someone who saw, filmed or reported the fireball; the count is the smallest number its words allow ('over N' = N + 1, 'dozens' = 24, 'several' = 3, 'a'/'one' = 1, 'no visual sightings' = 0); a camera is not a person; a report counts as one person; 'told' only where the page writes that someone was alerted beforehand. 'persons' counts only those the page writes as persons, not as reports.",
           "corrected": [{"date": "2026-10-14", "session": 171, "what": "'over N' now reads N + 1, as the words strictly allow (it read N): 261 became 263 over the six strikes near people, 266 became 268 over all thirteen. Each strike now also carries how many the page writes as persons: 28 near people, 30 in all; the rest are written as reports.", "by": "The Atelier, The Least the Words Allow (2026-10-14), window/cycle-007-convening-3/results.json at 9aee27763a698beb0f727c09f9989d51ecf2105c; checked here against the same pages and asserted"}]},
          open("written.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(S, indent=1))
for r in D["rows"]: v = out[r["des"]]; print(r["des"], r["residents_50km"], v["written"], v["sensors_kept"], v["impact_kt"], v["agrees_with_atelier"])
