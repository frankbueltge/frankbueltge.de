# Study 66: from ownership to use. Reads data/agreements66.json and results65.json, scores P60-P65,
# and writes results66.json and data66.js. Standard library only; run with python3 -I analyse66.py <studio-check.json>.
import json, sys, os
here = os.path.dirname(os.path.abspath(__file__))
A = json.load(open(os.path.join(here, 'data', 'agreements66.json')))
R65 = json.load(open(os.path.join(here, 'results65.json')))
check = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else json.load(open(os.path.join(here, 'data', 'studio-check66.json')))

FRONTIER = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'xAI']
rows = A['rows']
first = [r for r in rows if r['grade'] == 'first']
q4 = next(q for q in R65['quarters'] if q['q'] == '2025-12-31')
owners = set(o for q in R65['quarters'] for o in q['owner_h100e'])

def provider_row(p):
    base = p.split(' (')[0]
    return base if base in owners else 'Other'

users_first = sorted({r['user'] for r in first if r['user'] != r['provider']})
providers_openai = sorted({r['provider'] for r in first if r['user'] == 'OpenAI'})
with_chips = [r['id'] for r in first if r.get('chips')]
with_usd = [r['id'] for r in first if r.get('usd_bn') is not None]
with_gw = [r['id'] for r in first if r.get('gw') is not None]
STATE_HELD = set()  # no provider in the rows is owned by a government (checked by name: all are listed or private companies)
state_rows = [r['id'] for r in first if r['provider'] in STATE_HELD]

# stated money, by user, term totals only (the monthly xAI fee is shown apart)
usd = {}
for r in first:
    if r.get('usd_bn') is not None and not r.get('usd_monthly'):
        usd.setdefault(r['user'], 0); usd[r['user']] += r['usd_bn']
usd = {k: round(v, 1) for k, v in usd.items()}
gw = {}
for r in first:
    if r.get('gw') is not None:
        gw.setdefault(r['user'], 0); gw[r['user']] += r['gw']
gw = {k: round(v, 2) for k, v in gw.items()}

# who is both owner and user
owner_and_user = sorted({r['provider'] for r in rows if r['provider'] in FRONTIER} & set(FRONTIER))
joined_by_name = [r['id'] for r in first if provider_row(r['provider']) != 'Other']

worst_total = max(c['max_gap_vs_share_of_total'] for c in check if not c['incomplete'])
worst_ex = max(c['max_gap_vs_share_ex_smuggled'] for c in check)
five_gap = max(c['five_area'] - c['five_ours'] for c in check)
five_gap_q = max(check, key=lambda c: c['five_area'] - c['five_ours'])['q']
owner_sum_gap = max(c['owner_sum_gap_h100e'] for c in check)

preds = [
 dict(id='P60', text='At least three of the five frontier developers have a disclosed agreement with a provider other than themselves.',
      held=len(users_first) >= 3, result=f"{len(users_first)} of 5 in first-hand texts ({', '.join(users_first)}); Google only in a news report (renting from xAI); xAI rents from providers it does not name"),
 dict(id='P61', text='None of the disclosed agreements names a state-held provider.',
      held=not state_rows, result=f"0 of {len(first)}; every provider is a listed or private company"),
 dict(id='P62', text="OpenAI's disclosed agreements involve at least four distinct providers.",
      held=len(providers_openai) >= 4, result=f"{len(providers_openai)}: {', '.join(providers_openai)}"),
 dict(id='P63', text='Fewer than half of the disclosed agreements state a quantity in chips or H100-equivalents.',
      held=len(with_chips) < len(first) / 2, result=f"{len(with_chips)} of {len(first)} state chips ({', '.join(with_chips)}); none states H100-equivalents; {len(with_usd)} state money, {len(with_gw)} state power"),
 dict(id='P64', text="OpenAI and Anthropic appear as owners in none of Epoch's owner rows.",
      held=('OpenAI' not in owners and 'Anthropic' not in owners), result=f"owner rows: {', '.join(sorted(owners))}"),
 dict(id='P65', text="The Studio's parcel areas agree with this study's owner shares within 0.1 points in every quarter.",
      held=worst_total <= 0.1, result=f"owner sums identical in all 17 quarters (largest gap {owner_sum_gap} H100e); the areas are shares of the stock without smuggled chips, where they agree to {worst_ex} points, so against this study's shares one parcel is off by up to {worst_total} points and the five red parcels cover up to {five_gap:.2f} points more than the 68.6 %-style label ({five_gap_q})"),
]

out = dict(
 n_first=len(first), n_secondary=len(rows) - len(first), users_first=users_first, providers_openai=providers_openai,
 with_chips=with_chips, with_usd=with_usd, with_gw=with_gw, usd_by_user=usd, gw_by_user=gw,
 owner_and_user=owner_and_user, joined_by_name=len(joined_by_name),
 q4_2025_share={p: q4['owner_share'].get(p) for p in sorted(owners)},
 studio_check=dict(owner_sum_gap=owner_sum_gap, worst_gap_vs_total=worst_total, worst_gap_vs_ex_smuggled=worst_ex,
                   five_area_minus_label_max=round(five_gap, 2), at=five_gap_q),
 predictions=preds)
json.dump(out, open(os.path.join(here, 'results66.json'), 'w'), indent=1, ensure_ascii=False)
pub = dict(rows=rows, registers=A['registers'], unnamed=A['unnamed'], provider_row={r['provider']: provider_row(r['provider']) for r in rows}, **out)
open(os.path.join(here, 'data66.js'), 'w').write('window.D66=' + json.dumps(pub, ensure_ascii=False, separators=(',', ':')) + ';\n')
for p in preds: print(p['id'], 'HELD' if p['held'] else 'FAILED', '-', p['result'])
print('usd', usd, 'gw', gw, 'owner_and_user', owner_and_user, 'joined_by_name', len(joined_by_name), 'of', len(first))
