# Plan 010: Code cleanup and hygiene — duplicate IDs, z-index scale, directory naming

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- index.html css/style.css`

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (directory rename affects all paths)
- **Depends on**: 001 (broken links must be fixed first), 002 (icon system must be settled)
- **Category**: tech-debt / dx
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

These are code quality issues that don't break functionality directly but create maintenance debt and look unprofessional in source review:

1. **Duplicate `id="resumeLink"`** on index.html — two elements share the same ID, violating HTML spec and breaking `getElementById` behavior.
2. **z-index values scattered from 9999 to 99999** with no system — makes stacking context debugging difficult.
3. **Typo directory name `asserts/`** should be `assets/`.
4. **Spaces in directory names** (`my pictures/`, `audio sounds/`) cause URL encoding issues.

## Current state

### Duplicate IDs

**File**: `index.html`

Lines 115 and 194 both have `id="resumeLink"`:
```html
<!-- Line 115 (persistent CV nav before splash) -->
<a href="./cv/mosa_moleleki_cv.pdf" download="Mosa_Moleleki_CV.pdf" target="_blank" class="nav-link cv-link" id="resumeLink">

<!-- Line 194 (CV nav inside globalUi) -->
<a href="./cv/mosa_moleleki_cv.pdf" download="Mosa_Moleleki_CV.pdf" target="_blank" class="nav-link cv-link" id="resumeLink">
```

The first one (line 112-121) appears to be a "persistent" copy outside the `#globalUi` wrapper. Both render at the same time. One should be removed or given a different ID.

### z-index chaos

Current z-index usage across `css/style.css`:
- Line 74: `.splash-screen { z-index: 9999; }`
- Line 244: `.utility-toggles { z-index: 9999; }`
- Line 266: `.sidebar-nav { z-index: 9999; }`
- Line 516: `.project-modal { z-index: 99999; }`
- Line 2122: `.global-tooltip { z-index: 9999; }`

And in `css/blog-post-v2.css`:
- Line 567: `.post-progress-container { z-index: 9999; }`

**Problem**: When everything is 9999, nothing is 9999. The modal at 99999 is the only one that properly layers above others.

### Directory naming

- `asserts/` — should be `assets/` (typo)
- `my pictures/` — should be `images/` (spaces cause URL issues)
- `audio sounds/` — should be `audio/` (spaces cause URL issues)

## Steps

### Step 1: Remove duplicate CV nav element

In `index.html`, the first CV nav block (lines 112-121) exists outside the `#globalUi` wrapper and appears to be a duplicate. The one inside `#globalUi` (lines 191-200) is the intended one that participates in the global UI show/hide logic.

**Remove lines 111-121**:
```html
<!-- Persistent CV Download -->
<nav class="sidebar-nav cv-nav">
    <ul class="nav-menu">
        <li class="nav-item">
            <a href="./cv/mosa_moleleki_cv.pdf" download="Mosa_Moleleki_CV.pdf" target="_blank" class="nav-link cv-link" id="resumeLink">
                <span class="nav-text">Resume</span>
                <i data-lucide="download nav-icon"></i>
            </a>
        </li>
    </ul>
</nav>
```

**Verification**: `grep -c 'id="resumeLink"' index.html` should return `1`.

### Step 2: Implement a z-index scale

Create a comment block at the top of `css/style.css` defining a z-index scale, then update all values:

```css
/* ==========================================================================
   Z-INDEX SCALE
   ==========================================================================
   --z-base:       1     (default stacking)
   --z-nav:        100   (sidebar nav, utility toggles)
   --z-tooltip:    200   (floating tooltip)
   --z-splash:     500   (splash screen overlay)
   --z-modal:      1000  (modals, overlays)
   --z-skip:       2000  (skip-to-content link — always on top)
   ========================================================================== */
```

Then update the CSS rules:

| Current | New | Element |
|---------|-----|---------|
| `z-index: 9999` | `z-index: 500` | `.splash-screen` |
| `z-index: 9999` | `z-index: 100` | `.utility-toggles` |
| `z-index: 9999` | `z-index: 100` | `.sidebar-nav` |
| `z-index: 99999` | `z-index: 1000` | `.project-modal` |
| `z-index: 9999` | `z-index: 200` | `.global-tooltip` |
| `z-index: 9999` | `z-index: 200` | `.post-progress-container` |

### Step 3: Rename `asserts/` to `assets/` (HIGH RISK — affects all pages)

