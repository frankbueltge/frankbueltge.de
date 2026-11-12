#!/usr/bin/env python3
"""Study 71 (session 269, 2026-11-12): where a public body has in fact acted on AI compute.

Cycle 014, step 2 of the programme. Fetches each record from its publisher, hashes it, checks every quoted
passage against the file as fetched, codes the acts (point of the chain, effect, rule or case, level and kind
of body, territory, ground, named party), and scores predictions P89 to P95 (PREDICTIONS71.md, committed
before any search). Writes results71.json and data71.js.

Usage: python3 analyse71.py [cache-dir]     (standard library only; pdftotext for the PDFs)
"""
import hashlib, html, json, os, re, subprocess, sys, urllib.request

UA = "field-research study (research use) meridian@field-research.invalid"
UA_B = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
HERE = os.path.dirname(os.path.abspath(__file__))
TODAY = "2026-11-12"

# The searches that led to the register (web research of 2026-11-12), one line per point of the chain.
SEARCHES = {
    "chip": ["the chip maker's filings on export licences for China", "the export agency's rule of October 2022",
             "the export agency's rule of 2026 on the H200"],
    "site": ["a city council's vote on a named data-centre annexation", "a county rezoning voided by a court",
             "the Dutch decision on hyperscale data centres", "Singapore's pause on new data centres",
             "the Chilean environmental court on a data centre", "a county board's moratorium on data centres (2026)",
             "a county council's refusal of a named holder's data centre in Ireland",
             "a county health department's air permit for a developer's turbines"],
    "power": ["the US energy regulator's order on a co-located data-centre load", "the Irish regulator's connection policy for data centres",
              "a state utility commission's data-centre tariff", "a state law on large loads"],
    "deal": ["the UK competition authority's decisions on cloud-developer partnerships", "the US trade commission's study of the same partnerships",
             "any authority blocking or conditioning a compute agreement or data-centre acquisition (since 2025-09)"],
    "model": ["the Italian data-protection authority on two chatbots", "the Irish data-protection authority on two holders' model training",
              "the Brazilian data-protection authority on a holder's model training", "a ministry's block of a developer's chatbot (2026)"],
}

