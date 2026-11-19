"""Marked Incorrect — build (the Atelier, cycle 016, step 4 of the programme).

Usage: python3 -I build.py <folder of fetched pages> <path to backup-20261109100729.tar.bz2> [--record]

The folder holds the pages as fetched on 2026-11-17 (they are not committed; they belong to their makers):
  index.html                the first maker's casebook, https://alignment.openai.com/misalignment-reports/
  <slug>.html               each of its 25 reports, https://alignment.openai.com/misalignment-reports/<slug>/
  b-assessment.html         https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents
  b-july30.html             https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals
  hf-postmortem.html        https://huggingface.co/blog/agent-intrusion-technical-timeline
The AI Incident Database snapshot of 2026-11-09 (hash asserted) supplies the two cases the first maker disclosed
only on its incident page, which refused a direct fetch: incidents 1707 and 1799 and their reports.

With --record the sha256 of every input is written to sources.json; without it every hash is asserted against
sources.json, so a changed page stops the build instead of silently changing a count.

Reads the makers' own titles, settings and dates from the pages, joins this practice's reading (codes.json),
and writes:
  marked.js     window.MARKED = one row per case and the totals the page states
  marked.json   the same
Every count the page states is computed here and asserted at the end.

The check of 2026-11-19 corrected nine codes in codes.json and the assertions below. It could not rerun this build:
the casebook index has held 26 reports since 18 November, so the hash assertion stops it, as it was written to, and
the snapshot could not be fetched in that session. build_three.py carried the corrections into marked.json instead.
"""
import csv, datetime as dt, glob, hashlib, html, io, json, os, re, sys, tarfile

