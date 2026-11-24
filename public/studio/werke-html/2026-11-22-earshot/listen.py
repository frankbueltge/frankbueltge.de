"""EARSHOT: a machine listener stands on both sides of the wall.

State 3 (the check, session 262): the listener hears the page's own sound. render_page.mjs runs the page's audio graph
offline for every voice, inside its room and through its wall, and writes WAV files; with --rendered this script hears
those instead of ffmpeg's stand-in filters, keeps the word times of what it heard (heard.js, read by the page's
"a machine's ear"), and keeps the state-1 totals beside the new ones.

For every voice, an open speech recogniser hears the passage as it is said inside its room (the voice as
rendered) and through the wall (two low-pass filters at 340 Hz, as the page's wall path; the page's Web Audio
filters take their resonance in decibels, 0.6 dB, which is a quality factor of about 1.07, used here in
ffmpeg's biquad). It counts how many of the passage's words it recovers, in order. State 1 measures with
ffmpeg's filters as a stand-in for the browser's; the check of session 3 renders the page's own audio graph.

Run with the same Python as build.py, after it:   python3 listen.py --cache <scratch dir>
Writes listen.json.
"""
import argparse, json, os, re, subprocess
import numpy as np
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
WALL = "lowpass=f=340:width_type=q:width=1.07,lowpass=f=340:width_type=q:width=1.07"


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


NUM = {"24": "twentyfour", "72": "seventytwo", "15": "fifteen", "30": "thirty", "12000000": "twelvemillion"}


def recovered(ref, hyp):
    """Words of the passage the listener heard, matched in order (longest common subsequence)."""
    a = [norm(w) for w in ref if norm(w)]
    b = []
    for w in hyp:
        n = norm(w)
        b.append(NUM.get(n, n))
    a = [NUM.get(x, x.replace("-", "")) for x in a]
    m, n = len(a), len(b)
    L = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            L[i + 1][j + 1] = L[i][j] + 1 if a[i] == b[j] else max(L[i][j + 1], L[i + 1][j])
    return L[m][n], m


def hear_words(model, path):
    """The rendered file, level restored as a person would turn the volume up; words with their times."""
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.float32)
    audio = audio * (0.9 / (float(np.max(np.abs(audio))) or 1.0))
    segs, _ = model.transcribe(audio, language="en", beam_size=5, vad_filter=False, word_timestamps=True)
    words = []
    for seg in segs:
        for w in seg.words:
            words.append([w.word.strip(), round(float(w.start), 2), round(float(w.end), 2)])
    return words


