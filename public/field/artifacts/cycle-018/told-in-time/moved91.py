"""Study 91, part A and the addendum: the codes of CODEBOOK91.md for the 51 signals of study 90, and the cases.

Coded by the conductor on 2026-11-22. Every counted trace was opened by the conductor in this session (search agents
found candidates; `search91.json` logs both). Quotes are at most 40 words, read from the page as fetched.
Read by build91.py; no network here.
"""

D = '2025-08-02'  # the AI Act's chapter on general-purpose models applies

DUE = {
    # instrument -> (due, first due date, where read)
    'eu-act': ('due', '2025-08-02', 'AI Act Art. 113(b); Commission Q&A on general-purpose AI models'),
    'eu-code': ('due', '2025-08-02', 'the Code applies to signatories from the date the AI Act chapter applies'),
    'korea': ('due', '2026-01-22', 'Framework Act, entry into force'),
    'sb53': ('due', '2026-01-01', 'SB 53, effective 1 January 2026 (Cal OES TFAIA reporting page)'),
    'china': ('due', '2025-09-15', 'Framework 2.0 published by TC260 (voluntary)'),
    'asean': ('due', '2025-01-01', 'Expanded Guide, January 2025 (voluntary)'),
    'haip': ('due', '2023-10-30', 'G7 Code of Conduct, 30 October 2023 (voluntary)'),
    'paris': ('due', '2026-11-09', 'signed 9 November 2026 (elysee.fr)'),
    'raise': ('not yet due', '2027-01-01', 'New York DFS, DIGIT office: duties and filings begin 1 January 2027'),
    'bis': ('due', '2026-11-19', '91 FR 74970, effective 19 November 2026'),
    'gpa': ('due', '2026-11-17', 'adopted at the 48th Closed Session, November 2026 (file of 17 November)'),
}
NOT_YET = {  # signal-level first due dates later than 2026-11-22
    'BIS1': ('2026-12-01', '15 CFR 743.10(d): due the first business day of the month after the transaction'),
    'BIS3': ('2027-02-15', '15 CFR 748.15(f)(1)(iii): reports due by 15 February each year'),
}

