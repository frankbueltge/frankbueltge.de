#!/usr/bin/env python3
"""RINGBACK, build (state 1, session 264, 2026-11-25).

Reads the Field's study 94 (receivers94.json) and study 90 (signals90.json) at their commits, the ITU's list of
ringing tones used in national networks (2010), ITU-T E.180 (03/98) and the California 9-1-1 Operations Manual,
chapter I (rev. 03-2023), checks every passage the page will quote against the text of its source, and writes
data.js. No source document is copied into this repository; the downloads go to a cache directory.

    python3 build.py [cache-dir]        (pdftotext must be on the path)
"""
import hashlib, json, os, re, subprocess, sys, urllib.request
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join('/tmp', 'ringback-cache')
os.makedirs(CACHE, exist_ok=True)

FIELD = 'https://raw.githubusercontent.com/frankbueltge/field-research'
SRC = {
    'receivers94': dict(
        url=FIELD + '/3dcd20be555d36c58bebdead061dc7d3dd0c33a2/artifacts/cycle-019/on-receipt/receivers94.json',
        sha256='763b4da72006b7dbfbc17e5141aa1e7e2df6c9ed96a8427439acfa5f7def8698',
        what="The Field's study 94, On Receipt, state 1 (2026-11-25): what each receiver of the 19 event signals owes on "
             "receipt, by when, and what follows for a silent sender or receiver, every code with its passage."),
    'signals90': dict(
        url=FIELD + '/b6fd73a4b4b86b09ab4809957b0dae5758ed440e/artifacts/cycle-018/told-in-time/signals90.json',
        sha256='87a91da00ebc629052fa74ab688c4a064439422ee2757f294b4db07484639d25',
        what="The Field's study 90, Told in Time, state 1 (2026-11-22): the 51 signals with the passage that sets each, "
             "used here for the sender's own duty."),
    'itu_tones': dict(
        url='https://www.itu.int/dms_pub/itu-t/opb/sp/T-SP-E.180-2010-PDF-E.pdf',
        sha256='290c9873331d662545b700e2ef09f1a6182eca7701c5789812578dc136daa2a7',
        what="ITU, Annex to Operational Bulletin No. 955 (1 May 2010): various tones used in national networks, "
             "according to ITU-T E.180; the ringing tone of each receiver's network."),
    'itu_e180': dict(
        url='https://www.itu.int/rec/dologin_pub.asp?id=T-REC-E.180-199803-I!!PDF-E&lang=e&type=items',
        sha256='9ea28a838c1f4da2bb84c1d42a03a9c4fceddfd6a1ea9baeb38570c260a41b0a',
        what="ITU-T Recommendation E.180/Q.35 (03/98), section 5: the recommended limits of a ringing tone."),
    'caloes_911': dict(
        url='https://www.caloes.ca.gov/wp-content/uploads/PSC/Documents/Chapter-I-Standards-update-2023.pdf',
        sha256='db59a5bf65ba7942e2c4cd05ff7b81d679063b81f53b8106097e897ec5b59123',
        what="California Governor's Office of Emergency Services, 9-1-1 Operations Manual, chapter I, Standards "
             "(rev. 03-2023): the call answer time a public safety answering point is held to."),
}


def fetch(key):
    s = SRC[key]
    path = os.path.join(CACHE, key + ('.json' if s['url'].endswith('.json') else '.pdf'))
    if not os.path.exists(path):
        req = urllib.request.Request(s['url'], headers={'User-Agent': 'studio-build/1'})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f:
            f.write(r.read())
    raw = open(path, 'rb').read()
    got = hashlib.sha256(raw).hexdigest()
    if got != s['sha256']:
        sys.exit(f'{key}: sha256 {got} differs from {s["sha256"]}')
    return path, raw


def pdftext(path):
    out = path + '.txt'
    subprocess.run(['pdftotext', '-layout', path, out], check=True)
    return open(out, encoding='utf-8', errors='replace').read()


def norm(t):
    return re.sub(r'\s+', ' ', t.replace('’', "'").replace('≤', '<=')).strip()


def must_contain(text, passage, where):
    if norm(passage) not in norm(text):
        sys.exit(f'passage not found in {where}: {passage!r}')
    return passage


# ---------------------------------------------------------------- the Field's receivers and their senders' passages
_, raw = fetch('receivers94')
R = json.loads(raw)['receivers']
_, raw = fetch('signals90')
S = {s['id']: s for s in json.loads(raw)['signals']}
assert len(R) == 19

# ---------------------------------------------------------------- the ringing tones
p, _ = fetch('itu_tones')
itu = pdftext(p)
p, _ = fetch('itu_e180')
e180 = pdftext(p)


def ringing_line(country):
    lines = itu.splitlines()
    i = next(k for k, l in enumerate(lines) if l.strip() == country)
    for l in lines[i + 1:i + 30]:
        if re.match(r'\s*Ringing tone\b', l):
            return re.sub(r'\s+', ' ', l.strip())
    sys.exit('no ringing tone for ' + country)


