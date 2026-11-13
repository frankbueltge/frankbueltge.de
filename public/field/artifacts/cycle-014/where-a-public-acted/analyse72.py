#!/usr/bin/env python3
"""Study 72 (session 270, 2026-11-13): what stood afterwards, what each act met, and the register widened.

Cycle 014, step 2 of the programme, second session. Builds on study 71 (analyse71.py), whose 28 records, 50
passages and 23 acts are taken unchanged and re-fetched. Adds: (1) for every act its state on 2026-11-13
(stands, lifted or loosened, gone around, superseded), from a passage of a record where one was found; (2) what
the act's own record states about the size of what it met; (3) five acts read first-hand this session, three of
them items study 71 knew only second-hand. Scores P96 to P101 (PREDICTIONS72.md, committed before any search).
Writes results72.json and data72.js.

Usage: python3 analyse72.py [cache-dir]     (standard library only; pdftotext for the PDFs)
"""
import hashlib, json, os, re, sys
import analyse71 as S71

HERE = os.path.dirname(os.path.abspath(__file__))
TODAY = "2026-11-13"

NEW_DOCS = {
    "PIMA0917": ("Pima County, County Administrator, memorandum 'Update on Project Blue' to the Board of Supervisors, 2025-09-17 (with the developer's letter of the same day)",
                 "https://www.pima.gov/asset/2192e865-fe7e-48f4-8a0c-7c1c8b5cd32c", True),
    "TALEN8K": ("Talen Energy Corporation, Form 8-K of 2025-06-11, exhibit 99.1 (press release)",
                "https://www.sec.gov/Archives/edgar/data/1622536/000162828025030559/a20250611pressreleasebusin.htm", False),
    "ACPORDER": ("Ireland, An Coimisiún Pleanála, order in case ABP-320852-24 (signed 2026-09-23)",
                 "https://www.pleanala.ie/anbordpleanala/media/abp/cases/orders/320/d320852.pdf", True),
    "ACPREPORT": ("Ireland, An Coimisiún Pleanála, inspector's report in case ABP-320852-24",
                  "https://www.pleanala.ie/anbordpleanala/media/abp/cases/reports/320/r320852.pdf", True),
    "SCHDPAE": ("Shelby County Health Department, Air Pollution Control, construction permit application evaluation, permit no. 01156-01PC, CTC Property LLC (March 2025; filed in a US EPA docket)",
                "https://downloads.regulations.gov/EPA-HQ-OAR-2024-0419-0095/attachment_5.pdf", True),
    "SCHDRTC": ("Shelby County Health Department, response to public comments on draft permit 01156-01PC, 2025-06-02 (filed in a US EPA docket)",
                "https://downloads.regulations.gov/EPA-HQ-OAR-2025-1212-0253/attachment_19.pdf", True),
    "KOMDIGI1": ("Indonesia, Ministry of Communication and Digital Affairs, official statement of the Minister, 2026-01-10 (ministry portal)",
                 "https://portal.komdigi.go.id/kanal-publik/berita-kini/9923", True),
    "KOMDIGI2": ("Indonesia, Ministry of Communication and Digital Affairs, press release of 2026-01-31 on the conditional restoration of Grok (ministry portal)",
                 "https://portal.komdigi.go.id/kanal-publik/berita-kini/9988", True),
    "AGCMDS": ("Italy, Autorità Garante della Concorrenza e del Mercato, decision no. 31784 of 2025-12-16, case PS12942 (DeepSeek)",
               "https://www.agcm.it/dotcmsCustom/tc/2031/1/getDominoAttach?urlStr=81.126.91.44%3A8080%2FC12560D000291394%2F0%2F9934A7D51ABD165DC1258D7600597DD9%2F%24File%2Fp31784.pdf", True),
}

