#!/bin/sh
# Run every carried instrument on the adapted month. Outputs go to seen/, unlooked, and are committed
# before any reading is written. Instruments run from inside their own folders, unchanged.
set -e
H=$(pwd); export NODE_PATH=${NODE_PATH:-/opt/node22/lib/node_modules}
cd carried/ear
python3 perceive.py S month.wav "$H/seen/ear-S" > /dev/null
python3 perceive.py N month.wav > "$H/seen/ear-N.txt"
for w in "0 61" "0 15" "15 30" "30 45" "45 61"; do python3 rhythm.py month.wav $w; done > "$H/seen/ear-rhythm.txt"
cd "$H/carried/mould"; node render.js 3-floor-map.js "$H/seen/mould.png"
cd "$H/carried/grid24"; for i in $(seq 0 23); do node render.js $i "$H/seen/grid24-V$(printf %02d $i).png" none.js; done
echo done
