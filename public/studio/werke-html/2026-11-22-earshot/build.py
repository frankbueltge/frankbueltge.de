"""EARSHOT: build the data and the voices.

Reads the Field's study 90 (51 signals that eleven public instruments set up, each with the passage that sets
it, its receiver and its clock), places every signal in the room of the receiver it is addressed to, sets it on
the work's clock, has each passage read aloud by an open speech model running offline, finds when each word is
spoken with an open speech recogniser, and writes data.js and audio/<id>.mp3.

State 2 adds the Field's study 91: whether each signal was due and has left a public trace, and the two dated cases
of a machine acting on its own, each event with its date and the passage that dates it. The voices of the cases
read those passages (case_voices.json, audio/<case>-<event>.mp3).

Run from this folder with a Python that has kokoro-onnx, soundfile and faster-whisper (see README.md):
    python3 build.py --models <dir with kokoro-v1.0.onnx and voices-v1.0.bin> --cache <scratch dir>
Without --voices / --case-voices it reuses the audio and timings already written and only rebuilds data.js.
"""
import argparse, hashlib, json, os, re, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FIELD_COMMIT = "b6fd73a4b4b86b09ab4809957b0dae5758ed440e"
SIGNALS_URL = ("https://raw.githubusercontent.com/frankbueltge/field-research/" + FIELD_COMMIT +
               "/artifacts/cycle-018/told-in-time/signals90.json")
RESULTS_URL = SIGNALS_URL.replace("signals90.json", "results90.json")
SIGNALS_SHA = "87a91da00ebc629052fa74ab688c4a064439422ee2757f294b4db07484639d25"
# State 2: the Field's study 91, at the commit of its state 2: for each signal whether it was due and has left a
# public trace by 2026-11-22, and the two dated cases of a machine acting on its own, every date with its passage.
MOVED_COMMIT = "562ae7043fc4043c3bed92cc8845d187e8a9645a"
MOVED_URL = ("https://raw.githubusercontent.com/frankbueltge/field-research/" + MOVED_COMMIT +
             "/artifacts/cycle-018/told-in-time/moved91.json")
MOVED_SHA = "1ad84d1f60e36d6f26e73bd3d6a163af956893f9afb98861e252d8e5b955a59e"
RECORD_DATE = "2026-11-22"  # the day the Field searched; the record runs to here and no further

# One voice per instrument, all from the open model's English voices.
VOICE = {
    "eu-act": "bf_emma", "eu-code": "bf_isabella", "korea": "am_michael", "sb53": "af_sarah",
    "china": "am_eric", "asean": "af_nicole", "haip": "bm_george", "paris": "bf_alice",
    "raise": "af_jessica", "bis": "am_adam", "gpa": "bm_lewis",
}

# The rooms: one for the public (the street), one for each public body the texts name, one for the other
# parties, one for the maker's own record. A signal stands in the room of the receiver that reads it first.
ROOMS = [
    {"id": "maker", "name": "The maker’s own record", "sub": "kept by the developer itself"},
    {"id": "others", "name": "Other parties", "sub": "downstream providers, deployers, other developers"},
    {"id": "eu", "name": "European Commission · AI Office", "sub": "European Union"},
    {"id": "oes", "name": "Office of Emergency Services", "sub": "California"},
    {"id": "ag", "name": "Attorney General", "sub": "California, or a federal authority"},
    {"id": "dfs", "name": "Office in the Department of Financial Services", "sub": "New York"},
    {"id": "kr", "name": "Minister of Science and ICT", "sub": "Republic of Korea"},
    {"id": "bis", "name": "Bureau of Industry and Security", "sub": "United States"},
    {"id": "authority", "name": "An authority, within a day", "sub": "law enforcement or public safety"},
    {"id": "gov", "name": "Governments and companies", "sub": "under the Paris Call"},
    {"id": "street", "name": "The street", "sub": "the public: anyone"},
]
BODY_ROOM = {
    "European Commission": "eu", "AI Office": "eu", "Minister of Science and ICT": "kr",
    "Office of Emergency Services": "oes", "Attorney General or a federal authority": "ag",
    "an appropriate authority (law enforcement or public safety)": "authority",
    "office in the Department of Financial Services": "dfs", "Bureau of Industry and Security": "bis",
    "governments and other companies": "gov",
}


