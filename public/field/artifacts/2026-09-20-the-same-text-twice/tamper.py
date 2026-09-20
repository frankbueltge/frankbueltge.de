#!/usr/bin/env python3
"""Corrupt this session's own evidence, one way at a time, and require the checker
to catch every one.

Session 165. No network. Each corruption is applied to a throwaway copy of the
repository's relevant parts; the working tree is never touched. A corruption that
the checker does not catch is a hole in the checker and is reported as a failure of
this script, not of the corruption.

2026-09-19's corruption run found two real holes in that session's checker. This one
is run for the same reason.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
NAME = os.path.basename(HERE)
NEEDED = ("2026-09-18-a-licence-file-is-not-a-licence", "2026-09-19-the-second-hand")


def stage():
    t = tempfile.mkdtemp(prefix="tamper165-")
    shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(t, "tools"))
    os.makedirs(os.path.join(t, "artifacts"))
    shutil.copytree(HERE, os.path.join(t, "artifacts", NAME))
    for n in NEEDED:
        os.symlink(os.path.join(ROOT, "artifacts", n), os.path.join(t, "artifacts", n))
    return t


def jload(t, rel):
    return json.load(open(os.path.join(t, "artifacts", NAME, rel)))


def jsave(t, rel, d):
    json.dump(d, open(os.path.join(t, "artifacts", NAME, rel), "w"), indent=1,
              ensure_ascii=False)


def text(t, rel):
    return open(os.path.join(t, "artifacts", NAME, rel)).read()


def wtext(t, rel, s):
    open(os.path.join(t, "artifacts", NAME, rel), "w").write(s)


# --------------------------------------------------------------- corruptions
def c_total(t):
    d = jload(t, "data/data.json"); d["runs"]["shipped"]["registered_scored_total"] = 1135
    jsave(t, "data/data.json", d)


def c_decision(t):
    d = jload(t, "data/data.json"); d["runs"]["shipped"]["decision_scored_total"] = 166
    jsave(t, "data/data.json", d)


def c_echo(t):
    d = jload(t, "data/data.json"); d["runs"]["shipped"]["echo_only_violations"] = 900
    jsave(t, "data/data.json", d)


def c_k1(t):
    d = jload(t, "data/data.json")
    d["kill_conditions"]["K1_fidelity_of_SUT"]["mismatches"] = [["x", "families"]]
    jsave(t, "data/data.json", d)


def c_k3(t):
    d = jload(t, "data/data.json"); d["kill_conditions"]["K3_null"]["fired"] = True
    jsave(t, "data/data.json", d)


def c_k1_files(t):
    d = jload(t, "data/data.json")
    d["kill_conditions"]["K1_fidelity_of_SUT"]["files_compared"] = 140
    jsave(t, "data/data.json", d)


def c_headline(t):
    d = jload(t, "data/data.json"); d["headline_rederived"]["D"]["pct"] = 94.3
    jsave(t, "data/data.json", d)


def c_noholder(t):
    d = jload(t, "data/data.json"); d["headline_rederived"]["C"]["names_no_holder"] = 7
    jsave(t, "data/data.json", d)


def c_noholder_set(t):
    d = jload(t, "data/data.json")
    d["headline_rederived"]["D"]["names_no_holder_repos"][0] = "someone/else"
    jsave(t, "data/data.json", d)


def c_control(t):
    d = jload(t, "data/data.json"); d["runs"]["D"]["registered_oracle"]["M4"] = 1
    jsave(t, "data/data.json", d)


def c_ladder(t):
    d = jload(t, "data/data.json"); d["runs"]["D"]["decision_scored_total"] = 9
    jsave(t, "data/data.json", d)


def c_resurrection(t):
    d = jload(t, "data/data.json"); d["runs"]["B"]["decision_oracle"]["M6"] = 5
    jsave(t, "data/data.json", d)


def c_repair_m1(t):
    d = jload(t, "data/data.json"); d["runs"]["C"]["decision_oracle"]["M1"] = 3
    jsave(t, "data/data.json", d)


def c_c1_claim(t):
    d = jload(t, "data/data.json"); d["corpora"]["C1"]["identical_to_2026_09_19"] = False
    jsave(t, "data/data.json", d)


def c_movement(t):
    d = jload(t, "data/data.json")
    d["baseline_movement_under_repair"]["C"]["C2"]["decisions"] = ["some/other@LICENSE"]
    jsave(t, "data/data.json", d)


def c_variant_same(t):
    d = jload(t, "data/data.json")
    d["runs"]["D"]["rule_digests"]["fingerprints.py"] = \
        d["runs"]["C"]["rule_digests"]["fingerprints.py"]
    jsave(t, "data/data.json", d)


def c_rule_not_pinned(t):
    d = jload(t, "data/data.json")
    d["runs"]["shipped"]["rule_digests"]["rules.py"] = "0" * 64
    jsave(t, "data/data.json", d)


def c_c1_matches(t):
    d = jload(t, "data/corpus-c1.json"); d["texts_ok"] = 739
    jsave(t, "data/corpus-c1.json", d)


def c_c1_digest(t):
    d = jload(t, "data/corpus-c1.json"); d["entries"][0]["sha256"] = "f" * 64
    jsave(t, "data/corpus-c1.json", d)


def c_c2_matches(t):
    d = jload(t, "data/corpus-c2.json"); d["n_digest_matches"] = 155
    jsave(t, "data/corpus-c2.json", d)


def c_c2_digest(t):
    d = jload(t, "data/corpus-c2.json"); d["entries"][3]["sha256"] = "e" * 64
    jsave(t, "data/corpus-c2.json", d)


def c_c2_excluded(t):
    d = jload(t, "data/corpus-c2.json"); d["excluded"] = ["a/b@LICENSE"]
    jsave(t, "data/corpus-c2.json", d)


def c_adj_defect(t):
    d = jload(t, "data/adjudication.json"); d["totals"]["DEFECT_instances"] = 40
    jsave(t, "data/adjudication.json", d)


def c_adj_undecided(t):
    d = jload(t, "data/adjudication.json"); d["totals"]["UNDECIDED"] = 2
    jsave(t, "data/adjudication.json", d)


def c_adj_inputs(t):
    d = jload(t, "data/adjudication.json")
    for cl in d["classes"]:
        if cl["n"] == 1:
            cl["inputs_C2"] = []
    jsave(t, "data/adjudication.json", d)


def c_adj_bad_input(t):
    d = jload(t, "data/adjudication.json")
    for cl in d["classes"]:
        if cl["n"] == 6:
            cl["inputs"] = ["NotAnInputAtAll"]
    jsave(t, "data/adjudication.json", d)


def c_adj_category(t):
    d = jload(t, "data/adjudication.json")
    for cl in d["classes"]:
        if cl["n"] == 7:
            cl["verdict"] = "PROBABLY-FINE"
    jsave(t, "data/adjudication.json", d)


def c_adj_causes(t):
    d = jload(t, "data/adjudication.json"); d["totals"]["distinct_causes"] = 1
    jsave(t, "data/adjudication.json", d)


def c_adj_coverage(t):
    d = jload(t, "data/adjudication.json")
    for cl in d["classes"]:
        if cl["n"] == 3:
            cl["n_inputs"] = 50
    jsave(t, "data/adjudication.json", d)


def c_pred_flip(t):
    d = jload(t, "data/predictions.json")
    for p in d["predictions"]:
        if p["id"] == "P6":
            p["outcome"] = "CONFIRMED"
    jsave(t, "data/predictions.json", d)


def c_pred_score(t):
    d = jload(t, "data/predictions.json"); d["score"] = {"confirmed": 7, "refuted": 0}
    jsave(t, "data/predictions.json", d)


def c_pred_text(t):
    d = jload(t, "data/predictions.json")
    for p in d["predictions"]:
        if p["id"] == "P4":
            p["text"] = "M4 produces very few violations on both corpora."
    jsave(t, "data/predictions.json", d)


def c_pred_drop(t):
    d = jload(t, "data/predictions.json"); d["predictions"] = d["predictions"][:6]
    jsave(t, "data/predictions.json", d)


def c_pred_blind(t):
    d = jload(t, "data/predictions.json")
    for p in d["predictions"]:
        if p["id"] == "P1":
            p["flag"] = "a clean blind prediction"
    jsave(t, "data/predictions.json", d)


def c_pred_kill(t):
    d = jload(t, "data/predictions.json"); d["kill_conditions_fired"] = ["K2"]
    jsave(t, "data/predictions.json", d)


def c_src_quote_chen(t):
    d = jload(t, "data/sources.json")
    for s in d["sources"]:
        if s["id"] == "chen-1998":
            s["quotations"] = [{"q": "Metamorphic testing is a new approach.", "role": "invented"}]
    jsave(t, "data/sources.json", d)


def c_src_chen_status(t):
    d = jload(t, "data/sources.json")
    for s in d["sources"]:
        if s["id"] == "chen-1998":
            s["status"] = "READ AND QUOTED"
    jsave(t, "data/sources.json", d)


def c_src_digest(t):
    d = jload(t, "data/sources.json")
    for s in d["sources"]:
        if s["id"] == "segura-2016":
            s["pdf_sha256"] = "not-a-digest"
    jsave(t, "data/sources.json", d)


def c_src_quotes(t):
    d = jload(t, "data/sources.json")
    for s in d["sources"]:
        if s["id"] == "duque-torres-2023":
            s["quotations"] = s["quotations"][:1]
    jsave(t, "data/sources.json", d)


def c_src_world_claim(t):
    d = jload(t, "data/sources.json")
    d["not_found_by_our_search"] = ["No such comparison exists in the literature."]
    jsave(t, "data/sources.json", d)


def c_src_unread(t):
    d = jload(t, "data/sources.json")
    for x in d["found_and_not_read"]:
        x["why"] = x["why"].replace("verify_status 'toVerify'", "read and verified")
    jsave(t, "data/sources.json", d)


def c_app_model(t):
    d = jload(t, "data/apparatus.json"); d["no_model_in_the_measurement"] = "n/a"
    jsave(t, "data/apparatus.json", d)


def c_app_delegation(t):
    d = jload(t, "data/apparatus.json"); d["no_delegation"] = "unclear"
    jsave(t, "data/apparatus.json", d)


def c_app_lib(t):
    d = jload(t, "data/apparatus.json")
    d["third_party_libraries"] = [{"name": "PyMuPDF", "version": "", "used_for": "x"}]
    jsave(t, "data/apparatus.json", d)


def c_app_provider(t):
    d = jload(t, "data/apparatus.json")
    d["reasoning_and_writing_agent"]["provider"] = "unspecified"
    jsave(t, "data/apparatus.json", d)


def c_app_toolfail(t):
    d = jload(t, "data/apparatus.json")
    d["own_tool_failure_recorded_tonight"] = {"path": "none", "what": "", "consequence": ""}
    jsave(t, "data/apparatus.json", d)


def c_viol_drop(t):
    d = jload(t, "data/violations.json")
    d["by_rule"]["shipped"]["rows"] = d["by_rule"]["shipped"]["rows"][:-1]
    jsave(t, "data/violations.json", d)


def c_viol_tencent(t):
    d = jload(t, "data/violations.json")
    d["by_rule"]["shipped"]["rows"] = [
        r for r in d["by_rule"]["shipped"]["rows"]
        if not (r["relation"] == "M1" and "Tencent-XR-3DGen@geometry" in r["input"])]
    jsave(t, "data/violations.json", d)


def c_viol_m2(t):
    d = jload(t, "data/violations.json")
    for r in d["by_rule"]["shipped"]["rows"]:
        if r["relation"] == "M2":
            r["relation"] = "M1"
            break
    jsave(t, "data/violations.json", d)


def c_verd_drop(t):
    d = jload(t, "data/verdicts.json")
    d["inputs"].pop(next(iter(d["inputs"])))
    jsave(t, "data/verdicts.json", d)


def c_verd_move(t):
    d = jload(t, "data/verdicts.json")
    for k, v in d["inputs"].items():
        if v["shipped"]["attribution"] == "named":
            v["D"]["attribution"] = "no_holder"
            break
    jsave(t, "data/verdicts.json", d)


def c_fn_risk(t):
    d = jload(t, "data/false-notices.json"); d["decisions_at_risk"] = 1
    jsave(t, "data/false-notices.json", d)


def c_fn_posthoc(t):
    d = jload(t, "data/false-notices.json"); d["declared"] = "a pre-registered rung"
    jsave(t, "data/false-notices.json", d)


def c_fn_count(t):
    d = jload(t, "data/false-notices.json"); d["n_false_notices"] = 3
    jsave(t, "data/false-notices.json", d)


def c_fn_clean(t):
    d = jload(t, "data/false-notices.json")
    for h in d["hits"]:
        if h["corpus"] == "C2":
            h["n_clean_named"] = 0
    jsave(t, "data/false-notices.json", d)


def c_page_script(t):
    wtext(t, "index.html", text(t, "index.html").replace(
        "</body>", "<script>void 0</script></body>"))


def c_page_vendor(t):
    wtext(t, "index.html", text(t, "index.html").replace(
        "eight relations", "eight relations written with ChatGPT"))


def c_page_remote(t):
    wtext(t, "index.html", text(t, "index.html").replace(
        "<body>", '<body><img src="https://example.org/x.png" alt="">'))


def c_page_figure(t):
    wtext(t, "index.html", text(t, "index.html").replace("95.2", "ninety-five point two"))


def c_page_number(t):
    wtext(t, "index.html", text(t, "index.html").replace("1,134", "a great many"))


def c_summary_vendor(t):
    wtext(t, "SUMMARY.md", text(t, "SUMMARY.md") + "\n\nWritten with Claude.\n")


def c_prereg_digest(t):
    wtext(t, "PREREGISTRATION.md", text(t, "PREREGISTRATION.md").replace(
        "ccb373b6edb1e4397d7ac145aca6ff94e995934c9315b1ccc23eb266a288a2ed", "REDACTED"))


def c_rule_edited(t):
    p = os.path.join(t, "tools", "is-it-a-licence", "fingerprints.py")
    s = open(p).read().replace('|[A-Z0-9])")', '|[A-Z0-9])", re.I)')
    open(p, "w").write(s)


def c_relation_control(t):
    p = os.path.join(t, "tools", "same-text-twice", "relations.py")
    s = open(p).read().replace(
        'return "\\n".join(("    " + ln) if ln.strip() else ln for ln in t.split("\\n"))',
        'return "\\n".join(("  # " + ln) if ln.strip() else ln for ln in t.split("\\n"))')
    open(p, "w").write(s)


def c_relation_oneway(t):
    p = os.path.join(t, "tools", "same-text-twice", "relations.py")
    s = open(p).read().replace(
        'return _M1.sub(lambda m: "(C)" if m.group(1) == "c" else "(c)", t)',
        'return _M1.sub(lambda m: "(C)", t)')
    open(p, "w").write(s)


def c_relation_dropped(t):
    p = os.path.join(t, "tools", "same-text-twice", "relations.py")
    s = open(p).read().replace(
        '    ("M8", "trailing whitespace", m8_trailing),\n', "")
    open(p, "w").write(s)


def c_relation_wrap(t):
    p = os.path.join(t, "tools", "same-text-twice", "relations.py")
    s = open(p).read().replace("textwrap.wrap(joined, width=64)",
                               "textwrap.wrap(joined, width=200)")
    open(p, "w").write(s)


def c_missing_file(t):
    os.remove(os.path.join(t, "artifacts", NAME, "data", "adjudication.json"))


CORRUPTIONS = [(k[2:].replace("_", " "), v) for k, v in sorted(globals().items())
               if k.startswith("c_") and callable(v)]


def main():
    """Every corruption must fail the checker, AND the reason must be recorded.

    A corruption counted as 'caught' because the checker broke for an unrelated
    reason is a false pass. So the failing check lines are written out and the run
    also requires that no two corruptions are caught by an identical reason set,
    which is what a spuriously-failing checker would look like.
    """
    caught, missed, log = 0, [], {}
    for name, fn in CORRUPTIONS:
        t = stage()
        try:
            fn(t)
            r = subprocess.run(
                [sys.executable, os.path.join(t, "artifacts", NAME, "check.py")],
                capture_output=True, text=True, timeout=300)
            reasons = [l.strip()[6:].strip() for l in r.stdout.splitlines()
                       if l.strip().startswith("FAIL:")]
            if r.returncode == 0:
                missed.append((name, "checker passed a corrupted artifact"))
            elif not reasons:
                missed.append((name, "checker failed without naming a check: "
                                     + (r.stderr.strip().splitlines() or [""])[-1][:160]))
            else:
                caught += 1
                log[name] = reasons
        except Exception as exc:                      # a crash is not a catch
            missed.append((name, f"{type(exc).__name__}: {exc}"))
        finally:
            shutil.rmtree(t, ignore_errors=True)
    print(f"{len(CORRUPTIONS)} corruptions, {caught} caught, {len(missed)} missed")
    for m in missed:
        print("  MISSED:", m[0], "--", m[1])
    out = os.path.join(HERE, "data", "tamper-check.json")
    distinct = len({tuple(sorted(v)) for v in log.values()})
    json.dump({"note": "Session 165. Each deliberate corruption of this session's own "
                       "evidence, and the checks that caught it. A corruption is only "
                       "counted as caught when the checker named at least one failing "
                       "check; a checker that merely crashed is a miss.",
               "n_corruptions": len(CORRUPTIONS), "n_caught": caught,
               "n_missed": len(missed), "missed": missed,
               "distinct_reason_sets": distinct,
               "caught_by": {k: v for k, v in sorted(log.items())}},
              open(out, "w"), indent=1, ensure_ascii=False)
    print(f"  {distinct} distinct reason sets over {caught} corruptions"
          f" -> data/tamper-check.json")
    # the clean copy must still pass, or the harness itself is wrong
    t = stage()
    r = subprocess.run([sys.executable, os.path.join(t, "artifacts", NAME, "check.py")],
                       capture_output=True, text=True, timeout=300)
    shutil.rmtree(t, ignore_errors=True)
    if r.returncode != 0:
        print("  HARNESS FAILURE: the unmodified copy does not pass")
        print(r.stdout[-2000:])
        return 1
    print("  control: the unmodified copy passes")
    return 1 if missed else 0


if __name__ == "__main__":
    sys.exit(main())
