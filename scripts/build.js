const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuration
const BASE_URL = 'https://yourportfolio.com'; // Adjust this when deploying
const ROOT_DIR = path.join(__dirname, '../');
const DATA_PATH = path.join(__dirname, '../data/blog.json');
const INDEX_PATH = path.join(__dirname, '../index.html');
const TEMPLATE_PATH = path.join(__dirname, 'blog-template.html');
const SITEMAP_XML_PATH = path.join(__dirname, '../sitemap.xml');
const SITEMAP_HTML_PATH = path.join(__dirname, '../sitemap.html');
const POSTS_DIR = path.join(__dirname, '../posts');
const ARTICLES_PATH = path.join(__dirname, '../articles.html');

console.log('Starting unified build process...');

// Utility to create URL-friendly slug
function createSlug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Track all generated pages for the sitemap
const sitePages = ['index.html'];

// 1. Read Data
let blogData = [];
try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    blogData = JSON.parse(rawData);
    console.log(`Loaded ${blogData.length} blog posts from data/blog.json`);
} catch (err) {
    console.error('Error reading data/blog.json:', err);
    process.exit(1);
}

// 2. Generate Grid Cards HTML for Index
let cardsHTML = '\n';
// Map blogData to include slugs and correct paths
blogData = blogData.map((post) => {
    return {
        ...post,
        slug: createSlug(post.topic)
    };
});

blogData.forEach((post, index) => {
    post.link = `posts/${post.slug}.html`; // Used in index.html, archive, and sitemaps
    post.prevSlug = index > 0 ? blogData[index - 1].slug : null;
    post.nextSlug = index < blogData.length - 1 ? blogData[index + 1].slug : null;
});

// We only want the latest 3 posts for the index page. We assume newest are at the end, so we reverse and take 3.
const latestPosts = [...blogData].reverse().slice(0, 3);

latestPosts.forEach((post, index) => {
    // Format index correctly for latest 3
    const actualPostNumber = blogData.length - index;
    const ghostNumber = actualPostNumber.toString().padStart(2, '0');
    
    cardsHTML += `
            <div class="blog-gallery-item">
                <div class="blog-gallery-image-wrapper">
                    ${post.image ? `<img src="${post.image}" alt="${post.topic}">` : `<div class="blog-gallery-placeholder"></div>`}
                </div>
                <div class="blog-gallery-content">
                    <div class="blog-gallery-ghost-number">${ghostNumber}</div>
                    <div class="blog-gallery-text-content">
                        <h3 class="blog-gallery-topic">${post.topic}</h3>
                        <p class="blog-gallery-date">${post.date}</p>
                        <p class="blog-gallery-desc">${post.description}</p>
                        <a href="${post.link}" class="blog-gallery-link">Learn More <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>`;
});

// Add the See All Posts button to the index gallery
cardsHTML += `\n            <div style="text-align: center; margin-top: 3rem; grid-column: 1 / -1; width: 100%;">
                <a href="articles.html" class="lets-talk-btn" style="display: inline-block; text-decoration: none;">See All Posts</a>
            </div>\n            `;

// 3. Inject into index.html
try {
    let indexData = fs.readFileSync(INDEX_PATH, 'utf8');
    const startTag = '<!-- BLOG_GALLERY_START -->';
    const endTag = '<!-- BLOG_GALLERY_END -->';
    
    const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'g');
    const replacement = `${startTag}${cardsHTML}${endTag}`;
    
    if (regex.test(indexData)) {
        indexData = indexData.replace(regex, replacement);
        fs.writeFileSync(INDEX_PATH, indexData, 'utf8');
        console.log('Successfully injected blog cards into index.html');
    } else {
        console.error('Could not find BLOG_GALLERY_START/END injection markers in index.html!');
    }
} catch (err) {
    console.error('Error processing index.html:', err);
}

// 4. Purge old directory and generate individual blog pages
if (fs.existsSync(POSTS_DIR)) {
    fs.rmSync(POSTS_DIR, { recursive: true, force: true });
    console.log('Purged old posts/ folder.');
}
fs.mkdirSync(POSTS_DIR, { recursive: true });

