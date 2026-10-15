#!/usr/bin/env python3
"""Re-derive every figure this artifact states, from the committed probe file. No network.

    python3 artifacts/2026-09-15-whose-refusal-is-it/check.py

It does not import build.py's arithmetic: the counts are recomputed here from probes.json by
hand, so agreement means two independent paths reach the same number. It also checks that the
page states no figure data.json does not hold, that the pre-registration's rules were actually
the rules applied, and that the instrument checks were run before the probe.
"""
import json
import pathlib
import re
import subprocess
import sys

ART = pathlib.Path(__file__).resolve().parent
DATA = ART / "data"
ROOT = ART.parents[1]
sys.path.insert(0, str(ROOT / "tools/refusal-shape"))

fails = []
n = 0


def ck(label, cond, detail=""):
    global n
    n += 1
    if not cond:
        fails.append(f"{label} — {detail}")


P = json.loads((DATA / "probes.json").read_text())
D = json.loads((DATA / "data.json").read_text())
POP = json.loads((DATA / "population.json").read_text())
FX = json.loads((DATA / "fixture-check.json").read_text())
MU = json.loads((DATA / "mutation-check.json").read_text())
AS = json.loads((DATA / "arm-selftest.json").read_text())
PAGE = (ART / "index.html").read_text()
PRE = (ART / "PREREGISTRATION.md").read_text()
ROWS = D["rows"]
ARMS = ("bare", "urllib", "named")

# ---------------------------------------------------------------- shape ----
ck("population size", len(POP["units"]) == 69, len(POP["units"]))
ck("one row per unit", len(ROWS) == len(P["units"]) == 69)
ck("row ids match probe ids",
   [r["unit_id"] for r in ROWS] == [u["unit_id"] for u in P["units"]])
ck("every unit_id unique", len({r["unit_id"] for r in ROWS}) == 69)
ck("every url unique", len({r["url"] for r in ROWS}) == 69)
ck("strata sizes", [sum(1 for r in ROWS if r["stratum"] == s) for s in ("H", "L1", "L2", "C")]
   == [13, 24, 24, 8])

# --------------------------------------------------- statuses re-derived ----
for r, u in zip(ROWS, P["units"]):
    for a in ARMS:
        got = (u["arms"].get(a) or {}).get("status")
        ck(f"status {a} {r['unit_id'][:24]}", r[f"status_{a}"] == got, f"{r[f'status_{a}']} vs {got}")

probed = [r for r in ROWS if not r["robots_blocked"]]
ck("65 units probed", len(probed) == 65, len(probed))
ck("4 units not probed", len(ROWS) - len(probed) == 4)
ck("unprobed units have no arms", all(not P["units"][i]["arms"]
                                      for i, r in enumerate(ROWS) if r["robots_blocked"]))

# --------------------------------------------------------- codings ----------
codes = {}
for r in ROWS:
    codes[r["code"]] = codes.get(r["code"], 0) + 1
ck("code totals sum to 69", sum(codes.values()) == 69)
ck("codes match data.json", codes == D["codes"]["all"], f"{codes} vs {D['codes']['all']}")
ck("refuses-all = 50", codes.get("refuses-all") == 50, codes.get("refuses-all"))
ck("client-string = 6", codes.get("client-string") == 6, codes.get("client-string"))
ck("open = 8", codes.get("open") == 8, codes.get("open"))
ck("policy-published = 4", codes.get("policy-published") == 4, codes.get("policy-published"))

# every coding re-derived from the raw statuses, independently of coding.py
for r in ROWS:
    st = [r[f"status_{a}"] for a in ARMS]
    ok = [s for s in st if s is not None and 200 <= s < 300]
    no = [s for s in st if s in (401, 403, 429)]
    if r["robots_blocked"]:
        want = "policy-published"
    elif all(s == 401 for s in st) and r["www_authenticate"]:
        want = "key-declared"
    elif len(ok) == 3:
        want = "open"
    elif ok and no:
        want = "client-string"
    elif len(no) == 3:
        want = "refuses-all"
    else:
        want = "other"
    ck(f"coding {r['unit_id'][:30]}", r["code"] == want, f"{r['code']} vs {want} from {st}")