NEW_Q = {
    # afterwards, from records already held by study 71
    "nv1": ("NV10K", "We generated approximately $60 million in H20 revenue under those licenses"),
    "nv2": ("NV10K", "China’s government publicly questioned whether our H20 products have built-in vulnerabilities, discouraging customers from purchasing our products"),
    "nv3": ("NV10K", "To date, we have not generated any revenue under the H200 licensing program"),
    "sg1": ("SGEDB", "The Pilot Call for Application (CFA) exercise by EDB and IMDA seeks to leverage on the expertise and capabilities of the industry"),
    "pwc1": ("PWC", "The proposed study area consist of 194 parcels and 2,139 acres between Route 234 and Route 29"),
    # afterwards, new records
    "pi1": ("PIMA0917", "On August 6, 2025, the City of Tucson Mayor and Council voted to not proceed with annexation of the project site"),
    "pi2": ("PIMA0917", "Contemplates the sale proceeding without annexation"),
    "pi3": ("PIMA0917", "The PSA and Specific Plan approval for the project remain active and valid"),
    "ta1": ("TALEN8K", "will transition to a “front-of-the-meter” arrangement after the completion of transmission reconfigurations"),
    "ta2": ("TALEN8K", "Talen will provide Amazon with 1,920 megawatts of carbon-free nuclear power through 2042"),
    # new acts
    "s9a": ("ACPREPORT", "Having regard to the existing insufficient capacity in the electricity network (grid), the lack of significant on site renewable energy to power (below 100%) the proposed development"),
    "s9b": ("ACPORDER", "Appeal by Google Ireland Limited against the decision made on the 22ndday of August, 2024 by South Dublin County Council to refuse permission"),
    "s10a": ("ACPORDER", "GRANT permission for the above proposed development"),
    "s10b": ("ACPORDER", "which shall demonstrate that the energy demand of DC3 is offset with new renewable energy generation"),
    "s10c": ("ACPORDER", "the development of a 72,400 square metres data storage facility"),
    "p4a": ("SCHDPAE", "The Center constructed fifteen (15) natural gas-fired Solar SMT-130 turbine generators, each rated at 16.48 megawatts (MW), providing a total of 300 MW of continuous power"),
    "p4b": ("SCHDPAE", "Facility Owner: CTC Property LLC"),
    "p4c": ("SCHDRTC", "The 15 permanent turbines that are the subject of the draft construction air permit do not qualify as a major source"),
    "m7a": ("KOMDIGI1", "Pemerintah melalui Kementerian Komunikasi dan Digital melakukan pemutusan akses sementara terhadap aplikasi Grok"),
    "m7b": ("KOMDIGI1", "risiko konten pornografi palsu yang dihasilkan menggunakan teknologi kecerdasan artifisial"),
    "m7c": ("KOMDIGI2", "memproses normalisasi akses layanan Grok secara bersyarat"),
    "m8a": ("AGCMDS", "di rendere obbligatori, nei confronti delle società Hangzhou DeepSeek Artificial Intelligence Co., Ltd. e Beijing DeepSeek Artificial Intelligence Co., Ltd."),
    "m8b": ("AGCMDS", "Gli impegni consistono in un pacchetto di misure volto a migliorare l’informativa sul rischio di allucinazioni"),
}