let templateBlock = '';
try {
    templateBlock = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch (err) {
    console.error('Error reading blog-template.html:', err);
    process.exit(1);
}

// Optional cleanup of old root pages: delete any blog-*.html in root
const rootFiles = fs.readdirSync(ROOT_DIR);
rootFiles.forEach(file => {
    if (file.startsWith('blog-') && file.endsWith('.html')) {
        fs.unlinkSync(path.join(ROOT_DIR, file));
        console.log(`Deleted legacy root file: ${file}`);
    }
});

blogData.forEach(post => {
    let pageHtml = templateBlock;
    pageHtml = pageHtml.replace(/{{TITLE}}/g, post.topic);
    pageHtml = pageHtml.replace(/{{DATE}}/g, post.date);
    
    // Read and parse Markdown content for the blog post
    const mdFilePath = path.join(ROOT_DIR, 'data/posts', `${post.slug}.md`);
    let markedHtml = '';
    try {
        if (fs.existsSync(mdFilePath)) {
            const rawMd = fs.readFileSync(mdFilePath, 'utf8');
            markedHtml = marked.parse(rawMd);
        } else {
            console.warn(`Warning: Markdown file not found for ${post.slug}`);
            markedHtml = `<p>Content coming soon...</p>`;
        }
    } catch (err) {
        console.error(`Error reading markdown for ${post.slug}:`, err);
        markedHtml = `<p>Error loading content.</p>`;
    }
    
    pageHtml = pageHtml.replace(/{{CONTENT}}/g, markedHtml);
    
    // SEO Replacements
    const pageUrl = `${BASE_URL}/posts/${post.slug}.html`;
    const ogImage = post.image ? `${BASE_URL}/${post.image}` : '';
    const author = "Mosa Moleleki";
    
    let publishedDate = new Date().toISOString();
    try {
        if (post.date) publishedDate = new Date(post.date).toISOString();
    } catch(e) {}

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.topic,
        "image": ogImage || `${BASE_URL}/my pictures/dark mode.webp`,
        "author": {
            "@type": "Person",
            "name": author,
            "url": `${BASE_URL}/`
        },
        "publisher": {
            "@type": "Organization",
            "name": "Mosa Moleleki",
            "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/my pictures/dark mode.webp`
            }
        },
        "datePublished": publishedDate,
        "description": post.description || ''
    };
    
    pageHtml = pageHtml.replace(/{{DESCRIPTION}}/g, post.description || '');
    pageHtml = pageHtml.replace(/{{AUTHOR}}/g, author);
    pageHtml = pageHtml.replace(/{{PAGE_URL}}/g, pageUrl);
    pageHtml = pageHtml.replace(/{{OG_IMAGE}}/g, ogImage);
    pageHtml = pageHtml.replace(/{{JSON_LD}}/g, `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`);
    
    // Previous Link
    if (post.prevSlug) {
        pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<a href="${post.prevSlug}.html" class="nav-btn">&larr; Previous</a>`);
    } else {
        pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<span class="nav-btn disabled">&larr; Previous</span>`);
    }
    
    // Next Link
    if (post.nextSlug) {
        pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<a href="${post.nextSlug}.html" class="nav-btn">Next &rarr;</a>`);
    } else {
        pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<span class="nav-btn disabled">Next &rarr;</span>`);
    }

    const outputPath = path.join(POSTS_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, pageHtml, 'utf8');
    console.log(`Generated page: ${post.link}`);
    
    // Track page for sitemaps
    sitePages.push(post.link);
});

// 5. Generate articles.html (Archive Page)
let allCardsHTML = '\n';
[...blogData].reverse().forEach((post, index) => {
    // We use the bento/glow layout structure but customized for blogs
    allCardsHTML += `
            <div class="blog-card glow-card">
                <a href="${post.link}" class="glow-content" style="text-decoration: none; display: flex; flex-direction: column;">
                    <div class="blog-gallery-image-wrapper">
                        ${post.image ? `<img src="${post.image}" alt="${post.topic}">` : `<div class="blog-gallery-placeholder"></div>`}
                    </div>
                    <div class="blog-gallery-content">
                        <div class="blog-gallery-text-content">
                            <h3 class="blog-gallery-topic">${post.topic}</h3>
                            <p class="blog-gallery-date">${post.date}</p>
                            <p class="blog-gallery-desc">${post.description}</p>
                            <span class="blog-gallery-link">Read Article <i class="fa-solid fa-arrow-right"></i></span>
                        </div>
                    </div>
                </a>
            </div>`;
});

const articlesHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Articles | Mosa Moleleki</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/blog.css">
</head>
<body>
    <section class="blog-gallery-section" style="padding-top: 120px;">
        <div class="blog-section-header">
            <h2 class="blog-title">
                <span class="blog-main-text">All Articles</span>
                <span class="blog-ghost-text">Articles</span>
            </h2>
        </div>
        <div style="text-align: center; margin-bottom: 3rem;">
            <a href="index.html#blog" class="blog-gallery-link" style="font-size: 1.2rem;"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
        </div>
        <div class="blog-gallery-grid">
            ${allCardsHTML}
        </div>
    </section>
