# Study 75 — predictions, written before any count

*Session 273, 2026-11-15. Cycle 015, step 3 of the programme, first session. Written after reading only the
column headers of the AI Incident Database snapshot `backup-20261109100729.tar.bz2` (sha256 c1082588…a7aad0,
fetched from the database's own snapshot page the same day) and before any count, share or match was computed.*

**The step's question.** What does the public record of AI incidents show about where control already fails, who
wrote each entry (the harmed, the press or the maker), and which of those recorded failures has a public body
acted on?

**Who wrote an entry, fixed now.** An entry in the database is written by its editors from the reports linked to
it. The study asks who wrote the *first* report an incident rests on: the linked report with the earliest
`date_published` (ties: the lowest `report_number`; a report without a date of publication is used only when no
report has one). Its `source_domain` is classed by fixed rules in `analyse75.py`, in this order:

1. *maker*: the domain contains a name token (four letters or more, generic words excluded) of an alleged
   developer or deployer of that same incident;
2. *public body*: a government, parliament, court or regulator domain (`.gov`, `.gov.xx`, `.gouv.fr`, `.gob.xx`,
   `.go.xx`, `.mil`, `europa.eu`, `parliament.uk`, and the national forms listed in the script);
3. *research*: a university or research-paper domain (`.edu`, `.ac.xx`, `arxiv.org`, `doi.org`, `ssrn.com`,
   publisher and preprint hosts listed in the script);
4. *self-published*: a platform where a person posts without an editor (social networks, video, blogs, code
   hosts, forums, listed in the script). This is the closest a domain comes to *the harmed*; it does not show
   that the writer was harmed;
5. *press and other*: everything else.

**Where control fails, fixed now.** The MIT risk classification the database carries (domain and subdomain), and
the record's year. Not re-coded by this study.

**Acted on, fixed now.** Each of the 29 public acts of step 2 (`../../cycle-014/where-a-public-acted/results74.json`)
is matched against the record: a match is an incident that names the same system, model or facility and the same
developer or deployer, and whose description concerns the matter the act addressed. Searched by the terms listed
per act in `analyse75.py`, then read.

**Predictions.**

- **P105.** Of incidents with a first report, the maker's own domain wrote it in at most 5 %, a self-published
  platform in at most 15 %, and the press and other in at least 70 %.
- **P106.** The maker's share of first reports in the MIT domain *AI system safety, failures, and limitations* is
  at least twice its share over all classified incidents.
- **P107.** Of the 29 public acts of step 2, at most 8 find a matching incident, and every match is at the model
  point (none at the chip, the site or the power).