def rendered(args, model):
    src = open(os.path.join(HERE, "data.js")).read()
    data = json.loads(src[src.index("{"):src.rindex("}") + 1])
    items = [(s["id"], s["quote"], "signal") for s in data["signals"]]
    items += [(e["vid"], e["show"], "record") for c in data["cases"] for e in c["events"] if e.get("vid")]
    before = json.load(open(os.path.join(HERE, "listen.json")))
    state1 = before.get("state1") or {k: before[k] for k in ("what", "recogniser", "wall", "words", "near", "wall_words")}
    only = set(args.only.split(",")) if args.only else None
    kept = {r["id"]: r for r in before.get("rows", [])} if only else {}
    hj = open(os.path.join(HERE, "heard.js")).read() if only else ""
    kept_heard = json.loads(hj[hj.index("{"):hj.rindex("}") + 1])["rows"] if only else {}
    rows, heard = [], {}
    for vid, ref, kind in items:
        if only and vid not in only:  # state 4: what was heard before stays as it was heard
            rows.append(kept[vid]); heard[vid] = kept_heard[vid]
            continue
        near = hear_words(model, os.path.join(args.rendered, vid + ".near.wav"))
        wall = hear_words(model, os.path.join(args.rendered, vid + ".wall.wav"))
        rn, m = recovered(ref.split(), [w[0] for w in near])
        rw, _ = recovered(ref.split(), [w[0] for w in wall])
        rows.append({"id": vid, "kind": kind, "words": m, "near": rn, "wall": rw,
                     "heard_near": " ".join(w[0] for w in near), "heard_wall": " ".join(w[0] for w in wall)})
        heard[vid] = {"near": near, "wall": wall}
        print(vid, m, rn, rw, "|", rows[-1]["heard_wall"][:70], flush=True)
    sig = [r for r in rows if r["kind"] == "signal"]
    out = {
        "what": "Words of each passage an open speech recogniser recovered, in order, from the page's own sound: inside the "
                "room and through the wall (state 3, session 262; the escape's six sentences from the maker's report heard in "
                "state 4, session 263, the rows before kept as heard)",
        "recogniser": "Whisper base.en (open weights, MIT), run with faster-whisper 1.2.1, int8 on CPU, beam 5, word timestamps",
        "wall": "the page's own audio graph (earshot.js, renderOffline), run offline in headless Chromium by render_page.mjs: "
                "the listener in the voice's room, or on the other side of its wall (in the street; for a voice of the "
                "street, in the Commission's room); then the level restored to a peak of 0.9",
        "words": sum(r["words"] for r in sig), "near": sum(r["near"] for r in sig), "wall_words": sum(r["wall"] for r in sig),
        "record_words": sum(r["words"] for r in rows if r["kind"] == "record"),
        "record_near": sum(r["near"] for r in rows if r["kind"] == "record"),
        "record_wall": sum(r["wall"] for r in rows if r["kind"] == "record"),
        "rows": rows, "state1": state1,
    }
    with open(os.path.join(HERE, "listen.json"), "w") as f:
        json.dump(out, f, indent=1)
    with open(os.path.join(HERE, "heard.js"), "w") as f:
        f.write("// EARSHOT: what an open recogniser heard of the page's own sound, inside and through the wall (listen.py)\n")
        f.write("window.EARSHOT_HEARD = " + json.dumps({"rows": heard}, separators=(",", ":")) + ";\n")
    print("signals: words", out["words"], "near", out["near"], "wall", out["wall_words"],
          "| record: words", out["record_words"], "near", out["record_near"], "wall", out["record_wall"])


def hear(model, path, af=None):
    cmd = ["ffmpeg", "-v", "quiet", "-i", path]
    if af:
        cmd += ["-af", af]
    cmd += ["-f", "f32le", "-ac", "1", "-ar", "16000", "-"]
    audio = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    if af:  # the wall takes level too; the listener gets the level back, as a person would turn up the volume
        peak = float(np.max(np.abs(audio))) or 1.0
        audio = audio * (0.9 / peak)
    segs, _ = model.transcribe(audio, language="en", beam_size=5, vad_filter=False)
    return " ".join(s.text.strip() for s in segs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--rendered", default="", help="the folder render_page.mjs wrote (state 3)")
    ap.add_argument("--only", default="", help="state 4: hear only these ids (comma list) and keep every other row")
    args = ap.parse_args()
    model = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=os.path.join(args.cache, "asr"))
    if args.rendered:
        return rendered(args, model)
    src = open(os.path.join(HERE, "data.js")).read()
    data = json.loads(src[src.index("{"):src.rindex("}") + 1])
    rows = []
    for s in data["signals"]:
        mp3 = os.path.join(HERE, "audio", s["id"] + ".mp3")
        ref = s["quote"].split()
        near = hear(model, mp3)
        wall = hear(model, mp3, WALL)
        rn, m = recovered(ref, near.split())
        rw, _ = recovered(ref, wall.split())
        rows.append({"id": s["id"], "words": m, "near": rn, "wall": rw, "heard_near": near, "heard_wall": wall})
        print(s["id"], m, rn, rw, "|", wall[:80], flush=True)
    tot = sum(r["words"] for r in rows)
    out = {
        "what": "Words of each passage an open speech recogniser recovered, in order, inside the room and through the wall",
        "recogniser": "Whisper base.en (open weights, MIT), run with faster-whisper 1.2.1, int8 on CPU, beam 5",
        "wall": "ffmpeg " + WALL + ", then the level restored to a peak of 0.9",
        "words": tot, "near": sum(r["near"] for r in rows), "wall_words": sum(r["wall"] for r in rows),
        "rows": rows,
    }
    with open(os.path.join(HERE, "listen.json"), "w") as f:
        json.dump(out, f, indent=1)
    print("words", tot, "near", out["near"], "wall", out["wall_words"])


if __name__ == "__main__":
    main()
