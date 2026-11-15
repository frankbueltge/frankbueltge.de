"""Study 75 — What harm is on record (cycle 015, step 3 of the programme, session 273).

Usage: python3 -I analyse75.py <path to mongodump_full_snapshot/>

Reads the CSV export of the AI Incident Database snapshot backup-20261109100729.tar.bz2 and the
Field's register of public acts (study 74), and writes results75.json (aggregates, the act matches,
the predictions' outcomes) and data75.js (one row per incident: id, year, first reporter's class,
MIT domain number, matched act; no text). Nothing from the reports' texts is written out.
The rules below were fixed in PREDICTIONS75.md before any count was computed.
"""
import csv, json, sys, os, re, collections, hashlib

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP_NAME = 'backup-20261109100729.tar.bz2'
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
SNAP_URL = 'https://pub-72b2b2fc36ec423189843747af98f80e.r2.dev/' + SNAP_NAME


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


inc = rows('incidents.csv')
rep = rows('reports.csv')
mit = rows('classifications_MIT.csv')
rep_by_num = {}
for r in rep:
    try:
        rep_by_num[int(r['report_number'])] = r
    except ValueError:
        pass

# ---------------------------------------------------------------- reporter classes (fixed)
GENERIC = set('''users user developers developer deployers deployer unknown model models large language
chatbot chatbots system systems platform platforms company companies government governments general
public people operators operator data center centers centre centres services service providers provider
online social media network networks apps app artificial intelligence generative agents agent tools tool
image images video videos voice cloning deepfake deepfakes scammers scammer fraudsters actors actor state
linked group groups other various multiple open source vendors vendor researchers research labs team
'''.split())

PUBLIC_SUFFIX = ('.gov', '.mil', 'europa.eu', 'parliament.uk', 'canada.ca', 'gc.ca', 'admin.ch', 'bund.de',
                 'bundestag.de', 'overheid.nl', 'rijksoverheid.nl', 'government.nl', 'garanteprivacy.it',
                 'agcm.it', 'cnil.fr', 'dataprotection.ie', 'ico.org.uk', 'oaic.gov.au', 'esafety.gov.au',
                 'aepd.es', 'edpb.europa.eu', 'cac.gov.cn', 'courtlistener.com')
PUBLIC_LABEL = {'gov', 'gouv', 'gob', 'go', 'mil', 'govt', 'gv', 'gub'}
RESEARCH_SUFFIX = ('.edu', 'arxiv.org', 'doi.org', 'ssrn.com', 'researchgate.net', 'nature.com', 'science.org',
                   'sciencedirect.com', 'springer.com', 'acm.org', 'ieee.org', 'plos.org', 'wiley.com',
                   'tandfonline.com', 'mdpi.com', 'frontiersin.org', 'biorxiv.org', 'medrxiv.org', 'osf.io',
                   'aclanthology.org', 'openreview.net', 'nips.cc', 'neurips.cc', 'mlr.press', 'jmlr.org',
                   'pnas.org', 'thelancet.com', 'bmj.com', 'jamanetwork.com', 'nejm.org', 'semanticscholar.org',
                   'sagepub.com', 'cambridge.org', 'oup.com', 'jstor.org', 'nih.gov')
RESEARCH_LABEL = {'ac', 'edu'}
SELF_SUFFIX = ('twitter.com', 'x.com', 'reddit.com', 'facebook.com', 'fb.com', 'instagram.com', 'tiktok.com',
               'youtube.com', 'youtu.be', 'linkedin.com', 'medium.com', 'substack.com', 'github.com',
               'gitlab.com', 'bsky.app', 'threads.net', 'tumblr.com', 'wordpress.com', 'blogspot.com',
               'quora.com', 'discord.com', 'ycombinator.com', 'lesswrong.com', 't.me', 'vimeo.com',
               'twitch.tv', 'weibo.com', 'mastodon.social', 'hackernoon.com', 'dev.to', 'stackexchange.com',
               'stackoverflow.com', 'pinterest.com', 'imgur.com', 'telegra.ph', 'patreon.com', 'ghost.io')


def labels(dom):
    return [x for x in dom.split('.') if x]


def tokens(slugs):
    out = set()
    for s in slugs:
        parts = [p for p in s.split('-') if p]
        joined = ''.join(parts)
        if len(joined) >= 4 and not set(parts) <= GENERIC:
            out.add(joined)
        for p in parts:
            if len(p) >= 4 and p not in GENERIC:
                out.add(p)
    return out


def ends(dom, suffixes):
    # suffix on a label boundary: 'x.com' matches 'x.com' and 'a.x.com', never 'vox.com'
    return any(dom == x.lstrip('.') or dom.endswith('.' + x.lstrip('.')) for x in suffixes)