A = lambda **k: k
NEW_ACTS = [
    A(id="s9", point="site", date="2024-08-22", body="South Dublin County Council, Ireland", country="Ireland", level="sub", kind="agency",
      effect="stopped", form="case", terr="inside", grounds=["power or grid", "land, noise or the neighbourhood"], named="Google (Google Ireland Limited)",
      party="Google Ireland Limited, a third data-centre building at Grange Castle", what="Planning permission refused, first for the grid's lack of capacity and the lack of on-site renewable power.",
      limit="one building", compute_quantity=False, q=["s9a", "s9b"], lifted=None, lifted_note=None,
      ground_note="Reasons read in the national planning body's inspector's report, which sets out the council's two reasons; the council's own decision was not fetched.",
      new=True, was_second_hand=True),
    A(id="s10", point="site", date="2026-09-23", body="An Coimisiún Pleanála, Ireland", country="Ireland", level="nat", kind="regulator",
      effect="conditioned", form="case", terr="inside", grounds=["power or grid"], named="Google (Google Ireland Limited)",
      party="Google Ireland Limited, the same building, on appeal", what="Permission granted on appeal with conditions, among them that the building's energy demand be offset by new renewable generation in Ireland under corporate power purchase agreements.",
      limit="one building, on energy conditions", compute_quantity=False, q=["s10a", "s10b"], lifted=None, lifted_note=None, new=True, was_second_hand=False),
    A(id="p4", point="power", date="2025-07-02", body="Shelby County Health Department, Tennessee", country="United States", level="sub", kind="agency",
      effect="conditioned", form="case", terr="inside", grounds=["water or air"], named=None,
      party="CTC Property LLC, owner of the Colossus data centre in Memphis", what="An air construction permit for 15 gas turbines generating the data centre's own power, as a synthetic minor source with emission limits.",
      limit="15 turbines and their emissions", compute_quantity=False, q=["p4a", "p4b", "p4c"], lifted=None, lifted_note=None,
      ground_note="The department's own texts name the owner CTC Property LLC; the developer's name appears in them only inside the headings of commenters' objections, which the department quotes. Read on a federal docket, not the department's own site; the issue date of 2 July 2025 is the permit's, read in a scanned copy published by a third party, which has no text layer and is not hashed here.",
      new=True, was_second_hand=True),
    A(id="m7", point="model", date="2026-01-10", body="Ministry of Communication and Digital Affairs, Indonesia", country="Indonesia", level="nat", kind="agency",
      effect="stopped", form="case", terr="na", grounds=["the model's output"], named="xAI (Grok), through X Corp",
      party="X Corp's chatbot Grok", what="Access to Grok is cut temporarily, to protect women, children and the public from fake pornographic content generated with AI.",
      limit="access to one service in the country", compute_quantity=False, q=["m7a", "m7b"], lifted="m7c",
      lifted_note="Access restored on conditions three weeks later, on 31 January 2026, after a written commitment by X Corp.", new=True, was_second_hand=True),
    A(id="m8", point="model", date="2025-12-16", body="Autorità Garante della Concorrenza e del Mercato, Italy", country="Italy", level="nat", kind="regulator",
      effect="conditioned", form="case", terr="na", grounds=["the model's output"], named=None,
      party="the two companies behind DeepSeek", what="Commitments made binding: the service must inform its users in Italy about the risk of hallucinations and act to reduce it.",
      limit="what the service tells its users", compute_quantity=False, q=["m8a", "m8b"], lifted=None, lifted_note=None, new=True, was_second_hand=False),
]

# Afterwards: state on 2026-11-13. q: passage on which the state rests (None: no later record found, or read second-hand).
AFTER = {
    "c1": ("superseded", "c2a", "Widened and replaced by the rule of October 2023, a year later.", True),
    "c2": ("lifted", "c5a", "Loosened in part 27 months later: since January 2026 licences for the H200 class are reviewed case by case.", True),
    "c3": ("lifted", "c4a", "Licences granted four months later.", True),
    "c4": ("stands", "nv1", "The licences stand, and about $60 million of H20 was sold under them; the chip maker reports that China's government discouraged buyers.", True),
    "c5": ("stands", None, "No later record read.", True),
    "c6": ("stands", "nv3", "The licence stands; the chip maker reports no revenue under it to date.", True),
    "s1": ("gone around", "pi2", "Four to six weeks later the county records that the land sale can proceed without annexation; the developer writes that its county approvals remain active and that it will cool by air.", True),
    "s2": ("stands", "s2a", "Stands: the rezonings are void on the county's page of August 2026. That the developer withdrew its last appeal on 2 July 2026 was read only on a campaign group's site.", True),
    "s3": ("superseded", "s4a", "Replaced by the standing instruction rule in force from 2024.", True),
    "s4": ("stands", "s4a", "In force on the minister's answers of April 2026.", True),
    "s5": ("lifted", "sg1", "Ended in 2022, about three years later, by a pilot call for applications that allots new capacity.", True),
    "s6": ("gone around", None, "Second-hand: the developer withdrew the annulled approval in 2024, redesigned the building for air cooling, and in October 2026 the environmental service ruled the new project needs no environmental assessment. The service's register answered with a script challenge and was not read.", False),
    "s7": ("stands", None, "Running: twelve months from October 2026.", True),
    "s8": ("stands", None, "Running: until zoning rules are written or the moratorium is rescinded.", True),
    "p1": ("gone around", "ta1", "Seven months later the same plant agreed to supply 1,920 MW to the same buyer through the grid, a form the companies say needs no approval of the regulator.", True),
    "p2": ("superseded", "p3b", "Replaced by the direction of December 2025.", True),
    "p3": ("stands", None, "In force since December 2025.", True),
    "m1": ("lifted", "m2b", "Service restored four weeks later, on terms.", True),
    "m2": ("stands", "m2b", "The terms were met and the service restored.", True),
    "m3": ("stands", None, "No revocation found on the authority's pages read.", True),
    "m4": ("stands", "m4c", "Made permanent: the proceedings were struck out on the undertaking.", True),
    "m5": ("lifted", "m6a", "Suspended two months later against a compliance plan.", True),
    "m6": ("stands", None, "No later record read.", True),
    "s9": ("lifted", "s10a", "Overturned on appeal by the national planning body 25 months later, on conditions (s10).", True),
    "s10": ("stands", None, "Granted in September 2026.", True),
    "p4": ("stands", None, "The permit runs to January 2027; an appeal against it was read only second-hand.", True),
    "m7": ("lifted", "m7c", "Restored on conditions three weeks later.", True),
    "m8": ("stands", None, "Decided in December 2025.", True),
}

