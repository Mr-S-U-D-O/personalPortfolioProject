# Plan 005: Fix accessibility foundations — WCAG compliance baseline

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- index.html about.html projects.html 404.html css/style.css`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: accessibility
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

The site currently has zero ARIA landmarks, zero skip links, zero `aria-live` regions, no `prefers-reduced-motion` support, and no focus management for modals. This means:

1. **Screen reader users** cannot navigate the page structure at all — they get a flat stream of content with no section labels.
2. **Keyboard-only users** cannot skip past the sidebar navigation to reach main content (WCAG 2.4.1 bypass blocks).
3. **Motion-sensitive users** cannot disable the animations, 3D intro, and scrolling effects (WCAG 2.3.3).
4. **Modal interactions** (contact form, project modal) trap no focus and have no screen reader announcements.

These are not optional nice-to-haves. They are WCAG 2.1 Level A and AA requirements.

## Current state

### No skip-to-content link
```bash
grep -rn "skip" *.html
```
Returns nothing. Every page lacks this.

### No ARIA landmarks or roles
```bash
grep -rn "role=" *.html
```
Returns nothing. The sidebar `<nav>` elements lack `aria-label` attributes (there are multiple `<nav>` elements, so screen readers can't distinguish them).

### No aria-live regions
```bash
grep -rn "aria-live" *.html
```
Returns nothing. Form submission results are not announced.

### No prefers-reduced-motion
```bash
grep -rn "prefers-reduced-motion" css/*.css
```
Returns nothing. The site has extensive animations (splash screen, timeline fill, tech carousel, hover effects, transitions on nearly every element).

### Modal focus management
The contact modal (`#contactModal`) and project modal (`#projectModal`) open/close but don't trap focus inside them, don't return focus to the trigger when closed, and don't set `aria-modal="true"`.

### Heading hierarchy issues
- `projects.html` — No `<h1>`, starts at `<h2>`
- `404.html` — Needs verification
- `index.html` — Has an `<h1>` in the hero ("Mosa Moleleki") ✓

## Steps

### Step 1: Add skip-to-content link to all pages

Add immediately after the opening `<body>` tag on every page:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

And add `id="main-content"` to the main content area:
- `index.html`: Add to the `<main class="hero-section" id="heroSection">` — change to `<main class="hero-section" id="main-content">`
  - Note: This requires updating any JS references to `#heroSection`. Alternatively, add a separate `id="main-content"` to the first section after the splash screen, or use `tabindex="-1"` on a wrapping div.
  - **Safest approach**: Keep `id="heroSection"` and add a separate anchor: `<div id="main-content" tabindex="-1"></div>` just before the hero section.
- `about.html`: Add to the first content section.
- `projects.html`: Add to `<section class="gallery-section">`.
- `404.html`: Add to the main container.

### Step 2: Add skip-link CSS

In `css/style.css`, add near the top (after the base reset):

```css
/* =============================================
   ACCESSIBILITY: Skip Link
   ============================================= */
.skip-link {
    position: absolute;
    top: -100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent-primary);
    color: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 0 0 8px 8px;
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 100000;
    text-decoration: none;
    transition: top 0.2s ease;
}
.skip-link:focus {
    top: 0;
}
```

### Step 3: Add ARIA landmarks and labels to navigation elements

In `index.html`:

```html
<!-- Sidebar Navigation — add aria-label -->
<nav class="sidebar-nav" aria-label="Main Navigation">
    ...
</nav>

<!-- CV Download Navigation — add aria-label -->
<nav class="sidebar-nav cv-nav" aria-label="Resume Download">
    ...
