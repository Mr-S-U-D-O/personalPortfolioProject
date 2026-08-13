# Plan 004: Fix hero profile image — replace stock photo with real profile

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- index.html "my pictures/"`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: content / UX
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

The hero section's profile image is currently a random Unsplash stock photo of a stranger. This is the first thing a visitor sees. For a personal portfolio that exists to get the author hired, showing someone else's face is an immediate credibility destroyer.

The site already has profile photos in the `my pictures/` directory (`dark mode.webp`, `light mode.webp`), and the Schema.org JSON-LD references them. But the actual `<img>` element in the hero uses an external Unsplash URL.

## Current state

**File**: `index.html`, line 218

```html
<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop" alt="Profile Image" class="hero-profile-img" fetchpriority="high">
```

The existing profile photos:
- `my pictures/dark mode.webp` — used in Schema.org JSON-LD (line 60) and README
- `my pictures/light mode.webp` — referenced but existence should be verified

## Steps

### Step 1: Verify the local profile images exist

```bash
ls "my pictures/"
```

Expected: `dark mode.webp` and `light mode.webp` should exist.

### Step 2: Replace the Unsplash URL with the local profile image

In `index.html`, line 218, replace:

```html
<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop" alt="Profile Image" class="hero-profile-img" fetchpriority="high">
```

With:

```html
<img src="my pictures/dark mode.webp" alt="Mosa Moleleki — Front-End Web Developer" class="hero-profile-img" fetchpriority="high" data-light="my pictures/light mode.webp" data-dark="my pictures/dark mode.webp">
```

**Key changes**:
1. `src` → local file (defaults to dark mode image since the site defaults to dark theme)
2. `alt` → descriptive text with the author's name, not generic "Profile Image"
3. `data-light` and `data-dark` attributes → enables the existing `ThemeSystem.updateThemeAwareImages()` function to swap the image when themes change (this function already exists in `theme.js` lines 64-75)

### Step 3: Fix the alt text everywhere else

While we're at it, search for other images with generic alt text and update them:

```bash
grep -rn 'alt="Profile' *.html
```

All profile images should use `alt="Mosa Moleleki — Front-End Web Developer"` or similar descriptive text.

## Scope

**In scope**:
- `index.html` — hero profile image

**Out of scope**:
- The profile images themselves (don't optimize or resize them here)
- The `my pictures/` directory name (renaming it is covered in Plan 010)
- About page profile images (fix separately if needed)

## Verification

1. Open `index.html` in browser — the hero shows a real photo of Mosa, not a stock photo
2. Toggle theme — the photo swaps between `light mode.webp` and `dark mode.webp`
3. `grep -n "unsplash" index.html` returns no results
4. The image loads without 404 errors in the network tab

## STOP conditions

- If `my pictures/` directory doesn't contain the expected `.webp` files, STOP — the author needs to provide a real profile photo.
- If the hero section structure has changed significantly, STOP and report.

## Note on directory naming

The `my pictures/` directory contains spaces which causes URL encoding issues (see finding #32 in the master audit). This is tracked for Plan 010. For now, use the existing path.