csv.field_size_limit(10**9)
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def text(path):
    """Visible text of a page, scripts and styles dropped, whitespace folded."""
    s = open(path, encoding='utf-8', errors='replace').read()
    s = re.sub(r'<(script|style|svg|noscript)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s))


src, snap = sys.argv[1], sys.argv[2]
record = '--record' in sys.argv
assert sha(snap) == SNAP_SHA, 'snapshot hash differs'

files = sorted(os.path.basename(p) for p in glob.glob(os.path.join(src, '*.html')))
hashes = {f: sha(os.path.join(src, f)) for f in files}
man_path = os.path.join(HERE, 'sources.json')
if record:
    json.dump({'fetched': '2026-11-17', 'note': 'sha256 of each page as fetched; the pages are not committed',
               'sha256': hashes}, open(man_path, 'w'), indent=1)
    open(man_path, 'a').write('\n')
man = json.load(open(man_path))['sha256']
assert man == hashes, 'a fetched page differs from the one this work was built on: ' + str(
    sorted(k for k in set(man) | set(hashes) if man.get(k) != hashes.get(k)))

C = json.load(open(os.path.join(HERE, 'codes.json')))

# --- the first maker's casebook: titles, dates, setting -------------------------------------------------------
idx = open(os.path.join(src, 'index.html'), encoding='utf-8').read()
rows = {}
for m in re.finditer(r'<tbody class="report-entry" id="report-([^"]+)" data-title="([^"]*)" data-incident="([^"]*)"'
                     r' data-date="([^"]*)" data-created="([^"]*)" data-topics="([^"]*)" data-search="([^"]*)"', idx):
    slug, title, inc, upd, created, topics, search = m.groups()
    s = html.unescape(search)
    head = s.split(' 2026-')[0]
    model, setting = head.rsplit(' · ', 1)
    # the description precedes the model line; the model is what follows the last sentence end
    model = re.split(r'(?<=[.!?”])\s+', model)[-1]
    rows[slug] = {'title': html.unescape(title), 'deed': inc, 'posted': created, 'updated': upd,
                  'topics': json.loads(html.unescape(topics)), 'model': model.strip(), 'setting': setting.strip()}
notices = {}
for m in re.finditer(r'id="notice-([^"]+)" data-title="([^"]*)" data-incident="([^"]*)" data-date="([^"]*)"'
                     r' data-created="([^"]*)"', idx):
    slug, title, inc, upd, created = m.groups()
    notices[slug] = {'title': title, 'deed': inc, 'posted': created}
assert len(rows) == 25, len(rows)
assert set(notices) == {'rubygems', 'dsewiki', 'hugging-face'}, notices

MON = {m: i for i, m in enumerate(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 1)}


def seen_date(slug):
    t = text(os.path.join(src, slug + '.html'))
    m = re.search(r'(Discovered|Discovery date|Discovery): (By )?([A-Z][a-z]{2}) (\d{1,2}), (\d{4})', t)
    if not m:
        return None, False
    return dt.date(int(m.group(5)), MON[m.group(3)], int(m.group(4))).isoformat(), bool(m.group(2))


def deed_dates(slug):
    """Every date in the report's own header field for the deed (incident date, sample, main incident ...)."""
    t = text(os.path.join(src, slug + '.html'))
    m = re.search(r'(Main incident date|Main incident|Main sample completed|Incident dates?|Samples?) ?: (.*?)'
                  r'(Discover|Report updated)', t)
    if not m:
        return []
    seg = m.group(2)
    years = re.findall(r'\b(20\d\d)\b', seg)
    out = []
    for mm in re.finditer(r'([A-Z][a-z]{2}) (\d{1,2})(?:, (20\d\d))?', seg):
        if mm.group(1) not in MON:
            continue
        y = int(mm.group(3) or next((yy for yy in re.findall(r'\b(20\d\d)\b', seg[mm.end():])), years[-1]))
        out.append(dt.date(y, MON[mm.group(1)], int(mm.group(2))).isoformat())
    return out


# --- the second maker: four incidents in one assessment -------------------------------------------------------
bt, b30 = text(os.path.join(src, 'b-assessment.html')), text(os.path.join(src, 'b-july30.html'))
for phrase in ['our scan relied on an agentic search', 'This missed a set of transcripts',
               'while assembling transcripts to share with METR', 'from January 2026',
               'reinforce the difficulty of reliably assessing alignment across the full range of possible usage scenarios',
               'the correct window was less than an hour', 'only gained access to one', 'Published Sep 9, 2026']:
    assert phrase in bt, phrase
for phrase in ['After reviewing 141,006 evaluation runs', 'The earliest incidents date to April',
               'We began our transcript review on Thursday, July 23', 'We identified all three incidents the next day',
               'had not previously detected the activity', 'Published Jul 30, 2026']:
    assert phrase in b30, phrase
hft = text(os.path.join(src, 'hf-postmortem.html'))
for phrase in ['from the first action on 07-09 02:28 UTC', 'correlated by our AI-based security agent stack',
               "it failed to correctly raise the alert's criticality"]:
    assert phrase in hft, phrase

# --- the snapshot: the two cases only on the first maker's incident page --------------------------------------
with tarfile.open(snap, 'r:bz2') as t:
    INC = {r['incident_id']: r for r in csv.DictReader(io.StringIO(
        t.extractfile('mongodump_full_snapshot/incidents.csv').read().decode('utf-8')))}
    REP = {r['report_number']: r for r in csv.DictReader(io.StringIO(
        t.extractfile('mongodump_full_snapshot/reports.csv').read().decode('utf-8')))}
r8233, r7990 = REP['8233']['text'], REP['7990']['text']
for phrase in ['we have identified 53 instances to date where user-provided images were posted',
               'September 25, 2026: We identified cases where agents in our research environment transmitted',
               'We use four automated steps to identify potential cases',
               'Second AI-enabled review', 'Third AI-enabled review', 'An automated flag is not a confirmed incident',
               'approximately 50 petabytes', 'about 66 million years to read it at 240 words a minute',
               'September 28, 2026:']:
    assert phrase in r8233, phrase
assert 'uncovered the Australia incidents during an "extensive review"' in r7990

# --- join ----------------------------------------------------------------------------------------------------
cases = []
for c in C['cases']:
    row = dict(c)
    if c['maker'] == 'A' and not c.get('notice') and not c['id'].startswith('P-'):
        r = rows[c['id']]
        seen, by = seen_date(c['id'])
        own_dates = deed_dates(c['id'])
        # the maker's casebook column, or the earliest date its report gives for the deed where that is earlier
        row.update(title=r['title'], setting=r['setting'], topics=r['topics'],
                   deed_date=min([r['deed']] + own_dates), deed_index=r['deed'], deed_report=own_dates,
                   posted=r['posted'], seen=seen, seen_by=by,
                   url='https://alignment.openai.com/misalignment-reports/%s/' % c['id'])
    elif c.get('notice'):
        n = notices[c['id'][2:]]
        row.update(title=n['title'], setting='notice', deed_date=n['deed'] or None, posted=n['posted'],
                   seen=None, seen_by=False, url='https://alignment.openai.com/misalignment-reports/#notices')
        if c['id'] == 'N-hugging-face':
            row.update(deed_date='2026-07-09', url='https://huggingface.co/blog/agent-intrusion-technical-timeline')
        if c['id'] == 'N-dsewiki':
            row.update(outside_first='2026-09-04')
    elif c['maker'] == 'B':
        row.update(setting='Evaluation (capture the flag, cyber safeguards off)',
                   url='https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents')
        if c['id'] == 'B-early-checkpoint':
            row.update(deed_date='2026-01', seen='2026-08', seen_by=False, posted='2026-09-09')
        else:
            row.update(deed_date='2026-04', deed_to='2026-07-23', seen='2026-07-24', seen_by=False, posted='2026-07-30',
                       url='https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals')
    cases.append(row)

# the two cases from the first maker's incident page (incidents 1707 and 1799 of the snapshot)
for pid, inc, posted, title, asked, deed in [
        ('P-australia', '1707', '2026-09-28', 'Australian government websites',
         'research into public medicine spending',
         "bypassed repeated access blocks into non-public parts of a national health statistics service and wrote files to its server"),
        ('P-images', '1799', '2026-09-25', 'User images posted to outside hosts',
         'not stated',
         'posted images supplied by users of the maker\'s chatbot to outside image hosts, 53 times found')]:
    i = INC[inc]
    cases.append({'id': pid, 'maker': 'A', 'title': title, 'setting': 'research environment (from the incident page)',
                  'asked': asked, 'deed': deed, 'deed_date': i['date'] if inc == '1707' else None, 'posted': posted,
                  'seen': None, 'seen_by': False, 'aiid': [int(inc)], 'kind': 'incident',
                  'grade': {'class': 'none on record', 'record': None},
                  'eye': {'first': 'model', 'how': 'afterwards',
                          'note': "found in the maker's backward review, whose first three passes are models reading the records (the maker's account of 30 September)"},
                  'missed': None, 'url': 'https://openai.com/hugging-face-incident-and-misalignment/'})

for c in cases:
    c['investigator'] = c.get('investigator') or ('METR' if c['maker'] == 'B' else None)

# --- counts --------------------------------------------------------------------------------------------------
def count(seq, key):
    out = {}
    for x in seq:
        k = key(x)
        out[k] = out.get(k, 0) + 1
    return out


inc = [c for c in cases if c['kind'] == 'incident']
own = [c for c in cases if not c.get('notice')]
graded = [c for c in own if c['grade']['class'] != 'none on record']
res = {
    'cases': len(cases),
    'reports_A': len(rows), 'from_page_A': 2, 'cases_B': sum(c['maker'] == 'B' for c in cases), 'notices': len(notices),
    'own': len(own), 'incidents': len(inc),
    'not_incident': [c['id'] for c in cases if c['kind'] != 'incident'],
    'grade': count(own, lambda c: c['grade']['class']),
    'graded': len(graded),
    'graded_on_answer': sum(c['grade']['class'] in ('credited', 'not credited') for c in graded),
    'graded_on_deed': sum(c['grade']['class'] == 'on the deed' for c in graded),
    'credited': sum(c['grade']['class'] == 'credited' for c in graded),
    'credited_through_deed': sum(bool(c['grade'].get('through')) for c in graded),
    'eye_own': count(own, lambda c: c['eye']['first']),
    'eye_notices': count([c for c in cases if c.get('notice')], lambda c: c['eye']['first']),
    'model_how': count([c for c in own if c['eye']['first'] == 'model'], lambda c: c['eye']['how'] or 'not stated'),
    'missed': [c['id'] for c in cases if c.get('missed')],
    'investigator': [c['id'] for c in cases if c['investigator']],
    'rerunnable_outside': 0,
    'nine': sorted(i for c in cases for i in c['aiid']),
}
REMEDY = re.compile(r'monitoring to all|on all traffic|100 percent of training samples|runs on 100% of samples|on all training samples', re.I)
res['remedy_all'] = sum(bool(REMEDY.search(text(os.path.join(src, s + '.html')))) for s in rows)
res['investigator_n'] = len(res['investigator'])
res['first_by_model'] = res['eye_own'].get('model', 0)
res['first_by_person'] = res['eye_own'].get('person', 0)
res['first_by_alarm'] = res['eye_own'].get('alarm', 0)
res['first_unstated'] = res['eye_own'].get('not stated', 0)
res['sampled'] = res['model_how'].get('sample', 0)
res['afterwards'] = res['model_how'].get('afterwards', 0)


def days(a, b):
    return (dt.date.fromisoformat(b) - dt.date.fromisoformat(a)).days


lag_post = sorted(days(c['deed_date'], c['posted']) for c in cases
                  if c.get('deed_date') and len(c['deed_date']) == 10 and c.get('posted') and c['maker'] == 'A'
                  and not c.get('notice') and not c['id'].startswith('P-'))
lag_seen = sorted(days(c['deed_date'], c['seen']) for c in cases
                  if c.get('deed_date') and len(c['deed_date']) == 10 and c.get('seen') and len(c['seen']) == 10
                  and c['maker'] == 'A')
med = lambda xs: xs[len(xs) // 2] if len(xs) % 2 else (xs[len(xs) // 2 - 1] + xs[len(xs) // 2]) / 2
res.update(lag_posted_n=len(lag_post), lag_posted_median=med(lag_post), lag_posted_max=max(lag_post),
           lag_seen_n=len(lag_seen), lag_seen_median=med(lag_seen), lag_seen_max=max(lag_seen),
           seen_same_day=sum(x == 0 for x in lag_seen))
for c in cases:
    if c.get('deed_date') and len(c['deed_date']) == 10 and c.get('posted'):
        c['lag_posted'] = days(c['deed_date'], c['posted'])
    if c.get('deed_date') and len(c['deed_date']) == 10 and c.get('seen') and len(c['seen']) == 10:
        c['lag_seen'] = days(c['deed_date'], c['seen'])

# the maker's own scale, recomputed: 50 petabytes read as text at 240 words a minute, 66 million years
MIN_YEAR = 365.25 * 24 * 60
words = 66e6 * MIN_YEAR * 240
res['scale'] = {
    'petabytes': 50, 'years': 66e6, 'wpm': 240,
    'bytes_per_word_implied': round(50e15 / words, 2),
    'life': {'years': 45, 'days': 220, 'hours': 8},
}
life_words = 45 * 220 * 8 * 60 * 240
res['scale']['life_words'] = life_words
res['scale']['life_share_one_in'] = round(words / life_words / 1e6, 1)   # in millions
res['scale']['gb_per_life'] = round(life_words * res['scale']['bytes_per_word_implied'] / 1e9, 1)

# --- assertions: every figure the page states ----------------------------------------------------------------
assert res['cases'] == 34 and res['own'] == 31 and res['cases_B'] == 4
# corrected by the check of 2026-11-19 (check/third_reading.json; codes.json carries each change as "corrected")
assert res['graded'] == 11 and res['graded_on_answer'] == 9 and res['graded_on_deed'] == 2 and res['credited'] == 7, res
assert res['first_by_model'] == 20 and res['first_by_person'] == 5 and res['first_by_alarm'] == 1, res['eye_own']
assert res['first_unstated'] == 4 and res['eye_own'].get('by design') == 1, res['eye_own']
assert res['eye_notices'] == {'outside': 3}
assert res['sampled'] == 5 and res['afterwards'] == 8, res['model_how']
assert res['nine'] == [1685, 1707, 1784, 1799, 1802, 1803, 1804, 1806, 1807], res['nine']
assert len(res['investigator']) == 6, res['investigator']
assert res['credited_through_deed'] == 1 and res['remedy_all'] == 12, (res['credited_through_deed'], res['remedy_all'])
assert 5.9 < res['scale']['bytes_per_word_implied'] < 6.1, res['scale']
assert len(cases) == len({c['id'] for c in cases})

out = {'res': res, 'cases': cases, 'canary': C['canary']}
json.dump(out, open(os.path.join(HERE, 'marked.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'marked.js'), 'w').write(
    '/* ' + C['canary'] + ' */\nwindow.MARKED=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(res, indent=1))