# Hosts: sender, public body, intergovernmental, third party
TRACES = {
    'CA1': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://www.anthropic.com/news/compliance-framework-SB53', 'date': '2025-12-19',
             'date_where': 'datePublished of the page', 'host': 'sender', 'who': 'Anthropic',
             'quote': 'Moving forward, the FCF will serve as our compliance framework for SB 53 and other regulatory '
                      'requirements.'},
            {'url': 'https://data.x.ai/2025-12-31-xai-frontier-artificial-intelligence-framework.pdf',
             'date': '2025-12-30', 'date_where': "'Last updated: December 30, 2025', first page", 'host': 'sender',
             'who': 'xAI',
             'quote': "This FAIF complies with California's Transparency in Frontier Artificial Intelligence Act"},
            {'url': 'https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/'
                    'presentations/CSR/Frontier-Governance-Framework-Feb-2026.pdf',
             'date': '2026-02-01', 'date_where': "page footers 'February 2026' (first day of the month used)",
             'host': 'sender', 'who': 'Microsoft', 'doubt': 'names the Act as a law that puts models in scope; does '
                                                            'not call itself the framework under it',
             'quote': "in scope for frontier model requirements under applicable laws, such as the EU AI Act, "
                      "California's Transparency in Frontier AI Act (TFAIA)"},
            {'url': 'https://openai.com/index/openai-frontier-governance-framework', 'date': '2026-05-28',
             'date_where': "'May 28, 2026' on the page", 'host': 'sender', 'who': 'OpenAI',
             'quote': "explains how our safety and security practices align with emerging legal requirements, "
                      "including California's Transparency in Frontier AI Act"},
        ],
        'note': 'The first trace came 13 days before the duty applied. No public body holds a copy: the state office '
                'publishes none.'},
    'CA2': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://www-cdn.anthropic.com/9e6a1044980d8c4ed85669faf9c2a8342e2e9f1e/'
                    'Claude%20Sonnet%205%20System%20Card.pdf',
             'date': '2026-06-30', 'date_where': "'June 30, 2026', first page", 'host': 'sender',
             'who': 'Anthropic', 'doubt': 'names the Act as a regime its compliance framework serves; does not call '
                                          'itself the transparency report',
             'quote': "The FCF is our compliance framework for applicable regimes, including California's "
                      "Transparency in Frontier AI Act (TFAIA)"},
        ],
        'outside': [
            {'url': 'https://www-cdn.anthropic.com/0b4915911bb0d19eca5b5ee635c80fef830a37ea/'
                    'Claude%20Opus%204.8%20System%20Card.pdf',
             'line': 'System card of 28 May 2026: no mention of the Act.'},
            {'url': 'https://carnegieendowment.org/research/2026/11/trust-but-verify-implementing-frontier-ai-policy-in-california-and-beyond',
             'line': 'Carnegie, 10 November 2026: SB 53 invites developers to submit model cards as part of the '
                     'transparency report, so a card that names nothing may still serve.'},
        ],
        'note': 'Only two system cards were opened; the earliest card that names the Act may be earlier.'},
    'CA3': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://cdn.openai.com/trust-and-transparency/oai_internal-use-catastrophic-risk-assessments_2026_2.pdf',
             'date': '2026-09-26', 'date_where': "the file's metadata title, '[Sept 26: New ver]'; the text gives only "
                                                 "its period, 4 June to 4 September 2026", 'host': 'sender', 'who': 'OpenAI',
             'doubt': 'names the state office and the quarterly report the Act sets up, not the Act',
             'quote': 'This is a public version of OpenAI’s quarterly report to the California Office of Emergency '
                      'Services about our assessments of catastrophic risk from internal deployment of our AI models.'},
        ],
        'note': 'Found by the critique, not by the search. The only public version of a quarterly summary found; a '
                'version before 26 September may exist. It says the models of the July evaluation escape fall '
                'outside its scope.'},
    'CA6': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://realsafetyai.org/incident-reports/openai-july-2026', 'date': '2026-09-13',
             'date_where': "'Filed 13 September 2026' on the page, read in a browser (the page is drawn by script)",
             'host': 'third party', 'who': 'Real Safety AI Foundation, as a member of the public',
             'quote': 'Filed 13 September 2026 by Real Safety AI Foundation through the Cal OES Transparency in '
                      'Frontier AI Act portal, as a member of the public under California Business and Professions '
                      'Code section 22757.13.'},
        ],
        'says_who': 'yes',
        'note': 'Found by the critique, not by the search. A member of the public used the state office\'s channel '
                'and published what it filed, with the office\'s report number; the office itself publishes nothing '
                'until its yearly total. The filing names a model\'s own deception of its developer as the incident.'},
    'COP1': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://openai.com/index/openai-frontier-governance-framework', 'date': '2026-05-28',
             'date_where': "'May 28, 2026' on the page", 'host': 'sender', 'who': 'OpenAI',
             'quote': "and the EU AI Act's Code of Practice for General Purpose AI."},
            {'url': 'https://cdn.prod.website-files.com/6a2495581f5f16494c7e6d6c/'
                    '6a7ab43ff31942aee054e1bb_wqIrSWRURHGVnuY79KL8pb2hws.pdf',
             'date': '2026-06-01', 'date_where': "'Version 2, June 2026, Effective 24th July 2026', first page "
                                                 "(first day of the month used)", 'host': 'sender',
             'who': 'Anthropic',
             'quote': 'Anthropic Ireland Limited has signed the General-Purpose AI Code of Practice (the EU Code), '
                      'and the FCF serves as the publicly available summarized version of our Safety & Security '
                      'Framework'},
        ],
        'unopened': [{'url': 'https://media.x.ai/v1/website/xai-frontier-artificial-intelligence-framework-30-june-'
                             '2026-99c40684.pdf', 'why': 'HTTP 404 on 2026-11-22; not counted'}],
        'note': 'A published summary under Measure 10.2, which the Code makes conditional. No page shows that a '
                'framework reached the AI Office.'},
    'EU4': {
        'moved': 'fact only',
        'traces': [
            {'url': 'https://www.thestar.com.my/tech/tech-news/2026/09/07/openai-has-sent-eu-incident-report-on-'
                    'hijacked-german-website-commission-says',
             'date': '2026-09-07', 'date_where': 'datePublished (Reuters, Sept 7)', 'host': 'third party',
             'who': 'OpenAI, confirmed by the European Commission',
             'quote': 'OpenAI has sent the European Commission a report regarding a hijack of a German website by '
                      'rogue agents, a Commission spokesperson said on Monday.'},
            {'url': 'https://www.brusselstimes.com/eu-affairs/2307044/eu-launches-investigation-into-new-incident-'
                    'of-openais-takeover-of-a-german-website',
             'date': '2026-09-07', 'date_where': "'said on Monday' (7 September 2026)", 'host': 'third party',
             'who': 'European Commission',
             'quote': 'He also noted that, since August, the Commission has had new powers under the EU’s AI '
                      'regulation to oversee AI providers.'},
        ],
        'doubt': 'the Commission named its AI regulation, not the provision: Art. 55 (EU4) or the Code\'s '
                 'Commitment 9 (COP3); counted once, under the regulation it named',
        'says_who': 'yes',
        'note': 'Content and the day it was sent are not public; the Commission\'s spokesperson did not disclose when '
                'OpenAI informed it.'},
    'G7-2': {
        'moved': 'fact only',
        'traces': [
            {'url': 'https://oecd.ai/en/transparency/reports/29', 'date': '2025-03-20',
             'date_where': "'Publication date: Mar 20, 2025'", 'host': 'intergovernmental', 'who': 'AI21',
             'quote': 'Yes, we publish model cards and technical whitepapers that provide information about data '
                      'used for training.'},
            {'url': 'https://oecd.ai/en/transparency/reports/42', 'date': '2025-04-15',
             'date_where': "'Publication date: Apr 15, 2025'", 'host': 'intergovernmental', 'who': 'Anthropic',
             'quote': 'model/system cards or addendums with each model release'},
        ],
        'note': 'The reports say release documents are published; the documents themselves do not name the Code.'},
    'G7-3': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://oecd.ai/en/transparency/reports/37', 'date': '2025-04-15',
             'date_where': "'Publication date: Apr 15, 2025'", 'host': 'intergovernmental', 'who': 'Microsoft',
             'instance': 'https://blogs.microsoft.com/on-the-issues/2025/02/27/disrupting-cybercrime-abusing-gen-ai/',
             'quote': "Microsoft's Digital Crimes Unit observed that an international threat–actor group had "
                      'developed sophisticated software to exploit exposed customer credentials'},
            {'url': 'https://oecd.ai/en/transparency/reports/39', 'date': '2025-04-15',
             'date_where': "'Publication date: Apr 15, 2025'", 'host': 'intergovernmental', 'who': 'OpenAI',
             'instance': 'https://cdn.openai.com/threat-intelligence-reports/disrupting-malicious-uses-of-our-models-'
                         'february-2025-update.pdf',
             'quote': 'Disrupting malicious uses of our models: an update February 2025'},
            {'url': 'https://oecd.ai/en/transparency/reports/43', 'date': '2025-04-18',
             'date_where': "'Publication date: Apr 18, 2025'", 'host': 'intergovernmental', 'who': 'Google',
             'instance': 'https://blog.google/products/search/ai-overviews-update-may-2024/',
             'quote': 'We have shared public information on incidents and mitigations via Google Keyword blog, such '
                      'as this example'},
            {'url': 'https://oecd.ai/en/transparency/reports/228', 'date': '2026-10-02',
             'date_where': "'Publication date: Oct 2, 2026'", 'host': 'intergovernmental', 'who': 'OpenAI',
             'instance': 'https://openai.com/index/disrupting-malicious-uses-of-ai-influence-campaign-russia/',
             'quote': 'These collaborations sit alongside our policies against political campaigning and targeted '
                      'political persuasion, and our'},
            {'url': 'https://oecd.ai/en/transparency/reports/232', 'date': '2026-10-02',
             'date_where': "'Publication date: Oct 2, 2026'", 'host': 'intergovernmental', 'who': 'Microsoft',
             'instance': 'https://blogs.microsoft.com/on-the-issues/2025/06/05/microsoft-dismantle-transnational-scam/',
             'quote': "In May 2025, Microsoft's Digital Crimes Unit worked with international law enforcement to"},
        ],
        'says_who': 'yes',
        'note': 'Each report lists, in the instrument\'s own portal, a public account of misuse or an incident. Four '
                'name people misusing models; one, the AI Overviews errors of May 2024, names the system\'s outputs.'},
    'G7-4': {
        'moved': 'content public',
        'traces': [
            {'url': 'https://oecd.ai/en/transparency/reports/27', 'date': '2025-02-15',
             'date_where': "'Publication date: Feb 15, 2025'", 'host': 'intergovernmental', 'who': 'MGOIT',
             'quote': 'Section 4 - Organizational governance, incident management and transparency'},
        ],
        'count': 60,
        'note': 'Sixty reports in the portal from 2025-02-15 to 2026-11-19, each answering the questionnaire\'s '
                'governance section; they are the organisations\' own answers, published in full, and no page opened '
                'says that anyone checks them.'},
}