def second_level(labs, names):
    # a label such as 'gov' or 'ac' directly before a two-letter country code (gov.uk, ac.jp)
    return len(labs) >= 3 and len(labs[-1]) == 2 and labs[-2] in names


def klass(dom, makers):
    dom = (dom or '').strip().lower()
    if dom.startswith('www.'):
        dom = dom[4:]
    if not dom:
        return 'unknown'
    labs = labels(dom)
    if makers & set(labs[:-1] if len(labs) > 1 else labs):
        return 'maker'
    if ends(dom, PUBLIC_SUFFIX) or second_level(labs, PUBLIC_LABEL) or \
            (labs[-1] == 'us' and ('state' in labs or 'gov' in labs)):
        return 'public body'
    if ends(dom, RESEARCH_SUFFIX) or second_level(labs, RESEARCH_LABEL):
        return 'research'
    if ends(dom, SELF_SUFFIX) or dom.startswith('mastodon.'):
        return 'self-published'
    return 'press and other'


def first_report(nums):
    cand = [rep_by_num[n] for n in nums if n in rep_by_num]
    if not cand:
        return None
    def key(r):
        try:
            e = float(r['epoch_date_published'])
        except ValueError:
            e = None
        return (e is None, e if e is not None else 0, int(r['report_number']))
    return sorted(cand, key=key)[0]


mit_by = {}
for m in mit:
    mit_by.setdefault(int(m['Incident ID']), m)

ROWS = []
for r in inc:
    i = int(r['incident_id'])
    nums = json.loads(r['reports']) if r['reports'] else []
    makers = tokens(json.loads(r['Alleged deployer of AI system'] or '[]') +
                    json.loads(r['Alleged developer of AI system'] or '[]'))
    fr = first_report(nums)
    k = klass(fr['source_domain'], makers) if fr else 'no report'
    m = mit_by.get(i)
    dnum = int(m['Risk Domain'].split('.')[0]) if m and m['Risk Domain'][:1].isdigit() else 0
    resp = any(n in rep_by_num and 'response' in (rep_by_num[n]['tags'] or '') for n in nums)
    y = int(r['date'][:4]) if r['date'][:4].isdigit() else None
    ROWS.append({'id': i, 'y': y, 'k': k, 'd': dnum, 'n': len(nums), 'resp': resp,
                 'dom': (fr['source_domain'] or '').lower() if fr else ''})

N = len(ROWS)
with_first = [x for x in ROWS if x['k'] not in ('no report', 'unknown')]
kc = collections.Counter(x['k'] for x in with_first)
share = {k: round(100 * v / len(with_first), 2) for k, v in kc.items()}

classified = [x for x in with_first if x['d']]
maker_all = sum(1 for x in classified if x['k'] == 'maker') / len(classified)
d7 = [x for x in classified if x['d'] == 7]
maker_d7 = sum(1 for x in d7 if x['k'] == 'maker') / len(d7)
by_domain = {}
for d in range(1, 8):
    xs = [x for x in with_first if x['d'] == d]
    c = collections.Counter(x['k'] for x in xs)
    by_domain[d] = {'n': len(xs), **{k: c[k] for k in kc}}

# ---------------------------------------------------------------- the acts of step 2 (fixed rule)
ACTS = json.load(open(os.path.join(HERE, '../../cycle-014/where-a-public-acted/results74.json')))['acts']
SEARCH = {  # terms searched in titles and descriptions; every hit was then read (see MATCH)
    'chip': r'export control|H20|H200|MI325X|chips?\b.{0,40}China|Bureau of Industry',
    'site': r'data cent(er|re)|Project Blue|Digital Gateway|hyperscale|Cerrillos|Grange Castle|Colossus|Manatee|Worcester',
    'power': r'Susquehanna|Talen|nuclear plant|grid connection|EirGrid|turbines?|Colossus',
    'model': r'Garante|Ital(y|ian)|DeepSeek|Grok|ANPD|\bMeta\b.{0,80}(train|personal data)|Cyberspace Administration|interim measures',
}
# Read 2026-11-15, session 273: an incident matches an act when it names the same system, model or
# facility and the same developer or deployer, and its description concerns the matter the act addressed.
MATCH = {
    'm1': (513, 'ChatGPT, OpenAI; the description names the Italian authority\'s temporary limitation of processing.'),
    'm2': (513, 'The same incident: the act lifting the limitation on conditions addresses the same matter.'),
    'm7': (1329, 'Grok, xAI; nonconsensual sexualised images generated by the chatbot, the matter of Indonesia\'s block.'),
    'p4': (1144, 'Colossus, xAI, Memphis; unpermitted gas turbines, the matter of the Shelby County air permit.'),
}
NO_MATCH_NOTE = {
    'm3': 'DeepSeek appears in 4 incidents, none on its processing of personal data.',
    'm4': 'Grok appears in 30 incidents, none on training it with users\' posts.',
    'm5': 'No incident on Meta training generative AI with personal data in Brazil.',
    'm6': 'As m5.',
    'm8': 'DeepSeek appears in 4 incidents, none on undisclosed hallucination risk.',
    'm9': 'A rule for all public generative AI services in China; it names no system.',
}
text = {int(r['incident_id']): r['title'] + ' ' + r['description'] for r in inc}
hits = {}
for a in ACTS:
    rx = re.compile(SEARCH[a['point']], re.I)
    hits[a['id']] = sorted(i for i, t in text.items() if rx.search(t))
