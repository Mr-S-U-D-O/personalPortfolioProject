# Plan 011: Narrative redesign strategy — from "looking for work" to "this is my work"

> **Executor instructions**: This is a **direction plan**, not a code plan.
> It describes strategic changes to the site's narrative, content structure,
> and conversion funneling. Implementation should be broken into smaller
> plans by the author or a design-focused executor.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: LOW
- **Depends on**: 001–010 (all bug/debt fixes should land first)
- **Category**: direction
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

The portfolio currently tells the story of someone who is *learning to code*. The hero says "Good morning, my name is Mosa Moleleki and I am a Front-End Web Developer." The about section is an 8-node timeline of the author's learning journey ("Strong Start", "Self-Taught Momentum", "Engineering Mindset", etc.).

But the *actual work* tells a different story. The projects section shows **4 shipped client websites** for real businesses:
- **SARKO** — a political mobilization platform
- **RN Inc** — a corporate legal services site
- **McLeod & Associates** — a law firm with multi-step intake
- **King Law Firm** — another legal services site

These are real clients who trusted Mosa with their digital presence. The work is real. The framing undersells it.

A hiring manager visiting this portfolio sees:
1. A 3D loading animation (delays time-to-content)
2. A quote about curiosity and obsession (self-focused, not client-focused)
3. A stock photo (destroyed by Plan 004, but the framing remains)
4. "Good morning, my name is..." (generic greeting)
5. A tech carousel (listing skills, not demonstrating them)
6. A timeline of personal growth (learning story, not delivery story)
7. Project cards (finally, the work — but buried below the fold)

**The portfolio should say: "I build websites for real businesses. Here's proof."**

## Proposed narrative structure

### Homepage flow (conversion funnel)

```
1. HERO → Who you are + what you do + proof of results (1 sentence + 1 metric)
2. TRUST STRIP → Client logos or "Built for..." names
3. CASE STUDIES → 2-3 featured projects with visual before/after or key metrics
4. SKILLS → Tech stack as supporting evidence, not the headline
5. ABOUT (brief) → 2-3 sentence elevator pitch, link to full about page
6. TESTIMONIALS → Real quotes from SARKO, RN Inc, McLeod, King Law clients
7. CTA → Contact form with clear value proposition
8. FOOTER → Standard navigation + social
```

### Key content changes

#### Hero section

**Current**:
```
Good morning, my name is...
Mosa Moleleki
AKA "S.U.D.O" and I am a...
Front-End Web Developer
based in Johannesburg.
```

**Proposed**:
```
Mosa Moleleki
I build high-performance websites for businesses that take their digital presence seriously.
[See my work →]  [Get in touch →]
```

Remove:
- The time-of-day greeting (cute but not professional)
- The "AKA S.U.D.O" alias (fine for GitHub, distracting on a portfolio)
- The "and I am a..." construction (passive, tells instead of shows)

Add:
- A clear value proposition (what you do for clients, not who you are)
- Two CTAs (primary: see work, secondary: contact)
- Optional: a metric ("4 client sites shipped in 2025-2026")

#### Splash screen

**Current**: 3D laptop model with a quote about curiosity and obsession.

**Proposed**: Remove the 3D splash entirely. It adds 200KB+ of JavaScript, delays content by several seconds, and provides zero conversion value. If the quote is important to the author, display it as a subtle element on the about page.

**Alternative**: If the author wants a dramatic intro, replace the 3D model with a simple CSS animation that takes <1 second:
- Fade in the name
- Slide up the tagline
- Reveal the hero content

This can be done in ~20 lines of CSS, not 200KB of Three.js.

#### About section on index.html

**Current**: 8-node timeline showing personal growth milestones.

**Proposed**: Move the full timeline to `about.html` where it belongs. On the homepage, replace with a 2-3 sentence elevator pitch:

```
Self-taught developer turned client-facing engineer.
I've built production websites for organizations in law, politics,
and professional services — from concept to deployment.
```

