"""Study 41 — do the states say what they do? Tests P12–P16 of PREDICTIONS-3.md.
Usage: python3 analyse3.py <sbs2021.json> <metadata_dir>
  <sbs2021.json>: the study 39 table (fetch.sh). <metadata_dir>: the 27 national quality reports,
  sbs_essbs21_<cc>.htm, from https://ec.europa.eu/eurostat/cache/metadata/EN/ (fetch_meta.sh).
Also computes, after P12–P16 were scored, (a) the employment-conditional check the field's own wording
asks for, and (b) figure 1's whiskers as a bootstrap over member states (the critique of session 230).
Writes data/results-3.json and data/figure3.js."""
import json, re, sys, html, random, hashlib, collections, math

raw = open(sys.argv[1], 'rb').read()
MD = sys.argv[2].rstrip('/')
EU27 = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU',
        'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE']
LEVEL_IND = ['EMP_NR', 'SAL_NR', 'SAL_FTE_NR', 'AV_MEUR', 'VAL_OUT_MEUR', 'WAGE_MEUR', 'HW_NR',
             'EXPN_SAL_BEN_MEUR', 'SS_COST_MEUR', 'GOS_MEUR', 'GRSINV_TNCA_MEUR', 'GRSINV_MAC_MEUR',
             'PUR_MEUR', 'PUR_RS_MEUR', 'PUR_AGN_MEUR', 'PUR_NRG_MEUR', 'STK_CHG_GD_FIN_MEUR',
             'GM_GD_RS_MEUR', 'NETTUR_MEUR']
BINS = [(1, 2), (3, 4), (5, 9), (10, 19), (20, 49), (50, 99), (100, 999), (1000, 10 ** 9)]
LABELS = {
    'F1': 'Number of enterprises non confidential, if number of employments is confidential',
    'F2': 'Threshold of number of enterprises (Number)',
    'F3': 'Dominance criteria applied',
    'F3n': 'If dominance criteria applied specify the threshold (Number)',
    'F4': 'Secondary confidentiality applied',
    'rules': 'Confidentiality rules applied',
    'comment': 'Comment'}
rnd = random.Random(41)


# ---------- the national reports: section 7.2.1, read as a table of label → value ----------
def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def fields(cc):
    b = open(f'{MD}/sbs_essbs21_{cc.lower()}.htm', 'rb').read()
    t = b.decode('utf-8', 'replace')
    i = t.rfind('7.2.1. Confidentiality processing')
    j = t.find('8. Release policy', i)
    part = t[i:j]
    out = {'sha256': hashlib.sha256(b).hexdigest(), 'raw': {}}
    for tr in re.findall(r'<tr.*?</tr>', part, flags=re.S):
        cells = [clean(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, flags=re.S)]
        if len(cells) >= 2:
            for k, lab in LABELS.items():
                if cells[0] == lab:
                    out['raw'][k] = cells[1]
    if not out['raw']:
        out['raw']['note'] = clean(part)[len('7.2.1. Confidentiality processing'):].strip()[:200]
    # 7.2 free text, kept short: the sentence(s) naming enterprises or a threshold
    k = t.rfind('7.2. Confidentiality - data treatment')
    free = clean(t[k:i])
    out['free_7_2'] = free[len('7.2. Confidentiality - data treatment'):].strip()
    return out


def yn(v):
    if v is None:
        return 'blank'
    v = v.strip().lower()
    if v.startswith('yes'):
        return 'yes'
    if v.startswith('no') and not v.startswith('not'):
        return 'no'
    return 'blank' if v in ('', '-', '/') else 'other'


def num(v):
    if not v:
        return None
    m = re.fullmatch(r'(?:less than\s*|<\s*)?(\d+)', v.strip().lower())
    return int(m.group(1)) if m else None


META = {g: fields(g) for g in EU27}
for g, m in META.items():
    r = m['raw']
    m['F1'] = yn(r.get('F1')); m['F2'] = num(r.get('F2')); m['F3'] = yn(r.get('F3')); m['F4'] = yn(r.get('F4'))