DOCS = {  # id: (what, url, browser-like client needed)
    "FR22": ("US Bureau of Industry and Security, interim final rule, 87 FR 62186 (published 2022-10-13)",
             "https://www.govinfo.gov/content/pkg/FR-2022-10-13/html/2022-21658.htm", False),
    "FR23": ("US Bureau of Industry and Security, interim final rule, 88 FR 73458 (published 2023-10-25)",
             "https://www.govinfo.gov/content/pkg/FR-2023-10-25/html/2023-23055.htm", False),
    "NV10Q": ("NVIDIA Corporation, Form 10-Q for the quarter ended 2025-07-27",
              "https://www.sec.gov/Archives/edgar/data/1045810/000104581025000209/nvda-20250727.htm", False),
    "NV10K": ("NVIDIA Corporation, Form 10-K for the fiscal year ended 2026-01-25",
              "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm", False),
    "BISNEWS": ("US Bureau of Industry and Security, News and Updates (release of 2026-01-13)", "https://www.bis.gov/news-updates", True),
    "TUCSON": ("City of Tucson, Motions adopted under the study session item on Project Blue, 2025-08-06",
               "https://www.tucsonaz.gov/files/sharedassets/public/v/1/government/city-manager-office/documents/motions-adopted-under-aug-6.pdf", False),
    "PWC": ("Prince William County, Planning Office, PW Digital Gateway (update of 2026-08-05)",
            "https://www.pwcva.gov/department/planning-office/pw-digital-gateway", True),
    "NLKV": ("Netherlands, answers of the Minister of Housing and Spatial Planning to parliamentary questions, Aanhangsel 2025-2026 no. 1519 (received 2026-04-02)",
             "https://zoek.officielebekendmakingen.nl/ah-tk-20252026-1519.html", True),
    "SGEDB": ("Singapore Economic Development Board and IMDA, release of 2022-07-20 on the pilot Data Centre Call for Application",
              "https://www.edb.gov.sg/en/about-edb/media-releases-publications/edb-and-imda-launch-pilot-data-centre-call-for-application-to-support-sustainable-growth-of-data-centres.html", True),
    "CLTA": ("Chile, Segundo Tribunal Ambiental, notice of its judgment on Cerrillos Data Center, 2024-02-27",
             "https://tribunalambiental.cl/sentencia-r27-270-2020-cerrillos-data-center", True),
    "MANATEE": ("Manatee County, Florida, release of 2026-10-08 on Ordinance 26-42",
                "https://www.mymanatee.org/connect/news-and-information/news-and-information/article-detail/board-of-county-commissioners/2026/10/09/manatee-county-commissioners-approve-12-month-data-center-moratorium", True),
    "WORCESTER": ("Worcester County, Maryland, release of 2026-07-30 on Resolution No. 26-18",
                  "https://worcestermd.gov/news/worcester-county-enacts-moratorium-data-centers-and-cable-landing-stations-while-new", True),
    "FERC": ("US Federal Energy Regulatory Commission, 189 FERC 61,078, order of 2024-11-01, dockets ER24-2172-000 and -001",
             "https://www.ferc.gov/sites/default/files/2024-11/20241101-3061_ER24-2172-000.pdf", True),
    "CRU25": ("Ireland, Commission for Regulation of Utilities, Large Energy Users Connection Policy, decision paper CRU/2025236 (2025-12-12)",
              "https://cruie-live-96ca64acab2247eca8a850a7e54b-5b34f62.divio-media.com/documents/CRU2025236_Large_Energy_User_connection_policy_decision_paper.pdf", True),
    "CMAMS": ("UK Competition and Markets Authority, case page, Microsoft / OpenAI partnership merger inquiry",
              "https://www.gov.uk/cma-cases/microsoft-slash-openai-partnership-merger-inquiry", True),
    "CMAAMZ": ("UK Competition and Markets Authority, case page, Amazon / Anthropic partnership merger inquiry",
               "https://www.gov.uk/cma-cases/amazon-slash-anthropic-partnership-merger-inquiry", True),
    "CMAGOO": ("UK Competition and Markets Authority, case page, Alphabet / Anthropic merger inquiry",
               "https://www.gov.uk/cma-cases/alphabet-inc-google-llc-slash-anthropic-merger-inquiry", True),
    "FTC6B": ("US Federal Trade Commission, release of January 2025 on its staff report on AI partnerships and investments",
              "https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-issues-staff-report-ai-partnerships-investments-study", False),
    "GAR0330": ("Italy, Garante per la protezione dei dati personali, order of 2023-03-30 (doc. web 9870832)",
                "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9870832", True),
    "GAR0412": ("Italy, Garante, release on its order of 2023-04-11 (doc. web 9874751)",
                "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9874751", True),
    "GAR0428": ("Italy, Garante, release of 2023-04-28 (doc. web 9881490)",
                "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9881490", True),
    "GARDS": ("Italy, Garante, order of 2025-01-30 (doc. web 10098477)",
              "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/10098477", True),
    "DPCX1": ("Ireland, Data Protection Commission, release of 2024-08-08",
              "https://www.dataprotection.ie/en/news-media/press-releases/dpc-welcomes-xs-agreement-suspend-its-processing-personal-data-purpose-training-ai-tool-grok", True),
    "DPCX2": ("Ireland, Data Protection Commission, release of 2024-09-04",
              "https://www.dataprotection.ie/en/news-media/press-releases/data-protection-commission-welcomes-conclusion-proceedings-relating-xs-ai-tool-grok", True),
    "DPCMETA": ("Ireland, Data Protection Commission, statement of 2024-06-14",
                "https://www.dataprotection.ie/en/news-media/latest-news/dpcs-engagement-meta-ai", True),
    "ANPD11": ("Brazil, Autoridade Nacional de Proteção de Dados, Voto 11/2024 (signed 2024-07-01)",
               "https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-determina-suspensao-cautelar-do-tratamento-de-dados-pessoais-para-treinamento-da-ia-da-meta/SEI_0130047_Voto_11.pdf/@@display-file/file", True),
    "ANPD23": ("Brazil, Autoridade Nacional de Proteção de Dados, Voto 23/2024 (signed 2024-08-28)",
               "https://www.gov.br/anpd/pt-br/assuntos/deliberacoes-do-conselho-diretor/circuitos-deliberativos-2024/cd-18-2024-votos.pdf/@@display-file/file", True),
    "TRACKER": ("datacenterbans.com, a private tracker of US data-centre restrictions (second-hand; front page as of 2026-11-09)",
                "https://www.datacenterbans.com/", True),
}

