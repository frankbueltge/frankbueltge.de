"""Rules of lib3 on invented strings, run before any pair is parsed."""
from lib3 import phases, verdict, perceptible

assert phases("Fl.W.\nperiod 5s \nfl. 0.5s, ec. 4.5s \n") == (("fl", 0.5), ("ec", 4.5))
assert phases("Fl.W.\nperiod 5s \n") is None
assert phases("") is None and phases(None) is None
assert phases("Fl.(2)W.\nperiod 10s \nfl. 1.0s, ec. 2.0s \nfl. 1.0s, ec. 6.0s \n") == (
    ("fl", 1.0), ("ec", 2.0), ("fl", 1.0), ("ec", 6.0))
assert phases("Oc.R.\nperiod 4s \nlt. 3s, ec. 1s \n") == (("lt", 3.0), ("ec", 1.0))
assert phases("Fl.W. 0.5s\nperiod 3s \n") is None  # nothing before the period line counts
assert verdict(None, (("fl", 1.0),)) == "unstated"
assert verdict((("fl", 1.0), ("ec", 4.0)), (("fl", 1.0), ("ec", 4.0))) == "same"
assert verdict((("fl", 0.5), ("ec", 4.5)), (("fl", 1.0), ("ec", 4.0))) == "parted"
assert perceptible((("fl", 0.5), ("ec", 4.5)), (("fl", 1.0), ("ec", 4.0))) == "parted"
assert perceptible((("fl", 0.3), ("ec", 2.7)), (("fl", 0.5), ("ec", 2.5))) == "same"
assert perceptible((("fl", 0.5),), (("fl", 0.5), ("ec", 1.0))) == "parted"
print("lib3 ok")