</nav>
```

The footer already has `aria-label="Footer Navigation"` on one nav ✓, but the second footer nav at line 715 has `aria-label="Secondary Navigation"` which is vague — change to `aria-label="Resources"`.

### Step 4: Add ARIA attributes to modals

#### Contact Modal (`index.html`, around line 769):

Change:
```html
<div class="project-modal" id="contactModal">
```

To:
```html
<div class="project-modal" id="contactModal" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle" aria-hidden="true">
```

And add `id="contactModalTitle"` to the modal's title:
```html
<h2 class="contact-modal-title" id="contactModalTitle">Let's Have a Chat</h2>
```

#### Project Modal (`index.html`, around line 822):

Change:
```html
<div class="project-modal" id="projectModal">
```

To:
```html
<div class="project-modal" id="projectModal" role="dialog" aria-modal="true" aria-labelledby="projectModalTitle" aria-hidden="true">
```

And add `id="projectModalTitle"` to the modal's title:
```html
<h2 class="modal-title" id="projectModalTitle">Project Title</h2>
```

### Step 5: Add form error announcement region

In `index.html`, inside the contact form (after the submit button, around line 813):

```html
<div id="formStatus" role="status" aria-live="polite" class="form-status-message"></div>
```

This region will be populated by JavaScript when the form submits or encounters validation errors.

### Step 6: Add `prefers-reduced-motion` to CSS

In `css/style.css`, add at the very end:

```css
/* =============================================
   ACCESSIBILITY: Reduced Motion
   ============================================= */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }

    .splash-screen {
        display: none !important;
    }

    .tech-track {
        animation: none !important;
    }

    .st-fill {
        transition: none !important;
    }
}
```

This immediately stops all animations for users who prefer reduced motion. The splash screen is hidden entirely (it's a 3D animation intro that would just flash).

### Step 7: Fix heading hierarchy

#### `projects.html`:
The page uses `<h2>` as the highest heading. Change the main title to `<h1>`:

```html
<!-- Change from -->
<h2 class="projects-title">
    <span class="projects-main-text">Project Gallery</span>
    <span class="projects-ghost-text">Showcase</span>
</h2>

<!-- Change to -->
<h1 class="projects-title">
    <span class="projects-main-text">Project Gallery</span>
    <span class="projects-ghost-text">Showcase</span>
</h1>
```

Update the CSS selector `.projects-title` if it targets `h2` specifically. Check `css/style.css` and `css/project.css`.

#### `404.html`:
Verify there's an `<h1>`. If the "404" text is in a `<div>` or `<span>`, wrap it in `<h1>`.

### Step 8: Add `lang` attribute to sub-pages that might be missing it

Verify all HTML files have `<html lang="en">`. Quick check:
```bash
grep -rn "<html" *.html projects/*.html
```

All should have `lang="en"`.

## Scope

**In scope**:
- `index.html` — skip link, ARIA landmarks, modal attributes, form status region
- `about.html` — skip link, ARIA landmarks
- `projects.html` — skip link, heading hierarchy
- `404.html` — skip link, heading hierarchy
- `css/style.css` — skip link styles, reduced motion media query

**Out of scope**:
- Focus trapping JS for modals — this requires JS changes in the obfuscated `index.js` and is a larger task
- Color contrast audit — would need browser testing tools
- Blog post pages — fix separately
- Screen reader testing — would need NVDA/VoiceOver

## Verification

| Check | Action | Expected |
|-------|--------|----------|
| Skip link appears on Tab | Open site, press Tab once | "Skip to main content" link appears at top |
| Skip link works | Press Enter on skip link | Focus moves to main content area |
| Modal has ARIA attrs | Inspect `#contactModal` | `role="dialog"`, `aria-modal="true"`, `aria-hidden="true"` |
| Reduced motion | Set OS preference to "reduce motion", reload | No animations play, splash screen hidden |
| Heading hierarchy | Run a heading outline tool (browser extension) | Each page has exactly one `<h1>`, followed by `<h2>`, etc. |

## STOP conditions

- If the HTML structure has changed significantly since `73e8d33`, STOP and verify the DOM targets still exist.
- If there's a CSS framework or component library that wasn't present before, STOP — it may have its own accessibility patterns.

## Maintenance note

This plan addresses the structural accessibility foundation. A comprehensive accessibility audit would additionally require:
- Color contrast verification (WCAG 1.4.3)
- Focus visible indicators on all interactive elements (WCAG 2.4.7)
- Touch target sizing for mobile (WCAG 2.5.8)
- Error identification and description for forms (WCAG 3.3.1, 3.3.3)
- Text alternatives for the 3D model and any decorative images
