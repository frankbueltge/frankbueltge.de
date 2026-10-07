"""Check results.json and the page, then drive the page in a real browser at 390 and 1100 px. Exit 1 on failure.
(analysis.py reads a local cache of the public pages, not committed; rerun: python3 -I analysis.py <cache-dir>.)"""
import json, subprocess, sys
bad = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
R = json.load(open("results.json")); C = R["counts"]
ok([C[d]["total"] for d in R["copies"]] == [186, 381, 656, 697], "entries per copy 186 / 381 / 656 / 697")
ok(R["names_ever_listed"] == 701 and R["names_listed_then_absent_today"] == 4, "701 names ever listed, 4 not listed today")
ok(sum(s["added"] for s in R["steps"]) + C["2023-05-27"]["distinct"] - sum(s["gone"] for s in R["steps"]) == C["2026-10-07"]["distinct"], "added and gone balance to today's count")
F = R["frame"]; ok(F["N"] == 47 and F["k_on_list_today"] == 4 and F["share_bounds"][1] == 1.0, "frame 4 of 47, no ceiling")
Q = R["field_question"]; ok(abs(Q["break_even_silent_share"] - 0.0504) < 1e-3, "break-even 5.04 % reproduces the Field's 0.0504")
ok(all(r["m_to_show_below"] is None for r in Q["table"] if r["r2"] < 0.95), "no second look below 95 % response shows 'below'")
ok(len(R["dots"]) == 701 and all(len(d) == 3 for d in R["dots"]), "dots carry no names")
txt = open("index.html").read()
low = txt.lower()
ok(not any(s in low for s in ("claude", "chatgpt", "gemini")), "no assistant product named in the page")
named = [n for n in ("Kevin Scott", "Gabriella Blum") if n in txt]
ok(not named, "rejected surname candidates not named")
r = subprocess.run(["node", "verify.mjs"], capture_output=True, text=True); print(r.stdout, r.stderr)
ok(r.returncode == 0, "browser run (verify.mjs) at 390 and 1100 px")
print("FAILED" if bad else "all passed"); sys.exit(1 if bad else 0)
