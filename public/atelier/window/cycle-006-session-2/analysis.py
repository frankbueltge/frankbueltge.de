"""Cycle 006, session 2 — the list that keeps no refusals.

Reads a local cache of public pages (not committed; see SOURCES in results.json for URLs and sha256):
  <cache>/src/p1.html .. p14.html      live signatory pages, safe.ai/work/statement-on-ai-extinction-risk?223bcc0a_page=N
  <cache>/wb/<timestamp>.html          Internet Archive copies (id_ raw) of safe.ai/statement-on-ai-risk
  <cache>/turing_wd.json               Wikidata SPARQL: holders of award Q185667 (Turing Award), year, date of death

Writes results.json beside this file. No names of signatories are written except the four Turing laureates found on
the list; everything else is counts, categories and order positions.

Usage: python3 -I analysis.py <cache-dir>
"""
import hashlib, html, json, math, re, sys, unicodedata
from pathlib import Path

CACHE = Path(sys.argv[1])
HERE = Path(__file__).resolve().parent
LIVE_URL = "https://safe.ai/work/statement-on-ai-extinction-risk?223bcc0a_page={}"
WB_URL = "https://web.archive.org/web/{}id_/https://safe.ai/statement-on-ai-risk"
SNAPSHOTS = ["20230527192731", "20230601011313", "20231001075558"]
STATEMENT_DATE = "2023-05-30"  # public release date of the statement (press coverage linked from the page itself)

sources = []