def room_of(s):
    r = s["receiver"]
    if r == "public":
        return "street"
    if r == "other party":
        return "others"
    if r == "own record":
        return "maker"
    if s["receiver_name"] in BODY_ROOM:
        return BODY_ROOM[s["receiver_name"]]
    if s["id"] == "PC4":  # Paris Call: channels for whistleblowers that policy makers offer; no body named
        return "gov"
    raise SystemExit("no room for " + s["id"])


# The work's clock. Hours run from the deed (0). "before" signals sound in the prelude, at the model's
# release, in this order; "deed" signals are the records the maker keeps from the moment of the deed;
# "at" signals sound once at the latest hour their own spoken passage allows, counted (best case) from the
# moment the deed is known, which here is the moment it happens; "every" signals recur on their schedule;
# everything else has no hour in its text and does not sound on the clock.
BEFORE = ["CN3", "EU1", "KR1", "COP2", "NY7", "EU3", "AS2", "CN4", "BIS2", "GPA3", "CA2", "NY2", "G7-2",
          "CN8", "PC2", "COP1", "CA1", "NY1", "G7-4", "PC1", "CN5"]
DEED = ["CN6", "GPA1", "CN7", "PC5"]
# the hour each passage names for itself
AT = {"CA5": 24, "NY5": 24, "NY4": 72, "COP3": 120, "CA4": 360}
EVERY = {"BIS1": 792, "CA3": 2190, "NY3": 2190, "BIS3": 9840}
# The yearly reports of California's office and attorney general and of New York's office publish only
# anonymised, aggregated figures (the Field's codes, "aggregate only"). The work sounds them once, in the
# street, as one murmur of the passages they gather, at a year: its own placement of "a yearly report".
MURMUR = ["CA4", "CA6", "CA7", "NY4", "NY6"]
MURMUR_H = 8760
RETENTION_END = {"CN6": 4380}  # "retained for at least six months": guaranteed to here, not beyond
RUN_END_H = 17520  # two years

