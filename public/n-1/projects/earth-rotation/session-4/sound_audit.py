"""Project 1, session 4: an audit of the study's sound, rendered offline.

Re-implements study-1/index.html's render() sample for sample (same click,
same 110 Hz hum for shorter days, same 55 Hz thud for leap seconds, same
tanh limiter) from the same committed series, and measures what it produces,
so that the page's description of its sound ("slow clicks for long days, a
rising whine as the days approach 86,400 s") is checked against the signal
rather than against intention. Needs numpy (verification only; the page does
not). Run from the repository root:
    python3 projects/earth-rotation/session-4/sound_audit.py
Writes sound_audit.txt beside this file.
"""
import csv, math, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = "material/earth-rotation/2026-09-25-session-2/bulletin-a-ut1.csv"
rows = list(csv.DictReader(open(SRC)))
lod, ut1 = [], []
for i, r in enumerate(rows):
    if i == 0 or r["lod_excess_ms"] == "":
        continue
    lod.append(round(float(r["lod_excess_ms"]) * 10000))   # as the page stores it
    ut1.append(float(r["ut1_minus_utc_s"]))
leaps = [k for k in range(1, len(ut1)) if abs(ut1[k] - ut1[k - 1]) > 0.5]
# the page finds leaps against the previous *row*; with contiguous rows that is k-1
n = len(lod)
start = np.zeros(n + 1)
t = 0.0
for k in range(n):
    start[k] = t
    t += abs(lod[k]) / 1e7
start[n] = t
TOTAL = t

out = []
# the click as each page writes it (study-1: sign alternating sample to sample;
# the work, session 4: the same decay without the alternation)
CLICKS = [("study-1/index.html (session 3)", True),
          ("works/the-days-end-to-end/index.html (session 4)", False)]
for label, alternating in CLICKS:
    c = np.array([0.32 * math.exp(-j / 3) * ((-1 if j % 2 else 1) if alternating else 1) for j in range(14)])
    N = 8192
    for sr in (44100, 48000):
        H = np.abs(np.fft.rfft(c, N)) ** 2
        f = np.fft.rfftfreq(N, 1 / sr)
        tot = H.sum()
        out.append(f"click of {label} at {sr} Hz: energy below 5 kHz {100*H[f<5000].sum()/tot:.1f} %, "
                   f"5-16 kHz {100*H[(f>=5000)&(f<16000)].sum()/tot:.1f} %, above 16 kHz {100*H[f>=16000].sum()/tot:.1f} %")
out.append("")
for sr, alternating in ((44100, True), (48000, True), (48000, False)):
    L = math.ceil((TOTAL + 1) * sr)
    a = np.zeros(L)
    click = np.array([0.32 * math.exp(-j / 3) * ((-1 if j % 2 else 1) if alternating else 1) for j in range(14)])
    s0s = np.floor(start[:n] * sr).astype(int)
    for s0 in s0s:
        a[s0:s0 + 14] += click
    for k in range(n):
        if lod[k] < 0:
            s0, s1 = s0s[k], int(math.floor(start[k + 1] * sr))
            s = np.arange(s0, s1)
            a[s0:s1] += 0.1 * np.sin(2 * math.pi * 110 * s / sr)
    q = np.arange(int(sr * 0.6))
    thud = 0.5 * np.exp(-q / (sr * 0.15)) * np.sin(2 * math.pi * 55 * q / sr)
    for k in leaps:
        s0 = s0s[k]
        m = min(len(q), L - s0)
        a[s0:s0 + m] += thud[:m]
    raw = a.copy()
    a = np.tanh(a * 1.4) * 0.8

    out.append(f"== {'study-1 click' if alternating else 'work click'}, sample rate {sr} Hz: {L} samples, {L/sr:.3f} s (the axis {TOTAL:.3f} s + 1 s tail)")
    same = np.bincount(s0s)
    out.append(f"days whose click starts on a sample another day's click also starts on: "
               f"{int((same[same > 1]).sum())} of {n}; most on one sample: {int(same.max())}")
    ov = int(np.sum(np.diff(s0s) < 14))
    out.append(f"clicks that begin before the previous click (14 samples) has ended: {ov} of {n - 1}")
    sat = np.abs(raw * 1.4) > 1.5          # tanh(1.5) = 0.905: deep in the limiter
    out.append(f"samples driven deep into the limiter (|1.4 x sum| > 1.5): {int(sat.sum())} "
               f"({100*sat.sum()/L:.2f} % of the signal)")
    # per-second profile: predicted click rate vs measured
    out.append("second | days | median click interval (ms) -> click rate (Hz) | RMS | share of samples deep in the limiter | spectral centroid (Hz)")
    for sec in range(int(math.ceil(TOTAL))):
        lo, hi = sec * sr, min(L, (sec + 1) * sr)
        ks = [k for k in range(n) if sec <= start[k] < sec + 1]
        if not ks:
            continue
        iv = np.median([abs(lod[k]) / 1e4 for k in ks])
        seg = a[lo:hi]
        spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
        f = np.fft.rfftfreq(len(seg), 1 / sr)
        cen = float((spec * f).sum() / spec.sum())
        rate = (1000 / iv) if iv > 0 else float('inf')
        out.append(f"{sec:5d}  | {len(ks):5d} | {iv:6.3f} -> {rate:9.0f} | {np.sqrt((seg**2).mean()):.3f} | "
                   f"{100*sat[lo:hi].mean():5.1f} % | {cen:7.0f}")
    out.append("")
open(os.path.join(HERE, "sound_audit.txt"), "w").write("\n".join(out) + "\n")
print("\n".join(out))
