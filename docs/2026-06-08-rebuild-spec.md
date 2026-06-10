# frankbueltge.de — Rebuild Spec (Astro, award-caliber + SEO)

**Status:** proposed · **Date:** 2026-06-08 · supersedes the Next.js dashboard build
**Author input:** Frank Bültge (Data & AI Engineer) · bilingual DE/EN · dark · brand ties: data-snack.com, datavism.org

> Built from a deep-research pass (31 sources, 12 claims verified 3-0). Citations inline as `[n]`.
> Verification key: ✅ adversarially verified · 📄 reputable source, not re-verified · 🔧 our judgment.

---

## 1. Context — why a from-scratch rebuild

The Next.js "frank.os dashboard" became a patch-treadmill (theme/nav/scroll/mask bugs from gluing two design eras together) and never reached the FWA/awwwards "wow" Frank asked for from day one. Decision: **start fresh on the right stack, design-first.** Goals are equal-weight: **(a) an award-caliber visual experience** and **(b) rank #1 for the name "Frank Bültge"** (a distinct entity from the WordPress-dev namesake).

### The SEO truth that unblocks ambition (verified)
- ✅ Core Web Vitals **are** used by Google's ranking systems — speed still counts [1].
- ✅ But **relevance outweighs page experience**: Google shows the most relevant result "even if the page experience is sub-par" [1].
- ✅ Page experience is a **tiebreaker** among comparably-helpful pages; there is **no single page-experience signal** [1][2].
- 🔧 For a *name* query, entity/E-E-A-T/relevance dominate. So a rich experience can rank #1 **iff** the crawlable content layer is strong and fast. The architecture below guarantees that.

---

## 2. Concept — "From raw data to meaning" (proposed signature)

Frank literally turns raw data into products, decisions, insight and stories. The site **is** that, as an experience — authentic, not a gimmick. Award references to learn from: data-art (earth.nullschool [7], The Pudding [8], Stamen [9]) + scroll-driven 3D portfolios (Sébastien Lempens, Bilal Elmossaoui [6]).

**Landing:** a full-bleed, scroll-driven WebGL data field — particles/flow that morph through *raw → structure → insight → identity*, resolving into "Frank Bültge". Mouse-reactive, brand violet→cyan, sound optional.

**The Lab = the engine (and the SEO moat):** real **data-story scrollytelling** pieces (Pudding-style) that are simultaneously the wow *and* the indexable, original, E-E-A-T content that wins the name ranking. data-snack feeds it. This is the unification: **every "wow" page is also a content page.**

*(Open: confirm this concept vs. a pure data-globe (nullschool-style) or pure kinetic-editorial. Recommended: the hybrid above.)*

---

## 3. Stack — recommended: **Astro (islands) + WebGL islands**

🔧 Astro over Next.js for this exact goal (content-that-ranks + landing-that-wows):

| Need | Astro delivers |
|---|---|
| Ranking content layer | Zero-JS static HTML by default → top CWV, fully crawlable, built-in i18n + hreflang [11] |
| The wow | WebGL/motion as **islands** (`client:visible`/`client:load`), gated & deferred — never blocks content |
| Seamless transitions | View Transitions + `transition:persist` keep the WebGL canvas alive across routes (Astro fixed Safari context-loss, Jan 2026) [3][5] |
| Proven | codrops ships exactly this: GSAP + Three.js + Astro scroll-WebGL [4] |

**Pinned libraries** (all from verified/sourced findings):
- **OGL** for shader-driven hero (lighter than Three.js) ✅[10] — escalate to **Three.js + TSL** only if true 3D/WebGPU depth is needed (TSL compiles to WebGL *and* WebGPU) ✅[12].
- **Lenis** — smooth-scroll authority, few KB, zero deps; one loop drives WebGL + GSAP + parallax ✅[13][14].
- **GSAP** (ScrollTrigger/Flip) — choreography; the whole experience driven by a **single `progress` 0→1 uniform**, decoupled from GLSL ✅[15].
- Type: self-hosted variable fonts (subset latin-ext for ü/ä/ö/ß).

