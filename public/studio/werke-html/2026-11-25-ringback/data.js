// RINGBACK, data (written by build.py; do not edit by hand)
window.RINGBACK = {
 "title": "RINGBACK",
 "state": 3,
 "date": "2026-11-27",
 "session": 266,
 "built": {
  "first": 264,
  "checked": 266
 },
 "sources": {
  "receivers94": {
   "url": "https://raw.githubusercontent.com/frankbueltge/field-research/3dcd20be555d36c58bebdead061dc7d3dd0c33a2/artifacts/cycle-019/on-receipt/receivers94.json",
   "sha256": "763b4da72006b7dbfbc17e5141aa1e7e2df6c9ed96a8427439acfa5f7def8698",
   "what": "The Field's study 94, On Receipt, state 1 (2026-11-25): what each receiver of the 19 event signals owes on receipt, by when, and what follows for a silent sender or receiver, every code with its passage."
  },
  "signals90": {
   "url": "https://raw.githubusercontent.com/frankbueltge/field-research/b6fd73a4b4b86b09ab4809957b0dae5758ed440e/artifacts/cycle-018/told-in-time/signals90.json",
   "sha256": "87a91da00ebc629052fa74ab688c4a064439422ee2757f294b4db07484639d25",
   "what": "The Field's study 90, Told in Time, state 1 (2026-11-22): the 51 signals with the passage that sets each, used here for the sender's own duty."
  },
  "itu_tones": {
   "url": "https://www.itu.int/dms_pub/itu-t/opb/sp/T-SP-E.180-2010-PDF-E.pdf",
   "sha256": "290c9873331d662545b700e2ef09f1a6182eca7701c5789812578dc136daa2a7",
   "what": "ITU, Annex to Operational Bulletin No. 955 (1 May 2010): various tones used in national networks, according to ITU-T E.180; the ringing tone of each receiver's network."
  },
  "itu_e180": {
   "url": "https://www.itu.int/rec/dologin_pub.asp?id=T-REC-E.180-199803-I!!PDF-E&lang=e&type=items",
   "sha256": "9ea28a838c1f4da2bb84c1d42a03a9c4fceddfd6a1ea9baeb38570c260a41b0a",
   "what": "ITU-T Recommendation E.180/Q.35 (03/98), section 5: the recommended limits of a ringing tone."
  },
  "codes96": {
   "url": "https://raw.githubusercontent.com/frankbueltge/field-research/828e88a6e9a3f037ba2b18ea55e0a072086448cc/artifacts/cycle-019/on-receipt/codes96.json",
   "sha256": "17753d9c43c918834b920ddfdc4e45c0b301d7cdb3e96851f93e19cc38606ed0",
   "what": "The Field's study 96, its check (2026-11-27): study 94's codes read again blind, every disagreement decided with its reason; one code moved."
  },
  "caloes_911": {
   "url": "https://www.caloes.ca.gov/wp-content/uploads/PSC/Documents/Chapter-I-Standards-update-2023.pdf",
   "sha256": "db59a5bf65ba7942e2c4cd05ff7b81d679063b81f53b8106097e897ec5b59123",
   "what": "California Governor's Office of Emergency Services, 9-1-1 Operations Manual, chapter I, Standards (rev. 03-2023): the call answer time a public safety answering point is held to."
  }
 },
 "tones": {
  "US": {
   "network": "United States of America",
   "hz": [
    440,
    480
   ],
   "on": 2.0,
   "off": 4.0,
   "line": "Ringing tone - 420x40//500x40//440+480 2.0 on 4.0 off",
   "note": "The list gives three alternatives; the page plays the last, 440 and 480 Hz together."
  },
  "BE": {
   "network": "Belgium",
   "hz": [
    425
   ],
   "on": 1.0,
   "off": 3.0,
   "line": "Ringing tone - 425 1.0 on 3.0 off",
   "note": null
  },
  "CN": {
   "network": "China (People's Republic of)",
   "hz": [
    450
   ],
   "on": 1.0,
   "off": 4.0,
   "line": "Ringing tone - 450 1.0 on 4.0 off",
   "note": null
  },
  "XX": {
   "network": "no seat",
   "hz": [
    425
   ],
   "on": 1.0,
   "off": 4.0,
   "line": null,
   "note": "A receiver the text names by role and not by seat rings in the commonest ringing tone of the list: 44 of the 144 ringing tones the build reads there in one form are 425 Hz, 1.0 s on and 4.0 s off. It lies inside E.180's recommended limits.",
   "e180": [
    "The recommended limits for the tone period (including tolerances) are from 0.67 to 1.5 seconds.",
    "The recommended limits for the silent period separating two tone periods are 3 to 5 seconds.",
    "Administrations adopting a new single frequency ringing tone are recommended to use 425 Hz."
   ]
  }
 },
 "control": {
  "id": "911",
  "short": "9-1-1",
  "name": "a public safety answering point in California, under Cal OES's 9-1-1 standard",
  "tone": "US",
  "answer_s": 15,
  "standard": "Ninety (90%) percent of all 9-1-1 calls arriving at the Public Safety Answering Point SHALL be answered within (≤) Fifteen (15) seconds.",
  "standard2": "Ninety-five (95%) of all 9-1-1 calls SHOULD be answered within (≤) twenty (20) seconds.",
  "consequence": "PSAP funding from the SETNA by the CA 9-1-1 Branch is contingent upon adherence to the following mandatory standards.",
  "monitor": "The CA 9-1-1 Branch has the responsibility to monitor all emergency communication systems related to the delivery of a 9-1-1 call to ensure they comply with these standards.",
  "office": "Governor's Office of Emergency Services, Public Safety Communications, California 9-1-1 Emergency Communications Branch",
  "ref": "9-1-1 Operations Manual, chapter I, PSAP standard 2, rev. 03-2023",
  "url": "https://www.caloes.ca.gov/wp-content/uploads/PSC/Documents/Chapter-I-Standards-update-2023.pdf",
  "x": 0.165,
  "z": 0.93
 },
 "lines": [
  {
   "id": "EU4",
   "short": "AI Office",
   "receiver_name": "AI Office (European Commission)",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "eu-act",
   "instrument_short": "EU AI Act",
   "binding": "law",
   "what": "Serious incidents",
   "ref": "Art. 55(1)(c); Art. 3(49); Art. 55(3)",
   "sender": "the provider of a model with systemic risk",
   "trigger": "harm",
   "sender_passage": "keep track of, document, and report, without undue delay, to the AI Office and, as appropriate, to national competent authorities, relevant information about serious incidents and possible corrective measures to address them",
   "sender_ref": "Art. 55(1)(c); Art. 3(49); Art. 55(3)",
   "sender_deadline_h": "prompt",
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "penalty",
    "max": 15000000,
    "who": "the Commission",
    "ref": "Art. 101(1)(a)",
    "quotes": [
     "The Commission may impose on providers of general-purpose AI models fines not exceeding 3 % of their annual total worldwide turnover in the preceding financial year or EUR 15 000 000, whichever is higher."
    ],
    "note": "The maximum is 3 % of worldwide turnover or EUR 15 million, whichever is higher; Art. 101 applies from 2 August 2026 (Art. 113(b))."
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": "The Act names no consequence for the Commission or the AI Office; the Court of Justice reviews fines (Art. 101(5)), a remedy of the provider."
   },
   "note": "Art. 90(2): the AI Office informs the Board of measures it takes under Arts. 91-94, not of the reports it receives.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Art. 92(1)",
     "quotes": [
      "The AI Office, after consulting the Board, may conduct evaluations of the general-purpose AI model concerned"
     ],
     "note": "Also Art. 91(1): the Commission may request documentation and information. Neither is tied to an incident report.",
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Art. 93(1)(c)",
     "quotes": [
      "Where necessary and appropriate, the Commission may request providers to:",
      "restrict the making available on the market, withdraw or recall the model."
     ],
     "note": "A request that binds: failing to comply is fined under Art. 101(1)(c).",
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Art. 55(3)",
     "quotes": [
      "Any information or documentation obtained pursuant to this Article, including trade secrets, shall be treated in accordance with the confidentiality obligations set out in Article 78."
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "BE",
   "seat": "its seat is in Brussels",
   "x": 0.62,
   "z": 0.76
  },
  {
   "id": "COP3",
   "short": "AI Office",
   "receiver_name": "AI Office",
   "receiver": "public body",
   "receiver_party": "no",
   "instrument": "eu-code",
   "instrument_short": "EU Code of Practice",
   "binding": "voluntary",
   "what": "Serious incidents, with timelines",
   "ref": "Measures 9.2, 9.3, 9.4",
   "sender": "a signatory",
   "trigger": "event short of harm",
   "sender_passage": "a serious cybersecurity breach, including the (self-)exfiltration of model weights and cyberattacks, or if the Signatories establish or suspect with reasonable likelihood such a causal relationship between their model and the breach, not later than five days after",
   "sender_ref": "Measures 9.2, 9.3, 9.4",
   "sender_deadline_h": 48,
   "sender_deadline_max_h": 360,
   "sender_clock": "awareness",
   "sender_failure": {
    "v": "none",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": "The Code names nothing; the AI Act's own duty and fine stand under EU4."
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "The Code is the signatories' commitment; the AI Office receives reports and commits to nothing in it.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "BE",
   "seat": "its seat is in Brussels",
   "x": 0.58,
   "z": 0.4
  },
  {
   "id": "COP5",
   "short": "the signatory",
   "receiver_name": "the signatory (or the AI Office)",
   "receiver": "own record",
   "receiver_party": "yes",
   "instrument": "eu-code",
   "instrument_short": "EU Code of Practice",
   "binding": "voluntary",
   "what": "Reports about serious incidents from users and other third parties",
   "ref": "Measure 9.1(2)",
   "sender": "downstream modifiers, providers, users and other third parties",
   "trigger": "harm",
   "sender_passage": "facilitate the reporting of relevant information about serious incidents by downstream modifiers, downstream providers, users, and other third parties to:",
   "sender_ref": "Measure 9.1(2)",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "As sender of EU4 the maker answers under Art. 101 of the Act; the Code itself names nothing.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "duty",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Measure 9.2",
     "quotes": [
      "Signatories will investigate the causes and effects of serious incidents, including the information within the preceding list, with a view to informing systemic risk assessment."
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "duty",
     "deadline_h": 48,
     "deadline_max_h": 360,
     "ref": "Measure 9.3",
     "quotes": [
      "not later than two days after the Signatories become aware of the involvement of their model in the incident",
      "not later than 15 days after the Signatories become aware of the involvement of their model in the incident"
     ],
     "note": "Two days for critical infrastructure, five for a serious cybersecurity breach, ten for a death, fifteen for other serious harm; an initial report to the AI Office, counted from the signatory's awareness.",
     "doubt": "The duty is to report the serious incident, not to forward the third party's report as such.",
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.65,
   "z": 0.45
  },
  {
   "id": "CA4",
   "short": "Cal OES",
   "receiver_name": "Office of Emergency Services",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "sb53",
   "instrument_short": "California SB 53",
   "binding": "law",
   "what": "Critical safety incidents",
   "ref": "B&P § 22757.13(c)(1); § 22757.11(d); § 22757.13(g)",
   "sender": "a frontier developer",
   "trigger": "event short of harm",
   "sender_passage": "frontier developer shall report any critical safety incident pertaining to one or more of its frontier models to the Office of Emergency Services within 15 days of discovering the critical safety incident.",
   "sender_ref": "B&P § 22757.13(c)(1); § 22757.11(d); § 22757.13(g)",
   "sender_deadline_h": 360,
   "sender_deadline_max_h": null,
   "sender_clock": "awareness",
   "sender_failure": {
    "v": "penalty",
    "max": 1000000,
    "who": "the Attorney General, in a civil action",
    "ref": "B&P § 22757.15",
    "quotes": [
     "fails to report an incident as required by Section 22757.13, or fails to comply with its own frontier AI framework shall be subject to a civil penalty",
     "does not exceed one million dollars ($1,000,000) per violation",
     "A civil penalty described in this section shall be recovered in a civil action brought only by the Attorney General."
    ],
    "note": "The penalty names a large frontier developer; the duty to report lies on every frontier developer, so a frontier developer that is not large faces no penalty in this text."
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "duty",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(d)",
     "quotes": [
      "Office of Emergency Services shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(e)(1)",
     "quotes": [
      "The Attorney General or the Office of Emergency Services may transmit reports of critical safety incidents and reports from covered employees"
     ],
     "note": "To the Legislature, the Governor, the federal government or appropriate state agencies, at the receiver's discretion.",
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(f)",
     "quotes": [
      "are exempt from the California Public Records Act"
     ],
     "note": "The reports themselves are exempt from the Public Records Act; nothing requires publishing one.",
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "duty",
     "deadline_h": "periodic",
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(g)(1)",
     "quotes": [
      "Beginning January 1, 2027, and annually thereafter, the Office of Emergency Services shall produce a report with anonymized and aggregated information about critical safety incidents that have been reviewed by the Office of Emergency Services since the preceding report."
     ],
     "note": null,
     "doubt": "The text has the report transmitted to the Legislature and the Governor (§ 22757.13(g)(3)); it does not say the report is published.",
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.13,
   "z": 0.8
  },
  {
   "id": "CA5",
   "short": "an authority",
   "receiver_name": "an appropriate authority (law enforcement or public safety)",
   "receiver": "public body",
   "receiver_party": "no",
   "instrument": "sb53",
   "instrument_short": "California SB 53",
   "binding": "law",
   "what": "Imminent danger, to an authority within a day",
   "ref": "B&P § 22757.13(c)(2)",
   "sender": "a frontier developer",
   "trigger": "event short of harm",
   "sender_passage": "developer shall disclose that incident within 24 hours to an authority, including any law enforcement agency or public safety agency with jurisdiction",
   "sender_ref": "B&P § 22757.13(c)(2)",
   "sender_deadline_h": 24,
   "sender_deadline_max_h": null,
   "sender_clock": "awareness",
   "sender_failure": {
    "v": "penalty",
    "max": 1000000,
    "who": "the Attorney General, in a civil action",
    "ref": "B&P § 22757.15",
    "quotes": [
     "fails to report an incident as required by Section 22757.13, or fails to comply with its own frontier AI framework shall be subject to a civil penalty",
     "does not exceed one million dollars ($1,000,000) per violation",
     "A civil penalty described in this section shall be recovered in a civil action brought only by the Attorney General."
    ],
    "note": "The penalty names a large frontier developer; the duty to report lies on every frontier developer, so a frontier developer that is not large faces no penalty in this text."
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "The Act gives the authority no task; it names it only as the place of disclosure.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.08,
   "z": 0.7
  },
  {
   "id": "CA6",
   "short": "Cal OES",
   "receiver_name": "Office of Emergency Services",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "sb53",
   "instrument_short": "California SB 53",
   "binding": "law",
   "what": "Anyone may report a critical safety incident",
   "ref": "B&P § 22757.13(a), (d)",
   "sender": "any member of the public",
   "trigger": "event short of harm",
   "sender_passage": "establish a mechanism to be used by a frontier developer or a member of the public to report a critical safety incident",
   "sender_ref": "B&P § 22757.13(a), (d)",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(d)",
     "quotes": [
      "Office of Emergency Services shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(e)(1)",
     "quotes": [
      "The Attorney General or the Office of Emergency Services may transmit reports of critical safety incidents and reports from covered employees"
     ],
     "note": "To the Legislature, the Governor, the federal government or appropriate state agencies, at the receiver's discretion.",
     "doubt": "(e)(1) names 'reports of critical safety incidents', read to include reports by the public.",
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(f)",
     "quotes": [
      "are exempt from the California Public Records Act"
     ],
     "note": "The reports themselves are exempt from the Public Records Act; nothing requires publishing one.",
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "duty",
     "deadline_h": "periodic",
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(g)(1)",
     "quotes": [
      "Beginning January 1, 2027, and annually thereafter, the Office of Emergency Services shall produce a report with anonymized and aggregated information about critical safety incidents that have been reviewed by the Office of Emergency Services since the preceding report."
     ],
     "note": null,
     "doubt": "Only incidents the office reviewed, and it need not review a public report; transmitted to the Legislature and the Governor, not said to be published.",
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.19,
   "z": 0.84
  },
  {
   "id": "CA7",
   "short": "Attorney General",
   "receiver_name": "Attorney General (or a federal authority)",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "sb53",
   "instrument_short": "California SB 53",
   "binding": "law",
   "what": "Employees may disclose to the Attorney General",
   "ref": "Labor Code § 1107.1(a); B&P § 22757.14(d)",
   "sender": "a covered employee",
   "trigger": "event short of harm",
   "sender_passage": "information to the Attorney General, a federal authority, a person with authority over the covered employee, or another covered employee who has authority to investigate, discover, or correct the reported issue",
   "sender_ref": "Labor Code § 1107.1(a); B&P § 22757.14(d)",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "The Act protects the employee who discloses (Labor Code § 1107.1(a)); it sets the Attorney General no task on receipt.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "B&P § 22757.13(e)(1)",
     "quotes": [
      "The Attorney General or the Office of Emergency Services may transmit reports of critical safety incidents and reports from covered employees"
     ],
     "note": "To the Legislature, the Governor, the federal government or appropriate state agencies, at the receiver's discretion.",
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "duty",
     "deadline_h": "periodic",
     "deadline_max_h": null,
     "ref": "B&P § 22757.14(d)(1)",
     "quotes": [
      "Beginning January 1, 2027, and annually thereafter, the Attorney General shall produce a report with anonymized and aggregated information about reports from covered employees"
     ],
     "note": null,
     "doubt": "Only reports 'that have been reviewed by the Attorney General', and no text requires a review; transmitted to the Legislature and the Governor, not said to be published.",
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.24,
   "z": 0.72
  },
  {
   "id": "CA8",
   "short": "the developer's own channel",
   "receiver_name": "the large frontier developer's internal process",
   "receiver": "own record",
   "receiver_party": "yes",
   "instrument": "sb53",
   "instrument_short": "California SB 53",
   "binding": "law",
   "what": "An anonymous internal channel, shared with officers quarterly",
   "ref": "Labor Code § 1107.1(e)",
   "sender": "a covered employee, anonymously",
   "trigger": "event short of harm",
   "sender_passage": "provide a reasonable internal process through which a covered employee may anonymously disclose information to the large frontier developer",
   "sender_ref": "Labor Code § 1107.1(e)",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "named",
    "ref": "Labor Code § 1107.1(f)",
    "quotes": [
     "The court is authorized to award reasonable attorney’s fees to a plaintiff who brings a successful action for a violation of this section."
    ],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "duty",
     "deadline_h": "periodic",
     "deadline_max_h": null,
     "ref": "Labor Code § 1107.1(e)(1)",
     "quotes": [
      "including a monthly update to the person who made the disclosure regarding the status of the large frontier developer’s investigation of the disclosure and the actions taken by the large frontier developer in response to the disclosure"
     ],
     "note": "A monthly update to the discloser.",
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "duty",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Labor Code § 1107.1(e)(1)",
     "quotes": [
      "including a monthly update to the person who made the disclosure regarding the status of the large frontier developer’s investigation of the disclosure and the actions taken by the large frontier developer in response to the disclosure"
     ],
     "note": null,
     "doubt": "The text presupposes an investigation by requiring updates on its status; it does not order one in so many words.",
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Labor Code § 1107.1(e)(2)(A)",
     "quotes": [
      "the disclosures and responses of the process required by this subdivision shall be shared with officers and directors of the large frontier developer at least once each quarter"
     ],
     "note": "Shared inside the company, not with a public body.",
     "doubt": "A disclosure that reveals a critical safety incident falls under B&P § 22757.13(c)(1), fifteen days from discovery.",
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.28,
   "z": 0.86
  },
  {
   "id": "CN1",
   "short": "developers, institutions",
   "receiver_name": "developers, service providers, technical institutions",
   "receiver": "other party",
   "receiver_party": "no",
   "instrument": "china",
   "instrument_short": "China Framework 2.0",
   "binding": "voluntary",
   "what": "Sharing of vulnerabilities, risks, threats and safety incidents",
   "ref": "§ 5.9",
   "sender": "developers, service providers, technical institutions",
   "trigger": "event short of harm",
   "sender_passage": "establish a risk and threat information sharing mechanism that covers developers, service providers, and special technical institutions",
   "sender_ref": "§ 5.9",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "none",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "§ 5.9",
     "quotes": [
      "We should track and analyze AI technologies, products, service safety vulnerabilities, defects, risks, threats, and safety incidents."
     ],
     "note": null,
     "doubt": "'We' is the framework's own voice, not the receiver's commitment.",
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "§ 5.9",
     "quotes": [
      "We should advance international exchange and cooperation on sharing AI risks and threat information"
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "CN",
   "seat": "its receivers sit in China",
   "x": 0.8,
   "z": 0.42
  },
  {
   "id": "CN2",
   "short": "a complaints mechanism",
   "receiver_name": "a mechanism for public complaints, unnamed",
   "receiver": "other party",
   "receiver_party": "no",
   "instrument": "china",
   "instrument_short": "China Framework 2.0",
   "binding": "voluntary",
   "what": "Public complaints and reports on AI risks",
   "ref": "§ 5.13",
   "sender": "the public",
   "trigger": "event short of harm",
   "sender_passage": "A mechanism for handling public complaints and reports on AI risks and hazards should be established",
   "sender_ref": "§ 5.13",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "§ 5.13",
     "quotes": [
      "A mechanism for handling public complaints and reports on AI risks and hazards should be established"
     ],
     "note": null,
     "doubt": "'Handling' is read as examining the complaint; the text says no more.",
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "CN",
   "seat": "its receivers sit in China",
   "x": 0.85,
   "z": 0.34
  },
  {
   "id": "AS1",
   "short": "regulators, users",
   "receiver_name": "regulators, users, customers or value-chain participants",
   "receiver": "other party",
   "receiver_party": "no",
   "instrument": "asean",
   "instrument_short": "ASEAN Guide",
   "binding": "voluntary",
   "what": "Incident reporting outside the organisation",
   "ref": "§ 3.4",
   "sender": "an organisation",
   "trigger": "harm",
   "sender_passage": "Externally, it refers to the capability to report incidents to key stakeholders outside an organisation when required or needed. Such stakeholders can include regulatory authorities, users, customers, or value chain participants.",
   "sender_ref": "§ 3.4",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "none",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "The guide describes reporting and names areas for ASEAN to explore; it asks nothing of a receiver.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.92,
   "z": 0.47
  },
  {
   "id": "G7-1",
   "short": "the organisation itself",
   "receiver_name": "the organisation itself",
   "receiver": "own record",
   "receiver_party": "yes",
   "instrument": "haip",
   "instrument_short": "G7 Hiroshima Code",
   "binding": "voluntary",
   "what": "Reports of issues and vulnerabilities by users and third parties",
   "ref": "Principle 2",
   "sender": "users and third parties",
   "trigger": "event short of harm",
   "sender_passage": "facilitating third-party and user discovery and reporting of issues and vulnerabilities after deployment such as through bounty systems, contests, or prizes",
   "sender_ref": "Principle 2",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Principle 2",
     "quotes": [
      "Organizations should use, as and when appropriate commensurate to the level of risk, AI systems as intended and monitor for vulnerabilities, incidents, emerging risks and misuse after deployment"
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Principle 2",
     "quotes": [
      "and take appropriate action to address these. Organizations are encouraged to consider"
     ],
     "note": "On its own system: 'mitigate the identified risks and vulnerabilities' is also only encouraged.",
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Principle 4",
     "quotes": [
      "Organizations should also collaborate and share the aforementioned information with relevant public authorities, as appropriate."
     ],
     "note": null,
     "doubt": "Principle 4 is the sharing signal G7-3 itself, read here for what the receiver of a user's report should do with it.",
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.28,
   "z": 0.4
  },
  {
   "id": "G7-3",
   "short": "others, the public",
   "receiver_name": "other organisations, the public, public authorities",
   "receiver": "public",
   "receiver_party": "no",
   "instrument": "haip",
   "instrument_short": "G7 Hiroshima Code",
   "binding": "voluntary",
   "what": "Sharing of risks, dangerous capabilities and attempts to circumvent safeguards",
   "ref": "Principle 4",
   "sender": "an organisation",
   "trigger": "event short of harm",
   "sender_passage": "Organizations should collaborate with other organizations across the AI lifecycle to share and report relevant information to the public with a view to advancing safety, security and trustworthiness of advanced AI systems.",
   "sender_ref": "Principle 4",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "none",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "The Code addresses the organisations that share; it asks nothing of those who receive.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.34,
   "z": 0.3
  },
  {
   "id": "PC3",
   "short": "governments, companies",
   "receiver_name": "governments and other companies",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "paris",
   "instrument_short": "Paris Call",
   "binding": "voluntary",
   "what": "Timely sharing of AI control incidents and precursor signals",
   "ref": "Third commitment",
   "sender": "developers, governments and companies",
   "trigger": "event short of harm",
   "sender_passage": "share timely information on serious cyber and AI control incidents and other material precursor signals of serious harm, whether it's between companies and government, between governments or between AI companies",
   "sender_ref": "Third commitment",
   "sender_deadline_h": "prompt",
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "none",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Third commitment",
     "quotes": [
      "Thirdly, policy makers, researchers and developers are committed to information sharing, reporting and early warning systems."
     ],
     "note": "Corrected by the Field's check of 27 November (study 96): duty to none. The third commitment commits its signatories to 'information sharing, reporting and early warning systems' and only 'recognize[s] the value' of sharing timely information; the first coding's own doubt said so. A commitment to build systems is no duty to pass on a given word.",
     "doubt": "A commitment to systems of sharing, not a duty to forward a given report; the sentence on 'timely information' only recognises the value of it.",
     "corrected": {
      "first": "duty",
      "final": "none",
      "why": "The third commitment commits its signatories to 'information sharing, reporting and early warning systems' and only 'recognize[s] the value' of sharing timely information; the first coding's own doubt said so. A commitment to build systems is no duty to pass on a given word."
     }
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.47,
   "z": 0.33
  },
  {
   "id": "PC4",
   "short": "confidential channels",
   "receiver_name": "policy makers' confidential channels",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "paris",
   "instrument_short": "Paris Call",
   "binding": "voluntary",
   "what": "Confidential channels for whistleblowers",
   "ref": "Third commitment, policy makers",
   "sender": "whistleblowers",
   "trigger": "event short of harm",
   "sender_passage": "Policy makers commit to offer secure and confidential channels through which whistleblowers, including employees and other relevant stakeholders, can raise concerns about systemic risks",
   "sender_ref": "Third commitment, policy makers",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": "Policy makers commit to offer the channels, and to nothing about what arrives through them.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Third commitment",
     "quotes": [
      "Policy makers commit to offer secure and confidential channels through which whistleblowers, including employees and other relevant stakeholders, can raise concerns about systemic risks"
     ],
     "note": "The commitment is to the channel; nothing is said of what is done with a concern raised through it.",
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.52,
   "z": 0.27
  },
  {
   "id": "NY4",
   "short": "DFS office",
   "receiver_name": "office in the Department of Financial Services",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "raise",
   "instrument_short": "New York RAISE Act",
   "binding": "law",
   "what": "Critical safety incidents within 72 hours",
   "ref": "GBL § 1422(3)(a); § 1420(4); § 1422(7)",
   "sender": "a frontier developer",
   "trigger": "event short of harm",
   "sender_passage": "report any critical safety incident pertaining to one or more of its frontier models to the office within seventy-two hours from a determination that a critical safety incident has occurred",
   "sender_ref": "GBL § 1422(3)(a); § 1420(4); § 1422(7)",
   "sender_deadline_h": 72,
   "sender_deadline_max_h": null,
   "sender_clock": "awareness",
   "sender_failure": {
    "v": "penalty",
    "max": 1000000,
    "who": "the attorney general, in a civil action",
    "ref": "GBL § 1427(1)",
    "quotes": [
     "The attorney general may bring a civil action to recover a civil penalty in an amount not to exceed one million dollars for a first violation and in an amount not to exceed three million dollars per subsequent violation",
     "fails to report an incident as required by section fourteen hundred twenty-two of this article"
    ],
    "note": "Up to 3,000,000 dollars for each later violation; it names a large frontier developer, while the duty to report lies on every frontier developer."
   },
   "receiver_failure": {
    "v": "none",
    "ref": "GBL § 1427(2)",
    "quotes": [
     "Nothing in this article shall be construed to establish, authorize or create a private right of action associated with violations of this article."
    ],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "duty",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "GBL § 1422(4)",
     "quotes": [
      "The office shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "GBL § 1422(5)(a)",
     "quotes": [
      "The office may transmit reports of critical safety incidents or summaries of any assessments of catastrophic risk from internal use of frontier models to other governmental entities at their discretion",
      "The office shall consider transmitting such reports or summaries to the office of the attorney general, as appropriate."
     ],
     "note": "A duty to consider transmitting to the attorney general, not a duty to transmit.",
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "GBL § 1422(6)",
     "quotes": [
      "are exempt from disclosure under article six of the public officers law"
     ],
     "note": "The reports are exempt from New York's freedom of information law; nothing requires publishing one.",
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "duty",
     "deadline_h": "periodic",
     "deadline_max_h": null,
     "ref": "GBL § 1422(7)",
     "quotes": [
      "Beginning January first, two thousand twenty-eight, and annually thereafter, the office shall produce a report, that includes the following: (i) anonymized and aggregated information about critical safety incidents that have been reviewed by the office"
     ],
     "note": null,
     "doubt": "The text has the report transmitted to the governor and named legislators (§ 1422(7)(c)); it does not say the report is published.",
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.4,
   "z": 0.78
  },
  {
   "id": "NY5",
   "short": "an authority",
   "receiver_name": "an appropriate authority (law enforcement or public safety)",
   "receiver": "public body",
   "receiver_party": "no",
   "instrument": "raise",
   "instrument_short": "New York RAISE Act",
   "binding": "law",
   "what": "Imminent danger, to an authority within a day",
   "ref": "GBL § 1422(3)(b)",
   "sender": "a frontier developer",
   "trigger": "event short of harm",
   "sender_passage": "the frontier developer shall disclose that incident within twenty-four hours to an authority, including any law enforcement agency or public safety agency with jurisdiction",
   "sender_ref": "GBL § 1422(3)(b)",
   "sender_deadline_h": 24,
   "sender_deadline_max_h": null,
   "sender_clock": "awareness",
   "sender_failure": {
    "v": "penalty",
    "max": 1000000,
    "who": "the attorney general, in a civil action",
    "ref": "GBL § 1427(1)",
    "quotes": [
     "The attorney general may bring a civil action to recover a civil penalty in an amount not to exceed one million dollars for a first violation and in an amount not to exceed three million dollars per subsequent violation",
     "fails to report an incident as required by section fourteen hundred twenty-two of this article"
    ],
    "note": "Up to 3,000,000 dollars for each later violation; it names a large frontier developer, while the duty to report lies on every frontier developer."
   },
   "receiver_failure": {
    "v": "none",
    "ref": "GBL § 1427(2)",
    "quotes": [
     "Nothing in this article shall be construed to establish, authorize or create a private right of action associated with violations of this article."
    ],
    "note": null
   },
   "note": "The Act gives the authority no task; it names it only as the place of disclosure.",
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.36,
   "z": 0.69
  },
  {
   "id": "NY6",
   "short": "DFS office",
   "receiver_name": "office in the Department of Financial Services",
   "receiver": "public body",
   "receiver_party": "yes",
   "instrument": "raise",
   "instrument_short": "New York RAISE Act",
   "binding": "law",
   "what": "Anyone may report a critical safety incident",
   "ref": "GBL § 1422(1), (4)",
   "sender": "any member of the public",
   "trigger": "event short of harm",
   "sender_passage": "The office shall establish a mechanism to be used by a frontier developer or a member of the public to report a critical safety incident",
   "sender_ref": "GBL § 1422(1), (4)",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "n/a",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": "GBL § 1427(2)",
    "quotes": [
     "Nothing in this article shall be construed to establish, authorize or create a private right of action associated with violations of this article."
    ],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "GBL § 1422(4)",
     "quotes": [
      "The office shall review critical safety incident reports submitted by frontier developers and may review reports submitted by members of the public."
     ],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "order": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "pass_on": {
     "v": "power",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "GBL § 1422(5)(a)",
     "quotes": [
      "The office may transmit reports of critical safety incidents or summaries of any assessments of catastrophic risk from internal use of frontier models to other governmental entities at their discretion",
      "The office shall consider transmitting such reports or summaries to the office of the attorney general, as appropriate."
     ],
     "note": "A duty to consider transmitting to the attorney general, not a duty to transmit.",
     "doubt": "§ 1422(5)(a) names 'reports of critical safety incidents', read to include reports by the public.",
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "GBL § 1422(6)",
     "quotes": [
      "are exempt from disclosure under article six of the public officers law"
     ],
     "note": "The reports are exempt from New York's freedom of information law; nothing requires publishing one.",
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "duty",
     "deadline_h": "periodic",
     "deadline_max_h": null,
     "ref": "GBL § 1422(7)",
     "quotes": [
      "Beginning January first, two thousand twenty-eight, and annually thereafter, the office shall produce a report, that includes the following: (i) anonymized and aggregated information about critical safety incidents that have been reviewed by the office"
     ],
     "note": null,
     "doubt": "Only incidents the office reviewed, and it need not review a public report; transmitted to the governor and named legislators, not said to be published.",
     "corrected": null
    }
   },
   "tone": "US",
   "seat": "its seat is in the United States",
   "x": 0.45,
   "z": 0.84
  },
  {
   "id": "GPA2",
   "short": "the deploying organisation",
   "receiver_name": "the organisation deploying the agent",
   "receiver": "own record",
   "receiver_party": "no",
   "instrument": "gpa",
   "instrument_short": "Privacy Assembly",
   "binding": "voluntary",
   "what": "Monitoring and reporting of unexpected behaviour after deployment",
   "ref": "Operative measures, testing and monitoring",
   "sender": "the organisation's own monitoring",
   "trigger": "event short of harm",
   "sender_passage": "measures should be in place to monitor for and report on unexpected behaviors or failures.",
   "sender_ref": "Operative measures, testing and monitoring",
   "sender_deadline_h": null,
   "sender_deadline_max_h": null,
   "sender_clock": "none",
   "sender_failure": {
    "v": "none",
    "max": null,
    "who": null,
    "ref": null,
    "quotes": [],
    "note": null
   },
   "receiver_failure": {
    "v": "none",
    "ref": null,
    "quotes": [],
    "note": null
   },
   "note": null,
   "acts": {
    "acknowledge": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "investigate": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Operative measures, governance",
     "quotes": [
      "establishing procedures to detect, investigate and respond to incidents"
     ],
     "note": null,
     "doubt": "Given as an example of a measure organisations should implement.",
     "corrected": null
    },
    "order": {
     "v": "recommended",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": "Operative measures, limits",
     "quotes": [
      "enabling users or operators to pause or stop execution"
     ],
     "note": null,
     "doubt": "Given as an example of a measure organisations should implement.",
     "corrected": null
    },
    "pass_on": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    },
    "tell_public_aggregate": {
     "v": "none",
     "deadline_h": null,
     "deadline_max_h": null,
     "ref": null,
     "quotes": [],
     "note": null,
     "doubt": null,
     "corrected": null
    }
   },
   "tone": "XX",
   "seat": "the text names it by role and not by seat",
   "x": 0.15,
   "z": 0.36
  }
 ],
 "counts": {
  "lines": 19,
  "law": 9,
  "voluntary": 10,
  "public_body": 11,
  "must_answer": [
   "CA8"
  ],
  "must_answer_public": [],
  "must_review_public": [
   "CA4",
   "NY4"
  ],
  "may_review_public": [
   "EU4",
   "CA6",
   "NY6"
  ],
  "may_order_public": [
   "EU4"
  ],
  "must_order_public": [],
  "must_tell_public": [],
  "yearly_total": [
   "CA4",
   "CA6",
   "CA7",
   "NY4",
   "NY6"
  ],
  "clocked_public": [],
  "receiver_failure_named": [
   "CA8"
  ],
  "no_task_public": [
   "COP3",
   "CA5",
   "NY5"
  ],
  "nothing_on_receipt_public": [
   "COP3",
   "CA5",
   "PC3",
   "PC4",
   "NY5"
  ],
  "sender_fined": [
   "EU4",
   "CA4",
   "CA5",
   "NY4",
   "NY5"
  ],
  "public_may_send": [
   "COP5",
   "CA6",
   "CN2",
   "G7-1",
   "NY6"
  ],
  "must_pass_on_public": [],
  "tones": {
   "US": 7,
   "BE": 2,
   "CN": 2,
   "XX": 8
  }
 },
 "itu_parsed": {
  "read": 144,
  "commonest": [
   "425",
   "1.0",
   "4.0"
  ],
  "commonest_n": 44
 }
};
