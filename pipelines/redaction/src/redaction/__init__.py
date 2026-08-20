"""The Redaction — nightly Gegenmessung pipeline.

Measures what is removed from the official public record by diffing Wayback
Machine snapshots of a curated watch-list. Git is the archive.
"""
PIPELINE_VERSION = "0.2.0"
SCHEMA_VERSION = "2"  # v2 (2026-08-15): validity gate + live-checked deletions
SALIENCE_VERSION = "1"
VALIDITY_VERSION = "1"