### Architecture (the crux — keeps it crawlable AND spectacular) 📄[4]
```
Layout root:
  <div id="app">            ← Astro semantic HTML: real text, links, headings (SEO layer, SSG)
    <slot/>
  </div>
  <canvas id="webgl"/>      ← decoupled progressive-enhancement layer (the wow), an island
```
- Crawlers parse the DOM normally; WebGL is an overlay, not the content.
- One scroll value (Lenis) → WebGL planes sync to DOM via `getBoundingClientRect`.
- On route change: dispose unused geometries/materials/textures (GPU-memory hygiene) 📄[4].
- Selective rendering: skip the render pass entirely when off-view ✅[research].

---

## 4. Site structure (unified IA — fixes the old nav chaos)

One nav everywhere → real pages. Logo → home.
- `/` — signature landing experience + concise overview
- `/work` (Projekte) — data-snack, datavism, SIP (SIP internal, no external link)
- `/lab` — the scrollytelling data-stories index (the content engine)
- `/lab/[slug]` — individual data-story (wow + indexable article)
- `/about` — entity home (Person schema, sameAs, bio)
- `/contact`
- `/impressum`, `/datenschutz` (legal, mandatory)
- DE/EN throughout with hreflang + x-default=de.

---

## 5. SEO / entity plan (carries over what was right)
- `Person` JSON-LD with `sameAs` (LinkedIn, GitHub, Instagram), `disambiguatingDescription`, `knowsAbout`; project brand profiles as `sameAs` on the project nodes (data-snack: LinkedIn/IG/TikTok/Bluesky/Mastodon).
- `BlogPosting`/`Article` per lab story, `BreadcrumbList`, `WebSite`.
- Per-page metadata, canonical, hreflang, sitemap, robots, dynamic OG.
- **Step 0 at launch:** reverse the live `frankbueltge.de → data-snack.com` 301 so the domain serves itself.

---

## 6. Performance & accessibility budget
- Landing content (text/h1) server-rendered, instant; WebGL island deferred (after load + idle + in-view), paused off-screen.
- ✅ `prefers-reduced-motion`: skip the animation, show the static identity + content [web.dev motion a11y].
- Targets: content CWV green; experience pages may carry more JS but stay interactive < 200ms INP; no CLS.

---

## 7. Build phases
0. **Scaffold** Astro + i18n + content collections + SEO primitives (sitemap/robots/schema) → deploy skeleton, reverse the 301.
1. **Content layer first** (ranks immediately): About entity home, Work, Lab index, legal — fast static HTML, full schema.
2. **Signature landing**: decoupled canvas + OGL hero + Lenis/GSAP, the raw→meaning journey, reduced-motion fallback.
3. **First real data-story** in /lab (scrollytelling template = reusable wow+content unit).
4. **Polish**: transitions (`transition:persist`), OG images, sound (opt-in), CWV + a11y verification (chrome-devtools/playwright).

---

## 8. Risks / open decisions
- 🔧 WebGL scope creep → keep one signature effect, OGL-first, escalate only if needed.
- Confirm signature concept (§2). Confirm Astro rebuild (vs. salvage Next.js — not recommended).
- Org spend limit hit during research; normal coding is far cheaper, but heavy multi-agent runs may need the admin to raise it.

## Sources
[1] Google — Page experience (developers.google.com/search/docs/appearance/page-experience) ✅
[2] Google — Core Web Vitals & ranking (…/core-web-vitals) ✅
[3] Astro — View transitions docs; [5] Astro PR #15728 (persist canvas / Safari context-loss) 📄
[4] Codrops — WebGL gallery with GSAP + Three.js + Astro + Barba 📄
[6] Awwwards — current WebGL portfolios (Lempens, Elmossaoui, Abdullah) 📄
[7] earth.nullschool.net · [8] pudding.cool · [9] Stamen/Cooper-Hewitt 📄
[10][15] Codrops — OGL + single GSAP progress uniform ✅
[11] Astro SEO/i18n (joost.blog/astro-seo) 📄 · [12] shader.se WebGPU/TSL ✅ · [13][14] Lenis (github.com/darkroomengineering/lenis) ✅
