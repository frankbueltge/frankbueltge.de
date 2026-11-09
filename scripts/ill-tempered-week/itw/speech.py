"""Speech as material: pitch (YIN), syllables counted from the voice's own phonemes, the spoken pitch of each."""
import numpy as np
from scipy.signal import resample_poly

from .base import SR, kokoro

FRAME, HOP = 640, 160     # YIN at 16 kHz: 40 ms frames, 10 ms hop
VOWELS = {'ɨ', 'ʌ', 'ɐ', 'i', 'a', 'ɔ', 'æ', 'u', 'ɪ', 'o', 'ʊ', 'ʉ', 'ɵ', 'ə', 'ɜ', 'e', 'ɛ', 'ɘ', 'ɑ', 'ᵻ', 'ɤ', 'ø', 'ɚ', 'œ', 'ɒ', 'y', 'ɝ', 'ʏ'}
DIPHTHONGS = {'aɪ', 'aʊ', 'ɪə', 'oʊ', 'eɪ', 'eə', 'ɔɪ', 'əʊ', 'ʊə'}
MIN_NUCLEUS = 9        # frames of 10 ms between two syllable nuclei


def yin(x: np.ndarray, sr: int = 16000, fmin: float = 70, fmax: float = 450, frame: int = FRAME, hop: int = HOP,
        thresh: float = 0.25, gate: float = 0.06) -> tuple[np.ndarray, np.ndarray]:
    """f0 per hop (0 where unvoiced), and the frame centres in seconds."""
    tau_min, tau_max = int(sr / fmax), int(sr / fmin)
    x = np.pad(x, (0, frame + tau_max))
    n = 1 + max(0, (len(x) - frame - tau_max) // hop)
    f0 = np.zeros(n)
    times = (np.arange(n) * hop + frame / 2) / sr
    rms_all = np.sqrt(np.mean(x ** 2)) + 1e-12
    for i in range(n):
        seg = x[i * hop:i * hop + frame + tau_max]
        w = seg[:frame]
        if np.sqrt(np.mean(w ** 2)) < gate * rms_all:
            continue
        cs = np.concatenate([[0.0], np.cumsum(seg ** 2)])
        c = np.correlate(seg, w, mode='valid')
        d = cs[frame] + (cs[frame:frame + tau_max + 1] - cs[:tau_max + 1]) - 2 * c
        d[0] = 0.0
        cmnd = np.ones_like(d)
        cmnd[1:] = d[1:] * np.arange(1, len(d)) / np.maximum(np.cumsum(d[1:]), 1e-12)
        below = np.where(cmnd[tau_min:] < thresh)[0]
        if not len(below):
            continue
        t = tau_min + below[0]
        while t + 1 < len(cmnd) and cmnd[t + 1] < cmnd[t]:
            t += 1
        shift = 0.0
        if 1 <= t < len(cmnd) - 1:
            a, b, cc = cmnd[t - 1], cmnd[t], cmnd[t + 1]
            if a - 2 * b + cc != 0:
                shift = 0.5 * (a - cc) / (a - 2 * b + cc)
        f0[i] = sr / (t + shift)
    return f0, times


def syllable_count(text: str, lang: str) -> int:
    """How many syllables the voice will speak: vowel nuclei in Kokoro's own phonemes (espeak-ng), a
    diphthong counting once, a stress mark or a consonant between two vowels counting twice."""
    ph = kokoro().tokenizer.phonemize(text, lang)
    count, prev = 0, ''
    for ch in ph:
        if ch == 'ː':
            continue
        if ch in VOWELS:
            if prev and prev + ch in DIPHTHONGS:
                prev = ''
                continue
            count += 1
            prev = ch
        else:
            prev = ''
    return max(1, count)


def loudness(x: np.ndarray, n_frames: int, hop: int = HOP, centre: int = FRAME // 2, win: int = 320) -> np.ndarray:
    env = np.full(n_frames, -120.0)
    for i in range(n_frames):
        c = i * hop + centre
        w = x[max(0, c - win // 2):c + win // 2]
        if len(w):
            env[i] = 10 * np.log10(np.mean(w ** 2) + 1e-12)
    return np.convolve(env, np.ones(3) / 3, mode='same')


def nuclei(env: np.ndarray, voiced: np.ndarray, k: int) -> list[int]:
    """The k syllable nuclei: voiced loudness peaks, the most prominent first, at least MIN_NUCLEUS apart."""
    peaks = [i for i in range(1, len(env) - 1) if voiced[i] and env[i] >= env[i - 1] and env[i] > env[i + 1]]
    def prominence(i: int) -> float:
        return env[i] - max(env[max(0, i - 15):i + 1].min(), env[i:i + 16].min())
    for spacing in (MIN_NUCLEUS, MIN_NUCLEUS // 2):
        chosen: list[int] = []
        for i in sorted(peaks, key=lambda i: (-prominence(i), i)):
            if len(chosen) == k:
                break
            if all(abs(i - c) >= spacing for c in chosen):
                chosen.append(i)
        if len(chosen) == k:
            break
    return sorted(chosen)


def syllables(speech: np.ndarray, count: int) -> list[dict]:
    """The part cut into its syllables: start and end in samples, median spoken Hz, the f0 track."""
    low = resample_poly(speech, 1, 3)                       # 48 kHz -> 16 kHz for the pitch tracker
    f0, times = yin(low)
    env = loudness(np.pad(low, (0, 2048)), len(f0))
    peaks = nuclei(env, f0 > 0, count) or [int(np.argmax(env))]
    count = len(peaks)
    edges = [0] + [q + int(np.argmin(env[q:p + 1])) for q, p in zip(peaks, peaks[1:])] + [len(f0)]
    n, out = len(speech), []
    for k in range(count):
        a, b = edges[k], edges[k + 1]
        hz = f0[a:b][f0[a:b] > 0]
        out.append({'a': 0 if k == 0 else int(times[a] * SR), 'b': n if k == count - 1 else int(times[b] * SR),
                    'hz': float(np.median(hz)) if len(hz) else 0.0,
                    'track': [(float(times[i]), float(f0[i])) for i in range(a, b) if f0[i] > 0]})
    for k, s in enumerate(out):                             # an unvoiced syllable takes its neighbour's pitch
        if s['hz'] == 0.0:
            near = [t['hz'] for t in out[k - 1::-1] + out[k + 1:] if t['hz'] > 0] if k else [t['hz'] for t in out if t['hz'] > 0]
            s['hz'] = near[0] if near else 0.0
    return out


def syllable_pitches(raw: np.ndarray, count: int) -> list[dict]:
    syl = syllables(raw, count)
    if len(syl) >= 0.6 * count:
        return [{'t': s['a'] / SR, 'hz': s['hz']} for s in syl]
    f0, times = yin(resample_poly(raw, 1, 3))
    voiced = np.where(f0 > 0)[0]
    if len(voiced) < count:
        return [{'t': s['a'] / SR, 'hz': s['hz']} for s in syl]
    edges = np.linspace(voiced[0], voiced[-1] + 1, count + 1).astype(int)
    out = []
    for a, b in zip(edges, edges[1:]):
        hz = f0[a:b][f0[a:b] > 0]
        out.append({'t': float(times[a]), 'hz': float(np.median(hz)) if len(hz) else 0.0})
    return out

