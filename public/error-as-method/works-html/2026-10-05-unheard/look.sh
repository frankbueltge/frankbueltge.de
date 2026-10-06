#!/bin/sh
# One look at iteration N: render, then every channel, written to files before anything is read.
set -e
N=$1; W=/tmp/claude-0/w
python3 synth.py iterations/i$N.json $W/i$N.wav
cp $W/i$N.rows.json iterations/i$N.rows.json
ffmpeg -y -loglevel error -i $W/i$N.wav -ac 1 -b:a 64k audio/i$N-whole.mp3
python3 perceive.py S $W/i$N.wav seen/i$N-S-030-045 30 45 >/dev/null
python3 perceive.py N $W/i$N.wav 30 45 > iterations/i$N-N-out.txt
python3 blows.py $W/i$N.wav iterations/i$N-blows.json >> iterations/i$N-N-out.txt
python3 rhythm.py $W/i$N.wav 20 60 >> iterations/i$N-N-out.txt
python3 - $N <<'PY' >> iterations/i$N-N-out.txt
import json, sys
n = sys.argv[1]
b = json.load(open(f"iterations/i{n}-blows.json")); bells = [x[1] for x in b]
full = sum(1 for i in range(len(bells) - 5) if len(set(bells[i:i + 6])) == 6)
print(f"detector on my own ringing: windows of six holding all six bells {full} of {len(bells) - 5}; true blows {len(json.load(open(f'iterations/i{n}.rows.json'))['blows'])}, detected {len(bells)}")
s = [x[1] for x in b if 20 < x[0] < 60]
json.dump([s[i:i + 6] for i in range(0, len(s) - 5, 6)], open(f"iterations/i{n}-rows-detected.json", "w"))
PY
python3 perceive.py B iterations/i$N-rows-detected.json seen/i$N-B-detected.png >/dev/null
echo "rendered i$N; channels written"
