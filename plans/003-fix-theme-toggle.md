# Plan 003: Fix theme toggle and mute toggle icon swaps

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check (run first)**: `git diff --stat 73e8d33..HEAD -- js/theme.js js/index.js`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 002 (icon system must be Lucide-standardized first)
- **Category**: bug
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

The theme toggle (light/dark mode) and mute toggle (audio on/off) both break visually after the first click. The JavaScript swaps icons by setting `element.className` to Font Awesome class names, but after Plan 002, all icons use Lucide's `data-lucide` attribute system. After toggling, the icon element loses its SVG content and shows nothing.

This is a highly visible bug — the theme toggle is one of the most-used interactive elements on the site.

## Current state

### Theme toggle — `js/theme.js`, lines 92-98

```javascript
document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const icon = btn.querySelector("i");
    if (icon) {
        icon.className =
            themeName === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
});
```

The HTML button (index.html line 106-108):
```html
<button class="theme-toggle" data-theme-toggle aria-label="Toggle Dark Mode">
    <i data-lucide="moon"></i>
</button>
```

When Lucide initializes, it replaces `<i data-lucide="moon"></i>` with an `<svg>` element. The JS then tries to set `className` on a `<svg>` element to Font Awesome classes, which clears the SVG and shows nothing.

### Mute toggle — `js/index.js`, lines 88-92

```javascript
const e = E.querySelector("i");
e &&
    (e.className = L
        ? "fa-solid fa-volume-xmark"
        : "fa-solid fa-volume-high");
```

The HTML button (index.html line 103-105):
```html
<button id="muteToggle" class="mute-toggle" aria-label="Toggle Audio">
    <i data-lucide="volume-high"></i>
</button>
```

Same problem — after Lucide processes the element, it becomes an SVG, and the JS tries to swap it with Font Awesome classes.

## Steps

### Step 1: Fix theme toggle icon swap in `js/theme.js`

The Lucide approach requires replacing the SVG element entirely. Lucide provides a `lucide.createIcons()` API and individual icon imports, but the simplest reliable approach is:

Replace lines 92-98 in `js/theme.js`:

```javascript
document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const icon = btn.querySelector("i");
    if (icon) {
        icon.className =
            themeName === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
});
```

With:

```javascript
document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    // Lucide replaces <i> with <svg>, so target both
    const icon = btn.querySelector("i, svg");
    if (icon) {
        const newIconName = themeName === "light" ? "sun" : "moon";
        // Replace the element with a fresh Lucide <i> and re-initialize
        const newIcon = document.createElement("i");
        newIcon.setAttribute("data-lucide", newIconName);
        icon.replaceWith(newIcon);
    }
    // Re-render Lucide icons within this button
    if (window.lucide) {
        window.lucide.createIcons({ nodes: [btn] });
    }
});
```

**Why this approach**: Lucide's `createIcons()` replaces `<i data-lucide="...">` elements with rendered SVGs. By inserting a new `<i>` element and calling `createIcons()` scoped to just the button, we get a clean icon swap without re-processing the entire page.

### Step 2: Fix mute toggle icon swap in `js/index.js`

This is more complex because `index.js` is obfuscated. The relevant section is around lines 88-92.

Find the code that sets `e.className = L ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high"` and replace it with the same Lucide-compatible approach:

```javascript
const icon = E.querySelector("i, svg");
if (icon) {
    const newIconName = L ? "volume-x" : "volume-2";
    const newIcon = document.createElement("i");
    newIcon.setAttribute("data-lucide", newIconName);
    icon.replaceWith(newIcon);
    if (window.lucide) {
        window.lucide.createIcons({ nodes: [E] });
    }
}
```

**Lucide icon names**:
- Volume on: `volume-2` (Lucide name for full volume)
- Volume muted: `volume-x` (Lucide name for muted)

**Important**: Since `index.js` is obfuscated, you'll need to find the exact location by searching for `volume-xmark` or `volume-high` strings.

### Step 3: After editing theme.js, rebuild the minified version

Run:
```bash
node -e "const {minify}=require('terser'); const fs=require('fs'); minify(fs.readFileSync('js/theme.js','utf8')).then(r=>fs.writeFileSync('js/min/theme.min.js',r.code))"
```

Or use the project's build script if it handles this.

### Step 4: After editing index.js, rebuild the minified version

Same approach:
```bash
node -e "const {minify}=require('terser'); const fs=require('fs'); minify(fs.readFileSync('js/index.js','utf8'),{module:true}).then(r=>fs.writeFileSync('js/min/index.min.js',r.code))"
```

## Scope

**In scope**:
- `js/theme.js`
- `js/index.js`
- `js/min/theme.min.js` (rebuild after editing source)
- `js/min/index.min.js` (rebuild after editing source)

**Out of scope**:
- HTML files — the icon elements are correct after Plan 002
- CSS files — no styling changes needed

## Verification

| Check | Command / Action | Expected |
|-------|-----------------|----------|
| Theme toggle renders | Open site, check toggle icon visibility | Moon icon visible in dark mode |
| Theme toggle swaps | Click toggle | Icon changes from moon → sun (or vice versa) |
| Toggle persists across clicks | Click toggle 5 times rapidly | Icon alternates correctly each time |
| Mute toggle renders | Check mute button | Volume icon visible |
| Mute toggle swaps | Click mute button | Icon changes from volume → volume-x |
| No console errors | Open DevTools Console | No errors related to Lucide or icon swapping |

## STOP conditions

- If `js/index.js` has been un-obfuscated or significantly restructured since `73e8d33`, STOP and report — the line numbers and variable names will be different.
- If Lucide's API has changed (no `createIcons` method), STOP — check the Lucide docs for the correct API.

## Maintenance note

The obfuscated `index.js` is a significant maintenance burden. This plan makes targeted fixes, but a longer-term solution is to un-obfuscate the source file (or maintain readable source alongside the minified output). This is tracked as a general finding in the master audit.
