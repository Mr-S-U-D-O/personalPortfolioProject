# Plan 007: Fix build script cache-busting regex

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- scripts/build.js`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: bug / dx
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

The build script (`scripts/build.js`) applies cache-busting version strings to `.js` and `.css` file references. However, the regex is too greedy — it matches `.js` and `.css` anywhere in the HTML content, not just in `src` and `href` attributes. This causes three classes of corruption:

1. **CDN URLs broken**: `cdn.jsdelivr.net` becomes `cdn.js?v=TIMESTAMPdelivr.net` (line 88 of index.html)
2. **Tooltip text corrupted**: `Node.js` becomes `Node.min.js?v=TIMESTAMP` (line 245 of index.html)
3. **Meta description corrupted**: `JavaScript` in the description becomes `JavaScript?v=TIMESTAMP` (line 27 of index.html)

Every time the build runs, it re-introduces these bugs. This plan fixes the regex so it only matches file references in `src=` and `href=` attributes.

## Current state

**File**: `scripts/build.js` — 37,781 bytes

The specific regex and cache-busting logic needs to be identified. Search for patterns like:

```bash
grep -n "\.js" scripts/build.js | head -20
grep -n "cache\|version\|bust\|timestamp\|\.replace" scripts/build.js | head -20
```

The build script likely does something like:
```javascript
html = html.replace(/\.js/g, `.js?v=${timestamp}`);
html = html.replace(/\.css/g, `.css?v=${timestamp}`);
```

Or it may use a more targeted but still imperfect pattern.

## Steps

### Step 1: Read the build script and identify the cache-busting logic

```bash
grep -n -A5 "replace.*\.js\|replace.*\.css\|version\|cache.bust\|timestamp" scripts/build.js
```

Identify the exact regex and replacement pattern.

### Step 2: Fix the regex to only match file references

The correct approach is to match `.js` or `.css` only when preceded by `src="...` or `href="...` attribute patterns. Several approaches:

**Approach A — Positive lookbehind (if the regex engine supports it)**:
```javascript
// Only match .js that follows a path character (letter, digit, /, -, _)
html = html.replace(/((?:src|href)="[^"]*?)\.js(?=")/g, `$1.min.js?v=${timestamp}`);
html = html.replace(/((?:src|href)="[^"]*?)\.css(?=")/g, `$1.min.css?v=${timestamp}`);
```

**Approach B — Replace only specific known file references**:
```javascript
// Target only local files, not CDN URLs or content text
html = html.replace(/(src|href)="([^"]*?)\.(js|css)"/g, (match, attr, path, ext) => {
    // Skip external URLs (CDN, unpkg, etc.)
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
        return match;
    }
    return `${attr}="${path}.min.${ext}?v=${timestamp}"`;
});
```

**Approach C — Most conservative (recommended)**:
```javascript
// Only add cache-bust to src/href attributes that point to local .js or .css files
const bust = `?v=${Date.now()}`;
html = html.replace(/((?:src|href)="(?!https?:\/\/|\/\/)(?:[^"]*?))\.js(")/g, `$1.min.js${bust}$2`);
html = html.replace(/((?:src|href)="(?!https?:\/\/|\/\/)(?:[^"]*?))\.css(")/g, `$1.min.css${bust}$2`);
```

This only matches `src="..."` and `href="..."` attributes where the path does NOT start with `http://` or `https://` or `//`.

### Step 3: Add exclusion for content text

Regardless of which approach is chosen, add explicit protection for:
- `data-tooltip` attribute values (should never be modified)
- `<meta>` tag content attributes (descriptions, keywords)
- `<script>` tag inline content (inside `<script>...</script>` blocks)
- Any text content inside HTML elements

### Step 4: Test the fix

Run the build script and verify:

```bash
node scripts/build.js
```

Then check for the previously corrupted patterns:

```bash
# EmailJS URL should be intact
grep "cdn.jsdelivr" index.html

# Node.js tooltip should be clean
grep "Node.js" index.html

# Meta description should have no ?v=
grep "meta.*description" index.html | grep -v "?v="
```

### Step 5: Run a full rebuild and diff

```bash
git diff index.html | head -100
```

Verify that only `src` and `href` attributes got cache-busted, and no text content was modified.

## Scope

**In scope**:
- `scripts/build.js` — the cache-busting regex logic

**Out of scope**:
- All HTML files — don't edit them here; Plan 001 fixes the currently corrupted files
- The minification logic in the build script — only fix the cache-busting part
- Template files — they should be fine since the regex runs on the output

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Build runs clean | `node scripts/build.js` | Exit 0, no errors |
| No CDN corruption | `grep "cdn\.js" index.html` | No results |
| No tooltip corruption | `grep "Node\.min\.js" index.html` | No results |
| No meta corruption | `grep "JavaScript?v=" index.html` | No results |
| Cache busts applied | `grep "style\.min\.css?v=" index.html` | Version string present |

## STOP conditions

- If the build script structure has changed significantly, STOP — the regex locations may be different.
- If the build script uses a third-party tool for cache-busting (e.g., a webpack plugin), STOP — the fix approach would be different.
- If you can't identify the cache-busting regex after reading the full build script, STOP and report the file structure.

## Maintenance note

After this fix, Plans 001 and 006 can be safely applied and will not be re-corrupted by subsequent builds. This plan should ideally be applied before or in parallel with Plan 001.