# ---------- state 2: the cases on record ----------
# Who speaks, and where. Only events that were public on their day are spoken in the street. An event inside the
# maker's own record is spoken there, behind the wall. Events that happened but were not public that day (the deed,
# a moderator, the harmed party's detection) are not spoken: a caption, and for the deed its sound. Each voice says
# its source's passage as the Field quoted it; "say" is only how a code or a sign is read aloud.
CASE_VOICE = {
    "researchers": "af_heart", "press": "am_liam", "commission": "bm_daniel", "maker": "am_onyx",
    "harmed": "af_river", "office": "af_kore", "foundation": "af_nova",
}
CASE_PLAN = {
    ("wiki", "began"): {"kind": "deed"},
    ("wiki", "noticed"): {"kind": "silent", "place": "street"},
    ("wiki", "ended"): {"kind": "deed_end"},
    ("wiki", "first_public"): {"kind": "voice", "place": "street", "speaker": "researchers",
                               "who": "outside researchers", "say": lambda q: q.replace("~18,000", "about 18,000")},
    ("wiki", "maker_public"): {"kind": "voice", "place": "street", "speaker": "press", "who": "the press, on the maker"},
    ("wiki", "body"): {"kind": "voice", "place": "street", "speaker": "commission", "pan": "eu",
                       "who": "the European Commission\u2019s spokesperson", "wake": {"room": "eu", "signal": "EU4"}},
    ("escape", "precursor"): {"kind": "voice", "place": "maker", "speaker": "maker", "who": "the maker\u2019s own record"},
    ("escape", "began"): {"kind": "deed"},
    ("escape", "noticed"): {"kind": "silent", "place": "street"},
    ("escape", "ended"): {"kind": "deed_end"},
    ("escape", "first_public"): {"kind": "voice", "place": "street", "speaker": "harmed", "who": "the model hub, the harmed party"},
    ("escape", "maker_knew"): {"kind": "voice", "place": "maker", "speaker": "maker", "who": "the maker\u2019s own record",
                               "knew": True},
    ("escape", "maker_public"): {"kind": "voice", "place": "street", "speaker": "maker", "who": "the maker"},
    # the office's own words are the ones inside the reporter's quotation marks
    ("escape", "body"): {"kind": "voice", "place": "street", "speaker": "office", "pan": "oes", "show": "quoted",
                         "who": "California\u2019s Office of Emergency Services, at an Assembly hearing"},
    ("escape", "report_sent"): {"kind": "voice", "place": "oes", "speaker": "foundation", "walk": True,
                                "wake": {"room": "oes", "signal": "CA6"},
                                "who": "a foundation, through the office\u2019s channel for the public",
                                "say": lambda q: q.replace("Cal OES", "Cal O.E.S.").replace(
                                    "P-20260913-00001", "P, 2 0 2 6 0 9 1 3, 0 0 0 0 1")},
    ("escape", "maker_scope"): {"kind": "voice", "place": "oes", "speaker": "maker", "echo": "street",
                                "who": "the maker\u2019s quarterly summary to the office, also on its own site"},
}
# The five hours the paper names for an event, counted from when the reporter learns of it. On record they are
# placed from the first day the maker's own record says it knew; where that day is not on record, they are not placed.
PAPER_HOURS = [24, 72, 120, 360]


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def norm(w):
    w = w.lower().replace("’", "'")
    return re.sub(r"[^a-z0-9']", "", w)


