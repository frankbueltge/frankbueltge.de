"""Orchestriert eine Forschungssitzung zur Session und serialisiert sie."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass

import httpx

from irrtum.critic import Verdict, adversary, symbolic_check, verdict
from irrtum.methods import pick_method
from irrtum.researcher import MODEL, form_thesis
from irrtum.sift import sift


@dataclass(frozen=True)
class Session:
    date: str
    finding: dict
    thesis: dict
    symbolic_ok: bool
    critic_supported: bool
    critic_text: str
    verdict: Verdict
    model: str


def run_session(series, date_iso: str, *, client: httpx.Client, api_key: str, seed=None) -> Session | None:
    finding = sift(series, seed=seed if seed is not None else int(date_iso.replace("-", "")))
    if finding is None:
        return None
    method = pick_method(date_iso)
    thesis = form_thesis(finding, method, client=client, api_key=api_key)
    sym = symbolic_check(finding, thesis)
    supported, critique = adversary(finding, thesis, client=client, api_key=api_key)
    return Session(
        date=date_iso,
        finding={"pair": list(finding.pair), "r": finding.r, "fdr": finding.fdr, "n": finding.n},
        thesis={"method": thesis.method, "text": thesis.text, "cited_r": thesis.cited_r,
                "reasoning": thesis.reasoning},
        symbolic_ok=sym, critic_supported=supported, critic_text=critique,
        verdict=verdict(sym, supported), model=MODEL,
    )


def session_to_json(s: Session) -> str:
    return json.dumps(asdict(s), ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False) + "\n"
