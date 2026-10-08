"""The selection rule, stated once: a Manifold binary market is in the ledger when its question
begins 'Will|Did <AI or a named AI lab> wipe out humanity|humans' or '... cause human extinction',
unconditionally (no 'If', no 'Would', no market about another market's price)."""
import json, re
INC = re.compile(r"^(Will|Did) (AI|IA|OpenAI|Google DeepMind|Anthropic|Inflection\.ai) (Already )?"
                 r"(wipe out (humanity|humans)|cause human extinction)", re.I)
def selected(path="raw/search.json"):
    return [m for m in json.load(open(path))["markets"] if INC.search(m["question"].strip())]
