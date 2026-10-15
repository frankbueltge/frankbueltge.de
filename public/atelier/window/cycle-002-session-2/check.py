#!/usr/bin/env python3
"""Verification for cycle 002, session 2 — the Propp reduction.

Re-derives every load-bearing number from `data.json` and `verdicts.json` without
importing `build.py`, and asserts that the number actually printed in `index.html`
agrees. A page whose prose has drifted from its data fails here.

    python3 window/cycle-002-session-2/check.py          # exit 0 on success
    python3 window/cycle-002-session-2/check.py --demo   # prove it can fail

The `--demo` switch perturbs one value in a copy of the derived record and shows the
checks catching it. A check nobody has watched fail is a check nobody should trust.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

from __future__ import annotations

import copy
import html
import json
import pathlib
import re
import statistics
import sys

HERE = pathlib.Path(__file__).resolve().parent
ORDER = ["A", "B", "C", "D"]
VERDICTS = {"same move", "adjacent move", "same subject", "not a pair"}

FAILS: list[str] = []
N_CHECKS = 0


def check(cond: bool, what: str) -> None:
    global N_CHECKS
    N_CHECKS += 1
    if not cond:
        FAILS.append(what)


def text_of(page: str) -> str:
    """The page as a reader sees it: tags stripped, entities resolved."""
    t = re.sub(r"<script.*?</script>", " ", page, flags=re.S)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t))


def run(data: dict, verd: dict, page: str) -> None:
    V = verd["verdicts"]
    pairs = {p["id"]: p for p in data["adjudication"]["pairs"]}
    cells = data["cells"]
    N = data["n_works"]
    txt = text_of(page)

    def says(s: str, why: str) -> None:
        check(s in txt, f"page does not say {s!r} ({why})")

    # ---------------------------------------------------------- the record
    check(len(pairs) == data["adjudication"]["n_pairs"], "pair count disagrees with itself")
    check(set(pairs) == set(V), "every adjudicable pair has exactly one verdict")
    check(set(data["adjudication"]["reading_order"]) == set(pairs),
          "the reading order covers exactly the adjudicable pairs")
    check(len(data["adjudication"]["reading_order"]) == len(pairs),
          "the reading order has no repeats")
    for pid, v in V.items():
        check(v["v"] in VERDICTS, f"{pid}: verdict {v.get('v')!r} is not in the scheme")
        check(bool(v.get("note")), f"{pid}: verdict carries no note")
    for pid in verd["blind"]["prior_seen"]:
        check(pid in pairs, f"prior-seen id {pid} is not in the set")

    # every pair is a pair of distinct works, and carries the two quoted fields
    for pid, p in pairs.items():
        check(p["i"] != p["j"], f"{pid}: a work paired with itself")
        check(bool(p["a"]["field"]) and bool(p["b"]["field"]),
              f"{pid}: a side without its quoted field")
        check(bool(p["cells"]), f"{pid}: in no cell's top forty")
        for k, c in p["cells"].items():
            check(k in ORDER, f"{pid}: unknown cell {k}")
            check(1 <= c["rank"] <= 40, f"{pid}/{k}: rank outside the top forty")
            check(0.0 < c["score"] <= 1.0000001, f"{pid}/{k}: cosine out of range")
            check(c["n_shared"] >= 1, f"{pid}/{k}: ranked with no shared token")
            tot = sum(x for _w, x in c["carried_by"])
            check(tot <= c["score"] + 1e-6,
                  f"{pid}/{k}: named contributions exceed the score")
            check(abs(c["top_share"] - c["carried_by"][0][1] / c["score"]) < 1e-4,
                  f"{pid}/{k}: top_share does not match its own contributions")

    # ------------------------------------------------------------ the census
    census = data["census"]["counts"]
    check(sum(census.values()) == N, "the census does not sum to the corpus")
    act_as_move = census.get("finite verb", 0) + census.get("participle", 0)
    not_as_move = N - act_as_move
    says(f"{act_as_move} in {N}", "the census headline")
    says(f"{not_as_move} of {N}", "the count of fields not opening with an act")
    says(f"{act_as_move / N:.1%}", "the census share")
    check(act_as_move < N // 2, "the census claim only stands if a minority open with an act")

    # ------------------------------------------------------------- the cells
    for c in ORDER:
        cc = cells[c]
        check(cc["n_surrogates"] == 200 * N,
              f"cell {c}: surrogate count is not 200 per work")
        check(0.0 <= cc["null_median"] <= 1.0 and 0.0 <= cc["observed_median"] <= 1.0,
              f"cell {c}: a median outside [0,1]")
        check(cc["null_t99"] >= cc["null_median"], f"cell {c}: the 99th percentile is below the median")
        check(sum(cc["obs_hist"]) == N, f"cell {c}: the observed histogram is not the corpus")
        check(sum(cc["null_hist"]) == cc["n_surrogates"],
              f"cell {c}: the null histogram is not the surrogates")
        st = cc["top_strata"]
        check(st["same artist"] + st["residue both sides"] + st["survives"] == 40,
              f"cell {c}: the top forty does not add up")
        check(st["survives"] == sum(1 for p in pairs.values() if c in p["cells"]),
              f"cell {c}: survivors disagree with the adjudicated set")
        check(cc["doc_length"]["median"] >= 0, f"cell {c}: negative document length")
        says(f"{cc['observed_median']:.4f}", f"cell {c} observed median")
        says(f"{cc['null_median']:.4f}", f"cell {c} null median")
        says(f"{cc['null_t99']:.4f}", f"cell {c} measured cut")

    check(cells["A"]["vocabulary"] == "ALL" and cells["A"]["weighting"] == "IDF",
          "cell A is session 1's measure")
    check(cells["D"]["vocabulary"] == "ACT" and cells["D"]["weighting"] == "TF",
          "cell D is the doubly inverted one")
    check(cells["A"]["vocab_types"] > cells["C"]["vocab_types"],
          "the act vocabulary must be a restriction")
    check(cells["A"]["vocab_types"] == cells["B"]["vocab_types"],
          "A and B differ only in weighting")
    check(cells["C"]["vocab_types"] == cells["D"]["vocab_types"],
          "C and D differ only in weighting")

    # --------------------------------------------------------- the verdicts
    def surv(c: str) -> list[str]:
        return [pid for pid, p in pairs.items() if c in p["cells"]]

    tallies = {}
    for c in ORDER:
        t = {k: 0 for k in VERDICTS}
        for pid in surv(c):
            t[V[pid]["v"]] += 1
        tallies[c] = t
        check(sum(t.values()) == len(surv(c)), f"cell {c}: tally does not sum")
        says(f"{t['same move']} same move", f"cell {c} same-move count in the matrix")

    # the headline: the act measures find no move-level match
    for c in ("B", "C", "D"):
        check(tallies[c]["same move"] == 0,
              f"cell {c}: the page's headline assumes no same-move pair here")

    same_move = [pid for pid in pairs if V[pid]["v"] == "same move"]
    adjacent = [pid for pid in pairs if V[pid]["v"] == "adjacent move"]
    not_a_pair = [pid for pid in pairs if V[pid]["v"] == "not a pair"]
    says(f"Of {len(pairs)} pairs read blind", "the standfirst count")
    says(f"{len(same_move)} is the same move", "the standfirst same-move count")
    says(f"{len(adjacent)} are adjacent", "the standfirst adjacent count")
    says(f"the {len(not_a_pair)} pairs in this set that are not pairs at all",
         "the not-a-pair count beside the one real hit")

    # the one same-move pair, and the single word that carries it
    check(len(same_move) == 1, "the page is written around exactly one same-move pair")
    if len(same_move) == 1:
        p = pairs[same_move[0]]
        check(list(p["cells"]) == ["A"], "the same-move pair survives in exactly one cell")
        cc = p["cells"]["A"]
        check(cc["n_shared"] == 1, "the same-move pair is carried by one token")
        says(f"It is ranked {cc['rank']}nd", "the rank of the same-move pair")
        says(cc["carried_by"][0][0], "the word carrying the same-move pair")

    # the one-word finding
    one_word = sum(1 for c in ORDER for pid in surv(c)
                   if (pairs[pid]["cells"][c]["top_share"] or 0) >= 0.5)
    slots = sum(len(surv(c)) for c in ORDER)
    says(f"{one_word} of {slots} surviving top-forty pairs", "the one-word finding")
    check(one_word / slots > 0.9, "the one-word finding needs to be near-universal to be stated so")
    median_one = sum(
        1 for c in ORDER
        if statistics.median(pairs[pid]["cells"][c]["n_shared"] for pid in surv(c)) == 1
    )
    says(f"in {median_one} of the four measures", "the median-shared-token claim")

    # the residue defect of the inversion
    check(cells["B"]["top_strata"]["residue both sides"] > cells["A"]["top_strata"]["residue both sides"],
          "the page claims recurrence weighting amplifies the residue")
    excess = {c: cells[c]["observed_median"] / cells[c]["null_median"] - 1 for c in ORDER}
    check(excess["B"] == max(excess.values()),
          "the page claims cell B is the only one clearly above its null")
    check(excess["C"] < 0 and excess["D"] < 0,
          "the page claims the act cells fall below their own null")
    for c in ORDER:
        says(f"{excess[c]:+.1%}", f"cell {c} excess over its null in the matrix")

    # ----------------------------------------------------- the act lexicon
    al = data["act_lexicon"]
    check(len(al["lexicon"]) == al["act_types"], "the lexicon does not match its own count")
    check(al["act_types"] < data["tokenisation"]["types"], "the act lexicon is a restriction")
    check(sorted(al["lexicon"]) == al["lexicon"], "the lexicon is published sorted")
    for w in ("image", "model"):
        check(w in al["lexicon"], f"the page names {w!r} as wrongly admitted")
    for w in ("extraction", "surveillance"):
        check(w not in al["lexicon"], f"the page names {w!r} as wrongly refused")
    says(f"{al['act_types']:,} act types", "the lexicon size")
    says(f"{al['act_token_share']:.1%}", "the lexicon's share of token instances")

    # --------------------------------------------------------- the manifest
    m = data["manifest"]
    check(len(m["sha256"]) == 64, "the feed is pinned by a full sha256")
    check(m["origin"].startswith("https://"), "the feed was read over the network, not from disk")
    check(m["count_declared"] == N, "the feed's own count agrees with what was measured")
    says(m["sha256"], "the full feed hash in the method note")

    # ------------------------------------------------------------ the page
    check("<script" in page, "the page carries its switch")
    check(re.search(r'src\s*=\s*"https?://', page) is None, "no external script or image")
    check(re.search(r"<link[^>]+href", page) is None, "no external stylesheet")
    check("fetch(" not in page and "XMLHttpRequest" not in page, "the page makes no request")
    check(page.count('class="cell"') == 4, "all four cells are written into the document")
    check('id="nojs"' in page, "the no-JavaScript floor is stated in the document")
    check(page.count("<table") == 4, "all four rankings are in the static document")
    for c in ORDER:
        check(f'id="cell-{c}"' in page, f"cell {c} is in the document")
    # every adjudicated pair appears with its verdict somewhere in the static page
    for pid, p in pairs.items():
        check(html.escape(p["a"]["title"], quote=True) in page,
              f"{pid}: one side is missing from the page")
    # the reach-outside citation, in full
    for frag in ("Propp", "Morphology of the Folktale", "1968", "structural folkloristics"):
        says(frag, "the reach-outside citation")


def main() -> int:
    global FAILS, N_CHECKS
    data = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    verd = json.loads((HERE / "verdicts.json").read_text(encoding="utf-8"))
    page = (HERE / "index.html").read_text(encoding="utf-8")

    run(data, verd, page)
    print(f"{N_CHECKS} checks, {len(FAILS)} failed")
    for f in FAILS:
        print(f"  FAIL: {f}")

    if "--demo" in sys.argv:
        print("\n--demo: moving one value in the derived record by one part in a thousand")
        keep, FAILS, N_CHECKS = list(FAILS), [], 0
        bad = copy.deepcopy(data)
        bad["cells"]["A"]["observed_median"] = round(
            bad["cells"]["A"]["observed_median"] + 0.0001, 6
        )
        run(bad, verd, page)
        print(f"  {N_CHECKS} checks, {len(FAILS)} failed — "
              f"{'caught' if FAILS else 'NOT CAUGHT, which is a defect in this file'}")
        for f in FAILS[:3]:
            print(f"    {f}")
        FAILS = keep

    return 1 if FAILS else 0


if __name__ == "__main__":
    raise SystemExit(main())