def align(quote_words, asr_words):
    """Give each word of the passage a start and end time from the recogniser's words.
    Words are matched in order by a minimum-cost alignment; a passage word the recogniser heard
    differently ("seventy-two" as "72") takes its time by interpolation between matched neighbours."""
    a = [norm(w) for w in quote_words]
    b = [norm(w["w"]) for w in asr_words]
    n, m = len(a), len(b)
    INF = 10 ** 9
    D = [[INF] * (m + 1) for _ in range(n + 1)]
    P = [[None] * (m + 1) for _ in range(n + 1)]
    D[0][0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            if D[i][j] == INF:
                continue
            if i < n and j < m:
                c = 0 if a[i] == b[j] else 2
                if D[i][j] + c < D[i + 1][j + 1]:
                    D[i + 1][j + 1], P[i + 1][j + 1] = D[i][j] + c, (i, j, "m" if c == 0 else "s")
            if i < n and D[i][j] + 1 < D[i + 1][j]:
                D[i + 1][j], P[i + 1][j] = D[i][j] + 1, (i, j, "a")
            if j < m and D[i][j] + 1 < D[i][j + 1]:
                D[i][j + 1], P[i][j + 1] = D[i][j] + 1, (i, j, "b")
    match = [None] * n
    i, j = n, m
    while (i, j) != (0, 0):
        pi, pj, k = P[i][j]
        if k == "m":
            match[pi] = pj
        i, j = pi, pj
    times = [None] * n
    for k in range(n):
        if match[k] is not None:
            w = asr_words[match[k]]
            times[k] = [w["s"], w["e"]]
    t_end = asr_words[-1]["e"] if asr_words else 1.0
    k = 0
    while k < n:
        if times[k] is not None:
            k += 1
            continue
        j = k
        while j < n and times[j] is None:
            j += 1
        t0 = times[k - 1][1] if k > 0 else 0.0
        t1 = times[j][0] if j < n else t_end
        span = list(range(k, j))
        chars = [max(1, len(quote_words[x])) for x in span]
        tot = sum(chars)
        acc = t0
        for x, c in zip(span, chars):
            d = (t1 - t0) * c / tot
            times[x] = [round(acc, 3), round(acc + d, 3)]
            acc += d
        k = j
    matched = sum(1 for x in match if x is not None)
    return [[round(t[0], 3), round(t[1], 3)] for t in times], matched


def render_voices(signals, models, cache):
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    from faster_whisper import WhisperModel
    k = Kokoro(os.path.join(models, "kokoro-v1.0.onnx"), os.path.join(models, "voices-v1.0.bin"))
    asr = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=os.path.join(cache, "asr"))
    out = {}
    for s in signals:
        sid = s["id"]
        wav = os.path.join(cache, sid + ".wav")
        samples, sr = k.create(s["quote"], voice=VOICE[s["instrument"]], speed=0.92, lang="en-us")
        samples = np.asarray(samples, dtype=np.float32)
        peak = float(np.max(np.abs(samples))) or 1.0
        samples = samples * (0.89 / peak)
        pad = np.zeros(int(0.25 * sr), dtype=np.float32)  # a quarter second of air at each end
        samples = np.concatenate([pad, samples, pad])
        sf.write(wav, samples, sr)
        mp3 = os.path.join(HERE, "audio", sid + ".mp3")
        subprocess.run(["ffmpeg", "-v", "quiet", "-y", "-i", wav, "-ac", "1", "-ar", "24000", "-codec:a",
                        "libmp3lame", "-b:a", "48k", mp3], check=True)
        raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                             capture_output=True, check=True).stdout
        audio = np.frombuffer(raw, np.float32)
        segs, _ = asr.transcribe(audio, word_timestamps=True, language="en", beam_size=5)
        words = []
        heard = []
        for seg in segs:
            heard.append(seg.text.strip())
            for w in seg.words:
                words.append({"w": w.word.strip(), "s": float(w.start), "e": float(w.end)})
        out[sid] = {"dur": round(len(samples) / sr, 3), "asr": words, "heard": " ".join(heard)}
        print(sid, out[sid]["dur"], "s", flush=True)
    with open(os.path.join(HERE, "voices.json"), "w") as f:
        json.dump(out, f, indent=1)
    return out


def day_of(iso):
    import datetime
    return datetime.date.fromisoformat(iso).toordinal()


def show_words(plan, quote):
    if plan.get("show") == "quoted":
        m = re.search("\u201c([^\u201d]+)\u201d", quote)
        return m.group(1)
    return quote


def case_items(moved):
    """Every case event as the work places it: its hour from the deed, who speaks, where, and what is said."""
    out = []
    for c in moved["cases"]:
        d0 = day_of(c["began"])
        evs = []
        for e in c["events"]:
            plan = CASE_PLAN[(c["id"], e["key"])]
            url, quote = e["src"]
            it = {"key": e["key"], "date": e["date"], "day": day_of(e["date"]) - d0, "label": e["label"],
                  "sub": e["sub"], "note": e["note"], "public": e["public"], "src": url, "quote": quote,
                  "kind": plan["kind"], "place": plan.get("place"), "who": plan.get("who"), "pan": plan.get("pan"),
                  "wake": plan.get("wake"), "walk": bool(plan.get("walk")), "echo": plan.get("echo"),
                  "knew": bool(plan.get("knew"))}
            it["h"] = it["day"] * 24
            if plan["kind"] == "voice":
                show = show_words(plan, quote)
                say = plan["say"](show) if "say" in plan else show
                it.update({"vid": c["id"] + "-" + e["key"], "show": show, "say": say,
                           "voice": CASE_VOICE[plan["speaker"]]})
            evs.append(it)
        knew = [x for x in evs if x["knew"]]
        today = day_of(RECORD_DATE) - d0
        out.append({"id": c["id"], "name": c["name"], "signal": c["signal"], "began": c["began"],
                    "today_day": today, "today_h": today * 24, "first_reader": c["first_reader"],
                    "says_machine": c["says_machine"], "delays_days": c["delays_days"],
                    "maker_knew": c["maker_knew"], "report_sent": c.get("report_sent"),
                    "paper_from_h": knew[0]["h"] if knew else None, "events": evs})
    return out