</body>
</html>`;

try {
    fs.writeFileSync(ARTICLES_PATH, articlesHTML, 'utf8');
    console.log('Successfully generated articles.html');
    sitePages.push('articles.html');
} catch (err) {
    console.error('Error generating articles.html:', err);
}

console.log('Blog generation complete!');

// ==========================================
// 6. Generate Project Pages
// ==========================================
console.log('Starting project pages generation...');
const PROJECTS_DATA_PATH = path.join(__dirname, '../data/projects.json');
const PROJECT_TEMPLATE_PATH = path.join(__dirname, 'project-template.html');
const PROJECTS_OUT_DIR = path.join(__dirname, '../projects');

let projectsData = [];
try {
    const rawProjData = fs.readFileSync(PROJECTS_DATA_PATH, 'utf8');
    projectsData = JSON.parse(rawProjData);
    console.log(`Loaded ${projectsData.length} projects from data/projects.json`);
} catch (err) {
    console.error('Error reading data/projects.json:', err);
}

// Add slug and links
projectsData = projectsData.map(proj => {
    return {
        ...proj,
        slug: createSlug(proj.title)
    };
});

projectsData.forEach((proj, index) => {
    proj.link = `projects/${proj.slug}.html`;
    proj.prevSlug = index > 0 ? projectsData[index - 1].slug : null;
    proj.nextSlug = index < projectsData.length - 1 ? projectsData[index + 1].slug : null;
});

// Write the updated data back to projects.json so the client-side index.js picks up the correct links
try {
    fs.writeFileSync(PROJECTS_DATA_PATH, JSON.stringify(projectsData, null, 4), 'utf8');
    console.log('Updated data/projects.json with generated slugs and links.');
} catch (err) {
    console.error('Error writing to data/projects.json:', err);
}

if (fs.existsSync(PROJECTS_OUT_DIR)) {
    fs.rmSync(PROJECTS_OUT_DIR, { recursive: true, force: true });
    console.log('Purged old projects/ folder.');
}
fs.mkdirSync(PROJECTS_OUT_DIR, { recursive: true });

let projectTemplateBlock = '';
try {
    projectTemplateBlock = fs.readFileSync(PROJECT_TEMPLATE_PATH, 'utf8');
} catch (err) {
    console.error('Error reading project-template.html:', err);
}

if (projectTemplateBlock && projectsData.length > 0) {
    projectsData.forEach(proj => {
        let pageHtml = projectTemplateBlock;
        
        // Load Markdown Content
        let projContentHtml = '';
        try {
            const mdPath = path.join(__dirname, '../data/projects', `${proj.slug}.md`);
            if (fs.existsSync(mdPath)) {
                const mdRaw = fs.readFileSync(mdPath, 'utf8');
                projContentHtml = marked.parse(mdRaw);
            }
        } catch (e) {
            console.error(`Error processing markdown for ${proj.slug}:`, e);
        }

        pageHtml = pageHtml.replace(/{{TITLE}}/g, proj.title || '');
        pageHtml = pageHtml.replace(/{{DESCRIPTION}}/g, proj.description || '');
        pageHtml = pageHtml.replace(/{{CATEGORY}}/g, proj.category || '');
        pageHtml = pageHtml.replace(/{{ROLE}}/g, proj.role || '');
        pageHtml = pageHtml.replace(/{{YEAR}}/g, proj.year || '');
        pageHtml = pageHtml.replace(/{{CONTENT}}/g, projContentHtml);
        
        const pageUrl = `${BASE_URL}/projects/${proj.slug}.html`;
        const ogImage = proj.fullImage.startsWith('http') ? proj.fullImage : `${BASE_URL}/${proj.fullImage}`;
        
        pageHtml = pageHtml.replace(/{{PAGE_URL}}/g, pageUrl);
        pageHtml = pageHtml.replace(/{{OG_IMAGE}}/g, ogImage);
        pageHtml = pageHtml.replace(/{{FULL_IMAGE}}/g, proj.fullImage || '');
        
        // Links
        let liveLinkHtml = proj.liveLink && proj.liveLink !== '#' ? `<a href="${proj.liveLink}" target="_blank" class="project-link-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : '';
        let githubLinkHtml = proj.githubLink && proj.githubLink !== '#' ? `<a href="${proj.githubLink}" target="_blank" class="project-link-btn"><i class="fa-brands fa-github"></i> GitHub Repo</a>` : '';
        pageHtml = pageHtml.replace(/{{LIVE_LINK_HTML}}/g, liveLinkHtml);
        pageHtml = pageHtml.replace(/{{GITHUB_LINK_HTML}}/g, githubLinkHtml);
        
        // Technologies
        let techHtml = (proj.technologies || []).map(tech => `<span class="tech-pill">${tech}</span>`).join('\n                ');
        pageHtml = pageHtml.replace(/{{TECHNOLOGIES_HTML}}/g, techHtml);
        
        // Prev / Next Links
        if (proj.prevSlug) {
            let prevProj = projectsData.find(p => p.slug === proj.prevSlug);
            pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<a href="${proj.prevSlug}.html" class="nav-direction-btn prev-btn"><span class="direction-label">Previous</span><span class="target-title">${prevProj.title}</span></a>`);
        } else {
            pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<div></div>`);
        }
        
        if (proj.nextSlug) {
            let nextProj = projectsData.find(p => p.slug === proj.nextSlug);
            pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<a href="${proj.nextSlug}.html" class="nav-direction-btn next-btn"><span class="direction-label">Next</span><span class="target-title">${nextProj.title}</span></a>`);
        } else {
            pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<div></div>`);
        }
        
        const outputPath = path.join(PROJECTS_OUT_DIR, `${proj.slug}.html`);
        fs.writeFileSync(outputPath, pageHtml, 'utf8');
        console.log(`Generated project page: ${proj.link}`);
        
        sitePages.push(proj.link);
    });
}
console.log('Project generation complete!');

