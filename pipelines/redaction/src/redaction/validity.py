"""The page-validity gate: does a capture hold a page at all?

A capture is evidence only if something was actually captured. The 2026-08-14
memory-hole audit reproduced the counter-example against the origin code: the
BMWE "Energiewende" dossier reported kind=removal, 270 tokens removed, salience
20 — a first-rate exhibit that was a lie in the archive. The "after" snapshot of
2026-05-28 is 118,410 bytes of WAF challenge HTML from which extraction wins
eight tokens ("Verifying your browser before proceeding... Incident ID: ..."),
archived by Wayback WITH status 200. Nothing was removed; nothing was captured.

So before any diff, a capture must clear four conditions:

  (a) status 200 — a non-200 body is an error page, not a page version;
  (b) the extracted main text reaches MIN_PAGE_TOKENS;
  (c) no challenge/interstitial fingerprint (WAF, bot check, "just a moment");
  (d) it is not predominantly consent/cookie boilerplate or a pure nav pile —
      the BaFin probe passed the salience gate with the Matomo cookie notice
      (69 tokens, salience 14), because consent language carries exactly the
      weighted signals salience looks for.

Everything that fails is `unverifiable`: counted, disclosed, NEVER diffed.
Deterministic and version-pinned (VALIDITY_VERSION) like salience.py and
world/triviality.py — a committed record must stay reproducible.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from redaction import prose

# --- the gate's constants: named, versioned, deterministic -------------------

MIN_PAGE_TOKENS = 40  # below this an "extraction" is an error page or a stub

# Challenge / interstitial fingerprints, lower-cased substrings. Matched against
# the extracted text AND the raw HTML (a WAF wraps its notice in markup the
# extractor may drop). Grown only with an observed capture as evidence.
CHALLENGE_FINGERPRINTS: tuple[str, ...] = (
    "verifying your browser",
    "incident id",
    "attention required",
    "just a moment",
    "checking your browser",
    "enable javascript and cookies to continue",
    "please enable cookies",
    "ddos protection by",
    "request unsuccessful. incapsula",
    "cf-browser-verification",
    "captcha",
)

# Consent / tracking boilerplate markers (EN + DE). A page whose text is mostly
# made of sentences carrying these is a cookie banner, not a page version.
CONSENT_MARKERS: tuple[str, ...] = (
    "cookie",
    "consent",
    "einwilligung",
    "datenschutzeinstellung",
    "privacy settings",
    "privacy preferences",
    "tracking",
    "webtracking",
    "matomo",
    "piwik",
    "etracker",
    "google analytics",
    "opt-out",
    "opt out",
    "akzeptieren",
    "zustimmen",
    "widerrufen",
)
MAX_CONSENT_SHARE = 0.5  # more than half the text is consent talk → boilerplate

# Reasons, one vocabulary for the day record's disclosure block.
VALID = "valid"
NOT_200 = "not_200"
CHALLENGE = "challenge"
TOO_SHORT = "too_short"
BOILERPLATE = "boilerplate"

REASONS = (VALID, NOT_200, CHALLENGE, TOO_SHORT, BOILERPLATE)

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


@dataclass(frozen=True)
class Validity:
    ok: bool
    reason: str
    tokens: int = 0
    detail: str = ""


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENT_SPLIT.split(text.strip()) if s.strip()]


def challenge_marker(*parts: str) -> str | None:
    """The first challenge fingerprint found in any part, or None."""
    for part in parts:
        if not part:
            continue
        low = part.lower()
        for fp in CHALLENGE_FINGERPRINTS:
            if fp in low:
                return fp
    return None


def consent_share(text: str) -> float:
    """Share of tokens sitting in sentences that carry a consent marker."""
    total = 0
    consent = 0
    for sent in _sentences(text):
        n = len(sent.split())
        total += n
        low = sent.lower()
        if any(m in low for m in CONSENT_MARKERS):
            consent += n
    return consent / total if total else 0.0


def check(status: str, html: str, text: str) -> Validity:
    """Verdict for one capture. Pure: status + bytes in, verdict out."""
    tokens = len(text.split())
    if status != "200":
        return Validity(False, NOT_200, tokens, detail=status)
    # Challenge first: it is the honest reason even when the stub is also short.
    marker = challenge_marker(text, html)
    if marker:
        return Validity(False, CHALLENGE, tokens, detail=marker)
    if tokens < MIN_PAGE_TOKENS:
        return Validity(False, TOO_SHORT, tokens, detail=f"{tokens} tokens")
    share = consent_share(text)
    if share > MAX_CONSENT_SHARE:
        return Validity(False, BOILERPLATE, tokens, detail=f"consent share {share:.2f}")
    if not prose.keep_prose(_sentences(text)):
        return Validity(False, BOILERPLATE, tokens, detail="no prose sentence")
    return Validity(True, VALID, tokens)
