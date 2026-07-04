# The Auction You Never Entered

## Idea

Every page load on an ad-funded site triggers a Real-Time Bidding (RTB) broadcast: your data — location, inferred interests, identifiers — is transmitted to hundreds of companies so they can bid on showing you an ad, before the page finishes rendering. You are the lot, not the bidder. The snack walks the reader through one page load as a forensic timeline: what fires, who receives, what the bid request contains, and why the consent banner at the front door has no jurisdiction over the auction floor behind it.

The scale, per the ICCL's report-PDF figures: "178 Trillion RTB broadcasts about people in U.S. & Europe every year," with "RTB is the biggest data breach ever recorded. It tracks and shares what people view online and their real-world location 294 billion times in the U.S. and 197 billion times in Europe every day." Per person: "On average, a person in the U.S. has their online activity and location exposed 747 times every day by the RTB industry" and "In Europe, RTB exposes people's data 376 times a day." On the receiving end: "4,698 companies are allowed by Google to receive RTB data about people in the U.S." — and for a single country's traffic, "19.6 Million Google broadcasts about German users every minute they're online." (All: ICCL, "The Biggest Data Breach," May 2022 PDF, https://www.iccl.ie/wp-content/uploads/2022/05/Mass-data-breach-of-Europe-and-US-data-1.pdf)

## Why now

cookie-roulette covers the banner — the front door. This is the layer behind it: the data-broadcast machinery that runs at population scale regardless of what anyone clicked. What makes it current isn't the 2022 scale numbers, it's what courts have since done with the mechanism itself.

On 7 March 2024, the CJEU ruled on Case C-604/22 (IAB Europe). Per the Belgian Data Protection Authority's summary: "In its decision, the Court holds, as argued by the Belgian DPA in its decision 21/2022, that a structured character string capturing internet users' preferences such as IAB EUROPE's TC string can indeed be considered as personal data, and that IAB EUROPE can be qualified as a (joint) controller of users' preferences for online advertising." The same source notes the Transparency and Consent Framework (TCF) "plays a central role in what is known as Real Time Bidding (RTB)." (https://www.dataprotectionauthority.be/citizen/iab-europe-case-the-cjeu-answers-the-questions-referred-for-a-preliminary-ruling)

On 14 May 2025, the Belgian Market Court applied that ruling. Per Hogan Lovells' analysis: "the Belgian Market Court delivered a landmark ruling regarding IAB Europe's role in the Transparency and Consent Framework (TCF). The Court confirms that TC Strings qualify as personal data and that IAB Europe must be regarded as a joint controller under the GDPR, but only for its own processing of TC Strings." The same page details the scope limit set at CJEU stage: "The Court limited IAB Europe's responsibility to the initial recording of user preferences (e.g., consent signals), explicitly excluding subsequent uses such as personalized advertising by other actors." (https://www.hoganlovells.com/en/publications/eu-digital-advertising-iab-europe-and-the-allocation-of-liabilities-for-the-tcf)

That's the pitch in one line: the consent string — the very artifact meant to prove you agreed — has now been ruled personal data in its own right, and the body that runs the framework has been ruled a joint controller for it, with the courts explicitly drawing the line at where that responsibility stops. The auction runs on; the argument now is about who's liable for the ticket stub.

## Data basis

- ICCL, "What is Real Time Bidding?" — https://www.iccl.ie/what-is-real-time-bidding
  - Quoted exactly: "The data breach occurs in online advertising's Real-Time Bidding (RTB) system, hundreds of billions of times daily."
  - Quoted exactly: "Here's the list of 968 companies Google sends your personal data to on a daily basis"