# ---------- the table, as in studies 39 and 40 ----------
class Cube:
    def __init__(self, raw):
        d = json.loads(raw)
        self.ids, size = d['id'], d['size']
        self.idx = {k: d['dimension'][k]['category']['index'] for k in self.ids}
        self.labels = {k: d['dimension'][k]['category']['label'] for k in self.ids}
        self.strides = [1] * len(self.ids)
        for i in range(len(self.ids) - 2, -1, -1):
            self.strides[i] = self.strides[i + 1] * size[i + 1]
        self.val, self.st = d['value'], d.get('status', {})

    def get(self, **kw):
        if any(kw[k] not in self.idx[k] for k in kw):
            return 'S', None
        p = str(sum(self.idx[k][kw[k]] * s for k, s in zip(self.ids, self.strides)))
        if 'C' in self.st.get(p, ''):
            return 'W', None
        if p in self.val:
            return 'P', self.val[p]
        return 'S', None


A = Cube(raw)
cell = lambda g, n, i: A.get(freq='A', nace_r2=n, indic_sbs=i, geo=g, time='2021')
classes = [c for c in A.idx['nace_r2'] if re.fullmatch('[A-S][0-9]{4}', c)]
R2 = json.load(open('data/results-2.json'))
REG = {r['geo']: r for r in R2['regimes']}
RATIO = {c['geo']: c['ratio'] for c in R2['countries']}

def practice(g):
    s = REG[g]['share_with_count']
    return 'count-publishing' if s == 0 else 'count-withholding' if s == 1 else 'mixed'

res = {'source': {'sbs_ovw_act_sha256': hashlib.sha256(raw).hexdigest(),
                  'metadata': {g: META[g]['sha256'] for g in EU27},
                  'metadata_url': 'https://ec.europa.eu/eurostat/cache/metadata/EN/sbs_essbs21_<cc>.htm'}}
res['states'] = [{'geo': g, 'name': A.labels['geo'][g], 'practice': practice(g),
                  'share_with_count': REG[g]['share_with_count'], 'rate': REG[g]['rate'],
                  'F1': META[g]['F1'], 'F2': META[g]['F2'], 'F3': META[g]['F3'], 'F4': META[g]['F4'],
                  'raw': META[g]['raw']} for g in EU27]
S = {s['geo']: s for s in res['states']}
six = [g for g in EU27 if practice(g) == 'count-withholding']
sixteen = [g for g in EU27 if practice(g) == 'count-publishing']
blank = sum(S[g]['F1'] in ('blank', 'other') for g in EU27)
res['F1_blank_or_other'] = blank
testable = blank <= 10

# P12, P13, P14
k12 = sum(S[g]['F1'] != 'yes' for g in six)
k13 = sum(S[g]['F1'] == 'yes' for g in sixteen)
res['P12'] = {'not_yes': k12, 'of': len(six), 'testable': testable, 'held': testable and k12 >= 5,
              'answers': {g: S[g]['raw'].get('F1', S[g]['raw'].get('note')) for g in six}}
res['P13'] = {'yes': k13, 'of': len(sixteen), 'testable': testable, 'held': testable and k13 >= 13,
              'answers': {g: S[g]['raw'].get('F1') for g in sixteen}}
res['P14'] = {'IE': S['IE']['raw'].get('F1'), 'held': S['IE']['F1'] != 'yes'}

# 2×2 over the 22 pure states: declared F1 == yes against count-publishing practice
a = k13; b = len(sixteen) - k13; c = len(six) - k12; d = k12   # rows: publishing, withholding; cols: yes, not yes
def lfact(n): return math.lgamma(n + 1)
def hyp(x, r1, c1, n): return math.exp(lfact(r1) + lfact(n - r1) + lfact(c1) + lfact(n - c1) - lfact(n) - lfact(x) - lfact(r1 - x) - lfact(c1 - x) - lfact(n - r1 - c1 + x))
n = a + b + c + d; r1 = a + b; c1 = a + c
p0 = hyp(a, r1, c1, n)
fisher = sum(hyp(x, r1, c1, n) for x in range(max(0, c1 - (n - r1)), min(r1, c1) + 1) if hyp(x, r1, c1, n) <= p0 * (1 + 1e-9))
po = (a + d) / n; pe = ((a + b) * (a + c) + (c + d) * (b + d)) / n ** 2
res['agreement'] = {'table': {'publishing_yes': a, 'publishing_not_yes': b, 'withholding_yes': c, 'withholding_not_yes': d},
                    'fisher_two_sided_p': fisher, 'kappa': (po - pe) / (1 - pe), 'observed_agreement': po}

