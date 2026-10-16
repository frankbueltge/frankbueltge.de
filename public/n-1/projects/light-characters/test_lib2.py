"""Invented strings only. Run before any pair is parsed: python3 test_lib2.py"""
import numpy as np
from lib2 import arcs, sees


def vis(remark, *bearings):
    m, s = arcs(remark)
    return s, [bool(x) for x in sees(m, np.array(bearings, float))]


assert vis(None, 0, 180) == ("allround", [True, True])
assert vis("Private light.", 10) == ("allround", [True])
assert vis("Visible 010°-175°.", 5, 10.5, 100, 174, 200) == ("restricted", [False, True, True, True, False])
assert vis("Visible 300°-020°.", 299, 310, 0, 19, 25) == ("restricted", [False, True, True, True, False])
assert vis("Visible 257°54`-277°54`. Shown 24 hours.", 257.5, 258, 277.5, 278) == ("restricted", [False, True, True, False])
assert vis("Visible 058° -067° .", 60, 70) == ("restricted", [True, False])
assert vis("Visible 183°-290° and 343°-155°.", 200, 300, 350, 100, 160) == ("restricted", [True, False, True, True, False])
# sector chain: W 169-349, R 349-169 => all round
assert vis("W. 169°-349°, R.-169°. Reserve light F.W.R.", 0, 90, 200) == ("restricted", [True, True, True])
# chain with a gap and a fresh start
assert vis("W. 077°-178°, W. 187°-194°, R.-234°, W.-317°.", 100, 180, 190, 230, 300, 330, 10) == (
    "restricted", [True, False, True, True, True, False, False])
assert vis("R. 120°-218°, W.-331°, R.-000°, R.(unintensified)-120°.  Fl.(2)G. 2M marks N. spur head.", 0, 100, 200, 340) == (
    "restricted", [True, True, True, True])
assert vis("W. 070°30`-108°, R.-252°, W.-260°, R.-307°, W.(unintensified)-015°, W.-065°30'.", 66, 69, 70.5, 300) == (
    "restricted", [False, False, True, True])
assert vis("R. 067°-107°, W.-067°.", 50, 90, 200) == ("restricted", [True, True, True])
assert vis("Obscured 100°-200°.", 50, 150, 250) == ("restricted", [True, False, True])
assert vis("Visible 090°-022°, obscured by Cap Noir to westward of 333°.", 100, 20, 50) == ("restricted", [True, True, False])
assert vis("Intensified 061°30`-064°30`.", 10, 62) == ("intensified-only", [True, True])
assert vis("Obscured by Pointe de Dellys when bearing less than 203°.", 10) == ("unparsed", [True])
assert vis("Visible 222°-082°. AIS (MMSI No 992471087). Reserve light range 18M.", 300, 100) == ("restricted", [True, False])
# a lone G. sector after a full chain with commas
assert vis("G. 033°-055°, W.-060°, R.-095°, G.-124°, W.-153°, R.-201°, W.-240°, R.-033°.", 0, 180, 359) == (
    "restricted", [True, True, True])
# added after the reading (session 2): a range in parentheses after the colour must not break the chain
assert vis("R. 342°-348°24`, W.(10M)-356°, G.-071°24`, W.-081°24`.", 350, 60, 80, 90) == ("restricted", [True, True, True, False])
print("lib2 ok")
