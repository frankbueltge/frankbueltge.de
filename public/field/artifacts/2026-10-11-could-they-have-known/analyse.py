"""Study 9 (session 194): could the keepers have known? Splits study 7's omissions into
structural (near-account not yet public at the list year) and chosen. Run: python3 -I analyse.py"""
import json, os, random, itertools

HERE = os.path.dirname(os.path.abspath(__file__))
EVENTS = os.path.join(HERE, "..", "2026-10-10-who-keeps-the-close-calls", "data", "events.json")
KEEPERS = ["PH", "CH", "FLI", "WP"]
YEAR = {"PH": 1998, "CH": 2014, "FLI": 2016, "WP": 2026}


def load():
    ev = {e["event"]: e for e in json.load(open(EVENTS)) if e["in_window"]}
    lines = open(os.path.join(HERE, "data", "disclosure.tsv")).read().splitlines()
    head = lines[0].split("\t")
    disc = {}
    for ln in lines[1:]:
        r = dict(zip(head, ln.split("\t")))
        disc[r["event"]] = r
    return ev, disc


def available(nm_year, k, same_year_ok=True):
    return nm_year < YEAR[k] or (same_year_ok and nm_year == YEAR[k])


def dice(a, b):
    return 2 * len(a & b) / (len(a) + len(b)) if (a or b) else float("nan")


def mean_dice(ids, keepers_of, nm, adjusted, same_year_ok=True):
    vals = []
    for x, y in itertools.combinations(KEEPERS, 2):
        pool = [i for i in ids if not adjusted or
                (available(nm[i], x, same_year_ok) and available(nm[i], y, same_year_ok))]
        a = {i for i in pool if x in keepers_of[i]}
        b = {i for i in pool if y in keepers_of[i]}
        if a or b:
            vals.append(dice(a, b))
    return sum(vals) / len(vals)