Link to the full about page for readers who want the full story.

#### Projects section

**Current**: Standard list of project cards with description + tech stack.

**Proposed**: Reframe as **case studies** with:
- Client name + industry
- The problem they had
- What you built
- 1-2 quantifiable outcomes (page speed score, mobile responsiveness, number of form submissions)
- Before/after screenshots (if available)
- Client quote (if available)

The individual project pages already have detailed case study content (`projects.json` includes `challengesStructured`, `outcomes`, `learnings`). Surface this on the homepage.

#### Add a testimonials section

**Currently**: Does not exist.

**Proposed**: Contact SARKO, RN Inc, McLeod, and King Law Firm for short testimonials. Even one sentence from each client validates the work more than any self-description.

Example structure:
```
"Working with Mosa was seamless. He delivered a professional platform
that perfectly represents our organization's authority and mission."
— [Client Name], SARKO
```

If testimonials aren't available yet, use the `outcomes` data from `projects.json` as proof points.

#### Blog strategy

**Currently**: 1 post with Lorem Ipsum filler.

**Proposed**: Write 3-5 real technical articles about challenges faced in the projects:
- "How I built a hardware-accelerated CSS grid without React" (from SARKO)
- "Building a multi-step legal intake wizard in vanilla JavaScript" (from McLeod)
- "Why I chose vanilla JS over React for client projects" (architectural decision)
- "Exit-intent detection without analytics libraries" (from SARKO)

These topics come directly from the project data — the author has already done the work, they just need to write about it. Technical articles demonstrate expertise far more effectively than listing "JavaScript" in a tech stack.

## Implementation approach

This plan should NOT be executed as a single massive rewrite. Break it into phases:

### Phase 1: Content-only changes (no layout restructure)
- Update hero text to be outcome-focused
- Add a brief about blurb on the homepage
- Move the full timeline to about.html only
- Write 2-3 real blog posts

### Phase 2: Layout changes
- Remove 3D splash screen (or replace with CSS animation)
- Add testimonials section
- Reorder homepage sections for conversion flow
- Add "Built for..." trust strip

### Phase 3: Visual polish
- Case study metrics on project cards
- Before/after screenshots
- Performance score badges
- Mobile-optimized project previews

## Scope

**This plan is advisory only**. It does not contain specific file changes. Each phase should produce its own implementation plan with file-level details.

**In scope** (for the strategic recommendation):
- Homepage narrative structure
- Hero section copy
- About section placement
- Project section framing
- Blog content strategy
- Testimonial section (new)

**Out of scope**:
- Visual redesign (colors, typography, spacing) — that's a separate skill
- Framework migration — the vanilla HTML/CSS/JS stack is intentional
- Mobile-specific layout — address separately

## Evidence grounding

Every recommendation above is grounded in what already exists in the repo:

| Recommendation | Evidence |
|----------------|----------|
| Lead with outcomes | `projects.json` already has `outcomes` arrays for each project |
| Case study framing | `projects.json` already has `challengesStructured` with issue/solution pairs |
| Remove "Self-Taught" framing | The author has shipped 4 client projects — the self-taught label is no longer the headline |
| Blog topics from projects | `projects.json` → `learnings` arrays contain specific technical topics |
| Remove 3D splash | `index.js` imports Three.js + DRACO + GLTF + CSS3DRenderer (200KB+) for a loading screen |
| Timeline belongs on about | `about.html` already exists and is linked from the timeline's final node |

## Success metrics

The portfolio redesign is successful when:

1. A hiring manager can understand what Mosa does and see proof of it within 5 seconds of landing
2. The homepage loads in under 2 seconds (currently delayed by 3D intro)
3. Every project has at least one quantifiable outcome displayed
4. The blog has 3+ real articles demonstrating technical depth
5. The contact form has a clear CTA that explains what happens next
6. At least 2 client testimonials are visible on the homepage
