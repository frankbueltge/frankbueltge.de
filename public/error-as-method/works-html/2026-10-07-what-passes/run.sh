#!/bin/sh
# Runs the carried ear, unchanged, on each adapter's WAV. Outputs go to seen/ and are committed
# before any of them is opened. The reading order is drawn by order.py (seed 110).
set -e
cd "$(dirname "$0")"
for a in A1 A2 A3 A4 A5 A6; do
  python3 carried/perceive.py S out/$a.wav seen/$a-S
  python3 carried/perceive.py N out/$a.wav > seen/$a-N.txt
  d=$(python3 -c "import wave;w=wave.open('out/$a.wav');print(w.getnframes()/w.getframerate())")
  (cd carried && python3 rhythm.py ../out/$a.wav 0 "$d") > seen/$a-rhythm.txt
done