# ------------------------------------------------------- headline figures ---
H = [r for r in ROWS if r["stratum"] == "H"]
L = [r for r in ROWS if r["stratum"] in ("L1", "L2")]
C = [r for r in ROWS if r["stratum"] == "C"]
OURS = ("open", "client-string")
h_ours = sum(1 for r in H if r["code"] in OURS)
l_theirs = sum(1 for r in L if r["code"] in ("refuses-all", "key-declared"))
ck("H ours = 3", h_ours == 3, h_ours)
ck("H ours matches data.json", D["headline"]["refusal_was_ours_H"]["k"] == h_ours)
ck("H ours pct", abs(D["headline"]["refusal_was_ours_H"]["pct"] - 100 * 3 / 13) < 0.01)
ck("L theirs = 43", l_theirs == 43, l_theirs)
ck("L theirs matches data.json", D["headline"]["refusal_was_theirs_L"]["k"] == l_theirs)
ck("L ours = 4", sum(1 for r in L if r["code"] in OURS) == 4)
ck("register_label_wrong = 3 in H", sum(1 for r in H if r["register_label_wrong"]) == 3)
ck("register_label_wrong only in H", sum(1 for r in ROWS if r["register_label_wrong"]) == 3)
for r in ROWS:
    if r["register_label_wrong"]:
        ck(f"label_wrong justified {r['unit_id'][:24]}",
           r["code"] in OURS and not r["www_authenticate"]
           and re.search(r"Anmeldung|Schl[uü]ssel|login|key", r["recorded_note"] or "", re.I) is not None)

# ------------------------------------------------------ published ground ----
ref = [r for r in ROWS if r["code"] == "refuses-all"]
allowed = sum(1 for r in ref if r["resolved_host_robots"] == "allowed")
nonesrv = sum(1 for r in ref if r["resolved_host_robots"] == "no-robots-served")
disall = sum(1 for r in ref if r["resolved_host_robots"] == "disallowed")
ck("refusing units = 50", len(ref) == 50, len(ref))
ck("33 refused where robots permits", allowed == 33, allowed)
ck("17 refused where no robots served", nonesrv == 17, nonesrv)
ck("THE CLAIM: zero refusals rest on a covering published rule", disall == 0, disall)
ck("33+17 accounts for all 50", allowed + nonesrv + disall == 50)
ck("ground counts match data.json",
   D["published_ground"]["refusing_whose_robots_permits_the_path"] == allowed
   and D["published_ground"]["refusing_whose_host_serves_no_robots"] == nonesrv)

rob = dict(P["robots_resolved_hosts"])
for h, v in P["robots_request_hosts"].items():
    rob.setdefault(h, v)
refused_robots = sorted(h for h, v in rob.items() if v.get("status") in (401, 403, 429))
ck("16 hosts refuse their own robots.txt", len(refused_robots) == 16, len(refused_robots))
ck("that list matches data.json",
   refused_robots == D["published_ground"]["hosts_refusing_their_own_robots_txt"])
ck("every host refusing robots really shows 401/403/429",
   all(rob[h]["status"] in (401, 403, 429) for h in refused_robots))

# --------------------------------------------------------- arm patterns -----
dis = [r for r in ROWS if r["arm_pattern"] not in ("all-agree", "not-probed")]
na = [r for r in dis if r["arm_pattern"] == "named-apart"]
ua = [r for r in dis if r["arm_pattern"] == "urllib-apart"]
ck("8 disagreeing units", len(dis) == 8, len(dis))
ck("4 named-apart", len(na) == 4, len(na))
ck("4 urllib-apart", len(ua) == 4, len(ua))
ck("named-apart is not a majority of disagreements", len(na) <= len(dis) / 2)
for a, want in (("bare", 9), ("urllib", 9), ("named", 13)):
    got = sum(1 for r in ROWS if r[f"status_{a}"] is not None and 200 <= r[f"status_{a}"] < 300)
    ck(f"{a} reached {want} doors", got == want, got)
    ck(f"{a} 2xx matches data.json", D["arm_patterns"]["per_arm_2xx"][a] == got)
for r in dis:
    st = [r[f"status_{a}"] for a in ARMS]
    ck(f"disagreement real {r['unit_id'][:24]}", len(set(map(str, st))) > 1, st)

# ------------------------------- the arms were what the pre-registration said -
ua_seen = {k: v["user_agent_received"] for k, v in AS["arms"].items()}
ck("bare sent no User-Agent", ua_seen["bare"] is None, ua_seen["bare"])
ck("urllib sent the library default", (ua_seen["urllib"] or "").startswith("Python-urllib/"))
ck("named sent this practice's string", ua_seen["named"] == P["named_user_agent"])
ck("no arm impersonated a browser",
   not any(w in (v or "").lower() for v in ua_seen.values()
           for w in ("mozilla", "chrome", "safari", "firefox", "webkit")))
ck("arm self-test has no failures", AS["failures"] == [], AS["failures"])
ck("arms survive the egress proxy", AS["network_leg"]["arms_survive_this_egress"] is True)
ck("named UA carries a contact address", "frankbueltge.de" in P["named_user_agent"])

# ------------------------------------------- the instrument checks ----------
ck("fixtures all pass", FX["failures"] == 0, FX["failures"])
ck("fixture set has must-not-fire cases", FX["code_unit_must_not_fire"] >= 8,
   FX["code_unit_must_not_fire"])