- ICCL, "The Biggest Data Breach" (full report PDF, May 2022) — https://www.iccl.ie/wp-content/uploads/2022/05/Mass-data-breach-of-Europe-and-US-data-1.pdf
  - Quoted exactly: "178 Trillion RTB broadcasts about people in U.S. & Europe every year"
  - Quoted exactly: "4,698 companies are allowed by Google to receive RTB data about people in the U.S."
  - Quoted exactly: "19.6 Million Google broadcasts about German users every minute they're online"
  - Quoted exactly: "RTB is the biggest data breach ever recorded. It tracks and shares what people view online and their real-world location 294 billion times in the U.S. and 197 billion times in Europe every day."
  - Quoted exactly: "On average, a person in the U.S. has their online activity and location exposed 747 times every day by the RTB industry."
  - Quoted exactly: "In Europe, RTB exposes people's data 376 times a day."
  - Quoted exactly: "The RTB industry generated $117+ billion in the U.S. & Europe in 2021."
  - Per-country daily broadcast figures from the report's map: "DE 30.8bn FR 25.4bn UK 31.9bn"
  - Appendix tables break down "% share of RTB broadcasts per company per European country" (Google, Index Exchange, PubMatic, Magnite, Microsoft/Xandr, BidSwitch, OpenX and others) — e.g. Germany: Google 21%, Index Exchange 19%, PubMatic 15%
  - **Vintage note: these scale and revenue figures are from the May 2022 report (2021 revenue data). No newer ICCL scale study has been located; the brief should flag the numbers as dated-but-uncontested rather than current-year.**
- ICCL announcement, "ICCL report on the scale of Real-Time Bidding data broadcasts in the U.S. and Europe" (16 May 2022) — https://www.iccl.ie/news/iccl-report-on-the-scale-of-real-time-bidding-data-broadcasts-in-the-u-s-and-europe
  - Confirms the report's key figures and lists ICCL's ongoing litigation: "at Landgericht Hamburg against the tracking industry standards body IAB TechLab, and against Microsoft's online advertising exchange Xandr"; "at the Irish High Court against the Data Protection Commission, for its failure to investigate our complaint about the Google's RTB data breach"; "at the Brussels Market Court, ICCL is a party against IAB Europe's appeal of an order by the Belgian Data Protection Authority"
- Belgian Data Protection Authority, on CJEU Case C-604/22 (published 7 March 2024) — https://www.dataprotectionauthority.be/citizen/iab-europe-case-the-cjeu-answers-the-questions-referred-for-a-preliminary-ruling
  - Quoted exactly: "In its decision, the Court holds, as argued by the Belgian DPA in its decision 21/2022, that a structured character string capturing internet users' preferences such as IAB EUROPE's TC string can indeed be considered as personal data, and that IAB EUROPE can be qualified as a (joint) controller of users' preferences for online advertising."
  - Confirms the TCF "plays a central role in what is known as Real Time Bidding (RTB)"
- Hogan Lovells, "EU Digital Advertising: IAB Europe and the Allocation of Liabilities for the TCF" — https://www.hoganlovells.com/en/publications/eu-digital-advertising-iab-europe-and-the-allocation-of-liabilities-for-the-tcf
  - Quoted exactly: "On May 14, 2025, the Belgian Market Court delivered a landmark ruling regarding IAB Europe's role in the Transparency and Consent Framework (TCF). The Court confirms that TC Strings qualify as personal data and that IAB Europe must be regarded as a joint controller under the GDPR, but only for its own processing of TC Strings."
  - Quoted exactly on the CJEU ruling's scope: "the CJEU determined that (i) the TC String does constitute personal data, particularly when it can be linked to an IP address or other identifiers accessible to members of the TCF, and (ii) IAB Europe is considered a joint controller ... The Court limited IAB Europe's responsibility to the initial recording of user preferences (e.g., consent signals), explicitly excluding subsequent uses such as personalized advertising by other actors."

## Suited host

Key (Cookie) — this is event streams, identity graphs, and consent forensics; I read bid requests the way others read menus.

## Menu fit

Category: algorithm-hot-sauce. Direct sequel to cookie-roulette: the banner is the intake valve, RTB is the pipeline it feeds; cross-links in both directions.

## Sources

- https://www.iccl.ie/what-is-real-time-bidding
- https://www.iccl.ie/wp-content/uploads/2022/05/Mass-data-breach-of-Europe-and-US-data-1.pdf
- https://www.iccl.ie/news/iccl-report-on-the-scale-of-real-time-bidding-data-broadcasts-in-the-u-s-and-europe
- https://www.dataprotectionauthority.be/citizen/iab-europe-case-the-cjeu-answers-the-questions-referred-for-a-preliminary-ruling
- https://www.hoganlovells.com/en/publications/eu-digital-advertising-iab-europe-and-the-allocation-of-liabilities-for-the-tcf