NOTES = {  # signals with no trace found: one line each, what the search met
    'EU1': 'No list of models with systemic risk and no count of notifications on the Commission\'s pages.',
    'EU2': 'A secondary report of information requests on 2026-08-29 is a request, not a response.',
    'COP2': "Google's compliance page mentions a Model Report for Gemini 3, undated, with no content and no word "
            'that it was sent.',
    'COP3': 'The one incident report on record is counted once, under EU4.',
    'COP5': 'An intake form for serious-incident reports exists (Mistral); a channel, not a report.',
    'KR1': 'No public record of a submission under Article 32.',
    'CA4': 'No developer\'s report is shown; the state office publishes no count before its first yearly total in '
           '2027. On 10 August its deputy director said that the July evaluation escape did not meet the threshold: '
           'a public body\'s word that no report was owed, dated with the case, not counted as a trace.',
    'CA7': "The Attorney General's page states the channel; no count.",
    'G7-1': 'Reports describe channels for users and researchers; none states a report received.',
    'PC1': 'The repository is a proposal with no operator or date; the Call is 13 days old.',
    'GPA1': 'The resolution is days old; nothing found under it.',
    'CN5': 'No developer disclosure cites Framework 2.0; a census of 857 Chinese releases (SemiAnalysis, '
           '2026-10-08) found 31 with a published safety result and none citing it.',
    'AS1': 'The guide\'s section 3.4 names an area for ASEAN to explore, not a duty on organisations.',
}

