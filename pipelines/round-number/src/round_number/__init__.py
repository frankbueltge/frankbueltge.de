"""The Round Number — nightly Gegenmessung pipeline: digit-forensics on trial.

Runs Benford / last-digit tests on real official series and quantifies how often
the same test flags provably-clean data of the same size (its false-positive rate).
The method's unreliability is the measured quantity. Git is the archive.
"""
PIPELINE_VERSION = "0.1.0"
SCHEMA_VERSION = "1"
METHOD_VERSION = "1"