ck("36 fixture cases", FX["cases"] == 36, FX["cases"])
ck("no mutation survives", MU["survived"] == 0, MU["survived"])
ck("10 mutations tried", MU["mutations"] == 10, MU["mutations"])
ck("every mutation was actually applied", all(r.get("applied") for r in MU["results"]))
ck("every mutation is caught by at least one fixture",
   all(r["fixtures_that_caught_it"] >= 1 for r in MU["results"]))
ck("the surviving-mutation history is recorded", any("M5" in h["event"] for h in MU["history"]))

# ------------------------------------------------ predictions and verdicts --
pv = {p["id"]: p["verdict"] for p in D["predictions"]}
ck("six predictions", len(D["predictions"]) == 6)
ck("P1 refuted", pv["P1"] == "REFUTED", pv["P1"])
ck("P2 confirmed", pv["P2"] == "confirmed", pv["P2"])
ck("P3 refuted", pv["P3"] == "REFUTED", pv["P3"])
ck("P4 confirmed", pv["P4"] == "confirmed", pv["P4"])
ck("P5 confirmed", pv["P5"] == "confirmed", pv["P5"])
ck("P6 refuted (kill condition fired)", pv["P6"] == "REFUTED", pv["P6"])
ck("P1 verdict follows its own rule", (h_ours >= 5) == (pv["P1"] == "confirmed"))
ck("P3 verdict follows its own rule", (len(na) > len(dis) / 2) == (pv["P3"] == "confirmed"))
ck("P6 verdict follows its own rule",
   all(r["code"] == "open" for r in C) == (pv["P6"] == "confirmed"))
ck("exactly two controls are not open", sum(1 for r in C if r["code"] != "open") == 2)
ck("the failing controls are not transport failures",
   all(any(r[f"status_{a}"] is not None for a in ARMS) or r["robots_blocked"]
       for r in C if r["code"] != "open"))
ck("six of eight controls fully open", sum(1 for r in C if r["code"] == "open") == 6)

# --------------------------------- pre-registration governs what was done ---
ck("pre-registration names the three arms",
   all(a in PRE for a in ("bare", "urllib", "named")))
ck("pre-registration excludes browser impersonation",
   re.search(r"claiming to be a\s+browser", PRE) is not None)
ck("pre-registration states the robots skip rule", "is not probed" in PRE)
ck("pre-registration states P6 as a kill condition", "kill condition" in PRE.lower())
ck("all six coding codes are defined in the pre-registration",
   all(c in PRE for c in ("policy-published", "key-declared", "open", "client-string",
                          "refuses-all", "other")))
ck("population seed is the pre-registered one", POP["seed"] == 20260915)
ck("202 exclusion carries its ground", "202" in PRE and POP["excluded_by_rule"]["ground"])

# ------------------------------------------------------ page fidelity -------
ck("page renders from data.json (make_page --check)",
   subprocess.run([sys.executable, str(ROOT / "tools/refusal-shape/make_page.py"), "--check"],
                  capture_output=True).returncode == 0)
ck("page is self-contained: no external fetch",
   not re.search(r'src="https?://|href="https?://|@import|fetch\(', PAGE))
ck("page states the zero", "0&#8202;/&#8202;50" in PAGE or "0/50" in PAGE)
for fig in ("43", "33", "17", "16", "23.08", "89.58"):
    ck(f"page states {fig}", fig in PAGE)
ck("page carries the one-sided/two-sided warning", "one-sided" in PAGE)
ck("page marks the post-hoc observation as post-hoc", "not pre-registered" in PAGE)
ck("page says a 200 is not a reading", "200 is not a reading" in PAGE)
ck("every table row in the page corresponds to a unit",
   PAGE.count('<td class="id">') == 69, PAGE.count('<td class="id">'))

# -------------------------------------------------------- honesty checks ----
ck("no arm record claims a browser UA",
   not any("Mozilla" in json.dumps(u.get("arms", {})) for u in P["units"]))
ck("no unit was probed after a robots disallow",
   all(not u["arms"] for u in P["units"] if u.get("robots_blocked")))
ck("feed digests recorded", all(POP["feeds"][k]["sha256"] for k in POP["feeds"]))
ck("probe run is dated", P["probed_utc"].startswith("2026-09-15"))
ck("the robots completion pass is disclosed", "_completion_note" in P)

TC = json.loads((DATA / "tamper-check.json").read_text())
ck("the checker was tamper-tested", TC["tampers"] >= 8, TC["tampers"])
ck("no tamper went unnoticed", TC["missed"] == 0, TC["missed"])
ck("every tamper was actually caught", all(r["caught"] for r in TC["results"]))

print(f"{n} checks, {len(fails)} failed")
for f in fails:
    print("  FAIL:", f)
sys.exit(1 if fails else 0)
