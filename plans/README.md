# Portfolio Audit — Master Index

> **Audited at commit**: `73e8d33`
> **Date**: 2026-08-13
> **Effort level**: deep (all nine categories, whole repo)
> **Site**: [mr-sudo.dev](https://mr-sudo.dev/) — Personal Portfolio of Mosa Moleleki

---

## Executive Summary

This portfolio was built during an early stage of the author's web development journey. It uses a vanilla HTML/CSS/JS stack with Three.js for a 3D splash intro and a custom Node.js build system for templating. The site positions itself as a "find work" portfolio but needs to evolve into a "this is what I've done" portfolio — a showcase of shipped work, professional credibility, and clear conversion funneling.

The audit surfaces **37 distinct findings** across correctness, security, performance, accessibility, UI/UX design, SEO, code quality, and strategic direction. The findings below are ordered by leverage (impact ÷ effort, weighted by confidence).

---

## Vetted Findings Table

| # | Finding | Category | Impact | Effort | Risk | Confidence | Evidence |
|---|---------|----------|--------|--------|------|------------|----------|
| 1 | **Broken EmailJS CDN URL — contact form is dead** | Bug / Correctness | CRITICAL | S | LOW | HIGH | [index.html:88](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L88) — URL is `cdn.js?v=1773556329307delivr.net/...` (cache-bust string injected mid-URL, destroying the domain) |
| 2 | **Broken GitHub links — `Mr-S.U.D.O` is not a valid GitHub user** | Bug / Correctness | HIGH | S | LOW | HIGH | [index.html:504](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L504), [projects.html:119](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/projects.html#L119), [sarko.html:73](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/projects/sarko.html#L73) — periods in the username break the URL (should be `Mr-S-U-D-O`) |
| 3 | **Placeholder `href="/* Add GitHub repository link here */"` shipped to production** | Bug / Correctness | HIGH | S | LOW | HIGH | [index.html:570](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L570), [projects.html:185](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/projects.html#L185), [mcleod-associates.html:73](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/projects/mcleod-associates.html#L73) |
| 4 | **EmailJS public key exposed in client-side script** | Security | HIGH | M | LOW | HIGH | [index.html:92](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L92) — `publicKey: "lF650APp6agq2Kb7v"` hardcoded inline. While EmailJS public keys are designed for client use, this one should be domain-restricted in the EmailJS dashboard. |
| 5 | **Hero profile image is a random Unsplash stock photo of a stranger** | Content / UX | CRITICAL | S | LOW | HIGH | [index.html:218](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L218) — `unsplash.com/photo-1507003211169...` is not Mosa Moleleki. This destroys credibility instantly. |
| 6 | **Footer nav links use `../` prefix on root-level pages — all footer links are broken from index.html** | Bug / Correctness | HIGH | S | LOW | HIGH | [index.html:706-759](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L706-L759) — Links like `../#heroSection`, `../projects.html`, `../#contact` all resolve one level above the site root, producing 404s. |
| 7 | **Project image `src` uses `../projects/` path from index.html (root page) — images won't load** | Bug / Correctness | HIGH | S | LOW | HIGH | [index.html:483](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L483) — `src="../projects/sarko/preview-img/..."` is one directory above root. Should be `projects/sarko/...` (no leading `../`). Affects all project cards on both index.html and projects.html. |
| 8 | **No skip-to-content link on any page** | Accessibility | HIGH | S | LOW | HIGH | All HTML pages — no `<a href="#main-content" class="skip-link">` exists anywhere. WCAG 2.4.1 failure. |
| 9 | **Zero ARIA roles, zero aria-live regions across entire site** | Accessibility | HIGH | M | LOW | HIGH | grep for `role=` and `aria-live` returns nothing. Screen reader users get no semantic navigation, no form feedback announcements. |
| 10 | **Lucide icons loaded from unpinned `@latest` CDN — breaking changes will arrive without warning** | Dependencies | MEDIUM | S | LOW | HIGH | [index.html:96](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L96) — `https://unpkg.com/lucide@latest`. Pin to a specific version. |
| 11 | **Mixed icon systems — Font Awesome + Lucide coexisting with conflicting patterns** | Tech Debt | MEDIUM | M | LOW | HIGH | Nav uses both `<i class="fa-regular fa-user">` and `<i data-lucide="house">`. Theme toggle tries to set `icon.className = "fa-solid fa-sun"` but the element uses `data-lucide`. Icons never render correctly after toggle. |
| 12 | **Theme toggle icon swap is broken** | Bug / Correctness | HIGH | S | LOW | HIGH | [theme.js:95-96](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/js/theme.js#L95-L96) — sets `className` to Font Awesome classes (`fa-solid fa-sun`) but the button HTML uses Lucide's `data-lucide="moon"`. After toggling, the icon disappears. |
| 13 | **Mute toggle icon swap references Font Awesome classes but element uses Lucide** | Bug / Correctness | MEDIUM | S | LOW | HIGH | [index.js:90-92](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/js/index.js#L90-L92) — sets `className` to `fa-solid fa-volume-xmark` on a Lucide icon element. |
| 14 | **`data-lucide` attribute values contain spaces — invalid and won't render** | Bug / Correctness | HIGH | S | LOW | HIGH | [index.html:117](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L117) — `data-lucide="download nav-icon"`, [index.html:159](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L159) — `data-lucide="house nav-icon"`. Lucide expects a single icon name. The `nav-icon` CSS class should be on the `<i>` element's `class` attribute instead. |
| 15 | **Lucide tech icons (html5, css3-alt, js, git-alt, node-js) don't exist in Lucide** | Bug / Correctness | HIGH | S | LOW | HIGH | [index.html:240-245](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L240-L245) — These are Font Awesome icon names. Lucide doesn't have `html5`, `css3-alt`, `js`, `git-alt`, `node-js`. These icons render as empty elements. |
| 16 | **Index.html main.js is fully minified/obfuscated (single-letter variables)** | Code Quality / DX | MEDIUM | M | LOW | HIGH | [index.js](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/js/index.js) — 1093 lines of obfuscated code with vars like `e`, `t`, `o`, `n`, `s`, `i`, `a`, `l`, `r`, `c`, `d`, `m`, `u`, `h`, `y`, `p`, `g`, `f`, `w`, `v`, `E`, `b`, `L`, `x`. The source file IS the minified file, making maintenance nearly impossible. |
| 17 | **No form validation feedback — contact form has no error states** | UX / Accessibility | MEDIUM | M | LOW | HIGH | [index.html:779-814](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L779-L814) — Form uses `required` attributes but has no visual error states, no inline validation messages, no aria-describedby for errors. |
| 18 | **Blog content uses Lorem Ipsum / latin filler text** | Content | MEDIUM | S | LOW | HIGH | [blog.json:11](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/data/blog.json#L11) — Blog post titled "Multilingual Websites" contains `Sed ut unde omnis iste natus sit voluptatem accusantium...` and `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...` |
| 19 | **Only 1 blog post exists — "Articles" section implies plural content** | Content / Strategy | MEDIUM | M | LOW | HIGH | [blog.json](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/data/blog.json) has a single entry. The section header says "Articles" (plural). |
| 20 | **README.md contains random image generation prompts at the bottom** | Docs | LOW | S | LOW | HIGH | [README.md:107-111](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/README.md#L107-L111) — prompts for generating preview images were accidentally left in the README. |
| 21 | **`data-tooltip="Node.min.js?v=1773556329307"` — cache-bust string injected into tooltip text** | Bug / Correctness | MEDIUM | S | LOW | HIGH | [index.html:245](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L245), [index.html:265](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L265) — Users see "Node.min.js?v=1773556329307" instead of "Node.js". The build script's cache-busting regex is too aggressive. |
| 22 | **`z-index: 9999` and `99999` scattered across 6+ CSS rules with no scale** | Code Quality | LOW | M | LOW | HIGH | [style.css:74, 244, 266, 516, 2122](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/css/style.css#L74), [blog-post-v2.css:567](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/css/blog-post-v2.css#L567) |
| 23 | **Duplicate CV download nav rendered twice on index.html** | Bug / Code Quality | LOW | S | LOW | HIGH | [index.html:112-121](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L112-L121) (persistent) and [index.html:191-200](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L191-L200) (inside globalUi). Both have `id="resumeLink"` — duplicate IDs. |
| 24 | **Duplicate footer comment block** | Code Quality | LOW | S | LOW | HIGH | [index.html:678-683](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L678-L683) — "Site Footer (Unified Redesign)" comment appears twice consecutively. |
| 25 | **Contact form placeholder uses "John" and "Doe"** | Content | LOW | S | LOW | HIGH | [index.html:783-787](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L783-L787) — Generic names per redesign-skill audit. |
| 26 | **`about.html` loads unminified `css/style.css` while index loads minified `css/min/style.min.css`** | Performance | MEDIUM | S | LOW | HIGH | [about.html:80](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/about.html#L80) vs [index.html:77](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L77) — about.html also loads the full unminified CSS without cache-bust params. |
| 27 | **404 page loads Google Fonts (Inter) but site already uses Inter via CSS `@import`** | Performance | LOW | S | LOW | HIGH | [404.html:42-45](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/404.html#L42-L45) — Loads `fonts.googleapis.com` for Inter when it's already imported in style.css. Double font request. |
| 28 | **Sitemap missing about.html, 404.html, sitemap.html** | SEO | MEDIUM | S | LOW | HIGH | [sitemap.xml](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/sitemap.xml) — Only 7 URLs. Missing: `about.html`, `sitemap.html`. |
| 29 | **No `<h1>` on projects.html or 404.html** | SEO / Accessibility | MEDIUM | S | LOW | HIGH | [projects.html](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/projects.html) uses `<h2>` as highest heading. [404.html](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/404.html) likely similar. Each page needs exactly one `<h1>`. |
| 30 | **`og:image` URL has spaces — will fail on social media parsers** | SEO | MEDIUM | S | LOW | HIGH | [index.html:44](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/index.html#L44) — `"https://mr-sudo.dev/my pictures/dark mode.webp"` contains spaces. Should be URL-encoded or the directory renamed. |
| 31 | **`asserts` directory name is a typo (should be `assets`)** | Code Quality / DX | LOW | M | MED | HIGH | Entire project references `asserts/` for favicon paths. Technically works but looks unprofessional to anyone reviewing the source. |
| 32 | **`audio sounds` and `my pictures` directories have spaces in names** | Code Quality / DX | LOW | M | MED | HIGH | Spaces in directory names cause URL encoding issues (see finding #30) and complicate scripting. |
| 33 | **Three.js loaded for splash screen but provides questionable value** | Performance | HIGH | L | MED | MEDIUM | [index.js](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/js/index.js) imports Three.js + DRACO + GLTF loaders + CSS3DRenderer for a laptop model in the splash screen. This is ~200KB+ of JS for a loading animation. Portfolio visitors want to see work fast, not wait for a 3D model to load. |
| 34 | **No `prefers-reduced-motion` media query anywhere in CSS** | Accessibility | MEDIUM | S | LOW | HIGH | grep for `prefers-reduced-motion` returns nothing. All animations play regardless of user preference. WCAG 2.3.3 violation. |
| 35 | **`scroll-behavior: smooth` not set** | UX | LOW | S | LOW | HIGH | No smooth scrolling on anchor clicks. Instant jumps. |
| 36 | **Portfolio framed as "looking for work" instead of "this is my work"** | Direction / Strategy | HIGH | L | LOW | HIGH | Hero says "Good morning, my name is... and I am a Front-End Web Developer". No showcase of results. No case study metrics. No "hired by" or "built for" trust signals. Timeline in about section tells a learning story, not a delivery story. |
| 37 | **`unmerged_files.txt` committed to repo** | Code Quality | LOW | S | LOW | HIGH | [unmerged_files.txt](file:///c:/Users/launc/Documents/GitHub/personalPortfolioProject/unmerged_files.txt) — 4988 bytes of merge conflict artifacts shipped to the repo. |

---

## Direction Findings (separate from the bug/debt table)

These are strategic opportunities, not problems. Each grounded in evidence from the repo:

### 1. Reframe the entire narrative from "aspiring developer" to "developer who ships"

**Evidence**: The hero says "Good morning, my name is... I am a Front-End Web Developer". The about timeline tells a learning story ("Strong Start", "Self-Taught Momentum", "Engineering Mindset"). But the projects section shows 4 shipped client websites (SARKO, RN Inc, McLeod & Associates, King Law Firm) with real case studies. The work exists — the framing undersells it.

**Suggestion**: Lead with outcomes. "I build websites for real businesses. Here's proof." Show project metrics (performance scores, before/after, client outcomes). Move the timeline to the about page. Make the homepage a conversion funnel: Hero → Trust proof → Case studies → Contact.

### 2. Add real testimonials from clients

**Evidence**: The projects show work done for SARKO, RN Inc (law firm), McLeod & Associates (law firm), King Law Firm. These are real clients. There is no social proof section on the site.

**Suggestion**: Add a testimonials section with real quotes from these clients. Even a single line from each client validates the work more than any self-description.

### 3. Build out the blog with real technical content

**Evidence**: Only 1 blog post exists, and its body is mostly Latin filler. The author clearly has real technical knowledge (the build system, the Three.js integration, vanilla JS architecture decisions). Writing about these topics would demonstrate expertise far more effectively than listing them.

### 4. Consider dropping Three.js splash in favor of instant content

**Evidence**: The splash screen loads a 3D laptop model using Three.js + DRACO + GLTF (200KB+ JS). Modern portfolio best practice is to show content immediately. The quote "If curiosity is the mother of learning, then obsession is the father of mastery" could be shown as a simple CSS animation in under 1 second, then the hero content appears instantly.

---

## Dependency Ordering

Plans should be executed in this order:

1. **001-fix-critical-broken-links** — Fix EmailJS URL, broken GitHub links, placeholder hrefs, footer relative paths, project image paths. **Must be first — the site is partially non-functional.**
2. **002-fix-icon-system** — Resolve Lucide/Font Awesome conflict, fix invalid `data-lucide` attributes, fix non-existent icon names.
3. **003-fix-theme-toggle** — Fix theme and mute toggle icon swaps.
4. **004-fix-hero-profile-image** — Replace stock Unsplash photo with real profile image.
5. **005-fix-accessibility-foundations** — Add skip-to-content, ARIA roles, landmarks, focus management, `prefers-reduced-motion`.
6. **006-fix-seo-issues** — Fix heading hierarchy, og:image URL spaces, sitemap completeness, meta descriptions.
7. **007-fix-build-script-cache-busting** — Fix the regex that corrupts URLs and tooltip text.
8. **008-fix-content-quality** — Remove Lorem Ipsum, fix placeholder names, clean README, remove unmerged_files.txt.
9. **009-performance-quick-wins** — Consistent minified CSS loading, pin Lucide version, eliminate double font loads.
10. **010-code-cleanup** — Resolve duplicate IDs, z-index scale, remove dead code, rename `asserts` directory.
11. **011-narrative-redesign-strategy** — Reframe portfolio from "looking for work" to "this is my work" (direction plan, not build plan).

---

## What Was Not Audited

- The **3D model files** (`models/laptop.glb`, `models/iphone.glb`) were not inspected for size optimization.
- The **minified JS/CSS files** in `js/min/` and `css/min/` were not diffed against their source files for drift.
- **Cross-browser testing** was not performed (no browser available in this audit).
- **Mobile responsiveness** was audited via CSS code review only, not via device testing.
- **Lighthouse scores** were not run (would require serving the site locally).

---

## Considered and Rejected

| Finding | Reason for Rejection |
|---------|---------------------|
| "Move to a framework (React/Next.js)" | Author intentionally chose vanilla HTML/CSS/JS for full control. This is a documented architectural decision in the README. Respect it. |
| "Add TypeScript" | The source JS is already minified/obfuscated. Adding TS to an obfuscated source would provide no benefit until the source is un-minified. |
| "Add a CMS" | The custom build system with JSON data + markdown + templates is a reasonable approach for a site with 4 projects and 1 blog post. |

---

## Status Table

| Plan | Title | Status | Depends On |
|------|-------|--------|------------|
| 001 | Fix critical broken links and URLs | TODO | — |
| 002 | Fix icon system (Lucide/FA conflict) | TODO | — |
| 003 | Fix theme and mute toggle icon swaps | TODO | 002 |
| 004 | Fix hero profile image | TODO | — |
| 005 | Fix accessibility foundations | TODO | — |
| 006 | Fix SEO issues | TODO | — |
| 007 | Fix build script cache-busting regex | TODO | — |
| 008 | Fix content quality issues | TODO | — |
| 009 | Performance quick wins | TODO | 002, 007 |
| 010 | Code cleanup and hygiene | TODO | 001, 002 |
| 011 | Narrative redesign strategy | TODO | 001–010 |