# P15: the stated threshold is kept
p15 = []
for g in EU27:
    t = S[g]['F2']
    if t is None:
        continue
    w = p = k = 0
    for cl in classes:
        s, e = cell(g, cl, 'ENT_NR')
        if s == 'P' and 1 <= e <= t - 1:
            k += 1
            for i in LEVEL_IND:
                x = cell(g, cl, i)[0]
                w += x == 'W'; p += x == 'P'
    p15.append({'geo': g, 'threshold': t, 'classes_below': k, 'withheld': w, 'published': p,
                'rate': w / (w + p) if w + p else None, 'kept': (w / (w + p) >= 0.9) if w + p else None})
exc = [r['geo'] for r in p15 if r['kept'] is False]
res['P15'] = {'states': p15, 'testable_states': sum(r['kept'] is not None for r in p15), 'exceptions': exc,
              'held': len(exc) <= 2}

# P16
def ranks(x):
    o = sorted(range(len(x)), key=lambda i: x[i]); r = [0.0] * len(x); i = 0
    while i < len(x):
        j = i
        while j + 1 < len(x) and x[o[j + 1]] == x[o[i]]:
            j += 1
        for k in range(i, j + 1):
            r[o[k]] = (i + j) / 2
        i = j + 1
    return r
def spearman(a, b):
    ra, rb = ranks(a), ranks(b); ma, mb = sum(ra) / len(ra), sum(rb) / len(rb)
    num_ = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    den = math.sqrt(sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb))
    return num_ / den if den else float('nan')
def boot_rho(pairs, B=2000):
    out = []
    for _ in range(B):
        s = [pairs[rnd.randrange(len(pairs))] for _ in pairs]
        v = spearman([x for x, _ in s], [y for _, y in s])
        if not math.isnan(v):
            out.append(v)
    out.sort()
    return out[int(0.025 * len(out))], out[int(0.975 * len(out)) - 1]
pairs = [(S[g]['F2'], RATIO[g]) for g in EU27 if S[g]['F2'] is not None]
rho = spearman([x for x, _ in pairs], [y for _, y in pairs])
res['P16'] = {'n': len(pairs), 'rho': rho, 'ci': boot_rho(pairs), 'testable': len(pairs) >= 8,
              'thresholds': dict(collections.Counter(x for x, _ in pairs)),
              'held': len(pairs) >= 8 and rho >= 0.3}
vis = [(S[g]['F2'], RATIO[g]) for g in EU27 if S[g]['F2'] is not None and REG[g]['withheld_beside_count'] > 0]
res['P16']['excluding_invisible'] = {'n': len(vis), 'rho': spearman([x for x, _ in vis], [y for _, y in vis])}

# ---- after P12–P16 were scored (not predicted): the field asks about cells whose EMPLOYMENT is
# withheld. Per state, class level: of classes with EMP_NR withheld, the share whose ENT_NR is withheld too.
for g in EU27:
    t = collections.Counter()
    for cl in classes:
        if cell(g, cl, 'EMP_NR')[0] == 'W':
            t[cell(g, cl, 'ENT_NR')[0]] += 1
    tot = t['W'] + t['P']
    S[g]['emp_withheld_classes'] = tot
    S[g]['emp_withheld_count_withheld'] = t['W']
    S[g]['emp_conditional_share'] = t['W'] / tot if tot else None
def cond(g):
    s = S[g]['emp_conditional_share']
    return None if s is None else 'withholds count' if s >= 0.5 else 'publishes count'
