"""Reading 93: the paper's related work. Each abstract page is fetched directly from arXiv, hashed as fetched, and
every passage below is found again, whitespace and markup aside, in the page's abstract. No paper is committed.

Usage: python3 literature93.py <dir holding <id>.html as fetched>
Writes literature93.json beside this script.
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
                  "the roles of mandatory reporting thresholds and voluntary reporting channels"],
     "use": "A design framework drawn from nine safety-critical industries, before most instruments read here were in force. This study measures several of its dimensions on the eleven instruments as written and in their first year: who submits and who receives, what triggers a report, whether the content reaches the public, and adds two the framework does not name: whether the record says a machine or a person acted, and whether a stranger can read it without the developer."},
    {"id": "2609.24515v1",
     "cite": "Pustozerova, A., Bagdasarian, E., Beurer-Kellner, L., et al. (2026). Beyond Predictable Paths: Redefining AI Security Incident Reporting for Agents. arXiv:2609.24515.",
     "passages": ["Potential reporting elements include, for example, agent memory and memory accesses, actual and potential levels of autonomy, and tool usage."],
     "use": "Experts list what a report on an agent should hold, autonomy among it. This study counts what the instruments ask: 2 of 51 signals require a record of whether a machine or a person acted, and neither reaches the public."},
    {"id": "2610.25241v1",
     "cite": "Uuk, R., Koivula, S., Pacchiardi, L., Gipiškis, R., Caroli, L., & Horton, K. (2026). Assessing the Empirical Evidence for Loss of Control from Agentic General-Purpose AI. arXiv:2610.25241.",
     "passages": ["the current body of evidence supports a judgment of loss of control as \"weakly plausible.\"",
                  "as AI capabilities advance rapidly, empirical assessments may systematically lag behind the capability frontier"],
     "use": "Weighs nineteen studies, mostly constructed tests. The two cases dated here are field events reported as machines acting on their own; this study does not judge whether they were, and shows instead how such an event reached the public: through the harmed party and outside researchers, days to months later, not through any signal set up for it."},
    {"id": "2607.03542v1",
     "cite": "Mehta, P. (2026). Macro-Prudential AI Governance: A Two-Layer Early Warning and Response System for Frontier AI. arXiv:2607.03542.",
     "passages": ["discovering a risk is not tantamount to acting on it",
                  "through a government clearinghouse to domain-specific defender working groups"],
     "use": "Proposes routing early warnings from internal frontier systems to a government clearinghouse. Of the 19 event signals of the instruments read here, 11 already go to a public body, which publishes none of them in full (6 not at all, 5 as a yearly aggregate); and the maker's own account of the escape shows two alerts on its agents' conduct before they reached the internet, the second three days before, with the evaluations resumed the day before: discovering was not acting, inside the firm."},
    {"id": "2611.04278v1",
     "cite": "Saeri, A. K., Graham, J., Noetel, M., Slattery, P., Zhao, K., Zhang, E., Howard, E., & Thompson, N. (2026). Unmitigated? How are the world's largest companies responding to AI risks? arXiv:2611.04278.",
     "passages": ["We investigated what outsiders can observe: whether companies publicly acknowledge AI risks.",
                  "General-purpose AI developers acknowledged AI misalignment (15%) far less often than discrimination (85%)."],
     "use": "Measures what outsiders can observe of companies' risk acknowledgements. This study measures what outsiders can observe of the signals instruments set up: of 42 due, at least 9 have left a public trace; the 6 whose text requires publication stand where their senders or the G7's portal put them, and the 3 whose text keeps them from the public surfaced because a sender, a body or a third party chose to tell."},
]


def abstract(page):
    m = re.search(r'<blockquote class="abstract mathjax">(.*?)</blockquote>', page, re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))).strip()


def main(d):
    out = []
    for s in SOURCES:
        raw = (Path(d) / f"{s['id']}.html").read_bytes()
        ab = abstract(raw.decode("utf-8"))
        found = [re.sub(r"\s+", " ", p) in ab for p in s["passages"]]
        assert all(found), (s["id"], found)
        out.append({"url": f"https://arxiv.org/abs/{s['id']}", "fetched": "2026-11-24", "http": 200,
                    "sha256": hashlib.sha256(raw).hexdigest(), "cite": s["cite"], "passages": s["passages"],
                    "use": s["use"]})
    doc = {"reading": 93, "note": "Read for the paper's related work: each abstract page fetched directly on 2026-11-24 "
           "and hashed as fetched; every passage found again, whitespace aside, in the page's abstract. Short "
           "quotations with source; no paper is committed.", "sources": out}
    (HERE / "literature93.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    print(len(out), "sources, every passage found")


if __name__ == "__main__":
    main(sys.argv[1])