acts_out = []
for a in ACTS:
    m = MATCH.get(a['id'])
    if m:
        assert m[0] in hits[a['id']], (a['id'], 'match not among the search hits')
    acts_out.append({'id': a['id'], 'point': a['point'], 'date': a['date'], 'country': a['country'],
                     'body': a['body'], 'party': a['party'], 'effect': a['effect'],
                     'search_hits': len(hits[a['id']]), 'match': m[0] if m else None,
                     'note': m[1] if m else NO_MATCH_NOTE.get(a['id'], 'No hit names this act\'s party and matter.')})
matched = [a for a in acts_out if a['match']]
inc_matched = {}
for a in matched:
    inc_matched.setdefault(a['match'], []).append(a['id'])
for x in ROWS:
    x['act'] = ','.join(inc_matched.get(x['id'], []))

# ---------------------------------------------------------------- predictions
P105 = share.get('maker', 0) <= 5 and share.get('self-published', 0) <= 15 and share.get('press and other', 0) >= 70
P106 = maker_d7 >= 2 * maker_all
P107 = len(matched) <= 8 and all(a['point'] == 'model' for a in matched)

years = collections.Counter(x['y'] for x in ROWS)
res = {
    'study': 75, 'session': 273, 'date': '2026-11-15', 'cycle': 15, 'programme_step': 3,
    'snapshot': {'name': SNAP_NAME, 'sha256': SNAP_SHA, 'url': SNAP_URL, 'fetched': '2026-11-15',
                 'licence': 'CC BY-SA 4.0 (database); report contents under their own rights'},
    'predictions_file_sha256': hashlib.sha256(open(os.path.join(HERE, 'PREDICTIONS75.md'), 'rb').read()).hexdigest(),
    'incidents': N, 'reports': len(rep), 'incidents_with_first_report': len(with_first),
    'first_reporter': dict(kc), 'first_reporter_pct': share,
    'classified_mit': len(classified),
    'maker_pct_classified': round(100 * maker_all, 2), 'maker_pct_domain7': round(100 * maker_d7, 2),
    'domain7_n': len(d7), 'by_domain': by_domain,
    'incidents_with_response_report': sum(1 for x in ROWS if x['resp']),
    'single_report': sum(1 for x in ROWS if x['n'] == 1),
    'years': {str(k): v for k, v in sorted(years.items(), key=lambda t: (t[0] is None, t[0] or 0))},
    'acts': acts_out, 'acts_matched': len(matched), 'incidents_matched': sorted(inc_matched),
    'predictions': {'P105': P105, 'P106': P106, 'P107': P107},
    'predictions_held': sum([P105, P106, P107]),
    'rule_fix': 'The first run (same session, before this file was written) matched suffixes without a label boundary (vox.com read as x.com, abcnews.go.com as a government, iphoneincanada.ca as canada.ca); fixed to label boundaries. That run gave P105 held, P106 failed, P107 failed.',
    'top_first_domains': collections.Counter(x['dom'] for x in with_first).most_common(15),
}
json.dump(res, open(os.path.join(HERE, 'results75.json'), 'w'), indent=1, ensure_ascii=False)
slim = [[x['id'], x['y'], x['k'], x['d'], x['act'], 1 if x['resp'] else 0] for x in ROWS]
with open(os.path.join(HERE, 'data75.js'), 'w') as f:
    f.write('window.D75=' + json.dumps({'rows': slim, 'res': {k: res[k] for k in res if k not in ('top_first_domains',)}},
                                       ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({k: res[k] for k in ('incidents', 'first_reporter', 'first_reporter_pct', 'maker_pct_classified',
                                     'maker_pct_domain7', 'domain7_n', 'acts_matched', 'predictions',
                                     'incidents_with_response_report', 'single_report', 'top_first_domains')}, indent=1))
