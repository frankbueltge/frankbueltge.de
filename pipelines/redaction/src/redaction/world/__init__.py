"""The world chamber — the same gesture at the scale of the world's press.

Chamber 1 (redaction.run) watches a curated watch-list via the Wayback Machine.
This chamber reads GDELT's Global Difference Graph for yesterday's headline
rewrites (the deletion class no longer exists in the GDG — see the spec's
2026-08-14 addendum) and measures deletion in-house: a committed random sample
of the newspool, rechecked ~40 hours later. Git is the archive; receipts are
sample manifests committed before the vanishing.

Spec: docs/superpowers/specs/2026-08-14-editorial-deadline-world-chamber.md
"""
WORLD_SCHEMA_VERSION = "1"
WORLD_PIPELINE_VERSION = "0.1.0"

# The versioned method cores. A change to either is a new version string,
# never a silent edit — archived days keep the version they were built with.
FILTER_VERSION = "v1"
SELECTION_VERSION = "v1"

SAMPLE_SIZE = 300           # mirrors the sealed spike (2026-08-14)
SAMPLE_STEP_MINUTES = 60    # hourly pool sample: 24 files, disclosed in the manifest
REGISTER_BOUND = 3          # vanished-headline restraint, mirrored from chamber 1
