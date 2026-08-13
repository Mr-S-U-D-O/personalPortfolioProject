# Plan 008: Fix content quality issues — Lorem Ipsum, placeholder text, stale artifacts

> **Executor instructions**: Follow this plan step by step.
>
> **Drift check**: `git diff --stat 73e8d33..HEAD -- data/blog.json README.md index.html unmerged_files.txt`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: content / docs
- **Planned at**: commit `73e8d33`, 2026-08-13

## Why this matters

Several content-level issues undermine the site's professional credibility:

1. The only blog post contains Latin filler text ("Sed ut unde omnis iste natus sit voluptatem...") — a reader clicking "Articles" finds Lorem Ipsum. This signals the site is unfinished.
2. The README contains image generation prompts accidentally left at the bottom.
3. A merge conflict artifact file (`unmerged_files.txt`) is committed to the repo root.
4. Contact form placeholder names ("John", "Doe") are generic.

These are quick fixes that materially improve the site's perceived quality.

## Current state

### Blog post Lorem Ipsum

**File**: `data/blog.json`, line 11

The blog post titled "Multilingual Websites" has a `content` field that mixes real content with Latin filler:

```
Sed ut unde omnis iste natus sit voluptatem accusantium doloremque laudantium, totam aperiam inventore veritatis et architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.
```

And later:
```
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
```

### README with image generation prompts

**File**: `README.md`, lines 86-111

Lines 86-106 are blank lines, and lines 107-111 contain:
```
i need you to create a preview image of this, like i want to use this as a preview image on my personal website...
```

These are AI prompts that were accidentally left in the README.

### Unmerged files artifact

**File**: `unmerged_files.txt` — 4988 bytes at repo root

This file contains a list of merge conflict artifacts and should not be in the committed codebase.

### Generic form placeholders

**File**: `index.html`, lines 783-787

```html
<input type="text" id="firstName" name="firstName" placeholder="e.g. John" required>
...
<input type="text" id="lastName" name="lastName" placeholder="e.g. Doe" required>
```

## Steps

### Step 1: Replace Lorem Ipsum in blog post content

In `data/blog.json`, replace the Latin filler paragraphs in the `content` field with real content related to the blog topic ("Multilingual Websites"). The author should write this content themselves for authenticity, but here are the specific sections to replace:

**Replace this paragraph** (after the `<h2>Building Scalable Layouts in Modern Web</h2>` heading — note: this heading doesn't match the blog topic either):
```
Sed ut unde omnis iste natus sit voluptatem accusantium doloremque laudantium, totam aperiam inventore veritatis et architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.
```

**Replace this paragraph** (in the "Designing for The Global User Ecosystem" section):
```
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
```

**Also fix**: The `<h2>` tag says "Building Scalable Layouts in Modern Web" but the blog topic is "Multilingual Websites". These should match.

**Important**: If the author is not available to write real content, replace the Latin with a clear placeholder that's honest:

```html
<p><em>[This article is currently being written. Check back soon for the full deep-dive on building multilingual web applications.]</em></p>
```

This is more honest than fake Latin and signals intentionality rather than incompleteness.

### Step 2: Clean up README.md

Remove everything after line 83 (the "Thank you for visiting!" line). Delete lines 84-111 which contain blank lines and the image generation prompts.

The README should end with:
```markdown
*Thank you for visiting! Don't forget to click the ⭐ button if you enjoy the codebase aesthetics!*
```

### Step 3: Delete unmerged_files.txt

```bash
git rm unmerged_files.txt
```

### Step 4: Update form placeholder text

In `index.html`, line 783:
```html
<input type="text" id="firstName" name="firstName" placeholder="Your first name" required>
```

Line 787:
```html
<input type="text" id="lastName" name="lastName" placeholder="Your last name" required>
```

These are more neutral and professional than "e.g. John" / "e.g. Doe".

### Step 5: Rebuild the blog post HTML (if using build script)

If the blog post is generated from `data/blog.json`:
```bash
node scripts/build.js
```

**Caution**: Only run this if Plan 007 (build script regex fix) has been applied first. Otherwise the build will re-corrupt URLs.

## Scope

**In scope**:
- `data/blog.json` — replace Lorem Ipsum
- `README.md` — remove image generation prompts
- `unmerged_files.txt` — delete
- `index.html` — update form placeholders

**Out of scope**:
- Writing new blog posts (that's a content creation task, not a fix)
- The generated `posts/multilingual-websites.html` — it will be regenerated by the build script

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| No Latin filler | `grep -i "lorem\|voluptatem\|consectetur\|ullamco" data/blog.json` | No results |
| README clean | `wc -l README.md` | ~83 lines (no trailing junk) |
| Artifact removed | `ls unmerged_files.txt` | File not found |
| Placeholders updated | `grep "e.g. John" index.html` | No results |

## STOP conditions

- If the author wants to keep the Lorem Ipsum as intentional placeholder content, respect that — but suggest adding a visual indicator that it's a draft.
- If `unmerged_files.txt` is referenced by any script or configuration, STOP — verify it's truly unused before deleting.
