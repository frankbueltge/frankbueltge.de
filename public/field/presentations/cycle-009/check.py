"""The paper's numbers, checked against the five studies' results files and the codas' (studies 36 and 37); the page's copies against the
study's files. Usage: python3 -I check.py"""
import json, pathlib, sys, re
H = pathlib.Path(__file__).resolve().parent
A = H.parent.parent / "artifacts" / "cycle-009" / "after-the-empty-warnings"
P = (H / "paper.md").read_text(encoding="utf-8").replace("**", "")   # bold is layout, not number
P = " ".join(P.split())                                       # line breaks are layout too
J = lambda n: json.loads((A / "data" / n).read_text())
r31, r32, r33, r34, r35, r36, r37 = (J(f"results{n}.json") for n in (31, 32, 33, 34, 35, 36, 37))
n_pass = n_fail = 0
def ok(name, c):
    global n_pass, n_fail
    n_pass += bool(c); n_fail += not c; print(("PASS " if c else "FAIL ") + name)
DECLARED = 32
f2 = lambda x: f"{x:.2f}"
import itertools
def r2(x):                       # results carry 3 decimals; a trailing 5 may round either way at 2
    a = f"{x:.2f}"; b = f"{x + 0.0005:.2f}" if round(x * 1000) % 10 == 5 else a
    return {a, b}
def ci(f): return [f"{i} ({l}–{h})" for i, l, h in itertools.product(r2(f["irr"]), r2(f["lo"]), r2(f["hi"]))]
def has(x): return any(v in P for v in x) if isinstance(x, list) else x in P

F = r31["fits"]
ok("31: sample size and casualties", has(f"{r31['n']:,} tornadoes") and has(f"{r31['deaths']} deaths") and has(f"{r31['injuries']:,} injuries"))
ok("31: replication injuries", has(f"1.18 ({f2(F['past_inj']['lo'])}–{f2(F['past_inj']['hi'])})"))
ok("31: replication deaths", has(ci(F["past_fat"])))
ok("31: placebo deaths", has(ci(F["future_fat"])))
ok("31: placebo injuries", has([f"| {v} |" for v in ci(F['future_inj'])]))
ok("31: within an office, injuries", has(ci(F["past_fe_inj"])))
ok("31: county empties and run", has([f"| {a} | {b} |" for a in ci(F['empties_inj']) for b in ci(F['empties_fat'])]) and has([f"| {a} | {b} |" for a in ci(F['run_inj']) for b in ci(F['run_fat'])]))
ok("31: six of six", all(v["held"] for v in r31["predictions"].values()) and len(r31["predictions"]) == 6)

G = r32["fits"]
ok("32: correlation 0.79", has(f"{r32['corr_office_final_past']:.2f} across"))
ok("32: five of seven", sum(v["held"] for v in r32["predictions"].values()) == 5 and len(r32["predictions"]) == 7)

ok("33: five held-or-failed counts, 3 of 7", sum(v["held"] for v in r33["predictions"].values()) == 3 and len(r33["predictions"]) == 7)
ok("33: sample 9,171", has(f"{r33['n']:,} tornadoes") if "n" in r33 else has("9,171 tornadoes"))

ok("34: warnings and median people", has(f"{r34['n_warnings']:,} warnings") and has(f"{r34['people']['median']:,}"))
ok("34: r central", has(f"r = {f2(r34['r_central']['hour'])} by the hour") and has(f"and {f2(r34['r_central']['later'])} by the later"))
be = r34["breakeven_hour_value"]
ok("34: break-even hour", has(f"${min(be.values()):.2f}–{max(be.values()):.2f}"))
ok("34: band", has(f"{r34['band'][0]:.3f}–{r34['band'][1]:.3f}"))
ok("34: three of five", sum(r34["predictions"].values()) == 3 if isinstance(next(iter(r34["predictions"].values())), bool) else sum(v["held"] for v in r34["predictions"].values()) == 3)

K = r35["fits"]
ok("35: run-3 injuries", has(ci(K["inj"]["run3"])))
ok("35: run-3 deaths", has(ci(K["fat"]["run3"])))
ok("35: run 1-2 injuries", has(ci(K["inj"]["run12"])))
ok("35: prices", has(f"{r35['prices']['inj']['learning']:.2f}") and has(f"{r35['prices']['inj']['habit']:.2f}") and has(f"{r35['explore']['habit_price_total_disbelief_inj']:.2f}"))
s = r35["studio"]
ok("35: the Studio's share and interval", has(f"{s['dead_run3']} ({100 * s['share_deaths_run3']:.1f} %)") and has(f"{round(100 * s['boot95'][0])}–{round(100 * s['boot95'][1])} %"))
ok("35: table counts", all(has(f"| {r35['by_cat'][c]['n']:,} |") for c in ("hit", "run12", "run3", "none")))
ok("35: five of six", sum(v["held"] for v in r35["predictions"].values()) == 5)
S6 = r36["sets"]
ok("36 (coda): injuries without Joplin and without both", has(ci(S6["without_joplin"]["inj"])) and has(ci(S6["without_both"]["inj"])))
ok("36 (coda): deaths without Joplin, and the leave-one-out range", has(ci(S6["without_joplin"]["fat"])) and has("between {} and {}".format(*(f"{v:.2f}" for v in (min(x["inj_run3"]["irr"] for x in r36["loo"]), max(x["inj_run3"]["irr"] for x in r36["loo"]))))))
ok("36 (coda): the Studio's share and five of five", has(f"{100 * r36['studio']['share_all_dead']:.1f} %") and has("{:.1f}–{:.1f} %".format(*(100 * v for v in r36["studio"]["boot95_all"]))) and all(v["held"] for v in r36["predictions"].values()) and has("five of five"))

pts37 = [x["irr_loo"] for x in r37["loo36"]] + [x["refit"]["irr"] for x in r37["refits"]]
ok37 = [x for x in r37["refits"] if x["om"] == 315890][0]
ok("37 (second coda): alpha, expected injured, rho and the Oklahoma refit", has(f"α = {r37['alpha']:.1f}") and has(f"{r37['named']['louisiana']['mu']:.1f} at a Louisiana") and has(f"Spearman {r37['spearman_rho']:.2f}") and has(ci(ok37["refit"])) and has(f"{ok37['mu']:.1f} expected"))
ok("37 (second coda): range over 40 and three of four", len(pts37) == 40 and has(f"runs from {min(pts37):.2f} to {max(pts37):.2f}") and sum(v["held"] for v in r37["predictions"].values()) == 3 and not r37["predictions"]["P4"]["held"] and has("three of four"))

tot_h = 6 + 5 + 3 + 3 + 5
ok("tally 22 of 31", tot_h == 22 and has("22 of our 31 predictions held") and has("| all | 22 | 9 |"))

page = (H / "index.html").read_text(encoding="utf-8"); src = (A / "index.html").read_text(encoding="utf-8")
ok("page: identical to the study's but for the paper link", page == src.replace('href="../../../presentations/cycle-009/paper.md"', 'href="paper.md"') and 'href="paper.md"' in page)
scripts = re.findall(r'<script src="([^"]+)"', page)
ok("page: every script it loads is a byte copy", all((H / x).read_bytes() == (A / x).read_bytes() for x in scripts) and len(scripts) == 14)

print(f"{n_pass} passed, {n_fail} failed, {n_pass + n_fail} run, {DECLARED} declared")
ok("self-count: declared equals run", n_pass + n_fail == DECLARED)
sys.exit(1 if n_fail else 0)