# every ringing tone the list gives in the one form "<Hz> <on> on <off> off", to find the commonest
parsed = Counter()
for l in itu.splitlines():
    m = re.match(r'\s*Ringing tone\b.*?-\s+(\S+)\s+(\d+(?:\.\d+)?) on (\d+(?:\.\d+)?) off\s*$', l)
    if m:
        parsed[(m.group(1), m.group(2), m.group(3))] += 1
common, common_n = parsed.most_common(1)[0]
assert common == ('425', '1.0', '4.0'), common

e180_on = must_contain(e180, 'The recommended limits for the tone period (including tolerances) are from 0.67 to 1.5 seconds.', 'E.180')
e180_off = must_contain(e180, 'The recommended limits for the silent period separating two tone periods are 3 to 5 seconds.', 'E.180')
e180_hz = must_contain(e180, 'Administrations adopting a new single frequency ringing tone are recommended to use 425 Hz.', 'E.180')

TONES = {
    'US': dict(network='United States of America', hz=[440, 480], on=2.0, off=4.0,
               line=ringing_line('United States of America'),
               note='The list gives three alternatives; the page plays the last, 440 and 480 Hz together.'),
    'BE': dict(network='Belgium', hz=[425], on=1.0, off=3.0, line=ringing_line('Belgium'), note=None),
    'CN': dict(network="China (People's Republic of)", hz=[450], on=1.0, off=4.0,
               line=ringing_line("China (People's Republic of)"), note=None),
    'XX': dict(network='no seat', hz=[425], on=1.0, off=4.0, line=None,
               note=(f'A receiver the text names by role and not by seat rings in the commonest ringing tone of the '
                     f'list: {common_n} of the {sum(parsed.values())} ringing tones the build reads there in one form '
                     f'are 425 Hz, 1.0 s on and 4.0 s off. It lies inside E.180\'s recommended limits.'),
               e180=[e180_on, e180_off, e180_hz]),
}
for k, t in TONES.items():
    if t['line']:
        assert t['line'].endswith(f"{t['on']} on {t['off']} off"), t['line']
        assert all(str(h) in t['line'] for h in t['hz']), t['line']

# ---------------------------------------------------------------- the 9-1-1 line beside the office
p, _ = fetch('caloes_911')
cal = pdftext(p)
CONTROL = dict(
    id='911', short='9-1-1', name='a public safety answering point in California, under Cal OES\'s 9-1-1 standard',
    tone='US', answer_s=15,
    standard=must_contain(cal, 'Ninety (90%) percent of all 9-1-1 calls arriving at the Public Safety Answering Point '
                               'SHALL be answered within (≤) Fifteen (15) seconds.', 'Cal OES ch. I'),
    standard2=must_contain(cal, 'Ninety-five (95%) of all 9-1-1 calls SHOULD be answered within (≤) twenty (20) seconds.',
                           'Cal OES ch. I'),
    consequence=must_contain(cal, 'PSAP funding from the SETNA by the CA 9-1-1 Branch is contingent upon adherence to the '
                                  'following mandatory standards.', 'Cal OES ch. I'),
    monitor=must_contain(cal, 'The CA 9-1-1 Branch has the responsibility to monitor all emergency communication systems '
                              'related to the delivery of a 9-1-1 call to ensure they comply with these standards.',
                         'Cal OES ch. I'),
    office=must_contain(cal, "Governor's Office of Emergency Services, Public Safety Communications, California 9-1-1 "
                             'Emergency Communications Branch', 'Cal OES ch. I'),
    ref='9-1-1 Operations Manual, chapter I, PSAP standard 2, rev. 03-2023',
    url=SRC['caloes_911']['url'],
)

# ---------------------------------------------------------------- the lines, where they stand and how they ring
# The field: x from west to east by the seat of the instrument, z from far (0) to near (1). Near: the receivers of
# laws; far: those of voluntary texts. One instrument's receivers stand together.
LAYOUT = {
    'CA4': (0.13, 0.80, 'Cal OES', 'US'), 'CA6': (0.19, 0.84, 'Cal OES', 'US'),
    'CA5': (0.08, 0.70, 'an authority', 'US'), 'CA7': (0.24, 0.72, 'Attorney General', 'US'),
    'CA8': (0.28, 0.86, "the developer's own channel", 'XX'),
    'NY4': (0.40, 0.78, 'DFS office', 'US'), 'NY6': (0.45, 0.84, 'DFS office', 'US'),
    'NY5': (0.36, 0.69, 'an authority', 'US'),
    'EU4': (0.62, 0.76, 'AI Office', 'BE'),
    'COP3': (0.58, 0.40, 'AI Office', 'BE'), 'COP5': (0.65, 0.45, 'the signatory', 'XX'),
    'PC3': (0.47, 0.33, 'governments, companies', 'XX'), 'PC4': (0.52, 0.27, 'confidential channels', 'XX'),
    'CN1': (0.80, 0.42, 'developers, institutions', 'CN'), 'CN2': (0.85, 0.34, 'a complaints mechanism', 'CN'),
    'AS1': (0.92, 0.47, 'regulators, users', 'XX'),
    'G7-1': (0.28, 0.40, 'the organisation itself', 'XX'), 'G7-3': (0.34, 0.30, 'others, the public', 'XX'),
    'GPA2': (0.15, 0.36, 'the deploying organisation', 'XX'),
}
CONTROL.update(x=0.165, z=0.93)
SEAT = {'US': 'its seat is in the United States', 'BE': 'its seat is in Brussels', 'CN': 'its receivers sit in China',
        'XX': 'the text names it by role and not by seat'}