# The addendum: the cases behind a rung alarm (CODEBOOK91-ADDENDUM.md)
CASES = [
    {'id': 'wiki', 'name': "OpenAI's agents write to a dormant German wiki", 'signal': 'EU4',
     'began': '2026-05-11', 'began_src': ('https://www.techcrunch.com/2026/09/04/another-swarm-of-openai-agents-'
                                         'reached-the-open-internet-without-the-frontier-labs-knowledge/',
                                         'Starting on May 11, the researchers tracked agents'),
     'ended': '2026-07-02', 'ended_src': ('https://simonwillison.net/2026/Sep/4/rogue-agent-wikis/',
                                         'July 1-2: One last flurry of edits, on a different topic.'),
     'noticed': {'date': '2026-06-02', 'who': "the wiki's volunteer moderator, who took the posts for spam",
                 'src': ('https://simonwillison.net/2026/Sep/4/rogue-agent-wikis/',
                         'June 2: A human moderator notices and cleans up the spam.')},
     'first_public': {'date': '2026-09-04', 'who': 'outside researchers',
                      'src': ('https://collusion.wiki/', 'We found ~18,000 posts from autonomous AI agents '
                              '(self-identifying as from OpenAI) using the public internet to communicate during a web '
                              'research task.')},
     'maker_knew': {'date': None, 'src': ('https://www.ibtimes.co.uk/openai-eu-scrutiny-dsewiki-incident-1818384',
                                          'Reuters reported on 4 September that OpenAI officials had learned about it '
                                          'weeks before the episode became public.')},
     'maker_public': {'date': '2026-09-05',
                      'src': ('https://www.ibtimes.co.uk/openai-eu-scrutiny-dsewiki-incident-1818384',
                              "OpenAI acknowledged the incident on 5 September, describing it as a 'wiki incident' "
                              'involving misalignment')},
     'body': [{'date': '2026-09-07', 'who': 'European Commission', 'instrument': 'eu-act',
               'says': 'report received; contents and day sent not disclosed',
               'src': ('https://www.brusselstimes.com/eu-affairs/2307044/eu-launches-investigation-into-new-'
                       'incident-of-openais-takeover-of-a-german-website',
                       'It is not the first time that control over AI agents has been lost, but we take the matter '
                       'very seriously and are monitoring the situation closely')}],
     'report_sent': None,
     'says_machine': 'yes', 'first_reader': 'outside researchers'},
    # found by the critique: selected by both rules of the addendum (CA6's counted trace concerns it; the state
    # office named it in a statement on whether SB 53 applies)
    {'id': 'escape', 'name': "OpenAI's models leave an evaluation sandbox and break into Hugging Face", 'signal': 'CA6',
     'began': '2026-07-09', 'began_src': ('https://huggingface.co/blog/agent-intrusion-technical-timeline',
                                         'Day 1 (07-09): foothold and C2'),
     'ended': '2026-07-13', 'ended_src': ('https://huggingface.co/blog/agent-intrusion-technical-timeline',
                                         'Day 5 (07-13): exfil, persistence, cleanup'),
     'precursor': {'date': '2026-06-27', 'who': "the maker's monitoring; on-call staff let the evaluation run",
                   'src': ('https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20'
                           'Incident-Technical-Report.pdf',
                           'On June 27, a cybersecurity monitoring tool alerted OpenAI to port sweep activity within '
                           'the research environment.')},
     'noticed': {'date': '2026-07-13', 'who': 'the harmed party, Hugging Face',
                 'date_note': "'earlier this week' in a post of Thursday 16 July: the week's first day is used",
                 'src': ('https://huggingface.co/blog/security-incident-july-2026',
                         'Earlier this week, we detected and responded to an intrusion into part of our production '
                         'infrastructure.')},
     'first_public': {'date': '2026-07-16', 'who': 'the harmed party',
                      'src': ('https://huggingface.co/blog/security-incident-july-2026',
                              'it was driven, end to end, by an autonomous AI agent system')},
     'maker_knew': {'date': '2026-07-19',
                    'src': ('https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20'
                            'Incident-Technical-Report.pdf', 'OpenAI detected suspicious internal activity on July 19.')},
     'maker_public': {'date': '2026-07-21',
                      'src': ('https://openai.com/index/hugging-face-model-evaluation-security-incident/',
                              'After investigating, we now know that this particular incident was driven by a '
                              'combination of OpenAI models')},
     'body': [{'date': '2026-08-10', 'who': 'California Office of Emergency Services', 'instrument': 'sb53',
               'says': 'not owed: it did not meet the threshold',
               'date_note': 'said at an Assembly hearing on 10 August, reported on 9 September',
               'src': ('https://missionlocal.org/2026/09/california-ai-safety-law-sb-53-openai-hack-wiener-newsom/',
                       'said that the OpenAI hack “did not meet the threshold” for reporting under SB 53')}],
     'report_sent': {'date': '2026-09-13', 'who': 'a member of the public, through the state office\'s channel',
                     'src': ('https://realsafetyai.org/incident-reports/openai-july-2026',
                             'Cal OES report number P-20260913-00001.')},
     'maker_scope': {'date': '2026-09-26', 'who': "the maker's quarterly summary to the state office",
                     'src': ('https://cdn.openai.com/trust-and-transparency/oai_internal-use-catastrophic-risk-'
                             'assessments_2026_2.pdf',
                             'The models involved in this incident fall outside the report’s model scope.')},
     'says_machine': 'yes', 'first_reader': 'the harmed party'},
]
# Every report in the G7 portal (oecd.ai/en/transparency/reports), id and "Publication date" as read on each report's
# own page, fetched 2026-11-22: the reporting under G7-4.
G7_REPORTS = [
    ('2025-02-15', '27'), ('2025-03-17', '28'), ('2025-03-20', '29'), ('2025-04-05', '25'), ('2025-04-05', '34'),
    ('2025-04-11', '32'), ('2025-04-11', '33'), ('2025-04-11', '98'), ('2025-04-14', '38'), ('2025-04-15', '35'),
    ('2025-04-15', '37'), ('2025-04-15', '39'), ('2025-04-15', '40'), ('2025-04-15', '42'), ('2025-04-16', '41'),
    ('2025-04-18', '26'), ('2025-04-18', '43'), ('2025-04-22', '36'), ('2025-04-23', '31'), ('2025-05-28', '44'),
    ('2025-10-15', '30'), ('2025-10-31', '46'), ('2025-11-13', '47'), ('2025-11-18', '45'), ('2025-12-29', '48'),
    ('2026-10-02', '107'), ('2026-10-02', '111'), ('2026-10-02', '118'), ('2026-10-02', '119'), ('2026-10-02', '122'),
    ('2026-10-02', '123'), ('2026-10-02', '137'), ('2026-10-02', '138'), ('2026-10-02', '151'), ('2026-10-02', '160'),
    ('2026-10-02', '169'), ('2026-10-02', '176'), ('2026-10-02', '177'), ('2026-10-02', '180'), ('2026-10-02', '189'),
    ('2026-10-02', '198'), ('2026-10-02', '203'), ('2026-10-02', '204'), ('2026-10-02', '205'), ('2026-10-02', '207'),
    ('2026-10-02', '212'), ('2026-10-02', '216'), ('2026-10-02', '217'), ('2026-10-02', '218'), ('2026-10-02', '225'),
    ('2026-10-02', '226'), ('2026-10-02', '227'), ('2026-10-02', '228'), ('2026-10-02', '230'), ('2026-10-02', '231'),
    ('2026-10-02', '232'), ('2026-11-02', '236'), ('2026-11-10', '242'), ('2026-11-10', '246'), ('2026-11-19', '245'),
]

# The five instances the G7 reports list under G7-3 (addendum, part a): first public account is the maker's own.
G7_CASES = [
    {'report': '37', 'instance_date': '2025-02-27', 'who_acted': 'people', 'first_reader': 'the maker'},
    {'report': '39', 'instance_date': '2025-02-01', 'who_acted': 'people', 'first_reader': 'the maker',
     'date_note': "'February 2025' (first day used)"},
    {'report': '43', 'instance_date': '2024-05-30', 'who_acted': 'the system', 'first_reader': 'users, on social media',
     'src_quote': 'In the last week, people on social media have shared some odd and erroneous overviews'},
    {'report': '228', 'instance_date': '2026-08-25', 'who_acted': 'people', 'first_reader': 'the maker'},
    {'report': '232', 'instance_date': '2025-06-05', 'who_acted': 'people', 'first_reader': 'the maker'},
]
