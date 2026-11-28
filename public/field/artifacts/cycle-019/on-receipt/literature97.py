"""Reading 97: the paper's related work. Each abstract page is fetched directly from arXiv, hashed as fetched, and
every passage below is found again, whitespace and markup aside, in the page's abstract. No paper is committed.

Usage: python3 literature97.py <dir holding <id>.html as fetched>
Writes literature97.json beside this script.
"""
import hashlib
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

SOURCES = [
    {"id": "2511.05914v2",
     "cite": "Wei, K., & Heim, L. (2025). Designing Incident Reporting Systems for Harms from General-Purpose AI. arXiv:2511.05914.",
     "passages": ["actors submitting and receiving reports, type of incidents reported, level of risk materialization, enforcement of reporting, anonymity of reporters, and post-reporting actions",
                  "near miss reporting"],
     "use": "Names post-reporting actions and near-miss reporting among the dimensions of a reporting system's design. This step measures both as they stand in force: of 81 acts after word of the two cases reached 20 doors, 6 were owed by any text; and at the maker's door before the harm, three words of the kind a near-miss scheme would collect set off none of four duties without doubt."},
    {"id": "2607.03542v1",
     "cite": "Mehta, P. (2026). Macro-Prudential AI Governance: A Two-Layer Early Warning and Response System for Frontier AI. arXiv:2607.03542.",
     "passages": ["discovering a risk is not tantamount to acting on it",
                  "These are systems deployed for labs' own internal research, testing, and production workflows, as distinct from externally released products."],
     "use": "Proposes early warning for internal frontier systems. The escape's model was one, an internal research prototype not meant for release: the EU's two texts reach it only through a scope they leave open (the Act excludes models used for research before they are placed on the market), and California's law turns on a compute threshold the maker says its models fall below. Inside the maker, three words came before the harm, and the public record shows none of them reaching a public body before it."},
    {"id": "2607.05163v1",
     "cite": "Sidhu, H. K., Scholefield, R., Annan, N., Hernandez, K., Hou, I. N., Alshaikhi, A., Chin, Z. S., & Gipiškis, R. (2026). Open Problems in AI Incident Governance. arXiv:2607.05163.",
     "passages": ["AI systems may produce failures after deployment that pre-deployment safety assessments do not anticipate.",
                  "there is a lack of consistency within the aspects of definitions, classification, monitoring, and reporting"],
     "use": "Finds definitions and reporting inconsistent across frameworks, and frames incident governance after deployment. This reading takes one case before deployment through four definitions in force: the same word is coded differently by each, and every one of the six cells left in doubt before the harm turns on a term (a breach's seriousness, a model's scope, a risk's materiality) that no text assigns anyone to settle."},
    {"id": "2605.30406v1",
     "cite": "Gruetzemacher, R. (2026). AI Loss of Control Incident Management: Response & Resilience. arXiv:2605.30406.",
     "passages": ["current literature focuses almost exclusively on alignment and prevention",
                  "accidental LOC (requiring automated circuit-breaker responses)"],
     "use": "Sets out how a loss-of-control incident should be managed once it is known. This step asks who is obliged to begin: no public body's act in the two cases was owed by an AI instrument, and the one clock the record shows set on a public body, California's executive order of 18 September, asked for recommendations on the law two months after the harm and was met on the day."},
    {"id": "2606.20610v1",
     "cite": "Bollinger, S., Aboserie, N., Coakley, A., Lee, C.-H., & Mathlouthi, T. (2026). Signals in the Noise: Open Source Intelligence (OSINT) for AI Loss of Control Detection. arXiv:2606.20610.",
     "passages": ["OSINT-based detection of loss of control is partially feasible and worth building now.",
                  "independent of frontier AI developers"],
     "use": "Argues for detection independent of developers. In both cases the public learned of the event from a party other than the maker, and every public body was first seen acting after that; before the harm, the only reader placed to tell whether a law's trigger had been met was the maker itself."},
]


def abstract(page):
    m = re.search(r'<blockquote class="abstract mathjax">(.*?)</blockquote>', page, re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))).strip()


def main(d):
    out = []
    for s in SOURCES:
        raw = (Path(d) / f"{s['id']}.html").read_bytes()
        ab = abstract(raw.decode("utf-8")).replace("’", "'")
        found = [re.sub(r"\s+", " ", p) in ab for p in s["passages"]]
        assert all(found), (s["id"], found)
        out.append({"url": f"https://arxiv.org/abs/{s['id']}", "fetched": "2026-11-28", "http": 200,
                    "sha256": hashlib.sha256(raw).hexdigest(), "cite": s["cite"], "passages": s["passages"],
                    "use": s["use"]})
    doc = {"reading": 97, "note": "Read for the paper's related work: each abstract page fetched directly on 2026-11-28 "
           "and hashed as fetched; every passage found again, whitespace aside, in the page's abstract. Short "
           "quotations with source; no paper is committed.", "sources": out}
    (HERE / "literature97.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    print(len(out), "sources, every passage found")


if __name__ == "__main__":
    main(sys.argv[1])