def read(path, url):
    raw = path.read_bytes()
    sources.append({"url": url, "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)})
    return raw.decode("utf-8")


def key(name):
    s = unicodedata.normalize("NFKC", name).replace("\xa0", " ")
    return re.sub(r"\s+", " ", s).strip().lower()


def parse(text):
    """One entry per 'signatory w-dyn-item'; press cards are a different list item class and are skipped."""
    out = []
    for chunk in text.split('class="signatory w-dyn-item"')[1:]:
        chunk = chunk.split('role="listitem"')[0]
        n = re.search(r'text-weight-bold[^"]*">(.*?)</div>', chunk)
        t = re.search(r'fs-[a-z-]*field="[a-z]+">(.*?)</div>', chunk)
        if not n:
            continue
        typ = unicodedata.normalize("NFKC", html.unescape(t.group(1))).replace("\xa0", " ").strip() if t else ""
        out.append({"key": key(html.unescape(n.group(1))), "name": html.unescape(n.group(1)).strip(), "type": typ})
    return out


# --- the four copies of the list -------------------------------------------------------------------------------
copies = {}
for ts in SNAPSHOTS:
    copies[f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}"] = parse(read(CACHE / "wb" / f"{ts}.html", WB_URL.format(ts)))
live = []
for p in range(1, 15):
    live += parse(read(CACHE / "src" / f"p{p}.html", LIVE_URL.format(p)))
copies["2026-10-07"] = live
dates = list(copies)

counts = {}
for d, rows in copies.items():
    c = {"total": len(rows), "distinct": len({r["key"] for r in rows})}
    for r in rows:
        lab = r["type"] or "(no category)"
        c[lab] = c.get(lab, 0) + 1
    counts[d] = c

steps = []
for a, b in zip(dates, dates[1:]):
    A, B = {r["key"] for r in copies[a]}, {r["key"] for r in copies[b]}
    added_types = {}
    for r in copies[b]:
        if r["key"] not in A:
            lab = r["type"] or "(no category)"
            added_types[lab] = added_types.get(lab, 0) + 1
    steps.append({"from": a, "to": b, "kept": len(A & B), "added": len(B - A), "gone": len(A - B),
                  "added_by_category": added_types})

# every name ever seen: first and last copy it appears in, and its category (no name written out)
seen = {}
for i, d in enumerate(dates):
    for pos, r in enumerate(copies[d]):
        e = seen.setdefault(r["key"], {"first": i, "last": i, "type": r["type"], "pos": {}})
        e["last"] = i
        e["pos"][i] = pos
        if r["type"]:
            e["type"] = r["type"]
ever = len(seen)
gone_ever = sum(1 for e in seen.values() if e["last"] < len(dates) - 1)
# dots for the page: ordered by the position a name holds in the latest copy it is in
dots = sorted(seen.values(), key=lambda e: (e["last"] < len(dates) - 1, e["pos"].get(len(dates) - 1, 10**6), e["first"]))
dots_out = [[e["first"], e["last"], 1 if e["type"] == "AI Scientists" else (2 if e["type"] else 0)] for e in dots]

head = {d: [r["key"] for r in copies[d][:20]] for d in dates}
head_identical = all(head[d] == head[dates[0]] for d in dates)
head_shared = len(set.intersection(*[set(h) for h in head.values()]))
first_keys = {r["key"] for r in copies[dates[0]]}
first_still = len(first_keys & {r["key"] for r in live})

# --- the frame: Turing laureates ------------------------------------------------------------------------------
raw = read(CACHE / "turing_wd.json", "https://query.wikidata.org/sparql (award P166 = Q185667, with P585 year, P570 death)")
L = {}
for b in json.loads(raw)["results"]["bindings"]:
    n = b["pLabel"]["value"]
    e = L.setdefault(n, {"years": set(), "dead": b.get("dead", {}).get("value")})
    e["years"].add(int(b["year"]["value"]))
frame = sorted(n for n, e in L.items() if min(e["years"]) <= 2022 and (e["dead"] is None or e["dead"][:10] > STATEMENT_DATE))


def fold(s):
    s = unicodedata.normalize("NFKD", s)
    return re.sub(r"[^a-z ]", "", "".join(c for c in s if not unicodedata.combining(c)).lower()).split()


# surname match, then checked by hand: the four hits below were each read on the live list (one lists itself as
# "Turing Award 2007"; Wikidata's label "Iosif Sifakis" is the same person as the list's "Joseph Sifakis").
SAME_PERSON = {"Geoffrey Hinton": "geoffrey hinton", "Yoshua Bengio": "yoshua bengio",
               "Martin Edward Hellman": "martin hellman", "Iosif Sifakis": "joseph sifakis"}
live_keys = {r["key"] for r in live}
surname_hits = {n: sorted(r["name"] for r in live if fold(r["name"])[-1:] == fold(n)[-1:]) for n in frame}
surname_hits = {n: h for n, h in surname_hits.items() if h}
on_list = sorted(n for n in frame if SAME_PERSON.get(n) in live_keys)
k, N = len(on_list), len(frame)
on_first = sorted(n for n in on_list if SAME_PERSON[n] in first_keys)

# --- the Field's question: a second look at the survey's silent ----------------------------------------------
Z = 1.6448536269514722  # one-sided 95 %
P_RESP, SHARE = 2778 / 18459, 0.38
BREAK = (0.10 - P_RESP * SHARE) / (1 - P_RESP)  # silent share that brings the invited share to 10 % (Field: 0.0504)


def wilson(x, m):
    if m == 0:
        return 0.0, 1.0
    p = x / m
    d = 1 + Z * Z / m
    c = (p + Z * Z / (2 * m)) / d
    h = Z * math.sqrt(p * (1 - p) / m + Z * Z / (4 * m * m)) / d
    return max(0.0, c - h), min(1.0, c + h)


def m_above(r2, p, cap=100000):
    """Smallest m at which the worst-case lower bound (answered and concerned, over m) clears the break-even."""
    if r2 * p <= BREAK:
        return None
    for m in range(5, cap):
        x = round(m * r2 * p)
        if wilson(x, m)[0] > BREAK:
            return m
    return None


def m_below(r2, p, cap=100000):
    """Smallest m at which the worst-case upper bound (concerned share among answerers + all non-answerers) is under it."""
    if r2 * p + (1 - r2) >= BREAK:
        return None
    for m in range(5, cap):
        x = round(m * r2 * p)
        hi = wilson(x, m)[1]
        # upper bound on concerned silent = upper on (answered & concerned) + upper on non-answer share
        nonans_hi = wilson(round(m * (1 - r2)), m)[1]
        if hi + nonans_hi < BREAK:
            return m
    return None


R2 = [0.15, 0.3, 0.5, 0.7, 0.9, 0.95, 0.97, 0.99, 1.0]
PS = [0.0, 0.02, 0.1, 0.2, 0.38]
table = [{"r2": r2, "p": p, "m_to_show_above": m_above(r2, p), "m_to_show_below": m_below(r2, p)} for r2 in R2 for p in PS]
p_needed_at_survey_rate = BREAK / P_RESP  # reached silent must be this concerned for a follow-up at the survey's own rate

# --- predictions ---------------------------------------------------------------------------------------------
late = steps[-1]["added_by_category"]
pred = {
    "P1": late.get("Other Notable Figures", 0) > steps[-1]["added"] / 2,
    "P2": head_identical,
    "P3": first_still / len(first_keys) >= 0.95,
    "P4": all(row["m_to_show_below"] is None for row in table if row["r2"] < 0.95),
    "P5": (m_above(0.5, 0.38) or 10**9) <= 100,
}

out = {
    "statement": "Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war.",
    "statement_public_date": STATEMENT_DATE,
    "copies": dates, "counts": counts, "steps": steps,
    "names_ever_listed": ever, "names_listed_then_absent_today": gone_ever,
    "head20_identical_in_all_copies": head_identical, "head20_shared_by_all_copies": head_shared,
    "first_copy_still_present": [first_still, len(first_keys)],
    "fields_the_list_publishes": ["name", "affiliation as given", "category (AI Scientists / Other Notable Figures)"],
    "fields_it_does_not": ["date of signing", "date of removal", "count of submissions through the form",
                           "who was asked", "who declined", "who disagreed"],
    "frame": {"definition": "Turing Award laureates with an award year up to 2022 and alive on 2023-05-30, as Wikidata records them on 2026-10-07",
              "N": N, "k_on_list_today": k, "on_list_today": on_list, "on_list_in_first_copy": on_first,
              "surname_candidates_checked": len(surname_hits), "surname_candidates_rejected_by_hand": len(surname_hits) - k,
              "share_bounds": [k / N, 1.0], "note": "no field of the list bounds the share from above"},
    "field_question": {"break_even_silent_share": BREAK, "response_rate": P_RESP, "respondent_share": SHARE,
                       "p_needed_at_survey_response_rate": p_needed_at_survey_rate, "table": table},
    "dots": dots_out, "predictions": pred, "sources": sources,
}
(HERE / "results.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(json.dumps({k_: v for k_, v in out.items() if k_ not in ("dots", "sources", "field_question")}, indent=1, ensure_ascii=False))
print("break-even", round(BREAK, 4), "p needed at survey rate", round(p_needed_at_survey_rate, 3))
for row in table:
    print(row)
