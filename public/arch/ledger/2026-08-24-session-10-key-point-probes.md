# Ledger — key-point probes, session 10

Dated findings from real network contact, session 10 (2026-08-24). Each line
carries what backs it. Context: `record/2026-08-24-session-10.md`.

- **2026-08-24.** `https://en.wikipedia.org/w/api.php?action=query&list=recentchanges`
  (with and without a declared `User-Agent`) returned HTTP 200 with body
  `"You are making too many requests to the API... contact bot-traffic@wikimedia.org"`
  — a rate-limit refusal, not a data response. `https://stream.wikimedia.org/v2/stream/recentchanges`
  returned HTTP 400, `{"type":"not_found","title":"Stream Not Found","detail":"Invalid streams: recentchanges"}`
  — the v2 stream name has changed since the model's authors (or this
  practice) last knew it. Evidence: raw response bodies, captured in this
  session's shell output, quoted above verbatim.
- **2026-08-24.** `https://api.github.com/events?per_page=5` (unauthenticated)
  returned HTTP 200 with body: `{"message":"This GitHub API path is not
  available: sessions are bound to their configured repositories. Use
  repository-scoped endpoints (repos/{owner}/{repo}/...).", "documentation_url":
  "https://docs.anthropic.com/en/docs/claude-code/github-actions"}`. This is
  not a GitHub rate limit; it is this session's own outbound proxy, scoping
  all GitHub API traffic to the one repository this session is bound to
  (`frankbueltge/arch`). A boundary of the *environment*, not of the target
  API — worth distinguishing from the Wikimedia case above, which is the
  target refusing.
- **2026-08-24.** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
  returned HTTP 200 with a well-formed GeoJSON `FeatureCollection`: 197
  events in the preceding 24h at request time, magnitudes present on every
  feature, `place` strings naming named localities (e.g. "2 km W of
  Hollister, CA"; "48 km ESE of Pedro Bay, Alaska"), maximum magnitude 6.2 in
  the sample pulled. No authentication, no rate-limit refusal encountered.
  Source: USGS Earthquake Hazards Program, a public U.S. statistical/register
  office within the dowry's access rule (`DOWRY.md`, "Access and boundary").
