# Plan 002: Fix the icon system — resolve Lucide/Font Awesome conflict

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise.
>
> **Drift check (run first)**: `git diff --stat 73e8d33..HEAD -- index.html projects.html about.html 404.html js/theme.js js/index.js`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

The site loads both Font Awesome and Lucide icon libraries but uses them inconsistently. Multiple icons don't render at all because:

1. `data-lucide` attributes contain spaces (e.g., `data-lucide="download nav-icon"`) — Lucide expects a single icon name.
2. Tech stack icons reference Font Awesome names (`html5`, `css3-alt`, `js`, `git-alt`, `node-js`) which don't exist in Lucide.
3. Theme toggle and mute toggle JS try to swap icons using Font Awesome class names on Lucide elements.
4. The sidebar nav mixes both libraries inconsistently — some items use `<i class="fa-regular fa-user">` and others use `<i data-lucide="house">`.

The result: several icons render as invisible empty elements, theme/mute toggles lose their icons after the first click, and the tech carousel shows empty boxes for most technologies.

## Current state

### Issue A: Invalid `data-lucide` attributes with spaces

**File**: `index.html`

Line 104: `<i data-lucide="volume-high"></i>` — This one is actually correct (single name).

Line 117: `<i data-lucide="download nav-icon"></i>` — BROKEN. `nav-icon` is a CSS class, not part of the icon name.

Line 159: `<i data-lucide="house nav-icon"></i>` — BROKEN. Same issue.

Line 177: `<i data-lucide="pen-nib nav-icon"></i>` — BROKEN. Same issue.

Line 196: `<i data-lucide="download nav-icon"></i>` — BROKEN. Duplicate of line 117.

These should be: `<i data-lucide="download" class="nav-icon"></i>`

The same pattern appears in `projects.html` lines 49 and 75.

### Issue B: Non-existent Lucide icon names (Font Awesome names used with Lucide)

**File**: `index.html`, lines 240-245 (tech carousel, Set 1) and lines 260-265 (Set 2, duplicate):

```html
<div class="tech-item tech-html" data-tooltip="HTML5"><i data-lucide="html5"></i></div>
<div class="tech-item tech-css" data-tooltip="CSS3"><i data-lucide="css3-alt"></i></div>
<div class="tech-item tech-js" data-tooltip="JavaScript"><i data-lucide="js"></i></div>
<div class="tech-item tech-git" data-tooltip="Git"><i data-lucide="git-alt"></i></div>
<div class="tech-item tech-github" data-tooltip="GitHub"><i data-lucide="github"></i></div>
<div class="tech-item tech-nodejs" data-tooltip="Node.js"><i data-lucide="node-js"></i></div>
```

`html5`, `css3-alt`, `js`, `git-alt`, `node-js` are Font Awesome icon names. Lucide uses different names:
- `html5` → does not exist in Lucide (use inline SVG or Font Awesome)
- `css3-alt` → does not exist in Lucide
- `js` → does not exist in Lucide
- `git-alt` → `git-branch` or `git-merge` in Lucide
- `github` → `github` exists in Lucide ✓
- `node-js` → does not exist in Lucide

Since most tech brand icons don't exist in Lucide (Lucide is a general-purpose icon library, not a brand icon library), the tech carousel should use inline SVGs for brand logos (HTML5, CSS3, JS, Git, Node.js) — which the project already does for Cloudflare, Vercel, GitHub Actions, and Prettier.

### Issue C: Mixed icon libraries in sidebar navigation

**File**: `index.html`, lines 155-187:

```html
<a href="#home" class="nav-link">
    <i data-lucide="house nav-icon"></i>  <!-- Lucide (broken - has space) -->
    <span class="nav-text">Home</span>
</a>
...
<a href="#about" class="nav-link">
    <i class="fa-regular fa-user nav-icon"></i>  <!-- Font Awesome -->
    <span class="nav-text">About</span>
</a>
...
<a href="#projects" class="nav-link">
    <i class="fa-regular fa-folder nav-icon"></i>  <!-- Font Awesome -->
    <span class="nav-text">Projects</span>
</a>
...
<a href="#blog" class="nav-link">
    <i data-lucide="pen-nib nav-icon"></i>  <!-- Lucide (broken) -->
    <span class="nav-text">Articles</span>
</a>
...
<a href="#contact" class="nav-link">
    <i class="fa-regular fa-envelope nav-icon"></i>  <!-- Font Awesome -->
    <span class="nav-text">Contact</span>
</a>
```