This change touches every file that references favicons. Use a find-and-replace across all HTML files:

```bash
# Find all references
grep -rn "asserts/" *.html projects/*.html posts/*.html templates/*.html
```

Replace `asserts/` with `assets/` in all results.

Then rename the directory:
```bash
git mv asserts/ assets/
```

**Files that will need updating** (at minimum):
- `index.html` — lines 18-22 (favicon links)
- `about.html` — lines 26, 33, 38, 44, 46
- `404.html` — lines 19, 26, 31, 36
- `projects.html` — favicon links
- `js/theme.js` — line 39 (`"asserts/"`)
- All project sub-pages
- All post sub-pages
- `templates/footer-template.html`

**Note**: This is the highest-risk step. Every favicon path on every page must be updated. Consider doing this as a separate commit.

### Step 4: Rename `my pictures/` to `images/` (HIGH RISK)

```bash
git mv "my pictures/" images/
```

Update all references:
```bash
grep -rn "my pictures" *.html *.md data/*.json
```

**Known references**:
- `index.html` — og:image (line 44), twitter:image (line 51), Schema.org (line 60)
- `about.html` — og:image (line 76)
- `README.md` — line 2
- `data/blog.json` — line 4 (blog post image)

Replace `my pictures/` with `images/` in all occurrences.

### Step 5: Rename `audio sounds/` to `audio/`

```bash
git mv "audio sounds/" audio/
```

Update references in `js/index.js`:
```bash
grep -n "audio sounds" js/index.js
```

Lines 70-73 reference:
- `./audio sounds/startup sound.mp3`
- `./audio sounds/initial quote appearance sound.mp3`
- `./audio sounds/menu open.mp3`
- `./audio sounds/button hover.mp3`

Replace with:
- `./audio/startup-sound.mp3`
- `./audio/initial-quote-appearance-sound.mp3`
- `./audio/menu-open.mp3`
- `./audio/button-hover.mp3`

Also rename the individual audio files to remove spaces:
```bash
cd "audio sounds/"
# Rename files to use hyphens instead of spaces
```

**Note**: Since `index.js` is obfuscated/minified, the string literals are still readable. Update the source, then rebuild the minified version.

### Step 6: Remove duplicate footer comment

In `index.html`, lines 678-683, the comment "Site Footer (Unified Redesign)" appears twice:

```html
<!-- ========================================= -->
<!-- Site Footer (Unified Redesign)            -->
<!-- ========================================= -->
<!-- ========================================= -->
<!-- Site Footer (Unified Redesign)            -->
<!-- ========================================= -->
```

Remove one of the duplicate comment blocks.

## Scope

**In scope**:
- `index.html` — duplicate IDs, duplicate comments
- `css/style.css` — z-index scale
- `css/blog-post-v2.css` — z-index update
- Directory renames: `asserts/` → `assets/`, `my pictures/` → `images/`, `audio sounds/` → `audio/`
- All files referencing the renamed directories

**Out of scope**:
- The `cv/` directory — leave as is (professional naming)
- The `models/` directory — leave as is
- The `data/` directory — leave as is
- Refactoring the obfuscated `index.js` — that's a larger task

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| No duplicate IDs | `grep -c 'id="resumeLink"' index.html` | 1 |
| No 9999 z-index | `grep -rn "9999" css/style.css css/blog-post-v2.css` | No results |
| asserts dir gone | `ls asserts/` | Directory not found |
| assets dir exists | `ls assets/` | Directory exists with favicon subdirs |
| No old dir refs | `grep -rn "asserts/\|my pictures/\|audio sounds/" *.html *.js js/*.js data/*.json` | No results |
| Favicons load | Open site in browser, check favicon | Favicon visible in tab |

## STOP conditions

- If other developers or deployment scripts reference the old directory names, STOP and coordinate the rename.
- If `git mv` fails because of untracked files in the directories, stage everything first.
- If the site is deployed via a CI/CD pipeline that references specific paths, verify the pipeline configuration before renaming.

## Risk assessment

Steps 3-5 (directory renames) are the highest-risk changes in this entire audit. They touch every page and can break the site if any reference is missed. Recommended approach:

1. Do each rename as a separate git commit
2. After each rename, run `grep -rn "OLD_NAME" .` to verify no references remain
3. Test the site locally after each rename
4. Consider doing renames in a separate branch and testing thoroughly before merging
