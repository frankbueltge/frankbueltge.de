// Written by build.py. The reading stands there; do not edit here.
window.IWN = {
 "stations": [
  {
   "id": "border",
   "name": "The border",
   "how": "an export licence"
  },
  {
   "id": "land",
   "name": "Land and water",
   "how": "a rezoning, an annexation, an environmental permit"
  },
  {
   "id": "grid",
   "name": "The grid",
   "how": "a connection, a supply contract"
  },
  {
   "id": "market",
   "name": "The market",
   "how": "a merger or contract review"
  },
  {
   "id": "model",
   "name": "The running model",
   "how": "a duty on whoever trains or offers it"
  }
 ],
 "verbs": [
  {
   "id": "stopped",
   "name": "Stopped",
   "asked": true
  },
  {
   "id": "delayed",
   "name": "Delayed",
   "asked": true
  },
  {
   "id": "conditioned",
   "name": "Put conditions on",
   "asked": true
  },
  {
   "id": "passed",
   "name": "Looked, and let pass",
   "asked": false
  },
  {
   "id": "charged",
   "name": "Charged afterwards",
   "asked": false
  },
  {
   "id": "asking",
   "name": "Is asking",
   "asked": false
  }
 ],
 "holds": [
  {
   "id": "ask",
   "name": "They had to ask",
   "how": "a licence, an acceptance, an annexation, a clearance: nothing goes ahead without a yes"
  },
  {
   "id": "caught",
   "name": "They were caught",
   "how": "a charge for something already done"
  },
  {
   "id": "own",
   "name": "The body came by itself",
   "how": "an inquiry or an order on its own motion"
  },
  {
   "id": "suit",
   "name": "A neighbour sued",
   "how": "a court moved by someone affected"
  }
 ],
 "publics": [
  {
   "id": "nation",
   "name": "A nation against another"
  },
  {
   "id": "customers",
   "name": "Customers of a grid"
  },
  {
   "id": "residents",
   "name": "Residents and their water"
  },
  {
   "id": "market",
   "name": "Buyers and rivals in a market"
  },
  {
   "id": "subjects",
   "name": "People whose data it is"
  }
 ],
 "says": [
  {
   "id": "yes",
   "name": "Says AI"
  },
  {
   "id": "no",
   "name": "Does not say AI"
  },
  {
   "id": "aside",
   "name": "Says AI only beside the act"
  },
  {
   "id": "unread",
   "name": "The act's own text was not read"
  }
 ],
 "after": [
  {
   "id": "lifted",
   "name": "Lifted"
  },
  {
   "id": "around",
   "name": "Gone around"
  },
  {
   "id": "stands",
   "name": "Stands"
  },
  {
   "id": "none",
   "name": "Nothing to lift"
  },
  {
   "id": "open",
   "name": "Still open"
  }
 ],
 "cases": [
  {
   "id": "h20",
   "short": "Nvidia, 2025",
   "station": "border",
   "date": "2025-04-09",
   "place": "United States",
   "body": "The US government, as the addressee reported it",
   "party": "Nvidia",
   "thing": "H20 chips bound for China",
   "verb": "stopped",
   "hold": "ask",
   "public": "nation",
   "says": "no",
   "after": "lifted",
   "act": "the USG requires a license for export to China (including Hong Kong and Macau) and D:5 countries",
   "name": "the risk that the covered products may be used in, or diverted to, a supercomputer in China",
   "law": "US export controls. The notice itself is not public; it is known from the company's filing, which names no statute.",
   "says_note": "The filing's account of the notice speaks of a supercomputer. It does not say artificial intelligence.",
   "then": [
    "In August 2025, the USG granted licenses that would allow us to ship certain H20 products to certain China-based customers",
    "USG officials have expressed an expectation that the USG will receive 15% or more of the revenue generated from licensed sales of our products, but to date, the USG has not published a regulation codifying such requirement"
   ],
   "then_plain": "Four months later licences were granted. The company reports that officials expect a share of the revenue, under no published rule.",
   "days": null,
   "months": 4,
   "src": [
    [
     "Nvidia, Form 8-K, report of 9 April 2025",
     "https://www.sec.gov/Archives/edgar/data/1045810/000104581025000082/nvda-20250409.htm",
     "through a reading service; sec.gov refused the direct fetch"
    ],
    [
     "Nvidia, Form 10-Q, quarter ended 26 October 2025",
     "https://www.sec.gov/Archives/edgar/data/1045810/000104581025000230/nvda-20251026.htm",
     "through a reading service"
    ]
   ]
  },
  {
   "id": "smug",
   "short": "14 charged, 2025 to 2026",
   "station": "border",
   "date": "2025-08-05",
   "date_to": "2026-10-01",
   "place": "United States",
   "body": "US Department of Justice, five announcements",
   "party": "13 people and one small company",
   "thing": "chips and servers sent to China without a licence",
   "verb": "charged",
   "hold": "caught",
   "public": "nation",
   "says": "yes",
   "after": "open",
   "act": "are charged with violating the Export Control Reform Act, a felony that carries a statutory maximum penalty of 20 years in prison",
   "name": "pleaded guilty to smuggling cutting-edge Artificial Intelligence (AI) technology out of the United States",
   "law": "Export Control Reform Act (2018), named in four of the six charging entries the Field recorded.",
   "says_note": "The release of 8 December 2025 is headed with AI and calls the chips AI technology.",
   "then": [
    "the United States has seized over $50 million in Nvidia technologies and cash"
   ],
   "then_plain": "Two guilty pleas; the Field found no sentence and no penalty imposed. None of the fourteen holds a counted chip.",
   "days": null,
   "months": null,
   "src": [
    [
     "The Field, study 70, results70.json (the count, the parties, the quoted passages)",
     "https://github.com/frankbueltge/field-research/blob/main/artifacts/after-cycle-013/what-reaches-the-kept-share/results70.json",
     "sibling material, hash asserted"
    ],
    [
     "US Department of Justice, release of 8 December 2025",
     "https://www.justice.gov/opa/pr/us-authorities-shut-down-major-china-linked-ai-tech-smuggling-network",
     "direct"
    ]
   ]
  },
  {
   "id": "tucson",
   "short": "Project Blue, 2025",
   "station": "land",
   "date": "2025-08-06",
   "place": "Tucson, Arizona",
   "body": "Mayor and Council of the City of Tucson",
   "party": "Beale Infrastructure (Project Blue)",
   "thing": "a data centre campus on 290 acres, to be annexed and given city water",
   "verb": "stopped",
   "hold": "ask",
   "public": "residents",
   "says": "unread",
   "after": "around",
   "act": "the City of Tucson Mayor and Council voted to not proceed with annexation of the project site",
   "name": "construction of an 18-mile reclaimed water line to serve the cooling needs for the project",
   "law": "A city's power to annex land and to serve it with water.",
   "says_note": "The city's own minute was not read. The county's memorandum and the developer's letter, read here, do not say artificial intelligence.",
   "then": [
    "Contemplates the sale proceeding without annexation",
    "will consume no water, potable or otherwise, for industrial cooling"
   ],
   "then_plain": "The same site, outside the city: the county's sale stood, the design changed to air cooling, and four months later the state's utility commission approved the power contract (the next gate).",
   "days": null,
   "months": 4,
   "src": [
    [
     "Pima County Administrator, memorandum of 17 September 2025, with the developer's letter",
     "https://content.civicplus.com/api/assets/2192e865-fe7e-48f4-8a0c-7c1c8b5cd32c",
     "direct"
    ]
   ]
  },
  {
   "id": "chile",
   "short": "Google, 2024",
   "station": "land",
   "date": "2024-02-27",
   "place": "Santiago, Chile",
   "body": "Segundo Tribunal Ambiental (Second Environmental Court)",
   "party": "Google (Cerrillos Data Center)",
   "thing": "a data centre cooled with groundwater",
   "verb": "delayed",
   "hold": "suit",
   "public": "residents",
   "says": "no",
   "after": "open",
   "act": "el proyecto no puede ser ejecutado hasta no contar con esta última resolución",
   "act_en": "the project cannot be carried out until it has this last resolution",
   "name": "impactos significativos sobre el Acuífero Santiago Central",
   "name_en": "significant impacts on the Santiago Central aquifer",
   "law": "Chile's environmental assessment: the permit was annulled in part and sent back.",
   "says_note": "The court's notice speaks of servers, cooling and an aquifer.",
   "then": [
    "La acción solo fue continuada por una vecina",
    "reemplazar las torres de enfriamiento en base a agua por enfriadoras de condensación por aire"
   ],
   "then_en": [
    "The action was carried on by one neighbour alone",
    "to replace the water-based cooling towers with air-condensing chillers"
   ],
   "then_plain": "Fourteen residents and the municipality had sued; all but one withdrew when the firm said it would cool with air. What became of the project after the judgment was not read here.",
   "days": null,
   "months": null,
   "src": [
    [
     "Tribunal Ambiental, notice of the judgment in R-27/270-2020, 27 February 2024",
     "https://tribunalambiental.cl/sentencia-r27-270-2020-cerrillos-data-center",
     "direct; the translations are this practice's"
    ]
   ]
  },
  {
   "id": "ferc",
   "short": "Amazon and Talen, 2024",
   "station": "grid",
   "date": "2024-11-01",
   "place": "United States",
   "body": "Federal Energy Regulatory Commission",
   "party": "PJM, Susquehanna Nuclear (Talen) and a data centre campus of Amazon's",
   "thing": "raising the load fed straight from a nuclear plant from 300 to 480 megawatts",
   "verb": "stopped",
   "hold": "ask",
   "public": "customers",
   "says": "aside",
   "after": "around",
   "act": "we reject the Amended ISA",
   "name": "huge ramifications for grid reliability and consumer costs",
   "law": "Federal Power Act (1935), section 205: an agreement that departs from the standard form must be shown to be necessary.",
   "says_note": "The order rests on a burden not met. It says AI once, in a line quoted from a reliability body's list of large loads. The dissent spells it out, as the reason not to stop: \"maintaining U.S. leadership in Artificial Intelligence (AI) is necessary to maintaining our national security\". The words on consumer costs are the concurring commissioner's.",
   "then": [
    "Talen will provide Amazon with 1,920 megawatts of carbon-free nuclear power through 2042",
    "arrangement after the completion of transmission reconfigurations expected in the Spring of 2026"
   ],
   "then_plain": "Seven months later the two firms agreed four times the refused load, delivered through the grid instead of behind the meter.",
   "days": null,
   "months": 7,
   "src": [
    [
     "FERC, order of 1 November 2024, 189 FERC ¶ 61,078, with concurrence and dissent",
     "https://www.ferc.gov/sites/default/files/2024-11/20241101-3061_ER24-2172-000.pdf",
     "direct"
    ],
    [
     "Talen Energy, release of 11 June 2025",
     "https://ir.talenenergy.com/news-releases/news-release-details/talen-energy-expands-nuclear-energy-relationship-amazon",
     "through a search service's excerpt; the site refused the direct fetch"
    ]
   ]
  },
  {
   "id": "acc",
   "short": "Project Blue, 2025",
   "station": "grid",
   "date": "2025-12-03",
   "place": "Arizona",
   "body": "Arizona Corporation Commission",
   "party": "Tucson Electric Power and Humphrey's Peak Power (the Project Blue site)",
   "thing": "a ten-year contract to supply the campus",
   "verb": "conditioned",
   "hold": "ask",
   "public": "customers",
   "says": "no",
   "after": "stands",
   "act": "voted 4-1 on Wednesday, December 3, 2025",
   "name": "to ensure that residential ratepayers are protected from cost shifts",
   "law": "A state utility commission's review of a special contract.",
   "says_note": "The commission's release speaks of a data center campus and of ratepayers.",
   "then": [
    "minimum monthly billing requirements"
   ],
   "then_plain": "Approved, with terms: minimum bills, a slow ramp, the campus pays for its own lines. No later act was looked for.",
   "days": null,
   "months": null,
   "src": [
    [
     "Arizona Corporation Commission, release of 5 December 2025",
     "https://www.azcc.gov/Rene-Lopez/news/2025/12/05/acc-approves-tep-energy-supply-agreement--ensures-customer-protections-from-costs-related-to-data-center-project",
     "direct"
    ]
   ]
  },
  {
   "id": "cma",
   "short": "Microsoft and OpenAI, 2025",
   "station": "market",
   "date": "2025-03-05",
   "place": "United Kingdom",
   "body": "Competition and Markets Authority",
   "party": "Microsoft and OpenAI",
   "thing": "a partnership in which one firm was the other's only supplier of compute",
   "verb": "passed",
   "hold": "own",
   "public": "market",
   "says": "yes",
   "after": "none",
   "act": "the CMA does not believe that it is or may be the case that the Partnership, in its current form, gives rise to a relevant merger situation",
   "name": "substantial lessening of competition (SLC) in the UK",
   "law": "Enterprise Act 2002: the authority may act only where one firm gains control of another.",
   "says_note": "The decision speaks of AI throughout, and records that Microsoft has been the exclusive supplier of compute infrastructure to OpenAI.",
   "then": [],
   "then_plain": "Opened on 8 December 2023, closed fifteen months later without a reference. Nothing was stopped, so nothing was lifted.",
   "days": null,
   "months": null,
   "src": [
    [
     "CMA, Microsoft / OpenAI partnership, summary of the decision, 5 March 2025",
     "https://assets.publishing.service.gov.uk/media/67c841d6d0fba2f1334cf276/1._MS.OAI_-_Summary.pdf",
     "direct"
    ]
   ]
  },
  {
   "id": "ec",
   "short": "Nvidia and Run:ai, 2024",
   "station": "market",
   "date": "2024-12-20",
   "place": "European Union",
   "body": "European Commission",
   "party": "Nvidia and Run:ai",
   "thing": "the chip maker buying software that schedules work on its chips",
   "verb": "passed",
   "hold": "ask",
   "public": "market",
   "says": "yes",
   "after": "none",
   "act": "It therefore cleared the transaction unconditionally",
   "name": "would not raise competition concerns on any of the markets examined in the EEA or in Italy",
   "law": "EU Merger Regulation (2004), after Italy called the deal in and referred it.",
   "says_note": "The release speaks of customers' artificial intelligence compute infrastructure.",
   "then": [],
   "then_plain": "Cleared without conditions. Nothing was stopped, so nothing was lifted.",
   "days": null,
   "months": null,
   "src": [
    [
     "European Commission, press release IP/24/6548, 20 December 2024",
     "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_6548",
     "direct, through the press corner's document address"
    ]
   ]
  },
  {
   "id": "garante",
   "short": "ChatGPT, 2023",
   "station": "model",
   "date": "2023-03-30",
   "place": "Italy",
   "body": "Garante per la protezione dei dati personali",
   "party": "OpenAI (ChatGPT)",
   "thing": "the service, for everyone in Italy",
   "verb": "stopped",
   "hold": "own",
   "public": "subjects",
   "says": "aside",
   "after": "lifted",
   "act": "la misura della limitazione provvisoria",
   "act_en": "the measure of a provisional limitation",
   "name": "interessati stabiliti nel territorio italiano",
   "name_en": "data subjects established on Italian territory",
   "law": "General Data Protection Regulation (2016), Article 58(2)(f).",
   "says_note": "The order speaks of personal data, users and their age. Artificial intelligence stands in the headline of the authority's press release, not in the order.",
   "then": [
    "OpenAI ha reso nuovamente accessibile ChatGPT agli utenti italiani"
   ],
   "then_en": [
    "OpenAI has made ChatGPT accessible again to Italian users"
   ],
   "then_plain": "Twenty-nine days later, after the firm had changed its notices and added a way to object, the service was back.",
   "days": 29,
   "months": 1,
   "src": [
    [
     "Garante, order of 30 March 2023 [9870832]",
     "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9870832",
     "direct; the translations are this practice's"
    ],
    [
     "Garante, release of 28 April 2023 [9881490]",
     "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9881490",
     "direct"
    ]
   ]
  },
  {
   "id": "ca",
   "short": "OpenAI, 2026",
   "station": "model",
   "date": "2026-09-30",
   "place": "California",
   "body": "Attorney General of California",
   "party": "OpenAI",
   "thing": "incidents from the operation of its models",
   "verb": "asking",
   "hold": "own",
   "public": "subjects",
   "says": "yes",
   "after": "open",
   "act": "yesterday served an investigative subpoena on OpenAI as part of the California Department of Justice's (DOJ) ongoing investigation of incidents resulting from the operations of OpenAI and its artificial intelligence (AI) models",
   "name": "Developers that fail to do so can and should be held legally accountable, and my office is committed to determining if that is the case here.",
   "law": "The release names no statute (the Field, study 70).",
   "says_note": "The release names the firm's artificial intelligence (AI) models. It names no public beyond the office itself; it is filed here with the people a harm would fall on, which is this reader's choice.",
   "then": [],
   "then_plain": "A subpoena was served. Nothing has been stopped, delayed or made conditional.",
   "days": null,
   "months": null,
   "src": [
    [
     "The Field, study 70, results70.json",
     "https://github.com/frankbueltge/field-research/blob/main/artifacts/after-cycle-013/what-reaches-the-kept-share/results70.json",
     "sibling material, hash asserted"
    ],
    [
     "Attorney General of California, release of 1 October 2026",
     "https://oag.ca.gov/news/press-releases/part-ongoing-investigation-attorney-general-bonta-serves-investigative-subpoena",
     "as the Field fetched it"
    ]
   ]
  }
 ],
 "voices": {
  "dewey": [
   "The lasting, extensive and serious consequences of associated activity bring into existence a public. In itself it is unorganized and formless. By means of officials and their special powers it becomes a state.",
   "There is too much public, a public too diffused and scattered and too intricate in composition. And there are too many publics",
   "the resultant public cannot identify and distinguish itself"
  ],
  "sastry": "it is detectable, excludable, and quantifiable, and is produced via an extremely concentrated supply chain",
  "dcw": [
   "$64 billion in U.S. data center projects have been blocked or delayed by a growing wave of local, bipartisan opposition",
   "attributing delays exclusively to these factors oversimplifies a complex landscape"
  ]
 },
 "field": {
  "parties": 14,
  "persons": 13,
  "companies": 1,
  "announcements": 5,
  "admitted": 2,
  "holders": 0
 }
};
