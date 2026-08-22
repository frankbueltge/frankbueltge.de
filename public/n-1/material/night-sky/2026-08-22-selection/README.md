# Selection evidence — the second material (bell 21, record 30)

*2026-08-22. Door tests run during the second material selection
(`nights/30-twenty-first-bell.md`), before any observation data was fetched:
interfaces, listings and terms only — the material's own drawer stayed shut, so
the selection's named unpredictable property (what the sky held during the
practice's sessions) was still unlearned when the selection was committed. The
commit boundary is the evidence: this directory is pushed with the selection,
and the prospect's first data fetch happens only after that push.*

## The material

The open climate archive of the German weather service (Deutscher Wetterdienst,
DWD — Climate Data Center), served at `https://opendata.dwd.de/`: hourly station
observations for Germany, among them cloud cover, for the city whose civil time
dates every layer of this practice's record (Europe/Berlin; entry 01 §3).

## Rights

The archive's own terms file, fetched tonight (committed here as
`Terms_of_use.txt`, verbatim, 143 bytes):

> The Creative Commons BY 4.0 - Licence "CC BY 4.0" apply. For detailed
> information see https://www.dwd.de/copyright — Status: May 2024

Attribution for every observation slice committed from this archive:
**Source: Deutscher Wetterdienst**. The archive's root `README.txt` (committed
here verbatim) confirms access without registration under the DWD's legal
notice.

## Door tests (all session observations; every command re-runnable)

| door | command | result | time (UTC) |
|---|---|---|---|
| archive root | `curl https://opendata.dwd.de/` | 200, 869 B index | transcript mtime 14:49:59Z |
| Crossref (candidate D re-check) | `curl https://api.crossref.org/works?rows=0` | 200 | by 14:50:11Z (batch stamp) |
| Wayback CDX, neutral query (candidate I) | `curl "https://web.archive.org/cdx/search/cdx?url=example.com&limit=1"` | connection reset (curl 35) | by 14:50:11Z (batch stamp) |
| arXiv API, neutral query (candidate H) | `curl "https://export.arxiv.org/api/query?search_query=all:electron&max_results=1"` | 200 | by 14:50:11Z (batch stamp) |
| Wayback CDX, retry | same as above | connection reset (curl 35), second time | by 14:50:38Z (next transcript's mtime) |
| hourly-observations listing | `curl .../observations_germany/climate/hourly/` | 200; 16 parameter directories incl. `cloudiness/` | transcript mtime 14:50:40Z |
| terms of use | `curl .../CDC/Terms_of_use.txt` | 200, CC BY 4.0 | transcript mtime 14:50:56Z |
| archive README | `curl https://opendata.dwd.de/README.txt` | 200 | transcript mtime 14:50:57Z |

Neutral queries only: the Wayback and arXiv doors were tested with material
foreign to any candidate's drawer (`example.com`; a one-result query for
"electron"), record 10's discipline. The cloudiness *listing* (file names and
sizes, no observation content) was read to confirm the recent set exists; no
station observation file was fetched before the selection's push.

## Files

- `Terms_of_use.txt` — verbatim, as served (the one-line license statement).
- `README.txt` — the archive root's README, verbatim.
- `hourly-listing.html` — the hourly-observations directory listing, verbatim.

The transcripts' byte sizes and HTTP codes above are from the fetching session's
curl output; mtimes from the files as written at fetch time (session
observations, marked — any reader re-runs the commands and compares content, not
timestamps).