Three nav items use Font Awesome, two use Lucide (with broken syntax). Pick one library and standardize.

### Issue D: Search icon in projects.html uses Font Awesome name with Lucide

**File**: `projects.html`, line 75:
```html
<i data-lucide="magnifying-glass search-icon"></i>
```

`magnifying-glass` is the Font Awesome name. Lucide uses `search`. Also has the space issue (`search-icon` should be a class).

**File**: `projects.html`, line 87:
```html
<i data-lucide="circle-xmark"></i>
```

`circle-xmark` is Font Awesome. Lucide uses `x-circle`.

## Steps

### Step 1: Fix all `data-lucide` attributes with spaces

Replace every `data-lucide="icon-name nav-icon"` with `data-lucide="icon-name" class="nav-icon"`.

**All instances** (search with `grep -rn 'data-lucide="[^"]*\s' *.html projects/*.html`):

| File | Line | Current | Fixed |
|------|------|---------|-------|
| index.html | 117 | `data-lucide="download nav-icon"` | `data-lucide="download" class="nav-icon"` |
| index.html | 159 | `data-lucide="house nav-icon"` | `data-lucide="house" class="nav-icon"` |
| index.html | 177 | `data-lucide="pen-nib nav-icon"` | `data-lucide="pen-tool" class="nav-icon"` |
| index.html | 196 | `data-lucide="download nav-icon"` | `data-lucide="download" class="nav-icon"` |
| projects.html | 49 | `data-lucide="download nav-icon"` | `data-lucide="download" class="nav-icon"` |
| projects.html | 75 | `data-lucide="magnifying-glass search-icon"` | `data-lucide="search" class="search-icon"` |

**Note**: `pen-nib` doesn't exist in Lucide — use `pen-tool` instead. `magnifying-glass` doesn't exist — use `search`.

### Step 2: Fix Font Awesome icon names used with Lucide

For `projects.html` line 87, replace `data-lucide="circle-xmark"` with `data-lucide="x-circle"`.

### Step 3: Standardize sidebar navigation to Lucide

Replace the Font Awesome icons in the sidebar with their Lucide equivalents:

| Font Awesome | Lucide Equivalent |
|-------------|-------------------|
| `fa-regular fa-user` | `data-lucide="user"` |
| `fa-regular fa-folder` | `data-lucide="folder"` |
| `fa-regular fa-envelope` | `data-lucide="mail"` |

In `index.html`, lines 165, 171, 183, replace:

```html
<i class="fa-regular fa-user nav-icon"></i>
```
With:
```html
<i data-lucide="user" class="nav-icon"></i>
```

```html
<i class="fa-regular fa-folder nav-icon"></i>
```
With:
```html
<i data-lucide="folder" class="nav-icon"></i>
```

```html
<i class="fa-regular fa-envelope nav-icon"></i>
```
With:
```html
<i data-lucide="mail" class="nav-icon"></i>
```

### Step 4: Replace non-existent Lucide tech brand icons with inline SVGs

For `html5`, `css3-alt`, `js`, `git-alt`, and `node-js` in the tech carousel (index.html lines 240-245 and 260-265), replace the broken `<i data-lucide="...">` elements with proper inline SVGs. The project already uses this pattern for Cloudflare, Vercel, etc.

Use these standard brand SVGs (same `viewBox`, `fill="currentColor"`, `width="1em"`, `height="1em"` pattern the project already uses):

**HTML5**:
```html
<svg viewBox="0 0 384 512" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 32l34.9 395.8L191.5 480l157.6-52.2L384 32H0zm308.2 127.9H124.4l4.1 49.4h175.6l-13.6 148.4-97.9 27v.3h-1.1l-98.7-27.3-6.5-73.2h48.8l3.2 38.3 52.6 13.3 54.7-15.4 3.7-61.6-166.3-.5v-.1l-.2.1-3.6-46.3L193.1 162l6.5-2.7H76.7L63.5 112.8h256.4l-11.7 47.1z"/></svg>
```

