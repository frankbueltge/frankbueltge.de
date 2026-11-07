# Ducking launch, November 2026: posts and checklist

**Status: drafts. Nothing has been posted anywhere.** Posting leaves the house, so it is Frank's own
step, on a day he picks.

On 2026-11-03 Frank agreed a plan for more attention to the site (wording private):

1. Quiet groundwork, now done: GitHub topics, the profile README and the GitHub bio.
2. One launch moment with [Ducking](https://frankbueltge.de/ducking/).
3. The EMAF 40 call.

LinkedIn waits until there is outside proof. This file holds the texts for step 2, the checks they rest
on, and the risks that decide whether a post survives.

Figures marked **⟨check⟩** move with the ledger or with the next round. Read them off the live page on
the day and correct them before posting. The values below are from the week to 2026-11-07.

## Before posting

1. **Open the desk on your own phone, with sound.** Nobody has tried it on a real phone yet. iOS Safari,
   the silent switch and two-thumb multi-touch are untested. The browser check below emulated a phone
   with a mouse. Turn the sound on, hold a fader for a few seconds, then press Play.
2. **Correct every ⟨check⟩ figure** from the live page: the crowd's share (caption above the screen),
   the number of sources ("What the record shows"), and the Play button's day count.
3. **Keep two or three hours free after the Show HN post.** HN's rules ask that the maker is around to
   answer questions.
4. **Ask nobody to upvote or comment.** HN forbids it, and the ranking penalises it.
5. **Bluesky:** create the account first; see the profile line below.
6. **Reddit:** read the subreddit's own rules page yourself, and look at your account's recent history
   against the 90/10 rule. Both are explained below; neither could be checked from here.

## 1. Show HN

HN's rules: <https://news.ycombinator.com/showhn.html>, read 2026-11-08. The ones that matter here:

- It must be something people can try without a signup. Ducking needs none.
- The maker has to be around to discuss it.
- No upvote requests.
- No "quickly-generated one-offs"; explain how and why. The first comment answers that with facts that
  are already public on the method sheet: the measured lowpass, the checked readings, the ledger running
  since September, and the prior work.

**Title** (HN allows 80 characters):

> Show HN: Ducking – a mixing desk for the world's attention

Alternative, if the name alone says too little:

> Show HN: A mixing desk where each fader is an issue's share of the web's charts

**URL:** `https://frankbueltge.de/ducking/`

**First comment.** Post it right after submitting. It is plain on purpose: what it is, how it works,
what it is built on, and what it cannot say.

> Ducking is a mixing desk in the browser. Thirteen faders stand for fields of what presses on the
> world, from war and hunger to climate and AI's harms. A fourteenth is the crowd: everything else.
>
> Each fader stands at its field's share of what 21 ⟨check⟩ public charts and feeds held in the last
> seven days. Among them are the HN front page, Google Trends, Wikipedia's most-read pages, Reddit,
> Google News, GitHub, the App Store and Steam. A headline counts for a field when it contains one of
> the field's terms. The page lists the terms and the newest matches, false positives included. This
> week the crowd holds about 96 % ⟨check⟩.
>
> Each field has a synthetic voice reading where it stands, every figure checked against its source.
> The crowd is several voices reading a sample of the actual chart entries. All of them play at once
> at the level the week gave them, so at first you hear only the crowd. Push a fader up and hold it,
> and its voice comes out. The total stays at 100 %, so the room comes from the crowd. Let go and it
> falls back. Nothing latches.
>
> Some details:
>
> - The faders are logarithmic, as on a real desk. A field at 1 % of the mix sits 20 dB under the whole.
> - Against the open crowd, a voice needed about 80 % of the mix before a transcription recovered it
>   fully. So the crowd is low-passed as you raise a field, and with the filter 10 % is enough. That
>   filter is the one thing the faders don't show.
> - Play runs the record back from mid-September ⟨check⟩, two seconds a day. Real headlines that named a
>   field are read by its voice.
> - The voices are Kokoro-82M, an open TTS model, rendered locally. The counting uses no model. It is
>   term matching over a ledger of committed JSON, collected every morning since 2026-09-02. Code and
>   data: https://github.com/frankbueltge/frankbueltge.de
> - The closest prior work I found is AudioStreamer (Schmandt and Mullins, CHI 1995). Leaning towards
>   one of three news streams turns it up, but there the levels measure nothing.
>
> Why: Eisensee and Strömberg (QJE 2007) found that US disaster relief depended on what else was in the
> news. Attention behaves like a fixed sum, and the desk puts that in your hand.
>
> Limits: these charts lean to technology and to English, and a fader is a field's place on them, not
> in the world. Method and limits: https://frankbueltge.de/werke/ducking
>
> Sound loads only when you press Sound on (about 5 MB). Nothing you do at the desk is sent or kept. The
> HN front page is one of the sources, read each morning, so this thread may end up in tomorrow's crowd.

**Optional line, Frank's call.** The site states AI involvement in its own words, and HN readers will
ask. If you want to say it up front, add as the last paragraph:

> I build with AI coding agents. The counts use no model, and everything is in the repo.

## 2. r/InternetIsBeautiful

**This is the weakest of the three venues, and it is fine to skip it.**

**Where the rules come from.** Reddit could not be read from here: the browser pane blocks it. The
rule texts below are therefore taken from a third-party copy of the public rules page, captured
2026-10-29 ([Rankhog](https://rankhog.com/subreddits/internetisbeautiful), confirmed in outline by
[Thread Otter](https://www.threadotter.com/subreddit-rules/internetisbeautiful), checked July 2026).
Read the sidebar yourself before posting. No rule on title format was found.

Three of the rules bite:

- **AI-Generated Content.** Per the copy, a site is not allowed when AI produces its primary content
  or drives its functionality. The counts use no AI, but every voice is synthetic, and the readings
  were written from a briefing that a machine practice wrote, checked against sources afterwards. A
  moderator can read Ducking either way.
- **No Politics.** Play reads real headlines aloud. In the current round they include Iran, the Strait
  of Hormuz and a US president's approval rating.
- **90/10.** At most a tenth of your recent Reddit activity may be about a site you run. Whether your
  account passes depends on its history, which only you can see.

Further rules that probably pass: no signup, no payment, no download, not a game, and unique (the
nearest neighbours are in the USP audit, §23).

**Hug of Death** is a rule too, and it is covered under risks below.

If you want to post, the safer path is to **ask the moderators first** (modmail). Draft:

> Hi, before posting I'd like to ask whether this fits: https://frankbueltge.de/ducking/ is a mixing desk
> in the browser where each fader is a world issue's share of what 21 public charts held this week.
> The counting is plain term matching with no AI, but the channels are read aloud by synthetic voices
> (an open text-to-speech model) and the play mode reads real news headlines. Would that fall under
> the AI-generated content or politics rules? I made it, and I'd post it once. Thanks.

**Title**, written to the copied rules. It describes the site, has no "I made", no hype and no
political words:

> A mixing desk for the world's attention: each fader is an issue's share of what the web's charts held
> this week, and it only stays up while you hold it

**First comment**, for disclosure:

> I made this. Thirteen faders are fields such as hunger, climate and displacement; the fourteenth is
> everything else on 21 ⟨check⟩ public charts. Turn the sound on, push a fader up and hold it. How it
> is counted: https://frankbueltge.de/werke/ducking

Don't post it on the same day as Show HN. Two spikes at once would also share one daily Functions
quota; see the risks below.

## 3. Bluesky thread

There is no account yet.

**Profile.** Display name `Frank Bültge`, bio as on GitHub since 2026-11-03:

> Data & AI Engineer · Karlsruhe · How can AI support and extend artistic research? frankbueltge.de

**Handle.** `frankbueltge.bsky.social` works at once. Optionally, `frankbueltge.de` can be the handle
itself. Bluesky shows a TXT record for `_atproto.frankbueltge.de` during setup, and you would add it
in Cloudflare DNS. That ties the account to the site.

A new account has no followers, so this thread mainly gives the work a place people can link to and
find in search. Every post below is at most 300 characters, the limit, counted with the full URL.

**1/**

> Ducking: a mixing desk for the world's attention. Thirteen faders for what presses on the world, from
> war to AI's harms, each at its share of what the web's charts held this week. The crowd of everything
> else holds about 96 % ⟨check⟩. Hold a fader up to hear it.
> https://frankbueltge.de/ducking/

**2/**

> Each field has a voice reading where it stands, every figure checked against its source. All play at
> once, at the level the week gave them, so at first you hear only the crowd. Hold a field up and the
> room comes from the crowd. Let go and it falls back. Nothing latches.

**3/**

> Press play and the desk runs back through the last weeks: the faders move as they moved, and real
> headlines that named a field are read by its voice. On a phone, two thumbs can hold two fields.

**4/**

> Why a desk: attention behaves like a fixed sum. US disaster relief once depended on what else was in
> the news (Eisensee & Strömberg, 2007). How it is counted, and what it cannot say:
> https://frankbueltge.de/werke/ducking

Post 1 carries the link card: paste the URL, let the card load, then remove the URL text if you like.
The card shows Ducking's own image since #1275.

## When

The choice is Frank's. What bears on it:

- **Show HN.** A common rule of thumb is a weekday US morning, about 15:00–17:00 Berlin (9–11
  Eastern). Weekend mornings have less competition and fewer readers. What matters most is that you
  have the next two or three hours free.
- **Bluesky** can go the same day, after the HN post.
- **r/InternetIsBeautiful** goes on another day, after the moderators answer, if at all.
- Rounds change the voices. When the next briefing arrives, a new round is recorded automatically. The
  desk works with any round, but the ⟨check⟩ figures and the Play dates move with it.

## What was checked, 2026-11-08

On the live site at 1024 px and at 375 px (an emulated phone), with sound muted at the output:

- **Console:** no messages in a fresh tab.
- **Load:** about 300 KB. The 15 audio files (5.3 MB) load only on Sound on.
- **Controls:** Sound on, holding a fader, letting go, Play with the spoken record, stop and Sound off
  all work at both widths. No sideways scroll at 375 px.
- **Fixed in #1275:**
  - the link card, which was the site's home card;
  - the page description, which still called the faders matters;
  - the crowd's lowest words, which could cover the hint at every width.
- **Not tested:** iOS Safari, a real phone, real multi-touch.

## Risks

- **Traffic.** The page and its audio are static files, and Cloudflare serves those without limit.
  The site's Functions are not static: the visitor count, the rating widget, seeds, Third Reading,
  studies and notifications. On the Free plan they share 100,000 requests a day, reset at midnight UTC
  ([Cloudflare](https://developers.cloudflare.com/pages/functions/pricing/)). One view of Ducking makes
  about three of those requests (the count's script and beacon, and the rating widget). So roughly
  30,000 views in one UTC day would use up the day's quota. After that, those features stop until
  midnight UTC. Whether Cloudflare then serves the static page or shows an error for those routes
  depends on the project's fail mode. The desk itself keeps working.
  - The plan and today's usage could not be read: the dashboard was signed out in the browser pane. The
    repo's own records say Free plan.
  - Raising the limit costs money, so it is Frank's decision.
- **AI assistants.** Cloudflare's AI Crawl Control blocks some assistants' user fetchers, against what
  robots.txt allows. Anyone who pastes the link into such an assistant gets nothing back. HN, Reddit
  and Bluesky cards are not affected. The toggle is Frank's.
- **Politics and AI on Reddit**: see section 2.