Q = {  # passage id: (doc, exact quotation)
    "c1a": ("FR22", "to implement necessary controls on advanced computing integrated circuits (ICs), computer commodities that contain such ICs, and certain semiconductor manufacturing items"),
    "c1b": ("FR22", "Most license applications for items controlled under this RS control will be reviewed under a presumption of denial"),
    "c2a": ("FR23", "BIS imposed these new controls to protect U.S. national security interests by restricting certain exports to China that would advance China's military modernization and surveillance efforts"),
    "c2b": ("FR23", "This rule is effective November 17, 2023"),
    "c3a": ("NV10Q", "informed us that a license is required for exports of our H20 product into the China market"),
    "c3b": ("NV10Q", "we incurred a $4.5 billion charge in the first quarter of fiscal year 2026 associated with H20 for excess inventory and purchase obligations"),
    "c4a": ("NV10Q", "In August 2025, the USG granted licenses that would allow us to ship certain H20 products to certain China-based customers"),
    "c4b": ("NV10Q", "USG officials have expressed an expectation that the USG will receive 15% of the revenue generated from licensed H20 sales, but to date, the USG has not published a regulation codifying such requirement"),
    "c5a": ("BISNEWS", "BIS will now review export license applications for the Nvidia H200, AMD MI325X, and similar chips on a case-by-case basis provided certain security requirements are met"),
    "c5b": ("BISNEWS", "that the product has undergone independent, third-party testing in the United States to verify its performance and security"),
    "c6a": ("NV10K", "In February 2026, the USG granted a license that would allow us to ship small amounts of H200 products to specific China-based customers"),
    "c6b": ("NV10K", "The license requires that the H200s go through an inspection process in the United States prior to any shipment to the customer"),
    "s1a": ("TUCSON", "we will not consider or approve Project Blue as it has been proposed"),
    "s1b": ("TUCSON", "adoption of an Ordinance regulating Large Quantity Water Users"),
    "s2a": ("PWC", "The Board of County Supervisors decisions to approve the rezoning of the property are void and the zoning of the properties reverts back to the original zoning district"),
    "s2b": ("PWC", "the Court of Appeals decision dated March 31, 2026, was stayed"),
    "s3a": ("NLKV", "De Minister van VRO heeft op 16 februari 2022 voor heel Nederland (uitgezonderd twee locaties) een voorbereidingsbesluit onder de Wro genomen waarmee verboden werd om gronden en bouwwerken zodanig te wijzigen dat een hyperscale datacentrum met een bebouwd vloeroppervlakte van meer dan 10 ha en een elektrisch aansluitvermogen van 70 MW of meer gebouwd of in gebruik genomen kon worden"),
    "s3b": ("NLKV", "Dit voorbereidingsbesluit gold voor de (wettelijke) periode van negen maanden"),
    "s4a": ("NLKV", "in verband met een instructieregel voor hyperscale datacentra in werking getreden"),
    "s5a": ("SGEDB", "The Government informed the industry of a temporary pause in the growth of DCs in 2019 and embarked on a review"),
    "s5b": ("SGEDB", "DCs are also intensive users of resources like land, water, and energy, contributing to our carbon footprint"),
    "s6a": ("CLTA", "el proyecto no puede ser ejecutado hasta no contar con esta última resolución"),
    "s6b": ("CLTA", "la falta de antecedentes que justifiquen la inexistencia de impactos significativos sobre el Acuífero Santiago Central"),
    "s7a": ("MANATEE", "approved a temporary, 12-month moratorium on new data center-related development applications in unincorporated Manatee County"),
    "s7b": ("MANATEE", "The temporary pause will give County staff time to evaluate how data centers, large-scale data centers and other large-load facilities should be addressed in the Comprehensive Plan, Land Development Code and other County regulations"),
    "s8a": ("WORCESTER", "the Worcester County Commissioners placed a temporary moratorium on the submittal and issuance of permits for data centers and cable landing stations"),
    "s8b": ("WORCESTER", "to develop comprehensive zoning regulations governing the construction, location, and operation of these emerging land uses"),
    "p1a": ("FERC", "to increase the amount of Co-Located Load from 300 megawatts (MW) to 480 MW"),
    "p1b": ("FERC", "we find that PJM has not demonstrated that the proposed non-conforming provisions in the Amended ISA are necessary deviations from the pro forma ISA"),
    "p2a": ("CRU25", "In November 2021 the CRU published a decision paper (CRU/21/124) setting out that a connection measures approach would be taken"),
    "p2b": ("CRU25", "to determine whether a connection offer can be made within the system stability and reliability needs of the electricity network"),
    "p3a": ("CRU25", "the ability of the data centre applicant to bring new onsite or proximate dispatchable generation and/or storage capacity equivalent to or greater than their MIC"),
    "p3b": ("CRU25", "It is intended that this new direction will supersede the direction to the electrical SOs from 2021 (CRU/21/124)"),
    "m1a": ("GAR0330", "la misura della limitazione provvisoria, del trattamento dei dati personali degli interessati stabiliti nel territorio italiano"),
    "m1b": ("GAR0330", "l’assenza di idonea base giuridica in relazione alla raccolta dei dati personali e al loro trattamento per scopo di addestramento degli algoritmi sottesi al funzionamento di ChatGPT"),
    "m2a": ("GAR0412", "Only in that case will the Italian SA lift its order that placed a temporary limitation on the processing of Italian users’ data"),
    "m2b": ("GAR0428", "describing the measures it implemented in order to comply with the order issued by the SA on 11 April"),
    "m3a": ("GARDS", "la misura della limitazione definitiva del trattamento di dati personali di interessati che si trovano nel territorio italiano"),
    "m4a": ("DPCX1", "welcomes X’s agreement to suspend its processing of the personal data contained in the public posts of X’s EU/EEA users which it processed between 7 May 2024 and 1 August 2024, for the purpose of training its AI ‘Grok’"),
    "m4b": ("DPCX1", "The agreement was concluded against the backdrop of an urgent High Court application brought by the DPC under Section 134 of the Data Protection Act, 2018"),
    "m4c": ("DPCX2", "the proceedings have been struck-out on the basis of X’s agreement to continue to adhere to the terms of the undertaking"),
    "m5a": ("ANPD11", "MEDIDA PREVENTIVA PARA DETERMINAR, ATÉ ULTERIOR DECISÃO DESTA AUTORIDADE, A IMEDIATA SUSPENSÃO NO BRASIL"),
    "m6a": ("ANPD23", "SUSPENSÃO DA MEDIDA PREVENTIVA APLICADA À META"),
    "m6b": ("ANPD23", "COM A DETERMINAÇÃO DE CUMPRIMENTO INTEGRAL DO PLANO DE CONFORMIDADE"),
    "d1": ("CMAMS", "The CMA has decided that Microsoft’s partnership with OpenAI does not qualify for investigation under the merger provisions of the Enterprise Act 2002"),
    "d2": ("CMAAMZ", "The CMA has decided that Amazon’s partnership with Anthropic does not qualify for investigation under the merger provisions of the Enterprise Act 2002"),
    "d3": ("CMAGOO", "The CMA has decided that Alphabet’s partnership with Anthropic does not qualify for investigation under the merger provisions of the Enterprise Act 2002"),
    "d4": ("FTC6B", "The staff report stems from FTC orders issued in January 2024 under Section 6(b) of the FTC Act"),
    "n1": ("DPCMETA", "The DPC welcomes the decision by Meta to pause its plans to train its large language model using public content shared by adults on Facebook and Instagram across the EU/EEA"),
    "t1": ("TRACKER", "Active Bans / Moratoriums ( 25 )"),
}

