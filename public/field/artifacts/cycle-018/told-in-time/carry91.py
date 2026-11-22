"""Study 91 -- carry the Atelier's revert window for the 52 deeds of house90.json into house91.json.

Usage: python3 carry91.py <window.json>
  <window.json>  the Atelier's file (ulysses 33ba12f9, artifacts/cycle-018/until-another-hand/data/window.json)
Reads house90.json, window91.json and window91-all.json beside this script. No network.
Each of the 52 pairs keeps the Atelier's window (closing commit, hours, how it was found, who signed it, state) and
says whether this practice's own procedure re-measured it (window91.py) and agreed.
"""
import hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from window91 import sample  # noqa: E402

SRC = ('https://github.com/frankbueltge/ulysses/blob/33ba12f9/artifacts/cycle-018/until-another-hand/data/'
       'window.json')


def main():
    raw = open(sys.argv[1], 'rb').read()
    window = json.loads(raw)
    by = {(d['row'], d['n']): d for d in window['deeds']}
    pool, picked = sample(window)
    pool_keys = {(d['row'], d['n']) for d in pool}
    picked_keys = {(d['row'], d['n']) for d in picked}
    w12 = json.load(open(os.path.join(HERE, 'window91.json')))
    wall = json.load(open(os.path.join(HERE, 'window91-all.json')))
    assert w12['material']['sha256'] == hashlib.sha256(raw).hexdigest(), 'not the file window91.py measured'
    differ = {(d['row'], d['n']) for d in wall['differ']}
    house = json.load(open(os.path.join(HERE, 'house90.json')))
    pairs = []
    for p in house['pairs']:
        if p['join'] != 'lines':
            continue
        d = by[(p['row'], p['deed'])]
        k = (p['row'], p['deed'])
        assert d['first_hand_hours'] == p['first_hand_hours'], k
        pairs.append({
            'row': p['row'], 'deed': p['deed'], 'repo': p['repo'],
            'first_hand_hours': d['first_hand_hours'], 'mending_hours': p['mending_hours'],
            'closed_hours': d.get('closed_hours'), 'closed_by': d.get('closed_by'),
            'closed_found_by': d.get('closed_found_by'), 'closed_signer': d.get('closed_signer'),
            'closed_by_mending': d.get('closed_by_mending'), 'state': d.get('state'),
            'remeasured': 'in the sample of 12' if k in picked_keys else ('in the whole pool' if k in pool_keys
                                                                            else 'not re-measured'),
            'agree': (k not in differ) if k in pool_keys else None,
        })
    json.dump({'what': "The Atelier's revert window for the 52 deeds of house90.json (study 90), carried by study 91 "
                       '(handoff ho-2026-11-22-atelier-1), with whether window91.py re-measured it and agreed. Hours '
                       "run from the deed's commit; mending_hours is study 90's.",
               'source': SRC, 'sha256': hashlib.sha256(raw).hexdigest(), 'pairs': pairs},
              open(os.path.join(HERE, 'house91.json'), 'w'), indent=1)
    print(len(pairs), sum(p['agree'] is True for p in pairs), sum(p['remeasured'] != 'not re-measured' for p in pairs))


if __name__ == '__main__':
    main()
