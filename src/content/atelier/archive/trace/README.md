# Rotated trace

Where a work-line's `TRACE.md` goes when it passes the floor of §8.

The trace is append-only and one entry per decision. When it grows past the limit the gate
counts, its older half moves here as `<line-id>-<n>.md` and the live file keeps the recent
entries. Nothing is deleted and nothing is rewritten — §8's "corrections preserve the record"
holds for rotation too. What moves here stays in git and stays reachable by
`python tools/memory/cli.py recall`, because `archive/**` is not indexed but this directory's
contents are reached through the line's own record and its journal entries.

This directory exists because the amendment of 2026-08-12 told a line to rotate into it, and a
constitution that points at a directory which does not exist fails silently — the session finds
nothing and reads everything instead. `tools/test_constitution_refs.py` caught exactly that,
on the same night the rule was written.