cmp_ = collections.Counter()
for g in EU27:
    if cond(g) and S[g]['F1'] in ('yes', 'no'):
        cmp_[(S[g]['F1'], cond(g))] += 1
res['employment_conditional'] = {
    'note': 'computed after P12–P16 were scored; the field speaks of cells whose number of persons employed is confidential',
    'by_state': {g: {'classes': S[g]['emp_withheld_classes'], 'count_withheld': S[g]['emp_withheld_count_withheld'],
                     'share': S[g]['emp_conditional_share']} for g in EU27},
    'declared_vs_done': {f'{k[0]}|{k[1]}': v for k, v in cmp_.items()},
    'mismatch_said_no_but_publish': sorted(g for g in EU27 if S[g]['F1'] == 'no' and cond(g) == 'publishes count'),
    'mismatch_said_yes_but_withhold': sorted(g for g in EU27 if S[g]['F1'] == 'yes' and cond(g) == 'withholds count')}

# ---- after scoring (not predicted): in the states that broke P15, which of the 19 figures are published
# below the stated threshold? Head counts against money.
HEADS = {'EMP_NR', 'SAL_NR', 'SAL_FTE_NR', 'HW_NR'}
brk = {}
for r in p15:
    if r['kept'] is not False:
        continue
    g, t, c = r['geo'], r['threshold'], collections.Counter()
    for cl in classes:
        s, e = cell(g, cl, 'ENT_NR')
        if s == 'P' and 1 <= e <= t - 1:
            for i in LEVEL_IND:
                if cell(g, cl, i)[0] == 'P':
                    c['head counts' if i in HEADS else 'money'] += 1
                    c[i] += 1
    brk[g] = dict(c)
res['P15']['exceptions_published_below'] = brk

# ---- figure 1's whiskers: bootstrap over member states (the 19 figures of a class, and the classes
# of a state, are not independent; resampling whole states is the conservative unit)
per = {g: [[0, 0] for _ in BINS] for g in EU27}
for g in EU27:
    for cl in classes:
        s, e = cell(g, cl, 'ENT_NR')
        if s != 'P' or e < 1:
            continue
        b = next(k for k, (lo, hi) in enumerate(BINS) if lo <= e <= hi)
        for i in LEVEL_IND:
            x = cell(g, cl, i)[0]
            if x == 'W': per[g][b][0] += 1
            elif x == 'P': per[g][b][1] += 1
draws = [[] for _ in BINS]
for _ in range(2000):
    smp = [EU27[rnd.randrange(27)] for _ in EU27]
    for b in range(len(BINS)):
        w = sum(per[g][b][0] for g in smp); p = sum(per[g][b][1] for g in smp)
        if w + p:
            draws[b].append(w / (w + p))
fig1 = []
for b, (lo, hi) in enumerate(BINS):
    w = sum(per[g][b][0] for g in EU27); p = sum(per[g][b][1] for g in EU27); d = sorted(draws[b])
    fig1.append({'bin': [lo, hi], 'rate': w / (w + p), 'boot': [d[int(.025 * len(d))], d[int(.975 * len(d)) - 1]]})
res['figure1_bootstrap'] = fig1

json.dump(res, open('data/results-3.json', 'w'), indent=1)
open('data/figure3.js', 'w').write('window.STUDY41 = ' + json.dumps(res) + ';\n')
for k in ('P12', 'P13', 'P14', 'P16'):
    print(k, {x: y for x, y in res[k].items() if x not in ('answers',)})
print('P15', res['P15']['exceptions'], res['P15']['testable_states'], res['P15']['held'])
for r in p15: print('  ', r)
print('agreement', res['agreement'])
print('E', json.dumps({k: v for k, v in res['employment_conditional'].items() if k != 'by_state'}))
for g in EU27: print(' ', g, S[g]['practice'], S[g]['F1'], S[g]['emp_withheld_classes'], S[g]['emp_conditional_share'])
print('fig1', [(f['bin'], round(f['rate'], 3), [round(x, 3) for x in f['boot']]) for f in fig1])
