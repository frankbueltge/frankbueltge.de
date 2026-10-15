# Rejected candidates — the IDs named by search summaries that did not verify at source

Every ID a search summary offered as containing a hidden injection was fetched at the arXiv
source before entering the cohort. Those that did not verify are logged here, dated
2026-09-03. This is the record §5.2 asks for: what was checked and rejected, not just what
survived.

## Named by an LLM search summary, allegedly from Lin's table — all rejected

Lin's paper (arXiv:2507.06185) **does not publish a table of arXiv IDs**, verified at source
(pdf, 2026-09-03). The IDs a search summary attributed to it were an LLM synthesis, not a
citation. Each was fetched at arxiv.org individually.

| arXiv ID | title / topic | outcome |
|---|---|---|
| 2505.11718 | REMOR — Automated Peer Review Generation | **excluded** — legitimate paper on peer-review generation; the string "impactful contributions, methodological rigor, and exceptional novelty" appears in Appendix G within its own table of sample reviews. Excluded under the pre-registered rule for injection-topic papers. |
| 2506.13901 | AudioTrust — trustworthiness of audio LLMs | **rejected** — none of the six pre-registered strings present in v1 HTML at source. |
| 2505.16211 | Alignment Quality Index | **rejected** — none of the six pre-registered strings present in v1 HTML at source. |
| 2505.22998 | (title unknown) | **rejected** — `arxiv.org/html/2505.22998v1` returns HTTP 404; the ID does not resolve. |

## Rejected on primary-source verification

None of the confirmed cohort members were rejected at source; every entry in `cohort.csv` was
verified in v1 HTML at arxiv.org.

## Class not tested

Papers plausibly carrying an injection under a wording outside this session's six strings.
Cost of the pre-registered rule: false negatives against injections that used a different
phrasing. Reported openly as a limit.
