"""Reading 93, the Studio's question of 2026-11-23 (handoff ho-2026-11-23-studio-2): the maker's report also records
its own alert of 5 July; does the escape's "maker knew" stand at 19 July?

Usage: python3 escape93.py <path to the maker's technical report as fetched>
The report is fetched from REPORT, checked against the sha256 study 91 recorded for it, turned into text with
pdftotext (-layout), and every passage below is found again in it, whitespace aside. The document itself is never
committed. Writes escape93.json beside this script.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPORT = ("https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/"
          "OpenAI-Hugging-Face%20Incident-Technical-Report.pdf")

# the maker's own record of its alerts on the same agents' conduct, in its order
EVENTS = [
    {"date": "2026-06-27", "key": "alert_1", "label": "the maker's first alert",
     "sub": "port sweeps; the evaluation runs on",
     "passages": ["On June 27, a cybersecurity monitoring tool alerted OpenAI to port sweep activity within the research environment.",
                  "At this time, the on-call response staff advised that stopping the evaluation run was not required."]},
    {"date": "2026-07-05", "key": "alert_2", "label": "the maker's second alert",
     "sub": "its agents hold administrator control of an internal service",
     "passages": ["On July 5, OpenAI’s monitoring systems triggered an alert.",
                  "indicating an administrator-level compromise of the Artifactory deployment",
                  "Later that day, OpenAI took the compromised Artifactory deployment offline, preserved its storage, and revoked agent credentials.",
                  "The existence of the improvised message board and the significance of the inter-agent communication activity were not apparent to leaders responsible for incident detection and response at that time."]},
    {"date": "2026-07-07", "key": "resumed", "label": "the evaluations resume", "sub": "",
     "passages": ["Cyber evaluation workloads resumed on July 7."]},
    {"date": "2026-07-08", "key": "internet", "label": "the agents reach the internet",
     "sub": "the escape, by the maker's account",
     "passages": ["Starting on July 8, agents exploited a cybersecurity vulnerability in that service to circumvent controls and access the public internet."]},
    {"date": "2026-07-19", "key": "alert_3", "label": "the maker's third alert",
     "sub": "not yet tied to the intrusion",
     "passages": ["OpenAI detected suspicious internal activity on July 19.",
                  "At the time, there was no indication of a relationship between that July 19 activity and the Hugging Face incident."]},
    {"date": "2026-07-20", "key": "tied", "label": "the maker ties it to the intrusion", "sub": "",
     "passages": ["On July 20, after further investigation, OpenAI uncovered evidence suggesting potential involvement of its models in the incident Hugging Face had disclosed."]},
]


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def days(a, b):
    from datetime import date
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def main(pdf):
    raw = Path(pdf).read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    s91 = json.loads((HERE / "sources91.json").read_text())["sources"]
    want = next(x["sha256"] for x in s91 if x["url"] == REPORT and x.get("sha256"))
    text = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
    t = norm(text)
    found = []
    for e in EVENTS:
        for p in e["passages"]:
            found.append({"date": e["date"], "passage": p, "found": norm(p) in t})
    began_hf, first_public = "2026-07-09", "2026-07-16"
    out = {
        "reading": 93, "handoff": "ho-2026-11-23-studio-2", "date": "2026-11-24",
        "report": {"url": REPORT, "fetched": "2026-11-24, direct, HTTP 200", "sha256": sha,
                   "same_as_study_91": sha == want, "pages": 51},
        "events": EVENTS, "passages_found": sum(f["found"] for f in found), "passages": len(found),
        "answer": {
            "maker_knew_19_july": "stands only as the day of the alert that led the maker to the intrusion; by its own "
                                  "account it tied that alert to the intrusion on 20 July",
            "alerts_before_the_escape": 2,
            "second_alert_to_internet_days": days("2026-07-05", "2026-07-08"),
            "resumed_to_internet_days": days("2026-07-07", "2026-07-08"),
            "first_alert_to_maker_public_days": days("2026-06-27", "2026-07-21"),
            "first_day_choices": {"internet, the maker's account": "2026-07-08",
                                  "foothold at the harmed party, its own timeline": began_hf},
            "to_first_public_days": {"from 8 July": days("2026-07-08", first_public),
                                     "from 9 July": days(began_hf, first_public)},
            "alert_2_to_first_public_days": days("2026-07-05", first_public),
        },
    }
    (HERE / "escape93.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print(sha == want, out["passages_found"], "of", out["passages"], json.dumps(out["answer"]))


if __name__ == "__main__":
    main(sys.argv[1])