ACTS = ['acknowledge', 'investigate', 'order', 'pass_on', 'tell_public', 'tell_public_aggregate']
lines = []
for r in R:
    x, z, short, tone = LAYOUT[r['id']]
    s = S[r['id']]
    acts = {}
    for a in ACTS:
        v = r['acts'][a]
        acts[a] = dict(v=v['v'], deadline_h=v['deadline_h'], deadline_max_h=v['deadline_max_h'], ref=v['ref'],
                       quotes=v['quotes'], note=v['note'], doubt=v['doubt'])
    sf, rf = r['sender_failure'], r['receiver_failure']
    lines.append(dict(
        id=r['id'], short=short, receiver_name=r['receiver_name'], receiver=r['receiver'],
        receiver_party=r['receiver_party'], instrument=r['instrument'], instrument_short=r['instrument_short'],
        binding=r['binding'], what=r['what'], ref=r['ref'], sender=r['sender'], trigger=r['trigger'],
        sender_passage=s['quote'], sender_ref=s['ref'],
        sender_deadline_h=r['sender_deadline_h'], sender_deadline_max_h=r['sender_deadline_max_h'],
        sender_clock=r['sender_clock'],
        sender_failure=dict(v=sf['v'], max=sf.get('max'), who=sf.get('who'), ref=sf.get('ref'), quotes=sf['quotes'],
                            note=sf.get('note')),
        receiver_failure=dict(v=rf['v'], ref=rf.get('ref'), quotes=rf['quotes'], note=rf.get('note')),
        note=r['note'], acts=acts, tone=tone, seat=SEAT[tone], x=x, z=z))

# ---------------------------------------------------------------- what the page counts, from the lines themselves
pub = [l for l in lines if l['receiver'] == 'public body']
must = lambda l, a: l['acts'][a]['v'] == 'duty'
counts = dict(
    lines=len(lines), law=sum(l['binding'] == 'law' for l in lines), voluntary=sum(l['binding'] == 'voluntary' for l in lines),
    public_body=len(pub),
    must_answer=[l['id'] for l in lines if must(l, 'acknowledge')],
    must_answer_public=[l['id'] for l in pub if must(l, 'acknowledge')],
    must_review_public=[l['id'] for l in pub if must(l, 'investigate')],
    may_review_public=[l['id'] for l in pub if l['acts']['investigate']['v'] == 'power'],
    may_order_public=[l['id'] for l in pub if l['acts']['order']['v'] == 'power'],
    must_order_public=[l['id'] for l in pub if must(l, 'order')],
    must_tell_public=[l['id'] for l in lines if must(l, 'tell_public')],
    yearly_total=[l['id'] for l in lines if must(l, 'tell_public_aggregate')],
    clocked_public=[l['id'] for l in pub for a in ACTS if l['acts'][a]['v'] in ('duty', 'power')
                    and isinstance(l['acts'][a]['deadline_h'], (int, float))],
    receiver_failure_named=[l['id'] for l in lines if l['receiver_failure']['v'] == 'named'],
    no_task_public=[l['id'] for l in pub if l['receiver_party'] == 'no'],
    nothing_on_receipt_public=[l['id'] for l in pub if all(l['acts'][a]['v'] == 'none' for a in ACTS)],
    sender_fined=[l['id'] for l in lines if l['sender_failure']['v'] == 'penalty'],
    tones={k: sum(l['tone'] == k for l in lines) for k in TONES},
)
assert counts['must_answer'] == ['CA8'] and counts['must_answer_public'] == [] and counts['clocked_public'] == []
assert counts['sender_fined'] == ['EU4', 'CA4', 'CA5', 'NY4', 'NY5'] and len(counts['yearly_total']) == 5
assert counts['no_task_public'] == ['COP3', 'CA5', 'NY5'] and counts['nothing_on_receipt_public'] == ['COP3', 'CA5', 'PC4', 'NY5']

DATA = dict(
    title='RINGBACK', state=1, date='2026-11-25', session=264,
    sources={k: dict(url=v['url'], sha256=v['sha256'], what=v['what']) for k, v in SRC.items()},
    tones=TONES, control=CONTROL, lines=lines, counts=counts,
    itu_parsed=dict(read=sum(parsed.values()), commonest=list(common), commonest_n=common_n),
)
with open(os.path.join(HERE, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('// RINGBACK, data (written by build.py; do not edit by hand)\n')
    f.write('window.RINGBACK = ' + json.dumps(DATA, ensure_ascii=False, indent=1) + ';\n')
print('lines', len(lines), '| public bodies', len(pub), '| must answer', counts['must_answer'],
      '| yearly', counts['yearly_total'], '| tones', counts['tones'], '| ITU read', sum(parsed.values()), common_n)
