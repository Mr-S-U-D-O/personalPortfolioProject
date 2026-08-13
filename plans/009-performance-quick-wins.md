# Plan 009: Performance quick wins — consistent CSS, pinned dependencies, duplicate removal

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- about.html 404.html index.html projects.html`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 002 (icon migration must be complete before removing FA), 007 (build script fix)
- **Category**: performance
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

Several easily fixable issues add unnecessary weight and latency:

1. **about.html loads unminified CSS** (47KB) while index.html loads the minified version (smaller). This means the about page loads significantly slower.
2. **404.html loads Google Fonts for Inter** via a separate `<link>`, but Inter is already imported via `@import` in `style.css`. This causes a duplicate font request.
3. **Font Awesome CSS (94KB)** is loaded but after Plan 002, all icons use Lucide. The FA stylesheet can be removed.
4. **CSS uses `@import` for sub-stylesheets** — each `@import` is a blocking request. The build script should concatenate them.

Combined, these quick wins can reduce page weight by ~150KB+ and eliminate 2-3 blocking network requests.

## Current state

### Unminified CSS on about.html

**File**: `about.html`, line 80:
```html
<link rel="stylesheet" href="css/style.css" />
```

Compare with `index.html`, line 77:
```html
<link rel="stylesheet" href="css/min/style.min.css?v=1773703218328">
```

`css/style.css` is 47,461 bytes. `css/min/style.min.css` is the minified equivalent (presumably ~35-40KB or less).

### Duplicate Google Fonts on 404.html

**File**: `404.html`, lines 40-45:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
```

**File**: `css/style.css`, line 4:
```css
@import url(https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap);
```

The 404 page also loads `css/style.css` (line 48), which already imports the fonts. The `<link>` tags are redundant.

### Font Awesome CSS still loaded (94KB)

**File**: `index.html`, line 78:
```html
<link rel="stylesheet" href="css/font-awesome.min.css?v=1773556329307">
```

**File**: `projects.html`, line 16:
```html
<link rel="stylesheet" href="css/font-awesome.min.css?v=1785989917706">
```

After Plan 002 migrates all icons to Lucide, this 94KB stylesheet serves no purpose.

### CSS @import chain creates blocking requests

**File**: `css/style.css`, lines 5-9:
```css
@import url("footer.css");
@import url("blog-grid.css");
@import url("blog-post-v2.css");
@import url("about.css");
@import url("project.css");
```

Each `@import` is a separate blocking HTTP request. Modern best practice is to concatenate CSS files in the build step.

## Steps

### Step 1: Use minified CSS on about.html

In `about.html`, line 80, replace:
```html
<link rel="stylesheet" href="css/style.css" />
```

With:
```html
<link rel="stylesheet" href="css/min/style.min.css" />
```

Add cache-busting parameter if desired (or let the build script handle it after Plan 007).

### Step 2: Remove duplicate Google Fonts from 404.html

In `404.html`, delete lines 39-45:
```html
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap"
    rel="stylesheet"
/>
```

The fonts are already loaded via `css/style.css` which is included on line 48.

**Note**: The `<link rel="preconnect">` hints are actually useful — they tell the browser to start the DNS/TCP connection early. But since they're already triggered by the `@import` in CSS, they provide negligible benefit on a page with only one stylesheet.

### Step 3: Remove Font Awesome CSS (ONLY after Plan 002 is complete)

**Prerequisite**: All icons must be migrated to Lucide (Plan 002). Verify by:
```bash
grep -rn "fa-\|fa " *.html projects/*.html
```

If no Font Awesome classes remain, remove the `<link>` tags:

**index.html**, line 78 — delete:
```html
<link rel="stylesheet" href="css/font-awesome.min.css?v=1773556329307">
```

**projects.html**, line 16 — delete:
```html
<link rel="stylesheet" href="css/font-awesome.min.css?v=1785989917706">
```

Check all other HTML files for Font Awesome stylesheet includes and remove them.

**Savings**: ~94KB of CSS per page load.

### Step 4: Recommend CSS concatenation in build script (documentation only)

This is a recommendation for the build script, not a change to make now:

The build script should concatenate all CSS `@import` files into a single stylesheet:
```
style.css + footer.css + blog-grid.css + blog-post-v2.css + about.css + project.css
→ style.min.css (single file)
```

Document this as a TODO in `scripts/build.js`:
```javascript
// TODO: Concatenate @import CSS files into style.css before minification
// to eliminate blocking @import requests. Currently: 5 @imports = 5 requests.
```

### Step 5: Add smooth scroll to CSS

In `css/style.css`, after the base reset:
```css
html {
    scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }
}
```

The reduced-motion override is important (may already be added by Plan 005 — check for duplication).

## Scope

**In scope**:
- `about.html` — switch to minified CSS
- `404.html` — remove duplicate font loads
- `index.html` — remove FA stylesheet (after Plan 002)
- `projects.html` — remove FA stylesheet (after Plan 002)
- `css/style.css` — add smooth scroll

**Out of scope**:
- CSS concatenation build step — documented as recommendation only
- Image optimization — separate task
- Three.js bundle optimization — separate task (Plan 011)

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| about.html uses minified CSS | `grep "style.min.css" about.html` | Match found |
| No duplicate fonts on 404 | `grep "fonts.googleapis" 404.html` | No results |
| No FA stylesheet | `grep "font-awesome" index.html projects.html` | No results (after Plan 002) |
| Smooth scroll works | Open site, click nav link | Smooth animated scroll |
| Page loads | Open each page in browser | All styles applied correctly |

## STOP conditions

- **Do NOT remove Font Awesome CSS** until Plan 002 is fully complete and verified. If any FA icons remain in the HTML, removing the stylesheet will break them.
- If `about.html` loads additional page-specific CSS not included in `style.min.css`, the minified version may not contain those styles. Verify by comparing the rendered page.

## Impact estimate

| Change | Before | After | Savings |
|--------|--------|-------|---------|
| about.html CSS | 47KB (unminified) | ~30KB (minified) | ~17KB |
| 404.html fonts | 2 font requests | 1 font request | 1 request |
| FA CSS removal | 94KB per page | 0KB | 94KB |
| **Total per-page** | | | **~111KB + 1 request** |
