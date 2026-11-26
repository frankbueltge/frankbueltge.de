#!/usr/bin/env python3
"""RINGBACK: hear every reading back (session 265, 2026-11-26).

Transcribes each voices/<n>.m4a with an open speech recogniser (faster-whisper, base.en, MIT; run here, no service)
and compares its words with what the voice was given to read (the `say` of build_overheard.py, which is the passage
with numbers and abbreviations written out). Writes hear_back.json: per reading, the share of the words it was given
that the recogniser heard, in order. A reading under 0.85 fails. A recogniser can mishear a voice that is right, so a
low share is a reason to listen, not a proof of a fault; the result says which words it missed.

    python3 hear_back.py
"""
import json, os, re, subprocess, sys
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
txt = open(os.path.join(HERE, 'overheard.js'), encoding='utf-8').read()
O = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven',
       '8': 'eight', '9': 'nine'}


ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen ' \
       'seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
ORD = {'one': 'first', 'two': 'second', 'three': 'third', 'five': 'fifth', 'eight': 'eighth', 'nine': 'ninth',
       'twelve': 'twelfth'}


def num2words(n, to='cardinal'):
    if to == 'year':
        return num2words(n // 100) + ' ' + num2words(n % 100)
    if n < 20:
        w = ONES[n]
    elif n < 100:
        w = TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    elif n < 1000:
        w = ONES[n // 100] + ' hundred' + ('' if n % 100 == 0 else ' ' + num2words(n % 100))
    else:
        w = num2words(n // 1000) + ' thousand' + ('' if n % 1000 == 0 else ' ' + num2words(n % 1000))
    if to == 'ordinal':
        last = w.split()[-1]
        o = ORD.get(last) or (last[:-1] + 'ieth' if last.endswith('y') else last + 'th')
        w = ' '.join(w.split()[:-1] + [o])
    return w


def spell(m):
    n, suf = m.group(1), (m.group(2) or '').lower()
    if suf in ('st', 'nd', 'rd', 'th'):
        return num2words(int(n), to='ordinal')
    if len(n) == 4 and n.startswith('20'):
        return num2words(int(n), to='year')
    if len(n) > 1 and n.startswith('0'):
        return ' '.join(n)
    return num2words(int(n))


def words(s):
    # the recogniser writes numerals and runs letters together where the reading spelt them out: both sides are
    # brought to words before they are compared
    s = s.lower().replace('’', "'").replace(',', '')
    s = re.sub(r'open ai', 'openai', s).replace('jfrog', 'j frog')
    s = re.sub(r'\b([a-z]*)(\d{5,})\b', lambda m: m.group(1) + ' ' + ' '.join(m.group(2)), s)
    s = re.sub(r'\b(\d+)(st|nd|rd|th)?\b', spell, s)
    s = s.replace('-', ' ')
    s = re.sub(r'\bsb\b', 's b', s)
    s = re.sub(r'\boes\b', 'o e s', s)
    s = re.sub(r"[^a-z0-9' ]+", ' ', s)
    out = []
    for w in s.split():
        if w.isdigit() and len(w) == 1:
            out.append(NUM[w])
        else:
            out.append(w.strip("'"))
    # a date is heard as "July 6" or read as "July sixth": ordinals count as their numbers
    return [CARD.get(w, w) for w in out if w]


CARD = {num2words(n, to='ordinal').split()[-1]: num2words(n).split()[-1] for n in range(1, 32)}


model = WhisperModel('base.en', device='cpu', compute_type='int8')
# what the voice was given: build_overheard.py's SAY where it wrote something out, else the passage
sys.path.insert(0, HERE)
src = open(os.path.join(HERE, 'build_overheard.py'), encoding='utf-8').read()
ns = {}
exec(compile(src[src.index('SAY = {'):src.index('# What each code means')], 'SAY', 'exec'), ns)
SAY = ns['SAY']
res, fails = [], 0
for e in O['seq']:
    if not e.get('clip'):
        continue
    said = SAY.get((e['door'], e['i']), e['quote'])
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(HERE, e['clip']), '-f', 'f32le', '-ac', '1',
                          '-ar', '16000', '-'], check=True, capture_output=True).stdout
    segs, _ = model.transcribe(np.frombuffer(pcm, dtype=np.float32), language='en', beam_size=5)
    heard = ' '.join(s.text for s in segs).strip()
    a, b = words(said), words(heard)
    sm = SequenceMatcher(None, a, b, autojunk=False)
    got = sum(bl.size for bl in sm.get_matching_blocks())
    share = round(got / max(1, len(a)), 3)
    missed = [a[i] for op, i1, i2, j1, j2 in sm.get_opcodes() if op in ('delete', 'replace') for i in range(i1, i2)]
    ok = share >= 0.85
    fails += not ok
    res.append(dict(n=e['n'], door=e['door'], share=share, ok=ok, heard=heard, missed=missed))
    print(f"{e['n']:02d} {e['door']:8s} {share:.2f} {'ok' if ok else 'LISTEN'} {' '.join(missed)[:80]}")
json.dump(dict(what='Every reading transcribed back with faster-whisper base.en and compared with the words it was given.',
               threshold=0.85, readings=len(res), passed=len(res) - fails, results=res),
          open(os.path.join(HERE, 'hear_back.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(res) - fails, 'of', len(res), 'readings heard back at 0.85 or better')
