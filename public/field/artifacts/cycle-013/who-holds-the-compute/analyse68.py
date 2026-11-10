"""Study 68: can a filing tie a share of a holder's compute to its own models?

Fetches the three filings named in PREDICTIONS68.md from the US securities regulator's archive,
hashes them, flattens them to text, and checks that every passage this study relies on stands in
the text as fetched. Writes results68.json. Standard library only.

Usage: python3 analyse68.py [cache_dir]
"""
import hashlib, html, json, os, re, sys, urllib.request

UA = "field-research study (research use) meridian@field-research.invalid"
DOCS = {
    "GOOG-10K-2025": ("Alphabet Inc. Form 10-K for fiscal 2025, filed 2026-02-05",
                      "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm"),
    "META-10K-2025": ("Meta Platforms, Inc. Form 10-K for fiscal 2025, filed 2026-01-29",
                      "https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm"),
    "SPACEX-S1": ("SpaceX registration statement (Form S-1), filed 2026-05-20",
                  "https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm"),
}
# Each passage: (doc, kind, text). kind: qual = qualitative tie to own models; num = a number; lever = control.
PASSAGES = [
    ("GOOG-10K-2025", "qual", "as we scale our technical infrastructure, in particular for AI, to meet the demand of our users and enterprise customers and to support research internally"),
    ("GOOG-10K-2025", "qual", "To meet the compute capacity demands of AI training and inference, as well as traditional cloud computing services, we are entering into significant leasing arrangements with third party operators"),
    ("GOOG-10K-2025", "qual", "Our technical infrastructure allows us to use and offer our customers a range of AI accelerator options"),
    ("META-10K-2025", "qual", "especially with the deployment of AI technologies, we will need an increasing amount of technical infrastructure, including network capacity, computing power, and related energy requirements, to continue to satisfy our needs"),
    ("META-10K-2025", "num", "We also have $131.05 billion of contractual commitments as of December 31, 2025, mostly related to third-party cloud capacity arrangements and our continued investments in servers and network infrastructure, data centers, and consumer hardware products in Reality Labs"),
    ("SPACEX-S1", "num", "Our AI compute facilities, COLOSSUS and COLOSSUS II, collectively provide approximately 1.0 gigawatt of compute power"),
    ("SPACEX-S1", "qual", "We have the ability to use compute resources to support our proprietary AI applications (such as Grok 5, which is currently being trained at COLOSSUS II), while also providing access to select compute capacity to third-party customers."),
    ("SPACEX-S1", "num", "with respect to access to compute capacity across COLOSSUS and COLOSSUS II. Pursuant to these agreements, the customer has agreed to pay us $1.25 billion per month through May 2029"),
    ("SPACEX-S1", "lever", "This structure allows us to monetize unused compute capacity in our infrastructure, while still permitting reallocation of the capacity for our own internal initiatives if needed in the future."),
    ("SPACEX-S1", "qual", "We have sufficient capacity to provide compute for our own AI models, including support of our training and inference demands, and to satisfy the obligations under these agreements."),
    ("SPACEX-S1", "num", "Under the compute agreement, we will provide Cursor with certain GPU cluster compute capacity"),
]
# Anthropic's own page (study 66, row A15) for the bound by subtraction.
A15 = ("https://www.anthropic.com/news/higher-limits-spacex",
       "We’ve signed an agreement with SpaceX to use all of the compute capacity at their Colossus 1 data center. This gives us access to more than 300 megawatts of new capacity (over 220,000 NVIDIA GPUs)")


def text_of(raw):
    t = re.sub(r"<[^>]+>", " ", raw.decode("utf-8", "replace"))
    return re.sub(r"\s+", " ", html.unescape(t))


def norm(s):
    return re.sub(r"\s+", " ", s.replace("’", "'").replace("‑", "-")).strip()


def main(cache):
    os.makedirs(cache, exist_ok=True)
    docs, texts = {}, {}
    for k, (what, url) in DOCS.items():
        p = os.path.join(cache, k + ".htm")
        if not os.path.exists(p):
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r, open(p, "wb") as f:
                f.write(r.read())
        raw = open(p, "rb").read()
        docs[k] = {"what": what, "url": url, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        texts[k] = norm(text_of(raw))
    found = []
    for d, kind, q in PASSAGES:
        ok = norm(q) in texts[d]
        found.append({"doc": d, "kind": kind, "quote": q, "found": ok})
    missing = [f for f in found if not f["found"]]
    gw_total, mw_anthropic_floor = 1.0, 0.300
    res = {
        "documents": docs,
        "passages": found,
        "missing": len(missing),
        "numbers_for_own_models": {d: [f["quote"] for f in found if f["doc"] == d and f["kind"] == "num"
                                       and "own" in f["quote"]] for d in DOCS},
        "xai_bound": {
            "total_gw_s1": gw_total,
            "anthropic_floor_gw_page": mw_anthropic_floor,
            "xai_keeps_at_most_share_of_power": round(1 - mw_anthropic_floor / gw_total, 2),
            "note": "estimate by subtraction across two documents: power, not chips; the S-1 says Anthropic's capacity runs "
                    "across COLOSSUS and COLOSSUS II, so the part xAI keeps is lower still, by an amount no text states; "
                    "Cursor's capacity is not stated",
            "a15_page": {"url": A15[0], "quote": A15[1]},
        },
        "predictions": [
            {"id": "P73", "text": "Neither Alphabet's nor Meta's annual report ties a share of its compute to its own models in a number.",
             "held": True, "result": "neither: Alphabet speaks of capital expenditure and leasing for AI training and inference and to support research internally; Meta's one number ($131.05 bn of commitments) mixes third-party cloud capacity with servers, data centres and headsets"},
            {"id": "P74", "text": "Both annual reports state in words that their infrastructure serves their own AI models.",
             "held": True, "result": "held at its edge: Alphabet in words (infrastructure for AI, to support research internally); Meta only that deploying AI needs more computing power to satisfy its needs, never naming its own models' share"},
            {"id": "P75", "text": "The SpaceX statement gives a number for compute committed to a third party but none for xAI's own models.",
             "held": True, "result": "a fee ($1.25 bn a month) for Anthropic and a total (about 1.0 GW), Grok 5 named as training at COLOSSUS II, no number for its own use; and, unpredicted, a second third-party user (Cursor) and Anthropic's capacity stated as across both sites, not Colossus 1 alone"},
            {"id": "P76", "text": "No filing lets a reader divide a holder's stock between its own models and the rest.",
             "held": True, "result": "no; only a bound by subtraction for xAI, in power: at most about 70 % of the 1.0 GW stays with xAI, less by an unstated amount"},
        ],
    }
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results68.json")
    json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
    print("missing passages:", len(missing))
    for m in missing:
        print("  ", m["doc"], m["quote"][:80])
    for k, v in docs.items():
        print(k, v["sha256"])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/study68-cache")
