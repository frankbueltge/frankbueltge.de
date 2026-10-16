"""Builds index.html from template.html and the seven studies' results files, and copies study 19's
per-tornado columns beside it as fine.js (no network). Usage: python3 build.py"""
import json, os, shutil
H = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(H, "..", "..", "artifacts", *p)
J = lambda *p: json.load(open(A(*p), encoding="utf-8"))
s1 = J("2026-10-14-the-tornadoes-that-came", "data", "results.json")["rules"]["registered"]
s2 = J("2026-10-14-the-warnings-never-needed", "data", "results.json")
s3 = J("2026-10-14-who-was-beneath", "data", "results.json")["fits"]
s4 = J("2026-10-15-where-nobody-was", "data", "results.json")
s5 = J("2026-10-15-the-end-written-in-advance", "correction-2026-10-16", "results.json")
s6 = J("2026-10-16-the-clock-and-the-record", "data", "results.json")
s7 = J("2026-10-16-the-fine-for-working", "data", "results.json")
w = lambda c: [c["irr"], c["lo"], c["hi"]]
d = {
    "s1": {"k": s1["all"]["k"], "n": s1["all"]["n"], "eras": {e: s1["by_era"][e]["pct"] for e in ("2008-2011", "2012-2016", "2017-2023")},
           "killer": [s1["killer"]["k"], s1["killer"]["n"]], "deaths": [s1["deaths"]["in_warned_ahead"], s1["deaths"]["total"]]},
    "s2": {"k": s2["V"]["all"]["k"], "n": s2["V"]["all"]["n"], "farV": {e: v["far"] for e, v in s2["V"]["eras"].items()},
           "farS": {e: v["far"] for e, v in s2["S"]["eras"].items()}},
    "s3": {"inj": w(s3["M1_inj_nb"]["coef"]["warned"]), "fat": w(s3["M1_fat_nb"]["coef"]["warned"]), "fat_pooled": w(s3["M1_fat_poisson"]["coef"]["warned"])},
    "s4": {"or": s4["adjusted_V"]["or_per_tenfold_density"], "fifths": [q["V"][0] for q in s4["quintiles"]], "weak": [q["weak_among_verified"][0] for q in s4["quintiles"]]},
    "s5": {"silent": s5["P1"]["silent"], "expiry": s5["P1"]["with_expiry_after_sent"], "before": s5["P3"]["cancel_before_expiry"], "cancels": s5["P3"]["cancelled_with_expiry"],
           "eta_acc": s5["exploratory"]["eta2_account"]["eta2"], "eta_code": s5["exploratory"]["eta2_code"]["eta2"]},
    "s6": {"before": s6["windows"]["20"]["before"], "after": s6["windows"]["20"]["after"], "diff": s6["windows"]["20"]["diff_after_minus_before_points"],
           "ci": s6["windows"]["20"]["diff_ci95"], "placebo": [s6["placebo_20"]["diff_after_minus_before_points"], s6["placebo_20"]["diff_ci95"]]},
    "s7": {y: {k: s7[y][k] for k in ("OR_warned", "OR_ci", "R", "R_ci", "z_one", "z_one_ci", "z_two", "z_two_ci")} for y in ("H", "D")},
}
emb = json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
t = open(os.path.join(H, "template.html"), encoding="utf-8").read()
open(os.path.join(H, "index.html"), "w", encoding="utf-8").write(t.replace("__DATA__", emb))
shutil.copyfile(A("2026-10-16-the-fine-for-working", "data.js"), os.path.join(H, "fine.js"))