// 7. Generate sitemap.xml
let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
sitePages.forEach(page => {
    const loc = `${BASE_URL}/${page}`;
    xmlContent += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </url>\n`;
});
xmlContent += `</urlset>`;

try {
    fs.writeFileSync(SITEMAP_XML_PATH, xmlContent, 'utf8');
    console.log('Successfully generated sitemap.xml');
} catch (err) {
    console.error('Error generating sitemap.xml:', err);
}

// 6. Generate sitemap.html
// First, build a tree structure from the paths
const fileTree = {};
sitePages.forEach(page => {
    // If it's the root site, page is 'index.html'
    const parts = page.split('/');
    let current = fileTree;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = { _path: null, _children: {} };
        }
        if (i === parts.length - 1) {
            current[part]._path = page; // It's a file
        }
        current = current[part]._children;
    }
});

function renderTreeBranch(node, level = 0) {
    let html = '<ul class="tree-branch" style="--level: ' + level + ';">\n';
    const keys = Object.keys(node).sort((a, b) => {
        // Folders first, then files
        const isFolderA = Object.keys(node[a]._children).length > 0;
        const isFolderB = Object.keys(node[b]._children).length > 0;
        if (isFolderA !== isFolderB) return isFolderA ? -1 : 1;
        return a.localeCompare(b);
    });

    keys.forEach((key, index) => {
        const item = node[key];
        const isLast = index === keys.length - 1;
        const hasChildren = Object.keys(item._children).length > 0;
        
        html += `  <li class="tree-item ${isLast ? 'is-last' : ''}">\n`;
        html += `    <div class="tree-row">\n`;
        html += `      <span class="tree-line"></span>\n`;
        
        if (hasChildren) {
            html += `      <i class="fa-solid fa-folder tree-icon directory"></i>\n`;
            html += `      <span class="tree-label">${key}</span>\n`;
            html += `    </div>\n`;
            html += renderTreeBranch(item._children, level + 1);
        } else {
            const ext = key.split('.').pop();
            let iconClass = 'fa-file-code';
            if (ext === 'html') iconClass = 'fa-file-code html-file';
            else if (ext === 'xml') iconClass = 'fa-file-code xml-file';
            
            html += `      <i class="fa-solid ${iconClass} tree-icon file"></i>\n`;
            html += `      <a href="/${item._path}" class="tree-label">${key}</a>\n`;
            html += `    </div>\n`;
        }
        html += `  </li>\n`;
    });
    html += '</ul>\n';
    return html;
}

let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap | File Tree</title>
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Global Styles -->
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/blog.css">
    
    <style>
        /* Sitemap Specific Overrides */
        body {
            /* Handled by style.css but ensure un-hide on load */
            overflow: auto;
            padding-bottom: 80px;
        }
        
        .sitemap-wrapper {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Tree Layout */
        .file-tree-container {
            font-family: 'Fira Code', monospace;
            font-size: 0.95rem;
            background: var(--skeleton-base);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 30px;
            overflow-x: auto;
            margin-top: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .tree-branch {
            list-style: none;
            padding: 0;
            margin: 0;
            position: relative;
        }
        
        .tree-branch[style*="--level: 0"] > .tree-item > .tree-row > .tree-line {
            display: none; /* No lines for root level */
        }
        
        .tree-branch:not([style*="--level: 0"]) {
            padding-left: 24px;
            margin-left: -4px;
            border-left: 1px dotted var(--glass-border);
        }
        
        .tree-item {
            position: relative;
        }
        
        .tree-row {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            border-radius: 6px;
            margin: 2px 0;
            transition: background 0.2s, transform 0.2s;
            position: relative;
        }
        
        .tree-row:hover {
            background-color: var(--glass-bg);
            transform: translateX(2px);
        }
        
        /* The horizontal branch line */
        .tree-line {
            position: absolute;
            left: -24px;
            top: 50%;
            width: 20px;
            border-top: 1px dotted var(--glass-border);
            z-index: 0;
        }
        
        /* Hide bottom tail of vertical line for last items */
        .tree-item.is-last > .tree-row::before {
            content: '';
            position: absolute;
            left: -25px;
            top: 50%;
            bottom: -200px; /* Cover any continuing border */
            width: 4px;
            background: var(--skeleton-base); /* Match container background */
            z-index: -1;
            transition: background 0.4s ease;
        }
        
        .tree-icon {
            margin-right: 12px;
            font-size: 1.1em;
            width: 16px;
            text-align: center;
            z-index: 1;
        }
        
        .directory { color: #d2a8ff; } /* Keeping vibrant colors for file icons */
        .html-file { color: #e34c26; }
        .xml-file { color: #2ea043; }
        
        .tree-label {
            color: var(--text-light);
            text-decoration: none;
            cursor: pointer;
            z-index: 1;
            transition: color 0.2s;
        }
        
        a.tree-label:hover {
            color: var(--accent-primary);
        }
        
        .project-root {
            display: flex;
            align-items: center;
            padding: 10px;
            font-weight: 600;
            color: var(--text-light);
            border-bottom: 1px solid var(--glass-border);
            margin-bottom: 15px;
            gap: 12px;
            font-size: 1.05rem;
        }
        .project-root i {
            color: var(--accent-primary);
        }
        
        .build-subtitle {
            color: var(--text-muted);
            font-family: 'Fira Code', monospace;
            font-size: 0.9rem;
            text-align: center;
            margin-bottom: 40px;
        }
    </style>
</head>
<body>
    <!-- Utility Toggles -->
    <div class="utility-toggles">
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">
            <i class="fa-solid fa-moon"></i>
        </button>
    </div>

    <section class="blog-gallery-section" style="padding-top: 100px;">
        <div class="sitemap-wrapper">
            <div class="blog-section-header">
                <h2 class="blog-title">
                    <span class="blog-main-text" style="font-size: clamp(2rem, 5vw, 3.5rem);"><i class="fa-solid fa-sitemap" style="color: var(--accent-primary); margin-right: 15px;"></i>Project Architecture</span>
                    <span class="blog-ghost-text">Sitemap</span>
                </h2>
            </div>
            
            <div class="build-subtitle">Generated dynamically via build.js &bull; Directory Map</div>
            
            <div class="file-tree-container">
                <div class="project-root">
                    <i class="fa-solid fa-globe"></i> yourportfolio.com
                </div>
                ${renderTreeBranch(fileTree, 0)}
            </div>
            
            <div style="text-align: center; margin-top: 60px;">
                <a href="/index.html" class="lets-talk-btn"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
            </div>
        </div>
    </section>

    <!-- Theme Toggle Logic -->
    <script>
        const themeToggleBtn = document.getElementById('themeToggle');
        
        // Initial check
        if (localStorage.getItem('portfolio-theme') === 'light') {
            document.body.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
        
        themeToggleBtn.addEventListener('click', () => {
            if (document.body.getAttribute('data-theme') === 'light') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('portfolio-theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('portfolio-theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    </script>
</body>
</html>`;

try {
    fs.writeFileSync(SITEMAP_HTML_PATH, htmlContent, 'utf8');
    console.log('Successfully generated sitemap.html');
} catch (err) {
    console.error('Error generating sitemap.html:', err);
}

console.log('Unified build process completed entirely.');