**CSS3**:
```html
<svg viewBox="0 0 384 512" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 32l34.9 395.8L192 480l157.1-52.2L384 32H0zm313.1 80l-4.8 47.3L193 208.6l-.3.1h111.5l-12.8 146.6-98.2 28.7-98.8-29.2-6.4-73.9h48.9l3.2 38.3 52.6 13.3 54.7-15.4 3.7-61.6-166.3-.5v-.1l-.2.1-3.6-46.3L193.1 162l6.5-2.7H76.7L63.5 112.8h256.4l-6.8 47.2v-48z"/></svg>
```

**JavaScript**:
```html
<svg viewBox="0 0 448 512" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM243.8 381.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V237.7h42.1v143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43l34.3-19.8c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.7 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z"/></svg>
```

**Git**:
```html
<svg viewBox="0 0 448 512" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M439.55 236.05L244.8 41.3a24.07 24.07 0 00-34.05 0L166.4 85.65l43 43a28.55 28.55 0 0136.22 36.37l41.45 41.45a28.59 28.59 0 11-17.12 16.4l-38.7-38.7v101.83a28.59 28.59 0 11-23.5-.2V180.83a28.58 28.58 0 01-15.52-37.52l-42.35-42.35-111 111a24.07 24.07 0 000 34.05L202.4 470.7a24.07 24.07 0 0034.05 0l203.1-200.6a24.07 24.07 0 000-34.05z"/></svg>
```

**Node.js**:
```html
<svg viewBox="0 0 448 512" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 508c-6.7 0-13.5-1.8-19.4-5.2l-61.7-36.5c-9.2-5.2-4.7-7-1.7-8 12.3-4.3 14.8-5.2 27.9-12.7 1.4-.8 3.2-.5 4.6.4l47.4 28.1c1.7 1 4.1 1 5.7 0l184.7-106.6c1.7-1 2.8-3 2.8-5V149.3c0-2.1-1.1-4-2.9-5.1L226.8 37.7c-1.7-1-4-1-5.7 0L36.6 144.3c-1.8 1-2.9 3-2.9 5.1v213.1c0 2 1.1 4 2.9 4.9l50.6 29.2c27.5 13.7 44.3-2.4 44.3-18.7V167.5c0-3 2.4-5.3 5.4-5.3h23.4c2.9 0 5.4 2.3 5.4 5.3V378c0 36.6-20 57.6-54.7 57.6-10.7 0-19.1 0-42.5-11.6l-48.4-27.9C8.1 389.2.7 376.3.7 362.4V149.3c0-13.8 7.4-26.8 19.4-33.7L204.6 9c11.7-6.6 27.2-6.6 38.8 0l184.7 106.7c12 6.9 19.4 19.8 19.4 33.7v213.1c0 13.8-7.4 26.8-19.4 33.7L243.4 502.8c-5.9 3.4-12.6 5.2-19.4 5.2z"/></svg>
```

Replace both Set 1 (lines 240-245) and Set 2 (lines 260-265) with the same SVGs.

### Step 5: Pin Lucide version

In `index.html` line 96, `about.html` line 91, `projects.html` line 20, and any other HTML file loading Lucide, replace:

```html
<script src="https://unpkg.com/lucide@latest"></script>
```

With a specific pinned version (check https://www.npmjs.com/package/lucide for current stable):

```html
<script src="https://unpkg.com/lucide@0.460.0"></script>
```

## Scope

**In scope**:
- `index.html`
- `projects.html`
- `about.html`
- `404.html`
- Any other HTML file in root or `projects/` that loads icons

**Out of scope**:
- `js/theme.js` and `js/index.js` — The JS icon swap logic is covered in Plan 003
- `css/font-awesome.min.css` — Don't remove it yet until all FA icons are migrated
- Template files in `templates/` — These generate sub-pages; update them to match

## STOP conditions

- If Lucide has been upgraded or replaced since `73e8d33`, STOP and report.
- If the nav structure has changed significantly, STOP and report.

## Test plan

After all fixes:
1. Every sidebar nav icon should be visible in both light and dark modes
2. Every tech carousel icon should be visible (HTML5, CSS3, JS, Git, GitHub, Node.js, Cloudflare, Vercel, GitHub Actions, Prettier)
3. The search icon on projects.html should render
4. The clear search button icon should render
5. The download icon on the CV link should render
6. No console errors related to Lucide initialization

## Maintenance note

After this plan, the site should use Lucide as the primary icon library. Font Awesome is still loaded (`css/font-awesome.min.css`) — evaluate whether it can be removed entirely after Plan 003 confirms all icon references are Lucide-based. Removing FA saves ~94KB of CSS.