# The acts. effect: stopped | delayed | conditioned.  form: rule | case.  level: sub | nat.  kind: elected | agency | regulator | court.
# terr: inside | elsewhere | na (model point).  grounds: from the act's own words.  named: holder or developer named in the record.
# lifted: for stopped acts at chip and model, the passage that shows a lifting or loosening within twelve months, or None.
A = lambda **k: k
ACTS = [
    A(id="c1", point="chip", date="2022-10-07", body="US Bureau of Industry and Security", country="United States", level="nat", kind="agency",
      effect="stopped", form="rule", terr="elsewhere", grounds=["national security"], named=None, party="exporters of advanced chips to China",
      what="A licence becomes necessary to export advanced computing chips to China, reviewed under a presumption of denial.",
      limit="chips above a performance threshold", compute_quantity=True, q=["c1a", "c1b"], lifted=None,
      lifted_note="Not loosened within twelve months; widened by the rule of October 2023."),
    A(id="c2", point="chip", date="2023-10-25", body="US Bureau of Industry and Security", country="United States", level="nat", kind="agency",
      effect="stopped", form="rule", terr="elsewhere", grounds=["national security"], named=None, party="exporters of advanced chips to China",
      what="The controls of 2022 are widened and corrected; in force from 17 November 2023.",
      limit="chips above a performance threshold", compute_quantity=True, q=["c2a", "c2b"], lifted=None,
      lifted_note="Not loosened within twelve months on the records read."),
    A(id="c3", point="chip", date="2025-04", body="US government (export licensing)", country="United States", level="nat", kind="agency",
      effect="stopped", form="case", terr="elsewhere", grounds=["national security"], named=None, party="NVIDIA (chip maker), its H20 product",
      what="The chip maker is told that its China product needs a licence; it books a $4.5 billion charge.",
      limit="one chip product", compute_quantity=True, q=["c3a", "c3b"], lifted="c4a",
      lifted_note="Licences granted in August 2025, four months later.", ground_note="The filing states the requirement, not its reason; the ground is that of the rules it applies."),
    A(id="c4", point="chip", date="2025-08", body="US government (export licensing)", country="United States", level="nat", kind="agency",
      effect="conditioned", form="case", terr="elsewhere", grounds=["national security"], named=None, party="NVIDIA (chip maker), its H20 product",
      what="Licences for the China product are granted; officials expect 15 % of the revenue, under no published regulation.",
      limit="one chip product, named customers", compute_quantity=True, q=["c4a", "c4b"], ground_note="As for the act of April 2025."),
    A(id="c5", point="chip", date="2026-01-13", body="US Bureau of Industry and Security", country="United States", level="nat", kind="agency",
      effect="conditioned", form="rule", terr="elsewhere", grounds=["national security"], named=None, party="exporters of the H200, the MI325X and similar chips",
      what="Licence applications for two named chips are reviewed case by case if security requirements are met, among them third-party testing in the United States.",
      limit="named chip products", compute_quantity=True, q=["c5a", "c5b"]),
    A(id="c6", point="chip", date="2026-02", body="US government (export licensing)", country="United States", level="nat", kind="agency",
      effect="conditioned", form="case", terr="elsewhere", grounds=["national security"], named=None, party="NVIDIA (chip maker), its H200 product",
      what="A licence for small amounts of the H200 to specific customers in China, with an inspection in the United States before shipment.",
      limit="one chip product, small amounts", compute_quantity=True, q=["c6a", "c6b"], ground_note="As for the rule of January 2026."),
    A(id="s1", point="site", date="2025-08-06", body="Mayor and Council of Tucson, Arizona", country="United States", level="sub", kind="elected",
      effect="stopped", form="case", terr="inside", grounds=["water", "land, noise or the neighbourhood"], named=None, party="Project Blue (developer not named in the motions)",
      what="The council will not consider or approve the project and ends the annexation; it orders a water-use ordinance and zoning rules for data centres.",
      limit="the project as proposed", compute_quantity=False, q=["s1a", "s1b"]),
    A(id="s2", point="site", date="2026-03-31", body="Court of Appeals of Virginia", country="United States", level="sub", kind="court",
      effect="stopped", form="case", terr="inside", grounds=["procedure (outside the fixed codes)"], named=None, party="PW Digital Gateway rezonings, Prince William County",
      what="The county board's rezonings for a data-centre corridor are void; the land reverts to its earlier zoning (in effect since the order of 29 July 2026).",
      limit="the rezoned land", compute_quantity=False, q=["s2a", "s2b"],
      ground_note="The county page states the result, not the court's reason; the reason (defective public notice) is second-hand here."),
    A(id="s3", point="site", date="2022-02-16", body="Minister for Housing and Spatial Planning, the Netherlands", country="Netherlands", level="nat", kind="agency",
      effect="delayed", form="rule", terr="inside", grounds=["land, noise or the neighbourhood", "power or grid"], named=None, party="new hyperscale data centres, the whole country but two sites",
      what="For nine months no land or building may be changed so that a hyperscale data centre can be built or used; renewed twice.",
      limit="more than 10 ha floor area and 70 MW or more", compute_quantity=False, q=["s3a", "s3b"],
      ground_note="Coded from what the act limits (floor area and connection power); the answer read does not restate its reasons."),
    A(id="s4", point="site", date="2024-01-01", body="Government of the Netherlands (instruction rule)", country="Netherlands", level="nat", kind="agency",
      effect="stopped", form="rule", terr="inside", grounds=["land, noise or the neighbourhood", "power or grid"], named=None, party="new hyperscale data centres",
      what="A standing instruction rule on hyperscale data centres enters into force after the three temporary decisions.",
      limit="more than 10 ha floor area and 70 MW or more", compute_quantity=False, q=["s4a"], ground_note="As for the decision of February 2022."),
    A(id="s5", point="site", date="2019", body="Government of Singapore", country="Singapore", level="nat", kind="agency",
      effect="delayed", form="rule", terr="inside", grounds=["land, noise or the neighbourhood", "water", "power or grid"], named=None, party="new data centres",
      what="A temporary pause on the growth of data centres, ended in 2022 by a call for applications on the government's terms.",
      limit="new data-centre capacity", compute_quantity=False, q=["s5a", "s5b"]),
    A(id="s6", point="site", date="2024-02-27", body="Segundo Tribunal Ambiental, Chile", country="Chile", level="nat", kind="court",
      effect="stopped", form="case", terr="inside", grounds=["water"], named=None, party="Cerrillos Data Center (owner not named in the court's notice)",
      what="The environmental approval is annulled in part; the project cannot be carried out until a complementary approval is issued.",
      limit="the project", compute_quantity=False, q=["s6a", "s6b"]),
    A(id="s7", point="site", date="2026-10-08", body="Board of County Commissioners, Manatee County, Florida", country="United States", level="sub", kind="elected",
      effect="delayed", form="rule", terr="inside", grounds=["land, noise or the neighbourhood"], named=None, party="new data-centre applications, unincorporated county",
      what="A twelve-month moratorium on new data-centre development applications.", limit="applications, for twelve months", compute_quantity=False, q=["s7a", "s7b"]),
    A(id="s8", point="site", date="2026-07-21", body="County Commissioners, Worcester County, Maryland", country="United States", level="sub", kind="elected",
      effect="delayed", form="rule", terr="inside", grounds=["land, noise or the neighbourhood"], named=None, party="permits for data centres and cable landing stations",
      what="A moratorium on permits for twelve months or until rescinded, while zoning rules are written.", limit="permits, for twelve months", compute_quantity=False, q=["s8a", "s8b"]),
    A(id="p1", point="power", date="2024-11-01", body="US Federal Energy Regulatory Commission", country="United States", level="nat", kind="regulator",
      effect="stopped", form="case", terr="inside", grounds=["power or grid"], named=None, party="the co-located load at the Susquehanna nuclear plant (its owner not named as a party to the agreement)",
      what="The amended connection agreement, which would have raised a data centre's load at a nuclear plant from 300 to 480 MW, is rejected.",
      limit="megawatts of co-located load", compute_quantity=False, q=["p1a", "p1b"]),
    A(id="p2", point="power", date="2021-11", body="Commission for Regulation of Utilities, Ireland", country="Ireland", level="nat", kind="regulator",
      effect="conditioned", form="rule", terr="inside", grounds=["power or grid"], named=None, party="data centres applying for a grid connection",
      what="The grid operators are directed to assess each data-centre connection against criteria of location and system stability; a moratorium was considered and not chosen.",
      limit="connection offers", compute_quantity=False, q=["p2a", "p2b"]),
    A(id="p3", point="power", date="2025-12-12", body="Commission for Regulation of Utilities, Ireland", country="Ireland", level="nat", kind="regulator",
      effect="conditioned", form="rule", terr="inside", grounds=["power or grid"], named=None, party="data centres applying for a grid connection",
      what="A new direction: a data centre of 10 MVA or more must bring generation or storage of its own equal to its connection capacity.",
      limit="connection capacity in MVA", compute_quantity=False, q=["p3a", "p3b"]),
    A(id="m1", point="model", date="2023-03-30", body="Garante per la protezione dei dati personali, Italy", country="Italy", level="nat", kind="regulator",
      effect="stopped", form="case", terr="na", grounds=["personal data"], named="OpenAI", party="OpenAI, ChatGPT",
      what="An urgent temporary limitation on processing the data of people in Italy; the service went offline there.",
      limit="processing of personal data", compute_quantity=False, q=["m1a", "m1b"], lifted="m2b",
      lifted_note="The authority's order of 11 April set terms; its release of 28 April 2023 records the service restored, four weeks later."),
    A(id="m2", point="model", date="2023-04-11", body="Garante per la protezione dei dati personali, Italy", country="Italy", level="nat", kind="regulator",
      effect="conditioned", form="case", terr="na", grounds=["personal data"], named="OpenAI", party="OpenAI, ChatGPT",
      what="The limitation is lifted only if the company meets measures on transparency, rights and the legal basis for training, by 30 April.",
      limit="processing of personal data", compute_quantity=False, q=["m2a", "m2b"]),
    A(id="m3", point="model", date="2025-01-30", body="Garante per la protezione dei dati personali, Italy", country="Italy", level="nat", kind="regulator",
      effect="stopped", form="case", terr="na", grounds=["personal data"], named=None, party="Hangzhou and Beijing DeepSeek Artificial Intelligence",
      what="A definitive limitation on processing the data of people in Italy, with immediate effect.",
      limit="processing of personal data", compute_quantity=False, q=["m3a"], lifted=None, lifted_note="No lifting found on the authority's pages read."),
    A(id="m4", point="model", date="2024-08-08", body="Data Protection Commission and the High Court, Ireland", country="Ireland", level="nat", kind="regulator",
      effect="stopped", form="case", terr="na", grounds=["personal data"], named="xAI (Grok), through X", party="X, training of Grok",
      what="Before the High Court, on the authority's urgent application, X undertakes to suspend training Grok on EU users' posts; made permanent on 4 September 2024.",
      limit="processing of personal data for training", compute_quantity=False, q=["m4a", "m4b", "m4c"], lifted=None,
      lifted_note="Made permanent, not lifted.", ground_note="An undertaking given to a court, not an order."),
    A(id="m5", point="model", date="2024-07-02", body="Autoridade Nacional de Proteção de Dados, Brazil", country="Brazil", level="nat", kind="regulator",
      effect="stopped", form="case", terr="na", grounds=["personal data"], named="Meta", party="Meta, training of generative AI",
      what="A preventive measure: immediate suspension in Brazil of the privacy-policy change and of processing personal data to train generative AI.",
      limit="processing of personal data for training", compute_quantity=False, q=["m5a"], lifted="m6a",
      lifted_note="Suspended at the end of August 2024 against a compliance plan, two months later (the vote is signed 28 August).",
      ground_note="The vote is signed 1 July 2024; 2 July is the date a later publication of the same authority gives for the decision (read in a search excerpt)."),
    A(id="m6", point="model", date="2024-08", body="Autoridade Nacional de Proteção de Dados, Brazil", country="Brazil", level="nat", kind="regulator",
      effect="conditioned", form="case", terr="na", grounds=["personal data"], named="Meta", party="Meta, training of generative AI",
      what="The preventive measure is suspended on condition that the compliance plan is carried out in full.",
      limit="processing of personal data for training", compute_quantity=False, q=["m6a", "m6b"],
      ground_note="Dated by the signature on the vote, 28 August 2024; the day the board adopted it was not read."),
]

