"""the ill-tempered week: the plain tools every piece shares (paths, voices, sound helpers, writing down).

Kokoro-82M speaks (local, one thread, so a render is deterministic on a given machine); model files from
KOKORO_MODEL / KOKORO_VOICES or the usual caches. Spoken lines are cached by voice and text in ITW_TTS_CACHE.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
import onnxruntime as ort
import pedalboard as pb
import pyloudnorm
import soundfile as sf
from kokoro_onnx import Kokoro
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, resample_poly, sosfilt

SITE = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(SITE / 'scripts' / 'ducking'))
import voices  # noqa: E402  (scripts/ducking/voices.py: the house count and what a voice cannot say)

SR = 48000
CACHE = Path(os.environ.get('ITW_TTS_CACHE', Path.home() / '.cache' / 'ill-tempered-week' / 'tts'))
F0 = 55.0
HARMONIC = {'reading': 4, 'search': 5, 'news': 6, 'social': 7, 'tech': 9, 'markets': 11}
FAMILIES = list(HARMONIC)
PLATFORM_FAMILY = {'wikipedia': 'reading', 'google_trends': 'search', 'google_news': 'news', 'bluesky': 'social', 'mastodon': 'social', 'reddit': 'social', 'hackernews': 'tech', 'techmeme': 'tech', 'lobsters': 'tech', 'github': 'tech', 'github_trending': 'tech', 'pypi': 'tech', 'huggingface': 'tech', 'devto': 'tech', 'arxiv': 'tech', 'producthunt': 'tech', 'stackoverflow': 'tech', 'polymarket': 'markets', 'appstore': 'markets', 'steam': 'markets', 'coingecko': 'markets'}
TYPOGRAPHY = {8216: "'", 8217: "'", 8220: '"', 8221: '"', 8211: '-', 8212: '-', 8230: '...'}
ENGLISH = {'us': ['af_alloy', 'af_aoede', 'af_bella', 'af_heart', 'af_jessica', 'af_kore', 'af_nicole', 'af_nova', 'af_river', 'af_sarah', 'af_sky', 'am_adam', 'am_echo', 'am_eric', 'am_fenrir', 'am_liam', 'am_michael', 'am_onyx', 'am_puck'], 'gb': ['bf_alice', 'bf_emma', 'bf_isabella', 'bf_lily', 'bm_daniel', 'bm_fable', 'bm_george', 'bm_lewis']}
RECEIPTS: dict[str, str] = {}


def _model_paths() -> tuple[str, str]:
    m, v = os.environ.get('KOKORO_MODEL'), os.environ.get('KOKORO_VOICES')
    if m and v:
        return m, v
    for root in (Path.home() / '.cache' / 'hyperframes' / 'tts', Path.home() / '.cache' / 'kokoro'):
        for mm, vv in ((root / 'models' / 'kokoro-v1.0.onnx', root / 'voices' / 'voices-v1.0.bin'),
                       (root / 'kokoro-v1.0.onnx', root / 'voices-v1.0.bin')):
            if mm.exists() and vv.exists():
                return str(mm), str(vv)
    raise FileNotFoundError('Kokoro model files not found: set KOKORO_MODEL and KOKORO_VOICES')


_kokoro = None


def kokoro() -> Kokoro:
    global _kokoro
    if _kokoro is None:
        so = ort.SessionOptions()
        so.intra_op_num_threads = 1
        so.inter_op_num_threads = 1
        model, voices_bin = _model_paths()
        session = ort.InferenceSession(model, sess_options=so, providers=['CPUExecutionProvider'])
        _kokoro = Kokoro.from_session(session, voices_bin)
    return _kokoro


def load(rel: str) -> dict:
    path = SITE / rel
    RECEIPTS[rel] = hashlib.sha256(path.read_bytes()).hexdigest()
    return json.loads(path.read_text())


def seed(*parts: str) -> int:
    return int(hashlib.sha1('|'.join(parts).encode()).hexdigest()[:8], 16)


def family_of(publisher: str) -> str:
    return PLATFORM_FAMILY.get(publisher, 'news')


def hz_of(family: str, octave_shift: int = 0) -> float:
    return F0 * HARMONIC[family] * 2 ** octave_shift


def saw(f: float, n: int, detune_cents: float = 0.0, phase: float = 0.0) -> np.ndarray:
    """Band-limited saw by summing harmonics below the Nyquist margin."""
    f = f * 2 ** (detune_cents / 1200)
    t = np.arange(n) / SR
    k_max = max(1, int(0.45 * SR / f))
    y = np.zeros(n)
    for k in range(1, min(k_max, 60) + 1):
        y += np.sin(2 * np.pi * f * k * t + phase * k) / k
    return y * (2 / np.pi)


def carrier(freqs: list[float], n: int, rng: np.random.Generator) -> np.ndarray:
    y = np.zeros(n)
    for i, f in enumerate(freqs):
        for c in (-7.0, 0.0, 7.0):
            y += saw(f, n, c, phase=0.37 * i + c / 10)
    y /= max(1, len(freqs)) * 3
    noise = sosfilt(butter(2, 3500, 'highpass', fs=SR, output='sos'), rng.standard_normal(n))
    y = y + 0.18 * noise
    lad = pb.LadderFilter(mode=pb.LadderFilter.Mode.LPF24, cutoff_hz=7000, resonance=0.15)
    return lad(y.astype(np.float32)[None, :], SR)[0].astype(np.float64)


BANDS = np.geomspace(90, 9000, 30)


def vocode(modulator: np.ndarray, carrier_sig: np.ndarray) -> np.ndarray:
    n = min(len(modulator), len(carrier_sig))
    m, c = modulator[:n], carrier_sig[:n]
    env_lp = butter(2, 45, fs=SR, output='sos')
    out = np.zeros(n)
    for fc in BANDS:
        lo, hi = fc / 2 ** (1 / 6), fc * 2 ** (1 / 6)
        sos = butter(2, (lo, min(hi, 0.45 * SR)), 'bandpass', fs=SR, output='sos')
        env = sosfilt(env_lp, np.abs(sosfilt(sos, m)))
        out += sosfilt(sos, c) * np.maximum(env, 0)
    return out / max(1e-9, np.abs(out).max())


def fade(x: np.ndarray, a_s: float, r_s: float) -> np.ndarray:
    a, r = max(1, int(a_s * SR)), max(1, int(r_s * SR))
    x = x.copy()
    x[:a] *= np.linspace(0, 1, a)
    x[-r:] *= np.linspace(1, 0, r)
    return x


def fold(text: str) -> str:
    return unicodedata.normalize('NFKD', text.translate(TYPOGRAPHY)).encode('ascii', 'ignore').decode()


def speak_as(text: str, voice: str, lang: str, speed: float = 0.92) -> np.ndarray:
    """Kokoro in a given voice, cached like render04.speak (same file names for the same voice and text)."""
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f'{voice}-{hashlib.sha1(text.encode()).hexdigest()[:12]}.wav'
    if speed != 0.92:
        path = path.with_name(path.stem + f'-s{speed:g}.wav')
    if not path.exists():
        samples, rate = kokoro().create(text, voice=voice, speed=speed, lang=lang)
        sf.write(path, samples, rate, subtype='FLOAT')
    x, rate = sf.read(path, dtype='float64')
    g = np.gcd(SR, rate)
    x = resample_poly(x, SR // g, rate // g) if rate != SR else x
    return x / max(1e-9, np.abs(x).max())


def speak(text: str, voice: str, speed: float = 0.92) -> np.ndarray:
    """Kokoro, local, cached (hookline.speak_as): mono at 48 kHz, peak 1, edges trimmed."""
    x = speak_as(fold(text), voice, voices.lang_of(voice), speed)
    a = np.abs(x)
    on = np.where(a > 0.01)[0]
    return x[max(0, on[0] - 240):on[-1] + 480] if len(on) else x


def voice_for(key: str, region: str = 'us') -> str:
    pool = ENGLISH[region]
    return pool[seed(key) % len(pool)]


def speakable(text: str) -> bool:
    return any(ch.isalpha() for ch in text) and not voices.UNSAYABLE.search(text) and not voices.unsayable_script(text)


def place(buf: np.ndarray, at: int, sig: np.ndarray) -> None:
    if at >= buf.shape[-1] or at < 0:
        return
    m = min(sig.shape[-1], buf.shape[-1] - at)
    buf[..., at:at + m] += sig[..., :m]


def true_peak(x: np.ndarray) -> float:
    return float(np.abs(resample_poly(x, 4, 1, axis=1)).max())


def level(x: np.ndarray, lufs: float | None, ceiling_dbtp: float = -1.0) -> np.ndarray:
    """Set a form's own loudness (None leaves the level as composed), then keep true peaks under the
    ceiling with a 4 ms look-ahead gain (render04.master's limiter, without its fixed -14 LUFS)."""
    if lufs is not None:
        L = pyloudnorm.Meter(SR).integrated_loudness(x.T)
        if np.isfinite(L):
            x = x * 10 ** ((lufs - L) / 20)
    ceiling = 10 ** ((ceiling_dbtp - 0.1) / 20)
    over = np.abs(resample_poly(x, 4, 1, axis=1)).max(axis=0)[:4 * x.shape[1]].reshape(-1, 4).max(axis=1)
    need = np.minimum(1.0, ceiling / np.maximum(over, 1e-12))
    look = int(0.004 * SR)
    x = x * uniform_filter1d(minimum_filter1d(need, size=2 * look + 1), size=look + 1)
    tp = true_peak(x)
    return x * (ceiling / tp) if tp > ceiling else x


def encode(wav: Path, m4a: Path, kbps: int = 128) -> None:
    """AAC: afconvert on a Mac, ffmpeg anywhere else. Both put the index (moov) before the audio, so a browser can
    start playing and seek before the whole file has arrived; ffmpeg does that only when told to (faststart)."""
    if shutil.which('afconvert'):
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(kbps * 1000), str(wav), str(m4a)], check=True)
    else:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', f'{kbps}k',
                        '-movflags', '+faststart', str(m4a)], check=True)


def digest(x: np.ndarray) -> str:
    return hashlib.sha256(np.ascontiguousarray(x, dtype=np.float32).tobytes()).hexdigest()