def render_case_voices(cases, models, cache):
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    from faster_whisper import WhisperModel
    k = Kokoro(os.path.join(models, "kokoro-v1.0.onnx"), os.path.join(models, "voices-v1.0.bin"))
    asr = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=os.path.join(cache, "asr"))
    out = {}
    for c in cases:
        for e in c["events"]:
            if e["kind"] != "voice":
                continue
            vid = e["vid"]
            wav = os.path.join(cache, vid + ".wav")
            samples, sr = k.create(e["say"], voice=e["voice"], speed=0.92, lang="en-us")
            samples = np.asarray(samples, dtype=np.float32)
            samples = samples * (0.89 / (float(np.max(np.abs(samples))) or 1.0))
            pad = np.zeros(int(0.25 * sr), dtype=np.float32)
            samples = np.concatenate([pad, samples, pad])
            sf.write(wav, samples, sr)
            subprocess.run(["ffmpeg", "-v", "quiet", "-y", "-i", wav, "-ac", "1", "-ar", "24000", "-codec:a",
                            "libmp3lame", "-b:a", "48k", os.path.join(HERE, "audio", vid + ".mp3")], check=True)
            raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                                 capture_output=True, check=True).stdout
            segs, _ = asr.transcribe(np.frombuffer(raw, np.float32), word_timestamps=True, language="en", beam_size=5)
            words, heard = [], []
            for seg in segs:
                heard.append(seg.text.strip())
                for w in seg.words:
                    words.append({"w": w.word.strip(), "s": float(w.start), "e": float(w.end)})
            out[vid] = {"dur": round(len(samples) / sr, 3), "asr": words, "heard": " ".join(heard)}
            print(vid, out[vid]["dur"], "s |", out[vid]["heard"], flush=True)
    with open(os.path.join(HERE, "case_voices.json"), "w") as f:
        json.dump(out, f, indent=1)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voices", action="store_true", help="render the voices again")
    ap.add_argument("--case-voices", action="store_true", help="render the voices of the cases again")
    ap.add_argument("--models", default="")
    ap.add_argument("--cache", default="")
    args = ap.parse_args()

    raw = fetch(SIGNALS_URL)
    sha = hashlib.sha256(raw).hexdigest()
    if sha != SIGNALS_SHA:
        raise SystemExit("signals90.json changed: " + sha)
    src = json.loads(raw)
    results = json.loads(fetch(RESULTS_URL))
    signals = src["signals"]
    inst = {i["id"]: i for i in src["instruments"]}
    assert len(signals) == 51 and len(inst) == 11

    if args.voices:
        voices = render_voices(signals, args.models, args.cache)
    else:
        voices = json.load(open(os.path.join(HERE, "voices.json")))

    mraw = fetch(MOVED_URL)
    msha = hashlib.sha256(mraw).hexdigest()
    if msha != MOVED_SHA:
        raise SystemExit("moved91.json changed: " + msha)
    moved = json.loads(mraw)
    mov = {m["id"]: m for m in moved["signals"]}
    assert set(mov) == {x["id"] for x in signals}
    cases = case_items(moved)
    if args.case_voices:
        cvoices = render_case_voices(cases, args.models, args.cache)
    else:
        cvoices = json.load(open(os.path.join(HERE, "case_voices.json")))
    for c in cases:
        for e in c["events"]:
            if e["kind"] != "voice":
                continue
            v = cvoices[e["vid"]]
            qw = e["show"].split()
            times, matched = align(qw, v["asr"])
            e.update({"words": [[w, t[0], t[1]] for w, t in zip(qw, times)], "matched": matched, "dur": v["dur"]})

    rooms = {r["id"]: dict(r, signals=[]) for r in ROOMS}
    out = []
    for s in signals:
        sid = s["id"]
        room = room_of(s)
        rooms[room]["signals"].append(sid)
        qw = s["quote"].split()
        v = voices[sid]
        times, matched = align(qw, v["asr"])
        if sid in BEFORE:
            when = {"phase": "before", "order": BEFORE.index(sid)}
        elif sid in DEED:
            when = {"phase": "deed", "order": DEED.index(sid)}
        elif sid in AT:
            when = {"phase": "at", "h": AT[sid]}
        elif sid in EVERY:
            when = {"phase": "every", "h": EVERY[sid]}
        else:
            when = {"phase": "none"}
        out.append({
            "id": sid, "inst": inst[s["instrument"]]["short"], "binding": s["binding"], "ref": s["ref"],
            "what": s["what"], "quote": s["quote"], "words": [[w, t[0], t[1]] for w, t in zip(qw, times)],
            "matched": matched, "dur": v["dur"], "room": room, "receiver": s["receiver"],
            "receiver_name": s["receiver_name"], "public": s["public"], "public_note": s["public_note"],
            "kind": s["kind"], "trigger": s["trigger"], "deadline_h": s["deadline_h"],
            "deadline_max_h": s["deadline_max_h"], "clock": s["clock"], "unit": s["unit"],
            "who": s["machine_or_person"], "stranger": s["stranger"], "retention": s["retention"],
            "before_harm": s["before_harm"], "all_four": s["all_four"], "when": when,
            "murmur": sid in MURMUR, "retention_end_h": RETENTION_END.get(sid), "voice": VOICE[s["instrument"]],
            "due": mov[sid]["due"], "moved": mov[sid]["moved"], "trace_first": mov[sid]["first"],
            "trace_host": mov[sid]["host"],
        })
    # sanity: every passage named its own hour where the clock puts it
    for sid, h in AT.items():
        s = next(x for x in signals if x["id"] == sid)
        assert s["clock"] == "awareness", sid
    assert all(next(x for x in signals if x["id"] == m)["public"] == "aggregate only" for m in MURMUR)

    data = {
        "title": "EARSHOT",
        "source": {"url": SIGNALS_URL, "sha256": SIGNALS_SHA, "commit": FIELD_COMMIT, "study": 90},
        "instruments": [{"id": i["id"], "short": i["short"], "name": i["name"], "binding": i["binding"]}
                        for i in src["instruments"]],
        "rooms": [rooms[r["id"]] for r in ROOMS],
        "signals": out,
        "clock": {"from_h": 1 / 60, "to_h": RUN_END_H, "murmur_h": MURMUR_H, "murmur": MURMUR},
        "moved": {"url": MOVED_URL, "sha256": MOVED_SHA, "commit": MOVED_COMMIT, "study": 91,
                  "record_date": RECORD_DATE},
        "cases": cases,
        "paper_hours": PAPER_HOURS,
        "field": {"receiver": results["receiver"], "events": results["events"],
                  "event_deadlines_h": results["event_deadlines_h"], "all_four": results["all_four"],
                  "events_public": results["events_public"], "events_law_public": results["events_law_public"]},
    }
    with open(os.path.join(HERE, "data.js"), "w") as f:
        f.write("// EARSHOT data, written by build.py from the Field's study 90 at " + FIELD_COMMIT[:7] +
                " and study 91 at " + MOVED_COMMIT[:7] + "\n")
        f.write("window.EARSHOT = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    low = [x["id"] for x in out if x["matched"] < 0.6 * len(x["words"])]
    print("signals", len(out), "rooms", {r: len(v["signals"]) for r, v in rooms.items()}, "weak alignment", low)


if __name__ == "__main__":
    main()