NOT_ACTS = [  # read first-hand, and by the definitions fixed before the search not an act
    dict(id="d1", point="deal", date="2025-03-05", body="UK Competition and Markets Authority", what="Microsoft and OpenAI: found not to qualify for investigation.", why="a review closed without an act", q="d1"),
    dict(id="d2", point="deal", date="2024-09-27", body="UK Competition and Markets Authority", what="Amazon and Anthropic: found not to qualify for investigation.", why="a review closed without an act", q="d2"),
    dict(id="d3", point="deal", date="2024-11-19", body="UK Competition and Markets Authority", what="Alphabet and Anthropic: found not to qualify for investigation.", why="a review closed without an act", q="d3"),
    dict(id="d4", point="deal", date="2025-01", body="US Federal Trade Commission", what="A staff report on three cloud-developer partnerships, from orders of January 2024.", why="an inquiry", q="d4"),
    dict(id="n1", point="model", date="2024-06-14", body="Data Protection Commission, Ireland", what="Meta pauses its plan to train on EU users' public content after engagement with the authority.", why="the firm's own decision; no order of the body", q="n1"),
]

SECOND_HAND = [  # known from reports only, or not delivered; in no count
    dict(point="site", what="A county health department granted an AI developer an air permit for 15 gas turbines at its data centre in Memphis, with emission limits (July 2025).", why="the department's own record was not found; press only"),
    dict(point="site", what="An Irish county council refused a holder's third data-centre building for lack of grid capacity (August 2024); the national planning body later allowed it on terms.", why="press only"),
    dict(point="site", what="On 3 November 2026, voters in ten US states decided 41 local ballot measures on data centres and favoured restrictions in 40.", why="a private tracker's overview, which the tracker labels as machine-generated; no election record read"),
    dict(point="site", what="A private tracker lists 25 US states with an active ban or moratorium somewhere in the state.", why="second-hand; the tracker's own count, passage t1"),
    dict(point="power", what="Ohio's utility commission ordered a data-centre tariff (July 2025).", why="the commission's page answered 504 twice on 2026-11-12"),
    dict(point="power", what="Texas's law on large loads of 75 MW and more (2025).", why="text read in a search excerpt only; whether it has been applied to a project was not checked"),
    dict(point="chip", what="Chinese authorities told firms not to buy one US chip maker's products (2025).", why="press only; not searched this session"),
    dict(point="model", what="Indonesia and Malaysia blocked a developer's chatbot over sexualised images (January 2026).", why="press only; the ministry's own release was not found"),
    dict(point="site", what="The Circuit Court of Prince William County voided the same rezonings first (August 2025).", why="its order was read only on a campaign group's page"),
]

