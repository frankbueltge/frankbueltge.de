"""Session 220 (2026-11-02): adds to data.json the two day layers the Field's check 51 found, which the
étude did not draw. Run from this folder; fetches the Field's data51.js at a pinned commit (not committed
here) and asserts every number the page states about them.

- report_absent: calendar days with no INSP situation report at all (24), and report_untranscribed: days
  whose report exists but has no row in the file (2: 7 and 8 Oct, SitReps 146 and 147). On all 26 the
  file's zero is carried, not written.
- province_suspicion: days after 30 May on which the situation report tables alerts and validated
  suspects by province (its Tableau 3), although the HDX file writes no zone suspicion after 30 May.

Source: The Field, check 51, The Carried Zero, artifacts/2026-11-02-the-carried-zero/data51.js,
field-research commit 44a83458765a23cdaebba97cce52551740bc665f.
Spot-checked by this session against INSP SitRep 168 (29 Oct 2026), Tableau 3, in the INRB-UMIE
repository at commit d9400381793b6ff5758fdde890efbd7963aa15a4: alerts and validated suspects by
province for seven provinces, Sud- and Nord-Ubangi written ND. 29 Oct is in the province list below.
"""
import json, urllib.request

COMMIT = "44a83458765a23cdaebba97cce52551740bc665f"
URL = ("https://raw.githubusercontent.com/frankbueltge/field-research/" + COMMIT +
       "/artifacts/2026-11-02-the-carried-zero/data51.js")
s = urllib.request.urlopen(URL).read().decode()
F51 = json.loads(s[s.index("{"):s.rindex("}") + 1])

D = json.load(open("data.json"))
assert F51["cal"] == D["days"], "calendars differ"
idx = {d: i for i, d in enumerate(D["days"])}
absent = sorted(idx[d] for d in F51["noReport"])
prov = sorted(idx[d] for d in F51["alertDates"])
assert len(absent) == 26 and len(prov) == 66  # 26 days with no row in the file
assert D["days"][prov[0]] == "2026-07-22" and D["days"][prov[-1]] == "2026-10-29"
assert all(D["days"][i] > "2026-05-30" for i in prov)
# 7 and 8 Oct: the reports exist (SitRep 146, 147) and table province suspects, but were never transcribed
untranscribed = sorted(set(absent) & set(prov))
assert [D["days"][i] for i in untranscribed] == ["2026-10-07", "2026-10-08"], untranscribed
assert F51["sitrepOf"]["2026-10-07"] == [146] and F51["sitrepOf"]["2026-10-08"] == [147]
absent = [i for i in absent if i not in untranscribed]
assert len(absent) == 24
# On a day with no report the file writes no rise anywhere: every zone's grain is zero there.
assert all(z["new"][i] == 0 for z in D["zones"] for i in absent)
# province suspicion on days the file writes none, zone or national
silent = [i for i in prov if i not in set(D["susp_days_nat"]) and i not in set(D["susp_days_zone"])]
assert len(silent) == 64, len(silent)
both = [D["days"][i] for i in prov if i not in silent]
assert both == ["2026-07-22", "2026-07-23"], both  # the file still writes national suspicion then
# 24 days with no report of 169; 23 of them after 30 May
after = [i for i in absent if D["days"][i] > "2026-05-30"]
assert len(after) == 23, len(after)

D["report_absent"] = absent
D["report_untranscribed"] = untranscribed
D["province_suspicion"] = prov
D["reports_source"] = ("The Field, check 51 (The Carried Zero), data51.js at field-research " + COMMIT[:12] +
                       "; from the 138 INSP situation reports in INRB-UMIE/BDBV2026-Data d9400381793b")
D["facts"]["report_absent_days"] = len(absent)
D["facts"]["report_untranscribed_days"] = len(untranscribed)
D["facts"]["province_suspicion_days"] = len(prov)
D["facts"]["province_suspicion_days_file_silent"] = len(silent)
D["facts"]["first_province_suspicion"] = D["days"][prov[0]]
json.dump(D, open("data.json", "w"), separators=(",", ":"))
print("ok: 24 days with no report (23 after 30 May), 2 with a report never transcribed (7-8 Oct); 66 days of province suspicion,",
      D["days"][prov[0]], "to", D["days"][prov[-1]], "— on 64 of them the file writes no suspicion")
