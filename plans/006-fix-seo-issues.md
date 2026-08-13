# Plan 006: Fix SEO issues — heading hierarchy, og:image, sitemap, meta

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- index.html about.html projects.html sitemap.xml sitemap.html`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: seo
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

Several SEO issues prevent the site from being indexed and shared properly:

1. **`og:image` URL contains unencoded spaces** — social media platforms (LinkedIn, Discord, Twitter) fail to render the preview image when shared.
2. **Sitemap is incomplete** — missing `about.html` and `sitemap.html`, reducing crawl coverage.
3. **`meta description` on index.html has a cache-bust artifact** — the description ends with `?v=1773496943606` which looks unprofessional in search results.
4. **No `<h1>` on projects.html** — heading hierarchy skip (partially covered in Plan 005 for accessibility, documented here for SEO context).

## Current state

### og:image URL with spaces

**File**: `index.html`, line 44:
```html
<meta property="og:image" content="https://mr-sudo.dev/my pictures/dark mode.webp">
```

The URL `my pictures/dark mode.webp` has two spaces. Social media platforms don't encode these automatically. The URL-encoded version would be `my%20pictures/dark%20mode.webp`, but renaming the directory is the better long-term fix (see Plan 010).

**File**: `index.html`, line 51 (Twitter card):
```html
<meta name="twitter:image" content="https://mr-sudo.dev/my pictures/dark mode.webp">
```

**File**: `about.html`, line 76:
```html
<meta property="og:image" content="https://mr-sudo.dev/my pictures/dark mode.webp">
```

### Incomplete sitemap

**File**: `sitemap.xml`

Current URLs in sitemap:
1. `index.html` ✓
2. `posts/multilingual-websites.html` ✓
3. `projects/sarko.html` ✓
4. `projects/rn-inc.html` ✓
5. `projects/mcleod-associates.html` ✓
6. `projects/king-law-firm.html` ✓
7. `projects.html` ✓

**Missing**:
- `about.html` — A major page linked from the main navigation
- `sitemap.html` — The HTML sitemap page itself

### Meta description with cache-bust artifact

**File**: `index.html`, line 27:
```html
<meta name="description" content="Portfolio of Mosa Moleleki, a passionate Self-Taught Front-End Web Developer specializing in modern web applications, beautiful UI/UX, and interactive experiences using HTML, CSS, JavaScript?v=1773496943606.">
```

The `?v=1773496943606` was injected by the build script's cache-busting regex after `JavaScript`. This appears in Google search results.

### Schema.org JSON-LD with spaces in URL

**File**: `index.html`, line 60:
```json
"image": "https://mr-sudo.dev/my pictures/light mode.webp"
```

## Steps

### Step 1: Fix og:image URLs

In `index.html`, line 44, replace:
```html
<meta property="og:image" content="https://mr-sudo.dev/my pictures/dark mode.webp">
```

With URL-encoded version:
```html
<meta property="og:image" content="https://mr-sudo.dev/my%20pictures/dark%20mode.webp">
```

Do the same for:
- `index.html`, line 51 (Twitter image)
- `about.html`, line 76 (og:image)
- `index.html`, line 60 (Schema.org JSON-LD)

**Note**: The long-term fix is to rename `my pictures/` to `images/` (Plan 010). For now, URL-encoding ensures social sharing works.

### Step 2: Fix meta description

In `index.html`, line 27, replace:
```html
<meta name="description" content="Portfolio of Mosa Moleleki, a passionate Self-Taught Front-End Web Developer specializing in modern web applications, beautiful UI/UX, and interactive experiences using HTML, CSS, JavaScript?v=1773496943606.">
```

With a clean, compelling description (also improving copy quality):
```html
<meta name="description" content="Portfolio of Mosa Moleleki — Front-End Web Developer based in Johannesburg, specializing in modern web applications, clean UI, and high-performance interactive experiences with HTML, CSS, and JavaScript.">
```

**Key changes**:
1. Removed `?v=...` cache artifact
2. Removed "Self-Taught" and "passionate" — these are filler words that don't help SEO
3. Added location for local SEO value
4. Changed the sentence structure to be more direct

### Step 3: Add missing pages to sitemap.xml

In `sitemap.xml`, before the closing `</urlset>` tag, add:

```xml
  <url>
    <loc>https://mr-sudo.dev/about.html</loc>
    <lastmod>2026-08-13</lastmod>
  </url>
  <url>
    <loc>https://mr-sudo.dev/sitemap.html</loc>
    <lastmod>2026-08-13</lastmod>
  </url>
```

### Step 4: Fix Schema.org JSON-LD

In `index.html`, line 60, URL-encode the image path:
```json
"image": "https://mr-sudo.dev/my%20pictures/light%20mode.webp"
```

### Step 5: Verify og:title consistency

Check that all `og:title` values match their `<title>` tags. Current check:

| Page | `<title>` | `og:title` | Match? |
|------|-----------|------------|--------|
| index.html | "Mosa Moleleki \| Front-End Web Developer" | "Mosa Moleleki \| Self-Taught Front-End Web Developer" | ❌ No — og:title adds "Self-Taught" |
| about.html | "About Mosa Moleleki \| Front-End Web Developer" | "About Mosa Moleleki \| Front-End Web Developer" | ✓ |

Fix `index.html` og:title (line 42) to match the `<title>`:
```html
<meta property="og:title" content="Mosa Moleleki | Front-End Web Developer">
```

## Scope

**In scope**:
- `index.html` — og:image, twitter:image, meta description, JSON-LD, og:title
- `about.html` — og:image
- `sitemap.xml` — add missing pages

**Out of scope**:
- `robots.txt` — already correct
- Blog/project sub-pages — fix separately if needed
- `sitemap.html` — the HTML sitemap page content (just ensure it's in XML sitemap)

## Verification

| Check | Command / Action | Expected |
|-------|-----------------|----------|
| No spaces in og:image | `grep -n "og:image" index.html about.html` | All URLs use `%20` encoding |
| No cache artifacts in meta | `grep -n "?v=" index.html \| grep -v "src=\|href="` | No results (only src/href should have cache busts) |
| Sitemap complete | Count `<url>` entries in sitemap.xml | 9 entries (7 + about + sitemap) |
| Social sharing works | Use https://developers.facebook.com/tools/debug/ to test | Preview image loads correctly |

## STOP conditions

- If the `og:image` points to a different file than `my pictures/dark mode.webp`, STOP — the image may have been moved.
- If the sitemap template in `templates/sitemap-template.xml` has changed, update both the template and the output.

## Maintenance note

The root cause of the meta description corruption is the build script's cache-busting regex (Plan 007). Until that's fixed, running the build will re-inject `?v=` into the description. Don't run the build script after applying this fix until Plan 007 is also applied.