HOLDERS = ["Google", "Microsoft", "Meta", "Amazon", "Oracle", "xAI"]
POINTS = ["chip", "site", "power", "deal", "model"]


def fetch(doc, cache):
    what, url, browser = DOCS[doc]
    path = os.path.join(cache, doc + ".raw")
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": UA_B if browser else UA, "Accept": "text/html,application/pdf,*/*"})
        with urllib.request.urlopen(req, timeout=90) as r:
            data = r.read()
        open(path, "wb").write(data)
    return open(path, "rb").read()


def text_of(raw, path):
    if raw[:4] == b"%PDF":
        t = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True).stdout.decode("utf-8", "replace")
    else:
        t = raw.decode("utf-8", "replace")
        t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", t)
        t = html.unescape(re.sub(r"(?s)<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t)


def main():
    cache = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, ".cache71")
    os.makedirs(cache, exist_ok=True)
    texts, files = {}, []
    for doc in DOCS:
        raw = fetch(doc, cache)
        texts[doc] = text_of(raw, os.path.join(cache, doc + ".raw"))
        files.append(dict(id=doc, what=DOCS[doc][0], url=DOCS[doc][1], bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest(), fetched=TODAY))
    missing = [k for k, (d, s) in Q.items() if re.sub(r"\s+", " ", s) not in texts[d]]
    assert not missing, "passages not found: %s" % missing
    assert "Google" not in texts["CLTA"], "the court's notice now names the owner; recode s6"
    used = {q for a in ACTS for q in a["q"]} | {n["q"] for n in NOT_ACTS} | {"t1"} | {a["lifted"] for a in ACTS if a.get("lifted")}
    assert used == set(Q), sorted(set(Q) ^ used)

    n = len(ACTS)
    by = lambda key: {v: sum(1 for a in ACTS if a[key] == v) for v in sorted({a[key] for a in ACTS})}
    per_point = {p: sum(1 for a in ACTS if a["point"] == p) for p in POINTS}
    grid = {p: {e: sum(1 for a in ACTS if a["point"] == p and a["effect"] == e) for e in ("stopped", "delayed", "conditioned")} for p in POINTS}
    grounds = {}
    for a in ACTS:
        for g in a["grounds"]:
            grounds[g] = grounds.get(g, 0) + 1
    sub = [a["id"] for a in ACTS if a["level"] == "sub"]
    elected = [a["id"] for a in ACTS if a["kind"] == "elected"]
    named = [a["id"] for a in ACTS if a["named"]]
    inside = [a["id"] for a in ACTS if a["terr"] == "inside"]
    stopped_cm = [a for a in ACTS if a["effect"] == "stopped" and a["point"] in ("chip", "model")]
    lifted = [a["id"] for a in stopped_cm if a.get("lifted")]
    quantity = [a["id"] for a in ACTS if a["compute_quantity"]]
    ai_risk = [a["id"] for a in ACTS if "AI risk" in a["grounds"]]
    countries = by("country")

    P = []
    def pred(pid, text, held, found):
        P.append(dict(id=pid, text=text, held=held, found=found))
    pred("P89", "Acts at chip, site, power and model; none at the deal point, where the reviews found closed without one.",
         all(per_point[p] > 0 for p in ("chip", "site", "power", "model")) and per_point["deal"] == 0,
         "Acts found: chip %d, site %d, power %d, deal %d, model %d. At the deal point four reviews were read; all closed without an act." % tuple(per_point[p] for p in POINTS))
    pred("P90", "More than half of the acts found are by subnational bodies, at the site and power points.",
         len(sub) > n / 2, "%d of %d acts are subnational (all at the site point). The share is a property of what was read, not of the world: a private tracker counts 25 US states with an active ban or moratorium somewhere, and four local acts were read." % (len(sub), n))
    pred("P91", "No act at the site or power point states AI risk as its ground.",
         not [a for a in ACTS if a["point"] in ("site", "power") and "AI risk" in a["grounds"]],
         "0 of %d site and power acts state AI risk. Nor does any act at any point: 0 of %d." % (per_point["site"] + per_point["power"], n))
    pred("P92", "Every act inside the acting public's territory sits at site or power; every chip act acts on compute bound elsewhere.",
         all(a["point"] in ("site", "power") for a in ACTS if a["terr"] == "inside") and all(a["terr"] == "elsewhere" for a in ACTS if a["point"] == "chip"),
         "%d acts inside, all at site or power; %d chip acts, all on chips bound for another country." % (len(inside), per_point["chip"]))
    pred("P93", "At least five acts name a step-1 holder or a frontier developer or its project.",
         len(named) >= 5, "%d acts name one (OpenAI twice, Meta twice, xAI's Grok once), every one at the model point. No act at chip, site or power names a holder or developer in the record read." % len(named))
    pred("P94", "Of the acts coded stopped at chip and model, at least half were lifted or loosened within twelve months.",
         len(lifted) >= len(stopped_cm) / 2, "%d of %d (%s). The two export rules, the block of DeepSeek and the Grok undertaking stand." % (len(lifted), len(stopped_cm), ", ".join(lifted)))
    pred("P95", "No act outside the chip point states a quantity of compute as the thing it limits.",
         all(a["point"] == "chip" for a in ACTS if a["compute_quantity"]),
         "%d acts limit chips, all at the chip point. Site and power acts limit hectares, megawatts, megavolt-amperes, applications or months; model acts limit the processing of personal data." % len(quantity))
    held = sum(1 for p in P if p["held"])

    results = dict(
        study=71, session=269, date=TODAY, cycle=14, programme_step=2,
        question="At which points between the chip and the running model has a public body in fact stopped, delayed or conditioned AI compute, and whose public was it?",
        frame="A found set, not a census: the acts the searches listed led to, each read first-hand on 2026-11-12. Counts are lower bounds; shares are shares of what was read.",
        counts=dict(acts=n, per_point=per_point, grid=grid, by_effect=by("effect"), by_form=by("form"), by_level=by("level"), by_kind=by("kind"),
                    by_country=countries, grounds=grounds, subnational=sub, elected=elected, named=named, inside=inside,
                    ai_risk=ai_risk, compute_quantity=quantity, stopped_chip_model=[a["id"] for a in stopped_cm], lifted_within_12_months=lifted,
                    not_acts=len(NOT_ACTS), second_hand=len(SECOND_HAND), files=len(files), passages=len(Q)),
        predictions=P, predictions_held="%d of %d" % (held, len(P)),
        acts=[dict(a, quotes=[dict(id=q, doc=Q[q][0], text=Q[q][1], url=DOCS[Q[q][0]][1], source=DOCS[Q[q][0]][0]) for q in a["q"]],
                   lifted_quote=(dict(id=a["lifted"], text=Q[a["lifted"]][1], url=DOCS[Q[a["lifted"]][0]][1]) if a.get("lifted") else None)) for a in ACTS],
        not_acts=[dict(x, quote=Q[x["q"]][1], url=DOCS[Q[x["q"]][0]][1], source=DOCS[Q[x["q"]][0]][0]) for x in NOT_ACTS],
        second_hand=SECOND_HAND, tracker_passage=Q["t1"][1], searches=SEARCHES, holders=HOLDERS, files=files,
        refusals=["investor.nvidia.com answered 403 to both clients (the same facts were read in the company's filings)",
                  "puco.ohio.gov answered 504 twice", "federalregister.gov serves an access notice to scripts; both rules were read at govinfo.gov",
                  "sec.gov, tucsonaz.gov and ftc.gov refused a browser-like client and delivered to a declared research client"],
    )
    json.dump(results, open(os.path.join(HERE, "results71.json"), "w"), indent=1, ensure_ascii=False)
    open(os.path.join(HERE, "data71.js"), "w").write("window.DATA71 = " + json.dumps(results, ensure_ascii=False) + ";\n")
    print("acts", n, per_point, "| subnational", len(sub), "| elected", len(elected), "| named", len(named), "| AI risk", len(ai_risk))
    print("grounds", grounds)
    for p in P:
        print(p["id"], "HELD" if p["held"] else "FAILED", "-", p["found"])
    print("predictions held:", results["predictions_held"], "| files", len(files), "| passages", len(Q), "all found")


if __name__ == "__main__":
    main()