def spearman(x, y):
    def ranks(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(v):
            j = i
            while j + 1 < len(v) and v[order[j + 1]] == v[order[i]]:
                j += 1
            for t in range(i, j + 1):
                r[order[t]] = (i + j) / 2 + 1
            i = j + 1
        return r
    rx, ry = ranks(x), ranks(y)
    mx, my = sum(rx) / len(rx), sum(ry) / len(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** 0.5
    return num / den


def omissions(ids, keepers_of, nm, same_year_ok=True):
    out = {"structural": 0, "chosen": 0, "by_keeper": {}}
    for k in KEEPERS:
        s = c = 0
        for i in ids:
            if k in keepers_of[i]:
                continue
            if available(nm[i], k, same_year_ok):
                c += 1
            else:
                s += 1
        out["by_keeper"][k] = {"structural": s, "chosen": c}
        out["structural"] += s
        out["chosen"] += c
    tot = out["structural"] + out["chosen"]
    out["total"] = tot
    out["structural_share"] = round(out["structural"] / tot, 4)
    return out


def analyse(ids, keepers_of, nm, rng, same_year_ok=True, boot=True):
    res = {"n_events": len(ids)}
    res["omissions"] = omissions(ids, keepers_of, nm, same_year_ok)
    un = mean_dice(ids, keepers_of, nm, False)
    ad = mean_dice(ids, keepers_of, nm, True, same_year_ok)
    res["dice_unadjusted"], res["dice_adjusted"], res["dice_gain"] = round(un, 4), round(ad, 4), round(ad - un, 4)
    pairs = {}
    for x, y in itertools.combinations(KEEPERS, 2):
        pool = [i for i in ids if available(nm[i], x, same_year_ok) and available(nm[i], y, same_year_ok)]
        a = {i for i in pool if x in keepers_of[i]}
        b = {i for i in pool if y in keepers_of[i]}
        a0 = {i for i in ids if x in keepers_of[i]}
        b0 = {i for i in ids if y in keepers_of[i]}
        pairs[f"{x}-{y}"] = {"unadjusted": round(dice(a0, b0), 4), "adjusted": round(dice(a, b), 4),
                              "events_available_to_both": len(pool)}
    res["pairs"] = pairs
    if boot:
        g, u, a = [], [], []
        for _ in range(2000):
            s = [rng.choice(ids) for _ in ids]
            # resampled ids may repeat; tag duplicates so sets keep them
            tagged = [f"{i}#{n}" for n, i in enumerate(s)]
            ko = {t: keepers_of[t.split("#")[0]] for t in tagged}
            nmo = {t: nm[t.split("#")[0]] for t in tagged}
            uu = mean_dice(tagged, ko, nmo, False)
            aa = mean_dice(tagged, ko, nmo, True, same_year_ok)
            u.append(uu); a.append(aa); g.append(aa - uu)
        q = lambda v: [round(sorted(v)[int(0.025 * len(v))], 4), round(sorted(v)[int(0.975 * len(v)) - 1], 4)]
        res["dice_unadjusted_ci95"], res["dice_adjusted_ci95"], res["dice_gain_ci95"] = q(u), q(a), q(g)
    return res


def main():
    ev, disc = load()
    assert set(ev) == set(disc), "event sets differ between study 7 and the Studio's file"
    keepers_of = {i: set(e["keepers"]) for i, e in ev.items()}
    mismatch = [i for i in ev if set(disc[i]["keepers_studio"].split(",")) != keepers_of[i]]
    checked = sorted(i for i in ev if disc[i]["ok"] == "True")
    nm = {i: int(disc[i]["nm_date"][:4]) for i in ev if disc[i]["nm_date"]}
    rng = random.Random(194)

    out = {"inputs": {"events_in_window": len(ev), "checked": len(checked),
                      "keeper_sets_differing_from_studio_copy": mismatch, "list_years": YEAR}}
    out["primary"] = analyse(checked, keepers_of, nm, rng)
    out["sensitivity_same_year_unavailable"] = analyse(checked, keepers_of, nm, rng, same_year_ok=False, boot=False)
    dated_all = sorted(i for i in ev if i in nm)
    out["sensitivity_all_dated_incl_unchecked"] = analyse(dated_all, keepers_of, nm, rng, boot=False)

    # listings before the account: keeper lists an event whose checked near-account is later
    out["listed_before_account"] = [
        {"event": i, "keeper": k, "keeper_year": YEAR[k], "nm_date": disc[i]["nm_date"]}
        for i in checked for k in sorted(keepers_of[i]) if nm[i] > YEAR[k]]
    out["structural_omissions"] = [
        {"event": i, "keeper": k, "nm_date": disc[i]["nm_date"], "label": ev[i]["labels"]}
        for i in checked for k in KEEPERS if k not in keepers_of[i] and not available(nm[i], k)]

    xs = [nm[i] for i in checked]
    ys = [len(keepers_of[i]) for i in checked]
    rho = spearman(xs, ys)
    brho = []
    for _ in range(2000):
        s = [rng.randrange(len(xs)) for _ in xs]
        try:
            brho.append(spearman([xs[j] for j in s], [ys[j] for j in s]))
        except ZeroDivisionError:
            pass
    brho.sort()
    out["spearman_nm_year_vs_keepers"] = {"rho": round(rho, 4), "ci95": [round(brho[int(0.025 * len(brho))], 4),
                                          round(brho[int(0.975 * len(brho)) - 1], 4)], "n": len(xs)}

    ph = [i for i in checked if "PH" in keepers_of[i]]
    ph_9098 = [i for i in ph if 1990 <= nm[i] <= 1998]
    wp_om = [i for i in checked if "WP" not in keepers_of[i]]
    p = out["primary"]
    out["predictions"] = {
        "P1": {"bar": "structural share of omissions < 15 %", "value": p["omissions"]["structural_share"],
               "verdict": "held" if p["omissions"]["structural_share"] < 0.15 else "failed", "blind": False},
        "P2": {"bar": "adjusted minus unadjusted mean Dice < 0.10", "value": p["dice_gain"],
               "verdict": "held" if p["dice_gain"] < 0.10 else "failed", "blind": True},
        "P3": {"bar": "Spearman rho(near-account year, keepers) <= -0.20", "value": out["spearman_nm_year_vs_keepers"]["rho"],
               "verdict": "held" if rho <= -0.20 else "failed", "blind": True},
        "P4": {"bar": ">= half of Phillips' checked events have near-account 1990-1998",
               "value": f"{len(ph_9098)} of {len(ph)}", "verdict": "held" if 2 * len(ph_9098) >= len(ph) else "failed",
               "blind": False},
        "P5": {"bar": "Wikipedia omits >= 40 % of checked events", "value": f"{len(wp_om)} of {len(checked)}",
               "verdict": "held" if len(wp_om) >= 0.4 * len(checked) else "failed", "blind": True},
    }
    # per-event table for the page
    out["events"] = [{"event": i, "label": next(iter(ev[i]["labels"].values())), "year": ev[i]["year"],
                      "nm_date": disc[i]["nm_date"], "nm_source": disc[i]["nm_source"], "nm_url": disc[i]["nm_url"],
                      "checked": disc[i]["ok"] == "True", "keepers": sorted(keepers_of[i])}
                     for i in sorted(ev, key=lambda i: (ev[i]["year"], i))]
    json.dump(out, open(os.path.join(HERE, "data", "results.json"), "w"), indent=1)
    for k in ("inputs", "predictions", "spearman_nm_year_vs_keepers", "listed_before_account", "structural_omissions"):
        print(k, json.dumps(out[k], indent=0)[:1500])
    for k in ("primary", "sensitivity_same_year_unavailable", "sensitivity_all_dated_incl_unchecked"):
        print(k, json.dumps(out[k])[:1500])


if __name__ == "__main__":
    main()