# What the act's own record states about the size of what it met. A threshold is not a quantity met.
MAG = {
    "c3": ("money", "$4.5 billion charge for excess inventory", "c3b"),
    "s2": ("land", "2,139 acres (the plan's study area)", "pwc1"),
    "p1": ("power", "300 MW to 480 MW of co-located load, the 180 MW added refused", "p1a"),
    "s10": ("floor area", "72,400 square metres", "s10c"),
    "s9": ("floor area", "72,400 square metres (the same building)", "s10c"),
    "p4": ("power", "15 turbines of 16.48 MW", "p4a"),
}
THRESHOLDS = {"c1": "chips above a performance threshold", "c2": "chips above a performance threshold", "s3": "more than 10 ha and 70 MW",
              "s4": "more than 10 ha and 70 MW", "s7": "a peak load of 50 MW or more", "p3": "10 MVA or more"}

STATES = ["stands", "lifted", "gone around", "superseded"]


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, ".cache72")
    os.makedirs(cache, exist_ok=True)
    S71.DOCS.update(NEW_DOCS)
    Q = dict(S71.Q); Q.update(NEW_Q)
    texts, files = {}, []
    for doc in S71.DOCS:
        raw = S71.fetch(doc, cache)
        texts[doc] = S71.text_of(raw, os.path.join(cache, doc + ".raw"))
        files.append(dict(id=doc, what=S71.DOCS[doc][0], url=S71.DOCS[doc][1], bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest(),
                          fetched=TODAY, new=doc in NEW_DOCS))
    missing = [k for k, (d, s) in Q.items() if re.sub(r"\s+", " ", s) not in texts[d]]
    assert not missing, "passages not found: %s" % missing
    assert "xAI" not in texts["SCHDPAE"], "the evaluation now names the developer; recode p4"

    ACTS = [dict(a, new=False, was_second_hand=False) for a in S71.ACTS] + NEW_ACTS
    ids = [a["id"] for a in ACTS]
    assert set(AFTER) == set(ids), set(AFTER) ^ set(ids)
    old = [a for a in ACTS if not a["new"]]
    assert len(old) == 23

    def after_of(a):
        st, q, note, first = AFTER[a["id"]]
        return dict(state=st, note=note, firsthand=first, quote=(dict(id=q, text=Q[q][1], url=S71.DOCS[Q[q][0]][1], source=S71.DOCS[Q[q][0]][0]) if q else None))

    n, n_old = len(ACTS), len(old)
    tally = lambda xs: {s: sum(1 for a in xs if AFTER[a["id"]][0] == s) for s in STATES}
    stopped_old = [a for a in old if a["effect"] == "stopped"]
    stopped_all = [a for a in ACTS if a["effect"] == "stopped"]
    mag_old = [a["id"] for a in old if a["id"] in MAG]
    per_point = {p: sum(1 for a in ACTS if a["point"] == p) for p in S71.POINTS}
    grid = {p: {e: sum(1 for a in ACTS if a["point"] == p and a["effect"] == e) for e in ("stopped", "delayed", "conditioned")} for p in S71.POINTS}
    grounds = {}
    for a in ACTS:
        for g in a["grounds"]:
            grounds[g] = grounds.get(g, 0) + 1
    by = lambda key: {v: sum(1 for a in ACTS if a[key] == v) for v in sorted({a[key] for a in ACTS})}
    named = [a["id"] for a in ACTS if a["named"]]

    P = []
    def pred(pid, text, held, found):
        P.append(dict(id=pid, text=text, held=held, found=found))
    t_old = tally(old)
    pred("P96", "Of the 23 acts, at most 12 stand on 2026-11-13; the rest are lifted, gone around, superseded or unknown.",
         t_old["stands"] <= 12, "%d stand, %d lifted or loosened, %d gone around, %d superseded." % (t_old["stands"], t_old["lifted"], t_old["gone around"], t_old["superseded"]))
    t_st = tally(stopped_old)
    pred("P97", "Of the 12 acts coded stopped, at least 5 are lifted, gone around or superseded by 2026-11-13.",
         len(stopped_old) - t_st["stands"] >= 5,
         "%d of %d did not stand as stops (%d lifted or loosened, %d gone around, %d superseded); %d stand: %s." % (
             len(stopped_old) - t_st["stands"], len(stopped_old), t_st["lifted"], t_st["gone around"], t_st["superseded"], t_st["stands"],
             ", ".join(a["id"] for a in stopped_old if AFTER[a["id"]][0] == "stands")))
    pred("P98", "Of the 23 acts, at most 11 have a record that states a quantity of what the act met.",
         len(mag_old) <= 11, "%d of 23 (%s); %d more state a threshold, not a quantity met." % (len(mag_old), ", ".join(mag_old), len(THRESHOLDS)))
    pred("P99", "No act's record states the quantity of compute it met in chips counted or in H100-equivalents.",
         not any(MAG.get(a["id"], ("",))[0] == "compute" for a in ACTS),
         "None of %d. The nearest is a licence for 'small amounts' of one chip (c6), and its holder reports no revenue under it." % n)
    pred("P100", "The Memphis air permit is found first-hand on a public body's own site, and it names the AI developer as permittee.",
         False, "Failed on both counts. The department's evaluation and its answer to comments were read on a federal agency's docket, not its own site; both name the owner CTC Property LLC, and the developer appears only in the commenters' headings the department quotes. Entered as act p4 with named = none.")
    newly = [a["id"] for a in NEW_ACTS if a["was_second_hand"]]
    pred("P101", "Of the nine second-hand items of study 71, at least two are read first-hand this session and enter the register as acts.",
         len(newly) >= 2, "%d: the Memphis permit (p4), the Irish council's refusal (s9), Indonesia's block of the chatbot (m7). Two further acts were found on the way (s10, m8)." % len(newly))
    held = sum(1 for p in P if p["held"])

    second_hand = [x for x in S71.SECOND_HAND if not x["what"].startswith(("A county health department", "An Irish county council", "Indonesia and Malaysia"))]
    second_hand += [
        dict(point="model", what="Malaysia blocked the same chatbot the day after Indonesia (January 2026).", why="press only; the regulator's own release was not searched"),
        dict(point="site", what="Chile's environmental service ruled on 16 October 2026 that the redesigned data centre in Cerrillos needs no environmental assessment.", why="the service's register answered with a script challenge; press only"),
        dict(point="power", what="Community groups appealed the Memphis permit to the local air pollution control board (July 2025).", why="the appeal was read only on a newspaper's site"),
    ]
    model_output = [a["id"] for a in ACTS if "the model's output" in a["grounds"]]
    prev = {f["id"]: f["sha256"] for f in json.load(open(os.path.join(HERE, "results71.json")))["files"]}
    changed = [f["id"] for f in files if f["id"] in prev and prev[f["id"]] != f["sha256"]]

    results = dict(
        study=72, session=270, date=TODAY, cycle=14, programme_step=2, builds_on="study 71 (results71.json), whose 23 acts are kept unchanged",
        question="What stood afterwards, what did each act meet, and what does the register say once its second-hand items are read?",
        frame="A found set, not a census: 28 acts, 23 from study 71 and 5 read first-hand on 2026-11-13. Counts are lower bounds; shares are shares of what was read.",
        counts=dict(acts=n, acts_71=n_old, new=[a["id"] for a in NEW_ACTS], per_point=per_point, grid=grid, by_effect=by("effect"), by_kind=by("kind"),
                    by_level=by("level"), by_country=by("country"), grounds=grounds, named=named,
                    elected=[a["id"] for a in ACTS if a["kind"] == "elected"], inside=[a["id"] for a in ACTS if a["terr"] == "inside"],
                    ai_risk=[a["id"] for a in ACTS if "AI risk" in a["grounds"]], model_output=model_output,
                    compute_quantity=[a["id"] for a in ACTS if a["compute_quantity"]],
                    after_all=tally(ACTS), after_71=t_old, stopped_all=len(stopped_all), stopped_after=tally(stopped_all),
                    stopped_71=len(stopped_old), stopped_71_after=t_st, magnitude=sorted(MAG), magnitude_71=mag_old, thresholds=sorted(THRESHOLDS),
                    not_acts=len(S71.NOT_ACTS), second_hand=len(second_hand), files=len(files), new_files=len(NEW_DOCS), passages=len(Q)),
        predictions=P, predictions_held="%d of %d" % (held, len(P)),
        acts=[dict(a, quotes=[dict(id=q, doc=Q[q][0], text=Q[q][1], url=S71.DOCS[Q[q][0]][1], source=S71.DOCS[Q[q][0]][0]) for q in a["q"]],
                   after=after_of(a),
                   size=(dict(kind=MAG[a["id"]][0], text=MAG[a["id"]][1], quote=Q[MAG[a["id"]][2]][1]) if a["id"] in MAG else None),
                   threshold=THRESHOLDS.get(a["id"])) for a in ACTS],
        not_acts=[dict(x, quote=Q[x["q"]][1], url=S71.DOCS[Q[x["q"]][0]][1], source=S71.DOCS[Q[x["q"]][0]][0]) for x in S71.NOT_ACTS],
        second_hand=second_hand, files=files,
        refetch=dict(of=len(prev), changed=changed, note="Study 71's records re-fetched on %s: %d of %d files differ byte for byte from 2026-11-12, and every one of its 50 passages still stands in them." % (TODAY, len(changed), len(prev))),
        refusals=["pertinencia.sea.gob.cl (Chile's environmental service) answered with a script challenge",
                  "www.komdigi.go.id answered 403 to both clients; the ministry's own portal delivered the same statements",
                  "the Memphis permit itself was found only as a scan without text on a third party's site",
                  "from study 71: investor.nvidia.com 403; puco.ohio.gov 504; federalregister.gov access notice"],
    )
    json.dump(results, open(os.path.join(HERE, "results72.json"), "w"), indent=1, ensure_ascii=False)
    open(os.path.join(HERE, "data72.js"), "w").write("window.DATA72 = " + json.dumps(results, ensure_ascii=False) + ";\n")
    print("acts", n, per_point, "| after all", tally(ACTS), "| stopped", len(stopped_all), tally(stopped_all))
    print("named", named, "| model output", model_output, "| magnitude", sorted(MAG))
    for p in P:
        print(p["id"], "HELD" if p["held"] else "FAILED", "-", p["found"])
    print("predictions held:", results["predictions_held"], "| files", len(files), "| passages", len(Q), "all found")


if __name__ == "__main__":
    main()
